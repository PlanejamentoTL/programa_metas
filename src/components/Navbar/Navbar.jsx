import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';
import logo_programa_metas from "../../assets/programa_metas_branco.png";
import logo_prefeitura from "../../assets/LOGO_prefeitura.png";


const Navbar = () => {
 

  return (
    <nav className="nav-bar-flex">

      <div > <img src={logo_programa_metas} alt="logo programa de metas" className="logo_programa_metas"/> </div>
      <div className="div_logo_prefeitura" > <img src={logo_prefeitura} alt="logo programa de metas" className="logo_prefeitura"/> </div>
   
    </nav>
  );
};

export default Navbar;
