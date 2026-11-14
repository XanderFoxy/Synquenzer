// XD1 – acht Punkte („eigenmächtig entscheiden, was logischer ist … Sachen richtig darstellen“): Gesang im Mikrofon-Blatt + Mich selbst hören,
// Video quer, Matrix-Szenenkopf im STOPP, Echtzeit-Mitschnitt mit Nachher, Klang-Editor endet auf Nachher, MIXG ohne Neuaufbau, MIX-A-Messung
// mit Quittung, ORI „Wo bin ich“ ganz lesbar. Je Punkt Touch-Prüfungen hochkant + quer + quer-370, Messungen bei Klang/Timing, Regression gegen die Basis.
// Aufruf: node xd1-test.mjs <index.html> <ausgabe-ordner> [basis.html]      Zeilen OK/FEHLER, Fotos im Ausgabe-Ordner
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [fileArg, outArg, basisArg] = process.argv.slice(2);
if (!fileArg || !outArg) { console.log('FEHLER Aufruf: node xd1-test.mjs <index.html> <ausgabe-ordner> [basis.html]'); process.exit(2); }
const FILE = path.resolve(fileArg), OUT = path.resolve(outArg), BASIS = path.resolve(basisArg || path.join(path.dirname(FILE), '../basis.html'));
fs.mkdirSync(OUT, {recursive: true});
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, run = k => !ONLY || ONLY.includes(k);
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 900) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const VP = {p: [428, 926], q: [926, 428], q2: [926, 370]}, VN = {p: 'hochkant', q: 'quer', q2: 'quer-370'};
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
// Mikro-Attrappe im selben AudioContext: Sinus 440 Hz, Spitze 0,25 (−15 dBFS RMS)
const MIC = () => {
  const O = window.AudioContext; window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } }; window.webkitAudioContext = window.AudioContext;
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 440; g.gain.value = .25; o.connect(g); g.connect(dest); o.start(); return dest.stream;
  };
};
async function open(file, vk, o = {}) {
  const [w, h] = VP[vk];
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  if (o.mic) await ctx.addInitScript(MIC);
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await sleep(900);
  const cdp = await ctx.newCDPSession(p);
  const T = {
    down: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}),
    up: () => cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}),
    move: (x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}),
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(180); },
  };
  return {ctx, p, errs, T, vk, close: () => ctx.close()};
}
// Mitte eines Elements (Selektor oder Funktion im Seitenkontext); scrollt es vorher ins Bild
const box = (p, sel) => p.evaluate(s => { const e = s.startsWith('() =>') ? (0, eval)(s)() : document.querySelector(s); if (!e || !e.getClientRects().length) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2}; }, typeof sel === 'function' ? sel.toString() : sel);
const tapSel = async (P, sel) => { const r = await box(P.p, sel); if (!r) return false; await P.T.tap(r.cx, r.cy); return true; };
// alle sichtbaren Tasten eines Blatts: kleiner als 44 px? ✕ im Bild und antippbar?
const sheetCheck = (p, rootFn) => p.evaluate(src => {
  const R0 = (0, eval)(src)(); if (!R0) return null;
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const bs = [...R0.querySelectorAll('button')].filter(vis), small = bs.filter(x => { const r = x.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map(x => (x.textContent || x.getAttribute('aria-label') || '').trim().slice(0, 20));
  const xs = bs.filter(x => x.textContent.trim() === '✕' || /Schließen/.test(x.getAttribute('aria-label') || ''));
  const xin = xs.some(x => { const r = x.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= 0 && r.bottom <= innerHeight + .5 && r.left >= 0 && r.right <= innerWidth + .5 && e && (e === x || x.contains(e)); });
  const rr = R0.getBoundingClientRect();
  return {n: bs.length, small, x: xin, inView: rr.left >= -.5 && rr.right <= innerWidth + .5 && rr.top >= -.5 && rr.bottom <= innerHeight + .5};
}, rootFn.toString());
const popEl = () => (UI.pop && UI.pop.el) || null;
const H = fs.readFileSync(FILE, 'utf8'), HB = fs.existsSync(BASIS) ? fs.readFileSync(BASIS, 'utf8') : '';

/* ======================= Pflicht + Einhänge-Zeilen ======================= */
if (run('pflicht')) {
  const cnt = (s, w) => s.split(w).length - 1;
  const words = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia', 'Elektron', 'iPhone', 'TikTok', 'Safari', 'Claude'];
  const more = words.map(w => [w, cnt(H, w), cnt(HB, w)]).filter(x => x[1] > x[2]);
  ok('Pflicht: „MS 2000“ 1×, „  live: true,“ 1×, Markenwörter nicht mehr als in der Basis', cnt(H, 'MS 2000') === 1 && cnt(H, '  live: true,') === 1 && !more.length, {ms: cnt(H, 'MS 2000'), live: cnt(H, '  live: true,'), more});
  const ver = s => (s.match(/const VERSION = '4\.[0-9.]+';/) || [''])[0], chg = s => { const i = s.indexOf('const CHANGES'); return i < 0 ? '' : s.slice(i, i + 4000); };
  ok('VERSION und CHANGES unverändert', ver(H) === ver(HB) && chg(H) === chg(HB), {v: ver(H)});
  const i0 = H.indexOf('/* INT53D-END */'), i1 = H.indexOf('/* XD1-BEGIN'), i2 = H.indexOf('/* XD1-END */');
  const lines = H.split('\n').filter(l => /XD1/.test(l) && !(H.indexOf(l) >= i1 && H.indexOf(l) <= i2));
  ok('Ein Block XD1-BEGIN … XD1-END direkt nach INT53D-END; Einhänge-Zeilen außerhalb mit „XD1“ markiert (3: stSheetFill, bindStSheet, vvSwapIn)', i0 > 0 && i1 === i0 + '/* INT53D-END */\n'.length && i2 > i1 && H.split('XD1-BEGIN').length === 2 && lines.length === 3 && /xd1MicHtml/.test(lines[0]) && /xd1MicTap/.test(lines[1]) && /int53WkSync/.test(lines[2]), lines.map(l => l.trim().slice(0, 70)));
}

/* ======================= (1) Gesang: Mikrofon-Blatt ======================= */
if (run('gesang')) for (const vk of ['p', 'q', 'q2']) {
  const P = await open(FILE, vk, {mic: true}), {p} = P;
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); const sr = 48000, a = new Array(sr).fill(0).map((_, i) => Math.round(6000 * Math.sin(i / 17)));
    await SYNQUENZER.tkInject({pcm: a, sr, scene: 0, len: 1}); ui1Home(); setSongView(false); await new Promise(r => setTimeout(r, 200)); });
  await p.evaluate(() => stSheet()); await sleep(500);
  const L0 = await p.evaluate(() => { const P = UI.pop && UI.pop.name === 'stimme' ? UI.pop.el : null; if (!P) return null; const a = P.querySelector('.xd1sing'), m = P.querySelector('.xd1mon');
    const lb = [(a && a.querySelector('.st-lbl') || {}).textContent, m ? m.querySelector('span').firstChild.textContent : null], sm = a ? [...a.querySelectorAll('[data-xd1^="vox2s:"]')].map(x => [x.firstChild.textContent, x.classList.contains('on')]) : [], mo = m ? [...m.querySelectorAll('[data-xd1^="mon:"]')].map(x => [x.textContent, x.classList.contains('on')]) : [];
    const c2 = P.querySelector('.st-c2'), nx = m && m.nextElementSibling;   // beide oben in der Spalte „Stimme → Noten“, gleich danach deren Titel
    return {lb, sm, mo, step: (P.querySelector('.origs .on span') || {}).textContent || '', inC2: !!(a && m && c2.firstElementChild === a && a.nextElementSibling === m), next: nx && nx.textContent, row: m && m.classList.contains('st-mel')}; });
  ok(`(1) ${VN[vk]}: Mikrofon-Blatt (Schritt „${L0 && L0.step}“) hat oben in „Stimme → Noten“ „Beim Singen hören“ [Begleitung │ + Melodie │ nur Klick] und „Mich selbst hören“ [An │ Aus] (Zeile wie „Melodieerkennung“) – Standard Begleitung, Aus`,
    L0 && L0.lb.join('|') === 'Beim Singen hören|Mich selbst hören' && L0.sm.map(x => x[0]).join('|') === 'Begleitung|+ Melodie|nur Klick' && L0.sm[0][1] && L0.mo.map(x => x[0]).join('|') === 'An|Aus' && L0.mo[1][1] && L0.step === 'Aufnehmen' && L0.inC2 && L0.row && /Stimme → Noten/i.test(L0.next || ''), L0);
  const C0 = await sheetCheck(p, popEl);
  await p.screenshot({path: `${OUT}/xd1-1-mikro-${vk}.png`});
  ok(`(1) ${VN[vk]}: Mikrofon-Blatt im Bild, ✕ sichtbar und antippbar, alle Tasten ≥ 44 px`, C0 && C0.x && C0.inView && !C0.small.length, C0);
  // Touch: „nur Klick“ im Mikrofon-Blatt → derselbe Zustand im Blatt von ● halten
  await tapSel(P, '.pop .xd1mic [data-xd1="vox2s:klick"]');
  const t1 = await p.evaluate(() => ({i: SYNQUENZER.vox2.info(), on: !!document.querySelector('.pop .xd1mic [data-xd1="vox2s:klick"].on')}));
  ok(`(1) ${VN[vk]}: Tipp „nur Klick“ im Mikrofon-Blatt → gewählt (vox2Sm, zuletzt getippt = Beim Singen)`, t1.i.sm === 'klick' && t1.i.lr === 's' && t1.on, {sm: t1.i.sm, lr: t1.i.lr, on: t1.on});
  await p.evaluate(() => { closePop(); popRecOpts(); }); await sleep(450);
  const t2 = await p.evaluate(() => { const r = document.querySelector('.pop #vox2Rec'); return r ? [...r.querySelectorAll('button')].map(x => [x.dataset.g10j, x.classList.contains('on')]) : null; });
  ok(`(1) ${VN[vk]}: Blatt von ● halten behält seine Zeile „Beim Singen“ – zeigt dieselbe Einstellung (nur Klick)`, t2 && t2.length === 3 && t2.find(x => x[0] === 'vox2s:klick')[1], t2);
  if (t2) { await tapSel(P, '.pop #vox2Rec [data-g10j="vox2s:mel"]'); }
  await p.evaluate(() => { closePop(); stSheet(); }); await sleep(450);
  const t3 = await p.evaluate(() => ({sm: SYNQUENZER.vox2.info().sm, on: [...document.querySelectorAll('.pop .xd1mic [data-xd1^="vox2s:"]')].filter(x => x.classList.contains('on')).map(x => x.dataset.xd1)}));
  ok(`(1) ${VN[vk]}: Tipp „+ Melodie“ im Blatt von ● halten → das Mikrofon-Blatt zeigt „+ Melodie“ (ein Zustand)`, t3.sm === 'mel' && t3.on.join() === 'vox2s:mel', t3);
  await tapSel(P, '.pop .xd1mic [data-xd1="vox2s:beg"]');
  // Mich selbst hören: Weg Kabel, Mikro an (per Finger), an/aus, Lautsprecher = stumm
  await tapSel(P, '.pop #stRoute button[data-v="wired"]');
  await tapSel(P, '.pop .st-go'); await p.waitForFunction(() => ST.phase === 'live', null, {timeout: 8000}).catch(() => {}); await sleep(300);
  const lvl = () => p.evaluate(async () => { const M = XD1.mon; if (!M) return {node: false, db: -200}; const a = M.c.createAnalyser(); a.fftSize = 4096; M.g.connect(a); const buf = new Float32Array(4096); let m = 0;
    for (let k = 0; k < 6; k++) { await new Promise(r => setTimeout(r, 70)); a.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; m = Math.max(m, s / buf.length); }
    try { M.g.disconnect(a); } catch (e) {} return {node: true, db: +(10 * Math.log10(m + 1e-20)).toFixed(1)}; });
  const m0 = Object.assign(await lvl(), await p.evaluate(() => ({pref: SYNQUENZER.xd1.info().mon, phase: ST.phase, route: ST.route})));
  await tapSel(P, '.pop .xd1mic [data-xd1="mon:1"]'); await sleep(450);
  const m1 = Object.assign(await lvl(), await p.evaluate(() => { const st = stimmeT(), tr = S.tracks[st]; let fx = null; try { fx = trackFx(tr); } catch (e) {} return {i: SYNQUENZER.xd1.info(), vol: fx ? fx.vol : null, rev: fx ? fx.rev : null, hint: (document.querySelector('.pop .xd1hp') || {}).textContent || '', ctxLat: Math.round(((AU.ctx.baseLatency || 0) + (AU.ctx.outputLatency || 0)) * 1000)}; }));
  ok(`(1) ${VN[vk]}: Mich selbst hören per Finger an (Kabel): deine Stimme ${m1.db} dB am Ausgang (Mikro −15 dB, Pegel wie STIMME ${m1.vol}²), Hall-Send = Pegel × Hall der STIMME (${m1.rev}), direkt (am Master vorbei)`,
    !m0.node && !m0.pref && m1.node && m1.i.mon && m1.db > -26 && m1.db < -12 && m1.i.node && Math.abs(m1.i.node.r - m1.i.node.g * (m1.rev || 0)) < .002 && m1.i.node.hall && m1.i.node.live, {m0, m1: {db: m1.db, node: m1.i.node, vol: m1.vol, rev: m1.rev, ctxLat: m1.ctxLat}});
  await tapSel(P, '.pop #stRoute button[data-v="speaker"]'); await sleep(500);
  const m2 = Object.assign(await lvl(), await p.evaluate(() => ({i: SYNQUENZER.xd1.info(), warn: !!document.querySelector('.pop .xd1hp.st-warn'), hint: (document.querySelector('.pop .xd1hp') || {}).textContent || ''})));
  ok(`(1) ${VN[vk]}: Weg Lautsprecher → bleibt stumm (${m2.db} dB), der Satz warnt (kein Pfeifen)`, m2.db < -80 && m2.warn && /Lautsprecher/.test(m2.hint), {db: m2.db, hint: m2.hint});
  await tapSel(P, '.pop #stRoute button[data-v="wired"]'); await sleep(450);
  const m3 = await lvl();
  await tapSel(P, '.pop .xd1mic [data-xd1="mon:0"]'); await sleep(300);
  const m4 = Object.assign(await lvl(), await p.evaluate(() => ({i: SYNQUENZER.xd1.info(), proj: JSON.stringify(projectFileObj(S, true, true)).includes('xd1Mon')})));
  ok(`(1) ${VN[vk]}: zurück auf Kabel → wieder hörbar (${m3.db} dB); „aus“ → Knoten weg, nichts im Projekt`, m3.db > -26 && !m4.node && !m4.i.mon && !m4.i.node && !m4.proj, {m3: m3.db, m4: m4.i.node, proj: m4.proj});
  // Einmessen / Offline-Render: stumm
  await tapSel(P, '.pop .xd1mic [data-xd1="mon:1"]'); await sleep(300);
  const m5 = await p.evaluate(async () => { UI.vvOff = true; xd1MonSync(); await new Promise(r => setTimeout(r, 120)); const g = SYNQUENZER.xd1.info().node.g; UI.vvOff = false; xd1MonSync(); return {g, g2: SYNQUENZER.xd1.info().node.g}; });
  ok(`(1) ${VN[vk]}: im Offline-Render stumm (Pegel ${m5.g}), danach wieder ${m5.g2}`, m5.g === 0 && m5.g2 > 0, m5);
  await p.evaluate(() => { setUiPref('xd1Mon', false); xd1MonSync(); stStop('aus'); closePop(); }); await sleep(300);
  // Takes-Blatt: nur „Hören“, Verweis-Satz
  await p.evaluate(() => { const st = stimmeT(); selectSlot(st, 0); tkSheet({t: st, s: 0}); }); await sleep(500);
  const tk = await p.evaluate(() => { const P = UI.pop && UI.pop.name === 'takes' ? UI.pop.el : null, t = P && P.querySelector('.vox2tk'); return t ? {rows: [...t.querySelectorAll('.vox2r .lbl')].map(x => x.textContent), n: t.querySelectorAll('button').length, sing: t.querySelectorAll('[data-a^="vox2s:"]').length, hp: (t.querySelector('.vox2hp') || {}).textContent || ''} : null; });
  ok(`(1) ${VN[vk]}: Takes-Blatt: nur „Hören: Gesang │ Melodie │ beides“ (3 Tasten), „Beim Singen“ nur als Verweis-Satz`, tk && tk.rows.join() === 'Hören' && tk.n === 3 && !tk.sing && /Beim Singen hörst du „Begleitung“ – einstellen unter 1 Aufnehmen/.test(tk.hp), tk);
  if (vk === 'p') {
    const gd = await p.evaluate(async () => { closePop(); const L = ui1Entries(), e = L.find(x => x.id === 'vox2sing'), m = L.find(x => x.id === 'xd1mon'); const j = SYNQUENZER.ui1.jump('vox2sing'); await new Promise(r => setTimeout(r, 500));
      const open = !!(UI.pop && UI.pop.name === 'stimme' && UI.pop.el.querySelector('.xd1mic')); ui1Home(); return {w: e && e.w, m: !!m, open, s: ui1Search('mithoeren').map(x => x.id)}; }).catch(e => ({err: String(e)}));
    ok('(1) Guide „Wo finde ich …?“: „Beim Singen hören“ zeigt ins Mikrofon-Blatt, neu „Mich selbst hören“ (findet „mithoeren“)', gd.w && /Mikrofon-Blatt/.test(gd.w) && gd.m && gd.open && gd.s.includes('xd1mon'), gd);
  }
  ok(`(1) ${VN[vk]}: keine Fehler in der Konsole`, !P.errs.length, P.errs.slice(0, 3));
  await P.close();
}

