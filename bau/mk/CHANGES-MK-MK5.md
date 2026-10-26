# CHANGES – MS 2000, Paket MK5 (Zweig-Kopie `mk-br-MK5`)

## MK5 — Step-Arpeggiator · App 4.13.0 · Format bleibt 5

**Vorgänger-Stand** für alle „bitgleich“-/Regressions-Vergleiche: **4.12.0** (Startstand dieser Kopie, MK0–MK4 gemischt;
gesichert als `scratchpad/mk5-base-4.12.0.html`, 2 874 742 B).
Zweig-Bau: MK6 (`mk-br-MK6`) und MK7 (`mk-br-MK7`) entstehen gleichzeitig; der Orchestrator führt zusammen und setzt die VERSION-Zeile.
Server: keine Änderung nötig (`max_app` 4 021 000 ≥ 4 013 000, `max_format` 5). Kein Supabase-Aufruf in diesem Lauf.
Neustart-Prüfung: kein `synq-snapshots/MK5.html`, keine MK5-Spuren in der Kopie → frischer Bau.

### Gebaut
1. **Arp-Kern im Hauptfaden** (`ARPC`, Block `sq-mk-src`, EN3-11/EN3-14). Alle Notenquellen einer AM-Spur mit `arp.on` gehen in den
   **gehaltenen Satz** (Intervalle {Quellnote, an, aus} in Audio-Zeit) statt an `spawnVoice`: Tastatur/MIDI/API (`inputDown`, Zeit + `LIVE_LEAD`),
   Clip-Noten (`scheduleTrack`, mit ihren künftigen Zeitstempeln; auch eigene Song-Clips und Aufnahmen beim Abspielen) und die MELODIE-Spur
   des Songs (wie gehört, nicht abgebildet).
   - Jeder Schritt fragt den Satz **zu seiner eigenen Zeit** ab und bildet die Quellnoten dann über `outPitch` ab (Harmonie, ⇅, „Eine Skala“,
     FOLGT). Gruppen: Tasten ohne „alle los“-Lücke gehören zu einem Akkord; Noten, die sich nur berühren (aus = an), gelten als neuer Akkord.
   - **Planer** in `tick()`: bei stehendem Transport **vor** `if (!R.playing) return`, bei laufendem nach dem Einplanen der Clips desselben
     Fensters (sonst sähe ein Schritt die Clip-Noten seines Fensters nicht); Horizont `LOOKAHEAD`. Eine neue Taste plant sofort
     (erste Note ≤ 10 ms, nie ein zu später Schritt).
   - **Raster:** Transport läuft = Song-Raster (Schlag · Auflösung W-11); Transport steht = Raster ab dem ersten Tastendruck. Start des
     Transports bei laufendem Arp: Wechsel aufs Song-Raster. Tempo- oder Auflösungswechsel: die schon geplanten Schritte hinter „jetzt“
     werden neu gemacht, der nächste Schritt liegt im neuen Tempo (kein doppelter, kein fehlender Schlag).
   - **Muster** (`arpPattern`, engine-frei für VI2a): Auf, Ab, Wechsel 1 (U + U rückwärts ohne Ränder), Wechsel 2 (U + U rückwärts), Zufall
     (Startwert aus Projekt-`id` + Spur-`uid` + Schritt-Zähler, 32-bit-Hash), Akkord (alle gehaltenen; mehr Tasten als Stimmen → die tiefsten;
     Stimmenzahl nach Timbre Voice / Mono-Regel aus MK3). OKTAVEN 1–4.
   - **KEY SYNC** an: Zähler 0 beim ersten Schritt eines neuen Akkords; aus: Zähler = Rasterschritt (Song: seit Schlag 0).
   - **Step-Arp:** LÄNGE 1–8 und Maske `steps`; ein aus-geschalteter Schritt ist eine Pause, der Notenzeiger rückt trotzdem weiter.
   - **GATE** W-34: max(3 ms, gate/100 · Schritt); 100 % = bis zum nächsten Einsatz (mit Swing). **SWING** W-35 auf die geraden Schritte;
     W-35 = 0 → der Song-Swing wie bei den Clip-16teln (`swingOffset`), W-35 ≠ 0 ersetzt ihn (kein doppelter Swing).
   - **Latch:** Loslassen hält den Akkord, neue Tasten nach „alle los“ ersetzen, eine weitere Taste beim Halten ergänzt; Latch aus → Stopp
     ≤ 1 Schritt. Ein Szenen-/Teilwechsel dieser Spur beendet einen gehaltenen (gelatchten) Akkord (Umfang 8).
   - **Ziel** (Schicht/Split): Arp-Noten tragen beim ON die Timbre-Maske `d`; in Schicht hält das andere Timbre die Tasten als normale Noten
     (Gegenmaske), in Split bestimmt die **gehaltene Taste** das Timbre (auch wenn OKTAVEN über `split` hebt); Tasten des nicht arpeggierten
     Split-Timbres spielen normal.
   - **Aufräumen:** Stopp, Panik, `fadeAll` (Projektwechsel), Szenen-/Teilwechsel (`cutTrackAt`, `cancelTrackFrom`, ■■), Engine-Wechsel,
     Arp aus und Spur stumm beenden alle Arp-Noten (geplante abgebrochen, klingende normal losgelassen).
   - **Träger-Wechsel** (`applyCarrierChange`) und ⇅ (`xpSet`/`xpReset`): die geplanten Schritte dahinter werden neu gemacht; eine klingende
     Arp-Note über den Wechsel folgt wie eine Clip-Stimme (`retune`, außer `onChange 'hold'`; bei ⇅ behalten klingende Noten ihre Höhe wie Clip-Noten).
   - **Akkord-Fenster 30 ms:** Eine Taste, die bis 30 ms nach dem ersten Schritt eines Akkords kommt, und dieser Schritt hat noch nicht geklungen,
     wird in ihn aufgenommen (ein Akkord wird nie in genau einem Augenblick gegriffen).
   - **ECO** (`forceNative`): der Arp läuft weiter über NativeVoice (Timbre-1-Bild); Noten nur für T2 (Maske 2) klingen dort nicht (B.5).
   - `noteLog` bekommt `src: 'arp'` mit `step`; `arpLog(t)` (B.7) mit {t, note, vel, dur, step, c}. Abgebrochene Schritte verschwinden aus beiden.
   - **Aufnahme** (H-8): ●, FANG, Overdub und MELODIE nehmen weiter die **gedrückten Tasten** auf (unverändert). Der MIDI-Mitschnitt (`PERF`,
     `buildMidiLog`) enthält die klingenden Arp-Noten, der Szenen-/Song-Export nur die Clip-Noten.
