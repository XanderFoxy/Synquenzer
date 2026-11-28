import { bewerte, bewerteAtem, gesamt } from '../../app/js/bewertung.js';
const F = { a: [730, 1250], e: [360, 2050], i: [280, 2250], o: [400, 760], u: [310, 690] };
const ziel = [0, 2, 4, 5, 7, 5, 4, 2, 0].map((s, i) => ({ t: i * 0.5, dauer: i === 8 ? 1.9 : 0.45, midi: 50 + s, vokal: 'a', silbe: 'a' }));
function rahmen({ cent = 0, spaet = 0, wackel = 0, stumm = false, vokal = 'a' } = {}) {
  const r = [];
  for (let t = -2; t < 6; t += 0.02) {
    const n = ziel.find((z) => t - spaet >= z.t && t - spaet < z.t + z.dauer + 0.04);
    if (!n || stumm) { r.push({ t, m: null, p: -70 }); continue; }
    r.push({ t, m: n.midi + cent / 100 + wackel / 100 * Math.sin(t * 40), p: -25, F1: F[vokal][0], F2: F[vokal][1] });
  }
  return r;
}
const o = { schwelle: -50, vokale: true, formanten: F, name: (m) => 'M' + m };
for (const [n, opt] of [['perfekt', {}], ['+40c', { cent: 40 }], ['-80c', { cent: -80 }], ['spät 0.2', { spaet: 0.2 }], ['wackel 70', { wackel: 70 }], ['vokal o', { vokal: 'o' }], ['stumm', { stumm: true }]]) {
  const e = bewerte(ziel, rahmen(opt), o);
  console.log(n.padEnd(10), e.gesamt, e.teile.map((t) => t.id + ':' + (t.wert == null ? '-' : Math.round(t.wert * 100))).join(' '), '|', e.tipp, '|', e.atem.text);
}
const ph = [{ t: 0, dauer: 4, art: 'ein' }, { t: 4, dauer: 4, art: 'halten' }, { t: 8, dauer: 8, art: 'aus' }];
const ra = []; for (let t = 0; t < 17; t += 0.02) ra.push({ t, m: null, p: t > 8.1 && t < 15.5 ? -30 + Math.sin(t) : -65, z: 0.3 });
console.log(JSON.stringify(bewerteAtem(ph, ra)).slice(0, 400));
console.log(gesamt([bewerte(ziel, rahmen(), o), bewerte(ziel, rahmen({ cent: -80 }), o)]).gesamt);
