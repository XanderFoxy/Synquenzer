// Wie ich ticke – welches Modul welche Ansicht baut (ARCH.md §2). Der Kern lädt ein Modul erst, wenn seine Ansicht geöffnet wird.
// Regel für parallele Arbeit: jedes Modul ändert NUR seinen eigenen Eintrag (Texte, Dauer, weitere Unter-Routen).
// routen: Pfad-Anfänge (ohne #), der längste passende gewinnt. fragen: Einträge für die Übersicht „Fragen“ (ergebnis = Ergebnis-Schlüssel).
// Start-Fragebogen (KONZEPT §2.2, Reihenfolge fest): Einträge mit start = Platz, bogen = Route direkt in den Fragebogen,
// anzahl = Fragen, minuten = Dauer, stand = 'modul:schlüssel.unter' (Zwischenstand in den Modul-Daten, für den Fortschritt), pflicht = nicht auslassbar.
export const MODULE = [
  {
    id: 'bigfive', name: 'Persönlichkeit (Big Five)',
    datei: './module/bigfive/modul.js', quellen: './module/bigfive/quellen.js',
    routen: ['fragen/bigfive'],
    fragen: [
      { route: 'fragen/bigfive', titel: 'Persönlichkeit (Big Five)', dauer: 'ca. 3 Min.', ergebnis: 'bigfive',
        start: 1, bogen: 'fragen/bigfive/start', anzahl: 30, minuten: 3, stand: 'bigfive:antworten', pflicht: true,
        kurz: 'Fünf große Grundzüge: Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, emotionale Stabilität. Danach genauer, wo es sich lohnt.' }
    ]
  },
  {
    id: 'interessen', name: 'Interessen, Rhythmus, Ehrlichkeit',
    datei: './module/interessen/modul.js', quellen: './module/interessen/quellen.js',
    routen: ['fragen/interessen'],
    fragen: [
      { route: 'fragen/interessen/ehrlichkeit', titel: 'Ehrlichkeit und Bescheidenheit', dauer: 'ca. 1 Min.', ergebnis: 'interessen.ehrlichkeit',
        start: 2, bogen: 'fragen/interessen/ehrlichkeit/bogen', anzahl: 12, minuten: 1, stand: 'interessen:ehrlichkeit.antworten',
        kurz: 'Fairness, Bescheidenheit und wie wichtig dir der eigene Vorteil ist.' },
      { route: 'fragen/interessen/riasec', titel: 'Interessen', dauer: 'ca. 2 Min.', ergebnis: 'interessen.riasec',
        start: 3, bogen: 'fragen/interessen/riasec/bogen', anzahl: 24, minuten: 2, stand: 'interessen:riasec.antworten',
        kurz: 'Welche Tätigkeiten dich anziehen – sechs Bereiche nach Holland, mit Ideen für Projekte.' },
      { route: 'fragen/interessen/rhythmus', titel: 'Tagesrhythmus', dauer: 'ca. 1 Min.', ergebnis: 'interessen.rhythmus',
        start: 4, bogen: 'fragen/interessen/rhythmus/eingabe', anzahl: 1, minuten: 1,
        kurz: 'Eher Morgen- oder Abendmensch? Aus deinen Schlafzeiten – mit deinem Fokus-Fenster.' }
    ]
  },
  {
    id: 'textspiegel', name: 'Text-Spiegel',
    datei: './module/textspiegel/modul.js', quellen: './module/textspiegel/quellen.js',
    routen: ['text'],                 // text · text/schreiben/<aufgabe> · text/spiegel · text/claude · text/blindtest
    fragen: []                        // bewusst leer: die Startseite zeigt den Text-Spiegel schon als eigene Zeile („Dein Stand“)
  },
  {
    id: 'passt', name: 'Profil und Was passt zu mir',
    datei: './module/passt/modul.js', quellen: './module/passt/quellen.js',
    routen: ['profil', 'passt'], fragen: []
  },
  {
    id: 'training', name: 'Training',
    datei: './module/training/modul.js', quellen: './module/training/quellen.js',
    routen: ['training'],             // training · training/gruppe/<id> · training/uebung/<id> · training/herausforderung/<i> · training/wachsen · training/plaene · training/woche · training/erinnerung
    fragen: []                        // bewusst leer: Training ist kein Fragebogen (eigene Kachel auf der Startseite)
  },
  {
    id: 'spiel', name: 'Entweder – oder',
    datei: './module/spiel/modul.js', quellen: './module/spiel/quellen.js',
    routen: ['spiel'],                // spiel · spiel/runde · spiel/ergebnis · spiel/so
    fragen: []                        // bewusst leer: eigenes Spiel (Kachel auf der Startseite, Karte in „Fragen“), nicht Teil des Start-Fragebogens
  }
];
