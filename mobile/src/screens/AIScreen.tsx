import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';

export default function AIScreen() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [formData, setFormData] = useState({
    category: 'Sub-12',
    duration: '60 minutos',
    objective: 'Melhorar condicionamento físico',
  });

  const categories = ['Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'];
  const durations = ['30 minutos', '60 minutos', '90 minutos', '120 minutos'];
  const objectives = [
    'Melhorar condicionamento físico',
    'Desenvolver habilidades técnicas',
    'Aprimorar táticas de jogo',
    'Preparação para competições',
    'Treino recreativo',
  ];

  const generateTraining = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`${API_URL}/ai/generate_training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.text();
      setResponse(data);
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Não foi possível gerar o treino');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 IA RETESP</Text>
        <Text style={styles.headerSubtitle}>Gere treinos personalizados com IA</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.optionsContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.optionButton,
                formData.category === cat && styles.optionButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, category: cat })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.category === cat && styles.optionTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Duração</Text>
        <View style={styles.optionsContainer}>
          {durations.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.optionButton,
                formData.duration === dur && styles.optionButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, duration: dur })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.duration === dur && styles.optionTextActive,
                ]}
              >
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.optionsContainer}>
          {objectives.map((obj) => (
            <TouchableOpacity
              key={obj}
              style={[
                styles.optionButton,
                formData.objective === obj && styles.optionButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, objective: obj })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.objective === obj && styles.optionTextActive,
                ]}
              >
                {obj}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateTraining}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Gerar Treino</Text>
            </>
          )}
        </TouchableOpacity>

        {response && (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseTitle}>📋 Plano de Treino</Text>
              <TouchableOpacity onPress={() => setResponse('')}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.responseScroll}>
              <Text style={styles.responseText}>{response}</Text>
            </ScrollView>
          </View>
        )}
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  optionButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    color: '#6B7280',
    fontSize: 13,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    marginTop: 20,
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 20,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseScroll: {
    maxHeight: 400,
  },
  responseText: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 22,
  },
});
