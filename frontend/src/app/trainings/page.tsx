"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, RefreshCw, Eye, Pencil, Trash2, 
  ChevronDown, ChevronUp, Calendar, Clock, 
  Users, Target, Search, Filter
} from "lucide-react";

type Training = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  objective: string;
  date: string;
  time: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  athlete_count: number;
  coach_name?: string;
  exercises?: string[];
  created_at: string;
};

const API_BASE = "/api";

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    category: "",
    duration: "60",
    objective: "",
    date: "",
    time: "",
    exercises: [] as string[],
  });

  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🌐 Buscando treinos em:", `${API_BASE}/trainings`);
      const response = await fetch(`${API_BASE}/trainings`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Treinos carregados:", data);
      setTrainings(data);
      setFilteredTrainings(data);
    } catch (err: any) {
      console.error("❌ Erro ao buscar treinos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  useEffect(() => {
    let result = trainings;
    
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      result = result.filter(t => t.status === filterStatus);
    }
    
    if (filterCategory !== "all") {
      result = result.filter(t => t.category === filterCategory);
    }
    
    setFilteredTrainings(result);
  }, [searchTerm, filterStatus, filterCategory, trainings]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteTraining = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return;
    try {
      const response = await fetch(`${API_BASE}/trainings/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setTrainings(prev => prev.filter(t => t.id !== id));
        alert("Treino excluído com sucesso!");
      }
    } catch (error) {
      alert("Erro ao excluir treino");
    }
  };

  const createTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTraining.title || !newTraining.date || !newTraining.category) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/trainings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTraining),
      });

      if (response.ok) {
        const training = await response.json();
        setTrainings(prev => [training, ...prev]);
        setShowCreateModal(false);
        setNewTraining({
          title: "",
          description: "",
          category: "",
          duration: "60",
          objective: "",
          date: "",
          time: "",
          exercises: [],
        });
        alert("Treino criado com sucesso!");
      }
    } catch (error) {
      alert("Erro ao criar treino");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "⏳ Pendente";
      case "in_progress": return "🔄 Em andamento";
      case "completed": return "✅ Concluído";
      case "cancelled": return "❌ Cancelado";
      default: return status;
    }
  };

  const categories = Array.from(new Set(trainings.map(t => t.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando treinos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Erro ao carregar</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchTrainings} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            <RefreshCw size={18} className="inline mr-2" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏋️ Treinos</h1>
          <p className="text-gray-500 text-sm">
            Total: {filteredTrainings.length} treino{filteredTrainings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar treino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button onClick={fetchTrainings} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Treino
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os status</option>
          <option value="pending">⏳ Pendente</option>
          <option value="in_progress">🔄 Em andamento</option>
          <option value="completed">✅ Concluído</option>
          <option value="cancelled">❌ Cancelado</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as categorias</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filteredTrainings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏋️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum treino encontrado</h3>
          <p className="text-gray-500 mb-4">Comece criando seu primeiro treino</p>
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700">
            <Plus size={20} /> Criar Treino
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrainings.map((training) => {
            const isExpanded = expandedId === training.id;
            
            return (
              <div key={training.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-6" onClick={() => toggleExpand(training.id)}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{training.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(training.status)}`}>
                          {getStatusLabel(training.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{training.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(training.date).toLocaleDateString("pt-BR")}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {training.time}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {training.athlete_count} atletas</span>
                        <span className="flex items-center gap-1"><Target size={14} /> {training.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleExpand(training.id); }} className="text-gray-400 hover:text-gray-600 p-1">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">📋 Detalhes</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Categoria:</span> {training.category}</p>
                            <p><span className="font-medium">Duração:</span> {training.duration} minutos</p>
                            <p><span className="font-medium">Objetivo:</span> {training.objective}</p>
                            {training.coach_name && <p><span className="font-medium">Técnico:</span> {training.coach_name}</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">💪 Exercícios</h4>
                          {training.exercises && training.exercises.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {training.exercises.map((ex, idx) => <li key={idx}>{ex}</li>)}
                            </ul>
                          ) : <p className="text-sm text-gray-500">Nenhum exercício definido</p>}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                        <Link href={`/trainings/${training.id}`} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Eye size={14} /> Ver detalhes
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); deleteTraining(training.id); }} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 flex items-center gap-1">
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">📝 Criar Novo Treino</h2>
              <form onSubmit={createTraining}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input type="text" required value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea value={newTraining.description} onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <select required value={newTraining.category} onChange={(e) => setNewTraining({ ...newTraining, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione</option>
                        <option value="Sub-10">Sub-10</option>
                        <option value="Sub-12">Sub-12</option>
                        <option value="Sub-14">Sub-14</option>
                        <option value="Sub-16">Sub-16</option>
                        <option value="Sub-18">Sub-18</option>
                        <option value="Adulto">Adulto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                      <input type="number" value={newTraining.duration} onChange={(e) => setNewTraining({ ...newTraining, duration: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                      <input type="date" required value={newTraining.date} onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                      <input type="time" value={newTraining.time} onChange={(e) => setNewTraining({ ...newTraining, time: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                    <input type="text" value={newTraining.objective} onChange={(e) => setNewTraining({ ...newTraining, objective: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercícios (um por linha)</label>
                    <textarea value={newTraining.exercises.join('\n')} onChange={(e) => setNewTraining({ ...newTraining, exercises: e.target.value.split('\n').filter(s => s.trim()) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="submit" disabled={creating} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {creating ? 'Criando...' : 'Criar Treino'}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
