// Independent repro: does ✕ close the editor of an MS 2000 track? (args: file, P|L)
import {chromium} from 'playwright';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const file = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const L = process.argv[3] === 'L';
const shot = process.argv[4];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await br.newContext({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file);
await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000});
await sleep(800);
const E = (f, a) => p.evaluate(f, a);
const st = () => E(() => { const s = document.getElementById('synthSheet'); const r = s && s.getBoundingClientRect(); return {ver: SYNQUENZER.version, editor: !!SYNQUENZER.runtime().editor, cls: s && s.className, disp: s && getComputedStyle(s).display, h: r && Math.round(r.height)}; });
const btn = re => E(([src]) => { const rx = new RegExp(src); const e = [...document.querySelectorAll('button')].filter(b => b.getClientRects().length && rx.test(b.textContent.trim()))[0]; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: e.textContent.trim()}; }, [re.source]);
const tap = async (x, y) => { await p.touchscreen.tap(x, y); };
// scene key centres while main view is visible
const scn = await E(() => [...document.querySelectorAll('button.scn')].filter(b => b.getClientRects().length).slice(0, 4).map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim().slice(0, 3), r.x + r.width / 2, r.y + r.height / 2]; }));
console.log('scene keys', JSON.stringify(scn));
const under = () => E(sc => sc.map(([n, x, y]) => { const e = document.elementFromPoint(x, y); const b = e && e.closest('button'); return n + '→' + (b ? (b.classList.contains('scn') ? 'scene' : '"' + b.textContent.trim().slice(0, 8) + '"') : e && e.tagName); }).join(' | '), scn);
// 1) VA track: open, ✕
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
console.log('VA open        ', JSON.stringify(await st()));
let x = await btn(/^✕$/); await tap(x.x, x.y); await sleep(800);
console.log('VA after ✕     ', JSON.stringify(await st()), 'under:', await under());
// 2) open, switch engine via header key "MS 2000", ✕
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const mkb = await btn(/^MS ?2000$/); console.log('MS2000 key', JSON.stringify(mkb));
await tap(mkb.x, mkb.y); await sleep(800);
console.log('MK open        ', JSON.stringify(await st()), 'engine', await E(() => { const pr = SYNQUENZER.project(); const P = pr.project || pr; return P.tracks[0].synth && (P.tracks[0].synth.engine || P.tracks[0].engine); }));
x = await btn(/^✕$/); await tap(x.x, x.y); await sleep(1000);
const s1 = await st(); console.log('MK after ✕     ', JSON.stringify(s1), 'under:', await under());
if (shot) await p.screenshot({path: shot});
await sleep(2000); console.log('MK +2s         ', JSON.stringify(await st()), 'under:', await under());
x = await btn(/^✕$/); if (x) { await tap(x.x, x.y); await sleep(800); }
console.log('MK after 2nd ✕ ', JSON.stringify(await st()));
await E(() => SYNQUENZER.closeEditor()); await sleep(800);
console.log('MK closeEditor ', JSON.stringify(await st()), 'under:', await under());
// 3) build count per open/close of synth editor
const n = await E(async () => { if (typeof buildSynthEd !== 'function') return 'no global buildSynthEd'; return 'global exists'; });
console.log('buildSynthEd:', n);
console.log('errs', errs.slice(0, 5));
console.log('RESULT closes=', !/\bopen\b/.test(s1.cls) && s1.disp === 'none');
await br.close();
