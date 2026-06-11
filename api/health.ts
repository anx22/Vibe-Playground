import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Liveness probe. We don't report "configured" by env-var name — on Vercel the gateway
 * authenticates via OIDC automatically, so the only authoritative test is an actual render.
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true });
}
