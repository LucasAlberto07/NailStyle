import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  tempoPreparacaoMinutos: number;
  valorBase: number;
  ativo: boolean;
}

export default function ServiceCard({ servico }: { servico: Servico }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  function handleClick() {
    navigate(`/agendar/${servico.id}`);
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-lg p-6 cursor-pointer transition-all border border-white border-opacity-20 ${
        isHovered ? "shadow-2xl transform scale-105 bg-opacity-100" : ""
      }`}
    >
      <h2 className="text-2xl font-bold mb-2 text-gray-800">{servico.nome}</h2>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">{servico.descricao}</p>
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex gap-6 text-sm">
          <span className="text-gray-700 font-semibold">⏱ <span className="text-pink-600 font-bold">{servico.duracaoMinutos}</span> min</span>
          <span className="text-gray-700 font-semibold">🔧 <span className="text-pink-600 font-bold">{servico.tempoPreparacaoMinutos}</span> min</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
          R$ {parseFloat(servico.valorBase as any).toFixed(2)}
        </span>
        <button className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-pink-700 hover:to-pink-600 font-bold transition-all duration-200 text-sm">
          Agendar
        </button>
      </div>
    </div>
  );
}
