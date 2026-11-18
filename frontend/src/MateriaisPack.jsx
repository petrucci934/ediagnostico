import { useId } from "react";
import { ShoppingBag, ExternalLink } from "lucide-react";
import {
  gruposMontagemPack,
  listaCompletaPack,
  linkCompraPack,
} from "./itensMontagemPack";
import "./MateriaisPack.css";

const resumos = {
  "soldadora-pontos":
    "Para unir as conexões metálicas aos polos. Confira quais materiais e espessuras o equipamento suporta.",
  "kit-estanho":
    "Estanho e pasta para aplicações em cabos e eletrônica. Não usar como indicação de solda direta nos polos das células.",
  parafusadeira:
    "Opcional para parafusos de caixas e suportes. Confira as pontas e o controle de torque.",
  multimetro:
    "Para medições elétricas. Confira os limites, a proteção e as pontas de prova antes de escolher.",
  "multimetro-azul":
    "Outra opção de multímetro; não é necessário comprar os dois. Confira as especificações no anúncio.",
};

export default function MateriaisPack({ resultado }) {
  const id = useId();
  const lista = linkCompraPack(listaCompletaPack);
  const itens = gruposMontagemPack.flatMap((grupo) =>
    grupo.itens.map((item) => ({
      ...item,
      links: item.links.map(linkCompraPack).filter(Boolean),
    })),
  );
  const produtos = itens.filter((item) => item.links.length > 0);
  const materiais = itens.filter((item) => item.links.length === 0);
  return (
    <section className="mp-materiais" aria-labelledby={`${id}-titulo`}>
      <header className="mp-materiais-cabecalho">
        <ShoppingBag size={25} aria-hidden="true" />
        <div>
          <h3 id={`${id}-titulo`}>O que você precisa — peças e ferramentas</h3>
          <p>Veja a função de cada item e acesse o produto na loja.</p>
        </div>
      </header>
      <div className="mp-materiais-conteudo">
        {resultado && (
          <p className="mp-materiais-contexto">
            Exemplo em estudo:{" "}
            <strong>
              {resultado.configuracao} · {resultado.celulas} células
            </strong>
            . Confira a compatibilidade de cada produto com seu projeto.
          </p>
        )}
        {produtos.length > 0 && (
          <section aria-labelledby={`${id}-produtos`}>
            <h4 id={`${id}-produtos`} className="mp-materiais-subtitulo">
              Ferramentas e consumíveis — links de compra
            </h4>
            <ul className="mp-produtos-lista">
              {produtos.map((item) => (
                <li key={item.id}>
                  {item.imagem && (
                    <img
                      className="mp-produto-imagem"
                      src={item.imagem}
                      alt={`Foto de ${item.produto || item.nome}`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.hidden = true;
                      }}
                    />
                  )}
                  <div className="mp-produto-texto">
                    <h5>{item.produto || item.nome}</h5>
                    <p>{resumos[item.id] || item.descricao}</p>
                  </div>
                  <div className="mp-materiais-links">
                    {item.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        aria-label={`Ver ${item.produto || item.nome} na ${link.loja} (abre em nova aba)`}
                      >
                        Ver no {link.loja}
                        <ExternalLink size={16} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {materiais.length > 0 && (
          <section aria-labelledby={`${id}-materiais`}>
            <h4 id={`${id}-materiais`} className="mp-materiais-subtitulo">
              Peças e outros materiais
            </h4>
            <p className="mp-materiais-pendente">
              Também considere estes itens. Os links serão adicionados em breve.
            </p>
            <ul className="mp-materiais-pendentes">
              {materiais.map((item) => (
                <li key={item.id}>{item.nome}</li>
              ))}
            </ul>
          </section>
        )}
        {lista && (
          <div className="mp-materiais-links mp-lista-completa">
            <a
              href={lista.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
            >
              Ver lista completa no {lista.loja}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        )}
        <footer className="mp-materiais-rodape">
          <p>
            Links de afiliado: o E-Diagnóstico poderá receber uma comissão pelas
            compras realizadas por esses links.
          </p>
          <p>
            Lista educativa. A seleção e o dimensionamento dependem do projeto e
            das fichas técnicas; os produtos não têm compatibilidade automática
            com a simulação.
          </p>
        </footer>
      </div>
    </section>
  );
}
