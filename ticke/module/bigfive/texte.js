// M1 bigfive – Texte zu den fünf Bereichen (Fassung 24.11.2026: keine Bewertung).
// Regeln: je Bereich zwei GLEICHWERTIGE Pole, beide mit Stärken; Richtung nur in Worten („klar“, „leicht“, „beides gehört zu dir“);
// kein Vergleich mit anderen, keine Zahl, die die Person beschreibt; Forschung als Tendenz über viele Menschen mit Evidenz-Marke.
// pole[0] = erster Pol (Zustimmung in App-Richtung, daten.js BEREICHE.rechts), pole[1] = Gegenpol (BEREICHE.links).
export const TEXTE = {
  offenheit: {
    was: 'Wie stark dich Neues, Ideen, Fantasie und Schönes anziehen – und wie viel Halt dir Vertrautes gibt.',
    pole: [
      { name: 'Neugier auf Neues', kurz: 'neue Ideen, Bilder und Wege ziehen dich an', text: 'Du gehst Ideen gern nach, verbindest Dinge auf eigene Art und hältst Offenes gut aus. Stärken: Einfallsreichtum, Lust am Lernen, ein Blick für ungewöhnliche Lösungen.' },
      { name: 'Halt im Bewährten', kurz: 'Bewährtes und Vertrautes geben dir Halt', text: 'Du bleibst bei dem, was sich bewährt hat, und verlierst dich nicht in Ideen. Stärken: Bodenhaftung, Verlässlichkeit, ein klarer Blick für das Praktische.' }
    ],
    forschung: { text: 'Über viele Menschen gesehen hängt die Seite „Neugier auf Neues“ mit mehr Interesse an künstlerischen und forschenden Tätigkeiten zusammen.', quellen: ['larson2002'] },
    nicht: 'Neugier heißt nicht klüger. Bewährtes schätzen heißt nicht einfallslos.'
  },
  gewissenhaftigkeit: {
    was: 'Wie du an Aufgaben herangehst: eher mit Plan, Ordnung und Ausdauer – oder eher spontan und aus dem Moment.',
    pole: [
      { name: 'Plan und Struktur', kurz: 'du planst gern und bleibst dran', text: 'Du planst, ordnest und hältst, was du zusagst. Stärken: Ausdauer, Verlässlichkeit, Dinge wirklich zu Ende bringen.' },
      { name: 'Spontan und beweglich', kurz: 'du entscheidest gern aus dem Moment', text: 'Du kannst umschwenken, improvisieren und Gelegenheiten nutzen. Stärken: Beweglichkeit, Ruhe bei Planänderungen, Leichtigkeit.' }
    ],
    forschung: { text: 'Über viele Menschen gesehen hängt die Seite „Plan und Struktur“ mit etwas besseren Schulnoten und Arbeitsleistungen zusammen. Das ist eine Tendenz, keine Vorhersage für dich.', quellen: ['poropat2009', 'barrick1991'] },
    nicht: 'Spontan heißt nicht faul. Geplant heißt nicht steif.'
  },
  extraversion: {
    was: 'Woher du Energie bekommst: eher unter Menschen und in Bewegung – oder eher in der Ruhe und für dich.',
    pole: [
      { name: 'Kontakt und Schwung', kurz: 'Menschen und Bewegung geben dir Energie', text: 'Du kommst leicht in Kontakt, bringst Schwung in Gruppen und gehst gern voran. Stärken: Begeisterung, Tatkraft, Menschen zusammenbringen.' },
      { name: 'Ruhe und Tiefe', kurz: 'Ruhe und wenige, enge Kontakte geben dir Kraft', text: 'Du kannst gut für dich sein, lange bei einer Sache bleiben und genau zuhören. Stärken: Konzentration, Tiefe, ein ruhiger Blick von außen.' }
    ],
    forschung: { text: 'Über viele Menschen gesehen hängt die Seite „Kontakt und Schwung“ mit mehr Interesse an Tätigkeiten mit Menschen zusammen: führen, überzeugen, helfen.', quellen: ['larson2002'] },
    nicht: 'Ruhig heißt nicht schüchtern. Gesellig heißt nicht oberflächlich.'
  },
  vertraeglichkeit: {
    was: 'Wie du mit anderen umgehst, wenn Wünsche aufeinandertreffen: eher ausgleichend – oder eher klar und mit eigenem Kopf.',
    pole: [
      { name: 'Rücksicht und Miteinander', kurz: 'dir ist wichtig, dass es allen gut geht', text: 'Du bist hilfsbereit, vertraust anderen und gleichst gern aus. Stärken: Fairness, Mitgefühl, Gruppen zusammenhalten.' },
      { name: 'Klarheit und eigener Kopf', kurz: 'du sagst, was du denkst, und prüfst selbst', text: 'Du sagst klar, was du denkst, prüfst, bevor du vertraust, und stehst für dich ein. Stärken: Ehrlichkeit, kritisches Denken, gut verhandeln.' }
    ],
    forschung: { text: 'Über viele Menschen gesehen verdienen Menschen auf der Seite „Rücksicht und Miteinander“ etwas weniger – Rücksicht wird nicht überall belohnt.', quellen: ['judge2012'] },
    nicht: 'Direkt heißt nicht böse. Rücksichtsvoll heißt nicht schwach.'
  },
  stabilitaet: {
    was: 'Wie stark Stress, Sorgen, Ärger und Rückschläge dich bewegen. In der Forschung heißt dieser Bereich „emotionale Stabilität“.',
    pole: [
      { name: 'Gelassene Ruhe', kurz: 'Stress perlt eher an dir ab', text: 'Du bleibst unter Druck eher ruhig und fängst dich schnell wieder. Stärken: Ruhe in Krisen, Ausdauer nach Rückschlägen, ein Anker für andere.' },
      { name: 'Feines Gespür', kurz: 'du spürst Gefühle und Spannungen deutlich', text: 'Du merkst früh, wenn etwas nicht stimmt, und nimmst Gefühle ernst – deine eigenen und die anderer. Stärken: Warnzeichen früh sehen, Tiefe im Erleben, Verständnis für andere.' }
    ],
    forschung: { text: 'Über viele Menschen gesehen hängt die ruhigere Seite mit mehr Lebenszufriedenheit zusammen. Zugleich verändert sich dieser Bereich bei vielen mit den Jahren – in Studien zu Begleitung und Therapie am deutlichsten.', quellen: ['steel2008', 'roberts2017'] },
    nicht: 'Feines Gespür heißt nicht krank. Gelassen heißt nicht gleichgültig. Das hier ist keine Diagnose.'
  }
};

