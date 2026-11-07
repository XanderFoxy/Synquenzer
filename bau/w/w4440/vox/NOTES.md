# VX1 – Gesang: Chor entkoppelt, natürliche Tonhöhe, Wort löschen, Übersprechen, Audio-Editor

Basis 4.42.0 (`w4440/basis.html`), Arbeitskopie `w4440/vox/index.html` (+43 KB). VERSION und CHANGES sind nicht angefasst.
Neuer Code steht im Block `/* VX1-BEGIN */ … /* VX1-END */` (nach `G10G-END`), CSS in `VX1-CSS-BEGIN/END` (nach `G10G-CSS-END`).
Im Tonhöhen-Kern `g2PitchMake` gibt es einen zweiten kleinen VX1-Block (`curveNat`). In bestehenden Funktionen stehen nur
Einhänge-Zeilen mit dem Kürzel `VX1`. Die Test-API steht als letzte `Object.assign`-Zeile vor `NO_SYNC`.

## 1. Für Xander

- **Lead stumm, der Chor singt weiter:** [M] an der STIMME-Spur schaltet jetzt nur noch den Hauptgesang stumm. BACKGROUND und
  die einzelnen Chor-Stimmen klingen weiter, mit S/M/Pegel je Stimme wie bisher. Im Mischpult „Background“ steht dafür neben
  „Lead“ ein [M]. Im Noten-Editor einer Chor-Stimme schaltet die Taste **Lead** den Hauptgesang aus und wieder an.
- **Natürlich statt Autotune:** In Takes → ♪ Tonhöhe gibt es den Regler **Natürlich ——— Hart**. Er steht an der Stelle der
  Einrast-Zeit. Neu ist „natürlich“ der Standard: Vibrato und Übergänge bleiben, korrigiert wird nur, wo eine Note im Mittel
  danebenliegt. [Weich] stellt auf natürlich, [Hart] auf hart, dazwischen geht es stufenlos.
- **Ein Wort herauslöschen:** Im Marken-Editor tippst du zwischen zwei Striche, dann ist das Stück rot gewählt. Mit den runden
  Griffen ziehst du die Kanten (mit Lupe; sie rasten an Strich, Schlag und Nulldurchgang ein). [Löschen] schneidet das Stück
  heraus und rückt den Rest nach, ohne Dehnen. [Lücke] macht es stumm, die Zeit bleibt. ↶ holt alles zurück.
- **Rhythmus im Gesang:** Die Ursache war die Weg-Erkennung. Nach einem USB-Interface oder Headset blieb „Kabel“ gespeichert,
  dann wurden Lautsprecher-Takes nicht gesäubert. Das ist behoben. Erkennt die App Musik im Mikro, säubert sie den Take jetzt
  auch dann mit 60 %, wenn „Kopfhörer“ eingestellt ist (Meldung „Musik im Mikro erkannt“).
- **Bedienung:** Ein schneller Wisch in der Welle läuft weich nach. Ein versehentlicher Doppeltipp auf 🎤 schaltet das Mikro
  nicht mehr gleich wieder aus.

## 2. Technik

**C – Chor entkoppelt**
- `scheduleTrack`: Ein STIMME-Clip wird auch bei stummer Spur geplant, wenn er einen Chor trägt (`vx1ChorOn`). Das Lead-Stück
  bekommt dann in `tkStartSrc` den Pegel 0 (`vx1LeadSilent` → `o.gain = 0`) und trägt nur `g6Start`. Der Chor geht wie bisher
  an `AU.masterSum`.
- `tkVoxTick` macht dasselbe für die Song-Stimme (`vx1VoxChor`, je Stück `vx1ChorOn`).
- `setMute(STIMME)` plant mit Chor neu (`tkTrackResync`/`tkVoxResync`), statt zu stoppen (`vx1AnyChor`).
- Das Mischpult nutzt `vx1LeadSl` (Zeile `.vx1-lrow`, [M] mit 44×44 px) und `data-a="leadm"` → `vx1LeadMuteTap`. Das ist
  derselbe Stumm-Zustand wie der Spurkopf, mit einem Undo der Art `sx4m`.
