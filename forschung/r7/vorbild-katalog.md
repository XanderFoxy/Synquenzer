# R7 – Vorbild-Katalog (Master): Stammbaum, alle Signature-Sounds, Prioritäten, Doppelungen, offene Punkte

**Stand:** 17.10.2026 · Auftrag „vorbild-katalog“ · Xanders Wunsch (Runde 10, wörtlich): „Alle Pioniere des Synthie Pop … Auch die modernen Vertreter von Dark Wave EBM Industrial. Cold Wave Retrowave, alles, was mit Synthesizern zu tun hat, was an Synthiepop angelehnt und aufgebaut ist von Kraftwerk. Beginnend Gary Newman. Alles was signifikante segnet Sounds …“ (= Gary Numan, Signature-Sounds).

**Zusammengeführt (gelesen, nicht verändert):** `r7/vorbild-pop.md`, `vorbild-helden.md`, `vorbild-pioniere.md`, `vorbild-achtziger.md`, `vorbild-szene.md`, `vorbild-dark.md`, `vorbild-coldwave2.md`, `vorbild-ebm-dark.md`, `vorbild-cold-retro.md`, `vorbild-retro.md`, `vorbild-spezial.md` (+ `spezial-andone.md`, `spezial-vogue.md`, `spezial-slaphouse.md`), `r8/studio-setups.md`, `r6/bibliothek-recherche.md` (N01–N42, N69/N70, VORBILD-Tabelle), `dirigent-spec-v3.md` Anhang A.1/A.4, `SYNQUENZER-vision.md` Teil 3.1, `transposition-lage.md` §3, `fragen-xander.md` bis `-9.md`. Werks-Sounds aus `synq-snapshots/V0a.html` nur über die Angaben in diesen Dateien.

**Werkzeuge und Grenzen (ehrlich):**
- Dieser Lauf hat **keine neuen Sounds, Rezepte oder Hörproben** gebaut. Er ordnet, löst Widersprüche und prüft Lücken.
- **Neu recherchiert** wurden nur der Stammbaum (Einfluss-Kanten) und unklare Diktat-Namen: **16 WebSearch-Abfragen** und **4 Spotify-Katalog-Abfragen**. WebFetch wurde nicht benutzt (frühere Läufe: DNS-Fehler). Jeder neue Web-Fakt stützt sich auf **Suchauszüge (SE)**; keine Seite ist im Volltext gelesen.
- **Nichts ist angehört, nichts gemessen.** Alle Rezepte und Hörproben in den Quelldateien sind eigene Entwürfe (per Skript geprüft: Lage, Taktgrenzen, keine Takt-Wiederholung; Kontur-Prüfung siehe §8), Pegel nicht kalibriert (Ziel −18 LUFS).
- Die Master-Tabelle ist aus kuratierten Daten erzeugt und **maschinenlesbar**: `r7/katalog-work/katalog.json` (Generator `gen.py`, Daten `data.py`).

**Kennzeichen (strenge Skala, gilt für den ganzen Katalog – §4.6):**
- **B = BELEGT:** Primärquelle (Interview, Credits, Hersteller, Katalog) **oder** zwei unabhängige Quellen.
- **W = WAHRSCHEINLICH:** eine Sekundärquelle (auch Wikipedia allein, Nachbau-Artikel, Fan-Seite) oder Quellen widersprechen sich. **„W-schwach“** = nur Equipboard/Nutzerfoto → **nie** in einen ⓘ-Text.
- **U = UNBELEGT:** nichts gefunden, eigene Einschätzung (eK) oder Gedächtnis; „Stil“ = der Sound trifft ein Hörbild, kein Gerät. Nie als Fakt im ⓘ.
- **★ = Xanders Wunsch:** Xander hat genau diesen Klang bzw. diesen Act ausdrücklich genannt (Runden 2–10). ★-Sounds stehen immer in Tier 1 oder 2. Nicht verwechseln mit „W“ (Beleg).

**Lese-Schlüssel der Master-Tabelle (§2)**
- **Engine · Rezept-ID:** Engine (VA, FM6, WT, Drum, „[g]“ = Rezept in R6 offline gemessen) und die ID des Rezepts in der Quelldatei. Kurz-IDs aus `pop`, `hel`, `pio`, `ach`, `ret` tragen ein Präfix (`pio·MO1` ≠ `ret·MO1`, §4.1). Eindeutig ohne Präfix: `SZ-`, `DK-`, `C2-`, `EB-`, `CR-`, `AO-`, `VG-`, `SH-`, `N..` (R6), `A.1 #..` (Spec-Anhang A.1), „Werk“ (V0a, Name nach Spec A.4).
- **Hörprobe-ID:** `pop:` `r7/pop-work/aud-blocks.json` · `hel:` `helden-work/aud-blocks.md` (`AUD:`) · `pio:` `pioniere-work/aud-blocks.json` · `ach:` `achtziger-work/aud-achtziger.json` · `ret:` `retro-work/aud-retro.json` · `ebm:` `ebm-work/aud-ebm.json` · `cr:` `cold-retro-work/aud-blocks.json` · `szn:` `vorbild-szene-aud.json` (eigene Spur im Act-Hörbeispiel) · `dark:` `vorbild-dark-aud.json` (Act-Hörprobe, eigene Spur) · `cw2:„…“` Notenliste im Act-Hörbeispiel von `vorbild-coldwave2.md` · `ao..` `spezial-andone-aud.json` · `vg-v..` `vogue-work/aud-out.md` · `sh-h..` `slaphouse-work/aud-out.md` · „A.1-Phrase“ = Vorhör-Phrase aus Spec A.1 (keine 4–8-Takt-Probe) · **„♫ fehlt“** = noch keine Hörprobe · „alt“ = zweite Hörprobe (§4.4).
- **Lage-Default** (Vorschlag für `sound.lage` und `sound.dirAt`, `transposition-lage.md` §3.3/§3.5/§3.7; an der eigenen Hörprobe geprüft): `≤D3` = Grundton-Klammer hoch D3 (Bass: Boden E1) · `≥A4` = tief A4 · `C3–C5` = Klammer · `(+Okt.)` = Oktave über dem Grundton darf mit · `↓` = nächstliegend, Gleichstand abwärts (Bass-Regel) · `↑` = nächstliegend, Gleichstand aufwärts (Sequenz) · `Taste` = folgt der Oktave der Taste (Lead) · `Stf` = Fläche mit Stimmführung · `Block` = Stab geht als Block (Rolle Sequenz) · `dirAt{X↓}` = feste Richtung beim Akkord-Grundton X · `hart` = Bass bleibt immer drin · `Rolle` = keine Vorgabe, Auto-Klammer der Rolle.
- **Tier:** 1, 2, 3 (§3); „★“ = Xanders Wunsch; „Doppel → X“ = in X aufgegangen (§4.3); „Werk“ = Werks-Sound ohne eigene Vorbild-Hörprobe; „1?“ = Tier-1-Kandidat ohne Rezept.
- **Quelle:** `pop` `vorbild-pop.md` · `hel` `vorbild-helden.md` · `pio` `vorbild-pioniere.md` · `ach` `vorbild-achtziger.md` · `szn` `vorbild-szene.md` · `dark` `vorbild-dark.md` · `cw2` `vorbild-coldwave2.md` · `ebm` `vorbild-ebm-dark.md` · `cr` `vorbild-cold-retro.md` · `ret` `vorbild-retro.md` · `spz` `vorbild-spezial.md` (+ `spezial-*.md`) · `r6` `r6/bibliothek-recherche.md` · `r8` `r8/studio-setups.md` · `A.1` Spec v3 Anhang A.1 · `Werk` V0a.
- *Kursiv* hinter dem Namen: Hinweis (⚙ = braucht einen fehlenden Baustein, ≈ = fast gleich wie …, ♫ = Hörprobe fehlt).

---

## 0. Kurzfazit

- **Umfang:** 111 Acts (davon 1 Kandidat: Joy Division) mit **334 Katalog-Einträgen** (Sounds und Kits):
  - 253 aus R7 (alle neuen Sounds der 11 Vorbild- und Spezial-Dateien),
  - 43 aus R6 (N17, N19, N21 sind in ihren verfeinerten R7-Fassungen aufgegangen),
  - 24 aus Spec A.1 (4 davon gehen in neuere R7-Sounds auf),
  - 13 Werks-Sounds mit Vorbild-Bezug und 1 Lücke.
- **Stammbaum (§1):** acht Linien von Tomita/Kraftwerk/Jarre/Moroder (1974–77) über Ultravox → Gary Numan, Kraftwerk → OMD → Vince Clarke → Depeche Mode/Yazoo/Erasure, DAF und Front 242 (EBM), Skinny Puppy (Industrial), Futurepop, die Cold-Wave-Linie (Frankreich 1980 → Italien 1993 → Minimal-Wave-Revival 2005) bis Retrowave („Drive“ 2011) und Slap House (2020). Jede Kante hat Status und Quelle.
- **Prioritäten (§3):**
  - **Tier 1 = 43 Sounds** (29 neu aus R7, 11 aus R6, 2 Werk, 1 A.1) + 1 Kandidat. 36 davon haben Gerät oder Arbeitsweise BELEGT/WAHRSCHEINLICH; 7 sind Xanders ausdrückliche Wünsche mit reinem Stil-Beleg.
  - **Tier 2 = 90** (47 davon ★ Xanders Wünsche; 16 sind Werk- oder A.1-Sounds, die es ohnehin gibt).
  - **Tier 3 = 194:** kommen **nicht** in die Werksbibliothek; das Rezept bleibt im Katalog.
  - Ergebnis: **114 neue Sounds** für die Werksbibliothek statt rund 300. Seit der Review-Prüfung (§8): Rolle Akkord/Stab in Tier 1 (EB-03), Soft Cell ach·SC1 in Tier 1, Pet Shop Boys ach·PS1/PS2 in Tier 2.
- **Doppelungen und Widersprüche (§4):** 10 ID-Kollisionen (z. B. `MO1` Moroder ≠ `MO1` Michael Oakley), 3 gleiche Namen („Gummi-Bass“, „Kathedralen-Chor“, „Marmor-Streicher“), rund 20 Klang-Doppel, 5 Sounds mit zwei Hörproben, 3 verschiedene Beleg-Skalen. Alle mit Entscheidung.
- **Diktat-Namen (§5.1):**
  - **In diesem Lauf neu gefunden:** „Radio Station“ = Titel von Static Movement auf „Visionary Landscapes“ (BELEGT, Spotify); „Zviad Bekauri – Me Am Ghame“ = sehr wahrscheinlich „Am Ghames“ (Titel BELEGT, Deutung WAHRSCHEINLICH).
  - **Weiter offen:** „Lause“ und „Ben V“, „keit … Polylog“, die „SexyBack“-Elektro-Version, „proWIN“, „Eindhoven“, „Andy Pop/Antipop“ und die Quelle für „Kawai K1“.
  - **„die Music“ ist geklärt** (Digital Musician, Runde 9); dazu braucht es keine Rückfrage mehr.
- **Größte Lücken (§5.2):**
  - Tier 1 „Hohltropfen“ (Human League, „Being Boiled“) hat noch **keine Hörprobe**.
  - Der belegte Alphaville-Quintenbass („Big in Japan“, System-100M) hat **kein Rezept**.
  - Es fehlen Phaser, Flanger, Arp ZUFALL, Ringmod und die FM-Hüllkurven-Reparatur.
  - Für rund 50 Acts ist **kein Gerätemodell** belegt (Liste §5.2); ihre Sounds sind Stil-Entwürfe.

---

## 1. Stammbaum: Wer hat wen geprägt?

### 1.1 Übersicht (Linien; [B]/[W]/[U] = Status der Einfluss-Kante)

```
WURZELN 1974–1979
Tomita 1974 · Kraftwerk 1974 · Jarre 1976 · Moroder 1977 · Suicide 1977 · YMO 1978 · Vangelis (CS-80)
 │
 ├─ Kraftwerk ─► OMD (McCluskey sieht Kraftwerk 1975 [B]) ─► Vince Clarke (OMD-Single brachte ihn zum Synth [B])
 │                                                            └─► Depeche Mode 1981 ─► Yazoo 1982 ─► Erasure 1985 [B]
 ├─ Kraftwerk ─► The Human League („Reproduction“ 1979 [W]) ─► Heaven 17 (1980 [W])
 ├─ Kraftwerk ─► Soft Cell (Ball [W]) · Telex (Zug-Motiv [W]) · New Order (Chor angeblich aus „Uranium“ [W])
 ├─ Ultravox/Foxx 1977 ─► Gary Numan 1979 („größte Inspiration“ [B]) ─► Nine Inch Nails („Metal“-Cover 2000 [B])
 ├─ Ultravox/Currie ─► Visage 1980 [W]
 ├─ The Normal 1978 (erste Mute-Platte) ─► Fad Gadget 1979 [B] · Depeche Mode (ARP-Sequenzer von Daniel Miller [B])
 └─ Moroder 1977 ─► Sparks 1979 [B] · Italo Disco 1979–85 [W] ─► Eurodisco (Modern Talking 1984)
                                                                └─► 2020 Slap-House-Neufassung „Brother Louie“ [B]
EBM · INDUSTRIAL (ab 1981)
DAF „Körpermusik“ 1981 [W] ─► Nitzer Ebb (Vorlage [W]) · Die Krupps
Front 242 „Electronic Body Music“ 1984 [B] (Vorbilder u. a. Kraftwerk, Throbbing Gristle, Moroder [W])
Cabaret Voltaire / Throbbing Gristle ─► Skinny Puppy 1982 [W] ─► Front Line Assembly 1986 [B]
Dark Electro (Leæther Strip, Suicide Commando) ─► Aggrotech (Hocico 1993, Agonoize 2002, Combichrist 2003 „TBM“) [B/W]

DEUTSCHE UND EUROPÄISCHE SYNTHPOP-SZENE (ab 1984)
Depeche Mode ─► Camouflage 1984 [W] · Cetu Javu [W] · And One 1989 [W] (─► „Bodypop“)
Alphaville 1984 · Wolfsheim 1987 · Second Decay 1987/89 · De/Vision 1988 · Elegant Machinery 1988 · Project Pitchfork 1989 · Welle:Erdball (C64)
VNV Nation + Apoptygma Berzerk ─► Begriff „Futurepop“ [B] ─► Covenant, Rotersand, Seabound, Neuroticfish, Assemblage 23 …

COLD WAVE · MINIMAL WAVE · DARKWAVE
„Cold Wave“ (Sounds, 26.11.1977, Heft mit Kraftwerk [W]) ─► Frankreich 1980–86 (Kas Product, Martin Dupont, Trisomie 21, Asylum Party) [B]
 ─► Clan of Xymox (NL, 4AD) · Kirlian Camera (IT 1979) ─► Italien 1990er (The Frozen Autumn 1993, Static Movement 1998) [B]
 ─► Minimal-Wave-Revival ab 2005 (Label Minimal Wave [B]) ─► Sixth June 2007, Lebanon Hanover 2010, Linea Aspera 2011,
    Boy Harsher, Molchat Doma 2018 (New-Order-Einfluss [W])

RETROWAVE · SYNTHWAVE · DARKSYNTH
John Carpenter · Vangelis („Blade Runner“) · Jarre · Tangerine Dream · 80er-TV (Jan Hammer) [W]
 ─► College, Kavinsky (Mitte 2000er, „im Stil von 80er-Filmmusik“ [W]) ─► „Drive“ 2011 [B/W]
 ─► The Midnight, FM-84, Timecop1983, Gunship, Mitch Murder (Hardcastle, Hammer, DiCola [B]), Lazerhawk, Michael Oakley …
 ─► Darksynth: Carpenter Brut, Perturbator, Dance With the Dead (Carpenter, Justice, Daft Punk, Metallica [B])

SEITENLINIEN (Xanders Wünsche)
Vogue 1988 (Casio FZ-1 [W]) · Van Halen „Jump“ 1984 (OB-X/OB-Xa [W]) · Enigma (Atmos) · Electroclash 2001 (Tiga & Zyntherius,
Cover von Corey Hart 1984 [B]) · Slap House 2018–20 („Brazilian Bass“ als Vorläufer [W], VIZE prägt den Begriff [B])
```

### 1.2 Zeitleiste mit Belegen

