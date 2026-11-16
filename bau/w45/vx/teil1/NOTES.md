# TEIL1 – Songteile im Spektral-Lineal (Basis rel-4750, 4.75.0)

Xander (15.11.): ein per Audio importiertes Lied in Songteile zerlegen, die Teile automatisch erkennen, oben in der Taktleiste
die Namen sehen, sich auf einen Teil konzentrieren und ihn mit seinen MIDI-Noten je Ebene in die Clip-Matrix schicken.

## Bedienweg

1. Spektral › Datei laden: Beim Laden läuft die Tempo-Erkennung ohnehin; aus demselben Lauf kommen jetzt die Songteile
   (`meta.grid.teile`, im Dokument gespeichert). Kein zweiter Lauf, kein Warten.
2. Über den Taktzahlen erscheint ein 18 px hoher Streifen: je Teil ein farbiger Kasten (Farben wie die Teil-Chips im
   Szenen-Blatt), Name in 10 px, gekürzt mit „…“, unter 18 px Breite ohne Text. Der Teil an der Marke ist voll deckend und hat
   unten eine helle Linie. Hochkant steht im Kopf „Testlied › Strophe 1“, quer zeigt es der Streifen. Bei langem
   Dateinamen wird nur der Name mit „…“ gekürzt, „› Refrain 1“ bleibt immer sichtbar (Nachbesserung).
3. Tipp auf einen Teil im Streifen = Fokus: Loop = Teil (ein ↶ „Loop“), waagrecht auf den Teil gezoomt (3 % Rand),
   Senkrechte bleibt, Marke auf den Teilanfang. Statuszeile „Refrain 1 · Takt 13–20 · im Loop · „In die Matrix ▾“ in der
   Ebenen-Liste“ (Nachbesserung: nennt den Weg in die Matrix).
   Zweiter Tipp auf denselben Teil = ganzes Lied (nur waagrecht), der Loop bleibt; dritter Tipp wieder auf den Teil usw.
   (Nachbesserung: „im Fokus“ gilt nur, wenn die Sicht ungefähr der Teil ist – sichtbare Dauer ≤ 1,3 × Teil).
   Ziehen im Streifen rollt wie bisher, Halten setzt wie bisher einen 1-Takt-Loop. Tipp unten (Taktzahlen) = Position wie bisher.
4. Loop-Zeile in der Ebenen-Liste nennt den Teil: „Refrain 1 · Takt 13–20“ (auch als aria-label).
5. In die Matrix ▾ › erster Eintrag „Als Szene · alle Ebenen …“ (darunter klein „Teil „Refrain 1“ · Audio/MIDI je Ebene“)
   öffnet das vorhandene Szenen-Blatt (SPK11) nur für den Loop: Kopf „1 Teil · 120 BPM · 4/4 · nur Loop Takt 13–20“,
   „Refrain 1 · Takt 13–20 → Szene 1“. Anlegen = je Ebene Audio und/oder MIDI in einer Szene, ein ↶ in der Matrix.
   Auftakt: Tipp auf das Intro mit Vorlauf-Takt → Loop-Zeile/Status „Intro · Takt 0–4“, Blatt-Kopf „nur Loop Takt 0–4“, Zeile
   „Intro · Auftakt + Takt 1–4“; die Szene enthält den Vorlauf-Takt (Nachbesserung).
   Stille Teile: kein Clip → keine Szene; die Teile mit Clips rücken ohne Lücke nach vorn (Szene 1, 2, …), Zähler und
   „Angelegt:“ nennen nur Szenen mit Clips, dazu „Intro: still – keine Szene“ (Nachbesserung).
   Mit Auswahl: MIDI-Noten je Ebene nur in der Auswahl – jetzt auch für Ellipse, Lasso, Zauberstab, Umkehren und − / ∩
   (Nachbesserung F, siehe unten).
