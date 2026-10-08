// Configuração da API com IP do Tailscale
const API_URL = "http://100.107.163.24:8081";
const WS_URL = "ws://100.107.163.24:8081";

export const API_BASE_URL = API_URL;
export const API_BASE = API_URL;

export { API_URL, WS_URL };

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
