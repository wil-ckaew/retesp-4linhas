// frontend/mobile/src/screens/MediaScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
  FlatList,
  SafeAreaView,
  Animated,
  Share,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';

const isWeb = Platform.OS === 'web';
const { width, height } = Dimensions.get('window');

interface Media {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
  athlete_id?: string;
  avatar_url?: string; // Adicionando avatar_url
}

interface MediaStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isSaved: boolean;
}

export default function MediaScreen() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Estados sociais
  const [mediaStats, setMediaStats] = useState<Record<string, MediaStats>>({});
  const [isLiking, setIsLiking] = useState(false);
  
  // Animações
  const heartScale = useRef(new Animated.Value(0)).current;

  const fetchMedia = async () => {
    try {
      // Buscar atletas primeiro para pegar os avatares
      const athletesRes = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      const athletesData = await athletesRes.json();
      setAthletes(athletesData || []);
      
      // Criar mapa de atletas por ID
      const athletesMap: Record<string, any> = {};
      athletesData.forEach((athlete: any) => {
        athletesMap[athlete.id] = athlete;
      });

      const [photosRes, videosRes] = await Promise.all([
        fetch(`${API_URL}/media/photos?_t=${Date.now()}`),
        fetch(`${API_URL}/media/videos?_t=${Date.now()}`),
      ]);

      const photosData = await photosRes.json();
      const videosData = await videosRes.json();

      // Combinar e ordenar por data, adicionando avatar_url
      const allMedia = [...photosData, ...videosData].map((item: any) => {
        const athlete = athletesMap[item.athlete_id];
        return {
          ...item,
          avatar_url: athlete?.avatar_url || null,
        };
      });
      
      allMedia.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
      
      setMediaItems(allMedia);
      
      // Inicializar stats
      const initialStats: Record<string, MediaStats> = {};
      allMedia.forEach((item: Media) => {
        initialStats[item.id] = {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 1,
          views: Math.floor(Math.random() * 5000) + 200,
          isLiked: false,
          isSaved: false,
        };
      });
      setMediaStats(initialStats);
      
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedia();
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
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // ========== FUNÇÕES SOCIAIS ==========

  const handleLike = async (mediaId: string) => {
    if (isLiking) return;
    setIsLiking(true);

    const currentStats = mediaStats[mediaId];
    if (!currentStats) return;

    // Animar coração
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.8,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(heartScale, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();

    const updatedStats = {
      ...currentStats,
      likes: currentStats.isLiked ? currentStats.likes - 1 : currentStats.likes + 1,
      isLiked: !currentStats.isLiked,
    };
    setMediaStats({
      ...mediaStats,
      [mediaId]: updatedStats,
    });

    try {
      await fetch(`${API_URL}/media/${mediaId}/like`, {
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

  // ========== FUNÇÕES DE COMPARTILHAMENTO ==========

  const handleShare = async (media: Media) => {
    const shareOptions = {
      title: 'Compartilhar',
      message: `🎥 Confira esta mídia incrível de ${media.athlete_name || 'atleta'}!\n\n${API_URL}${media.file_url}\n\n#RETESP4Linhas #Esporte #Futebol`,
      url: `${API_URL}${media.file_url}`,
    };

    try {
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        const currentStats = mediaStats[media.id];
        if (currentStats) {
          setMediaStats({
            ...mediaStats,
            [media.id]: {
              ...currentStats,
              shares: currentStats.shares + 1,
            },
          });
        }
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Compartilhar em Redes Sociais',
            'Escolha onde compartilhar:',
            [
              {
                text: '📱 Instagram',
                onPress: () => shareToInstagram(media),
              },
              {
                text: '📘 Facebook',
                onPress: () => shareToFacebook(media),
              },
              {
                text: '🐦 Twitter/X',
                onPress: () => shareToTwitter(media),
              },
              {
                text: '💬 WhatsApp',
                onPress: () => shareToWhatsApp(media),
              },
              {
                text: '🔗 Copiar Link',
                onPress: () => copyLink(media),
              },
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar');
    }
  };

  const shareToInstagram = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    const instagramUrl = `instagram://library?AssetPath=${url}`;
    Linking.openURL(instagramUrl).catch(() => {
      Alert.alert('Instagram não instalado', 'Por favor, instale o Instagram para compartilhar');
    });
  };

  const shareToFacebook = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    Linking.openURL(facebookUrl);
  };

  const shareToTwitter = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    const text = `🎥 Confira esta mídia incrível de ${media.athlete_name || 'atleta'}! #RETESP4Linhas`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    Linking.openURL(twitterUrl);
  };

  const shareToWhatsApp = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    const text = `🎥 Confira esta mídia incrível de ${media.athlete_name || 'atleta'}! ${url}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('WhatsApp não instalado', 'Por favor, instale o WhatsApp para compartilhar');
    });
  };

  const copyLink = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    Alert.alert('Link copiado!', `URL: ${url}`);
  };

  // ========== FUNÇÃO DE DOWNLOAD ==========

  const handleDownload = (media: Media) => {
    const url = `${API_URL}${media.file_url}`;
    if (isWeb) {
      window.open(url, '_blank');
    } else {
      Alert.alert('Download', `URL: ${url}\n\nPara baixar, abra no navegador`);
    }
  };

  // ========== NAVEGAÇÃO ENTRE VÍDEOS ==========

  const goToNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  // ========== COMPONENTES ==========

  // Componente de Avatar que exibe a foto ou a primeira letra
  const AthleteAvatar = ({ media }: { media: Media }) => {
    const [imageError, setImageError] = useState(false);
    const avatarUrl = media.avatar_url ? `${API_URL}${media.avatar_url}` : null;

    return (
      <View style={styles.avatarCircle}>
        {avatarUrl && !imageError ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={styles.avatarText}>
            {media.athlete_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        )}
      </View>
    );
  };

  const ActionButtons = ({ media }: { media: Media }) => {
    const stats = mediaStats[media.id] || { 
      likes: 0, comments: 0, shares: 0, views: 0, isLiked: false, isSaved: false 
    };

    return (
      <View style={styles.actionButtons}>
        {/* Avatar do Atleta com Foto */}
        <TouchableOpacity style={styles.actionButton}>
          <AthleteAvatar media={media} />
          <Text style={styles.actionLabel}>Perfil</Text>
        </TouchableOpacity>

        {/* Curtir */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleLike(media.id)}
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

        {/* Comentários */}
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chatbubble-outline" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(stats.comments)}</Text>
        </TouchableOpacity>

        {/* Compartilhar */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleShare(media)}
        >
          <Icon name="share-social-outline" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(stats.shares)}</Text>
        </TouchableOpacity>

        {/* Download */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDownload(media)}
        >
          <Icon name="download-outline" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>Baixar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const MediaViewer = ({ media, index }: { media: Media; index: number }) => {
    const isVideo = media.media_type === 'video' || media.file_url.match(/\.(mp4|mov|avi|webm)$/i);
    const [showControls, setShowControls] = useState(true);

    const handleTap = () => {
      setShowControls(!showControls);
    };

    if (isWeb) {
      return (
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <video
              src={`${API_URL}${media.file_url}`}
              style={styles.fullscreenVideo as any}
              controls
              autoPlay
              loop
            />
          ) : (
            <Image
              source={{ uri: `${API_URL}${media.file_url}` }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFullscreen(false)}
          >
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.webNavigation}>
            <TouchableOpacity 
              style={[styles.webNavButton, index === 0 && styles.webNavDisabled]}
              onPress={goToPrevious}
              disabled={index === 0}
            >
              <Icon name="chevron-up" size={30} color={index > 0 ? "#FFFFFF" : "#4B5563"} />
            </TouchableOpacity>
            <Text style={styles.webNavText}>{index + 1} / {mediaItems.length}</Text>
            <TouchableOpacity 
              style={[styles.webNavButton, index === mediaItems.length - 1 && styles.webNavDisabled]}
              onPress={goToNext}
              disabled={index === mediaItems.length - 1}
            >
              <Icon name="chevron-down" size={30} color={index < mediaItems.length - 1 ? "#FFFFFF" : "#4B5563"} />
            </TouchableOpacity>
          </View>

          <ActionButtons media={media} />
          <View style={styles.mediaInfoBottom}>
            <Text style={styles.mediaTitle}>
              {media.athlete_name || 'Mídia'}
            </Text>
            <Text style={styles.mediaDescription}>
              🏆 {media.media_type === 'video' ? 'Vídeo' : 'Foto'} de treino
            </Text>
            <View style={styles.mediaTags}>
              <Text style={styles.tag}>#RETESP</Text>
              <Text style={styles.tag}>#Esporte</Text>
            </View>
            <Text style={styles.mediaDate}>
              {formatDate(media.uploaded_at)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity 
          style={styles.mediaTouchArea} 
          onPress={handleTap}
          activeOpacity={1}
        >
          {isVideo ? (
            <View style={styles.videoWrapper}>
              <Icon name="videocam" size={50} color="#6B7280" />
              <Text style={styles.videoPlaceholderText}>
                {media.athlete_name || 'Vídeo'}
              </Text>
              <Text style={styles.videoPlaceholderSubtext}>
                Toque para play/pause
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: `${API_URL}${media.file_url}` }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowFullscreen(false)}
        >
          <Icon name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <ActionButtons media={media} />

        <View style={styles.mediaInfoBottom}>
          <Text style={styles.mediaTitle}>
            {media.athlete_name || 'Mídia'}
          </Text>
          <Text style={styles.mediaDescription}>
            🏆 {media.media_type === 'video' ? 'Vídeo' : 'Foto'} de treino e evolução
          </Text>
          <View style={styles.mediaTags}>
            <Text style={styles.tag}>#RETESP</Text>
            <Text style={styles.tag}>#Esporte</Text>
            <Text style={styles.tag}>#{media.media_type === 'video' ? 'Video' : 'Photo'}</Text>
          </View>
          <Text style={styles.mediaDate}>
            {formatDate(media.uploaded_at)}
          </Text>
        </View>

        <View style={styles.navigationIndicator}>
          {mediaItems.map((_, i) => (
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

  // ========== RENDER PRINCIPAL ==========

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando mídias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>📱 Mídias</Text>
            <Text style={styles.headerSubtitle}>
              {mediaItems.length} {mediaItems.length === 1 ? 'mídia' : 'mídias'} disponíveis
            </Text>
          </View>
        </View>
      </View>

      {mediaItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="images-outline" size={60} color="#6B7280" />
          <Text style={styles.emptyText}>Nenhuma mídia encontrada</Text>
          <Text style={styles.emptySubtext}>As mídias aparecerão aqui quando disponíveis</Text>
        </View>
      ) : (
        <FlatList
          data={mediaItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.mediaCard}
              onPress={() => {
                setCurrentIndex(index);
                setShowFullscreen(true);
              }}
              activeOpacity={0.9}
            >
              {item.media_type === 'video' || item.file_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                <View style={styles.mediaThumbnailVideo}>
                  <Icon name="play-circle" size={48} color="#3B82F6" />
                  <View style={styles.mediaOverlayBadge}>
                    <Icon name="videocam" size={14} color="#FFFFFF" />
                    <Text style={styles.mediaBadgeText}>Vídeo</Text>
                  </View>
                </View>
              ) : (
                <Image
                  source={{ uri: `${API_URL}${item.file_url}` }}
                  style={styles.mediaThumbnail}
                  resizeMode="cover"
                />
              )}
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaName} numberOfLines={1}>
                  {item.athlete_name || 'Sem nome'}
                </Text>
                <Text style={styles.mediaDate}>{formatDate(item.uploaded_at)}</Text>
              </View>
            </TouchableOpacity>
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Player Fullscreen Estilo TikTok */}
      {showFullscreen && (
        <Modal
          visible={showFullscreen}
          transparent={false}
          animationType="slide"
          onRequestClose={() => {
            setShowFullscreen(false);
            StatusBar.setHidden(false);
          }}
          statusBarTranslucent={true}
        >
          <StatusBar hidden={true} />
          <SafeAreaView style={styles.fullscreenContainer}>
            <FlatList
              ref={flatListRef}
              data={mediaItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.fullscreenItem}>
                  <MediaViewer media={item} index={index} />
                </View>
              )}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              snapToInterval={height}
              snapToAlignment="start"
              decelerationRate="fast"
              onScroll={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.y / height);
                if (newIndex !== currentIndex) {
                  setCurrentIndex(newIndex);
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
              removeClippedSubviews={false}
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
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  mediaCard: {
    width: (width - 32) / 2,
    backgroundColor: '#161B22',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  mediaThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#0D1117',
  },
  mediaThumbnailVideo: {
    width: '100%',
    height: 180,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  mediaInfo: {
    padding: 10,
  },
  mediaName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mediaDate: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenItem: {
    height: height,
    width: width,
    backgroundColor: '#000000',
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaTouchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  fullscreenVideo: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  videoWrapper: {
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
    gap: 20,
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
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 9,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaInfoBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    zIndex: 10,
  },
  mediaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mediaDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  mediaTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  mediaDate: {
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
  webNavigation: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -40 }],
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  webNavButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  webNavDisabled: {
    opacity: 0.3,
  },
  webNavText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});