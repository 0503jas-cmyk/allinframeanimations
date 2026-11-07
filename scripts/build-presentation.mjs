// Renders submission/presentation/slides.html to submission/SAVORA-presentation.pdf.
// Usage: LIVE_URL=https://… node scripts/build-presentation.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = resolve(fileURLToPath(import.meta.url), "../..");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`file://${root}/submission/presentation/slides.html`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
if (process.env.LIVE_URL) {
  await page.evaluate((url) => {
    document.getElementById("live-url").textContent = `Live demo: ${url.replace(/^https?:\/\//, "")}`;
  }, process.env.LIVE_URL);
}
await page.pdf({
  path: `${root}/submission/SAVORA-presentation.pdf`,
  width: "1920px",
  height: "1080px",
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log("Wrote submission/SAVORA-presentation.pdf");
