#!/bin/bash

echo "🔧 CORREÇÃO DEFINITIVA"
echo "======================"

IP=$(hostname -I | awk '{print $1}')
echo "IP detectado: $IP"

cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://$IP:8081
NEXT_PUBLIC_WS_URL=ws://$IP:8081
API_URL=http://$IP:8081
EOF

echo "✅ .env.local:"
cat frontend/.env.local

docker compose stop frontend
docker compose rm -f frontend
docker rmi retesp-4linhas-frontend 2>/dev/null

echo "🏗️ Reconstruindo..."
docker compose build --no-cache \
  --build-arg NEXT_PUBLIC_API_URL=http://$IP:8081 \
  --build-arg NEXT_PUBLIC_WS_URL=ws://$IP:8081 \
  frontend

docker compose up -d frontend
sleep 15

echo ""
echo "🌐 Acesse: http://$IP:3001/dashboard/athletes"
echo ""
echo "📌 F12 -> Console e execute:"
echo "   console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL)"
