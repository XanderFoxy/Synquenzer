// V6A ändert Bestehendes nicht: dieselben Handlungen in 4.30.0 und V6A ergeben dasselbe – North (Drum-Engine: Info, Render), KON
// (Konsolidieren, Block), Chor-Gruppe (Info, Format), Video (Render-Zeitachse und Nachrichten s. v6a-regel28), Song-Werkzeuge.
// Dazu: KON und Teil-Kopie behalten ◆ (die Zustände hängen an den Szenen-Clips, der konsolidierte Teil spielt sie weiter).
import { open, ok, done, APP, BASE } from './v6a-lib.mjs';
async function run(file) {
  const { b, p, errs } = await open(file);
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, o = {}, J = x => JSON.parse(JSON.stringify(x == null ? null : x));
    Q.loadDemo(); await new Promise(r => setTimeout(r, 300));
    const ch = []; for (let s = 0; s < 8; s++) if (S.tracks.some(t => t && t.clips[s])) ch.push({scene: s, bars: 2}); Q.songFromChain(ch.slice(0, 3));
    o.md = J(Q.mdInfo ? Q.mdInfo() : null); if (o.md) { delete o.md.load; delete o.md.ms; delete o.md.t; }
    try { const x = await Q.mdRender([[0.05, 36, 1], [0.3, 38, .8]], {sec: .6}); o.mdR = x && x.l ? Array.from(x.l.slice(0, 2000)).reduce((a, v, k) => a + v * (k % 7 + 1), 0).toFixed(6) : J(x); } catch (e) { o.mdR = 'err ' + e.message; }
    o.kon = Q.konsolidieren(0, 1, 'Kon') ; o.kons = J(Q.kons()); o.songK = J({marks: S.song.marks, bars: S.song.bars, lanes: S.song.lanes}); o.partsK = J(S.parts.map(p => p && {name: p.name, slots: p.slots, len: p.len}));
    o.blk = Q.blockMake(2, 3, 'B'); o.blocks = J(Q.blocks().map(x => ({a: x.a, b: x.b, name: x.name})));
    Q.undo(); Q.undo();
    o.g6 = J(Q.g6pInfo ? (({choirs, fmt, nodes, solo}) => ({choirs, fmt, nodes, solo}))(Q.g6pInfo()) : null);
    o.vv = J(Q.vvInfo ? Object.keys(Q.vvInfo()).sort() : null);
    const rr = await Q.vvRender({range: {a: 0, b: 2}}); o.vvTl = J(rr.tl.map(e => [e.b, e.i, e.s])); o.vvDur = rr.dur;
    return o;
  });
  await b.close(); r.errs = errs; return r;
}
const A = await run(BASE), V = await run(APP);
for (const k of ['md', 'mdR', 'kon', 'kons', 'songK', 'partsK', 'blk', 'blocks', 'g6', 'vv', 'vvTl', 'vvDur']) ok('PAR ' + k + ' gleich zu 4.30.0', JSON.stringify(A[k]) === JSON.stringify(V[k]), JSON.stringify(V[k]).slice(0, 90));
ok('PAR keine Fehler', !A.errs.length && !V.errs.length, [...A.errs, ...V.errs].join(' | ').slice(0, 200));
// KON with states
const { b, p, errs } = await open(APP);
const k = await p.evaluate(async () => {
  const Q = window.SYNQUENZER; Q.loadDemo(); await new Promise(r => setTimeout(r, 300));
  const t = S.tracks.findIndex(x => x.kind === 'synth' && x.clips[1]); Q.v6aSetState(t, 1, {p: {cutoff: 500}, x: 'bar1'});
  Q.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]);
  const ok1 = Q.konsolidieren(0, 1, 'Kon'); const tx = serialize(); importJSON(tx); await new Promise(r => setTimeout(r, 200));
  return {ok1, st: Q.v6aState(t, 1), same: serialize() === tx, t};
});
ok('PAR-KON konsolidieren mit ◆: Zustand bleibt, Speichern → Laden gleich', k.st && k.st.p.cutoff === 500 && k.st.x === 'bar1' && k.same, JSON.stringify(k));
ok('PAR-KON keine Fehler', !errs.length, errs.join(' | ').slice(0, 200));
await b.close();
process.exit(done() ? 1 : 0);
