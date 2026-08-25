import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../services/api';

interface Athlete {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

export default function AthleteDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchAthlete = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes/${id}`);
      const data = await res.json();
      setAthlete(data);
    } catch (error) {
      console.error('Erro ao buscar atleta:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAthlete();
  }, [id]);

  const fetchAttendanceHistory = async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`${API_URL}/attendance/athlete/${id}`);
      const data = await res.json();
      setAttendanceHistory(data);
      setShowAttendance(true);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de presenças');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthlete();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateStats = () => {
    const total = attendanceHistory.length;
    const present = attendanceHistory.filter(a => a.present).length;
    const absent = total - present;
    const frequency = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, frequency };
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Atleta',
      'Tem certeza que deseja excluir este atleta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/athletes/${id}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                Alert.alert('Sucesso', 'Atleta excluído com sucesso!', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o atleta');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!athlete) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Atleta não encontrado</Text>
      </View>
    );
  }

  const stats = calculateStats();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Card Principal com Expansão */}
      <TouchableOpacity
        style={styles.mainCard}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {athlete.avatar_url ? (
              <Image
                source={{ uri: `${API_URL}${athlete.avatar_url}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {athlete.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{athlete.name}</Text>
            <Text style={styles.cardCategory}>{athlete.category}</Text>
            <Text style={styles.cardAge}>{calculateAge(athlete.birth_date)} anos</Text>
          </View>
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#6B7280"
          />
        </View>

        {/* Conteúdo Expandido */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Data de Nascimento</Text>
              <Text style={styles.infoValue}>
                {new Date(athlete.birth_date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏷️ Categoria</Text>
              <Text style={styles.infoValue}>{athlete.category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📄 Ficha Médica</Text>
              {athlete.medical_form_url ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`${API_URL}${athlete.medical_form_url}`)}
                >
                  <Text style={styles.linkText}>Visualizar PDF</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>Não anexada</Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={fetchAttendanceHistory}
        >
          <Icon name="stats-chart" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Presenças</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonEdit]}
          onPress={() => {
            console.log('Navegando para EditAthlete com id:', athlete.id);
            // @ts-ignore
            navigation.navigate('EditAthlete', { id: athlete.id });
          }}
        >
          <Icon name="create" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={handleDelete}
        >
          <Icon name="trash" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico de Presenças */}
      {showAttendance && (
        <View style={styles.attendanceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Histórico de Presenças</Text>
            <TouchableOpacity onPress={() => setShowAttendance(false)}>
              <Icon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {attendanceLoading ? (
            <View style={styles.attendanceLoading}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : attendanceHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={40} color="#6B7280" />
              <Text style={styles.emptyText}>Nenhum registro de presença</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statCard, styles.statCardGreen]}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>
                    {stats.present}
                  </Text>
                  <Text style={styles.statLabel}>Presentes</Text>
                </View>
                <View style={[styles.statCard, styles.statCardRed]}>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    {stats.absent}
                  </Text>
                  <Text style={styles.statLabel}>Faltas</Text>
                </View>
                <View style={[styles.statCard, styles.statCardYellow]}>
                  <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                    {stats.frequency}%
                  </Text>
                  <Text style={styles.statLabel}>Frequência</Text>
                </View>
              </View>

              {attendanceHistory.map((record, index) => {
                const date = new Date(record.date);
                const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                return (
                  <View key={index} style={styles.attendanceItem}>
                    <Text style={styles.attendanceDate}>
                      {date.toLocaleDateString('pt-BR')}
                    </Text>
                    <Text style={styles.attendanceDay}>
                      {weekDays[date.getDay()]}
                    </Text>
                    <View style={styles.attendanceStatus}>
                      {record.present ? (
                        <>
                          <Icon name="checkmark-circle" size={18} color="#10B981" />
                          <Text style={styles.attendancePresent}>Presente</Text>
                        </>
                      ) : (
                        <>
                          <Icon name="close-circle" size={18} color="#EF4444" />
                          <Text style={styles.attendanceAbsent}>Faltou</Text>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    padding: 16,
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
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  mainCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardCategory: {
    color: '#6B7280',
    fontSize: 14,
  },
  cardAge: {
    color: '#3B82F6',
    fontSize: 12,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  actionButtonEdit: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonDanger: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceSection: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceLoading: {
    padding: 20,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0D1117',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
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
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1117',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  attendanceDate: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  attendanceDay: {
    color: '#6B7280',
    fontSize: 12,
    flex: 1,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendancePresent: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
  },
  attendanceAbsent: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 8,
  },
});
