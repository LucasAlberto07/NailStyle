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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Registre-se - NailStyle
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
            type="text"
            placeholder="Nome completo"
            className="border p-2 rounded"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
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
          <input
            type="password"
            placeholder="Confirmar Senha"
            className="border p-2 rounded"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErro("");
            }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrar"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Já tem conta?{" "}
          <Link to="/login" className="text-black font-bold underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
