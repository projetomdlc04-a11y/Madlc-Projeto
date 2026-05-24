import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Calendar, Search, Trash2, Plus, Check, Edit3, Scale, 
  FileText, Tag, Download, User, Save, ArrowLeft, X, CheckSquare, Square, ChevronRight, RefreshCw, Printer
} from "lucide-react";

// Types
export interface CalibracaoCliente {
  id: string;
  os: string;
  clientCode: string;
  clientName: string;
  createdAt: string;
}

export interface BalancaCalibracao {
  divisao: string;
  verificacao: string;
  cargaTotal: string;
  unidade: "g" | "kg";
  tipo: "Balança eletrônica" | "eletromecânica" | "mecânica";
  posicoes: { label: string; value: string }[];
  maiorErro: string;
  tipoPrato: string;
}

export interface FichaLinha {
  id: string;
  nomeTabela: string;
  menorDivisao: string;
  unidadeMedida: string;
  capacidadeInicial: string;
  capacidadeFinal: string;
  pontoCalibracao: string;
  leituraCalibracao: string;
  observacao: string;
  balancaInfo?: BalancaCalibracao;
}

export interface FichaCalibracao {
  id: string;
  clienteId: string;
  data: string;
  frequencia: number; // dias
  codigoInstrumento: string; // sempre MAIÚSCULO
  setor: string;
  nomeInstrumento: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  temperatura: string; // °C
  umidade: string; // % ur
  linhas: FichaLinha[];
}

export interface AtaCalibracao {
  id: string;
  clienteId: string;
  data: string;
  frases: string[];
  preventivaEquips: string[];
  preventivaTexto: string;
  manutencaoEquips: string[];
  manutencaoTexto: string;
  tecnicoNome: string;
  tecnicoAssinatura: string; // Base64 or coordinates
  responsavelNome: string;
  responsavelAssinatura: string; // Base64
}

interface Props {
  onClose?: () => void;
}

