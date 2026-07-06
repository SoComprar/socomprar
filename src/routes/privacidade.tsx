import { createFileRoute } from "@tanstack/react-router";
import { Article } from "@/components/Article";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — SóComprar" },
      { name: "description", content: "Como coletamos, usamos e protegemos seus dados." },
      { property: "og:url", content: "/privacidade" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: () => (
    <Article title="Política de Privacidade" description="Última atualização: julho de 2026">
      <p>
        O SóComprar respeita sua privacidade e segue as diretrizes da Lei Geral de Proteção de Dados
        (LGPD — Lei nº 13.709/2018).
      </p>
      <h2>1. Dados que coletamos</h2>
      <ul>
        <li>Dados de navegação (páginas visitadas, tempo de sessão) via Google Analytics.</li>
        <li>Dados fornecidos voluntariamente em formulários (nome, e-mail).</li>
        <li>Cookies para melhorar a experiência de uso.</li>
      </ul>
      <h2>2. Como usamos os dados</h2>
      <ul>
        <li>Melhorar o site e as ofertas exibidas.</li>
        <li>Enviar comunicações quando autorizado.</li>
        <li>Cumprir obrigações legais.</li>
      </ul>
      <h2>3. Compartilhamento</h2>
      <p>Não vendemos seus dados. Podemos compartilhá-los apenas com provedores de análise (ex.: Google) sob obrigações contratuais.</p>
      <h2>4. Seus direitos</h2>
      <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail contato@socomprar.com.br.</p>
      <h2>5. Cookies</h2>
      <p>Utilizamos cookies próprios e de terceiros. Você pode desativá-los no seu navegador.</p>
    </Article>
  ),
});
