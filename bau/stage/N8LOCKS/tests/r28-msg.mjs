// Regel 28 / N8-01 (M-MSG): ohne Lock und Reihe sind alle Nachrichten an die Klang-Worklets byte-gleich zu 4.30.0.
// Demo-Projekt ▶ (alle Spuren), Mitschnitt jeder port.postMessage der Synth-Engines; Zeiten relativ zum Start, IDs nach Reihenfolge.
import {open, ok, APP, BASE} from './lib.mjs';
async function run(file) {
  const {b, p, errs} = await open(file);
  const r = await p.evaluate(async () => {
    const log = [];
    const wrap = () => { for (const E of AU.synth) if (E && !E.dead && E.node && !E.__w) { E.__w = 1; const pm = E.node.port.postMessage.bind(E.node.port); E.node.port.postMessage = m => { log.push(JSON.parse(JSON.stringify(m, (k, v) => (typeof v === 'number' && !isFinite(v) ? String(v) : v)))); return pm(m); }; } };
    wrap(); play(); wrap();
    await new Promise(r => setTimeout(r, 3200)); wrap(); stop();
    await new Promise(r => setTimeout(r, 300));
    const t0 = R.startTime, ids = new Map(), norm = e => e.map((x, k) => (k === 0 && typeof x === 'number' && x !== 0 ? Math.round((x - t0) * 1e5) / 1e5 : k === 2 && typeof x === 'number' && x > 0 ? (ids.has(x) || ids.set(x, ids.size + 1), ids.get(x)) : x));
    const ev = []; for (const m of log) if (m.ev) for (const e of m.ev) if (typeof e[0] !== 'number' || e[0] - t0 < 2.5) ev.push(norm(e));
    const other = log.filter(m => !m.ev).map(m => Object.keys(m).sort().join(','));
    return {ev, other, n: log.length};
  });
  await b.close(); return {r, errs};
}
const A = await run(BASE), B = await run(APP);
const ja = JSON.stringify(A.r.ev), jb = JSON.stringify(B.r.ev);
let at = -1; for (let k = 0; k < Math.min(A.r.ev.length, B.r.ev.length); k++) if (JSON.stringify(A.r.ev[k]) !== JSON.stringify(B.r.ev[k])) { at = k; break; }
ok(A.r.ev.length > 20 && ja === jb, `M-MSG Demo ▶ 2,5 s: ${A.r.ev.length} / ${B.r.ev.length} Ereignisse an die Worklets, byte-gleich ${ja === jb}${at >= 0 ? ' (erste Abweichung #' + at + ' ' + JSON.stringify(A.r.ev[at]) + ' ↔ ' + JSON.stringify(B.r.ev[at]) + ')' : ''}`);
const ty = new Set(B.r.ev.map(e => e[1])); ok(!ty.has(11) && !ty.has(12) && B.r.ev.every(e => e.length <= 7), `M-MSG kein Typ-11/12-Ereignis, kein Note-an mit Paaren (Typen: ${[...ty].sort((x, y) => x - y).join(' ')})`);
ok(JSON.stringify(A.r.other) === JSON.stringify(B.r.other), `M-MSG übrige Nachrichten gleich (${B.r.other.length}: ${[...new Set(B.r.other)].slice(0, 6).join(' · ')})`);
ok(!B.errs.length, 'Konsole ohne Fehler: ' + B.errs.slice(0, 2).join(' | '));
