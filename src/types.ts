export type AppId =
  | "finder"
  | "safari"
  | "command_line"
  | "notes"
  | "calc"
  | "settings"
  | "maps"
  | "appstore"
  | "calibracao"
  | "despesas";

export interface WindowInstance {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FileType = "folder" | "txt" | "img" | "link";

export interface FileRecord {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null; // null means Desktop root
  content?: string; // used for txt content, image source URLs or browser URLs
  createdAt: string;
}

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  color?: string;
}

export interface SiriMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

export interface WallpaperOption {
  id: string;
  name: string;
  type: "gradient" | "image";
  value: string; // Tailwind class background or image URL
}

export interface SystemConfig {
  wallpaperId: string;
  accentColor: "blue" | "graphite" | "orange" | "red" | "purple";
  darkMode: boolean;
  volume: number; // 0-100
  brightness: number; // 0-100
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
}
