# interessen – Bericht

## Geändert (nur module/interessen/)
- modul.js: Ergebnis-Seiten ohne Zahlen/Balken/Plätze: Ehrlichkeit als zwei gleichwertige Pole („Strategisch und statusbewusst“ ↔
  „Fair und bescheiden“, beide mit Stärken und „wo es reiben kann“), Teile in Worten; Interessen als „Was dich anzieht“ (Reihenfolge
  bleibt, ohne Platz-Zahlen; Sechseck ohne Nummern; neu: zwei Achsen Dinge↔Menschen, Daten↔Ideen nach Prediger als Pole);
  Rhythmus als Richtung früh/spät/dazwischen, seine eingegebenen Zeiten als „Deine Angaben“, keine errechnete Schlafmitte/Dauer-Zahl.
  Warn-Karte „Hier lohnt ein genauerer Blick“ für eine Seite entfernt. Neue Exporte antwortListe, antwortSetzen, muster, aeste.
  Korrektur: Fragebogen öffnet mit ?frage=<id> direkt an der Frage; mit vorhandenem Ergebnis rechnet jede Änderung sofort neu und
  ersetzt das jüngste Ergebnis (Verlauf wächst nicht). „vorher“ (≤ 5 je Frage) in m.interessen.vorher; auch bei „Von vorn“ und „Zeiten ändern“.
- rechnen.js: Richtungs-Helfer (deutlichAus, ehrlichRichtung, interesseRichtung, rhythmusRichtung, riasecAchsen, riasecReihenfolge).
  Ergebnis-Format unverändert (passt/training/textspiegel lesen typen.wert, stufe, top, typ, fokus …); Rhythmus zusätzlich `eingabe`.
- daten.js: Wörter neu (WORT_INTERESSE, WORT_EHRLICH, TYP_WORT ohne „Morgentyp/Abendtyp“), POLE_EHRLICH, POLE_FACETTE, POLE_RHYTHMUS, ACHSEN; Teil-Beschreibungen neutral.
- texte.js (NEU): 9 Äste mit Lerninhalt (ehrlichkeit, riasec, R, I, A, S, E, C, rhythmus) inkl. Unter-Äste, Übungs-Routen ins Training.
- quellen.js: keine url mehr, je Quelle `erklaerung`; neu holland1997, prediger1982.
- stil.css: Pole-Kästen (.ia-pole/.ia-pol), .ia-wort; .ia-code/.ia-typ-kurz entfernt.

## Getestet (werkzeug/interessen-test.js, iPhone 428×926, Touch, SW blockiert)
- 74 Prüfungen ok, 0 fehlgeschlagen, 0 Seitenfehler/console.error. node --check auf alle 5 .js ok.
- Frisch: 12 Ehrlichkeit-Fragen per Touch, 24 Interessen, Rhythmus-Eingabe → 3 Ergebnis-Seiten: 0 Bänder, keine Prozente/Plätze/Punkte,
  Breite ≤ 428 px, keine Links nach draußen, Tippflächen ≥ 44 px.
- Vertrag: antwortListe 43 Einträge (12+24+7), muster 9 Einträge ohne Zahl, aeste 9 Äste (wasEsIst 3–6 Sätze, Listen 3–6 Punkte).
  Antworten ändern → Ehrlichkeit „leicht fair“ → „klar strategisch“, Interessen-Spitze Künstlerisch → Ordnend, Rhythmus spät → früh;
  vorher auf 5 begrenzt; ungültige Werte abgelehnt; null löscht; Verlauf-Länge bleibt gleich.
- Alte Daten: Vorlage 0.2.1 mit Einwilligung ausgefüllt (inkl. halbem „Genauer“), localStorage in die neue Fassung → alle 3 Seiten laden,
  „Genauer – weiter (6 von 24)“ läuft weiter, antwortListe 67 (48 Interessen, 18 offen), Ändern klappt und wird gespeichert.
  profil/passt/training öffnen danach ohne Fehler.
- Fotos: fotos/interessen-*.png (hell, dunkel, Achsen).

## Offen / ehrlich
- Rhythmus zeigt weiterhin die geschätzten Tagesfenster (Fokus/Tief/Einfälle) als Uhrzeiten – als „Zum Ausprobieren“ markiert,
  kein Messwert über ihn; falls Xander auch das nicht will: entfernen.
- Die Achsen-Grenzen (beides/leicht/klar) sind eine eigene grobe Festlegung (als „abgeleitet“ markiert).
- `#antworten/…` und `#muster/…` gibt es erst nach dem Zusammenbau; sw.js muss texte.js aufnehmen (siehe interessen-WUNSCH.md).
- „Fakten“ in texte.js nur aus sicherem Wissen; Barrick, Mount & Gupta (2003) wird nur als Klartext in `wissen` genannt (keine Marke).
