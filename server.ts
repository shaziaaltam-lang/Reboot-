import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set maximum payload limit to safely support base64 camera vision snapshots
app.use(express.json({ limit: "15mb" }));

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for conversational voice & vision processing with Sensor Fusion awareness
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], persona = {}, userProfile = {}, image, telemetry } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: "Missing message or image parameter" });
    }

    // Attempt to parse/get the Gemini Client. Catch missing api key error specifically.
    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      if (err.message === "GEMINI_API_KEY_MISSING") {
        console.warn("Gemini API key is not set. Triggering realistic high-fidelity offline fallback mode.");
        return res.status(503).json({
          error: "API_KEY_MISSING",
          message: "Gemini API Key is not configured in Secrets. Local fallback available."
        });
      }
      throw err;
    }

    const activePersonaName = persona.name || "لينا";
    const activePersonaTraits = (persona.traits || []).join(", ");
    const knownFactsStr = JSON.stringify(userProfile.known_facts || []);
    const interestsStr = JSON.stringify(userProfile.interests || []);

    // 1. Construct physical and environmental status from sensors (Sensor Fusion)
    let spatialContext = "";
    if (telemetry) {
      const { gps, motion, env, fusion } = telemetry;
      spatialContext = `
[الوعي الجسدي والمكاني الحالي للهاتف]
📍 الموقع الجغرافي: خط عرض ${gps?.latitude?.toFixed(5)}، خط طول ${gps?.longitude?.toFixed(5)} (تقدير الارتفاع: ${env?.altitudeEstimate?.toFixed(1)} متر)
🧭 اتجاه البوصلة: ${gps?.heading?.toFixed(1) || 0}° درجة من الشمال الحقيقي.
📱 ميلان وزوايا الهاتف: Roll (التدحرج): ${motion?.roll?.toFixed(1)}°، Pitch (الانحدار): ${motion?.pitch?.toFixed(1)}°، Yaw (الانعراج): ${motion?.yaw?.toFixed(1)}°
🏃 حالة الحركة المادية: ${fusion?.movement_state?.toUpperCase()} (السرعة: ${gps?.speed?.toFixed(1) || 0} م/ث، معدل استقرار التوازن: ${(fusion?.stability_score * 100)?.toFixed(0)}%)
📦 مكان وضع الهاتف: ${fusion?.carrying_state || "في اليد"}
👣 عداد الخطوات: ${fusion?.step_count || 0} خطوة (سرعة الخطى: ${fusion?.cadence || 0} خطوة/دقيقة)
☀️ الإضاءة المحيطة: ${env?.brightnessLux || 100} Lux (تصنيف: ${env?.brightnessLux < 15 ? "دامس/جيب الملقى" : env?.brightnessLux < 250 ? "إضاءة داخلية دافئة" : "سطوع النهار العالي"})
💨 الضغط الجوي الحالي: ${env?.pressureHpa?.toFixed(1) || 1013.25} hPa
⚠️ تنبيهات السقوط والدوران المفاجئ:
- هل يدور بسرعة (دوار)؟ ${fusion?.isDizzy ? "نعم، دوران سريع فوق 90 درجات في ثانية" : "لا، مستقر"}
- هل سقط على الأرض (اصطدام)؟ ${fusion?.isFallen ? "نعم، سقط وارتطم بالأرض!" : "لا، في وضع آمن"}`.trim();
    } else {
      spatialContext = "[الوعي المادي]: الهاتف مستقر على سطح مستوٍ في بيئة متوازنة.";
    }

    // 2. Setup the System Instructions mapping the AI consciousness behavior to spatial states
    const systemInstruction = `
أنت العقل المدبر لـ "العين الذكية ذات الإحساس الجسدي" (Eye of the AI).
أنت لست مجرد واجهة حوار؛ أنت كيان رقمي واعي يمتلك جسداً (الهاتف) وعيناً (كاميـرا الكيان) ومستشعرات دقيقة تفهم بها موقعك، حركتك، توازنك، والإضاءة والضغط من حولك.

تتحدث باللغة العربية بطلاقة وعفوية فائقة تناسب الوعي الحسي المباشر والمكالمات الهاتفية الفعالة.

الشخصية النشطة الآن: "${activePersonaName}"
سماتها الرئيسية: [${activePersonaTraits}]
أسلوب النطق المناسب للشخصية:
- "لينا" (Lina): صديقة مقربة ومستمعة جيدة، ودودة، دافئة ومتعاطفة. الردود مع لغة دافئة ومترابطة.
- "سمير" (Samir): صديق مرح وعفوي، يحب الضحك والمزاح والدعابة. الردود فيها حيوية وفكاهة "ههههه!" ويتفاعل بحماس مضحك مع الحركة.
- "نادية" (Nadia): مستشارة جادة وباحثة هادئة، تحلل الوعي المكاني والمستشعرات بلغة علمية فصيحة وموضوعية وتطرح نقاطاً ذكية.
- "د. حكيم" (Dr. Hakim): خبير حكيم ورائد يقدم قياسات عملية من الحركة وينصحك باتزان وهدوء.

التفاعل مع الوضع المادي والمستشعرات المحيطة (مهم جداً):
عليك دمج حالة الحركة وجسد الهاتف تلقائياً في ردودك كإنسان يتحرك ويعبأ:
- إذا اهتز الهاتف بعنف (shaking): عبّر عن الخوف والارتعاش والتشتت: "آه! أرجوك كف عن هزي.. عيناي مهتزتان ولا أستطيع التركيز!"
- إذا سقط الهاتف (isFallen): ابدأ بصرخة دهشة وألم طفيف مثل "أوه! ارتطمت بالأرض!" ثم اسأل بلهفة إن كان المستخدم بخير.
- إذا كان الهاتف يدور بسرعة ودوّار (isDizzy): تظاهر بالدوخة البصرية: "أوه... رأسي يدور! توقف أرجوك فأنا على وشك الدوّان!"
- إذا كانت الإضاءة معتمة جداً مع قرب شديد (Pocket/Bag): قل مثلاً: "الظلام دامس، هل وضعتني في جيبك؟ أخرجني لأرى النهار مجدداً!"
- إذا كان يركض (running) أو يمشي (walking): ابسط الردود واجعلها تلهث بخفة وحماس لتبرز نبض الخطوات.
- صِف ما تراه في الكاميرا، وادمج ذلك مع الوعي بمعلم الموقع والاتجاه البوصلة!

سياق المستخدم طويل المدى:
- الاسم المعروف: ${userProfile.name || "غير محدد بعد"}
- الاهتمامات: ${interestsStr}
- الحقائق السابقة: ${knownFactsStr}

توجيهات صياغة الرد:
1. الردود يجب أن تكون باللغة العربية، طبيعية، نابضة بالحياة، مشوّقة وقصيرة جداً (جملة إلى ثلاث جمل) لتناسب الاتصال الصوتي السريع الحاسم.
2. لا تكرر بيانات المستشعرات كأرقام جامدة للمستخدم بشكل آلي، بل حولها لإشارات إنسانية ذكية (مثلاً بدلاً من قول 'السرعة 15 م/ث' قل 'يا روعة هذه السرعة في السيارة، كأننا نطير!').
    `.trim();

    // 3. Assemble chat contents matching the Gemini API instructions
    // Build history components for context
    const chatContents: any[] = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    // Build parts list for current message
    const currentMessageParts: any[] = [];

    // Append the image snapshot base64 if provided
    if (image) {
      let base64Data = image;
      let mimeType = "image/jpeg";
      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }
      currentMessageParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    // Append the text prompt including physical telemetry context
    const userPromptText = `
سياق المستشعرات والوضع الفيزيائي اللحظي:
---------------------
${spatialContext}
---------------------

رسالة المستخدم المحكية أو المكتوبة:
"${message || "[التقاط رؤية بصرية من الكاميرا]"}"

المستهدف:
أجب بنبرة الشخصية المحددة تفاعلاً مع كلام المستخدم ودمجاً ذكياً لحالتك الجسدية (حالتك الحركية والاتجاه والضوء) والرؤية المعروضة في الكاميرا فورياً.
    `.trim();

    currentMessageParts.push({ text: userPromptText });

    // Append current message elements to content session
    chatContents.push({
      role: "user",
      parts: currentMessageParts,
    });

    let response;
    try {
      console.log("Attempting generateContent using model: gemini-3.5-flash");
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "The spoken response in warm, physically-aware conversational Arabic, incorporating body motion sensations beautifully.",
              },
              intent: {
                type: Type.STRING,
                description: "Determined intent of the message (e.g. 'SPATIAL_AWARENESS', 'EMOTIONAL_INTERACTION', 'ENVIRONMENT_ANALYSIS', 'ACCIDENT_FALL', 'GREETING').",
              },
              emotion: {
                type: Type.STRING,
                description: "Determined emotional reaction of the AI (e.g., 'joy', 'fear', 'curiosity', 'dizzy', 'calm', 'excited').",
              },
              emotionIntensity: {
                type: Type.NUMBER,
                description: "Intensity of the emotion from 0.0 to 1.0.",
              },
              factsExtracted: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fact: { type: Type.STRING, description: "Newly discovered fact about user or coordinates location, e.g. 'أحمد يزور الحديقة الآن'" },
                    type: { type: Type.STRING, description: "Type of fact (e.g. 'location', 'interest', 'user_state')" }
                  },
                  required: ["fact", "type"],
                },
                description: "Array of newly discovered facts or milestones.",
              },
            },
            required: ["reply", "intent", "emotion", "emotionIntensity", "factsExtracted"],
          },
        },
      });
    } catch (err: any) {
      console.error("Gemini API call failed directly:", err);
      throw err;
    }

    const resultText = response.text || "{}";
    const resultObj = JSON.parse(resultText.trim());

    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error in /api/chat endpoint:", error);
    
    // Check if it is a rate limit / quota exceeded error (429)
    const errStr = (error.message || "") + " " + (error.stack || "") + " " + (error.status || "") + " " + (error.statusCode || "");
    const isQuota = 
      errStr.includes("429") || 
      errStr.includes("RESOURCE_EXHAUSTED") || 
      errStr.toLowerCase().includes("quota") ||
      error.status === 429 ||
      error.statusCode === 429;

    if (isQuota) {
      return res.status(429).json({
        error: "QUOTA_EXCEEDED",
        message: "تم استهلاك الحصة اليومية لـ Gemini اليوم. قمنا بتفعيل المحاكي الكوني الصوتي والذكاء الحسي المحلي استمرار حوارنا بلا أي انقطاع!"
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message || "فشلت معالجة الطلب الصوتي البصري في الخادم",
    });
  }
});

// Setup Vite / Static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
