# The Wall – BESTAND für v12 (23.11.2026)

W = /tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12
Klon: W/repo/the-wall (alles außer video/ und Werkstatt-Audio ausgecheckt, ca. 600 MB). v8-ZIP entpackt nach W/v8/The-Wall-v8/.
Mess-Skripte: W/bestand/*.py. Pegel je 50 ms aller WAVs: W/bestand/rms50ms.npy (dict, dBFS).
Parallel arbeitet der Werkstatt-Agent in scratchpad/wall/ (nicht anfassen). Seine dekodierten Arrays darf man lesen:
scratchpad/wall/roh/{ende,original,gereinigt,haupt-v7,haupt-v10,master-v10,master-v11,musik-v10}.npy (float32, 48 kHz, 266 s, mono).

## 1. Spuren für einen Neu-Mix

**Alle WAVs: 48 kHz, 24 bit, mono, genau 266,000 s, Start = Takt 1 = 0,0 s, untereinander ohne Versatz.**

| Datei (repo/the-wall/…) | Inhalt | aktiv (Anteil > −45 dBFS je Teil) |
|---|---|---|
| projekt7/Haupt-3-trocken-v7.wav | Hauptstimme trocken, v6-Bearbeitung (gestimmt) | S1–R3, ZT 48 % |
| projekt7/Doppel-4-trocken-v7.wav | Doppel trocken | S1–R3, Üb 45 %, ZT 18 % |
| projekt7/Chor-Oberterz-aus-Haupt-v7.wav | diatonische Terz über Haupt (Db-Dur-Leiter, PSOLA) | **ganzes Lied** (auch Strophen, ZT mit Rest bei 218 s) |
| projekt7/Chor-Unterterz-aus-Haupt-v7.wav | diatonische Terz unter Haupt | ganzes Lied wie oben |
| projekt7/Gegengesang-eigen-7.wav | **Xanders eigener Gegengesang**, trocken, ungestimmt (laut v8-Notiz Quarte/Quinte unter der Melodie) | R1/R2/R3 ~65–70 %, ZT 30 %, Tag, Outro |
| projekt7/KI-Oberterz-8.wav, KI-Unterterz-9.wav | KI-Terzen (8)/(9), bisher stumm zum Vergleich | KI-Ober nur Refrains+ZT, KI-Unter ganzes Lied |
| original/Gesang-Platzhalter-3.wav, Doppel-Platzhalter-4.wav | Rohaufnahmen ungestimmt | |
| projekt/Gesang-/Doppel-Platzhalter-3/4.wav | v6 getunt | |
| projekt/Chor1-alt36.wav, Chor2-alt38.wav | ≈ KI-Ober/KI-Unter (Korr 0,96/0,95), alte v6-Chöre | |

Kopien (Korrelation bei exakt 0 ms Versatz):
- **Gegengesang R2 = R3 = Kopie von R1** (Korr 0,95). Der ZT-Gegengesang ist eigenes Material (Korr 0,01).
- KI-Ober/Unter: R2/R3 sind Kopien von R1 (0,8), im ZT teilweise (0,5). Haupt und Doppel sind je Refrain neu gesungen.
- Terzen aus Haupt: Hüllkurve = Haupt (0,99). Doppel 0,71, Gegengesang 0,51 zur Haupt.

**v8-ZIP** (W/v8/The-Wall-v8/): 149 Clips, 16 bit / 48 kHz mono, Ausschnitte derselben Spuren (Haupt 32, Doppel 22, Chor1 15, Chor2 15, Gegengesang 16, KI-Ober 27, KI-Unter 21).
Die .cbp ist CBOR, XOR 0x7C verschleiert: entschlüsselt in W/v8/cbp_dec.bin, lesen mit `cbor2.loads(x[8:])`. Clip-Lage: Pos/1920 = Sekunden.

**Instrumental:** In Cubasis besteht es aus 22 MIDI-Spuren mit internen Synths (PAD, BASS Grundton/Offbeat-Roller, DRUM, RIFF, STAB, SEQ, FX, LICK, LEAD). Hier lässt es sich **nicht rendern, und es gibt kein Instrumental als WAV.**
- spuren/The-Wall_v5_Instrumental-Master.mp3: 320 kbit/s, 48 kHz Stereo, 266,064 s, gemastert (−10,9 LUFS). **Das ist das Musikbett von v5, v7, v10 und v11.** Gemessen: In Intro und Übergang ist es mit dem jeweiligen Master identisch (Rest −29 bis −39 dB, Faktor −0,2 bis −0,5 dB, in den Refrains ca. −0,8 bis −1,1 dB geduckt), Versatz 0 Samples.
- werkstatt2/audio/mix-00..09.mp3 ist „Musik v11 ohne Gesang“: 160 kbit/s, in 10 überlappenden Stücken (Zeiten in werkstatt2/daten/stems.json). Das ist schlechter als die v5-MP3.
- v9 „Dicht + klar“ (projekt9, 192 kbit/s) hat ein **anderes** Instrumental (Bass zweigeteilt, Synths lauter), Versatz −6,6 ms. Davon gibt es keinen Stem.
- Alte v5-Chor-MP3s (spuren/…Chor*.mp3) liegen um −66,7 ms versetzt (Korrelation schwach, nur Vergleich).
- Aus v11 vorhanden: Hauptstimme v11 trocken nur als werkstatt2/audio/ende-00..09.mp3 (128 kbit/s mono; dekodiert in wall/roh/ende.npy). **Die v11-Stems 01–07 und das v11-Projekt (70 MB) sind verloren** (früherer Container, cubasis/v11/out).

## 2. Wie v8–v11 gebaut wurden (nur was belegt ist)

**Die Bau-Skripte und Notizen für v9–v11 sind nicht mehr da.** Sie lagen in cubasis/v9…v11, oye/ und pub-2311/ eines früheren Containers. Weder arbeitsstand noch andere Zweige enthalten sie. Der Funk in Supabase rolcktiryrvjzbwuvobb endet am 16.11. Erhalten sind nur diese Beschreibungen (Ablage-Seite, Meine-Songs-JSON, aenderungen.json, Sitzungs-Zusammenfassung):

- **v8 (Cubasis):**
  - Fader (Cubasis-Wert 0–1): Haupt 0,944 · Doppel 0,422 · Chor1 Oberterz 0,335 (L60) · Chor2 Unterterz 0,299 (R60) · **Chor3 = Gegengesang 0,237 (Mitte), also der leiseste** · KI je 0,299 (L/R60, stumm).
  - Bei linearer Deutung liegen die Stimmen gegenüber Haupt so: Doppel −7,0 dB, Oberterz −9,0, Unterterz −10,0, Gegengesang −12,0 dB.
  - Effekte Haupt/Doppel: Channel Strip, StudioEQ, Tune RT (aus), Compressor „Vocal 1“, Delay, Stereo Delay, RoomWorks SE (Default), Chorus.
  - Chor1/2/3 und KI: Compressor „Vocal 1“ + RoomWorks SE (Delay/Chorus aus).
  - Send 1 = Delay. Output: StudioEQ „Wie Referenz“, Master Strip (Bottomless Tweak), Brickwall −3,1 dB.
  - Terzen: diatonisch in Db-Dur (= es-dorisch). Chor 1/2 nur in den Refrains.
- **v9** „Dicht + klar“: anderes Instrumental, „großer Chor im Refrain“ (80er), −9,7 LUFS. Zusammensetzung des Chors **nicht dokumentiert**.
- **v10:**
  - Gesang gereinigt: Klicks raus, Rauschen −5,5 dB, Atmer −8 dB, Silben-Pegel auf ±6 dB angeglichen, Zischlaute weicher.
  - Hall 35 % kürzer/kleiner, Stimme +0,5 dB. Ergebnis −10,0 LUFS, −1,2 dBTP.
  - Chor = 2 Terzen aus Haupt + Gegengesang, nur Refrains. Der Gegengesang war falsch gestimmt (38 von 89 Tönen anders).
- **v11:**
  - Nur trockene Stimmen, jeder Effekt einmal, Slap House raus.
  - **Master nur auf der Musik** (gegen das Pumpen), Chor „unter der Hauptstimme“.
  - Terzen folgen jetzt dem Akkord: 26 statt 78 reibende Töne, Rest fast nur dort, wo der Gegengesang zwischen zwei Tönen liegt.
  - Gegengesang wieder mit eigenen Tönen (4/89 anders).
  - „Open your eyes“ an der Quelle aus der Haupt entfernt. Die Sprechstelle ist nicht mehr lauter.
- **„18 Chorstimmen“: nirgends belegt.** Mögliche Quellen sind die 6 Begleitspuren: Doppel, Ober- und Unterterz aus Haupt, Gegengesang, KI-Ober, KI-Unter. Vermutung, nicht geprüft: 6 × 3 Schichten (L/M/R bzw. gedoppelt) = 18. Das muss die Analyse aus dem Audio (v9/v11 gegen die Stems) klären.
- Kompression/Hall-Parameter für v9–v11: nicht erhalten. Die Cubasis-Presets oben sind der einzige belegte Stand.

## 3. Tempo, Takt, Akkorde, Zeiten

- **120 BPM, 4/4, 1 Takt = 2,0 s, Takt n beginnt bei (n−1)·2 s.** Takt 1 = 0,0 s, 960 Ticks pro Viertel.
- Tonart es-Moll. Wegen Ab/C eigentlich es-dorisch (Töne Eb F Gb Ab Bb C Db).
- Quellen: werkstatt/daten/lied.json (Silben und Takte) und scratchpad/wall/werkzeug/lied.json (mit a/b-Zeiten und `akkorde.takte`).

| Teil | Takte | Zeit s | Auftakt |
|---|---|---|---|
| Intro | 1–16 | 0–32 | |
| Strophe 1 | 17–32 | 32–64 | 31,53 |
| **Refrain 1** | 33–48 | 64–96 | 63,15 |
| Strophe 2 | 49–64 | 96–128 | 95,53 |
| **Refrain 2** | 65–80 | 128–160 | 127,15 |
| Tag | 81–88 | 160–176 | 157,65 |
| Übergang | 89–96 | 176–192 | Bbm Gb Ab Bbsus4 |
| Zwischenteil | 97–112 | 192–224 | 191,15 |
| **Refrain 3** | 113–128 | 224–256 | 223,15 |
| Outro | 129–133 | 256–266 | Bb |

- **Akkorde im Refrain** (je 2 Takte): Ebm – Gb – Db – Ab/C – Ebm – Gb – Db – Ab/C.
  - R1: T33/34 Ebm, 35/36 Gb, 37/38 Db, 39/40 Ab/C, 41/42 Ebm, 43/44 Gb, 45/46 Db, 47/48 Ab/C. R2 und R3 gleich, ab T65 bzw. T113.
  - Tag und Zwischenteil haben dieselbe Folge. Outro: Bb.
- **Refrain-Zeilen** (gesungen, a–b in s):
  - R1: 63,47–68,01 „We claim…“ · 71,46–78,09 „Can't see…“ · 79,49–84,02 „Don't wait…“ · 87,48–91,93 „wake up open your eyes“
  - R2: 127,47–132,03 · 135,46–142,03 · 143,40–147,99 · 151,48–156,00
  - Tag: 157,99–159,97 „open your eyes“
  - R3: 223,48–228,00 · 231,46–238,02 · 239,42–244,06 · 247,40–251,97
  - Outro: 253,98–255,99 „open your eyes“

## 4. Die Stelle „Open your eyes“ → „Siehst du mich nicht“ (Zwischenteil, Takt 108–112)

- „Wach auf“ gesungen bei 215,40–215,98. Danach kommt der **gesungene Rest „open your eyes“ bei ca. 217,9–219,2 s**. Er ist eine **exakte Kopie aus Refrain 1 bei 89,90 s (−128,000 s)**, gemessen in original/Gesang-3 mit r = 0,90.
- Gesprochen **„siehst du mich nicht“: 219,24–221,27** (Takt 110 Schlag 3 bis Takt 111 Schlag 3). Danach Refrain 3 ab Auftakt 223,08/223,48.
- In der Hauptstimme liegt beides im selben Clip (v8 Haupt ZT-11, 217,50–221,66), weil sich zwei Aufnahme-Stücke überlappen.
- In der **v11-Hauptstimme (ende) ist 218,0–219,5 schon still**. Sprache ist bei 219,75–221,5 zu hören.
- **Was dort noch überlappt:**
  - Gegengesang ZT-7 bei 219,58–221,39 (v8-Clip). Das ist eigenes ZT-Material und keine Kopie (r = 0,10). Pendant im Refrain wäre Gegengesang R1 um 91,58 s (R1-3: 86,94–93,89).
  - KI-Ober/Unter ZT-4 bei 218,18–221,03: Kopie aus R2 154,18 bzw. R3 250,18 (r = 1,00), ≈ R1 90,18.
  - Chor-Ober/Unterterz-aus-Haupt-v7 enthalten den Rest und die Sprache tonhöhenverschoben (218,0–221,3). In v8 liegen dort keine Chor1/2-Clips.
- **Ersatzquelle für einen sauberen Chor an der Stelle:** dieselbe Zeile aus R1, R2 oder R3, also „wake up open your eyes“ bei 87,5–92 / 151,5–156 / 247,4–252. Die Refrain-Chöre (Gegengesang, KI) sind dort identische Kopien.
