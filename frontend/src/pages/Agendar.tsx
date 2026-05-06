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
  // O backend retorna hora em "HH:mm".
  // new Date("HH:mm") gera "Invalid Date".
  if (/^\d{2}:\d{2}$/.test(data)) {
    return data;
  }

  const date = new Date(data);
  if (Number.isNaN(date.getTime())) {
    return data;
  }

  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Função helper para extrair a data em formato YYYY-MM-DD (não usado no momento)
// function extrairData(data: string): string {
//   try {
//     const date = new Date(data);
//     return date.toISOString().split('T')[0];
//   } catch {
//     return "";
//   }
// }

// Função helper para formatar data em formato legível
function formatarData(data: string): string {
  try {
    const date = new Date(data + 'T00:00:00');
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
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
console.log("Horários normalizados:", (horariosDados as Horario[]).map((h) => ({ id: h.id, data: h.data, horaInicio: h.horaInicio, disponivel: h.disponivel })) );
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
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loading text="Carregando serviço e horários..." />
        </div>
      </div>
    );
  }

  if (!servico) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center border border-white border-opacity-20">
            <Alert type="error" message="Serviço não encontrado" />
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-pink-600 font-semibold mt-4"
            >
              Voltar aos serviços
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">{servico.nome}</h1>
          <p className="text-gray-600 mb-6 text-lg">{servico.descricao || "Serviço de qualidade"}</p>

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

          <div className="mb-8 bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-semibold">Duração</p>
                <p className="text-2xl font-bold text-pink-600">⏱ {servico.duracaoMinutos} min</p>
              </div>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-semibold">Preparo</p>
                <p className="text-2xl font-bold text-pink-600">🔧 {servico.tempoPreparacaoMinutos} min</p>
              </div>
              <div className="bg-white bg-opacity-70 p-4 rounded-lg">
                <p className="text-gray-600 text-sm font-semibold">Valor</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">R$ {(Number(servico.valorBase ?? 0) || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Escolha um horário</h2>

          {horarios.length === 0 ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-6">
              <p className="font-semibold">⚠️ Nenhum horário disponível</p>
              <p>Não há horários disponíveis para este serviço no momento</p>
            </div>
          ) : (
            <>
              {/* Seletor de Data */}
              <div className="mb-8">
                <label className="block text-lg font-semibold mb-4 text-gray-800">
                  📅 Selecione uma data:
                </label>
                <div className="flex gap-3 flex-wrap">
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
                        className={`px-6 py-3 rounded-lg border-2 transition-all font-semibold ${
                          dataSelecionada === data
                            ? "border-pink-600 bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg"
                            : "border-gray-300 text-gray-700 hover:border-pink-400 bg-white hover:bg-pink-50"
                        }`}
                      >
                      {formatarData(data)}
                      </button>
                    ))}
                </div>
              </div>

              {/* Seletor de Hora */}
              {dataSelecionada && (
                <div className="mb-8">
                  <label className="block text-lg font-semibold mb-4 text-gray-800">
                    🕐 Selecione um horário:
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {horarios
                      .filter((h) => h.data === dataSelecionada && h.disponivel)
                      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                      .map((horario) => (
                        <button
                          key={horario.id}
                          onClick={() => setHorarioSelecionado(horario.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                            horarioSelecionado === horario.id
                              ? "border-pink-600 bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg"
                              : "border-gray-300 text-gray-700 hover:border-pink-400 bg-white hover:bg-pink-50"
                          }`}
                        >
                          {formatarHora(horario.horaInicio)}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {dataSelecionada && horarios.filter((h) => h.data === dataSelecionada && h.disponivel).length === 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-6">
                  <p className="font-semibold">⚠️ Nenhum horário disponível</p>
                  <p>Não há horários disponíveis para esta data</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => navigate("/dashboard")}
                  disabled={salvando}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-semibold text-gray-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReservar}
                  disabled={!horarioSelecionado || salvando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg hover:from-pink-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-300 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {salvando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
