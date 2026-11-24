// uebungen.js – Übungs-Bibliothek, Lernweg je Liedteil (plan) und Warm-up (warmup)
// für den Gesangstrainer. Reines ES-Modul, keine Bibliotheken, nichts wird gesendet.
//
// Vertrag:
//   UEBUNGEN            [{id, titel, ziel, anleitung:[...], dauerMin, stichworte:[...]}]
//   plan(lied, stimme)  [{teil, name, schwierig:[...], schritte:[{uebung, text, zeilen}]}]
//   warmup(lied, stimme)[{uebung, text, minuten, ton}]   (5–10 Minuten)
// lied   = Format von daten/the-wall.json; stimme = Ergebnis von ton.js stimmlage() oder null.
// Keine Bewertung des Sängers, keine Heilversprechen; Stimmlage immer nur „Schätzung“.

// phonetik.js wird abgesichert geladen: fehlt sie oder hat sie einen Fehler,
// arbeitet dieses Modul mit einer einfachen Vokal-Erkennung weiter.
let P = {};
try { P = await import('./phonetik.js'); } catch (e) { P = {}; }

export const SICHERHEIT =
  'Üben soll sich leicht anfühlen. Zwischen den Übungen kurz pausieren und Wasser trinken. ' +
  'Bei Kratzen, Schmerz oder Heiserkeit sofort aufhören und die Stimme ausruhen; halten Beschwerden an, ' +
  'ärztlich (HNO/Phoniatrie) abklären lassen. Die Übungen ersetzen keinen Gesangsunterricht.';

export const HINWEIS_STIMMLAGE =
  'Stimmlage ermitteln für genauere Übungen – bis dahin ist dies eine allgemeine, vorsichtige Fassung.';

