import React, { useState } from "react";
import { 
  Cpu, Database, Sparkles, AlertTriangle, ShieldCheck, 
  Activity, Star, Globe, RefreshCw, Trash2, Download, 
  CheckCircle, Plus, Eye, Play, Info, Flame, WifiOff, ListOrdered, Share2, HelpCircle,
  Sliders, Sun, Moon, Wind, Compass, MapPin, Radio
} from "lucide-react";
import { Persona, UserProfile, Message, TelemetryData } from "../types";
import { SYSTEM_ARCHITECTURE, DATA_FLOW_STAGES, ERROR_SCENARIOS, TARGET_METRICS } from "../data";

interface DashboardProps {
  userProfile: UserProfile;
  activePersona: Persona;
  onChangePersona: (id: string) => void;
  personas: Persona[];
  messages: Message[];
  currentCallState: "idle" | "listening" | "thinking" | "speaking";
  activeTab: string;
  onChangeTab: (tab: "architecture" | "dataflow" | "pipeline" | "memory" | "errors" | "performance") => void;
  lastAnalysis: {
    intent: string;
    emotion: string;
    intensity: number;
    normalizedText: string;
    factsExtractedCount: number;
    latencyMs: number;
  };
  onUpdateProfile: (profile: UserProfile) => void;
  onSimulateError: (scenarioId: string) => void;
  simulatedError: string | null;
  onClearSimulatedError: () => void;
  telemetry: TelemetryData;
  setTelemetry?: React.Dispatch<React.SetStateAction<TelemetryData>>;
}

