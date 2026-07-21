import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { INSTAGRAM_URL, WHATSAPP_CONTACT_LINK } from "@/lib/site";

const nav = [
  { to: "/", label: "Início" },
  { to: "/ofertas", label: "Ofertas" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="shrink-0">
          <Logo iconClassName="h-14 w-14" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/ofertas"
            className="hidden h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary sm:grid"
            aria-label="Pesquisar ofertas"
          >
            <Search className="h-5 w-5" />
          </Link>
          {INSTAGRAM_URL ? (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hidden h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary sm:grid"
            >
              <Instagram className="h-5 w-5" />
            </a>
          ) : null}
          {WHATSAPP_CONTACT_LINK ? (
            <a
              href={WHATSAPP_CONTACT_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid h-11 w-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          ) : null}
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-border md:hidden"
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