| Jahr | Linie | Ereignis bzw. Einfluss (wer → wen) | Status | Quelle |
|---|---|---|---|---|
| 1974 | Wurzeln | Kraftwerk „Autobahn“: Minimoog-Bass mit Oktav-Riff und Echo | B | `hel` §3.1 (hifinews, Wikipedia) |
| 1974 | Wurzeln | Tomita „Snowflakes Are Dancing“: Moog III + Mellotron, Pfiffe, Glocken | B | `hel` §6.1 |
| 11.09.1975 | Kraftwerk → OMD | McCluskey sieht Kraftwerk im Liverpool Empire („year zero“), nennt sie „huge influence“; „Electricity“ zeigt es | B (2 Interviews) | https://www.getintothis.co.uk/2013/05/omd_were_still_trying_to_be_th/ · https://www.westword.com/music/andy-mcclusky-of-omd-on-dazzle-ships-the-influence-of-70s-krautrock-and-peter-saville-5675743/ |
| 1976 | Wurzeln | Jarre „Oxygène“: Eminent 310 + Phaser, RMI, VCS3, ARP 2600 | B | `hel` §5.1 |
| 1977 | Wurzeln | Moroder/Summer „I Feel Love“: Moog Modular + Delay | B | `pio` §3.1 |
| 1977 | Moroder → Italo | Italo-Sound „direkt beeinflusst“ von Moroders Synth-Disco; „From Here to Eternity“ (1977) als frühe Vorlage; Name „Italo Disco“ über ZYX-Sampler | W | https://en.wikipedia.org/wiki/Italo_disco · https://www.masterclass.com/articles/italo-disco-guide · https://beatcaffeine.com/from-here-to-eternity-giorgio-moroders-classic-1977-italo-disco-album/ |
| 1977 | Wurzeln | Suicide-Debüt (Farfisa, Rhythmusbox, Eventide-Delay) | B | `pio` §3.11 |
| 1977 | Ultravox → Numan | Foxx: „Hiroshima Mon Amour“ = erster Synthpop-Song (W); Numan nennt die Foxx-Ultravox als größte Inspiration, „Systems of Romance“ = „genau wohin ich wollte“ | B (2 Auszüge) | `pio` §3.4 · https://stage1.thequietus.com/?p=673 · https://www.electricityclub.co.uk/?p=142308 · https://wikipedia.com/wiki/Quiet_Men |
| 26.11.1977 | Begriff „Cold Wave“ | Sounds-Heft „New Musick“ mit Kraftwerk auf dem Titel; ob das Wort dort oder im Siouxsie-Artikel zuerst stand, ist umstritten | W | https://en.wikipedia.org/wiki/Cold_wave_(music) · https://en.wikipedia.org/wiki/New_musick · https://faroutmagazine.co.uk/what-is-coldwave-music/ |
| 1978 | Human League | „Being Boiled“: Korg 700S + System-100 | B | `r8` §1.14 |
| 1978 | The Normal → Mute | „T.V.O.D.“ = erste Mute-Platte; Miller → Fad Gadget (1979), DM (ARP-Sequenzer für „Speak & Spell“) | B | `pio` §3.13–3.14 |
| 1978 | Wurzeln | YMO-Debüt: Moog III-C + Roland MC-8 | B | `pio` §3.2 |
| 1979 | Kraftwerk → Human League | „Reproduction“ (1979) „largely influenced by Kraftwerk“ | W (1 Bio) | https://last.fm/music/The+Human+League/+wiki · https://tramlines.org.uk/lineup/human-league/ |
| 1979 | Numan | „Are ‚Friends‘ Electric?“, „Cars“: Minimoog, Polymoog „Vox Humana“ | B | `pio` §3.3 |
| 1979 | Moroder → Sparks | „No. 1 in Heaven“ mit Moroder | B | `pio` §3.8 |
| 1979/80 | OMD → Vince Clarke → DM | Clarke: OMD („Electricity“ laut SOS, B-Seite „Almost“ laut MusicRadar) brachte ihn zum Synth; dazu frühe Human League und The Normal | B (Clarke-Zitate) | https://www.soundonsound.com/people/vince-clarke-electronic-music-pioneer · https://musicradar.com/news/vince-clarke-im-not-a-good-enough-keyboard-player-to-write-on-the-synth |
| 1980 | Ultravox → Visage | „Fade to Grey“ (Grundbeat CR-78 B; Drum-Break laut Interview 1984 aus dem Fairlight – Widerspruch §4.7); Moog-Bass ergänzt durch Billy Curries ARP Odyssey | W | `pio` §3.5 |
| Ende 1980 | Human League → Heaven 17 | Ware und Marsh verlassen die Human League und gründen Heaven 17 | W (1 Bio) | https://last.fm/music/The+Human+League/+wiki |
| 1981 | DAF | DAF nennen ihren Stil „Körpermusik“ | W | https://en.wikipedia.org/wiki/Electronic_body_music |
| 1981 | Synthpop-Durchbruch | DM „Speak & Spell“ (ARP-Sequenzer B), Soft Cell „Tainted Love“ (SB-100, CR-78 B; Ball: „Kraftwerk so einflussreich wie die Beatles“, nur Artikeltitel W), OMD „Architecture & Morality“ (Mellotron B), Human League „Dare“ (LM-1 B) | B/W | `pop` §3, §6, §7 · `ach` §2.1 |
| 1981 | Kraftwerk | „Computer World“ (Taschenrechner B, Sprachchip W) | B/W | `pio` §3.15 |
| 1982 | Clarke → Yazoo → Erasure (1985) | Pro-One + MC-4, TR-808 (Yazoo); „Chorus“ 1991 nur Analog per MC-4 | B | `pop` §9 |
| 1982 | Industrial | Skinny Puppy (Vancouver); Vorbilder u. a. Chrome, Kraftwerk, Cabaret Voltaire, Throbbing Gristle; gilt als Gründer des Electro-Industrial | W | https://www.sputnikmusic.com/band/Skinny+Puppy · https://side-line.com/?p=21905 · https://en.wikipedia.org/wiki/Electro-industrial |
| 1982 | Vangelis | „Blade Runner“: CS-80 mit Ribbon/Aftertouch (B); später als Einfluss auf Synthwave genannt (W) | B/W | `pio` §3.9 · https://en.wikipedia.org/wiki/Synthwave |
| 1983 | New Order | „Blue Monday“: Moog Source + Powertran, DMX (B); Chor angeblich aus Kraftwerk „Uranium“ (W) | B/W | `pop` §8, R6 §1 |
| 1984 | EBM | Front 242 „No Comment“: erste Nennung „Electronic Body Music“; Bressanutti: Begriff gab es schon vorher; Vorbilder u. a. Kraftwerk, Throbbing Gristle, Moroder, Tangerine Dream (W) | B | https://en.wikipedia.org/wiki/No_Comment_(Front_242_album) · https://en.wikipedia.org/wiki/Electronic_body_music |
| 1984–88 | Deutscher Synthpop | Alphaville 1984; Camouflage (gegr. 1984, „The Great Commandment“ 1987/88) „vor allem von Depeche Mode beeinflusst“; Cetu Javu „wie Depeche Mode“ | W | https://forcedexposure.com:443/Artists/CAMOUFLAGE.html · https://rave-and-roll.com/tag/camouflage/ · `ach` §2.9 |
| 1985–87 | DAF → Nitzer Ebb | „Der Mussolini“/„Alles ist gut“ als Vorlage für Nitzer Ebb (Blogs) | W | https://postpunkmonk.com/2012/08/27/ndw-week-montag-d-a-f-der-mussolini · https://lisathatcher.com.au/2012/03/05/alles-ist-gut-daf-give-us-sound-sex/ |
| 1986 | Skinny Puppy → FLA | Bill Leeb gründet Front Line Assembly nach seinem Ausstieg bei Skinny Puppy | B | `ebm` §3.2 |
| 1980–86 | Französische Cold Wave | Kas Product (1980), Martin Dupont (1980), Trisomie 21 (1980/81), Asylum Party (1985) | B | `cr` §3.1–3.4 |
| 1985–86 | Darkwave (NL) | Clan of Xymox (4AD), Peel Sessions 1985 | B/W | `cr` §3.9 |
| 1987–89 | Deutsche/skandinavische Szene | Wolfsheim 1987, Second Decay 1987/89, De/Vision 1988, Elegant Machinery 1988, And One 1989 (Vorbild Depeche Mode W), Project Pitchfork 1989 | B/W | `cw2` §3.2 · `ebm` §3.6 · `spz`/`spezial-slaphouse` §5 · `szn` §4 |
| 1988 | Seitenlinie | Vogue „Himmlische Klangdimensionen“, „the very special souds by FZ 1 (Casio)“ | W | `spezial-vogue` §1 |
| 1990er | Dark Electro → Aggrotech | Leæther Strip; Suicide Commando (SH-101 + DR-55 W, eine Quelle, nicht reproduziert); Hocico 1993; später Agonoize 2002, Combichrist 2003 („Techno Body Music“ W) | B/W | `ebm` §2.5, §3.5 · `cw2` §3.3 |
| 1993–99 | Italienische Cold Wave | The Frozen Autumn (Turin 1993), Static Movement (1998, „Visionary Landscapes“ 1999) | B | `r8` §1.1–1.2 |
| um 2000 | Futurepop | Begriff aus einem Gespräch Ronan Harris (VNV Nation) – Stephan Groth (Apoptygma Berzerk) | B | `ebm` §3.3 |
| 2000 | Numan → Industrial-Rock | Nine Inch Nails covern „Metal“ (2000); Reznor hörte „The Pleasure Principle“ (W) | B/W | https://faroutmagazine.co.uk/nine-inch-nails-gary-numan-perform-cars/ · https://www.nin.wiki/Gary_Numan · https://electronicbeats.net/mr-style-icon-gary-numan-on-trent-reznor |
| 2001 | Electroclash | Tiga & Zyntherius „Sunglasses at Night“ (Cover von Corey Hart 1984) | B | `spezial-slaphouse` §1 |
| ab 2005 | Minimal-Wave-Revival | Label Minimal Wave (Veronica Vasicka, 2005): Wiederveröffentlichungen früher Synth- und Coldwave-Acts (u. a. Martin Dupont), Coldwave-Renaissance | B | https://minimal-wave.org/artists/artist/veronica-vasicka · https://wesleydoylewrites.substack.com/p/i-sensed-a-profound-need-to-preserve · https://ra.co/podcast/663 · https://www.treblezine.com/?p=2698 |
| Mitte 2000er | Retrowave-Ursprung | College (David Grellier) und Kavinsky „im Stil von 80er-Filmmusik“; Bezugsgrößen Carpenter, Jarre, Vangelis, Tangerine Dream | W | https://en.wikipedia.org/wiki/Synthwave |
| 2011 | „Drive“ | Kavinsky „Nightcall“, College & Electric Youth „A Real Hero“ im Film (B); „großer Einfluss“ auf Synthwave (W) | B/W | `cr` §4.1, §4.4 · https://en.wikipedia.org/wiki/Synthwave |
| 2007–2018 | Neue Cold/Minimal Wave | Sixth June 2007, Lebanon Hanover 2010, Linea Aspera 2011, Boy Harsher, Molchat Doma „Etazhi“ 2018 („Sudno“ von New Order beeinflusst W; TikTok-viral 2020 B) | B/W | `cw2` §3.1 · `cr` §3.5–3.8 |
| 2010er | Synthwave/Darksynth | The Midnight, FM-84 („Atlas“ 2016), Timecop1983, Gunship (2014), Mitch Murder (Vorbilder Hardcastle, Hammer, DiCola B), Carpenter Brut, Perturbator, Dance With the Dead (Einflüsse Carpenter, Justice, Daft Punk, Metallica B) | B/W | `ret` · `cr` §4.3, §4.6 |
| 2016–2020 | Slap House | „Brazilian Bass“ (Alok) als Vorläufer (W); Dynoro „In My Mind“ (2018) als Durchbruch (B); VIZE prägt den Begriff (B); 2020 „Brother Louie“ von VIZE × Imanbek × Dieter Bohlen (Neufassung von Modern Talking, B) | B/W | `cw2` §4.1 · `cr` §6.1 · `spezial-slaphouse` §1 |

---

## 2. Master-Tabelle: alle Vorbild-Sounds

Eine Zeile = ein Sound oder Kit. Wo viele schwach belegte Sounds eines Acts in Tier 3 liegen, stehen sie gesammelt in einer Zeile (IDs mit „·“ getrennt). Gerät = was über das **Original** belegt ist, nicht über unser Rezept (alle Rezepte sind eigene Entwürfe). Rezept, volle Notenliste und `aud`-Daten stehen in der Quelldatei unter der Rezept-ID. Reihenfolge: nach Linie (§1), innerhalb der Linie ungefähr nach Zeit.

### 2.1 A · Wurzeln 1974–1982 (Pioniere)

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| Isao Tomita | Elektronik-Pionier | Pfeif-Stimme | Moog III, Pfiff-Patch: Diagramm B, Bauweise W | VA · hel·T1 | hel:t1 | Lead hoch | ≥C4 · Taste (G5–C6 vor Freigabe messen) | 1 · ★ | hel |
| Isao Tomita | Elektronik-Pionier | Eisglocke | Glocken + Ringmod B; FM = Annäherung U | FM6 · hel·T2 | hel:t2 | Glocke/Akzent | ≥C5 · Taste | 3 | hel |
| Isao Tomita | Elektronik-Pionier | Nebel-Chor | Mellotron 8-Voice-Choir W | WT · hel·T3 | hel:t3 | Fläche | C3–C5 · Stf, Am↓ | 3 | hel |
| Kraftwerk | Elektronik-Pionier | Fahrbahn-Bass | Minimoog B | VA · hel·K1 | hel:k1 | Bass, Achtel-Oktaven | ≤D3 · ↓ | 1 · ★ | hel |
| Kraftwerk | Elektronik-Pionier | Rechenwerk-Sequenz | Synthanorma-Sequenzer B (steuert Minimoog: W) | VA · hel·K2 | hel:k2 | Sequenz Mitte | ≤C5 · ↑ | 1 · ★ | hel |
| Kraftwerk | Elektronik-Pionier | Laufsteg-Lead — *Mod-Wert K-12 korrigieren* | Polymoog oder Minimoog W (uneinig) | VA · hel·K3 | hel:k3 | Lead | ≥A4 · Taste | 3 | hel |
| Kraftwerk | Elektronik-Pionier | Metall-Pads | eigene E-Pads B; Klang U | Drum · hel·K4 | hel:k4 | Drums | – | 2 | hel |
| Kraftwerk | Elektronik-Pionier | Rechner-Piep | Taschenrechner-Töne B (Modell W) | VA · pio·KW5 | pio:kw5 | Sequenz/Akzent hoch | ≥C5 · ↑ | 3 | pio |
| Jean-Michel Jarre | Elektronik-Pionier | Phasen-Streicher — *⚙ Phaser fehlt (Chorus BREIT)* | Eminent 310 + Small-Stone-Phaser B | VA · hel·J1 | hel:j1 | Fläche | C3–C5 · Stf | 1 · ★ | hel |
| Jean-Michel Jarre | Elektronik-Pionier | Raum-Lead 76 — *⚙ Flanger fehlt* | RMI + Flanger W | VA · hel·J2 | hel:j2 | Lead | ≥G4 · Taste | 3 | hel |
| Jean-Michel Jarre | Elektronik-Pionier | Rhythmus-Kiste 76 | Korg/Keio Mini Pops B (2 Muster: W) | Drum · hel·J3 | hel:j3 | Drums | – | 3 | hel |
| Jean-Michel Jarre (Berliner Schule) | Elektronik-Pionier | Pfeif-Sequenz · Berlin-Schule (Werk) | Bauweise U | VA · Werk | – | Sequenz | Rolle | Werk | Werk |
| Jean-Michel Jarre (Stil) | Elektronik-Pionier | Tropfen-Plopp · Tropfen-Ping — *♫ keine Hörprobe* | Original U (ersetzt den falsch gebauten Werks-„Tropfen“) | VA [g] · N69 · N70 | – | Atmo/Sequenz | – | 3 | r6 |
| Giorgio Moroder | Disco/Elektronik | Disko-Puls (V0a „Moroder-Puls“) | Moog Modular + Delay B | VA · Werk | pio:mo1 (alt ret:lh2) | Sequenz/Bass | ≤D3 · ↓ | 1 | Werk·pio |
| Giorgio Moroder | Disco/Elektronik | Fluchtweg-Lead | SH-2000 („Chase“) W | VA · pio·MO2 | pio:mo2 | Lead | ≥C5 · Taste | 3 | pio |
| Giorgio Moroder | Disco/Elektronik | Disko-Kit 77 | Rausch-Hi-Hat + gespielte Kick B | Drum · pio·MO3 | pio:mo3 | Drums | – | 2 | pio |
| Suicide | Proto-Elektronik | Kellerorgel-Drone | Farfisa + EHX-Verzerrer B | VA · pio·SU1 | pio:su1 | Riff/Drone | G2–C3 · nächstl. (Block) | 2 | pio |
| Suicide | Proto-Elektronik | Billig-Rhythmus | Seeburg Rhythm Prince B | Drum · pio·SU2 | pio:su2 | Drums | – | 3 | pio |
| Cabaret Voltaire | Industrial-Funk | Draht-Sequenz | EMS Synthi A / SH-09 W | VA · pio·CV2 | pio:cv2 | Sequenz | ≤C4 · ↑ | 3 | pio |
| Cabaret Voltaire | Industrial-Funk | Werkhallen-Kit | Drumcomputer W, Klänge U | Drum · pio·CV3 | pio:cv3 | Drums | – | 3 | pio |
| Ultravox | New Wave | Funkenbogen-Sync | ARP Odyssey mit Osz.-Sync B | VA · pio·UV1 | pio:uv1 | Lead | ≥C5 · Taste | 2 | pio |
| Ultravox | New Wave | Bossa-Kiste 77 | TR-77 (oder CR-78) Bossa-Preset W | Drum · pio·UV2 | pio:uv2 | Drums | – | 3 | pio |
| Yellow Magic Orchestra | Technopop | Kleinschritt-Sequenz | Moog III-C + MC-8 B (Part U) | VA · pio·YM1 | pio:ym1 | Sequenz | ≤D5 · ↑ | 2 | pio |
| Yellow Magic Orchestra | Technopop | Laternen-Lead | Gerät je Titel U (Prophet-5 ab 1979 live B) | VA · pio·YM2 | pio:ym2 | Lead | ≥C5 · Taste | 3 | pio |
| Yellow Magic Orchestra | Technopop | Galopp-Kit 79 | Galopp-Muster + Syndrum W | Drum · pio·YM3 | pio:ym3 | Drums | – | 3 | pio |
| The Normal | Minimal-Elektronik | Kunstleder-Riff (Vorschlag „Schnarr-Riff“) | Korg 700S W | VA · pio·NO1 | pio:no1 | Bass/Riff | ≤B♭1 (Okt. bis B♭2) · ↓ | 3 | pio |
| The Normal | Minimal-Elektronik | Aufprall-Kit | U (Annahme) | Drum · pio·NO2 | pio:no2 | Drums | – | 3 | pio |
| Gary Numan / Tubeway Army | Synthpop-Pionier | Kaltfront-Riff — *⚙ Phaser fehlt; Name nah an C2-01* | Minimoog B (Phaser W) | VA · pio·NU1 | pio:nu1 | Riff, Bariton-Lage | G2–C3 · ↓ (Block) | 1 · ★ | pio |
| Gary Numan / Tubeway Army | Synthpop-Pionier | Menschenstimme-Fläche | Polymoog-Preset „Vox Humana“ B | VA · pio·NU2 | pio:nu2 | Fläche/hohe Melodie | C3–C5 · Stf | 1 · ★ | pio |
| Telex | Synthpop (BE) | Zuckerguss-Lead | Minimoog/VCS3 W (Titel U) | VA · pio·TX1 | pio:tx1 | Lead | ≥C5 · Taste | 3 | pio |
| Telex | Synthpop (BE) | Tanzschritt-Bass | Minimoog W | VA · pio·TX2 | pio:tx2 | Bass | F1–E♭2 (+Okt.) · ↓ | 3 | pio |
| The Buggles | Synthpop | Ensemble-Streicher (Werk) | Solina + Minimoog + Prophet-5 B (Part U) | VA · Werk | pio:bg1 (alt cr:cr07) | Fläche | C3–C5 · Stf | 2 | Werk·pio |
| The Buggles | Synthpop | Handspiel-Kette | von Hand statt Sequenzer B; Klang U | VA · pio·BG2 | pio:bg2 | Sequenz | ≤D5 · ↑ | 3 | pio |
| Sparks | Disco-Synthpop | Himmelsleiter-Sequenz | geschichtete Sequenzer (mit Moroder) B; Geräte U | VA · pio·SP1 | pio:sp1 | Sequenz | ≤E4 · dirAt{F♯↓} | 3 | pio |
| Sparks | Disco-Synthpop | Lichtsäulen-Fläche | Säge-Flächen B (Beschreibung) | VA · pio·SP2 | pio:sp2 | Fläche | A2–C5 · Stf | 3 | pio |
| Visage | New Romantic | Grauschleier-Bass — *Name nah an C2-03* | Moog-Bass W | VA · pio·VI1 | pio:vi1 | Bass | ≤D2 (Okt. bis D3) · ↓ | 3 | pio |
| Fad Gadget | Synthpop (Mute) | Werkstatt-Kit — *⚙ steigender Ton im Drum-Synth* | ARP-2600-Kick + Bohrmaschine W | Drum · pio·FG1 | pio:fg1 | Drums | – | 3 | pio |
| Fad Gadget | Synthpop (Mute) | Kipp-Sequenz | ARP 2600 W | VA · pio·FG2 | pio:fg2 | Sequenz | ≤D4 · ↑ | 3 | pio |
| Japan | Art-Pop | Geisterton | Roland System 700 W | VA · pio·JP1 | pio:jp1 | Atmo/Akzent | C3–C5 · Block | 3 | pio |
| Japan | Art-Pop | Holzklang-Marimba | echte Marimba B; Synth-Annäherung | FM6 · pio·JP2 | pio:jp2 | Pluck/Sequenz | ≥C4 · ↑ | 3 | pio |
| Japan | Art-Pop | Bundlos-Bass | echter Bundlos-Bass B; Annäherung | VA · pio·JP3 | pio:jp3 | Bass | ≤A2 (Okt. bis C3) · ↓ | 3 | pio |
| Vangelis | Filmmusik | Sternfall-Brass — *⚙ Aftertouch/Ribbon fehlt (Mod-Rad)* | CS-80 mit Anschlag/Aftertouch/Ribbon B | VA · pio·VG1 | pio:vg1 | Lead (Blech) | ≥G3 (≤D5) · Taste | 1 · ★ | pio |
| Vangelis | Filmmusik | Weite 82 (Werk) | CS-80 B | VA · Werk | ret:lm2 | Fläche | C2–D4 · Stf | 2 · ★ | Werk·ret |

