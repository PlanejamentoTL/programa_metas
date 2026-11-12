# Gráfico de evolução dos status e modais de visualização das metas

Guia para implementar, no sistema de divulgação, duas funcionalidades que já existem no sistema de monitoramento:

1. **Gráfico de barras empilhadas** com a evolução dos status das metas a cada semestre.
2. **Modais de visualização** de cada meta, com um layout por plano. **Somente leitura:** os valores aparecem como texto, sem inputs, selects, textareas, botões de salvar ou upload.

> Leia junto com `padrao-dados-firestore.md`, que descreve as coleções, os nomes dos campos, os formatos e as regras de acesso somente leitura ao Firestore.
>
> Os exemplos usam React + `chart.js`/`react-chartjs-2`, as mesmas bibliotecas do sistema de monitoramento. A lógica (contagem, ordem dos semestres, cores, campos de cada modal) não depende do framework.

---

## 1. Constantes compartilhadas

Centralize em um arquivo, por exemplo `src/config/metas.js`:

```js
// Último semestre com dados. Atualize a cada semestre (no monitoramento: src/config/periodoAtual.js).
export const PERIODO_ATUAL = "2026-2";

export const STATUS = ["Concluída", "Em Partes", "Planejada", "Não Contemplada"];
export const SEM_STATUS = "Sem status"; // campo vazio, ausente ou com valor fora da lista acima

// Cores usadas no painel do monitoramento (mantenha iguais para a identidade visual bater)
export const CORES_STATUS = {
  "Concluída": "#4CAF50",
  "Em Partes": "#0060a3",
  "Planejada": "#ffff00",
  "Não Contemplada": "#ea4335",
  [SEM_STATUS]: "#c9c9c9",
};

// Normaliza qualquer valor de status para uma das 5 categorias
export function categoriaStatus(valor) {
  const s = String(valor ?? "").trim();
  return STATUS.includes(s) ? s : SEM_STATUS;
}
```

> ⚠️ O amarelo `#ffff00` tem baixo contraste com texto branco ou com o fundo claro. Nos selos de status (seção 3.3), use texto escuro sobre ele.

---

## 2. Gráfico de evolução dos status por semestre

### 2.1 O que o gráfico mostra

- **Eixo X:** os semestres (`2025-1`, `2025-2`, `2026-1`, …) que existem nos documentos do plano, até `PERIODO_ATUAL`.
- **Eixo Y:** a quantidade de metas.
- **Cada barra** é um semestre, empilhada em 5 segmentos: Concluída, Em Partes, Planejada, Não Contemplada e Sem status.
- **Tooltip:** ao passar o mouse sobre uma barra, aparecem os 5 status daquele semestre, com a quantidade e o percentual sobre o total de metas.
- **Legenda:** fica embaixo do gráfico, e clicar em um item esconde aquele status.

Todas as barras somam o mesmo total, que é o número de metas filtradas. Assim fica visível como a distribuição muda entre os semestres.

### 2.2 Regras de cálculo

1. **Descobrir os semestres:** percorra as chaves de todos os documentos e pegue as que seguem `^status-(\d{4}-[12])$`.
   - Não confunda com `status-etapa1` … `status-etapa5`, que não passam nessa regex.
2. **Ordenar e filtrar:** ordene os semestres em ordem alfabética (o formato `AAAA-S` já fica em ordem cronológica) e mantenha só os `<= PERIODO_ATUAL`. Semestres futuros existem no banco, mas estão vazios.
3. **Contar:** para cada semestre `p` e cada meta, some 1 em `categoriaStatus(meta["status-" + p])`.
4. **Aplicar os mesmos filtros da tela:** a contagem deve usar exatamente a lista que o usuário está vendo, por exemplo filtrada por plano e por secretaria.

Faixa de semestres de cada coleção:

