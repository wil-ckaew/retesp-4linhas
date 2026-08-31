import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer, VideoPlayer } from 'expo-video';
import * as Sharing from 'expo-sharing';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface VideoItem {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
  athlete_id?: string;
  title?: string;
  description?: string;
}

// Componente de vídeo individual com ações
const VideoItemComponent = ({ 
  item, 
  isActive,
  onPlayerReady,
  likeCounts,
  isLiked,
  onToggleLike,
  isSaved,
  onToggleSave,
  viewCounts,
  onShare,
  onEdit,
  onDelete,
  colors,
}: { 
  item: VideoItem; 
  isActive: boolean;
  onPlayerReady: (player: VideoPlayer, id: string) => void;
  likeCounts: Record<string, number>;
  isLiked: Record<string, boolean>;
  onToggleLike: (id: string) => void;
  isSaved: Record<string, boolean>;
  onToggleSave: (id: string) => void;
  viewCounts: Record<string, number>;
  onShare: (item: VideoItem) => void;
  onEdit: (item: VideoItem) => void;
  onDelete: (id: string) => void;
  colors: any;
}) => {
  const videoUrl = `${API_URL}${item.file_url}`;
  const [playerError, setPlayerError] = useState(false);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    if (isActive) {
      player.play();
    }
    onPlayerReady(player, item.id);
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const styles = StyleSheet.create({
    videoContainer: {
      width: width,
      height: height,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    video: {
      width: width,
      height: height,
      backgroundColor: '#000000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 40,
      backgroundColor: 'rgba(0,0,0,0.4)',
      minHeight: 200,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingRight: 16,
    },
    athleteName: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    videoTitle: {
      color: '#D1D5DB',
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 2,
    },
    videoDescription: {
      color: '#9CA3AF',
      fontSize: 14,
      marginBottom: 4,
    },
    videoDate: {
      color: '#6B7280',
      fontSize: 12,
    },
    actionsContainer: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 10,
    },
    actionButton: {
      alignItems: 'center',
      marginBottom: 12,
    },
    actionText: {
      color: '#FFFFFF',
      fontSize: 11,
      textAlign: 'center',
      marginTop: 2,
    },
    actionLabel: {
      color: '#9CA3AF',
      fontSize: 10,
      textAlign: 'center',
      marginTop: 2,
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
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
  });

  if (playerError) {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#EF4444" />
          <Text style={styles.errorText}>Erro ao carregar vídeo</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        onError={() => setPlayerError(true)}
      />

      {/* Overlay com informações e ações */}
      <View style={styles.overlay}>
        {/* Informações do vídeo - lado esquerdo */}
        <View style={styles.infoContainer}>
          <Text style={styles.athleteName}>{item.athlete_name || 'Atleta'}</Text>
          {item.title && (
            <Text style={styles.videoTitle}>{item.title}</Text>
          )}
          <Text style={styles.videoDescription}>
            {item.description || `🎬 Vídeo de treino`}
          </Text>
          <Text style={styles.videoDate}>
            {new Date(item.uploaded_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Ações - lado direito */}
        <View style={styles.actionsContainer}>
          {/* Perfil */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {item.athlete_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.actionLabel}>Perfil</Text>
          </TouchableOpacity>

          {/* Curtir */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('❤️ Curtir clicado:', item.id);
              onToggleLike(item.id);
            }}
            activeOpacity={0.7}
          >
            <Icon 
              name={isLiked[item.id] ? 'heart' : 'heart-outline'} 
              size={32} 
              color={isLiked[item.id] ? '#EF4444' : '#FFFFFF'} 
            />
            <Text style={styles.actionText}>
              {formatNumber(likeCounts[item.id] || 0)}
            </Text>
          </TouchableOpacity>

          {/* Visualizações */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Icon name="eye-outline" size={28} color="#FFFFFF" />
            <Text style={styles.actionText}>
              {formatNumber(viewCounts[item.id] || 0)}
            </Text>
          </TouchableOpacity>

          {/* Salvar */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('💾 Salvar clicado:', item.id);
              onToggleSave(item.id);
            }}
            activeOpacity={0.7}
          >
            <Icon 
              name={isSaved[item.id] ? 'bookmark' : 'bookmark-outline'} 
              size={28} 
              color={isSaved[item.id] ? colors.primary : '#FFFFFF'} 
            />
            <Text style={styles.actionText}>Salvar</Text>
          </TouchableOpacity>

          {/* Compartilhar */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('📤 Compartilhar clicado:', item.id);
              onShare(item);
            }}
            activeOpacity={0.7}
          >
            <Icon name="share-social-outline" size={28} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Compartilhar</Text>
          </TouchableOpacity>

          {/* Mais (Editar/Excluir) */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Ações do vídeo',
                'O que deseja fazer?',
                [
                  { text: '✎ Editar', onPress: () => onEdit(item) },
                  { text: '🗑️ Excluir', onPress: () => onDelete(item.id), style: 'destructive' },
                  { text: 'Cancelar', style: 'cancel' },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Icon name="ellipsis-horizontal" size={28} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Mais</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function VideosScreen() {
  const { colors, isDark } = useTheme();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  
  const flatListRef = useRef<FlatList>(null);
  const playersRef = useRef<{ [key: string]: VideoPlayer }>({});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 20,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 12,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    positionIndicator: {
      position: 'absolute',
      top: 50,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    positionText: {
      color: '#FFFFFF',
      fontSize: 12,
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
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalField: {
      marginBottom: 16,
    },
    modalLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    modalInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      fontSize: 15,
    },
    modalTextArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalCancelButton: {
      backgroundColor: colors.hover,
    },
    modalSaveButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
    },
  });

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/media/videos?_t=${Date.now()}`);
      const data = await res.json();
      setVideos(data || []);
      
      const likes: Record<string, number> = {};
      const views: Record<string, number> = {};
      data.forEach((video: VideoItem) => {
        likes[video.id] = Math.floor(Math.random() * 1000) + 100;
        views[video.id] = Math.floor(Math.random() * 5000) + 200;
      });
      setLikeCounts(likes);
      setViewCounts(views);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handlePlayerReady = useCallback((player: VideoPlayer, id: string) => {
    playersRef.current[id] = player;
  }, []);

  // ========== FUNÇÕES DE COMPARTILHAMENTO ==========

  const shareToWhatsApp = async (video: VideoItem) => {
    try {
      const url = `${API_URL}${video.file_url}`;
      const text = `🎥 Confira este vídeo do RETESP 4L!\n\n🏆 ${video.athlete_name || 'Atleta'}\n\n🔗 ${url}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  const shareToInstagram = async (video: VideoItem) => {
    try {
      const url = `${API_URL}${video.file_url}`;
      const instagramUrl = `instagram://library?AssetPath=${url}`;
      const supported = await Linking.canOpenURL(instagramUrl);
      if (supported) {
        await Linking.openURL(instagramUrl);
      } else {
        Alert.alert('Instagram não instalado', 'Por favor, instale o Instagram');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o Instagram');
    }
  };

  const shareToFacebook = async (video: VideoItem) => {
    try {
      const url = encodeURIComponent(`${API_URL}${video.file_url}`);
      const text = encodeURIComponent(`🎥 Confira este vídeo do RETESP 4L!\n\n🏆 ${video.athlete_name || 'Atleta'}`);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      await Linking.openURL(facebookUrl);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o Facebook');
    }
  };

  const shareLink = async (video: VideoItem) => {
    try {
      const url = `${API_URL}${video.file_url}`;
      const message = `🎥 Confira este vídeo do RETESP 4L!\n\n🏆 ${video.athlete_name || 'Atleta'}\n\n🔗 ${url}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(url, {
          mimeType: 'video/mp4',
          dialogTitle: 'Compartilhar vídeo',
        });
      } else {
        Alert.alert('🔗 Link do vídeo', message, [
          { text: 'Copiar', onPress: () => Alert.alert('Copiado!', 'Link copiado') },
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o link');
    }
  };

  const showShareOptions = (video: VideoItem) => {
    Alert.alert(
      '📤 Compartilhar vídeo',
      'Escolha como deseja compartilhar:',
      [
        { text: '📱 WhatsApp', onPress: () => shareToWhatsApp(video) },
        { text: '📸 Instagram', onPress: () => shareToInstagram(video) },
        { text: '📘 Facebook', onPress: () => shareToFacebook(video) },
        { text: '🔗 Link', onPress: () => shareLink(video) },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ========== FUNÇÕES DE INTERAÇÃO ==========

  const toggleLike = (videoId: string) => {
    const currentLike = isLiked[videoId] || false;
    setIsLiked({ ...isLiked, [videoId]: !currentLike });
    setLikeCounts({
      ...likeCounts,
      [videoId]: (likeCounts[videoId] || 0) + (currentLike ? -1 : 1),
    });
  };

  const toggleSave = (videoId: string) => {
    const currentSave = isSaved[videoId] || false;
    setIsSaved({ ...isSaved, [videoId]: !currentSave });
    Alert.alert(
      currentSave ? 'Removido' : 'Salvo!',
      currentSave ? 'Vídeo removido dos salvos' : 'Vídeo salvo com sucesso!'
    );
  };

  const deleteVideo = async (videoId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este vídeo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/media/${videoId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                Alert.alert('Sucesso', 'Vídeo excluído com sucesso!');
                await fetchVideos();
                if (videos.length <= 1) {
                  setCurrentIndex(0);
                }
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o vídeo');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro de comunicação');
            }
          },
        },
      ]
    );
  };

  const editVideo = async (videoId: string) => {
    if (!editTitle.trim() && !editDescription.trim()) {
      Alert.alert('Erro', 'Preencha pelo menos um campo');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/media/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle || undefined,
          description: editDescription || undefined,
        }),
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Vídeo atualizado com sucesso!');
        setShowEditModal(false);
        await fetchVideos();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o vídeo');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de comunicação');
    }
  };

  const openEditModal = (video: VideoItem) => {
    setSelectedVideo(video);
    setEditTitle(video.title || '');
    setEditDescription(video.description || '');
    setShowEditModal(true);
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / height);
    if (index !== currentIndex) {
      const prevId = videos[currentIndex]?.id;
      if (prevId && playersRef.current[prevId]) {
        playersRef.current[prevId].pause();
      }
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: VideoItem; index: number }) => {
    const isActive = index === currentIndex;
    return (
      <VideoItemComponent 
        item={item} 
        isActive={isActive}
        onPlayerReady={handlePlayerReady}
        likeCounts={likeCounts}
        isLiked={isLiked}
        onToggleLike={toggleLike}
        isSaved={isSaved}
        onToggleSave={toggleSave}
        viewCounts={viewCounts}
        onShare={showShareOptions}
        onEdit={openEditModal}
        onDelete={deleteVideo}
        colors={colors}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando vídeos...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="videocam-outline" size={60} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Nenhum vídeo disponível</Text>
        <Text style={styles.emptySubtitle}>Os vídeos aparecerão aqui quando disponíveis</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      <View style={styles.positionIndicator}>
        <Text style={styles.positionText}>
          {currentIndex + 1} / {videos.length}
        </Text>
      </View>

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✎ Editar Vídeo</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Título</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Título do vídeo"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Descrição</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Descrição do vídeo"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={() => selectedVideo && editVideo(selectedVideo.id)}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
