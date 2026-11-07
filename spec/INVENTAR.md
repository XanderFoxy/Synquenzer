# SYNQUENZER 4.47.0 – Funktions-Inventar und Doppel-Prüfung

Stand 07.11.2026. Nur gelesen, nichts an der App geändert.
Quellen: `linie/index.html` (4.47.0), `CHANGES-V3.md` (4.47 bis 4.30.1, ältere Stände über die Überschriften),
`v3-ideen/xander-liste-0711.md`, dazu die Bau-Stände `mx2tmp/mx2-block.js`, `ui1lab/ui1-block.js`, `vd3lab/vd3-block.js`.
Alles im Code nachgesehen; in Klammern steht der Funktionsname, an dem man es findet.

Zeichen: **(V)** = würde sichtbar anders → nur Vorschlag, Xander entscheidet. „Weg“ = so tippt man sich hin.

---

## 1. Alle Bedien-Funktionen nach Bereich

### 1A Matrix (Clips, Szenen, Spuren, Teile, Transport)

| Name in der App | Weg | seit |
|---|---|---|
| Szene starten ▶ 1–8 | Szenen-Kopf antippen | v2 (8 Szenen: 4.0.0) |
| Clip starten / stoppen | Clip antippen (laufend = stoppt am Takt) | v2 |
| Clip-Blatt | Clip lange drücken | v2 |
| Spur wählen | Spurname antippen | 4.39 (wieder) |
| Stumm [M] / Solo | [M] antippen / Spurname halten (gelbes S) | 4.35 |
| Lautstärke je Spur | Spurname waagrecht wischen, Doppeltipp = 0 dB | 4.35 |
| Spur-Blatt (＋ Spur, ＋ STIMME-Spur, Effekte, Mit GarageBand aufnehmen, Spur entfernen, Klang öffnen) | ■ der Zeile halten (`openTrackSheet`) | 4.35 (Weg) |
| Spuren umsortieren | Farbbalken am linken Rand nach rechts ziehen | 4.46 |
| Clip verschieben / tauschen / kopieren | Clip halten bis er wächst → ziehen (2. Finger = Kopie) | 4.46 |
| Szenen umsortieren | oberen Rand des Szenen-Kopfs ziehen | 4.46 |
| Teil-Leiste TEILE: ＋ (merkt, was gerade klingt), Tipp = Teil starten, Halten = Teil-Blatt | Leiste unter den Clips (quer: Seitenfeld) | 4.3.0 |
| Teil-Blatt: Name, Farbe, Spuren, ▦ In der Matrix wählen, Kopie | Teil halten · oder Marken-Blatt › Teil-Vorlage › (`openPartSheet`) | 4.3.0 |
| FANG ⤓ (Clip aus Gespieltem) · FANG TEIL · FANG 🎤 (Gesang) | Taste FANG (Beschriftung wechselt) | v2 · 4.5.0 · 4.5.1 |
| FANG im laufenden Songteil → Blatt „Teil überarbeitet“ (Intro … Outro, ✎ frei, ＋ Strophe 2 / ⟳ ersetzen) | FANG während ▶ SONG (`s1Fang`) | 4.24 / Namen 4.46 |
| TRANSPONIEREN · LATCH · ORIGINAL · Träger-Anzeige | Kopfleiste / Tastatur | v2 |
| Akkord-Zeile (Stufe, Zuletzt, Frei, ÷2, ♪ greifen) | Tipp auf die Träger-Anzeige | 4.3.0 |
| Taktart des Songs | BPM antippen | 4.32 |
| ● REC · ▶ / ■ (■ = alle Spuren „kein Clip“) | Kopfleiste | v2 / 4.39 |
| Master-Pegel-Balken → MASTER-Seite | kleiner Balken in der Matrix-Ecke (`mtrMasterBtn` → `openMasterPage`) | 4.29 |
| SONG ⇄ / CLIPS ⇄ | Ecke oben links | 3.11.1 |
| ↶ / ↷ · ↶ halten = Blatt VERLAUF (Schritte + ＋ Schnappschuss) | überall (`sx14Open`) | v2 · 4.37 |

### 1B Song-Ansicht

| Name in der App | Weg | seit |
|---|---|---|
| ● SONG (Start-Blatt: CLIPS / AKKORDE / NOTEN ▾, Überschreiben / Einfügen / Ersetzen / Overdub, ab Takt n) | Song-Leiste ● (halten = Blatt) | 3.11.1 · 4.6.0 |
| ▶ SONG · ⏮ · ↩ SONG | Song-Leiste | 3.11.1 |
| SCHLEIFE ▾ (aus · Song · Teil · Bereich) + „Mithören beim Wischen“ (hochkant) | Song-Leiste (`openLoopPop`, `ux1LoopRow`) | 3.11.1 · 4.46 |
| Lautsprecher = Scrubbing | quer: Song-Leiste; hochkant: SCHLEIFE ▾ (`sx7Toggle`) | 4.37 / 4.46 |
| ◆ ÜBERGÄNGE (Bibliothek, auf Teilkante ziehen, frei setzen, Fill-Chip: Länge, Ersetzen │ Mischen, Noten …) | Song-Leiste; schmal: runder ◆ unten rechts (`ueBar`) | 4.36 · 4.45 |
| ▦ Kästchen / ◧ Glas | Song-Leiste | 4.8.0 |
| ▲▼ 1/2 Spurbank | Song-Leiste | 4.7.0 |
| Zoom (2 Finger), Mini-Karte | Song-Raster | 4.35 |
| Takt wählen / Bereich wählen, ▼ setzen | Taktnummer antippen | 4.7.0 |
| Teil in den Song ziehen | Teil-Taste halten, auf SONG ⇄ ziehen | 4.8.0 |
| Leerer Song: Kette aus Szenen … · ＋ Teil einsetzen ▾ · Aus Vorlage … | Hinweis im leeren Song | 3.11.1 · 4.7 · 4.33 |
| AKKORDE-Etikett: Akkorde quantisieren, löschen; Akkord antippen = ändern | linke Spalte | 4.7.0 |
| MELODIE-Etikett: bearbeiten, leeren | linke Spalte | 4.2.0 |
| Zell-Blatt: Versionen v1 · v2 · ＋, [Überall v2], „v2 ist: Small │ Full“, Im Video (eigener Clip), Kurven löschen | Zelle im Song halten | 4.35 · 4.45 · 4.46 · 4.36 |
| Block-Zeile: Block antippen = Blatt, zweimal = hineingehen | über der Taktleiste | 4.28 |
| **Marken-Blatt** (Teilname antippen): ▶ Ab hier · ×2 · ×4 · ◀ ▶ tauschen · ⧉ Kopie … · ⇄ Ersetzen durch ▾ · ✕ Löschen · Nur Name weg · ✎ Name · Farbe · Teil-Vorlage › · Auf alle übertragen · ● Neu aufnehmen … · Taktart ▾ | Song › Teilname antippen (`openMarkSheet`) | 4.7.0 · Taktart 4.32 |
| … im Marken-Blatt weiter: Zeile **Video** (Auto, App, Song, Matrix, Spur …, Tastatur, Fokus …, Klavier, Mäusekino) | dto. (`vvDirRow`) | 4.26 |
| … **Bearbeiten** (Spuren an/aus nur hier) · **Zusammenfassen** | dto. (`s012MarkSheetPaint`) | 4.24 · zurück 4.40.2 |
| … **Zu Teil / Block …** · **Zurückholen …** · **Bei Takt …** (Klinge) | dto. (`konMarkSheetPaint`, `sx126MarkSheetPaint`) | 4.37 · 4.28 · 4.33 |
| … **Gleiten** (Clip, aus, kurz, 1 T, 2 T, frei) | dto. (`v6aMarkSheetPaint`) | 4.36 |
| … **Fassung: Leicht · Voll · ⧉ Variante · Einfügen** | dto. (`sx11MarkSheetPaint`) | 4.32 |
| … **Ausblenden am Ende** 2/4/8 (nur letzter Teil) | dto. (`sx1RowHtml`) | 4.33 |
| … **Rhythmus: Small · Full · Vorschlag · Remix …** | dto. (`gr1MarkSheetPaint`) | 4.45 |
| **Bereich-Leiste** (gelbe Takte): ▶ Ab hier · ● Aufnehmen … · ❖ Als Teil … · ⧉ Kopie → · ✕ Takte löschen · ⋯ | statt Träger-Leiste, sobald Takte gelb sind | 4.7.0 |
| … ⋯: ○ Leeren · ＋ Teil einsetzen ▾ · Akkorde quantisieren … · ⟲ Als Schleife · Zusammenfassen · Zu Teil / Block … · Zeile Video | dto. (Zeile 40807 ff.) | 4.7 · 4.24 · 4.37 · 4.26 |
| Song-Blatt „Transponieren …“ und „Remix …“ | nur ≡ › Projekt › Song (`gr1MenuRow`) | 4.45 |

