"use client";
import { useState, useEffect } from "react";
import { 
  Search, Filter, Users, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, UserCheck, UserX, RefreshCw, 
  Calendar, CalendarDays, AlertCircle, Save, RotateCcw 
} from "lucide-react";

type Athlete = {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  present?: boolean;
};

type AttendanceRecord = {
  athlete_id: string;
  date: string;
  present: boolean;
};

export default function AttendancePage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Configuração dos dias de treino
  const trainingDays = {
    tuesday: { label: "Terça-feira", group: "grandes", categories: ["Sub-16", "Sub-18", "Sub-20"] },
    friday: { label: "Sexta-feira", group: "pequenos", categories: ["Sub-10", "Sub-12", "Sub-14"] }
  };

  // Detectar o dia da semana atual
  const getCurrentDay = () => {
    const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const today = new Date();
    return days[today.getDay()];
  };

  // Sugerir grupo baseado no dia da semana
  const getSuggestedGroup = () => {
    const day = getCurrentDay();
    if (day === 'terca') return 'grandes';
    if (day === 'sexta') return 'pequenos';
    return null;
  };

  const suggestedGroup = getSuggestedGroup();

  const smallCategories = ["Sub-10", "Sub-12", "Sub-14"];
  const bigCategories = ["Sub-16", "Sub-18", "Sub-20"];

  // Carregar atletas e histórico
  const fetchAthletes = async () => {
    try {
      const res = await fetch("http://localhost:8081/athletes?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        const athletesWithAttendance = data.map((a: Athlete) => ({
          ...a,
          present: false
        }));
        setAthletes(athletesWithAttendance);
        setFilteredAthletes(athletesWithAttendance);
      }
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar chamada do dia
  const fetchTodayAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    try {
      // Buscar chamada de todos os atletas
      const res = await fetch(`http://localhost:8081/attendance/today?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data);
        
        // Atualizar status dos atletas
        setAthletes(prev => 
          prev.map(a => {
            const record = data.find((r: any) => r.athlete_id === a.id);
            return { ...a, present: record?.present || false };
          })
        );
      }
    } catch (error) {
      console.error("Erro ao buscar chamada do dia:", error);
    }
  };

  useEffect(() => {
    fetchAthletes();
    // Sugerir grupo baseado no dia
    if (suggestedGroup) {
      setSelectedCategory(suggestedGroup);
    }
    fetchTodayAttendance();
  }, []);

  // Filtrar atletas
  useEffect(() => {
    let filtered = athletes;

    if (selectedCategory !== "all") {
      if (selectedCategory === "pequenos") {
        filtered = filtered.filter(a => smallCategories.includes(a.category));
      } else if (selectedCategory === "grandes") {
        filtered = filtered.filter(a => bigCategories.includes(a.category));
      } else {
        filtered = filtered.filter(a => a.category === selectedCategory);
      }
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(term)
      );
    }

    setFilteredAthletes(filtered);
  }, [selectedCategory, searchTerm, athletes]);

  const toggleAttendance = (athleteId: string) => {
    setAthletes(prev => 
      prev.map(a => 
        a.id === athleteId ? { ...a, present: !a.present } : a
      )
    );
  };

  const markAllPresent = () => {
    setAthletes(prev => 
      prev.map(a => {
        if (filteredAthletes.some(fa => fa.id === a.id)) {
          return { ...a, present: true };
        }
        return a;
      })
    );
  };

  const markAllAbsent = () => {
    setAthletes(prev => 
      prev.map(a => {
        if (filteredAthletes.some(fa => fa.id === a.id)) {
          return { ...a, present: false };
        }
        return a;
      })
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const presentAthletes = filteredAthletes.filter(a => a.present);
      const date = selectedDate || new Date().toISOString().split('T')[0];
      
      for (const athlete of filteredAthletes) {
        const response = await fetch("http://localhost:8081/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            athlete_id: athlete.id,
            training_date: date,
            present: athlete.present || false
          })
        });
        
        if (!response.ok) {
          console.error(`Erro ao salvar presença de ${athlete.name}`);
        }
      }
      
      alert(`✅ Chamada salva com sucesso!\n📅 Data: ${new Date(date).toLocaleDateString('pt-BR')}\n✅ Presentes: ${presentAthletes.length} de ${filteredAthletes.length}`);
      
      // Recarregar a chamada do dia
      await fetchTodayAttendance();
    } catch (error) {
      console.error("Erro ao salvar chamada:", error);
      alert("❌ Erro ao salvar a chamada.");
    } finally {
      setSaving(false);
    }
  };

  const resetAttendance = () => {
    if (confirm("Tem certeza que deseja resetar todas as presenças deste dia?")) {
      setAthletes(prev => 
        prev.map(a => ({ ...a, present: false }))
      );
    }
  };

  // Calcular estatísticas
  const totalPresent = filteredAthletes.filter(a => a.present).length;
  const totalAbsent = filteredAthletes.filter(a => !a.present).length;
  const totalAthletes = filteredAthletes.length;
  const percentage = totalAthletes > 0 ? Math.round((totalPresent / totalAthletes) * 100) : 0;

  const getCategoryCount = (category: string) => {
    return athletes.filter(a => a.category === category).length;
  };

  const getSmallCount = () => {
    return athletes.filter(a => smallCategories.includes(a.category)).length;
  };

  const getBigCount = () => {
    return athletes.filter(a => bigCategories.includes(a.category)).length;
  };

  // Dia da semana atual
  const today = new Date();
  const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const currentDay = weekDays[today.getDay()];
  const currentDate = today.toLocaleDateString('pt-BR');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Cabeçalho com data */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">📋 Chamada Digital</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-400 text-sm">
              <CalendarDays size={16} className="inline mr-1" />
              {currentDay}, {currentDate}
            </p>
            {suggestedGroup && (
              <span className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                📌 Treino de {suggestedGroup === 'pequenos' ? 'Pequenos (Sub-10 a Sub-14)' : 'Grandes (Sub-16 a Sub-20)'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={resetAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
          >
            <RotateCcw size={16} />
            Resetar
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium disabled:opacity-50"
          >
            {saving ? "Salvando..." : <><Save size={16} /> Salvar Chamada</>}
          </button>
        </div>
      </div>

      {/* Alerta do dia de treino */}
      {!suggestedGroup && (
        <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-3 mb-4 flex items-center gap-3 text-yellow-400">
          <AlertCircle size={20} />
          <span className="text-sm">
            Hoje não é dia de treino programado. As chamadas são registradas normalmente.
          </span>
        </div>
      )}

      {/* Tabs de Categorias - Pequenos e Grandes */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory(selectedCategory === "pequenos" ? "all" : "pequenos")}
          className={`relative p-4 rounded-xl border-2 transition-all group ${
            selectedCategory === "pequenos"
              ? "border-blue-500 bg-blue-500/10"
              : "border-[#30363D] hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                👶
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Pequenos</p>
                <p className="text-sm text-gray-400">
                  {getSmallCount()} atletas • Terça-feira
                </p>
              </div>
            </div>
            {selectedCategory === "pequenos" && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <CheckCircle size={14} className="text-white" />
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {smallCategories.map(cat => (
              <span key={cat} className="text-xs px-2 py-0.5 bg-[#0D1117] rounded-full text-gray-400">
                {cat}
              </span>
            ))}
          </div>
        </button>

        <button
          onClick={() => setSelectedCategory(selectedCategory === "grandes" ? "all" : "grandes")}
          className={`relative p-4 rounded-xl border-2 transition-all group ${
            selectedCategory === "grandes"
              ? "border-purple-500 bg-purple-500/10"
              : "border-[#30363D] hover:border-purple-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-2xl">
                🧑
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Grandes</p>
                <p className="text-sm text-gray-400">
                  {getBigCount()} atletas • Sexta-feira
                </p>
              </div>
            </div>
            {selectedCategory === "grandes" && (
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                <CheckCircle size={14} className="text-white" />
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {bigCategories.map(cat => (
              <span key={cat} className="text-xs px-2 py-0.5 bg-[#0D1117] rounded-full text-gray-400">
                {cat}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Filtros por categoria específica */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs transition ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-[#21262D] text-gray-400 hover:text-white"
          }`}
        >
          🏆 Todas ({athletes.length})
        </button>
        {[...smallCategories, ...bigCategories].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-[#21262D] text-gray-400 hover:text-white"
            }`}
          >
            {cat} ({getCategoryCount(cat)})
          </button>
        ))}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold">{totalAthletes}</p>
            </div>
            <Users size={24} className="text-blue-400" />
          </div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Presentes</p>
              <p className="text-2xl font-bold text-green-400">{totalPresent}</p>
            </div>
            <UserCheck size={24} className="text-green-400" />
          </div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Faltas</p>
              <p className="text-2xl font-bold text-red-400">{totalAbsent}</p>
            </div>
            <UserX size={24} className="text-red-400" />
          </div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Frequência</p>
              <p className="text-2xl font-bold text-blue-400">{percentage}%</p>
            </div>
            <Clock size={24} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Ações */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar atleta por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={markAllPresent}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition text-sm"
            >
              <CheckCircle size={16} />
              Marcar todos
            </button>
            
            <button
              onClick={markAllAbsent}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
            >
              <XCircle size={16} />
              Marcar faltas
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Atletas */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando atletas...</div>
      ) : filteredAthletes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#161B22] border border-[#30363D] rounded-xl">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum atleta encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou a busca</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              onClick={() => toggleAttendance(athlete.id)}
              className={`bg-[#161B22] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition hover:border-blue-500/50 ${
                athlete.present 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-[#30363D]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  {athlete.avatar_url ? (
                    <img 
                      src={`http://localhost:8081${athlete.avatar_url}`} 
                      alt={athlete.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {athlete.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-medium">{athlete.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {athlete.category}
                    </span>
                    {suggestedGroup === 'pequenos' && smallCategories.includes(athlete.category) && (
                      <span className="text-blue-400">📌 Treino hoje</span>
                    )}
                    {suggestedGroup === 'grandes' && bigCategories.includes(athlete.category) && (
                      <span className="text-purple-400">📌 Treino hoje</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${
                  athlete.present ? "text-green-400" : "text-red-400"
                }`}>
                  {athlete.present ? "✅ Presente" : "❌ Faltou"}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  athlete.present 
                    ? "border-green-400 bg-green-400/20" 
                    : "border-gray-600"
                }`}>
                  {athlete.present && <CheckCircle size={14} className="text-green-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com resumo */}
      {filteredAthletes.length > 0 && (
        <div className="mt-6 bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Total: <span className="text-white font-medium">{totalAthletes}</span>
            </span>
            <span className="text-green-400">
              Presentes: <span className="font-medium">{totalPresent}</span>
            </span>
            <span className="text-red-400">
              Faltas: <span className="font-medium">{totalAbsent}</span>
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Frequência: <span className="text-blue-400 font-bold">{percentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
