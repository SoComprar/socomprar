import { createFileRoute } from "@tanstack/react-router";
import { Article } from "@/components/Article";
import { getAbsoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — SóComprar" },
      { name: "description", content: "Termos e condições de uso do site SóComprar." },
      { property: "og:url", content: getAbsoluteUrl("/termos") },
    ],
    links: [{ rel: "canonical", href: getAbsoluteUrl("/termos") }],
  }),
  component: () => (
    <Article title="Termos de Uso" description="Última atualização: julho de 2026">
      <h2>1. Aceitação</h2>
      <p>
        Ao acessar o SóComprar, você concorda com estes Termos de Uso e com nossa Política de
        Privacidade.
      </p>
      <h2>2. Natureza do serviço</h2>
      <p>
        O SóComprar é um portal de divulgação de ofertas e não vende produtos diretamente. As
        compras são realizadas nos sites dos marketplaces parceiros, sob suas próprias políticas.
      </p>
      <h2>3. Links de afiliados</h2>
      <p>
        Alguns links podem gerar comissão para o SóComprar. Isso não altera o preço para você. Veja
        mais em nossa página de Divulgação de Afiliados.
      </p>
      <h2>4. Preços e disponibilidade</h2>
      <p>
        Preços mudam com frequência nos marketplaces. Não garantimos que o valor exibido esteja
        sempre atualizado.
      </p>
      <h2>5. Responsabilidade</h2>
      <p>
        Não somos responsáveis por entregas, garantias ou trocas — essas responsabilidades são do
        vendedor final.
      </p>
      <h2>6. Propriedade intelectual</h2>
      <p>
        Todo o conteúdo do site (marca, textos, layout) pertence ao SóComprar, exceto imagens e
        logos de terceiros.
      </p>
      <h2>7. Alterações</h2>
      <p>
        Podemos atualizar estes termos a qualquer momento. A versão vigente é sempre a publicada
        nesta página.
      </p>
    </Article>
  ),
});
