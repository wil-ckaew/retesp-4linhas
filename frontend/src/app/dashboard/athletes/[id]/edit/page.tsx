// frontend/src/app/dashboard/athletes/[id]/edit/pages.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Camera, Save, Trash2 } from "lucide-react";

// Obtém o ID da URL
function useAthleteId() {
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const athletesIndex = parts.indexOf('athletes');
  if (athletesIndex !== -1 && parts.length > athletesIndex + 1) {
    return parts[athletesIndex + 1];
  }
  return null;
}

type Athlete = {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
};

export default function EditAthletePage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    category: "Sub-12",
  });
  
  // Estado para a foto do atleta
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Estado para a ficha PDF
  const [medicalFormFile, setMedicalFormFile] = useState<File | null>(null);
  const [medicalFormUrl, setMedicalFormUrl] = useState<string | null>(null);
  const [currentMedicalFormUrl, setCurrentMedicalFormUrl] = useState<string | null>(null);
  const [uploadingMedicalForm, setUploadingMedicalForm] = useState(false);
  const medicalInputRef = useRef<HTMLInputElement>(null);

  // Pegar o ID da URL no cliente
  useEffect(() => {
    const athleteId = useAthleteId();
    if (athleteId) {
      setId(athleteId);
    }
  }, []);

  // Buscar dados do atleta
  useEffect(() => {
    const fetchAthlete = async () => {
      if (!id) return;
      
      try {
        const res = await fetch(`http://192.168.100.105:8081/athletes/${id}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (res.ok) {
          const data: Athlete = await res.json();
          setFormData({
            name: data.name,
            birth_date: data.birth_date,
            category: data.category,
          });
          setCurrentAvatarUrl(data.avatar_url);
          setAvatarUrl(data.avatar_url);
          setCurrentMedicalFormUrl(data.medical_form_url);
          setMedicalFormUrl(data.medical_form_url);
        } else {
          alert("Erro ao buscar dados do atleta.");
          router.push("/dashboard/athletes");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro de comunicação.");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchAthlete();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload da foto do atleta
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Apenas arquivos de imagem são permitidos para a foto.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A foto deve ter no máximo 5MB.");
      return;
    }

    setAvatarFile(file);
    setUploadingAvatar(true);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("athlete_id", id || "00000000-0000-0000-0000-000000000000");

    try {
      const res = await fetch("http://192.168.100.105:8081/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
        alert("🖼️ Foto atualizada com sucesso!");
      } else {
        alert("Erro ao fazer upload da foto.");
        setAvatarFile(null);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação ao enviar a foto.");
      setAvatarFile(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // Upload da ficha PDF
  const handleMedicalFormUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Apenas arquivos PDF são permitidos para a ficha médica.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo PDF deve ter no máximo 10MB.");
      return;
    }

    setMedicalFormFile(file);
    setUploadingMedicalForm(true);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("athlete_id", id || "00000000-0000-0000-0000-000000000000");

    try {
      const res = await fetch("http://192.168.100.105:8081/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setMedicalFormUrl(data.url);
        alert("📄 Ficha médica atualizada com sucesso!");
      } else {
        alert("Erro ao fazer upload da ficha médica.");
        setMedicalFormFile(null);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação ao enviar a ficha.");
      setMedicalFormFile(null);
    } finally {
      setUploadingMedicalForm(false);
    }
  };

  const removeMedicalForm = () => {
    setMedicalFormFile(null);
    setMedicalFormUrl(null);
    if (medicalInputRef.current) medicalInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Nome do atleta é obrigatório.");
      return;
    }
    if (!formData.birth_date) {
      alert("Data de nascimento é obrigatória.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        birth_date: formData.birth_date,
        category: formData.category,
        avatar_url: avatarUrl,
        medical_form_url: medicalFormUrl,
      };

      const res = await fetch(`http://192.168.100.105:8081/athletes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Atleta atualizado com sucesso!");
        router.push("/dashboard/athletes");
      } else {
        const err = await res.text();
        alert(`❌ Erro: ${err}`);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar o atleta
  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este atleta?")) return;
    
    try {
      const res = await fetch(`http://192.168.100.105:8081/athletes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Atleta excluído com sucesso!");
        router.push("/dashboard/athletes");
      } else {
        alert("Erro ao excluir atleta.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação.");
    }
  };

  if (fetching) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center py-8 text-gray-400">Carregando dados do atleta...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition px-4 py-2 rounded-lg hover:bg-red-900/20"
        >
          <Trash2 size={20} /> Excluir
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">✏️ Editar Atleta</h1>

      <form onSubmit={handleSubmit} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
        {/* Foto do Atleta */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            🖼️ Foto do Atleta
          </label>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Preview da foto atual */}
            {(currentAvatarUrl || avatarUrl) && !avatarFile && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0">
                <img 
                  src={`http://192.168.100.105:8081${avatarUrl || currentAvatarUrl}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                avatarFile
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {uploadingAvatar ? (
                "⏳ Enviando..."
              ) : avatarFile ? (
                <>
                  <Camera size={16} />
                  {avatarFile.name}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {currentAvatarUrl ? "Trocar Foto" : "Anexar Foto"}
                </>
              )}
            </button>

            {(avatarFile || currentAvatarUrl) && (
              <button
                type="button"
                onClick={removeAvatar}
                className="text-red-400 hover:text-red-300 transition p-1"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Aceita imagens JPG, PNG, GIF (máx 5MB)
          </p>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Nome completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Digite o nome do atleta"
            required
          />
        </div>

        {/* Data de Nascimento */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Data de nascimento</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Categoria / Turma</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Sub-10">Sub-10</option>
            <option value="Sub-12">Sub-12</option>
            <option value="Sub-14">Sub-14</option>
            <option value="Sub-16">Sub-16</option>
            <option value="Sub-18">Sub-18</option>
          </select>
        </div>

        {/* Ficha Médica PDF */}
        <div className="border-t border-[#30363D] pt-4 mt-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            📄 Ficha do Atleta (3 páginas - Dados + Ficha Médica)
          </label>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Mostrar PDF atual */}
            {currentMedicalFormUrl && !medicalFormFile && (
              <a
                href={`http://192.168.100.105:8081${currentMedicalFormUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-sm"
              >
                <FileText size={16} />
                PDF Atual
              </a>
            )}

            <input
              type="file"
              accept=".pdf"
              ref={medicalInputRef}
              onChange={handleMedicalFormUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => medicalInputRef.current?.click()}
              disabled={uploadingMedicalForm}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                medicalFormFile
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {uploadingMedicalForm ? (
                "⏳ Enviando..."
              ) : medicalFormFile ? (
                <>
                  <FileText size={16} />
                  {medicalFormFile.name}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {currentMedicalFormUrl ? "Trocar Ficha" : "Anexar Ficha PDF"}
                </>
              )}
            </button>

            {(medicalFormFile || currentMedicalFormUrl) && (
              <button
                type="button"
                onClick={removeMedicalForm}
                className="text-red-400 hover:text-red-300 transition p-1"
              >
                <X size={20} />
              </button>
            )}

            {medicalFormUrl && !medicalFormFile && (
              <a
                href={`http://192.168.100.105:8081${medicalFormUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
              >
                <FileText size={14} /> Visualizar PDF
              </a>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Aceita apenas arquivos PDF (máx 10MB). A ficha deve conter dados do atleta e ficha médica.
          </p>
        </div>

        {/* Botão de Submissão */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "⏳ Atualizando..." : <><Save size={20} /> Atualizar Atleta</>}
        </button>
      </form>
    </div>
  );
}
