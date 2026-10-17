# R7 – Vorbild-Szene: And One, Welle:Erdball, Elegant Machinery, S.P.O.C.K, Kirlian Camera, Project Pitchfork, Second Decay, Covenant, VNV Nation, Mesh, De/Vision, Camouflage (+ Kandidat Joy Division)

**Stand:** 17.10.2026 · Auftrag R7 „vorbild-szene“ · Grundlage: `fragen-xander-7.md` (L1–L3), `fragen-xander-8.md` (V: „Division“ = De/Vision, Hörproben nicht repetitiv, Lage T), `fragen-xander-9.md` (Studio-Setups), `fragen-xander-5.md`/`-6.md`, Spec v3 §12.8, Nachtrag 1 (VK, V10d), R6 `r6/bibliothek-recherche.md`, `SYNQUENZER-vision.md` §3.1, Geschwister-Dateien `r7/vorbild-helden.md`, `r7/vorbild-coldwave2.md`, `r8/studio-setups.md`. App-Stand: `synq-snapshots/V0a.html` (nur gelesen).
**Abgrenzung:** De/Vision ist in `r7/vorbild-coldwave2.md` §3.2 vollständig bearbeitet (C2-05 bis C2-08, Hörbeispiel „Leuchtturm“). Hier steht nur der Verweis und die „Division“-Auflösung (§1), keine Doppelung. Studio-Geräte der Szene-Acts stehen in `r8/studio-setups.md` §1.4–§1.9; deren Belege werden hier übernommen und neu nach den Kennzeichen dieses Auftrags eingestuft.

**Werkzeuge und Grenzen (wichtig für die Bewertung dieser Datei):**
- **In dieser Runde war keine neue Web-Recherche möglich.** Die erste WebSearch-Anfrage wurde abgelehnt: Das Suchbudget des Laufs (200 Suchen, geteilt mit allen parallelen Agenten) war schon aufgebraucht. WebFetch meldete einen DNS-Fehler (`en.wikipedia.org`), curl wurde vom Proxy mit 403 abgewiesen. Das sind dieselben Sperren wie in R6/R8.
- **Folge:** Alle Web-Fakten in dieser Datei stammen aus den Suchauszügen früherer Runden (R6, R7-coldwave2, R8), mit Quelle und neu eingestuft. **Alles Weitere über die Bands ist eigene Kenntnis (eK) und wird als UNBELEGT geführt**, mit einer „Prüf-URL“, unter der es wahrscheinlich steht (nicht geöffnet). So ein Satz geht nie als Fakt in einen ⓘ-Text.
- **Empfehlung:** Eine Nachrecherche mit frischem Suchbudget (ca. 25–30 Abfragen) für die mit **⚑** markierten Punkte. Die Liste steht in §9.
- **App-Fakten** (Parameter, Einheiten, Algorithmen) sind aus `V0a.html` gelesen und mit Zeilennummer angegeben (Kennzeichen **intern**).
- Die Hörproben sind per Skript erzeugt und geprüft (`r7/szene-work/aud.mjs` → `aud-report.txt`). **Nichts ist angehört und nichts gemessen.** Rezepte sind Startwerte für den Klang-Feinschliff; Pegel (`level`, FM `gain`) noch auf −18 LUFS kalibrieren (Spec v2 §11.1).

**Kennzeichen (nach diesem Auftrag, strenger als R6/R8)**
- **BELEGT**: Primärquelle (Interview mit der Band, Credits, Hersteller) **oder** zwei unabhängige Quellen. Grundlage ist der Suchauszug einer früheren Runde.
- **WAHRSCHEINLICH**: eine Sekundärquelle (Wikipedia, Rezension, Fanseite, Equipboard höchstens hier).
- **UNBELEGT**: nichts gefunden, nur eigene Kenntnis (eK) oder eigene Einschätzung. Alle Rezepte und Hörproben sind **eigene Entwürfe** und tragen deshalb kein Belegkennzeichen, sondern „Entwurf“.
- **intern**: aus Projektdateien oder App-Code.

---

## 0. Kurzfazit

- **12 Acts + 1 Kandidat**, **40 neue Sounds (SZ-01 bis SZ-40)**: 25 VA, 2 WT, 6 FM6, 7 Drum-Kits. Jeder Sound hat Rezept (App-Schlüssel), Lage, Rolle und eine Hörprobe (4 Takte, eigene Melodie). Je Act spielen die Hörproben zusammen ein kleines Arrangement („mit Band“).
- **Hörproben geprüft:** 40/40 innerhalb von 4 Takten (Spec §12.8 `len ≤ 4`), ≤ 256 Noten (größte: 141), **keine direkte Takt-Wiederholung** (alle 40 Spuren: 4 von 4 Takten verschieden), jede Probe hat eine Wendung in Takt 4. Daten fertig für `aud.notes` in `r7/vorbild-szene-aud.json` (Anschlag als 0–1, wie `Note.v` der App).
- **„Division“:** Xander hat es in Runde 8 selbst geklärt: **De/Vision** (intern, `fragen-xander-8.md` V). Joy Division bleibt nur Kandidat, mit 2 kleinen Sounds (§1, §4.13).
- **Belege zur Ausrüstung bleiben dünn:** BELEGT ist nur Welle:Erdball = C64/SID (2 Quellen) und bei Elegant Machinery „Novation-Synths in den 90ern, heute Arturia/Behringer/E-mu“ (Band-Interview). Für And One, S.P.O.C.K, Kirlian Camera, Project Pitchfork, Second Decay, Covenant, VNV Nation, Mesh und Camouflage ist **kein Gerät belegt**. Die Rezepte beruhen auf Hörbild und Genre-Wissen (eK) und sagen das im ⓘ-Text.
- **Welche Songtitel Xander nennt** (And One „Deutschmaschine“, „Krieger“, „Military Fashion Show“, „Sometimes“, „Get You Closer“): Album und Jahr konnte ich ohne Web nicht prüfen (UNBELEGT, ⚑). Die Hörproben nehmen von keinem dieser Titel eine Melodie, nur Stilmittel.
- **Drei App-Befunde aus dem Code (intern), wichtig für die Rezepte:**
  1. LFO→Lautstärke: Im Worklet (Normalfall) gilt `Pegel × max(0, 1 + Mod)` (V0a Z. 2991), ein Rechteck-LFO mit 1,0 schaltet also voll zwischen 0 und ×2. Nur der **native Ersatzweg** ohne Worklet schneidet höchstens −6 dB (Z. 8705–8726). Ein **Trance-Gate** (Futurepop) kommt in SZ-30 trotzdem als Noten-Clip (⧉), weil echte Gate-Muster unregelmäßig sind (`xx.xx.xxx…`) und so auf jedem Weg gleich klingen.
  2. Mod-Einheiten: Cutoff 1,0 = 120 HT, Tonhöhe 1,0 = 24 HT, PW 1,0 = ±0,45, Filter-Hk `fenv` 1,0 = ±72 HT (V0a Z. 5634–5635, Z. 8732–8733). Damit ist eine Angabe in `vorbild-helden.md` K3 falsch (§6, K-12).
  3. Es gibt keinen Arpeggiator in V0a. Chip-Arps (Welle:Erdball) kommen als mitgebrachter 1/32-Clip (⧉).
- **Korrekturen an früheren Recherchen:** 13 Punkte (§6), u. a. FM-Algorithmus 32 in R6 N24 (dort moduliert nichts), Name „S.P.O.C.K“, Elegant-Machinery-Gründung, SID-Ringmod nur mit Dreieck, Anschlag-Skala der Hörproben.
- **Demo-Song-Blaupausen:** 8 Stück, eine je Genre (§5): Body-Pop/EBM, Chip-Synthpop, Schweden-Synthpop, Dark Electro, Cinematic Darkwave, Futurepop, melancholischer Synthpop, Post-Punk (Kandidat).

---

## 1. „Division“ – Auflösung und Kandidaten

| Kandidat | Passt zu Xanders Kontext? | Status |
|---|---|---|
| **De/Vision** (Bensheim 1988, Synthpop) | **Ja, von Xander bestätigt** („‚Division‘ = De/Vision“) | intern: `fragen-xander-8.md` §V |
| **Joy Division** (Manchester, Post-Punk 1976–80) | Diktat Runde 7 „And One Division“ wurde zuerst so gedeutet (`fragen-xander-7.md`: „And One + Joy Division? prüfen“). Synthesizer spielen dort nur eine Nebenrolle. | intern (Deutung), durch Runde 8 überholt |
| **„DeVision Redux“** (Keth mit Daniel Myer) | Nachfolge-Projekt, falls Xander das Neue meint | WAHRSCHEINLICH (aus R7-coldwave2, synthpopfanatic.com) |

**Empfehlung:** Bibliotheks-Tag `de-vision` (Sounds C2-05 bis C2-08 aus `vorbild-coldwave2.md`). Joy Division nur als optionaler Tag `joy-division` mit SZ-39/SZ-40, und nur wenn Xander es will (Frage in §9).

---

## 2. Rechtliche Linie, Hörproben-Format, App-Einheiten

### 2.1 Rechtliche Linie (kein Rechtsrat)
Gilt wie `r7/vorbild-helden.md` §1 und R6 §5 (dort mit Quellen): Stil, Klangfarbe, Gerätetyp, Allerwelts-Akkordfolgen und Allerwelts-Rhythmen sind frei; die **konkrete Melodie bzw. das konkrete Riff** eines Titels ist geschützt (§ 2, § 23 UrhG: „hinreichender Abstand“); Samples und Resynthese fremder Aufnahmen sind tabu (§ 85 UrhG). Sound-Namen ohne Band, Titel oder Gerät (E9); im ⓘ steht „erinnert an … (Stil)“ plus Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“

**Regeln, nach denen alle Hörproben hier gebaut sind (eigene Regeln, UNBELEGT als Rechtsgrenze):**
1. Jede Tonfolge ist neu komponiert; keine wurde aus einem Titel abgeleitet, transkribiert oder „ähnlich gemacht“.
2. Keine Folge von mehr als 3 Tönen im gleichen Rhythmus wie ein mir bekanntes Riff des Vorbilds (Selbstprüfung; ein Abgleich gegen Originalnoten war nicht möglich).
3. Wiedererkennung kommt nur aus **Technik** (16tel-Oktavbass, Offbeat-Stabs, 1/32-Chip-Arp, Trance-Gate, Tom-Fills), **Klang**, **Tempo/Lage** und **Allerwelts-Harmonik** (i–VI–VII, i–VI–III–VII, I–vi–IV–V, harmonisch Moll mit Dur-Dominante).
4. Kein Sample, keine Sprachfetzen (S.P.O.C.K arbeitet mit Kirk-Zitaten – das bauen wir **nicht** nach, §4.4).
5. Vor V10d hört ein Mensch gegen (wie V10d-05 „eigene Melodie“ in CHANGES).

### 2.2 Format
- **Notenliste:** `Ton(MIDI) Start/Länge/Anschlag`, Start und Länge in **16teln ab Takt 1**, Anschlag 1–127. Die fertigen `aud.notes [b, d, n, v]` (b, d in Schlägen = 16tel ÷ 4; **v = Anschlag ÷ 127**, weil `Note.v` in der App 0,01–1 ist, V0a Z. 8312) stehen in `r7/vorbild-szene-aud.json`.
- **Drums:** Schritt-Zeilen je Pad (Pad-Namen wie `DrumKits.SLOTS`, V0a Z. 7266), 16 Schritte je Takt.
- Jede Act-Hörprobe hat mehrere Spuren; jeder Sound bekommt **seine** Spur als `aud`. Schalter „mit Band“ (Vorschlag aus coldwave2 §6) spielt die anderen leise mit.
- **⧉** = Sound bringt einen eigenen Clip mit (Spec §12.8 `clip`), weil der Klang ohne das Muster nicht funktioniert.

### 2.3 App-Einheiten für die Rezepte (intern, V0a)
| Schlüssel | Bedeutung | Quelle |
|---|---|---|
| `o1w/o2w/o3w` | 0 Säge, 1 Puls, 2 Dreieck, 3 Sinus | Z. 2605, Z. 5658 |
| `ftype` | 0 LP24, 1 LP12, 2 BP24, 3 BP12, 4 HP24, 5 HP12 | Z. 5658 |
| `fenv` | 1,0 = ±72 HT (also 0,33 ≈ +24 HT) | Z. 5635, Z. 6258 |
| Mod `cutoff` / `pitch` / `o2pitch` / `pw` | 1,0 = 120 HT / 24 HT / 24 HT / ±0,45 | Z. 5634–5635 |
| Mod `amp` | Worklet: Pegel × max(0, 1 + Summe), 1,0 = +100 %, Rechteck 1,0 = Gate 0/×2 · nur nativer Ersatzweg: eine Route höchstens −6 dB | Z. 2991; Z. 8705–8726 |
| `mode` | 0 poly, 1 mono, 2 legato | Z. 5659 |
| `l1sync`/`l2sync` | Schläge je Zyklus (0,25 = 1/16, 4 = 1 Takt, 16 = 4 Takte) | Z. 5663 |
| LFO-Form `l1shape` | 0 Sinus, 1 Dreieck, 2 Säge, 3 Rechteck, 4 S&H | Z. 5659 |
| Chorus | off, I, II, I+II, ENS, BREIT | Z. 5070 |
| Spur-FX | `fx.drive, rev, dly, pump, pumpRel ('1/16','1/8','1/4'), chorus` | Z. 13586 |
| Bus-Hinweis | `hall {decay,size,damp,mod}`, `echo {mode,divL,divR,fb,highcut}` | Z. 5638 |
| FM6 | `{alg 1–32, fb 0–7, trans, ops[6]: {coarse 0–31 (0 = ×0,5), fine 0–99, det −7…7, ol 0–99, r[4], l[4], vs 0–7, rs 0–7, fixed}}`, `common {gain, glide, mode, poly, lfo}`; Algorithmen = DX7-Nummerierung, „verified against msfa“ | Z. 2557–2561, Z. 5094–5104, Z. 5839–5844 |
| Drum-Slot | TON `wav, frq, pAmt, pDec, tHld, tDec, tSpk`; FM `o2, o2r, o2d`; RAUSCHEN `nLvl, nTyp, nFrq, nQ, nHp, nDec, nBur, nGap, nCrv`; METALL `mLvl, mTun, mHi, mLo, mQ, mHp, mDec`; KLICK `cLvl, cTyp, cTon`; AUSGANG `lvl, pan, dyn, drv, sRoom, sGate` | Z. 7837–7843 |
| **erst ab VK** (Nachtrag A.10) | `walk` (Drift), Haifischzahn/Säge gebogen, `sat` (nach dem Filter), SVF 12, `ofm`, `ring`, *(P1)* `crush` | Nachtrag Z. 771–781 |

Schreibweise der Rezepte: wie `vorbild-helden.md` (flacher Patch, nicht genannte Schlüssel = `ANALOG_BASE`, V0a Z. 5644). `M(src, dst, amt)` = Mod-Route.

---

## 3. Überblick: Act → Sounds → Rolle

| Act | Tag | Sounds (neu) | Schon vorhanden (R6/A.1/R7) | Gerätebeleg |
|---|---|---|---|---|
| And One | `and-one` | SZ-01 Körperbass, SZ-02 Paradestab, SZ-03 Parade-Kit, SZ-04 Spiegelglas-Lead FM | A.1 #8 Grauzone-Fläche, #9 Grauzone-Bass, N23 Grauzone-Stakkato | UNBELEGT |
| Welle:Erdball | `welle-erdball` | SZ-05 Rasterzeilen-Arp ⧉, SZ-06 Ringglocke, SZ-07 PWM-Brotbass, SZ-08 Rauschwellen-Kit | A.1 #26–#30, N26, N27, N76 | **BELEGT: C64/SID** |
| Elegant Machinery | `elegant-machinery` | SZ-09 Schärenlicht-Fläche, SZ-10 Fernweh-Lead, SZ-11 Stab-Achtelbass | A.1 #16, #17, N25 | **BELEGT: Novation (90er), Modell offen** |
| S.P.O.C.K | `spock` | SZ-12 Beam-Schimmer, SZ-13 Blubber-Sequenz, SZ-14 Kommunikator-Hook FM | A.1 #18, #19, N24 | UNBELEGT |
| Kirlian Camera | `kirlian-camera` | SZ-15 Requiem-Chor, SZ-16 Marmor-Streicher, SZ-17 Kaltpuls-Bass, SZ-18 Turmglocke FM | N17, N18 | UNBELEGT |
| Project Pitchfork | `project-pitchfork` | SZ-19 Grollbass, SZ-20 Kathedralen-Chor, SZ-21 Splitter-Sequenz FM, SZ-22 Schmiede-Kit | N21, N22 | UNBELEGT |
| Second Decay | `second-decay` | SZ-23 Kellerpuls-Bass, SZ-24 Kaltlicht-Stakkato (+ Kit SZ-03) | N19, N20 | WAHRSCHEINLICH: „nur analoge Synths“ |
| Covenant | `covenant` | SZ-25 Polarnacht-Fläche, SZ-26 Schaltwerk-Bass, SZ-27 Eiskristall-Arp FM, SZ-28 Kaltraum-Kit | – | UNBELEGT |
| VNV Nation | `vnv-nation` | SZ-29 Leuchtfeuer-Lead, SZ-30 Taktgitter-Fläche ⧉, SZ-31 Gegenschlag-Bass, SZ-32 Hymnen-Kit | Werks-Sound „Supersaw-Hymne“, N55 | UNBELEGT |
| Mesh | `mesh` | SZ-33 Regenstadt-Pluck, SZ-34 Schulterbass, SZ-35 Breitwand-Streicher | – | UNBELEGT |
| De/Vision | `de-vision` | – (siehe coldwave2) | C2-05 bis C2-08 | UNBELEGT (coldwave2) |
| Camouflage | `camouflage` | SZ-36 Achtundachtzig-Stab, SZ-37 Holzbass FM, SZ-38 Hallkammer-Kit | Werks-Kit „Gated 84“ | UNBELEGT |
| Joy Division (Kandidat) | `joy-division` | SZ-39 Fabrikhallen-Kit mit Fall-Tom, SZ-40 Kammer-Streicher | – | UNBELEGT |

---

## 4. Die Acts

