# R7-Recherche „Vorbilder dunkel“: Cold Wave, Darkwave, EBM, Dark Electro, Aggrotech

**Stand:** 17.10.2026, R7-Rechercheauftrag „vorbild-dark“. Grundlage: `fragen-xander-7.md` (L1–L3), `fragen-xander-8.md` (V), `fragen-xander-9.md` (Kawai K1, Studio-Setup, FM-Hüllkurven), Spec v3 §3.2/§3.3 (Drum ev3), §12.8 (`aud`), Nachtrag 1, `r6/bibliothek-recherche.md` (§5 Recht, §11 VORBILD, §12.2 Lese-Schlüssel), `SYNQUENZER-vision.md` §3.1, `r7/vorbild-coldwave2.md` (Agonoize, Sixth June, De/Vision), App-Stand `synq-snapshots/V0a.html` (nur gelesen).
**Acts:** The Frozen Autumn, Static Movement, Clan of Xymox, Front 242, Nitzer Ebb, DAF, Skinny Puppy, Leæther Strip, Suicide Commando, Agonoize (nur Verweis), Hocico. Dazu typische Industrial-/EBM-Bassmuster und 4 Demo-Song-Baupläne.
**Maschinenlesbar:** `r7/vorbild-dark-aud.json` (alle 10 Hörproben im Format von Spec §12.8, `notes [b, d, n, v]`). Erzeugt und geprüft von `r7/dark-work/aud-dark.mjs` (Ausgabe `aud-report.txt`: alle 10 Hörproben ≤ 8,0 s, ≤ 256 Noten, Töne in der angegebenen Lage, keine Überlappung in Mono-Spuren).

---

## 0. Wichtig vorweg: Die Recherche-Lage in diesem Lauf

**In diesem Lauf war keine Web-Recherche möglich.**
- WebSearch: Das Suchbudget dieses Durchgangs (200 Suchen, geteilt mit allen parallelen Agenten) war schon beim ersten Aufruf verbraucht. Die Rückmeldung des Werkzeugs lautete: „web search budget is used up … continue with the information already gathered“.
- WebFetch: `getaddrinfo ENOTFOUND` schon bei en.wikipedia.org. curl: Proxy antwortet 403 auf CONNECT (gleiches Bild wie in R6 und in `vorbild-coldwave2.md`).

**Was das für diese Datei heißt:**
1. **Kein einziger neuer Web-Beleg.** Alles, was hier über Bands, Personen, Jahre und Geräte steht und nicht aus den früheren Dateien übernommen ist, stammt aus **eigener Kenntnis (eK)** und ist deshalb nach der Regel des Auftrags **UNBELEGT**, auch wenn ich mir bei manchen Punkten ziemlich sicher bin. Wo ich unsicher bin, steht das ausdrücklich dabei („eK, unsicher“).
2. **Übernommene Belege** aus R6, Vision und `vorbild-coldwave2.md` behalten ihre Quelle. Weil diese nur aus Suchauszügen (SE) stammen und die Seiten nie abgerufen wurden, gilt nach dem Drei-Stufen-Schema: zwei unabhängige Auszüge = BELEGT, ein Auszug = WAHRSCHEINLICH.
3. **Keine erfundenen Quellen.** Statt URLs, die ich nicht geprüft habe, steht in §9 ein **Prüfauftrag** mit Suchanfragen und Quellentypen für den nächsten Lauf mit Netz. Die einzige Ausnahme sind Wikipedia-Artikeladressen der Bands. Sie sind als „nicht abgerufen“ markiert und nur als Startpunkt gedacht.
4. **Die Klangrezepte, Muster, Hörproben und Demo-Baupläne sind ohnehin eigene Entwürfe** (Design-Vorschläge, kein Quellenwissen). Sie sind vollständig und bauen nicht auf unbelegten Gerätedetails auf: Wo das Original-Gerät unklar ist, beschreibt das Rezept den **hörbaren Klangcharakter**, nicht ein behauptetes Original-Patch.

**Ehrliche Einordnung für Xander:** Der Wunsch „wirklich wie die Originale, recherchiert, ohne Zweifel“ ist für diese 11 Acts **mit diesem Lauf nicht erfüllt**. Die Rezepte sind gute Startpunkte im Stil, aber kein belegter Nachbau. Für die belegte Fassung braucht es einen zweiten Lauf mit Netz (§9, etwa 25–35 Suchen) und danach einen Hörvergleich mit den Originalaufnahmen (wir hören, die App spielt nichts Fremdes ab).

**Kennzeichen**
- **BELEGT**: Primärquelle oder zwei unabhängige Quellen sagen es ausdrücklich.
- **WAHRSCHEINLICH**: eine Sekundärquelle (hier fast immer ein Suchauszug aus einem früheren Lauf).
- **UNBELEGT**: eigene Kenntnis (eK) oder eigene Einschätzung, in diesem Lauf nicht geprüft.
- **ENTWURF**: eigener Gestaltungsvorschlag für SYNQUENZER (Rezept, Muster, Hörprobe). Das ist keine Tatsachenbehauptung über die Band.
- (SE) = Fakt nur aus einem Suchauszug.

---

## 1. Kurzfazit

| Thema | Ergebnis |
|---|---|
| Neue Belege | **0** (kein Netz, §0). Alle neuen Band- und Gerätefakten UNBELEGT (eK). |
| „Ego noise“ | **= Agonoize.** Xander hat das in Runde 8 selbst bestätigt (`fragen-xander-8.md` §V): BELEGT (Primärquelle Xander). Ego Likeness (US-Darkwave-Duo, eK) ist damit vom Tisch. Agonoize ist in `vorbild-coldwave2.md` §3.3 vollständig ausgearbeitet (C2-09 bis C2-12, Hörprobe „Funkenregen“). Hier nur Verweis und Einbindung in den Aggrotech-Bauplan. |
| Static Movement „Radio Station“ | **Nicht prüfbar** (kein Netz). In keiner früheren Datei ein Titel dieses Namens. UNBELEGT. Nicht raten: Rückfrage an Xander (§8) und Suche im nächsten Lauf (§9). |
| The Frozen Autumn: Kawai K1? | Für **K1 kein Beleg** (nur Xanders Erinnerung, Runde 9). Für **K4 nur ein Equipboard-Nutzerfoto** (R6/Vision, K10). Beides UNBELEGT. Wichtig für den Klang (eK, UNBELEGT): Der K1 hat nach meiner Kenntnis **kein Filter**, der K4 hat ein resonanzfähiges Filter. Deshalb gibt es hier eine K1-taugliche Variante ohne Filterfahrt (DK-02) neben dem R6-Rezept N29. |
| Neue Sounds | **34 Einträge DK-01 … DK-34** (20 VA, 5 WT, 0 FM6, 8 Drum-Kits, 1 Perc-Pad; FM-Metall über die vorhandenen N06 und C2-11). Alle ENTWURF. Namen E9-konform (keine Band-, Titel- oder Gerätenamen). |
| Hörproben | **10 Stück**, je 4 Takte, 6,6–8,0 s, mehrstimmig (Bass + Lead/Fläche + Drums). Alle Melodien und Muster eigene Entwürfe; Begründung der Rechtslage je Hörprobe und in §2. |
| Bassmuster | **8 Muster-Clips P1–P8** (Galopp, Drill, Offbeat-Roll, Hammer, 8-Schritt-Kette, Halbton-Pendel, Triolen-Galopp, Achtel-Oktave), je 1 Takt, als ⧉-Clip anbietbar. |
| Demo-Baupläne (§5.12) | **4 Genres**: Cold Wave, EBM klassisch, Dark Electro/Industrial, Aggrotech; mit Tempo, Tonart, Teilen, Spuren, Sounds, Erkennungsmerkmalen. |
| Korrekturen an früheren Dateien | **7** (§7), vor allem: Static-Movement-Geräte und Frozen-Autumn-K4 sind nach dem neuen Schema schwächer belegt als bisher angegeben. |
| Engine-Lücken für dieses Genre | Sampler, Ringmodulator, Bitcrusher, zweites Filter (HP + LP wie MS-20), Stimmen-Verzerrung (erst mit Mikrofon), FM-Hüllkurven (Xanders Befund Runde 9) (§6). |

---

## 2. Rechtliche Linie für die Hörproben (kurz, kein Rechtsrat)

Gilt wie R6 §5 und `vorbild-coldwave2.md` §1. Kurzform:
- **Frei** (UNBELEGT, eK): Stil und Genre, Klangfarbe, Tempo, Rhythmusgefühl (16tel-Bass, Galopp, Four-on-the-Floor), Allerwelts-Akkordfolgen (i–VI–III–VII, i–♭VI–♭VII, Orgelpunkt auf der Tonika), Tonleitern und Dreiklangs-Arpeggien.
- **Nicht übernehmen:** konkrete Melodie- oder Basslinien eines Titels (§ 2, § 23 UrhG), Samples und Resynthese fremder Aufnahmen (§ 85 UrhG), Band-, Titel- oder Gerätenamen in Sound-Namen (E9). Der ⓘ-Text darf „erinnert an … (Stil: X)“ sagen (§ 23 Abs. 1 Nr. 3 MarkenG, R6 K22) plus Pflichtsatz „Marken gehören ihren Inhabern, keine Verbindung.“
- **Arbeitsregel dieser Datei:**
  1. Jede Hörprobe ist aus **Bausteinen** gebaut, die es in tausenden Titeln gibt: Grundton-Oktav-Muster, Akkordtöne, Tonleiterschritte, Leitton zur Tonika.
  2. Keine Hörprobe übernimmt mehr als 3 aufeinanderfolgende Töne im gleichen Rhythmus aus einem bekannten Titel (eigene Regel wie coldwave2; keine Rechtsgrenze).
  3. Ich habe beim Schreiben **keine** Original-Melodie im Kopf nachgebaut. Ein automatischer Abgleich mit einer Melodie-Datenbank hat **nicht** stattgefunden. Vor dem Einbau (V10d) hört ein Mensch gegen die bekannten Titel der Acts (Pflichtvermerk „eigene Melodie“ wie V10d-05).
- **Wiedererkennung entsteht hier aus Klang, Lage, Tempo, Groove und Arrangement**, nicht aus der Melodie. Genau das wünscht Xander in Runde 8 („wo der Sound am besten klingt, Bereich/Rolle“).

---

## 3. Auflösung der unklaren Namen und Geräte

### 3.1 „Ego noise“

| Kandidat | Bewertung | Status |
|---|---|---|
| **Agonoize** (Berlin, Aggrotech) | Xander schreibt in Runde 8: „‚Ego noise‘ = Agonoize“. Lautlich naheliegend („A-go-noize“). | **BELEGT** (Xanders eigene Klarstellung, `fragen-xander-8.md` §V) |
| Ego Likeness (US-Darkwave, eK) | passt lautlich schlechter und ist kein Industrial-Act | entfällt |
| „Egonoise“ als eigener Act | in keiner Datei, nicht prüfbar | entfällt |

→ Agonoize-Material: `vorbild-coldwave2.md` §3.3 (Fakten BELEGT/WAHRSCHEINLICH aus SE, Sounds C2-09 Höllensäge-Lead, C2-10 Stampf-Bass, C2-11 Alarm-Metall FM, C2-12 Höllenmaschine-Kit, Hörprobe „Funkenregen“ 140 BPM f-Moll). **Keine Doppel-Sounds hier.** Der Aggrotech-Bauplan D4 (§5) benutzt sie.

### 3.2 Static Movement und „Radio Station“

| Aussage | Status | Quelle |
|---|---|---|
| Static Movement nutzte Elka Synthex, PPG Wave 2.2 und ein Gerät von Sequential; Album „Visionary Landscapes“ (1999) | WAHRSCHEINLICH (ein Suchauszug aus R6/Vision; die Quellenliste K10 nennt dazu nur `thefrozenautumn.com/biography` und `equipboard.com/items/kawai-k4`, keine eigene Static-Movement-Quelle) | Vision §3.1, K10 |
| Static Movement ist ein italienisches Projekt aus dem Umfeld von The Frozen Autumn (Froxeanne/Arianna) | UNBELEGT (eK, **unsicher**) | – |
| Ein Titel oder Album „Radio Station“ (oder ähnlich) von Static Movement | **UNBELEGT** – weder bestätigt noch widerlegt. Kein Treffer in den Dateien; Netzsuche nicht möglich | – |

**Vorgehen:** Nicht raten. Für die Bibliothek ist der Titel ohnehin unerheblich (keine Titelnamen in Sounds, E9). Es reicht der Stil-Tag `static-movement`. Rückfrage (§8): „Wo hast du ‚Radio Station‘ gehört – Textzeile, Album, Video?“ Mögliche Verwechslungen, nur als Prüfliste, nicht als Behauptung: ein anderer Act der Cold-Wave-Szene, ein Remix oder ein Liedtext.