/* ======================= (2) Video quer: Live-Vorschau in der rechten Spalte ======================= */
if (run('video')) {
  const V = {};
  for (const [nm, f] of [['B', BASIS], ['X', FILE]]) for (const vk of ['p', 'q', 'q2']) {
    const P = await open(f, vk), {p} = P;
    await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}, {scene: 0, bars: 1}]); }); await sleep(300);
    await p.evaluate(() => SYNQUENZER.vvOpen()); await sleep(600);
    await p.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16'})); await p.evaluate(() => vvSync()); await sleep(900);
    const m = await p.evaluate(() => { const R = e => { if (typeof e === 'string') e = document.querySelector(e); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height)}; };
      const ctl = document.querySelector('#vvSheet .vvctl'), lv = document.querySelector('.vd4-lv'), ex = [...document.querySelectorAll('#vvSheet .vd3-box .rb:not(.vd4-lv)')];
      const ov = lv ? [...document.querySelectorAll('#vvSheet button')].filter(x => x !== lv && x.getClientRects().length).filter(x => { const a = x.getBoundingClientRect(), c = lv.getBoundingClientRect(); return a.left < c.right - .5 && a.right > c.left + .5 && a.top < c.bottom - .5 && a.bottom > c.top + .5; }).map(x => x.textContent.trim().slice(0, 14)) : [];
      return {stage: R('#vvSheet .vvstage'), video: R('#vvSheet .vid5-v'), row: R('#vvSheet .vd4-vr'), lv: R(lv), inCtl: !!(lv && ctl && ctl.contains(lv)), inBox: !!(lv && lv.closest('.vd3-box')), exB: ex.length ? Math.max(...ex.map(x => Math.round(x.getBoundingClientRect().bottom))) : null,
        rows: ctl ? [...ctl.children].map(c => R(c)) : [], acts: R('#vvSheet .vvacts'), ctlB: ctl ? Math.round(ctl.getBoundingClientRect().bottom) : null, ov, lvTxt: lv ? lv.querySelector('span').scrollWidth <= lv.querySelector('span').clientWidth + 1 : null, x: R('#vvSheet .vvh .sh-x') || R('#vvSheet .vvh button')}; });
    if (nm === 'X') {
      await p.screenshot({path: `${OUT}/xd1-2-video-${vk}.png`});
      const r0 = await p.evaluate(() => SYNQUENZER.vd4.on());
      const lvb = await box(p, '.vd4-lv'); if (lvb) await P.T.tap(lvb.cx, lvb.cy); await sleep(300);
      m.tap = {vor: r0, nach: await p.evaluate(() => SYNQUENZER.vd4.on())};
      if (lvb) { await P.T.tap(lvb.cx, lvb.cy); await sleep(250); }
      m.errs = P.errs.slice(0, 3);
    }
    V[nm + vk] = m; await P.close();
  }
  for (const vk of ['q', 'q2']) {
    const B = V['B' + vk], X = V['X' + vk];
    ok(`(2) ${VN[vk]}: Live-Vorschau liegt in der rechten Spalte im Extras-Kasten unter Titel · Rand · Making-of · Schnitt, keine Zeile unter der Bühne, nichts liegt darüber`,
      X.inCtl && X.inBox && !X.row && X.lv && X.lv.t >= X.exB && X.lv.h >= 44 && !X.ov.length && X.lvTxt, {lv: X.lv, exB: X.exB, row: X.row, ov: X.ov, ganzLesbar: X.lvTxt});
    ok(`(2) ${VN[vk]}: Bühne und fertiges Video bekommen die Höhe zurück (Bühne ${B.stage.h} → ${X.stage.h} px, Video ${B.video && B.video.h} → ${X.video && X.video.h} px)`, X.stage.h >= B.stage.h + 44 && X.video && B.video && X.video.h >= B.video.h + 44, {B: [B.stage, B.video], X: [X.stage, X.video]});
    const same = X.rows.slice(0, 4).every((r, i) => r && B.rows[i] && Math.abs(r.l - B.rows[i].l) <= .5 && Math.abs(r.t - B.rows[i].t) <= (vk === 'q' ? 9 : .5));
    ok(`(2) ${VN[vk]}: Format · Bild · 9:16 · Bereich bleiben, wo sie waren${vk === 'q' ? ' (quer 428 je Zeile 3 px knapper, wie quer 370)' : ''}; [Vorschau]/[Video erstellen] erreichbar (Spalte rollt; Oberkante ${X.acts && X.acts.t} < Unterkante ${X.ctlB})`,
      same && X.acts && X.acts.t < X.ctlB - 20, {B: B.rows.slice(0, 5), X: X.rows.slice(0, 5), acts: X.acts});
    ok(`(2) ${VN[vk]}: Tipp auf die Taste (Finger) schaltet die Live-Vorschau an; keine Fehler`, X.tap && X.tap.vor === false && X.tap.nach === true && !X.errs.length, {tap: X.tap, errs: X.errs});
  }
  const Bp = V.Bp, Xp = V.Xp;
  ok('(2) hochkant unverändert: Taste im Extras-Kasten wie in der Basis, Bühne gleich', Xp.inBox && Bp.inBox && JSON.stringify(Xp.lv) === JSON.stringify(Bp.lv) && JSON.stringify(Xp.stage) === JSON.stringify(Bp.stage), {B: [Bp.lv, Bp.stage], X: [Xp.lv, Xp.stage]});
}

