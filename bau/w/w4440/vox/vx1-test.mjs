// VX1 – gezielte Prüfung: Chor entkoppelt (C), natürlich ↔ hart (P), Schneiden (W), Übersprechen (R), Editor/Mikro (E)
// node vx1-test.mjs [P C W R E]   – Fotos: vx1-*.png in diesem Ordner
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4440/vox/';
const APP = DIR + 'index.html', BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4440/basis.html';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const db = v => +(10 * Math.log10(v + 1e-20)).toFixed(1);
// Mikro-Attrappe im selben AudioContext + Loopback (App-Ausgang → Mikro) – wie dirigent-test/v3-vs3-h.mjs
const INIT = () => {
  const O = window.AudioContext; window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } }; window.webkitAudioContext = window.AudioContext;
  const F = window.__fake = {srcs: []}; window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1; const g = ctx.createGain(); g.connect(dest); F.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - .5) * .0008; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start(); return dest.stream;
  };
  F.play = (arr, when) => { const ctx = window.__ctx, b = ctx.createBuffer(1, arr.length, ctx.sampleRate); b.getChannelData(0).set(arr); const s = ctx.createBufferSource(); s.buffer = b; s.connect(F.bus); s.start(when); F.srcs.push(s); };
  window.__loop = sec => { const F = window.__fake, ctx = window.__ctx; if (!F.bus) return false; const dl = ctx.createDelay(1); dl.delayTime.value = sec; const g = ctx.createGain(); g.gain.value = .7; for (const n of window.__outs) { try { n.connect(dl); } catch (e) {} } dl.connect(g); g.connect(F.bus); return true; };
};
const IPHONE = () => {
  const md = navigator.mediaDevices; if (!md) return; const g0 = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { const s = await g0(c); for (const t of s.getAudioTracks()) Object.defineProperty(t, 'label', {get: () => 'iPhone Mikrofon', configurable: true}); return s; };
  md.enumerateDevices = async () => [{kind: 'audioinput', deviceId: 'mic1', groupId: 'g1', label: 'iPhone Mikrofon'}, {kind: 'audiooutput', deviceId: 'out1', groupId: 'g1', label: 'iPhone Lautsprecher'}];
};
async function open(file, vp, o = {}) {
  const br = o.br || await chromium.launch(), ctx = await br.newContext({viewport: vp || {width: 428, height: 926}, hasTouch: !!o.touch, deviceScaleFactor: 1});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.fake) await p.addInitScript(INIT);
  if (o.iphone) await p.addInitScript(IPHONE);
  if (o.ls) await p.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) {} }, o.ls);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
  return {br, ctx, p, errs};
}
// gesungene Noten (Vibrato, Formanten) als Int16 – Kanal für tkInject
function voice(sr, notes, vib = 40) {
  const T = notes.reduce((s, q) => s + q[1], 0) + .2, n = Math.round(T * sr), out = new Int16Array(n); let ph = 0, t0 = .1, k = 0;
  const seg = notes.map(([m, d]) => { const r = {a: t0, b: t0 + d, m}; t0 += d; return r; });
  for (let i = 0; i < n; i++) {
    const t = i / sr; while (k < seg.length - 1 && t >= seg[k].b) k++; const r = seg[k];
    if (t < seg[0].a || t > seg[seg.length - 1].b) { out[i] = 0; continue; }
    const f = 440 * Math.pow(2, (r.m + vib / 100 * Math.sin(2 * Math.PI * 5.5 * (t - r.a)) * Math.min(1, (t - r.a) / .2) - 69) / 12); ph += 2 * Math.PI * f / sr;
    let v = 0; for (let h = 1; h <= 18 && h * f < sr * .45; h++) { const fh = h * f; v += (Math.exp(-Math.pow((fh - 650) / 250, 2)) + .5 * Math.exp(-Math.pow((fh - 1100) / 300, 2)) + .03) * Math.sin(h * ph) / Math.sqrt(h); }
    const e = Math.min(1, (t - r.a) / .02, (r.b - t) / .03); out[i] = Math.round(9000 * Math.max(0, e) * v);
  }
  return Array.from(out);
}
// drei „Wörter“ (Tonstöße 440/550/660 Hz) mit Pausen – für das Schneiden
function words(sr) {
  const W = [[.25, .65, 440], [.95, 1.35, 550], [1.65, 2.05, 660]], n = Math.round(2.4 * sr), out = new Int16Array(n);
  for (const [a, b, f] of W) for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, e = Math.min(1, (t - a) / .005, (b - t) / .005); out[i] = Math.round(12000 * e * (Math.sin(2 * Math.PI * f * t) + .3 * Math.sin(4 * Math.PI * f * t))); }
  return Array.from(out);
}
const rms = (a, i0, i1) => { let s = 0, n = 0; for (let i = Math.max(0, i0); i < Math.min(a.length, i1); i++) { s += a[i] * a[i]; n++; } return n ? s / n : 0; };

