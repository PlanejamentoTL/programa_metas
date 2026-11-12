# Visual dos modais de metas: guia de CSS

Use este guia para que os modais do sistema de divulgação fiquem **iguais aos do sistema de monitoramento**, só sem campos de edição. Ele complementa `visualizacao-graficos-e-modais.md`. Quando os dois divergirem quanto à estrutura HTML ou ao CSS, **vale este guia**: ele substitui a seção 3.7 daquele arquivo e a marcação do componente da seção 3.6.

> **Para quem for implementar (pessoa ou IA):** copie os valores exatamente como estão aqui: cores, raios, espaçamentos e tamanhos de fonte. Não "melhore" o design, não troque a paleta, não use os estilos padrão de bibliotecas de UI (MUI, Bootstrap, shadcn, Tailwind preset etc.) e não invente outro layout. O objetivo é reproduzir o visual existente.

---

## 1. Como o modal é, em resumo

```
┌───────────────────────────────────────────────────────────────┐
│ Dados da Meta - Plano de Governo                          [✕] │ ← cabeçalho fixo, botão vermelho
├───────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ 12  -  Ampliar a cobertura da atenção básica…             │ │ ← BLOCO AZUL (#007BFF), texto branco
│ │ Detalhamento: …                                           │ │
│ │ Indicador: …            Unidade de medida: …              │ │
│ └───────────────────────────────────────────────────────────┘ │
│ Histórico de Status                                           │ ← título h2 preto
│ Status 2025-1   Status 2025-2   Status 2026-1   Status 2026-2 │
│ [Concluída  ]   [Em Partes  ]   [Planejada  ]   [—         ]  │ ← caixas 40px coloridas pelo status
│                                                               │
│ Etapas da Meta                                          60%   │ ← % azul, 24px, negrito
│                                       Porcentagem de Conclusão│
│ ┃ Etapa 1                                                     │ ← cartão com borda esquerda azul
│ ┃ Descrição:          Peso:  Previsão:     Status:            │
│ ┃ texto…              20%    [10/03/2026]  [Concluída]        │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Meta do indicador                                         │ │ ← BLOCO AZUL
│ │ Meta Indicador 2026  [ 100 ]   Meta Indicador 2027 [ … ]  │ │ ← caixas rosadas sobre o azul
│ └───────────────────────────────────────────────────────────┘ │
│ Resultado Indicador 2026-1 [ … ]   Resultado 2026-2 [ … ]     │
│ Documento Comprobatório:                                      │
│ [👁 Visualizar documentação anexada]  ✔                        │
│ Justificativa de não conclusão:  [ … ]                        │
│ Informações adicionais: [ … ]                                 │
│ Última atualização: 12/11/2026                                │ ← rodapé 13px
└───────────────────────────────────────────────────────────────┘
```

Características que **definem** o visual. Se alguma faltar, o modal vai parecer "diferente":

1. **Blocos azuis sólidos** (`#007BFF`, texto branco, cantos de 12px) no cabeçalho da meta e na seção "Meta do indicador". No PPA e na LDO, os dados orçamentários também ficam num bloco azul.
2. **Cada valor numa caixa rosada clara** (`#FDF2F2`, altura mínima de 40px, cantos de 7px, fonte de 15px). No monitoramento essas caixas são os inputs. Aqui elas são `<div>`/`<span>` com a mesma aparência, sem borda.
3. **Rótulo em cima, valor embaixo**, com um respiro de cerca de 1 linha entre os dois.
4. **Status como caixa colorida**, do mesmo tamanho das outras caixas, com **texto escuro**.
5. **Etapas em cartões** brancos com borda fina azul-clara e **faixa azul de 5px à esquerda**.
6. **Botão de fechar quadrado vermelho** (`#dc3545`, 40×40px).
7. Tudo em fonte do sistema (`system-ui`), fundo branco e texto `#121212`. Sem modo escuro.

---

## 2. Tokens (copie exatamente)