### 4.1 And One (`and-one`) – Body-Pop / EBM-Synthpop

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Gründer und Kopf Steve Naghavi, Band seit 1989 | WAHRSCHEINLICH (eine Sekundärquelle, Suchauszug R8) | https://en.wikipedia.org/wiki/And_One |
| Anfang mit „two keyboards and a beatbox“, Vorbild Depeche Mode | WAHRSCHEINLICH (Wikipedia-Auszug, R8 §1.4) | https://en.wikipedia.org/wiki/And_One |
| Album „I.S.T.“ 1994 bei Machinery | WAHRSCHEINLICH (R6 [K9], Fanseite + Wikipedia, beide nur Auszug) | https://www.ludd.ltu.se/~h-son/cd/a/ist.html |
| TR-808, Korg Polysix, Yamaha DX7 als „Lieblingsgeräte“ | **UNBELEGT** (Ironcharts ohne Quellenangabe, R8) – nie in ⓘ | https://ironcharts.com/musician/steve-naghavi |
| Studio- oder Album-Geräte | UNBELEGT (R8: 4 Abfragen, auch deutsch) | – |
| Album/Jahr von „Deutschmaschine“, „Krieger“, „Military Fashion Show“, „Sometimes“, „Get You Closer“ | **UNBELEGT ⚑** (eK, unsicher: „Military Fashion Show“ als Single um 2006 aus „Bodypop“; die übrigen Zuordnungen weiß ich nicht sicher) | Prüf-URL: https://en.wikipedia.org/wiki/And_One_discography |
| Selbstbezeichnung „Body Pop“ für den Stil | UNBELEGT ⚑ (eK: Albumtitel „Bodypop“) | Prüf-URL wie oben |

**Klangbild und Spielweise (alles UNBELEGT – eigene Höranalyse aus Erinnerung, ⚑ gegenhören)**
- Tempo etwa 120–135 BPM, Moll, gerader Four-on-the-Floor.
- **Bass:** 16tel-Sequenz auf dem Grundton mit Oktavsprüngen; Farbe durch die kleine Sekunde (♭2, „phrygisch“) und die kleine Septime. Akzent auf jeder Viertel.
- **Stabs:** kurze Akkordschläge auf den Offbeats (Achtel „und“), im Refrain dichter.
- **„Military Fashion Show“-Seite:** Marsch-Snare mit Wirbeln, Sprechgesang mit Parolen-Refrain. **„Deutschmaschine“/„Krieger“-Seite:** härter, deutschsprachig, EBM-nah, Stimme tief und deklamierend.
- **„Sometimes“/„Get You Closer“-Seite:** melodischer Synthpop mit getragenem Refrain.
- Arrangement: kurze Intros mit Bass + Kick, Breakdown mit gefiltertem Bass, Refrain doppelt.

#### SZ-01 „Körperbass“ – Bass · VA
- **Vorbild (ⓘ):** 16tel-Sequenzbass des Body-Pop/EBM (Stil). Gerät UNBELEGT.
- **Rezept (Entwurf):** `o1w 0, o2w 1, o2pw .4, o2fine -6, o2lvl .6, subLvl .3, subW 0, ftype 0, cutoff 300, res .35, drive .3, bass .6, kt .35, fenv .34, fvel .4, fA .001, fD .09, fS .05, fR .05, fCurve .7, aA .001, aD .16, aS .45, aR .04, ampVel .5, mode 1, poly 1, reset 1, analog .08, spread 0` · Mods `M('vel','fenv',.2)` · fx `{drive .2, pump .25, pumpRel '1/16', rev .04}`
- **Warum:** Säge + Puls 40 % ergibt Biss, Sub hält den Grundton. `fenv .34` ≈ +24 HT mit 90 ms Decay = das „Tock“ jeder 16tel; Reset an, damit jede Stufe gleich hart anschlägt; Anschlag öffnet das Filter zusätzlich (Akzente). Pumpen 1/16 lässt die Kick durch.
- **Lage / Rolle:** A1–D3 (33–50), Lagen-Grenze **hoch E3**. Bass.
- **Hörprobe:** siehe unten (Spur „Bass“).

#### SZ-02 „Paradestab“ – Akkord/Stab · VA
- **Vorbild (ⓘ):** kurze Offbeat-Akkordschläge im Body-Pop (Stil, UNBELEGT).
- **Rezept:** `o1w 0, o2w 0, o2fine 9, o2lvl .9, o3w 1, o3oct 1, o3pw .3, o3lvl .25, ftype 0, cutoff 1100, res .15, drive .2, kt .5, fenv .3, fvel .35, fA .002, fD .16, fS .2, fR .1, aA .002, aD .22, aS .25, aR .12, ampVel .55, poly 6, analog .2, spread .5` · fx `{chorus:{mode:'I', mix .5}, rev .2, dly .08}` · bus `{hall:{decay 1.4}}`
- **Warum:** Zwei Sägen 9 ct + Puls eine Oktave höher = breiter, „blechiger“ Stab; kurze Filter-Hk (+22 HT, 160 ms) macht den Schlag, Sustain 25 % lässt ihn nicht ganz verschwinden.
- **Lage / Rolle:** C4–C5 (60–72) als Dreiklang. Akkord/Stab.

#### SZ-03 „Parade-Kit“ – Drums (Basis Werks-Kit „Rom Pop“)
- **Vorbild (ⓘ):** Four-on-the-Floor mit Marsch-Snare-Wirbeln (Stil, UNBELEGT).
- **Kit-Rezept (Abweichungen von „Rom Pop“):**
  - KICK `frq 52, pAmt 24, pDec .045, tDec .32, cLvl .5, cTyp 3, drv .35, dyn .4`
  - SNARE (Marsch) `tLvl .7, wav 'triangle', frq 210, pAmt 5, pDec .02, tDec .09, nLvl 1.1, nTyp 'bandpass', nFrq 3800, nQ .6, nHp 900, nDec .14, nCrv .3, sRoom .25, sGate .2, drv .25, dyn .7` (hohe Dynamik, damit Wirbel anschwellen)
  - CLAP `nBur 3, nGap .007, nDec .18, sRoom .3` · HH ZU `mDec .03` · RIM wie „Rom Pop“
- **Rolle:** Drums. Transposition gilt nicht.

#### SZ-04 „Spiegelglas-Lead FM“ – Lead · FM6
- **Vorbild (ⓘ):** heller FM-Lead im 90er-Synthpop (Stil). Ein DX7 bei And One ist **UNBELEGT** (nur Ironcharts) – im ⓘ deshalb kein Gerät.
- **Rezept (Algorithmus 5 = drei Paare 1←2, 3←4, 5←6, intern Z. 2557):** `alg 5, fb 3, trans 0`
  - OP1 `coarse 1, ol 99, r [95,40,30,55], l [99,85,70,0]` (Träger)
  - OP2 `coarse 3, ol 70, r [95,60,35,60], l [99,60,40,0], vs 4` (Mod: Biss bei festem Anschlag)
  - OP3 `coarse 1, det 3, ol 88, r [95,40,30,55], l [99,85,70,0]` (Träger, Schwebung)
  - OP4 `coarse 1, ol 62, r [99,50,30,60], l [99,70,55,0]`
  - OP5 `coarse 2, ol 70, r [90,30,30,50], l [99,80,60,0]` (Träger, Oktave)
  - OP6 `coarse 7, ol 45, r [99,80,40,70], l [99,40,0,0], vs 6` (kurzer Glas-Anschlag)
  - common `{gain -14 (kalibrieren), mode 2, poly 1, glide .03, lfo {wave 'sine', rate 5.5, delay .6, pitch 6}}` · fx `{chorus:{mode:'I', mix .4}, dly .25, rev .25}` · bus `{echo:{mode 'pp', divL '1/8', fb .3}}`
- **Hinweis:** Hängt an der FM-Hüllkurven-Reparatur (Xanders „Katastrophe“, `fragen-xander-9.md`, `r8/fm-diagnose.md`). Erst nach dem Fix abhören.
- **Lage / Rolle:** D4–C5 (62–72), gut bis D5; Grenze **tief C4**. Lead (Refrain).

**Hörprobe „Körper-Parade“** – 126 BPM, d-Moll, `Dm | Dm | B♭ | C`. Wendung in Takt 4: Bass läuft E–G–A–C♯ (Leitton zurück nach D), Stabs werden zu 16teln, Snare-Wirbel.

**Spur SZ-01 Körperbass**
```
Tempo 126 BPM · 4 Takte · D minor · Akkorde: Dm | Dm | Bb | C · Lage Bb1–D3 · 63 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: D2(38) 0/1/110 · D2(38) 1/1/80 · D3(50) 2/1/92 · D2(38) 3/1/80 · D2(38) 4/1/110 · D2(38) 5/1/80 · D3(50) 6/1/92 · D2(38) 7/1/80 · D2(38) 8/1/110 · D2(38) 9/1/80 · D3(50) 10/1/92 · D2(38) 11/1/80 · C3(48) 12/1/110 · D2(38) 13/1/80 · A2(45) 14/1/92 · D2(38) 15/1/80
T2: D2(38) 16/1/110 · D2(38) 17/1/80 · D3(50) 18/1/92 · D2(38) 19/1/80 · D2(38) 20/1/110 · Eb2(39) 21/1/80 · D2(38) 22/1/92 · D3(50) 23/1/80 · D2(38) 24/1/110 · D2(38) 25/1/80 · D3(50) 26/1/92 · D2(38) 27/1/80 · F2(41) 28/1/110 · D2(38) 29/1/80 · C3(48) 30/1/92 · D3(50) 31/1/80
T3: Bb1(34) 32/1/110 · Bb1(34) 33/1/80 · Bb2(46) 34/1/92 · Bb1(34) 35/1/80 · Bb1(34) 36/1/110 · Bb1(34) 37/1/80 · Bb2(46) 38/1/92 · Bb1(34) 39/1/80 · Bb1(34) 40/1/110 · Bb1(34) 41/1/80 · Bb2(46) 42/1/92 · Bb1(34) 43/1/80 · D2(38) 44/1/110 · Bb1(34) 45/1/80 · F2(41) 46/1/92 · Bb1(34) 47/1/80
T4: C2(36) 48/1/110 · C2(36) 49/1/80 · C3(48) 50/1/92 · C2(36) 51/1/80 · C2(36) 52/1/110 · C2(36) 53/1/80 · C3(48) 54/1/92 · C2(36) 55/1/80 · C2(36) 56/1/110 · C3(48) 58/1/92 · C2(36) 59/1/80 · E2(40) 60/1/118 · G2(43) 61/1/88 · A2(45) 62/1/100 · C#3(49) 63/1/88
```

**Spur SZ-02 Paradestab**
```
Tempo 126 BPM · 4 Takte · D minor · Akkorde: Dm | Dm | Bb | C · Lage D4–C5 · 39 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: D4(62) 6/2/100 · F4(65) 6/2/100 · A4(69) 6/2/100 · D4(62) 14/2/96 · F4(65) 14/2/96 · A4(69) 14/2/96
T2: D4(62) 22/2/100 · F4(65) 22/2/100 · A4(69) 22/2/100 · D4(62) 26/1/84 · F4(65) 26/1/84 · A4(69) 26/1/84 · D4(62) 30/2/100 · F4(65) 30/2/100 · A4(69) 30/2/100
T3: D4(62) 38/2/100 · F4(65) 38/2/100 · Bb4(70) 38/2/100 · D4(62) 46/2/96 · F4(65) 46/2/96 · Bb4(70) 46/2/96
T4: E4(64) 50/1/90 · G4(67) 50/1/90 · C5(72) 50/1/90 · E4(64) 54/2/100 · G4(67) 54/2/100 · C5(72) 54/2/100 · E4(64) 58/1/96 · G4(67) 58/1/96 · C5(72) 58/1/96 · E4(64) 60/1/104 · G4(67) 60/1/104 · C5(72) 60/1/104 · E4(64) 61/1/108 · G4(67) 61/1/108 · C5(72) 61/1/108 · E4(64) 62/2/118 · G4(67) 62/2/118 · C5(72) 62/2/118
```

**Spur SZ-04 Spiegelglas-Lead FM**
```
Tempo 126 BPM · 4 Takte · D minor · Akkorde: Dm | Dm | Bb | C · Lage D4–C5 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: A4(69) 0/6/104 · G4(67) 6/2/88 · F4(65) 8/4/96 · E4(64) 12/4/92
T2: D4(62) 16/6/100 · F4(65) 22/2/88 · A4(69) 24/8/104
T3: Bb4(70) 32/4/104 · A4(69) 36/2/90 · G4(67) 38/2/90 · F4(65) 40/6/96 · D4(62) 46/2/86
T4: E4(64) 48/4/96 · G4(67) 52/4/100 · C5(72) 56/6/110 · Bb4(70) 62/2/90
```

**Spur SZ-03 Parade-Kit (Drums)**
```
Tempo 126 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x.x.x...
SNARE | ....x.......x... | ....x.......x..x | ....x.....x.x... | ....x...xxxxxxxx
CLAP  | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU | ..x...x...x...x. | x.x.x.x.x.x.x.x. | ..x...x...x...x. | x.x.x.x.........
RIM   | ...........x.... | .......x........ | ...x.......x.... | ................
```

**Warum rechtlich unbedenklich:** 16tel-Grundton mit Oktave und ♭2 ist eine Allerweltstechnik des EBM; i–i–VI–VII ist eine Allerwelts-Folge; die Lead-Linie ist neu (Stufen- und Terzbewegung). Kein Riff der genannten Titel ist Vorlage, keine Textzeile, kein Sample.
**Karten:** SZ-01 „Harte 16tel mit Oktavsprung und kurzem Filter-Tock – erinnert an deutschen Body-Pop (Stil And One).“ · SZ-02 „Kurze Offbeat-Stabs, im Refrain dichter – Body-Pop-Stil.“ · SZ-03 „Four-on-the-Floor mit Marsch-Wirbel.“ · SZ-04 „Heller FM-Glas-Lead für den Refrain.“

---

### 4.2 Welle:Erdball (`welle-erdball`) – Chip-Synthpop mit C64

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Commodore 64 bzw. sein SID-Chip ist Markenzeichen; Honey: Text, Synth, Programmierung | **BELEGT** (zwei unabhängige Quellen, Suchauszüge R8) | https://en.wikipedia.org/wiki/Welle:Erdball · https://sceneworld.org/blog/2020/01/22/podcast-episode-82-welleerdball |
| Weitere Studio-Geräte | UNBELEGT | – |
| SID: 3 Stimmen; Wellen Dreieck, Säge, Puls (Breite fein einstellbar), Rauschen; Sync und Ringmodulation; ein Multimode-Filter 12 dB (TP/BP/HP) mit Resonanz; ADSR je Stimme | UNBELEGT (eK, Standardwissen) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/MOS_Technology_6581 |
| SID-Ringmod wirkt nur auf die **Dreieck**-Welle einer Stimme (moduliert von der Nachbarstimme) | UNBELEGT (eK) ⚑ | Prüf-URL wie oben |
| C64-Musik: Akkorde als sehr schnelle Arpeggios (Notenwechsel je Bildwiederholung, 50 Hz bei PAL); Drums durch Wellenwechsel je Frame (Rauschen → Puls/Dreieck mit Tonhöhenfall) | UNBELEGT (eK, Tracker-Praxis) ⚑ | Prüf-URL: https://www.c64-wiki.com/wiki/SID |
| Radio-/„Volksempfänger“-Ästhetik, deutsche Texte | UNBELEGT (eK) ⚑ | Prüf-URL: Wikipedia wie oben |

**Klangbild (UNBELEGT, eK):** 110–130 BPM, trockene 8tel-Beats, kurze Hüllkurven, wenig Hall, Puls mit PWM, Oktav-Triller, schnelle Akkord-Arps, deutscher Sprechgesang, Wechsel zwischen „Computer“ und Schlager-Melodik.

#### SZ-05 „Rasterzeilen-Arp“ ⧉ – Sequenz · VA (mit Clip)
- **Vorbild (ⓘ):** C64-Akkord-Arpeggio (Technik, eK). SID im Vorbild BELEGT.
- **Rezept:** `o1w 1, o1pw .5, o2lvl 0, ftype 1, cutoff 9000, res 0, drive 0, kt 0, fenv 0, aA .001, aD .05, aS 1, aR .008, ampVel .2, mode 1, poly 1, reset 1, analog 0, spread 0, l1shape 1, l1rate .4` · Mods `M('lfo1','pw',.25)` (±11 %) · fx `{rev .05, dly .1}`
- **Clip ⧉:** 1/32-Zerlegung des Akkords (Hörprobe = Clip).
- **Grenze:** Echte C64-Arps wechseln mit 50 Hz; 1/32 bei 118 BPM sind nur 15,7 Hz (man hört die Töne einzeln, eher „Triller“). Für echtes „Akkord-Flirren“ bräuchte es 1/64 (31 Hz) oder einen tempounabhängigen Arp (Stufe B in R8, „SID-Kombiwellen, schneller Arp“). 1/64 über 4 Takte = 256 Noten (Grenze von `aud`).
- **Lage / Rolle:** F4–G5 (65–79). Sequenz. Grenze **tief C4**.

#### SZ-06 „Ringglocke“ – Lead/Akzent · VA (Ringmod ab VK)
- **Vorbild (ⓘ):** SID-Ringmodulation, metallisch (Technik eK; Gerät BELEGT).
- **Rezept ab VK:** `o1w 2, o2w 2, o2oct 1, o2semi 3, o1lvl .2, o2lvl 0, ring .8, ftype 1, cutoff 7000, res .1, kt .3, aA .001, aD .5, aS .2, aR .3, ampVel .5, poly 4, l2shape 0, l2rate 6, l2fade .3, analog 0` · Mods `M('lfo2','pitch',.004)` (≈ ±10 ct, verzögert) · fx `{dly .2, rev .15}` · bus `{echo:{divL '1/8.', fb .3}}`
  - Ringprodukt aus f und f·2^(15/12) ≈ 2,38 f ergibt Teiltöne bei ≈ 1,38 f und 3,38 f: unharmonisch = Glocke. Beide Dreieck, wie beim SID.
- **Fallback bis VK:** `ring` weglassen, dafür `o2w 3, o2oct 2, o2semi 3, o2lvl .35` (Sinus 2 Okt + 3 HT dazu) – Glöckchen, weniger metallisch.
- **Lage / Rolle:** A4–G5 (69–79). Lead/Akzent.

#### SZ-07 „PWM-Brotbass“ – Bass · VA
- **Vorbild (ⓘ):** Puls-Bass mit wandernder Pulsbreite durch 12-dB-Filter (SID-Prinzip, eK).
- **Rezept:** `o1w 1, o1pw .25, o2lvl 0, subLvl .35, ftype 1, cutoff 700, res .55, drive .15, bass .4, kt .4, fenv .25, fA .001, fD .12, fS .1, fR .05, aA .001, aD .2, aS .6, aR .03, mode 1, poly 1, reset 1, analog 0, spread 0, l1shape 1, l1rate .8` · Mods `M('lfo1','pw',.35)` (±16 %) · fx `{rev .03}`
- **Lage / Rolle:** F1–C3 (29–48), am besten A1–A2. Grenze **hoch D3**.