// ================= P: natürlich ↔ hart =================
if (want('P')) {
  console.log('— P: Tonhöhe natürlich ↔ hart');
  const H = await open(APP), p = H.p;
  const r = await p.evaluate(() => SYNQUENZER.vx1PitchCmp());
  const vib = k => r[k].notes.map(x => x && x.vib), cen = k => r[k].notes.map(x => x && x.center);
  console.log('  gesungen (Cent neben dem Halbton):', r.sung.join(' / '), '· Original Vibrato', vib('orig').join('/'), 'Sprung', r.orig.jump);
  for (const k of ['weich', 'natuerlich', 'nat50', 'nat100', 'hart']) console.log('  ' + k.padEnd(10), 'Mitte', cen(k).join('/'), '· Vibrato', vib(k).join('/'), '· steilster Übergang', r[k].jump, 'Cent/10 ms ·', r[k].ms, 'ms');
  ok(r.natuerlich.notes.every((x, i) => x && Math.abs(x.vib - r.orig.notes[i].vib) <= 3), 'natürlich: Vibrato bleibt (±3 Cent zur Vorlage)');
  ok(r.natuerlich.notes.every(x => x && Math.abs(x.center) <= 10), 'natürlich: Notenmitten auf dem Ton (≤ 10 Cent; vorher bis 25 Cent daneben)');
  ok(r.natuerlich.jump < r.weich.jump && r.natuerlich.jump < r.hart.jump, `natürlich: Übergänge weicher (${r.natuerlich.jump} < Weich alt ${r.weich.jump}, Hart ${r.hart.jump})`);
  ok(r.nat100.notes.every(x => x && x.vib < 5) && r.nat50.notes.every((x, i) => x && x.vib < r.natuerlich.notes[i].vib - 5 && x.vib > r.nat100.notes[i].vib + 5), 'Regler wirkt stufenlos: hart rastet das Vibrato ein, 50 % halbiert es');
  // ohne nat bleibt der Kern bitgleich (gleiches Signal, Plan „Weich“ wie bisher) – gegen 4.42.0
  const HASH = () => { const sr = 44100, n = sr * 2, x = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr, m = t < 1 ? 57.3 : 59.8, f = 440 * Math.pow(2, (m + .4 * Math.sin(2 * Math.PI * 5.5 * t) - 69) / 12); ph += 2 * Math.PI * f / sr; let v = 0; for (let h = 1; h < 16; h++) v += Math.sin(h * ph) / h; x[i] = .2 * v * Math.min(1, t / .02, (2 - t) / .05); }
    const an = G2P.analyse(x, sr, VSD), plan = {mode: 'soft', v: 2, rt: 40, notes: an.notes.map(q => ({t0: q.t0, t1: q.t1, m: q.m, to: Math.round(q.m), s: 1, e: 0}))}, y = G2P.render(x, sr, an, plan).y;
    const u = new Uint8Array(y.buffer); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16) + ':' + G2P.planKey(plan); };
  const B = await open(BASE, null, {br: H.br}), hb = await B.p.evaluate(HASH), hv = await p.evaluate(HASH);
  ok(hb === hv, 'Plan ohne „nat“ (alte Takes): Kern und Cache-Schlüssel bitgleich zu 4.42.0 (' + hv + ')');
  ok(!H.errs.length && !B.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.concat(B.errs).slice(0, 2)));
  await H.br.close();
}

