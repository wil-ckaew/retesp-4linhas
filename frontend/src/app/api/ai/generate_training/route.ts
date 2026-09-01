import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://retesp-ai:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, duration, objective } = body;

    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo do treino é obrigatório' },
        { status: 400 }
      );
    }

    // Tentar chamar o serviço de IA Python
    try {
      const response = await fetch(`${AI_SERVICE_URL}/generate_training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          duration,
          objective: objective.trim(),
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ 
          training: data.training || data.result || data.text || 'Treino gerado com sucesso!'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro no serviço de IA:', errorData);
        throw new Error(errorData.error || 'Erro ao gerar treino');
      }
    } catch (aiError) {
      console.error('Erro ao chamar serviço de IA:', aiError);
      
      // Fallback para o mock local
      const mockTraining = generateMockTraining(category, duration, objective);
      return NextResponse.json({ 
        training: mockTraining,
        fallback: true,
        message: 'Usando resposta simulada (serviço IA indisponível)'
      });
    }

  } catch (error: any) {
    console.error('Erro na rota da API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao gerar treino',
        training: generateMockTraining('Sub-12', '1h30', 'Posse de bola'),
        fallback: true
      },
      { status: 500 }
    );
  }
}

// Função de fallback com respostas simuladas
function generateMockTraining(category: string, duration: string, objective: string): string {
  const objectiveLower = objective.toLowerCase();
  const durationMinutes = duration === '1h' ? '60' : duration === '1h30' ? '90' : duration === '2h' ? '120' : '75';
  
  if (objectiveLower.includes('posse') || objectiveLower.includes('bola')) {
    return `
╔══════════════════════════════════════════════════════════════════╗
║          🏆 TREINO DE POSSE DE BOLA - ${category.padEnd(20)}          ║
║          📅 Duração: ${duration.padEnd(28)}          ║
╚══════════════════════════════════════════════════════════════════╝

🎯 OBJETIVO
Desenvolver a capacidade de manter a posse de bola sob pressão,
melhorar a tomada de decisão e a movimentação sem bola.

📋 ESTRUTURA DO TREINO (${durationMinutes} min)

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ AQUECIMENTO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Corrida leve com mudanças de direção          (5 min)        │
│ • Alongamento dinâmico                         (5 min)        │
│ • Passe curto em duplas                        (5 min)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ PARTE PRINCIPAL (${durationMinutes === '60' ? '30' : durationMinutes === '90' ? '60' : '90'} min)                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔹 Exercício 1: Rondo 4x2                       (15 min)       │
│    - 4 jogadores mantêm posse contra 2 defensores             │
│    - Trocas de posição a cada 2 minutos                       │
│    - Foco: passes rápidos e movimentação                      │
│                                                                 │
│ 🔹 Exercício 2: Posse com finalização           (20 min)       │
│    - 2 times jogam em campo reduzido                          │
│    - Equipe com posse deve dar 10 passes antes de finalizar   │
│    - Foco: construção de jogada                               │
│                                                                 │
│ 🔹 Exercício 3: Jogo posicional                 (25 min)       │
│    - Jogo 5x5 + 2 coringas                                    │
│    - Objetivo: manter a posse por 15 passes consecutivos      │
│    - Foco: movimentação e apoio                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣ FINALIZAÇÃO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Jogo reduzido 3x3                                           │
│ • Sem restrições de passes                                    │
│ • Foco: aplicar o que foi treinado                            │
└─────────────────────────────────────────────────────────────────┘

📊 INDICADORES DE SUCESSO
✅ Número de passes consecutivos: > 15
✅ Precisão de passes: > 85%
✅ Finalizações após construção: > 5

💡 DICA DO TÉCNICO
"Mantenha a cabeça erguida e pense sempre no próximo passe. 
A movimentação sem bola é tão importante quanto o passe."

🏆 RETESP 4L - Formando campeões!
`;
  } else if (objectiveLower.includes('finaliza') || objectiveLower.includes('chute') || objectiveLower.includes('gol')) {
    return `
╔══════════════════════════════════════════════════════════════════╗
║          🏆 TREINO DE FINALIZAÇÃO - ${category.padEnd(20)}          ║
║          📅 Duração: ${duration.padEnd(28)}          ║
╚══════════════════════════════════════════════════════════════════╝

🎯 OBJETIVO
Melhorar a precisão e potência das finalizações, trabalhando
diferentes tipos de chute e situações de jogo.

📋 ESTRUTURA DO TREINO (${durationMinutes} min)

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ AQUECIMENTO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Corrida com cones                             (5 min)        │
│ • Alongamento específico                       (5 min)        │
│ • Toques leves na bola                         (5 min)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ PARTE PRINCIPAL (${durationMinutes === '60' ? '30' : durationMinutes === '90' ? '60' : '90'} min)                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔹 Exercício 1: Chute ao gol                    (15 min)       │
│    - 10 finalizações de cada lado                              │
│    - Alternar entre chute colocado e potente                   │
│    - Foco: precisão e colocação                                │
│                                                                 │
│ 🔹 Exercício 2: Finalização em movimento        (20 min)       │
│    - Receber passe em velocidade e finalizar                   │
│    - 15 repetições com cada pé                                 │
│    - Foco: controle e finalização rápida                       │
│                                                                 │
│ 🔹 Exercício 3: Situações de jogo               (25 min)       │
│    - Cruzamentos e finalizações                                │
│    - Rebotes e sobras                                          │
│    - Foco: posicionamento na área                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣ FINALIZAÇÃO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Competição de finalizações                                   │
│ • 5 tentativas cada                                            │
│ • Foco: pressão e concentração                                 │
└─────────────────────────────────────────────────────────────────┘

📊 INDICADORES DE SUCESSO
✅ Aproveitamento: > 60%
✅ Chutes no alvo: > 70%
✅ Potência e precisão: média > 80km/h

💡 DICA DO TÉCNICO
"Olhe para o gol, respire fundo e confie no seu chute. 
A técnica vem com a repetição."

🏆 RETESP 4L - Formando campeões!
`;
  } else {
    return `
╔══════════════════════════════════════════════════════════════════╗
║          🏆 TREINO DE ${objective.toUpperCase().padEnd(23)}          ║
║          📅 Duração: ${duration.padEnd(28)}          ║
╚══════════════════════════════════════════════════════════════════╝

🎯 OBJETIVO
${objective}

📋 ESTRUTURA DO TREINO (${durationMinutes} min)

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ AQUECIMENTO (15 min)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • Ativação muscular e mobilidade                 (5 min)        │
│ • Exercícios de coordenação                      (5 min)        │
│ • Passe e recepção                              (5 min)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ PARTE PRINCIPAL (${durationMinutes === '60' ? '30' : durationMinutes === '90' ? '60' : '90'} min)                          │
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
`;
  }
}