#### SZ-08 „Rauschwellen-Kit“ – Drums (verfeinert A.1 #30)
- **Kit-Rezept:**
  - KICK `wav 'triangle', frq 50, pAmt 24, pDec .04, tDec .16, nLvl .25, nTyp 'lowpass', nFrq 3000, nDec .01, drv .3` (Dreieck fällt 2 Oktaven, 200 → 50 Hz)
  - SNARE `tLvl .6, wav 'square', frq 220, pAmt 12, pDec .02, tDec .05, nLvl 1, nTyp 'highpass', nFrq 1500, nDec .09, drv .2` (Puls-Ton + Rauschen = Frame-Wechsel-Snare)
  - HH ZU `mLvl 0, nLvl .8, nTyp 'highpass', nFrq 8000, nDec .025`
  - PERC `wav 'square', frq 880, pAmt 12, pDec .015, tDec .06`
  - Kit: `sRoom 0` überall (trocken). Ab *(P1)* `crush`: Kit-Bus 6 Bit.
- **Rolle:** Drums.

**Hörprobe „Rundfunk-Raster“** – 118 BPM, a-Moll, `Am | F | C | G G7`. Wendung Takt 4: Arp nimmt die Septime F dazu, Bass läuft über G♯ zurück, Snare-16tel.

**Spur SZ-05 Rasterzeilen-Arp ⧉**
```
Tempo 118 BPM · 4 Takte · A minor · Akkorde: Am | F | C | G G7 · Lage F4–G5 · 128 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: A4(69) 0/0.5/96 · C5(72) 0.5/0.5/84 · E5(76) 1/0.5/84 · A4(69) 1.5/0.5/84 · C5(72) 2/0.5/84 · E5(76) 2.5/0.5/84 · A4(69) 3/0.5/84 · C5(72) 3.5/0.5/84 · E5(76) 4/0.5/96 · A4(69) 4.5/0.5/84 · C5(72) 5/0.5/84 · E5(76) 5.5/0.5/84 · A4(69) 6/0.5/84 · C5(72) 6.5/0.5/84 · E5(76) 7/0.5/84 · A4(69) 7.5/0.5/84 · C5(72) 8/0.5/96 · E5(76) 8.5/0.5/84 · A4(69) 9/0.5/84 · C5(72) 9.5/0.5/84 · E5(76) 10/0.5/84 · A4(69) 10.5/0.5/84 · C5(72) 11/0.5/84 · E5(76) 11.5/0.5/84 · A4(69) 12/0.5/96 · C5(72) 12.5/0.5/84 · E5(76) 13/0.5/84 · A4(69) 13.5/0.5/84 · C5(72) 14/0.5/84 · E5(76) 14.5/0.5/84 · A4(69) 15/0.5/84 · C5(72) 15.5/0.5/84
T2: F4(65) 16/0.5/96 · A4(69) 16.5/0.5/84 · C5(72) 17/0.5/84 · F4(65) 17.5/0.5/84 · A4(69) 18/0.5/84 · C5(72) 18.5/0.5/84 · F4(65) 19/0.5/84 · A4(69) 19.5/0.5/84 · C5(72) 20/0.5/96 · F4(65) 20.5/0.5/84 · A4(69) 21/0.5/84 · C5(72) 21.5/0.5/84 · F4(65) 22/0.5/84 · A4(69) 22.5/0.5/84 · C5(72) 23/0.5/84 · F4(65) 23.5/0.5/84 · A4(69) 24/0.5/96 · C5(72) 24.5/0.5/84 · F4(65) 25/0.5/84 · A4(69) 25.5/0.5/84 · C5(72) 26/0.5/84 · F4(65) 26.5/0.5/84 · A4(69) 27/0.5/84 · C5(72) 27.5/0.5/84 · F4(65) 28/0.5/96 · A4(69) 28.5/0.5/84 · C5(72) 29/0.5/84 · F4(65) 29.5/0.5/84 · A4(69) 30/0.5/84 · C5(72) 30.5/0.5/84 · F4(65) 31/0.5/84 · A4(69) 31.5/0.5/84
T3: C5(72) 32/0.5/96 · E5(76) 32.5/0.5/84 · G5(79) 33/0.5/84 · C5(72) 33.5/0.5/84 · E5(76) 34/0.5/84 · G5(79) 34.5/0.5/84 · C5(72) 35/0.5/84 · E5(76) 35.5/0.5/84 · G5(79) 36/0.5/96 · C5(72) 36.5/0.5/84 · E5(76) 37/0.5/84 · G5(79) 37.5/0.5/84 · C5(72) 38/0.5/84 · E5(76) 38.5/0.5/84 · G5(79) 39/0.5/84 · C5(72) 39.5/0.5/84 · E5(76) 40/0.5/96 · G5(79) 40.5/0.5/84 · C5(72) 41/0.5/84 · E5(76) 41.5/0.5/84 · G5(79) 42/0.5/84 · C5(72) 42.5/0.5/84 · E5(76) 43/0.5/84 · G5(79) 43.5/0.5/84 · C5(72) 44/0.5/96 · E5(76) 44.5/0.5/84 · G5(79) 45/0.5/84 · C5(72) 45.5/0.5/84 · E5(76) 46/0.5/84 · G5(79) 46.5/0.5/84 · C5(72) 47/0.5/84 · E5(76) 47.5/0.5/84
T4: G4(67) 48/0.5/96 · B4(71) 48.5/0.5/84 · D5(74) 49/0.5/84 · G4(67) 49.5/0.5/84 · B4(71) 50/0.5/84 · D5(74) 50.5/0.5/84 · G4(67) 51/0.5/84 · B4(71) 51.5/0.5/84 · D5(74) 52/0.5/96 · G4(67) 52.5/0.5/84 · B4(71) 53/0.5/84 · D5(74) 53.5/0.5/84 · G4(67) 54/0.5/84 · B4(71) 54.5/0.5/84 · D5(74) 55/0.5/84 · G4(67) 55.5/0.5/84 · G4(67) 56/0.5/100 · B4(71) 56.5/0.5/88 · D5(74) 57/0.5/88 · F5(77) 57.5/0.5/88 · G4(67) 58/0.5/88 · B4(71) 58.5/0.5/88 · D5(74) 59/0.5/88 · F5(77) 59.5/0.5/88 · G4(67) 60/0.5/100 · B4(71) 60.5/0.5/88 · D5(74) 61/0.5/88 · F5(77) 61.5/0.5/88 · G4(67) 62/0.5/88 · B4(71) 62.5/0.5/88 · D5(74) 63/0.5/88 · F5(77) 63.5/0.5/88
```

**Spur SZ-06 Ringglocke**
```
Tempo 118 BPM · 4 Takte · A minor · Akkorde: Am | F | C | G G7 · Lage A4–G5 · 20 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E5(76) 0/3/104 · C5(72) 3/3/92 · A4(69) 6/2/88 · B4(71) 8/4/96 · C5(72) 12/4/96
T2: A4(69) 16/4/96 · C5(72) 20/2/90 · F5(77) 22/6/108 · E5(76) 28/2/90 · C5(72) 30/2/88
T3: D5(74) 32/0.5/70 · E5(76) 32.5/1.5/100 · G5(79) 34/2/100 · E5(76) 36/4/96 · D5(74) 40/4/92 · C5(72) 44/4/92
T4: B4(71) 48/6/96 · D5(74) 54/2/92 · G5(79) 56/6/108 · F5(77) 62/2/96
```

**Spur SZ-07 PWM-Brotbass**
```
Tempo 118 BPM · 4 Takte · A minor · Akkorde: Am | F | C | G G7 · Lage F1–C3 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: A1(33) 0/1.5/104 · A2(45) 2/1.5/86 · A1(33) 4/1.5/104 · A2(45) 6/1.5/86 · A1(33) 8/1.5/104 · A2(45) 10/1.5/86 · G2(43) 12/1.5/104 · E2(40) 14/1.5/86
T2: F1(29) 16/1.5/104 · F2(41) 18/1.5/86 · F1(29) 20/1.5/104 · F2(41) 22/1.5/86 · F1(29) 24/1.5/104 · F2(41) 26/1.5/86 · A1(33) 28/1.5/104 · C2(36) 30/1.5/86
T3: C2(36) 32/1.5/104 · C3(48) 34/1.5/86 · C2(36) 36/1.5/104 · C3(48) 38/1.5/86 · G1(31) 40/1.5/104 · G2(43) 42/1.5/86 · C2(36) 44/1.5/104 · E2(40) 46/1.5/86
T4: G1(31) 48/1.5/104 · G2(43) 50/1.5/86 · G1(31) 52/1.5/104 · G2(43) 54/1.5/86 · B1(35) 56/1.5/104 · D2(38) 58/1.5/86 · F2(41) 60/1.5/104 · Ab2(44) 62/1.5/86
```

**Spur SZ-08 Rauschwellen-Kit (Drums)**
```
Tempo 118 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x.......x....... | x.......x.x..... | x.......x....... | x.....x.x.......
SNARE | ....x.......x... | ....x.......x... | ....x.......x..x | ....x.......xxxx
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
PERC  | ................ | ...........x.... | ................ | .......x........
```

**Warum rechtlich unbedenklich:** 1/32-Akkordzerlegung, PWM und Oktav-Achtel sind Techniken der ganzen C64-Szene; vi–IV–I–V ist Allerwelt; die Glocken-Melodie ist neu und hat einen 1/32-Vorschlag als Chip-Stilmittel.
**Karten:** SZ-05 „Flirrendes Chip-Arpeggio aus 1/32 – erinnert an C64-Synthpop (Stil Welle:Erdball).“ · SZ-06 „Metallische Ring-Glocke wie aus dem Brotkasten.“ · SZ-07 „Puls-Bass mit wanderndem Puls durchs 12-dB-Filter.“ · SZ-08 „Trockene Chip-Drums aus Rauschen und Puls.“

---

### 4.3 Elegant Machinery (`elegant-machinery`) – Schwedischer Synthpop

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Seit 1988, zuerst als „Pole Position“ | BELEGT (Band-Interview, Suchauszug R8) | https://www.electricityclub.co.uk/elegant-machinery-interview/ |
| Heft zu „A Decade of Thoughts“ (1998) dankt für **Novation**-Synths aus einem Laden in Malmö; „top analogue synths“ waren damals billig | BELEGT (Band-Interview); **Modelle UNBELEGT** | wie oben |
| Heute „quite some synths from Arturia, some Behringer stuff, the old E-mu“ | BELEGT (Band-Interview) | wie oben |
| Eskil Simonsson (Covenant): Produktion und zusätzliche Synthesizer auf „A Decade of Thoughts“ | WAHRSCHEINLICH (Discogs-Credits, nutzergepflegt) | https://www.discogs.com/release/153510-Elegant-Machinery-A-Decade-Of-Thoughts |
| Besetzung Robert Enforsen (Gesang), Leslie Bodin, Richard Jomshof | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Elegant_Machinery |

**Klangbild (UNBELEGT, eK):** 115–128 BPM, Moll mit Dur-Aufhellung im Refrain, getragene, melancholische Lead-Melodien, warme Analog-Flächen, Achtel-Bass, klare Drumcomputer-Beats, wenig Effekte außer Chorus und Hall.

#### SZ-09 „Schärenlicht-Fläche“ – Fläche · VA
- **Vorbild (ⓘ):** warme Analog-Fläche des 90er-Schweden-Synthpop (Stil). „Novation-Synths“ BELEGT, welches Modell UNBELEGT.
- **Rezept:** `o1w 0, o1uni 3, uniDet .3, uniMix .6, uniWidth .9, o2w 1, o2pw .4, o2fine 8, o2lvl .5, ftype 0, cutoff 1500, res .12, drive .1, kt .4, fenv .12, fA .6, fD 1.5, fS .6, fR 1.2, aA .35, aD 1, aS .85, aR 1.4, poly 6, analog .25, spread .6, l2shape 0, l2rate .15` · Mods `M('lfo2','cutoff',.04)` (±4,8 HT) · fx `{chorus:{mode:'I+II', mix .7}, rev .45, dly .1}`
- **Lage / Rolle:** C3–E4 (48–64). Fläche.

#### SZ-10 „Fernweh-Lead“ – Lead · VA (verfeinert A.1 #16)
- **Rezept:** `o1w 0, o2w 1, o2pw .45, o2fine 5, o2lvl .7, ftype 0, cutoff 2000, res .22, drive .2, kt .55, fenv .18, fA .005, fD .4, fS .55, fR .3, aA .006, aD .4, aS .85, aR .35, mode 2, poly 1, glide .03, l2shape 0, l2rate 5.5, l2fade .6, analog .2` · Mods `M('lfo2','pitch',.006)` (±14 ct, verzögert) · fx `{rev .3, dly .25}` · bus `{echo:{divL '1/4', fb .3}}`
- **Unterschied zu A.1 #16:** Puls statt zweiter Säge (hohler, „nordischer“), Vibrato ±14 statt ±19 ct (A.1 #16 maß 34,5 ct Spitze-Spitze = ±17 ct).
- **Lage / Rolle:** E4–A5 (64–81). Grenze **tief D4**.

#### SZ-11 „Stab-Achtelbass“ – Bass · VA
- **Rezept:** `o1w 0, o2w 1, o2pw .35, o2oct -1, o2lvl .5, ftype 0, cutoff 480, res .25, drive .25, kt .4, fenv .3, fD .14, fS .1, aA .001, aD .25, aS .5, aR .05, mode 1, poly 1, reset 1, analog .1` · fx `{rev .05}`
- **Lage / Rolle:** G1–E3 (31–52). Bass, Achtel mit Oktave.

**Hörprobe „Schärenlicht“** – 122 BPM, e-Moll, `Em | C | G | D B7`. Wendung Takt 4: B7 als Dur-Dominante (D♯ im Lead und Bass).

**Spur SZ-09 Schärenlicht-Fläche**
```
Tempo 122 BPM · 4 Takte · E minor · Akkorde: Em | C | G | D B7 · Lage D3–C4 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E3(52) 0/16/80 · G3(55) 0/16/80 · B3(59) 0/16/80
T2: E3(52) 16/16/80 · G3(55) 16/16/80 · C4(60) 16/16/80
T3: D3(50) 32/16/80 · G3(55) 32/16/80 · B3(59) 32/16/80
T4: D3(50) 48/8/80 · F#3(54) 48/8/80 · A3(57) 48/8/80 · Eb3(51) 56/8/86 · F#3(54) 56/8/86 · A3(57) 56/8/86 · B3(59) 56/8/86
```

**Spur SZ-10 Fernweh-Lead**
```
Tempo 122 BPM · 4 Takte · E minor · Akkorde: Em | C | G | D B7 · Lage E4–G5 · 19 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: B4(71) 0/4/100 · A4(69) 4/2/88 · G4(67) 6/2/88 · E4(64) 8/6/96 · G4(67) 14/2/84
T2: E5(76) 16/6/106 · D5(74) 22/2/90 · C5(72) 24/4/96 · B4(71) 28/2/88 · A4(69) 30/2/86
T3: B4(71) 32/6/98 · D5(74) 38/2/90 · G5(79) 40/6/108 · F#5(78) 46/2/90
T4: F#5(78) 48/4/104 · E5(76) 52/2/90 · D5(74) 54/2/88 · Eb5(75) 56/4/100 · F#5(78) 60/4/104
```

**Spur SZ-11 Stab-Achtelbass**
```
Tempo 122 BPM · 4 Takte · E minor · Akkorde: Em | C | G | D B7 · Lage G1–E3 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E2(40) 0/1.5/104 · E2(40) 2/1.5/86 · E3(52) 4/1.5/104 · E2(40) 6/1.5/86 · E2(40) 8/1.5/104 · E2(40) 10/1.5/86 · D3(50) 12/1.5/104 · B2(47) 14/1.5/86
T2: C2(36) 16/1.5/104 · C2(36) 18/1.5/86 · C3(48) 20/1.5/104 · C2(36) 22/1.5/86 · G2(43) 24/1.5/104 · C2(36) 26/1.5/86 · C3(48) 28/1.5/104 · E2(40) 30/1.5/86
T3: G1(31) 32/1.5/104 · G2(43) 34/1.5/86 · G1(31) 36/1.5/104 · G2(43) 38/1.5/86 · D2(38) 40/1.5/104 · G2(43) 42/1.5/86 · B2(47) 44/1.5/104 · G2(43) 46/1.5/86
T4: D2(38) 48/1.5/104 · D2(38) 50/1.5/86 · D3(50) 52/1.5/104 · D2(38) 54/1.5/86 · B1(35) 56/1.5/104 · B1(35) 58/1.5/86 · B2(47) 60/1.5/104 · Eb2(39) 62/1.5/86
```

**Warum rechtlich unbedenklich:** i–VI–III–VII mit Dur-Dominante ist Allerwelt; die Lead-Melodie ist neu (Abwärts-Stufen in T1, Sexte in T3); Achtel-Oktavbass ist Allerweltstechnik.
**Karten:** SZ-09 „Warme Schweden-Fläche mit doppeltem Chorus.“ · SZ-10 „Melancholischer Puls-Lead mit spätem Vibrato – erinnert an schwedischen 90er-Synthpop (Stil Elegant Machinery).“ · SZ-11 „Kurzer Achtel-Oktavbass.“

---

### 4.4 S.P.O.C.K (`spock`) – Sci-Fi-Synthpop

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Schwedische Band; Schreibweise **S.P.O.C.K** | WAHRSCHEINLICH (Suchauszug R8; Wikipedia + Interview genannt, wer was sagt, ist offen) | https://en.wikipedia.org/wiki/S.P.O.C.K · https://www.electricityclub.co.uk/s-p-o-c-k-interview/ |
| „Never Trust a Klingon“ (1992): „bubbling synthpop and samples from Captain James T Kirk“ | WAHRSCHEINLICH (Rezension; daraus folgt Sampler-Einsatz) | wie oben |
| Geräte | UNBELEGT | – |
| Bedeutung des Namens, Besetzung | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/S.P.O.C.K |

**Klangbild (UNBELEGT, eK):** 120–132 BPM, meist Dur oder Dur/Moll-Wechsel, verspielte, „blubbernde“ Sequenzen (das ist auch die Rezensions-Formulierung), Sci-Fi-Effekte zwischen den Teilen, eingängige Refrain-Hooks.
**Nicht nachgebaut:** Kirk-Zitate und andere Film-Samples (Rechte an Aufnahmen, § 85 UrhG; Sampling kann die App nicht). Ein **eigener** Sci-Fi-Effekt (SZ-12) ersetzt das Stilmittel, nicht die Aufnahme.

