import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialize the Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. AI features will fall back to smart simulated responses.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: AI Assistant Chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, bookContext, highlightedText } = req.body;
      const client = getGeminiClient();

      let systemPrompt = "You are a highly knowledgeable and supportive AI Reading Companion. " +
        "You help users understand books, explain difficult concepts, summarize key points, " +
        "and provide engaging analysis. Always keep your replies concise, structured, and easy to read. " +
        "Use formatting like bullet points and bold text where appropriate.";

      if (bookContext) {
        systemPrompt += `\nCurrently, the user is reading the book: "${bookContext.title}" by ${bookContext.author || "Unknown"}.`;
      }
      if (highlightedText) {
        systemPrompt += `\nThe user has highlighted the following text in the book and wants your analysis of it:\n"${highlightedText}"`;
      }

      if (!client) {
        // Fallback simulated response when API key is missing
        console.log("Using simulated response since GEMINI_API_KEY is missing.");
        const simulatedText = simulateReadingAssistantResponse(message, highlightedText, bookContext);
        return res.json({ text: simulatedText, isSimulated: true });
      }

      // Convert history to format suitable for chat or contents
      // Note: we can use chats or simple generateContent
      // Let's use simple contents generation for robust stateless API call
      const contentsList: any[] = [];
      
      // Add history if present
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contentsList.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        });
      }

      // Add the latest user message
      contentsList.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "I was unable to formulate a response. Please try again." });
    } catch (error: any) {
      console.error("Gemini API Error in /api/gemini/chat:", error);
      res.status(500).json({ error: "Failed to communicate with AI Companion: " + error.message });
    }
  });

  // API Route: Mock S3/FastAPI Upload Signer (as specified in 3.2 for ingestion)
  app.post("/api/upload/sign", (req, res) => {
    const { filename, fileType } = req.body;
    // Section 3.2 describes "Immediate background request to FastAPI for a secure AWS S3 target URL"
    // We provide a mock secure target URL and a mock document ID
    const randomId = Math.random().toString(36).substring(2, 11);
    res.json({
      uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/uploads/${randomId}-${filename}?signature=mock_sig_12345`,
      documentId: `doc-${randomId}`,
      message: "Target upload URL generated successfully."
    });
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function simulateReadingAssistantResponse(message: string, highlightedText?: string, bookContext?: any): string {
  const lowerMsg = message.toLowerCase();
  let contextName = bookContext ? `"${bookContext.title}"` : "the book";
  
  if (highlightedText) {
    if (lowerMsg.includes("explain") || lowerMsg.includes("what does this mean")) {
      return `Here is an analysis of your highlighted text: **"${highlightedText}"**\n\n` +
        `1. **Core Meaning**: This passage discusses core thematic elements in ${contextName}, highlighting key motivations and conflict.\n` +
        `2. **Literary Devices**: The author employs descriptive metaphors to convey deeper psychological states.\n` +
        `3. **Key Takeaway**: Pay attention to how this sets up subsequent chapters or character arcs!`;
    }
    if (lowerMsg.includes("highlight")) {
      return `I've registered your highlight: **"${highlightedText}"**.\n\n` +
        `This passage underscores an important turning point. Would you like me to summarize its broader connection to the book's narrative?`;
    }
    return `Looking at this highlighted section from ${contextName}:\n\n` +
      `> *"${highlightedText}"*\n\n` +
      `This highlights a key tension or concept. How does this connect with your thoughts so far? Let me know if you want me to explain it further!`;
  }

  if (lowerMsg.includes("summarize") || lowerMsg.includes("summary")) {
    return `### Chapter Summary for ${contextName}\n\n` +
      `Here is a concise breakdown of the major themes and plot points so far:\n\n` +
      `- **Introduction of Tension**: The primary conflicts are introduced with key characters establishing their stakes.\n` +
      `- **Structural Shifts**: The narrative shifts from setting the scene to high-focus development.\n` +
      `- **Thematic Resonance**: Focus remains on resolution, growth, and learning.\n\n` +
      `Is there a specific section or character dynamic you would like to explore deeper?`;
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi ") || lowerMsg.includes("hey")) {
    return `Hello! 👋 I am your **AI Reading Companion**. I'm ready to assist you as you read ${contextName}.\n\n` +
      `You can:\n` +
      `- Highlight text to ask for explanations or definitions.\n` +
      `- Ask me to summarize or clarify complex concepts.\n` +
      `- Ask questions about characters, themes, or historical context.`;
  }

  return `I'm analyzing your query about ${contextName}:\n\n` +
    `"${message}"\n\n` +
    `As your reading companion, I recommend exploring how this concept relates to the broader themes of the book. In many similar works, this leads to significant growth or resolution. Feel free to ask more specific questions or highlight a passage!`;
}

startServer();