6. Fokus „Nur Rest“ (FOKUS1) bleibt unverändert, der Streifen bleibt farbig sichtbar – man sieht, in welchem Teil man ist.

## Haken (alle mit typeof abgesichert, Marke /* TEIL1 */)

- spk1Grid: Raster bekommt `teile` aus demselben imp1Analyse-Ergebnis (teil1GridTeile → spk11Seg).
- Kern (spk3DspMake, nach loopSet): ops `teileSet` (schreibt meta.grid.teile, kein ↶) und `teileDrop` (Test-Haken).
- spk1RulerDraw, erste Zeile: teil1Ru zeichnet den Streifen und gibt 18 zurück; der alte Inhalt wird um 18 px verschoben.
- spk1SideGest, Ende-Griff Lineal: teil1RuTap (y < 22 px, Teile vorhanden) vor dem Positions-Tipp.
- spk2LpDown: im Streifen keine Loop-Klammer greifen (sonst nahm ein Tipp neben einem schmalen Loop die Klammer statt den Teil).
- spk1Layers + spk1Show: teil1Sync (Klasse `spk13-tl` = Lineal 44 statt 26 px, Teile in SPK11.ana, Hintergrund-Erkennung).
- spk2LpRow: Teil-Name statt „Loop Takt …“, wenn der Loop genau ein Teil ist.
- spk2MxDd: teil1MxRow (Als Szene · alle Ebenen …).
- spk11Parts: Bereich = Loop nur, wenn das Blatt aus dem Loop-Menü kommt (teil1LpSpan); `sel` nur bei echter Auswahl, neu `lp`.
- spk11Dd Kopfzeile: „· nur Loop Takt a–b“.
- spk11Go: Szenen-Name erst, wenn mindestens ein Clip darin liegt; stille Teile: „Intro: still – keine Szene“.
- spk11Seg: Gruppe nur ganz vorne/hinten mit Läufen kürzer als der Median zählt nicht als wiederholt (→ Intro/Outro);
  Pegel je 4-Takt-Block aus jeder 32. Probe (vorher jede 4.) – damit bleibt die Erkennung beim Laden unter 5 ms.
- imp1Run: Import nimmt dieselben Teile (spk11Seg) wie die Spektral-Seite.
- Nachbesserung: Kern-op `selHit` {doc, sel, sv, pts:[[t, f]…]} (spk3DspMake, nach teileSet): dieselbe Auswahlfunktion wie der
  Audio-Teil (selFn → spk12SelFn, Zwischenspeicher d.selC wie op block), Treffer bei w ≥ 0,5. spk11Notes fragt über
  teil1InSel; einfache Formen (Zeit/Frequenz/Rechteck/Pinsel/Harmonische) bleiben bei spk11InSel (gleiches Ergebnis wie
  bisher), nur Auswahlen mit SPK12-Formen gehen über selHit. Geholt einmal je (Dokument, Auswahl-Version) beim Öffnen des
  Blatts (Wrapper um spk11Open, Blatt zählt danach neu) und vor dem Anlegen (Haken vor „4) ein ↶“, für eben gefundene Noten).
- Nachbesserung spk11Go: Haken teil1Pack nach spk11Targets (stille Teile raus, Szenen ohne Lücke); Namens-Zeile setzt
  out.scenes/out.parts auf Szenen mit Clips; „Angelegt:“ nimmt res.parts.
- Block TEIL1-BEGIN/END nach SPK11-END: Wrapper um spk11Teile (gespeicherte Teile sofort; sonst ein Lauf je Dokument,
  Ergebnis per teileSet speichern), Streifen, Tipp, Hintergrund-Erkennung, API `window.__teil1`.
- Nicht angefasst: mtx3/mtx3b (clip1), fokus1-Interna (nur fokus1Mode im Test benutzt).

## Bewusste Abweichung vom Auftrag