#### SZ-12 „Beam-Schimmer“ – Effekt · VA
- **Vorbild (ⓘ):** Sci-Fi-Übergangseffekt (eigener Entwurf, keine Nachbildung eines Film-Sounds).
- **Rezept:** `o1w 3, o1lvl .3, o2w 0, o2oct 1, o2lvl .2, noise .6, ftype 2, cutoff 800, res .7, kt .3, fenv .5, fA 1.4, fD 1, fS 1, fR 1, aA .3, aD 1, aS .9, aR 1.2, poly 2, mA 1.2, mD .5, mS 1, mR 1, l1shape 0, l1rate 18` · Mods `M('lfo1','amp',.7), M('menv','pitch',.5)` · fx `{rev .5, dly .3}` · bus `{echo:{divL '1/8', fb .4}}`
  - Rauschen + Sinus durch ein resonantes Bandpass, das in 1,4 s um 36 HT steigt; Tonhöhe steigt in 1,2 s um 12 HT; LFO 1 (Sinus 18 Hz) → Lautstärke 0,7 lässt den Pegel zwischen ×0,3 und ×1,7 flirren (Worklet-Weg, §2.3).
- **Lage / Rolle:** G4–D5. Effekt (Rolle `atmo`, Anzeige „Effekt“ nach EN-18).

#### SZ-13 „Blubber-Sequenz“ – Sequenz · VA
- **Vorbild (ⓘ):** „bubbling synthpop“ (WAHRSCHEINLICH, Rezension).
- **Rezept:** `o1w 0, o2w 1, o2pw .3, o2lvl .4, ftype 0, cutoff 500, res .72, drive .1, bass .5, kt .6, fenv .4, fvel .4, fA .001, fD .07, fS 0, fR .05, aA .001, aD .14, aS 0, aR .05, mode 1, poly 1, reset 1, analog .1, l2shape 1, l2sync 16` · Mods `M('lfo2','cutoff',.03)` (±3,6 HT über 4 Takte) · fx `{dly .2, rev .12}` · bus `{echo:{mode 'pp', divL '1/8.', fb .3}}`
- **Warum:** Hohe Resonanz (72 %) + sehr kurzer Filter-Decay (70 ms) = „Blub“ je 16tel; Oktavsprünge lassen es hüpfen.
- **Lage / Rolle:** C3–A4 (48–69). Grenze **hoch C5**.

#### SZ-14 „Kommunikator-Hook FM“ – Lead · FM6
- **Rezept (Alg. 5):** `alg 5, fb 5, trans 0`
  - OP1 `coarse 1, ol 99, r [99,45,30,60], l [99,80,65,0]` · OP2 `coarse 1, ol 78, r [99,55,35,60], l [99,70,50,0], vs 3`
  - OP3 `coarse 1, det 4, ol 90, r [99,45,30,60], l [99,80,65,0]` · OP4 `coarse 1, ol 74, r [99,60,35,60], l [99,60,45,0], vs 3`
  - OP5 `coarse 4, ol 60, r [99,80,40,70], l [99,30,0,0]` (heller „Piep“-Anschlag) · OP6 `coarse 1, ol 50, r [99,70,40,60], l [99,40,0,0]` (Rückkopplung 5 = sägeartig)
  - common `{gain -14, mode 2, poly 1, glide .02, lfo {wave 'tri', rate 5.8, delay .5, pitch 5}}` · fx `{dly .25, rev .25}` · bus `{echo:{divL '1/8.', fb .3}}`
- **Lage / Rolle:** G4–A5 (67–81). Lead.

**Hörprobe „Sternzeit“** – 128 BPM, G-Dur, `G | Em | C | D`. Wendung Takt 4: Sequenz steigt bis A4 und nimmt C (Septime) mit, Hook endet offen auf C5.

**Spur SZ-13 Blubber-Sequenz**
```
Tempo 128 BPM · 4 Takte · G major · Akkorde: G | Em | C | D · Lage C3–A4 · 64 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G3(55) 0/1/110 · G4(67) 1/1/80 · D4(62) 2/1/92 · B3(59) 3/1/80 · G3(55) 4/1/110 · G4(67) 5/1/80 · D4(62) 6/1/92 · B3(59) 7/1/80 · G3(55) 8/1/110 · G4(67) 9/1/80 · E4(64) 10/1/92 · D4(62) 11/1/80 · B3(59) 12/1/110 · G4(67) 13/1/80 · D4(62) 14/1/92 · B3(59) 15/1/80
T2: E3(52) 16/1/110 · E4(64) 17/1/80 · B3(59) 18/1/92 · G3(55) 19/1/80 · E3(52) 20/1/110 · E4(64) 21/1/80 · B3(59) 22/1/92 · G3(55) 23/1/80 · E3(52) 24/1/110 · E4(64) 25/1/80 · D4(62) 26/1/92 · B3(59) 27/1/80 · G3(55) 28/1/110 · E4(64) 29/1/80 · B3(59) 30/1/92 · G3(55) 31/1/80
T3: C3(48) 32/1/110 · C4(60) 33/1/80 · G3(55) 34/1/92 · E3(52) 35/1/80 · C3(48) 36/1/110 · C4(60) 37/1/80 · G3(55) 38/1/92 · E3(52) 39/1/80 · C3(48) 40/1/110 · C4(60) 41/1/80 · E4(64) 42/1/92 · G4(67) 43/1/80 · E4(64) 44/1/110 · C4(60) 45/1/80 · G3(55) 46/1/92 · E3(52) 47/1/80
T4: D3(50) 48/1/110 · D4(62) 49/1/80 · A3(57) 50/1/92 · F#3(54) 51/1/80 · D3(50) 52/1/110 · D4(62) 53/1/80 · A3(57) 54/1/92 · F#3(54) 55/1/80 · A3(57) 56/1/116 · D4(62) 57/1/86 · F#4(66) 58/1/98 · A4(69) 59/1/86 · F#4(66) 60/1/116 · D4(62) 61/1/86 · C4(60) 62/1/98 · A3(57) 63/1/86
```

**Spur SZ-14 Kommunikator-Hook FM**
```
Tempo 128 BPM · 4 Takte · G major · Akkorde: G | Em | C | D · Lage G4–A5 · 22 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: D5(74) 0/2/100 · B4(71) 2/2/88 · D5(74) 4/2/94 · G5(79) 6/4/108 · F#5(78) 10/2/90 · E5(76) 12/2/90 · D5(74) 14/2/88
T2: E5(76) 16/6/100 · B4(71) 22/2/86 · G4(67) 24/4/90 · B4(71) 28/4/92
T3: C5(72) 32/2/96 · E5(76) 34/2/96 · G5(79) 36/4/104 · E5(76) 40/2/92 · G5(79) 42/2/96 · A5(81) 44/4/110
T4: F#5(78) 48/6/104 · E5(76) 54/2/90 · D5(74) 56/4/96 · A4(69) 60/2/86 · C5(72) 62/2/90
```

**Spur SZ-12 Beam-Schimmer (FX)**
```
Tempo 128 BPM · 4 Takte · G major · Akkorde: G | Em | C | D · Lage G4–E5 · 4 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G4(67) 0/12/90
T2: B4(71) 24/8/70
T3: E5(76) 44/4/76
T4: D5(74) 52/12/100
```

**Warum rechtlich unbedenklich:** I–vi–IV–V ist eine der häufigsten Pop-Folgen; die Sequenz ist eine Akkordzerlegung mit Oktavsprung; der Hook ist neu; kein Sample, kein Film-Effekt.
**Karten:** SZ-13 „Blubbernde 16tel mit viel Resonanz – erinnert an schwedischen Sci-Fi-Synthpop (Stil S.P.O.C.K).“ · SZ-14 „Fröhlicher FM-Hook.“ · SZ-12 „Aufsteigendes Sci-Fi-Flirren für Übergänge.“

---

### 4.5 Kirlian Camera (`kirlian-camera`) – Cinematic Darkwave / Cold Wave

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Parma, 1979 als „Suicide Commando“ gegründet, ab 1980 Kirlian Camera, Angelo Bergamini | WAHRSCHEINLICH (ein Suchauszug, R6). Nicht verwechseln mit der belgischen Band Suicide Commando (eK, UNBELEGT) | https://en.wikipedia.org/wiki/Kirlian_Camera |
| „Helden Platz“ (1987): „slow moving synth washes, orchestral strings“ | WAHRSCHEINLICH (ein Suchauszug, R6) | wie oben |
| Sängerin Elena Alice Fossi (seit etwa 2000) | UNBELEGT (eK) ⚑ | Prüf-URL wie oben |
| Geräte | UNBELEGT | – |

**Klangbild (UNBELEGT außer „Streicher-Flächen“):** 80–110 BPM, Moll mit Dur-Dominante (harmonisch Moll), langsame Streicher- und Chorflächen, viel Hall, Glocken, Sopranstimme über dunklem Achtelbass; lange Intros.

#### SZ-15 „Requiem-Chor“ – Fläche · WT
- **Rezept:** `wt {table 'vocal', pos .15, scan .5, scanTime 4}, ftype 0, cutoff 1500, res .15, fenv .1, kt .2, fA 1, fD 2, fS .7, fR 2, aA .9, aD 1.5, aS .9, aR 3, poly 6, l1shape 0, l1rate .2, spread .6` · Mods `M('lfo1','cutoff',.03)` · fx `{chorus:{mode:'ENS', mix .6}, rev .6, dly .1}` · bus `{hall:{decay 7, size 1.2}}`
- **Lage / Rolle:** F3–F5, Gegenstimme oben G4–E5. Fläche/Chor. (R6 N18 „Parma-Nebel“ bleibt die Atmo-Variante.)

#### SZ-16 „Marmor-Streicher“ – Fläche · VA (verfeinert R6 N17)
- **Vorbild (ⓘ):** „orchestral strings, slow moving synth washes“ (WAHRSCHEINLICH, eine Rezension).
- **Rezept:** `o1w 0, o1uni 5, uniDet .35, uniMix .5, uniWidth 1, o2w 0, o2oct -1, o2lvl .4, ftype 1, cutoff 1800, res .1, drive .05, kt .3, fenv .1, fA 1, fD 2, fS .7, fR 2, aA .8, aD 1, aS .9, aR 2.5, poly 6, analog .3, spread .7, l2shape 0, l2rate .08` · Mods `M('lfo2','cutoff',.05)` (±6 HT) · fx `{chorus:{mode:'ENS', mix .8}, rev .55}` · bus `{hall:{decay 7}}`
- **Unterschied zu N17:** LP12 statt LP24 (seidiger), Attack 0,8 s (Bogen setzt ein).
- **Lage / Rolle:** C3–C5. Fläche.

#### SZ-17 „Kaltpuls-Bass“ – Bass · VA
- **Rezept:** `o1w 1, o1pw .35, o2w 0, o2oct -1, o2fine 4, o2lvl .5, ftype 0, cutoff 420, res .2, drive .15, kt .3, fenv .22, fD .25, fS .2, aA .002, aD .4, aS .7, aR .1, mode 1, poly 1, reset 1, analog .2` · fx `{chorus:{mode:'I', mix .5}, rev .15}`
- **Warum:** Chorus auf dem Bass ist ein Cold-Wave-Merkmal (vgl. R6 Frozen Autumn „Chorus-Bass“, Einschätzung).
- **Lage / Rolle:** F1–C3. Bass.

#### SZ-18 „Turmglocke FM“ – Glocke · FM6
- **Rezept (Alg. 5):** `alg 5, fb 0`
  - OP1 `coarse 1, ol 99, r [99,30,20,35], l [99,60,0,0]` · OP2 `coarse 3, fine 50, ol 75, r [99,35,20,40], l [99,50,0,0]` (×3,5 = unharmonisch)
  - OP3 `coarse 1, det 3, ol 90, r [99,30,20,35], l [99,60,0,0]` · OP4 `coarse 3, fine 50, det -3, ol 70, r [99,35,20,40], l [99,50,0,0]`
  - OP5 `coarse 2, ol 70, r [99,50,30,45], l [99,40,0,0]` · OP6 `coarse 5, ol 55, r [99,80,40,60], l [99,20,0,0]` (Klöppel)
  - common `{gain -14, poly 6}` · fx `{rev .5, dly .1}`
- **Lage / Rolle:** C5–C6. Glocke/Akzent, sparsam.

**Hörprobe „Parma-Nacht“** – 92 BPM, f-Moll, `Fm | D♭ | A♭ | C C7`. Wendung Takt 4: C-Dur mit E im Chor (harmonisch Moll), Bass steigt auf C3.

**Spur SZ-16 Marmor-Streicher**
```
Tempo 92 BPM · 4 Takte · F minor · Akkorde: Fm | Db | Ab | C C7 · Lage Eb3–C#4 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F3(53) 0/16/76 · Ab3(56) 0/16/76 · C4(60) 0/16/76
T2: F3(53) 16/16/76 · Ab3(56) 16/16/76 · C#4(61) 16/16/76
T3: Eb3(51) 32/16/78 · Ab3(56) 32/16/78 · C4(60) 32/16/78
T4: E3(52) 48/8/80 · G3(55) 48/8/80 · C4(60) 48/8/80 · E3(52) 56/8/86 · G3(55) 56/8/86 · Bb3(58) 56/8/86 · C4(60) 56/8/86
```

**Spur SZ-15 Requiem-Chor**
```
Tempo 92 BPM · 4 Takte · F minor · Akkorde: Fm | Db | Ab | C C7 · Lage G4–E5 · 7 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C5(72) 0/16/84
T2: C#5(73) 16/8/84 · C5(72) 24/8/80
T3: C5(72) 32/8/82 · Eb5(75) 40/8/90
T4: E5(76) 48/12/94 · G4(67) 60/4/80
```

**Spur SZ-17 Kaltpuls-Bass**
```
Tempo 92 BPM · 4 Takte · F minor · Akkorde: Fm | Db | Ab | C C7 · Lage F1–C3 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F1(29) 0/1.6/104 · F1(29) 2/1.6/86 · F2(41) 4/1.6/104 · F1(29) 6/1.6/86 · F1(29) 8/1.6/104 · F1(29) 10/1.6/86 · Eb2(39) 12/1.6/104 · C2(36) 14/1.6/86
T2: C#2(37) 16/1.6/104 · C#2(37) 18/1.6/86 · Ab1(32) 20/1.6/104 · C#2(37) 22/1.6/86 · C#2(37) 24/1.6/104 · C#2(37) 26/1.6/86 · F2(41) 28/1.6/104 · Ab1(32) 30/1.6/86
T3: Ab1(32) 32/1.6/104 · Ab1(32) 34/1.6/86 · Eb2(39) 36/1.6/104 · Ab1(32) 38/1.6/86 · Ab1(32) 40/1.6/104 · C2(36) 42/1.6/86 · Eb2(39) 44/1.6/104 · Ab1(32) 46/1.6/86
T4: C2(36) 48/1.6/104 · C2(36) 50/1.6/86 · G1(31) 52/1.6/104 · C2(36) 54/1.6/86 · E2(40) 56/1.6/104 · G2(43) 58/1.6/86 · Bb2(46) 60/1.6/104 · C3(48) 62/1.6/86
```

**Spur SZ-18 Turmglocke FM**
```
Tempo 92 BPM · 4 Takte · F minor · Akkorde: Fm | Db | Ab | C C7 · Lage C5–Ab5 · 5 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F5(77) 0/8/100
T2: Ab5(80) 24/8/96
T3: Eb5(75) 32/8/96 · C5(72) 44/4/84
T4: E5(76) 48/16/104
```

**Warum rechtlich unbedenklich:** i–VI–III–V (harmonisch Moll) ist Allerwelt; Flächen und Glocken spielen nur Akkordtöne in langen Werten; keine Melodie eines Titels.
**Karten:** SZ-16 „Langsam einsetzende Kino-Streicher mit 7-s-Hall – erinnert an italienischen Darkwave (Stil Kirlian Camera).“ · SZ-15 „Chor-Fläche, die vom O zum A spricht.“ · SZ-17 „Dunkler Achtelbass mit Chorus.“ · SZ-18 „Turmglocke aus FM.“

---

### 4.6 Project Pitchfork (`project-pitchfork`) – Dark Electro / Darkwave

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Hamburg 1989; Peter Spilles, Dirk Scheuber, Jürgen Jansen | WAHRSCHEINLICH (ein Suchauszug, R6) | https://en.wikipedia.org/wiki/Kaskade_(Project_Pitchfork_album) |
| „Kaskade“ aufgenommen in den Candyland Studios | WAHRSCHEINLICH (wie oben) | wie oben |
| Geräte | UNBELEGT. **Achtung:** R6 nennt im Quellenblock „Project Pitchfork und Virus/Franke“. Der Beatportal-Artikel betrifft Wolfram Franke (Access Virus), **nicht** Project Pitchfork; daraus folgt kein Virus-Einsatz (§6, K-7). | https://www.beatportal.com/articles/1075891-the-sound-architects-wolfram-franke |
| Tiefe, raue Stimme (Spilles), Dark-Electro-Klang | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Project_Pitchfork |

**Klangbild (UNBELEGT, eK):** 110–130 BPM, c-/d-Moll, dunkle Chorflächen, rauer 16tel-Bass mit Lücken, metallische Perkussion, Tom-Fills, Halbton-Spannung (♭2, ♭6–♭7–i).

#### SZ-19 „Grollbass“ – Bass · VA (Schwester von R6 N22)
- **Rezept:** `o1w 0, o2w 0, o2fine -8, o2lvl .8, o3w 1, o3oct -1, o3lvl .35, ftype 0, cutoff 230, res .45, drive .45, bass .8, kt .3, fenv .3, fvel .5, fA .001, fD .07, fS 0, fR .05, aA .001, aD .18, aS .5, aR .04, mode 1, poly 1, reset 1, analog .1, spread 0` · Mods `M('vel','fenv',.25)` · fx `{drive .45, pump .3, pumpRel '1/16', rev .03}` · ab VK zusätzlich `sat .5` (raue Sättigung nach dem Filter; der Filter-Drive raut nicht auf, R6 [g])
- **Lage / Rolle:** A♭1–C3. Grenze **hoch D3**.

#### SZ-20 „Kathedralen-Chor“ – Fläche · WT (R6 N21 mit Korrektur)
- **Rezept:** `wt {table 'vocal', pos .2, scan .6, scanTime 4}, ftype 0, cutoff 1600, res .1, fA .8, fD 2, fS .7, aA 1, aD 1.5, aS .9, aR 4, poly 6, spread .6` · fx `{chorus:{mode:'ENS', mix .6}, rev .6, dly .2}` · bus `{echo:{divL '1/4', fb .2}, hall:{decay 8}}`
- **Lage / Rolle:** G3–F4 (Akkordlage). Fläche.

