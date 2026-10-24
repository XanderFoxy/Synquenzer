// Independent repro: FANG TEIL with chords played by hand (TRANSPONIEREN, keyOn = same path as the on-screen keyboard)
import { open } from './v3-qa-v2d-lib.mjs';
const {b, p, E, errs, waitBeat} = await open({width: 390, height: 844}, true);
await E(() => { window.__press = []; window.__at = (x, fn) => new Promise(r => { const iv = setInterval(() => { const a = audBeat(); if (a >= x) { clearInterval(iv); fn(a); r(); } }, 1); }); });
const info = await E(() => ({outLat: AU.outLat, devLat: AU.devLat, graphLat: AU.graphLat, gather: S.settings.harmony.gatherMs, change: S.settings.harmony.change}));
console.log('audio', JSON.stringify(info));
const cases = [
  {name: 'case 4 on time', seq: ['F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'], early: 0, tap: 33.2, want: {Eb: 8, period: 4, len: 4, chords: 'Am F C G'}},
  {name: 'case 4, 30 ms early', seq: ['F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am'], early: .06, tap: 33.2, want: {Eb: 8, period: 4, len: 4, chords: 'Am F C G'}},
  {name: 'case 9 on time', seq: ['F', 'C', 'Am', 'F', 'C', 'Am'], early: 0, tap: 25.2, want: {Eb: 6, period: 3, len: 3, chords: 'Am F C'}},
];
for (const c of cases) {
  await E(c => { const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'}; Q.stop(); Q.newProject({init: true}); Q.setBpm(120);
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .5, n: 45, v: .8}, {t: 2, d: .5, n: 45, v: .8}]});
    Q.setKbMode('transpose'); window.__press = [];
    const ch = {Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62]}; let cur = null;
    const pl = n => { if (cur) cur.forEach(k => Q.keyOff(k)); cur = ch[n]; cur.forEach(k => Q.keyOn(k)); };
    pl('Am');
    setTimeout(() => { launch(0, 0); Q.play();
      c.seq.forEach((n, k) => __at((k + 1) * 4 - c.early, a => { window.__press.push(+a.toFixed(3) + ':' + n); pl(n); }));
    }, 300);
    return 1; }, c);
  await p.waitForTimeout(400);
  await p.waitForFunction(x => audBeat() >= x, c.tap, {polling: 2, timeout: 60000});
  await p.tap('#bFang');                                                   // the real button
  await p.waitForTimeout(200);
  const r = await E(() => { const fp = window.SYNQUENZER.fangPart(); const tl = [...document.querySelectorAll('.pop.fsheet .fs-b')].map(x => x.textContent).filter(x => x !== '·');
    return {press: window.__press.join(' '), capc: window.SYNQUENZER.memory().capc.map(e => e.beat.toFixed(3) + ':' + (e.target ? e.target.root + (e.target.quality || '') : 'O')).join(' '),
      fp: fp && {len: fp.len, end: fp.end, period: fp.period, chords: fp.chords.ch.map(x => x.b + ':' + (x.tg ? x.tg.name : 'O')).join(' '), endText: fp.endText}, tl: tl.join(' ')}; });
  console.log('\n== ' + c.name);
  console.log(' presses (audible beat):', r.press);
  console.log(' CAPC:', r.capc);
  console.log(' fangPart:', JSON.stringify(r.fp));
  console.log(' sheet mini timeline:', r.tl);
  const ok = r.fp && r.fp.end.bar === c.want.Eb && r.fp.period === c.want.period && r.fp.len === c.want.len;
  console.log((ok ? ' PASS' : ' FAIL') + ' expected Taktstrich ' + (c.want.Eb + 1) + ', period ' + c.want.period + ', len ' + c.want.len + ' (' + c.want.chords + ')');
  // what the loop plays: bass notes for the next two parts
  await E(() => window.SYNQUENZER.clearLog());
  const L = r.fp ? r.fp.len : 4, from = Math.ceil(c.tap / 4) * 4;
  await waitBeat(from + Math.min(L, 4) * 4 + 1, 60000);
  const bass = await E(() => window.SYNQUENZER.noteLog(500).filter(n => n.track === 0 && n.beat != null).map(n => +n.beat.toFixed(3) + '→' + n.out));
  console.log(' loop bass (beat→midi):', bass.join(' '));
  await E(() => { window.SYNQUENZER.fangDiscard(); if (UI.pop) { UI.fangKeep = true; closePop(); } window.SYNQUENZER.stop(); });
}
console.log('\nconsole errors', errs.length, errs.slice(0, 3));
await b.close();