| Token | Valor | Onde |
|---|---|---|
| `--mm-azul` | `#007BFF` | blocos de destaque, faixa das etapas, títulos das etapas, %, botão de documento |
| `--mm-azul-claro` | `#d6e4ff` | borda dos cartões de etapa |
| `--mm-caixa` | `#FDF2F2` | fundo das caixas de valor |
| `--mm-texto` | `#121212` | texto geral |
| `--mm-texto-suave` | `#555` | legenda "Porcentagem de Conclusão" |
| `--mm-vermelho` | `#dc3545` | botão fechar |
| `--mm-desabilitado` | `#c9c9c9` / texto `#6b6b6b` | botão de documento sem anexo |
| `--mm-ok` | `#2e9e44` | ícone ✔ de documento |
| `--mm-alerta` | `#e08a00` | ícone de alerta de documento |
| `--mm-alerta-texto` | `#b36b00` | texto de aviso de documento |
| Overlay | `rgba(0,0,0,.45)` | fundo escurecido |
| Sombra do modal | `0 18px 60px rgba(0,0,0,.35)` | |
| Fonte | `system-ui, Avenir, Helvetica, Arial, sans-serif`; `line-height: 1.5` | |

**Cores das caixas de status** (as mesmas das etapas no monitoramento, com opacidade de 0.7 e **texto escuro**):

| Status | Fundo |
|---|---|
| Concluída | `rgba(0, 226, 0, 0.7)` |
| Em Partes | `rgba(0, 96, 163, 0.7)` |
| Planejada | `rgba(255, 255, 0, 0.7)` |
| Não Contemplada | `rgba(232, 36, 36, 0.7)` |
| Sem status / vazio | `#FDF2F2` (a caixa rosada normal, com `—`) |

> As cores do **gráfico** (`#4CAF50`, `#0060a3`, `#ffff00`, `#ea4335`, `#c9c9c9`) são outra paleta, usada só nos gráficos. Não as use nas caixas de status do modal.

**Medidas:**

| Elemento | Medida |
|---|---|
| Largura do modal | `min(960px, 94vw)`, altura máxima de `90vh` |
| Cantos do modal | 14px |
| Padding do cabeçalho e do conteúdo | `14px 18px` |
| Bloco azul | padding de 12px, cantos de 12px, margem vertical de 12px |
| Caixa de valor | altura mínima de 40px, cantos de 7px, padding de `8px 10px`, fonte de 15px |
| Espaço entre rótulo e caixa | 8px |
| Espaço entre campos lado a lado | 16px (`1rem`) |
| Margem vertical de cada campo | 10px |
| Cartão de etapa | padding de `10px 12px`, cantos de 12px, borda de 1px, faixa esquerda de 5px, margem vertical de 10px |
| Porcentagem | 24px, negrito, azul; legenda de 12px |
| Peso da etapa | 18px, negrito |
| Botão fechar | 40×40px, cantos de 10%, ✕ em `font-size: larger` |
| Botão de documento | altura de 40px, padding horizontal de 14px, cantos de 7px |
| Rodapé | 13px |

---

## 3. Estrutura HTML (classes)

Todas as classes começam com `mm-` e ficam dentro de `.mm-overlay`, para **não conflitar** com o CSS global do sistema de divulgação.

