# G10e — Warp-Editor: Zoom ins Wort, Gesten ohne Versehen, Kontrolle

Basis: `bau/snapshots/R-4300.html` (4.30.0). Spec: `spec/dirigent-spec-v3-nachtrag-9-gesang-studio.md` §2.5.
VERSION unverändert `4.30.0`. Bau: `python3 bau/helfer/G10E/bau.py` (R-4300 + `src/g10e.css` + `src/g10e.js` + 25 Haken, jeder genau 1×).
Eigener Code-Block „G10e“ hinter der Test-API des Marken-Editors, alle neuen Namen mit Präfix `g10e…`/`G10E`/CSS `.g10…`, damit der
Merge mit dem Hotfix 4.30.1 ([Ablegen]-Griff, Transport in allen Blättern) leicht bleibt: G10e fasst den Kopf des Blatts nicht an
(nur ein Wisch-Erkenner am Kopf, siehe unten).

## Bedienung (iPhone)

- **Ein Finger auf der Welle schwenkt immer.** Kein Tipp auf der Welle setzt mehr eine Marke.
- **Zwei Finger zoomen stufenlos** vom ganzen Take bis 0,25 ms/px; der Punkt unter den Fingern bleibt stehen (auch wenn die Finger dabei
  wandern). Ein zweiter Finger bricht einen laufenden Zug immer ab (nichts verschoben, kein Undo).
- **Doppeltipp zwischen zwei Strichen** zoomt genau auf diese Silbe (70 % der Breite, je 15 % Rand); der nächste Doppeltipp holt die Ansicht davor zurück.
- **Mini-Karte** (48 px) über der Welle: ganze Aufnahme, Striche als Ticks, Sichtfenster bernstein; Tippen/Wischen springt dorthin.
- **Zoom-Taste** bleibt, Stufen: Ganz → Wort (1 Schlag) → 1 → 2 → 4 Takte → Ganz; aus dem freien Zoom zur nächst gröberen Stufe;
  die Taste zeigt im freien Zoom die Breite („350 ms“, „2,0 s“).
- **Striche greift man nur in der Griff-Leiste** (oben, 44 px, K2-Regeln bleiben). Beim Ziehen: **Lupe** (±40 ms) über dem Finger,
  **sichtbares Einrasten** (bei quantisiertem Take: die Ziel-Linie leuchtet bernstein, Blase „Takt 3 · 2.3 · 1/16“, leiser
  **Einrast-Klick** 3 ms / −30 dBFS bei jeder neuen Linie; nie während einer Aufnahme). Nach dem Loslassen blitzt die Linie 150 ms.
  Ohne Raster zeigt die Blase den Abstand zur nächsten 1/16 („+12 ms“). Ersatz für die Haptik, die Safari beim Ziehen nicht kann.
- **Neue Marke** nur mit **[+]** (danach auf die Welle tippen; endet mit jedem anderen Tipp) oder **450 ms Halten** in der Griff-Leiste
  (Ring zeigt das Halten an).
- **Tipp auf einen Strich** (Leiste ±16 px, auf der Welle ±6 px): Blatt „Marke 5 · +23 ms“ mit **[▶] [✕ Löschen] [Abbrechen]**.
  [▶] spielt die gehörte Fassung von 80 ms vor dem Strich bis zum nächsten Strich; das Blatt bleibt offen (noch einmal hören).
- **Abspielmarke** (grün) im Editor und in der Mini-Karte – beim [▶], beim Prüf-Lauf und beim normalen Abspielen von Szene/Song.
  **Folgen** blättert seitenweise (nicht, solange ein Finger arbeitet, und 1,5 s danach).
- **Versatz-Zahlen** ab Zoom „1 Takt“ an jedem Strich: Abstand zur Rasterlinie in ms, grün ≤ 10, bernstein 10–40, rot > 40.
- **Einsatz-Kurve** blass unten in der Welle. Tief gezoomt (< 24 Samples/px) zeigt die Welle die echte Form, unter 2 Samples/px als Sample-Linie.
- **[⋯]** (neben [+]): Nur Wortanfänge · Bereich (Aus/10/15/25/40 ms) · Klick auf der Rasterlinie beim Hören · Einrast-Klick ·
  Ansicht folgt · Große Welle (siehe Fragen) · **Prüf-Lauf** (Strich für Strich mit Klick, Ansicht folgt; ein Tipp beendet ihn).
- **Blatt schließen:** ✕ (bleibt in allen Größen ganz treffbar), **Tipp außerhalb** des Blatts (Kopfleiste ▶/■ bleibt bedienbar;
  der Tipp wirkt nicht auf das, was darunter liegt) und **Kopf nach unten wischen** (≥ 60 px).
