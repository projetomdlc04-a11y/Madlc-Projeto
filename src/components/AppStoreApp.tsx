import React, { useState } from "react";
import { DownloadCloud, Star, Award, ShieldCheck, Grid, Terminal } from "lucide-react";

export default function AppStoreApp() {
  const [downloadedApps, setDownloadedApps] = useState<string[]>(["safari", "finder", "notes", "calc", "settings"]);

  const storeCatalog = [
    { id: "vscode", name: "Visual Studio Code", desc: "Editor de código fonte leve e ultra potente.", category: "Desenvolvimento", rating: "4.8", stars: 5, icon: "💻", isFree: true },
    { id: "figma", name: "Figma design", desc: "Ferramenta colaborativa de design de interfaces e protótipos.", category: "Design", rating: "4.9", stars: 5, icon: "🎨", isFree: true },
    { id: "spotify", name: "Spotify Music", desc: "Milhões de músicas e podcasts disponíveis para streaming.", category: "Entretenimento", rating: "4.7", stars: 4, icon: "🎵", isFree: true },
    { id: "slack", name: "Slack", desc: "Comunicação corporativa moderna de equipes em tempo real.", category: "Produtividade", rating: "4.6", stars: 4, icon: "💬", isFree: true },
    { id: "xcode", name: "Xcode IDE", desc: "Ambiente completo de desenvolvimento nativo para a linha Apple.", category: "Desenvolvimento", rating: "4.4", stars: 4, icon: "🛠️", isFree: true },
  ];

  const handleDownload = (appId: string) => {
    if (downloadedApps.includes(appId)) return;
    setDownloadedApps([...downloadedApps, appId]);
    alert("Aplicativo " + appId + " foi simulado para download e registro no macOS Catalina/Sequoia!");
  };

  return (
    <div id="appstore-layout-container" className="w-full h-full bg-[#f6f6f6] text-black flex flex-col rounded-b-xl overflow-hidden select-none font-sans">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-6 text-white flex justify-between items-center relative">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold font-display">Destaque do Dia</span>
          <h2 className="text-xl font-bold tracking-tight">Xcode 16 & AI Assistant</h2>
          <p className="text-xs text-white/80 max-w-sm leading-relaxed">Crie aplicativos incríveis para iOS, macOS e iPadOS com o poder das redes neurais integradas localmente.</p>
        </div>
        <div className="text-5xl opacity-45 pr-4 animate-bounce">
          
        </div>
      </div>

      {/* 2. Apps body list */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider mb-3">Aplicativos Mais Baixados</h3>
          <div className="space-y-3.5">
            {storeCatalog.map((app) => {
              const isDownloaded = downloadedApps.includes(app.id);
              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-50 border border-gray-150 rounded-xl flex items-center justify-center text-2xl shadow-xs">
                      {app.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{app.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal max-w-sm mt-0.5">{app.desc}</p>
                      
                      <div className="flex items-center gap-2.5 mt-2 text-[10px] text-slate-400 font-medium">
                        <span className="text-blue-600 font-semibold">{app.category}</span>
                        <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                          <Star className="w-3 h-3 fill-orange-400" />
                          <span>{app.rating}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(app.id)}
                    id={`appstore-get-${app.id}`}
                    className={`rounded-full px-4 py-1 text-xs font-bold transition flex items-center gap-1 focus:outline-none ${
                      isDownloaded
                        ? "bg-slate-100 text-slate-500 cursor-default"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
                    }`}
                  >
                    {isDownloaded ? "Instalado" : "Obter"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
