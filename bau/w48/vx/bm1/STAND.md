# BM1 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4860/index.html index.html (md5 e9f11848d2050250ff5fa59723e314b5).
- Kern-Test: **bm1-test.mjs** (node bm1-test.mjs <port>, Server im Ordner srv mit index.html = neu, base.html = 4.86.0) → OK BM1 12/12, Protokoll bm1-test.log.
- Aufbau: Block BM1-BEGIN/-END im Hauptskript direkt vor lkNoteX (BM1_WI, bm1Is, bm1LkAdd, bm1On), 12 Haken /*BM1*/:
  - Bit-Mask-Kern (Worklet-Text BM_WK, ASCII): Note-an liest fc (Halbtöne) → fq = 2^(fc/12); Stimme fq (Start 1); newVoice, takeKey
    (MONO legato/SLUR), gehaltene Taste merkt fq und MONO-Rückkehr nimmt es wieder, Geist-Stimme kopiert fq; Filter: if (v.fq !== 1) fc *= v.fq vor dem clamp.
  - Hauptfaden: lage1LkAdd → für Bit Mask Merker-Paar (BM1_WI, fc/LAGE1_FC) im lk-Feld; Bit-Mask E.on(…,lk) hängt o.fc an (nur wenn Wert da).
    LAGE-Blatt Reiter Filter: eng gilt auch für Bit Mask; Hinweistext nennt Bit Mask mit.
  - Wichtig: Block steht im Hauptskript, weil der Bit-Mask-Teil (sq-bm-src) erst bei Bedarf geladen wird (Test „vor dem Laden kein Fehler“).
- Pflicht: doppelt.js neu 0; MS 2000 1×; live 1×; Sperrzahlen 0×; Markenwörter wie Basis; smoke hochkant/quer errors [].
- Offen: ECO-Ersatzklang ohne AudioWorklet (bmEco) ignoriert Filter je Note; beim Umschalten der Engine während klingender Noten
  verlieren diese den Wert; „Heller/Weicher“ beim Lage-Teilen in eine Bit-Mask-Spur bleibt wie bisher ohne Wirkung;
  Blatt-Text nur per Code geprüft, nicht per Foto; nicht auf echtem iPhone.