| Coleção | Semestres de status |
|---|---|
| `plano-governo` | 2025-1 a 2028-2 |
| `plano-diretor`, `plano-primeira-infancia`, `plano-tres-lagoas-sustentavel`, `plano-setorial` | 2025-1 a 2028-2 |
| `plano-plurianual`, `ldo-2026` | 2026-1 a 2029-2 |

### 2.3 Funções de cálculo

```js
import { PERIODO_ATUAL, STATUS, SEM_STATUS, categoriaStatus } from "../config/metas";

export function semestresDoPlano(metas) {
  const set = new Set();
  metas.forEach((m) =>
    Object.keys(m).forEach((k) => {
      const r = k.match(/^status-(\d{4}-[12])$/);
      if (r) set.add(r[1]);
    })
  );
  return [...set].sort().filter((p) => p <= PERIODO_ATUAL);
}

export function evolucaoStatus(metas) {
  const semestres = semestresDoPlano(metas);
  const contagem = semestres.map((p) => {
    const c = Object.fromEntries([...STATUS, SEM_STATUS].map((s) => [s, 0]));
    metas.forEach((m) => c[categoriaStatus(m[`status-${p}`])]++);
    return c;
  });
  return { semestres, contagem };
}
```

### 2.4 Componente

Dependências: `npm i chart.js react-chartjs-2`

```jsx
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import { STATUS, SEM_STATUS, CORES_STATUS } from "../config/metas";
import { evolucaoStatus } from "../utils/evolucao";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function GraficoEvolucaoStatus({ metas = [] }) {
  const { semestres, contagem } = useMemo(() => evolucaoStatus(metas), [metas]);
  const total = metas.length;

  if (!total || !semestres.length) {
    return <p className="grafico-vazio">Sem dados de status para exibir.</p>;
  }

  const data = {
    labels: semestres,
    datasets: [...STATUS, SEM_STATUS].map((s) => ({
      label: s,
      data: contagem.map((c) => c[s]),
      backgroundColor: CORES_STATUS[s],
      borderColor: "#fff",
      borderWidth: { top: 2 },   // linha branca separando os segmentos
      borderSkipped: "bottom",
      maxBarThickness: 48,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,          // a altura vem do contêiner
    interaction: { mode: "index", intersect: false }, // tooltip mostra o semestre inteiro
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0 },         // só números inteiros
        grid: { color: "rgba(0,0,0,0.06)" },
        title: { display: true, text: "Quantidade de metas" },
      },
    },
    plugins: {
      legend: { position: "bottom" },
      // Se o projeto registrar chartjs-plugin-datalabels globalmente, desligue aqui:
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y;
            const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.dataset.label}: ${v} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <figure className="grafico-evolucao" aria-label="Evolução dos status das metas por semestre">
      <Bar data={data} options={options} />
    </figure>
  );
}
```

```css
.grafico-evolucao { position: relative; height: 320px; width: 100%; margin: 0; }
@media (max-width: 600px) { .grafico-evolucao { height: 260px; } }
```

Uso: `<GraficoEvolucaoStatus metas={metasFiltradas} />`

### 2.5 Acessibilidade e alternativa em tabela

O canvas não é lido por leitores de tela. Ofereça também uma tabela com os mesmos números, que pode ficar visível ou num `<details>`:

```jsx
<details>
  <summary>Ver dados em tabela</summary>
  <table>
    <thead><tr><th>Semestre</th>{[...STATUS, SEM_STATUS].map((s) => <th key={s}>{s}</th>)}</tr></thead>
    <tbody>
      {semestres.map((p, i) => (
        <tr key={p}><td>{p}</td>{[...STATUS, SEM_STATUS].map((s) => <td key={s}>{contagem[i][s]}</td>)}</tr>
      ))}
    </tbody>
  </table>
</details>
```

### 2.6 Gráfico complementar (opcional): status do semestre atual

O painel do monitoramento também tem um gráfico de rosca (`Doughnut`) com a distribuição do semestre `PERIODO_ATUAL`. Ele usa as mesmas 5 categorias, incluindo "Sem status" em `#c9c9c9`, e os mesmos rótulos de percentual. Para reproduzi-lo, conte `categoriaStatus(meta["status-" + PERIODO_ATUAL])`.

