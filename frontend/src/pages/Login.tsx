import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import Alert from "../components/Alert";

export default function Login() {
  const navigate = useNavigate();
  const { setUsuario, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setErro("Preencha email e senha");
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      const resultado = await api.login(email, password);
      
      if (resultado.usuario) {
        setUsuario(resultado.usuario);
        setErro("");
        navigate("/dashboard");
      }
    } catch (error: any) {
      setErro(error.message || "Email ou senha inválidos");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url('/src/public/assets/bg-claro-blur.jpeg')`}}>
      <div className="w-80 bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
            NailStyle
          </h1>
          <p className="text-gray-600 text-sm mt-1">Bem-vindo de volta!</p>
        </div>
        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-MAIL"
            className="border-0 bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-sm"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="SENHA"
            className="border-0 bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-sm"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold p-3 rounded-lg hover:from-pink-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-300 transition-all duration-200 text-sm"
            disabled={isLoading}
          >
            {isLoading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-700">
          Não tem uma conta? <Link to="/register" className="text-pink-600 font-bold hover:text-pink-700 transition-colors">
            Criar Conta
          </Link>
        </p>
      </div>
    </div>
  );
}
