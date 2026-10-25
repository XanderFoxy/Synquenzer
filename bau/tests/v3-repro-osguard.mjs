// Independent repro: one-scale collision guard with chromatic passing tones, real playback (noteLog)
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const exe = process.argv[2] || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + APP);
await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
await p.waitForTimeout(800);
const E = (f, a) => p.evaluate(f, a);
const defaults = await E(() => { const Q = window.SYNQUENZER; Q.stop(); Q.newProject({init: true});
  const h = S.settings.harmony; return {oneScale: h.oneScale, osAmt: h.osAmt, osPass: h.osPass, mode: h.mode, key: S.key, ver: Q.version || null}; });
console.log('defaults after newProject(init)', JSON.stringify(defaults));
const mels = {
  'C D E F F# G A': [60, 62, 64, 65, 66, 67, 69],
  'C D D# E F G A': [60, 62, 63, 64, 65, 67, 69],
  'G F# F E D C B': [67, 66, 65, 64, 62, 60, 59],
  'C D E F G A B (diatonic control)': [60, 62, 64, 65, 67, 69, 71],
};
for (const [name, seq] of Object.entries(mels)) {
  console.log('==', name);
  for (const ch of ['C', 'F', 'G', 'Am', 'Dm']) {
    const r = await E(async ([seq, ch]) => {
      const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
      Q.stop(); Q.newProject({init: true}); ensureAudio();
      const notes = seq.map((n, i) => ({t: i * .5, d: .45, n, v: .8}));
      Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes});
      Q.setChordRow('S1', {len: 1, ch: [{b: 0, tg: Q.parseChord(ch)}]});
      Q.setBpm(240);
      Q.play(); Q.launchScene(0); await sl(400); Q.clearLog(); await sl(2200);
      const log = Q.noteLog(4096).filter(e => e.track === 0 && e.src === 'clip'); Q.stop(); await sl(100);
      const m = new Map(); for (const e of log) if (!m.has(e.clipNote)) m.set(e.clipNote, e.out);
      return {n: log.length, outs: seq.map(x => m.has(x) ? m.get(x) : null), os: S.settings.harmony.oneScale};
    }, [seq, ch]);
    const o = r.outs, distinct = new Set(o).size;
    let contour = true; for (let k = 1; k < seq.length; k++) if (Math.sign(o[k] - o[k - 1]) !== Math.sign(seq[k] - seq[k - 1])) contour = false;
    console.log('  ', ch.padEnd(3), 'logN', r.n, 'out', o.join(' '), '| distinct', distinct, '| contour', contour);
  }
}
console.log('errs', errs);
await b.close();
