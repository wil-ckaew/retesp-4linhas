import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isAI?: boolean;
  isTyping?: boolean;
}

const API_URL = 'http://192.168.0.25:8081';

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'IA Assistente',
      text: 'Olá! Sou sua assistente IA do Projeto 4 Linhas. Como posso ajudar você hoje? 💬',
      time: new Date().toLocaleTimeString(),
      isAI: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerText: {
      flex: 1,
      marginLeft: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
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
    messagesList: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexGrow: 1,
    },
    messageContainer: {
      marginBottom: 12,
    },
    messageLeft: {
      alignItems: 'flex-start',
    },
    messageRight: {
      alignItems: 'flex-end',
    },
    aiBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
      marginLeft: 4,
    },
    aiBadgeText: {
      fontSize: 9,
      color: '#a78bfa',
      marginLeft: 4,
    },
    messageBubble: {
      maxWidth: '85%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    bubbleLeft: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleRight: {
      backgroundColor: '#4f46e5',
    },
    typingBubble: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
      marginRight: 4,
    },
    dotDelay1: {
      opacity: 0.6,
    },
    dotDelay2: {
      opacity: 1,
    },
    messageText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    timeText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
      marginHorizontal: 4,
    },
    quickQuestionsContainer: {
      maxHeight: 44,
      marginBottom: 8,
    },
    quickQuestionsContent: {
      paddingHorizontal: 16,
    },
    quickQuestionButton: {
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    quickQuestionText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
    },
    sendButton: {
      backgroundColor: '#4f46e5',
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#374151',
      opacity: 0.5,
    },
  });

  const quickQuestions = [
    'Dicas para começar o treino',
    'Treino de passe',
    'Treino de finalização',
    'Posse de bola',
    'Plano de treino',
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = messageText;
    const newMsg: Message = {
      id: Date.now().toString(),
      user: 'Eu',
      text: userMessage,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    const typingMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: typingMsgId,
        user: 'IA Assistente',
        text: 'digitando...',
        time: new Date().toLocaleTimeString(),
        isAI: true,
        isTyping: true,
      },
    ]);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: messages.slice(-5),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response || 'Desculpe, não entendi. Pode reformular?';

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === typingMsgId
              ? { ...msg, text: aiResponse, isTyping: false }
              : msg
          )
        );
      } else {
        throw new Error('Erro na API');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMsgId));
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          user: 'IA Assistente',
          text: '⚠️ Desculpe, tive um problema. Pode repetir sua pergunta?',
          time: new Date().toLocaleTimeString(),
          isAI: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.user === 'Eu' ? styles.messageRight : styles.messageLeft,
      ]}
    >
      {item.isAI && (
        <View style={styles.aiBadge}>
          <Icon name="cpu" size={12} color="#a78bfa" />
          <Text style={styles.aiBadgeText}>IA</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.user === 'Eu' ? styles.bubbleRight : styles.bubbleLeft,
          item.isTyping && styles.typingBubble,
        ]}
      >
        {item.isTyping ? (
          <View style={styles.typingContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotDelay1]} />
            <View style={[styles.dot, styles.dotDelay2]} />
          </View>
        ) : (
          <Text style={[styles.messageText, item.user === 'Eu' && { color: '#fff' }]}>
            {item.text}
          </Text>
        )}
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );

  const renderQuickQuestions = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickQuestionsContainer}
      contentContainerStyle={styles.quickQuestionsContent}
    >
      {quickQuestions.map((q, i) => (
        <TouchableOpacity
          key={i}
          style={styles.quickQuestionButton}
          onPress={() => sendMessage(q)}
        >
          <Text style={styles.quickQuestionText}>{q}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Icon name="brain" size={24} color="#a78bfa" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Chat IA</Text>
            <Text style={styles.headerSubtitle}>Projeto 4 Linhas</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {renderQuickQuestions()}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua pergunta..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
