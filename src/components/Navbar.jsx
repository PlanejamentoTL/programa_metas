import { useState, useRef } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  const handleMenuToggle = () => {
    setMenuAberto((prev) => !prev);
  };

  const handleLinkClick = () => {
    setMenuAberto(false);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-10 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold text-gray-800">
          MeuProjeto
        </Link>

        {/* Botão para mobile */}
        <button
          className="md:hidden text-gray-800 text-3xl"
          onClick={handleMenuToggle}
        >
          {menuAberto ? "×" : "☰"}
        </button>

        {/* Menu */}
        <div
          ref={menuRef}
          className={`absolute top-20 left-0 w-full bg-white p-6 flex flex-col gap-4 text-lg
          md:relative md:flex md:flex-row md:top-0 md:w-auto md:bg-transparent md:p-0 md:gap-6 
          transition-all duration-300 
          ${menuAberto ? "block" : "hidden"} md:block`}
        >
          <Link to="/" onClick={handleLinkClick} className="text-gray-700 hover:text-blue-600 font-medium">
            Início
          </Link>
          <Link to="/sobre" onClick={handleLinkClick} className="text-gray-700 hover:text-blue-600 font-medium">
            Sobre
          </Link>
          <Link to="/servicos" onClick={handleLinkClick} className="text-gray-700 hover:text-blue-600 font-medium">
            Serviços
          </Link>
          <Link to="/contato" onClick={handleLinkClick} className="text-gray-700 hover:text-blue-600 font-medium">
            Contato
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
