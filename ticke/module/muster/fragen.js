// muster – Fragebogen „Denkweise“: 24 selbst formulierte Aussagen auf 8 Äste (keine geschützte Skala kopiert).
// Auswertung NUR in Worten: Richtung zwischen zwei gleichwertigen Polen (bei „Sinn“: drei Wege nach Frankl) + deutlich
// ('klar' | 'leicht' | 'beides'). Keine Punkte, keine Prozente, kein richtig/falsch. Ohne DOM – auch in Node testbar.

export const SKALA = [
  { wert: 1, text: 'stimmt gar nicht' }, { wert: 2, text: 'stimmt eher nicht' }, { wert: 3, text: 'teils, teils' },
  { wert: 4, text: 'stimmt eher' }, { wert: 5, text: 'stimmt genau' }
];
export const SKALA_TEXT = Object.fromEntries(SKALA.map((s) => [s.wert, s.text]));

// pole[0] und pole[1] sind gleichwertig; satz = wie sich die Richtung in Worten anhört (du-Form).
export const ZWEIGE = [
  { id: 'neugier_denken', titel: 'Lust am Nachdenken',
    pole: [{ name: 'Denken als Freude', satz: 'Fragen ohne schnelle Antwort reizen dich – das Nachdenken selbst ist dir etwas wert.' },
      { name: 'Denken als Werkzeug', satz: 'Du denkst am liebsten dann, wenn daraus etwas Praktisches wird.' }] },
  { id: 'ungewissheit', titel: 'Umgang mit Offenem',
    pole: [{ name: 'Spielraum im Offenen', satz: 'Unklares darf bei dir eine Weile unklar bleiben – Mehrdeutiges ist für dich eher Spielraum.' },
      { name: 'Halt in der Klarheit', satz: 'Klare Absprachen und ein fester Rahmen geben dir Ruhe und Kraft.' }] },
  { id: 'lernen', titel: 'Wie du über Lernen denkst',
    pole: [{ name: 'Fähigkeiten wachsen', satz: 'Du siehst Können als etwas, das durch Üben wächst.' },
      { name: 'Begabungen nutzen', satz: 'Du baust auf das, was dir liegt, und setzt deine Kraft dort ein, wo deine Stärken sind.' }] },
  { id: 'kontrolle', titel: 'Was in deiner Hand liegt',
    pole: [{ name: 'In deiner Hand', satz: 'Du erlebst vieles als beeinflussbar – was passiert, hängt für dich stark von deinem Tun ab.' },
      { name: 'Im Lauf der Dinge', satz: 'Du siehst, wie viel von Umständen und Zufall abhängt, und kannst annehmen, was sich nicht ändern lässt.' }] },
  { id: 'entscheiden', titel: 'Bauch und Kopf',
    pole: [{ name: 'Aus dem Bauch', satz: 'Du vertraust oft deinem ersten Gespür.' },
      { name: 'Mit dem Kopf', satz: 'Du wägst gern ab und entscheidest, wenn du es dir erklären kannst.' }] },
  { id: 'werte_wandel', titel: 'Bewahren und Verändern',
    pole: [{ name: 'Bewahren', satz: 'Dir ist wichtig, was trägt: Verlässliches, Gewachsenes, Traditionen.' },
      { name: 'Verändern', satz: 'Dich zieht das Neue: eigene Wege, Abwechslung, Aufbruch.' }] },
  { id: 'werte_ich_wir', titel: 'Ich und Wir',
    pole: [{ name: 'Selbstbestimmung', satz: 'Du gehst gern deinen eigenen Weg und folgst deinem eigenen Urteil.' },
      { name: 'Verbundenheit', satz: 'Zusammenhalt und das Wohl der Menschen um dich sind dir besonders wichtig.' }] },
  { id: 'sinn', titel: 'Woraus du Sinn ziehst',
    wege: [{ name: 'Schaffen', satz: 'Sinn erlebst du vor allem, wenn du etwas erschaffst, bewirkst oder gibst.' },
      { name: 'Erleben', satz: 'Sinn erlebst du vor allem in Begegnung, Natur, Kunst und Musik.' },
      { name: 'Haltung', satz: 'Sinn findest du auch darin, wie du dem begegnest, was sich nicht ändern lässt.' }] }
];
export const ZWEIG = Object.fromEntries(ZWEIGE.map((z) => [z.id, z]));

