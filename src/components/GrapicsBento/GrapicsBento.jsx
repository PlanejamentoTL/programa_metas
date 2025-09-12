import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ChartDataLabels // ← ESSENCIAL para que o plugin funcione!
);



import { IoDocumentSharp, IoTrendingUpOutline, IoSchoolOutline, IoBusinessOutline } from "react-icons/io5";
import { LiaHatCowboySideSolid } from "react-icons/lia";
import { FaHandsHelping, FaTheaterMasks, FaLeaf } from "react-icons/fa";
import { RiMoneyDollarCircleLine, RiGovernmentLine } from "react-icons/ri";
import { BsHouses } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdHealthAndSafety, MdOutlineSportsVolleyball } from "react-icons/md";
import { PiTrafficSign } from "react-icons/pi";








import "./GrapicsBento.css";
import { color } from "chart.js/helpers";

ChartJS.register(ArcElement, Tooltip, Legend);

const url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdKKNMJxtxa0eo3er_xR6MEuoNtEj7m37GWatu6zyzgNhbQpb3E4eY6mmdmqORBVQHbmOhjYfyl7ZB/pub?gid=1952842445&single=true&output=csv";

const url_financeiro = 
   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqIsZ9Y0T__qRR4h6k3q6m1B_D6By0MO49t3pBs7vwaUs2wbNljsxMmxQ_TwWGJQB0g8L81ZhTRljD/pub?gid=440817858&single=true&output=csv"

