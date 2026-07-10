// Configuração central do site.
//
// Quando o domínio definitivo for comprado, ou quando o WhatsApp/Instagram
// da loja forem definidos, edite apenas o .env (VITE_SITE_URL,
// VITE_WHATSAPP_NUMBER, VITE_INSTAGRAM_URL) — nenhum outro arquivo do
// projeto precisa ser alterado.

export const SITE_NAME = "SóComprar";

// URL base do site, usada em: canonical, og:url, sitemap.xml, robots.txt.
// Ordem de prioridade:
// 1) VITE_SITE_URL, se definida (ex: https://socomprar.com)
// 2) window.location.origin, no navegador (funciona em localhost e em
//    qualquer preview/deploy automaticamente)
// 3) process.env.VERCEL_URL, durante SSR na Vercel sem a variável definida
// 4) fallback fixo, apenas para SSR local sem nenhuma das anteriores
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (typeof process !== "undefined" && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Contato da loja (WhatsApp/Instagram). Ficam vazios até serem configurados
// no .env - os componentes que os usam escondem o botão/ícone quando vazios,
// em vez de mostrar um link quebrado.
const whatsappDigitsOnly = (
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? ""
).replace(/\D/g, "");

export const WHATSAPP_NUMBER = whatsappDigitsOnly;
export const WHATSAPP_CONTACT_LINK = whatsappDigitsOnly
  ? `https://wa.me/${whatsappDigitsOnly}`
  : "";

export const INSTAGRAM_URL = (
  (import.meta.env.VITE_INSTAGRAM_URL as string | undefined) ?? ""
).trim();

export const CONTACT_EMAIL = (
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "contato@socomprar.com.br"
).trim();

// Links de COMPARTILHAMENTO de uma oferta (diferente do contato da loja acima).
// Usados no card e na página da oferta.
export function getShareLinks(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };
}
