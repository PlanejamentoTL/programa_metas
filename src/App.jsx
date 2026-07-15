import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import TabelaEGrafico from "./components/GrapicsBento/Graficos_metas";
import Relatorios2025 from "./components/relatorios/relatorios-2025";
import Relatorios2026 from "./components/relatorios/relatorios-2026";

function App() {
  return (
    <Router basename="/programa_metas">
    
      <div className="pt-20">
        <Routes>
          <Route className= "teste"
            path="/"
            element={
              <>
                <Home />
                <TabelaEGrafico />
              </>
            }
          />


          {/* Exemplo de novas rotas */}
          <Route path="/relatorios-2025" element={<Relatorios2025 />} />
          <Route path="/relatorios-2026" element={<Relatorios2026 />} />
         

          {/* Rota 404 */}
          <Route path="*" element={<div>Página não encontrada</div>} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