### 3.3 The Frozen Autumn: Kawai K1 oder K4?

| Aussage | Status | Quelle |
|---|---|---|
| Kawai K4 im Setup | UNBELEGT (nur Equipboard-Nutzerfoto; Equipboard gilt laut Auftrag nur als schwache Quelle) | R6 §1, Vision K10 |
| Kawai K1 im Setup | UNBELEGT (nur Xanders Erinnerung, Runde 9; keine Quelle in den Dateien) | `fragen-xander-9.md` |
| Duo Diego Merletto und Froxeanne (Arianna), Turin, Cold Wave/Darkwave seit Anfang der 1990er | UNBELEGT (eK; Bandseite `thefrozenautumn.com/biography` steht in K10, ihr Inhalt ist nicht dokumentiert) | – |
| Kawai K1 (1988): digitale Wellenformen (Einzelzyklen und kurze PCM-Anschläge), bis zu 4 Quellen je Klang, **kein Filter**, keine Effekte | UNBELEGT (eK, ziemlich sicher bei „kein Filter“, unsicher bei den Zahlen) | – |
| Kawai K4 (1989): wie K1-Prinzip, aber mit **resonanzfähigem Filter** je Quelle | UNBELEGT (eK) | – |

**Folge für den Nachbau (ENTWURF):**
- Wenn K1: Klang entsteht durch das **Mischen statischer Digitalwellen** mit eigenen Lautstärke-Hüllkurven. Helligkeit ändert sich nicht über ein Filter. In SYNQUENZER: WT mit festem `pos`, Scan 0, Filter offen (LP24 ≥ 9 kHz, Res 0). Das ist DK-02.
- Wenn K4: zusätzlich eine kurze Filter-Hüllkurve. Das ist R6 N29 „Eisglas-Keys“ (LP24 3,5 kHz) und passt dann.
- Hall und Chorus kamen in beiden Fällen von außen (Studio-Effekte). Welche, ist UNBELEGT.

---

## 4. Bausteine: typische Industrial-/EBM-Bassmuster (Muster-Clips P1–P8)

Alle Zuordnungen „typisch für …“ sind **UNBELEGT** (eK, Genre-Hörwissen). Die Muster selbst sind Allerweltsbausteine (ENTWURF) und als ⧉-Clip (Spec §12.8 `clip`) anbietbar. Schreibweise: 16 Schritte je Takt, R = Grundton, O = Oktave darüber, b2 = kleine Sekunde darüber, 5 = Quinte, − = Pause. Beispiel-Grundton A1 (MIDI 33), O = A2 (45). Anschlag in Klammern: Betonung / normal.

| Nr | Name (Clip) | Schritte 1–16 | Gefühl / wo typisch (eK) | in Hörprobe |
|---|---|---|---|---|
| P1 | **Galopp** | `R − R O · R − R O · R − R O · R − R O` (112 / 84 / 96) | federnder Marsch, klassische EBM der 80er | F242 |
| P2 | **Drill** | `R R O R · R R O R · R R O R · R R O R` (112 / 78 / 96 / 80) | Dauer-16tel mit Oktavsprung, „Körper“-EBM | NE |
| P3 | **Offbeat-Roll** | `− R O R · − R O R · − R O R · − R O R` (− / 100 / 84 / 92) | Bass weicht der Kick aus; Dark Electro, Future Pop | LS |
| P3b | **Offbeat-Roll gerade** | `− R R O · − R R O · …` | wie P3, Oktave am Schlagende; Aggrotech | SC |
| P4 | **Hammer** | `R R R O · R R R O · …` (112 / 82 / 88 / 98) + Pumpen 60 % | Wand aus 16teln, nur durch Pumpen gegliedert; Aggrotech | HO |
| P5 | **8-Schritt-Kette** | `R R O R ♭3 R 5 ♭7` zweimal je Takt, pro Takt per Transponieren verschoben | Sequenzer-Kette, die man live transponiert; frühe deutsche Elektronik | DAF |
| P6 | **Halbton-Pendel** | `R R b2 R · R O R b2 · R R b2 R · O R b2 R` | phrygische Drohung, Industrial | (D3) |
| P7 | **Triolen-Galopp** | Achteltriolen `R R O` × 4 je Takt (12 Schläge) | schleppend, schwer; langsames Industrial, 95–110 BPM | (D3) |
| P8 | **Achtel-Oktave** | `R O R O R O R O` (Achtel) | Cold Wave / Synthpop, wenn der Bass die Melodie nicht trägt | (D1) |

**Spieltechnik, die bei allen Mustern den Charakter macht (ENTWURF, Begründung eK):**
- **Akzent über Anschlag → Filter-Hüllkurve** (`fvel` 0,4–0,55): Die betonten Töne „bellen“, die anderen bleiben dumpf. Ohne das klingt jedes Muster wie eine Nähmaschine.
- **Reset an** (`reset` 1): Jeder Ton startet gleich hart.
- **Kurze Amp-Ausklingzeit** (`aR` 0,03–0,05 s) und Notenlänge 1 (16tel) oder 0,75 (gestoßen).
- **Transponieren statt Neuschreiben:** Ein Muster pro Szene, die Akkordwechsel kommen über ⇅ TRANSPONIEREN. Das ist genau die Arbeitsweise mit Hardware-Sequenzern (eK, UNBELEGT für einzelne Bands) und passt zu SYNQUENZER.
- **Lage-Grenze (Wunsch T, Runde 8):** EBM-Bässe gehören in **G1–A2** (49–110 Hz Grundton), Oktavsprünge bis höchstens D3. Empfehlung `range` je Sound steht in den Tabellen.

---

## 5. Die Acts

**Lese-Schlüssel der Rezepte:** wie R6 §12.2 (z. B. „LP24 420 Hz Res 35 %“ → `ftype 0, cutoff 420, res .35`; „Filter-Hk +30 HT“ → `fenv` 30/72; „Spur-Drive“ → `fx.drive`; „Pumpen“ → `fx.pump`; Chorus-Modi `off | I | II | I+II | ENS | BREIT`; Echo „1/8.“ = punktierte Achtel; Hall „n s x“ = `bus.hall.decay` n, Send x). WT-Tabellen: `digital | vocal | glas | orgel`, `scanTime` ≤ 4 s. Drums: Makros der ev3-Engine (Spec §3.3): KICK TON · PUNCH · DECAY · KLICK · BISS · DRIVE (+ ART), SNARE TON · KÖRPER · SNAPPY · ANSATZ · AUSKLANG · PEITSCHE, CLAP TON · HÄNDE · ABSTAND · AUSKLANG · SCHÄRFE · RAUM, HH METALL · FARBE · DECAY · RAUSCHEN · KLINGEN · FM, TOM TON · BEND · BEND-ZEIT · DECAY · FELL · BISS, PERC TON · FARBE · VERHÄLTNIS · DECAY · BEND · FORM (+ Charakter). Kit-Bus: Raum, Gate. Pegel nicht kalibriert (V10d: −18 ± 3 LUFS).

**Alle Rezepte: ENTWURF, nicht gemessen, nicht angehört.** Verzerrung immer über **Spur-Drive**, nicht über Filter-Drive (R6 §0 gemessen: Filter-Drive raut nicht auf).

---

### 5.1 The Frozen Autumn (Cold Wave, Italien)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Duo aus Turin, Diego Merletto und Froxeanne; Cold Wave / Darkwave mit Synthpop-Melodik; seit Anfang der 1990er | UNBELEGT (eK) | Prüf-Start: https://en.wikipedia.org/wiki/The_Frozen_Autumn (nicht abgerufen), `thefrozenautumn.com/biography` (in K10, Inhalt nicht dokumentiert) |
| Kawai K4 bzw. K1 | UNBELEGT (§3.3) | Equipboard (schwach) / Xander |
| Hörbild: hohe, melodische Synth-Basslinien mit Chorus, helle digitale Leads mit Echo, gerade Drumcomputer-Grooves, Moll | UNBELEGT (eK, Hörwissen) | – |

**Typisch (UNBELEGT, eK):** 118–135 BPM, Moll (e, a, d), Achtel-Bass, der selbst Melodie spielt; Hats in Achteln; Snare mit hörbarem Raum; Strophe oft nur Bass + Drums + Stimme, Refrain mit Lead und Fläche; Zwischenspiele, in denen der Bass-Riff allein steht.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-01 | **Herbstriff-Bass** | Bass · E2–G3 (melodisch, hoch) | VA | Puls 45 % + Säge (Osz. 2, 0 ct, Pegel 0,7), LP24 900 Hz Res 18 %, Keytrack 40 %, Filter-Hk +18 HT A 1 ms D 0,18 S 30 % R 0,1, Anschlag → Filter-Hk +25 %, Amp A 1 ms D 0,35 S 60 % R 0,1, mono, Reset an, Analog 0,2, Chorus I 50 %, Echo 1/8 10 %, Hall 1,2 s 0,1 |
| DK-02 | **Digitalglas-Lead** | Lead · E4–G5 | WT | Tabelle `digital` Pos 0,45, Scan 0 (statisch, K1-Prinzip ohne Filterfahrt), LP24 9 kHz Res 0, Keytrack 100 %, Filter-Hk 0, Amp A 2 ms D 0,9 S 55 % R 0,6, Poly 4, Vibrato verzögert 0,5 s 5 Hz ±10 ct, Chorus II 40 %, Echo 1/8. 25 % (fb 0,35, Ping-Pong), Hall 2,5 s 0,3 |
| DK-03 | **Digitalchor-Fläche** | Fläche · C4–A4 | WT | Tabelle `vocal` Pos 0,25 Scan +0,15 in 2 s, LP24 4 kHz Res 5 %, Amp A 0,4 S 100 % R 1,8, Poly 6, Chorus ENS 50 %, Hall 4 s 0,4 |
| DK-04 | **Kaltkasten-Kit** | Drums | Drum ev3 | KICK TON 55 Hz PUNCH 12 HT DECAY 0,28 s KLICK 20 % BISS 0 DRIVE 10 %; SNARE TON 200 Hz KÖRPER 40 % SNAPPY 60 % AUSKLANG 0,18 s, Pad-Raum 35 % (Kit-Raum 1,4 s); HH ZU METALL 50 % FARBE hell DECAY 25 ms RAUSCHEN 30 %; alles andere trocken; DYN 12 dB |
| (vorh.) | A.1 #14 Herbstarp, R6 N28 Nebelkälte-Bass, N29 Eisglas-Keys, N47 Kaltwelle-Puls | | | bleiben; N29 ist die K4-Lesart (§3.3) |

#### Hörprobe (ENTWURF) FA „Herbstbahn“ · 126 BPM · e-Moll · 4 Takte = 7,6 s · Akkorde `Em | C | G | D`

