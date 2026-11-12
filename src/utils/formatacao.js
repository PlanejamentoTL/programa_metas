// Funções de interpretação dos dados (padrao-dados-firestore.md, seções 4 e 6).

export const STATUS_VALIDOS = ["Planejada", "Em Partes", "Concluída", "Não Contemplada"];

// Valor de um campo como texto ("" quando ausente).
export function texto(meta, campo) {
  const v = meta?.[campo];
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

// Status de um campo (`status-AAAA-S` ou `status-etapaN`). "" quando vazio ou fora da lista.
export function statusDe(meta, campo) {
  const s = texto(meta, campo);
  const encontrado = STATUS_VALIDOS.find((v) => v.toLowerCase() === s.toLowerCase());
  return encontrado || "";
}

// Converte texto numérico ("10", "1.500,00", "R$ 2.000") em número; null se não for número.
export function numero(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  let s = String(valor).replace(/R\$\s?/gi, "").replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // "2.000" = dois mil
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Interpreta datas: Date, Timestamp do Firestore, "AAAA-MM-DD" (com ou sem hora/ISO)
// e "dd/mm/aaaa" (com ou sem ", hh:mm:ss"). Retorna Date ou null.
export function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor) ? null : valor;
  if (typeof valor.toDate === "function") return valor.toDate();
  const s = String(valor).trim();

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    // ISO completo com fuso: deixa o Date interpretar
    if (/T.*(Z|[+-]\d{2}:?\d{2})$/.test(s)) {
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }
    const d = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return valida(d, +m[1], +m[2], +m[3]);
  }

  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const d = new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return valida(d, +m[3], +m[2], +m[1]);
  }
  return null;
}

function valida(d, ano, mes, dia) {
  if (isNaN(d) || d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d;
}

const dois = (n) => String(n).padStart(2, "0");

// Data para exibição: dd/mm/aaaa ("" quando vazio ou inválido).
export function formatarData(valor) {
  const d = paraData(valor);
  return d ? `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}` : "";
}

// Data e hora para exibição: dd/mm/aaaa às hh:mm.
export function formatarDataHora(valor) {
  const d = paraData(valor);
  return d ? `${formatarData(d)} às ${dois(d.getHours())}:${dois(d.getMinutes())}` : "";
}

// ---------- Exibição (modais) ----------

export const vazio = (v) => v === undefined || v === null || String(v).trim() === "";

// Texto para exibição, com "—" quando vazio.
export const exibir = (v) => (vazio(v) ? "—" : String(v).trim());

// Data em dd/mm/aaaa; formato desconhecido aparece como veio; vazio vira "—".
export function exibirData(v) {
  if (vazio(v)) return "—";
  return formatarData(v) || String(v).trim();
}

// "20" -> "20%"
export const exibirPercentual = (v) => (vazio(v) ? "—" : String(v).trim().replace(/%?$/, "%"));

// Aceita só links http(s) — evita "javascript:" e similares vindos do banco.
export function linkSeguro(v) {
  if (vazio(v)) return null;
  try {
    const u = new URL(String(v).trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

// Porcentagem de execução recalculada a partir das 5 etapas (seção 6).
export function porcentagemExecucao(meta) {
  let total = 0;
  for (let n = 1; n <= 5; n++) {
    if (statusDe(meta, `status-etapa${n}`) !== "Concluída") continue;
    const peso = numero(meta?.[`peso-etapa${n}`]);
    if (peso !== null) total += peso;
  }
  return Math.round(total * 100) / 100;
}

// Ordena metas por `numero` (numérico primeiro, depois texto).
export function compararNumero(a, b) {
  const na = numero(a?.numero);
  const nb = numero(b?.numero);
  if (na !== null && nb !== null) return na - nb;
  if (na !== null) return -1;
  if (nb !== null) return 1;
  return texto(a, "numero").localeCompare(texto(b, "numero"), "pt-BR", { numeric: true });
}
