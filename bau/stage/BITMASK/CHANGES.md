# CHANGES

## 4.31.0 — Bit Mask

Neuer Synth „Bit Mask“ (Bitmasken-Synthese, Spec `spec/dirigent-spec-v3-nachtrag-7-bitmask.md` Rev. 2) in der App 4.30.0
(Chor-Gruppe, GarageBand-Umweg, Songtext-Erkennung, KON/Magic/Pinsel, Video VV4 + Pegel + Logo, North bleiben unverändert).
Grundlage: `bau/snapshots/R-4300.html` → `bau/stage/BITMASK/index.html`, Unterschied in `stage.diff`.

### Was neu ist (für Xander)
- **Fünfte Klangerzeugung „Bit Mask“** im Synth-Kopf (Knopf bzw. Eintrag im Engine-Chip). 2 Masken-Oszillatoren mit je 512 Masken,
  Rauschen, Filter (LP/HP/BP/NOTCH), 4 Hüllkurven mit Schleife, Masken- und Tonhöhen-Hüllkurve, 2 LFOs, **4 Mod-Ziele je Quelle**,
  9 Spielweisen, 12 Stimmen, Schicht/Split, Arpeggiator (26 Muster), FX1 (Chorus, Verzerrung, Bitcrusher, Ringmodulator) und
  FX2 (Echo mit SYNC ins Song-Tempo, Hall, Verzerrung). Klang wie am Gerät: 16-fach überabgetastet, körnige Hüllkurven.
- **Bedienfeld wie das Gerät** (Reiter GERÄT): 23 Tasten, rote 4-stellige Anzeige, Drehgeber Vol und Value, Masken-Übersicht;
  quer in zwei Reihen, hoch gefaltet; jede Taste ≥ 44 px. Bedienung: Modus-Taste → « Param » → Value. LCD-Zeile wie beim MS 2000.
- **Räder BEND/MOD** links der Tasten, **Druck**: Finger auf gehaltener Taste nach oben schieben (Balken an der Taste).
- **Bend, Rad und Druck werden im Clip mitgespeichert** und wandern bei jeder Kopie mit; im ⋯-Menü eines Clips mit Kurven:
  „Kurven löschen (Bend · Rad · Druck)“.
- **40 eigene Startklänge P00–P39** (Bass, Lead, Pad, Keys, Blech/Streicher, Pluck/Glocke, Orgel/Chor, FX/Arp) und INIT, 2 OSZ,
  ANSCHLAG in der Bibliothek (Engine-Chip „Bit Mask“). Voice-Taste: » = P00 …, « = eigene Klänge U00 ….
- **Mod-Übersicht (K1)** zeigt jede Bit-Mask-Route, ✕ löscht sie (ein Undo).
- **Video und GarageBand-Instrumental** enthalten Bit Mask (zwei Videos desselben Songs sind bitgleich).
- **Schnell wie vorher:** Ohne Bit-Mask-Spur wird nichts davon geladen (kein Modul, kein Bedienfeld, kein Arp-Block).
- Alte Songs und Klänge klingen gleich (Regel 28). Ältere App-Versionen öffnen ein Bit-Mask-Projekt gesperrt.

### Bitte prüfen (iPhone 12 Pro Max, Safari) — Schritt für Schritt
1. App öffnen (4.31.0 im Menü). Ein altes Projekt laden und abspielen: klingt wie vorher, Start so schnell wie vorher.
2. Synth-Spur antippen → Kopf: **Bit Mask** tippen. Eine Taste spielen: Säge (Maske 007). Zurück auf VA: alter Klang ist da.
3. Reiter **GERÄT**: das Bedienfeld. Quer halten: zwei Reihen; hoch: gefaltet. Alle Tasten gut treffbar?
4. **Osc1** tippen → Anzeige „MASK“, dann „007“. **Value** drehen (langsam, schnell, kreisend); Doppeltipp = 007.
5. **Osc1 halten + Osc2 tippen** → beide leuchten, Value ändert beide Masken. Ein Undo nimmt die ganze Geste zurück.
6. **Voice** → » blättert P00 Säge-Bass, P01 Gummi-Bass … Ein paar Klänge je Kategorie anhören (Bass, Pad, Glocke, Orgel).
7. **P35 Arp-Glitzer** oder **P36 Sequenz-Puls**: Akkord halten → der Arp spielt (in Spielreihenfolge). ▶ starten: der Arp läuft
   im Song-Tempo. Arp-Taste 1 s halten stoppt einen gehaltenen Arp.
8. **Layer** → Value wählt einen zweiten Klang (B), « Param » → SEMI/BAL/PAN/TUNE. **Split halten + Taste** = Splitpunkt.
9. Taste halten und **Finger nach oben schieben** → oranger Balken (Druck). Seitlich weg = normales Gleiten.
10. **BEND/MOD-Rad** bewegen. Dann ● aufnehmen mit Rad- und Bend-Bewegung → Clip abspielen: die Bewegung kommt wieder.
    ⋯ am Clip → „Kurven löschen“.
11. ▶ mit Bit-Mask-Spur, ■ (weicher Ausklang), ■■ (sofort still, auch Hall/Echo).
12. Song mit Bit Mask + North-Kit + Chor-Gruppe 3 Minuten abspielen: kein Knacksen, keine Aussetzer.
13. Menü → Video erstellen und „Mit GarageBand aufnehmen“: Bit Mask ist im Video bzw. im Instrumental zu hören.
14. Menü → Info → Leistungs-Probe mit Bit Mask (`perfProbe`): Wert unter 50 %? (Tor iPhone §2.5)
15. Mod-Übersicht (K1) auf einer Bit-Mask-Spur: Routen sichtbar, ✕ löscht, Undo stellt her.

