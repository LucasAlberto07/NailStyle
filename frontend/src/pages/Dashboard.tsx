import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import ServiceCard from "../components/ServiceCard";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import Loading from "../components/Loading";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  tempoPreparacaoMinutos: number;
  valorBase: number;
  ativo: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    carregarServicos();
  }, [usuario, navigate]);

  async function carregarServicos() {
    try {
      setLoading(true);
      const dados = await api.listarServicos();
      setServicos(dados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading text="Carregando serviços..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-white text-shadow">NailStyle</h1>
          <p className="text-gray-100 text-lg font-semibold">Escolha um serviço para continuar</p>
        </div>

        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}

        {servicos.length === 0 ? (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center border border-white border-opacity-20">
            <p className="text-gray-500 text-lg">Nenhum serviço disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <ServiceCard key={servico.id} servico={servico} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
