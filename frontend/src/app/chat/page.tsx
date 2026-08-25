"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { user: "João", text: "Bom treino hoje pessoal!", time: "14:30" },
    { user: "Pedro", text: "Verdade, a parte de finalização foi ótima.", time: "14:32" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if(!input.trim()) return;
    const newMsg = { user: "Eu", text: input, time: new Date().toLocaleTimeString() };
    setMessages([...messages, newMsg]);

    // Verifica com a IA Moderadora
    const res = await fetch("http://localhost:8081/ai/moderate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const result = await res.json();
    if(result.status === "blocked") {
      alert(`🚨 IA Moderadora: ${result.reason}`);
    }
    setInput("");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        💬 Chat Inteligente <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">IA Moderadora Ativa</span>
      </h1>

      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className={`p-3 rounded-xl max-w-[70%] ${msg.user === "Eu" ? "bg-blue-600 ml-auto" : "bg-[#21262D]"}`}>
                <p className="text-sm font-bold text-gray-300">{msg.user}</p>
                <p>{msg.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 ml-2">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
            placeholder="Digite sua mensagem..." 
            value={input} onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-blue-600 px-6 rounded-lg hover:bg-blue-700 transition">Enviar</button>
        </div>
      </div>
    </div>
  );
}
