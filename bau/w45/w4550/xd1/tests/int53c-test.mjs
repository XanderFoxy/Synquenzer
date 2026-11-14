// XD1-Kopie (Punkt 5): Schließen des Klang-Editors beendet den Vergleich jetzt auf NACHHER – „Vorher bei geschlossenem Editor“ gibt es nicht mehr.
// Darum bleibt der Editor hier offen (der Vergleich ist sichtbar, das ist der Vorher-Zustand, der beim Export noch vorkommen kann); sonst unverändert.
// INT53C-Test: Prüfung des Zusammenspiels ORI · VID5 · MIXG, Befunde A (Export = Nachher-Stand), B (Kopf-Farbe Marken-Editor), C (Dur ↔ Moll-Farbe).
// Nachprüfung (2. Runde): N1 Video-Bild = Nachher bis zum letzten Bild, N2 Projektdatei = Nachher, N3 ↷-Eintrag unverändert (hochkant). ONLY_N=1: nur N.
// Aufruf: node int53c-test.mjs <index.html> <ausgabe-ordner>   (Zeilen OK/FEHLER, Abschluss „INT53C: n/m bestanden“; hochkant 428×926 und quer 926×428)
// Gegenlauf: dieselbe Prüfung auf dem Stand vor INT53C (…/m3/int53c/index-vor-int53c.html) → die Zeilen zu A, B, C schlagen an.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { readPng } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/pruef-ori/png.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node int53c-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const VP = {p: [428, 926], q: [926, 428]};
async function open(vk) {
  const [w, h] = VP[vk];
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e && e.stack || e).slice(0, 300))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  await p.goto('file://' + path.resolve(file)); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1300);
  await p.mouse.click(Math.round(w / 2), Math.round(h / 3)).catch(() => {});
  // Hilfen im Seitenkontext: PCM des letzten Renders, Abstand in dB, WAV → Int16
  await p.evaluate(() => {
    window.__i16 = s => { const u = Uint8Array.from(atob(s), c => c.charCodeAt(0)); return new Int16Array(u.buffer, u.byteOffset, u.byteLength >> 1); };
    window.__pcm = () => window.__i16(SYNQUENZER.vvPcm(0).b64);
    window.__wav = s => { const u = Uint8Array.from(atob(s), c => c.charCodeAt(0)); return new Int16Array(u.buffer.slice(44, 44 + ((u.byteLength - 44) & ~1))); };
    window.__db = (a, b0) => { const n = Math.min(a.length, b0.length); let e = 0, s = 0; for (let i = 0; i < n; i++) { const d = a[i] - b0[i]; e += d * d; s += b0[i] * b0[i]; } return s > 0 ? +(10 * Math.log10(e / s + 1e-12)).toFixed(1) : null; };
    window.__lvl = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return a.length ? +(10 * Math.log10(s / a.length / 1073741824 + 1e-12)).toFixed(1) : null; };
    window.__bar = () => { const e = PSH.dock && PSH.dock.el.querySelector('.mxgst'); const A = PSH.dock && PSH.dock.el.querySelector('button[data-x2="A"]'); return {txt: e ? e.textContent : null, pressedA: A ? A.getAttribute('aria-pressed') : null}; };
  });
  return {ctx, p, errs};
}
const wait = (p, ms) => p.waitForTimeout(ms);

