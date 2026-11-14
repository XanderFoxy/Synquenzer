// VX1R Zugänge-Test (Schritt 4) – Kopf aus vx1r-ed-test.mjs.
// VX1R Editor-Test (Schritt 3): Gesang-Editor = PianoRoll mit opts.audio. Synthetischer Gesang wie im Kern-Test, Take per tkInject.
// Prüft per Touch (CDP): Öffnen, Stücke als Noten (Anker, Silben), Werkzeugleiste (nur Gesang-Werkzeuge, ✕ sichtbar, ≥ 44 px),
// Tipp = wählen / Mehrfachwahl, waagrecht ziehen rastet mit dem ANKER auf 1/8 ein (ein Undo), senkrecht = Tonhöhe (G2, ein Undo),
// QUANT.-Blatt, Teilen/Verbinden, ↶, hochkant + quer 926×428 / 926×370 ohne Überlappung, keine Fehler. Aufruf: node vx1r-ed-test.mjs <index.html> <fotos>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || 'fotos');
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const errs = [];
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const tdrag = async (cdp, pts, step = 16) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: pts[0][0], y: pts[0][1], id: 1}]}); for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: pts[i][0], y: pts[i][1], id: 1}]}); await sleep(step); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const ttap = async (cdp, x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const line = (a, z, n = 12) => Array.from({length: n + 1}, (_, i) => [a[0] + (z[0] - a[0]) * i / n, a[1] + (z[1] - a[1]) * i / n]);
// Layout: sichtbare Knöpfe im Editor, Überlappung, ✕, Größe
const layout = p => run(p, () => {
  const sh = EL.rollSheet, R = sh.getBoundingClientRect(), vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const bs = [...sh.querySelectorAll('button')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim(), x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom}; });
  const vw = innerWidth, vh = innerHeight, ov = [];
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], c = bs[j]; if (a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1) ov.push(a.t + '/' + c.t); }
  const x = bs.find(z => z.t === '✕'), main = ED.roll.el.main.getBoundingClientRect(), keys = ED.roll.el.keys.getBoundingClientRect();
  // Trefferfläche: Knopf + Ränder der Leiste (wie die App misst: Höhe der Leiste)
  return {bs: bs.map(z => z.t), ov, x: x && {x: x.x, y: x.y, r: x.r, b: x.b, in: x.x >= 0 && x.r <= vw && x.y >= 0 && x.b <= vh}, small: bs.filter(z => z.h < 30).map(z => z.t + ':' + Math.round(z.h)),
    hmin: Math.round(Math.min(...bs.map(z => z.h))), main: {w: Math.round(main.width), h: Math.round(main.height)}, keys: Math.round(keys.width), sheet: {t: Math.round(R.top), b: Math.round(R.bottom)}, vw, vh, hsc: document.documentElement.scrollWidth > vw};
});

