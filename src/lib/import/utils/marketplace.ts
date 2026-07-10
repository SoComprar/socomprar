import type { Marketplace } from "../types";

// Única fonte de verdade para "qual hostname pertence a qual marketplace".
// Usado pelo detector (detectMarketplace) e por cada Importer (no seu supports()).
export const MARKETPLACE_HOSTNAME_RULES: Array<{ match: RegExp; marketplace: Marketplace }> = [
  { match: /amazon\./i, marketplace: "Amazon" },
  { match: /mercadolivre\.|mercadolibre\./i, marketplace: "Mercado Livre" },
  { match: /magazineluiza\.|magazinevoce\./i, marketplace: "Magalu" },
  { match: /shopee\./i, marketplace: "Shopee" },
  { match: /aliexpress\./i, marketplace: "AliExpress" },
  { match: /kabum\./i, marketplace: "Kabum" },
];

export function hostnameMatches(url: URL, marketplace: Marketplace): boolean {
  const rule = MARKETPLACE_HOSTNAME_RULES.find((r) => r.marketplace === marketplace);
  return rule ? rule.match.test(url.hostname) : false;
}
