import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import SocialScreen from './screens/SocialScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'home';
            if (route.name === 'Social') {
              iconName = focused ? 'people' : 'people-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#161B22',
            borderTopColor: '#30363D',
          },
          headerStyle: {
            backgroundColor: '#0D1117',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
          },
          headerTintColor: '#FFFFFF',
        })}
      >
        <Tab.Screen name="Social" component={SocialScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
// Adicione no topo com os outros imports:
// import VideosScreen from './screens/VideosScreen';

// E adicione no Tab.Navigator:
// <Tab.Screen 
//   name="Videos" 
//   component={VideosScreen} 
//   options={{ 
//     headerShown: false,
//     tabBarLabel: 'Vídeos',
//     tabBarIcon: ({ focused, color, size }) => (
//       <Icon name={focused ? 'videocam' : 'videocam-outline'} size={size} color={color} />
//     ),
//   }}
// />
