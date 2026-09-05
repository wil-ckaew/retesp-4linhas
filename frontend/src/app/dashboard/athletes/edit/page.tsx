// frontend/src/app/dashboard/athletes/[id]/edit/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Camera, Phone, MapPin, Home, Building, AlertTriangle } from "lucide-react";

interface Athlete {
  id: string;
  name: string;
  birth_date: string;
  category: string;
  avatar_url: string | null;
  medical_form_url: string | null;
  phone?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
}

export default function EditAthletePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    category: "",
    phone: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    emergency_contact: "",
    emergency_phone: "",
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

  useEffect(() => {
    fetchAthlete();
  }, [id]);

  const fetchAthlete = async () => {
    try {
      const res = await fetch(`http://localhost:8081/athletes/${id}?_t=${Date.now()}`);
      if (res.ok) {
        const data: Athlete = await res.json();
        console.log("📥 Dados do atleta:", data);
        
        setFormData({
          name: data.name || "",
          birth_date: data.birth_date || "",
          category: data.category || "",
          phone: data.phone || "",
          address: data.address || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          emergency_contact: data.emergency_contact || "",
          emergency_phone: data.emergency_phone || "",
        });
        setCurrentAvatarUrl(data.avatar_url);
        setCurrentMedicalFormUrl(data.medical_form_url);
      } else {
        alert("Erro ao carregar dados do atleta");
        router.push("/dashboard/athletes");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    formDataUpload.append("athlete_id", id);

    try {
      const res = await fetch("http://localhost:8081/upload", {
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
    formDataUpload.append("athlete_id", id);

    try {
      const res = await fetch("http://localhost:8081/upload", {
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

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        birth_date: formData.birth_date,
        category: formData.category,
        avatar_url: avatarUrl || currentAvatarUrl,
        medical_form_url: medicalFormUrl || currentMedicalFormUrl,
        phone: formData.phone || null,
        address: formData.address || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
      };

      console.log("📤 Atualizando dados:", payload);

      const res = await fetch(`http://localhost:8081/athletes/${id}`, {
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
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">⏳ Carregando dados do atleta...</div>;
  }

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://localhost:8081${url}`;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-3xl font-bold mb-6">✏️ Editar Atleta</h1>

      <form onSubmit={handleSubmit} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-4">
        {/* ========== FOTO ========== */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            🖼️ Foto do Atleta
          </label>
          
          <div className="flex items-center gap-4 flex-wrap">
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              {uploadingAvatar ? "⏳ Enviando..." : <><Camera size={16} /> Trocar Foto</>}
            </button>

            {(currentAvatarUrl || avatarUrl) && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                <img 
                  src={avatarUrl ? getImageUrl(avatarUrl) || undefined : getImageUrl(currentAvatarUrl) || undefined}
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Aceita imagens JPG, PNG, GIF (máx 5MB)</p>
        </div>

        {/* ========== NOME ========== */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">👤 Nome completo *</label>
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

        {/* ========== DATA DE NASCIMENTO ========== */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">📅 Data de nascimento *</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* ========== CATEGORIA ========== */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">🏷️ Categoria / Turma *</label>
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
            <option value="Sub-20">Sub-20</option>
          </select>
        </div>

        {/* ========== SEÇÃO: CONTATO & ENDEREÇO ========== */}
        <div className="border-t border-[#30363D] pt-4 mt-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3">📞 Contato & Endereço</h3>

          {/* Telefone */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
              <Phone size={14} /> Telefone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Endereço */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
              <MapPin size={14} /> Endereço
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Rua, número, complemento"
              rows={2}
            />
          </div>

          {/* Bairro */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
              <Home size={14} /> Bairro
            </label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Bairro"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                <Building size={14} /> Cidade
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Cidade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">UF</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 uppercase"
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          {/* CEP */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-400 mb-1">📮 CEP</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="00000-000"
            />
          </div>
        </div>

        {/* ========== SEÇÃO: CONTATO DE EMERGÊNCIA ========== */}
        <div className="border-t border-[#30363D] pt-4 mt-2">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1">
            <AlertTriangle size={14} /> Contato de Emergência
          </h3>

          {/* Contato de Emergência */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-400 mb-1">🆘 Nome do Contato</label>
            <input
              type="text"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Nome do contato de emergência"
            />
          </div>

          {/* Telefone de Emergência */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
              <Phone size={14} /> Telefone de Emergência
            </label>
            <input
              type="text"
              name="emergency_phone"
              value={formData.emergency_phone}
              onChange={handleChange}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {/* ========== SEÇÃO: FICHA MÉDICA ========== */}
        <div className="border-t border-[#30363D] pt-4 mt-2">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            📄 Ficha do Atleta (3 páginas - Dados + Ficha Médica)
          </label>
          
          <div className="flex items-center gap-4 flex-wrap">
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              {uploadingMedicalForm ? "⏳ Enviando..." : <><Upload size={16} /> Trocar Ficha</>}
            </button>

            {(currentMedicalFormUrl || medicalFormUrl) && (
              <a
                href={medicalFormUrl ? getImageUrl(medicalFormUrl) || undefined : getImageUrl(currentMedicalFormUrl) || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
              >
                <FileText size={14} /> Visualizar PDF
              </a>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Aceita apenas arquivos PDF (máx 10MB)</p>
        </div>

        {/* ========== BOTÕES ========== */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? "⏳ Salvando..." : "💾 Salvar Alterações"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/athletes")}
            className="flex-1 bg-[#21262D] hover:bg-[#30363D] py-3 rounded-lg font-bold transition text-gray-300"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}