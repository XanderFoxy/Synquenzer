// G-MK1-gruppe-fix proofs: MS 2000 editor closes like VA (P + L, touch, real font); one build per open; way back to SPIEL
import {open, sleep, OUT, check, done} from './v3-qa-gmk1-tl.mjs';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad', FONTS = 'file://' + SP + '/dirigent-wt/fonts/';
const L = process.argv[2] === 'L', TAGV = L ? 'L' : 'P';
const T = await open({file: SP + '/mk-wt-before-gmk1fix.html', viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
const font = await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
  await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"', '700 10px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready;
  return [...document.fonts].some(x => x.family.includes('Barlow') && x.status === 'loaded'); }, FONTS);
check(TAGV + ' F0 real font (Barlow Semi Condensed) loaded', font, font);
const st = () => E(() => { const s = document.getElementById('synthSheet'); return {editor: SYNQUENZER.runtime().editor, cls: s.className, disp: getComputedStyle(s).display}; });
const closed = s => s.editor == null && !/\bopen\b/.test(s.cls) && s.disp === 'none';
const sceneCenters = () => E(() => [...document.querySelectorAll('button.scn')].filter(b => b.getClientRects().length).slice(0, 4).map(b => { const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
const hits = c => E(c => c.map(([x, y]) => { const e = document.elementFromPoint(x, y); const b = e && e.closest('button'); return b ? (b.classList.contains('scn') ? 'scene' : b.textContent.trim().slice(0, 8)) : (e && e.tagName); }), c);
await E(() => { window.__nb = 0; window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
// VA close as reference
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
let x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 500); const va = await st();
check(TAGV + ' D1a VA editor: ✕ closes (reference)', closed(va), va);
// MS 2000 via the header key, then ✕ (touch)
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const sc = await sceneCenters();
await E(() => { mkLoad(); const b = MKUI.build; window.__nb = 0; if (!MKUI.__w) { MKUI.__w = 1; MKUI.build = function () { window.__nb++; return b.apply(this, arguments); }; } });
await T.tapTxt('button', /^MS ?2000$/); await sleep(700);
const mkOpen = await st(), nbSwitch = await E(() => window.__nb);
check(TAGV + ' D1b header MS 2000: editor open with the panel', mkOpen.editor === 'synth' && /open/.test(mkOpen.cls) && await E(() => !!document.querySelector('#synthSheet .mkpg .mkbody')), {mkOpen, builds: nbSwitch});
await E(() => { window.__nb = 0; });
x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 0); await sleep(150);
const c1 = await st(), h1 = await hits(sc); await sleep(2000); const c2 = await st(), h2 = await hits(sc), nbClose = await E(() => window.__nb);
check(TAGV + ' D1c MS 2000 editor: ✕ closes it (sheet hidden, 150 ms and 2 s later), no panel build on close', closed(c1) && closed(c2) && nbClose === 0, {c1, c2, nbClose});
check(TAGV + ' D1d after ✕ the scene keys ▶1–▶4 are hit (no header button over them)', h1.every(h => h === 'scene') && h2.every(h => h === 'scene'), {h1, h2});
// ▶4 by touch: scene 4 and no undo/redo, the engine stays MS 2000
const u0 = await T.undoN(), eng0 = await E(() => SYNQUENZER.getSound(0).engine);
await T.tap(sc[3][0], sc[3][1], 400);
const rt = await E(() => { const r = SYNQUENZER.runtime(); return {sel: r.selected, slots: r.slots, queued: r.queued, playing: r.playing}; });
const u1 = await T.undoN(), eng1 = await E(() => SYNQUENZER.getSound(0).engine);
check(TAGV + ' D1e a tap on ▶4 after ✕ starts scene 4 (no undo/redo, engine unchanged)', u1 === u0 && eng1 === eng0 && eng1 === 'mk' && (rt.sel.scene === 3 || rt.slots.some(s => s === 3) || rt.queued.some(q => q && q.slot === 3)), {rt, u0, u1, eng0, eng1});
await E(() => SYNQUENZER.stop && SYNQUENZER.stop()); await sleep(300);
// API close + reopen-then-✕
await E(() => SYNQUENZER.openEditor()); await sleep(500); await E(() => SYNQUENZER.closeEditor()); await sleep(500); const c3 = await st();
await E(() => SYNQUENZER.openEditor()); await sleep(500); x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 600); const c4 = await st();
check(TAGV + ' D1f closeEditor() and reopen-then-✕ close the MS 2000 editor', closed(c3) && closed(c4), {c3, c4});
// one build per open, also while playing; no longtask > 50 ms
await E(() => { SYNQUENZER.launchScene(0); }); await sleep(1500);
await E(() => { window.__nb = 0; window.__lt = []; });
const tOpen = await E(() => { const t = performance.now(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); return +(performance.now() - t).toFixed(1); }); await sleep(900);
const nbOpen = await E(() => window.__nb), lt = await E(() => window.__lt.slice()), pi = await T.panel();
check(TAGV + ' D1g opening the MS 2000 editor while playing: 1 panel build, no longtask > 50 ms', nbOpen === 1 && !lt.some(d => d > 50), {nbOpen, lt, syncMs: tOpen, fmt: pi.fmt, scale: pi.scale});
const sz = await E(() => { const pg = document.querySelector('#synthSheet .mkpg'); const r = pg.getBoundingClientRect(); return {now: [Math.round(r.width), Math.round(r.height)], built: pg._mkSz.map(Math.round)}; });
check(TAGV + ' D1h the panel is built for the page size after the opening animation', Math.abs(sz.now[0] - sz.built[0]) + Math.abs(sz.now[1] - sz.built[1]) <= 2, sz);
// the sound browser over an MS 2000 editor: the editor stays hidden; back opens it again
await T.tapSel('#synthSheet .pv'); await sleep(700);
const br1 = await E(() => ({ed: SYNQUENZER.runtime().editor, syn: document.getElementById('synthSheet').classList.contains('open'), snd: document.getElementById('sndSheet').classList.contains('open')}));
await sleep(600); const br2 = await E(() => ({syn: document.getElementById('synthSheet').classList.contains('open')}));
check(TAGV + ' D1i sound browser from the MS 2000 editor: the editor sheet stays hidden', br1.ed === 'browser' && !br1.syn && br1.snd && !br2.syn, {br1, br2});
await E(() => { SYNQUENZER.closeEditor(); }); await sleep(400);
await E(() => SYNQUENZER.stop && SYNQUENZER.stop()); await sleep(200);
// rotation with the MS 2000 editor open: rebuilt once for the new frame
await E(() => SYNQUENZER.openEditor()); await sleep(600); await E(() => { window.__nb = 0; });
await p.setViewportSize(L ? {width: 428, height: 926} : {width: 926, height: 428}); await sleep(900);
const rot = await T.panel(), nbRot = await E(() => window.__nb);
check(TAGV + ' D1j rotation with the MS 2000 editor open: rebuilt for the new frame, at most 2 builds', nbRot >= 1 && nbRot <= 2 && rot.fmt === (L ? 'voll-hoch' : 'voll-quer'), {nbRot, fmt: rot.fmt, scale: rot.scale});
await p.setViewportSize(L ? {width: 926, height: 428} : {width: 428, height: 926}); await sleep(900);
await E(() => SYNQUENZER.closeEditor()); await sleep(300);
// FM and WT editors close as before
for (const eng of ['fm', 'wt']) { await E(e => { SYNQUENZER.setEngine(1, e); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }, eng); await sleep(500); x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 500); const s = await st(); check(TAGV + ' D1k ' + eng + ' editor: ✕ closes', closed(s), s); }
await T.shot && 0;
await p.screenshot({path: OUT + 'fix-closed-' + TAGV + '.png'});
console.log('errs', errs);
await T.br.close(); done();
