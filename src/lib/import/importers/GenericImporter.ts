import type { FetchResult, Importer } from "../types";
import { fetchHtml } from "../utils/fetchHtml";

// Fallback: busca o HTML bruto de qualquer URL, quando nenhum importador
// específico reconhece o marketplace. supports() sempre retorna true - por
// isso este importador deve ser tentado por último no ImportService.
export class GenericImporter implements Importer {
  supports(_url: URL): boolean {
    return true;
  }

  fetch(url: URL): Promise<FetchResult> {
    return fetchHtml(url);
  }
}
