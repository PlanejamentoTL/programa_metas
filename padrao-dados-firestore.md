# Padrão de dados do Firestore — Monitoramento do Programa de Metas

Referência para aplicações que **apenas consultam** a base do sistema de
Monitoramento do Programa de Metas (Prefeitura de Três Lagoas/MS). A base é
alimentada e editada somente pelo sistema de monitoramento. Este documento
descreve como os dados estão organizados e como interpretá-los.

> **Origem:** levantado a partir do código do sistema de monitoramento
> (o que ele lê e grava), em novembro de 2026. Campos marcados com ⚠️
> têm alguma inconsistência conhecida e devem ser conferidos nos dados reais
> (veja a seção [Conferindo os campos reais](#conferindo-os-campos-reais)).

---

## 1. Regra principal: somente leitura

- Use apenas `getDocs`, `getDoc`, `query`, `where` e `onSnapshot`.
- **Nunca** use `setDoc`, `updateDoc`, `addDoc`, `deleteDoc` ou `writeBatch`.
- Não grave campos calculados de volta na base (porcentagens, totais etc.):
  calcule na aplicação de divulgação.

> ⚠️ **Segurança:** o sistema de monitoramento não usa Firebase Auth (o login
> é local), então as Security Rules do Firestore hoje precisam permitir
> escrita sem autenticação. Isso significa que a configuração web do Firebase
> dá acesso de escrita a qualquer um que a tenha. Ao publicar uma aplicação
> de divulgação, a configuração fica exposta no navegador. Recomenda-se
> rever as regras com a equipe antes da publicação (por exemplo, servir os
> dados públicos por um backend/Cloud Function ou migrar o sistema de
> monitoramento para Firebase Auth e restringir a escrita).

---

## 2. Conexão

Mesmo projeto Firebase do sistema de monitoramento. Variáveis de ambiente
(Vite):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Peça os valores à equipe responsável; não versione o `.env`.
Se possível, registre um **app web separado** no mesmo projeto Firebase para
a aplicação de divulgação (facilita monitorar uso e revogar acesso).

---

## 3. Estrutura geral

- **Uma coleção por instrumento de planejamento.**
- **Um documento por meta.** O ID do documento não tem significado de
  negócio; identifique a meta pelo campo `numero` dentro da coleção.
- **Sem subcoleções.** Todos os dados da meta ficam no próprio documento.
- **Nomes de campo em minúsculas, com hífen** (`status-2026-2`,
  `secretaria-responsavel`). Em JavaScript, sempre acesse com colchetes:
  `meta["status-2026-2"]`, nunca `meta.status-2026-2`.
- **Praticamente todos os valores são `string`**, inclusive números, pesos,
  porcentagens e datas. Converta na leitura.
- **Campos podem não existir** em alguns documentos. Trate ausente como `""`.

### Coleções

| Coleção | Instrumento | Semestres de status |
|---|---|---|
| `plano-governo` | Plano de Governo | 2025-1 a 2028-2 |
| `plano-plurianual` | Plano Plurianual (PPA) 2026-2029 | 2026-1 a 2029-2 |
| `ldo-2026` | Lei de Diretrizes Orçamentárias 2026 | 2026-1 e 2026-2 |
| `plano-diretor` | Plano Diretor | 2025-1 a 2028-2 |
| `plano-primeira-infancia` | Plano Municipal da 1ª Infância | 2025-1 a 2028-2 |
| `plano-tres-lagoas-sustentavel` | Plano Três Lagoas Sustentável | 2025-1 a 2028-2 |
| `plano-setorial` | Plano Setorial - Assistência Social | 2025-1 a 2028-2 |
| `base-teste` | **Teste — não exibir** | — |

As quatro coleções `plano-diretor`, `plano-primeira-infancia`,
`plano-tres-lagoas-sustentavel` e `plano-setorial` seguem o mesmo modelo,
chamado aqui de **planos gerais**.

---

## 4. Valores padronizados

### 4.1 Status

Campos `status-AAAA-S` (status da meta no semestre) e `status-etapaN`
(status de cada etapa) aceitam exatamente:

| Valor gravado | Significado | Cor usada no monitoramento |
|---|---|---|
| `"Planejada"` | Ainda não iniciada | amarelo `#ffff00` |
| `"Em Partes"` | Em execução / parcialmente realizada | azul `#0060a3` |
| `"Concluída"` | Concluída | verde `#4CAF50` |
| `"Não Contemplada"` | Não será realizada / não contemplada | vermelho `#ea4335` |
| `""` ou ausente | Sem status (não preenchido) | cinza `#c9c9c9` |

- Acentos e maiúsculas fazem parte do valor (`"Concluída"`, `"Não Contemplada"`).
- Faça `trim()` antes de comparar. Qualquer valor fora da lista deve ser
  tratado como **Sem status**.

### 4.2 Semestre (período)

- Formato `AAAA-S`, onde `S` é `1` (1º semestre) ou `2` (2º semestre).
  Ex.: `2026-2`.
- Aparece no nome dos campos: `status-2026-2`, `resultado-indicador-2026-2`.
- Ordenar como texto funciona (`"2025-2" < "2026-1"`).
- **Semestre vigente:** no sistema de monitoramento ele é uma constante
  (`PERIODO_ATUAL`), hoje **`2026-2`**. Não existe na base. A aplicação de
  divulgação deve ter sua própria configuração para isso.
- Semestres futuros existem nos documentos, normalmente vazios.

### 4.3 Secretarias

Campo `secretaria-responsavel`, com a sigla da secretaria:

| Sigla | Secretaria |
|---|---|
| `SEGOV` | Secretaria de Governo |
| `SEGOV-habitacao` ⚠️ | Diretoria de Habitação |
| `SMS` | Secretaria de Saúde |
| `Gabinete` | Gabinete |
| `SGI` | Secretaria de Gestão de Pessoas |
| `SEMEA` | Secretaria de Meio Ambiente e Agronegócio |
| `SEMEA-AGRO` | Diretoria de Agronegócio |
| `SEFIRC` | Secretaria de Finanças, Receita e Controle |
| `SEJUVEL` | Secretaria de Esporte, Juventude e Lazer |
| `SEDECT` | Secretaria de Desenvolvimento Econômico, Ciência e Tecnologia |
| `SEMEC` | Secretaria de Educação |
| `SEMEC-Cultura` | Secretaria de Cultura |
| `SEINTRA` | Secretaria de Infraestrutura, Transporte e Trânsito |
| `SEINTRA-TT` | Diretoria de Transporte e Trânsito |
| `SMAS` | Secretaria de Assistência Social |

⚠️ O filtro do monitoramento usa `SEGOV-habitacao`, mas o cadastro de
usuários usa `SEGOV-HAB`. Também existem usuários de `Câmara Municipal`,
`Defesa Civil`, `Licitação` e `Previdência`. Confira os valores distintos
reais antes de montar filtros (a comparação no Firestore diferencia
maiúsculas).

### 4.4 Datas

| Campo | Formato atual | Observações |
|---|---|---|
| `previsao-etapaN` | `"AAAA-MM-DD"` ou `""` | Registros antigos podem estar em `dd/mm/aaaa`. |
| `data-conclusao` | `"AAAA-MM-DD"` ou `""` | Valores antigos podem estar em outro formato. |
| `data-ultima-atualizacao` | `"dd/mm/aaaa, hh:mm:ss"` (texto pt-BR) | Alguns documentos podem ter `Timestamp` do Firestore. |

Recomendação de leitura: aceite `AAAA-MM-DD`, `dd/mm/aaaa` (com ou sem hora
depois) e `Timestamp` (`valor.toDate()`); qualquer outro valor, exiba como
"sem data". Para exibir, use `dd/mm/aaaa`.

### 4.5 Números

Gravados como texto, do jeito que foram digitados ou importados
(ex.: `"10"`, `"45"`, `"1.500,00"`, `"R$ 2.000"`). Antes de somar ou
comparar, normalize (remova `R$`, pontos de milhar, troque vírgula por
ponto) e trate valores não numéricos como ausentes.

---

## 5. Campos comuns a todas as coleções

| Campo | Tipo | Descrição |
|---|---|---|
| `numero` | string | Número da meta dentro do plano. Ordene com `Number(numero)`; pode haver valores não numéricos. |
| `secretaria-responsavel` | string | Sigla da secretaria (ver 4.3). |
| `plano` | string | Nome/identificação do plano (quando presente). |
| `status-AAAA-S` | string | Status da meta em cada semestre (ver 4.1 e 4.2). |
| `documentos-comprobatorios` | string (URL) | Link do documento comprobatório (Google Drive) ou `""`. Obrigatório quando o status do semestre vigente é `Concluída` ou `Não Contemplada`. |
| `justificativa-nao-conclusao` | string | Texto livre. |
| `informacoes-adicionais` | string | Texto livre. |
| `data-ultima-atualizacao` | string | Data/hora da última edição (ver 4.4). |
| `responsavel-ultima-atualizacao` | string | Nome de quem fez a última edição pelo sistema atual. |
| `responsavel-ultimo-envio` ⚠️ | string | Nome usado em registros antigos/importados. Leia os dois campos e use o que estiver preenchido. |

> **Links de documentos:** apontam para o Google Drive. Antes de exibir
> publicamente, confirme se o compartilhamento dos arquivos permite acesso
> público e se o conteúdo pode ser divulgado.

---

## 6. Etapas da meta

Cinco etapas de execução por meta, com quatro campos cada (`N` de 1 a 5):

| Campo | Tipo | Descrição |
|---|---|---|
| `descricao-etapaN` | string | Pergunta/descrição da etapa. |
| `peso-etapaN` | string numérica | Peso da etapa em pontos percentuais (os 5 somam 100). |
| `previsao-etapaN` | string | Data prevista, `AAAA-MM-DD` ou `""` (ver 4.4). |
| `status-etapaN` | string | Um dos 4 status ou `""` (ver 4.1). |

Valores atuais de referência (leia sempre do documento, não fixe no código):

| Etapa | Descrição | Peso |
|---|---|---|
| 1 | O que vamos fazer está definido e documentado? | 10 |
| 2 | Recurso, projeto, licenças e autorizações estão assegurados? | 15 |
| 3 | Quem vai executar já está contratado ou alocado? | 15 |
| 4 | O objeto foi realizado? | 45 |
| 5 | Foi entregue à população, recebido e formalmente encerrado? | 15 |

- Os campos foram criados em **todos os documentos de `plano-governo`**.
  Nas demais coleções eles só existem nas metas que já foram salvas com as
  etapas preenchidas.

### Porcentagem de execução

`porcentagem-execucao` (string, ex.: `"55"`, sem `%`) existe em
`plano-governo` e nos **planos gerais**. Regra:

> **porcentagem = soma de `peso-etapaN` das etapas com `status-etapaN` = `"Concluída"`**

O sistema recalcula esse valor ao abrir e ao salvar a meta, mas o valor
gravado só é atualizado quando alguém salva a meta. Para divulgação, **é
mais confiável recalcular a partir das etapas** do que ler o campo gravado.

---

## 7. Campos por coleção

### 7.1 `plano-governo`

| Campo | Descrição |
|---|---|
| `objetivo` | Texto da meta/objetivo (é o título exibido). |
| `ods-vinculados` | ODS vinculados (texto). |
| `status-2025-1` … `status-2028-2` | Status por semestre. |
| `porcentagem-execucao` | Ver seção 6. |
| `data-conclusao` | Previsão de conclusão da meta. |
| Etapas | Seção 6. |

### 7.2 `plano-plurianual` (PPA)

| Campo | Descrição |
|---|---|
| `meta` | Título da meta. |
| `detalhamento` | Detalhamento da meta. |
| `objetivo` | Objetivo do Plano de Governo vinculado. |
| `ods-vinculado` | ODS vinculado. |
| `indicador`, `un-medida` | Indicador e unidade de medida. |
| `status-2026-1` … `status-2029-2` | Status por semestre. |
| `resultado-indicador-2026-1` … `resultado-indicador-2029-2` | Resultado do indicador por semestre. |
| `meta-fisica-2026` … `meta-fisica-2029` | Meta do indicador por ano. |
| `meta-financeira-2026` … `meta-financeira-2029` | Meta financeira por ano. |
| `tipo-meta`, `custeio-investimento`, `fundo` | Classificação. |
| `programa`, `projeto-atividade`, `funcao`, `subfuncao` | Classificação orçamentária. |
| `meta-previamente-planejada` | Indica se a meta já era planejada. |
| `porcentagem-execucao`, `data-conclusao` | Podem existir por herança de importação; não são editados pelo sistema para o PPA. |

### 7.3 `ldo-2026` (LDO)

Igual ao PPA, com estas diferenças:

- Status e resultado só de **2026-1** e **2026-2**.
- Possui `fonte-orcamentaria` e `co-fonte-orcamentaria`.
- Não possui `fundo`.

### 7.4 Planos gerais

(`plano-diretor`, `plano-primeira-infancia`, `plano-tres-lagoas-sustentavel`,
`plano-setorial`)

| Campo | Descrição |
|---|---|
| `meta` | Título da meta. |
| `detalhamento` | Detalhamento. |
| `ods-vinculados` ⚠️ | ODS vinculados. A exportação de planilha lê `ods-vinculado` (singular); confira qual existe. |
| `indicador`, `un-medida` | Indicador e unidade de medida. |
| `status-2025-1` … `status-2028-2` | Status por semestre. |
| `meta-indicador-2025` … `meta-indicador-2028` | Meta do indicador por ano. |
| `resultado-indicador-2025-1` … `resultado-indicador-2028-2` | Resultado do indicador por semestre. |
| `meta-financeira-2025` … `meta-financeira-2028` | Meta financeira anual. |
| `plano-acao` | Plano de ação (texto). |
| `porcentagem-execucao` | Ver seção 6. |
| `data-conclusao` | Previsão de conclusão. |
| `documentos-justificativa` | Link de documento de justificativa (registros antigos). |
| Etapas | Seção 6. |

---

## 8. Exemplo de documento (`plano-governo`)

```json
{
  "numero": "12",
  "objetivo": "Ampliar a cobertura da atenção básica de saúde",
  "ods-vinculados": "ODS 3",
  "secretaria-responsavel": "SMS",
  "status-2025-1": "Planejada",
  "status-2025-2": "Em Partes",
  "status-2026-1": "Em Partes",
  "status-2026-2": "Concluída",
  "status-2027-1": "",
  "porcentagem-execucao": "55",
  "data-conclusao": "2026-12-31",
  "documentos-comprobatorios": "https://drive.google.com/file/d/…/view",
  "descricao-etapa1": "O que vamos fazer está definido e documentado?",
  "peso-etapa1": "10",
  "previsao-etapa1": "2026-03-31",
  "status-etapa1": "Concluída",
  "descricao-etapa4": "O objeto foi realizado?",
  "peso-etapa4": "45",
  "previsao-etapa4": "2026-10-31",
  "status-etapa4": "Concluída",
  "data-ultima-atualizacao": "05/11/2026, 14:32:10",
  "responsavel-ultima-atualizacao": "Fulano"
}
```

*(Valores ilustrativos; o documento real tem todos os semestres e as 5 etapas.)*

---

## 9. Consultas recomendadas (somente leitura)

```js
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
export const db = getFirestore(app);
```

```js
// metas.js — leitura apenas
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const STATUS = ["Planejada", "Em Partes", "Concluída", "Não Contemplada"];

// Lista as metas de um plano, opcionalmente filtrando por secretaria.
export async function listarMetas(colecao, secretaria) {
  const ref = collection(db, colecao);
  const q = secretaria
    ? query(ref, where("secretaria-responsavel", "==", secretaria))
    : ref;
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));
}

// Status de uma meta em um semestre ("Sem status" quando vazio/inválido).
export function statusNoSemestre(meta, periodo) {
  const s = String(meta?.[`status-${periodo}`] ?? "").trim();
  return STATUS.includes(s) ? s : "Sem status";
}

// Porcentagem de execução recalculada a partir das 5 etapas.
export function porcentagemExecucao(meta) {
  let total = 0;
  for (let n = 1; n <= 5; n++) {
    if (String(meta?.[`status-etapa${n}`] ?? "").trim() !== "Concluída") continue;
    const peso = parseFloat(String(meta?.[`peso-etapa${n}`] ?? "").replace(",", "."));
    if (Number.isFinite(peso)) total += peso;
  }
  return Math.round(total * 100) / 100;
}

// Contagem por status em um semestre (para gráficos).
export function contarStatus(metas, periodo) {
  const c = { "Planejada": 0, "Em Partes": 0, "Concluída": 0, "Não Contemplada": 0, "Sem status": 0 };
  metas.forEach((m) => c[statusNoSemestre(m, periodo)]++);
  return c;
}
```

Boas práticas:

- Filtrar por secretaria com `where("secretaria-responsavel", "==", ...)`
  não exige índice composto. Combinações de filtros com ordenação podem
  exigir; nesse caso o Firestore informa o link para criar o índice.
- A base é pequena (dezenas a centenas de documentos por coleção). Carregue
  a coleção uma vez e filtre/agregue no cliente; guarde em cache para não
  repetir leituras a cada interação (o Firestore cobra por documento lido).
- Prefira `getDocs` a `onSnapshot` em páginas públicas, a menos que precise
  de atualização em tempo real.
- Ignore a coleção `base-teste`.

---

## 10. Conferindo os campos reais

Como a base foi importada de planilhas e editada ao longo do tempo, alguns
documentos podem ter campos a mais, a menos ou com grafia diferente. Antes
de fechar o mapeamento na aplicação de divulgação, rode uma vez (em
desenvolvimento) para listar os campos existentes em cada coleção:

```js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const COLECOES = [
  "plano-governo", "plano-plurianual", "ldo-2026", "plano-diretor",
  "plano-primeira-infancia", "plano-tres-lagoas-sustentavel", "plano-setorial",
];

for (const c of COLECOES) {
  const snap = await getDocs(collection(db, c));
  const campos = new Map();
  snap.docs.forEach((d) =>
    Object.keys(d.data()).forEach((k) => campos.set(k, (campos.get(k) || 0) + 1))
  );
  console.log(c, `${snap.size} documentos`);
  console.table([...campos].sort().map(([campo, qtd]) => ({ campo, qtd })));
}
```

Pontos a confirmar (⚠️ no texto):

1. Valores reais de `secretaria-responsavel` (ex.: `SEGOV-habitacao` × `SEGOV-HAB`).
2. `ods-vinculados` × `ods-vinculado` nos planos gerais e no PPA/LDO.
3. `responsavel-ultima-atualizacao` × `responsavel-ultimo-envio`.
4. Formato de `data-ultima-atualizacao` (texto ou `Timestamp`).
5. Formato dos valores de `meta-financeira-*` e `meta-fisica-*`.
