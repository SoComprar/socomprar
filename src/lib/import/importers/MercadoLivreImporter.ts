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

// Responsabilidade única: buscar os dados brutos de um produto do Mercado
// Livre. Nunca interpreta o conteúdo devolvido - isso é responsabilidade dos
// Parsers (MercadoLivreApiParser para a API, JsonLd/OpenGraph/Html para o
// fallback).
//
// Estratégia em duas etapas:
// 1) Tenta a API pública oficial deles (api.mercadolibre.com). É o caminho
//    documentado e mais confiável, quando funciona.
// 2) Se a API falhar (ex: exige autenticação que ainda não implementamos),
//    cai para buscar a própria página do produto, mas se identificando como
//    o robô de preview do WhatsApp (SOCIAL_PREVIEW_USER_AGENT) - o Mercado
//    Livre libera esse tipo de acesso de propósito, mesmo bloqueando
//    scrapers genéricos, porque é assim que o preview do link funciona
//    quando alguém compartilha o produto no WhatsApp/Facebook/Telegram.
export class MercadoLivreImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Mercado Livre");
  }

  async fetch(url: URL): Promise<FetchResult> {
    const itemId = extractItemId(url);

    if (itemId) {
      try {
        const [item, description] = await Promise.all([
          fetchJson(`https://api.mercadolibre.com/items/${itemId}`),
          fetchJson(`https://api.mercadolibre.com/items/${itemId}/description`).catch(() => null),
        ]);

        return {
          content: JSON.stringify({ item, description }),
          format: "api-json",
        };
      } catch {
        // API oficial indisponível/bloqueada para esta chamada - segue para
        // o fallback de HTML abaixo, em vez de falhar de vez.
      }
    }

    return fetchHtml(url, { userAgent: SOCIAL_PREVIEW_USER_AGENT });
  }
}
