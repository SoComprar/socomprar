// Helper de baixo nível compartilhado por todos os Importers: busca o HTML
// bruto de uma URL, com timeout e um User-Agent de navegador comum (aumenta a
// chance de não ser bloqueado por proteção anti-bot). Não interpreta o
// conteúdo — isso é responsabilidade dos Parsers.

const DEFAULT_TIMEOUT_MS = 8000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function fetchHtml(url: URL, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