2. **Worklet** (AM-Zweig, ASCII): Note-On mit 7. Element `d` (0 = Modus entscheidet, 1 T1, 2 T2, 3 beide; alte 6-Element-Ereignisse = 0),
   `MkCore.routes(note, k, d)` auch bei Neuverteilung (MODUS/SPLIT); **KEYS** Typ 9 (erste Taste nach „alle los“) und 10 (alle los) mit
   Zeitstempel. Solange `arp.on`, setzen LFO 1/2 mit Key Sync „Timbre“ nur bei KEYS 9 zurück (`MkTim.keyReset`, dort hängt MK6 SEQ an);
   „Stimme“ setzt wie bisher je Note (= je Arp-Note) zurück. Host: `E.on(…, d)`, `E.keys(ty, t)`; `mkRender` versteht `[t, 'keys', 9|10]`.
3. **Bedienfeld** (wie am Original):
   - **ARP-Taste** (Z2): Arp an/aus (LED, ein Undo); kleine **Tempo-LED** blinkt im Song-Tempo (jedes Bild, nur Klassenwechsel). SHIFT + ARP: „gibt es in der App nicht“.
   - **EDIT-WAHL 2 ARP A:** TEMPO (Song-Tempo) · AUFLÖSUNG (Liste 1/24 … 1/4, LCD mit ms) · GATE (%, ms) · TYP (Liste Auf, Ab, Wechsel 1,
     Wechsel 2, Zufall, Akkord) · OKTAVEN (rastet 1–4). **ARP B:** LATCH · SWING (−100…+100 %) · KEY SYNC · LÄNGE (rastet 1–8) · ZIEL
     (Liste Beide, Timbre 1, Timbre 2). Auswahl-Liste und Matrix-Zeile mit Klartext-Zusammenfassung; ◎ markiert ARP A/B bei Abweichung von INIT.
   - **Schritt-Tasten:** bei ARP A/B (ohne SHIFT) sind die Nummerntasten die Schritte 1–8 am selben Platz: leuchtet = an, blinkt 1 Hz
     (CSS-Animation) = Pause, dunkel = über LÄNGE; der laufende Schritt hell (Wechsel ≤ 30/s, ≤ 1 Bild Verzug). Programm-Zeile „SCHRITTE · n“.
   - Hilfe: zwei neue Zeilen (ARP-Taste/ARP A, ARP B/Schritte/Aufnahme). Erster Tipp auf ARP und erste ARP-A/B-Wahl: LCD-Hinweis (L10).
