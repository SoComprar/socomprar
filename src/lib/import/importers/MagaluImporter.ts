import type { Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml } from "../utils/fetchHtml";

// Responsabilidade única: buscar o HTML bruto de uma página do Magalu.
// Nunca interpreta o conteúdo - isso é responsabilidade dos Parsers.
export class MagaluImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Magalu");
  }

  fetch(url: URL): Promise<string> {
    return fetchHtml(url);
  }
}
