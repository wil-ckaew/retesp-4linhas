//mobile/src/services/api.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getEnvApiUrl = (): string | undefined => {
  const expoExtraUrl = Constants?.expoConfig?.extra?.API_URL;
  if (expoExtraUrl) return expoExtraUrl;
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (process.env.API_URL) return process.env.API_URL;
  return undefined;
};

const getApiUrl = (): string => {
  const envUrl = getEnvApiUrl();
  const fallback = envUrl || 'http://localhost:8081';

  if (Platform.OS === 'android') {
    const emulatorHosts = ['10.0.2.2', '10.0.3.2', 'localhost'];
    const detected = envUrl ? new URL(envUrl).hostname : emulatorHosts[0];

    if (envUrl) {
      return envUrl;
    }

    const host = detected && detected !== 'localhost' ? detected : emulatorHosts[0];
    return `http://${host}:8081`;
  }

  if (Platform.OS === 'ios') {
    return envUrl || 'http://localhost:8081';
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envUrl || 'http://localhost:8081';
    }
    return envUrl || `http://${hostname}:8081`;
  }

  return fallback;
};

export const API_URL = getApiUrl();

console.log('========================================');
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 API_URL: ${API_URL}`);
console.log(`🌐 Ambiente: ${__DEV__ ? 'Desenvolvimento' : 'Produção'}`);
console.log('========================================');

export default API_URL;