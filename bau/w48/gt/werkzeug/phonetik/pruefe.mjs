import fs from 'node:fs';
const P = await import(process.argv[2] + '/js/phonetik.js');
const t0 = performance.now();
console.log(P.vokalKette("Don't wait, follow the light"), '|', (performance.now()-t0).toFixed(1)+'ms');
const lied = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const ms = lied.silben;
let abw = 0;
for (const [i, z] of lied.zeilen.entries()) {
  const sp = P.erkenneSprache(z.text);
  const r = P.zeileZuVokalen(z.text);
  const meine = r.flatMap(w => w.silben.map(s => s.text));
  const ihre = z.woerter.flatMap(wi => lied.woerter[wi].silben.map(si => ms[si].text));
  const gleich = meine.join('|') === ihre.join('|');
  if (!gleich) abw++;
  console.log(String(i).padStart(2), sp, '|', z.text, '→', P.vokalKette(z.text), gleich ? '' : '  !! ' + meine.join('-') + ' vs ' + ihre.join('-'));
}
console.log('abweichende Zeilen', abw);
for (const w of ['being','fire','realise','everything','hypnotised','little','people','recipe','wanted','eyes','money','singin\'','xanderfoxy','glimmering','nightfall']) {
  const r = P.wortZuVokalen(w, 'en'); console.log(w, r.quelle, r.silben.map(s => s.text + '=' + s.anzeige + (s.laut? '('+s.laut+')':'')).join(' '));
}
for (const w of ['Folge','Leben','Himmel','Kaffee','gehen','Gesang','Sterne','siehst','Abend','Mauer','Träume','Licht','Wahrheit','Zucker']) {
  const r = P.wortZuVokalen(w, 'de'); console.log(w, r.silben.map(s => s.text + '=' + s.anzeige + (s.lang?'(lang)':'')).join(' '));
}
console.log(JSON.stringify(P.zeileZuVokalen("Don't wait, follow the light")[3]));
console.log(P.uebergaenge(P.zeileZuVokalen("Don't wait, follow the light wake up open your eyes")).map(u => `${u.paar} s${u.schwere} x${u.anzahl} [${u.beispiele.join('; ')}] ${u.hinweis}`).join('\n'));
console.log(P.uebergaenge('Ou · Ei · O · Ou · ö · Ai').length, P.uebergaenge(['I','A']).map(u=>u.paar));
const z = { text: 'realise the fire', sprache: 'en', silben: [{text:'rea'},{text:'lise'},{text:'the'},{text:'fi'},{text:'re'}] };
console.log(P.silbenZuVokalen(z).map(s => s.text + '=' + s.anzeige).join(' '));
