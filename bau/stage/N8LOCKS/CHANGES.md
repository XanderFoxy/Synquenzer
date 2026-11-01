# CHANGES – Stage `N8LOCKS` (Zweig `stage-n8-locks`)

Basis: `bau/snapshots/R-4300.html` (App 4.30.0, online) → `bau/stage/N8LOCKS/index.html`. Diff: `stage.diff`.
Übernommen: **I2f** (Zweig `i2-br-U`, fertig) und **I2a** (Zweig `i2-br-K`, Zwischenstand) – beide auf 4.24.0 gebaut –, dazu hier
**I2b** und **I2c** fertig gebaut. Alles aus 4.30.0 bleibt (Chor-Gruppe, G-GB, G9b, KON/Magic/Pinsel, Video VV4, North).
`VERSION = '4.32.0'`. Format bleibt 5 (nur zusätzliche Felder). Kein Datenbank-Aufruf, Zeile `  live: true,` genau 1×, „MS 2000“ genau 1×,
keine Marken-Wörter. Tests: `bau/stage/N8LOCKS/tests/` (Playwright + Chromium, Touch; Node-Shim für die CPU).

## 4.32.0 — Anschlag und Locks

**Kurz für Xander:** Du siehst den Anschlag jeder Note als Füllhöhe, ziehst ihn mit ⇕ hoch/runter und hörst die Note sofort; ◀ ▶ gehen
Note für Note. Unsichtbar darunter: Jeder Schritt kann jetzt eigene Reglerwerte haben (Noten-Locks) und es gibt freie Reihen
(z. B. „OP 2 Pegel“ mit eigener Länge, Chance, Ratsche). Beides klingt schon genau – Sample für Sample wie der Klang mit diesem Wert –,
die Bedienung dafür (LOCK-Taste, Lock-Leiste, Pinsel, Ring) kommt mit I2e. Alte Projekte klingen Bit für Bit wie in 4.30.0.

### Schritt 1 — Übertragung (3-Wege gegen 4.24.0)
- Anteile von I2a (`bau/helfer/I2K/index.html`) und I2f (`bau/helfer/I2F/index.html`) je gegen `G-T-merge-fix.html` (4.24.0) ermittelt
  und mit `git merge-file` auf 4.30.0 gelegt; 13 Konflikte von Hand gelöst:
  - `normNoteExtras`: Silbe `sy` (G9E) bleibt, danach `lk.v`/`lk.k` an Synth-Noten (I2a).
  - `normClip` / `cleanClip`: Auftakt `pre` (G3) und danach `kl`/`klq`/`ln` (I2a), feste Reihenfolge.
  - `NOTE_X` mit `sy` (4.30.0), `cleanNote` mit tiefer `lk`-Kopie (I2a).
  - `normalizeProject` / `nvLockOf` / `nvNewer`: Lese-Grenze `PROJECT_FORMAT_READ` (G6+a, 4.30.0) + Baustein N (`need`, I2a).
  - ROLLE: Pinsel-Leisten (MP) und Magic (MS) aus 4.30.0 bleiben; Anschlag-Leiste ◀ VEL ▶ (I2f) daneben; `setTool` schließt weiter
    Pinsel ↔ Magic aus und behält bei ⇕ die Auswahl; Gesten-Ende ruft `velBubbleHome` nach dem Magic-Weg; Test-Haken beider zusammen.
- `pv-layout.json` (eingefroren, I2a) liegt neben der App; die eingebettete Liste ist Zeichen für Zeichen gleich.

### Schritt 2 — I2b Noten-Locks im Klang (§5.1–5.7)
- **Nachricht** (§5.1): Note-an ohne Lock unverändert `[t, 1, id, note, vel, from(, d)]`; mit Lock
  `[t, 1, id, note, vel, from, d, 0, n, i1, x1, …]` (≤ 41 Zahlen, `x` in Engine-Einheiten). `enqueue` übernimmt den ganzen Rest
  (bisher bei Element 7 abgeschnitten); kurze Ereignisse laufen über den alten Weg.
