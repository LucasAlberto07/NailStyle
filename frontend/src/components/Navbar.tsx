import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import * as api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();

  async function handleLogout() {
    try {
      await api.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <nav className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">✨ NailStyle</h1>
        
        <div className="flex items-center gap-4">
          {usuario && (
            <>
              <span className="text-sm font-semibold">{usuario.nome}</span>
              {usuario.role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-semibold transition-all duration-200"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate("/meus-pedidos")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-semibold transition-all duration-200"
              >
                Meus Pedidos
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition-all duration-200"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
