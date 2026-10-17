# R7 – Vorbild Cold-Retro: Cold Wave/Minimal Wave (Kas Product, Martin Dupont, Trisomie 21, Asylum Party, Linea Aspera, Lebanon Hanover, Boy Harsher, Molchat Doma; Prüfung Clan of Xymox, Kirlian Camera) und Retrowave (College, Electric Youth, Dance With the Dead; Belegprüfung der vorhandenen Retro-Acts) + Diktat „Lause Bass“

**Stand:** 17.10.2026 · Auftrag R7 „cold-retro“ (Rollenvorbild-Cluster). Xanders Wunsch: „alle Pioniere des Synthiepop … und die modernen Vertreter von Dark Wave, EBM, Industrial, Cold Wave, Retrowave – alles, was mit Synthesizern zu tun hat … alle signifikanten Signature-Sounds“.
**Abgrenzung (vorher gelesen):** `vorbild-pop.md`, `vorbild-szene.md` (Kirlian Camera SZ-15…18), `vorbild-dark.md` (Clan of Xymox DK-05…08, Chorus-Saitenbass DK-07), `vorbild-retro.md` (The Midnight, FM-84, Timecop1983, Gunship, Kavinsky, Carpenter Brut, Perturbator, Mitch Murder, Michael Oakley, Lazerhawk, Com Truise, Le Matos – **damals ohne Web-Recherche**), `vorbild-helden.md`, `vorbild-coldwave2.md` (Sixth June, De/Vision, Agonoize, Diktat §4), `vorbild-pioniere.md` (Format), `r8/studio-setups.md`, `r6/bibliothek-recherche.md`, `SYNQUENZER-vision.md`, `transposition-lage.md` (§3.3, §3.5, §3.7, §5). Nichts davon wird wiederholt; wo ein vorhandener Sound den Kennklang schon trifft, gibt es **keinen** neuen Sound, sondern nur eine Hörprobe dafür.
**Werkzeuge und Grenzen:**
- WebFetch ging nicht (`getaddrinfo ENOTFOUND musicradar.com`, 17.10.2026, gemessen). **Alle Web-Fakten stammen aus Suchauszügen (WebSearch, 33 Abfragen).** Keine Seite ist im Volltext gelesen. Kennzeichen „(SE)“.
- Hörproben per Skript erzeugt und geprüft: `r7/cold-retro-work/aud.mjs` → `aud-report.txt` (Lage im Prüfbereich, keine direkt wiederholten Takte, keine Note über die Taktgrenze, Dauer). Ergebnis: **25 Proben, 0 Fehler.** Das Skript füllt die Blöcke in diese Datei (`skeleton.md` → diese Datei). Gerüst und Prüfung sind aus `pioniere-work/aud.mjs` übernommen.
- **Nichts ist angehört, nichts gemessen.** Rezepte sind Startwerte. Pegel (`level`, FM `gain`) fehlen bewusst und werden auf −18 LUFS kalibriert (Spec v2 §11.1).

**Kennzeichen** (wie `vorbild-pioniere.md`)
- **BELEGT**: Eine namhafte Quelle (Wikipedia, Fachpresse, Interview mit dem Musiker, Bandangabe) sagt es ausdrücklich. Grundlage ist der Suchauszug.
- **WAHRSCHEINLICH**: nur eine schwache Quelle (Händler, Fan-Wiki, Equipboard, Pressetext) oder Quellen widersprechen sich.
- **UNBELEGT**: nichts gefunden; eigene Einschätzung (eK). Kommt nie als Fakt in einen ⓘ-Text.

---

## 0. Kurzfazit

- **13 Acts bearbeitet** (8 Cold Wave/Minimal Wave/Darkwave, 3 Retrowave neu, 2 Retro-Lücken) und **2 Acts nur geprüft** (Clan of Xymox, Kirlian Camera: neue Fakten, keine neuen Sounds). Dazu **Belegprüfung für 10 Retro-Acts** aus `vorbild-retro.md`, die dort ohne Web-Recherche standen (§4).
- **25 Hörproben** (alle eigene Melodien, „kurz“ ≤ 8 s, „ganz“ ≤ 16 s):
  - **18 neue Sounds** mit Rezept: VA 12, FM6 1, WT 1, Drum-Synth 4 (Tabelle §5).
  - **7 Hörproben für vorhandene Sounds**: Werk „PWM-Fläche“ (Martin Dupont), C2-03 „Grauschleier-Fläche“ (Trisomie 21), Werk „Ensemble-Streicher“ (Asylum Party), DK-07 „Chorus-Saitenbass“ (Lebanon Hanover), Werk „Moog-Bass“ (Molchat Doma), Werk „Juno-Pad“ (College), Werk „Glas-Pluck“ (Electric Youth).
- **Am besten belegt (neu):**
  - **Molchat Doma:** **Yamaha DX7** und **Minimoog** BELEGT (MusicRadar + American Songwriter, DX7 zusätzlich Roland); für das Album „Monument“ nennt Komogortsev DX7, Minimoog, **Juno-106** und Lel 0041 (Juno-106 WAHRSCHEINLICH, eine Quelle). Die übrige MusicRadar-Studioliste (D-50, W-30, Alpha Juno-2, Jupiter-X, TB-03 …) nur WAHRSCHEINLICH (eine Quelle, nicht reproduziert). FL Studio 10 BELEGT (Überschrift). Keine Live-Drums, Rhythmen aus Maschinen.
  - **Boy Harsher:** Bandeigene Liste: Roland **MC-505** „workhorse“ von „Lesser Man“, MPC1000; geliehener Juno-106 laut Vice (Widerspruch zur Bandliste → WAHRSCHEINLICH).
  - **Linea Aspera:** Roland SH-09, Juno-6, Vermona DRM MkIII, Korg Poly-800, Analogue Solutions Semblance (Händlertext zur LP „Preservation Bias“ → WAHRSCHEINLICH).
  - **Kas Product:** Korg **MS-20** für die Melodie von „Never Come Back“; Spatsz = Elektronik und Rhythmusmaschinen.
  - **Retro-Lücken:** Kavinsky – „Teddy Boy“ komplett auf **Yamaha DX7** (Interview-Angabe, WAHRSCHEINLICH); Michael Oakley – **Ensoniq VFX, TS10, MR Rack, Yamaha SY85** (Interview-Auszug, WAHRSCHEINLICH: eine Quelle, nicht reproduziert); Carpenter Brut – Ableton Live, Arturia/Korg-Plug-ins, DSI Pro 2, Prophet-6, OB-6 (Interview 2018); Timecop1983 – eigene Geräteliste (Reverb-Machine-Zitat).
- **Gar nicht belegt (Geräte):** Martin Dupont, Trisomie 21 (nur „Atari, Tonbandgeräte mit Echo“), Asylum Party, Lebanon Hanover, College, Electric Youth (nur „Vintage-Sammlung, ~80 % der analogen Klänge“), Dance With the Dead, FM-84, Lazerhawk, Mitch Murder (nur Tracker Renoise). Rezepte dort = **Stil-Entwürfe** (eK), im ⓘ so gekennzeichnet.
- **Diktat „den Lause Bass … bei Ben V VIZE und Tiger und Centuries“ (§6):** neuer, **belegter** Kandidat: **„Brother Louie“ (2020) von VIZE × Imanbek × Dieter Bohlen feat. Leony**, Slap-House-Neufassung des Modern-Talking-Hits von 1986 (BELEGT, 4 Quellen). Damit stehen drei der diktierten Wörter in einer echten Titelzeile: **VIZE**, „Ben V“ ≈ Iman**bek**, „Tiger“ ≈ **Dieter**. Die Lautdeutung selbst ist UNBELEGT. „Centuries/Zyntherius“ bleibt ungelöst. Rückfrage §6.3. „Laserbass“, „VNV“, „Tigers & Centuries“: **kein Beleg**.
- **Für einige Kennklänge fehlt der App ein Baustein** (§7): Gitarre (Asylum Party, Lebanon Hanover, Dance With the Dead, Molchat Doma), Bandecho-Sättigung (Trisomie 21), Hochpass vor dem Tiefpass (MS-20, Kas Product), Sampler-Grit/Bitreduktion (Boy Harsher MPC/MC-505), Pitch-EG im FM6 (`r8/fm-diagnose.md` §0).

## 1. Was es schon gibt und was hier neu ist

| Act | Schon vorhanden | Hier |
|---|---|---|
| Kas Product | – | CR-01 Giftzahn-Lead, CR-02 Hetzpuls-Bass (neu) |
| Martin Dupont | – | CR-03 Hörprobe Werk „PWM-Fläche“, CR-04 Salonbass 84 (neu) |
| Trisomie 21 | – | CR-05 Bandecho-Sequenz (neu), CR-06 Hörprobe C2-03 „Grauschleier-Fläche“ |
| Asylum Party | – | CR-07 Hörprobe Werk „Ensemble-Streicher“ (Band ist gitarrenlastig; ein Synth-Kennklang ist nicht belegt) |
| Linea Aspera | – | CR-08 Einzelgänger-Bass, CR-09 Dünnglas-Akkord, CR-11 Kaltstahl-Kit (neu) |
| Lebanon Hanover | – | CR-10 Hörprobe DK-07 „Chorus-Saitenbass“ als Melodiebass, CR-12 Trübsal-Kit (neu) |
| Boy Harsher | – | CR-13 Fiebertraum-Bass, CR-14 Schwitzkasten-Kit (neu) |
| Molchat Doma | – | CR-15 Hörprobe Werk „Moog-Bass“, CR-16 Neonröhren-Lead, CR-17 Plattenbau-Kit (neu) |
| Clan of Xymox | `vorbild-dark.md` §5.3 (DK-05…DK-08, Fakten UNBELEGT) | nur Fakten (§2.9); DK-Status bleibt, Gerätefakten jetzt WAHRSCHEINLICH |
| Kirlian Camera | `vorbild-szene.md` §4.5 (SZ-15…18), `vorbild-dark.md` KD-4 | nur Fakten (§2.10); keine Geräte gefunden |
| College | – | CR-18 Heldenpuls-Bass (neu), CR-19 Hörprobe Werk „Juno-Pad“ |
| Electric Youth | – | CR-20 Hörprobe Werk „Glas-Pluck“, CR-21 Innenwelt-Fläche (neu) |
| Dance With the Dead | – (Kit: Verweis auf CB3 „Raserei-Kit“) | CR-22 Gruftgalopp-Bass, CR-23 Sägeblatt-Lead (neu) |
| Kavinsky | `vorbild-retro.md` KV1, KV2 (VA) | **Lücke DX7:** CR-24 Chromfelgen-Lead FM (neu) |
| Michael Oakley | `vorbild-retro.md` MO1, MO2 | **Lücke Ensoniq/SY85:** CR-25 Transwellen-Fläche (WT, neu) |
| The Midnight, FM-84, Timecop1983, Gunship, Carpenter Brut, Perturbator, Mitch Murder, Lazerhawk | `vorbild-retro.md` | nur Belegprüfung (§4), keine neuen Sounds |

**IDs:** Alle Sounds dieser Datei heißen **CR-nn**, damit sie nicht mit MO1–MO3 (Moroder in `vorbild-pioniere.md` **und** Michael Oakley in `vorbild-retro.md`, schon doppelt vergeben) oder LH1/LH2 (Lazerhawk) kollidieren.

## 2. Rechtliche Linie, Format, Akkord-Reaktion

- **Recht:** wie `vorbild-helden.md` §1, `vorbild-coldwave2.md` §1 (kein Rechtsrat). Klang, Gerätetyp, Rhythmusgefühl und Allerwelts-Akkordfolgen sind frei; die konkrete Melodie bzw. das Riff eines Titels nicht (§ 23 UrhG, hinreichender Abstand). **Keine Hörprobe hier zitiert eine Melodie** von „Never Come Back“, „So Young But So Cold“, „The Last Song“, „Sudno“, „A Real Hero“, „Nightcall“, „Brother Louie“ oder anderen Titeln. Ein automatischer Abgleich mit Originalnoten war nicht möglich; vor V10d hört ein Mensch gegen (V10d-05, Vermerk „eigene Melodie“).
- **Format** (wie `vorbild-pioniere.md` §2): `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in 16teln ab Takt 1, Anschlag 1–127. Darunter `aud-Daten` im Spec-Format `[Schlag, Dauer, MIDI, v]` mit **v = Anschlag/127 (0–1)**. „kurz“ ≤ 8 s, „ganz“ ≤ 16 s; passen nicht alle Takte in „kurz“, gelten die ersten n − 1 Takte plus der letzte (die Wendung bleibt hörbar). Drums als Schritt-Zeilen je Pad (Pad-Namen aus `DrumKits.SLOTS`).
- **Rezept-Schreibweise:** VA flach wie Werk-Sounds in V0a (`o1w` 0 Säge, 1 Puls, 2 Dreieck, 3 Sinus; `ftype` 0 LP24, 1 LP12, 2 BP24, 3 BP12, 4 HP24, 5 HP12; Modulation `M(quelle, ziel, menge)`), FM6 mit `OP(coarse, ol, [R1..R4], [L1..L4], {…})` wie V0a Z. 5840, WT wie `WT_FACTORY` (V0a Z. 7861: `wt: {table, pos, scan, scanTime}`), Drum-Synth mit den Schicht-Schlüsseln aus Spec v2 Anhang A.3.
- **Lage und Akkord-Reaktion** (Wunsch T, `transposition-lage.md` §3.7, §5): `sound.lage` = **Grundton-Bereich** (oft einseitig); Oktav-Riffs über dem Grundton dürfen mit. `sound.dirAt` = feste Richtung bei einem Akkord-Grundton. „nächstliegend“ = keine Voreinstellung, die Auto-Regel entscheidet (Bass bei Gleichstand abwärts, Sequenz/Lead aufwärts). Jede Grenze ist an der eigenen Hörprobe geprüft (`aud-report.txt`).

---

## 3. Cold Wave, Minimal Wave, Darkwave

### 3.1 Kas Product (`vorbild: kas-product`, neu, „b Gerät für einen Titel, u Patch“)

| Fakt | Status | Quelle |
|---|---|---|
| Französisches Duo, 1980 in Nancy gegründet; **Spatsz** (Daniel Favre) Elektronik und Rhythmusmaschinen, **Mona Soyoc** Gesang und Gitarre | BELEGT (SE, 2 Quellen) | https://beursschouwburg.be/en/events/kas-product-support/ · https://en.wikipedia.org/wiki/Try_Out_(Kas_Product_album) |
| „Never Come Back“: Spatsz spielt eine „sinister synth melody“ auf einem **Korg MS-20** | WAHRSCHEINLICH (SE, eine Quelle, Blog) | https://www.systemsofromance.com/blog/category/1982/page/9 |
| Erste EPs mit bescheidener Ausstattung: frühes Tonband, Synth und Drumcomputer | WAHRSCHEINLICH (SE) | https://www.systemsofromance.com/blog/category/1982/page/9 |
| Debüt „Try Out“ (RCA, 1982), aufgenommen August 1981 im Sunrise Studio; Credits: Soyoc Gesang/Gitarre/Produktion, Spatsz „electronics“ | BELEGT (SE) | https://en.wikipedia.org/wiki/Try_Out_(Kas_Product_album) |
| AllMusic (Ned Raggett): Spatsz’ Elektronik „brisk, bass-heavy“, baut „quick, sudden hysteria“ auf; „So Young But So Cold“ mit „downright evil noise“ der Gitarre | BELEGT als Rezension (SE, Spiegelseite) | https://xiapi.quotsoft.net/album/mb/mbZVJe92280 |
| Interesse an „classic analog synthetics and abrasive textures“; Stil „tense, abrasive, synth-driven“ | WAHRSCHEINLICH (SE) | https://post-punk.com/spatsz-from-french-coldwave-duo-kas-product-has-passed-away/ · https://postpunkmonk.com/2016/11/17/record-review-kas-product-by-pass-dlx-rm/ |
| Spatsz ist mit 61 Jahren gestorben | WAHRSCHEINLICH (eine Quelle) – **nicht in den ⓘ-Text** | https://post-punk.com/spatsz-from-french-coldwave-duo-kas-product-has-passed-away/ |
| Modell der Rhythmusmaschine | **UNBELEGT** (nichts gefunden) | – |

**Typisch:** knappe, schnelle, basslastige Elektronik; aggressive, resonante Synth-Melodie; Gitarren-Lärm darüber (nicht nachbaubar, §7).

#### CR-01 „Giftzahn-Lead“ – Rolle Lead/Riff · VA (neu)

- **Vorbild (ⓘ):** „unheimliche Synth-Melodie auf einem Korg-MS-20-artigen Monosynth“ (Gerät WAHRSCHEINLICH, Rezept UNBELEGT). **Im Sound-Namen kein Gerätename (E9).**
- **Rezept:** `o1w 0, o2w 1, o2pw .25, o2fine 9, o2lvl .5, ftype 1, cutoff 1600, res .62, drive .55, kt .5, fenv .45, fvel .4, fA .002, fD .25, fS .35, fR .15, aA .003, aD .4, aS .85, aR .12, ampVel .35, mode 2, poly 1, glide .02, l1shape 1, l1rate 6, analog .25, spread 0` · Route `M('lfo1','cutoff', .03)` · fx `{drive .3, rev .18, dly .15}` · bus `{echo:{mode:'mono', divL:'1/8', fb .25}}`
- **Warum so:** Das MS-20-Filter „kreischt“, wenn es übersteuert und weit in die Resonanz gedreht wird (eK, UNBELEGT). LP12 + Resonanz 62 % + Filter-Drive 55 % kommt dem nahe; das schnelle LFO-Flattern am Cutoff gibt die Unruhe. Der echte MS-20 hat Hochpass **und** Tiefpass hintereinander – fehlt (§7).
- **Abgrenzung:** Werk „Mini-Lead“ (LP24, Res 38 %, rund), „Sync-Lead“ (Sync), CB2 „Höllenfahrt-Lead“ (Darksynth, Spur-Drive): hier LP12 mit sehr hoher Resonanz + Flattern = giftig-nasal.
- **Lage / Rolle:** Probe A♭4–F5 (68–77), am besten G4–C6. **Grenze tief G4.** **Akkord-Reaktion:** Lead-Regel (darf steigen), keine Voreinstellung.
- **Hörprobe** (a-Moll mit phrygischem B♭ als Gift-Ton; Takt 4 E-Dur mit G♯ als Wendung):
```
Tempo 138 BPM · 4 Takte · Akkorde: Am | Am | F | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 0/3/100 · A4(69) 3/1/78 · C5(72) 4/2/92 · B4(71) 6/2/86 · Bb4(70) 8/4/104 · A4(69) 12/4/88
T2: E5(76) 16/2/104 · D5(74) 18/2/88 · C5(72) 20/2/90 · B4(71) 22/2/84 · C5(72) 24/6/98 · A4(69) 30/2/80
T3: F5(77) 32/4/108 · E5(76) 36/2/90 · C5(72) 38/2/86 · A4(69) 40/4/92 · C5(72) 44/2/86 · D5(74) 46/2/90
T4: E5(76) 48/2/100 · F5(77) 50/2/104 · E5(76) 52/2/94 · Eb5(75) 54/2/96 · E5(76) 56/4/108 · B4(71) 60/2/88 · Ab4(68) 62/2/92
```
Dauer: alle 4 Takte 7,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,0 s · Lage der Probe Ab4–F5 (68–77)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.75,69,0.79],[0.75,0.25,69,0.61],[1,0.5,72,0.72],[1.5,0.5,71,0.68],[2,1,70,0.82],[3,1,69,0.69],[4,0.5,76,0.82],[4.5,0.5,74,0.69],[5,0.5,72,0.71],[5.5,0.5,71,0.66],[6,1.5,72,0.77],[7.5,0.5,69,0.63],[8,1,77,0.85],[9,0.5,76,0.71],[9.5,0.5,72,0.68],[10,1,69,0.72],[11,0.5,72,0.68],[11.5,0.5,74,0.71],[12,0.5,76,0.79],[12.5,0.5,77,0.82],[13,0.5,76,0.74],[13.5,0.5,75,0.76],[14,1,76,0.85],[15,0.5,71,0.69],[15.5,0.5,68,0.72]]`
- **Karte:** „Kreischend-nasale Monosynth-Melodie mit flackerndem Filter – erinnert an französische Cold Wave der frühen 80er (Stil Kas Product).“