// ---------------------------------------------------------------------------
// 1. Übungs-Bibliothek
// ---------------------------------------------------------------------------
export const UEBUNGEN = [
  {
    id: 'koerper-lockern', titel: 'Körper lockern',
    ziel: 'Spannung aus Schultern, Nacken und Bauch lösen, damit die Stimme frei schwingen kann.',
    anleitung: [
      'Hüftbreit stehen, Knie locker, Gewicht auf beiden Füßen.',
      'Schultern 5× langsam nach hinten kreisen, dann fallen lassen.',
      'Kopf sanft zur Seite neigen, je Seite 3 ruhige Atemzüge – nicht ziehen oder drücken.',
      'Arme ausschütteln, einmal herzhaft gähnen und dabei strecken.',
    ],
    dauerMin: 1, stichworte: ['lockerung', 'haltung'],
  },
  {
    id: 'kiefer-zunge', titel: 'Kiefer und Zunge lockern',
    ziel: 'Kiefer und Zunge entspannen – sie sollen den Klang formen, nicht festhalten.',
    anleitung: [
      'Mit den Fingerspitzen die Kaumuskeln vor den Ohren kreisend massieren.',
      'Unterkiefer locker hängen lassen und mit der Hand sanft auf und ab bewegen – der Kiefer gibt nach, er führt nicht.',
      'Zungenspitze hinter den unteren Zähnen lassen und den Zungenrücken 5× nach vorne wölben.',
      'Auf einem bequemen Ton „ja-ja-ja“ singen – nur die Zunge bewegt sich, der Kiefer bleibt ruhig.',
    ],
    dauerMin: 1, stichworte: ['lockerung', 'artikulation', 'kiefer'],
  },
  {
    id: 'gaehn-seufzer', titel: 'Gähn-Seufzer',
    ziel: 'Rachen weiten, Kehlkopf entspannen und die Kopfstimme sanft wecken.',
    anleitung: [
      'Mit geschlossenem Mund leicht gähnen – spüren, wie hinten im Hals Raum entsteht.',
      'Aus dem Gähnen heraus auf „ha“ von oben nach unten seufzen, leise und etwas luftig.',
      'Jeden Seufzer ein wenig höher beginnen, aber nur so hoch, wie es mühelos geht.',
      '5–8 Seufzer.',
    ],
    dauerMin: 1, stichworte: ['lockerung', 'hoehe', 'resonanz'],
  },
  {
    id: 'atem-448', titel: 'Atem 4-4-8',
    ziel: 'Ruhige, tiefe Einatmung und lange, gleichmäßige Ausatmung – Grundlage für lange Phrasen.',
    anleitung: [
      'Eine Hand auf den Bauch, eine seitlich an die unteren Rippen.',
      '4 Zähler durch die Nase einatmen – Bauch und Flanken weiten sich, die Schultern bleiben unten.',
      '4 Zähler die Luft locker halten (nicht pressen, der Hals bleibt offen).',
      '8 Zähler auf „ffff“ oder „ssss“ gleichmäßig ausatmen.',
      '4–6 Runden; wenn es leicht geht, 4-4-12.',
    ],
    dauerMin: 2, stichworte: ['atem', 'ruhe'],
  },
  {
    id: 'zisch-atem', titel: 'Zischen auf Zeit',
    ziel: 'Atemstütze: den Luftstrom lange und gleichmäßig dosieren.',
    anleitung: [
      'Ruhig einatmen wie bei 4-4-8.',
      'Auf „sss“ ausatmen, so gleichmäßig wie ein Reifen, der langsam Luft verliert.',
      'Die Flanken dabei möglichst lange weit lassen – nicht zusammenfallen.',
      '3 Runden ohne Ehrgeiz. Danach kurze Stöße „s-s-s-s“: der Bauch federt bei jedem Stoß leicht nach innen.',
    ],
    dauerMin: 1.5, stichworte: ['atem', 'stuetze', 'phrase'],
  },
  {
    id: 'phrasen-atem', titel: 'Phrasen-Atem planen',
    ziel: 'Wissen, wo du atmest – lange Phrasen ohne Atemnot singen.',
    anleitung: [
      'Die Zeile laut lesen und Atemstellen markieren (Pausen zwischen Wörtern, Satzzeichen).',
      'Vor der Phrase ruhig einatmen, als würdest du gleich einen Satz sagen – nicht vollpumpen.',
      'Die Phrase auf „sss“ in der Länge der Melodie ausatmen: reicht der Atem bis zum Ende?',
      'Dann auf den Vokalen singen; an der Atemstelle schnell und lautlos durch den offenen Mund nachatmen.',
    ],
    dauerMin: 2, stichworte: ['atem', 'phrase'],
  },
  {
    id: 'lippenflattern', titel: 'Lippenflattern (Lip Trill)',
    ziel: 'Stimme mit wenig Druck einschwingen; Atem und Ton verbinden (halb geschlossener Mund, „SOVT“).',
    anleitung: [
      'Lippen locker aufeinander, Luft durchblasen, bis sie flattern wie bei einem Pferd („brrr“).',
      'Flattert es nicht: Zeigefinger sanft an die Wangen neben den Mundwinkeln legen.',
      'Auf einem bequemen Ton beginnen, dann eine 5-Ton-Leiter hinauf und hinab (1-2-3-4-5-4-3-2-1).',
      'Jeden Durchgang einen Halbton höher, solange es leicht bleibt; dann wieder abwärts.',
    ],
    dauerMin: 2, stichworte: ['sovt', 'lockerung', 'einsingen'],
  },
  {
    id: 'lippenflattern-melodie', titel: 'Melodie auf Lippenflattern',
    ziel: 'Die Melodie des Lieds mit minimalem Druck lernen – Tonhöhen ohne Textlast.',
    anleitung: [
      'Die Melodie einmal anhören (Klavier oder Vokalstimme in der App).',
      'Die ganze Melodie auf „brrr“ mitsingen, Ton für Ton verbunden.',
      'Bei hohen Tönen nicht lauter werden – der Luftstrom bleibt gleichmäßig.',
      '3 Durchgänge, danach dasselbe auf Summen „mm“.',
    ],
    dauerMin: 2, stichworte: ['sovt', 'melodie', 'hoehe'],
  },
  {
    id: 'strohhalm', titel: 'Strohhalm-Übung (SOVT)',
    ziel: 'Der Gegendruck im Mund entlastet die Stimmlippen – Übergänge und Höhe werden leichter.',
    anleitung: [
      'Einen Strohhalm (etwa 3–5 mm) locker zwischen die Lippen nehmen; die Luft geht nur durch den Halm.',
      'Auf einem bequemen Ton „uuu“ in den Halm singen; die Wangen blähen sich nicht auf.',
      'Sirenen von tief nach hoch und zurück, dann die Melodie des Lieds in den Halm singen.',
      'Variante: Halm in ein halb gefülltes Glas Wasser – gleichmäßiges Blubbern zeigt gleichmäßigen Atem.',
    ],
    dauerMin: 2, stichworte: ['sovt', 'uebergang', 'hoehe'],
  },
  {
    id: 'summen', titel: 'Summen „mm“',
    ziel: 'Den Klang nach vorne bringen (Kribbeln an Lippen und Nase) und die Stimme sanft wecken.',
    anleitung: [
      'Lippen locker geschlossen, Zähne nicht aufeinander, die Zunge liegt weich.',
      'Auf einem bequemen Ton summen, bis Lippen und Nase leicht kribbeln.',
      'Wie ein zustimmendes „mhm“ in Sprechhöhe beginnen, dann eine 5-Ton-Leiter.',
      'Zum Schluss das Summen in ein „mmm-a“ öffnen: der Vokal bleibt vorne, wo das Summen war.',
    ],
    dauerMin: 1.5, stichworte: ['resonanz', 'sovt', 'einsingen'],
  },
  {
    id: 'ng-sirene', titel: '„Ng“-Sirene',
    ziel: 'Brust- und Kopfstimme ohne Bruch verbinden – über den ganzen Umfang gleiten.',
    anleitung: [
      'Wie am Ende von „singen“: der Zungenrücken liegt am weichen Gaumen, der Ton klingt durch die Nase („ng“).',
      'Von unten nach oben gleiten wie eine leise Sirene, dann zurück.',
      'An einer Bruchstelle nicht anhalten – leiser werden und weitergleiten.',
      'Nur so hoch und so tief, wie es mühelos geht; 4–6 Sirenen.',
    ],
    dauerMin: 1.5, stichworte: ['uebergang', 'hoehe', 'tiefe', 'sovt'],
  },
  {
    id: 'oktav-glissando', titel: 'Oktav-Glissando',
    ziel: 'Große Sprünge und den Weg in die Höhe weich verbinden.',
    anleitung: [
      'Auf „u“ (oder „i“) einen bequemen tiefen Ton singen.',
      'Langsam und verbunden eine Oktave hinaufgleiten, oben kurz halten, wieder hinab.',
      'Der Kehlkopf bleibt ruhig – zur Kontrolle einen Finger leicht an den Hals legen; er soll nicht hochspringen.',
      'Halbton für Halbton höher beginnen; später das Gleiten schneller werden lassen, bis es ein sauberer Sprung ist.',
    ],
    dauerMin: 1.5, stichworte: ['uebergang', 'hoehe', 'sprung'],
  },
  {
    id: 'vokal-leiter', titel: 'Vokal-Leiter auf einem Ton',
    ziel: 'Alle Vokale auf derselben Tonhöhe gleich tragfähig klingen lassen – der Ton bleibt, nur der Mund ändert sich.',
    anleitung: [
      'Einen bequemen Ton wählen.',
      'Auf einem Atem i – e – a – o – u verbunden singen.',
      'Klang und Lautstärke bleiben gleich; den Kiefer nur so weit bewegen wie nötig.',
      'Dann einen Halbton höher; danach mit den Vokalen deines Lieds.',
    ],
    dauerMin: 1.5, stichworte: ['vokale', 'resonanz', 'legato'],
  },
  {
    id: 'vokale-melodie', titel: 'Nur die Vokale auf der Melodie',
    ziel: 'Die Melodie mit den richtig umgewandelten Lied-Vokalen singen, bevor die Konsonanten dazukommen.',
    anleitung: [
      'Die Vokalkette der Zeile ansehen (zum Beispiel „Ou · Ei · O · Ou · ö · Ai“).',
      'Melodie anhören, dann nur die Vokale singen – ohne Konsonanten, ganz verbunden.',
      'Bei Doppellauten (Ai, Ei, Ou) auf dem großen Vokal bleiben und den kleinen Nachlaut erst ganz am Ende kurz antippen.',
      'Erst langsam (50–70 %), dann im Tempo.',
    ],
    dauerMin: 2, stichworte: ['vokale', 'melodie', 'diphthong'],
  },
  {
    id: 'vokal-uebergang', titel: 'Vokal-Übergänge langsam',
    ziel: 'Schwierige Wechsel von einem Vokal zum nächsten sauber und ohne Druck verbinden.',
    anleitung: [
      'Die zwei Vokale der Stelle auf einem bequemen Ton langsam verbinden (zum Beispiel „a ~ i“), je Vokal etwa 3 Sekunden.',
      'Nur das bewegen, was nötig ist: Zunge oder Lippen – der Kiefer bleibt möglichst ruhig.',
      'Dann auf den echten Tönen der Stelle, langsam.',
      'Zum Schluss mit den Wörtern.',
    ],
    dauerMin: 2, stichworte: ['uebergang', 'vokale', 'diphthong'],
  },
  {
    id: 'diphthong', titel: 'Doppellaute singen (Ai, Ei, Ou, Au, Oi)',
    ziel: 'Englische Doppellaute stabil singen: lange auf dem Hauptvokal, der Nachlaut kommt erst am Ende.',
    anleitung: [
      'Das Wort langsam sprechen und den Doppellaut hören: „light“ = La…i(t), „wait“ = We…i(t), „don’t“ = Do…u(n’t).',
      'Auf einem Ton singen: fast die ganze Note auf dem Hauptvokal (A, E, O), den Nachlaut (i, u) erst kurz vor dem Konsonanten.',
      'Nicht zu früh ins i oder u gehen – das macht den Ton eng, besonders in der Höhe.',
      'Dann auf der Melodie des Lieds.',
    ],
    dauerMin: 1.5, stichworte: ['diphthong', 'vokale', 'englisch'],
  },
  {
    id: 'staccato', titel: 'Staccato-Einsätze „ha/ho“',
    ziel: 'Saubere, leichte Toneinsätze mit Atemstütze – ohne Knarren und ohne Pressen.',
    anleitung: [
      'Eine Hand auf den Bauch.',
      'Kurze Töne auf „ha – ha – ha – ha – ha“ (1-3-5-3-1); der Bauch federt bei jedem Ton leicht nach innen.',
      'Dann auf „ho“ – runde Lippen, freier Hals.',
      'Der Einsatz ist weder gehaucht noch hart; leise beginnen.',
    ],
    dauerMin: 1.5, stichworte: ['einsatz', 'atem', 'stuetze'],
  },
  {
    id: 'messa-di-voce', titel: 'Messa di voce (an- und abschwellen)',
    ziel: 'Lautstärke steuern, ohne dass sich Klang, Vokal oder Tonhöhe verändern – gut für lange Töne.',
    anleitung: [
      'Auf einem bequemen Ton „a“ oder „o“ leise beginnen.',
      'In 4 Zählern langsam lauter werden, in 4 Zählern wieder leise.',
      'Tonhöhe und Vokal bleiben gleich (die Tonlinie in der App hilft beim Hinhören).',
      'Erst in der Mitte, später etwas höher – dort nur bis zur mittleren Lautstärke.',
    ],
    dauerMin: 1.5, stichworte: ['dynamik', 'kontrolle', 'halteton'],
  },
  {
    id: 'register-ausgleich', titel: 'Registerübergang tief → hoch mit Vokal-Ausgleich',
    ziel: 'Ohne Bruch und ohne Pressen von der Tiefe in die Höhe – die Vokale passen sich der Höhe an.',
    anleitung: [
      '5-Ton-Leiter oder Dreiklang auf „a“ von der Mitte aufwärts.',
      'Je höher, desto mehr „decken“: a etwas Richtung offenes o (ɔ), i Richtung ü bzw. offenes i (ɪ), e Richtung ö/ä.',
      'Der Mund öffnet sich in der Höhe eher nach unten (Kiefer locker), nicht in die Breite.',
      'Oben nicht lauter werden – lieber etwas leiser und leichter.',
      'Danach dieselbe Anpassung auf den hohen Wörtern des Lieds.',
    ],
    dauerMin: 2, stichworte: ['hoehe', 'uebergang', 'vokale'],
  },
  {
    id: 'spruenge', titel: 'Große Sprünge sicher treffen',
    ziel: 'Sprünge ab einer Quarte sauber und ohne Anschleifen singen.',
    anleitung: [
      'Den Sprung zuerst als langsames Gleiten auf „u“ oder „ng“ singen.',
      'Das Gleiten immer schneller werden lassen, bis nur noch ein kurzer Übergang bleibt.',
      'Den Zielton vor dem Sprung innerlich hören und seinen Vokal schon vorbereiten.',
      'Zum Schluss als sauberer Sprung auf „da“, dann mit Text.',
    ],
    dauerMin: 1.5, stichworte: ['sprung', 'uebergang', 'hoehe'],
  },
  {
    id: 'arpeggio', titel: 'Dreiklang auf „nu-no“',
    ziel: 'Die Stimme mit Dreiklängen (1-3-5-8-5-3-1) beweglich und ausgeglichen machen.',
    anleitung: [
      'Auf „nu“ (oder „no“) 1-3-5-8-5-3-1 verbunden singen.',
      'Das n bringt den Klang nach vorne, das u hält den Hals entspannt.',
      'Halbtonweise höher bis knapp unter den höchsten Ton des Lieds, dann zurück.',
      'Oben leichter werden, nicht lauter.',
    ],
    dauerMin: 1.5, stichworte: ['hoehe', 'sprung', 'einsingen'],
  },
  {
    id: 'melodie-nu', titel: 'Melodie auf „nu“ oder „no“',
    ziel: 'Die Melodie mit einem gleichbleibenden, entspannten Vokal sicher machen.',
    anleitung: [
      'Jede Silbe der Melodie auf „nu“ singen (bei tiefen Tönen „no“).',
      'Ganz gebunden, wie eine einzige Linie.',
      'Bei hohen Tönen nicht lauter werden; das u darf sich leicht öffnen.',
      '2–3 Durchgänge.',
    ],
    dauerMin: 1.5, stichworte: ['melodie', 'resonanz', 'legato'],
  },
  {
    id: 'silben-da', titel: 'Silben auf „da“ im Rhythmus',
    ziel: 'Den Rhythmus der Silben sicher machen, bevor der echte Text dazukommt.',
    anleitung: [
      'Jede gesungene Silbe der Zeile durch „da“ ersetzen.',
      'Erst im halben Tempo, mit Metronom oder Fußtippen.',
      'Das d kurz und vorne an den Zähnen, das a so lang wie die Note.',
      'Dann im Originaltempo.',
    ],
    dauerMin: 1.5, stichworte: ['rhythmus', 'melodie', 'artikulation'],
  },
  {
    id: 'text-rhythmus', titel: 'Text im Rhythmus sprechen',
    ziel: 'Wörter und Betonungen sitzen, ohne dass die Melodie ablenkt.',
    anleitung: [
      'Den Text im Rhythmus des Lieds sprechen, der Fuß tippt den Takt.',
      'Betonte Silben deutlich, unbetonte leicht („the“, „a“ nur kurz).',
      'Englische Laute bewusst: „th“ mit der Zunge zwischen den Zähnen, „w“ mit runden Lippen.',
      'Dann in der Tonhöhe der Melodie sprechen („Sprechsingen“).',
    ],
    dauerMin: 1.5, stichworte: ['rhythmus', 'text', 'artikulation', 'englisch'],
  },
  {
    id: 'konsonanten', titel: 'Konsonanten-Training (Lippen und Zunge)',
    ziel: 'Klare, schnelle Konsonanten, damit die Vokale frei bleiben.',
    anleitung: [
      'Lippen: „pa-ba-ma, pa-ba-ma“ schnell und locker.',
      'Zungenspitze: „ta-da-na-la“ – die Zunge tippt nur kurz hinter den oberen Zähnen an.',
      'Zungenrücken: „ka-ga-nga“.',
      'Gemischt im Rhythmus: „pa-ta-ka“ 8×, erst langsam, dann schneller. Der Kiefer bleibt locker.',
    ],
    dauerMin: 1.5, stichworte: ['konsonanten', 'artikulation', 'schnell'],
  },
  {
    id: 'schnelle-silben', titel: 'Schnelle Silbenfolgen',
    ziel: 'Schnelle Textstellen deutlich und ohne Hetze singen.',
    anleitung: [
      'Die schnelle Stelle auf „da“ im halben Tempo singen.',
      'Dann den Text im Originalrhythmus flüstern – nur Konsonanten und kurze Vokale.',
      'Vokale klein halten und nicht jedes Wort betonen; das Ziel ist die betonte Silbe.',
      'Das Tempo in Stufen steigern: 50 % → 75 % → 100 %.',
    ],
    dauerMin: 1.5, stichworte: ['schnell', 'rhythmus', 'artikulation'],
  },
  {
    id: 'halbtempo', titel: 'Halbtempo-Methode',
    ziel: 'Text und Melodie zusammen in Ruhe sicher machen.',
    anleitung: [
      'Die Zeile im halben Tempo (App: 50 %) mit Text singen.',
      'Jeden Vokal so lang halten wie die Note; die Konsonanten kurz.',
      'Erst wenn es 3× hintereinander gut geht: 75 %, dann 100 %.',
      'Wackelt es, zur letzten sicheren Stufe zurück – das ist normal und gehört zum Lernen.',
    ],
    dauerMin: 2, stichworte: ['tempo', 'text', 'melodie'],
  },
  {
    id: 'rueckwaerts', titel: 'Rückwärts-Aufbau',
    ziel: 'Schwere Zeilen von hinten nach vorne aufbauen – das Ende sitzt dann am sichersten.',
    anleitung: [
      'Erst nur das letzte Wort der Zeile singen.',
      'Dann die letzten zwei Wörter, dann drei … bis zur ganzen Zeile.',
      'Jede Stufe 2× singen, bevor das nächste Wort davorkommt.',
      'Besonders hilfreich bei Zeilen, die zum Ende hin hoch oder lang werden.',
    ],
    dauerMin: 1.5, stichworte: ['text', 'phrase', 'hoehe'],
  },
  {
    id: 'tiefe-locker', titel: 'Tiefe Töne locker',
    ziel: 'Tiefe Töne klangvoll statt gedrückt.',
    anleitung: [
      'Auf „mm“ oder „o“ von einem mittleren Ton langsam abwärtsgleiten.',
      'Das Kinn nicht auf die Brust drücken, der Kopf bleibt gerade.',
      'In der Tiefe nicht lauter werden und nicht ins Knarren fallen – die Luft fließt weiter.',
      'Ein entspanntes „na ja“ in tiefer Sprechlage sagen, dann auf denselben Tönen singen.',
    ],
    dauerMin: 1.5, stichworte: ['tiefe', 'resonanz'],
  },
  {
    id: 'naeh', titel: 'Helle Höhe auf „nä“',
    ziel: 'Mit hellem, nach vorne gebündeltem Klang (Twang) leichter in die Höhe kommen.',
    anleitung: [
      'Ein freches, helles „nä-nä-nä“ sprechen, wie ein neckendes Kind.',
      'Auf diesem Klang 1-3-5-3-1 singen, leise bis mittel.',
      'Der Klang ist schmal und vorne, nicht laut; nichts darf drücken.',
      'Dann die hohe Stelle des Lieds auf „nä“, danach mit Text – der helle Sitz bleibt.',
    ],
    dauerMin: 1.5, stichworte: ['hoehe', 'resonanz', 'twang'],
  },
  {
    id: 'legato', titel: 'Legato-Linie',
    ziel: 'Töne und Wörter zu einer durchgehenden Linie verbinden.',
    anleitung: [
      'Die Zeile auf einem Vokal (zum Beispiel „a“) ganz verbunden singen.',
      'Dann mit Text: Konsonanten kurz und spät, der Strom der Vokale reißt nicht ab.',
      'Während des Singens mit der Hand eine Linie durch die Luft ziehen.',
      'Den Atem bis zum Phrasenende gleichmäßig fließen lassen.',
    ],
    dauerMin: 1.5, stichworte: ['legato', 'phrase', 'vokale'],
  },
  {
    id: 'originaltempo', titel: 'Originaltempo ohne Musik',
    ziel: 'Die Zeile im echten Tempo singen – mit Klavierton als Stütze.',
    anleitung: [
      'Die Zeile im Originaltempo singen, die App spielt die Töne mit.',
      'Auf die geübten Vokale achten, besonders an den markierten Stellen.',
      'Wackelt es: eine Stufe zurück (75 %), nicht durchkämpfen.',
      'Dann zwei Zeilen am Stück, dann den ganzen Teil.',
    ],
    dauerMin: 2, stichworte: ['tempo', 'text'],
  },
  {
    id: 'mit-musik', titel: 'Mit Musik singen',
    ziel: 'Das Gelernte im Zusammenhang des Lieds singen.',
    anleitung: [
      'Zum Playback oder Original singen, zuerst etwas leiser als gewohnt.',
      'Erst einen Teil, dann auch den Übergang in den nächsten Teil.',
      'Auf die Atemstellen und die geübten Vokale achten.',
      'Eine Aufnahme machen und anhören – ohne zu urteilen, nur: Was fällt mir auf?',
    ],
    dauerMin: 3, stichworte: ['lied', 'tempo'],
  },
  {
    id: 'abkuehlen', titel: 'Abkühlen (Cool-down)',
    ziel: 'Die Stimme nach dem Üben wieder entspannen.',
    anleitung: [
      'Sanftes Lippenflattern abwärts, 5×.',
      'Leise in tiefer Sprechlage summen.',
      'Gähnen, Schultern lockern, Wasser trinken.',
    ],
    dauerMin: 1, stichworte: ['lockerung'],
  },
];