// ================= C: Chor entkoppelt =================
async function chorRun(file, br, shot) {
  const H = await open(file, {width: 428, height: 926}, {br}), p = H.p, sr = 48000;
  await p.evaluate(() => { SYNQUENZER.setBpm && SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
  const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm: voice(sr, [[57, .9], [60, .9], [64, .9], [62, .9]]), sr, scene: 0, len: 2});
  const r = {t: inj.track, s: 0};
  await p.evaluate(r => { for (let t = 0; t < 8; t++) if (t !== r.t) { try { SYNQUENZER.setMute(t, true); } catch (e) {} } }, r);
  await p.evaluate(r => SYNQUENZER.g6pStyle(r, '80'), r);
  const ready = await p.evaluate(r => SYNQUENZER.g6pWait(r), r);
  const meas = async () => { await p.evaluate(() => SYNQUENZER.g6pTap(true)); await sleep(2600); return p.evaluate(() => { const T = SYNQUENZER.g6pTap(false), q = a => { let s = 0; for (const v of a) s += v * v; return s / Math.max(1, a.length); }; return {lead: q(T.L[0]), chor: q(T.C[0])}; }); };
  await p.evaluate(r => { SYNQUENZER.launchScene(r.s); }, r); await sleep(700);
  const on = await meas();
  await p.evaluate(r => { if (SYNQUENZER.vx1LeadMute) SYNQUENZER.vx1LeadMute(true); else SYNQUENZER.setMute(r.t, true); }, r); await sleep(500);
  const off = await meas();
  let mix = null;
  if (shot) {
    await p.evaluate(() => SYNQUENZER.stop());
    await p.evaluate(() => SYNQUENZER.chsMixer && SYNQUENZER.chsMixer()); await sleep(400);
    mix = await p.evaluate(() => { const b = document.querySelector('.pop.chsmix [data-a="leadm"]'), x = document.querySelector('.pop.chsmix .chs-x'); if (!b) return null; const r = b.getBoundingClientRect(), rx = x.getBoundingClientRect(); return {w: r.width, h: r.height, pressed: b.getAttribute('aria-pressed'), xIn: rx.top >= 0 && rx.right <= innerWidth}; });
    await p.screenshot({path: DIR + 'vx1-mischpult-hochkant.png'});
    const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
    await p.click('.pop.chsmix [data-a="leadm"]'); await sleep(250);
    mix.after = await p.evaluate(r => ({mute: SYNQUENZER.vx1Info && S.tracks[r.t].mute, pressed: document.querySelector('.pop.chsmix [data-a="leadm"]').getAttribute('aria-pressed'), u: SYNQUENZER.undoInfo()}), r);
    mix.u0 = u0;
  }
  await H.ctx.close();
  return {ready, on, off, mix, errs: H.errs};
}
if (want('C')) {
  console.log('— C: Chor entkoppelt');
  const br = await chromium.launch();
  const v = await chorRun(APP, br, true), b = await chorRun(BASE, br, false);
  console.log('  VX1   Lead an:', db(v.on.lead), 'dB / Chor', db(v.on.chor), 'dB · Lead stumm:', db(v.off.lead), '/', db(v.off.chor), 'dB');
  console.log('  4.42  Lead an:', db(b.on.lead), 'dB / Chor', db(b.on.chor), 'dB · Lead stumm:', db(b.off.lead), '/', db(b.off.chor), 'dB');
  ok(v.ready && v.on.lead > 1e-6 && v.on.chor > 1e-7, 'Chor-Gruppe gerechnet, Lead und Chor klingen');
  ok(v.off.lead < 1e-9 && Math.abs(db(v.off.chor) - db(v.on.chor)) < 3, 'Lead stumm: Lead still, der Chor klingt weiter (gleicher Pegel ±3 dB)');
  ok(b.off.chor < 1e-9, '4.42.0 zum Vergleich: dort verstummte mit dem Lead auch der Chor');
  ok(v.mix && v.mix.w >= 44 && v.mix.h >= 44 && v.mix.pressed === 'true' && v.mix.xIn, 'Mischpult: [M] neben „Lead“ (' + (v.mix && v.mix.w) + '×' + (v.mix && v.mix.h) + ' px), gedrückt, ✕ im Bild');
  ok(v.mix && v.mix.after.mute === false && v.mix.after.pressed === 'false' && v.mix.after.u.n === v.mix.u0 + 1 && /Lead/.test(v.mix.after.u.top.label), 'Tipp auf [M]: Lead wieder an, ein Undo „' + (v.mix && v.mix.after.u.top.label) + '“');
  ok(!v.errs.length, 'keine Konsolenfehler ' + JSON.stringify(v.errs.slice(0, 2)));
  await br.close();
}

