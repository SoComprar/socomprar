import { detectMarketplace } from "./detectors/detectMarketplace";
import { detectBlockPage } from "./detectors/detectBlockPage";
import { AmazonImporter } from "./importers/AmazonImporter";
import { MercadoLivreImporter } from "./importers/MercadoLivreImporter";
import { MagaluImporter } from "./importers/MagaluImporter";
import { KabumImporter } from "./importers/KabumImporter";
import { ShopeeImporter } from "./importers/ShopeeImporter";
import { GenericImporter } from "./importers/GenericImporter";
import { parseJsonLd } from "./parsers/JsonLdParser";
import { parseOpenGraph } from "./parsers/OpenGraphParser";
import { parseHtml } from "./parsers/HtmlParser";
import { parseMercadoLivreApi } from "./parsers/MercadoLivreApiParser";
import { normalizePrice } from "./normalizers/normalizePrice";
import { normalizeTitle } from "./normalizers/normalizeTitle";
import { normalizeDescription } from "./normalizers/normalizeDescription";
import { normalizeImage } from "./normalizers/normalizeImage";
import { normalizeSlug } from "./normalizers/normalizeSlug";
import type {
  ConfidenceScore,
  Enricher,
  FetchFormat,
  FetchResult,
  ImportedOfferData,
  ImportMeta,
  Importer,
  ImportStatus,
  Marketplace,
  RawParsedData,
} from "./types";

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

// O ImportService escolhe a cadeia de parsers pelo "format" que o Importer
// devolveu - nunca por um `if` checando o nome do marketplace. Se amanhã a
// Kabum também ganhar uma API dedicada, basta o KabumImporter devolver
// format: "api-json" e registrar o parser dela aqui.
const PARSERS_BY_FORMAT: Record<FetchFormat, Array<(content: string) => RawParsedData | null>> = {
  "api-json": [parseMercadoLivreApi],
  html: [parseJsonLd, parseOpenGraph, parseHtml],
};

// Confiança (0-100) por método de extração. category fica sempre 0: nenhuma
// camada hoje tenta inferir categoria - o campo já existe pronto para quando
// isso for implementado.
const CONFIDENCE_BY_METHOD: Record<RawParsedData["method"], { data: number; description: number }> =
  {
    "api-json": { data: 100, description: 95 },
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

function runParsers(fetchResult: FetchResult): RawParsedData | null {
  const parsers = PARSERS_BY_FORMAT[fetchResult.format];
  for (const parser of parsers) {
    const result = parser(fetchResult.content);
    if (result) return result;
  }
  return null;
}

function buildMeta(url: URL, marketplace: Marketplace | null, importMethod: string): ImportMeta {
  return {
    sourceUrl: url.toString(),
    sourceMarketplace: marketplace,
    importMethod,
    importedAt: new Date().toISOString(),
    lastChecked: null,
  };
}

// Calcula status + mensagem a partir dos dados já normalizados - nunca de
// heurística solta em outro lugar. Ordem de prioridade: bloqueio detectado >
// nenhum dado útil (unsupported/failed, dependendo se reconhecemos o
// marketplace) > combinação completa (SUCCESS) > combinação parcial
// (PARTIAL).
function computeStatus(
  data: Pick<ImportedOfferData, "title" | "imageUrl" | "currentPrice" | "marketplace">,
  blocked: boolean,
): { status: ImportStatus; message: string } {
  if (blocked) {
    return {
      status: "BLOCKED",
      message:
        "Essa página retornou uma verificação anti-robô (captcha/bloqueio). Preencha manualmente.",
    };
  }

  const gotAnything = Boolean(data.title || data.imageUrl || data.currentPrice);

  if (!gotAnything) {
    return data.marketplace
      ? {
          status: "FAILED",
          message: "Não encontramos nenhum dado nessa página. Preencha manualmente.",
        }
      : {
          status: "UNSUPPORTED",
          message:
            "Não reconhecemos esse site como um marketplace suportado. Preencha manualmente.",
        };
  }

  const isComplete = Boolean(data.title && data.imageUrl && data.marketplace && data.currentPrice);
  if (isComplete) {
    return { status: "SUCCESS", message: "Importação concluída." };
  }

  return {
    status: "PARTIAL",
    message: "Importação parcial - alguns campos não foram encontrados. Confira antes de salvar.",
  };
}

export class ImportService {
  private readonly enrich: Enricher;

  constructor(options: ImportServiceOptions = {}) {
    this.enrich = options.enrich ?? passthroughEnricher;
  }

  async importOffer(rawUrl: string): Promise<ImportedOfferData> {
    const url = new URL(rawUrl);
    const marketplace = detectMarketplace(url);

    try {
      const importer =
        SPECIFIC_IMPORTERS.find((candidate) => candidate.supports(url)) ?? GENERIC_IMPORTER;
      const fetchResult = await importer.fetch(url);

      const blocked = fetchResult.format === "html" && detectBlockPage(fetchResult.content);
      const parsed: RawParsedData | null = blocked ? null : runParsers(fetchResult);

      const confidenceLevel = parsed ? CONFIDENCE_BY_METHOD[parsed.method] : null;

      const normalized: Omit<ImportedOfferData, "status" | "message"> = {
        title: normalizeTitle(parsed?.title),
        description: normalizeDescription(parsed?.description),
        imageUrl: normalizeImage(parsed?.imageUrl, url),
        currentPrice: normalizePrice(parsed?.price),
        oldPrice: normalizePrice(parsed?.oldPrice),
        marketplace,
        slug: normalizeSlug(parsed?.title),
        confidence: buildConfidence(parsed, confidenceLevel, marketplace),
        meta: buildMeta(url, marketplace, parsed?.method ?? (blocked ? "blocked" : "none")),
      };

      const { status, message } = computeStatus(normalized, blocked);

      return this.enrich({ ...normalized, status, message });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao importar.";
      return this.enrich({
        title: null,
        description: null,
        imageUrl: null,
        currentPrice: null,
        oldPrice: null,
        marketplace,
        slug: null,
        confidence: {
          title: 0,
          description: 0,
          imageUrl: 0,
          currentPrice: 0,
          oldPrice: 0,
          marketplace: 0,
          category: 0,
        },
        meta: buildMeta(url, marketplace, "error"),
        status: "FAILED",
        message: `Não foi possível acessar essa URL (${message}). Preencha manualmente.`,
      });
    }
  }
}

function buildConfidence(
  parsed: RawParsedData | null,
  level: { data: number; description: number } | null,
  marketplace: Marketplace | null,
): ConfidenceScore {
  if (!parsed || !level) {
    return {
      title: 0,
      description: 0,
      imageUrl: 0,
      currentPrice: 0,
      oldPrice: 0,
      marketplace: marketplace ? 100 : 0,
      category: 0,
    };
  }

  return {
    title: parsed.title ? level.data : 0,
    description: parsed.description ? level.description : 0,
    imageUrl: parsed.imageUrl ? level.data : 0,
    currentPrice: parsed.price !== undefined ? level.data : 0,
    oldPrice: parsed.oldPrice !== undefined ? level.data : 0,
    marketplace: marketplace ? 100 : 0,
    category: 0,
  };
}
