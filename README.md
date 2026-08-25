# ⚽ RETESP 4L - Sistema de Gestão Esportiva

Sistema completo para gestão de escolinhas de futebol, com painel administrativo web e aplicativo mobile.

## 🚀 Tecnologias

### Backend
- 🦀 **Rust** + Actix Web
- 🐘 **PostgreSQL** - Banco de dados
- 🔴 **Redis** - Cache e filas
- 🎯 **Ollama** - IA para treinos personalizados

### Frontend Web
- ⚛️ **Next.js 14** + React
- 🎨 **Tailwind CSS**
- 📊 **Recharts** - Gráficos
- 🔷 **TypeScript**

### Mobile
- 📱 **React Native** + Expo
- 🎨 **React Navigation**
- 📊 **React Native Chart Kit**
- 🔷 **TypeScript**

## 📋 Funcionalidades

- ✅ **Dashboard** com gráficos e estatísticas em tempo real
- ✅ **Gestão de Atletas** - CRUD completo com fotos
- ✅ **Gestão de Treinos** - Criação e acompanhamento
- ✅ **Gestão de Turmas** - Organização por categorias
- ✅ **Gestão de Professores** - Cadastro e especialização
- ✅ **Chamada** - Registro de presença diária
- ✅ **Mídias** - Upload de fotos e vídeos
- ✅ **Rede Social** - Feed com posts e compartilhamento
- ✅ **IA** - Sugestão de treinos personalizados
- ✅ **Stories** - Compartilhamento de momentos

## 🏗️ Estrutura do Projeto

retesp-4linhas/
├── backend/ # API Rust
├── frontend/ # Next.js Web
├── mobile/ # React Native App
├── docker-compose.yml
└── README.md
text


## 🔧 Instalação

### Pré-requisitos
- Docker & Docker Compose
- Node.js 20+
- Rust (para desenvolvimento)
- Expo CLI (para mobile)

### Rodando com Docker

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd retesp-4linhas

# Subir todos os serviços
docker compose up -d --build

# Acessar
# Web: http://localhost:3001
# API: http://localhost:8081

Desenvolvimento
bash

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
cargo run

# Mobile
cd mobile
npm install
npx expo start

📱 Aplicativo Mobile

Escaneie o QR Code com o Expo Go ou acesse via link:
bash

cd mobile
npx expo start

🔗 Endpoints da API

    GET /athletes - Listar atletas

    POST /athletes - Criar atleta

    GET /trainings - Listar treinos

    POST /trainings - Criar treino

    GET /social/feed - Feed social

    POST /social/posts - Criar post

📸 Screenshots

Adicione screenshots do sistema aqui
👥 Contribuição

    Fork o projeto

    Crie sua branch (git checkout -b feature/AmazingFeature)

    Commit suas mudanças (git commit -m 'Add some AmazingFeature')

    Push para a branch (git push origin feature/AmazingFeature)

    Abra um Pull Request

📄 Licença

Este projeto está sob a licença MIT.
📞 Contato

    RETESP 4L - [site-do-projeto]

    Email - [seu-email]

⭐ Feito com ❤️ para o futebol!
