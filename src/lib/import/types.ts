// Tipos compartilhados por todo o módulo de importação (src/lib/import).
// Nenhuma lógica aqui — apenas contratos entre as camadas.

export type Marketplace = "Amazon" | "Mercado Livre" | "Magalu" | "Shopee" | "AliExpress" | "Kabum";

// Confiança (0-100) de cada campo extraído. category fica sempre 0 hoje: nenhuma
// camada tenta inferir categoria ainda — o campo já existe pronto para quando
// isso for implementado.
export type ConfidenceScore = {
  title: number;
  description: number;
  imageUrl: number;
  currentPrice: number;
  oldPrice: number;
  marketplace: number;
  category: number;
};

// Reservado para a futura atualização automática de preços: lastChecked começa
// sempre null nesta etapa.
export type ImportMeta = {
  sourceUrl: string;
  sourceMarketplace: Marketplace | null;
  importMethod: string;
  importedAt: string;
  lastChecked: string | null;
};

// Resultado final entregue ao chamador (hoje, a rota /api/import-offer).
export type ImportedOfferData = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  oldPrice: number | null;
  marketplace: Marketplace | null;
  slug: string | null;
  confidence: ConfidenceScore;
  meta: ImportMeta;
};

// Dados estruturados brutos, extraídos por um Parser, antes da normalização.
// Um Parser nunca limpa/formata valores — isso é responsabilidade dos Normalizers.
export type RawParsedData = {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  oldPrice?: number;
  method: "jsonld" | "opengraph" | "html";
};

// Interface única que todo Importer deve implementar. Um Importer SÓ busca o
// HTML bruto do seu marketplace — nunca interpreta o conteúdo.
export interface Importer {
  supports(url: URL): boolean;
  fetch(url: URL): Promise<string>;
}

// Ponto de extensão: no futuro, uma etapa de IA pode ser injetada aqui, entre os
// Normalizers e o retorno final (melhorar título/descrição, gerar SEO, tags,
// meta description, Open Graph, palavras-chave). Hoje, a implementação padrão
// é um passthrough que não altera nada.
export type Enricher = (data: ImportedOfferData) => Promise<ImportedOfferData>;
