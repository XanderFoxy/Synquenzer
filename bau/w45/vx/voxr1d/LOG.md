# VOXR1D – Log (15.11.2026)
- 12:55 Paket angelegt: basis.html = rel-4700/index.html, index.html = voxr1c/index.html, voxr1-test.mjs kopiert. Last: load average: 1.45, 1.24, 0.99
- 12:59 Prüfer-Nachbau voxr1d-w/hk.mjs (Plopp-Teil von kern.mjs, B44/C48 gleiche Stöße, dazu B48/C44 + Vor-Echo A44/A48) gibt den Stand voxr1c exakt wieder: Abzug 8/8/7/9, Obertöne 6/7/6/7 von 10, Vor-Echo A44 2 (max +15,3 dB), A48 4 Stellen. Last load average: 0.50, 0.99, 0.97
- 13:01 plopFit (Phase aus Oberton ≥ 300 Hz, Hüllkurve = Stärke dieses Obertons × τ^0..2, Tiefton-Satz < 80 Hz, Rand-Vorhersage als Startwert): Abzug 10/10/8/10, Obertöne 9/9/9/9, Vor-Echo A44 max +0,2 dB gesamt. Ohne Oberton-Hüllkurve: Vor-Echo +22 dB (Phase im Stillen verrauscht) → verworfen.
- 13:02 In index.html eingesetzt (nur vr1Make im Block: neue Funktion plopFit + Aufruf in plop). topdefs 26/7836/0/0, dupkeys 0, MS 2000 1×, live: true 1×, VERSION 4.70.0, außerhalb Block+7 Haken = basis.html. Last load average: 0.35, 0.71, 0.87
- 13:00–13:06 Messreihe (voxr1d-w/sw.mjs): Prior-Stärke PA 0,15/0,3/0,6, Rauschmaß SG, Ränder mitmessen (EXT, schlechter, verworfen), Hüllkurve √/3× (Vor-Echo +9…+16 dB, verworfen).
  Oktav-Probe der Rand-f0 (126-Hz-Ton als 247 Hz gemessen → Grundton −18 dB): B48 Abzug 8 → 10/10. Hüllkurve nie unter dem kleineren Rand-Mittel
  (Oberton-Einbruch im Gleiten zog den Grundton mit): Obertöne B 9 → 10/10. „Nie lauter als vorher“ (gleitend ≈ 6 ms, Tiefband): Vor-Echo A44 0 Stellen.
- 13:06 Platte voll (/ 100 %, 44 KB frei, fremde Belegung). Eigene Sicherung index.vor-plopfit.html gelöscht (cmp gleich vx/voxr1c/index.html),
  basis.html durch harten Link auf rel-4700/index.html ersetzt (cmp gleich, kein Platz für 2. Kopie). Browser-Tests laufen mit TMPDIR=/dev/shm/voxr1d/tmp,
  große Ausgaben (Fotos, o-vx1) unter /dev/shm/voxr1d.
- 13:08 index.html = voxr1c/index.html + neuer vr1Make-Text (Block). topdefs 26/7836/0/0, dupkeys 0, MS 2000 1×, live: true 1×, VERSION 4.70.0, außerhalb Block + 7 Haken = basis.html.
- 13:09 Prüfer-Kern kern.mjs: 49/60 → 53/60 (Last 0,94). Kette 3 min Median 5,96 s, × 3 = 17,9 s (vorher 5,54 / 16,6 s).
- 13:11 smoke: errors [] (Last 0,63).
- 13:13 Entwickler-Test (Take A, Rauschstoß < 120 Hz) zeigte Obertöne +1,0…+1,6 dB (5/10): Fit nahm Stoß-Energie bei f0 auf → Startwert-Gewicht × ρ^RH (ρ = Lücke/Ränder). Messreihe RH 1 / 1,5 / 1,6 / 1,75 / 2 (hk + hd): RH 1,6 gewählt (Prüfer B44 10/10/10/10, Entwickler 9/10 · 10/10, Vor-Echo 0/0). Kette davor abgebrochen (Code geändert).
- 13:18 Endfassung eingesetzt, Pflicht statisch ok (topdefs 26/7836/0/0, dupkeys 0, MS 2000 1×, live 1×, VERSION 4.70.0, nur Block+Haken). Kette gestartet (kern, smoke, dev, app, vx1, vx2, vx3, chr2; TMPDIR=/dev/shm/voxr1d/tmp). Last load average: 2.10, 1.56, 1.19
- 13:24 Kette fertig (Last 2,9): kern 53/60, smoke [], dev 77/83, app 12/14, vx1 61/61, vx2 14/14, vx3 15/15, chr2 82/82.
- 13:26 App-Zeit wiederholt (Last 2,5 → 2,1): 12/14, Prüfen ohne Long Task / Lücke 88 ms, Anwenden 50–55 ms + 103 ms / Lücke 110 ms (außerhalb Block). Nachbau B48/C44: 10/9, 10/9.
