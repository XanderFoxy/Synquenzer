// Kaninchenbau – Inhalte 0.1: 4 Gebiete, 12 Äste, je 3 Stufen × 3 Fragen, Quellen, Querverbindungen.
// Regel: nur echte, prüfbare Quellen (Titel, Autor, Verlag/ISBN oder Link). Geprüft per Websuche am 22.11.2026.
// Frage: f = Frage, r = richtige Antwort, x = falsche Antwort, e = „Gut zu wissen“. Die Seite (links/rechts) wird beim Spielen gemischt.

export const STUFEN = [
  { n: 1, name: 'Einsteiger' },
  { n: 2, name: 'Fortgeschritten' },
  { n: 3, name: 'Profi' }
];

export const TYP_NAME = { buch: 'Buch', artikel: 'Artikel', video: 'Video', uebung: 'Zum Üben' };
export const SPRACHE = { de: 'Deutsch', en: 'Englisch', it: 'Italienisch' };

export const GEBIETE = [
  { id: 'geschichte', name: 'Geschichte', frage: 'Geschichte – wie Menschen früher gelebt, gestritten und gebaut haben?',
    aeste: ['rom-caesar', 'athen-antike', 'ton-geschichte'], paar: ['rom-caesar', 'athen-antike'], zusatz: 'ton-geschichte' },
  { id: 'musik', name: 'Musikproduktion', frage: 'Musikproduktion – wie aus einzelnen Spuren ein fertiger Song wird?',
    aeste: ['mischen', 'mastering', 'synthese'], paar: ['mischen', 'mastering'], zusatz: 'synthese' },
  { id: 'reisen', name: 'Reisen', frage: 'Reisen – Städte, Orte und ihre Geschichten entdecken?',
    aeste: ['rom-reise', 'athen-reise', 'london-musik'], paar: ['rom-reise', 'athen-reise'], zusatz: 'london-musik' },
  { id: 'sprache', name: 'Sprache & Rhetorik', frage: 'Sprache & Rhetorik – wie Worte wirken und woher sie kommen?',
    aeste: ['rhetorik-antike', 'reden-heute', 'woerter-rom'], paar: ['rhetorik-antike', 'reden-heute'], zusatz: 'woerter-rom' }
];

