# V6A – Status (Zweig `v6a-gleiten`, 01.11.)

**Stand: fertig gebaut und getestet, wartet auf Xanders „Bitte prüfen“ (CHANGES.md, letzter Abschnitt).**
Basis `bau/snapshots/R-4300.html` (4.30.0), Arbeitsdatei `bau/helfer/V6A/index.html`, Diff `patch.diff`. VERSION unverändert 4.30.0.

## Gebaut (Spec Nachtrag 8, I1a/I1b = V6a/V6a′ mit A1–A10, Teil D-Vorgaben)
| Teil | Stand |
|---|---|
| Daten `clip.st = {eng, p: {Pfad: Wert}, fx: {vol, pan, rev, dly}, x, n}` (A1, A10-Pfade), `part.gl`, `mark.gl` = `{x, n?}` | additiv, `normClip`/`cleanClip`/`normPart`/`marksNorm`; ohne ◆ kein Feld |
| Gleiten `x`: `jump` aus (10 ms) · `flow` kurz · `bar1` · `bar2` · `free` (n 1–32 Schläge) | Vorrang: Song-Kante > Teil > ankommender Clip > abgehender Clip > kurz |
| Worklet-Morph (AnalogCore `onMsg` `{v6a}` vor `set`, A.3) | heiße Regler je 16 Samples (schmale Ableitung `v6aHot`), übrige je 128 über `setParams`, S-Kurve im Reglerraum (exp/dB logarithmisch), Endwert exakt; stufige Werte am Taktstrich über `setReq(force)` → 30-ms-Stimmen-Überblendung; eng 3 über `MkCore.set`; FM-Operatoren als ganzer Satz (`fm`) am Taktstrich |
| Endwert-Schicht (`v6aSnd` = Grundklang ⊕ Zustand) | `syncEngine`, `newEngine`, `wkFlush` (Zustand bleibt), `wkFm6Patch`, `trackFx`, nativer Anschlag (ECO/WT ab nächster Note), MS-2000-Gesten |
| Spur-Werte (Lautstärke, Pan, Hall, Echo) | AudioParam-Stufen alle 16 ms mit `setTargetAtTime` (nie Kurven-Automation), KZ6: Hand übernimmt |
| Planer (`v6aTick` in `tick()`, `v6aPre` vor `partTick`) | Matrix-Tipp, Teil-Start (`part.gl`), Song (Kante „kurz“ 1 Schlag vorher), ▶ setzt Zustände sofort (KZ5), Rücknahme eines Wartenden gleitet zurück |
| Offline-Render (Video, GarageBand-Instrumental) | gleicher Weg: `vvSwapIn` setzt die Laufzeit zurück, Fahrten wie live |
| ◆-Bearbeiten (A9) | [◆]/[Grundklang] im Editor-Kopf r1 (VA, FM, WT, MS-2000-Platte; quer im 1-Zeilen-Kopf der Platte), LCD „Bearbeite ◆ … n Werte anders“; Arbeitskopie in `track.sound`, beim Ende Differenz → `clip.st`, **ein** Undo-Schritt `'clip'`; Speichern während des Bearbeitens schreibt Grundklang + Zustand |
| Bedienung Song/Matrix | Clip-Blatt: Taste „◆ Klang · n“ → ◆-Blatt (Klartext, ◆ Bearbeiten, ✕ Löschen, Gleiten); Teil-Blatt und Marken-Blatt: Zeile „Gleiten: Clip · aus · kurz · 1 T · 2 T · frei“; ◆ in der Clip-Zelle (10 px, rechts oben) |
| Mod-Übersicht (A7) | je Wert des gespielten Zustands eine Zeile „◆ Szene n · Regler · Grund → Zustand“, Tipp = Regler, ✕ = Wert aus dem ◆ (Undo `'clip'`); im Video kein Mod-Hinweis dafür |
| Test-API | `v6aSetState`, `v6aSetGlide`, `v6aPartGlide`, `v6aMarkGlide`, `v6aState`, `v6aEdit`, `v6aDone`, `v6aEditing`, `v6aInfo`, `v6aEff`, `v6aProbe(Data)`, `v6aProbeAll`/`v6aProbeLog` (auch Render-Engines), `v6aStart` |

