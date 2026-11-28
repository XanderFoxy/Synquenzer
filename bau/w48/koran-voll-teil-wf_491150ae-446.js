export const meta = {
  name: 'koran-voll-teil',
  description: 'Koran-Faktencheck v2: Teile übersetzen+kommentieren, Dossiers recherchieren, alles gegenprüfen',
  phases: [
    { title: 'Übersetzen', detail: 'eigene wortnahe Übersetzung + Kommentare je Teil' },
    { title: 'Prüfen', detail: 'Gegenprüfung je Teil' },
    { title: 'Dossiers', detail: 'Themen-Recherche' },
    { title: 'Dossier-Prüfung', detail: 'adversariale Faktenprüfung' },
  ],
}

const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/religion/v2'
const GRUND = `
GRUNDREGELN (für alle):
- Alles bleibt PRIVAT: nur in ${S}/ schreiben. Kein git, nichts veröffentlichen, nichts hochladen.
- Ton: nüchtern, ehrlich, kritisch – Kritik an Texten und Ideen, nie an Muslimen als Menschen. Nicht nur zerlegen: wo eine Stelle hält oder ethisch stark ist, das auch sagen.
- Nie etwas erfinden: keine ausgedachten Hadith-Nummern, Seitenzahlen, Studien, Zitate oder URLs. Unsicher → status "umstritten" oder weglassen. URLs nur, wenn das Muster sicher existiert, z. B. https://quran.com/4/34 , https://corpus.quran.com/wordbyword.jsp?chapter=4&verse=34 , https://de.wikipedia.org/wiki/<Artikel> , https://en.wikipedia.org/wiki/<Artikel> , https://sunnah.com/bukhari:<nr> nur wenn die Nummer sicher ist. Sonst nur Titel ohne URL.
- Urheberrecht: Moderne deutsche Koranübersetzungen (Paret, Bubenheim/Elyas, Khoury, Zaidan, Rassoul, Bobzin, Henning in Hofmanns Bearbeitung) und moderne Bücher NICHT abschreiben und nicht leicht umformuliert übernehmen. Höchstens ein paar Wörter als gekennzeichnetes Kurzzitat zum Vergleich. Bücher zusammenfassen statt zitieren.
- Psychologische Sicht = Lesart der Sprache und Wirkung (Rhetorik, Muster, wie heutige Psychologie solche Aussagen einordnet) – ausdrücklich keine Diagnose. Begriffe wie Narzissmus nur als „Muster, das an … erinnert", mit Gegenstimme.
- Xanders eigene Thesen (Datei ${S}/../notiz/xander-ideen.md) werden ehrlich bewertet: gestützt / teilweise / nicht gestützt – mit Begründung.
- Sprache der Ausgabe: Deutsch, klar, kurze Sätze, für Diskussionen mit Freunden brauchbar.
- Arabischer Text: ${S}/basis/koran-ar.json (Tanzil, verbatim). Englisch gemeinfrei: Pickthall 1930 ${S}/basis/koran-en-pickthall.json; je Teil auch Rodwell 1861 im Feld "rod". Versangaben IMMER gegen diese Dateien prüfen (python3 -c ... lesen), bevor du sie nennst.
`

const KATS = 'widerspruch, wissenschaft, gewalt, psychologie, parallele, recht, wunder, naht, abrogation, ueberlieferung, sprache, frauen, andersglaeubige, ethik'