/* ======================= (3) Matrix: Szenen-Kopf im STOPP ======================= */
if (run('matrix')) for (const vk of ['p', 'q', 'q2']) {
  const P = await open(FILE, vk), {p, T} = P;
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ui1Home(); setSongView(false); if (typeof setSceneBank === 'function') setSceneBank(0); }); await sleep(400);
  const scn = s => box(p, `() => UI.scenes[${s}]`);
  // Tipp: nichts beim Aufsetzen, Start beim Loslassen
  let sc = await scn(1);
  await T.down(sc.cx, sc.cy + 4); await sleep(80);
  const d0 = await p.evaluate(() => ({playing: R.playing, selS: R.selS}));
  await T.up(); await sleep(250);
  const d1 = await p.evaluate(() => ({playing: R.playing, selS: R.selS, slot: R.slot.slice(0, NT())}));
  ok(`(3) ${VN[vk]}: STOPP – Tipp auf ▶ Szene 2: beim Aufsetzen startet nichts, beim Loslassen startet Szene 2`, !d0.playing && d1.playing && d1.selS === 1, {d0, d1});
  await p.evaluate(() => stop()); await sleep(300);
  // Halten: nur das Blatt, nichts startet – auch nach dem Loslassen nicht
  sc = await scn(2);
  await T.down(sc.cx, sc.cy + 4); await sleep(650);
  const h0 = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing}));
  await T.up(); await sleep(400);
  const h1 = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing, n: SYNQUENZER.xd1.info().mtxN}));
  await p.screenshot({path: `${OUT}/xd1-3-szene-${vk}.png`});
  ok(`(3) ${VN[vk]}: STOPP – ▶ Szene 3 halten öffnet nur „Szene 3“ (Szene duplizieren …), nichts läuft – auch nicht nach dem Loslassen`, h0.pop === 'mtxscn' && !h0.playing && h1.pop === 'mtxscn' && !h1.playing, {h0, h1});
  await p.evaluate(() => closePop()); await sleep(200);
  // Wegziehen (> 12 px, wie jeder Tipp der App): kein Blatt, nichts startet
  sc = await scn(1);
  await T.down(sc.cx, sc.cy + 4); await sleep(40); await T.move(sc.cx, sc.cy + 24); await sleep(40); await T.move(sc.cx, sc.cy + 44); await sleep(60); await T.up(); await sleep(350);
  const g1 = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, playing: R.playing}));
  ok(`(3) ${VN[vk]}: STOPP – vom Kopf weggezogen (40 px): nichts startet, kein Blatt`, !g1.playing && g1.pop !== 'mtxscn', g1);
  await p.evaluate(() => { stop(); closePop(); }); await sleep(200);
  // Wiedergabe: wie MTX – Tipp = am Taktstrich (Start beim Loslassen, gleicher Taktstrich)
  await p.evaluate(() => launchScene(0)); await sleep(600);
  const waitBar = (lo, hi) => p.evaluate(([lo, hi]) => new Promise(res => { const t0 = performance.now(); (function f() { const d = b2t(nextBarFromAudible()) - AU.ctx.currentTime; if ((d >= lo && d <= hi) || performance.now() - t0 > 8000) res(+d.toFixed(3)); else setTimeout(f, 4); })(); }), [lo, hi]);
  const dBar = await waitBar(1.0, 99), bar0 = await p.evaluate(() => nextBarFromAudible());
  sc = await scn(1);
  await T.down(sc.cx, sc.cy + 4); await sleep(60);
  const w0 = await p.evaluate(() => R.pend.some(Boolean));
  await T.up(); await sleep(60);
  const w1 = await p.evaluate(() => R.pend.filter(Boolean).map(x => [x.slot, x.beat]));
  ok(`(3) ${VN[vk]}: Wiedergabe unverändert (MTX): Tipp startet beim Loslassen am selben Taktstrich`, !w0 && w1.some(x => x[0] === 1) && w1.every(x => Math.abs(x[1] - bar0) < 1e-6), {dBar, bar0, w1});
  await p.evaluate(() => stop()); await sleep(250);
  const C = await sheetCheck(p, () => document.getElementById('clipGrid') || EL.grid);
  ok(`(3) ${VN[vk]}: keine Fehler`, !P.errs.length, P.errs.slice(0, 3));
  await P.close();
}

