import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../services/api';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, frequency: 0 });
  const [athletes, setAthletes] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const athletesRes = await fetch(`${API_URL}/athletes`);
      const athletesData = await athletesRes.json();
      setAthletes(athletesData);
      
      const total = athletesData.length;
      
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`${API_URL}/attendance/today?date=${today}`);
      const attendanceData = await attendanceRes.json();
      
      const present = attendanceData.filter((a: any) => a.present).length;
      const absent = total - present;
      const frequency = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setStats({ total, present, absent, frequency });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const navigateTo = (screen: string) => {
    // @ts-ignore
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Header com Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoRetesp}>RETESP</Text>
            <Text style={styles.logoQuatro}>4 Linhas</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Sistema de Gestão Esportiva</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Conectado ao backend</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Atletas</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.present}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRed]}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.absent}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
        <View style={[styles.statCard, styles.statCardYellow]}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.frequency}%</Text>
          <Text style={styles.statLabel}>Frequência</Text>
        </View>
      </View>

      {/* Módulos Rápidos */}
      <View style={styles.modulesGrid}>
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('Atletas')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#3B82F620' }]}>
            <Icon name="people" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.moduleTitle}>Atletas</Text>
          <Text style={styles.moduleDesc}>Gerenciar atletas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('Chamada')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#10B98120' }]}>
            <Icon name="checkbox" size={24} color="#10B981" />
          </View>
          <Text style={styles.moduleTitle}>Chamada</Text>
          <Text style={styles.moduleDesc}>Registrar presença</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('Mídia')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#8B5CF620' }]}>
            <Icon name="images" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.moduleTitle}>Mídia</Text>
          <Text style={styles.moduleDesc}>Fotos e vídeos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('Social')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#EC489920' }]}>
            <Icon name="share-social" size={24} color="#EC4899" />
          </View>
          <Text style={styles.moduleTitle}>Social</Text>
          <Text style={styles.moduleDesc}>Rede social</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('IA')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#F59E0B20' }]}>
            <Icon name="bulb" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.moduleTitle}>IA RETESP</Text>
          <Text style={styles.moduleDesc}>Treinos com IA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigateTo('Perfil')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#6B728020' }]}>
            <Icon name="person" size={24} color="#6B7280" />
          </View>
          <Text style={styles.moduleTitle}>Perfil</Text>
          <Text style={styles.moduleDesc}>Configurações</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 6,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoRetesp: {
    fontSize: 28,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  logoQuatro: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: -2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    backgroundColor: '#10B98110',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363D',
    alignItems: 'center',
  },
  statCardGreen: {
    borderColor: '#10B98140',
  },
  statCardRed: {
    borderColor: '#EF444440',
  },
  statCardYellow: {
    borderColor: '#F59E0B40',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  moduleCard: {
    width: '31%',
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 8,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  moduleTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  moduleDesc: {
    color: '#6B7280',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
});
