import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Importar screens principais
import HomeScreen from '../screens/HomeScreen';
import SocialScreen from '../screens/SocialScreen';
import TrainingsScreen from '../screens/TrainingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AthletesScreen from '../screens/AthletesScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TeamsScreen from '../screens/TeamsScreen';
import CoachesScreen from '../screens/CoachesScreen';
import MediaScreen from '../screens/MediaScreen';
import VideosScreen from '../screens/VideosScreen';
import AIScreen from '../screens/AIScreen';
import ParentsPortalScreen from '../screens/ParentsPortalScreen';
import StatusScreen from '../screens/StatusScreen';
import AthleteDetailsScreen from '../screens/AthleteDetailsScreen';
import CreateAthleteScreen from '../screens/CreateAthleteScreen';
import EditAthleteScreen from '../screens/EditAthleteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegação das abas principais
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Treinos') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Atletas') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people-circle' : 'people-circle-outline';
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#0D1117',
          borderBottomColor: '#30363D',
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: '#FFFFFF',
        },
        headerTintColor: '#FFFFFF',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Início" 
        component={HomeScreen} 
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="Treinos" 
        component={TrainingsScreen} 
        options={{ title: '🏋️ Treinos' }}
      />
      <Tab.Screen 
        name="Atletas" 
        component={AthletesScreen} 
        options={{ title: '👥 Atletas' }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialScreen} 
        options={{ title: '📱 Social' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{ title: '👤 Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Navegação principal com Stack e Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0D1117' },
        }}
      >
        {/* Tabs principais */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Telas de Atletas */}
        <Stack.Screen name="AthleteDetails" component={AthleteDetailsScreen} />
        <Stack.Screen name="CreateAthlete" component={CreateAthleteScreen} />
        <Stack.Screen name="EditAthlete" component={EditAthleteScreen} />
        
        {/* Telas de Treinos */}
        <Stack.Screen name="TrainingDetails" component={TrainingsScreen} />
        <Stack.Screen name="CreateTraining" component={TrainingsScreen} />
        
        {/* Outras telas */}
        <Stack.Screen name="Teams" component={TeamsScreen} />
        <Stack.Screen name="Coaches" component={CoachesScreen} />
        <Stack.Screen name="Media" component={MediaScreen} />
        <Stack.Screen name="Videos" component={VideosScreen} />
        <Stack.Screen name="AI" component={AIScreen} />
        <Stack.Screen name="ParentsPortal" component={ParentsPortalScreen} />
        <Stack.Screen name="Status" component={StatusScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