```html
<div class="mm-overlay">                                   <!-- clique fecha -->
  <div class="mm-modal" role="dialog" aria-modal="true" aria-labelledby="mm-titulo">
    <header class="mm-header">
      <h2 id="mm-titulo">Dados da Meta - Plano de Governo</h2>
      <button class="mm-fechar" aria-label="Fechar">✕</button>
    </header>

    <div class="mm-conteudo">                              <!-- só esta parte rola -->

      <!-- Cabeçalho da meta: BLOCO AZUL -->
      <section class="mm-destaque">
        <div class="mm-titulo-meta">
          <span class="mm-numero">12</span>
          <span class="mm-separador">-</span>
          <h3>Título da meta</h3>
        </div>
        <div class="mm-info">                              <!-- texto simples sobre o azul -->
          <h4>Detalhamento:</h4>
          <p>…</p>
        </div>
        <div class="mm-linha">
          <div class="mm-info"><h4>Indicador:</h4><p>…</p></div>
          <div class="mm-info"><h4>Unidade de medida:</h4><p>…</p></div>
        </div>
      </section>

      <!-- Histórico de status -->
      <h2 class="mm-secao">Histórico de Status</h2>
      <div class="mm-grade">
        <div class="mm-campo">
          <span class="mm-rotulo">Status 2026-2</span>
          <span class="mm-valor mm-status" data-status="Concluída">Concluída</span>
        </div>
        <!-- … um por semestre -->
      </div>

      <!-- Etapas -->
      <section class="mm-etapas">
        <div class="mm-etapas-cabecalho">
          <h2 class="mm-secao">Etapas da Meta</h2>
          <div class="mm-porcentagem">                     <!-- só PG e Planos gerais -->
            <strong>60%</strong>
            <small>Porcentagem de Conclusão</small>
          </div>
        </div>
        <article class="mm-etapa">
          <h3 class="mm-etapa-titulo">Etapa 1</h3>
          <div class="mm-etapa-campos">
            <div class="mm-etapa-campo"><span class="mm-rotulo">Descrição:</span><span class="mm-texto">…</span></div>
            <div class="mm-etapa-campo mm-etapa-peso"><span class="mm-rotulo">Peso:</span><span>20%</span></div>
            <div class="mm-etapa-campo"><span class="mm-rotulo">Previsão:</span><span class="mm-valor">10/03/2026</span></div>
            <div class="mm-etapa-campo"><span class="mm-rotulo">Status:</span><span class="mm-valor mm-status" data-status="Concluída">Concluída</span></div>
          </div>
        </article>
        <!-- … etapas 2 a 5 -->
      </section>

      <!-- Meta do indicador: BLOCO AZUL com caixas rosadas -->
      <section class="mm-destaque">
        <h2 class="mm-secao">Meta do indicador</h2>
        <div class="mm-grade">
          <div class="mm-campo"><span class="mm-rotulo">Meta Indicador 2026:</span><span class="mm-valor">100</span></div>
        </div>
      </section>

      <!-- Seções comuns (Resultado do indicador, Meta financeira, Detalhes) -->
      <div class="mm-grade">
        <div class="mm-campo"><span class="mm-rotulo">Resultado Indicador 2026-1:</span><span class="mm-valor">…</span></div>
      </div>

      <!-- Texto longo ocupa a linha inteira -->
      <div class="mm-campo mm-campo--largo">
        <span class="mm-rotulo">Informações adicionais:</span>
        <span class="mm-valor mm-valor--longo">…</span>
      </div>

      <!-- Documento -->
      <div class="mm-campo mm-campo--largo">
        <span class="mm-rotulo">Documento Comprobatório:</span>
        <div class="mm-documento">
          <a class="mm-btn-documento" href="…" target="_blank" rel="noopener noreferrer">👁 Visualizar documentação anexada</a>
          <!-- sem link: <span class="mm-btn-documento" aria-disabled="true">👁 Visualizar documentação anexada</span> -->
          <span class="mm-doc-icone mm-doc-icone--ok" role="img" aria-label="Documento anexado">✔</span>
        </div>
      </div>

      <footer class="mm-rodape">
        <span><b>Última atualização:</b> 12/11/2026</span>
      </footer>
    </div>
  </div>
</div>
```

Pontos importantes da estrutura:

- **Valor sempre em `.mm-valor`**, inclusive quando estiver vazio (mostre `—`). A caixa rosada aparece mesmo vazia, como no monitoramento.
- **Status com `data-status`** recebendo o valor normalizado (`Concluída`, `Em Partes`, `Planejada`, `Não Contemplada` ou vazio). É o CSS que pinta a caixa. Não use `style` inline.
- **Cabeçalho da meta:** os campos ficam como **texto branco simples** (`.mm-info`), sem caixa rosada. Já na "Meta do indicador", os valores ficam **em caixas rosadas sobre o azul**. Essa diferença existe no monitoramento e deve ser mantida.
- **Ícones:** use `react-icons` (`FaEye`, `FaCheckCircle`, `FaExclamationTriangle`), como no monitoramento. Os emojis acima são só ilustração.

---

## 4. CSS completo

Crie `src/estilos/modal-meta.css` e importe uma vez:

