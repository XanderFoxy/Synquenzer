# I2f – Anschlag sehen, ziehen und sofort hören (Nachtrag 8 §6.7)

Grundlage: `bau/snapshots/G-T-merge-fix.html` (4.24.0), Sicherung `.sicherung/I2F-basis-G-T-merge-fix.html` (bitgleich).
Ergebnis: `bau/helfer/I2F/index.html`. VERSION- und CLOUD-Zeilen unverändert. Oszillatoren nicht angefasst (Hauptlinie 4.24.1 bleibt unberührt).

## Neu
- **Füllhöhe (ROLLE):** Notenblock = Rahmen 1,5 px Spurfarbe, Innenfläche 18 %, von unten gefüllt bis Innenhöhe · v (mind. 2 px) in
  voller Spurfarbe. Ersetzt die Deckkraft-Kodierung. Notenname dunkel `#0a0b0d` / weiß je nach Lage der Kasten-Mitte, 1-px-Saum in der Gegenfarbe.
- **Taste links:** Die gewählte Note füllt ihre Taste in der Klaviatur mit derselben Füllhöhe (Spurfarbe).
- **Werkzeug ⇕ „Anschlag“** in `[✎][⬚][⇕][⌫]`: Tippen = wählen + hören (Auswahl bleibt, wenn Teil davon); senkrecht ziehen ab 4 px
  = relativ, 200 px = 0 → 1, Fein-Modus ×¼ ab 64 px seitlich; alle gewählten Noten dasselbe Δ, je geklemmt 0,05–1,00; nie verschieben;
  ein Undo „Anschlag“; Blase „VEL 96“ am Finger.
- **Anschlag-Leiste** (nur mit ⇕): `[◀] [VEL 96 ⇕] [▶]` (44 + 96 + 44 px). ◀ ▶: Reihenfolge Startzeit, dann Tonhöhe (Akkordtöne einzeln),
  wählen, spielen, ins Bild holen; Enden blass. Feld = senkrechter Zieh-Regler, gleiche Skala.
- **LAUF:** ◀ ▶ vorn in der Aktionszeile, sobald ein Schritt gewählt ist; Seite folgt.
- **Sofort hören** (`VelHear`): ab ≥ 2 VEL-Stufen Änderung, höchstens alle 91 ms (≤ 11/s), Länge min(Notenlänge, 350 ms), höchstens 2 Stimmen
  (älteste endet in 4 ms), Nachklang endet spätestens 350 ms nach Notenende. Gilt für ⇕, VEL-Feld, VEL-Leiste der ROLLE, VEL-Reiter in LAUF
  und SCHRITTE.
- **Haptik:** keine Aufrufe aus dem Ziehen (Nachtrag 8 A.8 H2 streicht Tick/Snap aus §6.7).

## Korrigiert
- ROLLE: Ansicht rutschte nach jeder Änderung um eine Zeile (Mitte jetzt mit Bruchteil gehalten).
- ⇕ quer (L1/L2/W) war nur 36–40 px breit → jetzt 44 px; Trefferfläche über die ganze Leistenhöhe (::after).

## Unverändert (Regel 28)
- Projekt der Grundlage in I2F geladen und geschrieben: Projekt-Text bitgleich, Datei (Format 5) gleich, MIDI-Bytes gleich.
- Gleiche Gesten (✎, ⬚, VEL-Leiste, ⌫, Undo) in Grundlage und I2F → gleiche Clips (P1, L1).