/* ======================= (4) Echtzeit-Mitschnitt mit Nachher ======================= */
if (run('mitschnitt')) for (const vk of ['p', 'q', 'q2']) {
  const P = await open(FILE, vk), {p} = P;
  const toastTxt = () => p.evaluate(() => (document.querySelector('.toast,#toast') || {}).textContent || '');
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); const sr = 48000, a = new Array(sr * 2).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19) * (i % 12000 < 9000 ? 1 : 0)));
    window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 0, len: 2}); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); await new Promise(r => setTimeout(r, 300)); });
  // a) Marken · STIMME auf Vorher (Original) – ≡ › Export bleibt darüber bedienbar → Mitschnitt per Finger
  await p.evaluate(() => { ui1Home(); setSongView(false); wpOpen({t: window.__tk.track, s: 0}); }); await sleep(700);
  await tapSel(P, '#wpSheet .wpab'); await sleep(250);
  const w0 = await p.evaluate(() => ({ab: WP.ab, txt: (document.querySelector('#wpSheet .mxgov .mxgst') || {}).textContent || ''}));
  await p.evaluate(() => va1Sheet()); await sleep(450);           // Export über dem offenen Marken-Editor (≡ würde ihn schließen und so schon auf Nachher stellen)
  const rt1 = await tapSel(P, '.pop [data-va="wg-rt"]'); await sleep(350);
  const w1 = await p.evaluate(() => ({ab: WP.ab, ed: !!WP.ed, rec: SREC.on, did: SYNQUENZER.xd1.info().rtLast, txt: (document.querySelector('#wpSheet .mxgov .mxgst') || {}).textContent || ''})); w1.toast = await toastTxt();
  await p.screenshot({path: `${OUT}/xd1-4-mitschnitt-${vk}.png`});
  await p.evaluate(() => songAudioStop(true)); await sleep(400);
  ok(`(4) ${VN[vk]}: Marken · STIMME auf VORHER → Export › Echtzeit-Mitschnitt (Finger): schaltet sichtbar auf NACHHER, Meldung „Mitschnitt mit Nachher“`,
    w0.ab && /VORHER/.test(w0.txt) && rt1 && w1.rec && !w1.ab && w1.ed && w1.did.includes('wp') && /Mitschnitt mit Nachher/.test(w1.toast) && /NACHHER/.test(w1.txt), {w0, w1});
  await p.evaluate(() => { closePop(); if (WP.ed) wpClose(); }); await sleep(300);
  // b) Mix & Master auf Vorher, Start über die Test-Schnittstelle (der Export-Weg schließt das Blatt schon heute auf Nachher – hier die Hülle selbst)
  const m = await p.evaluate(async () => { mx2Sheet(); await new Promise(r => setTimeout(r, 300));
    const tr = S.tracks[0]; tr.sound.fx.vol = .42; applyTrackParams(0, false); const base = mx2Snap(); tr.sound.fx.vol = .8; applyTrackParams(0, false); MX2.ab = {base, LA: null, LB: null, side: 'B', mode: 'snap'}; mx2AB('A');
    const s0 = {side: mx2Side(), vol: S.tracks[0].sound.fx.vol}; songAudioStart(); await new Promise(r => setTimeout(r, 300));
    const s1 = {side: mx2Side(), vol: S.tracks[0].sound.fx.vol, rec: SREC.on, did: SYNQUENZER.xd1.info().rtLast, st: [...document.querySelectorAll('.pop .mxghd .mxgst')].map(x => x.textContent)}; songAudioStop(true); return {s0, s1}; });
  m.toast = await toastTxt(); await sleep(300);
  ok(`(4) ${VN[vk]}: Mix & Master auf VORHER → Mitschnitt startet mit dem Nachher-Mix (Spur 1 ${m.s0.vol} → ${m.s1.vol}), der Satz sagt NACHHER`, m.s0.side === 'A' && Math.abs(m.s0.vol - .42) < 1e-6 && m.s1.rec && m.s1.side === 'B' && Math.abs(m.s1.vol - .8) < 1e-6 && m.s1.did.includes('mx2') && m.s1.st.some(t => /NACHHER/.test(t)), m);
  // c) ohne Vergleich: wie bisher
  await p.evaluate(() => { closePop(); va1Sheet(); }); await sleep(400);
  await tapSel(P, '.pop [data-va="wg-rt"]'); await sleep(350);
  const n0 = Object.assign(await p.evaluate(() => ({rec: SREC.on, did: SYNQUENZER.xd1.info().rtLast})), {toast: await toastTxt()});
  await p.evaluate(() => songAudioStop(true)); await sleep(300);
  ok(`(4) ${VN[vk]}: ohne Vergleich startet der Mitschnitt wie bisher („Song wird aufgenommen – …“, nichts umgeschaltet)`, n0.rec && !n0.did.length && /Song wird aufgenommen/.test(n0.toast) && !/Nachher/.test(n0.toast), n0);
  ok(`(4) ${VN[vk]}: keine Fehler`, !P.errs.length, P.errs.slice(0, 3));
  await P.close();
}

