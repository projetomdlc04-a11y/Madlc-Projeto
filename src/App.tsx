import React, { useState, useEffect } from "react";
import { AppId, WindowInstance, FileRecord, NoteRecord, SystemConfig, WallpaperOption } from "./types";
import MenuBar from "./components/MenuBar";
import Dock from "./components/Dock";
import WindowFrame from "./components/WindowFrame";
import SiriWidget from "./components/SiriWidget";
import Spotlight from "./components/Spotlight";
import FinderApp from "./components/FinderApp";
import SafariApp from "./components/SafariApp";
import NotesApp from "./components/NotesApp";
import TerminalApp from "./components/TerminalApp";
import CalculatorApp from "./components/CalculatorApp";
import SettingsApp from "./components/SettingsApp";
import AppStoreApp from "./components/AppStoreApp";
import MapsApp from "./components/MapsApp";
import CalibracaoApp from "./components/CalibracaoApp";
import DespesasApp from "./components/DespesasApp";
import { Folder, FileText, Sliders, Volume2, Wifi, Bluetooth, Moon, Sun, DownloadCloud, Grid } from "lucide-react";

// Default Wallpaper presets mapper values
const wallpaperPresets: WallpaperOption[] = [
  { id: "grad-frosted", name: "Aurora Frosted Theme", type: "gradient", value: "linear-gradient(to bottom right, #1a4b9c, #8e52a3, #e47c7c)" },
  { id: "grad-sonoma", name: "Sonoma Sunset Gradient", type: "gradient", value: "linear-gradient(to right, #e056fd, #f0932b, #eb4d4b)" },
  { id: "grad-dark", name: "Deep Space Ink", type: "gradient", value: "linear-gradient(to bottom, #0f172a, #1e1b4b, #311042)" },
  { id: "img-mojave", name: "Mojave Desert Dunes", type: "image", value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
  { id: "img-lavender", name: "Minimalist Lavender Forest", type: "image", value: "https://images.unsplash.com/photo-1475113548554-5a36f1f523d6?auto=format&fit=crop&w=1200&q=80" },
  { id: "img-aurora", name: "Northern lights Aurora", type: "image", value: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80" },
];

export default function App() {
  //---------------------------------------------------------
  // 1. Initial Default Filesystem Sandboxing
  //---------------------------------------------------------
  const defaultFiles: FileRecord[] = [];

  const defaultNotes: NoteRecord[] = [
    { id: "init-note", title: "Primeiros Passos", content: "Bem-vindo ao aplicativo de Notas!\n\nSinta-se à vontade para criar novas notas, editar títulos e conteúdos. Tudo o que você digita aqui é persistido automaticamente no seu navegador.", updatedAt: "24 mai 22:22" },
    { id: "shopping-list", title: "Ideias Incríveis", content: "- Criar um chatbot inteligente com Inteligência Artificial\n- Configurar uma barra de navegação no Safari\n- Testar comandos zsh no terminal do Mac", updatedAt: "24 mai 22:20" },
  ];

  const defaultSystemConfig: SystemConfig = {
    wallpaperId: "grad-frosted",
    accentColor: "blue",
    darkMode: true,
    volume: 75,
    brightness: 80,
    wifi: true,
    bluetooth: true,
    dnd: false,
  };

  //---------------------------------------------------------
  // 2. React Persistent States (localStorage mirroring)
  //---------------------------------------------------------
  const [files, setFiles] = useState<FileRecord[]>(() => {
    const saved = localStorage.getItem("macos_sim_files");
    return saved ? JSON.parse(saved) : defaultFiles;
  });

  const [notes, setNotes] = useState<NoteRecord[]>(() => {
    const saved = localStorage.getItem("macos_sim_notes");
    return saved ? JSON.parse(saved) : defaultNotes;
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem("macos_sim_config");
    return saved ? JSON.parse(saved) : defaultSystemConfig;
  });

  // Window Manager states
  const [windows, setWindows] = useState<WindowInstance[]>([
    { id: "finder", title: "Finder", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 80, y: 80, width: 720, height: 420 },
    { id: "safari", title: "Safari Browser", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 120, y: 100, width: 760, height: 460 },
    { id: "notes", title: "Notas", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 150, y: 120, width: 680, height: 400 },
    { id: "command_line", title: "Terminal (zsh)", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 200, y: 140, width: 600, height: 360 },
    { id: "calc", title: "Calculadora", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 250, y: 180, width: 280, height: 440 },
    { id: "settings", title: "Ajustes do Sistema", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 180, y: 100, width: 700, height: 440 },
    { id: "maps", title: "Mapas", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 220, y: 110, width: 750, height: 440 },
    { id: "appstore", title: "App Store", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 140, y: 90, width: 680, height: 425 },
    { id: "calibracao", title: "Ficha de Calibração", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 100, y: 50, width: 840, height: 500 },
    { id: "despesas", title: "Despesa de Deslocamento", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10, x: 130, y: 70, width: 840, height: 500 },
  ]);

  const [activeAppId, setActiveAppId] = useState<AppId | null>(null);
  const [bouncingApps, setBouncingApps] = useState<Record<string, boolean>>({});
  const [isSiriOpen, setIsSiriOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [currentDirectoryId, setCurrentDirectoryId] = useState<string | null>(null);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);

  // Sync to Storage loops
  useEffect(() => {
    localStorage.setItem("macos_sim_files", JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem("macos_sim_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("macos_sim_config", JSON.stringify(systemConfig));
  }, [systemConfig]);

  // Command+Space spotlight listener shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSpotlightOpen(false);
        setIsLaunchpadOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  //---------------------------------------------------------
  // 3. UI Helpers & Accent bindings
  //---------------------------------------------------------
  const accentGradientClass = {
    blue: "bg-blue-600 border-blue-500",
    purple: "bg-purple-600 border-purple-500",
    orange: "bg-orange-500 border-orange-400",
    red: "bg-red-600 border-red-500",
    graphite: "bg-neutral-600 border-neutral-500",
  }[systemConfig.accentColor];

  const activeAppTitle = windows.find((w) => w.id === activeAppId)?.title || "Finder";

  // Dynamic Wallpaper styling resolver
  const getWallpaperStyle = () => {
    if (systemConfig.wallpaperId.startsWith("custom-")) {
      return { className: "custom-wallpaper-bg", style: {} };
    }
    const preset = wallpaperPresets.find((w) => w.id === systemConfig.wallpaperId) || wallpaperPresets[0];
    if (preset.type === "gradient") {
      return { className: "", style: { background: preset.value } };
    }
    return { className: "", style: { backgroundImage: `url(${preset.value})`, backgroundSize: "cover", backgroundPosition: "center" } };
  };

  const wallConf = getWallpaperStyle();

  //---------------------------------------------------------
  // 4. Window Manager Actions
  //---------------------------------------------------------
  const focusWindow = (id: AppId) => {
    setActiveAppId(id);
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 10);
      return prev.map((w) => {
        if (w.id === id) {
          return { ...w, zIndex: maxZ + 1, isMinimized: false };
        }
        return w;
      });
    });
  };

  const openApp = (id: AppId) => {
    setIsLaunchpadOpen(false); // Auto-close launchpads
    // Bounce animation trigger
    setBouncingApps((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setBouncingApps((prev) => ({ ...prev, [id]: false }));
    }, 1200);

    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, isOpen: true, isMinimized: false };
        }
        return w;
      })
    );
    focusWindow(id);
  };

  const closeWindow = (id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, isOpen: false };
        }
        return w;
      })
    );
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const minimizeWindow = (id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, isMinimized: true };
        }
        return w;
      })
    );
    if (activeAppId === id) {
      setActiveAppId(null);
    }
  };

  const toggleMaximizeWindow = (id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, isMaximized: !w.isMaximized };
        }
        return w;
      })
    );
  };

  //---------------------------------------------------------
  // 5. File System Traversal / Interaction
  //---------------------------------------------------------
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newRecord: FileRecord = {
      id: "folder-" + Date.now(),
      name,
      type: "folder",
      parentId,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setFiles((prev) => [...prev, newRecord]);
  };

  const handleCreateFile = (name: string, type: "txt", content: string, parentId: string | null) => {
    const newRecord: FileRecord = {
      id: "file-" + Date.now(),
      name,
      type,
      parentId,
      content,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setFiles((prev) => [...prev, newRecord]);
  };

  // Open file when clicked from desktop/Finder app
  const handleOpenFile = (file: FileRecord) => {
    if (file.type === "txt") {
      // Find or create note from txt
      const existingNote = notes.find((n) => n.title === file.name);
      if (!existingNote) {
        const newNote: NoteRecord = {
          id: "note-" + Date.now(),
          title: file.name,
          content: file.content || "",
          updatedAt: new Date().toLocaleDateString("pt-BR"),
        };
        setNotes((prev) => [newNote, ...prev]);
      }
      openApp("notes");
    } else if (file.type === "folder") {
      setCurrentDirectoryId(file.id);
      openApp("finder");
    } else {
      alert(`Abriu o documento ${file.name}`);
    }
  };

  // Clear system configurations back to original presets
  const handleClearEverything = () => {
    localStorage.removeItem("macos_sim_files");
    localStorage.removeItem("macos_sim_notes");
    localStorage.removeItem("macos_sim_config");
    window.location.reload();
  };

  // Double trigger siri query from Spotlight
  const handleSiriSearchForward = (text: string) => {
    setIsSiriOpen(true);
    // Wait a brief tick for siri component mounting
    setTimeout(() => {
      const siriInput = document.getElementById("siri-input-field") as HTMLInputElement;
      const siriSend = document.getElementById("siri-send-btn") as HTMLButtonElement;
      if (siriInput && siriSend) {
        // Programmatically trigger input submission
        const protoInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        protoInputSetter?.call(siriInput, text);
        siriInput.dispatchEvent(new Event("input", { bubbles: true }));
        setTimeout(() => siriSend.click(), 100);
      }
    }, 200);
  };

  // Desktop files render grid (only root parentId null)
  const desktopItems = files.filter((f) => 
    f.parentId === null && 
    !["documentos", "downloads", "download", "aplicativos", "leia-me.txt", "leia-me", "leiame.txt", "leiame"].includes(f.name.toLowerCase()) &&
    f.id !== "documents-root" &&
    f.id !== "downloads-root" &&
    f.id !== "apps-root" &&
    f.id !== "leia-me"
  );
  const openAppsMap = windows.reduce((acc, w) => {
    acc[w.id] = w.isOpen;
    return acc;
  }, {} as Record<AppId, boolean>);

  return (
    <div
      style={wallConf.style}
      className={`relative w-screen h-screen overflow-hidden ${wallConf.className} ${
        systemConfig.darkMode ? "dark" : ""
      }`}
    >
      {/* Wallpaper Overlay for texture matching the Frosted Glass theme */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.25),transparent)] z-0" />

      {/* 1. Global macOS Menu Bar */}
      <MenuBar
        activeAppId={activeAppId}
        activeAppTitle={activeAppTitle}
        config={systemConfig}
        onOpenApp={openApp}
        onOpenSiri={() => setIsSiriOpen((prev) => !prev)}
        onToggleControlCenter={() => setIsControlCenterOpen((prev) => !prev)}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
      />

      {/* 2. Desktop Shortcut Grid Area */}
      <div
        id="desktop-shortcuts"
        className="absolute inset-0 pt-10 pb-20 px-6 grid grid-flow-col auto-cols-max grid-rows-6 md:grid-rows-8 gap-x-8 gap-y-6 justify-start items-start select-none"
        onDoubleClick={(e) => {
          // Double-clicking blank desktop triggers settings or background menus
          if (e.target === e.currentTarget) {
            setIsControlCenterOpen(false);
          }
        }}
      >
        {desktopItems.map((item) => {
          const isFolder = item.type === "folder";
          return (
            <div
              key={item.id}
              onDoubleClick={() => handleOpenFile(item)}
              className="flex flex-col items-center justify-center p-2 rounded-xl text-center cursor-default hover:bg-white/10 select-none group max-w-[80px]"
            >
              <div className="w-10 h-10 flex items-center justify-center filter drop-shadow-md transform group-hover:scale-105 duration-150">
                {isFolder ? (
                  <Folder className="w-9 h-9 text-blue-400 fill-blue-300/40" />
                ) : (
                  <FileText className="w-8 h-8 text-neutral-100 fill-white/10" />
                )}
              </div>
              <span className="text-[10px] text-white font-medium drop-shadow-sm mt-1.5 leading-tight select-none truncate w-full">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Render Multi-Window Container Workspace */}
      <div className="absolute inset-x-0 top-6 bottom-20 z-1 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {windows.map((w) => (
            <WindowFrame
              key={w.id}
              id={w.id}
              title={w.title}
              isOpen={w.isOpen}
              isMinimized={w.isMinimized}
              isMaximized={w.isMaximized}
              zIndex={w.zIndex}
              initialX={w.x}
              initialY={w.y}
              width={w.width}
              height={w.height}
              activeAppId={activeAppId}
              onClose={() => closeWindow(w.id)}
              onMinimize={() => minimizeWindow(w.id)}
              onMaximize={() => toggleMaximizeWindow(w.id)}
              onFocus={() => focusWindow(w.id)}
            >
              {/* App Router render branches */}
              {w.id === "finder" && (
                <FinderApp
                  files={files}
                  currentDirectoryId={currentDirectoryId}
                  changeDir={setCurrentDirectoryId}
                  createFolder={handleCreateFolder}
                  createFileInFS={handleCreateFile}
                  onOpenFileByFinder={handleOpenFile}
                />
              )}
              {w.id === "safari" && <SafariApp />}
              {w.id === "notes" && (
                <NotesApp
                  notes={notes}
                  onSaveNotes={setNotes}
                  accentColorClass={accentGradientClass}
                />
              )}
              {w.id === "command_line" && (
                <TerminalApp
                  files={files}
                  currentDirectoryId={currentDirectoryId}
                  changeDir={setCurrentDirectoryId}
                  createFolder={handleCreateFolder}
                  createFileInFS={handleCreateFile}
                />
              )}
              {w.id === "calc" && <CalculatorApp />}
              {w.id === "settings" && (
                <SettingsApp
                  config={systemConfig}
                  onUpdateConfig={(updated) => setSystemConfig((prev) => ({ ...prev, ...updated }))}
                  onClearStorage={handleClearEverything}
                />
              )}
              {w.id === "maps" && <MapsApp />}
              {w.id === "appstore" && <AppStoreApp />}
              {w.id === "calibracao" && <CalibracaoApp onClose={() => closeWindow("calibracao")} />}
              {w.id === "despesas" && <DespesasApp onClose={() => closeWindow("despesas")} />}
            </WindowFrame>
          ))}
        </div>
      </div>

      {/* 4. Sliding Control Center dropdown Panel */}
      {isControlCenterOpen && (
        <div
          id="control-center-panel"
          className="fixed top-8 right-4 w-80 rounded-2xl p-4 shadow-2xl border border-white/30 backdrop-blur-[40px] bg-white/50 text-slate-800 z-[9991] animate-fade-in space-y-4"
        >
          {/* Dashboard connections */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/30 rounded-xl p-3 flex items-center gap-3 border border-white/25">
              <button
                onClick={() => setSystemConfig((prev) => ({ ...prev, wifi: !prev.wifi }))}
                className={`p-2 rounded-lg ${systemConfig.wifi ? "bg-blue-600 text-white" : "bg-black/10 text-slate-500"}`}
              >
                <Wifi className="w-3.5 h-3.5" />
              </button>
              <div>
                <span className="text-[10px] text-slate-500 block font-display">Wi-Fi</span>
                <span className="text-xs font-bold">{systemConfig.wifi ? "Ativo" : "Inativo"}</span>
              </div>
            </div>

            <div className="bg-white/30 rounded-xl p-3 flex items-center gap-3 border border-white/25">
              <button
                onClick={() => setSystemConfig((prev) => ({ ...prev, bluetooth: !prev.bluetooth }))}
                className={`p-2 rounded-lg ${systemConfig.bluetooth ? "bg-blue-600 text-white" : "bg-black/10 text-slate-500"}`}
              >
                <Bluetooth className="w-3.5 h-3.5" />
              </button>
              <div>
                <span className="text-[10px] text-slate-500 block font-display">Bluetooth</span>
                <span className="text-xs font-bold">{systemConfig.bluetooth ? "Fraco" : "Inativo"}</span>
              </div>
            </div>
          </div>

          {/* DND switch */}
          <div className="bg-white/30 rounded-xl p-3 flex items-center justify-between border border-white/25">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSystemConfig((prev) => ({ ...prev, dnd: !prev.dnd }))}
                className={`p-2 rounded-lg ${systemConfig.dnd ? "bg-purple-600 text-white animate-pulse" : "bg-black/10 text-slate-500"}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <div>
                <span className="text-xs font-bold block font-display">Não Perturbe</span>
                <span className="text-[10px] text-slate-500">{systemConfig.dnd ? "Ativado" : "Silêncio desligado"}</span>
              </div>
            </div>
          </div>

          {/* Volume control */}
          <div className="bg-white/30 rounded-xl p-3 space-y-2 border border-white/25">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
              <span>Volume</span>
              <span>{systemConfig.volume}%</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={systemConfig.volume}
                onChange={(e) => setSystemConfig((prev) => ({ ...prev, volume: Number(e.target.value) }))}
                className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer focus:outline-none accent-blue-600"
              />
            </div>
          </div>

          {/* Interface presets shortcut indicators */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLaunchpadOpen(true);
                setIsControlCenterOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Grid className="w-4 h-4" />
              <span>Abrir Launchpad</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Apple Full-sized Launchpad Overlay */}
      {isLaunchpadOpen && (
        <div
          id="launchpad-overlay"
          className="fixed inset-0 bg-[#000]/70 backdrop-blur-xl flex flex-col justify-center items-center z-[9992] text-white select-none animate-fade-in"
          onClick={() => setIsLaunchpadOpen(false)}
        >
          <div className="w-full max-w-4xl p-12 space-y-12" onClick={(e) => e.stopPropagation()}>
            {/* Search Input */}
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Buscar aplicativo..."
                className="w-full bg-white/10 border-none rounded-xl py-2 px-4 shadow-inner text-sm focus:bg-white/25 focus:outline-none text-center"
              />
            </div>

            {/* Launchpad Grid list */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-y-10 gap-x-6 text-center">
              <button onClick={() => openApp("finder")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">📁</span>
                <span className="text-xs font-semibold">Finder</span>
              </button>
              <button onClick={() => openApp("safari")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">🌐</span>
                <span className="text-xs font-semibold">Safari</span>
              </button>
              <button onClick={() => openApp("notes")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">📝</span>
                <span className="text-xs font-semibold">Notas</span>
              </button>
              <button onClick={() => openApp("command_line")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">📟</span>
                <span className="text-xs font-semibold">Terminal</span>
              </button>
              <button onClick={() => openApp("calc")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">🧮</span>
                <span className="text-xs font-semibold">Calculadora</span>
              </button>
              <button onClick={() => openApp("maps")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">🗺️</span>
                <span className="text-xs font-semibold">Mapas</span>
              </button>
              <button onClick={() => openApp("settings")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">⚙️</span>
                <span className="text-xs font-semibold">Ajustes</span>
              </button>
              <button onClick={() => openApp("appstore")} className="flex flex-col items-center space-y-2 group">
                <span className="text-5xl group-hover:scale-110 transition duration-150">🎒</span>
                <span className="text-xs font-semibold">App Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Spotlight Search Overlap */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onOpenApp={openApp}
        files={files}
        notes={notes}
        onTriggerSiriText={handleSiriSearchForward}
      />

      {/* 7. Apple Virtual Siri Assistent AI widget overlay */}
      <SiriWidget
        isOpen={isSiriOpen}
        onClose={() => setIsSiriOpen(false)}
        accentColorClass={accentGradientClass}
      />

      {/* 8. Global Bottom macOS Dock shelf */}
      <Dock
        openApps={openAppsMap}
        activeAppId={activeAppId}
        onOpenApp={openApp}
        onOpenSiri={() => setIsSiriOpen((prev) => !prev)}
        bouncingApps={bouncingApps}
      />
    </div>
  );
}
