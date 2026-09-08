const normalizeBaseUrl = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL,
  'http://localhost:8081'
);

export const WS_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_WS_URL,
  'ws://localhost:8081'
);

export const SOCIAL_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SOCIAL_URL,
  API_BASE_URL
);

export const REPORTS_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_REPORTS_URL,
  API_BASE_URL
);

export const COIN_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_COIN_URL,
  API_BASE_URL
);

export const AI_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_AI_URL,
  API_BASE_URL
);

export const VIDEO_AI_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_VIDEO_AI_URL,
  API_BASE_URL
);

export const buildApiUrl = (path: string) => {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};
