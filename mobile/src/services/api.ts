//mobile/src/services/api.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Função para obter a URL correta da API
const getApiUrl = (): string => {
  // Se for Android
  if (Platform.OS === 'android') {
    // Lista de IPs para tentar (em ordem de prioridade)
    const possibleIps = [
      '192.168.0.25',    // IP da máquina (rede local)
      '172.17.0.1',      // IP do Docker (host)
      '10.0.2.2',        // Emulador Android (Android Studio)
      '10.0.3.2',        // Emulador Genymotion
      'localhost',       // Localhost (não funciona no Android)
    ];
    
    // Por padrão, usar o IP da máquina
    // Se estiver no emulador, mude para 'http://10.0.2.2:8081'
    return `http://${possibleIps[0]}:8081`;
  }

  // Se for iOS
  if (Platform.OS === 'ios') {
    // Emulador usa localhost
    // Dispositivo físico usa IP da máquina
    return 'http://192.168.0.25:8081';
  }

  // Se for Web
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8081';
    }
    return `http://${hostname}:8081`;
  }

  // Fallback
  return 'http://192.168.0.25:8081';
};

export const API_URL = getApiUrl();

console.log('========================================');
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 API_URL: ${API_URL}`);
console.log(`🌐 Ambiente: ${__DEV__ ? 'Desenvolvimento' : 'Produção'}`);
console.log('========================================');

export default API_URL;