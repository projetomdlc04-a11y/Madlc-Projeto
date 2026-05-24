import React, { useState, useRef, useEffect } from "react";
import { FileRecord } from "../types";

interface TerminalAppProps {
  files: FileRecord[];
  currentDirectoryId: string | null;
  changeDir: (dirId: string | null) => void;
  createFolder: (name: string, parentId: string | null) => void;
  createFileInFS: (name: string, type: "txt", content: string, parentId: string | null) => void;
}

export default function TerminalApp({
  files,
  currentDirectoryId,
  changeDir,
  createFolder,
  createFileInFS,
}: TerminalAppProps) {
  const [history, setHistory] = useState<string[]>([
    "Last login: " + new Date().toString().slice(0, 21),
    "Bem-vindo ao simulador de Terminal do macOS (zsh)!",
    "Digite 'ajuda' ou 'neofetch' para iniciar.",
    "",
  ]);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  // Handle focus on terminal body click
  const handleBodyClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get current directory path name
  const getCurrentPathName = () => {
    if (!currentDirectoryId) return "~";
    const currentFolder = files.find((f) => f.id === currentDirectoryId);
    return currentFolder ? "~/" + currentFolder.name : "~";
  };

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, `${getCurrentPathName()} % `]);
      return;
    }

    const outputHeader = `${getCurrentPathName()} % ${trimmed}`;
    const args = trimmed.split(" ");
    const cmd = args[0].toLowerCase();

    let replyLines: string[] = [];

    switch (cmd) {
      case "help":
      case "ajuda":
        replyLines = [
          "Comandos disponíveis do terminal macOS (zsh):",
          "  ajuda | help       - Mostra esta lista de ajuda",
          "  ls                 - Lista arquivos e diretórios na pasta atual",
          "  cd <pasta>         - Entra em um diretório (cd .. para subir)",
          "  mkdir <nome>       - Cria uma pasta no diretório atual",
          "  touch <nome.txt>   - Cria um arquivo de texto vazio",
          "  cat <arquivo>      - Exibe o conteúdo de um arquivo de texto",
          "  neofetch           - Mostra informações elegantes do sistema",
          "  clear              - Limpa a tela do terminal",
          "  theme [light|dark] - Altera o visual do terminal",
          "  siri <pergunta>    - Pergunta para a Siri inteligente",
          "  ai <pergunta>      - Consulta o modelo Gemini diretamente",
        ];
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "ls": {
        const children = files.filter((f) => f.parentId === currentDirectoryId);
        if (children.length === 0) {
          replyLines = ["Pasta vazia"];
        } else {
          replyLines = children.map(
            (f) => `${f.type === "folder" ? "📁" : "📄"}  ${f.name}   (${f.type === "folder" ? "Diretório" : "Arquivo"})`
          );
        }
        break;
      }

      case "cd": {
        const dest = args.slice(1).join(" ");
        if (!dest) {
          replyLines = ["Uso: cd <nome_da_pasta> ou cd .."];
        } else if (dest === "..") {
          if (!currentDirectoryId) {
            replyLines = ["Você já está na raiz do sistema (~)."];
          } else {
            const currentFolder = files.find((f) => f.id === currentDirectoryId);
            changeDir(currentFolder ? currentFolder.parentId : null);
          }
        } else {
          const folder = files.find(
            (f) =>
              f.parentId === currentDirectoryId &&
              f.type === "folder" &&
              f.name.toLowerCase() === dest.toLowerCase()
          );
          if (folder) {
            changeDir(folder.id);
          } else {
            replyLines = [`cd: pasta não encontrada: ${dest}`];
          }
        }
        break;
      }

      case "mkdir": {
        const name = args.slice(1).join(" ");
        if (!name) {
          replyLines = ["Uso: mkdir <nome_da_pasta>"];
        } else {
          createFolder(name, currentDirectoryId);
          replyLines = [`Pasta '${name}' criada com sucesso!`];
        }
        break;
      }

      case "touch": {
        const name = args.slice(1).join(" ");
        if (!name) {
          replyLines = ["Uso: touch <nome_do_arquivo.txt>"];
        } else {
          const finalName = name.endsWith(".txt") ? name : name + ".txt";
          createFileInFS(finalName, "txt", "", currentDirectoryId);
          replyLines = [`Arquivo de texto '${finalName}' criado com sucesso!`];
        }
        break;
      }

      case "cat": {
        const name = args.slice(1).join(" ");
        if (!name) {
          replyLines = ["Uso: cat <nome_do_arquivo.txt>"];
        } else {
          const file = files.find(
            (f) =>
              f.parentId === currentDirectoryId &&
              f.type === "txt" &&
              f.name.toLowerCase() === name.toLowerCase()
          );
          if (file) {
            replyLines = file.content ? file.content.split("\n") : ["(Arquivo de texto vazio)"];
          } else {
            replyLines = [`cat: arquivo não encontrado: ${name}`];
          }
        }
        break;
      }

      case "neofetch":
        replyLines = [
          "                    ,x88888x,       projeto@macbook-pro",
          "                 ,888888888888,     -------------------",
          "                888888888888888     OS: macOS Sequoia 15.0",
          "               8888888888888888     Host: MacBook Pro M3 Max",
          "               8888888888888888     Uptime: " + Math.floor(process.uptime() / 60) + " minutos",
          "               8888888888888888     Shell: zsh (macOS terminal emulator)",
          "                88888888888888      Resolution: 1920x1080 (Simulated)",
          "                 '88888888888'      DE: Aqua Web Core",
          "                    'x888x'         WM: Quartz Interactive Grid",
          "      ,x,                           Terminal: macOS Terminal.app",
          "     88888,                         CPU: Apple M3 Max (16 Cores)",
          "    8888888                         GPU: Apple Graphics Integrated",
          "    8888888                         Memory: 16 GB (Simulado)",
          "    '88888'                         Disk: 256 GB NVMe SSD",
          "     'x88x'",
        ];
        break;

      case "theme": {
        const themeOption = args[1];
        if (themeOption === "light") {
          replyLines = ["Tema do terminal alterado para CLARO adaptativo."];
        } else if (themeOption === "dark") {
          replyLines = ["Tema do terminal restaurado para o padrão ESCURO."];
        } else {
          replyLines = ["Uso: theme [light|dark]"];
        }
        break;
      }

      case "siri":
      case "ai": {
        const query = args.slice(1).join(" ");
        if (!query) {
          replyLines = [`Uso: ${cmd} <sua dúvida ou comando>`];
        } else {
          replyLines = ["Siri está pesquisando nas redes neurais..."];
          setHistory((prev) => [...prev, outputHeader, ...replyLines]);
          setInput("");

          // Execute remote API route directly
          try {
            const res = await fetch("/api/gemini/siri", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: query }),
            });
            if (res.ok) {
              const data = await res.json();
              setHistory((prev) => [...prev, `[Siri AI Response]:`, data.reply, ""]);
            } else {
              setHistory((prev) => [...prev, "[Erro]: Resposta inválida da rede de IA."]);
            }
          } catch (e) {
            setHistory((prev) => [...prev, "[Erro]: Erro de rede ao conectar com a Siri."]);
          }
          return;
        }
        break;
      }

      default:
        replyLines = [`zsh: comando não encontrado: ${cmd}. Digite 'ajuda' para verificar os comandos.`];
    }

    setHistory((prev) => [...prev, outputHeader, ...replyLines, ""]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    }
  };

  return (
    <div
      onClick={handleBodyClick}
      className="w-full h-full bg-[#1e1e1e] text-[#a9ffaf] font-mono p-4 overflow-y-auto text-xs flex flex-col justify-start rounded-b-xl"
      style={{ minHeight: "260px" }}
      ref={containerRef}
      id="terminal-container"
    >
      <div className="flex-1 space-y-1">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
      </div>

      {/* Shell line Prompt */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[#32baff]">{getCurrentPathName()}</span>
        <span className="text-white/60">%</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={true}
          id="terminal-input"
          className="flex-1 bg-transparent border-none text-white focus:outline-none caret-[#32baff] h-4 py-0 pl-1"
          placeholder="Digite um comando..."
        />
      </div>
    </div>
  );
}
