# CMD1 – Logbuch

Stand 2026-11-17. Basis: rel-4780 (`basis.html`, md5 68e92c03…), VERSION nicht erhöht.

## Lauf 1 (03:36–03:49, abgebrochen)
- Einzelschläge aus den Kalibrier-Stems geschnitten (Anschlag 100, 48 kHz, 0,5 s je Taste), Messung + Optimierer gebaut
  (Differential Evolution über die Drum-Engine der App, Offline-Render in Chromium). 11 Stimmen je 15–21 Generationen.
- Block-Entwurf + `apply.py` + Test-Skript. Test brach ab: `vvRenderAudio` braucht einen Song („Noch kein Song“).

## Lauf 2 (04:43–)
- Prüfung: geschnittene Schläge = dieselben Tasten wie in der Kalibrierung (mit deren Maß nachgerechnet: Kick Schwerpunkt 69 Hz,
  −20 dB nach 40 ms; Snare 4,1 kHz; Hats 9,2 kHz; Toms 165/197/268 Hz).
- Kostenfunktion: Hat-Vorlagen tragen unter 200 Hz nur den Nachklang des vorigen Toms (−40 dB, erst nach 20 ms). Der Optimierer
  hatte das mit einem tiefen Klick „nachgebaut“ (falsch) → Hats/Clap werden ab 200 Hz verglichen, Klick bei Metall-Stimmen gestrichen.
- Suchraum erweitert: zweiter Ton-Oszillator mit eigener Abklingzeit (`o2d`), zweistufiges Abklingen (`tSpk`) für Snare/Rim/Perc/Toms.
- Zweite/dritte Runde (gesät mit dem besten Stand, 16 Generationen, Population 5) für Snare, Toms, Clap, Hats, Kick, Rim.
- Kit trocken (Hall 0, wie die gemessenen Schläge), Tipp-Text neutral.
- Test: eigener 2-Takt-Drum-Clip + Song aus Szene 0; neuer Test T6 „Klang in der App = gemessener Nachbau“
  (ganze App-Kette gegen Engine direkt, dieselben Rausch-Puffer). Fehler im ersten Entwurf: Rausch-Puffer im Zufalls-Stub gebaut
  (= Gleichspannung) → behoben.
- Toms/Snare: Kostenfunktion zusätzlich mit den Kalibrier-Maßen (erstes Unterschreiten −20/−40 dB, Schwerpunkt). Vorher Terz-Form
  besser, aber Toms bis 4× zu hell und zu kurz; jetzt Schwerpunkt ≈ +20 %, Ausklang −40 dB passend.
- Kick: drei Stände verglichen (nur Terz/Hüllkurve: Terz 3,5 dB, −20 dB zu früh; Kalibrier-Maße ×3: Terz 6,1 dB, Mitten zu laut;
  Kalibrier-Maße ×1,5: Terz 4,2 dB, Schwerpunkt/−20/−40 dB nah) → der mittlere Stand (×1,5) ist im Kit.
- Endlauf (05:11): Messtabelle + Hörvergleich (privat) neu, Block neu, `apply.py`, Test ALLE OK 19, Pflicht grün, Fotos hoch/quer.
- Foto quer: Liste rollte nicht zur neuen Zeile (Name im Kopf wurde gefunden) → letzte Fundstelle nehmen; neu aufgenommen.

## Prüfung (17.11., 05:16–05:35, unabhängig)
- Pflicht, Paket-Test (ALLE OK 19), Startzeit, Bau aus `apply.py` (bit-gleich) selbst gelaufen; öffentlicher Code und Fotos durchsucht.
- Nachmessung: eigener Schnitt aus den Aufnahmen, eigene Maße, 20 Schläge je Pad aus der App. Terz/Schwerpunkt bestätigt.
- Korrigiert: HH ZU/SHAKER nicht in der Vorlage gespielt → Mittel über 7 Klänge (NOTES, private Messtabelle und Skripte, Kalibrier-Tabelle).
- Offen gemeldet: Pegel nach Spitze statt Lautheit (Pads 4–10 dB zu laut gegenüber dem Kick), Abklingmaß bei tiefen Tönen unruhig,
  Umbelegung für Noten der Vorlage fehlt.