### 1C Clip-Blatt (Clip lange drücken)

| Name in der App | seit |
|---|---|
| Tonart-Chip (Auto / Fest … / Aufnahme), [= Szenen-Tonart] | v2/3.x |
| ✎ Bearbeiten · Quantisieren … (bei STIMME: öffnet den Marken-Editor) | v2 · 4.20 |
| Kopieren · Einfügen · Duplizieren → frei | v2 |
| Kurven löschen (Bend · Rad · Druck; nur wenn vorhanden) | 4.36 |
| Taktart ▾ (Clip umrechnen) | 4.32 |
| ■ Stopp (nur wenn er läuft) · Löschen (zweimal) | v2 |
| ◆ Klang (Klangzustand, Gleiten) | 4.36 |
| Grundmuster ▾ (Stil-Muster für Drum- oder Bass-Clip, ersetzt) | 4.45 |
| Small │ Full (nur Drum-Clips: markieren) | 4.45 |
| Im Video · Auto │ Gerät │ Klavier │ Mäusekino │ Noten │ aus | 4.46 |
| Werkzeugkasten ▾ | 4.47 |
| Länge ½ · −1 · +1 · ×2 · ↶ · ↷ | v2 (×2 bis 64: 4.25) |
| Fenster „Takt 1–2 von 4“ ◀ ▶ (nur bei konsolidierten Clips) | 4.45 |
| Leerer Platz halten (mit Ablage): ✎ Neuer Clip · Einfügen | v2 |

### 1D Noten-Editor: ROLLE, LAUF, Magic, Pinsel, Harmonie

| Name in der App | Weg | seit |
|---|---|---|
| ✎ Zeichnen · ⬚ Auswahl · ⇕ Anschlag · ⌫ Radieren | Werkzeugleiste | v2 · ⇕ 4.38 |
| Pinsel (schmal/mittel/breit, 90 ms) · Magic · Mithören (welche Spuren beim Bearbeiten mitspielen) | Werkzeugleiste, Gruppe | 4.28 · fein 4.37 |
| Raster 1/16 · ♪ Notenlänge · Tonart (nur Leiter-Töne zeigen) · Schritt · ⤢ · LAUF │ ROLLE · ⌨ (quer) | Werkzeugleiste | v2 |
| Pause · Bindung · ⌫ Schritt (Schritt-Eingabe) | Aktionsleiste | v2 |
| Zuschneiden · ▲ Stufe · ▼ Stufe · +12 · −12 | Aktionsleiste | v2 |
| Spiegeln (+ Achse: Mitte / 1. Note) · Umdrehen · Tauschen (Hälften) | Aktionsleiste | 4.24 · zusammengelegt 4.33 |
| Teilen · Verbinden | Aktionsleiste (nur mit Auswahl) | 4.5.1 |
| Dupl. · Kopieren · Einfügen (mit Lupe) | Aktionsleiste | v2 · 4.46 |
| Spielweise (Gitarre ab / ab-auf / Folk / Riff, Glissando, Harfe, Glocken, Mandoline, Alberti, Pizzicato) | Aktionsleiste (`lf1SwPop`) | 4.45 |
| Werkzeugkasten (39 Figuren, Ziel: Neue Version / Neuer Clip / Diesen Clip, [mit Klang]) | Aktionsleiste hinter Spielweise (`bb1Open`) | 4.47 |
| Harmonie: Glätten · Lauf (Doppeln, Fortsetzen ▲▼, Takte −/+) · Gegenstimme · Akkorde (Vorschläge) | ganz rechts (`hm1Open`) | 4.45 |
| Magic-Zeile: Wischen · Pause · Pause + · Akkorde · Leiter / Terzen / Terz+Quinte · Auto · Umk. ▲▼ · Glatt | [Magic] | 4.28 |
| Clip-Länge am Griff ┃, Taktnummern → Zuschneiden | Lineal | v2 |
| LAUF: Schritt an/aus, hoch/runter = Ton, lang drücken = Wirbel, Transponieren, Chance, Slide, Akzent, Start; Richtung; Schrittlänge; Skala ▾; Zufall in Tonart; Leeren | [LAUF] | v2 · 4.45 |
| Skalen-Sperre beim Spielen: frei / Skala / Akkord | SPIELEN ½ s halten (= Menü › Harmonie › Tastatur beim Spielen) | 4.45 |

### 1E Synth-Editor und Platten

