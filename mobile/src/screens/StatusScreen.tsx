import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '../services/api';
import Video from 'react-native-video';
import { useStatus } from '../context/StatusContext';

interface Story {
  id: number;
  user: string;
  image?: string;
  video_url?: string;
  type: 'image' | 'video';
}

const { width, height } = Dimensions.get('window');

export default function StatusScreen() {
  const { stories, addStory } = useStatus();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setProgress(0);
    setIsPlaying(true);
    setModalVisible(true);
  };

  const closeStory = () => {
    setModalVisible(false);
    setSelectedStory(null);
    StatusBar.setHidden(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const nextStory = () => {
    if (stories.length > 0) {
      const currentIdx = stories.findIndex(s => s.id === selectedStory?.id);
      if (currentIdx < stories.length - 1) {
        setSelectedStory(stories[currentIdx + 1]);
        setProgress(0);
        setIsPlaying(true);
      } else {
        closeStory();
      }
    }
  };

  // Progresso automático para imagens
  useEffect(() => {
    if (modalVisible && selectedStory && selectedStory.type === 'image') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setProgress(0);
      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [modalVisible, selectedStory]);

  const renderStoryCircle = (story: Story) => (
    <TouchableOpacity
      key={story.id}
      style={styles.storyCircle}
      onPress={() => openStory(story)}
      activeOpacity={0.8}
    >
      <View style={styles.storyBorder}>
        {story.type === 'video' ? (
          <View style={styles.storyVideoCircle}>
            <Icon name="play" size={24} color="#FFFFFF" />
          </View>
        ) : (
          <Image
            source={{ uri: story.image }}
            style={styles.storyAvatar}
          />
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {story.user.length > 8 ? story.user.substring(0, 8) + '...' : story.user}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
      >
        {stories.map(renderStoryCircle)}
      </ScrollView>

      {/* Modal do Story */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeStory}
        statusBarTranslucent={true}
      >
        <StatusBar hidden={true} />
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={closeStory}
          >
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalNext}
            onPress={nextStory}
          />

          {selectedStory && (
            <View style={styles.storyContent}>
              {selectedStory.type === 'video' ? (
                <Video
                  ref={videoRef}
                  source={{ uri: `${API_URL}${selectedStory.video_url}` }}
                  style={styles.storyVideo}
                  resizeMode="contain"
                  controls={true}
                  paused={!isPlaying}
                  repeat={false}
                  onLoad={() => setIsPlaying(true)}
                  onEnd={() => nextStory()}
                  onError={(error) => {
                    console.log('Erro no vídeo:', error);
                    Alert.alert('Erro', 'Não foi possível carregar o vídeo');
                    closeStory();
                  }}
                  bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000,
                  }}
                />
              ) : (
                <Image
                  source={{ uri: selectedStory.image }}
                  style={styles.storyImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.storyHeader}>
                <Text style={styles.storyUser}>{selectedStory.user}</Text>
                <Text style={styles.storyTime}>Agora</Text>
              </View>

              {/* Barra de Progresso */}
              {selectedStory.type === 'image' && (
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  storyCircle: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  storyVideoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  storyName: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 64,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  modalNext: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
  storyContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: width,
    height: height * 0.8,
  },
  storyVideo: {
    width: width,
    height: height * 0.8,
    backgroundColor: '#000000',
  },
  storyHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyUser: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  storyTime: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 8,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
});
