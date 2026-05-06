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
    if (!data) return "";
    const dt = new Date(data);
    if (Number.isNaN(dt.getTime())) return data;
    return dt.toLocaleString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/src/public/assets/bg-escuro-blur.jpeg')`}}>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate("/meus-pedidos")}
          className="mb-6 text-pink-600 hover:text-pink-700 flex items-center gap-2 font-semibold transition-colors"
        >
          Voltar para Meus Pedidos
        </button>

        <h1 className="text-4xl font-bold mb-8 text-white text-shadow">Histórico do Pedido</h1>

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
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl mb-8 border border-white border-opacity-20">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Informações do Pedido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-semibold">Serviço</p>
                    <p className="font-semibold text-lg text-gray-800">{pedido.servico.nome}</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-semibold">Data e Hora</p>
                    <p className="font-semibold text-gray-800">
                      {(() => {
                        // No listarMeusPedidos() o backend normaliza: pedido.data (YYYY-MM-DD) e pedido.horaInicio (HH:mm)
                        const data = (pedido as any).data;
                        const hora = pedido.horaInicio;

                        const dt = new Date(data && hora && hora.includes(':') ? `${data}T${hora}:00` : hora);
                        if (Number.isNaN(dt.getTime())) {
                          const dataStr = typeof data === 'string' && data ? data : '';
                          return dataStr ? `${dataStr} às ${hora}` : hora;
                        }

                        return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-semibold">Valor</p>
                    <p className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
                      R$ {parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento)).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm font-semibold">Status Atual</p>
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
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center border border-white border-opacity-20">
                <p className="text-gray-500 text-lg">Nenhum histórico disponível para este pedido</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-white text-shadow">Histórico de Alterações</h2>
                {historico.map((item) => (
                  <div key={item.id} className="bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white border-opacity-20">
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
