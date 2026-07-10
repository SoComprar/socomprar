import type { RawParsedData } from "../types";
import { extractMetaContent } from "./htmlUtils";

// Entende meta tags Open Graph (og:title, og:description, og:image).
// Não sabe nada sobre preço - OG não expõe preço de forma padronizada.
export function parseOpenGraph(html: string): RawParsedData | null {
  const title = extractMetaContent(html, "og:title");
  const description = extractMetaContent(html, "og:description");
  const imageUrl = extractMetaContent(html, "og:image");

  if (!title && !description && !imageUrl) return null;

  return {
    title: title ?? undefined,
    description: description ?? undefined,
    imageUrl: imageUrl ?? undefined,
    method: "opengraph",
  };
}
