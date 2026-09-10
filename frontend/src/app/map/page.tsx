"use client";
import { useState, useEffect } from "react";

export default function MapPage() {
  const [nuclei, setNuclei] = useState<any[]>([]);
  const [selectedNucleus, setSelectedNucleus] = useState<string | null>(null);
  const [mapHtml, setMapHtml] = useState("");

  useEffect(() => {
    fetch("http://192.168.100.105:8081/nuclei")
      .then(res => res.json())
      .then(data => setNuclei(data));
  }, []);

  // CORREÇÃO AQUI: Tipagem explícita do parâmetro 'id' como string
  const loadMap = async (id: string) => {
    setSelectedNucleus(id);
    const res = await fetch(`http://localhost:8002/map/${id}`);
    const data = await res.json();
    setMapHtml(data.map_html);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🗺️ Mapa Social RETESP</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Núcleos Atendidos</h2>
          <div className="space-y-3">
            {nuclei.map((n: any) => (
              <div 
                key={n.id} 
                onClick={() => loadMap(n.id)}
                className={`p-4 rounded-lg cursor-pointer transition border ${selectedNucleus === n.id ? 'bg-blue-600/20 border-blue-500' : 'bg-[#0D1117] border-[#21262D] hover:border-blue-500'}`}
              >
                <p className="font-bold">{n.name}</p>
                <p className="text-xs text-gray-400">{n.neighborhood} - {n.total_children} crianças</p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 bg-[#161B22] border border-[#30363D] rounded-2xl p-6 min-h-[500px]">
          <h2 className="text-xl font-bold mb-4">Mapa Interativo</h2>
          {mapHtml ? (
            <div dangerouslySetInnerHTML={{ __html: mapHtml }} className="w-full h-[450px] rounded-lg overflow-hidden" />
          ) : (
            <div className="flex items-center justify-center h-[450px] text-gray-500">
              Selecione um núcleo para visualizar o mapa social.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
