import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import AthletesScreen from '../screens/AthletesScreen';
import AthleteDetailsScreen from '../screens/AthleteDetailsScreen';
import CreateAthleteScreen from '../screens/CreateAthleteScreen';
import EditAthleteScreen from '../screens/EditAthleteScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TeamsScreen from '../screens/TeamsScreen';
import CoachesScreen from '../screens/CoachesScreen';
import MediaScreen from '../screens/MediaScreen';
import VideosScreen from '../screens/VideosScreen';
import SocialScreen from '../screens/SocialScreen';
import AIScreen from '../screens/AIScreen';
import ParentsPortalScreen from '../screens/ParentsPortalScreen';
import StatusScreen from '../screens/StatusScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161B22',
          borderTopColor: '#30363D',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Athletes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Athletes" component={AthletesScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0D1117' },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="AthleteDetails" component={AthleteDetailsScreen} />
        <Stack.Screen name="CreateAthlete" component={CreateAthleteScreen} />
        <Stack.Screen name="EditAthlete" component={EditAthleteScreen} />
        <Stack.Screen name="Teams" component={TeamsScreen} />
        <Stack.Screen name="Coaches" component={CoachesScreen} />
        <Stack.Screen name="Media" component={MediaScreen} />
        <Stack.Screen name="Videos" component={VideosScreen} />
        <Stack.Screen name="Social" component={SocialScreen} />
        <Stack.Screen name="AI" component={AIScreen} />
        <Stack.Screen name="ParentsPortal" component={ParentsPortalScreen} />
        <Stack.Screen name="Status" component={StatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
