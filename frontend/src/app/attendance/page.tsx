"use client";
import { useState, useEffect } from "react";
import { 
  Search, Users, CheckCircle, XCircle, Clock, 
  RefreshCw, Save
} from "lucide-react";

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
}

interface AttendanceStatus {
  athlete_id: string;
  name: string;
  category: string;
  present: boolean;
  avatar_url: string | null;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

interface AthleteAttendanceStats {
  athlete_id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  total: number;
  present: number;
  absent: number;
  percentage: number;
  records: AttendanceRecord[];
}

// CORREÇÃO: URL correta para o backend no Docker
// No Docker, o backend está em http://retesp-backend:8080
// Para desenvolvimento local, use http://localhost:8081
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8081' 
  : 'http://retesp-backend:8080';

// Função para formatar data DD/MM/YYYY
const formatDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  let formatted = cleaned;
  if (cleaned.length > 2) {
    formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  }
  if (cleaned.length > 4) {
    formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4, 8);
  }
  return formatted;
};

// Função para converter DD/MM/YYYY para YYYY-MM-DD
const convertToDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export default function AttendancePage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [displayDate, setDisplayDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);
  const [athleteHistory, setAthleteHistory] = useState<Record<string, AthleteAttendanceStats>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  const fetchAthletes = async () => {
    try {
      console.log('📡 Buscando atletas de:', API_BASE);
      const res = await fetch(`${API_BASE}/athletes?_t=${Date.now()}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`✅ ${data.length} atletas encontrados`);
      setAthletes(data || []);
      
      const initialAttendance = (data || []).map((athlete: any) => ({
        athlete_id: athlete.id,
        name: athlete.name,
        category: athlete.category,
        present: false,
        avatar_url: athlete.avatar_url,
      }));
      setAttendance(initialAttendance);
      updateStats(initialAttendance);
      
    } catch (error) {
      console.error('❌ Erro ao carregar atletas:', error);
      // Não mostrar alerta de erro, apenas log
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAttendanceByDate = async (date: string) => {
    try {
      console.log(`📡 Buscando chamada para data: ${date}`);
      
      const res = await fetch(`${API_BASE}/attendance/today?date=${date}&_t=${Date.now()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${data.length} registros encontrados para ${date}`);
        
        const updatedAttendance = attendance.map((item) => {
          const found = data.find((d: any) => d.athlete_id === item.athlete_id);
          return {
            ...item,
            present: found ? found.present : false,
          };
        });
        
        setAttendance(updatedAttendance);
        updateStats(updatedAttendance);
      } else {
        console.warn(`⚠️ Nenhum registro encontrado para ${date}`);
        const resetAttendance = attendance.map((item) => ({
          ...item,
          present: false,
        }));
        setAttendance(resetAttendance);
        updateStats(resetAttendance);
      }
    } catch (error) {
      console.error('Erro ao buscar chamada:', error);
    }
  };

  const fetchAthleteHistory = async (athleteId: string) => {
    if (athleteHistory[athleteId]) return;

    setLoadingHistory(prev => ({ ...prev, [athleteId]: true }));

    try {
      const res = await fetch(`${API_BASE}/attendance/athlete/${athleteId}?_t=${Date.now()}`);
      if (res.ok) {
        const data: AttendanceRecord[] = await res.json();
        
        const total = data.length;
        const present = data.filter(r => r.present).length;
        const absent = total - present;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        const sortedRecords = [...data].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const athlete = athletes.find(a => a.id === athleteId);

        setAthleteHistory(prev => ({
          ...prev,
          [athleteId]: {
            athlete_id: athleteId,
            name: athlete?.name || '',
            category: athlete?.category || '',
            avatar_url: athlete?.avatar_url || null,
            total,
            present,
            absent,
            percentage,
            records: sortedRecords,
          }
        }));
      } else {
        console.error('Erro ao buscar histórico:', res.status);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [athleteId]: false }));
    }
  };

  const toggleExpand = (athleteId: string) => {
    if (expandedAthlete === athleteId) {
      setExpandedAthlete(null);
    } else {
      setExpandedAthlete(athleteId);
      if (!athleteHistory[athleteId]) {
        fetchAthleteHistory(athleteId);
      }
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (athletes.length > 0) {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      fetchAttendanceByDate(date);
    }
  }, [selectedDate, athletes]);

  const updateStats = (attendanceList: AttendanceStatus[]) => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    setStats({ total, present, absent, percentage });
  };

  const toggleAttendance = (athleteId: string) => {
    const updated = attendance.map((item) =>
      item.athlete_id === athleteId
        ? { ...item, present: !item.present }
        : item
    );
    setAttendance(updated);
    updateStats(updated);
  };

  const getFilteredAthletes = () => {
    let filtered = attendance;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    return filtered;
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const date = selectedDate || new Date().toISOString().split('T')[0];
      let successCount = 0;
      let errorCount = 0;

      for (const item of attendance) {
        try {
          const response = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              athlete_id: item.athlete_id,
              training_date: date,
              present: item.present || false,
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

      setAthleteHistory({});
      setExpandedAthlete(null);

      if (errorCount === 0) {
        fetchAttendanceByDate(date);
      }
      
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? true : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const markAllAbsent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? false : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setAthleteHistory({});
    setExpandedAthlete(null);
    const date = selectedDate || new Date().toISOString().split('T')[0];
    fetchAthletes();
    fetchAttendanceByDate(date);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Hoje';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDisplayDate(formatted);
  };

  const confirmDate = () => {
    if (displayDate) {
      const parts = displayDate.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        setSelectedDate(formattedDate);
        setDisplayDate('');
        setShowDatePicker(false);
      }
    }
  };

  const renderExpandedContent = (athleteId: string) => {
    const history = athleteHistory[athleteId];
    const isLoading = loadingHistory[athleteId];
    const athlete = athletes.find(a => a.id === athleteId);

    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-400 text-sm mt-2">⏳ Carregando histórico...</p>
        </div>
      );
    }

    if (!history || history.records.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-gray-400 text-sm">Nenhum registro de presença encontrado</p>
        </div>
      );
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {athlete?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-white">{history.name}</p>
              <p className="text-xs text-gray-400">{history.category}</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedAthlete(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            ✖️
          </button>
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium text-white">📊 Histórico de Presenças</p>
          <div className="flex gap-3 text-sm">
            <span className="text-green-400">✅ {history.present}</span>
            <span className="text-red-400">❌ {history.absent}</span>
            <span className="text-blue-400">📊 {history.percentage.toFixed(0)}%</span>
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1">
          {history.records.slice(0, 20).map((item, index) => {
            const date = new Date(item.date);
            const isLast = index === history.records.slice(0, 20).length - 1;
            return (
              <div
                key={index}
                className={`flex justify-between items-center p-2 bg-[#161B22] rounded-lg ${
                  !isLast && 'border-b border-[#30363D]'
                }`}
              >
                <span className="text-gray-300 text-sm">
                  {date.toLocaleDateString('pt-BR')}
                </span>
                <span className={`text-sm font-medium ${
                  item.present ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.present ? '✅ Presente' : '❌ Faltou'}
                </span>
                <span className="text-xs text-gray-500">
                  {weekDays[date.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const categories = Array.from(new Set(athletes.map(a => a.category)));
  const filteredAthletes = getFilteredAthletes();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">⏳ Carregando chamada...</p>
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
            {formatDateDisplay(selectedDate || getTodayDate())}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
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
          <p className="text-2xl font-bold text-blue-400">{stats.percentage.toFixed(0)}%</p>
          <p className="text-sm text-gray-400">📊 Presença</p>
        </div>
      </div>

      {/* Date Selector COM EMOJIS */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeDate(-1)}
          className="text-gray-400 hover:text-white p-2 transition text-3xl"
        >
          ◀️
        </button>
        
        <button
          onClick={() => {
            setShowDatePicker(true);
          }}
          className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-6 py-2 rounded-lg hover:border-blue-500 transition"
        >
          <span className="text-xl">📅</span>
          <span className="text-white">
            {selectedDate ? formatDateDisplay(selectedDate) : 'Hoje'}
          </span>
        </button>
        
        <button
          onClick={() => changeDate(1)}
          className="text-gray-400 hover:text-white p-2 transition text-3xl"
        >
          ▶️
        </button>
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
          <option value="all">🏷️ Todas</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">📊 Taxa de Presença</span>
          <span className="text-blue-400 font-bold">{stats.percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-[#21262D] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Ações em massa */}
      <div className="flex flex-wrap gap-3 mb-6">
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#30363D]">
          <p className="text-white font-medium">👥 Atletas</p>
        </div>

        {filteredAthletes.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum atleta encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-[#30363D]">
            {filteredAthletes.map((item) => {
              const isExpanded = expandedAthlete === item.athlete_id;
              
              if (expandedAthlete && expandedAthlete !== item.athlete_id) {
                return null;
              }
              
              return (
                <div key={item.athlete_id}>
                  <div
                    className={`flex flex-wrap items-center justify-between p-4 hover:bg-[#21262D] transition cursor-pointer ${
                      item.present ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                    } ${isExpanded ? 'bg-[#21262D]' : ''}`}
                    onClick={() => toggleAttendance(item.athlete_id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {item.avatar_url ? (
                          <img src={`${API_BASE}${item.avatar_url}`} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAttendance(item.athlete_id);
                        }}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                          item.present
                            ? 'bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30'
                            : 'bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600/30'
                        }`}
                      >
                        {item.present ? (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.athlete_id);
                        }}
                        className="bg-[#21262D] hover:bg-[#30363D] p-2 rounded-lg transition text-xl"
                        title={isExpanded ? "Fechar histórico" : "Ver histórico"}
                      >
                        {isExpanded ? '🔽' : '▶️'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-[#0D1117]">
                      {renderExpandedContent(item.athlete_id)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Modal de Data */}
      {showDatePicker && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDatePicker(false);
            setDisplayDate('');
          }}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white text-center mb-4">📅 Selecionar Data</h2>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-blue-500"
              value={displayDate}
              onChange={(e) => handleDateChange(e.target.value)}
              maxLength={10}
            />
            <p className="text-gray-400 text-sm text-center mt-2 mb-4">
              Digite no formato: dia/mês/ano (ex: 15/03/2024)
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDisplayDate('');
                  setShowDatePicker(false);
                }}
                className="flex-1 bg-[#21262D] hover:bg-[#30363D] py-3 rounded-lg transition text-white"
              >
                ❌ Cancelar
              </button>
              <button
                onClick={confirmDate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition text-white font-semibold"
              >
                ✅ Confirmar
              </button>
            </div>
            
            <button
              onClick={() => {
                setSelectedDate('');
                setDisplayDate('');
                setShowDatePicker(false);
              }}
              className="w-full text-blue-400 hover:text-blue-300 text-sm mt-3 transition"
            >
              📅 Voltar para hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}