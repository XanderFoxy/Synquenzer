// Node-Test der Rechnung (erfundene Antworten). Aufruf: node bf-rechnen-test.mjs <pfad zu module/bigfive>
const dir = process.argv[2];
const D = await import(dir + '/daten.js'), R = await import(dir + '/rechnen.js');
const { FRAGEN, startFragen } = D; let fehler = 0; const ok = (c, t) => { if (!c) { fehler++; console.log('FEHLER', t); } };
// Person: neugierig (O hoch), spontan (C niedrig), gemischt E, A leicht hoch, ängstlich (N hoch → stabilitaet Gegenpol)
const a = {};
let ai = 0;
for (const q of startFragen()) {
  let want = { O: 5, C: 1, E: 3, A: (ai++ % 2 ? 4 : 3), N: 5 }[q.b];       // gewünschte Richtung im IPIP-Sinn (A: 4/3 gemischt → leicht)
  a[q.id] = q.k > 0 ? want : 6 - want;
}
const e = R.wertung(a, {});
for (const [id, b] of Object.entries(e.bereiche)) console.log(id.padEnd(20), JSON.stringify(b.eigen), b.wort);
ok(e.bereiche.offenheit.eigen.pol === 1 && e.bereiche.offenheit.eigen.deutlich === 'klar', 'O klar Neugier');
ok(e.bereiche.gewissenhaftigkeit.eigen.pol === -1, 'C Gegenpol');
ok(e.bereiche.extraversion.eigen.deutlich === 'beides', 'E beides');
ok(e.bereiche.vertraeglichkeit.eigen.pol === 1 && e.bereiche.vertraeglichkeit.eigen.deutlich === 'leicht', 'A leicht');
ok(e.bereiche.stabilitaet.eigen.pol === -1 && e.bereiche.stabilitaet.wort.includes('Feines Gespür'), 'N → Feines Gespür');
ok(!('pr' in e.bereiche.offenheit), 'kein Prozentrang');
ok(Object.keys(e.facettenEigen).length === 30, 'alle 30 Facetten mit Richtung: ' + Object.keys(e.facettenEigen).length);
ok(typeof e.bereiche.offenheit.wert === 'number' && typeof e.bereiche.offenheit.stufe === 'number', 'alte Felder bleiben');
// Änderung einer Antwort ändert die Richtung
const b2 = { ...a }; for (const q of startFragen().filter((q) => q.b === 'E')) b2[q.id] = q.k > 0 ? 5 : 1;
const e2 = R.wertung(b2, {}); ok(e2.bereiche.extraversion.eigen.pol === 1 && e2.bereiche.extraversion.eigen.deutlich === 'klar', 'E nach Änderung klar');
// gemischt: drei Facetten hoch, drei niedrig
const c = { ...a }; startFragen().filter((q) => q.b === 'E').forEach((q, i) => { const w = i % 2 ? 5 : 1; c[q.id] = q.k > 0 ? w : 6 - w; });
ok(R.wertung(c, {}).bereiche.extraversion.eigen.deutlich === 'beides', 'gemischt → beides');
// Zahlen in Worten?
const alle = JSON.stringify(Object.values(e.bereiche).map((b) => b.wort)); ok(!/\d/.test(alle), 'keine Ziffern im Wort');
console.log(fehler ? fehler + ' Fehler' : 'alle Rechen-Tests ok');
process.exit(fehler ? 1 : 0);
