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
  const L0 = await p.evaluate(() => { const P = UI.pop && UI.pop.name === 'stimme' ? UI.pop.el : null; if (!P) return null; const m = P.querySelector('.xd1mic');
    const lb = m ? [...m.querySelectorAll('.st-lbl')].map(x => x.textContent) : [], sm = m ? [...m.querySelectorAll('[data-xd1^="vox2s:"]')].map(x => [x.firstChild.textContent, x.classList.contains('on')]) : [], mo = m ? [...m.querySelectorAll('[data-xd1^="mon:"]')].map(x => [x.textContent, x.classList.contains('on')]) : [];
    return {lb, sm, mo, step: (P.querySelector('.origs .on span') || {}).textContent || '', inC2: !!(m && m.closest('.st-c2'))}; });
  ok(`(1) ${VN[vk]}: Mikrofon-Blatt (Schritt „${L0 && L0.step}“) hat „Beim Singen hören“ [Begleitung │ + Melodie │ nur Klick] und „Mich selbst hören“ [an │ aus] – Standard Begleitung, aus`,
    L0 && L0.lb.join('|') === 'Beim Singen hören|Mich selbst hören' && L0.sm.map(x => x[0]).join('|') === 'Begleitung|+ Melodie|nur Klick' && L0.sm[0][1] && L0.mo.map(x => x[0]).join('|') === 'an|aus' && L0.mo[1][1] && L0.step === 'Aufnehmen', L0);
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
  // Wischen vom Kopf weg (> 8 px, wie die übrigen Halte-Gesten): kein Blatt; Start beim Loslassen wie ein Tipp (MTX-Verhalten)
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
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ensureAudio(); await new Promise(r => setTimeout(r, 300)); });
  // Mix & Master: mischen (Vergleich snap), Vorher, ablegen (⌄)
  const a = await p.evaluate(async () => {
    mx2Sheet(); await new Promise(r => setTimeout(r, 300));
    const tr = S.tracks[0]; tr.sound.fx.vol = .42; applyTrackParams(0, false);              // etwas gemischt: Spur 1 leiser
    MX2.ab = {base: (() => { const x = mx2Snap(); return x; })(), side: 'B', mode: 'snap', cur: null}; tr.sound.fx.vol = .8; applyTrackParams(0, false); MX2.ab.base = MX2.ab.base;
    return true; }).catch(e => String(e));
  // sauber: Vorher-Stand = 0,42, Nachher = 0,8 → Vorher tippen (Finger), ablegen
  await p.evaluate(() => { MX2.ab = null; const tr = S.tracks[0]; tr.sound.fx.vol = .42; applyTrackParams(0, false); const base = mx2Snap(); tr.sound.fx.vol = .8; applyTrackParams(0, false); MX2.ab = {base, LA: null, LB: null, side: 'B', mode: 'snap'}; mx2Paint(); }); await sleep(250);
  await tapSel(P, '.mxghd button[data-x2="A"]'); await sleep(300);
  const s0 = await p.evaluate(() => ({side: mx2Side(), vol: S.tracks[0].sound.fx.vol}));
  await p.evaluate(() => pshDock()); await sleep(300);
  await p.evaluate(() => va1Sheet()); await sleep(500);
  const rt = await tapSel(P, '.pop [data-va="wg-rt"]'); await sleep(500);
  const s1 = await p.evaluate(() => ({side: mx2Side(), vol: S.tracks[0].sound.fx.vol, rec: SREC.on, toast: (document.querySelector('.toast,#toast') || {}).textContent || '', i: SYNQUENZER.xd1.info(), bar: [...document.querySelectorAll('#pshDock .mxgh [data-x2="B"]')].map(x => x.getAttribute('aria-pressed'))}));
  await sleep(450);
  const s2 = await p.evaluate(() => ({side: mx2Side(), st: [...document.querySelectorAll('#pshDock .mxgst')].map(x => x.textContent)}));
  await p.screenshot({path: `${OUT}/xd1-4-mitschnitt-${vk}.png`});
  await p.evaluate(() => songAudioStop(true)); await sleep(400);
  ok(`(4) ${VN[vk]}: Mix & Master abgelegt auf VORHER → Echtzeit-Mitschnitt per Finger: schaltet sichtbar auf NACHHER (Leiste), Meldung „Mitschnitt mit Nachher“, aufgenommen wird der Nachher-Mix`,
    rt && s0.side === 'A' && Math.abs(s0.vol - .42) < 1e-6 && s1.rec && s1.side === 'B' && Math.abs(s1.vol - .8) < 1e-6 && /Mitschnitt mit Nachher/.test(s1.toast) && s1.i.rtLast.includes('mx2') && s1.bar.includes('true') && s2.st.some(t => /NACHHER/.test(t)), {s0, s1: {side: s1.side, vol: s1.vol, rec: s1.rec, toast: s1.toast, did: s1.i.rtLast, bar: s1.bar}, s2});
  // Klang-Editor auf Vorher (Original) → Mitschnitt → Nachher (deine Änderung)
  const k0 = await p.evaluate(async () => { pshDockClose && PSH.dock && pshDockClose(); closePop(); selectSlot(0, 0); R.selT = 0; openEditor(); await new Promise(r => setTimeout(r, 300));
    const t = 0, tr = S.tracks[t]; const s = deep(tr.sound); s.p.cutoff = (s.p.cutoff || 1000) * 0.5; soundEdit(t, 'Test', () => applySound(t, s)); await new Promise(r => setTimeout(r, 100));
    const ed = JSON.stringify(tr.sound.p); toggleAB(t); return {side: UI.ab && UI.ab.side, ed, now: JSON.stringify(S.tracks[t].sound.p) === ed}; });
  await p.evaluate(() => { closeEditor(); }); await sleep(200);   // XD1 (5) beendet hier schon auf Nachher – für (4) darum den Vergleich ohne Schließen herstellen
  const k1 = await p.evaluate(async () => { selectSlot(0, 0); openEditor(); await new Promise(r => setTimeout(r, 200)); toggleAB(0); const side = UI.ab && UI.ab.side; R.editor = 'synth';
    EL.synthSheet.classList.remove('open'); R.editor = null;                                   // Editor weggeklappt, Vergleich bleibt (wie ≡ über dem Editor)
    va1Sheet(); await new Promise(r => setTimeout(r, 400)); return {side}; });
  await tapSel(P, '.pop [data-va="wg-rt"]'); await sleep(500);
  const k2 = await p.evaluate(() => ({side: UI.ab && UI.ab.side, rec: SREC.on, did: SYNQUENZER.xd1.info().rtLast, toast: (document.querySelector('.toast,#toast') || {}).textContent || ''}));
  await p.evaluate(() => songAudioStop(true)); await sleep(300);
  ok(`(4) ${VN[vk]}: Klang-Editor auf Vorher (Original) → Mitschnitt nimmt deine Änderung (Nachher), Meldung „Mitschnitt mit Nachher“`, k1.side === 'B' && k2.rec && k2.side === 'A' && k2.did.includes('snd') && /Mitschnitt mit Nachher/.test(k2.toast), {k0, k1, k2});
  // ohne Vergleich: alles wie bisher (keine Zusatz-Meldung, nichts umgeschaltet)
  await p.evaluate(() => { closePop(); va1Sheet(); }); await sleep(400);
  await tapSel(P, '.pop [data-va="wg-rt"]'); await sleep(400);
  const n0 = await p.evaluate(() => ({rec: SREC.on, did: SYNQUENZER.xd1.info().rtLast, toast: (document.querySelector('.toast,#toast') || {}).textContent || ''}));
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
  const e3 = await p.evaluate(() => ({open: EL.synthSheet.classList.contains('open'), side: UI.ab && UI.ab.side, nach: JSON.stringify(S.tracks[0].sound.p) === window.__ed, file: JSON.stringify(projectFileObj(S, true, true).tracks[0].sound.p) === window.__ed, n: SYNQUENZER.xd1.info().sndN, dirty: !!(autosave && autosave.dirty)}));
  ok(`(5) ${VN[vk]}: Klang-Editor Vorher (Original) → Wechsel Browser/Editor bleibt Vorher → ✕ (Finger): endet auf NACHHER (deine Änderung klingt, Projekt/Autosave = Nachher)`,
    e0.side === 'B' && e0.orig && e1.side === 'B' && e1.br && e2.side === 'B' && !e3.open && e3.side === 'A' && e3.nach && e3.file && e3.n >= 1, {e0, e1, e2, e3});
  // Mix & Master abgelegt auf Vorher bleibt (dort ist der Vergleich sichtbar)
  const m = await p.evaluate(async () => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); mx2Sheet(); await new Promise(r => setTimeout(r, 300));
    const tr = S.tracks[1]; tr.sound.fx.vol = .4; applyTrackParams(1, false); const base = mx2Snap(); tr.sound.fx.vol = .7; applyTrackParams(1, false); MX2.ab = {base, LA: null, LB: null, side: 'B', mode: 'snap'}; mx2AB('A'); pshDock();
    await new Promise(r => setTimeout(r, 300)); selectSlot(0, 0); openEditor(); await new Promise(r => setTimeout(r, 300)); closeEditor(); await new Promise(r => setTimeout(r, 300));
    return {side: mx2Side(), dock: !!PSH.dock, vol: S.tracks[1].sound.fx.vol}; });
  ok(`(5) ${VN[vk]}: abgelegtes Mix & Master auf Vorher bleibt Vorher, wenn der Klang-Editor schließt`, m.side === 'A' && m.dock && Math.abs(m.vol - .4) < 1e-6, m);
  ok(`(5) ${VN[vk]}: keine Fehler`, !P.errs.length, P.errs.slice(0, 3));
  await P.close();
}

