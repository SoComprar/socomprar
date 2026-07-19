// Monta uma oferta "rascunho" (não salva no banco) a partir dos valores
// atuais do formulário do admin, para uso EXCLUSIVO no preview em tempo
// real (ver OfferForm.tsx). Nunca é enviada ao Supabase.
//
// Existe só para permitir que o preview reutilize o mesmo componente visual
// da Home (OfferCard), sem duplicar HTML/CSS - o OfferCard espera um objeto
// OfferWithCategory completo, e o formulário só tem os campos "crus" que a
// pessoa está digitando.

import type { Category, Marketplace, OfferWithCategory } from "@/lib/offers";
import { slugify } from "@/lib/offers";

// Placeholder neutro (SVG inline) usado quando ainda não há uma URL de
// imagem válida, para o preview não mostrar um ícone de "imagem quebrada".
const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
      '<rect width="400" height="400" fill="#f1f5f9"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" ' +
      'text-anchor="middle" dominant-baseline="middle">Sem imagem</text></svg>',
  );

export type DraftOfferInput = {
  title: string;
  description: string;
  currentPrice: number;
  oldPrice: number;
  imageUrl: string;
  marketplace: Marketplace;
  categoryId: string;
  affiliateUrl: string;
};

export function buildDraftOffer(
  values: DraftOfferInput,
  categories: Category[],
): OfferWithCategory {
  const category = categories.find((item) => item.id === values.categoryId) ?? null;

  return {
    id: "preview",
    slug: values.title ? slugify(values.title) : "preview",
    title: values.title || "Título da oferta",
    description: values.description,
    image_url: values.imageUrl || IMAGE_PLACEHOLDER,
    current_price: values.currentPrice || 0,
    old_price: values.oldPrice || 0,
    marketplace: values.marketplace,
    category_id: values.categoryId || null,
    affiliate_url: values.affiliateUrl,
    active: true,
    featured: false,
    tags: null,
    created_at: new Date().toISOString(),
    category,
  };
}
