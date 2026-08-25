import { NextResponse } from 'next/server';

// Dados mock de treinos (serão substituídos pela API do backend)
const mockTrainings = [
  {
    id: '1',
    title: 'Treino de Finalização',
    description: 'Treino focado em finalizações de diversas posições',
    category: 'Sub-12',
    duration: '90',
    objective: 'Melhorar precisão de chutes',
    date: '2024-08-25',
    time: '14:00',
    status: 'pending',
    athlete_count: 12,
    coach_name: 'Carlos Silva',
    exercises: ['Chute com perna direita', 'Chute com perna esquerda', 'Cabeceio'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Treino de Passe e Movimentação',
    description: 'Exercícios de passe curto e movimentação sem bola',
    category: 'Sub-14',
    duration: '75',
    objective: 'Melhorar posicionamento em campo',
    date: '2024-08-26',
    time: '15:30',
    status: 'in_progress',
    athlete_count: 15,
    coach_name: 'Ana Paula',
    exercises: ['Passe curto', 'Passe longo', 'Movimentação ofensiva'],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Treino Físico',
    description: 'Preparação física com exercícios de condicionamento',
    category: 'Sub-16',
    duration: '60',
    objective: 'Melhorar resistência cardiovascular',
    date: '2024-08-24',
    time: '09:00',
    status: 'completed',
    athlete_count: 10,
    coach_name: 'Roberto Santos',
    exercises: ['Corrida', 'Abdominal', 'Flexão', 'Agachamento'],
    created_at: new Date().toISOString(),
  },
];

// GET - Listar todos os treinos
export async function GET() {
  try {
    // Tentar buscar do backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081';
    const response = await fetch(`${backendUrl}/trainings`).catch(() => null);
    
    if (response && response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // Fallback para dados mock
    return NextResponse.json(mockTrainings);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    return NextResponse.json(mockTrainings);
  }
}

// POST - Criar novo treino
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Tentar enviar para o backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081';
    const response = await fetch(`${backendUrl}/trainings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    
    if (response && response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 201 });
    }
    
    // Fallback: criar localmente
    const newTraining = {
      ...body,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    mockTrainings.unshift(newTraining);
    return NextResponse.json(newTraining, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    return NextResponse.json({ error: 'Erro ao criar treino' }, { status: 500 });
  }
}
