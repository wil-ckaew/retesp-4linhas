//mobile/src/screens/AthleteDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PDFViewer from '../components/PDFViewerExpo';
import PhotoViewer from '../components/PhotoViewer';

interface Athlete {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
}

interface AttendanceRecord {
  date: string;
  present: boolean;
}

export default function AthleteDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors } = useTheme();
  const { id } = route.params as { id: string };

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string>('');

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string>('');

  useEffect(() => {
    const fetchAthlete = async () => {
      if (!id) return;

      try {
        const res = await fetch(`${API_URL}/athletes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAthlete(data);
        } else {
          Alert.alert('❌ Erro', 'Erro ao buscar dados do atleta.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erro:', error);
        Alert.alert('❌ Erro', 'Erro de comunicação.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAthlete();
    }
  }, [id]);

  const fetchAttendanceHistory = async () => {
    if (!id) return;

    setAttendanceLoading(true);
    try {
      const res = await fetch(`${API_URL}/attendance/athlete/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(data);
        setShowAttendance(true);
      } else {
        Alert.alert('❌ Erro', 'Erro ao buscar histórico de presenças.');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('❌ Erro', 'Erro ao buscar histórico.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '⚠️ Confirmar exclusão',
      'Tem certeza que deseja excluir este atleta?',
      [
        { text: '❌ Cancelar', style: 'cancel' },
        {
          text: '🗑️ Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/athletes/${id}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                Alert.alert('✅ Sucesso', 'Atleta excluído com sucesso!');
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Main',
                        state: {
                          index: 0,
                          routes: [{ name: 'Atletas' }],
                        },
                      },
                    ],
                  })
                );
              } else {
                Alert.alert('❌ Erro', 'Erro ao excluir atleta.');
              }
            } catch (error) {
              console.error('Erro:', error);
              Alert.alert('❌ Erro', 'Erro de comunicação.');
            }
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const totalAttendance = attendanceHistory.length;
  const presentCount = attendanceHistory.filter((a) => a.present).length;
  const absentCount = totalAttendance - presentCount;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const getAvatarUrl = (avatar_url: string | null): string | null => {
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

  const openPDF = (url: string | null, name: string) => {
    if (!url) {
      Alert.alert('❌ Erro', 'Nenhum PDF disponível para este atleta');
      return;
    }
    setSelectedPdfUrl(url);
    setSelectedPdfName(name);
    setPdfModalVisible(true);
  };

  const openPhoto = (url: string | null, name: string) => {
    if (!url) {
      Alert.alert('❌ Erro', 'Nenhuma foto disponível para este atleta');
      return;
    }
    setSelectedPhotoUrl(url);
    setSelectedPhotoName(name);
    setPhotoModalVisible(true);
  };

  // CORREÇÃO: Função para navegar para a tela de chamada
  const goToAttendance = () => {
    // Tenta navegar para a tela de chamada
    // O nome da rota pode ser 'Attendance', 'AttendanceScreen' ou 'Chamada'
    try {
      navigation.navigate('Attendance');
    } catch (e) {
      try {
        navigation.navigate('AttendanceScreen');
      } catch (e2) {
        try {
          navigation.navigate('Chamada');
        } catch (e3) {
          Alert.alert('Erro', 'Tela de chamada não encontrada');
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>⏳ Carregando dados do atleta...</Text>
      </View>
    );
  }

  if (!athlete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>❌ Atleta não encontrado.</Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 16 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    backButton: { padding: 8 },
    headerRight: { flexDirection: 'row', gap: 8 },
    headerTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardHeader: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    avatarImage: {
      width: 80,
      height: 80,
      resizeMode: 'cover',
    },
    name: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12 },
    infoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { color: colors.textSecondary, fontSize: 14 },
    infoTextHighlight: { color: colors.primary, fontSize: 14 },
    content: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    gridLabel: { color: colors.textSecondary, fontSize: 12 },
    gridValue: { color: colors.text, fontSize: 16, fontWeight: '500', marginTop: 4 },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    docLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    docText: { color: colors.text, fontSize: 14 },
    docSub: { color: colors.textSecondary, fontSize: 12 },
    docButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    docButtonText: { color: '#FFFFFF', fontSize: 12 },
    attendanceSection: { marginTop: 16 },
    attendanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    closeButton: { padding: 4 },
    statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statItem: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statValue: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    statLabel: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
    statValueGreen: { color: '#22c55e' },
    statValueRed: { color: '#ef4444' },
    statValueBlue: { color: colors.primary },
    historyList: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 200,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyDate: { color: colors.text, fontSize: 14 },
    historyStatus: { fontSize: 14 },
    historyStatusPresent: { color: '#22c55e' },
    historyStatusAbsent: { color: '#ef4444' },
    historyDay: { color: colors.textSecondary, fontSize: 12 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    actionButtonBlue: { backgroundColor: colors.primary },
    actionButtonPurple: { backgroundColor: '#8B5CF6' },
    actionButtonGreen: { backgroundColor: '#22c55e' },
    actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    emojiIcon: { fontSize: 16, width: 24, textAlign: 'center' },
    emojiIconLarge: { fontSize: 22, width: 32, textAlign: 'center' },
    emojiIconSmall: { fontSize: 14, width: 20, textAlign: 'center' },
    emojiIconGrid: { fontSize: 16, marginRight: 4 },
  });

  const avatarImageUrl = getAvatarUrl(athlete.avatar_url);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Detalhes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('EditAthlete', { id })}>
            <Icon name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Icon name="trash" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card do Atleta */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => openPhoto(athlete.avatar_url, athlete.name)}
            disabled={!athlete.avatar_url}
          >
            {avatarImageUrl ? (
              <Image source={{ uri: avatarImageUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{athlete.name.charAt(0).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{athlete.name}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.emojiIcon}>🏷️</Text>
              <Text style={styles.infoTextHighlight}>{athlete.category}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.emojiIcon}>📅</Text>
              <Text style={styles.infoText}>
                {new Date(athlete.birth_date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.emojiIcon}>🎂</Text>
              <Text style={styles.infoText}>{calculateAge(athlete.birth_date)} anos</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={fetchAttendanceHistory}
            style={{ marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFFFFF' }}>
              {attendanceLoading ? '⏳ Carregando...' : '📊 Verificar Presença'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informações detalhadas */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>📋 Informações do Atleta</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.emojiIconGrid}>🏷️</Text> Categoria
              </Text>
              <Text style={styles.gridValue}>{athlete.category}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.emojiIconGrid}>📅</Text> Data de Nascimento
              </Text>
              <Text style={styles.gridValue}>
                {new Date(athlete.birth_date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.emojiIconGrid}>🎂</Text> Idade
              </Text>
              <Text style={styles.gridValue}>{calculateAge(athlete.birth_date)} anos</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={styles.emojiIconGrid}>✅</Text> Status
              </Text>
              <Text style={[styles.gridValue, { color: '#22c55e' }]}>Ativo</Text>
            </View>
          </View>

          {/* Documentos */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>📄 Documentos</Text>
          
          <View style={styles.docItem}>
            <View style={styles.docLeft}>
              <Text style={{ fontSize: 24 }}>📄</Text>
              <View>
                <Text style={styles.docText}>Ficha Médica</Text>
                <Text style={styles.docSub}>
                  {athlete.medical_form_url ? '✅ Documento anexado' : '❌ Nenhum documento anexado'}
                </Text>
              </View>
            </View>
            {athlete.medical_form_url && (
              <TouchableOpacity 
                style={styles.docButton}
                onPress={() => openPDF(athlete.medical_form_url, `Ficha Médica - ${athlete.name}`)}
              >
                <Text style={styles.docButtonText}>👁️ Visualizar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.docItem}>
            <View style={styles.docLeft}>
              <Text style={{ fontSize: 24 }}>📸</Text>
              <View>
                <Text style={styles.docText}>Foto do Atleta</Text>
                <Text style={styles.docSub}>
                  {athlete.avatar_url ? '✅ Foto anexada' : '❌ Nenhuma foto anexada'}
                </Text>
              </View>
            </View>
            {athlete.avatar_url && (
              <TouchableOpacity 
                style={styles.docButton}
                onPress={() => openPhoto(athlete.avatar_url, athlete.name)}
              >
                <Text style={styles.docButtonText}>👁️ Visualizar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Histórico de Presenças */}
          {showAttendance && (
            <View style={styles.attendanceSection}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.sectionTitle}>📊 Histórico de Presenças</Text>
                <TouchableOpacity onPress={() => setShowAttendance(false)}>
                  <Text style={{ fontSize: 20 }}>✖️</Text>
                </TouchableOpacity>
              </View>

              {attendanceLoading ? (
                <Text style={{ color: colors.textSecondary }}>⏳ Carregando histórico...</Text>
              ) : attendanceHistory.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 40 }}>📭</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                    Nenhum registro de presença encontrado
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{totalAttendance}</Text>
                      <Text style={styles.statLabel}>📊 Total</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, styles.statValueGreen]}>{presentCount}</Text>
                      <Text style={styles.statLabel}>✅ Presentes</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, styles.statValueRed]}>{absentCount}</Text>
                      <Text style={styles.statLabel}>❌ Faltas</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statValue,
                          attendanceRate >= 75
                            ? styles.statValueGreen
                            : attendanceRate >= 50
                            ? { color: '#eab308' }
                            : styles.statValueRed,
                        ]}
                      >
                        {attendanceRate}%
                      </Text>
                      <Text style={styles.statLabel}>📈 Frequência</Text>
                    </View>
                  </View>

                  <View style={styles.historyList}>
                    {attendanceHistory.map((record, index) => {
                      const date = new Date(record.date);
                      return (
                        <View key={index} style={styles.historyItem}>
                          <Text style={styles.historyDate}>
                            {date.toLocaleDateString('pt-BR')}
                          </Text>
                          <Text
                            style={[
                              styles.historyStatus,
                              record.present
                                ? styles.historyStatusPresent
                                : styles.historyStatusAbsent,
                            ]}
                          >
                            {record.present ? '✅ Presente' : '❌ Faltou'}
                          </Text>
                          <Text style={styles.historyDay}>{weekDays[date.getDay()]}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Botões rápidos - CORRIGIDO */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonBlue]}
              onPress={fetchAttendanceHistory}
            >
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>📊</Text>
              <Text style={styles.actionButtonText}>Presenças</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPurple]}
              onPress={goToAttendance}  // <-- CORRIGIDO: usa a função que tenta múltiplos nomes de rota
            >
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>📋</Text>
              <Text style={styles.actionButtonText}>Chamada</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonGreen]}
              onPress={() => navigation.navigate('EditAthlete', { id })}
            >
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>✏️</Text>
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* PDF Viewer */}
      <PDFViewer
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        pdfUrl={selectedPdfUrl}
        fileName={selectedPdfName}
      />

      {/* Photo Viewer */}
      <PhotoViewer
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        photoUrl={selectedPhotoUrl}
        athleteName={selectedPhotoName}
      />
    </ScrollView>
  );
}