// ================= W: Wort löschen, Lücke, Gesten, Nachlauf =================
if (want('W')) {
  console.log('— W: Schneiden im Marken-Editor');
  const br = await chromium.launch();
  for (const vp of [{width: 428, height: 926, n: 'hochkant'}, {width: 926, height: 428, n: 'quer'}]) {
    const H = await open(APP, vp, {br}), p = H.p, sr = 48000, quer = vp.n === 'quer';
    await p.evaluate(() => { SYNQUENZER.setBpm && SYNQUENZER.setBpm(120); });
    const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm: words(sr), sr, scene: 1, len: 2});
    const r = {t: inj.track, s: 1}, id0 = inj.id;
    await p.evaluate(r => SYNQUENZER.wpOpen(r), r);
    await p.evaluate(r => SYNQUENZER.wpDetect(r), r); await sleep(300);
    const g = await p.evaluate(() => SYNQUENZER.wpGeom());
    const xOf = t => g.x + (t - g.view.a) / g.view.W * g.w, yW = g.y + 24, yM = g.y + (44 + g.h - 44) / 2;   // Griff-Leiste oben, freies Band in der Mitte (unten liegt das Lineal)
    // Tipp auf das zweite Wort → Auswahl von Strich zu Strich
    await p.mouse.click(xOf(1.1), yW); await sleep(520);
    const s1 = await p.evaluate(() => SYNQUENZER.vx1Info());
    const bar = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .vx1bar .rb')].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.a, Math.round(r.width), Math.round(r.height)]; }));
    const xs = await p.evaluate(() => { const b = document.querySelector('#wpSheet .sh-x').getBoundingClientRect(); return {top: b.top, right: b.right, w: b.width, h: b.height}; });
    ok(s1.sel && Math.abs(s1.sel.a - .95) < .03 && Math.abs(s1.sel.b - 1.335) < .03 && s1.bar, vp.n + ': Tipp zwischen zwei Striche wählt das Stück von Strich zu Strich: ' + JSON.stringify(s1.sel));
    ok(bar.length === 4 && bar.every(b => b[1] >= 44 && b[2] >= 44), vp.n + ': Leiste [▶] [Löschen] [Lücke] [✕] ≥ 44 px: ' + JSON.stringify(bar));
    ok(xs.top >= 0 && xs.right <= vp.width && xs.w >= 44, vp.n + ': ✕ des Editors im Bild ' + JSON.stringify(xs));
    // Griff ziehen: Lupe an, Kante rastet ein
    if (s1.sel) {
      const xb = xOf(s1.sel.b);
      await p.mouse.move(xb, yM); await p.mouse.down(); await p.mouse.move(xb - 12, yM, {steps: 4});
      const lu = await p.evaluate(() => { const l = document.getElementById('g10lupe'); return !!l && l.classList.contains('on'); });
      await p.mouse.move(xb - 25, yM, {steps: 4}); await p.mouse.up(); await sleep(100);
      const s2 = await p.evaluate(() => SYNQUENZER.vx1Info());
      ok(lu && s2.sel && s2.sel.b < s1.sel.b - .01, vp.n + ': Griff ziehen mit Lupe, rechte Kante ' + s1.sel.b.toFixed(3) + ' → ' + (s2.sel && s2.sel.b.toFixed(3)));
    }
    await p.screenshot({path: DIR + 'vx1-schneiden-' + vp.n + '.png'});
    if (quer) { await H.ctx.close(); continue; }
    // genau [0,9 s; 1,6 s) schneiden: der Rest rückt nach, keine Dehnung
    await p.evaluate(() => SYNQUENZER.vx1Sel(.9, 1.6));
    const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
    const play0 = await p.evaluate(() => SYNQUENZER.vsClock().playing);
    const cut = await p.evaluate(() => SYNQUENZER.vx1Cut(false));
    const st = await p.evaluate(([r, id0]) => { const c = SYNQUENZER.getClip(r.t, r.s), T = SYNQUENZER.takes(); return {take: c.audio.take, out: c.audio.out, old: T[id0], neu: T[c.audio.take], info: SYNQUENZER.vx1Info(), u: SYNQUENZER.undoInfo()}; }, [r, id0]);
    const pcm = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), st.take);
    const L0 = st.old.len, L1 = st.neu.len, sh = (L0 - L1) / sr;
    ok(cut && st.take !== id0 && Math.abs(sh - .7) < 2 / sr, 'Löschen: neuer Take, 0,700 s kürzer (' + sh.toFixed(4) + ' s), alter Take bleibt');
    let on3 = -1; for (let i = Math.round(.7 * sr); i < pcm.length; i++) if (Math.abs(pcm[i]) > 3000) { on3 = i / sr; break; }
    let zc = 0; const a3 = Math.round((on3 + .05) * sr), b3 = Math.round((on3 + .35) * sr); for (let i = a3 + 1; i < b3; i++) if ((pcm[i - 1] < 0) !== (pcm[i] < 0)) zc++;
    const f3 = zc / 2 / .3;
    ok(Math.abs(on3 - .95) < .006 && Math.abs(f3 - 660) < 8, `der Rest rückt nach: drittes Wort beginnt bei ${on3.toFixed(3)} s (vorher 1,650), Tonhöhe ${f3.toFixed(0)} Hz (660 – nicht gedehnt)`);
    let mx = 0, ty = 0; const c0 = Math.round(.9 * sr); for (let i = c0 - 600; i < c0 + 600; i++) { const d2 = Math.abs(pcm[i + 1] - 2 * pcm[i] + pcm[i - 1]); if (d2 > mx) mx = d2; } for (let i = Math.round(.4 * sr); i < Math.round(.5 * sr); i++) ty = Math.max(ty, Math.abs(pcm[i + 1] - 2 * pcm[i] + pcm[i - 1]));
    ok(mx <= ty * 1.5 + 50, `kein Knack an der Naht (2. Differenz ${mx}, im Ton ${ty})`);
    ok(Math.abs(st.out - (2.4 - .7)) < .002 && st.u.n === u0 + 1 && st.info.edId === st.take, 'Stück zeigt auf den neuen Take, Ende rückt mit (' + st.out + ' s), ein Undo „' + st.u.top.label + '“, Editor folgt');
    const mk = (st.neu.marks || []).map(k => +k.t.toFixed(3));
    ok(mk.length === 4 && Math.abs(mk[0] - .25) < .03 && Math.abs(mk[1] - .635) < .03 && Math.abs(mk[2] - .95) < .03 && Math.abs(mk[3] - 1.335) < .03, 'Striche rücken mit (Anfang/Ende von Wort 2 weg, Wort 3 um 0,7 s früher): ' + mk.join(', '));
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
    const ud = await p.evaluate(([r]) => ({take: SYNQUENZER.getClip(r.t, r.s).audio.take, ed: SYNQUENZER.vx1Info().edId}), [r]);
    ok(ud.take === id0 && ud.ed === id0, '↶ holt den alten Take zurück, der Editor folgt');
    await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
    const rd = await p.evaluate(([r]) => SYNQUENZER.getClip(r.t, r.s).audio.take, [r]);
    ok(rd === st.take, '↷ wieder geschnitten');
    // Lücke lassen: Länge bleibt, das erste Wort ist stumm
    await p.evaluate(() => SYNQUENZER.vx1Sel(.2, .7)); const gcut = await p.evaluate(() => SYNQUENZER.vx1Cut(true)); if (!gcut) console.log('  Lücke: vx1Cut false', JSON.stringify(await p.evaluate(() => SYNQUENZER.vx1Info())));
    const gp = await p.evaluate(([r]) => { const c = SYNQUENZER.getClip(r.t, r.s); return {take: c.audio.take, len: SYNQUENZER.takes()[c.audio.take].len}; }, [r]);
    const pg = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), gp.take);
    ok(gp.len === L1 && rms(pg, .27 * sr, .63 * sr) < 1 && rms(pg, 1.0 * sr, 1.3 * sr) > 1e6, 'Lücke: Länge bleibt (' + (gp.len / sr).toFixed(3) + ' s), Wort 1 stumm, Wort 3 unverändert');
    // Speichern → Laden (deep-equal) und Audio aus dem Speicher
    const T0 = await p.evaluate(() => SYNQUENZER.takes());
    await p.evaluate(() => SYNQUENZER.saveNow ? SYNQUENZER.saveNow() : SYNQUENZER.save && SYNQUENZER.save()); await sleep(1200);
    await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(800);
    const T1 = await p.evaluate(() => SYNQUENZER.takes()), h1 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), gp.take);
    ok(JSON.stringify(T1[gp.take]) === JSON.stringify(T0[gp.take]) && JSON.stringify(T1[st.take]) === JSON.stringify(T0[st.take]) && !!h1, 'Neuladen: geschnittene Takes deep-equal, Audio aus dem Speicher');
    // Wisch-Scroll mit Nachlauf (eingezoomt)
    await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(r => SYNQUENZER.wpOpen(r), r); await sleep(300);
    await p.click('#wpSheet .wpz'); await sleep(150);
    const g2 = await p.evaluate(() => SYNQUENZER.wpGeom()), y2 = g2.y + 50, x2 = g2.x + g2.w * .8;   // freies Band (unten liegt das Lineal)
    await p.evaluate(() => { const E = WP.ed; E.va = E.vw.a + E.vw.W * 0; });
    await p.mouse.move(x2, y2); await p.mouse.down(); for (let k = 1; k <= 5; k++) { await p.mouse.move(x2 - k * 30, y2); await sleep(8); } await p.mouse.up();
    const f0 = await p.evaluate(() => ({fl: SYNQUENZER.vx1Info().fling, a: SYNQUENZER.wpGeom().view.a})); await sleep(450);
    const f1 = await p.evaluate(() => SYNQUENZER.wpGeom().view.a);
    ok(f0.fl && f1 > f0.a + 1e-4, `Wisch-Scroll läuft nach (Ansicht ${f0.a.toFixed(3)} → ${f1.toFixed(3)} s nach dem Loslassen)`);
    ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
    await H.ctx.close();
  }
  await br.close();
}