/* ======================= (5) Klang-Editor: Schließen endet auf NACHHER ======================= */
if (run('klang')) for (const vk of ['p', 'q', 'q2']) {
  const P = await open(FILE, vk), {p} = P;
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); ui1Home(); setSongView(false); selectSlot(0, 0); openEditor(); await new Promise(r => setTimeout(r, 400));
    const t = 0, tr = S.tracks[t], s = deep(tr.sound); s.p.cutoff = Math.round((s.p.cutoff || 1000) * 0.5); soundEdit(t, 'Test', () => applySound(t, s)); await new Promise(r => setTimeout(r, 150)); window.__ed = JSON.stringify(tr.sound.p); });
  await tapSel(P, '#synthSheet .abb'); await sleep(300);
  const e0 = await p.evaluate(() => ({side: UI.ab && UI.ab.side, orig: JSON.stringify(S.tracks[0].sound.p) !== window.__ed}));
  // Wechsel in den Klang-Browser (Name antippen) und zurück: der Vergleich läuft weiter (ein Zustand)
  await p.evaluate(() => openBrowser(0)); await sleep(350);
  const e1 = await p.evaluate(() => ({side: UI.ab && UI.ab.side, br: EL.sndSheet.classList.contains('open')}));
  await p.evaluate(() => { selectSlot(0, 0); openEditor(); }); await sleep(350);
  const e2 = await p.evaluate(() => ({side: UI.ab && UI.ab.side}));
  await p.screenshot({path: `${OUT}/xd1-5-klang-vorher-${vk}.png`});
  // ✕ per Finger
  await tapSel(P, () => [...document.querySelectorAll('#synthSheet .sh-head button')].find(b => b.textContent.trim() === '✕' || /Schließen/.test(b.getAttribute('aria-label') || '')));
  await sleep(400);
  const e3 = await p.evaluate(() => ({open: EL.synthSheet.classList.contains('open'), side: UI.ab && UI.ab.side, nach: JSON.stringify(S.tracks[0].sound.p) === window.__ed, file: JSON.stringify(projectFileObj(S, true, true)).includes(window.__ed), n: SYNQUENZER.xd1.info().sndN, dirty: !!(autosave && autosave.dirty)}));
  ok(`(5) ${VN[vk]}: Klang-Editor Vorher (Original) → Wechsel Browser/Editor bleibt Vorher → ✕ (Finger): endet auf NACHHER (deine Änderung klingt, Projekt/Autosave = Nachher)`,
    e0.side === 'B' && e0.orig && e1.side === 'B' && e1.br && e2.side === 'B' && !e3.open && e3.side === 'A' && e3.nach && e3.file && e3.n >= 1, {e0, e1, e2, e3});
  // Mix & Master abgelegt auf Vorher bleibt (dort ist der Vergleich sichtbar)
  const m = await p.evaluate(async () => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); mx2Sheet(); await new Promise(r => setTimeout(r, 300));
    const tr = S.tracks[1]; tr.sound.fx.vol = .4; applyTrackParams(1, false); const base = mx2Snap(); tr.sound.fx.vol = .7; applyTrackParams(1, false); MX2.ab = {base, LA: null, LB: null, side: 'B', mode: 'snap'}; mx2AB('A'); pshDock();
    await new Promise(r => setTimeout(r, 300)); selectSlot(0, 0); openEditor(); await new Promise(r => setTimeout(r, 300)); closeEditor(); await new Promise(r => setTimeout(r, 300));
    return {side: mx2Side(), dock: !!PSH.dock, vol: S.tracks[1].sound.fx.vol}; });
  ok(`(5) ${VN[vk]}: abgelegtes Mix & Master auf Vorher bleibt Vorher, wenn der Klang-Editor schließt`, m.side === 'A' && m.dock && Math.abs(m.vol - .4) < 1e-6, m);
  // die anderen Wege zu: Klang-Browser ✕ (Finger), ≡-Menü über dem Editor, Wechsel auf die Drum-Spur und dann zu; Export leiht gerade
  const prep = async how => p.evaluate(async how => {
    const w = ms => new Promise(r => setTimeout(r, ms)); pshDockClose && PSH.dock && pshDockClose(); closePop(); stop();
    selectSlot(0, 0); openEditor(); await w(250); const t = 0, s = deep(S.tracks[t].sound); s.p.cutoff = Math.round((s.p.cutoff || 1000) * 0.4); soundEdit(t, 'Test', () => applySound(t, s)); await w(120);
    window.__ed = JSON.stringify(S.tracks[t].sound.p); UI.ab = null; toggleAB(t); await w(150);
    if (how === 'browser') { openBrowser(0); await w(300); }
    return {side: UI.ab && UI.ab.side};
  }, how);
  const st = () => p.evaluate(() => ({side: UI.ab && UI.ab.side, nach: JSON.stringify(S.tracks[0].sound.p) === window.__ed, ed: R.editor}));
  const r1 = await prep('browser');
  await tapSel(P, () => [...document.querySelectorAll('#sndSheet .sh-head button')].find(b => b.textContent.trim() === '✕')); await sleep(400);
  const r1b = await st();
  const r2 = await prep('menu'); await p.evaluate(() => openMenu()); await sleep(400); const r2b = await st(); await p.evaluate(() => closeMenu()); await sleep(200);
  const r3 = await prep('drum'); await p.evaluate(() => { selectTrack(DRUM_T); openEditor(); }); await sleep(350); const r3m = await st(); await p.evaluate(() => closeEditor()); await sleep(300); const r3b = await st();
  const r4 = await prep('leih'); const r4m = await p.evaluate(async () => { INT53C.n++; closeEditor(); await new Promise(r => setTimeout(r, 300)); const o = {side: UI.ab && UI.ab.side, orig: JSON.stringify(S.tracks[0].sound.p) !== window.__ed}; INT53C.n--; return o; }); await sleep(600); const r4b = await st();
  ok(`(5) ${VN[vk]}: auch Klang-Browser ✕ (Finger), ≡-Menü und „erst Drum-Spur, dann zu“ enden auf NACHHER; Wechsel auf die Drum-Spur allein lässt den Vergleich stehen`,
    r1.side === 'B' && r1b.side === 'A' && r1b.nach && r2.side === 'B' && r2b.side === 'A' && r2b.nach && r2b.ed === 'menu' && r3m.side === 'B' && r3b.side === 'A' && r3b.nach, {r1, r1b, r2b, r3m, r3b});
  ok(`(5) ${VN[vk]}: leiht ein Export gerade den Nachher-Stand, wartet das Ende, bis er zurückgegeben hat (dann NACHHER)`, r4.side === 'B' && r4m.side === 'B' && r4m.orig && r4b.side === 'A' && r4b.nach, {r4m, r4b});
  ok(`(5) ${VN[vk]}: keine Fehler`, !P.errs.length, P.errs.slice(0, 3));
  await P.close();
  if (vk === 'p') {   // Gegenprobe Basis: dort bleibt der Vergleich nach dem Schließen auf VORHER (Autosave/Projekt = Original)
    const PB = await open(BASIS, 'p');
    const g = await PB.p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); SYNQUENZER.loadDemo(); ui1Home(); setSongView(false); selectSlot(0, 0); openEditor(); await w(300);
      const t = 0, s = deep(S.tracks[t].sound); s.p.cutoff = Math.round((s.p.cutoff || 1000) * 0.5); soundEdit(t, 'Test', () => applySound(t, s)); await w(120); const ed = JSON.stringify(S.tracks[t].sound.p);
      toggleAB(t); await w(150); closeEditor(); await w(300); return {side: UI.ab && UI.ab.side, file: JSON.stringify(projectFileObj(S, true, true)).includes(ed)}; });
    ok('(5) Gegenprobe Basis: nach dem Schließen blieb VORHER (Projekt ohne deine Änderung) – das ist behoben', g.side === 'B' && !g.file, g);
    await PB.close();
  }
}

