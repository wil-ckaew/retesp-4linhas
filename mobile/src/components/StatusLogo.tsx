import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

interface StatusLogoProps {
  size?: number;
  showText?: boolean;
}

export const StatusLogo: React.FC<StatusLogoProps> = ({ size = 50, showText = true }) => {
  const [imageError, setImageError] = useState(false);

  // Se houve erro ao carregar a imagem, mostra o fallback com texto
  if (imageError) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <View style={styles.fallbackContainer}>
            <Text style={[styles.fallbackText, { fontSize: size * 0.35 }]}>4L</Text>
            <View style={styles.fallbackBall}>
              <Text style={[styles.fallbackBallText, { fontSize: size * 0.15 }]}>⚽</Text>
            </View>
          </View>
          <View style={styles.logoBadge}>
            <Text style={[styles.logoBadgeText, { fontSize: size * 0.15 }]}>⚽</Text>
          </View>
        </View>
        {showText && (
          <View style={styles.textContainer}>
            <Text style={[styles.logoTitle, { fontSize: size * 0.2 }]}>RETESP</Text>
            <Text style={[styles.logoSubtitle, { fontSize: size * 0.15 }]}>4 Linhas</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={[styles.logo, { width: size * 0.7, height: size * 0.7 }]}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
        <View style={styles.logoBadge}>
          <Text style={[styles.logoBadgeText, { fontSize: size * 0.15 }]}>⚽</Text>
        </View>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoTitle, { fontSize: size * 0.2 }]}>RETESP</Text>
          <Text style={[styles.logoSubtitle, { fontSize: size * 0.15 }]}>4 Linhas</Text>
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
    width: '70%',
    height: '70%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fallbackText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  fallbackBall: {
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
  fallbackBallText: {
    color: '#10B981',
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
    fontWeight: 'bold',
  },
  textContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  logoTitle: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  logoSubtitle: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});
