"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

type AthleteFormData = {
  name: string;
  birth_date: string;
  category: string;
  avatar?: FileList;
};

// Componente interno que usa useSearchParams (isolado para o Suspense)
function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AthleteFormData>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert("ID do atleta não encontrado.");
      router.push("/dashboard/athletes");
      return;
    }
    const fetchAthlete = async () => {
      try {
        const res = await fetch(`http://localhost:8081/athletes/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar atleta");
        const data = await res.json();
        setValue("name", data.name);
        setValue("birth_date", data.birth_date);
        setValue("category", data.category);
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do atleta.");
        router.push("/dashboard/athletes");
      }
    };
    fetchAthlete();
  }, [id, setValue, router]);

  const onSubmit = async (data: AthleteFormData) => {
    try {
      let avatar_url = null;
      if (data.avatar && data.avatar.length > 0) {
        const file = data.avatar[0];
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("http://localhost:8081/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          avatar_url = json.url;
        }
      }
      const res = await fetch(`http://localhost:8081/athletes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, birth_date: data.birth_date, category: data.category, avatar_url }),
      });
      if (res.ok) {
        alert("Atleta atualizado com sucesso!");
        router.push("/dashboard/athletes");
      } else {
        const errorText = await res.text();
        alert(`Erro ao atualizar: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação com o servidor.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">✎ Editar Atleta</h1>
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input {...register("name", { required: "Nome é obrigatório" })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
            <input type="date" {...register("birth_date", { required: "Data é obrigatória" })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select {...register("category", { required: "Categoria é obrigatória" })} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white">
              <option value="">Selecione...</option>
              <option value="Sub-10">Sub-10</option>
              <option value="Sub-12">Sub-12</option>
              <option value="Sub-14">Sub-14</option>
              <option value="Sub-16">Sub-16</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Foto do Atleta</label>
            <input type="file" accept="image/*" {...register("avatar")} onChange={(e) => { const file = e.target.files?.[0]; if (file) setAvatarPreview(URL.createObjectURL(file)); }} className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            {avatarPreview && <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border border-[#30363D]"><img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /></div>}
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">Salvar Alterações</button>
            <button type="button" onClick={() => router.back()} className="bg-[#21262D] hover:bg-[#30363D] px-6 py-3 rounded-lg font-bold transition text-gray-300">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Página principal envolvida no Suspense
export default function EditAthletePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Carregando página de edição...</div>}>
      <EditForm />
    </Suspense>
  );
}
