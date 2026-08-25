import { Platform } from 'react-native';

const MACHINE_IP = '192.168.0.25';
const PORT = '8081';

const API_URL = Platform.OS === 'android' 
  ? `http://${MACHINE_IP}:${PORT}`
  : `http://localhost:${PORT}`;

console.log(`🔧 [API] URL configurada: ${API_URL}`);

export { API_URL };
export default API_URL;
