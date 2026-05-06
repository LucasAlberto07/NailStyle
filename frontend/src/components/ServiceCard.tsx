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
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
        isHovered ? "shadow-xl transform scale-105" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-2">{servico.nome}</h2>
      <p className="text-gray-600 text-sm mb-4">{servico.descricao}</p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 text-sm text-gray-500">
          <span>⏱ {servico.duracaoMinutos} min</span>
          <span>🔧 {servico.tempoPreparacaoMinutos} min</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold text-black">
          R$ {parseFloat(servico.valorBase as any).toFixed(2)}
        </span>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Agendar
        </button>
      </div>
    </div>
  );
}
