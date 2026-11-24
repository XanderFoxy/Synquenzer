// M1 bigfive – Texte zu den fünf Bereichen. Regeln (ARCH.md §5, KONZEPT §3): nur die Seite zeigen, auf der die Person liegt
// (keine zweiseitigen Barnum-Sätze), Stärken immer mit Kosten, jede Aussage mit Evidenz-Marke, „Was das nicht heißt“.
// stufe/quellen: Stärken am hohen Pol beschreiben, was die Fragen messen → „abgeleitet“ aus Johnson 2014. Stärken am NIEDRIGEN Pol sind
// positive Umdeutungen, die die Fragen nicht messen → „Idee“ (Prüfung 17.11., F4). Kosten ohne eigene Studie → „Idee“.
export const TEXTE = {
  offenheit: {
    was: 'Wie neugierig du auf Ideen, Fantasie, Kunst, Gefühle und Neues bist.',
    hoch: { staerke: 'Du gehst neuen Ideen gern nach und verbindest Dinge auf eigene Art.', kosten: 'Routine und Wiederholung können dich schnell langweilen – auch dann, wenn sie nötig wären.' },
    niedrig: { staerke: 'Du bleibst bei dem, was sich bewährt hat, und verlierst dich nicht in Ideen.', kosten: 'Ganz neue Wege und offene Fragen fühlen sich erst einmal fremd an.' },
    belegt: { text: 'Höhere Offenheit geht im Mittel mit mehr Interesse an künstlerischen und forschenden Tätigkeiten einher.', quellen: ['larson2002'] },
    nicht: { hoch: 'Höher heißt nicht klüger oder besser.', niedrig: 'Niedriger heißt nicht dumm oder einfallslos.' }
  },
  gewissenhaftigkeit: {
    was: 'Wie geplant, ordentlich, verlässlich und ausdauernd du an Dinge herangehst.',
    hoch: { staerke: 'Du planst, bleibst dran und hältst, was du zusagst.', kosten: 'Es kann dir schwerfallen, etwas unfertig zu lassen oder spontan umzuplanen.' },
    niedrig: { staerke: 'Du bist flexibel und kannst spontan umschwenken.', kosten: 'Lange Aufgaben ohne feste Struktur bringst du schwerer zu Ende.' },
    belegt: { text: 'Höhere Gewissenhaftigkeit geht im Mittel mit etwas besseren Noten und besserer Arbeitsleistung einher.', quellen: ['poropat2009', 'barrick1991'] },
    nicht: { hoch: 'Höher heißt nicht, dass du nie etwas aufschiebst.', niedrig: 'Niedriger heißt nicht faul – oft eher: lieber spontan als nach Plan.' }
  },
  extraversion: {
    was: 'Wie gern du unter Menschen bist, wie viel Schwung du hast und wie sehr du Anregung suchst.',
    hoch: { staerke: 'Du kommst leicht in Kontakt und bringst Schwung in Gruppen.', kosten: 'Lange Zeit allein oder sehr ruhige Aufgaben können dich auslaugen.' },
    niedrig: { staerke: 'Du kannst gut für dich sein und dich lange auf eine Sache einlassen.', kosten: 'Viel Trubel und ständiger Kontakt kosten dich mehr Kraft als andere.' },
    belegt: { text: 'Höhere Extraversion geht im Mittel mit mehr Interesse an Tätigkeiten mit Menschen einher: führen, überzeugen, helfen.', quellen: ['larson2002'] },
    nicht: { hoch: 'Höher heißt nicht oberflächlich.', niedrig: 'Ruhiger heißt nicht schüchtern oder unfreundlich. Es ist eine Stelle auf einer Skala, kein Lager.' }
  },
  vertraeglichkeit: {
    was: 'Wie rücksichtsvoll, vertrauensvoll und mitfühlend du mit anderen umgehst.',
    hoch: { staerke: 'Du bist hilfsbereit, fair und kannst gut ausgleichen.', kosten: 'Eigene Wünsche und Grenzen kommen leicht zu kurz.' },
    niedrig: { staerke: 'Du sagst klar, was du denkst, und lässt dich nicht so leicht ausnutzen.', kosten: 'Andere können dich als kühl oder streitlustig erleben.' },
    belegt: { text: 'Menschen mit höherer Verträglichkeit verdienen im Mittel etwas weniger; bei Männern ist der Unterschied größer.', quellen: ['judge2012'] },
    nicht: { hoch: 'Höher heißt nicht naiv oder schwach.', niedrig: 'Niedriger heißt nicht böse – eher: direkt und mit eigenem Kopf.' }
  },
  stabilitaet: {
    was: 'Wie gelassen du mit Stress, Ärger, Sorgen und Rückschlägen umgehst. Das Fachwort für die Gegenseite heißt „Neurotizismus“.',
    hoch: { staerke: 'Du bleibst unter Druck eher ruhig und fängst dich schnell wieder.', kosten: 'Du nimmst Warnzeichen vielleicht weniger ernst als andere.' },
    niedrig: { staerke: 'Du spürst früh, wenn etwas nicht stimmt, und nimmst Gefühle ernst.', kosten: 'Stress, Ärger und Sorgen treffen dich stärker und halten länger an.', kostenStufe: 'abgeleitet' },
    belegt: { text: 'Emotionale Stabilität hängt im Mittel deutlich mit Zufriedenheit zusammen – und in Studien zu Therapie und Begleitung veränderte sie sich am deutlichsten.', quellen: ['steel2008', 'roberts2017'] },
    nicht: { hoch: 'Höher heißt nicht, dass dich nichts berührt.', niedrig: 'Niedriger heißt nicht krank. Das hier ist keine Diagnose.' }
  }
};

export const MITTE = 'Du liegst nahe der Mitte. Das ist häufig und heißt meist: Es kommt auf die Lage an. Die Facetten zeigen genauer, wo du stehst.';
export const UNKLAR = 'Der Bereich ist noch breit. Mit mehr Fragen wird er schmaler.';
export const FRAGLICH = 'Weil die Antworten diesmal fraglich wirken, deutet die App diesen Bereich nicht. Füll den Fragebogen in Ruhe noch einmal aus, dann bekommst du hier Stärken und Kosten.';

export const GRUENDE = {
  widerspruch: 'Deine Antworten in diesem Bereich gehen weit auseinander. Mehr Fragen zeigen, ob dahinter verschiedene Facetten stecken.',
  mitte: 'Du liegst nahe der Mitte. Oft gleichen sich dann hohe und niedrige Facetten aus – mehr Fragen zeigen das.',
  deutlich: 'Hier liegst du deutlich außerhalb der Mitte. Die Facetten zeigen, woher das kommt.'
};

export const QUALITAET = {
  schnell: (ms) => `Du warst sehr schnell – im Mittel etwa ${(ms / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Sekunden pro Frage. Wenn du die Sätze nur überflogen hast, wird das Ergebnis ungenauer.`,
  gleich: (lauf) => `Du hast sehr oft dieselbe Antwort gewählt (bis zu ${lauf}-mal hintereinander). Die Fragen zeigen aber in beide Richtungen – das passt selten zu dem, wie jemand wirklich ist.`,
  jaSager: () => 'Du hast fast allem zugestimmt – auch Sätzen, die in entgegengesetzte Richtungen zeigen.',
  neinSager: () => 'Du hast fast alles abgelehnt – auch Sätze, die in entgegengesetzte Richtungen zeigen.'
};