- „spk11Span = Auswahl, sonst Loop“ habe ich nicht global gemacht: Der Loop wird im Dokument gespeichert. Würde jedes
  „Ansicht ▾ › Szenen anlegen …“ einen gesetzten Loop nehmen, legte man nach einem Fokus-Tipp unbemerkt nur noch eine Szene an.
  Deshalb gilt der Loop-Bereich nur, wenn das Blatt über „In die Matrix ▾ › Als Szene“ geöffnet wird (Merker U.t1lp = seq des
  Blatts). Über „Ansicht ▾“ zeigt das Blatt wie bisher alle Teile.
- spk11Notes musste nicht geändert werden: spk11Span bleibt „nur echte Auswahl“, der Formfilter gilt also nur dort.

## Messungen (teil1-test.mjs, Testlied I4 S8 R8 S8 R8 O4, 120 BPM, 80 s)

Alle Zeiten im Test-Chrome (Software-WebGL), Maschine während der Läufe mit 7–15 Last (Regression parallel).

| Prüfung | 428×926 | 926×428 | 926×370 |
|---|---|---|---|
| T1 Teile beim Laden: 6, Grenzen 0/4/12/20/28/36 Takte, Namen Intro … Outro, imp1Analyse 1× | ok | ok | ok |
| T1 Zusatzzeit Teile-Erkennung beim Laden (spk11Seg, kalt) | 5,0 ms | 10 ms (unter Last) | 3 ms |
| T2 Szenen-Blatt zeigt Teile (vorher 977 ms „erkenne Songteile“) | 43–77 ms | 49 ms | 37 ms |
| T3 Import: dieselben 6 Teile + 6 Song-Marken (vorher 4, teils falsch) | ok | – | – |
| T4 Lineal 44 px, 6 Kästen, Pixelfarbe = IMP1_PC[grp] (±6), Kopf „Testlied › Intro“ → „› Refrain 1“ | ok | ok | ok |
| T5 Fokus Refrain 1: Loop [12,20], Sicht 23,52–40,48 s, Senkrechte gleich, ↶, 2. Tipp ganzes Lied, Ziehen rollt, Halten 1-Takt-Loop | ok | ok | ok |
| T6 „Nur Rest“ + Tipp Strophe 2: Loop [20,28], Streifen da, kein Fehler | ok | ok | ok |
| T7 Als Szene: 1 Teil „Refrain 1 · Takt 13–20 → Szene 1“, nur Loop; 1 neue Szene „Refrain 1“, Bass-MIDI 37 = 37 Bass-Noten in 24–40 s, Drums 94; ↶ nimmt alles zurück; keine leere benannte Szene | ok | ok | ok |
| T8 Neu laden: Streifen sofort, imp1Analyse 0×, Loop noch da | ok | ok | ok |
| T8 Altes Dokument ohne Teile: Lineal 26 px → Streifen nach | 1,2–1,6 s | 1,2–1,4 s | 1,4 s |
| T8 dabei U.busy / Knöpfe | frei | frei | frei |
| T10 spk1RulerDraw mit Teilen, Mittel aus 120 | 0,014–0,027 ms | 0,009–0,018 ms | 0,016–0,025 ms |
| T10 teil1Tap (Fokus-Tipp, eigener Code inkl. Ebenen-Liste) | 0,1–2,5 ms | 0–5,1 ms | 0,1–2,1 ms |
| T10 Hauptfläche mit / ohne Streifen | 446 / 464 px | 292 / 310 px | 234 / 252 px (−18) |
| Konsole | 0 Fehler | 0 Fehler | 0 Fehler |

