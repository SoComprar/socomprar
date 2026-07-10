import type { RawParsedData } from "../types";
import { decodeHtmlEntities, extractMetaContent } from "./htmlUtils";

// Fallback final, quando nem JSON-LD nem Open Graph existem na página:
// lê <title> e a meta description simples.
export function parseHtml(html: string): RawParsedData | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1].trim()) : undefined;
  const description = extractMetaContent(html, "description") ?? undefined;

  if (!title && !description) return null;

  return {
    title,
    description,
    method: "html",
  };
}
