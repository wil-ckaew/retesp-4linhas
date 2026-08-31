FROM python:3.11-slim

WORKDIR /app

# Copia o arquivo de requirements
COPY requirements.txt .

# Opção 1: Se NÃO precisa de GPU (mais rápido)
RUN pip install --no-cache-dir --default-timeout=1000 torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Opção 2: Se PRECISA de GPU (descomente esta e comente a de cima)
# RUN pip install --no-cache-dir --default-timeout=1000 torch torchvision

# Instala o resto das dependências com timeout maior
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Copia o código
COPY . .

# Comando para rodar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]