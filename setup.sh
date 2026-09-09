#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando setup do Retesp 4 Linhas...${NC}"

# 1. Verifica se o Docker está instalado
echo -e "${YELLOW}📋 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Instale o Docker primeiro.${NC}"
    echo -e "${YELLOW}📌 Instale com: curl -fsSL https://get.docker.com | sudo sh${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker encontrado${NC}"

# 2. Verifica se o Docker Compose está instalado
echo -e "${YELLOW}📋 Verificando Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado. Instale o Docker Compose primeiro.${NC}"
    echo -e "${YELLOW}📌 Instale com: sudo apt-get install docker-compose-plugin${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose encontrado${NC}"

# 3. Cria arquivo .env se não existir
echo -e "${YELLOW}📝 Configurando variáveis de ambiente...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env criado a partir do .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example não encontrado. Criando .env padrão...${NC}"
        cat > .env << 'ENVEOF'
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=retesp
DATABASE_URL=postgresql://postgres:postgres@db:5432/retesp

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=retesp

# Services
BACKEND_URL=http://backend:8080
FRONTEND_URL=http://localhost:3001

# JWT
JWT_SECRET=dev-secret-key-change-this-in-production

# AI Service
AI_SERVICE_URL=http://ai:8080
OLLAMA_HOST=http://ollama:11434

# Video AI
VIDEO_AI_URL=http://video-ai:8001
ENVEOF
        echo -e "${GREEN}✅ .env padrão criado${NC}"
    fi
else
    echo -e "${GREEN}✅ .env já existe${NC}"
fi

# 4. Cria diretórios necessários
echo -e "${YELLOW}📁 Criando diretórios...${NC}"
mkdir -p uploads
mkdir -p backend/uploads
mkdir -p frontend/uploads
mkdir -p minio_data
mkdir -p ollama_data
mkdir -p postgres_data
echo -e "${GREEN}✅ Diretórios criados${NC}"

# 5. Define permissões
echo -e "${YELLOW}🔧 Ajustando permissões...${NC}"
chmod -R 755 uploads 2>/dev/null || true
chmod -R 755 backend/uploads 2>/dev/null || true
chmod -R 755 frontend/uploads 2>/dev/null || true
chmod -R 755 minio_data 2>/dev/null || true
chmod -R 755 ollama_data 2>/dev/null || true
chmod -R 755 postgres_data 2>/dev/null || true
echo -e "${GREEN}✅ Permissões ajustadas${NC}"

# 6. Para containers antigos (se houver)
echo -e "${YELLOW}🛑 Parando containers antigos...${NC}"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✅ Containers antigos removidos${NC}"

# 7. Sobe os containers
echo -e "${YELLOW}🐳 Subindo containers...${NC}"
docker compose up -d

# 8. Aguarda os serviços iniciarem
echo -e "${YELLOW}⏳ Aguardando serviços iniciarem (30 segundos)...${NC}"
sleep 30

# 9. Verifica status dos containers
echo -e "${YELLOW}📊 Verificando status...${NC}"
docker compose ps

# 10. Verifica se o Redis está acessível
echo -e "${YELLOW}🔍 Testando Redis...${NC}"
if docker exec -it retesp-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis está funcionando${NC}"
else
    echo -e "${RED}❌ Redis não está respondendo${NC}"
fi

# 11. Verifica se o banco está acessível
echo -e "${YELLOW}🔍 Testando Banco de Dados...${NC}"
if docker exec -it retesp-db pg_isready -U postgres 2>/dev/null | grep -q "accepting connections"; then
    echo -e "${GREEN}✅ Banco de Dados está funcionando${NC}"
else
    echo -e "${RED}❌ Banco de Dados não está respondendo${NC}"
fi

# 12. Mostra logs dos últimos segundos
echo -e "${YELLOW}📋 Últimos logs:${NC}"
docker compose logs --tail=15

# 13. Mensagem final
echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${BLUE}🌐 Acesse:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3001${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8081${NC}"
echo -e "   MinIO:    ${GREEN}http://localhost:9001${NC} (usuario: minioadmin / senha: minioadmin)"
echo ""
echo -e "${YELLOW}📌 Comandos úteis:${NC}"
echo -e "   Ver logs:        ${BLUE}docker compose logs -f${NC}"
echo -e "   Ver logs do worker: ${BLUE}docker compose logs -f retesp-notify${NC}"
echo -e "   Parar serviços:  ${BLUE}docker compose down${NC}"
echo -e "   Reiniciar:       ${BLUE}docker compose restart${NC}"
echo -e "   Status:          ${BLUE}docker compose ps${NC}"
echo -e "   Acessar container: ${BLUE}docker exec -it retesp-backend /bin/bash${NC}"
