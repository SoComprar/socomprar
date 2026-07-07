import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Share2, ArrowLeft, Store, Calendar, Tag } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { OfferCard } from "@/components/OfferCard";
import { formatPrice, discount } from "@/lib/offers";
import { fetchOfferBySlug, fetchOffers } from "@/lib/offers.service";

export const Route = createFileRoute("/oferta/$slug")({
  loader: async ({ params }) => {
    const offer = await fetchOfferBySlug(params.slug);
    if (!offer) throw notFound();

    const allOffers = await fetchOffers();
    const related = allOffers
      .filter((o) => offer.category_id && o.category_id === offer.category_id && o.id !== offer.id)
      .slice(0, 4);

    return { offer, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Oferta não encontrada — SóComprar" }, { name: "robots", content: "noindex" }] };
    const { offer } = loaderData;
    return {
      meta: [
        { title: `${offer.title} — SóComprar` },
        { name: "description", content: offer.description },
        { property: "og:title", content: offer.title },
        { property: "og:description", content: offer.description },
        { property: "og:image", content: offer.image_url },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/oferta/${offer.slug}` },
      ],
      links: [{ rel: "canonical", href: `/oferta/${offer.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: offer.title,
            image: offer.image_url,
            description: offer.description,
            offers: {
              "@type": "Offer",
              price: offer.current_price,
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url: offer.affiliate_url,
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: OfferNotFound,
  component: OfferPage,
});

function OfferNotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-primary">Oferta não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">Talvez ela tenha expirado.</p>
        <Link to="/ofertas" className="btn-brand mt-6 inline-flex">Ver ofertas</Link>
      </div>
    </PageShell>
  );
}

function OfferPage() {
  const { offer, related } = Route.useLoaderData();
  const pct = discount(offer.current_price, offer.old_price);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/ofertas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar às ofertas
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="card-elevated overflow-hidden">
            <div className="relative aspect-square bg-secondary">
              <img src={offer.image_url} alt={offer.title} className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-sm font-bold text-brand-foreground shadow-md">
                -{pct}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip"><Store className="h-3.5 w-3.5" /> {offer.marketplace}</span>
              {offer.category ? (
                <span className="chip capitalize"><Tag className="h-3.5 w-3.5" /> {offer.category.name}</span>
              ) : null}
              <span className="chip"><Calendar className="h-3.5 w-3.5" /> {new Date(offer.created_at).toLocaleDateString("pt-BR")}</span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">{offer.title}</h1>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground line-through">{formatPrice(offer.old_price)}</div>
              <div className="text-4xl font-black text-primary">{formatPrice(offer.current_price)}</div>
              <div className="mt-1 text-sm font-semibold" style={{ color: "var(--brand)" }}>
                Você economiza {formatPrice(offer.old_price - offer.current_price)} ({pct}%)
              </div>

              <a
                href={offer.affiliate_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-brand mt-5 w-full !py-3.5 text-base"
              >
                Comprar Agora <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => {
                  if (navigator.share) navigator.share({ title: offer.title, url: window.location.href });
                  else navigator.clipboard.writeText(window.location.href);
                }}
                className="btn-outline-brand mt-3 w-full"
              >
                <Share2 className="h-4 w-4" /> Compartilhar oferta
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-semibold text-primary">Descrição</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              * Preço sujeito a alteração pelo marketplace. Este é um link de afiliado — podemos receber
              comissão sem custo adicional para você.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-extrabold text-primary sm:text-2xl">Produtos relacionados</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((o) => <OfferCard key={o.id} offer={o} />)}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