```css
/* ===== Modal de meta (somente leitura) — réplica do visual do monitoramento ===== */
.mm-overlay {
  --mm-azul: #007BFF;
  --mm-azul-claro: #d6e4ff;
  --mm-caixa: #FDF2F2;
  --mm-texto: #121212;
  --mm-texto-suave: #555;
  --mm-vermelho: #dc3545;

  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, .45);
  display: grid;
  place-items: center;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
}
.mm-overlay *, .mm-overlay *::before, .mm-overlay *::after { box-sizing: border-box; }

.mm-modal {
  width: min(960px, 94vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: var(--mm-texto);
  border-radius: 14px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, .35);
  outline: none;
}

/* Cabeçalho fixo */
.mm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
}
.mm-header h2 { margin: 0; font-size: 1.5em; font-weight: 700; }

.mm-fechar {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10%;
  background: var(--mm-vermelho);
  color: #fff;
  font-size: larger;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.mm-fechar:focus-visible { outline: 3px solid #000; outline-offset: 2px; }

/* Conteúdo rolável */
.mm-conteudo { padding: 14px 18px; overflow: auto; }

/* Títulos de seção (h2 preto, como no monitoramento) */
.mm-secao { margin: 16px 0 4px; font-size: 1.5em; font-weight: 700; }

/* ---------- Bloco azul de destaque ---------- */
.mm-destaque {
  background: var(--mm-azul);
  color: #fff;
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
}
.mm-destaque .mm-secao { margin-top: 0; color: #fff; }

.mm-titulo-meta { display: flex; align-items: center; gap: 1rem; }
.mm-numero, .mm-separador { font-size: 2em; font-weight: 700; line-height: 1.2; }
.mm-titulo-meta h3 { margin: 0; font-size: 1.17em; font-weight: 700; }

.mm-info { margin: 10px 0; }
.mm-info h4 { margin: 0 0 4px; font-size: 1em; font-weight: 700; }
.mm-info p { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }

/* ---------- Campos (rótulo + caixa) ---------- */
.mm-linha { display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
.mm-linha > * { flex: 1 1 200px; }

.mm-grade {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 1rem;
}
.mm-campo { margin: 10px 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.mm-campo--largo { grid-column: 1 / -1; }

.mm-rotulo { font-weight: 400; }          /* no monitoramento os rótulos são normais… */
.mm-campo--largo > .mm-rotulo { font-weight: 700; } /* …e os de texto longo, em negrito */

.mm-valor {
  display: flex;
  align-items: center;
  min-height: 40px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 7px;
  background: var(--mm-caixa);
  color: var(--mm-texto);
  font-size: 15px;
  overflow-wrap: anywhere;
}
.mm-valor--longo { display: block; min-height: 60px; white-space: pre-line; }

/* Caixas de status: texto sempre escuro */
.mm-status[data-status="Concluída"]       { background: rgba(0, 226, 0, 0.7); }
.mm-status[data-status="Em Partes"]       { background: rgba(0, 96, 163, 0.7); }
.mm-status[data-status="Planejada"]       { background: rgba(255, 255, 0, 0.7); }
.mm-status[data-status="Não Contemplada"] { background: rgba(232, 36, 36, 0.7); }

/* ---------- Etapas ---------- */
.mm-etapas { margin: 12px 0; }
.mm-etapas-cabecalho { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.mm-porcentagem { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.mm-porcentagem strong { font-size: 24px; font-weight: 700; color: var(--mm-azul); }
.mm-porcentagem small { font-size: 12px; color: var(--mm-texto-suave); }

.mm-etapa {
  border: 1px solid var(--mm-azul-claro);
  border-left: 5px solid var(--mm-azul);
  border-radius: 12px;
  padding: 10px 12px;
  margin: 10px 0;
  background: #fff;
}
.mm-etapa-titulo { margin: 0 0 8px; font-size: 1.17em; font-weight: 700; color: var(--mm-azul); }
.mm-etapa-campos {
  display: grid;
  grid-template-columns: 3fr 0.7fr 1.3fr 1.5fr;
  gap: 1rem;
  align-items: start;
}
.mm-etapa-campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.mm-etapa-campo > .mm-rotulo { font-weight: 700; }
.mm-etapa-peso > span:last-child { font-size: 18px; font-weight: 700; }
.mm-texto { white-space: pre-line; overflow-wrap: anywhere; }

/* ---------- Documento ---------- */
.mm-documento { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.mm-btn-documento {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 7px;
  background: var(--mm-azul);
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}
.mm-btn-documento:hover { filter: brightness(.92); }
.mm-btn-documento[aria-disabled="true"] {
  background: #c9c9c9;
  color: #6b6b6b;
  cursor: not-allowed;
  filter: none;
}
.mm-doc-icone { font-size: 26px; display: inline-flex; }
.mm-doc-icone--ok { color: #2e9e44; }
.mm-doc-icone--alerta { color: #e08a00; }
.mm-doc-aviso { display: block; margin-top: 6px; color: #b36b00; }

/* ---------- Rodapé ---------- */
.mm-rodape {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 10px;
  font-size: 13px;
}

/* ---------- Responsivo ---------- */
@media (max-width: 900px) {
  .mm-grade { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .mm-etapa-campos { grid-template-columns: 1fr; }
  .mm-porcentagem strong { font-size: 20px; }
}
@media (max-width: 480px) {
  .mm-overlay { place-items: stretch; }
  .mm-modal { width: 100vw; max-height: 100dvh; border-radius: 0; }
  .mm-grade { grid-template-columns: 1fr; }
  .mm-numero, .mm-separador { font-size: 1.5em; }
  .mm-btn-documento { white-space: normal; height: auto; min-height: 40px; padding: 8px 14px; }
}
```

