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

  // O aria-label do Mercado Livre varia de formato dependendo do preço:
  // - "Antes: 1.999 reais" (valor redondo, sem centavos)
  // - "1999 reais e 90 centavos" (com centavos, por extenso)
  // - "R$ 1.999,00" (já formatado)
  // Guardamos essas duas pistas ANTES de limpar o texto, porque elas são o
  // único jeito de saber se um valor sem pontuação tem centavos ou não.
  const hasReaisWord = /reais/i.test(value);
  const hasCentavosWord = /centavos/i.test(value);

  // 1. Limpeza inicial de textos informativos do Mercado Livre
  let sanitized = value
    .replace(/antes:/gi, "")
    .replace(/anterior:/gi, "")
    .replace(/reais/gi, "")
    .replace(/centavos/gi, "")
    .replace(/[^0-9,.-]/g, "") // Mantém apenas números e pontuações
    .trim();

  if (!sanitized) return null;

  if (sanitized.includes(",") && sanitized.includes(".")) {
    // Ex: "1.999,00" - ponto é separador de milhar, vírgula é decimal
    sanitized = sanitized.replace(/\./g, "").replace(",", ".");
  } else if (sanitized.includes(",")) {
    // Ex: "1999,00" - vírgula é decimal
    sanitized = sanitized.replace(",", ".");
  } else if (sanitized.includes(".")) {
    // Ex: "1.999" - o ponto pode ser separador de milhar ("1.999" = 1999)
    // ou decimal ("19.90" = 19,90). Mesma lógica do normalizePrice.ts: só
    // remove o ponto quando ele é claramente separador de milhar (seguido
    // de exatamente 3 dígitos e nada de decimal depois).
    sanitized = sanitized.replace(/\.(?=\d{3}(?:\D|$))/g, "");
  } else if (hasCentavosWord && sanitized.length > 2) {
    // Ex: "1999 reais e 90 centavos" -> sanitizado vira "199990" - os 2
    // últimos dígitos são os centavos mencionados explicitamente no texto.
    const integerPart = sanitized.slice(0, -2);
    const decimalPart = sanitized.slice(-2);
    sanitized = `${integerPart}.${decimalPart}`;
  } else if (!hasReaisWord && !hasCentavosWord && sanitized.length > 2) {
    // CASO DO PRINT: dígitos totalmente colados, sem nenhuma palavra (nem
    // "reais" nem "centavos") - ex: "29990". Como não há nenhuma pista de
    // que seja um valor inteiro, assume-se o padrão de 2 casas decimais.
    const integerPart = sanitized.slice(0, -2);
    const decimalPart = sanitized.slice(-2);
    sanitized = `${integerPart}.${decimalPart}`;
  }
  // Se chegou aqui sem cair em nenhum caso acima, é porque o texto dizia só
  // "reais" (sem "centavos" e sem pontuação) - ex: "Antes: 1999 reais" - ou
  // seja, um valor inteiro mesmo, sem centavos escondidos. Não mexe.

  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractOldPriceFromHtml(html: string): number | null {
  // ESTRATÉGIA ULTRA-RESILIENTE: Captura qualquer tag <s> ou <del> que possua aria-label.
  // Evita a quebra caso o Mercado Livre troque ou remova as classes CSS de preço.
  const patterns = [
    /<(?:s|del)\b[^>]*aria-label=["']([^"']+)["']/i,
    /class=["'][^"']*ui-pdp-price__original-value[^"']*["'][^>]*aria-label=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const price = parsePriceText(match[1]);
      if (price !== null) return price;
    }
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

      // Intercepta e injeta de forma limpa no JSON-LD original preservando o preço atual e estoque nativos
      if (jsonObj["@type"] === "Product" || jsonObj["@graph"]) {
        const targetProduct = jsonObj["@graph"]
          ? jsonObj["@graph"].find((item: Record<string, unknown>) => item["@type"] === "Product")
          : jsonObj;

        if (targetProduct) {
          if (!targetProduct.offers) {
            targetProduct.offers = { "@type": "Offer" };
          }
          // Injeta o preço antigo preservando as outras propriedades da oferta
          targetProduct.offers.highPrice = oldPrice;

          const newScriptBlock = `<script type="application/ld+json">${JSON.stringify(jsonObj)}</script>`;
          updatedHtml = updatedHtml.replace(match[0], newScriptBlock);
          modified = true;
          break;
        }
      }
    } catch {
      // Ignora blocos com JSON quebrado
    }
  }

  // Fallback seguro se não houver um bloco estruturado nativo
  if (!modified) {
    const fallbackProduct = {
      "@context": "https://schema.org",
      "@type": "Product",
      offers: {
        "@type": "Offer",
        highPrice: oldPrice,
      },
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
