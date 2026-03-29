import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_PAGES = 60;

function extractUserTexts(content: unknown): string {
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .filter(
      (c): c is { type?: string; text?: string } =>
        c !== null && typeof c === "object",
    )
    .filter((c) => c.type === "input_text" || c.type === "quoted_text")
    .map((c) => c.text || "")
    .filter(Boolean)
    .join("\n");
}

function extractAssistantTexts(content: unknown): string {
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .filter(
      (c): c is { type?: string; text?: string } =>
        c !== null && typeof c === "object",
    )
    .filter((c) => c.type === "output_text")
    .map((c) => c.text || "")
    .filter(Boolean)
    .join("\n\n");
}

function itemToMarkdown(item: Record<string, unknown>): string {
  const t = String(item.type || "");
  if (t === "chatkit.user_message" || t === "user_message") {
    const texts = extractUserTexts(item.content);
    return texts ? `## User\n\n${texts}\n\n` : "";
  }
  if (t === "chatkit.assistant_message" || t === "assistant_message") {
    const texts = extractAssistantTexts(item.content);
    return texts ? `## Assistant\n\n${texts}\n\n` : "";
  }
  if (t === "chatkit.task" || t === "task") {
    const heading = typeof item.heading === "string" ? item.heading : "";
    const summary = typeof item.summary === "string" ? item.summary : "";
    const parts = [heading, summary].filter(Boolean);
    if (parts.length) {
      return `## Task\n\n${parts.join("\n\n")}\n\n`;
    }
  }
  return "";
}

function threadItemsToMarkdown(items: Record<string, unknown>[], title: string): string {
  const header = [
    `# ${title}`,
    "",
    `_Exported ${new Date().toISOString()}_`,
    "",
    "---",
    "",
  ].join("\n");
  const chunks = [header];
  for (const item of items) {
    const md = itemToMarkdown(item);
    if (md) {
      chunks.push(md);
    }
  }
  return chunks.join("");
}

async function fetchAllChatKitThreadItems(
  apiKey: string,
  threadId: string,
): Promise<Record<string, unknown>[]> {
  const base = `https://api.openai.com/v1/chatkit/threads/${encodeURIComponent(threadId)}/items`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Beta": "chatkit_beta=v1",
  };
  const all: Record<string, unknown>[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const u = new URL(base);
    u.searchParams.set("limit", "100");
    u.searchParams.set("order", "asc");
    if (after) {
      u.searchParams.set("after", after);
    }
    const res = await fetch(u, { headers });
    const data = (await res.json()) as {
      data?: Record<string, unknown>[];
      has_more?: boolean;
      last_id?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data.error?.message || "Failed to list thread items");
    }
    const batch = Array.isArray(data.data) ? data.data : [];
    all.push(...batch);
    if (data.has_more !== true || batch.length === 0) {
      break;
    }
    after = data.last_id || null;
    if (!after) {
      break;
    }
  }
  return all;
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
    threadId?: unknown;
  };
  const threadId =
    typeof body.threadId === "string" && body.threadId.length > 0 ? body.threadId : null;

  if (!threadId) {
    res.status(400).json({ error: "Missing threadId" });
    return;
  }

  try {
    const items = await fetchAllChatKitThreadItems(apiKey, threadId);
    const markdown = threadItemsToMarkdown(items, "Customer briefing");
    res.status(200).json({
      markdown,
      filename: `customer-briefing-${threadId.slice(-8)}.md`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed";
    res.status(500).json({ error: msg });
  }
}
