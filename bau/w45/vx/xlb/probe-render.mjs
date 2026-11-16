// XLB: Video-Ton (Offline-Render, vvRenderAudio) mit einer Zusatzspur. 12 Spuren × 10 Szenen, nur Spur 11 hat in Szene 9 einen Clip,
// der Song spielt ihn 2 Takte. Erwartet: hörbar, Zeitstrahl kennt Spur 11 / Szene 9; Spur 11 stumm → still; danach live wieder alle Ketten.
// Aufruf: node probe-render.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done, null, {timeout: 120000});
const r = await p.evaluate(async () => {
  switchProject(newProject(), {first: true});
  while (NS() < 10) SYNQUENZER.xl.addScene(true);
  while (NT() < 12) addTrack();
  for (const t of S.tracks) t.clips.fill(null);
  S.tracks[10].clips[8] = normClip({len: 1, key: {root: 0, scale: 'ionian'}, notes: [0, 1, 2, 3].map(k => ({t: k, d: .8, n: 60 + k * 2, v: .9}))}, 'synth', S.key);
  clipChanged(10, 8);
  const lanes = Array.from({length: NT()}, () => []); lanes[10] = [{bar: 0, slot: 8}];
  S.song = normSong({bars: 2, lanes}, S.key, NT()); songChanged();
  ensureAudio(); let w = 0; while (SynthHost.state !== 'ready' && w < 100) { await new Promise(r => setTimeout(r, 100)); w++; }
  const peak = r => { let m = 0; for (const d of r.ch) for (let k = 0; k < d.length; k++) { const v = Math.abs(d[k]); if (v > m) m = v; } return +m.toFixed(4); };
  const r1 = await vvRenderAudio({range: {a: 0, b: 2}});
  const o1 = {peak: peak(r1), dur: +r1.dur.toFixed(2), tl11: r1.tl.filter(x => x.i === 10 && x.s === 8).length, notes11: (r1.log || []).filter(x => x && x.track === 10).length, mtr: !!r1.mtr};
  setMute(10, true);
  const r2 = await vvRenderAudio({range: {a: 0, b: 2}});
  const o2 = {peak: peak(r2)};
  setMute(10, false);
  await new Promise(r => setTimeout(r, 300));
  return {o1, o2, c10: !!AU.tracks[10] && AU.ctx === AU.tracks[10].lfoPitch.context, lazy: SYNQUENZER.xl.lazy().chains.map(Number).join(''), nt: NT()};
}).catch(e => ({fehler: String(e)}));
r.errs = errs;
console.log(JSON.stringify(r));
const ok = r.o1 && r.o1.peak > 0.01 && r.o1.tl11 > 0 && r.o1.notes11 > 0 && r.o2.peak < 0.001 && r.c10 && !errs.length;
console.log(ok ? 'OK Video-Ton mit Spur 11 (Szene 9) hörbar, stumm = still, Kette von Spur 11 danach live' : 'FEHLER Video-Ton');
await b.close();
