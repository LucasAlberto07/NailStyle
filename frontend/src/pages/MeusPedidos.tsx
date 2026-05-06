import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import Loading from "../components/Loading";

interface Pedido {
  id: string;
  data: string;
  horaInicio: string;
  status: string;
  valorBaseNoMomento: string | number;
  valorFinal: string | number | null;
  servico: {
    id: string;
    nome: string;
    duracaoMinutos: number;
  };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatarDataPedido(pedido: Pedido): string {
  const hora = pedido.horaInicio;
  if (/^\d{2}:\d{2}$/.test(hora)) {
    // pedido.data existe no JSON
    const d = new Date(pedido.data);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }

  const dt = new Date(pedido.data + 'T00:00:00');
  return Number.isNaN(dt.getTime()) ? pedido.data : dt.toLocaleDateString('pt-BR');
}

function formatarHoraPedido(pedido: Pedido): string {
  const hora = pedido.horaInicio;
  if (/^\d{2}:\d{2}$/.test(hora)) {
    return hora;
  }

  const dt = new Date(pedido.horaInicio);
  if (Number.isNaN(dt.getTime())) return hora;
  return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    carregarPedidos();
  }, [usuario, navigate]);

  async function carregarPedidos() {
    try {
      setLoading(true);
      const dados = await api.listarMeusPedidos();
      console.log("MeusPedidos dados:", dados);
      setPedidos(dados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar(pedidoId: string) {
    if (confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        await api.cancelarPedido(pedidoId);
        await carregarPedidos();
      } catch (error: any) {
        setErro(error.message || "Erro ao cancelar pedido");
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading text="Carregando pedidos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white text-shadow">Meus Pedidos</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-700 hover:to-pink-600 transition-all duration-200"
          >
            Voltar aos serviços
          </button>
        </div>

        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}

        {pedidos.length === 0 ? (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center border border-white border-opacity-20">
            <p className="text-gray-500 text-lg">Você ainda não tem pedidos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-2xl shadow-lg flex justify-between items-center border border-white border-opacity-20 hover:bg-opacity-100 transition-all duration-200"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{pedido.servico.nome}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatarDataPedido(pedido)} às{' '}
                    {formatarHoraPedido(pedido)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Status: <span className="font-semibold text-pink-600">{pedido.status}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold mb-4 text-gray-800">
                    R$ {parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento)).toFixed(2)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/pedidos/${pedido.id}/historico`)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Histórico
                    </button>
                    {pedido.status === "AGENDADO" && (
                      <button
                        onClick={() => handleCancelar(pedido.id)}
                        className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
