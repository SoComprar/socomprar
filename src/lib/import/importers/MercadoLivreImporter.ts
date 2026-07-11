import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchJson } from "../utils/fetchJson";

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
// Livre através da API pública oficial deles (api.mercadolibre.com) - não
// busca nem interpreta o HTML da página do produto. A página HTML do
// Mercado Livre proíbe acesso automatizado (robots.txt) e não é confiável
// para scraping; a API é o caminho documentado e suportado por eles para
// esse tipo de consulta.
//
// Nunca interpreta o conteúdo devolvido - isso é responsabilidade do
// MercadoLivreApiParser.
export class MercadoLivreImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Mercado Livre");
  }

  async fetch(url: URL): Promise<FetchResult> {
    const itemId = extractItemId(url);
    if (!itemId) {
      throw new Error("Não foi possível identificar o ID do produto na URL do Mercado Livre.");
    }

    const [item, description] = await Promise.all([
      fetchJson(`https://api.mercadolibre.com/items/${itemId}`),
      fetchJson(`https://api.mercadolibre.com/items/${itemId}/description`).catch(() => null),
    ]);

    return {
      content: JSON.stringify({ item, description }),
      format: "api-json",
    };
  }
}
