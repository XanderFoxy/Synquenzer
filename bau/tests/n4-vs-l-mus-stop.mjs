// Musiker: Transport steht, Demo, MELODIE-Platz Szene 1 gewählt, ● antippen (Einzähler 1 Takt, Standard) → 16 Takte singen ab Schlag 0,
// AUTO schließt selbst nach 16 Takten (kein Tipp am Ende). node n4-vs-l-mus-stop.mjs <mel 1|0> [file]
import {start, sing, melN, prep, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep, tapSel, undoN, LEAD} from './n4-vs-l-mus-h.mjs';
const mel = process.argv[2] !== '0', file = process.argv[3] || NEW, BPM = 112, spb = 60 / BPM;
const H = await start(file, BPM, {demo: true, touch: true, mel}), p = H.p;
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 1}); SYNQUENZER.selectSlot(5, 0); });
await p.evaluate(() => { window.__rs = []; let last = ''; setInterval(() => { const r = SYNQUENZER.runtime().rec, c = SYNQUENZER.vsClock(); const s = r.state + '|' + r.startBeat; if (s !== last) { last = s; window.__rs.push([c.playing ? +((c.now - c.outLat - c.start) / c.spb).toFixed(2) : null, r.state, r.startBeat]); } }, 10); });
const k = await prep(H, sing(melN(16), BPM));
await tapSel(H, '#bRec'); await sleep(150);
const g = await p.evaluate(([k, lead]) => { const c = SYNQUENZER.vsClock(), t = c.start - lead, s = window.__ctx.createBufferSource(); s.buffer = window.__pre[k]; s.connect(window.__fake.bus); s.start(t); return {t, now: c.now, start: c.start, playing: c.playing}; }, [k, LEAD]);
console.log('● bei Stillstand →', JSON.stringify(await p.evaluate(() => SYNQUENZER.runtime().rec.state)), JSON.stringify(g));
await waitBeat(p, 66.5); await idle(p); await sleep(500);
const r = await stInfo(p, 0);
console.log('Ergebnis:', JSON.stringify({len: r.len, sec: r.audio && +(r.audio.out - r.audio.in).toFixed(3), at: r.audio && r.audio.at, mel: r.mel, last: r.last, undo: await undoN(p)}));
if (r.audio) { const rows = []; for (let j = 0; j < 16; j++) { const h = await sungBarHeard(p, r, 0, 4 * j, 4 * j + 4, spb); rows.push([j + 1, h.played, h.db]); } console.log('gesungene Takte fehlend:', JSON.stringify(rows.filter(x => x[1] < 0.9 || x[2] < -40))); }
console.log('Zustände:', JSON.stringify(await p.evaluate(() => window.__rs)));
console.log('Meldungen:', JSON.stringify(await p.evaluate(() => window.__toasts)), '| Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
