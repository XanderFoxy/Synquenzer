# CHR2 – Lesen (14.11.2026, Basis 4.57.0 = basis2.html)

Was es schon gibt und was CHR2 davon nimmt:
- Takes (VS3, ~58835): S.takes[id] = {sr, len, chunks, src, of?, …}; PCM16 im IDB-Store; `tkAddPcmTake(pcm, sr, src)` legt einen Take aus
  fertigem PCM an (Maße ins Projekt, Inhalt in den Store, Puffer sofort). Stück = {take, in, out, at, gain, fadeIn, fadeOut, alt[]}
  (alt = stumme ältere Takes, A/B im Takes-Blatt). Stellen: Szene-Clip {t, s} oder Song-Stimme {vox}; `tkRef(r)`.
- Chor-Gruppe v2 (G6+a/G6+c, ~70397/70590): a.chor = {v: 2, grp, voices[{lane, rule, n, db, pan, w, dbl, take?}]}; Chor-Spuren an der
  STIMME-Spur S.tracks[st].chor.lanes (c1…c8, `g6pLaneFor`, `g6pNormLanes`). Stimme mit eigenem Take = „selbst gesungen“: eigenes Fenster
  {take, in, out, at} (`g6pWin`), spielt über den Klangweg G6+c (Puffer `g6pBuf`, kein Pitch-Plan bei n = []). Pegel: lvl = gA × Chor an ×
  Lead-Pegel; gA = Auto-Abstand `below` (Messung, `g6pGA`). Gruppen-EQ hp/mid/air/sib, Sends rev/dly.
- G6+f (~71360): Entkoppeln/Duplizieren – Vorbild für „Stimme → eigener Take auf eigener Chor-Spur“, Gruppen-Undo `g6pfCommit`
  (takes + Stück + chorlanes), Aufräumen `g6pfAfter`.
- CHS/CHQ: Background-Zeilen in Matrix/Song zeigen jede Chor-Spur (Zellen, Mischpult) – kommt gratis, sobald voices[].lane gesetzt ist.
- MIX3 (CH1): Chor sauber / Refrain groß arbeiten auf derselben Gruppe (grp.ch1) – nicht angefasst.
- G2 (Tonhöhe), VS5 (Zeitkarte), VX1R (Gesang-Editor): gehörte Fassung `tkPlayBuf(id, a)` (gleiche Take-Zeitachse).
- IMP1: Worker aus `imp1Core.toString()` (Blob → data:), Leerlauf-Ende nach 20 s – dasselbe Muster für den CHR2-Worker.
- SPK1: eigene Seite mit Ebenen/Masken; Harmonische-Auswahl dort – CHR2 rechnet eigenständig im Worker (keine Spektral-Seite nötig).
- Takes-Blatt (`tkSheetPaint` ~59742): Zeile „Im Spektrum öffnen“ (SPK1) – dort kommt „Stimmen trennen …“ dazu (Tipp-Weiche `chr2Tap`).

Entscheidungen (selbst, logisch):
- Getrennt wird die gehörte Fassung des Stücks (Fenster in…out + 0,25 s Rand), nicht der ganze Take (Speicher am iPhone).
- Jede Stimme → neuer Take (src 'import', name „Stimme n“) als selbst gesungene Chor-Stimme auf einer neuen freien Chor-Spur (Name „Stimme n“).
- Rest → neuer Take, wird der hörbare Lead des Stücks; das Original rutscht in alt (stumm, A/B im Takes-Blatt holt es zurück).
- Gruppe neutral (kein EQ/Hall/Echo, Zischlaute ganz) und gA fest = √2 (Mono-Panner-Gesetz) statt Auto-Abstand → Rest + Stimmen = Original.
- Ein ↶ (Gruppe takes + Stück + chorlanes). Stücke mit vorhandenem Chor: nein (Hinweis), damit errechnete Stimmen nicht vom Rest abgeleitet werden.
