import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { INSTAGRAM_URL, WHATSAPP_CONTACT_LINK } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Pesquisamos diariamente as melhores promoções nos maiores marketplaces do Brasil para
            você economizar tempo e dinheiro.
          </p>
          <div className="mt-5 flex gap-2">
            {INSTAGRAM_URL ? (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {WHATSAPP_CONTACT_LINK ? (
              <a
                href={WHATSAPP_CONTACT_LINK}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            ) : null}
            <Link
              to="/contato"
              aria-label="Contato"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-primary">Navegue</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Início
              </Link>
            </li>
            <li>
              <Link to="/ofertas" className="hover:text-primary">
                Ofertas
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-primary">
                Sobre
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-primary">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-primary">Institucional</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/afiliados" className="hover:text-primary">
                Divulgação de Afiliados
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-primary">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-primary">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SóComprar. Todos os direitos reservados.</p>
          <p>Alguns links são de afiliados — podemos receber comissão sem custo para você.</p>
        </div>
      </div>
    </footer>
  );
}
