"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Calendar, User, Image as ImageIcon, Video, Download, X } from "lucide-react";

type MediaItem = {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
};

export default function MediaPage() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const fetchMedia = async () => {
    try {
      const [photosRes, videosRes] = await Promise.all([
        fetch("http://192.168.100.105:8081/media/photos"),
        fetch("http://192.168.100.105:8081/media/videos"),
      ]);

      const photosData = await photosRes.json();
      const videosData = await videosRes.json();

      setPhotos(photosData || []);
      setVideos(videosData || []);
    } catch (error) {
      console.error("Erro ao carregar mídias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentData = activeTab === "photos" ? photos : videos;
  const isEmpty = currentData.length === 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header com Logo e Título */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#161B22] border border-[#30363D] flex items-center justify-center p-1.5">
          <Image 
            src="/images/logo-retesp.svg" 
            alt="RETESP 4L" 
            width={40} 
            height={40} 
            className="object-contain w-full h-full"
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black tracking-tight text-red-500 leading-none">RETESP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-green-500 leading-tight">4 Linhas</span>
            <span className="text-xs text-gray-500 ml-2">• Mídia</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "photos"
              ? "bg-blue-600 text-white"
              : "bg-[#21262D] text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon size={18} />
          Fotos ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "videos"
              ? "bg-blue-600 text-white"
              : "bg-[#21262D] text-gray-400 hover:text-white"
          }`}
        >
          <Video size={18} />
          Vídeos ({videos.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando mídias...</div>
      ) : isEmpty ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">
            {activeTab === "photos" ? "🖼️" : "🎬"}
          </div>
          <p>Nenhum {activeTab === "photos" ? "foto" : "vídeo"} encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentData.map((item) => (
            <div
              key={item.id}
              className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden hover:border-blue-500/50 transition cursor-pointer group"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="relative aspect-square bg-[#0D1117] overflow-hidden">
                {item.media_type === "photo" ? (
                  <img
                    src={`http://192.168.100.105:8081${item.file_url}`}
                    alt={item.athlete_name || "Foto"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-blue-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="bg-blue-600 rounded-full p-3">
                    {item.media_type === "photo" ? (
                      <ImageIcon className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate">
                  {item.athlete_name || "Sem nome"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.uploaded_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Visualização */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#161B22] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="aspect-video bg-[#0D1117] flex items-center justify-center">
              {selectedMedia.media_type === "photo" ? (
                <img
                  src={`http://192.168.100.105:8081${selectedMedia.file_url}`}
                  alt={selectedMedia.athlete_name || "Foto"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={`http://192.168.100.105:8081${selectedMedia.file_url}`}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              )}
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {selectedMedia.athlete_name || "Sem nome"}
                </p>
                <p className="text-sm text-gray-400">
                  {formatDate(selectedMedia.uploaded_at)}
                </p>
              </div>
              <a
                href={`http://192.168.100.105:8081${selectedMedia.file_url}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                <Download size={18} />
                Baixar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
