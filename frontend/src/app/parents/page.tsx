"use client";
import { useState, useEffect, useRef } from "react";

type Athlete = {
  id: string;
  name: string;
  category: string;
  avatar_url?: string;
};

type AthleteSummary = {
  id: string;
  name: string;
  category: string;
  avatar_url?: string;
  frequency: number;
  evolution: string;
};

type MediaItem = {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
};

export default function ParentsPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AthleteSummary | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  // Carregar lista de atletas
  useEffect(() => {
    fetch("http://localhost:8081/athletes?_t=" + Date.now())
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAthletes(data);
      })
      .catch(err => console.error("Erro ao carregar atletas:", err));
  }, []);

  // Carregar dados do atleta selecionado
  const loadAthleteData = async (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setLoading(true);
    try {
      const [summaryRes, mediaRes] = await Promise.all([
        fetch(`http://localhost:8081/parents/summary/${athleteId}?_t=` + Date.now()),
        fetch(`http://localhost:8081/parents/media/${athleteId}?_t=` + Date.now())
      ]);
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
      
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        if (Array.isArray(mediaData)) setMediaList(mediaData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do atleta:", err);
      alert("Erro ao carregar informações do atleta.");
    } finally {
      setLoading(false);
    }
  };

  // Função de Upload de Mídia
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAthleteId) {
      alert("Selecione um atleta e um arquivo.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("athlete_id", selectedAthleteId);

    try {
      const res = await fetch("http://localhost:8081/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const mediaRes = await fetch(`http://localhost:8081/parents/media/${selectedAthleteId}?_t=` + Date.now());
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData)) setMediaList(mediaData);
        }
        alert("Arquivo enviado com sucesso!");
      } else {
        const errorText = await res.text();
        alert(`Erro ao enviar: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Função para excluir uma mídia
  const deleteMedia = async (id: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) return;
    try {
      const res = await fetch(`http://localhost:8081/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Arquivo excluído com sucesso!");
        // Recarregar a lista
        const mediaRes = await fetch(`http://localhost:8081/parents/media/${selectedAthleteId}?_t=` + Date.now());
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData)) setMediaList(mediaData);
        }
      } else {
        const errorText = await res.text();
        alert(`Erro ao excluir: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    }
  };

  // Função para renomear uma mídia
  const renameMedia = async (id: string) => {
    if (!newName.trim()) {
      alert("Digite um novo nome.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_name: newName }),
      });
      if (res.ok) {
        alert("Arquivo renomeado com sucesso!");
        setEditingId(null);
        setNewName("");
        // Recarregar a lista
        const mediaRes = await fetch(`http://localhost:8081/parents/media/${selectedAthleteId}?_t=` + Date.now());
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData)) setMediaList(mediaData);
        }
      } else {
        const errorText = await res.text();
        alert(`Erro ao renomear: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">👨‍👩‍👦 Portal dos Responsáveis</h1>

      {/* Seleção de Atleta */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Selecione seu filho(a):</label>
        <select
          value={selectedAthleteId || ""}
          onChange={(e) => loadAthleteData(e.target.value)}
          className="w-full md:w-64 bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white"
        >
          <option value="">Selecione...</option>
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {selectedAthleteId && (
        <>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Carregando dados...</div>
          ) : (
            <>
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {summary?.avatar_url ? (
                      <img src={`http://localhost:8081${summary.avatar_url}`} alt={summary.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl">{summary?.name?.charAt(0) || "👤"}</div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{summary?.name}</h2>
                      <p className="text-gray-400">{summary?.category}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">📊 Frequência</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-green-400">{summary?.frequency.toFixed(0)}%</span>
                    <div className="h-2 flex-1 bg-[#0D1117] rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${summary?.frequency || 0}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">🏆 Evolução</h3>
                  <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30 inline-block">
                    <span className="text-xl">{summary?.evolution}</span>
                  </div>
                </div>
              </div>

              {/* Galeria de Mídia */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">📸 Fotos e Vídeos do Meu Filho</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      {uploading ? "Enviando..." : "📤 Upload"}
                    </button>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      ref={fileInputRef}
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {mediaList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma foto ou vídeo ainda. Use o botão "Upload" para adicionar.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaList.map((item) => (
                      <div key={item.id} className="bg-[#0D1117] border border-[#21262D] rounded-lg overflow-hidden group relative">
                        {item.media_type === "photo" ? (
                          <img 
                            src={`http://localhost:8081${item.file_url}`} 
                            alt="Foto" 
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <video 
                            src={`http://localhost:8081${item.file_url}`} 
                            className="w-full h-40 object-cover"
                            controls
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-gray-300">{new Date(item.uploaded_at).toLocaleDateString()}</p>
                        </div>
                        
                        {/* Botões de Editar e Excluir */}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const fileName = item.file_url.split('/').pop() || 'arquivo';
                              setEditingId(item.id);
                              setNewName(fileName.replace(/\.[^/.]+$/, ""));
                            }}
                            className="bg-blue-600/80 hover:bg-blue-600 p-1.5 rounded-full text-white backdrop-blur-sm"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const fileName = item.file_url.split('/').pop() || 'arquivo';
                              deleteMedia(item.id, fileName);
                            }}
                            className="bg-red-600/80 hover:bg-red-600 p-1.5 rounded-full text-white backdrop-blur-sm"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Input para renomear */}
                        {editingId === item.id && (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-10">
                            <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 w-full max-w-xs">
                              <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-[#0D1117] border border-[#30363D] rounded p-2 text-white mb-2"
                                placeholder="Novo nome"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => renameMedia(item.id)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-1.5 rounded text-sm"
                                >
                                  Salvar
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingId(null);
                                    setNewName("");
                                  }}
                                  className="flex-1 bg-[#21262D] hover:bg-[#30363D] py-1.5 rounded text-sm text-gray-300"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
