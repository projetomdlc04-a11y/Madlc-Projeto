import React, { useState } from "react";
import { Monitor, Palette, Cpu, Trash2, HardDrive, ShieldCheck, Sun } from "lucide-react";
import { SystemConfig } from "../types";

interface SettingsAppProps {
  config: SystemConfig;
  onUpdateConfig: (updated: Partial<SystemConfig>) => void;
  onClearStorage: () => void;
}

export default function SettingsApp({ config, onUpdateConfig, onClearStorage }: SettingsAppProps) {
  const [activeTab, setActiveTab] = useState<"wallpaper" | "accent" | "about" | "reset">("wallpaper");
  const [customWallpaperInput, setCustomWallpaperInput] = useState("");

  const tabs = [
    { id: "wallpaper", name: "Fundo de Tela", icon: <Monitor className="w-4 h-4 text-blue-500" /> },
    { id: "accent", name: "Aparência & Cores", icon: <Palette className="w-4 h-4 text-purple-500" /> },
    { id: "about", name: "Sobre este Mac", icon: <Cpu className="w-4 h-4 text-orange-500" /> },
    { id: "reset", name: "Redefinir Sistema", icon: <Trash2 className="w-4 h-4 text-red-500" /> },
  ];

  const wallpaperPresets = [
    { id: "grad-sonoma", name: "Sonoma Sunset Gradient", type: "gradient", value: "linear-gradient(to right, #e056fd, #f0932b, #eb4d4b)" },
    { id: "grad-dark", name: "Deep Space Ink", type: "gradient", value: "linear-gradient(to bottom, #0f172a, #1e1b4b, #311042)" },
    { id: "img-mojave", name: "Mojave Desert Dunes", type: "image", value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
    { id: "img-lavender", name: "Minimalist Lavender Forest", type: "image", value: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200&q=80" },
    { id: "img-aurora", name: "Northern lights Aurora", type: "image", value: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80" },
  ];

  const accentColors: Array<{ id: SystemConfig["accentColor"]; name: string; class: string }> = [
    { id: "blue", name: "Azul Clássico", class: "bg-blue-600" },
    { id: "purple", name: "Roxo Real", class: "bg-purple-600" },
    { id: "orange", name: "Laranja Solar", class: "bg-orange-500" },
    { id: "red", name: "Vermelho Maçã", class: "bg-red-600" },
    { id: "graphite", name: "Grafite Escuro", class: "bg-neutral-600" },
  ];

  const handleCustomWallpaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWallpaperInput.trim()) {
      onUpdateConfig({ wallpaperId: "custom-" + Date.now() });
      // Inject standard wallpaper target
      const style = document.createElement("style");
      style.id = "custom-wallpaper-style";
      style.innerHTML = `.custom-wallpaper-bg { background-image: url('${customWallpaperInput}') !important; background-size: cover; background-position: center; }`;
      
      const oldStyle = document.getElementById("custom-wallpaper-style");
      if (oldStyle) oldStyle.remove();
      document.head.appendChild(style);
      setCustomWallpaperInput("");
    }
  };

  return (
    <div id="settings-layout-container" className="w-full h-full bg-[#f6f6f6] text-black flex rounded-b-xl overflow-hidden select-none font-sans">
      {/* 1. Left Sidebar Navigation */}
      <div className="w-48 bg-[#eaeaea] border-r border-gray-200 p-2 space-y-1 h-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold leading-tight transition text-left ${
                isActive ? "bg-black/10 text-slate-950 shadow-xs" : "text-slate-700 hover:bg-black/5 hover:text-slate-950"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Config Content area */}
      <div className="flex-1 bg-[#fafafa] p-6 overflow-y-auto h-full">
        {/* WALLPAPER TAB */}
        {activeTab === "wallpaper" && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-display">Ajustar Fundo de Tela</h3>
              <p className="text-[11px] text-slate-500 mt-1">Selecione uma imagem de alta definição ou degradê dinâmico como plano de fundo da mesa.</p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {wallpaperPresets.map((preset) => {
                const isSelected = config.wallpaperId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onUpdateConfig({ wallpaperId: preset.id })}
                    className={`p-1.5 rounded-xl bg-white border border-gray-200 text-left transition shadow-xs hover:shadow-md focus:outline-none ${
                      isSelected ? "ring-2 ring-blue-500 border-transparent shadow-md" : ""
                    }`}
                  >
                    <div
                      className="w-full h-18 rounded-lg"
                      style={
                        preset.type === "gradient"
                          ? { background: preset.value }
                          : { backgroundImage: `url(${preset.value})`, backgroundSize: "cover", backgroundPosition: "center" }
                      }
                    />
                    <div className="text-[10px] font-bold text-slate-700 mt-2 text-center text-ellipsis overflow-hidden truncate">
                      {preset.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomWallpaperSubmit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700">Usar imagem da internet (URL)</h4>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Cole o endereço da imagem..."
                  value={customWallpaperInput}
                  onChange={(e) => setCustomWallpaperInput(e.target.value)}
                  id="settings-wallpaper-url-input"
                  className="flex-1 bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  id="settings-wallpaper-submit-btn"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold shadow-md transition"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ACCENT COLOURS TAB */}
        {activeTab === "accent" && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-display">Cores de Destaque</h3>
              <p className="text-[11px] text-slate-500 mt-1">Altere a tonalidade metálica dos botões, menus, foco e seleção geral do sistema operacional.</p>
            </div>

            <div className="space-y-4">
              {accentColors.map((color) => {
                const isSelected = config.accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => onUpdateConfig({ accentColor: color.id })}
                    id={`settings-accent-${color.id}`}
                    className={`w-full bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition shadow-xs focus:outline-none ${
                      isSelected ? "ring-2 ring-blue-500 border-transparent shadow-xs" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-700">{color.name}</span>
                    <div className={`w-5 h-5 rounded-full ${color.class} border border-white/20`} />
                  </button>
                );
              })}
            </div>
            
            {/* Dark mode Switch toggle layout */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs mt-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-bold text-slate-700">Interface Escura (Dark Mode)</span>
              </div>
              <input
                type="checkbox"
                checked={config.darkMode}
                onChange={() => onUpdateConfig({ darkMode: !config.darkMode })}
                id="settings-toggle-dark-mode"
                className="w-4 h-4"
              />
            </div>
          </div>
        )}

        {/* ABOUT SYSTEM TAB */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-display">Sobre o Sistema</h3>
              <p className="text-[11px] text-slate-500 mt-1">Informações de hardware e diagnóstico simulação do seu dispositivo MacBook Pro.</p>
            </div>

            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
              <span className="text-5xl">🍏</span>
              <h2 className="text-base font-bold text-slate-900 mt-3 font-display">MacBook Pro</h2>
              <p className="text-xs text-slate-500 mt-1">16 polegadas, com Chip M3 Max</p>

              <div className="w-full divide-y divide-gray-100 text-xs text-slate-700 mt-6 font-medium">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Processador</span>
                  <span>Apple M3 Max (16 Cores)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Memória RAM</span>
                  <span>16 GB LPDDR5 (Unificada)</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Gráficos</span>
                  <span>Apple GPU Integrada de 40-core</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Sistema Operacional</span>
                  <span>macOS Sequoia 15.0</span>
                </div>
              </div>
            </div>

            {/* Storage Chart Visualizer */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-700">Uso do Disco SSD</h4>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div className="bg-[#ff9f0a] h-full" style={{ width: "45%" }} />
                <div className="bg-blue-500 h-full" style={{ width: "20%" }} />
                <div className="bg-slate-200 h-full flex-1" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>131.5 GB Sistema e Apps</span>
                <span>124.5 GB Livres</span>
                <span>Total: 256 GB</span>
              </div>
            </div>
          </div>
        )}

        {/* REDEFINIR/RESET TAB */}
        {activeTab === "reset" && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 font-display">Redefinições de Fábrica</h3>
              <p className="text-[11px] text-slate-500 mt-1">Limpe todos os arquivos salvos em Sandbox e retorne os parâmetros do sistema operacional aos originais recomendados.</p>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-red-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                Aviso de Perigo
              </h4>
              <p className="text-xs text-red-600 leading-relaxed font-semibold">
                Essa ação apagará permanentemente todas as suas notas salvas localmente, arquivos customizados pelo terminal/Finder, histórico da Siri inteligente e configurações de cores de destaque.
              </p>
              
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm("Você tem certeza absoluta que deseja apagar todos os dados simulados e recarregar a página?")) {
                      onClearStorage();
                    }
                  }}
                  id="settings-redefinir-btn"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-xs font-bold shadow-md hover:shadow-lg transition"
                >
                  Restaurar e Apagar Tudo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
