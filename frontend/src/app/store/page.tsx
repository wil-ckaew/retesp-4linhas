"use client";
import { useState } from "react";

export default function StorePage() {
  const items = [
    { id: 1, name: "Chuteira de Campo", cost: 500, icon: "👟" },
    { id: 2, name: "Uniforme RETESP", cost: 200, icon: "👕" },
    { id: 3, name: "Aula de Reforço (1h)", cost: 100, icon: "📚" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🛒 Loja de Recompensas (Retesp Coins)</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 hover:border-yellow-500/50 transition">
            <div className="text-6xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p className="text-yellow-400 font-bold text-lg mt-2">{item.cost} 🪙</p>
            <button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-bold transition">
              Trocar Moedas
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
