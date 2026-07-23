import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ImportService } from "@/lib/import";

// Casca HTTP fina: toda a lógica de importação vive em src/lib/import.
// Esta rota só recebe a URL, chama o ImportService e devolve a resposta.
const importService = new ImportService();

// Status que ainda valem a pena preencher o formulário mesmo que
// parcialmente. Os demais (BLOCKED, UNSUPPORTED, FAILED) viram ok:false,
// preservando o contrato atual que o OfferForm.tsx já entende (ele só olha
// para "ok"; "data.status"/"data.message" ficam disponíveis para quando o
// front-end for atualizado para exibir esses avisos com mais detalhe).
const USABLE_STATUSES = new Set(["SUCCESS", "PARTIAL"]);

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

        const data = await importService.importOffer(targetUrl);

        if (!USABLE_STATUSES.has(data.status)) {
          return Response.json({ ok: false, error: data.message, data }, { status: 200 });
        }

        return Response.json({ ok: true, data });
      },
    },
  },
});