| Name in der App | Weg | seit |
|---|---|---|
| Klangerzeugung VA · FM · WT · MS 2000 · Bit Mask (schmal: Chip ▾) | Synth-Kopf | v2 · FM6 3.8 · MS 2000 4.9 · Bit Mask 4.36 |
| Reiter OSZ/FM/WT · FILTER (REGLER, XY) · HÜLLK. · LFO · MOD · FX | Synth-Editor | v2 |
| FM: FELD · DX · OP · MAKRO · STIMME; DX-tauglich, .syx | Reiter FM | 3.8–3.11 |
| Mal-LFO (6. Form-Feld ✎) | LFO | 4.32 |
| Modulieren (Regler halten), Punkt = Summe aller Quellen, Mod-Übersicht | Regler / Reiter MOD | v2 · 4.25 · 4.42 |
| Mod-Rad (Regler, „Makro je Klang“) | Synth-Editor | 4.44 (als Makro) |
| ◆ Klanganker: Regler gehen automatisch in den laufenden Clip; Tipp auf ◆ = Grundklang | orange ◆ im Synth-Kopf | 4.36 · auto 4.42 |
| Regler drehen beim Clip-Wechsel mit | sichtbar im offenen Editor | 4.40 |
| Bibliothek (Sound-Name antippen; Kategorien u. a. „Synthie-Pop FX“, „Werkzeugkasten“) · ⋯ → Init · 🎲 · Sichern | Synth-Kopf | v2 · 4.44 · 4.47 |
| MS 2000-Platte: ARP, MOD SEQUENCE, Vocoder, Programme A01–H16, Sammlung Micro | Klangerzeugung MS 2000 | 4.9–4.23 |
| Bit Mask GERÄT: Bend-/Mod-Rad, Arp, Kurven aufnehmen | Klangerzeugung Bit Mask | 4.36 |
| Super-Regler | **keine Taste** – nur Kern + Neigen-Sensor + Test-API (`srHand`, `NEIGEN`) | Kern 4.32 |
| Locks (Reglerwerte je Note) | **keine Taste** – nur Kern | Kern 4.38 |

### 1F Drums / North

| Name in der App | Weg | seit |
|---|---|---|
| 12 Pads (oben laut, unten leise) | Matrix-Tastatur bei DRUMS | v2 |
| Drum-Editor: SOUND · TIEF · SCHRITTE (Euklid, Muster ▾) · KIT („Pad wählt Instrument“) | DRUMS › KLANG | v2/3.x |
| Muster ▾ › Stil-Grundmuster › | Drum-Editor | 4.45 |
| Länge je Spur, Richtung | SCHRITTE | 4.24 |
| Anschlag ⇕ in der Schritt-Ansicht | SCHRITTE | 4.38 |
| Kanal ⋯: Kopieren · Einfügen (in alle) · Tauschen mit … | Drum-Editor | 3.x |
| Schalter Drums │ North | Drum-Editor-Kopf | 4.33 / 4.38 |
| North-Platte | Kopf-Taste „Platte“ · SOUND-Blatt „North / Platte“ · Seite NORTH „Platte“ | 4.38 · 4.40 |
| Perkussionsspur (North auf Synth-Spur, folgt nicht) | Synth-Spur ⋯ → „North – Perkussionsspur“ **oder** Klangerzeugung → North | 4.34 |
| ALLE KANÄLE | Seite NORTH | 4.30 |

### 1G Gesang / Chor

| Name in der App | Weg | seit |
|---|---|---|
| 🎤 Mikro-Blatt: Quelle, Oktave sperren, Einrasten, Melodieerkennung An/Aus, Durchgänge als Takes | 🎤 | 4.5.1 · 4.25 · 4.31 |
| Stimme-FANG · ● REC → MELODIE | FANG 🎤 / ● | 4.5.1 |
| STIMME-Spur | Spur-Blatt › ＋ STIMME-Spur | 4.18 |
| Takes-Blatt: Liste, Mini-Welle, ★, Farben, ▶ Vorhören, Andere löschen, Aufräumen, A/B, WAV | STIMME-Clip antippen | 4.18 · 4.31 |
| In Melodie umwandeln | Takes-Blatt | 4.25 |
| ♪ Tonhöhe · Noten (Natürlich ↔ Hart, Tonart-Chip) | Takes-Blatt | 4.25 · 4.33 · 4.45 |
| Chor (Stil, ＋ Stimme, Selbst singen, Als Chor-Stimme duplizieren) | Takes-Blatt › Chor | 4.25 · 4.27 · 4.30.1 |
| Chor-Zeilen BACKGROUND + je Stimme; Mischpult (Lead, Background, Gesang gesamt, Gekoppelt) | Matrix/Song unter STIMME; Regler-Symbol | 4.34 |
| [M] an STIMME = nur Lead stumm | Spurkopf | 4.45 |
| Marken-/Wellen-Editor: Marken, Audio quantisieren, Dehnen, [Text], Warp-Zoom, Wort löschen → Rest rückt | Clip-Blatt › „Quantisieren …“ | 4.20 · 4.21 · 4.34 · 4.45 |
| Säubern (Regler je Take, A/B Roh │ Sauber) | Takes-Blatt | 4.19 |
| Gesangs-Effekte (Gesang Synthpop, [Auto]) | Spur-Blatt › Effekte | 4.25 |
| Mit GarageBand aufnehmen | Spur-Blatt / Takes-Blatt | 4.27.1 |
| Songtext erkennen, Mitlese-Zeile | Marken-Editor / Song | 4.27 · 4.27.2 |
| Vorlage beim Nachsingen | ● halten → Zeile „Vorlage“ | 4.37 |
| Einsingen: Pegel, Vorlauf, „Clip +1 Takt?“ | beim Aufnehmen | 4.36 |
| Klick beim Singen | ≡ › Aufnahme und ●-Halten-Blatt | 4.25.1 |
| Mikro-Check | ≡ › Info | 3.11.4 |

### 1H Mix / Master / FX

| Name in der App | Weg | seit |
|---|---|---|
| FX › SPUR (Lautstärke, Pan …) · **EQ · KOMP** | Klang-Editor einer Spur › FX › SPUR (`mx1EqBtn`) | v2 · 4.44 |
| FX › CHORUS · HALL · ECHO (Hall/Echo/Master = für alle Spuren) | Klang-Editor › FX | v2 |
| FX › MASTER: Schwelle, Ratio, Attack, Release, Make-up, Drive, Lautstärke, Pump-Quelle, GR-Anzeige | Klang-Editor › FX › MASTER (`pageFxMaster`) | v2 |
| **AUTO-MASTER** (Ziel −14/−9 LUFS, [Messen] [Übernehmen], Stil + [MASTERN], Vorher/Nachher, Aus) | FX › MASTER (`mixaBtns` → `amSheet`) | 4.34 · Stil/MASTERN 4.44 |
| **MIX-ASSISTENT** (Rolle, Spektrum, Vorschläge, Alle übernehmen, Vorher/Nachher) | FX › MASTER (`mixaSheet`) | 4.34 · 4.44 |
| Master-Ausgang | ≡ › Klang **und** FX › MASTER › Lautstärke (gleicher Wert `fxBus.master.vol`) | v2 |
| Qualität · Puffer · Alle Töne aus | ≡ › Klang | v2/3.x |

### 1I Video

