import { supabase, isSupabaseConfigured } from "./supabase";
import { slugify } from "./offers";
import type { Marketplace, OfferWithCategory } from "./offers";

const ADMIN_OFFER_SELECT =
  "id,slug,title,description,image_url,current_price,old_price,marketplace,category_id,affiliate_url,active,featured,tags,created_at,category:categories(id,name,slug,icon,active)";

export type OfferInput = {
  title: string;
  description: string;
  currentPrice: number;
  oldPrice: number;
  imageUrl: string;
  marketplace: Marketplace;
  categoryId: string;
  affiliateUrl: string;
  active: boolean;
  featured: boolean;
  // Opcional: se não for informado, é gerado a partir do título.
  slug?: string;
};

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }
  return supabase;
}

function toRow(input: OfferInput) {
  return {
    title: input.title,
    description: input.description,
    current_price: input.currentPrice,
    old_price: input.oldPrice,
    image_url: input.imageUrl,
    marketplace: input.marketplace,
    category_id: input.categoryId,
    affiliate_url: input.affiliateUrl,
    active: input.active,
    featured: input.featured,
    slug: input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
  };
}

// Todas as ofertas (ativas ou não), para a tabela de gestão do painel admin.
export async function fetchOffersForAdmin(): Promise<OfferWithCategory[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("offers")
    .select(ADMIN_OFFER_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as OfferWithCategory[];
}

export async function createOffer(input: OfferInput) {
  const client = ensureSupabase();

  const { error } = await client.from("offers").insert([toRow(input)]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

// Pronto para quando a edição de ofertas for adicionada ao painel.
export async function updateOffer(id: string, input: OfferInput) {
  const client = ensureSupabase();

  const { error } = await client.from("offers").update(toRow(input)).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function deleteOffer(id: string) {
  const client = ensureSupabase();

  const { error } = await client.from("offers").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
