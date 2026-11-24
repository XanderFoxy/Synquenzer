// Prüft regeln.js/texte.js von M4 passt ohne Browser: keine Zahlen/Prozente in Texten, Muster in Worten, Alltag, Entwicklung.
const P = process.argv[2];
const R_ = await import(P + '/regeln.js'), T = await import(P + '/texte.js');
let fehler = 0; const ok = (b, m) => { if (!b) { fehler++; console.log('FEHLER:', m); } };
const band = (wert, h = 6, grob = false) => ({ wert, unten: wert - h, oben: wert + h, grob });
const bf = { schema: 1, skala: 'T', form: 'start', bereiche: { offenheit: band(68), gewissenhaftigkeit: band(41, 7), extraversion: band(30), vertraeglichkeit: band(52), stabilitaet: band(58, 6) }, facetten: {}, qualitaet: { fraglich: false } };
const riasec = { schema: 1, skala: 'pomp', typen: { R: { wert: 30, stufe: -1 }, I: { wert: 70, stufe: 1 }, A: { wert: 88, stufe: 2 }, S: { wert: 55, stufe: 0 }, E: { wert: 20, stufe: -1 }, C: { wert: 40, stufe: 0 } }, top: ['A', 'I', 'S'], knapp: { drittVierter: 'C' } };
const rhythmus = { schema: 1, typ: 'eher-spaet', wort: 'eher Abendtyp', fokus: { von: 10.5, bis: 13.5 }, fokus2: { von: 16, bis: 18.5 }, ideen: { von: 7.5, bis: 9.5 }, sozialerJetlag: 2.4, schlafmitteKorr: 5.2 };
const ehr = { schema: 1, skala: 'pomp', wert: 72, unten: 64, oben: 80, stufe: 1, wort: 'eher fair' };
const roh = { bigfive: bf, 'interessen.riasec': riasec, 'interessen.rhythmus': rhythmus, 'interessen.ehrlichkeit': ehr };
const probe = { extraversion: 'b', gewissenhaftigkeit: 'a', offenheit: 'a' };
const R = R_.auswerten(roh, { probe });
const texte = [];
for (const [k, l] of Object.entries(R.abschnitte)) for (const a of l) { texte.push([k + ':' + a.id + ' text', a.text]); texte.push([k + ':' + a.id + ' weil', a.weil]); if (a.kosten) texte.push([k + ' kosten', a.kosten.text]); }
const Z = R_.zusammenschau(R, { titel: 'Gelassener werden', warum: 'mich wohler fühlen' }); Z.forEach((s) => texte.push(['zusammenschau', s]));
const RL = R_.richtungsListe(R); RL.forEach((r) => texte.push(['richtung ' + r.id, r.text + ' ' + r.pole.join(' / ')]));
const M = R_.musterAus(R, { titel: 'Gelassener werden', warum: 'mich wohler fühlen' }); M.forEach((m) => { texte.push(['muster ' + m.ast, m.richtung]); texte.push(['muster woher', m.woher]); ok(['klar', 'leicht', 'beides'].includes(m.deutlich), 'deutlich ' + m.deutlich); ok(m.ast.startsWith('passt.'), 'ast ' + m.ast); });
R.alltag.forEach((x) => texte.push(['alltag', x.weil]));
for (const a of T.AESTE) for (const f of ['wasEsIst', 'wissen']) texte.push(['ast ' + a.id + ' ' + f, a[f]]);
for (const a of T.AESTE) for (const f of ['imAlltag', 'staerken', 'reibung', 'weiterdenken']) { ok(a[f].length >= 3 && a[f].length <= 6, a.id + ' ' + f + ' Länge ' + a[f].length); a[f].forEach((t) => texte.push(['ast ' + a.id, t])); }
for (const a of T.AESTE) { const n = a.wasEsIst.split(/(?<=[.!?])\s+/).length; ok(n >= 3 && n <= 6, a.id + ' wasEsIst Sätze ' + n); ok(!a.pole || a.pole.length === 2, a.id + ' pole'); }
// Zahlen: erlaubt nur Uhrzeiten (hh:mm) in ar-zeit/ar-einfall und Jahreszahlen/Altersangaben in wissen/wasEsIst (20 und 40, 19 Stichproben)
const verboten = /%|Prozent|Punkte?\b|Platz \d|von \d|Rang|höher als|niedriger als|als die meisten|richtig lag|daneben|Bereich \d|Mitte 50/;
for (const [w, t] of texte) {
  if (!t) continue;
  ok(!verboten.test(t), `Bewertungs-Wort in ${w}: ${t}`);
  const ohne = t.replace(/\b\d{1,2}:\d{2}\b/g, '').replace(/\((19|20)\d\d\)/g, '').replace(/\b(19|20)\d\d\b/g, '').replace(/zwischen 20 und 40/gi, '').replace(/etwa 20 Minuten/g, '').replace(/19 Stichproben/g, '');
  ok(!/\d/.test(ohne), `Zahl in ${w}: ${t}`);
}
console.log('Zusammenschau:'); Z.forEach((s) => console.log('  ', s));
console.log('Richtungen:'); RL.forEach((r) => console.log('  ', r.titel, '|', r.text, '|', r.deutlich, r.seite));
console.log('Muster:'); M.forEach((m) => console.log('  ', m.ast, '|', m.deutlich, '|', m.richtung, '|', m.woher));
console.log('Alltag:'); R.alltag.forEach((x) => console.log('  ', x.bereich, x.wahl, x.vergleich, x.weil));
// Antwort ändern → Muster ändert sich
const R2 = R_.auswerten(roh, { probe: { ...probe, gewissenhaftigkeit: 'b' } }), M2 = R_.musterAus(R2, null);
const s1 = M.find((m) => m.ast === 'passt.arbeit_struktur'), s2 = M2.find((m) => m.ast === 'passt.arbeit_struktur');
ok(s1 && s2 && s1.richtung !== s2.richtung, 'Muster ändert sich nach Alltags-Wahl'); console.log('Struktur vorher:', s1.richtung, '\n         nachher:', s2.richtung);
// Nur Alltag, ohne Fragebogen
const R3 = R_.auswerten({}, { probe: { offenheit: 'b' } }), M3 = R_.musterAus(R3, null);
ok(M3.length === 1 && M3[0].ast === 'passt.arbeit_neues' && M3[0].deutlich === 'leicht', 'nur Alltag'); console.log('nur Alltag:', JSON.stringify(M3));
ok(R_.musterAus(R_.auswerten({}, {}), null).length === 0, 'leer → []');
// Entwicklung in Worten
const E = R_.entwicklung(bf, { ...bf, bereiche: { ...bf.bereiche, offenheit: band(45, 4), extraversion: band(32) } });
E.forEach((x) => ok(!/\d/.test(x.text), 'Entwicklung Zahl')); console.log('Entwicklung:', E.map((x) => x.name + ' ' + x.text).join(' | '));
// Fraglich
const RF = R_.auswerten({ bigfive: { ...bf, qualitaet: { fraglich: true } } }, {}); ok(RF.fraglich && R_.musterAus(RF, null).length === 0 && R_.zusammenschau(RF).length === 0, 'fraglich ohne Richtungen');
// alte Vorlage-Daten (ohne neue Felder) laden
const RA = R_.auswerten({ bigfive: { schema: 1, skala: 'T', bereiche: { offenheit: { wert: 60, unten: 52, oben: 68 } } } }, {}); ok(RA.eingaben.bigfive && R_.richtungsListe(RA).length === 1, 'alte Daten');
console.log('Texte geprüft:', texte.length, 'Äste:', T.AESTE.length, 'Fehler:', fehler);
process.exit(fehler ? 1 : 0);
