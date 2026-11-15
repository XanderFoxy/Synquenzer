// TEIL0 – Bestandsaufnahme „Songteile erkennen und weitergeben“ (nur lesen, nichts ändern).
// Synthetisches Lied (120 BPM, 4/4): Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Outro 4 Takte.
// Spektral-Seite: Datei laden → Zerlegen → Lineal ansehen → Ansicht ▾ → Szenen anlegen … (Teile) → Lineal danach → Fokus Nur Rest
// → anlegen → Matrix (Szenen-Kopf) und Song (Marken?) ansehen. Danach (nur hochkant) Import „In Szenen zerschneiden“ zum Vergleich.
// Aufruf: node teil0-bestand.mjs <abs. index.html>   Fotos: ./fotos, Daten: ./teil0-bestand.json
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const out = {}; const log = (k, v) => { out[k] = v; console.log(k, JSON.stringify(v).slice(0, 600)); };
/* ---- Lied ---- */
const SR = 44100, BAR = 2, PLAN = [['I', 4], ['S', 8], ['R', 8], ['S', 8], ['R', 8], ['O', 4]], BARS = PLAN.reduce((a, p) => a + p[1], 0), N = (BARS * BAR + 1) * SR;
const L = new Float32Array(N), Rr = new Float32Array(N); let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
const add = (i0, x, gl, gr) => { for (let i = 0; i < x.length && i0 + i < N; i++) { L[i0 + i] += x[i] * gl; Rr[i0 + i] += x[i] * (gr ?? gl); } };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const CH = {S: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], R: [[53, 57, 60], [48, 52, 55], [55, 59, 62], [57, 60, 64]], I: [[57, 60, 64], [52, 55, 59], [53, 57, 60], [52, 56, 59]]};
CH.O = CH.I;
const partAt = []; PLAN.forEach(([p, n]) => { for (let i = 0; i < n; i++) partAt.push(p); });
for (let b = 0; b < BARS; b++) {
  const P = partAt[b], ch = CH[P][b % 4], t0 = b * BAR, loud = P === 'R' ? 1.35 : P === 'S' ? 1 : 0.7;
  if (P === 'S' || P === 'R') for (let q = 0; q < 4; q++) {   // Bass
    const m = ch[0] - 12, f = hz(m), n = Math.round(0.42 * SR), x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.004) * Math.exp(-t * 3); let v = 0; for (let k = 1; k <= 6; k++) v += Math.sin(2 * Math.PI * f * k * t) / k; x[i] = v * e; }
    add(Math.round((t0 + q * 0.5) * SR), x, 0.22);
  }
  { const n = Math.round(BAR * SR), x = new Float32Array(n);   // Fläche
    for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 0.08) * Math.min(1, (BAR - t) / 0.05); let v = 0; for (const m of ch) v += Math.sin(2 * Math.PI * hz(m) * t) + 0.25 * Math.sin(4 * Math.PI * hz(m) * t); x[i] = v * e; }
    add(t0 * SR, x, 0.05 * loud, 0.06 * loud); }
  if (P === 'S' || P === 'R') for (let q = 0; q < 4; q++) {   // Drums
    const at = Math.round((t0 + q * 0.5) * SR);
    if (q % 2 === 0) { const n = Math.round(0.25 * SR), x = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (50 + 90 * Math.exp(-t * 30)) / SR; x[i] = Math.sin(ph) * Math.exp(-t * 14); } add(at, x, 0.55 * loud); }
    else { const n = Math.round(0.16 * SR), x = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const t = i / SR, w = rnd(); lp += 0.35 * (w - lp); x[i] = ((w - lp) * 0.8 + 0.4 * Math.sin(2 * Math.PI * 190 * t)) * Math.exp(-t * 22); } add(at, x, 0.4 * loud); }
    if (P === 'R') for (const o of [0, 0.25]) { const n = Math.round(0.04 * SR), x = new Float32Array(n); let p0 = 0; for (let i = 0; i < n; i++) { const w = rnd(); x[i] = (w - p0) * Math.exp(-i / SR * 90); p0 = w; } add(at + Math.round(o * SR), x, 0.12); }
  }
}
const wav = Buffer.alloc(44 + N * 4); wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4); wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(Rr[i] * 32767))), 46 + i * 4); }
log('lied', {bars: BARS, s: BARS * BAR, plan: PLAN.map(p => p.join('')).join(' ')});
const b = await chromium.launch();
const VIEWS = (process.env.VIEWS || '428x926,926x428').split(',').map(s => s.split('x').map(Number));
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, hoch = W < H, errs = [], ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 1}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const t0 = Date.now(); await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk11, null, {timeout: 90000}); log(tag + ' laden-ms', Date.now() - t0); await p.waitForTimeout(800);
  const tap = async q => { if (!q) throw new Error('Knopf fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(180); };
  const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const idle = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 180000});
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const stat = () => p.evaluate(() => { const U = __spk.page.ui(); return U && U.st ? U.st.textContent : ''; });
  await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(300); await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  await tap(await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })); await p.waitForTimeout(400);
  { const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: 'Testlied.wav', mimeType: 'audio/wav', buffer: wav}); }
  const tL = Date.now();
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 120000}); await p.waitForTimeout(400);
  log(tag + ' spektrum-ms', Date.now() - tL);
  await shot('01-spektral-geladen');
  const tZ = Date.now();
  await tap(await btn('Zerlegen')); await p.waitForTimeout(300); { const zb = await btn('Zerlegen (schnell'); if (zb) await tap(zb); } await p.waitForTimeout(200); await idle(); await p.waitForTimeout(400);
  log(tag + ' zerlegen-ms', Date.now() - tZ);
  const LY = await p.evaluate(() => __spk.page.ui().meta.layers.map(l => l.name + ':' + l.art)); log(tag + ' ebenen', LY);
  const grid = await p.evaluate(() => __spk.page.ui().meta.grid); log(tag + ' raster', grid);
  await shot('02-zerlegt-lineal-ohne-teile');
  // Lineal: was zeigt es? (Höhe, Textinhalt nicht lesbar – Code: spk1RulerDraw zeichnet Taktnummern, Auswahl, Loop-Klammern, Abspielmarke)
  const ru = await p.evaluate(() => { const U = __spk.page.ui(), r = U.ru.getBoundingClientRect(); return {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}; }); log(tag + ' lineal-mass', ru);
  // Ansicht ▾
  await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(350);
  const dd1 = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); if (!d) return null; return {h5: [...d.querySelectorAll('h5')].map(e => e.textContent), btn: [...d.querySelectorAll('button')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 40)}; });
  log(tag + ' ansicht-menue', dd1);
  await shot('03-ansicht-menue');
  // Szenen anlegen … (Teile erkennen)
  const tS = Date.now();
  await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
  await p.waitForFunction(() => { const P = __spk11.plan(); return P && !__spk.page.info().busy; }, null, {timeout: 120000}); await p.waitForTimeout(400);
  log(tag + ' teile-erkennen-ms', Date.now() - tS);
  const P0 = await p.evaluate(() => { const P = __spk11.plan(); return {parts: P.parts.map(x => x.name + ' ' + x.A + '–' + x.B), rows: P.rows.map(r => r.name + ':' + r.mode + ':' + r.n), scenes: P.scenes}; }), T0 = await p.evaluate(() => { const T = __spk11.teile(); return T && {ok: T.ok, bpm: T.bpm, ts: T.ts, fein: T.fein, imp1: T.imp1, teile: (T.teile || []).map(x => x.name + ' ' + x.t0 + '–' + x.t1 + 's g' + x.grp)}; });
  log(tag + ' teile-plan', P0); log(tag + ' teile-roh', T0);
  await shot('04-szenen-blatt-teile');
  { const dd = await p.evaluate(() => { const d = document.querySelector('.spk11-dd'); if (!d) return null; d.scrollTop = d.scrollHeight; const R = d.getBoundingClientRect(); return {h: Math.round(R.height), sh: d.scrollHeight}; }); log(tag + ' szenen-blatt-hoehe', dd); await p.waitForTimeout(150); await shot('05-szenen-blatt-unten'); }
  // Blatt zu → Lineal nach der Erkennung: zeigt es jetzt Teile? (Speicher SPK11.ana nur in der Sitzung)
  await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); }); await p.waitForTimeout(250);
  await shot('06-lineal-nach-erkennung');
  const ana = await p.evaluate(() => { const U = __spk.page.ui(); return {anaImSpeicher: SPK11.ana.size, metaKeys: Object.keys(U.meta || {}), teileImDok: !!(U.meta && (U.meta.teile || U.meta.parts || U.meta.marks))}; });
  log(tag + ' teile-gespeichert', ana);
  // Fokus: Nur Rest (ganzes Lied, nicht je Teil)
  await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(300);
  const fb = await p.evaluate(() => { const b = [...document.querySelectorAll('#spk1Sheet .spk1-dd .spk1-f1 button')].find(x => /Nur Rest/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  if (fb) { await tap(fb); await p.waitForFunction(() => { const U = __spk.page.ui(); return U.f1 && U.f1.st; }, null, {timeout: 60000}).catch(() => {}); }
  await p.evaluate(() => { const U = __spk.page.ui(); spk1Dd(U, null); }); await p.waitForTimeout(400);
  log(tag + ' fokus-rest', {knopf: !!fb, stat: await stat(), f1: await p.evaluate(() => { const F = __spk.page.ui().f1; return F && {mode: F.mode, st: F.st && {eO: +F.st.eO.toFixed(3), eR: +F.st.eR.toFixed(3), nAus: F.st.nAus}}; })});
  await shot('07-fokus-nur-rest');
  // Zeit-Auswahl über Refrain 1 → Fokus bleibt ganzes Lied? (Status-Prozent gleich)
  await p.evaluate(() => { const U = __spk.page.ui(), g = U.meta.grid, bar = 60 / g.bpm * 4; U.sel = [{art: 'zeit', t0: +(g.off + 12 * bar).toFixed(3), t1: +(g.off + 20 * bar).toFixed(3), kt: 0}]; U.selVer++; spk1SelDone(U); });
  await p.waitForTimeout(800); log(tag + ' fokus-rest-mit-auswahl', {stat: await stat()});
  await shot('08-fokus-rest-auswahl-refrain');
  await p.evaluate(() => { const U = __spk.page.ui(); U.sel = []; U.selVer++; spk1SelDone(U, ''); fokus1Mode(U, 'alles'); }); await p.waitForTimeout(300);
  // Anlegen (ganzes Lied)
  await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(250); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
  await p.waitForFunction(() => { const P = __spk11.plan(); return P && !__spk.page.info().busy; }, null, {timeout: 120000}); await p.waitForTimeout(300);
  const tG = Date.now(); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]'));
  await p.waitForFunction(() => __spk11.last() && !__spk.page.info().busy, null, {timeout: 300000}); await p.waitForTimeout(500);
  log(tag + ' anlegen-ms', Date.now() - tG);
  const R1 = await p.evaluate(() => { const r = __spk11.last(); return {scenes: r.scenes.map(s => (s + 1) + ' ' + S.scenes[s].name), audio: r.audio, midi: r.midi, notes: r.notes, rows: r.rows.map(o => o.name + ' A' + o.clipsA + ' M' + o.clipsM + ' n' + o.notes + ' still' + o.still), tracks: S.tracks.map(t => t.name), songMarks: (S.song && S.song.marks || []).length, songLanes: S.song && S.song.lanes ? Object.keys(S.song.lanes).filter(k => (S.song.lanes[k] || []).length).length : 0, stat: __spk.page.ui().st.textContent}; });
  log(tag + ' angelegt', R1);
  await shot('09-spektral-nach-anlegen');
  // Seite schließen → Matrix: Szenen-Kopf zeigt Namen?
  await p.evaluate(() => { spk1Close(); if (typeof closeMenu === 'function') closeMenu(); if (typeof hideToast === 'function') hideToast(); }); await p.waitForTimeout(700);
  const head = await p.evaluate(() => UI.scenes.map(b => b.textContent.replace(/\s+/g, ' ').trim()));
  log(tag + ' matrix-szenen-kopf', head);
  await shot('10-matrix-nach-szenen');
  // Szenen-Kopf halten → Szenen-Blatt (Name nur hier)
  await p.evaluate(() => { mtxSceneSheet(1, UI.scenes[1]); }); await p.waitForTimeout(400);
  log(tag + ' szenen-blatt-titel', await p.evaluate(() => { const h = document.querySelector('.pop.mtxscn h4'); return h ? h.textContent : null; }));
  await shot('10b-szenen-blatt-name'); await p.evaluate(() => closePop()); await p.waitForTimeout(250);
  // Noten-Editor eines angelegten Bass-Clips: was gibt es für „Auswahl → neuer Clip“?
  { const bt = await p.evaluate(() => { const r = __spk11.last(), o = r.rows.find(x => /bass/i.test(x.name) && x.m != null); return o ? o.m : -1; });
    if (bt >= 0) { await p.evaluate(t => openRoll(t, 1), bt); await p.waitForTimeout(700);
      log(tag + ' noten-editor-knoepfe', await p.evaluate(() => [...document.querySelectorAll('#rollSheet button')].filter(b => b.offsetParent).map(b => (b.getAttribute('aria-label') || b.textContent || '').trim()).filter(Boolean).slice(0, 60)));
      await shot('10c-noten-editor-bass'); await p.evaluate(() => { if (typeof closeRoll === 'function') closeRoll(); else if (typeof closeEditors === 'function') closeEditors(); }); await p.waitForTimeout(300); } }
  // Song-Ansicht: Marken/Teile?
  await p.evaluate(() => { if (!UI.songView && typeof toggleView === 'function') toggleView(); else if (!UI.songView) UI.corner.click(); }); await p.waitForTimeout(700);
  log(tag + ' song-ansicht', await p.evaluate(() => ({song: !!UI.songView, marks: (S.song.marks || []).map(m => m.name + '@' + m.a), bars: S.song.bars})));
  await shot('11-song-nach-szenen');
  if (hoch) {   // Vergleich: Import „In Szenen zerschneiden“ (IMP1) mit demselben Lied – Marken + Song-Ablauf, nur Spur „Original“
    await p.evaluate(() => { if (UI.songView) UI.corner.click(); }); await p.waitForTimeout(400);
    await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(400);
    const tI = Date.now();
    await p.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); await __imp1.ui.file(u.buffer, 'Testlied.wav'); }, wav.toString('base64'));
    await p.waitForFunction(() => { const c = __imp1.ui.cur(); return c && c.st === 'fertig'; }, null, {timeout: 120000}).catch(() => {}); await p.waitForTimeout(500);
    log(tag + ' import-erkennen-ms', Date.now() - tI);
    const IC = await p.evaluate(() => { const c = __imp1.ui.cur(); return c && {st: c.st, bpm: c.bpm, ts: c.ts, parts: (c.parts || []).map(x => x.name + '@' + (+x.ta).toFixed(2))}; }); log(tag + ' import-teile', IC);
    await shot('12-import-blatt-teile');
    const tP = await p.evaluate(() => { const r = __imp1.ui.place('scenes'); return r ? {scenes: r.scenes, parts: r.parts, track: r.track} : null; }); await p.waitForTimeout(800);
    log(tag + ' import-in-szenen', tP);
    await p.evaluate(() => closePop()); await p.waitForTimeout(400);
    log(tag + ' import-song', await p.evaluate(() => ({marks: (S.song.marks || []).map(m => m.name + '@' + m.a + '+' + m.len), tracks: S.tracks.map(t => t.name + (t.orig ? '(orig)' : '')), scenes: S.scenes.map(s => s.name)})));
    await shot('13-import-matrix');
    await p.evaluate(() => { if (!UI.songView) UI.corner.click(); }); await p.waitForTimeout(700);
    await shot('14-import-song-marken');
  }
  log(tag + ' konsolenfehler', errs.slice(0, 6));
  await ctx.close();
}
fs.writeFileSync(path.join(here, 'teil0-bestand.json'), JSON.stringify(out, null, 1));
await b.close(); srv.close();
