import React, { useState, useEffect } from "react";
import { 
  Calendar, Search, Trash2, Plus, Check, Edit3, 
  FileText, Download, Save, ArrowLeft, X, CheckSquare, Square, Printer, Calculator
} from "lucide-react";

// Types
export interface RefeicaoItem {
  tipo: "Café" | "Almoço" | "Janta" | "Diversos";
  descricaoDiversos?: string;
  valor: string;
}

export interface DespesaLinha {
  id: string;
  dataSaida: string;
  cidadeSaida: string;
  dataChegada: string;
  cidadeChegada: string;
  refeicoes: RefeicaoItem[];
  diaria: string;
  kmRodado: string;
  observacao: string;
}

export interface RotaDespesa {
  id: string;
  funcionario: string;
  dataCriacao: string;
  valorKm: string; // multiplier
  linhas: DespesaLinha[];
  createdAt: string;
  totalGeral: number;
}

interface Props {
  onClose?: () => void;
}

export default function DespesasApp({ onClose }: Props) {
  // Navigation: "list" | "new-route"
  const [view, setView] = useState<"list" | "new-route">("list");

  // Persistence Key
  const [rotas, setRotas] = useState<RotaDespesa[]>(() => {
    const saved = localStorage.getItem("travel_rotas");
    return saved ? JSON.parse(saved) : [];
  });

  // Selected for edits
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  // Sync state
  useEffect(() => {
    localStorage.setItem("travel_rotas", JSON.stringify(rotas));
  }, [rotas]);

  // Route Form State
  const [routeHeader, setRouteHeader] = useState({
    funcionario: "",
    dataCriacao: new Date().toISOString().split("T")[0],
    valorKm: "1.50"
  });

  const [linhas, setLinhas] = useState<DespesaLinha[]>([]);
  
  // High-level row item inline draft
  const [rowDraft, setRowDraft] = useState<Partial<DespesaLinha>>({
    dataSaida: new Date().toISOString().split("T")[0],
    cidadeSaida: "",
    dataChegada: new Date().toISOString().split("T")[0],
    cidadeChegada: "",
    refeicoes: [],
    diaria: "0.00",
    kmRodado: "0",
    observacao: ""
  });
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Meal types sub-forms
  const mealCategories = ["Café", "Almoço", "Janta", "Diversos"] as const;
  
  // Custom Meal Addition draft
  const [mealDraftCategory, setMealDraftCategory] = useState<"Café" | "Almoço" | "Janta" | "Diversos">("Almoço");
  const [mealDraftValue, setMealDraftValue] = useState("15.00");
  const [mealDraftDesc, setMealDraftDesc] = useState("");

  // Print/PDF View modal
  const [activePrinterPdf, setActivePrinterPdf] = useState<RotaDespesa | null>(null);

  // Confirm delete dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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

  // Add individual meal in selected row item
  const handleAddMealToDraft = () => {
    if (!mealDraftValue || parseFloat(mealDraftValue) <= 0) {
      alert("Por favor insira um valor válido de refeição");
      return;
    }
    const currentMeals = [...(rowDraft.refeicoes || [])];
    currentMeals.push({
      tipo: mealDraftCategory,
      valor: mealDraftValue,
      descricaoDiversos: mealDraftCategory === "Diversos" ? mealDraftDesc : undefined
    });
    setRowDraft({
      ...rowDraft,
      refeicoes: currentMeals
    });
    // reset meal forms
    setMealDraftValue("");
    setMealDraftDesc("");
  };

  const handleRemoveMealFromDraft = (idx: number) => {
    const currentMeals = [...(rowDraft.refeicoes || [])];
    currentMeals.splice(idx, 1);
    setRowDraft({ ...rowDraft, refeicoes: currentMeals });
  };

  // Total math logic
  const calculateRowTotal = (row: Partial<DespesaLinha>, multiplier: string) => {
    const mealSum = (row.refeicoes || []).reduce((acc, m) => acc + parseFloat(m.valor || "0"), 0);
    const diariaVal = parseFloat(row.diaria || "0");
    const kmVal = parseFloat(row.kmRodado || "0");
    const multVal = parseFloat(multiplier || "0");
    return mealSum + diariaVal + (kmVal * multVal);
  };

  // Core row interactions
  const handleSaveRow = () => {
    if (!rowDraft.cidadeSaida?.trim() || !rowDraft.cidadeChegada?.trim()) {
      alert("Digite as cidades de saída e chegada!");
      return;
    }

    if (editingRowId) {
      setLinhas(linhas.map(l => l.id === editingRowId ? { ...(rowDraft as DespesaLinha), id: editingRowId } : l));
      setEditingRowId(null);
    } else {
      const newLine: DespesaLinha = {
        ...(rowDraft as DespesaLinha),
        id: "dl-" + Date.now()
      };
      setLinhas([...linhas, newLine]);
    }

    // reset row draft
    setRowDraft({
      dataSaida: new Date().toISOString().split("T")[0],
      cidadeSaida: "",
      dataChegada: new Date().toISOString().split("T")[0],
      cidadeChegada: "",
      refeicoes: [],
      diaria: "0.00",
      kmRodado: "0",
      observacao: ""
    });
  };

  const startEditRow = (row: DespesaLinha) => {
    setRowDraft(row);
    setEditingRowId(row.id);
  };

  const deleteRow = (id: string) => {
    triggerAlert("Apagar Trecho", "Deseja realmente apagar esta rota/trecho do histórico?", () => {
      setLinhas(linhas.filter(l => l.id !== id));
    });
  };

  const spawnBlankRowUnderneath = () => {
    const newLin: DespesaLinha = {
      id: "dl-" + Date.now(),
      dataSaida: new Date().toISOString().split("T")[0],
      cidadeSaida: "",
      dataChegada: new Date().toISOString().split("T")[0],
      cidadeChegada: "",
      refeicoes: [],
      diaria: "0.00",
      kmRodado: "0",
      observacao: ""
    };
    setLinhas([...linhas, newLin]);
    startEditRow(newLin);
  };

  // Complete Route commit
  const handleSaveEntireRoute = () => {
    if (!routeHeader.funcionario.trim()) {
      alert("Por favor, preencha o Nome do Funcionário!");
      return;
    }
    if (linhas.length === 0) {
      alert("Adicione pelo menos um trecho (+ lista) para salvar!");
      return;
    }

    const totalCalculated = linhas.reduce((acc, l) => acc + calculateRowTotal(l, routeHeader.valorKm), 0);

    const finalRoute: RotaDespesa = {
      id: activeRouteId || "rt-" + Date.now(),
      funcionario: routeHeader.funcionario,
      dataCriacao: routeHeader.dataCriacao,
      valorKm: routeHeader.valorKm,
      linhas: linhas,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      totalGeral: totalCalculated
    };

    if (activeRouteId) {
      setRotas(rotas.map(r => r.id === activeRouteId ? finalRoute : r));
    } else {
      setRotas([...rotas, finalRoute]);
    }

    setView("list");
    setActiveRouteId(null);
    setLinhas([]);
    setRouteHeader({
      funcionario: "",
      dataCriacao: new Date().toISOString().split("T")[0],
      valorKm: "1.50"
    });
  };

  const handleEditRouteInForm = (route: RotaDespesa) => {
    setActiveRouteId(route.id);
    setRouteHeader({
      funcionario: route.funcionario,
      dataCriacao: route.dataCriacao,
      valorKm: route.valorKm
    });
    setLinhas(route.linhas);
    setView("new-route");
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 text-slate-800 font-sans select-none overflow-hidden h-full">
      
      {/* Top Application Ribbon */}
      <div className="h-10 border-b border-slate-200 bg-white px-4 flex items-center justify-between shadow-xs shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (view === "new-route") {
                setView("list");
                setLinhas([]);
                setActiveRouteId(null);
              }
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
            {view === "list" && "Despesa de Deslocamento e Viagem"}
            {view === "new-route" && (activeRouteId ? "Editar Rota de Deslocamento" : "Nova Rota de Deslocamento")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {view === "new-route" && (
            <button
              onClick={handleSaveEntireRoute}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg text-white text-xs font-semibold shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </button>
          )}
        </div>
      </div>

      {/* Body section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 relative min-h-0">
        
        {/* TRAVEL LOG HISTORY SCREEN */}
        {view === "list" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h1 className="text-base font-bold text-slate-800">Controle de Reembolso de Viagens</h1>
                <p className="text-[11px] text-slate-500">Acompanhamento de diárias, alimentação e quilometragem rodada.</p>
              </div>
              <button
                onClick={() => {
                  setActiveRouteId(null);
                  setLinhas([]);
                  setRouteHeader({
                    funcionario: "",
                    dataCriacao: new Date().toISOString().split("T")[0],
                    valorKm: "1.50"
                  });
                  setView("new-route");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Rota</span>
              </button>
            </div>

            {rotas.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <Calculator className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-500">Nenhum histórico de viagem cadastrado</p>
                <p className="text-xs text-slate-400 mt-1">Insira uma rota e registre seus trechos de deslocamento para reembolso de kms.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {rotas.map(r => (
                  <div 
                    key={r.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          reembolso
                        </span>
                        <span className="text-xs text-slate-400">Criado em: {r.createdAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">{r.funcionario}</h3>
                      <div className="flex gap-4 text-[11px] text-slate-550">
                        <span>Trechos/Listas: {r.linhas ? r.linhas.length : 0} registradas</span>
                        <span>Preço p/ Km: R$ {r.valorKm}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Price Total */}
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Calculado</span>
                        <span className="text-sm font-black text-emerald-600">R$ {r.totalGeral.toFixed(2)}</span>
                      </div>

                      {/* History log Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          title="Editar Trecho"
                          onClick={() => handleEditRouteInForm(r)}
                          className="bg-slate-50 hover:bg-slate-100 border p-1 rounded-md text-slate-600 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Imprimir / Exportar PDF"
                          onClick={() => setActivePrinterPdf(r)}
                          className="bg-slate-50 hover:bg-slate-100 border p-1 rounded-md text-blue-600 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Apagar Trecho"
                          onClick={() => {
                            triggerAlert("Excluir Viagem", "Tem certeza que deseja remover esta viagem e suas despesas?", () => {
                              setRotas(rotas.filter(x => x.id !== r.id));
                            });
                          }}
                          className="bg-slate-50 hover:bg-rose-50 border border-slate-150 p-1 rounded-md text-rose-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: NEW ROUTE SHEET */}
        {view === "new-route" && (
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            
            {/* Header parameters */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Dados Principais da Rota de Viagem</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome do Funcionário</label>
                  <input 
                    type="text"
                    value={routeHeader.funcionario}
                    onChange={e => setRouteHeader({ ...routeHeader, funcionario: e.target.value })}
                    placeholder="Ex: João da Silva Reis"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data de Criação</label>
                  <input 
                    type="date"
                    value={routeHeader.dataCriacao}
                    onChange={e => setRouteHeader({ ...routeHeader, dataCriacao: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Valor Unitário do KM Rodado (Multiplicador)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 text-xs font-semibold">R$</span>
                    <input 
                      type="text"
                      value={routeHeader.valorKm}
                      onChange={e => setRouteHeader({ ...routeHeader, valorKm: e.target.value })}
                      placeholder="1.50"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* List entries Table */}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Trechos Realizados (+ lista)</h3>
                <button
                  type="button"
                  onClick={() => {
                    // Instantly trigger add a blank row dynamically
                    const newLine: DespesaLinha = {
                      id: "dl-" + Date.now(),
                      dataSaida: new Date().toISOString().split("T")[0],
                      cidadeSaida: "",
                      dataChegada: new Date().toISOString().split("T")[0],
                      cidadeChegada: "",
                      refeicoes: [],
                      diaria: "0.00",
                      kmRodado: "0",
                      observacao: ""
                    };
                    setLinhas([...linhas, newLine]);
                    startEditRow(newLine);
                  }}
                  className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ lista (Adicionar Trecho)</span>
                </button>
              </div>

              {/* Editable table representation of routes */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-slate-800 text-[11px] leading-normal text-left min-w-[950px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="py-2.5 px-3">Saída (Data/Cidade)</th>
                      <th className="py-2.5 px-3">Chegada (Data/Cidade)</th>
                      <th className="py-2.5 px-3 w-[220px]">Refeições Registradas</th>
                      <th className="py-2.5 px-2 w-[85px]">Diária R$</th>
                      <th className="py-2.5 px-2 w-[100px]">Kms Rodados</th>
                      <th className="py-2.5 px-3">Observações</th>
                      <th className="py-2.5 px-2 text-right">Total Trecho</th>
                      <th className="py-2.5 px-3 text-right w-[110px]">Operações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {linhas.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <span className="text-[10px] text-slate-400 block font-mono">{l.dataSaida}</span>
                          <span className="font-bold text-slate-800">{l.cidadeSaida}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] text-slate-400 block font-mono">{l.dataChegada}</span>
                          <span className="font-bold text-slate-800">{l.cidadeChegada}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {l.refeicoes && l.refeicoes.length === 0 ? (
                              <span className="text-slate-400 italic">Sem refeições</span>
                            ) : (
                              l.refeicoes?.map((m, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono text-[9px] border inline-block">
                                  {m.tipo === "Diversos" ? m.descricaoDiversos : m.tipo}: R$ {m.valor}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono">R$ {parseFloat(l.diaria || "0").toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span className="font-bold font-mono text-slate-700">{l.kmRodado} km</span>
                          <span className="text-[9.5px] text-emerald-600 block font-mono">
                            R$ {(parseFloat(l.kmRodado || "0") * parseFloat(routeHeader.valorKm || "1.50")).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-normal truncate max-w-[140px]" title={l.observacao}>
                          {l.observacao || "-"}
                        </td>
                        
                        <td className="py-3 px-2 text-right font-black text-emerald-600 font-mono text-xs">
                          R$ {calculateRowTotal(l, routeHeader.valorKm).toFixed(2)}
                        </td>

                        {/* Operations icons for lists row: edit, delete, + duplication */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex gap-1 justify-end items-center">
                            
                            {/* Pencil */}
                            <button
                              type="button"
                              onClick={() => startEditRow(l)}
                              className="p-1 bg-amber-50 text-amber-700 border border-amber-100 rounded hover:bg-amber-100 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => deleteRow(l.id)}
                              className="p-1 bg-rose-50 text-rose-500 border border-rose-100 rounded hover:bg-rose-100 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Plus spawn */}
                            <button
                              type="button"
                              onClick={spawnBlankRowUnderneath}
                              className="p-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Inline active editing form row widget */}
                    <tr className="bg-indigo-50/50 border border-indigo-200">
                      <td className="py-3 px-1.5 space-y-1">
                        <input
                          type="date"
                          value={rowDraft.dataSaida}
                          onChange={e => setRowDraft({ ...rowDraft, dataSaida: e.target.value })}
                          className="w-full bg-white border rounded p-1 text-[10px]"
                        />
                        <input
                          type="text"
                          placeholder="Cidade Saída..."
                          value={rowDraft.cidadeSaida}
                          onChange={e => setRowDraft({ ...rowDraft, cidadeSaida: e.target.value })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[11px]"
                        />
                      </td>

                      <td className="py-3 px-1.5 space-y-1">
                        <input
                          type="date"
                          value={rowDraft.dataChegada}
                          onChange={e => setRowDraft({ ...rowDraft, dataChegada: e.target.value })}
                          className="w-full bg-white border rounded p-1 text-[10px]"
                        />
                        <input
                          type="text"
                          placeholder="Cidade Chegada..."
                          value={rowDraft.cidadeChegada}
                          onChange={e => setRowDraft({ ...rowDraft, cidadeChegada: e.target.value })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[11px]"
                        />
                      </td>

                      {/* Meals insertion inside RowDraft */}
                      <td className="py-3 px-1.5 space-y-1.5">
                        <div className="space-y-1 border rounded bg-white p-1.5">
                          <div className="flex gap-1">
                            <select
                              value={mealDraftCategory}
                              onChange={e => setMealDraftCategory(e.target.value as any)}
                              className="bg-slate-100 border text-[10px] rounded px-1 py-0.5"
                            >
                              {mealCategories.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Valor R$..."
                              value={mealDraftValue}
                              onChange={e => setMealDraftValue(e.target.value)}
                              className="bg-transparent border-b w-14 font-mono text-[10px] pl-1 focus:outline-none"
                            />

                            <button
                              type="button"
                              onClick={handleAddMealToDraft}
                              className="bg-indigo-600 text-white rounded px-1 text-[10px] font-bold"
                            >
                              +
                            </button>
                          </div>

                          {mealDraftCategory === "Diversos" && (
                            <input
                              type="text"
                              placeholder="Descrição diversos..."
                              value={mealDraftDesc}
                              onChange={e => setMealDraftDesc(e.target.value)}
                              className="w-full bg-slate-50 border rounded p-1 text-[10px]"
                            />
                          )}

                          <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto pt-1">
                            {(rowDraft.refeicoes || []).map((m, idx) => (
                              <span key={idx} className="bg-indigo-50 border text-indigo-700 px-1 py-0.5 rounded text-[9px] flex items-center gap-1 font-mono">
                                <span>{m.tipo === "Diversos" ? m.descricaoDiversos : m.tipo}: {m.valor}</span>
                                <button type="button" onClick={() => handleRemoveMealFromDraft(idx)} className="text-red-500 font-bold hover:text-red-700">x</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-1">
                        <input
                          type="text"
                          value={rowDraft.diaria}
                          onChange={e => setRowDraft({ ...rowDraft, diaria: e.target.value })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[11px] font-mono text-center"
                        />
                      </td>

                      <td className="py-3 px-1">
                        <input
                          type="text"
                          value={rowDraft.kmRodado}
                          onChange={e => setRowDraft({ ...rowDraft, kmRodado: e.target.value })}
                          className="w-full bg-white border rounded px-1.5 py-1 text-[11px] font-bold text-center text-slate-800"
                        />
                      </td>

                      <td className="py-3 px-1">
                        <textarea
                          placeholder="Observação livre..."
                          value={rowDraft.observacao}
                          onChange={e => setRowDraft({ ...rowDraft, observacao: e.target.value })}
                          className="w-full bg-white border rounded p-1 text-[11px] h-10 resize-none font-normal"
                        />
                      </td>

                      <td className="py-3 px-1 text-right font-extrabold text-indigo-700">
                        {/* Instant preview computed total for speed */}
                        R$ {calculateRowTotal(rowDraft, routeHeader.valorKm).toFixed(2)}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <button
                          type="button"
                          onClick={handleSaveRow}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2.5 py-1 font-bold text-[10px] uppercase shadow-xs inline-block transition"
                        >
                          Confirmar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total math display and end navigation triggers */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100 p-4 rounded-xl border">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block font-bold">Total Geral Reembolso</span>
                <span className="text-base font-extrabold text-slate-800 font-mono">
                  R$ {linhas.reduce((acc, l) => acc + calculateRowTotal(l, routeHeader.valorKm), 0).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveEntireRoute}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition inline-flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Rota (OK)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const demoRoute: RotaDespesa = {
                      id: "demo-pdf",
                      funcionario: routeHeader.funcionario || "Funcionário Teste",
                      dataCriacao: routeHeader.dataCriacao,
                      valorKm: routeHeader.valorKm,
                      linhas: linhas,
                      createdAt: new Date().toLocaleDateString("pt-BR"),
                      totalGeral: linhas.reduce((acc, l) => acc + calculateRowTotal(l, routeHeader.valorKm), 0)
                    };
                    setActivePrinterPdf(demoRoute);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition inline-flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Salvar em PDF</span>
                </button>
                <button
                  onClick={() => setView("list")}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition"
                >
                  Cancelar Rota
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ==================== SCREEN OVERLAYS FOR PRINT PREVIEWS ===================== */}

      {/* CONFIRMATION DIALOG POPUP */}
      {confirmDialog && confirmDialog.show && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-[380px] p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{confirmDialog.message}</p>
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

      {/* DETAILED PRINT REIMBURSEMENT STATEMENT TABLE PDF */}
      {activePrinterPdf && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-[780px] max-w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-print">
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Simulador de Despesas de Deslocamento Consolidado (Reembolso Viagem PDF)</span>
              </span>
              <button onClick={() => setActivePrinterPdf(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sheet contents */}
            <div className="printable-area border border-slate-300 p-8 font-sans text-slate-900 bg-white shadow-inner leading-relaxed text-xs space-y-5 print:border-none print:p-0">
              <div className="text-center border-b pb-4">
                <h1 className="text-sm font-extrabold uppercase tracking-widest text-[#1c1c1e]">RELATÓRIO CONSOLIDADO DE REEMBOLSONAS DE VIAGEM</h1>
                <p className="text-[10px] text-slate-450 mt-1 uppercase">Folha de Prestação de Contas Individuais de Km e Alimentação</p>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <p><strong>Nome Funcionário:</strong> {activePrinterPdf.funcionario}</p>
                  <p><strong>Custo Km Pactuado:</strong> R$ {activePrinterPdf.valorKm} por quilometro</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p><strong>Data Fechamento:</strong> {activePrinterPdf.dataCriacao}</p>
                  <p><strong>Registro Viagem ID:</strong> {activePrinterPdf.id}</p>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans mb-1">DETALHES DA DIRETRIZ DE DESLOCAMENTOS</h4>
                
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] font-sans">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[9.5px] uppercase">
                      <tr>
                        <th className="p-2 border-r">Roteiro Saída</th>
                        <th className="p-2 border-r">Roteiro Chegada</th>
                        <th className="p-2 border-r">Refeições</th>
                        <th className="p-2 border-r text-center font-bold">Diária</th>
                        <th className="p-2 border-r text-center font-bold">km rodado</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-800 bg-white">
                      {activePrinterPdf.linhas && activePrinterPdf.linhas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-3 text-center text-slate-400">Nenhum trecho registrado nesta rota.</td>
                        </tr>
                      ) : (
                        activePrinterPdf.linhas?.map((l, idx) => {
                          const sub = calculateRowTotal(l, activePrinterPdf.valorKm);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="p-2 border-r font-medium text-slate-900">
                                <span className="text-[8.5px] text-slate-400 block font-mono">{l.dataSaida}</span>
                                {l.cidadeSaida}
                              </td>
                              <td className="p-2 border-r font-medium text-slate-900">
                                <span className="text-[8.5px] text-slate-400 block font-mono">{l.dataChegada}</span>
                                {l.cidadeChegada}
                              </td>
                              <td className="p-2 border-r">
                                <div className="flex flex-wrap gap-1 leading-normal max-w-[170px]">
                                  {(l.refeicoes || []).map((m, midx) => (
                                    <span key={midx} className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[8.5px] font-mono inline-block">
                                      {m.tipo === "Diversos" ? m.descricaoDiversos : m.tipo}: {m.valor}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-2 border-r text-center font-mono">R$ {parseFloat(l.diaria || "0").toFixed(2)}</td>
                              <td className="p-2 border-r text-center font-mono">{l.kmRodado} km</td>
                              <td className="p-2 text-right font-black text-emerald-600 font-mono">R$ {sub.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center bg-slate-50 p-4 border rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Sumário Reembolso Executado</span>
                  <span className="text-xs text-slate-600">Revisado e validado conforme regras internas</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Devido e Homologado</span>
                  <span className="text-base font-black text-emerald-700 font-mono">R$ {activePrinterPdf.totalGeral.toFixed(2)}</span>
                </div>
              </div>

              {/* Signature Approval rows */}
              <div className="grid grid-cols-2 gap-8 pt-10 border-t">
                <div className="text-center space-y-1">
                  <div className="border-b border-dashed border-slate-400 h-[50px] flex items-end justify-center">
                    <span className="text-[10px] text-slate-400 font-mono italic">{activePrinterPdf.funcionario}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Assinatura do Funcionário Beneficiador</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-dashed border-slate-400 h-[50px] flex items-end justify-center">
                    <span className="text-[10px] font-mono text-slate-400 italic">Depto Financeiro Homologado</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Aprovação de Gestão Interna</span>
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
                <span>Imprimir Reembolso / PDF</span>
              </button>
              <button
                onClick={() => setActivePrinterPdf(null)}
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