### 2.2 B · Synthpop und New Wave 1979–1991

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| OMD | Synthpop | Wanderer-Lead | Korg Micro-Preset („Traveller“) B | VA [g] · N07 | pop:n07 | Lead | ≥A4 · Taste | 1 · ★ | r6·pop |
| OMD | Synthpop | Kathedralen-Chor — *≈ A.1 #22* | Chor-Bandschleifen („Souvenir“) B / Mellotron (A&M) B | WT · N08 | pop:n08 | Fläche | G3–A4 (Akk. C3–C5) · Stf | 2 | r6·pop |
| OMD | Synthpop | Dudel-Geige — *3/4-Takt fehlt* | Geige durch Mellotron B | VA · pop·OM1 | pop:om1 | Lead | ≥G4 · Taste | 2 | pop |
| OMD / Visage | Synthpop | Rhythmus-Box 78 | Roland CR-78 (selbst programmiert) B | Drum · N09 | pop:n09 (alt pio:vi2) | Drums | – | 1 | r6·pop |
| The Human League | Synthpop | Hohltropfen — *♫ Hörprobe schreiben (Xander R2: „Being Boiled“)* | Korg 700S + System-100 B (Gerät); Klang U | VA · N10 | ♫ fehlt | Sequenz | Rolle | 1 · ★ | r6 |
| The Human League | Synthpop | Spinnen-Sequenz | MC-4-Linien W | VA · N11 | hel:h1 | Sequenz hoch | ≥G4 · ↑ | 1 | r6·hel |
| The Human League | Synthpop | Traum-Bass 81 | Ära-Einschätzung U | VA · N12 | pop:n12 | Bass | ≤C3 · ↓ | 3 | r6·pop |
| The Human League | Synthpop | Quinten-Lead 81 | Jupiter-4 W | VA · pop·HL1 | pop:hl1 | Lead | A4–C6 · Taste | 3 | pop |
| The Human League | Synthpop | Schaltkreis-Kit 81 | Linn LM-1, einzeln bearbeitet B | Drum · pop·HL2 | pop:hl2 | Drums | – | 2 | pop |
| Heaven 17 | Synth-Funk | Klangholz-Rennen | System 100 + Delay B | VA · ach·H1 | ach:h1 | Perkussion/Sequenz | ≥G5 · ↑ | 3 | ach |
| Heaven 17 | Synth-Funk | Weißfunk-Bass | MC-4 B (Part U) | VA · ach·H2 | ach:h2 | Bass | ≤D3 · ↓ | 3 | ach |
| Depeche Mode | Synthpop | Kettenreim-Lead — *≈ A.1 #1* | Jupiter-4 W | VA · pop·DM1 | pop:dm1 | Lead/Hook | ≥A4 · Taste | 1 · ★ | pop |
| Depeche Mode | Synthpop | Zählwerk-Kit 81 | Korg KR-55 + ARP-2600-Kick B | Drum · pop·DM2 | pop:dm2 | Drums | – | 1 | pop |
| Depeche Mode | Synthpop | Hallen-Stahl FM — *⚙ nach FM-Hüllkurven-Reparatur abhören* | DX7 „SYN-LEAD 2“ W; Metall-Sampling 1983 B | FM6 · pop·DM3 | pop:dm3 | Riff | ≥E4 · Taste | 1 · ★ | pop |
| Depeche Mode | Synthpop | Zitter-Bass 90 | Minimoog + ARP 2600 W | VA · pop·DM4 | pop:dm4 | Bass/Sequenz | ≤G3 · ↓ | 1 · ★ | pop |
| Depeche Mode | Synthpop | Koffer-Stampf | Flightcase-Stampf (Sample) B; hier synthetisch | Drum · pop·DM5 | pop:dm5 | Drums | – | 2 | pop |
| Depeche Mode | Synthpop | Kapellen-Chor | Emulator-II-Chor W | WT · N05 | pop:n05 | Fläche | C3–C5 · Stf | 3 | r6·pop |
| Depeche Mode | Synthpop | Blechhammer — *♫* | Metall-Sampling 1983 B | FM6 · N06 | ♫ fehlt | Sequenz | Rolle | 3 | r6 |
| Depeche Mode | Synthpop | Ketten-Riff | = DM1 (Jupiter-4: W, nicht „belegt“) | VA [g] · A.1 #1 | A.1-Phrase | Lead | – | Doppel → DM1 | A.1 |
| Vince Clarke (DM/Yazoo/Erasure) | Synthpop | Synthpop-Bass (Werk) — *ref-Text ändern (K-P3)* | Pro-One (Clarke) B; SH-101 U | VA · Werk | – | Bass | Rolle | Werk | Werk |
| Soft Cell | Synthpop | Spielzeug-Bass 81 | Korg Synthe-Bass SB-100 B | VA · ach·SC1 | ach:sc1 | Bass | ≤C3 · ↓ | 1 | ach |
| Soft Cell | Synthpop | Schrank-Rhythmus 81 | CR-78 + Delta-Lab-„Bink“ B | Drum · ach·SC2 | ach:sc2 | Drums | – | 3 | ach |
| Yazoo | Synthpop | Kantig-Riff | ARP 2600 B; Pro-One W | VA · pop·YZ1 | pop:yz1 | Riff | ≥G4 · Taste | 3 | pop |
| Yazoo | Synthpop | Keller-Bass 82 | Pro-One + MC-4 B | VA · pop·YZ2 | pop:yz2 | Bass | E1–G3 · ↓ (unter E1 +1 Okt.) | 2 | pop |
| Yazoo | Synthpop | Kuhglocken-Kit 82 | TR-808 B | Drum · pop·YZ3 | pop:yz3 | Drums | – | 3 | pop |
| Erasure | Synthpop | Mono-Gitter-Bass | MC-4 per CV/Gate, nur Analog B (Arbeitsweise) | VA · pop·ER1 | pop:er1 | Bass | ≤E3 · ↓ | 1 · ★ | pop |
| Erasure | Synthpop | Analog-Trommel 91 | Drums aus Synths B | Drum · pop·ER2 | pop:er2 | Drums | – | 3 | pop |
| Erasure | Synthpop | Einfinger-Kette | verzahnte Mono-Linien B (Arbeitsweise) | VA · pop·ER3 | pop:er3 | Gegenlinie | G4–C6 · ↑ | 2 | pop |
| Erasure | Synthpop | Vektor-Glas 87 | Prophet VS/Digital W (1986–88 offen) | WT · ach·ER4 | ach:er4 | Sequenz | F4–C6 · ↑ | 3 | ach |
| Duran Duran | New Romantic | Zufalls-Arp 82 — *⚙ Arp ZUFALL fehlt (Notenliste)* | Jupiter-4-Arpeggiator auf ZUFALL B | VA · hel·D1 | hel:d1 | Arp | ≥E3 · ↑ | 1 · ★ | hel |
| Duran Duran | New Romantic | Band-Echo-Arp | SH-2 + CSQ-100 B (Space Echo W) | VA · hel·D2 | hel:d2 | Sequenz | C3–C5 · ↑ | 2 | hel |
| Duran Duran | New Romantic | Hymnen-Poly 82 | Jupiter-8 B (Spielweise W) | VA · hel·D3 | hel:d3 | Akkord/Stab | C3–C5 · C→Am↓ | 3 | hel |
| Eurythmics | Synthpop | Traum-Sequenzbass | SH-101, vom MCS Drum Computer getaktet B | VA · ach·EU1 | ach:eu1 | Bass/Sequenz | ≤E3 · ↓ | 1 | ach |
| Eurythmics | Synthpop | Kanten-Streicher | OB-X W | VA · ach·EU2 | ach:eu2 | Akkord/Fläche | C3–C5 · Stf | 3 | ach |
| Eurythmics | Synthpop | Wohnzimmer-Rechner 83 | MCS Drum Computer B; Klang U | Drum · ach·EU3 | ach:eu3 | Drums | – | 3 | ach |
| Thomas Dolby | Synthpop | Labor-Bass | Moog Source W | VA · ach·TD1 | ach:td1 | Bass | ≤E3 · ↓ | 3 | ach |
| Thomas Dolby | Synthpop | Wissenschafts-Zwitscher | Minimoog oder Micromoog W (Widerspruch) | VA · ach·TD2 | ach:td2 | Lead | ≥C5 · Taste | 3 | ach |
| Blancmange | Synthpop | Decken-Raga | Jupiter-8 + Space Echo W | VA · ach·BM1 | ach:bm1 | Sequenz | C3–C6 · Block | 3 | ach |
| Blancmange | Synthpop | Linn-Teppich | LinnDrum B | Drum · ach·BM2 | ach:bm2 | Drums | – | 3 | ach |
| China Crisis | Synthpop | Melodika-Lead | Yamaha CS10 B | VA · ach·CC1 | ach:cc1 | Lead | ≥F4 · Taste | 3 | ach |
| Howard Jones | Synthpop | Ein-Mann-Riff | Arbeitsweise W | VA · ach·HJ1 | ach:hj1 | Lead/Riff | ≥A4 · Taste | 3 | ach |
| Howard Jones | Synthpop | Linke-Hand-Bass | Pro-One B (Part U) | VA · ach·HJ2 | ach:hj2 | Bass | ≤E3 · ↓ | 3 | ach |
| Tears for Fears | Synthpop | Unheil-Bass | Prophet-5 W | VA · ach·TF1 | ach:tf1 | Bass | ≤C3 · ↓ | 3 | ach |
| Tears for Fears | Synthpop | Doppel-Zinken-Sequenz — *⚙ Doppel-Spur-Eintrag* | DX7-Muster B (Schichtung W) | FM6 ×2 · ach·TF2 | ach:tf2 | Sequenz | G3–A5 · ↑ | 2 | ach |
| Tears for Fears | Synthpop | Schaukel-Linn 85 | LinnDrum + Fairlight-Kick B | Drum · ach·TF3 | ach:tf3 | Drums | – | 3 | ach |
| Talk Talk | Synthpop | Fanfaren-Polster 84 | Jupiter-8/OB-X W | VA · ach·TT1 | ach:tt1 | Akkord | C3–C5 · Stf, dirAt{Cm↓} | 3 | ach |
| Talk Talk | Synthpop | Hauch-Chor | Fairlight-Chor W (Annäherung) | WT · ach·TT2 | ach:tt2 | Fläche | G2–C5 · Stf | 3 | ach |
| Propaganda | Synthpop (ZTT) | Stummfilm-Schlag | Fairlight W (Annäherung) | WT · ach·PR1 | ach:pr1 | Stab | A2–D5 · Block | 3 | ach |
| Propaganda | Synthpop (ZTT) | Ufa-Sequenzbass | Roland-Anteil W | VA · ach·PR2 | ach:pr2 | Bass/Sequenz | ≤D3 · ↓ | 3 | ach |
| Pet Shop Boys | Synthpop | Schicht-Bass 86 — *⚙ Doppel-Spur-Eintrag; Tier 2 als Kern-Act der Linie B (Gerät W + Stilbeleg)* | DX7 + Jupiter-6 W | FM6 + VA · ach·PS1 | ach:ps1 | Bass | ≤C3 · ↓ | 2 | ach |
| Pet Shop Boys | Synthpop | Kathedral-Schlag — *Tier 2 als Kern-Act der Linie B (Gerät W + Stilbeleg)* | Orchester-Stab-Sample W (Annäherung) | VA · ach·PS2 | ach:ps2 | Stab | G2–E5 · Block | 2 | ach |
| New Order | Synthpop/Club | Sequenzer-Bass 83 | Moog Source + Powertran-Sequenzer B | VA [g] · N13 | hel:n1 | Bass | ≤G3 · ↓ | 1 · ★ | r6·hel |
| New Order | Synthpop/Club | Stotter-Kit 83 | Oberheim DMX B | Drum · N14 | pop:n14 | Drums | – | 1 | r6·pop |
| New Order | Synthpop/Club | Sampler-Chor 83 | Emulator (Modell offen) W | WT · N15 | pop:n15 | Fläche/Stab | C4–C5 · Block | 3 | r6·pop |
| New Order | Synthpop/Club | Fünfer-Kälte-Lead | Prophet-5 W | VA · N16 | pop:n16 | Lead | ≥E4 · Taste | 3 | r6·pop |
| a-ha | Synthpop | Fjordlauf-Lead — *≈ A.1 #3* | Juno-60 B | VA · pop·AH1 | pop:ah1 | Lead/Hook hoch | ≥G4 · Taste | 1 · ★ | pop |
| a-ha | Synthpop | Kasten-Klatsch 85 — *≈ A.1 #45* | LinnDrum + echte Becken B/W | Drum · pop·AH2 | pop:ah2 | Drums | – | 3 | pop |
| a-ha | Synthpop | Auslöser-Bass | zwei getriggerte Synth-Bässe W | VA · pop·AH3 | pop:ah3 | Bass | ≤G3 · ↓ | 3 | pop |
| a-ha | Synthpop | Fjord-Streicher — *♫* | Einschätzung U | VA · N04 | ♫ fehlt | Fläche | Rolle | 3 | r6 |
| a-ha | Synthpop | Fjord-Riff | = AH1 | VA [g] · A.1 #3 | A.1-Phrase | Lead | – | Doppel → AH1 | A.1 |
| a-ha | Synthpop | Fjord-Bass — *16-Hz-Falle (×0,5 + −12) beheben* | Bass-Gerät U | FM6 · A.1 #4 | A.1-Phrase | Bass | – | 3 | A.1 |
| a-ha | Synthpop | Nordlicht-Wellen | PPG Wave im Song B | WT · A.1 #5 | A.1-Phrase | Fläche | – | 2 | A.1 |
| a-ha | Synthpop | Studio 82 (Kit) | LinnDrum-artig B (Samples im Original) | Drum · A.1 #45 | A.1-Phrase | Drums | – | 2 | A.1 |
| Alphaville | Synthpop | Weitblick-Fläche | String-Machine/PPG U (nur Community-Liste) | VA [g] · N01 | pop:n01 | Fläche | C3–C5 · Stf | 1 · ★ | r6·pop |
| Alphaville | Synthpop | Fanfaren-Lead | U | VA [g] · N02 | pop:n02 | Lead | ≥C5 · Taste | 1 · ★ | r6·pop |
| Alphaville | Synthpop | Utopia-Glas | PPG U („Dance With Me“: Klang offen) | WT · N03 | pop:n03 | Keys | F4–F6 · ↑ | 2 · ★ | r6·pop |
| Alphaville | Synthpop | Neonzug-Sequenz | MFB-Sequenzer W | VA · pop·AV2 | pop:av2 | Sequenz | C2–A4 · ↑ | 3 | pop |
| Alphaville | Synthpop | (Lücke) Quinten-Bass „Big in Japan“ — *Tier-1-Kandidat: Rezept + Hörprobe fehlen* | System-100M, 2 Osz. eine Quinte verstimmt B | VA · – (kein Rezept) | ♫ fehlt | Bass | – | 1? | r8 |
| Real Life | Synthpop | Engels-Arp | U | VA · ach·RL1 | ach:rl1 | Sequenz | G3–C6 · ↑ | 3 | ach |
| Men Without Hats | Synthpop | Hüpf-Akkorde | U | VA · ach·MW1 | ach:mw1 | Stab | C3–C5 · Block | 3 | ach |
| Cetu Javu | Synthpop (DE) | Spiegel-Glocke 88 | U | FM6 · ach·CJ1 | ach:cj1 | Lead | ≥F4 · Taste | 3 | ach |
| Camouflage | Synthpop (DE) | Achtundachtzig-Stab | U | VA · SZ-36 | szn:sz36 | Stab | B3–A4 ±1 Okt. · Block | 3 | szn |
| Camouflage | Synthpop (DE) | Holzbass FM — *⚙ FM-Hüllkurven-Reparatur* | U | FM6 · SZ-37 | szn:sz37 | Bass | ≤E3 · ↓ | 3 | szn |
| Camouflage | Synthpop (DE) | Hallkammer-Kit | U | Drum · SZ-38 | szn:sz38 | Drums | – | 3 | szn |

### 2.3 C · Italo Disco und Eurodisco

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| Kano | Italo Disco | Mailänder Funk-Bass 80 | MS-20 W-schwach (1 Händlerseite) | VA · ach·IK1 | ach:ik1 | Bass | ≤F3 · ↓ | 3 | ach |
| Kano | Italo Disco | Klatsch-Disko 82 | Handclaps W | Drum · ach·IK2 | ach:ik2 | Drums | – | 3 | ach |
| Gazebo | Italo Disco | Kristall-Arp 83 | „kristallene“ Arps W (Rezension) | VA · ach·IG1 | ach:ig1 | Sequenz | ≥A4 · ↑ | 2 | ach |
| Savage | Italo Disco | Mondnacht-Lead 83 | U | VA · ach·IS1 | ach:is1 | Lead | ≥A4 · Taste | 3 | ach |
| Modern Talking | Eurodisco | Herzschlag-Oktavbass 85 — *heben, falls „Brother Louie“ gemeint* | U | VA · ach·IM1 | ach:im1 | Bass | ≤E3 · ↓ | 3 | ach |

