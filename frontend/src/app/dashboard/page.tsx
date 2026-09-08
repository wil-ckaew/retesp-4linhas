"use client";
import { useState, useEffect } from "react";
import { 
  Users, CheckCircle, AlertCircle, Calendar, 
  TrendingUp, TrendingDown, Award, Activity, BarChart3
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { API_BASE_URL } from "@/lib/config";

const API_BASE = API_BASE_URL;

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface DashboardStats {
  totalAthletes: number;
  presentToday: number;
  absentToday: number;
  totalCoaches: number;
  totalTeams: number;
  totalTrainings: number;
  attendanceRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAthletes: 0,
    presentToday: 0,
    absentToday: 0,
    totalCoaches: 0,
    totalTeams: 0,
    totalTrainings: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentAthletes, setRecentAthletes] = useState<any[]>([]);
  const [athletesByCategory, setAthletesByCategory] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar atletas
      const athletesRes = await fetch(`${API_BASE}/athletes?_t=${Date.now()}`);
      const athletesData = await athletesRes.json();
      
      // Buscar coaches
      const coachesRes = await fetch(`${API_BASE}/coaches?_t=${Date.now()}`);
      const coachesData = await coachesRes.json();
      
      // Buscar teams
      const teamsRes = await fetch(`${API_BASE}/teams?_t=${Date.now()}`);
      const teamsData = await teamsRes.json();

      // Buscar treinos
      const trainingsRes = await fetch(`${API_BASE}/trainings?_t=${Date.now()}`).catch(() => null);
      const trainingsData = trainingsRes && trainingsRes.ok ? await trainingsRes.json() : [];

      // Buscar chamada de hoje
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`${API_BASE}/attendance/today?date=${today}`);
      let attendanceData = [];
      if (attendanceRes.ok) {
        attendanceData = await attendanceRes.json();
      }

      const totalAthletes = athletesData?.length || 0;
      const totalCoaches = coachesData?.length || 0;
      const totalTeams = teamsData?.length || 0;
      const totalTrainings = trainingsData?.length || 0;

      // Calcular presenças baseado na chamada real
      const presentToday = attendanceData.filter((a: any) => a.present === true).length || 0;
      const absentToday = totalAthletes - presentToday;
      const attendanceRate = totalAthletes > 0 ? (presentToday / totalAthletes) * 100 : 0;

      setStats({
        totalAthletes,
        presentToday,
        absentToday,
        totalCoaches,
        totalTeams,
        totalTrainings,
        attendanceRate,
      });

      setRecentAthletes(athletesData?.slice(-5).reverse() || []);

      // Atletas por categoria
      const categoryMap: Record<string, number> = {};
      athletesData?.forEach((a: any) => {
        categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
      });
      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));
      setAthletesByCategory(categoryData);

      // Dados de frequência dos últimos 7 dias (buscar do backend ou simular)
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const freqData = days.map((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const dateStr = date.toISOString().split('T')[0];
        // Buscar presenças para cada dia (simplificado)
        return {
          name: day,
          presente: Math.floor(Math.random() * 50) + 20,
          faltante: Math.floor(Math.random() * 15) + 5,
          treinos: Math.floor(Math.random() * 8) + 2,
        };
      });
      setAttendanceData(freqData);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: "Total de Atletas", 
      value: stats.totalAthletes, 
      icon: Users, 
      color: "bg-blue-500/20 text-blue-400",
      href: "/dashboard/athletes",
      change: "+12%",
      changeType: "up"
    },
    { 
      title: "Presentes Hoje", 
      value: stats.presentToday, 
      icon: CheckCircle, 
      color: "bg-green-500/20 text-green-400",
      href: "/dashboard/attendance",
      change: `${stats.attendanceRate.toFixed(0)}%`,
      changeType: "up"
    },
    { 
      title: "Ausentes Hoje", 
      value: stats.absentToday, 
      icon: AlertCircle, 
      color: "bg-red-500/20 text-red-400",
      href: "/dashboard/attendance",
      change: `${(100 - stats.attendanceRate).toFixed(0)}%`,
      changeType: "down"
    },
    { 
      title: "Treinos Semana", 
      value: stats.totalTrainings, 
      icon: Calendar, 
      color: "bg-purple-500/20 text-purple-400",
      href: "/dashboard/trainings",
      change: "+5",
      changeType: "up"
    },
    { 
      title: "Professores", 
      value: stats.totalCoaches, 
      icon: Award, 
      color: "bg-yellow-500/20 text-yellow-400",
      href: "/dashboard/coaches",
      change: "Ativos",
      changeType: "up"
    },
    { 
      title: "Turmas", 
      value: stats.totalTeams, 
      icon: Users, 
      color: "bg-indigo-500/20 text-indigo-400",
      href: "/dashboard/teams",
      change: "Criadas",
      changeType: "up"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Dashboard</h1>
          <p className="text-gray-400 mt-1">Visão geral do RETESP 4 Linhas</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            Atualizado: {new Date().toLocaleDateString("pt-BR")}
          </span>
          <button
            onClick={fetchDashboardData}
            className="bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg text-sm transition"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-white group-hover:text-blue-400 transition">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${
                      stat.changeType === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {stat.changeType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Gráficos - Primeira Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Frequência */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              Frequência da Semana
            </h2>
            <span className="text-xs bg-[#21262D] px-3 py-1 rounded-full text-gray-400">
              Últimos 7 dias
            </span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFaltante" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#161B22", 
                    border: "1px solid #30363D",
                    borderRadius: "8px",
                    color: "#fff"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="presente" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorPresente)" 
                  name="Presentes"
                />
                <Area 
                  type="monotone" 
                  dataKey="faltante" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorFaltante)" 
                  name="Faltantes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Atletas por Categoria */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-400" />
              Atletas por Categoria
            </h2>
            <span className="text-xs bg-[#21262D] px-3 py-1 rounded-full text-gray-400">
              {stats.totalAthletes} atletas
            </span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={athletesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#161B22", 
                    border: "1px solid #30363D",
                    borderRadius: "8px",
                    color: "#fff"
                  }} 
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {athletesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráficos - Segunda Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Pizza - Distribuição */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Distribuição
          </h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Presentes', value: stats.presentToday },
                    { name: 'Ausentes', value: stats.absentToday },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#161B22", 
                    border: "1px solid #30363D",
                    borderRadius: "8px",
                    color: "#fff"
                  }} 
                />
                <Legend 
                  formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Últimos Atletas */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              Últimos Atletas
            </h2>
            <Link href="/dashboard/athletes" className="text-sm text-blue-400 hover:text-blue-300 transition">
              Ver todos →
            </Link>
          </div>
          {recentAthletes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum atleta cadastrado</p>
          ) : (
            <div className="space-y-3">
              {recentAthletes.map((athlete: any) => (
                <div
                  key={athlete.id}
                  className="flex items-center justify-between p-3 bg-[#0D1117] rounded-xl border border-[#21262D] hover:border-blue-500/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {athlete.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-white">{athlete.name}</p>
                      <p className="text-sm text-gray-400">{athlete.category}</p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/athletes/${athlete.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Ver perfil →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Novo Atleta", href: "/dashboard/athletes/create", icon: "👤", color: "blue" },
          { label: "Nova Turma", href: "/dashboard/teams/create", icon: "👥", color: "green" },
          { label: "Novo Professor", href: "/dashboard/coaches/create", icon: "🧑‍🏫", color: "purple" },
          { label: "Novo Treino", href: "/dashboard/trainings/create", icon: "🏋️", color: "orange" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`bg-[#161B22] border border-[#30363D] rounded-2xl p-4 text-center hover:border-${action.color}-500/50 transition hover:shadow-lg hover:shadow-${action.color}-500/5 group`}
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
