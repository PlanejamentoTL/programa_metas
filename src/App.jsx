import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import TabelaEGrafico from "./components/GrapicsBento/GrapicsBento";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="pt-20">
        <Routes>
          {/* Página principal com Home + TabelaEGrafico */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <TabelaEGrafico />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
