import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, Database, Sparkles, AlertTriangle, ShieldCheck, 
  Activity, Star, Globe, RefreshCw, Trash2, Download, 
  CheckCircle, Plus, Eye, Play, Info, Flame, WifiOff, ListOrdered, Share2, HelpCircle,
  Sliders, Sun, Moon, Wind, Compass, MapPin, Radio, Terminal,
  Lock, Unlock, Key, Copy, Code, Check
} from "lucide-react";
import { Persona, UserProfile, Message, TelemetryData } from "../types";
import { SYSTEM_ARCHITECTURE, DATA_FLOW_STAGES, ERROR_SCENARIOS, TARGET_METRICS } from "../data";
import soundSynth from "../utils/soundGenerator";

interface DashboardProps {
  userProfile: UserProfile;
  activePersona: Persona;
  onChangePersona: (id: string) => void;
  personas: Persona[];
  messages: Message[];
  currentCallState: "idle" | "listening" | "thinking" | "speaking";
  activeTab: string;
  onChangeTab: (tab: "architecture" | "dataflow" | "pipeline" | "memory" | "errors" | "performance" | "broker") => void;
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
  
  // Real-time receiver database for Intermediary API commands
  const [brokerCommands, setBrokerCommands] = useState<any[]>([]);
  const [isPollingBroker, setIsPollingBroker] = useState(true);
  const [injectingCmd, setInjectingCmd] = useState<string | null>(null);

  // States for Global API Security Access and Setup
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [apiToken, setApiToken] = useState("eye_of_ai_secure_token_2026");
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // States for the 8-Socket Active Router Gateway & Simulator
  const [selectedSocket, setSelectedSocket] = useState("socket_1_text_in");
  const [socketTraffic, setSocketTraffic] = useState<Record<string, { packets: number, bytes: number, status: string }>>({
    socket_1_text_in: { packets: 24, bytes: 2150, status: "Connected" },
    socket_2_text_out: { packets: 21, bytes: 8400, status: "Connected" },
    socket_3_vision: { packets: 6, bytes: 184000, status: "Connected" },
    socket_4_memory: { packets: 98, bytes: 3100, status: "Connected" },
    socket_5_movement: { packets: 12, bytes: 940, status: "Connected" },
    socket_6_sensors: { packets: 420, bytes: 18900, status: "Connected" },
    socket_7_speech: { packets: 3, bytes: 12200, status: "Connected" },
    socket_8_command: { packets: 5, bytes: 850, status: "Connected" }
  });
  const [socket1TextInput, setSocket1TextInput] = useState("كيف تشعر بالتوازن الآن؟");
  const [socket8CommandJson, setSocket8CommandJson] = useState('{\n  "command": "ROTATE_YAW",\n  "parameters": {\n    "angle": 45.0\n  }\n}');
  const [isStreamingSensors, setIsStreamingSensors] = useState(false);
  const [copiedSocketCode, setCopiedSocketCode] = useState<string | null>(null);
  const [activeSocketLogs, setActiveSocketLogs] = useState<Array<{ time: string, level: string, msg: string }>>([
    { time: "07:30:01", level: "SYSTEM", msg: "بوابة نظام المقابس الموحد (Unified Socket Engine) قيد التشغيل والانتظار." },
    { time: "07:35:05", level: "SOCKET 6", msg: "مستشعر المسافات فوق الصوتية يبث دفق قياسات مستمر." },
    { time: "07:35:12", level: "SOCKET 4", msg: "تمت مزامنة ذاكرة الجلسة التراكمية بنجاح." }
  ]);

  const getSocketJsCode = (socketId: string): string => {
    switch (socketId) {
      case "socket_1_text_in":
        return `// بث رسالة نصية عبر المقبس 1 لإرسال مدخلات وتوجيهات المستخدم وتوليد الردود فورياً
const currentURL = window.location.origin;
fetch(\`\${currentURL}/api/chat\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "كيف تشعر بالتوازن الآن؟",
    history: [],
    persona: { name: "هادئ", tone: "ودود" }
  })
})
.then(res => res.json())
.then(data => console.log("تم بث النص واستلام الرد:", data.reply));`;
      case "socket_2_text_out":
        return `// الاستماع إلى مخرجات المقبس 2 وتتبع استجابات عقل الذكاء الاصطناعي اللحظية والنيّات المكتشفة
const currentURL = window.location.origin;
async function listenToSocket2TextOut() {
  const res = await fetch(\`\${currentURL}/api/commands/history\`);
  if (res.ok) {
    const commands = await res.json();
    const systemOuts = commands.filter(c => c.sender === "AI_Brain" || c.command === "TALK");
    console.log("الحزم المستلمة عبر القناة 2:", systemOuts);
  }
}
listenToSocket2TextOut();`;
      case "socket_3_vision":
        return `// إرسال حزم بصرية مشفرة JPEG عبر المقبس 3 لتوفير تغذية مكانية ذكية ومسح بيئي متكامل
const currentURL = window.location.origin;
async function pushVisionFrame(base64Image) {
  const response = await fetch(\`\${currentURL}/api/commands\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command: "SCAN_ENVIRONMENT",
      parameters: { image: base64Image, resolution: "1080p", scale: "15_fps" }
    })
  });
  return response.json();
}`;
      case "socket_4_memory":
        return `// إدارة وعاء الذاكرة الطويلة التراكمية وسحب تفاصيل اهتمامات وجلسة العميل عبر المقبس 4
const currentURL = window.location.origin;
async function syncSocket4Memory() {
  const response = await fetch(\`\${currentURL}/api/profile\`);
  if (response.ok) {
    const profile = await response.json();
    console.log("وعاء الذاكرة الطويلة المتزامنة للعميل:", profile);
  }
}
syncSocket4Memory();`;
      case "socket_5_movement":
        return `// حقن وبث الأوامر الحركية الميكانيكية لتشغيل ست ذراعي ومفاصل وسيرفو الريبوت
const currentURL = window.location.origin;
fetch(\`\${currentURL}/api/commands\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    command: "ROTATE_YAW",
    parameters: { angle: 45.0, durationMs: 500 }
  })
})
.then(res => res.json())
.then(data => console.log("محاذة ميكانيكية ناجحة للمفاصل:", data));`;
      case "socket_6_sensors":
        return `// الاستماع وتلقي البيانات الحزامية من جيروسكوب ومستشعرات الهاتف الحيبة والاتزان
const currentURL = window.location.origin;
function subscribeToSocket6Sensors() {
  // دفق البيانات اللحظية بتردد 2000 مللي ثانية
  setInterval(async () => {
    const res = await fetch(\`\${currentURL}/api/telemetry\`);
    if (res.ok) {
      const data = await res.json();
      console.log(\`جيروسكوب مائل: Yaw=\${data?.motion?.yaw}° | Stability=\${data?.fusion?.stability_score}%\`);
    }
  }, 2000);
}
subscribeToSocket6Sensors();`;
      case "socket_7_speech":
        return `// توليد ومعايرة نبرة النطق الصوتي وتمايز ثنائيات التردد الصوتي للمقبس 7
const currentURL = window.location.origin;
function triggerSocket7Speech(textPrompt) {
  console.log("توجيه النطق الصوتي للمقبس 7 لطلب:", textPrompt);
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
triggerSocket7Speech("مرحباً بك في وحدة التحكم");`;
      case "socket_8_command":
        return `// حقن هيكل كود JSON بروتوكولي بشكل صريح ومباشر للمقبس 8 (Direct Command)
const currentURL = window.location.origin;
fetch(\`\${currentURL}/api/commands\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    command: "CALIBRATE_ACCELEROMETER",
    parameters: { calibrate: true }
  })
})
.then(res => res.json())
.then(console.log);`;
      default:
        return "";
    }
  };

