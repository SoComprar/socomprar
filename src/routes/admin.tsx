import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SóComprar" },
      { name: "description", content: "Painel administrativo para gerenciar ofertas e cadastrar novos registros no Supabase." },
      { property: "og:url", content: "/admin" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <PageShell>
      <AdminDashboard />
    </PageShell>
  );
}
