import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchJson } from "../utils/fetchJson";
import { fetchHtml, SOCIAL_PREVIEW_USER_AGENT } from "../utils/fetchHtml";

// Extrai o ID do item (ex: MLB51973565) de qualquer formato de URL do
// Mercado Livre - página de catálogo (/p/MLB...), anúncio individual
// (/nome-do-produto/MLB-1234567890-...) ou variações com hífen no meio do
// código.
function extractItemId(url: URL): string | null {
  const match = url.toString().match(/\b([A-Z]{3})-?(\d{6,})\b/i);
  if (!match) return null;
  return `${match[1].toUpperCase()}${match[2]}`;
}

function parsePriceText(value: string | null | undefined): number | null {
  if (!value) return null;

  // Substitui palavras textuais comuns no aria-label do Mercado Livre para evitar quebras no parseFloat
  const sanitized = value
    .replace(/antes:/gi, "")
    .replace(/reais/gi, "")
    .replace(/centavos/gi, ".");

  const compact = sanitized
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[^0-9,.-]/g, " ")
    .trim()
    .replace(/\s+/g, "");

  if (!compact) return null;

  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  const hasBothSeparators = lastComma > -1 && lastDot > -1;

  let normalized: string;
  if (hasBothSeparators) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = compact.replaceAll(thousandSeparator, "").replace(decimalSeparator, ".");
  } else if (lastComma > -1) {
    const parts = compact.split(",");
    if (parts.length > 2) {
      normalized = compact.replace(/,/g, ".");
    } else if (parts[1]?.length === 3) {
      normalized = compact.replace(/,/g, "");
    } else {
      normalized = compact.replace(",", ".");
    }
  } else if (lastDot > -1) {
    const parts = compact.split(".");
    if (parts.length > 2) {
      normalized = compact.replace(/\./g, "");
    } else if (parts[1]?.length === 3) {
      normalized = compact.replace(/\./g, "");
    } else {
      normalized = compact;
    }
  } else {
    normalized = compact;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractOldPriceFromHtml(html: string): number | null {
  // 1. Tenta extrair diretamente do atributo 'aria-label' da classe ui-pdp-price__original-value (Estrutura exata enviada)
  const ariaLabelMatch = html.match(
    /class=["'][^"']*ui-pdp-price__original-value[^"']*["'][^>]*aria-label=["']([^"']+)["']/i
  );
  if (ariaLabelMatch?.[1]) {
    const price = parsePriceText(ariaLabelMatch[1]);
    if (price !== null) return price;
  }

  // 2. Fallback caso o valor esteja apenas na tag interna de fração
  const fractionMatch = html.match(
    /class=["'][^"']*ui-pdp-price__original-value[^"']*["'][^>]*>[\s\S]*?class=["'][^"']*andes-money-amount__fraction[^"']*["'][^>]*>([^<]+)</i
  );
  if (fractionMatch?.[1]) {
    const price = parsePriceText(fractionMatch[1]);
    if (price !== null) return price;
  }

  return null;
}

function injectOldPriceIntoJsonLd(html: string, oldPrice: number): string {
  // Procura por blocos de JSON-LD existentes no HTML enviado pelo Mercado Livre
  const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let modified = false;
  let updatedHtml = html;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const rawJson = match[1].trim();
      const jsonObj = JSON.parse(rawJson);

      // Injeta de forma limpa no JSON-LD nativo preservando o preço ATUAL
      if (jsonObj["@type"] === "Product" || jsonObj["@graph"]) {
        const targetProduct = jsonObj["@graph"] 
          ? jsonObj["@graph"].find((item: any) => item["@type"] === "Product")
          : jsonObj;

        if (targetProduct) {
          if (!targetProduct.offers) {
            targetProduct.offers = { "@type": "Offer" };
          }
          // injeta o preço antigo sem remover os dados do preço atual
          targetProduct.offers.highPrice = oldPrice;
          
          const newScriptBlock = `<script type="application/ld+json">${JSON.stringify(jsonObj)}</script>`;
          updatedHtml = updatedHtml.replace(match[0], newScriptBlock);
          modified = true;
          break;
        }
      }
    } catch {
      // Ignora blocos JSON corrompidos ou mal formatados
    }
  }

  // Se o Mercado Livre não enviou um JSON-LD válido, cria uma tag isolada no head de fallback de forma segura
  if (!modified) {
    const fallbackProduct = {
      "@context": "https://schema.org",
      "@type": "Product",
      "offers": {
        "@type": "Offer",
        "highPrice": oldPrice
      }
    };
    const jsonLdBlock = `<script type="application/ld+json">${JSON.stringify(fallbackProduct)}</script>`;
    const headMatch = html.match(/<head[^>]*>/i);
    if (headMatch) {
      return html.replace(headMatch[0], `${headMatch[0]}\n${jsonLdBlock}`);
    }
    return `${jsonLdBlock}\n${html}`;
  }

  return updatedHtml;
}

export class MercadoLivreImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Mercado Livre");
  }

  async fetch(url: URL): Promise<FetchResult> {
    const itemId = extractItemId(url);

    if (itemId) {
      try {
        const [item, description] = await Promise.all([
          fetchJson(`https://mercadolibre.com{itemId}`),
          fetchJson(`https://mercadolibre.com{itemId}/description`).catch(() => null),
        ]);

        return {
          content: JSON.stringify({ item, description }),
          format: "api-json",
        };
      } catch {
        // API oficial indisponível/bloqueada - segue para o fallback de HTML
      }
    }

    const htmlResult = await fetchHtml(url, { userAgent: SOCIAL_PREVIEW_USER_AGENT });
    if (htmlResult.format === "html") {
      const oldPrice = extractOldPriceFromHtml(htmlResult.content);
      if (oldPrice !== null) {
        return {
          content: injectOldPriceIntoJsonLd(htmlResult.content, oldPrice),
          format: "html",
        };
      }
    }

    return htmlResult;
  }
}
