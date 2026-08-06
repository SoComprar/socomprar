import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Send, Sparkles, X } from "lucide-react";
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
import { formatPrice, type OfferWithCategory } from "@/lib/offers";
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

function diasParada(createdAtIso: string): number {
  const ms = Date.now() - new Date(createdAtIso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function descontoPct(offer: OfferWithCategory): number {
  if (!offer.old_price || offer.old_price <= offer.current_price) return 0;
  return Math.round(((offer.old_price - offer.current_price) / offer.old_price) * 100);
}

// Pontuação simples: desconto pesa mais, mas tempo parado também empurra a
// oferta pra cima (evita que a mesma fique esquecida pra sempre no fundo).
function pontuacao(offer: OfferWithCategory): number {
  const dias = Math.min(diasParada(offer.created_at), 10);
  return descontoPct(offer) * 2 + dias * 3;
}

// Ordena por pontuação dentro de cada categoria e depois intercala
// (1 de cada categoria por vez) pra não empilhar várias ofertas seguidas
// da mesma categoria.
function sugerirOrdem(offers: OfferWithCategory[]): OfferWithCategory[] {
  const porCategoria = new Map<string, OfferWithCategory[]>();
  for (const offer of offers) {
    const chave = offer.category?.name ?? "Sem categoria";
    if (!porCategoria.has(chave)) porCategoria.set(chave, []);
    porCategoria.get(chave)!.push(offer);
  }
  for (const lista of porCategoria.values()) {
    lista.sort((a, b) => pontuacao(b) - pontuacao(a));
  }

  const grupos = Array.from(porCategoria.values());
  const resultado: OfferWithCategory[] = [];
  for (let i = 0; resultado.length < offers.length; i++) {
    for (const grupo of grupos) {
      if (grupo[i]) resultado.push(grupo[i]);
    }
  }
  return resultado;
}

export function PendingOffers() {
  const queryClient = useQueryClient();
  // Guarda o valor do input de data por oferta (chave = id da oferta),
  // pré-preenchido com "daqui a 1 hora" só como ponto de partida.
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});
  const [sugestaoAtiva, setSugestaoAtiva] = useState(false);

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

  const listaExibida = useMemo(() => {
    const dados = pendingQuery.data ?? [];
    return sugestaoAtiva ? sugerirOrdem(dados) : dados;
  }, [pendingQuery.data, sugestaoAtiva]);

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Ofertas capturadas
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-primary">Pendentes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ofertas já cadastradas mas ainda não publicadas no site. Publique agora ou agende um
            horário — a publicação agendada acontece sozinha, sem precisar voltar aqui.
          </p>
        </div>
        <Button
          variant={sugestaoAtiva ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setSugestaoAtiva((prev) => !prev)}
        >
          <Sparkles className="h-4 w-4" />
          {sugestaoAtiva ? "Ordem sugerida (ativa)" : "Sugerir ordem"}
        </Button>
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
              {sugestaoAtiva && <TableHead className="w-10">#</TableHead>}
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
                <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  Carregando pendentes...
                </TableCell>
              </TableRow>
            ) : listaExibida.length ? (
              listaExibida.map((offer, index) => {
                const isScheduled = Boolean(offer.scheduled_at);
                const draftValue = scheduleDrafts[offer.id] ?? defaultDraft();
                const dias = diasParada(offer.created_at);
                const pct = descontoPct(offer);

                return (
                  <TableRow key={offer.id}>
                    {sugestaoAtiva && (
                      <TableCell className="text-sm font-semibold text-muted-foreground">
                        {index + 1}
                      </TableCell>
                    )}
                    <TableCell className="max-w-[220px]">
                      <div className="truncate">{offer.title}</div>
                      {sugestaoAtiva && (
                        <div className="mt-1 flex gap-1.5">
                          {pct > 0 && (
                            <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                              -{pct}%
                            </span>
                          )}
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {dias === 0 ? "capturada hoje" : `${dias}d parada`}
                          </span>
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {offer.category?.name ?? "sem categoria"}
                          </span>
                        </div>
                      )}
                    </TableCell>
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
                <TableCell colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
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