- **Je-Stimme-Tabelle** (§5.2): `v.pv` (Float32, `NaN` = frei) und `v.pvR` (1 = Reihen-Startwert), Platz = `pv-layout.json`, angelegt
  erst beim ersten Lock eines Kerns im Nachrichten-Weg (alte Projekte: kein Speicher, keine Arbeit). Das Worklet trägt die Platz-Listen
  selbst; die App prüft beim Start, dass sie gleich `PV_LAYOUT` sind (`lkInfo().wkList`).
- **Weiche**: eine Stimme mit Werten bekommt eine eigene Sicht `v.VP` (Klang + Locks) und eigene abgeleitete Werte `v.D`
  (Hüllkurven-Koeffizienten, Wellen, Unison, Filtertyp, Sync, Cutoff, Drive); `derive()` wurde dazu in `deriveInto(D, P)` geteilt
  (gleiche Rechnung, gleiche Reihenfolge). Ohne Werte ist `v.D = null` und der Kern läuft genau den bisherigen Weg (bitgleich).
- **VA** (§5.3): alle Klasse-b- und -n-Werte inkl. der stufigen je Stimme (Welle, Sync, Filtertyp, Sub, Unison) – kein Fach nötig.
- **FM DX und FELD** (§5.4): FM-Sicht `v.fmP` (Pegel, Verhältnis grob/fein, Verstimmung, Hüllkurven-Rate/-Level, Anschlag, Rate-Skal.,
  Transponieren, Tonhöhen-Hk.); FELD-Graph-Werte je Stimme `v.gxv` (Feedback-Menge, Phase, Phasen-Art, LFO-Pegel/-Tonhöhe).
  Ein Live-Patch (`setFm`) rechnet die Sichten gelockter Stimmen neu.
- **MK-Engine** (§5.5, Raum M): je Stimme eigener geglätteter Satz (Cutoff, Resonanz, EG-Int., Keytrack, Steuer 1/2, Mischer, Pegel,
  Panorama, Tune/Transpose, Osz 2 Halbton/Fein, Vibrato), eigene Hüllkurven EG1/EG2, PATCH-INT je Stimme, Bend-Bereich, Portamento.
  Mod-Sequenz und PATCH rechnen obendrauf. Arp-Töne übernehmen die Paare der gehaltenen Clip-Note (`ARPC.clip(…, lk)`).
- **Mono/Legato** (§5.2): ein neuer Lock-Wert auf weiterlaufender Stimme gleitet in 5 ms (15 Steuer-Blöcke); neue Stimmen ohne Rampe.
- **Stimmenklau** (I2-17): `endVoice` leert `pv`/`pvR`; der Lock gehört zur Note.
- **Schutz**: Endlichkeit und Platz werden im Worklet geprüft, sonst verworfen und `lkBad` gezählt (`lkInfo`, Test-API `lkWkInfo`).
- **Nativer Weg / WT** (§5.6): Sicht `PL` mit `o.lkP` beim Notenstart (Hüllkurven, Pegel, Cutoff …); `v.P` bleibt der Spur-Klang, so
  bleiben LFO-Anschluss, Legato-Erkennung und alle Identitäts-Prüfungen unverändert.
- **Drum-Stimme** (§5.7): `DrumSeq.lockParams(P, lk, pad)` setzt zuerst `lk.v` (Kennlinie aus `DPD`), dann TUNE/DECAY relativ wie bisher.
- **Planer**: `scheduleTrack` trägt die Note mit (bei zusammengelegten Doppelten gewinnt die lautere samt Lock); `lkNoteX` rechnet
  Paare, nativen Satz und den Video-Satz. **L6 / I2-64**: beginnt eine Note vor ihrem Reihen-Schritt, bekommt sie den Schrittwert als
  Reihen-Startwert (`i < 0`); das Reihen-Ereignis löst ihn ab, ohne Sprung (der Startwert hält bis zum Ende der 3-ms-Rampe).