const NACH_ID = Object.fromEntries(UEBUNGEN.map(u => [u.id, u]));
export function uebung(id) { return NACH_ID[id] || null; }

// ---------------------------------------------------------------------------
// 2. Hilfen: Notennamen, Vokale, Zuordnung Silbe → Vokal
// ---------------------------------------------------------------------------
const NAMEN_B = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H'];
const NAMEN_KREUZ = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'Ais', 'H'];
let KREUZ = false;
function setzeTonart(tonart) {
  const t = String(tonart || '').toLowerCase();
  KREUZ = /^(g|d|a|e|h|fis|cis)[\s-]*dur/.test(t) || /^(e|h|fis|cis|gis|dis)[\s-]*moll/.test(t);
}
function nn(m) {
  if (!Number.isFinite(m)) return '?';
  const n = Math.round(m);
  return (KREUZ ? NAMEN_KREUZ : NAMEN_B)[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1);
}

const INTERVALL = { 5: 'Quarte', 6: 'Tritonus', 7: 'Quinte', 8: 'kleine Sexte', 9: 'große Sexte',
  10: 'kleine Septime', 11: 'große Septime', 12: 'Oktave' };

// Lage der Vokale: [Öffnung 0 = geschlossen … 3 = offen, Zunge 0 = vorne … 2 = hinten, Lippen 0 = breit … 1 = rund]
const VOKAL_LAGE = { i: [0, 0, 0], 'ü': [0, 0, 1], e: [1, 0, 0], 'ä': [2, 0, 0], 'ö': [1.5, 1, 0.5],
  a: [3, 1, 0], o: [1.5, 2, 1], u: [0, 2, 1] };
