// QA VS-P-01: drei Takes −36/−28/−20 dBFS RMS über das echte Mikro (Attrappe, ● REC mit 🎤) → Ausgang STIMME-Spur −16 ± 1,5 LUFS
import {open, micOn, sleep, APP, mysing, recMic} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP, SIG = process.argv[3] || 'my';
const res = [];
for (const lv of [-36, -28, -20]) {
  const H = await open({file: FILE}), p = H.p, sr = await micOn(p, 'wired');
  const y = SIG === 'low' ? mysing(9.5, sr, lv, 7 + lv, {oct: 1}).y : mysing(9.5, sr, lv, 3 - lv).y;
  const tk = await recMic(p, y, {len: 4});
  await p.evaluate(() => SYNQUENZER.vpWait && SYNQUENZER.vpWait());
  const raw = await p.evaluate(id => { const b = tkBuffer(id); return {lufs: window.__L.lufs([b.getChannelData(0)], b.sampleRate).lufs, sec: b.duration}; }, tk.id);
  await p.evaluate(([st]) => { window.__cap('v', AU.tracks[st].cut); SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1; }, [tk.st]);
  await sleep(16500);
  const o = await p.evaluate(() => window.__capStat('v', 0.3)); await p.evaluate(() => SYNQUENZER.stop());
  const vol = await p.evaluate(st => S.tracks[st].sound.fx.vol, tk.st);
  res.push({lv, raw: raw.lufs, out: o.lufs, tp: o.tp, vol, errs: H.errs.slice(0, 2)});
  console.log(`Mikro ${lv} dBFS RMS → Take ${raw.lufs} LUFS (${raw.sec.toFixed(1)} s) → Ausgang STIMME ${o.lufs} LUFS, TP ${o.tp} dBTP, Pegel ${vol}`, H.errs.length ? 'FEHLER ' + H.errs.slice(0, 2) : '');
  await H.br.close();
}
const bad = res.filter(r => !(Math.abs(r.out + 16) <= 1.5));
console.log(bad.length ? 'VS-P-01 ✗ ' + JSON.stringify(bad) : 'VS-P-01 ✓');
