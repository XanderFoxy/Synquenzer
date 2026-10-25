// G-MK1-gruppe-fix proofs: way back to SPIEL without replacing the sound (touch, P/L, real font)
import {open, sleep, OUT, check, done} from './v3-qa-gmk1-tl.mjs';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad', FONTS = 'file://' + SP + '/dirigent-wt/fonts/';
const L = process.argv[2] === 'L', TG = L ? 'L' : 'P';
const T = await open({file: process.env.FIXF || SP + '/mk-wt/index.html', viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
const font = await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]]];
  const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
  await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"'].map(s => document.fonts.load(s))); await document.fonts.ready;
  return [...document.fonts].some(x => x.family.includes('Barlow') && x.status === 'loaded'); }, FONTS);
check(TG + ' S0 real font loaded', font, font);
const sel = async () => (await T.panel()).sel;
const knobsL = async () => (await T.panel()).knobs.map(k => k && k.l).join('|');
const SPK = 'CUTOFF|RESONANZ|ATTACK|RELEASE|TEMPO';
const cut = () => E(() => SYNQUENZER.mkGet(0).t[0].f.cut);
const toFilter = async () => { await T.tapMk('w1', 250); await T.tapPop(/^6 FILTER/); await sleep(200); };
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(700);
const d0 = (await T.panel()).disp;
await toFilter(); const f0 = await sel(), kf = await knobsL();
await T.dragMk('k1', 40); const c0 = await cut(), u0 = await T.undoN();
// (a) an empty number key
await T.tapMk('n0', 300); const a = await sel(), ka = await knobsL(), ca = await cut(), ua = await T.undoN(), la = await T.lcdTxt();
check(TG + ' S1 unsaved sound (display ' + d0 + '): FILTER → tap on an empty number key → SPIEL, sound kept', f0.wahl === 1 && kf.startsWith('TYP') && a.wahl === 0 && ka === SPK && ca === c0 && c0 !== 127 && ua === u0, {f0, kf, a, ka, c0, ca, u0, ua, lcd: la});
// (b) the display
await toFilter(); await T.tapMk('disp', 300); const b = await sel(), kb = await knobsL(), cb = await cut();
check(TG + ' S2 FILTER → tap on the display → SPIEL, sound kept', b.wahl === 0 && kb === SPK && cb === c0, {b, kb, cb});
// (c) in SPIEL an empty key only shows the hint
await T.tapMk('n3', 300); const c = await sel(), lc = await T.lcdTxt();
check(TG + ' S3 in SPIEL an empty key shows the PROGRAMM hint, stays SPIEL', c.wahl === 0 && /Platz leer/.test(lc || ''), {c, lc});
// (d) SPIEL knobs work: TEMPO reachable (k4) and ATTACK (k2)
const bpm0 = await E(() => SYNQUENZER.runtime().bpm); await T.dragMk('k4', -30); const bpm1 = await E(() => SYNQUENZER.runtime().bpm);
check(TG + ' S4 SPIEL TEMPO knob reachable again and changes the tempo', bpm1 !== bpm0, {bpm0, bpm1});
// (e) track switch → SPIEL for the other track's sound; back → SPIEL
await toFilter();
await E(() => { SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.closeEditor(); SYNQUENZER.selectTrack(2); SYNQUENZER.openEditor(); }); await sleep(600); const e2 = await sel();
await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600); const e0 = await sel();
check(TG + ' S5 another track = another sound → SPIEL', e2.wahl === 0 && e0.wahl === 0, {e2, e0});
// (f) reopen the same track keeps the section (like the hardware) – a tab switch too
await toFilter(); await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.openEditor(); }); await sleep(600); const f1 = await sel();
check(TG + ' S6 closing and reopening the same track keeps EDIT-WAHL 1 (no reset without a reason)', f1.wahl === 1, f1);
// (g) WRITE → lit key + program number at once; the lit key leads back to SPIEL, sound kept
await T.tapMk('write', 300); await E(() => { const i = document.querySelector('#popLayer .pop input'); i.value = 'Fix Prog'; i.dispatchEvent(new Event('input', {bubbles: true})); }); await T.tapTxt('#popLayer .pop button', /^Sichern$/, 400);
const pw = await T.panel(), lit = await E(() => [...document.querySelectorAll('.mkx.mnum')].filter(e => e.getClientRects().length).map(e => (e.classList.contains('on') ? 'on' : '') + (e.classList.contains('mempty') ? 'e' : '')));
check(TG + ' S7 right after WRITE the display shows the program number and its key is lit', /^b\./.test(pw.disp || '') && lit.includes('on'), {disp: pw.disp, lit, wahl: pw.sel.wahl});
const k = lit.indexOf('on'); await T.tapMk('n' + k, 300); const g = await sel(), cg = await cut();
check(TG + ' S8 the lit key → SPIEL, sound kept', g.wahl === 0 && cg === c0, {g, cg, c0});
// (h) loading another program from the library → SPIEL (MK1-34)
await toFilter(); await E(() => SYNQUENZER.loadPreset(0, 'Fix Prog')); await sleep(500); const h = await sel();
check(TG + ' S9 loading a program (library) → SPIEL', h.wahl === 0, h);
await p.screenshot({path: OUT + 'fix-spiel-' + TG + '.png'});
check(TG + ' S10 no console errors', errs.length === 0, errs);
await T.br.close(); done();
