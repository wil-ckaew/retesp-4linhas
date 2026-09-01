"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, Brain, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isAI?: boolean;
  isTyping?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      user: "IA Assistente", 
      text: "Olá! Sou sua assistente IA do Projeto 4 Linhas. Como posso ajudar você hoje? 💬", 
      time: new Date().toLocaleTimeString(),
      isAI: true
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (isLoading) return;

    const userMessage = input.trim();
    const newMsg: Message = {
      id: Date.now().toString(),
      user: "Eu",
      text: userMessage,
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    // Adicionar mensagem de "digitando"
    const typingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: typingMsgId,
      user: "IA Assistente",
      text: "digitando...",
      time: new Date().toLocaleTimeString(),
      isAI: true,
      isTyping: true
    }]);

    try {
      // Chamar a IA
      const res = await fetch('/api/ai/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          context: messages.slice(-5)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = data.response || "Desculpe, não entendi. Pode reformular?";
        
        setMessages(prev => prev.map(msg => 
          msg.id === typingMsgId 
            ? { ...msg, text: aiResponse, isTyping: false }
            : msg
        ));
      } else {
        throw new Error("Erro na API");
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessages(prev => prev.filter(msg => msg.id !== typingMsgId));
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        user: "IA Assistente",
        text: "⚠️ Desculpe, tive um problema. Pode repetir sua pergunta?",
        time: new Date().toLocaleTimeString(),
        isAI: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              💬 Chat com IA
            </h1>
            <p className="text-gray-400 mt-1">
              <Bot className="w-4 h-4 inline mr-2 text-blue-400" />
              Assistente virtual do Projeto 4 Linhas
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-400">IA Online</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user === "Eu" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] ${
                  msg.user === "Eu" 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : msg.isAI 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-[#21262D] text-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.isAI && <Bot className="w-4 h-4 text-purple-300" />}
                    <span className="text-sm font-bold">{msg.user}</span>
                    {msg.isTyping && (
                      <div className="flex items-center gap-1 ml-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150"></div>
                      </div>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-3">
            <input 
              className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="Digite sua mensagem sobre treinos..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className={`px-6 rounded-xl font-bold transition flex items-center gap-2 ${
                !input.trim() || isLoading
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-[#30363D] pt-4">
            <div className="flex items-center gap-4">
              <span>💬 {messages.length} mensagens</span>
              <span>•</span>
              <span className="text-green-400">🛡️ IA ativa</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Projeto 4 Linhas</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0D1117;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363D;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484F58;
        }
      `}</style>
    </div>
  );
}
