// SPK11 – Spektral-Seite → Szenen. Synthetisches Lied (120 BPM, 4/4, Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 Takte; Bass, Drums, Flächen)
// per Touch: Datei laden → Zerlegen → Ebenen-Menü ⋯ „Klang nachbauen“ (Bass) → Ansicht ▾ „Szenen anlegen …“ → Teile prüfen → anlegen →
// Szenen/Clips/Noten zählen (Bass-Noten je Teil, Kick/Snare auf Kit-Tönen), Nachbau-Klang auf der Bass-Spur → Speichern/Laden (Projektdatei) →
// ↶ (alles weg) → Auswahl (Refrain 1, < 300 Hz) → nur dieser Teil, nur Ebenen mit Noten darin → anlegen → ↶.
// Quer (926×428, 926×370): Blatt-Maße (Knöpfe ≥ 44 px, nichts ragt heraus) + anlegen + ↶.  Aufruf: node spk11-test.mjs <abs. index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
/* ---- synthetisches Lied ---- */
const SR = 44100, BAR = 2, BARS = 32, N = (BARS * BAR + 1) * SR, L = new Float32Array(N), Rr = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
const add = (i0, x, gl, gr) => { for (let i = 0; i < x.length && i0 + i < N; i++) { L[i0 + i] += x[i] * gl; Rr[i0 + i] += x[i] * (gr ?? gl); } };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const CH = {S: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], R: [[53, 57, 60], [48, 52, 55], [55, 59, 62], [57, 60, 64]]};
const partOf = b => (Math.floor(b / 8) % 2 ? 'R' : 'S'), truthBass = [];
for (let b = 0; b < BARS; b++) {
  const P = partOf(b), ch = CH[P][b % 4], t0 = b * BAR, loud = P === 'R' ? 1.35 : 1;
  for (let q = 0; q < 4; q++) {   // Bass: Viertel, Grundton −12
    const m = ch[0] - 12, f = hz(m), n = Math.round(0.42 * SR), x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.004) * Math.exp(-t * 3); let v = 0; for (let k = 1; k <= 6; k++) v += Math.sin(2 * Math.PI * f * k * t) / k; x[i] = v * e; }
    add(Math.round((t0 + q * 0.5) * SR), x, 0.22); truthBass.push({t: t0 + q * 0.5, m});
  }
  { const n = Math.round(BAR * SR), x = new Float32Array(n);   // Fläche: Dreiklang, ganzer Takt
    for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.08) * Math.min(1, (BAR - t) / 0.05); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * t) + 0.25 * Math.sin(4 * Math.PI * hz(m) * t); x[i] = v * e; }
    add(t0 * SR, x, 0.05 * loud, 0.06 * loud); }
  for (let q = 0; q < 4; q++) {   // Drums: Kick 1+3, Snare 2+4, Hi-Hat Achtel nur im Refrain
    const at = Math.round((t0 + q * 0.5) * SR);
    if (q % 2 === 0) { const n = Math.round(0.25 * SR), x = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (50 + 90 * Math.exp(-t * 30)) / SR; x[i] = Math.sin(ph) * Math.exp(-t * 14); } add(at, x, 0.55 * loud); }
    else { const n = Math.round(0.16 * SR), x = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const t = i / SR, w = rnd(); lp += 0.35 * (w - lp); x[i] = ((w - lp) * 0.8 + 0.4 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 22); } add(at, x, 0.4 * loud); }
    if (P === 'R') for (const o of [0, 0.25]) { const n = Math.round(0.04 * SR), x = new Float32Array(n); let p0 = 0; for (let i = 0; i < n; i++) { const w = rnd(); x[i] = (w - p0) * Math.exp(-i / SR * 90); p0 = w; } add(at + Math.round(o * SR), x, 0.12); }
  }
}
const wav = Buffer.alloc(44 + N * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4); wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(Rr[i] * 32767))), 46 + i * 4); }
const b = await chromium.launch();
const VIEWS = (process.env.VIEWS || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, full = W < H, errs = [], ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk11, null, {timeout: 60000}); await p.waitForTimeout(800);
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(160); };
  const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const idle = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 180000});
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(300); await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
  { const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: 'Testlied.wav', mimeType: 'audio/wav', buffer: wav}); }
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 120000}); await p.waitForTimeout(300);
  await tap(await btn('Zerlegen')); await p.waitForTimeout(300); { const zb = await btn('Zerlegen (schnell'); if (zb) await tap(zb); } await p.waitForTimeout(200); await idle(); await p.waitForTimeout(300);
  if (!(await p.evaluate(() => __spk.page.ui().meta.layers.some(l => l.art === 'pads')))) {   // dritte Ebene per Touch: Rest wählen, Frequenz-Auswahl 180–1400 Hz, In Ebene ▾ → + Pads
    await tap(await sel('#spk1Sheet .spk1-lr[data-l="rest"] .spk1-nm')); await p.waitForTimeout(200);
    await p.evaluate(() => { const U = __spk.page.ui(); U.sel = [{art: 'freq', t0: 0, t1: U.dur, f0: 180, f1: 1400, kt: 0, kf: 0}]; spk1SelDone(U); });
    await tap(await btn('In Ebene')); await p.waitForTimeout(250); await tap(await btn('+ Pads')); await idle(); await p.waitForTimeout(300);
    await p.evaluate(() => { const U = __spk.page.ui(); U.sel = []; spk1SelDone(U, ''); });
  }
  const LY = await p.evaluate(() => __spk.page.ui().meta.layers.map(l => ({id: l.id, art: l.art, name: l.name}))), bl = (LY.find(l => l.art === 'bass') || {}).id;
  ok(tag + ' zerlegt', LY.map(l => l.art), LY.length >= 3 && !!bl);
  const grid = await p.evaluate(() => __spk.page.ui().meta.grid); ok(tag + ' raster', grid, Math.abs(+grid.bpm - 120) < 1.5);
  if (full) {   // Ebenen-Menü ⋯ → Klang nachbauen (Bass): erst Noten finden, dann Nachbau
    await tap(await sel(`#spk1Sheet .spk1-lr[data-l="${bl}"] [data-a="lmore"]`)); await p.waitForTimeout(250);
    const kb = await sel('#spk1Sheet .spk1-dd [data-s11="klang"]'); await shot('10-ebenen-menue-klang');
    ok(tag + ' ebenen-menue-klang-da', !!kb, !!kb); await tap(kb);
    await p.waitForFunction(() => { const s = __spk.spk2 && __spk.spk2.klang && __spk.spk2.klang.stand(); return s && s.best && s.best.dist != null && !__spk.page.info().busy; }, null, {timeout: 240000}).catch(() => {});
    const ks = await p.evaluate(lid => ({st: __spk.spk2.klang.stand() && __spk.spk2.klang.stand().best, kl: __spk11.kl(lid), noten: (__spk.page.ui().meta.teil2.notes[lid] || []).length}), bl);
    await shot('11-klang-nachbauen'); ok(tag + ' klang-nachbauen-aus-ebenen-menue', {eng: ks.st && ks.st.eng, dist: ks.st && ks.st.dist, gemerkt: ks.kl, noten: ks.noten}, !!(ks.st && ks.kl && ks.noten > 0));
    await p.evaluate(() => { const U = __spk.page.ui(); if (U.dd) { U.dd.remove(); U.dd = null; } });
  }
  // Ansicht ▾ → Szenen anlegen …
  await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(250);
  await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
  await p.waitForFunction(() => { const P = __spk11.plan(); return P && !__spk.page.info().busy; }, null, {timeout: 120000}); await p.waitForTimeout(300);
  const P0 = await p.evaluate(() => __spk11.plan()), T0 = await p.evaluate(() => __spk11.teile());
  await shot('20-szenen-blatt');
  const bounds = P0.parts.map(x => x.A).slice(1), names = P0.parts.map(x => x.name).join(' | ');
  ok(tag + ' teile-erkannt', {names, bounds, bpm: T0 && T0.bpm}, P0.parts.length >= 3 && P0.parts.length <= 6 && /Strophe/.test(names) && /Refrain/.test(names) && [8, 16, 24].every(x => bounds.some(y => Math.abs(y - x) <= 1)));
  const lay = await p.evaluate(() => { const d = document.querySelector('.spk11-dd'); if (!d) return null; const R = d.getBoundingClientRect(), bs = [...d.querySelectorAll('button')], small = [];
    for (const x of bs) { x.scrollIntoView({block: 'nearest'}); const r = x.getBoundingClientRect(); if (r.height < 44 - 0.5 || r.left < R.left - 1 || r.right > R.right + 1) small.push(x.textContent.trim() + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    return {w: Math.round(R.width), h: Math.round(R.height), right: Math.round(R.right), bottom: Math.round(R.bottom), vw: innerWidth, vh: innerHeight, small, sx: document.documentElement.scrollWidth > innerWidth}; });
  ok(tag + ' blatt-masse', lay, lay && !lay.small.length && lay.right <= lay.vw && lay.bottom <= lay.vh && !lay.sx);
  const nt0 = await p.evaluate(() => S.tracks.length);
  await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]'));
  await p.waitForFunction(() => __spk11.last() && !__spk.page.info().busy, null, {timeout: 300000}); await p.waitForTimeout(400);
  const R1 = await p.evaluate(kit => { const r = __spk11.last(), out = {scenes: r.scenes, audio: r.audio, midi: r.midi, notes: r.notes, drums: r.drums, rows: r.rows.map(o => ({name: o.name, a: o.a, m: o.m, cA: o.clipsA, cM: o.clipsM, n: o.notes, klang: o.klang})), names: r.scenes.map(s => S.scenes[s].name), nt: S.tracks.length, undo: UNDO.length};
    const d = S.tracks.findIndex(t => t.kind === 'drum'); out.kit = r.scenes.map(s => { const c = S.tracks[d].clips[s]; const z = {k: 0, s: 0, h: 0, x: 0, kT: 0, sT: 0}; for (const n of (c && c.notes) || []) { const st = Math.round(n.t * 4) % 16; if (n.n === kit.k) { z.k++; if (st === 0 || st === 8) z.kT++; } else if (n.n === kit.s) { z.s++; if (st === 4 || st === 12) z.sT++; } else if (n.n === kit.h) z.h++; else z.x++; } return z; });
    const bo = r.rows.find(o => /bass/i.test(o.name)); out.bassN = bo && bo.m != null ? r.scenes.map(s => { const c = S.tracks[bo.m].clips[s]; return c ? c.notes.length : 0; }) : []; out.bassSnd = bo && bo.m != null ? S.tracks[bo.m].sound.name : null;
    out.audioOk = r.rows.filter(o => o.a != null).every(o => S.tracks[o.a].orig && r.scenes.every(s => S.tracks[o.a].clips[s] && S.tracks[o.a].clips[s].audio));
    return out; }, await p.evaluate(() => ({k: DRUM_BY_ID.kick.gm, s: DRUM_BY_ID.snare.gm, h: DRUM_BY_ID.hatC.gm})));
  await shot('30-szenen-angelegt');
  const np = P0.parts.length;
  ok(tag + ' szenen-angelegt', {scenes: R1.scenes, names: R1.names, nt: [nt0, R1.nt]}, R1.scenes.length === np && R1.names.join('|') === P0.parts.map(x => x.name).join('|'));
  ok(tag + ' audio-clips', {audio: R1.audio, rows: R1.rows.map(o => o.name + ':' + o.cA)}, R1.audioOk && R1.audio >= 3 * np);
  ok(tag + ' midi-clips', {midi: R1.midi, notes: R1.notes, rows: R1.rows.map(o => o.name + ':' + o.cM + '/' + o.n)}, R1.midi >= 2 * np);
  const bassTot = R1.bassN.reduce((a, v) => a + v, 0);
  ok(tag + ' bass-noten-je-teil', {je: R1.bassN, sum: bassTot, wahr: truthBass.length}, R1.bassN.length === np && R1.bassN.every(v => v > 0) && bassTot >= 0.7 * truthBass.length && bassTot <= 1.3 * truthBass.length);
  const kick = R1.kit.reduce((a, z) => a + z.k, 0), sn = R1.kit.reduce((a, z) => a + z.s, 0), hh = R1.kit.reduce((a, z) => a + z.h, 0), kT = R1.kit.reduce((a, z) => a + z.kT, 0), sT = R1.kit.reduce((a, z) => a + z.sT, 0);
  // „soweit erkennbar“: die echten Schläge (Kick 1+3, Snare 2+4, je 64) müssen da sein; Zusatztreffer (Reste anderer Ebenen in der Drum-Ebene) werden gemeldet
  ok(tag + ' drums-auf-kit', {kit: R1.kit, kick, kickEcht: kT, snare: sn, snareEcht: sT, hat: hh, soll: 64, zusatzKick: kick - kT, zusatzSnare: sn - sT}, kT >= 0.9 * 64 && sT >= 0.9 * 64 && kick <= 1.5 * 64 && sn <= 1.5 * 64 && R1.kit.every(z => z.x === 0));
  if (full) ok(tag + ' nachbau-klang-auf-bass', {klang: (R1.rows.find(o => /bass/i.test(o.name)) || {}).klang, snd: R1.bassSnd}, (R1.rows.find(o => /bass/i.test(o.name)) || {}).klang === 'nachbau');
  if (full) {   // Speichern/Laden: Projektdatei hin und zurück (Szenen, Spuren, Clips, Takes mit Raster)
    const rt = await p.evaluate(() => { const r = __spk11.last(), fo = SQStore.buildProjectFile(S, null, VERSION), q = normalizeProject(projFromFile(JSON.parse(JSON.stringify(fo))));
      const cnt = P => r.scenes.reduce((a, s) => a + P.tracks.filter(t => t.clips[s]).length, 0), notes = P => r.scenes.reduce((a, s) => a + P.tracks.reduce((b, t) => b + ((t.clips[s] && t.clips[s].notes.length) || 0), 0), 0);
      const tk = new Set(); for (const s of r.scenes) for (const t of q.tracks) { const c = t.clips[s]; if (c && c.audio) tk.add(c.audio.take); }
      return {clips: [cnt(S), cnt(q)], notes: [notes(S), notes(q)], names: r.scenes.map(s => q.scenes[s].name).join('|') === r.scenes.map(s => S.scenes[s].name).join('|'), orig: q.tracks.filter(t => t.orig).length, takes: [...tk].every(id => q.takes && q.takes[id] && q.takes[id].imp), spk: (q.spk || []).length}; });
    ok(tag + ' speichern-laden', rt, rt.clips[0] === rt.clips[1] && rt.notes[0] === rt.notes[1] && rt.names && rt.orig >= 3 && rt.takes && rt.spk >= 1);
  }
  // ↶: ein Schritt nimmt alles zurück
  await p.evaluate(() => undo()); await p.waitForTimeout(400);
  const U1 = await p.evaluate(sc => ({nt: S.tracks.length, clips: sc.reduce((a, s) => a + S.tracks.filter(t => t.clips[s]).length, 0), names: sc.map(s => S.scenes[s].name)}), R1.scenes);
  ok(tag + ' undo-alles', U1, U1.nt === nt0 && U1.clips === 0 && U1.names.every((n, i) => n === 'Szene ' + (R1.scenes[i] + 1)));
  if (full) {   // Auswahl: Refrain 1 (Takt 9–16), unter 300 Hz → ein Teil, nur Ebenen mit Noten darin
    await p.evaluate(() => { const U = __spk.page.ui(), g = U.meta.grid, bar = 60 / g.bpm * 4; U.sel = [{art: 'rect', t0: +(g.off + 8 * bar + 0.05).toFixed(4), t1: +(g.off + 16 * bar - 0.05).toFixed(4), f0: 30, f1: 300, kt: 0, kf: 0}]; U.selVer++; if (U.dd) { U.dd.remove(); U.dd = null; } });
    await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(250); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
    await p.waitForFunction(() => { const P = __spk11.plan(); return P && !__spk.page.info().busy; }, null, {timeout: 120000}); await p.waitForTimeout(300);
    const P2 = await p.evaluate(() => __spk11.plan()); await shot('40-auswahl-blatt');
    const on = P2.rows.filter(r => r.mode !== 'x').map(r => r.art);
    ok(tag + ' auswahl-begrenzt', {parts: P2.parts.map(x => x.name + ' ' + x.A + '–' + x.B), on, sel: P2.sel}, P2.sel && P2.parts.length === 1 && Math.abs(P2.parts[0].A - 8) <= 1 && Math.abs(P2.parts[0].B - 16) <= 1 && on.includes('bass') && !on.includes('drums'));
    await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]'));
    await p.waitForFunction(() => __spk11.last() && __spk11.last().scenes.length === 1 && !__spk.page.info().busy, null, {timeout: 300000}); await p.waitForTimeout(300);
    const R2 = await p.evaluate(() => { const r = __spk11.last(), bo = r.rows.find(o => /bass/i.test(o.name)); return {scenes: r.scenes, rows: r.rows.map(o => o.name + ':' + o.clipsA + '/' + o.clipsM + '/' + o.notes), bass: bo ? bo.notes : 0, len: bo && bo.m != null ? S.tracks[bo.m].clips[r.scenes[0]].len : 0}; });
    ok(tag + ' auswahl-angelegt', R2, R2.scenes.length === 1 && R2.bass >= 22 && R2.bass <= 40 && R2.len >= 7 && R2.len <= 9 && R2.rows.length <= 3);
    await p.evaluate(() => undo()); await p.waitForTimeout(300);
    const U2 = await p.evaluate(() => S.tracks.length); ok(tag + ' auswahl-undo', U2, U2 === nt0);
  }
  ok(tag + ' keine-konsolenfehler', errs.slice(0, 5), !errs.length);
  await ctx.close();
}
console.log(`ERGEBNIS ${nOk} OK / ${nF} FEHLER`); fs.writeFileSync(path.join(here, 'spk11-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
