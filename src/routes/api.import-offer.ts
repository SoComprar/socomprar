import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ImportService } from "@/lib/import";

const importService = new ImportService();
const USABLE_STATUSES = new Set(["SUCCESS", "PARTIAL"]);

// Use a sua chave do ScraperAPI aqui dentro das aspas
const SCRAPER_API_KEY = "c291ff31b636c3439b3418aeec9de42b";

export const Route = createFileRoute("/api/import-offer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let targetUrl: string;
        try {
          const body = await request.json();
          targetUrl = String(body?.url ?? "");
          new URL(targetUrl); // Valida que é uma URL bem formada
        } catch {
          return Response.json({ ok: false, error: "URL inválida." }, { status: 400 });
        }

        let urlProcessada = targetUrl;
        if (
          targetUrl.includes("amazon.com.br") || 
          targetUrl.includes("mercadolivre.com.br") || 
          targetUrl.includes("shopee.com.br")
        ) {
          // ATENÇÃO: Adicionado '&render=true' no final para simular uma pessoa real abrindo o navegador e quebrar o captcha!
          urlProcessada = `http://scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
        }

        const data = await importService.importOffer(urlProcessada);

        if (!USABLE_STATUSES.has(data.status)) {
          return Response.json({ ok: false, error: data.message, data }, { status: 200 });
        }

        return Response.json({ ok: true, data });
      },
    },
  },
});
