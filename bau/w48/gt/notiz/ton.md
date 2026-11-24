# ton (js/ton.js, js/ton-worker.js) – Stand 24.11.2026

Exporte laut Vertrag: tonhoehe, stimmlage, melodieAusAudio, mikrofon, vokalStimme, klavier, midiName.
Zusätzlich: hzZuMidi, midiZuHz, notenName (= midiName), noten, einzelTon, melodieAusSpur, ladeAudio(file), wavLesen,
imHintergrund('tonhoehe'|'stimmlage'|'melodie', x, sr, opt) → Promise (Modul-Worker ton-worker.js, sonst Hauptfaden).

Hinweise für die App:
- tonhoehe → {t, hz, sicher, pegel, hop:0.01, sr} als normale Arrays. 4:26 min Hauptstimme: ≈1,1 s (Node) → für ganze Lieder imHintergrund nehmen.
- stimmlage(spur | [mikrofon-Meldungen], {geschlecht:'m'|'w', tonart:'es-Moll'}) → {tief, hoch, kern, typ, typen, sicherheit, text, tiefName, hochName, kernName, sekunden, anzahl}.
  text sagt immer „Schätzung“. Ohne klare Töne: tief null + Hinweis „langsame Tonleiter auf a“.
- mikrofon({onTon}) → Promise<stop>; muss aus einem Tipp heraus starten (iOS). onTon ≈30×/s: {hz, midi, midiGenau, cent, sicher, pegel, name, zeit}; stimmlos: hz 0, midi null. stop.ctx = der AudioContext.
- vokalStimme(ctx, {stimme:'m'|'w', vibrato:25, lautstaerke:0.8}).singe(vokal, midi, start, dauer, gleit): vokal a e i o u ä ö ü (ö auch Schwa) oder 'ai'/'ei'/'au'/'ou'/'eu'; gleit = Nachlaut (gleitet in den letzten ~0,3 s). Lautstärke je Vokal/Lage angeglichen.
- klavier(ctx).spiele(midi, start, dauer, staerke 0–1).
- midiName(n, tonart): ohne Tonart C Cis D Es E F Fis G As A B H; b-Tonarten (es-Moll …) Des/Es/Ges/As/B; Kreuz-Tonarten Cis/Dis/Fis/Gis/Ais.

Rauchtest (werkzeug/ton/test_node.mjs, test.html + rauch.js): Hauptstimme 5 s → Median 209 Hz (As3), Töne Ges3–H3 plausibel;
ganze Datei Kern C3–B3, hoch Des4 (= Lied-Umfang). Formanten nachgemessen: a 654/1308, i 262/2224, u 262/654, e 392/2093, o 392/785 Hz;
Ai-Gleiten F2 1321→2056. Eigene Vokal-Stimme zurückgemessen: G3/H3 richtig. Worker 73 ms. Mikrofon (Chromium-Testgerät): 45 Meldungen in 1,5 s.
Offen: Tonhöhe aus fertig gemischten Liedern (mit Instrumenten) ist unsicher – dafür Gesangsspur/a cappella nehmen.
