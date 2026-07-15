import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { IoDocumentSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "./Graficos_metas.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartDataLabels 
);

// 1. MAPEAMENTO DAS PLANILHAS POR PLANO
// Substitua os textos "LINK_DA_SUA_PLANILHA_..." pelas URLs de exportação em CSV correspondentes
const PLANOS_URLS = {
  "Plano de Governo": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvcH-qqxmW59c00lhrbKJ34PeWFDlYbZy6_jX5sQfBMQqNqLa9VhM_DEE3zOTj0-4x5ztA12kexRaP/pub?gid=882151214&single=true&output=csv",
  "Plano Plurianual": "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_6zW5DYxtW4eQTr5R0Pslkjb0yUS7TijBbmaBVrKKTbGF27sz4tAMI7I94I5422mOVEQtPo_SVKF7/pub?gid=733785812&single=true&output=csv",
  "Lei de Diretrizes Orçamentárias": "https://docs.google.com/spreadsheets/d/e/2PACX-1vQFqdSZQLuiarzUlIFqh22Twt0LziRaVc8TCtiuu1MBCOqTda6gydL4ETaJb8fP1bE3l-aF3VBaw1wc/pub?gid=135014434&single=true&output=csv",
  "Plano Diretor": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHnNYVGyhxRn_fx_SjJD5u1lrdqzlI_fQTYEs6Y9NrXypv41gRPKNGPli4xFep8FHFTgWnIf8sxxMo/pub?gid=199012838&single=true&output=csv",
  "Plano Municipal da Primeira Infância": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRES7Pt9rFBP-zZc1DNercXhKxWx_Jcr5luCmNJlO9GD3P7Saoy-nnh7AYZemm_ikR5HwVyLTEQbWSk/pub?gid=557101530&single=true&output=csv",
  "Plano Três Lagoas Sustentável": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzFNCGHooPZq_3AtplFbdSfI1D_mXW9Yg5rHyJXLKZGcD_OOYYRvCiz49S3Y3ciQx2mIX7A643Rz0s/pub?gid=652555452&single=true&output=csv",
  "Plano Setorial": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsmkKBcNC4O6CkL-ZpASqPhw86arDdFsXKtmFYb1orGCj5QIjMdQWBoGmy5qce3BhQETRooV7liqT7/pub?gid=1737868640&single=true&output=csv"
};

const url_financeiro = 
   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqIsZ9Y0T__qRR4h6k3q6m1B_D6By0MO49t3pBs7vwaUs2wbNljsxMmxQ_TwWGJQB0g8L81ZhTRljD/pub?gid=440817858&single=true&output=csv";

