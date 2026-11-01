# Melodie-Pinsel (Paket PINSEL) – Kurz-Spec

Basis: `bau/snapshots/R-4261.html` (App 4.26.1). Alles Neue trägt das Präfix **mp** (Code: `mp…`, CSS: `.mp…`, Kommentar-Marken `/* MP */`),
damit es sich leicht mit „Magic Scale“ (anderer Helfer, gleicher Editor) zusammenführen lässt. VERSION bleibt 4.26.1.

Gilt in allen drei Noten-Editoren mit Piano-Roll: Szenen-Clip (ROLLE), eigener Song-Clip, Song-Melodie.

## 1. Bedienung am iPhone

### 1.1 Werkzeug [Pinsel] (obere Werkzeugleiste, eigene Gruppe hinter ✎ ⬚ ⌫)
- Antippen = Werkzeug Pinsel (wie ✎/⬚/⌫; ein anderes Werkzeug beendet ihn).
- **Ein Finger malt** über einen vorhandenen Notenlauf. Die Fingerhöhe ist die Ziel-Tonhöhe.
  Noten im **Einzugsbereich** um den Finger folgen mit **weichem Abfall zum Rand** („Zungen“):
  Gewicht `w = ½·(1 + cos(π·d/R))` für `d < R`, sonst 0; `d` = Abstand (Schläge) vom Finger zur Note (0, wenn der Finger über der Note ist).
  Neue Höhe = alte + w·(Finger − alte), danach **in die Tonart gerastet** (nächster Ton der Tonart).
  Je Note zählt die Stelle des Zugs, an der der Finger ihr am nächsten war; eine Stelle fast so nah (Gewicht höchstens 0,1
  darunter, Fingerzittern) ist neuer und gewinnt – eine Zacke hoch/runter an einer Stelle zieht die Nachbarn live mit; ein Zug
  quer über den Lauf zeichnet den Verlauf nach.
- Breite in der Aktionsleiste: **[schmal] [mittel] [breit]** = R 0,5 / 1 / 2 Schläge (Standard mittel).
- **Timing-Raster**: jede berührte Note (w > 0) rastet mit ihrem Anfang auf das Raster (Raster „frei“ = keine Zeitänderung).
- **Tonart**: Standard „Auto“ = die Tonart der Stelle (Szenen-Clip: Tonart des Clips wie in der Kopfzeile; Song-Melodie / eigener
  Clip: Tonart des Songs an diesem Takt, `songKeyAtBar`). Knopf **[Tonart: …]** öffnet in der Aktionsleiste die Wahl
  [Auto] [C] … [B] und die Modi [Dur] [Moll] [Dorisch] [Phrygisch] [Lydisch] [Mixolydisch] [Lokrisch], [Fertig]. Die Wahl gilt für
  den Pinsel und die Block-Werkzeuge dieses Clips (nur für die Sitzung, nie im Song gespeichert).
- Nur Noten im Einzugsbereich ändern sich (der Pinsel braucht keine Auswahl; er löscht und erzeugt keine Noten).
- Während des Zugs zeigt ein weiches Band (bernsteinfarben) die Breite, eine Linie die Fingerhöhe; die Blase nennt den Zielton.
- **Live-Vorhören leise** (Anschlag 0,35) der Note unter dem Finger, wenn sie die Höhe wechselt.
- **Ein Undo-Schritt pro Malzug** („Pinsel“). Zweiter Finger = Zoom wie immer, der angefangene Zug wird verworfen.
- Antippen ohne Ziehen = ein Pinselpunkt an dieser Stelle (ein Undo-Schritt, wenn sich etwas ändert).

### 1.2 Block-Werkzeuge (Aktionsleiste, eigene Gruppe)
Bereich = die im Lineal gewählten Takte (Taktnummer antippen, zweite antippen = erweitern); ohne Takte: die Auswahl; sonst ganzer Clip.
- **[Umkehren ↕]**: Intervalle gespiegelt um die **Achse** (Standard: erste Note des Bereichs; früheste, bei Akkord die tiefste),
  in Tonart-Stufen gerechnet, Ergebnis in der Tonart gerastet. **[Achse: 1. Note | Mitte]** schaltet die Achse
  (Mitte = Mitte zwischen tiefster und höchster Note).
- **[Krebs ↔]**: zeitlich rückwärts im Bereich: `t' = a + b − t − d` (Länge, Anschlag, Ton je Note bleiben).
- **[Tauschen ⇆]**: die beiden Hälften des Bereichs tauschen den Platz (Takte 1–2 gewählt → Takt 1 ↔ 2; 1–4 → 1–2 ↔ 3–4;
  ohne Takte: erste ↔ zweite Hälfte des Clips).
- Je Tipp ein Undo-Schritt.

### 1.3 [Mithören] (obere Werkzeugleiste, eigene Gruppe)
- Antippen öffnet in der Aktionsleiste die Leiste: Chips je Spur (S1 … DR …), **[Ohne Drums]**, **[Alle ab]**, **[Fertig]**.
- Chip antippen = diese Spur spielt beim Bearbeiten mit / nicht mit. Die bearbeitete Spur spielt immer (Chip fest an).
  [Ohne Drums] = alle Spuren außer Drums; [Alle ab] = keine andere Spur (nur der bearbeitete Clip).
  Alle Chips an = wie ohne Mithören.
- Nur fürs Abhören: es wird ein eigener Pegel hinter der Spur (vor Hall/Echo-Sends) weich (20 ms) auf 0 gezogen.
  `tr.mute`, Song, Clips und Undo bleiben unverändert. Beim Schließen des Editors klingt sofort wieder alles.
- **Gemerkt pro Clip** für die Sitzung (Szenen-Clip je Spur/Szene, eigener Clip je Id, Song-Melodie je Spur), nie im Projekt.
- Der Knopf [Mithören] leuchtet (Strich unten), solange für diesen Clip Spuren ausgenommen sind.
- Querformat: Die Werkzeugleiste sitzt im Kopf. Der Kopf-Titel behält die Breite, die er ohne die Pinsel-Gruppe hätte;
  die Leiste scrollt wie bisher.

## 2. Daten
- Song-/Projekt-JSON: **keine** neuen Felder. Pinsel/Blöcke ändern nur `notes[].n`, `notes[].t` (Raster; ein verschobener Anfang
  verliert wie beim Verschieben `o`). Mithören, Breite, Achse, manuelle Tonart: nur Laufzeit.
- Test-Haken: `rollApi().mp` (Zustand, `_brushAt(beat, note)`), `SYNQUENZER.mpListen()`.

## 3. Abnahme
1. Pinselzug verändert nur Noten im Einzugsbereich; Abfall zum Rand (Mitte voll, Rand teilweise, außerhalb nichts); alle Ergebnisse in Tonart und Raster.
2. Breite schmal/mittel/breit wirkt messbar verschieden.
3. Ein Undo pro Zug; Undo/Redo stellt exakt her.
4. Umkehren/Krebs/Tauschen exakt (Erwartungswerte von Hand gerechnet), Undo je Tipp.
5. Mithören: Song-JSON vor/nach gleich; nur die Pegel der ausgenommenen Spuren sind 0; nach Schließen alle 1.
6. Speichern → Laden deep-equal.
7. Layout 428×926 hoch und quer: Knöpfe ≥ 44 px, nichts abgeschnitten, keine Seitenhöhen-Änderung.
8. Malen ≥ 55 fps (Mittel) bei einem 4-Takt-Lauf in 1/16.
9. Keine Konsolenfehler; Rauchtest grün; Markenregeln (MS 2000 1×, `  live: true,` 1×).
