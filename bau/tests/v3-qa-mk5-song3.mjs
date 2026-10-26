// QA FP-SONG MK5 (3): song playback with lanes + melody lane through the arp; song MIDI export = clip + melody notes only;
// MIDI log (Mitschnitt) = arpLog; song ⟲ loop: two passes.
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}}); const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk');
  for (let t = 0; t < 5; t++) for (let s = 0; s < 8; s++) if (S.tracks[t] && S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  const A = o => { for (const k in o) mkSetP(0, 'arp.' + k, o[k], false); };
  Q.setBpm(200); A({on: 1, res: 1, gate: 60, ks: 1, type: 0, range: 1});
  Q.setClip(0, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});
  Q.setClip(0, 1, {len: 1, notes: [62, 65, 69].map(n => ({t: 0, d: 2, n, v: .8}))});
  await sl(200);
  const bars = Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
  const so = Q.song(); so.mel = {0: {notes: [{t: 2, n: 72, d: 1, v: .8}, {t: 2, n: 76, d: 1, v: .8}]}}; so.melodyTrack = 0; delete so.melody; Q.setSong(so);
  Q.clearLog(); ARPC.clearLog(); PERF.list.length = 0;
  Q.songPlay(0); await sl(16 * 300 + 400); Q.stop(); await sl(300);
  const nl = Q.noteLog(800).filter(e => e.track === 0);
  const arp = nl.filter(e => e.src === 'arp').map(e => [+e.beat.toFixed(2), e.out]);
  const other = nl.filter(e => e.src !== 'arp').map(e => [e.src, +e.beat.toFixed(2), e.out]);
  // song MIDI export (clip + melody notes only)
  const mid = buildMidi({mode: 'song'});
  const parse = u8 => { const a = []; for (let i = 0; i < u8.length - 2; i++) if ((u8[i] & 0xf0) === 0x90 && u8[i] === 0x90 && u8[i + 2] > 0 && u8[i + 1] >= 48 && u8[i + 1] <= 90) a.push(u8[i + 1]); return a; };
  const bytes = mid && (mid.bytes || mid.data || mid);
  const songOn = bytes && bytes.length ? parse(new Uint8Array(bytes)) : null;
  const log = buildMidiLog(); const lb = log && (log.bytes || log.data || log); const logOn = lb && lb.length ? parse(new Uint8Array(lb)) : null;
  return {bars, song: {bars: S.song.bars, mel: Object.keys(S.song.mel)}, arp, other, songOn, logOn: logOn && logOn.length, arpN: Q.arpLog(0).length, midType: mid && typeof mid, midKeys: mid && Object.keys(mid).slice(0, 5)};
});
const perBar = {}; for (const [b, n] of r.arp) { const k = Math.floor(b / 4 + 1e-6); (perBar[k] = perBar[k] || new Set()).add(n); }
console.log(JSON.stringify({bars: r.bars, song: r.song, perBar: Object.fromEntries(Object.entries(perBar).map(([k, s]) => [k, [...s].sort().join('/')])), arpBar2: r.arp.filter(x => x[0] >= 8 && x[0] < 12), other: r.other, songOn: r.songOn, logOn: r.logOn, arpN: r.arpN, mid: [r.midType, r.midKeys]}));
console.log('errs', errs.slice(0, 3));
await browser.close();