const TEIL_SCHEMA = { type: 'object', properties: { teil: { type: 'string' }, verse: { type: 'number' }, notizen: { type: 'number' }, probleme: { type: 'string' } }, required: ['teil', 'verse', 'notizen'] }
const PRUEF_SCHEMA = { type: 'object', properties: { teil: { type: 'string' }, fehlende_verse: { type: 'number' }, korrigiert: { type: 'number' }, geloescht: { type: 'number' }, hinweise: { type: 'string' } }, required: ['teil', 'fehlende_verse', 'korrigiert', 'geloescht'] }
const DOS_SCHEMA = { type: 'object', properties: { key: { type: 'string' }, abschnitte: { type: 'number' }, kurz: { type: 'string' } }, required: ['key', 'abschnitte'] }
const DPRUEF_SCHEMA = { type: 'object', properties: { key: { type: 'string' }, gepruefte_aussagen: { type: 'number' }, korrigiert: { type: 'number' }, geloescht: { type: 'number' }, hinweise: { type: 'string' } }, required: ['key', 'korrigiert', 'geloescht'] }

function teilPrompt(id) {
  return `${GRUND}
AUFGABE: Teil ${id} des Korans für eine private Faktencheck-App.
Eingabe: ${S}/basis/${id}.json → {id, von, bis, verse:[{ref:"S:A", ar, en (Pickthall 1930), rod (Rodwell 1861)}]}. Surenliste: ${S}/basis/suren.json.

1) ÜBERSETZUNG (Pflicht, JEDER Vers): Schreibe ${S}/ueb/${id}.json als JSON-Objekt {"S:A": "deutscher Text", ...} für ALLE Verse des Teils.
   - Eigenständig aus dem Arabischen übersetzen, wortnah, heutiges verständliches Deutsch. Pickthall/Rodwell nur zum Gegencheck. Keine bestehende deutsche Übersetzung nachbauen.
   - „Allah" für الله; göttliches „Wir" beibehalten; ergänzte Wörter in [eckigen Klammern]. Mehrdeutige Wörter wörtlich und eine Notiz (kat "sprache") dazu.
   - Arbeite in Blöcken (z. B. 40 Verse), schreibe die Datei schrittweise (lesen → ergänzen → schreiben), damit nichts verloren geht. Am Ende mit python3 prüfen: alle refs vorhanden, kein leerer Text.

2) KOMMENTARE: Schreibe ${S}/notizen/${id}.json:
{"teil":"${id}",
 "suren":[ nur für Suren, deren Vers 1 in diesem Teil liegt: {"nr":N, "ort":"Mekka|Medina", "zeit":"traditionelle Einordnung + Nöldeke-Periode falls bekannt", "inhalt":"2-4 Sätze", "aufbau":"Struktur, Wiederholungen, Nähte/Brüche, Stimmenwechsel", "kontext":"Anlass/Umfeld laut Überlieferung, mit Quelle"} ],
 "notizen":[ {"ref":"4:34" oder "2:190-193", "kat":[aus: ${KATS}], "titel":"kurz", "text":"3-8 Sätze", "psychologie":"optional 1-4 Sätze", "wissenschaft":"optional", "vergleich":"optional: Bibel/Thora/Talmud/Midrasch/Apokryphen/vorislamisch", "status":"belegt|umstritten|deutung", "quellen":[{"titel":"...","url":"optional"}], "querverweise":["9:5"], "frage":"optional: gute Diskussionsfrage"} ]}
Was kommentiert werden MUSS (wenn im Teil vorhanden): Gewalt/Kampf/Strafen (mit Kontext: welches Ereignis, wer griff zuerst an laut Quellen, Gelehrtenstreit); Spannungen/Widersprüche zu anderen Versen (beide Stellen nennen); Abrogation (erst erlaubt, dann verboten – z. B. Wein, Gebetsrichtung); Natur-/„Wissenschafts"-Aussagen (was war vorher schon bekannt, was sagt die Wissenschaft heute); Wunder (gab es Zeugen? Wer überliefert?); Parallelen zu Bibel, Talmud, Midrasch, christlichen Apokryphen, vorislamischen Bräuchen; Rechtsregeln (Frauen, Ehe, Erbe, Sklaverei, Körperstrafen, Speisegebote); Aussagen über Juden, Christen, „Ungläubige"; Rhetorik mit psychologischer Wirkung (Drohung/Belohnung, Gehorsamsforderung, Höllenbilder, Wir-gegen-die, bedingte Liebe Allahs); Selbstbeweis-Aussagen („kein Zweifel", „klares Arabisch", Herausforderung); Wiederholungen derselben Geschichte mit anderen Details (Nähte, „zusammengetragen"-Hinweise, mit Gegenposition: mündliche/liturgische Form). Ethisch starke Stellen kurz würdigen (mit Kontext, z. B. 5:32 und Talmud Sanhedrin 4:5).
Umfang: dicht, aber knapp – je nach Inhalt ca. 12–40 Notizen pro Teil. Lieber weniger und richtig.
Antworte am Ende nur mit dem Schema.`
}

