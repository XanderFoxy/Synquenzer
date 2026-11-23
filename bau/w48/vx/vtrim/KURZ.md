# VTRIM – kurz
Gesang-Editor (Sequencer): Fähnchen „Ende“ am Gesang-Ende – Finger ziehen kürzt/verlängert den Nachlauf (bis zur ganzen Aufnahme), rastet auf Raster, Takt und Loop-Ende ein, Rest schraffiert, ↶, gespeichert, 10 ms Blende. Nachlauf über das Loop-Ende: getönt + Knopf „Ende auf Loop-Ende“ (ein Tipp). Fähnchen „Anfang“ wenn kein Vorlauf. Vorlauf-Fähnchen wirkt jetzt auch in „▸ einmal“ (Marker `v3e`, alte Projekte unverändert).
Daten: `clip.audio.vt = {k: Take, e: Ende-s, a: Anfang-s}` (Sekunden im Take), Take bleibt ganz. Ohne `vt` alles wie 4.91.
Gilt in Matrix, Loop, Song, Mixdown/Export, Clip-WAV, ▶, Gesang→Noten. Kern-Test 29/29, Fotos foto-vorher/-nachher/-nachher-quer/-loopklammer-quer.png.
Bau: `python3 apply.py <4.91-index.html> <ausgang>` (md5 44fa0f187f10e18dfc5944fcfe1b5bdb, 17 Anker, Block VTRIM-BEGIN/-END hinter VL3-END).