| Name in der App | Weg | seit |
|---|---|---|
| Video-Blatt: Format 9:16 / 16:9 · Bild Auto / Song / Matrix + [Regeln] · 9:16 Kamera / Balken / Ganze App · Bereich · Abspann-Logo · Ausblenden · ▶ Vorschau · Video erstellen · Teilen / Sichern | ≡ › Video **oder** ≡ › Export › Video 9:16 / 16:9 (`vvOpen`) | 4.26 · Logo 4.29 · Regeln 4.46 |
| Video mit Ton auf dem iPhone (.mov) | automatisch | 4.45 |
| Regie je Teil | Marken-Blatt › Zeile Video (`vvDirRow`) | 4.26 |
| Regie je Takt-Bereich | Bereich-Leiste › ⋯ › Zeile Video | 4.26 |
| Regie je Clip | Clip-Blatt › Im Video (`vr1ClipBtn`) | 4.46 |
| Regie je eigenem Clip | Zell-Blatt › Im Video (`vr1OwnOpt`) | 4.46 |
| Ansichten Klavier · Mäusekino · Gerät · Matrix wie App | in den Regie-Listen | 4.41 · 4.46 · 4.43 |
| Regie-Streifen | in der Taktleiste (nur mit Einträgen) | 4.26 |

### 1J Menü ≡, Export, Projekt

| Name in der App | Weg | seit |
|---|---|---|
| Versionsnummer (3× sichtbar: ganz oben, im Titel, unter Info) | ≡ | 4.32 |
| Projekt: Name, Speicher-Status, Neu ▾ (Mit Startsounds │ Leer Init), Demo laden | ≡ › Projekt | v2 · 3.2 |
| Als Datei sichern (.json) · Datei öffnen | ≡ › Projekt (`saveFile`) | v2 |
| ＋ Spur · Spur entfernen | ≡ › Projekt **und** Spur-Blatt | 4.0 |
| Projekte ▾ · Ältere Versionen ▾ (automatische Sicherungen) | ≡ › Projekt (`menuHistRefresh`) | v2 · 3.2 |
| Verlauf An/Aus · Projektdatei mit/ohne Verlauf · Verlauf löschen (Gesten-Rekorder) | ≡ › Projekt (`histMenu`) | 4.26 |
| Song als Audio (Echtzeit-Mitschnitt) | ≡ › Projekt (`songAudioStart`) | v2 |
| Video · Export | ≡ › Projekt (eine Zeile) | 4.26 · 4.45 |
| Song: Remix … · Transponieren … | ≡ › Projekt | 4.45 |
| Online (Server, Mitmach-Link, Versionen, Abzweigen) | ≡ › Online | 3.11.2 · 3.11.3 |
| Sounds: Alle eigenen Sounds exportieren · Sounds importieren · DX7-Bank importieren / exportieren | ≡ › Sounds | v2 · 3.11 |
| MIDI-Export: Szene / Alle Szenen / Mitschnitt / Song, mit Träger / Original | ≡ › MIDI-Export (`exportMidi`) | v2 |
| Harmonie: Projekt-Tonart, Modus, Einzelton, Moll-Akkorde, Wechsel, Oktave, Split, Tastatur beim Spielen, Eine Skala (+ Stärke, Durchgangstöne, Skala nach, Spuren), Drums, ? So funktioniert's | ≡ › Harmonie | v2 · 4.5.3 · 4.37 · 4.45 |
| Aufnahme: Länge, Quantisieren, Einzähler, Metronom, Klick beim Singen, Swing, Metronom-Lautstärke | ≡ › Aufnahme | v2 |
| Bedienung: Haptik, Notennamen, Tastatur-Anschlag | ≡ › Bedienung | v2 · 3.2 |
| MIDI-Eingang · Hilfe · Info (Mikro-Check, Leistungs-Probe) | ≡ | v2 · 3.11.4 · 4.9 |
| **Export-Blatt:** WAV Ganzer Song · Einzelspuren · Nur Gesang · Nur Chor · MIDI Ganzer Song · MIDI importieren · Eine Spur als MIDI · Video 9:16 · Video 16:9 · Container sichern · Container öffnen | ≡ › Export (`va1Sheet`) | 4.45 |
| Take als WAV · gehörte Fassung als WAV · Takes als ZIP (bei vollem Speicher) | Takes-Blatt · Marken-Editor · Hinweis | 4.18 · 4.25 · 4.31 |

### 1K Gerade im Bau (noch nicht in der App, eingeplant)

| Paket | Geplanter Weg | Überschneidet sich mit |
|---|---|---|
| MX2 | Kopfleiste **[MIX]** und ≡ › Projekt › **Mix & Master …** → Blatt mit [Mischen] [Mastern] [Mischen + Mastern], Transparenz ↔ Druck, Wärme ↔ Glanz, A/B, Seitenkette Kick → Bass, Feinschliff je Rolle, Kanalzug | AUTO-MASTER, MIX-ASSISTENT, EQ · KOMP, Master-Balken, ≡ › Klang |
| GR2 | mehr Genres, Remix übersetzt eigene Noten (Stärke), **REMIX** in der Song-Leiste, Genre-Fills (UE + Werkzeugkasten) | Remix (≡ / Marken-Blatt), Grundmuster, Werkzeugkasten, Zwingen-%, Quantisieren, ◆ ÜBERGÄNGE |
| UI1 | ≡ › **Wo finde ich …?**, VA │ FM │ WT │ ▾ nebeneinander, Übergänge vollständig **+ Drums-Füller des Werkzeugkastens als Kacheln**, Bit Mask KLÄNGE + ?, Spuren-Gruppe (halten + antippen), Leucht-Look (≡ › Bedienung) | Werkzeugkasten-Drums-Füller, GR2-Fills, Spurkopf-Gesten |
| VD3 | 9:16 Ganze App als Standard, Titel, Untertitel-Rand; **Schnitt-Modus** (SCHLEIFE ▾ → Video-Schnitt oder Video-Blatt [Schnitt im Song]); **Making-of** mit eigenem Protokoll | Regie-Zeilen (Marken-Blatt, Bereich, Clip), Verlauf-Rekorder |

---

## 2. Überschneidungen und Doppel – je Gruppe mit Vorschlag (Punkt 2 und 3)

### D1 „Aus Takten einen Teil machen“ – sechs Wege, drei verschiedene Ergebnisse
- **Wege:** Teil-Leiste ＋ (merkt, was jetzt klingt) · FANG TEIL · Bereich-Leiste **❖ Als Teil …** · Bereich ⋯ **Zusammenfassen** und Marken-Blatt **Zusammenfassen** · Bereich ⋯ / Marken-Blatt **Zu Teil / Block … → Zu einem Teil machen** · FANG im laufenden Teil → „Teil überarbeitet“.
- **Code:** In der Bereich-Leiste stehen drei davon gleichzeitig (Zeile 40759 `❖ Als Teil …`, Zeile 40810 `s2RangeItem()` + `konuxRangeItem()`), im Marken-Blatt zwei (`s2SumButton` + `konMarkSheetPaint`).
  `❖ Als Teil …` → `rangeAsPart` → `templateFrom`: nimmt **keine eigenen Clips, keine Song-Melodie, keinen Gesang** in die Vorlage.
  `Zusammenfassen` → `s2Sum` → `s2Template`: nimmt all das mit.
  `Zu einem Teil machen` → `konDo` = `s2Template` + Ursprung (`song.kons`, [Zurückholen]) + erweiterte Clips (KL1).
  Gleiche Takte, gleicher Name, aber drei verschieden volle Teile – setzt man den Teil später woanders ein, fehlen bei „Als Teil“ Melodie und Gesang.
