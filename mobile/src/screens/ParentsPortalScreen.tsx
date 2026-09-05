//mobile/src/screens/ParentsPortalScreen.tsx
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
import { API_URL } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTheme } from '../context/ThemeContext';

const isWeb = Platform.OS === 'web';
const { width, height } = Dimensions.get('window');

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

export default function ParentsPortalScreen() {
  const { colors, isDark } = useTheme();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [summary, setSummary] = useState<AthleteSummary | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMedia, setShowMedia] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Player para o vídeo em exibição
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const player = useVideoPlayer(currentVideoUrl || '', (player) => {
    if (currentVideoUrl) {
      player.play();
    }
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 16,
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
      marginBottom: 20,
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
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 8,
      fontSize: 20,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      paddingVertical: 10,
      fontSize: 15,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    athleteCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    athleteCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    athleteAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    athleteCategory: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    summaryContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    summaryTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    uploadContainer: {
      marginVertical: 16,
    },
    uploadButton: {
      backgroundColor: colors.primary,
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
      color: colors.textSecondary,
      fontSize: 14,
    },
    progressPercent: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
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
    mediaContainer: {
      marginBottom: 20,
    },
    mediaTitle: {
      color: colors.text,
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
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      marginBottom: 8,
      position: 'relative',
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    videoPreviewContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    videoPlayOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    videoPlayIcon: {
      fontSize: 50,
      color: '#FFFFFF',
    },
    videoBadge: {
      position: 'absolute',
      top: 4,
      left: 4,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 2,
    },
    videoBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '500',
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
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    editInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      marginBottom: 12,
    },
    editModalActions: {
      flexDirection: 'row',
      gap: 8,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
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
      backgroundColor: colors.hover,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelEditText: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    noMediaContainer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    noMediaText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    noMediaSubtext: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    closeIcon: {
      fontSize: 30,
      color: '#FFFFFF',
    },
    deleteButtonModal: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 20,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      padding: 12,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    deleteIcon: {
      fontSize: 26,
      color: '#EF4444',
    },
    positionIndicator: {
      position: 'absolute',
      top: 40,
      right: 80,
      zIndex: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    positionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    modalMediaContainer: {
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    fullscreenImage: {
      width: width,
      height: height * 0.8,
      backgroundColor: '#000000',
    },
    fullscreenVideo: {
      width: width,
      height: height * 0.85,
      backgroundColor: '#000000',
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
    navigationDots: {
      position: 'absolute',
      bottom: 100,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      zIndex: 20,
    },
    navDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.3)',
      marginHorizontal: 4,
    },
    navDotActive: {
      backgroundColor: colors.primary,
      width: 12,
      height: 8,
    },
    editIcon: {
      fontSize: 16,
      color: '#FFFFFF',
    },
    deleteIconSmall: {
      fontSize: 16,
      color: '#FFFFFF',
    },
  });

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
        formData.append('file', file.file);
      } else {
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
      await fetchAthleteMedia(selectedAthlete.id);
      
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
                if (modalVisible) {
                  closeModal();
                }
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

  const openMediaModal = (index: number) => {
    setSelectedMediaIndex(index);
    setModalVisible(true);
    // Carregar o vídeo atual
    const item = media[index];
    if (item && (item.media_type === 'video' || item.file_url.match(/\.(mp4|mov|avi|webm)$/i))) {
      setCurrentVideoUrl(`${API_URL}${item.file_url}`);
    } else {
      setCurrentVideoUrl(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentVideoUrl(null);
    player.pause();
    StatusBar.setHidden(false);
  };

  const deleteFromModal = () => {
    const item = media[selectedMediaIndex];
    if (item) {
      const fileName = item.file_url.split('/').pop() || 'arquivo';
      deleteMedia(item.id, fileName);
    }
  };

  const MediaItem = ({ item, index }: { item: Media; index: number }) => {
    const isVideo = item.media_type === 'video' || item.file_url.match(/\.(mp4|mov|avi|webm)$/i);
    const mediaUrl = `${API_URL}${item.file_url}`;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.mediaItem}
        onPress={() => openMediaModal(index)}
        activeOpacity={0.9}
      >
        {isVideo ? (
          <View style={styles.videoPreviewContainer}>
            <Image
              source={{ uri: mediaUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            <View style={styles.videoPlayOverlay}>
              <Text style={styles.videoPlayIcon}>▶️</Text>
            </View>
            <View style={styles.videoBadge}>
              <Text style={{ fontSize: 12, color: '#FFFFFF' }}>🎬</Text>
              <Text style={styles.videoBadgeText}>Vídeo</Text>
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.mediaOverlay}>
          <Text style={styles.mediaDate}>{formatDate(item.uploaded_at)}</Text>
        </View>

        <View style={styles.mediaActions}>
          <TouchableOpacity 
            onPress={() => {
              const fileName = item.file_url.split('/').pop() || 'arquivo';
              setEditingId(item.id);
              setNewName(fileName.replace(/\.[^/.]+$/, ""));
            }}
            style={styles.editButton}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              const fileName = item.file_url.split('/').pop() || 'arquivo';
              deleteMedia(item.id, fileName);
            }}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteIconSmall}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {editingId === item.id && (
          <View style={styles.editModal}>
            <View style={styles.editModalContent}>
              <TextInput 
                style={styles.editInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Novo nome"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
              <View style={styles.editModalActions}>
                <TouchableOpacity 
                  onPress={() => renameMedia(item.id)}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>💾 Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingId(null);
                    setNewName("");
                  }}
                  style={styles.cancelEditButton}
                >
                  <Text style={styles.cancelEditText}>❌ Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderModalItem = ({ item }: { item: Media }) => {
    const isVideo = item.media_type === 'video' || item.file_url.match(/\.(mp4|mov|avi|webm)$/i);
    const mediaUrl = `${API_URL}${item.file_url}`;

    return (
      <View style={styles.modalMediaContainer}>
        {isVideo ? (
          <VideoView
            style={styles.fullscreenVideo}
            player={player}
            contentFit="contain"
            nativeControls={true}
          />
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.videoOverlay}>
          <View style={styles.videoInfoOverlay}>
            <Text style={styles.videoTitleOverlay}>
              {item.athlete_name || 'Mídia'}
            </Text>
            <Text style={styles.videoDateOverlay}>
              {formatDate(item.uploaded_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👨‍👩‍👦 Portal dos Responsáveis</Text>
        <Text style={styles.headerSubtitle}>Acompanhe o desempenho do seu filho</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar atleta..."
          placeholderTextColor={colors.textSecondary}
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
            <Text style={{ fontSize: 24, color: '#10B981' }}>✅</Text>
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
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
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
            <>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Text style={{ fontSize: 24 }}>☁️</Text>
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
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleMobileFileSelect}
              disabled={uploading}
            >
              <Text style={{ fontSize: 24 }}>☁️</Text>
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
            renderItem={({ item, index }) => <MediaItem item={item} index={index} />}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.mediaGrid}
          />
        </View>
      )}

      {showMedia && media.length === 0 && (
        <View style={styles.noMediaContainer}>
          <Text style={{ fontSize: 40, color: colors.textSecondary }}>🖼️</Text>
          <Text style={styles.noMediaText}>Nenhuma mídia encontrada para este atleta</Text>
          <Text style={styles.noMediaSubtext}>Clique em "Fazer Upload" para adicionar</Text>
        </View>
      )}

      {/* Modal de Visualização */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <StatusBar hidden={true} />
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeModal}
          >
            <Text style={styles.closeIcon}>❌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButtonModal}
            onPress={deleteFromModal}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>

          <View style={styles.positionIndicator}>
            <Text style={styles.positionText}>
              {selectedMediaIndex + 1} / {media.length}
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={media}
            keyExtractor={(item) => item.id}
            renderItem={renderModalItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            snapToAlignment="start"
            decelerationRate="fast"
            initialScrollIndex={selectedMediaIndex}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              if (index !== selectedMediaIndex) {
                // Pausar vídeo atual e carregar novo
                if (media[index] && (media[index].media_type === 'video' || media[index].file_url.match(/\.(mp4|mov|avi|webm)$/i))) {
                  setCurrentVideoUrl(`${API_URL}${media[index].file_url}`);
                } else {
                  setCurrentVideoUrl(null);
                }
                setSelectedMediaIndex(index);
              }
            }}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

          <View style={styles.navigationDots}>
            {media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.navDot,
                  index === selectedMediaIndex && styles.navDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}