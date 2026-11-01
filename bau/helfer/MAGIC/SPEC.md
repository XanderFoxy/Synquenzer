# Magic Scale – Spec (Paket MAGIC, Basis 4.26.1 = bau/snapshots/R-4261.html)

Ziel: Im Noten-Editor (ROLLE) Läufe, Arpeggien und „Computer-Dialing“-Figuren mit dem Finger **malen** wie auf einer
Swipe-Tastatur: Zeit links → rechts, Höhe = Tonhöhe, Noten rasten nur auf passende Töne der Tonart und ins Takt-Raster.
Dazu Pausen nachträglich, Akkord-Umkehrungen und Takt-Verschieben mit Nachrücken.

Alles liegt in **einer eigenen Werkzeug-Zeile** (Präfix `ms…`, CSS-Klasse `prms`), damit der Merge mit dem Paket
„Melodie-Pinsel“ leicht bleibt. Vorhandene Werkzeuge, Klänge und Daten bleiben unverändert (Regel 28).

## Bedienung am iPhone (Schritt für Schritt)

1. Clip antippen → ✎ → der Noten-Editor (ROLLE) öffnet sich.
2. In der oberen Werkzeugleiste **[Magic]** antippen. Unten erscheint die Magic-Zeile, das Werkzeug **[Wischen]** ist aktiv.
   Nochmal [Magic] = Zeile zu, Werkzeug wieder ✎.
3. **Wischen**: Finger auf die Notenfläche und nach rechts wischen.
   - Jede Rasterzelle (Raster-Wahl wie vorhanden: 1/4 … 1/32, Triolen; „frei“ = 1/16), über die der Finger läuft, bekommt **eine Note**.
   - Die Höhe des Fingers wählt den Ton; er rastet nur auf erlaubte Töne (siehe Modi), immer die nächste passende Lage zur Fingerhöhe.
   - Flache Wischbewegung = kleine Schritte, steile = große Sprünge (Schräge → Abstand der Töne), Länge des Wischzugs = Länge des Laufs.
   - Schnell gewischt: übersprungene Zellen werden aus der Linie zwischen den Fingerpunkten gefüllt (keine Löcher).
   - Zurück nach links wischen nimmt die Noten dieses Zugs rechts vom Finger wieder weg (Korrektur wie beim Swipe-Tippen).
   - Jede neue Note klingt kurz und leise an (Vorhören). Loslassen = fertig, **ein Undo-Schritt pro Wischzug**.
   - Vorhandene Noten bleiben liegen (gleiche Note an gleicher Stelle wird nicht doppelt gesetzt).
4. **Modi** (in der Magic-Zeile, gelten für Wischen):
   - **[Tonart]**: alle Töne der Tonart.
   - **[Terzen]**: nur jede zweite Stufe ab dem ersten Ton des Zugs (Terzen-Kette, z. B. C E G H D F A …).
   - **[Terz+Quinte]**: nur der Dreiklang auf dem ersten Ton des Zugs (z. B. C E G in jeder Oktave).
5. **Tonart**: Knopf **[Auto: C-Dur ▾]** zeigt die erkannte Tonart der Stelle (Clip: erkannte Clip-Tonart; Song-Melodie:
   Tonart des Song-Takts). Antippen → Auswahl: **Auto** oder Grundton (12 Knöpfe) + **Dur/Moll**. Die Wahl gilt, solange der
   Editor offen ist (keine neuen Daten im Projekt).
6. **[Pause]**: Antippen einer Stelle = diese Rasterzelle wird still (die dort beginnenden Noten fallen weg, alles andere bleibt
   im Raster stehen). Ziehen = mehrere Zellen. Mit Auswahl wirkt es nur auf die gewählten Noten.
7. **[Pause +]**: Antippen = an dieser Stelle eine Pause von einer Rasterzelle **einschieben**: alles ab hier rückt eine Zelle
   nach rechts (im Raster). Nach rechts ziehen = längere Pause. Der Clip wird bei Bedarf länger (höchstens 64 Takte).
8. **[Akkorde]**: Akkorde im Clip werden erkannt (≥ 3 Noten, die gemeinsam beginnen) und oben in der Notenfläche benannt
   (z. B. „C“, „Am/C“). Bereich wählen wie gewohnt: Taktnummern im Lineal antippen (oder halten) = Takt-Bereich; oder einen Akkord
   antippen (= seine Noten gewählt); Ziehen = Rahmen-Auswahl.
   - **[Umk. ▲]**: nächste Umkehrung nach oben (tiefster Ton eine Oktave höher: Grundstellung → 1. → 2. Umkehrung → …).
   - **[Umk. ▼]**: nächste Umkehrung nach unten (höchster Ton eine Oktave tiefer).
   - **[Glatt]**: jede Umkehrung so wählen, dass die Stimmen vom vorigen Akkord aus möglichst wenig springen (Stimmführung glatt).
   - Wirkt auf: gewählte Akkorde, sonst Akkorde im markierten Takt-Bereich, sonst alle. Ein Undo-Schritt je Tipp.
9. **Takt-Leiste halten + ziehen (Ripple)** – nur bei offener Magic-Zeile: Taktleiste ≥ 0,35 s halten (Blase „Ab Takt n
   verschieben“), dann seitlich ziehen: alles ab diesem Takt (bzw. ab Anfang des markierten Bereichs, wenn man darin hält)
   rückt im Raster mit. Nach links wird überschriebenes Material entfernt. Loslassen = ein Undo-Schritt.
   Halten ohne Ziehen = Takt markieren (wie Antippen). Bei geschlossener Magic-Zeile bleibt die Taktleiste wie bisher.

Zwei Finger bleiben immer Zoom/Scrollen; ein zweiter Finger bricht einen Wischzug ohne Änderung ab.

## Daten

- Neue Noten sind normale Clip-Noten `{t, d, n, v}` (d = Rasterschritt, v = Standard-Anschlag). **Keine neuen Felder** im Projekt,
  Speichern/Laden unverändert.
- Ansichtszustand (Zeile offen, Werkzeug, Modus) überlebt das Schließen des Editors wie ROLLP; die manuelle Tonart nicht.
- Undo: genau ein Schritt je Wischzug / Pause-Geste / Umkehrungs-Tipp / Ripple-Zug (über das vorhandene rollModel).

## Abnahme

1. C-Dur und a-Moll: Wischzug über 1 Takt (1/16) → 16 Noten, alle t auf dem Raster, alle Töne in der Tonart.
2. Terzen: aufeinander folgende Töne eines steilen Zugs liegen auf Stufen gleicher Parität; Terz+Quinte: nur Dreiklangstöne.
3. Pause: Zelle wird leer, Rest unverändert; Pause +: Nachfolgendes um eine Zelle verschoben.
4. Akkord C-E-G: ▲ → E-G-C', ▲ → G-C'-E', ▼ zurück; Glatt verkleinert die Sprünge.
5. Undo/Redo stellen exakt her; Speichern → Laden deep-equal.
6. Layout 428×926 hoch und 926×428 quer: Zeile sichtbar, Knöpfe ≥ 44 px, kein Seiten-Überlauf.
7. Bildrate beim Wischen ≥ 50 fps im Test-Browser; keine Konsolenfehler; Rauchtest grün.
8. Ohne [Magic] verhält sich der Editor genau wie in 4.26.1.
