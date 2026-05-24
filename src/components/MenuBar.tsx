import React, { useState, useEffect } from "react";
import { AppId, SystemConfig } from "../types";

interface MenuBarProps {
  activeAppId: AppId | null;
  activeAppTitle: string;
  config: SystemConfig;
  onOpenApp: (id: AppId) => void;
  onOpenSiri: () => void;
  onToggleControlCenter: () => void;
  onOpenSpotlight: () => void;
}

export default function MenuBar({
  activeAppId: _activeAppId,
  activeAppTitle: _activeAppTitle,
  config: _config,
  onOpenApp: _onOpenApp,
  onOpenSiri: _onOpenSiri,
  onToggleControlCenter: _onToggleControlCenter,
  onOpenSpotlight: _onOpenSpotlight,
}: MenuBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // Live timer tick update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="macos-menubar"
      className="w-full h-6 fixed top-0 left-0 bg-white/20 border-b border-white/15 backdrop-blur-md flex items-center justify-end text-white text-[11.5px] px-4 select-none z-[9990] font-sans shadow-sm"
    >
      {/* Full clock live info ONLY */}
      <span className="font-semibold text-white/90 px-1 py-0.5 text-right select-none">
        {date} {time}
      </span>
    </div>
  );
}
