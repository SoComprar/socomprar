import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Extrai automaticamente título, descrição, imagem, preço (melhor esforço) e
// marketplace de uma URL de produto colada no painel admin, lendo as tags
// padrão da página (Open Graph, Twitter Card, JSON-LD de Produto).
// Roda no servidor para evitar bloqueio de CORS ao buscar sites externos.

type ImportedOfferData = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  oldPrice: number | null;
  marketplace: string | null;
  slug: string | null;
};

const MARKETPLACE_BY_HOSTNAME: Array<{ match: RegExp; name: string }> = [
  { match: /amazon\./i, name: "Amazon" },
  { match: /mercadolivre\.|mercadolibre\./i, name: "Mercado Livre" },
  { match: /magazineluiza\.|magazinevoce\./i, name: "Magalu" },
  { match: /shopee\./i, name: "Shopee" },
  { match: /aliexpress\./i, name: "AliExpress" },
];

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractJsonLdProduct(html: string): { price?: number; highPrice?: number } | null {
  const scriptMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scriptMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"]
          ? parsed["@graph"]
          : [parsed];

      for (const candidate of candidates) {
        const type = candidate?.["@type"];
        const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
        if (!isProduct) continue;

        const offers = candidate.offers;
        const offerObj = Array.isArray(offers) ? offers[0] : offers;
        if (!offerObj) continue;

        const price = Number(offerObj.price ?? offerObj.lowPrice);
        const highPrice = Number(offerObj.highPrice);

        return {
          price: Number.isFinite(price) ? price : undefined,
          highPrice: Number.isFinite(highPrice) ? highPrice : undefined,
        };
      }
    } catch {
      // JSON-LD malformado ou inesperado; ignora esse bloco e segue tentando os outros.
    }
  }

  return null;
}

function detectMarketplace(url: string): string | null {
  for (const entry of MARKETPLACE_BY_HOSTNAME) {
    if (entry.match.test(url)) return entry.name;
  }
  return null;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const Route = createFileRoute("/api/import-offer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let targetUrl: string;
        try {
          const body = await request.json();
          targetUrl = String(body?.url ?? "");
          new URL(targetUrl); // valida que é uma URL bem formada
        } catch {
          return Response.json({ ok: false, error: "URL inválida." }, { status: 400 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let html: string;
        try {
          const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml",
            },
          });

          if (!response.ok) {
            return Response.json(
              {
                ok: false,
                error: `O site retornou erro ${response.status}. Preencha manualmente.`,
              },
              { status: 200 },
            );
          }

          html = await response.text();
        } catch {
          return Response.json(
            { ok: false, error: "Não foi possível acessar essa URL. Preencha manualmente." },
            { status: 200 },
          );
        } finally {
          clearTimeout(timeout);
        }

        const title = extractMetaContent(html, "og:title") ?? extractTitleTag(html);
        const description =
          extractMetaContent(html, "og:description") ?? extractMetaContent(html, "description");
        const imageUrl = extractMetaContent(html, "og:image");
        const jsonLd = extractJsonLdProduct(html);

        const data: ImportedOfferData = {
          title,
          description,
          imageUrl,
          currentPrice: jsonLd?.price ?? null,
          oldPrice: jsonLd?.highPrice ?? null,
          marketplace: detectMarketplace(targetUrl),
          slug: title ? slugify(title) : null,
        };

        const gotAnything = Object.values(data).some((v) => v !== null);
        if (!gotAnything) {
          return Response.json(
            { ok: false, error: "Não encontramos dados nessa página. Preencha manualmente." },
            { status: 200 },
          );
        }

        return Response.json({ ok: true, data });
      },
    },
  },
});
