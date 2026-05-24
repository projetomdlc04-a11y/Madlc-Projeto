import React, { useState } from "react";
import { Plus, Trash2, Edit3, Bookmark, Search, Calendar } from "lucide-react";
import { NoteRecord } from "../types";

interface NotesAppProps {
  notes: NoteRecord[];
  onSaveNotes: (updatedNotes: NoteRecord[]) => void;
  accentColorClass: string;
}

export default function NotesApp({ notes, onSaveNotes, accentColorClass }: NotesAppProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  const handleCreateNote = () => {
    const newNote: NoteRecord = {
      id: String(Date.now()),
      title: "Nova Nota",
      content: "Insira suas ideias aqui...",
      updatedAt: new Date().toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      color: "amber",
    };

    const updated = [newNote, ...notes];
    onSaveNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleContentChange = (field: "title" | "content", value: string) => {
    if (!selectedNoteId) return;
    const updated = notes.map((n) => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          [field]: value,
          updatedAt: new Date().toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
      return n;
    });
    onSaveNotes(updated);
  };

  return (
    <div id="notes-app-container" className="w-full h-full bg-white text-slate-800 flex rounded-b-xl overflow-hidden select-none">
      {/* 1. Left Snippets Sidebar list */}
      <div className="w-56 bg-slate-50 border-r border-gray-100 flex flex-col h-full">
        {/* Controls header */}
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 font-display">Minhas Notas</span>
          <button
            onClick={handleCreateNote}
            id="notes-add-btn"
            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-gray-100 bg-[#fafafa]">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar notas..."
              className="w-full bg-white border border-gray-200 rounded-md py-1 px-7 text-xs focus:outline-none"
            />
            <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Note list column */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 font-sans">
          {notes.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-12 px-4 leading-normal">
              Nenhuma nota criada. Clique no botão de mais acima para criar!
            </div>
          ) : (
            notes.map((note) => {
              const isActive = note.id === selectedNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 text-left cursor-pointer transition ${
                    isActive ? "bg-orange-50/70 shadow-xs" : "hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-slate-900 truncate pr-2 max-w-[130px]">
                      {note.title || "Sem título"}
                    </h4>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      id={`notes-delete-${note.id}`}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 text-gray-400 p-0.5 rounded transition absolute right-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Hover trash shortcut */}
                    <div className="text-[10px] text-gray-400 font-display">
                      <Trash2
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="w-3 h-3 hover:text-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-1 leading-normal">
                    {note.content || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-2">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{note.updatedAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Text Editor Panel */}
      <div className="flex-1 bg-white p-6 flex flex-col h-full font-sans">
        {activeNote ? (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Note Title input */}
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleContentChange("title", e.target.value)}
              id="note-title-input"
              placeholder="Título da nota"
              className="text-xl font-bold font-display border-none text-slate-950 focus:outline-none w-full tracking-tight"
            />
            
            {/* Timestamp */}
            <div className="text-[10px] text-slate-400 font-medium border-b border-gray-100 pb-2">
              Última modificação: {activeNote.updatedAt}
            </div>

            {/* Note Rich-editor description */}
            <textarea
              value={activeNote.content}
              onChange={(e) => handleContentChange("content", e.target.value)}
              id="note-content-input"
              placeholder="Comece a digitar..."
              className="flex-1 w-full border-none text-slate-700 text-xs focus:outline-none resize-none leading-relaxed select-text"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs text-center space-y-2">
            <Edit3 className="w-8 h-8 text-slate-300" />
            <span>Nenhuma nota selecionada ou criada.</span>
          </div>
        )}
      </div>
    </div>
  );
}
