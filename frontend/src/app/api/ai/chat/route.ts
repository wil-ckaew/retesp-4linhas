import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://retesp-ai:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Tentar chamar o serviço de IA Python
    try {
      const response = await fetch(`${AI_SERVICE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context || []
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ 
          response: data.response || data.message || 'Entendi! Pode me contar mais?'
        });
      }
    } catch (error) {
      console.error('Erro ao chamar serviço de IA:', error);
    }

    // Fallback: resposta local
    const fallbackResponse = getLocalResponse(message);
    return NextResponse.json({ 
      response: fallbackResponse,
      fallback: true
    });

  } catch (error: any) {
    console.error('Erro na rota da API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao processar mensagem',
        response: 'Desculpe, tive um problema. Pode repetir sua pergunta?'
      },
      { status: 500 }
    );
  }
}

function getLocalResponse(message: string): string {
  const msg = message.toLowerCase();
  
  const responses = [
    { keywords: ['treino', 'exercício', 'treinar', 'praticar'], 
      response: "💪 Ótimo! Posso ajudar com treinos. Que tipo de treino você gostaria? Posse de bola, finalização, ou algo específico?" },
    { keywords: ['posse', 'bola'], 
      response: "⚽ Para melhorar a posse de bola, recomendo:\n• Rondos 4x2\n• Jogos posicionais\n• Exercícios de passe e movimentação\n\nQuer que eu detalhe algum desses?" },
    { keywords: ['finalização', 'chute', 'gol', 'finalizar'], 
      response: "🎯 Para finalizações, sugiro:\n• Chutes de diferentes distâncias\n• Finalizações em movimento\n• Treinos de precisão\n\nPosso montar um plano detalhado para você!" },
    { keywords: ['olá', 'oi', 'bom dia', 'boa tarde', 'e aí'], 
      response: "👋 Olá! Como posso ajudar você hoje no treino?" },
    { keywords: ['categoria', 'sub', 'idade'], 
      response: "🏆 Trabalhamos com várias categorias: Sub-10, Sub-11, Sub-12, Sub-13, Sub-14, Sub-15, Sub-16, Sub-17 e Sub-20. Qual a sua categoria?" },
    { keywords: ['obrigado', 'valeu', 'gratidão', 'agradeço'], 
      response: "😊 Por nada! Estou aqui para ajudar. Qualquer dúvida, é só perguntar!" },
    { keywords: ['passe', 'passes', 'movimentação'], 
      response: "🔄 Para melhorar passes e movimentação:\n• Treinos de passe curto e longo\n• Movimentação sem bola\n• Jogos de posse\n\nQuer detalhes de algum exercício?" },
    { keywords: ['defesa', 'defender', 'marcar'], 
      response: "🛡️ Para defesa, recomendo:\n• Treinos de marcação\n• Posicionamento defensivo\n• Transição defesa-ataque\n\nPosso elaborar um plano?" },
  ];

  for (const item of responses) {
    if (item.keywords.some(kw => msg.includes(kw))) {
      return item.response;
    }
  }

  return "🤔 Hmm, interessante. Pode me contar mais sobre isso? Estou aqui para ajudar com treinos de futebol!";
}
