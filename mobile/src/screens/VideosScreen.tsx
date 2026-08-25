// frontend/mobile/src/screens/VideosScreen.tsx
// frontend/mobile/src/screens/VideosScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
  Alert,
  TextInput,
  Platform,
  SafeAreaView,
  Animated,
  Share,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

// Configuração da API
const API_URL = 'http://localhost:8081';

const isWeb = Platform.OS === 'web';
const { width, height } = Dimensions.get('window');

interface VideoItem {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
  athlete_id?: string;
}

interface Comment {
  id: string;
  user_name: string;
  text: string;
  created_at: string;
  likes: number;
}

interface VideoStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
}

export default function VideosScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  
  // Estados do player
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Estados sociais
  const [videoStats, setVideoStats] = useState<Record<string, VideoStats>>({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [isLiking, setIsLiking] = useState(false);

  // Animações
  const heartScale = useRef(new Animated.Value(0)).current;

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/media/videos`);
      const data = await res.json();
      setVideos(data || []);
      
      // Inicializar stats para cada vídeo
      const initialStats: Record<string, VideoStats> = {};
      data.forEach((video: VideoItem) => {
        initialStats[video.id] = {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 1,
          views: Math.floor(Math.random() * 5000) + 200,
          isLiked: false,
          isSaved: false,
        };
      });
      setVideoStats(initialStats);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes`);
      const data = await res.json();
      setAthletes(data || []);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchAthletes();
    if (!isWeb) {
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar vídeos');
        }
      })();
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // ========== FUNÇÕES SOCIAIS ==========
  
  const handleLike = async (videoId: string) => {
    if (isLiking) return;
    setIsLiking(true);

    const currentStats = videoStats[videoId];
    if (!currentStats) return;

    // Animar coração
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.5,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(heartScale, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();

    // Atualizar estado local
    const updatedStats = {
      ...currentStats,
      likes: currentStats.isLiked ? currentStats.likes - 1 : currentStats.likes + 1,
      isLiked: !currentStats.isLiked,
    };
    setVideoStats({
      ...videoStats,
      [videoId]: updatedStats,
    });

    try {
      await fetch(`${API_URL}/media/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: updatedStats.isLiked }),
      });
    } catch (error) {
      console.error('Erro ao curtir:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async (videoId: string) => {
    setSelectedVideoId(videoId);
    setShowComments(true);
    
    // Comentários mockados
    const mockComments: Comment[] = [
      {
        id: '1',
        user_name: 'João Silva',
        text: 'Excelente treino! 👏',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes: 12,
      },
      {
        id: '2',
        user_name: 'Maria Santos',
        text: 'Que evolução incrível! 🚀',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes: 8,
      },
      {
        id: '3',
        user_name: 'Pedro Oliveira',
        text: 'Parabéns pelo desempenho!',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        likes: 5,
      },
    ];
    setComments(mockComments);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user_name: 'Você',
      text: commentText.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    Keyboard.dismiss();

    const currentStats = videoStats[selectedVideoId];
    if (currentStats) {
      setVideoStats({
        ...videoStats,
        [selectedVideoId]: {
          ...currentStats,
          comments: currentStats.comments + 1,
        },
      });
    }
  };

  const handleShare = async (video: VideoItem) => {
    try {
      const result = await Share.share({
        message: `🎥 Assista este vídeo incrível de ${video.athlete_name || 'atleta'}!\n\n${API_URL}${video.file_url}\n\n#RETESP4Linhas #Esporte`,
        title: video.athlete_name || 'Vídeo RETESP',
      });

      if (result.action === Share.sharedAction) {
        const currentStats = videoStats[video.id];
        if (currentStats) {
          setVideoStats({
            ...videoStats,
            [video.id]: {
              ...currentStats,
              shares: currentStats.shares + 1,
            },
          });
        }
        Alert.alert('Sucesso', 'Vídeo compartilhado!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar');
    }
  };

  const handleSave = (videoId: string) => {
    const currentStats = videoStats[videoId];
    if (!currentStats) return;

    setVideoStats({
      ...videoStats,
      [videoId]: {
        ...currentStats,
        isSaved: !currentStats.isSaved,
      },
    });

    Alert.alert(
      currentStats.isSaved ? 'Removido' : 'Salvo',
      currentStats.isSaved 
        ? 'Vídeo removido dos favoritos' 
        : 'Vídeo adicionado aos favoritos!'
    );
  };

  // ========== COMPONENTES ==========

  const ActionButtons = ({ video }: { video: VideoItem }) => {
    const stats = videoStats[video.id] || { 
      likes: 0, comments: 0, shares: 0, views: 0, isLiked: false, isSaved: false 
    };

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {video.athlete_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(video.id)}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Icon 
              name={stats.isLiked ? 'heart' : 'heart-outline'} 
              size={32} 
              color={stats.isLiked ? '#EF4444' : '#FFFFFF'} 
            />
          </Animated.View>
          <Text style={styles.actionText}>{formatNumber(stats.likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => loadComments(video.id)}
        >
          <Icon name="chatbubble-outline" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(stats.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleShare(video)}
        >
          <Icon name="share-social-outline" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(stats.shares)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleSave(video.id)}
        >
          <Icon 
            name={stats.isSaved ? 'bookmark' : 'bookmark-outline'} 
            size={28} 
            color={stats.isSaved ? '#3B82F6' : '#FFFFFF'} 
          />
          <Text style={styles.actionText}>
            {stats.isSaved ? 'Salvo' : 'Salvar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <Icon name="eye-outline" size={24} color="#9CA3AF" />
          <Text style={[styles.actionText, { color: '#9CA3AF' }]}>
            {formatNumber(stats.views)}
          </Text>
        </View>
      </View>
    );
  };

  const VideoPlayer = ({ video, index }: { video: VideoItem; index: number }) => {
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef<any>(null);

    const handleTap = () => {
      setShowControls(true);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (isWeb) {
      return (
        <View style={styles.videoContainer}>
          <video
            src={`${API_URL}${video.file_url}`}
            style={styles.fullscreenVideo as any}
            controls
            autoPlay
            loop
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullscreenPlayer(false)}
          >
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ActionButtons video={video} />
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoTouchArea} 
          onPress={handleTap}
          activeOpacity={1}
        >
          <View style={styles.videoPlaceholder}>
            <Icon name="videocam" size={50} color="#6B7280" />
            <Text style={styles.videoPlaceholderText}>
              {video.athlete_name || 'Vídeo'}
            </Text>
            <Text style={styles.videoPlaceholderSubtext}>
              Toque para play/pause
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowFullscreenPlayer(false)}
        >
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <ActionButtons video={video} />

        <View style={styles.videoInfoBottom}>
          <Text style={styles.videoTitle}>
            {video.athlete_name || 'Vídeo'}
          </Text>
          <Text style={styles.videoDescription}>
            {videoDescription || '🏆 Treino e evolução'}
          </Text>
          <View style={styles.videoTags}>
            <Text style={styles.tag}>#RETESP</Text>
            <Text style={styles.tag}>#Esporte</Text>
            <Text style={styles.tag}>#Treino</Text>
          </View>
          <Text style={styles.videoDate}>
            {formatDate(video.uploaded_at)}
          </Text>
        </View>

        <View style={styles.navigationIndicator}>
          {videos.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.navDot,
                i === index && styles.navDotActive,
              ]} 
            />
          ))}
        </View>

        {showControls && (
          <View style={styles.swipeHint}>
            <Icon name="chevron-up" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.swipeHintText}>Deslize</Text>
            <Icon name="chevron-down" size={16} color="rgba(255,255,255,0.5)" />
          </View>
        )}
      </View>
    );
  };

  const CommentsModal = () => (
    <Modal
      visible={showComments}
      transparent
      animationType="slide"
      onRequestClose={() => setShowComments(false)}
    >
      <SafeAreaView style={styles.commentsContainer}>
        <View style={styles.commentsHeader}>
          <TouchableOpacity onPress={() => setShowComments(false)}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.commentsTitle}>Comentários</Text>
          <Text style={styles.commentsCount}>
            {comments.length}
          </Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {item.user_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>{item.user_name}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity>
                    <Icon name="heart-outline" size={14} color="#6B7280" />
                  </TouchableOpacity>
                  <Text style={styles.commentLikes}>{item.likes}</Text>
                  <TouchableOpacity>
                    <Text style={styles.commentReply}>Responder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.commentsList}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentInputContainer}
        >
          <TextInput
            style={styles.commentInput}
            placeholder="Adicione um comentário..."
            placeholderTextColor="#6B7280"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.commentSendButton,
              !commentText.trim() && styles.commentSendButtonDisabled,
            ]}
            onPress={addComment}
            disabled={!commentText.trim()}
          >
            <Icon name="send" size={20} color={commentText.trim() ? '#3B82F6' : '#4B5563'} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => {
    if (showFullscreenPlayer) return null;

    const stats = videoStats[item.id] || { 
      likes: 0, comments: 0, shares: 0, views: 0, isLiked: false, isSaved: false 
    };

    return (
      <TouchableOpacity
        style={styles.videoCard}
        onPress={() => {
          setCurrentIndex(index);
          setShowFullscreenPlayer(true);
        }}
        activeOpacity={0.9}
      >
        <View style={styles.videoThumbnail}>
          <Icon name="play-circle" size={48} color="#3B82F6" />
          
          <View style={styles.thumbnailStats}>
            <View style={styles.thumbnailStat}>
              <Icon name="eye-outline" size={12} color="#FFFFFF" />
              <Text style={styles.thumbnailStatText}>
                {formatNumber(stats.views)}
              </Text>
            </View>
            <View style={styles.thumbnailStat}>
              <Icon name="heart-outline" size={12} color="#FFFFFF" />
              <Text style={styles.thumbnailStatText}>
                {formatNumber(stats.likes)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoName} numberOfLines={1}>
            {item.athlete_name || 'Vídeo'}
          </Text>
          <Text style={styles.videoDate}>{formatDate(item.uploaded_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ========== HANDLERS ==========
  const handleSelectVideo = async () => {
    try {
      if (isWeb) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedFile({
              name: file.name,
              size: file.size,
              type: file.type,
              uri: URL.createObjectURL(file),
              file: file,
            });
            setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setSelectedFile({
            uri: asset.uri,
            name: asset.fileName || 'video.mp4',
            type: asset.mimeType || 'video/mp4',
            size: asset.fileSize || 0,
          });
          setVideoTitle(asset.fileName?.replace(/\.[^/.]+$/, '') || 'Vídeo');
          Alert.alert('Sucesso', 'Vídeo selecionado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar vídeo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o vídeo');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Erro', 'Selecione um vídeo primeiro');
      return;
    }

    if (!selectedAthleteId) {
      Alert.alert('Erro', 'Selecione um atleta');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (isWeb && selectedFile.file) {
        formData.append('file', selectedFile.file);
      } else {
        const fileData = {
          uri: selectedFile.uri,
          type: selectedFile.type || 'video/mp4',
          name: selectedFile.name || 'video.mp4',
        };
        formData.append('file', fileData as any);
      }
      
      formData.append('athlete_id', selectedAthleteId);

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
      
      Alert.alert('Sucesso', 'Vídeo enviado com sucesso!');
      
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedAthleteId('');
      setVideoTitle('');
      setVideoDescription('');
      setUploadProgress(0);
      fetchVideos();
      
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Não foi possível enviar o vídeo');
      setUploading(false);
    }
  };

  // ========== RENDER PRINCIPAL ==========
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando vídeos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🎥 Central de Vídeos</Text>
            <Text style={styles.headerSubtitle}>
              {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'} disponíveis
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="videocam-outline" size={60} color="#6B7280" />
            <Text style={styles.emptyText}>Nenhum vídeo encontrado</Text>
            <Text style={styles.emptySubtext}>Toque no botão + para adicionar</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Text style={styles.emptyButtonText}>Adicionar Vídeo</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {/* Modal de Upload */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                <Icon name="videocam" size={20} color="#3B82F6" /> Novo Vídeo
              </Text>
              <TouchableOpacity
                onPress={() => setShowUploadModal(false)}
                style={styles.closeModalButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Atleta *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    if (athletes.length === 0) {
                      Alert.alert('Aviso', 'Nenhum atleta cadastrado');
                      return;
                    }
                    Alert.alert(
                      'Selecionar Atleta',
                      '',
                      athletes.map((athlete: any) => ({
                        text: `${athlete.name} - ${athlete.category}`,
                        onPress: () => setSelectedAthleteId(athlete.id),
                      })),
                    );
                  }}
                >
                  <Text style={selectedAthleteId ? styles.selectText : styles.selectPlaceholder}>
                    {selectedAthleteId 
                      ? athletes.find((a: any) => a.id === selectedAthleteId)?.name || 'Selecionar'
                      : 'Selecione um atleta'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Título (opcional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Treino de finalização"
                  placeholderTextColor="#6B7280"
                  value={videoTitle}
                  onChangeText={setVideoTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Adicione uma descrição..."
                  placeholderTextColor="#6B7280"
                  value={videoDescription}
                  onChangeText={setVideoDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Arquivo de Vídeo *</Text>
                <TouchableOpacity
                  style={styles.filePicker}
                  onPress={handleSelectVideo}
                >
                  {selectedFile ? (
                    <View style={styles.fileSelected}>
                      <Icon name="checkmark-circle" size={24} color="#22C55E" />
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.filePickerContent}>
                      <Icon name="cloud-upload-outline" size={40} color="#6B7280" />
                      <Text style={styles.filePickerText}>Selecionar Vídeo</Text>
                      <Text style={styles.filePickerSubtext}>MP4, WebM, AVI • Máx. 500MB</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Enviando...</Text>
                    <Text style={styles.progressPercent}>{uploadProgress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
                    />
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.uploadButton,
                    (!selectedFile || !selectedAthleteId || uploading) && styles.uploadButtonDisabled,
                  ]}
                  onPress={handleUpload}
                  disabled={!selectedFile || !selectedAthleteId || uploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Enviando...' : 'Enviar Vídeo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Comentários */}
      <CommentsModal />

      {/* Player Fullscreen */}
      {showFullscreenPlayer && (
        <Modal
          visible={showFullscreenPlayer}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowFullscreenPlayer(false)}
        >
          <SafeAreaView style={styles.fullscreenContainer}>
            <FlatList
              ref={flatListRef}
              data={videos}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.fullscreenItem}>
                  <VideoPlayer video={item} index={index} />
                </View>
              )}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              snapToInterval={height}
              snapToAlignment="start"
              decelerationRate="fast"
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.y / height);
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                }
              }}
              scrollEventThrottle={16}
              getItemLayout={(data, index) => ({
                length: height,
                offset: height * index,
                index,
              })}
              initialScrollIndex={currentIndex}
              onScrollToIndexFailed={() => {}}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
    backgroundColor: '#0D1117',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  videoCard: {
    width: (width - 32) / 2,
    backgroundColor: '#161B22',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailStats: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  thumbnailStatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 10,
  },
  videoName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  videoDate: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenItem: {
    height: height,
    width: width,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoTouchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161B22',
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
  fullscreenVideo: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoInfoBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    zIndex: 10,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  videoTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  videoDate: {
    color: '#6B7280',
    fontSize: 11,
  },
  navigationIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -50 }],
    gap: 6,
    zIndex: 10,
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  navDotActive: {
    backgroundColor: '#3B82F6',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  swipeHint: {
    position: 'absolute',
    right: 8,
    bottom: 100,
    alignItems: 'center',
    opacity: 0.5,
    zIndex: 10,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginVertical: 2,
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: '#161B22',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
    gap: 12,
  },
  commentsTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsCount: {
    color: '#6B7280',
    fontSize: 14,
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentUserName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    color: '#6B7280',
    fontSize: 11,
  },
  commentText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentLikes: {
    color: '#6B7280',
    fontSize: 12,
  },
  commentReply: {
    color: '#6B7280',
    fontSize: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363D',
    backgroundColor: '#0D1117',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
  },
  commentSendButton: {
    padding: 8,
  },
  commentSendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161B22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    padding: 12,
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectPlaceholder: {
    color: '#6B7280',
    fontSize: 16,
  },
  formInput: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  filePicker: {
    backgroundColor: '#0D1117',
    borderWidth: 2,
    borderColor: '#30363D',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  filePickerContent: {
    alignItems: 'center',
  },
  filePickerText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
  filePickerSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  fileSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  fileSize: {
    color: '#6B7280',
    fontSize: 12,
  },
  progressContainer: {
    marginVertical: 16,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#21262D',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
  },
  uploadButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});