const API_URL = "http://localhost:3001/agendamentos";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erro na requisição");
  }

  return response.json();
}

export async function buscarAgendamento() {
  try {
    const response = await fetch(API_URL);
    return handleResponse(response);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    throw error;
  }
}
export async function criarAgendamento(data: any) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    throw error;
  }
}

export async function atualizarStatus(id: number, status: string) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
}

export async function deletarAgendamento(id: number) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar agendamento");
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    throw error;
  }
}