function vokalAbstand(a, b) {
  const p = VOKAL_LAGE[a], q = VOKAL_LAGE[b];
  if (!p || !q) return 0;
  return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + 0.5 * Math.abs(p[2] - q[2]);
}
const G = v => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '');
const zit = w => `‚${w}‘`;
const sauber = w => String(w || '').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
const buchst = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const zahl = x => (Number.isFinite(x) ? x : null);
const r1 = x => Math.round(x * 10) / 10;
const komma = x => String(r1(x)).replace('.', ',');

// Hinweise je Vokal für hohe Töne (Vokal-Ausgleich, „decken“).
const HOEHE_TIPP = {
  a: 'das A etwas abdunkeln (Richtung offenes o), den Kiefer locker nach unten fallen lassen, nicht breit ziehen',
  e: 'das E etwas öffnen (Richtung ä/ö), die Mundwinkel nicht breit ziehen',
  'ä': 'das Ä etwas schmaler und runder denken (Richtung ö), nicht breit ziehen',
  i: 'das I etwas öffnen (Richtung ü bzw. offenes i wie in „bitte“), sonst wird es eng',
  o: 'das O rund, aber offen halten (wie in „Sonne“), hinten weit',
  u: 'das U leicht öffnen (Richtung o), damit es trägt und nicht dünn wird',
  'ü': 'das Ü etwas öffnen (Richtung ö)',
  'ö': 'den kurzen Murmellaut leicht nehmen und etwas öffnen (Richtung a), nicht drücken',
};

// Einfache Vokal-Erkennung, falls phonetik.js nicht verfügbar ist.
function einfacheVokale(text) {
  return String(text || '').split(/\s+/).filter(Boolean).map(w => {
    const rein = w.toLowerCase().replace(/[^a-zäöüß]/g, '');
    const gruppen = rein.match(/[aeiouyäöü]+/g) || [];
    const silben = gruppen.map(g => {
      let vokal = g[0] === 'y' ? 'i' : g[0], gleit = '', anzeige = '';
      if (/^(ai|ay|ei|ey)$/.test(g)) { vokal = 'a'; gleit = 'i'; }
      else if (/^(au|ou|ow)$/.test(g)) { vokal = 'a'; gleit = 'u'; }
      else if (/^(eu|äu|oi|oy)$/.test(g)) { vokal = 'o'; gleit = 'i'; }
      else if (/^(ie|ee|ea)$/.test(g)) vokal = 'i';
      else if (g === 'oo') vokal = 'u';
      anzeige = G(vokal) + gleit;
      return { text: g, vokal, gleit, anzeige, lang: g.length > 1, hinweis: '' };
    });
    return { wort: w, silben };
  });
}
function woerterVon(text, sprache) {
  if (typeof P.zeileZuVokalen === 'function') {
    try { const r = P.zeileZuVokalen(text, sprache); if (Array.isArray(r) && r.length) return r; } catch (e) { /* weiter */ }
  }
  return einfacheVokale(text);
}
function sprachVon(z) {
  if (z && z.sprache) return z.sprache;
  if (typeof P.erkenneSprache === 'function') { try { return P.erkenneSprache(z && z.text || ''); } catch (e) { /* weiter */ } }
  return 'en';
}
export function kette(text, sprache) {
  if (typeof P.vokalKette === 'function') {
    try { const k = P.vokalKette(text, sprache); if (typeof k === 'string' && k.trim()) return k; } catch (e) { /* weiter */ }
  }
  return woerterVon(text, sprache).flatMap(w => w.silben || []).map(s => s.anzeige || G(s.vokal)).filter(Boolean).join(' · ');
}

// Ordnet jeder Melodie-Silbe der Zeile ihren gesungenen Vokal zu.
const CACHE = new WeakMap();
function zeileAnalyse(z) {
  if (CACHE.has(z)) return CACHE.get(z);
  const sprache = sprachVon(z);
  const woerter = woerterVon(z.text, sprache).map(w => ({ ...w, wort: sauber(w.wort) || w.wort, silben: w.silben || [] }));
  const flach = [];
  woerter.forEach(w => w.silben.forEach(s => flach.push({ ...s, wort: w.wort })));
  const daten = Array.isArray(z.silben) ? z.silben : [];
  let noten;
  if (!daten.length) {
    noten = flach.map(s => ({ text: s.text, t: null, dauer: null, midi: null, vokal: s.vokal, gleit: s.gleit || '', anzeige: s.anzeige || G(s.vokal), wort: s.wort }));
  } else {
    // Melodie-Silben zu Wörtern bündeln (Feld „wort“ oder über die Buchstaben)
    const gruppen = [];
    let akt = null;
    daten.forEach((s, i) => {
      const leer = !buchst(s.text);
      if (akt && (leer || (s.wort && s.wort === akt.wort && !akt.zu))) akt.idx.push(i);
      else { akt = { wort: s.wort || s.text, idx: [i], zu: false }; gruppen.push(akt); }
      if (s.wortende) akt.zu = true;
    });
    // Ohne „wort“-Feld: Silben über die Buchstaben zu Wörtern zusammensetzen
    if (!daten.some(s => s.wort)) {
      gruppen.length = 0;
      let di = 0;
      for (const w of woerter) {
        const ziel = buchst(w.wort); if (!ziel) continue;
        const g = { wort: w.wort, idx: [] }; let acc = '';
        while (di < daten.length && acc.length < ziel.length) { acc += buchst(daten[di].text); g.idx.push(di); di++; }
        while (di < daten.length && !buchst(daten[di].text)) { g.idx.push(di); di++; }
        if (g.idx.length) gruppen.push(g);
      }
      while (di < daten.length) { (gruppen[gruppen.length - 1] || (gruppen[0] = { wort: '', idx: [] })).idx.push(di); di++; }
    }
    const zu = new Array(daten.length).fill(null);
    let wi = 0;
    for (const g of gruppen) {
      const ziel = buchst(g.wort);
      let k = wi;
      while (k < woerter.length && buchst(woerter[k].wort) !== ziel) k++;
      if (k >= woerter.length) continue;   // Wort nicht gefunden → unten verteilt
      wi = k + 1;
      const ws = woerter[k].silben, n = ws.length, m = g.idx.length;
      g.idx.forEach((di, j) => {
        const s = n ? ws[Math.min(n - 1, Math.floor(j * n / m))] : null;
        zu[di] = s ? { ...s, wort: woerter[k].wort } : { vokal: '', gleit: '', anzeige: '', wort: woerter[k].wort };
      });
    }
    if (zu.some(x => !x)) {
      // Notlösung für nicht zugeordnete Silben: gleichmäßig über die Zeile verteilen
      daten.forEach((_, j) => {
        if (zu[j]) return;
        zu[j] = flach.length ? flach[Math.min(flach.length - 1, Math.floor(j * flach.length / daten.length))]
          : { vokal: '', gleit: '', anzeige: '', wort: sauber(daten[j].text) };
      });
    }
    noten = daten.map((s, j) => ({
      text: s.text, t: zahl(s.t), dauer: zahl(s.dauer), midi: zahl(s.midi),
      vokal: zu[j].vokal || '', gleit: zu[j].gleit || '', anzeige: zu[j].anzeige || G(zu[j].vokal), wort: zu[j].wort || sauber(s.text),
    }));
  }
  // nach = gesungener Nachlaut eines echten Doppellauts (i, u …); r-Färbung „ö“ zählt nicht
  for (const n of noten) n.nach = n.gleit && n.gleit !== 'ö' ? n.gleit.charAt(0) : '';
  const erg = { id: z.id, teil: z.teil, text: z.text, sprache, woerter, noten, kette: kette(z.text, sprache) };
  CACHE.set(z, erg);
  return erg;
}

