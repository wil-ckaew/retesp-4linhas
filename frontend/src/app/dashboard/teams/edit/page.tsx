"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

type TeamFormData = {
  name: string;
  category: string;
};

function EditTeamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TeamFormData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { alert("ID não encontrado."); router.push("/dashboard/teams"); return; }
    const fetchTeam = async () => {
      try {
        const res = await fetch(`http://192.168.100.105:8081/teams/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar");
        const data = await res.json();
        setValue("name", data.name);
        setValue("category", data.category);
        setLoading(false);
      } catch (err) { console.error(err); alert("Erro ao carregar"); router.push("/dashboard/teams"); }
    };
    fetchTeam();
  }, [id, setValue, router]);

  const onSubmit = async (data: TeamFormData) => {
    try {
      const res = await fetch(`http://192.168.100.105:8081/teams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("Turma atualizada com sucesso!");
        router.push("/dashboard/teams");
      } else {
        const errorText = await res.text();
        alert(`Erro ao atualizar: ${errorText}`);
      }
    } catch (err) { console.error(err); alert("Erro de comunicação."); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">✎ Editar Turma</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome da Turma</label><input {...register("name", { required: true })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" /></div>
          <div><label className="block text-sm font-medium mb-1">Categoria</label><select {...register("category", { required: true })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white"><option value="">Selecione...</option><option value="Sub-10">Sub-10</option><option value="Sub-12">Sub-12</option><option value="Sub-14">Sub-14</option><option value="Sub-16">Sub-16</option><option value="Sub-20">Sub-20</option></select></div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">Salvar</button>
            <button type="button" onClick={() => router.back()} className="bg-[#21262D] hover:bg-[#30363D] px-6 py-3 rounded-lg font-bold transition text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditTeamPage() {
  return <Suspense fallback={<div className="p-8 text-center text-gray-400">Carregando...</div>}><EditTeamForm /></Suspense>;
}
