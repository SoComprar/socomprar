// Este arquivo contém apenas TIPOS e FUNÇÕES UTILITÁRIAS compartilhadas.
// Os dados de ofertas e categorias vêm sempre do Supabase, através de:
// - src/lib/offers.service.ts (leitura pública)
// - src/lib/offers.admin.service.ts (cadastro/edição/exclusão)

export type Marketplace = "Amazon" | "Mercado Livre" | "Magalu" | "Shopee" | "AliExpress";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  active: boolean;
};

export type Offer = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  old_price: number;
  marketplace: Marketplace;
  category_id: string | null;
  affiliate_url: string;
  active: boolean;
  featured: boolean;
  tags: string[] | null;
  created_at: string;
};

export type OfferWithCategory = Offer & {
  category: Category | null;
};

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const discount = (price: number, old: number) =>
  old > 0 ? Math.round(((old - price) / old) * 100) : 0;

// Usado pelo offers.admin.service.ts para gerar o slug automaticamente a partir do título.
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