---

## 5. Ordem e blocos azuis por plano

| Plano | Bloco azul 1 (cabeçalho) | Seções em branco | Bloco azul 2 | Depois |
|---|---|---|---|---|
| **Plano de Governo** | número – objetivo; Objetivo; ODS Vinculados | Histórico de Status → Etapas (com %) | — | Previsão de Conclusão, Documento, Justificativa, Informações adicionais, Rodapé |
| **Planos gerais** | número – meta; Detalhamento; ODS; Indicador + Unidade de Medida (lado a lado) | Histórico de Status → Etapas (com %) | **Meta do indicador** (2025–2028) | Resultado do indicador (h2 + grade), Meta Financeira Anual (h2 + grade), Previsão, Plano de ação, Documento, Justificativa, Informações adicionais, Rodapé |
| **PPA** | número – meta; Detalhamento; Objetivo do PG Vinculado; Indicador + Unidade (lado a lado) | Histórico de Status → Etapas (sem %) | **Meta do indicador** (2026–2029) | Resultado do indicador, Documento, Justificativa, Informações adicionais, **bloco azul 3: dados orçamentários** (Tipo Meta, Custeio/Investimento, Fundo / Programa, Projeto Atividade, Função, Subfunção, Meta prev. planejada / Metas físicas / Metas financeiras, em linhas `.mm-linha` com `.mm-info`), Rodapé |
| **LDO** | igual ao PPA | igual ao PPA | igual ao PPA | igual ao PPA, sem "Fundo" |

No bloco de dados orçamentários do PPA e da LDO, o monitoramento usa texto menor (`font-size: 13px`) com rótulos em negrito e sem caixas. Use `<section class="mm-destaque" style="font-size:13px">` ou uma classe `.mm-destaque--compacto { font-size: 13px; }`.

---

## 6. Ajustes no componente `ModalMeta` (de `visualizacao-graficos-e-modais.md`)

Troque as classes pelas deste guia:

| Antes | Agora |
|---|---|
| `modal-fundo` | `mm-overlay` |
| `modal` | `mm-modal` |
| `modal-topo` | `mm-header` (título "Dados da Meta - {plano}" + `mm-fechar`) |
| `modal-conteudo` | `mm-conteudo` |
| `h2` com número + título | `section.mm-destaque` > `.mm-titulo-meta` + `ListaCampos` do cabeçalho renderizado com `.mm-info` |
| `dl.grade-campos` / `dl.grade-status` | `div.mm-grade` > `div.mm-campo` > `.mm-rotulo` + `.mm-valor` |
| `SeloStatus` (pílula com `style`) | `<span className="mm-valor mm-status" data-status={categoria === "Sem status" ? "" : categoria}>{categoria === "Sem status" ? "—" : categoria}</span>` |
| `etapas-grade` / `etapa-card` | `.mm-etapa` com `.mm-etapa-campos` (grid de 4 colunas) |
| `btn-documento` / `sem-documento` | `.mm-btn-documento` (com `aria-disabled="true"` quando não houver link) + `.mm-doc-icone` |
| `modal-rodape` | `.mm-rodape` |

