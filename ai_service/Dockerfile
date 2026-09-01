FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Expor a porta 8080
EXPOSE 8080

# Comando para rodar o serviço
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
