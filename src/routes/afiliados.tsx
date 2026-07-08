import { createFileRoute } from "@tanstack/react-router";
import { Article } from "@/components/Article";
import { getAbsoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/afiliados")({
  head: () => ({
    meta: [
      { title: "Divulgação de Afiliados — SóComprar" },
      { name: "description", content: "Transparência sobre nossos links de afiliados." },
      { property: "og:url", content: getAbsoluteUrl("/afiliados") },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/afiliados") }],
  }),
  component: () => (
    <Article title="Divulgação de Afiliados">
      <p>
        Alguns links publicados neste site são links de afiliados. Caso você realize uma compra
        através deles, poderemos receber uma comissão,{" "}
        <strong>sem qualquer custo adicional para você</strong>.
      </p>
      <p>
        Essa é a forma como mantemos o SóComprar gratuito. Só recomendamos ofertas que consideramos
        realmente vantajosas — nossa reputação vale mais do que qualquer comissão.
      </p>
      <h2>Participamos dos seguintes programas</h2>
      <ul>
        <li>Amazon Associados</li>
        <li>Mercado Livre Afiliados</li>
        <li>Magalu Parceiro</li>
        <li>Shopee Afiliados</li>
        <li>AliExpress Portals</li>
      </ul>
      <p className="text-xs">
        Preços e disponibilidade estão sujeitos a alteração pelo marketplace a qualquer momento.
      </p>
    </Article>
  ),
});
