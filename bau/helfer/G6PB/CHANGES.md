# G6+b – Rechenweg v2 des Chors (Nachtrag 10 §2.3)

Basis: `bau/snapshots/R-4252.html` (4.25.2). VERSION unverändert. Alles Neue steht im Block `/* G6PB-BEGIN */ … /* G6PB-END */`
(direkt nach `/* G7-END */`, Quelle: `g6pb-block.js`, zusammengesetzt mit `build.py`). Nur `chor.v === 2` nimmt den neuen Weg;
v1 (4.25) bleibt Zeichen für Zeichen und Klang für Klang wie bisher.

## Neu
- **Plan je Stimme** (`g6pLead`, `g6pTones`, `g6pPlan`): je Lead-Note L = round(g2Target), Chor c = Stufe `d` in der Tonart der Stelle
  (+ 12·`o` + `x`; `d = 0` = der Ton selbst), Regeln `st±n`, `oct±n`, `ch±n`, `root-`, `uni`, `free`, Zusatz `/o±n`. Chornote zur Lead-Note
  über gleiches `t0`, sonst ≥ 50 % Überdeckung, sonst die Regel der Stimme. G7: c' = `outPitch(c)` wie der Lead. Eintrag
  e = e_Lead + 100·(c' − L') + ct. Der Chor folgt so Lead-Änderungen in Stufen, ohne dass sich Chor-Daten ändern.
- **Ein G2-Durchgang**: Quelle = G4-Fassung (`g2Base`), Analyse = die des Leads (`g2Src`, dieselbe Ablage im G2-Worker, kein zweites pYIN).
- **Nur das Fenster** [in − Anlauf, out + Ausklang] (G3). Fenster-Rechner `renderMulti` = G2 `render` Strecke für Strecke (Phase ab
  Streckenanfang, Koeffizienten ab dem ersten berührten Block) → **bitgleich** zur Ganzrechnung im Fenster (gemessen max |Δ| = 0).
  Bei G4-Quelle wird das Teilton-Modell nur für die Strecken im Fenster gerechnet (`modelRuns`, je Strecke identisch zu `model`).
- **Alle Kopien in einem Gang** (gemeinsames Modell, Original-Koeffizienten und Original-Oszillator); gleiche Kopien teilen einen Puffer.
- **Zischlaute im Chor** (`grp.sib` in dB, `'weg'` = −60): in stimmlosen Abschnitten, 10-ms-Blenden im stimmlosen Teil, stimmhaft unverändert;
  gilt auch für Take-Stimmen.
- **Zeitkarte** nach dem Rechnen (dieselbe Nachricht wie `wpRender`), dann aufs Fenster gekürzt.
- **Cache nach Bytes**: Chor-Puffer v1 + v2 zusammen ≤ 48 MB (LRU, `g6pTrim`; im v1-`g6Buf` nur der Aufruf ergänzt, Klang unverändert).
- **Warteschlange nach Vorrang** (0 läuft, 1 nächster Teil, 2 Rest), bis zu zwei Aufträge gleichzeitig: G2-Worker + zweiter Chor-Worker,
  der erst entsteht, wenn ein zweiter Auftrag wartet. Vorausrechnen beim Planen eines Lead-Stücks (`tkExt().place`), im Song der nächste Teil.
- **Lautheit exakt**: Offline-Mischung mit denselben Knoten wie live (Versatz, Pegel `db`, Pan `pan + p·w`, Gruppen-Klang `g6pGroupNodes`),
  BS.1770-4 im Worker mit K-Beiwerten je Abtastrate (bei 48 kHz = Norm-Tabelle, |Δ| ≈ 1e−15) und Gating; Lead im selben Fenster.
  gA = 10^((L_Lead − below − L_Chor)/20), ohne Kalibrier-Konstante, ohne Hall-Kopplung. Neu gemessen nach Mischungs-Geste (entprellt 150 ms).
- G2-Worker: neue Ops `chor` und `lu` (Weiche in `onmessage`; `g2Run` selbst unverändert).
- Test-API `SYNQUENZER.g6pb*` (Set, Tones, Plan, Win, Buf, Bufs, Wait, GA, ChorMix, Lu, K, Info, Clear, WinTest, CopyTime, Tone, MixChanged).

## Schnittstelle für G6+c (Klangweg) und andere
`g6pBuf(a, v, k, prio)` → `{buf, t0}` (t0 = gehörte Take-Zeit von Sample 0) oder null · `g6pReady(a)` · `g6pGA(a)` · `g6pCopies(v)` ·
`g6pPanOf(v, C)` · `g6pGroupNodes(ctx, grp)` · `g6pMixChanged(a)` · `g6pPrefetch(a, prio)` · `G6P.on.push(fn)` (Puffer/gA fertig) ·
`g6pTones(a, v)` (Töne je Lead-Note, für Schatten G6+g) · `g6pRule(rule)`.
