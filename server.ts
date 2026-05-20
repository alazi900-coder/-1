import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { model, contents, config, systemInstruction } = req.body;
    
    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents,
      config: {
        ...config,
        systemInstruction,
        temperature: config?.temperature ?? 0.7,
      }
    });
    
    // Extract text safely
    const text = response.text || "";

    res.json({
      text,
      candidates: response.candidates,
      promptFeedback: response.promptFeedback,
      usageMetadata: response.usageMetadata
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gemini/tts", async (req, res) => {
  const { text, voiceName, config, model, systemInstruction } = req.body;
  
  const generateWithModel = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text }] }],
      config: {
        ...config,
        systemInstruction,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });
  };

  try {
    let response;
    const primaryModel = model || "gemini-3.1-flash-tts-preview";
    
    try {
      response = await generateWithModel(primaryModel);
    } catch (primaryError: any) {
      const isQuotaError = 
        primaryError.status === 429 || 
        primaryError.statusCode === 429 ||
        JSON.stringify(primaryError).includes("429") ||
        primaryError.message?.includes("429") || 
        primaryError.message?.includes("RESOURCE_EXHAUSTED") ||
        primaryError.message?.includes("quota");

      if (isQuotaError) {
        console.warn(`Primary model ${primaryModel} hit quota. Trying fallback gemini-flash-latest...`);
        try {
          response = await generateWithModel("gemini-flash-latest");
        } catch (fallbackError: any) {
          console.warn(`Fallback gemini-flash-latest hit quota or failed. Trying gemini-3-flash-preview...`);
          try {
            response = await generateWithModel("gemini-3-flash-preview");
          } catch (thirdError: any) {
            throw primaryError; // Re-throw original if all fallbacks fail
          }
        }
      } else {
        throw primaryError;
      }
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    let base64Audio;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Audio) {
      res.json({ data: base64Audio });
    } else {
      // If we got parts but no audio, check if there's text (maybe safety filters triggered or modality ignored)
      const textPart = parts?.find(p => p.text)?.text;
      console.error("Gemini TTS Failed: No audio data in response. Content:", JSON.stringify(response.candidates?.[0]?.content, null, 2));
      
      const errorMsg = textPart 
        ? `Model returned text instead of audio: ${textPart}` 
        : "Failed to generate audio: No audio parts returned in the response candidates.";
        
      res.status(500).json({ 
        error: errorMsg,
        details: response.candidates?.[0]?.finishReason ? `Finish reason: ${response.candidates[0].finishReason}` : "Unknown reason"
      });
    }
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    // Propagate the actual status code from the API if available, especially for 429
    const status = error.status || (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") ? 429 : 500);
    res.status(status).json({ 
      error: error.message || "An unexpected error occurred during TTS generation",
      status: status
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
