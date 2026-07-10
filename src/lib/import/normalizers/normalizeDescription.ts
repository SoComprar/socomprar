// Limpa uma descrição bruta: colapsa espaços duplicados e remove espaços nas
// bordas.
export function normalizeDescription(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned || null;
}
