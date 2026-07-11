import type { FetchResult, Importer } from "../types";
import { hostnameMatches } from "../utils/marketplace";
import { fetchHtml } from "../utils/fetchHtml";

// Responsabilidade única: buscar o HTML bruto de uma página da Kabum.
// Nunca interpreta o conteúdo - isso é responsabilidade dos Parsers.
//
// Observação: "Kabum" ainda não existe no enum de Marketplace do formulário
// admin (fora do escopo desta etapa, por decisão explícita). Este importer
// funciona normalmente e devolve os dados normalizados; só o preenchimento
// automático do campo "Marketplace" no formulário não vai reconhecer o valor
// até o enum do admin ser atualizado em uma etapa futura.
export class KabumImporter implements Importer {
  supports(url: URL): boolean {
    return hostnameMatches(url, "Kabum");
  }

  fetch(url: URL): Promise<FetchResult> {
    return fetchHtml(url);
  }
}
