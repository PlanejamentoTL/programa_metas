import React, { useCallback, useEffect, useState } from "react";
import Papa from "papaparse";
import { SEMESTRE_ATUAL, SECRETARIAS, URL_FINANCEIRO, PLANOS } from "../../config/dados";
import GraficoEvolucaoStatus from "../GraficoEvolucao/GraficoEvolucaoStatus";
import ModalMeta from "../ModalMeta/ModalMeta";
import { carregarMetas } from "../../services/metas";
import { statusDe, texto, formatarData, formatarDataHora } from "../../utils/formatacao";
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

// Fonte das metas, semestre exibido e planilhas: ver src/config/dados.js
const PLANO_GOVERNO = "Plano de Governo";

// Verifica se a secretaria de um registro corresponde à opção do filtro
// (aceita as grafias antigas das planilhas listadas em `aliases`).
function secretariaCorresponde(valor, filtro) {
  if (filtro === "Todos") return true;
  const v = String(valor ?? "").trim();
  if (v === filtro) return true;
  const opcao = SECRETARIAS.find((s) => s.sigla === filtro);
  return Boolean(opcao?.aliases?.includes(v));
}

function OpcoesSecretarias() {
  return (
    <>
      <option value="Todos">Todos</option>
      {SECRETARIAS.map((s) => (
        <option key={s.sigla} value={s.sigla}>{s.nome}</option>
      ))}
    </>
  );
}