function TabelaEGrafico() {
  const [dados, setDados] = useState([]);
  const [dados_financeiros, setDados_financeiros] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [filtroSecretaria, setFiltroSecretaria] = useState("Todos");

  
 
  const [filtroPlano, setFiltroPlano] = useState("Plano de Governo");
  const [linhaAberta, setLinhaAberta] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("Geral");
    const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        const parse_data = Papa.parse(data, { header: true }).data;
        setDados(parse_data);
      });
  }, []);


  useEffect(() => {
    fetch(url_financeiro)
      .then((response) => response.text())
      .then((data) => {
        const parse_data2 = Papa.parse(data, { header: true }).data;
        console.log("Dados financeiros brutos:", parse_data2);
        setDados_financeiros(parse_data2);
      });
  }, []);


  const anosFixos = ["2021", "2022", "2023", "2024", "2025"];


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
  const planos = Array.from(new Set(dados.map(d => d.Plano).filter(Boolean)));

  const toggleLinha = (index) => {
    setLinhaAberta(linhaAberta === index ? null : index);
  };

  return (
    <>

       
  
     
     
   <div className="bar-flex_painel" > <h3>Painel de Monitoramento</h3> </div>
        <div className="conteudo">
         

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

      <div id="indicadores" className="bento-grid">
        <div className="bento-card" style={{ gridArea: "box-1" }}>
          <div className="grafico-status">
            {chartDataObj ? <Doughnut data={chartDataObj} options={options_porcentagem} /> : <p>Carregando gráfico...</p>}
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
        <div className="listagem" >
          {dadosFiltrados.map((meta, i) => (
            <div key={i} className="unidade_lista"  onClick={() => toggleLinha(i)}>
              <div style={{   display: "flex", justifyContent: "space-between" }}>
                <div><strong>Nº:</strong> {meta.Numero}</div>
               <div className="status" style={{
  background: {
   "Concluída": "rgba(0, 226, 0, 0.7)",
  "Em Partes": "rgba(0, 96, 163, 0.7 )",
  "Planejada": "rgba(255, 255, 0, 0.7)",
  "Não Contemplada": "rgba(232, 36, 36, 0.7 )"
  }[meta.Status],        
  padding: "8px",
  borderRadius: "5px",
  color: "#000",
 



 
}}>
  <strong  >Status:</strong> {meta.Status}
</div>

                
              </div>

               <div className="infos_meta" >
             <div className="descricao"  ><strong>Descrição:</strong> {meta.Plano === "Plano de Governo" ? meta.Objetivo : meta.Meta}</div>
               
             <div style={{marginRight: "5px"}} ><strong>ODS Vinculados:</strong> {meta.ODS}</div>
               <div><strong>Conclusão:</strong> {meta.Data_conclusão}</div>
               </div>
                
                <div style={{marginTop: "20px"}} ><strong>Secretaria:</strong> {meta.Secretaria}</div>


              {linhaAberta === i && (
               
                <div style={{ marginTop: "10px", background: "#f4f4f4", padding: "10px", borderRadius: "4px" }}>
                   
                  <strong>Detalhamento:</strong> {meta.Plano != "Plano de Governo" ? meta.Detalhamento : meta.Meta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>



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

   <div className="div_graficos" >
     <div className="grafico-financeiro">
  {dados_financeiros.length > 0 ? (
  <Line data={dadosLinha} options={opcoesLinha} />
  ) : (
    <p>Carregando gráfico...</p>
  )}
</div>

  <div className="grafico-financeiro">
  {dados_financeiros.length > 0 ? (
  <Bar data={dadosLinha} options={opcoesLinha} />
  ) : (
    <p>Carregando gráfico...</p>
  )}
</div>

</div>



    



     <div style={{  marginTop: "4rem", padding: "1rem" }} >
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

        <div className="infos_meta" >
        <div><strong>Secretaria:</strong> {item.Secretaria}</div>
        <div><strong>Dotação Inicial:</strong> R$ {item.Dotacao_Inicial}</div>
        <div><strong>Dotação Final:</strong> R$ {item.Dotacao_Final}</div>
         </div>

     
      </div>
    ))}
  </div>
</div>



      <div  id="secao-relatorios" className="div_relatorios">

        <h2>Relatórios 1º Semestre</h2>
        <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1sowNiEokWTKiPUG2w595RJNSealPY5DZ/preview")} ><IoBusinessOutline className="icones_secretarias" /> <br/> Gestão e Inovação</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1SPJLBA-AT5oF12YzE-YJjH5Zh72Kr_33/preview")}> <LiaHatCowboySideSolid className="icones_secretarias" />  <br/>Agronegócio </button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1C69ud1Rf42gKQK6TG6O4NazXL_Oz_Xzd/preview")}> <FaHandsHelping className="icones_secretarias" /> <br/> Assistência Social</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1xH-D1YmFFrXYWHQ6kUddZmtG3APkD6ax/preview")}><FaTheaterMasks className="icones_secretarias" /> <br/> Cultura</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1tazA6kyOnNRWud0-E9tgEcV-72i6oTeG/preview")}> <IoTrendingUpOutline className="icones_secretarias" /> <br/>Desenvolvimento Econômico</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1kIBza8h86GjIK29ABb4e4R1T3NstwyoA/preview")}> <IoSchoolOutline className="icones_secretarias" /> <br/> Educação</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/17GEWy61JXAJcFaFbEzIuxV16m80dJS4u/preview")}><RiMoneyDollarCircleLine className="icones_secretarias" /> <br/>  Finanças</button>

            
       

     
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1-v5n3_EzW00xqWayb9wcpaLCay1yqKDp/preview")}> <RiGovernmentLine className="icones_secretarias"/><br/> Governo </button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1zmqOKpqaTd3zRR0_Dm8tiBRcBQqdaM73/preview")}> <BsHouses className="icones_secretarias" /> <br/> Habitação</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/19JQXJ46s1MBQcCSGJiM_3te27FfXZHG3/preview")}><CiDeliveryTruck className="icones_secretarias" /> <br/>  Infraestrutura</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/14b4AyKBhYMAc1afkKhnsnEtEAB_C7pj-/preview")}> <FaLeaf className="icones_secretarias" /> <br/> Meio Ambiente </button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1I_X2FLDuM83DZyxb1olgwM7m7T1F4efU/preview")}> <MdHealthAndSafety className="icones_secretarias" /> <br/> Saúde</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1a2FlYr385ofTlQVXBb5gCmNu_w1mxoc5/preview")}><MdOutlineSportsVolleyball className="icones_secretarias" /> <br/>  Sejuvel</button>
             <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1MdKwHi-FMfqSaa9OMFxGAZ_E_XHwPr0F/preview")}><PiTrafficSign className="icones_secretarias" /> <br/>  Transporte</button>
        </div>
      </div>

       <div className="div_relatorios">

        <h2>Instrumentos de Planejamento</h2>
        <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1Dxx0vTkMO2zWpNIJDbdtgYGil5VpDWok/preview")} ><IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Governo</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/18UHUPyS0VLzoeZUI7JlOdSuvwrSEKY48/preview")} > <IoDocumentSharp className="icones_secretarias" /> <br/>Plano Plurianual </button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/10igvaiyBnXKwflsXiDz46XCCNBtluNUc/preview")} > <IoDocumentSharp className="icones_secretarias" /> <br/> Plano Diretor</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1F9YYY1EqJJ6GTWantZFuTyKxAdGIbNJ-/preview")} > <IoDocumentSharp className="icones_secretarias" />  <br/>LDO 2025</button>
        </div>
         <div className="relatorios">
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1IwSHjBiYK6mPeTQqPCLKjovbjIC42OXd/preview")} >  <IoDocumentSharp className="icones_secretarias" /> <br/> Plano Três Lagoas Sustentável</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1BbuQfYBInMoXSbcS5V9QJAF7KgJb4td_/preview")} > <IoDocumentSharp className="icones_secretarias" />  <br/>Plano de Capacitação </button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1HlgOdJiX8m4iM_xnGhmzWAYjMiMW9X3J/preview")} > <IoDocumentSharp className="icones_secretarias" /> <br/> Plano de Gestão de Risco</button>
            <button className="botoes_relatorios" onClick={() => window.open("https://drive.google.com/file/d/1XvuVONLwJZdiBSkYHfVvHgtC3hkiMVp-/preview")}> <IoDocumentSharp  className="icones_secretarias"/> <br/> Planejamento Estratégico</button>
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
