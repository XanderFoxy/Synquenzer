# UIX1 – FANG-Teil wie früher, Lautsprecher weg aus dem Song-Fenster, ✕ immer da, Tastatur verdeckt nichts

## 1. Für Xander
- **FANG im laufenden Songteil:** Das Blatt „Teil überarbeitet“ zeigt wieder alle Namen: Intro, Strophe, Pre, Refrain, Bridge, Break, Outro und **✎ frei**. Tippst du einen freien Namen an, entsteht sofort ein neuer Teil mit diesem Namen. Ein schon vergebener Name (▾) öffnet die zweite Ebene **＋ Strophe 2 | ⟳ Strophe ersetzen**. Ausprobieren: Teil antippen, einen Durchlauf spielen lassen, dann FANG.
- **Song hochkant:** Der runde Lautsprecher unten links im Song-Fenster ist weg. Mithören beim Wischen schaltest du jetzt unter **SCHLEIFE ▾ → „Mithören beim Wischen“** an oder aus. Quer bleibt der Knopf in der Song-Leiste.
- **✕:** Hochkant hat jedes Blatt und jeder Editor oben rechts ein ✕ mit mindestens 44 px Trefferfläche. Kleine Fenster mit Titel (z. B. Schleife, Name für den Teil, Zusammenfassen) haben jetzt auch eins.
- **Tastatur:** Tippst du einen Namen ein, rückt das Blatt über die iPhone-Tastatur. ✕, Feld und ✓ bleiben sichtbar.

## 2. Technik (nur Zusätze, keine Zeile der Basis geändert oder gelöscht)
- CSS-Block `UIX1-CSS-BEGIN … END` direkt nach `SX714-CSS-END`:
  - Hochkant: `#songView:not(.side) .sv-scrfab{display:none!important}`. Der runde Knopf wird noch gebaut, aber nicht mehr gezeigt.
  - Unsichtbare Trefferflächen über `::after`. Gerechnet ist ab der Innenkante, weil die Knöpfe einen 1-px-Rand haben. Betroffen sind `.sh-x`, `.fsheet .fs-x`, `.psheet .ps-x`, `.crsheet .cr-x` und `.cp-x`. Außerdem `.sheet .sh-x{z-index:1}`, `#rollSheet .rhead .sh-x::after{bottom:-6px}` und `.ue-tabs > .ue-x{position:sticky;right:0}`, damit das ✕ der Übergänge-Leiste nicht mit den Reitern wegscrollt.
  - ✕ in Popups (`.ux1-hd` ist eine 0 px hohe, sticky Kopfzeile mit dem Knopf `.ux1-px`; dazu `h4.ux1-h` mit Platz rechts). Das gilt nur hochkant, quer bleibt `display:none`.
  - `.ux1-lp`/`.ux1-scr` für die Zeile im Schleife-Blatt, `.fsheet .ux1-s1 …` für die umbrechende Namenszeile.
- JS-Block `UIX1-BEGIN … END` direkt nach `/* /S1 */`:
  - `ux1S1Row/ux1S1Paint/ux1S1Tap/ux1S1Text`: Namenszeile im S1-Blatt. Ebenen: Namen → zweite Ebene `dup` → Eingabe `edit`. Nach jedem Neuzeichnen kommt `fangPlace`, das Blatt bleibt also unten angelegt.
  - `ux1S1New(name)` wie `s1Accept('new')`, nur mit dem gewählten Namen (`partUniq`, ein Undo 'part'). `ux1S1Replace(name)`: Ist es der laufende Teil, gilt `s1Accept('replace')`. Bei einem anderen Teil bekommt dieser die Fassung; Name, Farbe, Wechsel und `st` bleiben (ein Undo 'part').
  - `ux1LoopRow(p)`: Schalter mit `sx7Toggle()` und demselben `SX7_SVG`.
  - `ux1PopX/ux1PopXAdd/ux1PopRefit`: Das ✕ kommt nur in Popups, die `display:block` haben, mit `<h4>` beginnen und noch kein ✕ oder „…schließen“ haben. Ein MutationObserver setzt es nach jedem `innerHTML`-Neuzeichnen wieder ein und passt danach mit `popDock`/`popFit` an. Tipp → `closePop()`, der Tipp läuft nicht weiter an die Tasten-Logik des Popups.
  - `ux1Kb/ux1KbOff/ux1KbSoon`: hört auf `visualViewport` resize/scroll sowie focusin/focusout. Bei offener iOS-Tastatur (mehr als 120 px verdeckt) mit aktivem Feld in `UI.pop` bekommt das Popup `max-height` gleich dem sichtbaren Teil und wird darüber verschoben. Beim Schließen der Tastatur kommt es zurück (`fangPlace`/`popDock`/`popFit`). Online-Blatt und Songtext (G9) behalten ihre eigene Lösung.
  - `UIX1_API`: `ux1S1Row()`, `ux1S1Pick(name, mode)`, `ux1Scrub(on)`, `ux1Kb()`, eingehängt mit `Object.assign(SYNQUENZER, UIX1_API)` als letzte Zuweisung vor `NO_SYNC`.
- Einhänge-Zeilen, je eine, mit UIX1-Kommentar: `openPop` (`ux1PopX(p);` nach `L.appendChild(p)`, vor der Messung), `s1OpenSheet` (`ux1S1Row(p);`), `openLoopPop` (`ux1LoopRow(p);`).
- Datenfelder: keine. Format, VERSION und CHANGES sind unverändert. Alte Projekte laden wie vorher.

