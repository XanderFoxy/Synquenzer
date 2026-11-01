// V6A in der Mod-Übersicht (K1, A7): der Zustand, den die Spur gerade spielt, hat je Wert eine Zeile „◆ Szene 2 · Cutoff 2,4 kHz → 400 Hz“;
// ✕ nimmt den Wert aus dem Zustand (Undo 'clip'); Tipp springt zum Regler; ohne Zustand keine Zeile (alte Projekte unverändert)
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p);
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, o = {};
  setP(t, 'cutoff', 2400);
  o.none = Q.k1Mods(t).filter(e => e.kind === 'st').length;
  Q.v6aSetState(t, 1, {p: {cutoff: 400, res: .5}, fx: {vol: .5}});
  Q.launchScene(1); if (!R.playing) Q.play(); await new Promise(r => setTimeout(r, 600));
  o.rows = Q.k1Mods(t).filter(e => e.kind === 'st').map(e => e.src + ' | ' + e.dst + ' | ' + e.amt);
  Q.selectTrack(t); Q.openEditor(); o.jump = Q.k1Jump(t, 'st:cutoff');
  o.del = Q.k1Del(t, 'st:res'); o.after = Q.v6aState(t, 1); o.top = UNDO[UNDO.length - 1].kind;
  Q.undo(); o.back = Q.v6aState(t, 1);
  Q.stop(); return o;
}, t);
console.log(JSON.stringify(r));
ok('K1-1 ohne Zustand: keine ◆-Zeile', r.none === 0);
ok('K1-2 je Wert eine Zeile mit Grund → Zustand', r.rows.length === 3 && r.rows.some(x => /◆ Szene 2 \| Cutoff \| .* → 400 Hz/.test(x)) && r.rows.some(x => /Lautstärke/.test(x)), r.rows.join(' ; '));
ok('K1-3 Tipp springt zum Regler (Filter-Seite)', !!r.jump, String(r.jump));
ok('K1-4 ✕ nimmt Resonanz aus dem Zustand (Undo clip), ↶ holt sie zurück', r.del && !('res' in r.after.p) && r.after.p.cutoff === 400 && r.top === 'clip' && r.back.p.res === .5);
ok('K1-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
