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
  // NOVOS CAMPOS
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

  const fetchAthletes = async () => {
    try {
      const res = await fetch("http://localhost:8081/athletes?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        console.log("Dados dos atletas:", data);
        setAthletes(data);
        setImageErrors({});
      }
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
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
      const res = await fetch(`http://localhost:8081/athletes/${id}`, {
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
    return `http://localhost:8081${avatarUrl}`;
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "Não informado";
    return phone;
  };

  const formatAddress = (athlete: Athlete) => {
    const parts = [];
    if (athlete.address) parts.push(athlete.address);
    if (athlete.neighborhood) parts.push(athlete.neighborhood);
    if (athlete.city) parts.push(athlete.city);
    if (athlete.state) parts.push(athlete.state);
    return parts.length > 0 ? parts.join(", ") : "Não informado";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Cabeçalho */}
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
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                v2.0
              </span>
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
                            onLoad={() => console.log(`Imagem carregada com sucesso para ${athlete.name}`)}
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
                          {athlete.medical_form_url && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <FileText size={14} />
                              Ficha Médica
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
                        title="Ver perfil completo"
                      >
                        <Eye size={20} />
                      </Link>

                      <Link
                        href={`/dashboard/athletes/${athlete.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-yellow-400 transition rounded-lg hover:bg-[#21262D]"
                        title="Editar atleta"
                      >
                        <Pencil size={20} />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAthlete(athlete.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-[#21262D]"
                        title="Excluir atleta"
                      >
                        <Trash2 size={20} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(athlete.id);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition rounded-lg hover:bg-[#21262D]"
                        title={expandedId === athlete.id ? "Recolher" : "Expandir"}
                      >
                        {expandedId === athlete.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {expandedId === athlete.id && (
                    <div className="border-t border-[#30363D] p-6 bg-[#0D1117]/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Coluna 1 - Informações Pessoais */}
                        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3">📋 Informações Pessoais</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Nome:</span>
                              <span className="font-medium">{athlete.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Data Nasc.:</span>
                              <span className="font-medium">{new Date(athlete.birth_date).toLocaleDateString("pt-BR")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Idade:</span>
                              <span className="font-medium text-blue-400">{calculateAge(athlete.birth_date)} anos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Categoria:</span>
                              <span className="font-medium text-purple-400">{athlete.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Status:</span>
                              <span className="font-medium text-green-400">✅ Ativo</span>
                            </div>
                          </div>
                        </div>

                        {/* Coluna 2 - Contato e Endereço (NOVOS CAMPOS) */}
                        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3">📞 Contato & Endereço</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Phone size={14} /> Telefone:
                              </span>
                              <span className="font-medium text-green-400">
                                {formatPhone(athlete.phone)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <MapPin size={14} /> Endereço:
                              </span>
                              <span className="font-medium text-sm text-right max-w-[180px]">
                                {athlete.address || "Não informado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Home size={14} /> Bairro:
                              </span>
                              <span className="font-medium">
                                {athlete.neighborhood || "Não informado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Building size={14} /> Cidade/UF:
                              </span>
                              <span className="font-medium">
                                {athlete.city || ""} {athlete.state ? `- ${athlete.state}` : ""}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">CEP:</span>
                              <span className="font-medium">
                                {athlete.zip_code || "Não informado"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Coluna 3 - Emergência e Documentos */}
                        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3">🆘 Emergência & Documentos</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <AlertTriangle size={14} /> Contato:
                              </span>
                              <span className="font-medium text-sm text-right max-w-[180px]">
                                {athlete.emergency_contact || "Não informado"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Phone size={14} /> Tel. Emergência:
                              </span>
                              <span className="font-medium text-red-400">
                                {athlete.emergency_phone || "Não informado"}
                              </span>
                            </div>
                            <div className="border-t border-[#30363D] pt-2 mt-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} className="text-purple-400" />
                                  <span className="text-sm">Ficha Médica</span>
                                </div>
                                {athlete.medical_form_url ? (
                                  <a
                                    href={`http://localhost:8081${athlete.medical_form_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download size={14} /> Visualizar
                                  </a>
                                ) : (
                                  <span className="text-gray-500 text-sm">Não anexado</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                  <Users size={16} className="text-blue-400" />
                                  <span className="text-sm">Foto</span>
                                </div>
                                {athlete.avatar_url ? (
                                  <a
                                    href={getImageUrl(athlete.avatar_url) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download size={14} /> Visualizar
                                  </a>
                                ) : (
                                  <span className="text-gray-500 text-sm">Não anexada</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação Rápida */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/athletes/${athlete.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={16} /> Ver Perfil Completo
                        </Link>
                        <Link
                          href={`/dashboard/athletes/${athlete.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil size={16} /> Editar Cadastro
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAthlete(athlete.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
                        >
                          <Trash2 size={16} /> Excluir Atleta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}