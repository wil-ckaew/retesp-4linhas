// frontend/src/app/dashboard/coaches/pages.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type Coach = {
  id: string;
  name: string;
  email: string;
  specialization: string | null;
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCoaches = async () => {
    try {
      const res = await fetch("http://192.168.100.105:8081/coaches?_t=" + Date.now());
      if (!res.ok) throw new Error("Erro na requisição");
      const data = await res.json();
      if (Array.isArray(data)) setCoaches(data);
    } catch (err) { console.error("Erro ao buscar coaches:", err); }
  };

  const deleteCoach = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o professor "${name}"?`)) return;
    try {
      const res = await fetch(`http://192.168.100.105:8081/coaches/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Professor excluído com sucesso!");
        if (expandedId === id) setExpandedId(null);
        fetchCoaches();
      } else {
        const errorText = await res.text();
        alert(`Erro ao excluir: ${errorText}`);
      }
    } catch (err) { alert("Erro de comunicação."); }
  };

  const toggleExpand = (id: string) => { setExpandedId(expandedId === id ? null : id); };

  useEffect(() => { fetchCoaches(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Professores</h1>
        <Link href="/dashboard/coaches/create"><button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">+ Novo Professor</button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">Nenhum professor cadastrado ainda.</div>
        ) : (
          coaches.map((c) => (
            <div key={c.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden hover:border-blue-500/50 transition cursor-pointer group" onClick={() => toggleExpand(c.id)}>
              <div className="p-6 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-xl text-white">🧑‍🏫</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">{c.name}</h3>
                  <p className="text-sm text-gray-400">{c.email}</p>
                </div>
                <div className="text-gray-500">{expandedId === c.id ? "▲" : "▼"}</div>
              </div>
              {expandedId === c.id && (
                <div className="px-6 pb-6 pt-0 border-t border-[#30363D] mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#0D1117] p-2 rounded-lg"><span className="text-gray-400 block">Especialização</span><span className="text-white">{c.specialization || "Não definida"}</span></div>
                    <div className="bg-[#0D1117] p-2 rounded-lg"><span className="text-gray-400 block">Email</span><span className="text-white">{c.email}</span></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/dashboard/coaches/edit?id=${c.id}`} className="flex-1">
                      <button className="w-full bg-[#21262D] hover:bg-[#30363D] py-1.5 rounded-lg text-xs text-gray-300 transition" onClick={(e) => e.stopPropagation()}>✎ Editar</button>
                    </Link>
                    <button className="flex-1 bg-red-900/50 hover:bg-red-900/80 py-1.5 rounded-lg text-xs text-red-400 transition" onClick={(e) => { e.stopPropagation(); deleteCoach(c.id, c.name); }}>🗑️ Excluir</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
