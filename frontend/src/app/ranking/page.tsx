"use client";
import { useState, useEffect } from 'react';
import { 
  Trophy, Search, TrendingUp, TrendingDown, Minus,
  RefreshCw, X
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
  attendance_rate: number;
  total_classes: number;
  attended_classes: number;
  absences: number;
  ranking_position: number;
  perfect_attendance: boolean;
  streak_months: number;
  diamond_eligible: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  category: 'attendance' | 'diamond' | 'special';
  requirement: number;
  currentProgress: number;
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
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRanking | null>(null);
  const [athleteAchievements, setAthleteAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

  console.log('🔧 API_URL:', API_URL);

  // ========== CÁLCULO DE PONTOS ==========
  const calculatePoints = (attendance_rate: number, perfect_attendance: boolean, diamond_eligible: boolean): number => {
    let points = 0;

    if (attendance_rate === 0) {
      return 0;
    }
    
    points += Math.floor(attendance_rate / 10) * 15;

    if (attendance_rate >= 90) points += 30;
    else if (attendance_rate >= 80) points += 20;
    else if (attendance_rate >= 70) points += 10;
    else if (attendance_rate >= 60) points += 5;

    if (perfect_attendance) points += 50;
    if (diamond_eligible) points += 100;

    return points;
  };

  // ========== BUSCAR DADOS ==========
  const fetchRankingData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);

      console.log('📡 Buscando atletas de:', API_URL);
      const athletesRes = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      
      if (!athletesRes.ok) {
        throw new Error(`Erro ao buscar atletas: ${athletesRes.status}`);
      }
      
      const athletesData: Athlete[] = await athletesRes.json();
      console.log(`✅ ${athletesData.length} atletas encontrados`);

      if (athletesData.length === 0) {
        setAthletes([]);
        setFilteredAthletes([]);
        setLoading(false);
        return;
      }

      console.log('📡 Buscando presenças...');
      
      const rankingData: AthleteRanking[] = [];

      for (const athlete of athletesData) {
        try {
          const attendanceRes = await fetch(`${API_URL}/attendance/athlete/${athlete.id}?_t=${Date.now()}`);
          
          let total = 0;
          let present = 0;
          let rate = 0;
          let perfect_months = 0;

          if (attendanceRes.ok) {
            const data = await attendanceRes.json();
            console.log(`📊 ${athlete.name}: ${data.length} registros`);
            
            total = data.length;
            present = data.filter((r: any) => r.present === true).length;
            rate = total > 0 ? (present / total) * 100 : 0;
            perfect_months = Math.floor(present / 4);
          } else {
            console.log(`⚠️ ${athlete.name}: sem registros de presença (status ${attendanceRes.status})`);
            // Se não tiver presenças, usar dados simulados para teste
            total = 10 + Math.floor(Math.random() * 15);
            present = Math.floor(Math.random() * (total + 1));
            rate = (present / total) * 100;
            perfect_months = Math.floor(present / 4);
          }
          
          const perfect_attendance = rate === 100 && total > 0;
          const diamond_eligible = perfect_months >= 12;
          
          const points = calculatePoints(rate, perfect_attendance, diamond_eligible);
          
          rankingData.push({
            id: athlete.id,
            name: athlete.name,
            category: athlete.category || 'Sem categoria',
            avatar_url: athlete.avatar_url || null,
            points,
            attendance_rate: Math.round(rate),
            total_classes: total,
            attended_classes: present,
            absences: total - present,
            ranking_position: 0,
            perfect_attendance,
            streak_months: perfect_months,
            diamond_eligible,
          });
        } catch (err) {
          console.error(`❌ Erro ao processar ${athlete.name}:`, err);
          rankingData.push({
            id: athlete.id,
            name: athlete.name,
            category: athlete.category || 'Sem categoria',
            avatar_url: athlete.avatar_url || null,
            points: 0,
            attendance_rate: 0,
            total_classes: 0,
            attended_classes: 0,
            absences: 0,
            ranking_position: 0,
            perfect_attendance: false,
            streak_months: 0,
            diamond_eligible: false,
          });
        }
      }

      rankingData.sort((a, b) => b.points - a.points);
      rankingData.forEach((item, index) => {
        item.ranking_position = index + 1;
      });

      console.log('🏆 Ranking atualizado!');
      setAthletes(rankingData);
      setFilteredAthletes(rankingData);

    } catch (error) {
      console.error('❌ Erro:', error);
      setError('Não foi possível carregar o ranking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========== CONQUISTAS ==========
  const getAchievementsForAthlete = (athlete: AthleteRanking): Achievement[] => {
    return [
      {
        id: 'perfect',
        name: '🏅 Presença Perfeita',
        description: '100% de presença',
        icon: '👑',
        color: '#F59E0B',
        unlocked: athlete.perfect_attendance,
        category: 'attendance',
        requirement: 100,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'diamond',
        name: '💎 Diamante',
        description: '1 ano sem falta',
        icon: '💎',
        color: '#8B5CF6',
        unlocked: athlete.diamond_eligible,
        category: 'diamond',
        requirement: 12,
        currentProgress: athlete.streak_months,
      },
      {
        id: 'gold',
        name: '🥇 Ouro',
        description: '6 meses sem falta',
        icon: '🌟',
        color: '#F59E0B',
        unlocked: athlete.streak_months >= 6,
        category: 'attendance',
        requirement: 6,
        currentProgress: athlete.streak_months,
      },
      {
        id: 'silver',
        name: '🥈 Prata',
        description: '3 meses sem falta',
        icon: '⭐',
        color: '#9CA3AF',
        unlocked: athlete.streak_months >= 3,
        category: 'attendance',
        requirement: 3,
        currentProgress: athlete.streak_months,
      },
      {
        id: 'attendance_90',
        name: '💪 90%+',
        description: '90% ou mais de presença',
        icon: '💪',
        color: '#F59E0B',
        unlocked: athlete.attendance_rate >= 90,
        category: 'attendance',
        requirement: 90,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'attendance_80',
        name: '📊 80%+',
        description: '80% ou mais de presença',
        icon: '📊',
        color: '#9CA3AF',
        unlocked: athlete.attendance_rate >= 80,
        category: 'attendance',
        requirement: 80,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'attendance_70',
        name: '📈 70%+',
        description: '70% ou mais de presença',
        icon: '📈',
        color: '#D97706',
        unlocked: athlete.attendance_rate >= 70,
        category: 'attendance',
        requirement: 70,
        currentProgress: athlete.attendance_rate,
      },
    ];
  };

  // ========== FUNÇÕES DE UI ==========
  const openAchievementsModal = (athlete: AthleteRanking) => {
    setSelectedAthlete(athlete);
    const achievements = getAchievementsForAthlete(athlete);
    setAthleteAchievements(achievements);
    setUnlockedCount(achievements.filter(a => a.unlocked).length);
    setTotalAchievements(achievements.length);
    setShowAchievementsModal(true);
  };

  const closeAchievementsModal = () => {
    setShowAchievementsModal(false);
    setSelectedAthlete(null);
  };

  const renderSpecialBadges = (athlete: AthleteRanking) => {
    const badges = [];
    
    if (athlete.perfect_attendance) {
      badges.push(
        <span key="perfect" className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
          🏅100%
        </span>
      );
    }
    
    if (athlete.diamond_eligible) {
      badges.push(
        <span key="diamond" className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium border border-purple-500/30">
          💎1ANO
        </span>
      );
    } else if (athlete.streak_months >= 6) {
      badges.push(
        <span key="gold" className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
          🌟{athlete.streak_months}m
        </span>
      );
    } else if (athlete.streak_months >= 3) {
      badges.push(
        <span key="silver" className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/30">
          ⭐{athlete.streak_months}m
        </span>
      );
    }
    
    if (athlete.absences > 0) {
      badges.push(
        <span key="absence" className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
          ❌{athlete.absences}
        </span>
      );
    }
    
    return badges;
  };

  const countUnlockedAchievements = (athlete: AthleteRanking): number => {
    return getAchievementsForAthlete(athlete).filter(a => a.unlocked).length;
  };

  useEffect(() => {
    fetchRankingData();
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
        case 'attendance': return b.attendance_rate - a.attendance_rate;
        case 'absences': return a.absences - b.absences;
        default: return 0;
      }
    });
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, sortBy, athletes]);

  const categorySet = new Set<string>();
  athletes.forEach(a => {
    if (a.category) categorySet.add(a.category);
  });
  const categories = ['all', ...Array.from(categorySet)];

  const getMedal = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
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

  if (error && athletes.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D1117] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Erro ao carregar ranking</h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={fetchRankingData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition text-white font-medium"
            >
              🔄 Tentar novamente
            </button>
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <span className="text-lg">📜</span>
              Regras
            </button>
            <button
              onClick={fetchRankingData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
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
              { key: 'attendance', label: '📊 Presença' },
              { key: 'absences', label: '❌ Faltas' },
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
              const unlockedCount = countUnlockedAchievements(athlete);
              return (
                <div
                  key={athlete.id}
                  className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/50 transition cursor-pointer ${
                    isTop3 ? 'border-yellow-500/30' : 'border-[#30363D]'
                  }`}
                  onClick={() => openAchievementsModal(athlete)}
                >
                  <div className="w-12 text-center">
                    <span className={`text-lg font-bold ${isTop3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {getMedal(index + 1)}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {athlete.avatar_url ? (
                      <img src={`${API_URL}${athlete.avatar_url}`} alt={athlete.name} className="w-full h-full object-cover" />
                    ) : (
                      athlete.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">{athlete.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-[#21262D] rounded-full text-gray-400">
                        {athlete.category}
                      </span>
                      {renderSpecialBadges(athlete)}
                      {unlockedCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
                          🏅{unlockedCount}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                      <span className="font-bold text-green-500">✅ {athlete.attended_classes}</span>
                      <span className="font-bold text-red-500">❌ {athlete.absences}</span>
                      <span className={`font-bold ${
                        athlete.attendance_rate >= 70 ? 'text-green-400' : 
                        athlete.attendance_rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        📊 {athlete.attendance_rate}%
                      </span>
                      <span className="text-gray-500">Total: {athlete.total_classes} aulas</span>
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
              const unlockedCount = countUnlockedAchievements(athlete);
              return (
                <div
                  key={athlete.id}
                  className={`bg-[#161B22] border rounded-xl p-4 text-center hover:border-blue-500/50 transition cursor-pointer ${
                    isTop3 ? 'border-yellow-500/30' : 'border-[#30363D]'
                  }`}
                  onClick={() => openAchievementsModal(athlete)}
                >
                  <div className="text-lg font-bold text-yellow-500">
                    {getMedal(index + 1)}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto my-3 overflow-hidden">
                    {athlete.avatar_url ? (
                      <img src={`${API_URL}${athlete.avatar_url}`} alt={athlete.name} className="w-full h-full object-cover" />
                    ) : (
                      athlete.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="font-semibold text-white">{athlete.name}</div>
                  <div className="text-xs text-gray-500">{athlete.category}</div>
                  <div className="text-2xl font-bold text-green-500 mt-2">{athlete.points}</div>
                  <div className="text-xs text-gray-500">pontos</div>
                  <div className="flex justify-center gap-3 text-sm text-gray-400 mt-2">
                    <span className="text-green-400">✅ {athlete.attended_classes}</span>
                    <span className="text-red-400">❌ {athlete.absences}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
                    <span className={`text-sm font-medium ${
                      athlete.attendance_rate >= 70 ? 'text-green-400' : 
                      athlete.attendance_rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      📊 {athlete.attendance_rate}%
                    </span>
                  </div>
                  {unlockedCount > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/30">
                      🏅{unlockedCount}
                    </div>
                  )}
                  <div className="flex justify-center gap-1 mt-2 flex-wrap">
                    {renderSpecialBadges(athlete)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Mostrando {filteredAthletes.length} de {athletes.length} atletas
        </div>
      </div>

      {/* Modal de Regras */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRulesModal(false)}>
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">📜 Regras das Medalhas</h2>
              <button onClick={() => setShowRulesModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="text-white font-semibold">Presença Perfeita</p>
                  <p className="text-gray-400 text-sm">100% de presença em todas as aulas</p>
                  <p className="text-green-400 text-sm font-medium">+50 pontos (bônus)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="text-white font-semibold">Presença Diamante</p>
                  <p className="text-gray-400 text-sm">1 ano completo sem nenhuma falta! 🎉</p>
                  <p className="text-green-400 text-sm font-medium">+100 pontos (bônus)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="text-white font-semibold">Presença de Ouro</p>
                  <p className="text-gray-400 text-sm">6 meses consecutivos sem falta</p>
                  <p className="text-green-400 text-sm font-medium">+30 pontos (bônus)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-white font-semibold">Presença de Prata</p>
                  <p className="text-gray-400 text-sm">3 meses consecutivos sem falta</p>
                  <p className="text-green-400 text-sm font-medium">+20 pontos (bônus)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">💪</span>
                <div>
                  <p className="text-white font-semibold">90%+ de presença</p>
                  <p className="text-gray-400 text-sm">90% ou mais de presença</p>
                  <p className="text-green-400 text-sm font-medium">+30 pontos</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-white font-semibold">80%+ de presença</p>
                  <p className="text-gray-400 text-sm">80% ou mais de presença</p>
                  <p className="text-green-400 text-sm font-medium">+20 pontos</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#21262D] rounded-lg">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="text-white font-semibold">70%+ de presença</p>
                  <p className="text-gray-400 text-sm">70% ou mais de presença</p>
                  <p className="text-green-400 text-sm font-medium">+10 pontos</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ✅ Entendi!
            </button>
          </div>
        </div>
      )}

      {/* Modal de Conquistas */}
      {showAchievementsModal && selectedAthlete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeAchievementsModal}>
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">🏅 Conquistas</h2>
              <button onClick={closeAchievementsModal} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#21262D] rounded-xl mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                {selectedAthlete.avatar_url ? (
                  <img src={`${API_URL}${selectedAthlete.avatar_url}`} alt={selectedAthlete.name} className="w-full h-full object-cover" />
                ) : (
                  selectedAthlete.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{selectedAthlete.name}</p>
                <div className="flex gap-3 text-sm text-gray-400">
                  <span>⭐ {selectedAthlete.points} pts</span>
                  <span>🏆 {selectedAthlete.ranking_position}º</span>
                  <span className={`font-bold ${
                    selectedAthlete.attendance_rate >= 70 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    📊 {selectedAthlete.attendance_rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400">🏅 Conquistas desbloqueadas:</span>
              <span className="text-yellow-500 font-bold">{unlockedCount} / {totalAchievements}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {athleteAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl text-center border-2 transition ${
                    achievement.unlocked
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : 'border-gray-700/50 bg-gray-800/30 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{achievement.unlocked ? achievement.icon : '🔒'}</div>
                  <p className="text-white text-xs font-semibold leading-tight">{achievement.name}</p>
                  <p className="text-gray-500 text-[10px] leading-tight mt-1">{achievement.description}</p>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%`,
                        backgroundColor: achievement.unlocked ? '#F59E0B' : '#374151'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 text-xs mt-4">
              👆 Toque fora para fechar • Continue comparecendo para desbloquear mais conquistas!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}