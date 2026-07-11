import type { RawParsedData } from "../types";

// Formato mínimo que nos interessa da resposta de GET /items/{id} da API do
// Mercado Livre. A API devolve muito mais campos - só tipamos o que usamos.
type MercadoLivreItem = {
  title?: string;
  price?: number;
  original_price?: number | null;
  pictures?: Array<{ secure_url?: string; url?: string }>;
};

// Formato mínimo de GET /items/{id}/description.
type MercadoLivreDescription = {
  plain_text?: string;
  text?: string;
};

type MercadoLivreApiPayload = {
  item?: MercadoLivreItem;
  description?: MercadoLivreDescription;
};

// Entende o JSON combinado (item + description) que o MercadoLivreImporter
// monta a partir da API oficial do Mercado Livre. Responsabilidade única:
// interpretar esse formato específico - não sabe nada sobre HTML, nem faz
// fetch, nem normaliza valores.
export function parseMercadoLivreApi(content: string): RawParsedData | null {
  let parsed: MercadoLivreApiPayload;

  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const item = parsed.item;
  if (!item || typeof item.title !== "string") return null;

  const image = item.pictures?.[0]?.secure_url ?? item.pictures?.[0]?.url;
  const description = parsed.description?.plain_text ?? parsed.description?.text;

  return {
    title: item.title,
    description: typeof description === "string" ? description : undefined,
    imageUrl: typeof image === "string" ? image : undefined,
    price: typeof item.price === "number" ? item.price : undefined,
    oldPrice: typeof item.original_price === "number" ? item.original_price : undefined,
    method: "api-json",
  };
}
