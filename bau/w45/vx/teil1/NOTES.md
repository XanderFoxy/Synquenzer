# TEIL1 – Songteile im Spektral-Lineal (Basis rel-4750, 4.75.0)

Xander (15.11.): ein per Audio importiertes Lied in Songteile zerlegen, die Teile automatisch erkennen, oben in der Taktleiste
die Namen sehen, sich auf einen Teil konzentrieren und ihn mit seinen MIDI-Noten je Ebene in die Clip-Matrix schicken.

## Bedienweg

1. Spektral › Datei laden: Beim Laden läuft die Tempo-Erkennung ohnehin; aus demselben Lauf kommen jetzt die Songteile
   (`meta.grid.teile`, im Dokument gespeichert). Kein zweiter Lauf, kein Warten.
2. Über den Taktzahlen erscheint ein 18 px hoher Streifen: je Teil ein farbiger Kasten (Farben wie die Teil-Chips im
   Szenen-Blatt), Name in 10 px, gekürzt mit „…“, unter 18 px Breite ohne Text. Der Teil an der Marke ist voll deckend und hat
   unten eine helle Linie. Hochkant steht im Kopf „Testlied › Strophe 1“, quer zeigt es der Streifen.
3. Tipp auf einen Teil im Streifen = Fokus: Loop = Teil (ein ↶ „Loop“), waagrecht auf den Teil gezoomt (3 % Rand),
   Senkrechte bleibt, Marke auf den Teilanfang. Statuszeile „Refrain 1 · Takt 13–20 · im Loop“.
   Zweiter Tipp auf denselben Teil = ganzes Lied (nur waagrecht), der Loop bleibt.
   Ziehen im Streifen rollt wie bisher, Halten setzt wie bisher einen 1-Takt-Loop. Tipp unten (Taktzahlen) = Position wie bisher.
4. Loop-Zeile in der Ebenen-Liste nennt den Teil: „Refrain 1 · Takt 13–20“ (auch als aria-label).
5. In die Matrix ▾ › erster Eintrag „Als Szene · alle Ebenen …“ (darunter klein „Teil „Refrain 1“ · Audio/MIDI je Ebene“)
   öffnet das vorhandene Szenen-Blatt (SPK11) nur für den Loop: Kopf „1 Teil · 120 BPM · 4/4 · nur Loop Takt 13–20“,
   „Refrain 1 · Takt 13–20 → Szene 1“. Anlegen = je Ebene Audio und/oder MIDI in einer Szene, ein ↶ in der Matrix.
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

MESSUNGEN

## Regression

REGRESSION

## Offen

- F (MIDI-Noten mit Auswahlform: Ellipse/Lasso/Zauberstab/Umkehren/op sub-and, Kern-op selHit) nicht gebaut – keine Zeit.
  spk11InSel kennt diese Formen weiter nicht (gemessen in TEIL0: Ellipse/Lasso/Zauberstab = falsch draußen, Rechteck−Rechteck
  und Umkehren = falsch drin). Vorschlag bleibt wie im Auftrag (selHit mit selFn + spk12SelFn, w ≥ 0,5).
- „Neue Auswahl innerhalb eines Clips → neuer Clip“ (Xanders letzter Satz) ist nicht Teil von TEIL1.
- Chrome-Test: Ein Tipp ganz oben links im Streifen (y < 10 px) unter dem Spektrum/Noten-Regler (SPK5, rechts in der
  Werkzeugleiste) wird von Chromes Touch-Anpassung dem Regler zugeschlagen. Der Test tippt bei 13 px. Auf dem iPhone gibt es
  diese Anpassung nicht; trotzdem liegt der Streifen direkt unter der Werkzeugleiste.
- Stille: Im Testlied ist das Intro auf den zerlegten Ebenen nicht still (Fläche blutet in Bass/Drums, „Noten finden“ findet im
  Intro eine Bass-Note). Darum entsteht dort eine Szene „Intro“ mit Clips – richtig nach der Regel „Name nur mit Clip“.
  Leere, benannte Szenen gibt es nicht mehr (geprüft).
- Lange Aufgaben: siehe Messungen. Das Neu-Zuschneiden der Spektrum-Fläche (Lineal 26 → 44 px, einmal je Dokument, wenn die
  Teile im Hintergrund erst erscheinen) zeichnet das ganze Spektrum neu; im Test-Chrome (Software-WebGL) dauert das > 50 ms.
