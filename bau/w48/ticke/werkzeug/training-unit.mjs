// Node-Test der reinen Teile des Training-Moduls (ohne DOM). Aufruf: node training-unit.mjs <pfad-zu-module/training>
import assert from 'assert';
const D = process.argv[2];
const U = await import(D + '/uebungen.js'), P = await import(D + '/plan.js'), A = await import(D + '/aeste.js'), Q = (await import(D + '/quellen.js')).QUELLEN;
let n = 0; const ok = (b, m) => { assert.ok(b, m); n++; };
// Quellen: keine Links, jede mit Erklärung
for (const [id, q] of Object.entries(Q)) { ok(!q.url && !/https?:/.test(JSON.stringify(q)), 'Link in ' + id); ok(q.erklaerung && q.erklaerung.length > 80, 'Erklärung ' + id); }
ok(Object.keys(Q).length === 41, '41 Quellen');
// Alle in Übungen genutzten Quellen-IDs: hier oder in bekannten fremden Dateien
const fremd = ['dunlosky2013', 'pashler2008', 'roberts2017', 'gollwitzer2006', 'ferrari2019', 'hudson2015', 'hudson2019', 'jacqueshamilton2019', 'steel2007', 'nettle2006', 'schmidt2007', 'wright2013', 'wittmann2006'];
const ids = new Set(); const sammle = (x) => (x && x.quellen || []).forEach((q) => ids.add(q));
U.GRUPPEN.forEach((g) => { sammle(g.intro); sammle(g.extra); }); U.UEBUNGEN.forEach((u) => { sammle(u.warum); sammle(u.gut); }); U.PROFIL_REGELN.forEach(sammle);
for (const q of ids) ok(Q[q] || fremd.includes(q), 'Quelle fehlt: ' + q);
// Übungen: keine Links nach draußen
for (const u of U.UEBUNGEN) { const l = u.werkzeug && u.werkzeug.link; ok(!l || /^#/.test(l.href), 'externer Link ' + u.id); }
ok(U.UEBUNG['h-atem'].werkzeug.atem && !U.UEBUNG['h-atem'].werkzeug.link, 'Atem in der App');
// Äste: Vertrag
ok(A.ASTE.length === 8, '8 Äste');
const bereiche = ['Persönlichkeit', 'Werte', 'Interessen', 'Rhythmus', 'Sprache', 'Entscheiden', 'Üben', 'Denkweise', 'Beziehungen'];
const saetze = (t) => t.split(/(?<=[.!?“])\s+(?=[A-ZÄÖÜ„])/).filter(Boolean).length;
for (const a of A.ASTE) {
  ok(/^training\.[a-z]+$/.test(a.id) && U.GRUPPE[a.id.slice(9)], 'id ' + a.id); ok(bereiche.includes(a.bereich), 'bereich');
  ok(a.pole.length === 2 && a.pole.every((p) => p.name && p.text), 'pole ' + a.id);
  const s = saetze(a.wasEsIst); ok(s >= 3 && s <= 6, `wasEsIst ${a.id}: ${s} Sätze`);
  for (const k of ['imAlltag', 'staerken', 'reibung', 'weiterdenken']) ok(a[k].length >= 3 && a[k].length <= 6, `${k} ${a.id}: ${a[k].length}`);
  ok(a.ueben.length >= 5 && a.ueben.every((x) => /^training\/(uebung\/[a-z0-9-]+|wachsen)$/.test(x.route)), 'ueben ' + a.id);
  ok(a.ueben.every((x) => !x.route.startsWith('training/uebung/') || U.UEBUNG[x.route.slice(16)]), 'ueben-Ziel ' + a.id);
  ok(a.wissen && !/http|www\./.test(JSON.stringify(a)), 'wissen/kein Link ' + a.id);
  ok(!/\d+\s*%|Prozent|Punkte|Note|Level|Serie|Rang/.test(JSON.stringify(a)), 'Bewertungs-Wort in ' + a.id);
  ok(a.unteraeste.length >= 3 && a.unteraeste.every((x) => x.id && x.titel && x.text), 'unteraeste ' + a.id);
}
// Muster: leer ohne Einträge
ok(A.musterAusDaten({}).length === 0, 'leer');
const h = '2026-11-24', g = P.plusTage(h, -1), v = P.plusTage(h, -3);
const tage = { [v]: [{ id: 'f-ein-ding', gut: 2 }, { id: 'k-benennen', gut: 0 }], [g]: [{ id: 'f-parkplatz', gut: 2 }, { id: 'k-drei-gute', gut: 2 }], [h]: [{ id: 'f-ein-ding', gut: null }, { id: 'l-abfragen', gut: 1 }, { id: 'h-gehen' }] };
const m = A.musterAusDaten({ tage, schwerpunkt: 'ziele' });
const by = Object.fromEntries(m.map((x) => [x.ast, x]));
ok(by['training.fokus'].deutlich === 'klar', 'fokus klar'); ok(by['training.gefuehle'].deutlich === 'beides', 'gefühle beides');
ok(by['training.lernen'].deutlich === 'beides', 'lernen weder noch → beides'); ok(by['training.gesundheit'].deutlich === 'leicht', 'gesundheit offen');
ok(by['training.ziele'] && /Schwerpunkt/.test(by['training.ziele'].woher), 'schwerpunkt');
for (const x of m) { ok(!/\d/.test(x.richtung) && !/\d/.test(x.woher), 'Zahl im Muster: ' + x.richtung); ok(['klar', 'leicht', 'beides'].includes(x.deutlich)); }
// Ein Gefühl ändern → Muster ändert sich
const t2 = JSON.parse(JSON.stringify(tage)); t2[g][0].gut = 0;
ok(A.musterAusDaten({ tage: t2 }).find((x) => x.ast === 'training.fokus').deutlich === 'beides', 'Änderung wirkt');
// jüngster Eintrag / jüngstes Gefühl
ok(P.juengsterEintrag(tage, 'f-ein-ding').datum === h && P.juengsterEintrag(tage, 'f-ein-ding').gut === null, 'jüngster Eintrag');
ok(P.juengstesGefuehl(tage, 'f-ein-ding') === 2, 'jüngstes Gefühl');
// vorher
let vo = P.mitVorher({}, 'zeit', { wert: 5, anzeige: 'bis 5 Min.' }, 10, 'z1');
for (let i = 0; i < 7; i++) vo = P.mitVorher(vo, 'zeit', { wert: i, anzeige: 'x' + i }, 99, 'z' + i);
ok(vo.zeit.length === 5 && vo.zeit[0].wert === 6, 'vorher max 5, neueste zuerst');
ok(Object.keys(P.mitVorher({}, 'a', { wert: null }, 1)).length === 0, 'kein vorher ohne alten Wert');
ok(Object.keys(P.mitVorher({}, 'a', { wert: 1 }, 1)).length === 0, 'kein vorher bei gleichem Wert');
// Gründe ohne Zahl/Vergleich
const bf = { schema: 1, bereiche: { gewissenhaftigkeit: { stufe: -2, klar: -1, wort: 'deutlich niedriger', unten: 30, oben: 38 }, extraversion: { stufe: 1, klar: 0, unten: 52, oben: 64 } } };
const rh = { schema: 1, typ: 'spaet', sozialerJetlag: 2.6, hinweise: ['kurz-geschlafen'], fokus: { von: 10, bis: 13 } };
const G = P.profilGruende(P.profilAus({ bigfive: bf, rhythmus: rh }));
const texte = Object.values(G).flat().map((x) => x.text);
ok(texte.length > 5, 'Gründe da');
for (const t of texte) ok(!/die meisten|niedriger|höher|Bereich \d|\d+,\d|unter sechs/.test(t), 'Vergleich/Zahl: ' + t);
ok(texte.some((t) => /klar in Richtung „spontan und beweglich“/.test(t)), 'klar-Pol'); ok(texte.some((t) => /leicht in Richtung „gesellig/.test(t)), 'leicht-Pol');
// Vorschlag: Gründe ohne Zähler
const vs = P.vorschlag({ tage: { [g]: [{ id: 'f-ein-ding', gut: 2 }, { id: 'f-ein-ding', gut: 2 }] }, datum: h, schwerpunkt: 'fokus' });
ok(vs.haupt && vs.gruende.every((x) => !/\d-mal|einmal gutgetan/.test(x.text)), 'Gründe ohne Zähler');
// Woche: kein Zähler-Feld
const W = P.woche(tage, h, 0, [{ id: 'p1', art: 'wenndann', felder: { wenn: 'a', dann: 'b' }, haken: [g, h] }]);
ok(!('aktiveTage' in W) && !('vorherAktiv' in W) && W.plaene[0].tage.length === 2 && typeof W.plaene[0].tage[0] === 'string', 'Woche ohne Zähler');
// zuletzt
const z = P.zuletzt(tage, h, 4); ok(z.length === 4 && z[0].id === 'h-gehen' && new Set(z.map((x) => x.id)).size === 4, 'zuletzt');
ok(P.tagWort(h, h) === 'heute' && P.tagWort(g, h) === 'gestern', 'tagWort');
// ics: nur eigene Adresse
const ics = P.ics({ ereignisse: [{ titel: 'T', text: 'x', zeit: '19:00', tage: ['MO'] }], url: 'https://beispiel.invalid/ticke/#training', jetzt: new Date(2026, 10, 24, 12) });
ok(/URL:https:\/\/beispiel\.invalid\/ticke\/#training/.test(ics.replace(/\r\n /g, '')), 'ics URL');
console.log('training-unit: ' + n + ' Prüfungen bestanden');