#### CR-02 „Hetzpuls-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** „knappe, basslastige Elektronik“ (Rezension BELEGT); Klang UNBELEGT.
- **Rezept:** `o1w 0, o2w 0, o2sync 1, o2semi 7, o2lvl .6, o3w 1, o3oct -1, o3lvl .35, ftype 1, cutoff 900, res .35, drive .6, kt .4, fenv .45, fvel .35, fA .001, fD .1, fS .1, fR .06, aA .001, aD .22, aS .55, aR .04, ampVel .45, mode 1, poly 1, reset 1, analog .12, spread 0` · Routen `M('fenv','o2pitch', .25)`, `M('vel','cutoff', .05)` · fx `{drive .2, rev .04}`
- **Warum so:** Oszillator 2 im Sync, von der Filter-Hüllkurve kurz hochgezogen = ein rauer „Zapp“ auf jeder 16tel. Das ist die „Hysterie“, ohne dass der Bass dünn wird (Puls −1 Okt trägt).
- **Abgrenzung:** C2-01 „Kaltfront-Bass“ (glatt, LP24, Achtel), Werk „Synthpop-Bass“ (Puls-Oktave): hier **Sync-Bass** mit Zapp, 16tel.
- **Lage / Rolle:** Probe B1–E3 (35–52). **Grundton-Bereich A1–F♯2**, Oktave darüber darf mit. **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (e-Moll, i–i–VI–V, Takt 4 H-Dur mit D♯ und Chromatik C♯–H als Wendung):
```
Tempo 138 BPM · 4 Takte · Akkorde: Em | Em | C | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/1/108 · E2(40) 1/1/78 · E3(52) 2/1/90 · E2(40) 3/1/78 · E2(40) 4/1/108 · G2(43) 5/1/78 · E2(40) 6/1/90 · B2(47) 7/1/78 · E2(40) 8/1/104 · E2(40) 9/1/78 · E3(52) 10/1/90 · E2(40) 11/1/78 · D3(50) 12/1/108 · E2(40) 13/1/78 · B2(47) 14/1/90 · G2(43) 15/1/78
T2: E2(40) 16/1/108 · E2(40) 18/1/90 · E3(52) 19/1/78 · E2(40) 20/1/108 · G2(43) 22/1/90 · A2(45) 23/1/78 · E2(40) 24/1/104 · E2(40) 26/1/90 · E3(52) 27/1/78 · F#2(42) 28/1/108 · G2(43) 29/1/78 · A2(45) 30/1/90 · B2(47) 31/1/78
T3: C2(36) 32/1/108 · C2(36) 33/1/78 · C3(48) 34/1/90 · C2(36) 35/1/78 · C2(36) 36/1/108 · E2(40) 37/1/78 · C2(36) 38/1/90 · G2(43) 39/1/78 · C2(36) 40/1/104 · C2(36) 41/1/78 · C3(48) 42/1/90 · C2(36) 43/1/78 · B2(47) 44/1/108 · C2(36) 45/1/78 · G2(43) 46/1/90 · E2(40) 47/1/78
T4: B1(35) 48/1/114 · B1(35) 49/1/84 · B2(47) 50/1/96 · B1(35) 51/1/84 · B1(35) 52/1/114 · Eb2(39) 53/1/84 · F#2(42) 54/1/96 · B1(35) 55/1/84 · B1(35) 56/1/110 · B2(47) 57/1/84 · A2(45) 58/1/96 · B1(35) 59/1/84 · F#2(42) 60/1/114 · Eb2(39) 61/1/84 · C#2(37) 62/1/96 · B1(35) 63/1/84
```
Dauer: alle 4 Takte 7,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,0 s · Lage der Probe B1–E3 (35–52)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,40,0.85],[0.25,0.25,40,0.61],[0.5,0.25,52,0.71],[0.75,0.25,40,0.61],[1,0.25,40,0.85],[1.25,0.25,43,0.61],[1.5,0.25,40,0.71],[1.75,0.25,47,0.61],[2,0.25,40,0.82],[2.25,0.25,40,0.61],[2.5,0.25,52,0.71],[2.75,0.25,40,0.61],[3,0.25,50,0.85],[3.25,0.25,40,0.61],[3.5,0.25,47,0.71],[3.75,0.25,43,0.61],[4,0.25,40,0.85],[4.5,0.25,40,0.71],[4.75,0.25,52,0.61],[5,0.25,40,0.85],[5.5,0.25,43,0.71],[5.75,0.25,45,0.61],[6,0.25,40,0.82],[6.5,0.25,40,0.71],[6.75,0.25,52,0.61],[7,0.25,42,0.85],[7.25,0.25,43,0.61],[7.5,0.25,45,0.71],[7.75,0.25,47,0.61],[8,0.25,36,0.85],[8.25,0.25,36,0.61],[8.5,0.25,48,0.71],[8.75,0.25,36,0.61],[9,0.25,36,0.85],[9.25,0.25,40,0.61],[9.5,0.25,36,0.71],[9.75,0.25,43,0.61],[10,0.25,36,0.82],[10.25,0.25,36,0.61],[10.5,0.25,48,0.71],[10.75,0.25,36,0.61],[11,0.25,47,0.85],[11.25,0.25,36,0.61],[11.5,0.25,43,0.71],[11.75,0.25,40,0.61],[12,0.25,35,0.9],[12.25,0.25,35,0.66],[12.5,0.25,47,0.76],[12.75,0.25,35,0.66],[13,0.25,35,0.9],[13.25,0.25,39,0.66],[13.5,0.25,42,0.76],[13.75,0.25,35,0.66],[14,0.25,35,0.87],[14.25,0.25,47,0.66],[14.5,0.25,45,0.76],[14.75,0.25,35,0.66],[15,0.25,42,0.9],[15.25,0.25,39,0.66],[15.5,0.25,37,0.76],[15.75,0.25,35,0.66]]`
- **Karte:** „Gehetzter 16tel-Bass mit rauem Sync-Biss – erinnert an französische Cold Wave (Stil Kas Product).“

### 3.2 Martin Dupont (`vorbild: martin-dupont`, neu, „u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Französische Electro-/New-Wave-/Cold-Wave-Band, 1980 in Marseille gegründet; **Alain Seghir** Gründer und Hauptsongschreiber (Gesang, Bass, Synthesizer, Gitarre) | BELEGT (SE) | https://en.wikipedia.org/wiki/Martin_Dupont |
| Drei Alben: „Just Because (Facteurs d’Ambiance)“ (1984), „Sleep Is A Luxury“, „Hot Paradox“ | BELEGT (SE) | https://en.wikipedia.org/wiki/Martin_Dupont · https://www.minimalwave.com/releases/release/hot-paradox |
| Klang teils durch das **Heimstudio** geprägt, in dem sie aufnahmen | WAHRSCHEINLICH (SE, Label-Text zur Neuauflage) | https://www.minimalwave.com/releases/release/hot-paradox |
| Seghir lieh der Band Corps Diplomatique Synthesizer (ohne Modelle) | WAHRSCHEINLICH (SE) | https://corpsdiplomatique.bandcamp.com |
| Synth- und Drumcomputer-Modelle | **UNBELEGT** | – |

**Typisch (eK):** elegantere, „salonhafte“ Cold Wave: weiche Flächen, melodischer Bass mit Chorus, Heimstudio-Wärme.

#### CR-03 Hörprobe für Werk „PWM-Fläche“ – Rolle Fläche · VA (V0a Z. 5759)

- **Rezept:** Werk unverändert (zwei Pulse 50 %/30 %, langsame PWM, LFO 2 auf Cutoff).
- **Vorbild (ⓘ):** Stil-Entwurf (Geräte UNBELEGT). Werks-Text bleibt.
- **Lage / Rolle:** Probe G♯3–A4 (56–69). **Grenze G♯3–A4 (eng), Fläche-Regel** (Stimmführung). **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (fis-Moll, i–VI–III–VII mit E7 als Wendung; eine wandernde Zusatzstimme je Takt):
```
Tempo 112 BPM · 4 Takte · Akkorde: F#m | D | A | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/16/72 · C#4(61) 0/16/72 · F#4(66) 0/16/72 · E4(64) 8/8/58
T2: A3(57) 16/16/72 · D4(62) 16/16/72 · F#4(66) 16/16/72 · A4(69) 24/8/60
T3: A3(57) 32/16/72 · C#4(61) 32/16/72 · E4(64) 32/16/72 · F#4(66) 40/8/58
T4: Ab3(56) 48/8/74 · B3(59) 48/8/74 · E4(64) 48/8/74 · Ab3(56) 56/8/78 · B3(59) 56/8/78 · D4(62) 56/8/78
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s · Lage der Probe Ab3–A4 (56–69)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,57,0.57],[0,4,61,0.57],[0,4,66,0.57],[2,2,64,0.46],[4,4,57,0.57],[4,4,62,0.57],[4,4,66,0.57],[6,2,69,0.47],[8,2,56,0.58],[8,2,59,0.58],[8,2,64,0.58],[10,2,56,0.61],[10,2,59,0.61],[10,2,62,0.61]]`
aud-Daten ganz (`len 4`): `[[0,4,57,0.57],[0,4,61,0.57],[0,4,66,0.57],[2,2,64,0.46],[4,4,57,0.57],[4,4,62,0.57],[4,4,66,0.57],[6,2,69,0.47],[8,4,57,0.57],[8,4,61,0.57],[8,4,64,0.57],[10,2,66,0.46],[12,2,56,0.58],[12,2,59,0.58],[12,2,64,0.58],[14,2,56,0.61],[14,2,59,0.61],[14,2,62,0.61]]`
- **Karte:** „Schwebende Puls-Fläche mit wandernder Oberstimme – erinnert an Marseiller Cold Wave der 80er (Stil Martin Dupont).“

#### CR-04 „Salonbass 84“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Stil-Entwurf; Seghir spielte Bass **und** Synthesizer (BELEGT), welcher Bass auf welchem Titel: UNBELEGT.
- **Rezept:** `o1w 0, o2w 2, o2oct 1, o2fine 0, o2lvl .3, ftype 1, cutoff 700, res .18, drive .2, kt .45, fenv .35, fvel .3, fA .001, fD .2, fS .25, fR .1, aA .002, aD .4, aS .7, aR .08, ampVel .5, mode 1, poly 1, analog .15, spread 0` · fx `{chorus:{mode:'I', mix .5}, rev .1}`
- **Warum so:** Melodischer, weicher Synthbass mit Chorus I, LP12 → rund statt knackig; Synkopen und Oktavsprünge machen ihn „salonfähig“.
- **Abgrenzung:** DK-07 „Chorus-Saitenbass“ (Rauschen = Anzupfen, Chorus I+II 65 %), Werk „Synthpop-Bass“ (kein Chorus, LP24). Prüfung V10d: Liegt er im Blindhören zu nah an DK-07, entfällt er und DK-07 bekommt diese Hörprobe.
- **Lage / Rolle:** Probe A1–F♯3 (33–54). **Grundton-Bereich A1–F♯2**, Oktave darüber darf mit. **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (fis-Moll, Synkope auf der 3. Achtel, Oktav-Antwort):
```
Tempo 112 BPM · 4 Takte · Akkorde: F#m | D | A | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F#2(42) 0/2/100 · F#2(42) 2/2/84 · F#3(54) 6/2/84 · E3(52) 8/2/100 · C#3(49) 12/2/100 · A2(45) 14/2/84
T2: D2(38) 16/2/100 · D2(38) 18/2/84 · D3(50) 22/2/84 · C#3(49) 24/2/100 · A2(45) 28/2/100 · F#2(42) 30/2/84
T3: A1(33) 32/2/100 · A1(33) 34/2/84 · A2(45) 38/2/84 · Ab2(44) 40/2/100 · E2(40) 44/2/100 · C#2(37) 46/2/84
T4: E2(40) 48/2/106 · E2(40) 50/2/90 · E3(52) 54/2/90 · D3(50) 56/2/106 · B2(47) 58/2/90 · Ab2(44) 60/2/106 · E2(40) 62/2/90
```
Dauer: alle 4 Takte 8,6 s · kurz (≤ 8 s) T1, T2, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,6 s · Lage der Probe A1–F#3 (33–54)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,42,0.79],[0.5,0.5,42,0.66],[1.5,0.5,54,0.66],[2,0.5,52,0.79],[3,0.5,49,0.79],[3.5,0.5,45,0.66],[4,0.5,38,0.79],[4.5,0.5,38,0.66],[5.5,0.5,50,0.66],[6,0.5,49,0.79],[7,0.5,45,0.79],[7.5,0.5,42,0.66],[8,0.5,40,0.83],[8.5,0.5,40,0.71],[9.5,0.5,52,0.71],[10,0.5,50,0.83],[10.5,0.5,47,0.71],[11,0.5,44,0.83],[11.5,0.5,40,0.71]]`
aud-Daten ganz (`len 4`): `[[0,0.5,42,0.79],[0.5,0.5,42,0.66],[1.5,0.5,54,0.66],[2,0.5,52,0.79],[3,0.5,49,0.79],[3.5,0.5,45,0.66],[4,0.5,38,0.79],[4.5,0.5,38,0.66],[5.5,0.5,50,0.66],[6,0.5,49,0.79],[7,0.5,45,0.79],[7.5,0.5,42,0.66],[8,0.5,33,0.79],[8.5,0.5,33,0.66],[9.5,0.5,45,0.66],[10,0.5,44,0.79],[11,0.5,40,0.79],[11.5,0.5,37,0.66],[12,0.5,40,0.83],[12.5,0.5,40,0.71],[13.5,0.5,52,0.71],[14,0.5,50,0.83],[14.5,0.5,47,0.71],[15,0.5,44,0.83],[15.5,0.5,40,0.71]]`
- **Karte:** „Weicher Chorus-Bass mit Synkopen und Oktav-Antworten – erinnert an elegante französische Cold Wave (Stil Martin Dupont).“

### 3.3 Trisomie 21 (`vorbild: trisomie-21`, neu, „w Arbeitsweise, u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Französische Cold-Wave-Gruppe der Brüder **Philippe und Hervé Lomprez**, 1980 in Denain (bei Valenciennes) gegründet; andere Quellen 1981 bzw. Lille | BELEGT Kern (SE), Ort/Jahr uneinig | https://en.wikipedia.org/wiki/Trisomie_21 · https://xiapi.quotsoft.net/artist/xa/XAPc5aeb/ |
| Früh dabei: Keyboarder Jean-Michel Matuszak, Bassist Pascal Tison | WAHRSCHEINLICH (SE) | https://music.apple.com/artist/73782484 |
| Die Brüder bastelten mit allen Maschinen, die sie fanden, u. a. **Atari-Rechnern** und **alten Tonbandgeräten, deren Echo** sie nutzten | WAHRSCHEINLICH (SE, Veranstaltungstext) | https://www.parisbouge.com/events/186889 |
| „Chapter IV“ (1986) nur von den Brüdern, ohne Bassisten, **deutlich elektronischer**; darauf „The Last Song“, ihr größter Hit | BELEGT (SE) | https://www.qobuz.com/be-fr/interpreter/trisomie-21/74979 |
| „The Last Song“ als „letztes Lied vor dem Weltende“ geschrieben, Tanzflächen-Standard | WAHRSCHEINLICH (SE) | https://alcuinfonds.be/blog/trisomie-21-black-label/ |
| Synth- und Drumcomputer-Modelle | **UNBELEGT** | – |

#### CR-05 „Bandecho-Sequenz“ – Rolle Sequenz · VA (neu)

- **Vorbild (ⓘ):** „Echo aus alten Tonbandgeräten“ (WAHRSCHEINLICH); Klang UNBELEGT.
- **Rezept:** `o1w 1, o1pw .3, o2w 2, o2oct 1, o2lvl .3, ftype 1, cutoff 2200, res .2, drive .1, kt .5, fenv .4, fA .001, fD .18, fS 0, fR .15, aA .001, aD .35, aS 0, aR .3, ampVel .5, poly 6, analog .2, l2shape 0, l2rate .6` · Routen `M('lfo2','pitch', .002)`, `M('rnd','pitch', .0015)` · fx `{dly .45, rev .25}` · bus `{echo:{mode:'mono', divL:'1/8.', fb .5, highcut 2500}}`
- **Warum so:** Die Sequenz spielt nur jede zweite 16tel; das dumpfe Echo (Hochschnitt 2,5 kHz, Feedback 50 %) füllt die Lücken wie ein Bandecho. Langsames Leiern (LFO 2 0,6 Hz) + Zufall auf der Tonhöhe = Band-Gleichlauf. Echte Band-Sättigung fehlt (§7).
- **Abgrenzung:** Werk „Glas-Pluck“ (Dreieck/Sinus, sauber), „Pop-Pluck“ (Unisono): hier schmaler Puls + leiernde Tonhöhe + dunkles Echo.
- **Lage / Rolle:** Probe C♯4–F5 (61–77). **Grenze C4–G5**, nächstliegende Oktave. **Akkord-Reaktion:** nächstliegend (Sequenz-Regel).
- **Hörprobe** (d-Moll, i–VI–VII–V; Lücken für das Echo):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Bb | C | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/1/108 · A4(69) 2/1/90 · F4(65) 4/1/108 · D5(74) 6/1/90 · C5(72) 8/1/104 · A4(69) 10/1/90 · F4(65) 12/1/108 · E4(64) 14/1/90
T2: D4(62) 16/1/108 · Bb4(70) 18/1/90 · F4(65) 20/1/108 · D5(74) 22/1/90 · F5(77) 24/1/104 · D5(74) 26/1/90 · Bb4(70) 28/1/108 · F4(65) 30/1/90
T3: E4(64) 32/1/108 · C5(72) 34/1/90 · G4(67) 36/1/108 · E5(76) 38/1/90 · D5(74) 40/1/104 · C5(72) 42/1/90 · G4(67) 44/1/108 · E4(64) 46/1/90 · G4(67) 47/1/78
T4: C#4(61) 48/1/114 · A4(69) 50/1/96 · E4(64) 52/1/114 · C#5(73) 54/1/96 · E5(76) 56/1/110 · A4(69) 58/1/96 · G4(67) 60/1/114 · E4(64) 62/1/96
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe C#4–F5 (61–77)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,62,0.85],[0.5,0.25,69,0.71],[1,0.25,65,0.85],[1.5,0.25,74,0.71],[2,0.25,72,0.82],[2.5,0.25,69,0.71],[3,0.25,65,0.85],[3.5,0.25,64,0.71],[4,0.25,62,0.85],[4.5,0.25,70,0.71],[5,0.25,65,0.85],[5.5,0.25,74,0.71],[6,0.25,77,0.82],[6.5,0.25,74,0.71],[7,0.25,70,0.85],[7.5,0.25,65,0.71],[8,0.25,64,0.85],[8.5,0.25,72,0.71],[9,0.25,67,0.85],[9.5,0.25,76,0.71],[10,0.25,74,0.82],[10.5,0.25,72,0.71],[11,0.25,67,0.85],[11.5,0.25,64,0.71],[11.75,0.25,67,0.61],[12,0.25,61,0.9],[12.5,0.25,69,0.76],[13,0.25,64,0.9],[13.5,0.25,73,0.76],[14,0.25,76,0.87],[14.5,0.25,69,0.76],[15,0.25,67,0.9],[15.5,0.25,64,0.76]]`
- **Karte:** „Lückige Sequenz, deren Bandecho die Pausen füllt – erinnert an nordfranzösische Cold Wave der 80er (Stil Trisomie 21).“

