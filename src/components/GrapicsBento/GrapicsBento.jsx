import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import "./GrapicsBento.css";
import { color } from "chart.js/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

const url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdKKNMJxtxa0eo3er_xR6MEuoNtEj7m37GWatu6zyzgNhbQpb3E4eY6mmdmqORBVQHbmOhjYfyl7ZB/pub?gid=1952842445&single=true&output=csv";

function TabelaEGrafico() {
  const [dados, setDados] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [filtroSecretaria, setFiltroSecretaria] = useState("Todos");
  const [filtroPlano, setFiltroPlano] = useState("Todos");
  const [linhaAberta, setLinhaAberta] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const parse_data = Papa.parse(data, { header: true }).data;
        setDados(parse_data);
      });
  }, []);

  const dadosFiltrados = dados.filter(item => {
    const bySecretaria = filtroSecretaria === "Todos" || item.Secretaria === filtroSecretaria;
    const byPlano = filtroPlano === "Todos" || item.Plano === filtroPlano;
    return bySecretaria && byPlano;
  });

  const contagem = {};
  const contadores = {
    "Concluída": 0,
    "Em partes": 0,
    "Planejada": 0,
    "Não contemplada": 0,
  };

  dadosFiltrados.forEach((item) => {
    let status = item["Status"]?.trim().toLowerCase();
    const mapaStatus = {
      "concluída": "Concluída",
      "em partes": "Em partes",
      "planejada": "Planejada",
      "não contemplada": "Não contemplada",
      "sem dados": "Sem dados"
    };
    status = mapaStatus[status] || "Outro";
    if (status !== "Outro") {
      contagem[status] = (contagem[status] || 0) + 1;
      if (contadores.hasOwnProperty(status)) {
        contadores[status]++;
      }
    }
  });

  const labels = Object.keys(contagem);
  const values = Object.values(contagem);
  const cores = [
    '#4CAF50',
    '#0060a3',
    '#ffff00',
    '#ea4335',
    '#F2F2F2',
  ];

  const chartDataObj = {
    labels,
    datasets: [
      {
        label: 'Distribuição por Status',
        data: values,
        backgroundColor: cores.slice(0, labels.length),
        hoverOffset: 4,
        cutout: 120,
      },
    ],
  };

  const secretarias = Array.from(new Set(dados.map(d => d.Secretaria).filter(Boolean)));
  const planos = Array.from(new Set(dados.map(d => d.Plano).filter(Boolean)));

  const toggleLinha = (index) => {
    setLinhaAberta(linhaAberta === index ? null : index);
  };

  return (
    <>


    
          <div className="bar-flex" > <h3>Painel de Monitoramento - Programa de Metas</h3> </div>
       



      <div className="filtros_div">
        <label  >
          Filtrar por Secretaria:
          <br/>
          <select  className = "filtros"  value={filtroSecretaria} onChange={e => setFiltroSecretaria(e.target.value)}>
            <option value="Todos">Todos</option>
            {secretarias.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Filtrar por Plano:
           <br/>
          <select className = "filtros" value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}>
            <option value="Todos">Todos</option>
            {planos.map((p, i) => <option key={i} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div id="indicadores" className="bento-grid">
        <div className="bento-card" style={{ gridArea: "box-1" }}>
          <div className="grafico-status">
            {chartDataObj ? <Doughnut data={chartDataObj} /> : <p>Carregando gráfico...</p>}
          </div>
        </div>

        <div className="bento-card" style={{ gridArea: "box-2" }}>
          <h4 className="contador_titulo">Total de Metas</h4>
          <p className="contador">{dadosFiltrados.length}</p>
        </div>

        <div className="bento-card" style={{ gridArea: "box-3" }}>
          <h4 className="contador_titulo">Concluídas</h4>
          <p className="contador">{contadores["Concluída"]}</p>
        </div>

        <div className="bento-card" style={{ gridArea: "box-4" }}>
          <h4 className="contador_titulo">Em Partes</h4>
          <p className="contador">{contadores["Em partes"]}</p>
        </div>

        <div className="bento-card" style={{ gridArea: "box-5" }}>
          <h4 className="contador_titulo">Planejadas</h4>
          <p className="contador">{contadores["Planejada"]}</p>
        </div>

        <div className="bento-card" style={{ gridArea: "box-6" }}>
          <h4 className="contador_titulo">Não contempladas</h4>
          <p className="contador">{contadores["Não contemplada"]}</p>
        </div>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem" }}>
        <h2 style={{ color: "#000",  }} >Lista de Metas</h2>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {dadosFiltrados.map((meta, i) => (
            <div key={i} style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
              background: "#fff",
              color: "#000",
              cursor: "pointer"
            }} onClick={() => toggleLinha(i)}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><strong>Nº:</strong> {meta.Numero}</div>
                <div><strong>Status:</strong> {meta.Status}</div>
              </div>
              <div><strong>Descrição:</strong> {meta.Meta}</div>
              <div><strong>Secretaria:</strong> {meta.Secretaria}</div>
              {linhaAberta === i && (
                <div style={{ marginTop: "10px", background: "#f4f4f4", padding: "10px", borderRadius: "4px" }}>
                  <strong>Detalhamento:</strong> {meta.Detalhamento || "Não informado"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="div_relatorios">

        <h2>Relatórios Semestrais</h2>
        <div className="relatorios">
            <button className="botoes_relatorios" > 2025</button>
            <button className="botoes_relatorios">2025 </button>
            <button className="botoes_relatorios"> 2025</button>
            <button className="botoes_relatorios" > 2025</button>
        </div>
      </div>

       <div className="div_relatorios">

        <h2>Relatórios Semestrais</h2>
        <div className="relatorios">
            <button className="botoes_relatorios" > 2025</button>
            <button className="botoes_relatorios">2025 </button>
            <button className="botoes_relatorios"> 2025</button>
            <button className="botoes_relatorios" > 2025</button>
        </div>
         <div className="relatorios">
            <button className="botoes_relatorios" > 2025</button>
            <button className="botoes_relatorios">2025 </button>
            <button className="botoes_relatorios"> 2025</button>
            <button className="botoes_relatorios" > 2025</button>
        </div>
      </div>
    </>
  );
}

export default TabelaEGrafico;
