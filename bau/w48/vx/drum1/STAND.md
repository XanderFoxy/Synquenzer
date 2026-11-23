# DRUM1 – Stand
- Kern-Test-Datei: **kern.mjs** (Browser, 428×926 Touch: Lied laden → Zerlegen schnell → Drum-Ebene → Kit-Erkennung; Lieder songs.mjs,
  lieder-pruef.mjs, hart.mjs). Offline-Gegenprobe off.mjs auf dump/*.f32 (alt-hits.js = alter Code, neu-off.js = mit DRUM1).
- Bau: apply.py <eingang> <ausgang> (md5 a7515b98…, Anker = Zeile `try{window.__spk11b=…}catch(e){}` 1×, Block block.js dahinter).
- Basis 4.86.0: SUMME kick 515/528 +93 · snare 342/344 +82 · hihat 1546/1768 +1 (Fehler fast nur im Lied „hart“).
- Offline mit DRUM1: kick 515/528 +0 · snare 342/344 +10 · hihat gleich. Browser-Lauf nachher: kern-nachher.out.
- Browser nachher (kern-nachher.out): SUMME kick 515/528 +0 · snare 342/344 +10 · hihat 1546/1768 +1 · konsole 0. Alte 6 Lieder zahlgleich.
- Pflicht am Ausgang: doppelt.js neu [] · MS 2000 1× · „  live: true,“ 1× · Sperrzahlen 0 · keine Emoji/Marken im Block.
- Offen: hart Kick 8 verpasst (schon vorher), Snare +7 Rest; Schwelle der Trennung (Abstand ≥ 5 dB und ≥ 3× Streuung) – p128 liegt mit
  echten Kick+Clap-Doppelstellen bei 4,0 dB/Streuung 1,7 (greift nicht, richtig); Lieder mit nur wenigen Doppelstellen bleiben beim alten Weg.
