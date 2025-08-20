import { useEffect, useState, useRef } from "react";
import './Home.css';

import foto_paco from "../../assets/comite.jpeg";
import logo_programa_metas from "../../assets/programa_metas_branco.png"
import videoTL from "../../assets/video_treslagoas.mp4";

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  
  return (
    <main>
      <div className="div_img-fundo"> 
        <video src={videoTL} autoPlay muted loop className="img-fundo"></video>

        <div className="conteudo_sobre_imagem">
          <img src={logo_programa_metas} alt="logo programa de metas" className="logo_central"/>

          <div className="botoes">
            <button className="botao" onClick={() => setShowModal(true)}>Sobre o Programa de Metas</button>
          <button
  className="botao"
  onClick={() => {
    const relatorios = document.getElementById("secao-relatorios");
    if (relatorios) {
      relatorios.scrollIntoView({ behavior: "smooth" });
    }
  }}
>
  Relatórios
</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close"  onClick={() => setShowModal(false)}>×</button>
            <h2>Sobre o Programa de Metas</h2>
            <p>O Programa de Metas, instituído em 2019, é uma ferramenta estratégica voltada ao monitoramento 
              e à análise estatística dos principais instrumentos de planejamento do município. Seu objetivo é
               assegurar que as metas, os objetivos e as prioridades definidos pelo governo municipal, em 
               conjunto com a população, sejam efetivamente alcançados. Além disso, o programa reforça o compromisso com a transparência e a eficiência na gestão pública.
            </p>
            <img src={foto_paco} alt="Foto Paço Municipal" className="modal-img" />
              <p>A condução do Programa de Metas é responsabilidade do Departamento de Planejamento e Estatística, que lidera o Comitê de Monitoramento e Avaliação.
                 Esse comitê é composto por representantes de todas as secretarias municipais, garantindo uma abordagem integrada e colaborativa na formulação, 
                 acompanhamento e avaliação das políticas públicas.</p>

                  <p>Para além das atividades de monitoramento, o comitê também atua diretamente na elaboração dos instrumentos de planejamento, como o Plano Plurianual (PPA), 
                    a Lei de Diretrizes Orçamentárias (LDO) e a Lei Orçamentária Anual (LOA). Sua atuação vai além do acompanhamento de metas: envolve a implantação e o aprimoramento 
                    contínuo de estratégias de gestão e governança, sempre alinhadas às diretrizes do modelo Gestão Pública Gov, que orienta a administração municipal na busca por resultados 
                    mais efetivos, inovação na gestão e maior participação social.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