// pol: Zustimmung spricht für pole[pol]. weg: bei „sinn“ der Weg (0 Schaffen, 1 Erleben, 2 Haltung). Reihenfolge = Reihenfolge im Bogen.
export const AUSSAGEN = [
  { id: 'd01', zweig: 'neugier_denken', pol: 0, text: 'Ich denke gern über Fragen nach, auf die es keine schnelle Antwort gibt.' },
  { id: 'd02', zweig: 'ungewissheit', pol: 0, text: 'Wenn etwas noch unklar ist, kann ich das gut eine Weile so stehen lassen.' },
  { id: 'd03', zweig: 'lernen', pol: 0, text: 'Ich glaube, dass man fast alles lernen kann, wenn man lange genug übt.' },
  { id: 'd04', zweig: 'kontrolle', pol: 0, text: 'Was aus meinem Leben wird, hängt vor allem davon ab, was ich selbst tue.' },
  { id: 'd05', zweig: 'entscheiden', pol: 0, text: 'Bei wichtigen Entscheidungen verlasse ich mich oft auf mein Gefühl.' },
  { id: 'd06', zweig: 'werte_wandel', pol: 1, text: 'Ich probiere gern neue Wege aus, auch wenn die alten noch funktionieren.' },
  { id: 'd07', zweig: 'werte_ich_wir', pol: 0, text: 'Es ist mir wichtig, meine Entscheidungen selbst zu treffen – auch wenn andere es anders machen würden.' },
  { id: 'd08', zweig: 'sinn', weg: 0, text: 'Sinn erlebe ich vor allem, wenn ich etwas erschaffe, bewirke oder für andere tue.' },
  { id: 'd09', zweig: 'neugier_denken', pol: 1, text: 'Nachdenken lohnt sich für mich vor allem, wenn am Ende etwas Praktisches herauskommt.' },
  { id: 'd10', zweig: 'ungewissheit', pol: 1, text: 'Ich mag es, wenn Regeln und Erwartungen eindeutig sind.' },
  { id: 'd11', zweig: 'lernen', pol: 1, text: 'Ich glaube, jeder Mensch hat Dinge, die ihm einfach liegen – und andere, die ihm nie ganz liegen werden.' },
  { id: 'd12', zweig: 'kontrolle', pol: 1, text: 'Vieles, was mir passiert, hängt von Umständen ab, auf die ich keinen Einfluss habe.' },
  { id: 'd13', zweig: 'entscheiden', pol: 1, text: 'Bevor ich mich entscheide, wäge ich gern Vor- und Nachteile genau ab.' },
  { id: 'd14', zweig: 'werte_wandel', pol: 0, text: 'Bewährtes und Traditionen geben mir Halt.' },
  { id: 'd15', zweig: 'werte_ich_wir', pol: 1, text: 'Ich fühle mich am wohlsten, wenn ich Teil einer Gemeinschaft bin, die zusammenhält.' },
  { id: 'd16', zweig: 'sinn', weg: 1, text: 'Sinn erlebe ich vor allem im Erleben: in Begegnungen, in der Natur, in Musik oder Kunst.' },
  { id: 'd17', zweig: 'neugier_denken', pol: 0, text: 'Ein schwieriges Gedankenproblem reizt mich mehr, als dass es mich stört.' },
  { id: 'd18', zweig: 'ungewissheit', pol: 0, text: 'Dinge, die man auf mehrere Arten verstehen kann, finde ich eher spannend als anstrengend.' },
  { id: 'd19', zweig: 'lernen', pol: 1, text: 'Ich stecke meine Kraft lieber in das, was mir schon liegt, als in das, was mir schwerfällt.' },
  { id: 'd20', zweig: 'kontrolle', pol: 0, text: 'Wenn ich mir etwas fest vornehme, finde ich meistens einen Weg, es zu schaffen.' },
  { id: 'd21', zweig: 'entscheiden', pol: 0, text: 'Meine erste Eingebung stellt sich hinterher oft als passend heraus.' },
  { id: 'd22', zweig: 'werte_wandel', pol: 1, text: 'Veränderung fühlt sich für mich eher nach Aufbruch an als nach Verlust.' },
  { id: 'd23', zweig: 'werte_ich_wir', pol: 1, text: 'Was die Menschen, die mir nahe sind, brauchen, ist mir oft genauso wichtig wie das, was ich selbst will.' },
  { id: 'd24', zweig: 'sinn', weg: 2, text: 'Auch in schweren Zeiten kann ich Sinn darin finden, wie ich mit ihnen umgehe.' }
];
export const AUSSAGE = Object.fromEntries(AUSSAGEN.map((a) => [a.id, a]));
export const MIN_JE_ZWEIG = 2;            // so viele Antworten braucht ein Ast, bevor eine Richtung genannt wird

