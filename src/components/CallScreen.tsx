import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, Phone, Send, Keyboard, Shield,Settings, Eye, EyeOff, 
  Compass, Map, ShieldAlert, Navigation, Sliders, Play, AlertCircle, Camera
} from "lucide-react";
import { Persona, UserProfile, Message, TelemetryData } from "../types";

interface CallScreenProps {
  currentCallState: "idle" | "listening" | "thinking" | "speaking";
  activePersona: Persona;
  userProfile: UserProfile;
  messages: Message[];
  statusText: string;
  liveTranscript: string;
  onToggleMic: () => void;
  onEndCall: () => void;
  onSendMessage: (text: string) => void;
  onSettingsClick: () => void;
  incognitoMode: boolean;
  quotaExceeded?: boolean;
  telemetry: TelemetryData;
  setTelemetry?: React.Dispatch<React.SetStateAction<TelemetryData>>;
  onAnalyzeTrigger?: () => void; // Manual "Capture and Analyse" click
  isFlippedCamera?: boolean;
}

export default function CallScreen({
  currentCallState,
  activePersona,
  userProfile,
  messages,
  statusText,
  liveTranscript,
  onToggleMic,
  onEndCall,
  onSendMessage,
  onSettingsClick,
  incognitoMode,
  quotaExceeded = false,
  telemetry,
  setTelemetry,
  onAnalyzeTrigger,
  isFlippedCamera = false,
}: CallScreenProps) {
  const [inputText, setInputText] = useState("");
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [callTimer, setCallTimer] = useState("00:00");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // HUD Elements references
  const canvasWaveRef = useRef<HTMLCanvasElement>(null);
  const canvasParticlesRef = useRef<HTMLCanvasElement>(null);
  const canvasRadarRef = useRef<HTMLCanvasElement>(null);
  const canvasMiniMapRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);

  const roll = telemetry?.fusion?.orientation_euler?.roll || 0;
  const pitch = telemetry?.fusion?.orientation_euler?.pitch || 0;
  const yaw = telemetry?.fusion?.orientation_euler?.yaw || 0;
  const speed = telemetry?.gps?.speed || 0;
  const heading = telemetry?.gps?.heading || 0;
  const stability = telemetry?.fusion?.stability_score ?? 1;
  const movementState = telemetry?.fusion?.movement_state || "idle";

  // 1. Call timer duration
  useEffect(() => {
    if (currentCallState !== "idle") {
      durationRef.current = 0;
      setCallTimer("00:00");
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        const mins = Math.floor(durationRef.current / 60).toString().padStart(2, "0");
        const secs = (durationRef.current % 60).toString().padStart(2, "0");
        setCallTimer(`${mins}:${secs}`);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      durationRef.current = 0;
      setCallTimer("00:00");
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentCallState]);

  // 2. Camera video streaming access (Rear camera preferred for Vision SLA)
  useEffect(() => {
    if (cameraEnabled && currentCallState !== "idle") {
      const startCamera = async () => {
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: isFlippedCamera ? "user" : "environment" },
            audio: false
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setIsCameraActive(true);
        } catch (err) {
          console.warn("Camera hardware permissions denied, engaging simulated spatial scanning system.");
          setIsCameraActive(false);
        }
      };
      startCamera();
    } else {
      setIsCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraEnabled, currentCallState, isFlippedCamera]);

  // 3. Floating Particles Background Visualizer with Inertia & Velocity Friction
  useEffect(() => {
    const canvas = canvasParticlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; life: number }> = [];

    // Initialize 40 particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: Math.random() * 2 + 1,
        color: i % 2 === 0 ? "rgba(59, 130, 246, 0.4)" : "rgba(16, 185, 129, 0.4)",
        life: Math.random() * 50 + 50
      });
    }

    const updateParticles = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Map roll and pitch directly to acceleration gravity vectors
      // Roll: right-left tilt (~-45 to 45), Pitch: up-down tilt (~-45 to 45)
      const ax = (roll / 45) * 0.4;
      const ay = (pitch / 45) * 0.4;

      particles.forEach((p, idx) => {
        // Apply tilt physics (inertia + momentum)
        p.vx += ax + (Math.random() - 0.5) * 0.08;
        p.vy += ay + (Math.random() - 0.5) * 0.08;

        // Apply friction
        p.vx *= 0.95;
        p.vy *= 0.95;

        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce wrapping
        if (p.x < 0) { p.x = canvas.width; }
        if (p.x > canvas.width) { p.x = 0; }
        if (p.y < 0) { p.y = canvas.height; }
        if (p.y > canvas.height) { p.y = 0; }

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color.includes("59") ? "#3b82f6" : "#10b981";
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animId = requestAnimationFrame(updateParticles);
    };

    updateParticles();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [roll, pitch]);

  // 4. Virtual Spatial Radar Scanner Sweeper Canvas (Fallback when camera fails/off)
  useEffect(() => {
    const canvas = canvasRadarRef.current;
    if (!canvas || isCameraActive) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;
    const landmarks = [
      { r: 40, angle: 1.2, name: "المنزل" },
      { r: 80, angle: 3.8, name: "الحديقة" },
      { r: 110, angle: 5.5, name: "الجامعة" }
    ];

    const drawRadar = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxR = Math.min(cx, cy) - 10;

      // Draw cybernet grid background
      ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
      ctx.lineWidth = 1;
      for (let r = 20; r <= maxR; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
        ctx.stroke();
      }

      // Draw crosshairs axes
      ctx.strokeStyle = "rgba(30, 41, 59, 0.8)";
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
      ctx.stroke();

      // Sweeper arm line
      const sweepX = cx + Math.cos(sweepAngle) * maxR;
      const sweepY = cy + Math.sin(sweepAngle) * maxR;

      // Draw gradient scanner sweep wedge
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      grad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0.15)");

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - 0.4, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Active radar scan line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spin landmark indicators
      landmarks.forEach((l) => {
        const lx = cx + Math.cos(l.angle) * l.r;
        const ly = cy + Math.sin(l.angle) * l.r;

        // Pulse intensity depending on sweep distance
        const diff = Math.abs((sweepAngle % (Math.PI * 2)) - l.angle);
        const isActive = diff < 0.25;

        ctx.beginPath();
        ctx.arc(lx, ly, isActive ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#10b981" : "rgba(16, 185, 129, 0.4)";
        ctx.shadowBlur = isActive ? 8 : 0;
        ctx.shadowColor = "#10b981";
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isActive) {
          ctx.font = "8px 'Fira Code', monospace";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(l.name, lx + 8, ly + 2);
        }
      });

      // Show radar coordinates info
      ctx.font = "8px monospace";
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.fillText(`ROT_RATE: ${(roll / 10).toFixed(2)} rad/s`, 10, canvas.height - 10);
      ctx.fillText(`STABILITY: ${(stability * 100).toFixed(0)}%`, canvas.width - 90, canvas.height - 10);

      sweepAngle += 0.02 + (movementState === "running" ? 0.03 : movementState === "driving" ? 0.05 : 0);
      animId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isCameraActive, roll, movementState, stability]);

  // 5. Drawing the Interactive 2D Map Slice in standard Canvas
  useEffect(() => {
    const canvas = canvasMiniMapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lat = telemetry?.gps?.latitude || 35.1234;
    const lng = telemetry?.gps?.longitude || 38.4567;
    const headingDeg = telemetry?.gps?.heading || 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Draw coordinate grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    for (let x = 15; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 15; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Nearby virtual landmarks
    const locs = [
      { name: "المنزل", dx: -40, dy: -35, color: "#3b82f6" },
      { name: "الحديقة والممشى", dx: 30, dy: 30, color: "#10b981" },
      { name: "الجامعة", dx: -20, dy: 45, color: "#f59e0b" },
      { name: "مقهى القهوة المختصة", dx: 45, dy: -30, color: "#a855f7" }
    ];

    locs.forEach((loc) => {
      ctx.beginPath();
      ctx.arc(cx + loc.dx, cy + loc.dy, 4, 0, Math.PI * 2);
      ctx.fillStyle = loc.color;
      ctx.fill();

      ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
      ctx.font = "bold 7px sans-serif";
      ctx.fillText(loc.name, cx + loc.dx + 6, cy + loc.dy + 2);
    });

    // Draw active user FOV slice triangle corresponding to compass heading
    const angleRad = (headingDeg - 90) * (Math.PI / 180); // Adjusting so 0 is North (pointing up)
    const fovWidth = 40 * (Math.PI / 180); // 40 degrees FOV

    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 35, angleRad - fovWidth, angleRad + fovWidth);
    ctx.closePath();
    ctx.fill();

    // Draw camera direction vector ray
    ctx.strokeStyle = "rgba(59, 130, 246, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angleRad) * 35, cy + Math.sin(angleRad) * 35);
    ctx.stroke();

    // Active center anchor
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#3b82f6";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();

  }, [telemetry]);

  // Handle manual responsive resize for particles
  useEffect(() => {
    const handleResize = () => {
      const pCanvas = canvasParticlesRef.current;
      if (pCanvas && pCanvas.parentElement) {
        pCanvas.width = pCanvas.parentElement.clientWidth;
        pCanvas.height = pCanvas.parentElement.clientHeight || 260;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // UI helpers
  const getAvatarShadow = () => {
    switch (currentCallState) {
      case "listening":
        return "shadow-[0_0_30px_rgba(59,130,246,0.6)] border-blue-400";
      case "thinking":
        return "shadow-[0_0_30px_rgba(245,158,11,0.5)] border-amber-400";
      case "speaking":
        return "shadow-[0_0_45px_rgba(16,185,129,0.73)] border-emerald-400";
      default:
        return "shadow-xl border-slate-700 bg-slate-900/40";
    }
  };

  // SVG Animated Avatar with somatosensory physics representation
  const renderInteractiveAvatar = () => {
    let rollLimit = Math.max(-30, Math.min(30, roll));
    let pitchLimit = Math.max(-30, Math.min(30, pitch));

    const isShaking = movementState === "shaking";
    const isFalling = telemetry?.fusion?.isFallen;
    const isDizzy = telemetry?.fusion?.isDizzy;

    // Dynamics shakes vectors
    const shakeX = isShaking ? (Math.random() - 0.5) * 12 : 0;
    const shakeY = isShaking ? (Math.random() - 0.5) * 12 : 0;
    // Face elements depending on emotions
    let avatarEyeLeft = "O";
    let avatarEyeRight = "O";
    let avatarMouth = "v";
    let statusBg = "bg-slate-950/65";

    if (isFalling) {
      avatarEyeLeft = "x"; avatarEyeRight = "x"; avatarMouth = "o";
      statusBg = "bg-red-950/40 border border-red-500/40";
    } else if (isDizzy) {
      avatarEyeLeft = "@"; avatarEyeRight = "@"; avatarMouth = "c";
      statusBg = "bg-purple-950/40 border border-purple-500/20";
    } else if (isShaking) {
      avatarEyeLeft = "O"; avatarEyeRight = "O"; avatarMouth = "口";
      statusBg = "bg-yellow-950/45 border border-yellow-500/20";
    } else if (currentCallState === "speaking") {
      avatarEyeLeft = "^"; avatarEyeRight = "^"; avatarMouth = "D";
    } else if (currentCallState === "listening") {
      avatarEyeLeft = "·"; avatarEyeRight = "·"; avatarMouth = "‿";
    }

    return (
      <div 
        id="physical-avatar-character"
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) rotate(${rollLimit}deg) translateY(${pitchLimit / 3}px)`,
          transition: isShaking ? "none" : "transform 0.15s ease-out"
        }}
        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center relative p-1.5 transition-all outline outline-offset-4 outline-2 ${currentCallState === 'speaking' ? 'outline-emerald-500 animate-pulse' : currentCallState === 'listening' ? 'outline-blue-500' : 'outline-slate-800'} ${statusBg}`}
      >
        {/* Glow Halo */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          currentCallState === "listening" ? "shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]" :
          currentCallState === "speaking" ? "shadow-[inset_0_0_30px_rgba(16,185,129,0.4)]" : ""
        }`} />

        <div className="text-4xl select-none flex gap-1 relative z-10 font-mono tracking-tight">
          <span className={`${isShaking ? 'animate-bounce' : ''}`}>{avatarEyeLeft}</span>
          <span className="text-xl align-middle mx-0.5 mt-1">.</span>
          <span className={`${isShaking ? 'animate-bounce' : ''}`}>{avatarEyeRight}</span>
        </div>
        
        {/* Mouth mouth breathing element */}
        <div className={`text-base font-bold text-slate-305 mt-1 relative z-10 select-none ${currentCallState === "speaking" ? 'scale-y-125 text-emerald-400 font-serif' : ''}`}>
          {avatarMouth}
        </div>

        {/* Dynamic status string bottom badge inside avatar container */}
        <div className="absolute -bottom-1 whitespace-nowrap bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded text-[8px] font-bold font-sans">
          {isFalling ? "☠️ سقطت!" : isDizzy ? "🌀 دوار!" : isShaking ? "⚡ اهتزاز" : movementState === "running" ? "🏃 ركض!" : movementState === "driving" ? "🚗 قيادة" : "🧘 مستقر"}
        </div>
      </div>
    );
  };

  return (
    <div id="call-screen-container" className="relative flex flex-col w-full h-[650px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 shadow-2xl transition-all duration-300">
      
      {/* Top beautiful cyber glow line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

      {/* Top Header Information Panel */}
      <div className="flex justify-between items-center px-4 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800/80 text-[10px] text-slate-400 z-20">
        <div className="flex items-center gap-1.5 font-mono">
          <span className={`w-2 h-2 rounded-full ${currentCallState !== 'idle' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          {currentCallState !== 'idle' ? `${activePersona.name.toUpperCase()} (Haptic / GPS)` : 'OFFLINE MODE'}
        </div>
        <div className="flex items-center gap-2">
          {incognitoMode && (
            <span className="flex items-center gap-1 bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded border border-red-900/30 text-[8px]">
               وضع التخفي
            </span>
          )}
          <span className="font-mono text-slate-500">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main HUD Body with Visual Stage Layer */}
      <div className="flex-1 relative flex flex-col p-4 justify-between overflow-hidden z-10 text-right">
        
        {/* Background Particles Canvas drifting constantly */}
        <canvas ref={canvasParticlesRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0" />

        {/* Screen layout divided: Top HUD indicators & Cam visual overlay */}
        <div className="w-full flex justify-between items-start gap-2 z-10">
          
          {/* Top Left Mini HUD parameters */}
          <div className="flex flex-col gap-1 text-[9px] text-slate-400 font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 uppercase">GPS Accuracy:</span>
              <span className="text-white font-semibold">±${telemetry?.gps?.accuracy?.toFixed(0)}m</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 uppercase">Speed:</span>
              <span className="text-blue-400 font-bold">${(speed * 3.6).toFixed(1)} km/h</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 uppercase">Pitch / Roll:</span>
              <span className="text-emerald-400 text-left font-serif">${pitch.toFixed(0)}° / ${roll.toFixed(0)}°</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 uppercase">Pressure:</span>
              <span className="text-amber-400 text-left">${telemetry?.env?.pressureHpa?.toFixed(0)} hPa</span>
            </div>
          </div>

          {/* Persona visual block with call Timer */}
          <div className="text-center">
            <h3 id="caller-display-name" className="text-sm font-bold text-white tracking-wide">{activePersona.name}</h3>
            <p className="text-[9px] text-blue-400 font-medium bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30 tracking-tight inline-block mt-0.5 whitespace-nowrap">
              {activePersona.archetype}
            </p>
          </div>

          {/* Timer and Settings Gear */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 px-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {callTimer}
            </div>
            <button 
              onClick={onSettingsClick}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-500 hover:text-white transition-all transform hover:scale-105"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Center Screen: Interactive Camera / Vision Radar HUD Box */}
        <div className="w-full flex-1 min-h-[180px] my-3 select-none flex items-center justify-center relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
          
          {/* CAMERA HARDWARE PREVIEW LAYER */}
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-0 ${isCameraActive ? 'opacity-40' : 'opacity-0 pointer-events-none'}`} 
            playsInline 
            muted 
          />

          {/* SCANNER GRID overlay centered (Laser grid target) */}
          <div className="absolute inset-0 border border-blue-500/10 pointer-events-none flex items-center justify-center z-10">
            {/* Horizontal sweep laser pointer */}
            <div className="w-full h-[1px] bg-blue-500/20 absolute top-1/4 left-0 animate-pulse" />
            <div className="w-[1px] h-full bg-blue-500/20 absolute left-1/4 top-0 animate-pulse" />
            
            {/* Holographic frame details */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-blue-500/30 w-3 h-3" />
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-blue-500/30 w-3 h-3" />
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-blue-500/30 w-3 h-3" />
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-blue-500/30 w-3 h-3" />
          </div>

          {/* RADAR SWEEPER SCREEN (Fallback drawing when camera is unsupported/denied) */}
          {!isCameraActive && (
            <canvas ref={canvasRadarRef} className="absolute inset-0 w-full h-full z-0 opacity-80" />
          )}

          {/* DYNAMIC 3D SPIRIT LEVEL bubble indicator (Float transparent core) */}
          <div className="absolute flex items-center justify-center select-none cursor-grab active:cursor-grabbing pointer-events-auto z-10 bottom-2 right-2 p-1.5 bg-slate-950/80 rounded-lg border border-slate-800" title="مؤشر ميزان التوازن ثلاثي الأبعاد ودرجة الميلان">
            <div className="relative w-12 h-12 rounded-full border border-slate-700/60 flex items-center justify-center">
              {/* Center crosshair dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-slate-850 absolute" />
              {/* Inner range ring */}
              <div className="w-6 h-6 rounded-full border border-dashed border-slate-800 absolute" />
              {/* Rolling Bubble sphere offset calculated */}
              <div 
                style={{
                  transform: `translate(${Math.max(-20, Math.min(20, roll / 2.2))}px, ${Math.max(-20, Math.min(20, pitch / 2.2))}px)`
                }}
                className={`w-3.5 h-3.5 rounded-full blur-[0.3px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] transition-transform duration-75 ${
                  stability > 0.8 ? "bg-emerald-400 shadow-emerald-500/50" : stability > 0.4 ? "bg-amber-400 shadow-amber-500/50" : "bg-red-400 shadow-red-500/50 animate-ping"
                }`}
              />
            </div>
          </div>

          {/* DYNAMIC COMPASS ROSE (Top Right Circle of the camera) */}
          <div className="absolute top-2 right-2 z-10 p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 font-mono text-[9px] select-none" title="البوصلة المغناطيسية للاتجاه الحقيقي">
            <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
            <span className="font-bold">{heading.toFixed(0)}° {heading < 45 || heading >= 315 ? "شمال" : heading < 135 ? "شرق" : heading < 225 ? "جنوب" : "غرب"}</span>
          </div>

          {/* DYNAMIC MINI LOCAL MAP (Bottom Left Circle inside camera area) */}
          <div className="absolute bottom-2 left-2 z-10 overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col p-1 gap-1 w-24 h-24" title="الخريطة المكانية المصغرة للوعي المحلي">
            <canvas ref={canvasMiniMapRef} width={88} height={70} className="rounded block" />
            <div className="flex justify-between items-center text-[7px] text-slate-500 px-0.5">
              <span className="font-sans font-semibold">ذهنية الـ AI</span>
              <Navigation className="w-2 h-2 text-blue-400 transform -rotate-45" />
            </div>
          </div>

          {/* CENTER GRAVITY CHARMING AI AVATAR */}
          <div className="z-10 relative pointer-events-none">
            {renderInteractiveAvatar()}
          </div>

          {/* Camera toggle / manual click analyze overlay */}
          <div className="absolute bottom-2 left-[102px] z-10 flex gap-1">
            <button 
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`p-1.5 rounded-lg bg-slate-950/80 border text-[9px] font-bold flex items-center gap-1 hover:text-white transition-all ${
                cameraEnabled ? "border-blue-500 text-blue-400" : "border-slate-800 text-slate-500"
              }`}
              title={cameraEnabled ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
            >
              <Camera className="w-3 h-3" />
            </button>
            {onAnalyzeTrigger && currentCallState !== "idle" && (
              <button 
                onClick={onAnalyzeTrigger}
                className="p-1.5 rounded-lg bg-blue-600 border border-blue-500 text-white text-[9px] font-bold flex items-center gap-1 hover:bg-blue-500 transition-all shadow shadow-blue-500/20"
                title="التقط لقطة كاميرا فورية وادمج سياق المستشعرات لتحليله بالذكاء الاصطناعي"
              >
                <Eye className="w-3 h-3" />
                <span>تحليل المشهد</span>
              </button>
            )}
          </div>

        </div>

        {/* Quota warning notification banner */}
        {quotaExceeded && (
          <div className="w-full p-2 bg-amber-950/45 border border-amber-600/30 rounded-lg text-right flex items-start gap-1.5 animate-pulse my-1 z-10" id="quota-warning-banner">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-right">
              <p className="text-[9px] font-bold text-amber-400">تنبيه: محرك الوعي المحلي (Offline Backup)</p>
              <p className="text-[8px] text-slate-300 leading-normal">
                تم استهلاك حصة Gemini السحابية لهذا اليوم. لقد قمنا بتفعيل نموذج الحس والوعي الذكي المحلي فورياً لضمان مواصلة جلستك مجاناً وبأمان تام!
              </p>
            </div>
          </div>
        )}

        {/* Status Line prompt layout */}
        <div className="w-full flex flex-col justify-center px-3 py-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80 z-10">
          <p className="text-[9px] text-slate-500 leading-none">مستشعر قنوات معالجة النطق والوعي</p>
          <p id="call-status-indicator" className="text-xs font-semibold text-white/90 leading-tight mt-1">
            {statusText}
          </p>
        </div>

        {/* Real-time live transcript display banner */}
        {liveTranscript && (
          <div className="w-full p-2 bg-blue-950/60 border border-blue-500/30 rounded-lg text-right animate-pulse flex flex-col gap-0.5 mt-1 z-10" id="live-speech-transcription">
            <div className="flex items-center gap-1 justify-start text-[8px] text-blue-400 font-bold tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              <span>أستقبل نطقك الآن...</span>
            </div>
            <p className="text-xs font-semibold text-slate-100 leading-tight">
              "{liveTranscript}"
            </p>
          </div>
        )}

        {/* Quick Conversation Transcript history chip overlay */}
        <div className="w-full flex flex-col gap-1.5 mt-1 z-10">
          {messages.length > 0 && userProfile.preferences.show_transcripts && (
            <div className="w-full text-right p-2 rounded-lg bg-slate-950/85 border border-slate-850 h-14 overflow-y-auto text-[11px] scrollbar-thin">
              <span className="font-semibold text-blue-400 ml-1">
                {messages[messages.length - 1].role === "user" ? "أنت:" : `${activePersona.name}:`}
              </span>
              <span className="text-slate-200">
                {messages[messages.length - 1].content}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls buttons */}
        <div className="w-full flex items-center justify-around gap-4 mt-2.5 z-10">
          
          {/* Slide open manual keyboard entry toggler */}
          <button 
            id="toggle-keyboard-input"
            onClick={() => setShowKeyboardInput(!showKeyboardInput)}
            className={`w-11 h-11 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all transform active:scale-95 hover:border-slate-700 ${showKeyboardInput ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : ''}`}
            title="الكتابة السريعة"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Main Voice Activation Microphone Switcher */}
          {currentCallState === "idle" ? (
            <button 
              id="start-call-trigger"
              onClick={onToggleMic}
              className="w-16 h-16 bg-blue-600 rounded-full border-4 border-slate-950 shadow-md flex items-center justify-center text-white hover:bg-blue-500 transition-all hover:scale-105"
              title="اتصال وتشغيل عين الذكاء"
            >
              <Phone className="w-6 h-6 rotate-0" />
            </button>
          ) : (
            <button 
              id="hold-to-talk-trigger"
              onClick={onToggleMic}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform border-4 border-slate-950 hover:scale-105 ${
                currentCallState === "listening" 
                  ? "bg-red-600 hover:bg-red-500 text-white animate-pulse ring-4 ring-red-500/25" 
                  : "bg-blue-650 hover:bg-blue-600 text-white ring-4 ring-blue-500/25"
              }`}
              title={currentCallState === "listening" ? "تحدث الآن (انقر للإرسال)" : "أسترجع..."}
            >
              <Mic className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Despedida Red end phone caller button */}
          <button 
            id="end-call-trigger"
            disabled={currentCallState === "idle"}
            onClick={onEndCall} 
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 ${
              currentCallState === "idle" 
                ? "bg-slate-950 border border-slate-900 text-slate-700 cursor-not-allowed opacity-20" 
                : "bg-red-650 hover:bg-red-600 shadow-md"
            }`}
            title="إنهاء المكالمة وإلغاء الاستماع"
          >
            <Phone className="w-4 h-4 rotate-135" />
          </button>

        </div>

        {/* Manual Keyboard writing overlay form */}
        {showKeyboardInput && currentCallState !== "idle" && (
          <form 
            id="keyboard-form-container"
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                onSendMessage(inputText.trim());
                setInputText("");
              }
            }} 
            className="w-full flex items-center gap-1 mt-2 p-1 rounded-lg bg-slate-950 border border-slate-800 z-10"
          >
            <input 
              id="keyboard-input-field"
              type="text" 
              placeholder="اكتب فكرتك أو معلم تراه..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-xs px-2 text-white text-right focus:ring-0"
              dir="auto"
            />
            <button 
              id="submit-keyboard-message"
              type="submit" 
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-30"
              disabled={!inputText.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Encrypted trust indicator line */}
        <div className="w-full flex justify-between items-center pt-2 border-t border-slate-850/80 mt-1.5 text-[8px] text-slate-500 font-mono select-none z-10">
          <span className="flex items-center gap-1">
            <Shield className="w-2.5 h-2.5 text-emerald-500" />
            تشفير فيزيائي وحسي متكامل
          </span>
          <span className="uppercase text-slate-600">
            {userProfile.known_facts.length > 0 ? `الذاكرة المسجلة: ${userProfile.known_facts.length} ركائز` : "الذاكرة خالية"}
          </span>
        </div>

      </div>
    </div>
  );
}
