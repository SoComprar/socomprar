import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml, SOCIAL_PREVIEW_USER_AGENT } from "../utils/fetchHtml";

function parsePrice(value: number | string | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  
  if (!Number.isFinite(parsed)) return null;

  // Ajuste de escala da Shopee (transforma 10990000 em 109.90 se necessário)
  if (parsed > 10000) {
    return parsed / 100000;
  }
  return parsed;
}

function extractShopeePrices(html: string): { price: number | null; oldPrice: number | null } {
  let price: number | null = null;
  let oldPrice: number | null = null;

  // 1. CAPTURA DE PREÇO ATUAL VIA META TAGS DE PRODUTO (Altamente estáveis)
  const pricePatterns = [
    /<meta[^>]+(?:property|name)=["']product:price:amount["'][^>]*content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']product:price:amount["']/i,
    /twitter:data1["'][^>]*content=["']([^"']*)["']/i, // Padrão alternativo do Twitter Card
    /"price"\s*:\s*(\d+)/
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      price = parsePrice(match[1]);
      if (price !== null) break;
    }
  }

  // 2. CAPTURA DE PREÇO ANTIGO (Busca direta sem depender de estrutura complexa)
  const oldPricePatterns = [
    /"price_before_discount"\s*:\s*(\d+)/,
    /priceBeforeDiscount["']\s*:\s*(\d+)/
  ];

  for (const pattern of oldPricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      oldPrice = parsePrice(match[1]);
      if (oldPrice !== null) break;
    }
  }

  return { price, oldPrice };
}

function injectPricesIntoJsonLd(html: string, price: number | null, oldPrice: number | null): string {
  if (!price && !oldPrice) return html;

  // Constrói um objeto Schema padrão para interceptação do seu JsonLdParser
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "offers": {
      "@type": "Offer",
      ...(price ? { "price": price, "priceCurrency": "BRL" } : {}),
      ...(oldPrice ? { "highPrice": oldPrice } : {})
    }
  };

  const jsonLdBlock = `<script type="application/ld+json">${JSON.stringify(product)}</script>`;
  const headMatch = html.match(/<head[^>]*>/i);

  if (headMatch) {
    return html.replace(headMatch[0], `${headMatch[0]}\n${jsonLdBlock}`);
  }

  return `${jsonLdBlock}\n${html}`;
}

export class ShopeeImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Shopee");
  }

  async fetch(url: URL): Promise<FetchResult> {
    // Usamos um cabeçalho limpo simulando navegador de rede social para evitar o anti-scraping agressivo da Shopee
    const htmlResult = await fetchHtml(url, { userAgent: SOCIAL_PREVIEW_USER_AGENT });

    if (htmlResult.format === "html") {
      const { price, oldPrice } = extractShopeePrices(htmlResult.content);
      
      return {
        content: injectPricesIntoJsonLd(htmlResult.content, price, oldPrice),
        format: "html",
      };
    }

    return htmlResult;
  }
}
