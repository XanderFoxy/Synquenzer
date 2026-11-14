// VX3-Test: Konsonant-Anlauf über den Vokal-Einsatz (Marken 25 ms IM Vokal wie Tonhöhen-Noten), Legato ohne Anlauf, Kern (Worker) =
// Hauptfaden-Rückfall = vx3LeadOf, Festschreiben (Anker ≤ 0,2 s, Anker bleibt), Schalter aus = Regel 4.64. Aufruf: node vx3-test.mjs <abs index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const run = (p, fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const b = await chromium.launch(), errs = [];
let okN = 0, badN = 0;
const ok = (c, name, info) => { if (c) okN++; else badN++; console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const has = await run(p, () => typeof vx3Lead === 'function');
if (!has) console.log('INFO kein VX3 in dieser Fassung');
// 5 Silben Konsonant (45 ms Rauschen) + Vokal, die 5. Silbe geht im Legato (Tonwechsel ohne Konsonant) in eine 6. über.
// Marken (gespeichert, ohne Anker): 25 ms nach dem Vokal-Einsatz – wie Tonhöhen-Noten; die Legato-Marke 25 ms nach dem Tonwechsel.
const T = await run(p, async () => {
  const SR = 48000, ONS = [.4, .9, 1.4, 1.9, 2.4], F = [220, 247, 262, 294, 330], LEG = 2.95, END = 3.4;
  const n = Math.round(3.6 * SR), x = new Float32Array(n); let seed = 777; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
  for (let k = 0; k < ONS.length; k++) {
    const on = ONS[k], nx = k + 1 < ONS.length ? ONS[k + 1] : END; let lp = 0;
    for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(), h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)); }
    const v0 = on + .05, v1 = nx + (k + 1 < ONS.length ? .015 : 0); let ph = 0;
    for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) {
      const t = i / SR - v0, T = v1 - v0, f = k === ONS.length - 1 && i / SR >= LEG ? 196 : F[k]; ph += 2 * Math.PI * f / SR;   // Legato: Tonwechsel phasenstetig
      let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04); if (k === ONS.length - 1) e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .6;
      if (t > T - .012) e *= Math.max(0, (T - t) / .012);
      let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(h * ph) / h; x[i] += .5 * e * s / 1.6;
    }
  }
  const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  S.bpm = 120; const r = await SYNQUENZER.tkInject({pcm, sr: SR, scene: 0, at: 0, len: 2}); await wait(300);
  const m = S.takes[r.id], mk = ONS.map(on => on + .05 + .025).concat([LEG + .025]);
  m.marks = wpNormMarks(mk.map(t => ({t: Math.round(t * SR) / SR, conf: 1})), m.len / m.sr);
  return {id: r.id, ons: ONS, mk};
});
// 1) Anlauf über den Vokal-Einsatz: das Stück beginnt am Konsonanten; Legato ohne Anlauf
const r1 = await run(p, async o => {
  const id = o.id; await window.__vx1.analyse(id);
  const L = window.__vx1.list(id), A = VX1R.ana.get(id);
  return {how: WP.how, t: L.map(q => +q.t.toFixed(4)), lead: Array.from(A.lead, v => +v.toFixed(4)), at: L.map(q => q.at), vb: L.map(q => q.vb), uv0: L.map(q => q.uv.length ? q.uv[0][0] : null)};
}, T);
const dk = T.ons.map((on, k) => Math.abs(r1.t[k] - on) * 1000);
ok(dk.every(d => d <= 12), 'Stück beginnt am Konsonanten (erste ms über der Schwelle), obwohl die Marke 25 ms im Vokal liegt (±12 ms)', {abweichungMs: dk.map(Math.round), wie: r1.how});
ok(r1.uv0.slice(0, 5).every((u, k) => u != null && u <= r1.t[k] + .005), 'Konsonant gehört zum Stück (stimmloser Lauf am Stück-Anfang)', r1.uv0);
ok(r1.lead[5] === 0 && Math.abs(r1.t[5] - T.mk[5]) < 1e-4, 'Legato-Tonwechsel (Periodik kurz gestört, laut, ohne Rauschen): kein Anlauf', {lead: r1.lead[5], t: r1.t[5], marke: T.mk[5]});
ok(r1.vb.slice(0, 5).every((v, k) => Math.abs(v - (T.ons[k] + .05)) <= .015), 'Vokal-Beginn am Vokal-Einsatz (±15 ms)', r1.vb);
// 2) gleiche Rechnung: Kern im Worker = Kern auf dem Hauptfaden (Rückfall) = vx3LeadOf aus der Analyse
const r2 = await run(p, async o => {
  const id = o.id, A = VX1R.ana.get(id), b = vx1rSrc(id), msg = {op: 'vxa', x: b.getChannelData(0), sr: b.sampleRate, marks: Array.from(A.t)};
  const W = await wpCall(msg), hw = WP.how, Lc = await nx1Local(msg), M = window.__vx3 ? window.__vx3.leadOf(id) : A.lead;
  let dw = 0, dl = 0, dm = 0; for (let k = 0; k < A.t.length; k++) { dw = Math.max(dw, Math.abs(W.lead[k] - A.lead[k])); dl = Math.max(dl, Math.abs(Lc.lead[k] - A.lead[k])); dm = Math.max(dm, Math.abs(M[k] - A.lead[k])); }
  return {dw, dl, dm, hw, worker: !!WP.w};
}, T);
ok(r2.dw === 0 && r2.dl === 0 && r2.dm === 0, 'Anlauf bitgleich: Worker = Hauptfaden-Rückfall = vx3LeadOf', r2);
// 3) Festschreiben: Anker-Abstand ≤ 0,2 s, Anker und Stück-Anfang bleiben
const r3 = await run(p, async o => {
  const id = o.id, L0 = window.__vx1.list(id); await vx1rCommit(id, 'Test', () => {}); const m = S.takes[id], L1 = window.__vx1.list(id);
  let da = 0, dt = 0; for (let k = 0; k < L0.length; k++) { da = Math.max(da, Math.abs(L1[k].at - L0[k].at)); dt = Math.max(dt, Math.abs(L1[k].t - L0[k].t)); }
  return {n0: L0.length, n1: L1.length, anMax: Math.max(...m.marks.map(k => k.an)), da: da * 1000, dt: dt * 1000};
}, T);
ok(r3.n1 === r3.n0 && r3.anMax <= .2 && r3.da <= .05 && r3.dt <= .05, 'Festschreiben: Anker-Abstand ≤ 0,2 s, Anker und Stück-Anfang unverändert (≤ 0,05 ms)', r3);
// 4) Schalter aus = Regel 4.64 (nur stimmlose Rahmen direkt vor der Marke); wieder an = gleiche Stücke wie vorher
const r4 = await run(p, async o => {
  const m = S.takes[o.id], mk = wpNormMarks(o.mk.map(t => ({t: Math.round(t * 48000) / 48000, conf: 1})), m.len / m.sr), r = {};
  const one = async () => { m.marks = mk.map(k => Object.assign({}, k)); delete m.warp; VX1R.ana.clear(); await window.__vx1.analyse(o.id); return window.__vx1.list(o.id).map(q => +q.t.toFixed(4)); };
  const sw = v => window.__vx3 && window.__vx3.on(v); sw(false); try { r.aus = await one(); } finally { sw(true); } r.an = await one(); return r;
}, T);
ok(r4.aus.every((t, k) => Math.abs(t - T.mk[k]) < 1e-4), 'Schalter aus: Stücke an den Marken (Anlauf wie 4.64 nicht gefunden)', r4.aus);
ok(JSON.stringify(r4.an) === JSON.stringify(r1.t), 'Schalter wieder an: gleiche Stücke wie zuerst', r4.an);
ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 3));
console.log(`ERGEBNIS ${okN}/${okN + badN}` + (badN ? ' – FEHLER' : ' – alles OK'));
await b.close();