#### CR-06 Hörprobe für C2-03 „Grauschleier-Fläche“ – Rolle Fläche · VA (`vorbild-coldwave2.md` §3.1)

- **Rezept:** C2-03 unverändert. **Kein neuer Sound:** Eine eigene „Weltende-Fläche“ wäre fast gleich (2 Sägen ±9 ct, LP24, Ensemble-Chorus).
- **Vorbild (ⓘ):** Ergänzungs-Tag `trisomie-21` (Stil, UNBELEGT).
- **Lage / Rolle:** Probe C♯4–D5 (61–74). Fläche-Regel, Grenze C4–D5. **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (d-Moll, i–iv–VI–V, Takt 3–4 steigen die Lagen = Weltende-Steigerung):
```
Tempo 120 BPM · 4 Takte · Akkorde: Dm | Gm | Bb | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: D4(62) 0/16/70 · F4(65) 0/16/70 · A4(69) 0/16/70 · C5(72) 8/8/60
T2: D4(62) 16/16/72 · G4(67) 16/16/72 · Bb4(70) 16/16/72
T3: D4(62) 32/8/72 · F4(65) 32/8/72 · Bb4(70) 32/8/72 · F4(65) 40/8/76 · Bb4(70) 40/8/76 · D5(74) 40/8/76
T4: C#4(61) 48/8/76 · E4(64) 48/8/76 · A4(69) 48/8/76 · E4(64) 56/8/82 · A4(69) 56/8/82 · C#5(73) 56/8/82
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe C#4–D5 (61–74)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,62,0.55],[0,4,65,0.55],[0,4,69,0.55],[2,2,72,0.47],[4,4,62,0.57],[4,4,67,0.57],[4,4,70,0.57],[8,2,62,0.57],[8,2,65,0.57],[8,2,70,0.57],[10,2,65,0.6],[10,2,70,0.6],[10,2,74,0.6],[12,2,61,0.6],[12,2,64,0.6],[12,2,69,0.6],[14,2,64,0.65],[14,2,69,0.65],[14,2,73,0.65]]`
- **Karte:** „Graue Streicherfläche, die sich am Ende öffnet – erinnert an elektronische Cold Wave von 1986 (Stil Trisomie 21).“

### 3.4 Asylum Party (`vorbild: asylum-party`, neu, „u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Französische Post-Punk-/Cold-Wave-Gruppe, 1985 in Courbevoie gegründet; Gründer **Philippe Planchon** (Gitarre, Gesang) und **Thierry Sobézyk** (Bass, Gesang); später Keyboarderin **Pascale Macé** | BELEGT (SE) | https://en.wikipedia.org/wiki/Asylum_Party · https://post-punk.com/french-coldwave-masters-asylum-party-receive-deluxe-reissue-treatment-by-cercle-social-records/amp |
| Szene „Touching Pop“ (mit Little Nemo, Mary Goes Round); Presse: „la vague froide“; Klang nah am englischen Post-Punk | BELEGT (SE) | dieselben |
| „Picture One“ (Mini-LP 1988), „Borderline“ (1989), „Mère“ (1990) | BELEGT (SE) | dieselben |
| Sobézyk 2019 gestorben | BELEGT (SE) – nicht in den ⓘ-Text | https://www.post-punk.com/thierry-sobezyk-co-vocalist-and-bassist-of-asylum-party-has-passed-away/ |
| Drumcomputer/Synth-Modelle | **UNBELEGT** | – |
| **Korrektur Auftrag:** Der Bassist heißt Thierry **Sobézyk**, nicht „Sabatier“ (meine erste Suchanfrage) | BELEGT (SE) | dieselben |

**Folge:** Asylum Party ist eine **Gitarren-Band mit Keyboard-Fläche**. Der Synth-Anteil ist Begleitung. Deshalb **kein** neuer Sound, nur eine Hörprobe für die Fläche, die hinter Gitarren sitzt.

#### CR-07 Hörprobe für Werk „Ensemble-Streicher“ – Rolle Fläche · VA (V0a Z. 5743)

- **Rezept:** Werk unverändert (zwei Sägen 8′ + 4′, Ensemble-Chorus).
- **Lage / Rolle:** Probe D4–D5 (62–74), Fläche-Regel, Grenze C4–D5. **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (e-Moll, i–VI–III–VII in halben und ganzen Noten; im Arrangement liegt darunter die Gitarre, die fehlt):
```
Tempo 132 BPM · 4 Takte · Akkorde: Em | C | G | D
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E4(64) 0/8/74 · G4(67) 0/8/74 · B4(71) 0/8/74 · D4(62) 8/8/68 · G4(67) 8/8/68 · B4(71) 8/8/68
T2: E4(64) 16/16/74 · G4(67) 16/16/74 · C5(72) 16/16/74
T3: D4(62) 32/8/72 · G4(67) 32/8/72 · B4(71) 32/8/72 · D4(62) 40/8/76 · G4(67) 40/8/76 · D5(74) 40/8/76
T4: D4(62) 48/12/78 · F#4(66) 48/12/78 · A4(69) 48/12/78 · D4(62) 60/4/70 · F#4(66) 60/4/70 · B4(71) 60/4/70
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe D4–D5 (62–74)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,2,64,0.58],[0,2,67,0.58],[0,2,71,0.58],[2,2,62,0.54],[2,2,67,0.54],[2,2,71,0.54],[4,4,64,0.58],[4,4,67,0.58],[4,4,72,0.58],[8,2,62,0.57],[8,2,67,0.57],[8,2,71,0.57],[10,2,62,0.6],[10,2,67,0.6],[10,2,74,0.6],[12,3,62,0.61],[12,3,66,0.61],[12,3,69,0.61],[15,1,62,0.55],[15,1,66,0.55],[15,1,71,0.55]]`
- **Karte:** „Streicherteppich hinter Gitarren – erinnert an französischen ‚Touching Pop‘ der späten 80er (Stil Asylum Party).“

### 3.5 Linea Aspera (`vorbild: linea-aspera`, neu, „w Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Duo, 2011 in London gegründet: **Alison Lewis** (Gesang, später Zanias, Keluar) und **Ryan Ambridge** (Elektronik, Produktion, Aufnahme, Mischung) | BELEGT (SE, mehrere Konzertseiten) | https://www.strangeworldrecords.com.au/products/linea-aspera-preservation-bias-lp · https://goout.net/en/linea-aspera/pzlmteg/ · https://thebrvtalist.com/lineaaspera |
| **Korrektur Auftrag:** nicht „Ryan Carr“, sondern Ryan **Ambridge** | BELEGT (SE) | dieselben |
| Debüt-LP bei Dark Entries (San Francisco), September 2012; Wiedervereinigung 2019; „LP II“ September 2020 | BELEGT (SE) | dieselben |
| „for all recordings Ryan utilizes an analog synthesizer set up: **Roland SH-09, Roland Juno 6, Vermona DRM MkIII, Korg Poly 800, Analogue Solutions Semblance**“ | WAHRSCHEINLICH (SE, Händlertext, vermutlich Label-Info) | https://www.strangeworldrecords.com.au/products/linea-aspera-preservation-bias-lp |
| Gemeinsame Leidenschaft für Coldwave, Minimal Synth und EBM; Sammlung alter Analog-Synths | BELEGT (SE) | https://goout.net/en/linea-aspera/pzlmteg/ · https://www.nts.live/artists/14163-linea-aspera |

#### CR-08 „Einzelgänger-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** einstimmiger Roland-Monosynth der späten 70er als Bass (Gerät WAHRSCHEINLICH; welcher Klang auf welchem Titel: UNBELEGT).
- **Rezept:** `o1w 1, o1pw .5, o2lvl 0, subLvl .55, subOct 1, subW 0, ftype 0, cutoff 420, res .5, drive .25, kt .35, fenv .55, fvel .45, fA .001, fD .15, fS .08, fR .08, fCurve .65, aA .001, aD .3, aS .7, aR .05, ampVel .5, mode 1, poly 1, reset 1, analog .1, spread 0` · Route `M('vel','cutoff', .05)` · fx `{rev .06}`
- **Warum so:** Ein Oszillator (Rechteck) + Sub-Rechteck wie bei einfachen Monosynths; Resonanz 50 % gibt das „Blubb“ auf jeder 16tel, Anschlag = Akzent.
- **Abgrenzung:** Werk „Synthpop-Bass“ (Puls-Oktave obendrüber), „Acid 303“ (Res 86 %, Slide): hier **Rechteck + Sub, mittlere Resonanz, kein Slide**.
- **Lage / Rolle:** Probe B♭1–G3 (34–55). **Grundton-Bereich A1–G2**, Oktave darüber darf mit. **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (g-Moll, vi–IV–I–V in B♭; Pausen-Raster, Takt 4 läuft auf):
```
Tempo 126 BPM · 4 Takte · Akkorde: Gm | Eb | Bb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G2(43) 0/1/108 · G2(43) 1/1/78 · G3(55) 3/1/78 · G2(43) 4/1/108 · D3(50) 6/1/90 · G2(43) 7/1/78 · G2(43) 9/1/78 · F3(53) 10/1/90 · G2(43) 12/1/108 · D3(50) 13/1/78 · Bb2(46) 15/1/78
T2: Eb2(39) 16/1/108 · Eb2(39) 17/1/78 · Eb3(51) 19/1/78 · Eb2(39) 20/1/108 · Bb2(46) 22/1/90 · Eb2(39) 23/1/78 · Eb2(39) 25/1/78 · D3(50) 26/1/90 · Eb2(39) 28/1/108 · G2(43) 29/1/78 · Bb2(46) 30/1/90
T3: Bb1(34) 32/1/108 · Bb1(34) 33/1/78 · Bb2(46) 35/1/78 · Bb1(34) 36/1/108 · F2(41) 38/1/90 · Bb1(34) 39/1/78 · Bb1(34) 41/1/78 · A2(45) 42/1/90 · Bb1(34) 44/1/108 · F2(41) 45/1/78 · D2(38) 46/1/90
T4: F2(41) 48/1/114 · F2(41) 49/1/84 · F3(53) 51/1/84 · F2(41) 52/1/114 · C3(48) 54/1/96 · F2(41) 55/1/84 · A2(45) 57/1/84 · C3(48) 58/1/96 · Eb3(51) 60/1/114 · D3(50) 61/1/84 · C3(48) 62/1/96 · A2(45) 63/1/84
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s · Lage der Probe Bb1–G3 (34–55)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,43,0.85],[0.25,0.25,43,0.61],[0.75,0.25,55,0.61],[1,0.25,43,0.85],[1.5,0.25,50,0.71],[1.75,0.25,43,0.61],[2.25,0.25,43,0.61],[2.5,0.25,53,0.71],[3,0.25,43,0.85],[3.25,0.25,50,0.61],[3.75,0.25,46,0.61],[4,0.25,39,0.85],[4.25,0.25,39,0.61],[4.75,0.25,51,0.61],[5,0.25,39,0.85],[5.5,0.25,46,0.71],[5.75,0.25,39,0.61],[6.25,0.25,39,0.61],[6.5,0.25,50,0.71],[7,0.25,39,0.85],[7.25,0.25,43,0.61],[7.5,0.25,46,0.71],[8,0.25,34,0.85],[8.25,0.25,34,0.61],[8.75,0.25,46,0.61],[9,0.25,34,0.85],[9.5,0.25,41,0.71],[9.75,0.25,34,0.61],[10.25,0.25,34,0.61],[10.5,0.25,45,0.71],[11,0.25,34,0.85],[11.25,0.25,41,0.61],[11.5,0.25,38,0.71],[12,0.25,41,0.9],[12.25,0.25,41,0.66],[12.75,0.25,53,0.66],[13,0.25,41,0.9],[13.5,0.25,48,0.76],[13.75,0.25,41,0.66],[14.25,0.25,45,0.66],[14.5,0.25,48,0.76],[15,0.25,51,0.9],[15.25,0.25,50,0.66],[15.5,0.25,48,0.76],[15.75,0.25,45,0.66]]`
- **Karte:** „Blubbernder Einzelstimmen-Bass im 16tel-Raster – erinnert an heutigen Minimal Synth (Stil Linea Aspera).“

#### CR-09 „Dünnglas-Akkord“ – Rolle Akkord/Stab · VA (neu)

- **Vorbild (ⓘ):** günstiger digital gesteuerter Polysynth der 80er (Korg Poly-800-Typ, Gerät WAHRSCHEINLICH); Klang UNBELEGT. **Kein Gerätename im Sound-Namen.**
- **Rezept:** `o1w 1, o1pw .5, o2w 0, o2oct 1, o2fine 0, o2lvl .35, ftype 1, cutoff 3000, res .08, drive 0, kt .6, fenv .3, fA .001, fD .3, fS .2, fR .2, aA .002, aD .45, aS .3, aR .25, ampVel .45, poly 6, analog .05, spread .2` · fx `{chorus:{mode:'I', mix .7}, rev .3, dly .1}`
- **Warum so:** Diese Geräte klingen **dünn** (eine Oszillator-Linie je Stimme, eK); Rechteck + Säge-Oktave, kaum Resonanz, Chorus I macht die Breite. Sustain 30 % = halb gestoßen.
- **Abgrenzung:** Werk „Poly-Stab“ (Unisono, Sustain 0, dick), „Prophet-Poly“ (verstimmt, warm): hier dünn, hell, ohne Verstimmung.
- **Lage / Rolle:** Probe F4–F5 (65–77). **Grenze F4–G5**; Rolle **Sequenz** (Stabs gehen als Block, `transposition-lage.md` §3.3). **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (g-Moll, Offbeat-Stabs; Takt 4 öffnet nach oben):
```
Tempo 126 BPM · 4 Takte · Akkorde: Gm | Eb | Bb | F
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: G4(67) 2/2/92 · Bb4(70) 2/2/92 · D5(74) 2/2/92 · G4(67) 6/2/80 · Bb4(70) 6/2/80 · D5(74) 6/2/80 · G4(67) 10/2/88 · Bb4(70) 10/2/88 · D5(74) 10/2/88 · G4(67) 14/2/78 · Bb4(70) 14/2/78 · D5(74) 14/2/78
T2: G4(67) 16/2/96 · Bb4(70) 16/2/96 · Eb5(75) 16/2/96 · G4(67) 19/2/80 · Bb4(70) 19/2/80 · Eb5(75) 19/2/80 · G4(67) 22/2/86 · Bb4(70) 22/2/86 · Eb5(75) 22/2/86 · G4(67) 26/2/82 · Bb4(70) 26/2/82 · Eb5(75) 26/2/82 · G4(67) 30/2/78 · Bb4(70) 30/2/78 · Eb5(75) 30/2/78
T3: F4(65) 34/2/90 · Bb4(70) 34/2/90 · D5(74) 34/2/90 · F4(65) 38/2/82 · Bb4(70) 38/2/82 · D5(74) 38/2/82 · F4(65) 40/2/88 · Bb4(70) 40/2/88 · D5(74) 40/2/88 · F4(65) 44/2/80 · Bb4(70) 44/2/80 · D5(74) 44/2/80
T4: F4(65) 48/2/96 · A4(69) 48/2/96 · C5(72) 48/2/96 · F4(65) 51/2/82 · A4(69) 51/2/82 · C5(72) 51/2/82 · F4(65) 54/2/86 · A4(69) 54/2/86 · C5(72) 54/2/86 · F4(65) 56/2/90 · A4(69) 56/2/90 · C5(72) 56/2/90 · F4(65) 59/2/84 · A4(69) 59/2/84 · C5(72) 59/2/84 · A4(69) 62/2/100 · C5(72) 62/2/100 · F5(77) 62/2/100
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s · Lage der Probe F4–F5 (65–77)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0.5,0.5,67,0.72],[0.5,0.5,70,0.72],[0.5,0.5,74,0.72],[1.5,0.5,67,0.63],[1.5,0.5,70,0.63],[1.5,0.5,74,0.63],[2.5,0.5,67,0.69],[2.5,0.5,70,0.69],[2.5,0.5,74,0.69],[3.5,0.5,67,0.61],[3.5,0.5,70,0.61],[3.5,0.5,74,0.61],[4,0.5,67,0.76],[4,0.5,70,0.76],[4,0.5,75,0.76],[4.75,0.5,67,0.63],[4.75,0.5,70,0.63],[4.75,0.5,75,0.63],[5.5,0.5,67,0.68],[5.5,0.5,70,0.68],[5.5,0.5,75,0.68],[6.5,0.5,67,0.65],[6.5,0.5,70,0.65],[6.5,0.5,75,0.65],[7.5,0.5,67,0.61],[7.5,0.5,70,0.61],[7.5,0.5,75,0.61],[8.5,0.5,65,0.71],[8.5,0.5,70,0.71],[8.5,0.5,74,0.71],[9.5,0.5,65,0.65],[9.5,0.5,70,0.65],[9.5,0.5,74,0.65],[10,0.5,65,0.69],[10,0.5,70,0.69],[10,0.5,74,0.69],[11,0.5,65,0.63],[11,0.5,70,0.63],[11,0.5,74,0.63],[12,0.5,65,0.76],[12,0.5,69,0.76],[12,0.5,72,0.76],[12.75,0.5,65,0.65],[12.75,0.5,69,0.65],[12.75,0.5,72,0.65],[13.5,0.5,65,0.68],[13.5,0.5,69,0.68],[13.5,0.5,72,0.68],[14,0.5,65,0.71],[14,0.5,69,0.71],[14,0.5,72,0.71],[14.75,0.5,65,0.66],[14.75,0.5,69,0.66],[14.75,0.5,72,0.66],[15.5,0.5,69,0.79],[15.5,0.5,72,0.79],[15.5,0.5,77,0.79]]`
- **Karte:** „Dünne, glasige Offbeat-Akkorde mit Chorus – erinnert an heutigen Minimal Synth (Stil Linea Aspera).“