### 2.4 D · Deutsche und europäische Synthpop-Szene, Futurepop

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| And One | Body-Pop/EBM-Synthpop | Körperbass | U (belegt nur: „nur Macintosh“) | VA · SZ-01 | szn:sz01 | Bass | ≤E3 · ↓ | 1 · ★ | szn |
| And One | Body-Pop/EBM-Synthpop | Paradestab | U | VA · SZ-02 | szn:sz02 | Stab | C4–C5 ±1 Okt. · Block | 2 | szn |
| And One | Body-Pop/EBM-Synthpop | Parade-Kit | U | Drum · SZ-03 | szn:sz03 | Drums | – | 3 | szn |
| And One | Body-Pop/EBM-Synthpop | Spiegelglas-Lead FM — *⚙ FM-Hüllkurven-Reparatur* | U (DX7 nur Ironcharts) | FM6 · SZ-04 | szn:sz04 | Lead | ≥C4 · Taste | 3 | szn |
| And One | Body-Pop/EBM-Synthpop | Signalbass | U | VA · AO-01 | ao01 | Bass („Morse“) | ≤E3 · ↓ | 1 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Funkfeuer-Bass — *W-Alternative: bis Xander wählt; Sync nur mit Worklet* | U | VA (Sync) · AO-02 | ao02 | Bass/Gegenstimme | ≤E3 · ↓ | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Peilsender — *W-Alternative: bis Xander wählt; ⚙ Ringmod ab VK* | U | VA · AO-03 | ao03 | Bass-Effekt | ≤E3 · ↓ | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Grollbass FM — *W-Alternative: bis Xander wählt; ⚙ FM-Hüllkurven-Reparatur* | U | FM6 · AO-04 | ao04 | Bass | ≤E3 · ↓ | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Doppelsägen-Oktavbass | U | VA · AO-05 | ao05 | Oktav-Bass | ≤E3 (+Okt.) · ↓ | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Wortfetzen-Formant | „Wortfragmente“ auf I.S.T. W; Gerät U | WT · AO-06 | ao06 | Sequenz/Stimme | E3–C4 · ↑ | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Schaltwerk-Kit | U | Drum · AO-07 | ao07 | Drums | – | 2 · ★ | spz |
| And One | Body-Pop/EBM-Synthpop | Grauzone-Fläche | Band B, Geräte U | VA [g] · A.1 #8 | A.1-Phrase | Fläche | – | 2 | A.1 |
| And One | Body-Pop/EBM-Synthpop | Grauzone-Bass — *≈ SZ-01/AO-05* | Einschätzung U | VA [g] · A.1 #9 | A.1-Phrase | Bass | – | 3 | A.1 |
| And One | Body-Pop/EBM-Synthpop | Grauzone-Stakkato — *♫* | Einschätzung U | VA · N23 | ♫ fehlt | Sequenz | Rolle | 3 | r6 |
| De/Vision | Synthpop | Hymnen-Lead | U | VA · C2-05 | cw2:„Leuchtturm“ | Lead | G4–C6 · Taste | 2 · ★ | cw2 |
| De/Vision | Synthpop | Oktav-Pumpbass | U | VA · C2-06 | cw2:„Leuchtturm“ | Bass | A1–G2 (+Okt.) · ↓ | 2 · ★ | cw2 |
| De/Vision | Synthpop | Glas-Arpeggio FM | U | FM6 · C2-07 | cw2:„Leuchtturm“ | Sequenz | A4–D6 · ↑ | 3 | cw2 |
| De/Vision | Synthpop | Clubhallen-Kit | U | Drum · C2-08 | cw2:„Leuchtturm“ | Drums | – | 3 | cw2 |
| Wolfsheim | Synthpop/Darkwave | Spatzen-Streicher | U | VA · EB-16 | ebm:eb16 | Fläche | C3–C5 · Stf | 3 | ebm |
| Wolfsheim | Synthpop/Darkwave | Nachtigall-Glocke | U | FM6 · EB-17 | ebm:eb17 | Lead | ≥C5 · Taste | 3 | ebm |
| Beborn Beton | Synthpop | Beton-Brass | U | VA · EB-25 | ebm:eb25 | Stab | G3–C5 · Block | 3 | ebm |
| Elegant Machinery | Synthpop (SE) | Schärenlicht-Fläche | Novation-Synths (90er) B, Modell U | VA · SZ-09 | szn:sz09 | Fläche | C3–E5 · Stf | 2 · ★ | szn |
| Elegant Machinery | Synthpop (SE) | Fernweh-Lead (übernimmt A.1 #16) | Novation B, Modell U | VA · SZ-10 | szn:sz10 | Lead | ≥D4 · Taste | 2 · ★ | szn |
| Elegant Machinery | Synthpop (SE) | Stab-Achtelbass | U | VA · SZ-11 | szn:sz11 | Bass | ≤E3 · ↓ | 3 | szn |
| Elegant Machinery | Synthpop (SE) | Schwedenstahl-Lead | = SZ-10 (verfeinert) | VA [g] · A.1 #16 | A.1-Phrase | Lead | – | Doppel → SZ-10 | A.1 |
| Elegant Machinery | Synthpop (SE) | Schwedenstahl-Bass · Schwedenstahl-Stabs | Einschätzung U | VA · A.1 #17 · N25 | A.1 / ♫ | Bass · Akkord | – | 3 | A.1·r6 |
| S.P.O.C.K | Sci-Fi-Synthpop (SE) | Beam-Schimmer | eigener Entwurf | VA · SZ-12 | szn:sz12 | Effekt | Transposition aus | 3 | szn |
| S.P.O.C.K | Sci-Fi-Synthpop (SE) | Blubber-Sequenz | „bubbling synthpop“ W | VA · SZ-13 | szn:sz13 | Sequenz | ≤C5 · ↑ | 2 · ★ | szn |
| S.P.O.C.K | Sci-Fi-Synthpop (SE) | Kommunikator-Hook FM — *⚙ FM-Hüllkurven-Reparatur* | U | FM6 · SZ-14 | szn:sz14 | Lead | ≥E4 · Taste | 2 · ★ | szn |
| S.P.O.C.K | Sci-Fi-Synthpop (SE) | Sternfahrer-Hook · -Puls · Warp-Signal | U (N24: Algo 32 moduliert nicht, K-4) | VA/FM6 · A.1 #18 · #19 · N24 | A.1 / ♫ | Lead · Sequenz · Atmo | – | 3 | A.1·r6 |
| Welle:Erdball | Chip-Synthpop | Rasterzeilen-Arp ⧉ — *Clip 1/32 → besser 1/64 (K-8)* | C64-SID B | VA · SZ-05 | szn:sz05 | Sequenz | ≥C4 · ↑ | 1 · ★ | szn |
| Welle:Erdball | Chip-Synthpop | Ringglocke — *⚙ Ringmod ab VK* | SID-Ringmod B (nur Dreieck: eK) | VA · SZ-06 | szn:sz06 | Lead/Akzent | ≥F4 · Taste | 2 · ★ | szn |
| Welle:Erdball | Chip-Synthpop | PWM-Brotbass | SID-Prinzip B (Gerät) | VA · SZ-07 | szn:sz07 | Bass | ≤D3 · ↓ | 2 · ★ | szn |
| Welle:Erdball | Chip-Synthpop | Rauschwellen-Kit (übernimmt A.1 #30) | SID B | Drum · SZ-08 | szn:sz08 | Drums | – | 2 | szn |
| Welle:Erdball | Chip-Synthpop | Brotkasten-Lead | C64-SID B | VA [g] · A.1 #26 | A.1-Phrase | Lead | – | 2 | A.1 |
| Welle:Erdball | Chip-Synthpop | Brotkasten-Triller/-Arp/-Bass/-Drums — *#30 → SZ-08* | Einschätzung U | VA/Drum · A.1 #27–#30 | A.1-Phrase | div. | – | 3 | A.1 |
| Welle:Erdball | Chip-Synthpop | Brotkasten-Sync · Datenstrom ⧉ · Kassetten-Laden — *≈ A.1 #26 / #35* | SID B / U | VA · N26 · N27 · N76 | ♫ fehlt | Lead · Sequenz · Atmo | – | 3 | r6 |
| Second Decay | Wave/EBM | Kellerpuls-Bass (= N19 verfeinert) — *⚙ Drift „walk“ ab VK* | „nur analoge Synths“ W | VA · SZ-23 | szn:sz23 | Bass | ≤C3 · ↓ | 2 · ★ | szn |
| Second Decay | Wave/EBM | Kaltlicht-Stakkato | W (wie oben) | VA · SZ-24 | szn:sz24 | Sequenz | ≥A3 · ↑ | 2 · ★ | szn |
| Second Decay | Wave/EBM | Analogkeller-Lead — *♫ Hörprobe schreiben (Bezug „I Hate Berlin“)* | W (wie oben) | VA · N20 | ♫ fehlt | Lead | Rolle | 2 · ★ | r6 |
| Mesh | Synthpop (UK) | Regenstadt-Pluck | Silverthorn: Pro-One, MS2000, Trinity B (Part U) | VA · SZ-33 | szn:sz33 | Pluck | ≥C4 · ↑ | 3 | szn |
| Mesh | Synthpop (UK) | Schulterbass | wie oben | VA · SZ-34 | szn:sz34 | Bass | ≤C3 · ↓ | 3 | szn |
| Mesh | Synthpop (UK) | Breitwand-Streicher | wie oben | VA · SZ-35 | szn:sz35 | Fläche | Stf | 3 | szn |
| Iris | Synthpop (US) | Glanz-Arp | U (IDM-Einfluss B) | VA · EB-26 | ebm:eb26 | Sequenz | A4–D6 · ↑ | 3 | ebm |
| Massive Ego | Synthpop/Club | Spiegelkugel-Bass | U | VA · EB-27 | ebm:eb27 | Bass | ≤E3 · ↓ | 3 | ebm |
| Covenant | Futurepop (SE) | Polarnacht-Fläche | U (Equipboard schwach) | VA · SZ-25 | szn:sz25 | Fläche | Stf | 3 | szn |
| Covenant | Futurepop (SE) | Schaltwerk-Bass | U | VA · SZ-26 | szn:sz26 | Bass | ≤E3 · ↓ | 3 | szn |
| Covenant | Futurepop (SE) | Eiskristall-Arp FM | U | FM6 · SZ-27 | szn:sz27 | Sequenz | ≥C4 · ↑ | 3 | szn |
| Covenant | Futurepop (SE) | Kaltraum-Kit | U | Drum · SZ-28 | szn:sz28 | Drums | – | 3 | szn |
| VNV Nation | Futurepop | Leuchtfeuer-Lead (Variante Werk „Supersaw-Hymne“) | JP-8000/Virus W | VA · SZ-29 | szn:sz29 | Lead | ≥E4 · Taste | 1 | szn·ebm |
| VNV Nation | Futurepop | Taktgitter-Fläche ⧉ | U | VA · SZ-30 | szn:sz30 | Fläche (Gate) | Stf | 2 | szn |
| VNV Nation | Futurepop | Gegenschlag-Bass | U | VA · SZ-31 | szn:sz31 | Bass | ≤C3 · ↓ | 3 | szn |
| VNV Nation | Futurepop | Hymnen-Kit | U | Drum · SZ-32 | szn:sz32 | Drums | – | 3 | szn |
| Apoptygma Berzerk | Futurepop | Nordlicht-Pluck | U | VA · EB-11 | ebm:eb11 | Sequenz | C4–A5 · ↑ | 2 | ebm |
| Apoptygma Berzerk | Futurepop | Rollbass | U | VA · EB-12 | ebm:eb12 | Bass | ≤C3 · ↓ | 3 | ebm |
| Rotersand | Futurepop | Leuchtturm-Stab | U | VA · EB-19 | ebm:eb19 | Stab | G3–C5 · Block | 3 | ebm |
| Seabound | Futurepop | Tiefsee-Bass | U | VA · EB-18 | ebm:eb18 | Bass | ≤C3 · ↓ | 3 | ebm |
| Neuroticfish | Futurepop | Nervenbass | SH-101 nur Equipboard (W-schwach) | VA · EB-24 | ebm:eb24 | Bass | ≤E3 · ↓ | 3 | ebm |
| Assemblage 23 | Futurepop | Sturmglas-Lead | U | VA · EB-13 | ebm:eb13 | Lead | ≥C4 · Taste | 3 | ebm |
| Solar Fake | Synthpop/Electro | Falschsonne-Lead | U | VA · EB-20 | ebm:eb20 | Lead | ≥C4 · Taste | 3 | ebm |
| Blutengel | Darkwave-Pop | Blutmond-Orchester | U | VA · EB-23 | ebm:eb23 | Stab | G3–C5 · Block | 3 | ebm |
| Diary of Dreams | Darkwave | Tagebuch-Klavier | Klavier-Spielweise W | FM6 · EB-21 | ebm:eb21 | Akkord/Arp | G2–D5 · Block | 3 | ebm |
| Diary of Dreams | Darkwave | Schattenchor | U | WT · EB-22 | ebm:eb22 | Fläche | G3–C5 · Stf | 3 | ebm |
| Project Pitchfork | Dark Electro/Darkwave | Grollbass (Schwester N22) — *⚙ „sat“ ab VK* | U | VA · SZ-19 | szn:sz19 | Bass | ≤D3 · ↓ | 2 · ★ | szn |
| Project Pitchfork | Dark Electro/Darkwave | Dämmerungs-Chor (in szene „Kathedralen-Chor“) — *Name zurück auf N21 „Dämmerungs-Chor“* | U | WT · SZ-20 | szn:sz20 | Chor | G3–F5 · Stf | 2 · ★ | szn |
| Project Pitchfork | Dark Electro/Darkwave | Splitter-Sequenz FM — *⚙ FM-Hüllkurven-Reparatur* | U | FM6 · SZ-21 | szn:sz21 | Sequenz | ≥A4 · ↑ | 3 | szn |
| Project Pitchfork | Dark Electro/Darkwave | Schmiede-Kit | U | Drum · SZ-22 | szn:sz22 | Drums | – | 3 | szn |
| Project Pitchfork | Dark Electro/Darkwave | Funkenflug-Bass — *≈ N45 (0,038)* | Einschätzung U | VA · N22 | ♫ fehlt | Bass | Rolle | 3 | r6 |
| Joy Division (Kandidat) | Post-Punk | Fabrikhallen-Kit mit Fall-Tom — *nur wenn Xander den Tag will* | U | Drum · SZ-39 | szn:sz39 | Drums | – | 3 | szn |
| Joy Division (Kandidat) | Post-Punk | Kammer-Streicher | U | VA · SZ-40 | szn:sz40 | Fläche | Stf | 3 | szn |

### 2.5 E · EBM, Industrial, Dark Electro, Aggrotech

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| DAF | EBM (Körpermusik) | Schiefe Kette — *⚙ HP+LP fehlt; rnd je Schritt prüfen* | Korg MS-20 + SQ-10 B | VA · EB-01 | ebm:eb01 | Bass/Sequenz | ≤D3 · ↓ (live: Hand führt) | 1 | ebm |
| DAF | EBM (Körpermusik) | Stufen-Sequenz — *≈ EB-01* | MS-20 + SQ-10 B | VA · DK-18 | dark:daf | Bass/Sequenz | G1–D3 · ↓ | 3 | dark |
| DAF | EBM (Körpermusik) | Handkasten-Kit | U (gespielt statt Maschine) | Drum · DK-19 | dark:daf | Drums | – | 3 | dark |
| Die Krupps | EBM/Industrial | Stahlophon | „Steel-o-phone“ W | FM6 · EB-07 | ebm:eb07 | Perkussion/Sequenz | E4–C6 · ↑ | 2 | ebm |
| Die Krupps | EBM/Industrial | Volle-Kraft-Bass | MS-20 nur live 2015 W | VA · EB-08 | ebm:eb08 | Bass | ≤C3 · ↓ | 3 | ebm |
| Front 242 | EBM | Ziegel-Kit — *⚙ crush (VK P1) für Sample-Rauheit* | E-mu Drumulator B | Drum · EB-02 | ebm:eb02 | Drums | – | 1 | ebm |
| Front 242 | EBM | FM-Kantenstab | Yamaha DX7 B | FM6 · EB-03 | ebm:eb03 | Akkord/Stab | A2–F4 · Block | 1 | ebm |
| Front 242 | EBM | Kommando-Bass (Muster P1 „Galopp“) | Stil U (Kern: Sampler + FM B) | VA · DK-11 | dark:f242 | Bass | F1–A2 (≤D3) · ↓ | 2 | dark |
| Front 242 | EBM | Signal-Stab · Kurzwellen-Atmo · Maschinenhalle-Kit | U | VA/Drum · DK-12 · DK-13 · DK-14 | dark:f242 | Stab · Atmo · Drums | Block · aus · – | 3 | dark |
| Nitzer Ebb | EBM | Ein-Osz-Drillbass | Roland SH-101 W (Zitat aus 2. Hand) | VA · EB-04 | ebm:eb04 | Bass | ≤E3 · ↓ | 1 | ebm |
| Nitzer Ebb | EBM | Drill-Bass (Muster P2) — *≈ EB-04* | W | VA · DK-15 | dark:ne | Bass | C2–G3 · ↓ | 3 | dark |
| Nitzer Ebb | EBM | Exerzier-Kit | U | Drum · DK-17 | dark:ne | Drums | – | 3 | dark |
| Nitzer Ebb | EBM | Blechfass-Perc | U | Drum (Pad) · DK-16 | dark:ne | Perc | – | 3 | dark |
| Skinny Puppy | Electro-Industrial | Pro-Schnarrbass — *⚙ Poly-Mod „ofm“ ab VK* | Sequential Pro-One B (cEvin Key) | VA · EB-05 | ebm:eb05 | Bass | ≤C3 · ↓ | 1 | ebm |
| Skinny Puppy | Electro-Industrial | Rostbass · Störfunk-Atmo · Splitter-Kit · Klage-Fläche | U | VA/WT/Drum · DK-20–DK-23 | dark:sp | Bass · Atmo · Drums · Fläche | ≤F3 · – · – · Stf | 3 | dark |
| Front Line Assembly | Electro-Industrial | Neuralbass | U | VA · EB-09 | ebm:eb09 | Bass | ≤D3 · ↓ | 3 | ebm |
| Front Line Assembly | Electro-Industrial | Schneid-Stab | „Sampling als Synthese“ B (Arbeitsweise) | WT · EB-10 | ebm:eb10 | Stab | G3–C5 · Block | 3 | ebm |
| Leæther Strip | Dark Electro | Kaltkörper-Bass (Muster P3) | U | VA · DK-24 | dark:ls | Bass | G1–D3 · ↓ | 2 | dark |
| Leæther Strip | Dark Electro | Trauer-Streicher · Fanfaren-Stab | U | VA · DK-25 · DK-26 | dark:ls | Fläche · Stab | Stf · Block | 3 | dark |
| Suicide Commando | Dark Electro → Aggrotech | Erstlings-Kasten — *Beleg seit r7-Prüfung nur W; ⓘ ohne Modell* | Boss DR-55 W (eine Quelle, nicht reproduziert) | Drum · EB-06 | ebm:eb06 | Drums | – | 2 | ebm |
| Suicide Commando | Dark Electro → Aggrotech | Sezierbass (Muster P3b) | U (früh SH-101 B) | VA · DK-27 | dark:sc | Bass | G1–C3 · ↓ | 3 | dark |
| Suicide Commando | Dark Electro → Aggrotech | Skalpell-Lead · Alarm-Arp · Seziertisch-Kit | U | VA/Drum · DK-28 · DK-29 · DK-30 | dark:sc | Lead · Sequenz · Drums | Taste · ↑ · – | 3 | dark |
| Hocico | Aggrotech | Hassbass (Muster P4) | U | VA · DK-31 | dark:ho | Bass | B1–G3 · ↓ | 2 | dark |
| Hocico | Aggrotech | Schrei-Lead · Glut-Fläche · Glutofen-Kit | U | VA/WT/Drum · DK-32 · DK-33 · DK-34 | dark:ho | Lead · Fläche · Drums | Taste · Stf · – | 3 | dark |
| Agonoize | Aggrotech | Stampf-Bass | gesättigte Bässe (Genre) W | VA · C2-10 | cw2:„Funkenregen“ | Bass | B♭1–A♭2 (+Okt.) · ↓ | 1 · ★ | cw2 |
| Agonoize | Aggrotech | Höllensäge-Lead | Supersaw (JP-8000, Genre) W | VA · C2-09 | cw2:„Funkenregen“ | Lead/Stab | E4–F5 · Taste | 2 · ★ | cw2 |
| Agonoize | Aggrotech | Höllenmaschine-Kit | TR-909 (Genre) W | Drum · C2-12 | cw2:„Funkenregen“ | Drums | – | 2 · ★ | cw2 |
| Agonoize | Aggrotech | Alarm-Metall FM | U | FM6 · C2-11 | cw2:„Funkenregen“ | Effekt/Stab | C4–C5 · fest | 3 | cw2 |
| Combichrist | Aggrotech („TBM“) | Techno-Körper-Kit · Säge-Rammbass — *⚙ Verzerrer vor dem Filter fehlt* | U (Begriff TBM W) | Drum/VA · EB-14 · EB-15 | ebm:eb14 · eb15 | Drums · Bass | – · ≤D3 ↓ | 3 | ebm |

### 2.6 F · Cold Wave, Minimal Wave, Darkwave

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| Kas Product | Cold Wave (FR) | Giftzahn-Lead — *⚙ HP+LP fehlt* | Korg MS-20 W | VA · CR-01 | cr:cr01 | Lead/Riff | ≥G4 · Taste | 2 | cr |
| Kas Product | Cold Wave (FR) | Hetzpuls-Bass | U (Rezension „bass-heavy“ B) | VA · CR-02 | cr:cr02 | Bass | A1–F♯2 (+Okt.) · ↓ | 3 | cr |
| Martin Dupont | Cold Wave (FR) | PWM-Fläche (Werk) · Salonbass 84 — *CR-04 ≈ DK-07 (Blindtest)* | U | VA · Werk · CR-04 | cr:cr03 · cr04 | Fläche · Bass | Stf · ↓ | 3 | cr |
| Trisomie 21 | Cold Wave (FR) | Bandecho-Sequenz — *⚙ Bandecho-Sättigung* | Tonbandecho W | VA · CR-05 | cr:cr05 | Sequenz | C4–G5 · ↑ | 3 | cr |
| Clan of Xymox | Darkwave (NL) | Chorus-Saitenbass | Korg MS-10 + Rhythmusmaschine W (Bass evtl. E-Bass U) | VA · DK-07 | dark:cx (alt cr:cr10) | Bass (Melodie) | A1–D3 · dirAt{H↓} | 2 | dark·cr |
| Clan of Xymox | Darkwave (NL) | Kathedralen-Streicher · Gitter-Arp · Grabkammer-Kit | W/U | VA/Drum · DK-08 · DK-09 · DK-10 | dark:cx | Fläche · Sequenz · Drums | Stf · ↑ · – | 3 | dark |
| Kirlian Camera | Cinematic Darkwave (IT) | Marmor-Streicher (= N17 verfeinert) | „orchestral strings, slow synth washes“ W | VA · SZ-16 | szn:sz16 | Fläche | Stf | 2 · ★ | szn |
| Kirlian Camera | Cinematic Darkwave (IT) | Requiem-Chor | U | WT · SZ-15 | szn:sz15 | Fläche | Stf | 2 · ★ | szn |
| Kirlian Camera | Cinematic Darkwave (IT) | Kaltpuls-Bass · Turmglocke FM · Parma-Nebel — *SZ-18 ⚙ FM-Hk* | U | VA/FM6/WT · SZ-17 · SZ-18 · N18 | szn:sz17 · sz18 · ♫ | Bass · Glocke · Atmo | ≤D3 ↓ · ≥A4 · – | 3 | szn·r6 |
| The Frozen Autumn | Cold Wave (IT) | Herbstriff-Bass | Synthex/K4 nur Equipboard (W-schwach); K1 U | VA · DK-01 | dark:fa | Bass (melodisch, hoch) | E2–G3 · ↓ | 1 · ★ | dark |
| The Frozen Autumn | Cold Wave (IT) | Digitalglas-Lead (K1-Lesart) | U | WT · DK-02 | dark:fa | Lead | E4–G5 · Taste | 2 · ★ | dark |
| The Frozen Autumn | Cold Wave (IT) | Kaltkasten-Kit | U | Drum · DK-04 | dark:fa | Drums | – | 2 · ★ | dark |
| The Frozen Autumn | Cold Wave (IT) | Herbstarp ⧉ | Geräte U | VA · A.1 #14 | A.1-Phrase | Sequenz | – | 2 · ★ | A.1 |
| The Frozen Autumn | Cold Wave (IT) | Digitalchor-Fläche · Herbstglocke · Nebelkälte-Bass · Eisglas-Keys (K4-Lesart) · Kaltwelle-Puls — *N28 ≈ DK-01* | U / W-schwach | WT/FM6/VA · DK-03 · A.1 #15 · N28 · N29 · N47 | ♫ / A.1 | Fläche · Keys · Bass · Keys · Lead | Rolle | 3 | dark·A.1·r6 |
| Static Movement | Cold Wave (IT) | Kaltes Glas | PPG Wave 2.2 W (KD-1, nicht „belegt“) | WT · A.1 #12 | dark:sm | Keys/Arp | A4–A5 · ↑ | 1 · ★ | A.1·dark |
| Static Movement | Cold Wave (IT) | Eiszeit-Streicher (A.1 „Synthex-Streicher“ umbenennen) | Elka Synthex W | VA [g] · A.1 #13 | A.1-Phrase | Fläche | – | 2 · ★ | A.1 |
| Static Movement | Cold Wave (IT) | Wellenkante-Bass | Synthex/PPG W | WT · DK-05 | dark:sm | Bass | A1–A2 · ↓ | 2 · ★ | dark |
| Static Movement | Cold Wave (IT) | Breitchor-Lead | Synthex W | VA · DK-06 | dark:sm | Lead | G♯4–F5 · Taste | 2 · ★ | dark |
| Static Movement | Cold Wave (IT) | Gitter-Schimmer — *≈ A.1 #12* | PPG/Synthex W | WT · N30 | ♫ fehlt | Fläche | – | 3 | r6 |
| Linea Aspera | Minimal Wave | Einzelgänger-Bass | Roland SH-09 W | VA · CR-08 | cr:cr08 | Bass | A1–G2 (+Okt.) · ↓ | 3 | cr |
| Linea Aspera | Minimal Wave | Dünnglas-Akkord · Kaltstahl-Kit | Poly-800 W · Vermona DRM W | VA/Drum · CR-09 · CR-11 | cr:cr09 · cr11 | Akkord (Sequenz) · Drums | ↑ · – | 3 | cr |
| Lebanon Hanover | Cold Wave | Trübsal-Kit — *≈ C2-04; Bass = DK-07 (cr:cr10)* | programmierte Rhythmen W | Drum · CR-12 | cr:cr12 | Drums | – | 3 | cr |
| Sixth June | Cold Wave | Kaltfront-Bass | U (Genre W) | VA · C2-01 | cw2:„Grauer Fluss“ | Bass | A1–G2 (alle ≤A2) · ↓ | 2 · ★ | cw2 |
| Sixth June | Cold Wave | Nebelglocke | U | VA · C2-02 | cw2:„Grauer Fluss“ | Lead/Sequenz | G4–A5 · Taste | 2 · ★ | cw2 |
| Sixth June | Cold Wave | Grauschleier-Fläche | U | VA · C2-03 | cw2:„Grauer Fluss“ (alt cr:cr06) | Fläche | C4–A4 · Stf eng | 2 · ★ | cw2 |
| Sixth June | Cold Wave | Kühlraum-Kit | „clinical drum machines“ (Genre) W | Drum · C2-04 | cw2:„Grauer Fluss“ | Drums | – | 3 | cw2 |
| Boy Harsher | Darkwave | Fiebertraum-Bass | Roland MC-505 B (Bandliste) | VA · CR-13 | cr:cr13 | Bass | C2–F2 (+Okt.) · dirAt{C↓} | 2 | cr |
| Boy Harsher | Darkwave | Schwitzkasten-Kit — *⚙ crush (Sampler-Grit)* | MPC B | Drum · CR-14 | cr:cr14 | Drums | – | 3 | cr |
| Molchat Doma | Post-Punk/Cold Wave | Kaskaden-Bass (Werk, V0a „Moog-Bass“) | Minimoog in der Studioliste B (Titel U) | VA · Werk | cr:cr15 | Bass | G1–D2 · ↓ | 2 | Werk·cr |
| Molchat Doma | Post-Punk/Cold Wave | Neonröhren-Lead | Alpha Juno-2/D-50 in der Studioliste W (Titel U) | VA · CR-16 | cr:cr16 | Lead | ≥A4 · Taste | 2 | cr |
| Molchat Doma | Post-Punk/Cold Wave | Plattenbau-Kit | Drumcomputer statt Schlagzeuger B; TR-8 W | Drum · CR-17 | cr:cr17 | Drums | – | 3 | cr |

### 2.7 G · Retrowave, Synthwave, Darksynth

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| College | Synthwave | Heldenpuls-Bass | U | VA · CR-18 | cr:cr18 | Bass | A♭1–E♭2 (+Okt.) · ↓ | 3 | cr |
| College | Synthwave | DCO-Fläche (Werk, V0a „Juno-Pad“) | U | VA · Werk | cr:cr19 | Fläche | G3–C5 · Stf | 2 | Werk·cr |
| Kavinsky | Synthwave/Outrun | Neon-Arp | Juno-Emulation W (Reverb Machine) | VA · N33 | ret:kv2 | Sequenz | F3–C5 · ↑ | 1 | r6·ret |
| Kavinsky | Synthwave/Outrun | Nachtfahrt-Bass | U | VA · N35 | ret:kv1 | Bass | ≤E3 · ↓ | 3 | r6·ret |
| Kavinsky | Synthwave/Outrun | Chromfelgen-Lead FM — *⚙ Pitch-EG im FM6 fehlt* | DX7 („Teddy Boy“) W | FM6 · CR-24 | cr:cr24 | Lead | ≥C5 · Taste | 3 | cr |
| Electric Youth | Synthwave | Glas-Pluck (Werk) | Vintage-Sammlung B (Modelle U) | VA · Werk | cr:cr20 | Sequenz | C4–C6 · ↑ | 2 | Werk·cr |
| Electric Youth | Synthwave | Innenwelt-Fläche — *≈ Werk PWM-Fläche (Blindtest)* | U | VA · CR-21 | cr:cr21 | Fläche | G♯3–C♯5 · Stf | 3 | cr |
| Mitch Murder | Synthwave (TV/Action) | Schulterpolster-Slap — *⚙ FM-Hüllkurven-Reparatur* | DX7-„BASS 1“-Daten B; Bezug U (Renoise B) | FM6 · ret·MM1 | ret:mm1 | Bass | E1–E3 · ↓ | 3 | ret |
| Mitch Murder | Synthwave (TV/Action) | Krimiserie-Brass | DX7-„BRASS 1“-Daten B; Bezug U | FM6 · ret·MM2 | ret:mm2 | Stab | E4–G5 · Block | 3 | ret |
| Lazerhawk | Synthwave (Outrun) | Sync-Lead (Werk) | U | VA · Werk | ret:lh1 | Lead | ≥A4 · Taste | 2 | Werk·ret |
| Com Truise | Synthwave (Downtempo) | Leierband-Akkord · Schleich-Funk-Bass · Halbzeit-Kit | U | VA/Drum · ret·CT1–CT3 | ret:ct1–ct3 | Akkord · Bass · Drums | Stf · ↓ · – | 3 | ret |
| Le Matos | Synthwave (Film) | Endzeit-Fanfare | U | VA · ret·LM1 | ret:lm1 | Akkord | F3–C5 · Stf | 3 | ret |
| Timecop1983 | Synthwave | Zupf-Bass 83 | Juno-Pluck W | VA [g] · N34 | ret:tc1 | Bass | ≤D3 · ↓ | 2 | r6·ret |
| Timecop1983 | Synthwave | DCO-Streicher (Werk, V0a „Juno-Streicher“) | Juno-106 / TAL-U-NO-62 W | VA · Werk | ret:tc2 | Fläche | A2–E4 · Stf | 2 | Werk·ret |
| FM-84 | Synthwave | Strandpromenade-Lead | U | VA · N37 | ret:f81 | Lead | ≥A4 · Taste | 3 | r6·ret |
| FM-84 | Synthwave | Brandungs-Bass | U | VA · ret·F82 | ret:f82 | Bass | ≤E3 · ↓ | 3 | ret |
| The Midnight | Synthwave | Nachtblau-Fläche | Juno-106 (McEwan) B; Part U | VA · N31 | ret:mn1 | Fläche | G2–C5 · Stf | 1 · ★ | r6·ret |
| The Midnight | Synthwave | Neon-Sax — *später Klangkörper (V9b)* | Saxofon W (Synth-Annäherung) | VA · N32 | ret:mn2 | Lead/Hook | ≥F♯4 · Taste | 2 · ★ | r6·ret |
| The Midnight | Synthwave | Abendrot-Poly | OB-6/Prophet-6 B (Patch U) | VA · ret·MN3 | ret:mn3 | Akkord | G3–E5 · Stf | 2 · ★ | ret |
| The Midnight | Synthwave | Neon-Zinken (ROM „E.PIANO 1“) | DX7 (2025) B; Part U | FM6 · N38 | ret:mn4 | Keys | B♭1–D5 · ↑ | 2 · ★ | r6·ret |
| Gunship | Synthwave | Kampfstern-Brass — *≈ Werk Zweipol-Brass (0,045)* | U (Prophet-6/Minilogue W-schwach) | VA · N36 | ret:gs1 | Akkord | F3–C5 · Stf | 3 | r6·ret |
| Gunship | Synthwave | Sternkreuzer-Bass | U | VA · ret·GS2 | ret:gs2 | Bass | ≤E♭3 · ↓ | 3 | ret |
| Michael Oakley | Synthwave-Pop | Glanzzupf — *ID-Konflikt mit Moroder MO1* | U | VA · ret·MO1 (→ „OA1“) | ret:mo1 | Pluck/Sequenz | F4–C6 · ↑ | 3 | ret |
| Michael Oakley | Synthwave-Pop | Transwellen-Fläche | Ensoniq VFX/TS10, Yamaha SY85 W (eine Quelle, nicht reproduziert) | WT · CR-25 | cr:cr25 | Fläche | C4–D5 · Stf | 2 | cr |
| Retrowave (Genre) | Synthwave | Gated 84 (Werk-Kit) | Gate-Hall-Snare (Genre, eK) | Drum · Werk | ret:mo2 | Drums | – | 1 | Werk·ret |
| Retrowave (Genre) | Synthwave | Neon-Kit 84 — *≈ Werk Gated 84* | Einschätzung U | Drum · N42 | ret:n42 | Drums | – | 3 | r6·ret |
| Carpenter Brut | Darksynth | Dunkelfahrt-Bass | Pro 2/Prophet-6/OB-6 B (2018); „distorted synths“ B | VA [g] · N39 | ret:cb1 | Bass | ≤E♭3 · ↓ | 1 | r6·ret |
| Carpenter Brut | Darksynth | Höllenfahrt-Lead | verzerrter Lead (Stil B; echte Gitarrensoli B) | VA · N40 | ret:cb2 | Lead | ≥C5 · Taste | 2 | r6·ret |
| Carpenter Brut | Darksynth | Raserei-Kit | „crushing drums“ B (Stil) | Drum · ret·CB3 | ret:cb3 | Drums | – | 3 | ret |
| Perturbator | Darksynth | Leuchtschrift-Arp | OB-X/CS-80-Emulationen W | VA · N41 | ret:pt1 | Sequenz | F3–F5 · ↑ | 2 | r6·ret |
| Perturbator | Darksynth | Mondfinsternis-Fläche | W (CS-80-artig, vorsichtig) | VA · ret·PT2 | ret:pt2 | Fläche | B♭1–C4 · Stf | 3 | ret |
| Dance With the Dead | Darksynth | Gruftgalopp-Bass · Sägeblatt-Lead | Metal-Einfluss B; Klang U | VA · CR-22 · CR-23 | cr:cr22 · cr23 | Bass · Lead (Gitarren-Ersatz) | ↓ · Taste | 3 | cr |

### 2.8 H · Xanders Spezial-Wünsche (Vogue, Slap House, Electroclash, „Jump“, Enigma)

| Act | Genre | Karte (Sound-Name) | Gerät des Originals (Beleg) | Engine · Rezept-ID | Hörprobe-ID | Rolle / Register | Lage-Default | Tier | Quelle |
|---|---|---|---|---|---|---|---|---|---|
| Vogue („Himmlische Klangdimensionen“, 1988) | Synthpop/Weihnacht | Himmelstor-Bass | Casio FZ-1 auf der Hülle W; dieser Bass vom FZ-1 U | VA · VG-1 | vg-v1 | Bass tief („Filter öffnet sich“) | F1–G2 · ↓ hart | 1 · ★ | spz |
| Vogue | Synthpop/Weihnacht | Achtstufen-Bass — *W-Alternative: bis Xander wählt* | FZ-1-Hüllkurve mit 8 Stufen B (Gerät); Einsatz U | VA · VG-2 | vg-v2 | Bass | E1–E2 · ↓ | 2 · ★ | spz |
| Vogue | Synthpop/Weihnacht | Engelschor | U | WT · VG-3 | vg-v3 | Fläche | F2–C5 · Stf eng | 2 · ★ | spz |
| Vogue | Synthpop/Weihnacht | Sprechende Stimme — *zitiert gemeinfreien Choral (1539); Töne gegen IMSLP prüfen* | U | WT · VG-4 | vg-v4 | Lead hoch | G4–G5 · Taste | 2 · ★ | spz |
| Vogue | Synthpop/Weihnacht | Wau-Stimme — *W-Alternative: bis Xander wählt* | U | VA · VG-5 | vg-v5 | Lead Mitte | A♭3–A4 · Taste | 2 · ★ | spz |
| Vogue | Synthpop/Weihnacht | Sinus-48-Glocke — *⚙ Additiv-Modus* | FZ-1 „Sine“ (48 Obertöne) B; Einsatz U | Additiv (geplant; Ersatz WT „glas“) · VG-6 | vg-v6 | Glocke/Akzent | ≥A4 · Taste | 2 · ★ | spz |
| VIZE (Slap House) | Slap House | Klatsch-Bass (übernimmt A.1 #46) | Technik B (3 Tutorials); VIZE-Gerät U | VA · SH-1 | sh-h1 | Bass tief | F1–E2 (+Okt.) · ↓ hart | 1 · ★ | spz |
| VIZE (Slap House) | Slap House | Klatsch-FM — *W-Alternative: bis Xander wählt; ⚙ FM-Hüllkurven-Reparatur; menv→pitch prüfen* | Technik B; Gerät U | FM6 · SH-2 | sh-h2 | Bass | ≤E3 · ↓ | 2 · ★ | spz |
| VIZE (Slap House) | Slap House | Klatsch-WT | Technik B; Gerät U | WT · SH-3 | sh-h1 (geteilt) | Bass | ≤E3 · ↓ | 3 | spz |
| VIZE (Slap House) | Slap House | Reese-Hüpfer (C2-13, bisher „Gummi-Bass“) — *W-Alternative: bis Xander wählt* | U | VA · C2-13 | cw2:„Gummiband“ | Bass (Legato-Reese) | B♭1–G2 (+Okt.) · ↓ | 2 · ★ | cw2 |
| VIZE (Slap House) | Slap House | Drop-Zupfer FM | U | FM6 · C2-14 | cw2:„Gummiband“ | Lead/Antwort | G4–D6 · ↑ | 3 | cw2 |
| VIZE (Slap House) | Slap House | Schwerer Slap | = SH-1 | VA · A.1 #46 | A.1-Phrase | Bass | – | Doppel → SH-1 | A.1 |
| Tiga & Zyntherius (Electroclash, 2001) | Electroclash | Kalter Achtel-Bass (bisher „Sonnenbrillen-Bass“) — *erst nach Xanders Antwort* | U | VA · SH-4 | – (nach Rückfrage) | Bass | offen | 3 | spz |
| Van Halen „Jump“ | Synth-Rock | Zweipol-Brass (Werk, V0a „OB-Brass“) — *♫ Hörprobe schreiben* | OB-X oder OB-Xa W (umstritten) | VA · Werk | ♫ fehlt | Akkord (Brass) | Rolle | 2 · ★ | Werk |
| Enigma | Sphären-Pop | Bambusatem · Tiefsee-Ruf | Titel B, Klangquelle U | VA [g] · A.1 #20 · #21 | A.1-Phrase | Lead · Atmo | – | 2 · ★ | A.1 |
| Enigma | Sphären-Pop | Klosterhall-Chor — *≈ N08* | Einschätzung U | WT · A.1 #22 | A.1-Phrase | Fläche | – | 3 | A.1 |


---

## 3. Prioritäten für die Werksbibliothek

### 3.1 Regeln

| Stufe | Kommt in die Werksbibliothek? | Regel |
|---|---|---|
| **Tier 1** (43 + 1 Kandidat) | ja, zuerst anhören, kalibrieren und einbauen (erste V10d-Charge); Filter „Klassiker“ | Sehr hoher Wiedererkennungswert **und** Gerät oder Arbeitsweise BELEGT/WAHRSCHEINLICH; höchstens 4 Sounds je Act; jede Linie aus §1 und jede Rolle (Bass, Lead, Sequenz, Fläche, Akkord/Stab, Drums) vertreten. **Ausnahme:** Xanders ausdrückliche Wünsche (★) dürfen auch mit reinem Stil-Beleg in Tier 1 (7 Fälle: N01, N02, SZ-01, AO-01, DK-01, VG-1, Werk-Kit Gated 84). |
| **Tier 2** (90) | ja, zweite Charge; über „Vorbild ▾“ erreichbar | Alle übrigen ★-Sounds (47) sowie zweite Sounds wichtiger Acts mit BELEGT-Gerät und eigener Hörprobe; je Szene ein typisches Bass- oder Drum-Muster. 16 davon gibt es schon (Werk oder Spec A.1). **W-Alternativen** (AO-02/03/04, VG-2, VG-5, SH-2, C2-13): Xander wählt; was er nicht wählt, rutscht nach Tier 3. |
| **Tier 3** (194) | **nein** – Rezept und Hörprobe bleiben im Katalog, Einbau nur auf Wunsch oder nach neuem Beleg | Stil-Entwürfe ohne Gerätebeleg bei Acts, die Xander nicht genannt hat; Dritt- und Viertsounds; Fast-Doppel bis zum Blindvergleich; Sounds ohne Hörprobe (außer ★); Sounds, die einen fehlenden Baustein brauchen und schwach belegt sind; Kandidat Joy Division. |
| **Aufstieg/Abstieg** | – | Neuer Beleg (B) oder Xanders Wunsch hebt einen Sound um eine Stufe; ein Blindvergleich „klingt wie X“ (V10d-08) streicht den schwächeren Doppel-Sound. |

**Wirkung:** Neu in die Werksbibliothek kommen **114 Sounds** (Tier 1: 40, Tier 2: 74, jeweils ohne Werk und A.1) statt rund 300. Zum Vergleich: R6 plante 76 neue Presets, Spec A.1 hat 46.

### 3.2 Tier 1 (43 Kern-Sounds)

| # | Cluster | Rolle | Karte | Act | Engine · Rezept-ID | Hörprobe | Beleg (Gerät) | Warum Tier 1 |
|---|---|---|---|---|---|---|---|---|
| 1 | A | Lead hoch | Pfeif-Stimme ★ | Isao Tomita | VA · hel·T1 | hel:t1 | Moog III, Pfiff-Patch: Diagramm B, Bauweise W | Tomita-Pfiff, Patch-Diagramm belegt; Xander nannte Tomita |
| 2 | A | Bass, Achtel-Oktaven | Fahrbahn-Bass ★ | Kraftwerk | VA · hel·K1 | hel:k1 | Minimoog B | Startpunkt der Linie; Minimoog-Bass „Autobahn“ belegt |
| 3 | A | Sequenz Mitte | Rechenwerk-Sequenz ★ | Kraftwerk | VA · hel·K2 | hel:k2 | Synthanorma-Sequenzer B (steuert Minimoog: W) | Sequenzer-Klang von „Trans Europa Express“, Gerät belegt |
| 4 | A | Fläche | Phasen-Streicher ★ | Jean-Michel Jarre | VA · hel·J1 | hel:j1 | Eminent 310 + Small-Stone-Phaser B | Oxygène-Fläche, Eminent + Phaser belegt (Phaser folgt) |
| 5 | A | Sequenz/Bass | Disko-Puls (V0a „Moroder-Puls“) | Giorgio Moroder | VA · Werk | pio:mo1 (alt ret:lh2) | Moog Modular + Delay B | „I Feel Love“-Puls, Moog Modular + Delay belegt (Werk-Sound) |
| 6 | A | Riff, Bariton-Lage | Kaltfront-Riff ★ | Gary Numan / Tubeway Army | VA · pio·NU1 | pio:nu1 | Minimoog B (Phaser W) | Numan-Riff („Cars“-Welt), Minimoog belegt |
| 7 | A | Fläche/hohe Melodie | Menschenstimme-Fläche ★ | Gary Numan / Tubeway Army | VA · pio·NU2 | pio:nu2 | Polymoog-Preset „Vox Humana“ B | „Vox Humana“-Fläche, Preset belegt |
| 8 | A | Lead (Blech) | Sternfall-Brass ★ | Vangelis | VA · pio·VG1 | pio:vg1 | CS-80 mit Anschlag/Aftertouch/Ribbon B | Blade-Runner-Blech, CS-80-Spielweise belegt |
| 9 | B | Lead | Wanderer-Lead ★ | OMD | VA [g] · N07 | pop:n07 | Korg Micro-Preset („Traveller“) B | „Enola Gay“-Lead, Micro-Preset belegt |
| 10 | B | Drums | Rhythmus-Box 78 | OMD / Visage | Drum · N09 | pop:n09 (alt pio:vi2) | Roland CR-78 (selbst programmiert) B | CR-78 = Rhythmus der frühen Synthpop-Jahre (OMD, Visage, Soft Cell) |
| 11 | B | Sequenz | Hohltropfen ★ | The Human League | VA · N10 | ♫ fehlt | Korg 700S + System-100 B (Gerät); Klang U | „Being Boiled“ – von Xander genannt; Gerät belegt; Hörprobe fehlt |
| 12 | B | Sequenz hoch | Spinnen-Sequenz | The Human League | VA · N11 | hel:h1 | MC-4-Linien W | „Dare“-Sequenzlinien (MC-4: W) |
| 13 | B | Lead/Hook | Kettenreim-Lead ★ | Depeche Mode | VA · pop·DM1 | pop:dm1 | Jupiter-4 W | „Just Can't Get Enough“-Hook – Xanders Wunsch |
| 14 | B | Drums | Zählwerk-Kit 81 | Depeche Mode | Drum · pop·DM2 | pop:dm2 | Korg KR-55 + ARP-2600-Kick B | DM-Rhythmus 1981, KR-55 + ARP-Kick belegt |
| 15 | B | Riff | Hallen-Stahl FM ★ | Depeche Mode | FM6 · pop·DM3 | pop:dm3 | DX7 „SYN-LEAD 2“ W; Metall-Sampling 1983 B | „Everything Counts“-FM-Riff (DX7: W) |
| 16 | B | Bass/Sequenz | Zitter-Bass 90 ★ | Depeche Mode | VA · pop·DM4 | pop:dm4 | Minimoog + ARP 2600 W | „Enjoy the Silence“-Bass – Xanders Beispiel |
| 17 | B | Bass | Spielzeug-Bass 81 | Soft Cell | VA · ach·SC1 | ach:sc1 | Korg Synthe-Bass SB-100 B | „Tainted Love“-Ära: SB-100-Bass belegt (Ball, 2 Quellen); Soft Cell erfüllt die Tier-1-Regel |
| 18 | B | Bass | Mono-Gitter-Bass ★ | Erasure | VA · pop·ER1 | pop:er1 | MC-4 per CV/Gate, nur Analog B (Arbeitsweise) | Clarke-Arbeitsweise (MC-4, nur Analog) belegt |
| 19 | B | Arp | Zufalls-Arp 82 ★ | Duran Duran | VA · hel·D1 | hel:d1 | Jupiter-4-Arpeggiator auf ZUFALL B | „Rio“-Zufalls-Arp, Jupiter-4 belegt |
| 20 | B | Bass/Sequenz | Traum-Sequenzbass | Eurythmics | VA · ach·EU1 | ach:eu1 | SH-101, vom MCS Drum Computer getaktet B | „Sweet Dreams“-Sequenz, SH-101 + MCS belegt |
| 21 | B | Bass | Sequenzer-Bass 83 ★ | New Order | VA [g] · N13 | hel:n1 | Moog Source + Powertran-Sequenzer B | „Blue Monday“-Bass, Moog Source + Powertran belegt |
| 22 | B | Drums | Stotter-Kit 83 | New Order | Drum · N14 | pop:n14 | Oberheim DMX B | „Blue Monday“-Drums, DMX belegt |
| 23 | B | Lead/Hook hoch | Fjordlauf-Lead ★ | a-ha | VA · pop·AH1 | pop:ah1 | Juno-60 B | „Take On Me“-Hook, Juno-60 belegt – Xanders Wunsch |
| 24 | B | Fläche | Weitblick-Fläche ★ | Alphaville | VA [g] · N01 | pop:n01 | String-Machine/PPG U (nur Community-Liste) | „Forever Young“-Fläche – Xanders Wunsch (Gerät U) |
| 25 | B | Lead | Fanfaren-Lead ★ | Alphaville | VA [g] · N02 | pop:n02 | U | „Sounds Like a Melody“-Lead – Xanders Wunsch (Gerät U) |
| (+1) | B | Bass | (Lücke) Quinten-Bass „Big in Japan“ | Alphaville | VA · – (kein Rezept) | ♫ fehlt | System-100M, 2 Osz. eine Quinte verstimmt B | Kandidat: Bass von „Big in Japan“ belegt, Rezept + Hörprobe fehlen |
| 26 | D | Bass | Körperbass ★ | And One | VA · SZ-01 | szn:sz01 | U (belegt nur: „nur Macintosh“) | typischer And-One-Bass – Xanders Wunsch (Stil) |
| 27 | D | Bass („Morse“) | Signalbass ★ | And One | VA · AO-01 | ao01 | U | „bedrohlicher Signal-Bass“ (I.S.T.) – Xanders Wunsch (Stil) |
| 28 | D | Sequenz | Rasterzeilen-Arp ⧉ ★ | Welle:Erdball | VA · SZ-05 | szn:sz05 | C64-SID B | C64-Arp, SID belegt – Xander nannte Welle:Erdball |
| 29 | D | Lead | Leuchtfeuer-Lead (Variante Werk „Supersaw-Hymne“) | VNV Nation | VA · SZ-29 | szn:sz29 | JP-8000/Virus W | Futurepop-Supersaw (JP-8000/Virus: W) |
| 30 | E | Bass/Sequenz | Schiefe Kette | DAF | VA · EB-01 | ebm:eb01 | Korg MS-20 + SQ-10 B | EBM-Urform: MS-20 + SQ-10 belegt |
| 31 | E | Drums | Ziegel-Kit | Front 242 | Drum · EB-02 | ebm:eb02 | E-mu Drumulator B | EBM-Drums, Drumulator belegt |
| 32 | E | Akkord/Stab | FM-Kantenstab | Front 242 | FM6 · EB-03 | ebm:eb03 | Yamaha DX7 B | Rolle Akkord/Stab: FM-Kantenstab der EBM, DX7 belegt (bonedo + gearnews) |
| 33 | E | Bass | Ein-Osz-Drillbass | Nitzer Ebb | VA · EB-04 | ebm:eb04 | Roland SH-101 W (Zitat aus 2. Hand) | EBM-Drill-Bass (SH-101: W) |
| 34 | E | Bass | Pro-Schnarrbass | Skinny Puppy | VA · EB-05 | ebm:eb05 | Sequential Pro-One B (cEvin Key) | Industrial-Bass, Pro-One belegt |
| 35 | E | Bass | Stampf-Bass ★ | Agonoize | VA · C2-10 | cw2:„Funkenregen“ | gesättigte Bässe (Genre) W | Aggrotech-Bass – Xander nannte „Ego noise“ = Agonoize |
| 36 | F | Bass (melodisch, hoch) | Herbstriff-Bass ★ | The Frozen Autumn | VA · DK-01 | dark:fa | Synthex/K4 nur Equipboard (W-schwach); K1 U | Cold-Wave-Melodiebass – Xanders Kern-Vorbild (Gerät U) |
| 37 | F | Keys/Arp | Kaltes Glas ★ | Static Movement | WT · A.1 #12 | dark:sm | PPG Wave 2.2 W (KD-1, nicht „belegt“) | Static-Movement-Glas (PPG: W) – Xanders Vorbild |
| 38 | G | Sequenz | Neon-Arp | Kavinsky | VA · N33 | ret:kv2 | Juno-Emulation W (Reverb Machine) | „Nightcall“-Arp (Juno-Emulation: W) |
| 39 | G | Fläche | Nachtblau-Fläche ★ | The Midnight | VA · N31 | ret:mn1 | Juno-106 (McEwan) B; Part U | The-Midnight-Fläche, Juno-106 belegt – Wunsch des Kumpels |
| 40 | G | Drums | Gated 84 (Werk-Kit) | Retrowave (Genre) | Drum · Werk | ret:mo2 | Gate-Hall-Snare (Genre, eK) | Gated-Snare der Retrowave (Werk-Kit) |
| 41 | G | Bass | Dunkelfahrt-Bass | Carpenter Brut | VA [g] · N39 | ret:cb1 | Pro 2/Prophet-6/OB-6 B (2018); „distorted synths“ B | Darksynth-Bass, Geräte 2018 belegt |
| 42 | H | Bass tief („Filter öffnet sich“) | Himmelstor-Bass ★ | Vogue („Himmlische Klangdimensionen“, 1988) | VA · VG-1 | vg-v1 | Casio FZ-1 auf der Hülle W; dieser Bass vom FZ-1 U | „Bass, dessen Filter sich öffnet“ – Xanders Wunsch |
| 43 | H | Bass tief | Klatsch-Bass (übernimmt A.1 #46) ★ | VIZE (Slap House) | VA · SH-1 | sh-h1 | Technik B (3 Tutorials); VIZE-Gerät U | Slap-House-Bass, Technik belegt – Xanders Wunsch |


**Begleitende Spielmuster (Tier 1 als ⧉-Clips, kein eigener Sound):** die acht Bass-Muster P1–P8 aus `vorbild-dark.md` §4 (Galopp, Drill, Offbeat-Roll, Offbeat-Roll gerade, Hammer, 8-Schritt-Kette, Halbton-Pendel, Triolen-Galopp; dazu Achtel-Oktave). Sie decken Xanders Wunsch „typische Industrial-Bässe“ (L2/L3) ab und funktionieren mit jedem Tier-1-Bass.

### 3.3 Tier 2 und Tier 3 (IDs je Linie; ★ = Xanders Wunsch)

- **Tier 2 · Wurzeln 1974–1982 (Pioniere):** hel·K4, pio·MO3, pio·SU1, pio·UV1, pio·YM1, Werk „Ensemble-Streicher“, Werk „Weite 82“ ★
- **Tier 2 · Synthpop und New Wave 1979–1991:** N08, pop·OM1, pop·HL2, pop·DM5, pop·YZ2, pop·ER3, hel·D2, ach·TF2, ach·PS1, ach·PS2, A.1 #5, A.1 #45, N03 ★
- **Tier 2 · Italo Disco und Eurodisco:** ach·IG1
- **Tier 2 · Deutsche und europäische Synthpop-Szene, Futurepop:** SZ-02, AO-02 ★, AO-03 ★, AO-04 ★, AO-05 ★, AO-06 ★, AO-07 ★, A.1 #8, C2-05 ★, C2-06 ★, SZ-09 ★, SZ-10 ★, SZ-13 ★, SZ-14 ★, SZ-06 ★, SZ-07 ★, SZ-08, A.1 #26, SZ-23 ★, SZ-24 ★, N20 ★, SZ-30, EB-11, SZ-19 ★, SZ-20 ★
- **Tier 2 · EBM, Industrial, Dark Electro, Aggrotech:** EB-07, DK-11, DK-24, EB-06, DK-31, C2-09 ★, C2-12 ★
- **Tier 2 · Cold Wave, Minimal Wave, Darkwave:** CR-01, DK-07, SZ-16 ★, SZ-15 ★, DK-02 ★, DK-04 ★, A.1 #14 ★, A.1 #13 ★, DK-05 ★, DK-06 ★, C2-01 ★, C2-02 ★, C2-03 ★, CR-13, Werk „Kaskaden-Bass“, CR-16
- **Tier 2 · Retrowave, Synthwave, Darksynth:** Werk „DCO-Fläche“, Werk „Glas-Pluck“, Werk „Sync-Lead“, N34, Werk „DCO-Streicher“, N32 ★, ret·MN3 ★, N38 ★, CR-25, N40, N41
- **Tier 2 · Xanders Spezial-Wünsche (Vogue, Slap House, Electroclash, „Jump“, Enigma):** VG-2 ★, VG-3 ★, VG-4 ★, VG-5 ★, VG-6 ★, SH-2 ★, C2-13 ★, Werk „Zweipol-Brass“ ★, A.1 #20 · #21 ★

- **Tier 3 · Wurzeln 1974–1982 (Pioniere):** hel·T2, hel·T3, hel·K3, pio·KW5, hel·J2, hel·J3, N69 · N70, pio·MO2, pio·SU2, pio·CV2, pio·CV3, pio·UV2, pio·YM2, pio·YM3, pio·NO1, pio·NO2, pio·TX1, pio·TX2, pio·BG2, pio·SP1, pio·SP2, pio·VI1, pio·FG1, pio·FG2, pio·JP1, pio·JP2, pio·JP3
- **Tier 3 · Synthpop und New Wave 1979–1991:** N12, pop·HL1, ach·H1, ach·H2, N05, N06, ach·SC2, pop·YZ1, pop·YZ3, pop·ER2, ach·ER4, hel·D3, ach·EU2, ach·EU3, ach·TD1, ach·TD2, ach·BM1, ach·BM2, ach·CC1, ach·HJ1, ach·HJ2, ach·TF1, ach·TF3, ach·TT1, ach·TT2, ach·PR1, ach·PR2, N15, N16, pop·AH2, pop·AH3, N04, A.1 #4, pop·AV2, ach·RL1, ach·MW1, ach·CJ1, SZ-36, SZ-37, SZ-38
- **Tier 3 · Italo Disco und Eurodisco:** ach·IK1, ach·IK2, ach·IS1, ach·IM1
- **Tier 3 · Deutsche und europäische Synthpop-Szene, Futurepop:** SZ-03, SZ-04, A.1 #9, N23, C2-07, C2-08, EB-16, EB-17, EB-25, SZ-11, A.1 #17 · N25, SZ-12, A.1 #18 · #19 · N24, A.1 #27–#30, N26 · N27 · N76, SZ-33, SZ-34, SZ-35, EB-26, EB-27, SZ-25, SZ-26, SZ-27, SZ-28, SZ-31, SZ-32, EB-12, EB-19, EB-18, EB-24, EB-13, EB-20, EB-23, EB-21, EB-22, SZ-21, SZ-22, N22, SZ-39, SZ-40
- **Tier 3 · EBM, Industrial, Dark Electro, Aggrotech:** DK-18, DK-19, EB-08, DK-12 · DK-13 · DK-14, DK-15, DK-17, DK-16, DK-20–DK-23, EB-09, EB-10, DK-25 · DK-26, DK-27, DK-28 · DK-29 · DK-30, DK-32 · DK-33 · DK-34, C2-11, EB-14 · EB-15
- **Tier 3 · Cold Wave, Minimal Wave, Darkwave:** CR-02, Werk · CR-04, CR-05, DK-08 · DK-09 · DK-10, SZ-17 · SZ-18 · N18, DK-03 · A.1 #15 · N28 · N29 · N47, N30, CR-08, CR-09 · CR-11, CR-12, C2-04, CR-14, CR-17
- **Tier 3 · Retrowave, Synthwave, Darksynth:** CR-18, N35, CR-24, CR-21, ret·MM1, ret·MM2, ret·CT1–CT3, ret·LM1, N37, ret·F82, N36, ret·GS2, ret·MO1 (→ „OA1“), N42, ret·CB3, ret·PT2, CR-22 · CR-23
- **Tier 3 · Xanders Spezial-Wünsche (Vogue, Slap House, Electroclash, „Jump“, Enigma):** SH-3, C2-14, SH-4, A.1 #22

---

## 4. Doppelungen und Widersprüche zwischen den Dateien – aufgelöst

Grundsatz: Die Quelldateien bleiben unverändert. Was hier entschieden ist, gilt für den Einbau (Spec, Builder) und ist als Vorschlag markiert, wo es eine Spec-Änderung braucht.

### 4.1 ID-Kollisionen (gleiche Kurz-ID, verschiedene Sounds)

| Kurz-ID | kommt vor in | Entscheidung |
|---|---|---|
| `MO1`, `MO2` | Moroder (`pio` §3.1: MO1–MO3) und Michael Oakley (`ret` §5.9: MO1 Glanzzupf, MO2 Hörprobe Gated 84) | Katalog-Präfix `pio·` / `ret·`. Vorschlag: Oakley in `ret` auf **OA1/OA2** umbenennen; die Hörprobe-Schlüssel `ret:mo1/mo2` bleiben als Alias. |
| `H1`, `H2` | Heaven 17 (`ach`) · Hörprobe H1 = N11 (`hel`) · Slap-House-Hörproben H1/H2 (`spezial-slaphouse` §4) | Präfix; Slap House heißt im Katalog `sh-h1`/`sh-h2` (wie `vorbild-spezial`). |
| `SC1/SC2` und `SC` | Soft Cell (`ach`) · Hörprobe Suicide Commando „SC“ (`dark`) | Präfix `ach·` bzw. `dark:sc`. |
| `SP1/SP2` und `SP` | Sparks (`pio`) · Hörprobe Skinny Puppy „SP“ (`dark`) | Präfix. |
| `D1–D3` und `D1–D4` | Duran Duran (`hel`) · Demo-Baupläne D1–D4 (`dark` §5.12) | Präfix; Demos sind keine Sounds. |
| `K1`, `K2` | Kraftwerk (`hel`) · Diktat-Kandidaten K1/K2 (`cr` §6.2) | Präfix; Kandidaten sind keine Sounds. |
| `N1` und `N01` | Hörprobe N1 (= N13, `hel`) · Preset N01 (R6) | Hörprobe `hel:n1`, Preset `N01`. |
| `V1–V6` | Vogue-Rezepte (`spezial-vogue`) · Paketnamen V1c, V10d … | Katalog: **VG-1 … VG-6**. |
| `S1–S4` | Slap-House-Rezepte (`spezial-slaphouse`) · Song-Wünsche S1–S9 (`fragen-xander-7/8`) | Katalog: **SH-1 … SH-4**. |
| `T1–T3` | Tomita (`hel`) · Taktzeilen „T1:“ in allen Notenlisten | Präfix `hel·`. |

### 4.2 Namens-Kollisionen

Skript-Prüfung aller Namen aus R6 (N01–N76), Spec A.1 (#1–#46), allen R7-Dateien und den Werks-Namen (`katalog-work`, ganze Namen, Groß/Klein egal). **Genau gleich:**

| Name | Einträge | Entscheidung |
|---|---|---|
| „Gummi-Bass“ | C2-13 (Slap-House-Reese) · Werks-Sound (V0a Z. 5696) | C2-13 → **„Reese-Hüpfer“** (Vorschlag aus `vorbild-spezial`, `spezial-slaphouse`, `cr` §8.5). |
| „Kathedralen-Chor“ | R6 N08 (OMD) · SZ-20 (Project Pitchfork = R6 N21 mit Korrektur) | SZ-20 heißt wieder **„Dämmerungs-Chor“** (Name von N21); N08 behält „Kathedralen-Chor“. |
| „Marmor-Streicher“ | R6 N17 · SZ-16 | gewollt: ein Eintrag, Werte und Hörprobe aus SZ-16. |

**Verwechselbar** (vor dem Einbau mit `r6/n6/doppel-check.mjs` prüfen; Vorschläge): Kaltfront-Riff (NU1) ↔ Kaltfront-Bass (C2-01) → NU1 „Frostmaschinen-Riff“ · Grauschleier-Bass (VI1) ↔ Grauschleier-Fläche (C2-03) · Grollbass (SZ-19) ↔ Grollbass FM (AO-04) · Schaltwerk-Bass (SZ-26) ↔ Schaltwerk-Kit (AO-07) · Leuchtfeuer-Lead (SZ-29) ↔ Leuchtturm-Stab (EB-19) · Tiefsee-Bass (EB-18) ↔ Tiefsee-Filterbass (N51) ↔ Tiefsee-Ruf (A.1 #21) · Schulterbass (SZ-34) ↔ Schulterpolster-Slap (MM1) · Kaltraum-Kit (SZ-28) ↔ Kühlraum-Kit (C2-04) ↔ Kaltkasten-Kit (DK-04) ↔ Kaltstahl-Kit (CR-11).
**Namen mit Titel- oder Gerätebezug (E9):** „Kunstleder-Riff“ (spielt auf „Warm Leatherette“ an) → „Schnarr-Riff“ · „Sonnenbrillen-Bass“ (= „Sunglasses at Night“) → „Kalter Achtel-Bass“ · A.1 #13 „Synthex-Streicher“ (Gerätename, A.13) → „Eiszeit-Streicher“ · „Menschenstimme-Fläche“ (= Orgelregister „Vox Humana“, kein Markenname; prüfen).

### 4.3 Doppelte oder fast gleiche Klänge

| Paar | Entscheidung |
|---|---|
| A.1 #1 Ketten-Riff ↔ DM1 Kettenreim-Lead (beide „Just Can't Get Enough“) | **ein** Eintrag mit Hörprobe `pop:dm1`; Rezept nach Blindvergleich (A.1 #1 ist gemessen [g]); A.1-Name als Alias. ⓘ: Jupiter-4 nur W. |
| A.1 #3 Fjord-Riff ↔ AH1 Fjordlauf-Lead („Take On Me“) | wie oben, Hörprobe `pop:ah1`. |
| A.1 #46 Schwerer Slap ↔ SH-1 Klatsch-Bass | SH-1 übernimmt den Platz (Technik belegt, Tonhöhen-Klick statt Fall). C2-13 bleibt als Legato-Reese-Variante. |
| A.1 #16 Schwedenstahl-Lead ↔ SZ-10 Fernweh-Lead | SZ-10 (Verfeinerung) ersetzt A.1 #16; Spec A.1 anpassen. |
| A.1 #30 Brotkasten-Drums ↔ SZ-08 Rauschwellen-Kit | SZ-08 (Verfeinerung) ersetzt A.1 #30. |
| N17 ↔ SZ-16, N19 ↔ SZ-23, N21 ↔ SZ-20 | jeweils ein Eintrag mit den R7-Werten und R7-Hörprobe (Verfeinerungen laut `szn`). |
| N22 ↔ SZ-19 (Project Pitchfork) | Schwestern: SZ-19 (mit Hörprobe) Tier 2, N22 Tier 3 (N22 ≈ N45 laut R6 §13). |
| N28 ↔ DK-01 (Frozen-Autumn-Melodiebass) | DK-01 Tier 1, N28 Tier 3. |
| N29 (K4-Lesart) ↔ DK-02 (K1-Lesart) | beide behalten, weil das Gerät offen ist: DK-02 Tier 2 (in Hörprobe), N29 Tier 3. |
| N30 ↔ A.1 #12 (PPG-Glas, Static Movement) | A.1 #12 Tier 1 (in Hörprobe `dark:sm`), N30 Tier 3. |
| DK-18 ↔ EB-01 (DAF) | EB-01 Tier 1 (neue Belege, 12-Schritt-Kette), DK-18 Tier 3. |
| DK-15 ↔ EB-04 (Nitzer Ebb) | EB-04 Tier 1, DK-15 Tier 3. |
| DK-11/DK-12 ↔ EB-03 (Front 242) | EB-03 (FM-Stab, DX7 belegt) **Tier 1** als Vertreter der Rolle Akkord/Stab (§8); DK-11 (Galopp-Bass = EBM-Grundmuster) Tier 2; DK-12 Tier 3. |
| N42 Neon-Kit 84 ↔ Werk-Kit Gated 84 | Werk-Kit Tier 1 (Hörprobe `ret:mo2`), N42 Tier 3. |
| N36 ↔ Werk Zweipol-Brass (Distanz 0,045) · N13 ↔ N19 (0,049) · N22 ↔ N45 (0,038) · N26 ↔ A.1 #26 · N27 ↔ A.1 #35 · N08 ↔ A.1 #22 | R6-Regel V10d-08: Trick-Messung entscheidet; bis dahin steht der jüngere bzw. schwächer belegte Sound in Tier 3. |
| CR-04 ↔ DK-07 · CR-12 ↔ C2-04 · CR-21 ↔ Werk PWM-Fläche | Blindvergleich (`cr` §8.1); bis dahin Tier 3. |
| SH-3 Klatsch-WT ↔ SH-1 | gleiche Hörprobe, nur Farbe → Tier 3. |
| A.1 #9 Grauzone-Bass ↔ SZ-01 / AO-05 | A.1 #9 Tier 3. |
| AO-02/03/04 ↔ AO-01 · AO-05 ↔ SZ-01 · VG-2 ↔ VG-1 · VG-5 ↔ VG-4 · SH-2/C2-13 ↔ SH-1 | Lesarten **eines** Wunsches: Xander wählt 1–2, der Rest geht nach Tier 3. |
| N38 ↔ Werk Zinken-Piano | schon aufgelöst (`ret` K-R4): N38 = DX7-ROM „E.PIANO 1“, kein Doppel mehr. |

### 4.4 Ein Sound, zwei Hörproben

Spec §12.8 kennt **eine** `aud` je Sound. Entscheidung: Die Karte spielt die erste Hörprobe; die zweite wird nur übernommen, wenn die Spec ein optionales Feld `aud.alt[]` bekommt (Vorschlag, nicht entschieden).

| Sound | Karte (Default) | zweite Hörprobe |
|---|---|---|
| Werk Disko-Puls (V0a „Moroder-Puls“) | `pio:mo1` (Disco, e-Moll) | `ret:lh2` (Outrun, h-Moll) |
| Werk Ensemble-Streicher | `pio:bg1` (The Buggles) | `cr:cr07` (Asylum Party) |
| N09 Rhythmus-Box 78 | `pop:n09` (OMD) | `pio:vi2` (Visage) |
| C2-03 Grauschleier-Fläche | `cw2:„Grauer Fluss“` (Sixth June) | `cr:cr06` (Trisomie 21) |
| DK-07 Chorus-Saitenbass | `dark:cx` (Clan of Xymox) | `cr:cr10` (Lebanon Hanover) |

### 4.5 Werks-Namen

Die R7-Dateien nennen Werks-Sounds mit ihren **V0a-Namen** („Moog-Bass“, „Juno-Pad“, „Juno-Streicher“, „Moroder-Puls“, „OB-Brass“). Der Katalog nutzt die Namen aus Spec Anhang A.4 (Kaskaden-Bass, DCO-Fläche, DCO-Streicher, Disko-Puls, Zweipol-Brass); der alte Name bleibt Alias. Werks-ⓘ-Texte: „Pop-Bass FM“ ohne a-ha-Tag (`pop` K-P2), „Synthpop-Bass“ ohne SH-101 (`pop` K-P3), „Weite 82“ und „Disko-Puls“ jetzt mit Belegstatus B (`pio` §3.1/§3.9).

### 4.6 Drei Beleg-Skalen → eine

R6 nutzte b/s/e/u; R8 ließ einen Wikipedia-Auszug als BELEGT gelten (Equipboard höchstens W); `szn`, `dark`, `pop`, `spz` und die späteren Dateien sind strenger (Wikipedia allein = W). **Entscheidung:** Es gilt die strenge Skala aus dem Kopf dieser Datei. Wo das etwas ändert:

| Fakt | vorher | jetzt | Grund |
|---|---|---|---|
| And One „two keyboards and a beatbox“ | B (`r8` §1.4) | W | nur Wikipedia (`szn`, `spezial-andone` K-AO-5) |
| DM „Enjoy the Silence“: Bass Minimoog + ARP 2600 | B (`r8` §1.10) | W | eine Sekundärquelle, Reverb-Nachbau (`pop` §0) |
| Human League: MC-4-Linien (N11) | b (R6), „BELEGT laut R6“ (`hel`) | W | Händler-Blog/Stereogum (`r8` §1.14) |
| Static Movement: Synthex + PPG 2.2 (A.1 #12/#13, N30) | b (R6, A.1) | W | ein Fan-Auszug (`dark` KD-1) |
| The Frozen Autumn: Kawai K4 | s (R6), W (`r8`), U (`dark`) | W-schwach, nie im ⓘ | nur ein Equipboard-Foto |
| The Midnight: Saxofon | B (`r8`) | W | nur Wikipedia (`ret` K-R8) |
| Kavinsky, Timecop1983 | b (R6) | W | Reverb Machine = eine Sekundärquelle (`ret` K-R1) |
| New Order: Prophet-5 (N16) | b (R6) | W | Fan-Forum (`r8` §1.15) |
| A.1 #1: Jupiter-4 bei „Just Can't Get Enough“ | „belegt“ (A.1) | W | nur Thomann-Blog (`pop` K-P5) |
| Second Decay: Bandfakten | W (`szn`) | B | Qobuz + systemsofromance (`spezial-slaphouse` §5) |
| And One „I.S.T.“ = 1994 | W (`szn`) | B | zwei Quellen (`spezial-andone` K-AO-4) |
| DAF: MS-20 + SQ-10 | U (`dark`) | B | zwei Quellen (`ebm` K-1) |
| Front 242: Emulator II, Drumulator, DX7/TG-77 | U (`dark`) | B | `ebm` K-2 |
| Skinny Puppy: Multimoog, Pro-One | U (`dark`) | B | Interview cEvin Key (`ebm` §2.4) |
| Suicide Commando: SH-101 + DR-55 | U (`dark`) → B (`ebm`) | W | nur ein Suchauszug eines Interviews, Nachsuche ohne Treffer (§8) |
| Apoptygma Berzerk „live von Anfang an mit Gitarren und Schlagzeug“ | B (`ebm`) | W, „von Anfang an“ gestrichen | ein Auszug, nicht reproduziert; andere Interviews widersprechen (§8) |
| YMO: Prophet-5 „erst ab BGM (1981)“ | B (`pio`) | **falsch** → Prophet-5 ab 1979 live B; BGM-Großteil auf Prophet-5 B; „ersetzt Moog III-C“ W | Reverb, RBMA (§8) |
| Japan „Ghosts“: Eröffnungsklang auf System 700 | B (`pio`) | W | nur Wikipedia-Auszug + Forum; Prophet-5/OB-X-Akkorde und Marimba bleiben B |
| Molchat Doma: MusicRadar-Studioliste | B (`cr`) | DX7 + Minimoog B; Juno-106 W; Rest W | nur Überschrift + FL Studio 10 bestätigt; American Songwriter nennt DX7, Minimoog, Juno-106, Lel 0041 |
| Michael Oakley: Ensoniq VFX/TS10/MR + SY85 | B (`cr`) | W | Seite als Treffer, aber kein Auszug nennt die Modelle |
| Mesh: Pro-One, MS2000, Trinity | U (`szn`) | B (Person, nicht titelgenau) | `ebm` §2.9 |
| VNV Nation: JP-8000, Virus | U (`szn`) | W | `ebm` K-8 |
| Clan of Xymox: Korg MS-10 | U (`dark`) | W | `cr` §3.9 |
| Carpenter Brut | „Stil b“ (R6, `ret`) | B Geräte (2018) | Interview (`cr` §4.6) |
| Perturbator | u | W (Emulationen) | `cr` §4.6 |
| Moroder, Vangelis | e (R6) | B Gerät/Spielweise | `pio` §3.1, §3.9 |
| Erasure | s (R6) | B Arbeitsweise | `pop` K-P13 |

### 4.7 Widersprüche, die offen bleiben (im ⓘ neutral formulieren)

- **Kraftwerk:** Lead auf „Das Model“ Polymoog **oder** Minimoog; Synthanorma 16 **oder** 32 Schritte; ein Forumszitat (Bartos, SOS 1998) sagt, ein Sequenzer sei auf keiner Aufnahme benutzt worden.
- **Depeche Mode „Speak & Spell“:** ARP-Sequenzer (Clarke, SOS) **oder** MC-4 (MusicRadar).
- **Vince Clarkes Auslöser:** OMD-Single „Electricity“ (SOS) **oder** ihre B-Seite „Almost“ (MusicRadar) – beides OMD.
- **Tears for Fears:** Prophet-5 **oder** Prophet T8; DX7 **oder** DX1. **Thomas Dolby:** Minimoog **oder** Micromoog. **Ultravox** „Hiroshima Mon Amour“: TR-77 **oder** CR-78.
- **Erasure 1986–88:** Emulator II in Gerätelisten gegen Clarkes Aussage (Mai 1986), er sei „vom Sampling abgekommen“.
- **Korg SQ-10:** 12 **oder** 16 Schritte. **„Cold Wave“:** zuerst im Kraftwerk-Heft **oder** im Siouxsie-Artikel von Sounds (1977).
- **Jahreszahlen:** Apoptygma Berzerk 1986 **oder** 1989; Seabound 1995 **oder** 1996; Lazerhawk „Redline“ 2010 **oder** 2011; Trisomie 21 1980 **oder** 1981 (Denain **oder** Lille).
- **Kirlian Camera „1979 als ‚Suicide Commando‘ gegründet“:** nur ein R6-Auszug, in `cr` nicht bestätigt → nie im ⓘ (Verwechslung mit dem belgischen Act).
- **Kavinsky:** Todesmeldung nur aus einer Quelle → nicht verwenden; ⓘ ohne Lebensdaten.
- **Visage „Fade to Grey“:** Grundbeat Roland CR-78 (Egan, Roland-Artikel + Interview 1984) **gegen** „the drum break on Fade to Grey is all Fairlight“ (E&MM „Behind Visage“, Aug. 1984; Sprecher wohl Egan). ⓘ: „CR-78-Grundbeat“, nie „komplett CR-78“.
- **Diktat „Tiger“:** `cw2`/`cr` „ungelöst“ bzw. Lesart „Dieter“ (Bohlen) gegen `spezial-slaphouse`: **Tiga & Zyntherius** (BELEGT). Entscheidung: `spezial-slaphouse` gilt (neuer, belegt, passt zu Xanders Wort „Zyntherius“).

### 4.8 Format-Widersprüche

- **Länge:** Spec §12.8 erlaubt `aud` ≤ 8 s und `len ≤ 4` Takte. Viele Proben haben 8 Takte (`ach` 7×, `ebm`, alle 4 Act-Hörbeispiele in `cw2`, `ao01`, `ao07`, `sh-h1`) bzw. eine Fassung „ganz“ ≤ 16 s. **Entscheidung (Vorschlag, Spec-Änderung nötig):** Die Karte spielt „kurz“ (≤ 8 s: erste n − 1 Takte + letzter Takt, so in allen Dateien vorbereitet); „ganz“ (≤ 16 s, ≤ 8 Takte) als optionales Feld.
- **Anschlag:** `aud.notes` nutzen v = Anschlag/127 (0–1, `szn` K-13); die Rohdaten in `helden-work` stehen in 1–127 → beim Einbau umrechnen.
- **Mehrspurige Act-Hörproben** (`dark`, `szn`, `cw2`) gegen Einzelproben (übrige): Jeder Sound bekommt **seine** Spur als `aud`; die anderen Spuren nur als optionales `aud.band` (−9 dB, Vorschlag `cw2` §6).
- **Lage-Angaben:** Probe-Umfang (`ach`, `ebm`) gegen Grundton-Bereich (`sound.lage`, `transposition-lage.md` §3.7). Die Spalte „Lage-Default“ nutzt den Grundton-Bereich, Oktav-Riffs als „(+Okt.)“.
- **Begriff „Tier 1“:** `vorbild-spezial.md` nennt Xanders persönliche Wunsch-Sounds „Tier 1“. Hier ist Tier = Wiedererkennung + Beleg; Xanders Wunsch ist das Zeichen ★ (immer Tier 1 oder 2). Kein Sound verliert dadurch seinen Vorrang: die Kern-Wünsche (VG-1, AO-01, SH-1, SZ-01) sind Tier 1.

---

## 5. Was noch UNBELEGT oder unklar ist

### 5.1 Diktierte Namen: wie gesagt, wie angekommen, Stand

| wie diktiert (wörtlich) | Runde | so kam es an (unsere Lesart) | Stand | was noch fehlt |
|---|---|---|---|---|
| „Ego noise“ | 7 | Agonoize | geklärt (Xander, Runde 8) | – |
| „Division“, „And One Division“ | 7 | De/Vision | geklärt (Xander, Runde 8) | – |
| „Sixt JUNE“ | 8 | Sixth June | geklärt | – |
| „Radio Station“ (bei Static Movement) | 7 | Titel „Radio Station“ auf dem Album „Visionary Landscapes“ (1999) | **neu gefunden, BELEGT** (Spotify: https://open.spotify.com/track/6PJEaZPToWHo0cVtPQF8wC) | – (keine Rückfrage mehr) |
| „LK sind oder Kawai K1“ | 9 | „Elka Synth(ex) oder Kawai K1“ (Deutung `r8` §0, UNBELEGT) – Gerät von The Frozen Autumn | K1: 0 Treffer in 8 Suchen; Synthex und K4 nur Equipboard (W-schwach) | Woher stammt die K1-Info (Interview, Foto, Video)? |
| „den Lause Bass und der so bei Ben V VIZE und Tiger und Centuries“ | 8 | Slap-House-Bass von VIZE; „Tiger und Centuries“ = „Tiger und Zyntherius“ = Tiga & Zyntherius | VIZE und Tiga & Zyntherius BELEGT; die Deutung hat Xander in Runde 9 bestätigt | **offen:** „Lause“ (Louie? Laser?) und „Ben V“ (Imanbek? „bei“?). Kandidat: „Brother Louie“ von VIZE × Imanbek × Dieter Bohlen (2020; Titel BELEGT, Deutung UNBELEGT) |
| „Tiger und Zyntherius“ | 2, 9 | Tiga & Zyntherius „Sunglasses at Night“ (2001, Electroclash, Cover von Corey Hart 1984) | BELEGT (`spezial-slaphouse` §1) | Original 2001 oder ein Slap-House-Mix (z. B. DJ Gollum & Mark Future)? |
| „Zviad Bekauri – Me Am Ghame“ | 2 | wahrscheinlich Zviad Bekauri „Am Ghames“ | **neu:** Titel BELEGT (Spotify: https://open.spotify.com/track/35W5zKGdb4d7Fgv5r374EM); Deutung WAHRSCHEINLICH (Lautähnlichkeit); kein Slap-House-Remix gefunden | Ist es dieser Titel? Original oder Remix? |
| „„SexyBack“-Elektro-Version“ | 2 | eine Elektro- bzw. Slap-House-Fassung von „SexyBack“ (Justin Timberlake) | **offen** (WebSearch und Spotify ohne passenden Treffer) | Interpret oder Link der Fassung |
| „Stereoact“ | 2 | deutsches DJ-Duo (Schlager-Remixe) | Act BELEGT; Slap-House-Bezug UNBELEGT | Welcher Titel? |
| „Second TK“ | 6 | Second Decay; „Purwien“ = Christian Purwien | geklärt (Xander, Runde 9); Purwien BELEGT | – |
| „proWIN … I hate Berlin“ | 6 | „I Hate Berlin“ = größter Hit von Second Decay | „I Hate Berlin“ BELEGT (Spotify); „proWIN“ **offen** (nach eK eine Direktvertriebsfirma → vermutlich Diktatfehler) | Was war „proWIN“? |
| „keit … Polylog“ (bei „Covenant?“) | 2 | unklar | **offen seit Runde 2** | Was oder wen meintest du? |
| „Gamma“, „Voodoo“ | 9 | And One „Ghama Voodoo“ (ein Titel, 5:40) | BELEGT (Spotify) | Bei welcher Minute ist der Signal-Bass? |
| „I.S.T.“ = „EST“? | 2 | And One „I.S.T.“ (1994) | BELEGT | – |
| „Himmlische Klangdimensionen“ | 9 | Vogue (1988, Polyphon), „FZ 1 (Casio)“ auf der Hülle | W (Discogs-Auszug) | E-Bass oder Synth-Bass in „Vom Himmel hoch“? Foto der Credits |
| „die Music“ | 9 | Digital Musician (DigitalMusician.net) | **geklärt** (Xander, Runde 9) – keine Rückfrage mehr nötig | – |
| „Sindy Pop“, „Synthie Pop“ | 9, 10 | Synthpop | klar | – |
| „Gary Newman“ | 10 | Gary Numan | klar | – |
| „segnet Sounds“ | 10 | Signature-Sounds | klar | – |
| „Midnight“ | 6 | The Midnight | klar | – |
| „Spock“ | 2, 6 | S.P.O.C.K | klar | – |
| „Enigma Walgeräusche“ | 5 | Enigma-Atmos (A.1 #20/#21) | Klangbild klar; ein Enigma-Titel mit „Wal“-Klang UNBELEGT | optional: welcher Titel? |
| „Andy Pop“, „Antipop“ | 6 | Synthpop? bzw. Synthpop-/Darkwave-Umfeld; vielleicht And Ones Album „Bodypop“ (UNBELEGT) | **offen** | Was war gemeint? |
| „Eindhoven“ | 5 | unklar (vielleicht „Take On Me“?) | **offen** | Was war gemeint? |

Nicht Teil dieses Katalogs (andere Themen, offen in den jeweiligen Runden): „TEC Hell iKON Boys Life“ (Runde 5, Live-Gerät), „Trend geht oder Adeqvat … Lauf … ausblenden … ABA“ (Runde 4).

### 5.2 Was noch UNBELEGT ist

- **Kein Gerätemodell belegt (Sounds = Stil-Entwürfe, ⓘ ohne Gerät):** And One (belegt nur „nur Macintosh“), De/Vision, Agonoize (nur Genre), Sixth June, S.P.O.C.K, Elegant Machinery (nur Marke Novation), Kirlian Camera, Project Pitchfork, Covenant (nur Equipboard), Camouflage, Wolfsheim, Second Decay („nur analoge Synths“, W), Seabound, Rotersand, Solar Fake, Diary of Dreams, Blutengel, Beborn Beton, Iris, Massive Ego, Apoptygma Berzerk, Assemblage 23, Combichrist, Hocico, Leæther Strip, Front Line Assembly (nur Equipboard), Neuroticfish (nur Equipboard), Real Life, Cetu Javu, Men Without Hats, Gazebo, Savage, Modern Talking, Martin Dupont, Trisomie 21, Asylum Party, Lebanon Hanover, The Frozen Autumn (nur Equipboard), College, Electric Youth (Modelle), Dance With the Dead, FM-84, Gunship (nur Equipboard), Lazerhawk, Com Truise, Le Matos, Joy Division, Enigma, VIZE (nur Technik), Tiga & Zyntherius.
- **Patches und Klangwerte:** bei **allen** Acts UNBELEGT; jedes Rezept ist ein eigener Entwurf.
- **Tempo und Tonart der Originale:** fast überall UNBELEGT (nicht gesucht); der Abstand zum Original entsteht über eigene Melodien.
- **Nichts angehört, nichts gemessen:** Pegel (−18 LUFS), Bass-Hörbarkeit am Handy (M-HANDYrel), Blindvergleiche und das menschliche Gegenhören gegen die Originale (V10d-05) stehen für alle Sounds aus.
- **Hörprobe fehlt (♫):** N10 Hohltropfen (**Tier 1!**), N20 Analogkeller-Lead (★), Werk Zweipol-Brass („Jump“, ★), N04, N06, N18, N22–N30, N47, N69/N70, N76, DK-03.
- **Rezept fehlt:** Alphaville-Quintenbass „Big in Japan“ (Roland System-100M, zwei Oszillatoren eine Quinte gegeneinander verstimmt – Gerät und Bauweise BELEGT, `r8` §1.12) → Tier-1-Kandidat. Mesh-Klavier (Trinity, `ebm` §2.9) → später.
- **Nicht nachbaubar ohne neuen Baustein:** Vocoder und Sprachchip (Kraftwerk, Telex, YMO, Kano, Kavinsky – erst mit Mikrofon P3); Gitarre (Asylum Party, Lebanon Hanover, Molchat Doma, Dance With the Dead, Kas Product); Sampler-Klänge (Fairlight-Chor, Orchester-Stab, Emulator; nur Annäherung, fremde Samples sind tabu).
- **Fehlende Bausteine der App:**

  | Baustein | betrifft (Auswahl) |
  |---|---|
  | Phaser, Flanger | J1, J2, NU1 (Tomita) |
  | Arpeggiator ZUFALL | D1 |
  | Ringmodulator (VK) | SZ-06, AO-03 (Cabaret Voltaire) |
  | Hochpass + Tiefpass in Reihe (MS-20) | EB-01, CR-01, DK-18 |
  | Poly-Mod / Osz.-FM `ofm` (VK) | EB-05 |
  | Bitcrusher `crush` (VK P1) | EB-02, CR-14 |
  | Verzerrer vor dem Filter | EB-15 |
  | Pitch-Hüllkurve im FM6 und FM-Hüllkurven-Reparatur (`r8/fm-diagnose.md`) | CR-24; DM3, AO-04, SH-2, SZ-04, SZ-14, SZ-18, SZ-21, SZ-37, MM1 |
  | Aftertouch / Ribbon | VG1 |
  | Additiv-Modus „48 Obertöne“ | VG-6 |
  | 3/4- und 6/8-Takt | OM1 |
  | Doppel-Spur-Eintrag (`layer`) | PS1, TF2 |
  | steigender Ton im Drum-Synth | FG1 |
  | Bandecho-Sättigung | CR-05 |
- **Popularität „> 1 Mio. Aufrufe“** ist nur für The Midnight und Molchat Doma geprüft (`ret` §3, `cr` §3.8).

### 5.3 Was wir von Xander noch brauchen (kurz)

1. **„Lause“ und „Ben V“:** Meinst du „Brother Louie“ (VIZE × Imanbek × Dieter Bohlen, 2020)? Und bei Tiga & Zyntherius: Original von 2001 oder ein Slap-House-Mix?
2. **„Zviad Bekauri – Me Am Ghame“:** Ist es „Am Ghames“? Original oder Remix?
3. **„SexyBack“-Elektro-Version:** Interpret oder Link?
4. **„keit … Polylog“:** Was oder wen meintest du (Covenant?)?
5. **Kawai K1 bei The Frozen Autumn:** Woher stammt die Info? Passt „Elka Synthex“ (dein „LK sind“?)?
6. **And One:** Bei welcher Minute in „Ghama Voodoo“ ist der Signal-Bass, und welche Lesart passt (Morse, „Piu“, metallisch, knurrend)? Typischer And-One-Bass: Körperbass oder Doppelsägen-Oktavbass?
7. **Vogue:** Ist der Bass in „Vom Himmel hoch“ ein E-Bass oder ein Synth-Bass? Hast du ein Foto der Credits?
8. Niedrige Priorität: „proWIN“, „Eindhoven“, „Andy Pop/Antipop“ – was war gemeint? Joy Division als Vorbild-Tag: ja oder nein?

**Nicht mehr nötig:** „die Music“ (= Digital Musician), „Radio Station“ (gefunden), „Ego noise“, „Division“, „Second TK“, „Sixt JUNE“.

---

## 6. Quellen

**Neu in diesem Lauf (17.10.2026; nur Suchauszüge bzw. Spotify-Katalog, keine Seite direkt abgerufen):**
- OMD und Kraftwerk: https://www.getintothis.co.uk/2013/05/omd_were_still_trying_to_be_th/ · https://www.westword.com/music/andy-mcclusky-of-omd-on-dazzle-ships-the-influence-of-70s-krautrock-and-peter-saville-5675743/
- Gary Numan und Ultravox: https://stage1.thequietus.com/?p=673 · https://www.electricityclub.co.uk/?p=142308 · https://wikipedia.com/wiki/Quiet_Men · https://drownedinsound.com/news/4137453
- Vince Clarke: https://www.soundonsound.com/people/vince-clarke-electronic-music-pioneer · https://musicradar.com/news/vince-clarke-im-not-a-good-enough-keyboard-player-to-write-on-the-synth
- EBM, DAF, Front 242: https://en.wikipedia.org/wiki/No_Comment_(Front_242_album) · https://en.wikipedia.org/wiki/Electronic_body_music · https://en.wikipedia.org/wiki/Front_242 · https://postpunkmonk.com/2012/08/27/ndw-week-montag-d-a-f-der-mussolini · https://lisathatcher.com.au/2012/03/05/alles-ist-gut-daf-give-us-sound-sex/
- Industrial: https://www.sputnikmusic.com/band/Skinny+Puppy · https://side-line.com/?p=21905 · https://en.wikipedia.org/wiki/Electro-industrial · https://www.udiscovermusic.com/stories/beginners-guide-to-industrial-music/
- Human League, Heaven 17: https://last.fm/music/The+Human+League/+wiki · https://tramlines.org.uk/lineup/human-league/ · https://www.musicradar.com/news/heaven-17s-martyn-ware-kraftwerk-were-only-brilliant-because-they-were-rich
- Cold Wave, Minimal Wave: https://en.wikipedia.org/wiki/Cold_wave_(music) · https://en.wikipedia.org/wiki/New_musick · https://faroutmagazine.co.uk/what-is-coldwave-music/ · https://thevinylfactory.com/features/reissued-on-vinyl-an-introduction-to-belgian-cold-wave/ · https://minimal-wave.org/artists/artist/veronica-vasicka · https://wesleydoylewrites.substack.com/p/i-sensed-a-profound-need-to-preserve · https://ra.co/podcast/663 · https://www.treblezine.com/?p=2698 · https://interviewmagazine.com/music/minimal-wave-veronica-vasicka
- Synthwave: https://en.wikipedia.org/wiki/Synthwave
- Italo Disco: https://en.wikipedia.org/wiki/Italo_disco · https://www.masterclass.com/articles/italo-disco-guide · https://beatcaffeine.com/from-here-to-eternity-giorgio-moroders-classic-1977-italo-disco-album/
- Camouflage: https://forcedexposure.com:443/Artists/CAMOUFLAGE.html · https://rave-and-roll.com/tag/camouflage/
- Gary Numan und Nine Inch Nails: https://faroutmagazine.co.uk/nine-inch-nails-gary-numan-perform-cars/ · https://www.nin.wiki/Gary_Numan · https://electronicbeats.net/mr-style-icon-gary-numan-on-trent-reznor
- Diktat-Namen (Spotify-Katalog): Static Movement „Radio Station“ https://open.spotify.com/track/6PJEaZPToWHo0cVtPQF8wC (Album https://open.spotify.com/album/2kuZMTE4mzGvXrCE8xbPd1) · Zviad Bekauri „Am Ghames“ https://open.spotify.com/track/35W5zKGdb4d7Fgv5r374EM (Künstler https://open.spotify.com/artist/7HnUUGtelIHw0GzEYaGI6o). Ohne Treffer: WebSearch „Zviad Bekauri … Me Am Ghame“, WebSearch und Spotify „SexyBack“ Slap House, WebSearch „Static Movement Radio Station“ (fand nur Band und Album).

**Alle übrigen Fakten** stehen mit Status und URL in den Quellen-Abschnitten der Einzeldateien (`pop` §15, `hel` §11, `pio` §8, `ach` §8, `szn` §10, `dark` §9/§10, `cw2` §7, `ebm` §8, `cr` §9, `ret` §11, `spz` §6 und `spezial-*` , `r8` §8, `r6` §10).

## 7. Dateien

- `r7/vorbild-katalog.md` – dieser Katalog.
- `r7/katalog-work/data.py` – kuratierte Katalog-Daten (eine Zeile je Sound, Tier-Regeln am Ende).
- `r7/katalog-work/gen.py` – erzeugt `master-table.md`, `tier1.md`, `tier23.md` und `katalog.json` (maschinenlesbar für Spec/Builder).
- `r7/katalog-work/tables.py` → `tables.json` – geparste Übersichtstabellen aller Vorbild-Dateien (Grundlage für Lage, Rolle, Engine).
- `r7/katalog-work/extract.py`, `belege.py` – Auszüge (ⓘ-Zeilen, Belegtabellen) für die Prüfung.
- `r7/katalog-work/head.md`, `mid.md`, `tail.md` – Textteile; `build.py` setzt die Datei zusammen.
- `r7/katalog-work/kontur.mjs`, `kontur-scan.mjs` → `kontur-report.txt` – Kontur-Prüfung der Hörproben (transponiert gleiche Takte), Aufruf `node kontur-scan.mjs ../vorbild-*.md`.

## 8. Review-Prüfung r7: übernommen, geändert, abgelehnt

Jeder Befund wurde vor dem Einbau selbst nachgesucht (WebSearch-Auszüge; WebFetch scheitert hier an DNS, z. B. elgarajedefrank.es).

**Übernommen (mit Nachprüfung):**
- **YMO Prophet-5** (`pio` §3.2, YM2-ⓘ): „erst ab 1981“ war falsch. Reverb ordnet einen Prophet-5 Sakamotos Bühnenaufbau 1979 (Greek Theatre) zu; RBMA: „BGM“ zum Großteil auf dem Prophet-5. **Abweichung vom Befund:** Akiko Yano mit Prophet-5 1979 ließ sich **nicht** bestätigen (Soundhouse nennt bei ihr den Oberheim 8-Voice) → UNBELEGT; analogplanet (Welttournee 1980) nicht selbst gesehen. Die BGM-Zeile bleibt BELEGT (Wikipedia + RBMA), nur „ersetzte den Moog III-C“ ist WAHRSCHEINLICH.
- **Suicide Commando / Apoptygma** (`ebm` §2.5, §3.3): Nachsuche ohne Treffer bestätigt → beide WAHRSCHEINLICH, aus ⓘ heraus (EB-06-ⓘ ohne Modell), Apop „von Anfang an“ gestrichen.
- **Japan „Ghosts“** (`pio` §3.7): Zeile geteilt; System 700 als Eröffnungsklang WAHRSCHEINLICH (Nachsuche: nur „System 700 seit 1978 im Besitz“), JP1-ⓘ „modularer Effektklang“ ohne Gerät. Rolling Stone (Jansen-Marimba) nicht selbst gesehen, daher nicht als Quelle eingetragen; die Marimba-Zeile war schon BELEGT.
- **Molchat Doma / Michael Oakley** (`cr` §3.8, §4.5): American Songwriter bestätigt („DX7, Minimoog, Juno-106, Lel 0041“); die MusicRadar-Restliste und Oakleys Ensoniq/SY85 ließen sich nicht reproduzieren → WAHRSCHEINLICH; CR-16- und CR-25-ⓘ ohne Modellnamen.
- **Visage „Fade to Grey“** (`pio` §3.5): Zitat „the drum break on Fade to Grey is all Fairlight“ gefunden (E&MM „Behind Visage“, Aug. 1984). **Abweichung vom Befund:** Sprecher laut Muzines-Übersicht wohl **Rusty Egan**, nicht Midge Ure. „komplett“ gestrichen, Widerspruch in §4.7.
- **Hörproben-Prüfer:** neuer Kontur-Vergleich `r7/katalog-work/kontur.mjs` (Intervallfolge relativ zum ersten Ton + Rhythmus; Treffer ab 2 gleichen Takten; Richtungsfolge ab 3 gleichen Takten als Hinweis), eingebaut in `achtziger-work/tail.mjs` und `cold-retro-work/tail.mjs`, dazu `kontur-scan.mjs` für alle Dateien. **RL1** umgebaut (T2 abwärts, T3 Umkehrung mit Lücke auf Schritt 8), **CR-22** umgebaut (T2 Terz-Sekund-Wechsel, T3 Schluss F♯–E–C♯ zum H); beide jetzt ohne Treffer und ohne Hinweis. Hinweis: Der reine Intervall-Vergleich hätte CR-22 und RL1 T1↔T2 (Moll/Dur) **nicht** erkannt; dafür ist die Richtungsfolge da.
- **Tier 1** (§3): Rolle Akkord/Stab ergänzt, EB-03 und ach·SC1 nach Tier 1, ach·PS1/PS2 nach Tier 2; Zählung jetzt 43 / 90 / 194, 114 neue Sounds.

**Abgelehnt:**
- **Soft Cell „für 20 £ gekauft“ streichen** (`ach` §2.1): abgelehnt. Der Preis steht als Ball-Zitat („bought off a friend of my college tutor for 20 quid … That was our bass sound for many, many years“) im MusicRadar-„Classic interview“ (Nachdruck inkl.com, deutsch bei bonedo – bonedo ist bereits die Quelle der Zeile). Die Zeile bleibt BELEGT; nur der Quellenhinweis wurde präzisiert (Preis = **ein** Interview, SB-100 als Bass-Sound = 2 Quellen).

**Offen aus der Kontur-Prüfung** (nicht Teil der Befunde, nicht geändert; `r7/katalog-work/kontur-report.txt`): transponiert gleiche Takte noch in `ach` EU1, PS1, H1, TD1, IM1 · `cr` CR-04, CR-18 · `ebm` EB-01, EB-12 · `hel` K1 · `pio` SU1 · `pop` N03-Probe, ER1 · `ret` TC1, GS2, LH2 · `szn` SZ-32. Bei Ostinato-Bässen (EB-01, EB-12, IM1) ist das teils Absicht (Sequenz-Kette); vor dem Einbau einzeln anhören und entscheiden.