export default function Dashboard({
  userProfile,
  activePersona,
  onChangePersona,
  personas,
  messages,
  currentCallState,
  activeTab,
  onChangeTab,
  lastAnalysis,
  onUpdateProfile,
  onSimulateError,
  simulatedError,
  onClearSimulatedError,
  telemetry,
  setTelemetry
}: DashboardProps) {
  
  // Local states for custom manual facts and feature voting
  const [newManualFact, setNewManualFact] = useState("");
  const [newManualInterest, setNewManualInterest] = useState("");
  const [votedFeatures, setVotedFeatures] = useState<Record<string, number>>({
    group: 45,
    images: 19,
    dialects: 128,
    bots: 16,
    passive: 9,
    summary: 32
  });

  const handleVote = (featureKey: string) => {
    setVotedFeatures(prev => ({
      ...prev,
      [featureKey]: prev[featureKey] + 1
    }));
  };

  const handleAddManualFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualFact.trim()) return;
    const updatedFacts = [
      ...userProfile.known_facts,
      {
        fact: newManualFact.trim(),
        timestamp: new Date().toISOString(),
        type: "manual_entry"
      }
    ];
    onUpdateProfile({
      ...userProfile,
      known_facts: updatedFacts
    });
    setNewManualFact("");
  };

  const handleAddManualInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualInterest.trim()) return;
    const updatedInterests = [...userProfile.interests, newManualInterest.trim()];
    onUpdateProfile({
      ...userProfile,
      interests: updatedInterests,
      total_conversations: userProfile.total_conversations + 1
    });
    setNewManualInterest("");
  };

  const handleRemoveInterest = (indexToRemove: number) => {
    const updatedInterests = userProfile.interests.filter((_, idx) => idx !== indexToRemove);
    onUpdateProfile({
      ...userProfile,
      interests: updatedInterests
    });
  };

  const handleRemoveFact = (indexToRemove: number) => {
    const updatedFacts = userProfile.known_facts.filter((_, idx) => idx !== indexToRemove);
    onUpdateProfile({
      ...userProfile,
      known_facts: updatedFacts
    });
  };

  const handleClearAllMemory = () => {
    if (confirm("هل أنت متأكد من رغبتك في تهيئة الذاكرة وحذف كافة الحقائق والبيانات الشخصية المسجلة؟")) {
      onUpdateProfile({
        ...userProfile,
        known_facts: [],
        interests: [],
        total_conversations: 0,
        mood_history: []
      });
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `human-voice-ai-profile-${userProfile.userId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Determine active step of Data Flow based on phone call status
  const getActiveFlowStep = () => {
    if (currentCallState === "idle") return null;
    if (currentCallState === "listening") return 3; // Speech to text translation step
    if (currentCallState === "thinking") return 6; // Gemini processing response
    if (currentCallState === "speaking") return 9; // Text to Speech playback
    return null;
  };

  // Safe handler to update live telemetry sensors in parent state
  const updateSensors = (updater: (prev: TelemetryData) => Partial<TelemetryData>) => {
    if (setTelemetry) {
      setTelemetry((prev) => {
        const update = updater(prev);
        
        // Accumulate steps if moving
        let nextStepInfo = { ...prev.fusion };
        if (update.fusion) {
          nextStepInfo = { ...nextStepInfo, ...update.fusion };
        }

        return {
          ...prev,
          ...update,
          fusion: nextStepInfo
        } as TelemetryData;
      });
    }
  };

  // Pre-configured physical scenarios for quick clicks
  const triggerScenario = (scenario: "stationary" | "walk" | "run" | "car" | "shake" | "fall") => {
    if (!setTelemetry) return;

    let movement_state: "idle" | "walking" | "running" | "driving" | "falling" | "shaking" = "idle";
    let carrying_state: "hand" | "pocket" | "bag" | "car_mount" | "table" = "hand";
    let speed = 0;
    let roll = 0;
    let pitch = 0;
    let yaw = 0;
    let isFallen = false;
    let isDizzy = false;
    let stepCountOffset = 0;
    let brightnessLux = 140;

    switch (scenario) {
      case "stationary":
        movement_state = "idle";
        carrying_state = "table";
        roll = 1.2;
        pitch = -0.5;
        brightnessLux = 180;
        break;
      case "walk":
        movement_state = "walking";
        carrying_state = "hand";
        speed = 1.4; // 1.4 m/s
        roll = -5;
        pitch = 12;
        brightnessLux = 320;
        break;
      case "run":
        movement_state = "running";
        carrying_state = "hand";
        speed = 3.6;
        roll = 15;
        pitch = -25;
        brightnessLux = 450;
        break;
      case "car":
        movement_state = "driving";
        carrying_state = "car_mount";
        speed = 18.5; // ~66 km/h
        roll = -2;
        pitch = 4;
        brightnessLux = 280;
        break;
      case "shake":
        movement_state = "shaking";
        carrying_state = "hand";
        roll = 38;
        pitch = -42;
        isDizzy = true;
        brightnessLux = 110;
        break;
      case "fall":
        movement_state = "falling";
        carrying_state = "table";
        roll = 88; // flat sideways
        pitch = 90; // flat
        isFallen = true;
        brightnessLux = 8; // dark, face down on floor
        break;
    }

    setTelemetry((prev) => ({
      ...prev,
      gps: {
        ...prev.gps,
        speed,
        heading: scenario === "car" ? 184 : prev.gps.heading,
      },
      motion: {
        roll,
        pitch,
        yaw,
        x: scenario === "shake" ? 14.5 : 0,
        y: scenario === "shake" ? -12.4 : 0,
        z: scenario === "shake" ? 9.2 : 0,
      },
      env: {
        ...prev.env,
        brightnessLux,
        near: scenario === "fall",
      },
      fusion: {
        ...prev.fusion,
        movement_state,
        carrying_state,
        stability_score: scenario === "stationary" ? 0.99 : scenario === "car" ? 0.92 : scenario === "walk" ? 0.74 : scenario === "run" ? 0.42 : 0.05,
        isDizzy,
        isFallen,
        step_count: prev.fusion.step_count + (scenario === "run" ? 12 : scenario === "walk" ? 5 : 0)
      }
    }));
  };

  return (
    <div id="system-dashboard-container" className="flex-1 flex flex-col bg-slate-900/40 border border-slate-850 rounded-xl p-4 h-full overflow-hidden">
      
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800 pb-2.5 gap-1.5 overflow-x-auto scrollbar-none" id="tabs-navigation">
        {[
          { id: "architecture", label: "مختبر المستشعرات وهيكلة النظام", icon: Sliders },
          { id: "dataflow", label: "مسار البيانات", icon: ListOrdered },
          { id: "pipeline", label: "خطوات المعالجة", icon: Sparkles },
          { id: "memory", label: "الذاكرة المكانية والـ DB", icon: Database },
          { id: "errors", label: "الأعطال والبدائل", icon: AlertTriangle },
          { id: "performance", label: "الأداء والأمان", icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-slate-800 border-slate-700 text-white shadow-sm" 
                  : "bg-slate-950 border-slate-850/60 text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-blue-500" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Screens Content */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 text-right scrollbar-thin" dir="rtl">
        
        {/* Error Simulation Banner notification */}
        {simulatedError && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/25 border border-red-900/30 flex items-start gap-2.5 text-red-400" id="error-simulator-alert">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold">العطل مفعل حالياً لمحاكاة التدهور السلس</h4>
              <p className="text-[10px] text-slate-300 mt-0.5">تدهورت قدرة المنظومة إلى: <span className="font-mono bg-red-950/70 border border-red-905 px-1 py-0.5 rounded text-[10px]">{simulatedError}</span></p>
            </div>
            <button 
              id="clear-simulated-error"
              onClick={onClearSimulatedError} 
              className="text-[10px] font-bold underline hover:text-white"
            >
              إلغاء المحاكاة
            </button>
          </div>
        )}

        {/* 1. INTERACTIVE SOMATOSENSORY LAB / ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="space-y-5" id="architecture-tab-view">
            
            {/* Somatosensory Simulation lab deck card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-4">
              
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-500" />
                    <span>مختبر المحاكاة والتحكم اللحظي للمستشعرات (Physical Test Lab)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">تحكم في مدخلات المستشعرات الـ 10 واختبر كيف يعيش ويستجيب وعي الـ AI فورياً</p>
                </div>
                <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>

              {/* Grid 1: Quick Preset Physical Scenarios */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-400 font-bold">حاقن السيناريوهات المادية الجاهزة (Preset Physical Scenarios):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: "stationary", label: "🧘 ثابت / على طاولة", color: "bg-slate-900 border-slate-800 hover:border-slate-700" },
                    { id: "walk", label: "👣 المشي في الحديقة", color: "bg-blue-950/20 border-blue-900/40 hover:border-blue-850" },
                    { id: "run", label: "🏃 ركض رياضي سريع", color: "bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-850" },
                    { id: "car", label: "🚗 بالسيارة (قيادة مريحة)", color: "bg-purple-950/20 border-purple-900/40 hover:border-purple-850" },
                    { id: "shake", label: "⚡ اهتزاز / رج عنيف", color: "bg-yellow-950/20 border-yellow-905/40 hover:border-yellow-850" },
                    { id: "fall", label: "☠️ سقوط وارتطام بالأرض", color: "bg-red-950/25 border-red-900/40 hover:border-red-850" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => triggerScenario(preset.id as any)}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-slate-200 transition-all text-center ${preset.color} hover:text-white transform active:scale-95`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2: Manual Precision Sliders (Somatosensory Fusion controls) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-850 pt-3">
                
                {/* Roll & Pitch (Euler balance angles) */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    زوايا توازن وتدحرج الهاتف (Tilt Euler Angles)
                  </span>

                  <div className="space-y-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>الالتفاف الجانبي (Roll):</span>
                        <span className="font-mono text-white">{telemetry?.motion?.roll?.toFixed(0)}°</span>
                      </div>
                      <input 
                        type="range" min="-90" max="90" 
                        value={telemetry?.motion?.roll}
                        onChange={(e) => updateSensors(prev => ({
                          motion: { ...prev.motion, roll: parseFloat(e.target.value) }
                        }))}
                        className="w-full accent-blue-550 h-1 bg-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                        <span>الميل للأمام/الخلف (Pitch):</span>
                        <span className="font-mono text-white">{telemetry?.motion?.pitch?.toFixed(0)}°</span>
                      </div>
                      <input 
                        type="range" min="-90" max="90" 
                        value={telemetry?.motion?.pitch}
                        onChange={(e) => updateSensors(prev => ({
                          motion: { ...prev.motion, pitch: parseFloat(e.target.value) }
                        }))}
                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Light Lux, Altitude & Pressure */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    المحيط البيئي (Environmental Sensors)
                  </span>

                  <div className="space-y-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-450 mb-1">
                        <span>مستوى الإضاءة المتلقاة (Lux):</span>
                        <span className="font-mono text-white">{telemetry?.env?.brightnessLux} Lux</span>
                      </div>
                      <input 
                        type="range" min="0" max="1000" 
                        value={telemetry?.env?.brightnessLux}
                        onChange={(e) => updateSensors(prev => ({
                          env: { ...prev.env, brightnessLux: parseInt(e.target.value) }
                        }))}
                        className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-450 mb-1">
                        <span>الارتفاع النسبي المحتمل (Height):</span>
                        <span className="font-mono text-white">{telemetry?.env?.altitudeEstimate?.toFixed(0)} متر</span>
                      </div>
                      <input 
                        type="range" min="0" max="150" 
                        value={telemetry?.env?.altitudeEstimate}
                        onChange={(e) => {
                          const alt = parseFloat(e.target.value);
                          const calculatedPressure = 1013.25 * Math.pow(1 - 0.0000225577 * alt, 5.25588);
                          updateSensors(prev => ({
                            env: { ...prev.env, altitudeEstimate: alt, pressureHpa: calculatedPressure }
                          }));
                        }}
                        className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Carry states and Pocket Proximity toggler */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    محل الإرساء والقرب (Placement & Proximity)
                  </span>

                  <div className="space-y-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 text-xs">
                    <div>
                      <label className="block text-[9px] text-slate-500 mb-1 uppercase">محل حمل الهاتف (Carrying placement):</label>
                      <select
                        value={telemetry?.fusion?.carrying_state}
                        onChange={(e) => updateSensors(prev => ({
                          fusion: { ...prev.fusion, carrying_state: e.target.value as any }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        <option value="hand">🤚 في اليد</option>
                        <option value="pocket">👖 في الجيب</option>
                        <option value="bag">👜 داخل الحقيبة</option>
                        <option value="car_mount">🚗 مثبت على منصة السيارة</option>
                        <option value="table">💻 مستند على طاولة العمل</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400">مستشعر القرب مغلق (Near Face/Pocket):</span>
                      <button
                        onClick={() => updateSensors(prev => ({
                          env: { ...prev.env, near: !prev.env.near, distanceCm: prev.env.near ? 8 : 1.5 }
                        }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          telemetry?.env?.near ? "bg-red-950 border border-red-800 text-red-400" : "bg-slate-950 border border-slate-800 text-slate-400"
                        }`}
                      >
                        {telemetry?.env?.near ? "نشط (قريب جداً)" : "غير نشط (بعيد)"}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Static System Architecture detail cards */}
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850">
              <div>
                <h2 className="text-sm font-bold text-white">{SYSTEM_ARCHITECTURE.title}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">المخطط البرمجي لدمج مستشعرات الجسد وعين الرؤية السحابية (Gemini Vision + Telemetry)</p>
              </div>
              <Cpu className="w-5 h-5 text-blue-500 opacity-80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
              {SYSTEM_ARCHITECTURE.layers.map((layer, index) => {
                return (
                  <div 
                    key={layer.id} 
                    id={`arch-layer-card-${layer.id}`}
                    className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-850 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded bg-blue-950/40 text-blue-400 font-bold flex items-center justify-center text-[10px] font-mono">
                          {index + 1}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200">{layer.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{layer.description}</p>
                      
                      <div className="space-y-1 border-t border-slate-900 pt-2 pb-1">
                        {layer.components.map((comp, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                            <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            <span>{comp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        الحالة: متصل مجهرياً
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-slate-650">{layer.id}_layer</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DATA FLOW DIAGRAM TAB SCREEN */}
        {activeTab === "dataflow" && (
          <div className="space-y-4" id="dataflow-tab-view">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850">
              <div>
                <h2 className="text-sm font-bold text-white">ترتيب تدفق البيانات التفاعلي (Data Flow Pipeline)</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">تتبع رحلة الصوت الملتقط مع إشارات المستشعرات الـ 10 وعودة رد النطق بالكامل</p>
              </div>
              <ListOrdered className="w-5 h-5 text-blue-500 opacity-80" />
            </div>

            <p className="text-[11px] text-slate-300 bg-blue-950/20 p-2.5 rounded-lg border border-blue-900/15 leading-relaxed">
              💡 <span className="font-bold text-slate-200">ملاحظة الذكاء الفوري:</span> في كل مرة تقوم بالتحدث في محاكي الهاتف الصوتي، نقوم بكبس لقطة كاميرا الكيان (Vision Snapshot) وتعبئتها في كبسولة JSON متكاملة تضم المستشعرات المشفرة وترحيل المسار!
            </p>

            <div className="relative border-r border-slate-850 mr-2 space-y-3">
              {DATA_FLOW_STAGES.map((stage) => {
                const isActive = getActiveFlowStep() === stage.step;
                return (
                  <div 
                    key={stage.step}
                    id={`flow-step-item-${stage.step}`}
                    className={`relative pr-4 transition-all duration-300 ${
                      isActive ? "opacity-100 font-semibold" : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className={`absolute right-[-4.5px] top-1.5 w-2 h-2 rounded-full border transition-all duration-300 ${
                      isActive 
                        ? "bg-blue-550 border-blue-400 scale-125 ring-2 ring-blue-500/20" 
                        : "bg-slate-950 border-slate-755"
                    }`} />

                    <div className={`p-3 rounded-lg border transition-all duration-300 ${
                      isActive 
                        ? "bg-blue-950/25 border-blue-800 shadow-md text-blue-50" 
                        : "bg-slate-950/30 border-slate-900 text-slate-300"
                    }`}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[9px] font-mono text-slate-500">الخطوة {stage.step}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          stage.actor === "المستخدم" 
                            ? "bg-slate-900 text-slate-400 border border-slate-800"
                            : "bg-blue-950/50 text-blue-400 border border-blue-900/20"
                        }`}>
                          {stage.actor}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold">{stage.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. AI PROCESSING PIPELINE TAB SCREEN */}
        {activeTab === "pipeline" && (
          <div className="space-y-4" id="pipeline-tab-view">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850">
              <div>
                <h2 className="text-sm font-bold text-white">تحليل الوعي العصبي المدمج (Neuro-Sensing Pipeline)</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">تفكيك مخرجات ومزاج Gemini 3.5 الفوري بناء على الإدراك المحيطي</p>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500 opacity-80" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-850 text-center flex flex-col justify-between h-28">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold mb-0.5">النية الجسدية (Sensing Intent)</h4>
                  <p className="text-base font-black text-blue-400 tracking-wide mt-1">
                    {lastAnalysis.intent ? lastAnalysis.intent.toUpperCase() : "SPATIAL_AWARENESS"}
                  </p>
                </div>
                <span className="text-[9px] text-slate-500 font-sans">تفكيك قصدك لتعبئة الفضاء</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-850 text-center flex flex-col justify-between h-28">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold mb-0.5">انفعال وعي الـ AI (Emotional Mood)</h4>
                  <p className="text-base font-black text-emerald-400 tracking-wide mt-1">
                    {lastAnalysis.emotion ? lastAnalysis.emotion.toUpperCase() : "CURIOUS_STANDBY"}
                  </p>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 mt-1 pb-px">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${(lastAnalysis.intensity || 0.8) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500">مستوى الحساسية: {Math.round((lastAnalysis.intensity || 0.8) * 100)}%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-850 text-center flex flex-col justify-between h-28">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold mb-0.5">زمن المعالجة البصرية (Latency)</h4>
                  <p className="text-lg font-black text-amber-500 tracking-wide mt-1 font-mono">
                    {lastAnalysis.latencyMs ? `${lastAnalysis.latencyMs}ms` : "160ms"}
                  </p>
                </div>
                <span className="text-[9px] text-slate-500 text-center">شاملاً ضغط الـ base64 وفحص التوازن</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-white border-r-2 border-blue-500 pr-1.5">مراحل تفكيك الوعي وحساب التوازن اللحظي</h3>
              <div className="space-y-2">
                {[
                  { step: 1, title: "Sensor Normalization", desc: "مطابقة زوايا التدحرج والبوصلة مع اتساق زوايا عين الرؤية الكاميرا." },
                  { step: 2, title: "Obstruction & Lumens Guard", desc: "حساب معدل السطوع لإثبات وضوح العدسة وكشف احتمالات انسداد الضوء (مثل أن يكون في جيب أو حقيبة)." },
                  { step: 3, title: "Balance Instability scoring", desc: "تحليل تذبذبات الحركة الجيروسكوبية لحقن تعابير السقوط، الرج والتناغم الماتريكس الصوتي المليء بالنبرة الحيوية." },
                  { step: 4, title: "SLA Map Projection", desc: "ربط إسهامات الـ GPS بالذاكرة المكانية الموثقة لإثارة حديث ملهم حول 'أين نحن'." }
                ].map(stage => (
                  <div key={stage.step} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900/60 flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded bg-blue-900/30 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {stage.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{stage.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. MEMORY & LOCAL DB TAB SCREEN */}
        {activeTab === "memory" && (
          <div className="space-y-6" id="memory-tab-view">
            <div className="flex justify-between items-center bg-slate-950/30 p-4 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">الذاكرة المكانية وحقائب البيانات الموثقة (Local Database IndexedDB)</h2>
                <p className="text-xs text-slate-400 mt-1">يمتلك المساعد ذاكرة تخزن المواقع التي زرتها والأشياء التي رآها معك</p>
              </div>
              <Database className="w-8 h-8 text-blue-500 opacity-80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5">الموقع والمعلومات الشخصية المستخلصة</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-semibold">تغيير اسم رفيق وعي الـ AI:</label>
                      <input 
                        id="user-profile-name-input"
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => onUpdateProfile({ ...userProfile, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-semibold">العمر والوظيفة والمسمى:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          id="user-profile-age-input"
                          type="text" 
                          placeholder="العمر (مثال: 27)"
                          value={userProfile.age || ""}
                          onChange={(e) => onUpdateProfile({ ...userProfile, age: e.target.value })}
                          className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <input 
                          id="user-profile-job-input"
                          type="text" 
                          placeholder="الاهتمام الرئيسي"
                          value={userProfile.job || ""}
                          onChange={(e) => onUpdateProfile({ ...userProfile, job: e.target.value })}
                          className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddManualFact} className="mt-5 pt-4 border-t border-slate-900">
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">إدخال موقع/معلم يدوي للذاكرة الفضائية:</label>
                    <div className="flex gap-2">
                      <input 
                        id="manual-fact-input"
                        type="text" 
                        placeholder="مثال: يقع الملعب الرياضي على بعد 300م شرق حديقة السلام"
                        value={newManualFact}
                        onChange={(e) => setNewManualFact(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                      <button 
                        id="add-manual-fact"
                        type="submit" 
                        className="p-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        حفظ الركيزة
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-900 flex justify-between gap-2">
                  <button 
                    id="download-memory-backup"
                    onClick={handleDownloadBackup}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل النسخة المنسقة
                  </button>
                  <button 
                    id="clear-all-memory"
                    onClick={handleClearAllMemory}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/25 text-red-400 p-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> تصفير الذاكرة
                  </button>
                </div>
              </div>

              {/* Memory Fact Visual Database */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>نقاط الوعي والملامح المسجلة</span>
                    <span className="text-[10px] bg-slate-900 px-2.5 py-0.5 rounded border border-slate-880 text-slate-400 font-mono">
                      {userProfile.known_facts.length} ركائز الوعي
                    </span>
                  </h3>

                  <div className="space-y-2 max-h-[140px] overflow-y-auto mb-4 scrollbar-thin">
                    {userProfile.known_facts.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center italic">الذاكرة المكانية خالية حالياً، ستبنى تلقائياً عند تجولك وتفعيل الكاميرا والـ GPS!</p>
                    ) : (
                      userProfile.known_facts.map((fact, idx) => (
                        <div 
                          key={idx} 
                          id={`fact-tag-item-${idx}`}
                          className="flex justify-between items-center p-2 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-300"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{fact.fact}</span>
                          </div>
                          <button 
                            id={`delete-fact-btn-${idx}`}
                            onClick={() => handleRemoveFact(idx)} 
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Interests controller */}
                  <h3 className="text-xs font-bold text-slate-400 mb-2 pt-2 border-t border-slate-900 flex justify-between items-center">
                    <span>الهوايات وعلامات الاهتمام</span>
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-3 max-h-[70px] overflow-y-auto scrollbar-thin">
                    {userProfile.interests.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">لا يوجد بنود مسجلة</span>
                    ) : (
                      userProfile.interests.map((interest, idx) => (
                        <span 
                          key={idx}
                          id={`interest-tag-item-${idx}`}
                          className="inline-flex items-center gap-1 text-[10px] bg-blue-950/40 border border-blue-900 text-blue-300 px-2 py-0.5 rounded-full"
                        >
                          <span>{interest}</span>
                          <button 
                            id={`delete-interest-btn-${idx}`}
                            onClick={() => handleRemoveInterest(idx)} 
                            className="hover:bg-blue-900/50 rounded-full p-0.5 text-blue-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddManualInterest} className="flex gap-2">
                    <input 
                      id="manual-interest-input"
                      type="text" 
                      placeholder="أضف هواية/معلم..." 
                      value={newManualInterest}
                      onChange={(e) => setNewManualInterest(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                    <button 
                      id="add-manual-interest"
                      type="submit" 
                      className="p-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition-all font-semibold"
                    >
                      أضف اهتمام
                    </button>
                  </form>
                </div>
              </div>

            </div>

            {/* LIVE JSON EXPLORER DATABASE PANEL */}
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-200">مستكشف هياكل قاعدة السكيما الفضائية (Raw Telemetry DB Map)</span>
                <span className="text-[10px] text-slate-500 font-mono">TELEMETRY_LIVE_NODE</span>
              </div>
              <pre id="raw-json-database-tree" className="bg-slate-950 p-4 rounded-xl text-[10px] text-slate-400 overflow-x-auto text-left font-mono border border-slate-900 max-h-48 scrollbar-thin">
                {JSON.stringify(telemetry, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 5. ERROR HANDLING & FALLBACKS TAB SCREEN */}
        {activeTab === "errors" && (
          <div className="space-y-6" id="errors-tab-view">
            <div className="flex justify-between items-center bg-slate-950/30 p-4 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">إدارات بدائل الأعطال والتدهور السلس لمستشعرات الحركة (Graceful Flight Protection)</h2>
                <p className="text-xs text-slate-400 mt-1">تضمين خوارزميات صلبة لمواصلة عمل العين الذكية دون توقف عند فقدان GPS أو انسداد الكاميرا</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-500 opacity-80" />
            </div>

            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2 mb-2">إجراءات تدهور الخدمة لبيك مستشعراتك</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900">
                <h4 className="text-xs font-bold text-slate-200 mb-1">المستوى الأول (تكامل الاستشعار)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  اتصال الكاميرا سليم مع توفر الـ GPS ومستشعر المغناطيسية والبوصلة. أقصى استجابة بيئية ممكنة مع ربط كامل لملامح الـ SLAM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900">
                <h4 className="text-xs font-bold text-slate-200 mb-1">المستوى الثاني (شبه محلي / حركي)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  فقدان إشارة الـ GPS. تعتمد الكاميرا على حساب الموضع التقريبي التراكمي (Dead Reckoning) بدمج عداد الخطوات والجيروسكوب بدلاً من السيرال.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-900">
                <h4 className="text-xs font-bold text-slate-200 mb-1">المستوى الثالث (توليدي كوني)</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  انسداد الكاميرا التام (قيمة الإضاءة أقل من 10 لوكس). يقوم الـ AI بتحويل واجهة الرؤية إلى مستكشف رادار ذكي يحاكي البعد السمعي.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">لوحة محقن وحقن الأعطال (Simulate & Test Scenarios)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button 
                  id="btn-sim-offline"
                  onClick={() => onSimulateError("offline_mode")}
                  className="p-3 text-right rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold transition-all flex items-center gap-2"
                >
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span>محاكاة انقطاع الإنترنت التام للوعي المحلي</span>
                </button>
                <button 
                  id="btn-sim-timeout"
                  onClick={() => onSimulateError("stt_timeout")}
                  className="p-3 text-right rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-semibold transition-all flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>محاكاة غياب الرؤية البصرية بسبب الظلام</span>
                </button>
              </div>

              <div className="space-y-3.5 border-t border-slate-900 pt-4">
                {ERROR_SCENARIOS.map((esc) => {
                  return (
                    <div key={esc.id} className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-xs text-right">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-200">{esc.title}</span>
                        <span className="font-mono text-[9px] uppercase text-red-400">SCENARIO: {esc.id}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1"><span className="font-semibold text-slate-350">السيناريو:</span> {esc.scenario}</p>
                      <p className="text-emerald-400/90 text-[11px] mt-1"><span className="font-semibold text-slate-350">الحل الذكي الكوني:</span> {esc.fallback}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 6. PERFORMANCE, COMPLIANCE & ROADMAP TAB SCREEN */}
        {activeTab === "performance" && (
          <div className="space-y-6" id="performance-tab-view">
            
            <div className="flex justify-between items-center bg-slate-950/30 p-4 rounded-2xl border border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">مؤشرات الأداء المقاسة والسرعة الحجمية (Velocity & Safety metrics)</h2>
                <p className="text-xs text-slate-400 mt-1">تتبع سرعة نقل حزم السقوط ومعدل تذبذب المعالج الجيروسكوبي</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900">
                <h3 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span>مؤشرات أداء الاستشعار المجمعة</span>
                </h3>

                <div className="space-y-3.5 mt-4">
                  {TARGET_METRICS.map((metric, idx) => {
                    return (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-900/45 pb-2 text-xs">
                        <span className="text-slate-400">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-white font-bold">{metric.value}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 pb-2 border-b border-white/5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>حماية واستقرار خصوصية المستشعرات</span>
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-[11px] text-slate-400 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><strong>الحذف وحق نسيان المواقع:</strong> كافة حقائب الـ GPS والـ SLAM تسجل محلياً تماماً ضمن جهازك دون تخزين في كتل وسيطة غير مخولة.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span><strong>معامل التشفير الحسي:</strong> يتم ضغط لقطات الرؤية وتمريرها في بروتوكول SSL مؤمن ومباشر لخلايا المعالجة.</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-[10px] text-emerald-400 font-mono tracking-wider text-center mt-4">
                  Fully Encrypted Spatial Navigation Interface (HSPA)
                </div>
              </div>

            </div>

            {/* ROADMAP SURVEY ITEMS */}
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-900 mt-6 font-sans">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-850">مستقبل العين الذكية - ترشيح التطويرات القادمة</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "group", feature: "التتبع الثنائي للأولياء والمسنين", priority: "عالية", desc: "إرسال تنبيه اصطدام وسقوط فوري عبر الرسائل آلياً عند وقوع المكالمة." },
                  { key: "images", feature: "دعم ميزات الـ LiDAR المجهرية", priority: "عالية", desc: "قراءة البعد الحجمي المجهري بدقة مليمترية للغرف باستخدام المستشعر المتطور." },
                  { key: "dialects", feature: "سرعة نطق دهرية فوتونية", priority: "عالية", desc: "نطق عالي التزامن لا يتعدى 100 ملي ثانية لمواصلة النبرة البشرية تماماً." },
                ].map(item => {
                  return (
                    <div 
                      key={item.key} 
                      className="p-3.5 rounded-xl bg-slate-955 border border-slate-900 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-amber-955/50 text-amber-400">
                            أولوية {item.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{item.feature}</h4>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900/50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {votedFeatures[item.key] || 0} تصويت
                        </span>
                        <button 
                          onClick={() => handleVote(item.key)}
                          className="flex items-center gap-1 bg-blue-955/50 text-blue-400 hover:text-white border border-blue-900/20 px-2 py-1 rounded text-[10px] font-bold transition-all"
                        >
                          <Flame className="w-3 h-3 animate-pulse" />
                          <span>صوّت للميزة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
