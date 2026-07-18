import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getAbsoluteUrl } from "@/lib/site";

// Este arquivo agora é só o "molde" da área /admin.
// Quem decide o que aparece de fato (painel ou tela de login)
// são as rotas filhas: admin.index.tsx e admin.login.tsx.
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SóComprar" },
      {
        name: "description",
        content:
          "Painel administrativo para gerenciar ofertas e cadastrar novos registros no Supabase.",
      },
      { property: "og:url", content: getAbsoluteUrl("/admin") },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/admin") }],
  }),
  component: () => <Outlet />,
});