#### CR-11 „Kaltstahl-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** analoger Drumcomputer aus ostdeutscher Fertigung (Vermona-Typ, WAHRSCHEINLICH); Klang UNBELEGT.
- **Kit-Rezept:**
  - KICK `{frq 52, pAmt 9, pDec .03, tDec .45, cTyp 0, cLvl .25, drv .2}` – knackig-dumpf.
  - SNARE `{frq 185, tDec .08, nTyp 'bandpass', nFrq 1600, nDec .16, nLvl .7}` – rauschig, wenig Ton.
  - CLAP `{nTyp 'bandpass', nFrq 1100, nBur 3, nGap .009, nDec .12, lvl .5}` – dünn, mit der Snare gedoppelt.
  - HH ZU `{mLvl .9, mTun 1.1, mDec .03, nLvl .3}` · HH OFFEN `{mDec .22}` (Choke).
  - Kit-Bus ROOM 0,2, kein GATE.
- **Lage / Rolle:** Drums, Transposition gilt nicht.
- **Hörprobe** (126 BPM, Four-on-the-Floor, Offbeat-Open-Hat; Takt 4 Snare-Doppel als Wendung):
```
Tempo 126 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x...x...x...x... | x...x...x...x... | x...x...x..xx... | x...x...x...x.x.
SNARE    | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.xx
CLAP     | ....x.......x... | ................ | ....x.......x... | ............x...
HH ZU    | xxxxxxxxxxxxxxxx | x.xxx.xxx.xxx.xx | xxxxxxxxxxxxxxxx | x.x.x.x.x.x.....
HH OFFEN | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x.....
```
Dauer: alle 4 Takte 7,6 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,6 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,6 s
- **Karte:** „Trockener analoger Maschinen-Beat mit Clap und offener Hi-Hat – erinnert an heutigen Minimal Synth und EBM (Stil Linea Aspera).“

### 3.6 Lebanon Hanover (`vorbild: lebanon-hanover`, neu, „u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Schweizerisch-britisches Duo, 2010 in Sunderland gegründet: **Larissa Iceglass** (Gesang, Gitarre, Synth) und **William Maybelline** (Gesang, Bass, Synth); Genres laut Wikipedia: Coldwave, Darkwave, Minimal Wave | BELEGT (SE) | https://en.wikipedia.org/wiki/Lebanon_Hanover |
| Label Fabrika Records (Griechenland), sieben Studioalben | BELEGT (SE) | https://en.wikipedia.org/wiki/Lebanon_Hanover |
| Live zu zweit: Iceglass Gitarre, Maybell(ine) Bass, beide singen über **programmierte Rhythmen** | WAHRSCHEINLICH (SE, Ticketseiten) | https://www.eventworld.com/lebanon-hanover-sydney-tickets-19-09-2026/event/422085 |
| Laut Last.fm in Berlin und Newcastle ansässig (Widerspruch zu „Sunderland“ ist nur Gründungs- vs. Wohnort) | WAHRSCHEINLICH (SE) | https://last.fm/music/Lebanon+Hanover/+wiki |
| Drumcomputer- und Synth-Modelle | **UNBELEGT** (eine Suche, nichts) | – |

**Typisch (eK):** Bass als Melodie-Instrument (hoch gespielt, Chorus), Gitarre darüber, karger Drumcomputer mit halliger Snare.

#### CR-10 Hörprobe für DK-07 „Chorus-Saitenbass“ als Melodiebass – Rolle Bass · VA (`vorbild-dark.md` §5.3)

- **Rezept:** DK-07 unverändert (Säge + Dreieck, Rauschen 4 % zum Anzupfen, Chorus I+II 65 %). **Kein neuer Sound:** DK-07 ist genau der Ersatz für einen gezupften Bass mit Chorus-Pedal.
- **Vorbild (ⓘ):** Ergänzungs-Tag `lebanon-hanover` (Stil, UNBELEGT: dass Maybelline Chorus nutzt, ist nicht belegt).
- **Lage / Rolle:** Probe A1–D3 (33–50), wie DK-07 angegeben. **Grundton-Bereich A1–E2**, Melodie bis D3 darf mit. **Akkord-Reaktion:** `dirAt {H: ↓}` (H1 statt H2, damit die Dominante unten Gewicht hat, wie in der Probe), sonst nächstliegend.
- **Hörprobe** (e-Moll, i–VI–iv–V; der Bass spielt die Melodie, nicht nur Grundtöne):
```
Tempo 136 BPM · 4 Takte · Akkorde: Em | C | Am | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/2/100 · B2(47) 2/2/86 · D3(50) 4/4/104 · B2(47) 8/2/88 · A2(45) 10/2/86 · G2(43) 12/4/94
T2: C2(36) 16/2/100 · G2(43) 18/2/86 · C3(48) 20/4/102 · B2(47) 24/2/88 · G2(43) 26/2/84 · E2(40) 28/2/90 · G2(43) 30/2/86
T3: A1(33) 32/2/100 · E2(40) 34/2/86 · A2(45) 36/4/100 · C3(48) 40/2/96 · B2(47) 42/2/88 · A2(45) 44/4/92
T4: B1(35) 48/2/104 · F#2(42) 50/2/90 · B2(47) 52/4/106 · Eb2(39) 56/2/94 · F#2(42) 58/2/92 · A2(45) 60/2/96 · B2(47) 62/2/100
```
Dauer: alle 4 Takte 7,1 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,1 s · Lage der Probe A1–D3 (33–50)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,40,0.79],[0.5,0.5,47,0.68],[1,1,50,0.82],[2,0.5,47,0.69],[2.5,0.5,45,0.68],[3,1,43,0.74],[4,0.5,36,0.79],[4.5,0.5,43,0.68],[5,1,48,0.8],[6,0.5,47,0.69],[6.5,0.5,43,0.66],[7,0.5,40,0.71],[7.5,0.5,43,0.68],[8,0.5,33,0.79],[8.5,0.5,40,0.68],[9,1,45,0.79],[10,0.5,48,0.76],[10.5,0.5,47,0.69],[11,1,45,0.72],[12,0.5,35,0.82],[12.5,0.5,42,0.71],[13,1,47,0.83],[14,0.5,39,0.74],[14.5,0.5,42,0.72],[15,0.5,45,0.76],[15.5,0.5,47,0.79]]`
- **Karte:** „Singender Chorus-Bass als Melodie – erinnert an heutige Cold Wave (Stil Lebanon Hanover).“

#### CR-12 „Trübsal-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** „programmierte Rhythmen“ (WAHRSCHEINLICH); Kit UNBELEGT.
- **Kit-Rezept:**
  - KICK `{frq 56, pAmt 6, pDec .03, tDec .35, cLvl .1}` – kurz, unspektakulär.
  - SNARE `{frq 210, tDec .1, nTyp 'highpass', nFrq 2200, nDec .2, nLvl .75, sRoom .5}` – **die Snare allein hallt lang** (Raum-Anteil nur auf diesem Pad).
  - HH ZU `{mLvl 1, mTun .9, mDec .045}` – Achtel.
  - TOM TIEF `{frq 95, pAmt 4, tDec .5}`.
  - Kit-Bus ROOM 0,35, kein GATE.
- **Abgrenzung:** C2-04 „Kühlraum-Kit“ (Sixth June) ist ähnlich gedacht; Unterschied: hier halbe-Takt-Kick (1 und 3, Synkope), kein Offbeat-Hat-Teppich, längerer Snare-Raum. Prüfung V10d: zu nah → einer entfällt.
- **Lage / Rolle:** Drums.
- **Hörprobe** (136 BPM; Takt 4 Snare-Wirbel):
```
Tempo 136 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK     | x.......x.x..... | x.......x....... | x.......x.x..... | x.......x...x.x.
SNARE    | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......xxxx
HH ZU    | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
TOM TIEF | ................ | ................ | ..............x. | ................
```
Dauer: alle 4 Takte 7,1 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,1 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,1 s
- **Karte:** „Karger Drumcomputer mit lang hallender Snare – erinnert an heutige Cold Wave (Stil Lebanon Hanover).“

### 3.7 Boy Harsher (`vorbild: boy-harsher`, neu, „b Geräte (Bandliste), w Einzeltitel“)

| Fakt | Status | Quelle |
|---|---|---|
| Duo Jae Matthews (Gesang) und **Augustus Muller** (Produktion) | BELEGT (SE) | https://en.wikipedia.org/wiki/Boy_Harsher |
| Bandeigene Empfehlungsliste: **MPC1000**, Computer und **Roland MC-505** = „workhorse of all of *Lesser Man*“; „we don’t actually own a Juno-106“ | BELEGT (SE, Band selbst) | https://synthhistory.com/post/boy-harsher-recommends |
| Vice/Noisey (E-Mail-Interview): „a handful of cheap synthesizers and samplers“; viele Synths auf „Lesser Man“ mit einem **halb funktionierenden geliehenen Juno-106**; live Begleitspuren + auf die MPC gesampelte Synths | BELEGT als Aussage (SE); Juno-Widerspruch zur Bandliste → **WAHRSCHEINLICH** (geliehen ≠ besessen, passt also eher) | https://www.vice.com/en/article/boy-harsher/ |
| Arturia-Porträt: MC-505 öffnete ihm Preset-Vielfalt; OP-Xa V neben Oberheim-Hardware; CMI V für Fairlight-Samples | WAHRSCHEINLICH (Hersteller-Porträt mit Produktbezug) | https://www.arturia.com/stories/augustus-muller |
| Romantische Trennung 2024; Album „GET MEAN“ (FADER, 09/2026) | WAHRSCHEINLICH (SE) – nicht in den ⓘ-Text | https://www.thefader.com/2026/09/10/boy-harsher-fader-mix |

#### CR-13 „Fiebertraum-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Groovebox-Bass der späten 90er (Roland-MC-505-Typ, Gerät BELEGT als „Arbeitspferd“), langsam, dunkel. Klang UNBELEGT.
- **Rezept:** `o1w 0, o1uni 2, uniDet .18, uniMix .6, o2w 1, o2oct -1, o2pw .5, o2lvl .4, noise .04, ftype 0, cutoff 320, res .22, drive .5, bass .6, kt .3, fenv .35, fvel .3, fA .001, fD .2, fS .3, fR .1, aA .002, aD .4, aS .75, aR .08, ampVel .4, mode 1, poly 1, analog .15, spread .1, l1shape 1, l1sync 16` · Routen `M('lfo1','cutoff', .08)`, `M('vel','cutoff', .03)` · fx `{drive .25, rev .12, dly .1}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .3}}`
- **Warum so:** Dunkel, leicht verdreckt (Rauschen 4 %, Drive), das Filter öffnet sich über 4 Takte (LFO 1 im Takt-Sync, Dreieck) = „Fiebertraum“. Die Sampler-Körnigkeit (Bitreduktion) fehlt (§7).
- **Abgrenzung:** Werk „Acid 303“ (Res 86 %, Slide), CR-08 (Rechteck-Blubb): hier Unisono-Säge, geringe Resonanz, langsamer Filter-Schwung.
- **Lage / Rolle:** Probe C2–C♯3 (36–49). **Grundton-Bereich C2–F2**, Oktave darüber darf mit. **Akkord-Reaktion:** `dirAt {C: ↓}` (C2, nicht C3: die Dominante bleibt tief), sonst nächstliegend.
- **Hörprobe** (f-Moll, i–VI–VII–V, 100 BPM; „kurz“ = Takt 1, 2, 4):
```
Tempo 100 BPM · 4 Takte · Akkorde: Fm | Db | Eb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F2(41) 0/1/108 · F2(41) 2/1/90 · F2(41) 3/1/78 · F2(41) 5/1/78 · Ab2(44) 6/1/90 · F2(41) 8/1/104 · F2(41) 10/1/90 · C3(48) 11/1/78 · F2(41) 13/1/78 · Eb2(39) 14/1/90
T2: C#2(37) 16/1/108 · C#2(37) 18/1/90 · C#2(37) 19/1/78 · C#2(37) 21/1/78 · F2(41) 22/1/90 · C#2(37) 24/1/104 · C#2(37) 26/1/90 · Ab2(44) 27/1/78 · C#3(49) 29/1/78 · C3(48) 30/1/90
T3: Eb2(39) 32/1/108 · Eb2(39) 34/1/90 · Eb2(39) 35/1/78 · Eb2(39) 37/1/78 · G2(43) 38/1/90 · Eb2(39) 40/1/104 · Eb2(39) 42/1/90 · Bb2(46) 43/1/78 · Eb2(39) 45/1/78 · F2(41) 46/1/90 · G2(43) 47/1/78
T4: C2(36) 48/1/114 · C2(36) 50/1/96 · C2(36) 51/1/84 · C2(36) 53/1/84 · E2(40) 54/1/96 · G2(43) 56/1/110 · C2(36) 58/1/96 · Bb2(46) 59/1/84 · C3(48) 61/1/84 · G2(43) 62/1/96 · E2(40) 63/1/84
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s · Lage der Probe C2–C#3 (36–49)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,41,0.85],[0.5,0.25,41,0.71],[0.75,0.25,41,0.61],[1.25,0.25,41,0.61],[1.5,0.25,44,0.71],[2,0.25,41,0.82],[2.5,0.25,41,0.71],[2.75,0.25,48,0.61],[3.25,0.25,41,0.61],[3.5,0.25,39,0.71],[4,0.25,37,0.85],[4.5,0.25,37,0.71],[4.75,0.25,37,0.61],[5.25,0.25,37,0.61],[5.5,0.25,41,0.71],[6,0.25,37,0.82],[6.5,0.25,37,0.71],[6.75,0.25,44,0.61],[7.25,0.25,49,0.61],[7.5,0.25,48,0.71],[8,0.25,36,0.9],[8.5,0.25,36,0.76],[8.75,0.25,36,0.66],[9.25,0.25,36,0.66],[9.5,0.25,40,0.76],[10,0.25,43,0.87],[10.5,0.25,36,0.76],[10.75,0.25,46,0.66],[11.25,0.25,48,0.66],[11.5,0.25,43,0.76],[11.75,0.25,40,0.66]]`
aud-Daten ganz (`len 4`): `[[0,0.25,41,0.85],[0.5,0.25,41,0.71],[0.75,0.25,41,0.61],[1.25,0.25,41,0.61],[1.5,0.25,44,0.71],[2,0.25,41,0.82],[2.5,0.25,41,0.71],[2.75,0.25,48,0.61],[3.25,0.25,41,0.61],[3.5,0.25,39,0.71],[4,0.25,37,0.85],[4.5,0.25,37,0.71],[4.75,0.25,37,0.61],[5.25,0.25,37,0.61],[5.5,0.25,41,0.71],[6,0.25,37,0.82],[6.5,0.25,37,0.71],[6.75,0.25,44,0.61],[7.25,0.25,49,0.61],[7.5,0.25,48,0.71],[8,0.25,39,0.85],[8.5,0.25,39,0.71],[8.75,0.25,39,0.61],[9.25,0.25,39,0.61],[9.5,0.25,43,0.71],[10,0.25,39,0.82],[10.5,0.25,39,0.71],[10.75,0.25,46,0.61],[11.25,0.25,39,0.61],[11.5,0.25,41,0.71],[11.75,0.25,43,0.61],[12,0.25,36,0.9],[12.5,0.25,36,0.76],[12.75,0.25,36,0.66],[13.25,0.25,36,0.66],[13.5,0.25,40,0.76],[14,0.25,43,0.87],[14.5,0.25,36,0.76],[14.75,0.25,46,0.66],[15.25,0.25,48,0.66],[15.5,0.25,43,0.76],[15.75,0.25,40,0.66]]`
- **Karte:** „Langsamer, dunkler Groovebox-Bass, dessen Filter über vier Takte aufgeht – erinnert an heutige Darkwave (Stil Boy Harsher).“

#### CR-14 „Schwitzkasten-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** gesampelte Drums aus der MPC (BELEGT als Live-Arbeitsweise); Kit UNBELEGT.
- **Kit-Rezept:**
  - KICK `{frq 50, pAmt 8, pDec .04, tDec .55, cLvl .3, drv .45}` – gesättigt.
  - SNARE `{frq 190, tDec .07, nTyp 'bandpass', nFrq 1400, nDec .18, nLvl .8, drv .3}` + CLAP `{nBur 3, nGap .01, nDec .15}` gleichzeitig = dicker Rückschlag.
  - HH ZU `{mLvl .8, mDec .025, nLvl .4, nTyp 'highpass', nFrq 8000}` – rauschig.
  - PERC `{model 'cb', frq 420, tDec .12, lvl .35}` – einzelner Akzent.
  - Kit-Bus ROOM 0,3, Spur-Drive 0,2.
- **Lage / Rolle:** Drums.
- **Hörprobe** (100 BPM, Kick-Synkope auf 7 und 11; „kurz“ = Takt 1, 2, 4):
```
Tempo 100 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK  | x.....x...x..... | x.....x...x...x. | x.....x...x..... | x.....x.x.x.x...
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x..x
CLAP  | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | xxxxxxxxxxxxxxxx | x.xxx.xxx.xx....
PERC  | ...........x.... | ..........x..... | ...........x.... | ..............x.
```
Dauer: alle 4 Takte 9,6 s · kurz (≤ 8 s) T1, T2, T4 = 7,2 s · ganz (≤ 16 s) T1, T2, T3, T4 = 9,6 s
- **Karte:** „Gesättigter, langsamer Maschinen-Groove mit Clap-Snare – erinnert an heutige Darkwave (Stil Boy Harsher).“

### 3.8 Molchat Doma (`vorbild: molchat-doma`, neu, „b Geräte (Studio), u Einzeltitel“)

