// Gera um slug a partir de um título (remove acentos, minúsculas, troca
// qualquer sequência de caracteres não alfanuméricos por um único hífen).
export function normalizeSlug(value: string | null | undefined): string | null {
  if (!value) return null;

  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug || null;
}
