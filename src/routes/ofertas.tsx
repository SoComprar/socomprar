import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { OfferCard } from "@/components/OfferCard";
import { fetchCategories, fetchOffers } from "@/lib/offers.service";

export const Route = createFileRoute("/ofertas")({
  loader: async () => {
    const [offers, categories] = await Promise.all([fetchOffers(), fetchCategories()]);
    return { offers, categories };
  },
  head: () => ({
    meta: [
      { title: "Ofertas — SóComprar" },
      { name: "description", content: "Todas as ofertas selecionadas hoje pelos marketplaces parceiros." },
      { property: "og:url", content: "/ofertas" },
    ],
    links: [{ rel: "canonical", href: "/ofertas" }],
  }),
  component: OfertasPage,
});

function OfertasPage() {
  const { offers, categories } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const matchCat = cat === "todas" || o.category?.slug === cat;
      const matchQ =
        !q ||
        o.title.toLowerCase().includes(q.toLowerCase()) ||
        o.marketplace.toLowerCase().includes(q.toLowerCase()) ||
        (o.tags ?? []).some((t) => t.toLowerCase().includes(q.toLowerCase()));
      return matchCat && matchQ;
    });
  }, [offers, q, cat]);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">Ofertas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} promoções selecionadas hoje.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome, marca ou loja…"
              className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[color:var(--brand)]/30"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {[{ slug: "todas", name: "Todas" }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                cat === c.slug
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-primary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((o) => <OfferCard key={o.id} offer={o} />)}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-sm text-muted-foreground">
            Nenhuma oferta encontrada. Tente outro termo.
          </div>
        )}
      </section>
    </PageShell>
  );
}