| Fakt | Status | Quelle |
|---|---|---|
| Minsker Trio: Egor Shkutko (Gesang), **Roman Komogortsev** (Gitarre, Synth, **Drumcomputer**), Pavel Kozlov (Bass, Synth); kein Live-Schlagzeuger | BELEGT (SE) | https://en.wikipedia.org/wiki/Molchat_Doma |
| „Etazhi“ (2018, Detriti Records): Post-Punk, Cold Wave, New Wave, Synthpop; „Sudno“ 2020 auf TikTok viral (> 150 000 Clips) | BELEGT (SE) | https://en.wikipedia.org/wiki/Etazhi · https://en.wikipedia.org/wiki/Molchat_Doma |
| Synths **Yamaha DX7** (erstes Instrument, DX7 Mk I seit 2017) und **Minimoog** | **BELEGT** (MusicRadar + American Songwriter; DX7 zusätzlich Roland-Interview, SE) | https://musicradar.com/news/molchat-doma-interview · https://americansongwriter.com/tiktok-sensations-molchat-doma-reimagine-80s-cold-wave-on-monument/ · https://articles.roland.com/a-few-minutes-with-molchat-doma/ |
| Album „Monument“ (2020, Heimstudio): „Yamaha DX7, Minimoog, **Roland Juno-106**, Lel 0041“, dazu virtuelle Instrumente | **WAHRSCHEINLICH** für Juno-106 und Lel 0041 (eine Quelle, Komogortsev-Zitat, SE) | https://americansongwriter.com/tiktok-sensations-molchat-doma-reimagine-80s-cold-wave-on-monument/ |
| Übrige Studioliste (Komogortsev, MusicRadar): Roland D-50, W-30, Alpha Juno-2, Sequential Prophet-5, ARP Odyssey Mk II, Roland Jupiter-X, TB-03, TR-8 zum Skizzieren | **WAHRSCHEINLICH** (eine Quelle, nicht reproduziert: bestätigt sind nur Überschrift und FL Studio 10; Seite selbst nicht abrufbar, DNS-Fehler); Prophet-5 zusätzlich Roland-Interview | https://musicradar.com/news/molchat-doma-interview |
| **FL Studio 10** | BELEGT (Überschrift des Interviews) | https://musicradar.com/news/molchat-doma-interview |
| Roland-Interview: nach Los Angeles mitgenommen MPC One, SP-404SX, Prophet-5; Synth-Sammlung seit 2017, zuerst ein DX7 Mk I | BELEGT (SE, Hersteller-Interview) | https://articles.roland.com/a-few-minutes-with-molchat-doma/ |
| Rezension: „Sudno“ stark von New Order beeinflusst; „Prognoz“ mit „oddly compressed synth“; „Volny“ mit komplexerem Drumcomputer | WAHRSCHEINLICH (SE, Schülerzeitung) | https://bmgator.org/24473/arts/music-review-molchat-domas-%d1%8d%d1%82%d0%b0%d0%b6%d0%b8/ |
| Welches Gerät auf „Sudno“ | **UNBELEGT** | – |

#### CR-15 Hörprobe für Werk „Moog-Bass“ – Rolle Bass · VA (V0a Z. 5675)

- **Rezept:** Werk unverändert. **Kein neuer Sound:** Minimoog steht in der Studio-Liste (BELEGT), welcher Titel: UNBELEGT. Im Original spielt Kozlov meist E-Bass (eK) – der Synthbass ist hier die Stellvertretung.
- **Lage / Rolle:** Probe G1–A2 (31–45). **Grundton-Bereich G1–D2.** **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (h-Moll, i–VI–III–VII; Post-Punk-Achtel mit Melodieschritt statt Oktavsprung):
```
Tempo 132 BPM · 4 Takte · Akkorde: Bm | G | D | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: B1(35) 0/2/100 · B1(35) 2/2/84 · B1(35) 4/2/100 · D2(38) 6/2/84 · F#2(42) 8/2/100 · F#2(42) 10/2/84 · E2(40) 12/2/100 · D2(38) 14/2/84
T2: G1(31) 16/2/100 · G1(31) 18/2/84 · G1(31) 20/2/100 · B1(35) 22/2/84 · D2(38) 24/2/100 · D2(38) 26/2/84 · F#2(42) 28/2/100 · D2(38) 30/2/84
T3: D2(38) 32/2/100 · D2(38) 34/2/84 · D2(38) 36/2/100 · F#2(42) 38/2/84 · A2(45) 40/2/100 · A2(45) 42/2/84 · G2(43) 44/2/100 · F#2(42) 46/2/84
T4: A1(33) 48/2/106 · A1(33) 50/2/90 · A1(33) 52/2/106 · C#2(37) 54/2/90 · E2(40) 56/2/106 · E2(40) 58/2/90 · G2(43) 60/2/106 · C#2(37) 62/2/90
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe G1–A2 (31–45)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,35,0.79],[0.5,0.5,35,0.66],[1,0.5,35,0.79],[1.5,0.5,38,0.66],[2,0.5,42,0.79],[2.5,0.5,42,0.66],[3,0.5,40,0.79],[3.5,0.5,38,0.66],[4,0.5,31,0.79],[4.5,0.5,31,0.66],[5,0.5,31,0.79],[5.5,0.5,35,0.66],[6,0.5,38,0.79],[6.5,0.5,38,0.66],[7,0.5,42,0.79],[7.5,0.5,38,0.66],[8,0.5,38,0.79],[8.5,0.5,38,0.66],[9,0.5,38,0.79],[9.5,0.5,42,0.66],[10,0.5,45,0.79],[10.5,0.5,45,0.66],[11,0.5,43,0.79],[11.5,0.5,42,0.66],[12,0.5,33,0.83],[12.5,0.5,33,0.71],[13,0.5,33,0.83],[13.5,0.5,37,0.71],[14,0.5,40,0.83],[14.5,0.5,40,0.71],[15,0.5,43,0.83],[15.5,0.5,37,0.71]]`
- **Karte:** „Treibender Achtel-Bass mit kleinen Melodieschritten – erinnert an osteuropäischen Post-Punk/Cold Wave (Stil Molchat Doma).“

#### CR-16 „Neonröhren-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** einfacher DCO-Polysynth der 80er als Melodie mit viel Raum (Stil; Gerät je Titel UNBELEGT).
- **Rezept:** `o1w 1, o1pw .5, o2w 1, o2pw .5, o2oct 1, o2fine 5, o2lvl .3, subLvl .2, ftype 1, cutoff 2600, res .12, drive .1, kt .6, fenv .15, fA .005, fD .4, fS .6, fR .3, aA .006, aD .3, aS .9, aR .35, ampVel .35, mode 2, poly 1, glide .03, l2shape 0, l2rate 5.2, l2fade .6, analog .15, spread 0` · Route `M('lfo2','pitch', .003)` · fx `{chorus:{mode:'II', mix .7}, rev .5, dly .3}` · bus `{echo:{mode:'pp', divL:'1/4', fb .3}}`
- **Warum so:** Hohles Rechteck + Oktave, Chorus II und ein großer Raum = „aus einem leeren Treppenhaus“. Kaum Filterbewegung (DCO-Synths klingen statisch, eK).
- **Abgrenzung:** Werk „Puls-Lead“ (28 %, PWM, ohne Chorus, trocken), MO2 „Fluchtweg-Lead“ (hell, ohne Raum): hier Rechteck 50 % + Chorus + langer Hall.
- **Lage / Rolle:** Probe A4–A5 (69–81), am besten A4–D6. **Grenze tief A4.** **Akkord-Reaktion:** Lead-Regel.
- **Hörprobe** (h-Moll; lange Töne, Takt 3 Höhepunkt A5, Takt 4 fällt auf A4):
```
Tempo 132 BPM · 4 Takte · Akkorde: Bm | G | D | A
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: F#5(78) 0/6/100 · E5(76) 6/2/86 · D5(74) 8/4/92 · B4(71) 12/4/88
T2: D5(74) 16/4/94 · E5(76) 20/4/96 · B4(71) 24/6/90 · D5(74) 30/2/84
T3: A5(81) 32/6/106 · F#5(78) 38/2/90 · E5(76) 40/4/92 · D5(74) 44/2/86 · E5(76) 46/2/88
T4: C#5(73) 48/4/96 · E5(76) 52/4/98 · A4(69) 56/8/94
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s · Lage der Probe A4–A5 (69–81)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1.5,78,0.79],[1.5,0.5,76,0.68],[2,1,74,0.72],[3,1,71,0.69],[4,1,74,0.74],[5,1,76,0.76],[6,1.5,71,0.71],[7.5,0.5,74,0.66],[8,1.5,81,0.83],[9.5,0.5,78,0.71],[10,1,76,0.72],[11,0.5,74,0.68],[11.5,0.5,76,0.69],[12,1,73,0.76],[13,1,76,0.77],[14,2,69,0.74]]`
- **Karte:** „Hohle Synth-Melodie mit Chorus und großem Raum – erinnert an osteuropäische Cold Wave (Stil Molchat Doma).“

#### CR-17 „Plattenbau-Kit“ – Rolle Drums · Drum-Synth (neu)

- **Vorbild (ⓘ):** Drumcomputer statt Schlagzeuger (BELEGT); Roland TR-8 zum Skizzieren (BELEGT); Kit UNBELEGT.
- **Kit-Rezept:**
  - KICK `{frq 55, pAmt 7, pDec .025, tDec .3, cLvl .3}` – kurz, 909-nah.
  - SNARE `{frq 200, tDec .09, nTyp 'highpass', nFrq 1800, nDec .22, nLvl .8, sRoom .45}` – mit Platten-Hall.
  - HH ZU `{mLvl 1, mTun 1.2, mDec .03}` – 16tel-Teppich · HH OFFEN `{mDec .25}`.
  - TOM MITTE `{frq 140, pAmt 5, tDec .3}`.
  - Kit-Bus ROOM 0,25.
- **Lage / Rolle:** Drums.
- **Hörprobe** (132 BPM, Four-on-the-Floor mit 16tel-Hats; Takt 4 Tom-Fill):
```
Tempo 132 BPM · 4 Takte · 16tel-Raster (x = Schlag, . = Pause)
KICK      | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x...
SNARE     | ....x.......x... | ....x.......x..x | ....x.......x... | ....x...x...xxxx
HH ZU     | xxxxxxxxxxxxxxxx | xxxxxxxxxxxxxxxx | xxxx.xxxxxxx.xxx | xxxxxxxx........
HH OFFEN  | ................ | ..............x. | ....x.......x... | ................
TOM MITTE | ................ | ................ | ................ | .........x.x....
```
Dauer: alle 4 Takte 7,3 s · kurz (≤ 8 s) T1, T2, T3, T4 = 7,3 s · ganz (≤ 16 s) T1, T2, T3, T4 = 7,3 s
- **Karte:** „Treibender Drumcomputer mit 16tel-Hi-Hats und halliger Snare – erinnert an osteuropäischen Post-Punk (Stil Molchat Doma).“

### 3.9 Clan of Xymox – nur Prüfung (Ergänzung zu `vorbild-dark.md` §5.3)

| Fakt | Status | Quelle |
|---|---|---|
| Frühe Ausstattung nach Erinnerung von **Anka Wolbert**: **Korg MS-10**, eine Rhythmusmaschine, ein Casio, Bandschleifen | WAHRSCHEINLICH (SE, Quelle im Auszug nicht eindeutig zuzuordnen) | https://rock.fandom.com/wiki/Clan_of_Xymox · https://en.wikipedia.com/wiki/Xymox |
| Für „Masquerade“ (Medusa-Zeit) Wechsel vom **Commodore 64** zum **Atari ST**; Wolbert spielte und programmierte jede Note | WAHRSCHEINLICH (SE) | https://post-punk.com/clan-of-xymox-medusa/ |
| Zwei Peel Sessions, Juni und November 1985; drei Titel davon auf „Medusa“ | BELEGT (SE, 2 Quellen) | https://post-punk.com/dark-entries-to-reissue-clan-of-xymox-peel-sessions-on-vinyl/ · https://oye-records.com/releases/clan-of-xymox-peel-sessions |
| „Medusa“ erschienen 1. November 1986 | WAHRSCHEINLICH (eine Quelle) | https://post-punk.com/clan-of-xymox-medusa/ |

**Folge für `vorbild-dark.md`:** DK-05…08 bleiben (Rezepte passen zu „MS-10 + Rhythmusmaschine + Chorus-Bass“). Im ⓘ von DK-05…08 darf jetzt stehen: „früh ein kleiner Korg-Monosynth und eine Rhythmusmaschine (Erinnerung der Bassistin)“ – Status WAHRSCHEINLICH, Formulierung vorsichtig. Synth-Modelle 1985–86: weiter UNBELEGT. Prüfliste-Zeile 7 (`vorbild-dark.md` §10) ist damit **teilweise** erledigt.

### 3.10 Kirlian Camera – nur Prüfung (Ergänzung zu `vorbild-szene.md` §4.5)

| Fakt | Status | Quelle |
|---|---|---|
| 1979 in Parma von **Angelo Bergamini** gegründet; Name nach dem Gerät, das den „elektromagnetischen Halo“ fotografiert | BELEGT (SE) | https://en.wikipedia.org/wiki/Kirlian_Camera |
| Bergamini einziges durchgehendes Mitglied; aktuelle Credits: Synthesizer, Elektronik, E-Gitarren | BELEGT (SE, Album-Ankündigung) | https://www.reflectionsofdarkness.com/releases/20956-kirlian-camera-reveal-details-of-new-double-album-cold-pills-scarlet-gate-of-toxic-daybreak-and-release-video-for-first-single-the-8th-president |
| 1987: Bergamini spielte alle Instrumente, **Charlie Mallozzi elektronische Drums**, Simona Buja Gesang | BELEGT (SE) | https://en.wikipedia.org/wiki/Kirlian_Camera |
| Synth-Modelle | **UNBELEGT** (Interview idieyoudie.com 2012 nur angerissen) | https://idieyoudie.com/2012/02/an-interview-with-angelo-bergamini-of-kirlian-camera/ |

**Folge:** SZ-15…18 bleiben UNBELEGT im Geräte-Teil. Die Angabe „1979 als ‚Suicide Commando‘“ (R6, KD-4) kam in diesen Auszügen **nicht** vor; Warnung bleibt.

---

## 4. Retrowave

### 4.1 College (`vorbild: college`, neu, „u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| College = Projekt von **David Grellier**, französischer Synthpop; aus der Nische bekannt geworden, weil „A Real Hero“ im Soundtrack von „Drive“ (2011) lief | BELEGT (SE, AllMusic) | https://www.allmusic.com/artist/college-mn0002130572 |
| „A Real Hero“ (erste EP bei Flexx) mit Gesang von **Electric Youth**; aufgebaut um eine „somber, descending melody“ | BELEGT (SE, Resident Advisor) | https://ra.co/reviews/7116 |
| Geräte | **UNBELEGT** (keine Quelle) | – |

**Wichtig für die Hörprobe:** Die fallende Melodie von „A Real Hero“ ist Werkteil. Die Proben hier steigen bzw. bleiben stehen; keine fallende Hauptmelodie.

#### CR-18 „Heldenpuls-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Stil-Entwurf (UNBELEGT): weicher, gleichmäßiger Achtel-Puls unter Balladen-Synthpop.
- **Rezept:** `o1w 2, o2w 3, o2oct -1, o2lvl .6, o3w 0, o3lvl .15, ftype 0, cutoff 600, res .05, drive .1, bass .6, kt .3, fenv .12, fA .01, fD .3, fS .6, fR .2, aA .008, aD .5, aS .8, aR .18, ampVel .3, mode 1, poly 1, analog .1, spread 0` · fx `{chorus:{mode:'I', mix .3}, rev .15, pump .25}` · `pumpRel '1/8'`
- **Warum so:** Dreieck + Sinus-Unteroktave + Spur Säge = rund, ohne Knack (A 8 ms). Leichtes Pumpen lässt ihn atmen; das ist der „Herzschlag“ unter verträumten Flächen.
- **Abgrenzung:** TC1 „Zupf-Bass 83“ (gezupft, Filter-Hk), KV1 „Nachtfahrt-Bass“ (Achtel mit Biss), F82 „Brandungs-Bass“: hier **weich, ohne Filter-Biss, pumpend**.
- **Lage / Rolle:** Probe A♭1–E♭3 (32–51). **Grundton-Bereich A♭1–E♭2**, Oktave darüber darf mit. **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (Es-Dur, I–V–vi–IV/V, 96 BPM; „kurz“ = Takt 1, 2, 4):
```
Tempo 96 BPM · 4 Takte · Akkorde: Eb | Bb | Cm | Ab Bb
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Eb2(39) 0/2/100 · Eb2(39) 2/2/84 · Eb2(39) 4/2/100 · Eb2(39) 6/2/84 · Eb2(39) 8/2/100 · Eb2(39) 10/2/84 · Eb3(51) 12/2/100 · Bb2(46) 14/2/84
T2: Bb1(34) 16/2/100 · Bb1(34) 18/2/84 · Bb1(34) 20/2/100 · Bb1(34) 22/2/84 · Bb1(34) 24/2/100 · Bb1(34) 26/2/84 · D2(38) 28/2/100 · F2(41) 30/2/84
T3: C2(36) 32/2/100 · C2(36) 34/2/84 · C2(36) 36/2/100 · C2(36) 38/2/84 · C2(36) 40/2/100 · C2(36) 42/2/84 · C3(48) 44/2/100 · G2(43) 46/2/84
T4: Ab1(32) 48/2/106 · Ab1(32) 50/2/90 · Ab1(32) 52/2/106 · Ab1(32) 54/2/90 · Bb1(34) 56/2/106 · Bb1(34) 58/2/90 · Bb2(46) 60/2/106 · D2(38) 62/2/90
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s · Lage der Probe Ab1–Eb3 (32–51)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,39,0.79],[0.5,0.5,39,0.66],[1,0.5,39,0.79],[1.5,0.5,39,0.66],[2,0.5,39,0.79],[2.5,0.5,39,0.66],[3,0.5,51,0.79],[3.5,0.5,46,0.66],[4,0.5,34,0.79],[4.5,0.5,34,0.66],[5,0.5,34,0.79],[5.5,0.5,34,0.66],[6,0.5,34,0.79],[6.5,0.5,34,0.66],[7,0.5,38,0.79],[7.5,0.5,41,0.66],[8,0.5,32,0.83],[8.5,0.5,32,0.71],[9,0.5,32,0.83],[9.5,0.5,32,0.71],[10,0.5,34,0.83],[10.5,0.5,34,0.71],[11,0.5,46,0.83],[11.5,0.5,38,0.71]]`
aud-Daten ganz (`len 4`): `[[0,0.5,39,0.79],[0.5,0.5,39,0.66],[1,0.5,39,0.79],[1.5,0.5,39,0.66],[2,0.5,39,0.79],[2.5,0.5,39,0.66],[3,0.5,51,0.79],[3.5,0.5,46,0.66],[4,0.5,34,0.79],[4.5,0.5,34,0.66],[5,0.5,34,0.79],[5.5,0.5,34,0.66],[6,0.5,34,0.79],[6.5,0.5,34,0.66],[7,0.5,38,0.79],[7.5,0.5,41,0.66],[8,0.5,36,0.79],[8.5,0.5,36,0.66],[9,0.5,36,0.79],[9.5,0.5,36,0.66],[10,0.5,36,0.79],[10.5,0.5,36,0.66],[11,0.5,48,0.79],[11.5,0.5,43,0.66],[12,0.5,32,0.83],[12.5,0.5,32,0.71],[13,0.5,32,0.83],[13.5,0.5,32,0.71],[14,0.5,34,0.83],[14.5,0.5,34,0.71],[15,0.5,46,0.83],[15.5,0.5,38,0.71]]`
- **Karte:** „Weicher, atmender Achtel-Bass unter Balladen-Synthpop – erinnert an französischen Dream-Synthpop um 2010 (Stil College).“

