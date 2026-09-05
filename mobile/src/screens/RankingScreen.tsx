//mobile/src/screens/RankingScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../services/api';

const { width } = Dimensions.get('window');

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  birth_date: string;
}

interface AttendanceRecord {
  athlete_id: string;
  date: string;
  present: boolean;
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

interface AttendanceMap {
  total: number;
  present: number;
  rate: number;
  perfect_months: number;
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
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRanking | null>(null);
  const [athleteAchievements, setAthleteAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    viewButtonText: {
      fontSize: 18,
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
    rulesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    rulesButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    awardsBadge: {
      backgroundColor: '#F59E0B',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 4,
    },
    awardsBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 'bold',
    },
    medalBadge: {
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 4,
    },
    medalGold: {
      backgroundColor: '#F59E0B',
    },
    medalSilver: {
      backgroundColor: '#9CA3AF',
    },
    medalBronze: {
      backgroundColor: '#D97706',
    },
    medalDiamond: {
      backgroundColor: '#8B5CF6',
    },
    medalText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 'bold',
    },
    absenceBadge: {
      backgroundColor: '#EF4444',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 4,
    },
    absenceBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalCloseEmoji: {
      fontSize: 28,
    },
    athleteProfileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    athleteProfileAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    athleteProfileName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    athleteProfileStats: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    athleteProfileStat: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    unlockedCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 16,
    },
    unlockedCounterText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    unlockedCounterValue: {
      color: '#F59E0B',
      fontSize: 18,
      fontWeight: 'bold',
    },
    achievementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    achievementItem: {
      width: (width - 100) / 3,
      alignItems: 'center',
      backgroundColor: colors.hover,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    achievementUnlocked: {
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    achievementIcon: {
      fontSize: 32,
      marginBottom: 4,
    },
    achievementName: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },
    achievementDesc: {
      color: colors.textSecondary,
      fontSize: 8,
      textAlign: 'center',
      marginTop: 2,
    },
    achievementProgress: {
      width: '100%',
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 4,
      overflow: 'hidden',
    },
    achievementProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    achievementLocked: {
      opacity: 0.5,
    },
    modalFooter: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modalFooterText: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
    rulesModalContent: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    rulesTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    rulesItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    rulesIcon: {
      fontSize: 30,
      width: 40,
      textAlign: 'center',
    },
    rulesInfo: {
      flex: 1,
    },
    rulesName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    rulesDesc: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    rulesPoints: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  // ========== CÁLCULO DE PONTOS ==========
  const calculatePoints = (attendance_rate: number, perfect_attendance: boolean, diamond_eligible: boolean): number => {
    let points = 0;

    if (attendance_rate === 0) {
      return 0;
    }
    
    // Cada 10% de presença vale 15 pontos
    points += Math.floor(attendance_rate / 10) * 15;

    // Bônus por presença consistente
    if (attendance_rate >= 90) {
      points += 30;
    } else if (attendance_rate >= 80) {
      points += 20;
    } else if (attendance_rate >= 70) {
      points += 10;
    } else if (attendance_rate >= 60) {
      points += 5;
    }

    // Bônus para presença PERFEITA (100%)
    if (perfect_attendance) {
      points += 50;
    }

    // Bônus para DIAMANTE (1 ano sem falta)
    if (diamond_eligible) {
      points += 100;
    }

    return points;
  };

  // ========== FUNÇÃO PRINCIPAL - BUSCA DADOS REAIS ==========
  const fetchRankingData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      // 1. Buscar todos os atletas
      console.log('📡 Buscando atletas...');
      const athletesRes = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      if (!athletesRes.ok) {
        throw new Error(`Erro ao buscar atletas: ${athletesRes.status}`);
      }
      const athletesData: Athlete[] = await athletesRes.json();
      console.log(`✅ ${athletesData.length} atletas encontrados`);

      // 2. Buscar TODAS as presenças de TODOS os atletas
      console.log('📡 Buscando presenças...');
      
      const allAttendance: AttendanceRecord[] = [];
      
      for (const athlete of athletesData) {
        try {
          const attendanceRes = await fetch(`${API_URL}/attendance/athlete/${athlete.id}?_t=${Date.now()}`);
          if (attendanceRes.ok) {
            const data = await attendanceRes.json();
            allAttendance.push(...data.map((item: any) => ({
              athlete_id: athlete.id,
              date: item.date,
              present: item.present,
            })));
          }
        } catch (err) {
          console.warn(`⚠️ Erro ao buscar presenças de ${athlete.name}:`, err);
        }
      }
      
      console.log(`✅ ${allAttendance.length} registros de presença encontrados`);

      // 3. Processar dados de presença por atleta
      const attendanceMap: Record<string, AttendanceMap> = {};
      
      athletesData.forEach((athlete: Athlete) => {
        const athleteAttendance = allAttendance.filter(
          (a: AttendanceRecord) => a.athlete_id === athlete.id
        );
        
        const total = athleteAttendance.length;
        const present = athleteAttendance.filter((a: AttendanceRecord) => a.present).length;
        const rate = total > 0 ? (present / total) * 100 : 0;
        
        // Calcular meses sem falta (aproximado - 4 aulas por mês)
        const perfect_months = Math.floor(present / 4);
        
        attendanceMap[athlete.id] = { 
          total, 
          present, 
          rate,
          perfect_months 
        };
      });

      // 4. Criar dados de ranking
      const rankingData: AthleteRanking[] = athletesData.map((athlete: Athlete) => {
        const attendance = attendanceMap[athlete.id] || { 
          total: 0, 
          present: 0, 
          rate: 0, 
          perfect_months: 0 
        };
        
        const perfect_attendance = attendance.rate === 100 && attendance.total > 0;
        const diamond_eligible = attendance.perfect_months >= 12;
        
        const points = calculatePoints(
          attendance.rate,
          perfect_attendance,
          diamond_eligible
        );
        
        return {
          id: athlete.id,
          name: athlete.name,
          category: athlete.category || 'Sem categoria',
          avatar_url: athlete.avatar_url || null,
          points,
          attendance_rate: Math.round(attendance.rate),
          total_classes: attendance.total,
          attended_classes: attendance.present,
          absences: attendance.total - attendance.present,
          ranking_position: 0,
          perfect_attendance,
          streak_months: attendance.perfect_months,
          diamond_eligible,
        };
      });

      // 5. Ordenar por pontos (do maior para o menor)
      rankingData.sort((a: AthleteRanking, b: AthleteRanking) => b.points - a.points);
      rankingData.forEach((item: AthleteRanking, index: number) => {
        item.ranking_position = index + 1;
      });

      console.log('🏆 Ranking atualizado com sucesso!');
      console.log('📊 Top 3:');
      rankingData.slice(0, 3).forEach((item, i) => {
        console.log(`  ${i+1}. ${item.name} - ${item.points}pts (${item.attendance_rate}%)`);
      });

      setAthletes(rankingData);
      setFilteredAthletes(rankingData);

    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar o ranking. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========== SISTEMA DE CONQUISTAS ==========
  const getAchievementsForAthlete = (athlete: AthleteRanking): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'perfect_attendance',
        name: '🏅 Presença Perfeita',
        description: '100% de presença em todas as aulas',
        icon: '👑',
        color: '#F59E0B',
        unlocked: athlete.perfect_attendance,
        category: 'attendance',
        requirement: 100,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'diamond_12months',
        name: '💎 Presença Diamante',
        description: '1 ano completo sem nenhuma falta! 🎉',
        icon: '💎',
        color: '#8B5CF6',
        unlocked: athlete.diamond_eligible,
        category: 'diamond',
        requirement: 12,
        currentProgress: athlete.streak_months,
      },
      {
        id: 'gold_6months',
        name: '🥇 Presença de Ouro',
        description: '6 meses sem falta',
        icon: '🌟',
        color: '#F59E0B',
        unlocked: athlete.streak_months >= 6,
        category: 'attendance',
        requirement: 6,
        currentProgress: athlete.streak_months,
      },
      {
        id: 'silver_3months',
        name: '🥈 Presença de Prata',
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
        name: '💪 Presença de Ouro',
        description: '90%+ de presença',
        icon: '💪',
        color: '#F59E0B',
        unlocked: athlete.attendance_rate >= 90,
        category: 'attendance',
        requirement: 90,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'attendance_80',
        name: '📊 Presença de Prata',
        description: '80%+ de presença',
        icon: '📊',
        color: '#9CA3AF',
        unlocked: athlete.attendance_rate >= 80,
        category: 'attendance',
        requirement: 80,
        currentProgress: athlete.attendance_rate,
      },
      {
        id: 'attendance_70',
        name: '📈 Presença de Bronze',
        description: '70%+ de presença',
        icon: '📈',
        color: '#D97706',
        unlocked: athlete.attendance_rate >= 70,
        category: 'attendance',
        requirement: 70,
        currentProgress: athlete.attendance_rate,
      },
    ];

    return achievements;
  };

  // ========== FUNÇÕES DE UI ==========
  const openRulesModal = () => setShowRulesModal(true);
  const closeRulesModal = () => setShowRulesModal(false);

  const openAchievementsModal = (athlete: AthleteRanking) => {
    setSelectedAthlete(athlete);
    const achievements = getAchievementsForAthlete(athlete);
    setAthleteAchievements(achievements);
    const unlocked = achievements.filter((a: Achievement) => a.unlocked).length;
    setUnlockedCount(unlocked);
    setTotalAchievements(achievements.length);
    setShowAchievements(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeAchievementsModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAchievements(false);
      setSelectedAthlete(null);
    });
  };

  const countUnlockedAchievements = (athlete: AthleteRanking): number => {
    const achievements = getAchievementsForAthlete(athlete);
    return achievements.filter((a: Achievement) => a.unlocked).length;
  };

  const renderSpecialBadges = (athlete: AthleteRanking) => {
    const badges = [];
    
    if (athlete.perfect_attendance && athlete.attendance_rate === 100) {
      badges.push(
        <View key="perfect" style={[styles.medalBadge, styles.medalGold]}>
          <Text style={styles.medalText}>🏅100%</Text>
        </View>
      );
    }
    
    if (athlete.diamond_eligible) {
      badges.push(
        <View key="diamond" style={[styles.medalBadge, styles.medalDiamond]}>
          <Text style={styles.medalText}>💎1ANO</Text>
        </View>
      );
    } else if (athlete.streak_months >= 6) {
      badges.push(
        <View key="gold" style={[styles.medalBadge, styles.medalGold]}>
          <Text style={styles.medalText}>🌟{athlete.streak_months}m</Text>
        </View>
      );
    } else if (athlete.streak_months >= 3) {
      badges.push(
        <View key="silver" style={[styles.medalBadge, styles.medalSilver]}>
          <Text style={styles.medalText}>⭐{athlete.streak_months}m</Text>
        </View>
      );
    }
    
    if (athlete.absences > 0) {
      badges.push(
        <View key="absence" style={[styles.medalBadge, styles.absenceBadge]}>
          <Text style={styles.absenceBadgeText}>❌{athlete.absences}</Text>
        </View>
      );
    }
    
    return badges;
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchRankingData();
  }, []);

  useEffect(() => {
    let filtered = athletes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a: AthleteRanking) => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((a: AthleteRanking) => a.name.toLowerCase().includes(term));
    }
    
    filtered = [...filtered].sort((a: AthleteRanking, b: AthleteRanking) => {
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
  athletes.forEach((a: AthleteRanking) => {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏆 Ranking</Text>
          <Text style={styles.headerSubtitle}>Classificação por presença</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={fetchRankingData} tintColor={colors.primary} />
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
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.rulesButton} onPress={openRulesModal}>
                <Text style={{ fontSize: 14 }}>📜</Text>
                <Text style={styles.rulesButtonText}>Regras</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchRankingData}>
                <Text style={{ fontSize: 16 }}>🔄</Text>
                <Text style={styles.refreshText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar atleta..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {categories.map((cat: string) => (
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
            { key: 'attendance', label: '📊 Presença' },
            { key: 'absences', label: '❌ Faltas' },
          ].map(({ key, label }: { key: string; label: string }) => (
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
              <Text style={styles.viewButtonText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={styles.viewButtonText}>📱</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredAthletes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 60 }}>🏆</Text>
            <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
          </View>
        ) : viewMode === 'list' ? (
          <View style={styles.listContainer}>
            {filteredAthletes.map((item: AthleteRanking, index: number) => {
              const isTop3 = index < 3;
              const unlockedCount = countUnlockedAchievements(item);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.athleteCard, isTop3 && { borderColor: '#F59E0B', borderWidth: 2 }]}
                  onPress={() => openAchievementsModal(item)}
                  activeOpacity={0.7}
                >
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.athleteName}>{item.name}</Text>
                      {renderSpecialBadges(item)}
                      {unlockedCount > 0 && (
                        <View style={styles.awardsBadge}>
                          <Text style={styles.awardsBadgeText}>🏅{unlockedCount}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.athleteCategory}>{item.category}</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statText, { fontWeight: 'bold', color: '#10B981' }]}>
                          ✅ {item.attended_classes}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statText, { color: '#EF4444' }]}>
                          ❌ {item.absences}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statText, { fontWeight: 'bold', color: item.attendance_rate >= 70 ? '#10B981' : item.attendance_rate >= 50 ? '#F59E0B' : '#EF4444' }]}>
                          📊 {item.attendance_rate}%
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 2 }}>
                      <Text style={[styles.statText, { fontSize: 10, color: colors.textSecondary }]}>
                        Total: {item.total_classes} aulas
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.pointsContainer}>
                    <Text style={styles.pointsValue}>{item.points}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                    <Text style={{ fontSize: 16 }}>👉</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredAthletes.map((item: AthleteRanking, index: number) => {
              const isTop3 = index < 3;
              const unlockedCount = countUnlockedAchievements(item);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={{ width: (width - 48) / 2 }}
                  onPress={() => openAchievementsModal(item)}
                  activeOpacity={0.7}
                >
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
                      {unlockedCount > 0 && (
                        <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 1 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' }}>🏅</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.athleteInfoGrid}>
                      <Text style={styles.athleteNameGrid}>{item.name}</Text>
                      <Text style={styles.athleteCategory}>{item.category}</Text>
                      <Text style={[styles.pointsValue, { fontSize: 22, marginTop: 4 }]}>{item.points}</Text>
                      <Text style={styles.pointsLabel}>pontos</Text>
                      <View style={styles.statsRow}>
                        <Text style={[styles.statText, { fontWeight: 'bold', color: '#10B981' }]}>
                          ✅ {item.attended_classes}
                        </Text>
                        <Text style={[styles.statText, { color: '#EF4444' }]}>
                          ❌ {item.absences}
                        </Text>
                      </View>
                      <Text style={[styles.statText, { fontWeight: 'bold', color: item.attendance_rate >= 70 ? '#10B981' : item.attendance_rate >= 50 ? '#F59E0B' : '#EF4444' }]}>
                        📊 {item.attendance_rate}%
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {renderSpecialBadges(item)}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Modal de Regras */}
      <Modal
        visible={showRulesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeRulesModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeRulesModal}
        >
          <View style={styles.rulesModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.rulesTitle}>📜 Regras das Medalhas</Text>
              <TouchableOpacity onPress={closeRulesModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseEmoji}>❌</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>👑</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença Perfeita</Text>
                  <Text style={styles.rulesDesc}>100% de presença em todas as aulas</Text>
                  <Text style={styles.rulesPoints}>+50 pontos (bônus)</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>💎</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença Diamante</Text>
                  <Text style={styles.rulesDesc}>1 ano completo sem nenhuma falta! 🎉</Text>
                  <Text style={styles.rulesPoints}>+100 pontos (bônus)</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>🌟</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença de Ouro</Text>
                  <Text style={styles.rulesDesc}>6 meses consecutivos sem falta</Text>
                  <Text style={styles.rulesPoints}>+30 pontos (bônus)</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>⭐</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença de Prata</Text>
                  <Text style={styles.rulesDesc}>3 meses consecutivos sem falta</Text>
                  <Text style={styles.rulesPoints}>+20 pontos (bônus)</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>💪</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença de Ouro (90%+)</Text>
                  <Text style={styles.rulesDesc}>90% ou mais de presença</Text>
                  <Text style={styles.rulesPoints}>+30 pontos</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>📊</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença de Prata (80%+)</Text>
                  <Text style={styles.rulesDesc}>80% ou mais de presença</Text>
                  <Text style={styles.rulesPoints}>+20 pontos</Text>
                </View>
              </View>

              <View style={styles.rulesItem}>
                <Text style={styles.rulesIcon}>📈</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Presença de Bronze (70%+)</Text>
                  <Text style={styles.rulesDesc}>70% ou mais de presença</Text>
                  <Text style={styles.rulesPoints}>+10 pontos</Text>
                </View>
              </View>

              <View style={[styles.rulesItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.rulesIcon}>📊</Text>
                <View style={styles.rulesInfo}>
                  <Text style={styles.rulesName}>Pontos Base</Text>
                  <Text style={styles.rulesDesc}>Cada 10% de presença = 15 pontos</Text>
                  <Text style={styles.rulesPoints}>Ex: 80% = 120 pontos base</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.refreshButton, { marginTop: 16, backgroundColor: colors.primary }]}
              onPress={closeRulesModal}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>✅ Entendi!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Prêmios e Conquistas */}
      <Modal
        visible={showAchievements}
        transparent={true}
        animationType="none"
        onRequestClose={closeAchievementsModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeAchievementsModal}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                opacity: fadeAnim, 
                transform: [{ scale: scaleAnim }] 
              }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🏅 Conquistas</Text>
                <TouchableOpacity onPress={closeAchievementsModal} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseEmoji}>❌</Text>
                </TouchableOpacity>
              </View>

              {selectedAthlete && (
                <>
                  <View style={styles.athleteProfileContainer}>
                    <View style={styles.athleteProfileAvatar}>
                      {selectedAthlete.avatar_url ? (
                        <Image 
                          source={{ uri: `${API_URL}${selectedAthlete.avatar_url}` }} 
                          style={{ width: 50, height: 50, borderRadius: 25 }} 
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {selectedAthlete.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.athleteProfileName}>{selectedAthlete.name}</Text>
                      <View style={styles.athleteProfileStats}>
                        <Text style={styles.athleteProfileStat}>⭐ {selectedAthlete.points} pts</Text>
                        <Text style={styles.athleteProfileStat}>🏆 {selectedAthlete.ranking_position}º</Text>
                        <Text style={[styles.athleteProfileStat, { fontWeight: 'bold', color: selectedAthlete.attendance_rate >= 70 ? '#10B981' : '#EF4444' }]}>
                          📊 {selectedAthlete.attendance_rate}%
                        </Text>
                        <Text style={styles.athleteProfileStat}>✅ {selectedAthlete.attended_classes}</Text>
                        <Text style={[styles.athleteProfileStat, { color: '#EF4444' }]}>❌ {selectedAthlete.absences}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.unlockedCounter}>
                    <Text style={styles.unlockedCounterText}>🏅 Conquistas desbloqueadas:</Text>
                    <Text style={styles.unlockedCounterValue}>{unlockedCount} / {totalAchievements}</Text>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                    <View style={styles.achievementGrid}>
                      {athleteAchievements.map((achievement: Achievement) => (
                        <View 
                          key={achievement.id}
                          style={[
                            styles.achievementItem,
                            achievement.unlocked && styles.achievementUnlocked,
                            !achievement.unlocked && styles.achievementLocked,
                          ]}
                        >
                          <Text style={styles.achievementIcon}>
                            {achievement.unlocked ? achievement.icon : '🔒'}
                          </Text>
                          <Text style={styles.achievementName}>{achievement.name}</Text>
                          <Text style={styles.achievementDesc}>{achievement.description}</Text>
                          <View style={styles.achievementProgress}>
                            <View 
                              style={[
                                styles.achievementProgressFill,
                                { 
                                  width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%`,
                                  backgroundColor: achievement.unlocked ? '#F59E0B' : colors.border
                                }
                              ]} 
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Text style={styles.modalFooterText}>
                      👆 Toque fora para fechar • Continue comparecendo para desbloquear mais conquistas!
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}