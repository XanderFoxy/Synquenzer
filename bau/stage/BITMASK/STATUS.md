# STATUS Stage BITMASK (App 4.31.0, Zweig `stage-bitmask`)

**Gebaut, getestet, wartet auf Xanders Prüfung am iPhone** (`CHANGES.md` → „Bitte prüfen“). Nicht live gestellt, nichts an `main`.

- Datei: `bau/stage/BITMASK/index.html` (Basis `bau/snapshots/R-4300.html`, Unterschied `stage.diff`, 4194 Zeilen / 106 Abschnitte).
- Enthalten: BM1–BM4 Klang (helfer-bmk), BM5 Bedienfeld (helfer-bm5), BM6 Einbindung (helfer-bmu), BM8 Clip-Kurven (helfer-bmc),
  **BM7 Startklänge P00–P39** (hier gebaut), Arp-Einbindung in ARPC, K1-Routen, Video/GarageBand mit Bit Mask.
- Regeln: VERSION `'4.31.0'` · „MS 2000“ 1× · `  live: true,` 1× · Marken-Wörter 0 (auch in Tests und Ergebnissen) · keine Handbücher/PDFs/
  Seitenbilder · keine Datenbank-Zugriffe (Tests prüfen: 0 Supabase-Anfragen).

## Tests (`tests/alle.sh`, Chromium/Playwright, Ergebnisse in `ergebnisse/`)
| Bereich | Ergebnis |
|---|---|
| `bau/tests/smoke.mjs` | ✓ keine Fehler |
| `bau/tests/orch-mk-check.mjs` | ✓ 4.31.0, initAm rms 0,0705 / Spitze 0,177 (gleich 4.30.0) |
| `bau/tests/v3-mk2-wellen.mjs` | **OFFEN** wie bei 4.30.0: privater Bezug `bau/dwgs-trace` fehlt im Container. Ersatzprüfung ✓: Wellenblock MKD, Tabellenbau MKT, MKV, `sq-worklet-src`, `sq-md-src`, `sq-g9-src` zeichengleich mit R-4300; `sq-mk-src` gleich bis auf den verschobenen ARPC |
| Stage `bm-stage` | ✓ 7/7: Startzeit ohne Bit Mask 391 ms gegen 400 ms (Median aus 15, abwechselnd); ohne Bit-Mask-Spur kein Block, kein `addModule`, kein Arp-Block; Video enthält Bit Mask (−24,8 dB), zweimal bitgleich; GarageBand-Instrumental enthält Bit Mask (−23,4 dB); danach spielt live wieder der Live-Knoten; Speichern → Laden deep-equal (Klang + Kurven); Konsole leer |
| Stage `bm-offline-live` | ✓ Live-Mitschnitt (Worklet, sample-genau) gegen `bmRender`: Korrelation 1,000 / 0,9997 |
| **3 Minuten** Bit Mask + North + Chor-Gruppe | Bit Mask ✓ (2 Spuren: P11 mit CH2+RV3, P36 Arp 1OCT; 0 verspätete Noten, 1333 Arp-Noten, Last je Knoten max 7,6 %, Median 1,6 %); Chor ✓ 5/5 Stellen fertig; Master ohne Lücke; North-Mitschnitt gegen Offline M-NULL −349 dB, **0 Knackser**; Hauptthread 17,9 %. **Nicht grün**: 12 Audio-Unterläufe (playbackStats) und Uhr-Drift −0,45 s. Gegenlauf 4.30.0 ohne Bit Mask im selben Container: ebenfalls rot (4 Unterläufe, Drift −0,35 s, 4 Master-Lücken, 3 Knackser) → Container-Eigenschaft, am iPhone prüfen |
| BM1–BM4 (BMK) | bm1-node 27/27 · bm1-browser ✓ · bm1-cpu ✓ · bm2-node 24/24 · bm2-modes 11/11 · bm2-slots 4/4 · bm2-review ✓ · bm2-robust ✓ (10 min, 0 NaN) · bm2-cpu ✓ · bm3-fx 14/14 · bm3-cpu ✓ · bm4-layer ✓ · bm4-arp ✓ · bm4-browser ✓ · MK5-Suiten alt/neu je 78/79 mit gleichen Urteilen (MK5-02 KEY SYNC schon in 4.30.0 rot) |
| BM5 Bedienfeld | bm5-ui 104/104 in XW, XP, P1, P2, P3, L1, L2 · bm5-look 176/176 · bm5-regel 7/7 |
| BM6 Einbindung | bm6-store 6/6 · bm6-int 13/14 (BM6-06 mit ScriptProcessor-Mitschnitt 0,90 → Ersatz `bm-offline-live` ✓) · bm6-golden 11/12 (**Größe** siehe unten) |
| BM8 Clip-Kurven | curves 17/17 · copy 39/39 · rec2 7/7 · review 7/7 · layout 22/22 · helfer ✓ · regel28 7/7 gegen 4.30.0 |

