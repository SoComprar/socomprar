import type { Marketplace } from "../types";
import { MARKETPLACE_HOSTNAME_RULES } from "../utils/marketplace";

// Responsabilidade única: identificar o marketplace pela URL.
// Nunca faz fetch, nunca faz parsing, nunca extrai dado nenhum.
export function detectMarketplace(url: URL): Marketplace | null {
  const rule = MARKETPLACE_HOSTNAME_RULES.find((r) => r.match.test(url.hostname));
  return rule?.marketplace ?? null;
}
