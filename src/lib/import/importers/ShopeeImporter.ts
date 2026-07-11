import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml } from "../utils/fetchHtml";

// Responsabilidade única: buscar o HTML bruto de uma página da Shopee.
// Nunca interpreta o conteúdo - isso é responsabilidade dos Parsers.
//
// Limitação conhecida: a Shopee carrega título/preço via JavaScript no
// navegador do cliente - eles normalmente NÃO vêm prontos no HTML buscado
// pelo servidor. Este importer busca o HTML mesmo assim (o que existir via
// Open Graph tende a funcionar), mas o preço dificilmente será encontrado de
// forma confiável. Documentado propositalmente aqui, não é um bug.
export class ShopeeImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Shopee");
  }

  fetch(url: URL): Promise<FetchResult> {
    return fetchHtml(url);
  }
}