export const QUELLEN = {
  'beard-spqr': { typ: 'buch', titel: 'SPQR. Die tausendjährige Geschichte Roms', wer: 'Mary Beard', wo: 'S. Fischer, 2016 (engl. Original: Profile Books 2015)', isbn: '978-3-10-002230-1', sprache: 'de' },
  'meier-caesar': { typ: 'buch', titel: 'Caesar', wer: 'Christian Meier', wo: 'Pantheon, 2018 (Erstausgabe: Severin und Siedler 1982)', isbn: '978-3-570-55384-8', sprache: 'de' },
  'caesar-bg': { typ: 'buch', titel: 'De bello Gallico / Der Gallische Krieg (lateinisch/deutsch)', wer: 'Gaius Iulius Caesar, übersetzt von Marieluise Deißmann', wo: 'Reclam', sprache: 'de', notiz: 'Caesars eigener Bericht – eine Quelle aus der Zeit selbst.' },
  'wp-caesar': { typ: 'artikel', titel: 'Gaius Iulius Caesar', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Gaius_Iulius_Caesar', sprache: 'de' },
  'livius-caesar': { typ: 'artikel', titel: 'Gaius Julius Caesar', wer: 'Livius.org', url: 'https://www.livius.org/articles/person/caesar/', sprache: 'en' },

  'platon-apologie': { typ: 'buch', titel: 'Apologie des Sokrates (griechisch/deutsch)', wer: 'Platon, übersetzt von Manfred Fuhrmann', wo: 'Reclams Universal-Bibliothek Nr. 8315', isbn: '978-3-15-008315-4', sprache: 'de' },
  'yale-kagan': { typ: 'video', titel: 'Introduction to Ancient Greek History (Video-Vorlesung, 24 Teile)', wer: 'Donald Kagan, Open Yale Courses (2007)', url: 'https://oyc.yale.edu/classics/clcv-205', sprache: 'en', notiz: 'Kostenlos, mit Mitschrift.' },
  'wp-kleisthenes': { typ: 'artikel', titel: 'Kleisthenische Reformen', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Kleisthenische_Reformen', sprache: 'de' },
  'wp-ekklesia': { typ: 'artikel', titel: 'Ekklesia (Antike)', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Ekklesia_(Antike)', sprache: 'de' },

  'milner': { typ: 'buch', titel: 'Perfecting Sound Forever. An Aural History of Recorded Music', wer: 'Greg Milner', wo: 'Faber and Faber, 2009', sprache: 'en' },
  'loc-zylinder': { typ: 'artikel', titel: 'History of the Cylinder Phonograph', wer: 'Library of Congress', url: 'https://www.loc.gov/static/collections/edison-company-motion-pictures-and-sound-recordings/articles-and-essays/history-of-edison-sound-recordings/history-of-the-cylinder-phonograph.html', sprache: 'en' },
  'wp-phonograph': { typ: 'artikel', titel: 'Phonograph', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Fonograf', sprache: 'de' },
  'wp-tonband': { typ: 'artikel', titel: 'Tonband', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Magnettonband', sprache: 'de' },
  'emerick': { typ: 'buch', titel: 'Here, There and Everywhere. My Life Recording the Music of the Beatles', wer: 'Geoff Emerick, Howard Massey', wo: 'Gotham Books, 2006', sprache: 'en', notiz: 'Erinnerungen eines Beatles-Toningenieurs; einzelne Angaben sind umstritten.' },

  'senior-mixing': { typ: 'buch', titel: 'Mixing Secrets for the Small Studio (2. Auflage)', wer: 'Mike Senior', wo: 'Routledge, 2018', isbn: '978-1-138-55637-9', sprache: 'en' },
  'cambridge-mt': { typ: 'uebung', titel: '„Mixing Secrets“: kostenlose Mehrspur-Aufnahmen zum Üben', wer: 'Cambridge-MT (Mike Senior)', url: 'https://cambridge-mt.com/ms/', sprache: 'en' },
  'wp-mehrspur': { typ: 'artikel', titel: 'History of multitrack recording', wer: 'Wikipedia (englisch)', url: 'https://en.wikipedia.org/wiki/History_of_multitrack_recording', sprache: 'en' },

  'katz': { typ: 'buch', titel: 'Mastering Audio. The Art and the Science (3. Auflage)', wer: 'Bob Katz', wo: 'Focal Press, 2015', isbn: '978-0-240-81896-2', sprache: 'en' },
  'sos-mastering': { typ: 'video', titel: 'Mastering Essentials (Videoreihe, 6 Teile)', wer: 'Ian Shepherd für Sound On Sound', url: 'https://www.soundonsound.com/techniques/mastering-essentials-what-is-mastering', sprache: 'en' },
  'spotify-lautheit': { typ: 'artikel', titel: 'Loudness normalization on Spotify', wer: 'Spotify for Artists', url: 'https://support.spotify.com/artists/article/loudness-normalization/', sprache: 'en' },
  'ebu-r128': { typ: 'artikel', titel: 'Loudness (EBU R 128)', wer: 'European Broadcasting Union', url: 'https://tech.ebu.ch/loudness', sprache: 'en' },

  'pinch-analog': { typ: 'buch', titel: 'Analog Days. The Invention and Impact of the Moog Synthesizer', wer: 'Trevor Pinch, Frank Trocco', wo: 'Harvard University Press, 2002', sprache: 'en' },
  'ableton-synths': { typ: 'uebung', titel: 'Learning Synths (interaktiv im Browser, auch auf Deutsch)', wer: 'Ableton', url: 'https://learningsynths.ableton.com/', sprache: 'de' },
  'sos-synth-secrets': { typ: 'artikel', titel: 'Synth Secrets (Artikelserie, 63 Teile)', wer: 'Gordon Reid, Sound On Sound', url: 'https://www.soundonsound.com/series/synth-secrets-sound-sound', sprache: 'en' },
  'moog-film': { typ: 'video', titel: 'Moog (Dokumentarfilm, 2004)', wer: 'Regie: Hans Fjellestad', url: 'https://www.imdb.com/title/tt0378378/', sprache: 'en' },
  'wp-subtraktiv': { typ: 'artikel', titel: 'Subtraktive Synthese', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Subtraktive_Synthese', sprache: 'de' },

  'goethe-italien': { typ: 'buch', titel: 'Italienische Reise', wer: 'Johann Wolfgang von Goethe', wo: 'Reclam Taschenbuch, 2020 · kostenlos bei Project Gutenberg', isbn: '978-3-15-020609-6', url: 'https://www.gutenberg.org/ebooks/2404', sprache: 'de' },
  'unesco-rom': { typ: 'artikel', titel: 'Historic Centre of Rome (UNESCO-Welterbe)', wer: 'UNESCO', url: 'https://whc.unesco.org/en/list/91/', sprache: 'en' },
  'yale-kleiner': { typ: 'video', titel: 'Roman Architecture (Video-Vorlesung, 23 Teile)', wer: 'Diana E. E. Kleiner, Open Yale Courses (2009)', url: 'https://oyc.yale.edu/history-of-art/hsar-252', sprache: 'en', notiz: 'Mit eigenen Teilen zu Kolosseum und Pantheon.' },
  'colosseo': { typ: 'artikel', titel: 'Parco archeologico del Colosseo (Kolosseum, Forum, Palatin)', wer: 'offizielle Seite', url: 'https://colosseo.it/', sprache: 'it' },

  'unesco-akropolis': { typ: 'artikel', titel: 'Acropolis, Athens (UNESCO-Welterbe)', wer: 'UNESCO', url: 'https://whc.unesco.org/en/list/404/', sprache: 'en' },
  'beard-parthenon': { typ: 'buch', titel: 'The Parthenon', wer: 'Mary Beard', wo: 'Profile Books, 2002', sprache: 'en' },
  'britannica-akropolismuseum': { typ: 'artikel', titel: 'Acropolis Museum', wer: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/topic/Acropolis-Museum', sprache: 'en' },

  'londonmuseum-abbeyroad': { typ: 'artikel', titel: 'The history of Abbey Road Studios', wer: 'London Museum', url: 'https://www.londonmuseum.org.uk/collections/london-stories/history-abbey-road-studios/', sprache: 'en' },
  'abbeyroad-story': { typ: 'artikel', titel: 'Our story', wer: 'Abbey Road Studios', url: 'https://www.abbeyroad.com/our-story', sprache: 'en' },
  'lewisohn': { typ: 'buch', titel: 'The Complete Beatles Recording Sessions', wer: 'Mark Lewisohn', wo: 'Hamlyn, 1988', sprache: 'en' },
  'wp-rah': { typ: 'artikel', titel: 'Royal Albert Hall', wer: 'Wikipedia (englisch)', url: 'https://en.wikipedia.org/wiki/Royal_Albert_Hall', sprache: 'en' },

  'aristoteles-rhetorik': { typ: 'buch', titel: 'Rhetorik', wer: 'Aristoteles, übersetzt von Gernot Krapinger', wo: 'Reclams Universal-Bibliothek Nr. 18006', isbn: '978-3-15-018006-8', sprache: 'de' },
  'ueding': { typ: 'buch', titel: 'Grundriß der Rhetorik. Geschichte, Technik, Methode (5. Auflage)', wer: 'Gert Ueding, Bernd Steinbrink', wo: 'J. B. Metzler, 2011', isbn: '978-3-476-02410-7', sprache: 'de' },
  'cicero-oratore': { typ: 'buch', titel: 'De oratore / Über den Redner (lateinisch/deutsch)', wer: 'Cicero, übersetzt von Harald Merklin', wo: 'Reclams Universal-Bibliothek Nr. 6884', sprache: 'de' },
  'sep-rhetorik': { typ: 'artikel', titel: 'Aristotle’s Rhetoric', wer: 'Christof Rapp, Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/aristotle-rhetoric/', sprache: 'en' },

  'schulz-von-thun': { typ: 'buch', titel: 'Miteinander reden 1. Störungen und Klärungen', wer: 'Friedemann Schulz von Thun', wo: 'Rowohlt, 1981 (viele Neuauflagen)', sprache: 'de' },
  'anderson-ted': { typ: 'buch', titel: 'TED Talks (deutsche Ausgabe des „Official TED Guide to Public Speaking“, 2016)', wer: 'Chris Anderson', wo: 'Fischer Taschenbuch', isbn: '978-3-596-03484-0', sprache: 'de' },
  'king-dream': { typ: 'artikel', titel: '„I Have a Dream“ – Hintergrund zur Rede', wer: 'Martin Luther King, Jr. Research and Education Institute, Stanford', url: 'https://kinginstitute.stanford.edu/i-have-dream', sprache: 'en' },
  'jfk-berlin': { typ: 'video', titel: 'Remarks at the Rudolph Wilde Platz, Berlin (Text und Filmausschnitt)', wer: 'John F. Kennedy Presidential Library', url: 'https://www.jfklibrary.org/learn/about-jfk/historic-speeches/remarks-at-the-rudolph-wilde-platz-berlin', sprache: 'en' },

  'kluge': { typ: 'buch', titel: 'Etymologisches Wörterbuch der deutschen Sprache (25. Auflage)', wer: 'Friedrich Kluge, bearbeitet von Elmar Seebold', wo: 'De Gruyter, 2011', isbn: '978-3-11-022364-4', sprache: 'de' },
  'weeber': { typ: 'buch', titel: 'Romdeutsch. Warum wir alle lateinisch reden, ohne es zu wissen', wer: 'Karl-Wilhelm Weeber', wo: 'Eichborn, 2006', sprache: 'de' },
  'wp-lehnwoerter': { typ: 'artikel', titel: 'Liste lateinischer Lehn- und Fremdwörter im Deutschen', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Liste_lateinischer_Lehn-_und_Fremdw%C3%B6rter_im_Deutschen', sprache: 'de' },
  'wp-erste-welle': { typ: 'artikel', titel: 'Erste lateinische Welle', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Erste_lateinische_Welle', sprache: 'de' },
  'wp-kaiser': { typ: 'artikel', titel: 'Kaiser', wer: 'Wikipedia', url: 'https://de.wikipedia.org/wiki/Kaiser', sprache: 'de' }
};

const S = (q, fragen) => ({ q, fragen });   // eine Stufe: Quelle zum Vertiefen + 3 Fragen

export const AESTE = {
  'rom-caesar': {
    gebiet: 'geschichte', titel: 'Caesar und das Ende der Republik', kurz: 'Caesar', wahl: 'Caesar und das alte Rom',
    intro: 'Ein Feldherr, der Gallien eroberte, den Rubikon überschritt und an den Iden des März starb. Mit ihm ging die römische Republik zu Ende.',
    zeit: '1. Jh. v. Chr.', orte: ['Rom'], personen: ['Caesar', 'Cicero', 'Augustus'],
    quellen: ['beard-spqr', 'meier-caesar', 'caesar-bg', 'wp-caesar', 'livius-caesar'],
    stufen: [
      S('wp-caesar', [
        { f: 'An welchem Tag wurde Caesar ermordet?', r: 'An den Iden des März 44 v. Chr.', x: 'Am Neujahrstag 1 n. Chr.', e: 'Am 15. März 44 v. Chr. erstachen ihn Senatoren in Rom.' },
        { f: 'Welchen Fluss überschritt Caesar 49 v. Chr. mit seinen Truppen?', r: 'Den Rubikon', x: 'Den Tiber', e: 'Der Rubikon war die Grenze zu Italien. Damit begann der Bürgerkrieg – „den Rubikon überschreiten“ heißt bis heute: kein Zurück mehr.' },
        { f: 'Welcher Monat ist nach Caesar benannt?', r: 'Juli', x: 'März', e: 'Aus Iulius wurde Juli. Vorher hieß der Monat Quintilis, „der Fünfte“.' }
      ]),
      S('beard-spqr', [
        { f: 'Mit wem schloss Caesar 60 v. Chr. das Bündnis, das man Triumvirat nennt?', r: 'Mit Pompeius und Crassus', x: 'Mit Octavian und Marcus Antonius', e: 'Das spätere, zweite Triumvirat (43 v. Chr.) bildeten Octavian, Antonius und Lepidus.' },
        { f: 'Wie heißt Caesars eigener Bericht über seine Kriege in Gallien?', r: 'De bello Gallico', x: 'De re publica', e: '„De re publica“ ist ein Werk Ciceros. Caesar schrieb über sich selbst in der dritten Person.' },
        { f: 'Welchen Kalender führte Caesar ein?', r: 'Den julianischen Kalender', x: 'Den gregorianischen Kalender', e: '365 Tage, alle vier Jahre ein Schalttag – gültig ab 45 v. Chr. Der gregorianische Kalender folgte erst 1582.' }
      ]),
      S('meier-caesar', [
        { f: 'Wo genau wurde Caesar getötet?', r: 'In der Kurie des Pompeius auf dem Marsfeld', x: 'Im Senatsgebäude auf dem Kapitol', e: 'Der Senat tagte an diesem Tag in einem Saal beim Theater des Pompeius. Reste liegen heute am Largo di Torre Argentina.' },
        { f: 'Wen setzte Caesar in seinem Testament als Haupterben ein?', r: 'Seinen Großneffen Octavian, den späteren Augustus', x: 'Seinen Feldherrn Marcus Antonius', e: 'Octavian wurde als erster Kaiser Roms zu Augustus.' },
        { f: 'Welcher berühmte Redner wurde 43 v. Chr. auf Betreiben des Antonius getötet?', r: 'Cicero', x: 'Seneca', e: 'Cicero hatte Antonius in seinen „Philippischen Reden“ scharf angegriffen. Seneca lebte erst ein Jahrhundert später.' }
      ])
    ]
  },
  'athen-antike': {
    gebiet: 'geschichte', titel: 'Athen und die erste Demokratie', kurz: 'Athen (Antike)', wahl: 'Athen und die erste Demokratie',
    intro: 'Im 5. Jahrhundert v. Chr. stimmten in Athen die Bürger selbst ab – ein Experiment, das bis heute nachwirkt. Hier lebten Perikles, Sokrates und später Aristoteles.',
    zeit: '5.–4. Jh. v. Chr.', orte: ['Athen'], personen: ['Perikles', 'Sokrates', 'Aristoteles'],
    quellen: ['platon-apologie', 'yale-kagan', 'wp-kleisthenes', 'wp-ekklesia'],
    stufen: [
      S('wp-ekklesia', [
        { f: 'Welcher Tempel auf der Akropolis ist der Göttin Athena geweiht?', r: 'Der Parthenon', x: 'Das Pantheon', e: 'Das Pantheon steht in Rom – leicht zu verwechseln!' },
        { f: 'Wofür ist das antike Athen besonders bekannt?', r: 'Als frühe Demokratie', x: 'Als Sitz der römischen Kaiser', e: 'Die Bürger entschieden in der Volksversammlung selbst über Gesetze und Krieg.' },
        { f: 'Welcher Philosoph wurde 399 v. Chr. in Athen zum Tod verurteilt?', r: 'Sokrates', x: 'Aristoteles', e: 'Sein Schüler Platon schrieb seine Verteidigungsrede auf: die „Apologie“.' }
      ]),
      S('platon-apologie', [
        { f: 'Wer leitete Athen, als ab 447 v. Chr. der Parthenon gebaut wurde?', r: 'Perikles', x: 'Alexander der Große', e: 'Alexander lebte rund ein Jahrhundert später und war Makedone.' },
        { f: 'Wie hieß die Versammlung aller stimmberechtigten Bürger Athens?', r: 'Ekklesia (Volksversammlung)', x: 'Senat', e: 'Sie tagte ab Kleisthenes auf dem Pnyx-Hügel. Der Senat ist römisch.' },
        { f: 'Welche Schule gründete Platon in Athen?', r: 'Die Akademie', x: 'Das Lykeion', e: 'Das Lykeion gründete später sein Schüler Aristoteles (um 335 v. Chr.).' }
      ]),
      S('yale-kagan', [
        { f: 'Wie hieß das Verfahren, mit dem Athen einen Bürger für zehn Jahre verbannen konnte?', r: 'Ostrakismos (Scherbengericht)', x: 'Proskription', e: 'Man ritzte den Namen in eine Tonscherbe (ostrakon). Die Proskription war die römische Ächtung – sie traf zum Beispiel Cicero.' },
        { f: 'Welcher Krieg gegen Sparta (431–404 v. Chr.) beendete Athens Blütezeit?', r: 'Der Peloponnesische Krieg', x: 'Der Trojanische Krieg', e: 'Der Athener Thukydides schrieb ihn als Zeitzeuge auf.' },
        { f: 'Wessen Reformen (508/507 v. Chr.) gelten als Grundstein der athenischen Demokratie?', r: 'Die des Kleisthenes', x: 'Die des Perikles', e: 'Kleisthenes ordnete die Bürgerschaft neu. Perikles baute die Demokratie Jahrzehnte später weiter aus.' }
      ])
    ]
  },
  'ton-geschichte': {
    gebiet: 'geschichte', titel: 'Wie Klang aufgenommen wurde', kurz: 'Tonaufnahme', zusatzFrage: 'Und die Geschichte der Tonaufnahme – von Edison bis zur CD?',
    intro: 'Von der Zinnfolie über Schallplatte und Tonband bis zur CD: wie Musik festgehalten wurde – und warum das die Musik selbst verändert hat.',
    zeit: '1877–1982', orte: ['Berlin', 'London'], personen: ['Thomas Edison', 'Les Paul', 'The Beatles'],
    quellen: ['milner', 'loc-zylinder', 'wp-phonograph', 'wp-tonband', 'emerick'],
    stufen: [
      S('loc-zylinder', [
        { f: 'Wer stellte 1877 den Phonographen vor, der Klang aufnehmen und wiedergeben konnte?', r: 'Thomas Edison', x: 'Robert Moog', e: 'Robert Moog baute fast 90 Jahre später Synthesizer.' },
        { f: 'Worauf ritzte der erste Phonograph den Klang?', r: 'Auf Zinnfolie um eine Metallwalze', x: 'Auf ein Magnetband', e: 'Die Folie hielt nur wenige Durchgänge. Später kamen Wachswalzen.' },
        { f: 'Welcher Tonträger setzte sich mit Emile Berliners Grammophon (1887) durch?', r: 'Die Schallplatte', x: 'Die CD', e: 'Platten ließen sich viel leichter in großer Zahl pressen als Walzen.' }
      ]),
      S('wp-tonband', [
        { f: 'In welcher Stadt stellte AEG 1935 das Magnetophon vor, ein frühes Tonbandgerät?', r: 'In Berlin', x: 'In London', e: 'Auf der Funkausstellung 1935. Das Tonband machte später Schnitt und Mehrspur möglich.' },
        { f: 'Was konnte das Tonband, was die Schallplatte nicht konnte?', r: 'Man konnte schneiden und neu aufnehmen', x: 'Es klang ganz ohne Rauschen', e: 'Band rauscht durchaus – dagegen kamen später Rauschunterdrückungen wie Dolby.' },
        { f: 'Welcher Gitarrist machte ab den späten 1940ern das Übereinander-Aufnehmen („Sound on Sound“) berühmt?', r: 'Les Paul', x: 'Jimi Hendrix', e: 'Les Paul spielte so ganze Ensembles allein ein. Hendrix begann erst in den 1960ern.' }
      ]),
      S('milner', [
        { f: 'Wie hießen die Londoner Abbey Road Studios bei ihrer Eröffnung 1931?', r: 'EMI Studios', x: 'Decca Studios', e: 'Den Namen Abbey Road bekamen sie später – nach dem Beatles-Album und der Straße.' },
        { f: 'Mit wie vielen Spuren je Bandmaschine nahmen die Beatles 1967 „Sgt. Pepper“ auf?', r: '4 Spuren', x: '24 Spuren', e: 'Für mehr Stimmen spielten sie fertige Spuren auf eine zweite Maschine zusammen („Bouncing“).' },
        { f: 'Welches Format brachten Philips und Sony 1982 auf den Markt?', r: 'Die Compact Disc (CD)', x: 'Die Musikkassette', e: 'Die Kassette gab es schon seit 1963 – auch sie kam von Philips.' }
      ])
    ]
  },

  'mischen': {
    gebiet: 'musik', titel: 'Mischen: aus Spuren wird ein Song', kurz: 'Mischen', wahl: 'Mischen: aus Spuren einen Song formen',
    intro: 'Lautstärke, Panorama, EQ und Kompressor: Beim Mischen bekommt jede Spur ihren Platz, damit am Ende alles zusammen klingt.',
    zeit: 'seit den 1950ern', orte: [], personen: ['Les Paul'],
    quellen: ['senior-mixing', 'cambridge-mt', 'wp-mehrspur'],
    stufen: [
      S('cambridge-mt', [
        { f: 'Was macht der Pan-Regler (Panorama) an einer Spur?', r: 'Er setzt den Klang zwischen links und rechts', x: 'Er macht den Klang höher', e: 'Höher wird ein Klang mit Tonhöhe oder Transponieren, nicht mit Pan.' },
        { f: 'Was verändert ein EQ (Equalizer)?', r: 'Die Lautstärke einzelner Frequenzbereiche', x: 'Das Tempo des Songs', e: 'Mit dem EQ hebt oder senkt man zum Beispiel Bässe, Mitten oder Höhen.' },
        { f: 'Was macht ein Kompressor, grob gesagt?', r: 'Er verringert den Abstand zwischen leisen und lauten Stellen', x: 'Er fügt Hall hinzu', e: 'Laute Stellen werden abgesenkt; danach kann man das Ganze wieder lauter machen.' }
      ]),
      S('senior-mixing', [
        { f: 'Wozu dient ein Hochpassfilter (Low-Cut) auf Gesang oder Gitarre?', r: 'Er entfernt tiefes Grummeln, das nicht gebraucht wird', x: 'Er entfernt hohe Zischlaute', e: 'Für Zischlaute gibt es den De-Esser.' },
        { f: 'Was bedeutet „Sidechain“ beim Kompressor, z. B. wenn der Bass unter der Kick wegduckt?', r: 'Ein anderes Signal steuert den Kompressor', x: 'Zwei Spuren werden zu einer zusammengemischt', e: 'Die Kick „drückt“ den Bass kurz leiser – typisch für Pop und House.' },
        { f: 'Warum hört man einen Mix auch einmal in Mono?', r: 'Um Auslöschungen und Phasenprobleme zu finden', x: 'Weil Mono immer lauter ist', e: 'Was in Mono verschwindet, fehlt später auf vielen Handy- und Bluetooth-Lautsprechern.' }
      ]),
      S('wp-mehrspur', [
        { f: 'Was regelt die „Attack“ an einem Kompressor?', r: 'Wie schnell er nach Überschreiten der Schwelle zupackt', x: 'Wie stark er den Pegel absenkt', e: 'Wie stark, regelt die Ratio; ab wann, der Threshold (Schwelle).' },
        { f: 'Was ist Parallelkompression („New York Compression“)?', r: 'Ein stark komprimiertes Signal wird dem unbearbeiteten beigemischt', x: 'Zwei Kompressoren hintereinander auf derselben Spur', e: 'So bleibt der Anschlag lebendig, und leise Details kommen trotzdem nach vorn.' },
        { f: 'Wer bekam 1957 eine der ersten 8-Spur-Bandmaschinen, „The Octopus“?', r: 'Les Paul', x: 'Phil Spector', e: 'Die Ampex-Maschine mit „Sel-Sync“ machte Mehrspuraufnahmen praktisch. Phil Spector wurde mit der „Wall of Sound“ bekannt.' }
      ])
    ]
  },
  'mastering': {
    gebiet: 'musik', titel: 'Mastering: Lautheit und Feinschliff', kurz: 'Mastering', wahl: 'Mastering: der letzte Schliff',
    intro: 'Der fertige Mix bekommt den letzten Schliff: passende Lautheit, saubere Spitzen und ein Klang, der überall funktioniert – vom Handy bis zum Club.',
    zeit: 'heute', orte: [], personen: [],
    quellen: ['katz', 'sos-mastering', 'spotify-lautheit', 'ebu-r128'],
    stufen: [
      S('sos-mastering', [
        { f: 'Was ist Mastering?', r: 'Der letzte Feinschliff des fertigen Mixes', x: 'Das Einsingen des Gesangs', e: 'Beim Mastering geht es um das ganze Stück: Klangbalance, Lautheit, Übergänge.' },
        { f: 'In welcher Einheit misst man heute die gehörte Lautheit?', r: 'LUFS', x: 'BPM', e: 'BPM ist das Tempo: Schläge pro Minute.' },
        { f: 'Was macht ein Limiter am Ende der Kette?', r: 'Er lässt den Pegel nicht über eine Grenze steigen', x: 'Er entfernt den Bass', e: 'Er fängt Spitzen ab, damit nichts übersteuert.' }
      ]),
      S('spotify-lautheit', [
        { f: 'Auf welche Lautheit regelt Spotify Songs in der Standard-Einstellung?', r: 'Etwa −14 LUFS', x: 'Etwa 0 LUFS', e: 'Lautere Songs werden leiser gedreht – zu lautes Mastern bringt dort nur weniger Dynamik.' },
        { f: 'Was bedeutet „True Peak“?', r: 'Der echte Spitzenpegel, auch zwischen den Abtastwerten', x: 'Der lauteste Ton im Bass', e: 'Zwischen zwei Abtastwerten kann das Signal höher ausschlagen, als die Werte selbst zeigen.' },
        { f: 'Was meint der „Loudness War“?', r: 'Den Wettlauf um immer lautere Master auf Kosten der Dynamik', x: 'Einen Streit um Lautsprechermarken', e: 'Viele Alben der 1990er und 2000er wurden dadurch flach und angestrengt.' }
      ]),
      S('katz', [
        { f: 'Welchen Zielwert nennt die EBU-Empfehlung R 128 für Rundfunk?', r: '−23 LUFS', x: '−9 LUFS', e: 'Mit kleiner Toleranz. −9 LUFS wäre ein sehr lauter Club-Master.' },
        { f: 'Was zeigt die „Loudness Range“ (LRA)?', r: 'Wie stark die Lautheit im Stück schwankt', x: 'Wie breit das Stereobild ist', e: 'Eine kleine LRA heißt: das Stück ist gleichmäßig laut.' },
        { f: 'Warum lässt man unter 0 dBTP etwas Luft, z. B. −1 dBTP?', r: 'Beim Umwandeln in MP3/AAC können neue Spitzen entstehen', x: 'Weil MP3 keine lauten Stellen speichern kann', e: 'Spotify empfiehlt dafür −1 dBTP (bei sehr lauten Mastern −2).' }
      ])
    ]
  },
  'synthese': {
    gebiet: 'musik', titel: 'Synthesizer: Klang selbst bauen', kurz: 'Synthesizer', zusatzFrage: 'Und Synthesizer – Klänge selbst bauen?',
    intro: 'Oszillator, Filter, Hüllkurve: Aus wenigen Bausteinen entsteht jeder Klang von weich bis kreischend. Robert Moog machte das in den 1960ern bekannt.',
    zeit: '1960er', orte: [], personen: ['Robert Moog', 'The Beatles'],
    quellen: ['pinch-analog', 'ableton-synths', 'sos-synth-secrets', 'moog-film', 'wp-subtraktiv'],
    stufen: [
      S('ableton-synths', [
        { f: 'Was erzeugt beim Synthesizer den Grundton?', r: 'Der Oszillator', x: 'Der Hall', e: 'Hall kommt erst danach als Effekt dazu.' },
        { f: 'Was macht ein Tiefpassfilter (Low-Pass)?', r: 'Er lässt Tiefen durch und dämpft Höhen', x: 'Er lässt Höhen durch und dämpft Tiefen', e: 'Das andere wäre ein Hochpass. Ein Tiefpass macht den Klang dunkler und weicher.' },
        { f: 'Wofür steht ADSR?', r: 'Attack, Decay, Sustain, Release', x: 'Audio, Delay, Stereo, Reverb', e: 'Die vier Phasen der Hüllkurve: Anschwellen, Abfallen, Halten, Ausklingen.' }
      ]),
      S('wp-subtraktiv', [
        { f: 'Wer stellte 1964 seinen ersten modularen Synthesizer vor?', r: 'Robert Moog', x: 'Thomas Edison', e: 'Auf einem Kongress der Audio Engineering Society. Edison erfand 1877 den Phonographen.' },
        { f: 'Welche Wellenform klingt am weichsten, weil sie keine Obertöne hat?', r: 'Die Sinuswelle', x: 'Die Sägezahnwelle', e: 'Der Sägezahn ist besonders obertonreich und klingt hell und scharf.' },
        { f: 'Was ist ein LFO?', r: 'Ein langsamer Oszillator, der andere Regler bewegt', x: 'Ein besonders lauter Oszillator', e: 'Zum Beispiel für Vibrato oder ein langsam auf- und zugehendes Filter.' }
      ]),
      S('pinch-analog', [
        { f: 'Was heißt „subtraktive Synthese“?', r: 'Ein obertonreicher Klang wird mit Filtern beschnitten', x: 'Viele Sinustöne werden zusammengezählt', e: 'Das Zusammenzählen von Sinustönen heißt additive Synthese.' },
        { f: 'Was bewirkt die „Resonanz“ am Filter?', r: 'Sie hebt die Frequenzen an der Grenzfrequenz an', x: 'Sie verlängert den Hall', e: 'Hoch gedreht pfeift das Filter – typisch für Acid-Bässe.' },
        { f: 'Auf welchem Beatles-Album von 1969 spielt George Harrison einen Moog?', r: 'Abbey Road', x: 'Please Please Me', e: 'Zum Beispiel in „Because“ und „Here Comes the Sun“. „Please Please Me“ erschien schon 1963.' }
      ])
    ]
  },

  'rom-reise': {
    gebiet: 'reisen', titel: 'Rom: Kolosseum, Pantheon, Forum', kurz: 'Rom', wahl: 'Rom: Kolosseum, Pantheon, Forum',
    intro: 'Über 2700 Jahre Stadtgeschichte auf engem Raum: In Rom läuft man an einem Tag durch Antike, Mittelalter und Barock.',
    zeit: 'Antike bis heute', orte: ['Rom'], personen: ['Hadrian', 'Vespasian'],
    quellen: ['goethe-italien', 'unesco-rom', 'yale-kleiner', 'colosseo'],
    stufen: [
      S('unesco-rom', [
        { f: 'In welcher Stadt steht das Kolosseum?', r: 'In Rom', x: 'In Athen', e: 'Sein antiker Name: Amphitheatrum Flavium.' },
        { f: 'Welches Bauwerk in Rom hat eine Kuppel mit offenem Loch in der Mitte?', r: 'Das Pantheon', x: 'Der Petersdom', e: 'Das Loch heißt Opaion und ist rund 9 Meter breit. Bei Regen fällt Wasser hinein.' },
        { f: 'Was wirft man der Legende nach in den Trevi-Brunnen, um wiederzukommen?', r: 'Eine Münze', x: 'Eine Blume', e: 'Das Geld wird regelmäßig eingesammelt und gespendet.' }
      ]),
      S('colosseo', [
        { f: 'Unter welchem Kaiser begann der Bau des Kolosseums?', r: 'Vespasian', x: 'Nero', e: 'Eröffnet wurde es 80 n. Chr. unter seinem Sohn Titus – auf dem Gelände von Neros Palast.' },
        { f: 'Wie heißt der kleinste Staat der Welt, mitten in Rom?', r: 'Vatikanstadt', x: 'San Marino', e: 'San Marino liegt in Mittelitalien, aber nicht in Rom.' },
        { f: 'Wie hieß das Zentrum des antiken Rom mit Tempeln, Basiliken und der Rednerbühne?', r: 'Forum Romanum', x: 'Circus Maximus', e: 'Der Circus Maximus war die Rennbahn für Wagenrennen.' }
      ]),
      S('yale-kleiner', [
        { f: 'Wo in Rom liegen die Reste des Ortes, an dem Caesar ermordet wurde?', r: 'Am Largo di Torre Argentina', x: 'Auf dem Palatin', e: 'Heute leben dort viele Katzen – es gibt eine Katzenstation zwischen den Ruinen.' },
        { f: 'Unter welchem Kaiser bekam das Pantheon seine heutige Gestalt?', r: 'Hadrian', x: 'Caesar', e: 'Die Inschrift nennt trotzdem Agrippa – den Bauherrn des Vorgängerbaus.' },
        { f: 'Auf wie vielen Hügeln wurde Rom der Überlieferung nach gebaut?', r: 'Sieben', x: 'Zwölf', e: 'Dazu gehören Palatin, Kapitol und Aventin.' }
      ])
    ]
  },
  'athen-reise': {
    gebiet: 'reisen', titel: 'Athen: Akropolis und Agora', kurz: 'Athen', wahl: 'Athen: Akropolis und Agora',
    intro: 'Oben auf der Akropolis Parthenon und Erechtheion, darunter Agora, Theater und Pnyx – die Orte der ersten Demokratie kann man heute noch betreten.',
    zeit: 'Antike bis heute', orte: ['Athen', 'London'], personen: ['Perikles'],
    quellen: ['unesco-akropolis', 'beard-parthenon', 'britannica-akropolismuseum'],
    stufen: [
      S('unesco-akropolis', [
        { f: 'Welcher Burgberg mit antiken Tempeln überragt Athen?', r: 'Die Akropolis', x: 'Der Olymp', e: 'Der Olymp ist Griechenlands höchster Berg – weit im Norden.' },
        { f: 'An welchem Meer liegt Athens Hafen Piräus?', r: 'An der Ägäis', x: 'An der Ostsee', e: 'Genauer: am Saronischen Golf, einem Teil der Ägäis.' },
        { f: 'Wo fanden 1896 die ersten Olympischen Spiele der Neuzeit statt?', r: 'In Athen', x: 'In Paris', e: 'Im Panathinaiko-Stadion, ganz aus Marmor.' }
      ]),
      S('britannica-akropolismuseum', [
        { f: 'Was war die Agora im antiken Athen?', r: 'Markt- und Versammlungsplatz', x: 'Ein Tempel für Zeus', e: 'Hier diskutierte auch Sokrates mit den Leuten.' },
        { f: 'Wo sind viele Originalskulpturen der Akropolis seit 2009 zu sehen?', r: 'Im Akropolismuseum in Athen', x: 'Im Louvre in Paris', e: 'Ein großer Teil des Parthenon-Frieses liegt aber im British Museum in London.' },
        { f: 'Welcher Bau auf der Akropolis hat Säulen in Gestalt von Frauen (Karyatiden)?', r: 'Das Erechtheion', x: 'Der Parthenon', e: 'Am Bau stehen heute Kopien; fünf Originale sind im Akropolismuseum.' }
      ]),
      S('beard-parthenon', [
        { f: 'Aus welchem Gebirge nahe Athen kam der Marmor für den Parthenon?', r: 'Vom Pentelikon', x: 'Vom Vesuv', e: 'Der Vesuv ist ein Vulkan bei Neapel.' },
        { f: 'In welchem Theater am Südhang der Akropolis wurden die Tragödien des Sophokles aufgeführt?', r: 'Im Dionysostheater', x: 'Im Odeon des Herodes Atticus', e: 'Das Odeon entstand erst 161 n. Chr. – heute gibt es dort im Sommer Konzerte.' },
        { f: 'Auf welchem Hügel gegenüber der Akropolis tagte die Volksversammlung?', r: 'Auf der Pnyx', x: 'Auf dem Lykabettus', e: 'Der Lykabettus ist der höchste Hügel der Stadt – mit Aussicht und Kapelle.' }
      ])
    ]
  },
  'london-musik': {
    gebiet: 'reisen', titel: 'London: Orte der Musik', kurz: 'London', zusatzFrage: 'Und London – auf den Spuren der Musik?',
    intro: 'Abbey Road, Royal Albert Hall, Soho: In London liegen einige der berühmtesten Orte der Musikgeschichte – manche kann man besuchen.',
    zeit: '1871 bis heute', orte: ['London'], personen: ['The Beatles', 'Edward Elgar'],
    quellen: ['londonmuseum-abbeyroad', 'abbeyroad-story', 'lewisohn', 'wp-rah'],
    stufen: [
      S('abbeyroad-story', [
        { f: 'Über welchen Zebrastreifen in London gingen die Beatles 1969 fürs Plattencover?', r: 'Abbey Road', x: 'Baker Street', e: 'Die Baker Street kennt man von Sherlock Holmes.' },
        { f: 'Welche große Konzerthalle in London wurde 1871 eröffnet?', r: 'Die Royal Albert Hall', x: 'Die Elbphilharmonie', e: 'Die Elbphilharmonie steht in Hamburg und wurde 2017 eröffnet.' },
        { f: 'Wie heißt die jährliche Sommer-Konzertreihe in der Royal Albert Hall?', r: 'The Proms', x: 'Glastonbury', e: 'Glastonbury ist ein Festival auf dem Land in Somerset.' }
      ]),
      S('lewisohn', [
        { f: 'Welche Londoner Straße in Soho stand in den 1960ern für „Swinging London“?', r: 'Carnaby Street', x: 'Downing Street', e: 'In der Downing Street wohnt der Premierminister.' },
        { f: 'Welche Band nahm „The Dark Side of the Moon“ (1973) in den Abbey Road Studios auf?', r: 'Pink Floyd', x: 'Queen', e: 'Toningenieur war Alan Parsons.' },
        { f: 'Wo spielten die Beatles im Januar 1969 ihr letztes öffentliches Konzert?', r: 'Auf dem Dach ihrer Firma Apple in der Savile Row', x: 'Im Wembley-Stadion', e: 'Nach rund 40 Minuten kam die Polizei wegen der Lautstärke.' }
      ]),
      S('londonmuseum-abbeyroad', [
        { f: 'Welches Kraftwerk zeigt das Cover von Pink Floyds „Animals“ (1977)?', r: 'Battersea Power Station', x: 'Tower Bridge', e: 'Für das Foto schwebte ein großes aufblasbares Schwein über dem Kraftwerk.' },
        { f: 'Welcher Komponist dirigierte 1931 bei der Eröffnung der EMI-Studios an der Abbey Road?', r: 'Edward Elgar', x: 'Gustav Mahler', e: 'Ein Film zeigt ihn mit dem London Symphony Orchestra bei „Land of Hope and Glory“. Mahler war damals schon 20 Jahre tot.' },
        { f: 'Wer eröffnete 1871 die Royal Albert Hall offiziell?', r: 'Der Prinz von Wales, für Königin Victoria', x: 'Prinz Albert selbst', e: 'Albert war schon 1861 gestorben – die Halle erinnert an ihn. Victoria war zu bewegt, um zu sprechen.' }
      ])
    ]
  },

  'rhetorik-antike': {
    gebiet: 'sprache', titel: 'Rhetorik: die Kunst der Rede', kurz: 'Rhetorik (Antike)', wahl: 'Rhetorik der Antike: Aristoteles und Cicero',
    intro: 'Wie überzeugt man Menschen? Aristoteles ordnete die Mittel der Rede, Cicero und Quintilian machten daraus eine Lehre, die bis heute gilt.',
    zeit: '4. Jh. v. Chr. – 1. Jh. n. Chr.', orte: ['Athen', 'Rom'], personen: ['Aristoteles', 'Cicero', 'Quintilian'],
    quellen: ['aristoteles-rhetorik', 'ueding', 'cicero-oratore', 'sep-rhetorik'],
    stufen: [
      S('ueding', [
        { f: 'Was ist Rhetorik?', r: 'Die Kunst, überzeugend zu reden', x: 'Die Lehre vom Reim', e: 'Reime gehören zur Dichtkunst (Poetik).' },
        { f: 'Welche drei Überzeugungsmittel nennt Aristoteles?', r: 'Ethos, Pathos, Logos', x: 'These, Antithese, Synthese', e: 'Ethos: Glaubwürdigkeit des Redners. Pathos: Gefühle der Zuhörer. Logos: das Argument.' },
        { f: 'Wer gilt als der berühmteste Redner Roms?', r: 'Cicero', x: 'Nero', e: 'Nero war Kaiser – und eher als Sänger auf der Bühne bekannt.' }
      ]),
      S('aristoteles-rhetorik', [
        { f: 'Was meint „Pathos“ bei Aristoteles?', r: 'Die Gefühle der Zuhörer ansprechen', x: 'Die Ehrlichkeit des Redners', e: 'Die Glaubwürdigkeit des Redners wäre das Ethos.' },
        { f: 'In welcher Stadt lehrte Aristoteles an seiner Schule, dem Lykeion?', r: 'In Athen', x: 'In Rom', e: 'Dort entstand auch seine „Rhetorik“.' },
        { f: 'Was ist eine rhetorische Frage?', r: 'Eine Frage, auf die keine Antwort erwartet wird', x: 'Eine Frage mit drei Antwortmöglichkeiten', e: '„Wer will das schon?“ – die Antwort steckt in der Frage.' }
      ]),
      S('cicero-oratore', [
        { f: 'Die fünf Arbeitsschritte einer Rede – welcher steht am Anfang?', r: 'Inventio: Stoff finden', x: 'Actio: Vortrag', e: 'Dann folgen Dispositio (ordnen), Elocutio (formulieren), Memoria (einprägen) und am Ende Actio (vortragen).' },
        { f: 'Gegen wen hielt Cicero 63 v. Chr. vier berühmte Reden?', r: 'Gegen Catilina', x: 'Gegen Caesar', e: 'Berühmter Anfang: „Quo usque tandem …?“ – „Wie lange noch …?“' },
        { f: 'Welcher Römer schrieb um 95 n. Chr. das große Lehrbuch „Institutio oratoria“?', r: 'Quintilian', x: 'Vergil', e: 'Vergil schrieb die „Aeneis“.' }
      ])
    ]
  },
  'reden-heute': {
    gebiet: 'sprache', titel: 'Reden halten: Aufbau, Pausen, Wirkung', kurz: 'Reden heute', wahl: 'Reden heute: Aufbau, Pausen, Wirkung',
    intro: 'Was eine gute Rede ausmacht – vom klaren Aufbau über Pausen bis zu den Stilmitteln berühmter Reden des 20. Jahrhunderts.',
    zeit: '1960er', orte: ['Berlin', 'Washington'], personen: ['Martin Luther King', 'John F. Kennedy', 'Caesar'],
    quellen: ['schulz-von-thun', 'anderson-ted', 'king-dream', 'jfk-berlin'],
    stufen: [
      S('anderson-ted', [
        { f: 'Was hilft beim freien Reden meist mehr?', r: 'Stichworte mit den Hauptgedanken', x: 'Den ganzen Text Wort für Wort ablesen', e: 'Mit Stichworten bleibt der Faden da – und der Blick bei den Zuhörern.' },
        { f: 'Was wirkt vor dem wichtigsten Satz stärker?', r: 'Eine kurze Pause', x: 'Schneller werden', e: 'Die Pause baut Spannung auf: Alle warten auf das, was kommt.' },
        { f: 'Welcher Aufbau ist für eine kurze Rede bewährt?', r: 'Einstieg – Hauptteil – Schluss', x: 'Nur Hauptteil, ohne Anfang und Ende', e: 'Der Einstieg weckt Interesse, der Schluss fasst die Botschaft in einem Satz.' }
      ]),
      S('king-dream', [
        { f: 'Wo hielt Martin Luther King 1963 seine Rede „I Have a Dream“?', r: 'Vor dem Lincoln Memorial in Washington', x: 'Im Weißen Haus', e: 'Beim Marsch auf Washington am 28. August 1963.' },
        { f: 'Wo sagte John F. Kennedy 1963 „Ich bin ein Berliner“?', r: 'Vor dem Rathaus Schöneberg in Berlin', x: 'Im Bundestag in Bonn', e: 'Am 26. Juni 1963, vor einer riesigen Menschenmenge.' },
        { f: 'Welches Stilmittel ist das immer wiederholte „I have a dream …“ am Satzanfang?', r: 'Die Anapher', x: 'Die Ellipse', e: 'Anapher: Wiederholung am Satzanfang. Ellipse: Auslassung von Wörtern.' }
      ]),
      S('schulz-von-thun', [
        { f: 'Was ist ein Trikolon?', r: 'Eine Dreierreihe wie „Veni, vidi, vici“', x: 'Eine Rede vor genau drei Zuhörern', e: '„Ich kam, ich sah, ich siegte“ – so meldete Caesar 47 v. Chr. einen schnellen Sieg.' },
        { f: 'Was sagt das Kommunikationsquadrat von Schulz von Thun? Jede Nachricht hat …', r: '… vier Seiten: Sache, Selbstkundgabe, Beziehung, Appell', x: '… zwei Seiten: laut und leise', e: 'Darum kann derselbe Satz ganz unterschiedlich ankommen.' },
        { f: 'Wie lang war Abraham Lincolns berühmte Gettysburg-Rede (1863)?', r: 'Gut zwei Minuten, rund 270 Wörter', x: 'Über zwei Stunden', e: 'Der Hauptredner vor ihm sprach etwa zwei Stunden – erinnert wird Lincolns kurze Rede.' }
      ])
    ]
  },
  'woerter-rom': {
    gebiet: 'sprache', titel: 'Wörter aus Rom: Latein im Deutschen', kurz: 'Wörter aus Rom', zusatzFrage: 'Und Wörter aus Rom – Latein im Deutschen?',
    intro: 'Fenster, Mauer, Keller, Wein: Mit den Römern kamen neue Dinge – und ihre Wörter. Viele benutzen wir täglich, ohne es zu merken.',
    zeit: 'ab dem 1. Jh. v. Chr.', orte: ['Rom'], personen: ['Caesar', 'Augustus'],
    quellen: ['kluge', 'weeber', 'wp-lehnwoerter', 'wp-erste-welle', 'wp-kaiser'],
    stufen: [
      S('wp-kaiser', [
        { f: 'Aus welchem Namen stammt das deutsche Wort „Kaiser“?', r: 'Caesar', x: 'Karl', e: 'Auch der russische „Zar“ geht auf Caesar zurück. Das tschechische „král“ (König) kommt dagegen von Karl dem Großen.' },
        { f: 'Welches deutsche Wort kommt vom lateinischen „fenestra“?', r: 'Fenster', x: 'Feuer', e: 'Das Wort kam mit dem römischen Steinbau zu den Germanen – wie Mauer und Ziegel.' },
        { f: 'Nach wem ist der Monat August benannt?', r: 'Nach Kaiser Augustus', x: 'Nach dem heiligen Augustinus', e: 'Der Monat Sextilis wurde 8 v. Chr. zu Ehren des Augustus umbenannt.' }
      ]),
      S('wp-erste-welle', [
        { f: 'Woher kommt das Wort „Straße“?', r: 'Vom lateinischen (via) strata, gepflasterter Weg', x: 'Vom Wort „Strand“', e: 'Die Römer bauten befestigte Straßen quer durch ihr Reich.' },
        { f: 'Welches Wort kam mit dem Weinbau der Römer an Rhein und Mosel?', r: 'Wein, von lateinisch vinum', x: 'Met', e: 'Met, der Honigwein, ist ein altes germanisches Wort.' },
        { f: 'Das Wort „Mauer“ kommt vom lateinischen …', r: '… murus', x: '… mare', e: '„Mare“ heißt Meer – daher „maritim“.' }
      ]),
      S('kluge', [
        { f: 'Was ist ein Lehnwort?', r: 'Ein fremdes Wort, das sich in Laut und Schreibung angepasst hat, z. B. Fenster', x: 'Ein Wort, das nur ausgeliehen ist und wieder verschwindet', e: 'Ein Fremdwort wie „Computer“ ist dagegen noch als fremd erkennbar.' },
        { f: 'Woher kommt das Wort „Keller“?', r: 'Vom lateinischen cellarium, Vorratsraum', x: 'Vom Wort „kalt“', e: 'Keller, Kammer und Küche – auch das Haus bekam römische Wörter.' },
        { f: 'Welches dieser Wörter stammt NICHT aus dem Lateinischen?', r: 'Haus', x: 'Ziegel', e: '„Haus“ ist germanisch. „Ziegel“ kommt von tegula, dem römischen Dachziegel.' }
      ])
    ]
  }
};

// Querverbindungen: typ = ort | person | zeit | idee; was = das Gemeinsame; text = ein Satz dazu.
export const BRUECKEN = [
  { a: 'rom-caesar', b: 'rom-reise', typ: 'ort', was: 'Rom', text: 'Wo Caesar starb, liegen heute Ruinen am Largo di Torre Argentina.' },
  { a: 'rom-caesar', b: 'rhetorik-antike', typ: 'person', was: 'Cicero', text: 'Cicero war Caesars Zeitgenosse – und sein Gegner.' },
  { a: 'rom-caesar', b: 'woerter-rom', typ: 'person', was: 'Caesar', text: 'Aus seinem Namen wurde unser Wort „Kaiser“.' },
  { a: 'rom-caesar', b: 'reden-heute', typ: 'person', was: 'Caesar', text: '„Veni, vidi, vici“ – Caesars Dreierreihe ist ein Lehrbuch-Trikolon.' },
  { a: 'athen-antike', b: 'athen-reise', typ: 'ort', was: 'Athen', text: 'Die Pnyx, auf der die Bürger abstimmten, kann man heute besuchen.' },
  { a: 'athen-antike', b: 'rhetorik-antike', typ: 'person', was: 'Aristoteles', text: 'Aristoteles lehrte in Athen – dort entstand seine „Rhetorik“.' },
  { a: 'ton-geschichte', b: 'mischen', typ: 'person', was: 'Les Paul', text: 'Les Pauls Mehrspur-Ideen machten das heutige Mischen erst möglich.' },
  { a: 'ton-geschichte', b: 'london-musik', typ: 'ort', was: 'Abbey Road, London', text: 'Die EMI-Studios von 1931 sind die heutigen Abbey Road Studios.' },
  { a: 'ton-geschichte', b: 'synthese', typ: 'zeit', was: '1960er', text: 'Während die Beatles auf vier Spuren aufnahmen, stellte Moog 1964 seinen Synthesizer vor.' },
  { a: 'ton-geschichte', b: 'reden-heute', typ: 'ort', was: 'Berlin', text: 'Berlin: 1935 Premiere des Tonbands, 1963 Kennedys berühmte Rede.' },
  { a: 'synthese', b: 'london-musik', typ: 'person', was: 'The Beatles', text: 'Auf „Abbey Road“ (1969) spielt George Harrison einen Moog.' },
  { a: 'mastering', b: 'reden-heute', typ: 'idee', was: 'Dynamik', text: 'Leise Stellen lassen laute wirken – in der Rede die Pause, im Master die Dynamik.' },
  { a: 'woerter-rom', b: 'rom-reise', typ: 'ort', was: 'Rom', text: 'Rom steckt in unseren Wörtern: Straße, Mauer, Fenster.' },
  { a: 'rhetorik-antike', b: 'rom-reise', typ: 'ort', was: 'Forum Romanum', text: 'Auf dem Forum stand die Rednerbühne, von der Cicero sprach.' },
  { a: 'athen-reise', b: 'london-musik', typ: 'ort', was: 'London', text: 'Ein großer Teil des Parthenon-Frieses liegt im British Museum in London.' }
];

export const TYP_BRUECKE = { ort: 'gleicher Ort', person: 'gleiche Person', zeit: 'gleiche Zeit', idee: 'gleiche Idee' };

export const gebietVon = (astId) => GEBIETE.find((g) => g.id === AESTE[astId]?.gebiet);
export const brueckenVon = (astId) => BRUECKEN.filter((b) => b.a === astId || b.b === astId)
  .map((b) => ({ ...b, zu: b.a === astId ? b.b : b.a }));
export const AST_IDS = GEBIETE.flatMap((g) => g.aeste);
