import React, { useState } from "react";
import { AppId } from "../types";

interface DockIcon {
  id: AppId | "siri" | "trash";
  name: string;
  icon: string;
  gradient: string;
}

interface DockProps {
  openApps: Record<AppId, boolean>;
  activeAppId: AppId | null;
  onOpenApp: (id: AppId) => void;
  onOpenSiri: () => void;
  bouncingApps: Record<string, boolean>;
}

export default function Dock({
  openApps,
  activeAppId,
  onOpenApp,
  onOpenSiri,
  bouncingApps,
}: DockProps) {
  const dockIcons: DockIcon[] = [
    { id: "notes", name: "Notas", icon: "📝", gradient: "from-amber-400 to-orange-500" },
    { id: "calc", name: "Calculadora", icon: "🧮", gradient: "from-orange-400 to-orange-600" },
    { id: "calibracao", name: "Ficha de Calibração", icon: "📐", gradient: "from-amber-500 to-amber-700" },
    { id: "despesas", name: "Despesa de Deslocamento", icon: "🚗", gradient: "from-emerald-500 to-emerald-700" },
  ];

  const handleIconClick = (id: DockIcon["id"]) => {
    if (id === "siri") {
      onOpenSiri();
    } else if (id === "trash") {
      alert("Lixeira está vazia por padrão.");
    } else {
      onOpenApp(id as AppId);
    }
  };

  return (
    <div
      id="macos-dock-wrapper"
      className="fixed bottom-3 left-1/2 transform -translate-x-1/2 h-18 bg-white/25 border border-white/25 rounded-2xl px-5 flex items-end justify-center gap-3.5 shadow-2xl z-[9985] backdrop-blur-xl dock-container select-none max-w-full"
    >
      {dockIcons.map((item) => {
        const isOpen = item.id !== "siri" && item.id !== "trash" && openApps[item.id as AppId];
        const isActive = activeAppId === item.id;
        const isBouncing = bouncingApps[item.id];

        return (
          <div
            key={item.id}
            onClick={() => handleIconClick(item.id)}
            className="flex flex-col items-center justify-end h-full pb-2 relative group"
          >
            {/* Hover Tooltip name bubble */}
            <div className="absolute bottom-18 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-nowrap duration-150 border border-white/15 shadow-md">
              {item.name}
            </div>

            {/* Apple Icon Button layout with metallic gradients */}
            <button
              id={`dock-item-${item.id}`}
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${
                item.gradient
              } flex items-center justify-center text-2.5xl shadow-lg border border-white/10 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.28] hover:-translate-y-2 origin-bottom focus:outline-none placeholder-neutral-500 active:scale-95 ${
                isBouncing ? "app-launch-bounce" : ""
              }`}
            >
              <span className={`${item.id === "command_line" ? "text-emerald-400 font-mono" : ""}`}>
                {item.icon}
              </span>
            </button>

            {/* Dot indicators beneath launched apps */}
            {isOpen && (
              <div
                className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-white scale-110 shadow-md shadow-white/30" : "bg-white/40 scale-90"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