  const fetchCommandsHistory = async () => {
    try {
      const res = await fetch("/api/commands/history");
      if (res.ok) {
        const data = await res.json();
        setBrokerCommands(data);
      }
    } catch (e) {
      console.warn("Failed to retrieve commands from background server:", e);
    }
  };

  const fetchBrokerSettings = async () => {
    try {
      const res = await fetch("/api/broker-settings");
      if (res.ok) {
        const data = await res.json();
        setSecurityEnabled(data.securityEnabled);
        setApiToken(data.apiToken);
      }
    } catch (e) {
      console.warn("Failed to retrieve broker configurations:", e);
    }
  };

  const handleSaveBrokerSettings = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/broker-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          securityEnabled,
          apiToken
        })
      });
      if (res.ok) {
        const result = await res.json();
        setSecurityEnabled(result.settings.securityEnabled);
        setApiToken(result.settings.apiToken);
        setSaveStatus("success");
        soundSynth.playConnectionChime();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    fetchCommandsHistory(); // Immediate first load
    fetchBrokerSettings(); // Fetch settings config
    const interval = setInterval(() => {
      if (isPollingBroker) {
        fetchCommandsHistory();
      }
    }, 3500); // Poll command queue every 3.5 seconds
    return () => clearInterval(interval);
  }, [isPollingBroker]);

  // Live sensor streaming generator simulating Socket 6 continuous data feed
  useEffect(() => {
    if (!isStreamingSensors) return;
    const streamInterval = setInterval(() => {
      // Fluctuating slightly gyroscopic yaw and pitch
      updateSensors(prev => {
        const randYaw = (Math.random() - 0.5) * 1.8;
        const randPitch = (Math.random() - 0.5) * 0.9;
        return {
          motion: {
            ...prev.motion,
            yaw: Number((prev.motion.yaw + randYaw).toFixed(1)),
            pitch: Number((prev.motion.pitch + randPitch).toFixed(1))
          }
        };
      });

      // Increment packet counts for Socket 6
      setSocketTraffic(prev => ({
        ...prev,
        socket_6_sensors: {
          ...prev.socket_6_sensors,
          packets: prev.socket_6_sensors.packets + 1,
          bytes: prev.socket_6_sensors.bytes + 112
        }
      }));

      // Append live telemetry trace in terminal logs
      setActiveSocketLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          level: "SOCKET 6",
          msg: `دفق مستمر: Yaw=${telemetry.motion.yaw.toFixed(1)}° | Pitch=${telemetry.motion.pitch.toFixed(1)}° | الضغط=${telemetry.env.pressureHpa.toFixed(1)} hPa`
        },
        ...prev.slice(0, 24)
      ]);
    }, 2000);

    return () => clearInterval(streamInterval);
  }, [isStreamingSensors, telemetry]);

  // Handler for sending text message via Socket 1 and receiving AI reply via Socket 2
  const handleSocket1Send = async () => {
    if (!socket1TextInput.trim()) return;
    const txt = socket1TextInput;
    const timeSent = new Date().toLocaleTimeString();

    setActiveSocketLogs(prev => [
      { time: timeSent, level: "SOCKET 1", msg: `بث نص المستخدم للتمرير الذكي: "${txt}" [${txt.length} bytes]` },
      ...prev
    ]);

    setSocketTraffic(prev => ({
      ...prev,
      socket_1_text_in: {
        ...prev.socket_1_text_in,
        packets: prev.socket_1_text_in.packets + 1,
        bytes: prev.socket_1_text_in.bytes + txt.length
      }
    }));

    soundSynth.playSystemBeep();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: txt,
          history: messages.slice(-4).map(m => ({ role: m.role === "user" ? "user" : "model", content: m.content })),
          persona: activePersona,
          telemetry: telemetry
        })
      });

      if (response.ok) {
        const result = await response.json();
        const reply = result.reply || "تلقيت الإجراء الجيروسكوبي بنجاح.";
        const emotion = result.emotion || "calm";
        const timeRecv = new Date().toLocaleTimeString();

        // Increment Outgoing socket
        setSocketTraffic(old => ({
          ...old,
          socket_2_text_out: {
            ...old.socket_2_text_out,
            packets: old.socket_2_text_out.packets + 1,
            bytes: old.socket_2_text_out.bytes + reply.length
          }
        }));

        setActiveSocketLogs(prev => [
          { time: timeRecv, level: "SOCKET 2", msg: `استقبال بث من العقل الذكي: "${reply}" [الحالة: ${emotion}]` },
          ...prev
        ]);
        soundSynth.playConnectionChime();
        setSocket1TextInput(""); // clear on success
      } else {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed socket stream packet response");
      }
    } catch (err: any) {
      setActiveSocketLogs(prev => [
        { time: new Date().toLocaleTimeString(), level: "SOCKET 2 ERROR", msg: `فشل التوصيل أو تزويد الـ API Key: ${err.message}` },
        ...prev
      ]);
      soundSynth.playAlarmWarning();
    }
  };

  // Handler for Socket 3 (Vision binary push simulation)
  const handleSocket3VisionSend = () => {
    const frameSizeKB = 120 + Math.floor(Math.random() * 80);
    const mockTime = new Date().toLocaleTimeString();

    setSocketTraffic(prev => ({
      ...prev,
      socket_3_vision: {
        ...prev.socket_3_vision,
        packets: prev.socket_3_vision.packets + 1,
        bytes: prev.socket_3_vision.bytes + (frameSizeKB * 1024)
      }
    }));

    setActiveSocketLogs(prev => [
      { time: mockTime, level: "SOCKET 3", msg: `📸 بث إطار كاميرا مشفر بصيغة base64 jpeg. الحجم: ${frameSizeKB} KB | التردد البصري 15 FPS` },
      ...prev
    ]);

    soundSynth.playCameraShutter();
  };

  // Handler for Socket 4 (Memory cache simulation)
  const handleSocket4MemorySync = () => {
    const mockTime = new Date().toLocaleTimeString();
    setSocketTraffic(prev => ({
      ...prev,
      socket_4_memory: {
        ...prev.socket_4_memory,
        packets: prev.socket_4_memory.packets + 1,
        bytes: prev.socket_4_memory.bytes + 412
      }
    }));

    setActiveSocketLogs(prev => [
      { time: mockTime, level: "SOCKET 4", msg: `💾 مزامنة الذاكرة: تم التحقق وحفظ صفات المستخدم وحقائق الجلسة التراكمية في الكاش المحلي.` },
      ...prev
    ]);

    soundSynth.playConnectionChime();
  };

  // Handler for Socket 7 (Speech voice synthesis trigger)
  const handleSocket7SpeechSweep = () => {
    const mockTime = new Date().toLocaleTimeString();
    setSocketTraffic(prev => ({
      ...prev,
      socket_7_speech: {
        ...prev.socket_7_speech,
        packets: prev.socket_7_speech.packets + 1,
        bytes: prev.socket_7_speech.bytes + 4800
      }
    }));

    setActiveSocketLogs(prev => [
      { time: mockTime, level: "SOCKET 7", msg: `🔊 توليد ومعايرة نبرة النطق الصوتي للريبوت (${activePersona.name}) بقدرة مجهرية.` },
      ...prev
    ]);

    // Synthesize physical sweep signal tones
    soundSynth.playSystemBeep();
    setTimeout(() => {
      soundSynth.playHydraulicMove(1);
    }, 300);
  };

  // Handler for Socket 8 (Direct JSON command injection)
  const handleSocket8CommandSend = async () => {
    try {
      const parsed = JSON.parse(socket8CommandJson);
      if (!parsed.command) {
        throw new Error("يجب احتواء كائن الـ JSON على مفتاح 'command' صالح.");
      }
      
      const timeSent = new Date().toLocaleTimeString();
      setActiveSocketLogs(prev => [
        { time: timeSent, level: "SOCKET 8", msg: `حقن كود JSON مباشر: [${parsed.command}] مع البارامترات: ${JSON.stringify(parsed.parameters || {})}` },
        ...prev
      ]);

      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: parsed.command,
          parameters: parsed.parameters || {}
        })
      });

      if (res.ok) {
        await fetchCommandsHistory();
        setSocketTraffic(prev => ({
          ...prev,
          socket_8_command: {
            ...prev.socket_8_command,
            packets: prev.socket_8_command.packets + 1,
            bytes: prev.socket_8_command.bytes + socket8CommandJson.length
          }
        }));
        
        setActiveSocketLogs(prev => [
          { time: new Date().toLocaleTimeString(), level: "SOCKET 8", msg: `✓ تم تأكيد استلام ومعالجة الأمر [${parsed.command}] بنجاح من المفاصل.` },
          ...prev
        ]);
        
        soundSynth.playConnectionChime();
      } else {
        throw new Error("استجابة غير صالحة من سيرفر البوابة.");
      }
    } catch (err: any) {
      setActiveSocketLogs(prev => [
        { time: new Date().toLocaleTimeString(), level: "SOCKET 8 ERROR", msg: `فشل قراءة أو إرسال JSON: ${err.message}` },
        ...prev
      ]);
      soundSynth.playAlarmWarning();
    }
  };

  const handleInjectBrokerCommand = async (commandName: string, params: any) => {
    setInjectingCmd(commandName);
    try {
      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandName,
          parameters: params
        })
      });
      if (res.ok) {
        await fetchCommandsHistory();
        
        // Execute physical feedback sound & telemetry simulator side-effects
        if (commandName === "ROTATE_YAW") {
          soundSynth.playHydraulicMove(2);
          updateSensors(prev => ({
            motion: { ...prev.motion, yaw: params.angle || 45 }
          }));
        } else if (commandName === "PITCH_TILT") {
          soundSynth.playHydraulicMove(1.5);
          updateSensors(prev => ({
            motion: { ...prev.motion, pitch: params.angle || -15 }
          }));
        } else if (commandName === "SCAN_ENVIRONMENT") {
          soundSynth.playCameraShutter();
        } else if (commandName === "CALIBRATE_ACCELEROMETER") {
          soundSynth.playConnectionChime();
          updateSensors(prev => ({
            motion: { ...prev.motion, roll: 0, pitch: 0, yaw: 0 },
            env: { ...prev.env, brightnessLux: 220 },
            fusion: { ...prev.fusion, stability_score: 1.0, isFallen: false, isDizzy: false, movement_state: "idle" }
          }));
        } else if (commandName === "BROADCAST_AUDIO") {
          soundSynth.playSystemBeep();
        } else if (commandName === "TRIGGER_ALARM") {
          soundSynth.playAlarmWarning();
          updateSensors(prev => ({
            fusion: { ...prev.fusion, isFallen: true, movement_state: "falling" }
          }));
        }
      }
    } catch (err) {
      console.error("Error inserting simulation broker command:", err);
    } finally {
      setTimeout(() => setInjectingCmd(null), 600);
    }
  };

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
          { id: "broker", label: "واجهة API الوسيط 📡", icon: Radio },
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

        {/* 0. INTERMEDIARY API BROKER COMMAND RECEIVER */}
        {activeTab === "broker" && (
          <div className="space-y-5 text-right font-sans" id="broker-tab-view" dir="rtl">
            
            {/* 1. Main Header Segment */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2.5 border-b border-slate-850 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>بوابة الاتصال الخارجي وإدارة المقابس الـ 8 النشطة (Global Active 8-Socket Control Room)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    التحكم المتكامل عالمياً بالريبوت عبر مصفوفة المقابس التفاعلية ذات الـ 8 قنوات (Active Routing Matrix) لتوجيه واستقبال البيانات اللحظية.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-2 w-2 rounded-full ${securityEnabled ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"}`} />
                  <span className={`text-[9px] font-mono font-bold bg-slate-900 border px-2 py-0.5 rounded uppercase ${
                    securityEnabled ? "border-amber-900 text-amber-450" : "border-emerald-900/40 text-emerald-400"
                  }`}>
                    {securityEnabled ? "مؤمن برمز ترخيص" : "مفتوح عالمياً بدون قيود"}
                  </span>
                </div>
              </div>

              {/* Dynamic Base URL & Global Status Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-right">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold block">رابط استدعاء بروتوكول التحكم (Endpoint URL)</span>
                    <span className="text-[9px] text-slate-500 font-mono">POST METHOD ENTRANCE</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg flex items-center gap-2 select-all overflow-x-auto text-left justify-start">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black font-mono">POST</span>
                    <span className="text-[10px] font-mono text-slate-200 whitespace-nowrap">{typeof window !== "undefined" ? window.location.origin : "https://ais-dev.run.app"}/api/commands</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal mt-2">
                    قم بإجراء استدعاء بروتوكول <code className="text-yellow-500 px-1 font-mono">POST</code> القياسي مع إرسال البارامترات المطلوبة، وسيقوم السيرفر المحرك للريبوت بمعالجة طلبك فورياً وبث ردود حركة فيزيائية وتلميحات صوتية مرنة. Only use HTTPS connection.
                  </p>
                </div>

                <div className="md:col-span-4 bg-slate-900/40 border border-slate-850 rounded-lg p-3 flex flex-col justify-between gap-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-1">📡 استهلاك البوابة الخارجية</h4>
                    <p className="text-[9.5px] text-slate-400 leading-relaxed">
                      تتولى هذه البوابة نقل حركات المفاصل الفيزيائية والمسح الليزري الفوري وأصوات الإنذار عبر واجهة API موحدة تدعم استقرار الهاتف من أي مكان.
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-slate-850 pt-1.5 text-slate-500">
                    <span>عدد الأوامر بالذاكرة:</span>
                    <span className="font-mono text-emerald-400 font-extrabold">{brokerCommands.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Security Management Suite Panel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex flex-col gap-4">
              <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>إدارة جدار الحماية وبروتوكول التراخيص والأمان العالمي (Global Security & Access Control)</span>
                </h3>
                <span className="text-[9px] text-slate-500 font-mono font-bold">SHA-256 Auth Node</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Security Setup Inputs (Left) */}
                <div className="md:col-span-5 bg-slate-900/30 border border-slate-850/70 p-3.5 rounded-lg flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    {/* Toggle Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <label className="text-xs font-bold text-slate-200 block">بروتوكول حماية البوابة (Enforce API Verification)</label>
                        <p className="text-[9px] text-slate-500 mt-0.5">عند تفعيله، سيتم رفض أي طلب خارجي لا يحتوي على الرمز السري الفوري الصحيح.</p>
                      </div>
                      <button
                        onClick={() => setSecurityEnabled(!securityEnabled)}
                        className={`w-11 h-6 rounded-full p-1 transition-all ${securityEnabled ? "bg-emerald-600 flex justify-end" : "bg-slate-800 flex justify-start"}`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all" />
                      </button>
                    </div>

                    {/* Token Key Input (conditional) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span>مفتاح التوثيق السري (Security API Token)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={apiToken}
                          onChange={(e) => setApiToken(e.target.value)}
                          placeholder="مثلاً: custom_robot_secret_key"
                          className="font-mono bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs text-left flex-grow focus:outline-none focus:border-blue-900"
                        />
                        <button
                          onClick={() => {
                            const newKey = "eye_ai_" + Math.random().toString(36).substring(2, 9).toUpperCase() + "_" + new Date().getFullYear();
                            setApiToken(newKey);
                          }}
                          className="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800 hover:text-white rounded text-[9px] font-mono"
                          title="توليد مفتاح عشوائي قوي"
                        >
                          توليد تلقائي
                        </button>
                      </div>
                      <p className="text-[8.5px] text-slate-500 leading-relaxed text-right">
                        * يرجى إرسال الرمز السري في الرأس <code className="bg-slate-950 font-mono px-1 py-0.5 rounded text-amber-500">Authorization: Bearer [رمزك]</code> أو مضافة كبرامتر في الرابط كـ <code className="bg-slate-950 font-mono px-1 py-0.5 rounded text-amber-500 text-[10px]">?token=[رمزك]</code>.
                      </p>
                    </div>
                  </div>

                  {/* Save Settings Trigger Button */}
                  <div className="pt-2 border-t border-slate-850">
                    <button
                      onClick={handleSaveBrokerSettings}
                      disabled={saveStatus === "saving"}
                      className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        saveStatus === "saving" ? "bg-slate-800 text-slate-400 cursor-not-allowed" :
                        saveStatus === "success" ? "bg-emerald-600 text-white shadow" :
                        saveStatus === "error" ? "bg-rose-600 text-white" :
                        "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {saveStatus === "saving" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {saveStatus === "success" && <Check className="w-3.5 h-3.5" />}
                      <span>
                        {saveStatus === "saving" ? "جاري الحفظ والتحميل..." :
                         saveStatus === "success" ? "تم الحفظ والتشغيل الفوري! 🎉" :
                         saveStatus === "error" ? "خطأ في الاتصال بالسيرفر" :
                         "حفظ وتطبيق إعدادات جدار الحماية عالمياً"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Pre-made Developer Snippets Section (Right) */}
                <div className="md:col-span-7 bg-slate-900/30 border border-slate-850/70 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1 border-b border-slate-850 pb-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-blue-500" />
                        <span>رموز التكامل والتشغيل المباشر من سطر التعليمات (Global SDK Codes)</span>
                      </span>
                      <span className="text-[9px] text-slate-500">Auto generated with your secret</span>
                    </h4>

                    {/* Mini Code Snippets Tabs */}
                    <div className="flex gap-1.5 border-b border-slate-850/60 pb-1.5">
                      {[
                        { id: "curl", label: "cURL / Bash" },
                        { id: "python", label: "Python Requests" },
                        { id: "node", label: "Node.js" },
                        { id: "powershell", label: "PowerShell" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setCopiedPlatform(tab.id);
                            // Auto copied text buffer
                            let codeToCopy = "";
                            const currentURL = typeof window !== "undefined" ? window.location.origin : "https://ais-dev.run.app";
                            if (tab.id === "curl") {
                               codeToCopy = `curl -X POST "${currentURL}/api/commands${securityEnabled ? `?token=${apiToken}` : ""}" \\\n  -H "Content-Type: application/json" \\\n  ${securityEnabled ? `-H "Authorization: Bearer ${apiToken}" \\\n  ` : ""}-d '{"command": "ROTATE_YAW", "parameters": {"angle": 45.0}}'`;
                            } else if (tab.id === "python") {
                               codeToCopy = `import requests\n\nurl = "${currentURL}/api/commands"\nheaders = {\n    "Content-Type": "application/json",\n    ${securityEnabled ? `"Authorization": "Bearer ${apiToken}"` : ""}\n}\n\npayload = {\n    "command": "ROTATE_YAW",\n    "parameters": {"angle": 55.0}\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
                            } else if (tab.id === "node") {
                               codeToCopy = `fetch("${currentURL}/api/commands", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    ${securityEnabled ? `"Authorization": "Bearer ${apiToken}"` : ""}\n  },\n  body: JSON.stringify({\n    command: "ROTATE_YAW",\n    parameters: { angle: 55.0 }\n  })\n}).then(res => res.json()).then(console.log);`;
                            } else if (tab.id === "powershell") {
                               codeToCopy = `Invoke-RestMethod -Uri "${currentURL}/api/commands" -Method Post -ContentType "application/json" ${securityEnabled ? `-Headers @{ Authorization = "Bearer ${apiToken}" } ` : ""}-Body '{"command": "ROTATE_YAW", "parameters": {"angle": 45.0}}'`;
                            }
                            navigator.clipboard.writeText(codeToCopy);
                            setTimeout(() => setCopiedPlatform(null), 2000);
                          }}
                          className={`px-2.5 py-1 text-[9px] rounded font-bold transition-all border ${
                            copiedPlatform === tab.id ? "bg-emerald-950 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                          }`}
                        >
                          {copiedPlatform === tab.id ? "✓ تم نسخ الكود" : tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Live Preview Code Block container */}
                    <div className="mt-2.5 bg-slate-950 p-2 text-left rounded-lg border border-slate-850 font-mono text-[8.5px] text-emerald-400 overflow-x-auto select-all max-h-[140px] leading-relaxed">
                      {`# cURL Post Request
curl -X POST "${typeof window !== "undefined" ? window.location.origin : "https://ais-dev.run.app"}/api/commands${securityEnabled ? `?token=${apiToken}` : ""}" \\
  -H "Content-Type: application/json" \\
  ${securityEnabled ? `-H "Authorization: Bearer ${apiToken}" \\\n  ` : ""}-d '{
    "command": "ROTATE_YAW",
    "parameters": { "angle": 45.0 }
  }'`}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-850/50 flex justify-between items-center text-[9px] text-slate-500">
                    <span>* اضغط على أي منصة بالأعلى لنسخ الكود المناسب كاملاً مع الرمز السري الحالي الخاص بك.</span>
                  </div>
                </div>

              </div>
            </div>

            {/* NEW VISUAL 3: ACTIVE 8-SOCKET ROUTING MATRIX */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-850 mb-3">
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>مصفوفة المقابس التفاعلية ذات الـ 8 قنوات (Interactive 8-Socket Active Router Matrix)</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">اضغط على أي مقبس أدناه لفتح واجهة الفحص الفوري والتحاكي المباشرة المتكاملة.</p>
                </div>
                <span className="text-[9px] text-slate-500 font-mono font-bold">8 CHANNELS SYSTEM</span>
              </div>

              {/* Grid representation of the 8 Sockets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "socket_1_text_in", title: "مقبس 1: مدخل النصوص (Text-In)", desc: "مجرى نصوص وتوجيهات المستخدم", rate: "Bidirectional", color: "from-blue-600/10 to-blue-900/10 border-blue-900/40 hover:border-blue-500" },
                  { id: "socket_2_text_out", title: "مقبس 2: مخرج الردود (Text-Out)", desc: "مجرى ردود وحالات عقل الذكاء", rate: "AI ➔ Client", color: "from-emerald-600/10 to-emerald-900/10 border-emerald-900/40 hover:border-emerald-500" },
                  { id: "socket_3_vision", title: "مقبس 3: كاشف البصر (Vision-In)", desc: "بث صور الكاميرا المشفرة JPEG", rate: "Camera ➔ AI", color: "from-cyan-605/10 to-cyan-900/10 border-cyan-900/40 hover:border-cyan-500" },
                  { id: "socket_4_memory", title: "مقبس 4: مزامنة الذاكرة (Memory)", desc: "حفظ الكاش والتاريخ التراكمي", rate: "All-Way Sync", color: "from-purple-600/10 to-purple-900/10 border-purple-900/40 hover:border-purple-500" },
                  { id: "socket_5_movement", title: "مقبس 5: محركات المفاصل (Actuators)", desc: "تحريك المحاور والزوايا الميكانيكية", rate: "AI ➔ Servo", color: "from-orange-600/10 to-orange-900/10 border-orange-900/40 hover:border-orange-500" },
                  { id: "socket_6_sensors", title: "مقبس 6: دفق المستشعرات (Sensors)", desc: "بث تمايل الجيروسكوب والمسافة ليزرياً", rate: "Body ➔ AI", color: "from-amber-600/10 to-amber-900/10 border-amber-900/40 hover:border-amber-500" },
                  { id: "socket_7_speech", title: "مقبس 7: النطق الصوتي (Speech)", desc: "مزامنة النبرة والأفعال السمعية", rate: "Duplex Audio", color: "from-rose-600/10 to-rose-900/10 border-rose-900/40 hover:border-rose-500" },
                  { id: "socket_8_command", title: "مقبس 8: قناة الأوامر (Direct-Cmd)", desc: "إطلاق أوامر بروتوكولية يدوية ميكانيكية", rate: "JSON API Only", color: "from-indigo-600/10 to-indigo-900/10 border-indigo-900/40 hover:border-indigo-500" },
                ].map(s => {
                  const data = socketTraffic[s.id] || { packets: 0, bytes: 0, status: "Connected" };
                  const isSelected = selectedSocket === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSocket(s.id);
                        soundSynth.playConnectionChime();
                      }}
                      className={`text-right p-2.5 rounded-lg border bg-gradient-to-br transition-all flex flex-col justify-between gap-1.5 transform active:scale-95 ${s.color} ${
                        isSelected ? "border-white bg-slate-900 shadow-lg ring-1 ring-emerald-500" : "bg-slate-950"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-emerald-400 animate-ping" : "bg-slate-450 animate-pulse"}`} />
                        <span className="text-[8px] font-mono font-bold bg-slate-900 px-1 py-0.1 border border-slate-800 rounded text-slate-400">
                          {s.rate}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-100">{s.title}</h4>
                        <p className="text-[8px] text-slate-400 line-clamp-1">{s.desc}</p>
                      </div>

                      <div className="flex justify-between items-center text-[8px] font-mono border-t border-slate-900 pt-1 text-slate-500">
                        <span>Packs: <strong className="text-slate-350">{data.packets}</strong></span>
                        <span>Size: <strong className="text-slate-350">{(data.bytes / 1024).toFixed(1)} KB</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. ACTIVE DIAGNOSTIC CONSOLE (CHANGES DYNAMICALLY WITH CURRENT SELECTION) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850">
              
              {/* Dynamic Slot Diagnostics headers */}
              {selectedSocket === "socket_1_text_in" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>فحص المقبس 1: مجرى توجيه نصوص المستخدم الذكية (Text-In Port)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_1_duplex</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    منفذ البث اليدوي لنص المستخدم إلى معالج الذكاء الاصطناعي. عند الإرسال، سيتولى النموذج استدعاء الجيروسكوب ودرجة حرارة البطارية والرد عليك فوراً في وحدة التحكم.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-350">أدخل صلب نص الطلب للمحاكاة (Socket Message Input):</label>
                      <input
                        type="text"
                        value={socket1TextInput}
                        onChange={(e) => setSocket1TextInput(e.target.value)}
                        placeholder="مثال: كيف تبدو الإضاءة حولك الآن؟ أو هل استقرار توازنك سليم؟"
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-900"
                        onKeyDown={(e) => { if (e.key === "Enter") handleSocket1Send(); }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] text-slate-400">* سيتم تجميع الطلب بـ JSON وبث حزمته عبر شبكة السيرفر فورياً.</span>
                      <button
                        onClick={handleSocket1Send}
                        className="py-1 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        <span>🚀 إطلاق بث المقبس 1</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_2_text_out" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>فحص المقبس 2: كاشف ردود العقل وتلميحات الـ AI اللحظية (Smart Inference Gate)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_2_ai_stream</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    هذا المقبس مخصص لاستقبال الحزم التي ينتجها معالج الاستدلال السحابي لـ Gemini. يعبر عن الحالة النفسية للريبوت، ونوع التحليل الدلالي، ومعدلات الأولوية.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex flex-col justify-between">
                      <span className="text-[9px] text-emerald-400 font-bold block mb-1">المشاعر الحالية المقروءة:</span>
                      <span className="text-xs font-mono font-bold text-white uppercase">{lastAnalysis?.emotion || "CALM (هادئ)"}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex flex-col justify-between">
                      <span className="text-[9px] text-emerald-400 font-bold block mb-1">النية الدلالية المكتشفة:</span>
                      <span className="text-xs font-bold text-white">{lastAnalysis?.intent || "STANDBY (انتظار)"}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-855 flex flex-col justify-between">
                      <span className="text-[9px] text-emerald-400 font-bold block mb-1">سرعة استجابة السلك الصادر:</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{lastAnalysis?.latencyMs || 0} ms</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_3_vision" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>فحص المقبس 3: بوابة دفق العدسة والتحاكي البصري (Vision Stream Deck)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_3_camera</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    مسؤول عن تشفير والتقاط دفق العدسة البصرية وتحويلها إلى ثنائيات Base64 مضافة لمجرى المعالجة لتوفير وعي مكاني مجهري محكم.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-350 block">حالة البث الكاشف الحالي</span>
                      <p className="text-[9px] text-slate-400 mt-1">تردد الترميز: JPEG Chunk @ 22 FPS | محاذاة عيون الكامرا متزنة</p>
                    </div>
                    <button
                      onClick={handleSocket3VisionSend}
                      className="py-1 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📸 التقاط وإطلاق حزمة مرئية</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_4_memory" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      <span>فحص المقبس 4: بوابة مزامنة كاش الذاكرة التراكمية الطويلة (Core DB Sync)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_4_cache</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    منصة المزامنة التلقائية للبيانات الدلالية المستخلصة من الجلسة. يتم تشفير واجهة كاش الذاكرة وتخريجها للخصائص الخارجية لضمان تماسك عقل الريبوت عبر الجلسات.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9.5px] text-slate-300">
                      <div className="p-2 rounded bg-slate-950 border border-slate-850">
                        <strong className="text-purple-450 block mb-0.5">الاهتمامات المكتشفة بالذاكرة:</strong>
                        <span>{userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.join(" - ") : "لا يوجد اهتمامات مرصودة بالذاكرة الحالية"}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-850">
                        <strong className="text-purple-450 block mb-0.5">اسم المستثمر المسجل:</strong>
                        <span>{userProfile.name || "عابر سبيل مجهول"}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400">عدد الحقائق المتراكمة: {userProfile.known_facts?.length || 0} حقيقة مثبتة</span>
                      <button
                        onClick={handleSocket4MemorySync}
                        className="py-1 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>💾 تدوين ومزامنة الذاكرة</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_5_movement" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" />
                      <span>فحص المقبس 5: بث الأوامر الحركية وسيرفو المفاصل الميكانيكية (Joint Actuators Hub)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_5_actuate</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    منفذ بث الإحداثيات الحركية والزوايا الدائرية لست ذراعي وسيرفو الريبوت. تحويل قياسات التمايل إلى زوايا ميكانيكية حقيقية ملموسة.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex flex-col justify-between items-center text-center">
                      <span className="text-[9px] text-orange-400 font-bold block mb-1">دوران Yaw (أفقي)</span>
                      <span className="text-sm font-mono font-bold text-white">{telemetry.motion.yaw.toFixed(1)}°</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, Math.max(0, ((telemetry.motion.yaw + 180) / 360) * 100))}%` }} />
                      </div>
                    </div>
                    
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex flex-col justify-between items-center text-center">
                      <span className="text-[9px] text-orange-400 font-bold block mb-1">ارتفاع Pitch (رأسي)</span>
                      <span className="text-sm font-mono font-bold text-white">{telemetry.motion.pitch.toFixed(1)}°</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, Math.max(0, ((telemetry.motion.pitch + 90) / 180) * 100))}%` }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex flex-col justify-between items-center text-center">
                      <span className="text-[9px] text-orange-400 font-bold block mb-1">انقلاب Roll (محاذاة)</span>
                      <span className="text-sm font-mono font-bold text-white">{telemetry.motion.roll.toFixed(1)}°</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${Math.min(100, Math.max(0, ((telemetry.motion.roll + 90) / 180) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_6_sensors" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" />
                      <span>فحص المقبس 6: دفق مستشعرات الجسد والاتزان اللحظي (Body Sensors Ingress)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_6_sensors</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    منصة مراقبة واستقبال البيانات الخام من مستشعر التسارع، وجيروسكوب الهاتف، والإضاءة المحيطة، ونسبة شحن البطارية.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-amber-300 block">دفق بث المستشعرات المتغير المستمر:</span>
                      <p className="text-[9px] text-slate-400 mt-1">عند التفعيل، سيتم دفق البيانات تلقائياً وتحديث كروكي التمايز والمخططات المرئية فورياً.</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsStreamingSensors(!isStreamingSensors);
                        soundSynth.playConnectionChime();
                      }}
                      className={`text-[10px] font-bold py-1.5 px-3 rounded border transition-all flex items-center gap-2 ${
                        isStreamingSensors ? "bg-amber-950/40 border-amber-500 text-amber-400 animate-pulse" : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isStreamingSensors ? "bg-amber-400 animate-ping" : "bg-slate-400"}`} />
                      <span>{isStreamingSensors ? "مستوى البث: نشط" : "تفعيل البث اللحظي"}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_7_speech" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-rose-450 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-rose-500" />
                      <span>فحص المقبس 7: نطق الردود الصادرة ومزامنة النبرة (Text-To-Speech Synthesis)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_7_audio</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    مجرى إرسال واستقبال التحويل الفوري للنصوص إلى نبرات صوتية ميكانيكية. يتحكم في تمايل التردد الصوتي ودرجة الصوت لتطوير تفاعل بشري ومرئي طبيعي.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-3">
                    <div className="h-8 bg-slate-950 border border-slate-850 rounded flex items-center justify-center gap-1 overflow-hidden">
                      {/* Interactive Css Soundwave representation */}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                        <div
                          key={i}
                          className="w-1 bg-rose-500 rounded-full animate-pulse"
                          style={{
                            height: `${30 + Math.sin(i + (typeof window !== "undefined" ? Date.now() / 200 : 0)) * 60}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] text-slate-400">بروتوكول الترميز: Web Audio Waveguide synth synthesis.</span>
                      <button
                        onClick={handleSocket7SpeechSweep}
                        className="py-1 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>🔊 فحص رنين الصوت</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedSocket === "socket_8_command" && (
                <div className="space-y-3.5">
                  <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
                    <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-500" />
                      <span>فحص المقبس 8: كنسول وحاقن أكواد JSON المباشرة (Command Protocol Node)</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">active_port_8_json</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    قالب التحكم المباشر عبر الهياكل البرمجية الصريحة. أدخل كائن الـ JSON الخاص بالريموت واختبر مدى استجابته وموافقة جدار حماية البوابة.
                  </p>
                  
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-3">
                    <textarea
                      value={socket8CommandJson}
                      onChange={(e) => setSocket8CommandJson(e.target.value)}
                      rows={4}
                      className="w-full font-mono text-[10px] bg-slate-950 border border-slate-800 rounded p-2 text-indigo-300 focus:outline-none focus:border-indigo-900 leading-relaxed"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] text-slate-400">* يدعم الأوامر القياسية: <code className="bg-slate-950 px-1 text-slate-300">ROTATE_YAW</code>, <code className="bg-slate-950 px-1 text-slate-300">TRIGGER_ALARM</code>, <code className="bg-slate-950 px-1 text-slate-300">CALIBRATE_ACCELEROMETER</code>.</span>
                      <button
                        onClick={handleSocket8CommandSend}
                        className="py-1 px-4 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>⚡ إطلاق وحقن JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* JS Integration snippet block requested by user */}
              <div className="pt-3.5 border-t border-slate-900/80">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <span className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1.5 font-sans">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>كود الدمج والاتصال لـ {
                      selectedSocket === "socket_1_text_in" ? "المقبس 1 (Text-In)" :
                      selectedSocket === "socket_2_text_out" ? "المقبس 2 (Text-Out)" :
                      selectedSocket === "socket_3_vision" ? "المقبس 3 (Vision-In)" :
                      selectedSocket === "socket_4_memory" ? "المقبس 4 (Memory)" :
                      selectedSocket === "socket_5_movement" ? "المقبس 5 (Actuators)" :
                      selectedSocket === "socket_6_sensors" ? "المقبس 6 (Sensors)" :
                      selectedSocket === "socket_7_speech" ? "المقبس 7 (Speech)" : "المقبس 8 (Direct-Cmd)"
                    } (JavaScript Integration SDK)</span>
                  </span>
                  
                  <button
                    onClick={() => {
                      const code = getSocketJsCode(selectedSocket);
                      navigator.clipboard.writeText(code);
                      setCopiedSocketCode(selectedSocket);
                      setTimeout(() => setCopiedSocketCode(null), 2000);
                      soundSynth.playConnectionChime();
                    }}
                    className={`text-[9.5px] font-black px-2.5 py-1 rounded border transition-all flex items-center gap-1.5 ${
                      copiedSocketCode === selectedSocket 
                        ? "bg-emerald-950 border-emerald-550 text-emerald-400" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-755 text-slate-400 hover:text-white"
                    }`}
                  >
                    {copiedSocketCode === selectedSocket ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                        <span>تم نسخ كود المقبس!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ كود الـ JS للمقبس</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre dir="ltr" className="bg-slate-950 border border-slate-900 p-3 rounded-lg font-mono text-[9.5px] text-emerald-400 overflow-x-auto text-left leading-relaxed select-text max-h-[140px] scrollbar-thin">
                    <code>{getSocketJsCode(selectedSocket)}</code>
                  </pre>
                  <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-slate-600 select-none">
                    ECMAScript 6 // Native Fetch API // API_PORT:3000
                  </div>
                </div>
              </div>

            </div>

            {/* 5. DIAGNOSTICS & TELEMETRY TERMINAL INTERACTIVE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-1">
              
              {/* Left Column: API Routing Tracer Terminal Log */}
              <div className="lg:col-span-5 border border-slate-850 bg-slate-900/40 p-4 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5 pb-1 border-b border-slate-850 justify-between font-sans">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>قناة تعقب المقابس النشطة (System Socket Router Logs)</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveSocketLogs([{ time: new Date().toLocaleTimeString(), level: "SYSTEM", msg: "تم تصفير سجلات تتبع المقابس الموحدة." }]);
                        soundSynth.playConnectionChime();
                      }}
                      className="text-[8.5px] text-slate-500 hover:text-white px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850"
                    >
                      تصفير
                    </button>
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                    منفذ الحزم المار بشكل حي ومباشر عبر خاورزمية المقابس الـ 8 الموحدة (Live Socket Tracker):
                  </p>

                  <div className="bg-slate-950 rounded border border-slate-85 pointer-events-auto p-2 font-mono text-[9px] text-cyan-400 overflow-y-auto max-h-[190px] text-left select-text space-y-1.5 scrollbar-thin">
                    {activeSocketLogs.map((log, index) => (
                      <div key={index} className="flex gap-2 items-start leading-normal text-slate-300">
                        <span className="text-slate-500 text-[8px] whitespace-nowrap">[{log.time}]</span>
                        <span className={`text-[8px] px-1 font-bold rounded flex-shrink-0 ${
                          log.level.includes("ERROR") ? "bg-red-950 border border-red-900 text-red-500" :
                          log.level.includes("SOCKET 6") ? "bg-amber-955 text-amber-400" :
                          log.level.includes("SOCKET 1") ? "bg-blue-955 text-blue-400" :
                          log.level.includes("SOCKET 2") ? "bg-emerald-955 text-emerald-400" :
                          "bg-slate-900 text-slate-400"
                        }`}>{log.level}</span>
                        <span className="text-slate-200 text-[9.5px]">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-1 pt-2 border-t border-slate-850 flex items-center justify-between text-[8px] font-mono text-slate-500">
                  <span>SOCKETS PORT: 3000 // DECA_CORES</span>
                  <span className="text-emerald-500 animate-pulse font-sans">بوابات الدفق الـ 8 متصلة ونشطة</span>
                </div>
              </div>

              {/* Right Column: Live Received Physical Commands Console (Original Logic) */}
              <div className="lg:col-span-7 border border-slate-850 bg-slate-900/40 p-4 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-850">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>سجل البوابة الخارجية للأوامر المعالجة (Live Command Ingress History)</span>
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={fetchCommandsHistory}
                        className="p-1 hover:text-white text-slate-400 hover:bg-slate-850 rounded transition-all"
                        title="تحديث البيانات فورياً"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setIsPollingBroker(!isPollingBroker)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                          isPollingBroker ? "bg-emerald-950/20 border-emerald-900 text-emerald-450" : "bg-slate-950 border-slate-850 text-slate-400"
                        }`}
                      >
                        {isPollingBroker ? "مزامنة الاستدعاء: متصل" : "مزامنة الاستدعاء: معطل"}
                      </button>
                    </div>
                  </div>

                  {/* Commands History Output log block */}
                  <div className="bg-slate-950 rounded border border-slate-850/60 p-2 font-mono text-[9.5px] text-emerald-400 overflow-y-auto max-h-[190px] text-left select-text space-y-2.5 scrollbar-thin">
                    {brokerCommands.length === 0 ? (
                      <div className="text-slate-500 text-center py-6 animate-pulse" dir="rtl">
                        بانتظار استقبال أوامر هيدروليكية أو جيروسكوبية عبر بروتوكول الـ API الخارجي...
                      </div>
                    ) : (
                      brokerCommands.map((cmd, index) => (
                        <div key={cmd.id || index} className="p-2 rounded bg-slate-900/50 border border-slate-850 flex flex-col gap-1 hover:bg-slate-900 transition-all">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-white bg-blue-900/30 px-1 py-0.5 rounded uppercase">
                                {cmd.command}
                              </span>
                              <span className="text-[8px] text-slate-500">ID: {cmd.id}</span>
                            </div>
                            <span className="text-[8px] text-emerald-500 bg-emerald-950/50 border border-emerald-900/50 px-1 py-0.5 rounded">
                              {cmd.status}
                            </span>
                          </div>
                          
                          <div className="text-[9px] text-slate-300 mt-1">
                            <strong>البارامترات المعالجة:</strong>{" "}
                            <span className="text-yellow-450 font-semibold">{JSON.stringify(cmd.parameters)}</span>
                          </div>

                          <div className="flex justify-between items-center text-[7.5px] text-slate-500 mt-1 pt-1 border-t border-slate-900/50">
                            <span>المرسل: {cmd.sender}</span>
                            <span>{new Date(cmd.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 text-[8px] font-mono p-1 rounded border border-slate-850 text-slate-400 text-left">
                  [GATEWAY_SEC]: HOST {typeof window !== "undefined" ? window.location.host : "localhost"} | API_PORT 3000 | REALTIME
                </div>
              </div>

            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-850 pt-3">
                
                {/* Roll & Pitch (Euler balance angles) - Col Span 3 */}
                <div className="space-y-2.5 md:col-span-3">
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    زوايا ميل الهاتف اللحظية (Tilt Euler Angles)
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

                {/* Light Lux, Altitude & Pressure - Col Span 3 */}
                <div className="space-y-2.5 md:col-span-3">
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    المحيط البيئي للمستشعرات (Environmental Sensors)
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

                {/* Carry states and Pocket Proximity toggler - Col Span 3 */}
                <div className="space-y-2.5 md:col-span-3">
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    محل الإرساء والقرب (Placement & Proximity)
                  </span>

                  <div className="space-y-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 text-xs text-right">
                    <div>
                      <label className="block text-[9px] text-slate-500 mb-1 uppercase text-right">محل حمل الهاتف (Carrying placement):</label>
                      <select
                        value={telemetry?.fusion?.carrying_state}
                        onChange={(e) => updateSensors(prev => ({
                          fusion: { ...prev.fusion, carrying_state: e.target.value as any }
                        }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-right text-white focus:outline-none"
                      >
                        <option value="hand">🤚 في اليد</option>
                        <option value="pocket">👖 في الجيب</option>
                        <option value="bag">👜 داخل الحقيبة</option>
                        <option value="car_mount">🚗 مثبت على منصة السيارة</option>
                        <option value="table">💻 مستند على طاولة العمل</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-1 gap-2">
                      <span className="text-[10px] text-slate-400">القرب للوجه/الجيب:</span>
                      <button
                        onClick={() => updateSensors(prev => ({
                          env: { ...prev.env, near: !prev.env.near, distanceCm: prev.env.near ? 8 : 1.5 }
                        }))}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                          telemetry?.env?.near ? "bg-red-950 border border-red-800 text-red-400 animate-pulse" : "bg-slate-950 border border-slate-800 text-slate-450"
                        }`}
                      >
                        {telemetry?.env?.near ? "قريب جداً" : "بعيد"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Precision Artificial Horizon & Gyro gauge simulator - Col Span 3 */}
                <div className="space-y-2.5 md:col-span-3">
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                    جيروسكوب ومستوى الأفق المستوي (Horizon Gauge)
                  </span>

                  <div className="flex flex-col items-center justify-center bg-slate-900/50 p-2 rounded-lg border border-slate-900 h-[106px] relative overflow-hidden">
                    {/* Crosshairs */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-full h-[0.5px] bg-cyan-400" />
                      <div className="h-full w-[0.5px] bg-cyan-400 absolute" />
                    </div>

                    {/* Horizon Level simulation bar */}
                    <div 
                      className="absolute w-24 h-[1.5px] bg-emerald-500/80 transition-transform duration-300 pointer-events-none"
                      style={{
                        transform: `rotate(${-((telemetry?.motion?.roll ?? 0))}deg) translateY(${((telemetry?.motion?.pitch ?? 0) / 90) * 16}px)`
                      }}
                    />

                    {/* Circular radar dial */}
                    <div className="w-14 h-14 rounded-full border border-slate-800 flex items-center justify-center relative bg-slate-950/40">
                      <div className="w-8 h-8 rounded-full border border-slate-900/40 border-dashed" />
                      <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-950" />

                      {/* Bubble Level node representation */}
                      <div 
                        className={`absolute w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg pointer-events-none ${
                          telemetry?.fusion?.isFallen ? "bg-red-500 shadow-red-500/50" : telemetry?.fusion?.isDizzy ? "bg-purple-500 shadow-purple-500/50" : "bg-amber-400 shadow-amber-400/55"
                        }`}
                        style={{
                          transform: `translate(${Math.max(-20, Math.min(20, (telemetry?.motion?.roll ?? 0) / 90 * 20))}px, ${Math.max(-20, Math.min(20, (telemetry?.motion?.pitch ?? 0) / 90 * 20))}px)`
                        }}
                      />
                    </div>

                    {/* Telemetry Status text overlays */}
                    <div className="absolute bottom-1 right-2 left-2 flex justify-between text-[8px] font-mono text-slate-500" dir="ltr">
                      <span>STAB: {Math.round((telemetry?.fusion?.stability_score ?? 0.98) * 100)}%</span>
                      <span className={telemetry?.fusion?.isFallen ? "text-red-400 font-bold" : telemetry?.fusion?.isDizzy ? "text-purple-400 font-bold" : "text-emerald-400"}>
                        {telemetry?.fusion?.isFallen ? "FALL DETECTED" : telemetry?.fusion?.isDizzy ? "SHAKING / HIGH" : "LEVEL BALANCE"}
                      </span>
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
