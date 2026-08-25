import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, Users, UserCog, Users2, Calendar, 
  CheckSquare, Camera, Video, Share2, MessageSquare, 
  Award, Brain, FileText, Map, Settings 
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Atletas", href: "/dashboard/athletes", icon: Users },
  { name: "Professores", href: "/dashboard/coaches", icon: UserCog },
  { name: "Turmas", href: "/dashboard/teams", icon: Users2 },
  { name: "Portal Pais", href: "/parents", icon: Users },
  { name: "Treinos", href: "/trainings", icon: Calendar },
  { name: "Chamada", href: "/attendance", icon: CheckSquare },
  { name: "Fotos", href: "/media/photos", icon: Camera },
  { name: "Vídeos", href: "/media/videos", icon: Video },
  { name: "Rede Social", href: "/social", icon: Share2 },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Ranking", href: "/ranking", icon: Award },
  { name: "IA RETESP", href: "/ai", icon: Brain },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Mapa Social", href: "/map", icon: Map },
  { name: "Configurações", href: "/settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#161B22] border-r border-[#30363D] fixed h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#161B22] border border-[#30363D] flex items-center justify-center flex-shrink-0">
          <Image 
            src="/images/logo.jpeg" 
            alt="RETESP 4L" 
            width={48} 
            height={48} 
            className="object-cover w-full h-full"
            priority
          />
        </div>
        <div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-red-500 leading-none">RETESP</span>
            <span className="text-sm font-bold text-green-500 leading-tight">4 Linhas</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Sistema de Gestão</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-[#21262D] hover:text-white transition-all"
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[#30363D]">
        <div className="p-3 bg-[#21262D] rounded-xl">
          <p className="text-xs text-gray-500">Online</p>
          <p className="font-bold text-sm text-white">Administrador</p>
        </div>
      </div>
    </aside>
  );
}
