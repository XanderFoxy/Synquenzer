// DRUM1 Kern-Test: synthetisches Lied (Drum-Loop + Bass + Fläche, bekannte Kick/Snare-Zeiten) → Spektral-Seite → Zerlegen (schnell)
// → Drum-Ebene rendern → Kit-Erkennung (spk11Hits, wie „Szenen anlegen“) → Treffer/Fehlalarme je Kick/Snare/Hi-Hat (±50 ms).
// Aufruf: node kern.mjs <index.html> [LIEDER=bauer,dicht,intro,p80,p128,p174,hart] [DUMP=dir]  → Zeilen „ERG <lied> …“ + Summe.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
import { SONGS as S0 } from './songs.mjs'; import { LIEDER as LP } from './lieder-pruef.mjs'; import { hart } from './hart.mjs';
const SONGS = Object.assign({}, S0, {hart});
for (const [k, f] of Object.entries(LP)) SONGS[k] = () => { const L = f(); L.truth = Object.assign({}, L.truth, {hat: L.truth.hatC.concat(L.truth.hatO)}); return L; };
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname);
const sd = fs.mkdtempSync(path.join(here, 'srv-')); fs.copyFileSync(file, path.join(sd, 'index.html')); fs.writeFileSync(path.join(sd, 'version.json'), '{"version":"4.87.0"}');
const port = 8870 + Math.floor(Math.random() * 30), py = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {cwd: sd, stdio: 'ignore'});
await new Promise(r => setTimeout(r, 700)); const url = 'http://127.0.0.1:' + port + '/index.html';
const b = await chromium.launch(), DUMP = process.env.DUMP, tot = {}; let errsAll = 0;
for (const name of (process.env.LIEDER || 'bauer,dicht,intro,p80,p128,p174,hart').split(',')) {
  const L = SONGS[name](), errs = [], ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|abspann-logo/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk11, null, {timeout: 90000}); await p.waitForTimeout(600);
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(160); };
  const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
  const idle = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 300000});
  await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(300); await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
  { const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 8000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: name + '.wav', mimeType: 'audio/wav', buffer: L.wav}); }
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 120000}); await p.waitForTimeout(300);
  await tap(await btn('Zerlegen')); await p.waitForTimeout(300); { const zb = await btn('Zerlegen (schnell'); if (zb) await tap(zb); } await p.waitForTimeout(200); await idle(); await p.waitForTimeout(300);
  const R = await p.evaluate(async (dump) => {
    const U = __spk.page.ui(), sr = U.meta.sr, g = spk1Grid0(U), lid = (U.meta.layers.find(l => l.art === 'drums') || {}).id; if (!lid) return {err: 'keine Drum-Ebene'};
    const a0 = ((g.off % g.bar) + g.bar) % g.bar, a = Math.round(a0 * sr), x = await spk11Render(U, lid, a, U.meta.n, null), stepS = g.beat / 4, n = Math.floor((x.length / sr - 0.1) / stepS);
    const t0 = performance.now(), hs = spk11Hits(x, sr, stepS, n, null), ms = performance.now() - t0;
    return {sr, a0, stepS, bpm: g.bpm, bar: g.bar, ms, hits: hs.map(h => [+(a0 + h.k * stepS).toFixed(4), h.w]), info: hs.info || null, x: dump ? (() => { const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); })() : null};
  }, !!DUMP);
  if (R.err) { console.log('ERG ' + name + ' FEHLER ' + R.err); continue; }
  if (DUMP) { fs.mkdirSync(DUMP, {recursive: true}); fs.writeFileSync(path.join(DUMP, name + '.f32'), Buffer.from(R.x, 'base64')); fs.writeFileSync(path.join(DUMP, name + '.json'), JSON.stringify({sr: R.sr, a0: R.a0, stepS: R.stepS, bar: R.bar, bpm: R.bpm, truth: {kick: L.truth.kick, snare: L.truth.snare, hat: L.truth.hat}})); }
  const sc = (w, tru) => { const pr = R.hits.filter(x => x[1] === w); let hit = 0; const used = new Set(); for (const t of tru) { const i = pr.findIndex((x, k) => !used.has(k) && Math.abs(x[0] - t) <= 0.05); if (i >= 0) { used.add(i); hit++; } } return {wahr: tru.length, treffer: hit, zuviel: pr.length - hit}; };
  const z = {kick: sc('k', L.truth.kick), snare: sc('s', L.truth.snare), hihat: sc('h', L.truth.hat)};
  for (const [w, v] of Object.entries(z)) { const t = tot[w] || (tot[w] = {wahr: 0, treffer: 0, zuviel: 0}); t.wahr += v.wahr; t.treffer += v.treffer; t.zuviel += v.zuviel; }
  errsAll += errs.length;
  console.log('ERG ' + name + ' bpm ' + (+R.bpm).toFixed(2) + ' ms ' + R.ms.toFixed(1) + ' kick ' + z.kick.treffer + '/' + z.kick.wahr + ' +' + z.kick.zuviel + ' · snare ' + z.snare.treffer + '/' + z.snare.wahr + ' +' + z.snare.zuviel + ' · hihat ' + z.hihat.treffer + '/' + z.hihat.wahr + ' +' + z.hihat.zuviel + ' · info ' + JSON.stringify(R.info && {tK: R.info.tK, tS: R.info.tS, kick: R.info.kick, snare: R.info.snare}) + (errs.length ? ' KONSOLE ' + JSON.stringify(errs) : ''));
  await ctx.close();
}
const f = w => tot[w] ? tot[w].treffer + '/' + tot[w].wahr + ' +' + tot[w].zuviel : '-';
console.log('SUMME kick ' + f('kick') + ' · snare ' + f('snare') + ' · hihat ' + f('hihat') + ' · konsole ' + errsAll);
await b.close(); py.kill(); fs.rmSync(sd, {recursive: true, force: true});