4. **Leistungs-Probe:** neuer Fall **„+Arp“** (4 Engines, 1/24 im Song-Tempo, Auf über 2 Oktaven, GATE 75 %, KEYS je Akkord).
5. **Laden des Kerns:** `ARPC` liegt in `sq-mk-src`; ein Sound mit Arp an (Sound laden, `arp.on` setzen) lädt den Block gleich danach
   (`arpLoadSoon`), ein Tastendruck notfalls sofort; der Planer selbst lädt nie (sonst liefe `tickAhead` im `tick`).
6. Version **4.13.0**. Größe 2 907 221 B (**+31,7 KB**, Budget +33 KB).

### Abnahme MK5 (Chromium `v3-mk5-arp.mjs` 79 ✔, `v3-mk5-arp-audio.mjs` 11 ✔, `v3-mk5-ui.mjs` 80 ✔, `v3-mk5-perf.mjs`, `v3-mk5-fp.mjs` 10 ✔, `smoke.mjs`)
| ID | Ergebnis |
|---|---|
| MK5-01 | ✔ C-E-G, Auf/Ab/Wechsel 1/Wechsel 2 × OKTAVEN 1–4 deep-equal zur Tabelle (2 Durchläufe), Akkord je Schritt C E G (OKTAVEN ignoriert); Beispiel Range 1: Wechsel 1 = C E G E, Wechsel 2 = C E G G E C. |
| MK5-02 | ✔ 4 Töne, 2000 Schritte: 24,1 / 24,7 / 25,9 / 25,3 %. Gleicher Startwert → gleiche Folge, anderer → andere; live zweimal = dieselbe Folge = Muster ab Zähler 0. |
| MK5-03 | ✔ 1/16 bei 120 BPM: Abstand 125,000 ms; Einsätze im Song-Raster max. 0,00003 Schlag (`noteLog`) für 1/24, 1/16, 1/12, 1/8, 1/6, 1/4. Audio offline (App-Worklet, Hüllkurven-Abgriff): jeder Einsatz 0,000 ms Fehler (≤ 1 ms). |
| MK5-04 | ✔ GATE 50 % = 62,500 ms (`arpLog`), im Audio 62,3 ms bis zum Beginn des Loslassens; 100 % = bis zum nächsten Einsatz, Sustain 127: M-EINBRUCH −1,67 dB (Akkord) / −1,66 dB (dieselbe Taste, Stimme startet neu), M-KLICK +0,7 / +3,1 dB; 0 % = 3,00 ms. |
| MK5-05 | ✔ SWING +50 (1/8): gerade Noten +62,50 ms, −50: −62,50 ms, 0: gerade (± 0,00 ms). |
| MK5-06 | ✔ LÄNGE 4, Schritt 2 aus: Schritte 1 3 4 1 3 4 …, Noten C G C E C E … (Zeiger rückt bei der Pause weiter). Alle Schritte aus: 0 Noten, 0 Stimmen, keine Fehler. |
| MK5-07 | ✔ KEY SYNC an: neuer Akkord D-F-A nach „alle los“ beginnt mit D bei Schritt 1 (Zähler 0). Aus: zwei Läufe mit Anschlag nach 130 bzw. 460 ms = dasselbe Muster im 2. Takt. |
| MK5-08 | ✔ Latch hält, ersetzt nach „alle los“, ergänzt beim Halten; Latch aus → 0 Noten nach 1 Schritt, 0 Stimmen. |
| MK5-09 | ✔ Transport steht: erste Arp-Note 10,00 ms nach dem Tastendruck (Audio-Uhr in `inputDown`; 5 Läufe). |
| MK5-10 | ✔ 120 → 90 BPM im Lauf: alle Abstände ¼ Schlag (kein doppelter/fehlender Schlag), danach 166,67 ms. |
| MK5-11 | ✔ Schicht + Ziel T1 (STIMMEN 1+3): T1 eine Arp-Note, T2 hält C E G; Ziel Beide: beide Timbres spielen die Arp-Note; Split + Ziel T1 + OKTAVEN 3: keine Arp-Note auf T2 (Arp bis 79 über `split` 60), T2 hält 72/76; Split + Beide: das G (T1-Taste) bleibt oktaviert auf T1. |
| MK5-12 | ✔ Akkord mit 6 Tasten bei 4 Stimmen: 48 55 60 64 (die 4 tiefsten). |
| MK5-13 | ✔ 4-Takt-Akkord-Clip zwei Durchläufe identisch (64 Noten): KEY SYNC an (Wechsel 2, 2 Okt.) und KEY SYNC aus (Wechsel 1, Musterlänge 4). Spur stoppt am Taktstrich: 0 Proxies, 0 Worklet-Stimmen; Szenenwechsel: ab dem Strich nur der neue Akkord, keine Note über den Strich. |
| MK5-14 | ✔ ● mit Arp: Clip = die gedrückten Tasten (60 62 64 65 67 69), ein Undo; Abspielen = dieselbe Zufallsfolge je Akkord; Mitschnitt = 17 Arp-Noten = `arpLog` (MIDI 17); Szenen-MIDI-Export 6 Note-On = 6 Clip-Noten. |
| MK5-15 | ✔ Stopp, Panik, Szenenwechsel, Engine-Wechsel, Arp aus, Spur stumm, Spur stoppt am Taktstrich: nach 1 Schritt + Release 0 Worklet-Stimmen, kein Arp-Schritt danach, keine nicht losgelassene Arp-Stimme (siehe „Befund aus früheren Paketen“). |
| MK5-16 | ✔ 4 Arp-Spuren 1/24, Arp-Anteil je `tick` p95 0,2–0,3 ms (Auflösung von `performance.now` 0,1 ms; max 1,1–2,5 ms), ganzer `tick` p95 0,8 ms (4.12.0 ohne Arp 0,6–1,3 ms); PE1: rAF-Median 60 fps, keine longtask, keine Fehler. Probe „+Arp“: `load_med` 0,031 (Kern 0,083, +FX 0,096), `frames_ok`, 0 Netzaufrufe. |
| MK5-17 | ✔ ARP-Taste und Schritt-Tasten ≥ 44 × 44 (P1 8 × 44, P2 2 × 4 à 80 × 44, P3 2 × 4 à 68 × 44, L1 46 × 46 bei Maßstab 1,05); M-PLATZ in P1, P2, P3, L1, L2, W, L1-SA, 926 × 428-SA, L1-HB (je Hälfte) für SPIEL, ARP an, ARP A, ARP A + SHIFT, ARP B, Schritte mit Pausen/LÄNGE 6, laufender Schritt; M-ANSICHT 0,00 px; M-SKIZZE (`v3-mk1-look.mjs` 88 ✔). LED-Zustände an │ Pause (Animation `mkbl1`, 1 Hz) │ dunkel laut Einstellung; Tempo-LED 0 falsche Bilder in 3 s (12 Wechsel); laufender Schritt 22–24 Wechsel/s bei 24 Schritten/s, 0 Bilder > 1 Bild Verzug. Listen AUFLÖSUNG/TYP/ZIEL Zeilen ≥ 44 px. |
| MK5-18 | ✔ `v3-v2d2-rec.mjs` 65/65, `v3-v2d-fang.mjs` 39/39, `v3-v2d2-regcore.mjs` 28 gleich (die „log“-Abweichungen sind Live-Zeit-Jitter, dieselben gegen 4.12.0 wie 4.12.0 gegen V2c′), `v3-mk3-ui.mjs` 37 ✔, `v3-mk4-ui.mjs` 63 ✔ (1 erwartete Abweichung: der Test verlangt ARP A/B noch dunkel), `v3-mk4-fx.mjs` 61 ✔ (bitgleich gegen 4.12.0). Clip-Wiedergabe Drums/VA/AM mit Arp aus: 149 = 149 Noten gleich 4.12.0. Budget +31,7 KB. |
| MK5-19 | ✔ 4-Takt-Akkord-Clip, Träger C → Am in Takt 3 (gesetzt 60 ms vor dem Strich, Planer schaut schon hinein): ab Takt 3 nur 57/60/64; ebenso mit „Eine Skala“; ⇅ +2 in Takt 3: nur 62/66/69; keine hängende Note. |
| MK5-20 | ✔ Song-Swing 30 %, Arp 1/16, SWING 0: Arp-Einsätze = Clip-16tel (137,5 ms); SWING +50: nur W-35 (+31,25 ms); Transport steht: 4,25 s ohne Lücke; Clip-Note bei Schlag 4,5 → erste Arp-Note 4,5. |
| MK5-21 | ✔ Hauptfaden: KEYS 9,10,9,10 bei 2 Akkorden/10 Schritten. Worklet (Abgriff LFO 1, Säge, Key Sync Timbre, Arp an, GATE 50 %): Phase läuft über die Schritte (0,01 0,43 0,84 −0,75 …), neuer Akkord = 0,014 wie Akkord 1; ohne Arp setzt jede Note zurück; Key Sync Stimme je Arp-Note. **SEQ** (MK6) ist in dieser Kopie nicht gebaut: `MkTim.keyReset` ist der Haken, MK5-21 für SEQ ist **am Merge offen**. |
| MK5-22 | ✔ `forceNative`: `arpLog` wie im Worklet-Klang (60 64 67 72 76 79 …), Schicht + Ziel T2 im ECO: nur der gehaltene Akkord (T1), keine Fehler. |

