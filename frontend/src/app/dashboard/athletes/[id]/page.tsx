// frontend/src/app/dashboard/athletes/[id]/pages.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Pencil, Trash2, FileText, Calendar, Users, 
  Clock, Award, Download, CheckCircle, XCircle, Activity,
  TrendingUp, TrendingDown, BarChart3, Eye, ChevronDown, ChevronUp
} from "lucide-react";

type Athlete = {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
};

type AttendanceRecord = {
  date: string;
  present: boolean;
};

function useAthleteId() {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const athletesIndex = parts.indexOf('athletes');
  if (athletesIndex !== -1 && parts.length > athletesIndex + 1) {
    return parts[athletesIndex + 1];
  }
  return null;
}

export default function AthleteDetailsPage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    const athleteId = useAthleteId();
    if (athleteId) {
      setId(athleteId);
    }
  }, []);

  useEffect(() => {
    const fetchAthlete = async () => {
      if (!id) return;
      
      try {
        const res = await fetch(`http://localhost:8081/athletes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAthlete(data);
        } else {
          alert("Erro ao buscar dados do atleta.");
          router.push("/dashboard/athletes");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro de comunicação.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAthlete();
    }
  }, [id, router]);

  const fetchAttendanceHistory = async () => {
    if (!id) return;
    
    setAttendanceLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/attendance/athlete/${id}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Dados de presença:", data);
        setAttendanceHistory(data);
        setShowAttendance(true);
      } else {
        alert("Erro ao buscar histórico de presenças.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao buscar histórico.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este atleta?")) return;
    
    try {
      const res = await fetch(`http://localhost:8081/athletes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Atleta excluído com sucesso!");
        router.push("/dashboard/athletes");
      } else {
        alert("Erro ao excluir atleta.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação.");
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Calcular estatísticas de presença
  const totalAttendance = attendanceHistory.length;
  const presentCount = attendanceHistory.filter(a => a.present).length;
  const absentCount = totalAttendance - presentCount;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-400">Carregando dados do atleta...</div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-8 text-gray-400">Atleta não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/dashboard/athletes/${id}/edit`)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition px-4 py-2 rounded-lg hover:bg-blue-900/20"
          >
            <Pencil size={20} /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition px-4 py-2 rounded-lg hover:bg-red-900/20"
          >
            <Trash2 size={20} /> Excluir
          </button>
        </div>
      </div>

      {/* Card do Atleta */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
        {/* Header com foto */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-8 flex flex-col md:flex-row items-center gap-6 border-b border-[#30363D]">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 flex-shrink-0">
            {athlete.avatar_url ? (
              <img 
                src={`http://localhost:8081${athlete.avatar_url}`} 
                alt={athlete.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                        ${athlete.name.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {athlete.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold">{athlete.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-400">
              <span className="flex items-center gap-1">
                <Users size={18} className="text-blue-400" />
                {athlete.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={18} className="text-purple-400" />
                {new Date(athlete.birth_date).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={18} className="text-green-400" />
                {calculateAge(athlete.birth_date)} anos
              </span>
            </div>
          </div>

          {/* Botão Verificar Presença */}
          <button
            onClick={fetchAttendanceHistory}
            disabled={attendanceLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            <Activity size={20} />
            {attendanceLoading ? "Carregando..." : "Verificar Presença"}
          </button>
        </div>

        {/* Informações detalhadas */}
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-bold mb-4">📋 Informações do Atleta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Users size={16} />
                <span className="text-sm">Categoria</span>
              </div>
              <p className="font-medium">{athlete.category}</p>
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar size={16} />
                <span className="text-sm">Data de Nascimento</span>
              </div>
              <p className="font-medium">{new Date(athlete.birth_date).toLocaleDateString("pt-BR")}</p>
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock size={16} />
                <span className="text-sm">Idade</span>
              </div>
              <p className="font-medium">{calculateAge(athlete.birth_date)} anos</p>
            </div>

            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Award size={16} />
                <span className="text-sm">Status</span>
              </div>
              <p className="font-medium text-green-400">Ativo</p>
            </div>
          </div>

          {/* Documentos */}
          <div className="border-t border-[#30363D] pt-6">
            <h3 className="text-lg font-bold mb-4">📄 Documentos</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-green-400" />
                  <div>
                    <p className="font-medium">Ficha Médica</p>
                    <p className="text-sm text-gray-400">
                      {athlete.medical_form_url ? "Documento anexado" : "Nenhum documento anexado"}
                    </p>
                  </div>
                </div>
                {athlete.medical_form_url && (
                  <a
                    href={`http://localhost:8081${athlete.medical_form_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm"
                  >
                    <Download size={16} />
                    Visualizar PDF
                  </a>
                )}
              </div>

              <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-blue-400" />
                  <div>
                    <p className="font-medium">Foto do Atleta</p>
                    <p className="text-sm text-gray-400">
                      {athlete.avatar_url ? "Foto anexada" : "Nenhuma foto anexada"}
                    </p>
                  </div>
                </div>
                {athlete.avatar_url && (
                  <a
                    href={`http://localhost:8081${athlete.avatar_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm"
                  >
                    <Download size={16} />
                    Visualizar Foto
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Histórico de Presenças */}
          {showAttendance && (
            <div className="border-t border-[#30363D] pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">📊 Histórico de Presenças</h3>
                <button
                  onClick={() => setShowAttendance(false)}
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1"
                >
                  <XCircle size={16} /> Fechar
                </button>
              </div>

              {attendanceLoading ? (
                <div className="text-center py-4 text-gray-400">Carregando histórico...</div>
              ) : attendanceHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-[#0D1117] rounded-lg border border-[#30363D]">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhum registro de presença encontrado</p>
                  <p className="text-sm mt-1">Registre a primeira chamada deste atleta</p>
                </div>
              ) : (
                <>
                  {/* Estatísticas de Presença */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-xl font-bold">{totalAttendance}</p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Presentes</p>
                      <p className="text-xl font-bold text-green-400">{presentCount}</p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Faltas</p>
                      <p className="text-xl font-bold text-red-400">{absentCount}</p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Frequência</p>
                      <p className={`text-xl font-bold ${
                        attendanceRate >= 75 ? 'text-green-400' : 
                        attendanceRate >= 50 ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {attendanceRate}%
                      </p>
                    </div>
                  </div>

                  {/* Lista de Presenças */}
                  <div className="bg-[#0D1117] border border-[#30363D] rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-[#161B22] sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Dia da Semana</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#30363D]">
                        {attendanceHistory.map((record, index) => {
                          const date = new Date(record.date);
                          const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                          return (
                            <tr key={index} className="hover:bg-[#21262D] transition">
                              <td className="px-4 py-2 text-sm">{date.toLocaleDateString('pt-BR')}</td>
                              <td className="px-4 py-2 text-sm">
                                {record.present ? (
                                  <span className="flex items-center gap-1 text-green-400">
                                    <CheckCircle size={14} /> Presente
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-400">
                                    <XCircle size={14} /> Faltou
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-400">
                                {weekDays[date.getDay()]}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botões rápidos */}
          <div className="border-t border-[#30363D] pt-6 flex flex-wrap gap-3">
            <button
              onClick={fetchAttendanceHistory}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
            >
              <Activity size={18} />
              Ver Presenças
            </button>
            <button
              onClick={() => router.push("/attendance")}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition"
            >
              <Calendar size={18} />
              Chamada Geral
            </button>
            <button
              onClick={() => router.push("/media/photos")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition"
            >
              <Eye size={18} />
              Ver Mídias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