- Der Noten-Editor einer Chor-Stimme ersetzt die gesperrte Taste [WAV] durch **Lead** (`vx1VoiceHead`). Der Zustand wird in
  `vx1G2Paint` (Ende von `g2Paint`) nachgeführt.

**P – natürlich ↔ hart**
- Datenfeld `take.pitch.nat` (0–100, additiv, normalisiert in `vx1NormPitch` aus `g2NormPitch`). Neue Tonhöhen starten mit
  `nat: 0`. `g2SetQ` setzt bei [Weich] 0 und bei [Hart] 100.
- Plan: `g10gPlan` gibt `plan.nat = nat/100` mit. Fehlt das Feld (alte Takes), bleibt der Plan unverändert.
- Kern: `curve()` verzweigt bei `plan.nat` nach `curveNat`. Darin gibt es je Note eine konstante Korrektur der Notenmitte (bei
  1 = hart ein Anteil, der der Stimme folgt). Unter 15 Cent wird nur weich eingeblendet. Noten unter 120 ms werden weniger
  korrigiert. Zwischen zwei Noten wird linear verbunden, die Übergangszeit liegt zwischen 120 ms (natürlich) und 15 ms (hart).
  Formant und Klang laufen über dasselbe Teilton-Modell.
- `planKey` und `active` kennen `nat`. Der Chor erbt `nat` vom Lead (`g6pPlan`, beide Zweige).
- Bedienung: `vx1NatRow` ist eine Reihe `.qrow.g10g-rt.vx1-nat` hinter der Einrast-Zeit-Reihe. Sichtbar ist entweder die neue
  Reihe (ohne Tonhöhe, nicht quantisiert oder mit `nat`) oder die Einrast-Zeit (nur alte quantisierte Takes ohne `nat`).
  Gleiche Höhe, kein Layout-Sprung. Ziehen = hören, Loslassen = ein Undo „Natürlich ↔ Hart · Tonhöhe“.

**W – Schneiden im Marken-Editor**
- Gesten (Einhänge-Zeilen in `g10eGest`): `vx1Down` (Kante ±22 px greifen; Halten ≥ 450 ms auf der Welle = freie Auswahl),
  `vx1Move` (Ziehen mit Lupe `vx1Lupe` ±20 ms, Einrasten `vx1Snap`: Strich ≤ 12 px, Schlag ≤ 8 px, sonst Nulldurchgang ±2,5 ms
  im Roh-Take), `vx1End`, `vx1TapLater` (Einzel-Tipp nach dem Doppeltipp-Fenster → `vx1SelectWord` von Strich zu Strich).
  Der Doppeltipp-Zoom bleibt.
- Zeichnen: `vx1Paint` (aus `wpPaint`) zeigt ein rotes Band mit Länge und runden Griffen im freien Band über dem Lineal.
  Die Leiste `vx1Bar` (`.vx1bar` in `.wpcv`, über dem Lineal, 44 px hoch) hat [▶] (`vx1PlaySel`), [Löschen], [Lücke] und [✕].
- Schnitt `vx1Cut` legt einen **neuen Take** an: Roh-PCM mit `vx1Splice` (8-ms-Überblendung, gleiche Leistung, ohne Dehnen)
  bzw. `vx1Gap`. Die Referenz (`<id>:r<k>`) und die gesäuberte Fassung werden genauso geschnitten. Die gesäuberte Fassung
  kommt sofort in `CL.buf` und in den Cache, damit nicht neu gerechnet wird.
- Die Take-Felder rücken mit (`vx1CutMeta`): Marken (erkannte werden dabei fest gespeichert), `pitch.notes`, `ly.s`, `lyrics`
  (Silben der gelöschten Marken fallen weg), `pre`/`post` und die Zeitkarte `warp.map` (`vx1MapCut`). Am Ende läuft alles
  durch `tkNormTake` (deep-equal beim Speichern).
- Das Stück zeigt danach auf den neuen Take, `in`/`out` rücken nach. Chor-Noten `voices[].n` rücken mit. Entkoppelte und
  duplizierte Stimmen bekommen einen neuen Take auf denselben neuen Stücken (`of` = neuer Lead).
