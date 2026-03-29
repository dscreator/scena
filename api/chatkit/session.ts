import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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

  const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as {
    user?: unknown;
  };
  const user =
    typeof body.user === "string" && body.user.length > 0 ? body.user : "anonymous";

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
        error:
          typeof data.error === "object" &&
          data.error !== null &&
          typeof (data.error as { message?: unknown }).message === "string"
            ? (data.error as { message: string }).message
            : "Failed to create ChatKit session.",
        details: data,
      });
      return;
    }

    res.status(200).json({ client_secret: (data as { client_secret?: string }).client_secret });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}