#### CR-19 Hörprobe für Werk „Juno-Pad“ – Rolle Fläche · VA (V0a Z. 5754)

- **Rezept:** Werk unverändert (Puls + Sub, LP24, langsame Hüllkurven, Chorus I). **Kein neuer Sound** (Geräte unbekannt, Werk trifft das Hörbild).
- **Lage / Rolle:** Probe G3–B♭4 (55–70), Fläche-Regel, Grenze G3–C5. **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (Es-Dur, Akkorde stehen, die Oberstimme steigt in Takt 1 und 3):
```
Tempo 96 BPM · 4 Takte · Akkorde: Eb | Bb | Cm | Ab Bb
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: Bb3(58) 0/12/72 · Eb4(63) 0/12/72 · G4(67) 0/12/72 · Bb3(58) 12/4/66 · Eb4(63) 12/4/66 · Bb4(70) 12/4/66
T2: Bb3(58) 16/16/72 · D4(62) 16/16/72 · F4(65) 16/16/72
T3: G3(55) 32/12/72 · C4(60) 32/12/72 · Eb4(63) 32/12/72 · C4(60) 44/4/68 · Eb4(63) 44/4/68 · G4(67) 44/4/68
T4: Ab3(56) 48/8/74 · C4(60) 48/8/74 · Eb4(63) 48/8/74 · Bb3(58) 56/8/80 · D4(62) 56/8/80 · F4(65) 56/8/80
```
Dauer: alle 4 Takte 10,0 s · kurz (≤ 8 s) T1, T2, T4 = 7,5 s · ganz (≤ 16 s) T1, T2, T3, T4 = 10,0 s · Lage der Probe G3–Bb4 (55–70)
aud-Daten kurz (`len 3`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,3,58,0.57],[0,3,63,0.57],[0,3,67,0.57],[3,1,58,0.52],[3,1,63,0.52],[3,1,70,0.52],[4,4,58,0.57],[4,4,62,0.57],[4,4,65,0.57],[8,2,56,0.58],[8,2,60,0.58],[8,2,63,0.58],[10,2,58,0.63],[10,2,62,0.63],[10,2,65,0.63]]`
aud-Daten ganz (`len 4`): `[[0,3,58,0.57],[0,3,63,0.57],[0,3,67,0.57],[3,1,58,0.52],[3,1,63,0.52],[3,1,70,0.52],[4,4,58,0.57],[4,4,62,0.57],[4,4,65,0.57],[8,3,55,0.57],[8,3,60,0.57],[8,3,63,0.57],[11,1,60,0.54],[11,1,63,0.54],[11,1,67,0.54],[12,2,56,0.58],[12,2,60,0.58],[12,2,63,0.58],[14,2,58,0.63],[14,2,62,0.63],[14,2,65,0.63]]`
- **Karte:** „Warme, langsam atmende Juno-artige Fläche – erinnert an verträumten Synthpop um 2010 (Stil College).“

### 4.2 Electric Youth (`vorbild: electric-youth`, neu, „w Arbeitsweise, u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Duo aus **Bronwyn Griffin** (Gesang) und **Austin Garrick** (Instrumente), aufgewachsen in Hamilton (Kanada) | BELEGT (SE) | https://www.vice.com/en/article/electric-youth-interview |
| „Innerworld“: Aufnahme in Toronto und L. A.; in Toronto Garricks **Vintage-Synth-Sammlung** = ca. **80 % der analogen Klänge** | BELEGT (SE, Pressetext mit Bandaussage) | https://shorefire.com/releases/entry/electric-youth-sign-to-secretly-canadian-release-new-music-video |
| Filme (u. a. „Metropolis“) liefen während der Arbeit; Garrick: „We really have no interest in recreating the past“ | BELEGT (SE) | dieselben · https://www.vice.com/en/article/electric-youth-interview |
| Sang auf „A Real Hero“ (College) | BELEGT (SE) | https://ra.co/reviews/7116 |
| Synth-Modelle | **UNBELEGT** | – |

#### CR-20 Hörprobe für Werk „Glas-Pluck“ – Rolle Sequenz · VA (V0a Z. 5793)

- **Rezept:** Werk unverändert (Dreieck + Sinus-Oktave + schmaler Puls, Sustain 0). Für diese Probe Echo 1/8 punktiert 25 % (Spur-Einstellung, nicht Sound).
- **Lage / Rolle:** Probe C♯4–B5 (61–83). **Grenze C4–C6**, nächstliegende Oktave. **Akkord-Reaktion:** nächstliegend.
- **Hörprobe** (A-Dur, I–vi–IV–V als 16tel-Arpeggio; jedes Muster anders gebrochen):
```
Tempo 120 BPM · 4 Takte · Akkorde: A | F#m | D | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A4(69) 0/1/108 · C#5(73) 1/1/78 · E5(76) 2/1/90 · A5(81) 3/1/78 · E5(76) 4/1/108 · C#5(73) 5/1/78 · A4(69) 6/1/90 · E4(64) 7/1/78 · A4(69) 8/1/104 · C#5(73) 9/1/78 · E5(76) 10/1/90 · B5(83) 11/1/78 · A5(81) 12/1/108 · E5(76) 13/1/78 · C#5(73) 14/1/90 · B4(71) 15/1/78
T2: F#4(66) 16/1/108 · A4(69) 17/1/78 · C#5(73) 18/1/90 · F#5(78) 19/1/78 · C#5(73) 20/1/108 · A4(69) 21/1/78 · F#4(66) 22/1/90 · C#4(61) 23/1/78 · F#4(66) 24/1/104 · A4(69) 25/1/78 · C#5(73) 26/1/90 · E5(76) 27/1/78 · F#5(78) 28/1/108 · C#5(73) 29/1/78 · A4(69) 30/1/90 · Ab4(68) 31/1/78
T3: D4(62) 32/1/108 · F#4(66) 33/1/78 · A4(69) 34/1/90 · D5(74) 35/1/78 · A4(69) 36/1/108 · F#4(66) 37/1/78 · D4(62) 38/1/90 · A4(69) 39/1/78 · F#5(78) 40/1/104 · D5(74) 41/1/78 · A4(69) 42/1/90 · F#4(66) 43/1/78 · E5(76) 44/1/108 · D5(74) 45/1/78 · A4(69) 46/1/90 · F#4(66) 47/1/78
T4: E4(64) 48/1/114 · Ab4(68) 49/1/84 · B4(71) 50/1/96 · E5(76) 51/1/84 · B4(71) 52/1/114 · Ab4(68) 53/1/84 · E4(64) 54/1/96 · B4(71) 55/1/84 · Ab5(80) 56/1/110 · E5(76) 57/1/84 · B4(71) 58/1/96 · Ab4(68) 59/1/84 · D5(74) 60/1/114 · B4(71) 61/1/84 · Ab4(68) 62/1/96 · E4(64) 63/1/84
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe C#4–B5 (61–83)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.25,69,0.85],[0.25,0.25,73,0.61],[0.5,0.25,76,0.71],[0.75,0.25,81,0.61],[1,0.25,76,0.85],[1.25,0.25,73,0.61],[1.5,0.25,69,0.71],[1.75,0.25,64,0.61],[2,0.25,69,0.82],[2.25,0.25,73,0.61],[2.5,0.25,76,0.71],[2.75,0.25,83,0.61],[3,0.25,81,0.85],[3.25,0.25,76,0.61],[3.5,0.25,73,0.71],[3.75,0.25,71,0.61],[4,0.25,66,0.85],[4.25,0.25,69,0.61],[4.5,0.25,73,0.71],[4.75,0.25,78,0.61],[5,0.25,73,0.85],[5.25,0.25,69,0.61],[5.5,0.25,66,0.71],[5.75,0.25,61,0.61],[6,0.25,66,0.82],[6.25,0.25,69,0.61],[6.5,0.25,73,0.71],[6.75,0.25,76,0.61],[7,0.25,78,0.85],[7.25,0.25,73,0.61],[7.5,0.25,69,0.71],[7.75,0.25,68,0.61],[8,0.25,62,0.85],[8.25,0.25,66,0.61],[8.5,0.25,69,0.71],[8.75,0.25,74,0.61],[9,0.25,69,0.85],[9.25,0.25,66,0.61],[9.5,0.25,62,0.71],[9.75,0.25,69,0.61],[10,0.25,78,0.82],[10.25,0.25,74,0.61],[10.5,0.25,69,0.71],[10.75,0.25,66,0.61],[11,0.25,76,0.85],[11.25,0.25,74,0.61],[11.5,0.25,69,0.71],[11.75,0.25,66,0.61],[12,0.25,64,0.9],[12.25,0.25,68,0.66],[12.5,0.25,71,0.76],[12.75,0.25,76,0.66],[13,0.25,71,0.9],[13.25,0.25,68,0.66],[13.5,0.25,64,0.76],[13.75,0.25,71,0.66],[14,0.25,80,0.87],[14.25,0.25,76,0.66],[14.5,0.25,71,0.76],[14.75,0.25,68,0.66],[15,0.25,74,0.9],[15.25,0.25,71,0.66],[15.5,0.25,68,0.76],[15.75,0.25,64,0.66]]`
- **Karte:** „Gläsernes 16tel-Arpeggio – erinnert an verträumten Synthwave-Pop (Stil Electric Youth).“

#### CR-21 „Innenwelt-Fläche“ – Rolle Fläche · VA (neu)

- **Vorbild (ⓘ):** Stil-Entwurf (UNBELEGT): verträumte Fläche mit einer langsam singenden Oberstimme, „nicht die Vergangenheit nachbauen“ (Bandaussage BELEGT).
- **Rezept:** `o1w 1, o1pw .4, o2w 0, o2fine -7, o2lvl .6, noise .06, ftype 1, cutoff 2000, res .1, drive .05, kt .4, fenv .18, fA .9, fD 2, fS .65, fR 2, aA .8, aD 1.5, aS .9, aR 2.2, ampVel .3, poly 6, l1shape 1, l1rate .2, l2shape 0, l2rate 4.8, l2fade .8, analog .25, spread .5` · Routen `M('lfo1','pw', .2)`, `M('lfo2','pitch', .002)` · fx `{chorus:{mode:'I+II', mix .55}, rev .55, dly .15}`
- **Warum so:** Rauschen 6 % = „Luft“ wie ein Atem in der Fläche; das verzögerte Vibrato (LFO 2, Einblendung 0,8 s) lässt gehaltene Oberstimmen singen; Chorus I+II macht sie weit. LP12 statt LP24 = heller als „Juno-Pad“.
- **Abgrenzung:** Werk „PWM-Fläche“ (zwei Pulse, kein Rauschen, kein Vibrato), „Samtpolster“ (500 Hz, dunkel), C2-03 (Sägen, ENS): hier Luft + Vibrato + hell.
- **Lage / Rolle:** Probe G♯3–C♯5 (56–73). Fläche-Regel, **Grenze G♯3–C♯5**. **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (A-Dur; Akkord liegt, darüber eine eigene steigende Oberstimme):
```
Tempo 120 BPM · 4 Takte · Akkorde: A | F#m | D | E
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: A3(57) 0/16/66 · C#4(61) 0/16/66 · E4(64) 0/16/66 · A4(69) 0/8/74 · B4(71) 8/8/70
T2: A3(57) 16/16/66 · C#4(61) 16/16/66 · F#4(66) 16/16/66 · A4(69) 16/8/72 · C#5(73) 24/8/76
T3: A3(57) 32/16/66 · D4(62) 32/16/66 · F#4(66) 32/16/66 · A4(69) 32/12/74 · B4(71) 44/4/68
T4: Ab3(56) 48/16/70 · B3(59) 48/16/70 · E4(64) 48/16/70 · B4(71) 48/8/74 · Ab4(68) 56/8/70
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe Ab3–C#5 (56–73)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,57,0.52],[0,4,61,0.52],[0,4,64,0.52],[0,2,69,0.58],[2,2,71,0.55],[4,4,57,0.52],[4,4,61,0.52],[4,4,66,0.52],[4,2,69,0.57],[6,2,73,0.6],[8,4,57,0.52],[8,4,62,0.52],[8,4,66,0.52],[8,3,69,0.58],[11,1,71,0.54],[12,4,56,0.55],[12,4,59,0.55],[12,4,64,0.55],[12,2,71,0.58],[14,2,68,0.55]]`
- **Karte:** „Luftige, singende Fläche mit Vibrato in der Oberstimme – erinnert an verträumten Synthwave-Pop (Stil Electric Youth).“

### 4.3 Dance With the Dead (`vorbild: dance-with-the-dead`, neu, „u Geräte“)

| Fakt | Status | Quelle |
|---|---|---|
| Duo **Justin Pointer** (Synth) und **Tony Kim** (Gitarren), live mit Schlagzeuger John Terry; Rollen im Studio austauschbar | BELEGT (SE) | https://en.wikipedia.org/wiki/Dance_with_the_Dead |
| Stil: „analog synth textures with the raw grit of early heavy metal guitars“; Einflüsse John Carpenter, Justice, Daft Punk, Metallica | BELEGT (SE) | https://en.wikipedia.org/wiki/Dance_with_the_Dead · https://motorcomusic.com/?p=10404 |
| Synth-/Gitarren-Modelle | **UNBELEGT** (Bloody-Disgusting-Interview nur angerissen) | https://bloody-disgusting.com/music/3546175/horror-dance-dead-qa-one-beloved-bands-synthwave/ |

**Hinweis:** Die Metal-Gitarre ist **der** Kennklang; der Synth kann sie nur annähern (§7). Drums: Verweis auf CB3 „Raserei-Kit“ (`vorbild-retro.md` §5.6), kein neues Kit.

#### CR-22 „Gruftgalopp-Bass“ – Rolle Bass · VA (neu)

- **Vorbild (ⓘ):** Galopp-Rhythmus aus dem Heavy Metal auf dem Synthbass (Stil BELEGT als Einfluss; Klang UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2fine -9, o2lvl .8, o3w 1, o3oct -1, o3lvl .4, ftype 0, cutoff 800, res .2, drive .7, kt .4, fenv .4, fvel .5, fA .001, fD .09, fS .15, fR .05, aA .001, aD .12, aS .25, aR .03, ampVel .55, mode 1, poly 1, reset 1, analog .15, spread 0` · fx `{drive .45, rev .05}`
- **Warum so:** Kurzes Amp-Decay mit 25 % Sustain = „abgedämpft“ wie Palm-Mute; zwei verstimmte Sägen + Puls −1 Okt + viel Drive = Metall-Druck. Das Muster Achtel + zwei 16tel ist Allerwelts-Technik (frei).
- **Abgrenzung:** CB1 „Dunkelfahrt-Bass“ (Darksynth-Bass, lang), YM3/Triolen-Galopp-Sounds (Disco-Galopp per Delay): hier **gedämpfter Metal-Galopp**.
- **Lage / Rolle:** Probe H1–G2 (35–43). **Grundton-Bereich A1–F♯2.** **Akkord-Reaktion:** nächstliegend, Bass-Regel.
- **Hörprobe** (e-Moll, 150 BPM, Galopp auf jedem Schlag; T2 mit Terz-Sekund-Wechsel, T3 Schluss F♯–E–C♯ abwärts zum H):
```
Tempo 150 BPM · 4 Takte · Akkorde: Em | C | D | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E2(40) 0/2/108 · E2(40) 2/1/80 · E2(40) 3/1/86 · E2(40) 4/2/108 · E2(40) 6/1/80 · E2(40) 7/1/86 · E2(40) 8/2/108 · E2(40) 10/1/80 · E2(40) 11/1/86 · G2(43) 12/2/108 · G2(43) 14/1/80 · G2(43) 15/1/86
T2: C2(36) 16/2/108 · C2(36) 18/1/80 · C2(36) 19/1/86 · C2(36) 20/2/108 · C2(36) 22/1/80 · C2(36) 23/1/86 · E2(40) 24/2/108 · E2(40) 26/1/80 · E2(40) 27/1/86 · D2(38) 28/2/108 · D2(38) 30/1/80 · D2(38) 31/1/86
T3: D2(38) 32/2/108 · D2(38) 34/1/80 · D2(38) 35/1/86 · D2(38) 36/2/108 · D2(38) 38/1/80 · D2(38) 39/1/86 · D2(38) 40/2/108 · D2(38) 42/1/80 · D2(38) 43/1/86 · F#2(42) 44/2/108 · E2(40) 46/1/80 · C#2(37) 47/1/86
T4: B1(35) 48/2/114 · B1(35) 50/1/86 · B1(35) 51/1/92 · B1(35) 52/2/114 · B1(35) 54/1/86 · B1(35) 55/1/92 · Eb2(39) 56/2/114 · Eb2(39) 58/1/86 · Eb2(39) 59/1/92 · F#2(42) 60/2/114 · F#2(42) 62/1/86 · F#2(42) 63/1/92
```
Dauer: alle 4 Takte 6,4 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,4 s · Lage der Probe B1–G2 (35–43)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,40,0.85],[0.5,0.25,40,0.63],[0.75,0.25,40,0.68],[1,0.5,40,0.85],[1.5,0.25,40,0.63],[1.75,0.25,40,0.68],[2,0.5,40,0.85],[2.5,0.25,40,0.63],[2.75,0.25,40,0.68],[3,0.5,43,0.85],[3.5,0.25,43,0.63],[3.75,0.25,43,0.68],[4,0.5,36,0.85],[4.5,0.25,36,0.63],[4.75,0.25,36,0.68],[5,0.5,36,0.85],[5.5,0.25,36,0.63],[5.75,0.25,36,0.68],[6,0.5,40,0.85],[6.5,0.25,40,0.63],[6.75,0.25,40,0.68],[7,0.5,38,0.85],[7.5,0.25,38,0.63],[7.75,0.25,38,0.68],[8,0.5,38,0.85],[8.5,0.25,38,0.63],[8.75,0.25,38,0.68],[9,0.5,38,0.85],[9.5,0.25,38,0.63],[9.75,0.25,38,0.68],[10,0.5,38,0.85],[10.5,0.25,38,0.63],[10.75,0.25,38,0.68],[11,0.5,42,0.85],[11.5,0.25,40,0.63],[11.75,0.25,37,0.68],[12,0.5,35,0.9],[12.5,0.25,35,0.68],[12.75,0.25,35,0.72],[13,0.5,35,0.9],[13.5,0.25,35,0.68],[13.75,0.25,35,0.72],[14,0.5,39,0.9],[14.5,0.25,39,0.68],[14.75,0.25,39,0.72],[15,0.5,42,0.9],[15.5,0.25,42,0.68],[15.75,0.25,42,0.72]]`
- **Karte:** „Gedämpfter Galopp-Bass mit Metal-Druck – erinnert an Synthwave mit Heavy-Metal-Einschlag (Stil Dance With the Dead).“

#### CR-23 „Sägeblatt-Lead“ – Rolle Lead · VA (neu)

- **Vorbild (ⓘ):** Gitarren-Ersatz: Synth-Lead mit Quinte und Verzerrung (Stil BELEGT, Klang UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2semi 7, o2fine 4, o2lvl .65, o3w 1, o3oct -1, o3lvl .3, ftype 1, cutoff 2800, res .15, drive .6, kt .6, fenv .2, fA .005, fD .3, fS .7, fR .2, aA .004, aD .2, aS .95, aR .2, ampVel .35, mode 2, poly 1, glide .025, l2shape 0, l2rate 6, l2fade .5, analog .15, spread 0` · Route `M('lfo2','pitch', .004)` · fx `{drive .55, rev .25, dly .2}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .25}}`
- **Warum so:** Oszillator 2 eine **Quinte** höher (`o2semi 7`) = Powerchord in einer Taste, wie eine verzerrte Gitarre. Spur-Drive 55 % + verzögertes, kräftiges Vibrato = „Solo“. Achtung Harmonie: Die Quinte ist fest; über Akkorden mit verminderter Quinte (H-Dur im Takt 4: F♯ passt) prüfen.
- **Abgrenzung:** CB2 „Höllenfahrt-Lead“, Werk „Sync-Lead“: dort keine feste Quinte.
- **Lage / Rolle:** Probe H4–H5 (71–83). **Grenze tief A4.** **Akkord-Reaktion:** Lead-Regel.
- **Hörprobe** (e-Moll, 150 BPM):
```
Tempo 150 BPM · 4 Takte · Akkorde: Em | C | D | B
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E5(76) 0/4/104 · G5(79) 4/2/94 · F#5(78) 6/2/90 · E5(76) 8/4/98 · B4(71) 12/2/88 · E5(76) 14/2/92
T2: G5(79) 16/6/106 · E5(76) 22/2/90 · C5(72) 24/4/94 · E5(76) 28/4/96
T3: F#5(78) 32/4/100 · A5(81) 36/2/96 · G5(79) 38/2/92 · F#5(78) 40/4/98 · D5(74) 44/2/88 · F#5(78) 46/2/92
T4: Eb5(75) 48/4/102 · F#5(78) 52/4/104 · B5(83) 56/4/112 · A5(81) 60/4/104
```
Dauer: alle 4 Takte 6,4 s · kurz (≤ 8 s) T1, T2, T3, T4 = 6,4 s · ganz (≤ 16 s) T1, T2, T3, T4 = 6,4 s · Lage der Probe B4–B5 (71–83)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,1,76,0.82],[1,0.5,79,0.74],[1.5,0.5,78,0.71],[2,1,76,0.77],[3,0.5,71,0.69],[3.5,0.5,76,0.72],[4,1.5,79,0.83],[5.5,0.5,76,0.71],[6,1,72,0.74],[7,1,76,0.76],[8,1,78,0.79],[9,0.5,81,0.76],[9.5,0.5,79,0.72],[10,1,78,0.77],[11,0.5,74,0.69],[11.5,0.5,78,0.72],[12,1,75,0.8],[13,1,78,0.82],[14,1,83,0.88],[15,1,81,0.82]]`
- **Karte:** „Verzerrter Quint-Lead wie eine Metal-Gitarre – erinnert an Synthwave mit Heavy-Metal-Einschlag (Stil Dance With the Dead).“