### Fach-Prüfung (vor der Abnahme, an mir selbst): FP-SONG ● (Haupt-Blick), FP-TOUCH (Zweit-Blick)
`v3-mk5-fp.mjs` 10 ✔, dazu Durchsicht des Diffs, der Testausgaben und der Bildschirmfotos. **9 Befunde, alle behoben:**
1. FP-SONG — `inputDown`: `if (!inp.arp …)` war bei Spur 0 falsch (Index 0), die Taste klang zusätzlich als normale Stimme → `inp.arp == null`.
2. FP-SONG — abgebrochene (neu geplante) Schritte blieben in `arpLog` → werden mit dem Schritt entfernt (Mitschnitt = `arpLog`, MK5-14).
3. FP-SONG — `arpOn` hätte im Planer `mkLoad` aufgerufen (darin `tickAhead` → `tick` im `tick`, doppelte Noten möglich) → Laden nur außerhalb des Planers (`arpLoadSoon`, Tastendruck).
4. FP-SONG — ein neu geplanter erster Schritt schickte KEYS 9 ein zweites Mal → KEYS gleicher Zeit nur einmal.
5. FP-SONG — Latch hielt einen Akkord über einen Szenen-/Teilwechsel → der Wechsel beendet das Halten (Umfang 8).
6. FP-SONG — ⇅-Wechsel kurz vor dem Strich: schon geplante Schritte hatten die alte Höhe → `xpSet`/`xpReset` planen hinter dem Wechsel neu.
7. FP-SONG — eine zweite Akkordtaste nach dem schon geplanten (nicht klingenden) ersten Schritt wurde nicht aufgenommen → Neuplanung auch bei `on` = letzter geplanter Schritt, Akkord-Fenster 30 ms.
8. FP-TOUCH — Programm-Zeile in P3 LINKS lief über („SCHRITTE · LÄNGE 8“) → „SCHRITTE · 8“ / „an │ Pause“.
9. FP-TOUCH — erster Tipp auf ARP: der Hinweis überschrieb die Rückmeldung „ARP AN“ → beim ersten Mal ein gemeinsamer Text.
FP-SONG-Punkte ohne Befund: M-ZEIT (MK5-03/-10/-20), `S.tracks[].clips` und Song deep-equal nach Wiedergabe mit Arp, Undo-Gruppen (ARP, Schritt, Regler je ein Undo), Rundweg Speichern/Laden aller Arp-Felder, `normMk` klemmt, Taktstrich-Regel (MK5-13/-15), Harmonie-Kern (`Transposer`, `Harmony`, `mapOut`, `outPitch`) bytegleich zu 4.12.0, MIDI-Export (MK5-14).
FP-TOUCH ohne Befund: Treffer ≥ 44, keine Überlappung, M-ANSICHT 0 px, ein Undo je Geste, Haptik (ARP, Schritt, rastende Regler), keine neuen Gesten (nur Tipp, Ziehen wie bisher), Beschriftungen deutsch (TYP-Namen Auf/Ab/Wechsel/Zufall/Akkord; LATCH, SWING, KEY SYNC, GATE wie am Gerät, im LCD erklärt).

