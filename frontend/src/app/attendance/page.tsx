"use client";
import { useState, useEffect } from "react";
import { 
  Search, Users, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, UserCheck, UserX, RefreshCw, 
  Calendar, AlertCircle, Save, RotateCcw 
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

const API_BASE = "http://localhost:8081";

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
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [todayDate, setTodayDate] = useState("");

  // Carregar atletas e chamada de hoje
  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setTodayDate(today);
      setSelectedDate(today);

      // Buscar atletas
      const athletesRes = await fetch(`${API_BASE}/athletes?_t=${Date.now()}`);
      const athletesData = await athletesRes.json();
      
      // Buscar chamada de hoje
      const attendanceRes = await fetch(`${API_BASE}/attendance/today?date=${today}`);
      const attendanceData = await attendanceRes.json();

      // Mesclar dados
      const merged = athletesData.map((a: Athlete) => ({
        ...a,
        present: attendanceData.find((att: any) => att.athlete_id === a.id)?.present || false,
      }));

      setAthletes(merged);
      setFilteredAthletes(merged);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar atletas
  useEffect(() => {
    let filtered = athletes;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, athletes]);

  const toggleAttendance = (athleteId: string) => {
    setAthletes(prev =>
      prev.map(a =>
        a.id === athleteId ? { ...a, present: !a.present } : a
      )
    );
  };

  const markAllPresent = () => {
    const filteredIds = filteredAthletes.map(a => a.id);
    setAthletes(prev =>
      prev.map(a => {
        if (filteredIds.includes(a.id)) {
          return { ...a, present: true };
        }
        return a;
      })
    );
  };

  const markAllAbsent = () => {
    const filteredIds = filteredAthletes.map(a => a.id);
    setAthletes(prev =>
      prev.map(a => {
        if (filteredIds.includes(a.id)) {
          return { ...a, present: false };
        }
        return a;
      })
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let successCount = 0;
      let errorCount = 0;

      for (const athlete of athletes) {
        try {
          const response = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              athlete_id: athlete.id,
              training_date: today,
              present: athlete.present || false,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        alert(`✅ Chamada salva com sucesso!\n${successCount} atletas registrados.`);
        await fetchData();
      } else {
        alert(`⚠️ ${successCount} atletas salvos, ${errorCount} com erro.`);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar chamada");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async (athlete: Athlete) => {
    try {
      const res = await fetch(`${API_BASE}/attendance/athlete/${athlete.id}`);
      const data = await res.json();
      setAttendanceHistory(data || []);
      setSelectedAthlete(athlete);
      setShowHistory(true);
    } catch (error) {
      alert("Erro ao carregar histórico");
    }
  };

  const getStats = () => {
    const total = filteredAthletes.length;
    const present = filteredAthletes.filter(a => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando chamada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">📋 Chamada</h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-400">👥 Total</p>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.present}</p>
          <p className="text-sm text-gray-400">✅ Presentes</p>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
          <p className="text-sm text-gray-400">❌ Ausentes</p>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.percentage}%</p>
          <p className="text-sm text-gray-400">📊 Presença</p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar atleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#161B22] border border-[#30363D] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">📋 Todas as categorias</option>
          <option value="Sub-10">🏷️ Sub-10</option>
          <option value="Sub-12">🏷️ Sub-12</option>
          <option value="Sub-14">🏷️ Sub-14</option>
          <option value="Sub-16">🏷️ Sub-16</option>
          <option value="Sub-18">🏷️ Sub-18</option>
          <option value="Sub-20">🏷️ Sub-20</option>
        </select>
      </div>

      {/* Ações em massa */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={markAllPresent}
          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition border border-green-500/20 flex items-center gap-2"
        >
          <CheckCircle size={18} />
          Todos Presentes
        </button>
        <button
          onClick={markAllAbsent}
          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition border border-red-500/20 flex items-center gap-2"
        >
          <XCircle size={18} />
          Todos Ausentes
        </button>
      </div>

      {/* Lista de Atletas */}
      {filteredAthletes.length === 0 ? (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-12 text-center">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum atleta encontrado</p>
        </div>
      ) : (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#30363D]">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.id}
                className="flex flex-wrap items-center justify-between p-4 hover:bg-[#21262D] transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{athlete.name}</p>
                    <p className="text-sm text-gray-400">{athlete.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={() => toggleAttendance(athlete.id)}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      athlete.present
                        ? 'bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30'
                        : 'bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30'
                    }`}
                  >
                    {athlete.present ? (
                      <>
                        <CheckCircle size={18} />
                        <span className="text-sm">Presente</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <span className="text-sm">Ausente</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => loadHistory(athlete)}
                    className="bg-[#21262D] hover:bg-[#30363D] p-2 rounded-lg transition"
                    title="Ver histórico"
                  >
                    <Clock size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão Salvar */}
      <button
        onClick={saveAttendance}
        disabled={saving}
        className={`w-full mt-6 py-3 rounded-xl transition flex items-center justify-center gap-2 ${
          saving
            ? 'bg-blue-600/50 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Save size={20} />
            💾 Salvar Chamada
          </>
        )}
      </button>

      {/* Modal de Histórico */}
      {showHistory && selectedAthlete && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-[#30363D]">
              <h2 className="text-xl font-bold text-white">
                📊 Histórico - {selectedAthlete.name}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {attendanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum registro encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#0D1117] p-3 rounded-lg"
                    >
                      <span className="text-gray-300">
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.present
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}
                      >
                        {item.present ? '✅ Presente' : '❌ Ausente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
