import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoBusinessOutline, IoTrendingUpOutline, IoSchoolOutline } from "react-icons/io5";
import { LiaHatCowboySideSolid } from "react-icons/lia";
import { FaHandsHelping, FaTheaterMasks, FaLeaf } from "react-icons/fa";
import { RiMoneyDollarCircleLine, RiGovernmentLine } from "react-icons/ri";
import { BsHouses } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { MdHealthAndSafety, MdOutlineSportsVolleyball } from "react-icons/md";
import { PiTrafficSign } from "react-icons/pi";

const relatorios1Semestre = [
  { label: "Gestão e Inovação", icon: IoBusinessOutline, url: "https://drive.google.com/file/d/11oS41TfbMFlFM1jHRTyl3Q9bef-yyKwk/view" },
  { label: "Agronegócio", icon: LiaHatCowboySideSolid, url: "https://drive.google.com/file/d/1djuNcfBMrHTmxE66NoC2eK4mENFetiPw/view" },
  { label: "Assistência Social", icon: FaHandsHelping, url: "https://drive.google.com/file/d/19qlyl9TXgyKIRAmmQnZRv5R0zEg1hyrr/view" },
  { label: "Cultura", icon: FaTheaterMasks, url: "https://drive.google.com/file/d/113ZcW7pI1ny6TBfJfE1M_KB3OVw7xnr1/view" },
  { label: "Desenv. Econômico", icon: IoTrendingUpOutline, url: "https://drive.google.com/file/d/1O_OnAuFz8Eu24xeEuS9-Um5Cv_bZYGBk/view" },
  { label: "Educação", icon: IoSchoolOutline, url: "https://drive.google.com/file/d/1xjnkp9yW42BysfdXgt34ZXkp4KVwbETj/view" },
  { label: "Finanças", icon: RiMoneyDollarCircleLine, url: "https://drive.google.com/file/d/1cKL3rgVmKm7_y9WGLT_uUo7W0wcdSZSG/view" },
  { label: "Governo", icon: RiGovernmentLine, url: "https://drive.google.com/file/d/1JhFGPQ_Fz9E9SH67QmMhSztJQzPLBxZ8/view" },
  { label: "Habitação", icon: BsHouses, url: "https://drive.google.com/file/d/1vDikUACJ0wR1qy9nwELDync9IC6p-_p9/view" },
  { label: "Infraestrutura", icon: CiDeliveryTruck, url: "https://drive.google.com/file/d/1NKeOep3NfKDEURvSZelteXBvpWVjMHfd/view" },
  { label: "Meio Ambiente", icon: FaLeaf, url: "https://drive.google.com/file/d/148AkIYn0dZrErSLAkmy58rvUF4zgKZNZ/view" },
  { label: "Saúde", icon: MdHealthAndSafety, url: "https://drive.google.com/file/d/1or0uWPDEDqMxfwcVmrliwZvx7hrPey8r/view" },
  { label: "Sejuvel", icon: MdOutlineSportsVolleyball, url: "https://drive.google.com/file/d/1S1RJcyHHct5bt7jueGIYCbbdm1IkS7Jx/view" },
  { label: "Transporte", icon: PiTrafficSign, url: "https://drive.google.com/file/d/1Neyc6foKyrFIpm5E0Fc7--FH9J7DhA5R/view" },
];

const relatorios2Semestre = [
  { label: "Gestão e Inovação", icon: IoBusinessOutline, url: "" },
  { label: "Agronegócio", icon: LiaHatCowboySideSolid, url: "" },
  { label: "Assistência Social", icon: FaHandsHelping, url: "" },
  { label: "Cultura", icon: FaTheaterMasks, url: "" },
  { label: "Desenv. Econômico", icon: IoTrendingUpOutline, url: "" },
  { label: "Educação", icon: IoSchoolOutline, url: "" },
  { label: "Finanças", icon: RiMoneyDollarCircleLine, url: "" },
  { label: "Governo", icon: RiGovernmentLine, url: "" },
  { label: "Habitação", icon: BsHouses, url: "" },
  { label: "Infraestrutura", icon: CiDeliveryTruck, url: "" },
  { label: "Meio Ambiente", icon: FaLeaf, url: "" },
  { label: "Saúde", icon: MdHealthAndSafety, url: "" },
  { label: "Sejuvel", icon: MdOutlineSportsVolleyball, url: "" },
  { label: "Transporte", icon: PiTrafficSign, url: "" },
];

function GrupoRelatorios({ itens }) {
  return (
    <div className="relatorios">
      {itens.map(({ label, icon: Icon, url }) => (
        <button
          key={label}
          className="botoes_relatorios"
          onClick={() => window.open(url)}
        >
          <Icon className="icones_secretarias" />
          <br />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Relatorios2026() {
  const navigate = useNavigate();

  return (
    <div id="secao-relatorios" className="div_relatorios">

      <button className="botao_voltar" onClick={() => navigate(-1)}>
        <IoArrowBackOutline /> Voltar
      </button>

      <h2>Relatórios 1º Semestre</h2>
      <GrupoRelatorios itens={relatorios1Semestre} />

      <h2>Relatórios 2º Semestre</h2>
      <GrupoRelatorios itens={relatorios2Semestre} />

    </div>
  );
}