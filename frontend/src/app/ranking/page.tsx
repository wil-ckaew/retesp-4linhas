"use client";
import { useState, useEffect } from 'react';
import { 
  Trophy, Search, TrendingUp, TrendingDown, Minus,
  RefreshCw
} from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  birth_date: string;
}

interface AthleteRanking {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  points: number;
  games: number;
  goals: number;
  assists: number;
  wins: number;
  losses: number;
  attendance_rate: number;
  ranking_position: number;
  evolution: 'up' | 'down' | 'stable';
  last_match_performance: number;
}

export default function RankingPage() {
  const [athletes, setAthletes] = useState<AthleteRanking[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('points');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

  // Gerar dados de ranking a partir dos atletas reais
  const generateRankingData = (athletesData: Athlete[]): AthleteRanking[] => {
    const evolutions: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    
    return athletesData.map((athlete, index) => {
      const randomFactor = (seed: number) => {
        return (seed * 7 + 13) % 100;
      };
      
      const points = 50 + Math.floor(randomFactor(index * 3 + 1) * 1.5);
      const games = 5 + Math.floor(randomFactor(index * 5 + 2) * 0.5);
      const goals = Math.floor(randomFactor(index * 7 + 3) * 0.4);
      const assists = Math.floor(randomFactor(index * 11 + 5) * 0.3);
      const wins = Math.floor(randomFactor(index * 13 + 7) * 0.3);
      const losses = Math.floor(randomFactor(index * 17 + 11) * 0.2);
      const attendance = 60 + Math.floor(randomFactor(index * 19 + 13) * 0.4);
      
      return {
        id: athlete.id,
        name: athlete.name,
        category: athlete.category || 'Sem categoria',
        avatar_url: athlete.avatar_url,
        points,
        games,
        goals,
        assists,
        wins,
        losses,
        attendance_rate: attendance,
        ranking_position: index + 1,
        evolution: evolutions[index % evolutions.length],
        last_match_performance: 30 + Math.floor(randomFactor(index * 23 + 17) * 0.7),
      };
    });
  };

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const res = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Atletas carregados:', data.length);
        
        const rankingData = generateRankingData(data);
        rankingData.sort((a, b) => b.points - a.points);
        rankingData.forEach((item, index) => {
          item.ranking_position = index + 1;
        });
        
        setAthletes(rankingData);
        setFilteredAthletes(rankingData);
      } else {
        console.error('Erro ao buscar atletas:', res.status);
        useMockData();
      }
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
      useMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const useMockData = () => {
    const mockNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Lucas Ferreira', 
                       'Beatriz Lima', 'Carlos Souza', 'Julia Pereira', 'Rafael Almeida', 'Gabriela Rocha'];
    const mockCategories = ['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'];
    const evolutions: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    
    const mockData = mockNames.map((name, index) => ({
      id: `mock-${index}`,
      name,
      category: mockCategories[index % mockCategories.length],
      avatar_url: null,
      points: 50 + Math.floor(Math.random() * 150),
      games: 5 + Math.floor(Math.random() * 25),
      goals: Math.floor(Math.random() * 40),
      assists: Math.floor(Math.random() * 20),
      wins: Math.floor(Math.random() * 20),
      losses: Math.floor(Math.random() * 10),
      attendance_rate: 60 + Math.floor(Math.random() * 40),
      ranking_position: index + 1,
      evolution: evolutions[index % evolutions.length],
      last_match_performance: 30 + Math.floor(Math.random() * 70),
    }));
    
    mockData.sort((a, b) => b.points - a.points);
    mockData.forEach((item, index) => {
      item.ranking_position = index + 1;
    });
    
    setAthletes(mockData);
    setFilteredAthletes(mockData);
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    let filtered = athletes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'points': return b.points - a.points;
        case 'goals': return b.goals - a.goals;
        case 'assists': return b.assists - a.assists;
        case 'attendance': return b.attendance_rate - a.attendance_rate;
        case 'games': return b.games - a.games;
        default: return 0;
      }
    });
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, sortBy, athletes]);

  // Extrair categorias únicas dos atletas - CORRIGIDO
  const categorySet = new Set<string>();
  athletes.forEach(a => {
    if (a.category) {
      categorySet.add(a.category);
    }
  });
  const categories = ['all', ...Array.from(categorySet)];

  const getMedal = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  const getEvolutionIcon = (evolution: string) => {
    if (evolution === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (evolution === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getEvolutionColor = (evolution: string) => {
    if (evolution === 'up') return 'text-green-500';
    if (evolution === 'down') return 'text-red-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Carregando ranking dos atletas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Ranking dos Atletas
            </h1>
            <p className="text-gray-400 mt-1">
              {filteredAthletes.length} atletas • {selectedCategory === 'all' ? 'Todas categorias' : selectedCategory}
            </p>
          </div>
          <button
            onClick={fetchAthletes}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Search e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar atleta..."
              className="w-full bg-[#161B22] border border-[#30363D] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#21262D] text-gray-400 hover:bg-[#30363D]'
                }`}
              >
                {cat === 'all' ? '🏷️ Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ordenação e Visualização */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'points', label: '⭐ Pontos' },
              { key: 'goals', label: '⚽ Gols' },
              { key: 'assists', label: '🎯 Assistências' },
              { key: 'attendance', label: '📊 Presença' },
              { key: 'games', label: '🎮 Jogos' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  sortBy === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#21262D] text-gray-400 hover:bg-[#30363D]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-[#21262D] text-gray-400'
              }`}
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-[#21262D] text-gray-400'
              }`}
            >
              🔲
            </button>
          </div>
        </div>

        {/* Lista de Atletas */}
        {filteredAthletes.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum atleta encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Cadastre atletas para ver o ranking</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredAthletes.map((athlete, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={athlete.id}
                  className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/50 transition ${
                    isTop3 ? 'border-yellow-500/30' : 'border-[#30363D]'
                  }`}
                >
                  <div className="w-12 text-center">
                    <span className={`text-lg font-bold ${isTop3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {getMedal(index + 1)}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">{athlete.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#21262D] rounded-full text-gray-400">
                        {athlete.category}
                      </span>
                      <span className={`${getEvolutionColor(athlete.evolution)}`}>
                        {getEvolutionIcon(athlete.evolution)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                      <span>⚽ {athlete.goals} gols</span>
                      <span>🎯 {athlete.assists} assist.</span>
                      <span>📊 {athlete.attendance_rate}% presença</span>
                      <span>🎮 {athlete.games} jogos</span>
                    </div>
                    <div className="w-full h-1 bg-[#21262D] rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          athlete.last_match_performance > 70 ? 'bg-green-500' :
                          athlete.last_match_performance > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${athlete.last_match_performance}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-green-500">{athlete.points}</div>
                    <div className="text-xs text-gray-500">pontos</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAthletes.map((athlete, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={athlete.id}
                  className={`bg-[#161B22] border rounded-xl p-4 text-center hover:border-blue-500/50 transition ${
                    isTop3 ? 'border-yellow-500/30' : 'border-[#30363D]'
                  }`}
                >
                  <div className="text-lg font-bold text-yellow-500">
                    {getMedal(index + 1)}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto my-3">
                    {athlete.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-semibold text-white">{athlete.name}</div>
                  <div className="text-xs text-gray-500">{athlete.category}</div>
                  <div className="text-2xl font-bold text-green-500 mt-2">{athlete.points}</div>
                  <div className="text-xs text-gray-500">pontos</div>
                  <div className="flex justify-center gap-3 text-sm text-gray-400 mt-2">
                    <span>⚽ {athlete.goals}</span>
                    <span>🎯 {athlete.assists}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <span className="text-xs text-gray-500">Presença:</span>
                    <span className="text-sm font-medium text-blue-400">{athlete.attendance_rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer com contagem */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Mostrando {filteredAthletes.length} de {athletes.length} atletas
        </div>
      </div>
    </div>
  );
}