/* ============ A: Export = Nachher-Stand (Mix & Master 'snap' abgelegt auf Vorher) – Video, WAV, Instrumental ============ */
async function testA(vk) {
  const {ctx, p, errs} = await open(vk);
  const r0 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}, {scene: 0, bars: 1}]); ensureAudio(); await w(300);
    D.mx2Sheet(); await w(300);
    o.way = await D.mx2Way('mix'); await w(300);
    window.__snapB = mx2Snap(); o.mode = MX2.ab && MX2.ab.mode;
    const h0 = SYNQUENZER.int53c ? SYNQUENZER.int53c.info().holds : 0;
    await D.vvRender({}); window.__RB1 = window.__pcm(); o.lvlB = window.__lvl(window.__RB1);
    o.noHold = SYNQUENZER.int53c ? SYNQUENZER.int53c.info().holds === h0 : null;   // nichts verglichen: kein Leihen
    await D.vvRender({}); window.__RB2 = window.__pcm(); o.noise = window.__db(window.__RB2, window.__RB1);
    o.ab = D.mx2AB('A'); await w(250); window.__snapA = mx2Snap(); o.sideA = mx2Side(); o.differs = window.__snapA !== window.__snapB;
    o.dock = pshDock(); await w(250); o.docked = !!(PSH.dock && PSH.dock.name === 'mx2'); o.bar0 = window.__bar();
    return o;
  });
  ok(`[${vk}] A0 Vorbereitung: Mischen (Vergleich 'snap'), Vorher, Blatt abgelegt (⌄), Leiste sagt VORHER`, r0.way && r0.mode === 'snap' && r0.sideA === 'A' && r0.differs && r0.docked && /VORHER/.test(r0.bar0.txt || '') && r0.bar0.pressedA === 'true',
    {mode: r0.mode, side: r0.sideA, bar: r0.bar0, rauschen: r0.noise});
  if (r0.noHold !== null) ok(`[${vk}] A0 ohne Vergleich: der Export leiht nichts (wie bisher)`, r0.noHold === true);

  // A1 Video (mit Making-of-Vorlauf): Video-Blatt öffnen, erstellen; währenddessen die Leiste beobachten
  const r1 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.vvOpen(); await w(500);
    const bar = PSH.dock.el.getBoundingClientRect(), e = document.elementFromPoint(bar.left + bar.width / 2, bar.top + bar.height / 2); o.covered = !!(e && e.closest && e.closest('#vvSheet'));
    const seen = new Set(); let flips = 0; const iv = setInterval(() => { const t = window.__bar().txt || ''; seen.add(/NACHHER/.test(t) ? 'NACHHER' : /VORHER/.test(t) ? 'VORHER' : '?'); if (mx2Side() !== 'A') flips++; }, 60);
    const T0 = performance.now(); let res = null;
    try { res = await D.vvMake({fmt: '9:16', vd3: {mo: true}}); } catch (x) { o.err = String(x); } finally { clearInterval(iv); }
    o.ms = Math.round(performance.now() - T0); o.seen = [...seen]; o.flips = flips;
    o.res = res ? {ext: res.ext, pre: res.vd3 && res.vd3.pre, probe: res.vid5 && res.vid5.probe} : null;
    const V = window.__pcm(); o.dbNach = window.__db(V, window.__RB1); o.lvl = window.__lvl(V);
    o.after = {side: mx2Side(), snapA: mx2Snap() === window.__snapA, docked: !!(PSH.dock && PSH.dock.name === 'mx2'), bar: window.__bar(), did: SYNQUENZER.int53c ? SYNQUENZER.int53c.info().last : null, n: SYNQUENZER.int53c ? SYNQUENZER.int53c.info().n : null};
    o.cur = SYNQUENZER.vid5.info().cur; o.sigA = SYNQUENZER.vid5.sig();
    if (typeof vvSync === 'function' && VV.ui) vvSync(); await w(400); const ui = SYNQUENZER.vid5.info().ui; o.ui = ui ? {make: ui.make, old: ui.old} : null;   // (die API-Erstellung zeichnet das Blatt nicht neu – wie nach dem Tipp)
    return o;
  });
  await p.screenshot({path: path.join(out, `a1-video-vorher-${vk}.png`)});
  ok(`[${vk}] A1 Video mit abgelegtem Vorher: Ton = Nachher-Mix (Abstand zum Nachher-Render ≈ Rauschen ${r0.noise} dB)`, r1.res && r1.res.probe === 'ok' && r1.dbNach != null && r1.dbNach <= r0.noise + 4, {db: r1.dbNach, rauschen: r0.noise, res: r1.res, err: r1.err, ms: r1.ms});
  ok(`[${vk}] A1 danach weiter Vorher: Leiste VORHER, Mix exakt wie vorher, abgelegt, nie umgesprungen`, r1.after.side === 'A' && r1.after.snapA && r1.after.docked && /VORHER/.test(r1.after.bar.txt || '') && r1.after.bar.pressedA === 'true' && r1.seen.join() === 'VORHER' && r1.flips === 0 && r1.after.n === 0,
    {after: r1.after, gesehen: r1.seen, flips: r1.flips, verdeckt: r1.covered});
  ok(`[${vk}] A1 Video-Blatt: „Video ist aktuell“ gleich nach dem Erstellen (Fingerabdruck = Nachher)`, r1.cur === true && r1.ui && r1.ui.make && r1.ui.make.t === 'Video ist aktuell', {cur: r1.cur, ui: r1.ui});

  // A2 Fingerabdruck stabil: Vorher ↔ Nachher allein macht das Video nicht veraltet
  const r2 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.vvClose(); await w(200);
    D.mx2AB('B'); await w(250); o.sideB = mx2Side(); o.sigB = SYNQUENZER.vid5.sig(); o.curB = SYNQUENZER.vid5.info().cur; o.snapB = mx2Snap() === window.__snapB;
    D.mx2AB('A'); await w(250); o.sigA2 = SYNQUENZER.vid5.sig(); o.curA = SYNQUENZER.vid5.info().cur;
    D.vvOpen(); await w(700); const ui = SYNQUENZER.vid5.info().ui; o.ui = ui ? {make: ui.make, old: ui.old, tag: ui.tag} : null; D.vvClose(); await w(200);
    // eine echte Änderung macht es veraltet (Gegenprobe)
    D.mx2AB('B'); await w(200); const tr = S.tracks[0], v0 = tr.sound.fx.vol; tr.sound.fx.vol = Math.max(0.1, (v0 == null ? 0.8 : v0) - 0.2); o.curAfterEdit = SYNQUENZER.vid5.info().cur; tr.sound.fx.vol = v0; if (v0 === undefined) delete tr.sound.fx.vol;
    o.curBack = SYNQUENZER.vid5.info().cur; D.mx2AB('A'); await w(250);
    return o;
  });
  ok(`[${vk}] A2 Fingerabdruck stabil: Vorher = Nachher, Video bleibt aktuell (Gegenprobe: echte Änderung → veraltet)`, r2.sigB === r1.sigA && r2.sigA2 === r1.sigA && r2.curB && r2.curA && r2.snapB && r2.ui && r2.ui.make && r2.ui.make.t === 'Video ist aktuell' && r2.curAfterEdit === false && r2.curBack === true,
    {gleich: r2.sigB === r1.sigA, curB: r2.curB, curA: r2.curA, ui: r2.ui, gegenprobe: r2.curAfterEdit, zurueck: r2.curBack});

  // A3 WAV (ganzer Song) und Instrumental mit abgelegtem Vorher → Inhalt = Nachher; Leiste bleibt
  const r3 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    o.side0 = mx2Side();
    const wav = async () => { const x = await D.va1Export('song'); return x ? window.__wav(await D.va1ResB64()) : null; };
    const gb = async () => { const x = await D.ggbExport({pre: 0, remember: false}); return x ? window.__wav(D.ggbWav().b64) : null; };
    const WA = await wav(); o.afterWav = {side: mx2Side(), snapA: mx2Snap() === window.__snapA, bar: window.__bar()};
    const GA = await gb(); o.afterGb = {side: mx2Side(), snapA: mx2Snap() === window.__snapA, bar: window.__bar()};
    D.mx2AB('B'); await w(250);
    const WB = await wav(), WB2 = await wav(), GB = await gb(), GB2 = await gb();
    o.wav = {db: WA && WB ? window.__db(WA, WB) : null, rauschen: WB && WB2 ? window.__db(WB2, WB) : null, n: WA ? WA.length : 0};
    o.gb = {db: GA && GB ? window.__db(GA, GB) : null, rauschen: GB && GB2 ? window.__db(GB2, GB) : null, n: GA ? GA.length : 0};
    // Gegenprobe: der echte Vorher-Mix (Blatt zu, Vorher-Werte von Hand eingesetzt) klingt deutlich anders
    D.mx2AB('A'); await w(200);
    window.__WA = WA; window.__GA = GA;
    return o;
  });
  ok(`[${vk}] A3 WAV mit abgelegtem Vorher = Nachher (Abstand ≈ Rauschen), Leiste weiter VORHER`, r3.wav.db != null && r3.wav.db <= r3.wav.rauschen + 4 && r3.afterWav.side === 'A' && r3.afterWav.snapA && /VORHER/.test(r3.afterWav.bar.txt || ''), {wav: r3.wav, nach: r3.afterWav});
  ok(`[${vk}] A3 Instrumental-WAV (Gesang aus) mit abgelegtem Vorher = Nachher, Leiste weiter VORHER`, r3.gb.db != null && r3.gb.db <= r3.gb.rauschen + 4 && r3.afterGb.side === 'A' && r3.afterGb.snapA && /VORHER/.test(r3.afterGb.bar.txt || ''), {gb: r3.gb, nach: r3.afterGb});

  // A4 Gegenprobe: so klingt der echte Vorher-Mix (ohne Leihen) – deutlich anders als Nachher
  const r4 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.mx2AB('B'); await w(200); pshDockClose(); await w(200); o.closed = !MX2.ab;
    mx2Restore(window.__snapA); await w(200);
    await D.vvRender({}); const RV = window.__pcm(); o.dbVorher = window.__db(RV, window.__RB1);
    const WV = window.__wav(await (async () => { await D.va1Export('song'); return D.va1ResB64(); })());
    o.dbWavVorher = window.__db(WV, window.__WA);
    mx2Restore(window.__snapB); await w(200);
    return o;
  });
  ok(`[${vk}] A4 Gegenprobe: der echte Vorher-Mix weicht deutlich ab (Video/Render ${r4.dbVorher} dB, WAV ${r4.dbWavVorher} dB gegen ≤ ${r0.noise + 4})`, r4.closed && r4.dbVorher != null && r4.dbVorher > r1.dbNach + 6 && r4.dbWavVorher > r3.wav.db + 6, r4);
  ok(`[${vk}] A keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ A5–A8: die anderen Vorher-Zustände (Klang-Editor, Marken · STIMME, Refrain groß/Chor sauber; nicht erreichbare) ============ */
async function testA2(vk) {
  const {ctx, p, errs} = await open(vk);
  // A5 Klang-Editor: Vorher (Original) bleibt nach dem Schließen des Editors – der Export nimmt die Änderung
  const r5 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.loadDemo(); D.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); ensureAudio(); await w(300);
    const i = S.tracks.findIndex(t => t.kind === 'synth' && !percIs(t) && originRec(t.sound)); o.i = i; R.selT = i; openEditor(); await w(300);
    const s_ = deep(S.tracks[i].sound); o.cut0 = s_.p.cutoff; s_.p.cutoff = Math.max(0.02, (+s_.p.cutoff || 0.5) * 0.12); s_.p.res = Math.min(0.9, (+s_.p.res || 0) + 0.5); applySound(i, s_); o.cut1 = S.tracks[i].sound.p.cutoff; await w(150);
    const solo = async () => { VV.cancel = false; await va1Pass({tracks: new Set([i]), vox: 'none'}, true); return window.__pcm(); };   // nur diese Spur (wie der Einzelspur-Export)
    const RE = await solo(), RE2 = await solo(); o.rauschen = window.__db(RE2, RE);
    toggleAB(i); await w(200); const orig = JSON.stringify(S.tracks[i].sound); o.sideOrig = UI.ab && UI.ab.side;
    /* XD1: Editor bleibt offen */ await w(200); o.stillAb = !!(UI.ab && UI.ab.side === 'B');
    const sig0 = D.vid5.sig();
    const RA = await solo(); o.db = window.__db(RA, RE);
    o.after = {ab: UI.ab && UI.ab.side, origBack: JSON.stringify(S.tracks[i].sound) === orig, did: D.int53c ? D.int53c.info().last : null};
    const sigA = D.vid5.sig();
    R.selT = i; openEditor(); await w(250); toggleAB(i); await w(200); o.sigE = D.vid5.sig(); o.sigSame = sigA === o.sigE && sig0 === sigA;
    // Gegenprobe: das Original wirklich (Vergleich aus) klingt anders
    toggleAB(i); await w(150); UI.ab = null; o.dbOrig = window.__db(await solo(), RE);
    closeEditor(); return o;
  });
  ok(`[${vk}] A5 Klang-Editor auf Vorher (Editor offen): Export = deine Änderung, danach weiter Original zu hören`, r5.stillAb && r5.db != null && r5.db <= r5.rauschen + 4 && r5.dbOrig > r5.db + 6 && r5.after.ab === 'B' && r5.after.origBack,
    {db: r5.db, rauschen: r5.rauschen, original: r5.dbOrig, cutoff: [r5.cut0, r5.cut1], nach: r5.after});
  ok(`[${vk}] A5 Klang-Editor: Fingerabdruck Vorher = Nachher (Änderung)`, r5.sigSame === true);

  // A6 Marken · STIMME auf Vorher (Blatt offen, Menü erreichbar): der Export rechnet mit den Marken, danach wieder Original
  const r6 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    const sr = 48000, N = 3 * sr, x = new Int16Array(N); for (let k = 0; k < N; k++) x[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * k / sr) * (k % 24000 < 12000 ? 1 : 0.15));
    const L = await D.tkInject({pcm: Array.from(x), sr, scene: 0, len: 2}); await w(300);
    D.wpOpen({t: L.track, s: L.scene}); await w(500); D.wpAB(true); await w(150);
    const mb = document.querySelector('#bMenu'), rc = mb.getBoundingClientRect(), e = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2); o.menu = !!(e && (e === mb || mb.contains(e)));
    const ov = () => { const s = EL.wpSheet.querySelector('.mxgst'); return s ? s.textContent : null; };
    o.txt0 = ov(); const seen = new Set(); const iv = setInterval(() => { const t = ov() || ''; seen.add(/NACHHER/.test(t) ? 'NACHHER' : /VORHER/.test(t) ? 'VORHER' : '?'); }, 60);
    try { await D.vvRender({}); } finally { clearInterval(iv); }
    o.seen = [...seen]; o.did = D.int53c ? D.int53c.info().last : null; o.ab = WP.ab; o.open = EL.wpSheet.classList.contains('open'); o.txt1 = ov();
    D.wpClose(); await w(200); return o;
  });
  ok(`[${vk}] A6 Marken · STIMME auf Vorher: Export mit Marken (geliehen), danach wieder Original, Satz bleibt VORHER`, r6.menu && r6.did && r6.did.did.includes('wp') && r6.ab === true && r6.open && /VORHER/.test(r6.txt1 || '') && !r6.seen.includes('NACHHER'), r6);

  // A7 Refrain groß / Chor sauber (MX3, Chor-Blatt) auf Vorher, Chor-Blatt abgelegt: Export = Nachher, danach weiter Vorher
  const r7 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms)), sr = 48000, N = Math.round(4 * sr);
    const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60], JIT = [0.028, -0.032, 0.018, -0.036, 0.025, -0.022, 0.034];
    const syl = (jit, ct) => { const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69 + ct / 100) / 12), a = Math.round((t0 + jit[k]) * sr), n = Math.round(0.34 * sr);
      for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, ww = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)); s += ww * Math.sin(2 * Math.PI * f * t) / Math.sqrt(h); } x[a + i] += env * s; } });
      let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return Int16Array.from(x, v => Math.round(v / m * 0.5 * 32767)); };
    D.loadDemo(); ensureAudio(); await w(300);
    const L = await D.tkInject({pcm: Array.from(syl(ON.map(() => 0), 0)), sr, scene: 2, len: 2}); const r = {t: L.track, s: L.scene};
    const vid = await D.mix3.testTake(Array.from(syl(JIT, 18)), sr);
    const st = stimmeT(); S.tracks[st].chor = {lanes: [{id: 'c1', role: 'free', name: 'Chor eigene Stimme'}]};
    D.g6pPut(r, {v: 2, grp: {below: 8, hp: 120, mid: -2, midF: 400, air: 2, sib: 0, rev: 0.3, pre: 'aus', dly: 0.1}, voices: [{lane: 'c1', rule: 'free', n: ON.map((t, k) => ({t0: t, t1: t + 0.34, m: MI[k], d: 0, iv: 0})), db: -3, pan: 0.5, w: 0.2, dbl: [{ms: 0, ct: 0, p: 0}], take: {take: vid, in: 0, out: +(N / sr).toFixed(6), at: 0}, dblOff: true}]});
    D.songFromChain([{scene: 2, bars: 2}]); await w(300);
    o.clean = await D.mix3.clean(r); o.side0 = ch1AbSide();
    const chor = async () => { const x = await D.va1Export('chor'); return x ? window.__wav(await D.va1ResB64()) : null; };
    const CB = await chor(), CB2 = await chor(); o.rauschen = CB && CB2 ? window.__db(CB2, CB) : null;
    await D.vvMake({fmt: '9:16'}); o.curB = D.vid5.info().cur;
    D.g6Sheet(r); await w(500);
    ch1AB('A'); await w(400); o.sideA = ch1AbSide(); o.curA = D.vid5.info().cur;
    o.dock = pshDock(); await w(200); o.docked = !!(PSH.dock && PSH.dock.name === 'chor');
    const uTop = UNDO[UNDO.length - 1], uN = UNDO.length, rN = REDO.length, rTag = REDO[REDO.length - 1] && REDO[REDO.length - 1].ch1ab;
    const CA = await chor(); o.db = CA && CB ? window.__db(CA, CB) : null;
    o.after = {side: ch1AbSide(), undoSame: UNDO[UNDO.length - 1] === uTop && UNDO.length === uN, redo: REDO.length === rN && REDO[REDO.length - 1] && REDO[REDO.length - 1].ch1ab === rTag, did: D.int53c ? D.int53c.info().last : null, docked: !!(PSH.dock && PSH.dock.name === 'chor')};
    await D.vvMake({fmt: '9:16'}); o.curAfterMakeA = D.vid5.info().cur; const sA = D.vid5.sig();
    ch1AB('B'); await w(400); o.curBackB = D.vid5.info().cur; o.sigSame = D.vid5.sig() === sA;
    ch1AB('A'); await w(400);
    pshDockClose(); await w(200); o.ch1Gone = !(D.int53c && D.int53c.info().ch1);   // Blatt zu in Vorher = verworfen (wie bisher): ab hier zählt Vorher
    const CV = await chor(); o.dbVorher = CV && CB ? window.__db(CV, CB) : null;
    return o;
  });
  // Nachprüfung: die Chor-Renders sind fast bitgleich (−105 … −112 dB, 16-bit-Stufen) – dort ist „Rauschen + 4“ Zufall; unter −90 dB gilt als gleich (echtes Vorher: +3,3 dB)
  ok(`[${vk}] A7 Chor sauber auf Vorher, Chor-Blatt abgelegt: „Nur Chor“-WAV = Nachher (Abstand ≈ Rauschen), danach weiter Vorher, ↶/↷ unverändert`,
    r7.clean && r7.side0 === 'B' && r7.sideA === 'A' && r7.docked && r7.db != null && r7.db <= Math.max(r7.rauschen + 4, -90) && r7.after.side === 'A' && r7.after.undoSame && r7.after.redo && r7.after.docked && r7.after.did && r7.after.did.did.includes('ch1'),
    {db: r7.db, rauschen: r7.rauschen, nach: r7.after});
  ok(`[${vk}] A7 Chor: Fingerabdruck – Video aus Nachher bleibt aktuell bei Vorher, Video aus Vorher (abgelegt) aktuell bei Nachher`, r7.curB && r7.curA && r7.curAfterMakeA && r7.curBackB && r7.sigSame, {curB: r7.curB, curA: r7.curA, mA: r7.curAfterMakeA, zurueckB: r7.curBackB, gleich: r7.sigSame});
  ok(`[${vk}] A7 Gegenprobe: Chor-Blatt in Vorher geschlossen = verworfen → Export ist Vorher und weicht deutlich ab`, r7.ch1Gone && r7.dbVorher != null && r7.dbVorher > r7.db + 6, {vorher: r7.dbVorher, nachher: r7.db});

  // A8 nicht erreichbar (die Blätter gehen beim Öffnen von Video/Export zu): Gesangs-Effekte, Remix-Versuch, Dur ↔ Moll – per Finger
  const r8 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.loadDemo(); D.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ensureAudio(); await w(300);
    const sr = 48000, x = new Int16Array(2 * sr); for (let k = 0; k < x.length; k++) x[k] = Math.round(7000 * Math.sin(k / 17));
    await D.tkInject({pcm: Array.from(x), sr, scene: 0, len: 2}); await w(200);
    D.g4Sheet(); await w(300); g4AB(true); o.g4 = G4.ab; D.vvOpen(); await w(300); o.g4InVideo = G4.ab; D.vvClose(); await w(150);
    gr2RemixOpen(null); await w(400); return o;
  });
  const tp = async sel => { const e = await p.$(sel); if (!e) return false; await e.tap(); await wait(p, 450); return true; };
  r8.t1 = await tp('.gr2s button[data-g2="b"]'); await wait(p, 500); r8.t2 = await tp('.gr2s button[data-g2="a"]');
  Object.assign(r8, await p.evaluate(async () => { const o = {}, w = ms => new Promise(r => setTimeout(r, ms)); o.rx = int53RxR(); o.ses = !!GEN4.ses;
    SYNQUENZER.vvOpen(); await w(300); o.sesInVideo = !!GEN4.ses; o.popInVideo = UI.pop ? UI.pop.name : null; SYNQUENZER.vvClose(); await w(150); tktModeOpen(); await w(300); return o; }));
  r8.t3 = await tp('.tktmode button[data-tk="go"]'); r8.t4 = await tp('.tktmode button[data-tk="a"]');
  Object.assign(r8, await p.evaluate(async () => { const o = {}, w = ms => new Promise(r => setTimeout(r, ms)); o.tk = int53TkW();
    SYNQUENZER.vvOpen(); await w(300); o.tkInVideo = UI.pop ? UI.pop.name : null; o.tkState = !!GEN4.tk; SYNQUENZER.vvClose(); await w(150); o.any = SYNQUENZER.int53c ? SYNQUENZER.int53c.info().any : null; return o; }));
  ok(`[${vk}] A8 nicht erreichbar: Gesangs-Effekte, Remix-Versuch, Dur ↔ Moll gehen beim Öffnen des Video-Blatts zu (kein Vorher im Export)`,
    r8.g4 === true && r8.g4InVideo === false && r8.rx === 'A' && r8.ses && !r8.sesInVideo && r8.popInVideo === null && r8.tk === 'a' && r8.tkInVideo === null && !r8.tkState && r8.any === false, r8);
  ok(`[${vk}] A5–A8 keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ B: Marken-Editor-Kopf in der Bereichsfarbe (Gesang), auch Raumschiff-Look ============ */
async function testB(vk) {
  const {ctx, p, errs} = await open(vk);
  const r = await p.evaluate(async () => {
    const D = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)), o = {};
    D.loadDemo(); ensureAudio();
    const sr = 48000, x = new Int16Array(2 * sr); for (let k = 0; k < x.length; k++) x[k] = Math.round(7000 * Math.sin(k / 19) * (k % 12000 < 9000 ? 1 : 0));
    const L = await D.tkInject({pcm: Array.from(x), sr, scene: 2, len: 2}); await w(300);
    ui1Home(); setSongView(false); wpOpen({t: L.track, s: 2}); await w(700); D.ori.frame();
    const q = EL.wpSheet.querySelector('.qh'), rc = q.getBoundingClientRect();
    o.oria = EL.wpSheet.dataset.oria; o.shadow = getComputedStyle(q).boxShadow; o.rect = [rc.left, rc.top, rc.width, rc.height].map(v => Math.round(v * 10) / 10);
    const x2 = [...EL.wpSheet.querySelectorAll('button')].find(b => b.textContent.trim() === '✕' || /Schließen/.test(b.getAttribute('aria-label') || '')); if (x2) { const r2 = x2.getBoundingClientRect(), e = document.elementFromPoint(r2.left + r2.width / 2, r2.top + r2.height / 2); o.x = r2.top >= 0 && r2.bottom <= innerHeight && r2.right <= innerWidth && !!(e && (e === x2 || x2.contains(e))); }
    return o;
  });
  await p.screenshot({path: path.join(out, `b-wp-${vk}.png`)});
  const im = readPng(path.join(out, `b-wp-${vk}.png`)), col = [255, 111, 174];
  let best = 0; for (let dy = 0; dy < 4; dy++) { const yy = Math.floor(r.rect[1] + dy); let n = 0, m = 0; for (let xx = Math.floor(r.rect[0] + 16); xx < r.rect[0] + r.rect[2] - 16; xx += 3) { const px = im.get(xx, yy); n++; if (Math.abs(px[0] - col[0]) + Math.abs(px[1] - col[1]) + Math.abs(px[2] - col[2]) < 60) m++; } if (n) best = Math.max(best, m / n); }
  const rs = await p.evaluate(async () => { document.body.classList.add('orirs'); await new Promise(r => setTimeout(r, 200)); SYNQUENZER.ori.frame(); const q = EL.wpSheet.querySelector('.qh'), rc = q.getBoundingClientRect(); const o = {shadow: getComputedStyle(q).boxShadow, rect: [rc.left, rc.top, rc.width, rc.height].map(v => Math.round(v * 10) / 10)}; document.body.classList.remove('orirs'); return o; });
  ok(`[${vk}] B Marken-Editor: Kopf .qh trägt die Gesang-Farbe an der Oberkante (Anteil ${best.toFixed(2)}), nur Innenschatten`, r.oria === 'gesang' && /255, 111, 174/.test(r.shadow) && /inset/.test(r.shadow) && best >= 0.9, {oria: r.oria, shadow: r.shadow, anteil: +best.toFixed(2)});
  ok(`[${vk}] B Raumschiff-Look: Winkel-Balken links + oben am Kopf, Maße unverändert, ✕ sichtbar`, /7px 0px 0px 0px inset/.test(rs.shadow.replace(/rgb\([^)]*\) /g, '')) || (/inset/.test(rs.shadow) && /7px/.test(rs.shadow)), {shadow: rs.shadow});
  ok(`[${vk}] B Kopf-Maße gleich (normal ↔ Raumschiff) und ✕ sichtbar`, JSON.stringify(rs.rect) === JSON.stringify(r.rect) && r.x === true, {normal: r.rect, rs: rs.rect, x: r.x});
  ok(`[${vk}] B keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ C: Dur ↔ Moll – Farbe nach Bereich (Szene = Matrix, Song │ Alles = Song), folgt dem Umschalten im Blatt ============ */
async function testC(vk) {
  const {ctx, p, errs} = await open(vk);
  const info = () => p.evaluate(() => { const P = UI.pop && UI.pop.el; return {pop: UI.pop ? UI.pop.name : null, oria: P ? P.dataset.oria : null, app: EL.app.dataset.oria, sc: GEN4.tk ? GEN4.tk.sc : null, top: getComputedStyle(document.getElementById('top')).boxShadow.slice(0, 22)}; });
  const tapSel = async sel => { const q = await p.evaluate(sel => { const e = UI.pop && UI.pop.el.querySelector(sel); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel); if (!q) return false; await p.touchscreen.tap(q.x, q.y); await wait(p, 450); return true; };
  // ohne Song: über das Menü (wie Xander)
  await p.evaluate(() => { SYNQUENZER.loadDemo(); ensureAudio(); if (S.song) S.song.bars = 0; ui1Home(); setSongView(false); });
  await wait(p, 400);
  await p.evaluate(() => openMenu()); await wait(p, 300);
  const mt = await p.evaluate(() => { const b = [...EL.menu.querySelectorAll('button')].find(x => /Dur.*Moll/.test(x.textContent)); if (!b) return null; b.scrollIntoView({block: 'center'}); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
  if (mt) { await wait(p, 200); await p.touchscreen.tap(mt.x, mt.y); await wait(p, 700); } else await p.evaluate(() => tktModeOpen());
  const c1 = await info();
  await p.screenshot({path: path.join(out, `c-durmoll-szene-${vk}.png`)});
  const t1 = await tapSel('[data-g4tk="sc:all"]'); const c2 = await info();
  const t2 = await tapSel('[data-g4tk="sc:sz"]'); const c3 = await info();
  ok(`[${vk}] C ohne Song: Dur ↔ Moll für eine Szene = Matrix (türkis), Alles = Song, zurück Szene = Matrix (ohne Neuladen)`,
    c1.pop === 'tktmode' && c1.sc === 'sz' && c1.oria === 'matrix' && c1.app === 'matrix' && /60, 199, 220/.test(c1.top) && t1 && c2.sc === 'all' && c2.oria === 'song' && t2 && c3.sc === 'sz' && c3.oria === 'matrix', {c1, c2, c3});
  await p.evaluate(() => closePop()); await wait(p, 200);
  // mit Song (Song-Ansicht): Bereich Song = Song (wie bisher), Szene = Matrix
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ui1Home(); setSongView(true); tktModeOpen(); });
  await wait(p, 600);
  const d1 = await info(); const u1 = await tapSel('[data-g4tk="sc:sz"]'); const d2 = await info();
  await p.screenshot({path: path.join(out, `c-durmoll-song-szene-${vk}.png`)});
  const u2 = await tapSel('[data-g4tk="sc:song"]'); const d3 = await info();
  ok(`[${vk}] C mit Song: Bereich Song = Song (gelb), Szene = Matrix, zurück Song = Song`, d1.sc === 'song' && d1.oria === 'song' && u1 && d2.sc === 'sz' && d2.oria === 'matrix' && u2 && d3.sc === 'song' && d3.oria === 'song', {d1, d2, d3});
  const x = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-tk="x"]'); if (!b) return null; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && !!(e && (e === b || b.contains(e))); });
  ok(`[${vk}] C ✕ des Blatts sichtbar und erreichbar`, x === true);
  ok(`[${vk}] C keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ N: Nachprüfung (2. Runde) – 1 Video-Bild = Nachher bis zum letzten Bild (beide Wege, Abbruch), 2 Projektdatei = Nachher,
   3 ↷-Eintrag nach dem Chor-Export unverändert (Zeit, Felder) ============ */
async function testN(vk) {
  const {ctx, p, errs} = await open(vk);
  // N1 Klang-Editor auf Original (Editor offen), Bild „Gerät“ dieser Spur: welche Regler zeichnet jedes Bild? (WebCodecs-Weg, Aufnahme-Weg, Abbruch nach dem Ton)
  const r1 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    D.loadDemo(); D.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); ensureAudio(); await w(400);
    const bars = S.song.bars, cand = vvDirTracks(0, bars);
    const i = cand.find(t => S.tracks[t] && S.tracks[t].kind === 'synth' && !percIs(S.tracks[t]) && originRec(S.tracks[t].sound) && S.tracks[t].sound.engine !== 'mk' && S.tracks[t].sound.engine !== 'bm');
    o.i = i; R.selT = i; openEditor(); await w(300);
    const s_ = deep(S.tracks[i].sound); o.cut0 = s_.p.cutoff; s_.p.cutoff = Math.max(0.02, (+s_.p.cutoff || 0.5) * 0.12); applySound(i, s_); o.cutE = S.tracks[i].sound.p.cutoff; await w(150);
    o.dir = vvDirSet(0, bars, 'geraet', i);
    toggleAB(i); await w(200); /* XD1: Editor bleibt offen */ await w(200); o.side = UI.ab && UI.ab.side; o.heard = S.tracks[i].sound.p.cutoff;
    const orig = S.tracks[i].sound;
    let log = []; const g0 = window.vr1GerIn;
    window.vr1GerIn = function (...a) { const res = g0.apply(this, a); try { const s = sndOf(a[5]); log.push({n: INT53C.n, cut: s && s.p ? +s.p.cutoff : null}); } catch (e) {} return res; };
    const sum = () => { const by = {}; for (const x of log) { const k = (Math.abs(x.cut - o.cutE) < 1e-6 ? 'Änderung' : Math.abs(x.cut - o.cut0) < 1e-6 ? 'Original' : String(x.cut)) + '|n' + x.n; by[k] = (by[k] || 0) + 1; } return {frames: log.length, by}; };
    const after = () => ({side: UI.ab && UI.ab.side, cut: S.tracks[i].sound.p.cutoff, same: S.tracks[i].sound === orig, n: D.int53c.info().n, hold: D.int53c.info().hold, did: D.int53c.info().last && D.int53c.info().last.did});
    try {
      // a) WebCodecs (Bild läuft hinter dem Ton her)
      let res = null; try { res = await D.vvMake({fmt: '9:16'}); } catch (e) { o.errA = String(e); }
      o.a = Object.assign(sum(), {how: res && res.how, cur: D.vid5.info().cur, after: after()}); log = [];
      // b) Aufnahme-Weg (Bild erst nach dem Ton, in Echtzeit)
      D.vvTest({noVE: true}); res = null; try { res = await D.vvMake({fmt: '9:16'}); } catch (e) { o.errB = String(e); } D.vvTest({});
      o.b = Object.assign(sum(), {how: res && res.how, after: after()}); log = [];
      // c) Abbruch, nachdem der Ton fertig ist (das Bild hält den Stand noch): danach exakt Vorher
      let seenHold = false; const pr = D.vvMake({fmt: '9:16'}).then(() => 'fertig', e => String(e && e.message || e));
      for (let k = 0; k < 600 && !seenHold; k++) { await w(15); if (D.int53c.info().hold) seenHold = true; }
      if (seenHold) D.vvCancel();
      o.c = {seenHold, end: await pr, after: after()};
    } finally { window.vr1GerIn = g0; }
    return o;
  });
  ok(`[${vk}] N1 Video (WebCodecs), Klang-Editor auf Original: jedes Bild zeigt deine Änderung wie der Ton (geliehen bis zum letzten Bild)`,
    r1.side === 'B' && r1.dir && r1.a.how === 'webcodecs' && r1.a.frames > 30 && Object.keys(r1.a.by).length === 1 && r1.a.by['Änderung|n1'] === r1.a.frames && r1.a.after.side === 'B' && r1.a.after.same && r1.a.after.n === 0 && !r1.a.after.hold && r1.a.cur === true,
    {bilder: r1.a, err: r1.errA});
  ok(`[${vk}] N1 Video (Aufnahme-Weg): jedes Bild = Änderung, danach Original genau zurück`,
    r1.b.how === 'recorder' && r1.b.frames > 10 && Object.keys(r1.b.by).length === 1 && r1.b.by['Änderung|n1'] === r1.b.frames && r1.b.after.side === 'B' && r1.b.after.same && r1.b.after.cut === r1.cut0 && r1.b.after.n === 0 && !r1.b.after.hold,
    {bilder: r1.b, err: r1.errB});
  ok(`[${vk}] N1 Abbruch nach dem Ton (Bild hält noch): danach exakt Vorher (Original, nichts geliehen)`,
    r1.c.seenHold && /abgebrochen/.test(r1.c.end) && r1.c.after.side === 'B' && r1.c.after.same && r1.c.after.cut === r1.cut0 && r1.c.after.n === 0 && !r1.c.after.hold, r1.c);

  // N2 Projektdatei: Mix & Master abgelegt auf Vorher bzw. Klang-Editor auf Original → .json, ZIP, Alles sichern, Übergabe = Nachher; S bleibt Vorher
  const r2 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms));
    const files = [], d0 = window.deliver, z0 = window.buildZip;
    window.deliver = async (base, bytes, kind) => { if (kind === 'json') files.push({kind, text: new TextDecoder().decode(bytes)}); return 'test'; };   // die ZIP selbst: projekt.json über buildZip
    window.buildZip = fl => { const f = fl.find(x => x.name === 'projekt.json'); files.push({kind: 'zip', text: f ? new TextDecoder().decode(f.data) : null}); return z0(fl); };
    const prOf = t => { const j = JSON.parse(t); return j.kind === 'backup' ? (j.projects[0].project || j.projects[0]) : (j.project || j); };
    const hand = async () => { const u = await cloudHandoffUrl(), h = decodeURIComponent(u.split('#import=')[1] || ''); const b = unb64u(h.slice(1));
      const t = h[0] === 'z' ? new TextDecoder().decode(new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())) : new TextDecoder().decode(b); return t; };
    const vols = pr => pr.tracks.map(t => (t.sound && t.sound.fx ? t.sound.fx.vol : null));
    const all = async () => { files.length = 0; await saveFile(); VA1.direct = true; try { await tkExportZip(); } finally { VA1.direct = false; } await backupAll(); const t = await hand(); return [...files.map(f => f.text), t]; };
    try {
      D.loadDemo(); D.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); ensureAudio(); await w(400);
      const fl0 = await all(); o.n0 = fl0.length; const ser0 = serialize();
      o.plain = fl0.every(t => t && JSON.stringify(prOf(t).tracks) === JSON.stringify(JSON.parse(ser0).project.tracks));   // ohne Vergleich: wie bisher
      D.mx2Sheet(); await w(300); await D.mx2Way('mix'); await w(2500);
      const vN = vols(JSON.parse(serialize()).project); D.mx2AB('A'); await w(300); pshDock(); await w(300);
      const snapA = mx2Snap(), serA = serialize(), vV = vols(JSON.parse(serA).project);
      const fl1 = await all(); o.mx2 = {n: fl1.length, nachher: vN, vorher: vV, datei: fl1.map(t => (t ? vols(prOf(t)) : null)), side: mx2Side(), snapSame: mx2Snap() === snapA, serSame: serialize() === serA, docked: !!(PSH.dock && PSH.dock.name === 'mx2')};
      o.mx2.ok = vN.join() !== vV.join() && o.mx2.datei.every(v => v && v.join() === vN.join());
      pshDockClose(); await w(300);
      const i = S.tracks.findIndex(t => t.kind === 'synth' && !percIs(t) && originRec(t.sound)); R.selT = i; openEditor(); await w(300);
      const s_ = deep(S.tracks[i].sound), cut0 = s_.p.cutoff; s_.p.cutoff = Math.max(0.02, (+s_.p.cutoff || 0.5) * 0.12); applySound(i, s_); const cutE = S.tracks[i].sound.p.cutoff; await w(150);
      toggleAB(i); await w(200); /* XD1: Editor bleibt offen */ await w(200); const orig = S.tracks[i].sound, serB = serialize();
      const fl2 = await all(); o.snd = {n: fl2.length, cut0, cutE, datei: fl2.map(t => (t ? prOf(t).tracks[i].sound.p.cutoff : null)), side: UI.ab && UI.ab.side, same: S.tracks[i].sound === orig, live: S.tracks[i].sound.p.cutoff, serSame: serialize() === serB};
      o.snd.ok = o.snd.datei.every(c => c === cutE) && o.snd.side === 'B' && o.snd.same && o.snd.live === cut0 && o.snd.serSame;
      // Echtzeit-Mitschnitt: bewusst unverändert (spielt live, was du hörst) – nichts geliehen
      songAudioStart(); await w(500); o.rt = {on: SREC.on, n: D.int53c.info().n, live: S.tracks[i].sound.p.cutoff}; songAudioStop(true); await w(400); stop();
    } finally { window.deliver = d0; window.buildZip = z0; }
    o.n = D.int53c.info().n; return o;
  });
  ok(`[${vk}] N2 ohne Vergleich: .json, ZIP, Alles sichern, Übergabe wie bisher (= Projekt)`, r2.n0 === 4 && r2.plain, {n: r2.n0});
  ok(`[${vk}] N2 Mix & Master abgelegt auf Vorher: .json, ZIP, Alles sichern, Übergabe enthalten den Nachher-Mix; Song, Leiste, Mix bleiben Vorher`,
    r2.mx2.n === 4 && r2.mx2.ok && r2.mx2.side === 'A' && r2.mx2.snapSame && r2.mx2.serSame && r2.mx2.docked, r2.mx2);
  ok(`[${vk}] N2 Klang-Editor auf Original: alle vier Dateien enthalten deine Änderung; zu hören bleibt das Original (dasselbe Objekt)`, r2.snd.n === 4 && r2.snd.ok, r2.snd);
  ok(`[${vk}] N2 Echtzeit-Mitschnitt unverändert (live, was du hörst – Vorschlag im Funk), nichts bleibt geliehen`, r2.rt.on && r2.rt.n === 0 && r2.n === 0, r2.rt);

  // N3 Chor sauber auf Vorher, Chor-Blatt abgelegt, Video: der ↷-Eintrag danach mit Zeit und Feldern wie vorher
  const r3 = await p.evaluate(async () => {
    const D = SYNQUENZER, o = {}, w = ms => new Promise(r => setTimeout(r, ms)), sr = 48000, N = Math.round(4 * sr);
    const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60], JIT = [0.028, -0.032, 0.018, -0.036, 0.025, -0.022, 0.034];
    const syl = (jit, ct) => { const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69 + ct / 100) / 12), a = Math.round((t0 + jit[k]) * sr), n = Math.round(0.34 * sr);
      for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, ww = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)); s += ww * Math.sin(2 * Math.PI * f * t) / Math.sqrt(h); } x[a + i] += env * s; } });
      let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return Int16Array.from(x, v => Math.round(v / m * 0.5 * 32767)); };
    D.loadDemo(); ensureAudio(); await w(300);
    const L = await D.tkInject({pcm: Array.from(syl(ON.map(() => 0), 0)), sr, scene: 2, len: 2}); const rr = {t: L.track, s: L.scene};
    const vid = await D.mix3.testTake(Array.from(syl(JIT, 18)), sr);
    const st = stimmeT(); S.tracks[st].chor = {lanes: [{id: 'c1', role: 'free', name: 'Chor eigene Stimme'}]};
    D.g6pPut(rr, {v: 2, grp: {below: 8, hp: 120, mid: -2, midF: 400, air: 2, sib: 0, rev: 0.3, pre: 'aus', dly: 0.1}, voices: [{lane: 'c1', rule: 'free', n: ON.map((t, k) => ({t0: t, t1: t + 0.34, m: MI[k], d: 0, iv: 0})), db: -3, pan: 0.5, w: 0.2, dbl: [{ms: 0, ct: 0, p: 0}], take: {take: vid, in: 0, out: +(N / sr).toFixed(6), at: 0}, dblOff: true}]});
    D.songFromChain([{scene: 2, bars: 2}]); await w(300);
    o.clean = await D.mix3.clean(rr); D.g6Sheet(rr); await w(500);
    ch1AB('A'); await w(400); o.side = ch1AbSide(); o.dock = pshDock(); await w(300);
    const J = x => JSON.stringify(x), top0 = REDO[REDO.length - 1], r0 = J(REDO), u0 = J(UNDO), k0 = Object.keys(top0).sort().join();
    D.vvOpen(); await w(400); try { await D.vvMake({fmt: '9:16', vd3: {mo: false}}); } catch (e) { o.err = String(e); }
    o.did = D.int53c.info().last && D.int53c.info().last.did; D.vvClose(); await w(300);
    const top1 = REDO[REDO.length - 1];
    o.redoSame = J(REDO) === r0; o.undoSame = J(UNDO) === u0; o.keys = [k0, Object.keys(top1).sort().join()]; o.time = [top0.time, top1.time]; o.mk = ['mergeKey' in top0, 'mergeKey' in top1]; o.side1 = ch1AbSide(); o.cur = D.vid5.info().cur;
    pshDockClose(); await w(200); return o;
  });
  ok(`[${vk}] N3 Chor sauber auf Vorher, Video: ↷-Eintrag danach gleich (Zeit ${r3.time && r3.time[0]}, Felder, kein mergeKey), ↶ gleich, Video aktuell`,
    r3.clean && r3.side === 'A' && r3.did && r3.did.includes('ch1') && r3.redoSame && r3.undoSame && r3.keys[0] === r3.keys[1] && r3.time[0] === r3.time[1] && r3.mk[0] === r3.mk[1] && r3.side1 === 'A' && r3.cur === true, r3);
  ok(`[${vk}] N keine Fehler auf der Seite`, !errs.length, errs.slice(0, 4));
  await ctx.close();
}

