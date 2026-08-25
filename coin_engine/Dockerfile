FROM rust:1.94-slim AS builder
WORKDIR /app

# Instala dependências de sistema necessárias
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copia os arquivos do projeto e faz o build
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/coin-engine /app/coin-engine
EXPOSE 8004
CMD ["/app/coin-engine"]
