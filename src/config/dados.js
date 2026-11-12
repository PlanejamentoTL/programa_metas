// Configurações da fonte de dados da página pública.
// Altere aqui e gere um novo build (npm run deploy) para aplicar.

// De onde vêm as metas: "firestore" (padrão) ou "sheets" (planilhas antigas).
// Use "sheets" para voltar rapidamente à versão anterior caso algo dê errado.
export const FONTE_DADOS = "firestore";

// Semestre exibido nos dados e gráficos (formato AAAA-S, 1 ou 2).
// Lê o campo `status-<SEMESTRE_ATUAL>` de cada meta.
export const SEMESTRE_ATUAL = "2026-1";

// Status padronizados e cores (iguais às do sistema de monitoramento).
export const STATUS = ["Concluída", "Em Partes", "Planejada", "Não Contemplada"];
export const SEM_STATUS = "Sem status";
export const CORES_STATUS = {
  "Concluída": "#4CAF50",
  "Em Partes": "#0060a3",
  "Planejada": "#ffff00",
  "Não Contemplada": "#ea4335",
  [SEM_STATUS]: "#c9c9c9",
};

// Validade do cache no navegador, em horas. Enquanto o cache for válido,
// a página não consulta o Firestore (economia de leituras do plano gratuito).
export const CACHE_HORAS = 6;

// Plano (rótulo do filtro) -> coleção do Firestore e planilha CSV antiga.
export const PLANOS = {
  "Plano de Governo": {
    colecao: "plano-governo",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvcH-qqxmW59c00lhrbKJ34PeWFDlYbZy6_jX5sQfBMQqNqLa9VhM_DEE3zOTj0-4x5ztA12kexRaP/pub?gid=882151214&single=true&output=csv",
  },
  "Plano Plurianual": {
    colecao: "plano-plurianual",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_6zW5DYxtW4eQTr5R0Pslkjb0yUS7TijBbmaBVrKKTbGF27sz4tAMI7I94I5422mOVEQtPo_SVKF7/pub?gid=733785812&single=true&output=csv",
  },
  "LDO": {
    colecao: "ldo-2026",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFqdSZQLuiarzUlIFqh22Twt0LziRaVc8TCtiuu1MBCOqTda6gydL4ETaJb8fP1bE3l-aF3VBaw1wc/pub?gid=135014434&single=true&output=csv",
  },
  "Plano Diretor": {
    colecao: "plano-diretor",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHnNYVGyhxRn_fx_SjJD5u1lrdqzlI_fQTYEs6Y9NrXypv41gRPKNGPli4xFep8FHFTgWnIf8sxxMo/pub?gid=199012838&single=true&output=csv",
  },
  "Plano Municipal da Primeira Infância": {
    colecao: "plano-primeira-infancia",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRES7Pt9rFBP-zZc1DNercXhKxWx_Jcr5luCmNJlO9GD3P7Saoy-nnh7AYZemm_ikR5HwVyLTEQbWSk/pub?gid=557101530&single=true&output=csv",
  },
  "Plano Três Lagoas Sustentável": {
    colecao: "plano-tres-lagoas-sustentavel",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzFNCGHooPZq_3AtplFbdSfI1D_mXW9Yg5rHyJXLKZGcD_OOYYRvCiz49S3Y3ciQx2mIX7A643Rz0s/pub?gid=652555452&single=true&output=csv",
  },
  "Plano Setorial": {
    colecao: "plano-setorial",
    csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsmkKBcNC4O6CkL-ZpASqPhw86arDdFsXKtmFYb1orGCj5QIjMdQWBoGmy5qce3BhQETRooV7liqT7/pub?gid=1737868640&single=true&output=csv",
  },
};

// Dados financeiros: continuam vindo do Google Sheets (não existem no Firestore).
export const URL_FINANCEIRO =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6KBTURybnvP48Ingddbkj6uWpWirJlC0a5yJ5TELpLLw3VICM5aJfq3KTjXvv5NlI3tdLSZyEOy3d/pub?gid=440817858&single=true&output=csv";

// Secretarias do filtro. `sigla` é o valor gravado no Firestore
// (campo `secretaria-responsavel`); `aliases` são grafias antigas usadas nas
// planilhas (inclusive a financeira), aceitas como equivalentes no filtro.
export const SECRETARIAS = [
  { sigla: "SMAS", nome: "Assistência Social" },
  { sigla: "SEMEC-Cultura", nome: "Turismo e Cultura", aliases: ["SETURC"] },
  { sigla: "SEDECT", nome: "Desenvolvimento Econômico, Ciência e Tecnologia" },
  { sigla: "SEMEC", nome: "Educação", aliases: ["SEMED"] },
  { sigla: "SEFIRC", nome: "Fazenda", aliases: ["SEFAZ"] },
  { sigla: "SEGOV", nome: "Governo e Políticas Públicas" },
  { sigla: "SEGOV-habitacao", nome: "Habitação", aliases: ["SEGOV-HAB"] },
  { sigla: "SEINTRA", nome: "Infraestrutura" },
  { sigla: "SEINTRA-TT", nome: "Transporte e Trânsito" },
  { sigla: "SEMEA", nome: "Meio Ambiente" },
  { sigla: "SEMEA-AGRO", nome: "Agronegócio" },
  { sigla: "SMS", nome: "Saúde" },
  { sigla: "SEJUVEL", nome: "Esporte, Juventude e Lazer" },
  { sigla: "SGI", nome: "Gestão de Pessoas", aliases: ["SEGP"] },
];
