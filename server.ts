import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes when API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
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

// Siri Chat Assistant - Server-Side Gemini API Proxy Route
app.post("/api/gemini/siri", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "O campo 'message' é obrigatório." });
    }

    try {
      const ai = getAiClient();
      
      // Formatting context instructions to make Google Gemini sound like a macOS/Apple helper/Siri.
      const systemInstruction = 
        "Você é a Siri, o assistente virtual inteligente e prestativo do sistema operacional macOS. " +
        "Sua personalidade é elegante, prestativa, ágil, sutilmente irônica e calorosa. " +
        "Responda sempre em Português do Brasil de forma concisa e natural. Adapte-se ao contexto de um computador Mac. " +
        "Se o usuário pedir para abrir aplicativos ou realizar ajustes, responda de forma lúdica dizendo que a ação foi simulada com sucesso.";

      // Structure chat contents
      const chatHistory = history || [];
      const contents = [
        ...chatHistory.map((item: any) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 1.0,
        },
      });

      const replyText = response.text || "Desculpe, não consegui processar isso.";
      return res.json({ reply: replyText });
    } catch (apiError: any) {
      console.error("Erro na API do Gemini:", apiError);
      // Fallback response with beautiful humor in case API key is missing or invalid
      return res.json({
        reply: "Olá! Eu sou a Siri simulada localmente. Atualmente estou funcionando em modo offline " +
               "porque a chave de API (GEMINI_API_KEY) não foi fornecida ou é inválida nos Ajustes. " +
               "Mas você pode interagir com todas as minhas janelas, arquivos, terminal e calculadora!",
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error("Erro geral no endpoint da Siri:", error);
    return res.status(500).json({ error: error.message || "Erro desconhecido no servidor." });
  }
});

// System Info & Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Configure Vite middleware or static serving
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configurando servidor em modo de DESENVOLVIMENTO (Vite Middleware)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Configurando servidor em modo de PRODUÇÃO (Arquivos estáticos em /dist)");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[macOS Server] Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

configureApp().catch((err) => {
  console.error("Falha ao inicializar o servidor Express + Vite:", err);
});
