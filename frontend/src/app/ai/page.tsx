"use client";
import { useState } from "react";

export default function AIPage() {
  const [category, setCategory] = useState("Sub-12");
  const [duration, setDuration] = useState("1h30");
  const [objective, setObjective] = useState("Posse de bola");
  const [result, setResult] = useState("");

  const generateTraining = async () => {
    setResult("Gerando treino com IA Qwen2.5... 🤖");
    const res = await fetch("http://localhost:8081/ai/generate_training", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, duration, objective })
    });
    const text = await res.text();
    setResult(text);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">🧠 IA Pequenos Gigantes (Qwen 2.5)</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">⚽ Gerador de Treino</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0D1117] border border-[#30363D] p-2 rounded text-white">
                <option>Sub-10</option><option>Sub-12</option><option>Sub-14</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Duração</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-[#0D1117] border border-[#30363D] p-2 rounded text-white">
                <option>1h</option><option>1h30</option><option>2h</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Objetivo do Treino</label>
              <input value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full bg-[#0D1117] border border-[#30363D] p-2 rounded text-white" />
            </div>
            <button onClick={generateTraining} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition">
              Criar com IA
            </button>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 whitespace-pre-wrap font-mono text-sm">
          <h2 className="text-xl font-bold mb-4">📋 Resultado</h2>
          <div className="bg-[#0D1117] p-4 rounded-lg border border-[#21262D] min-h-[300px]">
            {result || "Seu treino personalizado aparecerá aqui."}
          </div>
        </div>
      </div>
    </div>
  );
}
