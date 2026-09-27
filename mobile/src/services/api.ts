//mobile/src/services/api.ts
import { Platform } from 'react-native';

// IP FIXO do Tailscale
const TAILSCALE_IP = '100.107.163.24';
const BACKEND_PORT = 8081;

const getApiUrl = (): string => {
  // Sempre usa o IP do Tailscale
  return `http://${TAILSCALE_IP}:${BACKEND_PORT}`;
};

export const API_URL = getApiUrl();

console.log('========================================');
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 API_URL: ${API_URL}`);
console.log(`🌐 Ambiente: ${__DEV__ ? 'Desenvolvimento' : 'Produção'}`);
console.log('========================================');

export default API_URL;