function pruefPrompt(id) {
  return `${GRUND}
AUFGABE: Adversariale Gegenprüfung von Teil ${id}. Du bist Skeptiker: Suche Fehler, korrigiere sie direkt in den Dateien.
Dateien: Basis ${S}/basis/${id}.json, Übersetzung ${S}/ueb/${id}.json, Kommentare ${S}/notizen/${id}.json.
1) python3: Fehlen Verse in der Übersetzung oder sind leer? Wenn ja: selbst aus dem Arabischen nachübersetzen und ergänzen (gleiche Regeln: wortnah, eigenständig, keine bestehende deutsche Übersetzung nachbauen).
2) Stichprobe: 20 Verse (alle Gewalt-/Frauen-/Rechtsverse des Teils zuerst, dann zufällig) gegen Arabisch + Pickthall prüfen. Sinnfehler korrigieren, Abschwächungen oder Verschärfungen entfernen.
3) Jede Notiz: Stimmen Versnummern und Querverweise (gegen ${S}/basis/koran-en-pickthall.json prüfen)? Stimmen Fakten, Daten, Namen, Ereignisse, Hadith-Angaben? Sind URLs plausibel echt? Wird eine Deutung als Fakt verkauft? Ist die Ausgewogenheit gewahrt? Falsches korrigieren, Unbelegbares als "umstritten" markieren oder löschen, erfundene Quellen entfernen. Fehlt etwas Wichtiges (z. B. ein Gewaltvers ohne Kontext), ergänzen.
4) JSON muss gültig sein (python3 json.load).
Antworte nur mit dem Schema.`
}

