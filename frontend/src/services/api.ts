const API_URL = "http://localhost:3000";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro na requisição");
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Erro ao fazer parse JSON:", error, response);
    throw new Error("Erro ao processar resposta do servidor");
  }
}

// ===== AUTH =====
export async function registrar(nome: string, email: string, senha: string) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ nome, email, senha }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao registrar:", error);
    throw error;
  }
}

export async function login(email: string, senha: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, senha }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer logout");
    }
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
}

export async function refreshToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    throw error;
  }
}

// ===== SERVIÇOS =====
export async function listarServicos() {
  try {
    const response = await fetch(`${API_URL}/servicos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    throw error;
  }
}

export async function buscarServicoPorId(servicoId: string) {
  try {
    const response = await fetch(`${API_URL}/servicos/${servicoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    throw error;
  }
}

export async function listarServicosAdmin() {
  try {
    const response = await fetch(`${API_URL}/servicos/admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar serviços admin:", error);
    throw error;
  }
}

export async function criarServico(data: any) {
  try {
    const response = await fetch(`${API_URL}/servicos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        nome: data.nome,
        descricao: data.descricao || "",
        duracaoMinutos: data.duracaoMinutos,
        valorBase: data.valorBase,
        tempoPreparacaoMinutos: data.tempoPreparacaoMinutos || 0,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    throw error;
  }
}

export async function atualizarServico(servicoId: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/servicos/${servicoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        nome: data.nome,
        descricao: data.descricao || "",
        duracaoMinutos: data.duracaoMinutos,
        valorBase: data.valorBase,
        tempoPreparacaoMinutos: data.tempoPreparacaoMinutos || 0,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    throw error;
  }
}

export async function deletarServico(servicoId: string) {
  try {
    const response = await fetch(`${API_URL}/servicos/${servicoId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar serviço");
    }
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    throw error;
  }
}

// ===== PEDIDOS =====
export async function listarMeusPedidos() {
  try {
    const response = await fetch(`${API_URL}/pedidos/meus`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar meus pedidos:", error);
    throw error;
  }
}

export async function listarPedidosAdmin(query?: any) {
  try {
    const params = new URLSearchParams(query || {});
    const response = await fetch(`${API_URL}/pedidos/admin?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar pedidos admin:", error);
    throw error;
  }
}

export async function buscarPedidos(termo: string) {
  try {
    const response = await fetch(`${API_URL}/pedidos/buscar?termo=${termo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error;
  }
}

export async function atualizarStatusPedido(pedidoId: string, status: string, valorFinal?: number) {
  try {
    const body: any = { status };
    
    // Se fornecido valorFinal, incluir no body
    if (valorFinal !== undefined) {
      body.valorFinal = valorFinal;
    }

    const response = await fetch(`${API_URL}/pedidos/${pedidoId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

export async function cancelarPedido(pedidoId: string) {
  try {
    const response = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao cancelar pedido");
    }
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    throw error;
  }
}

export async function obterIndicadores() {
  try {
    const response = await fetch(`${API_URL}/pedidos/indicadores`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao obter indicadores:", error);
    throw error;
  }
}

// ===== DISPONIBILIDADES =====
export async function listarJanelas(query?: any) {
  try {
    const params = new URLSearchParams(query || {});
    const response = await fetch(`${API_URL}/disponibilidades/janelas?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar janelas:", error);
    throw error;
  }
}

export async function obterJanela(janelaId: string, query?: any) {
  try {
    const params = new URLSearchParams(query || {});
    const response = await fetch(`${API_URL}/disponibilidades/janelas/${janelaId}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao obter janela:", error);
    throw error;
  }
}

export async function criarJanela(data: any) {
  try {
    const response = await fetch(`${API_URL}/disponibilidades/janelas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao criar janela:", error);
    throw error;
  }
}

export async function listarHorariosPorServico(servicoId: string) {
  try {
    const response = await fetch(`${API_URL}/disponibilidades/servicos/${servicoId}/horarios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao listar horários:", error);
    throw error;
  }
}

export async function reservarHorario(horarioId: string, servicoId: string) {
  try {
    const response = await fetch(`${API_URL}/disponibilidades/horarios/${horarioId}/reservar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ servicoId }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao reservar horário:", error);
    throw error;
  }
}

// ===== JANELAS DE DISPONIBILIDADE =====
export async function atualizarJanela(janelaId: string, data: any) {
  try {
    const response = await fetch(`${API_URL}/disponibilidades/janelas/${janelaId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao atualizar janela:", error);
    throw error;
  }
}

export async function deletarJanela(janelaId: string) {
  try {
    const response = await fetch(`${API_URL}/disponibilidades/janelas/${janelaId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao deletar janela:", error);
    throw error;
  }
}

// ===== HISTÓRICO DE PEDIDOS =====
export async function obterHistoricoPedido(pedidoId: string) {
  try {
    const response = await fetch(`${API_URL}/pedidos/${pedidoId}/historico`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao obter histórico:", error);
    throw error;
  }
}
