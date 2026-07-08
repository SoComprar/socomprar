import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "./CurrencyInput";
import type { Marketplace } from "@/lib/offers";
import { fetchCategories } from "@/lib/offers.service";
import { createOffer } from "@/lib/offers.admin.service";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const offerSchema = z
  .object({
    title: z.string().min(1, "Título é obrigatório."),
    description: z.string().min(1, "Descrição é obrigatória."),
    currentPrice: z.number().positive("Preço atual deve ser maior que zero."),
    oldPrice: z.number().positive("Preço antigo deve ser maior que zero."),
    imageUrl: z.string().url("Informe uma URL válida para a imagem."),
    marketplace: z.enum(["Amazon", "Mercado Livre", "Magalu", "Shopee", "AliExpress"]),
    categoryId: z.string().min(1, "Categoria é obrigatória."),
    affiliateUrl: z.string().url("Informe um link afiliado válido."),
    active: z.boolean(),
    featured: z.boolean(),
  })
  .refine((data) => data.oldPrice >= data.currentPrice, {
    message: "O preço antigo deve ser maior ou igual ao preço atual.",
    path: ["oldPrice"],
  });

type OfferFormValues = z.infer<typeof offerSchema>;

const marketplaceOptions: Marketplace[] = [
  "Amazon",
  "Mercado Livre",
  "Magalu",
  "Shopee",
  "AliExpress",
];

const emptyValues: OfferFormValues = {
  title: "",
  description: "",
  currentPrice: 0,
  oldPrice: 0,
  imageUrl: "",
  marketplace: "Amazon",
  categoryId: "",
  affiliateUrl: "",
  active: true,
  featured: false,
};

type OfferFormProps = {
  onSuccess?: () => void;
};

type ImportOfferResponse =
  | {
      ok: true;
      data: {
        title: string | null;
        description: string | null;
        imageUrl: string | null;
        currentPrice: number | null;
        oldPrice: number | null;
        marketplace: string | null;
        slug: string | null;
      };
    }
  | { ok: false; error: string };

export function OfferForm({ onSuccess }: OfferFormProps) {
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: emptyValues,
  });

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportMessage(null);

    try {
      const response = await fetch("/api/import-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const result = (await response.json()) as ImportOfferResponse;

      if (!result.ok) {
        setImportMessage({ type: "error", message: result.error });
        return;
      }

      const { data } = result;
      if (data.title) form.setValue("title", data.title, { shouldValidate: true });
      if (data.description)
        form.setValue("description", data.description, { shouldValidate: true });
      if (data.imageUrl) form.setValue("imageUrl", data.imageUrl, { shouldValidate: true });
      if (data.currentPrice)
        form.setValue("currentPrice", data.currentPrice, { shouldValidate: true });
      if (data.oldPrice) form.setValue("oldPrice", data.oldPrice, { shouldValidate: true });
      if (data.marketplace && marketplaceOptions.includes(data.marketplace as Marketplace)) {
        form.setValue("marketplace", data.marketplace as Marketplace, { shouldValidate: true });
      }

      const filledCount = [
        data.title,
        data.description,
        data.imageUrl,
        data.currentPrice,
        data.marketplace,
      ].filter(Boolean).length;
      setImportMessage({
        type: "success",
        message: `Importamos ${filledCount} campo(s) automaticamente. Confira e complete o que faltar (categoria, link afiliado e, se necessário, os preços) antes de salvar.`,
      });
    } catch {
      setImportMessage({
        type: "error",
        message: "Falha ao importar. Preencha manualmente abaixo.",
      });
    } finally {
      setImporting(false);
    }
  };

  const onSubmit = async (values: OfferFormValues) => {
    setStatus(null);

    try {
      await createOffer({
        title: values.title,
        description: values.description,
        currentPrice: values.currentPrice,
        oldPrice: values.oldPrice,
        imageUrl: values.imageUrl,
        marketplace: values.marketplace,
        categoryId: values.categoryId,
        affiliateUrl: values.affiliateUrl,
        active: values.active,
        featured: values.featured,
      });
      setStatus({ type: "success", message: "Oferta cadastrada com sucesso." });
      form.reset(emptyValues);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar oferta.";
      setStatus({ type: "error", message });
    }
  };

  return (
    <div className="space-y-6">
      {status ? (
        <Alert variant={status.type === "success" ? "default" : "destructive"}>
          <AlertTitle>{status.type === "success" ? "Sucesso" : "Erro"}</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}

      {categoriesQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar categorias</AlertTitle>
          <AlertDescription>
            {categoriesQuery.error instanceof Error
              ? categoriesQuery.error.message
              : "Erro desconhecido."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "var(--brand)" }} />
          <h3 className="text-sm font-semibold text-primary">Importar oferta (BETA)</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cole a URL do produto para tentar preencher automaticamente. Todos os campos continuam
          editáveis, e se a importação falhar você pode preencher manualmente abaixo.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="Cole a URL do produto"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleImport}
            disabled={importing || !importUrl.trim()}
          >
            {importing ? "Importando..." : "Importar automaticamente"}
          </Button>
        </div>
        {importMessage ? (
          <Alert
            variant={importMessage.type === "success" ? "default" : "destructive"}
            className="mt-3"
          >
            <AlertTitle>
              {importMessage.type === "success" ? "Importado" : "Não foi possível importar"}
            </AlertTitle>
            <AlertDescription>{importMessage.message}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Imagem (URL)</Label>
            <Input id="imageUrl" {...form.register("imageUrl")} />
            {form.formState.errors.imageUrl ? (
              <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="currentPrice">Preço Atual</Label>
            <Controller
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <CurrencyInput
                  id="currentPrice"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            {form.formState.errors.currentPrice ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.currentPrice.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="oldPrice">Preço Antigo</Label>
            <Controller
              control={form.control}
              name="oldPrice"
              render={({ field }) => (
                <CurrencyInput
                  id="oldPrice"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            {form.formState.errors.oldPrice ? (
              <p className="text-sm text-destructive">{form.formState.errors.oldPrice.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="marketplace">Marketplace</Label>
            <Controller
              control={form.control}
              name="marketplace"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.marketplace ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.marketplace.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={categoriesQuery.isPending}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesQuery.isPending
                          ? "Carregando categorias..."
                          : "Selecione uma categoria"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesQuery.data ?? []).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.categoryId ? (
              <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="affiliateUrl">Link Afiliado</Label>
          <Input id="affiliateUrl" {...form.register("affiliateUrl")} />
          {form.formState.errors.affiliateUrl ? (
            <p className="text-sm text-destructive">{form.formState.errors.affiliateUrl.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" rows={5} {...form.register("description")} />
          {form.formState.errors.description ? (
            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                <span className="text-sm font-medium">Ativo</span>
              </label>
            )}
          />

          <Controller
            control={form.control}
            name="featured"
            render={({ field }) => (
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                <span className="text-sm font-medium">Destaque</span>
              </label>
            )}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Os dados serão enviados diretamente para a tabela{" "}
            <span className="font-semibold">offers</span>.
          </p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Salvar oferta
          </Button>
        </div>
      </form>
    </div>
  );
}
