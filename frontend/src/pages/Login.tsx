import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [userType, setUserType] = useState<"client" | "professional">("client");
  const [skills, setSkills] = useState<string[]>([]);

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

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleSkillToggle = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@admin.com" && password === "123456") {
      setError("");
      navigate("/dashboard");
    } else {
      setError("E-mail ou senha inválidos.");
    }
  };

  const bgEscuro = "src/public/assets/bg-escuro.jpeg";
  const bgClaro = "src/public/assets/bg-claro.jpeg";

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat transition-all duration-500 relative"
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
          <h1 className="text-3xl font-black text-pink-600 tracking-tight">NailStyle 💅</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Bem-vinda de volta!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-700 shadow-lg shadow-pink-500/30 transition-all active:scale-95 uppercase tracking-wider"
          >
            Entrar
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Não tem uma conta?{" "}
              <button 
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-pink-600 font-bold hover:underline"
              >
                Criar Conta
              </button>
            </p>
          </div>
        </form>
      </div>

      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-gray-800">
            <button 
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Criar nova conta</h2>

            <form className="space-y-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${userType === "client" ? "bg-white dark:bg-gray-700 text-pink-600 shadow-sm" : "text-gray-500"}`}
                >
                  Sou Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("professional")}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${userType === "professional" ? "bg-white dark:bg-gray-700 text-pink-600 shadow-sm" : "text-gray-500"}`}
                >
                  Sou Profissional
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nome Completo</label>
                  <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 dark:text-white" placeholder="Ex: Maria Silva" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">E-mail</label>
                  <input type="email" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 dark:text-white" placeholder="seu@email.com" />
                </div>

                {userType === "professional" && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Habilidades / Especialidades</label>
                    <div className="flex flex-wrap gap-2">
                      {["Manicure", "Pedicure", "Completo"].map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            skills.includes(skill)
                              ? "bg-pink-600 border-pink-600 text-white"
                              : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Senha</label>
                  <input type="password" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 dark:text-white" placeholder="••••••••" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-700 transition-all mt-4 uppercase tracking-widest"
              >
                Finalizar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}