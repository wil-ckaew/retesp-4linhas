import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface StatusLogoProps {
  size?: number;
  showText?: boolean;
}

export const StatusLogo: React.FC<StatusLogoProps> = ({ size = 50, showText = true }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={[styles.logo, { width: size * 0.7, height: size * 0.7 }]}
          resizeMode="contain"
        />
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>4L</Text>
        </View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoText, { fontSize: size * 0.2 }]}>RETESP</Text>
          <Text style={[styles.logoSubtext, { fontSize: size * 0.15 }]}>4 Linhas</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#161B22',
    borderWidth: 3,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    tintColor: '#EF4444',
  },
  logoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  textContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  logoText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});
