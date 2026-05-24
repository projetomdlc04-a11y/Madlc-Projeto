import React, { useState } from "react";
import { Folder, FileText, ChevronLeft, ChevronRight, Search, PlusCircle, LayoutGrid, List, FileImage, ShieldAlert } from "lucide-react";
import { FileRecord } from "../types";

interface FinderAppProps {
  files: FileRecord[];
  currentDirectoryId: string | null;
  changeDir: (dirId: string | null) => void;
  createFolder: (name: string, parentId: string | null) => void;
  createFileInFS: (name: string, type: "txt", content: string, parentId: string | null) => void;
  onOpenFileByFinder: (file: FileRecord) => void;
}

export default function FinderApp({
  files,
  currentDirectoryId,
  changeDir,
  createFolder,
  createFileInFS,
  onOpenFileByFinder,
}: FinderAppProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarSelection, setSidebarSelection] = useState<string>("desktop");
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarItems = [
    { id: "desktop", name: "Mesa (Desktop)", icon: "🖥️", folderId: null },
    { id: "documents", name: "Documentos", icon: "📁", folderId: "documents-root" },
    { id: "downloads", name: "Downloads", icon: "📥", folderId: "downloads-root" },
    { id: "applications", name: "Aplicativos", icon: "🚀", folderId: "apps-root" },
  ];

  const handleSidebarClick = (item: typeof sidebarItems[0]) => {
    setSidebarSelection(item.id);
    changeDir(item.folderId);
  };

  // Directory navigation history helper
  const navigateUp = () => {
    if (!currentDirectoryId) return;
    const currentFolder = files.find((f) => f.id === currentDirectoryId);
    if (currentFolder) {
      changeDir(currentFolder.parentId);
    }
  };

  const currentFolderRecord = files.find((f) => f.id === currentDirectoryId);

  // Filter children matching search and current folder scope
  const filteredFiles = files.filter((f) => {
    const parentMatches = f.parentId === currentDirectoryId;
    const searchMatches = searchQuery 
      ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;
    
    // If searching globally, look everywhere; else, scope to parent folder
    return searchQuery ? searchMatches : parentMatches;
  });

  const handleCreateFolderPrompt = () => {
    const name = prompt("Digite o nome da nova pasta:");
    if (name && name.trim()) {
      createFolder(name.trim(), currentDirectoryId);
    }
  };

  const handleCreateFilePrompt = () => {
    const name = prompt("Digite o nome do novo arquivo de texto (.txt):");
    if (name && name.trim()) {
      const formattedName = name.endsWith(".txt") ? name : name + ".txt";
      createFileInFS(formattedName, "txt", "Criado pelo Finder no dia " + new (Date as any)().toLocaleDateString(), currentDirectoryId);
    }
  };

  return (
    <div id="finder-layout-container" className="w-full h-full bg-[#f6f6f6] text-black flex rounded-b-xl overflow-hidden select-none">
      {/* Left Navigation Sidebar */}
      <div className="w-48 bg-[#eaeaea] border-r border-gray-200 p-2 space-y-4 flex flex-col justify-between h-full">
        <div>
          <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase pl-3">Favoritos</span>
          <nav className="mt-2 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = sidebarSelection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs leading-tight font-medium transition text-left ${
                    isActive 
                      ? "bg-black/10 text-slate-950 font-semibold shadow-xs" 
                      : "text-slate-700 hover:bg-black/5 hover:text-slate-950"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Memory status */}
        <div className="p-3 bg-black/5 rounded-lg text-[10px] text-slate-500 leading-normal">
          <span className="font-semibold text-slate-700 font-display block">MacBook SSD</span>
          <span>124.5 GB livres de 256 GB</span>
        </div>
      </div>

      {/* Main Files Area */}
      <div className="flex-1 flex flex-col h-full bg-[#fafafa]">
        {/* Main Header Controller bar */}
        <div className="px-4 py-2 bg-[#eaeaea] border-b border-gray-200 flex items-center justify-between gap-3 h-11">
          <div className="flex items-center gap-1">
            <button 
              onClick={navigateUp} 
              disabled={!currentDirectoryId}
              className="p-1 rounded hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-800 tracking-wide font-display pl-2">
              {currentFolderRecord ? currentFolderRecord.name : "Mesa (Desktop)"}
            </span>
          </div>

          {/* Create file nodes action controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFolderPrompt}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-gray-300 rounded-md px-2.5 py-1.5 hover:bg-slate-50 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Nova Pasta</span>
            </button>
            <button
              onClick={handleCreateFilePrompt}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-gray-300 rounded-md px-2.5 py-1.5 hover:bg-slate-50 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Novo Documento</span>
            </button>
          </div>

          {/* Right toggle and Search bar */}
          <div className="flex items-center gap-2">
            <div className="flex bg-black/5 p-0.5 rounded-lg border border-black/5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-xs" : "opacity-50"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-xs" : "opacity-50"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#e4e4e4] rounded-md py-1 px-8 text-xs focus:outline-none focus:bg-white w-36 focus:w-44 transition-all"
              />
              <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Dynamic Items Layout list */}
        <div className="flex-1 p-6 overflow-y-auto relative min-h-0">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <ShieldAlert className="w-8 h-8 text-gray-300" />
              <span className="text-xs">Pasta vazia ou nenhum item encontrado.</span>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 justify-start select-text">
              {filteredFiles.map((file) => {
                const isFolder = file.type === "folder";
                const isImage = file.type === "img";
                return (
                  <div
                    key={file.id}
                    onDoubleClick={() => {
                      if (isFolder) {
                        changeDir(file.id);
                      } else {
                        onOpenFileByFinder(file);
                      }
                    }}
                    className="flex flex-col items-center text-center p-2 rounded-xl group cursor-pointer hover:bg-black/5 border border-transparent hover:border-black/5 transition duration-150"
                  >
                    <div className="w-12 h-12 flex items-center justify-center transition group-hover:scale-105 duration-150">
                      {isFolder ? (
                        <Folder className="w-11 h-11 text-blue-400 fill-blue-300/60 stroke-[1.25]" />
                      ) : isImage ? (
                        <FileImage className="w-10 h-10 text-orange-500 fill-orange-100 stroke-[1.5]" />
                      ) : (
                        <FileText className="w-10 h-10 text-slate-500 fill-slate-100 stroke-[1.5]" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-800 font-medium leading-tight mt-2.5 line-clamp-2 max-w-[80px] break-all select-none">
                      {file.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white select-text">
              <div className="grid grid-cols-3 bg-slate-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Nome</span>
                <span>Tipo</span>
                <span>Data de Criação</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                {filteredFiles.map((file) => {
                  const isFolder = file.type === "folder";
                  return (
                    <div
                      key={file.id}
                      onDoubleClick={() => {
                        if (isFolder) {
                          changeDir(file.id);
                        } else {
                          onOpenFileByFinder(file);
                        }
                      }}
                      className="grid grid-cols-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer items-center transition"
                    >
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        {isFolder ? (
                          <Folder className="w-4 h-4 text-blue-400" />
                        ) : file.type === "img" ? (
                          <FileImage className="w-4 h-4 text-orange-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-500" />
                        )}
                        <span>{file.name}</span>
                      </div>
                      <span className="text-slate-500 capitalize">{isFolder ? "Diretório" : file.type}</span>
                      <span className="text-slate-400">{file.createdAt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Bottom Status Bar */}
        <div className="h-6 bg-[#dfdfdf] border-t border-gray-200 px-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>{filteredFiles.length} itens</span>
          <span>Ordem: Nome</span>
        </div>
      </div>
    </div>
  );
}
