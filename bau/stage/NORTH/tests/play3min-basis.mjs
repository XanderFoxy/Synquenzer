// NORTH: Vergleichslauf zum 3-Minuten-Abspieltest – dasselbe 16tel-Muster über den Transport, aber mit einem Werks-Drumkit
// (ohne North). Misst nur Ausgabe-Unterläufe (playbackStats), Uhr-Drift und Konsolenfehler. Damit lässt sich trennen, ob
// Unterläufe aus der Umgebung (Headless-Chromium im Container) oder von der Drum-Engine kommen.
// Aufruf: node play3min-basis.mjs <index.html> [sek=180] [kit=808]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const [file, secArg, kitArg] = process.argv.slice(2); const SEC = +(secArg || 180), KIT = kitArg || '808';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
const r = await p.evaluate(async ([kit, sec]) => {
  const Q = SYNQUENZER; ensureAudio(); Q.loadKit(kit);
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100));
  await new Promise(r => setTimeout(r, 3000));
  const c = AU.ctx, G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 11], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95, a: 0})));
  Q.setBpm(120); Q.setClip(DRUM_T, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes}); Q.launchClip(DRUM_T, 0);
  const ps = () => c.playbackStats ? {u: c.playbackStats.underrunEvents, d: +c.playbackStats.underrunDuration.toFixed(3)} : null;
  const ps0 = ps(), w0 = performance.now(), t0 = c.currentTime; Q.play();
  await new Promise(r => setTimeout(r, sec * 1000)); Q.stop(); await new Promise(r => setTimeout(r, 500));
  const md = typeof MDS === 'object' ? MDS.st : 'keins';
  return {kit, sr: c.sampleRate, ps0, ps1: ps(), drift: +((c.currentTime - t0) - (performance.now() - w0) / 1000).toFixed(3), md};
}, [KIT, SEC]);
console.log(JSON.stringify(Object.assign({test: 'play3min-basis', file}, r, {errs: errs.slice(0, 4)})));
await b.close();
