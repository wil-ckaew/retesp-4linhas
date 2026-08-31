import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

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

export default function RankingScreen() {
  const { colors, isDark } = useTheme();
  const [athletes, setAthletes] = useState<AthleteRanking[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('points');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const API_URL = 'http://192.168.0.25:8081';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 15,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.hover,
      marginRight: 6,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    sortContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 6,
    },
    sortButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.hover,
    },
    sortButtonActive: {
      backgroundColor: colors.primary,
    },
    sortText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    sortTextActive: {
      color: '#FFFFFF',
    },
    viewToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
      gap: 8,
    },
    viewButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: colors.hover,
    },
    viewButtonActive: {
      backgroundColor: colors.primary,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    athleteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    athleteCardGrid: {
      width: (width - 48) / 2,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    rankNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      width: 30,
      textAlign: 'center',
    },
    rankTop: {
      color: '#F59E0B',
    },
    athleteAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    athleteAvatarGrid: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      overflow: 'hidden',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    avatarTextGrid: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: 'bold',
    },
    athleteInfo: {
      flex: 1,
    },
    athleteInfoGrid: {
      alignItems: 'center',
    },
    athleteName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    athleteNameGrid: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    athleteCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    pointsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    pointsValue: {
      color: '#10B981',
      fontSize: 18,
      fontWeight: 'bold',
    },
    pointsLabel: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    statText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    evolutionIcon: {
      marginLeft: 8,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingBottom: 20,
      gap: 8,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 12,
    },
    footer: {
      height: 20,
    },
    performanceBar: {
      height: 4,
      backgroundColor: colors.hover,
      borderRadius: 2,
      marginTop: 4,
      overflow: 'hidden',
    },
    performanceFill: {
      height: '100%',
      borderRadius: 2,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    refreshText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });

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
        const rankingData = generateRankingData(data);
        rankingData.sort((a, b) => b.points - a.points);
        rankingData.forEach((item, index) => {
          item.ranking_position = index + 1;
        });
        
        setAthletes(rankingData);
        setFilteredAthletes(rankingData);
      } else {
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
    if (evolution === 'up') return '📈';
    if (evolution === 'down') return '📉';
    return '➖';
  };

  const getEvolutionColor = (evolution: string) => {
    if (evolution === 'up') return '#10B981';
    if (evolution === 'down') return '#EF4444';
    return '#F59E0B';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Ranking</Text>
          <Text style={styles.headerSubtitle}>Classificação dos atletas</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Carregando ranking...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAthletes} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.headerTitle}>🏆 Ranking</Text>
              <Text style={styles.headerSubtitle}>
                {filteredAthletes.length} atletas • {selectedCategory === 'all' ? 'Todas' : selectedCategory}
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchAthletes}>
              <Icon name="refresh-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.refreshText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar atleta..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
                {cat === 'all' ? '🏷️ Todas' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          {[
            { key: 'points', label: '⭐ Pontos' },
            { key: 'goals', label: '⚽ Gols' },
            { key: 'assists', label: '🎯 Assist.' },
            { key: 'attendance', label: '📊 Pres.' },
            { key: 'games', label: '🎮 Jogos' },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortButton, sortBy === key && styles.sortButtonActive]}
              onPress={() => setSortBy(key)}
            >
              <Text style={[styles.sortText, sortBy === key && styles.sortTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
          
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Icon name="list" size={18} color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Icon name="grid" size={18} color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {filteredAthletes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="trophy-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
          </View>
        ) : viewMode === 'list' ? (
          <View style={styles.listContainer}>
            {filteredAthletes.map((item, index) => {
              const isTop3 = index < 3;
              return (
                <View key={item.id} style={[styles.athleteCard, isTop3 && { borderColor: '#F59E0B', borderWidth: 2 }]}>
                  <View style={styles.rankNumber}>
                    <Text style={[styles.rankNumber, isTop3 && styles.rankTop]}>
                      {isTop3 ? getMedal(index + 1) : `#${index + 1}`}
                    </Text>
                  </View>
                  
                  <View style={styles.athleteAvatar}>
                    {item.avatar_url ? (
                      <Image source={{ uri: `${API_URL}${item.avatar_url}` }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                    ) : (
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  
                  <View style={styles.athleteInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.athleteName}>{item.name}</Text>
                      <Text style={[styles.evolutionIcon, { color: getEvolutionColor(item.evolution) }]}>
                        {getEvolutionIcon(item.evolution)}
                      </Text>
                    </View>
                    <Text style={styles.athleteCategory}>{item.category}</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>⚽ {item.goals}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>🎯 {item.assists}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>📊 {item.attendance_rate}%</Text>
                      </View>
                    </View>
                    <View style={styles.performanceBar}>
                      <View 
                        style={[
                          styles.performanceFill, 
                          { 
                            width: `${item.last_match_performance}%`,
                            backgroundColor: item.last_match_performance > 70 ? '#10B981' : 
                                             item.last_match_performance > 40 ? '#F59E0B' : '#EF4444'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsValue}>{item.points}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredAthletes.map((item, index) => {
              const isTop3 = index < 3;
              return (
                <View key={item.id} style={{ width: (width - 48) / 2 }}>
                  <View style={[styles.athleteCardGrid, isTop3 && { borderColor: '#F59E0B', borderWidth: 2 }]}>
                    <Text style={[styles.rankNumber, isTop3 && styles.rankTop, { fontSize: 16 }]}>
                      {isTop3 ? getMedal(index + 1) : `#${index + 1}`}
                    </Text>
                    
                    <View style={styles.athleteAvatarGrid}>
                      {item.avatar_url ? (
                        <Image source={{ uri: `${API_URL}${item.avatar_url}` }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                      ) : (
                        <Text style={styles.avatarTextGrid}>{item.name.charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    
                    <View style={styles.athleteInfoGrid}>
                      <Text style={styles.athleteNameGrid}>{item.name}</Text>
                      <Text style={styles.athleteCategory}>{item.category}</Text>
                      <Text style={[styles.pointsValue, { fontSize: 22, marginTop: 4 }]}>{item.points}</Text>
                      <Text style={styles.pointsLabel}>pontos</Text>
                      <View style={styles.statsRow}>
                        <Text style={styles.statText}>⚽ {item.goals}</Text>
                        <Text style={styles.statText}>🎯 {item.assists}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}
