import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao NailStyle</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Sua plataforma de agendamento de serviços de unhas
          </p>

          {usuario ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Olá, <span className="font-bold">{usuario.nome}</span>
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-black text-white px-6 py-3 rounded text-lg hover:bg-gray-800 inline-block"
              >
                Ir para Serviços
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-black text-white px-6 py-3 rounded text-lg hover:bg-gray-800 inline-block"
              >
                Fazer Login
              </button>
              <p className="text-gray-600">ou</p>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-700 text-white px-6 py-3 rounded text-lg hover:bg-gray-800 inline-block"
              >
                Registrar-se
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
