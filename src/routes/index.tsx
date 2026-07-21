import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  Cpu,
  Home as HomeIcon,
  ChefHat,
  Wrench,
  Sparkles,
  Laptop,
  Smartphone,
  Gamepad2,
  Dumbbell,
  Shirt,
  ToyBrick,
  Car,
  PawPrint,
  ShieldCheck,
  Zap,
  Tag,
  Package,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OfferCard } from "@/components/OfferCard";
import { fetchCategories, fetchOffers } from "@/lib/offers.service";
import { WHATSAPP_CONTACT_LINK, getAbsoluteUrl } from "@/lib/site";
import heroImg from "@/assets/hero.jpg";

const iconMap = {
  Cpu,
  Home: HomeIcon,
  ChefHat,
  Wrench,
  Sparkles,
  Laptop,
  Smartphone,
  Gamepad2,
  Dumbbell,
  Shirt,
  ToyBrick,
  Car,
  PawPrint,
  Package,
} as const;

// Mapa de categorias para ícones apropriados (fallback quando icon não vem do BD)
const categoryIconMap: Record<string, keyof typeof iconMap> = {
  automotivo: "Car",
  beleza: "Sparkles",
  brinquedos: "ToyBrick",
  casa: "Home",
  celulares: "Smartphone",
  cozinha: "ChefHat",
  eletrônicos: "Laptop",
  esporte: "Dumbbell",
  esportes: "Dumbbell",
  ferramentas: "Wrench",
  games: "Gamepad2",
  informática: "Cpu",
  moda: "Shirt",
  pet: "PawPrint",
};

export const Route = createFileRoute("/")({
  loader: async () => {
    const [offers, categories] = await Promise.all([fetchOffers(), fetchCategories()]);
    return { offers, categories };
  },
  head: () => ({
    meta: [
      { title: "SóComprar — Ofertas todos os dias na Amazon, Magalu e Shopee" },
      {
        name: "description",
        content:
          "As melhores promoções dos maiores marketplaces do Brasil, atualizadas diariamente. A gente pesquisa. Você economiza.",
      },
      { property: "og:url", content: getAbsoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/") }],
  }),
  component: Index,
});

function Index() {
  const { offers, categories } = Route.useLoaderData();
  // Prioriza ofertas marcadas como "destaque"; se não houver nenhuma ainda, mostra as mais recentes.
  const featuredOffers = offers.filter((o) => o.featured);
  const featured = (featuredOffers.length > 0 ? featuredOffers : offers).slice(0, 8);
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--brand-soft)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "color-mix(in oklab, var(--primary) 25%, transparent)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-8 md:grid-cols-2 md:pt-20 md:pb-10">
          <div>
            <span className="chip !bg-brand-soft" style={{ color: "var(--brand)" }}>
              <Tag className="h-3.5 w-3.5" /> Ofertas atualizadas diariamente
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-primary sm:text-5xl md:text-6xl">
              A gente pesquisa. <span style={{ color: "var(--brand)" }}>Você economiza.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              A gente pesquisa as melhores ofertas nos maiores marketplaces do Brasil para que você
              economize tempo e dinheiro.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/ofertas" className="btn-brand">
                Ver Ofertas <ArrowRight className="h-4 w-4" />
              </Link>
              {WHATSAPP_CONTACT_LINK ? (
                <a
                  href={WHATSAPP_CONTACT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" /> Grupo de Ofertas
                </a>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" style={{ color: "var(--brand)" }} /> Lojas
                confiáveis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4" style={{ color: "var(--brand)" }} /> Ofertas em tempo real
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-4 w-4" style={{ color: "var(--brand)" }} /> Descontos de até 70%
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-soft to-secondary" />
            <img
              src={heroImg}
              alt="Ofertas SóComprar"
              width={1280}
              height={960}
              className="mx-auto w-full max-w-lg rounded-[2rem]"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-4 pb-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
              Explore por categoria
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Encontre a promoção certa para o que você procura.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {categories.map((c) => {
            // Prioridade: 1) icon do BD, 2) mapa de categoria, 3) Package
            let iconKey = c.icon as keyof typeof iconMap | undefined;
            if (!iconKey) {
              const categoryKey = c.slug.toLowerCase().replace(/-/g, "");
              iconKey = categoryIconMap[categoryKey] || "Package";
            }
            const Icon = iconMap[iconKey];
            return (
              <Link
                key={c.slug}
                to="/ofertas"
                search={{ categoria: c.slug }}
                className="card-elevated group flex flex-col items-center gap-2 px-2 py-4 text-center"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft transition-colors">
                  <Icon className="h-5 w-5" style={{ color: "var(--brand)" }} />
                </div>
                <span className="text-xs font-semibold text-foreground">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
              Ofertas em destaque
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecionadas hoje para você economizar.
            </p>
          </div>
          <Link
            to="/ofertas"
            className="hidden text-sm font-semibold text-primary hover:opacity-70 sm:inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((o) => (
            <OfferCard key={o.id} offer={o} variant="compact" />
          ))}
        </div>
      </section>

      {WHATSAPP_CONTACT_LINK ? (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center sm:p-14">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-2xl"
              style={{ background: "var(--brand)" }}
            />
            <h3 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
              Receba as melhores ofertas primeiro
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">
              Entre no nosso grupo do WhatsApp e receba promoções selecionadas todos os dias.
            </p>
            <a
              href={WHATSAPP_CONTACT_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn-brand mt-6 inline-flex"
            >
              <MessageCircle className="h-4 w-4" /> Entrar no grupo
            </a>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
