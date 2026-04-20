const API_URL = "http://localhost:3001/agendamentos";

export async function buscarAgendamento() {
  const response = await fetch(API_URL);
  return response.json();
}
export async function criarAgendamento(data: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function atualizarStatus(id: number, status: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return response.json();
}
export async function deletarAgendamento(id: number) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
