import React, { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Bookmark, Star, ExternalLink, ShieldCheck } from "lucide-react";

export default function SafariApp() {
  const [url, setUrl] = useState("https://www.apple.com/br");
  const [inputValue, setInputValue] = useState("https://www.apple.com/br");
  const [history, setHistory] = useState<string[]>(["https://www.apple.com/br"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const bookmarks = [
    { name: "Apple Brasil", url: "https://www.apple.com/br", icon: "🍏" },
    { name: "Google", url: "https://www.google.com.br", icon: "🔍" },
    { name: "GitHub OS Project", url: "https://github.com", icon: "🐙" },
    { name: "YouTube", url: "https://www.youtube.com", icon: "📺" },
    { name: "AI Studio Build", url: "https://ai.studio/build", icon: "✨" },
  ];

  const navigateTo = (newUrl: string) => {
    const formattedUrl = newUrl.startsWith("http://") || newUrl.startsWith("https://") 
      ? newUrl 
      : "https://" + newUrl;
      
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setUrl(formattedUrl);
    setInputValue(formattedUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigateTo(inputValue);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setUrl(history[idx]);
      setInputValue(history[idx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setUrl(history[idx]);
      setInputValue(history[idx]);
    }
  };

  const handleHome = () => {
    navigateTo("https://www.apple.com/br");
  };

  // Content render resolver based on current mock subpages
  const renderPageContent = () => {
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.includes("apple.com")) {
      return (
        <div id="safari-page-apple" className="p-8 text-slate-800 bg-white min-h-full font-sans select-text select-text block">
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <header className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className="text-xl font-semibold font-display"> Apple</span>
              <div className="space-x-4 text-xs text-slate-500 font-medium">
                <span>Mac</span>
                <span>iPad</span>
                <span>iPhone</span>
                <span>Suporte</span>
              </div>
            </header>
            
            <section className="text-center py-12 space-y-4">
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Lançamento</span>
              <h1 className="text-4.5xl font-bold tracking-tight text-slate-900 font-display">iPhone 17 Pro</h1>
              <p className="text-lg text-slate-500 max-w-lg mx-auto">Titanium aeroespacial. Chip A19 Pro com inteligência expandida. Uma câmera que redefine as regras.</p>
              <div className="pt-4 flex justify-center gap-3">
                <button className="bg-blue-600 text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-blue-700 shadow-md">Saiba mais</button>
                <button className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 text-sm font-semibold hover:bg-blue-50">Comprar</button>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg text-slate-800">MacBook Pro M4 Max</h3>
                <p className="text-xs text-slate-500 mt-1">Até 24 horas de autonomia.</p>
                <div className="w-full h-24 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-lg mt-4 flex items-center justify-center font-mono text-xs text-slate-400">
                  [Imagem do MacBook]
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg text-slate-800">Apple Watch Ultra 3</h3>
                <p className="text-xs text-slate-500 mt-1">Aventura nos seus limites.</p>
                <div className="w-full h-24 bg-gradient-to-tr from-orange-100 to-slate-100 rounded-lg mt-4 flex items-center justify-center font-mono text-xs text-slate-400">
                  [Imagem do Apple Watch]
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (cleanUrl.includes("google.com")) {
      return (
        <div id="safari-page-google" className="p-8 text-slate-800 bg-white min-h-full font-sans flex flex-col items-center justify-center select-text">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="text-5.5xl font-bold tracking-tight font-display">
              <span className="text-blue-600">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-600">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </h1>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Pesquisar no Google ou digitar um URL"
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:border-blue-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigateTo(`https://google.com/search?q=${e.currentTarget.value}`);
                  }
                }}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex justify-center gap-2 text-xs text-gray-500 font-medium">
              <span className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer">Pesquisa Google</span>
              <span className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer">Estou com sorte</span>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">Simulação do mecanismo de busca integrado.</p>
          </div>
        </div>
      );
    }

    if (cleanUrl.includes("google.com/search")) {
      const queryParam = url.split("?q=")[1] || "macOS";
      const decodedQuery = decodeURIComponent(queryParam).replace(/\+/g, " ");
      return (
        <div id="safari-page-google-results" className="p-8 text-slate-800 bg-white min-h-full font-sans select-text">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="text-blue-600">G</span>oogle <span className="font-normal text-slate-500 text-sm italic">Resultados para: "{decodedQuery}"</span>
            </h1>

            <div className="space-y-5">
              <div className="p-4 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                <span className="text-xs text-emerald-700 font-mono block">https://pt.wikipedia.org › wiki › macOS</span>
                <h3 className="font-semibold text-blue-800 text-base hover:underline mt-0.5">macOS – Wikipédia, a enciclopédia livre</h3>
                <p className="text-xs text-slate-600 mt-1">O macOS é um sistema operacional proprietário baseado no kernel Unix desenvolvido, comercializado e vendido pela Apple Inc. desde 2001.</p>
              </div>

              <div className="p-4 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                <span className="text-xs text-emerald-700 font-mono block">https://www.apple.com › br › mac</span>
                <h3 className="font-semibold text-blue-800 text-base hover:underline mt-0.5">Mac - Apple (BR)</h3>
                <p className="text-xs text-slate-600 mt-1">Conheça o mundo do Mac. Notebooks MacBook Air e MacBook Pro, computadores iMac, Mac mini, Mac Studio e Mac Pro incríveis com processadores Apple.</p>
              </div>

              <div className="p-4 hover:bg-slate-50 rounded-xl transition cursor-pointer">
                <span className="text-xs text-emerald-700 font-mono block">https://github.com › topics › macos-web</span>
                <h3 className="font-semibold text-blue-800 text-base hover:underline mt-0.5">macos-web · GitHub Topics</h3>
                <p className="text-xs text-slate-600 mt-1">Projetos de código aberto dedicados a reproduzir as experiências desktop do macOS e sistemas corporativos em ambientes web usando HTML/CSS/React.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (cleanUrl.includes("github.com")) {
      return (
        <div id="safari-page-github" className="p-8 text-white bg-[#0d1117] min-h-full font-sans select-text">
          <div className="max-w-2xl mx-auto space-y-6">
            <header className="flex justify-between items-center border-b border-gray-800 pb-3">
              <span className="text-xl font-bold flex items-center gap-1.5">
                🐙 GitHub
              </span>
              <span className="text-xs text-gray-400">projeto-mac-os-web-simulator</span>
            </header>

            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-blue-400">macOS-Web-OS / react-clone</h2>
              <p className="text-xs text-gray-400 leading-relaxed">Repositório simulado contendo os fontes do sistema operacional macOS rodando do lado cliente com componentes reativos, persistência local e assistente inteligente.</p>
              
              <div className="flex gap-4 text-xs text-gray-400 font-mono">
                <span>⭐ 1.4k Stars</span>
                <span>🍴 128 Forks</span>
                <span>TypeScript 94.2%</span>
              </div>
            </div>

            <div className="border border-gray-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-[#161b22] px-4 py-2 border-b border-gray-800 text-gray-400 font-brand">Últimos Commits</div>
              <div className="divide-y divide-gray-800">
                <div className="p-3 flex justify-between">
                  <span className="text-blue-300">feat: adicionar integração Siri inteligente com Gemini API</span>
                  <span className="text-gray-500">2 horas atrás</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-blue-300">style: polimento no Dock do sistema e reflexos de blurs</span>
                  <span className="text-gray-500">Ontem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Fallback simulated rendering of custom inputs
    return (
      <div id="safari-page-fallback" className="p-12 text-slate-800 bg-white min-h-full font-sans text-center select-text">
        <div className="max-w-md mx-auto space-y-6">
          <ShieldCheck className="w-12 h-12 text-[#ff9f0a] mx-auto" />
          <h2 className="text-xl font-semibold text-slate-950 font-display">Conexão Simulada Protegida</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Você está navegando em um endereço customizado: <br />
            <span className="text-blue-700 font-mono break-all font-medium">{url}</span>
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-2 mt-4 text-xs">
            <h4 className="font-semibold text-slate-800">Detalhes Técnicos da Visualização:</h4>
            <p className="text-xs text-slate-600 pt-1">O motor do Safari do simulador Web isolou o domínio para fins de segurança e renderizou este sandbox do sistema. Todas as funcionalidades locais permanecem robustas.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="safari-panel-wrapper" className="w-full h-full bg-[#f6f6f6] text-black flex flex-col justify-start rounded-b-xl select-none">
      {/* Top Controls Action Bar */}
      <div className="px-4 py-2 bg-[#eaeaea] border-b border-gray-300 flex items-center justify-between gap-3 h-11">
        <div className="flex gap-1.5">
          <button 
            onClick={handleBack} 
            disabled={historyIndex === 0}
            className="p-1 rounded hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleForward} 
            disabled={historyIndex === history.length - 1}
            className="p-1 rounded hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setUrl(url)} // Fake refresh effect
            className="p-1 rounded hover:bg-black/10"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleHome} 
            className="p-1 rounded hover:bg-black/10"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Input Field */}
        <div className="flex-1 max-w-xl mx-auto relative flex items-center">
          <div className="absolute left-2.5 text-xs text-gray-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] text-gray-400 font-mono hidden md:inline">Seguro</span>
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            id="safari-address-bar"
            className="w-full bg-[#dfdfdf] border-none rounded-md py-1.5 pl-17 pr-8 text-xs focus:outline-none focus:bg-white text-center font-sans tracking-wide shadow-inner"
          />
          <button 
            onClick={() => navigateTo(inputValue)}
            id="safari-search-btn"
            className="absolute right-2.5 p-0.5 rounded text-gray-500 hover:text-black hover:bg-black/5"
          >
            <Search className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          <span className="text-xs text-gray-500 font-semibold hidden md:inline font-display">Favoritos</span>
        </div>
      </div>

      {/* Bookmarks bar */}
      <div className="bg-[#dfdfdf] border-b border-gray-300 px-4 py-1.5 flex gap-2 overflow-x-auto text-xs font-medium">
        {bookmarks.map((bookmark, idx) => (
          <button
            key={idx}
            onClick={() => navigateTo(bookmark.url)}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-black/5 transition text-nowrap"
          >
            <span className="text-xs">{bookmark.icon}</span>
            <span>{bookmark.name}</span>
          </button>
        ))}
      </div>

      {/* Embed or Simulated page content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 relative min-h-0">
        {renderPageContent()}
      </div>
    </div>
  );
}