/* ======================= (6) MIXG: ▶/■ ohne Neuaufbau ======================= */
// je Blatt und Zustand: ▶ und ■ von außen; danach müssen alle Tasten dieselben Elemente sein (kein Neuaufbau) und das Blatt muss genau so
// aussehen, wie es der alte Weg (MXG_HEAR[…].repaint) gezeichnet hätte – verglichen per innerHTML (die Live-Balken des Kompressors setzt
// mx2Loop im Bild-Takt, sie werden beim Abspielen ausgeblendet)
if (run('mixg')) {
  const G = {};
  const STATES = [
    ['Remix-Blatt (Song)', "closePop(); setSongView(true); gr2RemixOpen()"],
    ['Remix-Blatt (Alles)', "closePop(); setSongView(true); SYNQUENZER.gen4.open('all')"],
    ['Remix-Blatt beim Vorhören', "closePop(); setSongView(true); gr2RemixOpen(); setTimeout(() => { const b = document.querySelector('.pop button.gr2-go'); if (b) b.click(); }, 300)", 900],
    ['Dur ↔ Moll (Song)', "closePop(); setSongView(true); tktModeOpen()"],
    ['Dur ↔ Moll (Szene)', "closePop(); setSongView(false); tktModeOpen()"],
    ['Mix & Master (frisch)', "closePop(); setSongView(true); mx2Sheet()"],
    ['Mix & Master (gemastert)', "closePop(); setSongView(true); mx2Sheet(); SYNQUENZER.mx2Way('am')", 6000],
    ['Mix & Master (Messen aus: Live)', "MX3.src = 'live'; mx2Paint()"],
  ];
  for (const [nm, f] of [['X', FILE], ['B', BASIS]]) for (const vk of (nm === 'X' ? ['p', 'q', 'q2'] : ['p'])) {
    const P = await open(f, vk), {p, T} = P, R1 = {st: []};
    await p.evaluate(async () => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300)); });
    for (const [snm, go, wt] of (nm === 'X' ? STATES : STATES.slice(0, 1))) {
      await p.evaluate(() => stop()); await sleep(300);
      await p.evaluate(go); await sleep(wt || 700); if (wt) { await p.waitForFunction(() => !MIXA.busy, null, {timeout: 90000}).catch(() => {}); await sleep(300); }
      const out = {name: snm, pop: await p.evaluate(() => (UI.pop ? UI.pop.name : null)), r: []};
      for (const g of ['play', 'stop', 'play', 'stop']) {
        await p.evaluate(() => { const P = UI.pop && UI.pop.el; window.__bs = P ? [...P.querySelectorAll('button')] : []; });
        await p.evaluate(g => { if (g === 'play') { if (S.song && S.song.bars) songPlayStart(0); else play(); } else stop(); }, g); await sleep(700);
        out.r.push(await p.evaluate(g => {
          const P = UI.pop && UI.pop.el; if (!P) return {g, pop: null};
          const norm = h => h.replace(/\s+/g, ' ').replace(/vor \d+ s/g, 'vor n s').replace(R.playing ? /<div class="mx2mr[^"]*" data-k="\d"><span>[^<]*<\/span><i><b style="[^"]*"><\/b><\/i><em>[^<]*<\/em><\/div>/g : /$^/, '<mr/>');
          const kept = window.__bs.filter(x => x.isConnected).length, all = window.__bs.length, before = norm(P.innerHTML);
          for (const id of new Set([...document.querySelectorAll('.mxgh')].map(e => e.dataset.mxgh))) { const H = MXG_HEAR[id]; if (H && H.repaint) { try { H.repaint(); } catch (e) {} } }
          const after = norm((UI.pop && UI.pop.el || P).innerHTML); let i = 0; while (i < before.length && before[i] === after[i]) i++;
          const go = P.querySelector('button.gr2-go,[data-tk="play"],.mxgpl');
          return {g, pl: !!R.playing, kept, all, eq: before === after, go: go ? go.textContent.trim() : null, diff: before === after ? null : [before.slice(Math.max(0, i - 60), i + 80), after.slice(Math.max(0, i - 60), i + 80)]};
        }, g));
      }
      R1.st.push(out);
    }
    if (nm === 'X') {   // Tipp in den Wechsel (Dur ↔ Moll): Finger auf [✕], ■ von außen, dann loslassen → das Blatt geht zu
      await p.evaluate(() => { stop(); closePop(); setSongView(true); tktModeOpen(); }); await sleep(600);
      await p.evaluate(() => { stop(); songPlayStart(0); }); await sleep(500);
      const xb = await box(p, '.pop [data-tk="x"]'); await T.down(xb.cx, xb.cy); await sleep(40); await p.evaluate(() => stop()); await sleep(450); await T.up(); await sleep(300);
      R1.tapThrough = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null}));
      await p.evaluate(() => { stop(); closePop(); setSongView(true); mx2Sheet(); }); await sleep(500);
      await p.screenshot({path: `${OUT}/xd1-6-mixg-${vk}.png`});
    }
    await p.evaluate(() => { stop(); closePop(); }); await sleep(200);
    R1.errs = P.errs.slice(0, 3);
    G[nm + vk] = R1; await P.close();
  }
  for (const vk of ['p', 'q', 'q2']) {
    const X = G['X' + vk];
    for (const o of X.st) {
      const sm = o.r.every(x => x.kept === x.all && x.all > 0), eq = o.r.every(x => x.eq), pl = o.r.map(x => x.pl).join() === 'true,false,true,false';
      ok(`(6) ${VN[vk]}: ${o.name} – ▶/■ von außen: alle ${o.r[0].all} Tasten bleiben dieselben Elemente, Blatt wie frisch gezeichnet („${o.r[0].go}“ / „${o.r[1].go}“)`, sm && eq && pl,
        o.r.filter(x => !(x.kept === x.all && x.eq)).map(x => ({g: x.g, kept: x.kept, all: x.all, diff: x.diff})));
    }
    ok(`(6) ${VN[vk]}: Finger liegt auf ✕, während ■ wechselt – der Tipp geht nicht verloren (Blatt zu)`, X.tapThrough && X.tapThrough.pop === null, X.tapThrough);
    ok(`(6) ${VN[vk]}: keine Fehler`, !X.errs.length, X.errs);
  }
  const B = G.Bp.st[0].r;
  ok('(6) Gegenprobe Basis: dort baut ▶/■ das Remix-Blatt neu (alle Tasten ersetzt) – das ist behoben', B.every(x => x.kept === 0 && x.all > 0), B.map(x => [x.kept, x.all]));
}

