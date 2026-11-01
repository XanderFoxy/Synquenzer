// T5: R-4300 und NORTHI im Vergleich – gleiche Schritte ergeben Zeichen für Zeichen dasselbe Projekt, North-Renders bitgleich
const H = require('./h.cjs'), path = require('path'), fs = require('fs');
const BASE = path.resolve(H.ROOT, '../../snapshots/R-4300.html');
const strip = o => JSON.stringify(o, (k, v) => (/^(uid|mt|ct|saved|id)$/.test(k) && typeof v !== 'object' ? '·' : v));
async function run(b, file) {
  const p = await H.page(b, {html: fs.readFileSync(file, 'utf8')});
  const r = await p.evaluate(async () => {
    const D = window.SYNQUENZER, out = {};
    out.p0 = D.project();
    D.loadKit('Schräg'); D.setPadSource('kick', 'drum'); D.setPadSource('kick', 'md'); out.p1 = D.project();
    D.loadKit('Rom Pop'); D.setPadSource('snare', 'md'); out.p2 = D.project();
    D.loadKit('Gestimmt');
    const hits = []; for (let i = 0; i < 16; i++) hits.push([i * 0.125, ['kick', 'hatC', 'snare', 'hatC'][i % 4], 0.8, i % 4 === 0 ? 1 : 0]);
    const h = a => { let x = 2166136261 >>> 0; const u = new Uint32Array(a.buffer, a.byteOffset, a.length); for (let i = 0; i < u.length; i++) { x ^= u[i]; x = Math.imul(x, 16777619) >>> 0; } let e = 0; for (let i = 0; i < a.length; i++) e += a[i] * a[i]; return x.toString(16) + ':' + e.toFixed(6); };
    const R = await D.mdRender(hits, {sr: 48000, sec: 2.5}); out.r1 = h(R.l) + '|' + h(R.r);
    const k = MDX.kits[3]; const chans = {}; MDX.ORDER.forEach((id, i) => { chans[i] = k.slots[id]; });
    const R2 = await MDX.render({sr: 44100, sec: 2, chans, kit: k.md, hits: hits.map(([t, pad, v, acc]) => ({ch: MDX.ORDER.indexOf(pad), at: t, v, acc, tune: 0, dec: 1}))}); out.r2 = h(R2.l) + '|' + h(R2.r);
    out.kits = D.kits();
    return out;
  });
  await H.closePage(p); return r;
}
(async () => {
  const b = await H.browser();
  const A = await run(b, BASE), B = await run(b, H.FILE);
  H.ok(strip(A.p0) === strip(B.p0), 'Startprojekt gleich (Zeichen für Zeichen, ohne Zufalls-IDs)', [strip(A.p0).length, strip(B.p0).length]);
  H.ok(strip(A.p1) === strip(B.p1), 'Kit Schräg + Pad-Quelle hin und zurück: Projekt gleich');
  H.ok(strip(A.p2) === strip(B.p2), 'Rom Pop + ein Pad North: Projekt gleich');
  H.ok(parseFloat(A.r1.split('|')[0].split(':')[1]) > 0.01, 'Render nicht stumm', A.r1);
  H.ok(A.r1 === B.r1, 'mdRender (Kit Gestimmt, 16 Schläge): bitgleich', [A.r1, B.r1]);
  H.ok(A.r2 === B.r2, 'MDX.render (Kit Schräg direkt): bitgleich', [A.r2, B.r2]);
  H.ok(JSON.stringify(A.kits) === JSON.stringify(B.kits), 'kits(): gleiche Liste wie R-4300 (Engine da)');
  await b.close(); H.done('T5 gleich');
})().catch(e => { console.error(e); process.exit(2); });