#### SZ-21 „Splitter-Sequenz FM“ – Sequenz · FM6
- **Rezept (Alg. 5, nur 2 Paare):** `alg 5, fb 0`
  - OP1 `coarse 1, ol 99, r [99,70,40,70], l [99,30,0,0]` · OP2 `coarse 3, fine 41, ol 82, r [99,80,50,70], l [99,20,0,0]` (×3,41 = metallisch)
  - OP3 `coarse 2, ol 80, r [99,75,40,70], l [99,20,0,0]` · OP4 `coarse 7, fine 7, ol 70, r [99,85,50,70], l [99,10,0,0]`
  - OP5/OP6 `ol 0` (aus)
  - common `{gain -12, poly 4}` · fx `{dly .3, rev .2}` · bus `{echo:{mode 'pp', divL '1/8', fb .35}}`
- **Lage / Rolle:** C5–D6. Sequenz (Off-Beat-Splitter über dem Bass).

#### SZ-22 „Schmiede-Kit“ – Drums (Basis „909“)
- KICK `frq 48, pAmt 20, pDec .05, tDec .38, cLvl .5, cTyp 0, drv .55, dyn .35`
- SNARE `frq 180, tDec .14, nLvl 1, nTyp 'bandpass', nFrq 2500, nDec .22, sRoom .45, drv .3`
- PERC (Amboss) `mLvl 1, mTun .63, mHi .7, mLo .3, mQ 4, mHp 1500, mDec .12, tLvl .4, frq 340, tDec .05, drv .4`
- TOM T/M `frq 80 / 110, pAmt 9, pDec .1, tDec .35, sRoom .3` · HH ZU `mDec .03`

**Hörprobe „Funkenschlag“** – 118 BPM, c-Moll, `Cm | Csus4 Cm | A♭ | B♭`. Wendung Takt 4: Bass steigt B♭–D–F–B♭ und endet auf H (Leitton), FM bis D6, Tom-Fill.

**Spur SZ-19 Grollbass**
```
Tempo 118 BPM · 4 Takte · C minor · Akkorde: Cm | Cm | Ab | Bb · Lage Ab1–Bb2 · 48 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C2(36) 0/1/110 · C2(36) 2/1/92 · C2(36) 3/1/80 · C2(36) 5/1/80 · C2(36) 6/1/92 · C2(36) 8/1/110 · C2(36) 10/1/92 · C2(36) 11/1/80 · Bb1(34) 12/1/110 · C2(36) 13/1/80 · Eb2(39) 14/1/92 · C2(36) 15/1/80
T2: C2(36) 16/1/110 · C2(36) 18/1/92 · C2(36) 19/1/80 · C2(36) 21/1/80 · C2(36) 22/1/92 · C2(36) 24/1/110 · C2(36) 26/1/92 · C#2(37) 27/1/80 · C2(36) 28/1/110 · G2(43) 30/1/92 · F2(41) 31/1/80
T3: Ab1(32) 32/1/110 · Ab1(32) 34/1/92 · Ab1(32) 35/1/80 · Ab1(32) 37/1/80 · Ab1(32) 38/1/92 · Ab1(32) 40/1/110 · Ab1(32) 42/1/92 · Ab1(32) 43/1/80 · C2(36) 44/1/110 · Ab1(32) 45/1/80 · Eb2(39) 46/1/92 · Ab1(32) 47/1/80
T4: Bb1(34) 48/1/110 · Bb1(34) 50/1/92 · Bb1(34) 51/1/80 · Bb1(34) 53/1/80 · Bb1(34) 54/1/92 · Bb1(34) 56/1/110 · Bb1(34) 57/1/88 · D2(38) 58/1/100 · F2(41) 59/1/88 · Bb2(46) 60/1/118 · F2(41) 61/1/88 · D2(38) 62/1/100 · B1(35) 63/1/88
```

**Spur SZ-20 Kathedralen-Chor**
```
Tempo 118 BPM · 4 Takte · C minor · Akkorde: Cm | Csus4 Cm | Ab | Bb · Lage G3–F4 · 15 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G3(55) 0/16/78 · C4(60) 0/16/78 · Eb4(63) 0/16/78
T2: G3(55) 16/8/80 · C4(60) 16/8/80 · F4(65) 16/8/80 · G3(55) 24/8/78 · C4(60) 24/8/78 · Eb4(63) 24/8/78
T3: Ab3(56) 32/16/80 · C4(60) 32/16/80 · Eb4(63) 32/16/80
T4: Bb3(58) 48/16/86 · D4(62) 48/16/86 · F4(65) 48/16/86
```

**Spur SZ-21 Splitter-Sequenz FM**
```
Tempo 118 BPM · 4 Takte · C minor · Akkorde: Cm | Cm | Ab | Bb · Lage C5–D6 · 18 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C5(72) 2/1/96 · G5(79) 6/1/100 · C5(72) 10/1/92 · Eb5(75) 14/1/96
T2: C5(72) 18/1/96 · G5(79) 22/1/100 · Ab5(80) 26/1/104 · G5(79) 29/1/90
T3: C5(72) 34/1/96 · Eb5(75) 38/1/100 · Ab5(80) 42/1/104 · G5(79) 44/1/92 · Eb5(75) 46/1/90
T4: D5(74) 50/1/96 · F5(77) 54/1/100 · Bb5(82) 58/1/106 · D6(86) 60/1/110 · C6(84) 62/1/100
```

**Spur SZ-22 Schmiede-Kit (Drums)**
```
Tempo 118 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x..x | x...x...x...x... | x...x...x.x.x.xx
SNARE | ....x.......x... | ....x.......x... | ....x.......x.x. | ....x...........
HH ZU | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xxx.xxx.xx | x.xxx.xx........
PERC  | ..x.....x....x.. | ..x.....x.....x. | ..x.....x....x.. | ..x.............
TOM M | ................ | ................ | ................ | ........x.x.....
TOM T | ................ | ................ | ................ | ............x.xx
```

**Warum rechtlich unbedenklich:** i–VI–VII ist Allerwelt, 16tel-Bass mit Lücken und ♭2 ist Genre-Technik, FM-Splitter sind Akkordtöne auf Offbeats.
**Karten:** SZ-19 „Rauer 16tel-Bass mit Lücken – erinnert an deutschen Dark Electro (Stil Project Pitchfork).“ · SZ-20 „Dunkler Chor mit langem Hall.“ · SZ-21 „Metallische FM-Splitter auf den Offbeats.“ · SZ-22 „Kit mit Amboss-Perkussion und Tom-Fills.“

---

### 4.7 Second Decay (`second-decay`) – Analoger Wave/EBM

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Duo Andreas Michael Sippel und Christian Purwien; 1987 „Blue Velvet“, ab 1989 Second Decay; Alben 1992–1999, EP 2001 | WAHRSCHEINLICH (Qobuz + Fanblog, Suchauszug R6; die Quellen sind nicht klar unabhängig) | https://www.qobuz.com/ca-en/interpreter/second-decay/9406900 · https://systemsofromance.com/blog/category/second-decay |
| „Nur analoge Synthesizer“ | WAHRSCHEINLICH (eine Quelle) | wie oben |
| Xanders „Second TK“ = Second Decay | intern (Deutung in `fragen-xander-6.md`), nicht bestätigt ⚑ | – |

**Klangbild (UNBELEGT):** 120–130 BPM, Moll, klassischer EBM-16tel-Bass mit Oktave, Puls-Stakkato, trockene Drums.

#### SZ-23 „Kellerpuls-Bass“ – Bass · VA (verfeinert R6 N19)
- **Rezept:** `o1w 1, o1pw .45, o2w 0, o2oct -1, o2fine 3, o2lvl .7, ftype 0, cutoff 380, res .35, drive .3, bass .6, kt .4, fenv .36, fA .001, fD .1, fS 0, fR .05, aA .001, aD .17, aS .45, aR .04, mode 1, poly 1, reset 1, analog .2` · fx `{drive .25, rev .04}` · ab VK `walk .3` (lebendige Analog-Drift)
- **Lage / Rolle:** E1–A2. Unter 50 Hz (E1–G1) hört man am iPhone-Lautsprecher nur die Obertöne; Säge + Puls liefern sie. Grenze **hoch C3**.

#### SZ-24 „Kaltlicht-Stakkato“ – Sequenz · VA
- **Rezept:** `o1w 1, o1pw .2, o2w 1, o2pw .5, o2oct 1, o2lvl .3, ftype 1, cutoff 1800, res .3, kt .6, fenv .25, fD .08, fS 0, aA .001, aD .12, aS 0, aR .06, mode 1, poly 1, reset 1, analog .15` · fx `{dly .3, rev .2}` · bus `{echo:{mode 'pp', divL '1/8.', fb .3}}`
- **Lage / Rolle:** C4–D5. Sequenz/Gegenstimme.

**Hörprobe „Kaltlicht“** – 124 BPM, a-Moll, `Am | Am | G | F E`. Drums: SZ-03. Wendung Takt 4: E-Dur (G♯) als Dominante.

**Spur SZ-23 Kellerpuls-Bass**
```
Tempo 124 BPM · 4 Takte · A minor · Akkorde: Am | Am | G | F E · Lage E1–A2 · 64 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: A1(33) 0/1/110 · A1(33) 1/1/80 · A2(45) 2/1/92 · A1(33) 3/1/80 · A1(33) 4/1/110 · A1(33) 5/1/80 · A2(45) 6/1/92 · A1(33) 7/1/80 · A1(33) 8/1/110 · A1(33) 9/1/80 · A2(45) 10/1/92 · A1(33) 11/1/80 · A1(33) 12/1/110 · A1(33) 13/1/80 · G2(43) 14/1/92 · E2(40) 15/1/80
T2: A1(33) 16/1/110 · A1(33) 17/1/80 · A2(45) 18/1/92 · A1(33) 19/1/80 · A1(33) 20/1/110 · C2(36) 21/1/80 · A2(45) 22/1/92 · A1(33) 23/1/80 · A1(33) 24/1/110 · A1(33) 25/1/80 · A2(45) 26/1/92 · A1(33) 27/1/80 · E2(40) 28/1/110 · A1(33) 29/1/80 · G2(43) 30/1/92 · A2(45) 31/1/80
T3: G1(31) 32/1/110 · G1(31) 33/1/80 · G2(43) 34/1/92 · G1(31) 35/1/80 · G1(31) 36/1/110 · G1(31) 37/1/80 · G2(43) 38/1/92 · G1(31) 39/1/80 · G1(31) 40/1/110 · G1(31) 41/1/80 · G2(43) 42/1/92 · G1(31) 43/1/80 · B1(35) 44/1/110 · D2(38) 45/1/80 · G2(43) 46/1/92 · D2(38) 47/1/80
T4: F1(29) 48/1/110 · F1(29) 49/1/80 · F2(41) 50/1/92 · F1(29) 51/1/80 · F1(29) 52/1/110 · F1(29) 53/1/80 · F2(41) 54/1/92 · F1(29) 55/1/80 · E1(28) 56/1/110 · E1(28) 57/1/80 · E2(40) 58/1/92 · E1(28) 59/1/80 · Ab1(32) 60/1/110 · B1(35) 61/1/80 · E2(40) 62/1/92 · Ab2(44) 63/1/80
```

**Spur SZ-24 Kaltlicht-Stakkato**
```
Tempo 124 BPM · 4 Takte · A minor · Akkorde: Am | Am | G | F E · Lage C4–D5 · 19 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E4(64) 2/1/96 · A4(69) 6/1/100 · C5(72) 10/1/104 · A4(69) 14/1/92
T2: E4(64) 18/1/96 · A4(69) 22/1/100 · D5(74) 26/1/106 · C5(72) 28/1/96 · A4(69) 30/1/92
T3: D4(62) 34/1/96 · G4(67) 38/1/100 · B4(71) 42/1/104 · D5(74) 46/1/100
T4: C4(60) 50/1/96 · F4(65) 54/1/100 · A4(69) 56/1/96 · B4(71) 58/1/106 · Ab4(68) 60/1/100 · E4(64) 62/1/94
```

**Warum rechtlich unbedenklich:** i–i–VII–VI–V (andalusische Kadenz-Variante) ist Allerwelt; 16tel-Oktavbass ist die Grundtechnik des EBM.
**Karten:** SZ-23 „Analoger 16tel-Bass mit Puls und Drift – erinnert an deutschen Wave/EBM der 90er (Stil Second Decay).“ · SZ-24 „Kalte Puls-Stakkati auf den Offbeats.“

---

### 4.8 Covenant (`covenant`) – Schwedischer Electro/Futurepop

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Eskil Simonsson (Covenant) produzierte die Elegant-Machinery-Compilation 1998 | WAHRSCHEINLICH (Discogs, R8) | https://www.discogs.com/release/153510-Elegant-Machinery-A-Decade-Of-Thoughts |
| Helsingborg (Schweden), Mitte der 80er gegründet; Simonsson, Joakim Montelius, Clas Nachmanson; Alben u. a. „Sequencer“ (1996), „Europa“ (1998), „United States of Mind“ (2000), „Northern Light“ (2002), „Skyshaper“ (2006) | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Covenant_(band) |
| Geräte | UNBELEGT ⚑ | – |
| Xanders Covenant-Bezug „keit … Polylog“ | ungeklärt (seit Runde 2 offen) | intern: `SYNQUENZER-vision.md` Z. 692 |

**Klangbild (UNBELEGT, eK):** 120–132 BPM, Moll, kühle Flächen mit langsamer Filterbewegung, rollende 16tel-Bässe mit 3er-Akzenten, kristallene Arpeggios, Clap auf 2 und 4, Hi-Hats mit Offbeat-Open-Hat; Refrains hymnisch, Stimme baritonal.

#### SZ-25 „Polarnacht-Fläche“ – Fläche · VA
- **Rezept:** `o1w 0, o1uni 7, uniDet .3, uniMix .7, uniWidth 1, o2w 0, o2oct 1, o2uni 3, o2lvl .3, ftype 0, cutoff 900, res .25, kt .3, fenv .2, fA 2, fD 3, fS .5, fR 2, aA .5, aD 1, aS .9, aR 2, poly 6, l2shape 1, l2sync 16, analog .2, spread .8` · Mods `M('lfo2','cutoff',.06)` (±7 HT über 4 Takte) · fx `{rev .5, dly .15}` · bus `{hall:{decay 5}}`
- **Lage / Rolle:** E3–E5. Fläche.

#### SZ-26 „Schaltwerk-Bass“ – Bass · VA
- **Rezept:** `o1w 0, o2w 0, o2fine 6, o2lvl .7, ftype 0, cutoff 340, res .3, drive .3, bass .6, kt .4, fenv .3, fD .08, fS .05, aA .001, aD .12, aS .35, aR .03, mode 1, poly 1, reset 1, analog .1` · Mods `M('vel','fenv',.3)` · fx `{drive .15, pump .35, pumpRel '1/8'}`
- **Kennzeichen der Hörprobe:** Akzente 3+3+3+3+4 (Schritt 1, 4, 7, 10, 13) über geraden 16teln = „rollend“.
- **Lage / Rolle:** G1–D3. Grenze **hoch E3**.

#### SZ-27 „Eiskristall-Arp FM“ – Sequenz · FM6
- **Rezept (Alg. 5):** `alg 5, fb 0`
  - OP1 `coarse 1, ol 99, r [99,55,35,60], l [99,40,0,0]` · OP2 `coarse 5, ol 65, r [99,70,40,60], l [99,30,0,0], vs 4`
  - OP3 `coarse 2, det 4, ol 80, r [99,55,35,60], l [99,40,0,0]` · OP4 `coarse 1, ol 60, r [99,60,40,60], l [99,40,0,0]`
  - OP5 `coarse 4, ol 60, r [99,80,45,70], l [99,15,0,0]` · OP6 `coarse 9, ol 45, r [99,90,50,70], l [99,0,0,0]`
  - common `{gain -14, poly 6}` · fx `{dly .3, rev .3}` · bus `{echo:{mode 'pp', divL '1/8.', fb .4}}`
- **Lage / Rolle:** D4–B5. Sequenz.

#### SZ-28 „Kaltraum-Kit“ – Drums (Basis „909“)
- KICK `frq 50, pAmt 28, pDec .05, tHld .02, tDec .35, cLvl .5, cTyp 3, drv .35` · CLAP `nBur 4, nGap .008, nDec .2, sRoom .35` · HH ZU `mDec .03` · HH OF `mDec .25` · SNARE kurz für Wirbel `tDec .08, nDec .1, dyn .8`

**Hörprobe „Polarnacht“** – 128 BPM, h-Moll, `Bm | G | D | A`. Wendung Takt 4: Bass läuft C♯–E–A–A♯ (Leitton), Arp springt auf A5, Snare-Wirbel.

**Spur SZ-25 Polarnacht-Fläche**
```
Tempo 128 BPM · 4 Takte · B minor · Akkorde: Bm | G | D | A · Lage E3–D4 · 12 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F#3(54) 0/16/72 · B3(59) 0/16/72 · D4(62) 0/16/72
T2: G3(55) 16/16/72 · B3(59) 16/16/72 · D4(62) 16/16/72
T3: F#3(54) 32/16/72 · A3(57) 32/16/72 · D4(62) 32/16/72
T4: E3(52) 48/16/76 · A3(57) 48/16/76 · C#4(61) 48/16/76
```

**Spur SZ-26 Schaltwerk-Bass**
```
Tempo 128 BPM · 4 Takte · B minor · Akkorde: Bm | G | D | A · Lage G1–D3 · 64 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: B1(35) 0/1/112 · B1(35) 1/1/80 · B2(47) 2/1/80 · B1(35) 3/1/112 · B1(35) 4/1/80 · B2(47) 5/1/80 · B1(35) 6/1/112 · B1(35) 7/1/80 · B2(47) 8/1/80 · B1(35) 9/1/112 · B1(35) 10/1/80 · B2(47) 11/1/80 · B1(35) 12/1/112 · D2(38) 13/1/80 · F#2(42) 14/1/80 · B2(47) 15/1/80
T2: G1(31) 16/1/112 · G1(31) 17/1/80 · G2(43) 18/1/80 · G1(31) 19/1/112 · G1(31) 20/1/80 · G2(43) 21/1/80 · G1(31) 22/1/112 · G1(31) 23/1/80 · G2(43) 24/1/80 · G1(31) 25/1/112 · G1(31) 26/1/80 · G2(43) 27/1/80 · G1(31) 28/1/112 · B1(35) 29/1/80 · D2(38) 30/1/80 · G2(43) 31/1/80
T3: D2(38) 32/1/112 · D2(38) 33/1/80 · D3(50) 34/1/80 · D2(38) 35/1/112 · D2(38) 36/1/80 · D3(50) 37/1/80 · D2(38) 38/1/112 · D2(38) 39/1/80 · D3(50) 40/1/80 · D2(38) 41/1/112 · D2(38) 42/1/80 · D3(50) 43/1/80 · F#2(42) 44/1/112 · A2(45) 45/1/80 · D3(50) 46/1/80 · A2(45) 47/1/80
T4: A1(33) 48/1/112 · A1(33) 49/1/80 · A2(45) 50/1/80 · A1(33) 51/1/112 · A1(33) 52/1/80 · A2(45) 53/1/80 · A1(33) 54/1/112 · A1(33) 55/1/80 · A2(45) 56/1/80 · A1(33) 57/1/112 · A1(33) 58/1/80 · A2(45) 59/1/80 · C#2(37) 60/1/112 · E2(40) 61/1/80 · A2(45) 62/1/80 · Bb2(46) 63/1/80
```

