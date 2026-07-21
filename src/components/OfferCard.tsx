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

export function OfferCard({
  offer,
  variant = "default",
}: {
  offer: OfferWithCategory;
  variant?: "default" | "compact";
}) {
  const [copied, setCopied] = useState(false);
  const pct = discount(offer.current_price, offer.old_price);
  const offerUrl = getAbsoluteUrl(`/oferta/${offer.slug}`);
  const shareLinks = getShareLinks(offerUrl, offer.title);
  const isCompact = variant === "compact";

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
        className={`relative block aspect-square overflow-hidden bg-white ${
          isCompact ? "p-2 lg:p-4" : "p-4"
        }`}
      >
        <img
          src={offer.image_url}
          alt={offer.title}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full bg-brand font-bold text-brand-foreground shadow-mdZone z-10 ${
            isCompact
              ? "px-2 py-0.5 text-[10px] lg:px-2.5 lg:py-1 lg:text-xs"
              : "px-2.5 py-1 text-xs"
          }`}
        >
          -{pct}%
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full bg-background/95 font-semibold text-primary shadow-sm z-10 ${
            isCompact
              ? "px-2 py-0.5 text-[9px] lg:px-2.5 lg:py-1 lg:text-[11px]"
              : "px-2.5 py-1 text-[11px]"
          }`}
        >
          {offer.marketplace}
        </span>
      </Link>

      <div
        className={`flex flex-1 flex-col ${
          isCompact ? "gap-1.5 p-2.5 lg:gap-3 lg:p-4" : "gap-3 p-4"
        }`}
      >
        <Link
          to="/oferta/$slug"
          params={{ slug: offer.slug }}
          className={`line-clamp-2 font-semibold text-foreground hover:text-primary ${
            isCompact
              ? "min-h-[2.25rem] text-xs lg:min-h-[2.75rem] lg:text-sm"
              : "min-h-[2.75rem] text-sm"
          }`}
        >
          {offer.title}
        </Link>

        <div>
          <div
            className={`text-muted-foreground line-through ${isCompact ? "text-[10px] lg:text-xs" : "text-xs"}`}
          >
            {formatPrice(offer.old_price)}
          </div>
          <div
            className={`font-extrabold text-primary ${isCompact ? "text-base lg:text-xl" : "text-xl"}`}
          >
            {formatPrice(offer.current_price)}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Link
            to="/oferta/$slug"
            params={{ slug: offer.slug }}
            className={`btn-brand flex-1 ${
              isCompact ? "!py-2 text-xs lg:!py-2.5 lg:text-sm" : "!py-2.5 text-sm"
            }`}
          >
            Comprar{" "}
            <ArrowRight className={isCompact ? "h-3 w-3 lg:h-3.5 lg:w-3.5" : "h-3.5 w-3.5"} />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Compartilhar"
                className={`grid place-items-center rounded-full border border-border text-muted-foreground hover:text-primary ${
                  isCompact ? "h-8 w-8 lg:h-10 lg:w-10" : "h-10 w-10"
                }`}
              >
                <Share2 className={isCompact ? "h-3.5 w-3.5 lg:h-4 lg:w-4" : "h-4 w-4"} />
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
