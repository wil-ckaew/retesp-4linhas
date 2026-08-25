//  frontend/src/app/social/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Video, X, Send, Trash2, Link as LinkIcon, Copy, Check, Play } from "lucide-react";

type SocialPost = {
  id: string;
  author_name: string;
  team_name: string;
  content: string;
  image_url?: string | null;
  video_url?: string | null;
  created_at: string;
  likes: number;
  comments: number;
};

type Story = {
  id: number;
  user: string;
  image?: string;
  video_url?: string;
  type: 'image' | 'video';
};

export default function SocialPage() {
  const [feed, setFeed] = useState<SocialPost[]>([]);
  const [filteredFeed, setFilteredFeed] = useState<SocialPost[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<{[key: string]: number}>({});
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [shareMenuOpenId, setShareMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTeam, setNewPostTeam] = useState("Sub-12");
  
  // Estado separado para foto e vídeo
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<Story[]>([
    { id: 1, user: "João", image: "https://i.pravatar.cc/150?img=1", type: 'image' },
    { id: 2, user: "Pedro", image: "https://i.pravatar.cc/150?img=2", type: 'image' },
    { id: 3, user: "Lucas", image: "https://i.pravatar.cc/150?img=3", type: 'image' },
  ]);
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const fetchFeed = async () => {
    try {
      const res = await fetch("http://localhost:8081/social/feed?_t=" + Date.now());
      if (!res.ok) throw new Error("Erro ao carregar feed");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFeed(data);
        setFilteredFeed(data);
        const likesMap: {[key: string]: number} = {};
        data.forEach((post: SocialPost) => {
          likesMap[post.id] = post.likes;
        });
        setLikes(likesMap);
      }
    } catch (err) {
      console.error("Erro ao buscar feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filterByTeam = (team: string | null) => {
    setSelectedTeam(team);
    if (team) {
      setFilteredFeed(feed.filter(post => post.team_name === team));
    } else {
      setFilteredFeed(feed);
    }
  };

  const toggleLike = (postId: string) => {
    setLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  };

  const handleCreatePost = async () => {
    // Verifica se há conteúdo ou arquivos
    if (!newPostContent.trim() && !selectedPhoto && !selectedVideo) {
      alert("Escreva algo ou selecione um arquivo.");
      return;
    }

    setUploading(true);
    let image_url: string | null = null;
    let video_url: string | null = null;

    try {
      // 1. Se houver uma foto selecionada, faz o upload
      if (selectedPhoto) {
        const formData = new FormData();
        formData.append("file", selectedPhoto);
        formData.append("athlete_id", "00000000-0000-0000-0000-000000000000");

        const uploadRes = await fetch("http://localhost:8081/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          alert("Erro ao fazer upload da foto.");
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        image_url = uploadData.url;
      }

      // 2. Se houver um vídeo selecionado, faz o upload
      if (selectedVideo) {
        const formData = new FormData();
        formData.append("file", selectedVideo);
        formData.append("athlete_id", "00000000-0000-0000-0000-000000000000");

        const uploadRes = await fetch("http://localhost:8081/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          alert("Erro ao fazer upload do vídeo.");
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        video_url = uploadData.url;
      }

      // 3. Criar a postagem no Backend
      const res = await fetch("http://localhost:8081/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: newPostTeam,
          content: newPostContent,
          image_url: image_url,
          video_url: video_url,
        }),
      });

      if (res.ok) {
        setNewPostContent("");
        setSelectedPhoto(null);
        setSelectedVideo(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
        fetchFeed();
        alert("Postagem criada com sucesso!");
      } else {
        const errorText = await res.text();
        alert(`Erro ao criar postagem: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;
    try {
      const res = await fetch(`http://localhost:8081/social/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Postagem excluída com sucesso!");
        setMenuOpenId(null);
        fetchFeed();
      } else {
        alert("Erro ao excluir a postagem.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação.");
    }
  };

  const shareViaLink = (postId: string) => {
    const url = `${window.location.origin}/social?post=${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    });
    setShareMenuOpenId(null);
  };

  const shareToWhatsApp = (post: SocialPost) => {
    const text = encodeURIComponent(`Confira esta postagem do RETESP! 🏆\n\n${post.content}\n\n🔗 ${window.location.origin}/social?post=${post.id}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareMenuOpenId(null);
  };

  const shareToFacebook = (post: SocialPost) => {
    const url = encodeURIComponent(`${window.location.origin}/social?post=${post.id}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShareMenuOpenId(null);
  };

  const shareToInstagram = (post: SocialPost) => {
    const url = encodeURIComponent(`${window.location.origin}/social?post=${post.id}`);
    window.location.href = `instagram://share?text=${encodeURIComponent(post.content)}&url=${url}`;
    setShareMenuOpenId(null);
  };

  const shareToStatus = (post: SocialPost) => {
    if (post.video_url) {
      const newStory: Story = {
        id: Date.now(),
        user: "Você",
        video_url: post.video_url,
        type: 'video',
      };
      setStories(prev => [newStory, ...prev]);
      alert("📱 Vídeo compartilhado para o seu Story!");
    } else if (post.image_url) {
      const newStory: Story = {
        id: Date.now(),
        user: "Você",
        image: `http://localhost:8081${post.image_url}`,
        type: 'image',
      };
      setStories(prev => [newStory, ...prev]);
      alert("📸 Imagem compartilhada para o seu Story!");
    } else {
      alert("Esta postagem não tem mídia para compartilhar.");
    }
    setShareMenuOpenId(null);
  };

  const teams = Array.from(new Set(feed.map(post => post.team_name)));

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📱 Rede Social RETESP</h1>

      {/* Stories */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 mb-6 overflow-x-auto">
        <h2 className="text-sm font-bold text-gray-400 mb-3">Stories</h2>
        <div className="flex gap-4">
          {stories.map((story) => (
            <div 
              key={story.id}
              onClick={() => setSelectedStory(story.id)}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-1">
                <div className="w-full h-full bg-[#161B22] rounded-full overflow-hidden border-2 border-[#161B22] relative">
                  {story.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <Play size={24} className="text-white opacity-80" />
                    </div>
                  ) : (
                    <img src={story.image} alt={story.user} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400">{story.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Story */}
      {selectedStory !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-2xl w-full relative">
            <button 
              onClick={() => setSelectedStory(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4">{stories.find(s => s.id === selectedStory)?.user}</h2>
              <div className="w-full aspect-video bg-[#0D1117] rounded-lg overflow-hidden">
                {stories.find(s => s.id === selectedStory)?.type === 'video' ? (
                  <video 
                    src={stories.find(s => s.id === selectedStory)?.video_url ? `http://localhost:8081${stories.find(s => s.id === selectedStory)?.video_url}` : ''}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                  />
                ) : (
                  <img 
                    src={stories.find(s => s.id === selectedStory)?.image} 
                    alt="Story" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <button 
                onClick={() => setSelectedStory(null)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtro por Turma */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button 
          onClick={() => filterByTeam(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${!selectedTeam ? 'bg-blue-600 text-white' : 'bg-[#21262D] text-gray-400 hover:text-white'}`}
        >
          Todas
        </button>
        {teams.map(team => (
          <button 
            key={team}
            onClick={() => filterByTeam(team)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedTeam === team ? 'bg-blue-600 text-white' : 'bg-[#21262D] text-gray-400 hover:text-white'}`}
          >
            {team}
          </button>
        ))}
      </div>

      {/* Formulário de Nova Postagem */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Criar Postagem</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={newPostTeam}
              onChange={(e) => setNewPostTeam(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-lg p-2 text-white text-sm"
            >
              <option value="Sub-10">Sub-10</option>
              <option value="Sub-12">Sub-12</option>
              <option value="Sub-14">Sub-14</option>
            </select>
          </div>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white min-h-[80px] resize-none"
            placeholder="O que está acontecendo?"
          />
          <div className="flex items-center gap-4">
            {/* Botão para anexar foto */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <ImageIcon size={20} />
                <span className="text-sm">
                  {selectedPhoto ? selectedPhoto.name : "Anexar Foto"}
                </span>
                {selectedPhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(null);
                      if (photoInputRef.current) photoInputRef.current.value = "";
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </button>
            </div>

            {/* Botão para anexar vídeo */}
            <div className="relative">
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <Video size={20} />
                <span className="text-sm">
                  {selectedVideo ? selectedVideo.name : "Anexar Vídeo"}
                </span>
                {selectedVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVideo(null);
                      if (videoInputRef.current) videoInputRef.current.value = "";
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </button>
            </div>

            {/* Botão Publicar */}
            <button
              onClick={handleCreatePost}
              disabled={uploading}
              className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {uploading ? "Publicando..." : <><Send size={16} /> Publicar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Feed de Postagens */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Carregando postagens...</div>
      ) : (
        <div className="space-y-6">
          {filteredFeed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma postagem encontrada para esta turma.
            </div>
          ) : (
            filteredFeed.map((post) => (
              <div key={post.id} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{post.team_name}</p>
                      <p className="text-xs text-gray-400">{post.author_name} • {new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="relative flex gap-2">
                    {/* Menu de 3 pontinhos */}
                    <div className="relative">
                      <button 
                        onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                        className="text-gray-500 hover:text-white transition p-1 rounded-full hover:bg-[#21262D]"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {menuOpenId === post.id && (
                        <div className="absolute right-0 top-10 z-10 bg-[#21262D] border border-[#30363D] rounded-lg shadow-xl w-40 overflow-hidden">
                          <button
                            onClick={() => deletePost(post.id)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 transition text-sm"
                          >
                            <Trash2 size={16} />
                            Excluir postagem
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botão de Compartilhar */}
                    <div className="relative">
                      <button 
                        onClick={() => setShareMenuOpenId(shareMenuOpenId === post.id ? null : post.id)}
                        className="text-gray-500 hover:text-green-500 transition p-1 rounded-full hover:bg-[#21262D]"
                      >
                        <Share2 size={20} />
                      </button>
                      {shareMenuOpenId === post.id && (
                        <div className="absolute right-0 top-10 z-10 bg-[#21262D] border border-[#30363D] rounded-lg shadow-xl w-48 overflow-hidden">
                          <button
                            onClick={() => shareViaLink(post.id)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:bg-[#30363D] transition text-sm"
                          >
                            {copiedId === post.id ? (
                              <><Check size={16} className="text-green-400" /> Link copiado!</>
                            ) : (
                              <><Copy size={16} /> Copiar link</>
                            )}
                          </button>
                          <button
                            onClick={() => shareToWhatsApp(post)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-green-400 hover:bg-green-900/20 transition text-sm border-t border-[#30363D]"
                          >
                            💬 WhatsApp
                          </button>
                          <button
                            onClick={() => shareToFacebook(post)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-blue-400 hover:bg-blue-900/20 transition text-sm border-t border-[#30363D]"
                          >
                            📘 Facebook
                          </button>
                          <button
                            onClick={() => shareToInstagram(post)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-pink-400 hover:bg-pink-900/20 transition text-sm border-t border-[#30363D]"
                          >
                            📸 Instagram
                          </button>
                          <button
                            onClick={() => shareToStatus(post)}
                            className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:bg-[#30363D] transition text-sm border-t border-[#30363D]"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                            Status RETESP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.image_url && (
                  <div className="w-full h-64 bg-[#0D1117] border border-[#21262D] rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src={`http://localhost:8081${post.image_url}`} 
                      alt="Imagem da postagem" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {post.video_url && (
                  <div className="w-full bg-[#0D1117] border border-[#21262D] rounded-lg mb-4 overflow-hidden relative">
                    <video 
                      src={`http://localhost:8081${post.video_url}`} 
                      className="w-full h-full object-cover max-h-[400px]"
                      controls
                      preload="metadata"
                      playsInline
                      onError={(e) => console.error('Erro no vídeo:', e)}
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                )}

                <div className="flex items-center gap-6 border-t border-[#21262D] pt-4">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Heart size={20} /> {likes[post.id] || 0}
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition">
                    <MessageCircle size={20} /> {post.comments}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
