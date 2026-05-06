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
    <nav className="bg-black text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">NailStyle</h1>
        
        <div className="flex items-center gap-4">
          {usuario && (
            <>
              <span className="text-sm">{usuario.nome}</span>
              {usuario.role === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate("/meus-pedidos")}
                className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Meus Pedidos
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
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
