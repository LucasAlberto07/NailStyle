import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [darkMode, setDarkMode] = useState(() => 
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const bgEscuro = "src/public/assets/bg-escuro.jpeg";
  const bgClaro = "src/public/assets/bg-claro.jpeg";

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat transition-all duration-500"
      style={{ backgroundImage: `url(${darkMode ? bgEscuro : bgClaro})` }}
    >
      <div className="absolute inset-0 bg-white/10 dark:bg-black/40 transition-colors" />

      <button
        onClick={toggleDarkMode}
        className="fixed top-5 right-5 z-20 p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700 transition-all"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="relative z-10 w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-pink-600 tracking-tight">Criar Conta 💅</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Cadastre-se para gerenciar sua agenda</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white"
              placeholder="Como quer ser chamada?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
            <input
              type="email"
              required
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <input
              type="password"
              required
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all dark:text-white"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-700 shadow-lg shadow-pink-500/30 transition-all active:scale-95 uppercase tracking-wider"
          >
            Cadastrar Profissional
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-sm text-gray-500 dark:text-gray-400 font-bold hover:text-pink-600 transition-colors">
              ← Voltar para o Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}