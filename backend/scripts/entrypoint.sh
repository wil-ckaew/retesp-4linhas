#!/bin/bash
set -e

echo "⏳ Aguardando o PostgreSQL ficar pronto..."
until pg_isready -h db -p 5432 -U retesp; do
  sleep 2
done
echo "✅ PostgreSQL está pronto! Iniciando o back-end..."

exec /app/retesp-backend
