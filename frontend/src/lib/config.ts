// Configuração da API com IP fixo
const API_URL = "http://192.168.100.105:8081";
const WS_URL = "ws://192.168.100.105:8081";

// Exportações para compatibilidade
export const API_BASE_URL = API_URL;
export const API_BASE = API_URL;

// Exportação padrão
export { API_URL, WS_URL };

// Endpoints
export const ENDPOINTS = {
  athletes: `${API_URL}/athletes`,
  coaches: `${API_URL}/coaches`,
  teams: `${API_URL}/teams`,
  attendance: `${API_URL}/attendance`,
  trainings: `${API_URL}/trainings`,
  social: {
    feed: `${API_URL}/social/feed`,
    stories: `${API_URL}/social/stories`,
    posts: `${API_URL}/social/posts`,
  },
  media: {
    videos: `${API_URL}/media/videos`,
    uploads: `${API_URL}/uploads`,
  },
};
