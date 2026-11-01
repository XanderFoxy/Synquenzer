// Stil-Daten nach Spec G6+d (nur für die Messungen in G6+b; die echte Tabelle baut G6+d)
const D = (a) => a.map(([ms, ct, p]) => ({ms, ct, p}));
const U = (rule, pan, w, db, dbl) => ({rule, pan, w, db, dbl: D(dbl)});
const G = (below, hp, mid, midF, air, sib) => ({below, hp, mid, midF, air, sib});
const gos = k => D([[9 + 2 * k, -10, -1], [21 + 2 * k, 5, 0], [34 + 2 * k, 12, 1]]);
export const STYLES = {
  '80': {voices: [U('uni', 0, 1, 0, [[16, -8, -1], [29, 9, 1]]), U('st+2', 0, .7, -1, [[12, -6, -1], [24, 8, 1]]), U('oct+1', 0, .4, -4, [[20, -5, -1], [33, 7, 1]])], grp: G(8, 180, -3, 400, 3, -12)},
  pop: {voices: [U('uni', 0, 1, 0, [[8, -4, -1], [15, 5, 1]]), U('st+2', 0, .6, -2, [[10, -5, -1], [18, 6, 1]]), U('oct-1', 0, .3, -7, [[8, -4, -1], [15, 5, 1]])], grp: G(9, 200, -2, 350, 4, 'weg')},
  gospel: {voices: [Object.assign(U('ch+1', -.45, .25, 0, []), {dbl: gos(0)}), Object.assign(U('ch-1', .45, .25, 0, []), {dbl: gos(1)}), Object.assign(U('ch-2', 0, .35, -1, []), {dbl: gos(2)})], grp: G(6, 120, -1, 300, 2, -12)},
  barber: {voices: [U('ch+1', -.3, 0, -1, [[0, 0, 0]]), U('ch-1', .3, 0, 0, [[0, 0, 0]]), U('root-', 0, 0, 1, [[0, 0, 0]])], grp: G(4, 70, 0, 1000, 1, -6)},
  rock: {voices: [U('uni', 0, .8, 0, [[17, -14, -1], [28, 12, 1], [41, -19, -.5], [52, 17, .5]]), U('oct-1', 0, .6, -3, [[17, -14, -1], [28, 12, 1], [41, -19, -.5], [52, 17, .5]])], grp: G(5, 250, 2, 1500, 0, -12)},
  ballade: {voices: [U('st+2', -.35, .35, -1, [[20, -6, -1], [35, 7, 1]]), U('st-5', .35, .35, -2, [[20, -6, -1], [35, 7, 1]])], grp: G(10, 150, -2, 300, -2, 'weg')},
  disco: {voices: [U('oct+1', -.5, .3, 0, [[10, -7, -1], [18, 7, 1]]), U('st+2/o+1', .5, .3, -2, [[10, -7, -1], [18, 7, 1]])], grp: G(7, 300, -2, 500, 5, -18)},
  wave: {voices: [U('oct-1', -.4, 0, 0, [[25, -5, 0]]), U('st-4', .4, 0, -2, [[28, 5, 0]])], grp: G(9, 80, -2, 2500, -3, -12)},
  background: {voices: [Object.assign(U('free', -.6, .15, 0, [[12, -6, -1], [24, 8, 1]]), {})], grp: G(9, 180, -2, 400, 2, -12)}
};
export function chorOf(name) { const s = STYLES[name]; return {v: 2, style: name === 'background' ? null : name, grp: Object.assign({midF: 1000, rev: 0, pre: 0, dly: 0}, s.grp),
  voices: s.voices.map((v, i) => Object.assign({lane: 'c' + (i + 1), n: []}, JSON.parse(JSON.stringify(v))))}; }
