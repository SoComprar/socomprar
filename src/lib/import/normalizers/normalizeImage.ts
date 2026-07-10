// Garante que a URL da imagem seja absoluta. Alguns sites retornam og:image
// como caminho relativo (raro, mas acontece) - resolve contra a URL de
// origem. Retorna null se a URL for inválida.
export function normalizeImage(value: string | null | undefined, baseUrl: URL): string | null {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}
