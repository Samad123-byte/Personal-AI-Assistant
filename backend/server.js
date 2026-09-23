import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 5000;
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://abdul-khan.app.n8n.cloud/webhook/personal-assistant";

// Middleware
app.use(cors()); // fine here: frontend and backend share one domain in production
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Personal AI Assistant API is running",
  });
});

// Chat route
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  console.log("User message:", message);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        sessionId: sessionId,
      }),
    });

    const data = await response.json();

    res.json({
      reply: data.reply,
    });
  } catch (error) {
    console.error("Error connecting to n8n:", error);

    res.status(500).json({
      reply: "Sorry, I couldn't connect to the AI assistant.",
    });
  }
});

// Only start a listening server locally — on Vercel this file is
// imported as a serverless function handler instead (see vercel.json).
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
