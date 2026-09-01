from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Optional
import json

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrainingRequest(BaseModel):
    category: str
    duration: str
    objective: str

class TrainingResponse(BaseModel):
    training: str
    fallback: Optional[bool] = False
    message: Optional[str] = None

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "online", "service": "ai-service", "version": "1.0"}

@app.post("/generate_training")
async def generate_training(request: TrainingRequest):
    try:
        training = generate_mock_training(
            request.category,
            request.duration,
            request.objective
        )
        return TrainingResponse(
            training=training,
            fallback=False,
            message="Treino gerado com sucesso!"
        )
    except Exception as e:
        print(f"Erro ao gerar treino: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        message = data.get('message', '')
        context = data.get('context', [])
        
        print(f"📩 Mensagem recebida: {message}")
        
        response = generate_chat_response(message, context)
        
        print(f"💬 Resposta: {response[:100]}...")
        
        return {"response": response, "status": "success"}
    except Exception as e:
        print(f"❌ Erro no chat: {e}")
        return {"response": "Desculpe, tive um problema. Pode repetir?", "status": "error"}

def generate_mock_training(category: str, duration: str, objective: str) -> str:
    duration_minutes = duration.replace('h', '').replace('min', '').strip()
    if ':' in duration_minutes:
        parts = duration_minutes.split(':')
        duration_minutes = str(int(parts[0]) * 60 + int(parts[1]))
    elif duration_minutes.isdigit():
        duration_minutes = duration_minutes
    else:
        duration_minutes = "90"
    
    return f"""
╔══════════════════════════════════════════════════════════════════╗
║          🏆 TREINO DE {objective.upper().ljust(20)} - {category.ljust(20)}          ║
║          📅 Duração: {duration.ljust(28)}          ║
╚══════════════════════════════════════════════════════════════════╝

🎯 OBJETIVO
{objective}

📋 ESTRUTURA DO TREINO ({duration_minutes} min)

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ AQUECIMENTO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Ativação muscular e mobilidade                 (5 min)        │
│ • Exercícios de coordenação                      (5 min)        │
│ • Passe e recepção                              (5 min)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ PARTE PRINCIPAL ({int(duration_minutes) - 30} min)                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔹 Exercício 1: Técnica individual               (15 min)       │
│    - Condução e controle de bola                               │
│    - Mudanças de direção e velocidade                          │
│                                                                 │
│ 🔹 Exercício 2: Trabalho em duplas               (20 min)       │
│    - Passe, recepção e movimentação                            │
│    - Combinações e tabelas                                     │
│                                                                 │
│ 🔹 Exercício 3: Situações de jogo               (25 min)       │
│    - Jogo em espaço reduzido                                   │
│    - Aplicação dos fundamentos                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣ FINALIZAÇÃO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Jogo livre                                                   │
│ • Ênfase no que foi trabalhado                                 │
└─────────────────────────────────────────────────────────────────┘

📊 INDICADORES DE SUCESSO
✅ Execução correta dos fundamentos
✅ Tomada de decisão
✅ Intensidade e concentração

💡 DICA DO TÉCNICO
"O treino perfeito é aquele que você dá o seu máximo. 
Cada repetição conta."

🏆 RETESP 4L - Formando campeões!
"""

def generate_chat_response(message: str, context: list) -> str:
    """Gerar resposta inteligente para o chat com foco em crianças de 10 anos"""
    msg = message.lower()
    
    # ===== RESPOSTAS PARA CRIANÇAS DE 10 ANOS =====
    
    # 1. Dicas para começar o treino
    if any(word in msg for word in ['começar', 'comecei', 'iniciar', 'primeiro', 'dica', 'começo']):
        return """
🌟 **DICAS ESPECIAIS PARA COMEÇAR O TREINO (10 anos)** 🌟

🎯 **Antes do Treino:**
1️⃣ **Alimentação** (2h antes)
   • Coma uma fruta (banana, maçã)
   • Beba água (500ml)
   • Evite refrigerantes

2️⃣ **Equipamento**
   • Chuteira adequada
   • Caneleira (sempre!)
   • Uniforme limpo
   • Garrafa de água
   • Toalha

3️⃣ **Mentalidade**
   • Pense positivo
   • Esteja pronto para aprender
   • Divirta-se!

🏃‍♂️ **Durante o Treino:**
• Chegue 15 minutos antes
• Participe de tudo
• Escute o treinador
• Ajude os colegas
• Dê o seu melhor!

💪 **Após o Treino:**
• Faça alongamento
• Tome banho
• Coma algo leve
• Descanse bem

📱 **Dica do Técnico:**
"O mais importante é se divertir e fazer amigos!"
"""
    
    # 2. Treino de Passe
    if 'passe' in msg or 'passes' in msg or 'passar' in msg:
        return """
⚽ **TREINO DE PASSE - PARA CRIANÇAS DE 10 ANOS** ⚽

🎯 **Exercícios Divertidos:**

1️⃣ **Jogo do Espelho (10 min)**
   • Em dupla, imitar os movimentos
   • Passe curto com os dois pés
   • Quem errar, paga uma prenda

2️⃣ **Circuito de Passe (15 min)**
   • 5 estações diferentes
   • Passe curto e longo
   • Passar por cones e finalizar

3️⃣ **Jogo dos 10 Passes (20 min)**
   • Time A vs Time B
   • Fazer 10 passes seguidos = 1 ponto
   • Quem fizer mais pontos ganha

📊 **Metas Divertidas:**
• Fazer 10 passes certos seguidos
• Usar o pé esquerdo 5 vezes
• Dar um passe para um amigo

🎁 **Recompensa:**
• Quem acertar mais ganha um adesivo
• Todos ganham palmas no final

💡 **Dica do Técnico:**
"Passe com carinho, como se estivesse dando um presente!"
"""
    
    # 3. Treino de Finalização
    if 'finalização' in msg or 'finalizar' in msg or 'chute' in msg or 'gol' in msg:
        return """
🎯 **TREINO DE FINALIZAÇÃO - PARA CRIANÇAS DE 10 ANOS** 🎯

🎨 **Exercícios Criativos:**

1️⃣ **Desafio dos Alvos (15 min)**
   • Colocar cones nos cantos do gol
   • Acertar nos cones = pontos extras
   • 10 tentativas de cada lado

2️⃣ **Corrida do Gol (15 min)**
   • Drible 3 cones
   • Chute ao gol
   • Quem marcar mais gols vence

3️⃣ **Jogo do Campeão (20 min)**
   • 1x1 com goleiro
   • 5 tentativas cada
   • Quem fizer mais gols ganha

📊 **Metas Divertidas:**
• Fazer 3 gols em 10 tentativas
• Chutar com os dois pés
• Acertar o canto do gol

🏆 **Dica do Técnico:**
"Mire no gol, respire fundo e chute como se fosse seu último!"
"""
    
    # 4. Posse de Bola
    if 'posse' in msg or 'bola' in msg and not 'passe' in msg:
        return """
🔄 **POSSE DE BOLA - PARA CRIANÇAS DE 10 ANOS** 🔄

🎮 **Jogos Divertidos:**

1️⃣ **O Rei da Bola (15 min)**
   • 1 jogador tenta recuperar a bola
   • Os outros trocam passes
   • Quem perder a bola vira pegador

2️⃣ **Minha Bola (15 min)**
   • Cada um com sua bola
   • Conduzir sem perder
   • Mudar de ritmo e direção

3️⃣ **Rondo dos Amigos (20 min)**
   • 4 vs 2
   • Manter a posse
   • 10 passes = 1 ponto

📊 **Dica Divertida:**
"Fique sempre perto da bola e peça para receber!"
"""
    
    # 5. Saudações
    if any(word in msg for word in ['bom dia', 'boa tarde', 'boa noite', 'olá', 'oi', 'e aí']):
        return """
👋 **OI, JOVEM CAMPEÃO!**

Que bom que você está aqui! 🌟

Vamos treinar com alegria e fazer muitos gols!
Hoje vamos aprender coisas novas e nos divertir.

⚽ **VOCÊ ESTÁ PRONTO PARA O TREINO?**

Não se esqueça:
• Traga sua melhor energia
• Sorria sempre
• Ajude seus amigos

Vamos começar! 💪
"""
    
    # 6. Agradecimentos
    if any(word in msg for word in ['obrigado', 'valeu', 'gratidão', 'agradeço', 'tks']):
        return """
😊 **POR NADA, CAMPEÃO!**

Fico muito feliz em poder ajudar você!

Continue treinando com alegria e dedicação.
Cada treino é uma chance de melhorar.

🏆 **RETESP 4L - Onde os campeões são formados!**

Qualquer dúvida, estou aqui para você! 💬
"""
    
    # 7. Quando pede plano específico
    if any(word in msg for word in ['plano', 'monta', 'cria', 'elabora', 'rotina']):
        return """
📋 **PLANO DE TREINO PARA CRIANÇAS DE 10 ANOS**

🎯 **Treino Completo (1h30)**

🔹 **Aquecimento (15 min)**
• Corrida leve se divertindo (5 min)
• Alongamento com música (5 min)
• Toques na bola (5 min)

🔹 **Parte Principal (50 min)**
• Passe em duplas (15 min)
• Jogo reduzido (20 min)
• Finalização (15 min)

🔹 **Finalização (15 min)**
• Jogo livre
• Chutes ao gol
• Alongamento em grupo

🔹 **Hidratação e Feedback (10 min)**
• Beber água
• Conversar sobre o treino
• Dar parabéns aos amigos

💡 **Dica Especial:**
"Treine com alegria e faça muitos amigos!"
"""
    
    # 8. Se não identificar, resposta genérica com perguntas
    return """
🤔 **CONTE-ME MAIS SOBRE ISSO!**

Para te ajudar melhor, escolha um tópico:

⚽ **TREINOS**
1. Como começar o treino
2. Treino de passe
3. Treino de finalização
4. Posse de bola

🎮 **JOGOS**
5. Jogos divertidos
6. Atividades em grupo

💡 **DICAS**
7. Alimentação
8. Equipamento
9. Mentalidade

Digite o número ou o nome do tópico que você quer saber!

Estou aqui para ajudar você a se tornar um grande jogador! 🌟
"""

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