function TabelaEGrafico() {
  const [dados, setDados] = useState([]);
  const [dados_financeiros, setDados_financeiros] = useState([]);
  const [filtroSecretaria, setFiltroSecretaria] = useState("Todos");
  const [filtroPlano, setFiltroPlano] = useState("Plano de Governo");
  const [linhaAberta, setLinhaAberta] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("Geral");
  const [carregandoDados, setCarregandoDados] = useState(false); // Bom para indicar o carregamento ao usuário

  // 2. USEEFFECT DINÂMICO PARA OS PLANOS
  useEffect(() => {
    const urlAtiva = PLANOS_URLS[filtroPlano];

    if (!urlAtiva) {
      console.warn(`URL não encontrada para o plano: ${filtroPlano}`);
      return;
    }

    setCarregandoDados(true);

    fetch(urlAtiva)
      .then((response) => response.text())
      .then((data) => {
        const parse_data = Papa.parse(data, { header: true }).data;
        
        // Normalização: se a planilha do plano X não tiver uma coluna "Plano",
        // nós injetamos o nome do filtro nela para manter seus filtros de renderização funcionando!
        const dadosNormalizados = parse_data.map(item => ({
          ...item,
          Plano: item.Plano || filtroPlano
        }));

        setDados(dadosNormalizados);
        setCarregandoDados(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados da planilha:", error);
        setCarregandoDados(false);
      });
  }, [filtroPlano]); // IMPORTANTE: O React vai rodar esse efeito toda vez que "filtroPlano" mudar!


  // O resto do seu useEffect de dados financeiros continua igual
  useEffect(() => {
    fetch(url_financeiro)
      .then((response) => response.text())
      .then((data) => {
        const parse_data2 = Papa.parse(data, { header: true }).data;
        setDados_financeiros(parse_data2);
      });
  }, []);

  const anosFixos = ["2021", "2022", "2023", "2024", "2025", "2026"];

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
    let status = item["status-2026-1"]?.trim().toLowerCase();
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
  const cores = {
    "Concluída": "#4CAF50",
    "Em partes": "#0060a3",
    "Planejada": "#ffff00",
    "Não contemplada": "#ea4335",
    "Sem dados": "#F2F2F2",
    "Outro": "#999999"
  };

  const chartDataObj = {
    labels,
    datasets: [
      {
        label: 'Distribuição por Status',
        data: values,
        backgroundColor: labels.map(label => cores[label] || cores["Outro"]),
        hoverOffset: 4,
        cutout: 100,
      },
    ],
  };

  const options_porcentagem = {
    plugins: {
      legend: {
        position: 'bottom'
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold'
        },
        formatter: (value, context) => {
          const data = context.chart.data.datasets[0].data;
          const total = data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        }
      }
    }
  };

  const agrupadosDotacaoInicial = {};
  const agrupadosDotacaoFinal = {};
  anosFixos.forEach(ano => {
    agrupadosDotacaoInicial[ano] = 0;
    agrupadosDotacaoFinal[ano] = 0;
  });

  const dadosFinanceirosFiltrados = dados_financeiros.filter((d) => {
    const byTipo = filtroTipo === "Todos" || d.Tipo === filtroTipo;
    const bySecretaria = filtroSecretaria === "Todos" || d.Secretaria === filtroSecretaria;
    return byTipo && bySecretaria;
  });

  dadosFinanceirosFiltrados.forEach((d) => {
    const ano = d.Ano?.trim();
    const valorInicial = parseFloat(d.Dotacao_Inicial?.replace(/\./g, "").replace(",", ".")) || 0;
    const valorFinal = parseFloat(d.Dotacao_Final?.replace(/\./g, "").replace(",", ".")) || 0;

    if (anosFixos.includes(ano)) {
      agrupadosDotacaoInicial[ano] += valorInicial;
      agrupadosDotacaoFinal[ano] += valorFinal;
    }
  });

  const dadosLinha = {
    labels: anosFixos,
    datasets: [
      {
        label: `Dotação Inicial (${filtroTipo})`,
        data: anosFixos.map(ano => agrupadosDotacaoInicial[ano]),
        borderColor: '#0087F8',
        backgroundColor: 'rgba(0, 96, 163)',
        tension: 0.3,
        fill: true,
      },
      {
        label: `Dotação Final (${filtroTipo})`,
        data: anosFixos.map(ano => agrupadosDotacaoFinal[ano]),
        borderColor: '#F89C00',
        backgroundColor: 'rgba(248, 156, 0)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const opcoesLinha = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Investimentos por Ano',
      },
      datalabels: {
        display: false, 
      },
    },
  };

  const secretarias = Array.from(new Set(dados.map(d => d.Secretaria).filter(Boolean)));
  const toggleLinha = (index) => {
    setLinhaAberta(linhaAberta === index ? null : index);
  };

  const navigate = useNavigate();

  return (
    <>
      <div className="bar-flex_painel"> <h3>Painel de Monitoramento</h3> </div>
      <div className="conteudo">
        
        <div className="filtros_div">
          <label>
            Filtrar por Secretaria:
            <br/>
            <select className="filtros" value={filtroSecretaria} onChange={e => setFiltroSecretaria(e.target.value)}>
              <option value="Todos">Todos</option>
              {secretarias.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Filtrar por Plano:
            <br/>
            {/* O valor do select muda o estado filtroPlano, que dispara o fetch do useEffect */}
            <select className="filtros" value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}>
              <option value="Plano de Governo">Plano de Governo</option>
              <option value="Plano Plurianual">Plano Plurianual</option>
              <option value="Lei de Diretrizes Orçamentárias">Lei de Diretrizes Orçamentárias</option>
              <option value="Plano Diretor">Plano Diretor</option>
              <option value="Plano Municipal da Primeira Infância">Plano Municipal da Primeira Infância</option>
              <option value="Plano Três Lagoas Sustentável">Plano Três Lagoas Sustentável</option>
              <option value="Plano Setorial">Plano Setorial - Assistência Social</option>
            </select>
          </label>
        </div>

        {/* FEEDBACK VISUAL DE CARREGAMENTO */}
      
          <>
            <div id="indicadores" className="bento-grid">
              <div className="bento-card" style={{ gridArea: "box-1" }}>
                <div className="grafico-status">
                  {chartDataObj.labels.length > 0 ? <Doughnut data={chartDataObj} options={options_porcentagem} /> : <p>Nenhum dado disponível</p>}
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
              <h2 style={{ color: "#000" }}>Lista de Metas</h2>
              <div className="listagem">
                {dadosFiltrados.map((meta, i) => (
                  <div key={i} className="unidade_lista" onClick={() => toggleLinha(i)}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div><strong>Nº:</strong> {meta.numero}</div>
                      <div className="status" style={{
                        background: {
                          "Concluída": "rgba(0, 226, 0, 0.7)",
                          "Em Partes": "rgba(0, 96, 163, 0.7 )",
                          "Planejada": "rgba(255, 255, 0, 0.7)",
                          "Não contemplada": "rgba(232, 36, 36, 0.7 )",
                          "Não Contemplada": "rgba(232, 36, 36, 0.7 )"
                        }[meta["status-2026-1"]] || "#ccc",        
                        padding: "8px",
                        borderRadius: "5px",
                        color: "#000",
                      }}>
                        <strong>Status:</strong> {meta["status-2026-1"]}
                      </div>
                    </div>

                    <div className="infos_meta">
                      <div className="descricao">
                        <strong>Descrição:</strong> {meta.plano === "Plano de Governo" ? meta.objetivo : meta.meta}
                      </div>
                      <div style={{marginRight: "5px"}}><strong>ODS Vinculados:</strong> {meta["ods-vinculados"]}</div>
                      <div><strong>Conclusão:</strong> {meta["data-conclusao"]}</div>
                    </div>
                    
                    <div style={{marginTop: "20px"}}><strong>Secretaria:</strong> {meta["secretaria-responsavel"]}</div>

                    {linhaAberta === i && (
                      <div style={{ marginTop: "10px", background: "#f4f4f4", padding: "10px", borderRadius: "4px" }}>
                        <strong>Detalhamento:</strong> {meta.plano !== "Plano de Governo" ? meta.detalhamento : meta.meta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
  

        {/* --- DADOS FINANCEIROS --- */}
        <div className="div_financeiro">
          <div className="filtros_div">
            <label>
              Filtrar p/ Secretaria:
              <br/>
              <select className="filtros" value={filtroSecretaria} onChange={e => setFiltroSecretaria(e.target.value)}>
                <option value="Todos">Todos</option>
                {Array.from(new Set(dados_financeiros.map(d => d.Secretaria).filter(Boolean))).map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              Filtrar por Tipo:
              <br/>
              <select className="filtros" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="Geral">Geral</option>
                <option value="Investimento">Investimento</option>
              </select>
            </label>
          </div>
        </div>

        <div className="div_graficos">
          <div className="grafico-financeiro">
            {dados_financeiros.length > 0 ? <Line data={dadosLinha} options={opcoesLinha} /> : <p>Carregando gráfico...</p>}
          </div>
          <div className="grafico-financeiro">
            {dados_financeiros.length > 0 ? <Bar data={dadosLinha} options={opcoesLinha} /> : <p>Carregando gráfico...</p>}
          </div>
        </div>

        <div style={{ marginTop: "4rem", padding: "1rem" }}>
          <h2 style={{ color: "#000" }}>Lista de Dados Financeiros</h2>
          <div className="listagem">
            {dadosFinanceirosFiltrados.map((item, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "10px",
                  background: "#fff",
                  color: "#000",
                  cursor: "pointer",
                }}
                onClick={() => toggleLinha(i)}
              >
                <div className="infos_meta">
                  <div><strong>Ano:</strong> {item.Ano}</div>
                  <div><strong>Tipo:</strong> {item.Tipo}</div>
                </div>
                <div className="infos_meta">
                  <div><strong>Secretaria:</strong> {item.Secretaria}</div>
                  <div><strong>Dotação Inicial:</strong> R$ {item.Dotacao_Inicial}</div>
                  <div><strong>Dotação Final:</strong> R$ {item.Dotacao_Final}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="secao-relatorios" className="div_relatorios">
          <h2>Relatórios de acompanhamento</h2>
          <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => navigate("/relatorios-2025")}><IoDocumentSharp className="icones_secretarias" /> <br/> 2025</button>
            <button className="botoes_relatorios" onClick={() => navigate("/relatorios-2026")}><IoDocumentSharp className="icones_secretarias" /> <br/> 2026</button>
            <button className="botoes_relatorios"><IoDocumentSharp className="icones_secretarias" /> <br/> 2027</button>
            <button className="botoes_relatorios"><IoDocumentSharp className="icones_secretarias" /> <br/> 2028</button>
          </div>
        </div>

        <div className="div_relatorios">
          <h2>Instrumentos de Planejamento</h2>
          <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1Dxx0vTkMO2zWpNIJDbdtgYGil5VpDWok/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Governo</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/18UHUPyS0VLzoeZUI7JlOdSuvwrSEKY48/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Plurianual</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/10igvaiyBnXKwflsXiDz46XCCNBtluNUc/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Diretor</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1F9YYY1EqJJ6GTWantZFuTyKxAdGIbNJ-/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> LDO 2025</button>
          </div>
          <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1IwSHjBiYK6mPeTQqPCLKjovbjIC42OXd/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Três Lagoas Sustentável</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1BbuQfYBInMoXSbcS5V9QJAF7KgJb4td_/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Capacitação</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1HlgOdJiX8m4iM_xnGhmzWAYjMiMW9X3J/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Gestão de Risco</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1XvuVONLwJZdiBSkYHfVvHgtC3hkiMVp-/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Planejamento Estratégico</button>
          </div>
        </div>

      </div>

      <footer className="rodape">
        <p>&copy; {new Date().getFullYear()} Prefeitura Municipal de Três Lagoas. Todos os direitos reservados.</p>
        <p>Departamento de Planejamento e Estatística.</p>
      </footer>
    </>
  );
}

export default TabelaEGrafico;