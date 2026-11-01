// Musiker: 16 Takte singen und am Ende wie gewohnt ● tippen (kurz vor/auf dem Taktstrich nach Takt 16).
// node n4-vs-l-mus-end16.mjs <mel 1|0|-> <tapBeat (absolut, Gesang ab 4)> <len auto|16> [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, NEW, sleep, tapSel, undoN} from './n4-vs-l-mus-h.mjs';
const melA = process.argv[2] || '1', tapB = +(process.argv[3] || 67.9), len = process.argv[4] || 'auto', file = process.argv[5] || NEW;
const BPM = 112;
const H = await start(file, BPM, {demo: true, touch: true, mel: melA === '-' ? null : melA === '1', len: len === 'auto' ? 'auto' : +len}), p = H.p;
await p.evaluate(() => { window.__tt = []; const t = document.getElementById('toast'); new MutationObserver(() => { const x = t.textContent.trim(); window.__tt.push([Math.round(performance.now()), x]); }).observe(t, {subtree: true, childList: true, characterData: true}); });
await p.evaluate(() => { window.__rs = []; let last = ''; setInterval(() => { const r = SYNQUENZER.runtime().rec, c = SYNQUENZER.vsClock(); const s = r.state + '|' + r.startBeat; if (s !== last) { last = s; window.__rs.push([+((c.now - c.outLat - c.start) / c.spb).toFixed(2), r.state, r.startBeat]); } }, 10); });
const k1 = await prep(H, sing(melN(16), BPM));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
const u0 = await undoN(p);
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k1, 4);
await waitBeat(p, Math.abs(tapB)); const tStop = await p.evaluate(() => Math.round(performance.now()));
const before = await p.evaluate(() => SYNQUENZER.runtime().rec.state);
if (tapB > 0) await tapSel(H, '#bRec');
await sleep(60); const after = await p.evaluate(() => { const r = SYNQUENZER.runtime().rec; return {state: r.state, startBeat: r.startBeat}; });
console.log(`● Tipp bei Schlag ${tapB} (Ende der 16 Takte = 68): Zustand vorher ${before}, nachher ${JSON.stringify(after)}`);
await waitBeat(p, 71.0); await idle(p); await sleep(400);
const r = await stInfo(p, 0);
console.log('Ergebnis:', JSON.stringify({stimme: r.st, len: r.len, sec: r.audio && +(r.audio.out - r.audio.in).toFixed(3), mel: r.mel, undo: [u0, await undoN(p)], rec: await p.evaluate(() => SYNQUENZER.runtime().rec.state), sheet: await p.evaluate(() => !!document.querySelector('.vsres'))}));
console.log('Meldungen (ms ab ●):', JSON.stringify((await p.evaluate(() => window.__tt)).filter(x => x[0] >= tStop - 50).map(x => [x[0] - tStop, x[1]])));
console.log('Aufnahme-Zustände [Schlag, Zustand, Start]:', JSON.stringify((await p.evaluate(() => window.__rs)).slice(-6)));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
console.log('nach ■ Zustand', await p.evaluate(() => SYNQUENZER.runtime().rec.state), '| Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