### Zusammenführung (Technik)
Vier Teilpakete auf alter Basis (vs-base-B = 4.23.0) wurden je als Anteil gegen ihre Basis per 3-Wege (`git merge-file`) auf 4.30.0
gesetzt, Reihenfolge BM6 (helfer-bmu) → BM1–BM4 (helfer-bmk) → BM5 (helfer-bm5) → BM8 (helfer-bmc); Gegenprobe mit `patch`
(Kontext-Anker) — beide Wege gleich bis auf die Konflikte. Konflikte von Hand gelöst, alles aus 4.30.0 bleibt (ND4/North, VV2/VV4,
G3, KON, 64 Takte beim Verdoppeln, FM-FELD-Hinweis ohne Markennamen).

Platzhalter ersetzt und Teilpakete aufeinander abgestimmt:
- **Daten Rev. 2:** BM6 hatte noch das ältere Format (1 Mod-Ziel, 256 Masken, Global in `g`). `SQBM` ist jetzt Rev. 2 wie Prozessor
  und Bedienfeld: `p.bm = {v, ly, gl, a, b}`, Masken 0–511, je Quelle 4 Plätze `[Ziel, Menge]` (`l1.t`, `l2.t`, `mo.v/mw/at`),
  `fx.sy`, `ar.sp`, Layer `ein|lay|spl`. Pfade für `bmSet`: z. B. `a.l1.t.0.1`, `gl.tn`. Routen (K1) über alle belegten Plätze.
- **Prozessor:** BM-STUB (BM6) und BM5-Platzhalter-Prozessor entfallen; es spielt `BM-KLANG` (BM1–BM4). Der Host schickt jetzt
  auch `{t:'gl'}` und immer `prog b` (null löscht B). Ergänzt im Prozessor: `ping/pong` (Quittung für den Offline-Render),
  `cut` in `ctl`-Listen (BM8 ■: wartende Regler-Ereignisse fallen weg), Layer-PAN ±100 (Bedienfeld PAN ±99).
- **Druck:** Das Bedienfeld formt die AT CURVE (Balken zeigt den geformten Wert, BM8 nimmt ihn so auf); der Prozessor formt nicht
  noch einmal (vorher doppelt). NONE = 0.
- **Ein Host, ein Lader:** `bmLoad` (BM6) wertet den Block `sq-bm-src` aus: Host, Prozessor-Text, nativer Rückfall, Probe, Render,
  danach das Bedienfeld `BMUI` (BM5). BM5s eigener Host/Lader entfällt; `bmPost`/`bmResend` gehen an den BM6-Knoten.
- **Räder:** die BM5-Räder (eigene Kopie, der MS-2000-Block wird nicht geladen). Die MK1-Räder sind wieder nur für MS 2000.
  `SYNQUENZER.mkWheel` und `mkWheelVal` lesen auf Bit-Mask-Spuren die BM5-Räder. BM8 hängt an `bmCtl` (Aufnahme) und an den
  Gesten (Berühren: Live gewinnt).
- **Arp:** `ARPC` (Block `sq-arp-src`) kennt jetzt die Engine `bm`: Muster aus `BMARP` (Tasten in Spielreihenfolge), SPD frei bzw.
  Song-Teilung, HOLD = Latch, TRIG OFF = eine Stimme mit Umstimmen, Noten nur auf Programm A (`d: 1`), Gate 80 % [A]. MS-2000-Pfad
  unverändert. `BMARP.stop(i)` (Arp-Taste 1 s, Klang laden). Der Bit-Mask-Arp lädt nur `sq-arp-src`, nicht den MS-2000-Block.
- **BM7 Startklänge:** P00–P39 nach §4 als Werks-Datensätze (`engine 'bm'`, `role`), VOL je Klang gemessen (≈ −18 dB RMS,
  Keys/Pluck −22, Spitzen ≤ −1 dBFS). `BMFAC.list()` für die Voice-Plätze.
- **Video/GarageBand (BM6-06):** `vvSwapIn` lädt das Modul in den Offline-Kontext, sichert und stellt den Live-Zustand `BMX` wieder her;
  vor jedem Weiterrechnen quittiert jeder Bit-Mask-Knoten (wie NORTH 4.30.0) → zwei Videos bitgleich.
- **K1:** `k1Mods` listet Bit-Mask-Routen, `k1Del` setzt die Menge auf 0.
- VERSION `'4.31.0'`; „MS 2000“ genau 1× (ein Kommentar im Bedienfeld umformuliert), `  live: true,` 1×, keine Marken-Wörter.

### Tests
`bau/stage/BITMASK/tests/alle.sh` (Ergebnisse in `ergebnisse/`). Teilpaket-Tests auf die Stage-Datei und 4.30.0 als Basis
umgebogen (Pfade +1 Ebene, `vs-base-B` → `R-4300`); inhaltliche Anpassungen nur, wo sich die Schnittstelle bewusst geändert hat:
BM6-Tests auf Rev.-2-Pfade, BM6-08 mit `appVersion 4.31.0`, BM2-09 (AT formt das Bedienfeld), BM4-09 (ARPC um `bm` ergänzt;
MS-2000-Pfad über die MK5-Suiten alt = neu), BM5 „P00“ = erster Startklang, BM8-Regel-28 gegen 4.30.0 (Versionsnummer ausgenommen).
Neu: `STAGE/bm-stage.mjs` (Startzeit, Laden bei Bedarf, Video, GarageBand, Speichern/Laden), `STAGE/bm-north-chor-play3min.mjs`
(3 min Bit Mask + Arp + North + Chor-Gruppe, Vorlage STAGE NORTH).
