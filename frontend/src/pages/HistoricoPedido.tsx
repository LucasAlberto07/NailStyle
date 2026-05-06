import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import Loading from "../components/Loading";

interface Historico {
  id: string;
  pedidoId: string;
  statusAntes: string;
  statusDepois: string;
  observacao?: string;
  alteradoEm: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

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
  };
}

export default function HistoricoPedido() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    if (pedidoId) {
      carregarDados();
    }
  }, [usuario, pedidoId, navigate]);

  async function carregarDados() {
    try {
      setLoading(true);
      const [pedidoDados, historicoDados] = await Promise.all([
        api.listarMeusPedidos(),
        api.obterHistoricoPedido(pedidoId!),
      ]);

      // Encontrar o pedido
      const pedidoEncontrado = pedidoDados?.find((p: any) => p.id === pedidoId);
      if (pedidoEncontrado) {
        setPedido(pedidoEncontrado);
      }

      setHistorico(historicoDados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADO":
        return "bg-yellow-100 text-yellow-800";
      case "EM_ATENDIMENTO":
        return "bg-blue-100 text-blue-800";
      case "FINALIZADO":
        return "bg-green-100 text-green-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate("/meus-pedidos")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Voltar para Meus Pedidos
        </button>

        <h1 className="text-3xl font-bold mb-8">Histórico do Pedido</h1>

        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}

        {loading ? (
          <Loading text="Carregando histórico..." />
        ) : (
          <>
            {pedido && (
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Informações do Pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Serviço</p>
                    <p className="font-semibold text-lg">{pedido.servico.nome}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Data e Hora</p>
                    <p className="font-semibold">
                      {new Date(pedido.horaInicio).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(pedido.horaInicio).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Valor</p>
                    <p className="font-semibold text-lg">
                      R$ {parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status Atual</p>
                    <span
                      className={`px-3 py-1 rounded font-semibold inline-block ${getStatusColor(
                        pedido.status
                      )}`}
                    >
                      {pedido.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {historico.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Nenhum histórico disponível para este pedido</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Histórico de Alterações</h2>
                {historico.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                              item.statusAntes
                            )}`}
                          >
                            {item.statusAntes}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span
                            className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                              item.statusDepois
                            )}`}
                          >
                            {item.statusDepois}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <p className="font-semibold">
                            Alterado em: {formatarData(item.alteradoEm)}
                          </p>
                          {item.usuario && (
                            <p>
                              Por: {item.usuario.nome} ({item.usuario.role})
                            </p>
                          )}
                        </div>
                        {item.observacao && (
                          <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Observação:</span> {item.observacao}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
