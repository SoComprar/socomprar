import { detectMarketplace } from "./detectors/detectMarketplace";
import { AmazonImporter } from "./importers/AmazonImporter";
import { MercadoLivreImporter } from "./importers/MercadoLivreImporter";
import { MagaluImporter } from "./importers/MagaluImporter";
import { KabumImporter } from "./importers/KabumImporter";
import { ShopeeImporter } from "./importers/ShopeeImporter";
import { GenericImporter } from "./importers/GenericImporter";
import { parseJsonLd } from "./parsers/JsonLdParser";
import { parseOpenGraph } from "./parsers/OpenGraphParser";
import { parseHtml } from "./parsers/HtmlParser";
import { normalizePrice } from "./normalizers/normalizePrice";
import { normalizeTitle } from "./normalizers/normalizeTitle";
import { normalizeDescription } from "./normalizers/normalizeDescription";
import { normalizeImage } from "./normalizers/normalizeImage";
import { normalizeSlug } from "./normalizers/normalizeSlug";
import type { Enricher, ImportedOfferData, Importer, RawParsedData } from "./types";

// Ordem de tentativa: importadores específicos primeiro, GenericImporter por
// último (seu supports() sempre retorna true).
const SPECIFIC_IMPORTERS: Importer[] = [
  new AmazonImporter(),
  new MercadoLivreImporter(),
  new MagaluImporter(),
  new KabumImporter(),
  new ShopeeImporter(),
];
const GENERIC_IMPORTER = new GenericImporter();

// Confiança (0-100) por método de extração. category fica sempre 0: nenhuma
// camada hoje tenta inferir categoria - o campo já existe pronto para quando
// isso for implementado.
const CONFIDENCE_BY_METHOD: Record<RawParsedData["method"], { data: number; description: number }> =
  {
    jsonld: { data: 100, description: 90 },
    opengraph: { data: 80, description: 70 },
    html: { data: 50, description: 50 },
  };

// Ponto de extensão: no futuro, uma etapa de IA pode ser injetada aqui, entre
// os Normalizers e o retorno final (melhorar título/descrição, gerar SEO,
// tags, meta description, Open Graph, palavras-chave). Hoje é um passthrough.
const passthroughEnricher: Enricher = async (data) => data;

export type ImportServiceOptions = {
  enrich?: Enricher;
};

export class ImportService {
  private readonly enrich: Enricher;

  constructor(options: ImportServiceOptions = {}) {
    this.enrich = options.enrich ?? passthroughEnricher;
  }

  async importOffer(rawUrl: string): Promise<ImportedOfferData> {
    const url = new URL(rawUrl);
    const marketplace = detectMarketplace(url);

    const importer =
      SPECIFIC_IMPORTERS.find((candidate) => candidate.supports(url)) ?? GENERIC_IMPORTER;
    const html = await importer.fetch(url);

    const parsed: RawParsedData = parseJsonLd(html) ??
      parseOpenGraph(html) ??
      parseHtml(html) ?? { method: "html" };
    const confidenceLevel = CONFIDENCE_BY_METHOD[parsed.method];

    const normalized: ImportedOfferData = {
      title: normalizeTitle(parsed.title),
      description: normalizeDescription(parsed.description),
      imageUrl: normalizeImage(parsed.imageUrl, url),
      currentPrice: normalizePrice(parsed.price),
      oldPrice: normalizePrice(parsed.oldPrice),
      marketplace,
      slug: normalizeSlug(parsed.title),
      confidence: {
        title: parsed.title ? confidenceLevel.data : 0,
        description: parsed.description ? confidenceLevel.description : 0,
        imageUrl: parsed.imageUrl ? confidenceLevel.data : 0,
        currentPrice: parsed.price !== undefined ? confidenceLevel.data : 0,
        oldPrice: parsed.oldPrice !== undefined ? confidenceLevel.data : 0,
        marketplace: marketplace ? 100 : 0,
        category: 0,
      },
      meta: {
        sourceUrl: url.toString(),
        sourceMarketplace: marketplace,
        importMethod: parsed.method,
        importedAt: new Date().toISOString(),
        lastChecked: null,
      },
    };

    return this.enrich(normalized);
  }
}
