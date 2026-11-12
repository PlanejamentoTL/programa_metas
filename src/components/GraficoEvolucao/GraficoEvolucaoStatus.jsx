import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";
import { STATUS, SEM_STATUS, CORES_STATUS } from "../../config/dados";
import { evolucaoStatus } from "../../utils/evolucao";
import "./GraficoEvolucaoStatus.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const CATEGORIAS = [...STATUS, SEM_STATUS];

// Barras empilhadas: quantidade de metas por status em cada semestre.
// Recebe a mesma lista filtrada exibida na tela.
export default function GraficoEvolucaoStatus({ metas = [] }) {
  const { semestres, contagem } = useMemo(() => evolucaoStatus(metas), [metas]);
  const total = metas.length;

  if (!total || !semestres.length) {
    return <p className="grafico-evolucao-vazio">Sem dados de status para exibir.</p>;
  }

  const data = {
    labels: semestres,
    datasets: CATEGORIAS.map((s) => ({
      label: s,
      data: contagem.map((c) => c[s]),
      backgroundColor: CORES_STATUS[s],
      borderColor: "#fff",
      borderWidth: { top: 2 },
      borderSkipped: "bottom",
      maxBarThickness: 48,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "rgba(0,0,0,0.06)" },
        title: { display: true, text: "Quantidade de metas" },
      },
    },
    plugins: {
      legend: { position: "bottom" },
      datalabels: { display: false }, // plugin registrado globalmente no painel
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
    <>
      <figure className="grafico-evolucao" aria-label="Evolução dos status das metas por semestre">
        <Bar data={data} options={options} />
      </figure>
      <details className="grafico-evolucao-tabela">
        <summary>Ver dados em tabela</summary>
        <div className="grafico-evolucao-rolagem">
          <table>
            <thead>
              <tr>
                <th>Semestre</th>
                {CATEGORIAS.map((s) => <th key={s}>{s}</th>)}
              </tr>
            </thead>
            <tbody>
              {semestres.map((p, i) => (
                <tr key={p}>
                  <td>{p}</td>
                  {CATEGORIAS.map((s) => <td key={s}>{contagem[i][s]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
