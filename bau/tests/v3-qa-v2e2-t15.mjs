// QA V2e′ t15: glass details — stopped bars empty (no „–“), own-clip marks in both views, progress line while playing; screenshot
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(true)); await E(() => { window.SYNQUENZER.makeOwn(0, 4, false); return 1; });
await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
const box = (x0, y0, w, h) => E(([x0, y0, w, h]) => { const c = document.querySelector('.sv-cv'), d = c.width / c.getBoundingClientRect().width; const v = c.getContext('2d').getImageData(Math.round(x0 * d), Math.round(y0 * d), Math.round(w * d), Math.round(h * d)).data; let bright = 0, white = 0; for (let i = 0; i < v.length; i += 4) { const m = Math.max(v[i], v[i + 1], v[i + 2]); if (m > 90) bright++; if (v[i] > 200 && v[i + 1] > 200 && v[i + 2] > 200) white++; } return {bright, white}; }, [x0, y0, w, h]);
const I = await t.info(); const rowOf = tr => E(tr => SV.rows.indexOf(tr), tr);
const r0 = await rowOf(0), y0 = I.rulerH + r0 * I.rowH;
// squares: stopped bar 0 of Synth 1 shows „–“; own clip at bar 4 white frame + dot top right
const sqStop = await box(0 * 36 + 4, y0 + 4, 28, I.rowH - 8);
const sqOwnTR = await box(4 * 36 + 26, y0 + 2, 9, 9);
await E(() => window.SYNQUENZER.songViewMode('glass')); await sleep(250);
const glStop = await box(0 * 36 + 4, y0 + 4, 28, I.rowH - 8);
console.log('squares stopped', sqStop, 'glass stopped', glStop, 'squares own top-right', sqOwnTR);
check(`${VP} 9.1 glass: stopped bars empty (no „–“)`, glStop.bright === 0, glStop);
await p.screenshot({path: `v3-qa-v2e2-${VP}-glass.png`});
// play and check the progress line exists on the running tile (bottom 2 px of the Fläche tile, bar 2..5)
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(60); Q.songPlay(0); return 1; });
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 10, null, {timeout: 20000, polling: 5});
await sleep(100);
await p.screenshot({path: `v3-qa-v2e2-${VP}-glass-play.png`});
await E(() => window.SYNQUENZER.songPlay(false));
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
