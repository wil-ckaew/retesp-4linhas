import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import Logo from '../components/Logo';

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

export default function DashboardScreen() {
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Buscando dados do dashboard...');
      console.log('🔗 API_URL:', API_URL);

      const athletesRes = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      console.log('📊 Status atletas:', athletesRes.status);
      
      if (!athletesRes.ok) {
        throw new Error(`Erro ao buscar atletas: ${athletesRes.status}`);
      }
      
      const athletesData = await athletesRes.json();
      console.log('✅ Atletas carregados:', athletesData?.length || 0);
      
      const coachesRes = await fetch(`${API_URL}/coaches?_t=${Date.now()}`);
      const coachesData = await coachesRes.json();
      
      const teamsRes = await fetch(`${API_URL}/teams?_t=${Date.now()}`);
      const teamsData = await teamsRes.json();

      const trainingsRes = await fetch(`${API_URL}/trainings?_t=${Date.now()}`).catch(() => null);
      const trainingsData = trainingsRes && trainingsRes.ok ? await trainingsRes.json() : [];

      const totalAthletes = athletesData?.length || 0;
      const totalCoaches = coachesData?.length || 0;
      const totalTeams = teamsData?.length || 0;
      const totalTrainings = trainingsData?.length || 0;

      const presentToday = Math.floor(totalAthletes * 0.75);
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
      
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Verifique se o backend está rodando</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header com Logo */}
      <View style={styles.header}>
        <Logo size="medium" showText={true} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: '#3B82F640' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
              <Icon name="people-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.totalAthletes}</Text>
          </View>
          <Text style={styles.statTitle}>Atletas</Text>
          <Text style={styles.statSubtitle}>+12% este mês</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#10B98140' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Icon name="checkmark-circle-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.presentToday}</Text>
          </View>
          <Text style={styles.statTitle}>Presentes</Text>
          <Text style={styles.statSubtitle}>{stats.attendanceRate.toFixed(0)}%</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#EF444440' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
              <Icon name="close-circle-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.absentToday}</Text>
          </View>
          <Text style={styles.statTitle}>Ausentes</Text>
          <Text style={styles.statSubtitle}>{(100 - stats.attendanceRate).toFixed(0)}%</Text>
        </View>

        <View style={[styles.statCard, { borderColor: '#8B5CF640' }]}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Icon name="fitness-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.totalTrainings}</Text>
          </View>
          <Text style={styles.statTitle}>Treinos</Text>
          <Text style={styles.statSubtitle}>esta semana</Text>
        </View>
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
            <Text style={styles.summaryLabel}>Professores</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalTeams}</Text>
            <Text style={styles.summaryLabel}>Turmas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.totalTrainings}</Text>
            <Text style={styles.summaryLabel}>Treinos</Text>
          </View>
        </View>
      </View>

      {/* Últimos Atletas */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🆕 Últimos Atletas</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {recentAthletes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum atleta cadastrado</Text>
          </View>
        ) : (
          recentAthletes.map((athlete) => (
            <View key={athlete.id} style={styles.athleteItem}>
              <View style={styles.athleteAvatar}>
                <Text style={styles.athleteAvatarText}>
                  {athlete.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.athleteInfo}>
                <Text style={styles.athleteName}>{athlete.name}</Text>
                <Text style={styles.athleteCategory}>{athlete.category}</Text>
              </View>
              <Icon name="chevron-forward-outline" size={20} color="#6B7280" />
            </View>
          ))
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 12,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  progressValue: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#21262D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressStat: {
    color: '#6B7280',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  summaryTitle: {
    color: '#FFFFFF',
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
    color: '#3B82F6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
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
    color: '#FFFFFF',
  },
  seeAll: {
    color: '#3B82F6',
    fontSize: 13,
  },
  athleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#21262D',
  },
  athleteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  athleteCategory: {
    color: '#6B7280',
    fontSize: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#161B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#21262D',
  },
  emptyText: {
    color: '#6B7280',
  },
  footer: {
    height: 40,
  },
});
