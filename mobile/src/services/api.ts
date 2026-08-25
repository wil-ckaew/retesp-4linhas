import { Platform } from 'react-native';

// IP da máquina na rede local
const MACHINE_IP = '192.168.0.25';
const PORT = '8081';

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === 'web') {
    API_URL = `http://${MACHINE_IP}:${PORT}`;
  } else if (Platform.OS === 'android') {
    API_URL = `http://${MACHINE_IP}:${PORT}`;
  } else if (Platform.OS === 'ios') {
    API_URL = `http://${MACHINE_IP}:${PORT}`;
  } else {
    API_URL = `http://${MACHINE_IP}:${PORT}`;
  }
} else {
  API_URL = `http://${MACHINE_IP}:${PORT}`;
}

console.log(`🔧 [API] URL configurada: ${API_URL}`);
console.log(`🔧 [API] Platform: ${Platform.OS}`);

export { API_URL };
export default API_URL;
