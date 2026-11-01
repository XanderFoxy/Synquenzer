// Schleife: ein Übergang in der Schleife (Takte 3–6, Kante bei Takt 5) klingt in jedem Durchlauf, auf den Schlag genau;
// Ändern während ▶ (Übergang ablegen/entfernen) wirkt beim nächsten Durchlauf ohne Stopp
import { open, SONG16, OUT } from './lib.mjs';
import fs from 'fs';
const R = []; const ok = (name, pass, info) => { R.push({name, pass: !!pass, info}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const {b, p, errs} = await open({});
await p.evaluate(s => SYNQUENZER.setSong(Object.assign({}, s, {loop: {on: true, a: 2, b: 6}})), SONG16);
await p.evaluate(() => SYNQUENZER.uePlace('p-tom-kurz', 'M2'));   // Schläge 14–16 (vor der Kante bei Takt 5)
await p.evaluate(() => { clearLog(); SYNQUENZER.songPlay(2); });
const spb = await p.evaluate(() => 60 / S.bpm);
// zwei Durchläufe abwarten
await p.waitForTimeout(Math.round((2 * 16 + 2) * spb * 1000));
// im dritten Durchlauf: Übergang entfernen (während ▶)
await p.evaluate(() => SYNQUENZER.ueRemove(SYNQUENZER.ueList()[0].id));
await p.waitForTimeout(Math.round(16 * spb * 1000));
const log = await p.evaluate(() => { const l = noteLog(4096).filter(e => e.track === 4); SYNQUENZER.songPlay(false); return l.map(e => ({src: e.src, n: e.out, t: e.time})); });
const ue = log.filter(e => e.src === 'ue');
// je Durchlauf 8 Treffer, Abstand der Durchläufe = 16 Schläge
const groups = []; for (const e of ue) { const g = groups[groups.length - 1]; if (g && e.t - g[g.length - 1].t < 2 * spb) g.push(e); else groups.push([e]); }
const gap = groups.length >= 2 ? (groups[1][0].t - groups[0][0].t) / spb : null;
ok('Übergang klingt in jedem Durchlauf der Schleife (8 Treffer)', groups.length >= 2 && groups.slice(0, 2).every(g => g.length === 8), {durchlaeufe: groups.map(g => g.length)});
ok('Durchläufe genau 16 Schläge auseinander (±1 ms)', gap != null && Math.abs(gap - 16) * spb * 1000 <= 1, {schlaege: gap && +gap.toFixed(5)});
ok('Entfernen während ▶ wirkt ohne Stopp im nächsten Durchlauf', groups.length === 2, {durchlaeufe: groups.length});
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(OUT + '/ue-schleife.json', JSON.stringify(R, null, 1));
console.log('ERGEBNIS', R.filter(x => x.pass).length + '/' + R.length);
await b.close();