// ================= R: Übersprechen (Weg-Erkennung, Echo-Weg trotz „Kopfhörer“) =================
async function bleedRun(file, br) {
  const H = await open(file, {width: 428, height: 926}, {br, fake: true}), p = H.p;
  const BPM = 120, SB = .5, LEAD = .04;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(600);
  await p.evaluate(() => window.__loop(.02137));
  await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); }, BPM);
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  const MEL = [[0, 1, 57], [1, 1, 60], [4, 1, 64], [5, 1, 62], [8, 1, 60], [9, 1, 64], [12, 1, 59], [13, 1, 57]];
  const x = new Float32Array(Math.round(16.5 * SB * sr)); let ph = 0;
  for (const [b, d, m] of MEL) { const a = Math.round((LEAD + b * SB) * sr), e = Math.round((LEAD + (b + d) * SB) * sr), f = 440 * Math.pow(2, (m - 69) / 12); for (let i = a; i < e; i++) { const t = (i - a) / sr, en = Math.min(1, t / .02, (e - i) / sr / .03); ph += 2 * Math.PI * f / sr; x[i] = .18 * en * (Math.sin(ph) + .5 * Math.sin(2 * ph) + .25 * Math.sin(3 * ph)); } }
  await p.evaluate(arr => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(Float32Array.from(arr), c.start - .04); }, Array.from(x));
  await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, 16.5, {timeout: 60000, polling: 20});
  await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5}));
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 30000});
  await p.evaluate(() => SYNQUENZER.vsResultOk && SYNQUENZER.vsResultOk());
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 40000});
  await sleep(2500);
  const id = await p.evaluate(() => { const T = SYNQUENZER.takes(); return Object.keys(T).sort((a, b) => T[a].created - T[b].created).pop(); });
  if (await p.evaluate(id => !!SYNQUENZER.takes()[id].cl, id)) await p.waitForFunction(id => !!CL.buf.get(id), id, {timeout: 40000}).catch(() => {});   // gesäuberte Fassung fertig
  await sleep(500);
  const r = await p.evaluate(async id => { const raw = await SYNQUENZER.tkPcmRange(id); return {meta: SYNQUENZER.takes()[id], raw: raw.map(v => v / 32767), heard: SYNQUENZER.clPlayRange(id), info: SYNQUENZER.vx1Info ? SYNQUENZER.vx1Info() : null}; }, id);
  // die gesungene Stimme im Take finden (Hüllkurven-Korrelation), dann Pausen (Stimme ±80 ms still) gegen gesungene Stellen
  const D = 480, env = a => { const o = new Float32Array(Math.ceil(a.length / D)); for (let i = 0; i < a.length; i++) o[(i / D) | 0] += a[i] * a[i]; return o; };
  const eR = env(r.raw), eY = env(x); let best = -1, bl = 0;
  for (let l = -eY.length; l < eR.length; l++) { let s = 0; for (let j = 0; j < eY.length; j++) { const k = j + l; if (k >= 0 && k < eR.length) s += Math.sqrt(eY[j] * eR[k]); } if (s > best) { best = s; bl = l; } }
  const pk = Math.max(...eY), quiet = k => { for (let d = -8; d <= 8; d++) { const j = k - bl + d; if (j >= 0 && j < eY.length && eY[j] > pk * 1e-4) return false; } return true; };
  const lv = (a, pause) => { const e = env(a); let s = 0, n = 0; for (let k = 0; k < e.length; k++) { const j = k - bl, inV = j >= 0 && j < eY.length && eY[j] > pk * .05; if (pause ? quiet(k) && j > -100 && j < eY.length + 100 : inV) { s += e[k]; n++; } } return s / Math.max(1, n) / D; };
  const pz = true, vz = false;
  await H.ctx.close();
  return {meta: r.meta, info: r.info, rawP: db(lv(r.raw, pz)), rawV: db(lv(r.raw, vz)), heardP: db(lv(r.heard, pz)), heardV: db(lv(r.heard, vz)), errs: H.errs};
}
if (want('R')) {
  console.log('— R: Übersprechen');
  const br = await chromium.launch();
  // R1: ein früher erkannter Weg („Kabel“ nach einem USB-Interface) ohne eigene Wahl
  const LS = ['synq-stimme-v1', JSON.stringify({v: 1, prof: {}, route: 'wired'})];
  const rt = async file => { const H = await open(file, null, {br, fake: true, iphone: true, ls: LS}), p = H.p; await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.stimmeStart({cal: false}); }); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); const v = await p.evaluate(() => SYNQUENZER.stimme().route); await H.ctx.close(); return v; };
  const rv = await rt(APP), rb = await rt(BASE);
  ok(rv === 'speaker' && rb === 'wired', `Weg beim Start mit eingebautem Mikro: VX1 „${rv}“ (4.42.0: „${rb}“ – dort blieb der alte erkannte Weg kleben, kein Säubern)`);
  // R2: Weg steht auf „Kabel“, die Musik kommt aber hörbar ins Mikro (Lautsprecher)
  const v = await bleedRun(APP, br), b = await bleedRun(BASE, br);
  console.log('  VX1  Take', JSON.stringify({route: v.meta.route, cl: v.meta.cl, rf: v.meta.rf}), 'Probe', JSON.stringify(v.info && v.info.probe), '· Pausen roh', v.rawP, 'dB → gehört', v.heardP, 'dB · Gesang', v.rawV, '→', v.heardV, 'dB');
  console.log('  4.42 Take', JSON.stringify({route: b.meta.route, cl: b.meta.cl, rf: b.meta.rf}), '· Pausen roh', b.rawP, 'dB → gehört', b.heardP, 'dB');
  ok(v.meta.cl === 60 && v.meta.rf > 0 && v.info.probe && v.info.probe.pk >= 15, 'Musik im Mikro erkannt (Echo-Spitze ' + (v.info.probe && v.info.probe.pk) + ' ≥ 15): Referenz nachgetragen, SÄUBERN 60 %');
  ok(v.rawP - v.heardP >= 20 && Math.abs(v.heardV - v.rawV) < 3, `hörbar: Musik in den Gesangspausen −${(v.rawP - v.heardP).toFixed(1)} dB, Gesang ±${Math.abs(v.heardV - v.rawV).toFixed(1)} dB`);
  ok(!b.meta.cl && b.rawP - b.heardP < 6, '4.42.0 zum Vergleich: kein Säubern, das Übersprechen bleibt');
  ok(!v.errs.length, 'keine Konsolenfehler ' + JSON.stringify(v.errs.slice(0, 2)));
  await br.close();
}