// Schritt 4: Zugänge (Matrix ✎ / Clip-Blatt / Takes-Blatt / Song), Wiedergabe während ▶, Speichern (.json-Hinweis, Container-Rundlauf), Guide
try {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
  const r0 = await run(p, async o => {
    const {SR, PK, ANCH, F} = o, n = Math.round(3.6 * SR), x = new Float32Array(n);
    let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
    const ons = ANCH.map(a => a - PK);
    for (let k = 0; k < ANCH.length; k++) {
      const on = ons[k], nx = k + 1 < ons.length ? ons[k + 1] : on + .5, f = F[k]; let lp = 0;
      for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(); const h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)); }
      const v0 = on + .05, v1 = nx + .015;
      for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) {
        const t = i / SR - v0, T = v1 - v0; let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04);
        if (t > T - .012) e *= Math.max(0, (T - t) / .012);
        let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h; x[i] += .5 * e * s / 1.6;
      }
    }
    const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
    S.bpm = 120;
    const r = await SYNQUENZER.tkInject({pcm, sr: SR, scene: 0, at: 0, len: 2});
    await wait(300);
    const m = S.takes[r.id];
    m.marks = wpNormMarks(ons.map(t => ({t: Math.round(t * SR) / SR, conf: 1})), m.len / m.sr);
    wpSetLyrics(r.id, 'la le-li lo lu na');
    return {id: r.id, st: stimmeT()};
  }, {SR, PK, ANCH, F});
  const id = r0.id, st = r0.st;
  const tapEl = async (sel, txt) => { const c = await run(p, o => { const b = [...document.querySelectorAll(o.sel)].find(z => (!o.txt || z.textContent.trim() === o.txt) && z.getBoundingClientRect().width > 0 && !z.disabled); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.height]; }, {sel, txt}); if (c) await ttap(cdp, c[0], c[1]); return c; };
  const waitEd = n => run(p, async n => { for (let i = 0; i < 200 && !(window.__vx1.ed() && window.__vx1.ed().n >= n); i++) await wait(50); await wait(200); const e = window.__vx1.ed(); return {e, at: JSON.stringify(ED.rollAt), ed: R.editor, open: EL.rollSheet.classList.contains('open')}; }, n);
  const closeEd = () => run(p, async () => { closeRoll(); closePop(); await wait(250); });
  // 1 Matrix: Clip wählen + ✎ (wie bei Instrumenten) → derselbe Editor
  await run(p, o => { setSongView(false); selectSlot(o.st, 0); }, r0); await sleep(200);
  let c1 = await tapEl('#bEdit');
  let w1 = await waitEd(6);
  ok(c1 && w1.open && w1.ed === 'roll' && /"vx":1/.test(w1.at) && w1.e && w1.e.n === 6, 'Matrix: STIMME-Clip + ✎ öffnet den Gesang-Editor (Blatt des Noten-Editors)', w1.at + ' n=' + (w1.e && w1.e.n));
  await closeEd();
  // 2 Clip-Blatt „✎ Bearbeiten“
  await run(p, o => openClipSheet(o.st, 0), r0); await sleep(300);
  c1 = await tapEl('#clipSheet button', '✎ Bearbeiten'); w1 = await waitEd(6);
  ok(c1 && w1.open && /"vx":1/.test(w1.at), 'Clip-Blatt „✎ Bearbeiten“ öffnet den Gesang-Editor', w1.at);
  await closeEd();
  // 3 Takes-Blatt: [✎ Bearbeiten] zuerst im Abschnitt Bearbeiten, ≥ 44 px
  await run(p, o => SYNQUENZER.tkSheet({t: o.st, s: 0}), r0); await sleep(500);
  const t3 = await run(p, () => { const pe = UI.pop && UI.pop.el, b = pe && pe.querySelector('[data-a="vx1r"]'); if (!b) return null; const r = b.getBoundingClientRect(), prev = b.previousElementSibling; return {h: Math.round(r.height), w: Math.round(r.width), txt: b.textContent, sec: prev && prev.classList.contains('orisec') ? prev.dataset.sec : (prev ? prev.className : null), wp: !!pe.querySelector('[data-a="wp"]'), g2: !!pe.querySelector('[data-a="g2"]'), vw: innerWidth}; });
  ok(t3 && t3.h >= 44 && t3.txt === '✎ Bearbeiten', 'Takes-Blatt: [✎ Bearbeiten] da, ≥ 44 px', JSON.stringify(t3));
  ok(t3 && (t3.sec === 'edit' || t3.sec === null), 'Takes-Blatt: [✎ Bearbeiten] als erster Knopf im Abschnitt „Bearbeiten“', t3 && t3.sec);
  ok(t3 && t3.wp && t3.g2, 'alte Wege bleiben (Marken & Timing, Tonhöhe korrigieren)');
  await p.screenshot({path: out + '/vx1r-takes-blatt.png'});
  c1 = await tapEl('.pop [data-a="vx1r"]'); w1 = await waitEd(6);
  ok(c1 && w1.open && /"vx":1/.test(w1.at) && !(await run(p, () => !!UI.pop)), 'Takes-Blatt [✎ Bearbeiten] → Gesang-Editor, Blatt zu', w1.at);
  // „Takes …“ im Editor → Takes-Blatt (zurück geht es über ✎ Bearbeiten)
  c1 = await tapEl('#rollSheet button', 'Takes …'); await sleep(400);
  ok(c1 && (await run(p, () => UI.pop && UI.pop.name)) === 'takes', 'Editor „Takes …“ → Takes-Blatt (Chor, Marken, Tonhöhe erreichbar)');
  await closeEd();
  // 4 ohne Audio auf dem Gerät: ✎ → Takes-Blatt wie bisher (Knopf grau)
  const t4 = await run(p, async o => { TK.missing.add(o.id); openRoll(o.st, 0); await wait(400); const pe = UI.pop && UI.pop.el, b = pe && pe.querySelector('[data-a="vx1r"]'); const r = {pop: UI.pop && UI.pop.name, roll: EL.rollSheet.classList.contains('open'), dis: b ? b.disabled : null}; TK.missing.delete(o.id); closePop(); await wait(200); return r; }, r0);
  ok(t4.pop === 'takes' && !t4.roll && t4.dis === true, 'Take fehlt auf dem Gerät: ✎ öffnet das Takes-Blatt, [✎ Bearbeiten] grau', JSON.stringify(t4));
  // 5 Instrument unverändert
  const t5 = await run(p, async () => { const t = S.tracks.findIndex(z => z.kind === 'synth' && !z.stimme); selectSlot(t, 0); openRoll(t, 0); await wait(300); const r = {at: JSON.stringify(ED.rollAt), vx: !!(ED.rollAt && ED.rollAt.vx)}; closeRoll(); await wait(200); return r; });
  ok(!t5.vx, 'Instrument-Clip: ✎ öffnet den Noten-Editor wie bisher', t5.at);
  // 6 Wiedergabe während ▶ (Matrix): verschieben → neue Fassung klingt, Wechsel mit Überblendung, kein Aussetzer
  await run(p, async o => { ensureAudio(); launch(o.st, 0); play(); await wait(900); window.__vx1.open({t: o.st, s: 0}); }, r0);
  w1 = await waitEd(6);
  await run(p, () => ED.roll.setGrid('1/8'));
  const s0 = await run(p, () => ({sw: WP.sw ? WP.sw.n : 0, u: UNDO.length, playing: R.playing}));
  const n2 = w1.e.notes[2], a2 = await run(p, () => window.__vx1.xy(2)), b2 = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n2.t + n2.d / 2 + .33, n: n2.n});
  await tdrag(cdp, line([a2.x, a2.y], [b2.x, a2.y], 10), 18);
  const m6 = await run(p, async o => { for (let i = 0; i < 120 && !(UNDO.length > o.u && wpReady(o.id)); i++) await wait(50); await wait(700);
    const c = WP.cache.get(o.id), live = TK.src.filter(r => r.take === o.id && !r.dead), w = S.takes[o.id].warp;
    return {u: UNDO.length - o.u, ready: wpReady(o.id), mode: w && w.mode, sw: (WP.sw ? WP.sw.n : 0) - o.sw, playing: R.playing, live: live.length, same: live.length > 0 && live.every(r => r.s.buffer === c.buf), heard: tkPlayBuf(o.id, S.tracks[o.st].clips[0].audio) === c.buf, bad: WP.sw ? WP.sw.bad : null}; }, Object.assign({u: s0.u, sw: s0.sw}, r0));
  ok(s0.playing && m6.playing && m6.u === 1, 'während ▶: Stück verschoben, ein Undo, Wiedergabe läuft weiter', JSON.stringify({u: m6.u}));
  ok(m6.ready && m6.mode === 'hybrid' && m6.heard, 'Matrix hört die neue Fassung (Schneiden/Dehnen am Anker)', JSON.stringify({mode: m6.mode, heard: m6.heard}));
  ok(m6.sw >= 1 && m6.same, 'Wechsel im Lauf über die Überblendung (wpSwitch), klingende Stücke = neue Fassung', JSON.stringify({sw: m6.sw, live: m6.live, same: m6.same, bad: m6.bad}));
  await run(p, async () => { stop(); await wait(200); });
  await closeEd();
  // 7 Song: Gesang-Block antippen → Takes-Blatt → [✎ Bearbeiten] → Editor an der getippten Stelle; Song hört dieselbe Fassung
  const s7 = await run(p, async o => { songEnsure(); if (S.song.bars < 8) S.song.bars = 8; const m = S.takes[o.id];
    S.song.vox = tkNormVox([{bar: 2, len: 3, take: o.id, in: 0, out: +(m.len / m.sr).toFixed(6), at: 0}]); songChanged(); setSongView(true); await wait(600);
    const L = svLayoutInfo(), cv = L.canvas, ri = SV.rows.indexOf(o.st); let y = null;
    for (let yy = 0; yy < cv.h; yy += 2) { if (svRowAt(yy) === ri) { y = yy; let y2 = yy; while (svRowAt(y2 + 2) === ri) y2 += 2; y = (yy + y2) / 2; break; } }
    const x = (3 + .5) * SV.cellW - SV.x; return {x: cv.x + x, y: y == null ? null : cv.y + y, ri, vox: S.song.vox && S.song.vox[0].id, beat: barBeat(3) - barBeat(2)}; }, r0);
  ok(s7.y != null, 'Song: STIMME-Zeile gefunden', JSON.stringify(s7));
  if (s7.y != null) {
    await ttap(cdp, s7.x, s7.y); await sleep(500);
    const p7 = await run(p, () => ({pop: UI.pop && UI.pop.name, vox: TK.sheet && TK.sheet.vox}));
    ok(p7.pop === 'takes' && p7.vox === s7.vox, 'Song: Gesang-Block antippen → Takes-Blatt der Song-Stimme', JSON.stringify(p7));
    c1 = await tapEl('.pop [data-a="vx1r"]'); w1 = await waitEd(1);
    const at7 = await run(p, async () => { for (let i = 0; i < 40 && window.__vx1.at() == null; i++) await wait(50); return {at: window.__vx1.at(), x0: ED.roll.fol().x0, rollAt: JSON.stringify(ED.rollAt)}; });
    ok(c1 && w1.open && /"vox":"V\d+"/.test(w1.at) && /"vx":1/.test(w1.at) && w1.e && w1.e.n >= 1, 'Song: [✎ Bearbeiten] öffnet den Gesang-Editor für die Song-Stimme', w1.at + ' n=' + (w1.e && w1.e.n));
    ok(at7.at === s7.beat && Math.abs(at7.x0 - s7.beat) < .51, 'Song: Editor zeigt den getippten Takt', JSON.stringify(at7) + ' Soll ' + s7.beat);
    await p.screenshot({path: out + '/vx1r-song-editor.png'});
    const h7 = await run(p, o => { const v = S.song.vox[0], c = WP.cache.get(o.id); return {heard: !!c && tkPlayBuf(o.id, v) === c.buf, mode: S.takes[o.id].warp.mode}; }, r0);
    ok(h7.heard && h7.mode === 'hybrid', 'Song hört dieselbe bearbeitete Fassung wie die Matrix (ein Take, eine Zeitkarte)', JSON.stringify(h7));
    await closeEd(); await run(p, () => setSongView(false));
  }
  // 8 Speichern: .json mit Gesang → Hinweis [Mit Audio sichern]; Container-Rundlauf (Marken an/vd, hybrid, pitch, WAV) und gleiche Wiedergabe
  const j8 = await run(p, async () => { const h0 = window.__vx1.hint(); let how = null; try { how = await saveFile(); } catch (e) { how = 'err ' + e; } await wait(1900); const tb = document.querySelector('#toast') || null; return {how, hint: window.__vx1.hint() > h0, toast: tb ? tb.textContent : (UI.toastEl ? UI.toastEl.textContent : '')}; });
  ok(j8.hint || !/download|share|claude/.test(String(j8.how)), '.json mit Gesang: Hinweis „Gesang-Audio ist nicht in der .json“ + [Mit Audio sichern]', JSON.stringify(j8));
  const z8 = await run(p, async o => {
    const sig = id => { const m = S.takes[id]; return JSON.stringify({mk: (m.marks || []).map(k => [k.t, k.an, k.vd]), w: m.warp && {mode: m.warp.mode, an: m.warp.an, src: m.warp.map.src, dst: m.warp.map.dst}, p: m.pitch && m.pitch.notes.map(n => [n.t0, n.t1, n.sh || 0])}); };
    const s0 = sig(o.id), h0 = await SYNQUENZER.tkPcmHash(o.id), buf0 = WP.cache.get(o.id) && WP.cache.get(o.id).buf, e0 = buf0 ? Array.from(buf0.getChannelData(0).subarray(0, 200000)).reduce((a, v) => a + v * v, 0) : null;
    const z = await tkZipBytes(), fs = await tkUnzip(z), names = fs.map(f => f.name), pj = fs.find(f => f.name === 'projekt.json');
    const pr = parseAny(new TextDecoder().decode(pj.data));
    if (!pr.ok) return {err: pr.error};
    importProject(pr.project, pr.warnings); await wait(400);
    const s1 = sig(o.id); WP.cache.delete(o.id); WP.old.delete(o.id); wpPlay(o.id); for (let i = 0; i < 100 && !wpReady(o.id); i++) await wait(50);
    const buf1 = WP.cache.get(o.id) && WP.cache.get(o.id).buf, e1 = buf1 ? Array.from(buf1.getChannelData(0).subarray(0, 200000)).reduce((a, v) => a + v * v, 0) : null;
    let same = !!(buf0 && buf1 && buf0.length === buf1.length); if (same) { const A = buf0.getChannelData(0), B = buf1.getChannelData(0); for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) { same = false; break; } }
    return {wav: names.includes('takes/' + o.id + '.wav'), man: names.includes('manifest.json'), eq: s0 === s1, hybrid: /"mode":"hybrid"/.test(s1), vd: /,\d+(\.\d+)?\]/.test(s0), h0, h1: await SYNQUENZER.tkPcmHash(o.id), same, e0, e1};
  }, r0);
  ok(z8.wav && z8.man, 'Container: Gesang-WAV + Inhaltsliste in der Datei', JSON.stringify({wav: z8.wav, man: z8.man}));
  ok(z8.eq && z8.hybrid, 'Container laden: Stücke (Anker an, Ziele vd), Schneiden/Dehnen, Tonhöhe gleich', JSON.stringify({eq: z8.eq, hybrid: z8.hybrid}));
  ok(z8.same, 'nach dem Laden klingt die Fassung bitgleich', JSON.stringify({same: z8.same, e0: z8.e0, e1: z8.e1}));
  // 9 Projekt wechseln mit offenem Editor → Editor zu, keine Fehler
  const t9 = await run(p, async o => { window.__vx1.open({t: o.st, s: 0}); await wait(800); switchProject(demoProject(), {first: true}); await wait(800); return {open: EL.rollSheet.classList.contains('open'), vx: !!(ED.rollAt && ED.rollAt.vx && EL.rollSheet.classList.contains('open'))}; }, r0);
  ok(!t9.vx, 'anderes Projekt laden: Gesang-Editor schließt', JSON.stringify(t9));
  // 10 Guide
  const g10 = await run(p, async () => { const L = SYNQUENZER.ui1 ? null : null; const hit = (typeof ui1Search === 'function' ? ui1Search('gesang bearbeiten noten') : []).slice(0, 5).map(e => e.id); return {hit}; });
  ok(g10.hit.includes('vx1rroll'), 'Guide: „Gesang bearbeiten wie Noten“ wird gefunden', g10.hit.join(','));
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 5).join(' | '));
await b.close();
console.log(`\n${all - bad}/${all} OK`);
process.exit(bad ? 1 : 0);
