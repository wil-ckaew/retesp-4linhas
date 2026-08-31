"use client";
import { useState, useEffect } from "react";
import { 
  User, Shield, Bell, Moon, Sun, 
  Database, Palette, CheckCircle
} from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState("appearance");
  const [currentClass, setCurrentClass] = useState('dark');
  const [showNotification, setShowNotification] = useState(false);
  
  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "system", label: "Sistema", icon: Database },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
      setCurrentClass(savedTheme);
    } else {
      document.documentElement.className = 'dark';
      setCurrentClass('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setCurrentClass(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
    document.body.style.backgroundColor = newTheme === 'dark' ? '#0D1117' : '#f0f2f5';
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const isDark = theme === 'dark';

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-50">
          <CheckCircle size={20} />
          <span>Tema alterado para {isDark ? '🌙 Escuro' : '☀️ Claro'}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">⚙️ Configurações</h1>
          <p className="text-secondary mt-1">Gerencie suas preferências do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            isDark 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-green-500/10 text-green-600 border-green-500/30'
          }`}>
            {isDark ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-card pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive
                  ? isDark ? "bg-green-600 text-white" : "bg-green-600 text-white"
                  : "text-secondary hover:text-primary hover:bg-hover"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-card rounded-2xl p-6 shadow-card">
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Palette size={24} className="text-green-500" />
              Aparência
              <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                isDark ? 'bg-hover text-secondary' : 'bg-hover text-secondary'
              }`}>
                {isDark ? '🌙 Escuro' : '☀️ Claro'}
              </span>
            </h2>
            
            <div className={`p-6 rounded-lg border transition-all ${
              isDark 
                ? 'bg-input border-card' 
                : 'bg-input border-card shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-primary font-medium text-lg">
                    {isDark ? (
                      <span className="flex items-center gap-2">🌙 Modo Escuro</span>
                    ) : (
                      <span className="flex items-center gap-2">☀️ Modo Claro</span>
                    )}
                  </p>
                  <p className="text-secondary text-sm mt-1">
                    {isDark 
                      ? "Cores escuras para reduzir o cansaço visual" 
                      : "Cores suaves e claras para melhor legibilidade"}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-6 py-3 rounded-lg transition font-bold text-lg min-w-[140px] shadow-sm ${
                    isDark 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isDark ? "🌙 Escuro" : "☀️ Claro"}
                </button>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border transition-all ${
              isDark 
                ? 'bg-input border-card' 
                : 'bg-input border-card shadow-sm'
            }`}>
              <p className="text-secondary text-sm flex items-center gap-2">
                <span>💡</span>
                O tema é salvo automaticamente no seu navegador.
              </p>
              <p className="text-xs text-secondary mt-2 flex items-center gap-2">
                Classe atual: 
                <code className={`px-2 py-1 rounded ${
                  isDark ? 'bg-hover' : 'bg-hover'
                }`}>
                  {currentClass}
                </code>
              </p>
            </div>

            {/* Cards demonstrativos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-primary border-card' : 'bg-primary border-card shadow-sm'
              }`}>
                <p className={`text-xs ${isDark ? 'text-secondary' : 'text-secondary'}`}>bg-primary</p>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-card border-card' : 'bg-card border-card shadow-sm'
              }`}>
                <p className={`text-xs ${isDark ? 'text-secondary' : 'text-secondary'}`}>bg-card</p>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-input border-card' : 'bg-input border-card shadow-sm'
              }`}>
                <p className={`text-xs ${isDark ? 'text-secondary' : 'text-secondary'}`}>bg-input</p>
              </div>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-hover border-card' : 'bg-hover border-card shadow-sm'
              }`}>
                <p className={`text-xs ${isDark ? 'text-secondary' : 'text-secondary'}`}>bg-hover</p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "appearance" && (
          <div className="text-center text-secondary py-8">
            <p>Conteúdo da aba {activeTab}</p>
            <p className="text-sm mt-2">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  );
}
