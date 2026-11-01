# Status NORTH (Zweig north-4261) – North auf App 4.26.1

- Ergebnis: `index.html` = `bau/snapshots/R-4261.html` + North (ND1–ND4), VERSION `4.26.1` unverändert. `patch.diff` = `diff -u` gegen R-4261.
- Neu bauen der Engine-Blöcke: `node src/build.mjs` (ersetzt Worklet- und Host-Block in `index.html`, prüft ASCII/Marke).
- Regeln geprüft: `grep -i` korg/microkorg/radias/dwgs/kodamo/mask1/kompakt/nord = 0 · „MS 2000“ 1× · `  live: true,` 1× ·
  keine neuen Netzzugriffe (fetch/URLs gleich wie R-4261) · Tasten ≥ 44 px (tap44: 84 Ansichten, 7 Formate).

## Tests (alle auf dem Endstand, Chromium headless, 4 Kerne)

| Test | Ergebnis |
|---|---|
| `smoke.mjs` | ✓ keine Fehler |
| `md1-node.mjs` 48 kHz / 44,1 kHz / `--long` (10 min) | ✓ 195/195 · 195/195 · 195/195 |
| `md1-retest.mjs` (Node / `--chromium`) | ✓ 40/40 · ✓ |
| `md3-kits.mjs` | ✓ 53/53 |
| `md1-gc.mjs` | ✓ 60 s ohne GC, Heap +0,66 MB |
| `md4-golden.mjs` (Regel 28 gegen R-4261) | Daten aller Kits gleich, Render −120…−155 dB (= Grundrauschen alt/alt), ohne North-Pad kein Modul ✓ · **✗ Größe +173 KB** (Budget 100 KB, Q9) |
| `md4-store.mjs` (ND4-02/06/07) | ✓ alle, `historyCheck()` von 4.26.1: ok (144 Ereignisse) |
| `md4-int.mjs` (ND4-03/04/05) | ✓ alle |
| `md2-ui.mjs` (gegen R-4261) | ✓ 371/0 |
| `md2-fix.mjs` | ✓ |
| `md2-shots.mjs` | ✓ 48 Ansichten, 6 Formate, kein Überlauf |
| `ndstage-tap44.mjs` | ✓ 84 Ansichten |
| `north-video.mjs` (ND4-08, neu) | ✓ 8 Takte zweimal bitgleich (−300 dB); live-Mitschnitt Korrelation 1,000 (Median der 1-s-Fenster); Live-Knoten unberührt |
| `north-songs.mjs` (alte Songs, neu) | ✓ 9 Projekte aus 4.26.1 (Demo, 7 Kits, Song mit Stimme/Arp/Akkorden/Regie) laden+speichern unverändert; Video-Ton gleiche 356 Noten, Pegel −0,09 dB |
| `md1-chromium.mjs` | Klang/Bitgleichheit ✓; CPU je Stimme ✗ (13/25) – Q3 |
| `ndstage-play3min.mjs` (180 s, Kit Schräg) | Engine: 0 Knackser, 0 verspätet, 0 Lücken, 0 Fehler, Mitschnitt = Offline-Render (−349 dB), Drift −0,05 s · ✗ wegen 2 Ausgabe-Unterläufen |
| `play3min-basis.mjs` (Vergleich, Kit 808) | R-4261 **ohne North**: 2 Unterläufe · NORTH: 1 → Unterläufe kommen aus dem Container, nicht von North |
| `bau/tests` gegen R-4261 (gleiche Ausgabe) | smoke, v3-mk8-smoke, v3-mk8b-smoke, v3-qa-mk5reg-smoke, hif-iface, kick-test, kick-test2, n5-v-q2-save, n5-v-q2-vid, n5-v-vv2fix, n5-v-abn-04, n5-k-03: **gleich** (nur Zahlen/Zufalls-ID anders). Rot auf beiden gleich: hif-iface „smoke:false“, n5-v-abn-04 matrixRange Takt 4/5 (Altlast 4.26.1) |

## CPU-Messung (Xeon-Container, schwankt ±50 %)

- `md1-cpu.mjs`: Leerlauf 0,08 %; Hall 0,65 %; schlimmster Fall (12 × C1 + NOISE + Dist + Echo + Hall) **8,4 %** (Grenze 8 %),
  mit Begrenzer Stufe 1: 6,4 %, Stufe 2: 5,6 %; 15/23 Einzelgrenzen.
- `md1-chromium.mjs` (Echtzeit): typischer Groove (Fell & Holz, 16tel) 2,8 %; schlimmster Fall 10,2 %; late 0.
- 3-Minuten-Lauf: Engine-Last je Sekunde max. 4,3 %, Median ≈ 2–3 %.

## Offen (Xander/Dirigent)

1. **Gerätetest iPhone 12 Pro Max** (ND1-30): Kit „Schräg“ + 4 Synth-Spuren, 16 Takte; Hörprobe der 45 Programme (ND3-06). Entscheidet Q3.
2. **Q3 CPU-Rahmen**: Einzelgrenzen je Stimme überschritten (wie im Staging), Begrenzer greift. Enger setzen nur nach Gerätetest.
3. **Q9 Größe**: +173 KB statt ≤ 100 KB.
4. **Q2** Pegelschutz der Engine (Spitze bis +20 dBFS vor dem Master-Limiter bei Extremwerten), **Q6** E1-Abklingen – unverändert offen.
5. ND42-Fragen 1–4 (SOLO PART nur North-Pads, 🎲 bei North-Pads, Unter-Reiter-Höhe, ✕ für eigene Programme) – unverändert offen.
6. Erledigt hier: Q7 (β in Radiant), Q5 (`nOrd` → `nTopo`, kein „Nord“), ND4-08 (Video), BEND-Unterzeile.