E na configuração de layouts:

- Marque a seção "Meta do indicador" com `destaque: true` e renderize-a dentro de `<section className="mm-destaque">`.
- No PPA e na LDO, marque "Dados orçamentários" com `destaque: "compacto"` e renderize-a com `.mm-info` (texto branco, sem caixas).
- Campos de texto longo (`detalhamento`, `plano-acao`, `justificativa-nao-conclusao`, `informacoes-adicionais`) recebem `largo: true` → `.mm-campo--largo` e `.mm-valor--longo`.

Remova o CSS da seção 3.7 do outro arquivo para que os dois estilos não se misturem.

---

## 7. Erros comuns que deixam o modal "diferente"

| Sintoma | Causa | Correção |
|---|---|---|
| Valores soltos, sem caixa | `.mm-valor` sem fundo, ou valor renderizado como `<p>` | Todo valor fora do bloco do cabeçalho vai em `.mm-valor` |
| Modal todo branco, sem azul | Faltou `.mm-destaque` no cabeçalho e na Meta do indicador | Ver a tabela da seção 5 |
| Status como pílula pequena e arredondada | Uso de "badge"/"chip" de biblioteca | O status é uma caixa de 40px, como as outras |
| Texto branco sobre o amarelo | Herdou a cor do bloco azul ou de um tema | `.mm-status` usa sempre `--mm-texto` |
| Cores do status diferentes | Usou a paleta do gráfico | Usar os `rgba(…, 0.7)` da seção 2 |
| Fonte diferente | CSS global do outro sistema (Inter, Roboto…) | `.mm-overlay` define `font-family`. Não sobrescreva |
| Espaçamento muito grande | `gap` de libs/Tailwind ou reset de `h2` | Valores da seção 2. Os títulos de seção têm margem própria |
| Cabeçalho rola junto com o conteúdo | `overflow` aplicado em `.mm-modal` | Só `.mm-conteudo` tem `overflow: auto` |
| Bordas e linhas a mais | Divisórias ou `border-bottom` adicionados | O monitoramento não tem divisória visível no cabeçalho nem entre seções |
| Modal com dark mode | Tema do sistema de divulgação | O modal é sempre claro (`background: #fff`) |
| Inputs desabilitados cinzas | Usou `<input disabled>` / `readOnly` | Use `span`/`div` com `.mm-valor` |

---

## 8. Checklist visual (comparar lado a lado com o monitoramento)

- [ ] Largura máxima de 960px, cantos de 14px, sombra forte e overlay de 45%.
- [ ] Botão ✕ quadrado vermelho de 40px à direita do título.
- [ ] Cabeçalho da meta num bloco azul `#007BFF` com texto branco e número grande.
- [ ] "Histórico de Status" em h2 preto, 4 caixas por linha no desktop.
- [ ] Caixas de valor rosadas `#FDF2F2`, de 40px, cantos de 7px, inclusive as vazias (com `—`).
- [ ] Status pintados com as cores `rgba(…, 0.7)` e texto escuro.
- [ ] Etapas em cartões com faixa azul de 5px à esquerda e título "Etapa N" em azul.
- [ ] Porcentagem azul de 24px em negrito à direita de "Etapas da Meta", com a legenda de 12px embaixo (só no PG e nos Planos gerais).
- [ ] "Meta do indicador" num bloco azul, com caixas rosadas dentro.
- [ ] Botão azul "Visualizar documentação anexada", de 40px, com ícone ao lado. Fica cinza quando não há documento.
- [ ] Rodapé de 13px.
- [ ] No celular (≈ 375px): modal em tela cheia, 1 coluna, etapas empilhadas, sem rolagem horizontal.
- [ ] Nenhum `<input>`, `<select>` ou `<textarea>` no DOM do modal.
