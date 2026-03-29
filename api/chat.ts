import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_MESSAGE_LEN = 16000;

function extractOutputText(data: Record<string, unknown>): string {
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
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const part of content) {
      if (typeof part !== "object" || part === null) {
        continue;
      }
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") {
        return text;
      }
    }
  }
  return "";
}

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
  if (!apiKey) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    return;
  }

  const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as {
    message?: unknown;
  };
  const message =
    typeof body.message === "string" ? body.message.slice(0, MAX_MESSAGE_LEN).trim() : "";

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
      body: JSON.stringify({
        model,
        input: message,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const errMsg =
        typeof data.error === "object" &&
        data.error !== null &&
        typeof (data.error as { message?: unknown }).message === "string"
          ? (data.error as { message: string }).message
          : "OpenAI request failed";
      res.status(response.status).json({ error: errMsg, details: data });
      return;
    }

    const output_text = extractOutputText(data) || "(No text in response)";
    res.status(200).json({ output_text, model });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ error: msg });
  }
}
