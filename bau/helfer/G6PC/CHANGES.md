# G6+c – Chor-Gruppe im Klangweg (Nachtrag 10 §2.4 + Nachtrag „Kopplung Lead ↔ Chor“)

Basis `bau/snapshots/R-4252.html` (4.25.2), VERSION unverändert. Diff: `patch.diff` (diff -u, örtlich).

## Neu (Block `/* G6PC-BEGIN */ … /* G6PC-END */` direkt nach `/* G6-END */`)
- **Nur für `chor.v === 2`.** v1-Chöre (4.25) laufen unverändert über `g6Start`/`g6Apply`/STIMME-Kette (Regel 28).
- **Knoten je Kopie (Quelle + 3):** `f` (Blenden × VS-P des Lead-Puffers) → `vg` (10^(db/20) × Spur-Stumm × Solo × Vorlage-Faktor der Spur) → `StereoPanner` (pan + p·w, geklemmt).
- **Knoten je gespieltem Stück (8):** Tiefschnitt (HP, Q 0,707 = 12 dB/Okt.) → Mitte (Glocke, Q 1) → Luft (Kuhschwanz 10 kHz) → `lvl` (gA × Chor an × Lead-Pegel) → `guide` (Wert 1, für G10j) → Master-Summe; `guide` → Vorverzögerung (im Tempo) → Hall-Send → `AU.hallIn`; `guide` → Echo-Send → `AU.echoIn`. **Sends nach Pegel und `guide`.**
- Kein Weg durch die STIMME-Kette (kein Drive/Chorus/Pan/Spur-Send, kein doppelter Send), kein Kompressor.
- **Einsatz erst wenn fertig:** alle Puffer + gA da, dann mit der 10-ms-Blende aus `g6Refresh` – kein −14-dB-Platzhalter.
- **Mischungs-Gesten** (Pegel, Pan, Abstand, Sends, Klang, Solo/Stumm, Lead-Regler) rampen nur `AudioParam`s (≈ 20 ms), `g6Refresh` setzt nicht neu ein, solange Puffer/Versatz gleich bleiben.
- **Auto-Pegel gA:** `10^((L_Lead − below − L_Chor)/20)`, BS.1770 (K-Beiwerte je Abtastrate, Gating 400 ms/75 %), Chor gemessen im OfflineAudioContext **mit denselben Knoten** (Pan-Gesetz, Klang). Keine Kalibrier-Konstante, keine Hall-Kopplung. Neu gemessen entprellt (150 ms), bis dahin gilt der letzte Wert. `below` ändert gA ohne neue Messung.
- **Kopplung [Gekoppelt]** (Standard AN = `grp.cpl` fehlt): Lead-Pegel = STIMME-Regler (vol², gespiegelt aus `applyTrackParams`) × Pegel des Stücks (`a.gain`, auch je Songteil). AUS (`grp.cpl = false`, `grp.ref` = Lead-Pegel in dB beim Trennen): Chor bleibt stehen. Wieder AN: `below += Lead jetzt − ref` → der hörbare Abstand bleibt, ab dann wieder gemeinsam. Je ein Undo-Schritt (`g6Edit`).
- **Chor an/aus, Spur stumm** aus `S.tracks[st].chor` (`mute`, `lanes[].mute`); Undo-Art `chorlanes` wird hier nur geschrieben (Rückweg liefert G6+a).
- **Solo** einer Chor-Spur: `G6.solo = 'c2'` (Spur-Kennung); Lead schweigt wie heute (`g6LeadMute`). Blatt zu ⇒ Solo aus (auch v1, = G6+0 Nr. 2).
- **Vorlage-Faktor je Spur und `guide` der Gruppe** (Laufzeit, nie gespeichert): `g6pGuide(lane|null, f)`.
- Tempo-Wechsel stellt die Vorverzögerung nach (`applyTempoDependents`).
- Knoten werden mit dem Stück freigegeben (`g6Drop`), Zähler `G6PC.nodes` (nach Stopp 0).

## Hooks in bestehendem Code (je eine Zeile)
`g6NormChor` (v2-Zweig), `g6Ready`, `g6Apply`, `g6Start` (→ `g6pStart`), `g6Drop` (v2-Knoten + Gruppe), `g6Refresh` (nur rampen), `g6Sheet` onClose (Solo aus),
`applyTrackParams` (Spiegel), `applyTempoDependents`, `Object.assign(SYNQUENZER, G6PC_API)`.

## Schnittstellen zu G6+a / G6+b (bitte beim Zusammenführen beachten)
- **G6+a:** liefert `g6pNorm2(c)`; solange es fehlt, nutzt G6+c `g6pcNorm2` (Rückfall). Bitte übernehmen: `grp.cpl` (nur `false` gespeichert), `grp.ref` (dB, −120…24, 0,01), **`grp.below` mit 0,01 Genauigkeit** (Bereich 0…40), sonst springt der Chor beim Wieder-Koppeln um bis zu ½ Rasterschritt. `pre` ∈ `aus|1/64|1/32|1/16`.
  Spur-Merkmale `S.tracks[st].chor = {lanes: [{id, role, name, mute?}], mute?}` normalisieren + Undo `chorlanes` (Rückweg).
- **G6+b:** wenn vorhanden, nutzt G6+c `g6pBuf(a, v, k)` → AudioBuffer|null (optional `buf.g6pT0` = Take-Zeit von Sample 0, für Fenster-Puffer) und `g6pLoud(a)` → gA|null.
  Ohne sie: Rückfall v1-Weg (ganzer Take, Plan aus `n[].iv` + `ct` der Kopie, Cache `G6.cache`), Take-Stimmen ohne eigene Verstimmung je Kopie.
- **G10j:** `guide` je Gruppe und Vorlage-Faktor je Spur stehen bereit (`g6pGuide`).

## Nicht in diesem Paket
Blatt/Mischpult-Oberfläche (G6+e), Stil-Daten (G6+d; Tests nutzen eigene Testdaten nach der Spec-Tabelle), Video-Render-Warten (G6+h), Zischlaute (`grp.sib`, wirkt im Rechengang G6+b).
