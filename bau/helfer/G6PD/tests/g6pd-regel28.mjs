// Regel 28 + Smoke: Basis R-4252 gegen G6+d – leeres Projekt, STIMME-Take ohne Chor und v1-Chor (Terz 80er) ergeben dasselbe
// Projekt-JSON (ohne Take-Kennungen/Zeiten) und dieselben Chor-Daten; keine Seitenfehler beim Start (6 Formate).
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const neu = process.argv[2] || path.join(here, '..', 'index.html'), alt = process.argv[3] || path.join(here, '..', '..', '..', 'snapshots', 'R-4252.html');
const b = await chromium.launch(); const res = {}, errs = [];
async function run(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); p.on('pageerror', e => errs.push(path.basename(file) + ': ' + e));
  await p.goto('file://' + file); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => {
    const D = window.SYNQUENZER, strip = o => JSON.stringify(o, (k, v) => (k === 'take' && typeof v === 'string' ? 'T' : k === 'saved' || k === 'time' || k === 'uid' || k === 'id' && typeof v === 'string' && v.length > 8 ? 0 : v));
    const empty = strip(D.project());
    const sr = 48000, pcm = []; for (const m of [60, 64, 67, 72]) { const f = 440 * Math.pow(2, (m - 69) / 12); for (let i = 0; i < 19200; i++) pcm.push(Math.round(8000 * Math.sin(2 * Math.PI * f * i / sr) * Math.min(1, i / 480, (19200 - i) / 480))); }
    await D.tkInject({pcm, sr, scene: 0, len: 2}); const st = D.tkInfo().stimme, r = {t: st, s: 0};
    const noChor = strip(D.project().tracks[st]);
    await D.g6Make(r, 'terz', 'up', '80'); await D.g6Wait(r);
    const v1 = JSON.stringify(D.g6Info(r).chor), fx = JSON.stringify(D.getBusFx());
    return {empty, noChor, v1, fx};
  });
  await p.close(); return r;
}
const A = await run(alt), N = await run(neu);
for (const k of Object.keys(A)) { let i = 0; const a = A[k], n = N[k]; while (i < a.length && a[i] === n[i]) i++; res['Regel 28 ' + k] = a === n ? 'ok' : 'FEHLER @' + i + ' ' + a.slice(Math.max(0, i - 60), i + 40) + ' | ' + n.slice(Math.max(0, i - 60), i + 40); }
for (const [w, h] of [[320, 568], [375, 667], [390, 844], [568, 320], [844, 390], [926, 428]]) {
  const p = await b.newPage({viewport: {width: w, height: h}}); p.on('pageerror', e => errs.push(w + 'x' + h + ': ' + e));
  await p.goto('file://' + neu); await p.waitForTimeout(900);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1); res['Smoke ' + w + '×' + h] = sw ? 'ok' : 'FEHLER Überbreite'; await p.close();
}
console.log(JSON.stringify(res, null, 1)); console.log('pageerrors', JSON.stringify(errs));
const bad = Object.values(res).filter(v => v !== 'ok').length; console.log(bad ? 'FEHLER: ' + bad : 'ALLE OK');
await b.close(); process.exit(bad || errs.length ? 1 : 0);
