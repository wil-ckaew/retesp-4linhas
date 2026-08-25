// frontend/src/app/dashboard/videos/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Video, 
  Calendar, 
  User,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

type VideoItem = {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
  athlete_id?: string;
  title?: string;
  description?: string;
};

type Athlete = {
  id: string;
  name: string;
  category: string;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      const res = await fetch("http://localhost:8081/media/videos?_t=" + Date.now());
      if (!res.ok) throw new Error("Erro ao carregar vídeos");
      const data = await res.json();
      if (Array.isArray(data)) setVideos(data);
    } catch (err) {
      console.error("Erro ao buscar vídeos:", err);
    }
  };

  const fetchAthletes = async () => {
    try {
      const res = await fetch("http://localhost:8081/athletes?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setAthletes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar atletas:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchVideos(), fetchAthletes()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar se é vídeo
      if (!file.type.startsWith('video/')) {
        setErrorMessage("Por favor, selecione um arquivo de vídeo válido.");
        return;
      }
      // Validar tamanho (máx 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setErrorMessage("O vídeo não pode ter mais que 500MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      // Auto-fill título com nome do arquivo
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Por favor, selecione um vídeo.");
      return;
    }

    if (!selectedAthleteId) {
      setErrorMessage("Por favor, selecione um atleta.");
      return;
    }

    setUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("athlete_id", selectedAthleteId);

    try {
      // Usar xhr para ter controle de progresso
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Erro ${xhr.status}: ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Erro de conexão"));
        xhr.open("POST", "http://localhost:8081/upload"); // ROTA CORRETA
        xhr.send(formData);
      });

      await uploadPromise;
      
      setUploadStatus("success");
      setUploadProgress(100);
      
      // Recarregar lista de vídeos
      await fetchVideos();
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        resetModal();
        setShowUploadModal(false);
      }, 2000);

    } catch (error: any) {
      console.error("Erro no upload:", error);
      setUploadStatus("error");
      setErrorMessage(error.message || "Erro ao fazer upload do vídeo.");
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setVideoTitle("");
    setVideoDescription("");
    setSelectedAthleteId("");
    setUploadProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
    try {
      const res = await fetch(`http://localhost:8081/media/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchVideos();
      } else {
        alert("Erro ao excluir vídeo.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de comunicação.");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#161B22] border-2 border-[#30363D] flex items-center justify-center shadow-lg">
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
                Vídeos
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-green-500 leading-tight">4 Linhas</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-sm text-gray-400">Central de Vídeos</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="text-xs text-gray-500 bg-[#161B22] px-2 py-0.5 rounded-full border border-[#30363D]">
                {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 font-medium"
        >
          <Plus size={20} /> Novo Vídeo
        </button>
      </div>

      {/* Lista de Vídeos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Carregando vídeos...</span>
        </div>
      ) : (
        <>
          {videos.length === 0 ? (
            <div className="text-center py-16 bg-[#161B22] rounded-2xl border border-[#30363D]">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">Nenhum vídeo disponível</h3>
              <p className="text-gray-500 mb-4">Comece fazendo upload do primeiro vídeo.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                <Upload size={18} /> Fazer Upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group"
                >
                  <div className="relative aspect-video bg-[#0D1117]">
                    <video 
                      src={`http://localhost:8081${item.file_url}`} 
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteVideo(item.id)}
                        className="p-1.5 bg-red-600/90 hover:bg-red-700 rounded-lg transition"
                        title="Excluir vídeo"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#30363D]">
                    <p className="font-medium text-sm truncate">{item.athlete_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-400">{item.athlete_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {formatDate(item.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#161B22] border-b border-[#30363D] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileVideo className="text-blue-400" />
                Upload de Vídeo
              </h2>
              <button
                onClick={() => {
                  resetModal();
                  setShowUploadModal(false);
                }}
                className="p-2 hover:bg-[#21262D] rounded-lg transition"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {uploadStatus === "success" ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-500">Upload Concluído!</h3>
                  <p className="text-gray-400 mt-2">O vídeo foi enviado com sucesso.</p>
                </div>
              ) : uploadStatus === "error" ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-500">Erro no Upload</h3>
                  <p className="text-gray-400 mt-2">{errorMessage}</p>
                  <button
                    onClick={() => setUploadStatus("idle")}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Atleta <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedAthleteId}
                      onChange={(e) => setSelectedAthleteId(e.target.value)}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                      disabled={uploading}
                    >
                      <option value="">Selecione um atleta</option>
                      {athletes.map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.name} - {athlete.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Vídeo (opcional)
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Ex: Treino de finalização"
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Adicione uma descrição para o vídeo..."
                      rows={3}
                      className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition resize-none"
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Arquivo de Vídeo <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                        selectedFile ? 'border-blue-500 bg-blue-500/5' : 'border-[#30363D] hover:border-blue-500/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                      {selectedFile ? (
                        <div>
                          <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="mt-2 text-xs text-red-400 hover:text-red-300 transition"
                          >
                            Remover arquivo
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">
                            Clique para selecionar ou arraste um vídeo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            MP4, WebM, AVI • Máx. 500MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Enviando...</span>
                        <span className="text-blue-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#0D1117] rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        resetModal();
                        setShowUploadModal(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#21262D] hover:bg-[#30363D] rounded-lg transition"
                      disabled={uploading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || !selectedAthleteId || uploading}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}