## 3. Tests und Ergebnis
- `uix1-test.mjs` (gezielt): **36/36 OK**. Abgedeckt sind:
  - S1 mit echtem Durchlauf und `s1Fang`; alle 8 Namen ohne Wischen sichtbar.
  - Tipp auf Refrain → neuer Teil; ↶ nimmt ihn zurück.
  - Strophe ▾ → zweite Ebene → ⟳ ersetzt; ↶ stellt den alten Stand her.
  - ✎ frei → „Hook“.
  - Das Blatt „Teil gefangen“ ist unverändert.
  - Mithören: hochkant kein runder Knopf; der Schalter im Schleife-Blatt schaltet an und aus, die Linie ist sichtbar; das neue ✕ schließt; quer bleibt der Knopf in der Leiste.
  - Popup-✕ bei 428 und 375 sichtbar und schließend; quer kein zusätzliches ✕; S1 quer im Bild.
  - iOS-Tastatur über simulierten `visualViewport`, bei FANG ✎ und beim Zusammenfassen: Das Blatt rückt über die Tastatur, ✕ und Feld sind sichtbar, danach zurück.
  - Keine Seitenfehler.
- `xmess.mjs` + `xmess-lib.js` (Mess-Skript für das ✕, hochkant): Geöffnet werden 39 Blätter, Editoren, Platten und Popups:
  - Menü, Synth-Editor (alle 6 Klangerzeugungen), Drum, North-Platte, Noten-Editor, LAUF, Quantisieren, Clip, Sounds, Master, Mod-Übersicht, Verlauf, Teil-Name, Teil-Blatt, Akkord-Zeile, FANG, FANG ✎, S1, Marken-Blatt, KONUX, Zusammenfassen, Akkord, Aufnahme-Start, Schleife, Übergänge, Video, Mikro-Check, Online, Takes (2×), Chor, Gesangs-Effekte, Marken/Text, Noten aus Gesang.
  - Je Fall wird vor und nach Scrollen ans Ende gemessen: ✕ im Bild, oberstes Element und Trefferfläche ≥ 43,5 px in beiden Richtungen.
  - Zusätzlich wird geprüft, ob die Tastatur (`#kbArea`/`#modebar`) Bedienelemente der offenen Ebene verdeckt.
  - **Basis 4.42.0:** 24–25 NEIN je Größe. 6 Fälle haben gar kein ✕: Mod-Übersicht, Teil-Name, Zusammenfassen, Schleife, Takes ohne Song, Gesangs-Effekte. Die übrigen haben ein ✕ mit Trefferfläche unter 44 px (44×40, 40×40, 36×36), dazu das teils abgeschnittene ✕ der Übergänge-Leiste.
  - **Neu:** 428×926, 390×844 und 375×667 je **39/39 OK**, **0 Funde** unter der Tastatur. Ergebnisse in `fin-428.json`, `fin-390.json` und `fin-375.json`.
- Pflichtprüfungen:
  - `topdefs.cjs`: 0 Syntaxfehler, 0 doppelt (Namen 4951 → 4967, nur neue).
  - `smoke.mjs`: errors [].
  - Markenwörter 0, „MS 2000“ 1×, `^  live: true,` 1×.
- Fotos:
  - `uix1-1-fang-teil-428x926.png`: S1 mit Namen.
  - `uix1-2-mithoeren-428x926.png`: Schleife-Blatt, Mithören an, das neue ✕.
  - `uix1-3-tastatur-428x926.png`: FANG ✎ über der Tastatur, zeigt nur den sichtbaren Teil.
  - `uix1-4-quer-teil-926x428.png`: S1 quer.

## 4. Offen und Risiken
- **Synth-Tastatur:** Bei keinem der 39 Fälle in drei Größen verdeckt sie etwas. Hochkant ist der Platz schon reserviert, deshalb habe ich dort nichts geändert. Das Querformat (⌨ im Noten-Editor) prüft der Quer-Helfer.
- **iOS-Tastatur:** Behandelt sind Popups und Blätter in der Popup-Ebene (FANG ✎, Teil-Name, Zusammenfassen, Marken-Name, KONUX-Name …). Hohe Editoren (`.sheet`) und das Menü verlassen sich weiter auf iOS. Dort liegen die Felder oben, das ✕ bleibt daneben. Getestet ist nur mit simuliertem `visualViewport`; auf dem echten iPhone ist es noch nicht geprüft.
- **Neues ✕ in Popups:** Das ist eine sichtbare Änderung, die Xander ausdrücklich gewünscht hat. Sie gilt nur hochkant und nur für Popups mit Titel `<h4>` (65 Stück). Reine Auswahl-Listen ohne Titel, etwa das Akkord-Menü, schließen weiter mit Tipp daneben. Die Popups mit ✕ werden etwa 13 px höher.
- **Kleine iPhones (Kopfzeile 40 px):** Das ✕ der Editoren erreicht 44 px nur, weil seine Trefferfläche 2–3 px vom Zusatzrand der Taste darunter nimmt (z-index). Deren sichtbare Fläche bleibt.
- **S1:** Ein Tipp auf einen freien Namen legt den Teil sofort an, wie beim Zusammenfassen; ein Fehlgriff lässt sich per Rückgängig im Hinweis zurücknehmen. „⟳ X ersetzen“ für einen anderen als den laufenden Teil ersetzt nur die Teil-Vorlage, wie „Teil ersetzen“, nicht die Song-Stellen. Quer erscheinen die Namen auch im Seitenfeld (3 Zeilen, passt bei 926×370 und 667×375).
- **Merge:** Die drei Einhänge-Zeilen (`openPop`, `s1OpenSheet`, `openLoopPop`) und die API-Zeile vor `NO_SYNC` stehen allein auf ihrer Zeile. Ändert ein anderes Paket dieselben Funktionen, sind die Zeilen einfach zu übernehmen. Fügt der Quer-Helfer eigene ✕ in Popups ein, überspringt `ux1PopXAdd` diese Popups, weil es vorhandene ✕ erkennt.
