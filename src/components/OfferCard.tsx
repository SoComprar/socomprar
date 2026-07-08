import { Link } from "@tanstack/react-router";
import { Share2, Copy, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { type OfferWithCategory, formatPrice, discount } from "@/lib/offers";
import { getAbsoluteUrl } from "@/lib/site";

export function OfferCard({ offer }: { offer: OfferWithCategory }) {
  const [copied, setCopied] = useState(false);
  const pct = discount(offer.current_price, offer.old_price);
  const offerUrl = getAbsoluteUrl(`/oferta/${offer.slug}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard indisponível (permissão negada ou navegador sem suporte); ignora silenciosamente.
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: offer.title, url: offerUrl });
      } catch {
        // Compartilhamento cancelado pelo usuário ou indisponível; ignora silenciosamente.
      }
    } else copy();
  };

  return (
    <article className="card-elevated group flex flex-col overflow-hidden">
      <Link
        to="/oferta/$slug"
        params={{ slug: offer.slug }}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <img
          src={offer.image_url}
          alt={offer.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-foreground shadow-md">
          -{pct}%
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {offer.marketplace}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          to="/oferta/$slug"
          params={{ slug: offer.slug }}
          className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold text-foreground hover:text-primary"
        >
          {offer.title}
        </Link>

        <div>
          <div className="text-xs text-muted-foreground line-through">
            {formatPrice(offer.old_price)}
          </div>
          <div className="text-xl font-extrabold text-primary">
            {formatPrice(offer.current_price)}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link
            to="/oferta/$slug"
            params={{ slug: offer.slug }}
            className="btn-brand flex-1 !py-2.5 text-sm"
          >
            Comprar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={share}
            aria-label="Compartilhar"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={copy}
            aria-label="Copiar link"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
          >
            {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