---

## 3. Modais de visualização das metas (somente leitura)

### 3.1 Qual modal abrir

| Coleção | Layout |
|---|---|
| `plano-governo` | **Plano de Governo** |
| `plano-plurianual` | **PPA** |
| `ldo-2026` | **LDO** |
| `plano-diretor`, `plano-primeira-infancia`, `plano-tres-lagoas-sustentavel`, `plano-setorial` | **Planos gerais** |

Na listagem, o título de cada meta é `numero` mais `objetivo` no Plano de Governo, e `numero` mais `meta` nos demais planos.

### 3.2 Regras de exibição

- **Nada editável:** não use `<input>`, `<select>`, `<textarea>`, `contentEditable`, `readOnly` ou `disabled`. Use texto: `<p>`, `<span>`, `<dl>/<dt>/<dd>`, tabelas e selos.
- **Sem escrita no banco:** o modal recebe o objeto da meta já carregado e não faz nenhuma chamada ao Firestore. Não existe botão "Salvar" nem upload.
- **Valor vazio:** mostre `—` (travessão) para `undefined`, `null` ou string vazia. Não esconda o rótulo, para que o layout fique igual entre as metas.
- **Texto, não HTML:** renderize sempre como texto (o React já escapa). Nunca use `dangerouslySetInnerHTML` ou `innerHTML` com dados do banco.
- **Quebras de linha:** textos longos (detalhamento, plano de ação, informações adicionais, justificativa) podem ter `\n`. Use `white-space: pre-line`.
- **Semestres futuros:** no histórico de status e no resultado do indicador, mostre só os semestres `<= PERIODO_ATUAL`. Os futuros estão vazios e só poluiriam a tela. Se preferir mostrar todos, use `—` nos vazios.
- **Fechar o modal:** pelo botão ✕, pela tecla `Esc` e pelo clique no fundo escurecido.
- **Acessibilidade:** use `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para o título. Leve o foco para o modal ao abrir e devolva ao elemento de origem ao fechar.

### 3.3 Formatação dos valores

```js
import { CORES_STATUS, categoriaStatus } from "../config/metas";

export const vazio = (v) => v === undefined || v === null || String(v).trim() === "";
export const texto = (v) => (vazio(v) ? "—" : String(v).trim());

// Datas: aceita ISO (AAAA-MM-DD), dd/mm/aaaa, "dd/mm/aaaa, hh:mm:ss" ou Timestamp do Firestore
export function data(v) {
  if (vazio(v)) return "—";
  if (typeof v?.toDate === "function") return v.toDate().toLocaleDateString("pt-BR");
  const s = String(v).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return s; // já está em dd/mm/aaaa (com ou sem hora) ou em formato livre: mostra como veio
}

// Peso das etapas e porcentagem: "20" -> "20%"
export const percentual = (v) => (vazio(v) ? "—" : String(v).trim().replace(/%?$/, "%"));

