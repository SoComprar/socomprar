import type { RawParsedData } from "../types";

// Entende blocos <script type="application/ld+json"> e extrai um Product,
// se existir. Responsabilidade única: interpretar esse formato específico.
// Não sabe nada sobre marketplace, nem faz fetch.
export function parseJsonLd(html: string): RawParsedData | null {
  const scriptMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scriptMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : (parsed["@graph"] ?? [parsed]);

      for (const candidate of candidates) {
        const type = candidate?.["@type"];
        const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
        if (!isProduct) continue;

        const offers = candidate.offers;
        const offerObj = Array.isArray(offers) ? offers[0] : offers;

        const price = Number(offerObj?.price ?? offerObj?.lowPrice);
        const highPrice = Number(offerObj?.highPrice);
        const image = Array.isArray(candidate.image) ? candidate.image[0] : candidate.image;

        return {
          title: typeof candidate.name === "string" ? candidate.name : undefined,
          description:
            typeof candidate.description === "string" ? candidate.description : undefined,
          imageUrl: typeof image === "string" ? image : undefined,
          price: Number.isFinite(price) ? price : undefined,
          oldPrice: Number.isFinite(highPrice) ? highPrice : undefined,
          method: "jsonld",
        };
      }
    } catch {
      // JSON-LD malformado ou inesperado; ignora esse bloco e segue tentando os outros.
    }
  }

  return null;
}
