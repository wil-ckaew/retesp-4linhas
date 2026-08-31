import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface RETESPStoryProps {
  size?: number;
}

export const RETESPStory: React.FC<RETESPStoryProps> = ({ size = 64 }) => {
  const logoSize = size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.innerContainer, { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 }]}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../public/assets/logo.png')} 
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.badge, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]}>
          <Text style={[styles.badgeText, { fontSize: size * 0.2 }]}>⚽</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#52ef44',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#44ef52',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  innerContainer: {
    backgroundColor: '#161B22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#44ef69',
    position: 'relative',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
