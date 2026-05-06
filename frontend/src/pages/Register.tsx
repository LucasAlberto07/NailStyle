import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import Alert from "../components/Alert";

export default function Register() {
  const navigate = useNavigate();
  const { setUsuario, setLoading } = useAuthStore();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome || !email || !password || !confirmPassword) {
      setErro("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setErro("As senhas não correspondem");
      return;
    }

    if (password.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      setIsLoading(true);
      setLoading(true);
      const resultado = await api.registrar(nome, email, password);
      
      if (resultado?.usuario) {
        setUsuario(resultado.usuario);
        setErro("");
        navigate("/dashboard");
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao registrar");
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat py-8" style={{backgroundImage: `url('/assets/bg-claro-blur.jpeg')`}}>
      <div className="w-80 bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">
            NailStyle
          </h1>
          <p className="text-gray-600 text-sm mt-1">Crie sua conta</p>
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
            type="text"
            placeholder="NOME COMPLETO"
            className="border-0 bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-sm"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
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
          <input
            type="password"
            placeholder="CONFIRMAR SENHA"
            className="border-0 bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 text-sm"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold p-3 rounded-lg hover:from-pink-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-300 transition-all duration-200 text-sm"
            disabled={isLoading}
          >
            {isLoading ? "REGISTRANDO..." : "REGISTRAR"}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-700">
          Já tem uma conta? <Link to="/login" className="text-pink-600 font-bold hover:text-pink-700 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