const gueltig = (w) => Number.isInteger(w) && w >= 1 && w <= 5;
export const DEUTLICH_WORT = { klar: 'Klar in Richtung', leicht: 'Leicht in Richtung', beides: 'Beides gehört zu dir' };

// Richtung eines Astes aus den Antworten (Objekt id → 1..5 | null). Gibt null zurück, solange zu wenig beantwortet ist.
// Ergebnis: { zweig, deutlich, pol (0|1|null), wege ([namen]), wort (kurz für den Baum), richtung (ein Satz), belege [{id, wert}] }
export function richtungVon(zweigId, antworten = {}) {
  const Z = ZWEIG[zweigId]; if (!Z) return null;
  const belege = AUSSAGEN.filter((a) => a.zweig === zweigId && gueltig(antworten[a.id])).map((a) => ({ id: a.id, wert: antworten[a.id] }));
  if (belege.length < MIN_JE_ZWEIG) return null;
  if (Z.wege) return sinnRichtung(Z, belege);
  // Mittel der Neigung zu pole[1] (-2 … +2); nur intern, wird nie angezeigt.
  const m = belege.reduce((s, b) => s + (AUSSAGE[b.id].pol === 1 ? b.wert - 3 : 3 - b.wert), 0) / belege.length;
  const betrag = Math.abs(m);
  if (betrag < 0.5) {
    const [a, b] = Z.pole;
    return { zweig: zweigId, deutlich: 'beides', pol: null, wege: null, wort: 'beides',
      richtung: `Beides gehört zu dir: „${a.name}“ und „${b.name}“ – je nach Lage.`, belege };
  }
  const pol = m > 0 ? 1 : 0, P = Z.pole[pol], deutlich = betrag >= 1.25 ? 'klar' : 'leicht';
  return { zweig: zweigId, deutlich, pol, wege: null, wort: P.name, richtung: `${DEUTLICH_WORT[deutlich]} „${P.name}“: ${P.satz}`, belege };
}
function sinnRichtung(Z, belege) {
  const je = Z.wege.map((w, i) => { const b = belege.find((x) => AUSSAGE[x.id].weg === i); return b ? b.wert : null; });
  const da = je.map((w, i) => ({ i, w })).filter((x) => x.w != null).sort((a, b) => b.w - a.w);
  const oben = da[0].w;
  const basis = { zweig: Z.id, pol: null, belege };
  if (oben <= 2) return { ...basis, deutlich: 'beides', wege: [], wort: 'eigene Wege', richtung: 'Keiner der drei Wege trifft es für dich ganz – vielleicht findest du Sinn auf deine eigene Weise.' };
  const spitze = da.filter((x) => x.w === oben).map((x) => x.i);
  const alle = Z.wege.map((w) => w.name);
  if (spitze.length >= 3 || (spitze.length === da.length && da.length >= 3)) {
    return { ...basis, deutlich: 'beides', wege: alle, wort: 'alle drei Wege', richtung: `Alle drei Wege gehören zu dir: ${alle[0]}, ${alle[1]} und ${alle[2]} – je nach Lebenslage.` };
  }
  if (spitze.length === 2) {
    const n = spitze.map((i) => Z.wege[i].name);
    return { ...basis, deutlich: 'leicht', wege: n, wort: `${n[0]} und ${n[1]}`, richtung: `Leicht in Richtung „${n[0]}“ und „${n[1]}“: Sinn kommt bei dir aus beiden Quellen.` };
  }
  const W = Z.wege[spitze[0]], naechst = da[1] ? da[1].w : oben - 1;
  const deutlich = oben - naechst >= 2 ? 'klar' : 'leicht';
  return { ...basis, deutlich, wege: [W.name], wort: W.name, richtung: `${DEUTLICH_WORT[deutlich]} „${W.name}“: ${W.satz}` };
}

// Alle Äste auf einmal: { zweigId: richtung|null }
export function auswerten(antworten = {}) {
  return Object.fromEntries(ZWEIGE.map((z) => [z.id, richtungVon(z.id, antworten)]));
}
export const beantwortet = (antworten = {}) => AUSSAGEN.filter((a) => a.id in antworten).length;   // auch übersprungene (null) zählen als „gesehen“
export const fertig = (antworten = {}) => AUSSAGEN.every((a) => a.id in antworten);