**Spur SZ-27 Eiskristall-Arp FM**
```
Tempo 128 BPM · 4 Takte · B minor · Akkorde: Bm | G | D | A · Lage D4–B5 · 64 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: B4(71) 0/1/110 · D5(74) 1/1/80 · F#5(78) 2/1/92 · D5(74) 3/1/80 · B4(71) 4/1/110 · D5(74) 5/1/80 · F#5(78) 6/1/92 · B5(83) 7/1/80 · F#5(78) 8/1/110 · D5(74) 9/1/80 · B4(71) 10/1/92 · D5(74) 11/1/80 · F#5(78) 12/1/110 · D5(74) 13/1/80 · B4(71) 14/1/92 · F#4(66) 15/1/80
T2: G4(67) 16/1/110 · B4(71) 17/1/80 · D5(74) 18/1/92 · B4(71) 19/1/80 · G4(67) 20/1/110 · B4(71) 21/1/80 · D5(74) 22/1/92 · G5(79) 23/1/80 · D5(74) 24/1/110 · B4(71) 25/1/80 · G4(67) 26/1/92 · B4(71) 27/1/80 · D5(74) 28/1/110 · B4(71) 29/1/80 · G4(67) 30/1/92 · D4(62) 31/1/80
T3: F#4(66) 32/1/110 · A4(69) 33/1/80 · D5(74) 34/1/92 · A4(69) 35/1/80 · F#4(66) 36/1/110 · A4(69) 37/1/80 · D5(74) 38/1/92 · F#5(78) 39/1/80 · D5(74) 40/1/110 · A4(69) 41/1/80 · F#4(66) 42/1/92 · A4(69) 43/1/80 · D5(74) 44/1/110 · A4(69) 45/1/80 · F#4(66) 46/1/92 · A4(69) 47/1/80
T4: E4(64) 48/1/110 · A4(69) 49/1/80 · C#5(73) 50/1/92 · A4(69) 51/1/80 · E4(64) 52/1/110 · A4(69) 53/1/80 · C#5(73) 54/1/92 · E5(76) 55/1/80 · C#5(73) 56/1/110 · A4(69) 57/1/80 · E4(64) 58/1/92 · A4(69) 59/1/80 · C#5(73) 60/1/110 · E5(76) 61/1/80 · A5(81) 62/1/92 · F#5(78) 63/1/80
```

**Spur SZ-28 Kaltraum-Kit (Drums)**
```
Tempo 128 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x.x.
CLAP  | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x...
SNARE | ................ | ................ | ...............x | ............xxxx
HH ZU | x.x.x.x.x.x.x.x. | xxx.xxx.xxx.xxx. | x.x.x.x.x.x.x.x. | xxx.xxx.xxx.....
HH OF | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x.....
```

**Warum rechtlich unbedenklich:** i–VI–III–VII ist Allerwelt; 3er-Akzente über 16teln und Up-Down-Arps sind Genre-Technik; keine Melodie.
**Karten:** SZ-25 „Kühle Breitwand-Fläche, die über 4 Takte atmet – erinnert an schwedischen Electro (Stil Covenant).“ · SZ-26 „Rollender 16tel-Bass mit 3er-Akzenten.“ · SZ-27 „Kristallenes FM-Arpeggio.“ · SZ-28 „Clap-Kit mit Offbeat-Open-Hat.“

---

### 4.9 VNV Nation (`vnv-nation`) – Futurepop

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Ronan Harris (Gesang, Synths), Mark Jackson (Drums); Bandname „Victory Not Vengeance“ | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/VNV_Nation |
| Begriff „Futurepop“ geht auf Ronan Harris und Stephan Groth (Apoptygma Berzerk) zurück | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Futurepop |
| Futurepop klingt nach Trance-Supersaws (JP-8000) | UNBELEGT für VNV (eK). Für das verwandte Aggrotech nennen Genre-Quellen „Supersaw (JP-8000)“: WAHRSCHEINLICH (R7-coldwave2) | https://www.masterclass.com/articles/aggrotech-music-guide |
| Geräte | UNBELEGT ⚑ | – |

**Klangbild (UNBELEGT, eK):** 130–140 BPM, Moll mit hymnischer Dur-Aufhellung (i–VI–III–VII), Supersaw-Leads, getaktete („gegatete“) Flächen, Offbeat-Bass im Trance-Stil, Clap auf 2/4, Breakdowns mit Fläche/Klavier, 8–16 Takte Snare-Build-up.

#### SZ-29 „Leuchtfeuer-Lead“ – Lead · VA (Variante Werks-Sound „Supersaw-Hymne“)
- **Rezept:** `o1w 0, o1uni 7, uniDet .45, uniMix .8, uniWidth 1, o2w 0, o2oct 1, o2uni 5, o2lvl .45, ftype 1, cutoff 4800, res .12, drive .2, kt .3, fenv .15, fA .005, fD .5, fS .6, aA .01, aD .6, aS .9, aR .5, ampVel .3, poly 6, analog .2` (Pegel wie Werks-Sound ≈ `level .19`) · fx `{rev .45, dly .25}` · bus `{echo:{mode 'pp', divL '1/8.', fb .3}, hall:{decay 3.5}}`
- **Lage / Rolle:** F♯4–A5. Lead/Hook. Grenze **tief E4**.

#### SZ-30 „Taktgitter-Fläche“ ⧉ – Fläche · VA (mit Clip)
- **Rezept:** `o1w 0, o1uni 5, uniDet .3, o2w 1, o2pw .4, o2lvl .5, ftype 0, cutoff 2600, res .15, kt .3, fenv .1, aA .003, aD .1, aS 1, aR .06, poly 8, spread .6` · fx `{chorus:{mode:'II', mix .5}, rev .35, dly .2}` · bus `{echo:{divL '1/8.', fb .25}}`
- **Gitter als Clip ⧉:** Das Gate steckt in den Noten (Muster `xx.xx.xxx.xx.xx.`, Länge 0,75/16). So sind auch unregelmäßige Muster möglich, und es klingt auch auf dem nativen Ersatzweg gleich (§2.3). **Alternative ohne Clip** (nur gleichmäßiges Gitter): `l1shape 3, l1sync .25, l1retrig 1` + `M('lfo1','amp',1)` und `level` halbieren (Gate 0/×2).
- **Lage / Rolle:** E3–D4. Fläche (rhythmisch).

#### SZ-31 „Gegenschlag-Bass“ – Bass · VA
- **Rezept:** `o1w 0, o2w 0, o2fine 7, o2lvl .6, subLvl .3, ftype 0, cutoff 520, res .2, drive .2, kt .4, fenv .25, fD .12, fS .1, aA .001, aD .2, aS .6, aR .05, mode 1, poly 1, reset 1` · fx `{pump .4, pumpRel '1/4'}`
- **Kennzeichen:** nur auf den Achtel-Offbeats (Kick hat die Viertel).
- **Lage / Rolle:** A1–A2. Grenze **hoch C3**.

#### SZ-32 „Hymnen-Kit“ – Drums (Basis „909“)
- KICK `frq 50, pAmt 30, pDec .05, tHld .03, tDec .4, cLvl .55, cTyp 3, drv .4` · CLAP `sRoom .45` · HH OF `mDec .18` · SNARE (Build-up) `tDec .08, nDec .1, dyn .85`

**Hörprobe „Leuchtfeuer“** – 136 BPM, fis-Moll, `F♯m | D | A | E`. Wendung Takt 4: Gitter wird zu durchgehenden 16teln, Bass endet auf G♯, Snare-Wirbel, Lead fällt auf B4.

**Spur SZ-29 Leuchtfeuer-Lead**
```
Tempo 136 BPM · 4 Takte · F# minor · Akkorde: F#m | D | A | E · Lage F#4–A5 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C#5(73) 0/6/106 · B4(71) 6/2/90 · A4(69) 8/4/96 · F#4(66) 12/4/92
T2: A4(69) 16/4/96 · B4(71) 20/2/92 · C#5(73) 22/2/96 · D5(74) 24/8/106
T3: E5(76) 32/6/108 · C#5(73) 38/2/92 · E5(76) 40/4/100 · A5(81) 44/4/114
T4: Ab5(80) 48/6/110 · F#5(78) 54/2/96 · E5(76) 56/4/100 · B4(71) 60/4/92
```

**Spur SZ-30 Taktgitter-Fläche ⧉**
```
Tempo 136 BPM · 4 Takte · F# minor · Akkorde: F#m | D | A | E · Lage E3–D4 · 141 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F#3(54) 0/0.75/94 · A3(57) 0/0.75/94 · C#4(61) 0/0.75/94 · F#3(54) 1/0.75/80 · A3(57) 1/0.75/80 · C#4(61) 1/0.75/80 · F#3(54) 3/0.75/80 · A3(57) 3/0.75/80 · C#4(61) 3/0.75/80 · F#3(54) 4/0.75/94 · A3(57) 4/0.75/94 · C#4(61) 4/0.75/94 · F#3(54) 6/0.75/80 · A3(57) 6/0.75/80 · C#4(61) 6/0.75/80 · F#3(54) 7/0.75/80 · A3(57) 7/0.75/80 · C#4(61) 7/0.75/80 · F#3(54) 8/0.75/94 · A3(57) 8/0.75/94 · C#4(61) 8/0.75/94 · F#3(54) 10/0.75/80 · A3(57) 10/0.75/80 · C#4(61) 10/0.75/80 · F#3(54) 11/0.75/80 · A3(57) 11/0.75/80 · C#4(61) 11/0.75/80 · F#3(54) 13/0.75/80 · A3(57) 13/0.75/80 · C#4(61) 13/0.75/80 · F#3(54) 14/0.75/80 · A3(57) 14/0.75/80 · C#4(61) 14/0.75/80
T2: F#3(54) 16/0.75/94 · A3(57) 16/0.75/94 · D4(62) 16/0.75/94 · F#3(54) 17/0.75/80 · A3(57) 17/0.75/80 · D4(62) 17/0.75/80 · F#3(54) 19/0.75/80 · A3(57) 19/0.75/80 · D4(62) 19/0.75/80 · F#3(54) 20/0.75/94 · A3(57) 20/0.75/94 · D4(62) 20/0.75/94 · F#3(54) 22/0.75/80 · A3(57) 22/0.75/80 · D4(62) 22/0.75/80 · F#3(54) 23/0.75/80 · A3(57) 23/0.75/80 · D4(62) 23/0.75/80 · F#3(54) 24/0.75/94 · A3(57) 24/0.75/94 · D4(62) 24/0.75/94 · F#3(54) 26/0.75/80 · A3(57) 26/0.75/80 · D4(62) 26/0.75/80 · F#3(54) 27/0.75/80 · A3(57) 27/0.75/80 · D4(62) 27/0.75/80 · F#3(54) 29/0.75/80 · A3(57) 29/0.75/80 · D4(62) 29/0.75/80 · F#3(54) 30/0.75/80 · A3(57) 30/0.75/80 · D4(62) 30/0.75/80
T3: E3(52) 32/0.75/94 · A3(57) 32/0.75/94 · C#4(61) 32/0.75/94 · E3(52) 33/0.75/80 · A3(57) 33/0.75/80 · C#4(61) 33/0.75/80 · E3(52) 35/0.75/80 · A3(57) 35/0.75/80 · C#4(61) 35/0.75/80 · E3(52) 36/0.75/94 · A3(57) 36/0.75/94 · C#4(61) 36/0.75/94 · E3(52) 38/0.75/80 · A3(57) 38/0.75/80 · C#4(61) 38/0.75/80 · E3(52) 39/0.75/80 · A3(57) 39/0.75/80 · C#4(61) 39/0.75/80 · E3(52) 40/0.75/94 · A3(57) 40/0.75/94 · C#4(61) 40/0.75/94 · E3(52) 42/0.75/80 · A3(57) 42/0.75/80 · C#4(61) 42/0.75/80 · E3(52) 43/0.75/80 · A3(57) 43/0.75/80 · C#4(61) 43/0.75/80 · E3(52) 45/0.75/80 · A3(57) 45/0.75/80 · C#4(61) 45/0.75/80 · E3(52) 47/0.75/80 · A3(57) 47/0.75/80 · C#4(61) 47/0.75/80
T4: E3(52) 48/0.75/98 · Ab3(56) 48/0.75/98 · B3(59) 48/0.75/98 · E3(52) 49/0.75/84 · Ab3(56) 49/0.75/84 · B3(59) 49/0.75/84 · E3(52) 51/0.75/84 · Ab3(56) 51/0.75/84 · B3(59) 51/0.75/84 · E3(52) 52/0.75/98 · Ab3(56) 52/0.75/98 · B3(59) 52/0.75/98 · E3(52) 54/0.75/84 · Ab3(56) 54/0.75/84 · B3(59) 54/0.75/84 · E3(52) 55/0.75/84 · Ab3(56) 55/0.75/84 · B3(59) 55/0.75/84 · E3(52) 56/0.75/98 · Ab3(56) 56/0.75/98 · B3(59) 56/0.75/98 · E3(52) 57/0.75/84 · Ab3(56) 57/0.75/84 · B3(59) 57/0.75/84 · E3(52) 58/0.75/84 · Ab3(56) 58/0.75/84 · B3(59) 58/0.75/84 · E3(52) 59/0.75/84 · Ab3(56) 59/0.75/84 · B3(59) 59/0.75/84 · E3(52) 60/0.75/98 · Ab3(56) 60/0.75/98 · B3(59) 60/0.75/98 · E3(52) 61/0.75/84 · Ab3(56) 61/0.75/84 · B3(59) 61/0.75/84 · E3(52) 62/0.75/84 · Ab3(56) 62/0.75/84 · B3(59) 62/0.75/84 · E3(52) 63/0.75/84 · Ab3(56) 63/0.75/84 · B3(59) 63/0.75/84
```

**Spur SZ-31 Gegenschlag-Bass**
```
Tempo 136 BPM · 4 Takte · F# minor · Akkorde: F#m | D | A | E · Lage A1–Ab2 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: F#2(42) 2/2/104 · F#2(42) 6/2/100 · F#2(42) 10/2/104 · C#2(37) 14/2/96
T2: D2(38) 18/2/104 · D2(38) 22/2/100 · D2(38) 26/2/104 · A1(33) 30/2/96
T3: A1(33) 34/2/104 · A1(33) 38/2/100 · A1(33) 42/2/104 · E2(40) 46/2/96
T4: E2(40) 50/2/104 · E2(40) 54/2/100 · E2(40) 58/2/108 · Ab2(44) 62/2/110
```

**Spur SZ-32 Hymnen-Kit (Drums)**
```
Tempo 136 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x..x | x...x...x...x...
CLAP  | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH OF | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x...x. | ..x...x.........
HH ZU | .x.x.x.x.x.x.x.x | xx.xxx.xxx.xxx.x | .x.x.x.x.x.x.x.x | xx.xxx.x........
SNARE | ................ | ................ | ................ | ........xxxxxxxx
```

**Warum rechtlich unbedenklich:** i–VI–III–VII ist Allerwelt; Trance-Gate und Offbeat-Bass sind Genre-Techniken seit den 90ern; Lead-Melodie neu (Terz-Quint-Bewegung).
**Karten:** SZ-29 „Breiter Supersaw-Hymnen-Lead – erinnert an Futurepop (Stil VNV Nation).“ · SZ-30 „Getaktete Fläche (Trance-Gate) als fertiger Clip.“ · SZ-31 „Offbeat-Bass.“ · SZ-32 „Four-on-the-Floor mit großem Clap und Build-up-Wirbel.“

---

### 4.10 Mesh (`mesh`) – Melancholischer Synthpop/Synthrock

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Bristol (UK), Anfang der 90er; Mark Hockings, Richard Silverthorn | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Mesh_(band) |
| Geräte | UNBELEGT ⚑ | – |

**Klangbild (UNBELEGT, eK):** 105–125 BPM, Moll, melancholische Pluck-Arpeggios mit Echo, breite Streicher im Refrain, Achtelbass, gelegentlich Gitarren; Strophe sparsam, Refrain breit.

#### SZ-33 „Regenstadt-Pluck“ – Pluck · VA
- **Rezept:** `o1w 0, o2w 1, o2pw .3, o2fine 6, o2lvl .5, ftype 0, cutoff 700, res .25, kt .6, fenv .4, fA .001, fD .2, fS .05, aA .001, aD .45, aS 0, aR .3, poly 6, analog .15, spread .4` · fx `{chorus:{mode:'I', mix .5}, dly .35, rev .3}` · bus `{echo:{mode 'pp', divL '1/8.', fb .35}}`
- **Lage / Rolle:** F4–G5. Pluck/Arp.

#### SZ-34 „Schulterbass“ – Bass · VA
- **Rezept:** `o1w 0, o2w 1, o2pw .5, o2oct -1, o2lvl .5, ftype 0, cutoff 500, res .2, drive .25, kt .4, fenv .25, fD .18, fS .25, aA .001, aD .3, aS .7, aR .06, mode 1, poly 1, reset 1` · fx `{pump .3, pumpRel '1/8'}`
- **Lage / Rolle:** E♭1–B♭2, am besten G1–G2.

#### SZ-35 „Breitwand-Streicher“ – Fläche · VA
- **Rezept:** `o1w 0, o1uni 5, uniDet .25, uniWidth 1, o2w 0, o2oct 1, o2lvl .25, ftype 0, cutoff 2400, res .1, fA .6, fD 1, fS .8, aA .5, aD 1, aS .9, aR 1.8, poly 6, analog .25, spread .7` · fx `{chorus:{mode:'ENS', mix .6}, rev .5}`
- **Lage / Rolle:** F3–F5. Fläche.

**Hörprobe „Regenstadt“** – 112 BPM, g-Moll, `Gm | E♭ | B♭ | F`. Wendung Takt 4: E♭ im Pluck (F7-Farbe), Bass endet auf F♯ (Leitton).

