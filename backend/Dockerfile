FROM rust:1.94-slim AS builder
WORKDIR /app

# Instala dependências de sistema
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copia os arquivos e faz o build
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app

# Instala o pg_isready para o script de wait
RUN apt-get update && apt-get install -y ca-certificates postgresql-client && rm -rf /var/lib/apt/lists/*

# Copia o binário e o script de entrada
COPY --from=builder /app/target/release/retesp-backend /app/retesp-backend
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