export default function CalibracaoApp({ onClose }: Props) {
  // Navigation: "list" | "new-client" | "client-detail" | "new-ficha" | "edit-ficha" | "ata"
  const [view, setView] = useState<"list" | "new-client" | "client-detail" | "new-ficha" | "ata">("list");
  
  // Persistence key
  const [clientes, setClientes] = useState<CalibracaoCliente[]>(() => {
    const saved = localStorage.getItem("calib_clientes");
    return saved ? JSON.parse(saved) : [];
  });
  const [fichas, setFichas] = useState<FichaCalibracao[]>(() => {
    const saved = localStorage.getItem("calib_fichas");
    return saved ? JSON.parse(saved) : [];
  });
  const [atas, setAtas] = useState<AtaCalibracao[]>(() => {
    const saved = localStorage.getItem("calib_atas");
    return saved ? JSON.parse(saved) : [];
  });

  // Selected State
  const [selectedCliente, setSelectedCliente] = useState<CalibracaoCliente | null>(null);
  const [selectedFicha, setSelectedFicha] = useState<FichaCalibracao | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("calib_clientes", JSON.stringify(clientes));
  }, [clientes]);
  useEffect(() => {
    localStorage.setItem("calib_fichas", JSON.stringify(fichas));
  }, [fichas]);
  useEffect(() => {
    localStorage.setItem("calib_atas", JSON.stringify(atas));
  }, [atas]);

  // Clients Form State
  const [clientForm, setClientForm] = useState({ os: "", code: "", name: "" });

  // Camera OCR states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ocrResults, setOcrResults] = useState([
    { label: "Marca: Toledo", value: "Toledo", field: "marca" },
    { label: "Modelo: Prix 3 Plus", value: "Prix 3 Plus", field: "modelo" },
    { label: "Série: 909139-XP", value: "909139-XP", field: "numeroSerie" },
    { label: "Tag: ID-20340", value: "ID-20340", field: "codigoInstrumento" },
    { label: "Cap: 15kg/5g", value: "15kg", field: "nomeInstrumento" }
  ]);

  // Calibration Form lists
  const [fichaForm, setFichaForm] = useState<Partial<FichaCalibracao>>({
    data: new Date().toISOString().split("T")[0],
    frequencia: 365,
    codigoInstrumento: "",
    setor: "",
    nomeInstrumento: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    temperatura: "22.5",
    umidade: "55",
    linhas: []
  });

  const [activeFichaIdForEdit, setActiveFichaIdForEdit] = useState<string | null>(null);

  // Table row being filled
  const [rowDraft, setRowDraft] = useState<Partial<FichaLinha>>({
    nomeTabela: "",
    menorDivisao: "",
    unidadeMedida: "",
    capacidadeInicial: "",
    capacidadeFinal: "",
    pontoCalibracao: "",
    leituraCalibracao: "",
    observacao: ""
  });
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Scales Calibration Modal
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [targetRowForScale, setTargetRowForScale] = useState<string | null>(null);
  const [scaleDraft, setScaleDraft] = useState<BalancaCalibracao>({
    divisao: "5",
    verificacao: "5",
    cargaTotal: "15",
    unidade: "kg",
    tipo: "Balança eletrônica",
    posicoes: [{ label: "posição 1-2", value: "" }],
    maiorErro: "0",
    tipoPrato: "circular"
  });

  // Custom lookups popup
  const [lookupTargetField, setLookupTargetField] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const lookups: Record<string, string[]> = {
    nomeInstrumento: [
      "Balança Computadora", "Balança Industrial", "Balança de precisão", "Termohigrômetro Digital", "Manômetro Analógico", "Paquímetro Mitutoyo",
      "Paquímetro analógico", "Paquímetro digital", "Paquímetro universal", "Paquímetro de profundidade", "Micrômetro externo", "Micrômetro interno",
      "Micrômetro de profundidade", "Súbito", "Relógio comparador", "Relógio apalpador", "Comparador eletrônico", "Altímetro", "Rugosímetro",
      "Projetor de perfil", "Máquina de medição por coordenadas", "Durômetro Rockwell", "Durômetro Brinell", "Durômetro Vickers", "Durômetro portátil",
      "Trena metálica", "Régua de aço", "Escala graduada", "Goniômetro", "Transferidor", "Esquadro de precisão", "Nível de bolha", "Nível eletrônico",
      "Bloco padrão", "Pino padrão", "Anel padrão", "Calibrador passa não passa", "Calibre tampão", "Calibre de rosca", "Calibre de raio",
      "Calibre de folga", "Torquímetro", "Torquímetro digital", "Chave dinamométrica", "Tacômetro", "Estroboscópio", "Vibrometro",
      "Medidor de espessura ultrassônico", "Medidor de camada", "Medidor de brilho", "Medidor de cor", "Luxímetro", "Decibelímetro", "Anemômetro",
      "Termômetro infravermelho", "Termômetro digital", "Termômetro bimetálico", "Termopar", "RTD PT100", "Sensor PT1000", "Data logger de temperatura",
      "Câmara térmica", "Banho termostático", "Forno mufla", "Estufa bacteriológica", "Estufa de secagem", "Incubadora BOD", "Refrigerador laboratorial",
      "Freezer ultrabaixa temperatura", "Criostato", "Banho maria", "Banho ultratermostático", "Medidor de umidade", "Psicrômetro", "Higrômetro",
      "Barômetro", "Manômetro analógico", "Manômetro digital", "Manovacuômetro", "Vacuômetro", "Calibrador de pressão pneumático",
      "Calibrador de pressão hidráulico", "Bomba pneumática", "Bomba hidráulica", "Transmissor de pressão", "Pressostato", "Sensor de pressão diferencial",
      "Indicador de pressão", "Registrador gráfico", "Data logger de pressão", "Fluxômetro", "Rotâmetro", "Medidor de vazão ultrassônico",
      "Medidor de vazão magnético", "Medidor de vazão mássico", "Medidor de nível", "Sensor de nível ultrassônico", "Sensor capacitivo",
      "Sensor indutivo", "Sensor fotoelétrico", "Encoder incremental", "Encoder absoluto", "Tacogerador", "Osciloscópio", "Multímetro digital",
      "Multímetro analógico", "Alicate amperímetro", "Megômetro", "Terrômetro", "Microhmímetro", "Ponte LCR", "Fonte de alimentação",
      "Gerador de funções", "Frequencímetro", "Contador universal", "Analisador de espectro", "Calibrador multifunção", "Simulador de temperatura",
      "Simulador de sinal", "Simulador 4-20mA", "Medidor de pH", "Condutivímetro", "Oxímetro dissolvido", "Turbidímetro", "Colorímetro",
      "Refratômetro", "Polarímetro", "Densímetro", "Picnômetro", "Viscosímetro", "Reômetro", "Cromatógrafo gasoso", "Cromatógrafo líquido",
      "Espectrofotômetro UV", "Espectrofotômetro IR", "Fotômetro de chama", "Titulador automático", "Balança analítica", "Balança semi-analítica",
      "Balança de precisão", "Balança industrial", "Balança rodoviária", "Balança de bancada", "Balança suspensa", "Agitador magnético",
      "Agitador mecânico", "Homogeneizador", "Centrífuga laboratorial", "Centrífuga refrigerada", "Moinho de facas", "Moinho de bolas",
      "Destilador de água", "Deionizador", "Purificador de água", "Autoclave", "Capela de exaustão", "Fluxo laminar", "Microscópio óptico",
      "Microscópio digital", "Microscópio metalográfico", "Microscópio estereoscópico", "Microscópio eletrônico", "Lupa de bancada",
      "Endoscópio industrial", "Boroscópio", "Medidor de espessura por pintura", "Detector de falhas", "Aparelho de ultrassom industrial",
      "Líquido penetrante", "Yoke magnético", "Máquina universal de ensaios", "Máquina de impacto Charpy", "Máquina de fadiga",
      "Máquina de compressão", "Máquina de tração", "Célula de carga", "Indicador de peso", "Dinamômetro", "Medidor de força", "Bancada de calibração",
      "Mesa de granito", "Mesa seno", "Placa de desempeno", "Comparador pneumático", "Comparador óptico", "Interferômetro", "Laser tracker",
      "Braço de medição", "Scanner 3D", "Medidor de circularidade", "Medidor de concentricidade", "Perfilômetro", "Coluna de medição",
      "Medidor de altura digital", "Microscópio de medição", "Ferramenta preset", "Sensor LVDT", "Transdutor linear", "Transdutor de torque",
      "Transdutor de temperatura", "Transdutor de pressão", "Sensor piezoelétrico", "Sensor hall", "Sensor óptico", "Sensor magnético",
      "Sensor ultrassônico", "Cronômetro", "Temporizador digital", "Timer industrial", "Medidor de frequência", "Medidor de potência",
      "Wattímetro", "Varímetro", "Fasímetro", "Analisador de energia", "Registrador de energia", "Qualímetro de energia", "Detector de tensão",
      "Testador de continuidade", "Hipot", "Testador dielétrico", "Calibrador de loop", "Simulador de resistência", "Simulador RTD",
      "Simulador termopar", "Ponte de Wheatstone", "Potenciômetro padrão", "Resistência padrão", "Capacitor padrão", "Indutor padrão",
      "Medidor de isolamento", "Detector de fase", "Sequencímetro", "Medidor de campo magnético", "Gaussímetro", "Teslameter", "Medidor de radiação",
      "Dosímetro", "Geiger", "Pirômetro", "Câmera termográfica", "Termovisor", "Calibrador de temperatura seco", "Poço seco", "Bloco seco",
      "Banho de calibração", "Termômetro de máxima e mínima", "Termômetro de espeto", "Termômetro culinário", "Termômetro clínico",
      "Termômetro industrial", "Medidor de CO2", "Detector multigases", "Detector de oxigênio", "Detector de amônia", "Detector de GLP",
      "Detector de fumaça", "Detector de chama", "Detector de metais", "Detector de vazamento", "Detector ultrassônico",
      "Medidor de espessura de parede", "Medidor de torque", "Medidor de tração", "Medidor de compressão", "Medidor de dureza Shore",
      "Medidor de viscosidade", "Medidor de salinidade", "Medidor ORP", "Medidor TDS", "Medidor de cloro", "Medidor de flúor", "Medidor de nitrato",
      "Medidor de glicose", "Esfigmomanômetro", "Oxímetro de pulso", "Monitor multiparâmetro", "Capnógrafo", "Eletrocardiógrafo", "Eletroencefalógrafo",
      "Espirômetro", "Fluxímetro hospitalar", "Ventilômetro", "Monitor de pressão arterial", "Monitor fetal", "Desfibrilador analisador",
      "Simulador de paciente", "Calibrador biomédico", "Vidraria Becker", "Erlenmeyer", "Balão volumétrico", "Balão de fundo redondo",
      "Pipeta graduada", "Pipeta volumétrica", "Micropipeta", "Proveta", "Bureta", "Funil de separação", "Tubo de ensaio", "Cubeta", "Frasco âmbar",
      "Frasco reagente", "Dessecador", "Condensador Graham", "Condensador Liebig", "Kitassato", "Cadinho", "Cápsula de porcelana", "Almofariz",
      "Bastão de vidro", "Vidro relógio", "Pisseta", "Pipetador automático", "Pipetador manual", "Agulha de inoculação", "Placa de Petri",
      "Câmara de Neubauer", "Câmara climática", "Câmara de estabilidade", "Câmara de vácuo", "Câmara UV", "Estufa incubadora",
      "Refrigerador farmacêutico", "Ultrafreezer", "Criômetro", "Criotubo", "Leitor ELISA", "Lavadora de microplacas", "Analisador hematológico",
      "Analisador bioquímico", "Analisador de umidade", "Medidor de atividade de água", "Medidor de ponto de fusão", "Medidor de ponto de fulgor",
      "Calorímetro", "DSC", "TGA", "Espectrômetro de massa", "ICP-OES", "ICP-MS", "Difratômetro de raios X", "Fluorímetro", "Nefelômetro",
      "Polariscópio", "Esclerômetro", "Rugosímetro portátil", "Rugosímetro de bancada", "Medidor de perfil", "Detector de trinca",
      "Detector de espessura de tinta", "Detector de porosidade", "Medidor de aderência", "Medidor de umidade de grãos", "Medidor de umidade de madeira",
      "Medidor de solo", "pHmetro de bancada", "pHmetro portátil", "Condutivímetro portátil", "Refratômetro digital", "Refratômetro manual",
      "Medidor de brix", "Medidor de álcool", "Densímetro alcoólico", "Alcoômetro", "Salinômetro", "Colorímetro portátil", "Turbidímetro portátil",
      "Oxímetro portátil", "Sonômetro", "Vibrômetro portátil", "Medidor de vibração", "Medidor de alinhamento", "Alinhador a laser",
      "Detector de rolamentos", "Estetoscópio industrial", "Balanceador dinâmico", "Medidor de rotação", "Sensor de proximidade", "Sensor linear",
      "Sensor rotativo", "Sensor infravermelho", "Sensor de corrente", "Sensor de tensão", "Sensor de umidade", "Sensor de vazão", "Sensor de gás",
      "Sensor de nível radar", "Sensor radar", "Sensor laser", "Sensor colorimétrico", "Sensor de vibração", "Sensor acelerômetro",
      "Sensor giroscópio", "Sensor MEMS", "Sensor barométrico", "Sensor piezoresistivo", "Sensor óptico industrial", "Detector fotoelétrico",
      "Encoder linear", "Escala linear", "Régua óptica", "Leitor óptico", "Paquímetro para solda", "Paquímetro de disco", "Micrômetro para rosca",
      "Micrômetro para tubo", "Micrômetro de lâmina", "Micrômetro digital bluetooth", "Comparador centesimal", "Comparador milesimal",
      "Relógio digital", "Medidor de planicidade", "Medidor de paralelismo", "Medidor de excentricidade", "Medidor de ovalização",
      "Medidor de espessura de chapas", "Medidor de tensão superficial", "Medidor de resistência térmica", "Medidor de fluxo térmico",
      "Calibrador de umidade", "Calibrador elétrico", "Calibrador portátil", "Calibrador de bancada", "Calibrador de torque", "Calibrador de pH",
      "Calibrador de condutividade", "Calibrador de peso", "Calibrador de vazão", "Calibrador de instrumentos", "Simulador de pressão",
      "Simulador de vazão", "Simulador eletrônico", "Registrador sem papel", "Controlador PID", "Indicador universal", "Conversor de sinal",
      "Módulo IO", "PLC", "IHM", "SCADA", "Terminal de aquisição", "Sistema DAQ", "Registrador de temperatura", "Registrador de umidade",
      "Registrador eletrônico", "Impressora térmica", "Etiquetadora industrial", "Leitor de código de barras", "Coletor de dados",
      "Tablet industrial", "Computador industrial", "Servidor de dados", "Gateway industrial", "Rádio industrial", "Antena de telemetria",
      "Módulo telemétrico", "Transmissor wireless", "Conversor USB serial", "Conversor RS485", "Conversor Ethernet", "Hub industrial",
      "Switch industrial", "Inversor de frequência", "Soft starter", "Servo drive", "Servo motor", "Motor de passo", "Atuador linear",
      "Atuador pneumático", "Atuador elétrico", "Válvula proporcional", "Válvula solenóide", "Posicionador de válvula", "Controlador de processo",
      "Controlador de temperatura", "Controlador de pressão", "Controlador de vazão", "Controlador de nível", "Indicador digital",
      "Indicador analógico", "Painel sinóptico", "Banco de testes", "Plataforma de ensaio", "Sistema supervisório", "Sistema de monitoramento",
      "Sistema de aquisição de dados", "Sistema de rastreabilidade", "Sistema de calibração automática", "Software metrológico",
      "Software de aquisição", "Software de SPC", "Software de CEP", "Software SCADA", "Software CAD metrológico", "Software CAM",
      "Software de visão artificial", "Software de inspeção dimensional", "Software de análise térmica", "Software de análise vibracional",
      "Software de análise laboratorial", "Software de laboratório", "Sistema LIMS", "Registrador em nuvem", "Estação meteorológica",
      "Sensor meteorológico", "Medidor pluviométrico", "Heliógrafo"
    ],
    marca: [
      "Mitutoyo", "Starrett", "Mahr", "TESA", "Hexagon", "Brown & Sharpe", "Fowler", "Sylvac", "Trimos", "Bowers", "Insize", "INSIZE do Brasil",
      "Digimess", "Vonder", "Gedore", "Tramontina PRO", "Ferramentas Robust", "Sandvik", "Renishaw", "Nikon Metrology", "ZEISS", "Wenzel",
      "Creaform", "Faro", "Leica Geosystems", "Topcon", "Sokkia", "Trimble", "Fluke", "Fluke Calibration", "WIKA", "Ashcroft", "Druck",
      "GE Measurement", "Yokogawa", "Siemens", "Endress+Hauser", "ABB", "Emerson", "Rosemount", "Honeywell", "Testo", "Instrutherm",
      "Minipa", "ICEL", "Hioki", "Chauvin Arnoux", "Keysight", "Agilent", "Keithley", "Tektronix", "Rohde & Schwarz", "Rigol", "GW Instek",
      "BK Precision", "Extech", "Omega Engineering", "Ametek", "Beamex", "Additel", "Crystal Engineering", "Martel", "Ralston", "Meriam",
      "Dwyer", "UE Systems", "Keller", "Danfoss", "Bourdon", "Kimo", "Digitron", "MadgeTech", "Ebro", "Vaisala", "Rotronic", "Novus",
      "Novus Automation", "Full Gauge", "Coel", "Gefran", "Carlo Gavazzi", "Autonics", "Omron", "Schneider Electric", "Phoenix Contact",
      "Weidmuller", "Balluff", "Sick", "Banner Engineering", "Turck", "IFM", "Pepperl+Fuchs", "Baumer", "Krohne", "Vega", "Brooks Instrument",
      "Fuji Electric", "Jumo", "Julabo", "Memmert", "Binder", "Fanem", "Incoterm", "Thermo Fisher", "Hanna Instruments", "Hach", "Mettler Toledo",
      "Sartorius", "Ohaus", "Shimadzu", "Radwag", "Bel Engineering", "Marte Científica", "Gehaka", "Quimis", "Fisatom", "Tecnal", "Solab",
      "Nova Ética", "Phoenix Luferco", "Kasvi", "SPLabor", "Vidrolabor", "Laborglas", "Schott Duran", "Pyrex", "Kimble", "Corning", "Simax",
      "Bomex", "Glassco", "Isolab", "Nalgon", "Kartell", "Brand", "Hirschmann", "Eppendorf", "Gilson", "Rainin", "Socorex", "Hamilton",
      "Thermo Orion", "Velp", "IKA", "Heidolph", "Metrohm", "Anton Paar", "PerkinElmer", "Waters", "Bruker", "Hitachi", "JEOL", "Analytik Jena",
      "Horiba", "Elcometer", "DeFelsko", "Fischer", "Positector", "Magnaflux", "Olympus IMS", "Sonatest", "GE Panametrics", "Krautkramer",
      "Waygate", "Instron", "Emic", "ZwickRoell", "Shimpo", "Chatillon", "Mark-10", "Imada", "Kern", "Precisa", "Denver Instrument",
      "A&D", "Cas", "Toledo do Brasil", "Filizola", "Urano", "Micheletti", "Balmak", "Elgin", "Epson", "Canon", "HP", "Brother", "Zebra",
      "Brady", "Datamax", "TSC", "Sato", "Citizen", "Bosch", "Makita", "DeWalt", "Milwaukee", "Stanley", "Irwin", "Bahco", "Beta Tools",
      "Facom", "Snap-on", "Proto", "Wiha", "Wera", "Knipex", "Nove54", "Vondertech", "Fervi", "Lufkin", "Crescent", "Tajima", "Komelon",
      "Stanley Tools", "Bosch Rexroth", "Parker", "Swagelok", "Spirax Sarco", "Spirax", "SMC", "Festo", "Norgren", "Camozzi", "Metal Work",
      "Airtac", "Rexroth", "Eaton", "Moog", "Burkert", "Clippard", "Spirax Marshall", "Valmet", "Badger Meter", "Fuji", "Endeco", "Apator",
      "Elster", "Itron", "Neptune", "Kamstrup", "Landis+Gyr", "Emerson Process", "RBR", "Secon", "Lupus", "Coimma", "Lupetec", "Brasimet",
      "Elitech", "Elitech Technology", "Inkbird", "Elite Sensors", "Temp Stick", "Sensitech", "Dickson", "LogTag", "Delta OHM", "TFA Dostmann",
      "Thermoworks", "Cooper Atkins", "Comark", "Center", "CEM", "Uni-T", "Victor", "Sanwa", "Kyoritsu", "Megger", "Metrel", "Sonel",
      "Seaward", "Gossen Metrawatt", "Lutron", "PCE Instruments", "PeakTech", "Laserliner", "Bosch Measuring", "Leica", "GeoMax", "Hilti",
      "Spectra Precision", "CST Berger", "Nivel System", "Stabila", "Niveltec", "Trena Brasil", "Accud", "Moore & Wright", "Verdict", "Dasqua",
      "Holex", "Garant", "Hoffmann Group", "Alpa Metrology", "Metrologic", "Time Group", "Phase II", "Baker Gauges", "Mercer", "Pratt & Whitney",
      "Federal Gauge", "Universal Punch", "Mitee-Bite", "SPI", "Central Tools", "Harbin Measuring", "Chengdu Chengliang", "Guanglu", "Chengdu Tool",
      "Guanghua", "Asimeto", "Accusize", "iGaging", "Anytime Tools", "Shars", "PEC Tools", "Anytime Gauge", "Kroeplin", "MarCal", "Alnor",
      "Tohnichi", "CDI Torque", "Norbar", "Mountz", "Stahlwille", "Gedore Torque", "Proto Torque", "Torqueleader", "Desoutter", "Atlas Copco",
      "Chicago Pneumatic", "Ingersoll Rand", "SKF", "NSK", "NTN", "FAG", "Timken", "Schaeffler", "Lincoln Electric", "ESAB", "Miller",
      "Baltec", "Mitra", "Elster Instromet", "Fuji Tool", "Sauter", "Tinius Olsen", "Avery Weigh-Tronix", "Rice Lake", "Cardinal Scale",
      "Adam Equipment", "Scientech", "Labtron", "Bioprecisa", "Kern & Sohn", "OMEGA HH", "Elma Instruments", "C.A 5277", "Prova", "APPA",
      "TES Electrical", "SEW", "Flir", "Seek Thermal", "Raytek", "Mikron", "Optris", "Land Instruments", "AMETEK Land", "UEi", "Bacharach",
      "TSI", "Kanomax", "Airflow", "Casella", "Rion", "Svantek", "Brüel & Kjær", "Larson Davis", "Narda", "Gigahertz Solutions", "Exair",
      "Sefram", "Metrix", "Chauvin", "HBM", "HBM Test and Measurement", "Dewesoft", "National Instruments", "NI", "Datapaq", "Eurotherm",
      "Watlow", "Pyromation", "Tempco", "Love Controls", "Deltrol", "Setra", "Transcat", "Tecsis", "Palmer Wahl", "Palmer Instruments",
      "UWT", "Kobold", "Afriso", "Barksdale", "NOSHOK", "Winters", "Precision Digital", "Reotemp", "Marsh Bellofram", "Bellofram",
      "McDaniel Controls", "Trerice", "Ashcroft Nagano", "Nagano Keiki", "Optronic", "Vici", "Aalborg", "Alicat", "Sierra Instruments",
      "Teledyne", "Foxboro", "APG Sensors", "Gems Sensors", "Sensus", "Badotherm", "Hoffer Flow Controls", "Micronics", "Portaflow",
      "Sierra Wireless", "Fine Instruments", "Kambic", "Isotech", "Hart Scientific", "Fluke Hart", "Aplisens", "Trafag", "Sika", "Lika",
      "Heidenhain", "Magnescale", "RSF Elektronik", "Newall", "Fagor Automation", "Mitcorp", "YXLON", "Nikon Industrial", "Vision Engineering",
      "Keyence", "Cognex", "Omative", "Zoller", "Blum-Novotest", "Marposs", "Jenoptik", "Carl Zeiss Industrial", "Alicona", "PolyWorks",
      "Innovalia", "LK Metrology", "Aberlink", "Coord3", "Metrios", "Werth", "Helios Preisser", "Feinmess", "Talyvel", "Taylor Hobson",
      "Baty", "Trimos Vectra", "Jenway", "Bibby Scientific", "Stuart", "Lovibond", "Macherey-Nagel", "Merck", "Sigma-Aldrich", "Avantor",
      "VWR", "Fisher Scientific", "Bio-Rad", "Leica Microsystems", "Nikon Instruments", "Olympus", "Motic", "Euromex", "Optika", "Celestron",
      "Bresser", "Velab", "Nova Instruments", "Precision Measurement", "Jinan Testing", "Labbox", "Gunt Hamburg", "Armfield", "Didacta",
      "Festo Didactic", "TecQuipment"
    ],
    unidadeMedida: ["g", "kg", "mg", "°C", "% UR", "bar", "mmHg", "mm"]
  };

  // Dialog System
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Tag Modal / PDF Previews
  const [activeStickerPdf, setActiveStickerPdf] = useState<FichaCalibracao | null>(null);
  const [activePranchetaPdf, setActivePranchetaPdf] = useState<FichaCalibracao | null>(null);
  const [activeAtaPdf, setActiveAtaPdf] = useState<AtaCalibracao | null>(null);

  // Selected multi-sheets for client search export
  const [isLupaOpen, setIsLupaOpen] = useState(false);
  const [selectedSheetsIds, setSelectedSheetsIds] = useState<Record<string, boolean>>({});

  // ATA form state
  const [ataForm, setAtaForm] = useState<Partial<AtaCalibracao>>({
    data: new Date().toISOString().split("T")[0],
    frases: [],
    preventivaEquips: [],
    preventivaTexto: "",
    manutencaoEquips: [],
    manutencaoTexto: "",
    tecnicoNome: "",
    tecnicoAssinatura: "",
    responsavelNome: "",
    responsavelAssinatura: ""
  });
  
  // Signature canvases refs
  const canvasTecRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRespRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingTec, setIsDrawingTec] = useState(false);
  const [isDrawingResp, setIsDrawingResp] = useState(false);

  // Start Camera
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera fallback applied (Sandbox demo mode active)");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraActive(false);
  };

  // Drawing event functions for Signature Pad
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isTec: boolean) => {
    const canvas = isTec ? canvasTecRef.current : canvasRespRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    if (isTec) setIsDrawingTec(true); else setIsDrawingResp(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isTec: boolean) => {
    const isDrawing = isTec ? isDrawingTec : isDrawingResp;
    if (!isDrawing) return;
    const canvas = isTec ? canvasTecRef.current : canvasRespRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = (isTec: boolean) => {
    if (isTec) setIsDrawingTec(false); else setIsDrawingResp(false);
    
    // Save image to state
    const canvas = isTec ? canvasTecRef.current : canvasRespRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setAtaForm(prev => ({
        ...prev,
        [isTec ? "tecnicoAssinatura" : "responsavelAssinatura"]: dataUrl
      }));
    }
  };

  const clearCanvas = (isTec: boolean) => {
    const canvas = isTec ? canvasTecRef.current : canvasRespRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setAtaForm(prev => ({
          ...prev,
          [isTec ? "tecnicoAssinatura" : "responsavelAssinatura"]: ""
        }));
      }
    }
  };

  const triggerAlert = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  // Saving Clients/OS
  const handleCreateClient = () => {
    if (!clientForm.name.trim() || !clientForm.os.trim() || !clientForm.code.trim()) {
      alert("Por favor preencha todos os campos do cliente.");
      return;
    }
    const newCli: CalibracaoCliente = {
      id: "cli-" + Date.now(),
      os: clientForm.os,
      clientCode: clientForm.code,
      clientName: clientForm.name,
      createdAt: new Date().toLocaleDateString("pt-BR")
    };
    setClientes([...clientes, newCli]);
    setClientForm({ os: "", code: "", name: "" });
    setSelectedCliente(newCli);
    setView("client-detail");
  };

  // Saving / Adding rows in Ficha table
  const handleSaveRow = () => {
    if (!rowDraft.nomeTabela?.trim()) {
      alert("Por favor preencha o Nome da Tabela");
      return;
    }
    const lines = [...(fichaForm.linhas || [])];
    if (editingRowId) {
      const index = lines.findIndex(l => l.id === editingRowId);
      if (index !== -1) {
        lines[index] = { ...(rowDraft as FichaLinha), id: editingRowId };
      }
      setEditingRowId(null);
    } else {
      const newRow: FichaLinha = {
        ...(rowDraft as FichaLinha),
        id: "l-" + Date.now()
      };
      lines.push(newRow);
    }
    setFichaForm(prev => ({ ...prev, linhas: lines }));
    setRowDraft({
      nomeTabela: "",
      menorDivisao: "",
      unidadeMedida: "",
      capacidadeInicial: "",
      capacidadeFinal: "",
      pontoCalibracao: "",
      leituraCalibracao: "",
      observacao: ""
    });
  };

  const startEditRow = (row: FichaLinha) => {
    setRowDraft(row);
    setEditingRowId(row.id);
  };

  const deleteRow = (id: string) => {
    triggerAlert("Apagar Linha", "Deseja realmente apagar esta linha de calibração?", () => {
      setFichaForm(prev => ({
        ...prev,
        linhas: (prev.linhas || []).filter(l => l.id !== id)
      }));
    });
  };

  const duplicateRowWithBlank = () => {
    const lines = [...(fichaForm.linhas || [])];
    const newRow: FichaLinha = {
      id: "l-" + Date.now(),
      nomeTabela: "",
      menorDivisao: "",
      unidadeMedida: "",
      capacidadeInicial: "",
      capacidadeFinal: "",
      pontoCalibracao: "",
      leituraCalibracao: "",
      observacao: ""
    };
    lines.push(newRow);
    setFichaForm(prev => ({ ...prev, linhas: lines }));
    startEditRow(newRow);
  };

  // Scales submodal
  const openScalesModal = (rowId: string, currentScaleInfo?: BalancaCalibracao) => {
    setTargetRowForScale(rowId);
    if (currentScaleInfo) {
      setScaleDraft(currentScaleInfo);
    } else {
      setScaleDraft({
        divisao: "2",
        verificacao: "2",
        cargaTotal: "10",
        unidade: "g",
        tipo: "Balança eletrônica",
        posicoes: [{ label: "posição 1-2", value: "" }],
        maiorErro: "0.2",
        tipoPrato: "circular"
      });
    }
    setScaleModalOpen(true);
  };

  const handleAddScalePosition = () => {
    const currentLen = scaleDraft.posicoes.length;
    if (currentLen >= 4) return; // goes up to 1-5 (label pos 4 is 1-5)
    const nextLabel = `posição 1-${currentLen + 3}`;
    setScaleDraft({
      ...scaleDraft,
      posicoes: [...scaleDraft.posicoes, { label: nextLabel, value: "" }]
    });
  };

  const handleSaveScale = () => {
    if (!targetRowForScale) return;
    const lines = [...(fichaForm.linhas || [])];
    const index = lines.findIndex(l => l.id === targetRowForScale);
    if (index !== -1) {
      lines[index].balancaInfo = scaleDraft;
    }
    setFichaForm(prev => ({ ...prev, linhas: lines }));
    setScaleModalOpen(false);
    setTargetRowForScale(null);
  };

  // Ficha general Saving
  const handleSaveEntireFicha = () => {
    if (!fichaForm.codigoInstrumento?.trim() || !fichaForm.nomeInstrumento?.trim()) {
      alert("Por favor, preencha as informações obrigatórias (Código e Nome do Instrumento)");
      return;
    }
    if (!selectedCliente) return;

    const finalFicha: FichaCalibracao = {
      ...(fichaForm as FichaCalibracao),
      id: activeFichaIdForEdit || "ficha-" + Date.now(),
      clienteId: selectedCliente.id,
      codigoInstrumento: (fichaForm.codigoInstrumento || "").toUpperCase()
    };

    if (activeFichaIdForEdit) {
      setFichas(fichas.map(f => f.id === activeFichaIdForEdit ? finalFicha : f));
    } else {
      setFichas([...fichas, finalFicha]);
    }

    setView("client-detail");
    setActiveFichaIdForEdit(null);
    setFichaForm({
      data: new Date().toISOString().split("T")[0],
      frequencia: 365,
      codigoInstrumento: "",
      setor: "",
      nomeInstrumento: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      temperatura: "22.5",
      umidade: "55",
      linhas: []
    });
  };

  // Client PDF operations
  const downloadAllPdfs = (cliente: CalibracaoCliente) => {
    const clientFichas = fichas.filter(f => f.clienteId === cliente.id);
    if (clientFichas.length === 0) {
      alert("Não existem fichas registradas para este cliente.");
      return;
    }
    alert(`Preparado pacote contendo ${clientFichas.length} relatórios em PDF do cliente: ${cliente.clientName}. O download iniciará agora.`);
  };

  // ATA Service logic
  const handleOpenAtaScreen = () => {
    if (!selectedCliente) return;
    const existingAta = atas.find(a => a.clienteId === selectedCliente.id);
    if (existingAta) {
      setAtaForm(existingAta);
    } else {
      setAtaForm({
        data: new Date().toISOString().split("T")[0],
        frases: [],
        preventivaEquips: [],
        preventivaTexto: "",
        manutencaoEquips: [],
        manutencaoTexto: "",
        tecnicoNome: "",
        tecnicoAssinatura: "",
        responsavelNome: "",
        responsavelAssinatura: ""
      });
    }
    setView("ata");
  };

  const handleSaveAta = () => {
    if (!selectedCliente) return;
    const finalAta: AtaCalibracao = {
      ...(ataForm as AtaCalibracao),
      id: "ata-" + Date.now(),
      clienteId: selectedCliente.id
    };
    const index = atas.findIndex(a => a.clienteId === selectedCliente.id);
    if (index !== -1) {
      setAtas(atas.map((a, i) => i === index ? finalAta : a));
    } else {
      setAtas([...atas, finalAta]);
    }
    setView("client-detail");
    alert("ATA salva com sucesso no histórico eletrônico!");
  };

  // Extract equipment summaries
  const getFichasSummary = (clientId: string) => {
    const items = fichas.filter(f => f.clienteId === clientId);
    const summary: Record<string, number> = {};
    items.forEach(i => {
      const name = i.nomeInstrumento || "Instrumento";
      summary[name] = (summary[name] || 0) + 1;
    });
    return Object.entries(summary).map(([name, qty]) => ({ name, qty }));
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 text-slate-800 font-sans select-none overflow-hidden h-full">
      {/* OS-X-Standard Top Toolbar */}
      <div className="h-10 border-b border-slate-200 bg-white px-4 flex items-center justify-between shadow-xs shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (view === "new-client") setView("list");
              else if (view === "client-detail") { setView("list"); setSelectedCliente(null); }
              else if (view === "new-ficha") setView("client-detail");
              else if (view === "ata") setView("client-detail");
              else if (onClose) onClose();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>
        <div className="text-center">
          <span className="text-[13px] font-bold tracking-tight text-slate-700">
            {view === "list" && "Fichas de Calibração / OS Dashboard"}
            {view === "new-client" && "Novo Cliente / Ordem de Serviço"}
            {view === "client-detail" && `OS: ${selectedCliente?.os || ""} - ${selectedCliente?.clientName || ""}`}
            {view === "new-ficha" && (activeFichaIdForEdit ? "Editar Ficha de Calibração" : "Criar Ficha de Calibração")}
            {view === "ata" && "ATA de Calibração & Assistência"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(view === "new-client" || view === "new-ficha" || view === "ata") && (
            <button
              onClick={() => {
                if (view === "new-client") handleCreateClient();
                else if (view === "new-ficha") handleSaveEntireFicha();
                else if (view === "ata") handleSaveAta();
              }}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 relative min-h-0">
        
        {/* VIEW 1: CLIENTS OS DIRECTORY GRID */}
        {view === "list" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-base font-bold text-slate-800">Diretório de Calibrações Ativas</h1>
                <p className="text-[11px] text-slate-500">Selecione uma Ordem de Serviço ou adicione um novo registro de cliente.</p>
              </div>
              <button
                onClick={() => setView("new-client")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nova O.S / Cliente</span>
              </button>
            </div>

            {clientes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">Nenhuma Ordem de Serviço encontrada</p>
                <p className="text-xs text-slate-400 mt-1">Clique em 'Nova O.S / Cliente' para começar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientes.map(cli => {
                  const clientFichas = fichas.filter(f => f.clienteId === cli.id);
                  return (
                    <div 
                      key={cli.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-400 transition flex flex-col justify-between"
                    >
                      <div className="p-4" onClick={() => { setSelectedCliente(cli); setView("client-detail"); }}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-blue-50 text-blue-700 font-bold font-mono text-[10px] px-2 py-0.5 rounded-md border border-blue-100">
                            OS: {cli.os}
                          </span>
                          <span className="text-[10px] text-slate-400">{cli.createdAt}</span>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 truncate">{cli.clientName}</h2>
                        <span className="text-xs text-slate-500 mt-0.5 block">Cód. Cliente: {cli.clientCode}</span>
                        
                        <div className="mt-3 flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg text-[11px]">
                          <span className="text-slate-500 font-medium">Fichas cadastradas:</span>
                          <span className="font-bold text-slate-700">{clientFichas.length} fichas</span>
                        </div>
                      </div>

                      {/* Row Action Panel for each client */}
                      <div className="border-t border-slate-100 bg-slate-50/50 p-2 flex items-center justify-between gap-1">
                        <div className="flex gap-1">
                          <button
                            title="Ata de Calibração / Serviços"
                            onClick={() => { setSelectedCliente(cli); handleOpenAtaScreen(); }}
                            className="p-1 px-2 hover:bg-slate-200 text-teal-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>ATA</span>
                          </button>
                          <button
                            title="Download Todos os PDFs"
                            onClick={() => downloadAllPdfs(cli)}
                            className="p-1 px-2 hover:bg-slate-200 text-blue-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Exportar</span>
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            triggerAlert("Excluir Cliente e O.S", `Tem certeza que deseja apagar permanentemente o cliente ${cli.clientName} e todas as suas fichas?`, () => {
                              setClientes(clientes.filter(c => c.id !== cli.id));
                              setFichas(fichas.filter(f => f.clienteId !== cli.id));
                            });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: NEW CLIENT FORM */}
        {view === "new-client" && (
          <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Cadastrar O.S & Cliente</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Número da O.S</label>
                <input 
                  type="text"
                  value={clientForm.os}
                  onChange={e => setClientForm({ ...clientForm, os: e.target.value })}
                  placeholder="Ex: 2026-90"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Código do Cliente</label>
                <input 
                  type="text"
                  value={clientForm.code}
                  onChange={e => setClientForm({ ...clientForm, code: e.target.value })}
                  placeholder="Ex: CLI-3091"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nome do Cliente / Empresa</label>
                <input 
                  type="text"
                  value={clientForm.name}
                  onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Ex: Laticínio Bela Vista Ltda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={handleCreateClient}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-xs font-bold shadow-sm transition"
                >
                  + Criar Cliente
                </button>
                <button
                  onClick={() => setView("list")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl py-2 text-xs font-bold transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CLIENT DETAILS / WORKSPACE */}
        {view === "client-detail" && selectedCliente && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Customer mini card info */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                    O.S {selectedCliente.os}
                  </span>
                  <span className="text-xs text-slate-400">Cliente Cód: {selectedCliente.clientCode}</span>
                </div>
                <h2 className="text-base font-extrabold text-slate-800">{selectedCliente.clientName}</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenAtaScreen()}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  <span>Gerar ATA de Calibração</span>
                </button>
                <button
                  onClick={() => setIsLupaOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
                >
                  <Search className="w-4 h-4" />
                  <span>Busca de Fichas (Lupa)</span>
                </button>
              </div>
            </div>

            {/* List of Fichas of this customer */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fichas de Calibração deste Cliente</h3>
              </div>

              {fichas.filter(f => f.clienteId === selectedCliente.id).length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Printer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Este cliente ainda não possui nenhuma ficha de calibração eletrônica.</p>
                  <button
                    onClick={() => {
                      setActiveFichaIdForEdit(null);
                      setFichaForm({
                        data: new Date().toISOString().split("T")[0],
                        frequencia: 365,
                        codigoInstrumento: "",
                        setor: "",
                        nomeInstrumento: "",
                        marca: "",
                        modelo: "",
                        numeroSerie: "",
                        temperatura: "22.5",
                        umidade: "55",
                        linhas: []
                      });
                      setView("new-ficha");
                    }}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Primeira Ficha</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {fichas.filter(f => f.clienteId === selectedCliente.id).map(ficha => (
                      <div 
                        key={ficha.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inst ID:</span>
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {ficha.codigoInstrumento}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-[11px] text-slate-500">Setor: {ficha.setor || "Não Informado"}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">{ficha.nomeInstrumento}</h4>
                          <div className="flex gap-4 text-[11px] text-slate-500">
                            <span>Marca: {ficha.marca || "-"}</span>
                            <span>Modelo: {ficha.modelo || "-"}</span>
                            <span>Data: {ficha.data}</span>
                          </div>
                        </div>

                        {/* Ficha level actions (pencil, tag, clip board, trash) */}
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 shrink-0">
                          <button
                            title="Editar Ficha"
                            onClick={() => {
                              setActiveFichaIdForEdit(ficha.id);
                              setFichaForm(ficha);
                              setView("new-ficha");
                            }}
                            className="p-1 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Editar</span>
                          </button>

                          <button
                            title="Visualizar/Imprimir Etiqueta PDF"
                            onClick={() => setActiveStickerPdf(ficha)}
                            className="p-1 px-2 bg-white hover:bg-slate-100 text-amber-700 rounded-md border border-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Tag className="w-3.5 h-3.5 text-amber-500" />
                            <span>Etiqueta</span>
                          </button>

                          <button
                            title="Visualizar/Imprimir Ficha Completa PDF"
                            onClick={() => setActivePranchetaPdf(ficha)}
                            className="p-1 px-2 bg-white hover:bg-slate-100 text-teal-700 rounded-md border border-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-500" />
                            <span>Ficha PDF</span>
                          </button>

                          <button
                            title="Excluir Ficha"
                            onClick={() => {
                              triggerAlert("Apagar Ficha de Calibração", "Deseja realmente deletar esta ficha de calibração?", () => {
                                setFichas(fichas.filter(f => f.id !== ficha.id));
                              });
                            }}
                            className="p-1 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-600 border border-slate-200 rounded-md transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add bottom creator button for easy workflow */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveFichaIdForEdit(null);
                        setFichaForm({
                          data: new Date().toISOString().split("T")[0],
                          frequencia: 365,
                          codigoInstrumento: "",
                          setor: "",
                          nomeInstrumento: "",
                          marca: "",
                          modelo: "",
                          numeroSerie: "",
                          temperatura: "22.5",
                          umidade: "55",
                          linhas: []
                        });
                        setView("new-ficha");
                      }}
                      className="w-full bg-blue-50 border border-dashed border-blue-200 hover:bg-blue-100 text-blue-700 font-bold rounded-xl py-3 text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Mais uma Ficha de Calibração</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: CREATE / EDIT FICHA DE CALIBRAÇÃO WORKSPACE */}
        {view === "new-ficha" && (
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            
            {/* Header row with simulation camera */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-5">
              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                
                {/* Simulated high tech tablet camera with character recognition */}
                <div className="w-full md:w-64 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden relative min-h-[180px]">
                  {isCameraActive ? (
                    <div className="absolute inset-0 flex flex-col justify-between bg-slate-900">
                      {/* Live OCR screen simulation feed */}
                      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
                      <div className="relative z-10 p-2 bg-black/60 text-[10px] text-blue-400 font-mono flex items-center justify-between">
                        <span>📷 OCR STREAM ON</span>
                        <span className="animate-ping text-red-500">●</span>
                      </div>
                      
                      {/* Recognized hot click boundaries */}
                      <div className="relative z-10 p-3 space-y-1.5 h-full overflow-y-auto flex flex-col justify-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Toque para preencher:</span>
                        {ocrResults.map((r, i) => (
                          <button
                            key={i}
                            title={`Copiar para ${r.field}`}
                            type="button"
                            onClick={() => {
                              setFichaForm(prev => ({
                                ...prev,
                                [r.field]: r.value
                              }));
                            }}
                            className="bg-blue-900/60 hover:bg-blue-800 text-white rounded px-2 py-1 text-[11px] border border-blue-500/20 text-left transition truncate block"
                          >
                            ⚡ {r.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="relative z-10 bg-rose-600 text-white py-1.5 text-center text-[10px] font-bold w-full uppercase"
                      >
                        Desativar Câmera
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300">Scanner de Etiqueta (OCR)</span>
                      <p className="text-[10px] text-slate-500 leading-normal max-w-[180px]">
                        Ative a câmera para identificar Marca, Modelo e Serial do equipamento no tablet automaticamente.
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg px-3 py-1.5 transition uppercase"
                      >
                        Ativar Scanner Câmera
                      </button>
                    </div>
                  )}
                </div>

                {/* Form fields side-by-side with camera */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data da Calibração</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={fichaForm.data}
                        onChange={e => setFichaForm({ ...fichaForm, data: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Frequência (em dias)</label>
                    <input 
                      type="number"
                      value={fichaForm.frequencia}
                      onChange={e => setFichaForm({ ...fichaForm, frequencia: Number(e.target.value) })}
                      placeholder="Ex: 365"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Código do Instrumento (MAIÚSCULO)</label>
                    <input 
                      type="text"
                      value={fichaForm.codigoInstrumento}
                      onChange={e => setFichaForm({ ...fichaForm, codigoInstrumento: e.target.value.toUpperCase() })}
                      placeholder="Ex: BAL-15"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Setor de Calibração</label>
                    <input 
                      type="text"
                      value={fichaForm.setor}
                      onChange={e => setFichaForm({ ...fichaForm, setor: e.target.value })}
                      placeholder="Ex: Recebimento de Leite"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  {/* Nome + Lupa lookup logic */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome do Instrumento</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        value={fichaForm.nomeInstrumento}
                        onChange={e => setFichaForm({ ...fichaForm, nomeInstrumento: e.target.value })}
                        placeholder="Pesquise ou escreva libre..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => { setLookupTargetField("nomeInstrumento"); setSearchText(fichaForm.nomeInstrumento || ""); }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-2 rounded-xl transition"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  {/* Marca + Lupa lookup */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marca do Dispositivo</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        value={fichaForm.marca}
                        onChange={e => setFichaForm({ ...fichaForm, marca: e.target.value })}
                        placeholder="Pesquise ou escreva libre..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => { setLookupTargetField("marca"); setSearchText(fichaForm.marca || ""); }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-2 rounded-xl transition"
                      >
                        <Search className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modelo</label>
                    <input 
                      type="text"
                      value={fichaForm.modelo}
                      onChange={e => setFichaForm({ ...fichaForm, modelo: e.target.value })}
                      placeholder="Ex: Prix 3"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Número de Série</label>
                    <input 
                      type="text"
                      value={fichaForm.numeroSerie}
                      onChange={e => setFichaForm({ ...fichaForm, numeroSerie: e.target.value })}
                      placeholder="Ex: 889139-Z"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Temperatura (°C)</label>
                    <input 
                      type="text"
                      value={fichaForm.temperatura}
                      onChange={e => setFichaForm({ ...fichaForm, temperatura: e.target.value })}
                      placeholder="Ex: 22"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Umidade (% ur)</label>
                    <input 
                      type="text"
                      value={fichaForm.umidade}
                      onChange={e => setFichaForm({ ...fichaForm, umidade: e.target.value })}
                      placeholder="Ex: 50"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER PORTION: EXPANDABLE LINES TABLE WITH 8 CORE LABELS AND 5 OPERATIONS ICONS */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Linhas de Dados / Ensaios de Calibração</h3>
              
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-slate-800 text-[11px] leading-normal text-left min-w-[900px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Nome Tabela</th>
                      <th className="py-2.5 px-2 w-[80px]">Menor Div.</th>
                      <th className="py-2.5 px-2 w-[110px]">Unid. Medida</th>
                      <th className="py-2.5 px-2 w-[90px]">Cap. Inicial</th>
                      <th className="py-2.5 px-2 w-[90px]">Cap. Final</th>
                      <th className="py-2.5 px-2 w-[95px]">Ponto Calib.</th>
                      <th className="py-2.5 px-2 w-[95px]">Leit. Calib.</th>
                      <th className="py-2.5 px-2">Observação</th>
                      <th className="py-2.5 px-3 text-right w-[180px]">Operações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Rows list iteration */}
                    {(fichaForm.linhas || []).map((linha) => (
                      <tr key={linha.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{linha.nomeTabela}</td>
                        <td className="py-2.5 px-2">{linha.menorDivisao}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-600">{linha.unidadeMedida}</td>
                        <td className="py-2.5 px-2">{linha.capacidadeInicial}</td>
                        <td className="py-2.5 px-2">{linha.capacidadeFinal}</td>
                        <td className="py-2.5 px-2 text-blue-700 font-bold">{linha.pontoCalibracao}</td>
                        <td className="py-2.5 px-2 text-emerald-700 font-bold">{linha.leituraCalibracao}</td>
                        <td className="py-2.5 px-2 text-slate-500 truncate max-w-[120px]">{linha.observacao || "-"}</td>
                        
                        {/* THE 5 REQUISITE OPERATIONS ICONS */}
                        <td className="py-2 px-3 text-right">
                          <div className="flex gap-1 justify-end items-center">
                            
                            {/* Icon 5: Scale/Balança details entry triggers */}
                            <button
                              type="button"
                              title="Configurar Balança Adicional"
                              onClick={() => openScalesModal(linha.id, linha.balancaInfo)}
                              className={`p-1 rounded-md transition ${linha.balancaInfo ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              <Scale className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon 1: Confirm / Guard locked */}
                            <button
                              type="button"
                              title="Bloquear/Confirmar"
                              onClick={() => alert("Informações da linha salvas e validadas!")}
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon 2: Pencil for Inline Editing */}
                            <button
                              type="button"
                              title="Editar Linha"
                              onClick={() => startEditRow(linha)}
                              className="p-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon 3: Trashcan deletes with popover check */}
                            <button
                              type="button"
                              title="Apagar Linha"
                              onClick={() => deleteRow(linha.id)}
                              className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Icon 4: Plus duplicates row with blank for speed */}
                            <button
                              type="button"
                              title="Nova Linha abaixo"
                              onClick={duplicateRowWithBlank}
                              className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Entry Inline Active Draft form row of the active editing table */}
                    <tr className="bg-blue-50/40 border border-blue-200">
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.nomeTabela}
                          onChange={e => setRowDraft({ ...rowDraft, nomeTabela: e.target.value })}
                          placeholder="Ex: Tabela 1"
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px]"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.menorDivisao}
                          onChange={e => setRowDraft({ ...rowDraft, menorDivisao: e.target.value })}
                          placeholder="Ex: 5"
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px]"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <div className="flex gap-0.5">
                          <input
                            type="text"
                            value={rowDraft.unidadeMedida}
                            onChange={e => setRowDraft({ ...rowDraft, unidadeMedida: e.target.value })}
                            placeholder="g"
                            className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => { setLookupTargetField("unidadeMedida"); setSearchText(rowDraft.unidadeMedida || ""); }}
                            className="bg-slate-200 p-1 rounded hover:bg-slate-300"
                          >
                            <Search className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.capacidadeInicial}
                          onChange={e => setRowDraft({ ...rowDraft, capacidadeInicial: e.target.value })}
                          placeholder="0 kg"
                          className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px]"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.capacidadeFinal}
                          onChange={e => setRowDraft({ ...rowDraft, capacidadeFinal: e.target.value })}
                          placeholder="15 kg"
                          className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px]"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.pontoCalibracao}
                          onChange={e => setRowDraft({ ...rowDraft, pontoCalibracao: e.target.value })}
                          placeholder="5.000"
                          className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-bold text-blue-800"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.leituraCalibracao}
                          onChange={e => setRowDraft({ ...rowDraft, leituraCalibracao: e.target.value })}
                          placeholder="5.000"
                          className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] font-bold text-emerald-800"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={rowDraft.observacao}
                          onChange={e => setRowDraft({ ...rowDraft, observacao: e.target.value })}
                          placeholder="Reprovado / OK"
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px]"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          type="button"
                          onClick={handleSaveRow}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 font-bold text-[10px] uppercase shadow-xs transition"
                        >
                          {editingRowId ? "Confirmar" : "+ Add Linha"}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Form Navigation controls */}
            <div className="flex gap-3 justify-end pt-3">
              <button
                onClick={handleSaveEntireFicha}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Ficha & Voltar</span>
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setView("client-detail");
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 px-5 rounded-xl transition"
              >
                Cancelar Tudo
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: ATA CREATION & REVIEWS COMPONENT */}
        {view === "ata" && selectedCliente && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 pb-12">
            
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold text-slate-800">ATA DE CALIBRAÇÃO E SERVIÇOS TÉCNICOS</h2>
                <p className="text-[11px] text-slate-500">Relatório geral consolidado de visitas e prestação de contas do cliente.</p>
              </div>
              <span className="font-mono bg-blue-100 text-blue-800 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border border-blue-200">
                O.S {selectedCliente.os}
              </span>
            </div>

            {/* General Automatic details block */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data da ATA (Auto/Edit)</label>
                <div className="flex gap-1.5 items-center bg-white rounded-lg px-2 py-1 border border-slate-200 select-all">
                  <input 
                    type="date"
                    value={ataForm.data}
                    onChange={e => setAtaForm({ ...ataForm, data: e.target.value })}
                    className="w-full bg-transparent border-none text-xs focus:outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Empresa / Cliente</label>
                <span className="text-xs font-bold text-slate-800 block pt-1.5">{selectedCliente.clientName}</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cód. Cliente</label>
                <span className="text-xs font-semibold font-mono text-slate-700 block pt-1.5">{selectedCliente.clientCode}</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">O.S Origem</label>
                <span className="text-xs font-bold text-slate-800 block pt-1.5">{selectedCliente.os}</span>
              </div>
            </div>

            {/* Checklist of Phrases */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Declarações / Escopo Realizado</h3>
              <div className="space-y-1.5">
                {[
                  "Realizado nas dependências do cliente a calibração dos seguintes equipamentos",
                  "Realizado nas dependências do cliente a manutenção dos seguintes equipamentos",
                  "Realizado nas dependências do cliente a preventiva dos seguintes equipamentos",
                  "Realizado nas dependências do cliente a qualificação dos seguintes equipamentos"
                ].map((phrase, idx) => {
                  const isChecked = ataForm.frases?.includes(phrase);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const current = [...(ataForm.frases || [])];
                        if (current.includes(phrase)) {
                          setAtaForm({ ...ataForm, frases: current.filter(p => p !== phrase) });
                        } else {
                          setAtaForm({ ...ataForm, frases: [...current, phrase] });
                        }
                      }}
                      className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition flex items-start gap-2.5 text-xs text-slate-700"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span>{phrase}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Automatically Compiled instruments list table from client's sheets */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Itens Extraídos das Fichas Ativas</h3>
              <div className="border border-slate-100 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left text-slate-800">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100 uppercase tracking-widest text-[9px]">
                    <tr>
                      <th className="p-3 w-[120px]">Quantidade</th>
                      <th className="p-3">Descrição do Instrumento</th>
                      <th className="p-3">Serviço de Verificação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {getFichasSummary(selectedCliente.id).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-slate-400">Nenhum equipamento cadastrado nas fichas deste cliente.</td>
                      </tr>
                    ) : (
                      getFichasSummary(selectedCliente.id).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="p-3 font-semibold text-slate-700">{item.qty}x Unidade(s)</td>
                          <td className="p-3 font-bold text-slate-800">{item.name}</td>
                          <td className="p-3 text-slate-500">Calibração Verificada</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* + Preventiva and + Manutenção interactive additions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* + Preventiva block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700">Manutenções Preventivas Adicionais</h4>
                  <button
                    type="button"
                    onClick={() => {
                      // Multichoice lookup simulation
                      const selected = prompt("Selecione os equipamentos para Preventiva (múltipla escolha separada por vírgula):", "Balança Toledo, Termohigrômetro");
                      if (selected) {
                        const equips = selected.split(",").map(e => e.trim());
                        setAtaForm({
                          ...ataForm,
                          preventivaEquips: equips,
                          preventivaTexto: `Os itens mencionados acima (${equips.join(", ")}) foram submetidos à manutenção preventiva de rotina.`
                        });
                      }
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold uppercase rounded px-2 py-1 transition"
                  >
                    + Preventiva
                  </button>
                </div>
                {ataForm.preventivaEquips && ataForm.preventivaEquips.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border text-xs text-slate-600 font-mono space-y-1 leading-normal">
                    <span className="font-bold text-blue-700">Equipamentos:</span> {ataForm.preventivaEquips.join(", ")}
                    <p className="border-t pt-1.5 mt-1.5 text-[11px] text-slate-700">{ataForm.preventivaTexto}</p>
                  </div>
                )}
              </div>

              {/* + Manutencao block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700">Manutenções Corretivas Adicionais</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const selected = prompt("Selecione os equipamentos para Manutenção corretiva (múltipla escolha separada por vírgula):", "Balança Toledo, Paquímetro");
                      if (selected) {
                        const equips = selected.split(",").map(e => e.trim());
                        setAtaForm({
                          ...ataForm,
                          manutencaoEquips: equips,
                          manutencaoTexto: `Os equipamentos listados acima (${equips.join(", ")}) passaram por reparos corretivos e lubrificação técnica.`
                        });
                      }
                    }}
                    className="bg-teal-100 hover:bg-teal-200 text-teal-700 text-[10px] font-bold uppercase rounded px-2 py-1 transition"
                  >
                    + Manutenção
                  </button>
                </div>
                {ataForm.manutencaoEquips && ataForm.manutencaoEquips.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border text-xs text-slate-600 font-mono space-y-1 leading-normal">
                    <span className="font-bold text-teal-700">Equipamentos:</span> {ataForm.manutencaoEquips.join(", ")}
                    <p className="border-t pt-1.5 mt-1.5 text-[11px] text-slate-700">{ataForm.manutencaoTexto}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Signature dual canvas touch fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
              
              {/* Technical Sign */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Técnico Executor</label>
                  <button 
                    type="button"
                    onClick={() => clearCanvas(true)}
                    className="text-[9px] font-bold uppercase text-rose-500/80 hover:text-rose-600 transition"
                  >
                    Limpar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nome do Técnico Executor..."
                  value={ataForm.tecnicoNome || ""}
                  onChange={e => setAtaForm({ ...ataForm, tecnicoNome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 block"
                />
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl overflow-hidden relative select-none">
                  <canvas
                    ref={canvasTecRef}
                    width={380}
                    height={100}
                    onMouseDown={e => startDrawing(e, true)}
                    onMouseMove={e => draw(e, true)}
                    onMouseUp={() => stopDrawing(true)}
                    onTouchStart={e => startDrawing(e, true)}
                    onTouchMove={e => draw(e, true)}
                    onTouchEnd={() => stopDrawing(true)}
                    className="w-full h-[100px] cursor-crosshair block"
                  />
                  <div className="absolute bottom-1 right-2 pointer-events-none text-[8px] text-slate-400 font-mono uppercase bg-white/60 px-1 backdrop-blur-xs">
                    Assinatura Livre por Toque/Mouse
                  </div>
                </div>
              </div>

              {/* Responsible Client supervisor Sign */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Funcionário Responsável (Cliente)</label>
                  <button 
                    type="button"
                    onClick={() => clearCanvas(false)}
                    className="text-[9px] font-bold uppercase text-rose-500/80 hover:text-rose-600 transition"
                  >
                    Limpar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nome do Funcionário Responsável..."
                  value={ataForm.responsavelNome || ""}
                  onChange={e => setAtaForm({ ...ataForm, responsavelNome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 block"
                />
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl overflow-hidden relative select-none">
                  <canvas
                    ref={canvasRespRef}
                    width={380}
                    height={100}
                    onMouseDown={e => startDrawing(e, false)}
                    onMouseMove={e => draw(e, false)}
                    onMouseUp={() => stopDrawing(false)}
                    onTouchStart={e => startDrawing(e, false)}
                    onTouchMove={e => draw(e, false)}
                    onTouchEnd={() => stopDrawing(false)}
                    className="w-full h-[100px] cursor-crosshair block"
                  />
                  <div className="absolute bottom-1 right-2 pointer-events-none text-[8px] text-slate-400 font-mono uppercase bg-white/60 px-1 backdrop-blur-xs">
                    Assinatura Livre por Toque/Mouse
                  </div>
                </div>
              </div>

            </div>

            {/* Save ATA PDF & OK triggers buttons */}
            <div className="flex gap-2 justify-end pt-3">
              <button
                onClick={handleSaveAta}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar & Finalizar ATA</span>
              </button>
              
              <button
                onClick={() => {
                  const demoAta: AtaCalibracao = {
                    ...(ataForm as AtaCalibracao),
                    clienteId: selectedCliente.id,
                    id: "demo-ata",
                  };
                  setActiveAtaPdf(demoAta);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Exportar ATA em PDF</span>
              </button>

              <button
                onClick={() => setView("client-detail")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ======================= OVERLAYS & DIALOGS MODALS ======================== */}

      {/* SEARCH/LUPA POPUP DIALOG FOR CLIENT'S SHEETS */}
      {isLupaOpen && selectedCliente && (
        <div className="fixed inset-0 z-[9995] bg-black/60 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl w-[560px] max-w-full max-h-[85vh] overflow-y-auto p-5 border border-slate-200 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Busca eSeleção do Cliente: {selectedCliente.clientName}</h3>
                <button onClick={() => setIsLupaOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-4 leading-normal">
                Marque e selecione fichas de calibração para download específico ou clique em editar.
              </p>

              <div className="space-y-2 max-h-[280px] overflow-y-auto mb-4 border rounded-xl p-2 bg-slate-50">
                {fichas.filter(f => f.clienteId === selectedCliente.id).length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">Nenhuma ficha criada ativa.</p>
                ) : (
                  fichas.filter(f => f.clienteId === selectedCliente.id).map(f => {
                    const isChecked = !!selectedSheetsIds[f.id];
                    return (
                      <div key={f.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-150 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSheetsIds({
                                ...selectedSheetsIds,
                                [f.id]: !isChecked
                              });
                            }}
                            className="p-0.5 rounded text-slate-500"
                          >
                            {isChecked ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="font-mono text-[10px] font-bold bg-slate-100 px-1 rounded block w-max">{f.codigoInstrumento}</span>
                            <span className="font-bold text-slate-800 block text-[11px]">{f.nomeInstrumento}</span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setActiveFichaIdForEdit(f.id);
                              setFichaForm(f);
                              setIsLupaOpen(false);
                              setView("new-ficha");
                            }}
                            className="bg-slate-50 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded border px-2 py-1"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-3.5">
              <button
                onClick={() => {
                  const count = Object.values(selectedSheetsIds).filter(Boolean).length;
                  if (count === 0) {
                     alert("Selecione pelo menos uma ficha para salvar!");
                     return;
                  }
                  alert(`Pronto! Foram exportados com sucesso em PDF os ${count} relatórios de calibração marcados.`);
                  setIsLupaOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition inline-flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Selecionadas ({Object.values(selectedSheetsIds).filter(Boolean).length})</span>
              </button>
              <button
                onClick={() => setIsLupaOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCALES SUBMODAL OVERLAY (Balança details screen) */}
      {scaleModalOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl w-[500px] max-w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="border-b pb-2.5 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>Parâmetros de Detalhamento da Balança</span>
              </h3>
              <button onClick={() => setScaleModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Divisão Nominal (d)</label>
                <input 
                  type="text" 
                  value={scaleDraft.divisao} 
                  onChange={e => setScaleDraft({ ...scaleDraft, divisao: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Verificação Nominal (e)</label>
                <input 
                  type="text" 
                  value={scaleDraft.verificacao} 
                  onChange={e => setScaleDraft({ ...scaleDraft, verificacao: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Carga Máxima Total</label>
                <input 
                  type="text" 
                  value={scaleDraft.cargaTotal} 
                  onChange={e => setScaleDraft({ ...scaleDraft, cargaTotal: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Unidade de Peso</label>
                <select
                  value={scaleDraft.unidade}
                  onChange={e => setScaleDraft({ ...scaleDraft, unidade: e.target.value as "g" | "kg" })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white text-xs"
                >
                  <option value="g">g (Grama)</option>
                  <option value="kg">kg (Quilograma)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Tipo de Balança</label>
                <select
                  value={scaleDraft.tipo}
                  onChange={e => setScaleDraft({ ...scaleDraft, tipo: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none text-xs text-slate-800"
                >
                  <option value="Balança eletrônica">Balança eletrônica</option>
                  <option value="eletromecânica">Balança eletromecânica</option>
                  <option value="mecânica">Balança mecânica</option>
                </select>
              </div>
            </div>

            {/* Conditionally reveal eccentricity position draft row with progressive multi-line addition up to 1-5 */}
            <div className="p-3 bg-indigo-50/60 rounded-xl space-y-2 border border-indigo-100">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-indigo-800 uppercase tracking-wide">Posições de Excentricidade Prato</span>
                {scaleDraft.posicoes.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddScalePosition}
                    className="bg-indigo-600 text-white rounded px-2 py-0.5 text-[9px] font-bold uppercase transition flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Próxima posição</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {scaleDraft.posicoes.map((pos, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-bold capitalize w-[85px]">{pos.label}:</span>
                    <input
                      type="text"
                      placeholder="Medida em excentricidade..."
                      value={pos.value}
                      onChange={e => {
                        const nextPos = [...scaleDraft.posicoes];
                        nextPos[idx].value = e.target.value;
                        setScaleDraft({ ...scaleDraft, posicoes: nextPos });
                      }}
                      className="flex-1 bg-white border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Maior Erro Estimado</label>
                <input 
                  type="text" 
                  value={scaleDraft.maiorErro} 
                  onChange={e => setScaleDraft({ ...scaleDraft, maiorErro: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Tipo de Prato de Balança</label>
                <select
                  value={scaleDraft.tipoPrato}
                  onChange={e => setScaleDraft({ ...scaleDraft, tipoPrato: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white text-xs"
                >
                  <option value="circular">Circular</option>
                  <option value="retangular">Retangular</option>
                  <option value="quadrado">Quadrado</option>
                  <option value="não foi possível realizar a excentricidade do prato">Não foi possível realizar excentricidade</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                onClick={handleSaveScale}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs"
              >
                Salvar Balança
              </button>
              <button
                onClick={() => {
                  triggerAlert("Excluir Dados de Balança", "Deseja apagar os dados deste ensaio de balança?", () => {
                    setScaleModalOpen(false);
                    setTargetRowForScale(null);
                  });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SEARCH LOOKUPS SHEET */}
      {lookupTargetField && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl w-[360px] max-w-full p-4 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[11px] font-bold uppercase text-slate-500">Filtrar Opções Rápidas</span>
              <button onClick={() => setLookupTargetField(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Digite para buscar..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white"
            />

            <div className="space-y-1 max-h-[180px] overflow-y-auto">
              {(lookups[lookupTargetField] || [])
                .filter(item => item.toLowerCase().includes(searchText.toLowerCase()))
                .map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (lookupTargetField === "unidadeMedida") {
                        setRowDraft({ ...rowDraft, unidadeMedida: item });
                      } else {
                        setFichaForm({ ...fichaForm, [lookupTargetField]: item });
                      }
                      setLookupTargetField(null);
                      setSearchText("");
                    }}
                    className="w-full text-left p-2.5 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    {item}
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION GLOBAL BOX */}
      {confirmDialog && confirmDialog.show && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-[380px] p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-505 leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="flex gap-2 justify-end border-t pt-3">
              <button
                onClick={confirmDialog.onConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm"
              >
                Confirmar e Deletar
              </button>
              <button
                onClick={() => setConfirmDialog(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-1.5 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKER tag PDF MODAL POPUP PREVIEW CARD */}
      {activeStickerPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-[420px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-print">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Tag className="w-4 text-amber-500 animate-pulse" />
                <span>Simulador de Etiqueta (Zebra 24mm)</span>
              </span>
              <button onClick={() => setActiveStickerPdf(null)} className="p-1 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sticker physical print dimensions simulation box */}
            <div className="printable-area printable-sticker border-[4px] border-slate-950 p-5 font-sans text-black space-y-3.5 bg-white max-w-[280px] mx-auto text-center relative select-all rounded-sm shadow-sm">
              {/* Title & Phone */}
              <div className="space-y-0.5">
                <h3 className="text-xl font-black tracking-tight text-black leading-none uppercase font-display">MSMI-Medição</h3>
                <p className="text-[15px] font-extrabold tracking-tight text-slate-900 font-mono">49 33280018</p>
              </div>

              {/* Solid horizontal line divider */}
              <div className="border-t-[3.5px] border-black my-1"></div>

              {/* Calibrado text & Date */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Calibrado</span>
                <span className="text-lg font-bold text-black font-mono">
                  {(() => {
                    if (!activeStickerPdf.data) return "N/D";
                    const [year, month, day] = activeStickerPdf.data.split("-");
                    return year && month && day ? `${day}/${month}/${year}` : activeStickerPdf.data;
                  })()}
                </span>
              </div>

              {/* Solid horizontal line divider */}
              <div className="border-t-[3.5px] border-black my-1"></div>

              {/* Válido até text & Expiry Date */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Válido até</span>
                <span className="text-lg font-black text-blue-700 font-mono">
                  {(() => {
                    try {
                      const d = new Date(activeStickerPdf.data || Date.now());
                      d.setDate(d.getDate() + (activeStickerPdf.frequencia || 365));
                      return d.toLocaleDateString("pt-BR");
                    } catch (e) {
                      return "N/D";
                    }
                  })()}
                </span>
              </div>

              {/* Solid horizontal line divider */}
              <div className="border-t-[3.5px] border-black my-1"></div>

              {/* Identificação label & Code */}
              <div className="space-y-0.5 pb-1">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Identificação</span>
                <span className="text-lg font-black text-black uppercase font-mono tracking-wider">
                  {activeStickerPdf.codigoInstrumento || "BOM-004"}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-450 text-center leading-normal">
              Esta etiqueta simula as proporções e layout da etiqueta fotodocumentada para impressão térmica de 24mm.
            </p>

            <div className="flex gap-2 justify-end border-t pt-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <Printer className="w-4 h-4" />
                <span>Salvar PDF / Imprimir</span>
              </button>
              <button
                onClick={() => setActiveStickerPdf(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRANCHETA CALIBRATION REPORT PDF MODAL (3X TRIPLICATES THE WRITING INSIDE VIEW) */}
      {activePranchetaPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-[720px] max-w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print">
            <div className="flex justify-between items-center border-b pb-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Certificado de Calibração Integrado (Simulação PDF)</span>
              </span>
              <button onClick={() => setActivePranchetaPdf(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Document sheet container box */}
            <div 
              id="printable-report-body"
              className="printable-area border border-slate-300 p-8 font-sans text-slate-900 bg-white shadow-inner leading-relaxed text-xs space-y-5 print:border-none print:p-0"
            >
              {/* Header brand */}
              <div className="flex items-center justify-between border-b pb-4 gap-4">
                <div className="text-left">
                  <h1 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide">LABORATÓRIO NACIONAL ASSOCIADO</h1>
                  <p className="text-[10px] text-slate-500">Padrões de Medição Rastreáveis e Qualificações Técnicas Industriais</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg border">PDF DOCUMENT RELATÓRIO</span>
                </div>
              </div>

              {/* Data values */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DADOS DO CLIENTE & RASTREABILIDADE</h4>
                  <p className="font-bold text-slate-800">{selectedCliente?.clientName}</p>
                  <p className="text-[11px] text-slate-500">OS N°: {selectedCliente?.os} | Cód. Cliente: {selectedCliente?.clientCode}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DISPOSITIVO ANALISADO</h4>
                  <p className="font-bold text-slate-800">{activePranchetaPdf.nomeInstrumento} ({activePranchetaPdf.codigoInstrumento})</p>
                  <p className="text-[11px] text-slate-550">Marca: {activePranchetaPdf.marca} | Mod: {activePranchetaPdf.modelo} | Temp: {activePranchetaPdf.temperatura}°C</p>
                </div>
              </div>

              {/* TRIPLICATED LEITURAS TABLE REPORT SHEET */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  PLANILHA DE ENSAIOS (As Leituras de Calibração Repetem-se 3x no Certificado conforme exigência)
                </h4>
                
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] font-sans">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-r">Linha/Tabela</th>
                        <th className="p-2 border-r">Menor Div.</th>
                        <th className="p-2 border-r text-center">Ponto Calib.</th>
                        <th className="p-2 border-r text-center bg-blue-50/50">Leitura 1</th>
                        <th className="p-2 border-r text-center bg-blue-50/50">Leitura 2</th>
                        <th className="p-2 border-r text-center bg-blue-50/50">Leitura 3</th>
                        <th className="p-2 text-center">Status final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-800">
                      {activePranchetaPdf.linhas && activePranchetaPdf.linhas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-3 text-center text-slate-400">Nenhum ensaio registrado.</td>
                        </tr>
                      ) : (
                        activePranchetaPdf.linhas?.map((linha, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 font-bold border-r text-slate-900">{linha.nomeTabela}</td>
                            <td className="p-2 border-r font-mono">{linha.menorDivisao} {linha.unidadeMedida}</td>
                            <td className="p-2 border-r text-center font-bold text-blue-700">{linha.pontoCalibracao}</td>
                            
                            {/* Leitura de calibração is repeated 3 times side-by-side as requested */}
                            <td className="p-2 border-r text-center bg-blue-50/20 font-bold text-slate-800">{linha.leituraCalibracao}</td>
                            <td className="p-2 border-r text-center bg-blue-50/20 font-bold text-slate-800">{linha.leituraCalibracao}</td>
                            <td className="p-2 border-r text-center bg-blue-50/20 font-bold text-slate-800">{linha.leituraCalibracao}</td>
                            
                            <td className="p-2 text-center">
                              <span className="text-emerald-700 font-bold uppercase font-mono text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {linha.observacao || "APROVADO"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scales specifics included optionally */}
              {activePranchetaPdf.linhas?.some(l => !!l.balancaInfo) && (
                <div className="space-y-1.5 border border-purple-200 bg-purple-50/25 p-3.5 rounded-xl">
                  <h4 className="text-[10px] font-bold text-purple-700 uppercase tracking-widest font-sans">
                    DETALHES DA EXCENTRICIDADE DO PRATO (BALANÇA)
                  </h4>
                  {activePranchetaPdf.linhas.map((l, i) => {
                    if (!l.balancaInfo) return null;
                    return (
                      <div key={i} className="text-[11px] grid grid-cols-2 md:grid-cols-3 gap-3 border-b border-purple-100 last:border-none pb-2 last:pb-0">
                        <div>
                          <span className="text-slate-500 font-bold uppercase block text-[8px]">Tabela:</span>
                          <span className="font-semibold text-slate-800">{l.nomeTabela}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase block text-[8px]">Modelo & Tipo de Prato:</span>
                          <span className="font-bold text-slate-800 capitalize">{l.balancaInfo.tipoPrato}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase block text-[8px]">Erro e Carga Máxima:</span>
                          <span className="font-mono text-purple-800">Carga {l.balancaInfo.cargaTotal}{l.balancaInfo.unidade} | Maior Erro: {l.balancaInfo.maiorErro}</span>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <span className="text-slate-450 font-bold uppercase text-[8px] block mb-1">Medições de Descentramento:</span>
                          <div className="flex gap-2">
                            {l.balancaInfo.posicoes.map((pos, pidx) => (
                              <span key={pidx} className="bg-white border rounded px-1.5 py-0.5 font-mono text-xs">
                                <strong>{pos.label}:</strong> {pos.value || "0.0"}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legal info */}
              <div className="border-t pt-4 text-[9px] text-slate-400 space-y-1 leading-normal">
                <p><strong>Observações Legais:</strong> Este documento atesta a calibração com padrões secundários comparativos rastreáveis aos padrões primários internacionais.</p>
                <p>Impedida reprodução sem prévia outorga formal do laboratório nacional.</p>
              </div>

            </div>

            <div className="flex gap-2 justify-end border-t pt-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Salvar PDF / Imprimir</span>
              </button>
              <button
                onClick={() => setActivePranchetaPdf(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Retornar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATA PREVIEW MODAL */}
      {activeAtaPdf && selectedCliente && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-[720px] max-w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print">
            <div className="flex justify-between items-center border-b pb-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Visualizar ATA de Serviço Concluído (PDF)</span>
              </span>
              <button onClick={() => setActiveAtaPdf(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Print container for ATA */}
            <div className="printable-area border border-slate-300 p-8 font-sans text-slate-900 bg-white shadow-inner leading-relaxed text-xs space-y-5 print:border-none print:p-0">
              <div className="text-center border-b pb-4">
                <h1 className="text-sm font-extrabold text-slate-950 uppercase tracking-widest">ATA DE PRESTAÇÃO DE SERVIÇOS & CALIBRAÇÃO</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Controle de Calibração Industrial Independente</p>
              </div>

              {/* Head stats */}
              <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <p><strong>Tomador:</strong> {selectedCliente.clientName}</p>
                  <p><strong>Cód. Cliente:</strong> {selectedCliente.clientCode}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong>Data de Ocorrência:</strong> {activeAtaPdf.data}</p>
                  <p><strong>O.S Ref:</strong> {selectedCliente.os}</p>
                </div>
              </div>

              {/* Declared sentences list */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">DECLARAÇÕES & ESCOPO EXECUTADO</h4>
                {activeAtaPdf.frases && activeAtaPdf.frases.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-800">
                    {activeAtaPdf.frases.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">Nenhum escopo de frase marcado.</p>
                )}
              </div>

              {/* Detailed preventive details */}
              {activeAtaPdf.preventivaEquips && activeAtaPdf.preventivaEquips.length > 0 && (
                <div className="space-y-1 border-l-2 border-blue-500 pl-3 py-1 bg-blue-50/20">
                  <h5 className="font-bold text-blue-700 uppercase text-[9px] tracking-wide">Itens em Manutenção Preventiva</h5>
                  <p className="font-semibold text-[11px] text-slate-700">Equipamentos: {activeAtaPdf.preventivaEquips.join(", ")}</p>
                  <p className="italic text-slate-600 mt-1">{activeAtaPdf.preventivaTexto}</p>
                </div>
              )}

              {/* Detailed corrective details */}
              {activeAtaPdf.manutencaoEquips && activeAtaPdf.manutencaoEquips.length > 0 && (
                <div className="space-y-1 border-l-2 border-teal-500 pl-3 py-1 bg-teal-50/20">
                  <h5 className="font-bold text-teal-700 uppercase text-[9px] tracking-wide">Itens em Manutenção Corretiva</h5>
                  <p className="font-semibold text-[11px] text-slate-700">Equipamentos: {activeAtaPdf.manutencaoEquips.join(", ")}</p>
                  <p className="italic text-slate-600 mt-1">{activeAtaPdf.manutencaoTexto}</p>
                </div>
              )}

              {/* Auto compiled summary items */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">EQUIPAMENTOS CONCORDANTES EM FICHA</h4>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-[9px] uppercase">
                      <tr>
                        <th className="p-2">Quantidade</th>
                        <th className="p-2">Nome Dispositivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {getFichasSummary(selectedCliente.id).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-slate-600">{item.qty}x</td>
                          <td className="p-2 font-bold">{item.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Executed Signs Rendered */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t">
                
                {/* Técnico Executor */}
                <div className="text-center space-y-2">
                  <div className="border-b border-slate-350 pb-2 flex flex-col items-center justify-center min-h-[90px]">
                    {activeAtaPdf.tecnicoAssinatura ? (
                      <img src={activeAtaPdf.tecnicoAssinatura} alt="Assinatura Tecnico" className="max-h-[80px] max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem assinatura digital</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 uppercase text-[11px]">{activeAtaPdf.tecnicoNome || "Nome do Técnico"}</p>
                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Técnico Executor</span>
                </div>

                {/* Cliente Responsável */}
                <div className="text-center space-y-2">
                  <div className="border-b border-slate-350 pb-2 flex flex-col items-center justify-center min-h-[90px]">
                    {activeAtaPdf.responsavelAssinatura ? (
                      <img src={activeAtaPdf.responsavelAssinatura} alt="Assinatura Responsavel" className="max-h-[80px] max-w-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem assinatura digital</span>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 uppercase text-[11px]">{activeAtaPdf.responsavelNome || "Supervisor do Cliente"}</p>
                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Funcionário Responsável</span>
                </div>

              </div>

            </div>

            <div className="flex gap-2 justify-end border-t pt-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Emitir PDF / Imprimir ATA</span>
              </button>
              <button
                onClick={() => setActiveAtaPdf(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
              >
                Retornar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
