// frontend/src/app/dashboard/athletes/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, FileText, Calendar, Users, ChevronDown, ChevronUp, Download, Phone, MapPin, Home, Building, Mail, AlertTriangle } from "lucide-react";

type Athlete = {
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
};

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 🔧 URL FIXA DO BACKEND - Substitua pelo seu IP se mudar
  const API_URL = "http://192.168.100.105:8081";

  const fetchAthletes = async () => {
    try {
      const res = await fetch(`${API_URL}/athletes?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Atletas carregados:", data.length);
        setAthletes(data);
        setImageErrors({});
      } else {
        console.error("❌ Erro ao buscar atletas:", res.status);
      }
    } catch (error) {
      console.error("❌ Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const deleteAthlete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este atleta?")) return;
    try {
      const res = await fetch(`${API_URL}/athletes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Atleta excluído com sucesso!");
        fetchAthletes();
      } else {
        alert("Erro ao excluir atleta.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleImageError = (athleteId: string, url: string) => {
    console.error(`Erro ao carregar imagem para o atleta ${athleteId}:`, url);
    setImageErrors(prev => ({ ...prev, [athleteId]: true }));
  };

  const getImageUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    return `${API_URL}${avatarUrl}`;
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "Não informado";
    return phone;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#161B22] border-2 border-[#30363D] flex items-center justify-center shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300">
            <Image
              src="/images/logo.jpeg"
              alt="RETESP 4L"
              width={64}
              height={64}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black tracking-tight text-red-500 leading-none">RETESP</span>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">v2.0</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-green-500 leading-tight">4 Linhas</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-sm text-gray-400">Atletas</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-xs text-gray-500 bg-[#161B22] px-2 py-0.5 rounded-full border border-[#30363D]">
                {athletes.length} {athletes.length === 1 ? 'atleta' : 'atletas'}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/athletes/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 font-medium"
        >
          <Plus size={20} /> Novo Atleta
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando atletas...</div>
      ) : (
        <div className="grid gap-4">
          {athletes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum atleta cadastrado.
            </div>
          ) : (
            athletes.map((athlete) => {
              const imageUrl = getImageUrl(athlete.avatar_url);
              return (
                <div
                  key={athlete.id}
                  className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div
                    className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                    onClick={() => toggleExpand(athlete.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 relative ring-2 ring-blue-500/20">
                        {imageUrl && !imageErrors[athlete.id] ? (
                          <img
                            src={imageUrl}
                            alt={athlete.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(athlete.id, imageUrl)}
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {athlete.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-lg">{athlete.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(athlete.birth_date).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {athlete.category}
                          </span>
                          <span className="flex items-center gap-1 text-blue-400">
                            <ClockIcon size={14} />
                            {calculateAge(athlete.birth_date)} anos
                          </span>
                          {athlete.phone && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Phone size={14} />
                              {formatPhone(athlete.phone)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/athletes/${athlete.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-blue-400 transition rounded-lg hover:bg-[#21262D]"
                      >
                        <Eye size={20} />
                      </Link>
                      <Link
                        href={`/dashboard/athletes/${athlete.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition rounded-lg hover:bg-[#21262D]"
                      >
                        <Pencil size={20} />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAthlete(athlete.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-[#21262D]"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(athlete.id);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-[#21262D]"
                      >
                        {expandedId === athlete.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
