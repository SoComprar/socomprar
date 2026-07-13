import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Trash2 } from "lucide-react";
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Painel de ofertas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre e gerencie ofertas no Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5" />
          {isSupabaseConfigured ? "Supabase conectado" : "Supabase não configurado"}
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8">
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
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["adminOffers"] })}
          >
            Atualizar lista
          </Button>
        </div>

        {offersQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao carregar ofertas</AlertTitle>
            <AlertDescription>
              {offersQuery.error instanceof Error
                ? offersQuery.error.message
                : "Erro desconhecido."}
            </AlertDescription>
          </Alert>
        ) : null}

        {deleteMutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Erro ao excluir oferta</AlertTitle>
            <AlertDescription>
              {deleteMutation.error instanceof Error
                ? deleteMutation.error.message
                : "Erro desconhecido."}
            </AlertDescription>
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
