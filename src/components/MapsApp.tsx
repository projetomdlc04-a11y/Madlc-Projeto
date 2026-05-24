import React, { useState } from "react";
import { Search, MapPin, Navigation, Star, Phone, Globe, Compass, RefreshCw } from "lucide-react";

interface LandMark {
  name: string;
  lat: string;
  lng: string;
  desc: string;
  reviews: string[];
  attractions: string[];
  stars: number;
  phone: string;
}

export default function MapsApp() {
  const landmarks: Record<string, LandMark> = {
    "sao-paulo": {
      name: "São Paulo, SP",
      lat: "-23.5505",
      lng: "-46.6333",
      desc: "Centro cultural financeiro do Brasil. Cidade cosmopolita célebre por suas vias largas, pinacotecas, museus modernos e diversidade gastronômica impecável.",
      attractions: ["Avenida Paulista", "Parque Ibirapuera", "Museu de Arte (MASP)", "Pátio do Colégio"],
      reviews: [
        "Incrível o MASP e a infinidade de restaurantes de classe mundial na região. Nota 10!",
        "O Parque Ibirapuera é um pulmão verde fantástico no meio de arranha-céus.",
      ],
      stars: 5,
      phone: "+55 (11) 5000-1234",
    },
    "rio-janeiro": {
      name: "Rio de Janeiro, RJ",
      lat: "-22.9068",
      lng: "-43.1729",
      desc: "Capital turística do país, a cidade maravilhosa destaca-se pela fusão da natureza praiana com relevos espetaculares, berço mundial da Bossa Nova.",
      attractions: ["Cristo Redentor", "Pão de Açúcar", "Copacabana", "Lapa"],
      reviews: [
        "A vista do Pão de Açúcar ao pôr do sol é uma das lembranças mais bonitas da vida.",
        "Praia de Ipanema super agradável para tomar uma água de coco.",
      ],
      stars: 5,
      phone: "+55 (21) 3211-5678",
    },
    "tokyo": {
      name: "Tóquio, Japão",
      lat: "35.6762",
      lng: "139.6503",
      desc: "Capital ultramoderna japonesa. Um labirinto reluzente de tecnologia avançada, cultura anime, santuários xintoístas e templos centenários pacíficos.",
      attractions: ["Shibuya Crossing", "Tokyo Skytree", "Santuário Meiji", "Akihabara Tech District"],
      reviews: [
        "Organização extrema coletiva impressionante de testemunhar das massas mundiais.",
        "Visitar os fliperamas de Akihabara na época dos neons é retornar aos anos 90.",
      ],
      stars: 5,
      phone: "+81 (3) 1234-5678",
    },
    "paris": {
      name: "Paris, França",
      lat: "48.8566",
      lng: "2.3522",
      desc: "A cidade da luz e da moda. Cortada pelo icônico Rio Sena, abriga tesouros da arte como o Louvre e a fabulosa arquitetura gótica e neoclássica.",
      attractions: ["Torre Eiffel", "Museu do Louvre", "Catedral de Notre-Dame", "Arco do Triunfo"],
      reviews: [
        "Subir na Torre Eiffel à noite e ver Paris brilhando é mágico e maravilhoso.",
        "O museu do Louvre precisa de dias inteiros para ser apreciado adequadamente.",
      ],
      stars: 5,
      phone: "+33 (1) 4567-8910",
    },
  };

  const [selectedCityKey, setSelectedCityKey] = useState<string>("sao-paulo");
  const [searchQuery, setSearchQuery] = useState("");
  const [directionsPromptMode, setDirectionsPromptMode] = useState(false);

  const activeCity = landmarks[selectedCityKey] || landmarks["sao-paulo"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    if (query.includes("rio") || query.includes("janeiro")) {
      setSelectedCityKey("rio-janeiro");
    } else if (query.includes("tokyo") || query.includes("toquio")) {
      setSelectedCityKey("tokyo");
    } else if (query.includes("paris")) {
      setSelectedCityKey("paris");
    } else if (query.includes("sao") || query.includes("paulo") || query.includes("sp")) {
      setSelectedCityKey("sao-paulo");
    } else {
      alert(`Localização "${searchQuery}" foi encontrada! Exibindo aproximação por GPS simulada.`);
    }
  };

  return (
    <div id="maps-layout-container" className="w-full h-full bg-[#f6f6f6] text-black flex rounded-b-xl overflow-hidden select-none font-sans">
      {/* 1. Left Search Side panel */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-5 flex flex-col justify-between h-full">
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
              M
            </div>
            <span className="text-sm font-bold text-slate-800 font-display">Mapas macOS</span>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="maps-search-box"
              className="w-full bg-[#f0f0f0] border-none rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          </form>

          {/* Preset Buttons */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">Selecione</span>
            {Object.keys(landmarks).map((key) => {
              const city = landmarks[key];
              const isSelected = selectedCityKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCityKey(key);
                    setDirectionsPromptMode(false);
                  }}
                  id={`maps-sidebar-item-${key}`}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold leading-tight transition text-left ${
                    isSelected ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* GPS Simulation */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2 text-[10px] text-slate-500 leading-normal">
          <div className="flex justify-between font-bold text-slate-700">
            <span>Status GPS</span>
            <span className="text-green-600">● Conectado</span>
          </div>
          <span>Coordenadas de Apoio: <br /></span>
          <span className="font-mono text-slate-400">{activeCity.lat}, {activeCity.lng}</span>
        </div>
      </div>

      {/* 2. Map Render / Detail view */}
      <div className="flex-1 flex flex-col h-full bg-slate-100 relative min-h-0">
        {/* Animated Simulated Map Grid */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex items-center justify-center">
          {/* Simulated Radial Streets Grid Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          
          {/* Simulated Highways Lines Map Draw */}
          <div className="absolute top-1/4 left-0 w-full h-1 bg-yellow-400/40 opacity-50 shadow-xs" />
          <div className="absolute top-2/3 left-0 w-full h-1 bg-yellow-400/40 opacity-50 shadow-xs" />
          <div className="absolute left-1/3 top-0 w-1 h-full bg-blue-400/30 opacity-40 shadow-xs" />
          <div className="absolute left-3/4 top-0 w-1 h-full bg-blue-400/30 opacity-40 shadow-xs" />

          {/* Interactive Marker Overlay */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white animate-pulse">
              <MapPin className="w-5 h-5 fill-white text-red-600" />
            </div>
            <div className="mt-2.5 bg-black/85 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md font-display">
              {activeCity.name}
            </div>
          </div>

          <Compass className="w-7 h-7 text-slate-500 absolute bottom-4 right-4 bg-white p-1 rounded-full shadow-md animate-spin-slow" />
        </div>

        {/* Dynamic Detail Card Drawer */}
        <div className="h-48 bg-white border-t border-gray-200 p-4 flex gap-6 overflow-y-auto select-text">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-sm text-slate-900 border-b border-gray-100 pb-1.5 flex items-center gap-1.5 font-display">
              <span>{activeCity.name}</span>
              <span className="flex items-center text-orange-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-orange-400" />
                <span className="pl-1 text-[11px] font-bold font-sans">4.9 (Simulado)</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{activeCity.desc}</p>
            
            <div className="border-t border-gray-100 pt-2 flex gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{activeCity.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>www.turismo.gov</span>
              </span>
            </div>
          </div>

          {/* Left panel attractions list */}
          <div className="w-52 border-l border-gray-200 pl-6 space-y-2.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-display">Pontos de Interesse</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-700">
              {activeCity.attractions.slice(0, 4).map((attr, idx) => (
                <div key={idx} className="flex items-center gap-1 truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                  <Navigation className="w-2.5 h-2.5 text-blue-500 transform rotate-45" />
                  <span className="truncate">{attr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