const DOSSIERS = {
  schwein: 'SCHWEIN-DOSSIER: Koranstellen (2:173, 5:3, 6:145, 16:115, 5:60) und Hadith dazu; Thora (Lev 11:7, Dtn 14:8) und warum Christen es aufgaben (Apg 10, Mk 7:19); Theorien zum Verbot (Mary Douglas, Marvin Harris, Trichinen/Maimonides, Abgrenzungsmarker – Archäologie Levante/Finkelstein); Altes Ägypten: Schweinehaltung (Knochenfunde Amarna, Giza-Arbeitersiedlung), Herodot zur Unreinheit der Schweinehirten, Seth als schwarzes Schwein, Nut als Sau – gab es Verehrung? Status: hielten Reiche Schweine (Ägypten, Rom)? Medizin: Galen sezierte Schweine, Schweineschmalz in alter Medizin, Insulin vom Schwein bis Humaninsulin, Heparin, Herzklappen, Haut, Xenotransplantation 2022/2024; Ähnlichkeiten Schwein–Mensch (was stimmt, was ist Mythos, z. B. „gleiche Augen"); Verhalten: Reinlichkeit (Kot-, Liege-, Fressbereich getrennt), Suhlen wegen fehlender Schweißdrüsen, Intelligenz, frisst Schwein Kot (ehrlich); Xanders Behauptung „die Kuh frisst, wo sie hinmacht" ehrlich prüfen (Rinder meiden Weideflächen um Kotfladen); Xanders These „altes Göttertier wurde verteufelt" ehrlich bewerten.',
  wissenschaft: 'WISSENSCHAFTSWUNDER-DOSSIER: alle bekannten Behauptungen einzeln: Embryo 23:12-14, 22:5, 96:2 (alaqa), 86:6-7, 39:6; 51:47 Ausdehnung; 21:30; Berge als Pflöcke 78:7, 16:15; Barriere zwischen Meeren 55:19-20, 25:53; Eisen herabgesandt 57:25; Fingerkuppen 75:4; Bahnen 21:33, 36:40; Sonne in schlammiger Quelle 18:86; sieben Himmel/Erden 65:12; Sternschnuppen gegen Teufel 67:5, 37:6-10; Biene 16:68-69; Ameise 27:18; Pharao-Leichnam 10:92; Rom-Prophezeiung 30:2-4; Mondspaltung 54:1; Erde ausgebreitet 88:20, 15:19, 79:30. Je Punkt: was steht da (eigene Wiedergabe), was behaupten Wunder-Verfechter (Bucaille, Keith Moore, Zakir Naik), was war vorher bekannt (Galen, Aristoteles, Hippokrates, Ptolemäus, Babylonier, Talmud), was sagt die Wissenschaft heute, Bewertung. Xanders These: Embryo-Wissen durch Beobachtung (Krieg/Leichen) – ehrlich: Fehlgeburten waren allen sichtbar, Galen; antike Sektionen (Herophilos). Tabelle für die App.',
  entstehung: 'ENTSTEHUNG DES KORANTEXTS: Offenbarung 610–632 laut Tradition; Sammlung unter Abu Bakr (Zaid ibn Thabit); Uthman-Rezension um 650 und Verbrennung anderer Kodizes (Bukhari-Bericht); Kodizes Ibn Masud (ohne Sure 1, 113, 114) und Ubayy (zwei Zusatzsuren); Sanaa-Palimpsest (Sadeghi/Goudarzi), Birmingham-Fragment (C14), Tübingen; Punkte/Vokale später (al-Hajjaj); Lesarten (Qiraat): Hafs vs Warsh heute gedruckt – konkrete Beispiele, also: Ist der Koran wirklich überall identisch? (Korrektur einer früheren Aussage); Nöldeke-Chronologie; revisionistische Schule (Wansbrough, Crone/Cook) und Gegenpositionen (Neuwirth, Sinai, Corpus Coranicum); „verlorene" Verse (Steinigungsvers-Bericht Umars, Ziegen-Bericht Ibn Majah – Echtheit), Satanische Verse (Tabari, umstritten). Zeitleiste für die App.',
  ueberlieferung: 'HADITH & SIRA: Ibn Ishaq (gest. 767) über Ibn Hisham (gest. 833), Waqidi, Tabari; Bukhari, Muslim und die sechs Bücher; Isnad-System; Kritik (Goldziher, Schacht) und Gegenkritik (Motzki); Sunniten/Schiiten/Koranisten/Sufis – wer verehrt was; Koran nennt Muhammad nur 4× (3:144, 33:40, 47:2, 48:29) + Ahmad 61:6; früheste nichtmuslimische Quellen (Doctrina Jacobi 634, Thomas der Presbyter um 640, Sebeos, Chronik von Chusistan) – Korrektur der Aussage „keine Zeitzeugen"; strittige Berichte: Aischas Alter, Banu Qurayza, Asma bint Marwan (laut Ibn Ishaq erstochen, nicht gesteinigt; Echtheit umstritten), Abu Afak, Kab ibn al-Ashraf, al-Nadr ibn al-Harith (nach Badr hingerichtet), Uqba ibn Abi Muayt (Kamel-Eingeweide-Episode) – kläre Xanders „kotzender Mann": welche Geschichte ist gemeint? Was geschah mit Kritikern bis heute (Apostasie-Gesetze, Blasphemie-Fälle, Rushdie, Charlie Hebdo, Samuel Paty) – sachlich.',
  gewalt: 'GEWALTVERSE MIT KONTEXT: 2:190-194, 2:216-217 (Nakhla), 2:256, 3:151, 4:89-91, 5:33, 8:12, 8:39, 8:60, 9:5, 9:29, 9:73, 9:111, 9:123, 47:4, 48:29, 33:26-27, 59:2; Ereignisse Badr, Uhud, Grabenkrieg, Qurayza, Chaibar, Eroberung Mekkas – wer griff zuerst an laut Quellen (Verfolgung in Mekka, Karawanenüberfälle); Abrogationslehre (Schwertvers hebt angeblich viele Verse auf – klassische Gelehrte) vs. heutige defensive Lesart; wie Dschihadisten zitieren (Fatwa 1998, IS-Propaganda) und Gegenstimmen (Muslime gegen Terror, Reformdenker: Khorchide, Abu Zaid, Ates; Kritiker: Hirsi Ali, Abdel-Samad). Xanders These (Quelle Text → Reform nötig) ehrlich bewerten.',
  vorlaeufer: 'HERKUNFT & VERGLEICH: vorislamisches Arabien (Allat, Uzza, Manat 53:19-20, Hubal, Allah als Hochgott vor dem Islam, Hanifen); Judentum (Gesetzesparallelen, Midrasch-Stoffe: Kain und Rabe 5:31, Abraham zerschlägt Götzen, Salomo und Königin von Saba); Christentum (syrisches Christentum, Kindheitsevangelien: Tonvögel 3:49, Jesus spricht in der Wiege 19:29-33; Siebenschläfer 18; Alexanderroman 18:83ff; Maria Schwester Aarons 19:28; Haman 28:38); Zoroastrismus (Brücke Sirat, Paradies); Rituale: Kaaba, Hajj, Umlauf (auch nackt, laut islamischen Quellen), Schwarzer Stein, Safa/Marwa (2:158), Ramadan, Freitag – was ist vorislamisch, was neu; Christentum übernahm ebenfalls (Weihnachtsdatum, Ostern, Heilige) – ehrlich mit Forschungsstand. Xanders These „alte Götter werden zu Dämonen" (Dschinn, Götzen, Beelzebub) bewerten.',
  halal_haram: 'HALAL/HARAM: vollständige Übersicht: Speisen (Schwein, Blut, Aas, Ersticktes, anderen Göttern Geweihtes; Speisen der Schriftbesitzer 5:5), Alkohol in Stufen (2:219 → 4:43 → 5:90-91) als Beispiel „erst erlaubt, dann verboten", Glücksspiel, Zins 2:275, Gebetsrichtung-Wechsel 2:142-144, Zeitehe (Mutah), Hadith-Verbote (Raubtiere, Hausesel, Hunde, Bilder, Musik-Streit, Gold/Seide für Männer), Sexualregeln. Je Regel: Koran oder Hadith? Herkunft (jüdische Parallelen, praktische/soziale Gründe), Begründung im Text vs. spätere Begründungen („Gesundheit"), was heute davon wissenschaftlich haltbar ist.',
  psychologie: 'PSYCHOLOGIE & PHILOSOPHIE: (a) Textanalyse in Zahlen – mit python3 auf ${S}/basis/koran-ar.json zählen (Wortformen, Diakritika vorher entfernen; als „ungefähre Zählung" kennzeichnen): Hölle (jahannam, an-nar), Paradies (janna/jannat), „gehorcht Allah", kafir-Formen, rahman/rahim; Verhältnis Drohung/Belohnung. (b) Rhetorische Muster: Gehorsam, Angst/Belohnung, Wir-gegen-die, Selbstlob, bedingte Liebe – und Gegenpole (Barmherzigkeitsformeln). (c) Denker: Freud (1907 „Zwangshandlungen und Religionsübungen", 1921 „Massenpsychologie und Ich-Analyse", 1927 „Die Zukunft einer Illusion"), Nietzsche (Antichrist, Genealogie der Moral, „Gott ist tot"), Jung (Gegenstimme), Feuerbach, Marx, Fromm (autoritäre vs. humanistische Religion; Furcht vor der Freiheit), William James, Festinger (kognitive Dissonanz), Milgram, Asch, Le Bon, Lifton (Gedankenreform-Kriterien) – zusammenfassen, nicht zitieren. (d) Xanders These „Massenpsychose" ehrlich: Psychiatrie (DSM-5) schließt kulturell geteilte Überzeugungen aus dem Wahnbegriff aus – was ist haltbar (Konformität, soziale Ansteckung, Massenpsychologie)? (e) Rituale und Zwang: Freud 1907, Skrupulosität als Zwangsform, Unterschied Ritual vs. Zwang. (f) Nahtoderfahrungen (Borjigin 2013/2023, Parnia; DMT-Hypothese unbewiesen), Ausschmücken von Erinnerung (Bartlett, Loftus, Stille Post), Visionen/Schläfenlappen (Persinger nicht repliziert). Xanders Thesen bewerten.',
  frauen_trauma: 'FRAUEN, HEIRATSDRUCK, RELIGIÖSES TRAUMA: Kette Kultur → Tradition → Religion (und zurück) an Beispielen; Koranstellen (4:3, 4:34, 2:228, 2:282, 4:11, 24:31, 33:59, 65:4, 2:223, 4:24) und Hadith (Zustimmung der Braut, Vormund/Wali, Zwangsrecht ijbar bei Schafiiten); Zwangsheirat in Deutschland (BMFSFJ-Studie 2011), Ehre, psychische Folgen (Studienlage ehrlich); religiöses Trauma (Marlene Winell „Religious Trauma Syndrome"); Robert Betz: prüfe ehrlich, ob er ein Buch zu religiösem Trauma geschrieben hat – wenn nicht nachweisbar, klar sagen und Alternativen nennen; warum Abstandnehmen „zurückkommt" (Familie, Identität, Schuld, kognitive Dissonanz, Double Bind, Foucault: verinnerlichte Überwachung, Fromm: Furcht vor der Freiheit); Xanders Gefängnis-Bild („Zelle offen, aber im Gebäude bleiben") einordnen; Hilfe: Hilfetelefon Gewalt gegen Frauen 116 016, Telefonseelsorge 0800 111 0 111, TERRE DES FEMMES, Papatya, Zentralrat der Ex-Muslime, Therapieansätze; wie man eine Freundin gut unterstützt (ohne Druck, Sicherheit zuerst). Keine Namen Dritter speichern.',
  struktur: 'STRUKTUR & „ZUSAMMENGETRAGEN": mit python3 auf ${S}/basis/koran-ar.json (Diakritika normalisieren): exakt/fast doppelte Verse, Kehrreime (55:13 usw.), Länge der Verse je Sure (Mekka vs. Medina), auffällige lange Verse in kurzen Suren (73:20, 74:31); mehrfach erzählte Geschichten mit abweichenden Details: Adam/Iblis (2:34, 7:11, 15:28-33, 17:61, 18:50, 20:116, 38:71-76), Mose/Pharao, Lot, Noah – Tabelle Unterschiede; Stimmenwechsel (Wir/Ich/Er – iltifat); Sure 9 ohne Basmala; geheimnisvolle Buchstaben. Forschungspositionen: Richard Bell (Umstellungen), Neuwirth (liturgische Einheit, mündlich), Wansbrough (spätere Redaktion), Corpus Coranicum. Ehrlich: Was spricht für „verschiedene Stimmen zusammengeklebt", was dagegen? Ergebnisse als Tabellen.',
  wunder: 'WUNDER OHNE ZEUGEN: Offenbarung in der Höhle Hira (allein), Nachtreise 17:1 (Bericht Aischas, Zeugen?), Mondspaltung 54:1 (keine astronomischen Chroniken), Abraham im Feuer 21:69, Mose, Jesus (Wiege, Tonvögel), Salomo und Dschinn, Siebenschläfer, Elefantenjahr 105; Spannung: Der Koran lehnt Zeichen-Forderungen ab (17:90-93, 6:109, 29:50-51, 13:7) – Wunder Muhammads stehen fast nur im Hadith; wie Wundergeschichten wachsen (Legendenbildung, Vergleich Jesus-Evangelien, Heiligenlegenden), Psychologie (Schock, Deutung von Naturphänomenen, Ego/Aufmerksamkeit – Xanders Beispiel ohne Namen), Hume über Wunder und Zeugen. Xanders Thesen bewerten.',
}

