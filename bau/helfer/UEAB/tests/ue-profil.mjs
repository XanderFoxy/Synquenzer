// UE-06 zweite Messart: CPU-Profiler (Abtastungen) ohne / mit 8 Übergängen – Aufruf: node ue-profil.mjs 0 bzw. 1
import { open } from './lib.mjs';
const SONG18 = {bars: 18, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {},
  marks: Array.from({length: 9}, (_, k) => ({id: 'M' + (k + 1), a: k * 2, len: 2, name: k % 2 ? 'Refrain' : 'Strophe'}))};
const {b, p} = await open({});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG18);
if (process.argv[2] !== '0') await p.evaluate(() => { for (const m of S.song.marks.slice(1)) SYNQUENZER.uePlace(['p-tom-kurz', 'p-snare-lauf'][+m.id.slice(1) % 2], m.id); });
const cdp = await p.context().newCDPSession(p);
await p.evaluate(async () => { SYNQUENZER.songPlay(0); await new Promise(r => setTimeout(r, 300)); window.__dh = window.drumHit; window.__sv = window.spawnClipVoice; window.drumHit = () => null; window.spawnClipVoice = () => null; });
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 50}); await cdp.send('Profiler.start');
await p.evaluate(() => { const b0 = R.schedBeat + 1; for (let rep = 0; rep < 40; rep++) for (let w = 0; w < 18 * 16 * 24; w++) { const a = b0 + (w % 288) * .25, e = a + .25; if (S.song.ue) ueTick(a, e); for (let i = 0; i < NT(); i++) scheduleTrack(i, a, e); if (UE.pend.length) ueFlush(); } });
const {profile} = await cdp.send('Profiler.stop');
const self = {}; const dt = profile.timeDeltas; const byId = {}; for (const n of profile.nodes) byId[n.id] = n;
const cnt = {}; for (const s of profile.samples) cnt[s] = (cnt[s] || 0) + 1;
for (const [id, c] of Object.entries(cnt)) { const n = byId[id]; const k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self[k] = (self[k] || 0) + c; }
const tot = profile.samples.length; console.log('samples', tot);
console.log(Object.entries(self).sort((x, y) => y[1] - x[1]).slice(0, 18).map(([k, v]) => k + ' ' + (100 * v / tot).toFixed(1) + '%').join('\n'));
await b.close();
