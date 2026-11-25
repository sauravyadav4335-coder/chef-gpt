// The server keeps Gemini credentials private and serves the browser app.
import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 3000;
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const maxMessageLength = 2000;
const maxHistoryEntries = 10;
const maxHistoryTextLength = 2000;

const systemInstruction = `You are Chef.GPT, a friendly, practical cooking assistant.
- Suggest recipes based on the user's ingredients and preferences.
- When useful, provide a recipe title, ingredients, numbered steps, and an estimated time.
- Ask a concise follow-up question when important information is missing.
- Suggest reasonable ingredient substitutions when appropriate.
- Never guarantee that a recipe is allergy-safe. Remind users to check ingredient labels and prevent cross-contamination.
- Avoid medical advice and do not present uncertain nutrition information as exact.
- Politely redirect questions that are unrelated to cooking.`;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(publicDirectory));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/chat", async (request, response) => {
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ error: "Please send a message to Chef.GPT." });
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return response.status(400).json({ error: "Please enter a message before sending." });
  }

  const message = body.message.trim();
  if (message.length > maxMessageLength) {
    return response.status(400).json({
      error: `Please keep your message under ${maxMessageLength} characters.`,
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({
      error: "Chef.GPT needs a Gemini API key. Add GEMINI_API_KEY to your .env file and restart the server.",
    });
  }

  // Keep only well-formed, recent turns so the model receives a bounded conversation.
  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (entry) =>
            entry &&
            typeof entry === "object" &&
            (entry.role === "user" || entry.role === "model") &&
            typeof entry.text === "string" &&
            entry.text.trim().length > 0,
        )
        .slice(-maxHistoryEntries)
        .map((entry) => ({
          role: entry.role,
          parts: [{ text: entry.text.trim().slice(0, maxHistoryTextLength) }],
        }))
    : [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] },
      ],
      config: { systemInstruction },
    });

    const reply = result.text?.trim();
    if (!reply) {
      return response.status(502).json({
        error: "Chef.GPT couldn't create a reply just now. Please try again.",
      });
    }

    return response.json({ reply });
  } catch {
    // Avoid returning provider details or credentials to the browser.
    console.error("Chef.GPT could not complete the Gemini request.");
    return response.status(502).json({
      error: "Chef.GPT couldn't reach the cooking assistant right now. Please try again in a moment.",
    });
  }
});

// Give malformed JSON a clear client error instead of Express's default HTML page.
app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({ error: "The request was not valid JSON." });
  }
  if (error.type === "entity.too.large") {
    return response.status(413).json({ error: "That request is too large. Please shorten your message." });
  }
  console.error("Chef.GPT received an unexpected server error.");
  return response.status(500).json({ error: "Something went wrong on the server. Please try again." });
});

// Exporting the app keeps it easy to test without starting another server.
export { app };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`Chef.GPT is ready at http://localhost:${port}`);
  });
}