- **Vorschlag (V):** Ein Knopf **„Zusammenfassen …“** (Xanders Wort, er wollte es am 01.11. zurück) mit den Namens-Chips sofort. Intern immer `konDo` (klingt gleich, [Zurückholen] geht immer). „Als Block gruppieren“ bleibt als eigener Knopf **▣ Block**. ❖ Als Teil … in der Bereich-Leiste wird genau dieser Knopf; das „Zu Teil / Block …“-Blatt bleibt nur für Block und Zurückholen.
  Ohne sichtbare Änderung schon jetzt möglich: `rangeAsPart` auf `s2Template` umstellen, damit „Als Teil“ nichts mehr verliert.
  Teil-Leiste ＋ und FANG TEIL bleiben (anderer Moment: live beim Spielen).

### D2 Leicht/Voll (4.32) ↔ Small/Full (4.45) ↔ „Bearbeiten“ (Spuren an/aus)
- **Wege:** Alles im Marken-Blatt untereinander: Zeile **Fassung** [Leicht] [Voll] [⧉ Variante] [Einfügen], Zeile **Rhythmus** [Small] [Full] [Vorschlag] [Remix …], dazu [Bearbeiten] (Spuren nur hier an/aus). Small/Full außerdem im Clip-Blatt und im Zell-Blatt.
- **Code:** Leicht schaltet Spuren über `s0SegApply` – dieselbe Funktion wie [Bearbeiten] – und dünnt Drums mit `sx11ThinNotes` aus. Der Small/Full-[Vorschlag] (`gr1Thin`) ruft **zuerst `sx11ThinNotes`** auf, dünnt also genauso aus wie Leicht. Gespeichert wird es aber zweimal anders: Leicht in der Marke (`mark.vr`, `mark.off`), Small/Full an Clip-Versionen (`clip.sf`, `sx9Set`).
- **Vorschlag (V):** Eine Zeile **„Small │ Full“** (Xanders Begriffe aus der Liste vom 07.11.). Small = der als Small markierte Drum-Clip; gibt es keinen, die automatische Ausdünnung von heute (Leicht), dazu wie heute die Spuren, die in Small aus sind. [⧉ Variante] [Einfügen] bleiben. [Bearbeiten] bleibt für Einzel-Schalter.

### D3 Mischen und Mastern: drei Blätter, zwei Knöpfe für dasselbe, bald ein viertes
- **Wege heute:** Klang-Editor einer Spur › FX › MASTER › [AUTO-MASTER] und [MIX-ASSISTENT] (`mixaBtns`); FX › SPUR › [EQ · KOMP] und dasselbe Blatt aus dem Mix-Assistenten (`mx1EqSheet`); der kleine Master-Pegel-Balken öffnet FX › MASTER (`openMasterPage`).
- **Im Auto-Master-Blatt zwei Wege für dasselbe:** [Messen] + [Übernehmen] (MIX-A, `amPaint`) und daneben Stil + [MASTERN] (MX1, `mx1AmTop`), das misst und übernimmt in einem.
- **Master-Lautstärke** zweimal: ≡ › Klang › Master-Ausgang und FX › MASTER › Lautstärke (beides `fxBus.master.vol`).
- **MX2 plant** zusätzlich [MIX] in der Kopfleiste und ≡ › Projekt › „Mix & Master …“ (`mx2MenuRow`), ein neues Blatt.
- **Vorschlag (V):** Das MX2-Blatt wird **das eine** Mix-&-Master-Blatt. [AUTO-MASTER] und [MIX-ASSISTENT] auf FX › MASTER öffnen dieses Blatt auf dem passenden Reiter (Mastern / Mischen), statt eigener Blätter. Der Master-Balken öffnet es auch. [Messen]/[Übernehmen] fallen weg, [MASTERN] bleibt. FX › MASTER behält nur die Handregler. Der Kanalzug ist das vorhandene EQ · KOMP-Blatt (kein drittes Spur-Blatt). Master-Ausgang im ≡-Menü: kann bleiben (gleicher Wert), sonst streichen.

### D4 Stil-Werkzeuge: Grundmuster, Remix, Werkzeugkasten, Spielweise (+ GR2)
- **Was:** Grundmuster ▾ ersetzt Drum-/Bass-Clip durch Stil-Muster (Clip-Blatt **und** Drum-Editor › Muster ▾ › Stil-Grundmuster ›, `gr1PatPop`). Remix … baut Drum + Bass des ganzen Songs/Teils als Versionen, Zwingen-% für den Rest (`gr1RemixDo`). Werkzeugkasten setzt 39 Figuren ein (`bb1Open`). Spielweise verwandelt vorhandene Akkorde (`lf1SwApply`). GR2: Remix übersetzt eigene Noten, Stärke-Regler.
- **Drei verschiedene Genre-Listen im Code:**
  Remix/Grundmuster (`GR1_STYLES`): New Jack Swing, Euro Disco, Detroit Pop, Frühes House, Funk House, Garage 2-Step, Synth-Pop.
  Werkzeugkasten (`BB1_GEN`): Disco-Pop, Eurodance, Synth-Pop, New Jack Swing, House, Detroit, Hi-NRG, Italo.
  Master-Stil (MX1 `STYLES`): Synth-Pop, Disco, House, Sanft. GR2 bringt eine vierte (Euro-Disco, Italo-Disco …).
- **Ergebnis landet jedes Mal woanders:** Grundmuster ersetzt den Clip; Werkzeugkasten fragt (Neue Version / Neuer Clip / Diesen Clip); Harmonie-Glätten macht einen neuen Clip in einer freien Szene; Remix macht Versionen; Spielweise ändert an Ort und Stelle.
- **Zwingen-%** (Remix) und GR2-**Stärke** und Clip-Blatt **Quantisieren … Stärke/Swing** tun fast dasselbe (Noten ins Raster + Swing).
- **Vorschlag:** (a) ohne Sichtbares: **eine** Genre-Liste (die GR2-Stil-Bibliothek) für Remix, Grundmuster, Werkzeugkasten, Fills und Master-Stil, überall dieselben Namen. (b) (V) Eine gemeinsame Zeile **„Ziel: Neue Version · Neuer Clip · Diesen Clip“** in allen Erzeugern (wie im Werkzeugkasten). (c) (V) Zwingen-% und GR2-Stärke als **ein** Regler „Stärke“. (d) (V) Grundmuster als Reiter in den Werkzeugkasten („Grundmuster │ Figuren │ Spielweise“), statt drei Knöpfe im Clip-Blatt/ROLLE. Remix bleibt eigener Knopf (ganzer Song/Teil).

