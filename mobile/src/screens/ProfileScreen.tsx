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
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    menuArrow: {
      color: colors.textSecondary,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <View style={styles.content}>
        {/* Card do Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.profileName}>Administrador</Text>
          <Text style={styles.profileEmail}>admin@retesp.com</Text>
        </View>

        {/* Menu de Configurações - DESTAQUE */}
        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.primary, borderWidth: 2 }]}
          onPress={() => navigation.navigate('SettingsScreen' as never)}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="settings" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: colors.primary, fontWeight: 'bold' }]}>
            ⚙️ Configurações
          </Text>
          <Icon name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Outros menus */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TeamsScreen' as never)}
        >
          <View style={styles.menuIcon}>
            <Icon name="people" size={24} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Turmas</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('CoachesScreen' as never)}
        >
          <View style={styles.menuIcon}>
            <Icon name="person" size={24} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Professores</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ParentsPortalScreen' as never)}
        >
          <View style={styles.menuIcon}>
            <Icon name="people-circle" size={24} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>Portal Pais</Text>
          <Icon name="chevron-forward" size={20} color={styles.menuArrow.color} />
        </TouchableOpacity>

        {/* Sair */}
        <TouchableOpacity
          style={[styles.menuItem, { borderColor: '#ef444430', borderWidth: 1 }]}
          onPress={() => {
            Alert.alert('Sair', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive' },
            ]);
          }}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#ef444420' }]}>
            <Icon name="log-out" size={24} color="#ef4444" />
          </View>
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Sair</Text>
          <Icon name="chevron-forward" size={20} color="#ef4444" />
        </TouchableOpacity>

        <Text style={{ 
          textAlign: 'center', 
          color: colors.textSecondary,
          fontSize: 12,
          marginTop: 20,
          marginBottom: 30,
        }}>
          RETESP 4L • v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
