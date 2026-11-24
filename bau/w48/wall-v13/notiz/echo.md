# Notiz „echo“ – Original-Echo-Kette aus Cubasis (The Wall v13)

## Was
- v6, v7 und v8 entschlüsselt. Die Effekt-Daten der Gesangsspuren sind in allen drei bit-gleich.
- Haupt/Doppel: Delay 1/4 (Mix 0,0905, fb 0,1506) → Stereo Delay 1/2 (Mix 0,0653) → RoomWorks SE 1,569 s / 4,5 % → Chorus (Mix 0,2) → Send 1 −22,22 dB post-fader → Echo-Bus (Delay 1/4, 100 % nass, fb 0,35).
- Chöre, Gegengesang (= Chor 3) und KI: nur RoomWorks 1,502 s / 12 %.
- Gegenprobe an `original/Gesang-Platzhalter-3.wav` und `Doppel-Platzhalter-4.wav`. Beide sind nass und vermutlich die Mitte (L+R)/2.
- Nachbau `bau/echo_cubasis.py`: `kette(x, sr, spur, bpm)` → (trocken, echo, hall), Stereo, tempo-synchron. `roh_aus_cbp()` liest die Werte aus jeder .cbp.
- Projekt-Bau `bau/cubasis_v13.py` + `bau/cbp_codec.py`:
  - v8-Struktur, nur die VOX-Clips neu.
  - Zurück geht es auch: `gesang_mit_effekten(zip, spur)` macht aus dem Projekt die WAV mit Effekten.

## Zahlen
- Echos am Audio:
  - Genau bei 0,5000 s und 1,0000 s, keine anderen Abstände, keine Filter (100 Hz–16 kHz gleich).
  - Autokorrelation Haupt 0,2448 / 0,1587 / 0,0424 / 0,0092 (0,5 / 1 / 1,5 / 2 s).
- Modell (Mischgesetz nass/trocken = 1,70·Mix, Mitte zwischen Sinus- und 2·m-Gesetz):
  - Insert-Delay −16,3 dB, Stereo Delay −19,1 dB.
  - Echo 1 gesamt −12,7 dB, Echo 2 −15,2 dB.
- Echo-Zonen nach 27 Phrasenenden, Original minus Nachbau: Haupt −0,02 / +0,76 dB, Doppel +1,00 / +1,03 dB.
- Echo-Bus-Schwanz −9,23…−9,33 dB je 0,5 s in allen Bändern. Das bestätigt fb 0,35 (−9,12 dB).
- Impulsantwort-Test **33/33 OK** (`pruef/echo_ir_test.json`), IRs in `analyse/ir_*.wav`.
- Projekt-Test **OK** (`pruef/cubasis_v13_test.json`):
  - Probe aus den v12-Stimmen: 149 Clips, Länge und Lage auf das Sample genau.
  - Rundweg bit-gleich, Effekte, Fader, Pan und Sends = v8.
- v12 gegen Original:
  - Echo in den Refrains v12 −24 dB, Cubasis-Kette −10,9 dB. v12 hatte also ≈ 13 dB weniger Echo.
  - Hall etwa gleich (−11 / −11,8 dB).

## Offen / nicht sicher
- Mischgesetz der Delays: ±1 dB. Das PDF nennt −15/−18 dB, das Sinusgesetz gäbe −16,9/−19,8 dB. Zum A/B steht `gesetz=` bereit.
- Stereo Delay: Rohwerte 2/4/5 (0,65 · 0,500758 · 0,5) nicht entschlüsselt. L = R = 1/2 und Feedback ≈ 0 kommen aus dem Audio.
- RoomWorks: Algorithmus nachgebildet. Vorverzögerung (20 ms) und Höhendämpfung (55 %) sind angenommen.
- Chorus: alles außer dem Mix angenommen. Das Original ist breiter als der Nachbau (L/R-Korrelation 0,68 gegen 0,84). Ob Tune RT in der v6-Stereospur das erklärt, ist nicht sicher.
- Ob Cubasis das v13-Projekt öffnet, ist hier nicht testbar. Es ist gleich gebaut wie v8.
- Kein Ohr-Urteil: Ob das Original-Echo „anschiebt“, muss Xander hören.
- Die Probe-ZIPs in `out/test/` sind nur Test, keine Lieferung.
- Die großen Mess-Caches (`analyse/mess/*.npy`) habe ich gelöscht. Neu erzeugen lassen sie sich aus den WAVs, mit den Skripten in `analyse/mess/`.