### D5 Fills: ◆ ÜBERGÄNGE ↔ Werkzeugkasten „Drums-Füller“ ↔ GR2 ↔ UI1 – Gefahr doppelter Kacheln
- **Heute:** Fills/Breaks als Song-Ebene in ◆ ÜBERGÄNGE (Ersetzen │ Mischen); der Werkzeugkasten hat eine Rolle „Drums-Füller“ (Snare-Wirbel, Clap-Aufbau …), die als Clip eingesetzt wird.
- **Geplant doppelt:** UI1 legt die Drums-Füller des Werkzeugkastens als Kacheln in die Übergänge (`ueLibAdd`, Ids „ui1-…“), GR2 plant „Genre-Fills (UE_LIB + BB1)“ – beide füllen dieselbe Bibliothek aus derselben Quelle.
- **Vorschlag:** jetzt zwischen UI1 und GR2 abstimmen: **eine** Fill-Bibliothek in ◆ ÜBERGÄNGE, nach Genre sortiert (GR2-Liste), eine Id-Reihe. Der Werkzeugkasten-Reiter „Drums-Füller“ zeigt dieselben Kacheln (V: oder springt in die Übergänge).

### D6 Video-Regie an fünf Orten mit drei Wortlisten (+ VD3)
- **Orte:** Video-Blatt „Bild“ (Auto, Song, Matrix + [Regeln]); Marken-Blatt Zeile Video und Bereich ⋯ Zeile Video (Auto, App, Song, Matrix, Spur …, Tastatur, Fokus …, Klavier, Mäusekino – `vvDirRow`); Clip-Blatt „Im Video“ (Auto, Gerät, Klavier, Mäusekino, Noten, aus – `VR1_VID`); Zell-Blatt eigener Clip; VD3-Schnitt-Spur (Auto, App, Klavier, Mäusekino, Gerät …, Matrix, Noten …, Text – `VD3_OPTS`).
- „Ganze App“ heißt im Video-Blatt die 9:16-Bildwahl, „App“ in der Regie eine Ansicht.
- **Ausblenden am Ende** an zwei Orten (Marken-Blatt beim letzten Teil und Video-Blatt), beides `song.fade` – das ist in Ordnung.
- **Vorschlag (V):** Die VD3-Schnitt-Spur wird **der** Ort für Regie je Takt-Bereich; die Zeilen „Video“ im Marken-Blatt und in der Bereich-Leiste werden ein Knopf „Im Video ▸“, der die Schnitt-Spur an dieser Stelle öffnet. Clip-Blatt „Im Video“ bleibt (anderer Gegenstand: ein Clip). **Eine** Wortliste überall: Auto · App · Song · Matrix · Klavier · Mäusekino · Gerät · Noten · Tastatur · Text · aus.

### D7 Export: acht Wege, drei davon doppelt
- **Doppelt:** ≡ › Projekt **[Song als Audio]** (Echtzeit, `songAudioStart`) ↔ Export › **WAV Ganzer Song** (offline, `va1Run`). ≡ › **MIDI-Export** (Szene / Alle Szenen / Mitschnitt / Song, mit Träger, `exportMidi`) ↔ Export › **MIDI Ganzer Song / Eine Spur** (`va1MidiGo`). ≡ › **[Video]** ↔ Export › **Video 9:16 / 16:9** (öffnet dasselbe Video-Blatt). ≡ › **Datei öffnen** ↔ Export › **Container öffnen** (beide `EL.fileIn`).
- Dazu: Als Datei sichern (.json, ohne Audios) ↔ Container sichern (ZIP, mit Audios) – für Xander kaum zu unterscheiden. Take-WAV, „gehört“-WAV, GarageBand, Sounds-Export liegen woanders.
- **Vorschlag (V):** Alles in **ein Blatt „Export“**: Audio (Song, Einzelspuren, Gesang, Chor; „Echtzeit-Mitschnitt“ nur als Notweg), MIDI (Song, eine Spur, Szene / Alle Szenen / Mitschnitt, Schalter „mit Träger“), Video, Projekt („Sichern mit allen Audios“ = Container als Standard), Sounds. Im ≡-Menü fallen der Abschnitt MIDI-Export und „Song als Audio“ weg; „Datei öffnen“ und „Container öffnen“ werden **ein** „Öffnen …“ (erkennt .json und .zip).

### D8 Verlauf, Versionen, Schnappschüsse – vier Systeme, zwei gleiche Namen (+ VD3)
- **Systeme:** ↶ halten → Blatt **VERLAUF** (Schritte + ＋ Schnappschuss, `sx14Open`); ≡ › **Ältere Versionen ▾** (automatische Sicherungen alle 10 min, `menuHistRefresh`); ≡ › **Verlauf** An/Aus (Gesten-Rekorder VC2a `HIST`, zeichnet jede Geste mit Zeit auf, bis 20 MB); ≡ › Online › Versionen.
- „Verlauf“ heißt also zweimal etwas anderes. „Versionen“ heißt dreimal etwas anderes (Clip-Versionen v1/v2, Ältere Versionen, Online-Versionen).
- **VD3-Making-of** plant ein eigenes Protokoll (localStorage, 800 Einträge) – der Gesten-Rekorder `HIST` zeichnet genau das schon auf.
- **Vorschlag:** (a) ohne Sichtbares: VD3 liest das Making-of aus `HIST` statt eines zweiten Protokolls. (b) (V) Namen: „Verlauf“ nur für die ↶-Liste; der Menü-Schalter heißt „Aufzeichnung (für Making-of)“; „Ältere Versionen“ heißt „Automatische Sicherungen“. (c) (V) Im VERLAUF-Blatt ein Abschnitt „Automatische Sicherungen“, damit alles Zurückholen an einer Stelle ist.

### D9 ◆ doppelt belegt; ◆ Klanganker ↔ Clip-Versionen
- **◆** steht für den Klanganker (Synth-Kopf, Clip-Blatt „◆ Klang“, Video-Ereignis „Klangfahrt ◆“) **und** für ◆ ÜBERGÄNGE (Song-Leiste, runder ◆-Knopf `ueFab`).
- Klanganker (`clip.st`, anderer **Klang** je Clip) und Clip-Versionen (`sx9`, andere **Noten** an einer Song-Stelle) sind verschiedene Dinge – bewusst getrennt lassen. Jede Version kann ihren eigenen ◆ haben.
- **Vorschlag (V):** ◆ nur noch für Klang; ÜBERGÄNGE bekommt ein eigenes Zeichen (z. B. ⇥) oder heißt „FILLS“. Clip-Versionen auch im Clip-Blatt der Matrix zeigen (heute nur über Zelle im Song halten).

### D10 Super-Regler ↔ Mod-Rad/Makro ↔ Locks
- Super-Regler: Kern seit 4.32 (`S.sr`, `srHand` mit Quellen Neigen / Leiste / Matrix), aber **keine Taste** in der App. Locks: Kern seit 4.38, **keine Taste**.
- Mod-Rad: als „Makro je Klang“ genutzt (SP1, Regler `mw`), FM hat eine Seite MAKRO (heller, bissiger …), MS 2000 und Bit Mask haben ein MOD-Rad.
- **Vorschlag (V, Frage an Xander):** Bevor der Super-Regler eine Bedienung bekommt: ein Begriff „Rad“. Mod-Rad = dieser Klang; Super-Regler = ein Rad für mehrere Spuren (Song), gleiche Optik. FM-Seite MAKRO als „FM-Makro“ kennzeichnen. Locks erst bauen, wenn klar ist, wie sie neben ◆ (Regler je Clip) aussehen.

