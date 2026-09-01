import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'http://192.168.0.25:8081';

export default function AIScreen() {
  const [category, setCategory] = useState('Sub-12');
  const [duration, setDuration] = useState('1h30');
  const [objective, setObjective] = useState('Posse de bola');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Sub-10', 'Sub-11', 'Sub-12', 'Sub-13', 'Sub-14', 'Sub-15', 'Sub-16', 'Sub-17', 'Sub-20'];
  const durations = ['45min', '1h', '1h15', '1h30', '1h45', '2h'];
  const objectiveExamples = [
    'Posse de bola',
    'Finalização',
    'Passe e movimentação',
    'Transição defesa-ataque',
    'Contra-ataque',
    'Pressão alta',
    'Jogo posicional',
    'Bolas paradas',
  ];

  const generateTraining = async () => {
    if (!objective.trim()) {
      setError('Por favor, descreva o objetivo do treino');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`${API_URL}/ai/generate_training`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          duration,
          objective: objective.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.training) {
        setResult(data.training);
      } else {
        throw new Error('Erro ao gerar treino');
      }
    } catch (err) {
      setError('Erro ao gerar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await Share.share({
        message: result,
        title: 'Plano de Treino',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="brain" size={24} color="#a78bfa" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>IA Treinos</Text>
          <Text style={styles.headerSubtitle}>Pequenos Gigantes</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <View style={styles.field}>
            <View style={styles.fieldLabel}>
              <Icon name="users" size={16} color="#6b7280" />
              <Text style={styles.labelText}>Categoria</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      category === cat && styles.chipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabel}>
              <Icon name="clock" size={16} color="#6b7280" />
              <Text style={styles.labelText}>Duração</Text>
            </View>
            <View style={styles.chipContainer}>
              {durations.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.chip,
                    duration === dur && styles.chipActive,
                  ]}
                  onPress={() => setDuration(dur)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      duration === dur && styles.chipTextActive,
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabel}>
              <Icon name="target" size={16} color="#6b7280" />
              <Text style={styles.labelText}>Objetivo</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ex: Melhorar posse de bola"
              placeholderTextColor="#6b7280"
              value={objective}
              onChangeText={setObjective}
            />
            <View style={styles.exampleContainer}>
              {objectiveExamples.slice(0, 4).map((ex) => (
                <TouchableOpacity
                  key={ex}
                  style={styles.exampleChip}
                  onPress={() => setObjective(ex)}
                >
                  <Text style={styles.exampleText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={generateTraining}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Gerando...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="sparkles" size={20} color="#fff" />
                <Text style={styles.buttonText}>Criar com IA</Text>
              </View>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultHeaderLeft}>
              <Icon name="brain" size={20} color="#a78bfa" />
              <Text style={styles.resultTitle}>Resultado</Text>
            </View>
            {result && (
              <TouchableOpacity onPress={copyToClipboard} style={styles.shareButton}>
                <Icon name="share-2" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.resultContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#a78bfa" />
                <Text style={styles.loadingText}>Criando seu treino...</Text>
              </View>
            ) : result ? (
              <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={true}>
                <Text style={styles.resultText}>{result}</Text>
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="brain" size={48} color="rgba(167, 139, 250, 0.3)" />
                <Text style={styles.emptyTitle}>Seu treino aparecerá aqui</Text>
                <Text style={styles.emptySubtitle}>
                  Configure as opções e clique em "Criar com IA"
                </Text>
              </View>
            )}
          </View>

          {result && (
            <View style={styles.resultFooter}>
              <Text style={styles.resultInfo}>
                📝 {result.split('\n').length} linhas
              </Text>
              <Text style={styles.resultInfo}>
                📊 {result.split(' ').length} palavras
              </Text>
              <Text style={styles.resultInfoPurple}>✨ Gerado por IA</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#22c55e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  chipText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#0D1117',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  exampleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  exampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#21262D',
    marginRight: 6,
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  generateButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  shareButton: {
    padding: 8,
  },
  resultContent: {
    backgroundColor: '#0D1117',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#21262D',
    minHeight: 200,
    maxHeight: 400,
  },
  resultScroll: {
    padding: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  resultFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
  },
  resultInfo: {
    fontSize: 10,
    color: '#6b7280',
    marginRight: 16,
  },
  resultInfoPurple: {
    fontSize: 10,
    color: '#a78bfa',
  },
});
