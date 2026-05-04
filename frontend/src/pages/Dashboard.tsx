import { useState, useEffect } from "react";

interface Agendamento {
  id?: number;
  cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  duracao: string;
  status?: "Pendente" | "Confirmado" | "Concluído";
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
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

  const bgEscuroBlur = "src/public/assets/bg-escuro-blur.jpeg";
  const bgClaroBlur = "src/public/assets/bg-claro-blur.jpeg";
  const bgEscuro = "src/public/assets/bg-escuro.jpeg";
  const bgClaro = "src/public/assets/bg-claro.jpeg";

  const currentBg = isModalOpen
    ? (darkMode ? bgEscuroBlur : bgClaroBlur)
    : (darkMode ? bgEscuro : bgClaro);

  const [formData, setFormData] = useState<Agendamento>({
    cliente: "",
    telefone: "",
    servico: "",
    data: "",
    horario: "",
    duracao: "01:00",
  });

  const hoje = new Date().toISOString().split("T")[0];

  const handleOpenModal = (agendamento?: Agendamento) => {
    if (agendamento) {
      setEditingId(agendamento.id ?? null);
      setFormData(agendamento);
    } else {
      setEditingId(null);
      setFormData({
        cliente: "", telefone: "", servico: "", data: "", horario: "", duracao: "01:00",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <div
      className="w-full min-h-screen transition-all duration-500 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${currentBg})` }}
    >
      <div className="min-h-screen w-full bg-white/0 dark:bg-black/20 transition-colors duration-500">
        <div className="max-w-6xl mx-auto pt-8 px-4 pb-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-pink-600 tracking-tighter drop-shadow-[0_4.2px_1.2px_rgba(0,0,0,0.8)]"
                  style={{ WebkitTextStroke: "1px #db2777" }}>
                NailStyle 💅
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Mantenha suas unhas impecáveis.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`p-3 rounded-2xl transition-all shadow-md ${darkMode ? 'bg-gray-800 text-yellow-400 border border-gray-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => handleOpenModal()}
                className="bg-pink-600 text-white font-bold px-5 py-3 rounded-2xl hover:bg-pink-700 shadow-md transition-all active:scale-95 uppercase text-sm tracking-wider"
              >
                + Novo Agendamento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
               <div className="flex justify-between items-center mb-5">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">Confirmado</span>
                  <button onClick={() => handleOpenModal()} className="text-pink-500 font-bold text-xs">EDITAR</button>
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Victoria Lima</h3>
               <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 font-medium italic">Alongamento em Gel</p>
               <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm border-t dark:border-gray-800 pt-5 font-semibold">
                  <span className="text-pink-500">📅 30/04/26</span>
                  <span>⏰ 14:00</span>
               </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-gray-800">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">
                {editingId ? "Editar Agendamento" : "Novo Agendamento"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nome do Cliente *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white placeholder:text-gray-400" 
                      placeholder="Ex: Maria Oliveira"
                      value={formData.cliente}
                      onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Telefone *</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white placeholder:text-gray-400" 
                      placeholder="Ex: 71999998888"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Serviço *</label>
                      <select 
                        required
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white appearance-none"
                        value={formData.servico}
                        onChange={(e) => setFormData({...formData, servico: e.target.value})}
                      >
                        <option value="">Serviço...</option>
                        <option value="Manicure">Manicure</option>
                        <option value="Pedicure">Pedicure</option>
                        <option value="Alongamento">Alongamento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Duração *</label>
                      <select 
                        required
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white appearance-none"
                        value={formData.duracao}
                        onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                      >
                        <option value="00:30">30 min</option>
                        <option value="01:00">1h</option>
                        <option value="01:30">1h 30m</option>
                        <option value="02:00">2h</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Data *</label>
                      <input 
                        type="date" 
                        required
                        min={hoje}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Horário *</label>
                      <input 
                        type="time" 
                        required
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" 
                        value={formData.horario}
                        onChange={(e) => setFormData({...formData, horario: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-pink-600 text-white font-black rounded-2xl hover:bg-pink-700 transition-all mt-4 uppercase tracking-widest active:scale-95 shadow-lg shadow-pink-500/20"
                >
                  {editingId ? "Atualizar" : "Salvar Agendamento"}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}