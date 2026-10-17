# R7 – Spezial And One: „I.S.T.“, „Ghama Voodoo“, der bedrohliche Signal-Bass und der typische And-One-Bass

**Stand:** 17.10.2026 · Auftrag „spezial-andone“ · Grundlage: `fragen-xander-9.md` Abschnitt „Klarstellungen (17.10., späte Nachricht)“ (And One „I.S.T.“ ist Xanders Signature-Album; Beispiele laut Xander „Gamma“, „Voodoo“; Wunsch: der **bedrohliche, signalartige Bass** und der **typische And-One-Bass**). Vorarbeiten, die hier **nicht** wiederholt werden: `r7/vorbild-szene.md` §4.1 (SZ-01 Körperbass, SZ-02 Paradestab, SZ-03 Parade-Kit, SZ-04 Spiegelglas-Lead FM, Hörprobe „Körper-Parade“), `r8/studio-setups.md` §1.4, `r6/bibliothek-recherche.md` (A.1 #8/#9, N23). App-Stand: `synq-snapshots/V0a.html` (nur gelesen). Klassiker-Bausteine VK: `dirigent-spec-v3-nachtrag-1.md` A.10.

**Werkzeuge und Grenzen**
- **WebFetch** scheiterte an jeder Seite mit DNS-Fehler (`en.wikipedia.org`, `ludd.ltu.se`, `shout.ru`, `lyreka.com`, `acousticbrainz.org`, ein Wikipedia-Spiegel). **curl** wurde vom Proxy mit 403 abgewiesen (Wikipedia, Discogs-API, MusicBrainz). Alle Web-Fakten stammen deshalb aus **WebSearch-Auszügen** (26 Abfragen, dazu 5 Spotify-Suchen). Ein Auszug ist eine Zusammenfassung der Suchmaschine, nicht die Seite selbst. Das senkt die Sicherheit; ich sage es bei jeder Zeile.
- **Neu und wichtig:** Über den **Spotify-Connector** (nur Suche) konnte ich Titel, Album und Dauer direkt aus den Vertriebs-Metadaten lesen. So ist „Gamma/Voodoo“ geklärt (§1).
- **Hören konnte ich nichts.** Ich kann keine Aufnahme abspielen und habe „Ghama Voodoo“ nicht gehört. Alles über den Klang des Originals ist deshalb **UNBELEGT** (eigene Kenntnis = eK, aus der Erinnerung, unsicher) und als Frage an Xander formuliert (§3, §8).
- Rezepte (§5) und Hörproben (§6) sind **eigene Entwürfe**, per Skript erzeugt und geprüft (`r7/andone-work/aud.mjs` → `aud-report.txt`, JSON `r7/spezial-andone-aud.json`). **Nichts ist angehört, nichts gemessen.** Pegel (`level`, FM `gain`) noch auf −18 LUFS kalibrieren (Spec v2 §11.1).

**Kennzeichen** (wie `r7/vorbild-szene.md`)
- **BELEGT**: Primärquelle (Band-Interview, Credits, Vertriebs-Metadaten) **oder** zwei unabhängige Quellen.
- **WAHRSCHEINLICH**: eine Sekundärquelle (Wikipedia, Fanseite, Rezension), auch wenn nur der Suchauszug vorlag.
- **UNBELEGT**: nichts gefunden, nur eigene Kenntnis (eK) oder Einschätzung. ⚑ = bitte nachprüfen.
- **intern**: aus Projektdateien oder App-Code (mit Zeile in `V0a.html`).
- Rezepte und Hörproben tragen „Entwurf“.

---

## 0. Kurzfazit

- **„Gamma“ und „Voodoo“ sind ein einziger Titel: „Ghama Voodoo“** (so geschrieben, mit „h“), Dauer 5:40. Er steht auf der **heutigen Streaming-Fassung** von „I.S.T.“. **BELEGT** (Spotify-Metadaten). Diese Fassung enthält aber auch „Deutschmaschine“ (Single 1995) und ist darum eine **erweiterte Wiederveröffentlichung**, nicht die LP von 1994. Dass „Ghama Voodoo“ dort ein **Bonustitel** ist: **WAHRSCHEINLICH** (Lyreka-Auszug: Titel Nr. 15; Fan-Liste der (E)-Fassung 1994: 11 Titel). Woher der Titel ursprünglich stammt (Hinweis aus einer Prüfung: Maxi „Deutschmaschine“, Discogs-Auszug), konnte ich **nicht** nachprüfen: **UNBELEGT ⚑**. Eine Websuche nach „Ghama Voodoo“ fand sonst nichts.
- **„I.S.T.“ ist von 1994, nicht von 1997.** **BELEGT** (zwei unabhängige Quellen: Wikipedia-Diskografie und Fan-Liste ludd.ltu.se). 1997 erschien „Nordhausen“ (bei Virgin). Die Angabe „I.S.T. 2001“ bei AllMusic ist sehr wahrscheinlich ein Wiederveröffentlichungs-Datum.
- **Zu I.S.T. gesichert:** Neuer Keyboarder **Rick Schah** statt Alex Two; gilt als das „ehrgeizigste und schwierigste“ Album; Produktion durch die Band selbst; eine Fan-Biografie beschreibt es als gebaut aus „Fragmenten von Wörtern und Klängen“. Alles **WAHRSCHEINLICH** (je eine Sekundärquelle). Es gab eine englische Fassung „I.S.T.(E)“ mit 11 Titeln und eine deutsche Fassung.
- **Geräte: weiterhin kein einziges Synthesizer-Modell belegt.** BELEGT ist nur aus einem Interview von 2002: Naghavi macht Musik **nur am Macintosh** (zwei Macs im Studio) und mag keine Gitarren. Die Liste „TR-808, Korg Polysix, DX7“ (Ironcharts) bleibt **UNBELEGT** – sie datiert den DX7 sogar falsch auf 1990 (§2.3). Zu Chris Ruiz, Gio van Oli und Rick Schah fand ich **nichts** zur Ausrüstung.
- **Albumzuordnung der Lieblingstitel geklärt** (WAHRSCHEINLICH): „Deutschmaschine“ = Single 1995 ohne Album (heute Bonustitel der Streaming-Fassung von I.S.T.); „Krieger“ = Single aus „Aggressor“ (2003); „Military Fashion Show“ = erste Single aus „Bodypop“ (19.05.2006, Platz 1 der Deutschen Alternative Charts); „Get You Closer“ = aus „9.9.99 9 Uhr“. Das korrigiert die offenen Punkte in `vorbild-szene.md` §4.1 (§7).
- **Neue Sounds AO-01 bis AO-07:** drei Varianten für den „bedrohlichen Signal-Bass“ (weil ich das Original nicht hören kann: Puls-Morse-Bass mit sich öffnendem Filter, Sync-„Funkfeuer“, Ringmod-„Peilsender“ ab VK), ein FM6-Grollbass, ein zweiter „typischer“ Oktavbass (Nordhausen-/Futurepop-Richtung), ein „sprechender“ WT-Formant-Sound (passt zu „Wortfetzen“ auf I.S.T. und zu Xanders „Sounds, die zu dir sprechen“) und ein EBM-Kit. **Alle Hörproben** 4 oder 8 Takte, keine Takt-Wiederholung, eigene Tonfolgen.
- **Resynthese des Originals ist tabu** (Leistungsschutz der Aufnahme, § 85 UrhG; Linie aus `vorbild-szene.md` §2.1). Der geplante additive Resynthese-Synth darf eigene Aufnahmen und lizenzfreies Material zerlegen, aber keine And-One-Spur für die Bibliothek (§5.8).

---

## 1. Fakten-Check: Titel und Alben

| Aussage | Status | Quelle |
|---|---|---|
| **„Ghama Voodoo“** steht auf der heutigen Streaming-Fassung von „I.S.T.“, Dauer 5:40 (339 733 ms) | **BELEGT** (Vertriebs-Metadaten) | https://open.spotify.com/track/4ufLTs7KdeexR2MzlXblb5 · Album https://open.spotify.com/album/08aHAfQh86f8aj2YgsXavn |
| Die Streaming-Fassung ist eine **erweiterte Wiederveröffentlichung**: Sie enthält auch „Deutschmaschine“ (3:16), das sonst als Single 1995 gilt (Zeile unten) | **BELEGT** (Spotify, Titel im Album „I.S.T.“) | https://open.spotify.com/track/2CsQJz6cEFOt1tk06zFozC |
| „Ghama Voodoo“ ist dort ein **Bonustitel**, nicht Teil der LP von 1994 | **WAHRSCHEINLICH** (Lyreka-Auszug: Nr. 15 auf „I.S.T.“; die (E)-Fassung 1994 hat 11 Titel) | https://www.lyreka.com/artist/and-one/albums · https://ludd.ltu.se/~h-son/cd/a/ist.html |
| Ursprünglich ein Titel der Maxi „Deutschmaschine“ (Machinery 1994/95, Track 4) | **UNBELEGT ⚑** – nur Hinweis aus einer Prüfung (Discogs-Suchauszug, dazu ein Spotify-Eintrag „Ghama Voodoo – Bonus track“ https://open.spotify.com/track/0sTJyeiF2OyiAS21BoFLXS); von mir in 3 Suchen nicht reproduziert | – |
| Auf welcher CD-Fassung (englisch „I.S.T.(E)“, deutsch, „Total“-Fassung) „Ghama Voodoo“ steht | **UNBELEGT ⚑** – die Spotify-Fassung hat keine Fassungsangabe; die Fan-Liste der (E)-Fassung zeigte im Auszug den Titel nicht (nur 5 von 11 Titeln sichtbar); die „Total“-Fassung „mit allen Liedern“ (ludd.ltu.se) ist ein Kandidat | https://ludd.ltu.se/~h-son/cd/a/ist.html |
| Weitere Titel auf „I.S.T.“: Second Day (1:18), Body Nerv (3:56), Driving With My Darling (3:00), Heart Of Stone (6:13), Made Of Plastic (3:50, letzter Titel der (E)-Fassung) | **BELEGT** für Second Day, Body Nerv, Driving With My Darling (Spotify + Fan-Liste); Heart Of Stone, Made Of Plastic **WAHRSCHEINLICH** (nur Fan-Liste) | Spotify: https://open.spotify.com/track/1bCAsM5Nid4OLkv5wa36ca · https://open.spotify.com/track/7u1VehDT3H9CqElTN4iqr7 · https://open.spotify.com/track/5HlRJ3ZIO1fOPXqKNAWrmT · https://ludd.ltu.se/~h-son/cd/a/ist.html |
| „I.S.T.“ erschien **1994** (Label Machinery) | **BELEGT** (Wikipedia-Diskografie + Fan-Liste + 45worlds-Verweis „I.S.T.e … Machinery … 1994“) | https://en.wikipedia.org/wiki/And_One_discography · https://ludd.ltu.se/~h-son/cd/a/ist.html · https://mail.45worlds.com/cdalbum/cd/ma342 |
| AllMusic nennt „I.S.T.“ 2001 | WAHRSCHEINLICH Wiederveröffentlichung (Suchauszug; Widerspruch zu allen anderen) | https://www.allmusic.com/album/virgin-superstar-mw0000472343 (Auszug) |
| Single „Driving With My Darling“ 1994 aus „I.S.T.“ | WAHRSCHEINLICH | https://en.wikipedia.org/wiki/And_One_discography |
| Es gab eine englische („(E)“, 11 Titel, 43:58) und eine deutsche Fassung, später eine „Total“-Fassung mit allen Titeln | WAHRSCHEINLICH (eine Fan-Seite) | https://ludd.ltu.se/~h-son/cd/a/ist.html |
| Alex Two ging, **Rick Schah** kam als Keyboarder; mit ihm entstand „I.S.T.“, „generally considered their most ambitious and challenging project“ | WAHRSCHEINLICH (Wikipedia-Auszug; last.fm-Bio übernimmt meist Wikipedia, zählt nicht als zweite Quelle) | https://en.wikipedia.org/wiki/And_One · https://www.last.fm/music/And+One/+wiki |
| Produktion von „I.S.T.“ durch die Band selbst; „etwas poppiger als Spot“ | WAHRSCHEINLICH (Hörer-Rezension auf der Fan-Seite) | https://ludd.ltu.se/~h-son/cd/a/ist.html |
| I.S.T. aus „Fragmenten von Wörtern und Klängen“, die Rhythmen und Melodien bilden; „riskantestes Werk“ bis dahin | WAHRSCHEINLICH (spanische Fan-Biografie, nur Auszug) | https://www.cancioneros.com/letras/artista/2025/and-one |
| „Spot“ 1993, Machinery MA 34-2, mit „Life Isn't Easy In Germany“ (nicht auf I.S.T.) | WAHRSCHEINLICH (45worlds) | https://mail.45worlds.com/cdalbum/cd/ma342 |
| „Deutschmaschine“ (auch „Deutschemaschine“): **Single 1995 ohne Album**; Chris Ruiz als Gast; Ende der Machinery-Zeit. Heute als **Bonustitel** auf der Streaming-Fassung von „I.S.T.“ (BELEGT, Spotify, s. o.) | WAHRSCHEINLICH (Wikipedia-Diskografie, Auszug) | https://en.wikipedia.org/wiki/And_One_discography |
| „Nordhausen“ 1997 bei Virgin, Platz 59 in Deutschland; Wende von EBM zu Synthpop/Futurepop mit „sinfonischen“ Elementen | WAHRSCHEINLICH (Diskografie-Spiegel + TV-Tropes-Auszug) | https://www.chise.org/ipns/en.wikipedia-on-ipfs.org/wiki/And_One_discography · https://www.tvtropes.org/pmwiki/pmwiki.php/Music/AndOne |
| „Get You Closer“ ist der Hit aus **„9.9.99 9 Uhr“**, das „ein Jahr nach Nordhausen“ erschien | WAHRSCHEINLICH (Diskografie-Spiegel, Auszug) ⚑ Jahr des Albums prüfen | https://www.chise.org/ipns/en.wikipedia-on-ipfs.org/wiki/And_One_discography |
| „Virgin Superstar“: 2000 (Wikipedia) bzw. November 2001 (AllMusic); Single „Wasted“; Platz 33 | WAHRSCHEINLICH, **Jahr widersprüchlich** ⚑ | https://www.allmusic.com/album/virgin-superstar-mw0000472343 · Diskografie wie oben |
| „Aggressor“ 2003 (Virgin), alle Titel von Naghavi, von ihm produziert; Single **„Krieger“** | WAHRSCHEINLICH | https://en.wikipedia.org/wiki/Aggressor_(And_One_album) |
| „Bodypop“: 9. Studioalbum, Out of Line, 04.09.2006 (DE); von Naghavi produziert. **„Military Fashion Show“** = erste von drei Singles, 19.05.2006, Platz 1 der Deutschen Alternative Charts (DAC) | WAHRSCHEINLICH | https://en.wikipedia.org/wiki/Bodypop |
| „Body Pop“ als **eigener Genre-Begriff** | **UNBELEGT** – die Suche fand ihn nur als Albumtitel; die Band wird als Synthpop/Futurepop/EBM beschrieben | https://en.wikipedia.org/wiki/And_One |
| „Sometimes“ (in `vorbild-szene.md` genannt): Album/Jahr | UNBELEGT ⚑ (nicht gesucht, Budget) | – |

**Folgerung für Xander:** Wenn er „Gamma“ und „Voodoo“ sagt, meint er sehr wahrscheinlich den **einen** Titel „Ghama Voodoo“ (5:40) – oder zwei Stellen darin. Das fragen wir nach (§8).

---

## 2. Band, Rollen und Geräte

### 2.1 Besetzung (für die Frage „wer hat die Bässe programmiert?“)

| Aussage | Status | Quelle |
|---|---|---|
| Gründung 1989 in Berlin durch Steve Naghavi und Chris Ruiz (Kennenlernen im Club); Vorbild Depeche Mode, Start mit „two keyboards and a beatbox“ | WAHRSCHEINLICH (Wikipedia; TikTok-Fanvideo wiederholt es – keine unabhängige Quelle) | https://en.wikipedia.org/wiki/And_One · https://www.tiktok.com/@bluemoon_160_/video/7454629953917848878 |
| Alex Two kam vor „Anguish“ (1991) dazu; Ruiz ging 1991/92 (Angaben widersprechen sich), kam 2001 zurück | WAHRSCHEINLICH (Wikipedia + last.fm, voneinander abhängig) | https://en.wikipedia.org/wiki/And_One · https://www.last.fm/music/And+One/+wiki |
| Rick Schah: Keyboarder ab I.S.T. (1994); zweite Phase ab Juni 2011, Ende 2022 | WAHRSCHEINLICH | https://en.wikipedia.org/wiki/And_One |
| Gio van Oli ab 2001/2002; Ruiz und van Oli verließen die Band am 04.06.2011 und gründeten **PAKT** (mit Chad Hauger) | WAHRSCHEINLICH | https://en.wikipedia.org/wiki/And_One |
| Bei „I.S.T.“ also: **Naghavi + Rick Schah** (+ Joke Jay am Schlagzeug, Zeitpunkt unklar) – nicht Ruiz, nicht van Oli | WAHRSCHEINLICH (Folgerung aus den Zeilen oben) | wie oben |
| Wer bei I.S.T. die Bässe programmiert hat | **UNBELEGT** ⚑ (Booklet-Credits nötig) | – |

### 2.2 Geräte – was belegt ist

| Gerät / Aussage | Status | Quelle |
|---|---|---|
| „I have 2 Mac in Studio, I just make music with Macintosh, and have 2 PCs … for private fun“ (Naghavi, Interview 2002) | **BELEGT** (Band-Interview; nur Suchauszug, Seite nicht abrufbar) | https://www.shout.ru/exclusives/exclusive_interview_with_Steve_2002_e.htm |
| „we always wanted to make an electronic music 'cos I don't like guitars“ (gleiches Interview) | **BELEGT** (wie oben) | wie oben |
| Welches Programm auf dem Mac (Sequenzer), welche Klangerzeuger | UNBELEGT – das Interview nennt laut Auszug keine Synthesizer | wie oben |
| TR-808, Korg Polysix, Yamaha DX7 als „Lieblingsgeräte“ | **UNBELEGT** – Ironcharts ohne Quelle; dort steht „1990 Yamaha DX7“, der DX7 kam aber 1983 heraus (eK, Prüf-URL https://en.wikipedia.org/wiki/Yamaha_DX7). Der Fehler senkt das Vertrauen in die Liste weiter. **Nie in einen ⓘ-Text.** | https://ironcharts.com/musician/steve-naghavi |
| Ausrüstung von Chris Ruiz, Gio van Oli, Rick Schah (auch PAKT) | **UNBELEGT** (3 Abfragen, nichts) | – |
| Sampler bei And One in den 90ern (Akai, E-mu o. Ä.) | **UNBELEGT** (1 Abfrage, nichts). Die „Wortfragmente“ auf I.S.T. (§1) sprechen für einen Sampler, aber das ist nur ein Schluss (eK). | – |
| Studio-Tour-Video, Equipboard-Eintrag | nicht gefunden (je 1 Abfrage) | – |

### 2.3 Folgerung für die App
Für And One gibt es **kein Gerät, das wir im ⓘ nennen dürfen.** Die Vorlagen bleiben Stil-Vorlagen (Kennzeichen „Stil“), wie in `r8/studio-setups.md` §1.4 und `vorbild-szene.md` §4.1. Ein „And-One-Studio-Setup“ als Klassiker-Vorlage (Master-Briefing Teil 11) lässt sich **nicht** belegen; Vorschlag: nicht bauen, bis Xander oder ein Booklet ein Gerät liefert.

---

## 3. Der Klang: was „bedrohlich, signalartig“ technisch heißen kann

**Ehrlich vorweg:** Ich kann „Ghama Voodoo“ nicht hören, und im Netz fand ich keine Beschreibung des Titels. Was folgt, ist **UNBELEGT** – eine Übersetzung von Xanders Worten in Synthesizer-Technik, nicht eine Analyse des Originals.

**Allgemeine Bass-Technik (Sekundärquellen, nicht And-One-spezifisch):** Säge oder Puls, Tiefpass, die **Filterhüllkurve** formt den Anschlag, Mono-Modus für einen festen Bass (WAHRSCHEINLICH, https://www.musicradar.com/how-to/create-your-own-simple-synth-bass-sound-in-6-easy-steps); Puls/Säge als Grundlage, ein Sub-Oszillator für Tiefe (WAHRSCHEINLICH, https://www.izotope.com/en/learn/how-to-get-a-fat-deep-bass-sound).

**„Signalartig“ – vier mögliche Bedeutungen (je eine Variante in §5):**

| Xander hört vielleicht … | Technik | Sound |
|---|---|---|
| ein **Morse-/Funk-Muster**: kurze Töne mit Lücken, immer wieder anders gruppiert, dazu ein Filter, das sich langsam öffnet | Puls schmal, kurze Hüllkurven, 16tel mit Pausen; Filteröffnung über Anschlag und einen langsamen LFO | AO-01 |
| ein **„Piu“ / Laser / Funkfeuer** in jedem Ton | Oszillator-Sync, Tonhöhe des Folge-Oszillators fällt mit einer Hüllkurve | AO-02 |
| etwas **Metallisches, Unstimmiges** wie ein Peilton | Ringmodulation im Tritonus-Abstand, getaktetes An/Aus (1/8) | AO-03 |
| ein **knurrendes, digitales** Grollen | FM mit Rückkopplung und kurzem Modulator-Anschlag | AO-04 |

**„Bedrohlich“** (eK, Allerwelts-Harmonik, frei): tiefe Lage um E1–E2 (41–82 Hz), **phrygisches** Moll (kleine Sekunde E–F), **Tritonus** (E–B♭ bzw. B–F) als Wendung, viel Resonanz knapp unter dem Pfeifen, wenig Hall.

**„Typischer And-One-Bass“** (eK, UNBELEGT, wie schon in `vorbild-szene.md` §4.1): 16tel-Sequenz auf dem Grundton, Oktavsprünge, kurzer Filter-„Tock“, Akzent auf der Viertel. Dafür gibt es **SZ-01 „Körperbass“** (bleibt die Referenz). Neu kommt AO-05 als zweite Farbe dazu (zwei verstimmte Sägen, eher Nordhausen-/Futurepop-Zeit, mit Pumpen) – der Unterschied steht in §5.5.

---

## 4. App-Fakten, auf denen die Rezepte beruhen (intern)

- **Filter je Stimme** (V0a Z. 2980–2982): `Cutoff(HT) = cutoff + kt·(Note−60) + (fenv + Mod)·72·FiltHk·velF + Mod_cutoff·120`, mit `velF = 1 − fvel + fvel·Anschlag`. Hoher `fvel` + steigender Anschlag öffnet das Filter von Takt zu Takt – das nutzt AO-01.
- **LFO mit Takt-Sync** (Z. 2930–2933, Z. 5663): `l*sync` = Schläge je Zyklus (1/16 = .25 … 8 Takte = 32); die Phase hängt am Song-Anfang. Form 2 = Säge **steigend** (`2·ph − 1`, Z. 2920), Form 4 = S&H (neuer Wert je Zyklus, Z. 2922). Eine Säge mit `l2sync 32` öffnet das Filter also über 8 Takte von −1 bis +1. ⚑ Ob der Hörproben-Spieler `songStart` am Probenanfang setzt, ist ungeprüft.
- **Sync** (Z. 2805, Z. 3092): `o2sync 1` startet Osz. 2 mit jeder Schwingung von Osz. 1 neu; nur mit Worklet hörbar (Z. 13769). Werks-Beispiel mit Sync: Z. 5709.
- **Mod-Einheiten** (Z. 5634–5635): Cutoff 1,0 = 120 HT, Tonhöhe/`o2pitch` 1,0 = 24 HT, `fenv` 1,0 = ±72 HT, `amp` 1,0 = +100 %. Quellen: lfo1 lfo2 fenv menv vel key mw rnd aenv.
- **Filtertypen** (Z. 5658): 0 LP24, 1 LP12, 2 BP24, 3 BP12, 4 HP24, 5 HP12. **WT-Tabellen** (Z. 5073): digital, vocal, glas, orgel.
- **Ringmod, Sättigung `sat`, SVF 12, Osz.-FM `ofm`, Bitcrusher** kommen erst mit **VK** (Nachtrag 1 A.10). Rezepte, die sie brauchen, haben einen Rückfall für V0a.

---

## 5. Rezepte (alle: Entwurf, ungehört)

Schreibweise wie in `vorbild-szene.md` (App-Schlüssel des flachen Patches; `M(src, dst, amt)` = Mod-Route; fx je Spur; bus = Vorschlag für Hall/Echo).

### 5.1 AO-01 „Signalbass“ – Bass · VA (V0a)
- **Vorbild (ⓘ):** „Dunkler Morse-Bass, dessen Filter sich über acht Takte öffnet – erinnert an frühen deutschen Body-Pop (Stil).“ Gerät UNBELEGT.
- **Rezept:** `o1w 1, o1pw .22, o2w 0, o2oct -1, o2fine -4, o2lvl .45, subLvl .25, subW 1, ftype 0, cutoff 220, res .62, drive .45, bass .8, kt .3, fenv .4, fvel .7, fA .001, fD .11, fS .08, fR .06, fCurve .75, aA .001, aD .14, aS .55, aR .03, ampVel .25, mode 1, poly 1, reset 1, analog .06, spread 0, l2shape 2, l2sync 32` · Mods `M('lfo2','cutoff',.1)` · fx `{drive .25, dly .08, rev .04}` · bus `{echo:{mode 'pp', divL '1/8.', fb .3, highcut 2500}}`
- **Warum:** Schmaler Puls (22 %) klingt hohl und „elektrisch“, die Säge eine Oktave tiefer und der Sinus-Sub halten das Fundament. Resonanz 0,62 lässt das Filter „singen“; `bass .8` gleicht den Bassverlust des Ladders aus (VK-Befund, A.10). **Filteröffnung (gerechnet, intern Z. 2980):** Spitze der Filterhüllkurve bei Anschlag 66 = 0,4·72·0,66 ≈ **19 HT**, bei Anschlag 125 ≈ **28,5 HT**; dazu die LFO-2-Säge über 8 Takte von −12 auf +12 HT. Takt 1 klingt also fast zu (Spitze um 180 Hz bei E1), Takt 8 öffnet bis etwa 1 kHz (bei B1). `ampVel .25` hält die Lautstärke dabei fast gleich (≈ 1 dB) – es wird heller, nicht lauter.
- **Lage / Rolle:** E1–C3 (28–48). Bass. Grenze **hoch E3**. Unter E1 wird der Puls zum Knattern.
- **Hörprobe:** 8 Takte (§6, Spur AO-01). Die Morse-Gruppen ändern sich jeden Takt; der Anschlag steigt je Takt um 5.

### 5.2 AO-02 „Funkfeuer-Bass“ – Bass · VA mit Sync (V0a)
- **Vorbild (ⓘ):** „Synchronisierter Bass mit einem ‚Piu‘ in jedem Ton – Signal-Farbe für Body-Pop (Stil).“
- **Rezept:** `o1w 0, o1lvl .3, o2w 0, o2sync 1, o2semi 7, o2fine 0, o2lvl 1, subLvl .35, subW 0, ftype 0, cutoff 900, res .25, drive .35, bass .6, kt .4, fenv .3, fvel .3, fA .001, fD .18, fS .1, fR .05, mA .001, mD .16, mS 0, mR .05, aA .001, aD .2, aS .5, aR .05, ampVel .4, mode 1, poly 1, reset 1, analog .05, l1shape 4, l1sync .25` · Mods `M('menv','o2pitch',.5)`, `M('lfo1','o2pitch',.15)` · fx `{drive .2, rev .05}`
- **Warum:** Mit Sync bestimmt Osz. 1 die Tonhöhe, Osz. 2 nur die Farbe. Die Mod-Hüllkurve hebt Osz. 2 zum Anschlag um +12 HT und lässt es in 160 ms auf +7 HT fallen: das „Piu“ (intern: `o2pitch` 1,0 = 24 HT). Der S&H-LFO (1/16, ±3,6 HT) gibt jedem 16tel eine leicht andere Farbe – wie ein Datenstrom. Aufbau nach dem Werks-Sync-Sound (Z. 5709).
- **Lage / Rolle:** A1–E3 (33–52). Bass oder Bass-Gegenstimme. Nur mit Worklet (nativer Ersatzweg ohne Sync, Z. 13769).

### 5.3 AO-03 „Peilsender“ – Bass/Effekt · VA, Ringmod **ab VK**
- **Vorbild (ⓘ):** „Metallischer Peilton im Tritonus, getaktet – bedrohliche Farbe (Stil).“
- **Rezept ab VK:** `o1w 2, o2w 2, o2semi 6, o2fine 0, o1lvl .5, o2lvl 0, ring .6, subLvl .4, subW 1, ftype 1, cutoff 1400, res .3, drive .3, kt .5, fenv .2, fD .4, fS .3, aA .005, aD .6, aS .6, aR .2, mode 1, poly 1, walk .2, l1shape 3, l1sync .5` · Mods `M('lfo1','amp',-.5)` · fx `{dly .15, rev .1}` · bus `{echo:{divL '1/8', fb .25}}`
  - Ringprodukt aus f und f·√2 (Tritonus): Teiltöne bei ≈ 0,41 f und 2,41 f. Bei E2 (82 Hz) also **34 Hz und 199 Hz** – ein unharmonisches Grollen unter dem Grundton. Das Rechteck-LFO (1/8) schaltet den Pegel zwischen ×0,5 und ×1,5 (Worklet: `Pegel × max(0, 1+Mod)`, laut `vorbild-szene.md` §0): „piep-piep“.
- **Rückfall V0a (ohne VK):** `ring` und `walk` weglassen, dafür `o2w 1, o2pw .12, o2lvl .3` (schmaler Puls im Tritonus dazu): dissonant, aber nicht metallisch.
- **Lage / Rolle:** B1–B♭2 (35–46). Bass-Effekt in Breaks oder unter dem Refrain. Grenze **hoch E3** (darüber wird es Glocke).

### 5.4 AO-04 „Grollbass FM“ – Bass · FM6
- **Vorbild (ⓘ):** „Knurrender Digital-Bass für EBM (Stil).“ Ein DX7 bei And One ist **UNBELEGT** – im ⓘ kein Gerät.
- **Rezept (Algorithmus 5 = Paare 1←2, 3←4, 5←6, Rückkopplung auf OP6; intern Z. 2557 `'135|12 34 56|66'`):** `alg 5, fb 6, trans 0`
  - OP1 `coarse 1, ol 99, r [99,50,35,70], l [99,88,80,0]` (Träger)
  - OP2 `coarse 1, ol 80, r [99,62,40,70], l [99,55,30,0], vs 5` (Modulator: kurzer heller „Tock“, Anschlag macht ihn heller)
  - OP3, OP4 `on 0` (Paar aus)
  - OP5 `coarse 1, det -4, ol 82, r [99,50,35,70], l [99,85,75,0]` (zweiter Träger, leicht verstimmt)
  - OP6 `coarse 1, det 4, ol 68, r [99,70,45,70], l [99,60,45,0]` (mit `fb 6` sägeartig: das „Knurren“)
  - common `{gain -12 (kalibrieren), mode 1, poly 1, glide 0}` · fx `{drive .3, rev .03}`
- **Hinweis:** Hängt an der FM-Hüllkurven-Reparatur (`r8/fm-diagnose.md`). Erst danach abhören.
- **Lage / Rolle:** E1–D3 (28–50). Bass. Grenze **hoch E3**.

### 5.5 AO-05 „Doppelsägen-Oktavbass“ – Bass · VA (V0a) – die zweite „typische“ Farbe
- **Vorbild (ⓘ):** „Galoppierender Oktavbass aus zwei Sägen mit Pumpen – erinnert an deutschen Synthpop/Futurepop der späten 90er (Stil).“
- **Rezept:** `o1w 0, o2w 0, o2fine 11, o2lvl .9, o3w 0, o3oct -1, o3lvl .4, ftype 0, cutoff 520, res .4, drive .4, bass .6, kt .4, fenv .3, fvel .35, fA .001, fD .14, fS .15, fR .06, aA .001, aD .2, aS .6, aR .04, ampVel .5, mode 1, poly 1, reset 0, analog .12, spread .3` · fx `{drive .15, pump .4, pumpRel '1/8', rev .05}`
- **Unterschied zu SZ-01 „Körperbass“** (der bleibt die Referenz für I.S.T.-nahe Titel):

| | SZ-01 Körperbass | AO-05 Doppelsägen-Oktavbass |
|---|---|---|
| Oszillatoren | Säge + Puls 40 % + Sub | zwei Sägen 11 ct + Säge −1 Okt |
| Anschlag | Phasen-Reset an: jeder 16tel gleich hart | Reset aus: freilaufend, „breiter“, leicht schwebend |
| Filter | 300 Hz, Res .35, Hk 90 ms | 520 Hz, Res .4, Hk 140 ms |
| Pumpen | 1/16, .25 | 1/8, .4 (deutlicheres Atmen gegen die Kick) |
| Tempo der Hörprobe | 126 BPM | 132 BPM |

- **Lage / Rolle:** F1–C3 (29–48). Bass. Grenze **hoch E3**.

### 5.6 AO-06 „Wortfetzen-Formant“ – Sequenz/Stimme · WT (V0a)
- **Vorbild (ⓘ):** „Silben-artige Formant-Töne, die wie ein Roboter ‚sprechen‘ – ohne echte Sprache (Stil).“ Bezug: Die Fan-Biografie beschreibt I.S.T. als gebaut aus „Fragmenten von Wörtern und Klängen“ (WAHRSCHEINLICH, §1). Wir **sampeln keine Sprache** von And One, sondern bauen Silben-Farben aus der Tabelle `vocal`. Das passt auch zu Xanders Wunsch „Sounds, die zu dir sprechen“ (`fragen-xander-9.md`).
- **Rezept:** `wt {table 'vocal', pos .25, scan .4, scanTime .15}, ftype 3, cutoff 1100, res .45, kt .4, fenv .25, fD .12, fS .3, aA .002, aD .15, aS .5, aR .08, ampVel .5, poly 2, analog .1, l1shape 4, l1sync .25` · Mods `M('lfo1','cutoff',.07)` · fx `{dly .15, rev .1}` · bus `{echo:{divL '1/16', fb .2}}`
- **Warum:** Jede Note fährt in 150 ms durch die Vokal-Tabelle (eine „Silbe“). Der Bandpass (BP12) und der S&H-LFO (je 16tel ein neuer Wert, ±8,4 HT) wechseln den „Vokal“. **Ab V5d** (MOD-R1, `MODT`) zusätzlich `M('lfo1','wt.pos',.3)` – dann wechselt die Silbe selbst. Mit dem geplanten Formant-/Sprach-Baustein (Resynthese-Pakete) wird das deutlicher.
- **Lage / Rolle:** E3–C4 (52–60). Sequenz über AO-01 (Ensemble §6.2).

### 5.7 AO-07 „Schaltwerk-Kit“ – Drums (Basis Werks-Kit „Rom Pop“)
- **Vorbild (ⓘ):** „Harter EBM-Beat mit Gated-Snare und Klick-Signalen (Stil).“
- **Kit-Rezept (Abweichungen von „Rom Pop“, Schlüssel wie SZ-03):**
  - KICK `frq 50, pAmt 28, pDec .035, tDec .26, cLvl .6, cTyp 3, drv .5, dyn .3`
  - SNARE (Gated Room) `tLvl .5, wav 'triangle', frq 190, pAmt 6, pDec .02, tDec .07, nLvl 1.2, nTyp 'bandpass', nFrq 2600, nQ .8, nHp 700, nDec .11, nCrv .4, sRoom .45, sGate .35, drv .4, dyn .4`
  - HH ZU `mDec .025` · RIM wie „Rom Pop“ (spielt das „Signal“-Klickmuster auf der 2. und 8. 16tel)
- **Rolle:** Drums, 122 BPM (passt zu AO-01 bis AO-04 und AO-06).

### 5.8 Additiv/Resynthese, Bitmask – was geht und was nicht
- **Resynthese einer And-One-Aufnahme** (z. B. den Bass aus „Ghama Voodoo“ zerlegen und als Preset ausliefern): **nicht erlaubt** für die Bibliothek. Die Aufnahme ist geschützt (§ 85 UrhG, Linie aus `vorbild-szene.md` §2.1, kein Rechtsrat). Auch Spec-Entscheidung **E8** („keine allgemeine Resynthese“, Master-Briefing) gilt; Xanders Wunsch (`fragen-xander-9.md`) ist ein additiver Synth, der **eigene** Klänge resynthetisieren kann.
- **Erlaubt und nützlich:** Xander spielt den Bass selbst nach (z. B. mit AO-01) und nimmt **seine** Version auf; der Resynthese-Synth zerlegt diese eigene Aufnahme. Oder: Hörvergleich nur zum Lernen, ohne dass etwas vom Original in die App kommt.
- **Bitmask (geplant, Paket 4):** Für AO-01 eine Variante „Signalbass digital“: Osz. 1 durch Bitmask ersetzen und die Masken-Nummer mit der Delta-Hüllkurve fahren (Mask1-Prinzip, Master-Briefing). Das gibt je Ton einen kurzen digitalen „Daten“-Anschlag. Rezept erst, wenn Bitmask gebaut ist (Platzhalter, keine Werte).

---

## 6. Hörproben (eigene Tonfolgen, 4–8 Takte, geprüft)

**Prüfung** (`r7/andone-work/aud-report.txt`):
```
ao01 AO-01 Signalbass: 8 Takte, 71 Noten, 8/8 verschiedene Takte, 8 Rhythmus-Varianten, direkte Wiederholungen 0, Lage E1–C3 (28–48), Anschlag 66–125
ao02 AO-02 Funkfeuer-Bass: 4 Takte, 24 Noten, 4/4 verschiedene Takte, 3 Rhythmus-Varianten, direkte Wiederholungen 0, Lage A1–E3 (33–52), Anschlag 86–114
ao03 AO-03 Peilsender: 4 Takte, 13 Noten, 4/4 verschiedene Takte, 2 Rhythmus-Varianten, direkte Wiederholungen 0, Lage B1–Bb2 (35–46), Anschlag 80–104
ao04 AO-04 Grollbass FM: 4 Takte, 42 Noten, 4/4 verschiedene Takte, 2 Rhythmus-Varianten, direkte Wiederholungen 0, Lage E1–D3 (28–50), Anschlag 80–118
ao05 AO-05 Doppelsägen-Oktavbass: 4 Takte, 63 Noten, 4/4 verschiedene Takte, 2 Rhythmus-Varianten, direkte Wiederholungen 0, Lage F1–C3 (29–48), Anschlag 80–118
ao06 AO-06 Wortfetzen-Formant: 4 Takte, 20 Noten, 4/4 verschiedene Takte, 4 Rhythmus-Varianten, direkte Wiederholungen 0, Lage E3–C4 (52–60), Anschlag 80–104
ao07 AO-07 Schaltwerk-Kit (Drums): Drums 8 Takte, 8/8 verschiedene Takte, direkte Wiederholungen 0
```

Ablage der Daten: `r7/spezial-andone-aud.json` (Format wie `vorbild-szene-aud.json`: `aud.notes` = [Schlag, Dauer in Schlägen, MIDI, Anschlag 0–1]; Drums als 16tel-Muster). Kürzere Bass-Notenlänge 0,8 × 16tel bei AO-01 = Staccato („Morse“).

**Achtung Format:** AO-01 und AO-07 haben **8 Takte**. `vorbild-szene.md` nennt für `aud` die Grenze `len ≤ 4` (Spec §12.8). Entweder die Grenze auf 8 anheben (Vorschlag, der Auftrag erlaubt 4–8 Takte) oder beide Proben in zwei 4-Takt-Hälften teilen (Takt 1–4 „zu“, Takt 5–8 „offen“). Die Notenzahl (max. 71) liegt weit unter 256.

### 6.1 Notenlisten

**Spur AO-01 Signalbass**
```
Tempo 122 BPM · 8 Takte · E phrygian · Akkorde: Em | Em | F | Em | C | C | F | Bdim · Lage E1–C3 · 71 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E1(28) 0/0.8/84 · E1(28) 1/0.8/66 · E1(28) 3/0.8/66 · E2(40) 6/0.8/66 · E1(28) 8/0.8/84 · E1(28) 9/0.8/66 · E1(28) 11/0.8/66
T2: E1(28) 16/0.8/89 · E1(28) 17/0.8/71 · E1(28) 19/0.8/71 · E2(40) 22/0.8/71 · E1(28) 24/0.8/89 · E1(28) 25/0.8/71 · E1(28) 27/0.8/71 · F1(29) 29/0.8/71 · E1(28) 31/0.8/71
T3: F1(29) 32/0.8/94 · F1(29) 33/0.8/76 · F1(29) 35/0.8/76 · F2(41) 38/0.8/76 · F1(29) 40/0.8/94 · F1(29) 41/0.8/76 · F1(29) 43/0.8/76 · E1(28) 45/0.8/76
T4: E1(28) 48/0.8/99 · E1(28) 49/0.8/81 · E1(28) 51/0.8/81 · E2(40) 53/0.8/81 · E2(40) 54/0.8/81 · E1(28) 56/0.8/99 · E1(28) 57/0.8/81 · E1(28) 59/0.8/81 · Bb1(34) 61/0.8/81 · B1(35) 63/0.8/81
T5: C2(36) 64/0.8/104 · C2(36) 65/0.8/86 · C2(36) 67/0.8/86 · C3(48) 70/0.8/86 · C2(36) 72/0.8/104 · C2(36) 73/0.8/86 · C2(36) 75/0.8/86 · G1(31) 78/0.8/86
T6: C2(36) 80/0.8/109 · C2(36) 81/0.8/91 · C2(36) 83/0.8/91 · C3(48) 85/0.8/91 · C2(36) 87/0.8/91 · C2(36) 88/0.8/109 · C2(36) 90/0.8/91 · C2(36) 91/0.8/91 · E2(40) 93/0.8/91 · G2(43) 95/0.8/91
T7: F1(29) 96/0.8/114 · F1(29) 97/0.8/96 · F1(29) 99/0.8/96 · F2(41) 102/0.8/96 · F1(29) 104/0.8/114 · F1(29) 105/0.8/96 · F1(29) 107/0.8/96 · F2(41) 108/0.8/114 · F1(29) 110/0.8/96
T8: B1(35) 112/0.8/119 · B1(35) 113/0.8/101 · B1(35) 115/0.8/101 · Bb1(34) 118/0.8/101 · B1(35) 120/0.8/119 · F2(41) 122/0.8/101 · E2(40) 124/0.8/125 · F2(41) 125/0.8/107 · E2(40) 126/0.8/107 · Eb2(39) 127/0.8/107
```

**Spur AO-02 Funkfeuer-Bass**
```
Tempo 122 BPM · 4 Takte · E minor · Akkorde: Em | C | Am | B · Lage A1–E3 · 24 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E2(40) 0/1.5/104 · E2(40) 4/1.5/104 · E3(52) 6/1.5/86 · E2(40) 10/1.5/86 · G2(43) 12/1.5/104
T2: C2(36) 16/1.5/104 · C2(36) 20/1.5/104 · C3(48) 22/1.5/86 · C2(36) 26/1.5/86 · E2(40) 28/1.5/104 · G2(43) 30/1.5/86
T3: A1(33) 32/1.5/104 · A1(33) 36/1.5/104 · A2(45) 38/1.5/86 · A1(33) 42/1.5/86 · C2(36) 44/1.5/104 · E2(40) 46/1.5/86
T4: B1(35) 48/1.5/104 · B1(35) 52/1.5/104 · B2(47) 54/1.5/86 · Eb2(39) 56/1.5/114 · F#2(42) 58/1.5/96 · A2(45) 60/1.5/114 · B2(47) 62/1.5/96
```

**Spur AO-03 Peilsender**
```
Tempo 122 BPM · 4 Takte · E phrygian · Akkorde: Em | Em F | C | Bdim · Lage B1–Bb2 · 13 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E2(40) 0/6/100 · E2(40) 8/2/80 · Bb2(46) 12/4/96
T2: E2(40) 16/4/100 · F2(41) 20/4/92 · E2(40) 24/6/96 · D2(38) 30/2/84
T3: C2(36) 32/6/100 · C2(36) 40/2/80 · F#2(42) 44/4/96
T4: B1(35) 48/8/104 · F2(41) 56/4/96 · E2(40) 60/4/100
```

**Spur AO-04 Grollbass FM**
```
Tempo 122 BPM · 4 Takte · E minor · Akkorde: Em | Em | C | D · Lage E1–D3 · 42 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E1(28) 0/1/110 · E2(40) 2/1/92 · E1(28) 3/1/80 · E1(28) 5/1/80 · E2(40) 6/1/92 · E1(28) 8/1/110 · E2(40) 10/1/92 · E1(28) 11/1/80 · G1(31) 13/1/80 · B1(35) 15/1/80
T2: E1(28) 16/1/110 · E2(40) 18/1/92 · E1(28) 19/1/80 · E1(28) 21/1/80 · E2(40) 22/1/92 · E1(28) 24/1/110 · F1(29) 26/1/92 · E1(28) 27/1/80 · D2(38) 29/1/80 · E2(40) 31/1/80
T3: C2(36) 32/1/110 · C3(48) 34/1/92 · C2(36) 35/1/80 · C2(36) 37/1/80 · C3(48) 38/1/92 · C2(36) 40/1/110 · C3(48) 42/1/92 · C2(36) 43/1/80 · E2(40) 45/1/80 · G2(43) 47/1/80
T4: D2(38) 48/1/110 · D3(50) 50/1/92 · D2(38) 51/1/80 · D2(38) 53/1/80 · D3(50) 54/1/92 · D2(38) 56/1/118 · D3(50) 57/1/88 · F#2(42) 58/1/100 · A2(45) 59/1/88 · D3(50) 60/1/118 · Eb2(39) 62/1/100 · E2(40) 63/1/88
```

**Spur AO-05 Doppelsägen-Oktavbass**
```
Tempo 132 BPM · 4 Takte · A minor · Akkorde: Am | F | C | G · Lage F1–C3 · 63 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: A1(33) 0/1/110 · A1(33) 1/1/80 · A2(45) 2/1/92 · A1(33) 3/1/80 · A1(33) 4/1/110 · A1(33) 5/1/80 · A2(45) 6/1/92 · A1(33) 7/1/80 · A1(33) 8/1/110 · A1(33) 9/1/80 · A2(45) 10/1/92 · A1(33) 11/1/80 · A1(33) 12/1/110 · A2(45) 13/1/80 · G2(43) 14/1/92 · E2(40) 15/1/80
T2: F1(29) 16/1/110 · F1(29) 17/1/80 · F2(41) 18/1/92 · F1(29) 19/1/80 · F1(29) 20/1/110 · F1(29) 21/1/80 · F2(41) 22/1/92 · F1(29) 23/1/80 · F1(29) 24/1/110 · F1(29) 25/1/80 · F2(41) 26/1/92 · F1(29) 27/1/80 · C2(36) 28/1/110 · F1(29) 29/1/80 · A1(33) 30/1/92 · F2(41) 31/1/80
T3: C2(36) 32/1/110 · C2(36) 33/1/80 · C3(48) 34/1/92 · C2(36) 35/1/80 · C2(36) 36/1/110 · C2(36) 37/1/80 · C3(48) 38/1/92 · C2(36) 39/1/80 · C2(36) 40/1/110 · C2(36) 41/1/80 · C3(48) 42/1/92 · C2(36) 43/1/80 · E2(40) 44/1/110 · C2(36) 45/1/80 · G2(43) 46/1/92 · C3(48) 47/1/80
T4: G1(31) 48/1/110 · G1(31) 49/1/80 · G2(43) 50/1/92 · G1(31) 51/1/80 · G1(31) 52/1/110 · G1(31) 53/1/80 · G2(43) 54/1/92 · G1(31) 55/1/80 · G1(31) 56/1/110 · G2(43) 58/1/92 · G1(31) 59/1/80 · B1(35) 60/1/118 · D2(38) 61/1/88 · F2(41) 62/1/100 · Ab2(44) 63/1/88
```

**Spur AO-06 Wortfetzen-Formant**
```
Tempo 122 BPM · 4 Takte · E phrygian · Akkorde: Em | Em | F | Em · Lage E3–C4 · 20 Noten
Format: Ton(MIDI) Start/Länge/Anschlag – Start und Länge in 16teln ab Takt 1, Anschlag 1–127
T1: E3(52) 0/1/100 · E3(52) 3/1/80 · G3(55) 6/2/96 · E3(52) 10/1/84 · B3(59) 12/3/100
T2: G3(55) 16/2/100 · E3(52) 20/1/80 · G3(55) 22/1/90 · B3(59) 24/4/96 · A3(57) 30/2/84
T3: C4(60) 32/1/104 · A3(57) 34/1/88 · F3(53) 36/2/92 · F3(53) 40/1/80 · F3(53) 41/1/80 · A3(57) 44/4/100
T4: B3(59) 48/3/100 · G3(55) 52/2/92 · F3(53) 56/4/96 · E3(52) 60/4/104
```

**Spur AO-07 Schaltwerk-Kit (Drums)**
```
Tempo 122 BPM · 8 Takte · 16tel (x = Schlag, . = Pause)
Takt 1–4
KICK  | x...x...x...x... | x...x...x...x... | x...x...x...x... | x...x...x...x.x.
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x.......x.x.
HH ZU | ..x...x...x...x. | ..x...x...x...x. | ..x...x...x.x.x. | ..x...x...x...x.
RIM   | .x.....x........ | .x.....x.....x.. | .x.....x........ | .x.x...x........
Takt 5–8
KICK  | x...x...x...x... | x...x...x..xx... | x...x...x...x... | x...x...x.x.x.xx
SNARE | ....x.......x... | ....x.......x... | ....x.......x... | ....x...x.x.xxxx
HH ZU | x.x.x.x.x.x.x.x. | x.x.x.x.x.x.xxx. | x.x.x.x.x.x.x.x. | x.x.x.x.........
RIM   | .x.....x........ | .x.....x...x.x.. | .x.....x.x...... | ................
```

### 6.2 Zusammenspiel („mit Band“)
- **Signal-Ensemble, 122 BPM, 8 Takte:** AO-01 (alle 8 Takte) + AO-07 (alle 8 Takte) + AO-06 in Takt 1–4 (gleiche Akkorde Em | Em | F | Em). In Takt 5–8 schweigt AO-06; dort öffnet AO-01 sein Filter am weitesten, und die Hi-Hat wechselt auf Achtel. Die Wendung in Takt 8: Tritonus B–F im Bass, Snare-Wirbel, Rückführung über E–F–E–E♭.
- **Variante „Funkfeuer“:** AO-02 statt AO-01 in Takt 1–4, AO-03 als Bass-Effekt nur in Takt 2 und 4 (eine Oktave tiefer mischen, nicht gleichzeitig mit AO-02-Tönen derselben Lage).
- **Typisch-And-One-Vergleich:** SZ-01 „Körper-Parade“ (126 BPM, `vorbild-szene.md`) direkt gegen AO-05 (132 BPM) hören lassen – Xander wählt, welche Farbe „typischer“ ist.

### 6.3 Warum rechtlich unbedenklich
- Alle Tonfolgen sind neu geschrieben. Ich kenne die Basslinie von „Ghama Voodoo“ nicht und habe nichts transkribiert; keine Folge wurde einem Titel „ähnlich gemacht“.
- Wiedererkennung kommt nur aus **Technik** (16tel-Sequenz mit Pausen, Oktavsprung, Sync-„Piu“, Ringmod, FM-Rückkopplung), **Klang** und **Allerwelts-Harmonik** (phrygisches Moll i–♭II, Tritonus-Wendung, i–VI–III–VII).
- Keine Samples, keine Sprachfetzen, kein Titel-, Band- oder Gerätename im Sound-Namen (E9). Im ⓘ: „erinnert an … (Stil)“ plus „Marken gehören ihren Inhabern, keine Verbindung.“
- Vor V10d hört ein Mensch gegen (wie in `vorbild-szene.md` §2.1 Regel 5).

### 6.4 Karten (Kurztexte für die Bibliothek)
AO-01 „Morse-Bass im Dunkeln – das Filter öffnet sich über acht Takte.“ · AO-02 „Sync-Bass mit Funk-‚Piu‘ in jedem Ton.“ · AO-03 „Metallischer Peilton im Tritonus (ab Klassiker-Bausteinen).“ · AO-04 „Knurrender FM-Bass mit Rückkopplung.“ · AO-05 „Galopp-Oktavbass aus zwei Sägen, pumpt mit der Kick.“ · AO-06 „Roboter-Silben ohne Worte.“ · AO-07 „Harter Beat mit Gated-Snare und Klick-Signalen.“ Tag für alle: `and-one` (Vorbild-Filter V10a).

---

## 7. Korrekturen an früheren Dateien

| Nr. | Datei / Stelle | Bisher | Neu | Status |
|---|---|---|---|---|
| K-AO-1 | Auftragstext („I.S.T. is from 1997?“) | 1997? | **1994** (1997 = „Nordhausen“) | BELEGT (§1) |
| K-AO-2 | `fragen-xander-9.md` Klarstellungen („Gamma“, „Voodoo“) | zwei Titel | **ein Titel „Ghama Voodoo“** (5:40) | BELEGT (Spotify); dass er auf „I.S.T.“ steht, nur für die Streaming-Fassung, dort WAHRSCHEINLICH als Bonustitel |
| K-AO-3 | `vorbild-szene.md` §0 und §4.1 (Album/Jahr der 5 Titel UNBELEGT) | unbekannt; „Military Fashion Show um 2006 aus Bodypop“ als eK | „Deutschmaschine“ Single 1995 (kein Album; heute Bonustitel der Streaming-Fassung von I.S.T.) · „Krieger“ Single aus „Aggressor“ 2003 · „Military Fashion Show“ erste Single aus „Bodypop“, 19.05.2006 · „Get You Closer“ aus „9.9.99 9 Uhr“ · „Sometimes“ weiter offen | WAHRSCHEINLICH (§1) |
| K-AO-4 | `vorbild-szene.md` §4.1 Beleg „Album I.S.T. 1994 bei Machinery“ | WAHRSCHEINLICH | **BELEGT** (zwei unabhängige Quellen) | §1 |
| K-AO-5 | `r8/studio-setups.md` §1.4 („two keyboards and a beatbox“) | BELEGT | **WAHRSCHEINLICH** (nur Wikipedia; nach der strengeren Skala, wie schon `vorbild-szene.md`) | §2.1 |
| K-AO-6 | `r8/studio-setups.md` §1.4, `vorbild-szene.md` §4.1 | Studio-Geräte UNBELEGT | ergänzen: **BELEGT** „nur Macintosh, 2 Macs im Studio“ (Interview 2002) – kein Synth-Modell | §2.2 |
| K-AO-7 | Ironcharts-Liste (beide Dateien) | UNBELEGT | bleibt UNBELEGT; zusätzlich Datierungsfehler (DX7 „1990“, eK: 1983) vermerken | §2.2 |
| K-AO-8 | `vorbild-szene.md` §4.1 „Selbstbezeichnung Body Pop“ | UNBELEGT ⚑ | weiterhin nur Albumtitel gefunden – nicht als Genre-Begriff in ⓘ-Texte | §1 |

---

## 8. Fragen an Xander (kurz)

1. **„Gamma“ und „Voodoo“:** Meinst du den einen Titel **„Ghama Voodoo“** (5:40)? Kennst du ihn von der I.S.T.-CD oder von der Deutschmaschine-Maxi? Und bei welcher Minute ist der „bedrohliche, signalartige“ Bass am deutlichsten?
2. **Was ist „signalartig“ für dich?** (a) kurze Töne mit Lücken wie Morse/Funk, (b) ein „Piu“/Laser in jedem Ton, (c) metallisch-unstimmig wie ein Peilton, (d) knurrend-digital. Die Hörproben AO-01 bis AO-04 zeigen genau diese vier. Wähle eine (oder zwei) – dann verfeinern wir nur die.
3. **Typischer And-One-Bass:** Eher SZ-01 (hart, gleichmäßig, I.S.T./Spot-Zeit) oder AO-05 (zwei Sägen, pumpend, Nordhausen-Zeit)?
4. Hast du die **CD von I.S.T.** (welche Fassung: englisch, deutsch, „Total“)? Ein Foto der Credits im Booklet wäre der beste Beleg für Geräte, Studio und wer die Bässe programmiert hat.

---

## 9. Offene Nachrecherche (wenn Web-Seiten wieder abrufbar sind)

- ⚑ Discogs-Eintrag „I.S.T.“ (alle Fassungen): Credits (Produktion, Technik, Studio, Keyboards), vollständige Titellisten, Position von „Ghama Voodoo“; Titelliste der Maxi „Deutschmaschine“ (steht „Ghama Voodoo“ dort?).
- ⚑ Seite https://ludd.ltu.se/~h-son/cd/a/ist.html vollständig lesen (11 Titel, Rezension).
- ⚑ Interview 2002 (shout.ru) vollständig lesen: Sequenzer-Programm, Geräte.
- ⚑ Print-Interviews 1994 (Zillo, Sonic Seducer, Orkus, Keyboards) zu I.S.T. – online kaum durchsuchbar.
- ⚑ Jahr von „9.9.99 9 Uhr“ und „Virgin Superstar“ (Quellen widersprechen sich).
- ⚑ Tempo und Tonart von „Ghama Voodoo“ (AcousticBrainz ist seit 2022 abgeschaltet: https://docs.beets.io/en/latest/plugins/acousticbrainz.html) – am einfachsten: Xander klopft das Tempo mit.

---

## 10. Quellen (alle nur als Suchauszug bzw. über den Spotify-Connector; keine Seite konnte geöffnet werden)

- Spotify (Vertriebs-Metadaten): Album „I.S.T.“ https://open.spotify.com/album/08aHAfQh86f8aj2YgsXavn · „Ghama Voodoo“ https://open.spotify.com/track/4ufLTs7KdeexR2MzlXblb5 · „Second Day“ https://open.spotify.com/track/1bCAsM5Nid4OLkv5wa36ca · „Body Nerv“ https://open.spotify.com/track/7u1VehDT3H9CqElTN4iqr7 · „Driving With My Darling“ https://open.spotify.com/track/5HlRJ3ZIO1fOPXqKNAWrmT · Album „Military Fashion Show“ https://open.spotify.com/album/2pQ0Rh8JHShKDnd7kCOqLQ · „Deutschmaschine“ (im Album „I.S.T.“) https://open.spotify.com/track/2CsQJz6cEFOt1tk06zFozC · Lyreka-Titelliste: https://www.lyreka.com/artist/and-one/albums
- Diskografie und Band: https://en.wikipedia.org/wiki/And_One_discography · https://www.chise.org/ipns/en.wikipedia-on-ipfs.org/wiki/And_One_discography · https://en.wikipedia.org/wiki/And_One · https://www.last.fm/music/And+One/+wiki · https://www.tvtropes.org/pmwiki/pmwiki.php/Music/AndOne · https://en.wikipedia.org/wiki/Bodypop · https://en.wikipedia.org/wiki/Aggressor_(And_One_album) · https://www.allmusic.com/album/virgin-superstar-mw0000472343
- I.S.T.: https://ludd.ltu.se/~h-son/cd/a/ist.html · https://mail.45worlds.com/cdalbum/cd/ma342 · https://www.cancioneros.com/letras/artista/2025/and-one
- Interview und Geräte: https://www.shout.ru/exclusives/exclusive_interview_with_Steve_2002_e.htm · https://ironcharts.com/musician/steve-naghavi · https://www.tiktok.com/@bluemoon_160_/video/7454629953917848878
- Allgemeine Bass-Technik: https://www.musicradar.com/how-to/create-your-own-simple-synth-bass-sound-in-6-easy-steps · https://www.izotope.com/en/learn/how-to-get-a-fat-deep-bass-sound
- Intern: `synq-snapshots/V0a.html` (Z. 2557, 2805, 2916–2933, 2980–2982, 3092, 3182, 5073, 5634–5663, 5709, 13769) · `dirigent-spec-v3-nachtrag-1.md` A.10 · `r7/vorbild-szene.md` §2.1, §4.1 · `r8/studio-setups.md` §1.4 · `fragen-xander-9.md`
