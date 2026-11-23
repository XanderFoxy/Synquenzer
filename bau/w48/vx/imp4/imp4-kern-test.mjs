// IMP4 Kern-Test (Node): Import-Kern (Text-Block sq-xla-src) aus Basis und neuer Fassung, synthetische Testdatei.
// Aufruf: node imp4-kern-test.mjs <basis.html> <neu.html> <datei.cbp>
import fs from 'node:fs';
const [basis, neu, cbp] = process.argv.slice(2);
const core = f => { const html = fs.readFileSync(f, 'utf8'), a = html.indexOf('<script type="text/plain" id="sq-xla-src">'), b = html.indexOf('</script>', a);
  const m = {exports: {}}; new Function('module', 'self', html.slice(html.indexOf('>', a) + 1, b))(m, undefined); return m.exports; };
const u8 = new Uint8Array(fs.readFileSync(cbp));
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
function run(M) {
  const model = M.read(u8), P = M.parts(model, {}), res = M.toProject(model, P, {mode: 'beides'});
  const ti = res.tracks.findIndex(t => t && t.kind === 'drum'), dr = res.tracks[ti];
  const cl = dr.clips.filter(Boolean), notes = cl.flatMap(c => c.notes);
  const own = res.song ? Object.values(res.song.own).filter(o => o.from.t === ti).flatMap(o => o.notes) : [];
  const all = notes.concat(own), claps = all.filter(n => n.n === 39);
  const dup = new Set(), keys = new Set(); for (const n of all) { const k = n.t + ':' + n.n; if (keys.has(k)) dup.add(k); keys.add(k); }
  // Pegel je Clap (∝ v², DrumSynth: lvl = P.lvl·vel²)
  return {res, ti, claps, dupKeys: dup.size, clapV: [...new Set(claps.map(n => n.v))], merged: res.report.merged,
    clapLvl: claps.length ? claps.reduce((s, n) => s + n.v * n.v, 0) / claps.length : 0, nNotes: all.length};
}
const A = run(core(basis)), B = run(core(neu));
console.log('Basis: Clap-Noten im Drum-Clip', A.claps.length, 'v', A.clapV, 'doppelte (t,Pad)', A.dupKeys, '| Neu:', B.claps.length, 'v', B.clapV, 'doppelte', B.dupKeys);
// Was die App hört: der Taktgeber spielt je (Zeit, Pad) nur einen Schlag mit max(v) → Pegel = max(v)²
const heard = r => { const m = new Map(); for (const n of r.claps) { const k = n.t; m.set(k, Math.max(m.get(k) || 0, n.v)); } let s = 0; for (const v of m.values()) s += v * v; return {schlaege: m.size, pegel: s / m.size}; };
const hA = heard(A), hB = heard(B), daw = (90 / 127) ** 2 + (70 / 127) ** 2;   // DAW: zwei gleiche Klänge übereinander = Summe
const db = x => Math.round(2000 * Math.log10(x)) / 100;
console.log('gehörter Clap-Pegel (rel. v²): Basis', hA, 'Neu', hB, 'DAW', daw, '→ Abstand zur DAW: Basis', db(hA.pegel / daw), 'dB, Neu', db(hB.pegel / daw), 'dB');
ok('K1 Basis: zwei Clap-Noten je Zeitpunkt im Clip, App hört nur die lautere (Ausgangslage)', A.dupKeys > 0 && Math.abs(hA.pegel - (90 / 127) ** 2) < 1e-3, {dup: A.dupKeys});
ok('K2 Neu: je Zeitpunkt und Pad genau EIN Schlag im Clip', B.dupKeys === 0);
ok('K3 Neu: Clap-Pegel = Summe wie in der DAW (±0,1 dB)', Math.abs(db(hB.pegel / daw)) <= 0.1, db(hB.pegel / daw));
ok('K4 Neu: Bericht nennt die zusammengelegten Schläge', B.merged.some(s => /^DRUMS: 8 Schläge gleichzeitig auf demselben Pad/.test(s)), B.merged);
// Nur die Doppel ändern sich: alle anderen Drum-Noten und alle Synth-Spuren bitgleich
const strip = r => JSON.stringify(r.res.tracks.map((t, i) => i === r.ti ? null : t)) + JSON.stringify(r.res.song && r.res.song.lanes) + JSON.stringify(r.res.scenes);
ok('K5 Synth-Spuren, Song-Ablauf, Szenen bitgleich zur Basis', strip(A) === strip(B));
const nonClap = r => JSON.stringify(r.res.tracks[r.ti].clips.filter(Boolean).map(c => c.notes.filter(n => n.n !== 39)));
ok('K6 übrige Drum-Noten bitgleich zur Basis', nonClap(A) === nonClap(B));
// Clamp: zwei volle Schläge (127+127) → v höchstens 1
const M2 = core(neu); const m2 = M2.read(u8); for (const t of m2.tracks) for (const n of t.notes) if (n.n === 39) n.vel = 127;
const r2 = M2.toProject(m2, M2.parts(m2, {}), {mode: 'beides'}), d2 = r2.tracks.find(t => t && t.kind === 'drum').clips.filter(Boolean).flatMap(c => c.notes).filter(n => n.n === 39);
ok('K7 zwei volle Schläge: v bleibt ≤ 1 (lautester möglicher Schlag)', d2.length && d2.every(n => n.v === 1));
console.log(fail ? 'FEHLER: ' + fail : 'ALLE OK');
process.exit(fail ? 1 : 0);
