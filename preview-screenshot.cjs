const { chromium } = require("C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  await page.goto("file:///C:/Users/HP/Documents/P%C3%A1gina%20web/index.html", { waitUntil: "networkidle" });
  await page.screenshot({ path: "preview-home.png", fullPage: false });
  await page.locator("#parcelas").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "preview-riberas-antuco.png", fullPage: false });
  await page.locator("#listingGrid").screenshot({ path: "preview-proyectos.png" });
  await page.locator("[data-open-gallery='Riberas de Antuco']").click();
  await page.screenshot({ path: "preview-galeria-riberas-antuco.png", fullPage: false });
  await browser.close();
})();