### D11 Scrubbing ↔ ▶ ↔ „Mithören“ (gleicher Name, andere Funktion)
- Song-Lautsprecher „Mithören beim Wischen“ = Scrubbing (`sx7Toggle`): quer in der Song-Leiste, hochkant in SCHLEIFE ▾.
- ROLLE [Mithören] = welche Spuren beim Bearbeiten mitspielen (`mpPanel('listen')`). Gleiches Wort, andere Sache.
- **Vorschlag (V):** ROLLE-Knopf „Mitspielen …“ nennen. Scrubbing ohne Schalter: einfach beim Ziehen der ▼-Marke hören (dann fällt der Lautsprecher-Knopf weg) – sonst den Schalter in die Song-Leiste ⋯ statt unter SCHLEIFE.

### D12 Tonart-/Skala-Helfer mit Namens-Kollisionen
- Eine Skala (≡ › Harmonie, beim Abspielen), Tastatur beim Spielen (≡ › Harmonie **und** SPIELEN halten, gleiche Einstellung `setKbScale`), Magic Scale, Pinsel, ROLLE [Tonart], Harmonie-Blatt, LAUF Skala ▾, Gesang Tonart-Chip, Mikro Einrasten.
- **Kollisionen:** Magic **„Glatt“** = Umkehrungen mit glatter Stimmführung (`smooth`) ↔ Harmonie **„Glätten“** = Akkordwechsel auf eine Stufe (C). Magic **„Akkorde“** = Akkorde malen ↔ Harmonie **„Akkorde“** = Vorschläge. ROLLE **„Tonart“** = Zeilen ausblenden ↔ Menü **„Tonart zeigen“** = Tasten leuchten.
- **Vorschlag (V):** bewusst getrennt lassen (verschiedene Aufgaben), nur umbenennen: Magic „Glatt“ → „Stimmführung“; Harmonie „Glätten“ → „Auf eine Stufe“; ROLLE „Tonart“ → „Nur Leitertöne“; Harmonie-Reiter „Akkorde“ → „Akkord-Ideen“.

### D13 Länge, Doppeln, Kopieren – gleiche Wörter, verschiedene Dinge
- Länge: Clip-Blatt ½ −1 +1 ×2 (`clipLength`), ROLLE-Griff ┃, Harmonie › Lauf [Takte −/+] (`ED.roll.setLen`), Fenster ◀ ▶.
- Doppeln: Clip-Blatt ×2, ROLLE [Dupl.], Harmonie [Doppeln] (Lauf doppeln).
- Kopieren/Einfügen: Clip-Blatt (Clip), ROLLE (Noten), Drum-Kanal (Klang), Marken-Blatt ⧉ Kopie (Takte) und ⧉ Variante (Fassung), Bereich ⧉ Kopie →, Clip ziehen mit 2. Finger.
- **Vorschlag (V):** bewusst getrennt (jeweils anderer Gegenstand), aber immer den Gegenstand dazuschreiben: „Clip kopieren“, „Noten kopieren“, „Klang kopieren“, „Fassung kopieren“. Harmonie [Takte −/+] kann weg (gleich wie Griff/Clip-Blatt).

### D14 Gesang → Noten: drei Wege
- Live: Melodieerkennung + Stimme-FANG / ● REC → MELODIE. Nachträglich: Takes-Blatt [In Melodie umwandeln] (G5). Korrigieren: [♪ Tonhöhe · Noten] (G2).
- **Vorschlag (V):** getrennt lassen, klarer benennen: „In Melodie umwandeln“ → „Noten-Clip aus Gesang“; „♪ Tonhöhe · Noten“ → „Tonhöhe korrigieren“.

### D15 Lautstärke/Stumm je Spur an vielen Stellen
- Spurkopf (Wischen, [M], Halten = Solo), FX › SPUR Lautstärke, Chor-Mischpult, [M] an STIMME = nur Lead, Mix-Assistent „Pegel“; UI1-Spuren-Gruppe und MX2-Feinschliff/Kanalzug kommen dazu.
- **Vorschlag:** bewusst getrennt (Schnellzugriff), aber überall derselbe Wert mit derselben dB-Zahl; MX2-Kanalzug = FX › SPUR (Lautstärke + EQ · KOMP + Hall/Echo-Anteil) als **ein** Blatt.

### D16 Arpeggio / Schritte
- LAUF (Clip, Richtung), Drum SCHRITTE (Richtung), MS 2000 ARP + MOD SEQUENCE, Bit Mask Arp, Werkzeugkasten „Sequenz/Arp“, Spielweise „Harfe: Arpeggio“.
- **Vorschlag:** bewusst getrennt (Geräte-Arps gehören zur Platte, LAUF schreibt Noten). Neue Arp-Muster (LF2) nur in LAUF, nicht als weitere Stelle.

### D17 Kleinere Doppel (bewusst so lassen)
- ＋ Spur / Spur entfernen: ≡ › Projekt und Spur-Blatt.
- Perkussionsspur: Synth-Spur ⋯ und Klangerzeugung → North.
- North-Platte: drei Knöpfe (Drum-Kopf, SOUND-Blatt, Seite NORTH).
- Grundmuster: Clip-Blatt und Drum-Editor › Muster ▾.
- Schleife: SCHLEIFE ▾ › Bereich = Bereich ⋯ ⟲ Als Schleife.
- Taktart: Song (BPM), Teil (Marken-Blatt), Clip (Clip-Blatt) – drei Ebenen, so gewollt.
- Gleiten: Clip-, Teil-, Marken-Blatt – drei Ebenen, so gewollt.
- Versionsnummer dreimal im Menü – eine reicht (V, klein).

### D18 Gleiche Namen, andere Bedeutung (Übersicht)

| Wort | Bedeutung 1 | Bedeutung 2 | weitere |
|---|---|---|---|
| Verlauf | ↶-Liste (Schritte) | Gesten-Rekorder im Menü | – |
| Versionen | Clip v1/v2 | Ältere Versionen (Sicherungen) | Online-Versionen, App-Version |
| Mithören | ROLLE: Spuren mitspielen | Song: Scrubbing | – |
| Glatt / Glätten | Magic: Stimmführung | Harmonie: auf eine Stufe | – |
| Akkorde | Magic: Akkorde malen | Harmonie: Vorschläge | AKKORDE-Zeile im Song |
| Tonart | ROLLE: nur Leitertöne zeigen | Menü: Tasten leuchten / sperren | Clip-Tonart, Gesang-Tonart |
| Vorlage | Teil-Vorlage | Aus Vorlage … (Song-Form) | Vorlage beim Nachsingen, Übergänge-Vorlagen (UI1) |
| Vorschlag | Small/Full-Vorschlag | Leicht „(Vorschlag)“ | Mix-Vorschläge, Akkordvorschläge |
| Quantisieren … | Clip-Blatt: Timing | bei STIMME: öffnet Marken-Editor | Aufnahme-Quantisieren, Akkorde quantisieren |
| ◆ | Klanganker | ÜBERGÄNGE | – |
| App / Ganze App | Regie-Ansicht | 9:16-Bildwahl | – |
| Synth-Pop / Synthie-Pop | Stil-Name | Klang-Kategorie „Synthie-Pop FX“ | – |

