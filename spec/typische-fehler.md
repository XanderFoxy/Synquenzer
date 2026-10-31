# Typische Fehler aus allen bisherigen Prüfrunden (V0 … MK7) – vorab ausschließen

Gesammelt aus den Fix-Abschnitten in CHANGES-V3.md und CHANGES-MK*.md (Stand 26.10.). Jeder Builder prüft jeden Punkt selbst, bevor er fertig meldet; jeder Tester prüft jeden Punkt mit echten Läufen.

## A. Bedienung, Layout, Touch
1. Beschriftungen abgeschnitten: in 390×844, 375×667, 320×568, 844×390, 667×375 und 926×428 (iPhone 12 Pro Max, Safe-Area) messen (scrollWidth ≤ clientWidth mit der echten App-Schrift, nicht mit einer Ersatzschrift).
2. LCD-/Info-Zeilen hochkant unlesbar oder abgeschnitten.
3. Listen nur mit dem Mausrad bedienbar: jede Liste muss per Finger (Touch-Ziehen) scrollen und wählen.
4. Trefferflächen < 44 px; Regler drehen per senkrechtem Ziehen, mit Fein-Modus.
5. Layout-Sprung: Öffnen, Zoomen, Umschalten darf die Seitenhöhe nie ändern (kein Überlauf nach unten, kein Springen).
6. Überlagerungen schließen nicht auf jedem Weg: Editor schließen, Zurück zu SPIEL, Solo/Split/Kopie-Modus enden mit jedem anderen Tipp, mit Stopp und mit Szenenwechsel.

## B. Zustand und Daten
7. „geändert“-Punkt und [A/B] sofort nach JEDER Änderung aktualisieren (auch per Regler, Rad, Sequenzer-Aufnahme).
8. Eine Aktion = genau ein Undo-Schritt; Undo/Redo stellt alles wieder her.
9. Speichern → Laden ist deep-equal (alle neuen Felder in normalize/save, auch Kopieren/Einfügen und Duplizieren übernehmen sie).
10. Bewaffnete Modi (Kopie, Auswahl) enden mit jedem anderen Tipp.
11. Eigene Clips und Szenen-Clips werden überall gleich behandelt (Eine Skala, Transponieren, MIDI-Export).

## C. Klang und DSP
12. Klicks bei Parameteränderung: alle hörbaren Parameter glätten.
13. Stimmenübernahme (voice steal / Strukturwechsel) übernimmt den ganzen Zustand der Stimme (Filter-Einschwingen, Phasen, vpb …).
14. Zwei Timbres laufen phasengleich; Effekte nach der Summe beider Timbres.
15. PANIK und Doppel-Stopp beenden alles, auch Delay-Fahnen beider Timbres.
16. CPU: keine Speicher-Allokation pro Sample oder pro Block im Worklet; CPU je Stimme messen; Oktav-/Notentabellen nicht pro Note neu bauen.
17. NaN/Denormal-Schutz in Filtern und Rückkopplungen.

## D. Timing
18. Akkord auf dem Schlag mit normaler Finger-Spreizung (15–20 ms zwischen den Tasten) verliert keinen ersten Schritt; live gespielt = aufgenommen abgespielt.
19. Tempo-Sync, Key-Sync an/aus und Song-Start getrennt prüfen.

## E. Arbeitsweise (häufige Prozess-Fehler)
20. Kein Supabase-Aufruf (Wächter stehen: max_app 4021000, max_format 5).
21. Jeden Befehl im Vordergrund laufen lassen und abwarten; nie mit laufendem Hintergrund-Job fertig melden.
22. Vor „fertig“: Changelog-Abschnitt schreiben UND Snapshot kopieren.
23. Nur absolute Pfade; nie Dateien in /home/user/Deutsch-Mit-Xander schreiben (Test-Ausgaben nach dirigent-test).
24. Marken-Regel: „MS 2000“ genau einmal (MK_LABEL), auch nicht in Kommentaren; kein Korg-Name, kein Logo.
25. Nie Geschwister-Kopien oder die Hauptlinie anfassen.
26. Test-Erwartungen aus früheren Paketen, die durch das neue Paket absichtlich überholt sind, im Changelog nennen statt den Test still anzupassen.
27. **Nichts selbst bestimmen (Xander 27.10.: „Du sollst einfach nichts anderes machen oder selbst bestimmen, nur das, worüber wir geredet haben“).**
    Keine Zusatzfunktion, kein geändertes Verhalten, kein eigener Name, keine eigene Gestaltung, die nicht in Spec/Fehlerliste steht oder
    von Xander gesagt wurde. Ist etwas offen oder unklar: nicht bauen, sondern im Changelog unter „Fragen an Xander“ auflisten.
28. **Klang alter Projekte bleibt gleich (Xander 31.10.: „dass sich die alten Sachen, die man schon gebaut hat, niemals verstellen“).**
    Jede Änderung an Klangerzeugern, Hüllkurven, Filtern, Effekten oder Regler-Kennlinien bringt eine **Umrechnung** mit: Werte alter
    Projekte/Klänge werden beim Laden so auf die neuen Regler übersetzt, dass der Klang gleich bleibt (Offline-Render alt gegen neu
    ≤ −90 dB bzw. bitgleich; Golden-Render mit den Snapshots in `synq-snapshots/`). Geht eine genaue Umrechnung nicht, bleibt das
    alte Verhalten für diesen Klang erhalten („kompatibel“), und beim Öffnen wird gefragt, ob er auf das neue System übersetzt werden
    soll. Nie still den Klang ändern.
29. **Arbeitsweise (Xander 31.10.: „ich möchte, dass wir in Zukunft immer so arbeiten“):** Pakete parallel auf mehrere Helfer-Sitzungen
    (eigene Rechner) verteilen, Zwischenstände laufend in Zweige pushen, der Dirigent führt zusammen und veröffentlicht jede fertige Stufe.
