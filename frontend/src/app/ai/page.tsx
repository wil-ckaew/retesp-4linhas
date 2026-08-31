"use client";
import { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, Zap, Target, Clock, Users, 
  Download, Copy, Check, RefreshCw, AlertCircle,
  Wifi, WifiOff, Server, Shield, Loader2
} from 'lucide-react';

export default function AIPage() {
  const [category, setCategory] = useState('Sub-12');
  const [duration, setDuration] = useState('1h30');
  const [objective, setObjective] = useState('Posse de bola');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiUrl, setApiUrl] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

  useEffect(() => {
    setApiUrl(API_URL);
    checkApiHealth();
  }, []);

  // Testar conectividade com a API
  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      // Tentar vários endpoints
      const endpoints = ['/health', '/api/health', '/'];
      let found = false;
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000)
          });
          if (res.ok) {
            setApiStatus('online');
            found = true;
            break;
          }
        } catch (e) {
          // Continuar tentando outros endpoints
        }
      }
      
      if (!found) {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  // Respostas mockadas profissionais
  const getMockResponse = (category: string, duration: string, objective: string) => {
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
  };

  const generateTraining = async () => {
    if (!objective.trim()) {
      setError('Por favor, descreva o objetivo do treino');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      // Tentar API real
      try {
        const res = await fetch(`${API_URL}/ai/generate_training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category, 
            duration, 
            objective: objective.trim() 
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes('Erro')) {
            setResult(text);
            setApiStatus('online');
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('API indisponível, usando fallback:', apiError);
      }

      // Fallback: resposta simulada de alta qualidade
      setApiStatus('offline');
      const mockResponse = getMockResponse(category, duration, objective);
      setResult(mockResponse);
      setError('💡 Modo offline: Usando resposta simulada de alta qualidade');
      
    } catch (err: any) {
      console.error('Erro ao gerar treino:', err);
      // Último recurso: resposta simples
      setResult(`
🏆 TREINO GERADO - ${category}
📅 Duração: ${duration}
🎯 Objetivo: ${objective}

Não foi possível conectar à IA. Aqui está um treino básico:

1. Aquecimento (15 min)
2. Exercícios técnicos (30 min)
3. Jogo reduzido (30 min)
4. Finalização (15 min)

💪 Foco em: ${objective}

🏆 RETESP 4L
`);
      setError('⚠️ Modo offline: Usando resposta básica');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `treino-${category}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearResult = () => {
    setResult('');
    setError('');
  };

  const categories = ['Sub-10', 'Sub-11', 'Sub-12', 'Sub-13', 'Sub-14', 'Sub-15', 'Sub-16', 'Sub-17', 'Sub-20'];
  const durations = ['45min', '1h', '1h15', '1h30', '1h45', '2h'];
  const objectiveExamples = [
    'Posse de bola',
    'Finalização',
    'Passe e movimentação',
    'Transição defesa-ataque',
    'Contra-ataque',
    'Pressão alta',
    'Jogo posicional',
    'Bolas paradas'
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              IA Pequenos Gigantes
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Treinos personalizados com IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              apiStatus === 'online' 
                ? 'bg-green-500/10 border-green-500/20' 
                : apiStatus === 'offline'
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-gray-500/10 border-gray-500/20'
            }`}>
              {apiStatus === 'online' ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-400">API Online</span>
                </>
              ) : apiStatus === 'offline' ? (
                <>
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-400">Modo Offline</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  <span className="text-xs text-gray-400">Verificando...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Gerar Treino Personalizado
            </h2>

            <div className="space-y-5">
              {/* Categoria */}
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Duração */}
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  Duração
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              {/* Objetivo */}
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" />
                  Objetivo do Treino
                </label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Melhorar posse de bola"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {objectiveExamples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setObjective(ex)}
                      className="text-xs px-3 py-1 bg-[#21262D] rounded-full text-gray-400 hover:text-white hover:bg-[#30363D] transition"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão Gerar */}
              <button
                onClick={generateTraining}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition flex items-center justify-center gap-3 ${
                  loading
                    ? 'bg-purple-700 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Gerando treino...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Criar com IA
                  </>
                )}
              </button>

              {/* Aviso */}
              {error && (
                <div className={`flex items-start gap-2 p-4 rounded-xl border text-sm ${
                  error.includes('offline')
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dica */}
              <div className="p-4 bg-[#0D1117] rounded-xl border border-[#30363D]">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  {apiStatus === 'online' 
                    ? '✅ Conectado à IA - Respostas em tempo real'
                    : '📡 Modo offline - Usando respostas simuladas de alta qualidade'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Resultado
              </h2>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition text-gray-400 hover:text-white"
                    title="Copiar"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadResult}
                    className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition text-gray-400 hover:text-white"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearResult}
                    className="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition text-gray-400 hover:text-red-400"
                    title="Limpar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-[#0D1117] rounded-xl border border-[#21262D] p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <RefreshCw className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                  <p className="text-sm">A IA está criando seu treino...</p>
                  <p className="text-xs text-gray-500 mt-1">Isso pode levar alguns segundos</p>
                </div>
              ) : result ? (
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {result}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Brain className="w-16 h-16 text-purple-500/30 mb-4" />
                  <p className="text-gray-400">Seu treino personalizado aparecerá aqui</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure as opções e clique em "Criar com IA"
                  </p>
                </div>
              )}
            </div>

            {/* Info do resultado */}
            {result && (
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <span>📝 {result.split('\n').length} linhas</span>
                <span>📊 {result.split(' ').length} palavras</span>
                <span className="text-purple-400">✨ Gerado por IA</span>
                {apiStatus === 'offline' && (
                  <span className="text-yellow-400">📡 Modo offline</span>
                )}
                {apiStatus === 'online' && (
                  <span className="text-green-400">🔗 API conectada</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 border-t border-[#30363D] pt-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>⚽ RETESP 4L</span>
            <span>•</span>
            <span>🧠 IA Treinos</span>
            <span>•</span>
            <span>🏆 Treinos Personalizados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
