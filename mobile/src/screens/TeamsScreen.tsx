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

interface Team {
  id: string;
  name: string;
  category: string;
}

export default function TeamsScreen() {
  const { colors, isDark } = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', category: '' });

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
    teamCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    teamInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    teamIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    teamIconText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    teamName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    teamCategory: {
      color: colors.textSecondary,
      fontSize: 12,
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

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/teams`);
      const data = await res.json();
      setTeams(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  const createTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.category.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Turma criada com sucesso!');
        setModalVisible(false);
        setNewTeam({ name: '', category: '' });
        fetchTeams();
      } else {
        Alert.alert('Erro', 'Não foi possível criar a turma');
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
        <Text style={styles.loadingText}>Carregando turmas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏫 Turmas</Text>
        <Text style={styles.headerSubtitle}>{teams.length} turmas cadastradas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nova Turma</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {teams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="business-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma turma cadastrada</Text>
          </View>
        ) : (
          teams.map((team) => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamInfo}>
                <View style={styles.teamIcon}>
                  <Text style={styles.teamIconText}>
                    {team.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamCategory}>{team.category}</Text>
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
              <Text style={styles.modalTitle}>Nova Turma</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome da turma"
              placeholderTextColor={colors.textSecondary}
              value={newTeam.name}
              onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Categoria (Ex: Sub-12)"
              placeholderTextColor={colors.textSecondary}
              value={newTeam.category}
              onChangeText={(text) => setNewTeam({ ...newTeam, category: text })}
            />

            <TouchableOpacity style={styles.createButton} onPress={createTeam}>
              <Text style={styles.createButtonText}>Criar Turma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