/* ============ Pflicht: Datei ============ */
const html = fs.readFileSync(file, 'utf8');
const brand = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].map(w => [w, html.split(w).length - 1]).filter(x => x[1]);
ok('Pflicht: Markenwörter 0, „MS 2000“ genau 1×, „  live: true,“ genau 1×', !brand.length && html.split('MS 2000').length - 1 === 1 && html.split('  live: true,').length - 1 === 1, {brand, ms: html.split('MS 2000').length - 1, live: html.split('  live: true,').length - 1});
const blk = (html.match(/\/\* INT53C-BEGIN[\s\S]*?INT53C-END \*\//) || [''])[0];
ok('INT53C-Block vorhanden, jede Einhänge-Stelle mit Kommentar INT53C', blk.length > 2000 && /int53cRender\(o\); \} finally[^\n]*INT53C/.test(html) && /const ph = int53cSigP\(\);[^\n]*INT53C/.test(html) && /int53cCh1Pre\(s\);[^\n]*INT53C/.test(html) && /\.sheet\[data-oria\] \.qh\{/.test(html) && /P\.name === 'tktmode'[^\n]*INT53C/.test(html), {blk: blk.length});

ok('INT53C Nachprüfung: Einhänge-Stellen (vvMake, Projektdatei ×4) je 1× und mit Kommentar INT53C', [/int53cHoldEnd\(\);[^\n]*INT53C/g, /histFileAdd\(int53cFile\([^\n]*INT53C/g, /\[int53cFile\(\(\) => projectFileObj\(S\)\)\];[^\n]*INT53C/g, /JSON\.stringify\(int53cFile\(\(\) => projectFileObj\(S, false, false\)\)\)\);[^\n]*INT53C/g, /int53cFile\(\(\) => g6pfZipProject\(\)[^\n]*INT53C/g].every(re => (html.match(re) || []).length === 1));
if (process.env.ONLY_N) { await testN('p'); } else
for (const vk of ['p', 'q']) {
  const T0 = Date.now();
  await testA(vk); if (vk === 'p') { await testA2(vk); await testN(vk); } await testB(vk); await testC(vk);
  console.log(`(${vk}: ${Math.round((Date.now() - T0) / 1000)} s)`);
}
await b.close();
const n = res.filter(r => r.pass).length;
fs.writeFileSync(path.join(out, 'int53c-test.json'), JSON.stringify(res, null, 1));
console.log(`INT53C: ${n}/${res.length} bestanden`);
process.exit(n === res.length ? 0 : 1);
