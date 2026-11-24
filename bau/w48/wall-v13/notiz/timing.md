# Notiz „timing“ (24.11.2026)

## Was
- Haupt- und Doppelstimme für v13 neu getimt:
  - `bau/stimmen/lead.wav`, `bau/stimmen/doppel.wav` (48 kHz, mono, 266,000 s, 32 bit float)
  - Bau-Skript `bau/timing_v13.py` mit den Modulen `tgemein.py`, `t_plan.py`, `t_warp.py`, `t_lauf.py`, `t_onset.py`, `t2_hilfe.py`; Anker aus `t2_anker.py`
  - Messung `analyse/timing_mess.json` + `.md`
  - Hörproben `out/probe_see_v12/v13.wav`, `out/probe_hypnotized_v12/v13.wav` (6 s, Haupt + Musik, nur lokal)
- Quellen:
  - Haupt aus der v7-WAV (24 bit, v6-gestimmt) statt aus der 128-kbit-MP3.
  - Doppel aus `doppel_t.wav` (v12, gestimmt).
- Warp ohne Phasenvocoder: nur Originalsamples. Gedehnt wird nur in Vokalen (Grundperioden wiederholen oder auslassen), in Pausen und im Atem. Konsonanten werden bitgleich verschoben.

## Zahlen
- Haupt |Spitze − Ziel(Zielkarte)|:
  - v12: Median 16, 95 % 75, max 174 ms
  - v13 nach Schnittkarte: Median 1,2, 95 % 5,4 ms; max 126 ms (das ist „ti“, bewusst 27 statt 26)
  - Detektor im fertigen Audio: Median 5 ms
- see:
  - Akzent 110,001 (v12 110,167)
  - s 0,200 s wie im Original (v12 0,418 s)
- hypnotized:
  - hyp 113,999, no 114,751, ti 115,376, sed 115,994
  - v12: 113,996 / 114,740 / 115,420 / 115,982
- there is so much more to see: alle Silben ±2 ms am Ziel, außer „so“ (Ziel 17 statt 16, s. u.).
- Dehnfaktoren Haupt 0,799–1,249 (Median 0,994). Doppel 0,807–1,221.
- Spleiße: Haupt 496, Wellenform-Korrelation Median 0,977. Doppel 151.
- Doppel: 75/143 Silben verankert, Doppel − Haupt = 5,8…13 ms (Median 10), nie früher.

## Offen / nicht sicher
- Ziele, die von der Zielkarte abweichen:
  - ti 27 statt 26: 26 wäre nur mit 0,71×/1,39× erreichbar.
  - world und so auf 17 statt 16: 16 bräuchte 1,41× bzw. würde das s stauchen.
  - Xander soll entscheiden.
- Nicht ganz erreicht:
  - eyes R1 −41 ms, eyes R3 −23 ms (Ziel 32 bräuchte > 1,25×)
  - auf (ZT) −34 ms
  - claim R2 −7 ms
- **Gegengesang/Terzen NICHT neu abgeleitet.** Ober-/Unterstimme in v12 kommen aus `ende` (alte Lead-Zeit). Sie müssen mit `stimmen_v12.py` aus der neuen `lead.wav` neu gerendert werden: 7 rubberband-Läufe, die Pitch-Pläne `plan/ober.txt` / `unter.txt` liegen auf der alten Zeitachse und müssen über die Zeitkarte umgerechnet werden. Aus Zeitgründen nicht gemacht. Der Gegengesang hängt nicht von der Haupt ab und bleibt unverändert.
- Die v10-Retusche „Who“ R2 (Ton schneller erreicht) fehlt, weil v7 die Quelle ist. Sonst ist die Tonhöhe v7 = v12 (±10 Cent stichprobenartig).
- Reinigung nur vereinfacht: Expander in Pausen, Silben-Pegel ±6 dB, Spitzen weich. Die v10-Klick-/Atem-Reinigung ist nicht einzeln nachgebaut.
- 68 Doppel-Silben ohne eindeutigen Anker folgen den Nachbarn. Ob sie genau auf der Haupt liegen, ist nicht sicher.
- Kein Ohr-Urteil.