// Hinweise aus phonetik.uebergaenge() (falls vorhanden) – Schlüssel „von>nach“.
function fremdeHinweise(noten) {
  const karte = {};
  if (typeof P.uebergaenge !== 'function') return karte;
  try {
    const r = P.uebergaenge(noten.map(n => ({ vokal: n.vokal, gleit: n.gleit, anzeige: n.anzeige, wort: n.wort, text: n.text })));
    if (Array.isArray(r)) for (const u of r) {
      if (!u || typeof u !== 'object') continue;
      const von = String(u.von || u.a || '').toLowerCase(), nach = String(u.nach || u.b || '').toLowerCase();
      const h = u.hinweis || u.tipp || u.text;
      // „A → I: …“ bzw. „Ai: …“ am Anfang weglassen – die Stelle wird hier schon genannt
      if (von && nach && typeof h === 'string' && !u.diphthong) karte[von + '>' + nach] = h.replace(/^[^:]{1,12}:\s*/, '');
    }
  } catch (e) { /* weiter */ }
  return karte;
}

// „‚fake‘ → ‚zombies‘ (Ei → O)“ bzw. „in ‚zombies‘ (O → I)“
function stelleText(u) {
  const paar = `(${u.anzeigeA || G(u.von)} → ${u.anzeigeB || G(u.nach)})`;
  return u.wortA === u.wortB ? `in ${zit(u.wortA)} ${paar}` : `${zit(u.wortA)} → ${zit(u.wortB)} ${paar}`;
}

function uebergangsTipp(v1, v2) {
  const a = VOKAL_LAGE[v1], b = VOKAL_LAGE[v2];
  if (!a || !b || v1 === v2) return 'Den Vokal einfach weiterklingen lassen, die Konsonanten dazwischen kurz.';
  const t = [];
  const dh = b[0] - a[0], db = b[1] - a[1], dr = b[2] - a[2];
  if (dh >= 1.5) t.push('den Kiefer langsam und locker öffnen, die Zungenspitze bleibt unten an den Zähnen');
  else if (dh <= -1.5) t.push('den Kiefer nur wenig schließen – hinten bleibt der Raum offen, nicht zuklappen');
  if (db >= 1) t.push('die Zunge gleitet nach hinten, die Lippen werden runder');
  else if (db <= -1) t.push('die Zunge kommt nach vorne, die Lippen lösen sich – nicht breit ziehen');
  else if (dr >= 0.5) t.push('nur die Lippen runden');
  else if (dr <= -0.5) t.push('nur die Lippen lösen, sonst nichts bewegen');
  if (!t.length) t.push('eine kleine Bewegung – nur so viel ändern wie nötig');
  return G(t.join('; ')) + '.';
}

// ---------------------------------------------------------------------------
// 3. Analyse eines Lieds: Umfang, Schwellen, schwierige Stellen
// ---------------------------------------------------------------------------
function kernVon(stimme) {
  if (!stimme || !Array.isArray(stimme.kern)) return null;
  const [lo, hi] = stimme.kern;
  return Number.isFinite(lo) && Number.isFinite(hi) ? [lo, hi] : null;
}

function analysiere(lied, stimme) {
  lied = lied || {};
  setzeTonart(lied.tonart);
  const zeilen = (Array.isArray(lied.zeilen) ? lied.zeilen : []).filter(z => z && z.text).map(zeileAnalyse);
  const alle = zeilen.flatMap(z => z.noten.map(n => n.midi)).filter(Number.isFinite);
  let tief = zahl(lied.umfang && lied.umfang.tief), hoch = zahl(lied.umfang && lied.umfang.hoch);
  if (alle.length) { tief = Math.min(...alle); hoch = Math.max(...alle); }
  const kern = kernVon(stimme);
  const sHoch = stimme && Number.isFinite(stimme.hoch) ? stimme.hoch : null;
  const sTief = stimme && Number.isFinite(stimme.tief) ? stimme.tief : null;
  // Schwelle „hoch“: über dem Kernbereich der Stimme, sonst oberste 15 % des Liedumfangs
  let schwelle = null;
  if (kern) schwelle = kern[1] + 0.5;
  else if (tief != null && hoch != null && hoch > tief) schwelle = hoch - 0.15 * (hoch - tief);
  const sortiert = alle.slice().sort((a, b) => a - b);
  const mitte = sortiert.length ? sortiert[Math.floor(sortiert.length / 2)] : (kern ? Math.round((kern[0] + kern[1]) / 2) : null);
  return { lied, zeilen, tief, hoch, mitte, kern, sHoch, sTief, schwelle, bpm: zahl(lied.bpm) };
}

function istHoch(A, m) { return Number.isFinite(m) && A.schwelle != null && m >= A.schwelle; }

// Alle Vokal-Übergänge einer Zeile mit Schwierigkeit.
function zeilenUebergaenge(A, z) {
  const fremd = fremdeHinweise(z.noten);
  const out = [];
  const n = z.noten;
  for (let i = 0; i < n.length; i++) {
    const a = n[i];
    if (!a.vokal) continue;
    const hochA = istHoch(A, a.midi);
    // Doppellaut innerhalb der Silbe (z. B. light: A → i)
    if (a.nach) {
      let w = 1 + (hochA ? 2 : 0) + (a.dauer >= 0.6 ? 1 : 0) + (a.dauer >= 1.2 ? 0.5 : 0);
      out.push({
        art: 'diphthong', zeile: z.id, i, von: a.vokal, nach: a.nach, wortA: a.wort, wortB: a.wort,
        midiA: a.midi, midiB: a.midi, gewicht: w, anzeige: a.anzeige,
        tipp: `Bei ${zit(a.wort)} auf ${G(a.vokal)} bleiben, das ${a.nach} erst ganz am Ende${hochA && HOEHE_TIPP[a.vokal] ? '; ' + HOEHE_TIPP[a.vokal] : ''}.`,
      });
    }
    const b = n[i + 1];
    if (!b || !b.vokal) continue;
    const von = a.nach || a.vokal, nach = b.vokal;
    const sprung = Number.isFinite(a.midi) && Number.isFinite(b.midi) ? b.midi - a.midi : 0;
    const d = vokalAbstand(von, nach) * (von === 'ö' || nach === 'ö' ? 0.6 : 1);   // Murmellaut zählt weniger
    if (d < 1 && Math.abs(sprung) < 3) continue;
    const gew = d + Math.min(Math.abs(sprung), 12) / 3 + (istHoch(A, b.midi) ? 1.5 : 0);
    let tipp = fremd[von + '>' + nach] || uebergangsTipp(von, nach);
    if (a.nach) tipp = `Erst lange auf ${G(a.vokal)}, das ${a.nach} nur kurz antippen, dann zum ${G(nach)}. ` + tipp;
    if (istHoch(A, b.midi) && HOEHE_TIPP[nach]) tipp += ` Oben: ${HOEHE_TIPP[nach]}.`;
    out.push({
      art: 'uebergang', zeile: z.id, i, von, nach, wortA: a.wort, wortB: b.wort, midiA: a.midi, midiB: b.midi,
      anzeigeA: a.anzeige || G(a.vokal), anzeigeB: b.anzeige || G(b.vokal), gewicht: gew, tipp,
    });
  }
  return out;
}

