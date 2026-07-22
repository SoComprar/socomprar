import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ImportService } from "@/lib/import";

const importService = new ImportService();
const USABLE_STATUSES = new Set(["SUCCESS", "PARTIAL"]);

// INSERÇÃO DA SCRAPERAPI PARA BURLAR O BLOQUEIO DA VERCEL
// Substitua o texto abaixo pela sua chave que você pegou no site scraperapi.com
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

        // Se a URL for de um dos marketplaces bloqueados, nós camuflamos o link usando a ScraperAPI
        let urlProcessada = targetUrl;
        if (
          targetUrl.includes("amazon.com.br") || 
          targetUrl.includes("mercadolivre.com.br") || 
          targetUrl.includes("shopee.com.br")
        ) {
          urlProcessada = `http://scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(targetUrl)}`;
        }

        // Passa a URL camuflada (ou a original se for outra loja) para o serviço extrair os dados puros
        const data = await importService.importOffer(urlProcessada);

        if (!USABLE_STATUSES.has(data.status)) {
          return Response.json({ ok: false, error: data.message, data }, { status: 200 });
        }

        return Response.json({ ok: true, data });
      },
    },
  },
});
