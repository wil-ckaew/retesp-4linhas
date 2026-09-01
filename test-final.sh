#!/bin/bash

echo "=== TESTE FINAL DE INTEGRAÇÃO ==="
echo ""

echo "1. Verificando serviços:"
echo -n "   Frontend: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001

echo -n "   IA Service: "
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8085/health

echo ""
echo "2. Testando integração Frontend -> IA Service:"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai/generate_training \
  -H "Content-Type: application/json" \
  -d '{"category":"Sub-12","duration":"1h30","objective":"Posse de bola"}')

# Verificar se tem fallback
if echo "$RESPONSE" | grep -q '"fallback":true'; then
    echo "⚠️  Usando FALLBACK (IA Service não foi chamado)"
elif echo "$RESPONSE" | grep -q '"training"'; then
    echo "✅ Usando IA REAL com sucesso!"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
else
    echo "❌ Resposta inesperada:"
    echo "$RESPONSE"
fi

echo ""
echo "3. Verificando logs do IA Service (últimas 5 linhas):"
docker logs retesp-ai --tail 5 2>&1

echo ""
echo "4. Verificando variáveis de ambiente no frontend:"
docker exec retesp-frontend printenv | grep -E "AI_SERVICE|API_URL" || echo "Variáveis não encontradas"

echo ""
echo "=== FIM ==="
