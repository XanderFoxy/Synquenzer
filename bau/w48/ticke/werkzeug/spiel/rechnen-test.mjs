const B = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ticke-w/neu/ticke/module/spiel/';
const D = await import(B + 'daten.js'), R = await import(B + 'rechnen.js');
let fehler = 0; const ok = (b, t) => { if (!b) { fehler++; console.log('FEHLER', t); } };
// Simulation: erfundene Person mit klarer Richtung
const rnd = R.zufall(7);
let treffer = 0, gesamt = 0, falschRichtung = 0;
const t0 = performance.now();
for (let n = 0; n < 200; n++) {
  const eta = D.BEREICHE.map(() => (rnd() * 4 - 2));
  const ant = {};
  for (const s of D.ABLAUF) {
    if (s.art === 'duell') { ant[s.id] = { w: rnd() < 0.5 ? 'a' : 'b' }; continue; }
    const p = R.pPaar(s.a.id, s.b.id, eta); ant[s.id] = { w: rnd() < p ? 'a' : 'b', ms: 2000 + rnd() * 3000 };
  }
  const e = R.auswerten(ant, { saat: n + 1 });
  D.BEREICHE.forEach((Bx, i) => { const b = e.bereiche[Bx.id]; gesamt++; if (b.richtung === Math.sign(eta[i])) treffer++; if (b.richtung && b.richtung !== Math.sign(eta[i])) falschRichtung++; });
}
const t1 = performance.now();
console.log('Richtung getroffen', treffer, 'von', gesamt, '· Gegenrichtung', falschRichtung, '· ms je auswerten', ((t1 - t0) / 200).toFixed(2));
ok(falschRichtung / gesamt < 0.08, 'zu oft Gegenrichtung');
// leer
const leer = R.auswerten({});
ok(leer.n === 0 && Object.keys(leer.bereiche).length === 0 && leer.interessen === null, 'leer');
// Ausgabe ohne Zahlen, die ihn beschreiben (nur paare/n als Anzahl)
const e = R.auswerten(Object.fromEntries(D.ABLAUF.map((s) => [s.id, { w: 'a', ms: 3000 }])));
const txt = JSON.stringify({ ...e, n: 0, bereiche: Object.fromEntries(Object.entries(e.bereiche).map(([k, v]) => [k, { ...v, paare: 0 }])) });
ok(!/\d\.\d|pOben|unten|oben|punkte|sterne|urteil/.test(txt), 'Zahlen/Bewertung im Ergebnis: ' + txt);
console.log(JSON.stringify(e).slice(0, 600));
// alte Antworten der Vorlage (mit x1, m1, n1 usw.) stören nicht
const alt = { x1: { w: 'b', l: true, ms: 900 }, m1: { w: 'a' }, n4: { w: 'a' }, p01: { w: 'a', l: false, ms: 2100 } };
const ea = R.auswerten(alt); ok(ea.n === 1, 'alte ids');
// ausAlt
const aa = R.ausAlt({ schema: 1, bereiche: { offenheit: { stufe: 2, richtung: 1, pOben: 0.95 }, extraversion: { stufe: 0, richtung: 0 } }, interessen: { rang: ['A', 'I', 'S', 'R', 'E', 'C'] } });
ok(aa.bereiche.offenheit.deutlich === 'klar' && aa.bereiche.extraversion.deutlich === 'beides' && aa.interessen.vorn.join() === 'A,I', 'ausAlt');
// Wiederholung anders
const w = R.zweimal({ p03: { w: 'a' }, w1: { w: 'b' } }); ok(w.length === 1 && w[0].gleich === false, 'zweimal');
const k = R.dreier({ k1a: { w: 'a' }, k1b: { w: 'a' }, k1c: { w: 'a' } }); ok(k[0].kreis === true, 'kreis');
const bsp = R.beispiel({ p04: { w: 'b' } }, 'offenheit', 1); ok(bsp && bsp.gewaehlt === 'Ich habe eine lebhafte Fantasie.', 'beispiel');
console.log(fehler ? fehler + ' FEHLER' : 'alles ok');
process.exit(fehler ? 1 : 0);
