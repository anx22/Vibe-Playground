// Headless screenshot of the local preview so the design can be self-verified.
// Usage: node scripts/shot.mjs <url> <outfile> [width] [height]
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH ?? "/opt/node22/lib/node_modules/playwright");

const url = process.argv[2] ?? "http://localhost:4173/#preview";
const out = process.argv[3] ?? "/tmp/shot.png";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);

const exe =
  process.env.PW_CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1400); // let the spring animation settle
await page.screenshot({ path: out });
await browser.close();
console.log("shot ->", out);
