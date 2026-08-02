import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { PendingOffers } from "@/components/admin/PendingOffers";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin/pendentes")({
  // Mesmo motivo do /admin/index: sessão vive só no navegador (localStorage),
  // então SSR sempre veria "deslogado" e mandaria pro login à toa.
  ssr: false,
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: PendentesPage,
});

function PendentesPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
          ← Voltar ao painel
        </Link>
        <PendingOffers />
      </div>
    </PageShell>
  );
}
