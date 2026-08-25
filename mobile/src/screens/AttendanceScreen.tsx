import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  present?: boolean;
}

export default function AttendanceScreen() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20'];

  const fetchData = async () => {
    try {
      // Buscar atletas
      const athletesRes = await fetch(`${API_URL}/athletes`);
      const athletesData = await athletesRes.json();
      
      // Buscar chamada de hoje
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await fetch(`${API_URL}/attendance/today?date=${today}`);
      const attendanceData = await attendanceRes.json();

      // Mesclar dados
      const merged = athletesData.map((a: Athlete) => ({
        ...a,
        present: attendanceData.find((att: any) => att.athlete_id === a.id)?.present || false,
      }));

      setAthletes(merged);
      setFilteredAthletes(merged);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar atletas
  useEffect(() => {
    let filtered = athletes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, athletes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleAttendance = (athleteId: string) => {
    setAthletes(prev =>
      prev.map(a =>
        a.id === athleteId ? { ...a, present: !a.present } : a
      )
    );
  };

  const markAllPresent = () => {
    setAthletes(prev =>
      prev.map(a => {
        if (filteredAthletes.some(fa => fa.id === a.id)) {
          return { ...a, present: true };
        }
        return a;
      })
    );
  };

  const markAllAbsent = () => {
    setAthletes(prev =>
      prev.map(a => {
        if (filteredAthletes.some(fa => fa.id === a.id)) {
          return { ...a, present: false };
        }
        return a;
      })
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const presentCount = filteredAthletes.filter(a => a.present).length;
      
      // Salvar cada presença
      for (const athlete of filteredAthletes) {
        const response = await fetch(`${API_URL}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            athlete_id: athlete.id,
            training_date: date,
            present: athlete.present || false,
          }),
        });
        
        if (!response.ok) {
          console.error(`Erro ao salvar presença de ${athlete.name}`);
        }
      }

      Alert.alert(
        '✅ Sucesso!',
        `Chamada salva com sucesso!\n\n📅 Data: ${new Date(date).toLocaleDateString('pt-BR')}\n✅ Presentes: ${presentCount} de ${filteredAthletes.length}\n📊 Frequência: ${Math.round((presentCount / filteredAthletes.length) * 100)}%`
      );
      
      // Recarregar dados
      await fetchData();
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      Alert.alert('❌ Erro', 'Não foi possível salvar a chamada');
    } finally {
      setSaving(false);
    }
  };

  const calculateStats = () => {
    const total = filteredAthletes.length;
    const present = filteredAthletes.filter(a => a.present).length;
    const absent = total - present;
    const frequency = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, frequency };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando atletas...</Text>
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
      {/* Data de Hoje */}
      <View style={styles.dateHeader}>
        <Icon name="calendar" size={20} color="#3B82F6" />
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
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

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar atleta..."
          placeholderTextColor="#6B7280"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm !== '' && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Icon name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros por Categoria */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat === 'all' ? '🏆 Todas' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ações Rápidas */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonPresent]} onPress={markAllPresent}>
          <Icon name="checkmark-done" size={16} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Todos Presentes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonAbsent]} onPress={markAllAbsent}>
          <Icon name="close" size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Todos Faltaram</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Atletas */}
      {filteredAthletes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={60} color="#6B7280" />
          <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
          <Text style={styles.emptySubtext}>Tente ajustar os filtros ou a busca</Text>
        </View>
      ) : (
        filteredAthletes.map((athlete) => (
          <TouchableOpacity
            key={athlete.id}
            style={[
              styles.athleteCard,
              athlete.present && styles.athleteCardPresent,
            ]}
            onPress={() => toggleAttendance(athlete.id)}
            activeOpacity={0.7}
          >
            <View style={styles.athleteInfo}>
              <View style={styles.athleteAvatar}>
                <Text style={styles.avatarText}>
                  {athlete.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.athleteName}>{athlete.name}</Text>
                <Text style={styles.athleteCategory}>{athlete.category}</Text>
              </View>
            </View>
            <View style={styles.athleteStatus}>
              <Text
                style={[
                  styles.statusText,
                  athlete.present ? styles.statusPresent : styles.statusAbsent,
                ]}
              >
                {athlete.present ? '✅ Presente' : '❌ Faltou'}
              </Text>
              <View
                style={[
                  styles.statusDot,
                  athlete.present ? styles.statusDotPresent : styles.statusDotAbsent,
                ]}
              />
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Botão Salvar */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveAttendance}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Icon name="save" size={20} color="#FFFFFF" />
            <Text style={styles.saveText}>💾 Salvar Chamada</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    paddingHorizontal: 16,
    paddingTop: 12,
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    gap: 8,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#161B22',
    borderRadius: 10,
    padding: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#21262D',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    color: '#6B7280',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonPresent: {
    backgroundColor: '#10B98110',
    borderColor: '#10B98140',
  },
  actionButtonAbsent: {
    backgroundColor: '#EF444410',
    borderColor: '#EF444440',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161B22',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  athleteCardPresent: {
    borderColor: '#10B98140',
    backgroundColor: '#10B98110',
  },
  athleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  athleteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  athleteCategory: {
    color: '#6B7280',
    fontSize: 12,
  },
  athleteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusPresent: {
    color: '#10B981',
  },
  statusAbsent: {
    color: '#EF4444',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotPresent: {
    backgroundColor: '#10B981',
  },
  statusDotAbsent: {
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
