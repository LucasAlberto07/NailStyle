import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Alert from "../components/Alert";

interface Horario {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  disponivel: boolean;
  servico?: {
    id: string;
    nome: string;
    duracao: number;
    preparacao: number;
  };
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  tempoPreparacaoMinutos: number;
  valorBase: number;
}

// Função helper para converter timestamp ISO para HH:mm
function formatarHora(data: string): string {
  try {
    const date = new Date(data);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return data; // Se não conseguir converter, retorna como está
  }
}

// Função helper para extrair a data em formato YYYY-MM-DD
function extrairData(data: string): string {
  try {
    const date = new Date(data);
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
}

// Função helper para formatar data em formato legível
function formatarData(data: string): string {
  try {
    const date = new Date(data + 'T00:00:00');
    return date.toLocaleDateString("pt-BR", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  } catch {
    return data;
  }
}

export default function Agendar() {
  const navigate = useNavigate();
  const { servicoId } = useParams();
  const { usuario } = useAuthStore();

  const [servico, setServico] = useState<Servico | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");
  const [dataSelecionada, setDataSelecionada] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }

    carregarDados();
  }, [usuario, servicoId, navigate]);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");
      
      if (!servicoId) {
        setErro("Serviço não encontrado");
        return;
      }

      const servicoDados = await api.buscarServicoPorId(servicoId);
      if (!servicoDados) {
        setErro("Serviço não existe ou foi removido");
        return;
      }

      setServico(servicoDados);

      const horariosDados = await api.listarHorariosPorServico(servicoId);
      console.log("Horários recebidos:", horariosDados);
      
      if (!horariosDados || horariosDados.length === 0) {
        setErro("Nenhum horário disponível para este serviço no momento");
      } else {
        setHorarios(horariosDados);
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar dados do serviço");
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReservar() {
    if (!dataSelecionada) {
      setErro("Selecione uma data antes de confirmar");
      return;
    }

    if (!horarioSelecionado) {
      setErro("Selecione um horário antes de confirmar");
      return;
    }

    const horario = horarios.find((h) => h.id === horarioSelecionado);
    if (!horario || !horario.disponivel) {
      setErro("O horário selecionado não está mais disponível");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      await api.reservarHorario(horarioSelecionado, servicoId!);
      setSucesso("Agendamento realizado com sucesso!");
      setTimeout(() => navigate("/meus-pedidos"), 1500);
    } catch (error: any) {
      console.error("Erro ao reservar:", error);
      setErro(error.message || "Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading text="Carregando serviço e horários..." />
        </div>
      </div>
    );
  }

  if (!servico) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <Alert type="error" message="Serviço não encontrado" />
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Voltar aos serviços
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">{servico.nome}</h1>
          <p className="text-gray-600 mb-6">{servico.descricao || "Serviço de qualidade"}</p>

          {erro && (
            <Alert
              type="error"
              message={erro}
              onClose={() => setErro("")}
            />
          )}

          {sucesso && (
            <Alert
              type="success"
              message={sucesso}
            />
          )}

          <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Duração</p>
                <p className="text-xl font-bold">⏱ {servico.duracaoMinutos} min</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Preparo</p>
                <p className="text-xl font-bold">🔧 {servico.tempoPreparacaoMinutos} min</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Valor</p>
R$ {(parseFloat(servico.valorBase || '0') || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Escolha um horário</h2>

          {horarios.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              ⚠️ Nenhum horário disponível para este serviço no momento
            </div>
          ) : (
            <>
              {/* Seletor de Data */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  📅 Selecione uma data:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Array.from(
                    new Set(horarios.map((h) => h.data))
                  )
                    .sort()
                    .map((data) => (
                      <button
                        key={data}
                        onClick={() => {
                          setDataSelecionada(data);
                          setHorarioSelecionado(""); // Reset horário ao trocar data
                        }}
                        className={`px-4 py-2 rounded border-2 transition-all font-medium ${
                          dataSelecionada === data
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700 hover:border-black"
                        }`}
                      >
                        {formatarData(data)}
                      </button>
                    ))}
                </div>
              </div>

              {/* Seletor de Hora */}
              {dataSelecionada && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    🕐 Selecione um horário:
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {horarios
                      .filter((h) => h.data === dataSelecionada && h.disponivel)
                      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                      .map((horario) => (
                        <button
                          key={horario.id}
                          onClick={() => setHorarioSelecionado(horario.id)}
                          className={`p-2 rounded border-2 transition-all text-sm font-medium ${
                            horarioSelecionado === horario.id
                              ? "border-black bg-black text-white"
                              : "border-gray-300 text-gray-700 hover:border-black"
                          }`}
                        >
                          {formatarHora(horario.horaInicio)}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {dataSelecionada && horarios.filter((h) => h.data === dataSelecionada && h.disponivel).length === 0 && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                  ⚠️ Nenhum horário disponível para esta data
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  disabled={salvando}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReservar}
                  disabled={!horarioSelecionado || salvando}
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {salvando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
