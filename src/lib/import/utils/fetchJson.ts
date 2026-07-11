// Helper de baixo nível para chamadas a APIs JSON oficiais (ex: Mercado
// Livre). Só busca e faz o parse do JSON - a interpretação do formato
// específico de cada API é responsabilidade dos Parsers, não deste helper.

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchJson(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
