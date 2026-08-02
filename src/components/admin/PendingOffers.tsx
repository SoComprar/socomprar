import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Send, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/offers";
import {
  fetchPendingOffers,
  publishOfferNow,
  scheduleOffer,
  cancelSchedule,
} from "@/lib/offers.admin.service";

// Formata um Date para o valor esperado por <input type="datetime-local">,
// respeitando o fuso horário local do navegador (evita o input mostrar um
// horário diferente do que a pessoa realmente escolheu).
function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function PendingOffers() {
  const queryClient = useQueryClient();
  // Guarda o valor do input de data por oferta (chave = id da oferta),
  // pré-preenchido com "daqui a 1 hora" só como ponto de partida.
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});

  const pendingQuery = useQuery({
    queryKey: ["pendingOffers"],
    queryFn: fetchPendingOffers,
    staleTime: 1000 * 30,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["pendingOffers"] });

  const publishMutation = useMutation({
    mutationFn: publishOfferNow,
    onSuccess: invalidate,
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ id, whenIso }: { id: string; whenIso: string }) => scheduleOffer(id, whenIso),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSchedule,
    onSuccess: invalidate,
  });

  const handlePublishNow = (id: string) => {
    const confirmed = window.confirm("Publicar esta oferta agora no site?");
    if (!confirmed) return;
    publishMutation.mutate(id);
  };

  const handleSchedule = (id: string) => {
    const draft = scheduleDrafts[id];
    if (!draft) {
      window.alert("Escolha uma data e hora antes de agendar.");
      return;
    }
    const whenIso = new Date(draft).toISOString();
    scheduleMutation.mutate({ id, whenIso });
  };

  const defaultDraft = () => toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000));

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Ofertas capturadas
        </p>
        <h1 className="mt-3 text-2xl font-extrabold text-primary">Pendentes</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Ofertas já cadastradas mas ainda não publicadas no site. Publique agora ou agende um
          horário — a publicação agendada acontece sozinha, sem precisar voltar aqui.
        </p>
      </div>

      {pendingQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar pendentes</AlertTitle>
          <AlertDescription>
            {pendingQuery.error instanceof Error
              ? pendingQuery.error.message
              : "Erro desconhecido."}
          </AlertDescription>
        </Alert>
      ) : null}

      {publishMutation.isError || scheduleMutation.isError || cancelMutation.isError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro ao atualizar oferta</AlertTitle>
          <AlertDescription>Tente novamente em alguns segundos.</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Marketplace</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Agendamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingQuery.isPending ? (
              <TableRow>
                <TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  Carregando pendentes...
                </TableCell>
              </TableRow>
            ) : pendingQuery.data?.length ? (
              pendingQuery.data.map((offer) => {
                const isScheduled = Boolean(offer.scheduled_at);
                const draftValue = scheduleDrafts[offer.id] ?? defaultDraft();

                return (
                  <TableRow key={offer.id}>
                    <TableCell className="max-w-[220px] truncate">{offer.title}</TableCell>
                    <TableCell>{offer.marketplace}</TableCell>
                    <TableCell>{formatPrice(offer.current_price)}</TableCell>
                    <TableCell>
                      {isScheduled ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {new Date(offer.scheduled_at as string).toLocaleString("pt-BR")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto w-fit gap-1 px-1 py-0.5 text-xs text-muted-foreground"
                            onClick={() => cancelMutation.mutate(offer.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="h-3 w-3" />
                            Cancelar agendamento
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem agendamento</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <input
                          type="datetime-local"
                          value={draftValue}
                          onChange={(event) =>
                            setScheduleDrafts((prev) => ({
                              ...prev,
                              [offer.id]: event.target.value,
                            }))
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSchedule(offer.id)}
                          disabled={scheduleMutation.isPending}
                          title="Agendar publicação"
                        >
                          <CalendarClock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublishNow(offer.id)}
                          disabled={publishMutation.isPending}
                          title="Publicar agora"
                          className="gap-1.5"
                        >
                          <Send className="h-4 w-4" />
                          Publicar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma oferta pendente. Tudo que foi capturado já está publicado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
