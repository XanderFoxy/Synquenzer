// ND2 (Nachtrag 6 §ND2) Abnahme-Test: Editor der Drum-Engine (Chromium, echte Touch-Eingabe über CDP).
//   NODE_PATH=/opt/node-tools/node_modules node md2-ui.mjs <app index.html> [<old build vs-base-B.html>] [--fmt=P|L|PL]
// Prüft ND2-01, 03, 04 (nur was der ND-STUB spielt: TONE A1), 05–13 (ND2-02 = md2-shots.mjs).
// Ausgabe: eine JSON-Zusammenfassung {ok, pass, fail, checks:[{id, fmt, name, ok, info}]}; Exit-Code 1 bei Fehlern.
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs'; import os from 'os'; import path from 'path';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const APP = path.resolve(args[0] || ''), OLD = args[1] ? path.resolve(args[1]) : null;
if (!args[0] || !fs.existsSync(APP)) { console.error('usage: node md2-ui.mjs <index.html> [<old.html>] [--fmt=PL] [--only=03,05]'); process.exit(2); }
const FORMATS = {P: [390, 844], L: [844, 390]};
const FMTS = (opt.fmt || 'PL').split('').filter(f => FORMATS[f]);
const ONLY = opt.only ? new Set(opt.only.split(',').map(s => 'ND2-' + s.padStart(2, '0'))) : null;
const want = id => !ONLY || ONLY.has(id);

const checks = [];
const ck = (id, fmt, name, ok, info) => { checks.push({id, fmt, name, ok: !!ok, ...(info !== undefined ? {info} : {})}); if (opt.v) console.error((ok ? 'PASS ' : 'FAIL ') + id + ' ' + fmt + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info).slice(0, 300) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }

const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});

// ---------- Seite / Eingabe ----------
async function newCtx(fmt) {
  const [w, h] = FORMATS[fmt];
  return browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
}
async function openApp(ctx, file) {
  const page = await ctx.newPage(); page._errs = [];
  page.on('pageerror', e => page._errs.push(String(e)));
  await page.goto('file://' + file);
  await page.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000});
  await page.waitForTimeout(500);
  page._cdp = await ctx.newCDPSession(page);
  return page;
}
// Modell-Pads setzen, Editor öffnen; Nachrichten an den Worklet-Knoten werden mitgeschrieben (window.__md)
async function setup(page, {md = ['kick', 'snare', 'hatC', 'hatO'], voice = 0, tab = 'sound', sub = 'tone'} = {}) {
  await page.evaluate(async ({md, voice, tab, sub}) => {
    ensureAudio();
    for (const id of md) SYNQUENZER.setPadSource(id, 'md');
    R.selT = DRUM_T; ED.dVoice = voice; ED.dTab = tab; MDE.sub = sub; openEditor(); buildDrumEd();
    const t0 = performance.now(); while (MDX.st !== 'ready' && MDX.st !== 'failed' && performance.now() - t0 < 4000) await new Promise(r => setTimeout(r, 50));
    window.__md = [];
    if (MDX.node && !MDX.node.port.__w) { const pp = MDX.node.port, o = pp.postMessage.bind(pp); pp.postMessage = m => { window.__md.push({t: performance.now(), m: JSON.parse(JSON.stringify(m))}); return o(m); }; pp.__w = 1; }
    UNDO.length = 0; REDO.length = 0;
  }, {md, voice, tab, sub});
  await page.waitForTimeout(350);
}
const rebuild = (page, o) => page.evaluate(o => { if (o.voice != null) ED.dVoice = o.voice; if (o.tab) ED.dTab = o.tab; if (o.sub) MDE.sub = o.sub; if (o.kitSub) MDE.kitSub = o.kitSub; buildDrumEd(); }, o);
async function box(page, sel) {
  const r = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return {x: q.left, y: q.top, w: q.width, h: q.height, cx: q.left + q.width / 2, cy: q.top + q.height / 2}; }, sel);
  if (!r) throw new Error('nicht gefunden: ' + sel);
  return r;
}
const tp = (x, y) => [{x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, id: 1, radiusX: 2, radiusY: 2, force: 1}];
async function tStart(page, x, y) { await page._cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(x, y)}); }
async function tMove(page, x, y) { await page._cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(x, y)}); }
async function tEnd(page) { await page._cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
// Ziehen: path = Liste relativer Punkte [dx, dy]; probe(i) nach jedem Schritt (optional, für Abtastung)
async function drag(page, x, y, pts, probe, gap = 6) {
  await tStart(page, x, y); await sleep(gap);
  for (let i = 0; i < pts.length; i++) { await tMove(page, x + pts[i][0], y + pts[i][1]); if (probe) { if ((await probe(i)) === false) break; } else await sleep(gap); }
  await sleep(gap); await tEnd(page); await sleep(40);
}
const vline = (dy, step = 4, dx = 0) => { const a = [], n = Math.ceil(Math.abs(dy) / step); for (let i = 1; i <= n; i++) a.push([dx, Math.sign(dy) * Math.min(Math.abs(dy), i * step)]); return a; };
const hline = (dx, step = 4) => { const a = [], n = Math.ceil(Math.abs(dx) / step); for (let i = 1; i <= n; i++) a.push([Math.sign(dx) * Math.min(Math.abs(dx), i * step), 0]); return a; };
async function tap(page, sel) { const b = await box(page, sel); await page.touchscreen.tap(b.cx, b.cy); await sleep(60); return b; }
async function dblTap(page, sel) { const b = await box(page, sel); await page.touchscreen.tap(b.cx, b.cy); await sleep(90); await page.touchscreen.tap(b.cx, b.cy); await sleep(80); }
const cellSel = key => `.knob.mdc[data-key="md.${key}"]`;
const undoN = page => page.evaluate(() => UNDO.length);
// gespeicherter Wert einer Zelle
const STORED = `(key => { const s = mdSlot(DRUM_VOICES[ED.dVoice].id); if (key === 'mode') return [s.mDm, s.mDd]; if (key === 'nmode') return [s.mNdm, s.mNdd]; if (key === 'scl') return MDE.scl; return s[key]; })`;
const stored = (page, key) => page.evaluate(`${STORED}(${JSON.stringify(key)})`);
const kn = (page, key) => page.evaluate(sel => { const e = document.querySelector(sel); return e ? e.querySelector('.kn').textContent : null; }, cellSel(key));
const popOpen = page => page.evaluate(() => !!(UI.pop && UI.pop.el && UI.pop.el.isConnected) ? UI.pop.name : null);

// ======================= ND2-01: Pad mit Quelle „Drum“ – DOM-Struktur wie der alte Stand =======================
async function domStruct(file, fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, file);
  const out = await page.evaluate(async () => {
    ensureAudio(); R.selT = DRUM_T; ED.dVoice = 0; ED.dTab = 'sound'; openEditor();
    const ser = (n, d, acc) => { if (n.nodeType !== 1) return; if (n.classList && n.classList.contains('dsrc')) { acc.push('#DSRC'); return; }
      acc.push(' '.repeat(d) + n.tagName.toLowerCase() + (n.classList.length ? '.' + [...n.classList].sort().join('.') : '')); for (const c of n.children) ser(c, d + 1, acc); };
    const r = {};
    for (const tab of ['sound', 'tief', 'kit']) {
      ED.dTab = tab; buildDrumEd(); await new Promise(r => setTimeout(r, 120));
      const acc = []; ser(EL.drumSheet, 0, acc);
      r[tab] = {lines: acc, subs: [...EL.drumSheet.querySelectorAll('.sh-subs .stab')].map(b => b.dataset.sub)};
    }
    return r;
  });
  out.errs = page._errs; await ctx.close(); return out;
}
async function nd201(fmt) {
  const neu = await domStruct(APP, fmt);
  ck('ND2-01', fmt, 'KIT ohne Modell-Pad hat keine Unter-Reiter', neu.kit.subs.length === 0, neu.kit.subs);
  for (const tab of ['sound', 'tief', 'kit']) {
    const n = neu[tab].lines, dsrc = n.filter(l => l === '#DSRC').length;
    ck('ND2-01', fmt, tab.toUpperCase() + ': Quelle-Knopf .dsrc ' + (tab === 'kit' ? 'fehlt' : tab === 'sound' ? 'vorhanden (genau 1)' : 'höchstens 1'), tab === 'kit' ? dsrc === 0 : tab === 'sound' ? dsrc === 1 : dsrc <= 1, {dsrc});
  }
  if (!OLD) { ck('ND2-01', fmt, 'DOM-Vergleich mit altem Stand', false, 'kein <old.html> angegeben'); return; }
  const alt = await domStruct(OLD, fmt);
  for (const tab of ['sound', 'tief', 'kit']) {
    const a = alt[tab].lines, n = neu[tab].lines.filter(l => l !== '#DSRC');
    let i = 0; while (i < a.length && i < n.length && a[i] === n[i]) i++;
    const same = a.length === n.length && i === a.length;
    ck('ND2-01', fmt, tab.toUpperCase() + ': DOM-Struktur = alter Stand (außer .dsrc)', same, same ? {nodes: a.length} : {at: i, alt: a.slice(Math.max(0, i - 2), i + 3), neu: n.slice(Math.max(0, i - 2), i + 3), lenAlt: a.length, lenNeu: n.length});
    ck('ND2-01', fmt, tab.toUpperCase() + ': Unter-Reiter wie alter Stand', deq(alt[tab].subs, neu[tab].subs), {alt: alt[tab].subs, neu: neu[tab].subs});
  }
  ck('ND2-01', fmt, 'keine Seitenfehler', !neu.errs.length, neu.errs);
}

