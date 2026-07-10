import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ImportService } from "@/lib/import";

// Casca HTTP fina: toda a lógica de importação vive em src/lib/import.
// Esta rota só recebe a URL, chama o ImportService e devolve a resposta.
const importService = new ImportService();

export const Route = createFileRoute("/api/import-offer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let targetUrl: string;
        try {
          const body = await request.json();
          targetUrl = String(body?.url ?? "");
          new URL(targetUrl); // valida que é uma URL bem formada
        } catch {
          return Response.json({ ok: false, error: "URL inválida." }, { status: 400 });
        }

        try {
          const data = await importService.importOffer(targetUrl);

          const gotAnything =
            data.title ||
            data.description ||
            data.imageUrl ||
            data.currentPrice ||
            data.marketplace;
          if (!gotAnything) {
            return Response.json(
              { ok: false, error: "Não encontramos dados nessa página. Preencha manualmente." },
              { status: 200 },
            );
          }

          return Response.json({ ok: true, data });
        } catch {
          return Response.json(
            { ok: false, error: "Não foi possível acessar essa URL. Preencha manualmente." },
            { status: 200 },
          );
        }
      },
    },
  },
});
