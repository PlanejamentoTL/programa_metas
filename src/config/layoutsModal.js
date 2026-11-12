// Layouts dos modais de visualização (somente leitura), por coleção.
// Estrutura e ordem iguais às dos modais do sistema de monitoramento
// (ver modais-css.md, seção 5). Semestres futuros (> SEMESTRE_ATUAL) são ocultados.
//
// cabecalho: itens do bloco azul do topo, renderizados como texto branco (.mm-info).
//            Um array dentro do cabeçalho vira uma linha com campos lado a lado.
// secoes:    { titulo, campos | porSemestre, destaque?: true | "compacto", semTitulo? }
//            destaque: true      -> bloco azul com caixas rosadas
//            destaque: "compacto"-> bloco azul, 13px, texto sem caixas (linhas em `linhas`)
// campo:     { label, key, alt?, tipo: "texto" | "data" | "documento", largo? }

const semestres = (de, ate) => {
  const out = [];
  for (let a = de; a <= ate; a++) out.push(`${a}-1`, `${a}-2`);
  return out;
};
const anos = (de, ate) => Array.from({ length: ate - de + 1 }, (_, i) => de + i);

const t = (label, key, extra = {}) => ({ label, key, tipo: "texto", ...extra });
const d = (label, key) => ({ label, key, tipo: "data" });
const longo = (label, key) => t(label, key, { largo: true });

const ODS = t("ODS Vinculados", "ods-vinculados", { alt: ["ods-vinculado"] });

const DOCUMENTO = { tipo: "documento", label: "Documento Comprobatório", key: "documentos-comprobatorios", largo: true };
const DETALHES_FINAIS = [
  DOCUMENTO,
  longo("Justificativa de não conclusão", "justificativa-nao-conclusao"),
  longo("Informações adicionais", "informacoes-adicionais"),
];

// Dados orçamentários do PPA/LDO. A meta física já aparece em "Meta do indicador"
// e não é repetida aqui.
const ORCAMENTO = (comFundo) => [
  [t("Tipo Meta", "tipo-meta"), t("Custeio/Investimento", "custeio-investimento"), ...(comFundo ? [t("Fundo", "fundo")] : [])],
  [t("Programa", "programa"), t("Projeto Atividade", "projeto-atividade"), t("Função", "funcao"), t("Subfunção", "subfuncao")],
  [t("Meta previamente planejada", "meta-previamente-planejada")],
  anos(2026, 2029).map((a) => t(`Meta financeira ${a}`, `meta-financeira-${a}`)),
];

const PPA_LDO = (titulo, comFundo) => ({
  titulo,
  campoTitulo: "meta",
  porcentagem: false,
  cabecalho: [
    t("Detalhamento", "detalhamento"),
    t("Objetivo do Plano de Governo Vinculado", "objetivo"),
    [t("Indicador", "indicador"), t("Unidade de medida", "un-medida")],
  ],
  semestres: semestres(2026, 2029),
  secoes: [
    { titulo: "Meta do indicador", destaque: true, campos: anos(2026, 2029).map((a) => t(`Meta Indicador ${a}`, `meta-fisica-${a}`)) },
    { titulo: "Resultado do indicador", porSemestre: "resultado-indicador", rotulo: "Resultado Indicador" },
    { titulo: "Detalhes", semTitulo: true, campos: DETALHES_FINAIS },
    { titulo: "Dados orçamentários", destaque: "compacto", linhas: ORCAMENTO(comFundo) },
  ],
});

const PLANOS_GERAIS = (titulo) => ({
  titulo,
  campoTitulo: "meta",
  porcentagem: true,
  cabecalho: [
    t("Detalhamento", "detalhamento"),
    ODS,
    [t("Indicador", "indicador"), t("Unidade de Medida", "un-medida")],
  ],
  semestres: semestres(2025, 2028),
  secoes: [
    { titulo: "Meta do indicador", destaque: true, campos: anos(2025, 2028).map((a) => t(`Meta Indicador ${a}`, `meta-indicador-${a}`)) },
    { titulo: "Resultado do indicador", porSemestre: "resultado-indicador", rotulo: "Resultado Indicador" },
    { titulo: "Meta Financeira Anual", campos: anos(2025, 2028).map((a) => t(`Meta Financeira ${a}`, `meta-financeira-${a}`)) },
    {
      titulo: "Detalhes",
      semTitulo: true,
      campos: [d("Previsão de Conclusão", "data-conclusao"), longo("Plano de ação", "plano-acao"), ...DETALHES_FINAIS],
    },
  ],
});

export const LAYOUTS = {
  "plano-governo": {
    titulo: "Plano de Governo",
    campoTitulo: "objetivo",
    porcentagem: true,
    cabecalho: [t("Objetivo", "objetivo"), ODS],
    semestres: semestres(2025, 2028),
    secoes: [
      { titulo: "Detalhes", semTitulo: true, campos: [d("Previsão de Conclusão", "data-conclusao"), ...DETALHES_FINAIS] },
    ],
  },
  "plano-plurianual": PPA_LDO("PPA 2026-2029", true),
  "ldo-2026": PPA_LDO("LDO 2026", false),
  "plano-diretor": PLANOS_GERAIS("Plano Diretor"),
  "plano-primeira-infancia": PLANOS_GERAIS("Plano Municipal da Primeira Infância"),
  "plano-tres-lagoas-sustentavel": PLANOS_GERAIS("Plano Três Lagoas Sustentável"),
  "plano-setorial": PLANOS_GERAIS("Plano Setorial - Assistência Social"),
};
