import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      padding: 16,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      color: colors.primary,
      fontWeight: 'bold',
    },
    profileName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    menuItemHighlight: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.card,
    },
    menuIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    menuIconPurple: {
      backgroundColor: isDark ? '#a78bfa30' : '#a78bfa20',
    },
    menuIconGreen: {
      backgroundColor: isDark ? '#22c55e30' : '#22c55e20',
    },
    menuIconRed: {
      backgroundColor: isDark ? '#ef444430' : '#ef444420',
    },
    menuIconBlue: {
      backgroundColor: isDark ? '#3b82f630' : '#3b82f620',
    },
    menuIconOrange: {
      backgroundColor: isDark ? '#f59e0b30' : '#f59e0b20',
    },
    menuIconPink: {
      backgroundColor: isDark ? '#ec489930' : '#ec489920',
    },
    menuIconTeal: {
      backgroundColor: isDark ? '#14b8a630' : '#14b8a620',
    },
    menuText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    menuTextPurple: {
      color: '#a78bfa',
      fontWeight: '600',
    },
    menuTextGreen: {
      color: '#22c55e',
      fontWeight: '600',
    },
    menuTextRed: {
      color: '#ef4444',
      fontWeight: '600',
    },
    menuTextBlue: {
      color: '#3b82f6',
      fontWeight: '600',
    },
    menuArrow: {
      color: colors.textSecondary,
    },
    newBadge: {
      backgroundColor: '#a78bfa',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 8,
    },
    newBadgeText: {
      fontSize: 8,
      color: '#fff',
      fontWeight: 'bold',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    versionText: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 20,
      marginBottom: 30,
    },
    menuEmoji: {
      fontSize: 22,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Perfil</Text>
      </View>

      <View style={styles.content}>
        {/* Card do Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>⚽</Text>
          </View>
          <Text style={styles.profileName}>Administrador</Text>
          <Text style={styles.profileEmail}>admin@retesp.com</Text>
        </View>

        {/* ====== SEÇÃO TREINOS ====== */}
        <Text style={styles.sectionTitle}>⚽ Treinos</Text>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemHighlight]}
          onPress={() => navigation.navigate('TrainingsScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconBlue]}>
            <Text style={styles.menuEmoji}>📋</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextBlue]}>
            Treinos
          </Text>
          <Icon name="chevron-forward" size={20} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemHighlight]}
          onPress={() => navigation.navigate('RankingScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconPurple]}>
            <Text style={styles.menuEmoji}>🏆</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextPurple]}>
            Ranking
          </Text>
          <Icon name="chevron-forward" size={20} color="#a78bfa" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ====== SEÇÃO IA ====== */}
        <Text style={styles.sectionTitle}>🤖 Inteligência Artificial</Text>

        {/* Chat IA */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemHighlight]}
          onPress={() => navigation.navigate('ChatScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconPurple]}>
            <Text style={styles.menuEmoji}>💬</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextPurple]}>
            Chat IA
          </Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOVO</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#a78bfa" />
        </TouchableOpacity>

        {/* IA Treinos */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemHighlight]}
          onPress={() => navigation.navigate('AIScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconPurple]}>
            <Text style={styles.menuEmoji}>🧠</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextPurple]}>
            IA Treinos
          </Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOVO</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#a78bfa" />
        </TouchableOpacity>

        {/* Moderação */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemHighlight]}
          onPress={() => navigation.navigate('ModerationScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconPurple]}>
            <Text style={styles.menuEmoji}>🛡️</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextPurple]}>
            Moderação
          </Text>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOVO</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#a78bfa" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ====== SEÇÃO CONFIGURAÇÕES ====== */}
        <Text style={styles.sectionTitle}>⚙️ Configurações</Text>

        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.primary, borderWidth: 2 }]}
          onPress={() => navigation.navigate('SettingsScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconBlue]}>
            <Text style={styles.menuEmoji}>⚙️</Text>
          </View>
          <Text style={[styles.menuText, { color: colors.primary, fontWeight: 'bold' }]}>
            Configurações
          </Text>
          <Icon name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* ====== SEÇÃO GESTÃO ====== */}
        <Text style={styles.sectionTitle}>📋 Gestão</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TeamsScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconBlue]}>
            <Text style={styles.menuEmoji}>👥</Text>
          </View>
          <Text style={styles.menuText}>Turmas</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('CoachesScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconGreen]}>
            <Text style={styles.menuEmoji}>👨‍🏫</Text>
          </View>
          <Text style={styles.menuText}>Professores</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ParentsPortalScreen' as never)}
        >
          <View style={[styles.menuIcon, styles.menuIconOrange]}>
            <Text style={styles.menuEmoji}>👨‍👩‍👦</Text>
          </View>
          <Text style={styles.menuText}>Portal Pais</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ====== SAIR ====== */}
        <TouchableOpacity
          style={[styles.menuItem, { borderColor: '#ef444430', borderWidth: 1 }]}
          onPress={() => {
            Alert.alert('Sair', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive' },
            ]);
          }}
        >
          <View style={[styles.menuIcon, styles.menuIconRed]}>
            <Text style={styles.menuEmoji}>🚪</Text>
          </View>
          <Text style={[styles.menuText, styles.menuTextRed]}>Sair</Text>
          <Icon name="chevron-forward" size={20} color="#ef4444" />
        </TouchableOpacity>

        <Text style={styles.versionText}>⚽ RETESP 4L • v2.0.0 • IA Integrada</Text>
      </View>
    </ScrollView>
  );
}
