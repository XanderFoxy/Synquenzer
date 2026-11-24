# passt – Profil und „Was passt zu mir“ (Agent passt, 24.11.2026)

## Geändert (nur module/passt/)
- modul.js: neu geschrieben. Profil = Zusammenschau in Worten (Sätze „So bist du zusammengesetzt“, Richtungen mit zwei gleichwertigen Polen, jede Richtung führt zu #muster/ast/…), Knöpfe zu #muster, #antworten, #passt, Bild. „Was passt“: Begründung als „Passt zu deiner Richtung – …“, keine Zähler an den Abschnitten. Treffer-Probe → „Im Alltag: Wie wählst du?“ (alle 5 Fragen, ohne Zählung, ohne richtig/falsch, „beides gehört zu dir“, Link „Mehr dazu“). „Weiter springen“ auf jedem Abschnitt. Neue Exporte antwortListe, antwortSetzen, muster, aeste.
- regeln.js: Worte statt Zahlen (klar/leicht/beides, Pole), keine Bänder/Ränge/Schlafmitte/Jetlag-Stunden, Entwicklung nur „verschoben/etwa gleich“; neu: alltag(), zusammenschau(), richtungsListe(), musterAus(); wortT bleibt als Wort-Funktion (Kompatibilität).
- texte.js: Pole gleichwertig benannt, Vergleiche „mehr als andere“, „100 %“, „9 von 10“ entfernt; „Preis“ heißt jetzt „Wo es reiben kann“; neu AESTE (13 Äste mit Lerninhalt).
- karte.js: Bild nur in Worten (Pole, Richtungs-Wort), keine Bänder/Zahlen.
- quellen.js: alle url entfernt, je Quelle erklaerung (2–4 Sätze).
- stil.css: Bänder/Treffer-Farben raus, Richtungs-Darstellung pa-ri (ohne Skala).
- Keine neue Datei → sw.js-Liste unverändert gültig (nur Prüfsummen neu bauen).

## Speicher (Vorlage lädt weiter)
- m.passt.probe {bereich:'a'|'b'} unverändert; NEU m.passt.vorher {id:[{wert,anzeige,zeit}]} (max. 5).
- Ergebnis passt.wachstum unverändert (Training liest es weiter); Warum-Änderung ersetzt den letzten Eintrag.

## Äste (aeste)
passt.arbeit_struktur, passt.arbeit_team, passt.arbeit_druck, passt.arbeit_neues, passt.arbeit_miteinander, passt.umgebung (Rhythmus), passt.geeignet (Interessen, Unteräste RIASEC), passt.lernen (Üben), passt.staerken, passt.selbst (Denkweise), passt.andere_streit, passt.andere_naehe (Beziehungen), passt.wachstum (Üben, 10 Richtungen als Unteräste).
muster() liefert zusätzlich wort + pol (wie das Modul muster es nutzt).

## Getestet
- node --check: 5/5 Dateien ok.
- Node-Test (werkzeug/passt/regeln-test.mjs): 371 Texte ohne Zahl/Bewertungswort, 13 Äste mit 3–6 Sätzen bzw. 3–6 Punkten je Liste, 0 Fehler; Alltag-Wahl ändern → Muster ändert sich; nur Alltag ohne Fragebogen → 1 Muster; leer → [].
- Browser (werkzeug/passt/app-test.cjs, 428×926 + 926×428 + dunkel, SW blockiert, erfundene Daten im Vorlage-Format 0.2.1): 0 Seitenfehler aus passt; 0 Überlauf; keine Zahlen außer Datum/Uhrzeit/Minuten; 5 Alltags-Fragen; Umwählen ändert Text + muster(); vorher gespeichert; antwortSetzen 6 Fälle (4 true, 2 ungültig false); Richtung wählen über Ansicht ok; #muster/ast/passt.arbeit_struktur zeigt die passt-Richtung. Letzter kurzer Ladetest: 4 Routen, 0 Fehler.
- Fotos: fotos/passt-*.png

## Offen
- #muster lud im Test module/muster/stil.css mit 404 (Bereich muster, noch in Arbeit).
- Nicht im Browser geprüft nach der letzten Mini-Änderung: Link „Mehr dazu: …“ im Alltag (nur node --check + Ladetest).
- Fokus-Fenster als Uhrzeit-Vorschlag bleibt in „Arbeitsweise“ (Uhrzeit, kein Messwert) – falls Xander auch das nicht will: regeln.js ar-zeit/ar-einfall.
