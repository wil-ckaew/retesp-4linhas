import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 30, height: 30 };
      case 'large': return { width: 56, height: 56 };
      default: return { width: 44, height: 44 };
    }
  };

  const sizeStyle = getSize();

  return (
    <View style={styles.container}>
      <View style={[
        styles.logoBox,
        { 
          width: sizeStyle.width, 
          height: sizeStyle.height,
          borderRadius: sizeStyle.width / 2,
          overflow: 'hidden',
        }
      ]}>
        <Image 
          source={require('../../assets/logo.png')}
          style={{ 
            width: sizeStyle.width - 4, 
            height: sizeStyle.height - 4,
          }}
          resizeMode="contain"
        />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.logoTitle, { fontSize: sizeStyle.width / 2.5 }]}>
            RETESP
          </Text>
          <Text style={[styles.logoSubtitle, { fontSize: sizeStyle.width / 4 }]}>
            4 Linhas
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    backgroundColor: '#161B22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 4,
  },
  logoTitle: {
    color: '#EF4444',
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  logoSubtitle: {
    color: '#10B981',
    fontWeight: 'bold',
    lineHeight: 13,
  },
});
