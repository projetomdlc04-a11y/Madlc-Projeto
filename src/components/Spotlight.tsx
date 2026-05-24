import React, { useState, useEffect, useRef } from "react";
import { Search, Bot, Calculator, FileText, Settings, AppWindow, Globe } from "lucide-react";
import { AppId, FileRecord, NoteRecord } from "../types";

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  files: FileRecord[];
  notes: NoteRecord[];
  onTriggerSiriText: (text: string) => void;
}

export default function Spotlight({
  isOpen,
  onClose,
  onOpenApp,
  files,
  notes,
  onTriggerSiriText,
}: SpotlightProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Evaluate arithmetic calculations
  const evaluateCalculation = (): string | null => {
    // Regex matches basic calculations like: 10 + 20, 2.5 * 4, 100 / 2, etc.
    const calcRegex = /^[\d\s+\-*/().,]+$/;
    if (calcRegex.test(query) && /[+\-*/]/.test(query)) {
      try {
        // Safe sanitization parse evaluation
        const sanitized = query.replace(/,/g, ".").replace(/[^0-9+\-*/().]/g, "");
        const evalResult = Function(`"use strict"; return (${sanitized})`)();
        if (typeof evalResult === "number" && !isNaN(evalResult) && isFinite(evalResult)) {
          return String(evalResult);
        }
      } catch (e) {
        return null; // Invalid expressions show regular app checks
      }
    }
    return null;
  };

  const calcResult = evaluateCalculation();

  // Search through Applications
  const apps = [
    { id: "finder", name: "Finder.app", icon: "📁", desc: "Explorador de arquivos local" },
    { id: "safari", name: "Safari.app", icon: "🌐", desc: "Navegador de internet" },
    { id: "notes", name: "Notas.app", icon: "📝", desc: "Editor de notas pessoais" },
    { id: "command_line", name: "Terminal.app", icon: "📟", desc: "Console zsh de comandos" },
    { id: "calc", name: "Calculadora.app", icon: "🧮", desc: "Calculadora do sistema" },
    { id: "maps", name: "Mapas.app", icon: "🗺️", desc: "Mapas com pontos e GPS" },
    { id: "settings", name: "Ajustes.app", icon: "⚙️", desc: "Painel de controle do computador" },
    { id: "appstore", name: "App Store.app", icon: "", desc: "Loja de aplicativos" },
  ];

  const matchedApps = apps.filter((app) =>
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.desc.toLowerCase().includes(query.toLowerCase())
  );

  // Search through notes
  const matchedNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase())
  );

  // Search through system files
  const matchedFiles = files.filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = matchedApps.length + matchedNotes.length + matchedFiles.length + (calcResult ? 1 : 0);

  const handleAppLaunch = (appId: string) => {
    onOpenApp(appId as AppId);
    onClose();
  };

  const handleSiriForward = () => {
    onTriggerSiriText(query);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-transparent flex items-start justify-center pt-28 z-[9995] font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Stop propagation from body close triggers
        id="spotlight-panel"
        className="w-[520px] max-w-[95%] bg-white/55 text-slate-800 rounded-2xl border border-white/35 shadow-2xl backdrop-blur-[45px] overflow-hidden flex flex-col"
      >
        {/* Spotlight input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/15 bg-white/20">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Busca Spotlight (Calculadora, Aplicativos, Siri)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="spotlight-input"
            className="flex-1 bg-transparent border-none text-slate-850 text-sm focus:outline-none placeholder-slate-500 tracking-wide font-sans pl-1"
          />
          <div className="bg-black/5 text-slate-600 text-[9px] px-2 py-0.5 rounded-md font-display font-bold uppercase tracking-wider border border-black/5">
            esc
          </div>
        </div>

        {/* Results Body column container */}
        {query.trim() && (
          <div className="max-h-[360px] overflow-y-auto divide-y divide-black/5 p-2 space-y-1 bg-white/20">
            {/* 1. Arithmetic Outputs */}
            {calcResult && (
              <div className="p-2 flex items-center justify-between hover:bg-black/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calculator className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-slate-600 font-semibold font-mono">Resultado da Conta:</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 font-mono pr-2">{calcResult}</span>
              </div>
            )}

            {/* 2. Matched Applications list */}
            {matchedApps.length > 0 && (
              <div className="p-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider pl-2 block mb-1">Aplicativos</span>
                {matchedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppLaunch(app.id)}
                    className="w-full p-2 flex items-center justify-between hover:bg-black/5 rounded-lg text-left transition focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{app.icon}</span>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{app.name}</h4>
                        <p className="text-[10px] text-slate-500">{app.desc}</p>
                      </div>
                    </div>
                    <AppWindow className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  </button>
                ))}
              </div>
            )}

            {/* 3. Matched Notes lists */}
            {matchedNotes.length > 0 && (
              <div className="p-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider pl-2 block mb-1">Notas Pessoais</span>
                {matchedNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleAppLaunch("notes")}
                    className="w-full p-2 flex items-center justify-between hover:bg-black/5 rounded-lg text-left transition focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{note.title || "Sem título"}</h4>
                        <p className="text-[10px] text-slate-500 truncate max-w-[340px]">{note.content}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 4. Matched system files */}
            {matchedFiles.length > 0 && (
              <div className="p-1">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider pl-2 block mb-1">Arquivos</span>
                {matchedFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleAppLaunch("finder")}
                    className="w-full p-2 flex items-center justify-between hover:bg-black/5 rounded-lg text-left transition focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs">{file.type === "folder" ? "📁" : "📄"}</span>
                      <h4 className="text-xs font-medium text-slate-800">{file.name}</h4>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* AI Siri prompt forward fallback */}
            <div className="p-1">
              <button
                onClick={handleSiriForward}
                className="w-full p-2.5 flex items-center gap-3 hover:bg-blue-600/10 text-blue-600 hover:text-blue-700 rounded-lg text-left transition font-semibold text-xs border border-blue-100 bg-blue-50/20"
              >
                <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Perguntar para Siri inteligente: "{query}"</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty status overview */}
        {!query.trim() && (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1.5 leading-normal">
            <span className="block font-bold text-slate-750">Consulte o macOS Catalina/Sequoia</span>
            <span className="block text-[11px] text-slate-500">Busque por aplicativos, faça contas matemáticas rápidas, ou pergunte diretamente para o assistente Siri.</span>
            <div className="pt-3 flex justify-center gap-2">
              <span className="bg-black/5 text-slate-650 text-[9px] px-2 py-0.5 rounded-md font-mono border border-black/5">⌘ + Espaço</span>
              <span className="text-slate-400">para abrir a qualquer momento</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
