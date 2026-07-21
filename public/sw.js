// Service worker do painel admin do SóComprar (PWA).
//
// Escopo: registrado apenas em /admin (ver registro em __root.tsx), então
// nunca intercepta requisições do site público (Home, página de oferta etc).
//
// O que ele faz:
// - Guarda em cache os arquivos estáticos do app shell (JS, CSS, ícones,
//   manifest) para abrir mais rápido e funcionar offline.
// - NUNCA guarda em cache chamadas de API (/api/*) nem chamadas ao Supabase
//   (dominios externos) — ofertas e sessão sempre vêm da rede, para nunca
//   mostrar dado desatualizado ou expor a tela como se estivesse logado
//   quando não está.
//
// Se algo aqui der problema, o pior caso é o navegador ignorar o cache e
// buscar tudo da rede normalmente (comportamento padrão sem PWA).

const CACHE_VERSION = "socomprar-admin-v1";

const APP_SHELL = ["/manifest.json", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Se algum arquivo do shell falhar (ex: rede instável na instalação),
        // não travamos a instalação do service worker por causa disso.
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só cuidamos de requisições GET, mesma origem, e nunca de /api/* (import
  // de ofertas, etc) nem de domínios externos (Supabase, fontes do Google).
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  if (isStaticAsset(url)) {
    // Cache-first para estáticos: mais rápido e funciona offline. Atualiza
    // o cache em segundo plano a cada visita.
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? networkFetch;
      }),
    );
  }
  // Páginas HTML e qualquer outra coisa: sempre direto da rede, sem cache.
});
