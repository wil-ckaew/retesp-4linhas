"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Users, Target, Edit, Trash2 } from "lucide-react";

const API_BASE = "http://localhost:8081";

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

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/trainings/${params.id}`).catch(() => null);
        
        if (response && response.ok) {
          const data = await response.json();
          setTraining(data);
        } else {
          // Dados mock
          const mockTrainings: Training[] = [
            {
              id: "1",
              title: "Treino de Finalização",
              description: "Treino focado em finalizações de diversas posições",
              category: "Sub-12",
              duration: "90",
              objective: "Melhorar precisão de chutes",
              date: "2024-08-25",
              time: "14:00",
              status: "pending",
              athlete_count: 12,
              coach_name: "Carlos Silva",
              exercises: ["Chute com perna direita", "Chute com perna esquerda", "Cabeceio"],
              created_at: new Date().toISOString(),
            },
          ];
          const found = mockTrainings.find(t => t.id === params.id);
          if (found) setTraining(found);
          else setError("Treino não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar treino");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTraining();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Erro</h2>
        <p className="text-gray-600">{error || "Treino não encontrado"}</p>
        <Link href="/trainings" className="text-blue-600 hover:underline mt-4 inline-block">
          Voltar para treinos
        </Link>
      </div>
    );
  }

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/trainings" className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6">
        <ArrowLeft size={20} /> Voltar para treinos
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{training.title}</h1>
              <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(training.status)}`}>
                {getStatusLabel(training.status)}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/trainings/edit/${training.id}`}
                className="bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 flex items-center gap-1"
              >
                <Edit size={18} /> Editar
              </Link>
              <button className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center gap-1">
                <Trash2 size={18} /> Excluir
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">📋 Detalhes</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {training.id}</p>
                  <p><span className="font-medium">Categoria:</span> {training.category}</p>
                  <p><span className="font-medium">Duração:</span> {training.duration} minutos</p>
                  <p><span className="font-medium">Objetivo:</span> {training.objective}</p>
                  {training.coach_name && (
                    <p><span className="font-medium">Técnico:</span> {training.coach_name}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">📅 Data e Hora</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Data:</span> {new Date(training.date).toLocaleDateString("pt-BR")}</p>
                  <p><span className="font-medium">Horário:</span> {training.time}</p>
                  <p><span className="font-medium">Atletas:</span> {training.athlete_count}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-4 h-full">
                <h3 className="font-semibold text-gray-700 mb-2">💪 Exercícios</h3>
                {training.exercises && training.exercises.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {training.exercises.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum exercício definido</p>
                )}
              </div>
            </div>
          </div>

          {training.description && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">📝 Descrição</h3>
              <p className="text-gray-600">{training.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
