# G6+0 und G6+a – Änderungen (Basis 4.25.2 = `bau/snapshots/R-4252.html`, VERSION unverändert)

## G6+0 – Sofort-Korrekturen am heutigen Chor (ändern keinen Klang)
- **ZIP/Laden:** `tkActiveIds` und `tkUsedIds` zählen die Takes der Chor-Stimmen (`voices[].take.take`, neu `tkChorIds`). Selbst gesungene Chor-Takes stehen jetzt im ZIP, werden beim Laden geladen und von `tkLoadAll` nicht mehr abgeräumt (4.25.2 verliert sie im ZIP – Gegenprobe im Test).
- **Solo/„Selbst singen“:** Schließen des Chor-Blatts schaltet Solo aus (Lead wieder hörbar). „Selbst singen“ bleibt scharf (sonst ginge ● nach dem Schließen nicht mehr); beim Start der Aufnahme in dieser Szene spielt die Zielstimme wieder allein als Führung (`g6ArmGo` in `vsRecBegin`). Laden (`applyProject` → `g6Reset`) setzt Solo und Scharf zurück. Für den Video-Render (ab 4.26) gibt es `g6RenderHold()` → Rückgabe-Funktion stellt danach wieder her.
- **Knoten je Stück:** Schlüssel `g6Sid(audio):Stimme:Kopie:Spur` statt `Take:Stimme:Kopie:Spur`. `g6Apply(a, i, mk)` legt Knoten nur beim Start an (Solo-Umschalten erzeugt keine Knoten für nicht gespielte Clips). Freigabe 1,5 s nach dem Ende des letzten Stücks dieses Audios (`g6Release`), `G6.nodes` wird beim Laden geleert.
  **Regel-28-Ausnahme (Fehler):** Zwei Clips mit demselben Take und verschiedenen Chor-Werten teilten sich bisher die Knoten; jetzt klingt jede Stelle mit ihren eigenen Werten.
- Kleinigkeiten: unerreichbares `if (v.take) break;` in `g6Ready` entfernt; selbst gesungene Stimme hat einen Knoten statt zwei.

## G6+a – Fundament der Chor-Gruppe
- **v1 eingefroren:** `G6V1 = {COPY, MIX, PAN, CAL, MAXV}` tief eingefroren; `G6_COPY/G6_MIX/G6_PAN/G6_CAL` zeigen darauf. Code des v1-Wegs (`g6Auto`, `g6HallK`, `g6Buf`, `g6Build` …) Zeichen für Zeichen gleich (Test vergleicht den Funktionstext mit 4.25.2).
- **Weiche:** `g6NormChor` → bei `c.v === 2` `g6pNorm2`. `g6Start` → bei `v === 2` `g6pStart` (liefert G6+c); solange es fehlt, spielt v2 über den v1-Weg aus den Rückfall-Feldern.
- **Daten v2** (`g6pNorm2`, `g6pNormVoice`, `g6pNormGrp`): Felder und Grenzen wie Spec §2.2 (höchstens 6 Stimmen, 4 Kopien, 4000 Noten, `d` −21…21, `o`/`x` −2…2, `sib` ∈ {0, −6, −12, −18, −60}, `pre` ∈ {0, '1/64', '1/32', '1/16'}). Rückfall-Felder für 4.25 werden immer mitgeschrieben (`rec/dir/mix`, je Stimme `name/vol/rev/dly`, `n[].iv`; fehlt `iv`, Näherung aus Stufen). Fehlende Gruppe = Background-Werte (`G6P_GRP0`).
- **Chor-Spuren** `S.tracks[st].chor = {lanes: [{id, role, name, mute?}], mute?, cpl?, ref?, off?}`: `normTrack` (nur STIMME), `tkNormProject` löscht `chor` an anderen Spuren. Beim Laden ordnet `g6pFixLanes` Stimmen mit unbekannter/falscher/doppelter Spur einer Spur aus ihrer Regel zu (stimmige Daten bleiben gleich). Spur-Grenze 8 mit Übernahme einer grauen Spur (`g6pLaneFor`).
- **Namen und Farben:** `g6pRoleName(role)` nach Tabelle §2.2 („Gegenstimme n“ für frei), `g6pLaneColor(role, voice)` / `g6pIvColor(d, o)` nach Tabelle §1.6 → `{tok: 'chor3' …, dig: '3'|'10'…}`. Die CSS-Tokens selbst (`--chor3` …, hell/dunkel) liefert G6+g.
- **Kopplung Lead ↔ Chor (Xander 01.11.):** Daten `cpl: false` (fehlt = gekoppelt), `ref` = Lead-Pegel in dB beim Trennen, `off` = Ausgleich beim Wieder-Koppeln. `g6pCouple(on)` (ein Undo-Schritt), Faktor für den Klangweg: `g6pFaderGain(st, leadLin)` = gekoppelt `lin·10^(off/20)`, getrennt `10^((ref+off)/20)`.
- **Takes:** `src` erlaubt `'dup'`, `'chor'`, neues Feld `of` (Herkunfts-Take). Ältere Fassungen machen daraus `'rec'`.
- **Format nach Inhalt:** In SQStore `PROJECT_FORMAT_READ = 6` und `fmtOf(p)` (6 nur bei v2-Chor, Chor-Spuren oder Takes `dup/chor`). Lese-Stellen auf `PROJECT_FORMAT_READ` (Datei lesen, Autosave-Wahl, `normalizeProject` `_newer`, `nvLockOf`, `nvNewer`, `nvStoreKv`); Schreib-Stellen auf `fmtOf` (Datei `buildProjectFile`, `kvFile`, Autosave-/Verlauf-Snapshot trägt `project.format = 6`, Online-Text und Kopf `p_format`). `PROJECT_FORMAT` bleibt 5.
- **Aufräumen:** `tkGc` behält zusätzlich nach Stück-Namen (`chunks` aller Takes, ↶/↷, gespeicherte Projekte/Verlauf) und die Säubern-Referenz des Herkunfts-Takes (`of`).
- **Undo:** neues Element `{kind: 'chorlanes', track, before}` (`undoState`/`undoApply`); `g6pLanesEdit(label, fn)` = ein Schritt, `g6pSetChor(r, chor)` = ein Gruppen-Undo (Clip bzw. Song + Spuren).
- **Test-API:** `g6pInfo, g6pSet, g6pLanes, g6pCouple, g6pFader, g6pNorm, g6pNormLanes, g6pColor, g6pName, g6pFmt, g6RenderHold, g6RenderDone, g6ArmGo, g6Reset`. `g6pInfo().bytes` bleibt 0, bis G6+b die Chor-Puffer zählt.

## Schnittstellen für G6+b / G6+c (gleiche Basis)
- Datenform genau §2.2; `g6pTrackOf(r)` statt `stimmeT()`.
- G6+c: `function g6pStart(o, r)` definieren (die Weiche ruft sie), Knoten-Schlüssel gern über `g6Sid(a)`, Freigabe `g6Release(a)` wird schon aus `g6Drop` gerufen (dafür `r.ch` setzen). Spur-Stumm `lane.mute`, Chor aus `S.tracks[st].chor.mute`, Kopplung `g6pFaderGain`.
- G6+b: Cache-Bytes in `G6P.bytes` eintragen.
