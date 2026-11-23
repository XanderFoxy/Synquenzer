fertig: Code-Erkundung (Clip-Audio in/out/at, Vorlauf g3/VL2/VL3, Nachlauf = take.post, Wiedergabe-Kern tkPlace, Mixdown = vvRenderAudio über tkPlace, Clip-WAV = Vorlage sq-vl2x-src)
als Nächstes: vtrim-block.js + apply.py schreiben, dann Kern-Test
Plan: a.vt={k:take,e:Ende-s,a:Anfang-s} am Clip-Audio; Weiche in tkPlace (vtrStart) nur wenn a.vt; g3PostOf kappt; vtrData für Clip-WAV/Faltplan; Ende-Fähnchen-Overlay im vl3Tick
