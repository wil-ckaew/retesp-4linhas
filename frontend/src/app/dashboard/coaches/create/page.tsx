"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type CoachFormData = {
  name: string;
  email: string;
  specialization: string;
};

export default function CreateCoachPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<CoachFormData>();

  const onSubmit = async (data: CoachFormData) => {
    try {
      const res = await fetch("http://localhost:8081/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          specialization: data.specialization || null,
        }),
      });
      if (res.ok) {
        alert("Professor cadastrado com sucesso!");
        router.push("/dashboard/coaches");
      } else {
        const errorText = await res.text();
        alert(`Erro ao cadastrar: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">➕ Novo Professor</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input {...register("name", { required: "Nome é obrigatório" })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...register("email", { required: "Email é obrigatório" })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Especialização</label>
            <input {...register("specialization")} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" placeholder="Ex: Goleiros, Físico, etc" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">Cadastrar</button>
            <button type="button" onClick={() => router.back()} className="bg-[#21262D] hover:bg-[#30363D] px-6 py-3 rounded-lg font-bold transition text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
