import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  //estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  //função chamada ao clicar em entrar
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); //impede recarregar página

    if (!email || !password) {
      setErro("Preencha email e senha");
      return;
    }
    if (email === "admin@email.com" && password === "123456") {
      setErro("");
      navigate("/home"); // redireciona
    } else {
      setErro("Email ou senha inválidos");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login - NailStyle
        </h1>
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
          />
          <button type="submit" className="bg-black text-white p-2 rounded">
            Entrar
          </button>
        </form>
        {erro && (
          <p
            className="text-red-500 mt-3 text-sm text-center"
            style={{ color: "red" }}
          >
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
