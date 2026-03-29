/**
 * Fetch all ChatKit thread items (paginated) and build a Markdown briefing doc.
 */

const MAX_PAGES = 60;

function extractUserTexts(content) {
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .filter((c) => c && (c.type === "input_text" || c.type === "quoted_text"))
    .map((c) => c.text || "")
    .filter(Boolean)
    .join("\n");
}

function extractAssistantTexts(content) {
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .filter((c) => c && c.type === "output_text")
    .map((c) => c.text || "")
    .filter(Boolean)
    .join("\n\n");
}

function itemToMarkdown(item) {
  const t = item?.type || "";
  if (t === "chatkit.user_message" || t === "user_message") {
    const texts = extractUserTexts(item.content);
    return texts ? `## User\n\n${texts}\n\n` : "";
  }
  if (t === "chatkit.assistant_message" || t === "assistant_message") {
    const texts = extractAssistantTexts(item.content);
    return texts ? `## Assistant\n\n${texts}\n\n` : "";
  }
  if (t === "chatkit.task" || t === "task") {
    const parts = [item.heading, item.summary].filter(Boolean);
    if (parts.length) {
      return `## Task\n\n${parts.join("\n\n")}\n\n`;
    }
  }
  return "";
}

export function threadItemsToMarkdown(items, title = "Customer briefing") {
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

export async function fetchAllChatKitThreadItems(apiKey, threadId) {
  const base = `https://api.openai.com/v1/chatkit/threads/${encodeURIComponent(threadId)}/items`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Beta": "chatkit_beta=v1",
  };
  const all = [];
  let after = null;
  let page = 0;

  while (page < MAX_PAGES) {
    page += 1;
    const u = new URL(base);
    u.searchParams.set("limit", "100");
    u.searchParams.set("order", "asc");
    if (after) {
      u.searchParams.set("after", after);
    }
    const res = await fetch(u, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || "Failed to list thread items");
      err.status = res.status;
      err.details = data;
      throw err;
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