/* ======================= (6) MIXG: ▶/■ ohne Neuaufbau ======================= */
if (run('mixg')) {
  const G = {};
  for (const [nm, f] of [['X', FILE], ['B', BASIS]]) for (const vk of (nm === 'X' ? ['p', 'q', 'q2'] : ['p'])) {
    const P = await open(f, vk), {p, T} = P;
    await p.evaluate(async () => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300)); });
    const one = async (open, sel, label) => {
      await p.evaluate(open); await sleep(600);
      const tag = await p.evaluate(sel => { const P = UI.pop && UI.pop.el, bs = P ? [...P.querySelectorAll(sel)] : []; bs.forEach((x, i) => { x.__xd1 = 'k' + i; }); window.__xd1b = bs; return bs.length; }, sel);
      const out = {};
      for (const go of ['play', 'stop']) {
        await p.evaluate(go => { if (go === 'play') { if (S.song && S.song.bars) songPlayStart(0); else play(); } else stop(); }, go); await sleep(650);
        out[go] = await p.evaluate(() => { const P = UI.pop && UI.pop.el; const same = (window.__xd1b || []).every(x => x.isConnected && P.contains(x));
          const norm = h => h.replace(/\s+/g, ' ');
          const before = norm(P.innerHTML); let after = null; try { if (P._paint) P._paint(); else if (UI.pop.name === 'mx2') mx2Paint(); after = norm(P.innerHTML); } catch (e) { after = 'ERR ' + e; }
          (window.__xd1b || []).forEach((x, i) => { x.__xd1 = null; }); const bs = [...P.querySelectorAll('button')]; window.__xd1b = bs.filter(x => x.matches('.gr2-go,[data-tk],.mx2pl,[data-x2],[data-g2],[data-g3m],[data-g4]'));
          const go = P.querySelector('button.gr2-go,[data-tk="play"],.mxgpl'); return {same, eq: before === after, go: go ? go.textContent.trim() : null, playing: !!R.playing, pl: SYNQUENZER.xd1 ? SYNQUENZER.xd1.info().plLast : null, diff: before === after ? null : (() => { let i = 0; while (i < before.length && before[i] === after[i]) i++; return [before.slice(Math.max(0, i - 60), i + 80), after.slice(Math.max(0, i - 60), i + 80)]; })()}; });
      }
      // Tipp genau in den Wechsel: Finger auf „Vorher“, ■ von außen, nach dem 200-ms-Takt loslassen → der Tipp gilt
      return out;
    };
    const R1 = {};
    R1.remix = await one(() => { setSongView(true); gr2RemixOpen(); }, 'button');
    await p.evaluate(() => { stop(); closePop(); }); await sleep(300);
    R1.tkt = await one(() => tktModeOpen(), 'button');
    if (nm === 'X') {   // Tipp in den Wechsel (Dur ↔ Moll): Finger auf [✕], ■ von außen, dann loslassen → das Blatt geht zu
      await p.evaluate(() => { stop(); songPlayStart(0); }); await sleep(500);
      const xb = await box(p, '.pop [data-tk="x"]'); await T.down(xb.cx, xb.cy); await sleep(40); await p.evaluate(() => stop()); await sleep(450); await T.up(); await sleep(300);
      R1.tapThrough = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null}));
    }
    await p.evaluate(() => { stop(); closePop(); }); await sleep(300);
    R1.mx2 = await one(() => { setSongView(true); mx2Sheet(); }, 'button');
    await p.evaluate(() => { stop(); closePop(); }); await sleep(200);
    R1.errs = P.errs.slice(0, 3);
    if (nm === 'X') await p.screenshot({path: `${OUT}/xd1-6-mixg-${vk}.png`});
    G[nm + vk] = R1; await P.close();
  }
  for (const vk of ['p', 'q', 'q2']) {
    const X = G['X' + vk];
    for (const k of ['remix', 'tkt', 'mx2']) {
      const r = X[k];
      ok(`(6) ${VN[vk]}: ${k === 'remix' ? 'Remix-Blatt' : k === 'tkt' ? 'Dur ↔ Moll' : 'Mix & Master'} – ▶ und ■: dieselben Tasten bleiben im Bild (kein Neuaufbau), Beschriftung „${r.play.go}“ / „${r.stop.go}“, Blatt sieht aus wie neu gezeichnet`,
        r.play.same && r.stop.same && r.play.eq && r.stop.eq && r.play.playing && !r.stop.playing, {play: {same: r.play.same, eq: r.play.eq, go: r.play.go, pl: r.play.pl, diff: r.play.diff}, stop: {same: r.stop.same, eq: r.stop.eq, go: r.stop.go, diff: r.stop.diff}});
    }
    ok(`(6) ${VN[vk]}: Finger liegt auf ✕, während ■ wechselt – der Tipp geht nicht verloren (Blatt zu)`, X.tapThrough && X.tapThrough.pop === null, X.tapThrough);
    ok(`(6) ${VN[vk]}: keine Fehler`, !X.errs.length, X.errs);
  }
  const B = G.Bp;
  ok('(6) Gegenprobe Basis: dort baut ▶/■ das Blatt neu (Tasten ersetzt) – das ist behoben', !B.remix.play.same || !B.tkt.play.same, {remix: B.remix.play.same, tkt: B.tkt.play.same});
}