// Schwierige Stellen eines Teils.
function stellenImTeil(A, zeilen) {
  const st = [];
  const besteJe = (liste, key) => {
    const m = new Map();
    for (const s of liste) { const k = key(s); if (!m.has(k) || m.get(k).gewicht < s.gewicht) m.set(k, s); }
    return [...m.values()];
  };
  const hohe = [], spruenge = [], halte = [], tiefe = [], schnell = [], ueb = [];
  for (const z of zeilen) {
    const n = z.noten;
    n.forEach((a, i) => {
      if (istHoch(A, a.midi)) {
        const ueber = A.sHoch != null && a.midi > A.sHoch;
        let tipp = a.nach ? `Bei ${zit(a.wort)} auf ${G(a.vokal)} bleiben, das ${a.nach} erst ganz am Ende; ` : '';
        tipp += (HOEHE_TIPP[a.vokal] || 'leicht und eher leiser nehmen, nicht drücken');
        if (!a.nach) tipp = `Bei ${zit(a.wort)}: ` + tipp;
        tipp += '.';
        if (ueber) tipp += ' Dieser Ton liegt über dem höchsten Ton deiner Aufnahme (Schätzung) – erst leise und leicht (auf „u“ oder „ng“) hinführen, nichts erzwingen.';
        hohe.push({
          art: 'hoehe', zeile: z.id, i, wort: a.wort, midi: a.midi, uebung: 'register-ausgleich', ueberKern: !!A.kern, ueber,
          gewicht: 3 + (a.midi - A.schwelle) * 0.5 + (ueber ? 2 : 0),
          text: `Hoher Ton ${nn(a.midi)} auf ${zit(a.wort)} (${a.anzeige || G(a.vokal)})`, tipp,
        });
      }
      if (A.kern && Number.isFinite(a.midi) && a.midi < A.kern[0]) {
        tiefe.push({
          art: 'tiefe', zeile: z.id, i, wort: a.wort, midi: a.midi, uebung: 'tiefe-locker', gewicht: 2 + (A.kern[0] - a.midi) * 0.4,
          text: `Tiefer Ton ${nn(a.midi)} auf ${zit(a.wort)} unter deinem Kernbereich`,
          tipp: 'Nicht drücken, das Kinn bleibt gerade; den Ton eher sprechen als singen – leiser ist hier besser.',
        });
      }
      const b = n[i + 1];
      if (b && Number.isFinite(a.midi) && Number.isFinite(b.midi) && Math.abs(b.midi - a.midi) >= 5) {
        const d = b.midi - a.midi, auf = d > 0, ad = Math.abs(d);
        let tipp = auf
          ? `Erst als Gleiten auf „u“ oder „ng“, dann schneller; den oberen Ton vorher innerlich hören und das ${G(b.vokal) || 'Ziel'} schon vorbereiten – nicht von unten anschleifen.`
          : 'Die Stütze halten und den unteren Ton nicht fallen lassen; der Klang bleibt vorne.';
        if (auf && istHoch(A, b.midi) && HOEHE_TIPP[b.vokal]) tipp += ` Oben: ${HOEHE_TIPP[b.vokal]}.`;
        spruenge.push({
          art: 'sprung', zeile: z.id, i, wort: b.wort, midi: b.midi, uebung: auf && ad >= 7 ? 'oktav-glissando' : 'spruenge',
          gewicht: 2 + ad / 3 + (auf ? 0.5 : 0),
          text: `Sprung ${auf ? 'aufwärts' : 'abwärts'} ${nn(a.midi)} → ${nn(b.midi)} (${ad} Halbtöne${INTERVALL[ad] ? ', ' + INTERVALL[ad] : ''}) ${a.wort === b.wort ? 'in ' + zit(a.wort) : 'bei ' + zit(a.wort) + ' → ' + zit(b.wort)}`,
          tipp,
        });
      }
      if (Number.isFinite(a.dauer) && a.dauer >= 1.5 && a.vokal) {
        halte.push({
          art: 'halteton', zeile: z.id, i, wort: a.wort, midi: a.midi, uebung: 'messa-di-voce', gewicht: 1.5 + a.dauer / 2,
          text: `Langer Ton (${komma(a.dauer)} s) auf ${zit(a.wort)} (${a.anzeige || G(a.vokal)})`,
          tipp: `Den Vokal ${G(a.vokal)} gleichmäßig halten${a.nach ? `, das ${a.nach} erst kurz vor dem Ende` : ''}; den Atem fließen lassen, nicht drücken.`,
        });
      }
    });
    // schnelle Silbenfolgen: mind. 4 Silben mit ≤ 0,2 s Abstand
    let lauf = [0];
    const pruefe = () => {
      if (lauf.length >= 4) {
        const a = n[lauf[0]], e = n[lauf[lauf.length - 1]];
        const rate = (lauf.length - 1) / Math.max(0.05, e.t - a.t);
        const ws = [...new Set(lauf.map(k => n[k].wort))];
        schnell.push({
          art: 'schnell', zeile: z.id, i: lauf[0], wort: ws[0], uebung: 'schnelle-silben', gewicht: 2 + Math.max(0, rate - 5),
          text: `Schnelle Silben (${komma(rate)} pro Sekunde) bei ${zit(ws.join(' '))}`,
          tipp: 'Erst auf „da“ im halben Tempo; Konsonanten kurz und vorne, Vokale klein – nur die betonten Silben tragen.',
        });
      }
    };
    for (let i = 1; i < n.length; i++) {
      if (Number.isFinite(n[i].t) && Number.isFinite(n[i - 1].t) && n[i].t - n[i - 1].t <= 0.2) lauf.push(i);
      else { pruefe(); lauf = [i]; }
    }
    pruefe();
    ueb.push(...zeilenUebergaenge(A, z));
  }
  st.push(...besteJe(hohe, s => s.zeile), ...besteJe(spruenge, s => s.zeile), ...besteJe(halte, s => s.zeile),
    ...besteJe(tiefe, s => s.zeile), ...besteJe(schnell, s => s.zeile));

  // lange Phrasen: Silben des Teils ohne Pause ≥ 0,35 s, Länge ≥ 5,5 s
  const folge = zeilen.flatMap(z => z.noten.map(n => ({ ...n, zeile: z.id }))).filter(n => Number.isFinite(n.t) && Number.isFinite(n.dauer))
    .sort((a, b) => a.t - b.t);
  let start = 0;
  const phrase = (s, e) => {
    if (e < s) return;
    const a = folge[s], b = folge[e], laenge = b.t + b.dauer - a.t;
    if (laenge < 5.5) return;
    let luecke = -1, wo = -1;
    for (let k = s; k < e; k++) {
      const g = folge[k + 1].t - (folge[k].t + folge[k].dauer);
      if (folge[k + 1].wort !== folge[k].wort && g > luecke) { luecke = g; wo = k; }
    }
    st.push({
      art: 'phrase', zeile: a.zeile, zeilen: [...new Set(folge.slice(s, e + 1).map(x => x.zeile))], wort: a.wort,
      uebung: 'phrasen-atem', gewicht: 2 + (laenge - 5.5) / 2,
      text: `Lange Phrase (${komma(laenge)} s ohne Pause) ab ${zit(a.wort)}`,
      tipp: 'Vorher ruhig einatmen und den Atem einteilen' + (wo >= 0 ? `; wenn nötig nach ${zit(folge[wo].wort)} kurz nachatmen.` : '.'),
    });
  };
  for (let k = 1; k < folge.length; k++) {
    if (folge[k].t - (folge[k - 1].t + folge[k - 1].dauer) >= 0.35) { phrase(start, k - 1); start = k; }
  }
  if (folge.length) phrase(start, folge.length - 1);

  // die schwersten Vokal-Übergänge (je Wortpaar einmal)
  const uebSort = besteJe(ueb, u => u.art + u.wortA + '>' + u.wortB).sort((a, b) => b.gewicht - a.gewicht);
  const uebAuswahl = uebSort.filter(u => (u.art === 'uebergang' && u.gewicht >= 3) || (u.art === 'diphthong' && u.gewicht >= 2)).slice(0, 3);
  for (const u of uebAuswahl) {
    st.push({
      art: u.art, zeile: u.zeile, i: u.i, wort: u.wortA, midi: u.midiB, uebung: u.art === 'diphthong' ? 'diphthong' : 'vokal-uebergang',
      gewicht: u.gewicht,
      text: u.art === 'diphthong'
        ? `Doppellaut ${u.anzeige} in ${zit(u.wortA)}${Number.isFinite(u.midiA) ? ' auf ' + nn(u.midiA) : ''}`
        : `Vokal-Wechsel ${stelleText(u)}`,
      tipp: u.tipp,
    });
  }
  st.sort((a, b) => b.gewicht - a.gewicht);
  return { stellen: st.slice(0, 8), uebergaenge: uebSort };
}

