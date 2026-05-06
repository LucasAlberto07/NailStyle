import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/assets/bg-escuro-blur.jpeg')`}}>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center border border-white border-opacity-20">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">NailStyle</h1>
          <p className="text-gray-600 mb-8 text-lg font-semibold">
            Sua plataforma de agendamento de serviços de unhas
          </p>

          {usuario ? (
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
                Bem-vindo, <span className="font-bold text-pink-600">{usuario.nome}!</span>
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-bold hover:from-pink-700 hover:to-pink-600 transition-all duration-200 inline-block"
              >
                Ver Serviços
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-bold hover:from-pink-700 hover:to-pink-600 transition-all duration-200 inline-block"
              >
                Fazer Login
              </button>
              <p className="text-gray-600 font-semibold">ou</p>
              <button
                onClick={() => navigate("/register")}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-700 transition-all duration-200 inline-block"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
