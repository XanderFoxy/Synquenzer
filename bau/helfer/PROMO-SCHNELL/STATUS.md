# PROMO-SCHNELL – Status

- schnell-30s.mp4: 1080×1920, 30,0 s, H.264 High + AAC 48 kHz, 30 fps
- Lautheit: −14,1 LUFS integriert, True Peak −1,5 dBTP (ebur128)
- Ton: Demo-Projekt der App, 15-Takt-Arrangement aus den Demo-Clips (nur zur Laufzeit per setSong, App unverändert), offline gerendert mit vvRender (gleiche Klangerzeugung wie live), 112 BPM
- Bild: Schnitte im Takt (1 Takt = 2,14 s): Playwright-Touch-Aufnahmen (Filter/Cutoff drehen, Wellenwahl, Klaviatur, Clip-Raster, Song-Ansicht) + Song-Video der App (9:16, Auto-Regie, vvMake)
- Texte: „Ein ganzer Synthie-Song – nur auf dem iPhone“, „Gebaut mit KI“, „Regler, Clips, Song – alles im Browser“, Ende „SYNQUENZER · xanderfoxy.github.io/Synquenzer“; Ränder oben/unten ≥250 px, rechts ≥150 px frei
- Markennamen: Preset-Texte in der Aufnahme per Laufzeit-Textersatz neutralisiert (z. B. „Analog-…“, „Retro-Lead“)
- Offen: MS-Bedienfeld fehlt (openEditor öffnete die gewählte Spur statt der mk-Spur) – für Version 2
- Werkzeug: werkzeug/ (audio.mjs → song.wav + Song-Video, ui.mjs → Touch-Aufnahme, cut.sh → Schnitt/Lautheit)
