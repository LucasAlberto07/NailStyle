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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading text="Carregando pedidos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}

        {pedidos.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">Você ainda não tem pedidos</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Voltar aos serviços
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white p-6 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">{pedido.servico.nome}</h3>
                  <p className="text-gray-600 text-sm">
                    {new Date(pedido.horaInicio).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(pedido.horaInicio).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Status: <span className="font-semibold">{pedido.status}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold mb-3">
                    R$ {parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento)).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/pedidos/${pedido.id}/historico`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Ver Histórico
                    </button>
                    {pedido.status === "AGENDADO" && (
                      <button
                        onClick={() => handleCancelar(pedido.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
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