Lange Aufgaben (> 50 ms): Keine kommt aus TEIL1-Code (Streifen 0,02 ms, Tipp ≤ 5 ms). Im Fokus-Abschnitt (Zoom, ↶,
Rollen, Halten) und bei der Hintergrund-Erkennung entstehen sie beim vollen Neuzeichnen des Spektrums nach Zoom bzw. nach dem
Neu-Zuschnitt (Lineal 26 → 44 px). Gegenprobe ohne TEIL1-Code (nur die Klasse zweimal umschalten): 4 lange Aufgaben
63–247 ms – gleiche Größenordnung wie die 2 bei der Hintergrund-Erkennung (107–164 ms; bei 926×370 0). Verbesserung dabei: der
Neu-Zuschnitt läuft nur noch über den vorhandenen ResizeObserver (vorher doppelt: 4 statt 2 lange Aufgaben).
Kein zusätzlicher imp1Analyse-Lauf beim Laden; beim Neuöffnen 0 Läufe.

Ladezeit App (Start bis SYNQUENZER bereit, 428×926, abwechselnd, 10 Läufe je Datei): rel-4750 Median 1151 ms
(946–1268), TEIL1 Median 1099 ms (1018–1466) – im Rauschen, kein Mehraufwand beim Start (TEIL1 rechnet beim Start nichts).
Datei 9 413 777 → 9 428 509 Byte (+14,7 KB).

Fotos (dpr 2) in fotos/: 01-geladen, 02-streifen, 03-fokus-refrain, 04-nur-rest-strophe2, 05-szenen-blatt-loop,
06-matrix-danach, 07-nach-neu-laden (je 3 Größen), 08-import-teile (hochkant), rauchtest.png.

## Regression

Kopien der Skripte in reg/<paket>/ (Ausgaben dort, die Originalordner bleiben unberührt; mess/ = Demo-Stems aus fokus1).

| Skript | Ergebnis |
|---|---|
| spk11/spk11-test.mjs | 41 OK / 0 |
| spk11b/spk11b-test.mjs | 17 OK / 0 |
| fokus1/fokus1-kern-test.mjs | 26 OK / 0 |
| fokus1/fokus1-test.mjs | 44 OK / 7 – alle 7 sind Long-Task-Schwellen beim Umschalten des Fokus (62–112 ms) unter Last 12–15; dieselben Punkte scheitern schon im Release-Lauf von FOKUS1 (vx/fokus1/test-voll.log: 4 davon, 51–66 ms); die Grundlast-Messung im selben Lauf (Original laden, ohne Fokus) hatte selbst 13 lange Aufgaben bis 386 ms. Funktion: alle grün. |
| spk12/spk12-test.mjs | 98 OK / 0 |
| imp/imp1-test.mjs | ALLE OK – die Teile der drei Test-Lieder bleiben gleich (8 Teile, 0 ms Abweichung); die Änderung 4 → 6 Teile betrifft das TEIL0-Testlied (Intro/Outro statt „Teil A“) und ist in teil1-test T3 geprüft, imp1-test musste nicht geändert werden |
| spk3/spk3-loop-test.mjs | ALLE OK (10) |
| spk2/spk2-loop-test.mjs | ALLE OK (18) (erster Lauf brach ab: mess/ fehlte im Paketordner; nach dem Kopieren grün) |
| Rauchtest dirigent-test/smoke.mjs | errors [] |
| topdefs | doppelt 0, Syntaxfehler 0 |
| dupkeys | 0 doppelte Schlüssel |
| grep 'MS 2000' / '^  live: true,' | 1 / 1 |
| VERSION | '4.75.0' |

Die letzte kleine Änderung (Neu-Zuschnitt nur über den ResizeObserver) kam nach dem Start von spk11, fokus1-kern und imp1;
sie wirkt nur, wenn Teile mitten in der Sitzung erscheinen oder verschwinden (alte Dokumente), was diese drei Tests nicht
berühren. teil1-test lief vollständig auf der Endfassung.

## Offen

- T1-Ziel < 5 ms: kalt im Leerlauf 3–3,5 ms, unter Last bis 10 ms (Test markiert 2 von 3 Größen rot). Ersetzt den zweiten
  Erkennungslauf von 977 ms.