*DK-01 Herbstriff-Bass* (Lage E2–G3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | E2(40)@0/2 v100 · E3(52)@2/2 v80 · B2(47)@4/2 v100 · E3(52)@6/2 v80 · D3(50)@8/2 v100 · B2(47)@10/2 v80 · G2(43)@12/2 v100 · B2(47)@14/2 v80 |
| 2 | C3(48)@16/2 v100 · G2(43)@18/2 v80 · E3(52)@20/2 v100 · G2(43)@22/2 v80 · D3(50)@24/2 v100 · C3(48)@26/2 v80 · G2(43)@28/2 v100 · E2(40)@30/2 v80 |
| 3 | G2(43)@32/2 v100 · D3(50)@34/2 v80 · B2(47)@36/2 v100 · D3(50)@38/2 v80 · G3(55)@40/2 v100 · D3(50)@42/2 v80 · B2(47)@44/2 v100 · A2(45)@46/2 v80 |
| 4 | D3(50)@48/2 v100 · A2(45)@50/2 v80 · F♯2(42)@52/2 v100 · A2(45)@54/2 v80 · D3(50)@56/2 v106 · C♯3(49)@58/2 v86 · B2(47)@60/2 v106 · A2(45)@62/2 v86 |

*DK-02 Digitalglas-Lead* (Lage E4–G5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | B4(71)@0/6 v96 · A4(69)@6/2 v84 · G4(67)@8/4 v90 · E4(64)@12/4 v86 |
| 2 | G4(67)@16/4 v92 · C5(72)@20/6 v100 · B4(71)@26/2 v84 · A4(69)@28/4 v88 |
| 3 | B4(71)@32/4 v94 · D5(74)@36/4 v98 · G5(79)@40/6 v106 · F♯5(78)@46/2 v90 |
| 4 | E5(76)@48/4 v100 · D5(74)@52/4 v94 · A4(69)@56/4 v90 · F♯4(66)@60/4 v92 |

*DK-04 Kaltkasten-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x.......x.x..... / x.......x.x..... / x.......x.x..... / x.......x.x.x...` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......xxxx` |
| HH | `x.x.x.x.x.x.x.x. / x.x.x.x.x.x.x.x. / x.x.x.x.x.x.x.x. / x.x.x.x.x.x.....` |

**Warum rechtlich unbedenklich (Einschätzung):** Der Bass besteht aus Akkordtönen der Allerweltsfolge Em–C–G–D in Achteln (Grundton–Oktave–Quinte), der Lead aus Tonleiterschritten mit einem Quartsprung. Wiedererkennbar sind Lage (Bass über E2, Lead im Glasregister), Chorus, Echo und der gerade Cold-Wave-Groove, nicht eine Melodie.
**Kartentext:** „Melodischer Chorus-Bass, gläserner Digital-Lead mit Echo, trockener Drumcomputer – erinnert an italienische Cold Wave der 90er (Stil: The Frozen Autumn).“

---

### 5.2 Static Movement (Cold Wave / Synth)

**Fakten:** siehe §3.2 (Geräte WAHRSCHEINLICH, alles andere UNBELEGT).
**Geräte-Wissen für das Rezept (UNBELEGT, eK):** Elka Synthex: italienischer Polysynth (1981), 2 Oszillatoren je Stimme, Multimode-Filter, eingebauter Chorus, Ringmodulator. PPG Wave 2.2: Wavetable-Oszillatoren mit analogem Tiefpass; beim Durchfahren der Tabelle „springt“ der Klang in Stufen.
**Typisch (UNBELEGT, eK):** 115–128 BPM, Moll, breite Chorus-Flächen, gläserne Wavetable-Arpeggien, ruhige Bassfiguren in Halben/Vierteln statt 16teln.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-05 | **Wellenkante-Bass** | Bass · A1–A2 | WT | Tabelle `digital` Pos 0,7 Scan −0,5 in 0,25 s (die „Zacke“ im Anschlag), LP24 1,1 kHz Res 25 %, Filter-Hk +20 HT D 0,25 S 20 %, Amp A 1 ms D 0,5 S 70 % R 0,12, mono, Chorus aus, Hall 0,08 |
| DK-06 | **Breitchor-Lead** | Lead · G♯4–F5 | VA | 2 Sägen ±6 ct + Puls 30 % +1 Okt 20 %, LP12 2,8 kHz Res 20 %, Filter-Hk +10 HT A 30 ms D 0,4 S 60 %, Amp A 15 ms D 0,5 S 85 % R 0,6, Legato, Glide 40 ms, Vibrato verzögert 0,6 s 5,5 Hz ±12 ct, Chorus I+II 60 %, Echo 1/4 20 %, Hall 3 s 0,35 |
| (vorh.) | A.1 #12 Kaltes Glas (Arp), A.1 #13 Synthex-Streicher, R6 N30 Gitter-Schimmer | | | bleiben; Belegstatus herabsetzen (§7 KD-1) |

#### Hörprobe (ENTWURF) SM „Gitterlicht“ · 120 BPM · a-Moll · 4 Takte = 8,0 s · Akkorde `Am | F | Dm | E`

*DK-05 Wellenkante-Bass* (Lage A1–A2):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | A1(33)@0/6 v104 · A2(45)@6/2 v86 · A1(33)@8/4 v98 · E2(40)@12/4 v92 |
| 2 | F2(41)@16/6 v104 · C2(36)@22/2 v86 · F2(41)@24/4 v98 · A2(45)@28/4 v92 |
| 3 | D2(38)@32/6 v104 · A1(33)@38/2 v86 · D2(38)@40/4 v98 · F2(41)@44/4 v92 |
| 4 | E2(40)@48/6 v104 · B1(35)@54/2 v86 · E2(40)@56/4 v98 · G♯2(44)@60/4 v100 |

*A.1 #12 Kaltes Glas (Arp)* (Lage A4–A5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | A4(69)@0/1 v96 · C5(72)@1/1 v66 · E5(76)@2/1 v80 · C5(72)@3/1 v66 · A4(69)@4/1 v96 · C5(72)@5/1 v66 · G5(79)@6/1 v80 · C5(72)@7/1 v66 · A4(69)@8/1 v96 · C5(72)@9/1 v66 · A5(81)@10/1 v80 · C5(72)@11/1 v66 · A4(69)@12/1 v96 · C5(72)@13/1 v66 · G5(79)@14/1 v80 · E5(76)@15/1 v66 |
| 2 | A4(69)@16/1 v96 · C5(72)@17/1 v66 · F5(77)@18/1 v80 · C5(72)@19/1 v66 · A4(69)@20/1 v96 · C5(72)@21/1 v66 · G5(79)@22/1 v80 · C5(72)@23/1 v66 · A4(69)@24/1 v96 · C5(72)@25/1 v66 · A5(81)@26/1 v80 · C5(72)@27/1 v66 · G5(79)@28/1 v96 · F5(77)@29/1 v66 · C5(72)@30/1 v80 · A4(69)@31/1 v66 |
| 3 | A4(69)@32/1 v96 · D5(74)@33/1 v66 · F5(77)@34/1 v80 · D5(74)@35/1 v66 · A4(69)@36/1 v96 · D5(74)@37/1 v66 · A5(81)@38/1 v80 · D5(74)@39/1 v66 · A4(69)@40/1 v96 · D5(74)@41/1 v66 · G5(79)@42/1 v80 · D5(74)@43/1 v66 · F5(77)@44/1 v96 · E5(76)@45/1 v66 · D5(74)@46/1 v80 · A4(69)@47/1 v66 |
| 4 | B4(71)@48/1 v96 · E5(76)@49/1 v66 · G♯5(80)@50/1 v80 · E5(76)@51/1 v66 · B4(71)@52/1 v96 · E5(76)@53/1 v66 · A5(81)@54/1 v80 · E5(76)@55/1 v66 · B4(71)@56/1 v96 · E5(76)@57/1 v66 · G♯5(80)@58/1 v80 · E5(76)@59/1 v66 · B4(71)@60/1 v96 |

*DK-06 Breitchor-Lead* (Lage G#4–F5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | E5(76)@0/8 v92 · D5(74)@8/4 v86 · C5(72)@12/4 v86 |
| 2 | A4(69)@16/12 v90 · C5(72)@28/4 v88 |
| 3 | D5(74)@32/6 v94 · E5(76)@38/2 v90 · F5(77)@40/8 v100 |
| 4 | E5(76)@48/8 v98 · B4(71)@56/4 v88 · G♯4(68)@60/4 v92 |

*DK-04 Kaltkasten-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x.......x....... / x.......x....... / x.......x....... / x.......x...x...` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......x.xx` |
| HH | `..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x. / ..x...x...x.....` |

**Warum unbedenklich:** Bass in Halben/Vierteln auf Grundton und Quinte, Arp aus Akkordtönen (Grundton–Terz–wandernder Oberton), Lead als fallende Tonleiter mit Leitton G♯ – alles Bausteine von a-Moll. Wiedererkennbar: Glas-Arp + Breit-Chorus + ruhiger Bass.
**Kartentext:** „Gläsernes Wavetable-Arpeggio, breiter Chorus-Lead, ruhiger Digitalbass – erinnert an italienische Cold Wave (Stil: Static Movement).“

---

### 5.3 Clan of Xymox (Darkwave, Niederlande)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Niederländische Band um Ronny Moorings; frühe Alben bei 4AD (Debüt 1985, „Medusa“ 1986); zeitweise als „Xymox“ | UNBELEGT (eK, Jahreszahlen ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Clan_of_Xymox (nicht abgerufen) |
| Frühe Besetzung mit Anka Wolbert und Pieter Nooten | UNBELEGT (eK) | – |
| Hörbild: Drumcomputer, Bass mit Chorus (vermutlich **E-Bass**, nicht Synth), Streicher-/Chorflächen, Gitarren-Arpeggien, viel Hall | UNBELEGT (eK; ob der Bass ein Instrument oder Synth ist, ist ungeprüft) | – |
| Konkrete Synthesizer und Drumcomputer | UNBELEGT (nicht recherchiert) | – |

**Typisch (UNBELEGT, eK):** 110–130 BPM, Moll, Bass als Melodieträger in Achteln, große hallige Snare, Flächen in langen Akkorden, Gitarren-Arpeggien (bei uns Pluck-Ersatz).

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-07 | **Chorus-Saitenbass** | Bass · A1–D3 | VA | Säge + Dreieck (Osz. 2, Pegel 0,6), Rauschen 4 % (Anzupfen), LP24 1,3 kHz Res 10 %, Keytrack 50 %, Filter-Hk +22 HT A 1 ms D 0,12 S 25 % R 0,1, Anschlag → Filter-Hk +40 %, Amp A 1 ms D 0,6 S 45 % R 0,12, mono, Analog 0,2, Chorus I+II 65 %, Hall 1,5 s 0,12. Ersatz für einen gezupften E-Bass mit Chorus-Pedal |
| DK-08 | **Kathedralen-Streicher** | Fläche · C4–B♭4 | VA | Säge Uni 3 (Verst. 25 %) + Säge −1 Okt 35 %, LP12 2,2 kHz Res 5 %, LFO 2 0,1 Hz → Cutoff ±3 HT, Amp A 0,35 S 100 % R 1,8, Poly 6, Chorus ENS 60 %, Hall 4,5 s 0,45 |
| DK-09 | **Gitter-Arp** | Sequenz · G4–G5 | VA | Puls 30 % + Säge +1 Okt 25 %, LP24 2,4 kHz Res 25 %, Filter-Hk +20 HT D 0,15 S 0, Amp A 1 ms D 0,35 S 0 R 0,3, Poly 4, Chorus I 40 %, Echo 1/8. 30 % (fb 0,4, Ping-Pong), Hall 2,5 s 0,3. Ersatz für ein Gitarren-Arpeggio |
| DK-10 | **Grabkammer-Kit** | Drums | Drum ev3 | KICK TON 52 Hz PUNCH 16 HT DECAY 0,35 DRIVE 15 %; SNARE TON 190 Hz SNAPPY 55 % AUSKLANG 0,2, Kit-Raum 2,5 s mit Gate 300 ms (großer, abgeschnittener Hall); HH ZU METALL 45 % DECAY 20 ms, leise (v 60–70); TOM TON 110/90/70 Hz BEND −5 HT DECAY 0,4 |

#### Hörprobe (ENTWURF) CX „Nachtgalerie“ · 120 BPM · d-Moll · 4 Takte = 8,0 s · Akkorde `Dm | Bb | C | Am`

*DK-07 Chorus-Saitenbass* (Lage A1–D3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | D2(38)@0/2 v100 · A2(45)@2/2 v80 · D3(50)@4/2 v100 · A2(45)@6/2 v80 · C3(48)@8/2 v100 · A2(45)@10/2 v80 · F2(41)@12/2 v100 · E2(40)@14/2 v80 |
| 2 | B♭1(34)@16/2 v100 · F2(41)@18/2 v80 · B♭2(46)@20/2 v100 · F2(41)@22/2 v80 · A2(45)@24/2 v100 · F2(41)@26/2 v80 · D2(38)@28/2 v100 · F2(41)@30/2 v80 |
| 3 | C2(36)@32/2 v100 · G2(43)@34/2 v80 · C3(48)@36/2 v100 · G2(43)@38/2 v80 · E2(40)@40/2 v100 · G2(43)@42/2 v80 · B♭2(46)@44/2 v100 · G2(43)@46/2 v80 |
| 4 | A1(33)@48/2 v100 · E2(40)@50/2 v80 · A2(45)@52/2 v100 · E2(40)@54/2 v80 · C3(48)@56/2 v100 · B2(47)@58/2 v80 · A2(45)@60/2 v100 · E2(40)@62/2 v80 |

*DK-08 Kathedralen-Streicher* (Lage C4–Bb4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | [D4(62) F4(65) A4(69)]@0/16 v70 |
| 2 | [D4(62) F4(65) B♭4(70)]@16/16 v70 |
| 3 | [C4(60) E4(64) G4(67)]@32/16 v72 |
| 4 | [C4(60) E4(64) A4(69)]@48/16 v74 |

*DK-09 Gitter-Arp* (Lage G4–G5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | D5(74)@0/2 v92 · A4(69)@2/2 v68 · F5(77)@4/2 v92 · A4(69)@6/2 v68 · E5(76)@8/2 v92 · A4(69)@10/2 v68 · C5(72)@12/2 v92 · A4(69)@14/2 v68 |
| 2 | D5(74)@16/2 v92 · B♭4(70)@18/2 v68 · F5(77)@20/2 v92 · B♭4(70)@22/2 v68 · D5(74)@24/2 v92 · B♭4(70)@26/2 v68 · C5(72)@28/2 v92 · B♭4(70)@30/2 v68 |
| 3 | E5(76)@32/2 v92 · G4(67)@34/2 v68 · G5(79)@36/2 v92 · G4(67)@38/2 v68 · F5(77)@40/2 v92 · G4(67)@42/2 v68 · E5(76)@44/2 v92 · G4(67)@46/2 v68 |
| 4 | E5(76)@48/2 v96 · A4(69)@50/2 v68 · C5(72)@52/2 v96 · A4(69)@54/2 v68 · D5(74)@56/2 v96 · A4(69)@58/2 v68 · E5(76)@60/2 v96 · A4(69)@62/2 v68 |

*DK-10 Grabkammer-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x.......x....... / x.......x.x..... / x.......x....... / x.......x.......` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x...........` |
| HH | `xxxxxxxxxxxxxxxx / xxxxxxxxxxxxxxxx / xxxxxxxxxxxxxxxx / xxxxxxxxxxxx....` |
| TOM | `................ / ................ / ................ / ............xxxx` |

**Warum unbedenklich:** Bass = gebrochene Akkorde Dm–B♭–C–Am mit Durchgängen, Arp = Pendel um einen liegenden Ton (Gitarren-Allerweltsfigur), Streicher in Grundstellung. Wiedererkennbar: Chorus-Bass als Melodie, Hallraum, 16tel-Hats leise.
**Kartentext:** „Chorus-Bass als Melodie, Kathedralen-Streicher, Gitarren-artiges Echo-Arpeggio, große Hall-Snare – erinnert an 80er-Darkwave (Stil: Clan of Xymox).“

---

### 5.4 Front 242 (EBM, Belgien)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Belgische Band, gegründet 1981; Daniel Bressanutti, Patrick Codenys, Jean-Luc De Meyer, Richard 23 | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Front_242 (nicht abgerufen) |
| Prägte den Begriff „Electronic Body Music“ (Mitte der 1980er) | UNBELEGT (eK, ziemlich sicher) | – |
| „Headhunter“ (1988, Album „Front by Front“) | UNBELEGT (eK) | – |
| Arbeit mit Samplern (Stimmen-, Funk- und Geräusch-Samples) neben analogen Sequenzen | UNBELEGT (eK, Geräte-Modelle nicht genannt, weil ungeprüft) | – |
| Konkrete Geräte (Synth, Drumcomputer, Sequenzer) | UNBELEGT – bewusst keine Modelle genannt | §9 |

**Typisch (UNBELEGT, eK):** 110–125 BPM, Moll/Orgelpunkt, Galopp- und 16tel-Bässe, kurze Akkord-Stabs auf Offbeats, metallische Perkussion, Funk-/Sprach-Fetzen, militärischer Sprechgesang, harte Snare mit kurzem Gate-Hall.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-11 | **Kommando-Bass** | Bass · F1–A2 | VA | Säge + Säge +7 ct (Pegel 0,6), LP24 420 Hz Res 35 %, Filter-Hk +30 HT A 1 ms D 0,09 S 5 % R 0,05, Anschlag → Filter-Hk +45 %, Amp A 1 ms D 0,15 S 55 % R 0,04, mono, Reset an, Spur-Drive 25 %, Pumpen 15 %, Hall 0 |
| DK-12 | **Signal-Stab** | Akkord/Stab · F3–E4 | VA | 2 Sägen ±8 ct + Puls 25 % (Pegel 0,4), LP24 1,6 kHz Res 30 %, Filter-Hk +30 HT D 0,12 S 0, Amp A 1 ms D 0,18 S 0 R 0,12, Poly 6, Spur-Drive 15 %, Echo 1/8 15 %, Hall 1,4 s 0,2 |
| DK-13 | **Kurzwellen-Atmo** | Atmo · ein Ton | VA | Rauschen 100 % + Puls 10 % leise, BP12 1,8 kHz Res 60 %, LFO 1 S&H 9 Hz → Cutoff ±18 HT, LFO 2 Sinus 0,2 Hz → Tonhöhe Osz. 1 ±2 HT, Amp A 0,05 S 100 % R 0,4, Spur-Drive 30 %, Echo 1/16 20 %. Ersatz für Funk-/Sprach-Samples (keine fremden Samples, §2) |
| DK-14 | **Maschinenhalle-Kit** | Drums | Drum ev3 | KICK TON 50 Hz PUNCH 20 HT DECAY 0,3 KLICK 35 % DRIVE 35 %; SNARE TON 220 Hz SNAPPY 70 % AUSKLANG 0,15, Kit-Raum 1,8 s mit Gate 180 ms; HH ZU METALL 60 % DECAY 18 ms; PERC Charakter KUHGLOCKE, VERHÄLTNIS 1,41, EXTREM an, DECAY 0,12 s (Metall) |
| (vorh.) | R6 N06 Blechhammer (FM-Metall), A.1 #9 Grauzone-Bass | | | als Ergänzung |

#### Hörprobe (ENTWURF) F242 „Befehlskette“ · 120 BPM · a-Moll · 4 Takte = 8,0 s · Akkorde `Am | Am | F | G`

*DK-11 Kommando-Bass* (Lage F1–A2):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | A1(33)@0/1 v112 · A1(33)@2/1 v84 · A2(45)@3/1 v96 · A1(33)@4/1 v112 · A1(33)@6/1 v84 · A2(45)@7/1 v96 · A1(33)@8/1 v112 · A1(33)@10/1 v84 · A2(45)@11/1 v96 · A1(33)@12/1 v112 · A1(33)@14/1 v84 · A2(45)@15/1 v96 |
| 2 | A1(33)@16/1 v112 · A1(33)@18/1 v84 · A2(45)@19/1 v96 · A1(33)@20/1 v112 · A1(33)@22/1 v84 · A2(45)@23/1 v96 · A1(33)@24/1 v112 · A1(33)@26/1 v84 · A2(45)@27/1 v96 · A1(33)@28/1 v112 · B♭1(34)@29/1 v86 · A1(33)@30/1 v84 · G1(31)@31/1 v96 |
| 3 | F1(29)@32/1 v112 · F1(29)@34/1 v84 · F2(41)@35/1 v96 · F1(29)@36/1 v112 · F1(29)@38/1 v84 · F2(41)@39/1 v96 · F1(29)@40/1 v112 · F1(29)@42/1 v84 · F2(41)@43/1 v96 · F1(29)@44/1 v112 · F1(29)@46/1 v84 · F2(41)@47/1 v96 |
| 4 | G1(31)@48/1 v112 · G1(31)@50/1 v90 · G2(43)@51/1 v100 · G1(31)@52/1 v112 · G1(31)@54/1 v90 · G2(43)@55/1 v100 · G1(31)@56/1 v112 · A1(33)@58/1 v90 · B1(35)@59/1 v100 · C2(36)@60/1 v112 · B1(35)@61/1 v86 · G1(31)@62/1 v90 · G♯1(32)@63/1 v100 |

*DK-12 Signal-Stab* (Lage F3–E4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | [A3(57) C4(60) E4(64)]@6/1 v100 · [A3(57) C4(60) E4(64)]@14/1 v92 |
| 2 | [A3(57) C4(60) E4(64)]@22/1 v100 · [A3(57) C4(60) E4(64)]@26/1 v90 · [A3(57) C4(60) E4(64)]@30/1 v96 |
| 3 | [F3(53) A3(57) C4(60)]@38/1 v100 · [F3(53) A3(57) C4(60)]@46/1 v92 |
| 4 | [G3(55) B3(59) D4(62)]@50/1 v96 · [G3(55) B3(59) D4(62)]@54/1 v100 · [G3(55) B3(59) D4(62)]@58/1 v104 · [G3(55) B3(59) D4(62)]@60/4 v110 |

*DK-14 Maschinenhalle-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x.......x.x..... / x.......x.x..... / x.......x.x..... / x.......x.x.x...` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......x.x.` |
| HH | `..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x.` |
| PERC | `...............x / .......x.......x / ...............x / .......x...x...x` |

**Warum unbedenklich:** Galopp-Bass auf Grundton/Oktave (P1) über Am–Am–F–G, Stabs als Dreiklänge auf Offbeats, Lauf in Takt 4 ist eine Tonleiter zum Grundton. Kein Riff eines Titels. Wiedererkennbar: Galopp, Offbeat-Stabs, Gate-Snare, Metall.
**Kartentext:** „Galopp-Bass, kurze Offbeat-Stabs, Metall und Gate-Snare – erinnert an belgische EBM der 80er (Stil: Front 242).“

---

### 5.5 Nitzer Ebb (EBM, England)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Aus Essex (Chelmsford), Anfang der 1980er; Douglas McCarthy, Bon Harris, David Gooday; Label Mute | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Nitzer_Ebb (nicht abgerufen) |
| „Join in the Chant“ (1987, Album „That Total Age“) | UNBELEGT (eK) | – |
| Live- und Studio-Perkussion auf Metall (Fässer, Bleche) | UNBELEGT (eK, unsicher) | – |
| Konkrete Synthesizer | UNBELEGT (nicht recherchiert) | §9 |

**Typisch (UNBELEGT, eK):** 120–135 BPM, ein Akkord über viele Takte (Orgelpunkt), Dauer-16tel-Bass mit Oktavsprüngen (P2), harte gerade Kick, Klatschen statt Snare, wenig bis keine Flächen, Sprech-/Ruf-Gesang. Minimalismus: oft nur Bass, Drums, Perkussion, Stimme.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-15 | **Drill-Bass** | Bass · C2–G3 | VA | Puls 50 % + Säge (Pegel 0,5), LP24 380 Hz Res 45 %, Keytrack 30 %, Filter-Hk +36 HT A 1 ms D 0,06 S 0 R 0,04, Anschlag → Filter-Hk +55 %, Amp A 1 ms D 0,12 S 50 % R 0,03, mono, Reset an, Spur-Drive 30 %, Hall 0 |
| DK-16 | **Blechfass-Perc** | Perc (Pad) | Drum ev3 | PERC Charakter GLOCKE, TON 420 Hz, VERHÄLTNIS 2,76 (unharmonisch), DECAY 0,09 s, FARBE dunkel, + Schicht RAUSCHEN 20 %, Pad-Drive 40 %, Raum 20 % |
| DK-17 | **Exerzier-Kit** | Drums | Drum ev3 | KICK TON 48 Hz PUNCH 24 HT DECAY 0,32 KLICK 40 % BISS 25 % ART HOLZ DRIVE 45 %; CLAP HÄNDE 4 ABSTAND 9 ms AUSKLANG 0,25 RAUM 30 %; PERC = DK-16; ohne Hats (Variante „mit Hats“: HH ZU METALL 55 % DECAY 15 ms, für §5.8) |

#### Hörprobe (ENTWURF) NE „Drillplatz“ · 128 BPM · e-Moll · 4 Takte = 7,5 s · Akkorde `Em | Em | Em G | C D`

*DK-15 Drill-Bass* (Lage C2–G3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | E2(40)@0/1 v112 · E2(40)@1/1 v78 · E3(52)@2/1 v96 · E2(40)@3/1 v80 · E2(40)@4/1 v112 · E2(40)@5/1 v78 · E3(52)@6/1 v96 · E2(40)@7/1 v80 · E2(40)@8/1 v112 · E2(40)@9/1 v78 · E3(52)@10/1 v96 · E2(40)@11/1 v80 · E2(40)@12/1 v112 · E2(40)@13/1 v78 · E3(52)@14/1 v96 · E2(40)@15/1 v80 |
| 2 | E2(40)@16/1 v112 · E2(40)@17/1 v80 · E3(52)@18/1 v96 · E2(40)@19/1 v84 · E2(40)@20/1 v112 · E2(40)@21/1 v80 · E3(52)@22/1 v96 · E2(40)@23/1 v84 · E2(40)@24/1 v112 · F2(41)@25/1 v80 · E2(40)@26/1 v96 · E3(52)@27/1 v84 · E2(40)@28/1 v112 · E3(52)@29/1 v80 · D3(50)@30/1 v96 · B2(47)@31/1 v84 |
| 3 | E2(40)@32/1 v112 · E2(40)@33/1 v78 · E3(52)@34/1 v96 · E2(40)@35/1 v80 · E2(40)@36/1 v112 · E2(40)@37/1 v78 · E3(52)@38/1 v96 · E2(40)@39/1 v80 · G2(43)@40/1 v112 · G2(43)@41/1 v78 · G3(55)@42/1 v96 · G2(43)@43/1 v80 · G2(43)@44/1 v112 · G3(55)@45/1 v78 · F♯2(42)@46/1 v96 · D2(38)@47/1 v80 |
| 4 | C2(36)@48/1 v112 · C2(36)@49/1 v80 · C3(48)@50/1 v98 · C2(36)@51/1 v84 · C2(36)@52/1 v112 · C2(36)@53/1 v80 · C3(48)@54/1 v98 · C2(36)@55/1 v84 · D2(38)@56/1 v112 · D2(38)@57/1 v80 · D3(50)@58/1 v98 · D2(38)@59/1 v84 · D2(38)@60/1 v120 · D3(50)@61/1 v88 · D2(38)@62/1 v106 · D♯2(39)@63/1 v92 |

*DK-17 Exerzier-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x...x...x...x... / x...x...x...x... / x...x...x...x... / x...x...x...x...` |
| CLAP | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......xxxx` |
| PERC | `..x...x...x...x. / ..x...x...x...x. / ..x...x...x...xx / ..x...x.x.x...x.` |

**Warum unbedenklich:** Grundton-Oktav-16tel (P2) über einem e-Moll-Orgelpunkt, Halbton-Nebennote F, chromatischer Anlauf D–D♯–E. Diese Bausteine sind Gemeingut. Wiedererkennbar: der unerbittliche 16tel-Drill mit Akzent-Bellen, Metall auf den Offbeats, Klatschen.
**Kartentext:** „Bellender 16tel-Oktavbass, harte Kick, Klatschen und geschlagenes Blech – erinnert an britische EBM der späten 80er (Stil: Nitzer Ebb).“

---

### 5.6 DAF (Deutsch Amerikanische Freundschaft)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Düsseldorf, Ende der 1970er; Gabi Delgado-López (Gesang), Robert Görl (Synthesizer, Schlagzeug) | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://de.wikipedia.org/wiki/Deutsch_Amerikanische_Freundschaft (nicht abgerufen) |
| Produziert von Conny Plank; Alben „Alles ist gut“, „Gold und Liebe“ (1981), „Für immer“ (1982) | UNBELEGT (eK, ziemlich sicher) | – |
| Sequenzen vom **Korg MS-20**, gesteuert vom **Korg SQ-10** | UNBELEGT (eK; oft genannt, aber in diesem Lauf nicht geprüft – im nächsten Lauf **zuerst** prüfen) | §9 |
| Schlagzeug von Görl gespielt (nicht nur Drumcomputer) | UNBELEGT (eK, unsicher) | – |

**Geräte-Wissen für das Rezept (UNBELEGT, eK):** MS-20: einstimmig, zwei Oszillatoren, **Hochpass und Tiefpass hintereinander**, beide mit Resonanz („Peak“), aggressiv beim Aufdrehen. SQ-10: Step-Sequenzer mit Reihen zu 12 Schritten, Schritte frei kürzbar. Die Kette wird oft live über die Tonhöhe verschoben.
**Typisch (UNBELEGT, eK):** 120–140 BPM, ein Sequenzmuster über Takte hinweg, verschoben auf andere Grundtöne, trockenes, gespieltes Schlagzeug mit Tom-Fills, kaum Akkorde, kaum Flächen, Sprechgesang.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-18 | **Stufen-Sequenz** | Bass/Sequenz · G1–D3 | VA | nur Säge (Osz. 1), LP24 650 Hz Res 55 %, Keytrack 40 %, Bass-Ausgleich 60 %, Filter-Hk +30 HT A 1 ms D 0,1 S 10 % R 0,05, Anschlag → Filter-Hk +40 %, Amp A 1 ms D 0,2 S 70 % R 0,05, mono, Reset an, Analog 0,25, Spur-Drive 20 %, Hall 0,05. **Lücke:** Der Hochpass vor dem Tiefpass fehlt (§6) |
| DK-19 | **Handkasten-Kit** | Drums | Drum ev3 | KICK TON 62 Hz PUNCH 8 HT DECAY 0,35 KLICK 25 % DRIVE 0; SNARE TON 210 Hz KÖRPER 55 % SNAPPY 45 % AUSKLANG 0,22, Raum 0,8 s; HH ZU METALL 40 % DECAY 40 ms VARIATION 0,6; TOM TON 140/110/85 Hz DECAY 0,45 FELL 40 %; **DYN 18 dB** (mehr Spiel-Dynamik, „gespielt“ statt Maschine) |

#### Hörprobe (ENTWURF) DAF „Stufenmarsch“ · 130 BPM · a-Moll · 4 Takte = 7,4 s · Akkorde `A5 | D5 | A5 | G5 C5`

*DK-18 Stufen-Sequenz* (Lage G1–D3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | A1(33)@0/1 v112 · A1(33)@1/1 v76 · A2(45)@2/1 v92 · A1(33)@3/1 v76 · C2(36)@4/1 v112 · A1(33)@5/1 v76 · E2(40)@6/1 v92 · G2(43)@7/1 v76 · A1(33)@8/1 v112 · A1(33)@9/1 v76 · A2(45)@10/1 v92 · A1(33)@11/1 v76 · C2(36)@12/1 v112 · A1(33)@13/1 v76 · E2(40)@14/1 v92 · G2(43)@15/1 v76 |
| 2 | D2(38)@16/1 v112 · D2(38)@17/1 v76 · D3(50)@18/1 v92 · D2(38)@19/1 v76 · F2(41)@20/1 v112 · D2(38)@21/1 v76 · A2(45)@22/1 v92 · C3(48)@23/1 v76 · D2(38)@24/1 v112 · D2(38)@25/1 v76 · D3(50)@26/1 v92 · D2(38)@27/1 v76 · F2(41)@28/1 v112 · D2(38)@29/1 v76 · A2(45)@30/1 v92 · C3(48)@31/1 v76 |
| 3 | A1(33)@32/1 v112 · A1(33)@33/1 v76 · A2(45)@34/1 v92 · A1(33)@35/1 v76 · C2(36)@36/1 v112 · A1(33)@37/1 v76 · E2(40)@38/1 v92 · G2(43)@39/1 v76 · A1(33)@40/1 v112 · A1(33)@41/1 v76 · A2(45)@42/1 v92 · A1(33)@43/1 v76 · C2(36)@44/1 v112 · A1(33)@45/1 v76 · E2(40)@46/1 v92 · A2(45)@47/1 v76 |
| 4 | G1(31)@48/1 v112 · G1(31)@49/1 v78 · G2(43)@50/1 v94 · G1(31)@51/1 v80 · B♭1(34)@52/1 v112 · G1(31)@53/1 v78 · D2(38)@54/1 v94 · F2(41)@55/1 v80 · C2(36)@56/1 v112 · C2(36)@57/1 v78 · C3(48)@58/1 v94 · C2(36)@59/1 v80 · E♭2(39)@60/1 v112 · C2(36)@61/1 v78 · G2(43)@62/1 v94 · B♭2(46)@63/1 v80 |

*DK-19 Handkasten-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x.....x.x....... / x.....x.x....... / x.....x.x.....x. / x.....x.x.......` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x...........` |
| HH | `x.x.x.x.x.x.x.x. / x.x.x.x.x.x.x.x. / x.x.x.x.x.x.x.x. / x.x.x.x.........` |
| TOM | `................ / ................ / ................ / ........xx.xx.xx` |

**Warum unbedenklich:** Die 8-Schritt-Kette (P5) besteht aus Grundton, Oktave, kleiner Terz, Quinte und kleiner Septime – dem a-Moll-Septakkord. Takt 2 und 4 sind dieselbe Kette, nur transponiert. Wiedererkennbar: Kette + Transponieren + trockenes Spiel-Schlagzeug. **Passt perfekt zu SYNQUENZER:** Xander hält ⇅ TRANSPONIEREN und spielt die Grundtöne – genau so entsteht der Stil.
**Kartentext:** „Eine Sequenzer-Kette, live auf andere Töne geschoben, dazu trockenes Schlagzeug – erinnert an frühe deutsche Elektronik um 1981 (Stil: DAF).“

---

### 5.7 Skinny Puppy (Industrial / Electro-Industrial, Kanada)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Vancouver, 1982; cEvin Key, Nivek Ogre; ab Mitte der 1980er Dwayne Goettel; Produzent Dave „Rave“ Ogilvie; Label Nettwerk | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Skinny_Puppy (nicht abgerufen) |
| Hörbild: viele Samples (Film-Dialoge, Geräusche), verzerrte Stimme, verstimmte analoge Bässe, unruhige, gebrochene Rhythmen, Lärm-Schichten | UNBELEGT (eK) | – |
| Konkrete Geräte | UNBELEGT (nicht recherchiert) | §9 |

**Typisch (UNBELEGT, eK):** 95–125 BPM, Moll/atonal, synkopierte Bässe mit Rutschern, Geräusch-Atmos, metallische, verhallte Snare, unregelmäßige Hats, wenig klassische Melodie.
**Grenze:** Der Sample-Anteil ist **nicht nachbildbar** (kein Sampler, und fremde Samples wären ohnehin tabu). Die Rezepte treffen die synthetische Seite.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-20 | **Rostbass** | Bass · C2–F3 | VA | 2 Sägen ±18 ct + Rauschen 12 %, LP24 520 Hz Res 30 %, Filter-Hk +24 HT D 0,14 S 20 %, LFO 1 S&H 8 Hz → Cutoff ±6 HT, Amp A 1 ms D 0,3 S 70 % R 0,08, Legato, Glide 25 ms, Analog 0,4, Spur-Drive 50 %, Echo 1/16 12 %, Hall 1 s 0,1 |
| DK-21 | **Störfunk-Atmo** | Atmo · ein Ton | VA | Rauschen 100 % + Puls 10 % leise, BP12 1,2 kHz Res 55 %, LFO 1 S&H 6 Hz → Cutoff ±24 HT, LFO 2 Dreieck 0,15 Hz → Pan ±60 %, Amp A 0,5 S 100 % R 1,5, Spur-Drive 35 %, Echo 1/8. 35 %, Hall 5 s 0,5 (anders als N44 Presslufthammer und A.1 #10 Sirene: zufällige Sprünge statt Gleiten) |
| DK-22 | **Splitter-Kit** | Drums | Drum ev3 | KICK TON 46 Hz PUNCH 18 HT DECAY 0,4 BISS 35 % ART KNALL DRIVE 60 %; SNARE TON 240 Hz PEITSCHE 60 %, Schlag-Filter BP 1,5 kHz Res 40 %, Kit-Raum 3 s mit Gate 220 ms; HH ZU METALL EXTREM, FM 50 %, DECAY 30 ms, VARIATION 0,8 |
| DK-23 | **Klage-Fläche** | Fläche · E3–D♭4 | WT | Tabelle `vocal` Pos 0,15 Scan +0,5 in 4 s, LP24 1,8 kHz Res 15 %, LFO 1 Sinus 0,3 Hz → Tonhöhe ±0,2 HT (Band-Leiern), Amp A 0,8 S 100 % R 2,5, Poly 6, Chorus ENS 40 %, Hall 6 s 0,45 |

#### Hörprobe (ENTWURF) SP „Rostfunk“ · 120 BPM · f-Moll · 4 Takte = 8,0 s · Akkorde `Fm | Fm | Db | C`

*DK-20 Rostbass* (Lage C2–F3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | F2(41)@0/3 v110 · F2(41)@3/1 v80 · F3(53)@6/2 v96 · F2(41)@8/1 v100 · C3(48)@10/3 v90 · E♭3(51)@14/2 v86 |
| 2 | F2(41)@16/3 v110 · G♭2(42)@19/1 v84 · F2(41)@22/2 v92 · F3(53)@24/1 v100 · F2(41)@26/3 v90 · C3(48)@30/1 v86 · D♭3(49)@31/1 v90 |
| 3 | D♭2(37)@32/3 v110 · D♭2(37)@35/1 v80 · D♭3(49)@38/2 v96 · D♭2(37)@40/1 v100 · A♭2(44)@42/3 v90 · G♭2(42)@46/2 v86 |
| 4 | C2(36)@48/3 v112 · C2(36)@51/1 v82 · C3(48)@54/2 v98 · C2(36)@56/1 v100 · G2(43)@58/2 v94 · B♭2(46)@60/2 v98 · E2(40)@62/2 v104 |

*DK-23 Klage-Fläche* (Lage E3–Db4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | [F3(53) A♭3(56) C4(60)]@0/32 v66 |
| 2 |  |
| 3 | [F3(53) A♭3(56) D♭4(61)]@32/16 v68 |
| 4 | [E3(52) G3(55) C4(60)]@48/16 v70 |

*DK-21 Störfunk-Atmo* (Lage F4–F4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | F4(65)@0/64 v64 |
| 2 |  |
| 3 |  |
| 4 |  |

*DK-22 Splitter-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x......x..x..... / x......x..x..... / x......x..x..... / x......x..x...x.` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......x.xx` |
| HH | `..xx..x....x..xx / ..xx..x....x..xx / ..xx..x....x..x. / ..xx..x....x....` |

**Warum unbedenklich:** Synkopierter Bass aus Grundton, Oktave, Quinte, ♭7 und der Nebennote G♭ über Fm–D♭–C, Fläche als liegende Dreiklänge, Atmo als ein einziger Rauschton. Wiedererkennbar: Rost-Klang, Zufalls-Rauschen, gebrochener Groove.
**Kartentext:** „Verstimmter Rost-Bass, Störfunk-Rauschen, verhallte Metall-Snare – erinnert an kanadischen Electro-Industrial der 80er (Stil: Skinny Puppy).“

---

### 5.8 Leæther Strip (Dark Electro / EBM, Dänemark)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Soloprojekt von Claus Larsen, Dänemark, Ende der 1980er; frühe Veröffentlichungen beim deutschen Label Zoth Ommog | UNBELEGT (eK, Label unsicher) | Prüf-Start: https://en.wikipedia.org/wiki/Le%C3%A6ther_Strip (nicht abgerufen) |
| Hörbild: harte EBM-Bässe, melancholische Streicherflächen, Fanfaren-Stabs, verzerrte Stimme | UNBELEGT (eK) | – |
| Konkrete Geräte | UNBELEGT | §9 |

**Typisch (UNBELEGT, eK):** 120–135 BPM, Moll mit Dur-Dominante (harmonisch Moll), Offbeat-Roll-Bass (P3), Four-on-the-Floor, Streicher + Stab-Melodie im Refrain.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-24 | **Kaltkörper-Bass** | Bass · G1–D3 | VA | Säge + Puls 30 % (Pegel 0,5), LP24 360 Hz Res 40 %, Filter-Hk +32 HT D 0,08 S 0, Anschlag → Filter-Hk +45 %, Amp A 1 ms D 0,1 S 40 % R 0,03, mono, Reset an, Spur-Drive 30 %, Pumpen 35 %, Hall 0 |
| DK-25 | **Trauer-Streicher** | Fläche · C♯4–B♭4 | VA | 2 Sägen ±10 ct + Säge +1 Okt 25 %, LP12 2,6 kHz Res 8 %, Amp A 0,5 S 100 % R 2, Poly 6, Vibrato verzögert 0,8 s 5 Hz ±8 ct, Chorus ENS 55 %, Hall 5 s 0,45 |
| DK-26 | **Fanfaren-Stab** | Lead/Stab · F4–G5 | VA | 2 Sägen ±7 ct, LP24 1,2 kHz Res 20 %, Filter-Hk +36 HT A 15 ms D 0,25 S 35 %, Amp A 3 ms D 0,3 S 70 % R 0,2, Poly 4, Spur-Drive 20 %, Echo 1/8 15 %, Hall 2 s 0,25 |
| Kit | DK-17 Exerzier-Kit, Variante „mit Hats“ | | | |

#### Hörprobe (ENTWURF) LS „Kältekammer“ · 128 BPM · d-Moll · 4 Takte = 7,5 s · Akkorde `Dm | Bb | Gm | A`

*DK-24 Kaltkörper-Bass* (Lage G1–D3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | D2(38)@1/1 v100 · D3(50)@2/1 v84 · D2(38)@3/1 v92 · D2(38)@5/1 v100 · D3(50)@6/1 v84 · D2(38)@7/1 v92 · D2(38)@9/1 v100 · D3(50)@10/1 v84 · D2(38)@11/1 v92 · D2(38)@13/1 v100 · F2(41)@14/1 v84 · A2(45)@15/1 v92 |
| 2 | B♭1(34)@17/1 v100 · B♭2(46)@18/1 v84 · B♭1(34)@19/1 v92 · B♭1(34)@21/1 v100 · B♭2(46)@22/1 v84 · B♭1(34)@23/1 v92 · B♭1(34)@25/1 v100 · B♭2(46)@26/1 v84 · B♭1(34)@27/1 v92 · B♭1(34)@29/1 v100 · B♭2(46)@30/1 v84 · B♭1(34)@31/1 v92 |
| 3 | G1(31)@33/1 v100 · G2(43)@34/1 v84 · G1(31)@35/1 v92 · G1(31)@37/1 v100 · G2(43)@38/1 v84 · G1(31)@39/1 v92 · G1(31)@41/1 v100 · G2(43)@42/1 v84 · G1(31)@43/1 v92 · G1(31)@45/1 v100 · B♭1(34)@46/1 v84 · D2(38)@47/1 v92 |
| 4 | A1(33)@49/1 v102 · A2(45)@50/1 v88 · A1(33)@51/1 v96 · A1(33)@53/1 v102 · A2(45)@54/1 v88 · A1(33)@55/1 v96 · A1(33)@57/1 v102 · A2(45)@58/1 v88 · G2(43)@59/1 v96 · E2(40)@61/1 v102 · C♯2(37)@62/1 v88 · A1(33)@63/1 v96 |

*DK-25 Trauer-Streicher* (Lage C#4–Bb4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | [D4(62) F4(65) A4(69)]@0/16 v68 |
| 2 | [D4(62) F4(65) B♭4(70)]@16/16 v68 |
| 3 | [D4(62) G4(67) B♭4(70)]@32/16 v70 |
| 4 | [C♯4(61) E4(64) A4(69)]@48/16 v74 |

*DK-26 Fanfaren-Stab* (Lage F4–G5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | D5(74)@0/3 v110 · C5(72)@3/3 v96 · A4(69)@6/2 v100 · E5(76)@8/2 v104 · D5(74)@10/2 v96 · A4(69)@12/4 v100 |
| 2 | D5(74)@16/3 v110 · D5(74)@19/3 v96 · F5(77)@22/2 v104 · G5(79)@24/4 v110 · F5(77)@28/2 v98 · D5(74)@30/2 v96 |
| 3 | B♭4(70)@32/3 v108 · B♭4(70)@35/3 v94 · D5(74)@38/2 v100 · G5(79)@40/4 v110 · F5(77)@44/2 v98 · D5(74)@46/2 v96 |
| 4 | E5(76)@48/4 v108 · C♯5(73)@52/4 v102 · A4(69)@56/2 v98 · C♯5(73)@58/2 v102 · E5(76)@60/4 v112 |

*DK-17 Exerzier-Kit (mit Hats)* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x...x...x...x... / x...x...x...x... / x...x...x...x... / x...x...x...x...` |
| CLAP | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......x.xx` |
| HH | `..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x.` |

**Warum unbedenklich:** Offbeat-Roll (P3) auf Grundton/Oktave mit Dreiklangs-Aufgängen, Streicher in Grundstellung über Dm–B♭–Gm–A (harmonisch Moll, Allerwelt), Stab-Melodie aus Akkordtönen mit Leitton C♯. Wiedererkennbar: Roll-Bass + Trauerflächen + Fanfare.
**Kartentext:** „Rollender Offbeat-Bass, traurige Streicher, Fanfaren-Stabs – erinnert an dänischen Dark Electro der 90er (Stil: Leæther Strip).“

---

### 5.9 Suicide Commando (Dark Electro → Aggrotech, Belgien)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Soloprojekt von Johan Van Roy, Belgien, seit Mitte der 1980er | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Suicide_Commando (nicht abgerufen) |
| **Nicht verwechseln:** R6 schreibt, Kirlian Camera sei 1979 in Parma „als ‚Suicide Commando‘“ gegründet worden (SE). Das wäre ein anderer, italienischer Act. | R6-Angabe WAHRSCHEINLICH (ein SE), Zusammenhang hier UNBELEGT | R6 §1; §7 KD-4 |
| Hörbild: harte, verzerrte Bässe, schneidende Leads, Horror-Samples, verzerrte Stimme; später stärker Club/Aggrotech | UNBELEGT (eK) | – |

**Typisch (UNBELEGT, eK):** 128–145 BPM, c-/f-/g-Moll, Offbeat-Roll gerade (P3b), Four-on-the-Floor mit 16tel-Hats, Stakkato-Riffs, Crash auf Teilanfängen.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-27 | **Sezierbass** | Bass · G1–C3 | VA | Säge + Säge +5 ct, Sub Sinus 40 %, LP24 300 Hz Res 40 %, Filter-Hk +38 HT D 0,07 S 0, Anschlag → Filter-Hk +50 %, Amp A 1 ms D 0,11 S 50 % R 0,03, mono, Reset an, Spur-Drive 55 %, Pumpen 50 % |
| DK-28 | **Skalpell-Lead** | Lead · B4–A♭5 | VA | Säge Uni 5 (Verst. 35 %, Breite 90 %) + Puls 20 % +1 Okt 30 %, LP24 4,5 kHz Res 15 %, Filter-Hk +12 HT D 0,12 S 60 %, Amp A 1 ms D 0,15 S 75 % R 0,12, Poly 2, Spur-Drive 35 %, Echo 1/8. 20 %, Hall 1,8 s 0,22 |
| DK-29 | **Alarm-Arp** | Sequenz · C5–C6 | VA | Puls 12 %, LP24 3 kHz Res 50 %, Filter-Hk +18 HT D 0,05 S 0, Amp A 1 ms D 0,08 S 0, mono, Echo 1/16 25 %, Hall 1 s 0,15 (nur „mit Band“, nicht in der Hörprobe) |
| DK-30 | **Seziertisch-Kit** | Drums | Drum ev3 | KICK TON 50 Hz PUNCH 26 HT DECAY 0,26 KLICK 50 % BISS 40 % ART HOLZ DRIVE 65 %; SNARE TON 230 Hz SNAPPY 75 % + CLAP HÄNDE 3 RAUM 0,5 s; HH ZU METALL 70 % DECAY 12 ms; BECKEN DECAY 1,2 s |

#### Hörprobe (ENTWURF) SC „Schnittfolge“ · 136 BPM · c-Moll · 4 Takte = 7,1 s · Akkorde `Cm | Cm | Ab | G`

*DK-27 Sezierbass* (Lage G1–C3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | C2(36)@1/1 v104 · C2(36)@2/1 v86 · C3(48)@3/1 v96 · C2(36)@5/1 v104 · C2(36)@6/1 v86 · C3(48)@7/1 v96 · C2(36)@9/1 v104 · C2(36)@10/1 v86 · C3(48)@11/1 v96 · C2(36)@13/1 v104 · C2(36)@14/1 v86 · C3(48)@15/1 v96 |
| 2 | C2(36)@17/1 v104 · C2(36)@18/1 v88 · C3(48)@19/1 v98 · C2(36)@21/1 v104 · C2(36)@22/1 v88 · C3(48)@23/1 v98 · C2(36)@25/1 v104 · C2(36)@26/1 v88 · C3(48)@27/1 v98 · E♭2(39)@29/1 v104 · D2(38)@30/1 v88 · B1(35)@31/1 v98 |
| 3 | A♭1(32)@33/1 v104 · A♭1(32)@34/1 v86 · A♭2(44)@35/1 v96 · A♭1(32)@37/1 v104 · A♭1(32)@38/1 v86 · A♭2(44)@39/1 v96 · A♭1(32)@41/1 v104 · A♭1(32)@42/1 v86 · A♭2(44)@43/1 v96 · A♭1(32)@45/1 v104 · A♭1(32)@46/1 v86 · A♭2(44)@47/1 v96 |
| 4 | G1(31)@49/1 v106 · G1(31)@50/1 v90 · G2(43)@51/1 v100 · G1(31)@53/1 v106 · G1(31)@54/1 v90 · G2(43)@55/1 v100 · G1(31)@57/1 v106 · G1(31)@58/1 v90 · G2(43)@59/1 v100 · G1(31)@61/1 v106 · B1(35)@62/1 v90 · D2(38)@63/1 v100 |

*DK-28 Skalpell-Lead* (Lage B4–Ab5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | C5(72)@0/1 v110 · C5(72)@2/1 v96 · E♭5(75)@3/1 v100 · G5(79)@4/2 v112 · F5(77)@6/1 v96 · E♭5(75)@7/1 v94 · D5(74)@8/2 v100 · E♭5(75)@10/2 v98 · C5(72)@12/4 v104 |
| 2 | C5(72)@16/1 v110 · C5(72)@18/1 v96 · E♭5(75)@19/1 v100 · G5(79)@20/2 v112 · A♭5(80)@22/2 v114 · G5(79)@24/4 v108 · E♭5(75)@28/2 v98 · D5(74)@30/2 v96 |
| 3 | C5(72)@32/1 v110 · C5(72)@34/1 v96 · E♭5(75)@35/1 v100 · A♭5(80)@36/2 v114 · G5(79)@38/1 v100 · F5(77)@39/1 v96 · E♭5(75)@40/4 v106 · C5(72)@44/4 v100 |
| 4 | B4(71)@48/2 v104 · D5(74)@50/2 v104 · G5(79)@52/2 v112 · F5(77)@54/2 v100 · E♭5(75)@56/2 v98 · D5(74)@58/2 v100 · B4(71)@60/4 v108 |

*DK-30 Seziertisch-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x...x...x...x... / x...x...x...x... / x...x...x...x... / x...x...x...x.x.` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......xxxx` |
| HH | `xxxxxxxxxxxxxxxx / xxxxxxxxxxxxxxxx / xxxxxxxxxxxxxxxx / xxxxxxxxxxxx....` |
| CRASH | `x............... / ................ / x............... / ................` |

**Warum unbedenklich:** Bass = P3b auf Grundton/Oktave über Cm–A♭–G mit Tonleiter-Anlauf, Lead = c-Moll-Dreiklang aufwärts mit Durchgängen (Allerweltsfigur des Genres). Wiedererkennbar: Zerr-Roll + Stakkato-Lead + harter Kick.
**Kartentext:** „Verzerrter Roll-Bass, schneidender Stakkato-Lead, harter Club-Kick – erinnert an belgischen Dark Electro/Aggrotech (Stil: Suicide Commando).“

---

### 5.10 Agonoize (Aggrotech, Berlin) – nur Verweis

Siehe `vorbild-coldwave2.md` §3.3: Fakten (BELEGT/WAHRSCHEINLICH aus SE), C2-09 Höllensäge-Lead, C2-10 Stampf-Bass, C2-11 Alarm-Metall FM, C2-12 Höllenmaschine-Kit, Hörprobe „Funkenregen“ (140 BPM, f-Moll, 4/8 Takte). Hier keine neuen Sounds (Doppelungen vermeiden). Abgrenzung zu den Nachbarn in dieser Datei (ENTWURF): Agonoize-Sounds = Supersaw-Stakkato über Roll-Bass neben der Kick; DK-28 (Suicide Commando) ist schmaler und gestoßener; DK-32 (Hocico) hat eine Unteroktave und einen Tonhöhen-Ansatz.

---

### 5.11 Hocico (Aggrotech / Dark Electro, Mexiko)

**Fakten**

| Aussage | Status | Quelle |
|---|---|---|
| Mexiko-Stadt, 1993; die Cousins Erk Aicrag (Gesang) und Racso Agroyam (Musik); Label Out of Line | UNBELEGT (eK, ziemlich sicher) | Prüf-Start: https://en.wikipedia.org/wiki/Hocico (nicht abgerufen) |
| Hörbild: sehr verzerrte Stimme, dichte Zerr-Bässe, Supersaw-Leads, Hymnen-Flächen, schnelle Club-Grooves | UNBELEGT (eK) | – |
| Konkrete Geräte | UNBELEGT | §9 |

**Typisch (UNBELEGT, eK):** 135–155 BPM, Moll, Hammer-Bass (P4) mit starkem Pumpen, Four-on-the-Floor, Offbeat-Hats offen, Refrain-Lead über Fläche, Crash auf Teilanfang.

**Kennklänge (ENTWURF)**

| Nr | Name | Rolle · Lage | Engine | Rezept |
|---|---|---|---|---|
| DK-31 | **Hassbass** | Bass · B1–G3 | VA | Säge Uni 3 (Verst. 15 %) + Puls 40 % −1 Okt (Pegel 0,5), LP24 380 Hz Res 30 %, Filter-Hk +34 HT D 0,09 S 10 %, Amp A 1 ms D 0,12 S 60 % R 0,04, mono, Reset an, Spur-Drive 60 %, Pumpen 60 % |
| DK-32 | **Schrei-Lead** | Lead · G4–A5 | VA | Säge Uni 7 (Verst. 50 %, Breite 100 %) + Säge −1 Okt 40 %, LP24 5 kHz Res 12 %, Hk 2 A 0 D 0,08 S 0 → Tonhöhe +1 HT (Route `menv → pitch` 0,042: kurzer Ansatz von oben), Amp A 2 ms D 0,3 S 85 % R 0,25, Legato, Glide 30 ms, Spur-Drive 40 %, Echo 1/8. 22 %, Hall 2,2 s 0,3 |
| DK-33 | **Glut-Fläche** | Fläche · A♯3–G4 | WT | Tabelle `digital` Pos 0,2 Scan +0,7 in 4 s, LP24 2,2 kHz Res 20 %, Amp A 0,6 S 100 % R 2,5, Poly 6, Spur-Drive 15 %, Chorus ENS 40 %, Hall 6 s 0,5 |
| DK-34 | **Glutofen-Kit** | Drums | Drum ev3 | KICK TON 47 Hz PUNCH 28 HT DECAY 0,3 KLICK 45 % BISS 45 % ART KNALL DRIVE 75 %; SNARE TON 240 Hz SNAPPY 80 % PEITSCHE 50 % RAUM 0,6 s; HH OFFEN METALL 60 % DECAY 90 ms; BECKEN 1,5 s |

#### Hörprobe (ENTWURF) HO „Glutsturm“ · 145 BPM · h-Moll · 4 Takte = 6,6 s · Akkorde `Bm | G | Em | F#`

*DK-31 Hassbass* (Lage B1–G3):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | B1(35)@0/1 v112 · B1(35)@1/1 v82 · B1(35)@2/1 v88 · B2(47)@3/1 v98 · B1(35)@4/1 v112 · B1(35)@5/1 v82 · B1(35)@6/1 v88 · B2(47)@7/1 v98 · B1(35)@8/1 v112 · B1(35)@9/1 v82 · B1(35)@10/1 v88 · B2(47)@11/1 v98 · B1(35)@12/1 v112 · B2(47)@13/1 v82 · D3(50)@14/1 v88 · B2(47)@15/1 v98 |
| 2 | G2(43)@16/1 v112 · G2(43)@17/1 v82 · G2(43)@18/1 v88 · G3(55)@19/1 v98 · G2(43)@20/1 v112 · G2(43)@21/1 v82 · G2(43)@22/1 v88 · G3(55)@23/1 v98 · G2(43)@24/1 v112 · G2(43)@25/1 v82 · G2(43)@26/1 v88 · G3(55)@27/1 v98 · G2(43)@28/1 v112 · G2(43)@29/1 v82 · G2(43)@30/1 v88 · G3(55)@31/1 v98 |
| 3 | E2(40)@32/1 v112 · E2(40)@33/1 v82 · E2(40)@34/1 v88 · E3(52)@35/1 v98 · E2(40)@36/1 v112 · E2(40)@37/1 v82 · E2(40)@38/1 v88 · E3(52)@39/1 v98 · E2(40)@40/1 v112 · E2(40)@41/1 v82 · E2(40)@42/1 v88 · E3(52)@43/1 v98 · E2(40)@44/1 v112 · E3(52)@45/1 v82 · G2(43)@46/1 v88 · E3(52)@47/1 v98 |
| 4 | F♯2(42)@48/1 v114 · F♯2(42)@49/1 v86 · F♯2(42)@50/1 v92 · F♯3(54)@51/1 v100 · F♯2(42)@52/1 v114 · F♯2(42)@53/1 v86 · F♯2(42)@54/1 v92 · F♯3(54)@55/1 v100 · F♯2(42)@56/1 v114 · F♯3(54)@57/1 v86 · E3(52)@58/1 v92 · C♯3(49)@59/1 v100 · A♯2(46)@60/1 v114 · C♯3(49)@61/1 v86 · E3(52)@62/1 v92 · F♯3(54)@63/1 v100 |

*DK-32 Schrei-Lead* (Lage G4–A5):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | F♯5(78)@0/4 v110 · D5(74)@4/2 v98 · B4(71)@6/2 v96 · F♯5(78)@8/2 v104 · G5(79)@10/2 v106 · F♯5(78)@12/4 v108 |
| 2 | G5(79)@16/4 v110 · D5(74)@20/2 v98 · B4(71)@22/2 v96 · G5(79)@24/2 v104 · A5(81)@26/2 v112 · G5(79)@28/4 v106 |
| 3 | E5(76)@32/4 v108 · B4(71)@36/2 v96 · G4(67)@38/2 v94 · E5(76)@40/2 v102 · F♯5(78)@42/2 v104 · G5(79)@44/4 v108 |
| 4 | F♯5(78)@48/4 v112 · A♯4(70)@52/4 v104 · C♯5(73)@56/4 v106 · F♯5(78)@60/2 v110 · E5(76)@62/2 v104 |

*DK-33 Glut-Fläche* (Lage A#3–G4):

| Takt | Noten (Ton(MIDI)@Start/Länge in 16teln ab Takt 1, vAnschlag) |
|---|---|
| 1 | [B3(59) D4(62) F♯4(66)]@0/16 v64 |
| 2 | [B3(59) D4(62) G4(67)]@16/16 v64 |
| 3 | [B3(59) E4(64) G4(67)]@32/16 v66 |
| 4 | [A♯3(58) C♯4(61) F♯4(66)]@48/16 v70 |

*DK-34 Glutofen-Kit* (x = Schlag, 16 Schritte je Takt, Takte durch / getrennt):

| Pad | Muster |
|---|---|
| KICK | `x...x...x...x... / x...x...x...x... / x...x...x...x... / x...x...x...xxxx` |
| SNARE | `....x.......x... / ....x.......x... / ....x.......x... / ....x.......x...` |
| HH | `..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x. / ..x...x...x...x.` |
| CRASH | `x............... / ................ / ................ / ................` |

**Warum unbedenklich:** Hammer-Bass (P4) auf Grundton/Oktave über Bm–G–Em–F♯ (harmonisch Moll), Lead-Figur „lang – Dreiklang abwärts – Wechselnote – lang“ aus Akkordtönen, Fläche in enger Lage. Wiedererkennbar: Tempo, Pump-Wand, breiter Zerr-Lead über Hymnen-Fläche.
**Kartentext:** „Pumpender Zerr-Bass in 16teln, breiter Schrei-Lead, glühende Fläche – erinnert an mexikanischen Aggrotech (Stil: Hocico).“

---

### 5.12 Demo-Song-Baupläne (je Genre)

Alle Baupläne sind **ENTWURF**. Genre-Merkmale UNBELEGT (eK). Form für SYNQUENZER: Szenen = Teile, FANG fängt die Teile, Song-Modus reiht sie (Spec v3 + Runde 7/8). Akkorde je Takt; „×2“ = Teil zweimal.

#### D1 Cold Wave „Glasherbst“ (Stil: The Frozen Autumn, Static Movement, Clan of Xymox)

- **126 BPM, e-Moll.** Akkorde Strophe `Em | C | G | D` (i–VI–III–VII), Refrain `C | D | Em | Em` und `C | D | B | B` (Dur-Dominante als Wendung), Zwischenspiel `Am | Em | Am | B`.
- **Spuren:** Drums DK-04 · Bass DK-01 (trägt die Melodie) · Lead DK-02 · Arp A.1 #14 Herbstarp · Fläche DK-03 · Glas-Arp A.1 #12 (nur Refrain) · Chorus-Lead DK-06 (nur Zwischenspiel).
- **Ablauf (Takte):** Intro 8 (Arp + Fläche, Bass ab Takt 5) → Strophe 16 (Drums, Bass-Riff, Lead nur Antwortphrasen) → Refrain 16 (Lead-Hook, Glas-Arp, Fläche voll) → Zwischenspiel 8 (Bass-Riff allein mit Echo, dann Chorus-Lead) → Strophe 8 → Refrain 16 ×2 → Outro 8 (Arp allein, Hall-Fahne).
- **Erkennungsmerkmale:** hoher Chorus-Bass als Melodie; Achtel-Hats; Snare mit Raum; Echo-Lead; Moll mit Dur-Dominante im Refrain.

#### D2 EBM klassisch „Gleichschritt“ (Stil: DAF, Front 242, Nitzer Ebb)

- **124 BPM, a-Moll, Orgelpunkt.** Teil A `Am` ×8 Takte; Teil B `F | G | Am | Am`; Break `Am` mit gefiltertem Bass.
- **Spuren:** Drums DK-17 (A) / DK-14 (B) · Bass DK-15 (P2 Drill) in A, DK-11 (P1 Galopp) in B · Sequenz DK-18 (P5, transponiert) im Break · Stab DK-12 (B) · Metall DK-16 und N06 · Atmo DK-13 (Intro/Break).
- **Ablauf:** Intro 4 (Kick + Atmo) → A 16 (Bass + Kick + Klatschen, ab Takt 9 Metall) → B 8 (Galopp, Stabs, Ruf-Antwort-Platz für Sprechgesang) → A 16 → Break 8 (nur 8-Schritt-Kette, per ⇅ live auf D, G, C geschoben) → B 8 → A 16 → Ende hart auf Schlag 1.
- **Erkennungsmerkmale:** ein Akkord über lange Strecken; 16tel-Bass mit Akzent-Bellen; Klatschen statt Snare; Metall auf Offbeats; keine Flächen; Platz für Sprechgesang.

#### D3 Dark Electro / Industrial „Rostlicht“ (Stil: Skinny Puppy, Leæther Strip)

- **118 BPM, f-Moll.** Strophe `Fm | Fm | D♭ | C`, Refrain `D♭ | E♭ | Fm | C`, Mittelteil `Fm` ×4 mit P6 Halbton-Pendel, langsame Variante mit P7 Triolen-Galopp (optional 100 BPM).
- **Spuren:** Drums DK-22 · Bass DK-20 (Strophe), DK-24 (Refrain, P3) · Atmo DK-21 · Fläche DK-23 (Strophe) / DK-25 (Refrain) · Stab DK-26 (Refrain-Hook) · Industrial-Kit-Pads N43/N44 für Übergänge.
- **Ablauf:** Intro 8 (Atmo + Fläche, Kick ab Takt 5) → Strophe 16 (Rostbass, gebrochene Hats) → Refrain 16 (Roll-Bass, Streicher, Fanfaren-Stab) → Mittelteil 8 (Halbton-Pendel, nur Kick + Atmo) → Refrain 16 → Outro 8 (Atmo, Hall-Snare allein).
- **Erkennungsmerkmale:** verstimmt-raue Bässe; Rauschen mit Zufallssprüngen; verhallte Metall-Snare; Kontrast unruhige Strophe ↔ geordneter Refrain mit Streichern.

#### D4 Aggrotech „Glutwerk“ (Stil: Suicide Commando, Hocico, Agonoize)

- **140 BPM, c-Moll.** Strophe `Cm` ×4 (nur Bass + Kick + Stimme), Refrain `Cm | A♭ | E♭ | G` (Dur-Dominante), Break `A♭ | B♭ | Cm | Cm`.
- **Spuren:** Drums DK-34 (Refrain) / DK-30 (Strophe) · Bass DK-27 (P3b) / DK-31 (P4, Refrain) · Lead DK-28 (Strophe-Riff) / DK-32 oder C2-09 (Refrain-Hymne) · Fläche DK-33 · Arp DK-29 · Metall C2-11.
- **Ablauf:** Intro 8 (Fläche + Arp, Filter langsam auf; Snare-Wirbel Takt 7–8) → Refrain 16 (Crash, Hammer-Bass, Schrei-Lead über Fläche) → Strophe 16 (Roll-Bass, Kick, Skalpell-Riff alle 4 Takte) → Refrain 16 → Break 8 (nur Fläche + Lead ohne Drums, dann 4 Takte Wirbel) → Refrain 16 ×2 → Outro 4 (Crash, Hall-Fahne).
- **Erkennungsmerkmale:** schnelle 4/4-Kick mit hartem Klick; Bass pumpt gegen die Kick; Supersaw-Hymne im Refrain; Strophen sehr karg; Snare-Wirbel vor jedem Refrain.

---

## 6. Was SYNQUENZER für diesen Bereich (noch) nicht kann

| Lücke | Wofür (eK, UNBELEGT je Band) | Folge / Vorschlag |
|---|---|---|
| **Sampler / fremde Klänge** | Sprach-, Film- und Geräusch-Samples (Industrial, frühe EBM) | nicht nachbildbar; fremde Samples ohnehin tabu (§2). Ersatz: DK-13, DK-21 (Rausch-Atmos). Später: eigene Aufnahmen über Mikrofon (Priorität 3) |
| **Zweites Filter (HP vor LP)** | MS-20-Charakter (DAF) | DK-18 nur angenähert. Vorschlag: HP12 vor dem Hauptfilter als Option im VA (Klein, ein Biquad) |
| **Ringmodulator** | Synthex-Ringmod, Metall-Klänge | Ersatz: FM6-Metall (N06, C2-11) oder Drum-PERC mit unharmonischem VERHÄLTNIS |
| **Bitcrusher / Abtastraten-Reduktion** | Lo-Fi-Sampler-Härte | fehlt (schon in Vision §3.1 für Welle:Erdball genannt) |
| **Stimmen-Verzerrung** | verzerrter/tonhöhenverschobener Gesang (Aggrotech, Dark Electro) | erst mit Mikrofon (Priorität 3) + Spur-Drive |
| **FM-Hüllkurven** | Metall-Schläge (N06, C2-11) brauchen schnelle, kräftige Modulator-Hüllkurven | Xanders Befund Runde 9 („Katastrophe“, FM-Effekte zu schwach, Hüllkurve schneidet ab). Deshalb hier **keine neuen FM6-Rezepte**; die vorhandenen erst nach dem FM-Hüllkurven-Fix anhören |
| **Lage-Grenzen** | EBM-Bässe dürfen beim Transponieren nicht nach oben springen | Wunsch T (Runde 8). Die `range`-Werte je Sound in dieser Datei sind Rohmaterial dafür |

---

## 7. Korrekturen an früheren Dateien

| Nr | Datei / Stelle | bisher | richtig (nach Drei-Stufen-Schema) | Grund |
|---|---|---|---|---|
| **KD-1** | `SYNQUENZER-vision.md` §3.1 Zeile „Static Movement“, `r6/bibliothek-recherche.md` §1 und §11 (#15 „b“), Spec v3 A.1 #12 „PPG · belegt (SE, Vorrunde)“ und #13 „Elka Synthex · belegt (SE)“ | „belegt (SE)“ / „b“ | **WAHRSCHEINLICH** (ein Suchauszug) | Nur ein Suchauszug, Seite nie abgerufen. Die Quellenliste K10 nennt keine Static-Movement-eigene Quelle. Das Album „Visionary Landscapes (1999)“ hat denselben Status. ⓘ-Text: „Geräte laut einer Quelle: …“ |
| **KD-2** | Vision §3.1 „The Frozen Autumn“, R6 §1, R6 N29 „Eisglas-Keys · Kawai K4 (s)“, R6 §11 #14 „s“ | K4 „schwach belegt“ | **UNBELEGT** (Equipboard-Nutzerfoto ist laut Auftrag nur schwache Quelle; K1 nur Xanders Erinnerung) | ⓘ-Text von N29 ohne Gerätenamen als Tatsache; N29 = „K4-Lesart“, DK-02 = „K1-Lesart“ (§3.3) |
| **KD-3** | `fragen-xander-7.md`, Auftragstext („Ego noise … prüfen“) | unklar | **Agonoize** (BELEGT durch Xander, Runde 8) | §3.1 |
| **KD-4** | R6 §1 Kirlian Camera „1979 in Parma als ‚Suicide Commando‘ gegründet“ | ohne Hinweis | Angabe bleibt **WAHRSCHEINLICH** (ein SE), aber mit **Verwechslungs-Warnung**: Der Act `suicide-commando` in der Bibliothek ist das belgische Projekt (§5.9). Tags nie zusammenlegen, im ⓘ-Text von N17/N18 den alten Namen nicht erwähnen | Verwechslungsgefahr bei Filter „Vorbild ▾“ |
| **KD-5** | R6 §11 Genre-Tags | `industrial`, `electro-ebm`, `cold-wave`, `darkwave` … | ergänzen um **`ebm`**, **`dark-electro`**, **`aggrotech`** (`electro-ebm` bleibt als Alias) | Front 242/Nitzer Ebb/DAF (EBM), Skinny Puppy/Leæther Strip (Dark Electro/Electro-Industrial), Suicide Commando/Hocico/Agonoize (Aggrotech) sind in der Szene getrennte Schubladen (eK, UNBELEGT) |
| **KD-6** | R6 §7 Demo 3 „Cold Wave“: Drums N09 „Rhythmus-Box 78“ | N09 (CR-78-Stil, OMD) | **DK-04 Kaltkasten-Kit** | Nichts verbindet den CR-78-Stil mit Cold Wave; beides Einschätzung, aber DK-04 ist fürs Genre gebaut |
| **KD-7** | R6 §11 VORBILD | 16 + 6 Acts | **neu:** `clan-of-xymox`, `front-242`, `nitzer-ebb`, `daf`, `skinny-puppy`, `leaether-strip`, `suicide-commando`, `hocico` (dazu `agonoize` aus coldwave2). Belegstatus aller neuen: **u** (bis zum Lauf mit Netz) | Prüfliste A.4 (Namensprüfung) ergänzen um: MS-20, SQ-10, Synthex, K1, K4, „Electronic Body Music“ (eK: Begriff, keine Marke – prüfen) |

---

## 8. Rückfragen an Xander (kurz)

1. **„Radio Station“ bei Static Movement:** Wo hast du das gehört (Album, Video, Liedzeile)?
2. **Kawai K1 bei The Frozen Autumn:** Woher stammt die Info (Interview, Foto, Video)? Dann prüfen wir genau diese Quelle.
3. **Hocico und Suicide Commando:** Eher der ältere, düstere Dark-Electro-Sound (90er) oder der heutige Club-Aggrotech? Die Hörproben hier zielen auf den Club-Sound.
4. **Clan of Xymox:** Ist für dich der Chorus-**Bass** das Erkennungszeichen oder die Flächen?

---

## 9. Prüfauftrag für den nächsten Lauf mit Netz (≈ 30 Suchen)

Ziel: Jede UNBELEGT-Zeile in §3 und §5 auf BELEGT oder WAHRSCHEINLICH heben oder streichen. Reihenfolge nach Nutzen:

| # | Act | Frage | Suchanfragen (Vorschlag) | erwartete Quellentypen |
|---|---|---|---|---|
| 1 | DAF | MS-20 + SQ-10? Wer spielte Schlagzeug? Plank-Produktion | „DAF Görl MS-20 SQ-10 interview“, „Robert Görl synthesizer Conny Plank studio“ | Interviews (Electronic Sound, Groove, Spex), Korg-Artikel, Sound On Sound |
| 2 | Front 242 | Geräte 1984–88 (Synth, Sampler, Sequenzer), „Headhunter“-Produktion | „Front 242 Codenys Bressanutti equipment interview“, „Front 242 Headhunter how it was made“ | Keyboard/Keys-Interviews, Attack Magazine, Band-FAQ |
| 3 | Nitzer Ebb | Synths auf „That Total Age“/„Belief“, Metall-Perkussion | „Nitzer Ebb Bon Harris synth gear interview“, „Nitzer Ebb Join in the Chant recording“ | Electronic Sound, MusicRadar, Mute-Material |
| 4 | Skinny Puppy | cEvin Keys Geräte (Synths, Sampler, Drumcomputer) | „cEvin Key gear interview synthesizers samplers“ | Keyboard, Future Music, Interviews (Synthtopia, Reverb) |
| 5 | The Frozen Autumn | K1/K4, weitere Geräte, Bandfakten | „The Frozen Autumn Diego Merletto synth interview“, „Frozen Autumn Kawai“ | Band-Bio (abrufen!), Szene-Interviews (Side-Line, Peek-a-Boo, Reflections of Darkness) |
| 6 | Static Movement | Bandfakten, Diskografie, „Radio Station“, Geräte | „Static Movement Visionary Landscapes“, „Static Movement Radio Station“ | Discogs, Band-Bio, Side-Line |
| 7 | Clan of Xymox | Bass (Instrument oder Synth?), Drumcomputer, Synths 1985–86 | „Clan of Xymox Ronny Moorings equipment 4AD 1985 interview“ | 4AD-Archiv, Interviews |
| 8 | Leæther Strip | Claus Larsens Geräte, Label-Geschichte | „Claus Larsen Leaether Strip synthesizers interview“ | Side-Line, Interviews |
| 9 | Suicide Commando | Johan Van Roys Geräte/Software | „Johan Van Roy Suicide Commando studio setup“ | Interviews |
| 10 | Hocico | Racso Agroyams Studio-Setup | „Racso Agroyam Hocico studio synthesizers“ | Interviews |
| 11 | Kirlian Camera | Gründungsname „Suicide Commando“? | „Kirlian Camera 1979 founded name“ | Wikipedia + Bandseite (2 Quellen) |
| 12 | Genre | EBM-Bassmuster, Tempi | „EBM bassline tutorial sequencer 16th octave“ | MusicRadar, Attack Magazine, YouTube-Breakdowns (Kanalname notieren) |

Equipboard nur als schwacher Hinweis (nie allein BELEGT). Danach: Hörvergleich der Hörproben mit je 2–3 Originaltiteln (Tempo per Tap, Lage, Groove) und Rezept-Feinschliff.

---

## 10. Dateien

- `r7/vorbild-dark.md` – diese Datei.
- `r7/vorbild-dark-aud.json` – 10 Hörproben maschinenlesbar (`{id: {act, title, bpm, key, len, chords, tracks: {Sound: {range, notes:[[b,d,n,v]]}}, drums: {kit, pat}}}`; `act` = VORBILD-id).
- `r7/dark-work/aud-dark.mjs` – Erzeuger und Prüfer (Dauer ≤ 8 s, ≤ 256 Noten, Lage, Überlappung), Ausgabe `aud-report.txt`, `aud-blocks.md`; `vorbild-dark.tmpl.md` – Vorlage dieser Datei.
- Keine Änderung an V0a, `dirigent-wt/` oder dem Repo.