function TabelaEGrafico() {
  const [dados, setDados] = useState([]);
  const [dados_financeiros, setDados_financeiros] = useState([]);
  const [filtroSecretaria, setFiltroSecretaria] = useState("Todos");
  const [filtroPlano, setFiltroPlano] = useState(PLANO_GOVERNO);
  const [linhaAberta, setLinhaAberta] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("Geral");
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [erroDados, setErroDados] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [desatualizado, setDesatualizado] = useState(false);
  const [metaAberta, setMetaAberta] = useState(null);
  const fecharModal = useCallback(() => setMetaAberta(null), []);

  useEffect(() => {
    let cancelado = false; // ignora respostas de um plano que já não está selecionado

    setCarregandoDados(true);
    setErroDados(false);

    carregarMetas(filtroPlano)
      .then((resultado) => {
        if (cancelado) return;
        setDados(resultado.metas);
        setAtualizadoEm(resultado.atualizadoEm);
        setDesatualizado(resultado.desatualizado);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Erro ao carregar as metas:", error);
        setDados([]);
        setAtualizadoEm(null);
        setErroDados(true);
      })
      .finally(() => {
        if (!cancelado) setCarregandoDados(false);
      });

    return () => {
      cancelado = true;
    };
  }, [filtroPlano]);


  useEffect(() => {
    fetch(URL_FINANCEIRO)
      .then((response) => response.text())
      .then((data) => {
        const parse_data2 = Papa.parse(data, { header: true }).data;
        setDados_financeiros(parse_data2);
      });
  }, []);

  const anosFixos = ["2021", "2022", "2023", "2024", "2025", "2026"];

  const campoStatus = `status-${SEMESTRE_ATUAL}`;

  const dadosFiltrados = dados.filter(item => {
    const secretariaItem = item["secretaria-responsavel"] || item.Secretaria;
    const bySecretaria = secretariaCorresponde(secretariaItem, filtroSecretaria);
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
    // Rótulos do gráfico mantidos como antes ("Em partes", "Não contemplada")
    const mapaStatus = {
      "Concluída": "Concluída",
      "Em Partes": "Em partes",
      "Planejada": "Planejada",
      "Não Contemplada": "Não contemplada",
    };
    let status = mapaStatus[statusDe(item, campoStatus)];
    if (!status) status = texto(item, campoStatus).toLowerCase() === "sem dados" ? "Sem dados" : "Outro";
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
    const secretariaItem = d["secretaria-responsavel"] || d.Secretaria;
    const bySecretaria = secretariaCorresponde(secretariaItem, filtroSecretaria);
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

  // CORREÇÃO: Mapeando a lista de secretarias únicas das metas usando 'secretaria-responsavel'
  const secretarias = Array.from(
    new Set(dados.map(d => d["secretaria-responsavel"] || d.Secretaria).filter(Boolean))
  );

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
              <OpcoesSecretarias />
            </select>
          </label>
          <label>
            Filtrar por Plano:
            <br/>
            <select className="filtros" value={filtroPlano} onChange={e => setFiltroPlano(e.target.value)}>
              <option value="Plano de Governo">Plano de Governo</option>
              <option value="Plano Plurianual">Plano Plurianual</option>
              <option value="LDO">Lei de Diretrizes Orçamentárias</option>
              <option value="Plano Diretor">Plano Diretor</option>
              <option value="Plano Municipal da Primeira Infância">Plano Municipal da Primeira Infância</option>
              <option value="Plano Três Lagoas Sustentável">Plano Três Lagoas Sustentável</option>
              <option value="Plano Setorial">Plano Setorial - Assistência Social</option>
            </select>
          </label>
        </div>

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

          <div className="evolucao-card">
            <h4>Evolução dos status por semestre</h4>
            <GraficoEvolucaoStatus metas={dadosFiltrados} />
          </div>

          <div style={{ marginTop: "2rem", padding: "1rem" }}>
            <h2 style={{ color: "#000" }}>Lista de Metas</h2>
            <p style={{ color: "#555", fontSize: "0.85rem", margin: "0 0 1rem" }}>
              {carregandoDados
                ? "Carregando dados..."
                : erroDados
                  ? "Não foi possível carregar os dados no momento. Tente novamente mais tarde."
                  : atualizadoEm
                    ? `Dados atualizados em ${formatarDataHora(new Date(atualizadoEm))}${desatualizado ? " (os dados podem estar desatualizados)" : ""}`
                    : null}
            </p>
            <div className="listagem">
              {dadosFiltrados.map((meta, i) => {
                const status = statusDe(meta, campoStatus);
                const ehPlanoGoverno = meta.Plano === PLANO_GOVERNO;
                const abrir = () => setMetaAberta(meta);
                return (
                <div
                  key={meta.id || i}
                  className="unidade_lista"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  onClick={abrir}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      abrir();
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><strong>Nº:</strong> {meta.numero}</div>
                    <div className="status" style={{
                      background: {
                        "Concluída": "rgba(0, 226, 0, 0.7)",
                        "Em Partes": "rgba(0, 96, 163, 0.7 )",
                        "Planejada": "rgba(255, 255, 0, 0.7)",
                        "Não Contemplada": "rgba(232, 36, 36, 0.7 )"
                      }[status] || "#ccc",
                      padding: "8px",
                      borderRadius: "5px",
                      color: "#000",
                    }}>
                      <strong>Status:</strong> {status}
                    </div>
                  </div>

                  <div className="infos_meta">
                    <div className="descricao">
                      <strong>Descrição:</strong> {ehPlanoGoverno ? texto(meta, "objetivo") : texto(meta, "meta")}
                    </div>
                    <div style={{marginRight: "5px"}}><strong>ODS Vinculados:</strong> {texto(meta, "ods-vinculados") || texto(meta, "ods-vinculado")}</div>
                    <div><strong>Conclusão:</strong> {formatarData(meta["data-conclusao"])}</div>
                  </div>

                  <div style={{marginTop: "20px"}}><strong>Secretaria:</strong> {texto(meta, "secretaria-responsavel")}</div>

                </div>
                );
              })}
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
                <OpcoesSecretarias />
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
                  {/* CORREÇÃO: Lendo de forma segura para os dados financeiros */}
                  <div><strong>Secretaria:</strong> {item["secretaria-responsavel"] || item.Secretaria}</div>
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
            <button className="botoes_relatorios" style={{opacity: "50%"}}><IoDocumentSharp className="icones_secretarias" /> <br/> 2027</button>
            <button className="botoes_relatorios" style={{opacity: "50%"}}><IoDocumentSharp className="icones_secretarias" /> <br/> 2028</button>
          </div>
        </div>

        <div className="div_relatorios">
          <h2>Instrumentos de Planejamento</h2>
          <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1Dxx0vTkMO2zWpNIJDbdtgYGil5VpDWok/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Governo</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1kWchwe_s_gjjTaRoxgZx8UWvZCt12gBB/view")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Plurianual</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/10igvaiyBnXKwflsXiDz46XCCNBtluNUc/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Diretor</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1zPmJkUnBHn8WZE4LYhuihdDJUDxgPP2y/view")}><IoDocumentSharp className="icones_secretarias" /> <br/> LDO 2026</button>
          </div>
          <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1IwSHjBiYK6mPeTQqPCLKjovbjIC42OXd/preview")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano Três Lagoas Sustentável</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1BbuQfYBInMoXSbcS5V9QJAF7KgJb4td_/view")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Capacitação</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1HlgOdJiX8m4iM_xnGhmzWAYjMiMW9X3J/view")}><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Gestão de Risco</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1XvuVONLwJZdiBSkYHfVvHgtC3hkiMVp-/view")}><IoDocumentSharp className="icones_secretarias" /> <br/> Planejamento Estratégico</button>
          </div>
        </div>

      </div>

      <ModalMeta
        colecao={metaAberta ? PLANOS[metaAberta.Plano]?.colecao : null}
        meta={metaAberta}
        onClose={fecharModal}
      />

      <footer className="rodape">
        <p>&copy; {new Date().getFullYear()} Prefeitura Municipal de Três Lagoas. Todos os direitos reservados.</p>
        <p>Departamento de Planejamento e Estatística.</p>
      </footer>
    </>
  );
}

export default TabelaEGrafico;