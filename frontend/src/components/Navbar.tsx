import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import * as api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const [menuAberto, setMenuAberto] = useState(false);

  async function handleLogout() {
    try {
      await api.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  function handleNavegar(rota: string) {
    navigate(rota);
    setMenuAberto(false);
  }

  return (
    <nav className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">✨ NailStyle</h1>
        
        {/* Menu Desktop - Oculto em telas pequenas */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Botão Hamburger - Visível apenas em telas pequenas */}
        {usuario && (
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden flex flex-col gap-1.5 focus:outline-none"
            aria-label="Menu"
          >
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuAberto ? "rotate-45 translate-y-2" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuAberto ? "opacity-0" : ""}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuAberto ? "-rotate-45 -translate-y-2" : ""}`}></div>
          </button>
        )}
      </div>

      {/* Menu Mobile - Dropdown */}
      {usuario && menuAberto && (
        <div className="md:hidden mt-4 pt-4 border-t border-white border-opacity-20 flex flex-col gap-2">
          <span className="text-sm font-semibold px-2">{usuario.nome}</span>
          {usuario.role === "ADMIN" && (
            <button
              onClick={() => handleNavegar("/admin")}
              className="w-full text-left bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded text-sm font-semibold transition-all duration-200"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => handleNavegar("/meus-pedidos")}
            className="w-full text-left bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded text-sm font-semibold transition-all duration-200"
          >
            Meus Pedidos
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm font-semibold transition-all duration-200"
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