### Abweichungen / Entscheidungen (eK)
- **Chromium:** Die Tests starten `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (der vorgegebene Pfad `chromium-1194` existiert in diesem Container nicht; wie alle MK-Tests).
- **KEY SYNC aus + Clip-Schleife:** Der Zähler folgt dem Song-Raster; zwei Durchläufe einer 4-Takt-Schleife sind gleich, wenn die Musterlänge die 64 Schritte teilt (sonst wandert das Muster, wie am Gerät mit externem Takt). MK5-13 ist darum mit KEY SYNC an und mit KEY SYNC aus + Musterlänge 4 geprüft.
- **KEYS 9** kommt zum Zeitpunkt der ersten Arp-Note des Akkords (bei stehendem Transport = Tastendruck + 10 ms, bei laufendem der nächste Rasterpunkt), damit die LFO-Phase genau mit dem ersten Ton beginnt. KEYS 10 beim ersten leeren Schritt.
- **Akkord-Fenster 30 ms** (s. o.): Kommt eine Taste erst, nachdem der erste Schritt schon klingt (> ≈ 8 ms auseinander auf dem iPhone, ≈ 10 ms im Test-Chromium), ist dieser erste Schritt unvollständig; danach stimmt das Muster.
- **Split + Ziel:** Ob eine Taste arpeggiert oder normal spielt, entscheidet ihre Höhe beim Anschlag (nicht neu bei einem späteren Träger-Wechsel).
- **Aufräumen bei Szenen-/Teilwechsel** beendet auch einen gelatchten Live-Akkord dieser Spur (Umfang 8 „beenden alle Arp-Noten“); physisch gehaltene Tasten spielen weiter.
- **Noten gleicher Höhe** im Satz (zwei Tasten, eine Höhe nach der Abbildung) zählen einmal.
- **`noteLog`:** Eine Taste auf einer Arp-Spur erzeugt keinen `live`-Eintrag mehr (es klingt keine eigene Stimme), nur die `arp`-Noten; ● REC, FANG und MELODIE bekommen die Taste wie bisher.
- `arp.tempo` wird nur gespeichert (EN3-10); TEMPO in ARP A ist das Song-Tempo.

### Befund aus früheren Paketen (auf der Hauptlinie beheben, hier nicht geändert)
- **MK1/MK3 `MkTim.polyOn`:** Startet eine losgelassene Stimme derselben Note neu (gleiche Note, neue Taste), wird die alte Kennung nie mit
  `endCheck` gemeldet. Ihr Proxy bleibt bis zum GC-Netz (`stopAt` + 1 s ≈ 1,3 s) in `VOICES` (Zustand `released`, klingt nicht). Mit dem Arp
  (gleiche Note in jedem Durchlauf) kommt das ständig vor; `voices()` zeigt dann bis zu einige losgelassene Proxies. Vorschlag:
  `const old = v.id; this.start(v, k, …); if (old !== k.id) this.endCheck(old);` im Zweig „the same note releasing“.
- `v3-mk4-ui.mjs` prüft, dass ARP A/B in der EDIT-WAHL-2-Liste noch dunkel sind; ab MK5 nicht mehr (Test anpassen).

### Merge-Hinweise (für den Orchestrator)
- Block `sq-mk-src`: neues `ARPC` direkt nach `/*}MKT*/`; im Bedienfeld: Listen `ares/atyp/atgt`, `KN.arp*`, `arpTxt`, `arpView`, `SEC2` ARP A/B
  aktiv, `arpKey`, `stepKey`, `numKey`, `render` (Nummerntasten/Programm-Zeile/ARP-LED), `setWahl`, `rotList`, `wiaPos2`, Regler-Geste (`stp`),
  `arpFrame`, Probe-Fall `arp`, CSS (`marp`, `mpause`, `mover`, `mcur`), `MKUI`-Export, `panelInfo().arp`.
- Worklet (AM-Zweig): `MkTim.noteOn` (Reset nur ohne Arp) + `keyReset`, `MkCore` (`arp`, `top`, `set` `arp.on`, `routes(…, d)`, `keysEv`,
  `noteOn(…, d)`, `after`), `AnalogCore.runEvents` (Typ 1 mit `e[6]`, Typ 9/10), `enqueue` (7. Element). **MK6** hängt den SEQ-Reset „Timbre“ an `keyReset`.
- Hauptfaden: `SynthHost` (`E.on` mit `d`, `E.keys`), `spawnWkVoice` (Maske), `spawnVoice` (ECO Maske 2), `spawnClipVoice(…, mask)`,
  `applyCarrierChange`, `xpSet`/`xpReset`, Hilfsfunktionen `arpOn`/`arpLoadSoon`/`arpK`/`arpTick`/`arpEndAll` vor `swingOffset`, `tick`,
  `scheduleTrack`, `cutTrackAt`, `cancelTrackFrom`, `stopTrackNow`, Song-MELODIE in `songTick`, `inputDown`/`inputUp`, `stop`, `fadeAll`, `panic`,
  `applySound`, `mkSetP`, `mkRender` (KEYS), `noteLog` (`step`), `uiFrame` (`arpFrame`), Test-API `arpLog`/`arpClear`/`arpInfo`, Hilfe-Zeilen, VERSION.

### Leistung / FP-IPHONE (Information)
- Node-Offline: der Arp sitzt im Hauptfaden; die Stimmen sind dieselben wie bei Clip-Noten (keine neue DSP).
- Chromium ×4 gedrosselt (`v3-mk5-perf.mjs 4`): Arp-Anteil je `tick` p95 1,2–1,3 ms, ganzer `tick` p95 3,8–3,9 ms (4.12.0 ohne Arp 2,9–3,2 ms), rAF 60 fps, keine longtask.
- Leistungs-Probe am iPhone: neuer Fall „+Arp“ (Menü → Info → Leistungs-Probe; jetzt drei Fälle à 10 s).

### iPhone-Prüfpunkte (Xander)
1. ARP-Taste an (LED), einen Akkord halten: die Töne kommen nacheinander, die kleine LED blinkt im Takt.
2. EDIT-WAHL 2 auf ARP A: TYP (Regler 4) auf Wechsel 2, OKTAVEN (Regler 5) auf 2.
3. ARP B: LÄNGE (Regler 4) auf 6, zwei Nummerntasten antippen – sie blinken (Pause), 7 und 8 sind dunkel; der laufende Schritt leuchtet hell.
4. Mit laufendem Song spielen, dann ● aufnehmen: Der Clip enthält die gedrückten Akkorde, beim Abspielen arpeggiert er wieder.

### Geräte-Abgleich (microKORG, nach Gehör; blockiert nicht)
Step-Arp „Schritt aus“ (rückt die Note weiter?) · Swing +50 · Gate 0 · Key Sync aus bei laufendem Takt (nur Muster-Neustart vergleichen) ·
Arp 1/16, Gate 50 %, LFO 1 Key Sync Timbre: startet der LFO je Akkord oder je Schritt neu? · Auslösung Single mit Arp.

### Lücken
- Arp-Noten im Song-MIDI-Export (bewusst nicht, H-8; der Mitschnitt hat sie). Arp mit eigenem Tempo (nicht im Umfang). Arp für VA/FM/WT (VI2a).
- MK5-21 für den Mod-Sequenzer erst nach dem Merge mit MK6 prüfbar (am Merge offen).
- Am Server offen: nichts (keine Server-Änderung).

### Tests und Bilder
`dirigent-test/v3-mk5-arp.mjs` (+ `.out`), `v3-mk5-arp-audio.mjs` (+ `.out`), `v3-mk5-ui.mjs` (+ `.out`), `v3-mk5-perf.mjs` (+ `v3-mk5-perf4.out`),
`v3-mk5-fp.mjs`, `v3-mk5-shot.mjs` → `dirigent-test/v3-mk5-shots/` (P1, P2 L/R, P3 L/R, L1, L2 L/R, W; ARP B, Schritte 2/5 Pause, LÄNGE 6,
laufender Schritt), `v3-mk5-look-shots/` (M-SKIZZE), Regression `dirigent-test/v3-mk5-reg/`, `v3-mk5-smoke.png`.
