import { supabase, isSupabaseConfigured } from "./supabase";
import type { Marketplace } from "./offers";

export type CreateOfferInput = {
  title: string;
  description: string;
  price: number;
  oldPrice: number;
  image: string;
  marketplace: Marketplace;
  category: string;
  url: string;
  active: boolean;
  featured: boolean;
};

export type OfferRow = {
  id: string;
  title: string;
  marketplace: Marketplace;
  category: string;
  price: number;
  old_price: number;
  affiliate_url: string;
  active: boolean;
  featured: boolean;
  created_at: string | null;
};

export async function createOffer(offer: CreateOfferInput) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }

  const { error } = await supabase.from("offers").insert([
    {
      title: offer.title,
      description: offer.description,
      price: offer.price,
      old_price: offer.oldPrice,
      image: offer.image,
      marketplace: offer.marketplace,
      category: offer.category,
      affiliate_url: offer.url,
      active: offer.active,
      featured: offer.featured,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function fetchOffers() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }

  const { data, error } = await supabase
    .from<OfferRow>("offers")
    .select("id,title,marketplace,category,price,old_price,affiliate_url,active,featured,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function deleteOffer(id: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }

  const { error } = await supabase.from("offers").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
