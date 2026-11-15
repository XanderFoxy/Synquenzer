// TEIL1 Test: Songteile im Spektral-Lineal (eine Erkennung beim Laden, Streifen, Tipp = Fokus, Loop-Zeile, Teil → Szene, Import gleiche Teile,
// Speichern/Laden, Hintergrund-Erkennung alter Dokumente, Leistung). Testlied wie TEIL0 (I4 S8 R8 S8 R8 O4, 120 BPM, 80 s), Touch über CDP.
// Aufruf: node teil1-test.mjs <index.html> [428x926,926x428,926x370]   Fotos: ./fotos, Daten: ./teil1-test.json
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}; let nOk = 0, nF = 0;
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; if (c) nOk++; else nF++; console.log((c ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v).slice(0, 400)); };
const note = (k, v) => { res[k] = {v}; console.log('    ' + k + ' ' + JSON.stringify(v).slice(0, 400)); };
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

const b = await chromium.launch();
const VIEWS = (process.argv[3] || '428x926,926x428,926x370').split(',').map(s => s.split('x').map(Number));
const hex = c => { c = String(c).trim(); if (c[0] === '#') { if (c.length === 4) c = '#' + [...c.slice(1)].map(x => x + x).join(''); return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); } const m = c.match(/\d+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
for (const [W, H] of VIEWS) {
  const tag = W + 'x' + H, hoch = W < H, errs = [], ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({type: 'longtask', buffered: true}); } catch (e) {} });
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
  const tap = async q => { if (!q) throw new Error('Ziel fehlt'); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(200); };
  const hold = async (q, ms) => { await touch('touchStart', [q]); await p.waitForTimeout(ms); await touch('touchEnd', []); await p.waitForTimeout(200); };
  const drag = async (a, z) => { await touch('touchStart', [a]); for (let i = 1; i <= 8; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / 8, a[1] + (z[1] - a[1]) * i / 8]]); await p.waitForTimeout(16); } await touch('touchEnd', []); await p.waitForTimeout(200); };
  const btn = t => p.evaluate(t => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith(t)); if (!e) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, t);
  const sel = s => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
  const idle = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.busy; }, null, {timeout: 180000});
  const shot = n => p.screenshot({path: path.join(fotos, n + '-' + tag + '.png')});
  const stat = () => p.evaluate(() => SPK1.ui.st.textContent);
  const ruAt = (t, y) => p.evaluate(([t, y]) => { const U = SPK1.ui, r = U.ru.getBoundingClientRect(); return [r.left + spk1X(U, t), r.top + y]; }, [t, y]);
  const view = () => p.evaluate(() => { const U = SPK1.ui, v = U.v; return {t0: +v.t0.toFixed(3), t1: +(v.t0 + U.W / v.pps).toFixed(3), mTop: +v.mTop.toFixed(3), rowH: +v.rowH.toFixed(4), loop: U.loop, cur: +U.cur.toFixed(3)}; });
  const lpTxt = () => p.evaluate(() => { const e = document.querySelector('#spk1Sheet .spk2-lpt'); return e ? e.textContent + ' | ' + (e.getAttribute('aria-label') || '') : null; });
  const t0 = Date.now(); await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__spk11 && window.__teil1, null, {timeout: 90000}); note(tag + ' T1 laden-ms', Date.now() - t0); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__an = 0; const f0 = imp1Analyse; imp1Analyse = function () { window.__an++; return f0.apply(this, arguments); }; });
  await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(300); await p.evaluate(() => spk1Open()); await p.waitForTimeout(500);
  { const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 5000}), tap(await btn('Datei laden'))]); await fc.setFiles({name: 'Testlied.wav', mimeType: 'audio/wav', buffer: wav}); }
  const tL = Date.now();
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 120000}); await p.waitForTimeout(500);
  note(tag + ' spektrum-ms', Date.now() - tL);
  // T1
  const g = await p.evaluate(() => SPK1.ui.meta.grid), an1 = await p.evaluate(() => window.__an), I1 = await p.evaluate(() => __teil1.info());
  const tt = (g.teile || []);
  ok(tag + ' T1 teile', {n: tt.length, takte: tt.map(x => Math.round(x.t0 / 2)), namen: tt.map(x => x.name), an: an1, segMs: I1.seg},
    tt.length === 6 && tt.map(x => Math.round(x.t0 / 2)).join() === '0,4,12,20,28,36' && tt.map(x => x.name).join() === 'Intro,Strophe 1,Refrain 1,Strophe 2,Refrain 2,Outro' && an1 === 1 && I1.seg < 5);
  await shot('01-geladen');
  // T4 Lineal
  const ru = await p.evaluate(() => { const U = SPK1.ui, r = U.ru.getBoundingClientRect(); return {h: Math.round(r.height), ch: U.ru.firstChild.height, tl1: (U.tl1 || []).map(x => x.name + (x.cur ? '*' : '')), ttl: U.ttl.textContent, mn: U.mn.clientHeight}; });
  const px = await p.evaluate(() => { const U = SPK1.ui, cv = U.ru.firstChild, x = cv.getContext('2d'), d = U.dpr, out = []; for (const q of U.tl1) { const xm = Math.max(0, q.x0) + (Math.min(cv.width / d, q.x1) - Math.max(0, q.x0)) / 2; const D = x.getImageData(Math.round(xm * d), Math.round(3 * d), 1, 1).data; out.push({name: q.name, cur: q.cur, rgb: [D[0], D[1], D[2]], soll: getComputedStyle(document.documentElement).getPropertyValue('--' + IMP1_PC[(teil1Parts(U).find(z => z.name === q.name) || {}).grp % IMP1_PC.length]).trim()}); } return out; });
  const pxOk = px.every(q => { const s = hex(q.soll), a = q.cur ? 1 : 0.8, bg = [0x12, 0x14, 0x18], e = s.map((v, i) => v * a + bg[i] * (1 - a)); return e.every((v, i) => Math.abs(v - q.rgb[i]) <= 6); });
  ok(tag + ' T4 lineal', {h: ru.h, tl1: ru.tl1, ttl: ru.ttl, pixel: px.map(q => q.name + ' ' + q.rgb.join('/') + ' soll ' + q.soll)}, ru.h === 44 && ru.tl1.length === 6 && ru.tl1[0] === 'Intro*' && pxOk && (!hoch || /Testlied › Intro$/.test(ru.ttl)));
  await p.screenshot({path: path.join(fotos, '02-streifen-' + tag + '.png'), clip: await p.evaluate(() => { const r = SPK1.ui.ru.getBoundingClientRect(); return {x: 0, y: Math.max(0, r.top - 50), width: innerWidth, height: r.height + 100}; })});
  await tap(await ruAt(29, 36)); await p.waitForTimeout(200);
  { const v = await p.evaluate(() => ({cur: SPK1.ui.cur, tl1: SPK1.ui.tl1.filter(x => x.cur).map(x => x.name), ttl: SPK1.ui.ttl.textContent, loop: SPK1.ui.loop})); ok(tag + ' T4 tipp-unten-takt15', v, v.cur > 28 && v.cur < 30 && v.tl1[0] === 'Refrain 1' && (!hoch || /› Refrain 1$/.test(v.ttl)) && !v.loop); }
  // Zerlegen (Ebenen Drums/Bass für T7)
  await tap(await btn('Zerlegen')); await p.waitForTimeout(300); { const zb = await btn('Zerlegen (schnell'); if (zb) await tap(zb); } await p.waitForTimeout(200); await idle(); await p.waitForTimeout(400);
  note(tag + ' ebenen', await p.evaluate(() => SPK1.ui.meta.layers.map(l => l.name + ':' + l.art)));
  // T2 Szenen-Blatt (Ansicht)
  { await tap(await sel('#spk1Sheet [data-a="view"]')); await p.waitForTimeout(250); const tS = Date.now(); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="open"]'));
    await p.waitForFunction(() => __spk11.plan(), null, {timeout: 60000}); const ms = Date.now() - tS - 200;
    const P = await p.evaluate(() => ({parts: __spk11.plan().parts.map(x => x.name), txt: document.querySelector('#spk1Sheet .spk1-dd').textContent, an: window.__an}));
    ok(tag + ' T2 szenen-blatt', {ms, parts: P.parts, an: P.an}, ms < 150 && P.parts.length === 6 && !/rkenne Songteile/.test(P.txt) && P.an === 1);
    await p.evaluate(() => spk1Dd(SPK1.ui, null)); await p.waitForTimeout(200); }
  // T5 Fokus-Tipp auf Refrain 1
  const v0 = await view(); await p.evaluate(() => { window.__lt0 = performance.now(); __teil1.clearMs(); });
  await tap(await ruAt(32, 13)); await p.waitForTimeout(400);
  { const v = await view(), lt = await lpTxt(), s = await stat(); const span = 16, m = 0.03 * span;
    ok(tag + ' T5 fokus', {v, lt, s}, v.loop && v.loop[0] === 12 && v.loop[1] === 20 && Math.abs(v.t0 - (24 - m)) < 0.03 * span && Math.abs(v.t1 - (40 + m)) < 0.03 * span && v.mTop === v0.mTop && v.rowH === v0.rowH && /^Refrain 1 · Takt 13–20/.test(lt || '') && /Refrain 1 · Takt 13–20 · im Loop/.test(s)); }
  await shot('03-fokus-refrain');
  await tap(await sel('#spk1Sheet [data-a="undo"]')); await p.waitForTimeout(600);
  { const v = await view(); ok(tag + ' T5 undo-entfernt-loop', v.loop, !v.loop); }
  await tap(await ruAt(32, 13)); await p.waitForTimeout(400); await tap(await ruAt(32, 13)); await p.waitForTimeout(400);
  { const v = await view(), dur = 80; ok(tag + ' T5 zweiter-tipp-ganzes-lied', v, v.loop && v.loop[0] === 12 && v.t0 < 0 && v.t1 > dur - 1 && v.mTop === v0.mTop); }
  { const a = await ruAt(32, 13), v1 = await view(); await drag(a, [a[0] - 60, a[1]]); const v = await view(); ok(tag + ' T5 ziehen-rollt', {vor: v1.t0, nach: v.t0, loop: v.loop}, v.t0 !== v1.t0 && v.loop && v.loop[0] === 12 && v.loop[1] === 20); }
  { const a = await ruAt(50, 13); await p.evaluate(() => { window.__pe = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'contextmenu', 'touchstart']) document.addEventListener(t, e => window.__pe.push(t + ':' + e.pointerId + ':' + (e.target.className || e.target.tagName) + ':' + SPK1.ui.ru.contains(e.target)), true); }); await hold(a, 450); const v = await view();
    if (process.env.DBG) { console.log(JSON.stringify(await p.evaluate(a => ({pe: window.__pe, at: (document.elementFromPoint(a[0], a[1]) || {}).tagName + ':' + SPK1.ui.ru.contains(document.elementFromPoint(a[0], a[1])), a, st: SPK1.ui.st.textContent, dd: !!SPK1.ui.dd}), a))); await shot('dbg-hold'); }
    ok(tag + ' T5 halten-1-takt-loop', v.loop, v.loop && v.loop[1] - v.loop[0] === 1); }
  // T6 Fokus Nur Rest + Tipp Strophe 2
  await p.evaluate(() => fokus1Mode(SPK1.ui, 'rest')); await p.waitForTimeout(1500);
  { const a = await ruAt(48, 13); await tap(a); await p.waitForTimeout(800); const r = await p.evaluate(() => ({f1: SPK1.ui.f1 && SPK1.ui.f1.mode, err: SPK1.ui.f1 && SPK1.ui.f1.err, loop: SPK1.ui.loop, tl1: SPK1.ui.tl1.length, cls: SPK1.ui.sh.classList.contains('spk13-tl'), st: SPK1.ui.st.textContent}));
    ok(tag + ' T6 nur-rest', r, r.f1 === 'rest' && !r.err && r.loop && r.loop[0] === 20 && r.loop[1] === 28 && r.tl1 === 6 && r.cls); await shot('04-nur-rest-strophe2'); }
  await p.evaluate(() => fokus1Mode(SPK1.ui, 'alles')); await p.waitForTimeout(500);
  // T7 Refrain 1 → Szene
  await tap(await ruAt(32, 13)); await p.waitForTimeout(400);
  { const v = await view(); if (!(v.loop && v.loop[0] === 12)) { await tap(await ruAt(32, 13)); await p.waitForTimeout(300); } }
  const sc0 = await p.evaluate(() => S.scenes.map(s => s.name));
  await tap(await sel('#spk1Sheet [data-a="mxdd"]')); await p.waitForTimeout(300);
  const dd1 = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-dd button, #spk1Sheet .spk1-dd p')].slice(0, 3).map(e => e.textContent));
  await tap(await sel('#spk1Sheet .spk1-dd [data-mx="szene"]'));
  await p.waitForFunction(() => __spk11.plan(), null, {timeout: 60000}); await p.waitForTimeout(300);
  { const P = await p.evaluate(() => ({parts: __spk11.plan().parts.map(x => x.name + ' ' + x.A + '–' + x.B), sel: __spk11.plan().sel, tl: (document.querySelector('#spk1Sheet .spk11-tl') || {}).textContent, head: document.querySelector('#spk1Sheet .spk1-dd .spk11-tx').textContent}));
    ok(tag + ' T7 blatt-nur-loop', {dd1, P}, /^Als Szene · alle Ebenen/.test(dd1[0]) && P.parts.length === 1 && P.parts[0] === 'Refrain 1 12–20' && !P.sel && /Refrain 1 · Takt 13–20 → Szene \d+/.test(P.tl || '') && /nur Loop Takt 13–20/.test(P.head)); }
  await shot('05-szenen-blatt-loop');
  await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]'));
  await p.waitForFunction(() => __spk11.last() && !__spk.page.info().busy, null, {timeout: 300000}); await p.waitForTimeout(500);
  { const r = await p.evaluate(sc0 => { const L = __spk11.last(), U = SPK1.ui, neu = S.scenes.map((s, i) => [i, s.name]).filter(([i, n]) => n !== sc0[i]); const bassL = U.meta.layers.find(l => l.art === 'bass');
      const bassN = bassL ? spk2Notes(U, bassL.id).filter(q => spk11NoteOk(U, q) && (q.t0 != null ? q.t0 : q.a) >= 24 - 1e-4 && (q.t0 != null ? q.t0 : q.a) < 40 - 1e-4).length : -1;
      const rb = L.rows.find(o => /bass/i.test(o.name)), rd = L.rows.find(o => /drum/i.test(o.name)); return {neu, scenes: L.scenes, bassClip: rb && rb.notes, bassN, drums: rd && rd.notes, rows: L.rows.map(o => o.name + ' A' + o.clipsA + ' M' + o.clipsM + ' n' + o.notes), ex: L.ex}; }, sc0);
    ok(tag + ' T7 angelegt', r, r.neu.length === 1 && r.neu[0][1] === 'Refrain 1' && r.bassClip === r.bassN && r.bassN > 0 && r.drums > 0); }
  await p.evaluate(() => { spk1Close(); if (typeof hideToast === 'function') hideToast(); }); await p.waitForTimeout(700); await shot('06-matrix-danach');
  { const n0 = await p.evaluate(() => S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0)); await p.evaluate(() => undo()); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({clips: S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0), names: S.scenes.map(s => s.name)})); ok(tag + ' T7 undo-matrix', {vor: n0, nach: r.clips, refrain: r.names.includes('Refrain 1')}, r.clips === 0 && !r.names.includes('Refrain 1')); }
  await p.evaluate(() => spk1Open()); await p.waitForTimeout(800);
  // Intro still → keine leere, benannte Szene
  await p.evaluate(() => { const m = __spk11.mode; }); await tap(await ruAt(4, 13)); await p.waitForTimeout(400);
  await tap(await sel('#spk1Sheet [data-a="mxdd"]')); await p.waitForTimeout(300); await tap(await sel('#spk1Sheet .spk1-dd [data-mx="szene"]')); await p.waitForFunction(() => __spk11.plan(), null, {timeout: 60000}); await p.waitForTimeout(300);
  await p.evaluate(() => { __spk11.mode('rest', 'x'); }); await p.waitForTimeout(200);
  { const pl = await p.evaluate(() => __spk11.plan().parts.map(x => x.name)); const last0 = await p.evaluate(() => __spk11.last()); await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]')); await p.waitForTimeout(500); await idle(); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({names: S.scenes.map(s => s.name), clips: S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0), st: SPK1.ui.st.textContent}));
    const leer = await p.evaluate(() => S.scenes.map((s, i) => [i, s.name]).filter(([i, n]) => !/^Szene \d+$/.test(n) && !S.tracks.some(t => t && t.clips[i])).map(x => x[1]));
    ok(tag + ' T7 intro-keine-leere-benannte-szene', {pl, r, leer}, pl.join() === 'Intro' && !leer.length && (r.names.includes('Intro') ? r.clips > 0 : true)); }
  // stiller Teil: alle Ebenen Aus außer Bass MIDI im Intro (dort spielt kein Bass) → keine Szene „Intro“
  { await p.evaluate(() => undo()); await p.waitForTimeout(400); await tap(await sel('#spk1Sheet [data-a="mxdd"]')); await p.waitForTimeout(300); await tap(await sel('#spk1Sheet .spk1-dd [data-mx="szene"]')); await p.waitForFunction(() => __spk11.plan(), null, {timeout: 60000}); await p.waitForTimeout(300);
    await p.evaluate(() => { for (const r of __spk11.plan().rows) __spk11.mode(r.lid, r.art === 'bass' ? 'm' : 'x'); }); await p.waitForTimeout(200);
    await tap(await sel('#spk1Sheet .spk1-dd [data-s11="go"]')); await p.waitForTimeout(500); await idle(); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({names: S.scenes.map(s => s.name), clips: S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0), st: SPK1.ui.st.textContent, last: __spk11.last() && __spk11.last().ex}));
    ok(tag + ' T7 intro-bass-midi-still', r, !r.names.includes('Intro') || r.clips > 0); }
  // Leistung Lineal: 120 Zeichnungen
  await p.evaluate(() => { __teil1.clearMs(); const U = SPK1.ui; for (let i = 0; i < 120; i++) { U.v.t0 += 0.05; spk1RulerDraw(U); } });
  { const I = await p.evaluate(() => __teil1.info()); const base = await p.evaluate(() => { const U = SPK1.ui, c = U.sh.classList; c.remove('spk13-tl'); const t = performance.now(); for (let i = 0; i < 120; i++) spk1RulerDraw(U); const ms = (performance.now() - t) / 120; c.add('spk13-tl'); spk1Size(U); spk1Dirty(U, 'all'); return +ms.toFixed(3); });
    ok(tag + ' T10 lineal-ms', {teil1: I.ru, n: I.ruN, ohneTeileGanz: base}, I.ru != null && I.ru <= 0.3); }
  { const h = await p.evaluate(() => { const U = SPK1.ui, c = U.sh.classList, a = U.mn.getBoundingClientRect().height; c.remove('spk13-tl'); const b = U.mn.getBoundingClientRect().height; c.add('spk13-tl'); return {mit: Math.round(a), ohne: Math.round(b)}; }); note(tag + ' T10 hauptflaeche-hoehe', h); res[tag + ' T10 hauptflaeche-hoehe'].ok = h.ohne - h.mit === 18; }
  // T8 Speichern/Laden
  await p.evaluate(() => spk1Call('save', {doc: SPK1.doc})); await p.waitForTimeout(300);
  const docId = await p.evaluate(() => SPK1.doc), loopVor = await p.evaluate(() => SPK1.ui.loop);
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__teil1, null, {timeout: 90000}); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__an = 0; const f0 = imp1Analyse; imp1Analyse = function () { window.__an++; return f0.apply(this, arguments); }; });
  await p.evaluate(() => spk1Open()); await p.waitForTimeout(600);
  await tap(await p.evaluate(id => { const e = document.querySelector('#spk1Sheet [data-a="open"][data-id="' + id + '"]'); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, docId));
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && SPK1.ui.meta; }, null, {timeout: 60000});
  { const r = await p.evaluate(() => ({cls: SPK1.ui.sh.classList.contains('spk13-tl'), n: ((SPK1.ui.meta.grid || {}).teile || []).length, an: window.__an, loop: SPK1.ui.loop})); await p.waitForTimeout(800); r.tl1 = await p.evaluate(() => SPK1.ui.tl1.length);
    ok(tag + ' T8 neu-laden', {r, loopVor}, r.cls && r.n === 6 && r.an === 0 && r.tl1 === 6 && JSON.stringify(r.loop) === JSON.stringify(loopVor)); }
  // altes Dokument ohne Teile
  await p.waitForFunction(() => !SPK1.ui.specQ, null, {timeout: 60000});
  { await p.evaluate(() => __teil1.drop()); const tD = Date.now(); const busy = [];
    const r0 = await p.evaluate(() => ({cls: SPK1.ui.sh.classList.contains('spk13-tl'), h: Math.round(SPK1.ui.ru.getBoundingClientRect().height)}));
    let r = null; for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); const q = await p.evaluate(() => ({cls: SPK1.ui.sh.classList.contains('spk13-tl'), busy: SPK1.ui.busy, zerl: SPK1.ui.b_zerl && SPK1.ui.b_zerl.disabled, st: SPK1.ui.st.textContent, n: ((SPK1.ui.meta.grid || {}).teile || []).length})); busy.push(q.busy || (q.zerl ? 'zerl-aus' : '')); if (q.cls && q.n) { r = q; break; } }
    const ms = Date.now() - tD; ok(tag + ' T8 altes-dokument', {ohneTeile: r0, ms, r, busy: [...new Set(busy)]}, !r0.cls && r0.h === 26 && r && ms <= 3000 && busy.every(x => !x)); }
  await shot('07-nach-neu-laden');
  // T3 Import (nur einmal)
  if (tag === VIEWS[0].join('x')) {
    await p.evaluate(() => { spk1Close(); }); await p.waitForTimeout(300); await p.evaluate(() => SYNQUENZER.newProject()); await p.waitForTimeout(400);
    await p.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); await __imp1.ui.file(u.buffer, 'Testlied.wav'); }, wav.toString('base64'));
    await p.waitForFunction(() => { const c = __imp1.ui.cur(); return c && c.st === 'fertig'; }, null, {timeout: 120000}).catch(() => {}); await p.waitForTimeout(500);
    const IC = await p.evaluate(() => { const c = __imp1.ui.cur(); return c && (c.parts || []).map(x => x.name + '@' + Math.round(x.ta / 2)); });
    await shot('08-import-teile');
    const tP = await p.evaluate(() => { const r = __imp1.ui.place('scenes'); return r ? {scenes: r.scenes, parts: r.parts} : null; }); await p.waitForTimeout(800);
    const mk = await p.evaluate(() => (S.song.marks || []).map(m => m.name));
    ok(tag + ' T3 import', {IC, mk}, IC && IC.join() === 'Intro@0,Strophe 1@4,Refrain 1@12,Strophe 2@20,Refrain 2@28,Outro@36' && mk.length === 6);
    await p.evaluate(() => closePop()); await p.waitForTimeout(300);
  }
  const lt = await p.evaluate(() => window.__lt.filter(x => x[1] > 50)); note(tag + ' T10 longtasks>50ms (ganze Sitzung, inkl. Zerlegen/Anlegen)', lt.length);
  ok(tag + ' konsole', errs.slice(0, 6), errs.length === 0);
  await ctx.close();
}
fs.writeFileSync(path.join(here, 'teil1-test.json'), JSON.stringify(res, null, 1));
console.log('ERGEBNIS ok ' + nOk + ' fehl ' + nF);
await b.close(); srv.close();
