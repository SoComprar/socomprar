import type { Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml } from "../utils/fetchHtml";

// Responsabilidade única: buscar o HTML bruto de uma página do Mercado Livre.
// Nunca interpreta o conteúdo - isso é responsabilidade dos Parsers.
export class MercadoLivreImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Mercado Livre");
  }

  fetch(url: URL): Promise<string> {
    return fetchHtml(url);
  }
}