// Só aceita links http(s) — evita "javascript:" e similares vindos do banco
export function linkSeguro(v) {
  try {
    const u = new URL(String(v).trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

// Selo colorido de status
export function SeloStatus({ valor }) {
  const cat = categoriaStatus(valor);
  const corTextoEscuro = cat === "Planejada" || cat === "Sem status";
  return (
    <span
      className="selo-status"
      style={{ background: CORES_STATUS[cat], color: corTextoEscuro ? "#222" : "#fff" }}
    >
      {cat}
    </span>
  );
}
```

> Valores numéricos e financeiros vêm como **string** do banco, às vezes já formatados (`"R$ 1.000,00"`, `"1000"`, `"10%"`). Mostre como vieram. Se quiser formatar moeda, converta só quando a string for um número puro (`/^\d+([.,]\d+)?$/`) e mostre o original nos demais casos.

### 3.4 Blocos comuns a todos os modais

**Cabeçalho:** `numero` em destaque, seguido do título (`objetivo` no Plano de Governo e `meta` nos outros).

**Histórico de status:** grade com um selo por semestre. Rótulo `Status AAAA-S`, campo `status-AAAA-S`.

**Etapas da Meta (5 etapas):** existem em todos os planos. Para cada `N` de 1 a 5, mostre um cartão com:

| Rótulo | Campo | Formato |
|---|---|---|
| Etapa N – Descrição | `descricao-etapaN` | texto |
| Peso | `peso-etapaN` | `percentual()` |
| Previsão | `previsao-etapaN` | `data()` (gravado como `AAAA-MM-DD`) |
| Status | `status-etapaN` | `SeloStatus` |

Se as 5 etapas estiverem vazias, mostre só a frase "Etapas não cadastradas" em vez de 5 cartões vazios.

**Porcentagem de Conclusão** (só no Plano de Governo e nos Planos gerais): fica alinhada à direita do título "Etapas da Meta", em **negrito**, com a legenda pequena "Porcentagem de Conclusão" embaixo. Calcule na hora em vez de confiar em `porcentagem-execucao`, que só é atualizado quando alguém salva a meta:

```js
export function porcentagemConclusao(meta) {
  let total = 0;
  for (let n = 1; n <= 5; n++) {
    if (meta[`status-etapa${n}`] !== "Concluída") continue;
    const peso = parseFloat(String(meta[`peso-etapa${n}`] ?? "").replace(",", "."));
    if (Number.isFinite(peso)) total += peso;
  }
  return `${Math.round(total * 100) / 100}%`;
}
```

**Documento comprobatório:** campo `documentos-comprobatorios`, um link do Google Drive.
- Mostre um **botão/link "Visualizar documentação anexada"** que abre em nova aba (`target="_blank" rel="noopener noreferrer"`), com a URL passada por `linkSeguro()`.
- Sem link válido, mostre o botão desabilitado ou o texto "Nenhum documento anexado".
- O botão de **envio** de documento **não** existe na divulgação.
- Opcional: ao lado, um ícone ✓ quando houver documento. Se o status atual for "Concluída" ou "Não Contemplada" e não houver documento, mostre um ícone de alerta. No monitoramento, esses dois status exigem documento.

> ⚠️ O arquivo do Drive precisa estar compartilhado como "qualquer pessoa com o link" para abrir para o público. Confirme isso com quem gerencia a pasta.

**Rodapé:** "Última atualização" (`data-ultima-atualizacao`, com `data()`). O responsável pela atualização (`responsavel-ultima-atualizacao` / `responsavel-ultimo-envio`) é um **nome de servidor**: avalie se ele deve aparecer num site público. A recomendação é **não exibir**.

### 3.5 Campos de cada layout

A ordem das seções segue a dos modais do monitoramento.

#### Plano de Governo (`plano-governo`)

| Seção | Rótulo | Campo |
|---|---|---|
| Cabeçalho | Número / Título | `numero` / `objetivo` |
| Cabeçalho | Objetivo | `objetivo` |
| Cabeçalho | ODS Vinculados | `ods-vinculados` (⚠️ pode estar como `ods-vinculado`) |
| Histórico de Status | Status 2025-1 … 2028-2 | `status-AAAA-S` |
| Etapas da Meta | 5 etapas + Porcentagem de Conclusão | ver 3.4 |
| Detalhes | Previsão de Conclusão | `data-conclusao` (data) |
| Detalhes | Documento comprobatório | `documentos-comprobatorios` |
| Detalhes | Justificativa de não conclusão | `justificativa-nao-conclusao` |
| Detalhes | Informações adicionais | `informacoes-adicionais` |
| Rodapé | Última atualização | `data-ultima-atualizacao` |

#### Planos gerais (`plano-diretor`, `plano-primeira-infancia`, `plano-tres-lagoas-sustentavel`, `plano-setorial`)

| Seção | Rótulo | Campo |
|---|---|---|
| Cabeçalho | Número / Título | `numero` / `meta` |
| Cabeçalho | Detalhamento | `detalhamento` |
| Cabeçalho | ODS Vinculados | `ods-vinculados` |
| Cabeçalho | Indicador | `indicador` |
| Cabeçalho | Unidade de Medida | `un-medida` |
| Histórico de Status | Status 2025-1 … 2028-2 | `status-AAAA-S` |
| Etapas da Meta | 5 etapas + Porcentagem de Conclusão | ver 3.4 |
| Meta do Indicador | Meta Indicador 2025 … 2028 | `meta-indicador-AAAA` |
| Resultado do Indicador | Resultado Indicador 2025-1 … 2028-2 | `resultado-indicador-AAAA-S` |
| Meta Financeira Anual | Meta Financeira 2025 … 2028 | `meta-financeira-AAAA` |
| Detalhes | Previsão de Conclusão | `data-conclusao` (data) |
| Detalhes | Plano de ação | `plano-acao` |
| Detalhes | Documento comprobatório | `documentos-comprobatorios` |
| Detalhes | Justificativa de não conclusão | `justificativa-nao-conclusao` |
| Detalhes | Informações Adicionais | `informacoes-adicionais` |
| Rodapé | Última atualização | `data-ultima-atualizacao` |

#### PPA (`plano-plurianual`)

| Seção | Rótulo | Campo |
|---|---|---|
| Cabeçalho | Número / Título | `numero` / `meta` |
| Cabeçalho | Detalhamento | `detalhamento` |
| Cabeçalho | Objetivo do Plano de Governo Vinculado | `objetivo` |
| Cabeçalho | Indicador | `indicador` |
| Cabeçalho | Unidade de medida | `un-medida` |
| Histórico de Status | Status 2026-1 … 2029-2 | `status-AAAA-S` |
| Etapas da Meta | 5 etapas (sem porcentagem) | ver 3.4 |
| Meta do Indicador | Meta Indicador 2026 … 2029 | `meta-fisica-AAAA` |
| Resultado do Indicador | Resultado Indicador 2026-1 … 2029-2 | `resultado-indicador-AAAA-S` |
| Detalhes | Documento comprobatório | `documentos-comprobatorios` |
| Detalhes | Justificativa de não conclusão | `justificativa-nao-conclusao` |
| Detalhes | Informações adicionais | `informacoes-adicionais` |
| Dados orçamentários | Tipo Meta / Custeio/Investimento / Fundo | `tipo-meta` / `custeio-investimento` / `fundo` |
| Dados orçamentários | Programa / Projeto Atividade / Função / Subfunção | `programa` / `projeto-atividade` / `funcao` / `subfuncao` |
| Dados orçamentários | Meta previamente planejada | `meta-previamente-planejada` |
| Dados orçamentários | Meta física 2026 … 2029 | `meta-fisica-AAAA` |
| Dados orçamentários | Meta financeira 2026 … 2029 | `meta-financeira-AAAA` |
| Rodapé | Última atualização | `data-ultima-atualizacao` |

> No monitoramento, a meta física aparece duas vezes: em "Meta do Indicador" e nos dados orçamentários. Na divulgação, basta uma das duas.

#### LDO (`ldo-2026`)

É igual ao PPA, **sem o campo `fundo`**. No monitoramento, o histórico de status da LDO mostra só 2026-1 e 2026-2, e o resultado do indicador também. Com a regra "até `PERIODO_ATUAL`", o resultado é o mesmo.

### 3.6 Implementação sugerida: um modal só, guiado por configuração

Em vez de 4 componentes quase iguais, descreva cada layout como dados e use um único componente para renderizar.

```js
// src/config/layoutsModal.js
const semestres = (de, ate) => {
  const out = [];
  for (let a = de; a <= ate; a++) out.push(`${a}-1`, `${a}-2`);
  return out;
};
const anos = (de, ate) => Array.from({ length: ate - de + 1 }, (_, i) => de + i);

const t = (label, key) => ({ label, key, tipo: "texto" });
const d = (label, key) => ({ label, key, tipo: "data" });

const DETALHES_FINAIS = [
  { tipo: "documento", label: "Documento comprobatório", key: "documentos-comprobatorios" },
  t("Justificativa de não conclusão", "justificativa-nao-conclusao"),
  t("Informações adicionais", "informacoes-adicionais"),
];

const ORCAMENTO = (comFundo) => [
  t("Tipo Meta", "tipo-meta"),
  t("Custeio/Investimento", "custeio-investimento"),
  ...(comFundo ? [t("Fundo", "fundo")] : []),
  t("Programa", "programa"),
  t("Projeto Atividade", "projeto-atividade"),
  t("Função", "funcao"),
  t("Subfunção", "subfuncao"),
  t("Meta previamente planejada", "meta-previamente-planejada"),
  ...anos(2026, 2029).map((a) => t(`Meta financeira ${a}`, `meta-financeira-${a}`)),
];

const PPA_LDO = (titulo, comFundo) => ({
  titulo,
  campoTitulo: "meta",
  porcentagem: false,
  cabecalho: [
    t("Detalhamento", "detalhamento"),
    t("Objetivo do Plano de Governo Vinculado", "objetivo"),
    t("Indicador", "indicador"),
    t("Unidade de medida", "un-medida"),
  ],
  semestres: semestres(2026, 2029),
  secoes: [
    { titulo: "Meta do Indicador", campos: anos(2026, 2029).map((a) => t(`Meta Indicador ${a}`, `meta-fisica-${a}`)) },
    { titulo: "Resultado do Indicador", porSemestre: "resultado-indicador", rotulo: "Resultado Indicador" },
    { titulo: "Detalhes", campos: DETALHES_FINAIS },
    { titulo: "Dados orçamentários", campos: ORCAMENTO(comFundo) },
  ],
});

const PLANOS_GERAIS = {
  titulo: "Planos gerais",
  campoTitulo: "meta",
  porcentagem: true,
  cabecalho: [
    t("Detalhamento", "detalhamento"),
    t("ODS Vinculados", "ods-vinculados"),
    t("Indicador", "indicador"),
    t("Unidade de Medida", "un-medida"),
  ],
  semestres: semestres(2025, 2028),
  secoes: [
    { titulo: "Meta do Indicador", campos: anos(2025, 2028).map((a) => t(`Meta Indicador ${a}`, `meta-indicador-${a}`)) },
    { titulo: "Resultado do Indicador", porSemestre: "resultado-indicador", rotulo: "Resultado Indicador" },
    { titulo: "Meta Financeira Anual", campos: anos(2025, 2028).map((a) => t(`Meta Financeira ${a}`, `meta-financeira-${a}`)) },
    { titulo: "Detalhes", campos: [d("Previsão de Conclusão", "data-conclusao"), t("Plano de ação", "plano-acao"), ...DETALHES_FINAIS] },
  ],
};

export const LAYOUTS = {
  "plano-governo": {
    titulo: "Plano de Governo",
    campoTitulo: "objetivo",
    porcentagem: true,
    cabecalho: [t("Objetivo", "objetivo"), t("ODS Vinculados", "ods-vinculados")],
    semestres: semestres(2025, 2028),
    secoes: [
      { titulo: "Detalhes", campos: [d("Previsão de Conclusão", "data-conclusao"), ...DETALHES_FINAIS] },
    ],
  },
  "plano-plurianual": PPA_LDO("PPA 2026-2029", true),
  "ldo-2026": PPA_LDO("LDO 2026", false),
  "plano-diretor": PLANOS_GERAIS,
  "plano-primeira-infancia": PLANOS_GERAIS,
  "plano-tres-lagoas-sustentavel": PLANOS_GERAIS,
  "plano-setorial": PLANOS_GERAIS,
};
```

```jsx
// src/components/ModalMeta.jsx — somente leitura
import { useEffect, useId, useRef } from "react";
import { LAYOUTS } from "../config/layoutsModal";
import { PERIODO_ATUAL } from "../config/metas";
import { texto, data, percentual, linkSeguro, SeloStatus, vazio } from "../utils/formatacao";
import { porcentagemConclusao } from "../utils/etapas";

function Valor({ campo, meta }) {
  const v = meta[campo.key];
  if (campo.tipo === "data") return <span>{data(v)}</span>;
  if (campo.tipo === "documento") {
    const url = linkSeguro(v);
    return url ? (
      <a className="btn-documento" href={url} target="_blank" rel="noopener noreferrer">
        Visualizar documentação anexada
      </a>
    ) : (
      <span className="sem-documento">Nenhum documento anexado</span>
    );
  }
  return <span className="texto-longo">{texto(v)}</span>;
}

function ListaCampos({ campos, meta }) {
  return (
    <dl className="grade-campos">
      {campos.map((c) => (
        <div key={c.key} className="campo">
          <dt>{c.label}</dt>
          <dd><Valor campo={c} meta={meta} /></dd>
        </div>
      ))}
    </dl>
  );
}

function Etapas({ meta, mostrarPorcentagem }) {
  const nums = [1, 2, 3, 4, 5];
  const algumaPreenchida = nums.some((n) =>
    ["descricao", "peso", "previsao", "status"].some((tipo) => !vazio(meta[`${tipo}-etapa${n}`]))
  );
  return (
    <section>
      <header className="etapas-cabecalho">
        <h3>Etapas da Meta</h3>
        {mostrarPorcentagem && (
          <div className="etapas-porcentagem">
            <strong>{porcentagemConclusao(meta)}</strong>
            <small>Porcentagem de Conclusão</small>
          </div>
        )}
      </header>
      {!algumaPreenchida ? (
        <p>Etapas não cadastradas.</p>
      ) : (
        <div className="etapas-grade">
          {nums.map((n) => (
            <article key={n} className="etapa-card">
              <h4>Etapa {n}</h4>
              <p className="texto-longo">{texto(meta[`descricao-etapa${n}`])}</p>
              <p><b>Peso:</b> {percentual(meta[`peso-etapa${n}`])}</p>
              <p><b>Previsão:</b> {data(meta[`previsao-etapa${n}`])}</p>
              <SeloStatus valor={meta[`status-etapa${n}`]} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ModalMeta({ plano, meta, onClose }) {
  const tituloId = useId();
  const ref = useRef(null);
  const layout = LAYOUTS[plano];

  useEffect(() => {
    if (!meta) return;
    const anterior = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      anterior?.focus?.();
    };
  }, [meta, onClose]);

  if (!meta || !layout) return null;
  const semestres = layout.semestres.filter((p) => p <= PERIODO_ATUAL);

  return (
    <div className="modal-fundo" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-topo">
          <span className="modal-plano">{layout.titulo}</span>
          <button type="button" aria-label="Fechar" onClick={onClose}>✕</button>
        </header>

        <div className="modal-conteudo">
          <h2 id={tituloId}>
            <span className="meta-numero">{texto(meta.numero)}</span> – {texto(meta[layout.campoTitulo])}
          </h2>
          <ListaCampos campos={layout.cabecalho} meta={meta} />

          <section>
            <h3>Histórico de Status</h3>
            <dl className="grade-status">
              {semestres.map((p) => (
                <div key={p} className="campo">
                  <dt>Status {p}</dt>
                  <dd><SeloStatus valor={meta[`status-${p}`]} /></dd>
                </div>
              ))}
            </dl>
          </section>

          <Etapas meta={meta} mostrarPorcentagem={layout.porcentagem} />

          {layout.secoes.map((s) => (
            <section key={s.titulo}>
              <h3>{s.titulo}</h3>
              <ListaCampos
                meta={meta}
                campos={
                  s.porSemestre
                    ? semestres.map((p) => ({ label: `${s.rotulo} ${p}`, key: `${s.porSemestre}-${p}`, tipo: "texto" }))
                    : s.campos
                }
              />
            </section>
          ))}

          <footer className="modal-rodape">
            Última atualização: {data(meta["data-ultima-atualizacao"])}
          </footer>
        </div>
      </div>
    </div>
  );
}
```

Uso:

```jsx
const [metaAberta, setMetaAberta] = useState(null);
// na listagem: onClick={() => setMetaAberta(meta)}
<ModalMeta plano={planoSelecionado} meta={metaAberta} onClose={() => setMetaAberta(null)} />
```

> `onClose` entra na dependência do `useEffect`. Passe uma função estável (`useCallback`) para o efeito não rodar a cada render.

### 3.7 CSS base

```css
.modal-fundo { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex;
  align-items: center; justify-content: center; padding: 16px; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; width: min(960px, 100%); max-height: 90vh;
  overflow-y: auto; outline: none; }
.modal-topo { display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-bottom: 1px solid #e5e5e5; position: sticky; top: 0; background: #fff; }
.modal-conteudo { padding: 20px; display: grid; gap: 24px; }
.meta-numero { font-weight: 700; }

.grade-campos, .grade-status { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px 20px; margin: 0; }
.grade-campos dt, .grade-status dt { font-size: .8rem; color: #666; font-weight: 600; }
.grade-campos dd, .grade-status dd { margin: 4px 0 0; }
.texto-longo { white-space: pre-line; overflow-wrap: anywhere; }

.selo-status { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .8rem; font-weight: 600; }

.etapas-cabecalho { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.etapas-porcentagem { display: flex; flex-direction: column; align-items: flex-end; }
.etapas-porcentagem strong { font-size: 1.5rem; }
.etapas-porcentagem small { font-size: .75rem; color: #666; }
.etapas-grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
.etapa-card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; display: grid; gap: 6px; }
.etapa-card h4, .etapa-card p { margin: 0; }

.btn-documento { display: inline-block; padding: 8px 14px; border-radius: 6px; background: #0060a3;
  color: #fff; text-decoration: none; }
.sem-documento { color: #888; }
.modal-rodape { font-size: .8rem; color: #666; border-top: 1px solid #eee; padding-top: 12px; }

@media (max-width: 600px) {
  .modal { max-height: 100vh; border-radius: 0; }
  .modal-fundo { padding: 0; }
}
```

---

## 4. Checklist de implementação

- [ ] Constantes (`PERIODO_ATUAL`, status, cores) num único arquivo, com o mesmo valor de `PERIODO_ATUAL` do monitoramento.
- [ ] O gráfico usa a mesma lista filtrada que a tela mostra.
- [ ] Semestres descobertos pela regex `^status-(\d{4}-[12])$`, ordenados e limitados a `PERIODO_ATUAL`.
- [ ] Valores fora dos 4 status contam como "Sem status".
- [ ] Tabela alternativa ao gráfico, para acessibilidade.
- [ ] Modal escolhido pela coleção, conforme a tabela 3.1.
- [ ] Nenhum `<input>`, `<select>`, `<textarea>` ou botão de salvar/upload nos modais.
- [ ] Nenhuma escrita no Firestore (`setDoc`, `updateDoc`, `addDoc`, `deleteDoc`) no projeto de divulgação.
- [ ] Valores vazios aparecem como `—`. Datas aparecem em dd/mm/aaaa.
- [ ] Porcentagem de Conclusão calculada pelas etapas (Plano de Governo e Planos gerais).
- [ ] Link do documento validado (`http`/`https`), aberto em nova aba com `rel="noopener noreferrer"`.
- [ ] Decidido se o nome do responsável aparece ou não (recomendação: não exibir).
- [ ] Modal fecha por ✕, `Esc` e clique fora, com foco gerenciado.
- [ ] Testado em celular (≈ 375 px de largura).