### 4.4 Kavinsky – Lücke DX7 (Ergänzung zu `vorbild-retro.md` §5.5)

| Fakt | Status | Quelle |
|---|---|---|
| Kavinsky habe in einem Interview gesagt, dass **„Teddy Boy“ komplett auf einem Yamaha DX7** geschrieben und aufgenommen wurde; Musik zuerst auf einem alten Apple-Rechner von Mr. Oizo | WAHRSCHEINLICH (SE, Wikipedia-Spiegel; Interview selbst nicht gesehen) | https://encycloreader.org/r/wikipedia.php?q=Kavinsky · https://www.Wikipedia.org/wiki/Kavinsky |
| „Nightcall“ (2010) im Film „Drive“ (2011) | BELEGT (SE) | dieselben |
| Ein MusicRadar-Auszug meldet Kavinskys Tod (Paris, „aged 50“) | **WAHRSCHEINLICH (eine Quelle) – nicht prüfen lassen ohne zweite Quelle, nie in einen ⓘ-Text; ⓘ ohne Lebensdaten formulieren** | https://www.musicradar.com/artists/kavinsky-the-french-artist-behind-nightcall-dies-aged-50 |
| Geräte von „Nightcall“ | weiter nur Reverb-Machine-Analyse (WAHRSCHEINLICH, `vorbild-retro.md`) | – |

#### CR-24 „Chromfelgen-Lead FM“ – Rolle Lead · FM6 (neu)

- **Vorbild (ⓘ):** „ganze EP auf einem DX7“ (WAHRSCHEINLICH); Patch UNBELEGT. **Kein Gerätename im Namen.**
- **Rezept:** `alg 5, fb 6` (drei Paare 1←2, 3←4, 5←6; Rückkopplung auf OP6)
  - OP1 `OP(1, 99, [95, 40, 30, 60], [99, 90, 85, 0], {vs 2})` – Träger, hält (L3 85 = Lead).
  - OP2 `OP(1, 78, [99, 50, 35, 60], [99, 80, 70, 0], {vs 4})` – Modulator 1:1 → sägeartig, Anschlag macht heller.
  - OP3 `OP(2, 82, [95, 40, 30, 60], [99, 88, 80, 0], {det 3})` – Träger eine Oktave höher (Glanz).
  - OP4 `OP(1, 66, [99, 60, 40, 60], [99, 70, 55, 0], {vs 3})`.
  - OP5 `OP(1, 85, [95, 40, 30, 60], [99, 90, 85, 0], {det -3})` – Schwebung gegen OP1.
  - OP6 `OP(1, 72, [99, 45, 35, 60], [99, 85, 70, 0])` – mit Rückkopplung 6 = rauer Obertonanteil.
  - common `{mode 2, poly 1, glide .02, lfo:{wave 'sine', rate 5.6, delay .5, pitch .06}}` · fx `{chorus:{mode:'I', mix .4}, rev .3, dly .2}` · bus `{echo:{mode:'pp', divL:'1/8.', fb .3}}`
- **Warum so:** Drei 1:1-Paare mit Rückkopplung ergeben einen sägeähnlichen, metallisch-glatten FM-Lead; OP3 auf 2:1 legt Glanz darüber; Verstimmung ±3 gegen Schwebung. FM-Leads der 80er klingen härter und „glasiger“ als VA (eK). Pitch-EG für einen Einschwing-Schleifer fehlt (§7).
- **Abgrenzung:** KV1/KV2 (VA, Juno-Charakter), MM1/MM2 (FM-Bass/Brass), Werk „DX-Tines“ (E-Piano, Sustain 0): hier **gehaltener FM-Lead**.
- **Lage / Rolle:** Probe C5–C6 (72–84). **Grenze tief C5.** **Akkord-Reaktion:** Lead-Regel.
- **Hörprobe** (f-Moll, i–VI–VII–V; Takt 4 C-Dur mit E als Leitton):
```
Tempo 120 BPM · 4 Takte · Akkorde: Fm | Db | Eb | C
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: C5(72) 0/2/96 · F5(77) 2/2/92 · Ab5(80) 4/4/104 · G5(79) 8/2/90 · F5(77) 10/2/88 · C5(72) 12/4/94
T2: C#5(73) 16/2/94 · F5(77) 18/2/90 · Ab5(80) 20/2/98 · Bb5(82) 22/2/100 · Ab5(80) 24/4/96 · F5(77) 28/4/90
T3: Eb5(75) 32/2/96 · G5(79) 34/2/92 · Bb5(82) 36/4/104 · C6(84) 40/2/108 · Bb5(82) 42/2/96 · G5(79) 44/4/92
T4: E5(76) 48/4/100 · G5(79) 52/2/96 · Bb5(82) 54/2/100 · C6(84) 56/4/110 · E5(76) 60/4/96
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe C5–C6 (72–84)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,0.5,72,0.76],[0.5,0.5,77,0.72],[1,1,80,0.82],[2,0.5,79,0.71],[2.5,0.5,77,0.69],[3,1,72,0.74],[4,0.5,73,0.74],[4.5,0.5,77,0.71],[5,0.5,80,0.77],[5.5,0.5,82,0.79],[6,1,80,0.76],[7,1,77,0.71],[8,0.5,75,0.76],[8.5,0.5,79,0.72],[9,1,82,0.82],[10,0.5,84,0.85],[10.5,0.5,82,0.76],[11,1,79,0.72],[12,1,76,0.79],[13,0.5,79,0.76],[13.5,0.5,82,0.79],[14,1,84,0.87],[15,1,76,0.76]]`
- **Karte:** „Glatt-harter FM-Lead mit Echo – erinnert an French-Touch-Retrowave der 2000er (Stil Kavinsky).“

### 4.5 Michael Oakley – Lücke Ensoniq/SY85 (Ergänzung zu `vorbild-retro.md` §5.9)

| Fakt | Status | Quelle |
|---|---|---|
| In Glasgow geboren, lebt in der Gegend von Toronto; bekannt seit der Mini-LP „California“ (2017) | BELEGT (SE, 2 Quellen) | https://www.electricityclub.co.uk/?p=115895 · https://theplayground.co.uk/exclusive-interview-five-minutes-with-michael-oakley/ |
| Hardware: besonders **Ensoniq** – **VFX, TS10, MR Rack** – und **Yamaha SY85** | **WAHRSCHEINLICH** (SE, eine Quelle, nicht reproduziert: Treffer der Seite ja, aber kein Auszug nennt die Modelle; bis das Interview gelesen ist) | https://theplayground.co.uk/exclusive-interview-five-minutes-with-michael-oakley/ |
| Debüt „Introspect“ (NewRetroWave, 2019) mit „Yamaha DX and Fairlight-style sounds“; bevorzugt 80er-Klänge mit moderner Produktion | WAHRSCHEINLICH (SE, Zusammenfassung mehrerer Auszüge) | https://vehlinggo.com/2021/06/20/michael-oakley-odyssey-interview/amp/ · https://splice.com/sounds/packs/sample-magic/popwave/story |
| Neues Album „Prologue“, Rezension 06/2026 | WAHRSCHEINLICH (SE) | https://vehlinggo.com/2026/06/01/michael-oakley-prologue-synthwave-album-review/ |

#### CR-25 „Transwellen-Fläche“ – Rolle Fläche · WT (neu)

- **Vorbild (ⓘ):** Transwave-Wavetable-Synth der frühen 90er mit wandernden Wellenformen (Stil; Gerät WAHRSCHEINLICH, Patch UNBELEGT).
- **Rezept (WT, Schreibweise `WT_FACTORY`):** `{ftype 1, cutoff 3200, res .1, fenv .2, kt .3, fA .3, fD 1.5, fS .7, fR 1.5, aA .35, aD 1, aS .85, aR 1.6, poly 6, l1shape 0, l1rate .2, wt: {table 'glas', pos .3, scan .5, scanTime 4}}` · Route `['lfo1','cutoff', .06]` · fx `{chorus:{mode:'I', mix .5}, rev .45, dly .1, vol .7}`
- **Warum so:** Die Tabelle wandert in 4 s von weich nach glasig = der „digitale Schimmer“ dieser Geräte (eK). LP12 offen, Chorus I für 80er-Breite.
- **Abgrenzung:** Werk „WT Vokal-Fläche“ (spricht O–A–E), „WT Glas“ (Glocke, Sustain 0): hier gehaltene Fläche mit langsamem Glas-Scan.
- **Lage / Rolle:** Probe D4–D5 (62–74). Fläche-Regel, **Grenze C4–D5**. **Akkord-Reaktion:** keine Voreinstellung.
- **Hörprobe** (C-Dur, I–V–vi–IV/V):
```
Tempo 120 BPM · 4 Takte · Akkorde: C | G | Am | F G
Format je Note: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1
T1: E4(64) 0/16/74 · G4(67) 0/16/74 · C5(72) 0/16/74
T2: D4(62) 16/8/72 · G4(67) 16/8/72 · B4(71) 16/8/72 · D4(62) 24/8/76 · G4(67) 24/8/76 · D5(74) 24/8/76
T3: E4(64) 32/16/74 · A4(69) 32/16/74 · C5(72) 32/16/74
T4: F4(65) 48/8/76 · A4(69) 48/8/76 · C5(72) 48/8/76 · D4(62) 56/8/82 · G4(67) 56/8/82 · B4(71) 56/8/82
```
Dauer: alle 4 Takte 8,0 s · kurz (≤ 8 s) T1, T2, T3, T4 = 8,0 s · ganz (≤ 16 s) T1, T2, T3, T4 = 8,0 s · Lage der Probe D4–D5 (62–74)
aud-Daten kurz (`len 4`, [Schlag, Dauer, MIDI, v 0–1]): `[[0,4,64,0.58],[0,4,67,0.58],[0,4,72,0.58],[4,2,62,0.57],[4,2,67,0.57],[4,2,71,0.57],[6,2,62,0.6],[6,2,67,0.6],[6,2,74,0.6],[8,4,64,0.58],[8,4,69,0.58],[8,4,72,0.58],[12,2,65,0.6],[12,2,69,0.6],[12,2,72,0.6],[14,2,62,0.65],[14,2,67,0.65],[14,2,71,0.65]]`
- **Karte:** „Schimmernde Digitalfläche, die langsam gläsern wird – erinnert an heutigen Synthwave-Pop mit Späte-80er-Digitalklang (Stil Michael Oakley).“

### 4.6 Belegprüfung der übrigen Retro-Acts (`vorbild-retro.md` stand ohne Web-Recherche)

| Act | Neu gefunden (17.10.2026, nur Suchauszüge) | Status | Quelle | Folge für `vorbild-retro.md` |
|---|---|---|---|---|
| **Timecop1983** | Zitat: meist Freeware **Synth1, OB-Xd, TAL-U-NO-62**, dazu **D16 LuSH-101, u-he Zebra2, Arturia Spark**; DAW **FL Studio**; Hardware **Alesis Micron, Yamaha AN1x, Korg Radias, Roland D-50, Roland Alpha Juno**, **Juno-106** neu dazu. Musik ab 12 mit **Scream Tracker** | WAHRSCHEINLICH (eine Sekundärquelle mit Zitat) + Tracker BELEGT (Vehlinggo-Interview) | https://reverbmachine.com/blog/timecop1983-synth-sounds · https://vehlinggo.com/2015/07/01/timecop1983-interview-reflections-synthwave-retrosynth/ | **Korrektur:** dort „TAL-Juno“ → **TAL-U-NO-62** (Juno-60-Nachbau). Gerätefakten bleiben WAHRSCHEINLICH, aber jetzt mit Zitat. TC1/TC2 passen. |
| **Carpenter Brut** | Interview 2018: **Ableton Live**, viele Plug-ins von **Arturia und Korg**; Hardware **DSI Pro 2, Prophet-6, OB-6**; OB-6 in Live-Video von „Leather Teeth“ sichtbar. Equipboard-Liste (älter): Mini Brute, Modor NF-1, UA-Karte, PMC | Interview BELEGT (SE); Equipboard WAHRSCHEINLICH | https://vehlinggo.com/2018/12/06/carpenter-brut-interview/ · https://equipboard.com/pros/carpenter-brut | Belegstatus „u“ → **„b Geräte (2018), u Patch“**. CB1–CB3 passen (Prophet-/OB-Charakter, Drive). |
| **Perturbator** | Software-Emulationen u. a. **OB-X** und **CS-80**; komponiert „wie einen Metal-Track“; live mehrere Synths + Begleitspur | WAHRSCHEINLICH (Fan-Wiki + Magazin, SE) | https://synthwave.fandom.com/wiki/Perturbator · https://www.slugmag.com/?p=42951 · https://develop.vice.com/en/article/perturbator-interview-2016/ | „u“ → „w Geräte (Emulationen)“. PT2-Fläche darf „CS-80-artig“ im ⓘ (vorsichtig). |
| **Gunship** | Equipboard (Nutzerbeiträge aus Social Media): **Korg Minilogue, Sequential Prophet-6**, Moog, Analogue Solutions Leipzig, Strymon-Effekte; Band „vintage analogue synthesizers“ | WAHRSCHEINLICH (schwach) | https://equipboard.com/pros/dan-haigh · https://lollipopmagazine.com/?p=219909 | Gründung 2014, Haigh/Westaway auch Fightstar: BELEGT (https://en.wikipedia.org/wiki/Gunship_(band)). Geräte bleiben „w“. |
| **FM-84** | **Col Bennett**, in Schottland geboren, in San Francisco; „Atlas“ (2016); „bright and fast arpeggiated synth“ | BELEGT Person (SE, 2 Quellen); Stil WAHRSCHEINLICH | https://vehlinggo.com/fm-84/ · https://www.axs.com/artists/1107058/fm-84-tickets · https://vinylodge.altervista.org/fm-84-atlas/ | Geräte weiter UNBELEGT. Gedächtnis-Angaben in §5.2 dort zu Person jetzt bestätigt. |
| **Mitch Murder** | **Johan Bengtsson**, Stockholm; Hauptwerkzeug Tracker **Renoise**; Vorbilder Paul Hardcastle, Jan Hammer, Vince DiCola | BELEGT (SE, Wikipedia + Interview-Zitat) | https://en.wikipedia.org/wiki/Mitch_Murder · https://vehlinggo.com/2015/07/26/mitch-murder-kung-fury-80s-retro-interview/amp/ | **Hinweis:** MM1/MM2 sind FM6-Klänge; Renoise ist Software – „DX7“ im ⓘ von MM1/MM2 nur als **Klangtyp**, nie als „Gerät von Mitch Murder“. |
| **Lazerhawk** | **Garrett Hays** (auch „Hayes“), Austin (Texas); „robot pop mixed with dark synths“; „Redline“ 2010 oder 2011 (Quellen uneinig) | BELEGT Person (SE, Label); Jahr WAHRSCHEINLICH | https://rossocorsarecords.com/artists/lazerhawk/ · https://echoesanddust.com/2017/03/lazerhawk-dreamrider/ | Geräte UNBELEGT. Schreibweise im ⓘ: „Lazerhawk“ ohne bürgerlichen Namen. |
| **The Midnight** | nicht neu geprüft (in R8 belegt) | – | `r8/studio-setups.md` §1.20 | – |

---

## 5. Übersicht: Rolle, Lage, Akkord-Reaktion, Tempo

