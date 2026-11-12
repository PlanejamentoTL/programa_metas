// Modal de visualização de uma meta — SOMENTE LEITURA.
// Visual réplica do sistema de monitoramento (modais-css.md), sem campos de edição.
// Recebe a meta já carregada; não faz nenhuma chamada ao Firestore.
// Não exibe o nome do responsável pela atualização (dado pessoal de servidor).
import { useEffect, useId, useRef } from "react";
import { FaEye, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { LAYOUTS } from "../../config/layoutsModal";
import { SEMESTRE_ATUAL } from "../../config/dados";
import {
  statusDe, vazio, exibir, exibirData, exibirPercentual, linkSeguro, porcentagemExecucao,
} from "../../utils/formatacao";
import "./ModalMeta.css";

const STATUS_EXIGEM_DOCUMENTO = ["Concluída", "Não Contemplada"];

// Valor do campo considerando grafias alternativas (`alt`).
function valorCampo(meta, campo) {
  for (const k of [campo.key, ...(campo.alt || [])]) {
    if (!vazio(meta[k])) return meta[k];
  }
  return meta[campo.key];
}

// Caixa de status: cor definida no CSS por data-status; vazio mostra "—".
function CaixaStatus({ meta, campo }) {
  const s = statusDe(meta, campo);
  return (
    <span className="mm-valor mm-status" data-status={s}>
      {s || "—"}
    </span>
  );
}

function Documento({ meta, campo }) {
  const url = linkSeguro(valorCampo(meta, campo));
  const statusAtual = statusDe(meta, `status-${SEMESTRE_ATUAL}`);
  const pendente = !url && STATUS_EXIGEM_DOCUMENTO.includes(statusAtual);
  return (
    <div className="mm-documento">
      {url ? (
        <a className="mm-btn-documento" href={url} target="_blank" rel="noopener noreferrer">
          <FaEye aria-hidden="true" /> Visualizar documentação anexada
        </a>
      ) : (
        <span className="mm-btn-documento" aria-disabled="true">
          <FaEye aria-hidden="true" /> Visualizar documentação anexada
        </span>
      )}
      {url && (
        <span className="mm-doc-icone mm-doc-icone--ok" role="img" aria-label="Documento anexado">
          <FaCheckCircle />
        </span>
      )}
      {pendente && (
        <span className="mm-doc-icone mm-doc-icone--alerta" role="img" aria-label="Documento não anexado">
          <FaExclamationTriangle />
        </span>
      )}
    </div>
  );
}

// Campo com rótulo em cima e caixa rosada embaixo.
function Campo({ campo, meta }) {
  const v = valorCampo(meta, campo);
  let conteudo;
  if (campo.tipo === "documento") {
    conteudo = <Documento meta={meta} campo={campo} />;
  } else if (campo.tipo === "data") {
    conteudo = <span className="mm-valor">{exibirData(v)}</span>;
  } else {
    conteudo = (
      <span className={`mm-valor${campo.largo ? " mm-valor--longo" : ""}`}>{exibir(v)}</span>
    );
  }
  return (
    <div className={`mm-campo${campo.largo ? " mm-campo--largo" : ""}`}>
      <span className="mm-rotulo">{campo.label}:</span>
      {conteudo}
    </div>
  );
}

function Grade({ campos, meta }) {
  return (
    <div className="mm-grade">
      {campos.map((c) => <Campo key={c.key} campo={c} meta={meta} />)}
    </div>
  );
}

// Texto branco simples sobre o bloco azul (sem caixa).
function Info({ campo, meta }) {
  return (
    <div className="mm-info">
      <h4>{campo.label}:</h4>
      <p>{exibir(valorCampo(meta, campo))}</p>
    </div>
  );
}

function ItensInfo({ itens, meta }) {
  return itens.map((item, i) =>
    Array.isArray(item) ? (
      <div key={i} className="mm-linha">
        {item.map((c) => <Info key={c.key} campo={c} meta={meta} />)}
      </div>
    ) : (
      <Info key={item.key} campo={item} meta={meta} />
    )
  );
}

function Etapas({ meta, mostrarPorcentagem }) {
  const nums = [1, 2, 3, 4, 5];
  const algumaPreenchida = nums.some((n) =>
    ["descricao", "peso", "previsao", "status"].some((tipo) => !vazio(meta[`${tipo}-etapa${n}`]))
  );
  return (
    <section className="mm-etapas">
      <div className="mm-etapas-cabecalho">
        <h2 className="mm-secao">Etapas da Meta</h2>
        {mostrarPorcentagem && (
          <div className="mm-porcentagem">
            <strong>{porcentagemExecucao(meta)}%</strong>
            <small>Porcentagem de Conclusão</small>
          </div>
        )}
      </div>
      {!algumaPreenchida ? (
        <p>Etapas não cadastradas.</p>
      ) : (
        nums.map((n) => (
          <article key={n} className="mm-etapa">
            <h3 className="mm-etapa-titulo">Etapa {n}</h3>
            <div className="mm-etapa-campos">
              <div className="mm-etapa-campo">
                <span className="mm-rotulo">Descrição:</span>
                <span className="mm-texto">{exibir(meta[`descricao-etapa${n}`])}</span>
              </div>
              <div className="mm-etapa-campo mm-etapa-peso">
                <span className="mm-rotulo">Peso:</span>
                <span>{exibirPercentual(meta[`peso-etapa${n}`])}</span>
              </div>
              <div className="mm-etapa-campo">
                <span className="mm-rotulo">Previsão:</span>
                <span className="mm-valor">{exibirData(meta[`previsao-etapa${n}`])}</span>
              </div>
              <div className="mm-etapa-campo">
                <span className="mm-rotulo">Status:</span>
                <CaixaStatus meta={meta} campo={`status-etapa${n}`} />
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  );
}

function Secao({ secao, meta, semestres }) {
  if (secao.destaque === "compacto") {
    return (
      <section className="mm-destaque mm-destaque--compacto">
        <h2 className="mm-secao">{secao.titulo}</h2>
        <ItensInfo itens={secao.linhas} meta={meta} />
      </section>
    );
  }

  const campos = secao.porSemestre
    ? semestres.map((p) => ({ label: `${secao.rotulo} ${p}`, key: `${secao.porSemestre}-${p}`, tipo: "texto" }))
    : secao.campos;

  const conteudo = (
    <>
      {!secao.semTitulo && <h2 className="mm-secao">{secao.titulo}</h2>}
      <Grade campos={campos} meta={meta} />
    </>
  );

  return secao.destaque ? <section className="mm-destaque">{conteudo}</section> : conteudo;
}

export default function ModalMeta({ colecao, meta, onClose }) {
  const tituloId = useId();
  const ref = useRef(null);
  const layout = LAYOUTS[colecao];

  useEffect(() => {
    if (!meta) return;
    const anterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // impede a página de rolar por trás
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowAnterior;
      anterior?.focus?.();
    };
  }, [meta, onClose]);

  if (!meta || !layout) return null;
  const semestres = layout.semestres.filter((p) => p <= SEMESTRE_ATUAL);

  return (
    <div className="mm-overlay" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="mm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mm-header">
          <h2 id={tituloId}>Dados da Meta - {layout.titulo}</h2>
          <button type="button" className="mm-fechar" aria-label="Fechar" onClick={onClose}>✕</button>
        </header>

        <div className="mm-conteudo">
          <section className="mm-destaque">
            <div className="mm-titulo-meta">
              <span className="mm-numero">{exibir(meta.numero)}</span>
              <span className="mm-separador">-</span>
              <h3>{exibir(meta[layout.campoTitulo])}</h3>
            </div>
            <ItensInfo itens={layout.cabecalho} meta={meta} />
          </section>

          <h2 className="mm-secao">Histórico de Status</h2>
          <div className="mm-grade">
            {semestres.map((p) => (
              <div key={p} className="mm-campo">
                <span className="mm-rotulo">Status {p}</span>
                <CaixaStatus meta={meta} campo={`status-${p}`} />
              </div>
            ))}
          </div>

          <Etapas meta={meta} mostrarPorcentagem={layout.porcentagem} />

          {layout.secoes.map((s) => (
            <Secao key={s.titulo} secao={s} meta={meta} semestres={semestres} />
          ))}

          <footer className="mm-rodape">
            <span><b>Última atualização:</b> {exibirData(meta["data-ultima-atualizacao"])}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