### D19 Unsichtbar, nur aufräumen (kein Doppel für Xander)
- `● MEL.` und `S4 ▾` (`bMel`, `bMt` in `buildSongView`) werden gebaut, aber nie in die Song-Leiste gehängt.
- Runder Lautsprecher `sx7fab` wird hochkant gebaut, ist seit 4.46 per CSS immer versteckt.
- `konRangeItems` („▣ Als Block“, „Als neuen Teil konsolidieren“) laut Kommentar „überholt“, aber noch im Code; die Überschrift „Als neuen Teil konsolidieren“ lebt in `s2OpenSum` weiter.

---

## 3. Vorschläge kurz (Zusammenfassung von 2)

| Gruppe | Vorschlag | sichtbar? |
|---|---|---|
| D1 Teil machen | ein Knopf „Zusammenfassen …“ (immer mit Zurückholen), ▣ Block extra; sofort: „Als Teil“ intern wie Zusammenfassen | V / sofort unsichtbar |
| D2 Leicht/Voll ↔ Small/Full | eine Zeile „Small │ Full“ | V |
| D3 Mix & Master | MX2-Blatt = einziges Blatt, alte Knöpfe öffnen es, [Messen]/[Übernehmen] weg | V |
| D4 Stil-Werkzeuge | eine Genre-Liste (sofort), Ziel-Zeile überall, ein Stärke-Regler, Grundmuster als Reiter im Werkzeugkasten | teils V |
| D5 Fills | UI1 + GR2 auf eine Fill-Bibliothek abstimmen (sofort) | unsichtbar |
| D6 Video-Regie | Schnitt-Spur als einziger Ort je Bereich, eine Wortliste | V |
| D7 Export | ein Export-Blatt, ein „Öffnen …“ | V |
| D8 Verlauf | Making-of aus `HIST` (sofort), Namen trennen | teils V |
| D9 ◆ | ◆ nur Klang, Übergänge eigenes Zeichen | V |
| D10 Super-Regler | erst Begriff klären, dann Bedienung | Frage |
| D11 Mithören | ROLLE „Mitspielen …“, Scrubbing ohne Schalter | V |
| D12–D14 | nur umbenennen | V (klein) |

---

## 4. Sperrige Wege (zu tief oder unerwartet versteckt)

| Funktion | Weg heute | Vorschlag |
|---|---|---|
| Remix (ganzer Song) | ≡ › Projekt › Song › Remix … | GR2-Knopf REMIX in der Song-Leiste (geplant); ≡-Eintrag dann weg (V) |
| Song transponieren | ≡ › Projekt › Song › Transponieren … | ins BPM-/Taktart-Blatt oder neben REMIX in die Song-Leiste (V) |
| Mastern, Mix-Assistent | Spur wählen → Klang-Editor → FX → MASTER → AUTO-MASTER / MIX-ASSISTENT | MX2 [MIX] in der Kopfleiste (geplant); alte Knöpfe öffnen dasselbe Blatt |
| EQ · KOMP einer Spur | Klang-Editor → FX → SPUR → EQ · KOMP | zusätzlich aus dem MX2-Blatt je Spur (Kanalzug) – dasselbe Blatt |
| MASTER-Seite über den Pegel-Balken | winziger Balken in der Matrix-Ecke / Song-Taktspalte | Balken bleibt, öffnet aber das MX2-Blatt; im „Wo finde ich …?“ nennen |
| Scrubbing hochkant | SCHLEIFE ▾ › „Mithören beim Wischen“ (hat mit Schleife nichts zu tun) | beim Ziehen der ▼-Marke automatisch hören (V) |
| VD3 Video-Schnitt (geplant) | SCHLEIFE ▾ › Video-Schnitt | nicht unter SCHLEIFE: Video-Blatt + Tipp auf den Regie-Streifen (V) |
| Spur-Blatt (＋ STIMME-Spur, Effekte, GarageBand) | ■ der Spurzeile **halten** | zusätzlich ⋯ am Spurkopf oder im „Wo finde ich …?“ (V) |
| Gesangs-Effekte | Spur-Blatt › Effekte | auch im Takes-Blatt (V) |
| Marken-/Wellen-Editor des Gesangs | Clip-Blatt › „Quantisieren …“ | Knopf heißt bei STIMME „Marken & Timing …“ (V) |
| Clip-Versionen | nur: Zelle im **Song** halten | auch im Clip-Blatt der Matrix (V) |
| Small/Full, Leicht/Voll, Gleiten, Remix eines Teils | Marken-Blatt, weit unten (rund 12 Zeilen) | Marken-Blatt in Reiter: Ablauf │ Teil │ Klang & Groove │ Video (V) |
| Ausblenden am Ende | Marken-Blatt nur beim **letzten** Teil | auch Song-Leiste ⋯ (im Video-Blatt gibt es es schon) |
| Grundmuster für Drums | Drum-Editor › Muster ▾ › Stil-Grundmuster › (3. Ebene) | Reiter im Werkzeugkasten (siehe D4) |
| Super-Regler, Locks | gar nicht erreichbar (nur Kern) | erst klären (D10) |
| Melodie-Spur im Song (S4 ▾) | nur im ● SONG-Start-Blatt (NOTEN ▾) | so lassen; toten Knopf entfernen |

---

## 5. Sofort für die laufenden Pakete (unsichtbar, vor dem Zusammenführen)

1. **UI1 + GR2:** Drums-Füller/Genre-Fills nur **einmal** in die Übergänge-Bibliothek (gleiche Ids, GR2-Genres).
2. **MX2:** neues Blatt und alte Blätter nicht nebeneinander: [AUTO-MASTER], [MIX-ASSISTENT] und Master-Balken auf das MX2-Blatt leiten; Kanalzug = `mx1EqSheet`.
3. **VD3:** Making-of aus dem vorhandenen Gesten-Rekorder `HIST` lesen; Schnitt-Spur mit derselben Wortliste wie `vvDirRow`/`VR1_VID`; nicht unter SCHLEIFE ▾.
4. **GR2:** Genre-Liste als einzige Quelle auch für `BB1_GEN` und den Master-Stil; Stärke-Regler = Zwingen-%.
5. **Ohne sichtbare Änderung:** `rangeAsPart` auf `s2Template` umstellen (❖ Als Teil verliert sonst eigene Clips, Melodie, Gesang).
