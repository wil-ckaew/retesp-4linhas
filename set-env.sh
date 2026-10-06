#!/bin/bash

# Detecta se está em produção ou desenvolvimento
if [ -f /proc/1/cgroup ] && grep -q docker /proc/1/cgroup; then
    # Está dentro do Docker
    API_HOST="backend"
else
    # Está no host
    API_HOST="localhost"
fi

echo "Configurando API_HOST=$API_HOST"

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$API_HOST:8080
NEXT_PUBLIC_WS_URL=ws://$API_HOST:8080
API_URL=http://$API_HOST:8080
