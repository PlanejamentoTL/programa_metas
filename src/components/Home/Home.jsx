import { useEffect } from "react";
import './Home.css';

import foto_paco from "../../assets/PACO-MUNICIPAL.jpg";
import logo_programa_metas from "../../assets/programa_metas_branco.png"

const Home = () => {
  useEffect(() => {
    // Exemplo: pode colocar lógica para animações, fetch, etc.
  }, []);

  return (
    <main >

      <div className="div_img-fundo" > 
      <img src={foto_paco} alt="logo programa de metas" className="img-fundo"/> 

        
      <div className="conteudo_sobre_imagem">


         <img src={logo_programa_metas} alt="logo programa de metas" className="logo_central"/>

        <div className="botoes" >

          <button className="botao">Sobre o Programa de Metas</button>
             <button className="botao"> Relatórios</button>


        </div>


     

      </div>
      </div>
    
    </main>
  );
};

export default Home;
