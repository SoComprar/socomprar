import { Link } from "@tanstack/react-router";
import {
  Share2,
  Copy,
  ArrowRight,
  Check,
  Instagram,
  MessageCircle,
  Send,
  Facebook,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type OfferWithCategory, formatPrice, discount } from "@/lib/offers";
import { getAbsoluteUrl, getShareLinks } from "@/lib/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OfferCard({ offer }: { offer: OfferWithCategory }) {
  const [copied, setCopied] = useState(false);
  const pct = discount(offer.current_price, offer.old_price);
  const offerUrl = getAbsoluteUrl(`/oferta/${offer.slug}`);
  const shareLinks = getShareLinks(offerUrl, offer.title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  // Instagram não tem compartilhamento direto de link. Copia o link e tenta
  // abrir o app (Instagram Direct), igual já é feito na página da oferta.
  const shareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(offerUrl);
      toast.success("Link copiado! Cole no Instagram (bio, stories ou direct).");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
    window.open("instagram://direct", "_blank");
  };

  return (
    <article className="card-elevated group flex flex-col overflow-hidden bg-background">
      <Link
        to="/oferta/$slug"
        params={{ slug: offer.slug }}
        className="relative block aspect-square overflow-hidden bg-white p-4"
      >
        <img
          src={offer.image_url}
          alt={offer.title}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-foreground shadow-mdZone z-10">
          -{pct}%
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm z-10">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Compartilhar"
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer"
                >
                  <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer"
                >
                  <Send className="mr-2 h-3.5 w-3.5" /> Telegram
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer"
                >
                  <Facebook className="mr-2 h-3.5 w-3.5" /> Facebook
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareInstagram} className="cursor-pointer">
                <Instagram className="mr-2 h-3.5 w-3.5" /> Instagram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copy} className="cursor-pointer">
                {copied ? (
                  <Check className="mr-2 h-3.5 w-3.5 text-[color:var(--success)]" />
                ) : (
                  <Copy className="mr-2 h-3.5 w-3.5" />
                )}
                Copiar link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
