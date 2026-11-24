# muster – Bericht (24.11.2026)

## Geändert (nur neuer Ordner neu/ticke/module/muster/)
- modul.js – Routen `muster` (Zusammenschau + Baum, `?bereich=<slug>`), `muster/ast/<id>`, `muster/fragen` (Richtungen + Antworten ändern per Blatt), `muster/fragen/bogen` (`?frage=<id>`). Exporte: default {id:'muster', schema:1, start, ansicht} + antwortListe, antwortSetzen, muster, aeste. Kein statischer Import von kern.js.
- fragen.js – 24 selbst formulierte Aussagen auf 8 Äste, Auswertung nur in Worten (klar/leicht/beides; Sinn: drei Wege nach Frankl). Speicher: m.muster.antworten {d01..d24: 1–5|null}, m.muster.vorher {id:[≤5]}. Ergebnis-Schlüssel 'muster' (ersetzt bei Änderung).
- aeste.js – 17 Äste (8 mit Fragen + 9 Lern-Äste: gefuehle, stress, selbstmitgefuehl, gewohnheiten, denkfallen, grenzen, kommunikation, konflikt, naehe), je wasEsIst 5–6 Sätze, Listen 3–4 Punkte, Unteräste, Üben-Links (training/uebung/<id> der Vorlage), wissen als Text.
- kombis.js – 36 Regeln (Ast-IDs + Seite) + Stichwort-Tabelle SEITEN, um die Seite fremder Einträge aus Pol-Name/Richtungs-Satz zu erkennen.
- sammeln.js – lädt jedes Modul aus kern.module per import(), ruft aeste()/muster(k) mit try/catch; erster Ast gewinnt; IDs lösen auf (exakt → klein → gleicher letzter Teil, z. B. interessen.A ↔ interessen.riasec-a); Ersatz aus Vorlage-Ergebnissen (bigfive.stufe, interessen.rhythmus.typ) nur, wenn ein Modul kein muster() hat.
- baum.js – SVG-Baum (Stamm „Du“ oben, Hauptäste einklappbar, Zweige links/rechts, Text per Canvas gemessen), stil.css, verbindungen.js (VERBINDUNGEN), quellen.js (8 Quellen ohne url, mit erklaerung).

## Getestet
- node --check: 8/8 Dateien ok. Node-Probe der Auswertung + Sätze ok.
- Playwright 428×926 (touch, SW blockiert), erfundene Daten: #muster lädt in ~1,6 s (erster Aufruf inkl. aller Module), 5 Sätze, 9 Hauptäste, 33 Zweige sichtbar / 66 nach „Du“, 0 Tippflächen < 44 px, kein Querüberlauf; Ast-Seite muster.sinn mit 8 Sprung-Karten; unbekannte ID → freundliche Seite; Antwort d05 im Blatt geändert → Speicher + „vorher“ + Ergebnis neu; Bogen ?frage=d03 startet bei Frage 3; quer 926×428 ohne Überlauf. 0 Seitenfehler/console.error.
- Fotos: fotos/muster-baum.png, muster-ast.png, muster-quer.png.

## Offen / für den Zusammenbau
- liste.js-Eintrag für 'muster' (macht kern laut Auftrag); im Test per Abfangen ergänzt.
- Wunsch (optional): muster()-Einträge anderer Module dürfen `pol` (0|1, Index in ihren pole) und `wort` (kurzes Richtungswort) mitgeben – dann erkennt kombis.js die Seite sicher statt über Stichwörter.
- KOMBIS/VERBINDUNGEN nutzen RIASEC als interessen.R…C und spiel.<bigfive-id>, textspiegel.zeit/haltung/gefuehl/wer, training.<gruppe>: IDs prüfen, wenn die Module fertig sind.
- Wegen Eile nur kurzer Lade-Test: Tastatur-Bedienung des Baums (Enter/Leertaste auf Hauptast) und Dunkelmodus nicht eigens geprüft; große Schrift (1.5) nicht geprüft.