function dosPrompt(key) {
  return `${GRUND}
AUFGABE: Dossier „${key}" für die private Faktencheck-App recherchieren und schreiben.
Inhalt: ${DOSSIERS[key].replaceAll('${S}', S)}
Nutze WebSearch/WebFetch (falls verfügbar) zum Belegen; sonst nur sicheres Wissen, Unsicheres markieren.
Schreibe ${S}/dossiers/${key}.json:
{"key":"${key}", "titel":"...", "kurz":"2-3 Sätze Kernaussage", "abschnitte":[{"titel":"...", "text":"4-12 Sätze", "verse":["S:A"], "status":"belegt|umstritten|deutung", "quellen":[{"titel":"...","url":"optional"}], "frage":"optional Diskussionsfrage"}], "thesen_xander":[{"these":"...", "bewertung":"...", "status":"gestützt|teilweise|nicht gestützt|offen"}], "tabellen":[{"titel":"...","spalten":["..."],"zeilen":[["..."]]}], "korrekturen":[{"behauptung":"was im Sprachchat falsch war","richtig":"..."}]}
Ca. 8–20 Abschnitte. Gültiges JSON (mit python3 prüfen). Antworte nur mit dem Schema.`
}

function dosPruefPrompt(key) {
  return `${GRUND}
AUFGABE: Du bist ein strenger Faktenprüfer und versuchst, das Dossier ${S}/dossiers/${key}.json zu WIDERLEGEN.
Prüfe jede Aussage: Versnummern (gegen ${S}/basis/koran-en-pickthall.json), Daten, Namen, Studien, Zahlen, Hadith-Angaben, URLs (nutze WebSearch/WebFetch, falls verfügbar). Wird Deutung als Fakt verkauft? Fehlt die Gegenposition? Sind Xanders Thesen fair bewertet (weder geschönt noch abgewertet)?
Falsches korrigieren, Unbelegbares als "umstritten" markieren oder entfernen, erfundene Quellen löschen. Datei überschreiben, gültiges JSON prüfen. Antworte nur mit dem Schema.`
}

const teile = args.teile || []
const dossiers = args.dossiers || []

const [tErg, dErg] = await Promise.all([
  pipeline(teile,
    id => agent(teilPrompt(id), { label: `übersetzen:${id}`, phase: 'Übersetzen', schema: TEIL_SCHEMA }),
    (r, id) => agent(pruefPrompt(id), { label: `prüfen:${id}`, phase: 'Prüfen', schema: PRUEF_SCHEMA }).then(p => ({ teil: id, bau: r, pruef: p })),
  ),
  pipeline(dossiers,
    key => agent(dosPrompt(key), { label: `dossier:${key}`, phase: 'Dossiers', schema: DOS_SCHEMA }),
    (r, key) => agent(dosPruefPrompt(key), { label: `widerlegen:${key}`, phase: 'Dossier-Prüfung', schema: DPRUEF_SCHEMA }).then(p => ({ key, bau: r, pruef: p })),
  ),
])
return { teile: tErg, dossiers: dErg }