- **Video / GarageBand** (§5.11): der Offline-Render benutzt denselben Planer (Locks und Reihen klingen im Video und im Instrumental);
  VV3 (`vv3VaState`, `vv3FmState`, `vv3MkState`) zeichnet die Werte der klingenden Note.

### Schritt 3 — I2c Freie Reihen (§5.8)
- `scheduleLanes` läuft in `scheduleTrack` vor den Noten, im selben Fenster; Schritt-Index = `d1Pos` (D1), Zeit mit dem Swing der Noten,
  Chance über `DrumSeq.rand01` (jedes Planen gleich), Ratsche: gerade Teile = Wert, ungerade = Grundwert (Vorgabe F8 b).
- Nur Änderungen werden gesendet (gleicher Wert wie davor = kein Ereignis). **Typ 11** `[t, 11, 0, c, i, x, r]` (Element 2 immer 0),
  **Typ 12** `[t, 12, 0, c]` wird sofort in `enqueue` ausgeführt und löscht wartende Typ-11-Ereignisse ab `t`; `kill` lässt 11/12 stehen.
- Worklet: Reihen-Feld `lb` (Raum A im Kern, Raum M je Timbre), Rampe 3 ms für stetige Werte (Ziel genau `r` Samples nach dem
  Ereignis), stufige springen; Klasse n wirkt ab der nächsten Note; Klasse r (LFO-Tempo) über eine Kern-Sicht; Mod-Tiefen über die
  Route (eine einmalige Zuordnung `lkMd`, nur wenn eine solche Reihe da ist). Nach einem Reihen-Schritt werden nur die geänderten Plätze
  nachgerechnet (`lkApply`, `deriveB`).
- Spur-Werte `fx.vol fx.pan fx.rev fx.dly fx.chorus.*` nativ an der Spur-Kette (τ 1 ms, Worklet- und native Spur gleich), `fx.pump` beim
  nächsten Kick; Pad-Werte `drum.<Pad>.*` je Schlag am Schritt des Schlags (L6 mit Mikro-Timing `m`), Noten-Lock gewinnt.
- **Ende**: Clip-Wechsel, ■, rückwirkendes Umschalten → Typ 12, danach die Grundwerte (`lnEnd`).

### Schritt 4 — Leistung (Messung und Umbau)
- Kern-Werte in der Klasse `LkD` (wie die eigenen Werte einer Stimme): eine Objektform im heißen Code, keine Verlangsamung mehr für
  ungelockte Stimmen, nachdem einmal eine gelockte lief. Ohne Locks unverändert bitgleich.
- MK: feste Überlagerung je Stimme (`lkOvM`, 20 Zahlen) statt Schlüssel-Schleife je Block; eigene Hüllkurven mit derselben Form.
- Reihen auf VA-Werte über die Kern-Sicht `PR`/`Dc` (eine Rechnung je Schritt für alle ungelockten Stimmen), Rampen-Liste,
  Mod-Tiefen-Rampen schreiben nur den Platz; `deriveB` rechnet nur, was der Platz braucht.

### Schritt 5 — Verlauf, Formate
- Verlauf (VC2a): `need` ist abgeleitet (Baustein N) und zählt nicht als Bearbeitung (`HIST.volatile`); `historyCheck()` = true nach allen
  Lock-Aktionen.
- Anschlag-Leiste: in flachen Leisten (Querformat, 428 × 650) reicht die Trefferfläche von ◀ VEL ▶ jetzt auf ≥ 44 px (vorher 40 px).