## Tests (`tests/`, Playwright + Chromium; `sh bau/helfer/V6A/tests/alle.sh`)
| Test | Ergebnis |
|---|---|
| v6a-regeln (Version, `live: true,` 1×, „MS 2000“ 1×, verbotene Wörter 0, Worklet ASCII, Wellen-Blöcke byte-gleich) | grün |
| v6a-regel28 (alte Songs: Ereignis-Strom an die Engines im Offline-Render identisch zu 4.30.0, Bezug 4.30.0↔4.30.0) | grün |
| v6a-rampe (Matrix „kurz“: Beginn 1 Schlag vorher ±1 Block, Ziel genau am Taktstrich, S-Kurve log) | grün |
| v6a-modi (Song: kurz / 2 T / aus / frei 3 / 1 T – Beginn, Ende, Monotonie, Ruhe ohne Drift, je Block gemessen) | grün |
| v6a-klick (Sinus-Probe für Pegel/Lautstärke/Pan + M-KLICK Hochpass 5 kHz ≤ +6 dB an allen fünf Kanten; max. +2,9 dB) | grün |
| v6a-live-offline (Fahrten-Plan in Schlägen identisch, Cutoff-Kurve live = offline ±1 Block) | grün |
| v6a-export (GarageBand-Instrumental und Video-Ton gleiten; WAV vor der Kante gleich, danach dunkler) | grün |
| v6a-matrix (Teil „2 T“, KZ6 Hand übernimmt im ◆-Editor, KZ5 ■/▶, ECO-Klang nativ) | grün |
| v6a-engines (MS-2000-Platte: Pfade gleiten, Filtertyp am Taktstrich; FM: Makro gleitet, Operatoren als Satz) | grün |
| v6a-daten (Undo/Redo, Speichern → Laden zeichengleich, offen gespeichert, Kopieren/Duplizieren, kaputte Datei, 4.30.0 öffnet) | grün |
| v6a-ui (hoch 390×844 und quer 844×390: [◆] 44×44, ◆-Blatt, Teil-/Marken-Blatt, Tasten ≥ 44 px, nichts abgeschnitten) | grün |
| v6a-k1 (Mod-Übersicht-Zeilen, ✕, Tipp) | grün |
| v6a-paritaet (North, KON, Block, Chor-Info, Video-Zeitachse gleich zu 4.30.0; KON behält ◆) | grün |
| v6a-cpu (Worklet-Last während einer 10-Regler-Fahrt: Ruhe 0,7–0,8 % → 1,2 %, ≤ +1 %; `v6aTick` < 0,001 ms) | grün |
| bau/tests/smoke.mjs | grün (0 Fehler) |
| bau/tests/orch-mk-check.mjs | grün (gleiche Werte wie 4.30.0) |
| bau/tests/v3-mk2-wellen.mjs | **OFFEN** – braucht den privaten Bezug `bau/dwgs-trace` (fehlt hier; 4.30.0 meldet dasselbe). Ersatz: v6a-regeln prüft die Wellen-Blöcke /*MKD*/ und /*MKT*/ byte-gleich zu 4.30.0 und FP-SICHER |

## Entscheidungen (mit Spec-Vorgaben selbst beantwortet)
1. Gleit-Namen nach Xander: aus = `jump` (10 ms statt 5 ms: Audio-Regel „Rampe ≥ 10 ms“, M-KLICK), kurz = `flow` (bis zum Taktstrich, im Song 1 Schlag vorher, KZ1), 1 T/2 T wie Spec, **frei** = neu `free` mit n Schlägen ab dem Taktstrich.
2. Stufige Werte (Welle, Fußlage, Filtertyp …) wechseln am Taktstrich mit der 30-ms-Stimmen-Überblendung für alle Stimmen (Spec §5.4 Punkt 3 „Überblend-Klasse“). Das Halten je Stimme bis zum Loslassen (KZ3 mit `v.pv`) braucht die Je-Stimme-Tabelle aus I2 §5.2 – kommt mit I1/I2.
3. Bearbeiten über eine Arbeitskopie in `track.sound` (alle Editoren ohne Umbau), Ende = Differenz → `clip.st`. Sobald `ED`/`edSnd()` (A.7, I2e) auf der Hauptlinie ist, wird `V6A.ed` dessen Ort `'st'`.
4. Nur Synth-Spuren bekommen ◆ (Drum-Zustände `st.slots`, V6a′-05, später mit `stAt(t)` in `drumHit`). Drive/Chorus der Spur bleiben Grundklang (A/B-Shaper-Stufen offen).
5. `S.need` (Baustein N, A.4) ist auf 4.30.0 noch nicht da – V6A schreibt kein `need`; beim Merge mit I2a trägt `'st'` sich ein (eine Zeile).

## Andocken an I1 (Zweig n8-i134)
- Präfix überall `v6a…`; Worklet-Nachricht `{v6a}` (I1 nennt sie `morph`: Inhalt gleich – t0, t1, Kurve, stetige Ziele, stufige `disc` am Taktstrich). Beim Merge: `onMsg`-Reihenfolge `morphStop → morph(v6a) → sr → set` (A.3).
- Endwert: `v6aSnd(i)` ist „Zustand ⊕ Grund“ von §5.1 – I1c setzt `SR_k(x)` darauf (`effective(t)`), `heardAt()` liest `v6aCurSt` + laufende Fahrt (`R.v6aRun`).
- Laufzeit `R.v6aCur[i]` = `R.st[t]` der Spec; Undo-Art `'clip'` wie A10.

## Offen / bitte prüfen
- Xanders Hörprobe am iPhone (CHANGES.md „Bitte prüfen“ 1–6).
- iPhone-Rechenlast (Spec I1-83) – Chromium-Messung +0,4 %; Faktor 2–2,5 am Gerät angenommen.
