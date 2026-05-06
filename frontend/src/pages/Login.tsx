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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login - NailStyle
        </h1>
        {erro && (
          <Alert
            type="error"
            message={erro}
            onClose={() => setErro("")}
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Não tem conta?{" "}
          <Link to="/register" className="text-black font-bold underline">
            Registre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