- Der alte Take bleibt erhalten. Ein Undo-Schritt besteht aus `group` = `takes` + `clip` bzw. `song`. `vx1WpUndone` (aus
  `wpUndone`, per Microtask nach der ganzen Gruppe) lässt den Editor dem Take des Stücks folgen.
- Nachlauf `vx1Fling`: Geschwindigkeit der letzten ≈ 80 ms, Abklingen 0,94 je 16 ms. Ein neuer Finger hält ihn an.

**R – Übersprechen**
- Gefundene Ursache (Regression seit HIF 4.25.4): `stSetRoute(…, 'erkannt')` speicherte den erkannten Weg als eigene Wahl
  (`prof.route`). Beim nächsten Start mit eingebautem Mikro galt dann „Kabel“. Für diesen Weg macht `clNewTake` weder eine
  Referenz noch SÄUBERN, also blieb die Musik im Gesang.
- Fix 1: Gemerkt wird nur noch eine eigene Wahl (`prof.rh = 'gewählt'`, geladen in `stProf`). `stGot` nimmt den gemerkten Weg
  nur mit `rh` (`vx1SavedRoute`). Alte Profile ohne `rh` starten deshalb wieder als Lautsprecher.
- Fix 2: Ein Take über einen Nicht-Lautsprecher-Weg geht durch `vx1Probe` (Einhängung in `tkMakeTake.store`). Die Referenz
  wird aus dem Ringpuffer gelesen, im Worker läuft `estimateDelay` (Kern aus `vsCleanMake`). Liegt die Spitze bei ≥ 15 (die
  Schwelle von `clean()`), wird die Referenz gespeichert, `cl = 60` gesetzt und `clEnsure` gestartet; dazu die Meldung „Musik
  im Mikro erkannt – Säubern 60 %“. Ohne Echo-Weg ändert sich nichts.

**E – Mikro**
- `stToggle` → `vx1MicGuard`: Ein zweiter Tipp innerhalb von 700 ms wird verworfen. Solange das Mikro ausgeht, kommt die
  Meldung „Mikrofon geht gerade aus …“.

**Test-API (neu, am Ende):** `vx1Info`, `vx1LeadMute`, `vx1Sel`, `vx1SelWord`, `vx1Cut`, `vx1Splice`, `vx1ProbeArr`,
`vx1PitchCmp` (Vorher/Nachher mit Testsignal), `vx1MicGuardReset`, `vx1Plan`.

## 3. Tests

Skript `w4440/vox/vx1-test.mjs` (Ausgabe `vx1-test.out`): **ALLE OK** (Chromium, Mikro-Attrappe im selben AudioContext,
Gegenprobe gegen 4.42.0).
- **P (Testsignal mit Vibrato ±45 Cent, Noten 10–30 Cent daneben):**

  | Fassung | Vibrato (Cent) | Notenmitte (Cent) | steilster Übergang |
  |---|---|---|---|
  | Original | 31,8 | bis 25 daneben | – |
  | Weich (alt) | – | – | 67,8 Cent/10 ms |
  | natürlich | 31,7 (bleibt) | ≤ 8 | 62,5 Cent/10 ms |
  | 50 % | 19,9 | – | – |
  | hart | 2,4 | – | – |

  Ein Plan ohne `nat` ist zu 4.42.0 bitgleich, Ausgabe und Cache-Schlüssel (Hash `8f5de382:ae35e8d3`).
- **C:** Lead an −22,5 dB, Chor −30,5 dB.
  - Lead stumm: Lead −200 dB, Chor −31,5 dB. In 4.42.0 lag dort auch der Chor bei −200 dB.
  - Mischpult [M] 44×44 px; ein Tipp schaltet den Lead wieder an, mit einem Undo „Lead an“.
- **W (hochkant 428×926 und quer 926×428):**
  - Bedienung: Ein Tipp wählt von Strich zu Strich. Die Leiste hat 4 Tasten ≥ 44 px. Griff ziehen mit Lupe funktioniert.
    Das ✕ ist im Bild.
  - Löschen 0,700 s: Das 3. Wort beginnt bei 0,951 s (vorher 1,650 s) mit 660 Hz, also ungedehnt. Die Naht hat keinen Knack.
  - Daten und Undo: Striche rücken mit, ↶ ↷ gehen, das Stück folgt.
  - Lücke: Die Länge bleibt, das Wort ist stumm.
  - Neuladen ist deep-equal. Der Nachlauf läuft 0,22 s weiter.
