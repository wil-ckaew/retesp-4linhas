#!/bin/bash

echo "🚀 Configurando RETESP 4 Linhas - Setup Universal"
echo "=================================================="

# Detecta IP
IP=$(hostname -I | awk '{print $1}')
if [ -z "$IP" ]; then
    IP=$(ip route get 1 | awk '{print $NF;exit}')
fi

echo "📡 IP detectado: $IP"

# Cria .env com IP dinâmico
cat > .env << ENV_EOF
API_HOST=$IP
BACKEND_PORT=8081
FRONTEND_PORT=3001

# Database
POSTGRES_DB=retesp
POSTGRES_USER=retesp
POSTGRES_PASSWORD=retesp123
POSTGRES_PORT=5433

# Redis
REDIS_PORT=6379

# MinIO
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123

# JWT
JWT_SECRET=change-me-in-production

# Services Ports
SOCIAL_PORT=8082
REPORTS_PORT=8083
COIN_PORT=8084
AI_PORT=8085
VIDEO_AI_PORT=8086
OLLAMA_PORT=11434

# Frontend URLs (usando IP dinâmico)
NEXT_PUBLIC_API_URL=http://$IP:8081
NEXT_PUBLIC_WS_URL=ws://$IP:8081
ENV_EOF

# Cria .env.local do frontend
mkdir -p frontend
cat > frontend/.env.local << FRONTEND_EOF
NEXT_PUBLIC_API_URL=http://$IP:8081
NEXT_PUBLIC_WS_URL=ws://$IP:8081
API_URL=http://$IP:8081
API_BASE_URL=http://$IP:8081
FRONTEND_EOF

# Cria config.ts com IP dinâmico
cat > frontend/src/lib/config.ts << CONFIG_EOF
// Configuração da API - Atualizado automaticamente no setup
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081';

export const API_BASE_URL = API_URL;
export const API_BASE = API_URL;
export { API_URL, WS_URL };

export const ENDPOINTS = {
  athletes: \${API_URL}/athletes,
  coaches: \${API_URL}/coaches,
  teams: \${API_URL}/teams,
  attendance: \${API_URL}/attendance,
  trainings: \${API_URL}/trainings,
  social: {
    feed: \${API_URL}/social/feed,
    stories: \${API_URL}/social/stories,
    posts: \${API_URL}/social/posts,
  },
  media: {
    videos: \${API_URL}/media/videos,
    uploads: \${API_URL}/uploads,
  },
};
CONFIG_EOF

# Cria diretórios
mkdir -p uploads backend/uploads frontend/uploads minio_data ollama_data postgres_data

# Para containers antigos
docker compose down 2>/dev/null

# Sobe containers
docker compose up -d --build

echo ""
echo "✅ Setup concluído!"
echo "🌐 Acesse: http://$IP:3001"
echo ""
echo "📌 Comandos úteis:"
echo "   docker compose logs -f"
echo "   docker compose down"
echo "   docker compose restart"
