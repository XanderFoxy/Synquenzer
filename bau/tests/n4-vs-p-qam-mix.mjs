// QA musiker: Demo-Projekt, ● REC mit 🎤 über Szene 1 (vorhandene Clips), dann Mix hören: Lautheit je Spur, Master, Master-Kompressor
// node n4-vs-p-qam-mix.mjs [rmsDb] [app...]
import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, mysing} from './n4-vs-p-qa-h.mjs';
const lv = +(process.argv[2] || -28), files = process.argv.slice(3).length ? process.argv.slice(3) : [BASE, APP];
for (const f of files) {
  const H = await open({file: f, viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); });
  const sr = await micOn(p, 'wired');
  const bpm = await p.evaluate(() => S.bpm), spb = 60 / bpm;
  await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(5, 0); });
  const y = mysing(4 * 4 * spb + 1, sr, lv, 3).y;
  await p.evaluate(([b]) => { SYNQUENZER.launchScene(0); }, [b64(y)]);
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing);
  await p.evaluate(([b]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 4 + 16 + 1.5); await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(600);
  const info = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; return {st, tracks: S.tracks.map((t, i) => t.name + ':' + t.clips.map(c => c ? (c.audio ? 'A' + c.len : c.len) : '-').join(''))}; });
  console.log(await p.evaluate(() => SYNQUENZER.version), JSON.stringify(info));
  if (await p.evaluate(() => !!SYNQUENZER.vpWait)) await p.evaluate(() => SYNQUENZER.vpWait());
  // Mix: alle Spuren + Master mitschneiden, Master-Reduktion abtasten
  const run = async (muteVox) => {
    await p.evaluate(([mv]) => { const st = SYNQUENZER.tkInfo().stimme; setMute(st, !!mv); for (let i = 0; i < NT(); i++) if (AU.tracks[i]) window.__cap('t' + i, AU.tracks[i].cut); window.__cap('M', AU.M.ceil);
      window.__gr = []; window.__grT = setInterval(() => window.__gr.push([AU.M.glue.reduction, AU.M.lim.reduction]), 20); SYNQUENZER.launchScene(0); }, [muteVox]);
    await sleep(18000);
    const o = await p.evaluate(() => { clearInterval(window.__grT); const o = {}; for (let i = 0; i < NT(); i++) if (window.__caps['t' + i]) { const s = window.__capStat('t' + i, 1); if (s.lufs != null && isFinite(s.lufs)) o[i + ':' + (S.tracks[i].stimme ? 'STIMME' : S.tracks[i].sound.name)] = [s.lufs, s.tp]; }
      const m = window.__capStat('M', 1), g = window.__gr.slice(50), gl = g.map(x => x[0]), li = g.map(x => x[1]);
      const st = a => { const s = a.slice().sort((x, y) => x - y); return {mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), min: +s[0].toFixed(2), p05: +s[Math.floor(s.length * .05)].toFixed(2)}; };
      return {tracks: o, master: [m.lufs, m.tp], glue: st(gl), lim: st(li)}; });
    await p.evaluate(() => SYNQUENZER.stop()); await sleep(500); return o;
  };
  const a = await run(true), b = await run(false);
  console.log(' Stimme stumm :', JSON.stringify(a));
  console.log(' Stimme an    :', JSON.stringify(b));
  console.log(' Konsole:', JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
