import { MARKETPLACE_HOSTNAME_RULES } from "../utils/marketplace";

// Nomes genéricos que costumam aparecer no <title> de uma página de
// bloqueio/verificação, em vez do nome real do produto. Reaproveita os nomes
// de marketplace já cadastrados em utils/marketplace.ts.
const GENERIC_SITE_NAMES = MARKETPLACE_HOSTNAME_RULES.map((rule) => rule.marketplace.toLowerCase());

// Variações internacionais/genéricas que não aparecem em MARKETPLACE_HOSTNAME_RULES
// (que só lista o nome usado no Brasil), mas que também indicam que a página
// devolvida não é a página real do produto - ex: quando o servidor de origem
// da requisição é identificado como estando fora do Brasil e o site devolve
// a versão internacional genérica em vez da página do produto solicitado.
const GENERIC_SITE_NAME_VARIANTS = ["mercado libre"];

const ALL_GENERIC_NAMES = [...GENERIC_SITE_NAMES, ...GENERIC_SITE_NAME_VARIANTS];

const BLOCK_PAGE_PHRASES = [
  "captcha",
  "verifique que você não é um robô",
  "not a robot",
  "acesso negado",
  "access denied",
  "robot check",
  "unusual traffic",
];

// Responsabilidade única: decidir se um HTML buscado é uma página de
// bloqueio/captcha/interstitial em vez do conteúdo real do produto.
// Reutilizável por qualquer Importer baseado em HTML (Amazon, Magalu, Kabum,
// Shopee, Genérico) - não sabe nada sobre normalização nem sobre o
// marketplace específico além dos nomes genéricos que já eram públicos.
export function detectBlockPage(html: string): boolean {
  const normalized = html.toLowerCase();

  if (BLOCK_PAGE_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim().toLowerCase();

  // Página real de produto quase nunca tem como <title> só o nome do site.
  // Página de bloqueio (ou a versão internacional genérica devolvida quando
  // a origem da requisição não é reconhecida como brasileira), com
  // frequência, tem exatamente isso - ou o nome do site em algum lugar bem
  // no início do título, sem nenhuma informação do produto.
  if (
    title &&
    ALL_GENERIC_NAMES.some(
      (name) => title === name || title.startsWith(`${name}.com`) || title.startsWith(`${name} `),
    )
  ) {
    return true;
  }

  // HTML suspeito curto, sem nenhum sinal de dado estruturado de produto.
  const looksEmpty =
    html.length < 2000 &&
    !normalized.includes("application/ld+json") &&
    !normalized.includes("og:title");
  if (looksEmpty) {
    return true;
  }

  return false;
}
