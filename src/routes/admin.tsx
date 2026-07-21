import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { getAbsoluteUrl } from "@/lib/site";

// Este arquivo agora é só o "molde" da área /admin.
// Quem decide o que aparece de fato (painel ou tela de login)
// são as rotas filhas: admin.index.tsx e admin.login.tsx.
//
// O manifest, os ícones de instalação e o service worker do PWA são
// declarados só aqui (e não em __root.tsx) de propósito: assim o site
// público continua 100% como estava, sem nenhum vínculo com o app instalável
// do painel.
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
    links: [
      { rel: "canonical", href: getAbsoluteUrl("/admin") },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  // Registra o service worker só quando alguém está de fato em /admin,
  // e limita o escopo dele a /admin — ele nunca chega a controlar as
  // páginas do site público (Home, oferta, etc), mesmo que o navegador
  // já tenha o arquivo /sw.js em cache.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/admin" }).catch(() => {
      // Falha ao registrar o service worker não deve impedir o uso do
      // painel — o app continua funcionando normalmente, só sem os
      // benefícios de PWA (instalar, abrir mais rápido offline).
    });
  }, []);

  return <Outlet />;
}
