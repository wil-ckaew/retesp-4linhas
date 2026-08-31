import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface Training {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  objective: string;
  date: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  athlete_count: number;
  coach_name?: string;
  exercises?: string[];
  created_at: string;
}

export default function TrainingsScreen() {
  const { colors, isDark } = useTheme();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    category: '',
    duration: '60',
    objective: '',
    date: '',
    time: '',
    exercises: [] as string[],
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 12,
      fontSize: 15,
    },
    filtersContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.hover,
      marginRight: 8,
    },
    filterActive: {
      backgroundColor: colors.primary,
    },
    filterText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    categoryFilters: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    categoryButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      backgroundColor: colors.hover,
      marginRight: 6,
    },
    categoryActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    categoryTextActive: {
      color: '#FFFFFF',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginVertical: 8,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 12,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    trainingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statusIndicator: {
      width: 4,
      height: 40,
      borderRadius: 2,
      marginRight: 12,
    },
    cardTitleContainer: {
      flex: 1,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      gap: 4,
    },
    cardMetaText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    cardBody: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    cardBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.hover,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgeText: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
    },
    cardDetails: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    detailText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    exercisesContainer: {
      marginTop: 8,
    },
    exercisesTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 4,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginVertical: 2,
    },
    exerciseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    exerciseText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
      flex: 1,
    },
    actionEdit: {
      backgroundColor: colors.primary,
    },
    actionDelete: {
      backgroundColor: '#EF4444',
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '500',
    },
    footerSpacer: {
      height: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
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
      fontSize: 20,
      fontWeight: 'bold',
    },
    formGroup: {
      marginBottom: 12,
    },
    formLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },
    formInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 15,
    },
    formTextArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    formRow: {
      flexDirection: 'row',
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      marginTop: 8,
      marginBottom: 16,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const fetchTrainings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📡 [Trainings] Buscando em:', `${API_URL}/trainings`);
      
      const response = await fetch(`${API_URL}/trainings`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [Trainings] Carregados:', data.length);
      setTrainings(data);
      setFilteredTrainings(data);
    } catch (error: any) {
      console.error('❌ [Trainings] Erro:', error);
      // Fallback com dados mock
      const mockData = getMockTrainings();
      setTrainings(mockData);
      setFilteredTrainings(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  useEffect(() => {
    let result = trainings;
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }
    setFilteredTrainings(result);
  }, [searchTerm, filterStatus, filterCategory, trainings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainings();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteTraining = async (id: string) => {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/trainings/${id}`, { method: 'DELETE' });
            setTrainings(prev => prev.filter(t => t.id !== id));
            Alert.alert('Sucesso', 'Treino excluído com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o treino');
          }
        },
      },
    ]);
  };

  const createTraining = async () => {
    if (!newTraining.title || !newTraining.date || !newTraining.category) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/trainings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTraining),
      });

      if (response.ok) {
        const training = await response.json();
        setTrainings(prev => [training, ...prev]);
        setShowCreateModal(false);
        setNewTraining({
          title: '',
          description: '',
          category: '',
          duration: '60',
          objective: '',
          date: '',
          time: '',
          exercises: [],
        });
        Alert.alert('Sucesso', 'Treino criado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o treino');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pendente';
      case 'in_progress': return '🔄 Em andamento';
      case 'completed': return '✅ Concluído';
      case 'cancelled': return '❌ Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'in_progress': return 'play-circle-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  const getMockTrainings = (): Training[] => [
    {
      id: '1',
      title: 'Treino de Finalização',
      description: 'Treino focado em finalizações de diversas posições',
      category: 'Sub-12',
      duration: '90',
      objective: 'Melhorar precisão de chutes',
      date: '2024-08-25',
      time: '14:00',
      status: 'pending',
      athlete_count: 12,
      coach_name: 'Carlos Silva',
      exercises: ['Chute com perna direita', 'Chute com perna esquerda', 'Cabeceio'],
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Treino de Passe e Movimentação',
      description: 'Exercícios de passe curto e movimentação sem bola',
      category: 'Sub-14',
      duration: '75',
      objective: 'Melhorar posicionamento em campo',
      date: '2024-08-26',
      time: '15:30',
      status: 'in_progress',
      athlete_count: 15,
      coach_name: 'Ana Paula',
      exercises: ['Passe curto', 'Passe longo', 'Movimentação ofensiva'],
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Treino Físico',
      description: 'Preparação física com exercícios de condicionamento',
      category: 'Sub-16',
      duration: '60',
      objective: 'Melhorar resistência cardiovascular',
      date: '2024-08-24',
      time: '09:00',
      status: 'completed',
      athlete_count: 10,
      coach_name: 'Roberto Santos',
      exercises: ['Corrida', 'Abdominal', 'Flexão', 'Agachamento'],
      created_at: new Date().toISOString(),
    },
  ];

  const categories = Array.from(new Set(trainings.map(t => t.category)));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando treinos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏋️ Treinos</Text>
          <Text style={styles.headerSubtitle}>
            Total: {filteredTrainings.length} treino{filteredTrainings.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar treino..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity style={[styles.filterButton, filterStatus === 'all' && styles.filterActive]} onPress={() => setFilterStatus('all')}>
            <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          {['pending', 'in_progress', 'completed', 'cancelled'].map(status => (
            <TouchableOpacity key={status} style={[styles.filterButton, filterStatus === status && styles.filterActive]} onPress={() => setFilterStatus(status)}>
              <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>{getStatusLabel(status)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
          <TouchableOpacity style={[styles.categoryButton, filterCategory === 'all' && styles.categoryActive]} onPress={() => setFilterCategory('all')}>
            <Text style={[styles.categoryText, filterCategory === 'all' && styles.categoryTextActive]}>Todas</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={[styles.categoryButton, filterCategory === cat && styles.categoryActive]} onPress={() => setFilterCategory(cat)}>
              <Text style={[styles.categoryText, filterCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Icon name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Novo Treino</Text>
        </TouchableOpacity>

        {filteredTrainings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="fitness-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum treino encontrado</Text>
            <Text style={styles.emptySubtitle}>Comece criando seu primeiro treino</Text>
          </View>
        ) : (
          filteredTrainings.map((training) => {
            const isExpanded = expandedId === training.id;
            const statusColor = getStatusColor(training.status);
            const statusIcon = getStatusIcon(training.status);

            return (
              <View key={training.id} style={styles.trainingCard}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(training.id)} activeOpacity={0.7}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{training.title}</Text>
                      <View style={styles.cardMeta}>
                        <Icon name="calendar-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.cardMetaText}>{formatDate(training.date)} • {training.time}</Text>
                      </View>
                    </View>
                  </View>
                  <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.cardBody}>
                  <View style={styles.cardBadges}>
                    <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                      <Icon name={statusIcon} size={14} color={statusColor} />
                      <Text style={[styles.badgeText, { color: statusColor }]}>{getStatusLabel(training.status)}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Icon name="people-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.badgeText}>{training.athlete_count} atletas</Text>
                    </View>
                    <View style={styles.badge}>
                      <Icon name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.badgeText}>{training.duration} min</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDescription} numberOfLines={isExpanded ? undefined : 2}>{training.description}</Text>

                  {isExpanded && (
                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <Icon name="school-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>Categoria: {training.category}</Text>
                      </View>
                      {training.coach_name && (
                        <View style={styles.detailRow}>
                          <Icon name="person-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.detailText}>Técnico: {training.coach_name}</Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Icon name="flag-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText}>Objetivo: {training.objective}</Text>
                      </View>
                      {training.exercises && training.exercises.length > 0 && (
                        <View style={styles.exercisesContainer}>
                          <Text style={styles.exercisesTitle}>💪 Exercícios:</Text>
                          {training.exercises.map((ex, idx) => (
                            <View key={idx} style={styles.exerciseItem}>
                              <View style={styles.exerciseDot} />
                              <Text style={styles.exerciseText}>{ex}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <View style={styles.cardActions}>
                        <TouchableOpacity style={[styles.actionButton, styles.actionEdit]} onPress={() => Alert.alert('Editar', `Editar: ${training.title}`)}>
                          <Icon name="create-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.actionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.actionDelete]} onPress={() => deleteTraining(training.id)}>
                          <Icon name="trash-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.actionText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Modal de criação */}
      <Modal visible={showCreateModal} transparent={true} animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📝 Criar Treino</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="close-outline" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Título *</Text>
                <TextInput 
                  style={styles.formInput} 
                  placeholder="Digite o título" 
                  placeholderTextColor={colors.textSecondary} 
                  value={newTraining.title} 
                  onChangeText={(text) => setNewTraining({ ...newTraining, title: text })} 
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descrição</Text>
                <TextInput 
                  style={[styles.formInput, styles.formTextArea]} 
                  placeholder="Descreva o treino" 
                  placeholderTextColor={colors.textSecondary} 
                  multiline numberOfLines={3} 
                  value={newTraining.description} 
                  onChangeText={(text) => setNewTraining({ ...newTraining, description: text })} 
                />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Categoria *</Text>
                  <TextInput 
                    style={styles.formInput} 
                    placeholder="Ex: Sub-12" 
                    placeholderTextColor={colors.textSecondary} 
                    value={newTraining.category} 
                    onChangeText={(text) => setNewTraining({ ...newTraining, category: text })} 
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Duração (min)</Text>
                  <TextInput 
                    style={styles.formInput} 
                    placeholder="60" 
                    placeholderTextColor={colors.textSecondary} 
                    keyboardType="numeric" 
                    value={newTraining.duration} 
                    onChangeText={(text) => setNewTraining({ ...newTraining, duration: text })} 
                  />
                </View>
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Data *</Text>
                  <TextInput 
                    style={styles.formInput} 
                    placeholder="YYYY-MM-DD" 
                    placeholderTextColor={colors.textSecondary} 
                    value={newTraining.date} 
                    onChangeText={(text) => setNewTraining({ ...newTraining, date: text })} 
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Horário</Text>
                  <TextInput 
                    style={styles.formInput} 
                    placeholder="HH:MM" 
                    placeholderTextColor={colors.textSecondary} 
                    value={newTraining.time} 
                    onChangeText={(text) => setNewTraining({ ...newTraining, time: text })} 
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Objetivo</Text>
                <TextInput 
                  style={styles.formInput} 
                  placeholder="Ex: Melhorar precisão" 
                  placeholderTextColor={colors.textSecondary} 
                  value={newTraining.objective} 
                  onChangeText={(text) => setNewTraining({ ...newTraining, objective: text })} 
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Exercícios (um por linha)</Text>
                <TextInput 
                  style={[styles.formInput, styles.formTextArea]} 
                  placeholder="Chute&#10;Cabeceio" 
                  placeholderTextColor={colors.textSecondary} 
                  multiline numberOfLines={3} 
                  value={newTraining.exercises.join('\n')} 
                  onChangeText={(text) => setNewTraining({ ...newTraining, exercises: text.split('\n').filter(s => s.trim()) })} 
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={createTraining} disabled={creating}>
                {creating ? 
                  <ActivityIndicator size="small" color="#FFFFFF" /> : 
                  <>
                    <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Criar Treino</Text>
                  </>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
