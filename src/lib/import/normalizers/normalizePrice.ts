// Converte um preço (número já pronto, ou texto tipo "R$ 1.299,90") em number.
// Retorna null quando não é possível converter - nunca lança exceção.
export function normalizePrice(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}