/* ======================= (7) MIX-A-Messung mit Quittung ======================= */
// Messen per Finger (Mix & Master ① Messen): zweimal mit Quittung, einmal ohne (Test-Schalter). Gemessen: wartet der Messlauf auf die
// Engines? Ist Schlag 1 im Messlauf voll da (Spitze der Summe in den ersten 40 ms)? Vorschläge fest und musikalisch stimmig?
if (run('messung')) {
  const M = [];
  for (const ack of [true, true, false]) {
    const P = await open(FILE, 'p'), {p} = P;
    await p.evaluate(async ack => {
      SYNQUENZER.xd1.ack(ack); window.__ack = 0; window.__pk = null;
      const o = int53WkSync; int53WkSync = oc => { window.__ack++; return o(oc); };
      const mr0 = mixaRender; mixaRender = async function (...a) { const res = await mr0.apply(this, a); try { const c = res.r.ch[0], sr = res.r.sr || 48000; let pk = 0; for (let i = 0; i < sr * 0.04 && i < c.length; i++) pk = Math.max(pk, Math.abs(c[i])); window.__pk = +pk.toFixed(3); } catch (e) {} return res; };
      SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300));
      mx2Sheet(); await new Promise(r => setTimeout(r, 300)); }, ack);
    await tapSel(P, '.mxgs1 button[data-mxg="meas"]'); await sleep(400);
    await p.waitForFunction(() => !MIXA.busy, null, {timeout: 90000}).catch(() => {}); await sleep(500);
    const q = await p.evaluate(() => { const E = SYNQUENZER.mixg.eq(), eq = {}; for (const k of Object.keys(E)) eq[E[k].role] = {mix: E[k].mix, why: E[k].why};
      const res = MIXA.res, hi = {}; if (res && res.T) res.T.forEach(t => { if (t.f && t.f.hiDb != null) hi[t.cls] = +t.f.hiDb.toFixed(1); });
      return {ack: window.__ack, pk: window.__pk, eq, hi}; });
    q.errs = P.errs.slice(0, 2); M.push(q); await P.close();
  }
  const [a, b2, c] = M, eqS = x => JSON.stringify(x.eq);
  ok('(7) Messen per Finger: der MIX-A-Messlauf wartet jetzt auf die Quittung der Engines (wie Video/Audio)', a.ack >= 1 && b2.ack >= 1 && c.ack === 0, {mitQuittung: [a.ack, b2.ack], ohne: c.ack});
  ok('(7) Schlag 1 ist im Messlauf vollständig: Spitze der ersten 40 ms mit Quittung zweimal gleich (±0,01) und deutlich höher als ohne (dort fehlen die ersten Synth-Noten)',
    a.pk != null && b2.pk != null && Math.abs(a.pk - b2.pk) <= 0.01 && c.pk != null && Math.min(a.pk, b2.pk) > c.pk + 0.05, {mit: [a.pk, b2.pk], ohne: c.pk});
  ok('(7) zwei Messungen mit vollständigem Ton: gleiche Vorschläge (fest)', eqS(a) === eqS(b2), {a: a.eq, b: b2.eq});
  const bass = a.eq.bass, pad = a.eq.pad, drums = a.eq.drums;
  ok('(7) Vorschläge musikalisch stimmig, Begründung passt: Bass −3 dB beim Kick-Grundton 50 Hz, Fläche Glocke gegen die Sequenz, keine Höhen-Absenkung der Fläche, Drums Pappkarton 300 Hz – die MIXG-Schwellen bleiben',
    bass && bass.mix.pf === 50 && bass.mix.pg === -3 && bass.why.some(w => /Kick bekommt Platz/.test(w)) && pad && pad.mix.pg < 0 && pad.mix.pf >= 700 && pad.mix.pf <= 1100 && !(pad.mix.hs < 0) && pad.why.some(w => /überdeckt Sequenz/.test(w)) && drums && drums.mix.pf === 300,
    {bass, pad, drums, hiDb: a.hi});
  ok('(7) keine Fehler', !a.errs.length && !b2.errs.length && !c.errs.length, [a.errs, b2.errs, c.errs]);
}