**Spur SZ-33 Regenstadt-Pluck**
```
Tempo 112 BPM · 4 Takte · G minor · Akkorde: Gm | Eb | Bb | F · Lage F4–G5 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G4(67) 0/2/104 · Bb4(70) 2/2/86 · D5(74) 4/2/104 · Bb4(70) 6/2/86 · G4(67) 8/2/104 · Bb4(70) 10/2/86 · F5(77) 12/2/104 · D5(74) 14/2/86
T2: G4(67) 16/2/104 · Bb4(70) 18/2/86 · Eb5(75) 20/2/104 · Bb4(70) 22/2/86 · G4(67) 24/2/104 · Bb4(70) 26/2/86 · G5(79) 28/2/104 · Eb5(75) 30/2/86
T3: F4(65) 32/2/104 · Bb4(70) 34/2/86 · D5(74) 36/2/104 · Bb4(70) 38/2/86 · F4(65) 40/2/104 · Bb4(70) 42/2/86 · F5(77) 44/2/104 · D5(74) 46/2/86
T4: F4(65) 48/2/104 · A4(69) 50/2/86 · C5(72) 52/2/104 · A4(69) 54/2/86 · F4(65) 56/2/104 · A4(69) 58/2/86 · C5(72) 60/2/104 · Eb5(75) 62/2/86
```

**Spur SZ-34 Schulterbass**
```
Tempo 112 BPM · 4 Takte · G minor · Akkorde: Gm | Eb | Bb | F · Lage Eb1–Bb2 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G1(31) 0/1.8/104 · G2(43) 2/1.8/86 · G1(31) 4/1.8/104 · G2(43) 6/1.8/86 · G1(31) 8/1.8/104 · G2(43) 10/1.8/86 · F2(41) 12/1.8/104 · D2(38) 14/1.8/86
T2: Eb1(27) 16/1.8/104 · Eb2(39) 18/1.8/86 · Eb1(27) 20/1.8/104 · Eb2(39) 22/1.8/86 · Eb1(27) 24/1.8/104 · Eb2(39) 26/1.8/86 · Bb1(34) 28/1.8/104 · G1(31) 30/1.8/86
T3: Bb1(34) 32/1.8/104 · Bb2(46) 34/1.8/86 · Bb1(34) 36/1.8/104 · Bb2(46) 38/1.8/86 · Bb1(34) 40/1.8/104 · Bb2(46) 42/1.8/86 · F2(41) 44/1.8/104 · D2(38) 46/1.8/86
T4: F1(29) 48/1.8/104 · F2(41) 50/1.8/86 · F1(29) 52/1.8/104 · F2(41) 54/1.8/86 · A1(33) 56/1.8/104 · C2(36) 58/1.8/86 · Eb2(39) 60/1.8/104 · F#2(42) 62/1.8/86
```

**Spur SZ-35 Breitwand-Streicher**
```
Tempo 112 BPM · 4 Takte · G minor · Akkorde: Gm | Eb | Bb | F · Lage F3–Eb4 · 15 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: G3(55) 0/16/74 · Bb3(58) 0/16/74 · D4(62) 0/16/74
T2: G3(55) 16/16/74 · Bb3(58) 16/16/74 · Eb4(63) 16/16/74
T3: F3(53) 32/16/74 · Bb3(58) 32/16/74 · D4(62) 32/16/74
T4: F3(53) 48/12/78 · A3(57) 48/12/78 · C4(60) 48/12/78 · F3(53) 60/4/84 · A3(57) 60/4/84 · Eb4(63) 60/4/84
```

**Warum rechtlich unbedenklich:** i–VI–III–VII ist Allerwelt; Akkordzerlegung in Achteln mit punktiertem Echo ist Technik; keine Melodie.
**Karten:** SZ-33 „Melancholischer Pluck mit punktiertem Echo – erinnert an britischen Synthpop der 2000er (Stil Mesh).“ · SZ-34 „Pumpender Achtel-Oktavbass.“ · SZ-35 „Breite Refrain-Streicher.“

---

### 4.11 De/Vision (`de-vision`) – Verweis

Vollständig in `r7/vorbild-coldwave2.md` §3.2: Belege (BELEGT/WAHRSCHEINLICH aus Suchauszügen), C2-05 „Hymnen-Lead“, C2-06 „Oktav-Pumpbass“, C2-07 „Glas-Arpeggio FM“, C2-08 „Clubhallen-Kit“, Hörbeispiel „Leuchtturm“ (124 BPM, `F | G | Em | Am | F | G | C | E`). **Geräte UNBELEGT.** Keine Doppelung hier. Für die Demo-Blaupause G7 (§5) werden diese Sounds mitbenutzt.

---

### 4.12 Camouflage (`camouflage`) – Deutscher Synthpop der späten 80er

**Belege**

| Aussage | Status | Quelle |
|---|---|---|
| Bietigheim-Bissingen; Marcus Meyn, Heiko Maile, Oliver Kreyssig; „The Great Commandment“ (1987/88) als Durchbruch, auch in den USA | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Camouflage_(band) |
| Geräte | UNBELEGT ⚑ | – |

**Klangbild (UNBELEGT, eK):** 110–125 BPM, Moll, Sampler-Stabs und -Chöre der späten 80er, synkopierte FM-Bässe, Snare mit großem (Gated-)Hall, Tom-Fills, Rhythmus 3+3+2.

#### SZ-36 „Achtundachtzig-Stab“ – Akkord/Stab · VA
- **Vorbild (ⓘ):** Sampler-Stabs der späten 80er (Stil, eK). Ein echter Sampler-Charakter (Körnung) fehlt der App bis Stufe D (R8 §0 Punkt 4).
- **Rezept:** `o1w 0, o1uni 3, uniDet .3, o2w 0, o2oct 1, o2lvl .5, o3w 1, o3oct -1, o3lvl .4, noise .15, ftype 0, cutoff 2200, res .1, drive .2, kt .4, fenv .3, fA .001, fD .15, fS .2, aA .001, aD .3, aS .15, aR .2, ampVel .5, poly 6, spread .6` · fx `{rev .35, dly .1}` · bus `{hall:{decay 2}}`
- **Lage / Rolle:** B3–A4 (Dreiklänge). Akkord/Stab.

#### SZ-37 „Holzbass FM“ – Bass · FM6
- **Rezept (Alg. 5, zwei Paare):** `alg 5, fb 0, trans 0`
  - OP1 `coarse 1, ol 99, r [99,50,35,70], l [99,80,0,0]` · OP2 `coarse 1, ol 82, r [99,75,40,70], l [99,40,0,0], vs 5` (Biss nur im Anschlag)
  - OP3 `coarse 1, det -3, ol 85, r [99,50,35,70], l [99,80,0,0]` · OP4 `coarse 3, ol 60, r [99,85,50,70], l [99,20,0,0], vs 6`
  - OP5/OP6 `ol 0`
  - common `{gain -12, mode 1, poly 1}`
- **Warum:** Träger auf ×1 (nicht ×0,5 + Transponieren, das wäre die 16-Hz-Falle aus R6 §0). Der Modulator fällt schnell, der Träger klingt weiter – genau das Verhalten, das Xander in Runde 9 vermisst; nach dem FM-Hüllkurven-Fix prüfen (`r8/fm-diagnose.md`).
- **Lage / Rolle:** A1–E3. Bass, synkopiert.

#### SZ-38 „Hallkammer-Kit“ – Drums (Basis Werks-Kit „Gated 84“)
- SNARE `sGate .6, sRoom .1, nLvl 1, nTyp 'bandpass', nFrq 3000, nDec .2` · KICK `frq 54, pAmt 18, tDec .3, drv .2` · TOM T/M/H `sGate .4, pAmt 9` · HH ZU `mDec .035`
- **Hinweis:** „Gated Reverb“ als 80er-Merkmal ist allgemein (eK); bei Camouflage UNBELEGT.

**Hörprobe „Schlussakkord“** – 116 BPM, cis-Moll, `C♯m | A | E | B`. Wendung Takt 4: Stabs werden zu 16teln, Bass läuft D♯–F♯–A–B, Tom-Fill.

**Spur SZ-36 Achtundachtzig-Stab**
```
Tempo 116 BPM · 4 Takte · C# minor · Akkorde: C#m | A | E | B · Lage B3–A4 · 60 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C#4(61) 0/2/104 · E4(64) 0/2/104 · Ab4(68) 0/2/104 · C#4(61) 3/2/92 · E4(64) 3/2/92 · Ab4(68) 3/2/92 · C#4(61) 6/2/98 · E4(64) 6/2/98 · Ab4(68) 6/2/98 · C#4(61) 10/2/96 · E4(64) 10/2/96 · Ab4(68) 10/2/96
T2: C#4(61) 16/2/104 · E4(64) 16/2/104 · A4(69) 16/2/104 · C#4(61) 19/2/92 · E4(64) 19/2/92 · A4(69) 19/2/92 · C#4(61) 22/2/98 · E4(64) 22/2/98 · A4(69) 22/2/98 · C#4(61) 26/2/96 · E4(64) 26/2/96 · A4(69) 26/2/96 · C#4(61) 30/2/90 · E4(64) 30/2/90 · A4(69) 30/2/90
T3: B3(59) 32/2/104 · E4(64) 32/2/104 · Ab4(68) 32/2/104 · B3(59) 35/2/92 · E4(64) 35/2/92 · Ab4(68) 35/2/92 · B3(59) 38/2/98 · E4(64) 38/2/98 · Ab4(68) 38/2/98 · B3(59) 42/2/96 · E4(64) 42/2/96 · Ab4(68) 42/2/96
T4: B3(59) 48/2/104 · Eb4(63) 48/2/104 · F#4(66) 48/2/104 · B3(59) 51/2/92 · Eb4(63) 51/2/92 · F#4(66) 51/2/92 · B3(59) 54/2/98 · Eb4(63) 54/2/98 · F#4(66) 54/2/98 · B3(59) 56/1/90 · Eb4(63) 56/1/90 · F#4(66) 56/1/90 · B3(59) 58/1/96 · Eb4(63) 58/1/96 · F#4(66) 58/1/96 · B3(59) 60/1/104 · Eb4(63) 60/1/104 · F#4(66) 60/1/104 · B3(59) 62/1/112 · Eb4(63) 62/1/112 · F#4(66) 62/1/112
```

**Spur SZ-37 Holzbass FM**
```
Tempo 116 BPM · 4 Takte · C# minor · Akkorde: C#m | A | E | B · Lage A1–E3 · 32 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: C#2(37) 0/2/110 · C#2(37) 3/1/88 · C#3(49) 4/2/100 · C#2(37) 6/2/92 · B1(35) 8/2/100 · C#2(37) 11/1/88 · E2(40) 12/2/98 · Ab2(44) 14/2/94
T2: A1(33) 16/2/110 · A1(33) 19/1/88 · A2(45) 20/2/100 · A1(33) 22/2/92 · E2(40) 24/2/100 · A1(33) 27/1/88 · C#2(37) 28/2/98 · E2(40) 30/2/94
T3: E2(40) 32/2/110 · E2(40) 35/1/88 · E3(52) 36/2/100 · E2(40) 38/2/92 · B1(35) 40/2/100 · E2(40) 43/1/88 · Ab2(44) 44/2/98 · B2(47) 46/2/94
T4: B1(35) 48/2/110 · B1(35) 51/1/88 · B2(47) 52/2/100 · B1(35) 54/2/92 · Eb2(39) 56/2/100 · F#2(42) 58/2/100 · A2(45) 60/2/104 · B2(47) 62/2/108
```

**Spur SZ-38 Hallkammer-Kit (Drums)**
```
Tempo 116 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x.....x...x..... | x.....x...x..... | x.....x...x...x. | x.....x...x.....
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x...........
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.xx | x.x.x.x.x.xxx.x. | x.x.x.x.........
TOM H | ................ | ................ | ................ | ........x.x.....
TOM M | ................ | ................ | ................ | ............x...
TOM T | ................ | ................ | ................ | ..............x.
```

**Warum rechtlich unbedenklich:** i–VI–III–VII ist Allerwelt; 3+3+2 ist ein Grundrhythmus; Stabs spielen nur Akkorde.
**Karten:** SZ-36 „Heller Stab im 3+3+2 – erinnert an deutschen Synthpop der späten 80er (Stil Camouflage).“ · SZ-37 „Holziger FM-Bass mit Biss im Anschlag.“ · SZ-38 „Gated-Snare mit Tom-Fill.“

---

### 4.13 Joy Division (`joy-division`, nur Kandidat)

**Belege:** keine in dieser Runde.

| Aussage | Status | Quelle |
|---|---|---|
| Bernard Sumner baute einen Synthesizer-Bausatz (Powertran Transcendent 2000); ARP-Omni-Streicher auf „Closer“ | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Closer_(album) |
| Stephen Morris nutzte Synare-Elektro-Toms; Produzent Martin Hannett arbeitete mit Digital-Delay auf den Drums | UNBELEGT (eK) ⚑ | Prüf-URL: https://en.wikipedia.org/wiki/Martin_Hannett |

**Klangbild (UNBELEGT, eK):** 120–150 BPM, Moll, melodischer Bass im hohen Register (E-Bass – kann die App nicht als Instrument), trockene, präzise Drums mit elektronischem Fall-Tom, kalte Streicher-Synths.

#### SZ-39 „Fabrikhallen-Kit mit Fall-Tom“ – Drums (Basis „Rom Pop“)
- TOM H (Fall-Tom) `tLvl 1, wav 'sine', frq 330, pAmt 24, pDec .25, tDec .35, nLvl .4, nTyp 'bandpass', nFrq 3000, nDec .3, sRoom .3`
- KICK `frq 55, pAmt 10, tDec .25, drv .1` · SNARE `sRoom .15, sGate 0, nDec .15` · HH ZU `mDec .03`
- Spur-FX: `dly .2` (Delay auf dem Kit)

#### SZ-40 „Kammer-Streicher“ – Fläche · VA
- **Rezept:** `o1w 0, o2w 0, o2oct 1, o2fine 5, o2lvl .6, ftype 1, cutoff 3000, res 0, kt .3, fenv 0, aA .25, aD .5, aS 1, aR .8, poly 8, analog .25, spread .5` · fx `{chorus:{mode:'ENS', mix 1}, rev .35}`
- **Lage / Rolle:** C3–C5. Fläche.

**Hörprobe „Fabrikhalle“** – 126 BPM, e-Moll, `Em | Em(♭6) | D | C`.

**Spur SZ-40 Kammer-Streicher**
```
Tempo 126 BPM · 4 Takte · E minor · Akkorde: Em | Em(b6) | D | C · Lage C3–C4 · 16 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E3(52) 0/16/70 · G3(55) 0/16/70 · B3(59) 0/16/70
T2: E3(52) 16/16/70 · G3(55) 16/16/70 · C4(60) 16/16/70
T3: D3(50) 32/16/72 · F#3(54) 32/16/72 · A3(57) 32/16/72
T4: C3(48) 48/8/74 · E3(52) 48/8/74 · G3(55) 48/8/74 · C3(48) 56/8/78 · E3(52) 56/8/78 · G3(55) 56/8/78 · B3(59) 56/8/78
```

**Spur SZ-39 Fabrikhallen-Kit mit Fall-Tom (Drums)**
```
Tempo 126 BPM · 4 Takte · 16tel (x = Schlag, . = Pause)
KICK  | x.......x.x..... | x.......x.x..... | x.......x.x..... | x.......x.x...x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x...
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.....
TOM H | ......x.......x. | ......x...x...x. | ......x.....x.x. | ......x.....xxxx
```

**Karten:** SZ-39 „Trockenes Kit mit fallendem Elektro-Tom – erinnert an Post-Punk um 1979 (Stil).“ · SZ-40 „Kalte String-Synth-Fläche.“ (Joy Division im ⓘ nur, wenn Xander den Tag will.)

---

## 5. Demo-Song-Blaupausen (eine je Genre)

**Gemeinsames Format** (passt zur App: Spuren 0–3 Synth 1–4, 4 DRUMS, 5 MELODIE, 6–7 Synth 5–6; 8 Szenen; Teile über FANG; Spec v3 §14). Alle Tonfolgen sind eigene Muster aus §4; die Blaupause legt nur Tempo, Form, Spuren und Kennzeichen fest. Takte sind Richtwerte (UNBELEGT, Genre-Erfahrung).

### G1 Body-Pop/EBM („And-One-artig“, Xanders L3) – 126 BPM, d-Moll
| Szene | Teil | Takte | Spuren |
|---|---|---|---|
| S1 | Intro | 8 | Kick (nur Viertel) + SZ-01 mit `cutoff` 180 → 300 über 8 Takte (Mod-Rad oder Automation) |
| S2 | Strophe | 16 | SZ-01, SZ-03 voll, A.1 #8 Grauzone-Fläche leise, MELODIE = Sprechgesang (GESANG FOLGT) |
| S3 | Pre | 8 | Bass auf ♭2 (E♭) und ♭7, Stabs SZ-02 nur auf „4 und“ |
| S4 | Refrain | 16 | SZ-02 Offbeats dicht, SZ-04 Lead, Clap dazu |
| S5 | Marsch-Bridge | 8 | nur SZ-03-Snare (Wirbel) + Kick + Stabs auf den Vierteln |
| S6 | Breakdown | 8 | Bass gefiltert, Fläche, kein Clap |
| S7 | Refrain × 2 | 32 | wie S4 + SZ-24 Kaltlicht-Stakkato als Gegenstimme |
| S8 | Outro | 8 | Bass + Kick, Stabs ausdünnen |
**Kennzeichen:** 16tel-Bass ohne Pause, Offbeat-Stabs, Marsch-Wirbel vor dem letzten Refrain, deutscher Sprechgesang.

### G2 Chip-Synthpop („Welle:Erdball-artig“) – 118 BPM, a-Moll
| Szene | Teil | Takte | Spuren |
|---|---|---|---|
| S1 | Intro „Funk-Peilung“ | 4 | SZ-12 Beam-Schimmer (als Radio-Rauschen) + R6 N27 Datenstrom |
| S2 | Strophe | 16 | SZ-07, SZ-08, A.1 #26 Brotkasten-Lead als Gegenmelodie |
| S3 | Refrain | 16 | + SZ-05 Arp, SZ-06 Ringglocke als Hook |
| S4 | Zwischenspiel | 8 | A.1 #27 Triller + N27 Datenstrom, Drums nur Hats |
| S5–S6 | Strophe/Refrain 2 | 32 | wie S2/S3, Refrain + Oktave im Arp |
| S7 | Stopp | 1 | alle Spuren aus (Chip-Gag) |
| S8 | Schluss-Refrain | 16 | wie S3 |
**Kennzeichen:** alles trocken (Hall ≤ 0,1), 8tel-Beat, Arps statt Akkordflächen, Wellenwechsel-Drums, ab *(P1)* Bitcrusher auf dem Master-Bus 8 Bit.