- **Haptik:** Raster-Chips, [A/B], Modus, [+], [⋯], Zoom als `<label>` mit Schalter (Muster G9 §7.9) – echter Tipp = echter Tick.

## Daten (additiv, Format 5, Regel 28)

- `take.marks[k].src` = `'on'` | `'pitch'` (Herkunft), nur bei **neuen** Erkennungen; der Worker gibt sie jetzt mit (`detectMarks` kannte sie schon).
- `take.warp.wo` (Nur Wortanfänge, `true`) und `take.warp.qr` (Q-Bereich, ms) — fehlen sie, rechnet `wpQuant` wie 4.30.0.
- Quantisieren fein (`g10eFine`, in `wpQuant`): Q-Bereich lässt Einsätze mit |Abstand| ≤ qr genau stehen (Ziel = Quelle, bitgleich);
  „Nur Wortanfänge“ rastet nur Wort-Striche, Silben folgen anteilig; Tonwechsel-Marken (`src: 'pitch'`) werden nie gerastet, sie folgen anteilig.
- Normalisieren (`wpNormMarks`, `wpNormWarp`), Requantisieren, „Audio folgt“ (`wpFollow`) und `wpSetQ` reichen die Felder durch.

## Gefundene und behobene Fehler (gehörten zu Xanders „versehentlich verschoben/quantisiert“)

1. **Tipp unten auf der Welle quantisierte.** Die unsichtbare Treffer-Verlängerung der Raster-Chips ragte ~6 px in die Welle, und die
   Touch-Anpassung des Browsers lenkte Tipps bis ~12 px über den Chips auf den Chip. Jetzt: Chips 44 px hoch ohne Verlängerung nach oben
   (schmal hochkant: 6 px Abstand), die Welle gilt selbst als Tipp-Ziel, kein Kompatibilitäts-Klick aus der Welle. G10-36 prüft das mit 1000 Gesten.
2. **Wort-Striche fehlten fast immer.** Der Erkenner prüfte die Ruhe vor einem Einsatz schon ab 10 ms davor – dort ist der Pegel durch
   das Einschwingen bereits „aktiv“, also war kaum ein Strich ein Wort-Strich. Jetzt ab 30 ms davor (bis 140 ms). Betrifft nur neue
   Erkennungen; eingefrorene Marken alter Takes bleiben (G10-42 bitgleich).

## Layout

- Hochkant ≥ 390 px breit: Mini-Karte 48 px, Regler Stärke/Swing nebeneinander, Raster-Chips 44 px, Fuß [Dehnen|Scheiben] [+] [⋯] [Zoom].
  Welle 108 px (vorher 114 px; die Mini-Karte kostet 6 px Welle).
- Quer (926×428): Welle 140 px, alle Ziele 44 px. Hochkant ≤ 700 px hoch: Mini-Karte 32 px; ≤ 600 px hoch: ohne Mini-Karte.
- Kein Layout-Sprung beim Zoomen, Pinch, Mini-Karte, Lupe (Lupe liegt fest über dem Blatt).

## Überholte Test-Erwartungen (Regel 26)

- K2 „Ein kurzer Tipp auf die Welle verhält sich wie heute (Tipp ins Leere setzt eine Marke)“ – ändert G10e laut Spec: Tipp ins Leere
  setzt keine Marke mehr (nur [+] oder Halten). Tests, die per Tipp Marken setzen, müssen [+] oder `wpMark(…,'add')` nutzen.
- Raster-Chips: Höhe 34 → 44 px (sichtbar), Treffer nicht mehr in die Welle.
- `n4-vs-p-reg-gs7-v3-vs5a-t3` sammelt alle `button,input` < 28 px als „small“: dazu zählen jetzt die unsichtbaren 1×1-Haptik-Schalter
  in den Labels (Muster G9 §7.9, auf dem Gerät geprüft). Die Prüfung dort wertet „small“ nicht; die Liste ist nur länger.
- Die Mini-Karte ist eine zweite `canvas` im Blatt; sie steht im DOM hinter der Welle, `#wpSheet canvas` findet weiter zuerst die Welle.

## Fragen an Xander

1. **Studio-Ansicht [V-Funk] (§2.5 Nr. 7):** gebaut, aber **aus** (Schalter „Große Welle“ im ⋯-Blatt): hochkant Raster und Regler
   eingeklappt (Welle ≈ 230 px), quer volle Breite. Soll das der Standard werden?
2. **Haptik beim Ziehen** gibt es in Safari nicht (F-2, Apple-Konto) – bis dahin Magnet-Anzeige + Einrast-Klick. Ist der Klick so recht
   (leise, abschaltbar im ⋯-Blatt)?
