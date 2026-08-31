import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RETESP 4L - Sistema de Gestão Esportiva",
  description: "Sistema completo de gestão para o RETESP 4L",
  icons: {
    icon: "/images/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-app text-primary min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 ml-72 min-h-screen">
          <header className="bg-card border-b border-card px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-card border border-card flex items-center justify-center">
                <Image 
                  src="/images/logo.jpeg" 
                  alt="RETESP 4L" 
                  width={36} 
                  height={36} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black tracking-tight text-red-500 leading-none">RETESP</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-green-500 leading-tight">4 Linhas</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary">Administrador</span>
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
            </div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
