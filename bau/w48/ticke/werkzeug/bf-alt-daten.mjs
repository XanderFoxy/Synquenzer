// Erzeugt Speicherdaten im Format der Vorlage 0.2.1: Kurzform im alten App-Stand per Oberfläche ausfüllen (erfundene Antworten).
// Aufruf: node bf-alt-daten.mjs <basis-url der alten App, z. B. http://127.0.0.1:8951/ticke/> <ausgabe.json>
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); const fs = require('fs');
const [basis, aus] = process.argv.slice(2);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
const p = await c.newPage(); const fehler = []; p.on('pageerror', (e) => fehler.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
await p.goto(basis + '?test=1#fragen/bigfive/start'); await p.waitForFunction(() => window.__ticke);
await p.evaluate(() => window.__ticke.speicher.setzeEinwilligung(true));
await p.waitForSelector('.frage');
// erfundenes Muster (IPIP-Richtung): O hoch, C niedrig, E gemischt, A eher hoch, N hoch
const ziel = { O: 5, C: 2, E: 3, A: 4, N: 4 };
for (let i = 0; i < 30; i++) {
  await p.waitForSelector('.frage[data-bereit="1"]');
  const info = await p.evaluate(() => { const t = document.querySelector('#fb-text').textContent; const q = window.__bigfive ? window.__bigfive.FRAGEN.find((x) => x.t === t) : null; return q ? { b: q.b, k: q.k } : null; });
  let w = info ? ziel[info.b] : 3; if (info && info.k < 0) w = 6 - w;
  if (info && info.b === 'E') w = i % 2 ? 5 : 1;   // E: in verschiedene Richtungen
  await p.click(`.antwort[data-wert="${w}"]`);
  await p.waitForTimeout(420);
}
await p.waitForSelector('.bf-bereich', { timeout: 8000 });
const daten = await p.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('ticke.')).map((k) => [k, localStorage.getItem(k)])));
fs.writeFileSync(aus, JSON.stringify(daten, null, 1));
console.log('Schlüssel:', Object.keys(daten).join(', '), '| Fehler:', fehler.length, fehler.slice(0, 3));
await b.close();