// ======================= ND2-03: alle Zellen =======================
// Anzeige in Geräte-Schreibweise: [Slot-Felder setzen, erwartete Anzeige (String oder RegExp)]
const MINUS = '[-−]';
const DISP = {
  mSpc: [[{mWav: 'F1', mSpc: 0}, '0'], [{mWav: 'F1', mSpc: 50}, '50'], [{mWav: 'F1', mSpc: 99}, '99'], [{mWav: 'A1', mSpc: 50}, '–']],
  mFrq: [[{mWav: 'F1', mFrq: 0}, '0'], [{mWav: 'F1', mFrq: 25}, '25'], [{mWav: 'F1', mFrq: 50}, '50'], [{mWav: 'A1'}, '–']],
  mDyf: [[{mWav: 'F1', mDyf: 0}, '0'], [{mWav: 'F1', mDyf: 5}, '5'], [{mWav: 'F1', mDyf: 9}, '9'], [{mWav: 'A1'}, '–']],
  mTdec: [[{mTdec: 0}, '0'], [{mTdec: 25}, '25'], [{mTdec: 50}, '50']],
  mBnd: [[{mBnd: -50}, new RegExp('^' + MINUS + '50$')], [{mBnd: 0}, '0'], [{mBnd: 50}, /^\+?50$/], [{mBnd: -26}, new RegExp('^' + MINUS + '26$')]],
  mPit: [[{mPit: 0}, '0.0'], [{mPit: 45}, '45.0'], [{mPit: 63.7}, '63.7'], [{mPit: 127.5}, '127.5']],
  mWav: [[{mWav: 'A1'}, 'A1'], [{mWav: 'd3'}, 'd3'], [{mWav: 'r2'}, 'r2'], [{mWav: 't1'}, 't1']],
  mode: [[{mDm: 'E1'}, 'E1'], [{mDm: 'E2'}, 'E2'], [{mDm: 'E3'}, 'E3'], [{mDm: 'L'}, 'L'], [{mDm: 'P'}, 'P'], [{mDm: 'D', mDd: 0}, '0'], [{mDm: 'D', mDd: 25}, '25'], [{mDm: 'D', mDd: 50}, '50']],
  mBt: [[{mBt: 0}, '0'], [{mBt: 25}, '25'], [{mBt: 50}, '50']],
  scl: [['', '–'], ['h1', 'h1'], ['H1', 'H1'], ['bL', 'bL']],
  mNres: [[{mNres: 0}, '0'], [{mNres: 10}, '10'], [{mNres: 20}, '20']],
  mNfrq: [[{mNfrq: 0}, '0'], [{mNfrq: 25}, '25'], [{mNfrq: 50}, '50']],
  mNdec: [[{mNdec: 0}, '0'], [{mNdec: 25}, '25'], [{mNdec: 50}, '50']],
  mNtyp: [[{mNtyp: 'L1'}, 'L1'], [{mNtyp: 'b2'}, 'b2'], [{mNtyp: 'H3'}, 'H3']],
  mNdyf: [[{mNdyf: -9}, new RegExp('^' + MINUS + '9$')], [{mNdyf: 0}, '0'], [{mNdyf: 9}, /^\+?9$/]],
  nmode: [[{mNdm: 'E1'}, 'E'], [{mNdm: 'E2'}, 'E2'], [{mNdm: 'E3'}, 'E3'], [{mNdm: 'L'}, 'L'], [{mNdm: 'G'}, 'G'], [{mNdm: 'D', mNdd: 0}, '0'], [{mNdm: 'D', mNdd: 50}, '50']],
  mClv: [[{mClv: 0}, '0'], [{mClv: 25}, '25'], [{mClv: 50}, '50']],
  mCty: [[{mCty: 'n1'}, 'n1'], [{mCty: 'P2'}, 'P2'], [{mCty: 'C3'}, 'C3']],
  mNlv: [[{mNlv: 0}, '0'], [{mNlv: 25}, '25'], [{mNlv: 50}, '50']],
  mChlv: [[{mChlv: 0}, '0'], [{mChlv: 25}, '25'], [{mChlv: 50}, '50']],
  mTlv: [[{mTlv: 0}, '0'], [{mTlv: 25}, '25'], [{mTlv: 50}, '50']],
  mPan: [[{mPan: -9}, 'L9'], [{mPan: -1}, 'L1'], [{mPan: 0}, 'C'], [{mPan: 1}, 'r1'], [{mPan: 9}, 'r9']],
  mEqf: [[{mEqg: 3, mEqf: 0}, '0'], [{mEqg: 3, mEqf: 25}, '25'], [{mEqg: 3, mEqf: 50}, '50'], [{mEqg: 0, mEqf: 25}, '–']],
  mEqg: [[{mEqg: -9}, new RegExp('^' + MINUS + '9$')], [{mEqg: 0}, '0'], [{mEqg: 9}, /^\+?9$/]],
  mDst: [[{mDst: 0}, '0'], [{mDst: 25}, '25'], [{mDst: 50}, '50']],
  mDty: [[{mDty: 'dr'}, 'dr'], [{mDty: 'SA'}, 'SA'], [{mDty: 'rn'}, 'rn']],
  mRvb: [[{mRvb: 0}, '0'], [{mRvb: 25}, '25'], [{mRvb: 50}, '50']],
  mDly: [[{mDly: 0}, '0'], [{mDly: 25}, '25'], [{mDly: 50}, '50']],
};
const BIP = {mBnd: [-10, 100], mNdyf: [-3, 18], mEqg: [-3, 18], mPan: [-3, 18]};   // Startwert, Spannweite
async function resetSlot(page) { await page.evaluate(() => { const s = mdSlot(DRUM_VOICES[ED.dVoice].id); Object.assign(s, mdProg(MDN.init())); MDE.all = false; MDE.scl = ''; drumChanged(DRUM_VOICES[ED.dVoice].id); edRefresh(); }); }

