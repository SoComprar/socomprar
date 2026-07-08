import { createFileRoute } from "@tanstack/react-router";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { INSTAGRAM_URL, WHATSAPP_CONTACT_LINK } from "@/lib/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — SóComprar" },
      { name: "description", content: "Fale com o time do SóComprar." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Fale com a gente</h1>
        <p className="mt-3 text-muted-foreground">
          Dúvidas, sugestões ou parcerias? Escolha o canal preferido.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {WHATSAPP_CONTACT_LINK ? (
            <a href={WHATSAPP_CONTACT_LINK} target="_blank" rel="noreferrer" className="card-elevated flex flex-col items-center gap-3 p-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft" style={{ color: "var(--brand)" }}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="font-semibold text-primary">WhatsApp</div>
              <div className="text-xs text-muted-foreground">Resposta rápida</div>
            </a>
          ) : null}
          {INSTAGRAM_URL ? (
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="card-elevated flex flex-col items-center gap-3 p-6 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft" style={{ color: "var(--brand)" }}>
                <Instagram className="h-5 w-5" />
              </div>
              <div className="font-semibold text-primary">Instagram</div>
              <div className="text-xs text-muted-foreground">Siga a gente</div>
            </a>
          ) : null}
          <a href="mailto:contato@socomprar.com.br" className="card-elevated flex flex-col items-center gap-3 p-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft" style={{ color: "var(--brand)" }}>
              <Mail className="h-5 w-5" />
            </div>
            <div className="font-semibold text-primary">E-mail</div>
            <div className="text-xs text-muted-foreground">contato@socomprar.com.br</div>
          </a>
        </div>
      </section>
    </PageShell>
  );
}
