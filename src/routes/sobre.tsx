import { createFileRoute } from "@tanstack/react-router";
import { Article } from "@/components/Article";
import { getAbsoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — SóComprar" },
      { name: "description", content: "Conheça o SóComprar, portal brasileiro de ofertas e cupons." },
      { property: "og:url", content: getAbsoluteUrl("/sobre") },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/sobre") }],
  }),
  component: () => (
    <Article title="Sobre o SóComprar" description="A gente pesquisa. Você economiza.">
      <p>
        O SóComprar é um portal brasileiro que garimpa diariamente as melhores promoções em grandes
        marketplaces como Amazon, Mercado Livre, Magalu, Shopee e AliExpress. Nosso trabalho é
        simples: economizar seu tempo mostrando apenas ofertas realmente boas.
      </p>
      <h2>Nossa missão</h2>
      <p>
        Ajudar milhões de brasileiros a comprarem melhor — com transparência, sem exageros e sem
        falsas promessas.
      </p>
      <h2>Como ganhamos dinheiro</h2>
      <p>
        Alguns links publicados são de afiliados. Se você comprar através deles, podemos receber
        uma comissão do marketplace, sem qualquer custo adicional. É o que mantém o SóComprar no ar.
      </p>
      <h2>Fale com a gente</h2>
      <p>
        Encontrou uma oferta imperdível? Quer sugerir uma categoria? Nos chame pelo Instagram ou WhatsApp.
      </p>
    </Article>
  ),
});
