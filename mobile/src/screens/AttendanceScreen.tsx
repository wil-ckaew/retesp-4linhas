import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
}

interface AttendanceStatus {
  athlete_id: string;
  name: string;
  category: string;
  present: boolean;
}

export default function AttendanceScreen() {
  const { colors, isDark } = useTheme();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

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
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 8,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statPresent: {
      borderColor: '#10B98140',
      backgroundColor: '#10B98110',
    },
    statAbsent: {
      borderColor: '#EF444440',
      backgroundColor: '#EF444410',
    },
    statPercentage: {
      borderColor: colors.primary + '40',
      backgroundColor: colors.primary + '10',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    dateArrow: {
      padding: 8,
    },
    dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    dateText: {
      color: colors.text,
      fontSize: 14,
    },
    filtersContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 14,
    },
    categoryFilter: {
      flexDirection: 'row',
      paddingVertical: 4,
    },
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.hover,
      marginRight: 6,
    },
    categoryActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    progressContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    progressTitle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    progressValue: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.hover,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    bulkActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    bulkButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
      borderWidth: 1,
    },
    bulkPresent: {
      backgroundColor: '#10B98120',
      borderColor: '#10B98140',
    },
    bulkAbsent: {
      backgroundColor: '#EF444420',
      borderColor: '#EF444440',
    },
    bulkButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    athletesContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    listTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    athleteItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    athleteItemPresent: {
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
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    athleteAvatarText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
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
    athleteStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    presentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98120',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    presentText: {
      color: '#10B981',
      fontSize: 11,
      fontWeight: '500',
    },
    absentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EF444420',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    absentText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '500',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      marginBottom: 16,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      height: 20,
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
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 340,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    dateInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 16,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: colors.hover,
    },
    modalButtonConfirm: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    todayButton: {
      marginTop: 12,
      paddingVertical: 10,
      alignItems: 'center',
    },
    todayButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      const data = await res.json();
      setAthletes(data || []);
      
      const initialAttendance = (data || []).map((athlete: any) => ({
        athlete_id: athlete.id,
        name: athlete.name,
        category: athlete.category,
        present: false,
      }));
      setAttendance(initialAttendance);
      updateStats(initialAttendance);
      
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os atletas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_URL}/attendance/today?date=${date}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const updatedAttendance = attendance.map((item) => {
          const found = data.find((d: any) => d.athlete_id === item.athlete_id);
          return {
            ...item,
            present: found ? found.present : false,
          };
        });
        setAttendance(updatedAttendance);
        updateStats(updatedAttendance);
      }
    } catch (error) {
      console.error('Erro ao carregar chamada:', error);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    if (athletes.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate]);

  const updateStats = (attendanceList: AttendanceStatus[]) => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    setStats({ total, present, absent, percentage });
  };

  const toggleAttendance = (athleteId: string) => {
    const updated = attendance.map((item) =>
      item.athlete_id === athleteId
        ? { ...item, present: !item.present }
        : item
    );
    setAttendance(updated);
    updateStats(updated);
  };

  const getFilteredAthletes = () => {
    let filtered = attendance;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(term));
    }
    
    return filtered;
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const date = selectedDate || new Date().toISOString().split('T')[0];
      let successCount = 0;
      let errorCount = 0;

      for (const item of attendance) {
        try {
          const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              athlete_id: item.athlete_id,
              training_date: date,
              present: item.present || false,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        Alert.alert(
          '✅ Sucesso!',
          `Chamada salva com sucesso!\n\n📅 Data: ${new Date(date).toLocaleDateString('pt-BR')}\n✅ Presentes: ${stats.present}\n❌ Ausentes: ${stats.absent}\n📊 Taxa: ${stats.percentage.toFixed(0)}%`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                fetchAthletes();
                if (athletes.length > 0) {
                  fetchAttendance();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '⚠️ Atenção',
          `${successCount} atletas salvos, ${errorCount} com erro.`
        );
      }
      
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
      Alert.alert('❌ Erro', 'Não foi possível salvar a chamada. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? true : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const markAllAbsent = () => {
    const filteredIds = getFilteredAthletes().map(a => a.athlete_id);
    const updated = attendance.map((item) => ({
      ...item,
      present: filteredIds.includes(item.athlete_id) ? false : item.present,
    }));
    setAttendance(updated);
    updateStats(updated);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthletes();
    if (athletes.length > 0) {
      fetchAttendance();
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Hoje';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    currentDate.setDate(currentDate.getDate() + days);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const categories = Array.from(new Set(athletes.map(a => a.category)));

  const filteredAthletes = getFilteredAthletes();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando chamada...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Chamada</Text>
          <Text style={styles.headerSubtitle}>
            {new Date(selectedDate || getTodayDate()).toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>👥 Total</Text>
          </View>
          <View style={[styles.statBox, styles.statPresent]}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.present}</Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>✅ Presentes</Text>
          </View>
          <View style={[styles.statBox, styles.statAbsent]}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.absent}</Text>
            <Text style={[styles.statLabel, { color: '#EF4444' }]}>❌ Ausentes</Text>
          </View>
          <View style={[styles.statBox, styles.statPercentage]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.percentage.toFixed(0)}%</Text>
            <Text style={[styles.statLabel, { color: colors.primary }]}>📊 Presença</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
            <Icon name="chevron-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateDisplay}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {selectedDate ? formatDateDisplay(selectedDate) : 'Hoje'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
            <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Busca e Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar atleta..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, selectedCategory === cat && styles.categoryActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Taxa de Presença</Text>
            <Text style={styles.progressValue}>{stats.percentage.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${stats.percentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Ações em massa */}
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkPresent]}
            onPress={markAllPresent}
          >
            <Icon name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.bulkButtonText}>Todos Presentes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, styles.bulkAbsent]}
            onPress={markAllAbsent}
          >
            <Icon name="close-circle" size={18} color="#EF4444" />
            <Text style={styles.bulkButtonText}>Todos Ausentes</Text>
          </TouchableOpacity>
        </View>

        {/* Athletes List */}
        <View style={styles.athletesContainer}>
          <Text style={styles.listTitle}>👥 Atletas</Text>

          {filteredAthletes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="people-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
            </View>
          ) : (
            filteredAthletes.map((item) => (
              <TouchableOpacity
                key={item.athlete_id}
                style={[
                  styles.athleteItem,
                  item.present && styles.athleteItemPresent,
                ]}
                onPress={() => toggleAttendance(item.athlete_id)}
                activeOpacity={0.7}
              >
                <View style={styles.athleteInfo}>
                  <View style={styles.athleteAvatar}>
                    <Text style={styles.athleteAvatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.athleteName}>{item.name}</Text>
                    <Text style={styles.athleteCategory}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.athleteStatus}>
                  {item.present ? (
                    <View style={styles.presentBadge}>
                      <Icon name="checkmark" size={16} color="#10B981" />
                      <Text style={styles.presentText}>Presente</Text>
                    </View>
                  ) : (
                    <View style={styles.absentBadge}>
                      <Icon name="close" size={16} color="#EF4444" />
                      <Text style={styles.absentText}>Ausente</Text>
                    </View>
                  )}
                  <Icon 
                    name={item.present ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={24} 
                    color={item.present ? '#10B981' : colors.textSecondary} 
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveAttendance}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>💾 Salvar Chamada</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>

      {/* Modal de Data */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📅 Selecionar Data</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={tempDate || selectedDate}
              onChangeText={setTempDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setTempDate('');
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={() => {
                  if (tempDate) {
                    setSelectedDate(tempDate);
                    setTempDate('');
                  }
                  setShowDatePicker(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => {
                setSelectedDate('');
                setTempDate('');
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.todayButtonText}>Usar data de hoje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
