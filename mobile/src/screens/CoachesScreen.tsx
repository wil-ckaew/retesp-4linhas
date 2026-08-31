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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface Coach {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export default function CoachesScreen() {
  const { colors, isDark } = useTheme();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCoach, setNewCoach] = useState({ name: '', email: '', specialization: '' });

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
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 8,
      alignSelf: 'flex-start',
      gap: 4,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    listContainer: {
      flex: 1,
      padding: 16,
    },
    coachCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    coachInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    coachIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
    },
    coachIconText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    coachDetails: {
      flex: 1,
    },
    coachName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    coachEmail: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    coachSpecialization: {
      color: '#8B5CF6',
      fontSize: 12,
      marginTop: 2,
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
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400,
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
      fontSize: 18,
      fontWeight: 'bold',
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    createButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    createButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });

  const fetchCoaches = async () => {
    try {
      const res = await fetch(`${API_URL}/coaches`);
      const data = await res.json();
      setCoaches(data || []);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoaches();
  };

  const createCoach = async () => {
    if (!newCoach.name.trim() || !newCoach.email.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoach),
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
        setModalVisible(false);
        setNewCoach({ name: '', email: '', specialization: '' });
        fetchCoaches();
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o professor');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Erro de comunicação');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando professores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👨‍🏫 Professores</Text>
        <Text style={styles.headerSubtitle}>{coaches.length} professores cadastrados</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Novo Professor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {coaches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum professor cadastrado</Text>
          </View>
        ) : (
          coaches.map((coach) => (
            <View key={coach.id} style={styles.coachCard}>
              <View style={styles.coachInfo}>
                <View style={styles.coachIcon}>
                  <Text style={styles.coachIconText}>
                    {coach.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.coachDetails}>
                  <Text style={styles.coachName}>{coach.name}</Text>
                  <Text style={styles.coachEmail}>{coach.email}</Text>
                  {coach.specialization && (
                    <Text style={styles.coachSpecialization}>
                      🏷️ {coach.specialization}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Professor</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={colors.textSecondary}
              value={newCoach.name}
              onChangeText={(text) => setNewCoach({ ...newCoach, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={newCoach.email}
              onChangeText={(text) => setNewCoach({ ...newCoach, email: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Especialização (opcional)"
              placeholderTextColor={colors.textSecondary}
              value={newCoach.specialization}
              onChangeText={(text) => setNewCoach({ ...newCoach, specialization: text })}
            />

            <TouchableOpacity style={styles.createButton} onPress={createCoach}>
              <Text style={styles.createButtonText}>Cadastrar Professor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