function teileVon(lied, zeilen) {
  const teile = Array.isArray(lied.teile) ? lied.teile.filter(t => t && t.id != null) : [];
  const ids = new Set(teile.map(t => String(t.id)));
  const liste = teile.map(t => ({ id: t.id, name: t.name || String(t.id), merkmale: t.merkmale || [] }));
  for (const z of zeilen) {
    const k = z.teil == null ? 'ganz' : String(z.teil);
    if (!ids.has(k)) { ids.add(k); liste.push({ id: z.teil == null ? 'ganz' : z.teil, name: z.teil == null ? 'Ganzes Lied' : String(z.teil), merkmale: [] }); }
  }
  return liste.map(t => ({ ...t, zeilen: zeilen.filter(z => String(z.teil == null ? 'ganz' : z.teil) === String(t.id)) }))
    .filter(t => t.zeilen.length);
}

function rueckwaertsFolge(z) {
  const w = String(z.text || '').split(/\s+/).map(sauber).filter(Boolean);
  if (w.length < 2) return null;
  const stufen = [];
  const anz = w.length <= 4 ? [...Array(w.length).keys()].map(k => k + 1) : [1, 2, 3, w.length];
  for (const k of anz) stufen.push(w.slice(w.length - k).join(' '));
  return stufen.map(zit).join(' → ');
}

// ---------------------------------------------------------------------------
// 4. plan(): Lernweg je Teil
// ---------------------------------------------------------------------------
export function plan(lied, stimme) {
  const A = analysiere(lied, stimme);
  const halb = A.bpm ? ` (${Math.round(A.bpm / 2)} BPM)` : '';
  const voll = A.bpm ? ` (${Math.round(A.bpm)} BPM)` : '';
  const hinweis = (A.kern ? '' : HINWEIS_STIMMLAGE + ' ') + SICHERHEIT;
  return teileVon(A.lied, A.zeilen).map((t, ti, alleTeile) => {
    const zids = t.zeilen.map(z => z.id);
    const mid = t.zeilen.flatMap(z => z.noten.map(n => n.midi)).filter(Number.isFinite);
    const umfang = mid.length ? { tief: Math.min(...mid), hoch: Math.max(...mid) } : null;
    const { stellen, uebergaenge } = stellenImTeil(A, t.zeilen);
    const schritte = [];
    const S = (stufe, uebungId, text, zeilen, extra) => schritte.push({ stufe, uebung: uebungId, titel: (NACH_ID[uebungId] || {}).titel || '', text, zeilen, ...(extra || {}) });

    // (1) Melodie auf Lippenflattern / Summen
    S(1, 'lippenflattern-melodie', umfang
      ? `Melodie von „${t.name}“ auf Lippenflattern „brrr“ (oder Summen „mm“), 3 Durchgänge. Bereich ${nn(umfang.tief)}–${nn(umfang.hoch)}. Bei hohen Tönen nicht lauter werden.`
      : `Melodie von „${t.name}“ aus dem Original auf Lippenflattern „brrr“ oder Summen „mm“ nachsingen, 3 Durchgänge.`, zids);

    // (2) nur Vokale
    const ketten = t.zeilen.map(z => ({ zeile: z.id, text: z.text, kette: z.kette }));
    S(2, 'vokale-melodie', 'Nur die Vokale singen, ganz verbunden – bei Doppellauten auf dem großen Vokal bleiben, der kleine Nachlaut kommt erst am Ende: '
      + ketten.map(k => `„${k.text}“ → ${k.kette}`).join('; ') + '.', zids, { ketten });

    // (3) Vokal-Übergänge der schweren Stellen + passende Übungen je Stelle
    const schwerUeb = uebergaenge.filter(u => u.art === 'uebergang').slice(0, 3);
    S(3, 'vokal-uebergang', schwerUeb.length
      ? 'Die schwersten Wechsel langsam, je 3× auf einem Ton, dann auf den echten Tönen: '
        + schwerUeb.map(u => `${stelleText(u)}: ${u.tipp}`).join(' ')
      : 'Die Wechsel zwischen den Vokalen langsam verbinden; in diesem Teil gibt es keine besonders großen Vokal-Sprünge.',
      [...new Set(schwerUeb.map(u => u.zeile))].length ? [...new Set(schwerUeb.map(u => u.zeile))] : zids);
    const arten = [...new Set(stellen.map(s => s.art))].filter(a => a !== 'uebergang');
    for (const art of arten) {
      const liste = stellen.filter(s => s.art === art);
      const uebId = liste[0].uebung;
      let text = liste.map(s => `${s.text}: ${s.tipp}`).join(' ');
      if (art === 'hoehe') text += liste.some(s => s.ueberKern) ? ' Diese Töne liegen über deinem Kernbereich: vorher mit Sirene und Strohhalm vorbereiten, oben leichter statt lauter.'
        : ' Vorher mit Sirene und Strohhalm vorbereiten, oben leichter statt lauter.';
      S(3, uebId, text, [...new Set(liste.flatMap(s => s.zeilen || [s.zeile]))]);
    }

    // (4) Silben auf „da“
    const nSilben = t.zeilen.reduce((a, z) => a + z.noten.length, 0);
    S(4, 'silben-da', `Alle ${nSilben} Silben auf „da“ im Rhythmus – erst halbes Tempo${halb}, dann Originaltempo${voll}.`, zids);

    // (5) Text halbes Tempo (+ Rückwärts-Aufbau der schwersten Zeile)
    S(5, 'halbtempo', `Mit Text im halben Tempo – App auf 50 %${A.bpm ? `, also ${Math.round(A.bpm / 2)} BPM` : ''}. Erst wenn es 3× sicher ist: 75 %, dann 100 %.`, zids);
    const gew = {};
    for (const s of stellen) for (const zid of (s.zeilen || [s.zeile])) gew[zid] = (gew[zid] || 0) + s.gewicht;
    const schwerste = t.zeilen.slice().sort((a, b) => (gew[b.id] || 0) - (gew[a.id] || 0))[0];
    const rw = schwerste && rueckwaertsFolge(schwerste);
    if (rw && (gew[schwerste.id] || 0) > 0) S(5, 'rueckwaerts', `Schwerste Zeile „${schwerste.text}“ rückwärts aufbauen: ${rw}.`, [schwerste.id]);

    // (6) Originaltempo, (7) mit Musik
    S(6, 'originaltempo', `Originaltempo${voll} ohne Musik, mit Klavier oder Vokalstimme als Stütze.`, zids);
    const naechster = alleTeile[ti + 1];
    S(7, 'mit-musik', `Mit Musik: „${t.name}“ im Zusammenhang singen${naechster ? `, dann auch den Übergang in „${naechster.name}“` : ''}.`, zids);

    return {
      teil: t.id, name: t.name, umfang, zeilen: zids, merkmale: t.merkmale,
      schwierig: stellen, schritte, hinweis,
    };
  });
}

// ---------------------------------------------------------------------------
// 5. warmup(): 5–10 Minuten, maßgeschneidert auf das Lied
// ---------------------------------------------------------------------------
export function vokalStatistik(lied) {
  const A = analysiere(lied, null);
  const zahlV = {}, doppel = {};
  for (const z of A.zeilen) for (const n of z.noten) {
    if (!n.vokal) continue;
    zahlV[n.vokal] = (zahlV[n.vokal] || 0) + (n.vokal === 'ö' ? 0.5 : 1) * (Number.isFinite(n.dauer) ? 0.5 + Math.min(n.dauer, 2) : 1);
    if (n.gleit) {
      const k = n.anzeige || G(n.vokal) + n.gleit;
      if (!doppel[k]) doppel[k] = { anzeige: k, vokal: n.vokal, gleit: n.gleit, beispiel: n.wort, anzahl: 0 };
      doppel[k].anzahl++;
    }
  }
  const vokale = Object.entries(zahlV).sort((a, b) => b[1] - a[1]).map(([v]) => v);
  return { vokale, doppellaute: Object.values(doppel).sort((a, b) => b.anzahl - a.anzahl) };
}

