// mobile/src/context/StatusContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Story {
  id: number;
  user: string;
  image?: string;
  video_url?: string;
  type: 'image' | 'video';
  isFromRETESP?: boolean;
  expiresAt?: number;
}

interface StatusContextData {
  stories: Story[];
  addStory: (story: Story) => void;
  clearStories: () => void;
  fetchStories: () => Promise<void>;
  addStoryToBackend: (story: Story) => Promise<void>;
  deleteExpiredStories: () => void;
}

const StatusContext = createContext<StatusContextData>({} as StatusContextData);

export const useStatus = () => useContext(StatusContext);

interface StatusProviderProps {
  children: ReactNode;
}

export const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);

  // Carregar stories salvos localmente
  const loadLocalStories = async () => {
    try {
      const saved = await AsyncStorage.getItem('@stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        setStories(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar stories locais:', error);
    }
  };

  // Salvar stories localmente
  const saveLocalStories = async (newStories: Story[]) => {
    try {
      await AsyncStorage.setItem('@stories', JSON.stringify(newStories));
    } catch (error) {
      console.error('Erro ao salvar stories:', error);
    }
  };

  // Buscar stories do backend
  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_URL}/social/stories?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const backendStories: Story[] = data.map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            user: item.user || 'Usuário',
            image: item.image || undefined,
            video_url: item.video_url || undefined,
            type: item.video_url ? 'video' : 'image',
            isFromRETESP: item.isFromRETESP || false,
            expiresAt: item.expiresAt || Date.now() + 24 * 60 * 60 * 1000,
          }));
          
          setStories(prev => {
            // Manter stories locais que não existem no backend
            const existingIds = new Set(backendStories.map(s => s.id));
            const localStories = prev.filter(s => !existingIds.has(s.id));
            const allStories = [...backendStories, ...localStories];
            saveLocalStories(allStories);
            return allStories;
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar stories:', error);
      await loadLocalStories();
    }
  };

  // Adicionar story ao backend
  const addStoryToBackend = async (story: Story) => {
    const storyWithExpiry = {
      ...story,
      isFromRETESP: true,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    try {
      const res = await fetch(`${API_URL}/social/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: storyWithExpiry.user,
          image: storyWithExpiry.image,
          video_url: storyWithExpiry.video_url,
          type: storyWithExpiry.type,
          isFromRETESP: storyWithExpiry.isFromRETESP,
          expiresAt: storyWithExpiry.expiresAt,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedStory = { 
          ...storyWithExpiry, 
          id: data.id || storyWithExpiry.id,
          video_url: storyWithExpiry.video_url,
        };
        addStory(updatedStory);
        return;
      }
    } catch (error) {
      console.error('Erro ao salvar story no backend:', error);
    }
    
    // Se falhar, salvar localmente
    addStory(storyWithExpiry);
  };

  // Adicionar story localmente
  const addStory = (story: Story) => {
    setStories(prev => {
      const exists = prev.some(s => s.id === story.id);
      let newStories;
      if (exists) {
        newStories = prev.map(s => s.id === story.id ? { ...s, ...story } : s);
      } else {
        newStories = [story, ...prev];
      }
      saveLocalStories(newStories);
      return newStories;
    });
  };

  // Remover stories expirados
  const deleteExpiredStories = () => {
    const now = Date.now();
    setStories(prev => {
      const filtered = prev.filter(s => !s.expiresAt || s.expiresAt > now);
      saveLocalStories(filtered);
      return filtered;
    });
  };

  const clearStories = () => {
    setStories([]);
    saveLocalStories([]);
  };

  // Carregar stories ao iniciar
  useEffect(() => {
    loadLocalStories();
    fetchStories();
    
    const interval = setInterval(deleteExpiredStories, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StatusContext.Provider 
      value={{ 
        stories, 
        addStory, 
        clearStories, 
        fetchStories,
        addStoryToBackend,
        deleteExpiredStories,
      }}
    >
      {children}
    </StatusContext.Provider>
  );
};