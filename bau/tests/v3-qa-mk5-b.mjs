// QA MK5 probes B: MK5-11 (Ziel T2), MK5-12 (first step), MK5-10 / MK5-05 with the transport stopped
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

await T('MK5-11 T2', async page => {
  const r = await page.evaluate(async () => {
    const scope = async () => { mkScopeOf(0); await H.sl(110); const s = mkScopeOf(0); return s ? s.voices.filter(v => v.gate !== false).map(v => [v.tb === 2 ? 2 : 1, v.note]) : null; };
    const out = {};
    // Dual + Ziel T2: only T2 arpeggiates, T1 holds the chord
    H.reset(); H.Q.setBpm(120); H.mk('mode', 1); H.mk('tv', 2); H.arp({on: 1, res: 3, gate: 100, tgt: 2}); await H.sl(50); H.keys([60, 64, 67]);
    const d = []; for (let k = 0; k < 6; k++) d.push(await scope()); out.dual = d; H.up([60, 64, 67]); await H.sl(300);
    // Split + Ziel T2 + OKTAVEN 3: keys >= split arpeggiate on T2 only; keys < split (T1) are held normally; no arp note on T1
    H.reset(); H.Q.setBpm(120); H.mk('mode', 2); H.mk('split', 60); H.arp({on: 1, res: 0, gate: 100, tgt: 2, range: 3, type: 1}); await H.sl(50);
    H.keys([48, 52, 60, 64, 67]);
    const s = []; for (let k = 0; k < 8; k++) s.push(await scope());
    out.split = s; out.splitLog = H.log().map(x => x.note); H.up([48, 52, 60, 64, 67]); await H.sl(300);
    return out;
  });
  const dT2 = r.dual.filter(Boolean), t1held = dT2.every(a => J(a.filter(v => v[0] === 1).map(v => v[1]).sort()) === '[60,64,67]'), t2one = dT2.every(a => a.filter(v => v[0] === 2).length <= 2) && dT2.some(a => a.some(v => v[0] === 2));
  ok('MK5-11 Dual + Ziel T2: nur T2 arpeggiert, T1 hält den Akkord', dT2.length >= 4 && t1held && t2one, J(dT2.slice(0, 4)));
  const sp = r.split.filter(Boolean), t1bad = sp.some(a => a.some(([tb, n]) => tb === 1 && ![48, 52].includes(n))), t1held2 = sp.every(a => J(a.filter(v => v[0] === 1).map(v => v[1]).sort()) === '[48,52]'),
    t2arp = sp.some(a => a.some(([tb, n]) => tb === 2 && n > 67));
  ok('MK5-11 Split + Ziel T2 + OKTAVEN 3 (Ab): keine Arp-Note auf T1, T1 hält 48/52, T2 arpeggiert bis über 67', sp.length >= 5 && !t1bad && t1held2 && t2arp && r.splitLog.every(n => n >= 60), J(sp.slice(0, 4)) + ' log ' + r.splitLog.slice(0, 10).join(' '));
});

await T('MK5-12 first', async page => {
  const r = await page.evaluate(async () => {
    const res = [];
    for (const keys of [[72, 48, 64, 55, 60, 67], [50, 53, 57, 60, 62, 65]]) {
      H.reset(); H.arp({on: 1, res: 1, type: 5}); await H.sl(40); H.keys(keys); await H.sl(450); H.up(keys); await H.sl(60);
      const g = {}; for (const x of H.log()) (g[x.t.toFixed(4)] = g[x.t.toFixed(4)] || []).push(x.note);
      res.push({keys, steps: Object.values(g).map(a => a.sort((p, q) => p - q)), vmax: sndOf(0).p.mk.vmax});
    }
    // and with the transport running
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, type: 5}); H.Q.play(); await H.sl(300); H.keys([72, 48, 64, 55, 60, 67]); await H.sl(600); H.up([72, 48, 64, 55, 60, 67]); await H.sl(60); H.Q.stop();
    const g = {}; for (const x of H.log()) (g[x.t.toFixed(4)] = g[x.t.toFixed(4)] || []).push(x.note); res.push({run: 1, steps: Object.values(g).map(a => a.sort((p, q) => p - q))});
    return res;
  });
  for (const x of r) {
    const low4 = J((x.keys || [72, 48, 64, 55, 60, 67]).slice().sort((a, b) => a - b).slice(0, 4));
    ok('MK5-12 Akkord, 6 Tasten zugleich bei 4 Stimmen' + (x.run ? ' (Transport läuft)' : '') + ': jeder Schritt (auch der erste) = die 4 tiefsten ' + low4, x.steps.length >= 3 && x.steps.slice(0, -1).every(a => J(a) === low4), J(x.steps.slice(0, 3)));
  }
});

await T('MK5-10 stopped', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50}); await H.sl(40); H.keys([60, 64, 67]); await H.sl(700);
    const tc = H.now(); H.Q.setBpm(90); await H.sl(1000); H.up([60, 64, 67]); await H.sl(40);
    const L = H.log(); return {ts: L.map(x => x.t), tc, notes: L.map(x => x.note)};
  });
  const dts = r.ts.slice(1).map((t, k) => +((t - r.ts[k]) * 1000).toFixed(2));
  const bef = dts.filter((d, k) => r.ts[k + 1] < r.tc), aft = r.ts.map((t, k) => [t, k]).filter(([t]) => t > r.tc + .12).map(([t, k]) => +((t - r.ts[k - 1]) * 1000).toFixed(2));
  // no double / missing step: every interval is either 125 ms, 166.67 ms or a single transition interval between them
  const odd = dts.filter(d => Math.abs(d - 125) > .5 && Math.abs(d - 166.67) > .5);
  ok('MK5-10 Transport steht: Tempo-Wechsel 120 → 90 im Lauf: nächste Schritte im neuen Tempo, kein doppelter/fehlender Schlag', aft.length >= 4 && aft.every(d => Math.abs(d - 166.67) < .5) && odd.length <= 1 && odd.every(d => d > 120),
    'Abstände ' + dts.join(' ') + ' (Wechsel bei ' + ((r.tc - r.ts[0]) * 1000).toFixed(0) + ' ms)');
  // no two notes closer than half a step and the notes keep the order 60 64 67
  ok('MK5-10 Transport steht: Muster bleibt in Folge über den Wechsel', r.notes.every((n, k) => n === [60, 64, 67][k % 3]), r.notes.join(' '));
});

await T('MK5-05 stopped', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const sw of [50, -50]) { H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 3, gate: 30, swing: sw}); await H.sl(40); H.keys([60, 64, 67]); await H.sl(1400); H.up([60, 64, 67]); await H.sl(40);
      const L = H.log(); out[sw] = L.map(x => +((x.t - L[0].t) * 1000).toFixed(2)); }
    return out;
  });
  for (const sw of [50, -50]) {
    const ts = r[sw], want = sw / 100 * .5 * 250, dev = ts.map((t, k) => +(t - k * 250 - (k % 2 ? want : 0)).toFixed(2));
    ok(`MK5-05 Transport steht, SWING ${sw} (1/8): gerade Noten ${want} ms verschoben`, ts.length >= 5 && dev.every(d => Math.abs(d) <= 1), ts.join(' '));
  }
});

await browser.close();
