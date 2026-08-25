import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../services/api';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  birth_date: string;
  medical_form_url: string | null;
}

export default function AthletesScreen() {
  const navigation = useNavigation();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [athleteToDelete, setAthleteToDelete] = useState<string | null>(null);

  const categories = ['all', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18', 'Sub-20'];

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      console.log('📥 Atletas recebidos:', data.length);
      setAthletes(data);
      setFilteredAthletes(data);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAthletes();
    }, [])
  );

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
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedCategory, athletes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthletes();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openDetails = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setModalVisible(true);
  };

  const closeDetails = () => {
    setModalVisible(false);
    setSelectedAthlete(null);
  };

  const navigateToEdit = (id: string) => {
    setModalVisible(false);
    navigation.navigate('EditAthlete', { id });
  };

  const navigateToCreate = () => {
    navigation.navigate('CreateAthlete');
  };

  const confirmDelete = (id: string) => {
    setAthleteToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!athleteToDelete) return;
    try {
      const res = await fetch(`${API_URL}/athletes/${athleteToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        Alert.alert('Sucesso', 'Atleta excluído com sucesso!');
        setDeleteModalVisible(false);
        setAthleteToDelete(null);
        fetchAthletes();
      } else {
        Alert.alert('Erro', 'Não foi possível excluir o atleta');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAvatarUrl = (avatar_url: string | null) => {
    if (!avatar_url) return null;
    // Se já começa com http, retorna direto
    if (avatar_url.startsWith('http')) return avatar_url;
    // Se começa com /, concatena com API_URL
    if (avatar_url.startsWith('/')) return `${API_URL}${avatar_url}`;
    // Caso contrário, adiciona a barra
    return `${API_URL}/${avatar_url}`;
  };

  const renderAthlete = ({ item }: { item: Athlete }) => {
    const isExpanded = expandedId === item.id;
    const age = calculateAge(item.birth_date);
    const avatarUrl = getAvatarUrl(item.avatar_url);

    return (
      <View style={styles.athleteCard}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.athleteAvatar}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                onError={() => console.log('❌ Erro ao carregar imagem:', avatarUrl)}
              />
            ) : (
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>{item.name}</Text>
            <Text style={styles.athleteCategory}>{item.category}</Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Nascimento: {formatDate(item.birth_date)} ({age} anos)
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="pricetag-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>Categoria: {item.category}</Text>
            </View>
            {item.medical_form_url && (
              <View style={styles.detailRow}>
                <Icon name="document-text-outline" size={20} color="#6B7280" />
                <Text style={[styles.detailText, styles.linkText]}>
                  Ficha Médica: Disponível
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => openDetails(item)}
              >
                <Icon name="eye" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Detalhes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonEdit]}
                onPress={() => navigateToEdit(item.id)}
              >
                <Icon name="create" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={() => confirmDelete(item.id)}
              >
                <Icon name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando atletas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Atletas</Text>
        <TouchableOpacity style={styles.createButton} onPress={navigateToCreate}>
          <Icon name="add-circle" size={24} color="#3B82F6" />
          <Text style={styles.createButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item === 'all' ? 'Todas' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredAthletes}
        keyExtractor={(item) => item.id}
        renderItem={renderAthlete}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color="#6B7280" />
            <Text style={styles.emptyText}>Nenhum atleta encontrado</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={navigateToCreate}>
              <Text style={styles.emptyButtonText}>Criar primeiro atleta</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de Detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Atleta</Text>
              <TouchableOpacity onPress={closeDetails}>
                <Icon name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedAthlete && (
              <ScrollView>
                <View style={styles.modalAvatarContainer}>
                  {selectedAthlete.avatar_url ? (
                    <Image
                      source={{ uri: getAvatarUrl(selectedAthlete.avatar_url) }}
                      style={styles.modalAvatar}
                    />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <Text style={styles.modalAvatarText}>
                        {selectedAthlete.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.modalName}>{selectedAthlete.name}</Text>
                <Text style={styles.modalCategory}>{selectedAthlete.category}</Text>

                <View style={styles.modalInfoContainer}>
                  <View style={styles.modalInfoRow}>
                    <Icon name="calendar-outline" size={22} color="#3B82F6" />
                    <View>
                      <Text style={styles.modalInfoLabel}>Data de Nascimento</Text>
                      <Text style={styles.modalInfoValue}>
                        {formatDate(selectedAthlete.birth_date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Icon name="person-outline" size={22} color="#3B82F6" />
                    <View>
                      <Text style={styles.modalInfoLabel}>Idade</Text>
                      <Text style={styles.modalInfoValue}>
                        {calculateAge(selectedAthlete.birth_date)} anos
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Icon name="pricetag-outline" size={22} color="#3B82F6" />
                    <View>
                      <Text style={styles.modalInfoLabel}>Categoria</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedAthlete.category}
                      </Text>
                    </View>
                  </View>

                  {selectedAthlete.medical_form_url && (
                    <View style={styles.modalInfoRow}>
                      <Icon name="document-text-outline" size={22} color="#10B981" />
                      <View>
                        <Text style={styles.modalInfoLabel}>Ficha Médica</Text>
                        <Text style={[styles.modalInfoValue, styles.linkText]}>
                          PDF Disponível
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionEdit]}
                    onPress={() => {
                      closeDetails();
                      navigateToEdit(selectedAthlete.id);
                    }}
                  >
                    <Icon name="create" size={20} color="#FFFFFF" />
                    <Text style={styles.modalActionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalActionDanger]}
                    onPress={() => {
                      closeDetails();
                      confirmDelete(selectedAthlete.id);
                    }}
                  >
                    <Icon name="trash" size={20} color="#FFFFFF" />
                    <Text style={styles.modalActionText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Icon name="alert-circle" size={60} color="#EF4444" />
            <Text style={styles.deleteModalTitle}>Excluir Atleta</Text>
            <Text style={styles.deleteModalText}>
              Tem certeza que deseja excluir este atleta? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancel]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalConfirm]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteModalConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0D1117',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363D',
    gap: 4,
  },
  createButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  athleteCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  athleteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  athleteCategory: {
    color: '#6B7280',
    fontSize: 12,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  linkText: {
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalCategory: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInfoContainer: {
    backgroundColor: '#0D1117',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2128',
  },
  modalInfoLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  modalInfoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionEdit: {
    backgroundColor: '#8B5CF6',
  },
  modalActionDanger: {
    backgroundColor: '#EF4444',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  deleteModalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  deleteModalText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  deleteModalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalConfirm: {
    backgroundColor: '#EF4444',
  },
  deleteModalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