| ID | Name | Act (Tag) | Engine | Rolle | Lage (Grundton-Bereich bzw. Grenze) | Akkord-Reaktion | Probe | neu? |
|---|---|---|---|---|---|---|---|---|
| CR-01 | Giftzahn-Lead | kas-product | VA | Lead | tief G4 | Lead-Regel | 138 BPM a-Moll | neu |
| CR-02 | Hetzpuls-Bass | kas-product | VA | Bass | A1–F♯2 (+Okt) | nächstl., Bass | 138 BPM e-Moll | neu |
| CR-03 | PWM-Fläche | martin-dupont | VA | Fläche | G♯3–A4 | – | 112 BPM fis-Moll | Werk |
| CR-04 | Salonbass 84 | martin-dupont | VA | Bass | A1–F♯2 (+Okt) | nächstl., Bass | 112 BPM fis-Moll | neu (Prüfung vs. DK-07) |
| CR-05 | Bandecho-Sequenz | trisomie-21 | VA | Sequenz | C4–G5 | nächstl. | 120 BPM d-Moll | neu |
| CR-06 | Grauschleier-Fläche | trisomie-21 | VA | Fläche | C4–D5 | – | 120 BPM d-Moll | C2-03 |
| CR-07 | Ensemble-Streicher | asylum-party | VA | Fläche | C4–D5 | – | 132 BPM e-Moll | Werk |
| CR-08 | Einzelgänger-Bass | linea-aspera | VA | Bass | A1–G2 (+Okt) | nächstl., Bass | 126 BPM g-Moll | neu |
| CR-09 | Dünnglas-Akkord | linea-aspera | VA | Akkord (Rolle Sequenz) | F4–G5 | nächstl. | 126 BPM g-Moll | neu |
| CR-10 | Chorus-Saitenbass | lebanon-hanover | VA | Bass (Melodie) | A1–E2, Melodie bis D3 | `dirAt {H: ↓}` | 136 BPM e-Moll | DK-07 |
| CR-11 | Kaltstahl-Kit | linea-aspera | Drum | Drums | – | – | 126 BPM | neu |
| CR-12 | Trübsal-Kit | lebanon-hanover | Drum | Drums | – | – | 136 BPM | neu (Prüfung vs. C2-04) |
| CR-13 | Fiebertraum-Bass | boy-harsher | VA | Bass | C2–F2 (+Okt) | `dirAt {C: ↓}` | 100 BPM f-Moll | neu |
| CR-14 | Schwitzkasten-Kit | boy-harsher | Drum | Drums | – | – | 100 BPM | neu |
| CR-15 | Moog-Bass | molchat-doma | VA | Bass | G1–D2 | nächstl., Bass | 132 BPM h-Moll | Werk |
| CR-16 | Neonröhren-Lead | molchat-doma | VA | Lead | tief A4 | Lead-Regel | 132 BPM h-Moll | neu |
| CR-17 | Plattenbau-Kit | molchat-doma | Drum | Drums | – | – | 132 BPM | neu |
| CR-18 | Heldenpuls-Bass | college | VA | Bass | A♭1–E♭2 (+Okt) | nächstl., Bass | 96 BPM Es-Dur | neu |
| CR-19 | Juno-Pad | college | VA | Fläche | G3–C5 | – | 96 BPM Es-Dur | Werk |
| CR-20 | Glas-Pluck | electric-youth | VA | Sequenz | C4–C6 | nächstl. | 120 BPM A-Dur | Werk |
| CR-21 | Innenwelt-Fläche | electric-youth | VA | Fläche | G♯3–C♯5 | – | 120 BPM A-Dur | neu |
| CR-22 | Gruftgalopp-Bass | dance-with-the-dead | VA | Bass | A1–F♯2 | nächstl., Bass | 150 BPM e-Moll | neu |
| CR-23 | Sägeblatt-Lead | dance-with-the-dead | VA | Lead | tief A4 | Lead-Regel | 150 BPM e-Moll | neu |
| CR-24 | Chromfelgen-Lead FM | kavinsky | FM6 | Lead | tief C5 | Lead-Regel | 120 BPM f-Moll | neu |
| CR-25 | Transwellen-Fläche | michael-oakley | WT | Fläche | C4–D5 | – | 120 BPM C-Dur | neu |

**Zählung:** **18 neue Sounds** – VA 12 (CR-01, 02, 04, 05, 08, 09, 13, 16, 18, 21, 22, 23), FM6 1 (CR-24), WT 1 (CR-25), Drum-Synth 4 (CR-11, 12, 14, 17). **7 Hörproben für vorhandene Sounds** (CR-03, 06, 07, 10, 15, 19, 20). Summe 25 Hörproben.

**Neue Vorbild-Tags:** `kas-product`, `martin-dupont`, `trisomie-21`, `asylum-party`, `linea-aspera`, `lebanon-hanover`, `boy-harsher`, `molchat-doma`, `college`, `electric-youth`, `dance-with-the-dead`. Prüfliste A.4 (Namensprüfung) ergänzen um: MS-20, MC-505, MPC, Poly-800, SH-09, Vermona, Ensoniq, SY85, DX7 (nur im ⓘ, nie im Namen; E9), „Touching Pop“ (Szene-Begriff).

---

## 6. Das Diktat „den Lause Bass und der so bei Ben V VIZE und Tiger und Centuries“ – dritter Anlauf

Vorher: `vorbild-coldwave2.md` §4 (9 Abfragen): wahrscheinlichste Deutung **Slap-House-Bass wie bei VIZE**; „Tiger und Centuries/Zyntherius“ ungelöst; Runde 2 nannte „VIZE, Stereoact, ‚Tiger und Zyntherius‘ = moderne schwere Bässe (Slap House?)“.

### 6.1 Neue Suche (17.10.2026, 6 Abfragen)

| Lesart | Ergebnis | Status | Quelle |
|---|---|---|---|
| **VIZE + Imanbek** | Treffer: **„Brother Louie“ (Juli 2020), VIZE × Imanbek × Dieter Bohlen feat. Leony** – Neufassung des **Modern-Talking-Hits von 1986**; Leonys Durchbruch; Chart DE 64, AT 58 | **BELEGT** (SE, 4 Quellen) | https://en.wikipedia.org/wiki/Leony · https://www.nrj.fr/artistes/vize/biographie · https://www.nau.ch/people/welt/dsds-interessante-fakten-zu-jurorin-leony-66392163 · https://viberate.com/artist/dieter-bohlen · https://mb.videolan.org/track/61ccd405-7a3c-471a-8077-9cce60db56a7 |
| Imanbek | kasachischer Produzent, Slap House; 2020 bekannt durch einen SAINt-JHN-Remix | BELEGT (SE) | https://djmag.com/top100djs/2021/100/VIZE · https://www.koolwaters.com/artists/imanbek |
| „Tiger“ als Slap-House-Act | nur **Tiger & Woods** (Disco-Edits, „Need Your Lovin’“), kein Slap House, kein deutscher Bezug; Tiger Stripes (Stockholm) | passt nicht | https://www.tunefind.com/artist/tiger-woods |
| Stereoact + Modern Talking/Bohlen | kein Treffer | UNBELEGT | – |
| VIZE + Modern-Talking-Remix 2023/24 | kein weiterer Treffer | UNBELEGT | – |
| „Laserbass“/Lazerhawk | kein Bezug zu Bass oder VIZE (Lazerhawk-Fakten §4.6) | **kein Beleg** | – |
| „VNV“ (VNV Nation) für „Ben V“ | lautlich schwach („Vau-En-Vau“), kein Bezug zu VIZE oder Slap House; VNV Nation steht schon in `vorbild-szene.md` | **kein Beleg** | – |
| „Tigers & Centuries“ | (schon in coldwave2: 0 Treffer) | **kein Beleg** | – |

### 6.2 Bewertung

- **Neuer Kandidat K2 „Brother Louie“ (VIZE × Imanbek × Dieter Bohlen):** In **einer echten Titelzeile** stehen drei Namen, die zu den Diktat-Wörtern passen: **VIZE** (wörtlich), **„Ben V“ ≈ Iman-bek** (Endsilbe; UNBELEGT), **„Tiger“ ≈ „Dieter“** (Spracherkennung, gleiche Vokale/Silbenzahl; UNBELEGT). Dazu passt Xanders Genre: Modern Talking ist 80er-Synthpop. „Lause“ könnte „Louie“ sein („den Louie-Bass“) – lautlich schwächer (UNBELEGT). Der Titel selbst ist **BELEGT**; die **Deutung** ist WAHRSCHEINLICHER als jede bisherige Lesart von „Tiger“, aber nicht belegt.
- **K1 „Slap-House-Bass (VIZE)“ bleibt gültig** und schließt K2 ein: „Brother Louie“ (2020) stammt von denselben Slap-House-Produzenten. Für die Bibliothek ändert sich **nichts**: Das vorläufige Angebot C2-13 (Slap-House-Bass) + C2-14 bleibt. **Keine Hörprobe nach der Melodie von „Brother Louie“** (Werkteil, Bohlen).
- **„Centuries/Zyntherius“ bleibt ungelöst.** Wenn K2 stimmt, wäre ein vierter Name der Zeile zu erwarten: „Leony“ passt lautlich nicht; „Thomas Anders“ (Modern Talking) ist reine Vermutung (UNBELEGT) – **nicht** als Kandidat führen.
- **Verworfen (kein Beleg):** Laserbass, VNV Nation, Tigers & Centuries, Tiger & Woods.

### 6.3 Rückfrage an Xander (kurz)

> „Meinst du mit ‚Lause Bass … VIZE … Tiger‘ vielleicht **‚Brother Louie‘ von VIZE, Imanbek und Dieter Bohlen** (2020, Slap-House-Neufassung von Modern Talking)? Oder allgemein den **Slap-House-Bass** von VIZE? Und was ist ‚Centuries‘ bzw. ‚Zyntherius‘ – kannst du den Namen buchstabieren oder einen Link schicken?“

---

## 7. Fehlende Bausteine (für Spec/Builder, nicht entschieden)

| Baustein | Für | Ersatz hier |
|---|---|---|
| E-Gitarre (Clean-Chorus, Distortion) | Asylum Party, Lebanon Hanover, Molchat Doma, Dance With the Dead, Kas Product | keiner im Synth; CR-23 nähert Powerchord-Lead an. Später: Audio-Spur/Mikrofon (P3) oder Resynthese-Paket |
| Hochpass **und** Tiefpass in Reihe (MS-20) | CR-01 | LP12 + Resonanz + Drive |
| Bandecho mit Sättigung und Gleichlauf | CR-05 | dunkles Echo + LFO/`rnd` auf Tonhöhe |
| Bitreduktion/Sampler-Grit (MPC, MC-505) | CR-13, CR-14 | Rauschen 4 % + Drive |
| Pitch-EG im FM6 | CR-24 (Einschwing-Schleifer) | keiner (`r8/fm-diagnose.md` §0) |
| Feste Quinte transponiert mit | CR-23 | `o2semi 7`; Hinweis im ⓘ: „klingt über verminderten Akkorden schief“ |

## 8. Prüfliste und offene Punkte

1. **Anhören (V10d):** CR-04 gegen DK-07, CR-12 gegen C2-04, CR-21 gegen Werk „PWM-Fläche“ blind vergleichen; zu nah → entfällt (dann bleibt nur die Hörprobe für den vorhandenen Sound).
2. **Kalibrierung −18 LUFS** und M-HANDYrel/M-BISS (V0d-11) für alle Bässe (CR-02, 04, 08, 13, 18, 22) vor V10d. CR-15 hat G1 (31) in der Probe: über dem Boden E1, aber Handy-Hörbarkeit prüfen.
3. **Nicht in ⓘ-Texte:** Todesmeldungen (Spatsz, Sobézyk, Kavinsky), Trennung (Boy Harsher), bürgerliche Namen, wo nicht nötig.
4. **Zweite Quelle suchen** (wenn Abruf wieder geht): MusicRadar-Interview Molchat Doma (Volltext), Linea-Aspera-Geräteliste (Label Dark Entries), Kas-Product-Rhythmusmaschine, Kavinsky-DX7-Interview, Lebanon-Hanover-Drumcomputer.
5. **Korrekturen an Geschwister-Dateien** (nur Vorschlag, nicht geschrieben): `vorbild-retro.md` Timecop1983 „TAL-Juno“ → „TAL-U-NO-62“; Carpenter Brut Belegstatus „b Geräte“; ID-Doppelung MO1/MO2 (Oakley) vs. MO1–MO3 (Moroder) auflösen; `vorbild-coldwave2.md` C2-13 „Gummi-Bass“ heißt wie Werk „Gummi-Bass“ (V0a Z. 5696) → umbenennen.
6. **Popularität > 1 Mio.** nicht geprüft außer Molchat Doma („Sudno“, TikTok-viral, BELEGT) und College/Kavinsky („Drive“-Soundtrack, eK).

## 9. Quellen (alle 17.10.2026, nur Suchauszüge; WebFetch: DNS-Fehler)

- Kas Product: https://beursschouwburg.be/en/events/kas-product-support/ · https://www.systemsofromance.com/blog/category/1982/page/9 · https://en.wikipedia.org/wiki/Try_Out_(Kas_Product_album) · https://xiapi.quotsoft.net/album/mb/mbZVJe92280 · https://post-punk.com/spatsz-from-french-coldwave-duo-kas-product-has-passed-away/ · https://postpunkmonk.com/2016/11/17/record-review-kas-product-by-pass-dlx-rm/
- Martin Dupont: https://en.wikipedia.org/wiki/Martin_Dupont · https://www.minimalwave.com/releases/release/hot-paradox · https://corpsdiplomatique.bandcamp.com · https://sfsonic.com/interviews/martin-dupont-interview/
- Trisomie 21: https://en.wikipedia.org/wiki/Trisomie_21 · https://fr.wikipedia.com/wiki/Trisomie_21_(groupe) · https://music.apple.com/artist/73782484 · https://www.qobuz.com/be-fr/interpreter/trisomie-21/74979 · https://www.parisbouge.com/events/186889 · https://alcuinfonds.be/blog/trisomie-21-black-label/ · https://xiapi.quotsoft.net/artist/xa/XAPc5aeb/
- Asylum Party: https://en.wikipedia.org/wiki/Asylum_Party · https://post-punk.com/french-coldwave-masters-asylum-party-receive-deluxe-reissue-treatment-by-cercle-social-records/amp · https://www.post-punk.com/thierry-sobezyk-co-vocalist-and-bassist-of-asylum-party-has-passed-away/
- Linea Aspera: https://www.strangeworldrecords.com.au/products/linea-aspera-preservation-bias-lp · https://goout.net/en/linea-aspera/pzlmteg/ · https://thebrvtalist.com/lineaaspera · https://www.nts.live/artists/14163-linea-aspera
- Lebanon Hanover: https://en.wikipedia.org/wiki/Lebanon_Hanover · https://last.fm/music/Lebanon+Hanover/+wiki · https://www.eventworld.com/lebanon-hanover-sydney-tickets-19-09-2026/event/422085
- Boy Harsher: https://en.wikipedia.org/wiki/Boy_Harsher · https://synthhistory.com/post/boy-harsher-recommends · https://www.vice.com/en/article/boy-harsher/ · https://www.arturia.com/stories/augustus-muller · https://equipboard.com/pros/boy-harsher · https://www.thefader.com/2026/09/10/boy-harsher-fader-mix
- Molchat Doma: https://americansongwriter.com/tiktok-sensations-molchat-doma-reimagine-80s-cold-wave-on-monument/ · https://en.wikipedia.org/wiki/Molchat_Doma · https://en.wikipedia.org/wiki/Etazhi · https://musicradar.com/news/molchat-doma-interview · https://articles.roland.com/a-few-minutes-with-molchat-doma/ · https://bmgator.org/24473/arts/music-review-molchat-domas-%d1%8d%d1%82%d0%b0%d0%b6%d0%b8/
- Clan of Xymox: https://rock.fandom.com/wiki/Clan_of_Xymox · https://en.wikipedia.com/wiki/Xymox · https://post-punk.com/clan-of-xymox-medusa/ · https://post-punk.com/dark-entries-to-reissue-clan-of-xymox-peel-sessions-on-vinyl/ · https://oye-records.com/releases/clan-of-xymox-peel-sessions · https://equipboard.com/band/clan-of-xymox
- Kirlian Camera: https://en.wikipedia.org/wiki/Kirlian_Camera · https://idieyoudie.com/2012/02/an-interview-with-angelo-bergamini-of-kirlian-camera/ · https://www.reflectionsofdarkness.com/releases/20956-kirlian-camera-reveal-details-of-new-double-album-cold-pills-scarlet-gate-of-toxic-daybreak-and-release-video-for-first-single-the-8th-president
- College / Electric Youth: https://www.allmusic.com/artist/college-mn0002130572 · https://ra.co/reviews/7116 · https://www.vice.com/en/article/electric-youth-interview · https://shorefire.com/releases/entry/electric-youth-sign-to-secretly-canadian-release-new-music-video
- Dance With the Dead: https://en.wikipedia.org/wiki/Dance_with_the_Dead · https://motorcomusic.com/?p=10404 · https://bloody-disgusting.com/music/3546175/horror-dance-dead-qa-one-beloved-bands-synthwave/
- Retro-Prüfung: https://encycloreader.org/r/wikipedia.php?q=Kavinsky · https://www.musicradar.com/artists/kavinsky-the-french-artist-behind-nightcall-dies-aged-50 · https://theplayground.co.uk/exclusive-interview-five-minutes-with-michael-oakley/ · https://www.electricityclub.co.uk/?p=115895 · https://vehlinggo.com/2021/06/20/michael-oakley-odyssey-interview/amp/ · https://reverbmachine.com/blog/timecop1983-synth-sounds · https://vehlinggo.com/2015/07/01/timecop1983-interview-reflections-synthwave-retrosynth/ · https://vehlinggo.com/2018/12/06/carpenter-brut-interview/ · https://equipboard.com/pros/carpenter-brut · https://synthwave.fandom.com/wiki/Perturbator · https://www.slugmag.com/?p=42951 · https://en.wikipedia.org/wiki/Gunship_(band) · https://equipboard.com/pros/dan-haigh · https://lollipopmagazine.com/?p=219909 · https://vehlinggo.com/fm-84/ · https://www.axs.com/artists/1107058/fm-84-tickets · https://en.wikipedia.org/wiki/Mitch_Murder · https://vehlinggo.com/2015/07/26/mitch-murder-kung-fury-80s-retro-interview/amp/ · https://rossocorsarecords.com/artists/lazerhawk/ · https://echoesanddust.com/2017/03/lazerhawk-dreamrider/
- Diktat: https://en.wikipedia.org/wiki/Leony · https://www.nrj.fr/artistes/vize/biographie · https://www.nau.ch/people/welt/dsds-interessante-fakten-zu-jurorin-leony-66392163 · https://viberate.com/artist/dieter-bohlen · https://mb.videolan.org/track/61ccd405-7a3c-471a-8077-9cce60db56a7 · https://djmag.com/top100djs/2021/100/VIZE · https://www.koolwaters.com/artists/imanbek · https://www.tunefind.com/artist/tiger-woods
- Recht: `vorbild-helden.md` §1, `r6/bibliothek-recherche.md` §5 (K22).
