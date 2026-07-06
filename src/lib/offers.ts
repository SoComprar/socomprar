export type Marketplace =
  | "Amazon"
  | "Mercado Livre"
  | "Magalu"
  | "Shopee"
  | "AliExpress";

export type Offer = {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  marketplace: Marketplace;
  category: string;
  description: string;
  url: string;
  publishedAt: string;
  tags: string[];
};

export const categories = [
  { slug: "eletronicos", name: "Eletrônicos", icon: "Cpu" },
  { slug: "casa", name: "Casa", icon: "Home" },
  { slug: "cozinha", name: "Cozinha", icon: "ChefHat" },
  { slug: "ferramentas", name: "Ferramentas", icon: "Wrench" },
  { slug: "beleza", name: "Beleza", icon: "Sparkles" },
  { slug: "informatica", name: "Informática", icon: "Laptop" },
  { slug: "celulares", name: "Celulares", icon: "Smartphone" },
  { slug: "games", name: "Games", icon: "Gamepad2" },
  { slug: "esporte", name: "Esporte", icon: "Dumbbell" },
  { slug: "moda", name: "Moda", icon: "Shirt" },
  { slug: "brinquedos", name: "Brinquedos", icon: "ToyBrick" },
  { slug: "automotivo", name: "Automotivo", icon: "Car" },
  { slug: "pet", name: "Pet", icon: "PawPrint" },
] as const;

export const offers: Offer[] = [
  {
    id: "1",
    slug: "fone-bluetooth-jbl-tune-520bt",
    title: "Fone de Ouvido Bluetooth JBL Tune 520BT",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    price: 249.9,
    oldPrice: 449.0,
    marketplace: "Amazon",
    category: "eletronicos",
    description:
      "Fone over-ear com Bluetooth 5.3, até 57h de bateria e microfone integrado. Perfeito para quem busca qualidade e autonomia.",
    url: "https://amazon.com.br",
    publishedAt: "2026-07-04",
    tags: ["fone", "bluetooth", "jbl"],
  },
  {
    id: "2",
    slug: "air-fryer-mondial-5l",
    title: "Air Fryer Mondial 5L Family Inox",
    image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&q=80",
    price: 329.0,
    oldPrice: 599.0,
    marketplace: "Magalu",
    category: "cozinha",
    description:
      "Fritadeira elétrica sem óleo com 5L de capacidade, timer e controle digital. Comida crocante em minutos.",
    url: "https://magazineluiza.com.br",
    publishedAt: "2026-07-03",
    tags: ["cozinha", "airfryer"],
  },
  {
    id: "3",
    slug: "smart-tv-samsung-50-crystal",
    title: 'Smart TV Samsung 50" Crystal UHD 4K',
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80",
    price: 2299.0,
    oldPrice: 3299.0,
    marketplace: "Mercado Livre",
    category: "eletronicos",
    description:
      "TV 4K com HDR, Tizen OS, controle único e processador Crystal 4K. Cinema em casa por um preço imbatível.",
    url: "https://mercadolivre.com.br",
    publishedAt: "2026-07-05",
    tags: ["tv", "samsung", "4k"],
  },
  {
    id: "4",
    slug: "tenis-nike-revolution-7",
    title: "Tênis Nike Revolution 7 Masculino",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    price: 219.9,
    oldPrice: 349.9,
    marketplace: "Shopee",
    category: "esporte",
    description:
      "Tênis leve e confortável para corrida e uso diário. Amortecimento macio e design moderno.",
    url: "https://shopee.com.br",
    publishedAt: "2026-07-02",
    tags: ["nike", "tenis", "corrida"],
  },
  {
    id: "5",
    slug: "notebook-lenovo-ideapad-3",
    title: "Notebook Lenovo IdeaPad 3 i5 8GB 512GB SSD",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    price: 2799.0,
    oldPrice: 3999.0,
    marketplace: "Amazon",
    category: "informatica",
    description:
      "Notebook com Intel Core i5, 8GB RAM, SSD 512GB e tela 15.6\". Ideal para trabalho e estudo.",
    url: "https://amazon.com.br",
    publishedAt: "2026-07-01",
    tags: ["notebook", "lenovo"],
  },
  {
    id: "6",
    slug: "iphone-13-128gb",
    title: "iPhone 13 128GB Meia-noite",
    image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80",
    price: 3699.0,
    oldPrice: 4999.0,
    marketplace: "Magalu",
    category: "celulares",
    description:
      "iPhone 13 com câmera dupla de 12MP, tela Super Retina XDR e chip A15 Bionic.",
    url: "https://magazineluiza.com.br",
    publishedAt: "2026-07-05",
    tags: ["iphone", "apple"],
  },
  {
    id: "7",
    slug: "cadeira-gamer-thunderx3",
    title: "Cadeira Gamer ThunderX3 EC3",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
    price: 1199.0,
    oldPrice: 1899.0,
    marketplace: "Mercado Livre",
    category: "games",
    description:
      "Cadeira ergonômica com apoio de braço 2D, reclinação até 180° e revestimento em couro sintético.",
    url: "https://mercadolivre.com.br",
    publishedAt: "2026-07-03",
    tags: ["gamer", "cadeira"],
  },
  {
    id: "8",
    slug: "perfume-natura-essencial",
    title: "Perfume Natura Essencial Masculino 100ml",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
    price: 149.9,
    oldPrice: 249.0,
    marketplace: "AliExpress",
    category: "beleza",
    description:
      "Fragrância marcante e sofisticada com notas amadeiradas. Fixação prolongada.",
    url: "https://aliexpress.com",
    publishedAt: "2026-07-04",
    tags: ["perfume", "natura"],
  },
];

export const formatPrice = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const discount = (price: number, old: number) =>
  Math.round(((old - price) / old) * 100);
