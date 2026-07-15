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
  { label: "Gestão e Inovação", icon: IoBusinessOutline, url: "https://drive.google.com/file/d/1sowNiEokWTKiPUG2w595RJNSealPY5DZ/preview" },
  { label: "Agronegócio", icon: LiaHatCowboySideSolid, url: "https://drive.google.com/file/d/1SPJLBA-AT5oF12YzE-YJjH5Zh72Kr_33/preview" },
  { label: "Assistência Social", icon: FaHandsHelping, url: "https://drive.google.com/file/d/1C69ud1Rf42gKQK6TG6O4NazXL_Oz_Xzd/preview" },
  { label: "Cultura", icon: FaTheaterMasks, url: "https://drive.google.com/file/d/1xH-D1YmFFrXYWHQ6kUddZmtG3APkD6ax/preview" },
  { label: "Desenv. Econômico", icon: IoTrendingUpOutline, url: "https://drive.google.com/file/d/1tazA6kyOnNRWud0-E9tgEcV-72i6oTeG/preview" },
  { label: "Educação", icon: IoSchoolOutline, url: "https://drive.google.com/file/d/1kIBza8h86GjIK29ABb4e4R1T3NstwyoA/preview" },
  { label: "Finanças", icon: RiMoneyDollarCircleLine, url: "https://drive.google.com/file/d/17GEWy61JXAJcFaFbEzIuxV16m80dJS4u/preview" },
  { label: "Governo", icon: RiGovernmentLine, url: "https://drive.google.com/file/d/1-v5n3_EzW00xqWayb9wcpaLCay1yqKDp/preview" },
  { label: "Habitação", icon: BsHouses, url: "https://drive.google.com/file/d/1zmqOKpqaTd3zRR0_Dm8tiBRcBQqdaM73/preview" },
  { label: "Infraestrutura", icon: CiDeliveryTruck, url: "https://drive.google.com/file/d/19JQXJ46s1MBQcCSGJiM_3te27FfXZHG3/preview" },
  { label: "Meio Ambiente", icon: FaLeaf, url: "https://drive.google.com/file/d/14b4AyKBhYMAc1afkKhnsnEtEAB_C7pj-/preview" },
  { label: "Saúde", icon: MdHealthAndSafety, url: "https://drive.google.com/file/d/1I_X2FLDuG83DZyxb1olgwM7m7T1F4efU/preview" },
  { label: "Sejuvel", icon: MdOutlineSportsVolleyball, url: "https://drive.google.com/file/d/1a2FlYr385ofTlQVXBb5gCmNu_w1mxoc5/preview" },
  { label: "Transporte", icon: PiTrafficSign, url: "https://drive.google.com/file/d/1MdKwHi-FMfqSaa9OMFxGAZ_E_XHwPr0F/preview" },
];

const relatorios2Semestre = [
  { label: "Gestão e Inovação", icon: IoBusinessOutline, url: "https://drive.google.com/file/d/1ibd3rfvalq4j4VPuB-AWBr-gAYlUBlgR/preview" },
  { label: "Agronegócio", icon: LiaHatCowboySideSolid, url: "https://drive.google.com/file/d/1-UVZun4GClu5mbtikb0SuPz9Zv6gp94T/preview" },
  { label: "Assistência Social", icon: FaHandsHelping, url: "https://drive.google.com/file/d/1bU8qSCnMnhoG19NdmRPRhgbdP3KCtmCY/preview" },
  { label: "Cultura", icon: FaTheaterMasks, url: "https://drive.google.com/file/d/1ZE4mYS0kVEigAPiktlMN6jUeGM7wV6Mn/preview" },
  { label: "Desenv. Econômico", icon: IoTrendingUpOutline, url: "https://drive.google.com/file/d/1Gg0MATppxBiumnyTnApRSdcB2Ddq5rdL/preview" },
  { label: "Educação", icon: IoSchoolOutline, url: "https://drive.google.com/file/d/1-r7IIsVIP87_fcVnHaoKfDMpsU7sWoUh/preview" },
  { label: "Finanças", icon: RiMoneyDollarCircleLine, url: "https://drive.google.com/file/d/19jGcc_7BKhHDsVOk0FRnRkwRLWQ1eqj_/preview" },
  { label: "Governo", icon: RiGovernmentLine, url: "https://drive.google.com/file/d/1k-vVAwSIRh7LIT438Sv101TiHdCAv--0/preview" },
  { label: "Habitação", icon: BsHouses, url: "https://drive.google.com/file/d/13S9_Ih1ByPe2VC20FEXbc0_BQr917D2d/preview" },
  { label: "Infraestrutura", icon: CiDeliveryTruck, url: "https://drive.google.com/file/d/1ngGxw4xSB8ZAM5avy2OVUlLjNTVC8KsC/preview" },
  { label: "Meio Ambiente", icon: FaLeaf, url: "https://drive.google.com/file/d/1RRjYRqjqYQFQdMb1Y0V-zOKY10ha3WgV/preview" },
  { label: "Saúde", icon: MdHealthAndSafety, url: "https://drive.google.com/file/d/1Z3qFFpKLRHdXIYdnJwwESQEUgx3LPUpf/preview" },
  { label: "Sejuvel", icon: MdOutlineSportsVolleyball, url: "https://drive.google.com/file/d/1vZb5WRZhgCVFgTE8dRU21_J-LePNbRct/preview" },
  { label: "Transporte", icon: PiTrafficSign, url: "https://drive.google.com/file/d/1W2u4i5XRwBPvTxN2D-6D5U1OVFE7Ou1m/preview" },
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

export default function Relatorios2025() {
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