/* ======================= (8) ORI „Wo bin ich“ ganz lesbar ======================= */
if (run('ori')) {
  const setup = p => p.evaluate(async () => {
    SYNQUENZER.loadDemo(); ensureAudio();
    const sr = 48000, a = new Array(sr * 2).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19) * (i % 12000 < 9000 ? 1 : 0)));
    window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2}); await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2});
    SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 2, bars: 2}]); S.song.marks[2].name = 'Refrain 2'; songChanged(); await new Promise(r => setTimeout(r, 300)); return true; });
  const VIEWS = [
    ['klang', "ui1Home(); setSongView(false); selectSlot(0,0); openEditor()", '#synthSheet .sh-head'],
    ['drum', "ui1Home(); setSongView(false); selectSlot(DRUM_T,1); openEditor()", '#drumSheet .sh-head'],
    ['drum-schritte', "ui1Home(); setSongView(false); selectSlot(DRUM_T,0); ED.dTab = 'steps'; openEditor()", '#drumSheet .sh-head'],
    ['drum-song', "ui1Home(); setSongView(true); SV.pos = 9; selectTrack(DRUM_T); R.selS = 2; ED.dTab = 'steps'; openEditor()", '#drumSheet .sh-head'],
    ['sounds', "ui1Home(); setSongView(false); selectSlot(1,1); openBrowser(1)", '#sndSheet .sh-head'],
    ['takes', "ui1Home(); setSongView(false); tkSheet({t: window.__tk.track, s: 2})", '.pop .psh-h'],
    ['chor', "ui1Home(); g6Sheet({t: window.__tk.track, s: 2})", '.pop .psh-h'],
    ['mikro', "ui1Home(); setSongView(false); selectTrack(window.__tk.track); stSheet()", '.pop .psh-h'],
    ['mx2', "ui1Home(); setSongView(true); SV.pos = 4; mx2Sheet()", '.pop .psh-h'],
    ['export', "ui1Home(); setSongView(true); SV.pos = 0; va1Sheet()", '.pop .psh-h'],
    ['video', "ui1Home(); setSongView(true); vvOpen()", '#vvSheet .vvh'],
    ['bitmask', "ui1Home(); setSongView(false); ui1BmSheet(1)", '.pop .psh-h'],
  ];
  const close = "try{closePop()}catch(e){}; try{ if (PSH.dock) pshDockClose() }catch(e){}; try{ if (typeof vvClose==='function') vvClose() }catch(e){}; try{ closeSheets(); R.editor = null }catch(e){}; ui1Home()";
  const grab = (p, hd) => p.evaluate(hd => {
    try { oriFrame(true); } catch (e) {}
    const cv = document.createElement('canvas').getContext('2d'), H = document.querySelector(hd);
    const wo = [...document.querySelectorAll('[data-oriwo]')].filter(x => x.getBoundingClientRect().width > 0).map(x => {
      const b = getComputedStyle(x, '::before'); cv.font = [b.fontStyle, b.fontWeight, b.fontSize, b.fontFamily].join(' '); const ls = parseFloat(b.letterSpacing) || 0, t = x.dataset.oriwo;
      const need = cv.measureText(t).width + ls * t.length + 13, r = x.getBoundingClientRect(), hs = getComputedStyle(x), avail = b.position === 'absolute' ? r.width : r.width - parseFloat(hs.paddingLeft) - parseFloat(hs.paddingRight);
      return {t, fit: need <= avail + .5, need: Math.round(need), avail: Math.round(avail)}; });
    const h0 = H ? H.getBoundingClientRect() : {left: 0, top: 0};   // im Kopf gemessen (das Mikrofon-Blatt ist durch (1) höher und sitzt darum anders im Bild)
    const rr = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left - h0.left), Math.round(r.top - h0.top), Math.round(r.width), Math.round(r.height)]; };
    const head = H ? [H, ...H.querySelectorAll('button,.sh-title,.psh-t,b')].filter(e => e.getBoundingClientRect().width > 0).map(rr) : null;
    return {wo, head};
  }, hd);
  for (const vk of ['p', 'q', 'q2']) {
    const PX = await open(FILE, vk), PB = await open(BASIS, vk);
    await setup(PX.p); await setup(PB.p);
    const bad = [], moved = [], seen = [], badB = [];
    for (const [k, go, hd] of VIEWS) {
      for (const P of [PX, PB]) { try { await P.p.evaluate(go); } catch (e) {} await sleep(650); }
      const gx = await grab(PX.p, hd), gb = await grab(PB.p, hd);
      if (k === 'drum-schritte' || k === 'drum-song') await PX.p.screenshot({path: `${OUT}/xd1-8-${k}-${vk}.png`, clip: {x: 0, y: 0, width: VP[vk][0], height: 150}});
      for (const w of gx.wo) { seen.push(k + ':' + w.t); if (!w.fit) bad.push(k + ':' + w.t + ' ' + w.need + '/' + w.avail); }
      for (const w of gb.wo) if (!w.fit) badB.push(k + ':' + w.t + ' ' + w.need + '/' + w.avail);
      if (JSON.stringify(gx.head) !== JSON.stringify(gb.head)) moved.push(k);
      for (const P of [PX, PB]) { await P.p.evaluate(close).catch(() => {}); await sleep(250); }
    }
    ok(`(8) ${VN[vk]}: jede Wo-bin-ich-Zeile in allen Blatt-Köpfen ganz lesbar (gemessen mit der echten Schrift)`, !bad.length && seen.length >= 10, {bad, seen});
    if (vk === 'p') ok('(8) Gegenprobe Basis hochkant: dort war mindestens eine Zeile abgeschnitten (Drum-Blatt „Sze…“) – das ist behoben', badB.some(x => /^drum-schritte:/.test(x)), badB);
    ok(`(8) ${VN[vk]}: kein Kopf höher, keine Taste im Kopf verschoben (alle Kopf-Elemente wie in der Basis, gemessen im Kopf)`, !moved.length, moved);
    if (vk === 'p') ok('(8) hochkant Drum-Blatt (Schritte): statt „● Sze…“ steht „● Sz 1“; im Song „Ref. 2“ statt abgeschnitten', seen.includes('drum-schritte:Sz 1') && seen.some(s => /^drum-song:(Refrain 2|Ref\. 2)$/.test(s)), seen.filter(s => /^drum/.test(s)));
    ok(`(8) ${VN[vk]}: keine Fehler`, !PX.errs.length, PX.errs.slice(0, 3));
    await PX.close(); await PB.close();
  }
  ok('(8) Kurzform: „Szene 1“ → „Sz 1“, „Refrain 2“ → „Ref. 2“, „Intro“ → „Intr.“', await (async () => { const P = await open(FILE, 'p'); const r = await P.p.evaluate(() => ['Szene 1', 'Refrain 2', 'Intro', 'Bridge'].map(s => SYNQUENZER.xd1.short(s))); await P.close(); return r.join('|') === 'Sz 1|Ref. 2|Intr.|Brid.'; })());
}

/* ======================= Regression: ohne die neuen Wege pixelgleich zur Basis ======================= */
if (run('regression')) for (const vk of ['p', 'q', 'q2']) {
  const PX = await open(FILE, vk), PB = await open(BASIS, vk), diffs = [];
  for (const [k, go] of [['matrix', "SYNQUENZER.loadDemo(); ui1Home(); setSongView(false)"], ['song', "SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ui1Home(); setSongView(true)"],
    ['klang', "ui1Home(); setSongView(false); selectSlot(0,0); openEditor()"], ['menu', "closeSheets(); R.editor = null; openMenu()"], ['remix', "closeMenu(); ui1Home(); setSongView(true); gr2RemixOpen()"]]) {
    for (const P of [PX, PB]) { await P.p.evaluate(go).catch(() => {}); await sleep(900); }
    const [a, c] = [await PX.p.screenshot(), await PB.p.screenshot()];
    if (!a.equals(c)) { diffs.push(k); fs.writeFileSync(`${OUT}/dbg-${k}-${vk}-xd1.png`, a); fs.writeFileSync(`${OUT}/dbg-${k}-${vk}-basis.png`, c); }
  }
  ok(`(R) ${VN[vk]}: Matrix, Song, Klang-Editor, Menü, Remix-Blatt pixelgleich zur Basis`, !diffs.length, diffs);
  ok(`(R) ${VN[vk]}: keine Fehler`, !PX.errs.length, PX.errs.slice(0, 3));
  await PX.close(); await PB.close();
}

await b.close();
const nOk = res.filter(r => r.pass).length;
console.log(`\n${nOk}/${res.length} OK` + (nOk === res.length ? ' – alles grün' : ''));
fs.writeFileSync(`${OUT}/xd1-ergebnis.json`, JSON.stringify(res, null, 1));
process.exit(nOk === res.length ? 0 : 1);
