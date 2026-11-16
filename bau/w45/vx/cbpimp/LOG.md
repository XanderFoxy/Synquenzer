# LOG CBPIMP (Import-Kern Cubasis → Synquenzer)

- 21:06 UTC Start. Quelle 4.78.0 (md5 68e92c03) nur gelesen; Wissen: BRUECKE-KONZEPT §3/§6, SCHEMA, PARAMS §3a/§4, KALIBRIERUNG §0/§3/§4, cbp.py.
- Code gelesen: MAX_T/N_SCN (Z. 28488), normClip/normTrack/normSong/marksNorm, imp1Place (Vorbild Teile → Szenen + song.own),
  mapOut/T.mapEvent/osActive (Träger, Eine Skala), outPitch + JAM3 (Rückung nimmt ⇅-feste Spuren mit), targetScale 'chromatic' (HALBTON),
  AN-Grenzen des Analog-Motors, DRUM_VOICES/GM-Pads.
- cbp-import.js gebaut (CBOR-Leser, read, parts, Klang, allocate, toProject, importCbp).
- tests/gen_synth.py (synthetische .cbp mit cbp.py) + tests/test.cjs (17 Tests, Song-Nachbau gegen Original) → 17/17.
- Probelauf the-wall lokal: 1. Fassung 33 × 4-Takt-Stücke, 13 Gruppen, 50 eigene Clips → Phrasen-Regel (4+4+4+4 → 16) und
  „Rest-Stück spielt Anfang seiner Szene“; Platzhalter-Regionen als Namensquelle ausgeschlossen; Intro-Regel.
  Ergebnis: 9/9 Grenzen wie Handanalyse, 10 Teile → 6 Szenen, Song exakt (3 228/3 228; 18 Spuren 3 566/3 566).
- Doku: IMPORT-KERN.md, PROBE-THE-WALL.md (privat, ohne Noten). Nichts veröffentlicht, nichts an /home/user/Deutsch-Mit-Xander.
- 21:25–21:40 UTC BAUPLAN: ARCHITEKTUR.md, IMPORT-KERN.md, PROBE, BRUECKE §3/§6 gelesen; Code nachgesehen (imp1File/imp1Pick ohne accept,
  importProjectUI parkt das offene Projekt, text/plain-Muster sq-worklet-src, IMP1-Worker, HALBTON Z. 20226/52438, Rückung/JAM3/TRP1,
  octaveMode). Kern-Tests nachgeprüft 17/17; alle 11 Werksverweise des Kerns gibt es in 4.78. → BAUPLAN.md (P1–P5, Wellen, Fassung A/B),
  BAUPLAN-KURZ.md (14 Zeilen, 3 Entscheidungen). Nichts gebaut, nichts veröffentlicht, Quelle md5 unverändert.