// ================= E: Mikro-Taste entprellt, Regler im Noten-Editor =================
if (want('E')) {
  console.log('— E: Mikro-Taste, Noten-Editor');
  const br = await chromium.launch();
  const H = await open(APP, {width: 926, height: 428}, {br, fake: true}), p = H.p, sr = 48000;
  const m = await p.evaluate(async () => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.vx1MicGuardReset(); const a = SYNQUENZER.stimmeToggle(), b = SYNQUENZER.stimmeToggle(); await new Promise(r => setTimeout(r, 900)); return {a, b, on: SYNQUENZER.stimme().phase, blocked: SYNQUENZER.vx1Info().micBlocked}; });
  ok(m.a && !m.b && m.blocked >= 1 && m.on !== 'off', 'Doppeltipp auf 🎤: an bleibt an (zweiter Tipp verworfen) ' + JSON.stringify(m));
  await p.evaluate(() => SYNQUENZER.stimmeStop());
  const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm: voice(sr, [[57.3, .8], [59.8, .8], [62.2, .8]]), sr, scene: 2, len: 2});
  await p.evaluate(r => SYNQUENZER.g2Open(r), {t: inj.track, s: 2}); await sleep(600);
  await p.evaluate(() => SYNQUENZER.g2Analyse && SYNQUENZER.g2Analyse()); await sleep(300);
  await p.click('#wpSheet .g2chips [data-v="soft"]'); await sleep(1500);
  const n0 = await p.evaluate(r => { const P = SYNQUENZER.takes()[SYNQUENZER.getClip(r.t, r.s).audio.take].pitch; const row = document.querySelector('#wpSheet .vx1-nat'), rt = document.querySelector('#wpSheet .g10g-rt:not(.vx1-nat)'); return {nat: P && P.nat, q: P && P.q, row: !!row && !row.hidden, rt: !!rt && !rt.hidden, h: row && row.getBoundingClientRect().height}; }, {t: inj.track, s: 2});
  ok(n0.q && n0.nat === 0 && n0.row && !n0.rt && n0.h >= 44, '[Weich] = natürlich (nat 0); Regler „Natürlich ↔ Hart“ steht am Platz der Einrast-Zeit ' + JSON.stringify(n0));
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.locator('#wpSheet .vx1-nat input').fill('70'); await sleep(600);
  const n1 = await p.evaluate(r => ({P: SYNQUENZER.takes()[SYNQUENZER.getClip(r.t, r.s).audio.take].pitch, u: SYNQUENZER.undoInfo(), plan: SYNQUENZER.vx1Plan(r)}), {t: inj.track, s: 2});
  ok(n1.P.nat === 70 && n1.P.mode === 'hard' && n1.plan && n1.plan.nat === .7 && n1.u.n === u0 + 1, 'Regler auf 70: nat 70, Plan nat 0,7, ein Undo „' + n1.u.top.label + '“');
  await p.screenshot({path: DIR + 'vx1-tonhoehe-quer.png'});
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await br.close();
}
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
