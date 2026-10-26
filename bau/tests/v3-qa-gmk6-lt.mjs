// QA G-MK6: main-thread blocking per UI action while the song plays (longtask, 10-ms heartbeat stall, late notes)
import {open, sleep, check, done} from './v3-qa-gmk6-tl.mjs';
import {setupProject} from './v3-qa-gmk6-setup.mjs';
const FILE = process.argv[2]; const MK6 = !/base/.test(FILE || '');
const T = await open(Object.assign({viewport: {width: 390, height: 844}}, FILE ? {file: FILE} : {})); const {p, E, errs} = T;
T.knobList = async (k, re) => { await T.tapMk(k, 300); await E(src => { const rx = new RegExp(src); const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => rx.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }, re.source); await sleep(150); const r = await T.tapPop(re); await sleep(650); return r ? 'ok' : 'no ' + re; };
console.log('version', await E(() => SYNQUENZER.version));
await setupProject(E);
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(1500);
await E(() => { const Q = window.__m = {lt: [], st: [], late: []}; new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); let last = performance.now(); setInterval(() => { const t = performance.now(); if (t - last > 50) Q.st.push([Math.round(t - last), Math.round(last)]); last = t; }, 10);
  const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) Q.late.push([+(d * 1000).toFixed(1), e.track]); } } catch (_) {} return r; }; });
const act = async (name, fn) => { await sleep(1200); await E(() => { const Q = window.__m; Q.lt.length = 0; Q.st.length = 0; Q.late.length = 0; }); const t0 = Date.now(); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(900); const m = await E(() => JSON.parse(JSON.stringify(window.__m))); console.log(name.padEnd(56), 'longtasks', JSON.stringify(m.lt.map(x => x[0])), 'stalls', JSON.stringify(m.st.map(x => x[0])), 'late', JSON.stringify(m.late), '·', JSON.stringify(r).slice(0, 60)); return m; };
const R = {};
R.ed = await act('open editor pad (MS 2000)', async () => { await T.openEd(2); return (await T.panel()).fmt; });
R.eq = await act('EDIT-WAHL 2 → 7 EQ (list)', () => T.w2(/^7 EQ/));
if (MK6) {
  R.seq = await act('EDIT-WAHL 2 → 11 SEQ (list)', () => T.w2(/^11 SEQ/));
  R.zl = await act('ZIEL list open + pick PAN', () => T.knobList('k2', /^PAN/));
  R.steps = await act('matrix row → SCHRITTE', async () => { const k = await E(() => [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent)).dataset.k); await T.tapMk(k, 300); return !!(await T.steps()); });
  R.paint = await act('paint 8 columns (touch)', async () => { const I = await T.steps(); const a = I.cols[0], b = I.cols[7]; await T.down(a.x + 5, a.y + 10); await T.glide(a.x + 5, a.y + 10, b.x + b.w - 5, b.y + 10, 14, 25); await T.up(); return 'ok'; });
  R.tab = await act('SEQ 2 tab', async () => { await T.tapMk('s1', 300); return 'ok'; });
  R.back = await act('◂ GERÄT', async () => { await T.tapMk('back', 300); return 'ok'; });
  R.tools = await act('SHIFT + 5 tools pop', async () => { await T.tapMk('shift', 250); await T.tapMk('n4', 400); await T.closePop(); return 'ok'; });
  R.rec = await act('● AUFN. arm (from SCHRITTE)', async () => { const k = await E(() => [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent))?.dataset.k); if (k) await T.tapMk(k, 400); await T.tapMk('rec', 400); return (await T.panel()).rec; });
  R.recCut = await act('AUFN.: CUTOFF drag (records)', async () => { await T.sweep('k0', -60, 40, 30); let n = 0; for (let k = 0; k < 30 && !n; k++) { await sleep(150); n = await E(() => AU.synth[2].mkRecN || 0); } return n; });
}
R.close = await act('close editor ✕', async () => { await T.closePop(); return !!(await T.tapTxt('#synthSheet button', /^✕$/)); });
console.log('errs', JSON.stringify(errs));
await T.br.close();
