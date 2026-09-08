//mobile/src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../services/api';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalAthletes: number;
  presentToday: number;
  absentToday: number;
  totalCoaches: number;
  totalTeams: number;
  totalTrainings: number;
  attendanceRate: number;
}

interface RecentAthlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
}

interface RankingAthlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  points: number;
  attendance_rate: number;
  attended_classes: number;
  total_classes: number;
  ranking_position: number;
  perfect_attendance: boolean;
}

// ========== COMPONENTE DE LOGO IGUAL AO APP.TSX ==========
function LogoTitle() {
  const { colors } = useTheme();
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 10, 
        overflow: 'hidden',
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        padding: 4,
      }}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '900', letterSpacing: -0.5, lineHeight: 20 }}>
          RETESP
        </Text>
        <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold', lineHeight: 13 }}>
          4 Linhas
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalAthletes: 0,
    presentToday: 0,
    absentToday: 0,
    totalCoaches: 0,
    totalTeams: 0,
    totalTrainings: 0,
    attendanceRate: 0,
  });
  const [recentAthletes, setRecentAthletes] = useState<RecentAthlete[]>([]);
  const [rankingTop3, setRankingTop3] = useState<RankingAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [athletesByCategory, setAthletesByCategory] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentChampionIndex, setCurrentChampionIndex] = useState(0);
  const [championCarousel, setChampionCarousel] = useState<RankingAthlete[]>([]);
  const [showChampionCarousel, setShowChampionCarousel] = useState(false);
  const [carouselStarted, setCarouselStarted] = useState(false);

  // Animações - SEM useNativeDriver para compatibilidade mobile
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const carouselInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAvatarUrl = (avatar_url: string | null): string | null => {
    if (!avatar_url) return null;
    if (avatar_url.startsWith('http://') || avatar_url.startsWith('https://')) {
      return avatar_url;
    }
    if (avatar_url.startsWith('/uploads/')) {
      let url = avatar_url;
      if (url.endsWith('.bin')) {
        url = url.replace('.bin', '.jpg');
      }
      if (!url.includes('.')) {
        url = url + '.jpg';
      }
      return `${API_URL}${url}`;
    }
    if (avatar_url.startsWith('/')) {
      return `${API_URL}${avatar_url}`;
    }
    return `${API_URL}/uploads/${avatar_url}`;
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 20,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 12,
    },
    errorText: {
      color: colors.danger || '#EF4444',
      marginTop: 12,
      textAlign: 'center',
    },
    errorSubtext: {
      color: colors.textSecondary,
      marginTop: 4,
      fontSize: 12,
    },
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.primary || '#3B82F6',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // ========== HEADER COM LOGO IGUAL AO APP.TSX ==========
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    headerUpdate: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    refreshButton: {
      padding: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      gap: 8,
    },
    statCard: {
      width: (width - 40) / 2,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    statIcon: {
      padding: 8,
      borderRadius: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    statTitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    chart: {
      borderRadius: 16,
      marginVertical: 8,
    },
    lineChartContainer: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflow: 'hidden',
      marginHorizontal: -12,
    },
    barChartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginHorizontal: -12,
    },
    progressCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressTitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    progressValue: {
      color: colors.primary || '#3B82F6',
      fontSize: 18,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.hover || '#21262D',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary || '#3B82F6',
      borderRadius: 4,
    },
    progressStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    progressStat: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    rankingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    rankingTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    rankingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    rankingSeeAll: {
      color: colors.primary || '#3B82F6',
      fontSize: 13,
    },
    championCarouselContainer: {
      height: 120,
      marginBottom: 12,
      overflow: 'hidden',
    },
    championCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary + '30',
      height: 120,
    },
    championAvatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary || '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: '#F59E0B',
    },
    championAvatarImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      resizeMode: 'cover',
    },
    championAvatarText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
    },
    championInfo: {
      flex: 1,
      marginLeft: 12,
    },
    championName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    championCategory: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    championBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    championBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    championStats: {
      alignItems: 'flex-end',
    },
    championPoints: {
      color: '#10B981',
      fontSize: 20,
      fontWeight: 'bold',
    },
    championAttendance: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    carouselIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    indicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    indicatorDotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary || '#3B82F6',
    },
    rankingList: {
      marginTop: 4,
    },
    rankingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rankingItemLast: {
      borderBottomWidth: 0,
    },
    rankingPosition: {
      width: 30,
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    rankingPositionGold: {
      color: '#F59E0B',
    },
    rankingAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary || '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginHorizontal: 10,
    },
    rankingAvatarImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      resizeMode: 'cover',
    },
    rankingAvatarText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    rankingName: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    rankingPercent: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#10B981',
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary || '#3B82F6',
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recentSection: {
      paddingHorizontal: 16,
      marginTop: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    seeAll: {
      color: colors.primary || '#3B82F6',
      fontSize: 13,
    },
    athleteItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    athleteAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary || '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    athleteAvatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: 'cover',
    },
    athleteAvatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    athleteInfo: {
      flex: 1,
      marginLeft: 12,
    },
    athleteName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    athleteCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    emptyState: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      color: colors.textSecondary,
    },
    footer: {
      height: 40,
    },
  });

  // ========== FUNÇÃO PARA INICIAR O CARROSSEL ==========
  const startCarousel = useCallback(() => {
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = null;
    }

    if (championCarousel.length <= 1) {
      setShowChampionCarousel(false);
      setCarouselStarted(false);
      return;
    }

    setShowChampionCarousel(true);
    setCarouselStarted(true);

    carouselInterval.current = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setCurrentChampionIndex(prev => 
          prev === championCarousel.length - 1 ? 0 : prev + 1
        );
        
        slideAnim.setValue(20);
        scaleAnim.setValue(0.9);
        fadeAnim.setValue(0);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }, 3000);
  }, [championCarousel.length, fadeAnim, scaleAnim, slideAnim]);

  const stopCarousel = useCallback(() => {
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = null;
    }
    setCarouselStarted(false);
  }, []);

  // ========== FETCH DADOS ==========
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Buscando dados do dashboard...');

      const athletesRes = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      if (!athletesRes.ok) {
        throw new Error(`Erro ao buscar atletas: ${athletesRes.status}`);
      }
      const athletesData = await athletesRes.json();
      console.log('✅ Atletas carregados:', athletesData?.length || 0);
      
      const coachesRes = await fetch(`${API_URL}/coaches?_t=${Date.now()}`);
      let coachesData = [];
      if (coachesRes.ok) {
        coachesData = await coachesRes.json();
      }
      
      const teamsRes = await fetch(`${API_URL}/teams?_t=${Date.now()}`);
      let teamsData = [];
      if (teamsRes.ok) {
        teamsData = await teamsRes.json();
      }

      const totalAthletes = athletesData?.length || 0;
      const totalCoaches = coachesData?.length || 0;
      const totalTeams = teamsData?.length || 0;

      const today = new Date().toISOString().split('T')[0];
      let presentToday = 0;
      let absentToday = 0;
      
      try {
        const attendanceRes = await fetch(`${API_URL}/attendance/today?date=${today}&_t=${Date.now()}`);
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          presentToday = attendanceData.filter((a: any) => a.present).length;
          absentToday = totalAthletes - presentToday;
        } else {
          presentToday = Math.floor(totalAthletes * 0.75);
          absentToday = totalAthletes - presentToday;
        }
      } catch (err) {
        presentToday = Math.floor(totalAthletes * 0.75);
        absentToday = totalAthletes - presentToday;
      }

      const attendanceRate = totalAthletes > 0 ? (presentToday / totalAthletes) * 100 : 0;

      let rankingData: RankingAthlete[] = [];
      
      try {
        const attendancePromises = athletesData.map(async (athlete: any) => {
          try {
            const res = await fetch(`${API_URL}/attendance/athlete/${athlete.id}?_t=${Date.now()}`);
            if (res.ok) {
              const data = await res.json();
              const total = data.length;
              const present = data.filter((r: any) => r.present).length;
              const rate = total > 0 ? (present / total) * 100 : 0;
              const points = Math.floor(rate / 10) * 15;
              return {
                id: athlete.id,
                name: athlete.name,
                category: athlete.category,
                avatar_url: athlete.avatar_url,
                points: points + (rate === 100 ? 50 : 0),
                attendance_rate: rate,
                attended_classes: present,
                total_classes: total,
                perfect_attendance: rate === 100 && total > 0,
              };
            }
            return null;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(attendancePromises);
        rankingData = results.filter((r): r is RankingAthlete => r !== null);
        
        rankingData.sort((a, b) => b.points - a.points);
        rankingData.forEach((item, index) => {
          item.ranking_position = index + 1;
        });
        
        console.log('🏆 Ranking carregado:', rankingData.length);
      } catch (err) {
        console.warn('⚠️ Erro ao carregar ranking:', err);
      }

      setStats({
        totalAthletes,
        presentToday,
        absentToday,
        totalCoaches,
        totalTeams,
        totalTrainings: 0,
        attendanceRate,
      });

      setRecentAthletes(athletesData?.slice(-5).reverse() || []);
      setRankingTop3(rankingData.slice(0, 3));

      const categoryMap: Record<string, number> = {};
      athletesData?.forEach((a: any) => {
        categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
      });
      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));
      setAthletesByCategory(categoryData);

      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      
    } catch (err) {
      console.error('❌ Erro ao carregar dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    stopCarousel();
    
    if (rankingTop3.length > 0) {
      const topPoints = rankingTop3[0]?.points || 0;
      const tiedAthletes = rankingTop3.filter(a => a.points === topPoints);
      
      setChampionCarousel(tiedAthletes);
      setCurrentChampionIndex(0);
      
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      slideAnim.setValue(0);
      
      if (tiedAthletes.length > 1) {
        setTimeout(() => {
          startCarousel();
        }, 500);
      } else {
        setShowChampionCarousel(false);
        setCarouselStarted(false);
      }
    } else {
      setChampionCarousel([]);
      setShowChampionCarousel(false);
      setCarouselStarted(false);
    }

    return () => {
      stopCarousel();
    };
  }, [rankingTop3]);

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Dashboard em foco, atualizando dados...');
      fetchDashboardData();
      return () => {
        stopCarousel();
      };
    }, [])
  );

  useEffect(() => {
    if (rankingTop3.length > 0 && championCarousel.length > 1 && !carouselStarted) {
      startCarousel();
    }
  }, [rankingTop3, championCarousel, carouselStarted]);

  const onRefresh = () => {
    console.log('🔄 Pull to refresh...');
    stopCarousel();
    setCarouselStarted(false);
    setRefreshing(true);
    fetchDashboardData();
  };

  // Dados para gráficos
  const attendanceChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [
          stats.presentToday * 0.2 + 10,
          stats.presentToday * 0.4 + 15,
          stats.presentToday * 0.6 + 20,
          stats.presentToday * 0.8 + 25,
          stats.presentToday * 0.7 + 30,
          stats.presentToday * 0.3 + 5,
          stats.presentToday * 0.1,
        ],
      },
    ],
  };

  const barData = {
    labels: athletesByCategory.map(item => item.name).slice(0, 5),
    datasets: [
      {
        data: athletesByCategory.map(item => item.value).slice(0, 5),
      },
    ],
  };

  const finalBarData = barData.labels.length > 0 ? barData : {
    labels: ['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Adulto'],
    datasets: [{ data: [12, 18, 15, 10, 8] }],
  };

  const pieData = [
    { 
      name: 'Presentes', 
      population: stats.presentToday || 10, 
      color: '#10B981', 
      legendFontColor: colors.textSecondary, 
      legendFontSize: 12 
    },
    { 
      name: 'Ausentes', 
      population: stats.absentToday || 5, 
      color: '#EF4444', 
      legendFontColor: colors.textSecondary, 
      legendFontSize: 12 
    },
  ];

  const chartConfig = {
    backgroundColor: isDark ? '#161B22' : '#ffffff',
    backgroundGradientFrom: isDark ? '#161B22' : '#ffffff',
    backgroundGradientTo: isDark ? '#161B22' : '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
    barPercentage: 0.7,
  };

  const chartWidth = width - 32 - 16;

  // Renderizar o carrossel do campeão
  const renderChampionCarousel = () => {
    if (championCarousel.length === 0) return null;

    const athlete = championCarousel[currentChampionIndex];
    
    return (
      <Animated.View 
        style={[
          styles.championCarouselContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateX: slideAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.championCard}
          onPress={() => navigation.navigate('Ranking')}
          activeOpacity={0.8}
        >
          <View style={styles.championAvatar}>
            {athlete.avatar_url && !imageErrors[athlete.id] ? (
              <Image
                source={{ uri: getAvatarUrl(athlete.avatar_url) || undefined }}
                style={styles.championAvatarImage}
                onError={() => handleImageError(athlete.id)}
              />
            ) : (
              <Text style={styles.championAvatarText}>
                {athlete.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <View style={styles.championInfo}>
            <Text style={styles.championName}>{athlete.name}</Text>
            <Text style={styles.championCategory}>{athlete.category}</Text>
            <View style={styles.championBadge}>
              <Text style={{ fontSize: 12 }}>👑</Text>
              <Text style={styles.championBadgeText}>CAMPEÃO DE PRESENÇA</Text>
            </View>
          </View>
          <View style={styles.championStats}>
            <Text style={styles.championPoints}>{athlete.points} pts</Text>
            <Text style={styles.championAttendance}>📊 {athlete.attendance_rate.toFixed(0)}%</Text>
            <Text style={styles.championAttendance}>✅ {athlete.attended_classes} presenças</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCarouselIndicators = () => {
    if (championCarousel.length <= 1) return null;

    return (
      <View style={styles.carouselIndicators}>
        {championCarousel.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              currentChampionIndex === index && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderRanking = () => {
    if (rankingTop3.length === 0) {
      return (
        <View style={styles.rankingCard}>
          <View style={styles.rankingHeader}>
            <Text style={styles.rankingTitle}>🏆 Ranking de Presença</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ranking')}>
              <Text style={styles.rankingSeeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <Text style={styles.emptyText}>Nenhum dado de ranking disponível</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.rankingCard}>
        <View style={styles.rankingHeader}>
          <Text style={styles.rankingTitle}>
            {championCarousel.length > 1 ? '👑 CARROSSEL DE CAMPEÕES' : '🏆 Ranking de Presença'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Ranking')}>
            <Text style={styles.rankingSeeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {renderChampionCarousel()}
        {renderCarouselIndicators()}

        <View style={styles.rankingList}>
          {rankingTop3.slice(1).map((item, index) => {
            const position = index + 2;
            const medal = position === 2 ? '🥈' : '🥉';
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.rankingItem, index === rankingTop3.length - 2 && styles.rankingItemLast]}
                onPress={() => navigation.navigate('Ranking')}
                activeOpacity={0.7}
              >
                <Text style={[styles.rankingPosition, position === 2 && styles.rankingPositionGold]}>
                  {medal}
                </Text>
                <View style={styles.rankingAvatar}>
                  {item.avatar_url && !imageErrors[item.id] ? (
                    <Image
                      source={{ uri: getAvatarUrl(item.avatar_url) || undefined }}
                      style={styles.rankingAvatarImage}
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <Text style={styles.rankingAvatarText}>
                      {item.name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
                <Text style={styles.rankingName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.rankingPercent}>{item.attendance_rate.toFixed(0)}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary || '#3B82F6'} />
        <Text style={styles.loadingText}>⏳ Carregando dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 50 }}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Verifique se o backend está rodando</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>🔄 Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary || '#3B82F6'} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ========== HEADER COM LOGO IGUAL AO APP.TSX ========== */}
      <View style={styles.header}>
        <LogoTitle />

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📊 Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
          <Text style={styles.headerUpdate}>
            🕐 {lastUpdate}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={{ fontSize: 18 }}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: (colors.primary || '#3B82F6') + '40' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: (colors.primary || '#3B82F6') + '20' }]}>
              <Text style={{ fontSize: 20 }}>👥</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalAthletes}</Text>
          </View>
          <Text style={styles.statTitle}>Atletas</Text>
          <Text style={styles.statSubtitle}>Total cadastrados</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#10B98140' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Text style={{ fontSize: 20 }}>✅</Text>
            </View>
            <Text style={styles.statValue}>{stats.presentToday}</Text>
          </View>
          <Text style={styles.statTitle}>Presentes</Text>
          <Text style={styles.statSubtitle}>{stats.attendanceRate.toFixed(0)}%</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#EF444440' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
              <Text style={{ fontSize: 20 }}>❌</Text>
            </View>
            <Text style={styles.statValue}>{stats.absentToday}</Text>
          </View>
          <Text style={styles.statTitle}>Ausentes</Text>
          <Text style={styles.statSubtitle}>{(100 - stats.attendanceRate).toFixed(0)}%</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#8B5CF640' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Text style={{ fontSize: 20 }}>🏫</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalTeams}</Text>
          </View>
          <Text style={styles.statTitle}>Turmas</Text>
          <Text style={styles.statSubtitle}>Total de turmas</Text>
        </View>
      </View>

      {/* RANKING DE PRESENÇA COM CARROSSEL */}
      {renderRanking()}

      {/* Gráfico de Frequência */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📈 Frequência da Semana</Text>
        <View style={styles.lineChartContainer}>
          <LineChart
            data={attendanceChartData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Gráfico de Atletas por Categoria */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📊 Atletas por Categoria</Text>
        <View style={styles.barChartContainer}>
          <BarChart
            data={finalBarData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero={true}
          />
        </View>
      </View>

      {/* Gráfico de Distribuição */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>🥧 Distribuição de Presença</Text>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={180}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Progresso de Presença */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>📈 Taxa de Presença</Text>
          <Text style={styles.progressValue}>{stats.attendanceRate.toFixed(0)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${stats.attendanceRate}%` }
            ]} 
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={styles.progressStat}>✅ {stats.presentToday} presentes</Text>
          <Text style={styles.progressStat}>❌ {stats.absentToday} ausentes</Text>
        </View>
      </View>

      {/* Resumo */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Resumo</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalCoaches}</Text>
            <Text style={styles.summaryLabel}>👨‍🏫 Professores</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalTeams}</Text>
            <Text style={styles.summaryLabel}>🏫 Turmas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalAthletes}</Text>
            <Text style={styles.summaryLabel}>👥 Atletas</Text>
          </View>
        </View>
      </View>

      {/* Últimos Atletas */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🆕 Últimos Atletas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Atletas')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {recentAthletes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>👥</Text>
            <Text style={styles.emptyText}>Nenhum atleta cadastrado</Text>
          </View>
        ) : (
          recentAthletes.map((athlete) => {
            const avatarUrl = getAvatarUrl(athlete.avatar_url);
            const hasError = imageErrors[athlete.id];
            const showInitials = !avatarUrl || hasError;

            return (
              <View key={athlete.id} style={styles.athleteItem}>
                <View style={styles.athleteAvatar}>
                  {showInitials ? (
                    <Text style={styles.athleteAvatarText}>
                      {athlete.name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  ) : (
                    <Image
                      source={{ uri: avatarUrl || undefined }}
                      style={styles.athleteAvatarImage}
                      onError={() => handleImageError(athlete.id)}
                    />
                  )}
                </View>
                <View style={styles.athleteInfo}>
                  <Text style={styles.athleteName}>{athlete.name}</Text>
                  <Text style={styles.athleteCategory}>{athlete.category}</Text>
                </View>
                <Text style={{ fontSize: 18 }}>▶️</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}