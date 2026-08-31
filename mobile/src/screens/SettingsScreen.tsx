import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

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
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    content: {
      padding: 16,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionRowLast: {
      borderBottomWidth: 0,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    optionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    themeContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    themeOption: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    themeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    themeOptionText: {
      fontSize: 12,
      color: colors.text,
      marginTop: 4,
    },
    themeOptionTextActive: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    themeIcon: {
      fontSize: 24,
    },
    previewContainer: {
      marginTop: 12,
      padding: 16,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewText: {
      color: colors.text,
      fontSize: 14,
    },
    previewTextSecondary: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    previewCard: {
      marginTop: 8,
      padding: 12,
      borderRadius: 6,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: colors.primary + '30',
    },
    badgeText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: 'bold',
    },
    dangerButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#ef444420',
      borderWidth: 1,
      borderColor: '#ef444430',
      alignItems: 'center',
    },
    dangerButtonText: {
      color: '#ef4444',
      fontWeight: 'bold',
    },
    footer: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 8,
      marginBottom: 30,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Configurações</Text>
        <Text style={styles.headerSubtitle}>Gerencie suas preferências</Text>
      </View>

      <View style={styles.content}>
        {/* Tema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Aparência</Text>
          
          <View style={styles.themeContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'dark' && styles.themeOptionActive,
              ]}
              onPress={() => {
                if (theme !== 'dark') toggleTheme();
              }}
            >
              <Text style={styles.themeIcon}>🌙</Text>
              <Text
                style={[
                  styles.themeOptionText,
                  theme === 'dark' && styles.themeOptionTextActive,
                ]}
              >
                Escuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'light' && styles.themeOptionActive,
              ]}
              onPress={() => {
                if (theme !== 'light') toggleTheme();
              }}
            >
              <Text style={styles.themeIcon}>☀️</Text>
              <Text
                style={[
                  styles.themeOptionText,
                  theme === 'light' && styles.themeOptionTextActive,
                ]}
              >
                Claro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preview do tema */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Visualização do tema</Text>
            <View style={styles.previewCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={[styles.previewText, { fontWeight: 'bold' }]}>
                    Exemplo de texto
                  </Text>
                  <Text style={styles.previewTextSecondary}>
                    Texto secundário
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Destaque</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notificações</Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Icon name="bell" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.optionText}>Notificações push</Text>
                <Text style={styles.optionDescription}>Receber alertas</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? '#fff' : '#fff'}
            />
          </View>

          <View style={[styles.optionRow, styles.optionRowLast]}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Icon name="volume-2" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.optionText}>Som</Text>
                <Text style={styles.optionDescription}>Alertas sonoros</Text>
              </View>
            </View>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={sound ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Ações</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Resetar Configurações',
                'Deseja resetar todas as configurações?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Resetar', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Sucesso', 'Configurações resetadas!');
                    }
                  },
                ]
              );
            }}
          >
            <Text style={styles.dangerButtonText}>Resetar Configurações</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>RETESP 4L • v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
