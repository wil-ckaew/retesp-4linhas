"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Users, CheckSquare, Video, Share2, Brain } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const features = [
    { 
      icon: Users, 
      title: "Atletas", 
      description: "Gerencie todos os atletas cadastrados",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/dashboard/athletes"
    },
    { 
      icon: CheckSquare, 
      title: "Chamada", 
      description: "Registre a presença dos atletas",
      color: "text-green-400",
      bg: "bg-green-400/10",
      href: "/attendance"
    },
    { 
      icon: Video, 
      title: "Mídias", 
      description: "Fotos e vídeos dos treinos",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/media/photos"
    },
    { 
      icon: Share2, 
      title: "Rede Social", 
      description: "Compartilhe momentos da equipe",
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      href: "/social"
    },
    { 
      icon: Brain, 
      title: "IA RETESP", 
      description: "Treinos personalizados com IA",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      href: "/ai"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <div className="relative overflow-hidden px-6 py-16 sm:py-24 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-card border border-card flex items-center justify-center">
                <Image 
                  src="/images/logo.jpeg" 
                  alt="RETESP 4L" 
                  width={64} 
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-4xl font-black tracking-tight text-red-500">RETESP</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-green-500">4 Linhas</span>
                </div>
              </div>
            </div>
            <p className="text-lg text-secondary mt-2">
              Sistema de Gestão Esportiva
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                ✅ Conectado ao backend
              </span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105 text-white"
            >
              Acessar Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-primary">📋 Módulos do Sistema</h2>
          <p className="text-secondary mt-2">Gerencie todos os aspectos do RETESP 4L</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(feature.href)}
                className="group relative bg-card border border-card rounded-2xl p-6 text-left hover:border-blue-500/50 transition-all hover:scale-[1.02]"
              >
                <div className={`inline-flex rounded-lg ${feature.bg} p-3 mb-4`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm text-secondary">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300">
                  Acessar
                  <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-card py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-secondary">
          <span className="text-red-500 font-bold">RETESP</span>
          <span className="text-green-500 font-bold">4 Linhas</span>
          <span>• v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
