import type { FetchResult } from "../types";

// Helper de baixo nível compartilhado por todos os Importers baseados em
// HTML: busca o conteúdo bruto de uma URL, com timeout e um User-Agent
// configurável. Não interpreta o conteúdo — isso é responsabilidade dos
// Parsers.

const DEFAULT_TIMEOUT_MS = 8000;

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

// Muitos sites de e-commerce bloqueiam scrapers genéricos, mas liberam de
// propósito os robôs de preview de link do WhatsApp/Facebook/Telegram -
// afinal, é do interesse do próprio site que o preview (foto, título, preço)
// apareça bonito quando alguém compartilha o produto. Usado como fallback
// quando o acesso normal (ou uma API oficial) é bloqueado.
export const SOCIAL_PREVIEW_USER_AGENT = "WhatsApp/2.23.20.0 A";

export type FetchHtmlOptions = {
  timeoutMs?: number;
  userAgent?: string;
};

export async function fetchHtml(url: URL, options: FetchHtmlOptions = {}): Promise<FetchResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, userAgent = BROWSER_USER_AGENT } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const content = await response.text();
    return { content, format: "html" };
  } finally {
    clearTimeout(timeout);
  }
}
