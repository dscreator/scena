import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 8787;

app.use(cors({ origin: true }));
app.use(express.json());

function chatKitEnabled() {
  const disabled =
    process.env.CHATKIT_UI === "off" ||
    process.env.CHATKIT_UI === "0" ||
    process.env.CHATKIT_UI === "false";
  if (disabled) {
    return false;
  }
  return Boolean(process.env.CHATKIT_WORKFLOW_ID?.trim());
}

app.get("/api/config", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ chatKit: chatKitEnabled() });
});

const MAX_MESSAGE_LEN = 16000;

function extractOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }
  const output = data.output;
  if (!Array.isArray(output)) {
    return "";
  }
  for (const item of output) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const content = item.content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const part of content) {
      if (typeof part !== "object" || part === null) {
        continue;
      }
      if (typeof part.text === "string") {
        return part.text;
      }
    }
  }
  return "";
}

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY on the server." });
    return;
  }

  const message =
    typeof req.body?.message === "string"
      ? req.body.message.slice(0, MAX_MESSAGE_LEN).trim()
      : "";

  if (!message) {
    res.status(400).json({ error: "Missing or empty message" });
    return;
  }

  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: message }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg =
        data?.error?.message ?? (typeof data.error === "string" ? data.error : "OpenAI request failed");
      res.status(response.status).json({ error: errMsg, details: data });
      return;
    }

    const output_text = extractOutputText(data) || "(No text in response)";
    res.json({ output_text, model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.post("/api/chatkit/session", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const workflowId = process.env.CHATKIT_WORKFLOW_ID?.trim();

  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY on the server." });
    return;
  }
  if (!workflowId) {
    res.status(500).json({ error: "Missing CHATKIT_WORKFLOW_ID on the server." });
    return;
  }

  const user =
    typeof req.body?.user === "string" && req.body.user.length > 0
      ? req.body.user
      : "anonymous";

  try {
    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.error?.message ?? "Failed to create ChatKit session.",
        details: data,
      });
      return;
    }

    res.json({ client_secret: data.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`ChatKit session server listening on http://localhost:${PORT}`);
});
