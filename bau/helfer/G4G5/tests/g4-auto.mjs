// G4-03 Auto im Demo-Mix: Gesang im Präsenzband 2–5 kHz ≥ 3 dB über der lautesten anderen Spur (Ausgänge der Spuren mitgeschnitten)
// node g4-auto.mjs [app]   (mit VS-P: zusammengeführte Datei, z. B. Zweig + vs-br-VSP per git merge-file)
import {open, sleep, APP, voice} from './h.mjs';
import {sung} from './lib.mjs';
import {band25, db} from './sig.mjs';
const FILE = process.argv[2] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const i16 = x => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const bandLv = (x, sr) => { const z = band25(x, sr), B = 2048, p = []; for (let k = 0; k + B <= z.length; k += B) { let a = 0; for (let i = k; i < k + B; i++) a += z[i] * z[i]; p.push(a / B); } const mx = Math.max(...p), q = p.filter(v => v > mx * 1e-3); return q.length ? db(q.reduce((a, b) => a + b, 0) / q.length) : -Infinity; };
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), bpm = await p.evaluate(() => S.bpm), vp = await p.evaluate(() => typeof vpGet === 'function');
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'VS-P', vp, 'bpm', bpm);
const VO = process.argv[3] || 'sung', y = VO === 'sung' ? sung(4 * 4 * 60 / bpm, sr, -28, {seed: 3}).y : voice(4, bpm, sr, -28, {voice: VO, seed: 5});
console.log('Stimme:', VO === 'sung' ? 'gesungener Vokal „a“ (VS-P-Bibliothek)' : 'Korpus-Stimme VS2 (' + VO + ')');
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [i16(y), sr]);
async function settle() { for (let k = 0; k < 4; k++) { await p.evaluate(id => SYNQUENZER.g4Played(id), r.id); await sleep(150); await p.evaluate(() => SYNQUENZER.g4Wait(30000)); if (vp) await p.evaluate(() => SYNQUENZER.vpWait && SYNQUENZER.vpWait()); } }
async function measure(tag) {
  await settle();
  await p.evaluate(() => { SYNQUENZER.launchScene(0); });
  await sleep(1200);
  await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (AU.tracks[i]) window.__cap('t' + i, AU.tracks[i].cut); });
  await sleep(8500);
  const caps = await p.evaluate(() => { const o = []; for (let i = 0; i < NT(); i++) if (window.__caps['t' + i]) { const c = window.__capGet('t' + i), m = new Float32Array(c.L.length); for (let k = 0; k < m.length; k++) m[k] = 0.5 * (c.L[k] + c.R[k]);
    const u = new Uint8Array(m.buffer); let s = ''; for (let k = 0; k < u.length; k += 0x8000) s += String.fromCharCode.apply(null, u.subarray(k, k + 0x8000)); o.push({i, name: S.tracks[i].name, st: !!S.tracks[i].stimme, b: btoa(s)}); } return o; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  let vox = null, other = -Infinity, on = '';
  for (const c of caps) { const B = Buffer.from(c.b, 'base64'), x = new Float32Array(B.buffer, B.byteOffset, B.byteLength >> 2); const L = bandLv(x, sr); console.log('   ', tag, c.name.padEnd(12), isFinite(L) ? L.toFixed(2) + ' dB (2–5 kHz)' : 'still'); if (c.st) vox = L; else if (L > other) { other = L; on = c.name; } }
  return {vox, other, on};
}
const m0 = await measure('vor Auto ');
console.log(`  vor Auto: Gesang ${m0.vox.toFixed(2)} dB, lauteste andere Spur ${m0.on} ${m0.other.toFixed(2)} dB → ${(m0.vox - m0.other).toFixed(2)} dB`);
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1500);
const a = await p.evaluate(() => SYNQUENZER.g4Auto());
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
console.log("  Auto:", JSON.stringify({thr: a.thr, ra: a.ra, ds: a.ds, pre: a.pre, mid: a.mid, lo: a.lo, lra: [a.lraIn, a.lraOut], sib: a.sibProm, mix: a.mix, top: a.mixTop}));
const g = await p.evaluate(() => SYNQUENZER.g4Info().gfx);
ok(g.thr === a.thr && g.ra === a.ra && g.ds === a.ds && g.pre === a.pre && g.mid === a.mid && g.lo === a.lo, `Ergebnis sichtbar in den Reglern: Schwelle ${g.thr} dB, Verhältnis ${g.ra}:1, Entzischer ${g.ds} dB, Tief ${g.lo}, Mitte ${g.mid}, Präsenz +${g.pre} dB`);
const m1 = await measure('nach Auto');
ok(m1.vox - m1.other >= 3, `G4-03 nach Auto: Gesang ${m1.vox.toFixed(2)} dB, lauteste andere Spur (${m1.on}) ${m1.other.toFixed(2)} dB → ${(m1.vox - m1.other).toFixed(2)} dB (Soll ≥ 3)`);
const u = await p.evaluate(() => { SYNQUENZER.undo(); return SYNQUENZER.g4Info().gfx; });
ok(u.pre === 3 && u.thr === -24, 'ein Undo nimmt Auto zurück („Gesang Synthpop“)');
if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 3));
await H.br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
