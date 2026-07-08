import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, ArrowLeft, Store, Calendar, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { formatPrice, discount } from "@/lib/offers";
import { fetchOfferBySlug } from "@/lib/offers.service";
import { getAbsoluteUrl, getShareLinks, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/oferta/$slug")({
  loader: async ({ params }) => {
    const offer = await fetchOfferBySlug(params.slug);
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Oferta não encontrada — SóComprar" }, { name: "robots", content: "noindex" }] };
    const { offer } = loaderData;
    const offerUrl = getAbsoluteUrl(`/oferta/${offer.slug}`);
    return {
      meta: [
        { title: `${offer.title} — SóComprar` },
        { name: "description", content: offer.description },
        { property: "og:title", content: offer.title },
        { property: "og:description", content: offer.description },
        { property: "og:image", content: offer.image_url },
        { property: "og:type", content: "product" },
        { property: "og:url", content: offerUrl },
        { property: "og:site_name", content: SITE_NAME },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: offer.title },
        { name: "twitter:description", content: offer.description },
        { name: "twitter:image", content: offer.image_url },
      ],
      links: [{ rel: "canonical", href: offerUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: offer.title,
            image: offer.image_url,
            description: offer.description,
            url: offerUrl,
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
  const { offer } = Route.useLoaderData();
  const pct = discount(offer.current_price, offer.old_price);
  const [copied, setCopied] = useState(false);
  const offerUrl = getAbsoluteUrl(`/oferta/${offer.slug}`);
  const shareLinks = getShareLinks(offerUrl, offer.title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard indisponível (permissão negada ou navegador sem suporte); ignora silenciosamente.
    }
  };

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

              {/* Espaço reservado para anúncios (Google AdSense). Cole o bloco de anúncio aqui. */}
              <div
                data-ad-slot="offer-page-below-buy-button"
                className="mt-4 flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground"
              >
                Espaço reservado para anúncio
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Compartilhar
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no WhatsApp"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.464 3.484 1.346 5.001L2 22l5.116-1.343a9.96 9.96 0 0 0 4.888 1.294h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.928-7.07a9.935 9.935 0 0 0-7.073-2.881zm0 18.187h-.003a8.15 8.15 0 0 1-4.158-1.14l-.298-.177-3.037.797.811-2.96-.194-.304a8.164 8.164 0 0 1-1.256-4.36c0-4.518 3.677-8.194 8.198-8.194 2.19 0 4.248.854 5.796 2.404a8.14 8.14 0 0 1 2.399 5.798c0 4.518-3.677 8.136-8.258 8.136z" />
                    </svg>
                  </a>
                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no Facebook"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.361H7.332v3.209h2.747v8.196h3.318z" />
                    </svg>
                  </a>
                  <a
                    href={shareLinks.telegram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Compartilhar no Telegram"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M21.944 4.667 18.6 20.42c-.253 1.113-.914 1.39-1.853.865l-5.12-3.774-2.47 2.377c-.273.273-.502.502-1.03.502l.368-5.226 9.51-8.593c.414-.368-.09-.573-.643-.205L6.19 12.99l-5.107-1.598c-1.11-.347-1.13-1.11.232-1.643L20.517 3.09c.925-.347 1.734.205 1.427 1.577z" />
                    </svg>
                  </a>
                  <button
                    onClick={copyLink}
                    aria-label="Copiar link"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
                  >
                    {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
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
      </div>
    </PageShell>
  );
}
