import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  // Desliga a renderização no servidor para esta rota.
  // Motivo: a sessão do usuário fica salva só no navegador (localStorage).
  // Se checássemos a sessão no servidor (SSR), ela sempre pareceria "vazia"
  // e a pessoa seria mandada pro login mesmo já estando logada — foi
  // exatamente o que aconteceu ao apertar F5.
  ssr: false,
  // Só deixa entrar em /admin se houver uma sessão válida do Supabase.
  // Sem sessão, manda direto para a tela de login.
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminIndexPage,
});

function AdminIndexPage() {
  return (
    <PageShell>
      <AdminDashboard />
    </PageShell>
  );
}
