// Cálculo do gráfico de evolução dos status por semestre.
import { SEMESTRE_ATUAL, STATUS, SEM_STATUS } from "../config/dados";
import { statusDe } from "./formatacao";

// Status de um valor em uma das 5 categorias (inclui "Sem status").
export function categoriaStatus(meta, campo) {
  return statusDe(meta, campo) || SEM_STATUS;
}

// Semestres (AAAA-S) presentes nos documentos, ordenados, até SEMESTRE_ATUAL.
// A regex não casa com status-etapa1…5.
export function semestresDoPlano(metas) {
  const set = new Set();
  metas.forEach((m) =>
    Object.keys(m).forEach((k) => {
      const r = k.match(/^status-(\d{4}-[12])$/);
      if (r) set.add(r[1]);
    })
  );
  return [...set].sort().filter((p) => p <= SEMESTRE_ATUAL);
}

export function evolucaoStatus(metas) {
  const semestres = semestresDoPlano(metas);
  const contagem = semestres.map((p) => {
    const c = Object.fromEntries([...STATUS, SEM_STATUS].map((s) => [s, 0]));
    metas.forEach((m) => c[categoriaStatus(m, `status-${p}`)]++);
    return c;
  });
  return { semestres, contagem };
}