// Ein Satz zur Richtung (ohne Zahl). r = { pol, deutlich } aus rechnen.js richtungAus().
export function satz(bereichId, r) {
  const T = TEXTE[bereichId]; if (!T || !r) return '';
  const [a, b] = T.pole;
  if (r.deutlich === 'beides' || !r.pol) return `Beides gehört zu dir: „${a.name}“ und „${b.name}“ – je nach Lage zeigt sich mal das eine, mal das andere.`;
  const p = r.pol > 0 ? a : b;
  return r.deutlich === 'klar' ? `Klar in Richtung „${p.name}“ – ${p.kurz}.` : `Leicht in Richtung „${p.name}“ – ${p.kurz}; die andere Seite kennst du aber auch.`;
}
export const DEUTLICH = { klar: 'klar', leicht: 'leicht', beides: 'beides' };

// Warum „Genauer hinschauen“ hier lohnt – in Worten aus der eigenen Richtung (nicht aus einem Vergleich).
export function grundText(r) {
  if (!r || r.deutlich === 'beides') return 'Hier gehört beides zu dir. Mehr Sätze zeigen, in welchen Facetten sich welche Seite zeigt.';
  if (r.deutlich === 'klar') return 'Hier zeigt dein Muster klar in eine Richtung. Mehr Sätze zeigen, aus welchen Facetten das kommt.';
  return 'Hier neigst du leicht in eine Richtung. Mehr Sätze zeigen genauer, wie die Facetten zusammenspielen.';
}

export const FRAGLICH = 'Deine Antworten wirken diesmal eilig. Darum sagt die App die Richtungen vorsichtiger. Du kannst einzelne Antworten in Ruhe ansehen und ändern.';

// Hinweise zur Antwort-Qualität – freundlich und ohne Zahlen über die Person.
export const QUALITAET = {
  schnell: () => 'Du warst sehr schnell. Wenn du die Sätze nur überflogen hast, passt das Muster vielleicht nicht ganz zu dir.',
  gleich: () => 'Du hast sehr oft hintereinander dieselbe Antwort gewählt. Die Sätze zeigen aber in beide Richtungen – vielleicht lohnt ein zweiter Blick.',
  jaSager: () => 'Du hast fast allem zugestimmt – auch Sätzen, die in entgegengesetzte Richtungen zeigen.',
  neinSager: () => 'Du hast fast alles abgelehnt – auch Sätze, die in entgegengesetzte Richtungen zeigen.'
};
