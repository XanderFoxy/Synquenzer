// VV4-05: an 20 Zeitpunkten sind im Video genau die Tasten hell bzw. gedrückt, die die App beim selben Songschlag zeigt (20/20);
// dazu die Träger-Anzeige (Name, Verschiebung, Ziel-Tonart). App: TRANSPONIEREN (die Tastatur zeigt Tonart und Träger)
import { open, songWithChords, report } from './lib.mjs';
const {b, p, errs} = await open();
await songWithChords(p, false);
await p.evaluate(() => { setKbMode('transpose'); SYNQUENZER.songPlay(0); });
const res = {checks: {}, pts: []};
const t0 = Date.now();
while (res.pts.length < 20 && Date.now() - t0 < 40000) {
  await p.waitForTimeout(620 + Math.random() * 200);
  const o = await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => {
    const sb = songBeatOf(audBeat() - (AU.outLat || 0)), kb = [...KB.byNote];
    const app = {lt: kb.filter(([n, k]) => k.el.classList.contains('lt')).map(x => x[0]), ink: kb.filter(([n, k]) => k.el.classList.contains('inkey')).map(x => x[0]),
      ton: kb.filter(([n, k]) => k.el.classList.contains('tonic')).map(x => x[0]), val: EL.carVal.textContent, sh: EL.carShift.textContent, tgt: EL.carTgt.textContent};
    const v = SYNQUENZER.vvAppKbAtBeat(sb); r({sb, app, vid: {lt: v.pressed, ink: v.lit, val: v.readout.val, sh: v.readout.shift, tgt: v.readout.tgt}, near: S.song.carrier.some(c => Math.abs(c.beat - sb) < .35) || Math.abs(sb % 32) < .35});
  }))));
  if (o.sb == null || o.near) continue;   // right at a Träger change the app paints one frame later: not a fair point
  const ok = JSON.stringify(o.app.lt) === JSON.stringify(o.vid.lt) && JSON.stringify(o.app.ink) === JSON.stringify(o.vid.ink) && o.app.val === o.vid.val && o.app.sh === o.vid.sh && (o.app.tgt || '').replace(/^· /, '') === (o.vid.tgt || '').replace(/^· /, '');
  res.pts.push(Object.assign(o, {ok}));
}
const n = res.pts.filter(x => x.ok).length;
res.score = n + '/' + res.pts.length;
res.checks['20/20'] = res.pts.length === 20 && n === 20;
res.checks.mitTraeger = res.pts.some(x => x.app.lt.length) && res.pts.some(x => x.app.val !== 'ORIGINAL');
res.checks.konsole = errs.length === 0; res.errs = errs;
const bad = report('vv4a-kb-live', res);
console.log(res.score, JSON.stringify(res.pts.filter(x => !x.ok).slice(0, 3)));
console.log(res.pts.map(x => x.sb.toFixed(2) + ':' + x.app.val + x.app.sh + '[' + x.app.lt + ']').join(' '));
await b.close(); process.exit(bad ? 1 : 0);
