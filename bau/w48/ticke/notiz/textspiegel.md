# textspiegel – Bericht (24.11.2026)

## Geändert (nur module/textspiegel/)
- **modul.js** (neu geschrieben): Spiegel ohne Zahlen/Balken – 8 Richtungen als zwei gleichwertige Pole in Worten („deutlich“/„eher“/„beides“), Belegwörter, Link auf `#muster/ast/<id>`. **Neu `text/tiefer` „Tiefer lesen“** (in der App): je Merkmal die Stellen aus den eigenen Texten (Wörter markiert), Bedeutung, beide Pole mit Stärken, „was die Zählung nicht sieht“, Frage zum Weiterdenken; wiederkehrende Wörter; Texte nebeneinander. `text/claude` → leitet auf `text/tiefer` um (ersetzen). Claude-Ansicht, Kopier-Text, Zitat-Prüfung entfernt. Blindtest ohne richtig/falsch und ohne Statistik. Schreiben: „Frühere Fassungen“ (max. 5, Zurückholen) + „Diesen Text löschen“. Vergleich mit Big Five ohne Werte/„als die meisten“ (nur stufe → Worte). Exporte: `antwortListe`, `antwortSetzen`, `muster`, `aeste`.
- **aeste.js** (neu): 8 Äste `textspiegel.zeit|haltung|gefuehl|wer|satzlaenge|absolut|begruenden|vielfalt` mit Polen, wasEsIst, imAlltag, staerken, reibung, weiterdenken, ueben, verwandt, unteraeste (+ „Was die Zählung nicht sieht“), wissen (Text, ohne Link).
- **texte.js**: SKALA/Trefferquote, Waage-Sätze mit Zahlen, Claude-Text entfernt; neu `richtungen()`, `stilNotizen()`, Wort-Vergleich.
- **analyse.js**: maskiere/zitate/pruefeZitate/treffer entfernt; neu `fundstellen`, `stuecke`, `extremSaetze`, `wiederkehrend`.
- **woerter.js**: Gruppe `abgestuft` (Gegenpol zu absolut), `STOPP`-Liste.
- **quellen.js**: alle `url` entfernt, je Quelle `erklaerung` (2–5 Sätze); peters2024/2024b raus; 10 neue (Pennebaker, Lieberman, Frattaroli, Zimbardo, Gollwitzer, Schwartz, Bruner, McAdams, Lakoff, Gordon).
- **stil.css**: Waage/Skala/Tabelle/Claude-Stile raus; Richtung, Stellen, Fassungen neu.
- Speicherformat: unverändert + Felder `vorher` (Modul) und `richtungen` (Ergebnis). Alte 0.2.1-Daten laden.

## Getestet
- node --check: 6/6 Dateien.
- Playwright (Chromium, 428×926 Touch, SW blockiert, erfundene Texte): erst echte Altdaten mit der Vorlage 0.2.1 erzeugt, dann in der neuen Fassung geladen. **43/43 Prüfungen**, 0 Seitenfehler/console.error, Übersicht lädt in ~110 ms. Geprüft u. a.: keine %/„von 100“/Punkte/Claude-Wörter, kein externer Link, scrollWidth ≤ 428 (quer ≤ 926), 8 Richtungen, Umleitung claude→tiefer, 8 Merkmale/24 Stellen in Tiefer lesen, aeste() 8 Äste mit Inhalt in den Grenzen, antwortListe() 7 Einträge, antwortSetzen → muster() ändert sich sofort + „vorher“, Fassung zurückholen, Text löschen, Krise → keine Auswertung, zu kurz → muster() [] und Ergebnis weg. Fotos: fotos/ts-*.png (hell, dunkel, quer).
- Test-Skript: werkzeug/textspiegel/test.mjs (Altdaten: werkzeug/textspiegel/alt-daten.json).

## Offen
- Evidenz-Marken (ui.marke, Kern) nur 30 px hoch → WUNSCH Nr. 5.
- sw.js muss aeste.js cachen → WUNSCH Nr. 1; liste.js-Kommentar und seiten.js-Hinweis zu Claude → WUNSCH Nr. 2–3.
- Grenzen für „knapp/ausführlich“, „wiederkehrend/wechselnd“, „erzählen/erklären“, „sachlich/gefühlsnah“ sind eigene, grobe Grenzen (in der App so benannt), an 3 erfundenen Proben kalibriert.
- verwandt-IDs zu muster.* sind teils geraten (muster.emotionen, .selbstmitgefuehl, .kommunikation) – der Zusammenbau gleicht ab.
- Sehr lange Sätze ohne Punkt: Satzlänge bleibt „noch wenig“ (bewusst vorsichtig).