async function nd203(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page);
  const pages = await page.evaluate(() => MD_PAGES);
  const seen = [];
  for (const sub of ['tone', 'noise', 'click', 'mix', 'fx']) {
    await tap(page, `.sh-subs .stab[data-sub="${sub}"]`); await sleep(150);
    const keys = pages[sub].flat();
    const present = await page.evaluate(keys => keys.map(k => !!document.querySelector(`.knob.mdc[data-key="md.${k}"]`)), keys);
    ck('ND2-03', fmt, sub.toUpperCase() + ': ' + keys.length + ' Zellen vorhanden', present.every(Boolean), keys.filter((k, i) => !present[i]));
    for (const key of keys) {
      seen.push(key);
      await resetSlot(page);
      const init = await page.evaluate(`${STORED}(${JSON.stringify(key)})`);
      // --- Ziehen (senkrecht, nach oben) = Wert, ein Undo
      await page.evaluate(() => { UNDO.length = 0; });
      const b = await box(page, cellSel(key));
      await drag(page, b.cx, b.cy, vline(-70, 5));
      const v1 = await stored(page, key), u1 = await undoN(page);
      await sleep(380);
      const pop1 = await popOpen(page);
      ck('ND2-03', fmt, `${key}: Ziehen ändert den Wert (ein Undo, kein Popover)`, !deq(v1, init) && u1 === 1 && !pop1, {init, v1, undo: u1, pop: pop1});
      // --- Doppeltipp = INIT
      await dblTap(page, cellSel(key)); await sleep(380);
      const v2 = await stored(page, key), u2 = await undoN(page), pop2 = await popOpen(page);
      const initOk = key === 'mode' || key === 'nmode' ? v2[0] === init[0] : deq(v2, init);
      // SCL PRE ist nicht gespeichert: zurück auf „–“ ändert keinen gespeicherten Wert → kein weiterer Undo-Schritt
      ck('ND2-03', fmt, `${key}: Doppeltipp = INIT`, initOk && u2 === (key === 'scl' ? 1 : 2) && !pop2, {v2, init, undo: u2, pop: pop2});
      if (pop2) await page.evaluate(() => closePop());
      // --- Anzeige in Geräte-Schreibweise (Grenzen + Mitte)
      const bad = [];
      for (const [set, exp] of DISP[key] || []) {
        const t = await page.evaluate(([key, set]) => { const id = DRUM_VOICES[ED.dVoice].id, s = mdSlot(id); if (key === 'scl') MDE.scl = set; else Object.assign(s, set); edRefresh(); return document.querySelector(`.knob.mdc[data-key="md.${key}"] .kn`).textContent; }, [key, set]);
        if (!(exp instanceof RegExp ? exp.test(t) : t === exp)) bad.push({set, exp: String(exp), got: t});
      }
      ck('ND2-03', fmt, `${key}: Anzeige Geräte-Schreibweise (${(DISP[key] || []).length} Werte)`, !bad.length && (DISP[key] || []).length > 0, bad.length ? bad : undefined);
      await resetSlot(page);
      // --- Mittelraste der zweipoligen Zellen
      if (BIP[key]) {
        const [start, span] = BIP[key];
        await page.evaluate(([key, v]) => { mdSlot(DRUM_VOICES[ED.dVoice].id)[key] = v; edRefresh(); }, [key, start]);
        const c = await box(page, cellSel(key)); const vals = [];
        const path = vline(-140, 1);
        await drag(page, c.cx, c.cy, path, async () => { const v = await stored(page, key); vals.push(v); return v <= Math.ceil(span / 4); });
        const at0 = vals.filter(v => v === 0).length, plain = 200 / span;
        ck('ND2-03', fmt, `${key}: Mittelraste (px auf 0: ${at0}, ohne Raste ≈ ${plain.toFixed(1)})`, at0 >= plain + 7 && vals.some(v => v > 0), {at0, plain: +plain.toFixed(1), seq: vals.join(',').slice(0, 200)});
        await resetSlot(page);
      }
      // --- PITCH: ganze Stufen, Fein-Modus 0,1
      if (key === 'mPit') {
        const c = await box(page, cellSel(key)); const vals = [];
        await drag(page, c.cx, c.cy, vline(-40, 2), async () => { vals.push(await stored(page, 'mPit')); });
        ck('ND2-03', fmt, 'PITCH normal: ganze Halbtöne', vals.every(v => Number.isInteger(v)) && vals.at(-1) > 45, {seq: vals.join(',')});
        await resetSlot(page);
        const fv = [], fcls = [], W = await page.evaluate(() => innerWidth);
        const side = c.cx > W / 2 ? -150 : 150;                     // seitlich ≥ 140 px = feinste Stufe, dann senkrecht in 1-px-Schritten
        const pts = hline(side, 6).concat(vline(-60, 1, side));
        await drag(page, c.cx, c.cy, pts, async i => { if (i >= 25) { fv.push(await stored(page, 'mPit')); fcls.push(await page.evaluate(s => document.querySelector(s).classList.contains('fineon'), cellSel('mPit'))); } });
        const after = await stored(page, 'mPit');
        const tenth = fv.every(v => Math.abs(v * 10 - Math.round(v * 10)) < 1e-9), frac = fv.some(v => !Number.isInteger(v));
        const steps = fv.slice(1).map((v, i) => +(v - fv[i]).toFixed(3)).filter(Boolean);
        ck('ND2-03', fmt, 'PITCH Fein-Modus (seitlich weg, dann senkrecht): Schritte 0,1', fcls.at(-1) && tenth && frac && steps.length >= 3 && steps.every(d => d === .1) && after > 45 && after < 52, {after, steps: steps.slice(0, 20), fineon: fcls.at(-1)});
        await resetSlot(page);
      }
      if (key === 'scl') await page.evaluate(() => { MDE.all = false; MDE.scl = ''; mdFocus(); });
    }
  }
  ck('ND2-03', fmt, 'alle 28 Kanal-Zellen geprüft (TONE 10, NOISE 6, CLICK 2, MIX 4, FX 6)', seen.length === 28, seen.length);
  // --- KANAL (TIEF): DYNAMICS + MONO
  await rebuild(page, {tab: 'tief'}); await sleep(150);
  await page.evaluate(() => { UNDO.length = 0; });
  const crvBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('.mdcrv button')]; return b.map(x => x.textContent); });
  const idx = crvBtn.indexOf('L2');
  if (idx >= 0) {
    await tap(page, `.mdcrv button:nth-child(${idx + 1})`);
    const r = await page.evaluate(() => ({v: mdSlot(DRUM_VOICES[ED.dVoice].id).mDcrv, u: UNDO.length}));
    ck('ND2-03', fmt, 'KANAL DYNAMICS: Tipp L2 → mDcrv L2, ein Undo', r.v === 'L2' && r.u === 1, {...r, buttons: crvBtn});
  } else ck('ND2-03', fmt, 'KANAL DYNAMICS: Knöpfe Li…O2', false, crvBtn);
  ck('ND2-03', fmt, 'KANAL DYNAMICS: 6 Kurven Li L1 L2 L3 O1 O2', deq(crvBtn, ['Li', 'L1', 'L2', 'L3', 'O1', 'O2']), crvBtn);
  await tap(page, '.mdmono'); await sleep(50);
  const m1 = await page.evaluate(() => ({v: mdSlot(DRUM_VOICES[ED.dVoice].id).mMono, u: UNDO.length, aria: document.querySelector('.mdmono').getAttribute('aria-checked')}));
  await tap(page, '.mdmono'); await sleep(50);
  const m2 = await page.evaluate(() => ({v: mdSlot(DRUM_VOICES[ED.dVoice].id).mMono, u: UNDO.length}));
  ck('ND2-03', fmt, 'KANAL MONO-GRUPPE: Tipp an/aus, je ein Undo', m1.v === 1 && m1.aria === 'true' && m2.v === 0 && m2.u === m1.u + 1, {m1, m2});
  // --- 6 Kit-Bedienelemente
  await rebuild(page, {tab: 'kit'}); await sleep(100);
  await tap(page, '.sh-subs .stab[data-sub="md"]'); await sleep(150);
  const kitInit = await page.evaluate(() => MDN.kitInit());
  const kitGet = k => page.evaluate(k => mdKit()[k], k);
  for (const [k, l] of [['rvT', 'REVERB TYPE'], ['rvC', 'COLOR'], ['dlR', 'RATE'], ['dlF', 'FEEDBACK'], ['dlB', 'BPM']]) {
    if (k === 'dlB') { await page.evaluate(() => { mdKitSet('dlM', 'b'); edRefresh(); }); await sleep(50); }
    await page.evaluate(() => { UNDO.length = 0; });
    const v0 = await kitGet(k), b = await box(page, `.knob.mdc[data-key="md.${k}"]`);
    await drag(page, b.cx, b.cy, vline(k === 'rvC' ? 60 : -70, 5));
    const v1 = await kitGet(k), u1 = await undoN(page);
    await dblTap(page, `.knob.mdc[data-key="md.${k}"]`); await sleep(60);
    const v2 = await kitGet(k), u2 = await undoN(page);
    ck('ND2-03', fmt, `KIT ${l}: Ziehen ändert, Doppeltipp = INIT, je ein Undo`, v1 !== v0 && u1 === 1 && v2 === kitInit[k] && u2 === 2, {v0, v1, v2, init: kitInit[k], u1, u2});
  }
  const kd = [];
  for (const [k, v, exp] of [['rvT', 'ti', 'ti'], ['rvT', 'hA', 'hA'], ['rvC', -9, new RegExp('^' + MINUS + '9$')], ['rvC', 0, '0'], ['rvC', 9, /^\+?9$/], ['dlF', 0, '0'], ['dlF', 20, '20'], ['dlR', 0, '0'], ['dlR', 99, '99'],
    ['dlB', 0, '60 ♩'], ['dlB', 60, '120 ♩'], ['dlB', 180, '150 ♪'], ['dlB', 320, '200 ♬'], ['dlB', 421, '0.050 s'], ['dlB', 470, '0.001 s']]) {
    const t = await page.evaluate(([k, v]) => { mdKitSet('dlM', k === 'dlR' ? 'r' : 'b'); mdKitSet(k, v); edRefresh(); return document.querySelector(`.knob.mdc[data-key="md.${k}"] .kn`).textContent; }, [k, v]);
    if (!(exp instanceof RegExp ? exp.test(t) : t === exp)) kd.push({k, v, exp: String(exp), got: t});
  }
  ck('ND2-03', fmt, 'KIT: Anzeige (REVERB TYPE Codes, COLOR ±, BPM „120 ♩“ „150 ♪“ „200 ♬“ „0.050 s“)', !kd.length, kd.length ? kd : undefined);
  await page.evaluate(() => { mdKitSet('dlM', 'r'); edRefresh(); UNDO.length = 0; });
  const segs = await page.evaluate(() => [...document.querySelectorAll('.mddlm button')].map(b => b.textContent));
  const tapOk = await page.evaluate(() => { const b = document.querySelector('.mdtap'); if (!b) return null; const q = b.getBoundingClientRect(); return {w: Math.round(q.width), h: Math.round(q.height)}; });
  ck('ND2-03', fmt, 'KIT: ECHO [RATE│BPM] und TAP (≥ 64 × 44) vorhanden', deq(segs, ['RATE', 'BPM']) && tapOk && tapOk.w >= 64 && tapOk.h >= 44, {segs, tap: tapOk});
  ck('ND2-03', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-04: Wirkung (nur was der ND-STUB spielt: TONE A1) =======================
async function nd204(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page, {md: ['kick']});
  // Messgrößen im Browser: Spitze, Länge bis −60 dB, Frequenz früh (0–15 ms) / spät (über Nulldurchgänge), Energie L/R
  const meas = set => page.evaluate(async set => {
    const s = mdSlot('kick'); Object.assign(s, mdProg(MDN.init()), {mTdec: 25}, set); drumChanged('kick');
    const r = await SYNQUENZER.mdRender([[.01, 'kick', .8]], {sec: 1.6}); const L = r.l, Rr = r.r, sr = 48000, i0 = Math.round(.01 * sr);
    let pk = 0, eL = 0, eR = 0; for (let i = 0; i < L.length; i++) { const m = Math.max(Math.abs(L[i]), Math.abs(Rr[i])); if (m > pk) pk = m; eL += L[i] * L[i]; eR += Rr[i] * Rr[i]; }
    let last = 0; for (let i = 0; i < L.length; i++) if (Math.max(Math.abs(L[i]), Math.abs(Rr[i])) > pk * 1e-3) last = i;
    const zc = (a, b) => { const x = L.map((v, i) => v + Rr[i]); let n = 0, f = -1, l = -1; for (let i = i0 + a + 1; i < i0 + b; i++) if (x[i - 1] <= 0 && x[i] > 0) { n++; if (f < 0) f = i; l = i; } return n > 1 ? (n - 1) / ((l - f) / sr) : 0; };
    return {pk, len: (last - i0) / sr, f0: zc(0, 720), f1: zc(4800, 9600), eL, eR, sum: Array.from(L.slice(0, 48000)).concat(Array.from(Rr.slice(0, 48000)))};
  }, set);
  const nul = (a, b) => { let n = 0, d = 0; for (let i = 0; i < a.length; i++) { const x = a[i] - b[i]; n += x * x; d += a[i] * a[i]; } return n ? 10 * Math.log10(n / (d || 1e-30)) : -999; };
  const strip = m => { const o = {...m}; delete o.sum; for (const k in o) o[k] = +(+o[k]).toPrecision(4); return o; };
  const T = [
    ['DECAY mTdec', {mTdec: 0}, {mTdec: 50}, (a, b) => b.len > a.len * 4, 'Länge'],
    ['PITCH mPit', {mPit: 36, mTdec: 40}, {mPit: 84, mTdec: 40}, (a, b) => b.f1 > a.f1 * 15.5 && b.f1 < a.f1 * 16.5, 'Frequenz ×16 (48 HT)'],
    ['BEND mBnd', {mBnd: -50, mBt: 30, mTdec: 45}, {mBnd: 50, mBt: 30, mTdec: 45}, (a, b) => b.f0 > a.f0 * 2, 'Frequenz früh'],
    ['TONE LVL mTlv', {mTlv: 0}, {mTlv: 50}, (a, b) => a.pk <= 1e-6 && b.pk > 1e-2, 'Spitze (min = still)'],
    ['CH LEVEL mChlv', {mChlv: 0}, {mChlv: 50}, (a, b) => a.pk <= 1e-6 && b.pk > 1e-2, 'Spitze (min = still)'],
    ['PAN mPan', {mPan: -9}, {mPan: 9}, (a, b) => a.eL > 100 * a.eR && b.eR > 100 * b.eL, 'Energie L/R'],
  ];
  for (const [n, a, b, ok, what] of T) { const A = await meas(a), B = await meas(b); ck('ND2-04', fmt, `${n}: min → max ändert ${what} (ND-STUB)`, ok(A, B), {min: strip(A), max: strip(B)}); }
  // graue Zellen (A1: SPECTRA, FREQ, DYN FILTER; EQ FREQ bei GAIN 0) wirken nicht: M-NULL ≤ −120 dB
  const ref = await meas({});
  for (const [n, set] of [['SPECTRA (A1)', {mSpc: 99}], ['FREQ (A1)', {mFrq: 0}], ['DYN FILTER (A1)', {mDyf: 9}], ['EQ FREQ (GAIN 0)', {mEqf: 0}]]) {
    const m = await meas(set), d = nul(ref.sum, m.sum);
    ck('ND2-04', fmt, `graue Zelle ${n} wirkt nicht (M-NULL ≤ −120 dB)`, d <= -120, {nullDb: +d.toFixed(1)});
  }
  ck('ND2-04', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-05: ALLE KANÄLE =======================
async function nd205(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  const PADS = ['kick', 'snare', 'hatC', 'hatO'];
  await setup(page, {md: PADS});
  const get = k => page.evaluate(([P, k]) => P.map(id => mdSlot(id)[k]), [PADS, k]);
  await page.evaluate(P => { P.forEach((id, i) => { mdSlot(id).mTdec = 10 + 10 * i; mdSlot(id).mPit = [40, 45, 50, 60][i]; drumChanged(id); }); edRefresh(); }, PADS);
  await tap(page, '.mdre .mdall'); await sleep(50);
  const on = await page.evaluate(() => ({all: MDE.all, aria: document.querySelector('.mdre .mdall').getAttribute('aria-checked'), focus: (UI.padEls || []).filter(p => p && p.classList && (p.classList.contains('mdfoc') || p.classList.contains('mdall'))).length}));
  ck('ND2-05', fmt, 'ALLE KANÄLE: Tipp schaltet an, Fokus-Rahmen auf den 4 Modell-Pads', on.all && on.aria === 'true' && on.focus === 4, on);
  const d0 = await get('mTdec'); await page.evaluate(() => { UNDO.length = 0; });
  const b = await box(page, cellSel('mTdec'));
  await drag(page, b.cx, b.cy, vline(-50, 5));
  const d1 = await get('mTdec'), u = await undoN(page);
  ck('ND2-05', fmt, 'DECAY ziehen → alle 4 gleich, genau ein Undo', d1.every(v => v === d1[0]) && d1[0] !== d0[0] && u === 1, {before: d0, after: d1, undo: u});
  await page.evaluate(() => undo()); await sleep(30);
  const d2 = await get('mTdec');
  ck('ND2-05', fmt, 'ein Undo stellt alle 4 DECAY-Werte her', deq(d2, d0), {d2, d0});
  // PITCH +3 an einem → alle +3
  const p0 = await get('mPit'); const pb = await box(page, cellSel('mPit'));
  await page.evaluate(() => { UNDO.length = 0; });
  await drag(page, pb.cx, pb.cy, vline(-60, 1), async () => (await stored(page, 'mPit')) < p0[0] + 3);
  const p1 = await get('mPit'), pu = await undoN(page);
  const dd = p1.map((v, i) => +(v - p0[i]).toFixed(1));
  ck('ND2-05', fmt, 'PITCH +3 an einem → alle +3 (ein Undo)', dd.every(x => x === 3) && pu === 1, {before: p0, after: p1, d: dd, undo: pu});
  // Gruppe hält am Rand 127.5
  await page.evaluate(P => { P.forEach((id, i) => { mdSlot(id).mPit = [120, 125, 100, 110][i]; drumChanged(id); }); edRefresh(); }, PADS);
  await drag(page, pb.cx, pb.cy, vline(-160, 8));
  const p2 = await get('mPit');
  ck('ND2-05', fmt, 'Gruppe hält am Rand an (max 127.5, Abstände bleiben)', deq(p2, [122.5, 127.5, 102.5, 112.5]), {after: p2, exp: [122.5, 127.5, 102.5, 112.5]});
  // Ende: Editor schließen, ■, Szenenwechsel
  const ends = {};
  for (const [name, fn] of [['closeEditor', 'closeEditor()'], ['stop', 'stop()'], ['launchScene', 'launchScene(0)']]) {
    await page.evaluate(() => { MDE.all = false; mdFocus(); ED.dTab = 'sound'; if (R.editor !== 'drum') openEditor(); else buildDrumEd(); });
    await sleep(80);
    await tap(page, '.mdre .mdall'); await sleep(30);
    const was = await page.evaluate(() => MDE.all);
    await page.evaluate(fn); await sleep(60);
    ends[name] = await page.evaluate(() => { if (R.editor !== 'drum') { ED.dTab = 'sound'; openEditor(); } return {all: MDE.all, focus: (UI.padEls || []).filter(p => p && p.classList && (p.classList.contains('mdfoc') || p.classList.contains('mdall'))).length, btn: document.querySelector('.mdre .mdall') ? document.querySelector('.mdre .mdall').classList.contains('on') : null}; });
    ck('ND2-05', fmt, `ALLE KANÄLE endet mit ${name} (Schalter danach aus)`, was && !ends[name].all && ends[name].focus === 0 && ends[name].btn !== true, {was, ...ends[name]});
  }
  ck('ND2-05', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-06: SCL PRE =======================
async function pickList(page, key, v) {
  await tap(page, cellSel(key)); await sleep(420);
  const n = await page.evaluate(() => UI.pop && UI.pop.name);
  if (n !== 'mdlist') return false;
  await page.evaluate(v => document.querySelector(`.pop button[data-v="${v}"]`).scrollIntoView({block: 'center'}), v); await sleep(120);
  await tap(page, `.pop button[data-v="${v}"]`); await sleep(60);
  return true;
}
async function nd206(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  const ids = await page.evaluate(() => DRUM_VOICES.map(v => v.id));
  const six = ids.slice(0, 6);
  await setup(page, {md: six});
  await page.evaluate(() => { mdSlot(DRUM_VOICES[0].id).mPit = 40; drumChanged(DRUM_VOICES[0].id); edRefresh(); UNDO.length = 0; });
  const opened = await pickList(page, 'scl', 'h1');
  const r = await page.evaluate(L => ({p: L.map(id => mdSlot(id).mPit), all: MDE.all, scl: MDE.scl, u: UNDO.length}), six);
  ck('ND2-06', fmt, 'SCL PRE h1, Start 40.0, 6 Kanäle → 40 44 47 52 56 59 (Tipp-Liste, ein Undo, ALLE KANÄLE an)', opened && deq(r.p, [40, 44, 47, 52, 56, 59]) && r.all && r.u === 1, {opened, ...r});
  await page.evaluate(L => { for (const id of L) SYNQUENZER.setPadSource(id, 'md'); MDE.sub = 'tone'; buildDrumEd(); UNDO.length = 0; }, ids);
  await sleep(150);
  const opened2 = await pickList(page, 'scl', 'H1');
  const H1 = [0, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24].map(x => 40 + x);
  const r2 = await page.evaluate(L => ({p: L.map(id => mdSlot(id).mPit), all: MDE.all}), ids);
  ck('ND2-06', fmt, 'SCL PRE H1 auf 12 Kanälen → Liste H1 (Kurd ab 40)', opened2 && deq(r2.p, H1), {opened2, got: r2.p, exp: H1});
  // PITCH +2 an Kanal 3 → alle +2
  await rebuild(page, {voice: 2}); await sleep(100);
  const p0 = r2.p, pb = await box(page, cellSel('mPit'));
  await drag(page, pb.cx, pb.cy, vline(-60, 1), async () => (await stored(page, 'mPit')) < p0[2] + 2);
  const p1 = await page.evaluate(L => L.map(id => mdSlot(id).mPit), ids);
  const dd = p1.map((v, i) => +(v - p0[i]).toFixed(1));
  ck('ND2-06', fmt, 'danach PITCH +2 an Kanal 3 → alle +2', dd.every(x => x === 2), {d: dd});
  const sclStored = await page.evaluate(() => { const hit = []; const walk = (o, p) => { if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k === 'scl') hit.push(p + '.' + k); walk(o[k], p + '.' + k); } }; walk(drumSnd(), 'drumSnd()'); walk(JSON.parse(JSON.stringify(S.tracks[DRUM_T])), 'track'); return hit; });
  ck('ND2-06', fmt, 'kein gespeichertes Feld scl', sclStored.length === 0, sclStored);
  ck('ND2-06', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-07: SOLO PART =======================
async function nd207(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page, {md: ['kick', 'snare', 'hatC', 'hatO']});
  const peak = a => { let m = 0; for (const x of a) m = Math.max(m, Math.abs(x)); return m; };
  const render = (hits, solo) => page.evaluate(async ([hits, solo]) => { const r = await SYNQUENZER.mdRender(hits, {sec: .6, solo}); return [Array.from(r.l), Array.from(r.r)]; }, [hits, solo]);
  const ref = await render([[.05, 'kick', .8], [.05, 'snare', .8]], null);
  await tap(page, '.mdsolo'); await sleep(60);
  const s1 = await page.evaluate(() => ({solo: MDX.solo, md: MDE.solo, head: !!document.querySelector('#drumSheet .mdsoloh, .mdsoloh'), msg: window.__md.filter(x => x.m.t === 'mute').map(x => x.m)}));
  ck('ND2-07', fmt, 'SOLO PART an (TONE): MDX.solo = {ch 0, tone}, Nachricht mute, Anzeige im Kopf', deq(s1.solo, {ch: 0, part: 'tone'}) && s1.md && s1.head && s1.msg.some(m => m.ch === 0 && m.solo === 'tone'), s1);
  const parts = {};
  for (const sub of ['noise', 'click', 'mix', 'fx', 'tone']) { await tap(page, `.sh-subs .stab[data-sub="${sub}"]`); await sleep(80); parts[sub] = await page.evaluate(() => MDX.solo); }
  ck('ND2-07', fmt, 'SOLO PART folgt dem Unter-Reiter (noise/click/all/all/tone)', deq(Object.values(parts).map(x => x && x.part), ['noise', 'click', 'all', 'all', 'tone']) && Object.values(parts).every(x => x && x.ch === 0), parts);
  // Render: andere Kanäle stumm; im NOISE-Teil schweigt TONE (≤ −120 dBFS)
  const sn = await render([[.05, 'snare', .8]], {ch: 0, part: 'tone'}), kt = await render([[.05, 'kick', .8]], {ch: 0, part: 'tone'}), kn = await render([[.05, 'kick', .8]], {ch: 0, part: 'noise'});
  const pk = {snareSoloTone: peak(sn[0].concat(sn[1])), kickSoloTone: peak(kt[0].concat(kt[1])), kickSoloNoise: peak(kn[0].concat(kn[1]))};
  ck('ND2-07', fmt, 'Render SOLO TONE ch0: anderer Kanal ≤ −120 dBFS, ch0 klingt', pk.snareSoloTone <= 1e-6 && pk.kickSoloTone > 1e-3, pk);
  ck('ND2-07', fmt, 'Render SOLO NOISE ch0: TONE ≤ −120 dBFS', pk.kickSoloNoise <= 1e-6, pk);
  // Wechsel des Pads (Chip) → Solo-Kanal folgt
  await page.evaluate(() => { ED.dVoice = 1; if (MDE.solo) mdSoloApply(); buildDrumEd(); });
  const s2 = await page.evaluate(() => MDX.solo);
  ck('ND2-07', fmt, 'Solo-Kanal folgt dem gewählten Pad', deq(s2, {ch: 1, part: 'tone'}), s2);
  await page.evaluate(() => { ED.dVoice = 0; mdSoloApply(); buildDrumEd(); });
  // aus → alles wie vorher
  await tap(page, '.mdsolo'); await sleep(60);
  const s3 = await page.evaluate(() => ({solo: MDX.solo, md: MDE.solo, last: window.__md.filter(x => x.m.t === 'mute').map(x => x.m).at(-1), head: !!document.querySelector('.mdsoloh')}));
  const after = await render([[.05, 'kick', .8], [.05, 'snare', .8]], null);
  let num = 0, den = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < ref[c].length; i++) { const d = ref[c][i] - after[c][i]; num += d * d; den += ref[c][i] * ref[c][i]; }
  const nullDb = num ? 10 * Math.log10(num / den) : -999;
  ck('ND2-07', fmt, 'SOLO PART aus: mute ch -1, Kopf-Anzeige weg, Render = vorher (M-NULL ≤ −90 dB)', s3.solo === null && !s3.md && s3.last && s3.last.ch === -1 && !s3.head && nullDb <= -90, {...s3, nullDb});
  // endet mit Schließen des Editors
  await tap(page, '.mdsolo'); await sleep(40);
  const was = await page.evaluate(() => MDX.solo);
  await page.evaluate(() => closeEditor()); await sleep(60);
  const s4 = await page.evaluate(() => ({solo: MDX.solo, md: MDE.solo, last: window.__md.filter(x => x.m.t === 'mute').map(x => x.m).at(-1)}));
  ck('ND2-07', fmt, 'SOLO PART endet mit Editor-Schließen', was && s4.solo === null && !s4.md && s4.last.ch === -1, {was, ...s4});
  for (const [n, fn] of [['stop', 'stop()'], ['launchScene', 'launchScene(0)']]) {
    await page.evaluate(() => { ED.dTab = 'sound'; openEditor(); }); await sleep(80);
    await tap(page, '.mdsolo'); await sleep(40);
    const w = await page.evaluate(() => MDE.solo);
    await page.evaluate(fn); await sleep(60);
    const s = await page.evaluate(() => ({solo: MDX.solo, md: MDE.solo}));
    ck('ND2-07', fmt, `SOLO PART endet mit ${n}`, w && s.solo === null && !s.md, {was: w, ...s});
  }
  ck('ND2-07', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-08: Kopieren / Einfügen / Tauschen / Init =======================
async function more(page, a, sw) {
  await tap(page, '.mdmore'); await sleep(120);
  if ((await popOpen(page)) !== 'mdmore') return false;
  await tap(page, `.pop button[data-a="${a}"]`); await sleep(80);
  if (sw) { await tap(page, `.pop button[data-sw="${sw}"]`); await sleep(80); }
  return true;
}
async function nd208(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  const PADS = ['kick', 'snare', 'hatC', 'hatO'];
  await setup(page, {md: PADS});
  await page.evaluate(() => {
    Object.assign(mdSlot('kick'), {mWav: 'd3', mTdec: 33, mPit: 50.5, mPan: 4, mBnd: -12, mName: 'Kx', mCat: 'bd', mMono: 1, mDcrv: 'L2'});
    Object.assign(mdSlot('snare'), {mWav: 'H2', mTdec: 7, mPit: 70, mMono: 0, mDcrv: 'O1', mName: 'Sx'});
    Object.assign(mdSlot('hatC'), {mWav: 'C1', mTdec: 3, mPit: 90, mMono: 1, mDcrv: 'L1', mName: 'Hx'});
    for (const id of ['kick', 'snare', 'hatC']) drumChanged(id); edRefresh();
  });
  const slots = () => page.evaluate(P => Object.fromEntries(P.map(id => [id, JSON.parse(JSON.stringify(mdSlot(id)))])), PADS);
  const prog = s => { const o = {}; for (const k of KEYS) if (k !== 'mMono' && k !== 'mDcrv') o[k] = s[k]; return o; };
  const KEYS = await page.evaluate(() => MDN.KEYS);
  const INIT = await page.evaluate(() => MDN.init());
  const S0 = await slots();
  // Kopieren (kein Undo)
  await page.evaluate(() => { UNDO.length = 0; });
  const okc = await more(page, 'copy');
  const clip = await page.evaluate(() => MDE.clip);
  ck('ND2-08', fmt, 'Kopieren: Ablage = Programm des Kanals (ohne Mono/Dynamik), kein Undo', okc && deq(clip, prog(S0.kick)) && (await undoN(page)) === 0, {clip});
  // Einfügen auf snare
  await rebuild(page, {voice: 1}); await sleep(80);
  await more(page, 'paste');
  const S1 = await slots(), u1 = await undoN(page);
  ck('ND2-08', fmt, 'Einfügen: Ziel deep-equal Erwartung, ein Undo', deq(S1.snare, {...S0.snare, ...prog(S0.kick)}) && deq(S1.kick, S0.kick) && u1 === 1, {u1});
  await page.evaluate(() => undo());
  ck('ND2-08', fmt, 'Einfügen: ein Undo stellt her', deq((await slots()).snare, S0.snare));
  // Tauschen snare ↔ hatC
  await page.evaluate(() => { UNDO.length = 0; });
  const oks = await more(page, 'swap', 'hatC');
  const S2 = await slots(), u2 = await undoN(page);
  ck('ND2-08', fmt, 'Tauschen: beide deep-equal Erwartung (Mono/Dynamik bleiben), ein Undo', oks && deq(S2.snare, {...S0.snare, ...prog(S0.hatC)}) && deq(S2.hatC, {...S0.hatC, ...prog(S0.snare)}) && u2 === 1, {u2});
  await page.evaluate(() => undo());
  const S2u = await slots();
  ck('ND2-08', fmt, 'Tauschen: ein Undo stellt her', deq(S2u.snare, S0.snare) && deq(S2u.hatC, S0.hatC));
  // Init kick
  await rebuild(page, {voice: 0}); await sleep(80);
  await page.evaluate(() => { UNDO.length = 0; });
  await more(page, 'init');
  const S3 = await slots(), u3 = await undoN(page);
  ck('ND2-08', fmt, 'Init: Kanal = INIT-Programm (Mono/Dynamik bleiben), ein Undo', deq(S3.kick, {...S0.kick, ...prog(INIT)}) && u3 === 1, {u3, kick: S3.kick});
  await page.evaluate(() => undo());
  ck('ND2-08', fmt, 'Init: ein Undo stellt her', deq((await slots()).kick, S0.kick));
  // Einfügen mit ALLE KANÄLE → alle Modell-Kanäle
  await tap(page, '.mdre .mdall'); await sleep(40);
  await page.evaluate(() => { UNDO.length = 0; });
  await more(page, 'paste');
  const S4 = await slots(), u4 = await undoN(page);
  const exp4 = Object.fromEntries(PADS.map(id => [id, {...S0[id], ...prog(S0.kick)}]));
  ck('ND2-08', fmt, 'Einfügen mit ALLE KANÄLE → alle 4 Modell-Kanäle, ein Undo', deq(S4, exp4) && u4 === 1, {u4, bad: PADS.filter(id => !deq(S4[id], exp4[id]))});
  await page.evaluate(() => undo());
  ck('ND2-08', fmt, 'Einfügen in alle: ein Undo stellt alle her', deq(await slots(), S0));
  ck('ND2-08', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-09: WAVE-Liste =======================
async function nd209(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page);
  await page.evaluate(() => { UNDO.length = 0; window.__md.length = 0; });
  await tap(page, cellSel('mWav')); await sleep(420);
  const L = await page.evaluate(() => { const l = document.querySelector('.pop .mdwl'); if (!l) return null; const b = [...l.querySelectorAll('button[data-v]')];
    return {name: UI.pop.name, n: b.length, small: b.map(x => { const q = x.getBoundingClientRect(); return [x.dataset.v, Math.round(q.width * 10) / 10, Math.round(q.height * 10) / 10]; }).filter(x => x[1] < 44 || x[2] < 44),
      rows: l.querySelectorAll('.mdwr').length, sh: l.scrollHeight, ch: l.clientHeight, codes: b.map(x => x.dataset.v)}; });
  ck('ND2-09', fmt, 'WAVE-Liste: Tipp öffnet Popover mit 34 Feldern in 8 Familienzeilen', L && L.n === 34 && L.rows === 8, L && {n: L.n, rows: L.rows});
  ck('ND2-09', fmt, 'WAVE-Liste: jedes Feld ≥ 44 × 44', L && !L.small.length, L && L.small);
  // Wischen in der Liste: scrollt, wählt nicht
  const scrollable = L && L.sh > L.ch + 2;
  if (L) {
    const w0 = await stored(page, 'mWav'), u0 = await undoN(page);
    const fb = await page.evaluate(() => { const l = document.querySelector('.pop .mdwl'), lr = l.getBoundingClientRect(); const b = [...l.querySelectorAll('button[data-v]')].find(x => { const q = x.getBoundingClientRect(); return q.top >= lr.top && q.bottom <= lr.bottom && q.top > lr.top + lr.height / 2 - 60; }) || l.querySelector('button[data-v]'); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, v: b.dataset.v, st: l.scrollTop}; });
    await drag(page, fb.x, fb.y, vline(-Math.min(120, fb.y - 20), 6), null, 16);
    await sleep(500);
    const r = await page.evaluate(() => { const l = document.querySelector('.pop .mdwl'); return {st: l ? l.scrollTop : null, open: !!l}; });
    const w1 = await stored(page, 'mWav'), u1 = await undoN(page);
    ck('ND2-09', fmt, 'Wischen in der Liste wählt nicht (Wert und Undo unverändert, Liste bleibt offen)', w1 === w0 && u1 === u0 && r.open, {w0, w1, u0, u1, from: fb.v});
    ck('ND2-09', fmt, 'Wischen in der Liste scrollt' + (scrollable ? '' : ' (Liste passt ganz – nichts zu scrollen)'), scrollable ? r.st > fb.st + 10 : true, {scrollTop0: fb.st, scrollTop1: r.st, scrollH: L.sh, clientH: L.ch});
    // Tipp = Wahl + Vorhören, ein Undo
    await page.evaluate(() => { const b = document.querySelector('.pop .mdwl button[data-v="d3"]'); b.scrollIntoView({block: 'center'}); window.__md.length = 0; });
    await sleep(150);
    await tap(page, '.pop .mdwl button[data-v="d3"]'); await sleep(120);
    const t = await page.evaluate(() => ({w: mdSlot(DRUM_VOICES[ED.dVoice].id).mWav, u: UNDO.length, hits: window.__md.filter(x => x.m.t === 'hit').length, on: document.querySelector('.pop .mdwl button[data-v="d3"]')?.classList.contains('on'), playing: R.playing}));
    ck('ND2-09', fmt, 'Tipp auf d3 = Wahl + Vorhören (Transport steht), ein Undo', t.w === 'd3' && t.u === u0 + 1 && t.hits >= 1 && t.on, t);
  }
  await page.evaluate(() => closePop());
  // Vorhören nicht bei laufendem Transport (Transport echt gestartet; gezählt werden Vorhör-Aufrufe drumAudition)
  await page.evaluate(() => { window.__aud = 0; const o = window.drumAudition; window.drumAudition = (...a) => { window.__aud++; return o(...a); }; play(); UNDO.length = 0; });
  await sleep(300);
  await tap(page, cellSel('mWav')); await sleep(420);
  let tr = null;
  if ((await popOpen(page)) === 'mdlist') { await page.evaluate(() => { window.__aud = 0; }); await tap(page, '.pop .mdwl button[data-v="A2"]'); await sleep(100); tr = await page.evaluate(() => ({w: mdSlot(DRUM_VOICES[ED.dVoice].id).mWav, playing: R.playing, auditions: window.__aud, u: UNDO.length})); }
  await page.evaluate(() => { closePop(); if (R.playing) togglePlay(); });
  ck('ND2-09', fmt, 'bei laufendem Transport: Tipp wählt (ein Undo), ohne Vorhören', tr && tr.playing && tr.w === 'A2' && tr.auditions === 0 && tr.u === 1, tr);
  ck('ND2-09', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-10: KIT-Block TAP + RATE/BPM =======================
async function nd210(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page, {tab: 'kit'});
  await tap(page, '.sh-subs .stab[data-sub="md"]'); await sleep(150);
  let res = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.evaluate(() => { MDE.taps = []; mdKitSet('dlM', 'r'); mdKitSet('dlB', 0); edRefresh(); UNDO.length = 0; window.__tapT = []; document.addEventListener('pointerup', e => { if (e.target.closest && e.target.closest('.mdtap')) window.__tapT.push(performance.now()); }, true); });
    const b = await box(page, '.mdtap');
    const t0 = Date.now(); const txt = [];
    for (let i = 0; i < 4; i++) {
      while (Date.now() < t0 + 500 * i) await sleep(Math.max(0, Math.min(5, t0 + 500 * i - Date.now())));
      await page.touchscreen.tap(b.cx, b.cy);
      if (i < 3) txt.push(await page.evaluate(() => document.querySelector('.mdtap').textContent));
    }
    await sleep(80);
    res = await page.evaluate(() => { const T = window.__tapT; return {dlB: mdKit().dlB, dlM: mdKit().dlM, btn: document.querySelector('.mdtap').textContent, kn: document.querySelector('.knob.mdc[data-key="md.dlB"] .kn')?.textContent, u: UNDO.length, avg: T.length >= 4 ? (T.at(-1) - T.at(-4)) / 3 : null}; });
    res.txt = txt; res.attempt = attempt;
    if (res.avg && Math.round(60000 / res.avg) === 120) break;     // Abstände nicht genau genug getroffen → noch einmal
  }
  ck('ND2-10', fmt, 'TAP 1–3 zeigt die Schläge', deq(res.txt, ['TAP 1', 'TAP 2', 'TAP 3']), res.txt);
  ck('ND2-10', fmt, 'TAP 4 × 500 ms → dlB 60, BPM-Modus, „120 ♩“, ein Undo', res.dlB === 60 && res.dlM === 'b' && res.btn === '120 ♩' && res.kn === '120 ♩' && res.u === 1, res);
  await page.evaluate(() => { UNDO.length = 0; });
  const segBtn = async l => { const i = await page.evaluate(l => [...document.querySelectorAll('.mddlm button')].findIndex(b => b.textContent === l), l); await tap(page, `.mddlm button:nth-child(${i + 1})`); await sleep(60); return page.evaluate(() => ({dlM: mdKit().dlM, rate: !document.querySelector('.knob.mdc[data-key="md.dlR"]').hidden, bpm: !document.querySelector('.knob.mdc[data-key="md.dlB"]').hidden, u: UNDO.length, kit: window.__md.filter(x => x.m.t === 'kit').map(x => x.m.p.dlM).at(-1)})); };
  const r1 = await segBtn('RATE'); await sleep(80); const r1k = await page.evaluate(() => window.__md.filter(x => x.m.t === 'kit').map(x => x.m.p.dlM).at(-1));
  const r2 = await segBtn('BPM'); await sleep(80); const r2k = await page.evaluate(() => window.__md.filter(x => x.m.t === 'kit').map(x => x.m.p.dlM).at(-1));
  ck('ND2-10', fmt, 'RATE/BPM-Umschalter ändert dlM (r/b), Zelle RATE bzw. BPM sichtbar, je ein Undo, Kit-Nachricht an die Engine', r1.dlM === 'r' && r1.rate && !r1.bpm && r2.dlM === 'b' && r2.bpm && !r2.rate && r1.u === 1 && r2.u === 2 && r1k === 'r' && r2k === 'b', {r1, r2, kitMsg: [r1k, r2k]});
  ck('ND2-10', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-11: Programm sichern / laden =======================
async function nd211(fmt) {
  const ctx = await newCtx(fmt); let page = await openApp(ctx, APP);
  await setup(page);
  const NAME = 'Test Kick ' + fmt;
  await page.evaluate(() => { Object.assign(mdSlot('kick'), {mWav: 'd2', mTdec: 31, mPit: 38.4, mBnd: -20, mPan: -2, mRvb: 12}); drumChanged('kick'); edRefresh(); UNDO.length = 0; });
  const progOf = `(s => { const o = {}; for (const k of MDN.KEYS) if (k !== 'mMono' && k !== 'mDcrv') o[k] = s[k]; return o; })`;
  await more(page, 'save'); await sleep(150);
  const sp = await popOpen(page);
  await page.fill('.pop input.tin', NAME);
  await tap(page, '.pop .mdcats button[data-c="Pc"]');
  await tap(page, '.pop .mbtn.go');
  await page.waitForFunction(() => UNDO.length >= 1, null, {timeout: 5000}).catch(() => {});
  const saved = await page.evaluate(`(${progOf})(mdSlot('kick'))`);
  const s1 = await page.evaluate(n => ({u: UNDO.length, name: mdSlot('kick').mName, cat: mdSlot('kick').mCat, lib: mdLibList().filter(x => x.name === n).length}), NAME);
  ck('ND2-11', fmt, 'Programm sichern (Name + Kategorie): Kanal trägt Name/Kategorie, Bibliothek hat es, ein Undo', sp === 'mdsave' && s1.name === NAME && s1.cat === 'Pc' && s1.lib === 1 && s1.u === 1, {pop: sp, ...s1});
  const ownList = async () => {
    await page.evaluate(() => closePop());
    await tap(page, '.mdprog'); await page.waitForFunction(() => UI.pop && UI.pop.name === 'mdprog', null, {timeout: 5000}).catch(() => {});
    await sleep(100);
    await tap(page, '.pop .mdcats button[data-c="own"]'); await sleep(100);
    return page.evaluate(() => [...document.querySelectorAll('.pop .mdpl button[data-k]')].map(b => b.textContent));
  };
  const l1 = await ownList();
  ck('ND2-11', fmt, 'erscheint unter „Eigene“ in Programm ▾', l1.includes(NAME), l1);
  await page.evaluate(() => closePop());
  // Neuladen
  await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await page.waitForTimeout(500);
  page._cdp = await ctx.newCDPSession(page); page._errs = []; page.on('pageerror', e => page._errs.push(String(e)));
  await setup(page);
  await page.evaluate(() => { Object.assign(mdSlot('kick'), mdProg(MDN.init()), {mMono: 1, mDcrv: 'O2'}); drumChanged('kick'); edRefresh(); UNDO.length = 0; });
  const l2 = await ownList();
  ck('ND2-11', fmt, 'nach Neuladen noch unter „Eigene“', l2.includes(NAME), l2);
  const k = l2.indexOf(NAME);
  if (k >= 0) {
    await page.evaluate(k => document.querySelector(`.pop .mdpl button[data-k="${k}"]`).scrollIntoView({block: 'center'}), k);
    await tap(page, `.pop .mdpl button[data-k="${k}"]`); await sleep(120);
    const got = await page.evaluate(`(${progOf})(mdSlot('kick'))`), keep = await page.evaluate(() => ({mMono: mdSlot('kick').mMono, mDcrv: mdSlot('kick').mDcrv, u: UNDO.length}));
    ck('ND2-11', fmt, 'Laden: Programm-Felder deep-equal Gesichertem, Mono/Dynamik bleiben, ein Undo', deq(got, saved) && keep.mMono === 1 && keep.mDcrv === 'O2' && keep.u === 1, {keep, diff: Object.keys(saved).filter(x => !deq(saved[x], got[x])).map(x => [x, saved[x], got[x]])});
    await page.evaluate(() => { closePop(); undo(); });
    const back = await page.evaluate(`(${progOf})(mdSlot('kick'))`), init = await page.evaluate(`(${progOf})(MDN.init())`);
    ck('ND2-11', fmt, 'Laden: ein Undo stellt her', deq(back, init));
  }
  const cats = await page.evaluate(() => { const f = Array.isArray(window.MD_PROGRAMS) ? window.MD_PROGRAMS.length : 0; return f; });
  ck('ND2-11', fmt, 'Info: Werk-Programme (ND3) vorhanden – Kategorie-Filter nur damit prüfbar', true, {factory: cats});
  ck('ND2-11', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= ND2-12: kein Gerätename, MD_NAME an allen Anzeigeorten =======================
async function nd212(fmt) {
  const html = fs.readFileSync(APP, 'utf8');
  const nord = [...html.matchAll(/nord/gi)].map(m => ({at: html.slice(0, m.index).split('\n').length, ctx: html.slice(Math.max(0, m.index - 30), m.index + 30)}));
  ck('ND2-12', fmt, "grep -i 'nord' im App-HTML = 0", nord.length === 0, nord.length ? {n: nord.length, first: nord.slice(0, 3)} : undefined);
  const defs = html.split('const MD_NAME =').length - 1;
  const m = html.match(/const MD_NAME = (['"`])([^'"`]*)\1/);
  ck('ND2-12', fmt, 'const MD_NAME genau einmal definiert', defs === 1 && m, {defs, value: m && m[2]});
  if (!m) return;
  const lit = html.split(m[1] + m[2] + m[1]).length - 1;
  ck('ND2-12', fmt, `Name „${m[2]}“ als Literal nur in der Definition`, lit === 1, {literals: lit});
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'md2-')), 'index.html');
  fs.writeFileSync(tmp, html.replace(m[0], `const MD_NAME = ${m[1]}Zzyx${m[1]}`));
  const ctx = await newCtx(fmt), page = await openApp(ctx, tmp);
  await setup(page);
  const r = await page.evaluate(async old => {
    const o = {};
    o.src = document.querySelector('.dsrc b')?.textContent;
    o.srcAria = document.querySelector('.dsrc')?.getAttribute('aria-label');
    o.lcd = ED.lcd ? ED.lcd.textContent : '';
    ED.dTab = 'kit'; buildDrumEd(); o.kitSub = [...document.querySelectorAll('.sh-subs .stab')].map(b => b.textContent);
    MDE.kitSub = 'md'; buildDrumEd(); await new Promise(r => setTimeout(r, 50)); o.kitLcd = ED.lcd ? ED.lcd.textContent : '';
    ED.dTab = 'tief'; buildDrumEd(); o.ov = document.querySelector('.mdov')?.textContent || '';
    ED.dTab = 'sound'; buildDrumEd();
    document.querySelector('.dsrc').click(); await new Promise(r => setTimeout(r, 50)); o.srcPop = document.querySelector('.pop .dsrcs')?.textContent || ''; closePop();
    o.api = SYNQUENZER.mdName(); o.info = SYNQUENZER.mdInfo().name;
    closeEditor(); openMenu(); await new Promise(r => setTimeout(r, 100));
    o.help = (EL.menu.textContent.match(/Zzyx · [^:]{2,40}:/g) || []).length; o.helpLines = mdHelp().length;
    // sichtbarer DOM: Textknoten außerhalb von script/style + alle Attributwerte (Code-Kommentare zählen nicht)
    let n = 0; const re = new RegExp(old, 'g'), w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let x = w.currentNode; x; x = w.nextNode()) { if (x.nodeType === 3) { if (!x.parentElement || !x.parentElement.closest('script,style')) n += (x.data.match(re) || []).length; } else for (const a of x.attributes || []) n += (a.value.match(re) || []).length; }
    o.oldInDom = n;
    return o;
  }, m[2]);
  await ctx.close(); fs.rmSync(path.dirname(tmp), {recursive: true, force: true});
  ck('ND2-12', fmt, 'MD_NAME ausgetauscht (Zzyx): Quelle-Knopf + Quelle-Popover', r.src === 'Zzyx' && /Zzyx/.test(r.srcAria) && /Zzyx/.test(r.srcPop), {src: r.src, aria: r.srcAria, pop: r.srcPop});
  ck('ND2-12', fmt, 'MD_NAME ausgetauscht: KIT-Unter-Reiter „Zzyx · HALL & ECHO“ + LCD', r.kitSub.some(s => s.startsWith('Zzyx · HALL')) && /Zzyx/.test(r.kitLcd), {kitSub: r.kitSub, lcd: r.kitLcd});
  ck('ND2-12', fmt, 'MD_NAME ausgetauscht: SOUND-LCD, KANAL-Übersicht, API', /Zzyx/.test(r.lcd) && /Zzyx/.test(r.ov) && r.api === 'Zzyx' && r.info === 'Zzyx', {lcd: r.lcd, api: r.api});
  ck('ND2-12', fmt, 'MD_NAME ausgetauscht: Hilfe-Zeilen (7) zeigen Zzyx', r.help >= 7 && r.helpLines === 7, {help: r.help, lines: r.helpLines});
  ck('ND2-12', fmt, `alter Name „${m[2]}“ nirgends mehr im sichtbaren DOM (Text, Attribute)`, r.oldInDom === 0, {n: r.oldInDom});
}

// ======================= ND2-13: Öffnen < 50 ms, Vorhören ≤ 30 ms nach Loslassen =======================
async function nd213(fmt) {
  const ctx = await newCtx(fmt), page = await openApp(ctx, APP);
  await setup(page);
  const t = await page.evaluate(async () => {
    const lt = []; let po = null;
    try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
    const b = [], o = [];
    for (let i = 0; i < 7; i++) { ED.dTab = 'sound'; MDE.sub = ['tone', 'noise', 'click', 'mix', 'fx', 'tone', 'tone'][i]; const t0 = performance.now(); buildDrumEd(); b.push(performance.now() - t0); await new Promise(r => setTimeout(r, 30)); }
    for (let i = 0; i < 5; i++) { closeEditor(); await new Promise(r => setTimeout(r, 400)); ED.dTab = 'sound'; MDE.sub = 'tone'; const t0 = performance.now(); openEditor(); o.push(performance.now() - t0); await new Promise(r => setTimeout(r, 300)); }
    await new Promise(r => setTimeout(r, 200)); if (po) po.disconnect();
    const r = a => a.map(x => Math.round(x * 10) / 10);
    return {build: r(b), open: r(o), longtasks: lt};
  });
  ck('ND2-13', fmt, 'buildDrumEd auf Modell-Pad < 50 ms (jede Messung)', Math.max(...t.build) < 50, {ms: t.build});
  ck('ND2-13', fmt, 'openEditor auf Modell-Pad < 50 ms, keine lange Aufgabe > 50 ms', Math.max(...t.open) < 50 && !t.longtasks.some(x => x > 50), {ms: t.open, longtasks: t.longtasks});
  // Vorhören: Zeit vom Loslassen (pointerup) bis zur Schlag-Nachricht an die Engine
  await page.evaluate(() => { window.__up = []; document.addEventListener('pointerup', e => window.__up.push(performance.now()), true); });
  const lat = async (fn) => {
    await page.evaluate(() => { window.__md.length = 0; window.__up.length = 0; MDE.aud = 0; });
    await fn(); await sleep(400);
    return page.evaluate(() => { const up = window.__up.at(-1), h = window.__md.filter(x => x.m.t === 'hit' && x.t >= up - 1); return {up: up != null, hits: window.__md.filter(x => x.m.t === 'hit').length, rel: window.__md.filter(x => x.m.t === 'hit').map(x => Math.round(x.t - up)), afterUp: h.length ? Math.round((h[0].t - up) * 10) / 10 : null}; });
  };
  const b = await box(page, cellSel('mTdec'));
  const dragL = await lat(() => drag(page, b.cx, b.cy, vline(-30, 3), null, 12));
  const dragLong = await lat(async () => { await tStart(page, b.cx, b.cy); for (let i = 1; i <= 8; i++) { await tMove(page, b.cx, b.cy + 3 * i); await sleep(20); } await sleep(500); await tEnd(page); });
  const trig = await lat(() => tap(page, '.mdtrig'));
  ck('ND2-13', fmt, 'Vorhören ▶: Schlag ≤ 30 ms nach Loslassen', trig.afterUp != null && trig.afterUp <= 30, trig);
  ck('ND2-13', fmt, 'Vorhören nach Ziehen (kurz, < 300 ms): Schlag ≤ 30 ms nach Loslassen', dragL.afterUp != null && dragL.afterUp <= 30, dragL);
  ck('ND2-13', fmt, 'Vorhören nach Ziehen (lang, Pause vor dem Loslassen): Schlag ≤ 30 ms nach Loslassen', dragLong.afterUp != null && dragLong.afterUp <= 30, dragLong);
  ck('ND2-13', fmt, 'keine Seitenfehler', !page._errs.length, page._errs);
  await ctx.close();
}

// ======================= Ablauf =======================
const T0 = Date.now();
const run = async (id, fn, fmt) => { if (!want(id)) return; try { await fn(fmt); } catch (e) { ck(id, fmt, 'Testlauf ohne Ausnahme', false, String(e && e.stack || e).slice(0, 600)); } };
for (const fmt of FMTS) {
  await run('ND2-01', nd201, fmt);
  await run('ND2-03', nd203, fmt);
  if (fmt === FMTS[0]) await run('ND2-04', nd204, fmt);
  await run('ND2-05', nd205, fmt);
  await run('ND2-06', nd206, fmt);
  await run('ND2-07', nd207, fmt);
  await run('ND2-08', nd208, fmt);
  await run('ND2-09', nd209, fmt);
  await run('ND2-10', nd210, fmt);
  await run('ND2-11', nd211, fmt);
  if (fmt === FMTS[0]) await run('ND2-12', nd212, fmt);
  await run('ND2-13', nd213, fmt);
}
await browser.close();
const ids = [...new Set(checks.map(c => c.id))].sort();
const perId = Object.fromEntries(ids.map(id => { const c = checks.filter(x => x.id === id); return [id, {ok: c.every(x => x.ok), pass: c.filter(x => x.ok).length, fail: c.filter(x => !x.ok).length}]; }));
const fail = checks.filter(c => !c.ok);
console.log(JSON.stringify({ok: !fail.length, app: APP, old: OLD, formats: FMTS, sec: Math.round((Date.now() - T0) / 1000), pass: checks.length - fail.length, fail: fail.length, perId, failed: fail, checks}, null, 1));
process.exit(fail.length ? 1 : 0);