export function warmup(lied, stimme) {
  const A = analysiere(lied, stimme);
  const schritte = [];
  const W = (uebungId, text, minuten, ton, extra) =>
    schritte.push({ uebung: uebungId, titel: (NACH_ID[uebungId] || {}).titel || '', text, minuten, ton: ton || null, ...(extra || {}) });

  // Bereich: Lied, sonst Kernbereich der Stimme
  let tief = A.tief, hoch = A.hoch;
  if ((tief == null || hoch == null) && A.kern) { tief = A.kern[0]; hoch = A.kern[1]; }
  const hat = tief != null && hoch != null;
  const mitte = A.mitte != null ? A.mitte : (hat ? Math.round((tief + hoch) / 2) : null);
  const titel = A.lied.titel ? `„${A.lied.titel}“` : 'dein Lied';

  // 1. Lockerung
  W('kiefer-zunge', 'Schultern kreisen, Kopf sanft neigen, einmal gähnen. Dann Kiefer mit den Fingern massieren und locker hängen lassen, Zunge nach vorne wölben. '
    + (A.kern ? '' : HINWEIS_STIMMLAGE + ' ') + 'Wichtig: ' + SICHERHEIT, 1, null, { hinweis: A.kern ? SICHERHEIT : HINWEIS_STIMMLAGE + ' ' + SICHERHEIT });

  // 2. SOVT: Lippenflattern / Strohhalm, 5-Ton-Leiter durch den Liedbereich
  if (hat) {
    const start = tief;
    const bis = Math.max(start, hoch - 7);
    const muster = [0, 2, 4, 5, 7, 5, 4, 2, 0];
    W('lippenflattern', `Lippenflattern „brrr“ (oder in den Strohhalm), 5-Ton-Leiter ab ${nn(start)}, jeden Durchgang einen Halbton höher bis zum Beginn auf ${nn(bis)} (oben ${nn(bis + 7)}). Gleichmäßiger Luftstrom, nicht lauter werden.`,
      1.5, { start, von: start, bis: bis + 7, muster, folge: muster.map(x => start + x), starts: [...Array(bis - start + 1).keys()].map(k => start + k) });
  } else {
    W('lippenflattern', 'Lippenflattern „brrr“ (oder in den Strohhalm) auf einer 5-Ton-Leiter, in bequemer mittlerer Lage beginnen und halbtonweise höher, solange es leicht bleibt.', 1.5, null);
  }

  // 3. Sirenen über den Umfang des Lieds (+1 Halbton)
  if (hat) {
    let text = `„Ng“-Sirenen von ${nn(tief)} bis ${nn(hoch + 1)} – dem Umfang von ${titel} plus einem Halbton – und zurück, 4–6×. Nur so weit, wie es mühelos geht.`;
    if (A.sHoch != null && hoch + 1 > A.sHoch) text += ` Der obere Bereich liegt über dem höchsten Ton deiner Aufnahme (Schätzung): dort leise und leicht bleiben.`;
    if (A.sTief != null && tief < A.sTief) text += ' Der tiefste Ton liegt unter deiner Aufnahme: unten nicht drücken.';
    W('ng-sirene', text, 1.5, { start: tief, von: tief, bis: hoch + 1, folge: [tief, hoch + 1, tief], gleiten: true });
  } else {
    W('ng-sirene', '„Ng“-Sirenen von bequem tief nach bequem hoch und zurück, 4–6×. Nur so weit, wie es mühelos geht.', 1.5, null);
  }

  // 4. Vokal-Leiter mit den häufigsten Vokalen des Lieds
  const stat = vokalStatistik(A.lied);
  const reihe = stat.vokale.filter(v => v !== 'ö').slice(0, 4);
  const vokale = reihe.length >= 2 ? reihe : ['i', 'e', 'a', 'o', 'u'];
  const dl = stat.doppellaute.slice(0, 3);
  W('vokal-leiter', `Vokal-Leiter auf einem Ton mit den häufigsten Vokalen von ${titel}: ${vokale.map(G).join(' – ')}, verbunden auf einem Atem; dann einen und zwei Halbtöne höher.`
    + (dl.length ? ' Danach die Doppellaute des Lieds: ' + dl.map(d => `${d.anzeige} wie in ${zit(d.beispiel)}`).join(', ') + ' – lange auf dem ersten Vokal, der Nachlaut erst am Ende.' : ''),
    1.5, mitte != null ? { start: mitte, von: mitte, bis: mitte + 2, folge: vokale.map(() => mitte), starts: [mitte, mitte + 1, mitte + 2] } : null,
    { vokale, doppellaute: dl });

  // 5. die 3 schwersten Übergänge des ganzen Lieds
  const alleUeb = [];
  for (const z of A.zeilen) alleUeb.push(...zeilenUebergaenge(A, z));
  const gesehen = new Set();
  const top = alleUeb.sort((a, b) => b.gewicht - a.gewicht).filter(u => {
    const k = u.art + u.wortA + '>' + u.wortB;
    if (gesehen.has(k)) return false;
    gesehen.add(k); return true;
  }).slice(0, 3);
  for (const u of top) {
    const m1 = Number.isFinite(u.midiA) ? u.midiA : mitte, m2 = Number.isFinite(u.midiB) ? u.midiB : mitte;
    const ton = m1 != null && m2 != null ? { start: m1, von: Math.min(m1, m2), bis: Math.max(m1, m2), folge: u.art === 'diphthong' ? [m1] : [m1, m2] } : null;
    const was = u.art === 'diphthong'
      ? `Doppellaut ${u.anzeige} in ${zit(u.wortA)}`
      : `Übergang ${stelleText(u)}`;
    W(u.art === 'diphthong' ? 'diphthong' : 'vokal-uebergang',
      `${was}${ton ? ` auf ${ton.folge.map(nn).join(' → ')}` : ''}: erst langsam auf den Vokalen, 3×, dann mit den Wörtern. ${u.tipp}`,
      0.75, ton, { zeile: u.zeile, vokale: u.art === 'diphthong' ? [u.von, u.nach] : [u.von, u.nach] });
  }

  // 6. eine Zeile auf Vokalen – die anspruchsvollste mit Melodie
  const gew = {};
  for (const u of alleUeb) gew[u.zeile] = (gew[u.zeile] || 0) + u.gewicht;
  for (const z of A.zeilen) for (const n of z.noten) if (istHoch(A, n.midi)) gew[z.id] = (gew[z.id] || 0) + 1.5;
  const mitMelodie = A.zeilen.filter(z => z.noten.some(n => Number.isFinite(n.midi)));
  const zeile = (mitMelodie.length ? mitMelodie : A.zeilen).slice().sort((a, b) => (gew[b.id] || 0) - (gew[a.id] || 0))[0];
  if (zeile) {
    const folge = zeile.noten.map(n => n.midi).filter(Number.isFinite);
    W('vokale-melodie', `Zeile „${zeile.text}“ nur auf den Vokalen: ${zeile.kette}. Erst mit 70 % Tempo, dann im Originaltempo; verbunden singen, bei Doppellauten auf dem ersten Vokal bleiben.`,
      1.5, folge.length ? { start: folge[0], von: Math.min(...folge), bis: Math.max(...folge), folge, dauern: zeile.noten.filter(n => Number.isFinite(n.midi)).map(n => n.dauer) } : null,
      { zeile: zeile.id, kette: zeile.kette });
  }

  // auf 5–10 Minuten bringen
  let summe = schritte.reduce((a, s) => a + s.minuten, 0);
  if (summe < 5) {
    W('staccato', 'Staccato-Einsätze auf „ha – ho“ (1-3-5-3-1), leicht und federnd' + (mitte != null ? `, ab ${nn(mitte - 4)}` : '') + '.',
      Math.max(1, r1(5 - summe)), mitte != null ? { start: mitte - 4, von: mitte - 4, bis: mitte + 3, folge: [0, 4, 7, 4, 0].map(x => mitte - 4 + x) } : null);
    summe = schritte.reduce((a, s) => a + s.minuten, 0);
  }
  if (summe > 10) { const f = 10 / summe; for (const s of schritte) s.minuten = r1(s.minuten * f); }
  return schritte;
}

// Für die Oberfläche: die schwersten Übergänge eines Lieds (z. B. für die Liedseite).
export function schwersteUebergaenge(lied, stimme, anzahl = 3) {
  const A = analysiere(lied, stimme);
  const alle = A.zeilen.flatMap(z => zeilenUebergaenge(A, z)).sort((a, b) => b.gewicht - a.gewicht);
  const gesehen = new Set();
  return alle.filter(u => { const k = u.art + u.wortA + '>' + u.wortB; if (gesehen.has(k)) return false; gesehen.add(k); return true; }).slice(0, anzahl);
}
