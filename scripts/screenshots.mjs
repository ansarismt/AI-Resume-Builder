import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "docs", "screenshots");
const origin = "http://127.0.0.1:8081";
const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");
const server = spawn(
  process.execPath,
  [vite, "--host", "127.0.0.1", "--port", "8081", "--strictPort"],
  { cwd: root, stdio: "inherit" },
);
let browser;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Vite exited before it was ready (code ${server.exitCode}).`);
    }
    try {
      const response = await fetch(`${origin}/scripts/screenshots-gallery.html`);
      if (response.ok) return;
    } catch {
      await delay(500);
      continue;
    }
    await delay(500);
  }
  throw new Error("Vite did not become ready within 30 seconds.");
}

try {
  await mkdir(output, { recursive: true });
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(`${origin}/scripts/screenshots-gallery.html?hero=1`, { waitUntil: "networkidle" });
  await page.locator(".live-preview .rd__name").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, "editor.png"), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/scripts/screenshots-gallery.html`, { waitUntil: "networkidle" });
  await page.locator(".template-card").nth(19).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, "templates.png"), fullPage: true });
  console.log(`Screenshots saved to ${path.relative(root, output)}.`);
} finally {
  if (browser) await browser.close();
  server.kill();
}
