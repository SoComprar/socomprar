import { supabase, isSupabaseConfigured } from "./supabase";
import type { Category, OfferWithCategory } from "./offers";

// Select com o join embutido de categoria (PostgREST embedded resource).
const OFFER_SELECT =
  "id,slug,title,description,image_url,current_price,old_price,marketplace,category_id,affiliate_url,active,featured,tags,created_at,category:categories(id,name,slug,icon,active)";

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }
  return supabase;
}

// Todas as ofertas ATIVAS, para uso no site público (home, /ofertas, sitemap).
export async function fetchOffers(): Promise<OfferWithCategory[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("offers")
    .select(OFFER_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as OfferWithCategory[];
}

// Uma oferta específica pelo slug, para a página /oferta/$slug.
export async function fetchOfferBySlug(slug: string): Promise<OfferWithCategory | null> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("offers")
    .select(OFFER_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as OfferWithCategory) ?? null;
}

// Categorias ativas, usadas tanto no site público quanto no formulário do painel admin.
export async function fetchCategories(): Promise<Category[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("categories")
    .select("id,name,slug,icon,active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
