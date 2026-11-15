# VOXR1D – Log (15.11.2026)
- 12:55 Paket angelegt: basis.html = rel-4700/index.html, index.html = voxr1c/index.html, voxr1-test.mjs kopiert. Last: load average: 1.45, 1.24, 0.99
- 12:59 Prüfer-Nachbau voxr1d-w/hk.mjs (Plopp-Teil von kern.mjs, B44/C48 gleiche Stöße, dazu B48/C44 + Vor-Echo A44/A48) gibt den Stand voxr1c exakt wieder: Abzug 8/8/7/9, Obertöne 6/7/6/7 von 10, Vor-Echo A44 2 (max +15,3 dB), A48 4 Stellen. Last load average: 0.50, 0.99, 0.97
- 13:01 plopFit (Phase aus Oberton ≥ 300 Hz, Hüllkurve = Stärke dieses Obertons × τ^0..2, Tiefton-Satz < 80 Hz, Rand-Vorhersage als Startwert): Abzug 10/10/8/10, Obertöne 9/9/9/9, Vor-Echo A44 max +0,2 dB gesamt. Ohne Oberton-Hüllkurve: Vor-Echo +22 dB (Phase im Stillen verrauscht) → verworfen.
- 13:02 In index.html eingesetzt (nur vr1Make im Block: neue Funktion plopFit + Aufruf in plop). topdefs 26/7836/0/0, dupkeys 0, MS 2000 1×, live: true 1×, VERSION 4.70.0, außerhalb Block+7 Haken = basis.html. Last load average: 0.35, 0.71, 0.87
