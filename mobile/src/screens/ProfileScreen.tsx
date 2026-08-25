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
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const menuItems = [
    { 
      icon: 'business', 
      label: 'Turmas', 
      screen: 'TeamsScreen',
      color: '#8B5CF6'
    },
    { 
      icon: 'school', 
      label: 'Professores', 
      screen: 'CoachesScreen',
      color: '#10B981'
    },
    { 
      icon: 'people-circle', 
      label: 'Portal dos Pais', 
      screen: 'ParentsPortalScreen',
      color: '#F59E0B'
    },
  ];

  const handleNavigate = (screen: string) => {
    console.log('Navegando para:', screen);
    // @ts-ignore
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sucesso', 'Logout realizado com sucesso!');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
        <Text style={styles.name}>Administrador</Text>
        <Text style={styles.email}>admin@retesp.com</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Administrador</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleNavigate(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Configurações</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Icon name="notifications" size={22} color="#9CA3AF" />
            <Text style={styles.settingLabel}>Notificações</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#30363D', true: '#3B82F6' }}
            thumbColor={notifications ? '#FFFFFF' : '#6B7280'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Icon name="moon" size={22} color="#9CA3AF" />
            <Text style={styles.settingLabel}>Modo Escuro</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#30363D', true: '#3B82F6' }}
            thumbColor={darkMode ? '#FFFFFF' : '#6B7280'}
          />
        </View>
      </View>

      <Text style={styles.version}>RETESP 4L v1.0.0</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#161B22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#161B22',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: '#161B22',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    padding: 14,
  },
  settingsTitle: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  version: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161B22',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444440',
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
