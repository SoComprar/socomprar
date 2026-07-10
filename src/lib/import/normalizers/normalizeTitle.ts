// Limpa um título bruto: colapsa espaços duplicados e remove espaços nas
// bordas. Não tenta remover sufixos de site (ex: " - Amazon.com.br") de forma
// automática - regras assim são frágeis e arriscam cortar título legítimo.
export function normalizeTitle(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || null;
}