### G3 Schwedischer Synthpop („Elegant-Machinery/S.P.O.C.K-artig“) – 122–128 BPM, e-Moll ↔ G-Dur
- Strophe 16 (SZ-11, SZ-09, Kit „Rom Pop“) · Pre 8 (SZ-13 Blubber-Sequenz kommt dazu) · Refrain 16 (SZ-10 Fernweh-Lead oder SZ-14 Kommunikator-Hook, Wechsel nach G-Dur) · Übergang mit SZ-12 · Bridge 8 (nur Fläche + Lead) · Refrain × 2.
- **Kennzeichen:** Strophe Moll, Refrain Dur-Parallele; Lead mit spätem Vibrato; Effekt-Übergänge.

### G4 Dark Electro („Project-Pitchfork-artig“) – 118 BPM, c-Moll
- Intro 16 (SZ-20 Chor + SZ-22 PERC) · Strophe 16 (SZ-19, SZ-22) · Refrain 16 (+ SZ-21 Splitter, Chor lauter) · Breakdown 8 (nur Chor + Glocke SZ-18) · Tom-Fill-Takt · Refrain × 2 · Outro mit Chor.
- **Kennzeichen:** Bass mit Lücken und ♭2, Halbton-Wendung B♭→H→C, Amboss-Perkussion, Hall 8 s auf dem Chor, raue Stimme (GESANG FOLGT).

### G5 Cinematic Darkwave („Kirlian-Camera-artig“) – 92 BPM, f-Moll
- Intro 16 (SZ-16 allein, dann SZ-15) · Strophe 16 (SZ-17 + leises Kit „Rom Pop“ mit Hall) · Refrain 16 (SZ-15 Chor-Gegenstimme, SZ-18 Glocke auf Takt 1 jeder Phrase) · Zwischenspiel 8 (R6 N18 Parma-Nebel) · Refrain · Outro 16 (Streicher ausklingen, Hall 7 s).
- **Kennzeichen:** harmonisch Moll (Dur-Dominante C), lange Attack-Zeiten, Sopran-Melodie (MELODIE-Spur hoch, C5–F5).

### G6 Futurepop („VNV-Nation/Covenant-artig“) – 136 BPM (VNV) bzw. 128 BPM (Covenant), fis-/h-Moll
| Teil | Takte | Spuren |
|---|---|---|
| Intro | 16 | SZ-25 oder SZ-30 allein, dann Kick |
| Strophe | 16 | SZ-31 bzw. SZ-26, SZ-32/SZ-28, Fläche leise |
| Pre | 8 | Snare-Achtel → 16tel (Build-up), Filter von SZ-30 auf |
| Refrain | 16 | SZ-29 Lead, SZ-30 Gitter, SZ-27 Arp |
| Breakdown | 16 | Fläche + Werks-Sound „DX-Tines E-Piano“ (Klavier-Rolle), kein Kick |
| Build-up | 8 | Snare-Wirbel SZ-32, Cutoff steigt |
| Refrain × 2 | 32 | voll |
**Kennzeichen:** i–VI–III–VII, Offbeat-Bass, Trance-Gate als Clip, 8–16-Takt-Build-up, hymnischer Lead eine Oktave über der Stimme.

### G7 Melancholischer Synthpop („Mesh/Camouflage/De/Vision-artig“) – 112–124 BPM, g-/cis-Moll
- Strophe 16 sparsam (SZ-34 oder SZ-37, SZ-33 Pluck, Kit SZ-38) · Refrain 16 breit (SZ-35 Streicher, SZ-36 Stabs oder C2-05 Hymnen-Lead) · Strophe 2 mit C2-07 Glas-Arp ab Takt 9 · Bridge 8 auf VI (E♭ bzw. A) · Refrain × 2 mit Halbschluss auf V vor dem letzten.
- **Kennzeichen:** Strophe leer, Refrain groß; Gated-Snare; Pluck mit punktiertem Echo.

### G8 Post-Punk (Kandidat Joy Division) – 126–140 BPM, e-Moll
- Intro 8 (SZ-39 Drums allein, Fall-Tom auf „2 und“) · Strophe 16 (+ MELODIE als hoher Bass-Ersatz: Werks-„Synthpop-Bass“ eine Oktave höher, Lage E3–E4) · Refrain 16 (+ SZ-40) · Outro.
- **Kennzeichen:** trocken, Delay auf dem Kit, Melodie im Bass-Register. **Grenze:** Eine E-Bass-Engine fehlt; nur Annäherung.

---

## 6. Korrekturen an früheren Recherchen

| Nr | Stelle | War | Richtig bzw. jetzt | Grund / Beleg |
|---|---|---|---|---|
| K-1 | `fragen-xander-7.md` (Diktat-Hinweis „And One Division“) | „And One + Joy Division? prüfen“ | **De/Vision** | Xander selbst, `fragen-xander-8.md` §V (intern) |
| K-2 | R6 §1, Spec A.1 #18/#19, R6 N24 | „Spock“ | Schreibweise **S.P.O.C.K**; Tag-ID `spock` kann bleiben, Anzeige ändern | R8 §1.9 (WAHRSCHEINLICH, Suchauszug) |
| K-3 | R6 §1 | Spock „nicht recherchiert (eK: schwedisch, Sci-Fi …, unsicher)“ | schwedisch, Sci-Fi-Bezug und „bubbling synthpop“ jetzt WAHRSCHEINLICH; Samples nicht nachbauen | R8 §1.9 |
| K-4 | R6 N24 „Warp-Signal“ (FM6) | „Algo 32: OP1 ×1, OP2 ×2,01 OL 70, OP3 fest 2 kHz“ | In Algorithmus 32 sind **alle 6 Operatoren Träger** (nur OP6 mit Rückkopplung). OP2 moduliert dort nichts, es ist ein zusätzlicher Teilton (Schwebung), **keine FM**. Wenn FM gemeint war: Alg. 5 (OP1←OP2) oder Alg. 1. | App-Tabelle `DX_ALGS[31] = '123456||66'`, V0a Z. 2557–2561 (intern; „verified against msfa“) |
| K-5 | `SYNQUENZER-vision.md` §3.1, R6 §1 | Elegant Machinery „schwedisches Trio seit 1989“, „Geräte unbelegt“ | seit **1988** (zuerst „Pole Position“); **Novation-Synths** in den 90ern und heute Arturia/Behringer/E-mu sind BELEGT (Band-Interview), nur die Modelle nicht | R8 §1.8 |
| K-6 | R6 N26, Spec A.1 #26 („Ringmod erst mit KF“) | Ringmod als allgemeine Osz.-1×Osz.-2-Funktion | Beim SID ersetzt die Ringmodulation nur die **Dreieck**-Welle einer Stimme (eK, ⚑). Für SID-Treue in VK: beide Oszillatoren **Dreieck** (so in SZ-06). | eK, Prüf-URL MOS 6581 |
| K-7 | R6 Quellenblock „Project Pitchfork und Virus/Franke“ | kann als Hinweis auf Virus bei Project Pitchfork gelesen werden | Der Beatportal-Artikel betrifft nur Wolfram Franke/Access Virus. **Kein** Beleg für einen Virus bei Project Pitchfork. | R6 §1 + §3 (Zeile Access Virus) |
| K-8 | Spec A.1 #28 „Brotkasten-Arp ⧉ … 1/32“ | 1/32 als „C64-Arp“ | 1/32 bei 118–130 BPM = 16–17 Hz, echte C64-Arps laufen mit der Bildrate (50 Hz PAL, eK ⚑). Klingt als Triller, nicht als Akkord-Flirren. Besser 1/64 (256-Noten-Grenze beachten) oder schneller Arp aus R8 Stufe B. | eK + Rechnung |
| K-9 | `SYNQUENZER-vision.md` §3.1 | „Covenant – nicht recherchiert“ | weiterhin **kein** Gerätebeleg; einziger Szene-Bezug: Simonsson produzierte Elegant Machinery 1998 (WAHRSCHEINLICH) | R8 §1.8 |
| K-10 | R6 §1 Kirlian Camera | „1979 … als ‚Suicide Commando‘“ | bleibt WAHRSCHEINLICH (eine Quelle); im ⓘ **nicht** verwenden, Verwechslung mit der belgischen Band Suicide Commando naheliegend | Vorsicht, eK |
| K-11 | R6 Tabelle B, N21 | „Scan in 6 s“ | 4 s (`scanTime` ≤ 4) – war schon in R6 korrigiert, in SZ-20 übernommen | V0a Z. 5083–5086 (`normWt`) |
| K-12 | `r7/vorbild-helden.md` K3 (Nebenbefund, nicht R6/vision) | „`M('lfo1','cutoff', .025)` … ≈ ±0,6 HT (0,025 · 24)“ | Cutoff-Route 1,0 = **120 HT** → 0,025 = **±3 HT**. Für ±0,6 HT wäre `.005` richtig. | V0a Z. 5634 + `routeGain` Z. 8733 (intern) |
| K-13 | `r7/vorbild-helden.md` §2 (Nebenbefund) | `aud`-Anschlag als 1–127 | App-Noten haben `v` 0,01–1 (V0a Z. 8312). `aud.notes` sollte v/127 tragen (so in `vorbild-szene-aud.json`; coldwave2 §2 sagt es schon richtig). Spec §12.8 sollte die Skala nennen. | intern |

**Geprüft und richtig** (keine Korrektur): Spec A.1 #27 Brotkasten-Triller (Osz. +6 HT und LFO ±6 HT ergeben Grundton/Oktave), A.1 #30 Kick 200 → 50 Hz (= 24 HT), R6 Second-Decay-Fakten (Status bleibt WAHRSCHEINLICH), Vision „SID … 12-dB-Multimode“ (eK, stimmt mit meinem Wissen überein).

---

## 7. Lage-Übersicht (Rohstoff für Wunsch T „Lage-Grenzen“)

| Sound | Rolle | Lage (MIDI) | Grenze |
|---|---|---|---|
| SZ-01 Körperbass | Bass | A1–D3 (33–50) | hoch E3 |
| SZ-07 PWM-Brotbass | Bass | F1–C3 (29–48) | hoch D3 |
| SZ-11 Stab-Achtelbass | Bass | G1–E3 (31–52) | hoch E3 |
| SZ-17 Kaltpuls-Bass | Bass | F1–C3 (29–48) | hoch D3 |
| SZ-19 Grollbass | Bass | A♭1–C3 (32–48) | hoch D3 |
| SZ-23 Kellerpuls-Bass | Bass | E1–A2 (28–45) | hoch C3 |
| SZ-26 Schaltwerk-Bass | Bass | G1–D3 (31–50) | hoch E3 |
| SZ-31 Gegenschlag-Bass | Bass | A1–A2 (33–45) | hoch C3 |
| SZ-34 Schulterbass | Bass | E♭1–B♭2 (27–46) | hoch C3 |
| SZ-37 Holzbass FM | Bass | A1–E3 (33–52) | hoch E3 |
| SZ-05 Rasterzeilen-Arp | Sequenz | F4–G5 (65–79) | tief C4 |
| SZ-13 Blubber-Sequenz | Sequenz | C3–A4 (48–69) | hoch C5 |
| SZ-21 Splitter-Sequenz FM | Sequenz | C5–D6 (72–86) | tief A4 |
| SZ-24 Kaltlicht-Stakkato | Sequenz | C4–D5 (60–74) | tief A3 |
| SZ-27 Eiskristall-Arp FM | Sequenz | D4–B5 (62–83) | tief C4 |
| SZ-33 Regenstadt-Pluck | Pluck | F4–G5 (65–79) | tief C4 |
| SZ-04 Spiegelglas-Lead FM | Lead | D4–C5 (62–72), gut bis D5 | tief C4 |
| SZ-06 Ringglocke | Lead | A4–G5 (69–79) | tief F4 |
| SZ-10 Fernweh-Lead | Lead | E4–A5 (64–81) | tief D4 |
| SZ-14 Kommunikator-Hook FM | Lead | G4–A5 (67–81) | tief E4 |
| SZ-29 Leuchtfeuer-Lead | Lead | F♯4–A5 (66–81) | tief E4 |
| SZ-02 / SZ-36 Stabs | Akkord | C4–C5 / B3–A4 | Akkordlage ±1 Okt |
| SZ-09, SZ-16, SZ-25, SZ-30, SZ-35, SZ-40 | Fläche | C3–E5 | frei, Voicing nah halten |
| SZ-15, SZ-20 | Chor | G3–F5 | frei |
| SZ-18 Turmglocke FM | Glocke | C5–C6 | tief A4 |
| SZ-12 Beam-Schimmer | Effekt | G4–D5 | Transposition aus |
| Kits SZ-03/08/22/28/32/38/39 | Drums | – | Transposition aus |

---

## 8. Einbau-Hinweise (Vorschläge für Spec/Builder, nicht entschieden)

1. **Paket V10d** (Nachtrag A.12) um die SZ-Sounds ergänzen; Tags wie §3. ⓘ-Texte nur mit Belegen ≥ WAHRSCHEINLICH; UNBELEGTE Gerätenamen nie.
2. **Abhängigkeiten:** SZ-06 `ring`, SZ-19 `sat`, SZ-23 `walk` brauchen VK (Nachtrag A.10); bis dahin die genannten Fallbacks. SZ-04/14/18/21/27/37 erst nach dem FM-Hüllkurven-Fix abhören (Runde 9).
3. **Clips ⧉:** SZ-05 und SZ-30 bringen Clips mit (Spec §12.8 `clip`).
4. **Spec §12.8:** Anschlag-Skala in `aud.notes` festschreiben (v 0–1, K-13). `len ≤ 4` reicht für alle SZ-Hörproben.
5. **Kleiner Engine-Befund (optional):** Der native Ersatzweg (ohne Worklet) begrenzt LFO→Lautstärke auf −6 dB, das Worklet nicht (§2.3). Gleich machen oder im ⓘ erwähnen; betrifft Gate- und Tremolo-Sounds (SZ-12, SZ-30-Alternative).
6. **Pegel:** alle `level`/`gain` mit `calibrate.mjs` auf die Kategorie-Phrase ziehen; die Werte hier sind geschätzt.

## 9. Offene Punkte (⚑ = Nachrecherche mit frischem Suchbudget)

**An Xander (kurz):**
1. Joy Division als Vorbild-Tag – ja oder nein? (De/Vision ist klar.)
2. And One: Welche 1–2 Titel sind dir am wichtigsten – eher „Military Fashion Show“ (Marsch, Body-Pop) oder „Deutschmaschine/Krieger“ (hart, deutsch)? Das bestimmt, ob SZ-03 oder SZ-19-artige Härte Vorrang hat.
3. Covenant: Was meintest du mit „keit … Polylog“? (seit Runde 2 offen)
4. „Second TK“ = Second Decay – stimmt das?

**Nachrecherche ⚑ (ca. 25–30 Suchen):**
- And One: Album/Jahr der 5 Titel, Tempo; Studio-Interviews (Orkus, Sonic Seducer, Keyboards) zu Geräten.
- SID: 3 Stimmen, Wellen, Ringmod nur Dreieck, Filter 12 dB – eine Primärquelle (Datenblatt/C64-Wiki).
- Welle:Erdball: Studio außer C64 (Interviews, Sceneworld-Podcast-Inhalt).
- Covenant, VNV Nation, Mesh, Camouflage: Gründungsdaten, Besetzung, **Geräte** (Equipboard nur als schwache Quelle, Interviews mit Ronan Harris/Eskil Simonsson zu Studio-Setups).
- Kirlian Camera: Sängerin(nen), Geräte.
- Joy Division: Transcendent 2000, ARP Omni, Synare (z. B. SOS/MusicRadar-Artikel).
- „Futurepop“-Begriff (Harris/Groth).

## 10. Quellen

**Übernommen aus früheren Runden (nur Suchauszüge, Stand der jeweiligen Runde):**
- And One: https://en.wikipedia.org/wiki/And_One · https://ironcharts.com/musician/steve-naghavi · https://www.ludd.ltu.se/~h-son/cd/a/ist.html
- Welle:Erdball: https://en.wikipedia.org/wiki/Welle:Erdball · https://sceneworld.org/blog/2020/01/22/podcast-episode-82-welleerdball
- Elegant Machinery: https://www.electricityclub.co.uk/elegant-machinery-interview/ · https://www.discogs.com/release/153510-Elegant-Machinery-A-Decade-Of-Thoughts · https://electricityclub.co.uk/tag/elegant-machinery
- S.P.O.C.K: https://en.wikipedia.org/wiki/S.P.O.C.K · https://www.electricityclub.co.uk/s-p-o-c-k-interview/
- Kirlian Camera: https://en.wikipedia.org/wiki/Kirlian_Camera
- Project Pitchfork: https://en.wikipedia.org/wiki/Kaskade_(Project_Pitchfork_album) · (nur Virus/Franke) https://www.beatportal.com/articles/1075891-the-sound-architects-wolfram-franke
- Second Decay: https://www.qobuz.com/ca-en/interpreter/second-decay/9406900 · https://systemsofromance.com/blog/category/second-decay
- De/Vision: siehe `r7/vorbild-coldwave2.md` §7
- Aggrotech-Genre (Supersaw): https://www.masterclass.com/articles/aggrotech-music-guide

**Prüf-URLs für UNBELEGTE eK-Aussagen (in dieser Runde nicht geöffnet):**
https://en.wikipedia.org/wiki/And_One_discography · https://en.wikipedia.org/wiki/MOS_Technology_6581 · https://www.c64-wiki.com/wiki/SID · https://en.wikipedia.org/wiki/Elegant_Machinery · https://en.wikipedia.org/wiki/Project_Pitchfork · https://en.wikipedia.org/wiki/Covenant_(band) · https://en.wikipedia.org/wiki/VNV_Nation · https://en.wikipedia.org/wiki/Futurepop · https://en.wikipedia.org/wiki/Mesh_(band) · https://en.wikipedia.org/wiki/Camouflage_(band) · https://en.wikipedia.org/wiki/Closer_(album) · https://en.wikipedia.org/wiki/Martin_Hannett

**Intern:** `synq-snapshots/V0a.html` (Zeilen wie angegeben) · `dirigent-spec-v3.md` §12.8, §14, Anhang A.1 · `dirigent-spec-v3-nachtrag-1.md` A.10 (VK) · `r6/bibliothek-recherche.md` · `r8/studio-setups.md` · `r7/vorbild-coldwave2.md` · `r7/vorbild-helden.md` · `fragen-xander-5.md` bis `-9.md`.

**Arbeitsdateien:** `r7/szene-work/aud.mjs` (Generator + Prüfung), `r7/szene-work/aud-report.txt`, `r7/szene-work/aud-blocks.md`, `r7/vorbild-szene-aud.json` (fertige `aud`-Daten).
