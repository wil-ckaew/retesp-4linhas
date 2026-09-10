"use client";
import { useState, useEffect } from "react";

type PhotoItem = {
  id: string;
  file_url: string;
  media_type: string;
  uploaded_at: string;
  athlete_name: string;
};

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("http://192.168.100.105:8081/media/photos?_t=" + Date.now());
        if (!res.ok) throw new Error("Erro ao carregar fotos");
        const data = await res.json();
        if (Array.isArray(data)) setPhotos(data);
      } catch (err) {
        console.error("Erro ao buscar fotos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📸 Central de Fotos</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando fotos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              Nenhuma foto disponível ainda. Faça upload na aba "Portal dos Pais".
            </div>
          ) : (
            photos.map((item) => (
              <div key={item.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-hidden">
                <div className="relative aspect-square bg-[#0D1117]">
                  <img 
                    src={`http://192.168.100.105:8081${item.file_url}`} 
                    alt={`Foto de ${item.athlete_name}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 border-t border-[#30363D]">
                  <p className="font-medium text-sm">{item.athlete_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
