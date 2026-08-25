// frontend/mobile/src/screens/ParentsPortalScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

// Verificar se está na web
const isWeb = Platform.OS === 'web';

interface Athlete {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  birth_date: string;
}

interface AthleteSummary {
  id: string;
  name: string;
  category: string;
  avatar_url: string | null;
  frequency: number;
  evolution: string;
}

interface Media {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
}

const { width, height } = Dimensions.get('window');

export default function ParentsPortalScreen() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [summary, setSummary] = useState<AthleteSummary | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMedia, setShowMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes?_t=` + Date.now());
      const data = await res.json();
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
    if (!isWeb) {
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar mídias');
        }
      })();
    }
  }, []);

  const fetchAthleteSummary = async (athleteId: string) => {
    try {
      const res = await fetch(`${API_URL}/parents/summary/${athleteId}?_t=` + Date.now());
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  const fetchAthleteMedia = async (athleteId: string) => {
    try {
      const res = await fetch(`${API_URL}/parents/media/${athleteId}?_t=` + Date.now());
      const data = await res.json();
      setMedia(data || []);
      setShowMedia(true);
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAthletes();
  };

  const selectAthlete = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setShowMedia(false);
    setLoading(true);
    await Promise.all([
      fetchAthleteSummary(athlete.id),
      fetchAthleteMedia(athlete.id),
    ]);
    setLoading(false);
  };

  // Função para selecionar arquivo - Web
  const handleWebFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileData = {
      uri: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
    };
    handleUpload(fileData);
  };

  // Função para selecionar arquivo - Mobile
  const handleMobileFileSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileData = {
          uri: asset.uri,
          name: asset.fileName || 'arquivo.jpg',
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
        };
        await handleUpload(fileData);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  // Função principal de upload
  const handleUpload = async (file: any) => {
    if (!selectedAthlete) {
      Alert.alert('Erro', 'Selecione um atleta primeiro');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (isWeb && file.file) {
        // Para web
        formData.append('file', file.file);
      } else {
        // Para mobile
        const fileData = {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || 'arquivo.jpg',
        };
        formData.append('file', fileData as any);
      }
      
      formData.append('athlete_id', selectedAthlete.id);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Erro de conexão'));
        xhr.open('POST', `${API_URL}/upload`);
        xhr.send(formData);
      });

      await uploadPromise;
      
      Alert.alert('Sucesso', 'Arquivo enviado com sucesso!');
      
      // Recarregar lista
      await fetchAthleteMedia(selectedAthlete.id);
      
      // Limpar input file web
      if (isWeb && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar o arquivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Função para excluir mídia
  const deleteMedia = async (id: string, fileName: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o arquivo "${fileName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/media/${id}`, { method: 'DELETE' });
              if (res.ok) {
                Alert.alert('Sucesso', 'Arquivo excluído com sucesso!');
                if (selectedAthlete) {
                  await fetchAthleteMedia(selectedAthlete.id);
                }
              } else {
                const errorText = await res.text();
                Alert.alert('Erro', `Não foi possível excluir: ${errorText}`);
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Erro de comunicação');
            }
          },
        },
      ]
    );
  };

  // Função para renomear mídia
  const renameMedia = async (id: string) => {
    if (!newName.trim()) {
      Alert.alert('Erro', 'Digite um novo nome');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newName }),
      });
      
      if (res.ok) {
        Alert.alert('Sucesso', 'Arquivo renomeado com sucesso!');
        setEditingId(null);
        setNewName('');
        if (selectedAthlete) {
          await fetchAthleteMedia(selectedAthlete.id);
        }
      } else {
        const errorText = await res.text();
        Alert.alert('Erro', `Não foi possível renomear: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro de comunicação');
    }
  };

  const filteredAthletes = athletes.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderMediaItem = ({ item }: { item: Media }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => {
        setSelectedMedia(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      {item.media_type === 'photo' ? (
        <Image
          source={{ uri: `${API_URL}${item.file_url}` }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Icon name="play-circle" size={32} color="#3B82F6" />
          <Text style={styles.videoText}>Vídeo</Text>
        </View>
      )}
      
      <View style={styles.mediaOverlay}>
        <Text style={styles.mediaDate}>{formatDate(item.uploaded_at)}</Text>
      </View>

      {/* Botões de Editar e Excluir */}
      <View style={styles.mediaActions}>
        <TouchableOpacity 
          onPress={() => {
            const fileName = item.file_url.split('/').pop() || 'arquivo';
            setEditingId(item.id);
            setNewName(fileName.replace(/\.[^/.]+$/, ""));
          }}
          style={styles.editButton}
        >
          <Icon name="create-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            const fileName = item.file_url.split('/').pop() || 'arquivo';
            deleteMedia(item.id, fileName);
          }}
          style={styles.deleteButton}
        >
          <Icon name="trash-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Modal de Renomear */}
      {editingId === item.id && (
        <View style={styles.editModal}>
          <View style={styles.editModalContent}>
            <TextInput 
              style={styles.editInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Novo nome"
              placeholderTextColor="#6B7280"
              autoFocus
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity 
                onPress={() => renameMedia(item.id)}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setEditingId(null);
                  setNewName("");
                }}
                style={styles.cancelEditButton}
              >
                <Text style={styles.cancelEditText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👨‍👩‍👦 Portal dos Responsáveis</Text>
        <Text style={styles.headerSubtitle}>Acompanhe o desempenho do seu filho</Text>
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
      </View>

      <Text style={styles.sectionTitle}>👥 Selecione um atleta</Text>
      {filteredAthletes.map((athlete) => (
        <TouchableOpacity
          key={athlete.id}
          style={[
            styles.athleteCard,
            selectedAthlete?.id === athlete.id && styles.athleteCardSelected,
          ]}
          onPress={() => selectAthlete(athlete)}
        >
          <View style={styles.athleteAvatar}>
            {athlete.avatar_url ? (
              <Image
                source={{ uri: `${API_URL}${athlete.avatar_url}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {athlete.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>{athlete.name}</Text>
            <Text style={styles.athleteCategory}>{athlete.category}</Text>
          </View>
          {selectedAthlete?.id === athlete.id && (
            <Icon name="checkmark-circle" size={24} color="#10B981" />
          )}
        </TouchableOpacity>
      ))}

      {summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📊 Resumo do Atleta</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>👤 Nome</Text>
              <Text style={styles.summaryValue}>{summary.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>🏷️ Categoria</Text>
              <Text style={styles.summaryValue}>{summary.category}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>📊 Frequência</Text>
              <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>
                {summary.frequency.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>🏅 Evolução</Text>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                {summary.evolution}
              </Text>
            </View>
          </View>
        </View>
      )}

      {selectedAthlete && (
        <View style={styles.uploadContainer}>
          {isWeb ? (
            // Upload para Web
            <>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Icon name="cloud-upload-outline" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Enviando...' : '📤 Fazer Upload'}
                </Text>
              </TouchableOpacity>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleWebFileSelect}
                style={{ display: 'none' }}
              />
            </>
          ) : (
            // Upload para Mobile
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleMobileFileSelect}
              disabled={uploading}
            >
              <Icon name="cloud-upload-outline" size={24} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Enviando...' : '📤 Fazer Upload'}
              </Text>
            </TouchableOpacity>
          )}
          
          {uploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Enviando...</Text>
                <Text style={styles.progressPercent}>{uploadProgress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          )}
        </View>
      )}

      {showMedia && media.length > 0 && (
        <View style={styles.mediaContainer}>
          <Text style={styles.mediaTitle}>🖼️ Fotos e Vídeos</Text>
          <FlatList
            data={media}
            keyExtractor={(item) => item.id}
            renderItem={renderMediaItem}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.mediaGrid}
          />
        </View>
      )}

      {showMedia && media.length === 0 && (
        <View style={styles.noMediaContainer}>
          <Icon name="images-outline" size={40} color="#6B7280" />
          <Text style={styles.noMediaText}>Nenhuma mídia encontrada para este atleta</Text>
          <Text style={styles.noMediaSubtext}>Clique em "Fazer Upload" para adicionar</Text>
        </View>
      )}

      {/* Modal de Visualização */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          StatusBar.setHidden(false);
        }}
        statusBarTranslucent={true}
      >
        <StatusBar hidden={true} />
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              StatusBar.setHidden(false);
            }}
          >
            <Icon name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          {selectedMedia && (
            <View style={styles.videoWrapper}>
              {selectedMedia.media_type === 'photo' ? (
                <Image
                  source={{ uri: `${API_URL}${selectedMedia.file_url}` }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.videoContainer}>
                  <Icon name="videocam" size={50} color="#6B7280" />
                  <Text style={styles.videoPlaceholderText}>Vídeo: {selectedMedia.athlete_name}</Text>
                  <Text style={styles.videoPlaceholderSubtext}>Toque para reproduzir</Text>
                </View>
              )}
              
              <View style={styles.videoOverlay}>
                <View style={styles.videoInfoOverlay}>
                  <Text style={styles.videoTitleOverlay}>
                    {selectedMedia.athlete_name || 'Mídia'}
                  </Text>
                  <Text style={styles.videoDateOverlay}>
                    {formatDate(selectedMedia.uploaded_at)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 16,
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  athleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  athleteCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
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
  summaryContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadContainer: {
    marginVertical: 16,
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  progressPercent: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#30363D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  mediaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mediaGrid: {
    paddingBottom: 8,
  },
  mediaItem: {
    width: (width - 48) / 3,
    aspectRatio: 1,
    backgroundColor: '#161B22',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363D',
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
  },
  mediaDate: {
    color: '#D1D5DB',
    fontSize: 9,
    textAlign: 'center',
  },
  mediaActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    padding: 4,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    padding: 4,
    borderRadius: 12,
  },
  editModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  editModalContent: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  editInput: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: '#21262D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelEditText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  noMediaContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noMediaText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  noMediaSubtext: {
    color: '#4B5563',
    fontSize: 12,
    marginTop: 4,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  videoWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.8,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: width,
    height: height * 0.8,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
  videoPlaceholderSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoInfoOverlay: {
    flex: 1,
  },
  videoTitleOverlay: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoDateOverlay: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});