- **R:**
  - Gespeichertes „Kabel“ ohne eigene Wahl: VX1 startet mit „speaker“, 4.42.0 mit „wired“.
  - Weg „Kabel“ mit Musik im Mikro (Loopback): Echo-Spitze 144 → SÄUBERN 60 %. Musik in den Gesangspausen −19,9 → −56,2 dB
    (−36,3 dB), Gesang −2,5 dB (über G4). In 4.42.0 blieb es bei −19,3 dB.
  - Gegenprobe Lautsprecher-Weg in 4.42.0 (Diagnose): SÄUBERN wirkt dort (−20,9 → −57,8 dB). Der Kern ist also intakt, der
    Fehler lag nur im Weg.
- **E:** Ein Doppeltipp auf 🎤 lässt das Mikro an (der zweite Tipp wird verworfen). [Weich] ergibt `nat 0`. Regler auf 70 ergibt
  Plan `nat 0,7` und ein Undo.
- **Pflicht:**
  - topdefs: 26 Skripte, 0 doppelt, 0 Syntaxfehler (Basis ebenso).
  - smoke: `errors []` (`smoke.png`).
  - Regeln: Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×.
- **Fotos:** `vx1-mischpult-hochkant.png`, `vx1-schneiden-hochkant.png`, `vx1-schneiden-quer.png`, `vx1-tonhoehe-quer.png`.

## 4. Offen / Risiken

- **Bewusste Änderung bei alten Projekten:** War die STIMME-Spur stumm und hatte sie einen Chor, ist der Chor jetzt hörbar
  (live und im Video). Das ist der verlangte Ablauf; der Klang der Daten ändert sich sonst nicht.
- **Kleines Fenster (Vorschlag, nicht gebaut):** Hochkant ist die Welle nur ≈ 100 px hoch. Oben liegen 44 px Griff-Leiste,
  unten 44 px Lineal; frei bleiben ≈ 12 px. Wählen geht deshalb per Tipp in der Griff-Leiste oder im Band, Kanten greift man
  überall. Wirklich besser würde eine höhere Welle beim Editieren (Tastatur weg) oder „Große Welle“ als Standard; das wäre
  sichtbar anders und gehört als Vorschlag in den Funk.
- **Natürlich – Grenzen:** Die Klangfarbe der Korrektur kommt weiter aus dem Teilton-Modell. Gemessen ist nur synthetisch;
  ob es am echten Gesang „nach Melodyne“ klingt, muss Xander hören. Der Chor wird nur natürlicher, wenn der Lead `nat` trägt
  (eigener Schalter für den Chor fehlt). Die Einrast-Zeit gilt bei `nat` nicht, die Übergangszeit folgt dem Regler.
- **Schneiden:**
  - Jeder Schnitt legt einen neuen Take an (Speicher ×1 je Schnitt; [Aufräumen] räumt wie bisher).
  - Der verknüpfte MELODIE-Clip rückt nicht mit.
  - `lyrics` (VS5b) verliert beim Schnitt die Bindestriche (Silben werden mit Leerzeichen getrennt).
  - Selbst gesungene Chor-Stimmen (eigene Aufnahme) bleiben unverändert.
  - Bei A/B „Original“ wird nicht geschnitten.
  - Halten + Ziehen für eine freie Auswahl braucht hochkant das schmale freie Band.
- **Übersprechen:**
  - Lange Song-Takes aus dem Strom (G8, über 2 min) bekommen keine nachträgliche Probe.
  - Am iPhone ist ungemessen, ob der echte Lautsprecher-Weg die Schwelle 15 erreicht (im Loopback 144).
  - Nach dem Säubern rechnet G4 etwa 1 s nach. So lange klingt beim ersten Durchlauf noch die vorige Fassung (wie in 4.42.0).
- **Mikro-Stabilität:** Nur das Entprellen ist gebaut. iOS-Routenwechsel (play-and-record ↔ playback) lassen sich hier nicht
  testen.
