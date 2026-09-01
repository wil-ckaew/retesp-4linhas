#!/bin/bash

echo "=== TESTE DE INTEGRAÇÃO IA ==="
echo ""

echo "1. Verificando frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
echo "Frontend: $FRONTEND_STATUS"

echo ""
echo "2. Verificando serviço IA..."
IA_HEALTH=$(curl -s http://localhost:8085/health | jq -r '.status' 2>/dev/null || echo "offline")
echo "IA Service: $IA_HEALTH"

echo ""
echo "3. Testando geração de treino via frontend API..."
echo "Enviando requisição para /api/ai/generate_training..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai/generate_training \
  -H "Content-Type: application/json" \
  -d '{"category":"Sub-12","duration":"1h30","objective":"Posse de bola"}')

# Verificar se a resposta contém training
if echo "$RESPONSE" | grep -q "training"; then
    echo "✅ Sucesso! Treino gerado."
    echo "$RESPONSE" | jq -r '.training' 2>/dev/null | head -20 || echo "$RESPONSE" | head -20
else
    echo "❌ Falha ao gerar treino."
    echo "Resposta: $RESPONSE"
fi

echo ""
echo "4. Verificando logs do frontend (últimas 5 linhas):"
docker logs retesp-frontend --tail 5 2>&1

echo ""
echo "5. Verificando logs do AI service (últimas 5 linhas):"
docker logs retesp-ai --tail 5 2>&1

echo ""
echo "=== FIM DO TESTE ==="
