import type { VercelRequest, VercelResponse } from "@vercel/node";

function chatKitEnabled(): boolean {
  const disabled =
    process.env.CHATKIT_UI === "off" ||
    process.env.CHATKIT_UI === "0" ||
    process.env.CHATKIT_UI === "false";
  if (disabled) {
    return false;
  }
  return Boolean(process.env.CHATKIT_WORKFLOW_ID?.trim());
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ chatKit: chatKitEnabled() });
}