Test-Anpassungen (nur wo die Schnittstelle bewusst anders ist) stehen in `CHANGES.md` → Tests.

## CPU (Xeon, Node/Chromium)
- Stimme 0,99 × VA-Stimme (Rahmen 1,8 ×), 12 Stimmen 8,8 % (Rahmen 22 %), Leerlauf 0,07 %, 60 s ohne GC, Heap +0,47 MB.
- Chromium echter Worklet: 12 Stimmen + CH4 + RV3 6–8 %, max 10,4 %; `perfProbe(['bm'])` 10 Stimmen + FX Median 12 %.
- FX1 0,14–0,23 %, FX2 RV 0,77 % (Rahmen 0,4 / 1,0 %). Begrenzer: Stufe 1 → 8, Stufe 2 → 6 Stimmen, klingende unverändert.
- **iPhone-Tor (§2.5) offen:** Leistungs-Probe mit Bit Mask am Gerät (Wert < 50 %?).

## Größe
- Seite 4 915 261 B: **+249 980 B** gegen 4.30.0 (gzip +84 KB). Davon **bei Bedarf** +176 KB (Block `sq-bm-src` 169 KB: Prozessor 87 KB,
  Host, Bedienfeld; `sq-arp-src` 28 KB, davon ARPC aus dem MS-Block verschoben) und **beim Start** +80 KB (Datenteil `SQBM` 11 KB,
  Startklänge 10 KB, BM6-Host-Haken, BM8 Kurven-Laufzeit und Normalisierer, BM5-Haken, K1).
- Budget der Spec (Start +25 KB) überschritten; die Startzeit ist trotzdem gleich (s. oben). Möglich, falls gewünscht: Startklänge und
  BM8-Laufzeit in Blöcke bei Bedarf verschieben (≈ −30 KB).

## Offene Punkte
1. iPhone: Bedienfeld, Druck-Geste, Räder, Arp, Leistung (Tor §2.5), 3-Minuten-Lauf ohne Knacksen — nur am Gerät beurteilbar.
2. Startklänge: VOL gemessen geeicht; kurze Plucks (P17, P19, P26–P28, P30, P35) bleiben leiser (Spitze begrenzt), Holz-Pluck −33 dB RMS.
   Klangabnahme BM7-02/BM7-04 (Hörproben-ZIP) nicht gebaut.
3. `v3-mk2-wellen.mjs` am Bau-Ort mit Bezug laufen lassen.
4. Größenbudget (s. oben).
5. Annahmen [A], beim Zusammenführen festgelegt: Arp-Gate 80 % (TRIG OFF 100 %), Arp-Muster-Zähler startet je Akkord neu, Layer-SEMI ±24 /
   PAN ±99 (Bedienfeld), AT CURVE formt das Bedienfeld (nicht der Prozessor). Fragen der Teilpakete (CHANGES der Helfer) bleiben offen.
6. 🎲 auf einer Bit-Mask-Spur zeigt nur einen Hinweis (Zufall über Init → RAND im Bedienfeld).