/* ======================= (7) MIX-A-Messung mit Quittung ======================= */
if (run('messung')) {
  const M = [];
  for (const ack of [true, true, false]) {
    const P = await open(FILE, 'p'), {p} = P;
    const r = await p.evaluate(async ack => {
      SYNQUENZER.xd1.ack(ack); window.__ack = 0; const o = int53WkSync; int53WkSync = oc => { window.__ack++; return o(oc); };
      SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300));
      mx2Sheet(); await new Promise(r => setTimeout(r, 300));
      return true; }, ack);
    await tapSel(P, '.mxgs1 button[data-mxg="meas"]'); await sleep(400);
    await p.waitForFunction(() => !MIXA.busy, null, {timeout: 90000}).catch(() => {}); await sleep(500);
    const q = await p.evaluate(() => { const res = MIXA.res, o = {}; if (res && res.T) res.T.forEach((t, k) => { o[t.name] = {cls: t.cls, lowBands: t.f && t.f.lowBands ? t.f.lowBands.map(v => +v.toFixed(1)) : null, hiDb: t.f && t.f.hiDb != null ? +t.f.hiDb.toFixed(1) : null, sug: (res.sug[k] || []).filter(s => s.art === 'eq').map(s => s.id + ':' + JSON.stringify(s.patch.mix))}; });
      const E = SYNQUENZER.mixg.eq(), eq = {}; for (const k of Object.keys(E)) eq[E[k].role] = {mix: E[k].mix, why: E[k].why}; return {ack: window.__ack, o, eq, t1: SYNQUENZER.mixg.info().t1}; });
    M.push(q); await P.close();
  }
  const [a, b2, c] = M, eqS = x => JSON.stringify(x.eq);
  ok('(7) Messen per Finger: der MIX-A-Messlauf wartet jetzt auf die Quittung der Engines (wie Video/Audio)', a.ack >= 1 && b2.ack >= 1 && c.ack === 0, {mitQuittung: [a.ack, b2.ack], ohne: c.ack});
  ok('(7) zwei Messungen mit vollständigem Ton: gleiche Vorschläge (fest)', eqS(a) === eqS(b2), {a: a.eq, b: b2.eq});
  const bass = a.eq.bass, pad = a.eq.pad, drums = a.eq.drums;
  ok('(7) Vorschläge musikalisch stimmig, Begründung passt: Bass −3 dB beim Kick-Grundton 50 Hz, Fläche Glocke gegen die Sequenz, keine Höhen-Absenkung der Fläche (Höhenanteil −30 dB), Drums Pappkarton 300 Hz',
    bass && bass.mix.pf === 50 && bass.mix.pg === -3 && bass.why.some(w => /Kick bekommt Platz/.test(w)) && pad && pad.mix.pg < 0 && pad.mix.pf >= 700 && pad.mix.pf <= 1100 && !(pad.mix.hs < 0) && pad.why.some(w => /überdeckt Sequenz/.test(w)) && drums && drums.mix.pf === 300,
    {bass, pad, drums, padHi: a.o['Synth 3'] && a.o['Synth 3'].hiDb});
  ok('(7) mit Quittung = ohne Quittung auf ruhiger Maschine (die Schwellen müssen nicht wandern; ohne Quittung schwankt es nur unter Last)', eqS(a) === eqS(c), {ohne: c.eq});
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
  ];
  const close = "try{closePop()}catch(e){}; try{ if (PSH.dock) pshDockClose() }catch(e){}; try{ if (typeof vvClose==='function') vvClose() }catch(e){}; try{ closeSheets(); R.editor = null }catch(e){}; ui1Home()";
  const grab = (p, hd) => p.evaluate(hd => {
    try { oriFrame(true); } catch (e) {}
    const cv = document.createElement('canvas').getContext('2d'), H = document.querySelector(hd);
    const wo = [...document.querySelectorAll('[data-oriwo]')].filter(x => x.getBoundingClientRect().width > 0).map(x => {
      const b = getComputedStyle(x, '::before'); cv.font = [b.fontStyle, b.fontWeight, b.fontSize, b.fontFamily].join(' '); const ls = parseFloat(b.letterSpacing) || 0, t = x.dataset.oriwo;
      const need = cv.measureText(t).width + ls * t.length + 13, r = x.getBoundingClientRect(), hs = getComputedStyle(x), avail = b.position === 'absolute' ? r.width : r.width - parseFloat(hs.paddingLeft) - parseFloat(hs.paddingRight);
      return {t, fit: need <= avail + .5, need: Math.round(need), avail: Math.round(avail)}; });
    const rr = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const head = H ? [H, ...H.querySelectorAll('button,.sh-title,.psh-t,b')].filter(e => e.getBoundingClientRect().width > 0).map(rr) : null;
    return {wo, head};
  }, hd);
  for (const vk of ['p', 'q', 'q2']) {
    const PX = await open(FILE, vk), PB = await open(BASIS, vk);
    await setup(PX.p); await setup(PB.p);
    const bad = [], moved = [], seen = [];
    for (const [k, go, hd] of VIEWS) {
      for (const P of [PX, PB]) { try { await P.p.evaluate(go); } catch (e) {} await sleep(650); }
      const gx = await grab(PX.p, hd), gb = await grab(PB.p, hd);
      if (k === 'drum-schritte' || k === 'drum-song') await PX.p.screenshot({path: `${OUT}/xd1-8-${k}-${vk}.png`, clip: {x: 0, y: 0, width: VP[vk][0], height: 150}});
      for (const w of gx.wo) { seen.push(k + ':' + w.t); if (!w.fit) bad.push(k + ':' + w.t + ' ' + w.need + '/' + w.avail); }
      if (JSON.stringify(gx.head) !== JSON.stringify(gb.head)) moved.push(k);
      for (const P of [PX, PB]) { await P.p.evaluate(close).catch(() => {}); await sleep(250); }
    }
    ok(`(8) ${VN[vk]}: jede Wo-bin-ich-Zeile in allen Blatt-Köpfen ganz lesbar (gemessen mit der echten Schrift)`, !bad.length && seen.length >= 9, {bad, seen});
    ok(`(8) ${VN[vk]}: kein Kopf höher, keine Taste verschoben (alle Kopf-Elemente wie in der Basis)`, !moved.length, moved);
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
