// mobile/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar, Image, View, Text } from 'react-native';

// Telas principais
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen';
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
import AIScreen from './src/screens/AIScreen';
import TrainingsScreen from './src/screens/TrainingsScreen';

// Contexto para Status (Stories)
import { StatusProvider } from './src/context/StatusContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Componente de Logo
function LogoTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 8, 
        overflow: 'hidden',
        backgroundColor: '#161B22',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#30363D',
        padding: 4,
      }}>
        <Image 
          source={require('./assets/logo.png')} 
          style={{ width: 28, height: 28 }}
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

function AthletesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1117' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1117' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
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

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1117' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
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
    </Stack.Navigator>
  );
}

// Stack de Treinos
function TrainingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1117' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="TrainingsList" 
        component={TrainingsScreen} 
        options={{ headerTitle: () => <LogoTitle /> }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <StatusProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName = '';
                if (route.name === 'Dashboard') {
                  iconName = focused ? 'grid' : 'grid-outline';
                } else if (route.name === 'Treinos') {
                  iconName = focused ? 'fitness' : 'fitness-outline';
                } else if (route.name === 'Atletas') {
                  iconName = focused ? 'people' : 'people-outline';
                } else if (route.name === 'Chamada') {
                  iconName = focused ? 'checkbox' : 'checkbox-outline';
                } else if (route.name === 'Social') {
                  iconName = focused ? 'share-social' : 'share-social-outline';
                } else if (route.name === 'Perfil') {
                  iconName = focused ? 'person' : 'person-outline';
                }
                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: '#6B7280',
              tabBarStyle: {
                backgroundColor: '#161B22',
                borderTopColor: '#30363D',
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: '500',
              },
              headerStyle: {
                backgroundColor: '#0D1117',
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerShadowVisible: false,
            })}
          >
            {/* Dashboard - Tela inicial */}
            <Tab.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ 
                headerShown: false,
                tabBarLabel: 'Dashboard',
              }}
            />
            
            {/* Treinos */}
            <Tab.Screen 
              name="Treinos" 
              component={TrainingsStack} 
              options={{ 
                headerShown: false,
                tabBarLabel: 'Treinos',
              }}
            />
            
            {/* Atletas */}
            <Tab.Screen 
              name="Atletas" 
              component={AthletesStack} 
              options={{ 
                headerShown: false,
                tabBarLabel: 'Atletas',
              }}
            />
            
            {/* Chamada */}
            <Tab.Screen 
              name="Chamada" 
              component={AttendanceScreen} 
              options={{ 
                headerTitle: () => <LogoTitle />,
                tabBarLabel: 'Chamada',
              }}
            />
            
            {/* Social */}
            <Tab.Screen 
              name="Social" 
              component={SocialScreen} 
              options={{ 
                headerTitle: () => <LogoTitle />,
                tabBarLabel: 'Social',
              }}
            />
            
            {/* Perfil */}
            <Tab.Screen 
              name="Perfil" 
              component={ProfileStack} 
              options={{ 
                headerShown: false,
                tabBarLabel: 'Perfil',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </StatusProvider>
  );
}
