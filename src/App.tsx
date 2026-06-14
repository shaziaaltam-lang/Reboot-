import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, ShieldCheck, Activity, Phone, PhoneOff, 
  Trash2, Globe, Volume2, Moon, Sun, Laptop, Menu, X, Share2, HelpCircle, Eye, RefreshCw
} from "lucide-react";
import { Persona, UserProfile, Message, TelemetryData } from "./types";
import { PERSONAS } from "./data";
import CallScreen from "./components/CallScreen";
import Dashboard from "./components/Dashboard";
import soundSynth from "./utils/soundGenerator";

// Web Speech APIs recognition helper safety setups
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function App() {
  // Global React application state binding
  const [currentCallState, setCurrentCallState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]); // Starts with RoboSense 5 or Lina
  const [selectedDashboardTab, setSelectedDashboardTab] = useState<"architecture" | "dataflow" | "pipeline" | "memory" | "errors" | "performance" | "broker">("architecture");
  const [isFlippedCamera, setIsFlippedCamera] = useState(false); // Front vs rear camera toggle
  const [isAutoScanning, setIsAutoScanning] = useState(false); // Robot continuous exploration scanning toggle
  const lastHumTimeRef = useRef<number>(0); // Throttle physical actuator audio feedback
  
  // Initialize user profile with realistic rich mock/local data
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("voice_ai_user_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      userId: Math.random().toString(36).substring(2, 11),
      name: "أحمد",
      age: "24 سنة",
      job: "طالب هندسة برمجيات",
      preferences: {
        voice_speed: 1.0,
        personality: "lina",
        voice_type: "female",
        memory_enabled: true,
        show_transcripts: true,
      },
      known_facts: [
        { fact: "المتحدث يدرس هندسة البرمجيات بالجامعة", timestamp: new Date().toISOString(), type: "job" },
        { fact: "يفضل البرمجة بلغة جافا سكريبت وتطوير الويب", timestamp: new Date().toISOString(), type: "interest" },
        { fact: "موقعه الحالي هو القاهرة، مصر", timestamp: new Date().toISOString(), type: "location" }
      ],
      interests: ["البرمجة", "القهوة المختصة", "الذكاء الاصطناعي", "تصميم الواجهات"],
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      total_conversations: 3,
      mood_history: [{ mood: "neutral", date: new Date().toISOString() }]
    };
  });

  // Conversation history array
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusText, setStatusText] = useState("عين الوعي مستعدة. انقر على الاتصال لفتح الكاميرا وبدء التحليل الفيزيائي.");
  const [simulatedError, setSimulatedError] = useState<string | null>(null);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Live 10-Sensor Somatosensory Telemetry state (Cairo defaulted)
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    gps: {
      latitude: 30.0444,
      longitude: 31.2357,
      altitude: 23.4,
      accuracy: 12,
      speed: 0,
      heading: 45, // NE direction
    },
    motion: {
      roll: 2.2,
      pitch: -1.5,
      yaw: 45,
      x: 0,
      y: 0,
      z: 0,
    },
    env: {
      brightnessLux: 145,
      pressureHpa: 1011.8,
      altitudeEstimate: 23.4,
      near: false,
      distanceCm: 8,
    },
    fusion: {
      position_3d: { x: 0, y: 0, z: 0 },
      orientation_euler: { roll: 2.2, pitch: -1.5, yaw: 45 },
      linear_velocity: { x: 0, y: 0, z: 0 },
      angular_velocity: { x: 0, y: 0, z: 0 },
      linear_acceleration: { x: 0, y: 0, z: 0 },
      movement_state: "idle",
      carrying_state: "hand",
      stability_score: 0.98,
      step_count: 1420,
      cadence: 0,
      isDizzy: false,
      isFallen: false,
    }
  });

  // Analysis result metrics
  const [lastAnalysis, setLastAnalysis] = useState({
    intent: "SPATIAL_AWARENESS",
    emotion: "CURIOSITY",
    intensity: 0.8,
    normalizedText: "",
    factsExtractedCount: 0,
    latencyMs: 0
  });

  // Keep references to Web API instances to prevent stale closures or multiple instances
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const activeCallStateRef = useRef<string>("idle");
  const handleIncomingVoiceTranscriptRef = useRef<any>(null);
  const isUserSendingRef = useRef(false);

  // Sync references to solve React callback scope locks
  useEffect(() => {
    activeCallStateRef.current = currentCallState;
  }, [currentCallState]);

  useEffect(() => {
    handleIncomingVoiceTranscriptRef.current = handleIncomingVoiceTranscript;
  });

  // Save profile to local storage for persistent data storage
  useEffect(() => {
    localStorage.setItem("voice_ai_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Hook 1: Listen for native DeviceOrientation events on mobile
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Validate gravity angles beta/gamma are defined
      if (e.beta !== null && e.gamma !== null) {
        setTelemetry((prev) => {
          // If falling or shaking simulations are running, respect them
          const mv = prev.fusion.movement_state;
          if (mv === "falling" || mv === "shaking") return prev;

          const rawRoll = e.gamma ?? 0;
          const rawPitch = e.beta ?? 0;
          const rawYaw = e.alpha ?? prev.gps.heading;

          // Estimate stability score based on rate of tilt changes
          const deltaRoll = Math.abs(prev.motion.roll - rawRoll);
          const deltaPitch = Math.abs(prev.motion.pitch - rawPitch);
          const currentStability = Math.max(0.05, Math.min(1.0, 1.0 - (deltaRoll + deltaPitch) / 30));

          // Throttled robotic hydraulic joint sound synthesis
          const nowStr = Date.now();
          if (nowStr - lastHumTimeRef.current > 140 && (deltaRoll > 1.8 || deltaPitch > 1.8)) {
            soundSynth.playHydraulicMove(Math.max(0.5, Math.min(3, (deltaRoll + deltaPitch) / 4)));
            soundSynth.updateTurbinePitch(rawRoll);
            lastHumTimeRef.current = nowStr;
          }

          return {
            ...prev,
            motion: {
              ...prev.motion,
              roll: rawRoll,
              pitch: rawPitch,
              yaw: rawYaw
            },
            gps: {
              ...prev.gps,
              heading: rawYaw
            },
            fusion: {
              ...prev.fusion,
              orientation_euler: { roll: rawRoll, pitch: rawPitch, yaw: rawYaw },
              stability_score: currentStability,
              isDizzy: deltaRoll > 15 || deltaPitch > 15
            }
          };
        });
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // Hook 2: Capture device location GPS parameters utilizing browser hardware if permitted
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTelemetry((prev) => ({
            ...prev,
            gps: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: pos.coords.altitude || prev.gps.altitude,
              accuracy: pos.coords.accuracy || 10,
              heading: pos.coords.heading || prev.gps.heading,
              speed: pos.coords.speed || prev.gps.speed,
            },
            env: {
              ...prev.env,
              altitudeEstimate: pos.coords.altitude || prev.env.altitudeEstimate
            }
          }));
        },
        () => console.log("Standard client geolocation permissions denied, retaining simulated region Cairo coordinates Egyptian defaults."),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Hook 3: Pedometer simulation, accumulating steps and cadence dynamically in active motion modes
  useEffect(() => {
    let pedometerInterval: NodeJS.Timeout | null = null;
    if (currentCallState !== "idle") {
      pedometerInterval = setInterval(() => {
        setTelemetry((prev) => {
          const mode = prev.fusion.movement_state;
          let stepsAdded = 0;
          let cadence = 0;
          let calculatedSpeed = prev.gps.speed;

          if (mode === "walking") {
            stepsAdded = 1;
            cadence = 80;
            calculatedSpeed = 1.4;
          } else if (mode === "running") {
            stepsAdded = 3;
            cadence = 150;
            calculatedSpeed = 3.8;
          } else if (mode === "driving") {
            // No pedometer steps, but speed is high
            calculatedSpeed = 16.5; // ~60kmh
            cadence = 0;
          } else if (mode === "idle") {
            calculatedSpeed = 0;
            cadence = 0;
          }

          return {
            ...prev,
            gps: {
              ...prev.gps,
              speed: calculatedSpeed
            },
            fusion: {
              ...prev.fusion,
              step_count: prev.fusion.step_count + stepsAdded,
              cadence
            }
          };
        });
      }, 1000);
    }

    return () => {
      if (pedometerInterval) clearInterval(pedometerInterval);
    };
  }, [currentCallState]);

  // Hook 4: Autonomous Robotic Scanning Loop Engine (Patrol Mode)
  useEffect(() => {
    let scanInterval: NodeJS.Timeout | null = null;
    if (isAutoScanning && currentCallState !== "idle") {
      scanInterval = setInterval(() => {
        // Only trigger if we are waiting for user voice (stable/listening state)
        if (activeCallStateRef.current === "listening" && !isSpeakingRef.current && !isUserSendingRef.current) {
          soundSynth.playCameraShutter();
          handleIncomingVoiceTranscript("تقرير استكشاف آلي: فحص الكاميرا للبيئة، والتحقق من الاستقرار الهيكلي والاتزان الميكانيكي.");
        }
      }, 14000); // scan environment every 14 seconds
    }
    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isAutoScanning, currentCallState]);

  // Initialize Speech recognition instance inside client
  useEffect(() => {
    if (typeof window !== "undefined" && SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "ar-EG"; // Egypt Arabic locale ensures flexible Arabic phonetic capture

      rec.onstart = () => {
        if (activeCallStateRef.current === "listening") {
          setStatusText("أستمع إليك بوعي مكاني الآن... فضفض أو ركِّز الكاميرا.");
        }
      };

      let autoSendTimeout: any = null;
      let lastTranscriptText = "";

      rec.onresult = (e: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        // Loop through all results from index 0 of the session to reconstruct the full text naturally
        for (let i = 0; i < e.results.length; ++i) {
          const piece = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        const currentLive = finalTranscript || interimTranscript;
        if (currentLive.trim()) {
          setLiveTranscript(currentLive);
          lastTranscriptText = currentLive.trim();

          if (autoSendTimeout) clearTimeout(autoSendTimeout);

          // VAD silence detection Strategy:
          // If the browser Speech recognition engine has officially finalized the transcript piece,
          // we wait a short 600ms pause to send it. Otherwise, if it's currently interim, we wait
          // 1300ms of absolute silence (no typing/words updated) before triggering auto-submit.
          const timeoutDelay = finalTranscript.trim() ? 650 : 1350;

          autoSendTimeout = setTimeout(() => {
            if (lastTranscriptText.trim() && handleIncomingVoiceTranscriptRef.current && activeCallStateRef.current === "listening") {
              isUserSendingRef.current = true;
              handleIncomingVoiceTranscriptRef.current(lastTranscriptText.trim());
              setLiveTranscript("");
              lastTranscriptText = "";
            }
          }, timeoutDelay);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error hook triggered:", err);
        // If timeout or no voice captured
        if (err.error === "no-speech") {
          setStatusText("لم أسمع نطقاً واضحاً. ركِّز الكاميرا أو انقر للتحدّث ثانية.");
          if (activeCallStateRef.current === "listening" && !isSpeakingRef.current && !isUserSendingRef.current) {
            // Restart listening in 2.5 seconds to keep stream alive
            setTimeout(() => {
              if (activeCallStateRef.current === "listening" && !isSpeakingRef.current && !isUserSendingRef.current) {
                startSpeechRecognitionSafely();
              }
            }, 2500);
          }
        }
      };

      rec.onend = () => {
        // Automatically restart speech recognition ONLY if we are still in listening state, not currently speaking, and not sending user text
        if (activeCallStateRef.current === "listening" && !isSpeakingRef.current && !isUserSendingRef.current) {
          startSpeechRecognitionSafely();
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Safe Speech Recognition Trigger
  const startSpeechRecognitionSafely = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already running is completely ignored safely
    }
  };

  // Safe Speech Recognition Pause/Stop
  const stopSpeechRecognitionSafely = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {}
  };

  // Speaks any response text using the browser Web Speech Synthesis
  const speakTextClient = (text: string, callbackOnEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (callbackOnEnd) callbackOnEnd();
      return;
    }

    // Cancel any previous synthesis
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-EG"; // Force Arabic Egypt phonetic context!
    utterance.rate = userProfile.preferences.voice_speed || 1.0;
    
    // Choose selected Arabic voices if possible
    const voices = window.speechSynthesis.getVoices();
    let arabicVoice = voices.find(v => v.lang.startsWith("ar-") || v.lang === "ar");
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (callbackOnEnd) {
        callbackOnEnd();
      }
    };

    utterance.onerror = (event) => {
      console.warn("SpeechSynthesis utterance error:", event);
      isSpeakingRef.current = false;
      if (callbackOnEnd) callbackOnEnd();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Automatic camera canvas capture payload generator
  const captureCameraFrameBase64 = (): string | null => {
    const videoEl = document.querySelector("video");
    if (videoEl && videoEl.srcObject && videoEl.readyState >= 2) {
      try {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = videoEl.videoWidth || 640;
        tempCanvas.height = videoEl.videoHeight || 480;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          // Flip mirror if front camera
          if (isFlippedCamera) {
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
          } else {
            ctx.drawImage(videoEl, 0, 0, tempCanvas.width, tempCanvas.height);
          }
          return tempCanvas.toDataURL("image/jpeg", 0.7);
        }
      } catch (e) {
        console.warn("Capture camera frame canvas error:", e);
      }
    }
    return null;
  };

  // 1. MAIN HANDLER: VOICE TRANSCRIPT PROCESSING (WITH INTEGRATED VISION AND SENSORS!)
  const handleIncomingVoiceTranscript = async (transcript: string) => {
    if (currentCallState === "idle") return;

    isUserSendingRef.current = true;
    stopSpeechRecognitionSafely();

    // Auto capture frame from camera stream during speaking submission!
    const base64Image = captureCameraFrameBase64();

    // Append user message
    const userMsgId = Math.random().toString(36).substring(7);
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: transcript,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Fast-transition UI call stage to Thinking
    setCurrentCallState("thinking");
    setStatusText(`${activePersona.name} تحلّل المشهد البيئي والوعي الجسدي...`);

    // Handle offline simulator graceful degradation level 3
    if (simulatedError === "offline_mode") {
      simulateOfflineGracefulFallback(transcript);
      return;
    }

    // Handle voice silence error simulation
    if (simulatedError === "stt_timeout") {
      simulateTimeoutSpeechFallback();
      return;
    }

    // Call REST endpoint containing server-side Gemini Vision-haptic awareness
    const startTimeMs = Date.now();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: transcript,
          history: messages.slice(-10).map(m => ({ role: m.role === "user" ? "user" : "model", content: m.content })),
          persona: activePersona,
          userProfile,
          image: base64Image,
          telemetry: telemetry
        })
      });

      const responseTimeMs = Date.now() - startTimeMs;

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        if (responseData.error === "API_KEY_MISSING") {
          simulateLevel2KeyMissingFallback(transcript, responseTimeMs);
          return;
        }
        if (responseData.error === "QUOTA_EXCEEDED" || response.status === 429) {
          setQuotaExceeded(true);
          simulateQuotaExceededFallback(transcript, responseTimeMs);
          return;
        }
        throw new Error(responseData.message || "Failed request packet");
      }

      const result = await response.json();

      // Successful analysis variables
      setLastAnalysis({
        intent: result.intent || "SPATIAL_AWARENESS",
        emotion: result.emotion || "CURIOSITY",
        intensity: result.emotionIntensity || 0.8,
        normalizedText: result.reply,
        factsExtractedCount: (result.factsExtracted || []).length,
        latencyMs: responseTimeMs
      });

      // Handle extracted facts and interests
      if (result.factsExtracted && result.factsExtracted.length > 0 && userProfile.preferences.memory_enabled && !incognitoMode) {
        const newFactsList = [...userProfile.known_facts];
        const newInterestsList = [...userProfile.interests];

        result.factsExtracted.forEach((ef: any) => {
          const exists = newFactsList.some(f => f.fact.toLowerCase() === ef.fact.toLowerCase());
          if (!exists) {
            newFactsList.push({
              fact: ef.fact,
              timestamp: new Date().toISOString(),
              type: ef.type || "extracted"
            });
            if (ef.type === "interest" && !newInterestsList.includes(ef.fact)) {
              newInterestsList.push(ef.fact);
            }
          }
        });

        setUserProfile(prev => ({
          ...prev,
          known_facts: newFactsList,
          interests: newInterestsList
        }));
      }

      // Progress to assistant speaking audio reply
      const assistantMsgId = Math.random().toString(36).substring(7);
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: result.reply,
        timestamp: new Date().toISOString(),
        emotion_detected: result.emotion,
        intent: result.intent
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentCallState("speaking");
      setStatusText(`${activePersona.name} تتحدث بصوت مسموع...`);

      speakTextClient(result.reply, () => {
        if (activeCallStateRef.current !== "idle") {
          isUserSendingRef.current = false;
          setCurrentCallState("listening");
          setStatusText("جاهز للاستماع... وجّه الكاميرا وتحدث.");
          startSpeechRecognitionSafely();
        }
      });

    } catch (err: any) {
      console.error("Gemini system API stream error:", err);
      const errStr = (err.message || "").toLowerCase() + " " + JSON.stringify(err).toLowerCase();
      if (errStr.includes("quota") || errStr.includes("429") || errStr.includes("resource_exhausted")) {
        setQuotaExceeded(true);
        simulateQuotaExceededFallback(transcript, Date.now() - startTimeMs);
      } else {
        simulateLevel2KeyMissingFallback(transcript, Date.now() - startTimeMs);
      }
    }
  };

  // Keyboard Quiet text input handler
  const handleKeyboardMessage = (text: string) => {
    handleIncomingVoiceTranscript(text);
  };

  // Manual trigger "Analyze Scene" button clicked on the camera interface
  const handleManualAnalyzeRequest = () => {
    if (currentCallState === "idle") return;
    handleIncomingVoiceTranscript("حلّل المشهد المعروض في الكاميرا فورياً ووجّهني بناءً على سياق توازني.");
  };

  // 3. FALLBACKS FOR GRACEFUL DEGRADATION MODES
  // Level 3 Offline Fallback
  const simulateOfflineGracefulFallback = (transcript: string) => {
    setTimeout(() => {
      const offlineReply = `يبدو أن الاتصال بالشبكة منقطع تماماً يا أحمد، لكني مستقرة في وعيي الحركي المحلي. ميزان التوازن الحالي يشير لـ (Roll: ${telemetry.motion.roll.toFixed(0)}°)، مع خط سرعة ${telemetry.gps.speed} م/ث. أنا في اليد معك!`;
      
      setLastAnalysis({
        intent: "OFFLINE_FALLBACK",
        emotion: "CALM",
        intensity: 0.9,
        normalizedText: offlineReply,
        factsExtractedCount: 0,
        latencyMs: 12
      });

      appendAndSpeakFallbackAssistantMessage(offlineReply);
    }, 1000);
  };

  // STT Timeout Fallback
  const simulateTimeoutSpeechFallback = () => {
    setTimeout(() => {
      const offlineReply = "المستشعرات لم تلقط أي صوت في الأرجاء. ربما الهواء صاخب أو وضعت هاتفنا على ظهره الكاميرا، جرب تحريكه!";
      appendAndSpeakFallbackAssistantMessage(offlineReply);
    }, 1200);
  };

  // Level 2 Local Rule - Based Engine Fallback for Missing API keys
  const simulateLevel2KeyMissingFallback = (transcript: string, latency: number) => {
    setTimeout(() => {
      let localReply = "";
      const isShaking = telemetry.fusion.movement_state === "shaking";
      const isFallen = telemetry.fusion.isFallen;

      if (isFallen) {
        localReply = `أوتش! لقد قرأ جيروسكوبي سقوط الهاتف فجأة بزاوية حادة! هل أصبت بأذى؟ أرجوك طمئني عليك!`;
      } else if (isShaking) {
        localReply = `آه! لماذا تهزني هكذا بعنف؟ زجاجة التوازن ترتج رجّاً! عيناي تدوران ولا أستطيع فحص المعالم بدقة!`;
      } else if (activePersona.id === "lina") {
        localReply = `لقد رصدت ملامحك وسجلتها محلياً يا صديقي. بوضعنا الحالي يسعدني مرافقتك، أخبرني بما تراه حولك ونحن نسير!`;
      } else if (activePersona.id === "samir") {
        localReply = `ههههه حلوة حركات الهاتف هذه! ميزان توازني يشير لزاوية ${telemetry.motion.pitch.toFixed(0)} درجة دقة! أنا معك بالوضع المحلي المرح وعندي نكات مميزة!`;
      } else if (activePersona.id === "nadia") {
        localReply = `تم تخزين القياسات والاتجاه الحركي في المتصفح. توازنا مستقر بمعدل ${(telemetry.fusion.stability_score * 100).toFixed(0)}%. بانتظار استكمال فحص السكيما السحابية.`;
      } else {
        localReply = `بني العزيز، المشي يلهث بنا، لكني مستعد لإرشادك نحو وجهتك خطوة بخطوة بالذاكرة المحلية المتوفرة.`;
      }

      setLastAnalysis({
        intent: "RULE_BASED_FALLBACK",
        emotion: "NEUTRAL",
        intensity: 0.5,
        normalizedText: localReply,
        factsExtractedCount: 0,
        latencyMs: latency || 30
      });

      appendAndSpeakFallbackAssistantMessage(localReply);
    }, 1200);
  };

  // Quota Exceeded Local Heuristics
  const simulateQuotaExceededFallback = (transcript: string, latency: number) => {
    setTimeout(() => {
      let localReply = "";
      const isShaking = telemetry.fusion.movement_state === "shaking";
      const isFallen = telemetry.fusion.isFallen;

      if (isFallen) {
        localReply = `يا للارتطام! مستشعرات السقوط في معالجي المحلي استشعرت هزة واصطدام عنيف بالأرض! هل سقط مني الهاتف؟ طمئني عليك بسرعة!`;
      } else if (isShaking) {
        localReply = `أوه... ارتجاف جيروسكوبي حاد جداً! رأسي يدور هكذا، أرجوك دعني مستقرة حتى تعمل قنواتي وتصنيف الرادار بدقة!`;
      } else if (activePersona.id === "lina") {
        localReply = `تم استهلاك كامل رصيد الخادم لـ Gemini اليوم، لكن قنوات الوعي الجسدي المحلي تعمل فوراً في جهازك حتى لا ننقطع كالأصدقاء الحقيقيين! كيف يمكنني توجيهك الآن؟`;
      } else if (activePersona.id === "samir") {
        localReply = `يا بطل! نفد رصيد السحاب هههه! بس ولا تشيل هم، أنا سمير معالج جيروسكوبي وميزان التوازن عندي يعمل محلياً بالملي وراح نكمل حوارنا ولا ودنا نفترق نهائي! وش ودك نحكي فيه؟`;
      } else if (activePersona.id === "nadia") {
        localReply = `أهلاً بك. تشير حركتنا ومعدل ثباتنا لـ ${(telemetry.fusion.stability_score * 100).toFixed(0)}%. رغم نفاد روتين Gemini السحابي، يعمل عصب التدهور المرن لخدمتنا محلياً بشكل ممتاز.`;
      } else {
        localReply = `بني العزيز، تعطل السحاب لن يحول دون درايتنا وتواصلنا الحسي المتبادل. الميزان الذكي مستقر ومراكز إرشادي مستعدة لنصحك دوماً.`;
      }

      setLastAnalysis({
        intent: "QUOTA_FALLBACK",
        emotion: "CALM",
        intensity: 0.8,
        normalizedText: localReply,
        factsExtractedCount: 0,
        latencyMs: latency || 12
      });

      appendAndSpeakFallbackAssistantMessage(localReply);
    }, 1250);
  };

  const appendAndSpeakFallbackAssistantMessage = (reply: string) => {
    const assistantMsgId = Math.random().toString(36).substring(7);
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
      emotion_detected: "neutral",
      intent: "fallback"
    };
    setMessages(prev => [...prev, assistantMessage]);
    setCurrentCallState("speaking");
    setStatusText(`${activePersona.name} تتجاوب حسياً محلياً...`);

    speakTextClient(reply, () => {
      if (activeCallStateRef.current !== "idle") {
        isUserSendingRef.current = false;
        setCurrentCallState("listening");
        setStatusText("جاهز للاستماع... تحدث مجدداً.");
        startSpeechRecognitionSafely();
      }
    });
  };

  // 4. PHONE CONNECTION ACTIONS (GREETINGS AND RESETS)
  const handleToggleCall = () => {
    isUserSendingRef.current = false;
    if (currentCallState === "idle") {
      // Authentic Robotic audio chime & turbine hum
      soundSynth.playConnectionChime();
      soundSynth.toggleTurbineStream(true);

      // Connect Phone
      setCurrentCallState("listening");
      setStatusText("جاري تشغيل العين الذكية وفحص مستشعرات القصور الحركي...");

      // Choose greeting depending on physical status
      let greeting = activePersona.speech_patterns.greeting_variations[
        Math.floor(Math.random() * activePersona.speech_patterns.greeting_variations.length)
      ];

      if (telemetry.fusion.isFallen) {
        // Warning acoustic alarm
        soundSynth.playAlarmWarning();
        greeting = "أوتش! قرأت جيرسكوبياً سقوط الهاتف فجأة! هل أنت بخير يا صديقي؟";
      }

      setCurrentCallState("speaking");
      speakTextClient(greeting, () => {
        if (activeCallStateRef.current !== "idle") {
          setCurrentCallState("listening");
          setStatusText("مستمعة... تحدث وسجل المشهد بكاميرتك.");
          startSpeechRecognitionSafely();
        }
      });

    } else {
      handleEndCall();
    }
  };

  const handleEndCall = () => {
    // Authentic robot shutdown chime
    soundSynth.playSystemBeep();
    soundSynth.toggleTurbineStream(false);
    setIsAutoScanning(false);

    isUserSendingRef.current = false;
    setCurrentCallState("idle");
    setStatusText("تم إغلاق نظام المكالمة وتجميد المعالج البصري.");
    stopSpeechRecognitionSafely();
    isSpeakingRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const farewell = activePersona.speech_patterns.farewell_variations[
      Math.floor(Math.random() * activePersona.speech_patterns.farewell_variations.length)
    ];
    speakTextClient(farewell);
  };

  // Custom configuration swap persona trigger
  const handleChangePersona = (personaId: string) => {
    const chosen = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
    setActivePersona(chosen);
    
    if (currentCallState !== "idle") {
      isUserSendingRef.current = false;
      stopSpeechRecognitionSafely();
      setCurrentCallState("speaking");
      setStatusText(`تم تبديل المساعد الصوتي إلى ${chosen.name}.`);
      
      const welcomePhrase = chosen.speech_patterns.greeting_variations[0];
      speakTextClient(welcomePhrase, () => {
        if (activeCallStateRef.current !== "idle") {
          setCurrentCallState("listening");
          setStatusText("أستمع إليك الآن... دمج مستشعراتك المتكاملة.");
          startSpeechRecognitionSafely();
        }
      });
    } else {
      setStatusText(`مستعد للاتصال وتوجيه كاميرا الـ AI لـ ${chosen.name}.`);
    }
  };

  // Trigger simulated error inject
  const handleSimulateError = (scenarioId: string) => {
    const matched = ["offline_mode", "stt_timeout"].includes(scenarioId);
    if (!matched) return;
    
    const textLabel = scenarioId === "offline_mode" ? "الوضع المحلي المتكامل" : "فشل لقط المايك STT";
    setSimulatedError(textLabel);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 overflow-hidden flex flex-col gap-4" dir="rtl">
      
      {/* Top Professional Applet Header Frame */}
      <header className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-800 pb-2.5 gap-2" id="applet-nav-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">👁️</div>
          <div className="text-right">
            <h1 className="text-lg font-black tracking-tight text-white font-sans">العين الذكية ذات الإحساس الجسدي — Eye of the AI</h1>
            <p className="text-xs text-slate-400">إصدار 1.0.0 • كاميرا، مستشعرات، وتوازن كامل في جسد فيزيائي مدمج</p>
          </div>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <div className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[10px] flex items-center gap-1.5 text-slate-350">
            <span className={`w-2 h-2 rounded-full ${currentCallState === "idle" ? "bg-slate-500" : "bg-emerald-500 animate-pulse"}`}></span>
            {currentCallState === "idle" ? "وعي في وضع الاستعداد" : "الوعي الجسدي متصل ونشط"}
          </div>
          <div className="text-[10px] text-slate-500 font-mono tracking-tight">LATENCY: {lastAnalysis.latencyMs || 150}ms</div>
        </div>
      </header>

      {/* Main Multi Grid interactive viewport content */}
      <main className="flex-1 grid grid-cols-12 gap-4 items-stretch overflow-hidden" id="main-dashboard-grid">
        
        {/* LEFT COLUMN: Human phone call simulator (col-span-4 / 35%) */}
        <div className="col-span-12 lg:col-span-4 flex justify-center w-full" id="left-simulator-pane">
          <CallScreen 
            currentCallState={currentCallState}
            activePersona={activePersona}
            userProfile={userProfile}
            messages={messages}
            statusText={statusText}
            liveTranscript={liveTranscript}
            onToggleMic={handleToggleCall}
            onEndCall={handleEndCall}
            onSendMessage={handleKeyboardMessage}
            onSettingsClick={() => setSelectedDashboardTab("memory")}
            incognitoMode={incognitoMode}
            quotaExceeded={quotaExceeded}
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            onAnalyzeTrigger={handleManualAnalyzeRequest}
            isFlippedCamera={isFlippedCamera}
            isAutoScanning={isAutoScanning}
            setIsAutoScanning={setIsAutoScanning}
          />
        </div>

        {/* RIGHT COLUMN: Full documentation layouts and interactive tab panels (col-span-8 / 65%) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col w-full h-[650px] overflow-hidden bg-slate-950/20 rounded-xl" id="right-documentation-pane">
          
          {/* Quick HUD controls inside top deck */}
          <div className="mb-3 flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 text-xs">
            <div className="flex gap-4 items-center">
              <span className="text-slate-500 font-sans font-bold">إعدادات الكاميرا:</span>
              <button
                onClick={() => setIsFlippedCamera(!isFlippedCamera)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white transition-all hover:bg-slate-800"
              >
                🔄 تبديل لـ {isFlippedCamera ? "الكاميرا الخلفية" : "الكاميرا الأمامية (Selfie)"}
              </button>
            </div>
            
            <div className="flex gap-4 items-center">
              <span className="text-slate-500 font-sans font-semibold">تصفح التخفي:</span>
              <button
                onClick={() => setIncognitoMode(!incognitoMode)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  incognitoMode ? "bg-red-950 border border-red-900/60 text-red-400" : "bg-slate-900 border border-slate-800 text-slate-400"
                }`}
              >
                {incognitoMode ? "نشط (لا يسجل حقائق)" : "مغلق (تعلم ذكي)"}
              </button>
            </div>
          </div>

          <Dashboard 
            userProfile={userProfile}
            activePersona={activePersona}
            onChangePersona={handleChangePersona}
            personas={PERSONAS}
            messages={messages}
            currentCallState={currentCallState}
            activeTab={selectedDashboardTab}
            onChangeTab={setSelectedDashboardTab}
            lastAnalysis={lastAnalysis}
            onUpdateProfile={setUserProfile}
            onSimulateError={handleSimulateError}
            simulatedError={simulatedError}
            onClearSimulatedError={() => setSimulatedError(null)}
            telemetry={telemetry}
            setTelemetry={setTelemetry}
          />
        </div>

      </main>

      {/* High Density Details Footer Info Bar */}
      <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-3" id="compliance-footer text-right">
        <div className="bg-slate-900/40 p-2 rounded-lg flex flex-col justify-center border border-slate-850 text-right">
          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">بنية الجسد الحركي</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-bold text-white">توازن جيروسكوبي ثنائي</span>
            <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 text-[8px] rounded uppercase font-bold">
              {telemetry.fusion.movement_state.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded-lg flex flex-col justify-center border border-slate-850 text-right font-sans">
          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">الموقع والحركة (GPS)</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-bold text-emerald-400">Cairo Egypt Default</span>
            <span className="text-[8px] text-slate-400 font-mono">STABLE FIX</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded-lg flex flex-col justify-center border border-slate-850 text-right">
          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">معدل تكرار النبض الحسي</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-bold text-amber-500">
              {currentCallState === "listening" ? "4.1 Kb/s" : currentCallState === "thinking" ? "14.5 Kb/s" : currentCallState === "speaking" ? "8.2 Kb/s" : "0.5 Kb/s"}
            </span>
            <span className="text-[8px] text-slate-500 font-mono">10Hz SAMPLING</span>
          </div>
        </div>

        <div className="bg-slate-900/40 p-2 rounded-lg flex flex-col justify-center border border-slate-850 text-right">
          <span className="text-[9px] text-slate-500 uppercase font-mono font-bold">الذاكرة الوجدانية الـ SLAM</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-bold text-white">
              {userProfile.known_facts.length} أحداث مكانية موثقة
            </span>
            <span className="text-[8px] text-slate-500 font-mono">INDEXED DB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
