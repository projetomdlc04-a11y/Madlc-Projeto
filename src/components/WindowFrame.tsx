import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import { AppId } from "../types";

interface WindowFrameProps {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  initialX: number;
  initialY: number;
  width: number;
  height: number;
  activeAppId: AppId | null;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  key?: React.Key;
}

export default function WindowFrame({
  id,
  title,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  initialX,
  initialY,
  width,
  height,
  activeAppId,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
}: WindowFrameProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  // Header Mouse Grab Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging when clicking header action buttons
    if ((e.target as HTMLElement).closest(".window-control-btn")) return;
    
    setIsDragging(true);
    onFocus();
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Boundary checks to ensure window doesn't go off outer desktop limits completely
    let nextX = e.clientX - dragStart.current.x;
    let nextY = e.clientY - dragStart.current.y;
    
    if (nextY < 24) nextY = 24; // Menu bar limit height boundary
    
    setPosition({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  if (!isOpen || isMinimized) return null;

  const style: React.CSSProperties = isMaximized
    ? {
        position: "absolute",
        top: "24px", // Menu bar displacement
        left: "0px",
        width: "100%",
        height: "calc(100% - 24px)",
        zIndex: zIndex,
      }
    : {
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: zIndex,
      };

  const isActive = activeAppId === id;

  return (
    <div
      ref={windowRef}
      style={style}
      onClick={onFocus}
      id={`window-${id}`}
      className={`rounded-2xl flex flex-col shadow-2xl overflow-hidden border transition-all duration-200 outline-none ${
        isActive 
          ? "border-white/35 shadow-black/35 bg-white/75 backdrop-blur-[40px] scale-100" 
          : "border-white/20 shadow-black/20 bg-white/55 backdrop-blur-[30px] opacity-95 scale-[0.99]"
      }`}
    >
      {/* 2. Window Header Grab-bar */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
        className="h-10 px-4 bg-white/20 border-b border-white/10 flex items-center justify-between cursor-default shrink-0 select-none"
      >
        {/* Trio Lights window Controls (Red, Yellow, Green) */}
        <div className="flex items-center gap-1.5 w-20">
          <button
            onClick={onClose}
            id={`window-ctl-close-${id}`}
            className="window-control-btn w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#ff3b30] flex items-center justify-center group relative border border-black/5 animate-pulse"
          >
            <X className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100 transition absolute" />
          </button>
          <button
            onClick={onMinimize}
            id={`window-ctl-mini-${id}`}
            className="window-control-btn w-3.5 h-3.5 rounded-full bg-[#ffbd2e] hover:bg-[#e0a800] flex items-center justify-center group relative border border-black/5"
          >
            <Minus className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100 transition absolute" />
          </button>
          <button
            onClick={onMaximize}
            id={`window-ctl-max-${id}`}
            className="window-control-btn w-3.5 h-3.5 rounded-full bg-[#27c93f] hover:bg-[#1a9c2b] flex items-center justify-center group relative border border-black/5"
          >
            <Maximize2 className="w-1.5 h-1.5 text-black/70 opacity-0 group-hover:opacity-100 transition absolute" />
          </button>
        </div>

        {/* Title text */}
        <span className="text-xs font-semibold text-slate-800 tracking-wide font-display text-ellipsis truncate max-w-sm">
          {title}
        </span>

        {/* Dummy spacer to balance header center layout alignment */}
        <div className="w-20" />
      </div>

      {/* 3. Render Apps Frame Window child contents */}
      <div className="flex-1 bg-white/60 relative min-h-0">
        {children}
      </div>
    </div>
  );
}
