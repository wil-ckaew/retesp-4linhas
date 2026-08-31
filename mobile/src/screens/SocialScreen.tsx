import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Modal,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { useStatus } from '../context/StatusContext';
import { StatusLogo } from '../components/StatusLogo';
import { useTheme } from '../context/ThemeContext';

let Video: any = null;
if (Platform.OS !== 'web') {
  try {
    Video = require('expo-av').Video;
  } catch (error) {
    console.warn('expo-av não disponível');
  }
}

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface Post {
  id: string;
  author_name: string;
  team_name: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  likes: number;
  comments: number;
}

interface Story {
  id: number;
  user: string;
  image?: string;
  video_url?: string;
  type: 'image' | 'video';
  isFromRETESP?: boolean;
  expiresAt?: number;
}

export default function SocialScreen() {
  const { colors, isDark } = useTheme();
  const { stories, addStoryToBackend, fetchStories, deleteExpiredStories } = useStatus();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', team: 'Sub-12' });
  const [creating, setCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [videoError, setVideoError] = useState(false);

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
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
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
    storiesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    storiesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    storiesTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    storiesScroll: {
      flexDirection: 'row',
    },
    storyItem: {
      alignItems: 'center',
      marginRight: 16,
    },
    storyAvatarWrapper: {
      padding: 2,
    },
    storyAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      padding: 2,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyRETESP: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      backgroundColor: '#1A1A2E',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    storyRETESPText: {
      color: '#FF4444',
      fontSize: 18,
      fontWeight: 'bold',
    },
    storyRETESPBadge: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: '#00FF88',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    storyRETESPBadgeText: {
      color: '#1A1A2E',
      fontSize: 6,
      fontWeight: 'bold',
    },
    storyAvatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
    },
    storyAvatarDefault: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyAvatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    storyVideoPlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 30,
      backgroundColor: '#1E1E1E',
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyUserName: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
      maxWidth: 64,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.hover,
      marginRight: 8,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
    },
    filterText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    createPost: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    createPostHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    createPostAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    createPostAvatarText: {
      color: '#FFFFFF',
      fontSize: 18,
    },
    postInput: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      minHeight: 40,
      paddingTop: 8,
      textAlignVertical: 'top',
    },
    mediaPreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginVertical: 8,
      marginLeft: 48,
    },
    mediaPreview: {
      position: 'relative',
      width: 72,
      height: 72,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    previewVideo: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeMedia: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 12,
    },
    postActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginLeft: 48,
    },
    mediaButtons: {
      flexDirection: 'row',
      gap: 16,
    },
    postRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    postButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    postButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    postAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    authorAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    authorAvatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    authorName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    authorTeam: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    postDate: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    postContent: {
      color: colors.text,
      fontSize: 15,
      marginBottom: 8,
      lineHeight: 22,
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 8,
    },
    videoContainer: {
      width: '100%',
      height: 220,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: '#000000',
      overflow: 'hidden',
    },
    videoPlayer: {
      width: '100%',
      height: '100%',
    },
    videoFallback: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    videoFallbackText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    videoLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: 1,
    },
    postFooter: {
      flexDirection: 'row',
      gap: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    postAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    postActionText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    footerSpacer: {
      height: 20,
    },
    storyModalContainer: {
      flex: 1,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    storyModalClose: {
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
    storyModalContent: {
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    storyModalHeader: {
      marginBottom: 16,
    },
    storyModalUser: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    storyModalRETESP: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    storyModalRETESPText: {
      color: '#FF4444',
      fontSize: 24,
      fontWeight: 'bold',
    },
    storyModalRETESPBadge: {
      backgroundColor: '#00FF88',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    storyModalRETESPBadgeText: {
      color: '#1A1A2E',
      fontSize: 16,
    },
    storyModalRETESPContent: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    storyModalRETESPBig: {
      color: '#FF4444',
      fontSize: 48,
      fontWeight: 'bold',
    },
    storyModalRETESPBigSub: {
      color: '#00FF88',
      fontSize: 24,
      fontWeight: 'bold',
    },
    storyModalRETESPDesc: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 8,
    },
    storyModalMedia: {
      width: '100%',
      height: height * 0.6,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyModalImage: {
      width: '100%',
      height: '100%',
    },
    storyModalVideo: {
      width: '100%',
      height: '100%',
    },
    storyVideoContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    storyModalEmpty: {
      alignItems: 'center',
    },
    storyModalEmptyText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    storyModalButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
    },
    storyModalButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    shareModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    shareModalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
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
    shareOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
    },
    shareOption: {
      alignItems: 'center',
      width: 70,
    },
    shareIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    statusIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: 'hidden',
    },
    statusGradient: {
      width: '100%',
      height: '100%',
      backgroundColor: '#8B5CF6',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      borderRadius: 16,
    },
    shareLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
    },
    shareCancelButton: {
      marginTop: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    shareCancelText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/social/feed?_t=${Date.now()}`);
      const data = await res.json();
      setPosts(data || []);
      setFilteredPosts(data || []);
      
      const likesMap: Record<string, number> = {};
      data.forEach((post: Post) => {
        likesMap[post.id] = post.likes;
      });
      setLikes(likesMap);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
    deleteExpiredStories();
    
    if (!isWeb) {
      (async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria para anexar mídias');
        }
      })();
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
    fetchStories();
    deleteExpiredStories();
  };

  const filterByTeam = (team: string | null) => {
    setSelectedTeam(team);
    if (team) {
      setFilteredPosts(posts.filter(post => post.team_name === team));
    } else {
      setFilteredPosts(posts);
    }
  };

  const handleImagePicker = async () => {
    try {
      if (isWeb) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedImage({
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              file: file,
            });
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          base64: false,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setSelectedImage({
            uri: asset.uri,
            name: asset.fileName || 'image.jpg',
            type: asset.mimeType || 'image/jpeg',
            size: asset.fileSize || 0,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleVideoPicker = async () => {
    try {
      if (isWeb) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedVideo({
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              file: file,
            });
          }
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setSelectedVideo({
            uri: asset.uri,
            name: asset.fileName || 'video.mp4',
            type: asset.mimeType || 'video/mp4',
            size: asset.fileSize || 0,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar vídeo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o vídeo');
    }
  };

  const uploadMedia = async (file: any, type: 'image' | 'video') => {
    setUploading(true);
    try {
      const formData = new FormData();
      
      if (isWeb && file.file) {
        formData.append('file', file.file);
      } else {
        const fileData = {
          uri: file.uri,
          type: file.type || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
          name: file.name || (type === 'image' ? 'image.jpg' : 'video.mp4'),
        };
        formData.append('file', fileData as any);
      }
      
      formData.append('athlete_id', '00000000-0000-0000-0000-000000000000');

      const xhr = new XMLHttpRequest();
      
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
            reject(new Error(`Erro ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Erro de conexão'));
        xhr.open('POST', `${API_URL}/upload`);
        xhr.send(formData);
      });

      const response = await uploadPromise;
      return response;
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Não foi possível fazer o upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.content.trim() && !selectedImage && !selectedVideo) {
      Alert.alert('Erro', 'Escreva algo ou anexe uma mídia');
      return;
    }

    setCreating(true);
    let image_url: string | null = null;
    let video_url: string | null = null;

    try {
      if (selectedImage) {
        const result = await uploadMedia(selectedImage, 'image');
        if (result && result.url) {
          image_url = result.url;
        }
      }

      if (selectedVideo) {
        const result = await uploadMedia(selectedVideo, 'video');
        if (result && result.url) {
          video_url = result.url;
        }
      }

      const payload = {
        team_name: newPost.team,
        content: newPost.content,
        image_url: image_url,
        video_url: video_url,
      };

      const res = await fetch(`${API_URL}/social/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Postagem criada!');
        setNewPost({ content: '', team: 'Sub-12' });
        setSelectedImage(null);
        setSelectedVideo(null);
        fetchPosts();
      } else {
        Alert.alert('Erro', 'Não foi possível criar a postagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Erro de comunicação');
    } finally {
      setCreating(false);
    }
  };

  const removeMedia = (type: 'image' | 'video') => {
    if (type === 'image') {
      setSelectedImage(null);
    } else {
      setSelectedVideo(null);
    }
  };

  const toggleLike = (postId: string) => {
    setLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  const handleShare = async (post: Post) => {
    setSelectedPost(post);
    setShareModalVisible(true);
  };

  const shareToStatus = async (post: Post) => {
    const hasVideo = !!post.video_url;
    const hasImage = !!post.image_url && !hasVideo;
    
    const newStory: Story = {
      id: Date.now(),
      user: 'Você',
      type: hasVideo ? 'video' : 'image',
      image: hasImage ? `${API_URL}${post.image_url}` : undefined,
      video_url: hasVideo ? post.video_url : undefined,
      isFromRETESP: false,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    if (hasVideo && !newStory.video_url) {
      newStory.video_url = post.video_url;
      newStory.type = 'video';
    }

    await addStoryToBackend(newStory);
    setShareModalVisible(false);
    
    Alert.alert(
      '✅ Sucesso!', 
      `Status compartilhado com sucesso!\n\nTipo: ${newStory.type}`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            fetchStories();
            deleteExpiredStories();
          }
        }
      ]
    );
  };

  const shareToWhatsApp = async (post: Post) => {
    const text = `📱 Confira esta postagem do RETESP 4L!\n\n${post.content}\n\n🏆 RETESP 4L - Gestão Esportiva`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    Linking.openURL(url);
    setShareModalVisible(false);
  };

  const shareToInstagram = async (post: Post) => {
    const text = `📱 Confira esta postagem do RETESP 4L!\n\n${post.content}`;
    const url = `instagram://share?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Instagram não instalado', 'Por favor, instale o Instagram');
    });
    setShareModalVisible(false);
  };

  const shareToFacebook = async (post: Post) => {
    const text = `📱 Confira esta postagem do RETESP 4L!\n\n${post.content}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://localhost:3001/social')}&quote=${encodeURIComponent(text)}`;
    Linking.openURL(url);
    setShareModalVisible(false);
  };

  const shareViaLink = async (post: Post) => {
    const link = `http://localhost:3001/social?post=${post.id}`;
    Alert.alert('🔗 Link', link, [
      { 
        text: 'Copiar', 
        onPress: () => Alert.alert('Copiado!', 'Link copiado para a área de transferência') 
      },
      { text: 'OK' },
    ]);
    setShareModalVisible(false);
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setVideoError(false);
    setStoryModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const teams = Array.from(new Set(posts.map(post => post.team_name)));

  const VideoComponent = ({ uri, style, autoPlay = true }: { uri: string; style?: any; autoPlay?: boolean }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (isWeb) {
      return (
        <video
          src={uri}
          style={{ width: '100%', height: '100%' }}
          controls
          playsInline
          autoPlay={autoPlay}
          loop
        />
      );
    }

    if (error || !Video) {
      return (
        <View style={[styles.videoPlayer, styles.videoFallback]}>
          <Icon name="play-circle" size={40} color={colors.primary} />
          <Text style={styles.videoFallbackText}>Vídeo não disponível</Text>
        </View>
      );
    }

    return (
      <View style={style || styles.videoPlayer}>
        {loading && (
          <View style={styles.videoLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <Video
          source={{ uri }}
          style={style || styles.videoPlayer}
          resizeMode="contain"
          shouldPlay={autoPlay}
          useNativeControls={true}
          isLooping={true}
          onError={(e: any) => {
            console.error('Erro no vídeo:', e);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          onBuffer={() => setLoading(true)}
        />
      </View>
    );
  };

  const StoriesComponent = () => {
    const retespStory: Story = {
      id: 999,
      user: 'RETESP 4L',
      type: 'image',
      image: undefined,
      isFromRETESP: true,
    };

    return (
      <View style={styles.storiesContainer}>
        <View style={styles.storiesHeader}>
          <Text style={styles.storiesTitle}>📸 Stories</Text>
          <TouchableOpacity onPress={() => {
            fetchStories();
            deleteExpiredStories();
          }}>
            <Icon name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesScroll}>
          <TouchableOpacity
            style={styles.storyItem}
            onPress={() => openStory(retespStory)}
          >
            <View style={styles.storyAvatarWrapper}>
              <View style={[styles.storyAvatar, { borderColor: '#EF4444', borderWidth: 3 }]}>
                <StatusLogo size={56} showText={false} />
              </View>
            </View>
            <Text style={[styles.storyUserName, { color: '#EF4444', fontWeight: 'bold' }]}>
              RETESP 4L
            </Text>
          </TouchableOpacity>

          {stories.map((story) => {
            const isVideo = story.type === 'video' || !!story.video_url;
            const hasImage = !!story.image && !isVideo;
            
            return (
              <TouchableOpacity
                key={story.id}
                style={styles.storyItem}
                onPress={() => openStory(story)}
              >
                <View style={styles.storyAvatarWrapper}>
                  <View style={[styles.storyAvatar, { borderColor: isVideo ? '#8B5CF6' : colors.primary }]}>
                    {isVideo ? (
                      <View style={styles.storyVideoPlaceholder}>
                        <Icon name="play" size={24} color="#FFFFFF" />
                      </View>
                    ) : hasImage ? (
                      <Image source={{ uri: story.image }} style={styles.storyAvatarImage} />
                    ) : (
                      <View style={styles.storyAvatarDefault}>
                        <Text style={styles.storyAvatarText}>{story.user.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.storyUserName} numberOfLines={1}>
                  {story.user}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const StoryModal = () => {
    const isRETESP = selectedStory?.isFromRETESP || selectedStory?.user === 'RETESP 4L';
    const isVideo = selectedStory?.type === 'video' || !!selectedStory?.video_url;
    const videoUri = selectedStory?.video_url ? `${API_URL}${selectedStory.video_url}` : null;

    return (
      <Modal
        visible={storyModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setStoryModalVisible(false);
          setVideoError(false);
        }}
        statusBarTranslucent={true}
      >
        <View style={styles.storyModalContainer}>
          <TouchableOpacity
            style={styles.storyModalClose}
            onPress={() => {
              setStoryModalVisible(false);
              setVideoError(false);
            }}
          >
            <Icon name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          
          {selectedStory && (
            <View style={styles.storyModalContent}>
              <View style={styles.storyModalHeader}>
                {isRETESP ? (
                  <View style={styles.storyModalRETESP}>
                    <StatusLogo size={40} showText={true} />
                  </View>
                ) : (
                  <Text style={styles.storyModalUser}>{selectedStory.user}</Text>
                )}
              </View>
              
              <View style={styles.storyModalMedia}>
                {isVideo && videoUri && !videoError ? (
                  <View style={styles.storyVideoContainer}>
                    <VideoComponent 
                      uri={videoUri}
                      style={styles.storyModalVideo}
                      autoPlay={true}
                    />
                  </View>
                ) : selectedStory.image ? (
                  <Image source={{ uri: selectedStory.image }} style={styles.storyModalImage} resizeMode="contain" />
                ) : isRETESP ? (
                  <View style={styles.storyModalRETESPContent}>
                    <StatusLogo size={80} showText={true} />
                    <Text style={styles.storyModalRETESPDesc}>⚽ Gestão Esportiva</Text>
                  </View>
                ) : (
                  <View style={styles.storyModalEmpty}>
                    <Icon name="images" size={50} color={colors.textSecondary} />
                    <Text style={styles.storyModalEmptyText}>Sem mídia</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.storyModalButton}
                onPress={() => {
                  setStoryModalVisible(false);
                  setVideoError(false);
                }}
              >
                <Text style={styles.storyModalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  const ShareModal = () => (
    <Modal
      visible={shareModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShareModalVisible(false)}
    >
      <View style={styles.shareModalContainer}>
        <View style={styles.shareModalContent}>
          <Text style={styles.shareModalTitle}>📤 Compartilhar</Text>
          
          {selectedPost && (
            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => shareToStatus(selectedPost)}
              >
                <View style={[styles.shareIcon, { backgroundColor: '#8B5CF620' }]}>
                  <View style={styles.statusIcon}>
                    <View style={styles.statusGradient} />
                  </View>
                </View>
                <Text style={styles.shareLabel}>Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => shareToWhatsApp(selectedPost)}
              >
                <View style={[styles.shareIcon, { backgroundColor: '#25D36620' }]}>
                  <Icon name="logo-whatsapp" size={32} color="#25D366" />
                </View>
                <Text style={styles.shareLabel}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => shareToInstagram(selectedPost)}
              >
                <View style={[styles.shareIcon, { backgroundColor: '#E1306C20' }]}>
                  <Icon name="logo-instagram" size={32} color="#E1306C" />
                </View>
                <Text style={styles.shareLabel}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => shareToFacebook(selectedPost)}
              >
                <View style={[styles.shareIcon, { backgroundColor: '#1877F220' }]}>
                  <Icon name="logo-facebook" size={32} color="#1877F2" />
                </View>
                <Text style={styles.shareLabel}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => shareViaLink(selectedPost)}
              >
                <View style={[styles.shareIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Icon name="link" size={32} color={colors.primary} />
                </View>
                <Text style={styles.shareLabel}>Copiar Link</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.shareCancelButton}
            onPress={() => setShareModalVisible(false)}
          >
            <Text style={styles.shareCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📱 Rede Social</Text>
          <Text style={styles.headerSubtitle}>Compartilhe momentos da equipe</Text>
        </View>

        <StoriesComponent />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => filterByTeam(null)}
            style={[styles.filterButton, !selectedTeam && styles.filterButtonActive]}
          >
            <Text style={[styles.filterText, !selectedTeam && styles.filterTextActive]}>Todas</Text>
          </TouchableOpacity>
          {teams.map(team => (
            <TouchableOpacity
              key={team}
              onPress={() => filterByTeam(team)}
              style={[styles.filterButton, selectedTeam === team && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, selectedTeam === team && styles.filterTextActive]}>
                {team}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.createPost}>
          <View style={styles.createPostHeader}>
            <View style={styles.createPostAvatar}>
              <Text style={styles.createPostAvatarText}>📝</Text>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="O que está acontecendo?"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newPost.content}
              onChangeText={(text) => setNewPost({ ...newPost, content: text })}
            />
          </View>

          {(selectedImage || selectedVideo) && (
            <View style={styles.mediaPreviewContainer}>
              {selectedImage && (
                <View style={styles.mediaPreview}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeMedia}
                    onPress={() => removeMedia('image')}
                  >
                    <Icon name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
              {selectedVideo && (
                <View style={styles.mediaPreview}>
                  <View style={styles.previewVideo}>
                    <Icon name="play-circle" size={32} color={colors.primary} />
                  </View>
                  <TouchableOpacity
                    style={styles.removeMedia}
                    onPress={() => removeMedia('video')}
                  >
                    <Icon name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.postActions}>
            <View style={styles.mediaButtons}>
              <TouchableOpacity onPress={handleImagePicker} disabled={uploading}>
                <Icon name="image" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVideoPicker} disabled={uploading}>
                <Icon name="videocam" size={24} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            <View style={styles.postRightActions}>
              <TouchableOpacity
                style={styles.postButton}
                onPress={createPost}
                disabled={creating || uploading}
              >
                {creating || uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.postButtonText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {filteredPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {post.author_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{post.author_name}</Text>
                  <Text style={styles.authorTeam}>{post.team_name}</Text>
                </View>
              </View>
              <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {post.image_url && (
              <Image
                source={{ uri: `${API_URL}${post.image_url}` }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            {post.video_url && (
              <View style={styles.videoContainer}>
                <VideoComponent uri={`${API_URL}${post.video_url}`} autoPlay={false} />
              </View>
            )}

            <View style={styles.postFooter}>
              <TouchableOpacity
                style={styles.postAction}
                onPress={() => toggleLike(post.id)}
              >
                <Icon name="heart" size={20} color="#EF4444" />
                <Text style={styles.postActionText}>{likes[post.id] || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.postAction}>
                <Icon name="chatbubble" size={20} color={colors.textSecondary} />
                <Text style={styles.postActionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.postAction}
                onPress={() => handleShare(post)}
              >
                <Icon name="share-social" size={20} color={colors.primary} />
                <Text style={styles.postActionText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <StoryModal />
      <ShareModal />
    </View>
  );
}
