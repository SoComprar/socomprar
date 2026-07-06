import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, type Marketplace } from "@/lib/offers";
import { createOffer, type CreateOfferInput } from "@/lib/offers.service";
import { useState } from "react";
import { z } from "zod";

const offerSchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  price: z.number().positive("Preço atual deve ser maior que zero."),
  oldPrice: z.number().positive("Preço antigo deve ser maior que zero."),
  image: z.string().url("Informe uma URL válida para a imagem."),
  marketplace: z.enum(["Amazon", "Mercado Livre", "Magalu", "Shopee", "AliExpress"]),
  category: z.string().min(1, "Categoria é obrigatória."),
  url: z.string().url("Informe um link afiliado válido."),
  active: z.boolean(),
  featured: z.boolean(),
}).refine((data) => data.oldPrice >= data.price, {
  message: "O preço antigo deve ser maior ou igual ao preço atual.",
  path: ["oldPrice"],
});

type OfferFormValues = z.infer<typeof offerSchema>;

const marketplaceOptions: Marketplace[] = ["Amazon", "Mercado Livre", "Magalu", "Shopee", "AliExpress"];

type OfferFormProps = {
  onSuccess?: () => void;
};

export function OfferForm({ onSuccess }: OfferFormProps) {
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(null);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      oldPrice: 0,
      image: "",
      marketplace: "Amazon",
      category: categories[0]?.slug ?? "",
      url: "",
      active: true,
      featured: false,
    },
  });

  const onSubmit = async (values: OfferFormValues) => {
    setStatus(null);

    const payload: CreateOfferInput = {
      title: values.title,
      description: values.description,
      price: values.price,
      oldPrice: values.oldPrice,
      image: values.image,
      marketplace: values.marketplace,
      category: values.category,
      url: values.url,
      active: values.active,
      featured: values.featured,
    };

    try {
      await createOffer(payload);
      setStatus({ type: "success", message: "Oferta cadastrada com sucesso." });
      form.reset({
        title: "",
        description: "",
        price: 0,
        oldPrice: 0,
        image: "",
        marketplace: "Amazon",
        category: categories[0]?.slug ?? "",
        url: "",
        active: true,
        featured: false,
      });
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
            <Label htmlFor="image">Imagem (URL)</Label>
            <Input id="image" {...form.register("image")} />
            {form.formState.errors.image ? (
              <p className="text-sm text-destructive">{form.formState.errors.image.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="price">Preço Atual</Label>
            <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
            {form.formState.errors.price ? (
              <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="oldPrice">Preço Antigo</Label>
            <Input id="oldPrice" type="number" step="0.01" {...form.register("oldPrice", { valueAsNumber: true })} />
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
              <p className="text-sm text-destructive">{form.formState.errors.marketplace.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category ? (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="url">Link Afiliado</Label>
          <Input id="url" {...form.register("url")} />
          {form.formState.errors.url ? (
            <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
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
            Os dados serão enviados diretamente para a tabela <span className="font-semibold">offers</span>.
          </p>
          <Button type="submit">Salvar oferta</Button>
        </div>
      </form>
    </div>
  );
}
