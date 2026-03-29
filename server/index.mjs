import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 8787;

app.use(cors({ origin: true }));
app.use(express.json());

app.post("/api/chatkit/session", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID;

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
