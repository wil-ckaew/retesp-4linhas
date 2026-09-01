import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar, Image, View, Text, Platform } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Telas principais
import DashboardScreen from './src/screens/DashboardScreen';
import AthletesScreen from './src/screens/AthletesScreen';
import AthleteDetailsScreen from './src/screens/AthleteDetailsScreen';
import CreateAthleteScreen from './src/screens/CreateAthleteScreen';
import EditAthleteScreen from './src/screens/EditAthleteScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import MediaScreen from './src/screens/MediaScreen';
import VideosScreen from './src/screens/VideosScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import CoachesScreen from './src/screens/CoachesScreen';
import ParentsPortalScreen from './src/screens/ParentsPortalScreen';
import SocialScreen from './src/screens/SocialScreen';
import TrainingsScreen from './src/screens/TrainingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RankingScreen from './src/screens/RankingScreen';

// Telas de IA (agora só no perfil)
import ChatScreen from './src/screens/ChatScreen';
import AIScreen from './src/screens/AIScreen';
import ModerationScreen from './src/screens/ModerationScreen';

// Contexto para Status (Stories)
import { StatusProvider } from './src/context/StatusContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Componente de Logo com tema
function LogoTitle() {
  const { colors } = useTheme();
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ 
        width: 40, 
        height: 40, 
        borderRadius: 10, 
        overflow: 'hidden',
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        padding: 4,
      }}>
        <Image 
          source={require('./assets/logo.png')} 
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '900', letterSpacing: -0.5, lineHeight: 20 }}>
          RETESP
        </Text>
        <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold', lineHeight: 13 }}>
          4 Linhas
        </Text>
      </View>
    </View>
  );
}

// Stack para Perfil com IA e Treinos
function ProfileStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="TeamsScreen" 
        component={TeamsScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="CoachesScreen" 
        component={CoachesScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="ParentsPortalScreen" 
        component={ParentsPortalScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="RankingScreen" 
        component={RankingScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="TrainingsScreen" 
        component={TrainingsScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          title: 'Treinos'
        }}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          title: 'Chat IA'
        }}
      />
      <Stack.Screen 
        name="AIScreen" 
        component={AIScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          title: 'IA Treinos'
        }}
      />
      <Stack.Screen 
        name="ModerationScreen" 
        component={ModerationScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          title: 'Moderação'
        }}
      />
    </Stack.Navigator>
  );
}

function AthletesStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="AthletesList" 
        component={AthletesScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="AthleteDetails" 
        component={AthleteDetailsScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="CreateAthlete" 
        component={CreateAthleteScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditAthlete" 
        component={EditAthleteScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function MediaStack() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="MediaList" 
        component={MediaScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
      <Stack.Screen 
        name="VideosList" 
        component={VideosScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
    </Stack.Navigator>
  );
}

// Componente para o ícone com emoji em cima
function TabBarIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: -2,
    }}>
      <Text style={{ 
        fontSize: 24, 
        opacity: focused ? 1 : 0.6,
        transform: [{ scale: focused ? 1.1 : 1 }],
      }}>
        {emoji}
      </Text>
    </View>
  );
}

function MainTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let emoji = '';
          if (route.name === 'Dashboard') emoji = '📊';
          else if (route.name === 'Atletas') emoji = '👥';
          else if (route.name === 'Chamada') emoji = '✅';
          else if (route.name === 'Vídeos') emoji = '🎬';
          else if (route.name === 'Social') emoji = '📱';
          else if (route.name === 'Ranking') emoji = '🏆';
          else if (route.name === 'Perfil') emoji = '👤';
          return <TabBarIcon emoji={emoji} focused={focused} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 75 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
          paddingBottom: 2,
        },
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Dashboard',
        }}
      />
      
      <Tab.Screen 
        name="Atletas" 
        component={AthletesStack} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Atletas',
        }}
      />
      
      <Tab.Screen 
        name="Chamada" 
        component={AttendanceScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          tabBarLabel: 'Chamada',
        }}
      />
      
      <Tab.Screen 
        name="Vídeos" 
        component={VideosScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Vídeos',
        }}
      />
      
      <Tab.Screen 
        name="Social" 
        component={SocialScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          tabBarLabel: 'Social',
        }}
      />
      
      <Tab.Screen 
        name="Ranking" 
        component={RankingScreen} 
        options={{ 
          headerTitle: () => <LogoTitle />,
          tabBarLabel: 'Ranking',
        }}
      />
      
      <Tab.Screen 
        name="Perfil" 
        component={ProfileStack} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StatusProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </StatusProvider>
  );
}
