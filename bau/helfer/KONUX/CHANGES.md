# KON-UX – ein geführtes Blatt für Songteile (Basis R-4300 = 4.30.0, VERSION bleibt '4.30.0')

Xander (01.11.): „Die Menüs, wenn man Songteile konsolidieren will: so ein trockenes Layout, wo man gar nichts begreift …“

## Was neu ist

**Ein Blatt statt drei Text-Listen + Zweit-Blatt.** Bereich (Bereich-Leiste ⋯), Marke (Marken-Blatt) und Block (Tipp auf die
Block-Zeile) führen alle in dasselbe angedockte Blatt:

- **Kopf:** „Was willst du mit **Takt a–e** machen?“ + ✕ (44 × 44).
- **Mini-Zeitleiste** (SVG): je Spur eine Zeile in der Spurfarbe, Start kräftig, weiter blasser – wie im Song-Fenster. Rechts die
  Quelle (Marken-Name / ▢ Block-Name / „Auswahl“) und die Taktzahl.
- **Bild-Karten** (≥ 64 px, gezeichnetes SVG + Titel + eine Zeile):
  - *Zu einem Teil machen* – „Klingt gleich · Ursprung bleibt“ (= `konDo`, Konsolidieren mit Ursprung ist der Standard).
  - *Als Block gruppieren* – „Zusammen schieben · Inhalt bleibt“ (= `konBlkMake`; jetzt auch aus dem Marken-Blatt).
  - *Zurückholen* – nur wenn es einen Ursprung gibt (= `konRestore`; Block/Bereich: alle darin, zu einem Undo zusammengefasst).
  - Gesperrt mit Grund: „Geht bis 16 Takte – hier n“, „Teil-Leiste voll“, „Hier liegt schon ein Block“.
- **Block-Werkzeuge** als ruhige Zweit-Reihe mit Symbolen: Umbenennen (Name im selben Blatt, jetziger Name steht im Feld,
  Hauptknopf erst bei neuem Namen aktiv), Hineingehen, Auflösen.
- **Name im selben Blatt:** Namens-Chips (waagrecht scrollbar) + eigenes Feld; Vorschlag wie bisher (Block → sein Name,
  eine Marke genau darüber → ihr Name mit Nummer, sonst der nächste freie Name).
- **Ein Satz** sagt, was passiert („Alles in Takt 7–10 wird Teil „Hook 2“ in der Teile-Leiste.“).
- **Ein Hauptknopf** unten (Farbe nach Aktion: Teil bernstein, Block grau-blau, Zurückholen grün) – „Teil „Hook 2“ anlegen“.

**Vorschau im Song darüber:** Ein Tipp auf eine Karte zeichnet sofort einen gestrichelten Geister-Rahmen über den Bereich, leicht
getönt, mit Schild („TEIL HOOK 2“, „▢ BLOCK A“, „URSPRUNG ZURÜCK“) in der Farbe dessen, was entsteht. Name ändern → Schild folgt.
✕ oder ein Tipp in den Song daneben → Blatt und Vorschau weg, nichts darunter bearbeitet. Der Song bleibt sichtbar und bedienbar
wie beim Marken-Blatt (`popDock`, `#popLayer.pass`).

**Rückmeldung (≤ 240 ms, nur transform/opacity):** Teil → der Bereich fliegt als Kachel in die Teile-Leiste (Querformat: auf die
Teil-Taste; Hochformat, wo die Leiste im Song-Fenster nicht zu sehen ist: in die neue Marke im Lineal). Block / Zurückholen /
Hineingehen → der Rahmen rastet ein. Dazu Haptik „snap“ und Hinweis mit [Rückgängig].

**Querformat:** links Mini-Zeitleiste + Karten in einer Reihe + Block-Werkzeuge, rechts Namen + Satz + Hauptknopf (Blatt 157–187 px hoch).

## Gleiche Daten, gleiche Wirkung

Die Daten-Funktionen sind unverändert: `konDo`, `konBlkMake`, `konRestore`, `konBlkAction`, `konBlkEnter`, `s2Sum`, `normSong` …
Je Aktion genau 1 Undo-Schritt (Test). Format bleibt 5; ein altes Projekt mit Blöcken und konsolidierten Teilen wird Zeichen für
Zeichen gleich geschrieben (Test).

## Bewusst überholt (notiert)

- **„Zusammenfassen“ als eigener Knopf** (Marken-Blatt `s2SumButton`, Bereich ⋯ `s2RangeItem`) ist weg. Das Ergebnis heißt jetzt
  „Zu einem Teil machen“ = `konDo` (Zusammenfassen **+** Ursprung zurückholbar). Für den Nutzer war es dieselbe Aktion zweimal.
  Unterschied in den Daten: es entsteht zusätzlich der `song.kons`-Eintrag (Ursprung) – das, was bisher „Als neuen Teil
  konsolidieren“ tat. `s2Sum` und die Test-API `sumRange`/`sumMark` bleiben unverändert.
- **„▣ Als Block“, „Als neuen Teil konsolidieren“** (Bereich ⋯) und die Text-Zeile im Marken-Blatt → ein Bild-Knopf
  „Zu Teil / Block …“ (+ „Zurückholen …“ bei konsolidierten Teilen), der das geführte Blatt öffnet.
- **Block-Blatt** (`konBlkSheet`) und **Block-Namens-Blatt** im Ablauf → das geführte Blatt (`konBlkNameSheet` bleibt als Funktion).
- **Zweites Namens-Blatt** (`s2OpenSum`) → Verweis: öffnet das geführte Blatt mit „Zu einem Teil machen“ vorgewählt.

## Test-API

Alle alten Namen bleiben (`konsolidieren`, `konsolidierenMark`, `zurueckholen`, `blockMake`, `blockAction`, `blockSheet` – öffnet
jetzt das geführte Blatt, Rückgabe weiter `true` –, `openSum` – Verweis aufs geführte Blatt –, `sumRange`, `sumMark` …).
Neu: `konuxOpen(kind, x, y, o)`, `konuxInfo()`, `konuxPick(k)`, `konuxName(n)`, `konuxGo()`, `konuxClose()`.

## Code

- Eigene Funktionen `konux…` im Block `/* KONUX ---------- … /* /KONUX */` (nach `/* /KON */`), CSS in
  `/* KONUX-CSS-BEGIN */ … /* KONUX-CSS-END */`. Geänderte Stellen tragen `// KONUX`:
  `openRangeMore` (Eintrag + Handler), `svTap` (Tipp daneben schließt das Bereich-Blatt), `setSongView` (schließt `block`/`konux`),
  `svDraw` (Vorschau), `s012MarkSheetPaint` (ohne Zusammenfassen), `konMarkSheetPaint`/`konMarkTap`, `konBlkSheet`, `s2OpenSum`,
  Hinweise an `s2SumButton`/`s2RangeItem`/`konRangeItems` (überholt, bleiben als Verweis).
- `var KX` (nicht `const`): `svDraw` fragt `KX.pv` ab, bevor der KONUX-Block gelaufen ist.
- Keine Datenbank- oder Netz-Zugriffe; `  live: true,` 1×, „MS 2000“ 1×, verbotene Wörter 0.
