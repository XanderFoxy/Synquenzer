// KONUX: Format bleibt 5, alte Projekte bleiben Zeichen für Zeichen gleich: ein Projekt mit Marken, Blöcken und konsolidierten
// Teilen (gebaut in 4.30.0) → in beiden Fassungen geladen (parseProjectFile + switchProject) → serializeProject identisch
import { createRequire } from 'module';
import { open, buildSong, ALT, NEU } from './lib.mjs';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const out = [], ok = (n, c, x) => { const r = {test: 'format', fall: n, ok: !!c, ...(x ? {info: x} : {})}; out.push(r); console.log(JSON.stringify(r)); };
const A = await open({app: ALT, browser}); await buildSong(A.p, {view: false});
const txt = await A.p.evaluate(() => { SYNQUENZER.blockMake(0, 1); SYNQUENZER.konsolidieren(6, 9, 'Hook'); SYNQUENZER.blockMake(6, 9, 'Kern'); return serializeProject(); });
const load = async p => p.evaluate(t => { const r = parseProjectFile(JSON.parse(t)); if (!r) return null; switchProject(r.project, {}); return serializeProject(); }, txt);
const a = await load(A.p); await A.close();
const N = await open({app: NEU, browser}); const n = await load(N.p); const fmt = await N.p.evaluate(() => SQStore.fmtOf(JSON.parse(serializeProject())));   // Datei-Format (Schreibwert nach Inhalt)
ok('Projekt (Marken, Blöcke, kons) geladen: 4.30.0 und KONUX schreiben es Zeichen für Zeichen gleich', a && n && a === n, {laenge: a && a.length, gleich: a === n});
ok('Format bleibt 5', fmt === 5, fmt);
ok('keine Konsolen-Fehler', !N.errs.length, N.errs);
await N.close(); await browser.close();
process.exitCode = out.every(r => r.ok) ? 0 : 1;
