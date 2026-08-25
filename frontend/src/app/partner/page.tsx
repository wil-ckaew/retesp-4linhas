"use client";
import { useState } from "react";

export default function PartnerPortal() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const generateImpactReport = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8003/generate_scout_pdf/00000000-0000-0000-0000-000000000000");
    const data = await res.json();
    setReport(data.pdf_base64);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🏢 Portal do Patrocinador</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-4xl">
        <p className="text-gray-400 mb-6">Acompanhe o impacto social do seu investimento em tempo real.</p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0D1117] p-4 rounded-lg border border-[#21262D]">
            <p className="text-sm text-gray-400">Crianças Atendidas</p>
            <p className="text-3xl font-bold">105</p>
          </div>
          <div className="bg-[#0D1117] p-4 rounded-lg border border-[#21262D]">
            <p className="text-sm text-gray-400">Treinos Realizados</p>
            <p className="text-3xl font-bold">342</p>
          </div>
          <div className="bg-[#0D1117] p-4 rounded-lg border border-[#21262D]">
            <p className="text-sm text-gray-400">Impacto Social</p>
            <p className="text-3xl font-bold text-green-400">Alto</p>
          </div>
        </div>

        <button 
          onClick={generateImpactReport}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition"
        >
          {loading ? "Gerando PDF..." : "📄 Gerar Relatório de Impacto (PDF)"}
        </button>

        {report && (
          <div className="mt-6 p-4 bg-[#0D1117] border border-[#21262D] rounded-lg">
            <p className="text-green-400 mb-2">✅ Relatório gerado com sucesso!</p>
            <a href={`data:application/pdf;base64,${report}`} download="relatorio_impacto_retesp.pdf" className="text-blue-400 underline">
              Baixar PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
