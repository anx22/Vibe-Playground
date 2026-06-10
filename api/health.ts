import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Probe for the client: is the gateway key configured on the server? */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const configured = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
  res.status(200).json({ ok: true, configured });
}
