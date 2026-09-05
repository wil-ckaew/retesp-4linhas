//mobile/src/screens/VideosScreen.tsx
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
  Image,
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
  avatar_url?: string | null;
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
  onSaveVideo,
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
  onSaveVideo: (item: VideoItem) => Promise<void>;
  colors: any;
}) => {
  const videoUrl = `${API_URL}${item.file_url}`;
  const [playerError, setPlayerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    if (isActive) {
      player.play();
    }
    onPlayerReady(player, item.id);
  });

  // Monitorar erros do player
  useEffect(() => {
    const subscription = player.addListener('statusChange', (status: any) => {
      if (status.status === 'error') {
        setPlayerError(true);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

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

  // Função para obter URL do avatar
  const getAvatarUrl = (avatar_url: string | null | undefined): string | null => {
    if (!avatar_url) return null;
    if (avatar_url.startsWith('http://') || avatar_url.startsWith('https://')) {
      return avatar_url;
    }
    if (avatar_url.startsWith('/uploads/')) {
      let url = avatar_url;
      if (url.endsWith('.bin')) {
        url = url.replace('.bin', '.jpg');
      }
      if (!url.includes('.')) {
        url = url + '.jpg';
      }
      return `${API_URL}${url}`;
    }
    if (avatar_url.startsWith('/')) {
      return `${API_URL}${avatar_url}`;
    }
    return `${API_URL}/uploads/${avatar_url}`;
  };

  const avatarUrl = getAvatarUrl(item.avatar_url);
  const showInitials = !avatarUrl || avatarError;

  // Função para salvar vídeo
  const handleSaveVideo = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await onSaveVideo(item);
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o vídeo');
    } finally {
      setIsDownloading(false);
    }
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
      padding: 20,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },
    overlayGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 300,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 30,
      paddingTop: 60,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingRight: 16,
    },
    athleteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    athleteAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      marginRight: 10,
    },
    athleteAvatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: 'cover',
    },
    athleteAvatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    athleteName: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    athleteBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    athleteBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
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
    actionEmojiContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
    actionEmoji: {
      fontSize: 20,
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
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    shareModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
      padding: 20,
    },
    shareModalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    shareModalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    shareOptionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    shareOption: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.hover,
      width: 70,
      marginBottom: 12,
    },
    shareOptionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    shareOptionText: {
      color: colors.text,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 2,
    },
    shareCancelButton: {
      backgroundColor: colors.hover,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    shareCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Função para abrir o modal de compartilhamento
  const openShareModal = () => {
    onShare(item);
  };

  if (playerError) {
    return (
      <View style={styles.videoContainer}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#EF4444" />
          <Text style={styles.errorText}>Erro ao carregar vídeo</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setPlayerError(false)}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
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
      />

      {/* Gradiente de fundo do overlay */}
      <View style={styles.overlayGradient} />

      {/* Overlay com informações e ações */}
      <View style={styles.overlay}>
        {/* Informações do vídeo - lado esquerdo */}
        <View style={styles.infoContainer}>
          <View style={styles.athleteContainer}>
            <View style={styles.athleteAvatar}>
              {showInitials ? (
                <Text style={styles.athleteAvatarText}>
                  {item.athlete_name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              ) : (
                <Image
                  source={{ uri: avatarUrl || undefined }}
                  style={styles.athleteAvatarImage}
                  onError={() => setAvatarError(true)}
                />
              )}
            </View>
            <Text style={styles.athleteName}>{item.athlete_name || 'Atleta'}</Text>
            <View style={styles.athleteBadge}>
              <Text style={styles.athleteBadgeText}>PRO</Text>
            </View>
          </View>

          {item.title && (
            <Text style={styles.videoTitle}>🎬 {item.title}</Text>
          )}
          <Text style={styles.videoDescription}>
            {item.description || '🎬 Vídeo de treino'}
          </Text>
          <Text style={styles.videoDate}>
            📅 {new Date(item.uploaded_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Ações - lado direito */}
        <View style={styles.actionsContainer}>
          {/* Perfil */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionEmojiContainer}>
              <Text style={styles.actionEmoji}>👤</Text>
            </View>
            <Text style={styles.actionLabel}>Perfil</Text>
          </TouchableOpacity>

          {/* Curtir */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onToggleLike(item.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.actionEmojiContainer,
              isLiked[item.id] && { backgroundColor: 'rgba(239, 68, 68, 0.3)' }
            ]}>
              <Text style={styles.actionEmoji}>
                {isLiked[item.id] ? '❤️' : '🤍'}
              </Text>
            </View>
            <Text style={styles.actionText}>{formatNumber(likeCounts[item.id] || 0)}</Text>
          </TouchableOpacity>

          {/* Visualizações */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionEmojiContainer}>
              <Text style={styles.actionEmoji}>👁️</Text>
            </View>
            <Text style={styles.actionText}>{formatNumber(viewCounts[item.id] || 0)}</Text>
          </TouchableOpacity>

          {/* Salvar com download */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSaveVideo}
            activeOpacity={0.7}
            disabled={isDownloading}
          >
            <View style={[
              styles.actionEmojiContainer,
              isSaved[item.id] && { backgroundColor: 'rgba(59, 130, 246, 0.3)' }
            ]}>
              <Text style={styles.actionEmoji}>
                {isDownloading ? '⏳' : (isSaved[item.id] ? '💾' : '💿')}
              </Text>
            </View>
            <Text style={styles.actionText}>
              {isDownloading ? 'Baixando...' : (isSaved[item.id] ? 'Salvo' : 'Salvar')}
            </Text>
          </TouchableOpacity>

          {/* Compartilhar */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openShareModal}
            activeOpacity={0.7}
          >
            <View style={styles.actionEmojiContainer}>
              <Text style={styles.actionEmoji}>📤</Text>
            </View>
            <Text style={styles.actionLabel}>Compartilhar</Text>
          </TouchableOpacity>

          {/* Mais (Configurações) */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                '⚙️ Configurações do vídeo',
                'O que deseja fazer?',
                [
                  { text: '✎ Editar informações', onPress: () => onEdit(item) },
                  { text: '📥 Baixar vídeo', onPress: handleSaveVideo },
                  { text: '🗑️ Excluir vídeo', onPress: () => onDelete(item.id), style: 'destructive' },
                  { text: '❌ Cancelar', style: 'cancel' },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.actionEmojiContainer}>
              <Text style={styles.actionEmoji}>⚙️</Text>
            </View>
            <Text style={styles.actionLabel}>Configurações</Text>
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
  const [showShareModal, setShowShareModal] = useState(false);
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
      top: 60,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
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
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: 6,
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
    shareModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
      padding: 20,
    },
    shareModalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    shareModalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    shareOptionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    shareOption: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.hover,
      width: 70,
      marginBottom: 12,
    },
    shareOptionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    shareOptionText: {
      color: colors.text,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 2,
    },
    shareCancelButton: {
      backgroundColor: colors.hover,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    shareCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
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

  // ========== FUNÇÃO PARA SALVAR/BAIXAR VÍDEO ==========
  const saveVideoToDevice = async (video: VideoItem) => {
    console.log('🔴 saveVideoToDevice chamado para:', video.id);
    
    try {
      // Verificar se o vídeo já foi salvo
      if (isSaved[video.id]) {
        Alert.alert('ℹ️ Informação', 'Este vídeo já foi baixado!');
        return;
      }

      const url = `${API_URL}${video.file_url}`;
      console.log('📥 URL do vídeo:', url);

      // Para web
      if (Platform.OS === 'web') {
        Alert.alert(
          '📥 Baixar vídeo',
          'Clique em OK para abrir o link do vídeo',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'OK', 
              onPress: () => {
                window.open(url, '_blank');
                setIsSaved(prev => ({ ...prev, [video.id]: true }));
                Alert.alert('✅ Sucesso', 'Vídeo aberto em nova aba!');
              }
            }
          ]
        );
        return;
      }

      // Para mobile - usar Sharing
      if (await Sharing.isAvailableAsync()) {
        Alert.alert(
          '📥 Baixar vídeo',
          'O vídeo será compartilhado para você salvar',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'OK', 
              onPress: async () => {
                try {
                  await Sharing.shareAsync(url, {
                    mimeType: 'video/mp4',
                    dialogTitle: 'Salvar vídeo',
                  });
                  setIsSaved(prev => ({ ...prev, [video.id]: true }));
                  Alert.alert('✅ Sucesso', 'Vídeo compartilhado com sucesso!');
                } catch (error) {
                  console.error('Erro ao compartilhar:', error);
                  Alert.alert('❌ Erro', 'Não foi possível compartilhar o vídeo');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('❌ Erro', 'Compartilhamento não disponível');
      }
    } catch (error) {
      console.error('❌ Erro ao baixar vídeo:', error);
      Alert.alert('❌ Erro', 'Não foi possível baixar o vídeo');
    }
  };

  // ========== FUNÇÕES DE COMPARTILHAMENTO ==========

  const shareToWhatsApp = async (video: VideoItem) => {
    try {
      const url = `${API_URL}${video.file_url}`;
      const text = `🎥 Confira este vídeo do RETESP 4L!\n\n🏆 ${video.athlete_name || 'Atleta'}\n\n🔗 ${url}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('WhatsApp não instalado', 'Por favor, instale o WhatsApp');
      }
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

  const shareToTikTok = async (video: VideoItem) => {
    try {
      const url = `${API_URL}${video.file_url}`;
      const tiktokUrl = `https://www.tiktok.com/@relesportes/video/${video.id}`;
      const supported = await Linking.canOpenURL(tiktokUrl);
      if (supported) {
        await Linking.openURL(tiktokUrl);
      } else {
        Alert.alert('TikTok não instalado', 'Por favor, instale o TikTok');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o TikTok');
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

  const shareToTwitter = async (video: VideoItem) => {
    try {
      const url = encodeURIComponent(`${API_URL}${video.file_url}`);
      const text = encodeURIComponent(`🎥 Confira este vídeo do RETESP 4L!\n\n🏆 ${video.athlete_name || 'Atleta'}`);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      await Linking.openURL(twitterUrl);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o Twitter');
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
        Alert.alert('Link do vídeo', message, [
          { text: 'Copiar', onPress: () => Alert.alert('Copiado!', 'Link copiado') },
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o link');
    }
  };

  const openShareModal = (video: VideoItem) => {
    setSelectedVideo(video);
    setShowShareModal(true);
  };

  const handleShareOption = (option: string) => {
    if (!selectedVideo) return;
    
    setShowShareModal(false);
    
    switch (option) {
      case 'whatsapp':
        shareToWhatsApp(selectedVideo);
        break;
      case 'instagram':
        shareToInstagram(selectedVideo);
        break;
      case 'tiktok':
        shareToTikTok(selectedVideo);
        break;
      case 'facebook':
        shareToFacebook(selectedVideo);
        break;
      case 'twitter':
        shareToTwitter(selectedVideo);
        break;
      case 'link':
        shareLink(selectedVideo);
        break;
      default:
        break;
    }
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
        onToggleSave={() => {}}
        viewCounts={viewCounts}
        onShare={openShareModal}
        onEdit={openEditModal}
        onDelete={deleteVideo}
        onSaveVideo={saveVideoToDevice}
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

      {/* Modal de Edição */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Vídeo</Text>
            
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
                <Text style={{ fontSize: 16 }}>❌</Text>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={() => selectedVideo && editVideo(selectedVideo.id)}
              >
                <Text style={{ fontSize: 16 }}>💾</Text>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Compartilhamento */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <TouchableOpacity 
          style={styles.shareModalContainer}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={styles.shareModalContent}>
            <Text style={styles.shareModalTitle}>📤 Compartilhar vídeo</Text>
            
            <View style={styles.shareOptionsGrid}>
              {/* WhatsApp */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('whatsapp')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' }]}>
                  <Text style={{ fontSize: 30 }}>📱</Text>
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('instagram')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#E4405F' }]}>
                  <Text style={{ fontSize: 30 }}>📸</Text>
                </View>
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>

              {/* TikTok */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('tiktok')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#000000' }]}>
                  <Text style={{ fontSize: 30 }}>🎵</Text>
                </View>
                <Text style={styles.shareOptionText}>TikTok</Text>
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('facebook')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#1877F2' }]}>
                  <Text style={{ fontSize: 30 }}>📘</Text>
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              {/* Twitter */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('twitter')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#1DA1F2' }]}>
                  <Text style={{ fontSize: 30 }}>🐦</Text>
                </View>
                <Text style={styles.shareOptionText}>Twitter</Text>
              </TouchableOpacity>

              {/* Link */}
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => handleShareOption('link')}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: colors.primary }]}>
                  <Text style={{ fontSize: 30 }}>🔗</Text>
                </View>
                <Text style={styles.shareOptionText}>Copiar Link</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.shareCancelButton}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.shareCancelText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}