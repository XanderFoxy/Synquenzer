import fs from 'node:fs';
const pfad = process.argv[2];
const U = await import(pfad + '/js/uebungen.js');
const lied = JSON.parse(fs.readFileSync(pfad + '/daten/the-wall.json', 'utf8'));
console.log('UEBUNGEN', U.UEBUNGEN.length, new Set(U.UEBUNGEN.map(u=>u.id)).size);
const modus = process.argv[3] || 'ohne';
const stimme = modus === 'mit' ? { tief: 45, hoch: 60, kern: [48, 57], typ: 'Bariton', sicherheit: 0.6, text: 'x' } : null;
const p = U.plan(lied, stimme);
for (const t of p) {
  console.log('\n## ' + t.name, JSON.stringify(t.umfang));
  for (const s of t.schwierig) console.log('  ! [' + s.art + '/' + s.uebung + '] ' + s.text + ' — ' + s.tipp);
  for (const s of t.schritte) console.log('  ' + s.stufe + ' ' + s.uebung + ': ' + s.text.slice(0, 220));
}
const w = U.warmup(lied, stimme);
console.log('\n## WARMUP', w.reduce((a,s)=>a+s.minuten,0), 'min');
for (const s of w) console.log('  - ' + s.uebung + ' (' + s.minuten + ') ' + s.text.slice(0, 300) + ' | ton=' + JSON.stringify(s.ton));
// eigenes Lied ohne Melodie
const eigen = { id: 'x', titel: 'Test', zeilen: [{ id: 'z1', text: 'Ich gehe heute nach Hause', sprache: 'de' }, { id: 'z2', text: 'Shine bright tonight' }] };
console.log('\nEIGEN plan', JSON.stringify(U.plan(eigen, null)).slice(0, 400));
console.log('EIGEN warmup', U.warmup(eigen, null).map(s => s.uebung + ':' + s.minuten + ':' + JSON.stringify(s.ton)).join(' | '));
console.log('LEER', JSON.stringify(U.plan(null, null)), U.warmup({}, null).length);
