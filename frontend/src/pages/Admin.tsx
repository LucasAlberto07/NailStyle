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
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
  servico: {
    id: string;
    nome: string;
  };
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  tempoPreparacaoMinutos: number;
  valorBase: number;
  ativo: boolean;
}

interface Janela {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
  servicosPermitidos?: Array<{
    id: string;
    nome: string;
  }>;
}

export default function Admin() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [aba, setAba] = useState<"pedidos" | "servicos" | "janelas">("pedidos");

  // Pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(true);

  // Serviços
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosLoading, setServicosLoading] = useState(true);
  const [showFormServico, setShowFormServico] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);
  const [novoServico, setNovoServico] = useState({
    nome: "",
    descricao: "",
    duracaoMinutos: "",
    tempoPreparacaoMinutos: "",
    valorBase: "",
  });

  // Janelas
  const [janelas, setJanelas] = useState<Janela[]>([]);
  const [janelasLoading, setJanelasLoading] = useState(true);
  const [showFormJanela, setShowFormJanela] = useState(false);
  const [janelaEmEdicao, setJanelaEmEdicao] = useState<Janela | null>(null);
  const [novaJanela, setNovaJanela] = useState({
    data: "",
    horaInicio: "",
    horaFim: "",
    servicosIds: [] as string[],
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!usuario || usuario.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    carregarPedidos();
    carregarServicos();
    carregarJanelas();
  }, [usuario, navigate]);

  async function carregarPedidos() {
    try {
      setPedidosLoading(true);
      const dados = await api.listarPedidosAdmin();
      setPedidos(dados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar pedidos");
    } finally {
      setPedidosLoading(false);
    }
  }

  async function carregarServicos() {
    try {
      setServicosLoading(true);
      const dados = await api.listarServicosAdmin();
      setServicos(dados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar serviços");
    } finally {
      setServicosLoading(false);
    }
  }

  async function carregarJanelas() {
    try {
      setJanelasLoading(true);
      const dados = await api.listarJanelas();
      setJanelas(dados || []);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar janelas");
    } finally {
      setJanelasLoading(false);
    }
  }

  async function handleCriarServico(e: React.FormEvent) {
    e.preventDefault();

    if (!novoServico.nome || !novoServico.duracaoMinutos || !novoServico.valorBase) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await api.criarServico({
        nome: novoServico.nome,
        descricao: novoServico.descricao,
        duracaoMinutos: parseInt(novoServico.duracaoMinutos),
        tempoPreparacaoMinutos: parseInt(novoServico.tempoPreparacaoMinutos || "0"),
        valorBase: parseFloat(novoServico.valorBase),
      });

      setNovoServico({ nome: "", descricao: "", duracaoMinutos: "", tempoPreparacaoMinutos: "", valorBase: "" });
      setShowFormServico(false);
      setSucesso("Serviço criado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      await carregarServicos();
    } catch (error: any) {
      setErro(error.message || "Erro ao criar serviço");
    }
  }

  async function handleEditarServico(e: React.FormEvent) {
    e.preventDefault();

    if (!servicoEmEdicao || !novoServico.nome || !novoServico.duracaoMinutos || !novoServico.valorBase) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await api.atualizarServico(servicoEmEdicao.id, {
        nome: novoServico.nome,
        descricao: novoServico.descricao,
        duracaoMinutos: parseInt(novoServico.duracaoMinutos),
        tempoPreparacaoMinutos: parseInt(novoServico.tempoPreparacaoMinutos || "0"),
        valorBase: parseFloat(novoServico.valorBase),
      });

      setNovoServico({ nome: "", descricao: "", duracaoMinutos: "", tempoPreparacaoMinutos: "", valorBase: "" });
      setServicoEmEdicao(null);
      setShowFormServico(false);
      setSucesso("Serviço atualizado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      await carregarServicos();
    } catch (error: any) {
      setErro(error.message || "Erro ao atualizar serviço");
    }
  }

  function abrirEdicaoServico(servico: Servico) {
    setServicoEmEdicao(servico);
    setNovoServico({
      nome: servico.nome,
      descricao: servico.descricao || "",
      duracaoMinutos: servico.duracaoMinutos.toString(),
      tempoPreparacaoMinutos: servico.tempoPreparacaoMinutos.toString(),
      valorBase: servico.valorBase.toString(),
    });
    setShowFormServico(true);
  }

  function cancelarEdicaoServico() {
    setServicoEmEdicao(null);
    setNovoServico({ nome: "", descricao: "", duracaoMinutos: "", tempoPreparacaoMinutos: "", valorBase: "" });
    setShowFormServico(false);
  }

  async function handleDeletarServico(servicoId: string) {
    if (!confirm("Tem certeza que deseja desativar este serviço?")) return;

    try {
      await api.deletarServico(servicoId);
      setSucesso("Serviço desativado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      await carregarServicos();
    } catch (error: any) {
      setErro(error.message || "Erro ao deletar serviço");
    }
  }

  async function handleCriarJanela(e: React.FormEvent) {
    e.preventDefault();

    if (!novaJanela.data || !novaJanela.horaInicio || !novaJanela.horaFim) {
      setErro("Preencha todos os campos da janela");
      return;
    }

    // Validar se horaFim é posterior a horaInicio
    if (novaJanela.horaInicio >= novaJanela.horaFim) {
      setErro("A hora final deve ser posterior à hora inicial");
      return;
    }

    // Validar se a data não é no passado (apenas para nova janela)
    if (!janelaEmEdicao) {
      const dataJanela = new Date(novaJanela.data);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataJanela < hoje) {
        setErro("Não é possível criar janelas no passado");
        return;
      }
    }

    // Validar se ao menos um serviço foi selecionado
    if (novaJanela.servicosIds.length === 0) {
      setErro("Selecione pelo menos um serviço");
      return;
    }

    try {
      if (janelaEmEdicao) {
        // Atualizar janela
        await api.atualizarJanela(janelaEmEdicao.id, {
          horaInicio: novaJanela.horaInicio,
          horaFim: novaJanela.horaFim,
          servicosIds: novaJanela.servicosIds,
        });
        setSucesso("Janela de disponibilidade atualizada com sucesso!");
      } else {
        // Criar nova janela
        await api.criarJanela({
          data: novaJanela.data,
          horaInicio: novaJanela.horaInicio,
          horaFim: novaJanela.horaFim,
          servicosIds: novaJanela.servicosIds,
        });
        setSucesso("Janela de disponibilidade criada com sucesso!");
      }

      setNovaJanela({ data: "", horaInicio: "", horaFim: "", servicosIds: [] });
      setJanelaEmEdicao(null);
      setShowFormJanela(false);
      setTimeout(() => setSucesso(""), 3000);
      await carregarJanelas();
    } catch (error: any) {
      setErro(
        janelaEmEdicao
          ? error.message || "Erro ao atualizar janela"
          : error.message || "Erro ao criar janela"
      );
    }
  }

  function abrirEdicaoJanela(janela: Janela) {
    setJanelaEmEdicao(janela);
    setNovaJanela({
      data: janela.data,
      horaInicio: janela.horaInicio,
      horaFim: janela.horaFim,
      servicosIds: janela.servicosPermitidos?.map(s => s.id) || [],
    });
    setShowFormJanela(true);
  }

  function cancelarEdicaoJanela() {
    setJanelaEmEdicao(null);
    setNovaJanela({ data: "", horaInicio: "", horaFim: "", servicosIds: [] });
    setShowFormJanela(false);
  }

  async function handleAtualizarStatus(pedidoId: string, novoStatus: string, valorBase?: number) {
    try {
      // Se finalizando, precisa enviar valorFinal
      const valorFinal = novoStatus === "FINALIZADO" ? valorBase : undefined;
      await api.atualizarStatusPedido(pedidoId, novoStatus, valorFinal);
      setSucesso("Status atualizado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      await carregarPedidos();
    } catch (error: any) {
      setErro(error.message || "Erro ao atualizar status");
    }
  }

  async function handleDeletarJanela(janelaId: string) {
    if (!confirm("Tem certeza que deseja deletar esta janela?")) return;

    try {
      await api.deletarJanela(janelaId);
      setSucesso("Janela deletada com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
      await carregarJanelas();
    } catch (error: any) {
      setErro(error.message || "Erro ao deletar janela");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Administração</h1>

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
            onClose={() => setSucesso("")}
          />
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setAba("pedidos")}
            className={`px-6 py-2 rounded font-semibold ${
              aba === "pedidos"
                ? "bg-black text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setAba("servicos")}
            className={`px-6 py-2 rounded font-semibold ${
              aba === "servicos"
                ? "bg-black text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Serviços
          </button>
          <button
            onClick={() => setAba("janelas")}
            className={`px-6 py-2 rounded font-semibold ${
              aba === "janelas"
                ? "bg-black text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Janelas de Disponibilidade
          </button>
        </div>

        {aba === "pedidos" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gerenciar Pedidos</h2>

            {pedidosLoading ? (
              <Loading text="Carregando pedidos..." />
            ) : pedidos.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="bg-white p-6 rounded-lg shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">Cliente</p>
                        <p className="font-semibold">{pedido.usuario.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Serviço</p>
                        <p className="font-semibold">{pedido.servico.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Horário</p>
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
                        <p className="font-semibold">
                          R${' '}
                          {parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={pedido.status}
                        onChange={(e) =>
                          handleAtualizarStatus(
                            pedido.id,
                            e.target.value,
                            parseFloat(String(pedido.valorFinal ?? pedido.valorBaseNoMomento))
                          )
                        }
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                      >
                      <option value="AGENDADO">Agendado</option>
                      <option value="EM_ATENDIMENTO">Em Atendimento</option>
                      <option value="FINALIZADO">Finalizado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold whitespace-nowrap ${
                          pedido.status === "AGENDADO"
                            ? "bg-yellow-100 text-yellow-800"
                            : pedido.status === "EM_ATENDIMENTO"
                              ? "bg-blue-100 text-blue-800"
                              : pedido.status === "FINALIZADO"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pedido.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === "servicos" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
              <button
                onClick={() => setShowFormServico(!showFormServico)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                {showFormServico ? "Cancelar" : "+ Novo Serviço"}
              </button>
            </div>

            {showFormServico && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">
                  {servicoEmEdicao ? "Editar Serviço" : "Criar Novo Serviço"}
                </h3>
                <form onSubmit={servicoEmEdicao ? handleEditarServico : handleCriarServico} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome do serviço *"
                    value={novoServico.nome}
                    onChange={(e) =>
                      setNovoServico({ ...novoServico, nome: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                  <textarea
                    placeholder="Descrição"
                    value={novoServico.descricao}
                    onChange={(e) =>
                      setNovoServico({
                        ...novoServico,
                        descricao: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Duração (minutos) *"
                      min="1"
                      value={novoServico.duracaoMinutos}
                      onChange={(e) =>
                        setNovoServico({
                          ...novoServico,
                          duracaoMinutos: e.target.value,
                        })
                      }
                      className="border border-gray-300 p-2 rounded"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Tempo de Preparação (minutos)"
                      min="0"
                      value={novoServico.tempoPreparacaoMinutos}
                      onChange={(e) =>
                        setNovoServico({
                          ...novoServico,
                          tempoPreparacaoMinutos: e.target.value,
                        })
                      }
                      className="border border-gray-300 p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Valor base *"
                      min="0"
                      step="0.01"
                      value={novoServico.valorBase}
                      onChange={(e) =>
                        setNovoServico({ ...novoServico, valorBase: e.target.value })
                      }
                      className="border border-gray-300 p-2 rounded"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                    >
                      {servicoEmEdicao ? "Atualizar Serviço" : "Criar Serviço"}
                    </button>
                    {servicoEmEdicao && (
                      <button
                        type="button"
                        onClick={cancelarEdicaoServico}
                        className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {servicosLoading ? (
              <Loading text="Carregando serviços..." />
            ) : servicos.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Nenhum serviço encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="bg-white p-6 rounded-lg shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">Nome</p>
                        <p className="font-semibold">{servico.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Duração</p>
                        <p className="font-semibold">{servico.duracaoMinutos} min</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Preparação</p>
                        <p className="font-semibold">{servico.tempoPreparacaoMinutos} min</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Preço</p>
                        <p className="font-semibold">
R$ {(parseFloat(servico.valorBase || '0') || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                            servico.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {servico.ativo ? "✓ Ativo" : "✗ Inativo"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEdicaoServico(servico)}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletarServico(servico.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Desativar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aba === "janelas" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gerenciar Disponibilidades</h2>
              <button
                onClick={() => setShowFormJanela(!showFormJanela)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                {showFormJanela ? "Cancelar" : "+ Nova Janela"}
              </button>
            </div>

            {showFormJanela && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Nova Janela de Disponibilidade</h3>
                <form onSubmit={handleCriarJanela} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={novaJanela.data}
                      onChange={(e) =>
                        setNovaJanela({ ...novaJanela, data: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 p-2 rounded"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Hora Inicial *
                      </label>
                      <input
                        type="time"
                        value={novaJanela.horaInicio}
                        onChange={(e) =>
                          setNovaJanela({
                            ...novaJanela,
                            horaInicio: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Hora Final *
                      </label>
                      <input
                        type="time"
                        value={novaJanela.horaFim}
                        onChange={(e) =>
                          setNovaJanela({
                            ...novaJanela,
                            horaFim: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Serviços Disponíveis *
                    </label>
                    <div className="border border-gray-300 p-3 rounded bg-gray-50 space-y-2">
                      {servicos.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum serviço disponível</p>
                      ) : (
                        servicos.map((servico) => (
                          <label key={servico.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={novaJanela.servicosIds.includes(servico.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNovaJanela({
                                    ...novaJanela,
                                    servicosIds: [...novaJanela.servicosIds, servico.id],
                                  });
                                } else {
                                  setNovaJanela({
                                    ...novaJanela,
                                    servicosIds: novaJanela.servicosIds.filter(
                                      (id) => id !== servico.id
                                    ),
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{servico.nome}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                  >
                    Criar Janela
                  </button>
                </form>
              </div>
            )}

            {janelasLoading ? (
              <Loading text="Carregando janelas..." />
            ) : janelas.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">Nenhuma janela de disponibilidade encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {janelas.map((janela) => (
                  <div
                    key={janela.id}
                    className="bg-white p-6 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{janela.data}</p>
                      <p className="text-gray-600">
                        {janela.horaInicio} - {janela.horaFim}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Serviços:{" "}
                        {janela.servicosPermitidos
                          ?.map((s) => s.nome)
                          .join(", ")}
                      </p>
                      <span
                        className={`text-sm px-2 py-1 rounded inline-block mt-2 ${
                          janela.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {janela.ativo ? "✓ Ativa" : "✗ Inativa"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletarJanela(janela.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
