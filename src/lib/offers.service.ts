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

// "Destrava" ofertas que foram agendadas (active = false + scheduled_at no
// passado) tornando-as ativas. Roda antes de qualquer leitura pública, então
// a publicação acontece sozinha assim que alguém visita o site — sem
// precisar de nenhuma tarefa programada rodando no servidor.
//
// Erros aqui não devem derrubar a página: na pior das hipóteses a oferta
// aparece publicada só na próxima visita, em vez de nesta.
async function publishDueOffers() {
  const client = ensureSupabase();

  await client
    .from("offers")
    .update({ active: true, scheduled_at: null })
    .eq("active", false)
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString());
}

// Todas as ofertas ATIVAS, para uso no site público (home, /ofertas, sitemap).
export async function fetchOffers(): Promise<OfferWithCategory[]> {
  const client = ensureSupabase();

  await publishDueOffers();

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

  // Cobre o caso de alguém abrir o link direto da oferta (ex: campanha de
  // WhatsApp) antes de qualquer visita à Home ter disparado a publicação.
  await publishDueOffers();

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
