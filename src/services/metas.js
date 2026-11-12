// Leitura das metas — módulo isolado para facilitar trocar a fonte no futuro
// (ex.: um documento único de resumo `publico/<plano>`, 1 leitura por visita).
//
// Regras de economia de cota (plano Spark, cota dividida com o sistema interno):
// - getDocs uma vez por plano; nada de onSnapshot;
// - cache em localStorage com validade CACHE_HORAS;
// - se o Firestore falhar e houver cache vencido, usa o cache com aviso.
//
// SOMENTE LEITURA: este módulo nunca grava no Firestore.

import Papa from "papaparse";
import { FONTE_DADOS, CACHE_HORAS, PLANOS } from "../config/dados";
import { obterDb } from "./firebase";
import { paraData, compararNumero } from "../utils/formatacao";

const VERSAO_CACHE = 1;
const chaveCache = (colecao) => `programa-metas:v${VERSAO_CACHE}:${colecao}`;

function lerCache(colecao) {
  try {
    const bruto = window.localStorage.getItem(chaveCache(colecao));
    if (!bruto) return null;
    const cache = JSON.parse(bruto);
    if (!Array.isArray(cache?.metas) || typeof cache.salvoEm !== "number") return null;
    return cache;
  } catch {
    return null; // localStorage indisponível ou conteúdo inválido
  }
}

function salvarCache(colecao, cache) {
  try {
    window.localStorage.setItem(chaveCache(colecao), JSON.stringify(cache));
  } catch {
    // localStorage indisponível ou cheio: segue sem cache
  }
}

// Converte Timestamps do Firestore em texto ISO para poder guardar em cache.
function serializar(valor) {
  if (valor && typeof valor.toDate === "function") return valor.toDate().toISOString();
  return valor;
}

// Data mais recente de `data-ultima-atualizacao` entre as metas (ms) ou null.
function ultimaAtualizacao(metas) {
  let max = null;
  for (const m of metas) {
    const d = paraData(m["data-ultima-atualizacao"]);
    if (d && (max === null || d.getTime() > max)) max = d.getTime();
  }
  return max;
}

async function buscarFirestore(colecao) {
  const [{ collection, getDocs }, db] = await Promise.all([
    import("firebase/firestore"),
    obterDb(),
  ]);
  const snap = await getDocs(collection(db, colecao));
  return snap.docs.map((d) => {
    const dados = d.data();
    const meta = { id: d.id };
    for (const [campo, valor] of Object.entries(dados)) meta[campo] = serializar(valor);
    return meta;
  });
}

async function buscarSheets(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Planilha respondeu ${resposta.status}`);
  const csv = await resposta.text();
  return Papa.parse(csv, { header: true, skipEmptyLines: true }).data;
}

/**
 * Carrega as metas de um plano.
 * @param {string} plano rótulo do plano (chave de PLANOS)
 * @returns {Promise<{metas: object[], atualizadoEm: number, desatualizado: boolean}>}
 *   atualizadoEm: data/hora (ms) da última atualização dos dados.
 *   desatualizado: true quando a consulta falhou e foi usado cache vencido.
 */
export async function carregarMetas(plano) {
  const config = PLANOS[plano];
  if (!config) throw new Error(`Plano desconhecido: ${plano}`);

  const comRotulo = (metas) => metas.map((m) => ({ ...m, Plano: plano }));

  if (FONTE_DADOS === "sheets") {
    const metas = await buscarSheets(config.csv);
    return { metas: comRotulo(metas), atualizadoEm: Date.now(), desatualizado: false };
  }

  const { colecao } = config;
  const cache = lerCache(colecao);
  const validadeMs = CACHE_HORAS * 60 * 60 * 1000;

  if (cache && Date.now() - cache.salvoEm < validadeMs) {
    return { metas: comRotulo(cache.metas), atualizadoEm: cache.atualizadoEm, desatualizado: false };
  }

  try {
    const metas = (await buscarFirestore(colecao)).sort(compararNumero);
    const agora = Date.now();
    const novo = { salvoEm: agora, atualizadoEm: ultimaAtualizacao(metas) ?? agora, metas };
    salvarCache(colecao, novo);
    return { metas: comRotulo(metas), atualizadoEm: novo.atualizadoEm, desatualizado: false };
  } catch (erro) {
    console.error(`Erro ao consultar o Firestore (${colecao}):`, erro);
    if (cache) {
      return { metas: comRotulo(cache.metas), atualizadoEm: cache.atualizadoEm, desatualizado: true };
    }
    throw erro;
  }
}
