# bigfive – Bericht (24.11.2026)

## Geändert (nur module/bigfive/)
- **rechnen.js**: Richtung in Worten NUR aus den eigenen Antworten (`richtungAus`, `eigenesMuster`, `wortAus`): Mittel der umgepolten Antworten gegen „teils, teils“ → klar / leicht / beides (auch „beides“, wenn Antworten weit auseinandergehen). Eilige Antworten → höchstens „leicht“. Prozentrang entfernt. T-Werte bleiben intern (alte Leser, Vorschlag „Genauer hinschauen“). Ergebnis bekommt `eigen`, `wort` (neu, wertfrei), `facettenEigen`.
- **daten.js**: Pole in Worten je Bereich (links/rechts, titel) und `FACETTEN_POLE` (30 Facetten, neutrale Titel + 2 Pole). Fragen/Normen unverändert.
- **texte.js**: zwei gleichwertige Pole je Bereich mit Stärken, Satz-Bausteine, Forschung als Tendenz, Hinweise ohne Zahlen.
- **aeste.js (neu)**: aeste() – 5 Äste mit wasEsIst (5 Sätze), je 4–5 Punkte imAlltag/staerken/reibung/weiterdenken, ueben (Training-Übungen + Vertiefen + Antworten), verwandt, 6 Facetten als unteraeste, wissen als Text.
- **modul.js**: Ergebnis „Dein Muster“ in Worten (Pole, Satz, Woher, Facetten), keine Bänder/Prozente/Vergleichsgruppe; neue Ansicht `#fragen/bigfive/antworten` (antippen → Blatt → ändern/entfernen, „Dein Muster jetzt“ rechnet sofort neu, „vorher“ ≤ 5 je Satz); Methode-Seite neu in Worten; Exporte antwortListe, antwortSetzen, muster, aeste. Speicherformat der Vorlage bleibt, neu nur Feld `vorher`.
- **quellen.js**: keine url mehr, je Quelle `erklaerung` (2–5 Sätze).
- **stil.css**: Balken-/Tabellen-Klassen raus, Pole + Antwort-Liste rein.

## Getestet
- node --check: alle 6 .js ok. Node-Rechentest (werkzeug/bf-rechnen-test.mjs): ok.
- Playwright, iPhone 428×926 + quer 926×428, SW blockiert, erfundene Daten, Mischkopie (Vorlage-Kern + neues Modul): **58 von 58 Prüfungen ok**, 0 Seitenfehler/console.error: alte Daten der Vorlage 0.2.1 laden (auch eilige), keine Balken/Bewertungswörter/Ziffern in Mustertexten, keine Links nach draußen, Tippflächen ≥ 44 px, nichts quer über; 6 Antworten in der Oberfläche geändert → Extraversion springt sofort von „Kontakt und Schwung“ zu „Ruhe und Tiefe“, Ergebnis ersetzt (kein neuer Verlaufseintrag), „vorher“ gespeichert und sichtbar, Entfernen → „noch offen“; Fragebogen neu ausgefüllt (30 Sätze, 1 übersprungen) → Richtungen passen; antwortSetzen-Vertrag, „vorher“ auf 5 begrenzt, unbekannte ID abgelehnt.
- Arbeitskopie neu/ (mit Kern/Muster der anderen, Zwischenstand): nur Kurztest wegen Eile – 5 Bereiche, 30 Antwort-Zeilen, muster() 5 Einträge, 0 Fehler. Der lange Test dort wurde auf Anweisung abgebrochen.
- Fotos: fotos/bigfive-misch-*.png

## Offen / ehrlich
- sw.js muss aeste.js aufnehmen (siehe bigfive-WUNSCH.md).
- Richtung ist jetzt selbst-bezogen: kann von alten T-basierten Feldern abweichen (z. B. Verträglichkeit: früher „im Mittelfeld“, jetzt „klar in Richtung Rücksicht“). passt/training sollten `eigen`/`wort` nutzen.
- Grenzen klar/leicht/beides sind selbst gewählt (in der App als „Idee“ markiert).
- Der Kern-Weg (weg.js) und #antworten (Kern) wurden nicht mit meinem Modul in voller Länge getestet.