- F ist in der Nachbesserung gebaut (siehe „Prüfung“). Der Zauberstab läuft über denselben Weg (spk12SelFn → spk12Ras), ist
  im Nachtest aber nicht eigens geprüft (braucht ein echtes Zauberstab-Raster aus der Bedienung).
- Quer zeigt die Loop-Zeile in der Ebenen-Spalte nur „Lo…“ (schon in der Basis so, betrifft jetzt auch „Refrain 1 · Takt 13–20“).
  Nicht gebaut, weil sichtbar – Vorschlag für den Funk: quer in der Loop-Zeile nur den Teil-Namen zeigen (ohne „Takt …“), den
  vollen Text weiter im aria-label; alternativ den ▶-Knopf quer schmaler. Hochkant ist der Text voll lesbar.
- „Neue Auswahl innerhalb eines Clips → neuer Clip“ (Xanders letzter Satz) ist nicht Teil von TEIL1.
- Chrome-Test: Ein Tipp ganz oben links im Streifen (y < 10 px) unter dem Spektrum/Noten-Regler (SPK5, rechts in der
  Werkzeugleiste) wird von Chromes Touch-Anpassung dem Regler zugeschlagen. Der Test tippt bei 13 px. Auf dem iPhone gibt es
  diese Anpassung nicht; trotzdem liegt der Streifen direkt unter der Werkzeugleiste.
- Stille: Im Testlied ist das Intro auf den zerlegten Ebenen nicht still (Fläche blutet in Bass/Drums, „Noten finden“ findet im
  Intro eine Bass-Note). Darum entsteht dort eine Szene „Intro“ mit Clips – richtig nach der Regel „Name nur mit Clip“.
  Leere, benannte Szenen gibt es nicht mehr (geprüft).
- Lange Aufgaben: siehe Messungen. Das Neu-Zuschneiden der Spektrum-Fläche (Lineal 26 → 44 px, einmal je Dokument, wenn die
  Teile im Hintergrund erst erscheinen) zeichnet das ganze Spektrum neu; im Test-Chrome (Software-WebGL) dauert das > 50 ms.

## Endfassung

index.html md5 7d47c214645e0734f09868c496f9e330 (erste Fassung 7fcf0543, liegt als index-v1.html daneben; Basis rel-4750
b8009096f96446a5d06f1c0a393b6312), VERSION bleibt 4.75.0. Datei 9 413 777 → 9 434 140 (+20,4 KB) Byte.

## Prüfung (Nachbesserung nach dem Prüfer, 16.11. 00:19–00:34)

Befunde des Prüfers (7: 2 mittel, 5 klein) – Stand:

| # | Befund | Stand | Beleg (nb/nach-test.mjs, Touch über CDP) |
|---|---|---|---|
| 1 | 3. Tipp auf denselben Teil zoomt nicht mehr | behoben: „im Fokus“ nur, wenn sichtbare Dauer ≤ 1,3 × Teil und Teil im Bild | 4 Tipps Refrain 1 = 23,52–40,48 / −0,05–81,05 / 23,52–40,48 / −0,05–81,05 s; gespeicherter Loop = Teil + ganze Sicht → 1. Tipp zoomt hinein (3 Größen) |
| 2 | F: MIDI-Noten mit Auswahlform | gebaut: Kern-op selHit + teil1InSel (siehe Haken) | Note 30,5 s / 109,6 Hz (Bass, 162 Noten): Ellipse neu drin (alt draußen), 3 Noten in der Form; Lasso drin; Rechteck−Rechteck draußen, 0 Noten (alt drin); Rechteck + Umkehren draußen (alt drin); woanders + Umkehren drin; einfaches Rechteck gleich wie bisher; Szenen-Blatt mit Ellipse zählt Bass 3 von 162 (3 Größen) |
| 3 | stiller Teil: Meldungen nennen eine nicht angelegte Szene | behoben: stille Teile vor der Szenen-Wahl heraus (teil1Pack), Zähler/„Angelegt:“ nur Szenen mit Clips | Loop Takt 1–12, Intro auf allen Ebenen still: Strophe 1 in Szene 1 (4 Clips, keine Lücke), Hinweis „1 Szene · 2 Audio-Clips · 2 MIDI-Clips (70 Noten) · Intro: still – keine Szene“, Status „Angelegt: 1 Strophe 1 – …“, ↶ = alles weg (3 Größen) |
| 4 | Auftakt: Vorlauf-Takt fehlt in der Szene, Taktangaben uneinheitlich | behoben: Teil-Weg gibt die Teilgrenzen (A < 0) an spk11Parts; Kopf „nur Loop Takt 0–4“ wie Loop-Zeile/Status | OFF = 1,4 s: Intro A −1 B 4, Loop-Zeile/Status „Intro · Takt 0–4“, Blatt-Kopf „nur Loop Takt 0–4“, Plan „Intro −1–4“ (= wie „Ansicht ▾ › Szenen anlegen“), Zeile „Intro · Auftakt + Takt 1–4 → Szene 1“ (3 Größen) |
| 5 | hochkant: Teil-Name im Kopf abgeschnitten | behoben: Dateiname und „› Teil“ als zwei Elemente, nur der Name bekommt „…“ | „Sommerhit Demo Version 3 final mix.wav“, 428×926: „› Refrain 1“ 51 px breit, rechte Kante = Span-Kante (280 = 280); quer bleibt der Span ausgeblendet (geprüft, siehe unten) |
| 6 | quer: Loop-Zeile „Lo…“ | offen, sichtbar → Vorschlag für den Funk (siehe „Offen“) | – |
| 7 | Bedienweg Teil → Matrix ohne Hinweis | behoben: Status nach dem Fokus-Tipp „… · im Loop · „In die Matrix ▾“ in der Ebenen-Liste“ (Text wie spk2LpEnd) | 3 Größen |

Selbst gefunden und behoben: Die neue Kopf-Regel (display:flex) schlug quer das vorhandene display:none – der Dateiname
erschien quer wieder im Kopf. Quer jetzt ausdrücklich ausgeblendet; Nachtest quer prüft es (926×428, 926×370 grün).

Zahlen selHit (Worker, nicht im Haupt-Thread): erster Aufruf mit Ellipse 35 ms (baut die Ellipsen-Form), danach 1–19 ms für
162 Noten; im Haupt-Thread nur das Sammeln der Noten (< 1 ms). Keine neue lange Aufgabe.

Endstand (Endfassung 7d47c214, Last 7–11):

| Lauf | Ergebnis |
|---|---|
| nb/nach-test.mjs 428×926 | 11 OK / 0 |
| nb/nach-test.mjs 926×428 + 926×370 | 22 OK / 0 |
| nb/nach-test.mjs Auftakt (OFF = 1,4) 3 Größen | 6 OK / 0 |
| teil1-test.mjs (3 Größen) | 60 OK / 1 – T1-Zeitziel 6,6 ms > 5 ms unter Last 10 (bekannt, siehe Offen); Hauptfläche 446/464, 292/310, 234/252 px (−18); Lineal 0,027–0,032 ms; teil1Tap ≤ 2,1 ms; 0 Konsolenfehler |
| reg/spk11 spk11-test | 41 OK / 0 |
| reg/spk11b spk11b-test | 17 OK / 0 |
| spk2-loop-test (Prüfer-Kopie, nb/ab) | ALLE OK (18) |
| Rauchtest | errors [] |
| topdefs / dupkeys | doppelt 0, Syntaxfehler 0 / 0 doppelte Schlüssel |
| grep 'MS 2000' / '^  live: true,' / VERSION | 1 / 1 / '4.75.0' |

Fotos neu: fotos/01–08 (teil1-test, Endfassung), 10-kopf-langer-name, 11-fokus-dritter-tipp, 12-auftakt-blatt, 13-still-intro
(je Größe), rauchtest.png.
