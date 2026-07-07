import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Sparkles, ShieldCheck, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatPrice } from "@/lib/offers";
import { OfferForm } from "./OfferForm";
import { deleteOffer, fetchOffersForAdmin } from "@/lib/offers.admin.service";

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const offersQuery = useQuery({
    queryKey: ["adminOffers"],
    queryFn: fetchOffersForAdmin,
    staleTime: 1000 * 60,
    enabled: isSupabaseConfigured,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminOffers"] }),
  });

  const handleOfferCreated = () => queryClient.invalidateQueries({ queryKey: ["adminOffers"] });

  const handleDelete = (id: string) => {
    const confirmation = window.confirm("Tem certeza de que deseja apagar esta oferta?");
    if (!confirmation) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Área administrativa
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
              Painel de gestão de ofertas
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Cadastre e remova ofertas diretamente na tabela <span className="font-semibold">offers</span> do Supabase.
            </p>
          </div>

          <div className="grid gap-2 rounded-3xl border border-border bg-secondary/70 p-4 text-sm text-foreground shadow-sm sm:text-base">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">Status do Supabase</span>
              <span className={isSupabaseConfigured ? "text-success" : "text-destructive"}>
                {isSupabaseConfigured ? "Configurado" : "Não configurado"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              {isSupabaseConfigured
                ? "Preparado para inserções e exclusões no banco"
                : "Defina as variáveis de ambiente no .env"}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Cadastro rápido</p>
          <p className="mt-3 text-2xl font-extrabold text-foreground">Ofertas</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Use o formulário para registrar promoções em tempo real no Supabase.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/50 text-foreground">
            <Database className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Tabela</p>
          <p className="mt-3 text-2xl font-extrabold text-foreground">offers</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Os registros criados aqui serão enviados diretamente para a tabela de ofertas.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/40 text-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">Infra</p>
          <p className="mt-3 text-2xl font-extrabold text-foreground">Seguro</p>
          <p className="mt-2 text-sm text-muted-foreground">
            O painel funciona sem alterar as páginas públicas ou o layout existente.
          </p>
        </div>
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Nova oferta
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-primary">Cadastro de ofertas</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Preencha os dados abaixo para enviar uma oferta ao Supabase.
            </p>
          </div>
        </div>
        <OfferForm onSuccess={handleOfferCreated} />
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Ofertas existentes
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-primary">Gerenciar ofertas</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Apague registros diretamente da tabela de ofertas.
            </p>
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["adminOffers"] })}>
            Atualizar lista
          </Button>
        </div>

        {offersQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar ofertas</AlertTitle>
            <AlertDescription>{offersQuery.error instanceof Error ? offersQuery.error.message : "Erro desconhecido."}</AlertDescription>
          </Alert>
        ) : null}

        {deleteMutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao excluir oferta</AlertTitle>
            <AlertDescription>{deleteMutation.error instanceof Error ? deleteMutation.error.message : "Erro desconhecido."}</AlertDescription>
          </Alert>
        ) : null}

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Marketplace</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offersQuery.isPending ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    Carregando ofertas...
                  </TableCell>
                </TableRow>
              ) : offersQuery.data?.length ? (
                offersQuery.data.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>{offer.title}</TableCell>
                    <TableCell>{offer.marketplace}</TableCell>
                    <TableCell>{offer.category?.name ?? "—"}</TableCell>
                    <TableCell>{formatPrice(offer.current_price)}</TableCell>
                    <TableCell>{offer.active ? "Sim" : "Não"}</TableCell>
                    <TableCell>{offer.featured ? "Sim" : "Não"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma oferta encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
