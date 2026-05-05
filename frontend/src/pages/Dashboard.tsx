import { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type StatusKanban = "Agendado" | "Em Atendimento" | "Concluído" | "Cancelado";

interface Agendamento {
  id: string;
  cliente: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  duracao: string;
  status: StatusKanban;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function hojeLocalISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function parseDurationToMinutes(value: string): number {
  const [hhRaw, mmRaw] = value.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  return Math.max(0, hh * 60 + mm);
}

function toDateTimeLocal(dateISO: string, timeHHMM: string): Date | null {
  if (!dateISO || !timeHHMM) return null;
  const dt = new Date(`${dateISO}T${timeHHMM}`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const COLUNAS: { status: StatusKanban; title: string }[] = [
  { status: "Agendado", title: "Agendado" },
  { status: "Em Atendimento", title: "Em Atendimento" },
  { status: "Concluído", title: "Concluído" },
  { status: "Cancelado", title: "Cancelado" },
];

function statusBadgeClasses(status: StatusKanban) {
  switch (status) {
    case "Agendado":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    case "Em Atendimento":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    case "Concluído":
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    case "Cancelado":
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  }
}

function columnRingClasses(status: StatusKanban) {
  switch (status) {
    case "Agendado":
      return "ring-amber-200/70 dark:ring-amber-900/30";
    case "Em Atendimento":
      return "ring-blue-200/70 dark:ring-blue-900/30";
    case "Concluído":
      return "ring-green-200/70 dark:ring-green-900/30";
    case "Cancelado":
      return "ring-red-200/70 dark:ring-red-900/30";
  }
}

function Column({
  status,
  title,
  count,
  children,
}: {
  status: StatusKanban;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 ring-2 ${columnRingClasses(status)} ${
        isOver ? "scale-[1.01] shadow-xl" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${statusBadgeClasses(status)}`}>{title}</span>
          <span className="text-xs font-black text-gray-400 dark:text-gray-500">{count}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">solte aqui</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Card({
  agendamento,
  onEdit,
}: {
  agendamento: Agendamento;
  onEdit: (a: Agendamento) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: agendamento.id,
    data: { type: "card" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 transition-transform ${
        isDragging ? "opacity-60 scale-[0.98]" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${statusBadgeClasses(agendamento.status)}`}>
          {agendamento.status}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(agendamento)}
            className="text-pink-500 font-black text-xs uppercase tracking-widest"
          >
            Editar
          </button>
          <button
            type="button"
            className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing"
            aria-label="Arrastar"
            {...listeners}
            {...attributes}
          >
            ⠿
          </button>
        </div>
      </div>

      <h3 className="text-lg font-black text-gray-800 dark:text-white mb-1 leading-tight">{agendamento.cliente || "(Sem nome)"}</h3>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-5 font-medium italic">{agendamento.servico || "(Sem serviço)"}</p>
      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm border-t dark:border-gray-800 pt-4 font-semibold">
        <span className="text-pink-500">📅 {agendamento.data || "-"}</span>
        <span>⏰ {agendamento.horario || "-"}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  const hoje = useMemo(() => hojeLocalISO(), []);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => [
    {
      id: newId(),
      cliente: "Victoria Lima",
      telefone: "71999998888",
      servico: "Alongamento em Gel",
      data: hoje,
      horario: "14:00",
      duracao: "01:30",
      status: "Agendado",
    },
  ]);

  const [formData, setFormData] = useState<Omit<Agendamento, "id">>({
    cliente: "",
    telefone: "",
    servico: "",
    data: hoje,
    horario: "",
    duracao: "01:00",
    status: "Agendado",
  });

  const handleOpenModal = (agendamento?: Agendamento) => {
    if (agendamento) {
      setEditingId(agendamento.id);
      const { id: _id, ...rest } = agendamento;
      setFormData(rest);
    } else {
      setEditingId(null);
      setFormData({
        cliente: "",
        telefone: "",
        servico: "",
        data: hoje,
        horario: "",
        duracao: "01:00",
        status: "Agendado",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAgendamentos(prev =>
        prev.map(a => (a.id === editingId ? { ...a, ...formData, id: editingId } : a)),
      );
    } else {
      setAgendamentos(prev => [
        ...prev,
        {
          id: newId(),
          ...formData,
        },
      ]);
    }
    setIsModalOpen(false);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const isColumn = COLUNAS.some(c => c.status === overId);
    let nextStatus: StatusKanban | null = null;

    if (isColumn) {
      nextStatus = overId as StatusKanban;
    } else {
      const overCard = agendamentos.find(a => a.id === overId);
      if (overCard) nextStatus = overCard.status;
    }

    if (!nextStatus) return;

    setAgendamentos(prev => prev.map(a => (a.id === activeId ? { ...a, status: nextStatus! } : a)));
  };

  const agendamentosHoje = useMemo(() => agendamentos.filter(a => a.data === hoje), [agendamentos, hoje]);
  const concluidosHoje = useMemo(
    () => agendamentosHoje.filter(a => a.status === "Concluído").length,
    [agendamentosHoje],
  );

  const atrasados = useMemo(() => {
    const now = new Date();
    return agendamentos.filter(a => {
      if (a.status !== "Agendado") return false;
      const dt = toDateTimeLocal(a.data, a.horario);
      if (!dt) return false;
      return dt.getTime() < now.getTime();
    }).length;
  }, [agendamentos]);

  const sobrecargaHoje = useMemo(() => {
    const ativos = agendamentosHoje
      .filter(a => a.status === "Agendado" || a.status === "Em Atendimento")
      .map(a => {
        const dt = toDateTimeLocal(a.data, a.horario);
        return {
          start: dt?.getTime() ?? NaN,
          durMin: parseDurationToMinutes(a.duracao),
        };
      })
      .filter(x => Number.isFinite(x.start))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < ativos.length; i++) {
      const prev = ativos[i - 1];
      const curr = ativos[i];
      const prevEnd = prev.start + prev.durMin * 60_000;
      if (curr.start < prevEnd) return true;
    }
    return false;
  }, [agendamentosHoje]);


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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total do dia</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{agendamentosHoje.length}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-1">({hoje})</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Concluídos</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{concluidosHoje}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-1">Hoje</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Atrasados</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{atrasados}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-1">Status Agendado</p>
            </div>
            <div className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-5 rounded-3xl shadow-sm border transition-all ${
              sobrecargaHoje
                ? "border-red-200 dark:border-red-900/40"
                : "border-gray-100 dark:border-gray-800"
            }`}>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sobrecarga</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{sobrecargaHoje ? "SIM" : "NÃO"}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold mt-1">Sobreposição hoje</p>
            </div>
          </div>

          {(atrasados > 0 || sobrecargaHoje) && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {atrasados > 0 && (
                <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-900/30 rounded-3xl p-5">
                  <p className="text-amber-800 dark:text-amber-200 font-black">🚨 Atendimentos atrasados</p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold mt-1">{atrasados} agendamento(s) em “Agendado” já passaram do horário.</p>
                </div>
              )}
              {sobrecargaHoje && (
                <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/70 dark:border-red-900/30 rounded-3xl p-5">
                  <p className="text-red-800 dark:text-red-200 font-black">⚠️ Sobrecarga detectada</p>
                  <p className="text-red-700 dark:text-red-300 text-sm font-semibold mt-1">Existem horários sobrepostos hoje (baseado em horário + duração).</p>
                </div>
              )}
            </div>
          )}

          <DndContext
            sensors={sensors}
            onDragEnd={onDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {COLUNAS.map(col => {
                const itens = agendamentos.filter(a => a.status === col.status);
                return (
                  <Column key={col.status} status={col.status} title={col.title} count={itens.length}>
                    {itens.length === 0 ? (
                      <div className="p-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">Sem cards</p>
                      </div>
                    ) : (
                      itens.map(a => (
                        <Card key={a.id} agendamento={a} onEdit={() => handleOpenModal(a)} />
                      ))
                    )}
                  </Column>
                );
              })}
            </div>
          </DndContext>
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