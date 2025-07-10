import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import Home from "../src/components/Home";

// outros imports...

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20"> {/* padding para compensar navbar fixa */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* demais rotas */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;