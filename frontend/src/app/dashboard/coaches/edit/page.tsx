"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

type CoachFormData = {
  name: string;
  email: string;
  specialization: string;
};

function EditCoachForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CoachFormData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { alert("ID não encontrado."); router.push("/dashboard/coaches"); return; }
    const fetchCoach = async () => {
      try {
        const res = await fetch(`http://192.168.100.105:8081/coaches/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar");
        const data = await res.json();
        setValue("name", data.name);
        setValue("email", data.email);
        setValue("specialization", data.specialization || "");
        setLoading(false);
      } catch (err) { console.error(err); alert("Erro ao carregar"); router.push("/dashboard/coaches"); }
    };
    fetchCoach();
  }, [id, setValue, router]);

  const onSubmit = async (data: CoachFormData) => {
    try {
      const res = await fetch(`http://192.168.100.105:8081/coaches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          specialization: data.specialization || null,
        }),
      });
      if (res.ok) {
        alert("Professor atualizado com sucesso!");
        router.push("/dashboard/coaches");
      } else {
        const errorText = await res.text();
        alert(`Erro ao atualizar: ${errorText}`);
      }
    } catch (err) { console.error(err); alert("Erro de comunicação."); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">✎ Editar Professor</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nome Completo</label><input {...register("name", { required: true })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" {...register("email", { required: true })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" /></div>
          <div><label className="block text-sm font-medium mb-1">Especialização</label><input {...register("specialization")} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" /></div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">Salvar</button>
            <button type="button" onClick={() => router.back()} className="bg-[#21262D] hover:bg-[#30363D] px-6 py-3 rounded-lg font-bold transition text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditCoachPage() {
  return <Suspense fallback={<div className="p-8 text-center text-gray-400">Carregando...</div>}><EditCoachForm /></Suspense>;
}
