import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { OfferCard } from "@/components/OfferCard";
import type { Marketplace } from "@/lib/offers";
import { fetchCategories } from "@/lib/offers.service";
import { createOffer } from "@/lib/offers.admin.service";
import { buildDraftOffer } from "@/lib/offers.draft";
import { Sparkles, BrainCircuit } from "lucide-react";
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
  const [geminiJsonInput, setGeminiJsonInput] = useState("");
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

  const liveValues = useWatch({ control: form.control });
  const draftOffer = buildDraftOffer(
    {
      title: liveValues.title ?? "",
      description: liveValues.description ?? "",
      currentPrice: liveValues.currentPrice ?? 0,
      oldPrice: liveValues.oldPrice ?? 0,
      imageUrl: liveValues.imageUrl ?? "",
      marketplace: liveValues.marketplace ?? "Amazon",
      categoryId: liveValues.categoryId ?? "",
      affiliateUrl: liveValues.affiliateUrl ?? "",
    },
    categoriesQuery.data ?? [],
  );

  // FUNÇÃO AJUSTADA COM INTERCEPTOR DIRETO DE IMAGEURL E INPUT SEM DECIMAIS
  const handleImportFromGemini = () => {
    if (!geminiJsonInput.trim()) return;
    setImportMessage(null);

    try {
      const parsed = JSON.parse(geminiJsonInput.trim());
      const data = parsed.dados_extraidos || parsed;

      const opts = { shouldValidate: true, shouldDirty: true, shouldTouch: true };

      if (data.titulo || data.title) {
        form.setValue("title", data.titulo || data.title, opts);
      }
      if (data.description || data.descricao) {
        form.setValue("description", data.description || data.descricao, opts);
      }

      // Correção da Imagem: Mapeia tanto "imagem" quanto "imageUrl" direto para o campo correto da tela
      const linkDaFoto = data.imageUrl || data.imageUrl || data.imagem || data.image;
      if (linkDaFoto) {
        form.setValue("imageUrl", linkDaFoto, opts);
      }

      // Correção dos Preços: Lê o valor puro enviado de forma direta para o CurrencyInput processar
      if (data.currentPrice || data.precoAtual) {
        const pCurrent = String(data.currentPrice || data.precoAtual).replace(/[^\d.]/g, "");
        const num = parseFloat(pCurrent);
        if (!isNaN(num)) form.setValue("currentPrice", num, opts);
      }
      if (data.oldPrice || data.precoAntigo) {
        const pOld = String(data.oldPrice || data.precoAntigo).replace(/[^\d.]/g, "");
        const num = parseFloat(pOld);
        if (!isNaN(num)) form.setValue("oldPrice", num, opts);
      }

      const mkt = data.marketplace;
      if (mkt && marketplaceOptions.includes(mkt as Marketplace)) {
        form.setValue("marketplace", mkt as Marketplace, opts);
      }

      setImportMessage({
        type: "success",
        message:
          "Dados injetados com sucesso! Confira o resultado, defina a Categoria e salve a oferta.",
      });
      setGeminiJsonInput("");
    } catch (e) {
      setImportMessage({
        type: "error",
        message: "Falha ao ler o código. Copie o bloco de código JSON completo do Gemini.",
      });
    }
  };

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
        message: `Importamos ${filledCount} campo(s) automaticamente. Confira e complete antes de salvar.`,
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
      const payload = {
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
      };
      await createOffer(payload);
      setStatus({ type: "success", message: "Oferta cadastrada com sucesso." });
      form.reset(emptyValues);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar oferta.";
      setStatus({ type: "error", message });
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
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

        {importMessage ? (
          <Alert variant={importMessage.type === "success" ? "default" : "destructive"}>
            <AlertTitle>{importMessage.type === "success" ? "Processado" : "Aviso"}</AlertTitle>
            <AlertDescription>{importMessage.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 space-y-4">
          <div className="p-3 bg-background border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                Opção A: Preenchimento Rápido com Gemini
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Cole o bloco de código JSON completo gerado pelo Gemini na caixa abaixo e clique em
              Importar.
            </p>
            <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder='Ex: { "titulo": "Bicicleta...", "precoAtual": "R$ 1.346,00" ... }'
                value={geminiJsonInput}
                onChange={(e) => setGeminiJsonInput(e.target.value)}
                className="text-xs font-mono"
              />
              <Button
                type="button"
                onClick={handleImportFromGemini}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-4 shrink-0 rounded-lg cursor-pointer"
              >
                Importar Dados
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--brand)" }} />
              <h3 className="text-sm font-semibold text-primary">
                Opção B: Importar via Link Direto
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cole a URL do produto para tentar buscar pelo servidor.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="https://..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <Button type="button" onClick={handleImport} disabled={importing}>
                {importing ? "Importando..." : "Buscar Link"}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Produto</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Ex: Bicicleta Spinning 13kg WCT Fitness"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Preço Atual (R$)</Label>
              <Controller
                name="currentPrice"
                control={form.control}
                render={({ field }) => (
                  <CurrencyInput value={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.currentPrice && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.currentPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preço Antigo / Original (R$)</Label>
              <Controller
                name="oldPrice"
                control={form.control}
                render={({ field }) => (
                  <CurrencyInput value={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.oldPrice && (
                <p className="text-xs text-destructive">{form.formState.errors.oldPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Controller
                name="marketplace"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="marketplace">
                      <SelectValue placeholder="Selecione a loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketplaceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria no Site</Label>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={categoriesQuery.isPending}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue
                        placeholder={
                          categoriesQuery.isPending ? "Carregando..." : "Selecione a categoria"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoryId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Link da Imagem (URL)</Label>
            <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://..." />
            {form.formState.errors.imageUrl && (
              <p className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateUrl">Seu Link de Afiliado</Label>
            <Input
              id="affiliateUrl"
              {...form.register("affiliateUrl")}
              placeholder="https://amzn.to... ou https://shope.ee..."
            />
            {form.formState.errors.affiliateUrl && (
              <p className="text-xs text-destructive">
                {form.formState.errors.affiliateUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Extraída</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={4}
              placeholder="Especificações do product..."
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 py-2">
            <div className="flex items-center space-x-2">
              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <Checkbox id="active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Oferta Ativa
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="featured"
                control={form.control}
                render={({ field }) => (
                  <Checkbox id="featured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Destaque na Home
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Salvar Oferta no Banco de Dados
          </Button>
        </form>
      </div>

      <aside className="sticky top-20 hidden space-y-4 lg:block">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Preview da Oferta no Site
        </p>
        <div className="w-[320px] rounded-2xl border border-border bg-card p-2 shadow-xs">
          <OfferCard offer={draftOffer} variant="compact" />
        </div>
      </aside>
    </div>
  );
}