### Messwerte (alle Tests: `tests/`)
| Test | Ergebnis |
|---|---|
| `r28-render.mjs` (I2-04, N8-01) | 63/63 deterministische Werksklänge (VA, FM, FELD, MK) bitgleich zu 4.30.0 (`f-nass-quietsch` ist schon in 4.30.0 zufällig: S&H) |
| `r28-msg.mjs` (M-MSG) | Demo ▶ 2,5 s: 68 Ereignisse an die Worklets byte-gleich, kein Typ 11/12, kein Note-an mit Paaren, übrige Nachrichten gleich |
| `i2b-abnahme.mjs` | 30/30: 19 Pfade (VA, FM DX, FELD, MK) – Lock = Klang mit diesem Grundwert (bitgleich bzw. ≤ −130 dB), Nachbarnoten bitgleich; I2-07 Cutoff 2004,6 Hz (Soll 2000 ± 0,5 %); I2-08 41 Zahlen, lkBad 0 / 2; I2-09 a; I2-11; I2-13 4,67 ms; I2-14; I2-15; I2-16; I2-17; I2-64 |
| `i2c-abnahme.mjs` | 10/10: I2-19 Polymeter 12/16; I2-20 0,002 Samples; I2-22 43 % (200 Durchläufe), Fenster egal; I2-23 31,25 ms; I2-24 3,00 ms; I2-25; I2-27; I2-65; I2-66 |
| `i2-cpu-node.mjs` (I2-18, I2-26) | Mechanik +0,5 … +5,7 % im Mittel; Stufen/FM/FELD in der Grenze, VA/MK/Reihen-Schranke knapp darüber (Tabelle in STATUS.md); Heap ✓ |
| `i2-video.mjs` | Video-Ton und Instrumental spielen Lock und Reihe; VV3 zeigt den Lock |
| `i2a/i2a-abnahme.mjs` | 37/37 (I2-01, 02, 03, 04 Daten gegen 4.30.0 61/61, 05 mit `historyCheck`, 06, 61) |
| `i2f/*` | I2-47 8/8, I2-48 12/12, I2-50 26/26, I2-52 30/30 (+ 428 × 650), A/B 12/12; I2-49 16/17 (s. STATUS) |
| `bau/tests/smoke.mjs`, `orch-mk-check.mjs` | grün, gleich wie 4.30.0; `v3-mk2-wellen.mjs` „OFFEN – Bezug am Bau-Ort fehlt“ wie bei 4.30.0 |

Größe: 4 665 281 → 4 777 146 Byte (+109 KB roh, **+35 KB gzip**); davon I2a +41 KB, I2f +16 KB, I2b/I2c ≈ +52 KB (Platz-Listen im
Worklet 8 KB, Kommentare). Budget I2b + I2c +26 KB roh: überschritten, gzip im Rahmen der Summe.

### Fragen an Xander (Vorgaben gelten, Teil D)
- Frage 5 (FM-Sequencer): Vorgabe – Reihen im gewohnten Sequencer mit Länge, Chance, Ratsche (so gebaut).
- Frage 6 (Anschlag farbig): Vorgabe – Füllhöhe in Spurfarbe, Taste der Klaviatur zeigt sie mit (I2f, so gebaut).
- Frage 7 (Super-Regler und Locks): Vorgabe „mitgehen“ – betrifft I1, hier vorbereitet (`Lock_k`).
- Frage 10 (Spur-Werte): Vorgabe – nur als freie Reihe; `fx.*` als Noten-Lock abgewiesen.
- F8 (Grenzen): 8 Locks je Note, 8 Reihen je Clip, Ratsche wechselt Wert/Grundwert (so gebaut).
- Aus I2a offen: FELD-„Kantentiefe“ gibt es in den Daten nicht – Vorgabe: entfällt (Ausnahme).

### Bitte prüfen (Xander, iPhone)
1. ROLLE → ⇕ wählen → Note hoch/runter ziehen: siehst du die Füllhöhe, hörst du die Note sofort? ◀ ▶ durchgehen (auch im LAUF).
2. Ein altes Projekt öffnen, abspielen, speichern, wieder öffnen → klingt und sieht alles aus wie in 4.30.0?
3. Querformat und Tastatur offen (flaches Fenster): ◀ VEL ▶ gut zu treffen?
