import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml } from "../utils/fetchHtml";

// Responsabilidade única: buscar o HTML bruto de uma página da Amazon.
// Nunca interpreta o conteúdo - isso é responsabilidade dos Parsers.
export class AmazonImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Amazon");
  }

  fetch(url: URL): Promise<FetchResult> {
    return fetchHtml(url);
  }
}
