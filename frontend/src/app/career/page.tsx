"use client";
import { useState } from "react";

export default function CareerPage() {
  const [athleteId, setAthleteId] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const generatePortfolio = async () => {
    if(!athleteId) return;
    const res = await fetch(`http://localhost:8081/career/${athleteId}`);
    const text = await res.text();
    setPortfolio(text);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📄 Plano de Carreira (Currículo Esportivo)</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl">
        <p className="mb-4 text-gray-400">Gere um portfólio profissional para apresentar o atleta a clubes e olheiros.</p>
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
            placeholder="ID do Atleta (UUID)"
            value={athleteId} onChange={(e) => setAthleteId(e.target.value)}
          />
          <button onClick={generatePortfolio} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">
            Gerar
          </button>
        </div>
        {portfolio && (
          <div className="mt-6 p-4 bg-[#0D1117] border border-[#21262D] rounded-lg whitespace-pre-wrap">
            {portfolio}
          </div>
        )}
      </div>
    </div>
  );
}
