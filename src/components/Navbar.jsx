import { useState, useEffect, useRef } from "react";


const Navbar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuAberto((prev) => !prev);
  };

  const handleLinkClick = () => {
    setMenuAberto(false);
  };

  return (
    <nav className="bg-[var(--color-navy)] nav-bar-flex h-36 z-[7] relative">
      

      {/* Botão para abrir/fechar menu - Somente Mobile */}
      <button
        className={`md:hidden text-white text-3xl transition-all duration-300 ${menuAberto ? "rotate-90" : ""}`}
        onClick={handleMenuToggle}
      >
        {menuAberto ? "×" : "☰"}
      </button>

      {/* Menu de Navegação */}
      <div
        ref={menuRef}
        className={`absolute top-16 left-0 w-full bg-[var(--color-navy)] p-4 flex flex-col gap-12 text-white text-3xl uppercase 
        md:relative md:flex md:flex-row md:top-0 md:w-auto md:bg-transparent md:p-0 navbar-mobile transition-all duration-300 
        ${menuAberto ? "opacity-100 visible" : "opacity-0 invisible md:opacity-100 md:visible"}`}
      >
        <a href="#sobre" className="font-bold text-white" onClick={handleLinkClick}>
          Sobre o Programa
        </a>
        <a href="#audiencias" className="font-bold text-white" onClick={handleLinkClick}>
          Contribuições para o PdM
        </a>
        <a href="#programas" className="font-bold text-white" onClick={handleLinkClick}>
          Programas Anteriores
        </a>

        {/* Logo Prefeitura - Somente Mobile */}
       
      </div>

      {/* Logo Prefeitura - Somente Desktop */}
     
    </nav>
  );
};

export default Navbar;