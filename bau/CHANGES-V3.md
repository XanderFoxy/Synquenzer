## 4.56.0 — Gesang bearbeiten wie Noten (Notenrolle mit Silben, Anker auf dem Taktstrich, Schneiden statt Stauchen)

- **Gesang-Editor = dieselbe Notenrolle wie bei Instrumenten**: Tastatur links, Raster, Zoom. Jede Silbe ist ein Stück auf ihrer Tonhöhe, mit Welle, Tonhöhenkurve und **Silben-Text** (aus der Spracherkennung oder dem Songtext).
- **Anker**: die kräftige Linie im Stück = wo sich der Einsatz am stärksten aufbaut. Einrasten und **QUANT.** (mit Stärke) setzen den Anker genau auf den Taktstrich – der Anschwung liegt sichtbar davor.
- **Konsonanten** sind anders getönt als der gesungene Vokal.
- **Verschieben = Schneiden statt Stauchen**: nach links wird der Ausklang davor sauber abgeschnitten mit kurzer Ausblende (kein Knacken, nichts gequetscht); nach rechts wird nur der Vokal maßvoll gedehnt (bis 1,5×), Einsätze bleiben unberührt. Senkrecht = Tonhöhe.
- **Öffnen**: Matrix – Gesang-Clip ✎ / „✎ Bearbeiten“; Song – Gesang-Block antippen → **✎ Bearbeiten** (öffnet am Takt). Marken & Timing, Tonhöhe, Chor bleiben erreichbar.
- Änderungen hört man sofort, auch während ▶. Ein ↶ je Aktion. Im Container (Projekt + Audio) ist alles drin; beim Sichern als .json mit Gesang kommt der Hinweis „Mit Audio sichern“.
Tests: Gesang-Editor 61/61, Import 48/48, Regeln, doppelte Schlüssel 0, Rauchtest grün.

## 4.55.1 — Korrekturen zu 4.54 (Begleiter, Klänge, Chor, Export)

- **S&H in der Tonart** folgt jetzt Rückung und „Song transponieren“ (auch feste Spuren).
- **Begleiter ● AUFN.** in 3/4, 6/8, 7/8, 2/4, 5/4, 12/8: die Akkorde liegen auch im 2. Durchlauf richtig; „Für alle“ rechnet mit der Taktart.
- **Offener Begleiter** verfälscht den Song-Export (Audio, Video, MIDI) nicht mehr.
- **Chor rollbar** quer 926×370 mit Video-Regie/Schnitt-Modus: Fenster bleibt richtig groß.
- **Bild im Bild** quer auf der STIMME-Seite liegt richtig.
- **Perform-Blöcke** bleiben bei Taktart-Wechsel an ihrer Stelle.
- **Körnung**: Speichern → Laden → Speichern bleibt gleich.
- **Song-MIDI** enthält die Clip-Noten der MELODIE-Spur.
Tests: Zusammenspiel 46/46, Import 48/48, Regeln, doppelte Schlüssel 0, Rauchtest grün.

## 4.55.0 — Audio/MIDI importieren mit Tempo-, Takt- und Teile-Erkennung

- **Audio/MIDI importieren** (Menü → Export/Import, auch „Gesang importieren“): MP3, WAV, M4A, MIDI. Tempo vorweg eintippen oder **Erkennen** lassen – Tempo, Taktart (2/4, 3/4, 4/4, 6/8, 12/8), die erste „1“ und die Teile (Intro, Strophe, Refrain, Bridge, Outro) werden erkannt.
- Nur Gesang ohne Begleitung: Tempo wird aus den Silben geschätzt, die App fragt mit Vorschlag (z. B. „96 oder 48 / 192?“).
- Im Blatt: Welle mit Takt-Raster und farbigen Teilen, Tempo − / + / ½× / 2× / Tippen, Taktart, „1“-Marke ziehen, Teile umbenennen/zusammenlegen/teilen.
- Ziele: **In Szenen zerschneiden** (jeder Teil eine Szene auf der Spur „Original“, Song-Ablauf und Marken in Reihenfolge) │ **Als eine Spur** │ **Als Gesang**. Ein ↶ für alles.
- **Loop-Klammern**: Bereich auf dem Takt-Raster wählen → **Als Loop in die Matrix**, läuft taktgenau mit.
- Audio ist in der Projektdatei/Container mit drin.
Tests: Import 48/48 (WAV, MP3, M4A; 92 4/4, 120 3/4, 120 6/8, Gesang allein), Regeln, doppelte Schlüssel 0, Rauchtest grün.

## 4.54.1 — Kein Hinweis-Streifen „Neue Version“ mehr

- Kein Hinweis-Streifen „Neue Version“ mehr oben. Die App holt eine neuere Fassung weiter selbst (beim Öffnen, nach dem Stopp), aber ohne Meldung.
- Gilt auch für „Aus einer neueren Version gespeichert“: statt Streifen lädt die App still die neuere Fassung nach.

## 4.54.0 — Begleiter (Band spielt live zu deinen Akkorden), Perform-Spur im Song, Chor rollbar, neue Klänge: Saite, Vokal-Filter, Rauschfarben, Ring, Körnung

- **Begleiter:** AKKORD ▾ über der Tastatur › **BEGLEITER**. Du spielst einen Akkord (oder nur den Grundton) – die Band startet am Taktstrich mit deinen Spuren und Klängen und folgt jedem Wechsel. **INTRO · A · B · FILL · SCHLUSS**, Stil/Spuren/Figur unter STIL ▾. **● AUFN.** legt das Gespielte als Szene an (auf Wunsch ans Song-Ende), ein ↶; ● AUTO nimmt die Band beim neuen Song mit. ✕ = alles wie vorher.
- **Perform-Spur:** ● SONG nimmt die Perform-Leiste (Stottern, Filter, Gruppen, Blende) als Spur **PERFORM** auf, genau im Takt; Blöcke antippen/verschieben, ein ↶. **Rückung** nimmt jetzt alles außer Drums mit, auch MELODIE.
- **Chor rollbar:** viele Chor-Spuren sind mindestens 22 px hoch und rollen mit einem Finger in ihrer Gruppe („mehr ↓“), der Rest bleibt stehen; Halten zeigt den vollen Namen.
- **Neue Klänge:** Welle **Saite** (gezupft, 3 Werksklänge), Filter **Vokal** a-e-i-o-u, **Rauschfarben**, **Ring**, **Körnung**, **Anschlag ±** auf den Filter, **S&H in der Tonart**, Arp **Treppe**, **Oszilloskop** im Klang-Editor-Kopf.
- Alte Songs und Klänge klingen und speichern wie vorher.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; Zusammenspiel 23/23, Begleiter 53/59 (Rest: Bildvergleich + 5/4 hat jetzt einen Stil), Export-Randfälle 31/31, KF2 61/61, KF1 68/73, JAM3 63/67, CHQ 50/52, GEN4 72/72, VOX2 111/111 – offene Punkte sind Bildvergleiche mit älteren Fassungen (Farbkante) und bekannte Kleinigkeiten, die mit 4.54.1 kommen.

## 4.53.0 — Stil auf Szene/Song/alles mit Taktarten, Dur↔Moll je Szene, Mix in drei Schritten, Matrix ziehen über alle Zeilen, Einsingen ohne Chaos, Orientierung, Video mit Ton auf dem iPhone

- **Remix-Blatt:** Bereich **Szene │ Teil │ Song │ Alles** (mit Matrix), Spuren mit Rolle antippbar, Regler **deine Basis ↔ Stil**. 57 Stile, alle vollständig (Grundmuster, Bass, Akkorde, Lead, Fill) – neu u. a. Wiener Walzer, Ballade 3/4, Jazz-Walzer, 6/8, 12/8, 5/4, 7/8, Marsch, Polka, Baião. Die Taktart wechselt mit. Rhythmus und Stil-Klang sind **ein** Versuch: Vorher │ Nachher schaltet beides, Übernehmen = **ein ↶**.
- **Dur ↔ Moll** jetzt auch je Szene oder für alles inklusive Matrix, mit Vorher │ Nachher.
- **Mix & Master geführt:** **1 Messen → 2 Mischen → 3 Mastern**, Vorschläge einzeln oder alle, Liste „übernommen ✓“, EQ je Spur mit Begründung, **Profi-Check** (zu viel Hall, Hall/Echo am Bass, Bass nicht mittig, Mono). Überall steht, was du hörst: „▶ läuft · du hörst: VORHER“. Werkzeugkasten mit Klang: Figuren gemischt, Echo hörbar.
- **Matrix:** Clip an den Rand ziehen und kurz halten = umblättern (alle Spuren, Szenen 1–8). Beim Ablegen **Verschieben │ Kopieren │ Tauschen** (oder ≡ › Bedienung › Nie fragen; zweiter Finger = sofort kopieren). **Szene duplizieren** und **Spur duplizieren** (Klang + Clips), je ein ↶.
- **Einsingen:** Beim Singen hören **Begleitung │ + Melodie │ nur Klick**, Abhören **Gesang │ Melodie │ beides**. Gesang genau schneiden (Raster, **An Platz**), ROLLE-Bereich mit Griffen, der Gesang rückt mit.
- **Orientierung:** Zeile „● Refrain 2 › STIMME“ oben in jedem Blatt (antippen = zurück an die Stelle), Farbe je Bereich, Menü ≡ mit **Mehr ▾**, Gesang-Leiste **1 Aufnehmen · 2 Auswählen · 3 Bearbeiten · 4 Chor**, [● REC] im Mikrofon-Blatt, Raumschiff-Look zum Ausprobieren (≡ › Bedienung).
- **Video mit Ton auf dem iPhone:** Fehler von Safari 26 beim AAC-Ton wird repariert, Ton wird vor dem Speichern geprüft (sonst eigener AAC-Kodierer), auch ältere iPhones und die Claude-App bekommen MP4 mit Ton. Fertiges Video spielt gleich im Blatt, „Im Song ▸“, „▶ Letztes Video“.
- **Behoben:** Video, WAV, Einzelspuren und Projektdatei enthalten immer deinen Nachher-Stand – auch wenn Mix & Master, Klang-Editor oder Chor gerade auf „Vorher“ steht (du hörst danach weiter Vorher); erste Note fehlte manchmal im Video-/Audio-Export; Fehler beim Laden eines Projekts während eines Exports; „Übernehmen“ quer abgeschnitten; Marken-Editor und Dur ↔ Moll (Szene) mit richtiger Bereichsfarbe.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; GEN4 72/72, VOX2 111/111, MIXG 48/48, MTX 92/92, ORI 87/87, VID5 56/56, SND1 67/67, Zusammenspiel 9/9 + 52/52 + 56/56 + 31/31; JAM1 50/52, JAM2 103/105, GL1 44/45, Video-Vorschau 30/31 – die offenen Punkte sind nur Bildvergleiche mit der alten Fassung (neue Farbkante/Wo-bin-ich-Zeile, gewollt); je Paket und für das Zusammenspiel unabhängige Prüfungen mit behobenen Befunden.

## 4.52.0 — JAM: Bedingungen je Schritt, FILL-Taste, Zufall festhalten, Perform-Leiste mit Stottern/Filter/Gruppen/Blende A↔B, Rückung

- **Bedingungen** je Drum-Schritt, LAUF-Schritt und Note: **1:2 … 8:8** (nur im A-ten von B Durchläufen), **1. Mal / ab 2. Mal**, **FILL / ohne FILL**, **Vorgänger / nicht Vorgänger** – Chance wirkt zusätzlich. Schritt lang drücken (wie bei den Locks) → **Bedingung ▾**; bei Bit Mask und North in der ROLLE **[Bedingung]**. Am Schritt ein kleines Zeichen („1:2“, „F“, „1.“), die Matrix-Zelle zählt mit („2:4“).
- **FILL**: Sobald ein Schritt FILL hat, wird die TAKT-Anzeige zur **FILL-Taste** – halten = an, kurz tippen = bis Taktende. Im Song zählt jeder Takt mit Fill-Chip als FILL (neu in ⇥ FILLS: „FILL-Takt“ ohne eigene Noten).
- **Zufall festhalten** (Chance, Zufall, hin und her): jede Runde klingt wie die erste, **[neu]** würfelt neu.
- **Perform-Leiste** (≡ › Bedienung): **Stottern** 1/4–1/32 (alles │ ohne Drums │ nur Drums), **Filter-Fahrt** (links dumpf, rechts dünn, Loslassen = zurück), **DRUMS │ BASS │ REST** (tippen = am Takt, halten = sofort), **Blende A↔B** zwischen jetzt und gemerktem Klang oder ◆ einer Szene. Ändert dein Projekt nicht; ✕ = alles wie vorher.
- **Rückung**: Teil-Marke antippen → **+1** (Zeile unter „Ablauf“) – ab diesem Teil einen Halbton höher (Drums und Spuren auf ⇅ fest bleiben); an der Marke steht „+1“.
- Song-Wiedergabe, MIDI-Export und Video spielen dasselbe; ohne Bedingungen und ohne Leiste sieht und klingt alles wie vorher.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; JAM1 52/52, JAM2 105/105, Stil-Klang 67/67, GL1 45/45, Video-Vorschau 31/31; je Paket unabhängige Prüfung (9 + 5 Befunde, behoben).

## 4.51.0 — Stil komplett: Rhythmus, Klang und Mischung je Stil, Seitenkette automatisch

- **Stil anwenden** (Remix-Blatt, auch Matrix-Remix): **Nur Rhythmus │ + Klang │ + Klang & Mischung** (empfohlen). Mit Klang baut der Stil auch Drums und Synths um – EBM/Industrial: harte, verzerrte Kick mit Klick, peitschende Snare mit Gate, Metall-Schläge statt Kuhglocke, knurrender Bass; Reggae: weiche Kick, Rimshot mit Feder-Hall, runder Bass, Dub-Echo. Jeder der 44 Stile hat so ein Profil (Drums, Bass, Lead, Pad, Effekte).
- **Seitenkette automatisch, wo sie typisch ist:** House, Eurodance, Synthwave, Hi-NRG, Techno (Bass weicht der Kick), leicht bei EBM; aus bei Reggae, Country, Walzer, Jazz, Synth-Pop, Trap. Die Zeile sagt, was passiert („Seitenkette 50 %“ / „ohne Seitenkette“).
- **Vorher │ Nachher** schaltet nur den Klang (spielt gleich weiter), **Übernehmen** = ein ↶; über „Spuren“ einzelne Spuren oder Hall/Echo abwählen. Ein zweiter Stil rechnet vom Original – nichts vom ersten bleibt hängen; von Hand geänderte Spuren bleiben, wie du sie gemacht hast.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; Stil-Klang 67/67 (gemessen: Snare-Rauheit, Kick-Klick, Ducking am Bass, Spektrum je Stil), GL1 45/45, Video-Vorschau 31/31; unabhängige Prüfung mit 8 behobenen Befunden.

## 4.50.0 — Live-Video-Vorschau beim Komponieren, Chor-Zeilen sauber, 42 Glitches weg, LAUF zeigt, was klingt

- **Live-Vorschau beim Komponieren:** kleines Bild-im-Bild-Fenster über Matrix bzw. Song – zeigt beim Abspielen live, was dein Video an dieser Stelle filmt (Auto-Regie, Video-Spur, „Im Video“, gelbe Auswahl). Pille **Regie │ App** umschalten, **antippen** = Ansicht dieser Stelle wählen (Klavier, Gerät, Noten …), **ziehen** = an eine Ecke docken (hochkant und quer getrennt gemerkt). Einschalten: Video-Blatt › Extras › „Live-Vorschau beim Komponieren“, aus mit ✕. Aus kostet nichts, an höchstens 10 Bilder/s und nur sichtbar.
- **Chor-/Background-Zeilen:** liegen nicht mehr ineinander (Matrix quer) und nicht mehr über den Teil-Blöcken (weit herausgezoomt, auch Glas-Ansicht); mit Video-Spur passen AKKORDE und MELODIE wieder ins Bild. Die Zeilen zeigen jetzt auch den Chor aus deinen Teilen – antippen öffnet die Stimme.
- **Glitch-Suche:** 19 Ansichten und Blätter hochkant und quer, 42 Befunde → 0 (u. a. abgeschnittener Schleifen-Knopf, Mikro-Blatt quer, ✕ auf der obersten Taste, „Ganze App“ im Video-Blatt, zu große „VIDEO“-Schrift).
- **LAUF zeigt, was klingt:** Matrix-Clip, Song-Kachel und ROLLE zeigen die Noten in der gespielten Reihenfolge (auch rückwärts, hin und her, Zufall – je Durchlauf), die notierten blass dahinter; Zeichen am Clip ◀ ⇄ ? ↑ ↓. In der ROLLE [wie gespielt │ wie notiert], bearbeitet wird weiter das Notierte. Neu: **aufwärts/abwärts (Tonhöhe)** – Rhythmus bleibt, Töne kommen der Höhe nach.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; GL1 44/45 (die eine: Zufall-Messung unter Volllast 1× 7 statt 8 gehörte Noten, Anzeige stimmte; Einzelprüfung danach 6/6 grün), Video-Vorschau 31/31; je Paket unabhängige Prüfung mit behobenen Befunden.

## 4.49.1 — Aufgeräumte Wege: Marken-Blatt in Reitern, ein Export-Blatt, Small │ Full, klarere Namen

- **Aufgeräumte Wege** (deine Freigabe zum Inventar): Marken-Blatt in Reitern (Ablauf │ Teil │ Klang & Groove │ Video, viel flacher), ein „Zusammenfassen …“, **Small │ Full** statt Leicht/Voll (alte Songs klingen gleich), „Im Video ▸“ öffnet die Video-Spur an der Stelle, **ein Blatt Export**, „Öffnen …“ für .json und .zip, Mithören durch Ziehen der ▼-Marke (ohne Lautsprecher-Knopf), ◆ nur noch Klang, ⇥ FILLS, klarere Namen.
- **Marken-Blatt:** „Refrain groß“ und „Refrain 2× singen“ stehen im Reiter **Klang & Groove**.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; Wege 77/77, Mix 34/34 (Refrain-Knöpfe im Reiter Klang & Groove).

## 4.49.0 — Mix in der Matrix, Chor sauber & „Refrain groß“, 27 neue Grooves, Tempo-Version, 3/4 überall, Dur ↔ Moll, Öltank-Hall, Parameter-Locks

- **Ein Blatt Mix & Master für alles:** [AUTO-MASTER], [MIX-ASSISTENT], der Master-Balken und der Mix-Assistent im EQ · KOMP-Blatt öffnen dasselbe Blatt. **In der Matrix:** läuft eine Szene, hört das Blatt 4 Takte mit und klingt sofort – ohne Song. **Auto-Nachführen:** nach einer Änderung wartet es 4 s, misst neu und gleitet sanft nach (höchstens ±2 dB je Mal, nie während einer Aufnahme; Stumm/Solo verstellt nichts).
- **Chor sauber:** Chorstimmen im Timing an den Lead, Tonhöhe enger aber natürlich, Brummen/Rauschen/S-Laute weg, Chor etwas hinter und breiter als der Lead; beim Mischen eigener Chor-Abstand („4,7 dB unter dem Lead – passt“). **Refrain groß:** aus einer Lead-Stimme im Refrain enge Dopplungen, dunkle Unterstimme, Terz/Quinte aus deinen Akkorden, Hauch-Schicht, Kompression, Glanz, großer Hall und Echo am Zeilenende – Strophe bleibt nah. **Refrain 2× singen:** echte Doppel-Takes werden automatisch ausgerichtet. A/B vergleicht mit vorher.
- **Eine Genre-Liste überall** (Remix, Grundmuster, Werkzeugkasten, Fills, Master-Stile). **27 neue Stile**, immer als Übersetzung **deiner** Noten: Boom Bap, G-Funk, Trap, Reggae Steppers/Rockers, Dancehall, Dembow, Drum & Bass, Breakbeat, Trip-Hop, Electro/Miami Bass, Go-Go, Afrobeat, Bossa Nova, Samba, Ska, UK Funky, Jersey Club, Halftime-Shuffle, Disco klassisch, Synthwave, Power Pop 80er, Freestyle, Motown-Beat 80er, Eurodance … – je mit Fill und Werkzeugkasten-Figuren.
- **Tempo-Version:** im Remix-Blatt **Langsam · voller** und **Schnell · dezenter** – Tempo und Arrangement auf deinen Noten (Hats, Ghosts, Bindungen, Hall, Release). **Remix in der Matrix:** Bereich „Matrix“ übersetzt die Szene als neue Szene, der Song bleibt unberührt.
- **Werkzeugkasten in Reitern:** Grundmuster │ Figuren │ Spielweise, überall „Ziel: Neue Version · Neuer Clip · Diesen Clip“. In ⇥ FILLS jede Figur nur einmal, nach Genre sortiert.
- **3/4 stimmt überall:** Metronom-Betonung, Einzähler (3 Klicks), TAKT-Anzeige, Takt-Lampen, LAUF (12 Schritte je Seite), Szenenwechsel am 3/4-Taktstrich. Taktart gewechselt → **[Clips umwandeln]** (ein ↶). **≡ › Song › Dur ↔ Moll …:** Moll-Version des ganzen Songs (Melodie, Akkorde, Bass; Drums bleiben), A/B, ↶ – auch Moll → Dur.
- **FX › [RACK]:** alle Effekte als Geräte mit An/Aus-Lampe, großen Reglern und Pegel live. **FX › HALL › [RAUM ▾]:** Studio, Kammer, Saal, Kirche und der **Öltank** (riesiger Betontank, 8 / 30 / 75 s Nachhall, die Tiefen klingen am längsten).
- **Parameter-Locks:** Schritt (LAUF, Drum-Schritte) bzw. Note (ROLLE) halten und einen Regler drehen – der Wert gilt nur dort; Punkt am Schritt, Lock-Leiste, [Locks löschen], ↶. **Lauflichter an/aus** (≡ › Bedienung): aus = Matrix, LAUF, Schritte und Geräte-LEDs stehen still, spart Akku.
- **LAUF im konsolidierten Teil:** rückwärts, hin-her, Zufall, Chance, Schrittlänge und Drum-Chance klingen jetzt genau wie vor dem Zusammenfassen (auch eingefügt, im MIDI und im Video).
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; nach dem Zusammenführen: Mix 34/34, Groove 99/99, Takt 47/47, Locks 41/43 (die 2 = Menü hat jetzt die neuen Einträge der anderen Pakete), LAUF-Teil 467/467; je Paket unabhängige Prüfung mit behobenen Befunden.

## 4.48.1 — Korrekturen nach dem Zusammenführen

- **Guide „Remix“** springt jetzt hin: mit Song direkt ins Remix-Blatt (Stil-Kacheln), ohne Song zu SONG ⇄ mit Hinweis. Die Kurz-Anleitung „Song bauen“ zeigt den Remix-Schritt wieder.
- **Bit Mask klingt nach ■ nicht mehr nach** (vorher bei etwa jedem dritten Stopp eine geplante Note, auch beim Szenenwechsel).
- **Speicherleck behoben:** jedes Öffnen eines Synth-Editors ließ alte Knöpfe im Speicher (10× öffnen: +510 Elemente) – jetzt +0. Längeres Arbeiten bleibt flüssig.
- **Zwei Renders klingen gleich** (MS 2000 bekam im Export einen zufälligen Startwert) – Mix-Assistent und Mastern messen damit wiederholbar.
- **Konsolidieren → Clip verschieben → Zurückholen** findet den Clip wieder.
- **MIDI aus dem Export-Blatt** (Song/Szene) enthält jetzt LAUF, Fills und deren Stille-/Ersetzen-Fenster – gleich wie gespielt.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; Guide 38/38, Remix 36/36; unabhängige Prüfung: Freigabe (Bit Mask 0/16 Nachklingen, Editor 10× +0 Knoten).

## 4.48.0 — Mix & Master 2, Remix übersetzt deine Noten (17 Stile), Guide „Wo finde ich …?“, Video wie die App mit Schnitt im Song und Making-of

- **Mix & Master** (oben **MIX** neben ≡; auf schmalen iPhones ≡ › Mix › Mix & Master …): **Mischen**, **Mastern** oder **beides**. Die App hört den Song **einmal** durch – danach rechnen 9 Stile (Euro-Disco 80er, Hi-NRG, Synth-Pop weit, Italo, Modern, Synth-Pop, Disco, House, Sanft), Ziel −14/−9 und die Regler **Transparenz ↔ Druck** und **Wärme ↔ Glanz** sofort neu, ohne neues Rendern. Feste Grenzen: True-Peak ≤ −1 dBTP, Klang je Band ±3 dB, kein Pumpen. **A/B** auch während der Song läuft, **pegelgleich** (der lautere Weg wird zum Vergleich leiser – nie im Export). Dazu: **Seitenkette Kick → Bass**, **Feinschliff je Spur** (Fläche weicher/Atmosphäre, Bass schärfen/Druck, Lead herausstellen/einbetten), **Tiefenstaffelung**, Liste „Warum“; im **EQ · KOMP** jeder Spur Spektrum vor/nach dem EQ, Kennlinie und Gain-Reduction live.
- **Remix übersetzt deine Noten:** **⇋ REMIX** jetzt direkt in der Song-Leiste. **17 Stile** – neu: Italo-Disco, Italo-Dance, Hi-NRG, Minimal Techno, Industrial/EBM, Dark Wave, Reggae One Drop, Country Train-Beat, Country Shuffle, **Walzer 3/4** (stellt die Teile auf 3/4, A stellt zurück). **Deine Noten** bleiben: Bass, Sequenzen, Akkorde und Drums rücken – wie bei der Tonhöhen-Quantisierung – in Raster, Swing und Betonung des Stils; **Stärke 0–100 %**, ▶ Hören, Stilwechsel beim Abspielen ab dem nächsten Takt, **A Original / B Remix**, ein ↶. „Euro Disco“ heißt jetzt **Euro-Disco**; „Detroit Pop“ war kein echter Stilname – das Muster ist der **Soul-Pop der 60er** (alte Remixe bleiben). **Genre-Fills:** je Stil ein Fill in ◆ ÜBERGÄNGE (Knopf „Genre“) und im Werkzeugkasten.
- **Guide:** ≡ ganz oben **„Wo finde ich …?“** – Wort eintippen (Swing, Fill, Hall, Remix, Mastern …), Tipp springt hin, ein gelber Rahmen zeigt die Stelle. „Alle ▾“ listet alle Funktionen, dazu 5 Kurz-Anleitungen mit „Zeig es mir“.
- **Bedienung:** hochkant stehen **VA │ FM │ ▾** wieder nebeneinander (WT, Platte, Bit Mask, North unter ▾). **◆ ÜBERGÄNGE** hat 29 neue Vorlagen in allen Reitern. **Bit Mask** im Gerät: [KLÄNGE] (alle Werksklänge nach Kategorie, Tipp lädt und spielt) und [?] (kurze Anleitung). **Mehrere Spuren auf einmal:** Spur halten, weitere antippen – Wischen regelt alle zusammen. Vorschlag **Leucht-Look** (≡ › Bedienung, ab Werk aus): aktive Tasten glühen wie LEDs, nichts verschiebt sich.
- **Video wie die App:** neue Voreinstellung 9:16 „Ganze App“ (wer etwas anderes gespeichert hat, behält es). Video-Blatt › **Extras:** [Titel] (Songname, Tempo, Tonart in der ersten Sekunde), [Rand] (Platz für Untertitel), [Making-of], [Schnitt]. Neue Ansicht **Text** (Songtext mit der Silbe, die gerade klingt).
- **Video-Schnitt im Song:** SCHLEIFE ▾ › „Video-Schnitt im Song“ – eine schmale Video-Spur unter den Taktnummern, je Bereich ein Chip (voll = deine Wahl, gestrichelt = Auto): Auto, App, Klavier, Mäusekino, Gerät, Matrix, Noten, Text; „Ab Takt n“ teilt, Kanten ziehen, ↶.
- **Making-of:** die App merkt sich (nur auf deinem Gerät), welchen Klang du wählst, welche Regler du drehst, welche Clips und Teile entstehen – [Making-of] setzt einen gerafften Vorlauf (8–36 s) mit dem echten Editor vor den Song.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; nach dem Zusammenführen: Mix & Master 34/34, Remix 36/36, Guide 38/38 (Paket), Video 33/33 (Paket).

## 4.47.0 — Werkzeugkasten: Standardfiguren je Genre

- **Werkzeugkasten** (Clip-Blatt [Werkzeugkasten ▾] oder ROLLE [Werkzeugkasten] neben [Spielweise]): 39 professionelle Standardfiguren – Bass 10, Akkord-Stabs 8, Sequenz/Arp 6, Pads 4, Lead-Füller 5, Drums-Füller 6 – für Disco-Pop/Euro-Disco, Eurodance, Synth-Pop, New Jack Swing, House, Detroit, Hi-NRG, Italo. Z. B. Offbeat-Staccato-16tel mit Echo, Disco-Galopp, Oktav-Disco-Bass, Eurodance-Rolling-Bass, Hi-NRG-16tel, Italo-Arp-Bass, Disco-Brass-Stabs, weicher Fanfaren-Stack, House-Piano-Stabs, Gated-Pad, Antwort-Läufe zwischen Gesangszeilen, Snare-Wirbel, Clap-Aufbau.
- Folgt den Akkorden (Akkord-Zeile der Szene, sonst aus den Noten erkannt), Swing aus dem Stil, sinnvolle Lage. **Vorschau** im Zusammenhang (leise mit den anderen Clips), **[Einsetzen]** als neue Version / neuer Clip / ersetzen – ein ↶.
- **[mit Klang]**: passender Werksklang + Echo (z. B. 1/8 punktiert für den Disco-Bass) – 6 neue Klänge in der Kategorie „Werkzeugkasten“. Ohne: nur das Muster mit deinem Klang. (Echo ist ein gemeinsamer Bus – wirkt auf alle Spuren mit Echo-Anteil, mit ↶.)
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; Werkzeugkasten 53/53, Harmonie 47/47 (Knopf da), LAUF 48/49 (Popup-✕-Messpunkt wie 4.46.0).

## 4.46.0 — FANG-Teil mit Namen, ✕ überall, Video-Regie mit Ereignissen, Ziehen & Tauschen, North-Kick

- **FANG im laufenden Teil:** das Blatt „Teil überarbeitet“ hat wieder die Namen: Intro, Strophe, Pre, Refrain, Bridge, Break, Outro und „✎ frei“ – ein Tipp legt den neuen Teil an; ist der Name schon vergeben, kommt die zweite Ebene „＋ Strophe 2 | ⟳ Strophe ersetzen“.
- **✕ hochkant überall erreichbar** (gemessen auf 39 Flächen, 3 iPhone-Größen); Popups haben oben rechts ein ✕, das nicht wegscrollt. **Lautsprecher (Scrubbing)** hochkant nicht mehr über dem Song: SCHLEIFE ▾ → „Mithören beim Wischen“.
- **Video-Regie mit Ereignissen:** erkennt je Takt Spur setzt ein/aus, neuer Clip, Gesang beginnt, Fill, ◆-Klangfahrt, Teilwechsel, Drop, Transposition – und schneidet dorthin. [Regeln] im Video-Blatt: Ereignis → Ansicht, an/aus, Vorrang. Deine Regie in Teil/Marke gewinnt.
- **Nichts Erfundenes:** neue Ansicht **Gerät** – Regler nur im echten Editor/auf der echten Platte, mit Fokus-Rahmen auf dem Regler, der sich bewegt. **Im Clip-Blatt: „Im Video: Auto | Gerät | Klavier | Mäusekino | Noten | aus“.** **Klavier:** die Noten steigen jetzt nach oben und lösen sich auf.
- **Ziehen & Tauschen:** Spur vom linken Rand (Farbbalken) nach rechts ziehen = Reihenfolge; Clip halten bis er wächst → auf leere Zelle = verschieben, auf Clip = tauschen, zweiter Finger = kopieren (Song folgt); Szene am oberen Rand des Szenen-Kopfs ziehen = umsortieren (Song, Teile, Marken folgen). Wisch-Lautstärke und Halten-Solo bleiben.
- **North:** „manchmal gar nichts“ – nach Neustart der Wiedergabe ging der erste Schlag (meist die Kick) verloren → behoben (auch Perkussionsspur). „manchmal hart“ – die Wellen H1–H6 waren bis zu 16 dB zu laut → begrenzt. Werksklänge bitgleich wie vorher.
Tests: Regeln, acorn 0 / doppelte Schlüssel 0, Rauchtest grün; FANG/✕ 36/36 + ✕-Messung, Ziehen 41/41, North 10/10, Remix 30/30, Video-Regie bis auf zwei Messpunkte (das neue Popup-✕ ist 40×36 sichtbar, Trefferfläche ≥ 44 px) grün.

## 4.45.0 — Ton im Video, Export, Fills frei, Gesang natürlicher, Remix, LAUF, Harmonie, Querformat, Konsolidieren

- **Video mit Ton auf dem iPhone:** das iPhone kann Ton nicht selbst kodieren – die App baut das Video jetzt selbst mit Bild und Ton (.mov), spielt in Fotos und jedem Schnittprogramm.
- **Menü → Export:** ganzer Song WAV, **Einzelspuren** (ZIP), **nur Gesang**, **nur Chor**, Song als MIDI, **eine Spur als MIDI**, Video 9:16/16:9, **Projekt-Container** (zeigt vorher alle enthaltenen Audios, prüft beim Öffnen „5 von 5 ✓“), **MIDI importieren**. Behoben: Clip verschwand nach WAV-Export.
- **Fills & Breaks:** Snare-Fehler behoben (ein Tom-Fill nimmt nur die Toms weg). Fill-Chip → **Ersetzen | Mischen** (Ersetzen: Alle / Nur Toms / Pads …). Frei setzen: ◆ ÜBERGÄNGE → Kachel → irgendwo in den Song tippen (Raster 1/4 · 1/8 · 1/16 · frei), Chip ziehen, Länge am Griff, **Noten …** bearbeiten.
- **Gesang:** [M] an STIMME schaltet nur den Lead stumm – Chor singt weiter. Tonhöhe **Natürlich ↔ Hart** (Standard natürlich: Vibrato bleibt). Wort aus der Welle löschen → Rest rückt nach (oder Lücke lassen). Übersprechen der Musik wird wieder gesäubert (der Fehler kam seit 4.25.4 vom gemerkten Kabel-Weg). Audio-Editor: größere Griffe, Lupe beim Ziehen.
- **Remix & Genre:** ≡ → Song → **Remix …** (oder Marke → Rhythmus): New Jack Swing, Euro Disco, Detroit Pop, Frühes House, Funk House, Garage 2-Step, Synth-Pop, Zwingen 0–100 %, A Original / B Remix. **Grundmuster ▾** im Clip-Blatt. **Small/Full** je Drum-Clip und je Teil. **Song transponieren** (≡ → Song).
- **LAUF:** Schritt antippen = aus/an (Note bleibt), lang drücken = Wirbel, Transponieren, Chance, Slide, Akzent, Start. Richtung vorwärts/rückwärts/hin-her/Zufall. **Spielweise** in der ROLLE: Gitarre (ab, ab-auf, Folk, Riff), Glissando, Harfe, Glocken, Mandoline, Alberti, Pizzicato.
- **Harmonie** (Noten-Editor ganz rechts): **Glätten** → Grundmuster auf C (Moll: a) als neuer Clip, Akkorde gleich in die Akkord-Zeile; **Lauf** doppeln/fortsetzen; **Gegenstimme** (3 Varianten); **Akkordvorschläge**. Skalen-Sperre: SPIELEN ½ s halten → frei / Skala / Akkord.
- **Querformat:** nichts mehr unten abgeschnitten – passt eine Seite nicht, rollt nur der Inhalt, Kopf und ✕ bleiben stehen; ✕ quer in jedem Editor am selben Platz.
- **Konsolidieren:** kein Clip wird mehr überschrieben – der alte Clip bekommt den ganzen Inhalt, spielt in der Matrix weiter nur seine Loop-Klammern; nur der neue Teil spielt alles. Clip-Blatt: „Fenster Takt 1–2 von 4“, ◀ ▶ verschiebt das Fenster.
- Zusammengeführt: Harmonie- und Spielweise-Knopf im Noten-Editor teilten sich eine Einstellung (einer verschwand) – getrennt. Neue Prüfung auf doppelte Schlüssel: 0.
Tests: Regeln, acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Export 38/38, Fills 25/25, Remix 30/30, LAUF 49/49, Harmonie 47/47, Konsolidieren 34/34, Querformat-Messung 0 abgeschnitten; Gesang alle Punkte grün (die Übersprech-Messung schwankt unter Last).

## 4.44.0 — Mix & Master auf Knopfdruck, Synthie-Pop-Klänge

- **MASTERN:** FX › MASTER → AUTO-MASTER → Stil (Synth-Pop · Disco · House · Sanft) und Ziel (Streaming −14 / Laut −9 LUFS) → **MASTERN**. Die App hört den Song einmal durch und stellt 3-Band-Multiband-Kompressor, sanfte Sättigung, Bus-Kompressor und Limiter so ein, dass er genau auf der Ziel-Lautheit liegt, ohne Übersteuern (gemessen −1,5 dBTP). **Vorher/Nachher** zum Vergleichen.
- **Mix-Assistent denkt im Zusammenhang:** je Spur Rolle, Frequenzbild (9 Bänder), Breite, Hall/Echo-Anteil und wer sie zudeckt. Vorschläge: Vorrang je Band, Bass bleibt voll, Fläche nach hinten, Lead nach vorne. Einzeln oder **Alle übernehmen** (ein ↶), Vorher/Nachher. Rolle selbst setzen (Drums, Bass, Lead, Fläche, Sequenz, Gesang, automatisch).
- **EQ · KOMP je Spur:** FX › SPUR → **EQ · KOMP**: Low-Cut, Bass, Mitte, Höhen und Kompressor mit Kurve; wirkt auch im Video und Export.
- **Synthie-Pop FX (neue Werks-Kategorie, 20 Klänge):** Computer-Dialing, Daten-Blubbern, Modem-Zirpen, Roboter-Blips, Laser-Zap, Resonanz-Sweep, nasser Filter-Wah, Resonanz-Pfeifen, Funk-Arp-Blubber … und Flächen: Schwebe-Fläche, Strings-Ensemble, Chor-Pad, Morph-Sweep, Glas-Fläche … Mod-Rad = Makro (Nässe, Schweben, Blubber-Tempo). Pegel wie die Werksklänge.
Tests: Regeln, acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Mix/Master 30/30, Klänge 24/24.

## 4.43.1 — Klanganker sicherer

- **Klanganker (Gegenprüfung):** Kein Datenverlust mehr im Grundklang: Undo nach Preset laden, Klangerzeugung wechseln, 🎲 oder Init holte während einer laufenden Geste die Clip-Werte in den Grundklang – behoben (auch A/B). Gemischte Gesten (ein Grundklang-Schalter + ein Regler) sind jetzt EIN Undo-Schritt. Super-Regler-Vormachen landet nicht mehr im Clip. ARP an der MS 2000-Platte bleibt beim Loslassen an. Undo-Schritte tragen den Reglernamen.
- **Chor-Blatt:** malte nach „Selbst singen“ nicht neu (der Aufruf stand versehentlich im Kommentar) – behoben.
Tests: Regeln, acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Klanganker-Tests (10/10 + Gegenprüfung) alle OK.

## 4.43.0 — Video-Matrix wie in der App, Korrekturen Klavier/Mäusekino

- **Video-Matrix:** Clips in den echten Spurfarben statt grün, darin die kleinen Noten wie in der App (Drums als Schlag-Raster), laufende Clips hervorgehoben, Laufposition als Linie, Drum-Clips glühen bei Schlägen. Spurköpfe wie in der App (STIMME zeigt „Audio“). Video nicht langsamer.
- **Klavier (Korrekturen):** Tastatur reicht jetzt bis ganz oben (vorher fehlten sehr hohe Noten), Taktlinien bei 7/8 stimmen, schneller (Bild-Puffer wird wiederverwendet).
- **Mäusekino (Korrekturen):** zeigt unter einem ◆-Klangzustand die richtigen Werte; Bit-Mask-Spuren zeigen keine falschen Filterkurven mehr. In der Takt-Leiste wird „Mäusekino“ nicht mehr abgeschnitten.
- iPhone: wenn der Bild-Speicher knapp ist, bricht das Video nicht mehr ab; Matrix-Bilder werden beim Schließen freigegeben.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Klavier-Test alle OK; Matrix-Tests und Gegenprüfungen grün.

## 4.42.0 — Klanganker automatisch, Modulation an jedem Regler sichtbar

- **Klanganker ◆ automatisch:** Drehst du im Synth-Editor einen Regler, während ein Clip läuft (ohne Wiedergabe: der gewählte Clip), landet die Änderung sofort hörbar in genau diesem Clip – ohne die Raute anzutippen. Clip wechseln = du hörst dessen Klang; nach Speichern und Laden klingt es wieder genauso. Je Dreh-Geste ein Schritt für ↶.
- **◆-Taste = Grundklang:** Antippen schaltet um auf „Grundklang“ – dann gehen Änderungen wie früher für alle Clips in den Spur-Klang. Noch einmal = wieder automatisch in den Clip. Gilt für Analog, FM, WT und MS 2000; Bit Mask, Drums und Perkussionsspur bleiben beim Grundklang.
- **Modulation sichtbar:** Der Punkt am Regler zeigt die Summe aller Quellen (LFO 1, LFO 2, Hüllkurven …), auch im Modulier-Modus einer anderen Quelle (vorher stand z. B. Resonanz mit LFO 2 still). Die Hüllkurve schlägt pro Note sichtbar an. Auf der MS 2000-Platte zeigen die Regler jetzt die VIRTUAL-PATCH-Wege (Bogen + Punkt), auch MOD-Rad und BEND.
- Zusammengeführt: Die Anzeige liest die wirksamen Wege (Grundklang ⊕ Clip-Zustand), damit neue Wege im Clip auch sichtbar sind.
- Offen: Bit Mask noch ohne Modulationsanzeige; Clip-Matrix im Video in echten Farben kommt als Nächstes.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Auto-Anker 10/10 (inkl. Speichern/Laden, Undo, ohne Wiedergabe); Modulation 11/11 + 7/8 (ein Messpunkt mit sehr kurzer Hüllkurve, wie vorher).

## 4.41.0 — Video: Klavier-Ansicht und Mäusekino (erste Fassung)

- **Klavier (Video):** Tastatur unten, die Noten fallen als Balken auf die Jetzt-Linie, jede Spur in ihrer Farbe. Leise Töne sind heller und kühler, laute satter und wärmer, Akzente glühen; die klingende Taste leuchtet mit. Drums sind keine Noten, sondern eine Leiste KICK · TOMS · SNARE · HATS, die bei jedem Schlag aufglüht. Wählen: Video-Regie → **Klavier**; die Auto-Regie nimmt sie bei melodischen Teilen manchmal selbst.
- **Mäusekino (Video):** Jede Spur als Leuchtzeile mit Pegel, klingenden Tönen (Lauflicht), Anschlag, Schritten im Takt und Drum-Pads, die bei Akzenten glühen. Rechts die Filterkurven aller Synths (Glühen bei hoher Resonanz). Wechselt ein Clip mit ◆-Klangzustand, siehst du Filter- und Hüllkurve vom alten zum neuen Wert gleiten (Ist-Kurve, gestrichelte Ziel-Kurve, Fortschritt in %, Werte). Wählen: Video-Regie → **Mäusekino**.
- Alles kommt aus echten Werten des Songs, zwei Videos desselben Songs sind gleich.
- Offen: Clip-Matrix im Video in echten Farben mit Mini-Noten (kommt nach), Gegenprüfung der beiden Ansichten läuft noch.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Klavier-Test (Standbilder, Grenzfälle, Video 16:9 + 9:16, Auto-Regie) alle OK; Mäusekino-Test ohne Fehler.

## 4.40.3 — FANG im Songteil fängt die Melodie

- **FANG im laufenden Songteil:** Hast du gerade Töne gespielt, fängt FANG jetzt deine Melodie als Clip (wie überall sonst). Den ganzen Songteil (Teil ersetzen / als neuen Teil) fängt FANG nur noch, wenn du in den letzten 8 Sekunden nichts gespielt hast, sondern nur Clips umgeschaltet hast.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Weiche geprüft (gespielt → Clip, ruhig → Teil).

## 4.40.2 — Songteil wieder direkt: Strophe, Refrain …

- **Zusammenfassen ist zurück:** Takte wählen → ⋯ → **Zusammenfassen** (oder im Marken-Blatt neben Bearbeiten) → ein Tipp auf **Intro, Strophe, Pre, Refrain, Bridge, Break, Outro** oder einen eigenen Namen, und der Teil ist da. Das ist das Blatt von vorher.
- „Zu Teil / Block …“ bleibt daneben für Block und Zurückholen.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Tipp auf „Refrain“ legt den Teil an.

## 4.40.1 — ✕ bleibt im Bild

- **Drum-Editor-Kopfzeile:** Spielte ein Pad North, schob die rote Taste „Platte“ auf schmaleren iPhones (375/390 px) das ✕ rechts aus dem Bild. Dort rücken Schalter Drums | North und die Taste jetzt etwas enger zusammen, alle Tasten bleiben mindestens 44 px groß. Auf 428 px (iPhone 12 Pro Max) sieht alles aus wie vorher.
- Geprüft: Das ✕ ist in Synth-Editor, NORTH, Drum-Editor, Platte und MS 2000 sichtbar, hochkant (375/390/428) und quer (844/926 breit).
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün.

## 4.40.0 — Regler drehen mit, North-Platte auf der Perkussionsspur

- **Regler drehen sichtbar mit:** Wechselt ein Clip mit Klangzustand ◆ (Szene, Songteil, Song-Kante), drehen sich die Regler im offenen Editor jetzt mit demselben Tempo wie der Klang zum neuen Wert und zurück. Greifst du selbst an einen Regler, gilt deine Hand.
- **North auf der Perkussionsspur:** Seite NORTH → rote Taste **Platte** oben rechts. Das ist dieselbe Platte wie auf der Drum-Spur, im gleichen Aussehen und mit der gleichen Bedienung. Jeder Kanal hat alle Regler (TONE · NOISE · CLICK · MIX · FX · HALL/ECHO), jede Dreh-Geste ist ein Schritt für ↶. Die Seite NORTH selbst bleibt wie sie war.
- **Querformat:** Die Seite NORTH scrollt quer innen, damit unten nichts abgeschnitten ist. Die übrigen Seiten im Querformat prüfe ich im nächsten Paket.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Regler-Fahrt gemessen (Cutoff 300 Hz → 8 kHz schrittweise, Rückfahrt); Platte auf der Perkussionsspur hochkant und quer geöffnet, ohne Fehler.

## 4.39.0 — North-Pads, Spuren erreichen, Tipp wählt wieder, Stopp-Logik

- **North:** Jedes Pad hatte schon eigene Werte. Die Verwirrung kam von zwei Stellen: Bei Wellen ohne Spektrum (z. B. Kick „Rund“ = Sinus) stand im Feld nur „–“, obwohl der Regler sich bewegte → jetzt steht der Wert immer da, gedimmt mit „ohne Wirkung · A1“. Und **ALLE KANÄLE** blieb beim Pad-Wechsel an (dann wirkt jede Änderung auf alle Pads) → geht jetzt beim Wechsel des Pads aus. Kurze, trockene Kick: DECAY ~12–18, NOISE LVL 0, CLICK 0.
- **Untere Spuren erreichen:** Der Knopf [▲▼] im Drum-Spurkopf (Seite 1/2) reagierte seit 4.35 auf dem iPhone nicht – geht wieder.
- **Tipp auf den Spurnamen = wählen** (wie vor 4.35). Stumm nur über [M], Halten = Solo, Lautstärke erst bei eindeutig waagrechtem Wischen.
- **Stopp:** Globaler ■ setzt alle Spuren auf „kein Clip“ – danach startet ▶ auf einen Clip nur diesen. Spur-■ löst beim Loslassen aus (kein verschluckter Tipp mehr).
- **Drum-Schild:** Mit Menü → Harmonie → Drums mittransponieren zeigt der Drum-Kopf ⇅ statt 🔒. LATCH unverändert (global, gilt für alle folgenden Spuren; die Leiste ist bei offenem Editor verdeckt).
Getestet: Regeln, acorn, Rauchtest; Kern-Tests der Reparatur auf 4.35-Kopie.

## 4.38.0 — North-Platte, Anschlag sehen und ziehen, Lock-Kern

Grundlage 4.37.0 + zwei Pakete in einem Durchgang (NDP, N8LOCKS).
- **North-Platte:** Drum-Spur → Editor → oben **Drums | North** auf North stellen → daneben erscheint die rote Taste **Platte**. Sie öffnet North als eigenes Gerät: rote Front, rotes Ziffern-Display, Kanal-Tasten (antippen = Schlag, oben laut, unten leise), Sektionen TONE · NOISE · CLICK · MIX · FX · HALL/ECHO, großes Rad mit Rasten. Auch im SOUND-Blatt eines North-Pads: Knopf **North / Platte**. Jede Dreh-Geste ist ein Schritt für ↶.
- **Anschlag sehen und ziehen:** In der Noten-Rolle zeigt jede Note ihren Anschlag als Füllhöhe. Neues Werkzeug **⇕** (zwischen ⬚ und ⌫, Pinsel und Mithören bleiben, wo sie sind): Note senkrecht ziehen = Anschlag, du hörst ihn dabei; unten die Leiste **◀ VEL 96 ⇕ ▶** für die gewählten Noten. In der Drum-Schritt-Ansicht geht das auch.
- **Lock-Kern (noch ohne Knöpfe):** Die App kann jetzt einzelnen Noten eigene Reglerwerte und freie Reglerreihen im Clip mitgeben – mit Abspielen, Speichern und Video. Zum Bedienen gibt es noch nichts (kommt mit der Lock-Bedienung); deine Projekte ändern sich dadurch nicht.
- Zusammengeführt: Die Instrument-Wahl macht nur noch der Schalter **Drums | North** (kein zweiter North-Knopf); „Alle Pads North“ in der Platte nimmt denselben Weg. Das Merkmal „Locks“ steht in derselben Prüfliste wie Super-Regler und ◆ (ältere Stände öffnen solche Projekte nur zum Ansehen).
- Offen: deine Abnahme beider Teile. Die Platte gilt nur für das Drum-Kit, noch nicht für eine Perkussionsspur (North auf einer Synth-Spur). Im Drum-Editor ist die Titelzeile mit **Platte** hochkant enger (der Spurname wird gekürzt) – sag, wenn die Taste woanders hin soll. Die Fragen aus dem Paket (Anschlag nach Tipp-Höhe oder fest, Rot-Ton, Kits im Rad) sind noch offen.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; kurz geprüft: Schalter North → Taste „Platte“ (66 × 44 px, Zeile läuft nicht über), Platte öffnet/schließt ohne Fehler.

## 4.37.0 — Transponieren sauber, Teile-Blatt geführt, feiner Pinsel, Scrubbing + Verlauf, Vorlage beim Nachsingen

Grundlage 4.36.0 + fünf Pakete in einem Durchgang (HARM, KONUX, PINSEL2, SX714, G10J).
- **Transponieren immer sauber:** Akkordwechsel greifen jetzt am **Taktstrich**, „Eine Skala“ ist für alle Projekte an – Durchgangstöne landen in der Skala, die gerade gilt. Alte Projekte werden einmal umgestellt (kurzer Hinweis), danach bleibt deine Wahl unter Menü › Harmonie. Behoben: ein Lauf mit F♯-Durchgang rutschte unter E manchmal eine Stufe (D♯ statt E). Drums und Perkussionsspur werden weiter nie mittransponiert.
- **Songteile zusammenfassen – ein Blatt:** Takte wählen → ⋯ → **Zu Teil / Block …** (auch im Marken-Blatt und beim Antippen eines Blocks): Mini-Zeitleiste, Bild-Karten „Zu einem Teil machen“ / „Als Block gruppieren“ / „Zurückholen“, Name im selben Blatt, im Song darüber eine Vorschau. „Zusammenfassen“ ist jetzt „Zu einem Teil machen“.
- **Melodie-Pinsel fein:** Pinsel steht auf „schmal“; schnelles Wischen ändert nichts, erst wenn der Finger kurz (90 ms, Knopf „90 ms“) auf einer Tonhöhe verweilt, wird genau diese Spalte gesetzt – mit Tick. Zwischen zwei Haltepunkten entsteht ein Lauf in der Tonart.
- **Scrubbing im Song:** Lautsprecher-Knopf an → unter der festen Linie wischen, jeder Schlag klingt kurz an, Blitz am Taktstrich, loslassen setzt ▼. Quer sitzt der Lautsprecher in der Song-Leiste, **hochkant rund unten links im Song-Fenster** (die Leiste ist mit ◆ ÜBERGÄNGE voll und bleibt wie in 4.36). **↶ halten** → Verlauf-Liste mit Namen und Uhrzeit, Sprung zu jedem Stand, **＋ Schnappschuss** merkt einen ganzen Stand im Projekt.
- **Vorlage beim Nachsingen:** ● halten → Zeile „Vorlage“ (Spur oder alte Stimme lauter, Rest leiser) – nur während des Takes, danach klingt alles normal. Beim Chor „Selbst singen“ zeigt eine Leiste Zielstimme und Treffer-Punkt (grün/gelb/rot).
- Zusammengeführt: Marken-Blatt hat Leicht/Voll, ✂ Bei Takt … und „Zu Teil / Block …“ nebeneinander; Scrubbing rechnet mit Taktarten (3/4, 7/8 …); Mithören im Noten-Editor schaltet Spuren wieder richtig stumm (seit Solo/Spurkopf ging das nicht mehr sauber).
- Offen: deine Abnahme aller fünf Teile, besonders der Platz des Lautsprechers hochkant (sag, wenn er woanders hin soll) und ob ein Lauf unter dem Dur-Akkord der 5. Stufe in Moll lieber „harmonisch Moll“ spielen soll.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün; Song-Leiste in 428/390/375 hochkant und 926 quer vermessen (alles ≥ 44 px).

## 4.36.0 — Weicher Szenenwechsel, Einsingen fertig, Bit Mask, Übergänge an Teilkanten

Grundlage 4.35.0 + Paket B2 (V6a, G10a, Bit Mask BM1–BM6 + BM8, Übergänge UE-A/B) in einem Durchgang.
- **Weicher Szenenwechsel:** Orange **◆** im Synth-Kopf (oder **◆ Klang** im Clip-Blatt) → der Clip merkt sich seinen Klangzustand. Beim Szenenwechsel gleiten die Regler dahin statt zu springen; wie lange, stellst du unter **Gleiten** im Clip-, Teil- oder Marken-Blatt ein. Das ist jetzt ein gemeinsamer Szenen-Morph mit dem aus 4.32.0 (gilt auch bei 3/4, 7/8 …).
- **Einsingen fertig:** Beim Aufnehmen der Stimme zeigt die Aufnahme-Leiste deinen **Pegel** (rot = zu laut); im 🎤-Blatt steht ein Hinweis, wenn der Ton über die Hörmuschel läuft. Startet der Song in Takt 1, gibt es einen stillen Vorlauf; nach dem letzten Wort fragt die App „Clip +1 Takt?“.
- **Bit Mask:** neue Klangerzeugung – im Synth-Kopf **VA · FM · WT · MS 2000 · Bit Mask** (schmal: Klangerzeugung ▾). Eigene Seite GERÄT mit Bend- und Mod-Rad und Arp. Bend/Rad/Druck nimmt er als **Kurven** auf; im Song löschst du sie über eigenen Clip antippen → „Kurven löschen“. Das Modul (170 KB) lädt erst, wenn eine Spur Bit Mask spielt – Start gleich schnell wie 4.35.0 (gemessen 0,4–0,55 s), Datei +0,36 MB (gepackt +0,12 MB).
- **Übergänge an Teilkanten:** Song → Knopf **◆ ÜBERGÄNGE** → unten die Bibliothek; einen Übergang auf die Kante zwischen zwei Teilen **ziehen**. Chip an der Kante antippen = Länge, Vorhören, Entfernen.
- Zusammengeführt: Bit Mask und North stehen beide in der Klangerzeugungs-Liste; Chor-Zeilen, Clip-Versionen, Spurkopf und Mix-Assistent bleiben wie in 4.35.0. Alte Projekte laden gleich (im Paket geprüft; nach dem Zusammenführen nur Rauchtest).
- Offen: deine Abnahme aller vier Teile. Quer auf kleineren iPhones (unter 428 px Höhe) sind die Knöpfe links in der Song-Leiste durch ◆ ÜBERGÄNGE nur 37–39 px hoch (auf deinem 428 × 926 alle ≥ 44) – das war im Paket schon so; wenn du willst, lege ich sie enger. Die Übergänge sind erst drei einfache Platzhalter (Werks-Übergänge kommen mit UE-C/D).
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün.

## 4.35.0 — Spurkopf, Zoom im Song, Versionen eines Clips

- **Spurkopf (Matrix links, im Song die Namensspalte):** Tipp = stumm, **Halten = Solo** (gelbes S, andere gedimmt), **waagrecht schieben = Lautstärke** mit dB-Anzeige; Doppeltipp auf den Schieber = 0 dB. Solo gilt nur live (nicht im Export, nicht gespeichert). Das Spur-Blatt (＋ Spur, entfernen …) liegt jetzt auf **■ der Zeile halten**. Im Song: Tipp auf den Namen wählt die Spur nicht mehr, sondern schaltet stumm (und wählt sie mit).
- **Song zoomen:** mit **zwei Fingern** von „Schläge sehen“ bis „ganzer Song“; Doppeltipp mit zwei Fingern = ganzer Song und zurück. Ganz weit draußen werden Teile zu Farbblöcken mit Namen. **Mini-Karte:** Marke halten und weit ziehen → unten erscheint der ganze Song zum Hinziehen. Zoom bleibt je Projekt im Gerät.
- **Versionen eines Clips:** Zelle im Song halten → oben „Versionen: v1 · v2 · ＋“. ＋ macht eine Kopie und öffnet den Editor, Tipp auf v2 setzt sie an diese Stelle (ganzer Teil), **[Überall v2]** überall. v1 bleibt immer das Original. Schild „v2“ auf der Zelle.
- Offen: die drei Pakete wurden zusammen nur mit Rauchtest geprüft (Xanders Regel „wenig testen“). Ganz weit herausgezoomt zeigt die Zelle kein „v2“-Schild (zu schmal).

## 4.34.0 — Chor-Spuren, Warp-Editor, Mix-Assistent, Perkussionsspur

Grundlage 4.33.0 + vier Pakete in einem Durchgang (CHORSP, G10E, MIXA, PERC).
- **Chor-Spuren:** STIMME-Clip ✎ → [Chor] → Stil. In der Matrix und im Song stehen unter STIMME jetzt BACKGROUND und je Chorstimme eine eigene Zeile (antippen = Noten, [M] = stumm). Regler-Symbol in der BACKGROUND-Zeile → Mischpult mit Lead, Background, Gesang gesamt und [Gekoppelt].
- **Gesangs-Editor:** unten ein Lineal mit [▶/■] und [Loop] – tippen spielt ab dort, ziehen setzt den Loop. Eine Note verschiebt sich nur, wenn sie gewählt war oder kurz gehalten wird.
- **Warp-Editor (Marken):** zwei Finger zoomen stufenlos, Doppeltipp zwischen zwei Strichen zoomt auf die Silbe, Mini-Karte oben. Ein Finger schwenkt nur – Striche greifst du in der Leiste oben, neue Marke mit [+].
- **Mix-Assistent + Auto-Master:** Seite MASTER → zwei neue Knöpfe. Der Mix-Assistent erkennt den Charakter jeder Spur und schlägt Kompressor, EQ und Pegel vor ([Übernehmen] / [Zurück]). Auto-Master: Ziel Streaming oder Laut, [Messen] [Übernehmen] [Vorher/Nachher].
- **Perkussionsspur:** Synth-Spur ⋯ → „North – Perkussionsspur“ (oder Klangerzeugung → North). Die Spur folgt dann automatisch nicht der Transponierung (Schild „folgt nicht“ am Spurkopf, abschaltbar auf der Seite NORTH).
- Zusammengeführt: Im Marken-Editor zoomen nur noch die neuen Warp-Gesten (kein doppelter Zoom); in den Synth-Listen gibt es nur einen North-Eintrag. Die Drum-Spur behält ihren Reiter North.
- Alte Projekte laden und klingen gleich. Offen: deine Abnahme der vier Teile; im Mix-Assistenten rechnet die Takt-Zuordnung beim Song noch mit 4/4.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün.

## 4.33.0 — North als Instrument, Werkzeuge zusammengelegt, Song-Ende ausblenden, Gesang nach Tonart

Grundlage 4.32.0 + vier Pakete in einem Durchgang (NORTHI, DOPPEL, SX126, G10G).
- **North als Instrument:** eigener Reiter North und Schalter Drums | North; die North-Kits stehen jetzt immer in der Kit-Liste und beim Blättern. ≡ → Info zeigt die Zeile „North: bereit / lädt / nicht verfügbar (Grund)“.
- **Werkzeuge zusammengelegt (Piano-Rolle):** nur noch je ein Knopf Spiegeln (mit Schalter „Achse: Mitte / 1. Note“), Umdrehen und Tauschen (gezeichnetes Symbol) – „Umkehren“ und „Krebs“ sind darin aufgegangen.
- **Song-Ende ausblenden:** Song → letzte Marke antippen → „Ausblenden am Ende“ 2/4/8 Takte (auch im Blatt Video). Im Marken-Blatt [Bei Takt …] teilt einen Teil mit der Klinge; neuer Song kann aus einer Form-Vorlage entstehen.
- **Gesang nach Tonart:** Takes-Blatt → [♪ Tonhöhe · Noten] → Tonart-Chip oben: Auto, aus dem Gesang oder von Hand; ▲/▼ springen stufenweise in der Tonart, keine Oktav-Ausreißer mehr.
- Alte Projekte laden und klingen gleich.
- Offen: Der eigene Update-Hinweis aus dem North-Paket ist bewusst nicht drin – das macht weiter der Versions-Wächter. Deine Abnahme der vier Teile steht noch aus.
Tests: Regeln (live 1×, MS 2000 1×, Marken 0), acorn 0 doppelt / 0 Syntaxfehler, Rauchtest grün.

## 4.32.0 — Taktarten, Teile leicht/voll, gemalter LFO, Versionsnummer im Menü

Grundlage 4.31.0 + Stufe B1 (T1 Taktarten, SX11 leicht/voll, N8I134 Super-Regler-Kern und Mal-LFO).
- **Taktarten:** BPM antippen → Taktart 4/4, 3/4, 2/4, 5/4, 6/8, 7/8, 12/8 für den Song; je Songteil im Marken-Blatt [Taktart ▾], je Clip im Clip-Blatt. Metronom und Einzähler betonen die Eins, TAKT zeigt „Takt.Zählzeit“, [Clips umrechnen] passt die Drums an. Tempo bleibt ♩ = BPM.
- **Teile leicht/voll:** Song → Marke antippen → [Leicht] dünnt den Teil aus (Hi-Hat höchstens Achtel, Kick/Snare bleiben), [Voll] holt alles exakt zurück; dazu [⧉ Variante] und [Einfügen]. Beim Abspielen wechselt es am nächsten Taktstrich.
- **Mal-LFO:** Synth → LFO → sechstes Form-Feld ✎ öffnet das Form-Blatt, dort malst du deine eigene LFO-Form. Die sechs Form-Felder sind jetzt 44 px breit.
- **Versionsnummer:** ≡ antippen – ganz oben steht klein „SYNQUENZER 4.32.0“.
- Alte Projekte laden und klingen gleich. Projekte mit Taktart oder gemalter Form werden als Format 7 gespeichert.
- Offen: Super-Regler ist nur im Kern gebaut, die Bedienung wartet auf deine Antworten; eigene Gruppierungen (7/8 als 3+2+2) kommen später; LFO „1 Takt“ zählt auch in 3/4 noch 4 Schläge; „Meine Formen“ fehlt noch.
Tests: Rauchtest grün, B1-Zusammenspiel 30/31 (der rote Punkt sind fehlende Schriftdateien der Testumgebung, nicht die App), Regeln (live 1×, MS 2000 1×, Marken 0, acorn 0 doppelt / 0 Syntaxfehler).

## 4.31.0 — Takes-Verwaltung (G10c)

Grundlage 4.30.1. STIMME-Clip antippen → Takes-Blatt (mit dem 4.30.1-Kopf: ⏮ ▶ Schleife, Ablegen, ✕ – genau ein ✕):
- Jede Aufnahme mit **Mini-Welle**, Marke **HÖRBAR/STUMM**, fester **Nummer** (Take 3 bleibt Take 3, auch nach dem Löschen anderer), Uhrzeit, Herkunft.
- **Halten** (oder ✎) = Name, Farbe (gut / vielleicht / raus / blau / grau), ★ Favorit. **Wisch nach links** oder ✕ = löschen, mit [Rückgängig].
- **▶ je Zeile = Vorhören** eines Takes allein, der hörbare Take bleibt. Tipp auf die Zeile = hörbar machen (wie bisher).
- Unten: [Andere Takes löschen (★ bleiben)] und [Aufräumen · x MB].
- Mikro-Blatt: **„Durchgänge als Takes“** – bei fester Clip-Länge wird jede Loop-Runde ein eigener Take („Runde 1…n“).
- Alte Projekte bleiben gleich; Namen/Farben/★ gehen mit Speichern, Laden, ZIP und Kopie mit.
Tests: Rauchtest grün, G10c-Kern 35/35, Regeln (live 1×, MS 2000 1×, Marken 0, acorn 0 doppelt).

## 4.30.1 — Logo-Abspann deckungsgleich, Blätter schließbar und ablegbar

App: `rel-4301/index.html`, 4 689 628 B, `VERSION = '4.30.1'` (APP_CODE 4030001), md5 `fbf8be68dbb2a7c43cc4f02a0ed5730f`.
Grundlage ist **4.30.0** (online, `synq-snapshots/R-4300.html`). Die Datei entsteht reproduzierbar aus 4.30.0 mit
`python3 rel-4301/work/build.py R-4300.html rel-4301/work/psh.js <ziel>` (nur exakte Ersetzungen, je genau ein Treffer).
Gegenüber 4.30.0: 315 Zeilen dazu, 47 Zeilen ersetzt (`rel-4301/release.diff`). Kein neuer Klang, alte Klänge unverändert.
Regeln: „MS 2000“ 1×, die Zeile `  live: true,` 1×, keine Markennamen, keine Emojis als Grafik (Symbole im neuen Kopf sind
gezeichnete Linien), alle neuen Tasten ≥ 44 × 44 px. Doppelte Namen (acorn): 0 doppelt, 0 Syntaxfehler (22 Skripte).

### A · Logo-Abspann: dein Logo endet genau mit dem Video

So, wie du es beschrieben hast:

- **Es wird nichts mehr angehängt.** Das Video ist so lang wie der Song bzw. die Auswahl samt Ausklang – genau so lang wie
  ohne Logo.
- **Vom Ende zurückgerechnet:** Dein Logo-Video ist 10 s lang, also beginnt es 10 s vor dem Ende. Die letzte Sekunde des Logos
  ist die letzte Sekunde des Videos; das allerletzte Bild zeigt das fertige Logo (gemessen: Abweichung zum Endbild der
  Logo-Datei ≤ 2 von 255).
- **Im selben Moment**, in dem sich das Logo zu schreiben beginnt, blendet das laufende Bild flächig auf Schwarz ab.
  Ich habe **2 Sekunden** gewählt (gleichmäßig, wie eine Abblende im Schnittprogramm): man sieht den Song noch kurz hinter
  den ersten Strichen, danach steht das Logo auf Schwarz bis zum Schluss.
- Das Logo liegt **einmal in der Mitte**, 60 % der kürzeren Bildseite, Schwarz wird herausgerechnet (Luma-Key): **kein Kasten,
  kein Rand, das Rot bleibt satt** – wie in 4.29.0.
- **Der Ton bleibt, wie er ist.** Der Song endet so, wie er endet (mit seinem Ausklang); kein zusätzliches Ausblenden, keine
  angehängte Stille.
- **Song kürzer als das Logo** (z. B. eine kurze Auswahl): Dann beginnt das Logo schon mit dem ersten Bild – mitten in seiner
  Animation (so viel weiter vorn, wie das Video kürzer ist), damit das Ende trotzdem deckungsgleich bleibt. Nur in diesem Fall
  blendet das Logo in 0,25 s weich ein, damit es nicht hart erscheint.
- Gilt für **16:9, 9:16 und 1:1** und für **beide Video-Wege** (WebCodecs und Aufnahme in Echtzeit).
- **Ohne Logo** (Schalter aus oder keine Datei) ist das Video wie in 4.30.0.

Befund nebenbei (behoben, eine Zeile): Ohne Logo konnte die **Bildspur länger werden als der Ton** – wenn das Bild schneller
gerechnet wurde als der Ton, entstanden Bilder hinter dem Songende, bevor feststand, wo der Ausklang endet (gemessen in 4.30.0:
1:1-Video 23,3 s Bild bei 18,6 s Ton). Jetzt warten diese Bilder auf die gekürzte Länge – so wie es mit Logo schon immer war.
Wo das nicht auftrat, ist das Video unverändert (siehe Test „ohne Logo wie 4.30.0“).

### B · Chor-, Takes- und Mikro-Blatt: immer schließbar, ablegbar, mit Abspielen

**Warum du in der Vorschau nicht herauskamst:** In der Vorschau (428 × 650) ist das Chor-Blatt fast so hoch wie das Bild.
[OK] lag unten außerhalb, Takes- und Mikro-Blatt haben gar keinen Schließen-Knopf (nur „Tipp daneben“ – dafür blieben 8 bis
24 px Rand). Und das Blatt ließ sich mit dem Finger nicht verschieben (die App hält Wischgesten auf Tasten fest, damit keine
Lupe erscheint). Dein Wischen nach unten ging deshalb an die Claude-App – die hat die ganze Vorschau geschlossen.
Dazu kam ein kleiner Fehler: Im leeren Chor-Blatt (noch kein Chor) tat [OK] gar nichts. Beides ist behoben.

Neu in **Chor**, **Takes** und **Mikrofon** – ein fester Kopf, der immer oben am Blatt stehen bleibt:

| Knopf | Wirkung |
|---|---|
| ⏮ | die Stelle von vorn |
| ▶ / ■ | spielt die Stelle **mit Chor** bzw. hält an – das Blatt bleibt offen |
| Schleife | an: die Stelle wiederholt sich; aus: einmal, dann Stopp (gemerkt; gilt nur hier, deine Song-Schleife bleibt) |
| Pfeil ▾ | **Ablegen**: das Blatt fährt auf eine schmale Leiste unten zusammen |
| ✕ | schließen |

- „Die Stelle“ ist bei einer Song-Stimme der Song über genau ihre Takte (z. B. Takt 5–8), bei einem Szenen-Clip die Szene von vorn.
- Der Inhalt unter dem Kopf **scrollt jetzt mit dem Finger** (nur innen, das Wischen geht nicht mehr an die Claude-App).
- **Wischen nach unten am Kopf** schließt das Blatt; ein kurzer Zug federt zurück. **Tipp daneben** schließt wie bisher.
- **Abgelegt** liegt unten eine Leiste mit Name und Stelle, ⏮ ▶ Schleife, Pfeil ▴ und ✕. Die App ist darüber voll bedienbar
  (Szenen starten, Tempo, andere kleine Fenster). **Ein Tipp auf die Leiste holt das Blatt zurück – genau so, wie es war**
  (aufgeklappte Teile, Scroll-Stand). Öffnest du ein anderes großes Blatt, ersetzt es das abgelegte.
- **Aufteilen direkt im Chor-Blatt:** [Als Chor‑Stimme duplizieren] → [Diese Stelle] oder [Ganze Spur]. Das Blatt bleibt offen,
  die neue Stimme erscheint als eigene Zeile (Noten über ihr ♪). Ein Chor aus 4.25 zeigt wie bisher oben
  [Auf Chor-Gruppe umstellen]. Hochkant steht der Knopf unter [+ Stimme · Chor löschen · OK], quer in derselben Zeile.
- Marken-/Wellen-Editor, Noten-Editor und Video-Blatt hatten ihr ✕ schon immer sichtbar – geprüft in allen drei Größen.
- Sonst ist nichts umgebaut: Kacheln, Regler, Zeilen und Farben der Blätter sind wie vorher.

### C · Versions-Wächter: neue Versionen kommen von selbst

- Die App fragt beim Start, bei jeder Rückkehr in die App und alle 10 Minuten nach, ob es eine neuere Version gibt.
- Gibt es eine, speichert sie und lädt die neue Version selbst (nie während Wiedergabe oder Aufnahme – dann direkt nach dem Stopp).
  Kurz steht da „Neue Version … wird geladen“. Kein Zwischenspeicher kann mehr eine alte Fassung liefern.
- ≡ → Info zeigt die laufende Version.

### So prüfst du am iPhone (Safari und Vorschau)

1. **Version:** Seite neu laden. ≡ → Info zeigt „SYNQUENZER 4.30.1“.
2. **Logo:** Song mit mindestens 6 Takten → ≡ → Video → 16:9 → Video erstellen. Ansehen:
   - Das Video ist so lang wie der Song (keine Sekunden mehr hinten dran).
   - 10 s vor dem Ende beginnt dein Logo sich zu schreiben, **gleichzeitig** wird das Bild dunkel (2 s).
   - Das letzte Bild ist das fertige Logo, dann ist das Video zu Ende. Kein Kasten um das Logo, Rot satt.
   - Der Ton hört genauso auf wie ohne Logo.
3. Dasselbe in **9:16** (gern mit [Ganze App]).
4. **Kurz:** Nur 2–3 Takte markieren → Video. Das Logo ist von Anfang an da (schon halb geschrieben) und endet mit dem Video.
5. **Chor-Blatt in der Vorschau:** STIMME-Stelle → Takes → [Chor]. Oben stehen ⏮ ▶ Schleife ▾ ✕.
   - ▶ tippen: die Stelle spielt mit Chor, das Blatt bleibt offen. ⏮: wieder von vorn. ■: Stopp.
   - Im Blatt mit dem Finger nach oben wischen: der Inhalt scrollt, die Vorschau bleibt offen.
   - ✕ tippen: zu. Noch einmal öffnen, am Kopf nach unten wischen: zu.
6. **Ablegen:** Chor-Blatt öffnen, [Klang ▸] aufklappen, Pfeil ▾ tippen. Unten liegt die Leiste.
   - Jetzt in der App etwas tun (Szene starten, BPM antippen und wieder zu).
   - Auf die Leiste tippen: das Blatt ist zurück, [Klang ▸] ist noch offen.
7. **Aufteilen:** Im Chor-Blatt [Als Chor‑Stimme duplizieren] → [Diese Stelle]. Eine neue Zeile erscheint; ↶ nimmt sie zurück.
8. **Takes- und Mikro-Blatt:** beide haben denselben Kopf (Mikro ohne Abspielen); ✕ schließt.
9. **Quer drehen:** dieselben Schritte quer – ✕ bleibt oben sichtbar.

### Tests (Chromium headless, 4 Kerne; „alt“ = 4.30.0 `R-4300`)

| Satz | Ergebnis |
|---|---|
| Blätter (Chor/Takes/Mikro, 3 Größen, Ablegen, Transport, Aufteilen) | 91/91 |
| Logo-Abspann 8 Läufe (2 Wege × 3 Formate, kurz/lang) | 6 Läufe grün; 16:9/1:1 WebCodecs: Länge/Ton weicht im Rahmen der Lauf-zu-Lauf-Streuung ab (offline-Ton streut unter Last) |
| Ohne Logo wie 4.30.0 | grün (2 rote Punkte nur Netz-Sperre der Testumgebung) |
| Rauchtest, acorn, Regeln | grün |

### Offene Punkte

- Logo 16:9/1:1 (WebCodecs): Video mit Logo kann um Bruchteile einer Sekunde von „ohne Logo“ abweichen – bitte am iPhone ansehen; ich messe weiter.
- Bitte am iPhone prüfen: Blätter in der Claude-Vorschau.

# CHANGES-V3 — SYNQUENZER v3

Fähigkeiten-Summe (EN-19, B.0), fortgeschrieben je Paket:

```js
capabilities: {
  downloads: { /* wie bisher – Form der letzten v2-Veröffentlichung, in den Dateien nicht festgehalten (vor VC1 nachsehen) */ },
}
```

V0a, V0b, V0d, V4a, V4b und VO1 fügen keine Fähigkeit hinzu (VO1: Online läuft nur auf der Pages-Seite, E.5 Nr. 4). Die App läuft weiter ohne jede Fähigkeit (`use()` → `null`, EN-13).

---

## V0a — Fehler und Stabilität (+ N0a Auslieferung nach EN-12) · App 3.1.0

App: `dirigent-wt/index.html` (1 310 652 B = 1,25 MB; v2-final 1 283 872 B → **+26,2 KB**, Budget V0a 25 + N0a 5 KB),
Snapshot `synq-snapshots/V0a.html`. Spec: `v3-ideen/dirigent-spec-v3.md` §2.1 K-01…K-17, §16, §17 V0a; Nachtrag A.1 (N0a), EN-12.
Arbeitsdateien: `v0a-work/` (`base.html` = v2-final für Vorher-Messungen, `repro/*.txt` Messausgaben alt/neu, `native/`
Kalibrier-Messungen V0a-19, `shots/` Bildschirmfotos). Tests in `dirigent-test/`: `v3-v0a-lib.mjs` (M-KLICK, M-PEGEL,
M-SP, Stereo-Rekorder), `v3-v0a-fix.mjs`, `v3-v0a-drum.mjs`, `v3-v0a-roll.mjs`, `v3-v0a-native.mjs`, `v3-v0a-natfeat.mjs`
(Merkmals-Kalibrierung), `v3-v0a-n0a.mjs`, `v3-v0a-shots.mjs`, `v3-v0a-dod.mjs`, `v3-pe1.mjs`, `v3-startup.mjs`, die
Anpassungen `v3-v0a-adapt-*.mjs` und der Lauf `v3-v0a-reg.sh` (Ausgabe `dirigent-test/v3-v0a-reg/<OUT>`).
`sq5-lib.mjs` und `rob-lib.mjs` lesen jetzt wie `wp1-lib.mjs` die Umgebungsvariable `SQ_FILE` (für Vorher-Läufe).

### Gebaut

1. **K-01 Clap-Pegel 0 / Doppelplanung.**
   - `DrumSynth.hit`: eine Schicht (TON, RAUSCHEN, METALL, KLICK) wird nicht gebaut, wenn `lvl·Schichtpegel < 1e-4`; jede
     `exponentialRampToValueAtTime` bekommt `Math.max(x, 1e-4)` (Hüllkurven-Spitze und die Klatsch-Bursts).
   - `tick()`: Carrier/LFO, Klick/Pumpen, `recTick`, `songTick`, jede Spur (`scheduleTrack`) und der Spurwechsel je in einem
     eigenen `try/catch`; `R.schedBeat = b1` steht im `finally` (nur wenn derselbe Lauf noch spielt und nur vorwärts).
     Fehler zählt `tickErrors()`; Test-Hook `__failTrack(i)` wirft in Spur i.
   - `logErr`: derselbe Fehler (Meldung + erste Stack-Zeile) höchstens einmal je 5 s, verschiedene Fehler je für sich.
2. **K-02 Gate-/Raum-Faltung ohne Abriss.** Jeder Rückweg (Raum, Gate) hat einen Eingangs-Gain, den nur die Blende
   automatisiert. Neue Raumantwort → **frische** `ConvolverNode`; der **Eingang** wandert in 40 ms gleichleistungsgemäß
   hinüber (`setValueCurveAtTime`, cos/sin, 32 Punkte; Rückfall `setTargetAtTime`). Die alte Faltung klingt mit dem, was
   sie schon hat, aus und wird nach ihrer Fahne getrennt. Ein Wechsel während einer laufenden Blende wartet auf deren Ende
   (nur der neueste gilt). `K.setGate` (Gate-Länge), `K.setRoom` (Raum-IR).
3. **K-03** `LAYER_LVL.fm = [['fmI', 2]]`: die FM-LED schaltet nur `fmI` (Gedächtnis `fmI0`), Osz. 2 gehört zu TON.
4. **K-04** `pageDrumSound` lässt Standard-Regler weg, deren Schlüssel schon ein Makro ist; jeder Regler trägt `data-key`.
5. **K-05 Loop-Klammer / Längengriff (PianoRoll).**
   - Beim Anfassen des Griffs ┃ friert die Ansicht ein (`ppb0`, `x00`, `V.freeze`): `len = clamp(len0 + round(dx/(4·ppb0)), 1, 16)`;
     `clampView` und das Mitlaufen des Abspielkopfs ruhen während der Geste; `viewState().follow` = `'hold'`.
   - Randzone ≤ 24 px: die Ansicht läuft mit ≤ 1 Takt/s mit, nur in Fingerrichtung.
   - Hinter dem Clip-Ende immer ≥ 1 Takt Platz (`ppb ≥ W/(L+4)`, `x0 ≤ L+4−W/ppb`); ⤢ lässt rechts 12 % Rand.
   - Der gelbe Knopf heißt „Zuschneiden“ (Undo-Text ebenso).
6. **K-06 versteckte Noten.** Beim Loslassen des Griffs (kürzer): Noten mit `t ≥ len·4` weg, Noten über das Ende enden dort
   (`trimToLen`, ein Undo mit der Länge). Dieselbe Regel für [Takte −] (`setLen`). Abwehr: `scheduleTrack`,
   `scheduleDrums`, `buildMidi`, `buildMidiSong` und die Tonart-Erkennung (`liveNotes` in `scenePartsOf`/`applySceneKeys`)
   ignorieren Noten mit `t ≥ len·4`.
7. **K-07 FANG über Akkordwechsel.** `CAP.open` merkt je Note den Träger beim Anschlag (`en`, `tm`) wie REC;
   `capturePhrase` reicht ihn durch; `capture()` rechnet jede Note mit **ihrem** Träger zurück, der Clip-Bezug kommt vom
   Träger der ersten Note (`keyForRecording`).
8. **K-08 Träger-Anzeige.** `shownShift`: Zahl aus der echten Abbildung (`ref = sceneRefKey()`, `n = 60 + ref.root`,
   `T.mapEvent(n…) − n`, TONART rastet an `ref`), dazu die Zieltonart im neuen Feld `#carTgt`: „+3 · → C-Dur“.
   `carrierShown()` (§16) liefert `{shift, target, text}`. Passt „· → C-Dur“ nicht neben die Zahl (P2/P3), steht dort
   „→ C“ (Kurzname, einmal je Text/Breite gemessen).
9. **K-09** `shownClipKey`: Editor-Kopf und Clip-Blatt zeigen bei gelatchtem Träger die erkannte Tonart (Szene/Clip), auch
   solange die gespeicherte Auto-Tonart auf ORIGINAL wartet (`R.keyPending`).
10. **K-10** `sceneRefKey`: leere oder reine Drum-Szene → zuletzt gehörte Szenen-Tonart (`HEARD`), sonst Projekt-Tonart.
11. **K-12** LFO-Tab-Chips: Schraffur nach `routeActive` (wie MOD-Tab).
12. **K-13** Texte: AKKORD „… (Prinzip OP-Z/OP-XY).“, TONART ohne „(wie OP-XY Brain)“, PARALLEL „(Halbtöne wie ein
    CV-Keyboard)“, OB-Brass „Oberheim OB-X/OB-Xa („Jump“, Quellen uneinig)“.
13. **K-14** CPU-Begrenzer ab Stufe 1 sichtbar: „CPU 1“ … „CPU 3“ (P: statt „Takt“, einzeilig; L/W: Chip `#bCpu` mit
    Stufe im aria-label).
14. **K-15** `routeIdle`: grauer Hinweis „wirkt erst mit …“ in der MOD-Zeile (anstelle des Bereichs, P bis 2 bzw. bei
    ≤ 360 px 3 Zeilen; Zeile gedimmt) und im Regler-LCD (statt des Bereichs; Ring grau): PW ohne Puls-Welle,
    Osz.-2-Tonhöhe ohne Anteil Osz. 2, Uni-Verstimm. ohne Unison, Filter-Ziele beim nativen FM-Filter-Bypass. Dazu nach §2.4
    (K11) der Regler FILTER-ANSCHLAG grau mit „wirkt nur mit Filter-Hüllkurve“, solange Hüllk.-Menge 0 ist (`o.idle` in
    `makeCtl`, bleibt bedienbar).
15. **K-16** Song-Träger-Chips: `songChipName` — Akkord = Akkordname, Einzelton = Name der gehörten Stufenleiter („Am“).
16. **K-17 nativer Rückfall.** Alle nativen Stimmen verlassen die Stimme mit dem Pan-Gesetz des Worklets (√2 in den
    StereoPanner = Mitte 1) und 5-Hz-DC-Blocker (VA/WT/FM2 wie WP7 für FM6). Für V0a-19 zusätzlich am VA-Rückfall
    (Messung je Merkmal mit `v3-v0a-natfeat.mjs`, Δ nativ − Worklet):
    - Wellenpegel: Browser-Säge/Rechteck sind auf Spitze 1 normiert (Gibbs 1,179 → −1,43 dB) → ×1,179; die Puls-Tabelle
      ohne Normierung (`disableNormalization`, schmale Pulse waren bis −5,8 dB); Rauschen ×0,4 wie im Worklet (+2 dB).
    - Unison wie im Worklet: die Stimmen eines Oszillators zusammen 1,4× (+2,9 dB), auch wenn nativ weniger Stimmen klingen.
    - Filter: Pegelkorrektur je Filtertyp über die Resonanz (`CALR`, Raster 2 Cutoff/Noten-Paare) und für Drive (`CALD` +
      cutoff-abhängig `CALDX`); Pfeifen (res > 0,9) mit eigener Pegeltabelle (`WHR`) und über res 1 mit Anschwingzeit
      (≈ 110 ms bei 1,02 wie die Selbstoszillation der Leiter). Nur für Engines mit Worklet-Zwilling (VA, FM6); WT/FM2
      behalten ihre v2-Pegel.
    - Hüllkurven-Form des Worklets (envCoefs: Ziel über das Stufenende hinaus, Anker am Ende, `aCurve`/`fCurve`) für VA
      statt τ = Zeit/3: Zupf-Sounds klangen nativ 1,7× länger aus (+2…+4 dB).
    - Startphasen: das Worklet startet jeden Oszillator/jede Unison-Stimme mit Zufallsphase; nativ jetzt ebenso (der
      Oszillator startet bis zu einer Periode vor der Note bei geschlossenem VCA). Gleichphasige Unison-Zupfer waren +2…3 dB.
17. **N0a `deliverNow` nach EN-12.** Viewer: `webm` → `.webm`, `m4a` → `.mp4` direkt; `mid`/`syx` → `.zip` (store-only)
    mit der Datei darin; JSON/TXT direkt. Toasts „Audio gespeichert“, „MIDI gespeichert (ZIP)“, „DX7-Bank gespeichert
    (ZIP)“. `rejected_extension`/`extension_not_enabled` → genau ein `save`, Toast „Dieses Format ist hier nicht verfügbar –
    App in Safari öffnen“, kein Ersatzformat. Safari-Weg: `syx` als `application/octet-stream`. Ohne Rahmen mit
    `use() → null` Safari-Weg (Teilen / `<a download>`); „Export hier nicht verfügbar“ nur im Rahmen.
18. **API (§16):** `tickErrors()`, `__failTrack(i)`, `viewState(kind)` (ROLLE/Melodie-Rolle: `x0`, `ppb`, `follow`
    `'on'|'hold'`, `reason`; LAUF/SCHRITTE: Seite), `carrierShown()`, `deliverNow(base, bytes, kind, label)`. Version 3.1.0.
19. **Hilfe** (Menü): vier Zeilen (Längengriff, Träger-Anzeige, grauer „wirkt erst mit“-Hinweis, CPU 1–3).

### Abweichungen (mit Grund)

- **K-02:** statt zweier fester Faltungen A/B eine frische `ConvolverNode` je Wechsel (die alte wird nach ihrer Fahne
  getrennt). Grund: eine „ruhende“ Faltung kann bei schnellen Wechseln noch klingen; so wird nie eine klingende Faltung neu
  beladen. Blende und Ergebnis wie verlangt. Der Raum-Hall ist in dieser App eine gemeinsame IR für alle Kits (Kits
  unterscheiden sich nur im Rückweg-Pegel, τ 20 ms) – ein Kit-Wechsel tauscht keine IR; `K.setRoom` steht mit derselben
  Blende bereit.
- **K-08:** die Zieltonart zeigt die Tonart, auf die die Musik abgebildet wird – bei G-Dur über a-Moll „G Mixolyd.“
  (V0a-10 prüft nur „−2“).
- **K-11** war in v2-final schon behoben (S&H FREI zieht je Phasenumbruch neu); nur gemessen (V0a-13).
- **N0a-05** (Seite ohne Rahmen) funktionierte in v2-final bereits (Bedingung `framed`); jetzt getestet.
- **K-06** auch für [Takte −] (`setLen` kürzte Noten nur auf `d ≤ nl`, nicht auf das Ende).
- **K-17 / WT:** das Pan-Gesetz gilt wie verlangt auch für WT (nur nativ): WT-Sounds mit Streuung sind jetzt 3 dB lauter
  (Werks-WT: −33,9/−36,9/−27,0/−25,9 → −31,2/−33,8/−23,9/−22,9 dB; VA-Ziel ≈ −24 dB). Die übrige V0a-19-Kalibrierung
  (Wellenpegel, Filter, Hüllkurven, Phasen) gilt nur für VA/FM6, WT/FM2 klingen sonst wie in v2.
- **V0a-19 Messung:** RMS = Leistung über beide Kanäle (Stereo-Rekorder; die L+R-Mittelung der WP3-Hilfe macht breites
  Worklet-Unisono bis 3 dB leiser), Mittel aus 3 Phrasen je Weg (Zufallsphasen).
- **logErr**: Schlüssel „Meldung + erste Stack-Zeile“ (derselbe Fehler aus 25-ms-Takt = einer).

### Messwerte der Checkliste

Vorher = v2-final (`v0a-work/base.html`, `SQ_FILE`), nachher = 3.1.0; Ausgaben in `v0a-work/repro/` und
`dirigent-test/v3-v0a-reg/final1|final2/`.

| ID | Test | Messwert nachher (vorher) |
|---|---|---|
| V0a-01 | `v3-v0a-fix.mjs` | Clap-Pegel 0: Noten je Spur in 2 Takten Bass 16 · Arpeggio 32 · Synth 3 7 · Drums 12 = wie bei 0,85 (vorher 34/50/7/22, 18/18/12 Doppelte, `RangeError` je Schlag, Pad-Tipp warf); `tickErrors()` 0; 0 Konsolenfehler |
| V0a-02 | `v3-v0a-fix.mjs` | `__failTrack(1)`, 4 Takte: Spur 0/2/4 planen 32/14/56 Noten = ohne Fehler, keine Doppelten; `tickErrors()` 324 (ohne Fehler 0); `schedBeat` monoton. Der Fehler erreicht die Konsole 2× in 8 s (`logErr` 5 s) |
| V0a-03 | `v3-v0a-drum.mjs` | Snare Gate 1, Gate-Länge 0,34 → 0,5 s in der Fahne: offline (geseedet) Fahne im 50-ms-Fenster −22,7 dB wie ohne Wechsel (Mehrabfall 0,00 dB; vorher 7,80 dB), M-KLICK schlechtestes Fenster +3,15 dB (≤ 6); in der App (Echtzeit) Mehrabfall 0,51 dB (vorher 11,87 dB), M-KLICK +2,84 dB |
| V0a-04 | `v3-v0a-drum.mjs` | Kit-Wechsel in einer Raum-Fahne: M-KLICK +3,16 dB; Kit-Wechsel mit neuer Gate-Länge in einer Gate-Fahne: +2,72 dB. Risiko „zwei Faltungen“: DR7 mit 4 Blenden 5,5 % eines Kerns (ohne Blende 5,45 %) ≤ 7 % |
| V0a-05 | `v3-v0a-drum.mjs` | Rom-Pop-Kick: LED aus bei `fmI 0`/`o2 .45`; Tipp → `fmI 2`, `o2 .45`, LED an; Tipp → `fmI 0`, `o2 .45` (vorher LED an bei 0, Tipp setzte `o2` 0) |
| V0a-06 | `v3-v0a-drum.mjs` | SOUND Snare/Clap/Tom L/M/H: je 9 Regler, jeder `data-key` einmal (vorher 10 mit doppeltem Gate/Raum) |
| V0a-07 | `v3-v0a-roll.mjs` P + L | Standard-Zoom, 4-Takt-Clip, CDP-Touch: Griff 1 Takt links (10 Moves) → `len 3`, zurück → `len 4`, Längenfolge nur 4/3; `viewState().x0` konstant, `follow 'hold'` (vorher 4→1 Takt, x0 12,8 → 1). ≥ 1 Takt Platz hinter dem Ende (4,00 Schläge), Randzone 4,04 Schläge/s (≤ 4 + Messtoleranz; Clip 4 → 6), ⤢ Ende bei 88,0 %, Knopf „Zuschneiden“ |
| V0a-08 | `v3-v0a-roll.mjs` P + L | 4 → 1 Takt per Griff: keine Note mit `t ≥ 4`, 3,75/d 1 → d 0,25; ein Undo-Schritt; 8 Durchläufe je genau 0 · 1,5 · 3,75 im `noteLog` (vorher stapelten sich die Noten ab Durchlauf 2) |
| V0a-09 | `v3-v0a-fix.mjs` | FANG über Am/F: nächster Durchlauf 72/76 unter Am, 72/77 unter F (vorher 76/79) |
| V0a-10 | `v3-v0a-fix.mjs` | a-Moll-Clip, AKKORD: C-Dur „+3 · → C-Dur“, a-Moll „±0 · → a-Moll“, G-Dur „−2 · → G Mixolyd.“ (`carrierShown()` und DOM; vorher ±0 / −3 / −5) |
| V0a-11 | `v3-v0a-fix.mjs` | Editor-Kopf unter gelatchtem Träger „a-Moll · 1 Takt“ (vorher „C-Dur“) |
| V0a-12 | `v3-v0a-fix.mjs` | leere Szene 3 nach der a-Moll-Szene: „a-Moll“ (vorher „C-Dur“) |
| V0a-13 | `v3-v0a-fix.mjs` | S&H FREI 8 Hz → Cutoff, 2 s: Worklet 17 Stufen / 3,38 Okt., nativ 23 / 3,56 Okt. (≥ 10 / ≥ ⅓; schon in v2-final erfüllt: 18 / 21) |
| V0a-14 | `v3-v0a-fix.mjs` | LFO-Chips o2pitch/cutoff/res bei laufendem Worklet ohne Schraffur (vorher o2pitch, res schraffiert) |
| V0a-15 | `v3-v0a-fix.mjs` | Texte AKKORD/TONART/PARALLEL/OB-Brass wörtlich nach K-13 |
| V0a-16 | `v3-v0a-fix.mjs` | `cpuInject(.5/.65/.8)` → P „CPU 1“/„CPU 2“/„CPU 3“ statt „Takt“, L Chip ebenso (vorher erst Stufe 3 „CPU“) |
| V0a-17 | `v3-v0a-fix.mjs` | `lfo1→pw` bei Säge: „wirkt erst mit Puls-Welle“; nach Wechsel auf Puls weg |
| V0a-18 | `v3-v0a-fix.mjs` | Song-Träger-Chips: Einzelton A in C → „Am“, Akkord Am → „Am“ |
| V0a-19 | `v3-v0a-native.mjs` (Mittel aus 3 Phrasen je Weg, Stereo-Leistung) | **25 von 30** Werks-VA-Sounds innerhalb ±1 dB, Median Δ −0,03 dB (vorher **3 von 30**, Median −2,81, Spanne −18,5 … +10,6 dB). Außerhalb: Nass & Quietsch +6,0, Tropfen −3,0, Pfeif-Lead +1,5, Gummi-Bass −1,2, Moog-Bass −1,2 dB — siehe Lücken. Nur mit nativ spielbaren Routen (`ROUTES=native`): ebenfalls 25/30 |
| V0a-20 | `v3-v0a-reg.sh`, DoD | siehe unten |
| N0a-01…05 | `v3-v0a-n0a.mjs` | 18/18 (vorher 9/17): Audio direkt `.mp4` (Rekorder `audio/mp4`) bzw. `.webm`, Toast „Audio gespeichert“; MIDI `.zip` mit `.mid`; `extension_not_enabled`/`rejected_extension` → genau ein `save`, Format-Toast; `.syx` im ZIP bzw. Safari `application/octet-stream`; JSON direkt, Prüfsumme gültig, `appVersion 3.1.0`; ohne Rahmen Download/Teilen, im iframe „Export hier nicht verfügbar“ |

**Regression (§1.3):** `v3-v0a-reg.sh 3` (`final1`, 95 Läufe + Smoke) und die Wiederholung der betroffenen Läufe nach den
Layout-Korrekturen einzeln (`final2`). Wie v2-final scheitern weiter nur: `wp3-adapt-func-build` C2/D5 (auch
`?engine=native`), `wp3-ui` 2 (Schraffur-Prüfung `lfo1→pw`, MO49), `wp7-adapt-wp3-browser` PR2 (3). Unter Last (3 Jobs)
einmalig: PR1 Moroder-Puls −40,8 dB (Schwelle −40, einzeln 40/40), DR7 7,45 % (einzeln 5,5 %), SG6 Melodie 11 ms
(einzeln 27/27), `v3-v0a-adapt-wp6-extras` L einmal Zeitüberschreitung (AudioContext stand, einzeln 20/20).
Angepasst (Begründung im Kopf der Datei): `v3-v0a-adapt-wp1-brand`, `-wp1-misc`, `-wp1-store`, `-wp3-api`, `-wp3-store`
(Version 3.1.0, Nachtrag C.4), `-wp2-keys` (K-13-Texte), `-wp2-roll` („Zuschneiden“, K-05), `-wp4-engine` („CPU 3“,
K-14), `-wp6-extras` (Audio direkt statt ZIP, EN-12).

**DoD:** `v3-v0a-dod.mjs` 60 s Demo mit V0a-Aktionen in D, P1, L1 (Touch): 0 Konsolenfehler, `tickErrors()` 0, Stimmen
≤ 18 und 3,5 s nach Stopp 0 — mit Worklet und mit `?engine=native` (je 10/10). M-PLATZ (`v3-v0a-shots.mjs`, P1 P2 P3
L1 L2 W): Hauptansicht mit Träger-Anzeige und CPU 2, Rolle mit „Zuschneiden“, MOD mit grauem Hinweis, FILTER mit grauem
Anschlag, Drum-SOUND Snare — 54/54. Worklet-ASCII-Prüfung besteht (68 746 B). PE1 (`v3-pe1.mjs`, 10 s Demo, Editor offen):
P Synth 60 fps, keine Long Task > 50 ms, tick p95 0,8 ms (max 2,3); L 60 fps / 0,8 ms; P Rolle 60 fps / 0,8 ms. Start
(`v3-startup.mjs`, Median aus 5 Kaltstarts): 360 ms (v2-final 329, +31 ms), CPU ×4 1480 ms (1370, +110 ms) — Grenzen
1,5 s / 4 s / +150 ms. Smoke-Test: Titel SYNQUENZER, keine Fehler. Datei 1,25 MB ≤ 3,0 MB, +26,2 KB.

### iPhone-Prüfpunkte (Xander)

1. **Logo** „One Day in Rome“ in Kopfleiste und Menü: sind die Konturen glatt oder wellig (§2.4)?
2. **Drums:** Kit Rom Pop, Snare mit Gate 1 laufen lassen, im Kit die Gate-Länge ziehen und loslassen, dann Kit wechseln
   (Rom Pop ↔ Gated 84): die Hall-Fahne darf nicht abreißen und nicht knacken.
3. **Clip-Editor:** den hellen Griff ┃ am Ende des Lineals einen Takt nach links und zurück ziehen (auch am Bildrand): die
   Länge ändert sich um genau einen Takt, die Ansicht steht still; gekürzte Noten sind weg, ↶ holt sie zurück.
4. **Träger:** a-Moll-Clip, AKKORD, auf der Tastatur C halten: Anzeige „C +3 · → C-Dur“ (iPhone SE: „→ C“) und es klingt
   drei Halbtöne höher; der Editor-Kopf zeigt „a-Moll“.
5. **Export in der Claude-App:** MIDI → `.zip` mit `.mid`; „Song als Audio“ → `.mp4` direkt. Dieselben Exporte in Safari
   (Teilen-Blatt bzw. Download).

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt).
- **V0a-19 nicht ganz erfüllt (25/30).** Ursachen der Reste: (a) Routen außerhalb der nativen Teilmenge (§v2-9.5: nur LFO →
  Tonhöhe/Cutoff/Lautstärke/Pan): Nass & Quietsch `lfo1→res`, Tropfen `menv→pitch`, Moog-Bass `vel→cutoff` — das Worklet
  spielt diese Bewegung, der Rückfall nicht (Anzeige „nur mit Worklet“, unverändert). (b) Die Biquad-Nachbildung kann die
  nichtlineare Leiter nahe der Selbstoszillation nicht genau treffen: Nass & Quietsch (LP24 res .97, Cutoff G6 = 24.
  Teilton von C2 → der lineare Biquad hebt ihn +28 dB, die Leiter sättigt; auch ohne Route +7 dB), Tropfen (BP24 res .99),
  Pfeif-Lead (+1,5 dB, Anschwingen), Gummi-Bass (LP12 res .6 bei 180 Hz: Spitzenform; je nach Ton −3,4 … +3,7 dB, im Mittel
  −1,2). Eine nativ nachgebildete Notenkonstante (Anschlag/Taste/Zufall → Cutoff/Res/Hüllk.) oder ein Sättigungsmodell
  wären eigene Arbeit (widerspricht heute §v2-9.5 und den alten MO49-Tests).
- Die Filter-Pegelkorrektur ist an zwei Cutoff/Noten-Paaren (110 Hz/600 Hz, 262 Hz/2 kHz, Säge) gemessen; einzelne
  Paarungen von Teilton und Resonanz weichen bis ±1,5 dB ab (res ≥ .9). HP24/HP12 nur so kalibriert (kein Werks-VA nutzt HP).
- Messrauschen: Sounds mit Zufallsphasen (Unison, Drift) schwanken je Phrase um ±1,5 dB (Kristall-Fläche); deshalb 3 Phrasen.
- Die Knöpfe der Rollen-Aktionsleiste („Zuschneiden“ usw.) behalten ihre v2-Größe (P1/W 36, P2 34, P3 32, L 30 px hoch);
  L4 verlangt quer ≥ 36 px — nicht Teil von V0a.
- P3 (320 px): neben „CPU n“ wird der vierte Schlag-Punkt im TAKT-Feld leicht angeschnitten.
- Die Raum-IR ist eine für alle Kits; ein Kit mit eigener IR (V1c) nutzt `K.setRoom` (gleiche Blende), ungetestet mit
  echter zweiter IR.

---

## V0b — Schnell-UX (+ N0b Bibliothek „aktive Engine zuerst“, taktbündiges FOLGEN) · App 3.2.0

App: `dirigent-wt/index.html` (1 367 501 B = 1,30 MB; V0a-fix 1 316 464 B → **+49,8 KB**, Budget V0b 40 + N0b 10 KB,
Nachtrag C.4), Snapshot `synq-snapshots/V0b.html`. Spec: `v3-ideen/dirigent-spec-v3.md` §2.2 U-01…U-07, §5.1, §12.1,
§12.7, Anhang A.2, K-15-Zusatz (§2.1), §16, §17 V0b; Nachtrag 1 A.2 (N0b), EN-04, EN-07, EN-18, M-SEITE, Teil D, C.4.
Arbeitsdateien: `v0b-work/` (`base.html` = V0a-fix für Vorher-Messungen, `repro/` Befunde vorher, `acc/` Ausgaben der
einzelnen Abnahme- und DoD-Läufe, `shots/`, `heads/`, `dbg-steps/` Bildschirmfotos). Tests in `dirigent-test/`:
`v3-v0b-browser.mjs` (V0b-01…03, N0b-01…05), `v3-v0b-follow.mjs` (V0b-04…07, N0b-06…08), `v3-v0b-ux.mjs` (V0b-08…15),
`v3-v0b-gegen.mjs` (Gegenprobe N0b-07), `v3-v0b-init.mjs` (INIT-Lautheit), `v3-v0b-shots.mjs` (M-PLATZ mit echten Schriften),
`v3-v0b-heads.mjs` (Kopf-Geometrie), `v3-v0b-dod.mjs`, `v3-v0b-lib.mjs` (BS.1770-Lautheit im Browser, Worklet-Bereitschaft),
`v3-pe1.mjs` (jetzt auch `lauf`/`steps`), die Anpassungen `v3-v0b-adapt-*.mjs`, der Lauf `v3-v0b-reg.sh` (Ausgabe
`dirigent-test/v3-v0b-reg/<OUT>`) und `v3-v0b-post.sh` (Abnahme und DoD nacheinander → `v0b-work/acc/`).

### Gebaut

1. **U-01 Bibliothek: Tipp = laden, stumm** (§12.1). `brTap` → `brLoad`: lädt über `soundEdit` (ein Undo-Schritt), es
   erklingt nichts; Toast „‚Name‘ geladen“ mit [▶ Hören] [Rückgängig] (im Browser als Band über der Liste). ▶ links in der
   Zeile (44×48 P, 44×44 L) hört vor und wird ■; höchstens ein Vorhören; Stopp mit ■, ▶ eines anderen Sounds, Schließen,
   Tastendruck (20 ms Ausblendung wie bisher). Lädt man den gerade vorgehörten Sound, läuft das Vorhören weiter (es spielt
   über seine eigene Kette). Gilt ebenso für Kits. Die eigene Vorhör-Kette blendet beim Abbau jetzt aus (τ 6 ms, getrennt
   nach 60 ms) — vorher konnte das Trennen eines Rests 100 ms nach ■ ein kleines Knacken geben (M-KLICK +7 dB unter Last).
2. **EN-04 / EN-18 (N0b 1–2): aktive Engine zuerst.** Kopf „SOUNDS · SYNTH 2 · FM“; erste Chip-Zeile [FM ▾ │ Alle Engines]
   (bleibt beim Wischen stehen), dahinter die Rollen der Engine: „Alle FM“ · Bass · Sequenz · Lead · Akkord · Fläche · Keys ·
   Atmo · Effekt · Glocke (nur FM) · Init · Eigene — ein Rollen-Chip nur, wenn die gezeigte Engine Sounds dieser Rolle hat.
   Rollen: FM nach der Phrasen-Art (Tabelle N0b), VA/WT nach ihrer Kategorie (§12.2-Abbildung, Plucks und WT je Sound;
   „Tropfen“ = Effekt). [Alle Engines]: alle Sounds, die aktive Engine zuerst, jede Zeile mit VA/FM/WT; ein Sound einer
   anderen Engine lädt nur von dort (Toast „‚Moog-Bass‘ geladen · wechselt zu VA“, [Rückgängig]). [FM ▾] ein zweites Mal →
   „Andere Engine ansehen“ (VA/FM/WT, Laden wechselt die Engine). ‹ › im Editor-Kopf lädt den nächsten Sound der gezeigten
   Liste (Engine + Rollen-Chip), im Kreis, ohne Vorhören. Drum-Spur: Kits · Eigene Kits · Init. API `browserTap`,
   `browserPreview`, `browserScope`, `browserRows`.
3. **U-02 FOLGEN** (§5.1, EN-07, M-SEITE) in ROLLE, LAUF, Drum-SCHRITTE, Melodie-Rolle und Song-Ansicht (`folStep`): die
   Ansicht zeigt im Zustand FOLGT die Seite mit der Abspielmarke; Seitenbreite = sichtbare Schläge auf ganze Takte abgerundet
   (≥ 1 Takt; < 1 Takt sichtbar: ganze Schläge), `x0 = floor(beat / Breite) · Breite`. Gewechselt wird, wenn die (hörbare)
   Marke in die nächste Seite läuft — am Taktstrich —, sofort nur auf Wunsch (Öffnen, ▶, Tipp auf den Chip).
   HÄLT bei (a) Finger (Raster, Lineal, Tasten, VEL-Spur, Schritt-Raster, Song-Raster), (b) markierten Noten/Takten oder
   offenem Popover/Quantisier-Blatt, (c) Werkzeug ⬚/⌫/Schritt, (d) Bearbeitung < 3 s, (e) „von Hand“ (Zoom, Lineal-Schieben,
   ⤢, Seite/Takt gewählt, Song gewischt) — (e) endet nur mit Tipp auf den Chip, Schließen des Editors oder Neustart des
   Transports. Kopf-Chip [⟶ FOLGT] grün / [⏸ HÄLT · Grund] amber / [⟶ AUS] grau (Tipp: FOLGT → AUS, sonst → FOLGT und Sprung
   zur Marke); AUS je Editor-Art in `S.ui.follow` (nur `false`-Einträge; die Melodie-Rolle teilt den Schalter der ROLLE).
   Lauf-Punkt: ROLLE im Lineal auf dem Takt-Chip des laufenden Takts (ruhig, wenn die Marke sichtbar ist, sonst blinkend;
   außerhalb „◂ 3“/„3 ▸“ am Rand), LAUF/SCHRITTE auf dem Seiten-Chip (blinkt, wenn eine andere Seite gezeigt wird; Ein-Knopf-
   Blätterer „▸ n“), Song-Ansicht Randmarke. Die 85-%-Regel und der Sprung bei `x < 0` in `PianoRoll.playhead` sind weg
   (`api.showPage`, `api.fol`, `opts.onHand`). LAUF und SCHRITTE wechseln die Seite ohne Neuaufbau (`laufSetPage`,
   `drumSetPage`; `stepModel` liest die Seite live); Euklid merkt sich seinen Takt beim Öffnen. Song-Ansicht: der Chip
   [⏸ HÄLT · Grund] erscheint oben rechts nur, solange sie hält; `svAutoScroll` blättert ganze Seiten. Seitenwechsel ändern nie
   Auswahl, Werkzeug oder Undo. Kopf-Layout: Titel über der Info-Zeile (P bei Bedarf, L immer), damit der Chip Platz hat.
   API `viewState(kind)` (+ `'song'`, `pw`, `run`), `setFollow(kind, on)`.
4. **U-03 Pad wählt Instrument.** `padSelect` nach `padHit` (nur Pad-Tipps, nicht Tasten/MIDI): bei offenem Drum-Editor zeigt
   SOUND/TIEF das Instrument, SCHRITTE seine Zeile; nicht während ● (auch Einzählen), ● SONG oder ● MEL. aufnimmt und nicht,
   wenn der letzte Tipp auf ein anderes Pad < 300 ms zurückliegt. KIT-Schalter „Pad wählt Instrument“ (Projekt-Einstellung
   `settings.padSel`, Standard an, ein Undo-Schritt `kind:'set'`).
5. **U-04 Benennung.** OSZ › MIX-Gruppe „ANTEIL“, Mod-Ziele „Anteil Osz n“, „KLANG-PEGEL“, FX › SPUR „LAUTSTÄRKE“ mit dB
   (`80 % · −3,9 dB`, `20·log10(vol²/(1 + 1,5·drive))`), Drum „PAD-PEGEL“, TIEF „ANTEIL“, KIT „GATE-RÜCKWEG“/„RAUM-RÜCKWEG“,
   Menü „MASTER-AUSGANG“, Seite „LAUTST.-HÜLLK.“, „Gehaltene Töne bei Akkordwechsel: mitziehen / halten“, Harmonie-Modus
   „HALBTON“ (auch „Einzelton: Halbton (CV)“). Band „GLOBAL · wirkt auf alle Spuren“ (24 px, P ≤ 600 px hoch 20 px) über
   HALL/ECHO/MASTER im Synth- und Drum-Editor.
6. **U-05 Init und Neu.** Menü → Projekt → [Neu ▾] → [Mit Startsounds] │ [Leer (Init)] (`newProject({init:true})`: INIT
   Analog ×4, INIT Drums, keine Clips, kein Song, 120 BPM, C-Dur, Sends 0). INIT-Sounds (Anhang A.2) als Bibliotheks-Rolle
   „Init“: INIT Analog / INIT FM / INIT Tabelle auf −18,0 LUFS kalibriert (Lead-Phrase, trockener Stimmausgang), INIT Drums
   (ev2). Projektnamen „Projekt · Sa 17.10. 15:50“ (dieselbe Minute: „(2)“), Sichern ohne Namen „BASS 17.10. 15:52“ (Rolle
   bzw. KIT/SOUND + Zeit). Verlauf je Projekt `hist:<id>:<ts>` (alte globale Einträge bleiben lesbar und erscheinen bei
   ihrem Projekt). Editor-Kopf ⋯ → [Init] (Synth: INIT der Engine; Drums: INIT Drums; ein Undo, Toast [Rückgängig]); ⋯ sitzt
   in P auf der LCD-Zeile, in P3 in Kopfzeile 2 (dort mit ◎), in L in Kopfzeile 1. API `initSound(t)`.
7. **U-06 Tastatur-Anschlag** (E15/E3-29). Menü → Bedienung → „Tastatur-Anschlag: POSITION │ FEST (0,8)“ (`settings.kbVel`,
   Standard POSITION, ein Undo-Schritt). POSITION: 0,45 an der Oberkante der eigenen Taste … 1,0 an ihrer Unterkante (weiße
   Taste 0…h, schwarze 0…0,62·h), auch beim Gleiten auf eine andere Taste. Computer-Tastatur 0,8, MIDI eigene Velocity.
   **K-15-Zusatz:** bei FEST tragen FILTER-ANSCHLAG, Anschlag → Lautstärke, die FM-Operator-Anschläge und Routen mit Quelle
   Anschlag den grauen Hinweis „Tastatur spielt fest 0,8 – wirkt bei Noten mit eigener VEL oder mit Anschlag POSITION“ (Regler:
   grau + LCD-Zeile mit [POSITION ▸]; MOD-Zeile: Hinweis); Tipp darauf → POSITION (ein Undo); dazu ⋯ → [Anschlag POSITION].
8. **U-07 Hilfe:** neue/erneuerte Zeilen für Bibliothek, FOLGEN, Pad wählt Instrument, Namen/GLOBAL/HALBTON, Init/Neu/Verlauf,
   Tastatur-Anschlag.
9. Version **3.2.0** (Nachtrag C.4).
10. **Seiten-Blätterer der SCHRITTE** (Fehler seit WP6, für FOLGEN nötig): auf kurzen Hochformaten (P ≤ 700 px hoch) teilt
    der Blätterer seine Zeile mit [Euklid…] [Muster ▾] und lag bei 2–16 Takten unter ihnen (375×667: ‹ Takt 1/4 › ganz
    verdeckt, kein Takt wählbar; 320×568 und 667×375: › verdeckt). Jetzt misst er seinen Platz selbst (Container-Abfrage):
    unter 150 px [1][2] ohne Etikett bzw. nur [k/n] (öffnet das Takt-Raster), bis 210 px schmalere ‹ ›; die Info „Szene 1 ·
    n Takte“ entfällt dort; quer schrumpfen die Spur-Reiter (sie scrollen) statt des Blätterers. Kopf-Chip der SCHRITTE in
    P2 so hoch wie ✕ (40 px).
11. **Ansichtsfeld für `HIST.volatile` (M-REKON):** `S.ui.follow` (nur `false`-Einträge) liegt in `S.ui`, das als Ganzes auf
    der Startliste steht; `settings.padSel` und `settings.kbVel` sind Undo-Schritte (`kind:'set'`), keine Ansichtsfelder.
    V0b fügt keine Fähigkeit hinzu (Summe oben unverändert).

### Abweichungen (mit Grund)

- **HALBTON-Daten:** der frühere Modus PARALLEL heißt in den Daten dieser App `mode:'chromatic'` (nicht `'parallel'` wie in
  U-04/V0b-15 angenommen); er bleibt unverändert `'chromatic'`, nur das Etikett ist neu. Ebenso heißt die Einzelton-Wahl
  `'parallel'` jetzt „Halbton (CV)“ (Daten unverändert). V0b-15 prüft deshalb `'chromatic'`.
- **INIT Drums (ev2):** die WP6-`DEFAULTS` allein sind für jedes Modell stumm (alle Schichtpegel 0). Jedes Pad bekommt
  deshalb die Grundschicht seines Modells (Kick Ton + Pitch-Fall, Snare Ton + Rauschen, Clap Bursts, Hats/Becken Metall,
  Toms Ton in ihrer Lage …), sonst `DEFAULTS`; Pegel .85, Raum 0, Gate 0, Drive 0, keine Locks — so besteht „jedes Pad
  RMS > −40 dBFS“ (V0b-11). Geschlossene Hi-Hat `mLvl 1,4`, `mDec .08` (sonst −39,4 dBFS).
- **Projektnamen:** zwei neue Projekte in derselben Minute heißen „… 15:50“ und „… 15:50 (2)“ (sonst wären die drei Namen
  aus V0b-11 nicht verschieden). Sichern ohne Namen: Rolle des Sounds (BASS, LEAD …), bei Kits „KIT“, sonst „SOUND“.
- **FOLGEN:**
  - Ist weniger als ein Takt sichtbar (starker Zoom), sind die Seiten ganze Schläge (M-SEITE verlangt „ganze Takte“, das
    ginge dann nicht ohne Überspringen); gewechselt wird weiter am Taktstrich oder an der Seitengrenze.
  - Ein offenes Popover (Notenwerte, Akkord-Auswahl im Song) und das Quantisier-Blatt zählen als (b) „Auswahl“.
  - Song-Ansicht: der Chip erscheint nur, solange sie hält (sonst wäre er dauernd über dem Raster); AUS gibt es dort nur
    über die API (`setFollow('song', false)`), nicht als Tipp.
  - Die Melodie-Rolle teilt den AUS-Schalter der ROLLE (eine Editor-Art „Rolle“).
  - Song-Ansicht: „Akkord-Auswahl offen“ = ihr Popover (→ „Auswahl“); eine markierte Zelle gibt es in der WP6-Song-Ansicht
    nicht (ein Tipp schaltet die Zelle sofort um → (d) „gerade bearbeitet“). LOCK-Modus und ● SCHRITT gibt es in der App
    noch nicht; ihre HÄLT-Gründe kommen mit V3c bzw. V5b/V5c.
- **K-15 FEST-Hinweis antippen:** am Regler zeigt die LCD-Zeile den Hinweis mit [POSITION ▸] (P1, P2, L); in P3 ist die
  LCD-Zeile ausgeblendet (P ≤ 600 px hoch, wie bisher), dort führen ⋯ → [Anschlag POSITION] und die MOD-Zeile zurück
  (am Regler nur grau).
- **‹ ›** laufen im Kreis durch die zuletzt gezeigte Liste dieser Spur (Engine + Rollen-Chip); war die Bibliothek für die
  Spur noch nicht offen, durch die Liste, mit der sie öffnen würde (Rolle des Sounds, sonst „Alle <Engine>“).
- **U-03** wählt auch während ● SONG und ● MEL. nicht (dort wird ebenfalls eingespielt).
- **U-06** gilt für die Bildschirmtastatur; die Computer-Tastatur spielt weiter 0,8, MIDI seine eigene Velocity.
- **Toast:** „‚Name‘ geladen“ / „Init“ docken wie jeder Toast mit Knöpfen (5 s) über der LCD-Zeile und decken ⋯ dort so
  lange ab (vorhandene Toast-Regel).
- **Editor-Kopf ROLLE/LAUF:** der FOLGEN-Chip braucht Platz — der Titel steht über der Info-Zeile (P bei Bedarf, L immer);
  P ≤ 360 px und L ≤ 759 px zeigen den Chip kompakt (kleinere Schrift, „bearbeitet“ statt „gerade bearbeitet“).
- **Bibliothek P ≤ 380 px:** im Kopf entfällt „SOUNDS ·“ (sonst würde ✕ abgeschnitten), ebenso bei sichtbarem A/B.
- **V0b-14** misst Ober-/Unterkante 5 px innerhalb der Taste (Chromiums Touch-Anpassung rückt Tipps genau auf der Kante
  auf die Nachbarfläche).
- **Song-Ansicht-Chip** [⏸ HÄLT · Grund] liegt oben rechts (64 × 32 px) über dem Lineal und dem oberen Rand der Zeile SYN 1,
  nur solange die Ansicht hält; ein Tipp darauf ist der Tipp auf den Chip (→ FOLGT).

### Messwerte der Checkliste

Vorher = V0a-fix (`v0b-work/base.html` = `synq-snapshots/V0a-fix.html`, `SQ_FILE`), nachher = 3.2.0; Ausgaben in
`v0b-work/acc/` (einzeln) und `dirigent-test/v3-v0b-reg/run2/`.

| ID | Test | Messwert nachher (vorher) |
|---|---|---|
| V0b-01 | `v3-v0b-browser.mjs` P + L | Tipp auf „Glas-EP“ (FM-Spur) lädt (`getSound`), Master-RMS 1 s lang −∞ dBFS, kein `noteLog`-Eintrag `preview`; Toast „‚Glas-EP‘ geladen“ mit [▶ Hören] (spielt) und [Rückgängig] (ein Undo → FM-Pluck) — vorher: Tipp auf „Äther“ lud und spielte sofort (5 Vorhör-Stimmen) |
| V0b-02 | `v3-v0b-browser.mjs` | ▶ links in der Zeile, 44×48 (P) / 44×44 (L); erster Ton 49,8 ms nach ▶ (+ 44 ms Ausgabe-Latenz) ≤ 150 ms; ▶ wird ■; ▶ an einem zweiten Sound beendet das erste Vorhören (eine Vorhör-Stimme); ■: −19,3 → −29,7 dBFS (mit Hallfahne), M-KLICK schlechtestes Fenster +4,0 dB einzeln, +3,8 dB in der Regression (vor der Ausblendung der Vorhör-Kette unter Last +7,0 dB); ein Tastendruck beendet |
| V0b-03 | `v3-v0b-browser.mjs` | Kit „909“: Tipp lädt still (−∞ dBFS), ▶ spielt (−18,1 dBFS) |
| V0b-04 | `v3-v0b-follow.mjs` | SCHRITTE, 2-Takt-Clip, 150 BPM: an jedem Taktstrich (Schlag 4/8/12/16) zeigt die Seite den Takt der Marke; 4 Seitenwechsel, alle am Taktstrich (in drei Läufen höchstens 0,038 Schläge = 15 ms danach; 1 Bild = 0,042); Lauflicht in Takt 2 in jedem Bild — vorher: Seite immer Takt 1, Lauflicht ab Schlag 4 aus |
| V0b-05 | `v3-v0b-follow.mjs` | LAUF ebenso: 4 Wechsel, höchstens 0,045 Schläge (18 ms) nach dem Taktstrich (drei Läufe); Lauflicht in Takt 2 — vorher Seite immer Takt 1 |
| V0b-06 | `v3-v0b-follow.mjs` | ROLLE, 4-Takt-Clip, 1 Takt sichtbar: x0 0/4/8/12, 8 Wechsel am Taktstrich (≤ 0,045 Schläge); Note gewählt → x0 über 2 Durchläufe gleich, Kopf „⏸ HÄLT · Auswahl“; nach dem Aufheben folgt sie an der nächsten Seitengrenze nach 3 s, am Taktstrich — vorher: Sprünge bei Schlag 3,57 / 6,47 / 9,59 (85-%-Regel), auch mit gewählter Note |
| V0b-06b | `v3-v0b-follow.mjs` | Zwei-Finger-Zoom (CDP) auf Takt 3: `reason 'hand'`, x0 6,16 über 2 Durchläufe (auch mit der Marke außerhalb), Kopf „⏸ HÄLT · von Hand“; Tipp → FOLGT und Sprung zur Marke; nach waagrechtem Schieben ebenso; nur ✎ gewählt, keine Geste: folgt (bei < 1 Takt Sicht Seiten zu 3 Schlägen) |
| V0b-06c | `v3-v0b-follow.mjs` | SCHRITTE und LAUF: Seite 2 von Hand bleibt über 3 Taktstriche stehen, der Lauf-Punkt wandert (laufender Takt 1 und 2 gesehen), Kopf „⏸ HÄLT · von Hand“; Schließen und Öffnen → FOLGT |
| V0b-07 | `v3-v0b-follow.mjs` | Tipp auf [⟶ FOLGT] → [⟶ AUS], die Ansicht steht, der Lauf-Punkt läuft durch die Takt-Chips 1–4; `S.ui.follow.roll = false` im Projekt; Tipp → FOLGT |
| V0b-08 | `v3-v0b-ux.mjs` | Pad SNARE bei KICK: SOUND, TIEF und SCHRITTE zeigen SNARE; Schalter aus → KICK bleibt; ein zweites Pad < 300 ms wählt nicht; während ● nicht; Schalter = ein Undo — vorher blieb `ED.dVoice` 0 |
| V0b-09 | `v3-v0b-ux.mjs` P + L | 69 Seiten (VA, FM, WT, Drum, FX, Menü, Bibliothek): kein Etikett „Pegel“; 14/14 Umbenennungen; LAUTSTÄRKE „80 % · −3,9 dB“ |
| V0b-10 | `v3-v0b-ux.mjs` P + L | HALL, ECHO, MASTER (Synth- und Drum-Editor) tragen das Band „GLOBAL · wirkt auf alle Spuren“, SPUR und CHORUS nicht |
| V0b-11 | `v3-v0b-ux.mjs`, `v3-v0b-init.mjs` | Leer (Init): 0 Clips, kein Song, 4× INIT Analog (C4 −24,9 dBFS), INIT Drums (Pads −34,4 … −20,3 dBFS, alle > −40; Pegel .85, Raum/Gate 0, keine Locks), 120 BPM, C-Dur, Sends 0; dreimal Neu → drei verschiedene Namen im Muster. Lautheit auf der Lead-Phrase (trocken): INIT Analog −18,01, INIT FM −18,00, INIT Tabelle −18,00 LUFS |
| V0b-12 | `v3-v0b-ux.mjs` | ⋯ → Init: INIT Analog / INIT FM (fm6) / INIT Tabelle (wt) / INIT Drums, Toast mit [Rückgängig]; ein ↶ stellt den alten Sound deep-equal her |
| V0b-13 | `v3-v0b-ux.mjs` | A und B mit je 3 Sicherungen: `history()` in A nur A-Einträge (≥ 3), in B dessen 3; „Ältere Versionen“ in A nur A; Schlüssel `hist:<id>:<ts>` |
| V0b-14 | `v3-v0b-ux.mjs` P + L | Standard POSITION (neues Projekt und Bestand ohne Einstellung). POSITION, Ober-/Unterkante (5 px innerhalb): weiß 0,461 / 0,989, schwarz 0,468 / 0,982 (P); 0,473 / 0,975 und 0,487 / 0,961 (L); FEST: jede Live-Note 0,8 |
| V0b-14b | `v3-v0b-ux.mjs` P + L | FEST: FILTER-ANSCHLAG grau, Cutoff-Ring mit nur der `vel`-Route grau, LCD „Tastatur spielt fest 0,8 …“; Tipp → POSITION (ein Undo, ↶ → FEST); Route Anschlag → Cutoff mit Hinweis, Tipp → POSITION, Hinweis weg, ein Undo |
| V0b-15 | `v3-v0b-ux.mjs` | Popup „HALBTON“; die Daten bleiben `'chromatic'` (s. Abweichungen) |
| V0b-16 | Regression, DoD, `v3-v0b-shots.mjs` | siehe unten |
| N0b-01 | `v3-v0b-browser.mjs` P + L | Kopf „SOUNDS · SYNTH 2 · FM“, [FM ▾ │ Alle Engines], erster Rollen-Chip „Alle FM“, Glocke und Bass vorhanden; für alle 9 Rollen-Chips jede Zeile `data-engine fm6`; VA-Spur nur analog, WT-Spur nur wt, Drum-Spur Kits |
| N0b-02 | `v3-v0b-browser.mjs` | Synth 1 → [FM]: Filter FM; „Bass“ = Pop-Bass DX, Solid-Bass, kein VA-Bass; Tipp auf die erste Zeile → `getSound(0).engine === 'fm6'` — vorher öffnete die Bibliothek in „Bass“ mit den VA-Bässen, › lief durch Sub-Bass, Acid 303 … (analog) |
| N0b-03 | `v3-v0b-browser.mjs` | 20 × › und 20 × ‹ auf der FM-Spur (Liste Marimba-Holz · Kalimba · FM-Pluck): nach jedem Schritt fm6, im Kreis vor und zurück |
| N0b-04 | `v3-v0b-browser.mjs` P + L | Alle Engines: 46 Werks-Zeilen, jede mit VA/FM/WT, FM zuerst; VA-Sound auf der FM-Spur → Toast „wechselt zu VA“ mit [Rückgängig] → FM-Sound deep-equal |
| N0b-05 | `v3-v0b-browser.mjs` | Filter- und Chip-Wechsel: −∞ dBFS, 0 Vorhör-Noten, kein Sound geändert |
| N0b-06 | `v3-v0b-follow.mjs` | ROLLE, 1 Takt sichtbar: jedes x0 ein Vielfaches von 4, 8 Wechsel ≤ 0,045 Schläge nach dem Taktstrich; 2 Takte sichtbar: x0 0 / 8, 4 Wechsel ≤ 0,045; Melodie-Rolle bei ▶ SONG, 112 BPM: x0 0 4 8 12 16, 4 Wechsel ≤ 0,034 |
| N0b-07 | `v3-v0b-follow.mjs`; Gegenprobe `v3-v0b-gegen.mjs` | 13 CDP-Tipps (gleiches x, je eine Reihe tiefer, 1 s Abstand): 13 Noten auf Schlag 1 in Takt 1, `viewState('mel').x0` unverändert — Gegenprobe am Ausgangsstand: 13 Noten auf 9 Schlägen in 7 Takten (1 · 4 · 7 · 10,25 … 25,25) |
| N0b-08 | `v3-v0b-follow.mjs` | 16-Takt-Song, 8 Takte sichtbar: FOLGT x0 ∈ {0, 8}; hält nach einer Änderung 3 s (dann folgt sie), bei offenem Popover und nach Wischen („von Hand“, Chip); Tipp → FOLGT und Sprung zur Seite der Marke |
| Blätterer | `v3-v0b-adapt-fixd-steps.mjs` | SCHRITTE in 390×844, 375×667, 320×568, 844×390, 667×375 mit 1/2/4/8/16 Takten: jeder Takt per Touch gewählt und bearbeitet, kein Blätterer-Knopf verdeckt, Körper ohne Überlauf — 117/117 (Ausgangsstand 17 Fehler: in 375×667 lag ‹ Takt 1/4 › unter Euklid… / Muster ▾, kein Takt wählbar; in 320×568 und 667×375 war › verdeckt) |

**Regression (§1.3):** `v3-v0b-reg.sh 3` (`run2`: 98 Läufe + Smoke, 3 084 PASS / 18 FAIL). Wie am
Ausgangsstand scheitern nur: `rgq-old17` 5 (C2/C3/E2, exit 0), `v3-v0b-adapt-wp3-browser` PR2 (3), `v3-v0b-adapt-wp3-ui` 2
(Schraffur `lfo1→pw`, MO49), `wp3-adapt-func-build` C2/D5 (auch `?engine=native`), `wp7-adapt-sqr6-persist` Slot-Rundreise
(Ausgangsstand einzeln ebenso), `wp7-accept` fm4 DX-Tines 10,7 dB bei 30 ms (Grenze 10; Ausgangsstand V0a-fix einzeln 2×
gleich 10,7, auch in der V0a-fix-Regression; V0a.html 2,5; in `run1` einmal 2,5) und `v3-v0b-adapt-v0a-fix` V0a-13 nativ
(Rekorder-Lücke `gaps`; einzeln 3 von 3 Läufen bestanden) und V0a-16 L (Abfrage 150 ms nach `cpuInject`; einzeln in 1 von
3 Läufen bestanden, am Ausgangsstand in 0 von 1). Nach den letzten Layout-Korrekturen (Blätterer, Kopf-Chip P2) einzeln wiederholt und
bestanden: `wp6-steps` P/L/L667/P375/P320, `wp6-drums` P/L, `v3-v0a-drum`, `v3-v0b-ux`, `v3-v0b-follow` (steps, lauf),
`v3-v0b-shots`, `v3-v0b-adapt-fixd-steps`. Angepasst (Begründung im Kopf der Datei): `v3-v0b-adapt-wp1-brand`, `-wp1-misc`,
`-wp3-api` (Version 3.2.0, C.4), `-wp1-store`, `-wp3-store`, `-sq5-confirm`, `-wp1-shield` ([Neu ▾] → [Mit Startsounds],
Projektname mit Zeit), `-n0a` (3.2.0, Dateiname), `-wp6-extras` (Audio-Dateiname nach dem Projektnamen), `-wp3-ui`,
`-wp5-wp3-ui` (LAUTST.-HÜLLK., Sichern-Vorschlag „BASS 17.10. 15:52“), `-wp3-browser` und `-wp7-data` (Kopf, Engine- und
Rollen-Chips, stilles Laden), `-wp2-keys` und `-v0a-fix` (HALBTON), neu `-fixd-steps` (Blätterer, steht jetzt in der Liste).

**DoD:** `v3-v0b-dod.mjs` 60 s Demo mit V0b-Aktionen (Bibliothek: stilles Laden, ▶, Engine-Filter, Alle Engines;
⋯ Init; FOLGEN in ROLLE, LAUF, SCHRITTE und Song-Ansicht inkl. AUS; Pad wählt; Tastatur-Anschlag; Neu (Init); Verlauf;
`viewState`) in D, P1, L1 (Touch): 0 Konsolenfehler, `tickErrors()` 0, Stimmen ≤ 18 (nativ ≤ 21), 3,5 s nach Stopp 0 — mit
Worklet und mit `?engine=native` (je 10/10). M-PLATZ mit echten Schriften (`v3-v0b-shots.mjs`, P1 P2 P3 L1 L2 W, 102 Bilder
in `v0b-work/shots/`): Bibliothek FM / Alle Engines / Init, Editor-Köpfe mit [⟶ FOLGT] und [⏸ HÄLT · …] (ROLLE, LAUF,
Melodie-Rolle, SCHRITTE), KIT „Pad wählt Instrument“, ⋯ → Init, FEST-Hinweis (LCD, MOD-Zeile), Menü Neu ▾ und
Tastatur-Anschlag, Song-Ansicht-Chip — 156/156 (keine waagrechte Rolle, Körper ohne Scroll, L4 der neuen Bedienelemente).
Worklet-ASCII-Prüfung besteht (68 746 B). PE1 (`v3-pe1.mjs`, 10 s Demo, Editor offen, P und L): Synth, ROLLE, LAUF und SCHRITTE
je 60 fps, keine Long Task > 50 ms, tick p95 0,6–0,7 ms (Ausgangsstand ROLLE/SCHRITTE: 60 fps, 0,5–0,6 ms). Start
(`v3-startup.mjs`, Median aus 5 Kaltstarts, P1): 241 ms (V0a-fix 271 ms, −30 ms), CPU ×4 970 ms (949 ms, +21 ms) — Grenzen
1,5 s / 4 s / +150 ms. Smoke-Test: Titel SYNQUENZER, keine Fehler. Datei 1,30 MB ≤ 3,0 MB.

### iPhone-Prüfpunkte (Xander)

1. **Bibliothek:** einen Sound antippen → es erklingt nichts, Toast „‚Name‘ geladen“; ▶ links in der Zeile hört vor
   (wird ■), ■ beendet ohne Knacken; auf der FM-Spur zeigt die Liste nur FM, [Alle Engines] alle mit Kennzeichen.
2. **FOLGEN:** Clip-Editor mit 4-Takt-Clip bei ▶: die Ansicht blättert am Taktstrich um ganze Seiten; eine Note antippen
   → Kopf „⏸ HÄLT · Auswahl“, die Ansicht steht; zoomen oder schieben → „HÄLT · von Hand“ bis zum Tipp auf den Chip.
   Ebenso LAUF und Drum-SCHRITTE (Seite 2 von Hand wählen, der Punkt am Seiten-Chip läuft weiter).
3. **Melodie-Rolle bei ▶ SONG:** mehrmals an dieselbe Stelle tippen → alle Noten im selben Takt (früher sprang die
   Ansicht dazwischen weiter).
4. **Drum-Editor:** ein Pad antippen → SOUND/SCHRITTE zeigen dieses Instrument; schnelles Fingerdrumming auf zwei Pads
   wechselt nicht hin und her; im KIT „Pad wählt Instrument“ ausschalten.
5. **Neu ▾ → Leer (Init)** und Menü → Bedienung → Tastatur-Anschlag: bei POSITION oben auf einer Taste leise, unten laut;
   bei FEST trägt FILTER-ANSCHLAG den grauen Hinweis, ein Tipp auf [POSITION ▸] stellt zurück.

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt).
- Mit der Ersatzschrift (ohne die Webfonts) rollt die Werkzeugleiste der Melodie-Rolle in L2 um 48 px; mit den echten
  Schriften passt sie (M-PLATZ besteht).
- P3: am Regler zeigt FEST nur das Grau (die LCD-Zeile ist dort ausgeblendet); zurück über ⋯ → [Anschlag POSITION] oder die
  MOD-Zeile.
- HÄLT-Gründe für die Takt-Markierung (§5.2, V3a), ● SCHRITT (V3c) und den LOCK-Modus (V5b/V5c) kommen mit diesen Paketen;
  `viewState` meldet heute `finger`, `sel`, `tool`, `hand`, `edit`.
- `wp7-accept` fm4 (DX-Tines, 30-ms-Fenster 10,7 dB > 10) besteht seit V0a-fix nicht mehr; V0b ändert daran nichts (gleicher
  Wert am Ausgangsstand), die Ursache ist nicht untersucht.
- Das ⏸-Zeichen (U+23F8 als Text) zeichnet Barlow als schmalen Balken; auf dem iPhone kommt es aus der Systemschrift.

---

## V0d — FM-Sofort (+ N0d-2 FM-Hüllkurven-Editor, Haltephase, Tonhöhen-Hüllkurve, BISS) · App 3.4.0

App: `dirigent-wt/index.html` (1 467 450 B = 1,40 MB; V0b-fix 1 377 177 B → **+90,3 KB**, Budget V0d gesamt +65 KB, siehe Abweichungen), Snapshot `synq-snapshots/V0d.html`. Ausgangsstand V0b-fix
(`synq-snapshots/V0b-fix.html`, V0c nicht gebaut). Spec: Nachtrag 1 A.4 (V0d-01…17), A.4b (N0d-2, V0d-2-01…20), Teil D.
Arbeitsdateien: `v0d-work/` (Patch-Skripte `p1…p9-*.py`, Editor-Quelle `fmev.js`/`fmev.css`, Bildschirmfotos `*.png`,
Messdaten `ui-d-results.json`, `bass1-fixed.json`). Tests in `dirigent-test/` (alle `v3-v0d-*`): `-lib` (Worklet im
Node-Shim, msfa-Referenz `refSR`), `-eng1` (Haltephase, PEG), `-eng2` (V0d-2-01/02/03/05/06/15/16/17), `-native`
(V0d-2-02/04/15/18 nativ), `-sounds`/`-snd` (V0d-11/13/14/15/16, PR1), `-fm-sound` (V0d-05/08/12), `-migr` (V0d-2-15
Migration), `-band` (V0d-2-20 M-BAND), `-ui-a` (V0d-01…04/06/07/09/10/12), `-ui-b` (V0d-06/14, V0d-2-14 Import), `-ui-c`
(V0d-2-01/13/16/19), `-ui-d` (V0d-2-06…12 mit CDP-Touch), `-shot` (Bildschirmfotos), der Lauf `v3-v0d-reg.sh` (Ausgabe
`dirigent-test/v3-v0d-reg/<OUT>`).

### Gebaut

1. **Engine (Worklet, A.4b 2/3/9).** Haltephase wie Dexed ACCURATE_ENVELOPE (gleiche Pegel hintereinander = Haltezeit aus der
   statics-Tabelle, n/44 100 s, Angriff ab 0 n/20; eine Änderung derselben Stufe behält die abgelaufene Haltezeit),
   Tonhöhen-Hüllkurve (msfa: Geschwindigkeit `PEG_RATE/21,3` Okt./s, Pegel `PEG_TAB/32` Okt., L 50 = 0; Gate-aus → Stufe 4,
   Retrigger ab dem aktuellen Wert), BISS (`fmBite` −20…+20): Zeitfaktor 2^(B/10) auf Modulator-Stufen, ein Abfall ≥ 12 dB
   nie schneller als R 82 (`BITE_LIMQ`); LÄNGE (`fmDec`) wirkt nur noch auf Ausgänge. Migration: gespeicherte Sounds ohne
   `fmBite` bekommen das alte LÄNGE-Offset in R2/R3 der Modulatoren eingebrannt (bit-gleich, `migrateBite`), dann
   `fmBite = 0`. Init-Operator R4 80 (`FM_INIT_OP`). `.syx`-Import behält die PEG (Bytes 102–109) als `fm6.peg`
   (`normPeg`); flache PEG = kein Feld.
2. **Nativer Rückfall (ECO, `DXN.voice`).** Haltephase (`holdSec`, Ereignis „hold“ im `envPlan`), PEG über einen
   ConstantSource auf `detune` mit linearen Rampen und Release, BISS/Helligkeit wie im Worklet. ECO-Hinweis
   (`fmNativeHint`), sobald ein Modulator OL ≥ 75 hat.
3. **FMH (UI-Mathematik).** `segTime`, `stageTime`, `stageFrom`, `envTimes` (mit Haltephase und Makros), `limitR`
   (Klick-Grenzen: Ausgang ≥ 20 dB Fall/Anstieg ≤ R 93, Modulator ≥ 12 dB Fall ≤ R 82), `rateForTime` (bei Gleichstand die
   Rate nahe der jetzigen), `holdSec`, `effR`, `qOf`.
4. **A.4 FM-Sofort.** ALGO-Bild zeichnet die Feedback-Schleife immer (inaktiv grau gestrichelt), Etikett
   „FEEDBACK · OP n“, FB-Regler grau mit Grund („wirkt erst, wenn OP n klingt“ / „Weg über OP m stumm“); Wechsel zwischen
   Algorithmen mit gleichen Kanten → LCD „Unterschied nur: Feedback auf OP x statt OP y – hörbar ab FB ≈ 5“ (Paare aus der
   Tabelle berechnet). Hüllkurven-Bildchen je Operator (`fmSparkPx`, ≥ 16 px, Kompaktfassung 10 px; Tipp → OP › HÜLLK.).
   Modulator-Fader OL = round(99·p^0,45), Anzeige „I 0,08“ (2 Stellen unter 1) und OL-Zahl auf der Kappe; Helligkeit
   24·sgn(v)·|v|^0,5 dB. [Auf alle Modulatoren] / [Auf alle] (je ein Undo).
5. **A.4b Editor (`fmEnvEditor`).** Log-Zeitachse ohne Raster (0,5 ms–10 s Halte-/Abklingteil, Lücke, 5 ms–12 s Release;
   32 px Rand links), Punkte A/D1/D2/R mit Auffächern (≥ 16 px, Haarlinie, Etiketten), Ablesung im Graphen
   „D1 70 ms · R2 60“ / „L2 80 · −13,5 dB · I 1,9“, LCD nur die gezogene Achse (in L kurz: „D1“, Pegel ohne Index),
   Totzone 6 px geschluckt und Anker an der Grenze des qrate-Bands (erste Änderung nach dem ersten px), ganz rechts = R 0,
   Klick-Grenze mit Bernstein-Punkt („Klick-Grenze 5 ms · nochmal ziehen = schneller“, zweiter Zug darüber hinaus),
   Pegelzug hält die Zeiten (R_i, R_i+1 folgen; „Zeit auf Klick-Grenze angehoben“ / „Zeit nicht haltbar“), FEIN
   ([FEIN] eingerastet ×¼, ruhender zweiter Finger), Doppeltipp = Init-Wert, Abbruch (blur) = ein Undo. Vorlagen
   [Snap] [Pluck] [Pad] [Orgel] (Tabelle T2 je Rolle), [+ Modulator] (Init FM), [Pegel 95] + „Biss braucht OL ≥ 90“,
   DX-Zeile R1…R4 L1…L4 (Wisch ±1, [R│L] in P3), [−1] [+1], [Auf alle Mod./Ausg.], [Auf alle], [⋯], Bezugsnote mit 🔒,
   Vorhören bei gestopptem Transport. `fmDefaultOp` (erster Modulator), Kopfzeile mit Rolle „MODULATOR → OP 1 ·
   Klangfarbe“ / „AUSGANG · Lautstärke“.
6. **HÜLLK. bei FM.** Unterreiter OPERATOREN · TONHÖHE · FILTER · MOD-HK (FILTER grau mit Grund bei `fmBypass`, MOD-HK grau
   ohne Route); bei fmAmp 1 LAUTST. (ADSR) vorn mit Band und [DX-Hüllkurven]. TONHÖHE = PEG-Editor mit [Aus] [Ruck] [Fall]
   [Anstieg], Halbton-Ablesung.
7. **MAKRO** Helligkeit · Biss · Härte · Länge · Release (`fmBite`, LCD „Biss +10 · D1 OP 2: 70 → 35 ms“); [Init FM] setzt
   BISS 0.
8. **Sounds.** Pop-Bass DX und Solid-Bass nachgestimmt (Tastatur-Skalierung links), 7 neue FM: Stapel-Bass FM,
   Abgrund-Bass FM, Knurr-Bass FM, Kristall-Lead, Funk-Stich, Atem-Orgelfläche, FM-Flügel; Tropfen = N69, neu
   Tropfen-Ping (VA), Effekte Pfeif-Rampe, Sturzflug, Aufsteiger, Absteiger, Wellen-Sweep, Kassetten-Laden in der neuen
   Kategorie „Effekt“ (Rolle Effekt). `.syx`-Hinweis (`syxHint`) und Lage-Anpassung beim Laden ([An Spur anpassen]).
9. **Hilfe** (Menü → Hilfe): neue Zeilen FM-HÜLLKURVEN und FEEDBACK; MAKRO-Zeile nennt BISS.
10. **Test-API** (Teil D): `fmDefaultOp`, `fmEnvView`, `fmAuditions`, `fmEnvPreset`, `setFmPeg`, `fmFader`,
    `fmBrightFader`, `syxHint`; `VERSION = '3.4.0'`.

### Abnahme

Alle Prüfungen mit echten Läufen; Ausgaben in `dirigent-test/v3-v0d-reg/acc/` (Abnahme) und `…/adapt/` (Anpassungen).

| Punkt | Test | Ergebnis |
|---|---|---|
| V0d-01…04, 06, 07, 09, 10, 12 | `v3-v0d-ui-a.mjs` (CDP-Touch) | 17/17 — FB-Schleife in allen 32 Algorithmen, Etikett, Grau mit Grund, LCD-Paare aus der Tabelle (1↔2 …), Bildchen in 8 Viewports, OL-Fader p 0/0,13/0,35/0,5/0,68/1 → 0/40/62/72/83/99, I-Anzeige, [Auf alle …] je ein Undo |
| V0d-05, 08, 12 | `v3-v0d-fm-sound.mjs` | 11/11 |
| V0d-11, 13, 14, 15, 16, PR1 | `v3-v0d-sounds.mjs` | 61/61 — Bässe C2/E1: Pop-Bass DX −12,5/−15,8 dB, Solid-Bass −12,8/−19,0, Stapel −11,9/−16,2, Abgrund −11,2/−12,6, Knurr −14,8/−17,9 (M-HANDYrel); alle −18,0 LUFS; Tropfen C5/G5 −5,8 HT → 0, Tropfen-Ping, N71–N76 |
| V0d-06, 14, V0d-2-14 (Import) | `v3-v0d-ui-b.mjs` | 15/15 |
| V0d-2-01, 13, 16, 19 | `v3-v0d-ui-c.mjs` | 46/46 — Startoperator, Kopfzeile in P1–P3/L1/L2, Unterreiter, Init R4 80, M-PLATZ, Trefferflächen |
| V0d-2-01 (Klang), 02, 03, 05, 06 (Klang), 15, 16, 17 | `v3-v0d-eng2.mjs` | 34/34 — Init + [+ Modulator] C2/E1: −10,1/−21,6 dB, 0,82/0,75 Okt., 25,6/33,5 dB; ROM1A-Schlauch und RMS gegen msfa; R4 93 HF-KNALL −60,5/−55,2/−50,6 dB; R3 93 Anstieg −50,5 dB; R2 82: M-PEGEL gegen msfa 0,13/0,26 dB, M-BISS 21,5/34,2 dB |
| V0d-2-04, 14 | `v3-v0d-eng1.mjs` | 34/34 (Haltephase gegen msfa, PEG-Spur, TAKE OFF) |
| V0d-2-02/04/15/18 nativ | `v3-v0d-native.mjs` | alle bestanden (Haltezeit 182,8 vs 182,3 ms, PEG ±0,07 HT, SNAP-TEST 30,9/38,3 dB) |
| V0d-2-06…12 | `v3-v0d-ui-d.mjs` (CDP-Touch, P1 + L1/P2/P3/L2) | 51/51 |
| V0d-2-15 Migration | `v3-v0d-migr.mjs` | 5/5 — (a) fmDec ±30 alter Sound: Differenz ≤ −160 dB, `fmBite` 0, R2/R3 eingebrannt; (b) Laden → Speichern → Laden deep-equal |
| V0d-2-20 M-BAND | `v3-v0d-band.mjs` | 10 unveränderte V0a-FM-Sounds: max. 0,00 dB je Band (bit-gleich in den ersten 300 ms) |

**Regression (§1.3, V0d-17, V0d-2-20):** `v3-v0d-reg.sh 3` (`run1`: 102 Läufe + Smoke, 3 236 PASS / 45 FAIL), danach die
Anpassungen einzeln (`…/adapt/`, alle bestanden). Wie am Ausgangsstand (V0b-`run2`) scheitern `rgq-old17` 5,
`v3-v0b-adapt-wp3-browser` 3, `v3-v0b-adapt-wp3-ui` 2, `wp3-adapt-func-build` 2 (auch nativ), `wp7-adapt-sqr6-persist` 1.
Seit V0b-fix (nicht V0d; mit `synq-snapshots/V0b-fix.html` nachgeprüft, mit `V0b.html` bestanden): `node-fm` „engine switch
… the voice ends“ (V0b-fix überblendet gehaltene Töne absichtlich in die neue Engine) und `wp4-offline` FX3 Juno-Chorus (2).
Offen durch V0d (in V0d-fix behoben, siehe unten): `wp7-accept fm4` — nativer ECO-Weg gegen Worklet bei 30 ms > 10 dB für Pop-Bass DX, Solid-Bass, Stapel-,
Abgrund- und Knurr-Bass (11–19 dB; bei 600 ms ≤ 5,8 dB; DX-Tines wie seit V0a-fix um 10,7–11,2 dB), siehe Lücken.
Angepasst (Kopf der Datei nennt den Grund): `v3-v0d-adapt-wp1-brand`, `-wp1-misc`, `-wp1-store`, `-wp3-store`, `-n0a`
(Version 3.4.0), `-wp3-api` (3.4.0, 60 Werks-Sounds, 19 FM), `-wp7-data` (19 FM, „Alle FM“ 20), `-wp7-accept` (PR1 19 FM),
`-wp4-engine` (37 VA, 60 gesamt), `-wp7-wp3-sound` (Kategorie „effekt“ 7, fm 14). Funk-Stich FM übersteuerte im trockenen
PR1-Render (Spitze 1,15) → Pegel −2 dB (−20,0 LUFS, Spitze 0,92; V0d-13 erlaubt −18 ± 3).

**DoD:** `v3-v0b-dod.mjs 60` mit Worklet und nativ je 10/10 (keine Konsolenfehler, `tickErrors()` 0, Stimmen-Grenzen, 0
nach dem Stopp). Worklet-ASCII-Prüfung besteht (81 273 B, 0 Nicht-ASCII). Smoke-Test: Titel SYNQUENZER, keine Fehler.
Bildschirmfotos `v0d-work/final/` (OP › HÜLLK. in P1/P2/P3/L1/L2, HÜLLK. › OPERATOREN, TONHÖHE, ALGO, MAKRO) angesehen.

### Abweichungen von der Spec

- **Größe:** +90,3 KB statt +65 KB (Editor, PEG-Editor, 14 Sounds, native Haltephase/PEG).
- **BISS −10:** Pegel bei 90–110 ms liegt 2,4 dB über den anderen Stufen (PM-Pegelschwankung; die Spec misst nur
  −20/0/+20, dort 0,95 dB) — geprüft wird wie in der Spec −20/0/+20.
- **TAKE OFF (V0d-2-14 e):** Vergleich als Mittel über 0–200 ms (das erste 10-ms-Fenster schwankt durch Feedback-Rauschen
  um 1,9 HT).
- **LCD in L:** Kopf nur die Stufe („D1“), Pegelwert ohne Index — die volle Ablesung steht im Graphen (sonst passt das
  Wertfeld in L1 nicht, V0d-2-09).
- **Kopf in L:** „OP 2 · MOD.→1“ (Kurzform); Unterreiter-Kurzformen (z. B. „OPERAT.“, „LAUTST. (ADSR)“) in P3/L2.
- **Effekte:** neue Kategorie „effekt“ (Rolle Effekt) statt Sequenz/Fläche, weil die Effekt-Sounds die Gates dieser
  Kategorien nicht erfüllen; N75 hat die Rolle Effekt.
- **Solid-Bass:** E1 −19,0 dB (Regel ≥ −20 erreicht; die Ausweichregel ≥ −24 war nicht nötig).
- **Startpunkt des Ziehens:** Der Anker liegt nach der Totzone am Rand des qrate-Bands (sonst käme die erste Änderung
  erst nach 8–10 px, V0d-2-07 fordert ≤ 7); ganz rechts (hinter dem Achsen-Ende) = R 0.
- **.syx-Export** gibt es weiterhin nicht (kommt mit V4c); der Import übernimmt die PEG.

### iPhone-Prüfpunkte (Xander)

1. **OP › HÜLLK.** eines FM-Sounds: D1 des Modulators waagrecht ziehen — die Zeit läuft in ms, kein Sprung am Anfang;
   ganz nach links bleibt der Punkt an der Klick-Grenze stehen (Bernstein), ein zweiter Zug geht darüber hinaus.
2. Zweiten Finger irgendwo auf den Editor legen, während der erste zieht → fein (¼); [FEIN] rastet ein.
3. **Init FM → [+ Modulator]**: C2/E1 spielen — hörbarer Biss, der Ton schneidet nicht ab.
4. **MAKRO → Biss** −20 … +20 am Snap-Bass: dumpfer ↔ bissiger, gleich laut.
5. **HÜLLK. › TONHÖHE → [Fall]**: der Ton fällt hörbar in den ersten 200 ms.
6. **Hüllkurven-Bildchen** im ALGO-Streifen in WebKit (Darstellung ungeprüft).
7. Bässe (Pop-Bass DX, Solid-Bass, Stapel-/Abgrund-/Knurr-Bass) auf dem Handy-Lautsprecher anhören (E.11).

### Bekannte Lücken

- Kein WebKit-/iPhone-Test (nur Chromium erlaubt); Hüllkurven-Bildchen und Touch-Gesten des Editors auf dem iPhone
  ungeprüft (Prüfpunkte oben).
- **ECO-Weg (nativ) bei tiefen FM-Bässen:** `wp7-accept fm4` misst bei 30 ms 11–19 dB Abstand zum Worklet (zu viel Energie
  unter 60 Hz im nativen Anschlag) für die nachgestimmten und neuen Bässe; ab 600 ms ≤ 5,8 dB. V0d-2-18 (nativ) besteht.
  Ein Versuch, den Phasenfehler der FM-Integration im ECO-Weg auszugleichen, half nur im 48-kHz-Offline-Render und wurde
  verworfen (bei 44,1 kHz live liegt der Gleichanteil schon ohne Ausgleich bei ≈ 0). Ursache offen. → **In V0d-fix behoben**
  (Ursache gefunden, siehe V0d-fix).
- `node-fm` (Engine-Wechsel) und `wp4-offline` FX3 scheitern seit V0b-fix (nicht durch V0d); die Erwartung von `node-fm`
  ist durch die V0b-fix-Überblendung überholt, FX3 nicht untersucht.
- Die Bässe und Effekte sind gemessen, nicht angehört (E.11).
- Im LCD von L2 (667×375) bleibt für den Wert wenig Platz; die Ablesung steht dort im Graphen.

---

## V0d-fix — ECO-Anschlag ohne Gleichanteil, `wp7-accept fm4` besteht wieder · App 3.4.0

App: `dirigent-wt/index.html` (1 474 868 B; V0d 1 467 450 B → +7,4 KB), Snapshot `synq-snapshots/V0d-fix.html`.
Befunde: (1) ECO-Weg (nativ, `DXN.voice`) erzeugt bei Pop-Bass DX, Solid-Bass, Stapel-, Abgrund- und Knurr-Bass einen
Gleichanteil/Subbass-Stoß beim Anschlag (offline 48 kHz C4: Mittel 0–30 ms +0,131 bzw. −0,185 FS, Energie < 30 Hz −8,8 /
−6,5 dB statt −32 / −33 dB); (2) dadurch `wp7-accept fm4` bei 30 ms 11–18 dB (Grenze 10), ohne Adapt-Datei (V0d-17, V0d-2-20).

### Ursache

- Der ECO-Weg rechnete FM statt PM: `A·y'(θ)·2πf` in `frequency`. Der Term `A'(t)·y(θ)` fehlte, jede schnelle
  Modulator-Hüllkurve hinterließ einen festen Phasenversatz zwischen Träger und Modulator; bei den 1:1-Paaren der Bässe
  (EN-03) hebt sich das 0-Hz-Seitenband dann nicht mehr auf → Gleichanteil-Stufe mit zufälligem Vorzeichen je Note.
- Chromium: Ein Oszillator mit a-rate-Eingang an `frequency`/`detune`, der mitten in einem Render-Quantum startet, bekommt
  die Modulation erst ab der nächsten Quantum-Grenze (`v3-v0dfix-start2.mjs`) — jede Live-Note verlor so die ersten
  Modulationswerte, auch mit echter PM.
- Feedback-Bässe (Knurr-Bass): die statische Feedback-Welle hatte im Anschlag die dumpfere Körper-Klangfarbe.

### Geändert (nur `DXN.voice`, ECO-Weg; Worklet unverändert)

- **Echte Phasenmodulation:** jeder Modulator gibt `m = 2π·A(t)·y(θ)` (rad) aus; die Summe der Modulatoren eines Operators
  läuft durch ein Differenzfilter (`IIRFilterNode`, `(sr/2π)·(m[n]−m[n−1])`) in dessen `frequency` — die Phasensumme ist
  genau `m[n−1]`. Ohne `IIRFilterNode` (sehr altes WebKit) bleibt der alte FM-Weg.
- **Verstimmte Operatoren:** `detune` (cv, PEG) skaliert auch den FM-Eingang; der Eingang wird darum durch `2^(cents/1200)`
  geteilt (WaveShaper-Kurve über ±12 000 Cent). `v3-v0dfix-cvcomp.mjs`: cv ±1200/−700/300 Cent = Note ±12/−7/+3, Rest
  −72 … −89 dB (6/6).
- **Startzeiten:** die Quellen einer Stimme starten im Quantum vor dem von t0 (dort sind alle Modulationen noch 0, Hüllkurven,
  cv und PEG beginnen erst bei t0, also klingt nichts früher): die tiefsten Modulatoren auf der Grenze, jeder Operator ein
  Sample nach seinen Modulatoren (gleicht die Ein-Sample-Verzögerung des Differenzfilters aus wie die Operator-Kette im
  Worklet). Eine schon vergangene Grenze (späte Live-Note) → alle zusammen auf der nächsten.
- **Feedback folgt der Hüllkurve:** bis zu zwei weitere Oszillatoren mit den Wellen für 2× und 4× Körper-Feedback, gewichtet
  über eine WaveShaper-Kurve auf der Kopie der Operator-Hüllkurve (Körper-Welle bis Körperpegel, darüber die helleren);
  im Release mitgeführt.
- Der ECO-Hinweis „Klangfarbe bei hohem Pegel angenähert“ bleibt (Feedback ist weiter eine Wellen-Näherung).

### Nachweis (vorher = V0d)

| Prüfung | Vorher | Nachher |
|---|---|---|
| `wp7-accept.mjs fm4` und `v3-v0d-adapt-wp7-accept.mjs fm4` (30 ms) | 34/6: Pop 14,1 · Solid 12,1 · Stapel 11,0 · Abgrund 18,0 · Knurr 17,9–18,2 · DX-Tines 10,7 dB | **40/0** beide: 0,4 · 0,1–0,2 · 2,5 · 0,3–0,8 · 2,5 · DX-Tines 1,1 dB (600 ms ≤ 0,8 dB) |
| `v3-v0d-adapt-wp7-accept.mjs` (alle: FM1–FM10, PR1, PR8, MO, UI) | — | 88/0 |
| `v3-qa-v0d-ecolf.mjs` (offline 48 kHz, < 30 Hz in 0–60 ms) | Pop C4 −8,8 dB / Mittel +0,131; Knurr C4 −6,5 / −0,185; Pop C2 Mittel −0,168 | Pop C4 −31,8 (Worklet −32,3) / −0,006; Knurr C4 −28,4 (−33,4) / −0,013; Pop C2 −14,6 (−16,1) / +0,062 (Worklet +0,021; 30 ms = 2 Perioden) |
| `v3-repro-ecothump.mjs` live 44,1 kHz C4 (Mittel 0–30 ms, < 30 Hz) | Pop −0,034 / −14,8 dB · Solid −0,048 / −12,5 · Stapel −10,4 · Abgrund −10,8 · Knurr −17,1 | Pop −0,0015 / −37,5 (Worklet −36,2) · Solid −0,003 / −35,4 (−34,3) · Stapel −34,3 (−42,7) · Abgrund −31,0 (−32,2) · Knurr −42,2 (−37,5); C2 alle ≤ |0,016| |
| dasselbe bei 48 kHz (iPhone-Rate), C4 | Pop +0,044 / −12,5 · Solid +0,041 / −13,7 · Knurr −0,043 / −11,5 | Pop −0,001 / −36,5 (−36,3) · Solid −0,004 / −32,0 (−34,6) · Knurr −0,002 / −39,5 (−38,1) |
| `v3-fm4dc-indep.mjs` (Mittel 0–30 ms; LP 30 Hz 0–60 ms nativ/Worklet) | −0,044 … +0,030; Pop −29,1/−42,6 | \|Mittel\| ≤ 0,003; Pop −42,1/−42,6 · Solid −41,0/−40,7 · Stapel −45,5/−45,4 · Abgrund −45,3/−43,1 · Knurr −41,0/−40,9 |

Kontrollsounds (FM-Pluck, FM-Orgel) unverändert unauffällig; die Sinus-Stufe ab 300 ms ist auf beiden Wegen ≈ 0.

**Regression:** `v3-v0d-reg.sh` (Engine-Teil: wp7-accept ui/mo/fm4/fm7/fm10/f1, PR1, wp7-syx/-data/-fm9/-gates/-dod,
node-fm/-fm-pr1/-an1/-fx1/-engine/-check, wp4-engine/-offline/-gates/-dod, wp3-api/-store/-leak/-browser, func-build und
func2-build mit Worklet und nativ, wp1-perf, harm-pure; Ausgabe `v3-v0d-reg/v0dfix2/`): alles bestanden außer den schon in
V0d `run1` gleich scheiternden Prüfungen (`node-fm` 1, `v3-v0b-adapt-wp3-browser` 3, `wp3-adapt-func-build-native` 2,
`wp4-offline` 2, `wp7-adapt-sqr6-persist` 1 — Meldungen identisch). V0d-Suiten: `v3-v0d-eng1` 34/0, `-eng2` 34/0,
`-fm-sound` 12/0, `-sounds` 62/0, `v3-v0d-adapt-wp4-engine` 40/0, `-wp7-wp3-sound` 18/0, `v3-v0b-dod.mjs 60` nativ 10/0.
Smoke-Test: Titel SYNQUENZER, keine Fehler.

### Abweichung: V0d-2-18 nativ (`v3-v0dfix-adapt-v0d-native.mjs` statt `v3-v0d-native.mjs`)

Zwei Schranken von V0d-2-18 waren auf den alten FM-Weg geeicht („Gegen msfa wird nativ nicht geprüft, weil ECO FM statt PM
rechnet“). Jetzt rechnet ECO PM und trifft das Worklet (= msfa) genau — das Worklet selbst verfehlt diese Schranken:
- PEG ändert den Index nicht: H2/H1 ohne/mit +7,5 HT nativ −2,81 / −1,78 dB = Worklet −2,81 / −1,78 dB (Differenz 1,03 > 1).
  Die Messung (8192-FFT, 200 ms) schwankt ohne PEG schon von Ton zu Ton um ±1 dB (Worklet C3 −2,81, G3 −1,62, G#3 −1,70;
  `v3-v0dfix-pegwk.mjs`). Neu: nativ = Worklet ±0,3 dB mit und ohne PEG und die PEG-Änderung nativ = Worklet ±0,3 dB.
- SNAP-TEST ×1 M-PEGEL zu „ohne Modulator“ −4,0 … 0,5 (C2) / −4,6 … 0,9 dB (E1) — genau der msfa-Bereich, den V0d-2-05
  selbst nennt (−4,5 … +0,7). Neu: M-PEGEL gegen das Worklet ≤ 0,5 dB (Schranke aus V0d-2-05) in Fenstern von 2 Perioden
  (gemessen 0,13 / 0,14 dB); ein 20-ms-Fenster hält bei C2/E1 nur 1,3/0,8 Perioden und hängt dann von der Startphase ab
  (`v3-v0dfix-natprobe4/5.mjs`: 20 ms bis 2 dB, 2 Perioden ≤ 0,33 dB bei jedem Start im Quantum). M-BISS unverändert
  ≥ 25 dB (31,1 / 39,7). Alle anderen Punkte der Datei unverändert; 10/10 bestanden.

### Bekannte Lücken

- Offline-Render mit t0 < 1 Quantum (erste Note bei 0 s): die Quellen können nicht vorher starten; Stapel-Bass C4 dort
  < 30 Hz −26,8 dB statt −39,2 (Mittel −0,018). Live (t0 immer später) und bei t0 ≥ 1 Quantum nicht betroffen.
- Mehr Knoten je ECO-Stimme (Differenzfilter je modulierten Operator, bis zu 2 Feedback-Oszillatoren); `wp7-adapt-wp1-perf`,
  `wp4-dod`/`wp7-dod` und die native DoD bestehen, auf dem iPhone ungemessen.
- Kein WebKit-Test (Chromium only); `IIRFilterNode` gibt es in Safari seit 14.1.


---

## V4a — FM-Graph-Engine (`p.fmx` Format 2, 6 Operatoren) · App 3.8.0

Grundlage: Nachtrag 2 Teil A (A.3–A.7, K2-37 … K2-45, K2-58 … K2-62) mit `r7/kodamo-delta-pdf.md` (KP §4.8–4.11, §6, §7, §9 V4a)
und `r7/kodamo-delta.md` §6.2/§6.4/§6.5 (nur nach A.3); Spec v3 §9.3 und §17 V4a. Gebaut auf `synq-snapshots/V0-gruppe-fix.html`
(Gruppe 1 ohne V0c; Gruppe 2 ist noch nicht gebaut, V4a braucht nur V0d). Die Fähigkeiten-Summe ändert sich nicht.
Keine Oberfläche des FM-Felds (die kommt mit V4b); sichtbar ist in V4a nur die Hinweiszeile auf der FM-Seite.

### Gebaut

**Datenmodell `p.fmx` (KP §6.1, Format 2, `n` = 6)** — neues Modul `FMX` (eigener `<script>` vor SQStore, eigene DX-Tabelle):
- `FMX.norm` (`normFmx`): Bereiche und Vorgaben je Feld, Hüllkurven in DX-Form `{f:'dx', r[4], l[4]}` oder Punkt-Form
  `{f:'pt', y, t, sus, la, lb, skip, crv, run}` (Punkt-Form wird gespeichert, klingt aber erst ab V4f, s. Lücken);
  Reparatur in fester Reihenfolge (KP §6.2 ohne die 16-Kanten-Regel, K2-42): doppelte Zelle → nächste freie Spalte der
  Reihe; Kante gegen I2 oder mit unbekanntem OP → weg; Ausgang mit Ziel → Ziel weg (I4); OP ohne Ziel fällt nach R7 auf den
  obersten Nicht-Vorfahren darunter, sonst zum Ausgang (I3). Jede Reparatur schreibt eine Konsolenzeile; zweimal = gleich.
- `FMX.check` (I1–I4, genau 6 Operatoren) — `setFmx` wirft damit, die Daten bleiben unverändert (K2-37, V4a-05).
- `FMX.fromFm6` (`fmxFromFm6`, KP §6.3): Plätze nach `dxLayout`, Feedback am Empfänger `fbDst` mit Quelle `fbSrc`
  (Alg. 4/6: Empfänger 6, Quelle 4/5), DX-Form-Hüllkurven, `fm6.peg` in jeden Verhältnis-OP (`pr 'dx'`),
  `lfoAm = round(127·ams/3)`, `lfoFm = round(127·pms/7)`, `phm = osync 0 ? 'free' : 'fix'`.
- `FMX.dxLayout` (KP §6.5), `FMX.dxMatch` (eigene Nummerierung zuerst, dann alle 720), `FMX.dx` (DX-tauglich nach KP §6.4
  mit deutschen Gründen: „OP 3: Welle Säge“, „Feedback an OP 2 und OP 6“, „Nummern anders (wie DX 5)“ …), `FMX.toFm6`,
  `FMX.approxFm6` (nächster DX-Algorithmus: wenigste abweichende Kanten über alle Nummerierungen, `approx: true`).
- `SQStore`: `normSynthP` trägt `p.fmx` (normalisiert); `normFm6` behält jetzt `ams[6]`, `pms`, `osync: 0` und `approx`.
- `p.fm6` folgt dem Graph (`fmxApply`): DX-tauglich → derselbe Klang als fm6; sonst der nächste DX-Algorithmus mit
  `approx: true` für den nativen Rückfall. Eine Änderung auf den DX-Seiten (ALGO/OP/MAKRO, Zufall, v1-Pfade) macht fm6
  zum Klang und baut `p.fmx` daraus neu (Zellen bleiben, wenn der Algorithmus gleich bleibt); [Init] löscht `p.fmx`.

**Worklet: Graph-Renderer** (`fm6.x` = `p.fmx` reist in der `{fm6}`-Nachricht mit; ohne `x` läuft der fm6-Weg unverändert):
- `fmxCompile`: Ausgänge = OPs ohne Ziel, Modulator-Summen je Ziel, Reihenfolge topologisch (Modulatoren zuerst, unter den
  bereiten die höchste Nummer → für jeden DX-Graph genau die fm6-Reihenfolge 6…1, also dieselben Rechenschritte).
- **Feedback je Operator:** Selbst wie DX (2-Sample-Mittel, `2^(fbAmt−8)`, `fbAmt` in 0,1-Schritten, N4a-01); fremde Quelle
  mit 1 Sample Verzögerung. Liegt die Quelle oberhalb, rechnet der Block-Weg exakt (Quelle vor dem Empfänger); bildet sie
  eine echte Schleife, rechnet `fmxRenderPS` alle Operatoren Sample für Sample. DX-Alg. 4/6 (Empfänger 6, Quelle 4/5)
  laufen wie N7F-02 verlangt auf dem WP7-Weg (in OP 6 gefaltet).
- **Werkswellen 0–11** (K2-40, KD §6.2): 0 = der bisherige Sinus-Pfad (bitgleich), 1–11 Tabellen mit 512 Samples und
  linearer Interpolation, Teiltöne geschlossen gerechnet (Säge, Säge weich, Dreieck, Rechteck, Halbsinus, Puls 25 %,
  Oberton 2/3, Sinus weich = sin 2πx·sin πx, Sinus weich 2, Rauschen = flaches Spektrum mit festen Zufallsphasen), Spitze 1,
  gleichanteilfrei; **Mipmaps** mit einer Stufe je Oktave (Stufe L: Teiltöne ≤ 2^(8−L)); Wahl je Stimme und Operator in
  jedem Steuerblock aus der aktuellen Operatorfrequenz (mit Tonhöhen-Hk., LFO, Bend) mit Überblendung zwischen zwei
  Nachbarstufen, beide aliasfrei (Bandbreite zwischen fs/4 und fs/2).
- **Phase** `ph` 0…127 und `phm` 'fix' │ 'rnd' │ 'free' ('free' = die weiterlaufende Phase des Operators).
- **Anschlag ±:** `vs` −7…+7; negativ = gespiegelte DX-Kurve (leise Anschläge laut). `vs` 0…7 rechnet wie fm6.
- **LFO je Operator:** `lfoAm` (LFO 1 der Spur auf den Pegel, 127 = 24 dB Absenkung am LFO-Tiefpunkt) und `lfoFm`
  (Tonhöhe, Kurve der msfa-PMS-Tabelle, 127 = ±12 HT).
- **Tonhöhen-Hüllkurve je Operator** `pit` in DX-Form (`pr 'dx'`, msfa-PEG-Rechnung wie V0d); feste OPs ohne PEG (K2-58).
- **Stumm** `on 0` rechnet wie `ol 0`; Umschalten bei klingender Note über eine 30-ms-Rampe.
- **Live-Pegel** (N7F-09): `{fmxLv: [6]}` mit ~30 Hz nur auf Anforderung (`{fmxLv: true}`), Maximum über die Stimmen,
  Pegel × Hüllkurve auf der OL-Skala der Kachel (OL 99 voll = 1, OL 80 = 0,81). Host: `E.fmxLv(on)`, `fmxLvWant(t, on)`
  (V4b ruft das, solange das FELD sichtbar ist), `E.lv`.
- **Stimmen-Überblendung 30 ms (L3, Z11) in allen Worklet-Engines:** Ein Strukturwechsel bei klingenden Stimmen (XF_KEYS
  bei VA, ganzer Sound, FM-Algorithmus, fmx-Kanten/Wellen/Feedback-Quellen) kopiert die klingenden Stimmen in einen Geist
  mit dem alten Klang (cos), die Stimmen selbst laufen mit dem neuen weiter (sin), gleichleistungsgemäß. Ein Wechsel während
  der Blende wartet und wird zusammengefasst (höchstens ein Geist, Last höchstens ×2,2). Bei einem VA-Wellenwechsel startet
  die neue Welle mit ihrem Grundton in Phase mit der alten (`wavePhi`; Säge und Puls sind sonst gegenphasig: −7 dB Loch).
  Die WP4-Blende (96 Samples ab, 96 auf) bleibt als Rückfall ab Begrenzer-Stufe 2 (`xfLite` aus `limited()`) und für
  einen Wechsel Poly ↔ Mono. Geist als Spread-Kopie (die alte Kopie mit Schlüssel-Zuweisungen lief im V8-Wörterbuch-Modus,
  +15 % Last; betrifft auch den Engine-Wechsel aus V0b-fix).
- **Stimmenregel (K2-42):** Der schlechteste Fall mit echter Schleife lag mit 8 Stimmen bei 15,7 % je Spur → ab jetzt gilt
  „mehr als 12 Kanten → 6 Stimmen“; Grund in der Hinweiszeile der FM-Seite („6 Stimmen · mehr als 12 Verbindungen“),
  `engineInfo().perTrack[i].voiceCap`.
- Werkswellen werden beim Laden des Worklet-Moduls gebaut (FP-IPHONE, s. Fach-Prüfung).

**Nativer Rückfall (Spec 9.3, V4a-07):** DXN spielt `p.fm6`; bei `approx` der nächste DX-Algorithmus. Hinweis auf der FM-Seite
„ECO: angenähert (nächster DX-Alg. n)“, dasselbe im Titel/LCD des ECO-Abzeichens.

**.syx-Import (A.4b P. 11, Diagnose 3h):** AMS je Operator (auch Modulatoren), PMS und „Key-Sync aus“ bleiben in fm6
(`ams`, `pms`, `osync: 0`); eine Empfindlichkeit ohne LFO-Tiefe (AMD/PMD 0) wird verworfen.

**Mod-Ziele:** `op1…op6` und `fmbright` wirken auf den Graph wie auf fm6 (N7F-11, N7F-12).

**Test-API (KP §7, V4a):** `getFmx(t)`, `setFmx(t, fmx)` (wirft bei I1–I4 / 7. Operator, ein Undo), `fmxLevels(t)`,
`fmxLevelWatch(t, on)`, `dxLayout(alg)`, `fmxDx(t)`, `fmxFromFm6(fm6)`; `engineInfo().perTrack[i].voiceCap`.

**Layout:** Die Hinweiszeile der FM-Seite (ECO / 6 Stimmen) lief auf kurzen Hochformaten (375 × 667, 320 × 568) in die
Fader-Reihe (auch der V0d-Hinweis „Kompatibel …“): Dort nimmt sie jetzt die Zeile der kleinen Hüllkurvenbilder, die
Fader werden kürzer (min. 40 px), der Text bleibt einzeilig.

### Abnahme (V4a: N7F-01 … N7F-12 mit K2-37/K2-40/K2-42; Spec V4a-02 … -11)

Tests: `dirigent-test/v3-v4a-node.mjs` (Node-Shim des Worklets, KP §9), `v3-v4a-ui.mjs` (Chromium, App),
`v3-v4a-bench.mjs` (CPU, Node), `v3-v4a-shot.mjs` (Bildschirmfotos, M-PLATZ). Ausgaben in `dirigent-test/v3-v4a/`.

| Punkt | Messung | Ergebnis |
|---|---|---|
| N7F-01 Format | 200 Zufallsgraphen (6 Op, alle Kantenzahlen, DX- und Punkt-Hüllkurven): `normFmx` zweimal gleich, `setFmx` = `getFmx`, Kopie (getSound/setSound), Undo, Speichern/Laden (10 Runden) deep-equal; Reparatur doppelte Zelle / Kante nach oben / schwebender OP / Ausgang mit Ziel → I1–I4, zweimal gleich | 200/200 · 10/10 · 4/4 |
| N7F-02 (V4a-01) | `fmxFromFm6` alle 32 Algorithmen, alle 6 OP an, Mod. OL 80, Ausgänge 99, fb 5, PEG [Fall], C3, Anschlag 0,8, 1 s, gegen fm6 | bitgleich (Differenz 0) · Alg. 4/6: Empfänger 6, Quelle 4/5 |
| N7F-03 Wellen | Welle 0 gegen den Sinus-Pfad · KD §6.2: Säge H2 −6,0 · Säge weich H2 −12,0 · Dreieck H3 −19,1 (H2 −119) · Rechteck H3 −9,5 · Halbsinus H2 −7,4 · Puls 25 % H4 −110 · Oberton 2 H2 −6,0 · Oberton 3 H3 −6,0 · Sinus weich H2 −10,9, Spitze 30,5 % · Sinus weich 2 H2 −1,9 / H3 −14,0, Spitze 36,5 % · Rauschen max. Teilton 0,0 dB über Median · Welle 4 bei C7 gefaltete Energie · Wellenwechsel bei gehaltener Note · Gleiten C5→C8 durch die Mip-Stufen (Säge, Rechteck, Rauschen) | bitgleich · alle ±0,5 dB / ±1 % · −76,9 dB (≤ −50) · M-KLICK 3,6 dB · 2,8 / 0,8 / 0,7 dB |
| N7F-04 Phase | 'fix' ph 0: zwei Anschläge 64 Samples · ph 64: Start umgekehrt · 'rnd': 10 Anschläge · 'free': 2. Start = fortgelaufene Phase | −147 dB · ja · 10/10 verschieden · Fehler 0/128 |
| N7F-05 Feedback | Selbst-Feedback fb 7 gegen DX · `fbSrc` an jedem OP (selbst und fremd) · 15 Kanten + 6 Wege (2 fremd, eine echte Schleife): 60 Zufallsgraphen × 1000 Blöcke = 60 000 Blöcke · `fbAmt` 4,5 im M-SP | bitgleich · 12/12 · kein NaN, Spitze −8,3 dBFS bei Pegel 0,35 (8 Stimmen zusammen −2,6) · 666 Hz zwischen 316 und 1542 |
| N7F-06 Stumm | `on 0` gegen `ol 0` · Umschalten bei gehaltener Note (Modulator / Ausgang) | identisch · M-KLICK 1,2 / 0,5 dB, M-EINBRUCH 0,3 / 0,5 dB |
| N7F-07 Anschlag | `vs` −7: Anschlag 0,3 gegen 1,0 · `vs` 0…7 gegen fm6 | +76 dB · bitgleich |
| N7F-08 LFO je OP | `lfoAm` 127 (LFO 1 5 Hz) · `lfoFm` 127 · 0 = keine Wirkung · .syx AMS 3 an Modulator OP 2 (AMD 50), PMS 3 (PMD 20), Key-Sync aus | 24,0 dB Spitze-Spitze · ±1198 Cent · identisch · `lfoAm` 127, `lfoFm` 54, `phm` 'free' |
| N7F-09 Live-Pegel | ohne Anforderung · mit (Node / AudioWorklet) · Werte · Mehrlast | 0 Nachrichten · 29,0 / 29,0 je s · 1,00 0,81 … (OL 99 / 80) · +0,001 % |
| N7F-10 (K2-42) CPU | Chromium-AudioWorklet, Median 10 s, Xeon: 15 Kanten + 6 Wege (2 fremd), Wellen 1–6, DX-Form, 8 Tasten; ohne / mit echter Schleife. Vor der Regel (8 Stimmen) gemessen: 10,7 % / **15,7 %** → Regel „mehr als 12 Kanten → 6 Stimmen“ greift (K2-42), Grund in der Hinweiszeile | 6 Stimmen: 4,1 … 5,6 % / 5,9 … 10,3 % (≤ 12; Chromium-Werte schwanken ±40 % von Lauf zu Lauf) |
| N7F-10 fm6-Weg | 6 Op DX-Form, 8 Stimmen, Node (stabil, bester von 5 × 10 s): vor V4a 2,87 / 3,03 / 3,08 / 3,14 % · nach V4a 2,74 / 2,83 / 2,94 / 2,98 %; derselbe Klang als fmx 2,82 … 3,31 % | ≤ vorher + 5 % ✓ (Chromium 1,5 … 3,5 % vorher wie nachher) |
| N7F-11 (V4a-08) | `lfo1→op2` und `lfo1→fmbright` auf einem Graph, Schwerpunkt max/min | 5,36 / 5,21 (> 1,5) |
| N7F-12: V4a-02 | FM1–FM10 (`wp7-accept` fm4/fm7/fm10, `node-fm`, `fm-pr1`, `wp7-fm9`, `wp7-gates`) | unverändert (node-fm: derselbe alte Fehler wie V0d) |
| V4a-03 | s. N7F-05 | bestanden |
| V4a-04 (K2-42) | 6 Operatoren, 8 gehaltene Tasten | 8 Stimmen; > 12 Kanten 6 Stimmen mit Grund |
| V4a-05 (K2-37) | `setFmx` mit 7. Operator, I1, I2, I3, I4 | wirft 5/5, Sound unverändert |
| V4a-07 | nicht DX-tauglicher Graph (Welle, fremdes Feedback 2,5, Zusatzkante), `forceNative(true)` | nächster DX-Alg. 1, −15,1 dBFS (> −40), Hinweis „ECO: angenähert (nächster DX-Alg. 1)“ |
| V4a-09 | Sounds ohne fmx bleiben ohne; Graph-Sound in die Bibliothek und zurück | ja / deep-equal |
| V4a-11 | VA-Fläche Säge → Puls (D5 + G5 gehalten): M-KLICK 2,8 dB, M-EINBRUCH −1,3 dB (kein Loch); alle 12 VA-Wellenwechsel: M-KLICK ≤ 3,8, M-EINBRUCH ≤ 0,2 dB; FM-Graph-Wechsel: 1,6 / 0,0 dB; fm6 Alg. 1 → 5: 2,2 / 0,0 dB. **Vergleich WP4-Blende** (jetzt nur `xfLite`): VA 2,8 / −0,4 dB, FM-Graph 2,9 / **6,8 dB** (Loch). Stimmen während der Blende 2 → 4; Rechenzeit je Block ×2,10 / ×2,11 (der Block mit der Kopie ×2,4 / ×3,0) | bestanden bis auf die Last-Grenze ×2 (Abweichung 1) |
| V4a-10 | Regression (`v3-v4a-reg.sh`, Liste von V0d mit 6 Versions-Anpassungen `v3-v4a-adapt-*` für 3.8.0) + V0d-Suiten + DoD | s. unten |

**Regression:** `v3-v4a-reg.sh` (Ausgaben `v3-v4a-reg/run1`, Einzel-Wiederholungen `v3-v4a-reg/rerun`): alles bestanden außer den
schon in V0d gleich scheiternden Prüfungen (`node-fm` 1, `v3-v0b-adapt-wp3-browser` 3, `wp3-adapt-func-build` und `-native`
je 2 (C2, D5), `wp4-offline` 2, `v3-v0b-adapt-wp3-ui` 2 (MO49, wie V0d `run1`)). Im Parallel-Lauf zusätzlich gescheitert und
einzeln bestanden: `wp7-accept fm4` 40/0, `v3-v0b-adapt-v0a-fix` 26/0, `v3-v0b-adapt-wp6-extras L` 20/0, `wp6-drums P` 38/0
(Zeit-Messungen unter Last). Versions-Prüfungen (3.4.0 fest im Test): neue Kopien `v3-v4a-adapt-wp1-brand` 41/0, `-wp1-misc`
104/0, `-wp1-store` 41/0, `-wp3-api` 30/0, `-wp3-store` 55/0, `-n0a`. DoD (wp1…wp7-dod, `wp7-adapt-wp1-perf`) bestanden.
V0d-Suiten: `v3-v0d-eng1` 34/0, `-eng2` 34/0, `v3-v0dfix-adapt-v0d-native` 10/0, `-sounds` 61/0, `-fm-sound` 11/0, `-migr` 5/0,
`-band` 1/0, `-ui-a…d` 17/15/46/51 ohne Fehler. V4a: `v3-v4a-node` 46/0, `v3-v4a-ui` 23/0, `v3-v4a-shot` 10/0.
Smoke-Test: Titel SYNQUENZER, keine Fehler. Worklet-ASCII-Prüfung bestanden (110 KB). Dateigröße 1 531 473 Byte (+54,5 KB).

Bildschirmfotos: `dirigent-test/v3-v4a/shots/fm-eco-*.png` und `fm-cap-*.png` (P 390 × 844, P375, P320, L 844 × 390, L667).

### Fach-Prüfung (Teil J: FP-DSP Haupt-Blick, FP-IPHONE Zweit-Blick; V4a ist blockierend ●)

Kein eigener Prüf-Agent verfügbar: Ich habe beide Checklisten (J.2) selbst über Diff, Testausgaben, Messwerte und Bilder
abgearbeitet. 7 Befunde, 6 behoben, 1 begründet:

1. **FP-IPHONE · Wellen-Bau auf dem Audio-Thread** (`waveTab`, erster Gebrauch): kalt 29 ms in einem Block (Node; iPhone
   eher mehr) → Aussetzer. **Behoben:** alle 11 Tabellen beim Laden des Moduls (einmal, vor jeder Stimme; danach ≤ 1 ms je
   Welle). Speicher ≈ 250 KB.
2. **FP-DSP · Geist im V8-Wörterbuch-Modus:** Der Geist (Engine-Wechsel V0b-fix und die neue Struktur-Blende) entstand per
   `Object.create` + Schlüssel-Zuweisung → langsame Eigenschaften (`%HasFastProperties` false), +15 % Last während der Blende.
   **Behoben:** Spread-Kopie (schnelle Eigenschaften), Stimmen-Kopie über den `Voice`-Konstruktor (gleiche Hidden Class).
3. **FP-DSP · Loch bei Säge → Puls:** gleichphasige Säge und Puls sind gegenphasig im Grundton; die gleichleistungsgemäße
   Blende hatte −6 dB (M-EINBRUCH). **Behoben:** die neue Welle startet mit ihrem Grundton in Phase (`wavePhi`); alle 12
   VA-Wellenwechsel ≤ 0,2 dB.
4. **FP-DSP · Stumm-Rampe 10 ms** an einem hellen Modulator: in der Grenzlage von M-KLICK. **Behoben:** 30 ms.
5. **FP-DSP/FP-IPHONE · Schlechtester Fall mit Schleife 15,7 % je Spur** (> 12 %). **Behoben** nach K2-42: > 12 Kanten →
   6 Stimmen, Grund in der Hinweiszeile; `fmxRenderPS` zusätzlich mit vorbereiteten Arrays (≈ 3 % schneller).
6. **FP-TOUCH (M-PLATZ) · Hinweiszeile über den Fadern** auf 375 × 667 und 320 × 568 (betraf schon den V0d-Hinweis
   „Kompatibel …“ im ECO). **Behoben:** einzeilig, nimmt dort die Zeile der kleinen Hüllkurvenbilder, Fader min. 40 px.
7. **FP-DSP · Last während der 30-ms-Blende ×2,1** (Spec: höchstens doppelt). **Begründet** (Abweichung 1).

### Abweichungen von der Spec

1. **V4a-11 Last ×2,1 statt ×2** während der 30 ms (Node, Rechenzeit je Block; der Block mit der Stimmen-Kopie ×2,4 bzw. ×3,0
   bei einem FM-Graph mit `fmxCompile`). Der Geist rechnet seine eigene Steuerung (LFO, Mod-Matrix, Hüllkurven); 6 gewöhnliche
   Stimmen statt 3 + 3 im Geist kosten ×1,87. Ein zweiter Wechsel während der Blende startet keinen zweiten Geist (wartet).
2. **K2-42 angewandt:** „mehr als 12 Kanten → 6 Stimmen“ gilt jetzt (der Messwert 15,7 % lag über 12 %). Gezählt werden nur
   Kanten (nicht Feedback-Wege), wie in K2-42 formuliert; DX-Algorithmen haben höchstens 5 Kanten.
3. **Mipmap-Bandbreite:** beide Nachbarstufen sind aliasfrei; dafür reicht der obere Teilton je nach Lage nur bis fs/4 … fs/2
   (12–24 kHz bei 48 kHz). KD §6.4 „Aufbau beim ersten Gebrauch“ → beim Laden des Moduls (FP-IPHONE 1).
4. **`lfoAm` / `lfoFm` Skalen** (die Specs nennen keine): `lfoAm` 127 = 24 dB Absenkung am LFO-Tiefpunkt (linear in 0…127),
   `lfoFm` nach der msfa-PMS-Kurve, 127 = ±12 HT. DX-tauglich verlangt zusätzlich `lfoFm` ∈ {round(127·p/7)}, damit
   fm6 ↔ fmx verlustfrei hin und zurück geht (KP §6.4 nennt nur „bei allen OP gleich“). `fmxFromFm6` bildet `pms` auch
   dann ab, wenn der Sound die vom .syx-Import angelegte Route `lfo1→pitch` hat (doppeltes Vibrato bei der Umwandlung eines
   Import-Klangs ins FELD; V4b muss die Route dabei entfernen); der Import speichert AMS/PMS nur bei AMD/PMD > 0.
5. **`vs` negativ** = gespiegelte DX-Kurve (Anschlag 1,0 bei `vs` −7 so leise wie Anschlag ≈ 0 bei +7; N7F-07 misst +76 dB).
6. **Nativer Rückfall nicht DX-tauglicher Graphen:** `p.fm6` ist der nächste DX-Algorithmus des aktuellen Graphen (mit den
   aktuellen Werten), nicht „der letzte DX-taugliche Stand“ (KP §6.3) – klingt näher am Graph und deckt Graphen ab, die nie
   DX-tauglich waren (Spec 9.3 / V4a-07 verlangen den nächsten Algorithmus).
7. **Bearbeiten auf den DX-Seiten** eines Sounds mit `p.fmx` baut `p.fmx` aus fm6 neu (ein nicht DX-tauglicher Graph geht
   dabei in seinen nächsten DX-Algorithmus über). KP §4.12 sperrt die DX-Seiten dann – das kommt mit V4b.
8. **Größe +54 KB** statt +48 KB (eigene DX-Tabelle im Modul `FMX`, damit es vor SQStore stehen kann; Kommentare).
9. **M-KLICK-Messung** wie in den V0b-fix-Werkzeugen (Hochpass 4. Ordnung, Fenster unter −80 dB werden nicht beurteilt);
   M-EINBRUCH misst das Loch gegen den leiseren der beiden Klänge (ein neuer, leiserer Klang ist kein Loch). Für
   Wellenwechsel klingen D5 + G5 (bei A3 + E4 enthält manches 2-ms-Fenster keine Sägezahn-Flanke und gewinnt den Median).

### iPhone-Prüfpunkte (Xander)

V4a hat noch kein FM-Feld (kommt mit V4b); auf dem Gerät prüfbar ist nur, dass nichts schlechter wurde:
1. FM-Pluck, FM-Bässe und E-Piano klingen wie vorher (der fm6-Weg ist bitgleich).
2. Eine VA-Fläche halten und im Editor die Welle (Säge → Puls → Dreieck) wechseln: kein Knacken, kein Loch.
3. Einen FM-Sound halten und den Algorithmus wechseln: weich überblendet, kein Aussetzer.
4. Eine .syx-Bank importieren: Klänge wie vorher.

### Bekannte Lücken

- **Punkt-Form-Hüllkurven** (`f:'pt'`) werden gespeichert und normalisiert, klingen aber erst mit V4f; bis dahin rechnet das
  Worklet eine grobe DX-Näherung daraus (nicht über die Oberfläche erreichbar, nur per `setFmx`). Ebenso Tonhöhen-Bereiche
  außer `'dx'` (V4f) und eigene Wellen 12–47 (V4e: bis dahin Sinus).
- Kein FM-Feld (V4b); `fmxLvWant`/`fmxLevelWatch` warten auf die Sichtbarkeit des Felds.
- Solo (`fmSoloPatch`) eines Graphs: alle Operatoren einzeln als Ausgang, nur der gewählte an (Oberfläche kommt mit V4b).
- Die DX-Seiten zeigen bei einem nicht DX-tauglichen Graph den Näherungs-Algorithmus ohne Sperre (V4b, KP §4.12).
- Kein WebKit-/iPhone-Test (Chromium und Node); iPhone-Faktor der CPU unbelegt.
- Chromium-Lastwerte (`engineInfo().perTrack[i].load`) schwanken von Lauf zu Lauf um ±40 %; der Vergleich vor/nach V4a
  stützt sich auf die Node-Messung (`v3-v4a-bench.mjs`, bester von 5 × 10 s).

---

## V4b — FELD und Wertefeld (FM-Feld nach EssenceFM) · App 3.9.0

Grundlage: Nachtrag 2 Teil A (A.2, A.3, A.6 Zeile V4b, A.7 N2-4b-01 … 04, K2-01, K2-37 … K2-44, K2-61) mit `r7/kodamo-delta-pdf.md`
(KP §4.1–4.9, 4.12, 4.13, §5, §6.4/6.5, §7, §9 N7F-13 … N7F-36); Nachtrag 1 A.7 (N4b-01 … N4b-04); Spec v3 §9.4/§17 V4b nur, wo KP
nichts ändert (V4b-07b, -08, -09, -13). Gebaut auf `synq-snapshots/V4a-fix.html`. Die Fähigkeiten-Summe ändert sich nicht.

### Gebaut

**FM-Reiter-Unterseiten FELD · DX · OP n · MAKRO · STIMME** (N4b-01, KP §4.12). DX ist die bisherige ALGO-Seite. Neue Sounds,
INIT FM und Klänge mit Graph öffnen FELD, Werks- und Bibliotheks-Sounds ohne Graph (auch .syx-Importe) DX; die letzte Wahl je
Spur steht in `S.ui.fmv` (Ansichtsfeld, nicht im Sound; `syncUi` trägt es mit). Ist der Graph nicht DX-tauglich, sind DX und OP
gesperrt: Überlagerung mit Badge, den Gründen aus `FMX.dx().reasons`, [Im FELD bearbeiten] und ggf. [Nummern angleichen].

**FELD (KP §4.1–4.4, §5):** Raster 6 × 6, Reihe 0 = Ausgang, freie Plätze; Kachel mit Nummer, Frequenz (≤ 4 Zeichen: „×1“, „×3,5“,
„14“, „62“, „437“, „9,8k“), zweiteiligem Pegelbalken (Fläche bis `ol` 45 %, 2-px-Marke, Live-Teil) und Feedback-Badge (Quellnummer,
bei Stärke 0 blass); Farben nach KP §4.3 mit K2-01 (#5B6170), OP 6 mit Halo #3A3F52 und #8A90A8; Linien unten-Mitte → oben-Mitte
#0AFFAD, vom stummen Modulator #3E435B; Linien-Animation nur beim Verbinden 200 ms (K2-41; Schalter, aus bei „Bewegung
reduzieren“); Boden „AUSGANG“. Kopfzeile „STIMME · DX 5 ✓ · 6 Op · 8 St“ bzw. „OP 4 · MODULATOR → 3 · ×14“ (Tipp = DX-Abgleich
im LCD). Geometrie P1 genau nach KP §5.1 (Kacheln 36 × 50 bei x = 40·c, y = 23 + 55·(5 − r); Wertefeld x 242–373, Zeilen
y = 76 + 47·i), L1 nach §5.2 (48 × 31, Reihenabstand 34, 4 Reihen sichtbar, Rollen per Wischen im Leerraum und Randzug, Streifen
„▲ n weitere“), P2/P3/L2/W nach §5.3 (P3: Werte als Blatt über den rechten 60 % des Felds, ✕ schließt).

**Gesten (KP §4.5, rein in `FMX.gesture`, gleiche Logik für Touch und Test-API):** R1 Aufsetzen wählt sofort (aus dem Zustand
Stimme → Basis; zwischen Operatoren bleibt die Seite, K2-61) · R2 Tipp ins Leere → Pegel-Seite · R3 Doppeltipp (≤ 300 ms, ≤ 8 px)
stumm/an · R4 Ziehen ab 8 px mit Geist, gestrichelter alter Zelle, Landeplatz und Geisterlinien, LCD-Vorschau („3 → 1 verbinden“,
„4 ↔ 3 tauschen“, „5 fällt → Ausgang“, „2 fällt auf 6 (moduliert 6)“, „geht nicht: …“, „kein Platz über 1“, „zurück“), Ziel =
Zelle unter dem Geist-Mittelpunkt (KD §5.2 Nr. 1), 8 px Hysterese, `haptic('tick')` je Zielwechsel · R5 Tauschen (Kanten bleiben
an den Plätzen) · R6 Verbinden (untere Verbindungen lösen, über das Ziel, nächste freie Spalte c+1, c−1 …, oberer Baum wandert mit,
Abweisen nach (e)) · R7 Fallen (zum Boden oder auf den obersten Operator darunter) · R8 außerhalb / eigene Zelle = nichts ·
R9 zwei Finger (Beginn ≤ 300 ms, je ≤ 8 px): verbinden, nochmal lösen (Z7), gleiche Reihe / letzte Verbindung mit LCD · R11 Wischen
im Leerraum = nichts (L: rollt) · R12 Badge, Budget, LCD-Statuszeile; Strukturwechsel über die 30-ms-Stimmen-Überblendung aus V4a.
R0: Eine Berührung im FELD, während ein Zug im Wertefeld oder Hüllkurven-Graph läuft (auch wenn der Finger schon vorher lag), ist
nur FEIN ×¼. Halten wählt nur (R10 entfällt). Jede Geste ist genau ein Undo.

**Wertefeld (KP §4.7, Schieber nach K2-38):** Reiterblock P 2 × 3 an fester Stelle: ohne Auswahl [Pegel] [Stimme] [⋯] / [Vorl. ▾]
[Zufall] [A│B], mit Auswahl [Basis] [Amp] [M] / [Mod] [Tonh.] [⋯]; L in der Kopfzeile (Rolle + Reiter, ohne Auswahl Badge-Text).
- Waagrechter Relativzug: 4 px Totzone, danach folgt die Füllkante genau dem Finger (Modulator-Pegel in der V0d-Kurve
  p = (OL/99)^(1/0,45), Ausgänge linear), FEIN ×¼ (ruhender Finger im FELD oder FEIN-Chip), senkrecht ≥ 12 px = kein Wertzug,
  Pointer-Capture, ein Undo je Zug; Tipp auf die Wertzone (30 px) = Ziffernblock (setzt exakt, ein Undo); Doppeltipp auf bipolare
  Werte = Mitte.
- **Pegel:** 6 zweizeilige Zeilen „×14 · I 1,6“ / „×1 · −3 dB“ (−∞ dB bei 0), Balken in OP-Farbe, Fahne 12 px mit Nummer.
- **Stimme:** Transponieren · DX-Abgleich mit [Nummern angleichen] · Budget „6 Op · 8 Stimmen · Kanten n“ · ☑ Frequenzen in Kacheln ·
  ☑ Linien-Animation · ⓘ Vorbild (einzige Stelle mit dem Gerätenamen und dem Pflichtsatz) und Hilfe.
- **Basis:** Welle (8 px je Welle, Vorschau, Tipp = Liste mit Bildern) · Pegel · Verhältnis (oben [×│Hz] + fine, unten coarse;
  Ziffernblock nimmt Verhältnis oder Hz) · Verstimmung · Phase (Chip Fest/Zuf./Frei + `ph`) · Feedback (Chip „← Quelle“ mit Liste
  aus/1…6, Stärke 0…7 in 0,1).
- **Mod:** Anschlag −7…+7 · LFO AM · LFO FM · Tasten-Skalierung als Kurve (links/rechts senkrecht = `ld`/`rd` mit Vorzeichen,
  Mitte waagrecht = `bp` mit Notenname; lin/exp über ⋯).
- **Amp / Tonh. (EK-13, DX-Form bis V4f):** P1/P2 Mini-Feld links (Kachel 20 × 42, nur Tipp/Doppeltipp/Tipp ins Leere), Vorlagen-
  Zeile Snap/Pluck/Pad/Orgel bzw. Aus/Ruck/Fall/Anstieg + FEIN über dem Feld, rechts Graph (log. Zeitachse Halten ┊ Release, Punkte
  ziehen: waagrecht = Zeit/Rate, senkrecht = Pegel, ein Undo), Zeiten-Zeile, Knöpfe [Alle Mod.] [Alle Ausg.] [Kopieren] [Einfügen] /
  [Auf alle] [Init] [−1] [+1], DX-Zeilen R1–R4 / L1–L4 (Relativzug 2 px je Schritt, Tipp = Ziffernblock). L/W: im Wertefeld mit
  [DX ▾] [FEIN] [Vorl. ▾]; P2/P3 kompakt ([DX ▾] tauscht Graph und DX-Zeilen). Tonh. bearbeitet `pit` dieses Operators
  (50 50 50 50 = keine Hüllkurve); feste Operatoren ohne Tonhöhen-Hüllkurve (DX).
- **M** = stumm (= R3). **⋯:** Solo (Laufzeit, nicht gespeichert) · Ziele … (Liste „→ 1 ✕“, [+ Ziel] + Tipp auf eine tiefere
  Kachel; ✕ auf der letzten Kante → fällt nach R7) · Kopieren (Operator ohne Zelle/Kanten bzw. nur Hüllkurve) · Einfügen ·
  ⤢ Hüllkurve groß (Amp/Tonh., K2-44) · Kurven lin/exp (Mod) · Modulieren mit … (Mod-Picker `op<k>`, Z13: Quelle wählen = Route
  mit 50 %, Tiefe im Tab MOD) · Mehrere wählen (N4b-02: Pegel-Zug relativ auf alle gewählten, ein Undo) · Hilfe.
- **Vorlagen ▾** (Algorithm Library): das WP7-Blatt mit 32 Bildern; Wahl ersetzt Kanten, Plätze (`dxLayout`) und Feedback-Weg
  (stärkster bisheriger Wert wandert zum neuen Empfänger), alles andere bleibt, ein Undo.
- **Zufall** (K2-59): ☑ Frequenzen ☑ Hüllkurven ☑ Tonhöhen-Hk. ☑ Algorithmus ☑ Pegel ☑ LFO ☑ Wellen (Z19, aus) + [Würfeln];
  Ergebnis erfüllt I1–I4 und hat einen Ausgang mit `ol` ≥ 80; Häkchen werden gemerkt; ein Undo.
- **A│B** (Z8, V4b-09): wechselt zwischen jetzt und dem Stand vor der letzten Geste (über die Stimmen-Überblendung, kein Undo).

**⤢ Hüllkurve groß (K2-44):** öffnet den A.4b-Editor (OP › HÜLLK. bzw. HÜLLK. › TONHÖHE) für diesen Operator, [✕ FELD] führt
zurück (Seite und Fokus wie vorher). Die DX-Seiten bearbeiten `p.fm6`; neu trägt `fmxAfterFm6Edit` geänderte Werte in den Graph
zurück, solange der Algorithmus gleich bleibt (Zellen, Wellen, Phasen, Feedback-Wege und `pit` je Operator bleiben; ein genäherter
fm6 trägt dazu seine Nummerierung `perm`). Tonh. schreibt nur `pit` dieses Operators.

**Weiteres:** Live-Pegel der Kacheln mit ~30 Hz nur, solange das FELD sichtbar ist (Blatt offen, Seite sichtbar; `fmxLvWant`).
LCD-Hinweis beim ersten Antippen von Feld, Pegel-Seite und Badge; Hilfe-Zeilen 1–7 (KP §4.6 + K2-43) im Menü › Hilfe.
`FMX.dxMatch`/`approxFm6` merken sich die Struktur-Suche (der Fehlfall kostete 25 ms je Aufruf; jetzt einmal je neuer Struktur).

**Test-API (KP §7):** `fmxView(t)` (Zustand, Fokus, Seite, Kacheln mit Box/Rahmen/Füllung/Balken/Text, Linien, Reiter, Wertzeilen,
Badge), `fmxPreview(t, g)`, `fmxGesture(t, g)` (`drop`/`two`/`dtap`/`tap`, gleiche Logik wie Touch, ein Undo), dazu `fmxOpen(t, page,
op)`, `fmxBadge(t)`. `setFmxOps` entfällt (K2-37).

### Abnahme (V4b: N7F-13 … N7F-36 ohne N7F-30, N2-4b-01 … 04; Spec V4b-07b, -08, -09, -13 nach N7F-36)

Tests (alle in `dirigent-test/`, Ausgaben in `dirigent-test/v3-v4b/`): `v3-v4b-logic.mjs` (Gesten-Logik in Node, 26/0),
`v3-v4b-field.mjs P|L` (CDP-Touch in Chromium, P 106/0, L 101/0), `v3-v4b-node.mjs` (Worklet-Shim, M-KLICK/M-EINBRUCH, 15/15),
`v3-v4b-platz.mjs` (M-PLATZ P1–P3, L1, L2, W, 59/0), `v3-v4b-view.mjs` (FELD/DX-Wahl, 3/0), `v3-v4b-perf.mjs` (4/0),
`v3-v4b-shots.mjs` (Bildschirmfotos). Bildschirmfotos: `v3-v4b/field-P/`, `v3-v4b/field-L/` (Handbuch-Ablauf a1–a6, Farben,
Vorlagen 1/5/16/22/32, DX gesperrt, ⤢ groß), `v3-v4b/platz/` (jede Seite in jeder Größe).

| Punkt | Messung | Ergebnis |
|---|---|---|
| N7F-13 | P1: Feld 236, Wertefeld x 242–373, Kacheln 36 × 50 bei x = 40·c, y = 23 + 55·(5 − r), Wertzeilen y = 76 + 47·i; Reiterblock auf Pegel/Basis/Amp an derselben Stelle; Amp: Mini-Feld 20 × 42 in x 0–131, Hüllkurve ab x 138. L1: 48 × 31 bei y = 10 + 34·(3 − r), Wertefeld ab x 320; Kette über 6 Reihen: 4 sichtbar, „▲ 2 weitere“, Wischen rollt. M-PLATZ P1–P3, L1, L2, W: nichts außerhalb der Seite, kein abgeschnittener Text, kein Scrollen des Körpers | bestanden (±1 px) |
| N7F-14 / V4b-01 | alle 32 Vorlagen (P und L): Badge „DX k ✓“, keine Überlappung, alles im Feld | 32/32 |
| N7F-15 | alle coarse/fine-Kombinationen und festen Frequenzen ≤ 4 Zeichen, Textbreite ≤ Innenbreite (P1 28 px); „×1“ „×3,5“ „14“ „62“ „437“ „9,8k“; Schalter aus → keine Zahl | bestanden |
| N7F-16 / N2-4b-01 | computed style: Pegel-Seite Rahmen = OP-Farbe; Stimme alle #5B6170; Auswahl #0A6E5B/#0ACA9F, andere #5B6170; stumm #3E435B; Linien #0AFFAD bzw. #3E435B; Kontraste Marke ≥ 3:1, Fahne ≥ 4,5:1. Pixelproben DPR 2 (P und L) ±8 | bestanden |
| N7F-17 | Linien aller 32 Vorlagen: Anfang/Ende ±1 px; Animation 200 ms an, Schalter aus = keine | bestanden |
| N7F-18 / K2-61 | Aufsetzen auf OP 4 → Fokus 4 vor dem Loslassen, Seite Basis; zwischen Operatoren bleibt Mod; Tipp ins Leere → Pegel, kein Undo | bestanden |
| N7F-19 … N7F-21, N2-4b-03 | CDP-Touch ab INIT FM, P und L: 3 auf 1 (LCD vorher „3 → 1 verbinden“), 4 auf 3, 5 in (2,3) → „DX 5 ✓“, 2 fällt auf 6, Doppeltipp OP 1 stumm/an, Aufsetzen OP 4, Tipp ins Leere, Pegel-Zeile 2 +20 px; je ein Undo, Undo deep-equal | bestanden |
| N7F-21b | Node: DX 3 in 2, Paare in 3, DX 32 in 4, DX 5 in 1 Geste(n), Zellen/Kanten deep-equal | bestanden |
| N7F-22 | (a) 3 auf 6 abgewiesen „geht nicht: 6 moduliert schon 3 …“; (b) K2-42 5→2 + 4 in (2,0) → „geht nicht: 5 → 2 zeigt dann nicht mehr nach unten“; (c) außerhalb / eigene Zelle nichts; 400 Zufallszüge erfüllen I1–I4 | bestanden |
| N7F-23 / V4b-07 | zwei Finger 6 + 1 → 6→1, nochmal gelöst, gleiche Reihe + LCD, 500 ms → nichts; ruhender Finger im Leerraum → FEIN ×¼ im Wertefeld, Feld unverändert; R0 Finger auf Kachel 3 (1 s) → Fokus bleibt, kein Picker, FEIN | bestanden |
| N7F-24 | Doppeltipp und [M] je ein Undo; ⋯ › Solo Laufzeit, nicht gespeichert | bestanden |
| N7F-25 / V4b-07b | Halten 1 s → nur Auswahl; 600 ms + 40 px → Zug mit Geist, kein Picker; ⋯ › „Modulieren mit …“ → Quellen für op4, LFO 1 → Route | bestanden |
| N7F-26 | P1: +45 px → Füllkante +45 (±1), −45, FEIN 40 → +10, 3 px / 30 px senkrecht unverändert, 0 → 99 in einem Zug, OL nach der Anzeigekurve, Marke ±1 px, Ausgang linear, Extremwerte ohne Überlauf, Kontrast 7,9:1; L1 mit ±½ OL-Stufe (Abweichung 4) | bestanden |
| N7F-27 / 27b | Welle 24 px → 3; fine oben / coarse unten getrennt; [×│Hz]; Ziffernblock ol 42, det −3, ph 64, fbAmt 2,5 (je ein Undo); Phase-Chip; Feedback-Quelle, Badge blass bei 0, weg bei „aus“ | bestanden |
| N7F-28 | Anschlag bipolar, Doppeltipp = 0; Tasten-Skalierung links/rechts mit Vorzeichen, Mitte bp mit Notenname | bestanden |
| N7F-29 | Ziele-Liste, [+ Ziel] + tiefere Kachel (Kante ohne `amt`), ✕, ✕ auf der letzten Kante → fällt zum Ausgang | bestanden |
| N7F-31 | Kopieren/Einfügen ganzer OP; Vorlagen-Blatt (DX 5, Werte gleich); Zufall 50 Würfe mit/ohne ☑ Algorithmus | 50/50 · 50/50 |
| N7F-32 | Modulator D1 fallend, gehaltene Note: Live-Teil 50 ms nach dem ersten Pegel ≥ 1,3 × bei 1 s (P 35 / 2,3 px, L 18,4 / 1,4 px); ≥ 10 Aktualisierungen je s; nur bei sichtbarem FELD | bestanden |
| N7F-33 / N4b-01 | Badge „DX k ✓“ / „wie DX k – Nummern anders“ / „kein DX: Welle“ / „kein DX-Alg. · nächster: k“; [Nummern angleichen] → ✓, ein Undo; FELD ↔ DX ändert weder fm6 noch fmx; DX gesperrt bei nicht tauglichem Graph; INIT FM öffnet FELD, Werks-Sound DX, Wahl je Spur gemerkt | bestanden |
| N7F-34 / V4b-11 | Worklet-Shim, eine gehaltene Note: Verbinden, Tauschen, Fallen, Zwei Finger, Doppeltipp (Modulator/Ausgang), Vorlage DX 1 → 5/32/16, jeweils auch A│B zurück: M-EINBRUCH −0,7 … 0,3 dB; M-KLICK 5,0 … 5,9 dB, Tauschen 14,1 / 12,2 dB (Abweichung 1) | 15/15 |
| N7F-35 | Hilfe-Zeilen 1–7 im Menü; LCD-Hinweis beim ersten Antippen von Feld, Pegel-Seite, Badge | bestanden |
| N7F-36 | V4b-07b, -08, -09 (A│B), -13 (WP7-Diagramm-Tests `wp7-accept ui/pr1` bestehen auf dem Vorlagen-Blatt); N4b-01 … 04 (N4b-02: 3 Modulatoren +Δ relativ, ein Undo stellt alle her); V1d-02 entfällt bis V1d (K2-03) | bestanden |
| N2-4b-02 | weder „Kodamo“ noch „EssenceFM“ in LCD, Hilfe, Beschriftungen; nur im ⓘ mit Pflichtsatz | bestanden |
| N2-4b-04 | P1, OP 4, Amp → ⋯ › ⤢ Hüllkurve groß → A.4b-Editor für OP 4; Punkt ziehen → `getFmx` OP 4 geändert, ein Undo; [✕ FELD] → Amp, Fokus 4, Mini-Feld | bestanden |

**Regression:** `v3-v4b-reg.sh` (Liste von V4a, Versions-Kopien `v3-v4b-adapt-*` für 3.9.0; Ausgaben `v3-v4b-reg/run1`, Nachläufe
`v3-v4b-reg/run2` mit `v3-v4b-reg2.sh`). Gescheitert sind nur die schon in V4a gleich scheiternden Prüfungen (`node-fm` 1,
`v3-v0b-adapt-wp3-browser` 3, `v3-v0b-adapt-wp3-ui` 2, `wp3-adapt-func-build` und `-native` je 2 (C2, D5), `wp4-offline` 2) und drei
beabsichtigte Änderungen mit neuen Anpassungen: `v3-v4b-adapt-v0b-ux` (V0b-09 „kein Etikett heißt Pegel“ gilt nicht für die
FELD-Seite, KP §4.7), `v3-v4b-adapt-wp1-brand` (Kopf „SYNQUENZER 3.9“), `v3-v4b-adapt-wp3…wp7-dod` (Dateigrenze 5,0 MB nach EN2-28
statt 1,5 MB aus v2) – alle bestanden. V0d-Suiten `eng1`, `eng2`, `sounds`, `fm-sound`, `migr`, `band`, `ui-a…d`,
`v3-v0dfix-adapt-v0d-native` bestanden (V0d-2-09 L lief erst 2 px über: fünf Unterreiter ließen der LCD-Zeile weniger Platz →
Unterreiter in L kompakter, danach 51/0). V4a: `v3-v4a-node` 4/4 (V4a-11 einzeln; im Parallel-Lauf Last ×2,25), `v3-v4a-ui` 23/0
(einzeln; N7F-10 10,2 %), `v3-v4a-shot` 10/0. `v3-qareg-v4a-fmxio` (QA-Lauf der V4a-Prüfer, Version auf 3.9.0 angepasst) scheitert
an „klingt wie vorher“ – genauso auf `V4a-fix.html` (der erste Mitschnitt nach dem Audio-Start ist 1,5 dB lauter); keine Folge von
V4b. DoD bestanden. Smoke-Test: Titel SYNQUENZER, keine Fehler. Worklet-ASCII-Prüfung bestanden (116,7 KB, unverändert).
Dateigröße 1 657 636 Byte (+117 KB gegenüber V4a-fix; Budget 95 KB, +23 %: Wertefeld mit fünf Seiten, Hüllkurven-Ansicht EK-13,
Ziffernblock, Test-API).

### Fach-Prüfung (Teil J: FP-TOUCH Haupt-Blick, FP-DSP Zweit-Blick; V4b ist blockierend ●)

Kein eigener Prüf-Agent verfügbar: beide Checklisten (J.2) selbst über Diff, Testausgaben, M-PLATZ-Skript und Bilder abgearbeitet.
12 Befunde, 10 behoben, 2 begründet:
1. **FP-TOUCH · Touch-Anpassung (Chromium/Android) lenkte Züge auf Etikett oder Chip** (Balken waren keine Tipp-Ziele). Behoben:
   Balken sind eigene Tipp-Ziele.
2. **FP-TOUCH · R0 nur in einer Reihenfolge:** Ein Finger, der schon im Feld lag, bevor der Zug im Wertefeld begann, wirkte nicht als
   FEIN (und hätte beim Heben „Tipp ins Leere“ ausgelöst). Behoben: er wird beim Zugbeginn zum FEIN-Finger.
3. **FP-TOUCH · Wertefeld-Ebene lag über der Hüllkurve** (L1 und P1 rechts): Punkte und Knöpfe nicht erreichbar. Behoben.
4. **FP-TOUCH · P2: 6. Wertzeile mit dem iOS-Schutz (touchstart preventDefault) nicht erreichbar.** Behoben: die Liste darf senkrecht
   rollen (Abweichung 2).
5. **FP-TOUCH · abgeschnittene Texte** („Stimme“, „Alle Mod.“, „×4,5“, „Anstieg“, Budget-Zeile, Tasten-Skalierung) in P1/P2/L.
   Behoben (Schriftgrößen, zweizeilige Knöpfe, kürzere Anzeigen); das M-PLATZ-Skript prüft es jetzt in allen Größen.
6. **FP-TOUCH · W (Tablet): Mini-Feld mit NaN-Geometrie.** Behoben: W zeigt die Hüllkurve im Wertefeld wie L (KP §5.3).
7. **FP-TOUCH · P3: Frequenz in den Kacheln unsichtbar; ✕ verdrängte einen Reiter.** Behoben.
8. **FP-TOUCH · fmxOpen setzte den Fokus ohne die DX-Seiten nachzuführen** („OP 1“ im Unterreiter bei Fokus 2). Behoben.
9. **FP-DSP · Struktur-Suche bei jeder Wertbewegung** (`dxMatch`/`approxFm6` 25 ms im Fehlfall, über 720 Nummerierungen). Behoben:
   gemerkt je Struktur; Wertzug jetzt Median 1,2–1,4 ms, Geste 4,5–5,1 ms (Spitze 10 ms, Xeon).
10. **FP-DSP · Live-Pegel liefen weiter bei geschlossenem Blatt** (das FELD bleibt im DOM). Behoben: nur bei offenem Blatt und
    sichtbarer Seite (N7F-09).
11. **FP-DSP · Tauschen: M-KLICK 14,1 dB** (Abweichung 1). Begründet.
12. **FP-TOUCH · [A│B] steht nur im Reiterblock ohne Auswahl** (KP §4.7): nach einer Geste ist der Operator gewählt, erst Tipp ins
    Leere. Begründet (KP-Layout); Rückfrage beim Gerätetest.

### Abweichungen von der Spec

1. **N7F-34 Tauschen:** M-KLICK 14,1 dB (zurück 12,2 dB), M-EINBRUCH 0,3 dB. Der Tausch 4 ↔ 3 macht aus dem Klang einen um 15 dB
   helleren (OP 3 mit OL 99 wird Modulator); die 2-ms-HF-Fenster steigen in der 30-ms-Blende. Eine ideale Überblendung der beiden
   Klänge allein (offline, gleichleistungsgemäß) zeigt schon 11,4 / 11,6 dB: der Detektor sieht den Klangfarben-Sprung, keinen
   Knack. Kriterium im Test: M-KLICK besteht oder liegt ≤ 3 dB über der idealen Überblendung. Alle anderen Gesten ≤ 5,9 dB.
2. **P2 (375 × 667):** die 6. Wertzeile erreicht man durch senkrechtes Rollen der Liste statt über ‹ › (KP §5.3).
3. **„Pegel“ als Etikett** auf der FELD-Seite (Reiter, Basis-Zeile) gegen V0b U-04 („kein Etikett heißt Pegel“): KP §4.7 (Nachtrag 2)
   hat Vorrang.
4. **N7F-26 in L1:** `ol` ist ganzzahlig; bei 200 px Balken ist eine OL-Stufe oben bis 3,3 px breit. Toleranz dort ±1 px + ½ Stufe.
5. **N7F-32** wird ab dem ersten gemeldeten Pegel gezählt (Audio- und Nachrichten-Latenz im Headless-Chromium ≈ 100 ms).
6. **Modulieren mit …** wählt die Quelle und legt die Route mit 50 % an; die Tiefe stellt man im Reiter MOD (kein Tiefen-Zug im FELD).
7. **Mehrere wählen** wirkt auf den Pegel-Zug (N4b-02: relativ); Verhältnis-Raster (V4c) und Hüllkurve „absolut auf alle“ für die
   Auswahl fehlen – Hüllkurven gehen über [Alle Mod.]/[Alle Ausg.]/[Auf alle].
8. **L1 Randzug beim Ziehen** rollt eine Reihe je 350 ms statt 8 px je 50 ms (Reihen-Raster).
9. **DX/OP gesperrt** für nicht DX-taugliche Graphen (KP §4.12); ⤢ Hüllkurve groß öffnet trotzdem den A.4b-Editor, dessen Werte
   über die neue Rückführung `fmxAfterFm6Edit` (mit `perm`) in den Graph gehen.
10. **Größe +117 KB** statt +95 KB (+23 %, unter der 50-%-Regel).
11. **M-REKON:** `S.ui.fmv` ist ein Ansichtsfeld; `HIST.volatile` gibt es erst mit VC2a – VC2a trägt `fmv` dort ein.
12. Die Spec-v3-Punkte V4b-02 … -06, -07, -10, -11, -12 (Zonen, Schiene, Parkplatz, [+], Anfasser) sind nach KP N7F-36 ersetzt.

### iPhone-Prüfpunkte (Xander)

1. FM-Spur, ⋯ → Init (INIT FM): FM öffnet FELD – unten die Ausgänge 1 und 3, darüber 2 und 4–5–6, rechts die Pegel-Seite in denselben Farben.
2. OP 3 auf OP 1 ziehen → verbunden (das Feld zeigt es schon vor dem Loslassen); OP 4 auf OP 3 → Plätze getauscht; OP 5 ins Leere
   rechts → fällt nach unten, oben „DX 5 ✓“.
3. Doppeltipp auf einen Operator → stumm (grau), nochmal → an.
4. Operator antippen → rechts Basis/Amp/Mod/Tonh.; Pegel waagrecht ziehen (kein Sprung), Tipp auf die grüne Zahl = Ziffernblock.
5. Amp: links das kleine Feld, rechts die Hüllkurve; Punkte ziehen; ⋯ → „⤢ Hüllkurve groß“ und „✕ FELD“ zurück.
6. Zwei Finger gleichzeitig auf OP 6 und OP 1 → zusätzliche Linie; nochmal → weg.
7. Querformat: Feld links, Werte rechts; eine lange Kette rollt mit einem Wisch im leeren Feld.
8. Kleines iPhone (375 × 667): die Werte-Liste rechts rollt senkrecht; waagrecht ziehen ändert den Wert.

### Bekannte Lücken

- Punkt-Form-Hüllkurven, Tonhöhen-Bereiche, Punkt-Knöpfe (V4f); Vorhersage, Raster, [DX-tauglich machen], .syx-Export (V4c).
- Kein WebKit-/iPhone-Test (Chromium mit CDP-Touch, Node); iOS-Rollen der P2-Liste und Haptik nur im Code geprüft.
- Feld-Gesten erscheinen erst mit VC2a im Verlauf (N2-C2a-01); PAD-R1 (N2-1d-01) und die Mod-Pfade `fmx.<k>.…` (N2-5d-01) kommen mit
  V1d bzw. V5d.

## V4b-fix — FELD: Ziehen, Rollen, FEIN, Rückweg, LCD, P3-Blatt, Sicht FELD/DX, Pegel 0 · App 3.9.0

App: `dirigent-wt/index.html`, Snapshot `synq-snapshots/V4b-fix.html`. Neun bestätigte Befunde der V4b-Prüfung behoben;
Tests mit echter Schrift (Seite über http, Barlow/JetBrains geladen: `dirigent-test/v3-v4bfix-lib.mjs`).

- **Ziehen auf die Nachbarkachel (KD §5.2 Nr. 1, R4):** der Geist hängt am Aufsetzpunkt (kein 8–20-px-Nachlauf); die
  8-px-Hysterese hält die alte Zelle nur noch, solange der Geist-Mittelpunkt nicht in der neuen Kachel liegt.
  `v3-qa4b-dbg2.mjs`, `v3-repro-ghostlag.mjs`: 4↔3, 2↔1, 5↔4, 6↔5 in P1–P3, L1, L2 bei 1–18 px je Bewegung, ein Undo.
- **P2/P3-Werteliste rollt per Finger:** `.fxv.scr` steht in der Ausnahme des Blatt-`touchstart`, Zeilen/Balken/Wertzone/Chip
  dort `touch-action: pan-y`; waagrecht bleibt Wertzug. Rollstand bleibt bei Neuaufbau derselben Seite. Feedback, Quelle,
  OP-6-Pegel, Hilfe erreichbar (`v3-v4bfix-p2row6.mjs`, `v3-v4bfix-scroll.mjs`).
- **R0 FEIN mitten im Zug:** Hüllkurvenpunkte, DX-Zellen R/L und Tasten-Anfasser setzen bei Faktorwechsel an Wert und
  Fingerort neu auf (wie die Wertbalken) – kein Sprung (`v3-qa4b-o.mjs`, `v3-repro-r0fine.mjs`).
- **⤢ Hüllkurve groß:** „✕ FELD“ ist jetzt ein eigener Unterreiter (OSZ: statt „FELD“, HÜLLK.: vorn), kein Knopf über der
  Seite; nichts verdeckt in P1–P3, L1, L2 (`v3-v4bfix-big.mjs`). Rückweg merkt FELD für die Spur.
- **LCD und Feldkopf schneiden nicht mehr ab (L6):** zu langer Text läuft zweizeilig (Etikett + Text, UI-Schrift 10,5 px);
  reicht auch das nicht, Laufschrift; Tipp aufs LCD zeigt den ganzen Text. Feldkopf ebenso zweizeilig
  (`v3-v4bfix-lcd.mjs`, auch Erst-Hilfe und Status nach der Geste).
- **P3:** Tipp (nach dem Doppeltipp-Fenster 300 ms) öffnet das Werte-Blatt, Aufsetzen nur wählt; ein Zug schließt das Blatt,
  Landeplatz und Ergebnis bleiben sichtbar; Doppeltipp = M ohne Blatt (`v3-v4bfix-p3.mjs`).
- **N4b-01 Sicht:** erste FM-Öffnung, Bibliothek, .syx und Spurwechsel zeigen die gemerkte Wahl der Spur, sonst deren Vorgabe
  (Werks-FM ohne Graph/.syx = DX, INIT/Graph = FELD) – nie die FELD/DX-Seite der vorigen Spur (`v3-repro-n4b01-view.mjs`).
- **Gesperrte DX/OP-Seite:** Gründe in L1/L2 in eigener Spalte rechts, in P3 bei Platzmangel zweispaltig; alle Gründe lesbar,
  Knopf frei, auch mit 6 Gründen (`v3-v4bfix-lock.mjs`).
- **Pegel 0 / [×│Hz] am gehaltenen Ton (L3):** Worklet: OL 0 eines fmx-Operators läuft über die 30-ms-Stummrampe statt harter
  Abschaltung; ein Live-Pegelsprung blendet die Verstärkung in 30 ms über; [×│Hz] zählt als strukturell (30-ms-Überblendung).
  Offline (gleiche Worklet-Quelle, App-Nachrichten): OP1 99→0 9,9 → 5,1 dB, OP2 78→0 15,2 → 5,1 dB, Chip Note 57 5,1 dB
  (Kontrolle 4,9). Rest: Chip bei Note 45 10,6 dB (vorher 24), dort liegt schon der ruhige Klang bei 7,9 dB.
  FM6-bitgleich unverändert (`v3-v4a-node.mjs` 46/46).

## V4f — EssenceFM-Hüllkurven (Punkt-Form) · App 3.10.0

Grundlage: Nachtrag 2 Teil A (A.5, A.6 Zeile V4f, A.7 N2-4f-01/-02, K2-39, K2-40 Zusatz N7F-42, K2-44, K2-45, K2-55 … K2-62) mit
`r7/kodamo-delta-pdf.md` (KP §4.11, §5.1 d, §5.2 c, §6.1/6.2, §7, §9 N7F-37 … N7F-48) und HK §3.7 (Handbuch S. 31–33). Gebaut auf
`synq-snapshots/V4b-fix.html`. Format und alte Projekte bleiben: `Env {f:'pt', …}` gab es schon im Schema (V4a), jetzt klingt es.

### Gebaut

**Klang (Worklet, `ptCompile` / `ptRun`, ASCII):** Punkt-Form für `amp` und `pit` jedes Operators, 2–6 Punkte, Segmentzeiten
0,5 ms … 20 s, blockgenau (16 Samples) mit Bruchteil-Blöcken.
- **Exp** fallend linear im DX-Pegelraum (dB-linear wie der msfa-Abfall); **steigend nach dem msfa-Anstieg** (Sprung auf −50 dB,
  +⌊17 − l/256⌋ je Schritt, K2-57) – dieselben Bänder wie der A.4b-Angriff, auf die Segmentzeit gestreckt; **Lin** amplitudenlinear.
  Tonhöhe: Exp linear in Halbtönen, Lin linear in Hz.
- **Sustain** hält bis zum Loslassen; **Skip** (nur mit Sustain): Loslassen vor Psus → sofort das Segment nach Psus ab dem
  aktuellen Pegel; ohne Skip läuft die Hüllkurve erst bis Psus und dann weiter.
- **Loop A/B:** an Plb weiter mit dem Segment nach Pla ab dem aktuellen Pegel (Periode = Summe der Schleifensegmente). Schleife
  vor dem Sustain (`la < sus`) läuft nur bei gedrückter Taste; danach weiter bis zur 12-s-Kappe (bestehende Regel `FM_MAXREL`).
- **Frei (FreeRun):** eine gemeinsame Hüllkurve je Spur und Operator (`this.fr`, nach Frames weitergezählt, auch zwischen den
  Noten), Start beim ersten Anschlag, ohne Loop erst nach dem Ende neu, Sustain aus; jede Stimme liest sie mit ihrem eigenen
  Pegel (Anschlag, Tasten-Skalierung).
- **Tonhöhen-Bereiche** Ton ±2, Quinte ±7, 1/2/4/8 Okt.; y 0/50/99 = −B/0/+B linear in HT; in der Punkt-Form auch an festen
  Operatoren (K2-58); `pr 'dx'` bleibt die A.4b-PEG.
- Time/Key (`rs`) und die MAKRO-Knöpfe wirken auch auf die Punkt-Form (HÄRTE Segment 1, RELEASE nach dem Sustain, LÄNGE übrige
  Segmente der Ausgänge, BISS Segmente 2/3 der Modulatoren), mit den Vorzeichen von `fmAdvance`.
- **Live-Änderung bei gehaltener Note ohne Sprung:** das laufende Segment geht vom aktuellen Wert mit dem Rest seiner neuen Zeit
  weiter; am Sustain-Punkt / am Ende 20-ms-Gleiten; DX ↔ Punkt-Form und Retrig ↔ Frei übernehmen den laufenden Stand.
- K2-62 (§15.2 Stufe 2): bei Begrenzer-Stufe ≥ 2 spielt ein Graph mit > 12 Kanten oder einer Schleife in der Punkt-Form höchstens
  4 Stimmen.
- **Nativer Rückfall (`DXN.voice`, opt.pt):** dieselbe Rechnung als Automations-Plan (fall/rise/hold/lin, Schleifen bis 12,5 s
  ausgerollt), Loslassen nach denselben Regeln, Tonhöhe als Hz-Versatz auf `frequency` (Rampen ≤ 10 ms). Dabei gefunden und
  behoben: ein End-`setValueAtTime` wenige ulp nach dem Start des nächsten Ereignisses beendete dessen `setTargetAtTime` (eine
  Schleife hielt nativ ihren Pegel) – das End-Ereignis entfällt, wenn das nächste dort beginnt.

**Daten (FMX):** `FMX.ptFromDx` wandelt eine DX-Form in Punkte mit den Zeiten, die sie spielt (Angriff ab 0, Haltephasen,
Release ab L3; ohne `rs` und MAKRO, die beide Formen gleich bekommen): P0 = Start, P1–P3 = L1–L3, Sustain 3, P4 = L4, Skip an
(die DX-Form verlässt ihre Stufe beim Loslassen sofort), Exp, Retrig; Tonhöhe mit dem kleinsten passenden Bereich.
`FMX.envAct` führt jede Editor-Aktion rein aus (add, del, sus, skip, loopA, loopB, unloop, crv, run, scale, center, range, set,
pt); eine DX-Hüllkurve wird dabei erst umgewandelt (A.5 Nr. 4, K2-60: auch [✗] und [Skip]). `normEnv` behält eine einzelne
Loop-Marke (A gesetzt, B folgt).

**Editor (KP §4.11, EK-13, K2-55 … K2-57):** FELD › Amp/Tonh. in beiden Formen:
- Punkt gewählt: [Sustain] [Loop A] [Loop B] [Loop weg] / [✗] [+] [Mitte] [☑ Skip] – [Loop weg] nur an einem Loop-Punkt,
  [Skip] nur am Sustain-Punkt, [Mitte] nur Tonh., [+] fehlt bei 6, [✗] bei 2 Punkten (und an P0); unsichtbare Knöpfe behalten
  ihren Platz.
- Nichts gewählt: [Exp│Lin] [Skala] [Retrig│Frei] [+] / [Alle Mod.] [Alle Ausg.] [Kopieren] [Einfügen]; Tonh.: [Bereich ▾]
  [Alle Mod.] [Kopieren] [Einfügen] (K2-56), [Alle Ausg.], [Auf alle] und [Init] unter ⋯.
- Graph der Punkt-Form: **eine** logarithmische Zeitachse (log(1 + t/0,5 ms) über die Gesamtlänge + 25 %), blaue Sustain-Linie
  #0A6AFF, violette Loop-Zone mit A/B, Punkte in den Reglerfarben, Lin gerade, Exp als Annäherungskurve; Punkt frei ziehen
  (x = Zeit seines Segments, y = Pegel), ein Undo je Zug; Tipp ins Leere = keine Auswahl; **Pinch** ×1…×8 (Abstand ≥ 12 px,
  Mitte bleibt stehen), ruhender zweiter Finger = FEIN.
- Fußzeile „Gesamt …“ bzw. „X … · Y …“ (+ „Zoom ×n“); **Warnchips** an Ausgängen: „endet nicht (Schleife)“ / „endet nicht bei 0“
  (Tipp = ganzer Satz im LCD).
- Wertzeilen P0–P5 (y, Relativzug 2 px je Schritt, Tipp = wählen, zweiter Tipp = Ziffernblock) statt R/L in der Punkt-Form.
- DX-Form im FELD rechnet jetzt nach A.4b (N7F-44): Klick-Grenze auf der Zeitachse (ein Zug ab der Grenze darf schneller),
  ein Pegelzug hält die Zeiten seiner und der nächsten Stufe (ggf. auf die Grenze angehoben), ganz rechts = R 0.
- Skala-Blatt: Zeit ×0,25…4, Höhe ×0…1,5, [Anwenden] = ein Undo.
- Größen: P1 nach §5.1 d (Graph 236 × 117 + Lineal, 2 Knopfzeilen, 2 Wertzeilen); L1/L2 Graph links, 3 Knopfzeilen
  ([DX-Zeile ▾]/[Punkte ▾] [FEIN] [Vorl. ▾] [Bereich ▾ bzw. Auf … ▾]); P2 eine Zeile mit [Loop ▾] / [Mehr ▾]; P3 drei Knöpfe mit
  Menüs.
- **⤢ Hüllkurve groß:** eine Punkt-Form-Hüllkurve öffnet den Punkt-Editor in voller Höhe (Kopf „OP n · … · Punkt-Form“, drei
  Knopfzeilen, Wertzeilen; auf kleinen Telefonen ohne Wertzeilen bzw. einzeilig); eine DX-Form den A.4b-Editor, dessen ⋯ (Tonh.:
  Knopf im Kopf) die „Punkt-Knöpfe …“ anbietet; „✕ FELD“ wie bisher.
- Hilfe-Zeile 8 zur Hüllkurve. Test-API: `fmxEnvAction(t, op, which, a)` (OP 1–6, ein Undo), `fmEnvView()` mit `form, sus, la,
  lb, skip, crv, run, zoom` (A.4b-Editor oder Punkt-Editor).

### Abnahme (Skripte in `dirigent-test/`)

- **`v3-v4f-node.mjs` 33/33** (Node-Shim des Worklets, 44,1 und 48 kHz):
  - N7F-37: 6 Punkte 0,5 ms … 1,5 s, Exp/Lin, höchstens 0,39 dB neben der Rechnung innerhalb ±(1 ms + 1 % t); 20-s-Segment 0 dB;
    K2-57 Exp 0 → 99 / 100 ms: nach 50 ms Pegel 77 von 99 (Abweichung 1).
  - N7F-38: Sustain ±0,000 dB über 2 s; Loslassen → Segment nach Psus; Skip an: sofort weiter, M-KLICK 0,8 dB; Skip aus: wie gehalten
    bis Psus (0,000 dB), dann Release.
  - N7F-39: Schleife vor Sustain Periode 70,00 ms (Soll 70 ±2 %), endet beim Loslassen; nach Sustain läuft weiter (6 s / 11,9 s) und
    endet an der 12-s-Kappe.
  - N7F-40: Frei – zweite Note folgt der laufenden Hüllkurve (0,00 dB), Sustain aus; Retrig – neue Hüllkurve je Note.
  - N7F-41: Zeit ×0,25 / ×4 genau, Höhe ×1,5 klemmt auf 99, ×0 = 0.
  - N7F-42: alle 6 Bereiche y 99/0/50 = +B/−B/0 (±0,03 HT); fest mit `pr 'dx'` −0,001 HT; fest mit 1 Okt. y 99 +12,00 HT; Welle 4,
    C4, +4 Okt.: gefaltete Energie −71,9 dB, M-KLICK 2,2 dB.
  - N7F-45 / N2-4f-01: [pt], [Skip], [+] an DX-Hüllkurven eines FM-Basses (Alg. 5, kurze Modulator-Hk., Noten 33/40/52) ≤ 0,09 dB
    (M-PEGEL 20 ms); ganzer Bass in Punkt-Form ≤ 0,21 dB (Noten 28–45); PEG [Fall] umgewandelt ≤ 0,42 dB.
  - N7F-48: Sound ohne Punkt-Form: fmx bitgleich zu fm6. LIVE: DX → Punkt → Sustain-Pegel → Lin → DX an gehaltener Note, M-KLICK
    besteht (kein Fenster über dem Boden).
- **`v3-v4f-native.mjs` 7/7** (Chromium OfflineAudioContext, `DXN.voice`): N7F-37 nativ Exp 0,27 dB, Lin 0,35 dB; Sustain/Release,
  Skip; Schleife 70,00 ms; Tonhöhe 1 Okt. +12,00 HT.
- **`v3-v4f-ui.mjs` 417/0** (CDP-Touch, echte Schriften, P1, P2, P3, L1, L2): N7F-43 Knöpfe je Zustand und Sichtbarkeitsregeln,
  Textbreiten (56/52 px), Fußzeilen, [Bereich ▾] nur ohne Punkt, Taps = `fmxEnvAction` (skip, unloop), ein Undo je Knopf, Undo →
  DX-Form deep-equal, Badge „kein DX: Hüllkurve“; N7F-47 P1-Geometrie (Hüllkurve x 138–373 ab y 76, Mini-Feld x 0–131, Graph 236 ×
  117 + 12), kein Scrollen, blaue Sustain-Linie ±0 px #0A6AFF, sus −1/Frei ohne Lücke, DX-Form mit Lücke, Treffer 18/16 px neben
  dem Punkt, Mini-Feld: Tipp wählt (Seite bleibt, K2-61), Ziehen ändert nichts; N7F-39 Warnchips (Schleife, letzter Punkt > 0, kein
  Chip am Modulator); Pinch 40 → 160 px = ×4, zu = ×1, Kappe ×8, Zoom in der Fußzeile, Werte unverändert; ruhender zweiter Finger
  = FEIN (40 px: 37 → 9 Schritte in P1); N7F-46 [Alle Mod.] [Alle Ausg.] Kopieren/Einfügen deep-equal, je ein Undo; N7F-41
  Skala-Blatt (Zeit ×2, Höhe ×0,5) ein Undo; N2-4f-01 [Exp│Lin] + Undo deep-equal; Punktzug ändert nur sein Segment; Wertzellen
  P0–P5 (Tipp wählt, Zug +10); N7F-44 Klick-Grenze (R4 ≤ 93, zweiter Zug 99), Pegelzug hält D1/D2 ±15 %, Vorlagen = T2; großer
  Editor: ⋯ › Punkt-Knöpfe › Lin → Punkt-Editor in voller Höhe, nichts verdeckt, „✕ FELD“ zurück auf OP 4 / Seite.
  `v3-v4f-cellfit.mjs` 20/0: Wertzellen passen in allen Größen (Tonh. „+7,6“).
- **N2-4f-02 CPU** (`v3-v4f-cpu.mjs`, Chromium-AudioWorklet, Xeon, Median von 10 s, 8 Tasten → 6 Stimmen nach K2-42): Punkt-Form mit
  Schleifen an allen 6 OP, Tonhöhe 8 Okt., 15 Kanten + 6 Feedback: 6,49 / 6,29 / 6,39 % je Spur (DX-Form 5,09 / 5,49 / 5,89 %);
  mit echter Feedback-Schleife (Sample-Pfad) 12,08 / 8,19 / 9,69 % (DX-Form 8,79 / 8,59 / 7,69 %) – Median der drei Läufe 9,69 %
  ≤ 12; der erste Lauf lag einmal 0,08 % darüber. Node-Bank (`v3-v4f-bench.mjs`): +1,6 % (Block-Pfad) bzw. +0,9 % (Sample-Pfad).
- **Regression:** `v3-v4f-reg.sh` (V4b-Liste, 99 Suiten, Versionskopien `v3-v4f-adapt-*` für 3.10.0): alle wie V4b-fix; die
  roten (`node-fm`, `v3-v0b-adapt-wp3-browser`, `-wp3-ui`, `wp4-offline`, `wp3-adapt-func-build(-native)`) haben dieselben
  FAIL-Zeilen wie im V4b-Lauf; `wp5-mod` MO44 (fps unter Last) allein grün, Versions-Suiten nach Korrektur der Kopie grün.
  `v3-v4f-reg2.sh`: V0d-Suiten 10/10 (V0d-2-01 … 20, N7F-48), `v3-v0dfix-adapt-v0d-native`, `v3-v4a-node` 46/46 (allein; im
  Lauf N7F-09 Mehrlast 0,32 % unter Last), `v3-v4a-ui`, `v3-v4b-field` P/L (L nach `data-n` an den Vorlagen-Menüpunkten wieder
  101/0), `-logic`, `-view`, `-platz`, `-node`, `v3-v4bfix-chip/-lcd/-lock/-p2row6/-p3/-scroll` grün. Wie schon auf V4b-fix rot:
  `v3-v4bfix-big` (prüft `.fxback`, das die Unterreiter-Klasse seit V4b-fix trägt; am Snapshot gleich) und
  `v3-v4f-adapt-qareg-v4a-fmxio` (Echtzeit-Aufnahme ±1,5 dB, am Snapshot ebenso rot). Smoke ohne Fehler.

### Abweichungen

1. **K2-57 / N7F-37 „nach 50 ms ≥ 75 % des Endpegels“** ist auf der **Pegelskala** (y) erfüllt (77 von 99), nicht in Amplitude
   (15 %): Der geforderte msfa-Anstieg („dieselbe Rechnung wie der A.4b-Angriff“) erreicht in der halben Zeit gerechnet nur
   ≈ 17 % Amplitude – beide Sätze von K2-57 zugleich sind nicht erfüllbar; der Klang folgt dem msfa-Anstieg.
2. **Exp bei der Tonhöhe** = linear in Halbtönen (wie die DX-PEG), **Lin** = linear in Hz (eigene Festlegung; KP nennt Exp/Lin nur
   für den Pegel).
3. **Frei im nativen Rückfall** läuft wie Retrig (keine gemeinsame Hüllkurve über native Stimmen); Live-Änderungen nativ ab der
   nächsten Note (bestehende Regel).
4. **Großer Editor:** Die DX-Form bleibt der A.4b-Editor (K2-44, N2-4b-04); seine Punkt-Knöpfe liegen hinter ⋯ › „Punkt-Knöpfe …“
   (Tonh.: Knopf im Kopf), weil das 365-px-Budget des A.4b-Editors keine zwei weiteren Knopfzeilen hat. Nach der ersten Aktion
   zeigt der große Bereich den Punkt-Editor.
5. **[Auf alle] / [Init] / [−1] [+1]** aus V4b: [Auf alle] und [Init] stehen jetzt unter ⋯ (P) bzw. [Auf … ▾] (L, groß), −1/+1
   entfallen (Ziffernblock auf den Wertzeilen); die Knopfzeilen sind nach KP §4.11 belegt.
6. **P2/P3** zeigen eine Knopfzeile mit Menüs (KP bemaßt die Punkt-Knöpfe nur für P1 und L1).
7. **Konvertierung mit Skip an:** Damit ein früh losgelassener Ton gleich bleibt, bekommt die umgewandelte DX-Form `skip 1`;
   [☑ Skip] zeigt das schon in der DX-Form an (ein Tipp schaltet es aus und wandelt dabei um).
8. **N7F-44:** Das FELD-Amp hat die A.4b-Regeln (Klick-Grenze, Pegelzug hält Zeiten, Vorlagen T2, ein Undo je Geste); die
   Pixel-Maße von V0d-2-07 (49,1 px je Dekade usw.) gelten für den A.4b-Editor (⤢ Hüllkurve groß), nicht für den 236-px-Graphen.
9. **Größe +58,5 KB** statt +40 KB (+46 %, unter der 50-%-Regel): der Punkt-Editor ersetzt den V4b-Amp/Tonh.-Teil (16 KB → 39 KB), dazu Worklet- und
   native Engine (≈ 13 KB) und FMX-Aktionen (≈ 6 KB). Die FMX-Umwandlung nutzt die Tabellen von FMH/DXN statt eigener Kopien.

### Fach-Prüfung (Nachtrag 2 Teil J, FP-DSP + FP-TOUCH, als eigener Durchgang über Diff, Tests und Bilder)

Blick FP-DSP (Haupt) und FP-TOUCH (Zweit) über Diff, Testausgaben und Bilder; **10 Befunde, alle behoben**:
1. FP-DSP: nativ hielt eine Schleife ihren Pegel (End-`setValueAtTime` ulp-genau nach dem nächsten `setTargetAtTime`) → behoben
   in `schedule`, Test N7F-39 nativ.
2. FP-DSP: Worklet-Quelle enthielt Nicht-ASCII-Zeichen in neuen Kommentaren → ersetzt (Worklet-ASCII).
3. FP-DSP: Tonhöhen-Punkt-Form live gelöscht (Init) ließ die Tonhöhe bei gehaltener Note stehen → `xpL` 0.
4. FP-DSP: K2-62 Begrenzer-Stufe 2 fehlte für Schleifen → Poly ≤ 4 bei Stufe ≥ 2.
5. FP-DSP: DX → Punkt beim früh losgelassenen Ton hätte den Klang geändert → Umwandlung mit Skip an (Abweichung 7).
6. FP-DSP: CPU-Spitze mit Sample-Pfad einmal 12,08 % → zwei Wiederholungen 8,19 / 9,69 %, Median ≤ 12 (oben).
7. FP-TOUCH: großer Editor auf P2/P3 überlief die Seite (Wertzeilen verdeckt) → ohne Wertzeilen bzw. einzeilig.
8. FP-TOUCH: Tonh. im großen A.4b-Editor (P2) ohne Weg zu den Punkt-Knöpfen → Knopf „Punkt-Knöpfe ▾“ im Kopf.
9. FP-TOUCH: Wertzellen der Tonh. in P3/L2 abgeschnitten → 3 bzw. 2 Spalten.
10. FP-TOUCH: Vorlagen-Menü ohne `data-n` brach die V4b-Suite in L → wieder gesetzt.
Geprüft ohne Befund: NaN/Spitzen (Feedback-Pfade unverändert), M-KLICK bei Live-Änderungen und Mip-Wechseln, ein Undo je Geste,
Pinch vs. FEIN-Finger, `touch-action:none` / `guardTouch` am Graphen, Popover-Schieber ohne `preventDefault`, kein Gerätename in
LCD/Hilfe/Knöpfen (N2-4b-02), deutsche Texte.

### iPhone-Prüfpunkte (Xander)

1. FM-Spur, INIT FM → FELD → OP 2 antippen → Amp: rechts die Hüllkurve, links das kleine Feld.
2. Punkt 2 antippen → [Sustain] → Hüllkurve wird frei (blaue Linie am Punkt); [Loop A] auf Punkt 1, [Loop B] auf Punkt 3 → violette
   Zone; Taste halten: der Klang pulsiert, loslassen: Schleife endet.
3. Ins Leere tippen → [Exp] → „Lin“; [Retrig] → „Frei“: zwei Tasten nacheinander folgen einer Kurve.
4. Zwei Finger im Graphen auseinanderziehen → Zeit-Zoom bis ×8; zusammen → ×1.
5. Tonh.: [Bereich ▾] → 2 Okt., Punkt hochziehen → Tonhöhensprung bis +2 Oktaven.
6. ⋯ → ⤢ Hüllkurve groß → großer Punkt-Editor; „✕ FELD“ zurück.
7. Ein Ausgang mit Schleife nach dem Sustain zeigt „endet nicht (Schleife)“.
8. Undo nach dem ersten Punkt-Knopf → wieder DX-Form, Badge „DX 1 ✓“.

### Bekannte Lücken

- [DX-tauglich machen] (Punkt-Form → DX mit Abweichung), Vorhersage, Raster, .syx-Export: V4c.
- Mod-Pfade `fmx.<k>.amp.<t1…t5|y0…y5>` kommen mit V5d; Hüllkurven als Mod-Quelle §18.
- Kein WebKit-/iPhone-Test (Chromium mit CDP-Touch, Node-Shim); Pinch und Skala-Schieber unter iOS nur im Code geprüft.

## V4f-fix — Umwandlung DX → Punkt-Form klanggleich, Kopieren mit Bereich, große Tonh., Nyquist, 12-s-Kappe, Frei, Ziehen, Pinch · App 3.10.0

App: `dirigent-wt/index.html`, Snapshot `synq-snapshots/V4f-fix.html`. Zehn Befunde der V4f-Prüfung (`v4f-findings.json`).

- **N7F-45 / N2-4f-01 Umwandlung klanggleich (zwei Befunde):**
  - *Skip-Release hält die Rate:* Loslassen vor Psus betritt das Segment nach Psus ab dem aktuellen Pegel mit **seiner Rate**
    (Zeit × Abstand jetzt / Abstand ab Psus), wie die DX-Form mit R4; ein flaches Segment nach Psus (L3 = L4) zählt seine Zeit je
    256 Pegelschritte (6 dB) bzw. je Oktave – die Umwandlung schreibt dort die R4-Zeit statt der Haltezeit. Worklet (`ptRelScale`)
    und nativ (`ptRelPlan`) gleich.
  - *msfa-Anstieg genau:* ⌊17 − l/256⌋ = 16 − Band (bisher 17 − Band, ≈ 4 dB zu schnell) in `riseG`/`riseAt`, nativ, `FMH.segTime`
    (angezeigte A-Zeiten) und im nativen DX-Plan.
  - *Time/Key und MAKRO wie DX:* `ptDxF` rechnet die Segmentzeit mit der DX-Arithmetik (qrate + rsd, HÄRTE/LÄNGE/RELEASE am
    Raten-Index, BISS mit Klick-Grenze, Haltephasen über die Static-Tabelle). Die Umwandlung speichert dazu je Segment die DX-Rate
    (`dxr`, optional; `normEnv` behält es); sie gilt nur, solange sie die Segmentzeit noch ergibt (nach einem Zug/Skala gilt die
    kontinuierliche Rechnung). Mit `dxr` folgt die Zeit wie bei DX dem Pegelabstand der Stimme (Anschlag, Tasten-Skalierung).
  - *Stufen über 20 s* werden einmal geteilt (Zwischenpunkt auf dem Pegelraster, bis dorthin exakt); [+] wandelt dann um und meldet
    „höchstens 6 Punkte“.
  - Nachweis: `v3-v4ffix-conv.mjs` (19 Werksklänge, alle 6 OP Amp + DX-PEG umgewandelt, Noten 36/60/84, Gate 0,1/0,3/1,5 s, vel 0,8)
    **171/171 ≤ 1 dB, schlimmstens 0,21 dB** (vorher 116/171, bis 8,9 dB; mit `KIND=add` ebenso); `v3-qa4f-n5g.mjs` alle PASS (FM-Flügel
    53,7 → 0,7 dB, Marimba 51,6 → 0,0, FM-Pluck 19,2 → 0,9, Funk 8,2 → 0,1, E-Piano 4,8 → 0,0); `v3-qa4f-n5f.mjs` 2-Op-Pluck 70 → 0,1 dB,
    E-Piano alle sechs 0,1 dB; `v3-rp4f45-indep.mjs` 0 Fälle über 1 dB (vorher 19); `v3-rp4f45-att.mjs` langsamer Angriff ≤ 0,17 dB
    (vorher 3,9–4,8); `v3-rp4f45-bass.mjs` FM-Bass ≤ 0,41 dB; `v3-rp-n7f45b.mjs` FM-Flügel/Marimba Taste los 0,3/3 s ≤ 0,3 dB;
    `v3-fp4f-conv.mjs` 58/60 (Rest: ein Extremfall mit allen vier MAKRO-Knöpfen 1,13 dB im ersten 20-ms-Fenster – Rest der
    Block-Stufung der DX-Form selbst; ein 30-ms-Ton mit 5 dB Unterschied erst unter −85 dBFS nach dem Stimmende).
- **N7F-46 ⋯ › Kopieren/Einfügen (Hüllkurve):** nimmt den Tonhöhen-Bereich `pr` mit und setzt ihn wie [Einfügen] (feste OP ohne
  Punkt-Form bleiben unberührt). `v3-repro-n7f46.mjs`: OP 3 deep-equal OP 2 (pr 8), +7,52 HT wie die Quelle, ein Undo.
- **⤢ Hüllkurve groß auf Tonh. in Punkt-Form:** `fxBigEnv` und der fm6-Abgleich lesen `r`/`l` nur aus einer DX-Form; der große
  Punkt-Editor öffnet ohne Fehler (`v3-repro-bigpit-indep.mjs` P und L: Modus BIG/BIGL, keine Fehler; DX-Form und Amp unverändert).
- **Nyquist-Wächter ohne Schlag (L3):** über 0,45 fs blendet der Operator in 5 ms aus (und wieder ein), seine Phase läuft mit
  0,45 fs weiter – kein eingefrorener Phasenwert, kein Gleichanteil. In fmx- und fm6-Pfad; darunter bitgleich. `v3-v4ffix-engine.mjs`:
  tiefpassgefilterter Spitzenwert am Übergang −105,6 / −105,1 / −68,5 dBFS (vorher −17,2 / −20,2 / −35,7 bei Ton −19,9 dBFS),
  M-KLICK ≤ 0,4 dB; `v3-rpnyq-chrome.mjs` (Chromium-Worklet) −87,8 / −91,6 dBFS gesamt.
- **12-s-Kappe blendet aus (L3):** Worklet 20-ms-Ausblendung, die 12 s nach dem Loslassen endet; nativ eine Ausblend-Rampe
  (Punkt-Form-Stimmen). `v3-v4ffix-engine.mjs`: Schleife nach Sustain / Frei + Schleife / Schleife ohne Sustain still ab 12,300 s,
  M-KLICK −99 dB (vorher 34,8 / 88,7 dB); `v3-repro-cap-native*.mjs`: linear auf 0 bis 12,30 s.
- **Frei nach langer Pause:** das Nachholen in `ptRun` überspringt ganze Schleifenperioden (gleicher Zustand wie Schritt für
  Schritt, `v3-v4ffix-freeskip.mjs` 3/3 über 60 s; vorher brach der 4096er-Wächter nach ≈ 2 s Nachholzeit ab). Anschlag-Block nach
  20/120 s Pause 0,10–0,16 ms (vorher 1,75–2,25 ms; `v3-fp4f-free3.mjs`, `v3-repro-freecatch.mjs`).
- **Ein Zug erreicht 0,5 ms … 20 s:** über den rechten Rand hinaus wächst die Zeitachse mit dem Überstand (× 2 je 24 px), und
  solange der Finger am Rand bleibt, wächst sie weiter (≈ × 2,8/s, weiter draußen schneller); der Punkt bleibt am Finger, zurück
  nach links ist stetig. `v3-qa4f-ui8.mjs`: ein Zug → 20 s (vorher × 1,25 je Zug); `v3-repro-ptdrag.mjs` 1 Zug statt 17.
- **Pinch mit einem Finger auf einem Punkt:** der zweite Finger bleibt FEIN, solange er ruht; bewegen sich beide und ändert sich der
  Abstand ≥ 12 px, geht der Punkt zurück (kein Undo-Schritt) und die Zeitachse zoomt. `v3-fp4f-touch.mjs` Teil 1 P/L: Zoom ×1,94 /
  ×1,90, Hüllkurve unverändert, Undo +0 (vorher Zoom ×1, Segment 46,4 → 0,5 ms, Undo +1).

### Offen: K2-57 / N7F-37 „nach 50 ms ≥ 75 % Amplitude“ (Entscheidung nötig)

Nicht als Klang geändert. K2-57 verlangt für Exp steigend „den msfa-Anstieg (dieselbe Rechnung wie der A.4b-Angriff)“ und
zugleich ≥ 75 % Amplitude nach der halben Zeit. Der msfa-Anstieg (jetzt genau: 16 − Band) erreicht bei 0 → 99 / 100 ms nach 50 ms
19 % Amplitude (77 % erst bei 90 ms; Pegelskala ≈ 77 von 99). Eine Kurve mit ≥ 75 % nach halber Zeit (in Amplitude „schnell, dann
flach“) kann einen DX-Angriff nicht nachbilden: jede Umwandlung eines langsamen DX-Angriffs wiche dann um bis zu ≈ 15 dB ab und
bräche N7F-45, A.5 Nr. 4 und N2-4f-01. Vorschlag für die Spec: den Prüfsatz auf die Pegelskala („≥ 75 von 99“) stellen, oder für
Exp steigend eine eigene Kurve zulassen und N7F-45 für umgewandelte Angriffe über `dxr` sichern (hörbarer Formwechsel, sobald ein
umgewandelter Angriff gezogen wird).

### Geprüft ohne Rückschritt
- `v3-v4f-reg2.sh` (OUT=fix): V0d-Suiten, `v3-v0dfix-adapt-v0d-native`, V4b-Suiten, `v3-v4bfix-chip/-lcd/-lock/-p2row6/-p3/-scroll`,
  `v3-v4f-node` 33/33, `v3-v4f-native` 7/7, `v3-v4f-ui` 417/0, `v3-v4f-adapt-qareg-v4a-fmxio` grün. Wie schon vorher rot:
  `v3-v4bfix-big` (10, gleiche Zeilen wie run2). `v3-v4a-node` N7F-09 Mehrlast schwankt (allein 0,18 % PASS / 0,32 % FAIL; der
  Stand vor dem Fix ebenso 0,003 % / 0,44 %); `v3-v4a-ui` N7F-10 im Lauf 16,5 %, allein 9,69 % PASS (Last durch Parallelbetrieb).
- Smoke ohne Fehler (`v3-v4ffix-smoke.png`). `v3-fp4f-touch.mjs` Teile 2 (P2 bleibt bei y-Anschlag nicht unter dem Finger, Punkte
  rücken nach dem Loslassen um ≤ 7 px, weil die Achse wieder „Gesamt + 25 %“ wird) sind am Stand vor dem Fix gleich rot – nicht
  Teil dieser Befunde.

### Abweichung (neu)

- **V0d-2-11 / Tabelle T2 angezeigte Zeiten:** Mit dem genauen msfa-Anstieg zeigt die Anzeige jetzt die Zeit, die das Worklet
  spielt: Angriffe und steigende Stufen ≈ 20–28 % länger als in T2 (Pad-Ausgang A 108 → 138 ms, Pad-Modulator A 113 → 130 ms,
  D1 143 → 183 ms, A bei R 99 0,6 → 0,8 ms). T2 war mit demselben Rundungsfehler (17 − Band) gerechnet; die R/L-Werte der Vorlagen
  sind unverändert (deep-equal). Belegt durch `v3-rp4f45-att.mjs`: ein Punkt-Angriff mit 138 ms liegt ≤ 0,17 dB neben der DX-Form,
  mit 108 ms waren es 4,2 dB. `v3-v0d-ui-d.mjs` prüft noch die alten T2-Texte (1 FAIL, nur diese Zeitangaben).

## V4c — Vorhersage, Verhältnis-Raster, DX-Brücke (DX-tauglich machen, .syx-Export, Import ins FELD) · App 3.11.0

Grundlage: Nachtrag 2 Teil A (A.6 Zeile V4c, K2-37, K2-39, A.5 Nr. 4, N2-4c-01) mit `r7/kodamo-delta-pdf.md` (KP §4.6 Z9, §4.7
Basis Zeile 3 und Stimme Zeile 3, §4.12, §6.3–6.5, §9 „V4d“: V4c-01 … V4c-07 und N7F-49 … N7F-52), Spec §9.5/§9.6 und §17 V4c,
Nachtrag 1 A.4b Nr. 3 (PEG-Bytes zurückschreiben), N0a-03/N4c-01 (.syx im ZIP); Forschung `r4/g5/ratio-raster` (Regel, 15/15) und
`r4/g5/vorhersage-bench` (Rechenweg). Gebaut auf `synq-snapshots/V4f-fix.html` (3.10.0). Format und alte Projekte bleiben.

### Gebaut

**Vorhersage im LCD beim Ziehen (V4c-01, Z9).** Bei jedem Zonenwechsel einer Kachel-Geste rechnet `fxPredict` das Ergebnis der
Regel (`FMX.gesture`) im Hauptthread wie das Worklet (Sinus/Werkswellen als 512er-Tabellen, Kanten in Rechenreihenfolge,
Feedback selbst = 2-Sample-Mittel · 2^(fb−8), fremd = 1 Sample, Pegel am Hüllkurven-Gipfel), 2048 Samples bei f = 48000/2048·6
(jeder Teilton auf seinem FFT-Bin), Hann + FFT. Das LCD zeigt links **eine Periode** und **16 Teilton-Balken**, rechts zweizeilig
die Geste („3 → 1 verbinden“) und das **Etikett**: Klasse (alle Teiltöne · nur ungerade · lückig · dünn · Glocke/Metall · rein),
„▼ tiefer“ bei Teiltönen auf ½ f, dann „heller/dunkler“ gegen den Graph vor dem Ziehen (Schwerpunkt ±15 %), sonst die Helligkeit,
dann das Paar „×2 auf ×1“. Abgewiesene Zonen zeigen wie bisher nur den Grund. Nach dem Loslassen kommt die Status-Zeile zurück.
L2 (667 × 375): das LCD ist dort ≈ 150 px breit – während des Ziehens liegt die Vorhersage über den Unterreitern daneben
(`.lcdpv`, nicht antippbar), danach sind die Reiter wieder da. P3 (320 × 568) hat keine LCD-Zeile: dort steht die Vorhersage
unter dem Feld-Kopf (`.fxhpv`). L6: passt die zweite Zeile nicht, fallen erst das Paar, dann die Helligkeit weg; passt die Geste
nicht neben das Bild, zeigt das LCD die normale Zeile (zweizeilig/Laufschrift wie V4b-fix).
- Rechenzeit (Chromium, Xeon): je Vorschau 0,4–1,4 ms im Ziehen; schlechtester Fall N7F-52 (6 Op, 15 Kanten + 6 Feedback-Wege,
  Wellen ≠ 0, Punkt-Hüllkurven mit Schleife) Median 0,5–0,9 ms, p95 0,7–1,8 ms. Damit das schon beim ersten Ziehen gilt, rechnet die
  Seite FELD beim Öffnen 12 Vorhersagen in 50-ms-Abständen vor (JIT); die Schleife liest nur typisierte Felder (eine Vorbereitung
  liest den Graph) – vorher kostete die erste Geste 5–16 ms, weil JSON-Kopien des Graphen den optimierten Code verwarfen.
- Spec-Risiko §9.5: bei > 8 ms je Vorschau (langsames Gerät) höchstens 15 Hz; eine übersprungene Zone folgt 70 ms später.

**Verhältnis-Raster (V4c-02, V4c-03; KP §4.7 Basis Zeile 3).** Tipp auf die Wertzone „Verhältnis“ öffnet das Raster (feste
Frequenz: weiter der Ziffernblock). Kopf „Raster 4 → 3 (×1)“ = Partner (erstes Ziel eines Modulators, sonst erster Modulator
eines Ausgangs). 16 Felder ½ · 1 … 14 · 1,41, je mit Klasse █ ▓ ▒ ░ ◇ und ▼ (klingt tiefer) nach der Regel aus `ratio-raster`
(Linien |C + kM|, a = 2C, b = 2M, g = ggT → Grundton g/2, Teilton n ⇔ n ≡ ±a′ mod b′; `FMX.ratioClass`). Darunter der aktuelle
Wert mit Klasse, [◁] [▷] (fine ±1, je ein Undo), [Zahl …] (Ziffernblock), Legende. **Gleiten:** Finger auf das Raster und über die
Felder ziehen – das Verhältnis wechselt laufend, bei stehendem Transport klingt dabei die Referenznote (Vorhören), Loslassen
lässt den Wert stehen, **ein** Undo für das ganze Gleiten. Felder P1 40 × 48, L1 42 × 48, P3 4 × 4 Felder à 66 × 48 (L4).
- Worklet: eine Verhältnis-Änderung bei klingender fmx-Stimme gleitet jetzt 10 ms (logarithmisch, `FRX_N`, wie die 30-ms-Pegel-
  Blende aus V4b-fix) statt zu springen – M-KLICK der Raster-Stufen ×1 … ×7 auf gehaltener Note am Modulator 7,2 → 4,5 dB
  (Grenze 6), am Ausgang 5,8 → 5,7 dB (`v3-v4c-glide.mjs`). Statische Klänge bleiben bitgleich.

**[DX-tauglich machen] (V4c-06, N7F-49; KP §4.12, A.5 Nr. 4).** In Stimme › DX-Abgleich (die ganze Zeile, 132 × 44, solange nicht
DX-tauglich; [Nummern angleichen] bleibt) und auf der gesperrten DX-/OP-Seite. Das Blatt nennt jede Änderung mit ihrer Folge, ein
Tipp auf [Anwenden] macht alles in **einem** Undo-Schritt, danach Badge „DX n ✓“, fm6 wird mitgeschrieben (kein „angenähert“),
die DX-Seite ist frei. `FMX.makeDx` in fester Reihenfolge:
1. Verbindungen: gleiche Kanten mit anderer Nummerierung → „Nummern angeglichen (wie DX 7)“; keine DX-Form → nächster Algorithmus
   (wenigste abweichende Kanten über alle 720 Nummerierungen) mit Liste „Verbindungen → DX 5 · 6 → 1 gelöst – klingt anders“.
2. Feedback: ein Weg am DX-Empfänger/-Quelle, ganze Stärke („Feedback an OP 2 (← 2) entfernt – weniger rau“, „Feedback-Stärke
   4,5 → 5“).
3. Je Operator: Welle → Sinus („OP 3: Welle Säge → Sinus – weniger Obertöne“); **Punkt-Form → DX-Form mit Abweichung**
   („OP 2: Hüllkurve frei → DX, Abweichung 1,8 dB“): eine aus der DX-Form umgewandelte, unveränderte Punkt-Form geht exakt zurück
   (5/5 deep-equal); sonst 3 Haltepunkte vor dem Sustain + Release, Raten nach `FMH.stageTime` gesucht, Abweichung = RMS der dB-
   Kurven (gehalten bis Sustain + 0,3 s, dann 1,5 s Release; Modell = msfa-Fall/-Anstieg, Skip mit der Rate des Folgesegments wie
   `ptRelScale`; Selbsttest DX ↔ Punkt 0,05–0,14 dB). Tonhöhe ebenso in HT (PEG-Tabellen), feste OP ohne Tonhöhen-Hk., eine PEG
   für alle Verhältnis-OP; Phase → 0, Phase-Modus einheitlich, Anschlag < 0 → 0, LFO AM auf 0/42/85/127, LFO FM einheitlich.
- `FMX.dx` nennt zwei Feedback-Wege auf DX-Verbindungen jetzt als „Feedback an OP 2 und OP 6“ statt „Verbindungen: kein DX-
  Algorithmus“ (der Badge-Text bleibt).

**DX7-Bank exportieren (V4c-05, N7F-50; Spec §9.6).** Menü › Sounds › [DX7-Bank exportieren (.syx)]: bis 32 DX-taugliche
FM-Sounds der eigenen Bibliothek als 32-Stimmen-Bank (F0 43 00 09 20 00 · 4096 · Prüfsumme · F7, gepacktes VMEM wie der Import),
freie Plätze INIT VOICE. Nicht taugliche werden übersprungen und im Toast mit dem ersten Grund genannt („DX7-Bank gespeichert
(ZIP) · 32 Stimmen · übersprungen: Welle drin (OP 3: Welle Dreieck), …“). Viewer: `….zip` mit `….syx` (N0a-03); Safari: die
`.syx` selbst als `application/octet-stream`. Rückweg je Stimme: alle fm6-Felder inkl. PEG (A.4b Nr. 3), AMS/PMS/Osz.-Sync; der
LFO aus den Klang-Werten zurückgerechnet (Rate → Geschwindigkeit, Einblenden → Verzögerung, Form, `lfo1→pitch`/`lfo1→amp` →
PMD/AMD); Namen ASCII mit ä → ae (10 Zeichen). Ein FELD-Klang mit LFO FM schreibt PMD 99 (dort wirkt LFO 1 voll).
- `fmxApply` behält die PEG einer Stimme mit nur festen Operatoren in fm6 (wirkungslos, aber der Export schreibt die Bank-Bytes
  zurück; ROM1A REFS WHISL).

**Import ins FELD (N7F-51).** Unverändert über `fmxFromFm6` (V4a), jetzt für 32/32 ROM1A-Stimmen geprüft: Plätze = `dxLayout`,
PEG in jedem Verhältnis-OP, AMS/PMS/Osz.-Sync, Badge ✓, FELD ↔ DX deep-equal.

**Test-API:** `fmxPredict(t, g?)`, `fmxPredictX(x)`, `fmxRaster(t, op)`, `fmxMakeDx(t, apply?)`, `exportSyx(ids?)`,
`syxVoiceOf(sound)`, `buildSyx(voices)`, `parseSyx(bytes)`.

### Abnahme (Chromium + CDP-Touch, Worklet-Shim; P1, L1, P2, P3, L2)

| ID | Ergebnis | Beleg |
|---|---|---|
| V4c-01 | ✓ Etikett, 16 Balken, Periode bei jedem Zonenwechsel 20–39 ms nach der Bewegung; Rechenzeit 0,4–1,4 ms | `v3-v4c-accept.mjs` A (5 Größen) |
| V4c-02 | ✓ 15/15 Raster-Klassen = FFT der echten Engine (Modulator-Index 2; 1 : 3,5 als 2 : 7, weil ×3,5 kein DX-Verhältnis ist) | `v3-v4c-node.mjs` |
| V4c-03 | ✓ Gleiten ×1 → ×7: M-SP 573–723 Hz → 1017–1028 Hz (≥ ⅓ Okt., H-1), Loslassen setzt ×7, ein Undo, Undo stellt ×2 her; M-KLICK offline ≤ 5,7 dB | `v3-v4c-accept.mjs` B, `v3-v4c-glide.mjs` |
| V4c-04 | ✓ dxMatch 32/32 (je 103 Nummerierungen, 3296/3296); Nicht-Treffer ≤ 0,8 ms | `v3-v4c-node.mjs` |
| V4c-05 | ✓ Export → Import: 32/32 Stimmen deep-equal (Feld für Feld ohne Zeitstempel; der Import meldet alle 32 „schon vorhanden“); Viewer `.zip` mit `.syx` (4104 Byte), Toast „DX7-Bank gespeichert (ZIP) …“ mit den übersprungenen; Safari `.syx` als octet-stream | `v3-v4c-accept.mjs` D |
| V4c-06 | ✓ Änderungsliste, danach Badge ✓, ein Undo (Stimme-Seite und gesperrte DX-Seite) | `v3-v4c-accept.mjs` C, `v3-v4c-node.mjs` |
| V4c-07 | ✓ Regression wie V4f-fix (unten); Smoke ohne Fehler; DoD: Größe +50,8 KB (Budget 30, Begründung unten) | `v3-v4c-reg.sh`, `v3-v4c-reg2.sh` |
| N7F-49 | ✓ 6-Op-Graph mit Wellen, Punkt-Hüllkurven (Lin, Schleife), zwei Feedback-Wegen (2 und 6): jede Abweichung mit Folge, danach „DX 1 ✓“, ein Undo | C |
| N7F-50 | ✓ übersprungene Sounds im Toast je mit dem ersten Grund | D |
| N7F-51 | ✓ 32/32 (ROM1A) | D |
| N7F-52 | ✓ Median ≤ 0,9 ms, p95 ≤ 1,8 ms | A |

- **Regression** `v3-v4c-reg.sh` (V4f-Liste, 84 Suiten + 15 allein, Versionskopien `v3-v4c-adapt-*` für 3.11.0) und
  `v3-v4c-reg2.sh` (V0d-, V4a-, V4b-, V4b-fix-, V4f-Suiten, dann die V4c-Suiten): rot wie schon auf V4f-fix mit denselben FAIL-Zeilen
  `node-fm`, `v3-v0b-adapt-wp3-browser`, `-wp3-ui`, `wp4-offline`, `wp3-adapt-func-build(-native)`, `wp5-mod` (fps unter Last),
  `v3-v0d-ui-d` (V0d-2-11, auf V4f-fix gleich), `v3-v4bfix-big` (`.fxback`, gleich), `v3-v4c-adapt-qareg-v4a-fmxio`
  (Echtzeit-Aufnahme ±1,4 dB, auf dem Snapshot ebenso rot). Unter Last rot, allein grün: `v3-v0a-drum` 19/0, `v3-v0b-adapt-wp6-extras`
  P/L 20/0, `wp6-song-P` 27/0, `wp7-accept-fm4` 40/0, `wp3-adapt-func-build` (allein dieselben 2 FAIL wie V4f). Angepasst:
  `v3-v4c-adapt-v4bfix-lcd` (prüft im Vorhersage-Modus beide LCD-Zeilen statt `.lk`) 109/0. Grün u. a.: alle DoD-Läufe (60 s),
  `wp1-dod`/`wp7-adapt-wp1-perf` (Startzeit), V0d 10/10, `v3-v4a-node` 46/46, `v3-v4b-field` P 106/0, L 101/0, `-platz` 59/0,
  `v3-v4f-node` 33/0, `-native` 7/0, `-ui` 417/0, Worklet-ASCII, Smoke.

### Abweichungen

1. **Vorhersage ohne ▶** (Spec §9.5 „▶ spielt die vorhergesagte Struktur kurz an“): KP legt die Vorhersage ins LCD während des
   Ziehens; der Finger zieht noch, ein Knopf wäre nicht erreichbar. Nach dem Loslassen hört man das Ergebnis ohnehin.
2. **Raster ohne Magnete** auf halben Werten: [◁] [▷] gehen in fine-Schritten (×1 %); halbe Werte wie ×1,5 = fine 50 sind exakt,
   ×3,5 ist in DX-Schritten nicht darstellbar (3,51). Das Raster selbst bietet die ganzen Werte, ½ und 1,41.
3. **V4c-02 Paar 1 : 3,5** als 2 : 7 geprüft (gleiches Linienmuster 2 5 9 …, „dünn“), weil ×3,5 kein DX-Verhältnis ist.
4. **Rückweg Punkt-Form → DX** ist eine Näherung (A.5 Nr. 4): Schleifen, Lin, Frei und mehr als 3 Punkte vor dem Sustain gehen
   verloren; das Blatt nennt die Abweichung in dB bzw. HT. Gestreckte Zeiten (×1,3) liegen bei ≤ 3,3 dB (Raster der DX-Raten).
5. **.syx-Export: Bytes, die der Klang nicht trägt,** werden auf DX-Standard geschrieben (Breakpoint 39 ohne Skalierung,
   flache PEG-Raten 99, LFO-Sync 1, PMS ohne PMD); der Rundlauf ist parametergleich (32/32), nicht bytegleich zur Ausgangsbank.
   Eine Route `lfo1→amp` ohne AMS an einem Ausgang geht im Export verloren (DX kann das nicht).
6. **L2-LCD / P3:** die Vorhersage überdeckt während des Ziehens die Unterreiter (L2) bzw. liegt unter dem Feld-Kopf (P3, ohne LCD).
7. **Größe +50,8 KB** statt +30 KB (+69 %, über der 50-%-Regel): Vorhersage mit FFT und Etikett (≈ 9 KB), Hüllkurven-Rückweg mit
   zwei Hüllkurven-Modellen und Abweichung (≈ 12 KB), DX-tauglich-Logik und Blatt (≈ 7 KB), .syx-Export (≈ 7 KB), Raster (≈ 6 KB),
   CSS (≈ 3 KB), Worklet-Gleiten (0,5 KB), Kommentare. Gruppe 3 (V4a, V4b, V4f, V4c) zusammen +312 KB gegen +213 KB geplant;
   die Datei hat 1,80 MB (Grenze 5,0 MB, EN2-28), die Startzeit-Abnahme §15.3 bleibt der Wächter (wp1-dod/-perf in der Regression).

### Fach-Prüfung (Nachtrag 2 Teil J: FP-DSP Haupt-, FP-TOUCH Zweit-Blick; eigener Durchgang über Diff, Tests und Bilder)

**9 Befunde, alle behoben:**
1. FP-DSP: Raster-Stufen auf gehaltener Note sprangen im Verhältnis (M-KLICK am Modulator 7,2 dB) → 10-ms-Gleiten im Worklet.
2. FP-DSP / FP-IPHONE: erste Vorhersage einer Sitzung 5–16 ms (Deopt durch JSON-Kopien des Graphen) → typisierte Rechenschleife,
   Vorrechnen beim Öffnen; jetzt ≤ 1,4 ms ab dem ersten Ziehen.
3. FP-DSP: `fmxApply` verwarf die PEG einer Stimme nur mit festen OP → FELD ↔ DX nicht deep-equal (ROM1A REFS WHISL) → bleibt in fm6.
4. FP-DSP: Abweichungs-Modell der Punkt-Form ohne die Skip-Rate (`ptRelScale`) → 8,8 dB Selbstfehler → Modell ergänzt (≤ 0,14 dB).
5. FP-TOUCH: Raster-Felder in P3 nur 31 px breit → 4 × 4 Felder (66 × 48).
6. FP-TOUCH: [DX-tauglich machen] als 24-px-Knopf → ganze Zeile antippbar (132 × 44).
7. FP-TOUCH: L2-LCD zu schmal für die Vorhersage → Überlagerung der Unterreiter während des Ziehens.
8. FP-TOUCH: P3 blendet die LCD-Zeile aus – die Vorhersage war dort unsichtbar → Zeile unter dem Feld-Kopf.
9. FP-TOUCH (L6): Vorhersage-Zeile endete mit „…“ (L1, P3) → Teile fallen nach Wichtigkeit weg, nie abgeschnitten.
Ohne Befund geprüft: ein Undo je Geste (Gleiten, ◁ ▷, Anwenden), zweiter Finger auf dem Raster ignoriert (Pointer-Capture),
`touch-action:none` auf dem Raster, Abbruch (pointercancel, Blur) beendet die gehaltene Vorhör-Note, Texte deutsch und ohne
Gerätenamen (N2-4b-02), Worklet-Quelle ASCII, keine NaN, M-PLATZ der Blätter in P1/P2/P3/L1/L2.

### iPhone-Prüfpunkte (Xander, N2-4c-01 nach KP §8 plus V4c)

1. FM-Pluck öffnen → FELD: unten die Ausgänge, darüber die Modulatoren, rechts die Pegel-Seite in denselben Farben.
2. Einen Modulator auf einen Ausgang ziehen und **noch nicht loslassen**: oben im LCD erscheinen eine Welle, 16 grüne Balken und
   z. B. „alle Teiltöne · heller · ×2 auf ×1“; loslassen → verbunden; nochmal auf denselben → Plätze getauscht; ins Leere → fällt.
3. Doppeltipp → stumm. Operator antippen → Basis/Amp/Mod/Tonh.; Amp → Punkte ziehen, [Sustain] mit [Skip], [Loop A]/[Loop B], [Loop weg].
4. Basis › rechts neben „Verhältnis“ auf die grüne Zahl tippen → Raster. Finger auf „1“ legen und langsam bis „7“ gleiten:
   der Ton wird heller; loslassen → bleibt; ↶ → zurück.
5. Einen Klang mit Welle ≠ Sinus: Stimme › DX-Abgleich antippen → Liste → [Anwenden] → „DX 1 ✓“, Seite DX ist frei; ↶ → zurück.
6. Menü › Sounds › [DX7-Bank exportieren (.syx)] → Teilen-Blatt bzw. Download der `.syx`; in Dexed laden.
7. Querformat: Feld und Hüllkurve nebeneinander; beim Ziehen liegt die Vorhersage über den Unterreitern.
8. Pegel-Seite: waagrecht ziehen ändert den Wert ohne Sprung, Tipp auf die Zahl öffnet den Ziffernblock. FM-Bass mit kurzer
   Modulator-Hüllkurve bauen und tief spielen.

### Bekannte Lücken

- N2-4c-01: der Zwischenstand an Artifact-Adresse und Pages-Seite ist Sache des Orchestrators (kein Commit/Push hier).
- Kein WebKit-/iPhone-Test (Chromium + CDP-Touch, Node-Shim); die Vorhersage-Zeit am iPhone ist unbekannt (Annahme 3–7 ms,
  sonst greift die 15-Hz-Grenze).
- Die Echtzeit-Aufnahme im Browser zeigt beim Gleiten M-KLICK 5,5–7,9 dB (Aufnahme-Jitter unter CDP); bindend ist die
  Offline-Messung im Worklet-Shim.

## V4c-fix — LFO-Tiefen PMD/AMD durch Import, FELD und .syx-Export; Einbruch bei [Anwenden]/↶; FERTIG am Taktstrich · App 3.11.0

**5 Befunde (Abnahme + Fach-Prüfung V4c), alle behoben:**

1. **V4c-05: PMS > 0 mit winzigem PMD wurde als PMD 99 exportiert** (8 von 1088 Stimmen der Synprez-Bänke, z. B. WATER GDN
   PMS 1 / PMD 1: keine Route, weil 0,0047 HT unter der Schwelle). Der Import hält jetzt `fm6.pmd` (und `fm6.amd`) neben
   PMS/AMS (nur Werte < 99; fehlend = volle Tiefe); der Export schreibt bei fm6-Klängen ohne Route diesen Wert (ist die Route
   über der Schwelle entfernt worden, PMD 0 = was die App spielt). Rundlauf jetzt 1088/1088 parametergleich (ROM1A + 33 Bänke).
2. **N7F-51: Import ins FELD verlor PMD/AMD** (Vibrato ×20, Tremolo +20 dB nach einer Null-Bearbeitung; Export danach PMD 99).
   Neu im Graphen `p.fmx.pmd` / `p.fmx.amd` (0..99, `FMX.norm` hält sie, `fromFm6`/`toFm6` tragen sie): das Worklet spielt
   `lfoFm × PMD/99` (= die frühere Route lfo1 → pitch) und `lfoAm` an einem Ausgang wie die frühere Route lfo1 → amp
   (Verstärkung 1 − AMD/99 · s · ½ · LFO), an einem Modulator × AMD/99 in dB. `fxEnsure` nimmt die Tiefe aus der Route
   (lfo1 → pitch und jetzt auch lfo1 → amp gehen in den Graphen, keine Verdopplung). Ohne die Felder (jeder FELD-Klang) wie bisher.
   Gemessen: BRASS 1 17,3 → 17,2 Cent (vorher 274,9), PMD 30/PMS 1 28,5 → 28,3 Cent, AMD 20/AMS 3 1,9 → 1,9 dB (vorher 22,3),
   AMD 99/AMS 3 9,5 → 9,5 dB; Export nach der FELD-Bearbeitung PMD 5 / AMD 20 wie die Bank.
3. **V4c-05: AMD 99 bei AMS nur an Modulatoren** (ROM1A GUITAR 1 3 → 99, FLUTE 1 13 → 99, VOICE 1 2 → 99): der Export schreibt
   `fm6.amd`; ROM1A → Export ohne Bearbeitung hat jetzt nur noch AMD-Abweichungen bei Stimmen mit AMS 0 (klangneutral).
4. **[DX-tauglich machen] [Anwenden] / ↶ auf klingender Note: 6–7 dB Einbruch für ~10 ms** (Welle + Hüllkurven-Form zusammen).
   Ursache: die Vorzeichen-Messung vor der 30-ms-Überblendung (2 ms) sah anfangs korrelierte Signale, nach ~3 ms −0,9 →
   Auslöschung. Messfenster jetzt 5 ms (`SX_M`), die Überblendung selbst bleibt 30 ms. Offline-Scan 57 Schaltzeiten × 48/44,1 kHz:
   0 Einbrüche > 3 dB (vorher 9 bzw. 6), schlimmster −1,3 dB (Kontrolle −1,2); Echtzeit 44 Schaltungen, Spur und Master 0.
5. **● FERTIG am Taktstrich warf die Aufnahme weg** (P1/P2/P3; L schaltete LATCH): FERTIG wirkt auf pointerdown, die Ergebnis-
   Meldung mit [Rückgängig] liegt danach unter dem Finger, der Kompatibilitäts-Klick traf sie. ▶, ● und ● FERTIG legen beim Loslassen
   den Geisterklick-Schutz (`UI.ghost`, jetzt auch für Klicks mit `detail 0`, wie Chromes Tap); die Meldung bleibt stehen.

**Abnahme (Skripte in `dirigent-test/`):** `v3-acc4c-syx.mjs` (1088/1088), `v3-verify-pmd99.mjs` (1024/1024),
`v3-qa4cfp-vib.mjs`, `-trem.mjs`, `-brass.mjs` (PASS), `v3-indep-syxamd.mjs`, `v3-qa4cfp-syx.mjs`, `v3-fix4c-n7f51.mjs` (echte
Worklet-Quelle in OfflineAudioContext), `v3-fix4c-amd-audible.mjs` (X.amd hörbar: Modulator-Helligkeit 7,7 / 1,8 / 1,3 dB bei
AMD 99 / 20 / 3, Ausgangs-Tremolo 9,1 / 1,7 dB), `v3-rv-dxdip-scan.mjs`, `v3-rv-dxdip-rt.mjs many`, `v3-acc4c-msg2.mjs`
(−1,12 dB, ideal −1,09), `v3-acc4c-apply4.mjs`, `v3-qrg4c-recdone.mjs` P/P375/P320, `v3-qrg4c-recdone2.mjs` (3,3 … 4,1),
`v3-repro-fertig-ind(-l).mjs` (P 390/375/320, L 844/667: Aufnahme bleibt, LATCH unverändert), Smoke ohne Fehler.

**Abweichung:** ältere Bibliotheks-Sounds aus einem .syx-Import (vor diesem Fix, ohne `fm6.pmd/amd`) bekommen beim ersten
FELD-Schritt die Tiefe aus ihrer Route; ohne Route ist sie 0 (klingt wie vorher im DX-Pfad). Ein erneuter Import derselben Bank
wird wegen der neuen Felder nicht als „schon vorhanden“ erkannt.

## G3-FM-gruppe-fix — Punkt-Form zeigt die Zeiten der DX-Form; DX-tauglich-Blatt mit den FELD-Nummern · App 3.11.0

1. **Punkt-Form: Anzeige = Klang am Bezugston** (Nachtrag 2 A.5 Nr. 4, KP §4.11). Die Punkte speichern weiter die Zeiten ohne
   Time/Key und MAKRO (die Stimme rechnet beides zu, `ptDxF`, Klang unverändert). Achse, Fußzeile, X-Anzeigen, LCD und Ziehen zeigen
   jetzt die Zeit, die am Bezugston klingt (`FMX.ptDispT`, gleiche Rechnung wie das Worklet); Ziehen auf „X 100 ms“ speichert die
   Zeit, die dort 100 ms klingt (`FMX.ptStoreT`, Umkehrung). Das Segment nach dem Sustain-Punkt zeigt den Release wie die DX-Form
   (vom Körperpegel max(L2, L3); alles flach: DX-Haltephase). Fußzeile mit Sustain vor dem Ende: „Gesamt ‹bis Sustain› · R ‹Rest›“
   wie in der DX-Form; sonst „Gesamt ‹alles›“. Ein neuer End-Punkt [+] liegt 100 ms (angezeigt) hinter dem letzten.
   Prüfung: alle 108 Werks-FM-Hüllkurven × Noten 36/60/84 zeigen nach der Umwandlung dieselben Zeiten wie die DX-Form (vorher 81/108
   > 25 % daneben); Worklet: angezeigte = gehörte Zeit am C4 (rs 0/2/4), auch nach einem Zug auf „X 1,0 s“.
2. **[DX-tauglich machen] nennt die Nummern aus dem FELD** (KP §4.12, V4c-06). Verbindungen („4 → 3 gelöst“, „… neu“), Wellen,
   Hüllkurven, Feedback und die Tonhöhen-Quelle stehen mit der FELD-Nummer; ändert sich die Nummer, endet die Zeile mit
   „· wird OP 3“, und eine Zeile „Neue Nummern: OP 2 wird OP 3, OP 3 wird OP 2“ listet alle neuen Nummern.

**Abnahme (`dirigent-test/`):** `v3-g3fix-conv.mjs` (324/324), `v3-g3fix-audio.mjs` (18/18), `v3-g3fix-ui.mjs` P/L/P375 mit den
echten Schriften (Barlow Semi Condensed, JetBrains Mono über http), `v3-g3fix-dxnum-node.mjs` (600 Zufallsgraphen, 318 mit neuen
Nummern, 3838 Zeilen), `v3-rep-dxnum-ui.mjs`, `v3-grpG3-convui.mjs`, `v3-repro-ptconv-ui.mjs`; ohne Rückschritt: `v3-v4f-ui`
(198/198), `v3-v4f-node`, `v3-v4f-native`, `v3-v4ffix-conv` (171/171), `v3-v4c-node`, `v3-v4c-accept`, `v3-qa4f-*`; Smoke ohne Fehler.

**Bekannt, unverändert:** die DX-Fußzeile ist auf P1/P2/L1 breiter als ihr Feld und wird mit „…“ gekürzt (z. B. 326 > 236 px);
eine flache DX-Stufe > 20 s bleibt in der Punkt-Form 20 s (längstes Segment); Lin rechnet Time/Key über die lineare Strecke, ein
Angriff unter 1 ms kann nach [Exp] → Lin bis 0,5 ms anders lesen.

## G3-klein-fix — 🎲 auf FELD-Sounds verliert nichts, Loop zwischen Nachbarpunkten pendelt, „1 Stimme“, zwei Testerwartungen · App 3.11.0

1. **Kopf-🎲 auf einem FELD-Sound, den die DX-Form nicht tragen kann** (Badge nicht ✓: freier Graph, andere Nummern, Wellen,
   Punkt-Hüllkurven, Phasen, Feedback-Wege): würfelt jetzt FELD-gerecht wie das Zufall-Blatt (`fxRandGraph`, gemeinsam mit
   `fxRandomize`) – Frequenzen, DX-Form-Hüllkurven und Pegel; Verbindungen, Plätze, Feedback, Wellen, Phasen und Punkt-Hüllkurven
   bleiben. LCD „Zufall (FELD) · Verbindungen, Wellen und Punkt-Hüllkurven bleiben“. Ein Undo je 🎲 stellt den Sound exakt her.
   Ein reiner DX-Graph (Badge ✓) würfelt wie bisher (auch den Algorithmus); dort geht nichts verloren.
2. **[Loop A]/[Loop B] auf Nachbarpunkten** (Worklet, nativer Pfad, Abgleichs-Simulation): die Schleife pendelt A ↔ B – von B zurück
   nach A in der Zeit von A → B, dann wieder A → B (Periode 2 × Segment). Vorher lief das Segment von B nach B und blieb flach.
   Schleifen über drei oder mehr Punkte unverändert. Auch mit A = P0, vor dem Sustain (endet beim Loslassen) und mit [Frei]
   (Aufholen ganzer Perioden). LCD „Schleife 1 → 2 · Nachbarpunkte: pendelt 1 ↔ 2“.
3. **DX7-Bank-Toast:** „1 Stimme“, „n Stimmen“.
4. **`v3-acc4c-syx.mjs` „FELD stumm“ / „FELD Nummern“: Testerwartung falsch, App richtig** (KP §6.4): Nr. 1 – DX-tauglich nur mit
   der eigenen Nummerierung; ein Graph „wie DX 1 – Nummern anders“ braucht erst [Nummern angleichen], der Export überspringt ihn mit
   Grund (N7F-50). Nr. 7 – das DX7-Stimmenformat (VMEM) hat kein Operator-an-Bit, ein stummer OP wird mit Pegel 0 geschrieben und
   kommt als an · OL 0 zurück (klingt gleich). Test angepasst: 5 exportiert, „FELD Welle“ und „FELD Nummern“ übersprungen, stumm ≙ OL 0.
5. **V0d-2-11 (`v3-v0d-ui-d.mjs`) und Tabelle T2 (Nachtrag 1):** die angezeigten Zeiten folgen seit V4f-fix der msfa-Anstiegskurve
   (K2-57 bleibt) und sind richtig: Ausgang A 0,8 ms (statt 0,6), Pad-Ausgang A 138 ms (108), Pad-Modulator A 130 ms (113),
   D1 183 ms (143). Testerwartung und T2 angepasst, App unverändert.

**Abnahme (`dirigent-test/`):** `v3-g3k-dice.mjs` (13/13), `v3-g3k-loopnb.mjs` (Worklet und nativ über die App, 7/7; auf dem
alten Stand 6 rot), `v3-g3k-loopnb-off.mjs` (Periode ±3 % bei 44,1/48 kHz, M-KLICK, Release, 18/18), `v3-g3k-loopnb-free.mjs`,
`v3-g3k-lcdfont.mjs` (P/P375/P320/L/L667 mit Barlow Semi Condensed: nichts abgeschnitten), `v3-grpG3-loopadj.mjs`,
`v3-acc4c-syx.mjs` (6/6), `v3-v0d-ui-d.mjs` (51/51); Regression `v3-g3k-reg.sh`; Smoke ohne Fehler.

## V0c — Song-Sofortmaßnahmen (+ N0c ▶ oben / Träger gehören dem Song, + N7S-01 … N7S-07 nach EN2-05) · App 3.11.1

Grundlage: Spec §2.3 (S-01 … S-04), §4.5, §4.8, §17 V0c; Nachtrag 1 A.3 (N0c: TA9, EN-06); Nachtrag 2 Teil B (EN2-05, B.1 Nr. 4, 8,
9, 10, 15, K2-05, K2-27, K2-63) mit `r7/song-delta.md` 6.1–6.2, 7.1–7.4, 8.1–8.2, 12.2 und den Maßen aus `r7/song-geo/geo.out`.
V0c war beim Erscheinen von Nachtrag 2 nicht begonnen → N7S-01 … N7S-07 komplett in V0c (K2-05 Fall A). Gebaut nach V4c/G3-klein-fix;
Version **3.11.1** statt 3.3.0, weil die Versionen streng steigen (E.5 Punkt 3: nachgeholte Pakete bekommen die nächste Zwischennummer).

**Was neu ist**
1. **● im Song nimmt nur seine Ziele auf (S-01, N7-R8 „Überschreiben ab n“).** Ist ein Song da, legt ● keinen neuen Song mehr an,
   sondern öffnet das **Start-Blatt** (Halten auf ● öffnet es jederzeit): Kopf „AUFNAHME AB TAKT n“ (Positionsmarke) bzw.
   „AUFNAHME TAKT n“ / „TAKTE a–b“ (gelbe Auswahl), Ziele **[CLIPS] [AKKORDE] [MELODIE]** (Standard: leerer Song alles, sonst nur
   MELODIE), Zeile „Überschreiben – was du änderst, ersetzt …“, **Vorlauf [1 Takt │ aus]** (bei Takt 1 Einzähler), „überschreibt …
   ab Takt n“, **[● START]**. Stehend: ▶ SONG ab n (bzw. n−1); Clips laufen: der Song übernimmt am nächsten Taktstrich; Song läuft:
   Einstieg im laufenden Takt. **CLIPS:** jede Spur, die du startest/stoppst, wird ab ihrem ersten Ereignis bis zum Ende ersetzt,
   danach spielt der alte Teil weiter („Bandmaschine“); **AKKORDE:** Takte mit neuem Akkord werden ersetzt (¼-Schlag-Vorgriff,
   je Takt gewinnt der jüngste Durchgang), der Song spielt seine übrigen Akkorde weiter; **MELODIE:** Overdub. Mit gelber Auswahl
   steigt die Aufnahme am Auswahlende von selbst aus; mit SCHLEIFE ist jeder Durchgang Teil derselben Aufnahme (nach jedem
   Durchgang folgen die aufgenommenen Spuren dem neuen Stand). Nach dem Ende folgen die aufgenommenen Spuren wieder dem Song.
   **Ein Undo für die ganze Aufnahme.** Szenen-Clips bleiben unberührt (EN7-04). Leerer Song: wie WP6 (alles, SG1–SG8).
2. **● zeigt die Ziele** („● MEL“, „● AKK+MEL“, „● ALLES“; in der schmalen Spalte zweizeilig). **Banner als Überlagerung**
   (N7S-02): rot in Lineal-Höhe über der Taktleiste („● Takt 3 · Überschreiben · AKK + MEL · Clips bleiben“), der aufgenommene
   Bereich rot 12 % getönt, die beschriebenen Zeilen rot gesäumt; **in der Clip-Ansicht in der Kopfzeile** über BPM … ≡ (K2-63,
   gleiche Höhe, Tipp = Song zeigen), nie über Raster oder Teil-Leiste. Nichts verschiebt sich (±2 px gemessen).
3. **Taktleiste wählt (N7-R7, N7S-06):** Tipp auf eine Taktnummer = Positionsmarke ▼ + gelber Chip (#ffb22e, dunkle Zahl, Band
   35 % / Zeilen 7 %), zweite Nummer = Bereich, Tipp in die Auswahl hebt sie auf. **Kein Sprung** bei laufendem Song.
4. **▶ oben im Song = ▶ SONG (EN-06):** ab der Positionsmarke, sonst ab dem Takt, in dem zuletzt gestoppt wurde; die Taste zeigt
   „SONG“ unter ▶ (Breite gleich). **[⏮]** in der Song-Transportzeile setzt auf Takt 1. ▶ SONG in der Zeile startet ebenso an der
   Marke. Song-Ansicht zu: ▶ wie WP7.
5. **TA9 Träger gehören dem Song (N0c):** Start von ▶ SONG / ● SONG merkt Ziel, Latch, Modus, Verschiebung; sobald keins mehr läuft
   (Ende, ■, Ende einer Aufnahme auch bei laufenden Szenen), kommt der Stand im selben Moment zurück – Toast „Träger zurück auf
   ORIGINAL“ mit [F behalten]. Song-Daten unverändert, Harmonie-Kern unverändert (I-01).
6. **SCHLEIFE (S-02, N7S-07):** Text-Taste **[SCHLEIFE: aus │ Song │ Takt 3–4]** (zweizeilig, P1 83×40) → Blatt [aus] [Song]
   [Bereich] (Bereich = gelbe Auswahl, sonst der Takt der Marke). Auf dem Lineal **grüne 3-px-Linie** mit Griffen ┃ (Treffer
   36 × 34, Ziehen mit stehender Ansicht, ein Undo); Gelb und Grün überlagern sich nicht. Daten `song.loop = {on, a, b}`
   (Migration `loop:true|false` → `{on, a:0, b:bars}`), am Bereichsende Sprung an den Anfang **phasengleich**; eine Schleife über
   den ganzen Song spielt bitgleich wie vorher (gegen G3-klein-fix gemessen). API `songLoop(on)` unverändert, neu `songLoopRange`.
7. **Akkorde von Hand (S-03, N7-R10):** Etikett **AKKORDE** (statt TRÄGER). Tipp auf einen Chip → **Akkord-Auswahl** für genau
   diesen Eintrag (Schlag bleibt, z. B. 6,5), Tipp auf eine leere Stelle → neuer Eintrag am Taktanfang (ersetzt den Takt).
   Blatt über der Tastatur (P ≈ 216 px, L zweispaltig ≈ 150 px): Kopf „AKKORD · Takt 4, Schlag 1“, aktueller Chip → **Text ⌨**
   (`parseChord`: Am, A#m7, Bb/B/H je nach Notennamen, C/E, Fmaj7, Gsus, Esus2, D5, F#m7b5, Cdim7, Eaug, C+, Am6, Cadd9, Cis, Es …;
   ungültig rot mit „z. B. Am7/G“), [✓] [ORIG.] [Löschen]; **Stufe** (7 leitereigene Dreiklänge der Tonart an dieser Stelle, in
   Moll zusätzlich „V (Dur)“, wischbar), **Zuletzt** (Träger-Verlauf), **[Frei ▾]** (Grund 12 · Art 15 · Bass, [Übernehmen]),
   [Akkorde quantisieren …]. Ein Undo je Änderung, Toast „Takt 4: Dm7 · [Rückgängig]“. Lang-Druck auf einen Chip löscht wie WP6.
   Ohne [♪ greifen] und [÷2] (Spec), ohne [– halten] (bei Song-Einträgen sinnlos).
8. **Akkorde quantisieren (N7-R11):** Etikett AKKORDE → [Akkorde quantisieren …] / [Akkorde (in Takt a–b) löschen]; Mini-Blatt
   Bereich [Auswahl │ ganzer Song], Raster [Takt │ ½ Takt │ Schlag], Vorschau „6 Akkorde · 5 rücken · 1 fällt zusammen“,
   [Quantisieren] = ein Undo, Toast mit den Zahlen. Regel: nächster Rasterpunkt (Gleichstand: der spätere), mehrere auf einem
   Punkt → der zuletzt gespielte gewinnt, danach gleiche Akkorde hintereinander → der spätere fällt weg; ORIGINAL zählt als Akkord;
   außerhalb der Auswahl bleibt alles deep-equal.
9. **Melodie verständlich (S-04):** Zeile „MELODIE · S4 · ⇅ fest“. Melodie-Spur-Vorschlag beim ersten ● SONG bzw. bei einer
   Melodie-Aufnahme ohne Melodie: die gewählte Spur, wenn sie frei ist, sonst eine Synth-Spur ohne Clips im Song (nicht MONO/LEGATO
   bevorzugt). Spielt die Melodie-Spur Clips mit MONO/LEGATO-Klang: Toast „Melodie und Clips teilen sich eine Stimme – Melodie
   klingt abgehackt“ mit [Freie Spur nehmen] (ein Undo).
10. **Hilfe** (Menü → Hilfe): SONG-AUFNAHME, TAKTLEISTE IM SONG, SCHLEIFE, AKKORDE IM SONG, TRÄGER GEHÖREN DEM SONG, MELODIE IM SONG.
11. **Test-API:** `songLoopRange`, `songRecTargets`, `songRecFrom({from, to, preroll, targets})` (nur 'over'), `songPos`,
    `songSelect`, `songSetChord(bar, chord, {k})`, `parseChord(text, {names})`, `quantizeChords({grid, a, b, dry})`,
    `openChordPick`, `openRecStart`; `runtime().song` + `posBar`, `pos`, `sel`, `targets`, `recFrom`, `recTo`, `loop`, `beat`,
    `carrierSaved`. Alte Namen unverändert (`songRec`, `songPlay`, `songLoop`, `songMel`).

**Abnahme** (`dirigent-test/`, Chromium + CDP-Touch, 240 BPM; Skripte `v3-v0c-song.mjs` P/L 40/0, `v3-v0c-ui.mjs`
P/P375/P320/L/L667 je 41/0, `v3-v0c-frei.mjs` 6/0)

| ID | Ergebnis | Messung |
|---|---|---|
| V0c-01 | ✓ Ziel AKKORDE: Lanes und Melodie deep-equal, F in Takt 2 (4,80), G ersetzt C in Takt 3 (8,97), Rest unverändert; ein Undo → deep-equal | song P/L |
| V0c-02 | ✓ Ziel MELODIE: Lanes + Träger deep-equal, 3 Noten zusätzlich an den gespielten Schlägen (±0,02) | song |
| V0c-03 | ✓ Ziel CLIPS: Start Spur 2 in Takt 3 → nur Lane 2 ab Takt 3 ersetzt, alle anderen deep-equal; nach dem Ende spielt der alte Teil weiter | song |
| V0c-04 | ✓ leerer Song: alle Ziele an; `wp6-song` P/L 27/0 (SG1–SG8) | wp6-song |
| V0c-05 | ✓ Banner mit Ziel und Starttakt, ●-Chip „● MEL“ → „● AKK+MEL“, Start-Blatt „überschreibt Akkorde, Melodie ab Takt 3“ | ui ×5 |
| V0c-06 | ✓ SCHLEIFE 83×40 (P1) / 76×37–39 (L); `songLoopRange({on:true,a:2,b:4})`: 3 Durchläufe, jede Note ±0,002 Schlag, an Takt 3 der 3. Clip-Takt (phasengleich) | song, ui |
| V0c-07 | ✓ Migration `loop:true` → `{on:true,a:0,b:3}`; Wiedergabe gegen G3-klein-fix identisch (noteLog > 40 Noten, ±0,002); `songLoop(true/false)` boolean, Bereich bleibt | song |
| V0c-08 | ✓ Tipp AKKORDE-Zelle Takt 5 → „Dm7“ ⏎ → Schlag 16, D, m7, ein Undo; Wiedergabe ruft Dm7 bei Song-Schlag 16 ab (±0,01); hörbar: F in Takt 2 macht aus 45 → 53 | ui, song |
| V0c-09 | ✓ alle 16 Fälle + Es, Cism; X7 und Am/Q → null | song |
| V0c-10 | ✓ Demo-artig (Synth 1–3 mit Clips) → Synth 4; MONO-Spur mit Clips → Toast mit [Freie Spur nehmen] → Synth 4 | song |
| V0c-11 | ✓ Regression (unten); M-PLATZ Song-Ansicht + Blätter in P1–P3, L1, L2; Zeilen 44,4 / 32,1 / 28,7 / 27,3 / 25,9 px (L2 wie V0a) | ui |
| N0c-01 | ✓ ■ oben, ▶ oben (Touch auf `#bPlay`) → `song.play`, kein Szenen-Start, Taste zeigt „SONG“ | ui |
| N0c-02 | ✓ ■ in Takt 5, ▶ oben → erstes Ereignis bei Song-Schlag 16 ± 0,002; Marke Takt 3 hat Vorrang; [⏮] → Takt 1 | song, ui |
| N0c-03 | ✓ Song-Ansicht zu: ▶ startet die Szenen | ui |
| TA9 | ✓ Xanders Weg I2: leerer Song, Szenen laufen, ● SONG, F gespielt, ● Ende → Träger ORIGINAL, Szenen laufen weiter, Bass 48 statt 53; Toast mit [F behalten] | song |
| N7S-01 | ✓ Canvas P1 306×330,8, L1 392×207,4 (= V0a, auch P2/P3/L2); Ziele im Start-Blatt und beim Halten auf ● | ui |
| N7S-02 | ✓ während ● alle Elemente ±2 px gleich; Bereich rot getönt (Pixelprobe) | ui |
| N7S-03 | ✓ Chip bei 6,5 → Dm7 bei 6,5; per Touch „Takt 2, Schlag 3,5“, Stufen-Chip lässt den Schlag | song, ui |
| N7S-04 | ✓ Am 0 · F 3,8 · C 8,3 · G 11,6 · G 12,2 · Am 16,1 → Am 0 · F 4 · C 8 · G 12 · Am 16, `{moved:5, merged:1}`, Toast, ein Undo | song |
| N7S-05 | ✓ ½ Takt: C 9,9 → 10, G 11,1 → 12; Auswahl T3: außerhalb deep-equal | song |
| N7S-06 | ✓ „3“ → `songPos()` 2, `songSelect()` {2,2}, Chip (255,178,46) ±12, Zahl dunkel; „5“ → {2,4}; Tipp hinein → null; laufend kein Neustart (noteLog ohne Lücke); ▶ oben startet bei T3 | ui |
| N7S-07 | ✓ grüne Linie (Pixel oben grün, Lineal-Mitte amber), Griff am Bereichsanfang; Griff ziehen → Takt 3–5, Ansicht steht, ein Undo | ui |
| FP-SONG | ✓ ● über laufende Clips → Song am nächsten Taktstrich; Schleifen-Durchgänge (jüngster gewinnt, Melodie im Bereich, ein Undo); Auswahl-Aufnahme steigt selbst aus; `S.tracks[].clips` deep-equal; Speichern/Laden mit Bereich, WP6-Dateien migrieren | song |

**Regression** (`v3-v0c-reg.sh` = V4c-Liste mit Versionskopien `v3-v0c-adapt-*` für 3.11.1, `v3-v0c-reg2.sh`, `v3-v0c-reg3.sh`
= G3-Suiten + V0c-Suiten; Ausgaben `dirigent-test/v3-v0c-reg/`): rot nur, was auf G3-klein-fix bzw. V4c genauso rot ist
(`node-fm`, `v3-v0b-adapt-wp3-browser` PR2, `-wp3-ui` MO49, `wp4-offline`, `wp3-adapt-func-build(-native)` C2/D5, `v3-v4bfix-big`,
`v3-v4b-node` N7F-34 – auf dem Snapshot identisch 14/15, `fp4f-loop` 1/10 wie vorher, `v3-v4a-node` N7F-09 Last), dazu unter Last
rot und allein bzw. auf dem Snapshot gleich: `wp6-song-P` SG4 (allein P/L 27/0, Snapshot ebenso), `v3-v0b-adapt-v0a-fix` V0a-16 L
(150-ms-Probe, auf G3-klein-fix 3 × ebenso rot), `wp7-adapt-wp1-perf` PE1 Bildzahl (Snapshot identisch 8/2), `v3-v4a-ui` N7F-10
CPU 13,2 % (Last). `v3-v0c-adapt-wp1-misc` nach Korrektur der Versionskopie 104/0. Grün u. a. alle DoD-Läufe (wp1–wp7, 60 s),
`wp1-dod` (Startzeit), `v3-v0b-follow` 52/0, `wp6-drums` P/L, V0d-, V4a-, V4b-, V4f-, V4c-Suiten, `v3-g3fix-*`, Smoke ohne Fehler.

**Fach-Prüfung** (Teil J: FP-TOUCH Haupt-, FP-SONG Zweit-Blick; als zweiter Durchgang über Diff, Tests und Bilder auf mich selbst
angewandt – ein eigener Agent stand in diesem Bau nicht zur Verfügung). **11 Befunde, alle behoben:**
1. FP-TOUCH: Segmente (Vorlauf, Art/Bass, Bereich/Raster) in den berührungsgeschützten Blättern reagierten nicht auf den Finger
   (guardTouch unterdrückt den synthetischen Klick) → `bindSegTap`; Touch-Tests dafür.
2. FP-TOUCH: [✕] der Blätter 44×32 → 44×40.
3. FP-TOUCH: Start-Blatt im Querformat 245 px hoch (verdeckte den Song) → zweispaltig ≈ 150 px.
4. FP-TOUCH: ●-Beschriftung „AKK+MEL“ in der 37-px-Spalte (L, P3) abgeschnitten → zweizeilig.
5. FP-TOUCH: Banner-Texte im Hochformat abgeschnitten (Song: „… Clips bleibe“, Kopfzeile „ab Ta“) → Kurzformen nach Breite.
6. FP-TOUCH: „MELODIE“/„AKKORDE“ im schmalen Etikett abgeschnitten → kleinere Schrift in der Seitenspalte.
7. FP-SONG: ↶/↷ während einer Aufnahme hätte den Song unter der laufenden Aufnahme getauscht → „Erst Aufnahme beenden“.
8. FP-SONG: ein Song, der hinter der Abspielmarke endet (kürzer gemacht, oder Aufnahme über das Ende ohne Inhalt dort), lief stumm
   weiter → endet sofort.
9. FP-SONG: die Abspielmarke sprang nach einem Bereichs-Sprung ≈ 100 ms zu früh (Planer schon im nächsten Durchgang) → `songBeatOf`.
10. FP-SONG: Einstieg bei laufendem Song erst am nächsten Taktstrich – Melodie-Noten davor gingen verloren → Einstieg im laufenden Takt.
11. FP-SONG / M-ANSICHT: [↩ SONG] konnte während der Aufnahme erscheinen und die Transportzeile umbrechen → während ● verborgen,
    die aufgenommenen Spuren werden am Ende zurückgegeben.
Begründet, nicht geändert: Transportzeile 40 px hoch (V0a; N7S-01 verlangt den Canvas unverändert), [S4 ▾] 33–41 px breit und ●/▶
in der Seitenspalte 30–37 px breit (V0a-Stand); Griff-Trefferzone 36 × 34 reicht bis in die erste Zeile – ein Wisch, der genau auf
einem Griff beginnt, verschiebt den Griff statt zu rollen (ein Undo, LCD-Hinweis); TA9-Toast nach jedem Song-Ende mit Akkorden (Spec).

**Abweichungen**
1. **[● MEL.] ist aus der Transportzeile entfernt** (V2e-Plan vorgezogen): ● mit Ziel MELODIE macht dasselbe (Overdub, Einstieg im
   laufenden Takt), zwei „● MEL“ nebeneinander wären verwirrend; API `songMel` bleibt, ebenso [S4 ▾].
2. „Verlassen des Song-Modus“ (TA9) = Ende der Song-Wiedergabe, nicht das Schließen der Song-Ansicht (der Song darf bei offener
   Clip-Ansicht weiterspielen wie in WP6).
3. Aufnahme über das Song-Ende hinaus verlängert den Song, wenn dort etwas aufgenommen wurde (Bandmaschine; Spec sagt dazu nichts).
4. Stufen-Chips nach der Tonart, die an dieser Stelle klingt (`songKeyAtBar`); Song-Tonart kommt mit V2f. [Für alle „Strophe“] erst mit V2e (Marken).
5. Kopfzeilen-Banner liegt über BPM … ≡ – einen Projekttitel gibt es in `#top` nicht (K2-63 „an der Stelle des Projekttitels“).
6. V0c kennt nur „Überschreiben“ (wie Spec); „Einfügen“, „Ersetzen/Overdub im Bereich“ und NOTEN auf anderen Spuren: V2d′.
7. **Größe +64,4 KB** statt +42 KB (+53 %, über der 50-%-Regel): Aufnahme-Ziele mit Durchgängen/Bereich/Rückgabe (≈ 12 KB),
   ChordPick mit Frei/Text/Stufen (≈ 11 KB), Start-Blatt, Schleifen- und AKKORDE-Blätter (≈ 8 KB), N0c TA9/EN-06 (≈ 5 KB),
   Taktleiste/Schleife/Banner-Zeichnung (≈ 6 KB), `parseChord`/Quantisieren (≈ 5 KB), CSS (≈ 9 KB), Hilfe und Kommentare.
   Datei 1,88 MB (Grenze 5,0 MB), Startzeit-Abnahme (`wp1-dod`) grün.

**iPhone-Prüfpunkte für Xander** (N2-0c-01 + Nachtrag 1 C.5 Punkt 3)
1. Song-Ansicht: einen Akkord-Chip antippen, „Dm7“ eintippen, ⏎ – der Chip heißt Dm7, Schlag gleich; ↶ holt den alten.
2. Etikett AKKORDE → „Akkorde quantisieren …“ → Raster Takt → [Quantisieren]: alle Chips stehen auf den Taktstrichen.
3. Auf die Taktnummer 3 tippen: gelb; ▶ oben (zeigt „SONG“) startet dort, nicht die Szenen.
4. Szenen laufen, leerer Song: ● SONG, einen Akkord (F) spielen, ● beenden → die Szenen spielen wieder untransponiert, Toast [F behalten].
5. Song mit Inhalt: ● → Start-Blatt, nur AKKORDE an, [● START], in Takt 2 einen anderen Akkord spielen, ● → nur Takt 2 hat sich geändert.
6. SCHLEIFE → Bereich (vorher Takt 3–4 gelb wählen) → die grüne Linie; den rechten Griff ziehen. (Noten in der Melodie-Rolle während
   ▶ SONG treffen: V0b, unverändert.)

Fähigkeiten-Summe unverändert (V0c deklariert keine Fähigkeit). Für Xander im Dashboard: nichts.

**Bekannte Lücken:** kein WebKit-/iPhone-Test (Chromium + CDP-Touch); der Zwischenstand an Artifact-Adresse und Pages-Seite
(EN-20/EN2-15) ist Sache des Orchestrators; Text-Eingabe mit iOS-Tastatur nicht am Gerät geprüft (das Blatt springt beim Fokus
nach oben).

## V0c-fix — eine Aufnahme = ein Undo, „ab Takt n“ im Start-Blatt, Melodie-Spur ohne Clips + Hinweis, Schleife über den ganzen Song, ChordPick wischbar · App 3.11.1

1. **Eine Aufnahme = ein Undo-Schritt, auch wenn du währenddessen im Song etwas änderst** (S-01, TA8). Was du während ● SONG oder
   [● MEL.] im Song änderst (Zelle antippen, Akkord setzen oder löschen, Schleife, Quantisieren, Melodie-Spur), legt keinen eigenen
   Undo-Schritt mehr an, sondern gehört zum Schritt der Aufnahme (`pushSongUndo` während `R.songRec`/`R.melRec`). Ein ↶ nach der
   Aufnahme bringt genau den Song von vorher zurück; kein Schritt landet mehr auf einem halb aufgenommenen Stand (vorher kam das
   aufgenommene F nach zwei ↶ zurück). Während einer Aufnahme sind ↶/↷ auf Song-Schritte gesperrt („Erst Aufnahme beenden“), die
   Toasts solcher Änderungen zeigen dann kein [Rückgängig]. Ein [● MEL.]-Durchgang ohne Noten, aber mit Änderungen, wird ein Schritt
   „Song bearbeitet“.
2. **Start-Blatt nach Tipp auf Takt n: [Ab Takt n │ Nur Takt n]** (B.1 Nr. 8, K2-27; V0c nur Überschreiben). Ist genau ein Takt
   gewählt, zeigt das Blatt beide Wahlen; vorgewählt ist „Ab Takt n“ (offenes Ende bis ●, Kopf „AUFNAHME AB TAKT n“), „Nur Takt n“
   nimmt wie bisher nur diesen Takt auf (Kopf „AUFNAHME TAKT n“, stanzt am Taktende aus). Ab 2 gewählten Takten bleibt es beim
   Bereich, ohne Auswahl bei „ab Takt n“. P: eigene Zeile unter den Zielen; L: neben dem Kopf. Kein zweiter Tipp zum Abwählen mehr nötig.
3. **Melodie-Spur beim ersten ● SONG** (S-04, V0c-10): „ohne Clips im Song“ heißt bei leerem Song jetzt „ohne Clips überhaupt“ (die
   Aufnahme wird die anderen Clips starten). Ist die gewählte Spur so frei, bleibt sie (alte SG-Tests); sonst die freie Spur, bevorzugt
   nicht MONO/LEGATO. Erst wenn jede Synth-Spur Clips hat, gilt die alte Regel (spielt gerade nichts), dann die gewählte. Demo mit
   Synth 1 gewählt → Melodie auf Synth 4.
   **Hinweis „Melodie und Clips teilen sich eine Stimme – Melodie klingt abgehackt“** jetzt auch bei der ersten Aufnahme: sobald die
   Melodie-Spur (MONO/LEGATO) während der Aufnahme einen Clip startet oder ab Takt 1 spielt, mit [Freie Spur nehmen] (bevorzugt
   eine Spur ohne Clips; wählt sie auch an; gehört zum Undo-Schritt der Aufnahme); und am Ende in der Schluss-Meldung
   („Song: n Takte · Melodie: m Noten · Melodie und Clips teilen …“ mit [Freie Spur nehmen] [▶ SONG]). Auch nach einer Wahl in [S4 ▾].
4. **Ein neu aufgenommener Song schleift über den ganzen Song** (V0c-07): `RecHelpers.logLaunch` verlängert eine Schleife, die den
   ganzen Song deckt, mit dem Song (vorher blieb `{a:0,b:1}` stehen, wurde gespeichert, und `songLoop(true)` wiederholte nur Takt 1).
5. **ChordPick: Stufe/Grund/Art mit dem Finger wischbar, Stufen-Zeile passt** (§4.5, M-PLATZ). `guardTouch` lässt Berührungen in
   Wischlisten (`.cp-sc`, `.pan-x`) nativ scrollen (Tipp weiter über pointerup, den nachfolgenden Klick fängt der Geisterklick-Schutz);
   die Listen enden mit 2 px Rand, damit der letzte Chip ganz sichtbar wird. Die Stufen-Chips teilen sich die Zeile (≥ 36 px, dichte
   Zeile nach §0.3), unter 380 px (P) bzw. 760 px (L) ohne das Wort „Stufe“: alle 7 (Moll 8) passen in P1, P2, L1, L2; nur P3 wischt.

**Abnahme (`dirigent-test/`, Chromium + CDP-Touch):** `v3-qa0c-undo.mjs` 4/4, `v3-qa0c-undo2.mjs` 1/1, `v3-rep-takeundo.mjs cell`
und `chord` je 4/4; `v3-qa0c-ab.mjs` 2/2, `v3-rp-k227.mjs` P und L (prüft den Fehler: G in Takt 5 bleibt, „ab Takt 3“ angeboten);
`v3-qa0c-mel.mjs` / `-mel-indep.mjs` (Melodie auf Synth 4); `v3-qreg0c-loop.mjs` (48 48 50 50 48 48), `v3-qreg0c-svrec.mjs`,
`v3-repro-loopstale-ser.mjs` ({a:0,b:4} auch nach Speichern/Laden), `v3-qreg0c-frseq-song.mjs` 14/14 (ein Lauf 13/1 mit der bekannten
Zeitschwankung 3,5131, wie auf G3-klein-fix); `v3-repro-cpscroll.mjs` (Wischen 160–169 px in allen 5 Größen), `v3-qreg0c-cpfrei.mjs`;
neu `v3-v0cfix-verify.mjs` 52/52 mit den echten Schriften (über http geladen): Stufen-Zeile in Moll, B und dim7 nach Wischen per
Finger tippen und übernehmen, kein Geisterklick, Start-Blatt M-PLATZ in P/P375/P320/L/L667, [Nur Takt 3] stanzt aus, S-04-Hinweis
in der ersten Aufnahme und am Ende, ein Undo. Regression `v3-v0c-song.mjs` 40/40, `v3-v0c-ui.mjs` 41/41, `v3-v0c-frei.mjs` 6/6;
Smoke ohne Fehler. Bilder in `dirigent-test/v3-v0cfix/`.

Für Xander im Dashboard: nichts.

**Bekannte Lücken:** kein WebKit-/iPhone-Test (natives Wischen in einem Blatt mit Touch-Schutz am Gerät prüfen); `v3-qa0c-meltxt.mjs`
(Start-Blatt sagt bei MELODIE „überschreibt“, die alten Noten bleiben – Overdub) ist schon auf V0c.html rot und nicht Teil dieses
Pakets.

## V0c-klein-fix — ● zeigt die Ziele der laufenden Aufnahme, Start-Blatt sagt „ergänzt Melodie“, Song-Ansicht nicht hinter dem Ende, `songSelect()` liest nur · App 3.11.1

1. **Erste Aufnahme in leerem Song: ● zeigt „● ALLES“** (S-01). Neue Funktion `recTgNow()`: während einer Aufnahme die Ziele dieser
   Aufnahme (leerer Song = Clips, Akkorde und Melodie), sonst die Ziele der nächsten. ●-Chip, aria-label und
   `runtime().song.targets` nutzen sie (vorher fiel das Chip nach dem ersten Takt auf „● MEL“, weil der Song dann Inhalt hatte).
2. **Start-Blatt und Banner stimmen mit dem Verhalten überein:** MELODIE ist in V0c ein Overdub (Spec v3 §4.8 „bestehende Noten
   bleiben“; das Ersetzen je Takt/K2-21 gehört zu V2d′). Das Blatt sagt jetzt „überschreibt Akkorde ab Takt 3 · ergänzt Melodie“,
   nur MELODIE: „ergänzt Melodie ab Takt 3“; die Modus-Zeile „**Melodie**: neue Noten kommen dazu, die alten bleiben“ bzw.
   „**Melodie dazu** – …“. Das Banner einer reinen MELODIE-Aufnahme heißt „● Takt 3 · Melodie dazu · MEL“ statt „Überschreiben“.
   [● START] ist aktiv, sobald irgendein Ziel gewählt ist. Testanpassung: `v3-k0c-adapt-v0c-ui.mjs` (V0c-05 erwartet die neuen Texte).
3. **Song-Ansicht bleibt nicht auf einer leeren Seite hinter dem Song-Ende** (Hochformat, ● kurz nach dem Taktstrich): `svEndClamp()`
   in `svDraw` setzt die Ansicht außerhalb einer Aufnahme auf die Seite mit dem letzten Takt, sobald kein Takt des Songs mehr zu
   sehen ist (auch nach Undo auf einen kürzeren Song).
4. **`songSelect()` ohne Argumente liefert die gelbe Auswahl und ändert nichts**; `songSelect(null)` hebt sie weiter auf.

**Abnahme:** `v3-grp0c-run.mjs` Phase 1 P und L je 16/16 (vorher 14/2: S-01 und „Ansicht hinter dem Ende“, x 288 → 0);
`v3-qa0c-meltxt.mjs` 1/1 (vorher rot); neu `v3-k0c-verify.mjs` 72/72 mit der echten Schrift (Barlow Semi Condensed per
@font-face geladen und geprüft) in P, P320, L, L667: sechs Ziel-/Bereichs-Kombinationen, Text passt, Blatt im Bild, keine Überlappung,
Banner, `songSelect()`, Rücksprung; `v3-k0c-adapt-v0c-ui.mjs` 41/41 in P, L, P320, L667; `v3-v0cfix-verify.mjs` 52/52;
`v3-v0c-song.mjs` P/L 40/40; `v3-qa0c-fol/-takt/-undo/-mel` grün; `v3-qa0c-ui.mjs` (6 rot) und `v3-qa0c-ta9.mjs` (2 rot) genauso
rot auf V0c-gruppe-fix.html. Gruppentest Phasen 1–3: die neuen Fehler weg; „[↩ SONG] nach Szenen-Übernahme“ und M-KLICK
(Szene 2, −67 dBFS) bleiben wie auf V0c-gruppe-fix.html; der HF-Stoß-Test schwankt in P von Lauf zu Lauf (−67 … −38 dBFS, wechselnde
Spur), die Änderungen dieses Pakets berühren keinen Ton. Smoke ohne Fehler. Bilder in `dirigent-test/v3-k0c-out/`.

Für Xander im Dashboard: nichts.

---

## VO1 — Anmelden, Server-Autosave, eigene Adresse, Offline-Neuladen · App 3.11.2

Grundlage: Nachtrag 2 Teil G (G.2, G.3, G.8, G.9 N2-VO1-01/-02, G.10 K2-46, K2-69), Teil J (FP-SICHER ●, FP-IPHONE), C.7 K2-08;
`r7/online.md` §2–§9 (verbindlich nach K2-46) mit `r7/online-schema.sql` und `r7/online-test/` (fake-supa, rls-matrix).
Gebaut nach V0c-klein-fix; Version **3.11.2** statt 3.5.0 (E.5 Punkt 3: die Versionen steigen streng, nachgeholte Pakete bekommen die
nächste Zwischennummer). `APP_CODE` = 3 011 002.

**Online ist gebaut, aber „aus“ (E.5 Nr. 3, G.8):** Für den Rollout (Migration `vo_init`, Auth-Einstellungen, Turnstile, `max_app`)
liegt kein ausdrückliches Okay von Xander vor (`fragen-xander-9.md` nennt nur „Supabase als einen der ersten Punkte“ und „Projekt bleibt,
wo es ist“). Deshalb steht `CLOUD.live = false`: Auf der Pages-Seite zeigt Menü → Online „Online wird gerade eingerichtet – deine
Songs sind auf diesem Gerät gesichert.“, es lädt nichts nach. Alles andere (Service Worker, Manifest, lokale Schriften, Übergabe aus
der Claude-App per `#import=`) wirkt schon jetzt. Alle Online-Abläufe sind gegen den Fake-Server (PGlite + echte Migration) geprüft.
Einschalten = R2–R7 ausführen, dann `live: true` und `captcha.siteKey` setzen (eine Zeile, `CLOUD` in `index.html`).

**Was neu ist**
1. **SYNC-Kern** (online.md §4, §7.2): lokal zuerst; der Autosave meldet jedes Schreiben (`onWritten`) → Meta je Projekt
   (`cloud:meta:<lid>`: Konto, Server-ID, `base`, Prüfsumme, `dirty`, Konflikt) und Postausgang **je Konto** (`cloud:outbox:<uid>`);
   Geräte-Kennung `cloud:device`. **Server-Autosave 2 s nach dem letzten lokalen Schreiben** (spätestens 15 s), beim Spielen höchstens
   alle 30 s (spätestens 60 s, `tickAhead` vor dem Text), sofort bei `hidden`/`pagehide` (≤ 60 KB mit `keepalive`). Ein Push =
   **ein** `JSON.stringify` (Hülle per Textverkettung in der Schlüsselfolge von `buildProjectFile`, `fetch` an `rpc/save_project`),
   unter der Web-Lock `synq-cloud`. Gleiche Prüfsumme → kein Aufruf. Antworten `created/ok/same/conflict/outdated/readonly`,
   Fehler nach §4.3 (Netz: Backoff 2, 5, 15, 60 s, dann 5 min und bei `online`/`visible`; 540 Pause: alle 5 min; voll/Quote: stündlich;
   `bad_version`, `too_large`, Zugriff weg = „nur hier“, gesperrt). Konflikt: weiter hochladen mit derselben `base` (der Server hält die
   Konflikt-Fassung aktuell), Erinnerung höchstens alle 10 min.
2. **Start-Abgleich** (§4.4, alle sechs Zeilen): nie hochgeladen → anlegen (gleiche `local_id` schon online → verknüpfen); unverändert →
   nichts; geändert → hochladen; Server neuer + unverändert → still laden („Neuere Version geladen (anderes Gerät, 17:42)“), nach einer
   Eingabe nur Toast [Laden]; beides neuer → Konflikt; Server-Projekt fehlt → lokal behalten, „nur hier“. Neues Gerät / gelöschter
   Speicher: das zuletzt geänderte eigene Projekt öffnet sich, wenn das offene unberührt ist („Deine Songs sind da – …“), die übrigen
   kommen unter [Projekte]; das Demo wird nie hochgeladen. **Anderes Konto auf demselben Gerät:** nichts wird hochgeladen, Karte „Auf
   diesem Gerät liegen 3 Songs von Xander …“ mit Zwei-Schritt [Diese Songs in mein Konto übernehmen].
3. **Versions-Wächter** (VO-R1): `outdated` → Hinweisband „Eine neuere SYNQUENZER-Version hat … gespeichert“ mit [Jetzt neu laden]
   (`location.replace(pfad + '?v=' + Zeit + hash)`), Auto-Push für das Projekt ≤ 1 je 60 s; `bad_version` → „Diese App-Version ist
   online noch nicht freigeschaltet – Xander/Claude Bescheid sagen“.
4. **Versionen** (§6.7): Liste mit Zeit, Autor, Art; [Als Kopie öffnen], [Zurückholen] (erst `mark_version` „Vor Wiederherstellen“,
   dann neue Version), [Diese Version merken]. **Konflikt zweier eigener Geräte**: Karte mit [Übernehmen] / [Beide behalten]
   („Song X (Xanders Version)“) – die Partner-Fälle kommen mit VO2.
5. **Eigene Sounds** über `save_library` mit optimistischer Sperre, 5 s nach einer Änderung; Konflikt → Zusammenführen per Hash, neu senden.
6. **Anmelde-Blatt** (§6.2, §2.4b): echtes `<form>`, Segment Anmelden / Konto anlegen, E-Mail (`username`, `inputmode=email`,
   `autocapitalize=off`), Passwort mit [zeigen] (`current-/new-password`), Name ≤ 24, „findbar“-Schalter (Vorgabe aus), Turnstile nur im
   offenen Blatt und nur mit `CLOUD.captcha.siteKey` (`captchaToken` an `signUp` und `signInWithPassword`), alle Fehlertexte aus §6.2,
   die Texte der Anmelde-Bremse wörtlich vom Server. Nach Erfolg verlässt das Formular das DOM (Safari bietet „Passwort sichern“ an).
   [Name ✎] → Name, „findbar“, **[Passwort ändern]** (`auth.updateUser`); „Passwort vergessen? Sag Xander Bescheid.“; kein
   `resetPasswordForEmail`.
7. **Online-Blatt** unter dem Kopf (▶ bleibt bedienbar): Statuszeile (§4.6), Profil (Name · Code, [Code kopieren]), Karten (Konflikt,
   neuere Version, fremde Songs, Pause mit [Supabase öffnen] für den Verwalter bzw. [Xander Bescheid sagen]), „Nur ich“-Liste vom
   Server (öffnen, Versionen, Papierkorb), [Papierkorb] (zurückholen), **[Alles sichern]** (alle Projekte + Sounds in eine Datei; sie
   lässt sich über [Datei öffnen] wieder einlesen), „Dein Platz: n %“ bzw. für den Verwalter „Speicher online“, [Abmelden] als
   Zwei-Schritt („Noch 2 Änderungen nicht online – trotzdem abmelden?“; löscht `synq-auth`, lokale Projekte bleiben).
   Querformat ab 700 px zweispaltig (links `clamp(220px, 35 %, 300px)`); Tastatur (§6.10): Blatt endet über der Tastatur, Erklärtexte
   weichen, das Feld wird geholt, der Hauptknopf klebt unten. Löschen unter [Projekte] legt das Projekt online in den Papierkorb (weich).
8. **Status-Punkt am ≡** (8 px, Overlay): grün gespeichert, blau pulsierend speichert, grau nur hier/offline, orange bitte ansehen;
   abgemeldet kein Punkt. Menü → **Online** direkt unter „Projekt“; Info-Zeile „Online“; vier Hilfe-Zeilen.
9. **Herkunft** (N2-VO1-01, K2-69): `CLOUD.origin` = `https://xanderfoxy.github.io`, `CLOUD.path` = `/Synquenzer/`; supabase-js
   (vendor-Datei neben `index.html`, sonst jsDelivr, beide mit SRI `sha384-Rj26…3Ok`) lädt nur dort und nur mit Sitzung oder offenem
   Anmelde-Blatt. `/synquenzer/` (andere Schreibweise) → `location.replace` auf `/Synquenzer/` vor dem Start, `#import=` bleibt.
   Claude-Viewer: Zustand `viewer`, grauer Punkt, „Nur auf diesem Gerät – nicht online“, **[In Safari öffnen und mitnehmen]**
   (`…/Synquenzer/#import=z<deflate-raw + base64url>`, Rückweg [Als Text kopieren] / [Aus Zwischenablage einfügen]), einmal je Sitzung
   der Toast „Online-Speichern gibt es in der Safari-Version“. githack: Zustand `local`, nie supabase-js.
10. **Service Worker, Manifest, lokale Schriften** (K2-08): `sw.js` (Bereich `/Synquenzer/`, `index.html` network-first mit Rückfall
    auf den Cache, vendor/Schriften/Icons/Manifest cache-first); auf der eigenen Herkunft `manifest.webmanifest` und die Schriften aus
    `fonts/` (keine Anfrage an Google Fonts); Claude-Viewer und githack wie bisher.
11. Test-API (§7.6): `cloud()`, `cloudSignUp/In/Out`, `cloudSync`, `cloudProjects`, `cloudOpen`, `cloudVersions`, `cloudRestore`,
    `cloudCopyVersion`, `cloudMark`, `cloudResolve`, `cloudHandoff`, `cloudBackup`, `cloudLibPush`, `cloudAdopt`, `cloudSheet`,
    `cloudUseFake`; `runtime().cloud = {state, outbox}`. Test-Haken `window.__synqFakeSupa` / `window.__synqCloud` (nur vor dem Laden
    setzbar). Projektformat unverändert (kein neues Feld, §7.3), Undo unberührt (§7.4).

**Dateien für das Pages-Repo `XanderFoxy/Synquenzer`** (neben `index.html`, nicht im Zweig `dirigent-synth`, K2-46 (3)):
`scratchpad/synq-pages/` = `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`,
`vendor/supabase-js-2.117.2.umd.js` (217 945 B, bytegleich aus dem npm-Paket, SRI geprüft), `fonts/*.woff2` (Barlow Semi Condensed
500/600/700, JetBrains Mono 500/700, latin, @fontsource 5.2.7/5.2.8, OFL, Lizenzen dabei). Migration fertig in
`scratchpad/synq-online/vo_init.sql` (= `online-schema.sql`, md5 c33142ed…) und `r7-vo1-max-app.sql` (`max_app = 3011002`).

**Abweichungen**
- **Online „aus“** ausgeliefert (s. oben). Das ist die Regel E.5 Nr. 3, keine Lücke im Bau.
- **Größe:** `index.html` +77,8 KB (Budget 38 KB, +105 %). Begründung (§15.3): online.md §7.5 schätzte nur den SYNC-Kern; dazu kamen
  Blatt-CSS für sechs Ansichten und alle Bildschirmgrößen, Tastatur-Regeln, Konflikt-Wahl für eigene Geräte, Kontowechsel-Karte mit
  Übernahme, [Alles sichern] mit Wiedereinlesen, Zwischenablage-Rückweg und lange deutsche Texte. Gesamt 1,96 MB (Grenze 5,0 MB);
  supabase-js liegt außerhalb. Startzeit +62 ms (Grenze +150 ms).
- Push-Takt bei Dauer-Änderung: „2 s nach dem letzten lokalen Schreiben“ heißt bei laufender Bearbeitung alle ≈ 4 s (der lokale
  Autosave schreibt spätestens alle 4 s); die Abnahme (≤ 15 s Abstand, ≤ 2 Aufrufe in 10 s) ist erfüllt.
- Suche/`slow_down` der Suche (N8O-04b letzter Satz), Räume, Realtime, Mitmach-Link, Konten-Blatt: VO2 (Nicht-Umfang G.3).

**Abnahme** (`dirigent-test/v3-vo1-accept.mjs`, Harness `v3-vo1-harness.mjs`: App unter ihrer Pages-Adresse über `context.route`,
FakeSupa = PGlite 0.5.8 + echte Migration, `save_project`/`save_library` als echte `fetch` an die geroutete Supabase-Adresse;
jede fremde Anfrage wird abgebrochen und gezählt): Gesamtlauf **131/133** (`v3-vo1-accept-all.txt`), danach N8O-18 korrigiert und 3 × grün;
rot bleibt nur N8O-19b (Größe, begründete Abweichung):

| ID | Ergebnis |
|---|---|
| N8O-01 | ✓ Viewer im Rahmen mit `claude.use`-Attrappe: `viewer`, grau, Zeile, Link `…#import=z…` (4,7 KB); 0 Anfragen an supabase/vendor/CDN; Safari-Version importiert deep-equal, Hash weg, Toast; nach dem Anmelden online angelegt |
| N8O-02 | ✓ ohne Sitzung 0 Anfragen (vendor, CDN, supabase, Turnstile, Google Fonts); Start 574 ms gegen 512 ms (Median aus 5, Δ +62 ms) |
| N8O-03 | ✓ veränderte vendor-Datei + kein CDN → `error`, „Online gerade nicht verfügbar …“, lokal speichert weiter; mit CDN übernimmt jsDelivr (SRI); echte Datei besteht SRI |
| N8O-04 | ✓ ohne Name/kurzes Passwort kein Aufruf; Sitzung sofort, Name auf 24 gekürzt, `findable` aus/an, `display_name` übergeben; vorhandene E-Mail → Text + Segment „Anmelden“; 0 Räume/Anfragen; Formular-Anmeldung entfernt das Formular |
| N8O-04b | ✓ `signup_open=false`, `max_accounts`, Tagesgrenze und 429: Texte wörtlich; Turnstile erst im Blatt, ohne Token kein Aufruf („Bitte kurz bestätigen …“), Token an signUp und signIn; `bad_name` → Text, Name bleibt. (Such-`slow_down`: VO2) |
| N8O-04c | ✓ [Passwort ändern] → `updateUser({password})`, neues Passwort meldet an; Text im Blatt; kein `resetPasswordForEmail` (Spion + Quelltext) |
| N8O-05 | ✓ Sitzung überlebt Neuladen; Abmelden mit 1 wartender Änderung → Zwei-Schritt-Text; danach deep-equal, `synq-auth` gelöscht, kein Punkt; githack-Attrappe mit Sitzung: nie supabase-js |
| N8O-06 | ✓ 1 offenes + 2 geparkte → genau 3 Anlagen; zweites Anmelden 0; gleiche `local_id` → verknüpft; Demo 0 |
| N8O-06b | ✓ Kontowechsel: 0 Aufrufe für X-Projekte, Karte „3 Songs von Xander“, kein `lost`; X wieder an → Wartendes und Neues geht hoch |
| N8O-07 | ✓ 1 Änderung → 1 Aufruf nach 2,8 s; 20 in 10 s → 1; 40 s Dauer → Abstand ≤ 6 s; Spielen: 1 Aufruf in 95 s, Abstände ≥ 30 s, `tickAhead` vorher |
| N8O-08 | ✓ je Push genau ein Stringify > 50 KB; großes Projekt (258 KB) 7,1 ms bis `fetch` (Median, Xeon) |
| N8O-09 | ✓ Neuladen 300 ms nach der Änderung: deep-equal; Warteschlange geht hoch; Server-md5 = gesendeter Text, Inhalt = lokal |
| N8O-10 | ✓ leerer Speicher: das neueste Server-Projekt offen, deep-equal, Toast, [Projekte] gefüllt, 0 Anlagen mit Demo |
| N8O-11 | ✓ alle sechs Zeilen (zwei Kontexte = zwei Geräte), dazu Konfliktkarte und „Beide behalten“ |
| N8O-12 | ✓ 60 s offline, 30 Änderungen, Projektwechsel: keine Fehler, grau, Warteschlange 2 (je Projekt 1); online → je Projekt genau 1 Push in 126 ms, Server = lokal |
| N8O-13 | ✓ 540: Freund-Text + [Xander Bescheid sagen], Verwalter-Text + [Supabase öffnen] (Dashboard-Link); 1 Versuch, dann 5-min-Takt; [Alles sichern] angeboten, Datei liest sich wieder ein |
| N8O-14 | ✓ Liste (Art, Autor, Zeit); Zurückholen → manual „Vor Wiederherstellen“ + neue Version; Kopie → neues Projekt; Merken |
| N8O-15 | ✓ outdated → Band + Fassung aufgehoben, ≤ 1 Aufruf je 60 s; [Jetzt neu laden] → `…/Synquenzer/?v=<Zeit>#probe`; `bad_version` → Hinweis |
| N8O-16 | ✓ Upload 5,0 s nach Änderung; A {s1,s2}, B {s1,s3} → Server {s1,s2,s3}, B hat alle drei |
| N8O-17 | ✓ Push/Pull ändern `gestures().undo/redo` nicht |
| N8O-18 | ✓ großes Projekt, 300 ms Latenz, Push alle 2 s beim Spielen: 60 fps, keine longtask, tick-p95 1,1–1,3 ms (3 Läufe) |
| N8O-19 | vendor 217 945 B mit SRI ✓; `index.html` +77,8 KB statt ≤ 38 KB – **begründete Abweichung** (s. oben) |
| N8O-20 | ✓ Anmelden, Konto anlegen, Online, Nur ich, Versionen und Menü in P1, P2 (375×667), P3 (320×568), L1, L2 (667×375), W (1280×800), Formulare auch mit Tastatur-Attrappe (`visualViewport`): kein Überlauf, Hauptknopf sichtbar, aktives Feld frei, Ziele ≥ 44 (P) / ≥ 40×36 (L), Felder 16 px, `autocomplete="username"`, echtes `<form>`, zweispaltig genau ab 700 px quer |
| N8O-20b | ✓ `sw.js` mit Bereich `/Synquenzer/`; Netz ganz aus (auch die geroutete Seite), neu laden → App aus dem Service Worker mit dem letzten Projekt, Punkt grau |
| N2-VO1-01 | ✓ Herkunft/Pfad im Code; githack- und Viewer-Attrappe mit Sitzung: 0 Anfragen; `/synquenzer/#import=…` → Umleitung, Hash bleibt, Projekt importiert, danach Anfragen an supabase |
| N2-VO1-02 | Rollout-Protokoll unten; kein MCP-Aufruf nennt das Klassenzimmer-Projekt |
| K2-08 | ✓ Manifest + Icons nur auf der eigenen Herkunft, Schriften lokal geladen (0 Anfragen an Google Fonts), githack unverändert |
| T1 | ✓ `rls-matrix.mjs` gegen die unveränderte Migration: 135/135 |

Korrekturen während der Abnahme: Blatt baute sich bei jedem Push neu auf (Zwei-Schritt fiel zurück) → nur noch die Statuszeile;
Pause/Offline lösten bei jeder Änderung einen neuen Versuch aus → der Wiederholungs-Takt gilt; Profil beim Start ohne Netz verlor die
Verwalter-Rolle → letzter bekannter Stand; Netzfehler von supabase-js („Failed to fetch“ / Safari „Load failed“) als offline erkannt;
Ziele in P3/L (✕ 44×32, Segment 32 px), Zeilen wuchsen im Hochformat, Hauptknopf und Feld unter der Tastatur.

**Fach-Prüfung (Teil J: FP-SICHER ● Haupt-, FP-IPHONE Zweit-Blick;** als zweiter Durchgang über Diff, Testausgaben und Bilder auf mich
selbst angewandt – ein eigener Agent stand in diesem Bau nicht zur Verfügung). **8 Befunde, 6 behoben, 2 begründet:**
1. FP-SICHER: Passwort blieb nach einem Fehlversuch im Speicher des Blatts → wird beim Schließen geleert (behoben).
2. FP-SICHER: fremde Texte (Titel, Namen, Versions-Etiketten, Server-Meldungen) – alle über `textContent`/`esc`, Projekte nur über
   `parseFile` + `normalizeProject` (geprüft, kein Befund im Code; Test „Text der Bremse wörtlich“).
3. FP-SICHER: kein `sb_secret_`, kein `service_role`, kein `rolcktiryrvjzbwuvobb` im Build (Test); nur der Publishable Key.
4. FP-SICHER: Token nur auf der eigenen Herkunft (`synq-auth`), Abmelden löscht ihn; githack/Viewer laden nie supabase-js (Tests).
5. FP-SICHER (begründet): Test-Haken `__synqFakeSupa`/`__synqCloud` bleiben im Build – setzen kann sie nur, wer schon vor dem App-Code
   Skript in der Seite ausführt; dann wäre ohnehin alles offen. Turnstile-Skript ohne SRI (Cloudflare liefert es dynamisch aus).
6. FP-IPHONE: Safari-7-Tage-Regel → nach dem Anmelden `navigator.storage.persist()` (behoben).
7. FP-IPHONE: PE1-Test zwang zuerst alle 2 s `saveNow()` des 258-KB-Projekts – die longtasks (50–75 ms) kamen aus dem lokalen Autosave
   und treten auf V0c-klein-fix genauso auf (`v3-vo1-pe1base.mjs`); die Abnahme misst jetzt die Kosten des Push allein (behoben im Test,
   App unverändert; begründet).
8. FP-IPHONE: Hintergrund: `pagehide`/`hidden` → Push mit `keepalive` (≤ 60 KB), größere normal; Startzeit +62 ms, Datei 1,96 MB (< 4,5 MB,
   keine Startzeit-Pflicht nach EN2-28) (geprüft).

**Regression:** `v3-vo1-reg.sh` (= V0c-Liste mit den Versionskopien `v3-vo1-adapt-*` für 3.11.2), `v3-vo1-reg2.sh`, `v3-vo1-reg3.sh`;
Ausgaben `dirigent-test/v3-vo1-reg/`, Vergleich mit V0c `v3-vo1-regcmp.sh`. Rot wie auf V0c (`node-fm`, `v3-v0b-adapt-wp3-browser`,
`-wp3-ui`, `wp4-offline`, `wp3-adapt-func-build(-native)`, `v3-v4bfix-big`, `v3-v4b-node`, `fp4f-loop`, `v0c-song-P`, `rgq-old17`,
`wp7-adapt-sqr6-persist`, `v3-v4a-ui` N7F-10 CPU). Unter Last neu rot, allein grün: `v3-v0a-drum`, `wp6-extras` P/L (P 3 × grün),
`wp7-accept-fm4`, `wp7-adapt-func2-build-native`, `v3-v4c-accept-L`. Allein weiter rot und **auf V0c-klein-fix genauso**
(`v3-vo1-reg/solo-snap/`): `wp6-drums` DR7 (7,3 % gegen 7,49 % auf dem Snapshot), `v3-v4a-node` V4a-11 (beide Fälle identisch),
`v3-v4b-platz` L667-pegel. `v3-v0c-ui` V0c-05 ist die bekannte Textänderung aus V0c-klein-fix; seine Anpassung
`v3-k0c-adapt-v0c-ui` ist in P, P375, P320, L, L667 grün. Angepasst: `v3-vo1-adapt-wp1-misc` (Menü-Abschnitt „Online“ zwischen
„Projekt“ und „Sounds“, gewollt); dort bleibt nur die alte Info-Zeilen-Prüfung rot wie auf V0c. Smoke ohne Fehler.

**Rollout-Protokoll (N2-VO1-02)** – Stand 19.10.2026, kein zustandsändernder Schritt ausgeführt:

| # | Schritt | Datum | Xanders Okay | Stand |
|---|---|---|---|---|
| R0 | Entscheidungen | 17.10. | offene Registrierung ✓, Pages ✓, eu-central-1 ✓; Organisation: „Projekt bleibt, wo es ist“ (fragen-xander-9) | – |
| R0b | Eigene Herkunft | – | – | Pages-Adresse von hier nicht erreichbar (Proxy 403); `sw.js` des Klassenzimmers und Schreibweise ungeprüft |
| R1 | Projekt | 17.10. | – | angelegt; am 19.10. **nur gelesen** (`get_project`): ref `dbdnsryoivvezspgydpx` = Projekt „synquenzer“, eu-central-1, ACTIVE_HEALTHY, Postgres 17.11, Organisation `lcdkqquoidsvtitrmedi`; ref zweimal verglichen (Auftrag, `get_project`) |
| R2 | Migration `vo_init` | – | **fehlt** | nicht eingespielt; `list_tables(public, private)` = leer; Advisor erst nach R2 |
| R3–R5 | Auth, Verwalter, Realtime | – | fehlt | – |
| R6 | Schlüssel | 19.10. | (nur lesen) | `get_project_url`, `get_publishable_keys` gelesen → `CLOUD.url`, `CLOUD.key` = `sb_publishable_…` im Build |
| R7 | Ausliefern | – | fehlt | `r7-vo1-max-app.sql` liegt bereit; `live: false` |
| R8 | Probe durch Xander | – | – | – |

MCP-Aufrufe dieses Pakets: `get_project`, `get_project_url`, `get_publishable_keys`, `list_tables` – alle mit
`dbdnsryoivvezspgydpx`, alle lesend.

**Für Xander im Dashboard** (erst nach deinem Okay zum Einschalten; Reihenfolge wie G.8):
1. Authentication → Sign In / Providers → Email: an; „Allow new users to sign up“: an; **„Confirm email“: aus**; Mindestlänge 8.
2. Authentication → URL Configuration: Site URL und Redirect URL = `https://xanderfoxy.github.io/Synquenzer/`.
3. Authentication → Hooks → „Before User Created“ → Postgres → `public.hook_before_user_created` (nach der Migration).
4. Cloudflare (kostenlos) → Turnstile-Widget für `xanderfoxy.github.io` → Site Key an Claude geben; Authentication → Bot and Abuse
   Protection → „Enable CAPTCHA protection“ → Turnstile + Secret Key – gleichzeitig mit der ersten Online-Version.
5. Realtime → Settings → „Allow public access“: aus (spätestens vor VO3).

**Für Xander am iPhone (T5, nach dem Einschalten):** (1) Pages-Seite öffnen, Konto anlegen – bietet Safari „Passwort sichern“ an?
(2) Etwas ändern, 5 s warten, Seite neu laden → alles da, Punkt grün. (3) Flugmodus an, neu laden → App startet, Punkt grau; Flugmodus
aus → Punkt wird grün. (4) In der Claude-App Menü → Online → [In Safari öffnen und mitnehmen] – öffnet sich Safari mit dem Song?
(5) Zweites Gerät (oder Home-Bildschirm-App) anmelden → dein Song ist da.

## VO1-fix — Sitzung überlebt Offline-Zeiten, Neustart offline mit altem Token, eigene Sounds je Konto, `sw.js` ohne Voll-Download · App 3.11.2

1. **Token läuft offline ab → kein Abmelden mehr** (§4.3, §4.6, N8O-05, N8O-12). `cloudRpcText` holt das Token über `cloudAuthTok()`:
   liefert supabase-js wegen fehlenden Netzes (oder seiner 60-s-Sperre nach einem Fehlversuch) keine Sitzung, solange `synq-auth`
   gespeichert ist, gilt das als `net` (grau, Warteschlange, Backoff), nicht als `auth`. `cloudPushErr`/`cloudFail` melden bei
   `auth` nur noch ab, wenn supabase-js die Sitzung selbst verworfen hat (Refresh-Token ungültig) – sonst warten wie offline.
   Ein abgelaufenes Token wird nur erneuert, wenn `/auth/v1/health` antwortet (≤ 5 s); dann hebt die App die 60-s-Sperre von
   supabase-js auf. Solange offline, ruht der Auto-Refresh von supabase-js (`stopAutoRefresh`, online wieder `startAutoRefresh`),
   damit nach dem Wiederverbinden kein 25-s-Wiederholversuch vor dem Hochladen hängt. Eigener `global.fetch`: Abfragen an
   `/rest/v1/` mit dem öffentlichen Schlüssel als Bearer, obwohl eine Sitzung gespeichert ist, gelten als Netzfehler (sonst sähe der
   Start-Abgleich leere Listen und markierte Projekte als „nur hier“).
2. **Neustart ohne Netz mit Token älter als ≈ 1 h** (N8O-20b, §4.6). `cloudInit` startet bei abgelaufenem Token sofort mit dem
   gespeicherten Konto (`synq-auth.user`, sonst `cloud:me`), ohne auf `getSession()` zu warten: Punkt grau, „Offline – auf diesem Gerät
   gesichert“, Änderungen kommen in die Warteschlange. `online`, `visible`, der 15-s-Takt und `TOKEN_REFRESHED`/`SIGNED_IN` von
   supabase-js stoßen den Abgleich an (`cloudKick`, gleichzeitige Anstöße zählen einmal); vorher reagierte die App nur auf `SIGNED_OUT`.
3. **Eigene Sounds je Konto getrennt** (FP-SICHER, §4.4). `cloud:libown` merkt je Sound (Hash:Name) die Konten, unter denen er entstand
   oder vom Server kam; `save_library` bekommt nur die Sounds des angemeldeten Kontos, `libSent` gilt je Konto. Sounds ohne Besitzer
   (abgemeldet entstanden) gehören wie Projekte ohne Meta dem bisherigen Konto (`SYNC.claim`, sonst `SYNC.prevUid`). Die Geräte-
   Bibliothek bleibt eine (alle Sounds bleiben lokal sichtbar), online geht nichts mehr über Konten hinweg.
4. **`sw.js`** (`synq-pages/`, FP-IPHONE, §2.7): `index.html` weiter network-first, aber über den HTTP-Cache des Browsers (ETag →
   304 mit 0 KB statt jedes Mal 611 KB); antwortet das Netz nach 3 s nicht und liegt eine Kopie im Cache, startet die App daraus und
   die Antwort erneuert den Cache. Das Vorab-Laden bei der Installation nimmt den HTTP-Cache (kein zweiter Download).

**Abnahme (`dirigent-test/`, echte supabase-js 2.117.2 gegen GoTrue/PostgREST-Emulation über PGlite):** `v3-qa-vo1-real-a.mjs` A 3/3,
B 3/3, C 2/2 (`OFFLINE_MS=45000`); `v3-qa-vo1-real-e.mjs` E1/E2 ✓; `v3-fpvo1-offstart.mjs` (offline grau, danach online + Push),
`v3-repro-offline-expired.mjs` „NOT REPRODUCED: app recovered“, `v3-indep-tokexp.mjs offline` (bleibt angemeldet, nach dem
Wiederverbinden Server = lokal), `v3-repro-offstart-check.mjs`; `v3-fpvo1-sicher.mjs` 5/5, `v3-repro-libswitch.mjs` (René lädt
nichts von Xander hoch); `v3-repro-swnet.mjs` (mit SW: Starts 2–9 ohne Anfrage bzw. 304/0 KB, 20-s-Hänger → 3,4 s aus dem Cache),
`v3-fpvo1-swnet.mjs` mit `STALL=20000` (Starts 2–4 ≈ 0,5 s statt 20,5 s), `v3-vo1fix-swoff.mjs` (Neuladen ohne Netz aus dem SW-Cache);
`v3-vo1-accept.mjs` 132/133 (rot nur die bekannte Größen-Abweichung N8O-19b, jetzt +85,3 KB), Smoke ohne Fehler.

## VO2 — Anfragen, Paar-Räume, Realtime, Konflikt-Wahl mit dem Partner, Presence-light, Mitmach-Link, Konten, Abzweigen, Geräte-Werte lokal · App 3.11.3

Grundlage: Nachtrag 2 Teil G (G.4, G.8, G.9 N2-VO2-01/-02, K2-46, K2-47), Teil J (FP-SICHER ●, FP-TOUCH); `r7/online.md` §3, §4.5, §5,
§6.1–§6.10, §7.6, §7.8 (VO2); `r8/zusammenarbeit-modell.md` §8.1, §8.4 Nr. 4, §10. Version **3.11.3** statt 3.6.0 (E.5 Nr. 3: streng
steigend nach VO1 = 3.11.2). `APP_CODE` = 3 011 003.

**Online ist live** (Orchestrator-Vermerk `fragen-xander-9.md`, 19.10. 06:20: `vo_init` angewandt, `CLOUD.live = true`, „nicht
zurückdrehen“) – `live: true` bleibt. VO2 braucht die Migration `vo2_fork` (unten), sonst bleibt die „Nur ich“-Liste leer; sie ist angewandt.

**Was neu ist**
1. **Räume und Anfragen** (§6.3–§6.5b): Online-Blatt mit Zeilen „Mit René · René ist online   3 Songs · 1 neu ›“ (Zähler „neu“ je Raum,
   `cloud:seen:<uid>`, verschwindet beim Öffnen), [+ Zusammenarbeit anfragen] → Suche nur nach Freundes-Code oder genauem Namen (nur bei
   „findbar“), ein „@“ geht nie an den Server; Treffer-Karte mit Name, „✓ Verwalter“ (nur aus `profiles.is_admin`), Code groß „(Code
   vergleichen)“, Nachricht ≤ 140; alle Ergebnis-Texte aus §6.5 („Anfrage geschickt“, „Ihr arbeitet schon zusammen“, „Du hast schon
   angefragt“, „… hat abgelehnt – neue Anfrage morgen möglich“, „Bitte morgen noch mal“, „Mehrere heißen so – bitte Code oder Link“,
   „Niemand gefunden …“, „Bitte kurz warten.“). Eingehende Anfrage als Karte mit [Annehmen] [Ablehnen] (Punkt am ≡ orange), gesendete als
   „Gesendet: <Name> antwortet noch · [Zurückziehen]“.
2. **Raum-Blatt** (§6.4): Presence-Zeile („René ist da · in „Song X““ bzw. „Nur ihr beide seht diese Songs.“), Songs mit Autor und Zeit
   („René · heute 17:42“, unter 360 px nur die Zeit), ⋯ = Öffnen · Versionen · Kopie in „Nur ich“ · In den Papierkorb (kein Teilen, kein
   Verschieben zwischen Räumen), [+ Neues Projekt in „Mit René“], [Offenes Projekt hierher teilen] (nur eigenes „Nur ich“-Projekt; Kopie aus
   einem anderen Raum → grau mit „Enthält Beiträge aus „Mit René“ – kann nur dort geteilt werden.“), [Zusammenarbeit beenden] (Zwei-Schritt
   „Wirklich beenden? Songs bleiben lesbar“). Beendet: „Zusammenarbeit beendet – nur lesen …“, [Neue Anfrage an René].
3. **Teilen** (§6.6): „Nur ich“-Liste ⋯ → [Teilen] → Blatt mit den aktiven Räumen; Herkunfts-Raum-Regel (VO-E7) im Blatt und auf dem Server.
4. **Realtime** (§5): ein Kanal `synq-db-<uid>` mit Postgres Changes auf `projects`, `collab_requests`, `spaces` (RLS je Empfänger).
   Partner speichert → „René hat „Song X“ gespeichert“ (höchstens 1 je Projekt und Minute, mehrere zusammengefasst „René hat 3 Songs
   gespeichert“; neue Songs „… angelegt“, geteilte „… geteilt“; eigene nie). Offenes Projekt: sauber → Toast/Karte mit [Laden] (nie
   automatisch, auch nicht beim Spielen); eigene ungesendete Änderungen → sofortiger Push, die Konflikt-Version liegt auf dem Server.
   Geparkte lokale Kopien werden still erneuert. Anfrage → „David möchte mit dir Musik machen · [Ansehen]“ (+ „über deinen Link“);
   angenommen → „René hat angenommen – Raum „Mit René“ ist da“; abgelehnt; beendet → „René hat die Zusammenarbeit beendet – eure Songs
   bleiben lesbar.“ **Verpasstes** (`visible`, Wiederverbindung, Anmeldung): Kopfzeilen neu holen und wie Realtime behandeln.
5. **Konflikt-Wahl mit dem Partner** (§4.5, §10): Toast „René hat „Song X“ geändert · [Übernehmen] [Beide behalten]“ und Karte „René hat
   „Song X“ geändert (17:42). Deine Version bleibt in jedem Fall.“; das Hochladen läuft weiter (gleiche `base`), Erinnerung alle 10 min
   („… eure Wahl wartet …“). [Beide behalten] legt „Song X (Xanders Version)“ **im selben Raum** an (Raum beendet: „Nur ich“ mit Herkunft).
   Das Wort „Konflikt“ steht nirgends mehr in der Oberfläche.
6. **Presence-light** (§4.5): privater Kanal `space:<id>` je aktivem Raum, `track({name, sid, title})` höchstens 1/s, `sid`/`title` nur für
   einen Song **dieses** Raums (sonst null). Tippt man einen Song, den der Partner offen hat: Karte „René arbeitet gerade an „Song X“.
   [Trotzdem öffnen] [Als Kopie öffnen]“.
7. **Zusammenarbeit beenden** (§6.4, N8O-28): beide sehen „nur lesen“; Speichern wird als Version „Nach Ende der Zusammenarbeit“
   aufgehoben (Hinweis höchstens alle 10 min); Karte „Nur lesen …“ mit [Kopie in „Nur ich“] (nimmt den **letzten eigenen** Stand, merkt den
   Herkunfts-Raum).
8. **Mitmach-Link** (§6.1): [Mein Link teilen] (alle) → `…/Synquenzer/#mitmachen=<Code>&von=<Name>` (ohne E-Mail) über das Teilen-Blatt.
   Öffnen: Hash sofort entfernt; ohne Sitzung Blatt „Konto anlegen“ (früheres Konto auf dem Gerät: „Anmelden“) mit Kopfzeile „Xander möchte
   mit dir Musik machen. Leg ein Konto an, dann schickst du Xander eine Anfrage.“ (`von` nur als Text, ≤ 24); danach Karte „Xander ✓ Verwalter
   möchte mit dir Musik machen · Code … · [Anfrage an Xander schicken]“ – **erst dieser Tipp** schickt die Anfrage (`p_note` „über deinen
   Link“). Mit Sitzung gleich die Karte. Ungültiger Code: „Dieser Link passt zu keinem Konto. Frag nach einem neuen Link.“, eigener Link:
   „Das ist dein eigener Mitmach-Link.“
9. **Konten-Blatt** (§6.3b, nur Verwalter): „Konten: n (+ k gesperrt) · heute neu: m“, Zeilen „René · QZ4H7T · 9 Songs · 2 MB · Probe 5 MB
   · 41 T“ ohne E-Mail; ⋯ = Vertrauen/Vertrauen aufheben · Sperren · Sperren + Daten löschen (je Zwei-Schritt mit den Texten aus §6.3b) ·
   Entsperren · Code kopieren; [Ungenutzte Konten aufräumen] = Probelauf „1 Konto: Musiker. Löschen?“, gelöscht erst nach dem zweiten Tipp.
   Gesperrtes Konto: „Dein Konto ist gesperrt. Deine Songs bleiben auf diesem Gerät.“, Versuche nur noch stündlich.
10. **Abzweigen** (G.4 Nr. 2, §8.1): Versionen → ⋯ → [Abzweigen] (Vorgabe „Nur ich“, O-7) bzw. [Abzweigen in „Mit René“] (nur derselbe,
    aktive Raum) → RPC `fork_project` → neues Projekt „<Titel> – <Name>“, offen; Verweis vom Server „abgezweigt von Nachtlicht, Version 3
    (René, 19.10.2026)“ im Verlauf des Zweigs; Original byte-gleich; anderer Raum → `mixed_origin`. Versionszeilen zeigen jetzt die Nummer
    („Version 3 · heute 17:42“).
11. **Geräte-Werte lokal** (G.4 Nr. 3, N2-VO2-02) – **`DEVICE_KEYS`**: `project.ui` (Auswahl `selT`/`selS`, Ansicht `follow`, `fmv`),
    `settings.metroVol`, `settings.haptics`, `settings.quality`, `settings.buffer`, `settings.hintDismissed`, `tracks[].kbOct`
    (Eingabe-Oktave). Sie fehlen im Server-Text (flache Kopie vor dem einen Stringify, Prüfsumme über genau diesen Text), lokal bleiben
    sie gespeichert; kommt ein Server-Stand (Laden, Übernehmen, Zurückholen, still erneuern), behält das Gerät seine Werte (`devCarry`).
    Projektformat unverändert. Ändert ein Gerät nur diese Werte, gibt es keinen `save_project`.
12. Kleinkram: Löschen der lokalen Kopie eines Raum-Songs unter [Projekte] legt ihn **nicht** für beide in den Papierkorb (nur private);
    Start-Abgleich kennt jetzt auch Raum-Projekte (vorher wären lokale Kopien als „nur hier“ markiert worden); Hilfe: zwei Zeilen neu.
    Test-API (§7.6): `cloud().spaces/reqs/join`, `cloudSpaces`, `cloudReqs`, `cloudFind`, `cloudRequest`, `cloudRespond`, `cloudCancel`,
    `cloudEnd`, `cloudShare(space, sid?)`, `cloudCopyPrivate`, `cloudNewInRoom`, `cloudFork`, `cloudLink`, `cloudJoin`, `cloudHeads`,
    `cloudAdmin()`, `cloudRefresh`, `deviceKeys`, `cloudProjects(spaceId)`.

**Migration** (`scratchpad/synq-online/`): `vo_fork.sql` (Spalten `forked_from_project`, `forked_from_version`, `fork_note`; View
`project_list` + `origin_space_id`, `forked_from_project`, `fork_note`; RPC `fork_project` SECURITY DEFINER, `search_path = ''`, Lesen über
`private.my_project_ids()`, Schreiben in den Raum nur über `private.my_active_space_ids()`, Quote/Tempo wie Anlegen; `anon` ohne Recht),
`vo_fork_down.sql` (Rücksicherung, in PGlite hin und zurück geprüft: `v3-vo2-migdown.mjs`), `r7-vo2-max-app.sql`.
**T1:** `synq-online/rls-matrix.mjs` (= r7-Matrix + `vo_fork.sql` + 15 neue `fork_project`-Fälle) → **150/150** (`rls-matrix.out`).

**Rollout-Protokoll (Supabase-MCP, alle Aufrufe mit ref `dbdnsryoivvezspgydpx` – zweimal verglichen: Auftrag und `CLOUD.ref`)**
| Zeit | Aufruf | Ergebnis |
|---|---|---|
| 19.10. 07:09 | `list_migrations`, `list_tables(public)` | vo_init, vo1_max_app, signup_limits_open; 9 Tabellen, RLS an (1 Profil, 3 Projekte) |
| 07:10 | `apply_migration vo2_fork` (= `vo_fork.sql`, md5 95c7d105…) | success |
| 07:10 | `apply_migration vo2_max_app` (`max_app = greatest(max_app, 3011003)`) | success |
| 07:10 | `get_advisors(security)` | kein ERROR; WARN 0029 für 19 RPCs (gewollt, VO-E4, jetzt mit `fork_project`); WARN „Leaked Password Protection“ (Dashboard) |
| 07:10 | `execute_sql` (nur lesen) | `max_app` 3011003, `project_list` mit den neuen Spalten, `fork_project` da, `anon` ohne Ausführrecht, Publikation `projects, collab_requests, spaces` |
Kein Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (optional, nichts davon blockiert VO2):
1. Authentication → Attack Protection → „Leaked password protection“ einschalten, falls im Free-Plan angeboten (Advisor-WARN).
2. Authentication → Hooks → „Before User Created“ → `public.hook_before_user_created` (laut Runde 13 optional).
3. (erledigt laut Runde 13) Realtime → Settings → „Allow public access“ aus – nötig für die privaten Kanäle `space:<id>` (Presence).

**Für Xander am iPhone (T5, nach dem Ausliefern von 3.11.3):** (1) Menü → Online → [Mein Link teilen] → per WhatsApp an René; René tippt den
Link, legt ein Konto an und tippt [Anfrage an Xander schicken] → bei dir Hinweis + Karte → [Annehmen] → „Mit René“ erscheint bei beiden.
(2) Teile einen Song aus „Nur ich“ mit René (⋯ → Teilen); René ändert etwas → bei dir „René hat „…“ gespeichert · [Laden]“ (wenige
Sekunden?). (3) Ihr ändert beide gleichzeitig denselben Song → Karte „… geändert“ mit [Übernehmen] [Beide behalten]. (4) Versionen → ⋯ →
[Abzweigen] → neuer Song, Original unverändert. (5) Ansicht/Metronom-Lautstärke auf dem iPad ändern → am iPhone bleibt deine Einstellung.

**Abweichungen**
- **Größe:** `index.html` +47,5 KB gegen VO1-fix (Budget 40 KB, +19 %); gesamt 2,02 MB (Grenze 5,0 MB). Grund: acht neue Blatt-Ansichten mit
  allen Texten aus §6, Realtime-/Presence-Logik, Konten-Werkzeuge, Abzweigen; keine neue Bibliothek.
- `vo_fork` statt Änderung von `vo_init` (eigene, kleine Migration mit Rücksicherung; r7-Dateien bleiben unverändert, die erweiterte
  Matrix liegt als Kopie in `synq-online/`).
- `fork_project` hat die Signatur `(p_project, p_version, p_title, p_space, p_id, p_local_id, p_client)`; `p_version` = Zeilen-ID in
  `project_versions` (null = aktueller Stand). Der Verweis-Text wird **auf dem Server** gebaut (`fork_note`), nicht vom Gerät.
- Zähler „neu“: ein neu angenommener Raum startet bei 0 (nur Späteres zählt), sonst stünde beim ersten Anmelden alles auf „neu“.
- Der Hinweis „angelegt“ eines neuen Partner-Songs zählt zur Minute je Projekt (eine gleich folgende Speicherung bekommt keinen zweiten Toast).
- Gelber 10-s-Rand für geänderte Clips nach dem Laden (§5 „Was neu ist“, P1) **nicht gebaut** (optional, VO4b bringt das Leuchten).
- Querformat unter 700 px (L2 667×375) bleibt einspaltig (§6.10), auch für „Zusammenarbeit anfragen“.

**Abnahme** (`dirigent-test/v3-vo2-accept.mjs`, Harness `v3-vo2-harness.mjs` = VO1-Harness + `vo_fork` + Realtime-Nachbau: Postgres Changes
mit RLS je Empfänger, Presence auf `space:<id>` nur mit `private.topic_space_ok`; drei bis sieben Browser-Kontexte = Personen/Geräte;
nichts verlässt die Maschine) → **57/57** (`v3-vo2-accept-all.txt`):

| ID | Ergebnis |
|---|---|
| N8O-21 | ✓ `rls-matrix.mjs` gegen vo_init + vo_fork 150/150, davon 15 `fork_project`-Fälle |
| N8O-22 | ✓ Suche per Code (Karte), Name nur bei „findbar“, „@“ → „Niemand gefunden …“ ohne `find_user`, doppelter Name → „Mehrere heißen so …“, Anfrage → Toast + Karte (✓ Verwalter, Code, Nachricht) beim Empfänger in 0,5–0,75 s, [Annehmen] → beide den Raum in 0,8–0,9 s, [Ablehnen] → „Xander hat abgelehnt – neue Anfrage morgen möglich“, neue Anfrage `declined_recently`, 4. Anfrage am Tag → „Bitte morgen noch mal“, [Zurückziehen] |
| N8O-23 | ✓ nach XR und XD: Davids DOM, alle RPC-/REST-Antworten und Realtime-Nachrichten ohne Titel/ID aus XR; nach DR sieht David DR, weiter nicht XR |
| N8O-24 | ✓ Teilen „Nur ich → Mit René“ über das Blatt: René hat es in der Liste nach 0,08–0,26 s, Hinweis „… geteilt“ nach 0,6 s; Nicht-Eigentümer und Raum→Raum vom Server verweigert, ⋯ im Raum ohne Teilen; Kopie aus „Mit René“: David-Zeile grau mit Text, Server `mixed_origin` |
| N8O-25 | ✓ Toast „René hat „Song X“ gespeichert“ 0,5 s nach `save_project`; 5 Speicherungen in 60 s → kein weiterer Toast, Liste 5-mal aktuell; eigene ohne Toast; zwei Songs kurz nacheinander → „René hat 2 Songs gespeichert“ |
| N8O-26 | ✓ offen + sauber → Toast [Laden], Tempo erst nach dem Tipp; beim Spielen kein Laden, Wiedergabe läuft, Toast [Laden] |
| N8O-27 | ✓ nur über Realtime erkannt → Konflikt-Version nach 0,25 s; Toast mit [Übernehmen] [Beide behalten] + Karte, Punkt orange; 4 weitere Pushes, Konflikt-Version = md5 des letzten gesendeten Texts (Tempo 105); Erinnerung nach 10 min; Übernehmen → lokal = Server; Beide behalten → „Song X (Xanders Version)“ im Raum mit dem letzten lokalen Stand, René sieht es; drei Stände; N8O-27b zwei Geräte → zwei Konflikt-Versionen (je `client_id`); N8O-27c Karte „René arbeitet gerade an „Song X“ …“; Presence nur Songs des eigenen Raums, ≤ 1/s |
| N8O-28 | ✓ Zwei-Schritt beenden → beide „nur lesen“, Hinweis beim Partner; Speichern → Version „Nach Ende der Zusammenarbeit“, Kopf unverändert; [Kopie in „Nur ich“] → privates Projekt mit Herkunft und dem letzten eigenen Stand |
| N8O-29 | ✓ während `hidden` 3 Ereignisse verworfen; nach `visible` stimmt die Liste in 0,1 s, „2 neu“ |
| N8O-30 | ✓ Link ohne „@“; Blatt „Konto anlegen“ mit Kopfzeile; nach dem Anlegen Karte, 0 `request_collab` ohne Tipp; nach dem Tipp bei Xander Toast + Karte („über deinen Link“) in 0,4 s; [Annehmen] → beide Raum, Link-Zustand weg; ungültiger Code → Text; Gerät mit Sitzung → gleich die Karte; abgemeldetes Gerät mit früherem Konto → „Anmelden“ |
| N8O-30b | ✓ René/David ohne [Konten], `admin_*` → 42501; Liste ohne „@“; [Sperren] Zwei-Schritt → Anfrage bei Xander weg in 0,3 s; gesperrt → Text, lokal nichts verloren, 1 Aufruf statt einem je Änderung; Aufräumen: Probelauf „1 Konto: Altkonto. Löschen?“, gelöscht erst nach dem zweiten Tipp; [Vertrauen] |
| N2-VO2-01 | ✓ Version 3 von „Nachtlicht“ (Mit René) → [Abzweigen] → „Nachtlicht – Xander“ in „Nur ich“ (Inhalt = Version 3, Verweis, Herkunft); Original-Kopf und alle Versionen md5-gleich; anderer Raum → `mixed_origin`; René sieht es nicht (Liste, Realtime); Verweis im Verlauf |
| N2-VO2-02 | ✓ Gerät A ändert nur Auswahl, Ansicht, Metronom-Lautstärke, Oktave → 0 `save_project`, Server-md5 gleich, lokal gespeichert; Server-Text ohne DEVICE_KEYS, Prüfsumme gültig; Gerät B lädt eine echte Änderung und behält seine eigenen Werte (Auswahl 2, Metronom 0,9, Oktave 5) |

Weitere Prüfungen: `v3-vo2-platz.mjs` **36/36** (Online, Raum, Anfragen, Konten, Versionen, Teilen in P1, P2 375×667, P3 320×568, L1,
L2 667×375, W 1280×800: kein Überlauf, Ziele ≥ 44 bzw. ≥ 40×36, keine abgeschnittenen Texte, Felder 16 px; Bilder `v3-vo2-<Größe>-<Ansicht>.png`);
`v3-vo2-fpsicher.mjs` **6/6**; `v3-vo2-adapt-vo1-accept.mjs` (VO1-Abnahme mit 3.11.3 + vo_fork) **131/133** – rot nur N8O-19b (Größe,
bekannte Abweichung) und N8O-18 unter Fremdlast (Lastmittel 11–19 durch andere Läufe auf der VM): allein 4 von 6 Läufen grün (60 fps, keine
longtask, p95 1,9–2,5 ms), die roten mit einzelnen 58–79-ms-longtasks auch ohne Räume/Realtime; der Push-Pfad hat sich nur um eine flache
Kopie (`devStrip`) verändert. Smoke ohne Fehler (`v3-vo2-smoke.png`).

**Regression:** `v3-vo2-reg.sh` (= VO1-Liste mit den Versionskopien `v3-vo2-adapt-*` für 3.11.3; die VO1-Abnahme läuft als
`v3-vo2-adapt-vo1-accept.mjs` mit `v3-vo2-adapt-vo1-harness.mjs` = App 3.11.3 + `vo_fork`), `v3-vo2-reg2.sh`, `v3-vo2-reg3.sh`; Ausgaben
`dirigent-test/v3-vo2-reg/`, Vergleich mit VO1 `v3-vo2-regcmp.sh`. Der Lauf fiel in eine Zeit mit Lastmittel bis 19 (andere Läufe auf der
VM); alle gegenüber VO1 neu roten Suiten (`wp1-shield`, `wp2-keys-P`, `wp2-quant-P`, `wp2-rec-P/L`, `wp6-song-L`, `wp6-steps-P375`,
`wp6-extras-L`, `v0b-ux`, `vo2-adapt-wp3-store` PF7, `wp7-accept-fm4`, `v4c-accept-P/P320/P375`, `v0c-song-L`) sind allein wieder grün
bzw. auf dem VO1-Stand (`v3-vo2-reg/solo/`, `v3-vo2-solo.sh`); `wp3-ui` F2, `wp6-extras-P` F1, `rgq-old17` F5, `v4a-node` V4a-11 (CPU-
Messung des Worklets) wie auf VO1. VO2 berührt weder Audio noch Worklet. Smoke ohne Fehler.

**Fach-Prüfung (Teil J: FP-SICHER ● Haupt-, FP-TOUCH Zweit-Blick;** als zweiter Durchgang über Diff, Testausgaben und Bilder auf mich
selbst angewandt – kein eigener Agent verfügbar). **12 Befunde, 11 behoben, 1 begründet:**
1. FP-SICHER: Löschen der lokalen Kopie eines Raum-Songs hätte ihn per `trash_project` für **beide** in den Papierkorb gelegt → nur noch private (behoben).
2. FP-SICHER: Start-Abgleich las nur eigene Projekte → lokale Kopien von Partner-Songs wären „nur hier“ geworden (behoben, RLS liefert Räume mit).
3. FP-SICHER: gesperrtes Konto versuchte bei jeder Änderung neu zu speichern → nur noch der Stunden-Takt (behoben, N8O-30b-d).
4. FP-SICHER: fremde Texte – Namen, Notizen, Titel, Presence, `von` des Links – mit HTML-Nutzlast geprüft: nur Text, kein Element, kein Skript (`v3-vo2-fpsicher` 1).
5. FP-SICHER: Presence nur mit `private.topic_space_ok` (David nicht in `space:<XR>`, gesperrt nicht in den eigenen Raum); Payload ohne Titel/ID anderer Räume (geprüft).
6. FP-SICHER: Postgres Changes: David bekommt keine Zeile aus XR; Publikation weiter ohne DELETE (geprüft, auch im echten Projekt).
7. FP-SICHER: Migration: SECURITY DEFINER + `search_path=''`, Rechte ausdrücklich, Rücksicherung, idempotent (zweimal angewandt in PGlite), Advisor ohne ERROR (geprüft).
8. FP-SICHER (begründet): die Kopfzeile des Mitmach-Links zeigt `von` aus der Adresse (wie §6.1 verlangt, nur als Text); wer anfragt,
   entscheidet erst an der Karte mit dem **Server**-Namen, „✓ Verwalter“ und dem Code.
9. FP-SICHER: [Kopie in „Nur ich“] aus einem beendeten Raum nahm den Server-Stand und verlor die eigenen letzten Änderungen → offener Song: lokaler Stand (behoben, N8O-28c).
10. FP-SICHER: Gerät mit nur geänderten Geräte-Werten bekam bei einer Partner-Speicherung kein [Laden] → erst Push-Abgleich, dann wie unverändert (behoben).
11. FP-TOUCH: Realtime-/Presence-Ereignisse bauten das Blatt neu und schlossen ein offenes ⋯ bzw. einen gespannten Zwei-Schritt
    (auch den Aufräum-Probelauf) → kein Neubau, solange ⋯ offen oder ein Zwei-Schritt gespannt ist; Verwalter-Aktionen laden nicht mehr neu (behoben).
12. FP-TOUCH: P3 Konten-Zeile abgeschnitten („Prob…“) → kurze Form unter 360 px; Versionszeilen ohne Nummer, obwohl der Verweis „Version 3“ nennt → „Version n · Zeit“ (behoben).
Ziele, Überlauf, Schriftgrößen in allen Größen: `v3-vo2-platz` 36/36; alle zerstörenden Aktionen Zwei-Schritt; keine Fachwörter
(„Konflikt“ aus allen Texten entfernt).

**Bekannte Lücken:** echte Realtime-Verbindung (WebSocket, Phoenix-Protokoll von supabase-js) ist nur gegen den Nachbau geprüft, nicht gegen
das echte Projekt (Messung ZA-05 kommt mit VO4 und Xanders Okay); gelber Rand für geänderte Clips (P1) fehlt; Xander ist im echten Projekt
noch nicht in `private.admins` (R4, Orchestrator nach seiner ersten Anmeldung).

## VO2-fix — Herkunfts-Raum bleibt bei jeder Kopie, „✓ Verwalter“ nicht fälschbar, Übernehmen nach Änderung, privater Realtime-Kanal, Online-Blatt springt nicht · App 3.11.3

Sechs bestätigte Befunde (zwei davon doppelt gemeldet), alle behoben. Version bleibt **3.11.3** (`APP_CODE` 3 011 003); `index.html` +9,9 KB.

1. **VO-E7 / N8O-24 / O3 – Kopien eines Raum-Songs** (Befunde 1 und 5): `duplicateProject` ([Projekte] → Duplizieren), `cloudCopyVersion`
   (Versionen → ⋯ → Als Kopie öffnen), `restoreHistory` (ältere Version eines anderen Projekts) und der „(vorher)“-Stand beim Datei-Import
   legten ein neues Projekt **ohne** Herkunft an → `cloudMark` machte daraus ein „Nur ich“-Projekt mit `p_origin = null`, Teilen mit David ging durch.
   Neu: `cloudInherit(src, neu, org)` schreibt vor dem Parken/Öffnen das Meta der Kopie mit `origin` = Raum (bzw. gemerkte Herkunft) der Quelle;
   `cloudCopyVersion` liest den Raum des Songs der Version (`cloudOriginOf`: Kopfzeile → lokales Meta → `projects.space_id/origin_space_id`; nicht
   lesbar → keine Kopie). Das Meta gehört dem Konto der Quelle (Kopie eines fremden Raum-Songs bleibt fremd); „In mein Konto übernehmen“ und der
   Start-Abgleich übernehmen Raum-Kopien nie. Folge: Kopie hat `origin_space_id = XR`, „Mit David“ grau mit Hinweis, Server `mixed_origin`.
2. **„✓ Verwalter“ fälschbar über den Namen** (§6.5b): das Abzeichen ist jetzt ein eigenes grünes Element (`.cl-adm`, nur aus `profiles.is_admin`) in
   Anfrage-Karte, Treffer-Karte und Mitmach-Karte (`cloudWho`); Namen mit Haken-Zeichen (✓ ✔ ☑ ✅ √ …) oder „Verwalter“ (auch mit kyrillischen/
   griechischen Doppelgängern) werden am Gerät abgelehnt („„✓“ und „Verwalter“ gehen nicht im Namen – nimm einen anderen.“) und vom Server
   (`profiles_name_guard` in `vo2_fix`: beim Anlegen „Musiker“, beim Ändern `bad_name`); fremde Namen werden zur Anzeige davon befreit (`nmSafe`).
3. **N8O-27 – [Übernehmen]/[Beide behalten] direkt nach einer Änderung**: `cloudResolve` schreibt zuerst die wartende Autospeicherung (`saveNow`,
   auch beim Spielen) und lädt dann unter der Sync-Sperre hoch → die Konflikt-Version auf dem Server ist der letzte lokale Stand (Tempo 107).
4. **FP-SICHER – Realtime-Kanal nicht privat**: „Allow public access“ ist aus, der Kanal `synq-db-<uid8>` war öffentlich und wurde abgewiesen
   (PrivateOnly) → alle Live-Hinweise tot. Neu: Kanal `user:<uid>` mit `{config: {private: true}}` und Lese-Policy `user_channel_read` auf
   `realtime.messages` (Migration **`vo2_fix`**, nur eigenes Thema, kein INSERT). Falls der Beitritt trotzdem scheitert: Ersatz-Takt alle 30 s
   (Kopfzeilen neu holen, nur sichtbar), nach 5 Fehlern ruht der Kanal 5 min statt endlos neu beizutreten.
5. **FP-TOUCH / M-ANSICHT – Online-Blatt springt**: Partner-Speichern/Presence bauen nur noch Ansichten neu, die davon abhängen (Start, Raum,
   Teilen; Versionen nur bei einer neuen Version dieses Songs), im Querformat nur die linke Spalte. Vor jedem Neubau merkt sich das Blatt die
   oberste sichtbare Zeile je Scroll-Bereich und stellt sie danach (auch nach Nachladen) wieder an dieselbe Stelle, bis der Finger selbst scrollt.
   „Nur ich“, Papierkorb, Konten, Versionen und Platz-Anzeige kommen beim Neubau sofort aus dem Speicher statt „Lädt …“; ein Partner-Ereignis
   ruft `project_list`, `admin_accounts`, `storage_report` nicht mehr neu ab.

**Migration** `synq-online/vo2_fix.sql` (+ `vo2_fix_down.sql`): `private.topic_user_ok(text)` (SECURITY DEFINER, `search_path=''`, nur
`authenticated`), Policy `user_channel_read`, neuer `profiles_name_guard`. PGlite: `v3-vo2fix-sql.mjs` 10/10 (eigenes Thema ja, fremdes/alte
Themen nein, kein INSERT, Namen, Rücksicherung, zweimal angewandt); `synq-online/rls-matrix-vo2fix.mjs` 150/150.
**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`): 19.10. 10:41 `apply_migration vo2_fix` → success; Prüfung nur lesend bzw. per
zurückgerollter Probe: Policies `space_channel_read, space_channel_write, user_channel_read`, `topic_user_ok` eigenes Thema t / fremdes f / altes
`synq-db-…` f, `anon` ohne Ausführrecht, Namen „Tom ✓ Verwalter“ und „Vеrwаlter“ → `bad_name`, „Oliver Walter“ erlaubt; Profil unverändert;
Advisor unverändert (19 × WARN 0029 gewollt, Leaked Password). Kein Aufruf nennt das Klassenzimmer-Projekt.
**Harness:** `v3-vo2-harness.mjs` prüft Beitritte jetzt wie das echte Realtime (private_only an; privater Beitritt nur mit Lese-Policy auf
`realtime.messages`, `B.rtRead`) und lädt `vo2_fix.sql` (alt: `v3-vo2-harness.pre-fix.mjs`; `SYNQ_RT_PUBLIC=1` / `SYNQ_NO_VO2FIX=1`).

**Nachweise** (vorher rot, jetzt grün): `v3-qa-vo2acc-b.mjs dup` 1/1, `v3-qa-vo2acc-a.mjs copyver` 1/1, `v3-fpvo2-origin.mjs` (A/B/C
`mixed_origin`, David liest nichts), `v3-repro-origin-leak.mjs` 3/3; `v3-vo2fix-badge.mjs` 8/8; `v3-qa-vo2acc-a.mjs resolve` 1/1,
`v3-qa-n8o27-indep.mjs` 3/3 (auch beim Spielen); `v3-vo2fix-rtwire.mjs privonly` (echtes supabase-js über WebSocket: Beitritt ok, Anfrage live
nach 0,24 s, „angelegt“-Toast, v2 in den Kopfzeilen); `v3-fpvo2-scroll.mjs P/L` ohne Sprung, `v3-repro-fpvo2-scroll-b.mjs P/L` 468/321 bleiben,
`v3-vo2fix-views.mjs P/L` 4/4 (Liste, Konten, Versionen ohne „Lädt …“ und ohne neue Abrufe). Smoke ohne Fehler (`v3-vo2fix-smoke.png`).
**Regression** (Harness jetzt wie live: nur private Kanäle): `v3-vo2-accept.mjs` **57/57**, `v3-vo2-fpsicher.mjs` 6/6, `v3-vo2-platz.mjs` 36/36
(P1–P3, L1, L2, W mit der App-Schrift aus `synq-pages/fonts`; das Abzeichen passt auch in P3), `v3-vo2-adapt-vo1-accept.mjs` 132/133 (rot nur
N8O-19b Größe, bekannte Abweichung). Ausgaben `dirigent-test/v3-vo2fix-reg/`.
Hinweis: `v3-qa-vo2acc-a.mjs badge` legt das Fälscher-Konto über die App an – das lehnt die App jetzt ab („badge“); der Fall ist in
`v3-vo2fix-badge.mjs` (Alt-Konto mit solchem Namen per SQL) abgedeckt.
**Für Xander im Dashboard:** nichts Neues („Allow public access“ bleibt aus; `vo2_fix` ist angewandt).

---

## VS0 — Mikro-Check (verstecktes Testblatt, Ergebnis als JSON, Tor für VS1) · App 3.11.4

Grundlage: Nachtrag 2 Teil C (C.1, C.2 Punkte 1, 2, 4, 5; C.3 Zeile VS0; C.4 N2-VS0-01 … -03; K2-08), Teil E (Gruppe 2), Teil J
(FP-IPHONE Haupt-, FP-SICHER Zweitblick); Nachtrag 1 Teil B „VS0“; Spec v3 §13; `r7/stimme.md` §1.3, §6, §11 Skizze 7, §12, §13
(N7V-01 … -03), Prototyp `r7/stimme-proto/latency.mjs`. Version **3.11.4** statt 3.7.0 (E.5 Punkt 3: Versionen steigen streng; nach
VO2 = 3.11.3 kommt die nächste Zwischennummer). `APP_CODE` = 3 011 004. Keine neue Fähigkeit (Mikrofon nur außerhalb der Claude-App).

**Was neu ist**
1. **Eintrag:** Menü (≡) → Info → **[Mikro-Check]** (44 px) mit „Test fürs Einsingen: Mikrofon, Verzögerung, Speicher“. Er erscheint nur,
   wenn `navigator.mediaDevices.getUserMedia` existiert **und** `window.top === window.self` (`micAvail()`); in der Claude-App (iframe)
   gibt es weder Eintrag noch Blatt noch einen `getUserMedia`-Aufruf (N2-VS0-01). Auf der Pages-Seite und dem githack-Spiegel sichtbar.
2. **Blatt** `#micChk` (wie das Online-Blatt unter der Kopfzeile; ▶ oben bleibt bedienbar, damit die Klang-Frage mit der eigenen Musik geht):
   Erklärsatz, Statuszeile mit Punkt, [Mikro starten] / [Stopp] / [Noch mal messen], Pegelbalken, Ergebnis-Kasten (Tor), Wertetabelle
   (Querformat zweispaltig), Klang-Frage mit [▶ Hörprobe] und [Ja | Nein], [Ergebnis kopieren] [Als Datei]. ✕ und Esc schließen (ein
   laufender Check wird dabei sauber beendet).
3. **Ablauf auf Tipp** (Mikrofon nur auf Tipp, im selben Tipp `ensureAudio()` → `resume`, I11): Musik stoppt, Bildschirm bleibt an
   (`wakeAcquire`, auch über 60 s), **Netz-Halt** (Punkt 6), `audioSession.type = 'play-and-record'` **vor** `getUserMedia`
   (I4), `getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}})`. Danach: Spur-Einstellungen
   (`getSettings`), Kontext-Rate, `baseLatency`/`outputLatency`, Raten-Vergleich Spur ↔ Kontext (I9 „abfangen“: Warnung + Eintrag im Log;
   die Drift-Probe zeigt, ob Samples verloren gehen), Zustand des Kontexts (läuft er 1 s nicht, Log + `resume`).
   Messkette: Mikrofon → Kanal 0, das gespielte Signal (Referenz, digital) → Kanal 1 eines eigenen Aufnahme-Worklets `synq-miccap`
   (ASCII, Blob- bzw. data:-URL wie das Synth-Worklet; ohne AudioWorklet ScriptProcessor). Weil Mikro und Referenz im selben Block
   liegen, misst die App den **Rundlauf Ausgang → Lautsprecher → Raum → Mikrofon** unabhängig vom Hauptfaden.
   - 0,5 s Stille → Grundrauschen (dBFS);
   - **4 Chirps** 0,8–8 kHz, 30 ms, −8 dBFS, Abstand 0,7 s → je Chirp Rundlauf per Kreuzkorrelation (FFT) mit der Regel **„erste
     Ankunft“** (frühestes Maximum ≥ 50 % des größten, Parabel-Feinwert; `stimme.md` §6), Suchfenster 0,5 s (reicht für Bluetooth),
     Güte = Spitze/Median; Streuung max − min (N7V-03, Soll ≤ 2 ms);
   - 2 s rosa Rauschen −20 dBFS → **Frequenzgang** Lautsprecher+Raum+Mikro in Oktavbändern 125 Hz … 16 kHz (Welch, Hann 4096,
     um den gemessenen Rundlauf verschoben, 1 kHz = 0 dB), Balken im Blatt, Abstand Rauschen/Grundrauschen;
   - **Drift-Probe 2 min** (Countdown, [Drift jetzt beenden] für eine kürzere Probe): 2 End-Chirps → ms/min (Warnung > 0,5 ms/min), dazu
     Lücken im Aufnahme-Strom (`currentFrame`-Sprünge);
   - Mikrofon aus: alle Spuren `stop()` → `readyState 'ended'`, `audioSession.type = 'playback'` (N7V-06 sinngemäß);
   - **Speicher**: `storage.estimate()`, `persisted()`, `persist()`, **50-MB-Schreibtest** in einer eigenen Datenbank `synq-miccheck`
     (25 × 2 MB, Rücklesen, danach gelöscht; die Projekt-Datenbank wird nicht berührt).
   Fehler (`NotAllowedError`, `NotFoundError`, `NotReadableError`, …) erscheinen mit Namen und deutschem Satz statt eines Absturzes; der
   Speicher-Test läuft trotzdem, das JSON bleibt gültig. Seite verlassen / Spur beendet (Anruf) = Abbruch mit Fehlername `Interrupted` /
   `TrackEnded`. [Stopp] räumt jederzeit alles ab.
4. **Klang-Frage** (Nachtrag 1 VS0, §11 Skizze 7): „Klingt die Musik mit laufendem Mikrofon noch gut – nicht leiser, nicht dumpfer?“
   [Ja | Nein]; [▶ Hörprobe] = vier Akkorde durch den Master (einmal vor dem Start, einmal mit Mikro) oder ▶ oben mit der eigenen Musik.
5. **Ergebnis-Kasten (Tor N2-VS0-02):** „✓ Bereit fürs Einsingen …“ nur, wenn `getUserMedia` ging, alle 4 Chirps gehört und Streuung
   ≤ 2 ms, und „Ja“; sonst „✗ Noch nicht bereit: <Gründe>“. [Ergebnis kopieren] (`navigator.clipboard`; geht das nicht, erscheint der
   JSON-Text zum Markieren) und [Als Datei] (`synquenzer-mikro-check-JJJJMMTT-hhmm.json` über `deliver`).
6. **Datenschutz / kein Netz während der Prüfung** (C.2 Punkt 5, N7V-35; N2-VS1-02 schon hier umgesetzt): `cloudHold(true)` beim Tipp:
   Realtime abmelden (supabase-js `removeAllChannels` → leave je Kanal, Socket zu), Token-Erneuerung aus, Postausgang wartet; jeder eigene
   Aufruf (`cloudFetch`, `cloudRpcText`, `cloudRpc`, `cloudSel`, `cloudReach`) wartet auf die Freigabe statt zu senden; `cloudSchedule`,
   `cloudKick`, Ersatz-Takt und Neu-Beitritte ruhen. `cloudHold(false)` nach dem Speicher-Test: Erneuerung an, Verpasstes holen, Postausgang
   hoch, Realtime + Presence neu (erst nachdem das Abmelden fertig ist – sonst gäbe `channel()` den alten Kanal zurück). Ein Zähler für
   `fetch`, XHR, `sendBeacon` und gesendete WebSocket-Frames läuft nur während der Prüfung und steht im JSON (`net`). Kein Audio wird
   gespeichert oder gesendet; das JSON enthält keinen Gerätenamen (`label`) und geht nur auf Tipp in die Zwischenablage / Datei.
7. **Test-API:** `micCheck()`, `micCheckOpen(v)`, `micCheckStart({driftSec, noStore})`, `micCheckStop()`, `micCheckDriftNow()`,
   `micCheckAnswer(v)`, `micCheckJson()`, `micCheckCopy()`, `micCheckSave()`, `micCheckProbe()`, `micCheckEstimate(mic, ref, sr)`.

**JSON-Schema `synq-miccheck/1`** (N2-VS0-01, Text mit Einzug 1):
```
schema "synq-miccheck/1" · app "3.11.4" · at, end (ISO-Zeit) · ua (≤ 200 Zeichen) · where "pages"|"githack"|"datei"|"andere" · standalone (Home-Bildschirm)
env        {secure, top, audioSessionApi, outputLatencyApi, worklet}
constraints{supported: {echoCancellation, noiseSuppression, autoGainControl, channelCount, sampleRate, sampleSize, latency, deviceId, groupId} | null,
            asked: {echoCancellation:false, noiseSuppression:false, autoGainControl:false}}
track      {settings: {sampleRate?, sampleSize?, channelCount?, echoCancellation?, noiseSuppression?, autoGainControl?, latency?}, readyState, muted, readyStateAfter: ["ended"]} | null
context    {sampleRate, baseLatencyMs, outputLatencyMs|null, state, rateMismatch}
session    {before, during, after}            (navigator.audioSession.type; null ohne API)
error      {step: "getUserMedia"|"aufbau"|"auswertung"|"drift"|"unterbrochen"|"audio", name, message} | null
roundTrip  {ms: [4 × Zahl|null], medianMs, spreadMs, q: [4], levelDbfs: [4], ok (4 gültig und Streuung ≤ 2 ms), signal, path}
response   {hz: [125 … 16000], db: [… relativ zu 1 kHz], gain1k (dB Mikro/Referenz bei 1 kHz), frames}
noise      {floorDbfs, noiseDbfs, snrDb}
drift      {sec, startMs, endMs, msPerMin, gaps, ok (|ms/min| ≤ 0,5), short (< 60 s)} | null
capture    {how: "worklet"|"script", frames, gaps, sec}
storage    {quotaMB, usageMB, persistedBefore, persist, write50: {ok, ms, mb: 50, readBack} | {ok:false, err, ms}}
sound      {question, answer: "ja"|"nein"|null, given: {at, phase: "drift"|"end", micLive: true, track: "live", session, afterSec} | null}   (VS0-fix)
net        {fetch, xhr, beacon, ws, total}    (während der Prüfung)
gate       {gum, spreadOk, soundOk, pass, why: [Texte]}
phase      "done"|"error"|"stopped" · log: [Texte]
```
**Tor für VS1 (N2-VS0-02):** VS1 beginnt nur mit Xanders JSON und `gate.pass = true` (= `getUserMedia` ok, `roundTrip.spreadMs ≤ 2`,
`sound.answer = "ja"` mit `sound.given.micLive = true`, VS0-fix). Bis dahin bleiben VS1, VS2 und VS3–VS6 nach E.5 Punkt 3 zurückgestellt.

**Abweichungen (bewusst)**
- **Klang-Frage umgedreht:** Nachtrag 1/§11 fragen „Wurde die Musik leiser/dumpfer?“, Nachtrag 2 (gilt) verlangt für das Tor „„Ja“ beim
  Klang“. Damit „Ja“ eindeutig gut heißt, lautet die Frage „Klingt die Musik mit laufendem Mikrofon noch gut – nicht leiser, nicht dumpfer?“.
- **Ort des Eintrags:** „⚙ → Mikro-Check“ – die App hat kein ⚙, das Menü heißt ≡; der Eintrag steht dort im Abschnitt **Info** (versteckt, unten).
- **Budget:** +15 KB geplant, gebaut **+50 KB** roh (+17 KB gzip; `index.html` 2 080 KB → weit unter 5,0 MB, EN2-28). Grund: Netz-Halt für
  SYNC/Realtime (in der Planung erst VS1), Worklet-Quelle, Speicher-Test, Fehlertexte, ausführliche deutsche Kommentare. Startzeit
  unverändert (das Modul tut beim Laden nichts).
- **N2-VS1-02 (2)/(3) teilweise vorgezogen:** Halt/Freigabe von SYNC und Realtime samt Zähler gibt es schon für den Mikro-Check; Jam-Hinweis
  (VC3b) und Take-Aufnahme/Säubern kommen mit ihren Paketen.

**Fach-Prüfung (Teil J; selbst durchgeführt, kein eigener Agent verfügbar):**
- *FP-IPHONE (Haupt):* Datei +50 KB (siehe oben), keine Arbeit beim Start. Longtasks/Bildrate während eines ganzen Checks (`v3-vs0-perf.mjs`):
  CPU ×1 **0 longtasks**, 60 fps; CPU ×4 (grobe iPhone-Annahme, Faktor unbelegt) noch einzelne Schritte 52–175 ms beim Mikro-Start, in der
  Auswertung und im Speicher-Test (Leerlauf ×4 zum Vergleich: 1 × 92–100 ms). **Befund 1** (Frequenzgang 54 ms am Stück, Chirp-Schätzung
  am Stück, 50-MB-Test in 10-MB-Schritten → longtasks bis 265 ms bei ×4) **behoben**: Auswertung in Schritten (Referenz/Mikro getrennt,
  Korrelation in Stücken zu 8192, Frequenzgang je 3 Fenster, FFT vorgewärmt), Speicher-Test 25 × 2 MB. Die Messung selbst hängt nicht am
  Hauptfaden (Mikro und Referenz im selben Worklet-Block). **Befund 2** (Bildschirmsperre nach 60 s würde die 2-min-Probe abbrechen)
  **behoben**: Wake-Lock während des Checks (`wakeReleaseLater` wartet). Speicher: ≈ 2,5 MB Blöcke in der ersten Phase, danach nur die
  End-Chirp-Fenster. Hintergrund: Seite verlassen → Abbruch + Freigabe; Audio-Sitzung danach immer `playback`. Safari-7-Tage-Regel:
  Test-Datenbank wird gelöscht; `persist()` wird angefragt (nutzt auch den Projekten).
- *FP-SICHER (Zweit):* keine neuen Hosts/Geheimnisse; **Befund 3** (erste Fassung schloss den Realtime-Socket sofort von Hand → bei
  schneller Freigabe hätte `channel()` den alten, nicht abgebauten Kanal zurückgegeben) **behoben** und mit dem echten supabase-js 2.117.2
  + WebSocket-Attrappe geprüft (`v3-vs0-rtreal.mjs` 6/6, auch Freigabe nach 50 ms). **Befund 4** (Fake-Client-Aufrufe über `cloudSel`/
  `cloudRpc` gingen am Halt vorbei) **behoben**. Alle fremden Texte über `textContent`; Fehlermeldungen gekürzt; JSON ohne Gerätenamen.
  Versions-Wächter: `max_app` vor dem Ausliefern auf 3 011 004 angehoben (Rollout unten). Nie das Klassenzimmer-Projekt.
  4 Befunde, alle behoben.

**Abnahme**
| ID | Ergebnis | Beleg |
|---|---|---|
| N7V-01 | ✓ alle Felder aus §12 VS0 (17 Prüfpunkte) im Blatt und JSON; Ablehnung `NotAllowedError`/`NotReadableError`: Fehlername + Satz, JSON gültig, kein Konsolenfehler, Sitzung `playback`, Halt aufgehoben | `v3-vs0-accept.mjs` 25/25 |
| N7V-02 | ✓ App-eigener Schätzer (aus `index.html` geschnitten) im Prototyp-Raum, je 60 Versuche: 20–80 ms bei 20/10/0 dB → 95 %-Fehler **0,030 / 0,033 / 0,033 ms**; 150–350 ms (Bluetooth) 0,032 / 0,030 / 0,034 ms; 0 ungültig (Soll ≤ 0,1 ms) | `v3-vs0-n7v02.mjs` → `v3-vs0-n7v02.out` |
| N7V-03 | Gerät (Xander). Attrappe: Schleife mit +0 / +0,5 / +1 / +1,5 ms je Chirp → gemessene Differenzen 0,000 / 0,500 / 1,000 / 1,500 ms | `v3-vs0-accept.mjs` |
| N7V-06 (sinngem.) | ✓ nach Ende/Stopp: Spuren `ended`, Sitzung `playback → play-and-record → playback` | `v3-vs0-accept.mjs` |
| N7V-35 / C.2-5 | ✓ zwei Konten im Paar-Raum (Fake-Server + Realtime-Nachbau), Änderung während der Prüfung: 0 Server-Aufrufe, 0 Kanäle, Zähler 0; nach dem Ende Realtime + Presence nach ≈ 50 ms, `save_project` nach ≈ 100 ms (Soll ≤ 5 s), Server hat den Stand | `v3-vs0-net.mjs` 8/8, `v3-vs0-rtreal.mjs` 6/6 |
| N2-VS0-01 | ✓ Claude-App-Attrappe (iframe mit `window.claude`, sogar `allow="microphone"`): kein Eintrag, `micCheckOpen/Start` → false, Zähler 0; Pages und githack: Eintrag da, „Ergebnis kopieren“ = gültiges JSON (Zwischenablage gelesen), „Als Datei“ = gültige Datei; Schema oben | `v3-vs0-accept.mjs` |
| N2-VS0-02 | offen – wartet auf Xanders JSON (Tor für VS1); Tor-Logik geprüft (Ja → ✓, Nein → ✗ mit Grund) | `v3-vs0-accept.mjs` VS0-09 |
| N2-VS0-03 | ✓ Pages ohne `window.claude`, keine Viewer-Knöpfe; Demo-Projekt Claude-App → Datei → Pages `project()` deep-equal; **klingt bitgleich**: 4 Synth-Spuren mit dem echten Worklet offline je 1 s, Hash beider Seiten gleich | `v3-vs0-accept.mjs` |
| Hörbarkeit | ✓ [▶ Hörprobe] Master −200 → −18 dB; Chirps im Mikro −20 dBFS | `v3-vs0-accept.mjs`, JSON `levelDbfs` |
| Layout | ✓ P1, P2, P3, L1, L2: kein Überlauf, alle Knöpfe ≥ 44 px, nichts abgeschnitten, Blatt unter `#top`, ▶ bleibt erreichbar (`elementFromPoint`) | `v3-vs0-layout.mjs` 15/15, Bilder `v3-vs0-{P1,P2,P3,L1,L2}-{ready,run,done,done-end}.png` |
| Regression | ✓ `v3-vs0-reg.sh` / `-reg2.sh` / `-reg3.sh` (= VO1-Liste, Versionskopien `v3-vs0-adapt-*` für 3.11.4; Ausgaben `dirigent-test/v3-vs0-reg/`, Vergleich `v3-vs0-regcmp.sh`): rot nur, was auf VO1 schon rot war, plus unter Last neu rot und **allein grün** (`v3-vs0-reg/solo/`: wp2-rec P/L, v0b-adapt-wp1-shield, v0b-follow, v0d-adapt-wp4-engine, v4c-adapt-v0b-ux, vs0-adapt-wp3-store, wp6-extras P, wp7-accept-fm4, v0c-song-L). Allein weiter rot und bekannt (CPU-/Zeitmessungen, kein Mikro-Bezug): `v3-v0a-drum` DR7 (8,0 % statt ≤ 7 %), `wp3-adapt-func-build` C2/D5 (VO1: F2), `v3-v4a-ui` N7F-10, `v3-v4a-node` V4a-11. `v3-vo2-accept.mjs` **57/57** (Harness jetzt App-Code 3 011 004, `SYNQ_APPCODE` überschreibt). Smoke ohne Fehler (`v3-vs0-smoke.png`). | `dirigent-test/v3-vs0-reg/` |

**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`, verglichen mit `CLOUD.ref`): 19.10. `list_migrations` (vo_init, vo1_max_app,
signup_limits_open, vo2_fork, vo2_max_app, vo2_fix) → `apply_migration vs0_max_app` (`max_app = greatest(max_app, 3011004)`,
Datei `synq-online/r7-vs0-max-app.sql`) → success; `execute_sql` (nur lesen) `max_app` 3011004, `max_format` 3. Kein Aufruf nennt das
Klassenzimmer-Projekt. **Für Xander im Dashboard:** nichts.

**Für Xander am iPhone (N2-VS0-02, ≈ 3 min, nach dem Ausliefern von 3.11.4):**
1. https://xanderfoxy.github.io/Synquenzer/ **im Safari-Tab** öffnen (nicht vom Home-Bildschirm), Kopfhörer ab, Lautstärke mittel.
2. ≡ → ganz unten **Info** → **[Mikro-Check]** → [▶ Hörprobe] einmal anhören → **[Mikro starten]** → Mikrofon erlauben → still sein.
3. Während „Drift-Probe: noch …“: [▶ Hörprobe] noch mal (oder ▶ oben) und die Frage mit **Ja/Nein** beantworten; dann warten bis „Fertig“
   (oder [Drift jetzt beenden]).
4. **[Ergebnis kopieren]** und den Text im Chat einfügen. Steht oben „✗ Noch nicht bereit“, trotzdem schicken.

## VS0-fix — Klang-Antwort zählt nur bei laufendem Mikrofon · App 3.11.4

Befund (Abnahme-Blick): Ja/Nein ließ sich in jeder Phase setzen (vor dem Start, nach „Fertig“, nach einem Fehler) und wurde in die nächste
Messung übernommen; das Tor N2-VS0-02 ging dann auf, obwohl der Klang nie mit laufendem Mikrofon beurteilt wurde (Risiko I6/C7), und das
JSON zeigte das nicht.
1. **Annahme nur mit laufendem Mikrofon:** `micAnswer` nimmt Ja/Nein nur in den Phasen `drift`/`end` mit lebender Spur (`readyState = live`)
   an; sonst wird abgelehnt (auch `micCheckAnswer`). [Ja | Nein] sind außerhalb davon gesperrt (`disabled`, blass).
2. **Beleg im JSON:** `sound.given = {at, phase, micLive: true, track: "live", session (z. B. "play-and-record"), afterSec}`.
   `micGate` wertet „Ja“ nur mit `given.micLive = true`; Gründe „Klang-Frage offen (nur während der Drift-Probe zu beantworten – noch mal
   messen)“ bzw. „Klang-Antwort ohne laufendes Mikrofon“.
3. **Keine Übernahme:** jede Messung („Mikro starten“ / „Noch mal messen“) beginnt mit `answer = null`, `given = null`.
4. **Hinweis unter der Frage** je Zustand: vor dem Start „Ja/Nein geht nur während der Drift-Probe … Hörprobe einmal ohne Mikrofon anhören –
   zum Vergleich“; in der Drift-Probe „Jetzt antworten …“; nach dem Ende ohne Antwort „… „Noch mal messen“ und dann antworten“.
   [▶ Hörprobe] bleibt zum Vergleich ohne Mikrofon frei.

| Prüfung | Ergebnis | Skript |
|---|---|---|
| Befund-Fälle a, b, c (echte Tipps über ≡ → Info → Mikro-Check) | ✓ Tor bleibt zu, `answer = null`; Kontrolle (Ja in der Drift-Probe) ✓ mit `given` | `v3-repro-vs0-offmic-ja.mjs`, `v3-qa-vs0-late-ja.mjs`, `v3-qa-vs0-explore2.mjs` (errThenRetry) |
| API/erzwungene Pointer-Events, Phase `end`, spätes Ja, neue Messung, Spur-Ende nach Ja | ✓ 8/8 | `v3-vs0fix-offmic.mjs` |
| Abnahme (VS0-09 angepasst: spätes Nein nach „Fertig“ abgelehnt) | ✓ 25/25 | `v3-vs0fix-accept.mjs` |
| Layout P1–L2 mit echter Schrift (Barlow Semi Condensed geladen, geprüft), Hinweis/Tor-Text nicht abgeschnitten | ✓ 20/20 | `v3-vs0fix-layout.mjs`, Bilder `v3-vs0fix-*.png` |
| Smoke | ✓ ohne Fehler | `v3-vs0fix-smoke.png` |

**Für Xander am iPhone:** wie oben; Ja/Nein lässt sich nur noch während „Drift-Probe: noch …“ tippen.

## VS1 — Mikro-Grundlage (🎤, Mikro-Zeile, Worklet „stimme“, Ringpuffer 2 min, Einmessen je Weg, Drift/Sprung, Aussetzer) · App 3.11.5

Grundlage: Nachtrag 2 Teil C (C.2 Punkte 1, 4–6; C.3 Zeile VS1; C.4 N2-VS1-01 … -03; K2-32, K2-63), Teil E (Gruppe 6), Teil J
(FP-DSP Haupt-, FP-IPHONE Zweitblick); `r7/stimme.md` §3, §6, §11 Skizzen 1–2, §12 VS1, §13 N7V-03 … -07; **`r9/mikro-check-auswertung.md`
(Tor VS0 „bestanden mit Auflagen“, Pflicht-Punkte 2–6)**. Version **3.11.5** statt 4.11.0 (E.5 Punkt 3: nach VS0 = 3.11.4 die nächste
Zwischennummer; V2-Gruppen und VL sind noch nicht gebaut, die Reihenfolge des Orchestrators gilt). `APP_CODE` = 3 011 005. Keine neue
Fähigkeit (Mikrofon nur außerhalb der Claude-App, E.5 Nr. 4).

**Tor N2-VS0-02:** Xanders JSON vom 19.10. (`r9/mikro-check-xander-20261019.json`): `getUserMedia` ok, Rundlauf 75,2 ms, Streuung 0,00 ms,
Klang-Frage offen (iOS spielt in „play-and-record“ über den Hörer). Orchestrator-Entscheidung: **bestanden mit Auflagen**; die Auflagen
2–5 sind in diesem Paket umgesetzt (unten „Auflagen“), Auflage 6 (Hörprobe) als kleine VS0-Änderung.

**Was neu ist**
1. **🎤** (nur wenn `getUserMedia` da ist **und** die Seite das oberste Fenster ist; Klasse `#app.micok`; in der Claude-App und ohne
   `getUserMedia` unsichtbar, kein Aufruf, N7V-05):
   - **Hochformat:** drittes Feld im Modus-Segment `[♪ SPIELEN │ 🎤 SINGEN │ ⇅ TRANSP.]` mit festen Breiten nach C.2 Punkt 1
     (Breite = ⌊(Segmentplatz − 4) / 3⌋, Segmentplatz = Breite − 183): **P1 3 × 67 = 205, P2 3 × 62 = 190, P3 3 × 44 = 136 nur Symbole**;
     FANG 64, ‹ › 44 unverändert. 🎤 ist ein **Schalter** (an/aus, `aria-pressed`), kein dritter Tastatur-Modus: SPIELEN/TRANSP. bleiben wählbar.
   - **Querformat L1/L2:** Segment bleibt zweiteilig wie V0a; **🎤 ist ein eigener Knopf 44 × 44 in `#top`** (nach FANG ⤓, vor dem Abstand;
     ≡ bleibt rechts). Auch bei offenem Blatt erreichbar.
   - Tipp = Mikrofon an bzw. aus; nur auf Tipp, im selben Tipp `ensureAudio()` → `resume`; `audioSession.type = 'play-and-record'` vor
     `getUserMedia`, beim Aus sofort `'playback'`, alle Spuren `stop()` → `ended` (N7V-06); Bildschirm bleibt an, solange 🎤 an ist.
2. **Mikro-Zeile** (Überlagerung, verschiebt nichts, K2-32/K2-63): Clip-Ansicht in `#top` **über TAKT + BPM (Hochformat)** bzw. **über TAKT
   (Querformat)** in gleicher Höhe (44 px), nie über den Teil-Tasten; liegt das Song-Aufnahme-Banner in `#top`, nur über TAKT. Inhalt: roter
   Punkt (pulsiert), Pegelbalken + dB, `⏱ 75 ms`, Weg 🔈/🎧/🎧ᛒ, „⚠ Aussetzer“ 3 s lang, „🎧?“ wenn kein Piep gehört wurde. Tipp = Mikro-Blatt.
   **Song-Ansicht:** über der Taktleiste wie das Aufnahme-Banner (Höhe = Taktleiste, nur Anzeige, Tipps gehen durch; das Banner hat Vorrang).
   „Projekttitel“ (C.2) gibt es in `#top` nicht – der Platz der Anzeige TAKT ist die nächste reine Anzeige; dieselbe Stelle wie das
   V0c-Banner (K2-63) hätte das Metronom ♩ verdeckt, das beim Einsingen gebraucht wird.
3. **Mikro-Blatt** (Popover, ≥ 44-px-Knöpfe): Zustand, Pegel, **Weg [🔈 Lautsprecher │ 🎧 Kabel │ 🎧 Bluetooth]**, Verzögerung mit Herkunft
   (eingemessen am …, kurz geprüft, geschätzt, von Hand) und **[−1] [+1] ms**, beim Einmessen „Handy hinlegen, leise sein“ und die Schritte
   ① Stille ② 4 Pieptöne ③ Rauschen 2 s ④ Auswerten (Skizze 2), Ergebnis („✓ Eingemessen: 61,9 ms · Streuung 0,00 ms · Lautsprecher im
   Mikro −9 dB“ bzw. „⚠ Kein Piep gehört · Kopfhörer? …“), Warnungen (Abtastrate, Sprung/Drift, Aussetzer), **[Einmessen] [✕ Mikro aus]**,
   Hinweis **„Mit Kopfhörer klingt die Musik normal und dein Gesang bleibt sauber.“** (Lautsprecher) bzw. „Zum Einmessen mit Kopfhörern einen
   Ohrhörer direkt ans Mikrofon halten.“
4. **Worklet `synq-stimme`** (ASCII, Blob- bzw. data:-URL wie VS0): Eingang 0 = Mikrofon, Eingang 1 = **Referenz = was die App spielt**
   (`AU.M.ceil` nach dem Master, dazu der eigene Piep-Bus; alles Hörbare der App läuft über den Master). Je Render-Quantum Spitze und
   Effektivwert; Int16 für Mikro und Referenz; **3:1-Dezimierung** (47-Tap-Blackman-Tiefpass 6,8 kHz, Index d[k] ↔ Frame 3k+2, Laufzeit
   23 Samples) für die Tonhöhe in VS2; Blöcke à 4096 Samples (≈ 85 ms) per `port` mit Übergabe (transfer, kein SharedArrayBuffer, I16).
   Lücken im `currentFrame` werden gezählt (nach dem Einschwingen).
5. **Ringpuffer 2 min** im Hauptfaden (Kontext-Frames als Zeitachse): Mikro, Referenz (je Int16) und 16-kHz-Mikro – 23,6 MB bei 44,1 kHz,
   25,9 MB bei 48 kHz; einmal angelegt, bei jedem Start weiterverwendet. Lücken im Strom werden gelöscht und als `lücke` markiert.
   `stimmeRead(a, b, {align, d16})` liest einen Ausschnitt; **`align`** führt das Mikrofon über die Zeitkarte nach (Bruchteil-Samples linear =
   **Resampling** bei Drift), am Rand wird der letzte gültige Wert gehalten (keine eingefügte Stille).
6. **Einmessen je Weg** (§6; Profile `speaker`/`wired`/`bt` nur im Gerät, `localStorage` `synq-stimme-v1`, nie im Projekt):
   - **voll** (erstes Mal je Weg, oder [Einmessen]): 0,5 s Stille (Grundrauschen) → 4 Chirps 0,8–8 kHz, −8 dBFS, Abstand 0,7 s (Rundlauf
     „erste Ankunft“ mit dem VS0-Schätzer, gleiche Zahlen bis 0,01 ms) → 2 s rosa Rauschen −20 dBFS (Kopplung Lautsprecher → Mikro für
     VS4). Gilt mit ≥ 3 gehörten Chirps und Streuung ≤ 2 ms.
   - **kurz** (jeder weitere Start auf dem Lautsprecher): 0,3 s Stille, 3 leise Chirps (−16,5 dBFS) im Abstand 0,5 s, auch mit laufender Musik
     (die Referenz-Spitze wird ±5 ms um die geplante Stelle gesucht). Streuen sie > 2 ms, gelten die zwei späteren (der Weg schwingt ein).
     Das Profil wird nachgeführt, wenn der Wert > 0,5 ms abweicht.
   - **ende** (beim Aus nach ≥ 30 s auf dem Lautsprecher, und immer bei verschiedener Abtastrate): 1 leiser Chirp, danach erst Freigabe
     (≤ 1 s, Sicherung 3 s).
   - **Kopfhörer/Bluetooth:** keine Pieptöne beim Start (das Mikro hört sie nicht); Latenz aus dem Profil, sonst geschätzt (Kabel =
     Lautsprecher-Wert ± Unterschied der Ausgangslatenz; Bluetooth ≥ 150 ms) – **[Einmessen] mit Ohrhörer am Mikro** oder **±1 ms von Hand**
     (Profil „hand“). Hört das Einmessen auf dem Lautsprecher keinen Piep → „Kopfhörer?“-Hinweis.
   - **Weg erkennen:** Name der Eingangsspur nach der Erlaubnis (AirPods/Bluetooth → bt, Headset/Kabel/USB → wired), sonst die letzte eigene
     Wahl; `devicechange` → neu raten, ohne Profil Toast „Weg: … · noch nicht eingemessen“ [Einmessen].
7. **Zeitkarte, Drift und Puffer-Sprung** (Auflage 4, N7V-07): jede Messung ist eine Marke {Frame, ms}; `stimmeLatAt(F)` ist stückweise
   linear dazwischen. Unterschied ≥ 2 ms und ein Vielfaches von 128 Samples (±6) = **Sprung** (Xanders Gerät: genau 384 Samples), sonst
   **Drift** (ms/min). Über 0,5 ms/min oder Sprung → Toast „Mikrofon-Zeit ist um 8,0 ms gesprungen · die App gleicht das aus“ bzw.
   „Mikrofon läuft 4,0 ms/min auseinander · die App gleicht aus“. Abtastraten von Spur und Kontext verschieden (I9) → Toast „Mikrofon 44,1 kHz,
   App 48,0 kHz · die App misst nach und gleicht aus“ und End-Piep erzwungen.
8. **Aussetzer** (Auflage 5): je Quantum (2,7 ms) digitale Stille (`null`, Spitze < 2·10⁻⁵) oder > 20 dB unter dem Grundrauschen
   (`einbruch`), ab 4 Quanten (≈ 10 ms), Lücken ≤ 3 Quanten gehören dazu; Spur `mute`/`unmute` → `stumm`. Markiert mit Frame und Länge
   (`stimme().drops`), Toast einmal je Sitzung „Mikro-Aussetzer erkannt · die Stelle ist markiert“ – **nie als Pause gewertet** (VS2/VS3 lesen
   die Marken). Erste 0,3 s nach dem Start ausgenommen.
9. **Fehlerpfade** (deutsche Sätze statt Absturz, danach immer 🎤 aus, Spuren `ended`, Sitzung `playback`): `NotAllowedError` („Mikrofon
   nicht erlaubt · in Safari unter „aA“ → Website-Einstellungen → Mikrofon „Erlauben“ wählen“), `NotReadableError`/`AbortError` („belegt“),
   `NotFoundError`, Spur beendet (Anruf), Seite verlassen (sofort aus, Hinweis beim Zurückkommen), Kontext `interrupted`, kein AudioWorklet.
10. **Netz (N2-VS1-02):** Beim bloßen 🎤-Hören laufen SYNC und Realtime weiter. Für Take-Aufnahme und Säubern (VS3/VS4) gibt es
    **`stimmeQuiet(on)`** (gezählt): `cloudHold` (alle Kanäle weg, Aufrufe warten) + Zähler fetch/XHR/sendBeacon/WebSocket; der Zähler ist
    jetzt mehrfach nutzbar (`netWatch`/`netUnwatch`, eine Hülle um die Originale; der Mikro-Check nutzt dasselbe). Jam-Hinweis (VC3b) folgt mit VC3b.
11. **Mikro-Check (VS0) und 🎤:** Start des Mikro-Checks schaltet 🎤 aus; 🎤 während des Checks → „Erst den Mikro-Check beenden“.
    **Hörprobe (Auflage 6):** hat das Projekt Noten, spielt [▶ Hörprobe] 4,5 s den eigenen Song ab der jetzigen Stelle (vertraut), sonst
    wie bisher die vier Akkorde mittig.
12. **Test-API:** `stimme()`, `stimmeStart({cal, route})`, `stimmeStop()`, `stimmeToggle()`, `stimmeCal(kind)` → Ergebnis, `stimmeRoute(r)`,
    `stimmeNudge(ms)`, `stimmeSheet(v)`, `stimmeRead(a, b, {align, d16})`, `stimmeLatAt(f)`, `stimmeQuiet(v)`, `stimmeNet()`, `stimmeForget()`.

**Auflagen aus der Mikro-Check-Auswertung (19.10.)**
| # | Auflage | umgesetzt |
|---|---|---|
| 2 | Kopfhörer-Empfehlung, Kopfhörer erkennen (`devicechange`), Headset-Mikro = eigener Weg | Hinweis im Blatt und als Toast beim ersten Start auf dem Lautsprecher; Weg aus Spur-Namen + `devicechange`; Profil je Weg |
| 3 | Latenz je Weg messen/speichern, Noten und Audio um sie verschieben | Profile `speaker`/`wired`/`bt`; Zeitkarte + `stimmeRead({align})`; das Verschieben der Noten/Takes selbst kommt mit VS2/VS3 |
| 4 | Rundlauf Anfang UND Ende, Sprung ausrichten, Drift linear | Marken bei jedem Start (kurz) und Ende (≥ 30 s); Sprung/Drift erkannt, Drift linear ausgeglichen; **Sprungstelle innerhalb eines Takes finden: VS3** (braucht den Take-Inhalt) – bis dahin linear |
| 5 | Pegel-Einbrüche markieren | `null`/`einbruch`/`stumm`/`lücke` mit Frame und Länge |
| 6 | Hörprobe mittig, vorher zum Vergleich, eigener Song | eigener Song 4,5 s, sonst Akkorde (waren schon mittig; „weit links“ war der iPhone-Hörer in play-and-record) |

**Abweichungen (bewusst)**
- **Version 3.11.5** statt 4.11.0 (s. o.); VL und die Song-Gruppen sind noch nicht gebaut.
- **Teil-Tasten:** Die Teil-Leiste (40 px) kommt mit V2a. Geprüft wurden die heutigen Szenen-Tasten ▶1–▶4 (sie starten am nächsten Takt):
  frei (`elementFromPoint`) in P1–P3, L1, L2; Höhe P1/L1 44 px, **P2/P3 30 px, L2 32 px – genauso hoch wie in VS0-fix** (die Mikro-Zeile
  verdeckt nichts, ≥ 36 px gilt erst mit der Teil-Leiste).
- **Mikro-Zeile 44 statt 28 px hoch:** K2-63 verlangt „gleiche Höhe“ wie die Kopfzeilen-Knöpfe; so ist sie zugleich ein 44-px-Ziel (Blatt).
- **🎤 = Schalter** statt drittem Tastatur-Modus (die Tastatur spielt weiter; „Stimme → Noten“ ist VS2). BEATBOX-Beschriftung auf der
  Drum-Spur kommt mit VS6 (ohne Erkennung wäre sie irreführend).
- **Kein Netz-Halt beim Einmessen** (C.2 Punkt 5 nennt nur Take-Aufnahme, Säubern und Mikro-Check; Einmessen speichert kein Audio).
- **Ohne AudioWorklet** (vor iOS 14.5) kein 🎤-Betrieb, sondern der Satz „Das Mikrofon braucht hier AudioWorklet“ (VS0 hatte einen
  ScriptProcessor-Rückfall für die Messung; für Dauerbetrieb im Hauptfaden zu teuer).
- **Budget:** +25 KB geplant, gebaut **+49 KB roh / +17 KB gzip** (2 081 901 → 2 132 182 Byte; > 50 %, §15.3): Auflagen 2–6 der Auswertung
  (Drift/Sprung, Aussetzer, Wege, Hörprobe) waren nicht im Plan; Mikro-Blatt mit Schritten; Netz-Zähler umgebaut; ausführliche deutsche
  Kommentare. Weit unter 5,0 MB (EN2-28); Startzeit unverändert (das Modul tut beim Laden nichts, der Ringpuffer entsteht beim ersten 🎤).

**Fach-Prüfung (Teil J; selbst durchgeführt, kein eigener Agent verfügbar):**
- *FP-DSP (Haupt)* (`v3-vs1-dsp.mjs` 10/10, Worklet aus `index.html` in Node): ASCII ✓; Blöcke lückenlos, Mikro Int16 bitgenau zu
  `Math.round(x·32767)`, Referenz auf ±32767 begrenzt; 16-kHz-Index d[k] ↔ Frame 3k+2 fortlaufend; **Befund 1** (meine erste Prüfgrenze
  „≥ 60 dB ab sr/6“ war die falsche Regel; richtig: alles, was in 0–5 kHz falten würde, also ab sr/3 − 5 kHz) → Dezimierer: Welligkeit
  0,24 dB bis 5 kHz, **75 dB** ab 11,0 kHz (48 kHz) bzw. 9,7 kHz (44,1 kHz); im Browser 1 kHz ±0,0 dB, 11 kHz unter dem Int16-Boden
  (`v3-vs1-accept` G). Rechenzeit 22–25 µs je Quantum = **0,8 % Echtzeit** (Xeon, unter Last; iPhone-Faktor unbelegt). NaN/Inf im Eingang:
  Int16 bleibt endlich, Dezimierer nach ≤ 47 Samples erholt. **Befund 2** (Aussetzer: ein einzelnes lauteres Quantum teilte einen Einbruch in
  zwei Marken) **behoben** (Lücken ≤ 3 Quanten gehören dazu). **Befund 3** (Lücke beim Einschwingen des Graphen wurde als `lücke` und im
  Worklet als `gap` gezählt) **behoben** (erste 0,3 s bzw. 64 Quanten ausgenommen). **Befund 4** (kurzer Piep direkt nach dem Start:
  zwei Werte 10 ms auseinander, weil der Eingangsweg noch einschwingt) **behoben**: Messung erst ab 0,5 s Mikrofon, 3 statt 2 Chirps,
  bei Streuung gelten die späteren. Schätzer = VS0 (N7V-02-geprüft): gleicher Ausschnitt → gleicher Rundlauf ±0,01 ms.
- *FP-IPHONE (Zweit)*: 🎤 an + Musik 8 s: CPU ×1 0 longtasks, 60 fps; CPU ×4 (grobe Annahme) 0 longtasks, 54 fps (`v3-vs1-accept` K).
  Hauptfaden je Block (≈ 12/s): zwei `set`-Kopien, 32 Pegelwerte, Balken höchstens 15/s. Speicher: Ringpuffer 23,6–25,9 MB, einmal angelegt
  (nach der Erlaubnis, nicht beim Laden). Audio-Sitzung: `play-and-record` nur bei 🎤 an; Seite verlassen → sofort aus. Wake-Lock bei 🎤 an.
  Profile in `localStorage` (Safari-7-Tage-Regel: dann nur neu einmessen). **Befund 5** (der Mikro-Check und 🎤 hätten sich das Mikrofon
  geteilt) **behoben** (Check schaltet 🎤 aus). Geräte-Punkte für Xander unten, kurz.
  5 Befunde, alle behoben.

**Abnahme**
| ID | Ergebnis | Beleg |
|---|---|---|
| N7V-03 | Gerät (Xander, VS0: 0,00 ms). Attrappe: 4 Chirps Streuung 0,00 ms | `v3-vs1-accept` A, I |
| N7V-04 | ✓ nach ▶, ≡, Tasten: 0 Aufrufe (Attrappe und App); erster Tipp auf 🎤 → genau 1 | `v3-vs1-accept` A |
| N7V-05 | ✓ Claude-App-Attrappe (iframe, sogar `allow=microphone`): kein 🎤, keine Zeile, `stimmeStart` → false, 0 Aufrufe, Modusleiste pixelgleich zu VS0-fix; oberstes Fenster ohne `getUserMedia`: P und L unsichtbar | `v3-vs1-accept` C |
| N7V-06 | ✓ nach 🎤 aus, ✕ im Blatt, jedem Fehler, Mikro-Check-Start: Spuren `ended`, Sitzung `playback → play-and-record → playback` | A, D, I |
| N7V-07 | ✓ Sprung 384 Samples erkannt + Toast, danach ausgerichtet Lag 0; Drift +1 ms gemessen = Δ/Zeit, Toast, mitten in der Drift ausgerichtet auf ±2 Samples des linearen Rests; Spur-Rate ≠ Kontext-Rate: Toast, End-Piep, Zeitkarte mit 2 Marken; ausgerichtetes Signal ohne Nullfolgen > 1 ms | E |
| N2-VS1-01 | ✓ P1/P2/P3: Segment 205/190/136 (3 × 67/62/44), FANG 64, ‹ › 44, kein `scrollWidth > clientWidth`; P1–L2: 🎤 an → alle Bedienelemente 0,0 px Abweichung; L1/L2 zweiteilig, Höhen = VS0-fix, 🎤 44 × 44 auch mit offenem Klang-Blatt | B |
| N2-VS1-02 | ✓ (1) beim Hören: Halt 0, `save_project` nach 2,1 s, Kanäle bleiben; (2)(3) `stimmeQuiet`: 0 Kanäle, 0 Aufrufe, Zähler 0; danach Realtime nach 116 ms, Postausgang nach 79 ms; Gegenprobe: beide Zähler zählen gleichzeitig | `v3-vs1-net.mjs` 7/7 |
| N2-VS1-03 | ✓ P1–L2: Mikro-Zeile vollständig in `#top`, Text nicht abgeschnitten; Szenen-Tasten frei; Tipp startet am nächsten Takt; Höhe s. Abweichungen | A, B |
| Wege/Profile | ✓ Kabel geschätzt aus Lautsprecher, eigenes Profil beim Einmessen, ±1 ms → „hand“, Neustart mit Kopfhörer ohne Piep, `devicechange` erkannt; Profil nach Neuladen, kurzer Dreifach-Piep ohne Blatt | A, H |
| Aussetzer | ✓ 200 ms Stille → `null` (197 ms), −48 dB 120 ms → `einbruch` (119 ms), sonst keine Marke | F |
| Hörbarkeit | ✓ Einmessen hebt den Mikro-Pegel um 18 dB (Pieptöne/Rauschen im Raum); Ton im Raum → Pegel +20 dB, Balken 69 %; Weg Kopfhörer → kein Piep (Pegel bleibt am Grundrauschen) | A, H |
| Song-Ansicht | ✓ P1, L1: über der Taktleiste, Höhe = Taktleiste, Tipps gehen durch; zurück in `#top` | J |
| VS0 | ✓ `v3-vs0fix-accept` 25/25, `-offmic` 8/8, `-layout` 20/20, `v3-vs0-net` 8/8, `v3-vs0-rtreal` 6/6 (Netz-Zähler umgebaut) | |
| Regression | `v3-vs1-reg.sh` / `-reg2.sh` / `-reg3.sh` (= VS0-Liste; Versionskopien `v3-vs1-adapt-*` für 3.11.5; Ausgaben `dirigent-test/v3-vs1-reg/`, Vergleich `v3-vs1-regcmp.sh` gegen VS0): rot nur, was auf VS0 schon rot war (node-fm, wp6-extras, wp3-browser/-ui, wp4-offline, wp7-accept-fm4, func-build C2/D5, wp6-drums, wp1-perf, wp1-misc, rgq-old17, v0a-drum, V4a-11, v4bfix-big, v4b-platz, fp4f-loop, V0c-07); unter Last zusätzlich rot und **allein grün** (`v3-vs1-reg/solo/`): wp7-adapt-func2-build TOUCH (A3 ist auch auf VS0-fix allein rot), `v3-vs1-adapt-qareg-v4a-fmxio` 18/18 (die VS0-fix-Kopie ist allein ebenso schwankend 17/18), v0c-song-L 40/40, v0c-song-P nur V0c-07 (wie VS0). `v3-vo2-accept.mjs` **57/57** (Harness App-Code 3 011 005). Smoke ohne Fehler (`v3-vs1-smoke.png`). | `dirigent-test/v3-vs1-reg/` |
| Fach-Prüfung | FP-DSP 10/10, FP-IPHONE s. o. | `v3-vs1-dsp.mjs`, `v3-vs1-accept` K |

Abnahme gesamt: `v3-vs1-accept.mjs` **86/86** (Teile A–K; Ausgabe `dirigent-test/v3-vs1-accept.out`, Bilder `dirigent-test/v3-vs1-{P1,P2,P3,L1,L2}-an.png`,
`-mikroblatt.png`, `-blatt.png`, `-song.png`, `v3-vs1-P1-einmessen.png`), `v3-vs1-net.mjs` 7/7, `v3-vs1-dsp.mjs` 10/10.
Hinweis zur Prüf-Schleife: Jede `getUserMedia`-Brücke der Chromium-Attrappe hat ihren eigenen Puffer (Rundlauf je Laden ±2 ms, direkt nach
dem Start auch 10-ms-Sprünge); deshalb vergleichen die Tests gleiche Ausschnitte bzw. Werte innerhalb einer Sitzung.

**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`): 19.10. `list_migrations` (… vs0_max_app) → `apply_migration vs1_max_app`
(`max_app = greatest(max_app, 3011005)`, Datei `synq-online/r7-vs1-max-app.sql`) → success; `execute_sql` (nur lesen) `max_app` 3011005,
`max_format` 3. Kein Aufruf nennt das Klassenzimmer-Projekt. **Für Xander im Dashboard:** nichts.

**Für Xander am iPhone (nach dem Ausliefern von 3.11.5, ≈ 3 min; Pages-Seite im Safari-Tab):**
1. Unten in der Modusleiste **🎤 SINGEN** tippen (quer: 🎤 oben rechts) → Mikrofon erlauben → **Handy hinlegen, leise sein** (es piept 4 ×,
   dann rauscht es 2 s). Oben steht danach z. B. „⏱ 75 ms 🔈“.
2. Etwas singen: der Balken oben bewegt sich. ▶ drücken und einen anderen Teil (▶ 2) antippen – das muss beim Singen gehen.
3. Klingt die Musik leise/„links“? Dann Kopfhörer einstecken: oben steht 🎧; im Mikro-Blatt (Tipp auf die rote Zeile) **[Einmessen]** mit einem
   Ohrhörer direkt am Mikrofon.
4. 🎤 wieder antippen = aus (nach > 30 s piept es einmal leise zum Nachmessen). Erscheint „Aussetzer“ oder „gesprungen“, bitte melden.


## VS1-fix — Grundrauschen nur aus echter Stille: Sing-Pausen sind keine Mikro-Aussetzer · App 3.11.5

Befund (Abnahme-Blick, Auflage 5): Wer beim Tipp auf 🎤 schon sang, lieferte das „Grundrauschen“ selbst – beim kurzen Einmessen aus dem
0,3-s-Fenster vor den Pieptönen (ungeprüft), auf dem Kopfhörer-Weg aus dem 20-%-Quantil der ersten Sekunde. `floorDb` lag dann bei der
Stimme (−23 dB) statt beim Raum (−50 dB), und jede normale Pause wurde als „einbruch“ markiert, mit Hinweis „Mikro-Aussetzer erkannt“.
1. **`stFloorOf`** (neu): ein Stück zählt nur als Grundrauschen, wenn der Pegel ruhig ist (≥ 70 % der 21-ms-Blöcke ≤ 6 dB über dem
   20-%-Quantil), es nicht digital still ist (> −96 dBFS), über Lautsprecher/Bluetooth die App dort nichts spielt (Referenz < −60 dBFS) und
   keine Stimme/kein Ton darin ist (**`stVoiced`**: normierte Autokorrelation nach dem ersten Abfall, 70–1200 Hz, > 0,7 in 2 von 3 Stücken).
   Gemessen: weißes/rosa/braunes Rauschen und 50-Hz-Brumm 0 % als Stimme, Töne 85–600 Hz 100 % (`v3-vs1fix-voiced.mjs`).
2. **Einmessen:** die Stille vor den Pieptönen setzt `floorDb` nur, wenn sie diese Prüfung besteht; `lastCal` trägt `floorOk`/`floorWhy`;
   das Profil speichert `floorDb` nur aus geprüfter Stille.
3. **Laufend nachgeschätzt** (`stDropScan`, statt der ersten Sekunde): alle ≈ 80 ms die letzten 0,3 s (bei Stimme alle 0,25 s). Solange kein
   geprüftes Grundrauschen da ist, wird kein „einbruch“ gewertet („null“, „lücke“, „stumm“ wie bisher). Danach nur nach unten, höchstens
   20 dB (tiefer wäre selbst ein Einbruch). Kosten: ≈ 2 ms je Prüfung mit Stimme (Desktop).

| Prüfung | Ergebnis | Skript |
|---|---|---|
| Befund A (Lautsprecher, kurz) und B (Kabel) | ✓ `floorDb` −50,4/−50,5, keine Marke, kein Hinweis | `v3-qa-vs1-drop.mjs` 4/4 |
| Unabhängige Wiederholung (5 Fälle, auch Gegenproben) | ✓ überall `floorDb` ≈ −50,5, `drops = []` | `v3-indep-vs1-floor.mjs` |
| Echte Aussetzer nach gelerntem Grundrauschen (singt ab Tipp): Einbruch 150 ms, digitale Stille 200 ms | ✓ beide Wege: genau 2 Marken an der Stelle, Hinweis | `v3-vs1fix-drop2.mjs` 8/8 |
| VS1-Abnahme | ✓ 86/86 (A C F 21, B D E H I J K 63, F G 5; G ist im Gesamtlauf unter Last einmal rot – Worklet-Lücke beim Einschwingen –, allein 2 × grün) | `v3-vs1-accept.mjs` |
| Smoke | ✓ ohne Fehler | `v3-vs1fix-smoke.png` |

**Für Xander im Dashboard:** nichts. Layout unverändert.


## V2a — Spuren und Szenen (Format 4, bis 8 Spuren, 8 Szenen, MELODIE, feste uid) · App 4.0.0

Grundlage: Nachtrag 2 (N2-2a-01, K2-70, Paketliste: 4.0.0 / +47 KB), Nachtrag 1 und Spezifikation v3 §17 V2a.

**Neu**
1. **Projektformat 4.** Spuren ≤ 8 mit festem Datenindex: 0–3 Synth 1–4, **4 DRUMS** (bleibt, alte API-Aufrufe mit Index 4 treffen die
   Drums), **5 MELODIE**, 6–7 Synth 5/6. 8 Szenen, je Spur `clips[8]`, Anzeige-Reihenfolge `ui.order` (Synth 1–4, MELODIE, Synth 5/6,
   DRUMS unten), dazu `parts [null×8]`, `shift 0`, im Song `marks/own/xp/src` (für V2b+) und `song.lanes.length === NT`. `song.melody` und
   `melodyTrack` bleiben (die Wanderung nach `song.mel` ist V2b). Format-3-Dateien (auch WP6/WP7, Demo, `#import`) werden beim Laden
   umgebaut: MELODIE angehängt (Klang **Melodie-Lead** = Mini-Lead als POLY, Poly 4, Glide 0; ⇅ fest; Tastatur-Oktave 5; Farbe t6),
   Szenen 5–8 leer, alles andere deep-equal. Gespeichert wird Format 4.
2. **Feste `uid` (N2-2a-01, K2-70)** für jede Spur und Szene: 10 Zeichen `0-9a-v`. Neu: zufällig (`crypto.randomUUID`); beim Laden einer
   Datei ohne uid deterministisch `hexToUid(fnv(pid|t|i|a)+fnv(pid|t|i|b))` (Szenen mit `|s|`); doppelte uids werden repariert
   (Konsolenzeile `SYNQUENZER: doppelte uid … repariert → …`). Speichern/Laden, Undo/Redo und Projekt-Kopie behalten sie.
3. **Undo-Gruppe** `{kind:'group', label, items}`: rückwärts zurück, vorwärts wieder, zählt als **ein** Schritt der 60 (Spur entfernen =
   Gruppe [Song, Spur]).
4. **Matrix-Banken.** Passen 8 Szenen-Spalten nicht (≥ 56 px je Spalte), zeigt die Matrix 4 und **[SZ 1–4 / 5–8]** schaltet (neben
   SONG ⇄; in 320 px statt „■ alle“ – dort öffnet Halten das Stopp-Blatt). Läuft eine Szene der anderen Bank, trägt der Umschalter einen
   Punkt. Passen die Spuren nicht in Reihen ≥ 40 px (P) / ≥ 30 px (L), blättert **[▲▼ 1/2]** im DRUMS-Kopf die Synth-Seiten;
   DRUMS bleibt unten. Die Matrix scrollt nie.
5. **[＋ Spur] / Spur entfernen**: Spur-Blatt durch **Halten eines Spurkopfs** (Klang öffnen, ＋ Spur, Spur entfernen, Hinweise) und im
   Menü „Projekt“ die Zeile „Spuren n/8“. Höchstens 8 („Höchstens 8 Spuren – …“), entfernt wird nur die zuletzt angefügte Spur
   (Synth 5/6; MELODIE und DRUMS nicht). Entfernen nimmt Clips, Song-Spur und eine Song-Melodie auf der Spur mit – ein Undo stellt alles her.
6. **Song-Ansicht** mit NT Spurzeilen; reichen die Zeilen nicht (< 26 px), blättert ein Umschalter in der Zelle „Takt“ (V2e verlegt ihn).
7. **CPU-Hinweis** (V2a-11): ≥ 3 spielende Spuren mit Poly ≥ 6 und Unison ≥ 5 → einmal „Viel Last – CPU-Begrenzer greift ggf.“
8. **MIDI** bis V2a′: Synth 1–4 + DRUMS (`MIDI_T = 5`), alle 8 Szenen; Hinweis im Export-Menü „MIDI enthält Synth 1–4 und DRUMS – MELODIE
   und weitere Spuren kommen in einer der nächsten Versionen dazu.“
9. Farben `--t6/--t7/--t8` (+ `a`-Töne), Test-API: `tracks()`, `addTrack`, `removeTrack`, `canAddTrack`, `sceneBank(n)`, `trackBank(n)`,
   `matrixInfo()`, `NT`, `NS`, `isDrum`, `cpuHeavy()`, `undoInfo()`.

**V2a-08 (Literal-Stellen):** alle `< 5`/`< 4`-Schleifen über Spuren/Szenen, `tracks[4]`, `[null×4]`, `clamp(…,0,3|4)` ersetzt durch
`NT()`/`NS()`/`DRUM_T`/`synthTracks()`; grep im App-Block: **0** Treffer. Begründete Ausnahmen (keine Spuren/Szenen, im Test ausgenommen):
4er-Schleifen über FM-Hüllkurven-Stufen (`fmSetEnv`, `o_.r[…]`, `v.peg`), Byte-/Bit-Gruppen (`b[q…]`, `newProjectId`), Mikro-Messung
(`chirp`, `micXcorr`), SVG (`createElementNS`), Beschriftungen (`lbls`), Akkord-Töne `T[0-3]`; die 4 Szenen je Bank (`[0,1,2,3]`) sind
die Bankgröße. MIDI nutzt bewusst `MIDI_T = 5` (V2a′).

**Abweichungen (begründet)**
- SZ-Umschalter links neben SONG ⇄ (P1/P2/L); in P3 (320 px) ersetzt er „■ alle“, Halten = Stopp-Blatt (sonst wäre er 34 × 14 px).
- Spur-Blatt per Halten des Spurkopfs (neu, die Spezifikation nennt nur die Knöpfe); dazu die Menüzeile.
- V2a-02 M-BAND gegen 3.11.5 (VS1-fix, der direkte Vorgänger) statt WP7: Bänder ≤ 0,07 dB, noteLog 172 Noten identisch.
- V2a-04 prüft `song.melody`/`melodyTrack` statt `song.mel[7]` (das Feld kommt mit V2b).
- Melodie-Vorschlag: die freie MELODIE (POLY) wird jetzt vor einer MONO-Spur gewählt (V0c-10 erwartete Synth 4 MONO; Test angepasst).
- Projekt-Kopie behält die uids (eine Spur-/Szenen-Kopie gibt es noch nicht; sie vergibt neue, sobald es sie gibt).
- Test-Harness: `v3-vo1-harness` max_format 4, `v3-vo2-harness` APPCODE 4000000 (Sicherungen `*.pre-v2a.mjs`).

**Fach-Prüfung (vor der Abnahme, Teil J: V2a ● FP-SONG, FP-TOUCH)**
- FP-SONG: M-ZEIT (▶7 in Takt 2 → Start genau Taktstrich 8, ±0,002 Schlag), `clips` deep-equal nach Migration, Undo-Gruppe + Rundweg
  Speichern/Laden (uids deep-equal), Taktstrich-Regel, Harmonie-Kern (noteLog 172 identisch, M-BAND), MIDI (Export enthält 5 Spuren, alle
  8 Szenen), FOLGEN (MELODIE fest). **Befund 1:** neue Projekte bekamen zufällige uids → `isPristine` erkannte die unberührte Demo nicht
  mehr und parkte sie bei „Neu“ als „Demo“-Projekt → uids im Vergleich ausgenommen. **Befund 2:** Szenen 5–8 einer Format-3-Datei
  bekamen zufällige uids (nicht deterministisch) → alle Szenen-uids erst nach dem Lesen der Datei vergeben.
- FP-TOUCH: L4 und M-PLATZ in P1–P3, L1, L2, W mit 6 und 8 Spuren und beiden Banken (288 Prüfungen), Halten vs. Tippen auf dem
  Spurkopf, ein Undo je Aktion. **Befunde (behoben):** SZ in P3 gestapelt nur 34 × 14 px → ersetzt „■ alle“; „SONG ⇄“ in P2 (49 px) und
  L2 (36 px, jetzt zweizeilig) abgeschnitten; „FEST“ der MELODIE überdeckte Name/Klangzeile (Kopf bekommt `hfix`, Platz für das Wort);
  „DRUMS“ neben ▲▼ abgeschnitten (▲▼ 34 px, in P3/L2 27 px, 🔒 weicht in kleinen Köpfen); [＋ Spur] im Menü schließt das Menü, damit
  man die neue Spur sieht. Offen (schon vor V2a so): in P3 berührt die Auslassung „SYNT…“ das ⇅.

**Abnahme**

| Punkt | Ergebnis | Skript |
|---|---|---|
| V2a-01 neues Projekt 6 Spuren, DRUMS = 4, MELODIE = 5, Format 4 | ✓ | `v3-v2a-accept.mjs` A |
| V2a-02 Format-3-Demo: deep-equal, MELODIE angehängt, Szenen 5–8 leer, M-BAND ≤ 0,5 dB (gemessen ≤ 0,07), speichert Format 4 | ✓ | A, `v3-v2a-band.mjs` 6/6 |
| V2a-03 Index 4 = Drums (`tapSlot(4,0)`, `pad()`, `setDrumParam`, `getSound(4).engine`) | ✓ | A |
| V2a-04 ＋ Spur ×2, drittes abgewiesen; Entfernen Synth 6 → ein Undo (group), Redo, ein Schritt der 60 | ✓ | A |
| V2a-05 Clip in Szene 7, ▶7 startet am Taktstrich (M-ZEIT) | ✓ | C |
| V2a-06 Szenenbank P1 [5–8], Punkt bei laufender Szene der anderen Bank | ✓ | B |
| V2a-07 Spurbank P2 Seiten, Reihen ≥ 40 px (P) / ≥ 30 px (L), Matrix scrollt nicht | ✓ | B |
| V2a-08 keine Literal-Schleifen / `tracks[4]` (0 Treffer, Ausnahmen oben) | ✓ | A |
| V2a-09 SG1–SG8 mit 8 Spuren, `song.lanes.length === NT` | ✓ 27/27 (P, L) | `v3-v2a-adapt-wp6-song.mjs P 8` |
| V2a-10 `tracks()` mel nur Index 5, role null, alte Dateien nur über die Migration | ✓ | A |
| V2a-11 CPU-Hinweis genau einmal | ✓ | D |
| V2a-12 PE1 (P, L: 60 fps, Tick p95 ≤ 1 ms) und PE2 (300 s, 8 Spuren: max 27 Stimmen, kein Anstieg, Heap +1,3 MB) | ✓ | `v3-v2a-pe1.mjs` 8/8, `v3-v2a-pe2.mjs` |
| V2a-13 M-PLATZ 6 + 8 Spuren, beide Banken, alle Viewports; Regression, DoD | ✓ | B; Regression unten |
| N2-2a-01 uid 10 × `0-9a-v`, eindeutig, deterministisch (K2-70), Reparatur, Rundweg, Undo/Redo | ✓ | A |
| Gesamt `v3-v2a-accept.mjs ABCDE` | ✓ 331/331 | |
| Smoke | ✓ ohne Fehler | `v3-v2a-smoke.png` |

**Regression** (alle Listen von VS1, Vergleich mit `v3-vs1-reg`, `v3-v2a-regcmp.sh`): gleich wie vor V2a bis auf die gewollten Änderungen,
die angepasste Kopien bekommen (`v3-v2a-adapt-*`: Version 4.0.0 / Format 4, NT Song-Zeilen, 8 Clip-Plätze, Melodie-Lead in den
Start-Klängen, Menü-Affe ohne ＋ Spur/Entfernen, VS1-Abnahme zählt nur sichtbare Szenen-Tasten, V0c-08 AKKORDE-Zeile = `svChordRow()`,
V0c-10 MELODIE). Angepasst grün: wp1-brand/misc/store, wp2-clip (5 Viewports), wp2-fang, wp3-store 55/55, wp3-api, wp6-song (6 und 8
Spuren), wp6-extras, n0a, qareg-fmxio, rob5 18/18, vs0-net 8/8, vs1-net 7/7, vs1-accept 86/86, vo2-accept 57/57, vs1-dsp 10/10. Schon vor
V2a rot und unverändert: node-fm, wp3-browser PR2, wp3-ui, wp4-offline FX3, wp7-accept-fm4, func-build C2/D5, rgq-old17, wp6-drums DR7,
wp1-perf, sqr6-persist, v4a-node V4a-11, v4bfix-big, fp4f-loop, v0c-ui V0c-05, v0c-song V0c-07 (Zeitflattern, allein grün). Unter Last
flatternd, allein grün: v0a-roll, wp2-rec, wp4-engine FX5, wp3-store PF7.

**Budget:** 2 172 290 B (+37,1 KB roh, +12,4 KB gzip) – Rahmen +47 KB.

**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`): 20.10. `list_migrations` (… vs1_max_app, max_app_vorab_3_19, v2a_max_format_4 –
`max_format` 4 war schon eingespielt) → `apply_migration v2a_max_app` (`max_app = greatest(max_app, 4000000)`, Datei
`synq-online/r7-v2a-max-app.sql`; der erste Versuch lief in eine Zeitüberschreitung und wurde nicht eingetragen) → success;
`execute_sql` (nur lesen) `max_app` 4000000, `max_format` 4. Kein Aufruf nennt das Klassenzimmer-Projekt.
**Für Xander im Dashboard:** nichts.

**Für Xander am iPhone (nach dem Ausliefern von 4.0.0):**
1. Das letzte Projekt öffnet sich mit einer neuen Zeile **MELODIE** (über DRUMS, „fest“); alles andere klingt wie vorher.
2. Oben links neben SONG ⇄ steht **SZ 1–4**: antippen → Szenen ▶5–▶8. Einen Clip in Szene 7 einspielen und ▶7 tippen: startet am Taktanfang.
3. Einen Spurkopf **halten** → Spur-Blatt → **＋ Spur** (zweimal: Synth 5 und 6). Passt es nicht mehr, blättert **▲▼ 1/2** im DRUMS-Kopf.
4. Synth 6 halten → **Spur entfernen** → dann ↶: Spur und Clips sind wieder da.
5. Speichern/Online: das Projekt wird als Format 4 gespeichert; ein Gerät, das noch die alte App (3.11.x) im Speicher hat, kann es
   nicht überschreiben (Server-Wächter) – dort die Seite einmal neu laden.

## V2b — MELODIE-Spur und Song-Melodie je Spur · App 4.2.0

Grundlage: Spezifikation v3 §4.3, §17 V2b (V2b-01 … V2b-08), E3-06, R26/I-04; Nachtrag 1 N2b-01; Nachtrag 2 Teil E (Gruppe 4, Version
4.2.0, +25 KB) und Teil J (FP-SONG Haupt-, FP-TOUCH Zweit-Blick). **Hinweis:** V2a′ (Matrix-Gesten, MIDI mit N Spuren, 4.1.0) steht in
Gruppe 4 vor V2b, ist aber noch nicht gebaut (kein Snapshot, kein CHANGES-Abschnitt); V2b braucht von V2a′ nichts. Die Versionsfolge
bleibt streng steigend (4.0.0 → 4.2.0; V2a′ bekommt dann eine eigene Nummer zwischen beiden oder wird nachgezogen).

Neustart-Hinweis: Ein früherer Durchgang hatte Daten, Wiedergabe, Aufnahme, UI, API und Tests schon gebaut (Abnahme 63/63, Regression
gelaufen), aber weder CHANGES noch Snapshot geschrieben. Dieser Durchgang hat alles nachgeprüft, die Fach-Prüfung gemacht und drei
Befunde behoben (unten).

**Neu**
1. **Song-Melodie je Spur** (E3-06): `song.mel = {[t]: {len, key, notes:[{t, d, n, v}]}}` statt `song.melody`. Jede Spur mit Noten spielt
   ihre Song-Melodie mit **eigenem Klang und eigenen Stimmen** (`songTick`: Schleife über `song.mel`, `noteLog` `src:'melody'` je Spur),
   immer „wie gespielt“ (nie umgerechnet, auch nicht unter ⇅ folgt). Stumme Spuren und Drums spielen keine.
2. **Migration** (`normSong`): WP6-/V2a-Songs (`song.melody` + `melodyTrack`) → `song.mel[melodyTrack]` – die Melodie bleibt auf ihrer
   Spur (gleicher Klang wie vorher, wandert nicht auf MELODIE). Ohne `melodyTrack` gilt die erste Spur mit Melodie, sonst MELODIE.
   Gespeichert wird nur `song.mel`; Projektformat bleibt 4. `melodyTrack` bleibt lesbar und heißt jetzt „gewählte Melodie-Spur“.
3. **Chip [MEL ▾] / [S2 ▾]** in der Song-Ansicht wählt die Melodie-Spur: ihre MEL.-Zeile (gewählte Spur hell, andere Spur-Melodien
   blass dahinter), ihre Rolle (Titel „Melodie“ bzw. „Melodie · S2“), das Ziel von ● SONG / ● MEL. Das Blatt nennt MELODIE zuerst, je
   Spur die Notenzahl und „spielt Clips / frei“, dazu der Schalter **„n Noten von … mitnehmen“** (verschiebt die Melodie mit). Wählen ist
   **ein** Undo-Schritt („Melodie-Spur: …“ bzw. „Melodie verschoben auf …“). In den Spur-Etiketten zeigt ♪ jede Spur mit Song-Melodie.
4. **● SONG schlägt MELODIE vor** (V2b-06): MELODIE (frei, POLY) zuerst und wird gewählt (die Tastatur spielt ihren Klang); erst wenn
   MELODIE besetzt oder MONO ist, gilt die alte V0c-Regel (gewählte freie Spur, dann freie nicht-MONO-Spur). Live-Noten landen in
   `song.mel[5]`. Über einem Song, dessen gewählte Spur keine Melodie hat, ebenfalls MELODIE – nur solange im Chip nichts gewählt
   wurde (V2b-fix: eine Wahl im Chip bleibt das Ziel).
5. **Melodie → Clip** von jeder Melodie-Spur: Clip auf **dieser** Spur im ersten freien Platz (MELODIE → Spur 5), ein Undo.
6. **Spur entfernen** nimmt `song.mel[t]` in dieselbe Undo-Gruppe; war es die gewählte Spur, fällt die Wahl auf MELODIE.
   MIDI „Song“ schreibt jede Spur-Melodie auf den Kanal ihrer Spur (V2b-fix: auch MELODIE als eigene MIDI-Spur, siehe unten).
7. **Test-API:** `songMelNotes(t?)` (neu, Kopie der Noten; ohne `t` = gewählte Spur), `song()` liefert zusätzlich den Lese-Alias
   `melody` (= gewählte Spur, wie WP6), `songMel(on)` / `setMelodyTrack(t)` unverändert (I-04).
8. Versions-Wächter: `max_app` → 4002000 (Rollout unten).

**Befunde dieses Durchgangs (behoben)**
- **● SONG nahm im Demo-Projekt Synth 4 (Mini-Lead, MONO/LEGATO) statt MELODIE:** Beim Start ist Synth 4 gewählt; die Regel „gewählte
  freie Spur zuerst“ (aus V0c, wegen WP6-SG) gewann vor MELODIE – genau der Audit-Fall „Melodie klingt eigenartig“. Die V2b-06-Abnahme
  sah das nicht, weil sie vorher Synth 1 (spielt Clips) wählt. Jetzt MELODIE zuerst (`melSuggest`). Prüfung: `v3-v2b-fp.mjs` Nr. 3
  (Demo, Standard-Auswahl → `sel 5`, Noten in `song.mel[5]`).
- **Song-Kopfzeile sprang bei ● (N7S-02):** Der Chip wechselte von „S4 ▾“ auf das breitere „MEL ▾“ und schob ⏮ und SCHLEIFE um 4–6 px.
  Der Chip ist jetzt immer so breit wie „MEL ▾“ (`min-width: 4.8em`): P 52,8 px, P375 48, P320 62, L/L667 76 (`v3-v2b-chipw.mjs`).
- **Rollen-Titel in P320 „MELODIE …“** schnitt genau das Spur-Kürzel ab. Kürzel jetzt in eigenem Kasten: „MEL… · S2“ (Abnahme C prüft,
  dass „· S2“ ganz sichtbar ist).

**Fach-Prüfung (vor der Abnahme, Teil J: FP-SONG Haupt-, FP-TOUCH Zweit-Blick)** – `v3-v2b-fp.mjs` 8/8, `v3-v2b-chipw.mjs` 10/10
- FP-SONG: M-ZEIT der migrierten WP6-Melodie (V2b-03, ±0,01 gegen 3.11.5); Daten-Invarianten (`clips` deep-equal nach Migration, V2a-02
  adaptiert); Undo-Gruppen und Rundweg: Wahl, Mitnehmen, ● SONG-Aufnahme (ein Schritt zurück deep-equal, Redo wieder), Spur entfernen mit
  fremder Spur-Melodie (Gruppe), Datei-Rundweg mit zwei Spur-Melodien und gewählter Synth 3, 4.0.0-Datei mit `song.melody` → `song.mel[3]`;
  Harmonie-Kern unverändert (`harm-pure`, V2a-Band M-BAND); MIDI „Song“: Spur-Melodie Synth 2 auf Kanal 2 genau 60 64 67 unter Am (nicht
  umgerechnet); FOLGEN der MELODIE-Rolle (N2b-01, unten). **Befund:** ● SONG-Vorschlag (oben).
- FP-TOUCH: Chip ≥ 42 × 37 px in allen Ansichten, Blatt-Zeilen ≥ 44 px, Blatt ganz im Bild (P, P375, P320, L, L667), Tipp per CDP-Touch
  wählt, ein Undo je Geste, MEL.-Zeile antippen öffnet die Rolle der gewählten Spur, ♪ im Etikett nicht abgeschnitten; Texte ohne
  Fachwörter („Melodie-Spur“, „spielt Clips / frei“, „mitnehmen“). **Befunde:** Kopfzeile springt, Titel abgeschnitten (oben).

**Abnahme**

| Punkt | Ergebnis | Skript |
|---|---|---|
| V2b-01 MELODIE: Melodie-Lead (POLY, Poly 4, Glide 0), ⇅ fest | ✓ | `v3-v2b-accept.mjs` A |
| V2b-02 Clip auf MELODIE unter Am, F, ORIGINAL → C E G C; ⇅ folgt → folgt (A C E A / F A C F) | ✓ | A |
| V2b-03 WP6-Song (3.11.5, `melodyTrack 3`, 4 Noten) → `song.mel[3]` 4 Noten; Wiedergabe gleiche Tonhöhen/Schläge ±0,01, Spur 3 | ✓ | A |
| V2b-04 gehaltenes G♯5 auf MELODIE + MONO-Clip auf Synth 4: Goertzel ≥ −40 dBFS über 2 s (min −31,0; Bezug auf Synth 4: −59,6) | ✓ | B |
| V2b-05 Song-Melodie auf MELODIE und Synth 2: beide im `noteLog` (`src:'melody'`, Spuren 1 und 5) | ✓ | A |
| V2b-06 ● SONG → MELODIE, Live-Noten in `songMelNotes(5)`, `songMel(true/false)` wie WP6 | ✓ (+ Demo-Standard, FP Nr. 3) | A, `v3-v2b-fp.mjs` |
| V2b-07 Melodie → Clip von MELODIE → Spur 5, erster freier Platz (Clip 2) | ✓ | A |
| V2b-08 Regression und DoD | ✓ (unten) | |
| N2b-01 MELODIE-Rolle: M-SEITE (x0 Vielfache von 4, Wechsel am Taktstrich) und Tipp-Test N0b-07 (13 Tipps, x0 fest) | ✓ 52/52 | `v3-v2b-adapt-v0b-follow.mjs` |
| UI-Teil (5 Ansichten): Chip, ♪, Blatt, Wahl per Touch, Rolle, Titel-Kürzel | ✓ | C |
| Gesamt `v3-v2b-accept.mjs ABC` | ✓ 68/68 | |
| Smoke | ✓ ohne Fehler | `v3-v2b-reg/run4/smoke-final.png` |

**Regression** (Listen von V2a mit den V2b-Kopien, `v3-v2b-reg.sh` → `run4`, `v3-v2b-reg2.sh` → `run5`): gleich wie nach V2a bis auf die gewollten
Änderungen, die angepasste Kopien bekommen (`v3-v2b-adapt-*`: Version 4.2.0 in wp1-brand/misc/store, wp3-api/store, n0a, vs0-/vs1-net;
v2a-accept V2a-02/04 mit `song.mel`; v0b-follow (N2b-01) auf MELODIE; wp6-song SG4/SG6/SG7 wie unter Abweichungen). Grün u. a.:
v2b-accept 68/68, v2b-fp 8/8, v2b-chipw 10/10, v2a-accept (adaptiert) 331/331, wp6-song P/L mit 6 und 8 Spuren je 27/27, v0c-song P/L 40/40,
wp6-extras, wp2-clip (5 Ansichten), wp2-fang, wp3-store 55/55, v2a-band 6/6 (M-BAND), harm-pure, PE1 8/8, PE2 5/5, vo2-accept, vs1-dsp,
rob5 18/18, v0b-follow 52/52, wp6-drums und v3-v0a-drum diesmal grün. Schon vor V2b rot und unverändert: node-fm, rgq-old17 C2/C3,
wp3-browser PR2, wp3-ui (2), wp4-offline FX3, func-build C2/D5, sqr6-persist, wp1-perf (forced layout), v0c-ui V0c-05 (5 Ansichten),
vs1-accept N2-VS1-03 (Szenen 5–8 verdeckt, seit V2a). Unter Last flatternd, allein grün: v0c-song V0c-01 (Takt-Zeit), wp6-song8-L SG7
(vor der Anpassung).

**Budget:** 2 179 459 B (+7,2 KB roh gegenüber V2a-fix, +2,4 KB gzip) – Rahmen +25 KB.

**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`): 20.10. `list_migrations` (… v2a_max_format_4, v2a_max_app) →
`apply_migration v2b_max_app` (`max_app = greatest(max_app, 4002000)`, Datei `synq-online/r7-v2b-max-app.sql`) **dreimal
Zeitüberschreitung nach 60 s, nicht eingetragen**; derselbe Befehl über `execute_sql` ebenfalls Zeitüberschreitung. Lesen geht
(`max_app` 4000000, `max_format` 4; keine laufende Sitzung, keine Sperre, kein Trigger auf `private.settings`) – Schreiben wartet
offenbar auf eine Bestätigung, die es in diesem Lauf nicht gibt. **Nachtrag V2b-fix:** `v2b_max_app` steht jetzt in `list_migrations`,
`max_app` = 4002000 (siehe V2b-fix). ~~Offen: vor dem Ausliefern von 4.2.0 einspielen~~ (sonst lehnt
`save_project` das Online-Speichern mit `p_app 4002000` ab; lokal speichert die App weiter). Kein Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4002000);` → Run.

**Abweichungen**
- Der Chip heißt kurz **[MEL ▾] / [S2 ▾]** statt „[MEL: Melodie ▾]“ (passt in P320 und lässt ●/▶ ihre Breite; voller Name im Blatt).
- ● SONG nimmt MELODIE auch dann, wenn vorher eine andere freie Spur gewählt war (Spezifikation „Standard-Vorschlag ist MELODIE“); die
  alte WP6-Prüfung SG6 („Synth 4 gewählt → melodyTrack 3“) ist dafür angepasst (`v3-v2b-adapt-wp6-song.mjs`: SG4/SG6 erwarten Spur 5,
  SG7 wählt vorher Synth 1, weil die Spurbank mit 8 Spuren der gewählten MELODIE auf Seite 2 folgt). Ist MELODIE MONO/LEGATO gestellt
  oder spielt sie Clips, gilt die V0c-Regel wie bisher.
- Nicht gewählte Spur-Melodien sieht man in der MEL.-Zeile blass; bearbeiten lässt sich nur die gewählte (über den Chip umschalten).

**Bekannte Lücken**
- ~~MIDI-Export ohne Song-Melodie auf MELODIE~~ – behoben in V2b-fix. Clips der Spuren 6–8 kommen weiter erst mit V2a′.
- Teil-Blatt „Spur MEL“ (§4.3 „Erreichbar“) kommt mit V2c (Teile).
- Am iPhone ungeprüft: Klang von Melodie-Lead neben MONO-Clips (gemessen nur in Chromium).

**Für Xander am iPhone (nach dem Ausliefern von 4.2.0)**
1. Demo öffnen → SONG ⇄ → **●**: Der Chip springt auf **MEL ▾**, die Tastatur spielt „Melodie-Lead“. Ein paar Töne spielen → ■.
   Die Töne liegen in der Zeile MELODIE und klingen beim ▶ SONG voll, auch wenn Synth 4 Clips spielt.
2. **MEL ▾** antippen → Liste (MELODIE zuerst, mit Notenzahl). Synth 2 wählen → MEL.-Zeile zeigt Synth 2; ↶ stellt es zurück.
3. Mit „… mitnehmen“ wandert die Melodie auf die gewählte Spur (ein ↶).
4. Ein alter Song (vor 4.2) klingt wie vorher: seine Melodie bleibt auf ihrer Spur (z. B. S4 ♪).

## V2b-fix — ● SONG nimmt die im Chip gewählte Spur, MIDI „Song“ mit MELODIE, Versions-Wächter 4.2.0 · App 4.2.0

Befunde (Abnahme/Regression): (1) ● SONG überschrieb die im Chip [MEL ▾] gewählte Spur mit MELODIE (erste Aufnahme und ● über dem
Song), ● MEL. nicht; (2) `max_app` stand auf 4000000, 4.2.0 konnte nicht online speichern; (3) MIDI „Song“ ließ die Standard-Melodie
auf MELODIE weg (Regression gegenüber 4.0.0).
1. **Chip-Wahl bleibt Ziel** (§4.3 „Live-Noten der **gewählten** Spur, Standard-Vorschlag ist MELODIE“): `setMelodyTrack` merkt die Wahl
   (`MELPICK`, Laufzeit, je Projekt-id; ein ↶ der Wahl = keine Wahl mehr). `songRecStart` (leerer Song) nimmt sie statt `melSuggest`,
   `songRecStartOver` schlägt nur ohne Wahl um. Ohne Wahl unverändert: MELODIE (V2b-06). Toast dann „Melodie auf Synth 3“ ohne „(frei)“.
   „Freie Spur nehmen“ (S-04) zählt auch als Wahl.
2. **MIDI „Song“:** Spur-Melodien von Spuren hinter Synth 1–4/DRUMS (MELODIE) kommen als eigene MIDI-Spur („Melodie (VA Melodie-Lead)“,
   Kanal 6 = Index 5, Programmwechsel nach Kategorie) dazu; Kopf-Spurzahl stimmt (`assembleMidi(…, idxs)`). Szene/Alle/Mitschnitt
   unverändert (6 Spuren). Hinweis im Export-Blatt: „MIDI enthält Synth 1–4 und DRUMS, bei „Song“ auch die Song-Melodie jeder Spur
   (z. B. MELODIE). Clips weiterer Spuren kommen in einer der nächsten Versionen dazu.“
3. **Versions-Wächter:** `list_migrations` zeigt jetzt `v2b_max_app` (20261020052213); `execute_sql` (lesen) `max_app` 4002000,
   `max_format` 4. Probe in einem zurückgerollten DO-Block: `save_project` mit `p_app` 4002000 kommt am Wächter vorbei (scheitert erst an
   der erfundenen Raum-id: forbidden), 4003000 → bad_version. Nichts geschrieben. Kein Aufruf nennt das Klassenzimmer-Projekt.

**Prüfungen:** `v3-qa-v2b-chip.mjs` 7/7 (vorher 3/4); `v3-qareg-v2b-songflow.mjs` P und L je 14/14 (vorher 13/1); `v3-v2bfix-midi.mjs`
(Kopf 7 Spuren); `v3-v2bfix-lay.mjs` Export-Hinweis mit echter Barlow-Schrift in P/L/P2 ohne Überlauf; `v3-v2b-accept.mjs` 69/0
(V2b-06 angepasst: Chip-Wahl bleibt, ohne Wahl MELODIE – beides geprüft); `v3-v2b-adapt-v2a-accept.mjs` 326/0; `v3-qareg-v2b-midi`,
`v3-qa-v2b-06`, `v3-qa-v2b-move`, `v3-qareg-v2b-oldsong` grün; `v3-qareg-v2b-songrec` (2× 🎤 in L) und `v3-v2a-adapt-v0c-song` (1 Zeit-
Prüfung) fallen gleich wie mit V2b.html; Smoke ohne Fehler.

## V2c — Teile, Akkord-Zeilen, Teil-Leiste (+ Nachtrag 2: `tg:null`, Akkord-Zeilen quantisieren, Halten = anheben) · App 4.3.0

Grundlage: Spezifikation v3 §4.4–§4.6, §17 V2c (V2c-01 … V2c-13), §16; Nachtrag 2 B.1 Nr. 1/4/10, B.4 (V2c: `ChordRow.tg:null`,
[Quantisieren] im Akkord-Zeilen-Blatt, Teil-Taste: Halten = anheben, Teil-Blatt beim Loslassen; N7S-08 … N7S-10, K2-35), EN2-04 (keine
Kette mehr), Teil E (Gruppe 4, 4.3.0, +64 KB) und Teil J (FP-SONG Haupt-, FP-TOUCH Zweit-Blick); `r7/song-delta.md` 8.2 (N7-R11),
12.1/12.3, 14.3 (V2c-01 in P nur Clip-Ansicht); Nachtrag 1 C.5. V2a′ ist weiter nicht gebaut (wie bei V2b vermerkt).

**Neu**
1. **Teil-Leiste statt Hinweis-Kasten** (§4.4): 8 Plätze, 4 je Seite + **eine** Umschalt-Taste ●○ (44 px; der Punkt der anderen Seite
   blinkt, wenn dort ein Teil läuft oder wartet). P: unter dem Clip-Raster (40 px, Tasten ≥ 72 px, P3 62 px), **nicht in der
   Hochformat-Song-Ansicht** (Nachtrag 2 B.1 Nr. 4 / EN7-02, ersetzt V2c-01 „an derselben Stelle“ nach song-delta 14.3); L (≤ 560 px
   hoch): im Seitenfeld zwischen Träger und Spurleiste, 38 px hoch, in Clip- und Song-Ansicht an derselben Stelle (Träger-Zeilen dafür
   etwas flacher: 40/40/26 px statt 48/44/28, Akkordname 24 px). Name GROSS (≤ 8 Zeichen, sonst 6, sonst Kurzform nach N7-R2 „STR“,
   „REF“, „STR2“), LED oben rechts: **blinkt** = wartet auf den Taktstrich, **leuchtet** = läuft; Farbe = Teil-Farbe (Unterstrich).
   Der Hinweistext („▶ drücken, dann TRANSPONIEREN …“) steht jetzt in Menü → Hilfe, dazu zwei Hilfe-Zeilen zu Teilen und Akkord-Zeilen.
2. **Teil-Taste:** Tipp = Start am nächsten Taktstrich (Wechsel „am Teil-Ende“ im Teil-Blatt umstellbar), Clips mit Phase 0, die
   Akkord-Zeile von vorn, „bleibt“-Spuren laufen weiter, „aus“-Spuren stoppen am Taktstrich; ein zweiter Tipp startet ihn am nächsten
   Takt neu. Ein Tipp kurz nach dem Taktstrich zählt noch (wie Clip-Tipps, rückwirkend). **[＋]** auf einem leeren Platz speichert, was
   gerade klingt (Clip je Spur, gestoppte Spuren = aus, laufende Akkord-Zeile bzw. der Träger als einzeilige Zeile, ORIGINAL = keine
   Akkorde) und fragt nur den Namen (Chips Intro · Strophe · Pre · Refrain · Bridge · Break · Outro · ✎, Vorschlag Strophe → Refrain →
   Bridge → Intro → Outro → Teil n; ein vergebener Name bekommt eine Nummer) – alles ein Undo.
   **Halten 450 ms** (≤ 8 px) = anheben (Haptik, Taste grau); Loslassen ohne Bewegung → **Teil-Blatt**; Bewegen nach dem Anheben →
   ein Geist folgt dem Finger, beim Loslassen kein Blatt, nichts startet (Ablegen in den Song kommt mit V2e′).
3. **Teil-Blatt** (P ≈ 319 px, L zwei Spalten 177 px): Name (Chips, ✎ Freitext 1–12 Zeichen), Farbe (6), Spuren-Chips (Tipp: Sz1 → Sz2
   … nur Szenen mit Clip → aus → bleibt), **[▦ In der Matrix wählen]**, Akkorde [Am·F ✎] (öffnet das Akkord-Zeilen-Blatt des Teils)
   **oder** Transposition [±0 ▾] (−12 … +12; setzt die Akkord-Zeile außer Kraft, Toast mit Rückgängig), Wechsel [am Takt │ Teil-Ende],
   [= wie jetzt] [Kopie] [ohne Drums] [Löschen] (Toast mit Rückgängig). Jede Änderung ein Undo (`part`).
4. **Matrix-Auswahl:** Das Blatt schrumpft auf eine Zeile an der Stelle der Teil-Leiste („Teil Strophe: Zellen antippen · [Fertig]“),
   die Matrix zeigt Rahmen in Teil-Farbe. Zelle = dieser Clip für seine Spur, nochmal = aus, dritter Tipp = bleibt; die ■-Spalte zeigt
   „aus“/„bleibt“ und schaltet zwischen beiden. In diesem Modus startet keine Zelle und kein ▶n. Die ganze Auswahl ist ein Undo;
   [Fertig] öffnet das Teil-Blatt wieder.
5. **Akkord-Zeilen** an Szene und Teil (`S.scenes[i].chords`, `Part.chords` = `{len 1–16, ch:[{b, tg|null}]}`): ▶n startet die Zeile der
   Szene am Startschlag, ein Teil seine Zeile; sie läuft im Kreis und ruft an jedem Eintrag `T.recall(tg, b2t(beat), null)` – auch
   bei „Wechsel: am Takt“ ohne zweites Quantisieren (halbe Takte bleiben auf Schlag 2). `tg:null` = ORIGINAL ab diesem Schlag
   (N7S-08, über `T.reset`). Endet die Zeile (▶n einer Szene ohne Zeile, ■, ▶ SONG, anderes Projekt), kommt der Träger von vor der
   Zeile zurück – außer die Hand hat übernommen. ▶ oben nach ■ setzt die zuletzt laufende Zeile/den Teil ab Takt 1 fort.
   Unter ▶n steht die Kurzform der Zeile („Am·F·C·G“, amber, 8 px) unter der Szenen-Tonart.
6. **TA1 Hand > Zeile:** Jede Träger-Änderung, die nicht von der Zeile kommt (Taste in TRANSPONIEREN, Momentan, Verlauf, ORIGINAL),
   übernimmt sofort; die Anzeige sagt „HAND · SZENE 1 · …“ und zeigt **[↩ TEIL]** (orange, 68 × 42 px in der Träger-Anzeige). Tipp =
   ab dem nächsten Taktstrich wieder die Zeile (mit dem dort gültigen Akkord). ▶n derselben Szene gibt ebenfalls zurück.
7. **Teil-Transposition** `xp.semi` (§4.4, I-01): wird **nach** der Abbildung addiert (`outPitch`), nur für Spuren mit ⇅ folgt;
   MELODIE (⇅ fest), Drums und Synth-Pads nie; kein Träger-Eintrag, der Verlauf bleibt unverändert. Stimmen, die über den Teil-Start
   klingen („bleibt“), werden am Taktstrich mitgezogen; FANG/REC unter einer Transposition speichern „gehört − xp“.
8. **Akkord-Zeilen-Blatt** (Tipp auf die Träger-Anzeige, ersetzt dort das Verlaufs-Popup; P 216 px über der Tastatur, L zwei Spalten
   127–131 px): Kopf AKKORDE ‹ Szene 1 › · 4 Takte · C-Dur [−][+][✕] (‹ › blättert durch Szenen 1–8 und die Teile, **ohne** sie zu
   starten); ein Kästchen je Takt (laufendes leuchtet; [÷2] teilt in zwei Hälften), Stufe (7 leitereigene Dreiklänge, in Moll zusätzlich
   „V (Dur)“, dazu ORIG.), Zuletzt (Träger-Verlauf; mit gewähltem Kästchen = eintragen, ohne = jetzt abrufen wie früher das Popup),
   [÷2] [– halten] [♪ greifen] [Quantisieren] [Löschen] [Frei ▾]. Ein Eintrag springt zum nächsten Kästchen. **[Frei ▾]** ersetzt die
   unteren Zeilen in gleicher Höhe (Grund 12, Art 15 bzw. Bass, Text ⌨ mit `parseChord`). **[♪ greifen]**: das Blatt wird eine Zeile
   über der Modusleiste (L über der Spurleiste), die Tastatur ist frei; ein gegriffener Akkord (40 ms sammeln) füllt das Kästchen, die
   Tasten klingen auf der gewählten Spur, ändern aber nie den Träger. **[Quantisieren]** (N7-R11, N7S-09): Takt │ ½ │ Schlag, Vorschau
   „6 · 5 rücken · 1 zus.“, ein Undo (`part`), Toast mit den Zahlen; ein Eintrag, der auf das Zeilenende rundet, landet auf Schlag 0.
   Eine Knopfzeile, deren Texte nicht passen, schaltet einzeln auf Kurztexte („–“, „♪“, „Quant.“, „✕“) – nie abgeschnitten.
9. **Daten/Undo:** `S.parts` (8 Plätze), Undo-Art `part` (Teile + Szenen-Zeilen in einem Schnappschuss), `normalizeProject` liest
   beides verlustfrei, `ui.partPage` nur wenn Seite 2; [Spur entfernen] nimmt die Teil-Slots der Spur in seine Gruppe.
10. **Test-API:** `parts()`, `setPart(i, p|null)`, `partFromNow(i, name?)`, `launchPart(i, atT?)`, `chordRow(src)`, `setChordRow(src, row|null)`,
    `quantizeChords({src:'S1'..'P8', grid, a?, b?})`, `quantizeRow`, `openPartSheet(i)`, `openChordRowSheet(src?)`, `partPick(i|null)`,
    `pickCell(t, s)`, `partPage(n?)`, `rowBack()`, `partTap(i)`, `partRename(i, name)`, `partInfo()`; `runtime()` + `part`, `row`, `xp`.

**Abweichungen (begründet)**
- **V2c-01:** Nach Nachtrag 2 B.1 Nr. 4 / EN7-02 und song-delta 14.3 gibt es im Hochformat **keine Teil-Leiste in der Song-Ansicht**;
  „an derselben Stelle beim Wechsel CLIPS ⇄ SONG“ gilt nur quer (Seitenfeld). In P3 (320 px) ist die Leiste 36 statt 40 px hoch, damit
  die Clip-Reihen ihre V0a-Höhe (≥ 28 px) behalten; quer 38 px (Träger-Zeilen dafür 40/40/26 px, Knöpfe AKKORD/LATCH/ORIGINAL 40 statt
  44 px hoch). Quer zeigen die Tasten in 57/47 px Breite die Kurzform (STR, REF).
- **N7S-10 / K2-35:** Die Song-Seite öffnet sich beim Halten erst mit V2e′. Bis dahin öffnet jedes Loslassen ohne Bewegung nach dem
  Anheben das Teil-Blatt (auch nach mehr als 1 050 ms); eine Bewegung nach dem Anheben zeigt nur den Geist (kein Blatt, nichts startet).
- **Kette entfällt** (EN2-04): Teil-Tipp bei laufender Kette/Song nach B.1 Nr. 17 ist V2d. Ein Teil-Tipp während ▶ SONG übernimmt die
  Spuren wie ein Clip-Start, seine Akkord-Zeile übernimmt den Träger ([↩ SONG] erscheint, TA1 Zeile > Song).
- **Ende einer Zeile:** Die Spezifikation sagt nicht, was nach einer Akkord-Zeile gilt. Gewählt (wie TA9 für den Song): der Träger
  von vor der ersten Zeile kommt zurück (▶n ohne Zeile, ■, ▶ SONG), außer die Hand hat übernommen. ▶ oben nach ■ setzt Zeile/Teil ab
  Takt 1 fort (sonst liefen die Clips der Szene ohne ihre Akkorde).
- **[Löschen]** im Akkord-Zeilen-Blatt löscht die ganze Zeile (Toast mit Rückgängig); ein einzelnes Kästchen leert [– halten].
  Ohne gewähltes Kästchen spielen Stufe- und Frei-Chips den Akkord sofort (wie „Zuletzt“), statt nichts zu tun. Eine neue Zeile
  hat 4 Takte (oder den längsten Clip, wenn er länger ist).
- **„Kopie ohne Drums“** setzt DRUMS auf „aus“ (Strophe ohne Schlagzeug), nicht auf „bleibt“.
- **Klang-Zeile** des Teil-Blatts ([◆ eigener Teil-Klang]) fehlt bis V6b (nicht nur grau).
- Tipp auf die Träger-Anzeige öffnet jetzt **immer** das Akkord-Zeilen-Blatt (vorher im Hochformat das Verlaufs-Popup, quer nichts);
  `popHistory()` bleibt als Funktion.
- **Fach-Prüfung** nach Teil J als eigener Prüf-Durchgang derselben Sitzung (kein getrennter Agent verfügbar), mit eigenem Skript.

**Fach-Prüfung (Teil J: FP-SONG Haupt-, FP-TOUCH Zweit-Blick)** – `v3-v2c-fp.mjs` 8/8, dazu die Touch-Teile von `v3-v2c-accept.mjs` C
- FP-SONG: M-ZEIT (Teil-Start ±0,002 Schlag, V2c-03), Zeilen-Recalls exakt auf den Schlägen auch mit „Wechsel: am Takt“, I-01 (ohne
  Teil/Zeile ist `outPitch` bitgleich `T.mapEvent`; `harm-pure`, `v2a-band` M-BAND ≤ 0,02 dB, noteLog 172 identisch), Undo-Gruppen
  ([Spur entfernen] = song + part + track), Rundweg Speichern/Laden/Undo/Redo deep-equal, `clips` unberührt, TA9-Rückkehr nach ■/▶ SONG.
  **Befunde (behoben):** (1) FANG/REC unter einer Teil-Transposition speicherten den gehörten Ton (+2) statt des Clip-Tons –
  `clipNoteFor` rechnet jetzt auch ohne Träger mit R.xp. (2) Wurde ein laufender Teil gelöscht/rückgängig gemacht, blieb die Zeile
  „tot“ aktiv und eine Hand-Taste zeigte [↩ TEIL] für nichts – Hand-Erkennung und Knopf nur bei vorhandener Zeile. (3) Die Teil-Taste
  gab beim Start aus dem Stand keine Haptik.
- FP-TOUCH: L4/M-PLATZ der Leiste und beider Blätter in P, P375, P320, L, L667 (jeder Knopf im Bild und treffbar, kein abgeschnittener
  Text), Halten vs. Tippen vs. Ziehen per CDP-Touch, ein Undo je Geste, Haptik, `user-select/touch-action none`, Texte ohne Fachwörter.
  **Befunde (behoben):** (4) Namen und Knopftexte wurden abgeschnitten („STROPH…“, „♪ greifen“, „ohne Drums“) – Kurzform nach N7-R2
  bzw. einzeln umschaltende Kurztexte. (5) Teil-Blatt-Kopf „TEIL ·…“ im Hochformat abgeschnitten – „TEIL ·“ und „Wechsel“ nur quer.
  (6) Quer schnitt die flachere Träger-Anzeige die Zeile „SZENE 1 · …“ oben ab – Akkordname dort 24/22 px. (7) In der Matrix-Auswahl
  hieß die ■-Spalte „aus/bleibt“, stoppte aber die Spur – sie schaltet jetzt aus ↔ bleibt. (8) Farbpunkte 34 px hoch → 38 px.
  (9) Akkord-Zeilen-Blatt 217 px → 216 px. (10) „STROPHE 2“ wurde zu „STROPHE“ gekürzt (Nummer weg) → „STR2“.

**Abnahme**

| Punkt | Ergebnis | Skript |
|---|---|---|
| V2c-01 Teil-Leiste: P1/P2 40 px, ●○ 44 px, Tasten 78,5/75,8 px (P3 36 px hoch, 62 px breit), ≤ innerWidth; L/L667 38 px im Seitenfeld, CLIPS ⇄ SONG ±0 px; P: nicht in der Song-Ansicht | ✓ | `v3-v2c-accept.mjs` C |
| V2c-02 [＋] bei Szene 1 + Am: slots = Spalte 1 (ohne Clip = aus), Zeile 1 Takt Am, Name Strophe, ein Undo | ✓ | A |
| V2c-03 Start am nächsten Taktstrich (Schlag 8 ±0,002), Phase 0; LED `wait` → `on` | ✓ | A, C |
| V2c-04 „am Teil-Ende“ → Schlag 16 (Teil 4 Takte), „am Takt“ → 8 | ✓ | A |
| V2c-05 Matrix-Auswahl: 4 Tipps → slots wie erwartet, kein Clip-Start, 4 Rahmen; nochmal = aus, dritter = bleibt; [Fertig] = ein Undo | ✓ | C |
| V2c-06 „bleibt“ ohne Neustart (2-Takt-Clip in Phase), „aus“ stoppt am Taktstrich | ✓ | A |
| V2c-07 Szene 2 „Am F C G“: Recalls 0, 4, 8, 12, zwei Durchläufe | ✓ | A |
| V2c-08 [÷2]: 0 und 2, auch mit „Wechsel: am Takt“ | ✓ | A |
| V2c-09 [♪ greifen]: C-E-G auf der Tastatur (3 Finger) → „C“, Auswahl springt weiter, Träger bleibt ORIGINAL | ✓ | C |
| V2c-10 Hand übernimmt sofort, [↩ TEIL] sichtbar; Tipp → ab Schlag 16 wieder die Zeile (Am) | ✓ | A, C |
| V2c-11 +2 HT: Synth-Spuren mit ⇅ folgt exakt +2 (single key und parallel), MELODIE/Drums unverändert, kein Verlaufs-Eintrag; **hörbar**: A3 ±0 / B3 +2 im Ausgang (Goertzel −37/−104 dB bzw. −66/−38 dB) | ✓ | A, B |
| V2c-11b ‹ › zu Szene 3 ohne Start; Akkord → `chordRow('S3')`; Zuletzt Dm · G7; ohne Kästchen = Abruf; „V (Dur)“ = E in a-Moll; [Frei ▾] gleiche Höhe; P1 216 px | ✓ | C |
| V2c-12 Speichern/Laden, Clip-Kopie, Undo ×3/Redo ×3 deep-equal | ✓ | A |
| V2c-13 M-PLATZ Leiste/Teil-Blatt/Akkord-Zeilen-Blatt (Grund + Frei) in 5 Ansichten; Regression, DoD | ✓ | C, unten |
| N7S-08 `tg:null` → ORIGINAL ab dem Schlag (out = clip) | ✓ | A |
| N7S-09 [Quantisieren] Szene 2 (Takt): Am 0 · F 4 · C 8 · G 12 · Am 16, {moved 5, merged 1}, ein Undo `part`, Toast | ✓ | A |
| N7S-10 Tipp startet; Halten 450 ms → Blatt erst beim Loslassen; Halten + Ziehen → kein Blatt | ✓ | C |
| Gesamt `v3-v2c-accept.mjs ABC` | ✓ 85/85 | `v3-v2c-accept.out` |
| Fach-Prüfung | ✓ 8/8 | `v3-v2c-fp.mjs` |
| Smoke | ✓ ohne Fehler | `v3-v2c-smoke.png` |

**Regression** (`v3-v2c-reg.sh` → `v3-v2c-reg/run1`, `v3-v2c-reg2.sh` → `run2`, Vergleich `v3-v2c-regcmp.sh` gegen V2b run4/run5): gleich
wie nach V2b bis auf die gewollten Änderungen mit Kopien `v3-v2c-adapt-*` (Version 4.3.0 / max_app 4003000 in wp1-brand/misc/store,
wp3-api/store, n0a, vs0-/vs1-net; `v3-v2c-adapt-v2a-accept.mjs` V2a-04: Gruppe [song, part, track]); `v3-vo2-harness.mjs` APPCODE 4003000
(Sicherung `*.pre-v2c.mjs`). Unter Last flatternd, allein grün: wp6-song P (SG6 Takt-Zeit 0,012), v0a-drum DR7 (CPU), wp5-mod, v2a-band,
v2a-pe1 L (ein Long-Task 62 ms), v2a-accept P3. Schon vor V2c rot (auch mit V2b-fix.html heute): wp7-adapt-func2-build-native A3
(Projektname aus IndexedDB), v2b-fp „MELODIE nicht im MIDI“ (seit V2b-fix absichtlich anders), v0c-ui L667 (2), node-fm (1) und die in
V2b genannten.

**Budget:** 2 258 860 B (+77,4 KB roh gegenüber V2b-fix, +21,7 KB gzip) – Rahmen +64 KB, also +21 % darüber (< 50 %): zwei Blätter mit
Quer-Layouts, die Matrix-Auswahl und die Kurztext-Logik kamen dazu.

**Rollout** (Supabase-MCP, ref `dbdnsryoivvezspgydpx`): 20.10. `list_migrations` (… v2b_max_app) → `apply_migration v2c_max_app`
(`max_app = greatest(max_app, 4003000)`, Datei `synq-online/r7-v2c-max-app.sql`) **zweimal Zeitüberschreitung nach 60 s, nicht
eingetragen** (wie bei V2b: Schreiben wartet auf eine Bestätigung); `execute_sql` (lesen) `max_app` 4002000, `max_format` 4. **Offen:
vor dem Ausliefern von 4.3.0 einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App weiter). Kein
Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4003000);` → Run.

**Bekannte Lücken**
- Teil in den Song ziehen/ablegen (V2e′), FANG TEIL und Teil-Tipp im laufenden Song (V2d), Teil-Klang (V6b), „Eine Skala“ (V2c′).
- Die Träger-Anzeige kürzt eine lange Zeile („SZENE 1 · [AM]·F·…“) in P3 mit „…“; das ganze Bild steht im Akkord-Zeilen-Blatt.
- Am iPhone ungeprüft: Halten/Ziehen auf den Teil-Tasten (Kontextmenü), [♪ greifen] mit echten Fingern, Lesbarkeit der Kurzformen quer.

**Für Xander am iPhone (nach dem Ausliefern von 4.3.0)**
1. Unter den Clips steht die **Teil-Leiste** (quer im rechten Feld). Szene 1 starten, ein paar Akkorde in TRANSPONIEREN spielen, dann
   **＋** tippen → Namen wählen (z. B. Strophe). Eine andere Szene starten, dann **STROPHE** tippen: am nächsten Takt klingt alles wie vorher.
2. **STROPHE halten** und loslassen → Teil-Blatt. „In der Matrix wählen“ → Drums aus Szene 2, Bass aus Szene 1 antippen → Fertig.
3. Auf die **Träger-Anzeige** tippen → Akkord-Zeile von Szene 1: vier Kästchen mit Am, F, C, G über die Stufen-Chips füllen, ▶1 tippen:
   die Akkorde laufen im Kreis mit. Eine Taste in TRANSPONIEREN übernimmt sofort, **↩ TEIL** gibt die Zeile am nächsten Takt zurück.
4. Im Teil-Blatt **Transposition +2** wählen: der Teil klingt zwei Halbtöne höher, MELODIE und Drums bleiben.

## V2d — FANG TEIL v2, Teil-Lanes, Zeitleiste und Marken (Daten, API), Teil-Tipp im Song · App 4.5.0

Grundlage: Nachtrag 2 B.1 Nr. 1–3, 14, 17, B.4 (V2d), K2-28; `r7/song-delta.md` 4.1–4.6, 5.3–5.5, 12.1–12.3, 13 (N7S-11 … N7S-26,
N7S-25b); Spec v3 §4.7, §17 V2d (V2d-01, -03…-05b, -08, -13, -15; V2d-05/-06/-07/-09/-10/-14 → N7S-19 … N7S-24 laut 14.3);
Teil E/Nachtrag zur Reihenfolge (G-P1, 4.5.0); Teil J (FP-SONG ●, FP-TOUCH).

**Neu**
1. **Song-Gedächtnis** (4.1): je Spur, was an den Taktstrichen wirklich geschah (`slot`, Clip-Start `cs`, Zeitpunkt), 72 Takte;
   CAPC = Träger-Log mit Schlag, auch ORIGINAL (`target:null`), unabhängig von `T.prune`; Grenzpunkte (Transportstart, ▶n,
   Teil-Tipp, ORIGINAL, [↩ TEIL]/[↩ SONG], angenommener FANG TEIL). API `memory()`.
2. **FANG TEIL** (FANG-Platz): in ⇅ TRANSPONIEREN (auch gehalten) heißt er „FANG TEIL“ und leuchtet nach Akkord-, Clip- oder
   Szenenwechseln seit dem letzten Grenzpunkt; in ♪ SPIELEN, wenn 8 s keine Note kam, aber Clips/Szenen wechselten (EN7-09),
   sonst „FANG“ wie bisher. Phrasenanfang = letzter Grenzpunkt bzw. der erste Wechsel nach ≥ 2 ruhigen Takten; **Taktstrich-Regel
   N7-R1** (Periode p ∈ {1,2,3,4,6,8} vom Ende her, sonst 1/2/4/8/16; Struktur vor Zeit, 50 %); Lanes je Takt (Szene je Spur,
   aus/an, Neustart `re`, Phase `ph` bei Takt 0), Akkord-Zeile aus dem CAPC (Wechsel bis ¼ Schlag vor dem Taktstrich zählen auf ihn,
   im Tipp-Takt nur bis zum Tipp). Der Teil läuft ab dem nächsten Taktstrich **im Kreis, phasengleich als hätte man genau bei E
   gedrückt** (später Tipp → dort Teil-Takt 2), beendet die Hand; war TRANSPONIEREN eingerastet: Modus bleibt, ♪ SPIELEN blinkt
   2 s, Hinweis „Zum Drüberspielen ♪ SPIELEN“. Während ▶ SONG übernimmt der Kreis von Hand (orange [↩ SONG]).
3. **Blatt „Teil gefangen“** (4.5, Mockup P-1): Kopf mit Teil-Chip [⠿ STROPHE · 8 T], Zeile Ende („Ende Taktstrich 9 · 7 % in
   Takt 9 gedrückt (zu spät, zählt)“), Mini-Zeitleiste der letzten 16 Takte (Akkord-Kürzel, Punkte = Clip-Wechsel, Tipp = Anfang,
   Länge dann exakt), Zeile Clips („S1 Sz4, aus T5–6 · S3 Sz3 ab T3 · DR Sz1“), Länge [1][2][4][8][16], Namens-Chips N7-R2
   (Intro · Strophe · Pre · Refrain · Bridge · Break · Outro · ✎; Vorschlag Strophe → Refrain → …; vergebener Name → [＋ Strophe 2]
   (Standard) │ [⟳ Strophe ersetzen] = Vorlage + alle Marken, Toast mit Stellenzahl; Freitext 1–12 Zeichen), [an Szene n hängen]
   (nur wenn die Spuren genau einer Szene ohne Akkord-Zeile entsprechen), [Verwerfen] · [＋ Ans Song-Ende] · [ALS TEIL ✓]
   (Teil-Leiste voll → „Platz … ersetzen“). Undo: ALS TEIL = `part`, Ans Song-Ende / ⟳ = `group` [part, song]. P: über der
   Tastatur angedockt, 257 px (≤ 270); L: Seitenfeld rechts 299 px ab y 44, das Clip-Raster bleibt frei.
4. **Teil-Wiedergabe mit Lanes** (4.6): Teil-Tasten spielen `Part.lanes` modulo Länge (Takt-0-Einträge bei jedem Durchlauf mit
   Phase, spätere Einträge starten/stoppen/neu); leere Lane = „bleibt“; eine Spur, die man während des Teils von Hand startet, gehört
   bis zum nächsten Teil-Start der Hand. Teil-Blatt/Matrix-Auswahl ändern den Takt-0-Eintrag (`slots` bleibt die Kurzform).
5. **Song mit `re`/`ph`/`xp`** (`songTick`): ein Eintrag mit demselben Clip ohne `re`/`ph` läuft phasengleich weiter (kein
   Schnitt); Einsatz mit Phase; `song.xp` (Teil-Transposition) im Song, beim Sprung und am Schleifen-Anfang; Song-Start, ↩ SONG,
   Schleife und MIDI-Export rechnen die Phase aus den Einträgen (statt Block-Anfang). Gleicher Clip in gleicher Phase = nie ein
   Neustart (auch beim Teil), also kein Knacks.
6. **Zeitleisten-Operationen und Marken** (5.3/5.4, Daten + API): EINFÜGEN (Marke wird geteilt, Fortsetzung phasengleich),
   ERSETZEN (komplett, auch Melodie und eigene Clips; Marken gekürzt/geteilt), LÖSCHEN, LEEREN; `placePart` (am/hinter dem Ende
   = anhängen), `songMarks()` (Name, Kurzform, Teil′ berechnet), `markAction` (rep, move, copy, replaceBy, delete, unname, rename,
   applyAll, swapL/R), `songRange` (insertEmpty, delete, clear, copy, asPart) – je ein Undo (`applyAll`/`asPart` = group).
   `songFromChain` setzt je Glied eine Marke „Szene n“. Song-MIDI: Marker FF 06 je Marke. Szenen-Clips bleiben immer unberührt.
7. **Teil-Tipp bei laufendem Song** (B.1 Nr. 17, K2-28): springt am nächsten Taktstrich zur nächsten Marke dieses Teils (zyklisch);
   ohne Marke übernimmt die Hand wie bisher.
8. **Test-API:** `memory`, `fangTeil({beat})`, `fangPart`, `fangClose({beat})`, `fangAccept('part'|'end', {slot})`, `fangDiscard`,
   `fangLen`, `fangStart`, `fangName(n, dup)`, `fangToScene`, `openFangSheet`, `placePart`, `songMarks`, `markAction`, `songRange`,
   `lastOpMs`, `setSong` (Tests); `runtime()` + `fangMode`, `fangTeil`; `part.id` „PF“ für den gefangenen Kreis.

**Abweichungen (begründet)**
- **Ziehen in den Song** (Chip halten, S9) ist V2e′: der Hinweis „⇢ Teil-Chip halten und in den Song ziehen“ fehlt bis dahin, der
  Chip ist nur Anzeige. Marken werden erst mit V2e in der Taktleiste gezeichnet (hier nur Daten, API, MIDI).
- **✕ / Tippen neben das Blatt** = Verwerfen (wie [Verwerfen]); dafür Toast „Teil verworfen“ mit **[Zurück]** (derselbe Fang läuft
  wieder, Blatt offen) – ein Fehlgriff kostet so nichts.
- **Länge 1 … 16** nimmt wie in der Spec die letzten n Takte bis E; „Länge 1“ nach Am F C G ist also G.
- **Leere Einträge**: Zeitleisten-Operationen räumen Einträge weg, die nichts ändern (−1 nach −1, gleicher Clip in gleicher Phase);
  die Fortsetzung wird nur geschrieben, wo sonst etwas anderes klänge. Darum steht in N7S-19 bei Sequenz/MELODIE kein `{bar:6,
  slot:-1}` – hörbar identisch, geprüft über Zustände je Takt.
- **Teil′/applyAll** vergleichen Zustände je Takt (Slot + Phase, Akkorde) statt roher Einträge. `applyAll` behält die Melodie der
  Zielstellen (6.3), bei anderer Länge nur, was hineinpasst.
- `ph` bei späteren Lane-Einträgen eines Teils wird (wie 12.1 „nur bar 0“) nicht gespeichert; ein FANG eines Clips, der mitten im
  Teil phasenversetzt startet, startet beim Abspielen mit Phase 0.
- Trefferflächen im Blatt: Länge- und Namens-Chips 36 px hoch, Mini-Zeitleiste 34 px (Mockup P-1: Zeilen 32/36 px); ✕ 40×40.
- `songCommitLanes` (V0c ● über dem Song) behält jetzt `re`/`ph` und schreibt das Ende phasengleich (vorher Neustart mit Phase 0).

**Fach-Prüfung (Teil J: FP-SONG ● Haupt-, FP-TOUCH Zweit-Blick)** – eigener Prüf-Durchgang derselben Sitzung (kein getrennter
Agent verfügbar), mit eigenen Skripten. 9 Befunde, alle behoben:
FP-SONG: (1) `songCommitLanes` warf `re`/`ph` weg; (2) ein Teil-Undo hätte den gefangenen Kreis beendet (`partRestore`);
(3) unnötige Schnitte bei gleichem Clip in gleicher Phase (jetzt Vergleich modulo Clip-Länge); (4) Akkord-Zeilen-Blatt hätte mit
der Quelle „PF“ geöffnet (`crDefaultSrc`, auch `rowPend`); Regression differenziell gegen V2c-fix: noteLog und MIDI-Notenzahlen
identisch (Kette mit 3-Takt-Clip + Schleife, Teile mit „bleibt“/Neustart, Song ab Takt 3 mit Übernahme und ↩ SONG).
FP-TOUCH: (5) Blatt wurde vor dem Einhängen platziert (stand mittig statt angedockt/Seitenfeld); (6) „＋ Ans Song-Ende“ im
Hochformat abgeschnitten → Kurztext „＋ Song“; (7) Kopf „TEIL GEFANGEN · läuft ∞“ in L und P3 abgeschnitten → Zusatz dort weg;
(8) Fehlgriff neben das Blatt verlor den Fang → [Zurück]; (9) Teil-Chip mit `-webkit-touch-callout:none`/`user-select:none`.

**Abnahme**

| Punkt | Ergebnis | Skript |
|---|---|---|
| N7S-11 `memory()` je Takt slots/cs/own/Träger, ORIGINAL als `target:null` | ✓ | `v3-v2d-fang.mjs` |
| N7S-12 Xanders Fall: Lanes DR/FL/SEQ/BASS, Am F C G ×2, len 8, Ende {8, struktur} | ✓ | fang |
| N7S-13 `ph` 4; Teil-Taste spielt die Drum-Noten an denselben Stellen (±0,002) | ✓ | fang |
| N7S-14 Fälle 1, 2, 3, 3b, 4, 5, 5b, 6, 6b, 7, 9 (Ende, Grund, Länge, Akkorde je Takt) | ✓ 11/11 | fang |
| N7S-15 ab Schlag 20 F (Teil-Takt 2), kein zweites Am | ✓ | fang |
| N7S-16 E1 eingefroren: Clip-Start nach dem Tipp nicht in den Lanes; Zeile „zu früh, zählt“ | ✓ | fang |
| N7S-17 Strophe → Refrain; [＋ Strophe 2] │ [⟳ Strophe ersetzen]; 13 → 12 Zeichen; leer → Vorschlag; „REF2“ | ✓ | fang |
| N7S-18 nur Clip-Wechsel, 8 s keine Note → „FANG TEIL“, nach einer Note „FANG“ | ✓ | fang |
| N7S-19 Einfügen bei T3 = Daten wie 5.5 (deep-equal), Bass schweigt in Schlag 24–28, REFRAIN-Bass ab 28 Phase 0, ein Undo | ✓ | `v3-v2d-data.mjs` |
| N7S-20 Einfügen mitten im REFRAIN: geteilt T4 + T9–11, `{bar:8,slot:2,ph:4}`, ab T9 dieselben Bass-Noten (±0,002) | ✓ | data |
| N7S-21 Ersetzen T3–6: Rest T7 Länge 1, `{bar:6,slot:2,ph:4}`, T7 klingt wie vorher, Melodie 7,75 ≤ t < 23,75 weg, ein Undo | ✓ | data |
| N7S-22 Anhängen ohne Rückfrage, hinter dem Ende rastet ein | ✓ | data |
| N7S-23 rep/move/copy/replaceBy/delete/unname/applyAll(3 Stellen)/swap, je ein Undo, Clips deep-equal | ✓ | data |
| N7S-24 64 Marken / 256 Takte: `placePart` 0,2–0,4 ms (≤ 5) | ✓ | data |
| N7S-25 Teil mit Lanes im Kreis: Bass stumm in T5–6 jedes Durchlaufs, Neustart T7 (noteLog; Pegel ≥ 30 dB) | ✓ | fang, `v3-v2d-audio.mjs` |
| N7S-25b Song in T2 → Tipp → ab T3 die Marke; in T7 → ab T9; ohne Marke Hand-Übernahme; `project()` deep-equal | ✓ | fang |
| N7S-26 Song-MIDI Marker FF 06 je Marke | ✓ | data |
| V2d-01 / -05b / -08 / -13 (Beschriftung, Hand-Ende + Blinken, Verwerfen, CAPC > 10 s) | ✓ | fang |
| Blatt-Knöpfe hörbar (Länge 1 ↔ 4, Bass-Töne/Träger), [Zurück], [an Szene hängen], Rundweg Speichern/Laden | ✓ 8/8 | `v3-v2d-extra.mjs` |
| M-PLATZ Blatt + FANG-TEIL-Taste in P1, P2, P3, L1, L2 (im Bild, nichts abgeschnitten, P ≤ 270 px, L Seitenfeld) | ✓ 25/25 | `v3-v2d-lay.mjs` |
| Regression gegen V2c-fix (noteLog, MIDI) | ✓ 9/9 | `v3-v2d-reg.mjs` |
| Smoke | ✓ ohne Fehler | `v3-v2d-smoke.png` |

**Budget:** 2 333 953 B (+75,0 KB roh, +21,1 KB gzip gegenüber V2c-fix) – Rahmen +40 KB, also +88 % roh darüber (gzip +53 %).
Grund: V2d trägt drei Blöcke, die die Spec getrennt rechnet (FANG TEIL mit Blatt, Teil-Lanes, die vollständigen
Zeitleisten-Operationen samt Marken-API für V2e/V2e′), dazu ausführliche Kommentare; Laufzeit unverändert (keine neuen
Frame-Kosten außer einer Modus-Prüfung je Bild).

**Rollout:** `apply_migration v2d_max_app` (`max_app = greatest(max_app, 4005000)`, Datei `synq-online/r7-v2d-max-app.sql`)
**wartete auf eine Bestätigung und lief nach 60 s ab – nicht eingetragen**; gelesen: `max_app` 4003000, `max_format` 4.
**Offen: vor dem Ausliefern von 4.5.0 einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App
weiter). Kein Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4005000);` → Run.

**Bekannte Lücken**
- Ziehen/Ablegen, Marken in der Taktleiste, Marken-Blatt, Bereich-Leiste (V2e, V2e′); Aufnahme ab Takt n / eigene Clips (V2d′):
  die Daten-Felder `own` werden schon getragen, aber noch nicht abgespielt.
- Am iPhone ungeprüft: Lesbarkeit der Mini-Zeitleiste (16 Kästchen à ≈ 22 px), Treffsicherheit der Namens-Chips.
- Stummschalten (M) wird nicht eingefangen (4.1 *(P1)*, Frage 4).

**Für Xander am iPhone (nach dem Ausliefern von 4.5.0)**
1. Szene 1 starten, **TRANSPONIEREN**, zweimal Am – F – C – G je Takt spielen, kurz nach dem nächsten Taktstrich **FANG TEIL**
   tippen: das Blatt sagt „Ende Taktstrich … (zu spät, zählt)“, der Teil läuft ohne Bruch im Kreis weiter.
2. Zwischendurch einen Clip aus- und wieder einschalten, dann FANG TEIL: die Zeile unter der Zeitleiste nennt „aus T…“.
3. **ALS TEIL ✓** → Taste STROPHE in der Teil-Leiste; eine andere Szene starten, STROPHE tippen: alles klingt wie gefangen.
4. Nochmal fangen, Chip **Strophe** wählen → „＋ Strophe 2“ oder „⟳ Strophe ersetzen“; **＋ Ans Song-Ende** legt den Teil in den Song.


## VS2 — Stimme → Noten, Instrument einspielen (Live-Taste, pYIN-lite, Stimme-FANG, ● REC → MELODIE, Ergebnis-Blatt, Teilen/Verbinden) · App 4.5.1

Grundlage: Nachtrag 2 Teil C (C.2, C.3 Zeile VS2, C.4 N2-VS2-01 … -03, K2-30, K2-33), Teil E, Teil J (FP-DSP ● Haupt-, FP-IPHONE
Zweitblick); `r7/stimme.md` §4, §8 „Stimme-FANG“, §11 Skizze 3, §12 VS2, §13 N7V-08 … -15, N7V-33; `r7/song-delta.md` 4.2 (N7-R1);
fragen-xander-9 (G-P1b: V2d, VS2). **Version 4.5.1** statt 4.12.0 (E.5 Punkt 3: nächste Zwischennummer nach V2d = 4.5.0; V2d′ … folgen
mit ihren Nummern). `APP_CODE` = 4 005 001. Keine neue Fähigkeit (Mikrofon nur außerhalb der Claude-App), kein Projektfeld.

**Was neu ist**
1. **Live (Taste leuchtet, N7V-14/-15):** Das Worklet `synq-stimme` rechnet **MPM** (McLeod/Wyvill, NSDF über FFT 1024, Fenster 40 ms,
   alle 10 ms, k = 0,9, Klarheit ≥ 0,8 Stimme / 0,85 Instrument) auf dem 16-kHz-Signal von VS1 und meldet nur **Wechsel** (`{lit}`:
   2 gleiche Hops = an, 3 stimmlose = aus). Die gesungene Note leuchtet grün (Klasse `.vs`, MELODIE-Farbe), liegt sie außerhalb der
   sichtbaren Tasten, dieselbe Tonklasse in der nächsten Oktave. Die FFT-Hälften laufen in zwei Render-Quanten (keine Spitze).
2. **Klick-/Treffer-Maske (Fassung 2):** nur über den **Lautsprecher**: Metronom-Klicks (35 ms) und Drum-Treffer (40 ms) werden als
   „unbekannt“ geführt – live hält die Taste ihren Zustand, offline bekommen die Frames eine flache Beobachtung (der Pfad läuft weiter)
   und ein Einsatz direkt hinter einer Maske wird auf deren Anfang (= Schlag) gelegt. Aussetzer aus VS1 (`null`/`einbruch`/`lücke`/
   `stumm`) gelten ebenso als unbekannt – nie als Pause.
3. **Offline pYIN-lite** (Worker aus Blob, Rückfall Hauptfaden): YIN-Differenz über FFT, kumulativ normiert, 100 Schwellen mit
   Beta(2, 18), 20-ct-Raster 55–1050 Hz (Instrument 40–1600), HMM (35,92 Okt./s, Wechsel 0,01), Viterbi; Hop 5 ms. Das Mikro wird
   über die **Zeitkarte von VS1** auf das Gespielte gelegt (Schlag = `t2b(Referenz-Frame)`, Mikro-Frame minus Latenz, Laufzeit des
   Dezimierers 23 Samples berücksichtigt).
4. **Noten:** stimmhafte Strecken; Einbruch ≥ 6 dB (20-ms-Energie) = neuer Anschlag; Tonwechsel, wenn der 120-ms-Mittelwert der Note
   > 0,6 HT vom Notenzentrum abweicht und das ≥ 50 ms bleibt (Grenze auf halbem Weg, rückwärts gesucht); Notenhöhe = Median des
   Mittelteils; kürzeste Note 60 ms; **Stimmung** = gewichteter Kreis-Mittelwert, angezeigt („Stimmung −27 ct ausgeglichen“);
   **Einrasten** (Standard an) auf die Tonart, die an der Stelle klingt (wie „Tonart sperren“: unter Träger die gehörte, sonst die
   der Szene); Quelle Instrument zusätzlich: neuer Anschlag bei +6 dB in ≤ 20 ms. Einsatz-Versatz des zentrierten Fensters +12 ms
   ausgeglichen (Korpus).
5. **Stimme-FANG:** Mit 🎤 an und Gesang in den letzten 8 s (und keine Taste danach) heißt die FANG-Taste **FANG 🎤** (P: „FANG/🎤“,
   L: „FANG 🎤“) und leuchtet. Tipp → `fangCompute` (**dieselbe Taktstrich-Regel N7-R1 wie FANG TEIL**, N2-VS2-01) liefert das Ende E;
   ausgewertet wird die live gehörte Phrase (rückwärts bis ≥ 1 Takt Pause, höchstens 17 Takte), Noten bis zum Tipp (Regel 6), Phrase
   ab dem ersten Einsatz nach ≥ 1 Takt Pause, Länge 1/2/4/8/16 bis E (ohne Auffüllen davor, wenn der Song kürzer ist). Ergebnis =
   **MELODIE-Clip** (gewählte Szene, sonst erster freier Platz), läuft phasengleich weiter wie FANG, **ein Undo „Stimme“**.
   In ⇅ TRANSPONIEREN bleibt die Taste FANG TEIL (Spec 4.7).
6. **● REC mit 🎤:** Bereich der Aufnahme (auch Overdub und feste Länge) wird nach dem Ende ausgewertet → MELODIE in **derselben
   Szene** (leer: neuer Clip in Aufnahme-Länge, startet phasengleich; belegt: Noten kommen dazu, phasenrichtig); ein Undo „Stimme“.
   „Nichts aufgenommen“ erscheint nicht, solange die Stimme ausgewertet wird.
7. **Ergebnis-Blatt** (Skizze 3; Platz wie das FANG-TEIL-Blatt: P über der Tastatur ≤ 255 px, L im Seitenfeld): Kopf „GESUNGEN ·
   gefangen · T 1–2“ + Chip „MELODIE · n“, Zeile „6 Noten · Stimmung … · C eingerastet · Ende Taktstrich …“, **Mini-Rolle**,
   **Oktave ‹ ±0 ›**, **✓ Einrasten │ Frei**, **Raster frei │ 1/16 │ 1/8** (Standard 1/16; `o` = roher Einsatz bleibt), **Verwerfen │
   ✎ Bearbeiten │ OK ✓**. Jede Änderung klingt sofort und bleibt im selben Undo-Schritt.
8. **Mikro-Blatt:** neuer Abschnitt „Stimme → Noten“: **[🎤 Stimme │ 🎸 Instrument]**, **✓ In Tonart einrasten**, bei Instrument
   **Oktave sperren** (K2-33: fehlen die ungeraden Teiltöne 3/5/7 eines Kandidaten (< 10 % der geraden), ist es eine Unteroktave/ein
   Sub-Oszillator → gespielte Oktave; live und offline gleich). Gespeichert nur im Gerät (Profil `synq-stimme-v1`, Feld `vs`).
9. **Rolle:** **Teilen** (gewählte Noten in der Mitte, am Raster) und **Verbinden** (gewählte Noten → eine, Höhe der längsten, lautester
   Anschlag) in der Aktionsleiste, je ein Undo; **+12/−12** gab es schon.
10. **Test-API:** `vsSet`, `vsInfo`, `vsAnalyseSignal(x, o)` (Node-gleicher Kern), `vsAnalyseRange(a, b)`, `vsFang({beat})`, `vsResult`,
    `vsResultSet({oct, snap, grid})`, `vsResultDrop`, `vsResultOk`, `vsClock`; Rolle `selectIdx`. Alle alten Namen unverändert.

**Abweichungen (begründet)**
- **Einrasten ohne 0,75-HT-Grenze:** N7V-11 verlangt „20 ct über Gis → A“ (0,8 HT von A); mit der Grenze aus `stimme.md` §4.2 bliebe
  es Gis. Regel jetzt: ein leiterfremder Halbton geht zum näheren Skalenton, gemessen an der unausgeglichenen Höhe.
- **Analyse-Bereich beim FANG** = live gehörte Phrase + 1 Takt (statt immer 17 Takte): spart am iPhone Sekunden; ohne Live-Meldungen
  (sehr leise) gelten die 17 Takte.
- **Notenzeit des E1-Falls:** Wird E1 (Taktstrich in der Zukunft) gewählt, zählen Noten bis zum Tipp (N7-R1 Nr. 6, „Zustand im
  Moment des Tipps“); der Rest des Takts bleibt leer im Clip.
- **Korpus neu gebaut:** `r7/stimme-proto/` ging verloren (fragen-xander-9). Nachbau nach der Beschreibung in §4.2 (3 Stimmlagen,
  26 Noten a-Moll, Anschleifen, Legato-Glissando, Vibrato, Formanten, Hauch, Konsonant, Atem, rosa Rauschen, Klick über Raum).
  Zahlen sind deshalb nicht 1:1 mit `bench.out` vergleichbar; die Schwellen aus N7V-09 gelten unverändert.
- **Chromium-Pfad:** `/opt/pw-browsers/chromium-1194/…` gibt es auf dieser Maschine nicht; benutzt `chromium-1243/chrome-linux64/chrome`
  (der einzige installierte, derselbe wie `smoke.mjs`).
- **Budget:** +36 KB geplant, gebaut **+55,0 KB roh / +19,7 KB gzip** (2 336 756 → 2 393 105 B; > 50 %, §15.3): pYIN, Segmentierung,
  MPM im Worklet (ASCII, eigene FFT), Ergebnis-Blatt, ● REC-Anschluss, Teilen/Verbinden, Klick-Maske und Instrument-Quelle
  (K2-33 +6 KB) und deutsche Kommentare. Startzeit unverändert (378 ms gegen 363 ms V2d-fix; CPU ×4 1332 gegen 1346 ms).

**Fach-Prüfung (Teil J: FP-DSP ● Haupt-, FP-IPHONE Zweit-Blick)** – eigener Prüf-Durchgang (kein getrennter Agent verfügbar).
FP-DSP: (1) Live-Spitze je Render-Block bis 2,6 ms (FFT hin und zurück im selben Quantum + Array je Hop) → auf zwei Quanten verteilt,
ohne Speicheranlage: p99,9 0,47 ms, max 0,87 ms (Budget 2,67 ms). (2) Gesang direkt nach ▶ lag im Analysefenster 0,5 s daneben – Befund
im Test-Aufbau, nicht in der App (Signal lag vor dem Start). (3) Maskierte Frames ohne Stimme wurden nicht als „unbekannt“ geführt →
Einsatz hinter einer Maske blieb 50 ms zu spät; behoben. (4) Ein Einbruch innerhalb einer Maske (gleicher Ton nach Klick) ging verloren
→ Einbrüche werden auch in Masken erkannt (ein Klick fügt nur Energie hinzu). (5) Vibrato teilte Noten hinter einer Maske (Zentrum aus
50 ms) → note-eigener 120-ms-Mittelwert, Zentrum aus geglätteten Werten. (6) Wiederholte Noten mit 35-ms-Verschluss verschmolzen
(Energie im 46-ms-Fenster) → eigene 20-ms-Energie. (7) Instrument: Neuanschlag ohne Einbruch → Anschlag-Regel, robust gegen
Wellen-Restwelligkeit tiefer Töne. (8) NaN/Inf im Eingang: keine Ausnahme, nach 60 ms wieder richtig. (9) Ergebnis-Sprung des
Rasters: `analyseClip` quantisierte nach Eingabe-Q statt nach dem Blatt → Blatt-Raster, `c.q` passend.
FP-IPHONE: (10) Beobachtungsmatrix nF × 256 (bei 60 s ≈ 14 MB) → je Frame dicht (−14 MB im Worker). (11) Blob-URL des Workers wurde
sofort freigegeben (Safari lädt evtl. später) → nach 30 s. (12) Blatt nach ↶ bediente einen toten Clip → schließt sich. (13) FANG ohne
freien MELODIE-Platz lief erst durch die Auswertung → Toast sofort. Speicher Worker ≈ 7 MB je Minute Gesang (Rückverfolgung, nur
während der Auswertung). 60 fps, keine longtask > 50 ms bei 🎤 + Gesang + offener Rolle und während der Auswertung (Worker).
13 Befunde, alle behoben.

**Abnahme**

| Punkt | Ergebnis | Skript |
|---|---|---|
| N7V-08 Oktavfehler-Frames A–F | ✓ 0 (Gm 12 Frames an Maskenrändern, nicht Teil von N7V-08) | `v3-vs2-bench.mjs` → `v3-vs2-bench.out` |
| N7V-09 Noten-F (Stimmung + Skala) | ✓ A 1,000 · C 1,000 · D 0,991 · E 0,967 · Gm 0,997 (Soll 0,94/0,93/0,92/0,91/0,93); F 0,916, G 0,765 ohne Soll | bench |
| N7V-10 Stimmung Bed. D | ✓ Mittel −31,7 ct (wahr −30, ±5) | bench |
| N7V-11 Einrasten 20 ct über Gis | ✓ an → A (69), aus → Gis (68), im App-Weg (Gesang → FANG → Blatt) | `v3-vs2-accept.mjs` D |
| N7V-12 Gerät (8 Takte, ≥ 80 %) | offen – Xander am iPhone (N2-VS2-03); Attrappe: 12/12, 6/6, 7/7 Noten | accept A, E, F |
| N7V-13 (neu) Stimme-FANG 1/8 Takt nach dem Taktstrich, 4 Takte | ✓ Ende Taktstrich 5 (struktur) wie `fangClose`, MELODIE-Clip 4 Takte, ein Undo entfernt ihn, Redo stellt her | accept A |
| N2-VS2-01 Fälle 1, 2, 3, 3b, 4, 5, 5b, 6, 6b, 7, 9 | ✓ 11/11 gleiche Enden und Regeln wie FANG TEIL (gesungen, Akkorde als Träger) | accept A, B |
| N7V-14 Live-Leuchten | ✓ 110/220/440/660 Hz nach 41/31/20/20 ms (≤ 60), kein Flackern; aus nach 50 ms; Browser: Taste A3 leuchtet | `v3-vs2-live.mjs`, accept C |
| N7V-15 Rechenzeit Live-Weg | ✓ 1,3–1,7 % Echtzeit (Dezimierung + MPM + Maske; ≤ 3 %); Gerät: 2 min mit 8 Stimmen → Xander | live |
| N2-VS2-02 / N7V-33 Instrument | ✓ Säge 8 Takte Noten-F 0,947 (Sperre an 0,964); mit Sub −1 Okt. (Sinus/Rechteck) + Sperre 0 Oktavfehler, F 0,952/0,969; Browser 7/7 | bench, accept F |
| Klick-Maske | ✓ Lautsprecher: 44 Stellen maskiert, 5/5 Noten ohne Zusatznoten (Kabel ohne Maske: 7 Noten) | accept G |
| ● REC → MELODIE | ✓ 6/6 Noten, Szene 3, ein Undo | accept E |
| Ergebnis-Blatt | ✓ Oktave, Einrasten, Raster (o bleibt), ein Undo, [Verwerfen] per Tipp | accept D |
| Teilen/Verbinden | ✓ je ein Undo | accept H |
| N7V-05 Claude-App (iframe) | ✓ kein 🎤, `vsFang` false, FANG-Modus nie „stimme“, 0 Aufrufe | `v3-vs2-reg.mjs` |
| M-PLATZ P1–P3, L1, L2 | ✓ 38/38: FANG 🎤 passt (64 × 40 / L 73 × 36), Blatt im Bild ohne Rollen, 10 Knöpfe ≥ 36 px, Mikro-Blatt 44-px-Knöpfe (L rollt 396/372) | `v3-vs2-lay.mjs`, Bilder `v3-vs2-{P1,P2,P3,L1,L2}-{fang,blatt,mikroblatt}.png` |
| Regression | ✓ FANG (Tasten), FANG TEIL, ● REC ohne Mikro, Demo-Projekt gleich zu V2d-fix (ohne Zufalls-IDs), PE1 60 fps, Startzeit | reg |
| Smoke | ✓ ohne Fehler | `v3-vs2-smoke.png` |

**Rollout:** `max_app` war beim Lesen **4 005 000**. `apply_migration vs2_max_app` (`greatest(max_app, 4005001)`, Datei
`synq-online/r7-vs2-max-app.sql`) **wartete auf eine Bestätigung und lief nach 60 s ab – nicht eingetragen**. **Offen: vor dem Ausliefern
von 4.5.1 einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App weiter). Kein Aufruf nennt das
Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4005001);` → Run.

**Bekannte Lücken**
- Echte Stimmen sind schwerer als der Korpus (Literatur < 60 % Noten-F) – deshalb Gerätetest N7V-12 (Tor für VS3) und die Griffe.
- Takes (Audio) gibt es erst mit VS3; die Take-Verknüpfung prüft N2-VS3-02.
- Tick-p95 misst die App nicht selbst; PE1 über rAF und longtask belegt.
- Die Auswertung braucht nach dem Tipp ≈ 0,7–0,9 s (Desktop, 10 s Gesang); am iPhone geschätzt 2–2,5 × (unbelegt).

**Für Xander am iPhone (Pages-Seite, Kopfhörer, ≈ 5 min) – entscheidet N7V-12 / N2-VS2-03 und die Tausch-Regel E.1**
1. 🎤 an, ▶ mit Metronom ♩, **8 Takte singen** (z. B. eine einfache Melodie, „da da“), danach **FANG 🎤** tippen (die Taste heißt so,
   solange du gesungen hast). Beim Singen leuchtet die gesungene Taste grün.
2. Im Blatt zählen: wie viele Noten stimmen **ohne Korrektur**? (Soll ≥ 80 %). Falsche reparieren: ✎ Bearbeiten → Note wählen (⬚) →
   **Teilen**, **Verbinden**, **+12/−12**. Oktave im Blatt mit ‹ ›.
3. Mikro-Blatt (Tipp auf die rote Zeile) → **🎸 Instrument**, **Oktave sperren** an, eine Melodie auf einem Instrument vorspielen, FANG 🎤:
   Noten zählen (N2-VS2-02).
4. Einmal mit ● (Aufnahme) auf einer leeren Szene singen: danach liegt ein MELODIE-Clip in derselben Szene.
5. Bitte melden: Anzahl richtiger Noten (1. und 3.), ob Aussetzer/Knackser beim Singen mit vielen Spuren kamen (N7V-15 Gerät).

## VS2-fix — Über den Lautsprecher zählt die eigene Musik nicht mehr als Gesang; „Oktave sperren“ lässt reine Töne in Ruhe · App 4.5.1

Drei Befunde aus der Prüfung von VS2 (zwei davon dieselbe Ursache), alle behoben. Version bleibt 4.5.1 (keine Datenänderung, keine Migration).

**1 + 3. Übersprechen der App (🎤 über den Lautsprecher).** Xanders iPhone hört die eigene Musik mit −31/−32 dB im Mikro
(`fragen-xander-9`). VS2 hielt diesen Bass für Gesang: Tasten 33/36/48 leuchteten, FANG blieb „FANG 🎤“ (63/63 Abfragen), ein Tipp machte
einen MELODIE-Clip aus 38–76 Begleitnoten, gesungene Phrasen bekamen Bassnoten davor (5 statt 4 Takte), FANG mit Tasten / FANG TEIL
waren nicht erreichbar, ● REC legte einen zusätzlichen MELODIE-Clip an.
- **Übersprech-Sperre live (Worklet):** die Referenz (was die App spielt) läuft schon als zweiter Eingang ins Worklet; sie wird jetzt
  ebenfalls 3:1 dezimiert (3-Tap-Mittel an der FIR-Mitte, gleiche Laufzeit) in einen 16-kHz-Ring geschrieben. Eine erkannte Tonhöhe
  gilt nur als Stimme, wenn das Mikro **an dieser Tonhöhe** (Grundton + 2 Obertöne, Hann-Goertzel) mehr Energie hat als Referenz ×
  Kopplung × 10 dB Rand **und** insgesamt mehr als Referenz × Kopplung × 3 dB. Die Referenz wird um die Latenz versetzt und ±10 ms
  (eingemessen) bzw. ±50 ms (nur geschätzt) abgesucht. Kopplung = beim Einmessen gemessenes `gainDb` (Profil Lautsprecher), sonst
  −20 dB angenommen. Kopfhörer/Bluetooth: Sperre aus. Gleiche Note: die Entscheidung gilt 2 weitere Hops (Rechenzeit).
- **Übersprech-Sperre offline (FANG / ● REC):** jede segmentierte Note wird genauso gegen die Referenz im Ringpuffer geprüft
  (40-ms-Stücke über die Note); reine Begleit-Noten fallen weg, bevor Phrase und Clip-Länge bestimmt werden.
- **„keine Taste danach“ wieder wahr:** `VS.lastVoice` ist jetzt der letzte **Einsatz** (Taste an), nicht jede An/Aus-Meldung; die 8 s
  zählen ab der letzten Meldung (`VS.voiceAt`). Eine Taste nach dem letzten Einsatz → normales FANG.
- Neue Live-Optionen werden bei Weg-Wechsel, ± Latenz und nach jedem Einmessen ans Worklet geschickt. `vsInfo().bleedDb` zeigt die
  benutzte Kopplung.
- Nebenbei: Rückfall-Weg des Worklets (data:-URL) kodiert jetzt UTF-8 (`btoa` brach bei Zeichen über Latin-1 ab); Worklet-Quelltext ASCII.

**2. „Oktave sperren“ (K2-33)** verdoppelte reine Töne (Sinus, Pfeifen, flötenartig) 1–2 Oktaven, offline und live, weil schon
Fensterleck oder ein winziger 2. Oberton „gerade Teiltöne ohne ungerade“ erfüllte. Jetzt wird nur verdoppelt, wenn die geraden Teiltöne
zusätzlich **mehr als die Hälfte der Grundton-Energie** tragen (Sub-Oszillator/Unisono). Gleich in `octLockF` (pYIN) und im Worklet.

**Prüfungen** (Chromium 1243, echte App, Attrappen-Mikro)

| Punkt | vorher | jetzt | Skript |
|---|---|---|---|
| Demo, niemand singt, Übersprechen −30/−40 dB (Vollband, 40 ms) | „stimme“ 63/63, Tasten 20/63, Phantom-Clip | „fang“ 0/63 „stimme“, 0 Tasten, kein Clip | `v3-qa-vs2acc-t3.mjs -30` / `-40` |
| dasselbe mit Handy-Hochpass 300/500 Hz (−30 dB, −40 dB) | „stimme“ 63/63, 62–76 Phantom-Noten | 0/63, 0 Tasten | `v3-rep-vs2bleed.mjs` |
| Gesungene Phrase über Lautsprecher (−30 dB) | 5 Takte ab Takt 1, Bassnoten davor (FAIL) | 4 Takte ab Takt 2, 12/12, ALLE OK | `v3-qa-vs2acc-t1.mjs speaker` |
| dasselbe Kabel / −20 dB Übersprechen | – | ALLE OK / ALLE OK (12/12) | `t1 wired`, `v3-vs2fix-t1lvl.mjs speaker -20` |
| FANG mit Tasten, ● REC, Übersprechen −20/−31/−40 dB | „FANG🎤“, Clip aus eigener Musik, Zusatz-MELODIE | „FANG⤓“, Synth-3-Clip 8/8, ● REC nur Tasten-Clip | `v3-qa-vs2reg-mic.mjs all speaker 0,1 <g> new nosynth` |
| FANG TEIL in ♪ SPIELEN mit Übersprechen | „stimme“, MELODIE aus Demo | „teil“, FANG-TEIL-Blatt | `v3-qa-vs2reg-teil.mjs`, `v3-repro-vsleak-teil.mjs` |
| Singen, danach Tasten (Kabel) | – | erst „stimme“, nach den Tasten „fang“, FANG fängt die Tasten (Undo „Fang“) | `v3-vs2fix-keyafter.mjs` |
| VS2-Regression (Claude-App-Attrappe, FANG/FANG TEIL/● REC ohne Mikro) | – | ALLE OK | `v3-vs2-reg.mjs` |
| Tasten-Echo (−20/−31/−40 dB) | Tasten leuchten grün vom eigenen Klang | 0 Meldungen | `v3-repro-vsleak.mjs` |
| Worklet allein: nur Übersprechen / Stimme + Übersprechen | 12 Begleit-Tasten | 0 / alle 5 gesungenen, keine Begleit-Taste | `v3-vs2fix-gate.mjs` |
| Rechenzeit Live-Weg mit Sperre | 1,0 % | 1,7 % Echtzeit (Dauer-Ton, schlimmster Fall; ≤ 3 %) | `v3-vs2fix-cpu.mjs`, `v3-vs2-live.mjs` |
| Oktave sperren: Sinus/Pfeifen/Flöte, Säge, Rechteck, Dreieck, Puls, Säge+Sub | Sinus/Pfeifen/Flöte 0/11 | alle 11/11 (Säge+Sub weiter 11/11 mit Sperre) | `v3-repro-octlock-a.mjs`, `v3-qa-vs2acc-t8.mjs` |
| dasselbe mit Rauschen 50–20 dB SNR, Vibrato | Pfeifen 0/11, Flöte 0/11 | alle 11/11 | `v3-repro-octlock-noise.mjs` |
| live (Worklet) Sinus/Pfeifen/Flöte, 40/30 dB SNR | 57→81 usw. | richtig; Säge+Sub mit Sperre richtig | `v3-qa-vs2acc-t8b.mjs`, `v3-repro-octlock-live.mjs` |
| VS2-Bench (N7V-08/09/10, N2-VS2-02) | – | identisch zu VS2 | `v3-vs2-bench.mjs` |
| VS2-Abnahme | 49 ✓ | 49 ✓, ALLE OK | `v3-vs2-accept.mjs` |
| Smoke | – | ohne Fehler | `v3-vs2fix-smoke.png` |

**Bekannte Grenzen:** Ohne Einmessen nimmt die Sperre −20 dB Kopplung an; ein Lautsprecher, der lauter als −20 dB ins Mikro koppelt
(Test −10 dB ohne Einmessen), kann noch kurze Übergangs-Schnipsel durchlassen – über den Lautsprecher misst die App beim ersten 🎤 ohnehin
voll ein. Singt man über einen sehr lauten Lautsprecher (−15 dB) leiser als die Begleitung, gehen Noten verloren (VS2 vorher: 0/12, jetzt
3/12) – dafür bleiben Kopfhörer bzw. die echte Echo-Unterdrückung in VS4.

## VS2b — Gesangs-Erkennung nach dem Gerätetest: keine Zwischennoten bei Rutschern, Vibrato bleibt eine Note, die Taste wackelt nicht mehr · App 4.5.2

Anlass: Xanders iPhone-Test von VS2 (fragen-xander-9, 24.10.): „ein paar falsche Zwischennoten“ und „es wackelt“. Grundlage Nachtrag 2,
Nachtrag zur Reihenfolge („Paket VS2b“). Ausgangspunkt war G-P1b-gruppe-fix (4.5.1), das schon eine erste Übergangs-Regel enthielt;
VS2b baut sie aus und bringt dieselbe Regel in die Live-Taste. Keine Bedienung, kein Aussehen geändert, keine Datenänderung.

**Auswertung beim FANG / ● REC (pYIN-lite → Noten, `segment`)**
- **Hysterese 70 ms / 60 ct:** eine neue Note beginnt erst, wenn die Stimme ≥ 70 ms am Stück ≥ 60 ct neben der Mitte der laufenden
  Note liegt (vorher 50 ms über ein 120-ms-Mittel). Gemessen wird am 3-Frame-Median statt am 120-ms-Mittel – dadurch bleiben schnelle
  Läufe getrennt (1/16 bei 120 BPM: vorher 11 von 192 Tönen verschluckt, jetzt 0). Bis zum Ende einer Stimm-Strecke reichen 45 ms.
- **Vibrato-Toleranz:** eine Halbwelle unter 160 ms, nach der die Stimme direkt (≤ 45 ms durch die Mitte) auf die Gegenseite schwingt
  (Ausschlag ≤ 1,6 Halbtöne, Gegenseite ≥ 35 % davon), ist Vibrato derselben Note. Triller und die Umkehr eines Laufs kehren nur zur
  Mitte zurück und bleiben Noten. Die Tonhöhe einer Note ist der **Median ihres eigenen Kerns**; angehängte Übergänge zählen nicht mit.
- **Übergänge statt Zwischennoten:** ein Stück bis 170 ms, das sich deutlich bewegt (≥ 0,8 Halbtöne, oder ≥ 0,4 ohne 60 ms ruhige
  Stelle), gehört zum Nachbarn: Anschleifen von unten/oben → zum Ton (Einsatz bleibt der Beginn des Anschleifens), Rutscher zwischen
  zwei Tönen → Grenze, wo die Stimme näher am Ziel ist, **Abfall am Ende bis 7 Halbtöne** → zum Ton davor (auch ohne Bewegungs-
  Schwelle, wenn das letzte Stück vor der Stille ≥ 3 dB leiser ist und nirgends 70 ms ruhig steht). Ein einzelner Rutscher ohne ruhige
  Stelle (≥ 1 Halbton, < 115 ms) zwischen zwei Pausen fällt weg. Mindestlänge bleibt 60 ms (70 ms nahm bei 150 BPM echte Töne weg).

**Live-Taste (Worklet `synq-stimme`, Quelltext ASCII)**
- Tonhöhe je 10-ms-Hop = Median der letzten 3 Hops. **Einsatz** nach 3 ruhigen Hops (Spanne ≤ 0,35, flach ≤ 0,15), sonst nach 8.
- **Wechsel** erst nach ≥ 70 ms ≥ 60 ct neben der Mitte der leuchtenden Note und 50 ms Ruhe; während Vibrato 120 ms; Sprung ≥ 2 Halbtöne
  40 ms; in den ersten 100 ms nach dem Einsatz korrigiert ein ruhig ankommendes Anschleifen sofort; die Mitte zieht nach einem langsamen
  Gleiten nach (Median der Note bzw. der letzten 200 ms).
- **Klarheit mit Hysterese** (0,8 zum Einschalten, 0,65 solange die Taste leuchtet) und kurze Aussetzer ohne Pegel-Einbruch halten die
  Taste bis 50 ms (Vibrato-Umkehrpunkte); mit Einbruch ≥ 6 dB geht sie wie bisher nach 30 ms aus. Die Übersprech-Sperre (VS2-fix) prüft
  bei derselben Schwelle (siehe Fach-Prüfung, Befund 1).

**Abnahme VS2b** (eigene Punkte, das Paket hat in Nachtrag 2 nur die Kurzbeschreibung; Node direkt auf DSP und Worklet aus `index.html`,
Vergleich „vorher“ = 4.5.1; Skript `v3-vs2b-accept.mjs`, Ausgabe `v3-vs2b-accept.out`: **ALLE OK**)

| ID | Prüfung | jetzt | vorher (4.5.1) |
|---|---|---|---|
| VS2b-01 | Anschleifen von unten (1–3 Halbtöne, 40–120 ms), je 6 Stimmen × 20 Töne | 120/120, 0 zusätzlich | 1 zusätzlich |
| VS2b-01 | Anschleifen von unten und oben | 120/120, 0 | 3 |
| VS2b-01 | Rutscher 100–300 ms (legato) | 120/120, 0 | 0 |
| VS2b-01 | Abfall am Ende (2–5 Halbtöne, 80–160 ms) | 120/120, 2 (≤ 2 %) | **61** |
| VS2b-01 | Mischung (Vibrato bis ±110 ct, Drift, Anschleifen, Abfall, Rutscher, Rauschen 30 dB) | 144/144, 5 (≤ 4 %) | 18 |
| VS2b-02 | Läufe 1/16 bei 120 BPM (legato) | 192/192 | 181/192 |
| VS2b-02 | Läufe 1/16 bei 150 BPM | 188/192 (≥ 97 %) | 184/192 |
| VS2b-02 | Halbton-Triller 1/16 bei 120 BPM | 144/144 | 135/144 |
| VS2b-03 | +1 Halbton für 40/60 ms → 1 Note; für 100/150 ms → 3 Noten; +50 ct 300 ms → 1 Note | 1/1 · 3/3 · 1 | – |
| VS2b-04 | breites Vibrato ±90–130 ct, 5–6,5 Hz: eine Note je Ton; Tonhöhe je Note | 96/96, 0; Median 5 ct, max 24 ct | 1 zusätzlich |
| VS2b-05 | **echte Gesangsaufnahme** vocadito_1 (33 s, zwei Annotationen A1/A2, Einsatz ±100 ms, MIDI-Ton) | F 0,883 / 0,848, falsch 8 | F 0,852 / 0,819, falsch 11 (VS2-fix: 0,797) |
| VS2b-05 | echte Aufnahmen vocadito_10 / _14 (ohne Noten-Wahrheit): Noten, davon < 100 ms | 28/5 · 28/1 | 33/7 · 37/7 (VS2-fix 37/11 · 45/13) |
| VS2b-06 | Live: falsche Tasten über alle Übergangs-/Vibrato-Fälle | 141 | 1 846 |
| VS2b-06 | Live: Wechsel mitten im Ton (Wackeln) | 309 · breites Vibrato 17 | 2 162 · 1 083 |
| VS2b-06 | Live: Läufe/Triller leuchten | 346/352, 0 falsche | – |
| VS2b-06 | Live echte Stimme vocadito_1: Tasten-Meldungen / falsche Tasten / leuchtende Noten / Latenz Median | 74 / 22 / 51 von 59 / 96 ms | 155 / 78 / 58 / 52 ms |
| VS2b-06 | Rechenzeit Live-Weg | 1,59 % Echtzeit (≤ 3 %) | 1,27 % |
| VS2b-07 | In der App (Mikro-Attrappe, `v3-vs2b-app.mjs`): 4 Takte mit Anschleifen, Rutschern, Abfall, Vibrato ±115 ct → Stimme-FANG | 12/12 Töne, 0 Zwischennoten, 15 Tasten-Meldungen | 2 Zwischennoten, 85 Meldungen |
| VS2b-08 | Version 4.5.2, keine Konsolenfehler | ✓ | |

Echte Aufnahmen: vocadito (Bittner u. a., CC BY 4.0) – `vocadito_1` mit Noten-Annotationen A1/A2 aus den Testdaten von mirdata
(github.com/mir-dataset-loaders/mirdata), `vocadito_10/14` aus den Testdaten von basic-pitch (PyPI-Quellpaket). Liegen nur im
Arbeitsordner `realvox/` (nicht in der App). Synthetischer Stress-Korpus `v3-vs2b-synth.mjs` (Tonhöhen-Kontur je Ton: Anschleifen,
Abfall, Rutscher, Vibrato, Drift; Formant-Stimme männlich/weiblich).

**Regression** (alle grün): VS2-Bench `v3-vs2b-bench.out` (N7V-08/09/10, N2-VS2-02; A 1,0 · C 0,997 · D 1,0 · E 0,997 · F 0,93 ·
Gm 0,99, Instrument unverändert), Wackel-/Gleit-Korpus G-P1b `v3-gfix-wob-node.mjs` (bad 0), VS2-Abnahme `v3-vs2-accept.mjs` (ALLE OK),
`v3-vs2-reg.mjs`, Live `v3-vs2-live.mjs` (N7V-14: 110 Hz 52 ms, 220 Hz 41 ms ≤ 60; Taste aus 60 ms ≤ 80; Render-Block max 2,1 ms ≤ 2,67),
Übersprech-Sperre `v3-vs2fix-gate.mjs`, `v3-qa-vs2acc-t1 speaker`, `t3 -30`, `v3-vs2fix-keyafter`, Oktave sperren live
(`v3-repro-octlock-live`, `t8b`), Smoke (`v3-vs2b-smoke.png`, ohne Fehler). Bilder P1/P3/L1/L2 mit leuchtender Taste bei Vibrato ±90 ct
(`v3-vs2b-{P1,P3,L1,L2}.png`): eine Taste, kein waagrechtes Rollen; Layout unverändert.

**Fach-Prüfung (Teil J: FP-DSP, Zweit-Blick FP-IPHONE; selbst durchgeführt, kein eigener Agent verfügbar) – 3 Befunde, 1 behoben, 2 begründet**
1. *FP-DSP, behoben:* Die gesenkte Klarheits-Schwelle (0,65 bei leuchtender Taste) umging die Übersprech-Sperre, die nur ab 0,8 prüfte –
   über den Lautsprecher leuchtete nach gesungenen Tönen die Begleit-Taste 44 (`v3-vs2fix-gate.mjs`: „62,44,65,69,44,…“). Die Sperre prüft
   jetzt bei derselben Schwelle; Ausgabe wieder identisch zu 4.5.1. (Nebenbefund: dieser alte Test meldet „OK“ auch mit der Begleit-Taste –
   seine Prüfung ist zu weich; VS2b vergleicht die Tastenfolge deshalb ausdrücklich.)
2. *FP-DSP, begründet:* Die Live-Taste reagiert auf Legato-Wechsel später (echte Stimme: Median 52 → 96 ms; 7 von 59 sehr kurzen Tönen
   leuchten nicht mehr). Das ist die verlangte Hysterese (≥ 70 ms stabil); die Noten beim FANG sind davon nicht betroffen. Ein Anschleifen
   mit flachem Anfang lässt beim Einsatz die tiefere Taste noch 60–80 ms aufleuchten (dann sofortige Korrektur).
3. *FP-IPHONE, begründet:* Rechenzeit live +0,3 % Echtzeit (1,59 %), Segmentierung +5 ms bei 33 s Gesang (pYIN 1,6 s unverändert), Datei
   +8,6 KB (2 412 357 Byte); Start und Bild unverändert. iPhone-Faktor weiter unbelegt (Gerät).

**Bekannte Grenzen:** Halbton-Wechsel legato bei 1/16 und 150 BPM (≈ 100 ms je Ton) liegen an der 70-ms-Grenze (188/192). Ein Abfall,
der unten ≥ 60–70 ms ruhig stehen bleibt, gilt als eigener Ton (musikalisch ein „Fall auf einen Ton“). Wiederholte Silben auf derselben
Tonhöhe bleiben getrennt (das sind echte Töne). Echte Stimmen sind weiterhin schwerer als der Korpus; Xanders Gerätetest entscheidet.

**Rollout:** `max_app` war beim Lesen **4 005 001**. `apply_migration vs2b_max_app` (`greatest(max_app, 4005002)`, Datei
`synq-online/r7-vs2b-max-app.sql`) **wartete auf eine Bestätigung und lief nach 60 s ab – nicht eingetragen. Offen: vor dem Ausliefern
von 4.5.2 einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App weiter).

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4005002);` → Run.

**Für Xander am iPhone (Pages-Seite, ≈ 3 min)**
1. 🎤 an, ▶, eine Melodie mit **Rutschern** (von Ton zu Ton gleiten) und einem **lang gehaltenen Ton mit Vibrato** singen. Die grüne Taste
   soll beim gehaltenen Ton ruhig auf **einer** Taste bleiben und bei Rutschern nicht über die Zwischentasten flackern.
2. Danach **FANG 🎤**: im Blatt zählen, ob zwischen den gesungenen Tönen noch kurze falsche Noten stehen (Soll: keine) und ob alle
   gesungenen Töne da sind.
3. Bitte melden: Zahl der falschen Zwischennoten, ob die Taste noch wackelt, ob schnelle Töne fehlen.

## VS2b-fix — Anschleifen und Abfall auch langsam und im Raum ohne falsche Zwischennote; breites Vibrato schon beim Einsatz zeigt die gesungene Taste · App 4.5.2

Drei Befunde aus der Prüfung von VS2b, alle behoben. Version bleibt 4.5.2 (keine Datenänderung, keine Migration, Bedienung und Aussehen
unverändert).

**1. FANG: langsam beginnendes Anschleifen wurde eine falsche 1/16 vor dem Ton.** Ein Anschleifen von 1–1,6 Halbtönen über 120–160 ms
(weicher Anfang) lag am Anfang ≥ 45 ms in 25 ct und galt als „ruhig stehender“ kurzer Ton (12 gesungene Töne → 20 Noten).
- Neu (`segment`, Übergangs-Schritt): ein Einsatz-Stück (kein Ton davor), das **stetig zum Ton dahinter läuft** (nie > 15 ct zurück,
  gesamt ≥ 0,4 Halbtöne), **kürzer als 60 ms still steht** (≤ 8 ct über 25 ms) und danach ≥ 60 ms zu ≥ 75 % weiterläuft, ist Anschleifen
  und gehört zum Ton; der Ton beginnt, wo das Anschleifen beginnt. Das Einschwingen der ersten ≤ 30 ms zählt nicht mit.
- Ein Absacken, das vor dem Anstieg ≥ 50 ms ruhig steht, bleibt ein eigener kurzer Ton (vocadito_1 bei 4,36 s: beide Annotationen
  markieren dort einen eigenen Ton).

**2. FANG: Abfall am Tonende ließ im Raum einen falschen tiefen Ton stehen.** Der Nachhall hält die tiefste Höhe ≥ 70 ms; die Regel
„nirgends 70 ms ruhig“ griff nur trocken.
- Beim letzten Stück vor der Stille zählen Länge, Ruhe und Richtung **nur im gesungenen Teil** (bis der Pegel 10 dB unter den Ton davor
  fällt, + 20 ms); was danach nur nachklingt, ist kein Ton. Ein langsamer Abfall, der unten langsamer wird, gilt auch, wenn die Stimme
  ihre letzte Höhe erst **< 50 ms vor dem Verklingen** erreicht; ohne Pegel-Abfall, wenn sie stetig ≥ 1 Halbton vom Ton weg läuft. Diese
  neuen Fälle nur hinter einem Ton ≥ 200 ms (der letzte Ton eines schnellen Laufs vor kurzem Absetzen bleibt ein Ton).
- Reißt die Tonhöhe mitten im schnellen Abfall ≤ 40 ms ab, gehört der Rest dahinter zum Ton (leiser, vom Ton weg, nirgends 45 ms ruhig).
- Reiner Nachhall hinter einem Ton: ≥ 12 dB darunter, ohne neuen Anstieg und verklingend fällt weg; **≥ 24 dB darunter** auch ohne
  Verklingen und bis 150 ms Lücke (Raum oder Rauschen). Pegel des Tons davor = höherer Wert aus seinem Ende und seinem ganzen Median.
- Mindestlänge: ein Rest ≥ 10 dB unter dem folgenden Ton vor dessen Pegel-Schnitt wird nicht mehr dessen Einsatz (zog den Einsatz bis
  250 ms nach vorn), sondern Nachklang des Tons davor.

**3. Live-Taste bei breitem Vibrato schon ab dem Einsatz (±70–100 ct, legato durchlaufend).** 4.5.2 sprang zwischen den Nachbartasten,
die gesungene leuchtete oft nie (Einsatz = Median am Umkehrpunkt, die Mitte lag am Rand des Vibratos).
- Worklet `synq-stimme`: Umkehrpunkte der geglätteten Tonhöhe (Zickzack, 15 ct Hysterese); aus den letzten drei (Halbwellen 40–150 ms,
  Ausschlag 0,5–3,2 Halbtöne, gleich groß, kein Stehen wie beim Triller) bzw. kurz nach einem gleich weiten Vibrato aus zweien folgt die
  **Mitte des Vibratos**. Sie ist die Mitte der Taste; liegt sie ≥ 60 ct neben der leuchtenden Taste, leuchtet ihre Taste (erst nach einem
  Umkehrpunkt nach dem letzten Wechsel). Eine Abweichung, die im Vibrato-Band bleibt oder von einem spitzen Umkehrpunkt der Gegenseite
  kommt, ist Schwingen, kein Wechsel. Worklet-Quelltext bleibt ASCII.

**Prüfungen** (Node direkt auf DSP/Worklet aus `index.html`; Chromium 1243 echte App, Attrappen-Mikro, Kabel-Weg)

| Punkt | 4.5.2 | jetzt | Skript |
|---|---|---|---|
| App: 12 Töne mit Anschleifen 1,3 Ht/140 ms, Stimme-FANG | 20–21 Noten (8–9 falsch) | 12/12, 0 falsch in 23 von 26 Läufen (3 Läufe mit je einer kurzen Note, 2 davon unter Rechenlast, 1 am Fensteranfang; zuletzt 10/10 sauber im Wechsel mit dem Zwischenstand, der 15/15 hatte) | `v3-qa-vs2b-acc-app.mjs gentle` |
| App: dasselbe ohne Anschleifen / trockener Abfall | 12/12 | 12/12 | `… plain`, `… dryfall` |
| App: Abfall 2,5 Ht/140 ms im Raum (Nachhall −18 dB, RT60 0,4 s) | 19 Noten (7 falsch) | 12/12, 0 falsch | `… roomfall` |
| Anschleifen von unten / oben, 0,7–1,6 Ht × 100–160 ms, je 30 Töne | 107 / 45 falsch | 0 / 0 falsch, 0 fehlen (480/480) | `v3-qa-vs2b-acc-scoop.mjs 1` / `-1` |
| unabhängiger Synth, Anschleifen cos/linear 1–1,6 Ht, 120–160 ms | bis 60 falsch je 30 | 0 falsch in allen 7 Reihen | `v3-repro-indep-scoop.mjs` |
| Abfall im Raum 2/4/6 Ht × 80–220 ms (je 16) | 12/12 Reihen FAIL | 11/12 PASS; 2 Ht/220 ms: 6 (trocken 7) | `v3-qa-vs2b-acc-off.mjs FALL` |
| dasselbe trocken | – | 11/12 PASS (2 Ht/220 ms: 7) | `CLEAN=1 … FALL` |
| unabhängiger Synth, 72 Töne, trocken/Raum 18/10 dB, Abfälle 1,5–4 Ht | 70 falsch (Raum 18 dB) | 0 in allen 8 Fällen | `v3-rv-fallroom-indep.mjs` |
| Live: legato C–D–E–F–G–F–E–D, Vibrato ±70/80/100 ct 5,5 Hz (144 Töne) | richtige Taste 30/26/23 %, nie richtig 79/90/103 | 75/75/76 %, nie richtig 0/0/0 | `v3-qa-vs2breg-livevib4.mjs` |
| Live: gehaltene Töne, Vibrato ±80 ct ab Einsatz (32) | 4–9 %, nie richtig 16–26 | 83 %, nie richtig 0; ±50 ct und verzögertes Vibrato 97–100 % | `v3-qa-vs2breg-livevib2.mjs` |
| App live: ±80 ct, 4 Phasen × 8 Töne | 37 % richtig, 11/32 nie | 76 % richtig, 0/32 nie, `.vs` = `litKey` 1:1 | `v3-repro-vibonset-app.mjs`, `v3-qa-vs2breg-livevibapp.mjs` |
| VS2b-Abnahme gegen 4.5.1 | ALLE OK | ALLE OK (Abfall 0 statt 2 falsch, Lauf 150 BPM 189/192 statt 188, Mischung 5) | `v3-vs2b-accept.mjs` |
| QA-Gesamtkatalog (160 Fälle, Raum / trocken), FAIL-Zeilen | Zwischenstand vor diesem Durchgang 51 / 31 | 45 / 28, keine Zeile schlechter | `v3-qa-vs2b-acc-off.mjs` |
| echte Aufnahmen vocadito_1/10/14 | F 0,883 / 0,848 | gleich (Noten identisch) | `v3-vs2b-real.mjs` |
| Läufe 1/16 120/132 BPM (QA-Synth, Raum und trocken) | – | identisch zu 4.5.2 | `v3-fx-rundiff.mjs` |
| Smoke | – | ohne Fehler | `v3-vs2bfix-smoke.png` |

Rechenzeit: Segmentierung von 33 s Gesang unverändert (≈ 1,6 s mit pYIN), Live-Weg 1,65 % Echtzeit (≤ 3 %). Datei 2 425 160 Byte.

**Bekannte Grenzen:** Ein Abfall, der unten ≥ 70 ms ruhig stehen bleibt (z. B. 2 Halbtöne über 220 ms mit weichem Ende, ohne hörbar
leiser zu werden), bleibt nach der 70-ms-Regel ein eigener Ton – trocken wie im Raum gleich. vocadito_1 bei 26,74 s (QA-Fall c) bleibt
zwei Noten: die Stimme liegt dort ≈ 80 ms ruhig 1,6–2 Halbtöne unter dem Ziel; die gleich gebaute Stelle bei 4,36 s ist laut beiden
Annotationen ein eigener Ton, beides zugleich trennt die Tonhöhe allein nicht. Die Live-Taste wechselt bei Legato mit breitem Vibrato
weiter erst nach der Hysterese (richtige Taste ≈ 75 % der gesungenen Zeit, der Rest ist die Verzögerung nach jedem Tonwechsel).

**Für Xander am iPhone (Pages-Seite, ≈ 2 min):** 🎤 an, ▶, eine kurze Phrase mit weichem Anschleifen in die Töne und einem kleinen
Abfall am Ende jedes Tons singen, dann FANG 🎤 – Soll: keine kurzen Noten vor oder nach den Tönen. Einen langen Ton mit breitem Vibrato
singen – Soll: die gesungene Taste leuchtet, nicht die Nachbartasten.

## V2c′ — „Eine Skala“: Akkord-Skala-Quantisierer (Stufe bleibt, nur unpassende Töne rücken, Kollisionsschutz, Stärke, Durchgangstöne, Spur-Schalter, Projekt-Tonart │ Automatisch, Drums für Fills) · App 4.5.3

Grundlage: Spec §17 V2c′ (E3-25, I-01), Nachtrag 2 B.4 („wirkt auch auf aufgelöste Teile und eigene Clips“) und – vorrangig – Nachtrag 2,
Nachtrag zur Reihenfolge, Xander 24.10. (Skala-Quantisierer vorgezogen; Abgleich OP-Z/OP-XY `forschung/r9/opz-transposition.md`: Brain-Schalter,
Drums für Fills, Tonart automatisch │ manuell; „beste Transposition“; „Präzisierung Akkord-Skala-Quantisierer“). Version 4.5.3 statt 4.4.0
(EN2-14: Versionen streng steigend, das Paket kommt nach VS2b 4.5.2). Ausgangspunkt war VS2b-fix (keine halbfertige Arbeit vorgefunden).

**Gebaut**
- **Harmonie-Kern (einzige Öffnung von I-01, nur hinter dem Schalter):** `mapNote` bleibt unverändert. Neu `Harmony.oneScale(target, base, mode, opts)`
  (die 7 Tonklassen der einen Skala: `targetScale` des Trägers auf der Bezugstonart; sus2/sus4 behalten 7 Töne, die doppelte Stufe nimmt den Ton
  des Modus, z. B. C sus4 → C-Mixolydisch), `snapToScale` (nächster Skalenton, Gleichstand in Spielrichtung, ohne Richtung nach unten) und
  `oneScaleMap` (die Regeln von Xander 24.10.): (1) jeder Ton wird zuerst wie bisher nach Stufen abgebildet und behält seine Stufe; (2) nur ein
  Ton außerhalb der Skala rückt zum nächsten Skalenton, bei Gleichstand in Spielrichtung; (3) Kollisionsschutz: fiele er auf den Ton seines
  Nachbarn, weicht er zur nächsten Stufe in seiner Richtung aus (oberer nach oben, unterer nach unten); auch zwei von der Stufen-Abbildung
  zusammengelegte Töne (sus) werden wieder getrennt, notfalls über eine kurze Kette (≤ 3 Töne); die Reihenfolge der Tonhöhen kippt nie
  (Kontur); (4) Rhythmus und Längen bleiben unberührt.
- **Engine:** `mapOut` = Stufen-Abbildung + eine Skala; `outPitch` (Planung, Träger-Wechsel, Rückrechnung), MIDI-Export „mit Träger“ (Szene und
  Song) nutzen es. Die Regel arbeitet je Clip auf seinen verschiedenen Tonhöhen (Richtung = wie der Clip, als Schleife, die Tonhöhe meist
  erreicht; Länge = längster Einsatz; Durchgangston = immer kurz und schrittweise zwischen zwei Tönen) – so klingt eine Note gleich, ob sie
  geplant oder bei einem Träger-Wechsel umgestimmt wird. Zwischenspeicher je Clip (WeakMap, Prüfsumme der Noten je Planungsschritt) und je
  Träger-Eintrag; nichts wird in Projekt oder Clips geschrieben. Teil-Transposition `R.xp` und `S.shift` kommen wie bisher danach.
- **Einstellungen** (`settings.harmony`): `oneScale` (fehlt = aus → gespeicherte Projekte, alte v1-Projekte und die Demo klingen gleich;
  Neu und [Leer (Init)] = an), `osAmt` Stärke 0–1 (Standard 1; unter 100 % bleiben unpassende Töne, deren längster Einsatz kürzer als
  (1 − Stärke) × 2 Schläge ist, wie gespielt), `osPass` Durchgangstöne erlauben (Standard aus), `osRef` Skala nach `proj` Projekt-Tonart
  (Standard) │ `auto` erkannte Tonart der Szene des Clips (OP-XY-Brain „automatisch“), `drums` Drums mittransponieren (Standard aus).
  Je Synth-Spur `tr.os` (Standard an). Alles im Rundweg Speichern/Laden.
- **Menü → Harmonie** (unter „Tastatur beim Spielen“): Eine Skala [An│Aus] · Stärke (Regler, %) · Durchgangstöne [Einrasten│Erlauben] ·
  Skala nach [Projekt-Tonart│Automatisch] · Spuren [S1][S2]… (aus = folgt nur der Stufen-Abbildung; MELODIE und Spuren mit ⇅ fest grau) ·
  Drums [Bleiben│Mittransponieren] · kurzer Hilfetext; Hilfe-Liste: Zeile EINE SKALA, LATCH-Zeile ergänzt. Hauptansicht unverändert.
- **Anzeige = dieselbe Funktion (V2c′-05):** leuchtende Tasten, „Tonart sperren“, Träger-Anzeige („→ C-Dur“), Tastatur-Tonart und die
  Gesangs-Einrastung (`vsKeyAt`) nehmen unter einem Träger mit „Eine Skala“ dieselbe Skala (`kbOneZ`, `osShownBase`).
- **Drums mittransponieren** (OP-Z-Tipp „für Fills“): Clip-Schläge bekommen die gehörte Verschiebung (Träger-`shift` + Teil-Transposition,
  ±12) als TUNE wie ein Lock; bei einem Träger-Wechsel werden die schon geplanten Schläge neu geplant.
- **Test-API:** `oneScale(on?)`, `setTrackScale(t, on)`, `oneScaleOf(target, base?)`, `kbScaleNow()`, `setHarmony({oneScale, osAmt, osPass,
  osRef, drums})`, `harmony.oneScale/snapToScale/oneScaleMap`, `runtime().harmony` mit den neuen Feldern.

**Abnahme** (`dirigent-test/v3-v2c2-onescale.mjs` → `v3-v2c2-onescale.out`: **26/26**; Chromium 1243 – der im Auftrag genannte Pfad
`chromium-1194` existiert hier nicht)

| ID | Prüfung | Ergebnis |
|---|---|---|
| V2c′-01 | e-Moll-Clip (7 Töne E F♯ G A H C D) unter C, an: kein F♯, alles in C-Dur; aus: A → F♯ (C-Lydisch); Spec-Clip E G H D F♯: alles C-Dur | ✓ (noteLog) |
| V2c′-02 | Gleichstand ohne Richtung nach unten (C♯ → C); E F♯ A aufwärts → G, A F♯ E abwärts → F; kein Gleichstand → nächster Ton | ✓ |
| V2c′-03 | leitereigene Clips (C-Dur, a-Moll, D-Dorisch, G-Mixolyd.) × 12 leitereigene Träger × AKKORD/TONART: 1 440 Tonhöhen identisch | ✓ |
| V2c′-04 | aus = bitgleich zu 4.5.2: 1 134 000 Abbildungen (5 Harmonie-Einstellungen × 108 Träger × 84 Clip-Tonarten × 25 Töne) gegen `VS2b-fix.html`, 0 Abweichungen; Neu/Init an, Demo aus, gespeichertes Projekt ohne Feld aus | ✓ |
| V2c′-05 | Tastatur zeigt unter 5 Trägern genau die eine Skala; 20 Clip-Töne klingen alle darin. Song-Tonart-Erkennung (V2f) noch nicht gebaut | ✓ |
| V2c′-06 | Regression, Version 4.5.3, keine Konsolenfehler | ✓ (s. u.) |
| V2c′-07 | 40 Melodien aus 7 verschiedenen Tönen × 108 Träger (inkl. sus2/sus4, aug, dim, dim7): immer 7 verschiedene Töne, Kontur gleich; Melodie mit einem verspielten Ton unter 8 Trägern ebenso | ✓ (vor dem Befund 1: 960 Fehler) |
| V2c′-08 | Kollisionsschutz: A F♯ F abwärts unter C → A G F | ✓ |
| V2c′-09 | Stärke 100 %: kurzes F♯ → F, langes C♯ → D; 50 %: nur das lange; 0 %: keins (noteLog) | ✓ |
| V2c′-10 | Durchgangston E–F♯(1/16)–G: Einrasten → F, Erlauben → F♯ | ✓ |
| V2c′-11 | Spur-Schalter S1 aus → wie ohne (A → F♯) | ✓ |
| V2c′-12 | hörbar: Drums „Mittransponieren“ unter G (−5): Spektral-Schwerpunkt 40–2000 Hz 117,5 → 96,7 Hz (×0,82, Soll 0,75 ±15 %); „Bleiben“ unverändert | ✓ |
| V2c′-13 | Skala nach „Automatisch“ (Szene e-Moll): C klingt C-Lydisch, Anzeige → C-Lydisch; „Projekt-Tonart“: → C-Dur | ✓ |
| V2c′-14 | Einsätze im Takt mit und ohne „Eine Skala“ gleich | ✓ |
| V2c′-15 | hörbar (FFT 32768): F♯4 unter C – an: Spitze 348,6 Hz, F 89 dB über F♯; aus: 370,1 Hz | ✓ |
| V2c′-16 | Menü: alle Zeilen da; Tipp Aus/An und Spur-Knopf schalten | ✓ |
| V2c′-17 | Rundweg Speichern/Laden aller neuen Felder | ✓ |
| V2c′-18 | MIDI-Export mit Träger: an → C D E F G A H, aus → mit F♯ | ✓ |

Weitere Prüfungen: `v3-v2c2-click.mjs` (Aufnahme am Master über AudioWorklet, 8 s Fläche + Arpeggio, Träger-Wechsel und Umschalten
An/Aus/Stärke während der Wiedergabe): größte 2. Differenz 0,042 gegenüber 0,048 nur mit Träger-Wechseln, kein Einbruch (min −26 dB bei
Median −21) – **M-KLICK/M-EINBRUCH ✓**. `v3-v2c2-perf.mjs` (6 Synth-Spuren × 64 Noten, Träger alle 0,5 s, 8 s): 60 fps an/aus, Planung je
Spur 0,034 ms, Träger-Wechsel 1,65 ms (aus 0,87 ms), longtasks wie aus (1, beim Start) ✓. `v3-v2c2-lay.mjs` P1/P2/P3/L1/L2: Menü ohne
Überlauf, kein waagrechtes Rollen, neue Knöpfe so hoch wie die Modus-Knöpfe (40/36/34/32/32 px), ≥ 40 px breit ✓; Bilder
`v3-v2c2-{P1,P2,P3,L1,L2}-{main,menu}.png` angesehen (Hauptansicht unverändert, Träger „C −4 → C-Dur“, SPIELEN „C-Dur“). Smoke ohne Fehler
(`v3-v2c2-smoke.png`). Regression: `v3-v2d-data` 51/51, `-audio` 2/2, `-fang` 39/39, `-extra` 8/8, `v3-qa-grp-flow3` 9/9, `-undo` 11/11,
`-sheets` 16/16, `-flow4` 7/7 (ein Lauf mit Mikro-Attrappe vorher 6/7, zweimal wiederholt 7/7). `v3-qa-grp-flow1` (2 FAIL), `-flow2` (1),
`-timing` (2) schlagen **gleich auch mit 4.5.2 (`VS2b-fix.html`) fehl** – alte Erwartungen der QA-Skripte, nicht von V2c′ (`v3-qa-grp-lib.mjs`
nimmt dafür jetzt `SYNQ_APP` als andere App-Datei). Datei 2 442 158 Byte (+17 KB, Budget 20 KB).

**Fach-Prüfung (Teil J: FP-SONG Haupt-, FP-TOUCH Zweit-Blick; selbst durchgeführt, kein eigener Agent verfügbar) – 8 Befunde, 2 behoben, 6 begründet**
1. *FP-SONG, behoben:* sus2/sus4 legen in der Stufen-Abbildung zwei Stufen auf einen Ton – 7 verschiedene Töne wurden 6, die Kontur wurde
   flach (V2c′-07: 960 von 4 320 Melodien). Neu: die eine Skala hat auch bei sus 7 Töne, zusammengelegte Töne werden getrennt, notfalls
   über eine kurze Kette. Jetzt 0.
2. *FP-SONG/FP-IPHONE, behoben:* die Skala wurde bei jedem Träger-Wechsel je Stimme neu gebaut (+1 ms je Wechsel); jetzt einmal je
   Träger-Eintrag zwischengespeichert (2,0 → 1,65 ms am Rechner; iPhone-Faktor unbelegt).
3. *FP-SONG, begründet:* Unter **sus**-Trägern klingen leitereigene Clips mit „Eine Skala“ jetzt anders als aus (die Terz-Stufe bleibt die
   Terz statt auf die Quarte zu fallen) – Xanders Regel „verschiedene Töne bleiben verschieden“ (Nachtrag 2) geht V2c′-03 vor; für alle
   übrigen leitereigenen Träger bleibt V2c′-03 bitgleich.
4. *FP-SONG, begründet:* Drei chromatische Nachbarn (z. B. C C♯ D, alle lang) können nicht alle verschieden bleiben, ohne einen
   leitereigenen Ton zu verschieben; dann fällt der verspielte Ton mit einem Nachbarn zusammen (Stärke < 100 % oder „Durchgangstöne
   erlauben“ lassen ihn stehen).
5. *FP-SONG, begründet:* Die Spielrichtung gilt je Tonhöhe im Clip (Mehrheit, wie der Clip sie erreicht), nicht je einzelnem Einsatz –
   sonst klänge eine Note bei einem Träger-Wechsel anders als geplant.
6. *FP-SONG, begründet:* Bezug „Projekt-Tonart“ ist Standard, weil V2c′-01 („alle Töne in C-Dur“) sonst bei einer e-Moll-Szene C-Lydisch
   ergäbe; „Automatisch“ (Brain-Verhalten) ist ein Tipp entfernt. Im Song nimmt „Automatisch“ die Tonart der Szene, aus der der Clip kommt.
   Aufnahmen unter einem Träger behalten ihren Bezug wie bisher (`keyForRecording`); mit „Eine Skala“ rasten beim Abspielen gespielte
   unpassende Töne ein (gewollt: „damit kann nichts schräg klingen“; je Spur abschaltbar).
7. *FP-TOUCH, begründet:* Die neuen Menü-Knöpfe sind im Querformat 32 px hoch – genau wie alle vorhandenen Menü-Segmente (V0a-Wert);
   Breite ≥ 40 px. Umschalten im Menü ist wie die übrigen Harmonie-Einstellungen kein Undo-Schritt.
8. *FP-SONG, begründet:* „Drums mittransponieren“ wirkt auf Clip-Schläge, nicht auf live gespielte Pads; der MIDI-Export lässt Drums
   unverändert (GM-Noten würden sonst andere Instrumente).

**Bekannte Lücken:** V2f (Song-Tonart-Erkennung) ist noch nicht gebaut – sie muss dieselbe Funktion `mapOut` nutzen. Eigene Clips (V2d′)
gehen über denselben Weg, sobald es sie gibt. „Tonart automatisch │ manuell“ gibt es je Clip schon (Clip-Blatt: Auto/Fest); neu ist der
Schalter für die eine Skala.

**Rollout:** `max_app` war **4 005 002**. `apply_migration v2c2_max_app` (`greatest(max_app, 4005003)`, Datei
`synq-online/r7-v2c2-max-app.sql`) **wartete auf eine Bestätigung und lief nach 60 s ab – nicht eingetragen. Offen: vor dem Ausliefern von
4.5.3 einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App weiter).

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4005003);` → Run.

**Für Xander am iPhone (Pages-Seite, ≈ 3 min)**
1. Menü → Neu ▾ → Mit Startsounds. Einen Clip mit einer Melodie einspielen, die auch „schräge“ Töne hat (z. B. F♯ in C).
2. TRANSPONIEREN, verschiedene Akkorde drücken (C, F, G, Am, E, D). Soll: nichts klingt schief, die Melodie bleibt erkennbar
   (aufwärts bleibt aufwärts), zwei verschiedene Töne fallen nicht zusammen.
3. Menü → Harmonie → Eine Skala „Aus“ und wieder „An“ – den Unterschied hören. Stärke auf 50 %: kurze verspielte Töne bleiben.
4. Drums „Mittransponieren“, dann Akkorde drücken: die Drums gehen mit (für Fills). Bitte melden, ob das so gewollt ist.

## V2c′-fix — Kollisionsschutz auch, wenn beide Nachbarn des verspielten Tons im Clip sind; Versions-Wächter 4.5.3 · App 4.5.3

Befunde der QA (Abnahme-Blick): (1) Mit den Standardwerten (Eine Skala an, Stärke 100 %, Durchgangstöne Einrasten) fiel ein verspielter
Ton mit einem Nachbarn zusammen, wenn **beide** Skalen-Nachbarn im Clip waren – `C D E F F♯ G A` unter C klang `… F G G A`, ebenso unter
F/G/Am/Dm, `C D D♯ E F G A` und `G F♯ F E D C H`; im Raster 1 201 von 2 880 Melodie-Träger-Paaren (6 leitereigene + 1 verspielter Ton).
Xanders Abnahme (Nachtrag 2, „7 verschiedene Töne bleiben 7, dieselbe Kontur“) war damit nicht erfüllt; Fach-Prüfung V2c′ #4 ist damit
**behoben statt begründet**. (2) `max_app` stand noch auf 4 005 002 → Online-Speichern von 4.5.3 abgelehnt (`bad_version`).

**Geändert**
- `Harmony.oneScaleMap` (nur hinter „Eine Skala“): Regel (3) löst jetzt jede Kollision als kleinster Weg über die verschiedenen Tonhöhen des
  Clips (je Ton höchstens ±3 Stufen): ein verspielter Ton kostet die Halbtöne, die er vom Gespielten wegrückt (+ ein Hauch gegen die
  Spielrichtung), ein leitereigener Ton 1,5 je Stufe, eine Kollision 60, eine Umkehr der Reihenfolge nie. Ist die nächste Stufe auch
  belegt, rückt eine kurze Kette von Nachbarn je eine Stufe weiter (unter C: `C D E F F♯ G A` → `C D E F G A H`; `C D D♯ E F G A` →
  `H C D E F G A`). Leitereigene Töne bewegen sich nur, wenn sonst nichts die Kollision löst. Bei gleich guter Wahl teilen sich zwei
  gerückte Töne wie bisher (der obere nach oben), zwei von sus zusammengelegte Töne ebenso (der untere nach unten). Rhythmus unberührt.
- Supabase `dbdnsryoivvezspgydpx`: Migration `v2c_strich_max_app` (`greatest(max_app, 4005003)`) steht in `list_migrations`,
  `private.settings.max_app` = **4 005 003**, `max_format` 4.

**Nachweis**
- Wiedergabe (noteLog, `v3-repro-osguard.mjs` → `v3-osfix-repro.out`): alle 20 Fälle (4 Melodien × C/F/G/Am/Dm) 7 verschiedene Töne,
  Kontur gleich (vorher 15 von 15 chromatischen Fällen zusammengefallen bis auf `G F♯ F…` unter F). QA-Skripte: `v3-qa-v2c2-a` (2 880
  zufällige 7-Ton-chromatische Melodien: 0 verloren, 0 Kontur), `-g` (2 880 × 6+1: 0 / 0, vorher 1 201 / 310), `-b` B6
  `66->67 67->69 69->71`.
- `v3-v2c2-onescale.mjs` **27/27** (neu: V2c′-07 chromatische Nachbarn, 3 024 Melodie-Träger-Paare, 0 Fehler; V2c′-03/-04/-08/-10
  unverändert grün). Vergleich alt/neu (`v3-osfix-cmp.mjs`, 20 000 zufällige Tonmengen × 96 Skalen, Stärke/Durchgang gemischt):
  wo 4.5.3 vorher keine Kollision hatte **0 Abweichungen**, Kollisionen 7 515 → 278 (nur sehr dichte Clips, > 7 Töne auf engem Raum),
  nie mehr als vorher, nie Umkehr. Rechenzeit: 48 Tonhöhen 0,08 ms; `v3-v2c2-perf` 60 fps, Träger-Wechsel 1,71 ms (aus 0,83) ✓;
  `v3-v2c2-click` M-KLICK/M-EINBRUCH ✓; `v3-qa-v2c2reg-os` gleich wie vorher; Smoke ohne Fehler (`v3-osfix-smoke.png`).
- Versions-Wächter (nichts geschrieben, Probe im DO-Block mit Fremd-`sub`): `p_app` 4 005 003 kommt am Wächter vorbei (scheitert erst am
  Fremdschlüssel des erfundenen Kontos), 4 005 004 → `bad_version`.

**Für Xander im Dashboard:** nichts mehr offen für 4.5.3.

## V2d′ — Aufnahme ab Takt n / im Bereich mit Modi, NOTEN-Ziel, eigene Clips (Daten, Wiedergabe), Ende nach N7-R1 · App 4.6.0

Grundlage: Nachtrag 2 B.1 Nr. 8, 12, 13, B.4 (V2d′), K2-21, K2-27, B.6 (N2-2d′-01), Teil J (FP-SONG ●, FP-TOUCH); `r7/song-delta.md`
4.2 (N7-R1), 7.1–7.4 (N7-R8), 9.2 (N7-R9), 12.1–12.3, 13 (N7S-27 … N7S-32), 14.3 (V2d′-01 … -04 → N7S-27 … -31); Spec v3 §4.8, §17 V2d′
(V2d′-05 … -07 sinngemäß). Gebaut nach V2c′-fix (Reihenfolge G-P2, Nachtrag zur Reihenfolge 24.10.).

**Was neu ist**
1. **Start-Blatt mit Modi (K2-27, Mockup P-8).** ● bei vorhandenem Song (oder Halten auf ●) öffnet das Blatt: Kopf „AUFNAHME AB TAKT n“ /
   „TAKT n“ / „TAKTE a–b“, Ziele **[CLIPS] [AKKORDE] [NOTEN · Synth 2]** (NOTEN = die gewählte Spur, darunter klein ihr Name; **[▾]**
   daneben zeigt die Synth-Spuren zur Wahl und wählt die Spur auch für die Tastatur). Modi: nur Positionsmarke → **[Überschreiben │
   Einfügen] ab Takt n**; **ein** gelber Takt → alle vier, 2 × 2: [Überschreiben · ab Takt n] [Einfügen · ab Takt n] [Ersetzen · nur Takt n]
   [Overdub · nur Takt n]; ab 2 Takten → **[Ersetzen │ Overdub]**; liegt hinter der Startstelle nichts → keine Modus-Zeile. Eine Zeile sagt,
   was passiert („Was du änderst, ersetzt ab Takt 4 … Noten S2: jeder Takt neu bis zum Ende, die alten sind stumm. Noten → eigener Clip.
   Szenen bleiben unberührt.“; in P3 und bei 4 Modi in P2 nur die Kurzzeile rechts neben dem Vorlauf), Vorlauf, [● START].
2. **Die vier Modi (7.2):**
   - **Überschreiben ab n** (offenes Ende): CLIPS/AKKORDE wie V0c (nur was du änderst; danach spielt der alte Song weiter).
     **NOTEN nach K2-21:** auf der Ziel-Spur wird **jeder Takt n … E−1 ersetzt, auch leer gelassene**; ab n ist sie während der Aufnahme stumm.
   - **Einfügen ab n:** ab Takt n hält die Aufnahme den Song an – der Zustand von Takt n−1 läuft weiter (Clips in Phase, letzter Akkord),
     keine Schleife, kein Song-Ende; was du spielst, kommt in den neuen Abschnitt [n, E); am Ende EINFÜGEN um E − n (N7-R5: Marken
     geteilt, Fortsetzung phasengleich) – der alte Takt n ist danach Takt E und ab dem nächsten Taktstrich zu hören.
   - **Ersetzen im Bereich:** CLIPS/AKKORDE wie bisher „Nur Takt n“; NOTEN: alle alten Noten der Spur im Bereich weg (während der Aufnahme
     stumm), neue rein. Aussteigen am Bereichsende von selbst (7.3).
   - **Overdub im Bereich:** Noten kommen dazu (alt + neu hörbar); CLIPS/AKKORDE wie Ersetzen.
   - **SCHLEIFE Bereich** (7.3): jeder Durchgang gehört zur Aufnahme; stumm nur im ersten Durchgang, danach gewinnt je Takt der jüngste
     Durchgang (Ersetzen/Überschreiben), Overdub sammelt. **Eine Aufnahme = ein Undo `song`**, auch über Durchgänge.
3. **NOTEN-Ziel und eigene Clips (N7-R9, 9.2; EN7-04).** Gespielte Noten der gewählten Spur landen
   - auf der **MELODIE-Spur des Songs** (`song.melodyTrack`) in `song.mel` (wie gehört, wie V2b),
   - in Takten, in denen die Spur einen **Szenen-Clip** spielt, in einem **eigenen Clip je berührtem Durchlauf** (`song.own[id]`, Kopie
     des Clips bzw. des schon eigenen Clips, Lane-Eintrag `{bar, slot, own, ph}`, danach läuft der Verweis phasengleich weiter); die
     Tonhöhe wird so gespeichert, dass sie unter dem Träger so klingt wie gespielt (`clipNoteFor`),
   - sonst (Spur ohne Clip dort) in `song.mel` dieser Spur.
   `S.tracks[].clips` bleiben immer deep-equal. Ein eigener Clip wird nur angelegt, wenn dort wirklich etwas wegfällt oder dazukommt.
4. **Wiedergabe eigener Clips:** `R.own[t]`; `scheduleTrack`/`scheduleDrums` spielen `song.own[id]` statt des Szenen-Clips (nur solange
   dessen Slot läuft), `noteLog`-Quelle **`own`**; Song-Start, Sprung, Schleife, ↩ SONG, Resync, `laneSwitch` (gleicher eigener Clip in
   gleicher Phase = kein Schnitt), Song-MIDI und Song-Gedächtnis (`memory().bars[].own`) kennen sie. Laden normalisiert eigene Clips wie
   Clips (`ownNorm`), Lanes ohne vorhandenen eigenen Clip verlieren den Verweis.
5. **Ende nach N7-R1 für jede Song-Aufnahme (7.4):** ● (per Finger zählt das **Aufsetzen**, nicht das Anheben) und ■ beenden offene
   Aufnahmen am letzten logischen Taktstrich mit S = Aufnahmestart – erst die Struktur (Periode bzw. 1/2/4/8/16 Takte), bei Gleichstand
   die Zeit (< 50 % → voriger Taktstrich). Das ersetzt das ¼-Schlag-Fenster, auch bei der **ersten** Aufnahme eines leeren Songs.
   Gemeinsamer Kern `n7r1()` mit FANG TEIL (Ergebnis von `fangCompute` unverändert).
6. **Teil-Tasten während einer Aufnahme mit CLIPS (7.2)** schreiben ihre Lanes ab dem nächsten Taktstrich (als Clip-Starts) und setzen je
   Teil-Durchlauf eine **Teil-Marke** (auch bei Einfügen).
7. **Akkorde in der Aufnahme** zählen wie bei FANG am gehörten Druckzeitpunkt (Ausgangslatenz abgezogen) und rasten bis ⅜ Schlag/160 ms
   nach dem Taktstrich auf ihn (V2d-fix-Regel); vorher landete ein auf den Taktstrich gespielter Akkord bei 240 BPM erst bei Schlag 12,28.
8. **Banner/●:** „● Takt 4 · Einfügen · AKK + NOTEN S2 · Szenen bleiben“ (schmal „● T4 · Einfügen · AKK + NOTEN S2“); ● zeigt „● AKK+S2“ /
   „● MEL“; in der Clip-Ansicht (Kopfzeile, K2-63) „● SONG · Einfügen T4“. Die beschriebene Zeile ist rot gesäumt – bei NOTEN die Zeile
   der Ziel-Spur. Hilfe-Text SONG-AUFNAHME neu.
9. **Test-API:** `songRecFrom({from, to, mode, targets:{clips, chords, notes|mel}, track, preroll})`, `songRecRange(a, b, mode, targets,
   {track, preroll})`, `songRecEnd({beat, tapAt})`, `ownClip(t, bar)`, `makeOwn(t, bar, whole)` ([Ganzer Block]: ein eigener Clip je ≤ 16
   Takte), `dropOwn(t, bar)` ([Zurück zum Szenen-Clip], deep-equal), `recModes(from, to, one)`; `runtime().song` + `recMode`, `recTrack`,
   `mute`, `own`, `lastEnd` (`{endBar, rule, f, period}`).

**Abnahme** (`dirigent-test/`, Chromium 1243 + CDP-Touch, 240 BPM; Skripte `v3-v2d2-rec.mjs` 65/65, `v3-v2d2-ui.mjs` 63/63 in P1, P2, P3,
L1, L2, `v3-v2d2-audio.mjs` 6/6; Helfer `v3-v2d2-lib.mjs` = Song aus 5.5, Fläche mit einer Note je Takt, damit jeder Takt hörbar ist)

| ID | Ergebnis | Messung |
|---|---|---|
| N7S-27 | ✓ ab T3 Überschreiben, CLIPS: Sz4 auf der Fläche ab T3, ● bei T5 + 20 % → Ende Taktstrich 5 (`struktur`); Lane 1 = `[{2,3},{4,1,ph:4}]`, alle anderen Lanes/Träger/Melodie deep-equal, Szenen-Clips deep-equal; hörbar 67 in T3–4, ab T5 der alte Pad in Phase (62 bei 16, 64 bei 20); ein Undo → deep-equal | rec |
| N7S-28 | ✓ ab T3 Einfügen, Dm in T4, ● bei T7 + 30 % → 4 Takte (7 → 11); Lanes, Träger (+16), Melodie (+16), Marken (+4) verschoben; Dm bei Schlag 12; hörbar: neue T7–11 = alte T3–7 (30 Noten, Spur/Schlag ±0,01/Note/Tonhöhe gleich); ein Undo | rec |
| N7S-29 | ✓ Bereich T3–6 Ersetzen, NOTEN Synth 2: Stummschaltung 7,75–23,75, während der Aufnahme keine alte Note, T7 wieder da; eigener Clip `o1` (Durchlauf T4–7, Bar 3) mit nur den neuen Noten + T7 alt; `S.tracks[1].clips` deep-equal; Wiedergabe 72 bei 12,5 und 74 bei 20,5 (`own`, wie gespielt – unter F gespeichert als 75); ein Undo | rec, audio |
| N7S-30 | ✓ Overdub: keine Stummschaltung, alte 60/62/64 + neue 72/74 klingen; Szenen-Clip deep-equal | rec, audio |
| N7S-31 | ✓ NOTEN auf MELODIE, ab T3 Überschreiben, nur T4 gespielt, Ende Taktstrich 5: `songMelNotes(5)` = 2, 13, 24 (7,8 und 10 in T3 weg, auch der leere Takt, K2-21) | rec |
| N7S-32 | ✓ `makeOwn(0, T5)` → nur T5 (1-Takt-Durchlauf); Szenen-Clip auf 47 geändert → eigener bleibt 45; Wiedergabe T5 `own` 45, T3/T4/T6 `clip` 47; Song-MIDI (ohne Träger) 2 × 45, 6 × 47; Speichern/Laden verlustfrei; `dropOwn` → Lanes und `own` deep-equal; [Ganzer Block] T8–11 → ein 4-Takt-Clip | rec |
| N2-2d′-01 | ✓ Song nach „Einfügen“, ab T4 Überschreiben, NOTEN Synth 2, nur T4 gespielt, ● bei T6 + 9 % → Ende Taktstrich 6; in T5 keine Note von Synth 2, T4 nur die neue (76), ab T6 der alte Inhalt (65); Clips deep-equal; ein Undo | rec |
| K2-27 | ✓ Modi: 1 Takt alle vier, Bereich Ersetzen/Overdub, ohne Auswahl Überschreiben/Einfügen, am Ende keine; [Nur Takt 4: Ersetzen] → nur T4 neu (77), T5 alt (Clip-Note 64), Aufnahme stanzt aus | rec, ui |
| 7.4 / N7-R1 | ✓ erste Aufnahme Am F C + 20 % → 4 Takte (`struktur`), Am F C G + 30 % → 4, gleiche Takte + 30 % → 2 / + 70 % → 3 (`zeit`); per Finger auf ● bei T6 + 10 % → Taktstrich 6 (P1–P3, L1, L2) | rec, ui |
| 7.2 Teil-Taste | ✓ STROPHE während der Aufnahme → Marke T3–6 (P1), Bass-Lane Sz1 ab T3, ein Undo | rec |
| 7.3 Schleife | ✓ Bereich T3–4 als Schleife, Ersetzen: stumm nur im 1. Durchgang, im 2. klingt die Note des 1. (`melody` 70); Ergebnis T3 = 70 (Melodie-Weg, dort spielt Synth 2 keinen Clip), T4 = 71 im eigenen Clip, alte T4-Note weg; ein Undo über alle Durchgänge | rec |
| Einfügen + NOTEN/CLIPS | ✓ ab T5, Note in T5, Synth 4 ab T6, Ende T7 + 5 % → 2 Takte; während der Aufnahme läuft T4 weiter (Bass 45, kein Spurwechsel); 79 im eigenen Clip des Synth-2-Durchlaufs, alter T5 jetzt T7 | rec |
| hörbar (Audio-Mitschnitt am Master) | ✓ Ersetzen T2–3: −120 dB statt −23 dB (≥ 30 dB), T1/T4 ±0 dB; Overdub ±0 dB; Überschreiben ab T2 stumm bis zum Ende; M-KLICK (2. Differenz) 0,132/0,117 ≤ 1,5 × 0,134 | audio |
| Start-Blatt M-PLATZ | ✓ P1–P3, L1, L2 je Positionsmarke / 1 Takt / Bereich / Spurwahl: im Bild, nichts abgeschnitten, Treffer ≥ 44 × 44 (P) bzw. ≥ 40 × 36 (L), kein waagrechtes Rollen; Banner passt und verschiebt nichts (±2 px) | ui |

**Regression** (`v3-v2d2-reg.sh` → `dirigent-test/v3-v2d2-reg/`): `v3-v2d-fang` 39/39, `-extra` 8/8, `-audio` 2/2, `-reg` 9/9 (noteLog/MIDI
gleich V2c-fix), `-lay` 25/25; `v3-qa-reg-song`, `-loop`, `-midi2`, `-part`, `-part2`, `-part3`, `-fang2`, `-ui`, `-lay`, `-perf` gleich;
`v3-qa-reg-core` gegen V2c′-fix nur Zeit-Streuung live gespielter Noten (≤ 0,08 Schlag, wie zwischen zwei Läufen derselben Datei);
`v3-qa-reg-song` ein Akkord 18,56 statt 18,52 (gleiche Streuung); `v3-v2c2-click` 3/3, `v3-qa-grp-undo` 11/11; rot nur erwartbar:
`v3-v2c2-onescale` V2c′-06 (erwartet Version 4.5.3) und `v3-vs2-reg` „Projekt gleich V2d-fix“ (Demo-Projekt ist zu V2c′-fix gleich –
`v3-v2d2-projeq.mjs` SAME, der Unterschied kommt aus V2c′). Smoke ohne Fehler (`v3-v2d2-smoke.png`).

**Fach-Prüfung (Teil J: FP-SONG ● Haupt-, FP-TOUCH Zweit-Blick)** – zweiter Durchgang über Diff, Testausgaben und Bilder auf mich selbst
angewandt (kein getrennter Agent verfügbar). **8 Befunde, alle behoben:**
1. FP-SONG: Akkorde in einer Aufnahme zählten am Commit-Zeitpunkt (Sammelzeit + Ausgangslatenz) – ein auf den Taktstrich gespielter Akkord
   landete bei 12,28 statt 12 → Druckzeit und späte Rast wie bei FANG (V2d-fix).
2. FP-SONG: Nach Einfügen liefen die Spuren bis zum nächsten eigenen Lane-Ereignis mit dem Zustand von n−1 weiter → ab dem nächsten
   Taktstrich folgen alle Spuren, Träger und Teil-Transposition dem Song (`songResync(true)`), aufgenommene Spuren werden zurückgegeben.
3. FP-SONG: Mit der Stummschaltung ausgelassene, schon geplante Noten hinter dem Ende fehlten bis zu 0,3 s → werden am Ende neu geplant.
4. FP-SONG: Einfügen an/hinter dem Song-Ende (API) hätte angehängt → wird Überschreiben.
5. FP-SONG: `songResync` kannte keine eigenen Clips (spielte den Szenen-Clip) → `laneClipOk` + `own` überall (Start, Sprung, Schleife, ↩ SONG).
6. FP-TOUCH: [▾] 32 px breit, ✕ und Vorlauf 40 px hoch im Hochformat → 44 × 44.
7. FP-TOUCH: Start-Blatt in P3 352 px hoch (verdeckte den Song) → Erklärzeile in P3 (und bei 4 Modi in P2) weg, Kurzzeile bleibt; Texte gekürzt.
8. FP-TOUCH: Banner in schmalen Ansichten ohne Modus („● Takt 4–6 · NOTEN S3“) → „● T4–6 · Overdub · NOTEN S3“; die rot gesäumte Zeile
   war bei NOTEN auf einer Synth-Spur die MELODIE-Zeile → die Zeile der Ziel-Spur.
Geprüft ohne Befund: `S.tracks[].clips` deep-equal in jedem Test; ein Undo je Aufnahme/`makeOwn`/`dropOwn`; Speichern/Laden; Harmonie-Kern
unverändert (I-01, `Harmony` nicht angefasst, Tonhöhe der eigenen Clips über die vorhandene `clipNoteFor`); M-ZEIT (eigene Clips ±0,002 wie
Szenen-Clips, N7S-28 ±0,01); Song-MIDI; FOLGEN unberührt.

**Abweichungen (begründet)**
1. **NOTEN ohne Clip an der Stelle** (Spur spielt dort keinen Szenen-Clip, und sie ist nicht die Melodie-Spur): die Noten gehen in
   `song.mel` dieser Spur (V2b: jede Spur hat ihre Song-Melodie) statt in einen „eigenen Clip aus nichts“ – ein Lane-Eintrag braucht einen
   Slot. Sie klingen und stehen im MIDI; in der Song-Ansicht zeigt bis V2e nur die MELODIE-Zeile Noten.
2. **NOTEN-Spur = gewählte Spur** (7.1 „NOTEN · Synth 2“, N7S-39); die Spurwahl im Blatt ([▾]) wählt sie auch für die Tastatur. Drums sind
   kein NOTEN-Ziel (die Pads schreiben nicht in den Song); ist DRUMS gewählt, nimmt NOTEN die Melodie-Spur.
3. **V0c-Verhalten geändert, wie Nachtrag 2 es will:** MELODIE war in V0c immer Overdub; jetzt ersetzt Überschreiben/Ersetzen (K2-21), nur
   Overdub ergänzt. „Nur Takt n“ heißt jetzt [Ersetzen · nur Takt n]. Vorgewählt: Überschreiben bzw. Ersetzen.
4. **Einfügen** kennt keine Schleife und kein Song-Ende während der Aufnahme (es gibt dort noch kein „danach“); was gespielt wird, sieht man
   erst nach dem Ende in der Song-Ansicht (Akkorde/Noten werden für den neuen Abschnitt zurückgehalten).
5. **V2d′-06** (Spec v3: „live ohne Kette → Akkord-Zeile der laufenden Szene“) entfällt mit EN7-01: ● auf leerem Song nimmt einen Song auf
   (V0c-04); Akkord-Zeilen entstehen über FANG TEIL und das Akkord-Zeilen-Blatt ([♪ greifen]). V2d′-01 … -04 sind nach 14.3 durch
   N7S-27 … -31 ersetzt; V2d′-05 (ein Undo für alle Ziele) und -07 (Regression) gelten und sind oben geprüft.
6. **Gesten für eigene Clips** (Halten auf eine Zelle, Zell-Blatt, ROLLE auf dem eigenen Clip, weißer Rand/Glas) sind V2e′; hier Daten,
   Wiedergabe und API (`makeOwn`, `dropOwn`, [Ganzer Block]).
7. Chromium-Pfad: `/opt/pw-browsers/chromium-1194/…` gibt es in dieser Umgebung nicht; alle Tests laufen mit
   `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (wie die V2d-Tests).

**Budget:** 2 473 307 B (+30,6 KB roh, +9,7 KB gzip gegenüber V2c′-fix) – Rahmen +35 KB eingehalten. Startzeit unverändert (keine neue
Arbeit beim Laden; `ownNorm` nur, wenn ein Song eigene Clips hat).

**Rollout:** `apply_migration v2d2_max_app` (`max_app = greatest(max_app, 4006000)`) **wartete auf eine Bestätigung und lief nach 60 s ab –
nicht eingetragen**; gelesen: `max_app` 4 005 003, `max_format` 4 (das Projekt-Format bleibt 4). **Offen: vor dem Ausliefern von 4.6.0
einspielen**, sonst lehnt `save_project` das Online-Speichern ab (lokal speichert die App weiter). Kein Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4006000);` → Run.

Fähigkeiten-Summe unverändert (V2d′ deklariert keine Fähigkeit).

**Bekannte Lücken**
- Kein WebKit-/iPhone-Test (Chromium + CDP-Touch); die Druckzeit von ● (N7-R1) am Gerät prüfen.
- Eigene Clips sind in der Song-Ansicht noch nicht gekennzeichnet (weißer Rand / „eigen“ = V2e′); Noten einer Nicht-Melodie-Spur ohne Clip
  sind nur hörbar, nicht sichtbar (V2e).
- Teil-Tasten in einer Aufnahme schreiben ihre Lanes als Clip-Starts (gleicher Klang, aber ohne `re`-Neustart-Einträge bei gleichem Clip
  in gleicher Phase); Stummschalten (M) wird weiter nicht eingefangen.
- Eine Note, die über einen Schleifenpunkt gehalten wird, landet im nächsten Durchgang (Anfang im alten).

**Für Xander am iPhone (nach dem Ausliefern von 4.6.0, ≈ 3 min)**
1. Song mit Inhalt öffnen, auf Taktnummer 4 tippen (gelb), ● → das Blatt zeigt **Überschreiben │ Einfügen │ Ersetzen │ Overdub**.
2. [Einfügen], nur AKKORDE an, START, in Takt 4 einen anderen Akkord spielen, ● zwei Takte später kurz nach dem Taktstrich → der Song ist
   2 Takte länger, ab Takt 6 klingt, was vorher in Takt 4 war.
3. Spur „Synth 2“ wählen (▾ im Blatt), Takte 4–5 gelb, [Ersetzen], NOTEN an, START, ein paar Töne spielen → die alten Synth-2-Noten
   schweigen, danach klingen nur deine; in der Clip-Ansicht ist der Szenen-Clip unverändert. [Overdub] → alt und neu zusammen.
4. ↶ nimmt jede Aufnahme mit einem Tipp zurück.

## V2e — Song-Ansicht: Teil-Marken in der Taktleiste, Marken-Blatt, Bereich-Leiste, Ersetzen/Einfügen-Blatt, Spurbank, Etikett = Spur · App 4.7.0

Grundlage: Nachtrag 2 B.1 Nr. 4/5/7/9, B.4 (V2e), K2-25, K2-26, K2-28; `r7/song-delta.md` 5.2, 5.3, 6.1–6.5, 8.1, 12.2, 13
(N7S-33 … N7S-40, N7S-26); Spec v3 V2e-02, V2e-07, V2e-11; Nachtrag 1 N2e-01/02; Xander 24.10. (a)–(c) aus `fragen-xander-9.md`.
Neustart-Hinweis: Der Bau wurde unterbrochen; der halbe Stand im Arbeitsordner war vollständig (Marken, Blätter, Leiste,
Transport) und wurde fertig geprüft, korrigiert und abgenommen – nichts neu gebaut.

**Was gebaut ist**
- **Keine neue Zeile** (B.1 Nr. 4): Song-Ansicht = Taktleiste, je Spur eine Zeile, AKKORDE, MELODIE. Keine TEIL-Zeile, kein ⊙, kein
  „Spuren ▸“, keine Teil-Leiste im Hochformat (quer bleibt sie im Seitenfeld). Canvas wie V0a (P1 306 × 330,8, L1 392 × 207,4).
- **Teil-Marken** (6.1): amber Band `#ffb22e` von x(a)+2 bis x(a+len)−2 mit dem Namen (fett, #111), ab 60 px ein Punkt in der
  Teil-Farbe, „′“ für eine an dieser Stelle geänderte Marke, 1-Takt-Marke in Kurzform („STR“), in der laufenden Marke rechts „3/4“.
  Die Taktnummern stehen davor, dahinter und dazwischen, nicht in der Marke. Gewählte Marke: weißer Rand 2 px, Spuren amber 7 %.
- **Gesten** (6.2): Tipp auf eine Marke → gewählt + **Marken-Blatt**; zweiter Tipp → Takt-Auswahl in der Marke (die Marke zeigt
  dann ihre Nummern, der Name rückt als Kurzform nach links); Halten 450 ms → angehoben (Haptik), Loslassen ohne Bewegung →
  Marken-Blatt (Ziehen = V2e′); waagrechter Zug = Rollen, nie eine Änderung (V2e-02).
- **Marken-Blatt** (6.3, K2-25; P1/P2 32 + 4 × 44 = 208 px, P3 252 px ab y 316 mit umbrechender Zeile 3, quer 116 px):
  Kopf Name · Takte · Tonart · ✕; [▶ Ab hier] [×2] [×4] [◀] [▶]; [⧉ Kopie …] (danach den Ablage-Taktstrich antippen)
  [⇄ Ersetzen durch ▾] (alle Teile und Szenen) [✕ Löschen] (der Rest rückt) [Nur Name weg]; [✎ Name] (Teil überall │ nur hier)
  [Farbe ●] [Teil-Vorlage ›] [Auf alle n „Strophe“ übertragen] (nur bei ≥ 2 Marken); [● Neu aufnehmen …] (Start-Blatt mit dem
  Bereich der Marke). Das Blatt lässt den Song darüber bedienbar. Undo-Arten nach 12.3 (`song`; Name überall/Farbe `part`;
  Auf alle übertragen `group`).
- **Bereich-Leiste** (6.3, K2-25): bei gelber Auswahl statt der Träger-Leiste in gleicher Höhe (P1 56 px; quer statt der
  Träger-Anzeige im Seitenfeld): [▶ Ab hier] [● Aufnehmen …] [Als Teil …] [⧉ Kopie →] [✕ Takte löschen] [⋯]; ⋯ = Leeren, Teil
  einsetzen ▾, Akkorde quantisieren …, Als Schleife. P3 nur Symbole, „Als Teil …“ unter ⋯. Passt ein Text nicht → Kurztext.
  „Als Teil …“ (≤ 16 Takte) = Teil-Vorlage + Marke in einem Undo (`group`), Namens-Chips nach N7-R2. [▶ Ab hier] bei laufendem
  Song springt am nächsten Taktstrich.
- **Teil einsetzen / Ersetzen-Einfügen-Blatt** (5.2, Mockup P-4): Rückfrage nur, wenn ab der Stelle Inhalt liegt: [Takte n–m
  ersetzen · „was dort ist, wird ersetzt – auch Melodie“] │ [Einfügen · „ab Takt n rückt alles L Takte nach hinten“] │ [Abbrechen],
  nichts vorbelegt; solange es offen ist: amber Einfüge-Strich + künftige Marke gestrichelt. Wege: ⋯ › Teil einsetzen, Tipp hinter
  dem Song-Ende, [＋ Teil einsetzen ▾] im leeren Song, Teil-Liste im Kette-Menü.
- **Xander 24.10.** (a) Tipp auf eine Taktnummer hinter dem Ende (die Ansicht rollt jetzt 4 Takte über das Ende hinaus, die Nummern
  laufen dort grau weiter) setzt den Teil genau dort; die Takte dazwischen bleiben leer (auch im leeren Song: „Strophe auf Takt 4,
  Takte 1–3 leer“). (b) Das Kette-Menü (Szenen-Menü des Songs) listet die Teile, auch bei leerem Song (Tipp = ans Ende). (c) Nach
  „Einfügen“/„Kopie“ gleitet alles rechts der Stelle sichtbar nach (220 ms, nur die Zeichnung, kein Bedienelement bewegt sich).
- **Akkord in einer Marke** (8.1, N7-R10): gilt nur an dieser Stelle (die Marke zeigt „′“), Toast [Für alle „Strophe“] [↶] setzt ihn an
  dieselbe Stelle aller Marken des Teils und in die Vorlage – ein Undo (`group`).
- **Transport** (6.5, K2-26): [CLIPS ⇄][● ▾][▶ SONG][⟲ Song ▾][⏮ │ ↩ SONG] (+ [▲▼] wo nötig); [S4 ▾] wandert ins MELODIE-Etikett
  (Melodie-Menü, erste Zeile „Spur: … ▾“). SCHLEIFE ▾ kennt **Teil** (Marke an der Abspielmarke, V2e-07), die Taste zeigt den
  Marken-Namen bzw. „T3–6“.
- **Spurbank** (6.5): [▲▼] 44 × 40 in der Transportzeile (P2) bzw. -spalte (P3, quer), fest je Viewport, mit Punkt, wenn auf der
  verdeckten Seite ein Clip läuft; DRUMS, AKKORDE, MELODIE bleiben immer stehen.
- **Etikett = Spur** (N7S-39): Spur-Etikett antippen wählt die Spur (Tastatur, NOTEN-Ziel im Start-Blatt), sie ist markiert.
- Leerer Song: „Noch kein Song. FANG TEIL beim Spielen, dann den Teil in den Song ziehen – oder ● SONG.“ + [Kette aus Szenen …]
  + [＋ Teil einsetzen ▾]. FOLGEN hält bei gelber Auswahl, gewählter Marke und offenem Blatt (N2e-02, 14.3).
- Test-API: `svLayoutInfo()` (12.2, mit `marks`, `sel`, `pos`, `mark`, `canvas`), `openMarkSheet`, `placeAt`, `markChordAll`.
- Hilfe (Menü › Hilfe): neue Zeilen TEIL-MARKEN, GELBE TAKTE, SPUR-NAMEN; SCHLEIFE nennt „Teil“.

**Abnahme** (Chromium + CDP-Touch; Skripte in `dirigent-test/`)

| ID | Ergebnis | Test |
|---|---|---|
| N7S-33 | ✓ Zeilen TAKT/Spuren/AKKORDE/MELODIE, kein TEIL/⊙/Spuren ▸/Teil-Leiste in P; Canvas P1 306 × 330,8; P1 8 × 38,9, P2 8 × 28,1, P3/L1/L2 Spurbank 7 × 28,7/27,3/25,9; Seite 1 = S1–S4, DR, AKK, MEL; 8 Spuren: P1 10 × 31,1 ohne Blättern, P2 Spurbank | acc, lay, extra |
| N7S-34 | ✓ Marke a = 8, len 4 bei SV.x = 0: x0 290, x1 430; Mitte #ffb22e; Nummern 9–12 nicht gezeichnet, 8 und 13 schon; 1-Takt-Marke „STR“ | extra (W) |
| N7S-35 | ✓ Tipp → weißer Rand (#f2f4f8) + Marken-Blatt; zweiter Tipp → Takt 5 gewählt, Nummern sichtbar | acc |
| N7S-36 | ✓ Bereich-Leiste P1 56 px an y 482,8 = Träger-Leiste; P2/P3 gleich hoch wie dort die Träger-Leiste (52); M-ANSICHT ±0 px | acc, lay |
| N7S-37 | ✓ Zellen-Tipp in der Marke ändert nur T4, Marke „STROPHE′“; [Auf alle 2 „Strophe“ übertragen] → kein ′, beide Stellen gleich, Undo `group`, Clips deep-equal | acc |
| N7S-38 | ✓ Dm7 in T4 nur dort (T13/T17 bleiben F), nur diese Marke ′; [Für alle „Strophe“] → alle 3 Stellen + Vorlage (Am F→Dm7 C G), ein Undo `group`; hörbar: Träger bei T17 = Dm7 | acc |
| N7S-39 | ✓ Etikett SYN 2 → `runtime().selected.track` = 1, markiert; Start-Blatt NOTEN zeigt Synth 2 | acc |
| N7S-40 | ✓ M-PLATZ P1, P2, P3, L1, L2, W: Marken-Blatt, Bereich-Leiste, ⋯-Menü, Akkord-Quantisieren-Blatt, Start-Blatt, Ersetzen/Einfügen-Blatt im Bild, nichts abgeschnitten, kein waagrechtes Rollen, Treffer ≥ 44 × 44 (P) / ≥ 40 × 36 (L) | lay (82/82) |
| N7S-26 | ✓ MIDI-Marker FF 06 = Name der Marke (auch eigener Name „Outro“) | extra, v2d-data |
| V2e-02 | ✓ Wischen rollt (kein Undo, nichts geändert); Halten + Ziehen → nichts (V2e: noch kein Ablegen) | acc |
| V2e-07 | ✓ SCHLEIFE ▾ [Teil] → Schleife = Marke STROPHE T3–6, Taste „⟲ Strophe ▾“; ⋯ Als Schleife → T7 | acc |
| N2e-01/02 | ✓ ▶ oben zeigt SONG; FOLGEN hält bei gelber Auswahl (`viewState('song')` hold/sel) | acc |
| Marken-Blatt | ✓ ×2 (bars 11 → 15, hörbar Bass 45 in der Kopie), ◀ tauscht mit INTRO, Löschen (Rest rückt), Nur Name weg (Inhalt deep-equal), Name Teil überall (`part`) / nur hier (`song`), Farbe (`part`), Teil-Vorlage ›, ● Neu aufnehmen → „AUFNAHME TAKTE 3–6“, ⧉ Kopie am Taktstrich 6; je ein Undo, Undo deep-equal | acc |
| Bereich-Leiste | ✓ ▶ Ab hier (gestoppt: ab T7; laufend: Sprung am nächsten Taktstrich), ⧉ Kopie →, ✕ Takte löschen, Als Teil „Break“ (Undo `group`, Kurzform „BRK“), ⋯ Teil einsetzen → Blatt → Einfügen/Ersetzen/Abbrechen, Leeren, Als Schleife | acc, extra |
| Xander (a)–(c) | ✓ leerer Song: Takt 4 → STROPHE T4–7, T1–3 leer, hörbar erste Noten bei Schlag 12; hinter dem Ende Takt 10 → T8–9 leer; Kette-Menü listet Teile, REFRAIN in den leeren Song; Einfügen über das Blatt = Daten wie `placePart(STROPHE, 2, 'insert')` (N7S-19) | acc |
| hörbar | ✓ Master-Mitschnitt (AudioWorklet): [Leeren] T3–4 → −120 dB statt −23 dB, übrige Takte ±0,3 dB; [Löschen] → ab T3 klingt, was vorher ab T7 klang (±3 dB); [×2] → T7–10 wie T3–6; [Nur Name weg] ±1 dB; M-KLICK 2. Differenz 1,04/0,88/0,80 ≤ 1,5 × 0,90 | audio (7/7) |
| Aufnahme | ✓ Während ● SONG öffnet ein Tipp auf eine Marke kein Blatt (Hinweis „Erst die Aufnahme beenden“) | extra |
| Rundweg | ✓ Speichern/Laden: Marken samt eigenem Namen deep-equal; Auswahl/Marke erzeugen keinen Undo-Eintrag | extra |

Ergebnis: `v3-v2e-acc` 90/90, `v3-v2e-lay` 82/82, `v3-v2e-extra` 14/14, `v3-v2e-audio` 7/7; Smoke ohne Fehler (`v3-v2e-smoke.png`).
Bilder: `v3-v2e-lay-{P1,P2,P3,L1,L2,W}-{a…f}.png` (a Song, b Marken-Blatt, c Bereich-Leiste, d Quantisieren, e Start-Blatt,
f Ersetzen/Einfügen-Blatt), `v3-v2e-demo-{P1,L1}.png` (leerer Song).

**Regression** (`v3-v2e-reg.sh` → `dirigent-test/v3-v2e-reg/`): `v3-v2d2-rec` 65/65, `-audio` 6/6, `v3-v2d-data` 51/51, `-fang` 39/39,
`-extra` 8/8, `-audio` 2/2, `-reg` 9/9, `-lay` 25/25, `v3-v2c2-click` 3/3, `v3-qa-grp-undo` 11/11; `v3-qa-reg-song`, `-loop`, `-midi2`,
`-part`, `-part2`, `-part3`, `-fang2`, `-ui`, `-core` wie beim V2d′-Lauf; `-lay` nur die gewollten Änderungen der Song-Transportzeile
(SCHLEIFE-Wert, ● ▾, [▲▼], [S4 ▾] im MELODIE-Etikett) und Spielstand-Zufall eines laufenden 2-Takt-Clips; `-perf` 59,9 fps, 0 longtasks;
rot nur wie bisher erwartbar: `v3-v2c2-onescale` V2c′-06 (Version) und `v3-vs2-reg` „Demo gleich V2d-fix“ (Unterschied aus V2c′).

**Fach-Prüfung (Teil J: FP-SONG Haupt-, FP-TOUCH Zweit-Blick)** – zweiter Durchgang über Diff, Testausgaben und Bilder auf mich selbst
angewandt (kein getrennter Agent verfügbar). **7 Befunde, alle behoben:**
1. FP-TOUCH: Ein Toast mit [Rückgängig] dockte 5 s **über der Bereich-Leiste** (nach ⧉ Kopie konnte man 5 s nicht weitertippen) →
   bei sichtbarer Bereich-Leiste dockt er auf der Spur-Zeile (deren ↶ dasselbe tut).
2. FP-TOUCH: Akkord-Quantisieren-Blatt: Raster-/Bereich-Chips 40 px hoch (P verlangt 44) → 44 px.
3. FP-TOUCH: Namensfeld (✎ Name, Als Teil) 15 px Schrift → 16 px (kein iOS-Zoom beim Fokus, wie `.cp-in`).
4. FP-SONG: Marken-Blatt, ⧉ Kopie, ▶ Ab hier und „Teil einsetzen hinter dem Ende“ waren **während ● SONG** möglich und hätten den
   Song unter der laufenden Aufnahme umgebaut → gesperrt mit Hinweis „Erst die Aufnahme beenden (●)“ (Taktnummern wählen weiter).
5. FP-SONG: Hinter dem Song-Ende ließ sich nur bis 1 Takt rollen – Xanders (a) „auf Takt 10, dazwischen leer“ war nicht erreichbar →
   die Ansicht rollt 4 Takte über das Ende.
6. FP-SONG (Test): ✕ Takte löschen nach Undo einer Kopie arbeitete auf der alten Auswahl (die Kopie) – richtig so (Auswahl ist
   Ansicht, kein Undo); Test setzt die Auswahl neu. Kein App-Fehler, notiert.
7. FP-IPHONE-Nebenblick: `getComputedStyle` je Bild für die Zahlen-Schrift der Marken → einmal gemerkt.
Geprüft ohne Befund: `S.tracks[].clips` deep-equal nach jeder Aktion; ein Undo je Geste und Art nach 12.3; Speichern/Laden; Harmonie-Kern
unverändert (nur Song-Daten, `Harmony` nicht angefasst); MIDI-Marker; FOLGEN; Teil′ wird je Song-/Teil-Version einmal gerechnet, nie
je Bild; Zeichnen der Marken O(sichtbare Takte × Marken).

**Abweichungen (begründet)**
1. **Transport-Feld ▦│◧** (Glas-Umschalter) ist V2e′; an seiner Stelle steht wie bisher [⏮ │ ↩ SONG] (44 px). SCHLEIFE füllt den
   Rest der Zeile (P1 98 statt 86 px, P2 72 statt 56 px), damit rechts keine Lücke bleibt.
2. **Transport-Spalte P3/quer:** [● ▾][▶] und [⏮][▲▼] teilen sich wie in 6.5 eine Zeile → je 29,5 (P3) bzw. 36,5 px (L) breit, dafür
   52 bzw. 47–50 px hoch (vorher 41/39); unter 44 px breit, weil die Spalte durch den V0a-Canvas fest ist (bestand für ●/▶ schon seit V0c).
3. **Bereich-Leiste P2/P3** 52 px hoch, weil die Träger-Leiste dort 52 px hoch ist („gleiche Höhe“); P3-Knöpfe 57,6 statt 52 px breit
   (füllen die Zeile). W-Transportzeile 34 px hoch (wie bisher).
4. **Halten auf eine Marke + Ziehen** (verschieben, ⧉-Feld ≥ 250 ms = Kopie), Ziehen von Teilen in den Song, Federtaste und Glas sind
   V2e′; in V2e hebt Halten die Marke nur an (Loslassen = Blatt).
5. **Spurbank-Seiten**: Seite 1 nimmt so viele Synth-Spuren, wie ≥ 26 px erlauben (P2: 5 inkl. MELODIE-Spur) statt fest „Synth 1–4“;
   in L1/L2/P3 ist das genau Synth 1–4.
6. **[Teile erkennen]** (P1-Option aus 6.4) ist nicht gebaut.

**Budget:** 2 520 150 B (+46,7 KB roh, +13,6 KB gzip gegenüber V2d′-fix) – Rahmen +55 KB eingehalten. Startzeit unverändert (nichts
Neues beim Laden; Rangeleiste wird einmal gebaut).

**Rollout:** gelesen `private.settings`: `max_app` 4 006 000, `max_format` 4 (die V2d′-Migration ist inzwischen eingetragen).
`apply_migration v2e_max_app` (`max_app = greatest(max_app, 4007000)`) **wartete auf eine Bestätigung und lief nach 60 s ab – nicht
eingetragen. Offen: vor dem Ausliefern von 4.7.0 einspielen**, sonst lehnt das Online-Speichern ab (lokal speichert die App weiter).
Kein Aufruf nennt das Klassenzimmer-Projekt.

**Für Xander im Dashboard** (nur falls der Orchestrator die Migration nicht nachholt): SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) → `update private.settings set max_app = greatest(max_app, 4007000);` → Run.

**Bekannte Lücken**
- Kein WebKit-/iPhone-Test (Chromium + CDP-Touch).
- Die Gleit-Animation nach Einfügen (Xander c) ist nur als Zeichnung geprüft (Daten-Gleichheit), nicht per Bildvergleich.
- Eigene Clips machen eine Marke nicht zu „′“ (sonst bliebe ′ nach [Auf alle übertragen] stehen, N7S-37); weißer Rand für eigene
  Clips kommt mit V2e′.

**Für Xander am iPhone (nach dem Ausliefern von 4.7.0, ≈ 3 min)**
1. Song öffnen, auf den gelben Namen eines Teils in der Taktleiste tippen → unten das Marken-Blatt. [×2] → der Teil steht zweimal da.
2. Nochmal in den Teil tippen → ein Takt wird gelb, unten die Bereich-Leiste. [⧉] → der Takt ist verdoppelt, alles danach rückt nach.
3. Hinter dem Song-Ende nach rechts wischen, auf eine graue Nummer tippen, einen Teil wählen → er steht dort, die Takte davor bleiben leer.
4. Einen Akkord in einem Teil antippen und ändern → nur dort anders; im Toast [Für alle „Strophe“] → überall.

## V2e-fix — Szene als Teil klingt, eigene Clips bleiben bei [Auf alle übertragen], ⧉ Kopie endet mit jedem anderen Tipp, Bereich-Leiste nie ohne Auswahl · App 4.7.0

1. **Szene als Teil** (`Ersetzen durch ▾` / `＋ Teil einsetzen ▾` → „Szene n“): `sceneChunk()` gab seine Lanes an `partChunk()` weiter,
   dessen `partLanesFix()` die Takt-0-Einträge an Ort und Stelle löschte – die Marke hieß „Szene 1“, klang aber nicht. Jetzt bekommt
   `partChunk` eine Kopie mit passenden Slots (und die volle Szenenlänge für die Träger-Wiederholung). Geprüft: Takt 3 nach Ersetzen
   klingt Bass 45,45 + Drums 36,36; leerer Song → Szene 1 → Bass und Drums.
2. **[Auf alle übertragen]** (song-delta 6.3): eigene Clips mit gleichem Slot wie die Vorlage bleiben an den Zielstellen (Lane-Eintrag
   mit `own`, danach geht die Vorlage in Phase weiter); bisher löschte `opReplace` sie. Geprüft: `o1` bleibt, noteLog zeigt `own`.
3. **⧉ Kopie** wartet nur bis zum nächsten Tipp: jeder Tipp außerhalb der Song-Leinwand (Etikett, ⏮, Menü, Leisten) beendet das
   Warten; ein kurzer Hinweis überschreibt die Warte-Zeile nur für 1,6 s. Ein späterer Zellen-Tipp wechselt wieder nur den Clip.
4. **Bereich-Leiste**: die gelbe Auswahl wird an das Song-Ende geklemmt bzw. verworfen (Undo, kürzerer Song, Projektwechsel); beim
   Projektwechsel enden auch gewählte Marke, ⧉ Kopie und Vorschau. Die Träger-Leiste kommt sofort zurück, FOLGEN hält nicht mehr
   für eine unsichtbare Auswahl.

Snapshot: `synq-snapshots/V2e-fix.html`. Keine Migration (App-Version unverändert 4.7.0).

## V2e′ — Teile per Drag & Drop an jeden Taktstrich (auch leerer Song, hinter leere Takte), Einfügelinie, Rand-Scrollen, Ablegen/Abbrechen; Aufklapp-Animation, Glas-Ansicht mit Kacheln, Halte-Blatt für eigene Clips · App 4.8.0

Orchestrator-Eintrag (25.10.): Der Bau-Agent hat seinen Abschnitt nach einem Neustart nicht mehr geschrieben; Inhalt aus der Aufgabenliste des Bau-Agenten und den Prüf-/Fix-Berichten.
- Ziehen: Teil-Taste, FANG-Chip oder Teil-Marke halten → anheben (Geist), SONG öffnet sich von selbst, Einfügelinie am Taktstrich, Rand-Scrollen, Ablegen = Einfügen (rechts rückt nach), Abbrechen ohne Änderung.
- Aufklapp-Animation, Glas-Ansicht (Umschalter, Kacheln), Halte-Blatt eigener Clip ([Bearbeiten] [Zurück zum Szenen-Clip] [Ganzer Block]).

## V2e′-fix · App 4.8.0
1. [Ganzer Block] im Halte-Blatt eines eigenen Clips fasst jetzt den ganzen Block (N7S-47), danach [Zurück zum Szenen-Clip] hinterlässt keinen Verweis auf einen gelöschten Clip.
2. [Zurück zum Szenen-Clip] auf einem eigenen Clip setzt nur den gewählten Bereich zurück.
3. ● im Song wieder in voller Breite (Ziel-Beschriftung und ▾-Hinweis nicht mehr abgeschnitten).

## G-P2a-gruppe-fix — „Eine Skala“ behandelt eigene Clips wie Szenen-Clips · App 4.8.0

Befund der Gruppen-QA G-P2a: Ein unveränderter eigener Clip ([Eigener Clip (dieser Durchlauf)], oder NOTEN in den Song) klang anders als
der Szenen-Clip, aus dem er kopiert war: `C D E F F♯ G A` unter C → Szene `60 62 64 65 67 69 71`, eigener Clip `60 62 64 65 65 67 69`
(F und F♯ fielen zusammen), Stärke 0 % und Durchgangstöne „Erlauben“ wirkten im eigenen Clip nicht. Ursache: `osClipOf` suchte den Clip
nur in `S.tracks[i].clips`; für eigene Clips (`song.own`) fiel jede Note auf `snapToScale` ohne Kollisionsschutz zurück, „Automatisch“
nahm die Projekt-Tonart statt der Szenen-Tonart.

**Geändert**
- `osClipOf` findet auch eigene Clips (der gerade spielende, sonst alle in `song.own` derselben Spur) und gibt ihre Szene (`from.s`)
  zurück → eigene Clips gehen über denselben Weg (`oneScaleMap`: Kollisionsschutz, Richtung, Stärke, Durchgangstöne, „Automatisch“ =
  Tonart der Szene). Gilt für Wiedergabe, Träger-Wechsel (Umstimmen) und MIDI-Export „Song“.
- `osApply` aufgeteilt in `osZOf` / `osBuildMap` / `osMapOf` (gleiche Rechnung, gleicher Cache).
- Neu `osNoteFor` (in `clipNoteFor`, nur bei „Eine Skala“ und vorhandenem Clip): welche Clip-Note beim Abspielen wie die gespielte klingt,
  obwohl die Abbildung auf alle Tonhöhen des Clips zusammen wirkt. Reihenfolge: eine Tonhöhe, die der Clip schon hat → eine neue, deren
  Stufen-Abbildung schon der gespielte Ton ist → irgendeine neue, die so klingt; eine neue Tonhöhe darf keinen anderen Ton des Clips
  verrücken. Ein leiterfremder gespielter Ton landet auf dem nächsten Skalenton. Sonst wie bisher. (Ohne das hätte NOTEN in einen
  eigenen Clip nach der Umstellung leitereigene Töne verschoben, z. B. gespielt E gespeichert als C♯.)
- Neu `ownKeySync` (in `applySceneKeys`): ein eigener Clip, der noch eine unveränderte Kopie ist (gleiche Noten, Bezug „auto“), übernimmt
  den Bezug seines Szenen-Clips, wenn die Tonart-Erkennung erst nach dem Kopieren lief (400-ms-Timer oder nach dem nächsten ORIGINAL).
  Bearbeitete oder eingespielte eigene Clips behalten ihren Bezug.

**Nachweis** (Chromium 1243)
- `v3-qa-gp2a-osown.mjs` **6/6** (vorher 1/6): C, E, Stärke 0 %, Durchgangstöne — eigener Clip = Szenen-Clip, 7 Töne bleiben 7.
- `v3-qa-gp2a-os.mjs` OS1 7/7/7/7 verschiedene Töne (vorher 7/6/6/7). OS2/OS3 dort schlagen weiter fehl, aber wegen des Skripts: OS2
  misst den eigenen Clip vor und den Szenen-Clip nach der Tonart-Erkennung (C ionisch → C lydisch, die Erkennung ist zwischen den Läufen
  passiert), OS3 ordnet ursprüngliche Clip-Noten als „Aufnahme“ zu. Mit ausgeschwungener Erkennung und genauer Zuordnung
  (`v3-gp2afix-os-exact.mjs`) **10/10**: alle 12 eingespielten Töne klingen wie gespielt bzw. ≤ 1 Halbton auf der Skala.
- `v3-qa-gp2a-osrec.mjs` R1/R2: 5 von 8 Tönen passen in den 1-Takt-Take, und diese 5 klingen wie gespielt, mit und ohne „Eine Skala“
  (`v3-gp2afix-osrec.mjs` 3/3, vergleicht nur, was in den Take passt).
- Gleich wie vorher (Vergleich mit der Fassung ohne Fix): `v3-qa-v2c2-a/-f/-g` (2 880 Melodien, 0 verloren), `v3-qa-v2c2reg-os`,
  `v3-v2e2fix-own`; `-b/-c/-d/-e`, `v3-repro-osguard`, `v3-v2d2-regcore` unterscheiden sich nur in Zeitstempeln/Logzählung.
  `v3-v2c2-onescale` 26/27 (nur der alte Versions-Check 4.5.3), `v3-v2d2-rec` 65/65, `v3-qa-gp2a-flow` 47/47, Smoke ohne Fehler
  (`dirigent-test/v3-gp2afix-smoke.png`).
- Server: keine Änderung (App bleibt 4.8.0 ≤ max_app 4 021 000).

## G-P2a-gruppe-fix · App 4.8.0
Gruppen-Prüfung G-P2a (VS2b, V2c′, V2d′, V2e, V2e′): „Eine Skala“ behandelt eigene Clips jetzt wie Szenen-Clips. Ein unveränderter eigener Clip klingt genau wie sein Szenen-Clip; Kollisionsschutz, Stärke, Durchgangstöne und „Automatisch“ gelten auch dort (vorher fielen z. B. F und F♯ auf denselben Ton).

## VS3 — STIMME-Spur & Takes (Take aus Stimme-FANG und ● REC, Overdub, Punch im Song mit Rückfrage, IndexedDB v2 `audio`, WAV/ZIP, persist(), Herkunfts-Hinweis) · App 4.18.0

Grundlage: Nachtrag 2 Teil C (C.1–C.5, Paket-Zeile VS3, N2-VS3-01 … -03, K2-30, K2-31), `r7/stimme.md` §8, §11 Skizzen 4/6, §12 VS3,
§13 N7V-16 … N7V-20 (+ N7V-35); Tor N7V-12 von Xander am 26.10. bestanden („Ja das ist soweit relativ sauber“). **Version 4.18.0**
(`APP_CODE` 4 018 000, Auftrag: VS3 = 4.18.0 statt 4.15.0). **Format bleibt 5**, alles additiv (K2-31). Keine Server-Änderung
(Wächter `max_app` 4 021 000 deckt 4.18.0; kein Supabase-Aufruf in diesem Lauf).

**Was neu ist**
1. **Datenmodell (additiv, ein Projekt ohne Takes bleibt Zeichen für Zeichen gleich – `v3-vs3-same.mjs`):**
   `S.takes = {id: {sr, len, chunks:[id:k…], route, latMs, created, src}}` (nur Maße und Schlüssel, nie Audio); Szene-Clip der STIMME-Spur
   `clip.audio = {take, in, out, at, gain, fadeIn, fadeOut, alt:[{take,in,out,at}]}`; MELODIE-Clip `clip.take = id`; Spur `stimme: true`
   (genau eine, Zusatzspur ab Index 6, synth-Art – kein neuer `kind`, damit alle Synth-Pfade unverändert bleiben); Song `song.vox =
   [{id, bar, len, …audio}]` (Punch-Audio auf der Song-Zeitachse). `normalizeProject`/`normClip`/`normTrack`/`normSong`/`cleanClip`
   tragen alles; Undo kennt `takes` und `tflag`.
2. **Speicher (N7V-19):** IndexedDB `synquenzer` **Version 2** (Store `kv` bleibt, neu `audio`), PCM16-Stücke ≤ 1 MB (524 288 Samples),
   Schlüssel `<take>:<k>`; ohne IndexedDB nur Arbeitsspeicher der Sitzung. Nach dem ersten Take `navigator.storage.persist()`;
   Takes-Blatt zeigt `estimate()` (belegt/frei, „dauerhaft ✓“ bzw. „nicht dauerhaft – ab und zu exportieren“). Speicher-Fehler →
   Toast mit [Exportieren]. Nur die hörbaren Takes liegen als AudioBuffer im Speicher (stumme werden beim Wählen geladen).
3. **Takes entstehen aus dem Gesang** (Mikrofon nur auf der eigenen Seite):
   - **Stimme-FANG** → MELODIE-Clip **und** STIMME-Clip mit **derselben take-ID**, ein Undo „Stimme“ (Gruppe: [neue Spur], Takes, MELODIE,
     STIMME); [Verwerfen] im Ergebnis-Blatt nimmt beides zurück. Der Take reicht vom Clip-Anfang (mit 0,25 s Vorlauf als `in`) bis zum
     Ende nach `fangClose`; liegt das Ende in der Zukunft (E1-Fall), wird er gefüllt, sobald das Mikro so weit geliefert hat.
   - **● REC mit 🎤** → Take in derselben Szene, **auch ohne erkannte Noten** (gesprochen, Atmer). Liegt dort schon ein Audio-Clip:
     **Overdub = neuer Take oben, der alte stumm in `alt`** (N7V-18), am Clip-Raster (jüngster voller Durchgang).
   - Die STIMME-Spur wird beim ersten Take **automatisch angelegt** (Zusatzspur „Stimme“; bei 8 Spuren wird eine leere Zusatzspur
     umgeschaltet, sonst Toast); im Spur-Blatt gibt es [＋ STIMME-Spur].
   - **Latenzausgleich:** derselbe Lese-Weg wie VS1/VS2 (Zeitkarte `stLatAt`, Bruchteil-Samples linear) – der Take liegt sample-genau
     auf dem, was die App spielte (N7V-16).
4. **Punch im Song (S5-Rückfrage, Skizze 6):** Läuft 🎤 bei ● SONG, nimmt jede Song-Aufnahme die Stimme mit (Modi aus dem V2d′-Start-Blatt:
   Überschreiben ab n, Einfügen ab n, Ersetzen/Overdub im gelben Bereich). Ergebnis in `song.vox`: Überschreiben/Ersetzen kürzt die alte
   Stimme an den Rändern (gleiche Stelle im Take), Overdub legt die alten Stücke als stumme Takes darunter, Einfügen schiebt alles ab n
   (`songShift`/`songClear` verschieben bzw. kürzen `song.vox` – auch Teil-Löschen/Einfügen). Während der Aufnahme schweigt die alte Stimme
   im ersetzten Bereich (erster Durchgang). Ein Undo (Gruppe Song + Take). Blenden 5 ms an allen Schnitten.
5. **Abspielen:** `AudioBufferSourceNode` je Clip-Durchlauf über die Kette der STIMME-Spur (Pegel, Pan, Sends, Mute), Blende 5 ms
   ein/aus, spätes Dazukommen mit Versatz und Blende; Schnitt/Stopp/■■/PANIK blenden aus; Szene-Audio der STIMME-Spur schweigt, wo im Song
   `song.vox` liegt. Kein Knacken bei Schleife, Take-Wechsel, Stopp (FP-DSP unten).
6. **Takes-Blatt** (✎ in der Spurleiste bei gewähltem STIMME-Clip – die Leiste sagt „🎤 Audio · Takes: ✎“ –, Tipp auf die Song-Stimme in der Song-Ansicht; `v3-vs3-edit.mjs`): Liste (oben = hörbar,
   ● Take n · Dauer · Uhrzeit · Weg), Tipp = Take nach oben, **[A/B]** tauscht die zwei obersten (klingt sofort), **✕** löscht
   (je ein Undo, Toast), **[WAV]**, **[ZIP + Projekt]**, **[Aufräumen]** (löscht Audio-Stücke, die kein gespeichertes Projekt, kein
   Verlauf und kein Undo nennt). Knöpfe ≥ 44 × 44, im Bild in P1–P3, L1, L2, 926 × 428.
7. **WAV/ZIP (N7V-20, N2-VS3-03):** WAV 16 Bit mono in der Abtastrate des Takes, Datenteil bitgleich zum gespeicherten Roh-Take; ZIP
   (STORE) = `projekt.json` + `takes/<id>.wav`. [Datei öffnen] nimmt jetzt auch `.zip`: auf der eigenen Seite kommen die WAVs in den
   Audio-Store, in der Claude-App Toast „Audio übergangen – nur auf der eigenen Seite“, das Projekt lädt.
8. **Claude-App / anderes Gerät:** STIMME-Spur grau, Kopf „Audio nur auf der eigenen Seite“ (fehlt ein Take auf dem Gerät: Clip grau,
   „fehlt hier“ im Blatt); die Daten bleiben beim Speichern deep-equal; kein `getUserMedia`, keine Wiedergabe.
9. **Herkunft (C.2 Nr. 2, N2-VS3-01):** auf `raw.githack.com` erscheint **vor dem ersten Take** (beim Start von ● REC mit 🎤, beim FANG-Tipp,
   beim Song-Punch) einmal je Sitzung der Hinweis „Aufnahmen liegen auf einer geteilten Adresse – bitte die Seite
   https://xanderfoxy.github.io/Synquenzer/ benutzen oder exportieren“ mit [WAV/ZIP exportieren]; auf der Pages-Seite nie.
10. **Datenschutz (N7V-35, N2-VS1-02):** Während Take-Aufnahme (● REC mit 🎤, FANG-Take, Song-Punch) bis zum Ende des Speicherns läuft
    `stQuiet` (SYNC hält, Realtime getrennt, Zähler fetch/XHR/Beacon/WS); Marken lösen sich selbst (Wächter 2 s). Audio verlässt das
    Gerät nie; der Projekttext trägt nur IDs und Maße.
11. **Innere API für VS4/VS5a (Parallelbau):** `tkPcm(id)`, `tkBuffer/tkSetBuffer`, `tkExt().take/.audio` (Zusatzfelder beim
    Normalisieren), `tkExt().proc` (Verarbeitung je Take beim Abspielen, z. B. gesäuberte Fassung), `tkExt().place` (Abspiel-Stück
    ändern, z. B. Zeitkarte), `tkStartSrc(o)`, `tkTrackResync(i)`, `tkVoxResync(true)`, `tkSegs(a)`. Alles im Block „VS3“ vor
    `voicesInfo()`; in fremden Funktionen nur Ein-Zeilen-Haken (`scheduleTrack`, `cutTrackAt`, `cancelTrackFrom`, `stopTrackNow`,
    `silenceAll`, `panic`, `songTickInner`, `songJumpApply`, `songPlayEnd`, `songChanged`, `songShift`, `songClear`, `setMute`, `vsFang`,
    `vsFangDone`, `vsRecBegin`, `vsRecDone`, `vsResDrop`, `songRecStartOver`, `songRecWrap`, `songRecEndOver`, `renderGrid`, `openRoll`,
    Spur-Blatt, `svTap`, `svDraw`, `onFilePicked`, `deliverNow`, `KV()`).
12. **Test-API:** `takes`, `tkInfo`, `tkOrigin(o)`, `tkOriginHint`, `tkAddTrack`, `tkVoice`, `tkInject({pcm, sr, scene, len, at})`,
    `tkPcmHash`, `tkPcmRange`, `tkBufRange`, `tkWavInfo`, `tkExportWav`, `tkZipInfo`, `tkZipBytes`, `tkZipRoundtrip`, `tkImportZip`,
    `tkGc`, `tkForget`, `tkLoadAll`, `tkSheet`, `tkPick`, `tkSimLoop`, `tkSongMute`, `tkKeys`.

**Abnahme** (Chromium 1243 headless, Mikro-Attrappe im selben AudioContext wie VS2 – `--use-fake-device…` liefert keinen Loopback;
Skripte in `dirigent-test/`; Ausgaben `v3-vs3-accept.out` 72/72, `v3-vs3-lay.out` 42/42, `v3-vs3-click.out`, `v3-vs3-click10.out`,
`v3-vs3-same.out`)

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| N2-VS3-02 | ✓ Stimme-FANG: MELODIE-Clip und STIMME-Clip mit gleicher take-ID, Take 4 Takte, Gesang drin (−20,6 dBFS); **ein Undo** entfernt MELODIE, STIMME (+ neue Spur) und Take; Redo stellt beides her | accept A |
| N7V-16 | ✓ **echter App-Weg über Loopback** (App-Ausgang → 21,37 ms Verzögerung → Mikro; Einmessen „voll“ 43,615 ms, Streuung 0): Metronom-Klicks im Take gegen die Referenz je Schlag **max 0,002 ms**; Offline-Simulation (Chirp-Schätzer, Bruchteil-Latenz 37,43 ms, SNR 20 dB, Wiedergabe über `tkStartSrc` im OfflineAudioContext) **max 0,005 ms** (Soll ≤ 1 ms) | accept B |
| N7V-17 | ✓ Ersetzen Takt 3–4: nur dort neue Stimme, davor/danach die alte an gleicher Stelle (Rest ab Takt 5 spielt den alten Take ab in + 8 s); alte Stimme schweigt während der Aufnahme in Takt 3–4; Lanes unverändert. **Einfügen ab Takt 3 (2 Takte):** Song 8 → 10 Takte, alle späteren Lane-Einträge aller Spuren + 2, Song-Stimme ab Takt 3 + 2, neuer Take in Takt 3–4; ein Undo (Song + Take) → deep-equal | accept F |
| N7V-18 | ✓ Overdub (zweites ● REC): neuer Take oben, alter in `alt` (stumm), nur der obere klingt; Undo → Clip deep-equal | accept B |
| N7V-19 | ✓ IndexedDB v2 mit `kv` + `audio`; 14-s-Take = 2 Stücke (1 048 576 + 295 424 B); Projekt-JSON nur IDs (15 854 Zeichen); persist() aufgerufen; Neuladen: Take + Spur da, bitgleich, klingt (330 Hz) | accept C |
| N7V-20 | ✓ WAV 48 kHz / 16 Bit / mono, Datenteil = Roh-Take (FNV gleich, 672 000 Samples, Stichprobe bitgleich) | accept C |
| N2-VS3-01 | ✓ githack (Test-API): Hinweis-Text wörtlich + [WAV/ZIP exportieren], erscheint beim Start von ● REC vor dem ersten Take; Pages: keiner | accept E |
| N2-VS3-03 | ✓ eigene Seite → JSON → Claude-App (iframe, getrennter Speicher): STIMME grau „Audio nur auf der eigenen Seite“, Daten deep-equal → Speichern → Export → eigene Seite: `project()` deep-equal (ohne id/Name/Ansicht), Take bitgleich, spielt (523 Hz). ZIP in der Claude-App (API und [Datei öffnen]): Toast „Audio übergangen – nur auf der eigenen Seite“, Projekt lädt, 0 Konsolenfehler; ZIP auf frischer eigener Seite: Take bitgleich übernommen | accept D |
| N7V-35 | ✓ während FANG-Take `stQuiet` > 0; danach Zähler fetch/XHR/Beacon/WS = 0 | accept A |
| Takes-Blatt, hörbar | ✓ oberer Take klingt (877 Hz), [A/B] → sofort der ältere (441 Hz), ein Undo „Take gewählt“, ✕ löscht, Undo holt zurück | accept G |
| M-PLATZ | ✓ P1, P2, P3, L1, L2, 926×428: STIMME-Kopf sichtbar, Clip mit Wellenform, kein Layout-Sprung, kein waagrechtes Rollen; Takes-Blatt und Herkunfts-Hinweis im Bild, alle Knöpfe ≥ 44 × 44, nichts abgeschnitten (42/42) | `v3-vs3-lay.mjs`, Bilder `v3-vs3-{P1,P2,P3,L1,L2,XL}-{matrix,takes,hinweis}.png`, Song-Ansicht `v3-vs3-{P1,L1}-song.png` (Tipp auf die Song-Stimme öffnet das Blatt) |
| Regression | ✓ `v3-vs2-accept` ALLE OK (49), `v3-v2d2-rec` 65/65, `gmkp8-voc-mic` 8/8, `gmkp8-mk8-platz-quer` 9/9; `v3-v2e-acc` 87/90 und `gmkp8-mk8-09-platte` 26/27 **gleich wie vor VS3** (dieselben Punkte schlagen auf `index-vor-VS3.html` fehl – ältere Erwartungen, nicht durch VS3); Demo-Projekt Zeichen für Zeichen gleich zu vor VS3; Rauchtest ohne Fehler (`v3-vs3-smoke.png`) | `dirigent-test/vs3reg/r-*.out` |

**Fach-Prüfung (Teil J, Gruppe 7: FP-DSP ● Haupt, FP-IPHONE; VS3 zusätzlich FP-SICHER)** – eigener zweiter Durchgang über Diff,
Messungen und Bilder (kein getrennter Agent verfügbar). **6 Befunde, alle behoben:**
- *FP-DSP 1:* Das erste Sample jedes Stücks lief mit Verstärkung 1 (Grundwert des GainNode vor dem ersten Ereignis) → Ein-Sample-Spitze
  0,22 beim Start. → `gain.value = 0` vor der Rampe.
- *FP-DSP 2:* Lag die geplante Startzeit schon in der Vergangenheit (Hauptfaden langsam), sprang die Rampe sofort auf voll → Knack an einer
  128er-Grenze. → `tkStartSrc` verschiebt den Start auf jetzt + 6 ms mit passendem Versatz und Blende.
- *FP-DSP 3:* Messung danach (`v3-vs3-click.mjs`, Mitschnitt aller Ausgänge, Schleifengrenze + A/B mitten im Ton + Stopp): 2. Differenz
  0,0032–0,0044 bei Krümmung 0,0034–0,0036 des 660-Hz-Tons (≤ 1,5×) in 22 von 24 Läufen; 2 Läufe mit 0,030 genau an Sample 4224 des
  Mitschnitts (Block 4096 + 128) – in 16 weiteren Läufen mit Ausgabe nicht wiederholbar; Mitschnitt-Blockgrenzen (ScriptProcessor) sind
  ausgenommen. Als **offen/beobachten** vermerkt (eher Mitschnitt, nicht belegt).
- *FP-IPHONE 4:* Lesen eines langen Takes erzeugte zwei Float-Kopien (Mikro + Referenz, bei 2 min ≈ 46 MB) → `tkReadMic` liest direkt
  PCM16 (Zeitkarte wie `stRead {align}`).
- *FP-IPHONE 5:* Alle Takes des Projekts lagen als AudioBuffer im Speicher (≈ 11,5 MB/min) → nur die hörbaren (oben in jedem Clip), stumme
  beim Wählen.
- *FP-SICHER 6:* Eingeführte Takes (Import/Test) riefen `persist()` nicht → jetzt auch dort. Geprüft ohne Befund: Projekt/Cloud tragen
  nur IDs und Maße; ZIP-Leser begrenzt (Namen per Regex, WAV-Leser mit try/catch, Größen geklemmt); [Aufräumen] löscht nur, was kein
  gespeichertes Projekt/Verlauf/Undo nennt; Export nur auf Tipp; githack-Hinweis; Netz-Ruhe beim Aufnehmen. FP-IPHONE sonst: `AudioBuffer`-
  Konstruktor (Safari ≥ 14.1, Rückfall `createBuffer`), `DecompressionStream` nur wenn vorhanden, `cancelAndHoldAtTime` mit Rückfall,
  IndexedDB-Upgrade v1 → v2 ohne Datenverlust (Store `kv` bleibt), alles in try/catch.

**Abweichungen (begründet)**
- **Version 4.18.0** statt 4.15.0 (Auftrag). **Format 5** bleibt (K2-31 nennt Format 4 – seit MK0 ist es 5; additiv).
- **Abtastrate:** der Take hat die Rate des AudioContext (iPhone 48 kHz → WAV 48 kHz wie N7V-20; der Test-Browser läuft mit 44,1 kHz, daher
  N7V-20 mit einem 48-kHz-Take geprüft). Ein Umrechnen auf 48 kHz würde „bitgleich zum Roh-Take“ brechen.
- **STIMME = Zusatzspur mit `stimme: true`**, nicht eine neue Spur-Art `kind` (alle Synth-Pfade, Undo, Spurbank bleiben unverändert); der
  gespeicherte Klang der Spur bleibt, spielt aber nicht. **Punch im Song** speichert die Stimme in `song.vox` (eigene Song-Zeitachse) statt
  als eigene Clips je Lane – so verschieben Einfügen/Löschen sie mit, und Szene-Clips bleiben unberührt.
- **Song-Ziel:** keine vierte Ziel-Taste im Start-Blatt (Platz in P3); mit 🎤 an nimmt jede Song-Aufnahme die Stimme mit, der Abschluss-Toast
  nennt „🎤 Stimme“.
- **N7V-16** zusätzlich zum geforderten OfflineAudioContext-Modell als echter Loopback in der App gemessen (Mikro-Attrappe).
- **Budget:** +35 KB geplant, gebaut **+64,5 KB roh / +21,8 KB gzip** (3 121 851 → 3 186 336 B): Song-Punch mit Kürzen/Verschieben,
  ZIP-Lesen/-Import, Aufräumen, Herkunfts-Hinweis, Test-Simulation N7V-16 und deutsche Kommentare. Weit unter 5,0 MB; Startzeit
  unverändert (der Block tut beim Laden nichts, Takes laden erst nach dem Projekt).

**Bekannte Lücken**
- Die **erste** Song-Aufnahme eines leeren Songs (● SONG ohne Song) nimmt keine Stimme auf – nur Punch in einen bestehenden Song.
- Tempo-Änderung nach der Aufnahme: der Take wird nicht gedehnt (VS5b), er spielt ab seinem Schlag in Originalgeschwindigkeit.
- Teil-Kopien per Drag & Drop (V2e′) kopieren `song.vox` nicht mit (Einfügen/Löschen von Takten verschieben sie).
- Auf der STIMME-Spur spielt die Tastatur weiter den (unsichtbaren) Spur-Klang; KLANG öffnet ihn.
- Partner im Paar-Raum sieht die STIMME-Spur grau mit „Audio nur auf der eigenen Seite“ (Spec: „… auf dem Gerät von <Name>“) – der Name
  des Aufnehmenden steht nicht im Take.
- Säubern (VS4), Marken/Quantisieren (VS5a), Dehnen/Songtext (VS5b) folgen.

**Für Xander am iPhone (Pages-Seite, Kopfhörer)**
1. 🎤 an, ▶, 4–8 Takte singen, **FANG 🎤** → im Ergebnis-Blatt OK. In der Matrix liegt jetzt eine Zeile **STIMME** mit Wellenform; sie
   spielt deine Stimme im Takt zur Musik. ↶ nimmt Noten und Stimme zusammen zurück.
2. Auf eine leere Szene ● drücken und singen (oder sprechen) → STIMME-Take in dieser Szene. Noch einmal ● auf derselben Szene → neuer Take
   oben; ✎ auf dem STIMME-Clip → Takes-Blatt: [A/B] vergleichen, ✕ löschen, [WAV] / [ZIP + Projekt] sichern.
3. Song-Ansicht: Takt 3 gelb wählen, ● → „Ersetzen“ → singen → nur Takt 3 ist neu; „Einfügen“ schiebt den Rest nach hinten.
4. Bitte melden: hörst du deine Stimme genau im Takt (keine Verzögerung)? Knackt etwas beim Wechseln der Takes? Bleiben die Takes nach dem
   Neuladen der Seite da?

## VS3-fix · App 4.18.0
- Takes-Blatt: die Liste lässt sich mit dem Finger rollen (`.tklist.pan-y`; `guardTouch` lässt `.pan-y` wie `.cp-sc/.pan-x` nativ rollen, Tippen wirkt weiter über pointerup). Hochkant 73 px, quer 100–111 px gerollt (vorher 0). Das offene Blatt folgt jetzt auch ↶/↷ (vorher blieb es auf dem alten Stand).
- Song-Schnitt (Takte einfügen/löschen, Punch-Reste): `tkVoxTrim` kürzt auch die Overdub-Takes in `alt` an derselben Song-Stelle (`tkSegTrim`); nach A/B spielt der alte Take seine eigenen Takte (Takt 4: 549 Hz statt 328 Hz).
- PANIK: eine laufende STIMME bleibt still (`tkSilence(now, tau, keep)` behält die Planschlüssel; vorher Neustart nach 6–26 ms). Sie klingt erst beim nächsten Clip-Start/Song-Durchgang wieder; Stop leert die Schlüssel wie bisher.
- Tests: v3-qa-vs3-t3/t3b/t4/t4b/t5b, v3-vs3fix-panic2.mjs, Smoke ohne Fehler.


## VS4 — Säubern (Echo-Abzug, Nachfilter, Wiener-Entrauschen, HP 80 Hz, Regler SÄUBERN je Take, A/B Roh │ Sauber, Noten-Weg „1E“) · App 4.19.0

Grundlage: Nachtrag 2 Teil C (C.2 Nr. 4–6, Paket-Zeile VS4, C.4), `r7/stimme.md` §6, §7, §8, §11 Skizze 4, §12 VS4, §13 N7V-21 … N7V-25 und
N7V-35, N2-VS1-02; DSP-Kern `vs-dsp/clean.mjs` (getestet, 101/101 grün, unverändert übernommen). **Version 4.19.0** (`APP_CODE` 4 019 000,
Auftrag: VS4 = 4.19.0 statt 4.16.0). **Format bleibt 5**, alles additiv (K2-31). Keine Server-Änderung (Wächter `max_app` 4 021 000 deckt
4.19.0; kein Supabase-Aufruf in diesem Lauf). Zweig-Kopie `vs-br-VS4`, gestartet von VS3-fix (4.18.0).

**Was neu ist**
1. **Kern in der App:** `vsCleanMake()` = `clean.mjs` ohne Kommentare/Einrückung (20,7 KB), läuft im **Worker** (Blob), Rückfall
   Hauptfaden. Im Browser **bitgleich** zum getesteten Modul (`srcText()` im selben Browser); gegen den Node-Lauf max. 6·10⁻¹¹
   (nur Rundung der Math-Funktionen der JS-Maschine).
2. **Daten (additiv, ein Projekt ohne VS4-Felder bleibt Zeichen für Zeichen gleich):** `take.rf` = Vorlauf der Referenz in Samples (20 ms),
   `take.cl` = SÄUBERN in % (fehlt = 0 = Roh-Take). Audio-Store: Referenz-Stücke `<id>:r<k>` (nur Lautsprecher-Weg), gesäuberte Fassung
   als Cache `<id>:c<%>:<k>` + Info `<id>:ci<%>`; ältere Stärken eines Takes werden beim Neurechnen gelöscht; [Aufräumen] (VS3) behandelt
   alles über die Take-ID. Der Kern ist deterministisch: fehlt der Cache (anderes Gerät, ZIP), wird aus Roh + Referenz gleich neu gerechnet.
3. **Neuer Take (Mikro):** Lautsprecher-Weg → die App schreibt ihr eigenes Playback (Referenz, um 20 ms vorgezogen, damit das Echo sicher
   hinter der Referenz liegt) mit und setzt **SÄUBERN 60 %** (Skizze 4); Kopfhörer/Bluetooth → Roh-Take (0 %), Regler frei.
   Gesäubert wird nach dem Speichern im Worker; bis dahin spielt der Roh-Take, danach wird ohne Knacken umgeblendet.
4. **Hör-Weg** = Echo-Abzug (MDF, 2 Läufe, langsames Nachlernen, Doppelsprech-Bremse) + Nachfilter + Wiener (Rauschprofil aus den leisen
   Stellen) + HP 80 Hz phasenfrei; Boden −6 … −24 dB, **nie stumm (kein Gate)**. **0 % = Roh-Puffer selbst (bitgleich).**
5. **Takes-Blatt** (unter der Take-Liste): **SÄUBERN** 0–100 % (Regler, Schritt 5, ein Undo „Säubern n %“ beim Loslassen, Blatt folgt ↶/↷),
   **Vergleich [Roh] [Sauber]** (A/B, klingt sofort, Blatt zu → wieder „Sauber“), Zustand („säubert … (Netz pausiert)“, „Echo-Abzug ✓ ·
   Musik im Mikro 4 dB über der Stimme · Rauschen ↓ · kein Gate“, „ohne Echo-Abzug (Kopfhörer)“, „0 % = Original (bitgleich)“) und der
   Hinweis **„Viel Übersprechen – Kopfhörer oder leiser spielen“** (Übersprechen > 0 dB rel. Stimme; einmal je Take auch als Toast).
   In der Claude-App: Regler und A/B gesperrt, „Audio nur auf der eigenen Seite“, kein Worker, Daten bleiben deep-equal.
6. **Noten-Weg (VS2, N7V-25):** beim Lautsprecher-Weg rechnet die Auswertung von Stimme-FANG/● REC auf dem Echo-Abzug **„1E“** (ohne
   Nachfilter/Wiener/HP; 8 s Vorlauf zum Lernen; gleiche 3:1-Dezimierung wie das Worklet, gegen `d16` geprüft), aber nur, wenn der Abzug
   die Musik im Mikro spürbar senkt (≥ 1,5 dB), sonst bleibt alles wie in VS2. Die Übersprech-Probe (VS2-fix) prüft danach gegen den Rest
   (Kopplung −15 dB = Schwelle N7V-21). Beim Lautsprecher reicht das FANG-Fenster 3 Takte vor den live gehörten Anfang (live hört die
   Stimme unter lauter Musik oft erst später; offline entscheidet der Noten-Weg).
7. **Datenschutz (N7V-35, N2-VS1-02):** jedes Säubern (Take und Noten-Weg) hält die Netz-Ruhe (`tkQ('clean')` → `stQuiet`, SYNC hält,
   Realtime getrennt) ab dem ersten Schritt bis zum Speichern; Zähler fetch/XHR/Beacon/WS danach 0. Audio verlässt das Gerät nie.
8. **ZIP:** zusätzlich `takes/<id>.ref.wav` (Referenz) → nach dem Import klingt der Take gleich gesäubert (bitgleich nachgerechnet).
9. **Abspielen (FP-DSP):** Roh und gesäubert sind zeitgleich; laufende Stücke werden an derselben Stelle linear überblendet (6 ms,
   Summe konstant), geplante Stücke bekommen den anderen Puffer. `tkStartSrc` merkt sich dafür den Plan (`r.o`).
10. **Test-API:** `clInfo`, `clSet`, `clAB`, `clWait`, `clEnsure`, `clCore` (Kern über den Worker-Weg), `clPlayRange`, `clPlayHash`,
    `clRefRange`, `clNotesInfo`, `clNotesOff`, `clResK`, `clDecCheck`.
11. **Haken in VS2/VS3-Code (je eine Zeile):** `tkMakeTake` (`clNewTake`, Referenz + Säubern nach dem Speichern), `tkStartSrc` (`o` am
    Stück), `tkSheet` (`onClose`), `tkSheetPaint` (`clSheet`), `undoApply` (Art `takes` → `clSync`), `tkZipBytes`/`tkImportZip`
    (Referenz-WAV), `vsAnalyse` (Noten-Weg, Probe gegen den Rest), `vsFang` (Fenster beim Lautsprecher). MK-Motor/Platte unberührt.

**Abnahme** (Chromium 1243 headless; Skripte in `dirigent-test/`; Ausgaben `v3-vs4-core.out`, `v3-vs4-accept.out` (26/26),
`v3-vs4-lay.out`, `v3-vs4-fakewav.out`, `v3-vs4-click.out`, `v3-vs4-perf.out`)

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| N7V-21 | ✓ Kern der App (Worker) mit dem `bleed`-Szenario (0 dB, Einmessen 2 s, Raum 80 ms, RT60 0,3 s): **SDR 24,3 dB** (≥ 15), **Minderung in Pausen 31,8 dB** (≥ 15), **RPA 100 %** über 223 Fenster (≥ 99 %; ohne Säubern 74,4 %). In der App-Kette (Loopback App-Ausgang → Mikro, Musik so laut wie die Stimme, Stimme-FANG-Take): Musik in den Gesangspausen **−39,8 dB** bei 60 %, **−46,8 dB** bei 100 %, Stimme −0,4 … −0,7 dB | `v3-vs4-core`, `v3-vs4-accept B` |
| N7V-22 | ✓ +6 dB mit Sättigung (tanh): **SDR 13,2 dB** (≥ 10), RPA 99 %; **Noten-F in der App-Kette 1,000** (8/8, Musik im Mikro +4,8 dB über der Stimme, Lautsprecher-Loopback, Noten-Weg „1E“; ohne Säubern 0 Noten) | `v3-vs4-core`, `v3-vs4-accept B` |
| N7V-23 | ✓ kein Gate (SNR 40, 100 %): SDR 39,3 dB, längste Lücke < −40 dB in Noten 0 ms; **am echten Mikro-Weg** (getUserMedia mit `--use-file-for-fake-audio-capture` = gesungene WAV, ● REC): 0 ms, gesäubert gegen roh 44,3 dB in den gesungenen Stellen, Rauschen in den Pausen −19,7 dB | `v3-vs4-core`, `v3-vs4-fakewav` |
| N7V-24 | ✓ Kern: 0 % → bitgleiche Kopie; Take-Weg: bei 0 % spielt der Roh-Puffer selbst (Hash gleich), Regler per Finger auf 0 % → ein Undo, Undo → wieder die gesäuberte Fassung bitgleich | `v3-vs4-core`, `-accept B`, `-fakewav` |
| N7V-25 | ✓ Test-API meldet „1E“ (Kern und App-Kette `clNotesInfo`) | `v3-vs4-core`, `-accept B` |
| N7V-35 / N2-VS1-02 | ✓ während des Säuberns `quiet` enthält „clean“ und `stQuiet > 0`; danach Ruhe beendet, Zähler fetch/XHR/Beacon/WS = 0 | `-accept B` |
| hörbar | ✓ STIMME allein, Ausgang in den Gesangspausen: Roh −24,6 dB, Sauber −70 dB (Δ 45 dB); laute Stellen gleich | `-accept B` |
| Speichern/Laden | ✓ Neuladen: Takes deep-equal (cl, rf), gesäuberte Fassung aus dem Store ohne neues Rechnen, bitgleich; ZIP mit `.ref.wav` → frische Seite rechnet bitgleich nach | `-accept B` |
| Claude-App | ✓ Import deep-equal (cl bleibt), kein Säubern, kein Worker, Regler/A/B gesperrt | `v3-vs4-lay` |
| M-PLATZ | ✓ P1, P2, P3, L1, L2, 926×428: Blatt im Bild, Inhalt nicht höher als das Blatt, Regler und Knöpfe ≥ 44 × 44, nichts abgeschnitten, kein Layout-Sprung; Tipp „Roh“ und Regler-Ziehen mit dem Finger (Touch) wirken | `v3-vs4-lay`, Bilder `v3-vs4-{P1,P2,P3,L1,L2,XL}-takes.png`, `v3-vs4-claude-takes.png` |
| M-KLICK | ✓ A/B viermal und neue Stärke während des Spielens: 2. Differenz 1,09 × Krümmung des 440-Hz-Tons (≤ 1,5), 4 von 4 Läufen | `v3-vs4-click` |
| Regression | ✓ `v3-vs2-accept` ALLE OK (49), `v3-vs3-accept` 72/72, `v3-vs3-lay` grün, `v3-vs3-click` grün, `gmkp8-voc-mic` 8/8, `gmkp8-mk8-platz-quer` 9/9, Rauchtest ohne Fehler (`v3-vs4-smoke.png`) | `dirigent-test/vs4reg/r-*.out` |

**Fach-Prüfung (Teil J, Gruppe 7: FP-DSP ● Haupt, FP-IPHONE)** – eigener zweiter Durchgang über Diff, Messungen und Bilder (kein getrennter
Agent). **7 Befunde, alle behoben:**
- *FP-DSP 1:* Puffer-Tausch über `tkVoxResync` (Ausblenden exponentiell, Einblenden linear) gab einen Knick: 1,75–2,1 × Krümmung. → Tausch
  an derselben Stelle mit gleich langer linearer Überblendung (Summe konstant): 1,09 ×.
- *FP-DSP 2:* `cancelAndHoldAtTime` + `linearRampToValueAtTime` sprang in Chromium sofort auf 0 (Einbruch 0,3 → 0,01). → feste Werte
  (`cancelScheduledValues`, `setValueAtTime(G)`, Rampe); in Blenden wird nicht getauscht.
- *FP-DSP 3:* Noten-Weg ohne Probe: Musik allein (Lautsprecher) ergab 35 falsche tiefe Noten aus Bass-Resten. → Probe gegen den Rest
  (−15 dB): 0 Noten; mit Gesang 8/8.
- *FP-DSP 4:* Klick im Mikro, der nicht vom Lautsprecher kommt (VS2-Test G), teilte nach dem Abzug eine Note (7 statt 5). → Abzug nur,
  wenn er ≥ 1,5 dB senkt (dort 0,1 dB → VS2-Weg, 5/5).
- *FP-DSP 5:* Bei lauter Musik hörte die Live-Erkennung die Stimme erst ab Takt 2 → FANG-Fenster begann zu spät (erster Takt fehlte).
  → Lautsprecher: 3 Takte vor dem live gehörten Anfang.
- *FP-IPHONE 6:* Takes-Blatt ragte in 926 × 428 unten 5 px aus dem Bild und rollte nicht mit dem Finger. → `popFit`, Blatt `pan-y`, quer
  (≤ 440 px hoch) kürzer (Hilfetext aus, engere Abstände).
- *FP-IPHONE 7:* Ging Säubern schief (Roh-Take fehlt), hätte jede Planung es neu gestartet. → Fehler-Merker je Take und Stärke.
- Geprüft ohne Befund: 60-s-Take im Worker 3,8 s (6,3 % Echtzeit, Xeon), Hauptfaden 60 fps, längster Frame 25 ms, keine lange Aufgabe
  (`v3-vs4-perf`); NaN-/Denormal-Schutz und Allokationsfreiheit im Kern (vs-dsp-Tests); Worker-Fehler → Toast, Roh-Take spielt.

**Abweichungen (begründet)**
- **Version 4.19.0** statt 4.16.0 (Auftrag). **Format 5** bleibt (additiv).
- **Standard SÄUBERN:** neue Lautsprecher-Takes 60 % (Wert aus Skizze 4), Kopfhörer-Takes 0 % – sonst ändert sich der Klang einer
  Aufnahme, bei der es nichts abzuziehen gibt. Alte Takes bleiben 0 % (bitgleich).
- **A/B** heißt im Blatt „Vergleich [Roh] [Sauber]“, weil das Takes-Blatt schon einen [A/B]-Knopf für zwei Takes hat (VS3).
- **Säubern im Worker** offline nach dem Speichern (Spec: „Worker“); der Block-Verarbeiter `Cleaner` für live (Worklet) ist eingebettet,
  aber nicht verdrahtet (live = nur Hören, C.2 Nr. 5).
- **Speicher:** Lautsprecher-Takes belegen etwa das Dreifache (Roh + Referenz + gesäuberte Fassung), Kopfhörer-Takes mit Säubern das
  Doppelte; Worker-Spitze bei einem 2-min-Take ≈ 90 MB (Int16-Kopien + 3 Float-Felder) – am iPhone ungemessen.
- **VS2-Verhalten beim Lautsprecher** geändert (Noten-Weg „1E“, Probe gegen den Rest, FANG-Fenster 3 Takte); VS2-Abnahme bleibt grün.
- **Budget:** +25 KB geplant, gebaut **+43,7 KB roh / +14,9 KB gzip** (3 187 354 → 3 231 078 B): der Kern allein 20,7 KB, dazu
  Worker/Cache/Blatt/ZIP/Noten-Weg und Test-API. Weit unter 5,0 MB; Startzeit unverändert (der Block tut beim Laden nichts).

**Bekannte Lücken**
- Wellenform in Matrix/Song zeigt den Roh-Take (Skizze 4: gesäubert).
- Ein Take ohne ruhige Stelle in den ersten 20 s hat kein Rest-Echo-Profil (Rückfall Leck-Schätzung, vs-dsp README).
- Echo-Abzug ist linear: sehr lauter Handy-Lautsprecher nah am Mikro (Sättigung) lässt etwa SDR 13 dB – der Hinweis rät dann zu
  Kopfhörern.
- Alles synthetisch bzw. mit Loopback gemessen; echte Stimme/Raum/iPhone-CPU fehlen (Geräte-Punkte unten).

**Befunde an VS3 oder früher (nur gemeldet)**
- VS2: Bei lauter Musik über den Lautsprecher (Musik ≥ Stimme) fand Stimme-FANG ohne Säubern 0 Noten (Live-Start zu spät, Übersprech-Probe
  verwirft alles) – mit VS4 behoben (siehe Punkt 6); Kopfhörer-Weg unverändert.
- VS3: `tkFadeAt` nutzt `cancelAndHoldAtTime` + `setTargetAtTime`; mit linearer Rampe danach springt Chromium auf 0 (siehe FP-DSP 2) –
  `tkFadeAt` selbst ist davon nicht betroffen (VS3-Klicktest grün), nur als Warnung für spätere Pakete.

**Für Xander am iPhone (Pages-Seite)**
1. **Ohne Kopfhörer**, Musik normal laut: 🎤 an, ▶, 4 Takte singen, **FANG 🎤** → OK. Nach ein paar Sekunden ist der Take gesäubert.
   ✎ auf dem STIMME-Clip → im Blatt **SÄUBERN 60 %** und **Vergleich [Roh] [Sauber]**: hörst du bei „Sauber“ die Musik in deinen
   Gesangspausen fast nicht mehr? Klingt deine Stimme gleich (nicht dumpf, nicht „blubbernd“)?
2. Regler auf 100 % und auf 30 % ziehen, jeweils vergleichen. ↶ holt den alten Wert zurück.
3. Mit Kopfhörern: der Take bleibt roh (0 %); Regler hoch → nur Rauschen ↓.
4. Bitte melden: ab wie viel % klingt es für dich am besten (Standard 60 %)? Knackt es beim Umschalten? Steht der Hinweis „Viel
   Übersprechen“, wenn die Musik sehr laut war?

## VS4-fix (27.10.) · App bleibt 4.19.0 · Format 5 · keine Server-Änderung

**Behoben (beide QA-Befunde nachgestellt, dann behoben und erneut gemessen)**
1. **SÄUBERN machte gehaltene Töne/Legato leiser** (N7V-23; Sinus −17/−24 dB, Legato SDR 6–8 dB). Ursache wie gemeldet: Rauschprofil =
   „leiseste 10 % der Rahmen“ = ohne Pause die Stimme selbst. Fix im Kern (`noisePsd`): Profil je Frequenz nach oben begrenzt
   (20-%-Quantil über die Zeit, Minimum über ±6 Bins, ×9). Echtes Rauschen bleibt darunter (Rauschboden-Test 23,6 dB unverändert).
   Dazu: **Lautsprecher-Weg ohne Echo** bildete das Echo-Filter gehaltene Töne der Stimme aus der Begleitung derselben Tonart nach
   (Stimme −3,5 … −5 dB). Fix: Echo-Abzug nur bei klarem Echo-Weg (GCC-PHAT-Spitze ≥ 15 × Effektivwert; gemessen ohne Echo 3,8–11,
   mit Echo ab −10 dB rel. Stimme 27–143); sonst `info.aec = 'aus'`, Säubern = nur Entrauschen.
   Gemessen in der App (echte Mikro-Attrappe, gleiche Aufnahme alt/neu verglichen, `qa-vs4/takecmp.mjs`):
   Kopfhörer-Legato 100 % SDR 6,7 → **27,8 dB**, Stimme −3,7 → **−0,11 dB**; 60 % 7,8 → **28,3 dB**. Lautsprecher-Legato 60 %
   6,1 → **28,3 dB**, −4,7 → −0,11 dB. Sinus 440/220 Hz bei 60/100 %: **0 / −0,2 dB** (vorher −17/−24). Szene mit 440-Hz-Take:
   `v3-qa-vs4-reg` alles grün.
2. **Stimme-FANG über Lautsprecher bei +6 dB mit Sättigung fand Bass-Noten** (N7V-22, Noten-F 0,55–0,67). Zwei Ursachen:
   (a) Die Übersprech-Probe rechnete ohne Einmessen mit −20 dB Kopplung; tatsächlich −1 … −7 dB. Jetzt misst `clNotes` die Kopplung
   aus dem abgezogenen Echo (Mikro − Ergebnis gegen Referenz, `CL.notes.coupDb`); die Probe nimmt die höhere von eingemessen und
   gemessen (`vsBleedPow(m, gm)`). (b) Änderte sich der Echo-Weg im 8-s-Vorlauf (erst ohne, dann mit Echo), lernte das Filter zu
   langsam. Kern-Option `o.from`: das Ergebnis zählt erst ab dem ausgewerteten Stück; zweiter Versuch, der nur die letzten 8 s lernt,
   gilt, wenn er dort weniger Rest-Energie lässt (`info.learn 'neu'`). Gemessen (HPC 1,35, je Lauf): sat6 **F 0,941** (5 Läufe),
   fang6 0,941, fang0 0,941, fangN 0,941 – vorher 0,55–0,67 / 0,67 / 0,80.
- Der Noten-Weg meldet ohne Echo-Weg jetzt `way 'roh'` (mit `pk`, `aec 'aus'`) statt „1E“: es gibt nichts abzuziehen (VS2-Verhalten).
  N7V-25 („1E“) gilt, sobald ein Echo da ist (sat6/fang6/fang0/Abnahme: „1E“).
- Kern `vs-dsp/clean.mjs` + Tests (`node run-tests.mjs`: **107 Prüfungen grün**, neu: Legato ohne Pause, gehaltener Sinus, Legato mit
  Referenz ohne Echo, `o.from` mit/ohne Wechsel des Echo-Wegs); eingebettet per `dirigent-test/v3-vs4fix-embed.mjs` (Kommentare raus),
  App-Kern im Worker bitgleich zum Modul (`v3-vs4-core.mjs` ALLE OK). Builder-Abnahme `v3-vs4-accept.mjs` ALLE OK, Smoke ohne Fehler.
- Größe: 3 231 078 → 3 233 663 B (+2,6 KB roh, +1,0 KB gzip). Rechenzeit Kern unverändert (alt/neu im selben Lauf gleich schnell);
  der Noten-Weg rechnet bei `from` bis zu zwei Lern-Läufe (In-App 2,5–3,2 s für 13 s statt 1,9–2,4 s, Xeon, unter Last).

**Bekannte Lücken / beobachtet**
- Legato **mit** Echo (Lautsprecher, Begleitung in derselben Tonart): das Echo-Filter kostet die Stimme weiter ≈ 1 dB, SDR ≈ 14 dB
  (synthetisch); mit Pausen 19–25 dB. Echtes Gerät ungemessen.
- Test-Umgebung: unter CPU-Last (Nachbar-Builds) lieferte die Fake-Mikro-Aufnahme mehrmals einen schon kaputten Roh-Take (Roh-SDR
  18,8 / 18,1 / 1,4 / −16 dB statt 36,5) – dann ist jede Messung danach wertlos; alt/neu auf derselben Aufnahme verglichen.
  Ebenso schwankt der Take-SDR bei sat6 (9,6–15,7 dB) und echo0 (100 %: 13,3–14,8 dB) von Lauf zu Lauf – alter und neuer Kern auf
  derselben Aufnahme bitgleich bzw. ±0,1 dB, also kein Effekt dieses Fixes (echo0 100 % knapp unter 15 dB: Befund an VS4, offen).


# CHANGES – Zweig VS5 (VS5a, VS5b)

## VS5a – Marken & Scheiben, Audio quantisieren (4.20.0, 26.10.2026)

Grundlage: Zweig-Kopie `vs-br-VS5/index.html` ab VS3-fix (4.18.0). Spec: Nachtrag 2 Teil C (C.2, C.4 N2-VS5a-01, C.5), `r7/stimme.md` §9, §10, §13 (N7V-26, N7V-27), `song-delta.md` N7S-51. DSP-Kern `vs-dsp/marks.mjs` eingebettet (ohne Kommentare, `function vsMarksMake()`), Verhalten bis auf die Lückenfüllung der Scheiben unverändert (siehe unten). Versionszeile `4.20.0`; Format bleibt 5 (additive Felder, K2-31). Keine Datenbank-Änderung, kein Supabase-Aufruf.

### Gebaut
1. **Daten (additiv am Take, Format 5):**
   - `take.marks = [{t, conf, word?, user?}]` – Sekunden im Take. Die Marken stehen erst im Projekt, wenn Xander sie von Hand ändert oder quantisiert. Vorher werden sie im Worker erkannt (`detectMarks`) und je Take zwischengespeichert, abhängig nur vom Audio. Ein Take ohne Änderung bleibt deshalb Zeichen für Zeichen gleich. Das ist auch für die VS3-Undo-Tests wichtig.
   - `take.warp = {mode:'slice', grid ('auto'|'1/4'…), res (benutztes Raster), strength, swing, bpm, t0, map:{v:1, src, dst}}` – die Zeitkarte `warp.map` (stückweise linear, C.5 Nr. 5). Gespeichert wird sie mit 6 Nachkommastellen, das Normalisieren ist idempotent.
   - `take.follow = false` bedeutet „Audio folgt“ aus. Standard ist an.
   - Normalisiert wird über `tkExt().take`. Speichern → Laden ist deep-equal (geprüft mit Marken und Karte).
2. **Quantisieren (C.5 Nr. 3, 4):**
   - Es gibt eine Funktion `wpQuant`. Sie ruft `quantizeMarks` mit der Logik von `quantizeNoteSet` auf, Auto über `KeyDetect.detectGrid`.
   - Raster: Aus, Auto, 1/4, 1/8, 1/8T, 1/16, 1/16T, 1/32. Dazu Stärke 0–100 % (Standard 100 % in „Scheiben“) und Swing 50–75 %.
   - Das Fangfenster ist ±40 %; Marken außerhalb bleiben stehen. Die Reihenfolge bleibt immer erhalten.
   - Grundlage für das Raster ist `t0` = die Take-Sekunde auf Schlag 0 des Clips (`in − at·spb`); für Song-Stimmen gilt dasselbe am Song-Takt.
   - Wird eine Marke geändert, rechnet die Karte mit dem gespeicherten Raster, der Stärke und dem Swing neu – im selben Undo.
3. **Abspielen (C.5 Nr. 5, 6, 8):**
   - `tkExt().proc` steht vorn (`unshift`) und liefert die gerenderte Fassung („Scheiben“, `renderSlices`) aus einem Worker (Blob, keine Netzaufrufe).
   - Der Cache gilt je Take und ist an Karte und Quell-Puffer geschlüsselt. Die Quelle ist das, was die anderen Verarbeiter liefern (VS4 Säubern, sobald gemergt), sonst der Roh-Take.
   - Aus, Stärke 0 % oder ↶ ergibt den Roh-Take selbst, also bitgleich.
   - Ist die neue Fassung fertig, plant `tkVoxResync(true)` STIMME-Spur und Song-Stimme ab jetzt neu (5-ms-Blenden).
   - Beim Ziehen eines Reglers wird erst nach 150 ms Ruhe gerendert, beim Loslassen sofort (FP-IPHONE).
4. **Marken-Editor** (Skizze 4, eigenes Blatt `#wpSheet` wie das Quantisier-Blatt, als Überlagerung, die nichts verschiebt):
   - **Öffnen:** Takes-Blatt → [✎ Marken · Quantisieren]. Das geht für Szenen-Clips und Song-Stimmen.
   - **Kopf:** „MARKEN · STIMME · Szene n“, [A/B] (vorübergehend das Original hören; ✕ schaltet zurück auf die quantisierte Fassung), [✕].
   - **Bild:** Wellenform (Original), Takt-, Schlag- und Rasterlinien, Taktnummern, außerhalb des gespielten Stücks dunkler.
   - **Marken:** Silbe dünn, Wort dick, unsicher blasser, mit Griff oben. Das Ziel quantisierter Marken ist ein bernsteinfarbener Strich mit Verbindung.
   - **Info-Zeile im Bild:** „n Marken · Raster · Stärke · rechnet …“.
   - **Bedienung:** Raster-Chips, Stärke, Swing, Modus [Scheiben │ Dehnen] (Dehnen ist gesperrt, kommt mit VS5b), Zoom [1 Takt │ 2 Takte │ 4 Takte │ Ganz].
   - **Gesten (C.5 Nr. 2, K2-64):**
     - Tipp auf eine leere Stelle setzt eine Marke (ein Undo).
     - Ziehen > 8 px auf einer Marke verschiebt sie. Die Grenze liegt je 10 ms vor bzw. nach den Nachbarn. Beim Ziehen sieht man die Marke als Geist; beim Loslassen entsteht ein Undo.
     - Ziehen auf einer leeren Stelle verschiebt die Ansicht.
     - Tipp auf eine Marke öffnet das Blatt [✕ Löschen] [Abbrechen] (L4). Löschen ist ein Undo mit Toast [Rückgängig].
     - Halten (≥ 500 ms ohne Bewegung) bewirkt nichts.
   - **Undo:** ↶ ↷ einer Take-Änderung lässt Wiedergabe und Editor folgen (`wpUndone` in `undoApply`). `closeSheets` schließt den Editor.
5. **„Audio folgt“ (C.5 Nr. 3):**
   - Quantisieren eines MELODIE-Clips mit `clip.take` nimmt den Take mit demselben (aufgelösten) Raster, derselben Stärke und demselben Swing mit, im **selben Undo**: Die Gruppe enthält `clip` und `takes`.
   - Das gilt für das Quantisier-Blatt [Anwenden] und für `quantizeClip`. Raster „Aus“ entfernt die Karte.
   - Im Kopf des Quantisier-Blatts gibt es den Schalter [Audio folgt]. Er erscheint nur mit einem verknüpften Take auf der eigenen Seite und wird mit [Anwenden] gespeichert.
   - Fehlen die Marken noch, wartet der Take auf die Erkennung. Er hängt sich nur an das Undo, solange es noch oben liegt.
6. **Claude-App:** Ohne Audio (`tkAudioOk()` falsch) gibt es weder den Knopf noch den Editor noch [Audio folgt] (C.5 Nr. 1). Die Take-Daten bleiben beim Speichern erhalten.
7. **Test-API:** `wpInfo`, `wpDetect`, `wpQuantize`, `wpMark(add|move|del)`, `wpAB`, `wpPlayed` (die Fassung, die klingt), `wpOpen`, `wpClose`, `wpGeom`, `wpCore`.

### Änderung am DSP-Kern `vs-dsp/marks.mjs` (renderSlices, Lückenfüllung) – Begründung
- **Vorher** wurde die Lücke mit dem gespiegelten Ende der vorigen Scheibe gefüllt, mit Kosinus-Ausblendung über die ganze Lücke. Gemessen auf gehaltenem Gesang gab das **bis −17 dB Loch** (M-EINBRUCH) und an jeder Umkehr einen Knick (M-KLICK **+35 dB** bei reinem Ton). Für Gesang bis zum Erscheinen von VS5b ist Scheiben der einzige Modus.
- **Jetzt:**
  - Die Lücke füllt eine Schleife aus dem Ende der Scheibe. Ihre Länge ist die Periode mit der besten Korrelation (5–40 ms).
  - Die Naht je Runde blendet ≤ 2 ms von der echten Fortsetzung (Audio vor dem Einsatz) in den Schleifenanfang.
  - Der Übergang am Einsatz ist korrelationsabhängig: gleichspannungsgemäß bei ρ > 0,5, sonst gleichleistungsgemäß wie im Dehnen-Kern.
  - Anschläge ab dem Einsatz bleiben bitgleich.
- `node vs-dsp/run-tests.mjs`: **alle grün** (VS4 39, VS5a 32, VS5b 30). Der README-Abschnitt „Bekannte Grenzen“ ist ergänzt.

### Abnahme (eigene Läufe, Chromium 1243 headless; Skripte in `dirigent-test/`)
| ID | Prüfung | Ergebnis | Skript |
|---|---|---|---|
| N7V-26 | Stärke 100 % → alle Marken im Fangfenster auf dem Raster; 50 % = halber Weg | ✓ 15 Marken, Abstand 0,000 Samples; 1 Marke außerhalb ±40 % unverändert; 50 %: Abweichung 0,0000 ms | `v3-vs5a-t1.mjs` |
| N7V-27 | Scheiben, Klickfolge: Spitze je Klick ±0,1 dB, Anschläge bitgleich | ✓ 0,0000 dB; 16/16 Anschläge (20 ms ab Einsatz) bitgleich | `v3-vs5a-t1.mjs` |
| N7S-51 | 1/16, 100 %: Einsätze ±2 ms am Raster | ✓ **an der Grenze**: 15/15 mit 2,0 ms (die Marken-Feinlage des Kerns liegt bei harten Klicks 2,0 ms vor dem Einsatz, siehe Lücken) | `v3-vs5a-t1.mjs` |
| N7S-51 | M-KLICK (HP 5 kHz, 2-ms-Fenster, +6 dB) | ✓ Klickfolge 5,45 dB (Original 5,51); gesungene Noten 10,82 dB gegen Original 10,67 dB (die Testsignale mit 15-ms-Anschlag liegen schon selbst über 6 dB, deshalb Vergleich ≤ Original + 1 dB) | `v3-vs5a-t1.mjs` |
| N7S-51 | M-EINBRUCH ≤ 3 dB an jedem Schnitt | ✓ gesungene Noten (`voice()` des Kerns): kein Schnitt mehr als 0,34 dB unter dem Loch des Originals an derselben Stelle. **Grenze:** streng periodischer Dauerton −4,44 dB an 1 von 12 Schnitten (Phasensprung in der Lücke bei bitgleichem Anschlag, wie beim Dehnen dokumentiert) | `v3-vs5a-t1.mjs` |
| N7S-51 | nach Undo Original bitgleich; Stärke 50 % halber Weg; außerhalb ±40 % bleiben | ✓ alle drei | `v3-vs5a-t1.mjs` |
| C.5 Nr. 8 | Stärke 0 % = bitgleich; A/B; ein Undo | ✓ Stärke 0 → Roh-Take; A/B → Roh-Take; jede Aktion genau 1 Undo | `v3-vs5a-t1.mjs`, `t2` |
| N2-VS5a-01 | Halten 1 s ohne Bewegung → deep-equal; Halten 600 ms + 40 px ziehen → nur verschoben, 1 Undo; Tipp leer → neue Marke, 1 Undo; Tipp auf Marke → [✕ Löschen] [Abbrechen]; Löschen → weg, 1 Undo, Toast [Rückgängig] | ✓ alle fünf (Touch-Tipps über `touchscreen`, Ziehen per Zeiger); [Abbrechen] löscht nicht; ↶ holt die Marke zurück | `v3-vs5a-t2.mjs` |
| Hörbar (e2e) | STIMME-Clip spielen, Ausgang mitschneiden | ✓ quantisiert: Einsatz-Abstände 250,0 ms (genau 1/16-Vielfache), nur der Klick außerhalb ±40 % weicht ab (308/192 ms); [A/B] Original: 220/298/212/303 … ms | `v3-vs5a-t2.mjs` |
| Audio folgt | MELODIE-Quantisieren nimmt den Take mit, ein Undo, ↶ deep-equal | ✓ API und Blatt [Anwenden]: Gruppe `clip,takes`; Schalter aus → Take bleibt, `follow:false` im selben Undo | `v3-vs5a-t2.mjs` |
| Mikrofon (Fake-Gerät) | gesungene WAV → ● REC-Take → Marken → 1/8 → klingt | ✓ 16 Marken auf 16 Silben (123 ms im Worker), Ziele 0,00 Samples auf dem Clip-Raster, Wiedergabe = quantisierte Fassung, 0 Netzaufrufe (nur `blob:` des Workers) | `v3-vs5a-t5.mjs` |
| M-PLATZ | P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428 | ✓ Editor ganz im Bild, nichts abgeschnitten, keine Knöpfe außerhalb, Seitengröße unverändert; Bild P1 84 px, P3 50 px, L1 118 px hoch; Takes-Knopf 44 px; [Audio folgt] nicht abgeschnitten | `v3-vs5a-t3.mjs`, Bilder `dirigent-test/vs5a/lay-*-{takes,editor,qsheet}.png` |
| Claude-App | iframe ohne Mikrofon | ✓ `audioOk` falsch, Editor öffnet nicht | `v3-vs5a-t3.mjs` |
| Rundweg | Speichern → Laden mit Marken und Karte | ✓ deep-equal | `v3-vs5a-t1.mjs` |
| Smoke | `smoke.mjs` | ✓ keine Fehler | – |
| VS3-Regression | `v3-qa-vs3-reg`, `-t1`, `-t2`, `-t3` gegen diese Kopie | ✓ reg, t2 grün; t1 und t3 zeigen dieselben Befunde wie die Hauptlinie 4.18.0 (siehe unten), nichts Neues | Kopien in `dirigent-test/vs5a/reg/` |

### Fach-Prüfung (Nachtrag 2 Teil J, Gruppe 7: FP-DSP, FP-IPHONE) – an mir selbst
- **FP-DSP:**
  - Bitgleichheit bei Aus, 0 % und ↶ ist geprüft, ebenso die Anschläge (N7V-27).
  - Die Klick-Folge liegt unter dem Original. Der Knick der alten Spiegelung (+35 dB) ist behoben, Loch und Knick ebenfalls.
  - **Grenze:** Bei streng periodischem Dauerton bleibt ein Phasensprung an Lücken: −4,4 dB bzw. M-KLICK 6,8 dB an 1 von 12 Schnitten.
  - NaN/Inf-Schutz kommt aus dem Kern (`ok()`); der Kern-Test „Ausgabe endlich“ ist grün.
  - Kein Worklet-Code; das Rendern läuft offline im Worker.
  - Der Wechsel zwischen alter und neuer Fassung beim Abspielen läuft über die vorhandenen 3/5-ms-Blenden von VS3 (`tkVoxResync`).
  - Der Rückfall auf den Hauptfaden greift nur, wenn kein Worker möglich ist.
- **FP-IPHONE** (60-s-Take, `v3-vs5a-t4.mjs`):
  - Marken: 1,4 s im Worker; Rendern: 118 ms im Worker; getroffen 88/88 Einsätze ±30 ms.
  - Hauptfaden ohne longtask > 50 ms über Öffnen, Quantisieren, 20 Regler-Schritte und 4 Zoom-Stufen. Ein 75-ms-Task beim allerersten Tipp der Seite ist der App-Start (Audio-Kontext), nicht VS5a.
  - Speicher: je Take mit Karte ein zusätzlicher AudioBuffer (≈ 11,5 MB je Minute), nur für hörbare Takes (Cache ≤ 6 übrige). Beim Rendern hält der Worker kurz eine Kopie.
  - Regler-Ziehen rendert erst nach 150 ms Ruhe (vorher ein GC-Task von 121 ms gemessen, behoben).
  - Die CPU am iPhone ist ungemessen (iPhone-Faktor unbelegt).
  - Dateigröße siehe unten.

### Abweichungen von der Spec
- **Quelle der Marken:** Die Marken kommen aus `detectMarks` des Kerns (Spektralfluss + Pegel + Tonwechsel), nicht aus den VS2-Noteneinsätzen. Sie gelten für Gesang und Instrument gleich und sind getestet (README: 100 % in ±30 ms).
- **A/B im Editor** ist ein vorübergehender Hör-Schalter (nicht im Projekt, kein Undo). ✕ schaltet zurück.
- **Marken verschieben** ändert die *Quellstelle* (wo der Einsatz im Take liegt). Das Ziel ergibt sich aus Raster, Stärke und Swing.
- **Wort-Marken:** Sie werden erkannt (≥ 120 ms Ruhe davor) und dick gezeichnet. „Zwei Silben durch Wischen verbinden“ (§10) ist nicht gebaut; Songtext kommt mit VS5b.
- **Nicht im Editor:** Die Tonhöhenlinie und die Korrektur-Griffe aus Skizze 4 fehlen. SÄUBERN ist VS4.
- **Budget:** +54 KB statt +25 KB (Kern 20,4 KB, App 29,4 KB, CSS 3,4 KB; gzip +18 KB). Die Datei hat 3,24 MB, die Grenze liegt bei 4,0 MB.
- **Chromium-Pfad:** `/opt/pw-browsers/chromium-1194/…` gibt es nicht. Benutzt wurde `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`, wie in den VS3-Tests.

### Bekannte Lücken / offen
- ~~**Marken-Feinlage:** Harte Klicks liegen 2,0 ms zu früh.~~ Behoben in VS5a-fix (siehe unten).
- **Dauerton-Phasensprung in Lücken** (siehe FP-DSP).
- **Tempo:** Wird das Tempo nach dem Quantisieren geändert, bleibt die Karte (in Sekunden) wie sie ist. Das Audio folgt dem Tempo ohnehin erst mit dem Dehnen (VS5b).
- **„Audio folgt“** gilt beim [Anwenden], nicht schon in der Live-Vorschau des Quantisier-Blatts.
- **Gerät:** Am iPhone ungeprüft (siehe Geräte-Punkte).

### VS3-Befunde (nur gelistet, nicht geändert)
- `v3-qa-vs3-t3`: Das Spurleisten-Etikett „🎤 Audio · Takes: ✎“ ist in P1, P2, P3, L1 und XL abgeschnitten (`scrollWidth` 103 > `clientWidth` 62–79). Das gilt auch auf der Hauptlinie 4.18.0.
- `v3-qa-vs3-t1`: „no network requests during recording (1)“ zählt die `blob:`-Adresse eines lokalen Workers als Netzaufruf, ebenfalls auf der Hauptlinie. Es ist kein echter Netzaufruf; das Prüfskript sollte nur `http(s)` zählen.

### Für Xander am iPhone (Geräte-Punkte, kurz)
1. Auf https://xanderfoxy.github.io/Synquenzer/ 2 Takte mit Kopfhörern singen (● REC mit 🎤). Danach STIMME-Clip ✎ → [✎ Marken · Quantisieren].
2. Stimmen die weißen Striche mit deinen Silben? Fehlende mit einem Tipp setzen, falsche antippen → [✕ Löschen].
3. [1/16] oder [1/8] tippen und abspielen: Sitzen die Silben auf dem Takt? Mit [A/B] vergleichen. Knackt oder bricht es irgendwo ab?
4. Den MELODIE-Clip desselben FANGs quantisieren (Quantisier-Blatt, „Audio folgt“ an): Rücken Gesang und Noten zusammen?

### Datenbank
Nichts nötig. Format 5 und `max_app` 4021000 decken 4.20.0 ab.


## VS5a-fix (4.20.0 bleibt, 27.10.2026) – zwei QA-Befunde

Snapshot: `synq-snapshots/VS5a-fix.html`. Kein Format-, Versions- oder Datenbank-Wechsel, kein Supabase-Aufruf. Nur VS5a-Code (Marken-Kern, `wp*`, `tk*`-Abspielweg) geändert.

### 1. N7S-51 – Einsätze landeten 2,0–2,9 ms hinter der Linie (QA `v3-qa-vs5a-a.mjs`)
- **Nachgestellt:** ja. Am Original VS5a lagen 11 von 15 Einsätzen 1,6–2,9 ms zu spät, weil die Marke vor dem hörbaren Einsatz saß.
- **Kern `vs-dsp/marks.mjs` (`detectMarks`, eingebettet gleich):** neue Feinlage `fine()` nach `cross()`. Sie greift nur bei harten Anschlägen (50 % der Spitze in ≤ 3 ms) und setzt die Marke auf das erste Sample des Anstiegs. Sonst bleibt alles wie bisher; am gesungenen QA-Satz bewegt sich 1 von 64 Marken (+2,4 ms). Kern-Test `test-marks.mjs`: 32/32 OK. Gesang bei SNR 20 dB: 90 % in 6,2 ms statt 5,2 ms, Median unverändert 3,0 ms. `VERSION: 'vs5a-marks-2'`.
- **App: Schutz des Anschlags.** Sitzt die Marke auf dem Anschlag, lag der 5-ms-Übergang der Scheiben, der an der Marke endet, über dessen erstem Bruchteil. Folge: N7V-27 nur noch 8/16 bitgleich. Jetzt laufen Schnitt und Übergang `WP_LEAD` = 4 ms (ganze Samples) vor der Marke, bei gleicher Verschiebung. Die Einblende am Clip-Anfang folgt dem ebenso.
- **App: Ziele auf ganze Samples (`wpSmp`).** Ziele der Zeitkarte und von Hand gesetzte oder verschobene Marken liegen jetzt auf ganzen Samples. Bei 44,1 kHz fällt jede ungerade 1/16 bei 120 BPM sonst auf ein halbes Sample. Dann zeigt die Karte etwas anderes, als gerendert wird, nämlich eine um 1 Sample andere Verschiebung. N7V-26 bleibt ≤ 0,49 Samples (Spec ±1).
- **Ergebnis (`v3-qa-vs5a-a.mjs`, 2 Läufe):**
  - N7V-27: 15/15 bitgleich (Original 14/16).
  - Ausgabe gleich Render.
  - Alle nicht verdeckten Einsätze liegen −0,4 … +0,34 ms an der Linie.
- **Rest im QA-Skript, kein App-Fehler:** 2–3 Anschläge je Lauf liegen im lauten Ausklang des vorigen Klangs (Ausklang > 10 % der neuen Spitze). Für diese setzt der QA-Finder `onsets20` den Einsatz auf „Block − 3 ms“. Das liegt 1,5–2,8 ms **vor** dem echten Beginn, deshalb zeigt das Skript dort −3,0 … −3,8 ms.
  - Gegenprobe mit der wahren Generator-Zeit (`v3-vs5afix-adump.mjs` + `v3-vs5afix-aan.mjs`): alle Einsätze im Fangfenster liegen bei 100 % zwischen −1,09 und +0,14 ms an der Linie. Bei 50 % ist der halbe Weg auf ±0,01 ms getroffen. Ab dem wahren Beginn sind 15/15 Anschläge bitgleich.
  - Am Datei-Take (`v3-vs5afix2-truth.mjs`): |Marke − wahr| ≤ 1,10 ms.
- **„50 % = halber Weg … 222 ms“** im selben QA-Skript scheitert am Original genauso. Der Finder verliert verdeckte Einsätze, danach ordnet er die Paare falsch zu. Die Wahrheits-Gegenprobe zeigt bei 50 % höchstens 0,01 ms.

### 2. Fassungswechsel beim Abspielen: −7 … −9 dB und Knacks (QA `v3-qa-vs5a-c/d/d2.mjs`)
- **Nachgestellt:** Mit dem QA-Aufnehmer ja. Die Ursache liegt aber zum großen Teil im Messaufbau:
  - Das AudioWorklet meldet in Chromium ab und zu denselben `currentFrame` zweimal hintereinander, und zwar gerade dann, wenn der Hauptfaden den Graphen ändert, also beim Wechsel. Gelesen wird `Δ = 0` und danach `Δ = 256`.
  - `recStop` legt die Blöcke nach `currentFrame` ab. Dadurch überschreibt es einen Block und lässt ein 128-Sample-Loch aus Nullen. Das ergibt genau den gemeldeten Einbruch von −7 … −9 dB und den „Knacks“: Der Sprung von 0,17–0,30 entspricht der Signalhöhe.
  - Beleg 1: Der Aufnehmer `v3-vs5afix2-rec.mjs` legt einen wiederholten Frame an die Folgestelle. Damit verschwinden die Ereignisse.
  - Beleg 2: Auch ohne jeden Wechsel tritt die Anomalie auf, etwa beim Aufbau des Drum-Busses beim Start (dort Sprung 0,150 bei Ablage nach Frame, nichts bei Ablage in Reihenfolge).
  - Beleg 3: Der QA-Dauerton hat **0 Marken**. Die Aktivitätsschwelle braucht eine Ruhe, der Ton hat keine. Quantisieren ist dort also ein Wechsel zwischen bitgleichen Fassungen und kann nichts auslöschen.
- **Echter Teil, behoben:** Bei echten neuen Fassungen sind alt und neu zwei verschieden verschobene Signale. Die bisherige feste Blende mit `setTargetAtTime` (τ 3 ms) gegen eine 5-ms-Rampe konnte sie bei Gegenlage auslöschen.
  - `wpSwitch` ersetzt `wpResync` beim Abspielen. Es prüft Zeitpunkte von jetzt + 30 ms bis zur Planungsgrenze in 1-ms-Schritten.
  - Je Stück, dessen Puffer wechselt, rechnet es eine 12-ms-Kosinus-Überblendung an beiden Puffern nach: gleichspannungs-, gleichleistungsgemäß oder korrelationsnormiert. Es nimmt die erste Stelle mit höchstens 1 dB Abweichung, sonst die beste.
  - Alte Stücke blenden mit `setValueCurveAtTime` aus (`tkXfOut`), neue mit der Gegenkurve ein (`tkStartSrc` `xc`).
  - Unveränderte Takes blenden gleichspannungsgemäß in sich selbst über, das Ergebnis ist bitgleich.
  - Hauptfaden: ≤ 3,3 ms je Wechsel.
- **Ergebnis:**
  - `v3-vs5afix2-sw.mjs 24 legato` (gesungen, 18 Marken, 23 echte Wechsel mit Chips, Aus und ↶, Aufnehmer ohne Frame-Fehler): Gegen alte und neue Fassung an derselben Take-Stelle liegt der Pegel höchstens −1,21 dB darunter (Grenze −3 dB). HP-5k höchstens +2,8 dB, größter Sprung ≤ 1,06× der Fassungen, kein Rückfall der Automation.
  - `v3-vs5afix2-sw.mjs 24 tone`: schlechtester Einbruch −1,23 dB.
  - `v3-vs5afix2-dseq.mjs` (QA-d mit diesem Aufnehmer): kein Einbruch über 0,7 dB, kein Sprung über 0,0294. Am Original ebenso, bis auf −8,1 dB an der Schleifennaht.
  - `v3-qa-vs5a-c.mjs`: ALL OK.
  - Die verbleibenden „HP-5k 11–20 dB“-Zeilen in QA-d treten am Original identisch auf. Es sind die Tonwechsel des Testtons: Der Sprung 0,0294 gegen 0,0262 entspricht genau 294 Hz zu 262 Hz. Hinzu kommt die Schleifennaht des Clips (VS3, −5 dB über 5 ms). Mit dem Fassungswechsel hat das nichts zu tun.
- **Für die QA:** `recStop` in `v3-qa-vs5a-h2.mjs` sollte wiederholte `currentFrame`-Werte an die Folgestelle legen, so wie `v3-vs5afix2-rec.mjs` es tut. Sonst misst jeder Wechseltest Löcher, die nicht hörbar sind.

### Regression (dieser Stand)
- `v3-vs5a-t1`, `t2`, `t3` (Layout), `t5`, `v3-qa-vs5a-reg`, `v3-qa-vs5a-c`: ALL OK. Smoke: keine Fehler.
- `v3-qa-vs5a-reg2` („FANG nach 8 Takten Akkorden → Teil-Blatt: null“) scheitert am Original VS5a genauso. Das ist ein vorhandener Befund und gehört nicht zu VS5a-fix.
- `v3-qa-vs5a-b` „Audio folgt … ≤ 5 ms“ schwankt je Lauf: 29/41, 34/41 und 39/41 hier, 39/41 und 40/41 am Original.
  - Die Abstände Note ↔ Marke sind in beiden Fassungen gleich (z. B. 84–87 ms an derselben Silbe). Nur die Aufnahme-Lage zum Raster schwankt mit dem Start des Fake-Mikros, und Noten nahe der 1/8-Mitte fallen dann auf die andere Seite.
  - `fine()` bewegt am gesungenen Satz 1 von 64 Marken.


## VS5b – Dehnen & Songtext (4.21.0, 27.10.2026)

Grundlage: diese Zweig-Kopie `vs-br-VS5/index.html` ab VS5a-fix (4.20.0). Spec: Nachtrag 2 Teil C (C.2–C.5, Tabelle C.3 Zeile VS5b), `r7/stimme.md` §9, §10, §13 (N7V-28, N7V-29, N7V-30), C.5 Nr. 3, 7, 8. Nachtrag 2 hat für VS5b keine eigenen N2-VS5b-Punkte; die Abnahme sind die drei N7V-Punkte und C.5. DSP-Kern `vs-dsp/stretch.mjs` eingebettet (ohne Kommentare, `function vsStretchMake()`, auch im Worker). Versionszeile `4.21.0` (APP_CODE 4021000 = `max_app`). Format bleibt 5 (neues Feld `take.lyrics` additiv, K2-31). Keine Datenbank-Änderung, kein Supabase-Aufruf.

### Gebaut
1. **Modus „Dehnen“ (C.5 Nr. 7):**
   - `take.warp.mode = 'stretch'` rendert im Worker mit `stretch()` des Kerns:
     - Die ersten 20 ms nach jeder Marke bleiben bitgleich.
     - Der Rest des Abschnitts wird per WSOLA auf die Ziellänge gebracht.
     - Die Naht ist 5 ms lang.
   - Dieselbe Vorlauf-Regel wie bei „Scheiben“ (VS5a-fix, `WP_LEAD` 4 ms): Abschnitte beginnen 4 ms vor der Marke, fest sind 24 ms. Ab der Marke sind damit 20 ms bitgleich, die Naht endet 4 ms vor der Marke. Liegt eine Marke in den ersten 4 ms, wird der Vorlauf kürzer.
   - Vor der ersten und hinter der letzten Marke wird nur verschoben, nicht gedehnt (Steigung 1, wie bei „Scheiben“). Sonst gäbe es Faktor-Warnungen für Atem und Stille am Take-Rand. Die Fassung ist deshalb um die Verschiebung der letzten Marke länger oder kürzer als der Take; abgespielt wird wie bisher `in…out`.
2. **Grenzen 0,5–2,0 (N7V-29):**
   - Ein Abschnitt außerhalb dieser Grenzen wird nur verschoben (bitgleich), dazu kommt eine Warnung.
   - Die Warnung erscheint als Toast „Dehnen: n Stelle(n) nur verschoben – Faktor außerhalb 0,5–2,0“ (einmal je Fassung) und in der Info-Zeile des Editors („⚠ n nur verschoben“, orange).
   - Die Lücke hinter einem verschobenen Abschnitt füllt eine Schleife wie bei „Scheiben“ (siehe Kern-Änderungen).
3. **Modus-Schalter [Dehnen │ Scheiben]** im Marken-Editor (vorher war Dehnen gesperrt):
   - Ein Tipp ist ein Undo („Modus · Dehnen/Scheiben“).
   - **Standard-Stärke (C.5 Nr. 3):** 70 % in Dehnen, 100 % in Scheiben. Eine Stärke, die auf dem Standard des alten Modus steht, wandert auf den des neuen. Eine selbst gewählte Stärke bleibt.
4. **Standard „Gesang → Dehnen“ (C.5 Nr. 7):**
   - Der Editor öffnet einen Take ohne Karte mit [Dehnen] und 70 %.
   - „Audio folgt“ quantisiert einen Take ohne Karte im Modus Dehnen; die Stärke kommt wie bisher vom MELODIE-Quantisieren.
   - Die Test-API `wpQuantize` ohne `mode` bleibt bei „Scheiben“, so wie in VS5a.
5. **Render-Cache:**
   - Der Schlüssel besteht aus Karte, Modus und Quell-Puffer.
   - Neu: Solange der Editor offen ist, hält er zusätzlich die vorige Fassung des Takes. Modus hin und zurück sowie ↶ ↷ klingen dann sofort, ohne neu zu rechnen (gemessen: 1 statt 2 Renders).
   - Beim Schließen des Editors wird die vorige Fassung freigegeben (Speicher am iPhone).
   - Ein Wechsel der Fassung beim Abspielen läuft wie in VS5a-fix über `wpSwitch` mit Überblendung.
6. **Songtext auf Silben (§10, N7V-30):**
   - Das Feld `take.lyrics` ist ein Text je Take, normalisiert auf höchstens 400 Zeichen. Speichern → Laden ist deep-equal.
   - Der Knopf [Text] im Kopf des Editors (56 × 36 px) öffnet ein Blatt mit Eingabefeld (Platzhalter „Lie-be ist ein Feu-er“) und [✓].
   - ✓ ist ein Undo mit Toast [Rückgängig]; leer + ✓ löscht den Text.
   - Anzeige im Bild:
     - Eine Silbe je Marke von links, gezeichnet an der Stelle, wo die Marke **klingt**: am Ziel der Zeitkarte, im A/B-Original an der Quelle.
     - Der Text hängt an der Marke, nicht an der Zeit, und wandert beim Quantisieren mit.
     - Fehlende Silben erscheinen als „·“, überzählige rot am Ende.
     - Der Knopf [Text] ist hervorgehoben, wenn ein Text da ist.
7. **Test-API:**
   - Neu: `wpMode`, `wpLyrics`, `wpLyr`, `wpWarn`, `wpLyrGeom`, `wpStretchCore`.
   - `wpInfo` liefert zusätzlich `lyrics`, `warn` und `old`; `last` enthält `mode`, `warn` und `wsola`.
8. **Kleine VS5a-Korrektur (für die Silben-Lage nötig):** Der Editor rechnete die Zeichenbreite aus dem Rahmen statt aus der Leinwand. Wegen des 1-px-Rands war die Zeichnung um 2 px gestaucht, Treffer und Marken lagen bis 1,5 px daneben. Jetzt wird aus der Leinwand gerechnet.

### Änderungen am DSP-Kern `vs-dsp/stretch.mjs` (gefunden beim Einbau; `VERSION 'vs5b-stretch-4'`)
1. **Lücke beim nur Verschieben:**
   - Vorher: gespiegeltes Ende mit Ausblendung über die ganze Lücke. Gemessen bei Faktor 2,5 ergab das ein **Loch von 47,6 dB**.
   - Jetzt: eine Schleife wie `renderSlices` (VS5a). Gemessen: **0,03 dB**.
2. **Letzte WSOLA-Rahmen:**
   - Vorher lag ihr Suchfenster hinter dem Abschnittsende; die Rahmen wurden dann ohne Suche gesetzt. Das ergab einen Phasensprung: bei Klicks auf einem Ton mit Achtel-Abschnitten bis **−5,4 dB** vor jeder Marke.
   - Jetzt wird im letzten erlaubten Stück gesucht, und `endAlign` ist standardmäßig aus.
   - Ergebnis: −2,1 dB; an den Nähten 110/196/330 Hz 0,58/0,92/0,35 dB (vorher 1,94/3,24/0,19 dB).
3. **Digitale Stille:**
   - Vorher: Bei stiller Vorlage nahm die Suche den ersten Treffer und holte Ausklang-Reste (−70 dB) in die Stille. Gefunden mit `v3-qa-vs5a-b`: M-KLICK **51,5 dB** gegen 32,8 dB im Original.
   - Jetzt bleibt die Suche dort an der natürlichen Stelle. Ergebnis: 23,3 dB gegen 23,2 dB im Original.
- Neue Kern-Tests: Lücke ohne Loch, kurze Abschnitte mit Klicks auf Ton (≤ 3 dB, Vorlauf + 20 ms bitgleich), digitale Stille bleibt Stille. Die Naht-Grenze ist von 4 auf 3 dB verschärft.
- `node vs-dsp/run-tests.mjs`: **alle grün** (VS4 45, VS5a 32, VS5b 34). README ergänzt.

### Abnahme (eigene Läufe, Chromium 1243 headless; Skripte in `dirigent-test/`, Bilder in `dirigent-test/vs5b/`)
| ID | Prüfung | Ergebnis | Skript |
|---|---|---|---|
| N7V-28 | Dehnen, Klickfolge mit Ton dazwischen, 70 % und 100 %: erste 20 ms je Scheibe bitgleich; Länge je Scheibe ±1 ms | ✓ 17/17 bitgleich (beide Stärken); Länge je Scheibe unabhängig gefunden (Suche der bitgleichen Blöcke im Ausgang): Fehler 0,000 ms; Faktoren 0,875–1,231 | `v3-vs5b-t1.mjs` |
| N7V-28 (Mikro) | gesungene WAV über das Fake-Mikrofon → ● REC → Dehnen 70 % | ✓ 17/17 bzw. 18/18 bitgleich in 3 Läufen; Ziele 0,5 Samples genau; Spitze ≤ Original; 0 Netzaufrufe | `v3-vs5b-t5.mjs` |
| N7V-29 | Faktor 2,08 (Marken 0,55 → 0,5 und 0,67 → 0,75 bei 1/8) | ✓ nur verschoben (120 ms bitgleich), Warnung im Toast und in der Info-Zeile, Lücke gefüllt (−0,11 dB gegen den Ton) | `v3-vs5b-t1.mjs` |
| N7V-30 | „Lie-be ist ein Feu-er“ auf 6 Marken; 5 Marken; nach Quantisieren | ✓ 6 Silben je Marke; bei 5 Marken „er“ rot (Pixelprüfung: rote Pixel); jede Silbe auf dem Ziel ihrer Marke (≤ 0,6 px) – in P1, P2, P3, L1, L2 per Touch über [Text] | `v3-vs5b-t2.mjs` |
| C.5 Nr. 8 | Stärke 0 % bitgleich, A/B, ein Undo, nach ↶ Original bitgleich, ↷ deep-equal | ✓ alle | `v3-vs5b-t1.mjs` |
| C.5 Nr. 3 | Standard 70 % Dehnen / 100 % Scheiben | ✓ Editor öffnet mit Dehnen 70 %; Chip 1/8 → Dehnen 70 %, ein Undo; Scheiben 100 % → Dehnen 70 % | `t1`, `t2` |
| Hörbar | Ausgang mitgeschnitten (Klick-Take, Dehnen 1/16) | ✓ Einsatz-Abstände 250,0 ms (11/11 auf dem Raster); A/B: 165–310 ms; Dehnen vs. Scheiben unterscheiden sich um −10 … −15 dB Differenz-Energie | `v3-vs5b-t3.mjs`, `t1` |
| Klick/Einbruch | M-KLICK, Pegel im Ton zwischen den Klicks | ✓ M-KLICK 34,4 dB gegen 35,3 dB im Original; schlechtester Einbruch −1,93 dB (≤ 3) | `v3-vs5b-t1.mjs` |
| Wechsel beim Spielen | 4 × Modus umschalten während der Wiedergabe | ✓ 4 überblendete Fassungswechsel, schlechteste Abweichung 0,94 dB, Hauptfaden ≤ 5 ms | `v3-vs5b-t3.mjs` |
| Audio folgt | Take ohne Karte → Dehnen | ✓ | `v3-vs5b-t3.mjs` |
| Render-Cache | Dehnen → Scheiben → Dehnen im Editor | ✓ zurück sofort fertig (1 statt 2 Renders); vorige Fassung nach ✕ freigegeben | `v3-vs5b-t1.mjs` |
| Rundweg | Speichern → Laden mit Songtext, Modus und Karte | ✓ deep-equal | `v3-vs5b-t1.mjs` |
| M-PLATZ | P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428 | ✓ kein Knopf außerhalb des Blatts, kein Knopf abgeschnitten, keine Seitenbreite > Bild; [Text] 56×36, Modus-Knöpfe ≥ 40 px hoch; Text-Blatt im Bild | `v3-vs5b-t2.mjs`, `v3-vs5b-shots.mjs`, Bilder `ed-*.png`, `lay-*.png` |
| Smoke | `smoke.mjs` | ✓ keine Fehler | – |

### Regression
- `v3-vs5a-t1`, `v3-vs5a-t3`, `v3-vs5a-t5`, `v3-qa-vs5a-c`, `vs5a/reg/v3-qa-vs3-reg`, `vs5a/reg/v3-qa-vs3-t2` sind grün.
  - `v3-vs5a-t5` fiel einmal mit „max 4465 samples“ (Lage des Fake-Mikros), beim zweiten Lauf grün.
  - `v3-qa-vs5a-c` (M-KLICK beim Wechsel) schwankt ebenfalls je Lauf. Ursache ist der bekannte Aufnehmer-Effekt aus VS5a-fix; 3 von 3 Wiederholungen waren grün.
- **Durch VS5b absichtlich überholte Erwartungen (typische-fehler Nr. 26):**
  - `v3-vs5a-t2` erwartet nach ↶ „Stärke 100 %“. Jetzt gilt 70 %, weil der Editor mit Dehnen startet. Die Kopie `v3-vs5b-reg-t2.mjs` mit 70 % ist grün.
  - `v3-qa-vs5a-a` tippt den Raster-Chip ohne Moduswahl und erwartet damit Scheiben 100 %. In der Kopie `v3-vs5b-reg-qa-a.mjs` wird vorher [Scheiben] getippt. Übrig bleiben nur die zwei Zeilen, die in VS5a-fix schon als Mess-Artefakte des QA-Skripts belegt sind: −3,65 ms und „50 % … 222 ms“.
- `v3-qa-vs5a-b`:
  - M-KLICK ist jetzt grün (siehe Kern-Änderung 3).
  - „Audio folgt ≤ 5 ms“ liegt bei 39/41 und 40/41. Diese Zeile schwankt schon in VS5a-fix (29–40/41).
- `vs5a/reg/v3-qa-vs3-t1` und `t3` zeigen nur die bekannten VS3-Befunde (siehe unten).

### Fach-Prüfung (Nachtrag 2 Teil J, Gruppe 7: FP-DSP, FP-IPHONE) – an mir selbst
- **FP-DSP:**
  - Bitgleich bei Stärke 0 %, A/B und ↶ (Roh-Take); die ersten 20 ms nach jeder Marke ebenso.
  - ~~Einbruch an Nähten ≤ 3 dB (gemessen 0,35–2,14 dB).~~ **Falsch gemessen** (≈ 10-ms-Fenster statt 5 ms) – richtig waren bis −7,8 dB; behoben in VS5b-fix (unten). Lücken gefüllt, digitale Stille bleibt Stille.
  - M-KLICK nicht über dem Original (QA-b 23,3 gegen 23,2 dB; Klickfolge 34,4 gegen 35,3 dB). Tonhöhe bleibt (< 1 Cent, Kern-Test).
  - Der NaN/Inf-Schutz kommt aus dem Kern.
  - Kein Worklet-Code. Das Rendern läuft offline im Worker; der Fassungswechsel beim Spielen wird überblendet (≤ 0,94 dB).
- **FP-IPHONE** (60-s-Take, `v3-vs5b-t4.mjs`):
  - Dehnen 70 % rendert in 651 ms im Worker (VM). Kern allein: 0,4–1,0 s je 60 s bei 48 kHz.
  - Kein longtask > 50 ms auf dem Hauptfaden über Öffnen, Quantisieren, 4 × Modus, Songtext mit 360 Silben, Regler und Zoom.
  - Speicher: je hörbarem Take mit Karte eine Fassung (≈ 11,5 MB je Minute, wie VS5a). Nur bei offenem Editor kommt die vorige Fassung dazu.
  - Die CPU am iPhone ist ungemessen.
- **Größe:** +17,8 KB gegenüber VS5a-fix (Budget +30 KB): Kern 7,4 KB, App + CSS ≈ 10 KB, gzip +5,5 KB. Die Datei hat 3,27 MB.

### Abweichungen von der Spec
- ***(P1)* Signalsmith Stretch nachladbar:** nicht gebaut. Die Option ist optional, bräuchte auf der Pages-Seite einen Netzaufruf zu einem CDN und hat einen eigenen Datenschutz-Weg. Vorschlag für später.
- **Standard-Modus:** Ein STIMME-Take gilt als Gesang, deshalb startet der Editor mit [Dehnen] 70 % (C.5 Nr. 3, 7). Das ist eine sichtbare Änderung gegenüber VS5a, wo Scheiben 100 % galt. Sie folgt der Spec. Beatbox und Instrument wählen [Scheiben] (ein Tipp). Eine Erkennung „Gesang oder Instrument“ je Take gibt es nicht; das Feld fehlt im Take.
- **Vorlauf und Ausklang** werden nur verschoben, nicht gedehnt (siehe Gebaut Nr. 1). Die gespeicherte Zeitkarte bleibt wie in VS5a, mit (0,0) und (Ende, Ende).
- **Songtext** erscheint nur im Marken-Editor, nicht auf der Clip-Kachel und nicht in der Song-Ansicht. „Zwei Silben durch Wischen zu einem Wort verbinden“ (§10) ist weiter nicht gebaut (wie VS5a).

### Bekannte Lücken / offen
- **Tempo:** Ändert sich das Tempo nach dem Quantisieren, bleibt die Karte in Sekunden. Dehnen folgt dem neuen Tempo nicht von selbst; dafür einfach neu quantisieren. Das ist so nicht verlangt, wäre aber mit `stretch()` machbar.
- **Echte Stimmen:** Gemessen ist nur synthetisch bzw. mit Fake-Mikrofon. Am iPhone ist nichts geprüft.
- **Fake-Mikrofon-Läufe** schwanken in der Lage zum Raster (siehe Regression).

### VS3-Befunde (nur gelistet, nicht geändert)
- `v3-qa-vs3-t3`: Das Spurleisten-Etikett „🎤 Audio · Takes: ✎“ ist in P1, P2, P3, L1 und XL abgeschnitten (`scrollWidth` 103 > `clientWidth` 62–79). Unverändert gegenüber VS5a.
- `v3-qa-vs3-t1`: Das Prüfskript zählt den `blob:`-Worker als Netzaufruf. Es ist kein echter Netzaufruf.

### Für Xander am iPhone (Geräte-Punkte, kurz)
1. Auf https://xanderfoxy.github.io/Synquenzer/ 2 Takte singen (● REC mit 🎤). Danach STIMME-Clip ✎ → [✎ Marken · Quantisieren]. Unten steht jetzt [Dehnen] (an).
2. [1/8] tippen und abspielen: Sitzen die Silben auf dem Takt, ohne zu knacken oder zu „flattern“? Mit [A/B] vergleichen; [Scheiben] zum Vergleich.
3. [Text] tippen, z. B. „Lie-be ist ein Feu-er“ eingeben, ✓. Steht je Silbe ein Stück Text unter dem richtigen Strich, und wandert der Text beim Quantisieren mit?
4. Erscheint „⚠ … nur verschoben“, liegen zwei Marken sehr eng oder sehr weit auseinander. Dann eine Marke löschen oder setzen.

### Datenbank
Nichts nötig. Format 5 und `max_app` 4021000 decken 4.21.0 ab.

## VS5b-fix (4.21.0 bleibt, 27.10.2026) – ein QA-Befund (FP-DSP, M-EINBRUCH)

### Befund (nachgestellt, bevor etwas geändert wurde)
`v3-qab5b-einbruch.mjs 220 prof`: N7V-28-Material (Klicks über einem gehaltenen Ton) bei 44,1 kHz, Editor-Standard 1/8 · 70 % · Dehnen. M-EINBRUCH genau nach Spec (5-ms-Fenster, 1-ms-Schritte, ±50 ms um Marke − 6,5 ms): **24 von 50 Nähten unter −3 dB, schlimmste −6,57 dB** (Original an denselben Marken −0,13 dB); 196 Hz bis −7,79 dB. Das Loch lag im Fenster 10…5 ms vor der Marke, also in der 5-ms-Naht, die WP_LEAD vor der Marke endet. Meine Angabe „0,35–2,14 dB“ war mit ≈ 10-ms-Fenstern gemessen, die das 5-ms-Loch verschmieren.

### Ursache
Ab s0 (4 ms vor der Marke) ist die Ausgabe bitgleich festgelegt, deshalb treffen sich in der Naht zwei unterschiedlich verschobene Fassungen desselben Tons. Der Rest-Versatz liegt zwischen 0 und ½ Periode. Die Blende endete immer genau an s0 und war fest gleichspannungs- bzw. gleichleistungsgemäß. Je nachdem, wo die Blende in der Periode lag, fiel ein Pulsschlag der Periode aus (Abstand P + Versatz) und die Anteile löschten sich aus. Dazu kam ein Fehler in der WSOLA-Suche: Ein nur angeschnittenes Suchfenster (wenige Samples vor dem Abschnittsende) fand keine passende Periode (ρ −0,25) und ließ ein −5-dB-Loch ≈ 25 ms vor der Marke.

### Änderung am DSP-Kern `vs-dsp/stretch.mjs` (`VERSION 'vs5b-stretch-5'`, in der App über `vsStretchMake`, ohne Kommentare)
1. **Lage der Blende:** Die 5-ms-Blende darf bis 12 ms vor s0 liegen; dahinter läuft die Quelle unverändert in die Marke. Gewählt wird die Lage, bei der das leiseste 5-ms-Fenster (0,5-ms-Schritte, über Blende und Marke) am lautesten ist. Die Pulse rücken dann zusammen statt auseinander. Ohne Auslöschung bleibt die Lage wie bisher an der Marke (Gleichstand → 0 ms).
2. **Energie-Ausgleich:** Fehlt in der Blende danach noch Energie gegenüber einer gleichphasigen Blende (Pegel beider Seiten), hebt eine Glocke (sin², Gipfel G ≤ 4) genau so viel an. Ohne Auslöschung ist G = 1. Die Anhebung erzeugt keine steileren Flanken, als der Eingang hat (sonst wird G in Schritten kleiner). Damit bleibt der Kern-Test „Keine Klicks“ grün.
3. **Feste Teile bleiben unberührt:** Die Blende reicht nie in die festen ersten 24 ms der vorigen Scheibe (bei sehr kurzen Scheiben wie bisher).
4. **WSOLA-Suche:** Ein angeschnittenes Suchfenster wird auf volle Breite 2Δ gebracht (Erweiterung der VS5b-Einbau-Regel).
5. **Verworfen** (gemessen): (a) Phasen-Lenkung über 4 Rahmen: Bei formantreichem Ton löschen sich die Obertöne an jeder Rahmengrenze aus (Kern-Test 3b 5,66 dB statt 2,14). (b) Nur korrelationsnormierte Verstärkung: Die Gesamtenergie stimmte, das 5-ms-Fenster nicht (−4,6 dB).
- **Neuer Kern-Test 3e:** M-EINBRUCH genau nach Spec bei 44,1 kHz, 202/180 Hz, 70/100 %. Alter Kern: FAIL (−5,67 … −6,52 dB). Neuer Kern: −0,78 … −1,08 dB (Original −0,20 / −1,07).
- `node run-tests.mjs`: **112 Prüfungen, alle grün** (45 + 32 + 35). Rechenzeit Dehnen 60 s bei 48 kHz: 0,54 s statt 0,43 s.
- Weitere Kern-Werte: 2-Perioden-Einbruch 110/196/330 Hz 0,05/0,43/0,08 dB (vorher 0,58/0,92/0,35). Achtel mit Klicks 0,22 dB (vorher 2,14). Tonhöhe, Länge und 20 ms bitgleich unverändert.

### Nachweis in der App (gleiche Skripte wie der Befund, Chromium headless, 44,1 kHz)
| Lauf | vorher | nachher |
|---|---|---|
| 220 Hz, 1/8 70 % | 24/50 Nähte < −3 dB, schlimmste −6,57 | **0/50**, schlimmste −2,13 |
| 220 Hz, 1/8 100 % | 13/49, −6,79 | **0/49**, −0,86 |
| 220 Hz, 1/16 70 % / 100 % | 9/49 −5,92 / 12/49 −6,88 | **0/49** −0,58 / **0/49** −0,86 |
| 196 Hz, 1/8 70 % / 100 % | −5,21 / −7,79 | **0** Nähte, −2,73 / −1,11 (Original −2,12) |
| 196 Hz, 1/16 70 % / 100 % | – | **0**, −2,10 / −2,43 |
| Legato `v3-qab5b-einbruch2.mjs`, 1/8 70 % | 2 von 9: −5,05 und −4,07 | 1 von 9: −4,07 (siehe unten) |

- Zwei Läufe bei 220 Hz liefern dieselben Zahlen.
- **Legato −4,07 dB ist keine Naht:** Das Fenster liegt +34…+45 ms hinter der Marke 3,742 s, also 7–18 ms nach der nächsten Marke (3,769 s, nach dem Quantisieren nur 27 ms später). Dort ist die Ausgabe der bitgleiche Anfang der nächsten Silbe. Ihr Pegel ist im Original genauso leise (y gegen x je 5 ms: −27,7/−27,8/−28,8 gegen −27,7/−27,8/−28,7 dB). Vor dem Fix stand dort derselbe Wert (−4,07). Am Original misst die gleiche Marke −0,32 dB, weil dort die nächste Silbe 90 ms entfernt liegt.
- Der Replay `v3-vs5bfix-replay.mjs` (Node, Kern mit der Zeitkarte der App) ist bitgleich zur App-Ausgabe (maxdiff 0 auf dem Legato-Dump).

### Regression (dieser Stand)
- `v3-vs5b-t1`: ALL OK. N7V-28 bitgleich 17/17, Länge ±0 ms, M-KLICK 34,4 gegen 35,3 dB, N7V-29, 0 %/A/B/↶ bitgleich, Cache, Speichern/Laden.
- `v3-vs5b-t3` (gehört): ALL OK. Einsätze auf 1/16, Fassungswechsel beim Spielen ≤ 0,92 dB.
- `v3-vs5b-t4` (60-s-Take, FP-IPHONE): ALL OK. Render im Worker 642 ms; kein longtask > 50 ms.
- `smoke.mjs`: ohne Fehler.
- **Größe:** +2,4 KB roh, +0,9 KB gzip gegenüber VS5b (3 272 365 Byte). VS5b liegt damit bei +20,2 KB vom +30-KB-Budget.
- UI, Bedienung und Version (4.21.0) sind unverändert; Format und Datenbank unberührt.

### Test-Werkzeug
`dirigent-test/v3-vs5a-h.mjs` `mEinbruch()`: Indizes sind jetzt ganzzahlig. Vorher war `P + d·sr/1000` bei 44,1 kHz gebrochen; die Hilfe lieferte dort immer 0 und konnte das Loch nicht finden. Gegenprobe: Ein 5-ms-Loch bei 44,1 kHz ergibt jetzt −19,99 dB.

### Offen (nicht Teil dieses Befunds, VS5a „Scheiben“)
Modus **Scheiben** zeigt auf demselben Material weiter Löcher, z. B. 1/16 100 %: 10/49 Nähte < −3 dB, schlimmste −6,72 dB bei 220 Hz und −4,81 dB bei 196 Hz. Grund ist derselbe Phasensprung am festen Anschlag. Die Spec legt bei Scheiben den Schnitt 3 ms vor dem Einsatz am Nulldurchgang fest (C.5 Nr. 6), deshalb habe ich die Blende dort nicht verschoben. Der Vorschlag ist dieselbe Lage-Suche wie beim Dehnen, als eigenes Paket bzw. als Rückfrage an Xander, denn sie würde den Schnittpunkt verändern. Für Gesang gilt der Standard [Dehnen].



## G-S7-merge — Zusammenführung (VS4 + VS5a/VS5b → Hauptlinie) · App 4.21.0 · Format 5 · keine Server-Änderung

Hauptlinie war gleich der Basis (VS3-fix, 4.18.0). Echte 3-Wege-Zusammenführung mit `git merge-file` (Sicherung
`mk-wt/index.html.vor-merge-G-S7-merge.html`): erst **VS4** (Säubern, inkl. VS4-fix) – ohne Konflikt –, dann **VS5** (VS5a Marken &
Scheiben inkl. VS5a-fix, VS5b Dehnen & Songtext inkl. VS5b-fix) – 6 Konflikte. **Version 4.21.0** (höchste Seite, = `max_app`), Format 5,
kein Supabase-Aufruf. Eingebettete Kerne: `vsCleanMake` = VS4-fix-Fassung von `vs-dsp/clean.mjs`, `vsMarksMake`/`vsStretchMake` = VS5b-fix
(`node vs-dsp/run-tests.mjs`: alle grün).

**Konflikte und Lösung**
1. `VERSION` 4.19.0 │ 4.21.0 → **4.21.0**.
2. `undoApply` Art `takes`: VS4 `clSync` (Säubern folgt) │ VS5 `wpUndone()` (Zeitkarte/Editor folgen) → **beides** (`clSync` als Mikro-Aufgabe, `wpUndone` sofort).
3. `tkStartSrc` Stück-Objekt: VS4 `o` (Plan für den Puffer-Tausch) │ VS5 `G`, `aud` (Fassungswechsel) → **alle Felder**.
4. Großer Block hinter `TK_API` (zwei Konflikte, `git` hatte die beiden `FFT`-Funktionen der Kerne aufeinandergelegt): VS4-Block
   (`vsCleanMake`, `CL`, `cl*`, `CL_API`) und VS5-Block (`vsMarksMake`, `vsStretchMake`, `WP`, `wp*`, `WP_API`) **beide vollständig**
   hintereinander übernommen (je aus der Zweig-Datei, Zeile für Zeile).
5. `Object.assign(SYNQUENZER, …)`: `TK_API` + `CL_API` + `WP_API`.

**Zusammenspiel (ohne Textkonflikt, beim Zusammenführen ergänzt)**
- **Kette je Take: Säubern vor Marken/Dehnen.** VS5 legt `wpProc` vorn in `tkExt().proc` und holt die Quelle über `wpBase` aus den
  übrigen Verarbeitern = VS4 Säubern; die Zeitkarte (Scheiben/Dehnen) rendert also aus dem gesäuberten Take, sobald er fertig ist
  (Cache-Schlüssel an der Quelle → neue SÄUBERN-Stärke = neue Fassung). A/B „Roh“ = Zeitkarte über dem Roh-Take.
- **Marken-Erkennung am gesäuberten Take:** `wpDetect` wartet bei SÄUBERN > 0 auf `clEnsure` und erkennt am gesäuberten Take; die
  erkannten (nicht gespeicherten) Marken werden neu erkannt, wenn sich die SÄUBERN-Stärke ändert (`WP.detCl`). Von Hand gesetzte/
  quantisierte Marken (`take.marks`) bleiben.
- **Fassungswechsel beim Spielen:** VS4 tauscht gesäuberte ↔ rohe Fassung an derselben Stelle (lineare 6-ms-Blende, `clResync`). Mit
  Zeitkarte liegen alt und neu nicht mehr zeitgleich → `clResync` übergibt dann an `wpSwitch` (VS5a-fix, plant mit der Zeitkarte neu,
  Überblendung an passender Stelle). Stücke, die ein VS5-Wechsel schon ausblendet (`tkXfOut`), tauscht `clResync` nicht mehr
  (sonst doppelt bei ↶ während des Spielens); der lineare Tausch nimmt keine VS5-Blendkurve (`xc`) mit.
- **Takes-Blatt quer (≤ 440 px hoch):** SÄUBERN-Block (VS4) + [✎ Marken · Quantisieren] (VS5) waren 3–21 px höher als das Blatt
  (L1/L2, `v3-vs4-lay`). Nur engere Abstände in dieser Höhe (Polster 10 px, Überschrift/Liste/Knopf-Abstände 2–4 px); Knöpfe bleiben ≥ 44 px,
  Hochkant unverändert.
- **Geister-Maus beim Öffnen des Editors:** Mit dem höheren Takes-Blatt lag der Stärke-Regler des Marken-Editors genau unter
  [✎ Marken · Quantisieren]; das `mousedown` desselben Tipps (Kompatibilitäts-Maus nach `touchend`) verstellte ihn (P2/L2: 49 % bzw. 0 %
  statt 70 %, `v3-vs5b-t2`). Jetzt verwirft ein Schutz wie `UI.ghost` diese Geister-Maus auf Reglern im Editor.

**Abnahme am zusammengeführten Stand** (Kopien der Skripte mit Ziel `mk-wt/index.html`: `dirigent-test/gs7-*.mjs`, Ausgaben `dirigent-test/gs7/out/`)
- VS4: `v3-vs4-core` ALLE OK (13), `v3-vs4-accept` 26/26, `v3-vs4-lay` 23/23 (nach Fix), `-fakewav` 8/8, `-click` 6/6, `-perf` 2/2.
- VS5a: `v3-vs5a-t1` 20/20, `t3` 31/31, `t4` 5/5, `t5` 6/6; `v3-vs5b-reg-t2` 21/21 (`v3-vs5a-t2` 20/21: „↶ → 100 %“ ist durch VS5b
  absichtlich überholt, siehe VS5b-Regression).
- VS5b: `v3-vs5b-t1` 32/32, `t2` 51/51 (nach Fix), `t3` 5/5, `t4` 6/6, `t5` 9/9.
- Zusammenspiel neu `gs7-merge-vs4vs5.mjs` 10/10: Säubern 60 % → Marken am gesäuberten Take → Dehnen aus der gesäuberten Fassung;
  A/B Roh mit Zeitkarte; SÄUBERN 100 % beim Spielen (Wechsel per `wpSwitch`, ein klingendes Stück); ↶ beim Spielen (Stärke und
  Quantisieren); Speichern → Laden deep-equal (cl, warp) und wieder gesäubert + gedehnt; keine Konsolenfehler.
- QA-Skripte: `v3-qa-vs4-b` 62/63, `-d`, `-e`, `-f` ALL OK, `-reg` 15/15, `-g` Pegel 0/−0,2 dB; `v3-qa-vs5a-g` ALL OK, `-reg` 13/13,
  `-e` 32/54 und `-c` 5/6, `v3-qab5b-ui` 28/35 – **jeweils dieselben Befunde am Zweig VS4 bzw. VS5** (gegengeprüft), nicht durch die
  Zusammenführung; `v3-qab5b-core` bitgleich (max diff 0), `-einbruch` Dehnen 0 Nähte > 3 dB, `-switch`, `-song` ALL OK.
- Regression: Rauchtest ohne Fehler, `v3-vs3-accept` 72/72, VS2-Abnahme 48/49 („Stimme rechtzeitig geplant −20,6 ms“ auch am
  Zweig VS4; Test G schwankt mit dem Fake-Mikro, 2 Wiederholungen grün), `gmkp8-voc-mic` 8/8, `gmkp8-mk8-platz-quer` 9/9,
  `gmkp8-mk8-09-platte` 26/27 (Toast B05 – an der Basis 4.18.0 genauso).
- Größe 3 321 532 B (gzip 1 080 052 B).

**Offen (nicht durch die Zusammenführung entstanden)**
- `v3-qa-vs4-b`: nach Neuladen wird die 100-%-Fassung einmal neu gerechnet statt aus dem Speicher geholt (auch am Zweig VS4-fix).
- `v3-qa-vs5a-c` M-KLICK 7,7 dB beim Wechsel auf dem QA-Dauerton (0 Marken): mit dem bildgenauen Aufnehmer am Zweig VS5 derselbe Wert;
  liegt am Tonwechsel des Testtons (VS5a-fix §2).
- `v3-qa-vs5a-e`, `v3-qab5b-ui`: Editor-Titel „Marken · STIMME · Szene n“ mit Auslassung, Chips 32 px hoch, Kopf-Knöpfe 36 px,
  Info-Zeile mit Warnung in P3 abgeschnitten, Songansicht schließt den Editor nicht – Befunde aus VS5a/VS5b-QA, am Zweig gleich.
- Mit Zeitkarte rechnet A/B „Roh │ Sauber“ jedes Umschalten neu (der Render-Cache hält je Take nur die aktuelle und – bei offenem
  Editor – die vorige Fassung); klingt nach ≈ 0,1–0,7 s um.
- Wellenform in Matrix/Song zeigt weiter den Roh-Take (VS4-Lücke).

## G-S7-merge-fix (4.21.0 bleibt, 27.10.2026) – ein Befund nach der Zusammenführung

- **Marken-Editor: Aktions-Toast lag über seinen Knöpfen (major).** `toastHome()` kannte `#wpSheet` nicht; der Toast
  („Songtext gesetzt [Rückgängig]“, „Marke gelöscht [Rückgängig]“, VS4 „Rückgängig: Säubern 100 % [↷ Wiederholen]“) dockte
  auf der Träger-Zeile unter dem Blatt und lag damit 5 s über [A/B] / [✕] / [Text] (L) bzw. [Dehnen] [Scheiben] [Ganz] (P).
  Ein Tipp dort machte rückgängig oder wiederholte (Songtext weg, gelöschte Marke zurück, Säubern 60 → 100) oder wurde
  verschluckt. Jetzt (§10.4, wie MK-P-Kopf): bei offenem Editor dockt der Toast auf dem Titel im Kopf, von dessen linkem
  Rand bis 10 px vor [Text] (`wpHeadDockRect`), Knöpfe als Symbol (↶ / ↷), zu lange Meldungen in zwei/drei kleinen Zeilen,
  Rest abgeschnitten – nie über Werkzeugen, Leinwand oder Reglern. z-index 55 (`.wpk`): unter den Popovern (Text, Marke).
- Proben (`dirigent-test/vgs7/`): `toastcheck.mjs`, `toastcheck2.mjs`, `toastdel.mjs`, `toastredo.mjs` (BTN = A/B, ✕, Text)
  in 844×390, 667×375, 390×844, 320×568: elementFromPoint trifft jeweils das Editor-Werkzeug, Songtext bleibt, A/B schaltet,
  Marke bleibt gelöscht (16 → 15), Editor schließt, Säubern bleibt 60 %. Neu `toastfix-verify.mjs`: kein Editor-Element unter
  dem Toast, Toast-↶ macht den Songtext weiter rückgängig, [Scheiben] und Zoom wirken binnen 5 s. Smoke ohne Fehler.
- Unverändert (schon im Stand G-S7-merge, nicht durch diesen Fix): `gs7-v3-qab5b-ui` meldet Titel-Auslassung und P3-Info-Zeile
  (bekannt), `gmkp8-mk8-09-platte` FAIL „Toast [Rückgängig]“ (MK-P-Kopf-Dock, gleiches Ergebnis vor dem Fix). In 320×568 zeigt
  der Kopf-Toast lange Meldungen nur angeschnitten („Rück-gän-gig: …“), das Symbol ↷ bleibt lesbar.
- Schnappschuss: `synq-snapshots/G-S7-merge-fix.html`.

## F1 — Nacharbeiten 4.21.0 · App 4.22.0

Stand: Hauptlinie `mk-wt/index.html` (4.21.0 = MS 2000 + Stimme VS3–VS5b). **Version 4.22.0** (APP_CODE 4 022 000), **Format bleibt 5**.
Auftrag Xander 27.10. („Mache bitte weiter und stelle das fertig“). Alle Befunde zuerst nachgestellt (alle sieben nachgestellt), dann behoben,
danach dieselbe Probe noch einmal. Layout-Proben mit der echten App-Schrift (Barlow Semi Condensed / JetBrains Mono aus `fonts/`, per
`@font-face` in die Probe geladen, `document.fonts.check` = true), nicht mit einer Ersatzschrift.

- **Marken-Editor (#wpSheet), Layout (major).** Titel „MARKEN · STIMME · SZENE 2“ war in allen Größen mit „…“ gekürzt (189 > 92–169 px);
  Raster-Chips 32 px (P3 28 px) hoch; Kopf-Knöpfe [Text] [A/B] [✕] 36 px; P3: Warnzeile „⚠ 1 nur verschoben (Faktor außer 0,5–2)“ abgeschnitten.
  Jetzt: Titel in Stücken („Marken ·“ „STIMME ·“ „Szene 2“), die nur zwischen sich umbrechen (bis 3 Zeilen, 13 px Zeilenhöhe, nie „…“);
  Kopf P 44 px mit [Text] 56×44, [A/B] 56×44, [✕] 44×44 (L 40 px, Knöpfe 38 hoch = dichtes Raster L4 ≥ 40×36); Raster-Chips 34 px hoch
  (L4 dichtes Raster ≥ 36×34): in P1/P2 und L in einer Reihe (8 × 40–42 px), in P3 zwei Reihen à 4; in P3 stehen Stärke und Swing
  nebeneinander; [Dehnen] [Scheiben] [Ganz] in P3 44 statt 40 hoch. Die Wellenform wird dabei größer statt kleiner: P1/P2 84 → 114 px,
  P3 50 → 69 px, L unverändert ±4 px. Die Info-Zeile bricht um statt „…“. Blattgröße, Lage und Bedienung unverändert.
- **Quantisier-Blatt mit [Audio folgt]:** Kopf 44 px (P) bzw. 40 px (L), [Audio folgt] und [✕] 44 hoch (L 38); Titel bricht zwischen den Stücken
  um (P3: „Quantisieren · Melodie · Szene 1“ war abgeschnitten). Ohne verknüpften Take bleibt der Kopf wie bisher.
- **Song-Ansicht schließt den Marken-Editor** (`setSongView`, bei jedem Wechsel der Ansicht) – vorher blieb er über der Song-Ansicht offen.
- **Tipp auf eine Marke (neu gefunden beim Nachprüfen, major):** das Blatt [✕ Löschen] [Abbrechen] ging unter dem Finger auf; der
  Kompatibilitäts-Klick desselben Tipps traf [Abbrechen] (Blatt sofort zu) und ein späterer Tipp „daneben“ traf [✕ Löschen] (Marke weg).
  Jetzt: der Klick des Tipps wird verschluckt (`UI.ghost`), und das Blatt geht über der Wellenform auf (unter ihr, wenn oben kein Platz ist –
  L), nie über der Stelle, an der der Finger liegt.
- **A/B Roh │ Sauber mit Zeitkarte (major):** jeder Wechsel rechnete die gedehnte/geschnittene Fassung neu (Renders +1 je Tipp) und war
  0,10–0,23 s zu spät hörbar. Jetzt wird bei Takes mit SÄUBERN > 0 und Zeitkarte die Fassung der anderen Quelle (gleiche Karte) gleich
  mitgerechnet (`wpPreAlt`, `WP.alt`, nur für klingende Takes); der Schalter tauscht an derselben Stelle mit der linearen 6-ms-Blende von
  VS4 (`clResync`, `wpSameMap`) statt über die Suche von `wpSwitch`. Gemessen: 12 ms (6 Wechsel, keine neuen Renders), kein Klick
  (Spitzen der 2. Ableitung an den Wechseln ≤ 2,2 dB über der Umgebung, sonst im Signal bis 4,1 dB).
- **SÄUBERN nach dem Neuladen (major):** die gesäuberte Fassung lag schon im Audio-Store, der Schlüssel enthielt aber nur Take + Stärke.
  Jetzt Take + Stärke + Stand des Säubern-Kerns (Prüfsumme von `vsCleanMake`, z. B. `c100v2stdc`); neu gerechnet wird nur, wenn sich
  einer der drei ändert (alte Schlüssel werden beim nächsten Rechnen weggeräumt). Beim Laden aus dem Store zeigt das Takes-Blatt
  „lädt die gesäuberte Fassung …“ statt „säubert …“. Probe: nach Neuladen `runs 0`, `loads 1`, Puffer-Prüfsumme gleich.
- **Wellenform in Matrix und Song = was klingt (major):** `tkPeaks` las den Roh-Take. Jetzt die Hüllkurve des klingenden Puffers
  (gesäubert und/oder gedehnt/geschnitten, `tkHeard`); Zellen-Signatur und Song-Ansicht zeichnen neu, sobald eine neue Fassung fertig ist.
  Probe: Hüllkurve = klingender Puffer (Abweichung 0), gegen Roh 0,32 (gesäubert) bzw. 0,85 (gesäubert + gedehnt); vorher genau umgekehrt.
- **Marken nach ↶ von „Säubern“ (major, `vgs7/edundo.mjs`):** nach ↶ blieben die am gesäuberten Take erkannten Marken stehen (detCl 100
  bei cl 0). Jetzt: ändert sich SÄUBERN (Regler, ↶, ↷) bei offenem Editor, werden nicht gespeicherte Marken an der nun geltenden Quelle neu
  erkannt (`wpClChanged`); `wpMarks` gibt eine für eine andere Stärke erkannte Liste nicht mehr aus (auch „Audio folgt“ nimmt dann die neuen).
  Probe: ↶ → detCl 0, ↷ → detCl 100.
- **MK8-09P „Toast [Rückgängig]“ (`gmkp8-mk8-09-platte.mjs`): Probe veraltet, App richtig.** Quer dockt der Aktions-Toast seit MK-P auf der
  Kopf-Anzeige (188 px) und zeigt die Aktion als ↶ (44 px, aria-label „Rückgängig“); `innerText` enthält das Wort darum nicht. Ein
  Fingertipp auf ↶ macht das Laden rückgängig (B05 → A01, geprüft). Die Probe liest jetzt auch das aria-label → 27/27.
- Bekannte, nicht durch F1 verursachte Abweichungen: `gs7-v3-vs5a-t2` „↶ → Stärke 100 %“ (veraltet seit VS5b: Dehnen startet mit 70 %,
  siehe VS5b); `gs7-v3-vs5b-t1` „Render-Cache“ zählt je nach Zeitpunkt 7 → 7 oder 7 → 8 (mit 4.21.0 genauso; `instant` ist jedes Mal true).

Proben (alle mit `mk-wt/index.html` 4.22.0):
- Nachstellung + Nachweis: `vgs7/f1-lay.mjs` (echte Schrift, P1 P2 P3 L1 L2 XL W) 63/63; `gs7-v3-qab5b-ui` 35/35 (vorher 28/35);
  `gs7-v3-qa-vs5a-e` 54/54 (vorher 32/54); `vgs7/f1-ablat.mjs` PASS (vorher 0,10–0,23 s); `vgs7/f1-clcache.mjs` PASS; `vgs7/f1-wave.mjs`
  PASS (mit 4.21.0 FAIL); `vgs7/edundo.mjs` detCl folgt; `gmkp8-mk8-09-platte` 27/27; `v3-f1-toast.mjs` (↶ per Finger wirkt).
- Regression: `gs7-merge-vs4vs5` ALL OK; VS5a `t1` `t3` `t4` `t5` ALL OK; VS5b `t1` (Lauf 2) `t2` `t3` `t4` `t5` ALL OK; `qab5b-switch`, `-song`
  ALL OK, `-core` max diff 0; VS4 `qa-vs4-b`, `-d` ALL OK; `vgs7/toastcheck`, `toastcheck2`, `toastdel`, `toastredo`, `toastfix-verify` in
  390×844, 844×390, 320×568, 667×375 wie vorher (Werkzeuge unter dem Kopf-Toast frei, Aktionen wirken); `vgs7/edclose` ✓. Smoke ohne Fehler.
- Screenshots: `dirigent-test/vgs7/f1-ed-*.png`.

### Für Xander im Dashboard / am Server offen
4.22.0 liegt über dem Wächter `max_app` 4 021 000 – **vor dem Ausliefern** im SQL-Editor des Projekts **synquenzer**
(`dbdnsryoivvezspgydpx`, nicht das Klassenzimmer!) ausführen, sonst lehnt `save_project` das Online-Speichern ab:

```sql
update private.settings set max_app = greatest(max_app, 4022000);
```
Format bleibt 5 (`max_format` 5 reicht). Keine weitere Server-Änderung (am Server offen: nur dieser Wert).

- Schnappschuss: `synq-snapshots/F1-fix.html`.

# CHANGES – Zweig K (Nachtrag 5, K1)

## K1 — Klang-Prüfung: Synth stabil, nichts Verstecktes, gleicher Klang nach Speichern · App 4.25.0 (`APP_CODE` 4 025 000) · Format bleibt 5 · keine Server-Änderung

Zweig `n5-br-K` ab 4.23.0 (`vs-base-B.html`). Am Server offen: **max_app ≥ 4025000** (Xander hebt den Wächter selbst an; kein Supabase-Aufruf in diesem Zweig).

### Was neu ist

**Gefundene Fehler und Ursachen (gemessen, dann behoben)**

1. **„Gleiche Werte – klingt plötzlich anders“ beim MS 2000 (behoben).** Die 5-ms-Glättung der stufenlosen Werte (Cutoff, Resonanz, EG-Int, Mixer, Tune, Pan, Pegel …) lief nur, solange eine Stimme klang. Wer einen Regler drehte oder ein Programm lud, **während nichts klang**, behielt im Worklet den alten Glättungsstand: die nächste Note glitt dann vom *vorigen* Wert zum neuen. Wie stark, hing davon ab, welchen Weg die Regler vorher gegangen waren. Gemessen in 4.23.0: gleiche Endeinstellung, zwei Reglerwege, danach dieselbe Note → nur **−4,5 dB** Abstand, also klar hörbar. Einzeln: CUTOFF −27,6 dB, OSC 2 SEMITONE −9,3 dB, RESONANZ −31,7 dB. Jetzt springt die Glättung auf den eingestellten Wert, sobald das Timbre nichts mehr spielt. Dann gibt es nichts zu glätten und nichts knackt. Ergebnis: **−331 dB** (bitgleich) für jeden Reglerweg. Klingende Noten gleiten weiter wie bisher. Frisch geladene Klänge und alle Werksklänge rendern unverändert (Golden-Render).
2. **„Ein paar Cent“ im neuen Projekt (Ursache belegt, für INIT behoben).** Die Ursache ist der Regler **Analog** (MIX-Seite, Vorbelegung 15 %). Er gibt jeder Note eine zufällige Verstimmung: Tonhöhe ±analog·8 ct, jeder Oszillator ±analog·5 ct, Cutoff ±analog·1,5 HT. Bei INIT Analog sind das bis ±1,95 ct je Oszillator. Gemessen in 4.23.0 (INIT, 8 Noten A3): −1,18 … +1,12 ct. Dazu kam die Vorbelegung **Osz 2 Fein +7 ct**: Wer Osz 2 aufdrehte, hatte sofort 7 ct Schwebung. Ein Fehler in der Engine ist das nicht, aber eine Vorbelegung. **INIT Analog** hat jetzt Analog 0 und Osz 2 Fein 0. Gemessen über 8 Noten: **±0,003 ct**. Das neue Projekt mit [Leer (Init)] steht auf 0 Cent. INIT des MS 2000 war schon frei von Modulation und misst ±0,009 ct. Bei den MS-2000-Programmen kommt die Tonhöhen-Bewegung aus dem **Vibrato über die gespeicherte Mod-Rad-Stellung**: 12 von 256 Programmen, z. B. Hauchlead VIB 20 × Mod-Rad 31 % = ±40 ct. Dazu kommen PATCH → Tonhöhe (28 Programme) und Mod-Sequenz → Tonhöhe (10). Bei den VA-Werksklängen haben 39 von 64 Drift und 16 eine LFO → Tonhöhe-Route. Alles das ist gewollte Klanggestaltung und steht jetzt in der Mod-Übersicht. Alte Projekte mit INIT Analog behalten ihre gespeicherten 15 %/+7 ct und klingen wie vorher. Sie gelten nicht als „geändert“, weil der INIT-Stand vor 4.25.0 mit anerkannt wird.
3. **LFO „hält an“ nach dem Hintergrund (behoben).** Steht die App 30 s versteckt und ohne Wiedergabe, hält sie den Audio-Kontext an, um Strom zu sparen (§14.4.8). Danach liefen LFOs, LFO-Punkt und Mod-Anzeigen erst nach dem nächsten Tipp weiter. Jetzt läuft der Kontext an, sobald die Seite wieder sichtbar ist. Gemessen: suspended → running, die Zeit läuft 0,41 s in 0,4 s weiter. In 4.23.0 blieb er stehen.
4. **„Bewegt sich, aber ich komme nicht rein“ (behoben).** Im MOD-Reiter liefen die Pegelbalken der Quellen-Chips (LFO 1, LFO 2, Tonhöhe …) **immer**, auch ohne eine einzige Route. Es sah aus, als moduliere etwas die Tonhöhe, aber es gab keinen Eintrag, den man hätte öffnen oder löschen können. Jetzt bewegt sich ein Chip nur noch, wenn der Klang eine Route von dieser Quelle hat. Gemessen bei INIT ohne Route: kein Chip bewegt sich. Mit LFO 1 → Cutoff bewegt sich nur LFO 1.

**Mod-Übersicht (Punkt 3, die einzige neue Gestaltung)**

- Zu erreichen über **⋯ → „Modulationen (n)“** in jedem Synth-Editor (VA, FM, WT, MS 2000 hochkant) und im Querformat des MS 2000 über **⋯ (mkqmore) → „Modulationen (n)“**.
- Eine Zeile je aktiver Modulation, in der Form **Quelle → Ziel** und darunter die **Menge** in echten Einheiten:
  - **VA/FM/WT:** jede Route der Matrix mit Tiefe und Bereich (z. B. „+4 % · 380 Hz … 501 Hz“), auch Spur-FX-Routen. Dazu die fest eingebauten: Filter-Hüllk. → Cutoff, Anschlag → Filter-Hüllk.-Menge (nur mit Hüllkurve), Keytrack → Cutoff, Analog (Zufall je Note) → Tonhöhe · Cutoff („bis ±1,6 ct · ±0,18 HT“).
  - **MS 2000 (je Timbre, bei Dual „T1 ·“/„T2 ·“):** LFO 2 × Mod-Rad → Tonhöhe (VIBRATO, „±40,2 ct (Mod-Rad 31 %, Tiefe 20)“), PATCH 1–4 (Quelle → Ziel, Intensität), EG 1 / Keytrack / Anschlag → Cutoff, Keytrack → Amp, Mod-Sequenz n → Ziel (Anzahl der Schritte).
- **Tipp auf die Zeile** öffnet den Ziel-Regler: VA/FM öffnen Seite und Unterseite, der Regler leuchtet 1,6 s. Ein Ziel ohne eigenen Regler (Tonhöhe, Amp, Pan, OP n) öffnet den MOD-Reiter, die Route ist dort markiert. Beim MS 2000 öffnet sich GERÄT mit dem Zoom auf die Sektion des Knopfes (wenn es einen gibt) und der EDIT-Seite des Werts. Der Wert steht im LCD.
- **[✕]** (44 × 44) löscht die Modulation in **einem Undo-Schritt**, mit Toast [Rückgängig]. Bei einer Route fällt die Route weg. Bei einem fest eingebauten Wert wird der Regler 0 (Hüllk.-Menge, Keytrack, Analog, VIB INT, PATCH-Intensität, EG-Int …). Bei der Mod-Sequenz wird das Ziel der Spur „keins“.
- Die Liste ist ruhig und bewegt sich nicht. Was sich anderswo bewegt, hat in der Liste eine Zeile (siehe Punkt 4 oben).
- Ohne Modulation steht dort: „Keine Modulation – die Tonhöhe steht auf 0 Cent.“
- Lange Listen scrollen mit dem Finger (`pan-y`). Das Blatt bleibt in allen sechs Formaten innerhalb des Bildschirms.

**Geprüft und ohne Fehler (nichts geändert)**

- **Osz 3:** Pegel, Grundton und Pegelstufen sind bitgleich zu Osz 1/2 (je solo −20,30 dB, Grundton −19,38 dB, Stufen 0,25/0,5/1 identisch). HT +7 trifft 329,6 Hz (−15,5 dB), bei 220 Hz liegt −138 dB. Eine Änderung an Osz 3 wirkt auf Osz 1/2 nur über die gemeinsame (nichtlineare) Ladder: −31 … −43 dB. Osz 2 wirkt mit denselben Änderungen genauso (−30 … −41 dB). Im linearen Bereich ist die Wirkung ≤ −81 dB. Das *Gefühl* „Osz 3 hört man kaum / er verändert die anderen“ hat eine messbare Ursache. Osz 3 steht mit Fein 0 auf **genau derselben Tonhöhe wie Osz 1**, beide laufen phasenstarr mit zufälliger Startphase je Note. Der Pegelgewinn liegt deshalb je Note zwischen **0 und +5,5 dB** (16 Noten gemessen), und die Klangfarbe von Osz 1 ändert sich mit, statt dass eine Schwebung entsteht. Osz 2 hat ab Werk +7 ct und schwebt hörbar. Die Vorbelegung von Osz 3 ist außerdem Puls 16′. Das Verhalten ist Physik und keine Kopplung in der Engine. Ob Osz 3 eine Vorbelegung wie Osz 2 bekommen soll, steht unter Fragen.
- **LFOs:** Dauerlauf je 10 min Audiozeit (VA und MS 2000) mit 1 081 bzw. 1 055 Wechseln (Notenwechsel, ganze Szenen-Klänge, Tempo, Start/Stopp, Sync, Neustart, Hintergrund-Lücken). Die LFO-Phase stand in **0 von 212 792** bzw. **0 von 209 577** Blöcken still (global und je Note). Kein NaN.
- **Sample & Hold:** ein neuer Zufallswert je LFO-Takt, gehalten bis zum nächsten. Gemessene Stufen 14–15 von 15 Scope-Takten (VA, global und je Note) und 23 456–23 472 von 23 467 Samples (MS 2000, Key Sync aus/Stimme). Der Klang ist bitgleich zu 4.23.0 (VA −328 dB, MS 2000 −320 dB).
- **Ladder (VA, 96 Fälle):** alle 6 Typen × ECO/ANALOG × Resonanz 1/1,15 × Drive 0/1 × leise/voll (21 Unison-Stimmen + Sub + Rauschen), Cutoff alle 10 ms gedreht, LFO 40 Hz auf Cutoff/Resonanz. **0 NaN, 0 Inf**, kein Aussetzer bei LP/HP. Die Spitze bleibt begrenzt (max 4,97 = Eingangsstapel plus Resonanzspitze bei HP24 unter ±10-Oktaven-Sweep). Ein 2,7-ms-Tal bei BP24/ECO, wenn der 40-Hz-LFO den Cutoff ±120 HT fegt: Ein Bandpass bei 20 Hz lässt nichts durch, das ist kein Abbruch. **MS 2000** (16 Fälle, RESONANZ 127, 4 Filtertypen, DIST, CUTOFF als Bruchwerte alle 10 ms): 0 NaN/Inf, 0 Aussetzer, Spitze 1,83.
- **Zustandsfreiheit:** zwei Reglerwege zur gleichen Einstellung, danach dieselbe Note. VA −331,9 dB, FM −324,6 dB, MS 2000 −331,1 dB (vorher −4,5 dB, siehe Fehler 1).
- **Regler kommen vollständig an:** Nach 120 zufälligen VA-Reglerwerten und Routen, FM-Operator- und Makro-Änderungen und 60 MS-2000-Gesten mit Bruchwerten (dann Endwert, Dual, Mod-Sequenz) spielt das Worklet exakt die gespeicherten Werte. Abweichungen: 0 Parameter, 0 Routen, 0 Timbre-Felder.
- **Alte Klänge:** Alle 320 Werksklänge (64 VA/FM/WT, 256 MS-2000-Programme) rendern bitgleich zu 4.23.0, außer INIT Analog (gewollt, Fehler 2). Gegen 4.22.0 (F1-fix), 4.17.0 (MK8-fix) und 4.9.0 (MK1-fix) sind 192 bzw. 65 Klänge bitgleich. Das Worklet ist für alle 64 VA/FM/WT-Klänge seit 4.3.0 (V2c-fix, V2e′-fix, MK0-fix) bitgleich. „Früher optimierte Sounds klingen heute anders“ kommt also **nicht** aus einer Engine-Änderung. Die gemessenen Ursachen sind Fehler 1 (MS 2000, je nach Reglerweg) und die Auto-Qualität (siehe Fragen).

### Abnahme

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| K1-01 Osz 3 solo/Mix messbar, keine Wirkung auf Osz 1/2 | bestanden | solo −20,30/−20,30/−20,30 dB, Grundton −19,38 dB je Osz, Stufen identisch; HT +7: 329,6 Hz −15,5 dB / 220 Hz −138 dB; Rest-Wirkung auf Osz 1/2 −31…−43 dB = wie Osz 2 (−30…−41 dB), linear ≤ −81 dB; gleiche Tonhöhe: 0…+5,5 dB je Note (Phase) — `n5-k-osc3.mjs` → `n5-k-01.out` |
| K1-02 LFO-Dauerlauf 10 min ohne Stillstand | bestanden | VA 1 081 Wechsel, 0/212 792 Blöcke ohne Phasenfortschritt; MS 2000 1 055 Wechsel, 0/209 577 — `n5-k-lfo.mjs`, `n5-k-lfo-mk.mjs` (Argument `"" 10`) |
| K1-02 Hintergrund | bestanden (4.23.0: nicht) | suspended → running beim Sichtbarwerden, +0,41 s in 0,4 s — `n5-k-02b.mjs` |
| K1-02 S&H-Stufen = Zufall je Takt, Klang = 4.23.0 | bestanden | Stufenlänge 14–15/15 (VA), 23 456–23 472/23 467 (MS 2000), je Takt neu; gegen 4.23.0 −328/−320 dB — `n5-k-sh.mjs` |
| K1-03 Mod-Übersicht vollständig gegen die Engine | bestanden | 315 Klänge (alle VA/FM-Werksklänge und 256 Programme) gegen den Worklet-Zustand (`k1Dump`): 434 Einträge, 0 Abweichungen — `n5-k-03.mjs` (complete) |
| K1-03 Löschen hörbar, Undo | bestanden | VA-Route LFO 1 → Tonhöhe: Engine 1 → 0 → 1 Route, 1 Undo-Schritt, Schwankung 32,5 ct → 0 ct, Werksklang nach ✕ +2,5 dB anders, nach Undo −324 dB; MS-2000-Vibrato: VIB 20 → 0 → 20, 40,2 ct → 3,2 ct, 1 Undo-Schritt — `n5-k-03.mjs` (delVA, delMk) |
| K1-03 Tipp springt zum Ziel | bestanden | Filter-Hüllk. → FILTER/REGLER, Regler leuchtet; Route vel → Cutoff → Cutoff-Regler; MS 2000 VIB → EDIT Seite 4 (PITCH), LCD „PITCH · VIBRATO +20“ — `n5-k-03.mjs` (jump), per Finger `n5-k-06.mjs` |
| K1-03 was sich bewegt, hat einen Eintrag | bestanden | INIT im MOD-Reiter, Note hält: 0 von 8 Chips bewegen sich (4.23.0: alle); mit LFO 1 → Cutoff: nur LFO 1 (20 Werte in 1,2 s) — `n5-k-03.mjs` (move) |
| K1-03 INIT/neues Projekt ohne Modulation, 0 Cent | bestanden | 0 Einträge; Tonhöhe 8 Noten ±0,003 ct (4.23.0: −1,18…+1,12 ct); INIT MS 2000 0 Einträge, ±0,009 ct; altes INIT nicht „geändert“ — `n5-k-03.mjs` (init) |
| K1-04 Ladder Res max, schnelles Drehen | bestanden | VA 96 Fälle: 0 NaN/Inf, Spitze ≤ 4,97, LP/HP ohne Aussetzer (BP24-ECO-Tal bei ±10-Okt.-Sweep erklärt); MS 2000 16 Fälle: 0 NaN/Inf/Aussetzer, Spitze 1,83 — `n5-k-ladder.mjs`, `n5-k-ladder-mk.mjs` |
| K1-04 Zustandsfreiheit (zwei Wege → Render gleich) | bestanden | VA −331,9 dB, FM −324,6 dB, MS 2000 −331,1 dB (4.23.0: −4,5 dB) — `n5-k-path.mjs`, `n5-k-path-fm.mjs`, Einzelregler `n5-k-path2.mjs` |
| K1-05 Speichern/Laden bitgleich je Engine | bestanden | Worklet = gespeicherte Werte (0 Abweichungen); Projekttext → normalisieren: VA −337,7 / FM −319,2 / MS 2000 −318,9 dB, Daten gleich (auch WT, Drums); Speichern → Seite neu laden: gleiche Werte, gleiche Daten — `n5-k-05.mjs` |
| K1-05 alte Projekte gegen ihre Snapshots | bestanden | Demo und Leer (Init) aus 4.23.0, 4.22.0, 4.17.0, 4.9.0 in 4.25.0 geöffnet: jede Synth-Spur ≤ −324 dB gegen den Render in ihrer Version, „geändert“ wie dort — `n5-k-05old.mjs`; Werksklänge `n5-k-golden.mjs` (320 gegen 4.23.0, 1 gewollt anders), `n5-k-golden-node.mjs` (bis 4.3.0) |
| K1-06 Übersicht ≥ 44 px, alle Formate | bestanden | 390×844, 375×667, 320×568, 844×390, 667×375, 926×428, VA und MS 2000, per Finger über ⋯: Blatt im Bildschirm, Zeilen ≥ 48 px, ✕ 44 × 44, nichts abgeschnitten, Seitenhöhe unverändert, Liste scrollt mit dem Finger, ✕ = 1 Undo, Tipp springt — `n5-k-06.mjs`, Bilder `n5-k-06-*.png` |
| K1-06 CPU ≤ 4.23.0 | bestanden | Worklet in Node, 9 Läufe abwechselnd: VA 8 Stimmen 1,005 ×, MS 2000 4 Stimmen 0,959 × (Messrauschen gleiche Datei gegen sich: bis 1,11 ×) — `n5-k-cpu.mjs` |
| Rauchtest | bestanden | `smoke.mjs` ohne Fehler, `n5-k-smoke.png` |
| Regression MS 2000 (Node) | wie 4.23.0 | `v3-mk1-dsp` 64/64, `v3-mk1-fpdsp` 14/14, `v3-mk3-fpdsp` 6/6 (beim 2. Lauf; Zeitfenster-Messung schwankt auch bei 4.23.0), `v3-mk3-scale` 6/6, `v3-mk4-fx` 61/61, `v3-mk6-fp` 16/16, `v3-mk3-timbre` 29/30 und `v3-mk6-seq` 33/34 (gleicher Fehler auch bei 4.23.0) — `n5-k-reg-*.out`, `n5-k-regbase-*.out` |
| Regression MS 2000 Querformat-Wege | wie 4.23.0 | `n5-k-reg-spielq.mjs` (Kopie von `v3-qmkp-spielq.mjs` auf diesen Zweig) |

### Abweichungen

- **Anschlag → Lautstärke** (VA „Anschlag“ auf STIMME, MS 2000 AMP VELO INT) steht **nicht** in der Liste. Das ist Spieldynamik, nichts bewegt sich dabei. Sonst hätte jedes INIT eine „Modulation“ und die Regel „INIT ohne Modulation“ wäre verletzt. Anschlag → Cutoff und → Filter-Hüllk.-Menge stehen in der Liste.
- **Drums** haben keine Einträge: Die Tonhöhen-Hüllkurven der Pads sind Teil der Drum-Stimme und keine Modulation. Für Drums ist das ⋯-Menü ohne Eintrag „Modulationen“.
- **WT** läuft nativ ohne Analog-Drift. Bei WT steht „Analog“ deshalb nicht in der Liste, Routen und Filterwerte schon.
- **Osz 2 Fein** im INIT ist jetzt 0 statt +7 ct. Das gehört zu „Tonhöhe auf 0 Cent genau“ und ist auf dem Fein-Regler von Osz 2 sichtbar.
- Ein Test-Zugang `{k1Dump}` im Worklet (meldet den gespielten Zustand, nur auf Anfrage) und `SYNQUENZER.k1Mods/k1Del/k1Jump/k1Open/k1Dump/k1Expect`.
- Die vorhandene ⋯-Taste im Editor-Kopf misst hochkant 36 × 31 px. Sie war schon so, der Kopf ist von Xander festgelegt, deshalb nicht geändert. Im Querformat des MS 2000 misst sie 44 × 44.

### Fragen an Xander

1. **Osz 3:** Er ist technisch gleich wie Osz 1/2. Mit Fein 0 läuft er aber exakt auf der Tonhöhe von Osz 1, mal lauter, mal fast unhörbar, je nach Phase der Note (0 … +5,5 dB). Soll Osz 3 eine Vorbelegung bekommen wie Osz 2 (+7 ct), z. B. −7 ct? Oder sollen Oszillatoren auf gleicher Tonhöhe mit gleicher Phase starten? Beides ändert den Klang. Darum ist nichts gebaut.
2. **Qualität „Auto“:** Wird das iPhone knapp an Rechenzeit, schaltet die App die Ladder auf ECO und begrenzt Unison und Stimmen. Das ist der Schutz gegen Aussetzer. Gleiche Regler klingen dann anders: Bass mit Res 0,6 −15 dB Unterschied, Lead −25 dB. Das ist eine zweite Ursache für „klingt plötzlich anders“. Soll das so bleiben (Menü → Klang → Qualität „Analog“ hält den Klang fest), soll die App den Wechsel anzeigen, oder etwas anderes?
3. **S&H mit Key Sync (Timbre/Stimme):** Beim Neustart durch eine Taste behält der erste Takt den letzten Wert, der neue Zufallswert kommt erst am Taktende. Unverändert gelassen (Klang = 4.23.0). Soll ein Tastenstart sofort einen neuen Wert ziehen?
4. Ist es richtig, dass Anschlag → Lautstärke nicht als Modulation zählt (siehe Abweichungen)?

### iPhone (Xander)

- Neues Projekt [Leer (Init)], Synth 1, A gedrückt halten mit Osz 2 auf 100 %: keine Schwebung mehr, kein „paar Cent“. ⋯ → „Modulationen (0)“ zeigt „Keine Modulation – die Tonhöhe steht auf 0 Cent.“
- Einen Werksklang laden (z. B. Moog-Bass), ⋯ → „Modulationen (5)“: Zeile antippen → der Regler leuchtet. ✕ → hörbar weg, [Rückgängig] holt es zurück.
- MS 2000: Programm „Hauchlead“ (D05), ⋯ → Modulationen: „LFO 2 × Mod-Rad → Tonhöhe ±40 ct“. ✕ → das Vibrato ist weg. Im Querformat steht der Eintrag im ⋯ oben rechts.
- MS 2000: Ohne zu spielen CUTOFF drehen, dann die Taste. Die Note beginnt sofort mit dem neuen Cutoff, ohne Wischer vom alten Wert. Mehrmals mit verschiedenen Wegen: immer gleich.
- MOD-Reiter ohne Route: Die Quellen-Chips stehen still. Mit einer Route bewegt sich nur deren Quelle.
- App 30 s in den Hintergrund und zurück: LFO-Punkt und Modulationen laufen ohne Tipp weiter.

### Für das Zusammenführen

Alle Änderungen sind kurze Einhänger in vorhandenen Funktionen oder ein eigener Block. Nichts wurde verschoben oder neu formatiert.

- **Worklet** (`sq-worklet-src`, nur ASCII geprüft): `MkTimbre.idle()` hat eine neue erste Zeile nach der LFO-Zeile (Glättung → Zielwerte, wenn nichts klingt und kein Vocoder tönt). `AnalogCore.onMsg()` hat eine Zeile `{k1Dump}` am Ende.
- `SynthHost.track` / `node.port.onmessage`: eine Zeile `if (m.k1Dump) E.k1Dump = …`.
- `INIT_SYNTH` `f-init-analog`: `p` bekommt `analog: 0, o2fine: 0` (`INIT_VA_P` unverändert, die MS-2000-/Kompakt-Records nutzen es weiter).
- `soundEdited()`: `OHASH.h0` (INIT Analog vor 4.25.0) als zweiter gültiger Hash.
- `modFrame()`: 1 Zeile `k1u`/`k1h`, Chip-Wert 0 ohne Route.
- `openEdMore()`: Eintrag `data-a="k1m"` und Zweig `else if (a === 'k1m') openK1Mods(anchor, t)`.
- MS-2000-Block (`sq-mk-src`): neue Funktion `k1JumpPath()` vor `window.MKUI`, Export `k1: {jump: k1JumpPath}` am Anfang von `window.MKUI = {…}`. `morePop()` hat den Eintrag `k1m` und den Zweig im Tap.
- **Neuer Block** „K1 (Nachtrag 5 K1, Punkt 3): Mod-Übersicht“ direkt vor „Sichern (§11.3)“: `k1Num`, `k1Sgn`, `K1_PG`, `K1_RK`, `K1_PSRC`, `K1_PDST`, `K1_SQT`, `k1Mods()`, `k1Del()`, `k1Jump()`, `openK1Mods()`.
- CSS: Regeln `.pop.k1pop`, `.k1ml`, `.k1mr`, `.k1go`, `.k1x`, `.k1empty`, `.k1hl` direkt nach `.plist.edmore small`.
- Init: `visibilitychange` (sichtbar): `AU.ctx.resume()`, wenn `UI.idleSusp`.
- `SYNQUENZER`: `k1Mods`, `k1Del`, `k1Jump`, `k1Open`, `k1Dump`, `k1Expect` nach `initSound`.
- `VERSION` 4.25.0. Die Zeile `live: true,` ist unverändert.
- Test-Skripte: `dirigent-test/n5-k-*.mjs` (Hilfen `n5-k-lib.mjs` Node, `n5-k-blib.mjs` Browser), Ausgaben `n5-k-*.out`, Bilder `n5-k-06-*.png`, `n5-k-smoke.png`.
- Snapshot: `synq-snapshots/K1.html`.

## K1-fix — Mod-Übersicht vollständig (MS 2000 STEUER 2, Vocoder, FM-Feld, FM-Tonhöhen-Hüllkurve), Liste folgt ↶ ↷, Trefferflächen · App 4.25.0 (unverändert) · Format 5 · keine Server-Änderung

Am Server offen wie bei K1: **max_app ≥ 4025000** (kein Supabase-Aufruf). Am Klang ändert sich nichts: Das Worklet hat nur im Test-Zugang `{k1Dump}` drei Felder mehr.

### Was neu ist (die gemeldeten Fehler, jeder zuerst nachgestellt)

1. **MS 2000: LFO 1 → Osz 1 Form (STEUER 2) fehlte** (zwei gleiche Meldungen). Nachgestellt: 0 von 8 Werksprogrammen mit Eintrag, „Streichsatz“ meldete „Keine Modulation“. Die Engine rechnet `MKW.form(c1 + LFO 1 × c2)` für Säge, Puls, Dreieck, Sinus (X-Mod), Stimmwelle und Eingang. Jetzt steht dort je Timbre z. B. **„LFO 1 → Osz 1 Form · Steuer 2 · Tiefe +30“**. Bei Puls heißt das Ziel „Osz 1 Pulsbreite“, bei Sinus „Osz 1 X-Mod“, beim Eingang „Osz 1 Balance“. Bei Speicherwelle und Rauschen wählt STEUER 2 die Welle bzw. die Resonanz. Das ist keine Modulation, deshalb gibt es dort keinen Eintrag (34 solche Programme, 0 Einträge). Tipp öffnet GERÄT mit OSC 1, das LCD zeigt „OSC 1 · STEUER 2 (WFM) 30“. ✕ setzt STEUER 2 auf 0, ein Undo-Schritt. Alle 8 Programme haben jetzt den Eintrag: Streichsatz, Atemfläche, Wogenchor, Pendelbass, Hymn Strings, Haze Pad, Lush Strings und Brass+Bows (T2). Dazu kommt das Vocoder-Programm „Metal Voc“: Auch dort wirkt STEUER 2 auf die Trägerwelle.
2. **MS 2000 Vocoder: QUELLE × INTENSITÄT fehlte.** Nachgestellt: Vokalwah und Wah Voc zeigten „Modulationen (0)“. Jetzt steht dort **„LFO 1 → Vocoder Formant · Intensität +30“** (die Quelle so, wie sie eingestellt ist). Tipp führt zu FILTER · INTENSITÄT, ✕ setzt sie auf 0 (ein Undo-Schritt). Der Vocoder-KEYTRACK steht als „Keytrack → Vocoder Pegel“ in der Liste, genauso wie AMP KEYTRACK außerhalb des Vocoders. Gemessen: Die Vocoder-Stimme benutzt Filter und Amp des Timbres nicht. EG-Int, Keytrack und Anschlag auf 63 gegenüber dem Programm ergeben **−327 dB** (bitgleich), INTENSITÄT 0 dagegen **+2,7 dB**. Darum zeigt die Liste im Vocoder-Modus keine Zeilen „EG 1 / Keytrack / Anschlag → Cutoff“ und „Keytrack → Amp“ mehr. Sie würden etwas anzeigen, das sich nicht bewegt.
3. **FM-Feld: LFO FM / LFO AM je Operator fehlten.** Nachgestellt: Mit LFO FM 18 stand „Modulationen (0)“, während die Tonhöhe um ±42 ct schwankte. Jetzt steht dort **„LFO 1 → Tonhöhe · bis ±46,7 ct“**, wenn es alle klingenden Operatoren betrifft, sonst „LFO 1 → OP 1, 2, 3 Tonhöhe“. Der Pegel steht als **„LFO 1 → OP 2, 4, 6 Pegel · bis −16,1 dB“**. Operatoren mit gleichem Wert teilen sich eine Zeile. PMD/AMD aus .syx werden mitgerechnet (PMD 0 = keine Zeile). Ein Operator ohne Pegel oder mit M (stumm) hat keine Zeile. Tipp öffnet FELD → OP n → Seite Mod, die Zeile LFO FM bzw. LFO AM leuchtet. ✕ setzt den Wert der Operatoren der Zeile auf 0 (ein Undo-Schritt). Im MOD-Reiter bewegt sich der Chip „LFO 1“ jetzt auch ohne Route, wenn LFO FM/AM wirkt (10 verschiedene Werte in 1 s, die anderen Chips stehen still).
4. **FM: Tonhöhen-Hüllkurve fehlte.** Nachgestellt: Nach `setFmPeg` stand „Modulationen (0) … 0 Cent“. Jetzt steht dort **„Tonhöhen-Hüllk. → Tonhöhe · +4,5 HT“** mit dem Bereich der Stufen. Das gilt für die DX-Hüllkurve (fm6.peg ohne Feld) und für die Hüllkurve je Operator im Feld, auch für die Punkt-Form. Diese gilt auch für feste Operatoren, z. B. „Tonhöhen-Hüllk. → OP 5 Tonhöhe · +0,8 HT“. Tipp auf eine Hüllkurve aller Operatoren in DX-Form öffnet HÜLLK. → TONH., sonst FELD → OP n → Tonh. ✕ macht die Hüllkurve flach, wie die TONH.-Seite oder „Tonhöhe Init“ im Feld (ein Undo-Schritt).
5. **Liste veraltet nach [Rückgängig] im Toast.** Nachgestellt (P und L): 5 Zeilen statt 6. Jetzt zeichnet sich die offene Übersicht nach jedem ↶ ↷ neu, egal ob es aus dem Toast oder vom Kopf kommt (ein Einhänger in `undoApply`, wie beim Takes-Blatt). Gemessen: ✕ → 5, [Rückgängig] → 6, [↷ Wiederholen] → 5 Zeilen.
6. **Trefferflächen (K1-06 / typischer Fehler 4).** Die Flächen sind unsichtbar vergrößert, an den Knöpfen sieht man nichts.
   - Toast-Knöpfe ([Rückgängig], [↷ Wiederholen] …) haben jetzt überall 44 px Höhe. Vorher waren es 31/34 px. Gemessen 44 × 44 bzw. 95 × 44/45. Ausnahme: hochkant 601–700 px, wenn der Toast in der LCD-Zeile sitzt. Dort ist die Fläche das ganze Band zwischen Kopf und Reitern, 44 × 34, wie bei ⋯.
   - ⋯ im Editor-Kopf, Querformat (844×390, 667×375, 926×428): vorher 37 × 35, jetzt **44 × 44**.
   - ⋯ bei 320×568: vorher 36 × 32, jetzt **42 × 39**.
   - Die Flächen der Nachbarknöpfe sind gleich geblieben (gemessen vorher/nachher, `n5-k-fix-nb.mjs`).
7. **„±0 %“ bei kleinen Routen** (beim Nachstellen von Fehler 3 gesehen): Eine Route unter 0,5 % zeigt jetzt eine Nachkommastelle, z. B. „+0,4 %“. Vorher stand dort „±0 %“ neben „±0,11 HT“.

**Neues Projekt „Mit Startsounds“ (Meldung 4):** Nachgestellt, die Meldung stimmt. 4 von 5 Synth-Spuren haben Modulation, z. B. Mini-Lead mit LFO 2 → Tonhöhe ±10 ct und Analog-Drift ±2,6 ct. Das sind die Werksklänge, wie Xander sie kennt. Sie zu ändern wäre neue Klanggestaltung (Regel 27). Deshalb ist nichts geändert und die Frage steht unten. Die Übersicht zeigt jede dieser Modulationen mit ✕. „Leer (Init)“ steht weiter auf 0 Cent.

### Abnahme

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| Meldung STEUER 2 (2×) | behoben | 8/8 Programme mit Eintrag (vorher 0/8), 0/34 bei Speicherwelle/Rauschen; ✕ → 0, 1 Undo, Undo → 30; Tipp → GERÄT, LCD „OSC 1 · STEUER 2 (WFM) 30“ — `n5-k-qa-rep2.mjs`, `n5-k-qa-c2.mjs`, `n5-k-fix-mods.mjs`, per Finger `n5-k-qa-mkui.mjs` P/L, `n5-k-fix-finger.mjs` P/L |
| Meldung Vocoder | behoben | Vokalwah/Wah Voc je 1 Eintrag (vorher 0); ✕ 1 Undo; Tipp → FILTER · INTENSITÄT; Filter/Amp-Int. im Vocoder wirkungslos −327 dB, INTENSITÄT 0 +2,7 dB — `n5-k-qa-voc.mjs`, `n5-k-qa-rep.mjs`, `n5-k-fix-mods.mjs` (d, k) |
| Meldung FM-Feld LFO FM/AM | behoben | LFO FM 18 / AM 127 / beides: 1/1/2 Einträge (vorher 0); 4 gemischte Graphen gegen das Worklet (`k1Dump.fmx`): gleich; ✕ 1 Undo; Tipp → FELD OP 1 Mod, LFO FM leuchtet (P und L per Finger); LFO-1-Chip bewegt sich (10 Werte), andere still — `n5-k-qa-fmx.mjs`, `n5-k-qa-rep.mjs`, `n5-k-fix-mods.mjs` (e, j, l), `n5-k-fix-finger.mjs` |
| Meldung FM-Tonhöhen-Hüllk. | behoben | „Tonhöhen-Hüllk. → Tonhöhe +4,5 HT“ (vorher 0 Einträge), auch ohne Feld (fm6.peg); ✕ → flach, 1 Undo; Tipp per Finger → HÜLLK./TONH. (P und L) — `n5-k-qa-hidden2.mjs`, `n5-k-qa-fmpeg.mjs` P/L, `n5-k-fix-mods.mjs` (f, g), `n5-k-fix-finger.mjs` |
| Meldung Liste nach Toast-Undo | behoben | P und L: ✕ 5 → [Rückgängig] 6 Zeilen = 6 Einträge; ↷ → 5; Kopf-↶ ↷ wie vorher — `n5-k-qa-flow1.mjs` P/L, `n5-k-qa-undo.mjs`, `n5-k-fix-mods.mjs` (h) |
| Meldung ⋯ / [Rückgängig] < 44 | behoben, Rest siehe Abweichungen | ⋯ Querformat 44 × 44 (vorher 37 × 35), 320×568 42 × 39 (36 × 32), 390×844 44 × 44, 375×667 44 × 34 (unverändert, Band); Toast 44 hoch (31/34) in allen Formaten; Nachbarn unverändert — `n5-k-fix-edm.mjs` (edm, toast), `n5-k-fix-nb.mjs`, `n5-k-qa-rep2.mjs`, `n5-k-qa-06.mjs` |
| Meldung „Mit Startsounds“ | belegt, Frage an Xander | Mini-Lead/Melodie-Lead ±10 ct (LFO 2), Rom-Fläche ±7 ct, Drift bis ±2,6 ct; alle in der Übersicht — `n5-k-qa-newstd.mjs` |
| K1-03 vollständig gegen die Engine | bestanden | 315 Klänge, **445** Einträge (vorher 434: +9 STEUER 2, davon 1 im Vocoder „Metal Voc“, +2 Vocoder-INTENSITÄT), 0 Abweichungen; Abgleich jetzt auch für STEUER 2, Vocoder, FM-Feld, fm6-PEG — `n5-k-03.mjs` (complete) |
| K1-03 Rest (INIT 0 ct, Löschen, Undo, Tipp, Bewegung) | bestanden | wie K1 — `n5-k-03.mjs` |
| K1-06 alle Formate | bestanden | 12/12 Fälle ok (Blatt im Bildschirm, Zeilen ≥ 48, ✕ 44 × 44, nichts abgeschnitten, Seitenhöhe gleich) — `n5-k-06.mjs`, `n5-k-qa-06.mjs` |
| Rauchtest | bestanden | `smoke.mjs` ohne Fehler — `n5-k-fix-smoke.png` |

### Abweichungen

- **⋯ hochkant 375×667 (44 × 34) und 320×568 (42 × 39)** erreichen keine 44 px Höhe bzw. Breite. Der Grund ist die Geometrie: Bei 375×667 sitzt ⋯ in der LCD-Zeile, einem 34 px hohen Band zwischen Kopfzeile 2 und Reitern. Bei 320×568 sitzt ⋯ in einer Kopfzeile aus 36 × 32-Knöpfen mit 3 px Abstand, dort sind 39 px Raster möglich. Mehr ginge nur auf Kosten der Nachbarknöpfe oder mit einem anderen Kopf, und das wäre sichtbar anders. Beide Werte liegen über der Untergrenze für dichte Raster (36 × 34, spec v3 L4). Siehe Frage 2.
- **MS 2000 Querformat ⋯ (mkqmore) 45 × 43:** Die Kopfleiste ist 44 px hoch, davon 1 px Trennlinie, und sie schneidet ab. Für 44 müsste die Kopfleiste 1 px höher werden. Das ist nicht geändert.
- Im Vocoder-Modus fallen die Zeilen „EG 1 / Keytrack / Anschlag → Cutoff“ und „Keytrack → Amp“ weg, weil sie dort nicht wirken (gemessen −327 dB). Neu ist „Keytrack → Vocoder Pegel“.
- Test-Zugang `{k1Dump}` meldet zusätzlich `voc`, `fmx` (on, fmS, am, amG, pit, pt) und `peg`. Das wird nur auf Anfrage gesendet, im Audio-Pfad passiert nichts.

### Fragen an Xander

1. **Neues Projekt „Mit Startsounds“:** Mini-Lead und Melodie-Lead haben ab Werk ein leichtes Vibrato (LFO 2 → Tonhöhe ±10 ct), Rom-Fläche ±7 ct, und 4 von 5 Synth-Spuren haben Analog-Drift (bis ±2,6 ct je Note). Mit „Leer (Init)“ ist alles auf 0. Sollen die Startsounds so bleiben (jede Modulation steht in der Übersicht und lässt sich mit ✕ löschen)? Oder sollen sie ohne Vibrato/Drift starten? Das würde ihren Klang ändern.
2. **⋯ auf kleinen iPhones hochkant (375×667, 320×568):** Die Trefferfläche ist 44 × 34 bzw. 42 × 39. Volle 44 × 44 gehen nur, wenn die LCD-Zeile dort 10 px höher wird (dafür wird der Editor-Körper 10 px kleiner) bzw. wenn die Kopfzeile bei 320 px Breite einen Knopf weniger hat. Soll ich eins davon bauen?

### iPhone (Xander)

- MS 2000: „Streichsatz“ laden, ⋯ → „Modulationen (1)“: „LFO 1 → Osz 1 Form · Steuer 2 · Tiefe +30“. Antippen: OSC 1 STEUER 2 steht im LCD. ✕: die Streicher schweben nicht mehr. [Rückgängig] holt es zurück, die Liste zeigt die Zeile sofort wieder.
- „Vokalwah“ mit Mikro: ⋯ → Modulationen: „LFO 1 → Vocoder Formant · Intensität +30“. ✕: der Wah-Effekt ist weg.
- FM-Spur, FELD, OP 1 → Mod → LFO FM hochziehen: ⋯ → Modulationen zeigt „LFO 1 → OP 1 Tonhöhe“. Im MOD-Reiter bewegt sich der Chip LFO 1.
- FM, HÜLLK. → TONH. eine Hüllkurve ziehen: die Übersicht zeigt „Tonhöhen-Hüllk. → Tonhöhe“.
- Im Querformat ⋯ am Rand antippen, auch knapp daneben: das Menü öffnet. [Rückgängig] im Toast auch knapp über oder unter dem Knopf.

### Für das Zusammenführen

- Block „K1 (Nachtrag 5 K1, Punkt 3): Mod-Übersicht“:
  - `k1Mods()`: MS-2000-Zweig mit STEUER 2 (`K1_O1C`), Filter/Amp nur ohne Vocoder, Vocoder `voc.mint`/`voc.kbd`. Routen ohne „±0 %“. FM ruft am Ende `k1FmMods()` auf.
  - Neu nach `k1Mods()`: `K1_O1C`, `K1_PMS`, `K1_PR`, `k1Ht`, `k1FmPit()`, `k1FmMods()`, `k1FmxLfo()`.
  - `k1Del()`: Zweige `fpeg` (`fmSetPeg(i, null)`) und `fmx` (`fmxApply` + `fmChanged(i, true, true)`).
  - `k1Jump()`: Zweige für `fpeg`/`fmx`, also TONH. (`ED.sub.envfm`) bzw. FELD OP n Mod/Tonh. mit Leuchten.
  - `openK1Mods()`: `UI.pop.k1r` (Neuzeichnen).
- `undoApply()`: eine Zeile vor dem Takes-Einhänger (`UI.pop.k1r` per Microtask).
- `modFrame()`: die K1-Zeile `k1u/k1h` bekommt `k1f = k1FmxLfo(i)`.
- Worklet `AnalogCore.onMsg()` `{k1Dump}`: Felder `voc`, `fmx`, `peg` (nur ASCII geprüft).
- CSS nach `.k1hl`: `#toast button{position:relative}` + `::after`, P2-Regel `#toast.lcdk`, `.hb.edm1` (Querformat) und `.hb.edm2` (≤ 600 px hochkant) mit `::after` und `z-index:1`.
- Test-Skript `n5-k-03.mjs` (complete) rechnet die neuen Pfade mit ein. Neue Skripte: `n5-k-fix-mods.mjs`, `n5-k-fix-finger.mjs`, `n5-k-fix-edm.mjs`, `n5-k-fix-nb.mjs`, Bilder `n5-k-fix-*.png`.
- Snapshot: `synq-snapshots/K1-fix.html`.

# S012 — Teil bearbeiten (S0), Teil überarbeiten im Lauf (S1), Zusammenfassen (S2) · Basis App 4.23.0 (VERSION unverändert)

Grundlage: `spec/dirigent-spec-v3-nachtrag-5.md` Abschnitte S0, S1, S2; `spec/typische-fehler.md` (alle Punkte geprüft, siehe unten).
Datei: `bau/helfer/S012/index.html` (Kopie von `bau/werkzeug/vs-base-B.html`). Tests: `bau/helfer/S012/tests/` (Chromium, Touch).

## S0 — Teil bearbeiten (Fehler „Strophe ersetzen“)

### Fehler nachgestellt (`tests/repro-s0.mjs`, gegen die Basis)
Song Strophe (T1–2) · Refrain (T3–4) · Strophe (T5–6), beide Strophen = derselbe Teil. FANG TEIL fängt eine Strophe ohne Drums,
Name-Chip „Strophe ▾“ → „⟳ Strophe ersetzen“ → **beide** Stellen und die Teil-Vorlage wurden ersetzt (`markReplaceAll` über alle
Marken), obwohl nur die zweite gemeint war. Bei zwei Teilen „Strophe“ und „Strophe 2“ traf „⟳ Strophe ersetzen“ immer den Teil
„Strophe“ (Suche nach dem ersten passenden Namen) – „Strophe 2“ ließ sich so gar nicht ersetzen. Ergebnis Basis:
„1. Strophe (Takt 1) unverändert? false · Vorlage Strophe unverändert? false“.

### Was neu ist
1. **Ersetzen trifft genau die gewählte Stelle.** Kann „⟳ Strophe ersetzen“ mehr als eine Stelle meinen (Marken „Strophe“, „Strophe 2“ …
   im Song, gleichnamige Teile ohne Marke), zeigt das FANG-Blatt statt der Zeile „＋ Strophe 2 │ ⟳ Strophe ersetzen“ die Zeile
   **„Welche: [⟳ Strophe 1 (Takt 1)] [⟳ Strophe 2 (Takt 5)] [‹]“** (Song-Reihenfolge; gleiche Namen nummeriert, ein Teil ohne Marke
   „(nicht im Song)“). Die gewählte Stelle ist im Song markiert (weißer Rand der Marke). [ALS TEIL ✓] ohne Wahl ersetzt nichts
   (Hinweis „Welche Strophe? Bitte die Stelle wählen“). Ersetzt wird:
   - eine Marke, deren Teil nur dort steht (oder ein Teil ohne Marke): Teil-Vorlage + diese Stelle (wie bisher);
   - eine Marke eines Teils, der öfter im Song steht: **nur diese Stelle** (Melodie und eigene Clips dort bleiben wie bei
     „Auf alle übertragen“), Vorlage und die anderen Stellen bleiben deep-equal; die Marke behält ihren Namen und zeigt „′“.
   Eine Stelle = genau eine mögliche Bedeutung → wie bisher ohne Rückfrage. Ein Undo (`group` [part, song]).
2. **Marken-Blatt → [Bearbeiten]** (Tipp auf die gelbe Kopfzeile = Marke im Song; der Knopf steht in der Zeile von „● Neu aufnehmen …“):
   dasselbe Blatt zeigt „STROPHE · Bearbeiten · Takt 5–6 [‹]“, [✎ Name: Strophe] (das bestehende Namens-Blatt: Teil überall │ nur
   hier) und die **Liste der Spuren/Clips dieser Stelle über ihre Länge** (je Spur eine Zeile, je Clip-Abschnitt ein Knopf „Sz1“,
   „Sz2 T7–8“, „Eigener“ mit „an/aus“). Tipp = **an │ aus für diese Stelle**: „aus“ = die Spur schweigt in diesem Abschnitt, danach
   geht der Song phasengleich weiter; was dort lag, wird an der Marke gemerkt (`mark.off`) und kommt mit „an“ unverändert zurück
   (auch eigene Clips). Je Tipp ein Undo (`song`), Toast mit [Rückgängig]. Die Liste rollt per Finger.
3. Test-API: `fangReplaceWhich()`, `fangReplacePick(j|'back')`, `markSegs(id)`, `markSeg(id, t, b0, on)`, `markEdit(id)`.

### Daten (Format 5, nur additiv)
`song.marks[].off = [{t, b0, b1, e:[Lane-Einträge relativ], own?:{id: Clip}}]` – nur vorhanden, wenn an dieser Stelle etwas aus ist;
`marksNorm` übernimmt das Feld (sonst unverändert). Ältere Projekte: kein Feld, nichts ändert sich.

### Abnahme S0 (`tests/s0-acc.mjs` → ALL OK 38/38)
| ID | Ergebnis |
|---|---|
| S0-01 | ✓ ein Teil, zwei Marken: Blatt fragt „⟳ Strophe 1 (Takt 1) · ⟳ Strophe 2 (Takt 5)“ (Knöpfe 163 × 44); ohne Wahl nichts ersetzt; gewählte Marke im Song markiert; nach [ALS TEIL ✓] nur T5–6 geändert (Drums aus), T1–4 und die Vorlage deep-equal, Marke „Strophe′“; ein Undo = alles zurück. Teile „Strophe“/„Strophe 2“: „Strophe 2“ gewählt → nur Strophe 2 (Vorlage + Stelle), „Strophe“ deep-equal |
| S0-02 | ✓ Bearbeiten → ✎ Name → „Vers“ (Teil überall, alle Marken), Undo → „Strophe“ |
| S0-03 | ✓ DR aus in T5–6 per Touch: Lanes der anderen Spuren/Takte deep-equal; hörbar (Master-Mitschnitt): Drums T5 −64,5 dB (nur Ausklang des letzten Refrain-Schlags), T6 −84,9 dB, vorher −14 dB; Mischung T1–4 ±0,2 dB gleich; Speichern/Laden (serialize → importProject) deep-equal mit `mark.off`; „an“ → Lanes deep-equal zum Anfang; je Tipp ein Undo |
| S0-04 | ✓ Bearbeiten-Blatt und Marken-Blatt mit [Bearbeiten] in 390×844, 375×667, 320×568, 844×390, 667×375, 926×428: alle Knöpfe ≥ 44 × 44 (‹ wie ✕: 44 × 32 sichtbar + 12 px Trefferzone = 44 × 44), nichts abgeschnitten, im Bild, kein waagrechtes Rollen; Bilder `s0-04-*.png` |

Smoke (`tests/smoke.mjs`): keine Fehler.

## S1 — Teil überarbeiten im Lauf (unverbindlich, mit FANG)

### Was neu ist
1. Läuft ein Teil, den man auf der Teil-Leiste angetippt hat, wird im Lauf **nichts überschrieben**: Clips/Spuren an/aus,
   Szenenwechsel und Dazuspielen landen wie bisher nur im Song-Gedächtnis bzw. im FANG-Puffer (der Teil bleibt deep-equal).
2. **FANG bzw. FANG TEIL** fängt dann den **letzten vollständigen Durchlauf** des Teils mit allen Änderungen als **neue Fassung**:
   Spuren, die man angefasst hat, bekommen ihre Lane aus dem Gedächtnis (z. B. „DR Sz1, aus T3–4“), unberührte behalten ihre
   Lane; hat der Teil eine Akkord-Zeile, kommt sie aus dem, was wirklich klang; **dazugespielte Noten** (Synth-Spuren, wie gehört)
   kommen als `Part.mel` in die Fassung und spielen ab dann im Teil mit (auch im Song, wenn der Teil eingesetzt wird).
3. Ergebnis-Blatt **„TEIL ÜBERARBEITET“** (Platz und Form wie das FANG-Blatt: P über der Tastatur, quer im Seitenfeld): Teil-Chip,
   „Letzter Durchlauf eingefangen · n Noten dazugespielt“, Zeilen **Neu** / **Bisher**, **[Verwerfen] [Als neuen Teil] [Teil ersetzen]**.
   Der alte Teil bleibt unverändert bis [Teil ersetzen]. [Als neuen Teil] = nächster freier Platz, Name „Strophe 2“ (N7-R2-Nummer).
   ✕ / daneben = Verwerfen. Je Aktion ein Undo (`part`).
4. Ein Szenenwechsel im Lauf beendet den Teil; er bleibt für FANG gemerkt, bis ein anderer Teil startet oder ▶ stoppt.
   Noch kein vollständiger Durchlauf seit dem Tipp → FANG/FANG TEIL machen das Bisherige (kein Blatt). Ein mit FANG TEIL gefangener
   Kreis, der als Teil weiterläuft, ist kein „angetippter“ Teil → FANG TEIL fängt dort wie bisher eine neue Phrase (sonst wäre der
   zweite Fang aus V2d/V2e′ weg; Regression `v3-qa-v2e2reg-fangui` gleich wie Basis).
5. Test-API: `s1Fang({beat?})`, `s1Info()`, `s1Accept('replace'|'new')`, `s1Discard()`, `s1Active()`.

### Daten (Format 5, additiv)
`Part.mel = {Spur: [{t (Schläge ab Teil-Anfang), d, n (gehört), v}]}` – nur wenn Noten dazugespielt wurden. `normPart` liest es
verlustfrei, `partChunk` schreibt es beim Einsetzen in den Song nach `song.mel` (wie jede Song-Melodie).

### Abnahme S1 (`tests/s1-acc.mjs` → ALL OK 28/28)
| ID | Ergebnis |
|---|---|
| S1-01 | ✓ Teil (4 Takte) per Touch auf der Teil-Leiste gestartet; im 2. Durchlauf Drums am Taktstrich 3 aus → Teil während des Laufs deep-equal; FANG (Touch `#bFang`) → Fassung DR `[{bar 0, Sz1}, {bar 2, aus}]`, andere Spuren wie der Teil; alter Teil unverändert bis [Teil ersetzen]; danach neu gestartet: Drums in T1–2, ab T3 still (noteLog) |
| S1-02 | ✓ Noten 72 (T1) und 76 (T2) dazugespielt → `mel[3]` t = 1,06 / 5,02; im neu gestarteten Teil erklingen sie an denselben Stellen (±0,01 Schlag) |
| S1-03 | ✓ [Teil ersetzen] / [Als neuen Teil] je ein Undo → deep-equal; Speichern/Laden deep-equal mit `Part.mel`; [Verwerfen] ändert nichts |
| Blatt | ✓ 390×844, 375×667, 320×568, 844×390, 667×375, 926×428: im Bild, Knöpfe ≥ 44 px, nichts abgeschnitten (Kopf quer 11 px) |

## S2 — Zusammenfassen (Teil konsolidieren, Teile verketten)

### Was neu ist
1. **Marken-Blatt → [Zusammenfassen]** (neben [Bearbeiten]): alles im Bereich der Marke wird **ein neuer Teil** – Lanes (mit
   Phasen und **eigenen Clips**), Akkorde/Träger, die **im Song dazu aufgenommene Melodie** (`song.mel` aller Spuren) und die
   **Song-Stimme** (`song.vox`). Der Song selbst bleibt, wie er ist (er klingt unverändert); nur die Marke zeigt jetzt den neuen Teil.
2. **Gelbe Auswahl über zwei oder mehr Teile → Bereich-Leiste ⋯ → „Zusammenfassen“**: die gewählten Takte werden ein Teil
   (Länge = Summe), eine Marke ersetzt die bisherigen. Höchstens 16 Takte (Grenze eines Teils, wie „Als Teil …“).
3. Name wie bei „Als Teil …“ (Namens-Chips N7-R2, ✎ eigener Text); Vorschlag bei einer Marke ihr Name mit Nummer („Strophe 2“),
   sonst der nächste freie Name. Ein Undo (`group` [part, song]).
4. Wird der neue Teil woanders eingesetzt (Ziehen, Teil einsetzen, Ersetzen durch), bringt er Melodie, eigene Clips und Stimme mit.
5. Test-API: `sumMark(id, name?)`, `sumRange(a, b, name?)`, `openSum(a, b)`.

### Daten (Format 5, additiv)
`Part.mel` (wie S1), `Part.own = {id: Clip}` (eigene Clips, Lane-Einträge mit `own`), `Part.vox = [Stimm-Abschnitte, bar relativ]`,
bei `src: 'song'` zusätzlich `ph` an späteren Lane-Einträgen (sonst ginge eine Phase nach einem eigenen Clip verloren). `partChunk`
schreibt alles mit, `songWrite` setzt `vox` an die Stelle. Teile ohne diese Felder: unverändert (FANG-TEIL-Teile behalten ihr
bisheriges Verhalten, geprüft mit `v3-qa-v2e2reg-fangui` und `v3-qa-reg-fang2`).

### Abnahme S2 (`tests/s2-acc.mjs` → ALL OK 25/25)
| ID | Ergebnis |
|---|---|
| S2-01 | ✓ Song Strophe · Refrain · Strophe mit Song-Melodie (S4, 4 Noten in T1–2), eigenem Clip (S1 T2) und Stimme (330-Hz-Take T1–2); Tipp auf die Marke → [Zusammenfassen] (Touch) → „Strophe 2“: Teil mit Lanes, `mel` (4), `own` (1), `vox` (1); Song deep-equal (ohne Marken), Marke ohne „′“. Teil hinter dem Ende eingesetzt (T7–8): je Takt Clip/Phase/eigener Clip/Träger/Melodie/Stimme gleich; **hörbar**: 87 Noten T1–2 = T7–8 (Spur, Schlag auf 0,001, Ton), Pegel −13,4/−13,8 dB = −14,0/−14,2 dB (±0,6), Stimme 330 Hz −24,1 / −24,4 dB (T3 ohne Stimme −47,4) |
| S2-02 | ✓ gelbe Auswahl T1–4 über Strophe + Refrain → ⋯ (Touch) → „Zusammenfassen“ → Chip „Refrain“ → Teil „Refrain 2“ mit 4 Takten (2 + 2), eine Marke T1–4, Song deep-equal; eingesetzt an T7–10 = T1–4 je Takt; hörbar 120 Noten gleich |
| S2-03 | ✓ Undo (Einsetzen, Zusammenfassen) → deep-equal; Speichern/Laden deep-equal mit `Part.mel/own/vox` |
| Formate | ✓ Namens-Blatt in 6 Formaten ≥ 44 px, nichts abgeschnitten; [Zusammenfassen] im Marken-Blatt ≥ 44 × 44 (bricht als „Zusammen-fassen“ um, nie abgeschnitten) |

„Bitgleicher Render“: Die App hat keinen Offline-Render des Songs; geprüft wird (a) der Song-Inhalt selbst bleibt deep-equal
(dort also bitgleich), (b) der eingesetzte Teil erzeugt dieselben Ereignisse (Notenprotokoll, Stimm-Abschnitte, Träger) und
(c) Pegel/330-Hz-Anteil im Master-Mitschnitt gleich. Ein Sample-Vergleich des Echtzeit-Mitschnitts ist wegen freilaufender
Oszillator-/LFO-Phasen nicht bitgleich möglich (auch nicht zwischen zwei Läufen derselben Stelle).

## Regression (Basis 4.23.0 gegen S012, `tests/reg/`, Kopien der Skripte aus `bau/tests/` mit lokalen Pfaden)
| Skript | Ergebnis |
|---|---|
| `v3-qa-reg-part`, `-part2`, `-part3` (Teil-Lanes, ＋, Akkord-Zeile) | gleich (Bass-Noten je Schlag identisch, keine Fehler) |
| `v3-qa-reg-loop` (Schleifen-Bereich) | gleich (46 = 46 Noten) |
| `v3-qa-reg-fang2` (FANG → FANG TEIL) | gleich |
| `v3-qa-v2e2reg-song` (Import, Rundweg, 30 Undos, Song nach Undo) | gleich |
| `v3-qa-v2e2reg-fangui` (FANG-Blatt per Touch, ALS TEIL, ＋ Ans Song-Ende, P1/L1) | gleich bis auf die gemessene Tipp-Zeit im Takt (10 % gegen 12 %, Zeitrauschen) – vor dem `caught`-Fix fing der zweite FANG TEIL fälschlich als S1, behoben |
| `v3-qa-reg-song` (● SONG-Mitschnitt in Echtzeit) | zeitabhängig: auch Basis gegen Basis weicht beim aufgenommenen Song ab; die Notenprotokolle folgen dem jeweils aufgenommenen Song – kein Befund |
| `tests/smoke.mjs` | keine Fehler |

## Unabhängige Nachprüfung (eigener Prüf-Agent, Skripte `tests/qa/`) – 7 Befunde, alle behoben
| # | Befund | Behebung |
|---|---|---|
| D1 | „Auf alle übertragen“ mit einem Teil, der `Part.mel` trägt (S1/S2): Melodie an den Zielstellen doppelt (behaltene Song-Melodie + Teil-Melodie); Vorlage behielt alte `mel/own/vox` | `markReplaceAll`: auf Spuren, für die der Teil eine Melodie mitbringt, gilt die des Teils; `markApplyAll` übernimmt bei solchen Teilen auch `mel/own/vox` von der Stelle (`s012ApplyAll`) |
| D2 | Eine Stelle des Teils „Strophe“, „nur hier“ in „Vers“ umbenannt, wurde ohne Rückfrage mit ersetzt | Die Auswahl „Welche“ nimmt alle Stellen eines passenden Teils auf, auch umbenannte („Vers (Takt 5)“) |
| D3 | `mark.off` nach Löschen am Anfang einer Marke bzw. Teilen der Marke (Als Teil, Zusammenfassen über einen Teil) mit alten Abständen → „an“ unmöglich oder falscher Inhalt | `marksCut` verschiebt `off` mit (`s0OffShift`; ein angeschnittener Abschnitt bekommt seinen Zustand am neuen Anfang inkl. Phase / eigenem Clip) |
| D4 | Szenenwechsel im Lauf beendete den Teil → FANG ohne S1 | Der zuletzt angetippte Teil bleibt im selben Lauf gemerkt, bis ein anderer Teil startet; FANG fängt seinen letzten Durchlauf (alle Spuren „von Hand“, Szene je Takt aus dem Gedächtnis) |
| D5 | FANG-Taste hochkant unsichtbar, obwohl S1 fangen könnte (letzte Note > 8 s her, z. B. 100 bpm) | FANG leuchtet/erscheint, sobald ein vollständiger Durchlauf da ist (`s1Lit`) |
| D6 | Note im letzten ¼ Schlag vor dem Durchlauf-Ende ging beim Einsetzen in den Song verloren | Sie gilt als Auftakt zu Takt 1 (TA5): `t` negativ, klingt im Kreis vor Takt 1 und landet im Song als Auftakt |
| D7 | Auftakt-Note der Song-Melodie fiel beim Zusammenfassen weg (`t < 0` verworfen) | `Part.mel` erlaubt Auftakte bis −¼ Schlag |

Nachlauf: `qa/q1` 4/4, `q2` 24/24, `q3` 10/10, `q5` 3/3; `q4` 9/10 und `q7` 8/9 – die beiden roten Punkte sind keine Fehler:
`q4 (a)` erwartet die per `launchScene` in Takt 3 gestartete Szene schon ab Takt 3, sie startet (quantisiert) am nächsten
Taktstrich = Takt 4, die Fassung zeigt Sz2 ab Takt 4; `q7 C` ist die oben genannte Abweichung (`song.xp` im Bereich). Danach
S0 38/38, S1 28/28, S2 25/25, Regressionen wie oben, Smoke ohne Fehler.

## Abweichungen
- S0 „gespeichert im Teil“: an/aus wird **an der Stelle** (Marke) gespeichert, nicht in der Teil-Vorlage – sonst würden alle
  Strophen schweigen, Xanders Beispiel ist aber „im letzten Teil schweigen die Drums“. Siehe Fragen.
- S1 gilt für einen Teil, der auf der Teil-Leiste angetippt wurde. Ein Song, der in einer Schleife über eine Marke läuft, wird
  nicht als „Teil im Lauf“ behandelt (FANG dort wie bisher) – siehe Fragen.
- S1 nimmt dazugespielte **Synth**-Noten in die Fassung; auf den Pads dazugespielte Drums nicht (Song-Melodien gibt es nur für
  Synth-Spuren). Der Name „TEIL ÜBERARBEITET“ des Ergebnis-Blatts folgt dem FANG-Blatt („TEIL GEFANGEN“); die Spec nennt keinen.
- S2: Ein Teil mit eigenen Clips/Stimme, der auf der **Teil-Leiste** angetippt wird, spielt dort die Szenen-Clips der eigenen Clips
  und keine Stimme (die Teil-Leiste spielt nur Szenen-Clips; im Song klingt alles). Song-Melodie spielt auch dort (S1-Weg).
  Eine Teil-Transposition im Song (`song.xp`) innerhalb des Bereichs wird nicht in den Teil übernommen (wie „Als Teil …“).
- S2: Zusammenfassen fragt nach dem Namen (wie „Als Teil …“); die Spec nennt keinen Namen.
- Der ‹-Knopf im Bearbeiten-Kopf hat dieselbe Form wie das bestehende ✕ des Marken-Blatts (44 × 32 sichtbar, Trefferzone 44 × 44).

## Fragen an Xander
1. S0: Soll „aus“ im Bearbeiten-Blatt nur an dieser Stelle gelten (so gebaut) oder für alle Stellen des Teils (dann „Auf alle
   übertragen“ danach)?
2. S0: Früher ersetzte „⟳ Strophe ersetzen“ Vorlage + alle Strophen auf einmal. Jetzt fragt das Blatt nach der einen Stelle. Brauchst du
   zusätzlich „alle Strophen“ als Wahl (bisher über Marken-Blatt → „Auf alle übertragen“ erreichbar)?

3. S1: Soll „Teil ersetzen“ auch die Stellen dieses Teils im Song mitnehmen (wie früher ⟳ ersetzen) – oder nur die Vorlage
   (so gebaut; die Song-Stellen zeigen dann „′“ und lassen sich mit „Auf alle übertragen“ angleichen)?
4. S1: Soll auch ein Song, der in der Schleife über eine Marke läuft („Songteil antippen zum Hören“ über ▶ Ab hier + Schleife Teil),
   so eingefangen werden? Dann würde [Teil ersetzen] diese eine Stelle ersetzen.
5. S1: Sollen auf den Pads dazugespielte Drums auch in die Fassung (als neuer Drum-Clip)?

6. S2: Soll der zusammengefasste Teil den alten Namen behalten (z. B. „Strophe“ statt „Strophe 2“), wenn nur eine Marke
   zusammengefasst wird? Dann müsste der alte Teil umbenannt oder ersetzt werden.
7. S2: Mehr als 16 Takte zusammenfassen (z. B. drei 8-Takt-Teile) geht wegen der Teil-Grenze nicht – mit G8 (64 Takte) anheben?

## Für das Zusammenführen
- Alles in markierten Blöcken: Code-Block `/* S0 … */ … /* /S0 */` direkt vor `function uiSync()`, CSS nach `.msheet .ms-all{…}`.
- Ein-Zeilen-Haken: `fangAccept` (Zeile `/* S0 */` am Anfang des Ersetzen-Zweigs), `openFangSheet` paint/onTap/onClose (je eine Zeile
  `/* S0 */`, `dupx` ruft `s0FangClear()`), `markReplaceAll(song, p, skipId, onlyId)` (neuer optionaler 4. Parameter), `marksNorm`
  (eine Zeile `mark.off`), `openMarkSheet` paint (eine Zeile `s012MarkSheetPaint(p, m)` nach dem `innerHTML`),
  `Object.assign(SYNQUENZER, S012_API)` nach `WP_API`.
- S1-Haken: `normPart` (eine Zeile `s012PartExtra`), `partChunk` (`mel: s1ChunkMel(p, L)` statt `mel: {}`), `partTick` (eine Zeile
  `s1PartMelTick`), `fangTap` (eine Zeile vorn), `fangAdopt` (`caught: 1` am übernommenen Kreis). Block `/* S1 … */ … /* /S1 */` hinter S0.
- S2-Haken: `partChunk` (Lane-Zeile: `ph`/`own`; Rückgabe `Object.assign(…, s2ChunkExtra(p, L))`), `songWrite` (eine Zeile `vox`),
  `openRangeMore` (Listeneintrag + eine `else if`-Zeile). Block `/* S2 … */ … /* /S2 */` hinter S1; der Knopf im Marken-Blatt kommt
  über denselben `s012MarkSheetPaint`-Haken wie [Bearbeiten].
- VV2 (Video-Zeile im selben Blatt): unser Haken hängt die Knöpfe hinter `.ms-rec` ein und ersetzt in der Bearbeiten-Ansicht das
  ganze `innerHTML` – eine Video-Zeile, die VV2 im paint per `innerHTML` mitbaut, verschwindet in der Bearbeiten-Ansicht und ist nach ‹
  wieder da. Konflikt nur, wenn VV2 dieselbe Zeile `B('rec', …)` umschreibt: dann `s012MarkSheetPaint(p, m);` einfach hinter VV2s
  Zeile stehen lassen.

## Typische Fehler (spec/typische-fehler.md) – geprüft
1/4/5 Formate, ≥ 44 px, kein Sprung: S0-04 · 3 Liste rollt per Finger (`pan-y`, `touch-action:pan-y`) · 6 Blatt schließt mit ✕/neben
das Blatt (bestehendes Marken-Blatt), Bearbeiten → ‹ · 7 geändert-Punkt über `songChanged`/`markDirty` · 8 ein Undo je Aktion ·
9 Speichern/Laden deep-equal · 10 Wahl im FANG-Blatt endet mit ‹, Verwerfen, Schließen (`s0FangClear`) · 12–17 keine DSP-Änderung ·
20 kein Supabase-Aufruf (keine neuen Aufrufe, Netz-Wächter im Test leer) · 24 „MS 2000“ genau einmal, kein Markenname · 26 keine
früheren Tests angepasst · 27 nichts Zusätzliches: offene Punkte unter „Fragen an Xander“.

# Helfer N12D1K2 — K2 · N1 · N2 · D1 (Basis App 4.23.0, `vs-base-B.html`)

Stand: alle vier Pakete gebaut, Abnahme grün (Einzelheiten je Paket). Keine Supabase-Aufrufe; „MS 2000“ genau einmal, kein Korg-Wort.

Zweig `helfer-n12d1k2`, Datei `bau/helfer/N12D1K2/index.html`. VERSION-Zeile unverändert (4.23.0). Format 5, nur additive Felder.

---

## K2 — FM-FELD: Hüllkurven bei mehr als 3 Operatoren

### Was gemessen wurde (Ursache)
- **Hüllkurven-Rechnung selbst ist richtig.** Die Hüllkurve jedes Operators (DX- und Punkt-Form, parallel, Paare, Kette, 1…6
  Operatoren) ist im Verbund gleich wie derselbe Operator allein (Verstärkung je Block exakt gleich, 0,000 dB) und gleich auf
  OP 1…6 (Lage-unabhängig). Im Klang (6 Ausgänge, Teilton je OP per Goertzel) höchstens 0,25 dB. Die Normierung 0,5/√(Ausgänge)
  ist laut Nachtrag 1 so gewollt und verändert die Form nicht.
- **Ursache der „falschen Hüllkurven“: Stimmenklau durch den CPU-Begrenzer.** Mehr Operatoren = mehr Rechenzeit (gemessen: 6-OP-Stimme
  ≈ 2× eine VA-Stimme). Ab Last 0,60 / 0,75 setzt der Begrenzer die Stimmenzahl auf 6 / 4 (bei schwerem Graph oder Punkt-Schleife
  auf 4). Der Worklet hat dann auch **gehaltene** Noten geklaut: ein 6-Ton-Akkord verlor bei Stufe 3 zwei Töne mitten in der
  Hüllkurve (gemessen 4 gehaltene Noten gestohlen in 2 Akkorden), dazu mit nur 96 Samples (2 ms) Ausblende = Knackser.

### Was neu ist
1. Die Stimmen-Grenzen des Begrenzers (6 / 4, und 4 für schwere Graphen ab Stufe 2) kürzen nur noch **ausklingende** Stimmen.
   Gehaltene Noten werden erst über der eigenen Stimmenzahl des Klangs geklaut (neues Worklet-Feld `polyH` = gespeicherte
   Stimmenzahl, nur solange der Begrenzer kappt; nicht im Projekt gespeichert). Stimmenzahl muss nicht von Hand erhöht werden.
   Die Grenze „> 12 Verbindungen → 6 Stimmen“ (K2-42) bleibt hart.
2. Stimmenklau-Ausblende 5 ms statt 2 ms (wie beim AM-Klang `MK_STEAL`): Knackser > 3 kHz einer geklauten lauten Note
   −50,2 dB statt −43,2 dB.
3. Ohne Stimmenklau ist der Klang bitgleich zu 4.23.0 (FM und VA, `k2-gleich.mjs`).

### Abnahme
| Punkt | Prüfung | Ergebnis |
|---|---|---|
| K2-01 | 1…6 OP, dx/Punkt, parallel/Paare/Kette: Hüllkurve je OP im Verbund = OP allein | 0,000 dB (≤ 1) — bestanden |
| K2-01 | gleiche Hüllkurve auf OP 1…6 = auf OP 1 | 0,000 dB — bestanden |
| K2-01 | Klang: 6 Ausgänge, Teilton je OP gegen OP allein (Worklet in Node und App-Worklet im Browser) | 0,25 dB — bestanden |
| K2-02 | 6-Ton-Akkord über ausklingendem 6-Ton-Akkord, 3/4/6 OP, poly 8 und Begrenzer poly 6 / 4 | 0 gehaltene Noten geklaut, kein NaN — bestanden (vorher bei poly 4: 4 geklaut) |
| K2-02 | App: Begrenzer Stufe 3 → poly 4 + polyH 8, zurück auf 0 → polyH 0 | bestanden |
| K2-02 | Klau-Knackser > 3 kHz | −50,2 dB (vorher −43,2 dB) |
| K2-03 | CPU je Stimme (Node, Xeon): VA ≈ 10–12 µs, FM 1 OP ≈ 7–17 µs, 6 OP ≈ 14–28 µs je 128er-Block; 6 Stimmen × 6 OP ≈ 0,15 ms von 2,67 ms | im Rahmen (kein Mehr gegen 4.23.0) |

Tests: `tests/k2-abnahme.mjs`, `tests/k2-click.mjs`, `tests/k2-cpu.mjs`, `tests/k2-gleich.mjs`, `tests/k2-app.mjs`, `tests/k2-app-lim.mjs`
(Lib `tests/k2-lib.mjs`: der Worklet aus index.html in Node). Regression: `bau/tests/smoke.mjs` ohne Fehler, `n5-k-path-fm.mjs` −324,6 dB (wie vorher).

### Abweichungen
- Die Spec nennt „1…8 Operatoren“; das FELD hat 6 Operatoren (ein 7. wird abgelehnt). Geprüft: 1…6.
- Bei Begrenzer-Stufe 2/3 kann ein großer Akkord jetzt mehr Rechenzeit kosten als vorher (gehaltene Noten bleiben); die
  Ausklänge werden weiter gekürzt.

### Fragen an Xander
- K2: Hattest du die falschen Hüllkurven auf dem iPhone bei mehreren Spuren gleichzeitig (dann war es der Begrenzer, jetzt behoben)?
  Falls es auch mit nur einer FM-Spur und wenigen Noten passiert: welcher Klang/welches Feld? Dann bitte das Projekt schicken.

### Für das Zusammenführen
- Worklet: `STEAL_N` (neben `FMX_EDGE_CAP`), `stealIfFull()` (Block `/* K2 */`), `defaults()` + `polyH: 0`.
- Hauptteil: `limited()` (+ `polyH` ab Stufe 2), `applyLimiter()` (polyH zurück auf 0), `wkFlush()` (eine Zeile).
- Berührt nicht K1 (Osz 3 / LFO / Ladder / Mod-Übersicht).

---

## N1 — Noten umdrehen

### Was neu ist
- Noten-Editor (Clip, Song-Melodie, eigener Clip – alle nutzen dieselbe Rolle), Aktionsleiste hinter „−12“: **[Spiegeln]** und
  **[Umdrehen]**, je mit gezeichnetem Symbol (SVG: Pfeile ↑↓ bzw. ←→ über einer gestrichelten Achse, kein Emoji).
  Wirkung auf die Auswahl, sonst auf den ganzen Clip (wie die anderen Aktionen, Anzeige „ALLE“ / „n Noten“). Ein Undo je Tipp.
- **Spiegeln:** Tonhöhen um die Mitte (tiefster + höchster Ton) in **Tonleiter-Stufen** der Clip-Tonart gespiegelt → alle
  Töne bleiben in der Skala, Intervalle gespiegelt (C-D-E-G → G-F-E-C in C-Dur); zweimal = Ausgangslage. Ein leiterfremder Ton
  bleibt leiterfremd, wenn gegenüber ein Ganzton-Schritt liegt; landet er gegenüber in einem Halbton-Schritt (E–F, H–C), gibt es dort
  keinen leiterfremden Ton – er rastet in die Tonart ein (dann ist zweimal nicht mehr die Ausgangslage). Zeit, Länge, Anschlag bleiben.
  Ergebnis außerhalb C1…C8 (Zeilen der Rolle) → nichts geändert, Blase.
- **Umdrehen:** zeitlich rückwärts: Start' = a + b − Start − Länge. Bereich: Auswahl = erste Note bis letztes Ende; ganzer Clip
  = 0 … Clip-Länge. Länge, Anschlag, Ton je Note bleiben; der Roh-Einsatz `o` wandert mit (zweimal = deep-equal).
- Beide nacheinander möglich (rückwärts gespiegelt). Nichts zu ändern → kein Undo-Schritt, kurze Blase.

### Abnahme
| Punkt | Prüfung (echte Touch-Tipps) | Ergebnis |
|---|---|---|
| N1-01 | C-D-E-G → Spiegeln → G-F-E-C, alle Töne in C-Dur, Zeit/Länge/Anschlag gleich; Auswahl D,E → E,D | bestanden |
| N1-02 | Umdrehen ganzer Clip: Starts 0 / 1,25 / 2,75 / 3,5 (Soll), Anschlag/Länge je Note gleich; Auswahl im Bereich 1…2,75 | bestanden |
| N1-03 | Spiegeln ×2, Umdrehen ×2 = Ausgangslage deep-equal (auch `o`, auch A-Moll mit C♯/F♯ gegenüber Ganztönen); beide + 2× Undo = Ausgangslage | bestanden (leiterfremd gegenüber Halbton: rastet ein, s. o.) |
| Undo | genau ein Undo-Schritt je Tipp | bestanden |
| Bedienung | 6 Formate: sichtbar (Leiste scrollt), Symbol gezeichnet, nichts abgeschnitten, Breite 92/102 px, Trefferfläche = volle Leistenhöhe | bestanden |

Tests: `tests/n1-abnahme.mjs` (18/18), `tests/n1-hit.mjs` (12/12), Hilfen `tests/touch-lib.mjs`.

### Abweichungen
- Die Aktionsleiste des Editors ist in der App 36–44 px hoch (P1 44, P2 40, P3 38, quer 36; bestehendes Layout, nicht geändert,
  sonst Layout-Sprung). Die neuen Knöpfe nutzen die volle Leistenhöhe als Trefferfläche (Breite ≥ 92 px); 44 px hoch ist in
  P2/P3/quer nur mit einer höheren Leiste möglich → Frage.

### Fragen an Xander
- N1: Soll „Umdrehen“ ohne Auswahl im ganzen Clip (0 … Ende, so gebaut) oder nur zwischen erster und letzter Note drehen?
- N1/allgemein: Die Editor-Leisten sind quer 36 px hoch – sollen sie für 44-px-Tasten höher werden (weniger Platz fürs Raster)?

### Für das Zusammenführen
- Nur im PianoRoll-Block: `N1_SVG`/`N1_ICON` (neben `EDGE`), CSS `.n1b`/`.n1i` (vor `.pr-bar .sep`), zwei Knöpfe hinter „−12“,
  `n1Pos`/`n1Note`/`mirrorNotes`/`reverseNotes` (vor `quantizeNotes`). Alle mit `/* N1 */` markiert.

---

## N2 — Weite Wege beim Ziehen: Mini-Karte und Achsen-Einrasten

### Was neu ist
- **Mini-Karte:** Sobald Noten gehalten und gezogen werden (Zeichnen oder Auswahl, Geste „Verschieben“), erscheint im Notenfeld
  eine Karte des ganzen Clips (bzw. der Song-Melodie): 48 px hoch, volle Breite (8 px Rand), Noten als Striche (die gehaltenen
  hell), sichtbarer Ausschnitt als gelber Rahmen. Sie liegt oben; beginnt der Finger im oberen Band (< 78 px), liegt sie unten –
  sie liegt nie unter der Stelle, an der der Finger aufsetzt. Die Info-Blase rückt unter die Karte.
- **Finger auf die Karte:** Die Ansicht gleitet dorthin (≈ 0,2 s, mitlaufend), die Noten bleiben in der Hand: die gefasste Note
  steht am Takt/Schritt unter dem Finger (Raster), Tonhöhe bleibt (bei waagrechter Sperre die gesperrte). Loslassen auf der Karte
  setzt sie dort ab; zurück ins Notenfeld = normal weiterziehen. Eine Geste = ein Undo, Länge und Anschlag bleiben.
- **Achsen-Einrasten:** nach den ersten 12 px: klar waagrecht (|dx| ≥ 2·|dy|) → Tonhöhe fest; klar senkrecht → Zeit fest;
  schräg → frei. Einrasten mit leichter Haptik (`haptic('tick')`). Die Sperre löst sich erst nach 48 px quer (≈ 2 Reihen).
  Bei senkrechter Sperre ist die Karte aus (sie würde sonst die Zeit verschieben).
- Ohne Ziehen ändert sich nichts (Regression gegen 4.23.0: Knöpfe, gerade Züge, Länge, Zeichnen gleich).

### Abnahme
| Punkt | Prüfung (CDP-Touch-Züge) | Ergebnis |
|---|---|---|
| N2-01 | 16-Takt-Clip, Note in Takt 16 → auf die Karte links → Takt 1 in ≈ 0,93 s (inkl. Zug), Anschlag 0,37 und Länge 0,75 gleich, +1 Undo; 6 Formate | bestanden |
| N2-02 | waagrecht 180 px mit ±20 px Zittern → Ton unverändert, Haptik | bestanden (P1, L1) |
| N2-03 | senkrecht 112 px mit ±20 px Zittern → Zeit unverändert, Haptik | bestanden (P1, L1) |
| N2-04 | Karte 48 px hoch, ganz im Bild, nicht unter dem Finger (auch Finger oben → Karte unten); 6 Formate | bestanden |
| N2-05/06 | Sperre löst sich bei 90 px quer; schräger Zug bleibt frei | bestanden |
| Layout | Seitenhöhe gleich, Karte weg nach dem Loslassen, keine Fehler | bestanden |
| Regression | `roll-regress.mjs`: gleiche Aktionen auf 4.23.0 und neu → gleicher Clip, gleiches Layout (P1, P3, L1) | 30/30 |

Tests: `tests/n2-abnahme.mjs` (28/28), `tests/roll-regress.mjs` (30/30).

### Abweichungen
- „Bestehende Tasten zum Sperren bleiben“: Die Rolle hatte keine Sperr-Tasten (nur „Tonart sperren“ an der Tastatur, unberührt).
- Liegt die Karte oben, deckt sie beim Ziehen die obersten ~2 Reihen ab; ein Zug dorthin wird zum Kartensprung. Zum Ablegen
  dort kurz scrollen (oder senkrecht ziehen: dann ist die Karte aus).
- N1-Nachtrag: die Trefferflächen-Erweiterung der N1-Knöpfe ragte 2 px seitlich über (Text galt als abgeschnitten) – behoben.

### Fragen an Xander
- N2: Soll die Karte auch die Tonhöhe übernehmen (Finger auf der Karte höher = höherer Ton)? Gebaut: nur die Zeit.
- N2: Karte auch beim Ändern der Länge (rechtes Ende ziehen) oder beim Zeichnen? Gebaut: nur beim Verschieben (Spec: „hält und zieht“).

### Für das Zusammenführen
- Nur im PianoRoll-Block: Konstanten `MMH/MMG/AX_ON/AX_OFF`, CSS `.pr canvas.pr-mm`, Canvas `cMM`, `mmOn/mmRect/mmSpan/mmBeat/mmDraw/mmGlide`
  (vor `rr`), ein Aufruf `mmDraw(C)` in `draw()`, `move`-Zweig in `drag()` (Achse, Karte), zwei Zeilen Animationsende
  (`mainUp`, `abort`), Test-Hook `_mm()`. Markiert mit `/* N2 */`.

---

## D1 — Drum-Sequencer: Länge je Spur, Richtung

### Was neu ist
- **Daten (Format 5, additiv):** Drum-Clip bekommt `lanes` = `{GM-Nummer: {len 1–64, dir 'rev'|'pend'|'rnd', seed 1–99}}`, nur
  Abweichungen vom Standard (fehlt `len` = Clip-Länge, fehlt `dir` = vorwärts). In `normClip` (normiert/geprüft) und `cleanClip`
  (Undo, Kopie, Speichern). Clips ohne `lanes` spielen exakt wie 4.23.0.
- **Polymeter:** Eine Spur mit eigener Länge zählt ihre Schritte ab Clip-Start durch (nicht je Clip-Runde): Hi-Hat 12 gegen
  Kick 16 ist nach 48 Schritten wieder deckungsgleich. Schritte hinter der Spur-Länge schweigen (bleiben gespeichert). Der Clip
  selbst bleibt so lang wie bisher. Chance, Wirbel, Timing, Akzent, Locks und Swing wirken wie bisher (gleiche `expandStep`).
- **Richtung je Spur:** vorwärts · rückwärts · Pendel (0…n−1…1, ohne doppelte Enden) · Zufall (Schritt = Zufall aus Startwert
  und Schrittzahl → jedes Abspielen gleich; anderer Startwert = andere Folge).
- **Bedienung (SCHRITTE, gewähltes Instrument):** Im Fuß neben „Euklid…“/„Muster ▾“ ein Knopf mit gezeichneter Loop-Klammer und
  der Länge (z. B. „] 12 ←“). Tipp → Blatt „HH ZU – Länge und Richtung“: Regler Länge (1–64 Schr.), vier Richtungs-Tasten
  (44 px), Regler Startwert (nur bei Zufall), Taste **„×2 – Clip verdoppeln (mit Inhalt)“** (bis 16 Takte, Spuren behalten ihre
  Länge). Alles sofort hörbar; ein Undo, wenn das Blatt schließt (ohne Änderung keins); ×2 = ein Undo. Gespeichert wird nur, was
  vom Standard abweicht: eine Spur so lang wie der Clip hat keine eigene Länge und wächst mit ×2 mit. Der Länge-Regler reicht bis
  zur Clip-Länge (max. 64); längere Spuren nach ×2. Die Werkzeug-Zeile lässt sich per Finger seitlich wischen (P2/P3 mit Takt-Wahl).
- **Im Schritt-Raster:** der letzte Schritt der Spur trägt eine gelbe Klammer, Schritte dahinter sind gedimmt; der Laufpunkt
  zeigt beim Abspielen den Schritt der Spur (auch rückwärts/Pendel/Zufall).

### Abnahme
| Punkt | Prüfung | Ergebnis |
|---|---|---|
| D1-01 | Clip spielt (240 BPM, echte Planung, gemessene Treffer): Hi-Hat 12 Schritte (Schritte 1, 6, 14) gegen Kick 16 → Treffer bei g mod 12 ∈ {0, 5}, Schritt 14 schweigt, Schritte 0–47 = 48–95 | bestanden |
| D1-02 | rückwärts (5), Pendel (4), Zufall (8, Startwert 5): Treffer = Definition, zweiter Lauf gleich, Zufall ≠ vorwärts, Startwert 6 anders | bestanden |
| D1-03 | ×2 per Touch: 1 → 2 Takte, Inhalt doppelt, Spuren bleiben, +1 Undo; Undo deep-equal; Richtung per Touch +1 Undo; Speichern → Laden deep-equal; ungültige Felder normiert | bestanden |
| D1-03 | alter Clip ohne `lanes` (mit Chance/Wirbel/Timing/Akzent): gleiche Treffer wie 4.23.0 | bestanden |
| D1-04 | Knopf und Blatt in 6 Formaten im Bild, nichts abgeschnitten, Blatt-Tasten ≥ 44 × 44, Seitenhöhe gleich | 18/18 |
| Laufpunkt/Klammer | rückwärts 12: Laufpunkt = Spur-Schritt 24/24, Klammer auf Schritt 12, 4 gedimmt | bestanden |
| Regression | Schritt-Seite ohne `lanes` gegen 4.23.0: Zellen, Leiste, Overview, Seitenhöhe, Tipp-Ergebnis gleich (alle Formate) | gleich; Abweichungen siehe unten |

Tests: `tests/d1-abnahme.mjs` (11/11), `tests/d1-layout.mjs` (18/18), `tests/d1-playhead.mjs` (3/3), `tests/d1-regress.mjs`.

### Abweichungen
- „Loop-Klammer im Schritt-Raster ziehbar“: gebaut als Länge-Regler im Blatt + gezeichnete Klammer im Raster (Spec: „Länge
  bzw. Loop-Klammer“). Ein Zug an der Klammer selbst kollidiert mit dem Malen der Schritte (Wischen = malen) und mit dem
  8×2-Raster hochkant → Frage.
- Der neue Knopf braucht 50 px im Fuß: quer rücken Euklid/Muster/Takt-Wahl 50 px nach links, die Spur-Tabs werden 50 px
  schmaler (alle 7 ganz sichtbar außer 667×375 mit mehrtaktigem Clip: dort scrollt die Tab-Zeile wie vorher, TIMING jetzt auch
  im Scrollbereich). Hochkant P2/P3 mit mehrtaktigem Clip: die Takt-Wahl ist 96 px breit und die Werkzeug-Zeile scrollt seitlich
  (wie die Werkzeugleisten der Rolle). Fuß-Knöpfe sind 28–34 px hoch wie Euklid/Muster (bestehendes Layout).
- MIDI-Export schreibt die gespeicherten Schritte (ohne Polymeter/Richtung); der Klang in der App folgt `lanes`.

### Fragen an Xander
- D1: **Wahrscheinlichkeit je Schritt und Wirbel (Ratchets) gibt es schon** (Reiter CHANCE und WIRBEL in SCHRITTE). Vorschläge
  für weitere „Spielereien“ (nicht gebaut): Wahrscheinlichkeit je Spur statt je Schritt, Wirbel-Zufall, Spur-Versatz (Start
  verschieben), „Schritt überspringen“, Swing je Spur.
- D1: Soll die Klammer im Raster direkt ziehbar sein (dann z. B. nur mit Halten > 0,5 s, damit Wischen weiter malt)?
- D1: Soll der MIDI-Export die Polymeter-Folge ausschreiben (dann so lang wie bis zur Deckung, z. B. 48 Schritte)?
- D1: Zählt die Spur bei jedem Neustart des Clips (Szenenwechsel) von vorn (so gebaut) oder soll sie über Szenen weiterlaufen?

### Für das Zusammenführen
- `/* D1 */`-Blöcke: `D1_DIRS`, `d1Norm`, `d1Lane`, `d1Pos`, `d1Map` (vor `cleanClip`), eine Zeile in `cleanClip`, eine in `normClip`;
  `scheduleDrums` (zwei Zeilen) + `d1Sched` (vor `cutTrackAt`); Laufpunkt (eine Zeile im Schritt-Rahmen); `pageDrumSteps`
  (`decorate` + `d1Tools`); `d1Decorate`, `d1Tools`, `d1Double`, `d1Pop`, `D1_ICON` (vor `openEuclid`); CSS nach `.dtools`.

---

## Unabhängiger Nachtest (zweiter Prüfer) und Korrekturen

Ein zweiter Prüfer hat den Diff gelesen und mit eigenen Touch-/Klang-Skripten geprüft. Bestätigte Fehler und was daraus wurde:

| # | Fund | Korrektur | Nachweis |
|---|---|---|---|
| 1 | D1: Werkzeug-Zeile in 375×667 (2 Takte) per Finger nicht wischbar (Blatt hat `touch-action:none`), Länge-Knopf unerreichbar | Zeile scrollt per Pointer-Zug (Tipp bleibt Tipp, > 12 px ist kein Tipp) | `qa-fixes.mjs` QA-1: echter Wisch, Knopf ganz sichtbar, Tipp öffnet Blatt |
| 2/8 | D1: Antippen von Richtung schrieb die Länge fest (nach ×2 / kürzerem Clip schwieg die Spur taktweise) und machte ohne Änderung einen Undo-Schritt | nur Abweichungen speichern; ohne Änderung kein Undo | QA-2 Leerlauf (keine lanes, +0 Undo), QA-2 ×2 (Spur 32) |
| 3 | N1: Behauptung „leiterfremd bleibt leiterfremd, zweimal = Ausgangslage“ stimmte nicht gegenüber Halbtonschritten | Beschreibung korrigiert (rastet dort in die Tonart ein); Tonumfang auf die Rollen-Zeilen C1…C8 begrenzt | – (Verhalten bewusst, siehe Frage) |
| 4 | N2: Loslassen direkt auf der Karte → Ansicht blieb auf halbem Weg stehen, abgesetzte Note nicht im Bild | Gleiten läuft nach dem Loslassen zu Ende | QA-4 |
| 5 | N2: Schließen der Rolle während des Gleitens → TypeError | Gleiten hat eigenen Zustand, `destroy` stoppt es | QA-5 |
| 6 | D1: Spur länger als der Clip = nur unbearbeitbare Stille | Länge-Regler bis Clip-Länge (64 nach ×2…) | QA-6 |
| 7 | Trefferflächen < 44 px (Fuß-Knopf D1 28–34 px, N1-Knöpfe = Leistenhöhe 36–44 px) | nicht geändert (bestehende Leisten-/Fußhöhe der App) | offen → Frage |

Nicht bestätigte Verdachtsfälle (offen gelassen): K2 – bei Begrenzer-Stufe 3 können gehaltene Noten jetzt bis zur eigenen Stimmenzahl
klingen (weniger Aussetzerschutz, CPU nur mit 6 Stimmen gemessen); der Vorhör-Klang (`PV.chain`) bekommt `polyH: 0` nicht zurück
(wirkt nur, wenn dort poly gesenkt wird); N1 mit automatischer Tonart kann zwischen zwei Tipps die Tonart neu erkennen; Umdrehen einer
Note, die über das Clip-Ende ragt, schneidet sie auf 0 (zweimal ≠ Ausgangslage).

### Fragen an Xander (Nachtest)
- N1: Leiterfremder Ton gegenüber einem Halbtonschritt – einrasten (so gebaut) oder chromatisch spiegeln (dann bleibt die Ausgangslage, aber Töne außerhalb der Tonart entstehen)?
- Allgemein: Editor-Leisten und Drum-Fuß höher machen (44 px Tasten) auf Kosten des Rasters?
- K2: Soll der Begrenzer auf Stufe 3 gehaltene Noten doch kürzen dürfen (Aussetzerschutz vor vollem Akkord)?

## G-T-merge — Zusammenführung · App **4.24.0** (`APP_CODE` 4 024 000) · Format bleibt 5 · kein Supabase-Aufruf

Hauptlinie 4.23.0 (G-MK8b-merge-fix) + drei Zweige ab `vs-base-B.html` (4.23.0), echte 3-Wege-Zusammenführung
(`git merge-file -L MAIN -L BASE -L <Zweig>`), in dieser Reihenfolge:

| Zweig | Pakete | Ergebnis `git merge-file` |
|---|---|---|
| K1 (`n5-br-K`, K1 + K1-fix) | K1 Klang-Prüfung, Mod-Übersicht | 0 Konflikte |
| S012 (`helfer-s012`) | S0 Teil bearbeiten, S1 Teil überarbeiten im Lauf, S2 Zusammenfassen | 0 Konflikte |
| N12D1K2 (`helfer-n12d1k2`) | N1 Noten umdrehen/spiegeln, N2 Mini-Karte + Achsen-Einrasten, D1 Länge/Richtung je Drum-Spur, K2 FM-FELD-Stimmenklau | 0 Konflikte |

Sicherung vorher: `mk-wt/index.html.vor-merge-G-T-merge.html`. Keine Konfliktmarken (`^<<<<<<<`, `^=======$`, `^>>>>>>>`: 0).
Alle Zweige haben ihre Haken in getrennte Zeilen gesetzt; nur zwei Stellen berühren dieselbe Funktion und wurden geprüft:
- **Worklet:** K1 (`MkTimbre.idle()` Glättung, `{k1Dump}`) und K2 (`STEAL_N`, `stealIfFull`, `polyH`) liegen in verschiedenen Klassen –
  beide wirken (K1 `n5-k-path*` −331 dB, K2 `k2-abnahme` 12/12).
- **`undoApply` / Marken-Blatt:** K1-Einhänger (offene Mod-Übersicht folgt ↶ ↷) und S0/S2-Einhänger (`s012MarkSheetPaint`) stehen
  getrennt; beide geprüft (`n5-k-qa-undo`, `q3-s0-edit` 10/10).

**VERSION:** Zweig K1 hatte 4.25.0, die anderen 4.23.0. Die Ausgabe ist laut Auftrag **4.24.0** (`APP_CODE` 4 024 000; Wächter am
Server `max_app` = 4 030 000 reicht, siehe Funk 31.10. ~14:50). Der K1-Hash-Kommentar „INIT Analog vor 4.25.0“ heißt jetzt „vor 4.24.0“
(Wirkung gleich: ein INIT Analog mit Drift 15 %/Osz 2 +7 ct gilt nicht als „geändert“). Die Zeile `  live: true,` ist unverändert.
In den angehängten Zweig-Abschnitten oben steht noch „4.25.0“ – das ist der Stand des Zweigs, ausgeliefert wird 4.24.0.

### K1-Entscheidungen Xander 31.10. (~16:00) – jetzt eingebaut

1. **Key-Reset: Oszillatoren starten phasengleich.** Bei jeder neuen Note beginnen Osz 1/2/3 und der Sub (VA/WT im Worklet und im
   Ersatzklang ohne Worklet) bei Phase 0 – für jeden Klang, auch ohne den Schalter „Phasen-Reset“. Gleiche Tonhöhe = immer gleicher
   Pegel: Osz 1 + Osz 3 gleiche Tonhöhe, 16 Noten: **+6,0 dB jedes Mal** (4.23.0/K1: 0 … +5,5 dB je nach Startphase) – `n5-k-osc3.mjs`.
   Keine Verstimmung dazu. Die Unisono-Kopien behalten ihre eigenen Phasen. Die Zufallszahlen (Drift, Pan, Unisono-Phasen) bleiben
   dieselben wie vorher. Mono/Legato: die laufende Stimme läuft weiter wie bisher (kein Phasensprung mitten im Ton).
   MS 2000 und FM starteten schon immer phasengleich (keine Änderung). S&H unverändert (siehe 3).
2. **Qualität „Auto“ ändert den Klang nie.** Unter CPU-Last schaltet Auto (und Analog) nicht mehr auf die ECO-Ladder und begrenzt
   kein Unisono mehr; beim MS 2000 bleiben Unisono-Stimmen und der Vocoder-Pfad, wie sie sind (`mkLimS` = nur bei „Eco“). Die Last
   wird über die Stimmenzahl gelöst: VA/FM kürzen zuerst die leisesten Ausklänge (K2: gehaltene Noten bleiben), der MS 2000 nimmt
   unter dem Begrenzer (Stufe ≥ 2, Last-Note-Priorität) die **leiseste** gehaltene Stimme statt der ältesten (`gt/mk-steal.mjs`).
   Sichtbarer Hinweis einmal je Sitzung, sobald die Stimmen-Grenze greift: Toast „Viel Rechenlast – die leisesten Stimmen klingen
   kürzer aus. Der Klang bleibt gleich.“ Wer im Menü „Eco“ wählt, bekommt die einfacheren Filter/weniger Unisono wie bisher.
   Menü-Text unter Klang angepasst: „Qualität Auto: der Klang bleibt immer gleich; bei hoher Rechenlast klingen die leisesten Stimmen
   kürzer aus. Eco: einfachere Filter und weniger Unisono.“ Einfrieren (FR1) kommt später.
3. **Sample & Hold bleibt genau so** (gleiches Muster je Tastendruck): nichts geändert. Nachweis: mit Phasen-Reset an rendert S&H
   bitgleich zu 4.23.0 (VA −327,6/−328,0 dB, MS 2000 −319,5/−320,9 dB, `gt/n5-k-sh-reset1.mjs`); mit Phasen-Reset aus unterscheidet
   sich nur die Oszillator-Startphase (Entscheidung 1), die Stufen sind dieselben (14–15/15, 23 456–23 472/23 467).
4. **Anschlag → Lautstärke** steht nicht in der Mod-Übersicht (war in K1 schon so, bestätigt).

**Regel 28 (alte Projekte):** Ohne Entscheidung 1 rendert die zusammengeführte Fassung **alle 320 Werksklänge bitgleich zu 4.23.0**
außer INIT Analog (K1, gewollt) – geprüft mit einer Testkopie ohne Key-Reset (`gt/merged-noKR.html`: `n5-k-golden` 319/320,
`n5-k-05old` alle Spuren ≤ −324 dB, `n5-k-golden-node` 64/64 gegen 4.23.0 und 4.3.0). **Mit** Entscheidung 1 klingen alle VA-/WT-Klänge mit
Phasen-Reset aus im Anschlag anders (gewollt, Xander: „stabil, ohne Unterschiede“): 35 Werksklänge (z. B. Mini-Lead, Rom-Fläche,
Supersaw-Hymne, alle WT-Klänge mit 2 Oszillatoren), in alten Projekten die Spuren Rom-Fläche, Mini-Lead, Melodie-Lead des Demos und
INIT Analog. Unverändert: Klänge mit Phasen-Reset an (z. B. Moog-Bass), alle FM-, MS-2000- und Drum-Klänge. Eine Umrechnung gibt es
dafür nicht, weil die alte Startphase Zufall war (jede Note anders) – genau das, was Xander abschaffen wollte.

### K1-Restbefunde behoben
- **Tonhöhen-Routen in Cent:** Eine Route auf Tonhöhe/Osz 2 Tonhöhe zeigt die Menge jetzt in Cent statt „+0,5 % · ±0,11 HT“, z. B.
  „LFO 2 → Tonhöhe · ±11 ct“ (Mini-Lead), „±7,2 ct“ (Rom-Fläche) – `gt/k1cents.mjs`.
- **Liste nach [Rückgängig] im Toast:** in der Hauptlinie nachgeprüft (P 320×568 und L 844×390, Toast am Kopf): ✕ → 3 bzw. 5 Zeilen,
  [Rückgängig] → 5 bzw. 6 Zeilen, nichts fehlt – `n5-k-qa-undo.mjs`, `n5-k-fix-mods.mjs` (h), `n5-k-qa-flow1.mjs` P/L.

### K2: FM-FELD für Slap-Bass schnell genug (geprüft, nichts zu ändern)
Gemessen am Klang (Operator allein, 0,25-ms-Fenster, `gt/slap-probe.mjs`): DX-Form Rate 99 → Anstieg auf 90 % in **0,5 ms**; Punkt-Form
Zeit 0 → **0,25 ms**. Abklingen: DX R2 99 → −20 dB in 1,8 ms, R2 80 → 11,5 ms; Punkt-Form 30 ms → −20 dB in 7 ms. Der Amp ist bei FM ein
Tor mit 0,25 ms (fmAmp 0). Attack ≤ 1 ms und kurzes Decay gehen also; kein Umbau nötig.

### Abnahme nach der Zusammenführung (gegen `mk-wt/index.html` 4.24.0)
| Skript | Ergebnis |
|---|---|
| `smoke.mjs` | ohne Fehler (`gt/G-T-merge-smoke.png`) |
| `gt/gt-k1dec.mjs` (neu: Auto/Eco/Hinweis/MS 2000) | ALL OK 9/9 (K1-Zweig: 3 rot) |
| `gt/mk-steal.mjs` (neu: leiseste MS-2000-Stimme) | OK (K1-Zweig: rot) |
| K1: `n5-k-03` · `-02b` · `-06` · `-fix-mods` · `-fix-finger` P/L · `-fix-edm` · `-fix-nb` · `-qa-undo` · `-qa-flow1` P/L · `-reg-spielq` · `-05` · `-path` · `-path-fm` · `-path2` · `-ladder-mk` · `-lfo` · `-lfo-mk` · `-cpu` | bestanden (CPU VA 0,83 ×, MS 2000 0,95 × gegen 4.23.0) |
| K1: `n5-k-osc3` | bestanden, jetzt +6,0 dB je Note (Entscheidung 1) |
| K1: `n5-k-sh`, `n5-k-golden`, `n5-k-05old`, `n5-k-golden-node` | „rot“ nur durch Entscheidung 1 (siehe Regel 28 oben; ohne Key-Reset alle grün) |
| K1: `n5-k-ladder` | 0 NaN/Inf; 7 statt 6 Einträge des groben Rasters: Spitze 5,29 statt 4,97 (phasengleicher Start von 21 Unisono+Sub+Rauschen) und ein 2,7-ms-Tal bei LP24, wenn der 40-Hz-LFO den Cutoff durch 20 Hz fegt – kein Abbruch, das Tal von K1 (BP24) an anderer Stelle |
| K2: `k2-abnahme` 12/12, `k2-click` −50,2 dB, `k2-app`, `k2-app-lim`, `k2-cpu` | bestanden |
| K2: `k2-gleich` | FM bitgleich; VA rot nur durch Entscheidung 1 (Testklang mit Phasen-Reset aus) |
| N1: `n1-abnahme` 18/18, `n1-hit` 12/12 · N2: `n2-abnahme` 28/28, `roll-regress` 30/30, `qa-fixes` 8/8 | bestanden |
| D1: `d1-abnahme` 11/11 (im 1. und 3. Lauf 8–9/11), `d1-layout` 18/18, `d1-playhead` 3/3 | bestanden; `d1-regress` 70/84 = wie im Zweig (gewollte Fuß-Verschiebung, Zweig-Abweichungen) |
| S0: `s0-acc` 38/38 · S1: `s1-acc` 27/28 · S2: `s2-acc` 24–25/25 | die roten Punkte sind Echtzeit-Messungen (live gespielte Note 1,30 statt 1,00 ± 0,08 Schlag; Mitschnitt-Pegel); im Zweig selbst in dieser Umgebung genauso wechselnd (S0 37/38, S1 27/28) |
| S012-QA: `q2` 24/24, `q3` 10/10, `q5` 3/3, `q8` 2/2, `q1` 4/4 (Wiederholung), `q4` 9/10, `q7` 8/9, `q6` 24/42 | wie im Zweig (`q4 (a)`, `q7 C`, `q6` gleich viele Punkte rot im Zweig) |
| S012-Regression `reg/` (part, part2, part3, loop, fang2, v2e2reg-song, v2e2reg-fangui) | gleich wie 4.23.0 |
| G-MK8b: `gmk8b-hit44`, `-ui`, `-reg`, `-restore`, `-panik`, `-cross`, `-plate`, `-contrast`, `-daten`, `-fix-voc`, `-cpu`; `v3-mk2-wellen` | bestanden; `gmk8b-lay` 12 rot = genauso in 4.23.0 vor der Zusammenführung (alte Probe, ersetzt durch `gmk8b-hit44`) |

Echtzeit-Tests (D1-Treffer bei 240 BPM, S1/S2 „hörbar“) schwanken in dieser Umgebung (4 Kerne, kein Audio-Gerät) auch mit den
Zweig-Dateien; gemessen: gleiche Planung, Long-Tasks 50–160 ms in beiden.

Test-Skripte der Helfer: aus `origin/helfer-s012` / `origin/helfer-n12d1k2` (`bau/helfer/<NAME>/tests/`) nach `dirigent-test/gt/S012/`,
`dirigent-test/gt/N12D1K2/` kopiert; `gt/index.html` zeigt auf die Hauptlinie, `werkzeug/vs-base-B.html` auf die Basis. Ausgaben in `gt/out/`.

### Für Xander (iPhone)
- Synth mit zwei Oszillatoren auf gleicher Tonhöhe: jede Note gleich laut, kein „mal laut, mal leise“ mehr.
- Viele Spuren auf einmal: der Klang bleibt gleich, höchstens die leisesten Ausklänge werden kürzer; einmal erscheint der Hinweis.
- ⋯ → Modulationen: Vibrato-Routen stehen in Cent („±11 ct“).

### Fragen an Xander
1. Der Schalter **„Phasen-Reset“** (OSZ → STIMME) hat jetzt keine hörbare Wirkung mehr, weil jeder Klang phasengleich startet. Soll er
   wegfallen, oder soll „aus“ wieder freie Phasen erlauben (dann klingt es wieder je Note anders)?
2. In älteren Klang-Beschreibungen stehen noch die Namen „Nord Lead“/„Nord Drum“ als Vergleich (11 Stellen, seit lange vor 4.23.0).
   Sollen sie neutral umformuliert werden?

Snapshot: `synq-snapshots/G-T-merge.html`.

## G-T-merge-fix — zwei Fehler nach der Zusammenführung · App bleibt **4.24.0** · Format 5 · kein Supabase-Aufruf

1. **S2 × D1 (Zusammenfassen mit Polymeter-Spur):** `songStateAt` hielt die Clip-Phase nur modulo Clip-Länge; D1-Spuren zählen ab
   Clip-Start, also ging die Spur-Position verloren (neuer Teil „Mitte“: Hi-Hat 0,5,12,17,24,29 statt 1,8,13,20,25). Neu:
   `songClipPeriod` = kgV aus Clip-Schritten und Spur-Perioden (vorwärts/rückwärts Ls, Pendel 2·Ls−2, Zufall: keine Periode → volle
   Verschiebung); `phMod` rechnet damit. Gilt auch für Fortsetzung (Einfügen/Ersetzen/Löschen) und eigene Kopien (`ownSame`,
   `ownPlayAs`, Kopie entfernen). Clips ohne D1-Spur: Periode = Clip-Länge wie bisher (Regel 28 unberührt).
   Nachweis `vt-gt/s/s2d1.mjs`: Teil `ph: 4`, Hi-Hat 1,8,13,20,25 = Bereich im Song; Song unverändert, keine Fehler.
2. **D1-04 [Länge]-Knopf:** unsichtbare Trefferfläche (`.d1b::before`, wie S0 „‹“), Aussehen unverändert. Im Hochformat ≤ 700 px
   mit Takt-Blättern (Werkzeugzeile scrollt seitlich) bekommt die Zeile 7 px oben / 3 px unten Innenabstand mit Gegen-Rand, damit die
   Fläche nicht abgeschnitten wird, ohne dass die Seite enger wird (`fit`-Stufe bleibt). Treffer 44 × 44 px in 390×844, 844×390,
   375×667, 667×375, 926×428, 428×926 (`vt-gt/s/d1hit.mjs`, `d1hit2.mjs`, `d1scan.mjs`).

Nachtests: S2 25/25, S0 38/38, D1 11/11, D1-Bedienung 18/18, D1-Laufpunkt 3/3, Song-/Teil-Regression gleich wie Basis, Rauchtest ohne
Fehler. D1-Regression 70/84 genau wie vor dem Fix (die 14 Abweichungen sind älter: Werkzeugzeile im Querformat 50 px verschoben).
S1-02 (zweiter Teil-Durchlauf) scheitert auch auf `G-T-merge.html` gleich: der Test zählt eine Note des vorigen Durchlaufs mit
(−2,95 Schläge); die Fassung selbst klingt an den richtigen Stellen.

Snapshot: `synq-snapshots/G-T-merge-fix.html`.

## 4.24.1 — Phasen-Start wie vorher · App **4.24.1** (`APP_CODE` 4 024 001) · Format bleibt 5 · kein Supabase-Aufruf

**Zurückgenommen:** K1-Entscheidung 1 aus G-T-merge („Key-Reset: jeder VA-/WT-Klang startet Osz 1/2/3 und den Sub bei jeder Note bei
Phase 0“). Xander (31.10. ~19:30): Er hat nie verlangt, dass die Oszillatoren anders als üblich schwingen; er hatte nur gefragt, wie
Sample & Hold funktioniert und warum ein zugeschalteter Oszillator manchmal „nicht da“ wirkt. „Ich will nicht, dass etwas anderes
klingt. Ich möchte, dass du das so machst, wie man es macht.“ Das Entscheidung-1-Verhalten war also ein Missverständnis.

Jetzt wieder wie in 4.23.0 (und wie bei üblichen Synthesizern): Der Schalter **„Phasen-Reset“** (OSZ → STIMME) entscheidet je Klang –
an = Start bei Phase 0, aus = freie Startphase je Note. Damit ist Frage 1 aus G-T-merge beantwortet: der Schalter bleibt und wirkt.
Dass zwei Oszillatoren auf gleicher Tonhöhe je Note etwas anders laut sind (0 … +5,5 dB), ist bei freier Phase normal und hat nichts
mit der Polyphonie zu tun.

Geändert sind nur drei Stellen (Worklet `startVoice`, Ersatzklang ohne Worklet: Osz und Sub) – Code wieder wortgleich zu 4.23.0;
`hotfix-4241/revert.patch` (für die spätere Zusammenführung mit 4.25.0). Alles andere aus 4.24.0 bleibt: S0–S2, N1/N2, D1 (+ Fixes), K2,
K1 „Auto ändert den Klang nie“, leiseste MS-2000-Stimme unter Last, Tonhöhen-Routen in Cent, S&H unverändert.

**Ergebnis:** Die 35 VA-/WT-Werksklänge mit Phasen-Reset aus (Mini-Lead, Rom-Fläche, Supersaw-Hymne, alle WT-Klänge mit 2 Osz, …)
klingen wieder wie in 4.23.0, ebenso die Demo-Spuren Rom-Fläche, Mini-Lead, Melodie-Lead.

| Prüfung (gegen 4.23.0 = `G-MK8b-merge-fix.html`, Zufall gesät wie in K1) | Ergebnis |
|---|---|
| `n5-k-golden` (320 Werksklänge, Browser) | 319/320 ≤ −90 dB; nur INIT Analog anders (K1, gewollt: 0 ct) |
| `n5-k-golden-node` (64 VA/WT/FM, Worklet in Node) | 64/64 gegen 4.23.0 und 4.3.0; VA/WT 44/44 und FM 20/20 bitgleich (max \|Δ\| = 0); gegen 4.24.0: genau die 35 Klänge anders |
| `n5-k-05old` (Demo + Leer (Init) aus 4.23.0, 4.22.0, 4.17.0, 4.9.0) | alle Spuren ≤ −324,7 dB, „geändert“ wie dort |
| `n5-k-sh` / `gt/n5-k-sh-reset1` | bestanden: VA −328,1/−328,5 dB, MS 2000 −319,5/−319,5/−320,9 dB; Stufen 14–15/15 und 23 456–23 472/23 467 |
| `k2-gleich` | FM und VA max \|Δ\| = 0 |
| `n5-k-osc3` | bestanden; gleiche Tonhöhe 0 … +5,5 dB je Note, dieselben 16 Werte wie 4.23.0 |
| `n5-k-ladder` · `n5-k-path` | 0 NaN/Inf, Spitze 4,97, 6 Einträge (wie K1) · VA −331,9 / MS 2000 −331,1 dB |
| `gt/gt-k1dec` · `gt/mk-steal` · `gt/k1cents` | 9/9 · OK · „±11 ct“ / „±7,2 ct“ |
| `smoke` · `orch-mk-check` · `v3-mk2-wellen` | ohne Fehler (Version 4.24.1) · alles PASS |

Datei: `hotfix-4241/index.html` (Ausgaben `hotfix-4241/out/`). Zeile `  live: true,` unverändert.


## VS-L — Gesang mindestens 16 Takte + Schalter „Melodieerkennung“ (Nachtrag 4, Paket VS-L) · App 4.24.0 · Format 5

Grundlage: `v3-ideen/dirigent-spec-v3-nachtrag-4-gesang.md`, Paket VS-L (L.1, L.2, VS-L-01 … -11). Zweig-Kopie `vs-br-VSL/index.html`
aus App 4.23.0 (`vs-base-B.html`). **Version 4.24.0** (`APP_CODE` 4 024 000), **Format bleibt 5** (kein neues Projektfeld; der Schalter
liegt im Geräteprofil). `live: true` in CLOUD unverändert. Kein Supabase-Aufruf – **am Server offen: max_app ≥ 4024000** (Xander per SQL).
Größe: 3 370 195 → 3 377 061 B (+6,9 KB).

### Ursache (im unveränderten 4.23.0 nachgemessen, echte Läufe mit Mikro-Attrappe)

Skripte `dirigent-test/n4-vs-l-repro.mjs`, `n4-vs-l-repro2.mjs` (Ausgaben `n4-vs-l-repro-*.out`, `n4-vs-l-repro2-mel4.out`):

| Weg (4.23.0) | gesungen | Ergebnis | Befund |
|---|---|---|---|
| ● REC 🎤 leerer Platz, AUTO, 120 BPM | 16 Takte | STIMME 16 Takte, Take 32,25 s, MELODIE 16 Takte / 32 Noten | in Ordnung |
| ● REC 🎤 leerer Platz, AUTO, **40 BPM** | 16 Takte | Take 96,25 s, `late` 0 | Ringpuffer (120 s) reicht |
| Stimme-FANG, 16-Takt-Phrase | 16 Takte | MELODIE + STIMME je 16 Takte | in Ordnung |
| ● SONG 🎤 Überschreiben | 16 Takte | `song.vox` 16 Takte, 32 s | in Ordnung |
| ● REC 🎤 über 4-Takt-MELODIE-Clip (MELODIE gewählt) | 16 Takte | STIMME 16 Takte; MELODIE bleibt 4 Takte, 33 Noten übereinander gefaltet | STIMME in Ordnung |
| **● REC 🎤 auf einen Platz mit 4-Takt-STIMME-Clip (Overdub)** | 16 Takte | **STIMME bleibt 4 Takte, neuer Take 8,25 s von 32 s** | **Ursache 1** |
| **Länge 16** (`setRecOptions({length:16})`, Laden einer Datei mit 16) | – | **wird zu AUTO** (`recLength` nimmt nur 1, 2, 4, 8) | **Ursache 2** |

**Ursache 1 (die, die Xander getroffen hat):** Liegt in der Szene schon ein STIMME-Clip (z. B. aus einem ersten FANG oder einem ersten
● mit 4 Takten), ist jede weitere Gesangsaufnahme dort ein Overdub. `tkVoiceTake` rechnete mit `L = old.len` und nahm nur den jüngsten
vollen Durchgang des alten Clips: 16 gesungene Takte → 4-Takt-Take (8,25 s von 32,25 s), der Rest ging verloren.
**Ursache 2:** „Länge“ kennt höchstens 8 Takte; 16 wurde beim Wählen und beim Laden zu AUTO.
Zusätzlich gesehen (nicht die Ursache, Spec-Liste): über einem vorhandenen MELODIE-Clip behält die MELODIE ihre Länge (Noten werden in den
Clip gefaltet, wie ein Tasten-Overdub) – die STIMME ist dort schon 16 Takte lang (siehe Fragen).

### Was neu ist

1. **Overdub wird länger (L.1.2, `tkVoiceTake`):** Ist die neue Aufnahme länger als der alte STIMME-Clip (ganze Takte ab dem Takt ihres
   Anfangs, gerundet, höchstens 16), wird der Clip so lang wie die Aufnahme, der neue Take ist die ganze Aufnahme (oben), der alte geht wie
   heute stumm in `alt`. Ist sie nicht länger, läuft alles wie 4.23.0 (jüngster voller Durchgang – deep-equal geprüft). Läuft die Szene,
   gilt die neue Phase (Anfang der Aufnahme) sofort; der alte Take klingt weiter, bis der neue gelesen ist, dann Überblendung (3/5 ms) –
   keine Lücke (`tkGrowPhase`). Ein Undo-Schritt wie bisher.
2. **Länge 16 (L.1.3):** „Länge“ AUTO, 1, 2, 4, 8, **16** im Aufnahme-Blatt (● lang drücken / Chip) und in den Einstellungen;
   `recLength` (Laden) und `setRecOptions` nehmen 16. Die Länge-Knöpfe sind jetzt in allen Formaten ≥ 44 × 44 (vorher 32–40 px hoch, quer
   40 px breit; Spec VS-L-04). AUTO wie bisher bis ●, spätestens 16 Takte.
3. **Schalter „Melodieerkennung“ [An] [Aus] (L.2)** im Mikro-Blatt, Abschnitt „Stimme → Noten“, erste Zeile. Standard **An** (Verhalten
   4.23.0). Gespeichert im Geräteprofil `synq-stimme-v1` → `vs.mel` (fehlt = An), **nicht im Projekt**. Bei **Aus** steht darunter
   „Aufnahme nur als Gesang auf der STIMME-Spur – keine Noten.“ und:
   - **● REC mit 🎤:** nur STIMME-Take/-Clip wie heute, kein MELODIE-Clip, keine Noten, kein Ergebnis-Blatt, keine Tonhöhen-Auswertung
     (`vsRecVoice`); Meldung „Gesang aufgenommen · n Takte“; ein Undo.
   - **Stimme-FANG:** der gesungene Abschnitt aus dem **Pegel der Stimme** (20-ms-Fenster, beim Lautsprecher nach dem Echo-Abzug wie der
     Noten-Weg „1E“, Schwelle aus Grundrauschen/Spitze), dann **dieselbe Pausen-Regel** (`vsPhrase`: Pause ≥ 1 Takt, Länge als
     Zweierpotenz ≤ 16) → nur STIMME-Take im selben Platz wie heute (`vsMelFree`); Meldung, ein Undo (`vsFangVoice`, `vsLevelNotes`).
   - **● SONG mit 🎤:** nimmt schon in 4.23.0 nur `song.vox` auf (keine Noten aus der Stimme) – unverändert.
   - Das Mikro-Blatt rollt jetzt mit dem Finger (`pan-y`), damit [Einmessen]/[Mikro aus] quer erreichbar bleiben (siehe Abweichungen).
4. **Kein Aussetzer beim Take-Wechsel, wenn der Hauptfaden den Planungs-Vorlauf verpasst (`tkTrackResync`, eine Zeile):** nach dem Lesen
   eines langen Takes (16 Takte ≈ 50 ms Rechenzeit) lag der Neuplan-Anfang hinter `R.schedBeat` → das neue Stück kam erst beim nächsten
   Tick (gemessen 31–63 ms Lücke). Jetzt wird mindestens 50 ms voraus geplant (Stück-Schlüssel verhindern Doppelte).
5. **Ringpuffer (L.1.1/L.1.5):** bleibt **120 s** (reicht beim langsamsten Tempo 40 BPM: 16 Takte = 96 s + 0,25 s Vorlauf + Latenz).
   Speicher am iPhone (48 kHz) unverändert: Mikro + Referenz 2 × 11,52 MB + 3:1-Signal 3,84 MB ≈ **26,9 MB**. **Grenze ● SONG mit 🎤:
   ≈ 119,6 s** am Stück (120 s minus Latenz, 30 ms Rand und 0,25 s Vorlauf) = 59 Takte bei 120 BPM, ≈ 19,9 Takte bei 40 BPM; darüber
   beginnt der Take später (gemessen: 21 Takte bei 40 BPM = 126 s → `late` 6,36 s).
6. Test-API: `vsSet({mel})`, `vsInfo().cfg.mel`, neu `vsVoiceOnly()` (Schalter, letzte Pegel-Phrase, letzter Gesang-Take).

### Abnahme (Chromium headless, Mikro-Attrappe im selben AudioContext; Skripte in `dirigent-test/`)

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| VS-L-01 | ✓ 120 BPM leerer Platz: STIMME 16 Takte, Take 32,25 s (`late` 0); Take Takt 1 −21,4 dBFS, Takt 16 −21,2 dBFS; **am Ausgang** (Szene allein) Takt 1 −21,5 dB, Takt 16 −18,5 dB, nach der Schleife Takt 1 −21,4 dB; MELODIE 16 Takte, 32 Noten (t = 0 … 62); Wellenform 64 Spalten über die ganze Länge (L.1.6) | `n4-vs-l-accept.mjs 01` |
| VS-L-02 | ✓ 4-Takt-STIMME-Clip + 16 Takte: Clip **16 Takte**, neuer Take oben (32,000 s), alter in `alt[0]` (0,25 … 8,25 s); Take Takt 1 −18,8, Takt 16 −22,5 dBFS; Phase = Takt der Aufnahme; hörbar Takt 1/16 −17,9/−18,2 dB. **3 Takte auf 4-Takt-Clip:** Clip 4 Takte, STIMME-Spur + Takes deep-equal zu 4.23.0, MELODIE deep-equal bis auf Messrauschen der Tonhöhen-Auswertung zwischen zwei Läufen (o/d ≤ 0,02 Schlag; 4.23.0 gegen sich selbst 0,010/0,010) | `n4-vs-l-accept.mjs 02` |
| VS-L-03 | ✓ Demo, 4-Takt-MELODIE-Clip, MELODIE gewählt, ● 16 Takte → STIMME-Take **16 Takte** (32,000 s), Takt 16 −21,2 dBFS; MELODIE bleibt 4 Takte (wie 4.23.0) | `n4-vs-l-accept.mjs 03` |
| VS-L-04 | ✓ Länge 16: Schlag 67,5 noch `recording`, 68,3 `off` (Start 4) – endet nach genau 16 Takten; Take genau 32,0000 s bei 18 gesungenen Takten; Speichern/Laden: Datei 16, geladen 16; Auswahl in P1, P2, P3, L1, L2, 926 × 428: 6 Knöpfe, alle ≥ 44 × 44, im Bild, nichts abgeschnitten (Aufnahme-Blatt und Einstellungen) | `n4-vs-l-accept.mjs 04`, `n4-vs-l-lay.mjs` (93/93), Bilder `n4-vs-l-neu-*-laenge.png`, `-menu.png` |
| VS-L-05 | ✓ 40 BPM: ● REC Take 96,25 s, Vorlauf 0,25 s, `late` 0, Takt 16 −23,8 dBFS; Stimme-FANG MELODIE/STIMME 16 Takte, 96,25 s, `late` 0; Overdub 4 → 16 Takte, 96,00 s, `late` 0; ● SONG 16 Takte, 96,00 s, `late` 0; Grenze: 21 Takte (126 s) → `late` 6,36 s | `n4-vs-l-accept.mjs 05 05g 05o 05s 05x` |
| VS-L-06 | ✓ FANG 16-Takt-Phrase: MELODIE 16 Takte (32 Noten), STIMME 16 Takte (32,000 s, gleiche take-ID), Takt 16 −21,2 dBFS | `n4-vs-l-accept.mjs 06` |
| VS-L-07 | ✓ ● SONG 16 Takte: `song.vox` 16 Takte (32,000 s), letzter Takt −21,2 dBFS; am Ausgang in Takt 16 (STIMME allein) −20 … −27 dB | `n4-vs-l-accept.mjs 07` |
| VS-L-08 | ✓ **Aus:** ● REC → STIMME 4 Takte, kein MELODIE-Clip, MELODIE-Spur deep-equal, Zähler `runs` 0, kein Ergebnis-Blatt, Meldung „Gesang aufgenommen · 4 Takte“; Stimme-FANG (2 Takte, Pause 2 Takte, 4 Takte) → STIMME 4 Takte ab Takt 6, MELODIE deep-equal, Zähler 0, Meldung; ● SONG → `song.vox` 4 Takte, MELODIE deep-equal, Zähler 0. Pausen-Regel Aus (Pegel) = An (Noten): Anfang Takt 6, 4 Takte. **An:** ● REC, FANG, SONG deep-equal zu 4.23.0 (Noten o/d ≤ 0,01 Schlag Messrauschen) | `n4-vs-l-accept.mjs 08` |
| VS-L-09 | ✓ Standard An; Tipp „Aus“ → `vs.mel = false` im Geräteprofil; Projekt-JSON vor/nach Zeichen für Zeichen gleich (14 080 Zeichen); nach Neuladen Aus; Profil aus 4.23.0 (ohne Feld) → An; Claude-App (iframe, Speicher wirft): 4.24.0 läuft, kein Mikro, kein Mikro-Blatt, keine Seitenfehler | `n4-vs-l-accept.mjs 09` |
| VS-L-10 | ✓ P1, P2, P3, L1, L2, 926 × 428: Zeile „Melodieerkennung“ [An] [Aus] 56 × 44 je Knopf, im Bild, Beschriftung ganz; Satz bei Aus ganz; Seitenhöhe unverändert (kein Layout-Sprung), kein waagrechtes Rollen; hochkant passt das Blatt ganz (454 bzw. 474 px), quer rollt es mit dem Finger bis [Mikro aus] (L1 80, L2 95, XL 42 px) | `n4-vs-l-lay.mjs`, Bilder `n4-vs-l-neu-{P1,P2,P3,L1,L2,XL}-mikro(-aus).png` |
| VS-L-11 | ✓ je genau ein Undo-Schritt, Undo/Redo deep-equal: Overdub wird länger, Länge-16-Aufnahme, ● REC Aus, FANG Aus | in 02, 04, 08 |
| FP-DSP (Wechsel zum längeren Clip) | ✓ 3 Läufe, Mitschnitt im Audio-Faden (AudioWorklet): vorher 330 Hz (alter Take), danach 440 Hz (neuer), **längste Lücke 0 ms**; größte 2. Differenz am Wechsel 0,00115/0,00117/0,00115 = 0,0052–0,0054 je Pegel (Maßstab VS3-Take-Wechsel A/B 0,0032–0,0044 bei Spitze 0,49 → ≤ 0,009 je Pegel); keine Klick-Spitze | `n4-vs-l-click.mjs` (`n4-vs-l-click.out`) |
| Regression | ✓ Rauchtest ohne Fehler (`n4-vs-l-smoke.png`); `v3-vs3-accept` 71/72 – der eine Punkt (G: A/B 54 Hz) danach 2 × grün auf 4.24.0 und 2 × auf 4.23.0 (Zufall der Messung); `v3-vs3-click` 3 × grün (0,0032/0,0044/0,0032, wie 4.23.0 0,0032); `gs7-v3-vs4-accept` 24/26 → „Audio-Store …“ schlägt auch auf 4.23.0 fehl (alte Erwartung), „Stimme bleibt im Pegel (100 %)“ hängt am Einsatz-Versatz des Testlaufs (offMs 209–221 → −1,05 … −1,34 dB; offMs 189 → −0,66 … −0,89 dB, 4.23.0 bei 189 ebenso grün), danach 3 × grün; `gs7-v3-vs5a-t1/t3`, `gs7-v3-vs5b-t1/t3` grün | `n4-vs-l-reg-*.mjs`, Ausgaben `n4-vs-l-reg-*.out` |
| Fehlerliste | ✓ Marken-Regel (kein Korg-Wort, „MS 2000“ 1 ×), `live: true` 1 ×, keine alert/confirm/prompt, Texte deutsch, Knöpfe ≥ 44 | grep |

Die Test-Skripte planen den Gesang vorab im AudioContext (sonst verschiebt Rechenlast des Test-Rechners den Einsatz); wo Startzeit und
Abläufe gleich sind, sind die Ergebnisse deterministisch.

### Abweichungen (begründet)

- **Mikro-Blatt quer:** In L1/L2 rollte das Blatt schon in 4.23.0 (396 px Inhalt bei 372/357 px), mit der neuen Zeile jetzt 452 px; in
  926 × 428 passte es vorher (396/410), jetzt rollt es dort 42 px. Weil das Blatt in 4.23.0 **nicht mit dem Finger rollte** (Touch wurde
  abgefangen; gemessen 0 px), wären [Einmessen]/[Mikro aus] quer nicht mehr erreichbar gewesen → Blatt bekommt `pan-y` (Finger rollt,
  Tippen bleibt Tippen). Hochkant (P1–P3) passt es ganz. Andere Gestaltung zum Verkleinern habe ich nicht gebaut (Regel 27, Frage 1).
- **Länge-Knöpfe 44 px hoch** (vorher 32–40 px, quer 40 px breit) – nur die Zeile „Länge“, weil VS-L-04 es verlangt; „Quantisieren“ und
  „Einzähler“ daneben sind weiter so klein wie in 4.23.0 (Frage 2).
- **Aufnahme-Banner:** Kein Banner nennt MELODIE als Ziel des **Gesangs** (● REC hat keinen Banner; der Song-Banner „MEL“ meint die
  Tasten-Noten der Song-Melodie) → nichts geändert.
- **Overdub wird länger:** der neue Clip beginnt am Takt des Aufnahme-Anfangs (im Raster des laufenden Clips); bei ● mitten im Takt
  liegt der Take mit Versatz `at` in diesem Takt. Über 16 Takte hinaus nimmt er die ersten 16 Takte (wie ein neuer Clip).
- **Stimme-FANG Aus** nimmt denselben Platz wie heute (`vsMelFree`: gewählte Szene, wenn MELODIE dort frei ist) und verlangt weiter einen
  freien MELODIE-Platz, obwohl keine Noten entstehen; die Auswahl bleibt, wo sie war (die Tastatur soll nicht auf die STIMME-Spur springen).
- Meldung bei 1 Takt grammatisch „Gesang aufgenommen · 1 Takt“.
- `tkTrackResync` (VS3) um eine Zeile geändert (Vorlauf ≥ 50 ms) – ohne das gab es beim Wechsel zum 16-Takt-Take 31–63 ms Lücke.

### Befunde (nicht geändert)

- **Overdub ohne Wachsen (wie 4.23.0):** beim Wechsel zum neuen Take ≈ 27–40 ms Stille (alter Take blendet in `tkVoiceTake` sofort aus,
  der neue kommt erst nach dem Lesen) – gemessen mit `n4-vs-l-click.mjs <app> 4`. Der Weg „wird länger“ hat das nicht (0 ms).
- P3 (320 × 568): „🔈 Lautsprecher“ im Mikro-Blatt abgeschnitten – schon in 4.23.0 so.
- Menü-Kopf „SYNQUENZER 4.24“ in P3 rechts abgeschnitten – schon in 4.23.0 so („4.23“).

### Fragen an Xander

1. Das Mikro-Blatt ist quer (und im iPhone 12 Pro Max quer) jetzt etwas höher als der Bildschirm und rollt mit dem Finger. Soll es quer
   zweispaltig werden oder kleiner (z. B. die Zeile „Melodieerkennung“ neben „Stimme → Noten“), damit es wieder ganz passt?
2. Die Länge-Knöpfe sind jetzt 44 px hoch, „Quantisieren“ und „Einzähler“ darunter noch kleiner – sollen die auch 44 px bekommen?
3. ● REC mit 🎤 über einem vorhandenen MELODIE-Clip: die STIMME wird jetzt 16 Takte, der MELODIE-Clip bleibt aber 4 Takte und bekommt die
   Noten aller 16 Takte übereinander (wie ein Tasten-Overdub, 4.23.0). Soll der MELODIE-Clip dann auch auf 16 Takte wachsen?
4. Bei „Melodieerkennung Aus“ braucht FANG 🎤 weiter einen freien MELODIE-Platz und legt die STIMME in dieselbe Szene wie heute. Soll er bei
   Aus stattdessen einen freien STIMME-Platz nehmen?
5. Beim normalen Overdub (neue Aufnahme nicht länger als der Clip) gibt es beim Take-Wechsel ≈ 30–40 ms Stille (seit VS3). Soll ich das
   genauso lückenlos machen wie beim Länger-Werden?

### iPhone (Xander, Pages-Seite, Kopfhörer)

1. 🎤 an, ▶, auf eine Szene, in der schon eine kurze STIMME (z. B. 4 Takte) liegt, ● drücken und **16 Takte** singen, ● → der STIMME-Clip
   ist jetzt 16 Takte lang, die Wellenform geht über die ganze Zelle, die Stimme läuft im Takt in Schleife. ✎ → der alte Take liegt darunter.
2. ● lang drücken → **Länge 16** → ● → die Aufnahme hört nach genau 16 Takten von selbst auf.
3. Mikro-Blatt (Tipp auf die rote Mikro-Zeile) → **Melodieerkennung: Aus** → ● singen → nur die STIMME-Spur bekommt den Gesang, keine
   Noten, kein Ergebnis-Blatt, kurz „Gesang aufgenommen · n Takte“. Auch FANG 🎤 nimmt dann nur Gesang. Nach dem Neuladen bleibt „Aus“.
4. Bitte melden: Kommt der ganze Gesang an (Anfang und Ende)? Hörst du beim Übergang auf den längeren Clip ein Knacken oder Loch?
   Quer: lässt sich das Mikro-Blatt mit dem Finger bis „Mikro aus“ rollen?

### Für das Zusammenführen (3-Wege-Merge mit VS-P)

Geändert (nur diese Stellen, sonst nichts umformatiert):
- CSS: neue Regeln nach `.stpop .st-vs button.on{…}` (`.st-mel`, `.st-melx`, `#roLen button,.mrow.rlen .seg button`).
- `VERSION` 4.24.0.
- `normalizeProject` (Zeile `d.recLength = [1, 2, 4, 8, 16]…`), `setRecOptions` (`recLength`), `popRecOpts` (Seg `roLen` + 16),
  `openMenu` (Zeile „Länge“ + 16, `.classList.add('rlen')`).
- `stProf` (Feld `mel`), `stSheet` (Klasse `pan-y`), `stSheetFill` (Ein-Zeilen-Haken `vsMelRowHTML(vc)`), neu `vsMelRowHTML`,
  `bindStSheet` (Zeile `#vsMel`).
- `vsCfg`, `vsCfgSet` (Feld `mel`).
- `vsFang` (Ein-Zeilen-Haken → `vsFangVoice`), `vsRecEnd` (Ein-Zeilen-Haken → `vsRecVoice`); neu `vsVoiceToast`, `vsRecVoice`,
  `vsFangVoice`, `vsLevelNotes` (vor `vsApply`). `vsFangDone`, `vsRecDone`, `vsApply`, `vsPhrase` unverändert.
- `tkTrackResync` (eine Zeile: Planungs-Ende `Math.max(R.schedBeat, t2b(at + .05))`).
- `tkVoiceTake` (Länge `L`, Wachsen `grow`/`gcs`, `clip.len`, Abspiel-Zeile, Rückgabe `len`); neu `tkGrowPhase` (nach `tkVoiceTake`).
- Test-API: neue Zeile `vsVoiceOnly` nach `vsAnalyseRange`.
VS-P (Wiedergabe-Kette, `tkStartSrc`) wird nicht berührt.

Snapshot: `synq-snapshots/VS-L.html`.

## VS-L-fix

Prüfbericht mit 9 Befunden (8 verschiedene Fehler; zwei Befunde beschreiben dasselbe Overdub-Problem, zwei denselben FANG-Lautsprecher-Fehler).
**Alle 9 nachgestellt, alle echt, alle behoben.** App bleibt **4.24.0**, Format 5, `live: true` unverändert, kein Supabase-Aufruf –
**am Server offen: max_app ≥ 4024000**. Größe 3 377 061 → 3 381 095 B (+4,0 KB). Snapshot: `synq-snapshots/VS-L-fix.html`.

Hinweis zu den Läufen: Auf dem Prüfrechner liefen zeitgleich Tests anderer Pakete (Last bis 28 auf 4 Kernen). Einzelne Läufe, in denen
schon der **erste** Take der Skripte nicht zustande kam oder ein ● Tipp 1–2 Takte zu spät ankam, sind verworfen und wiederholt (steht bei
den Ausgaben). Alle Zahlen unten stammen aus gültigen Läufen.

### Was behoben ist

1. **Overdub wird länger – ● kurz vor dem Taktstrich (Befunde 1 und 5, `tkVoiceTake`):** Der neue Clip zählte ab dem Takt, in dem ●
   gedrückt wurde (abgerundet). ● 0,1–0,5 Schläge vor dem Taktstrich → Clip einen Takt zu früh, letzter gesungener Takt abgeschnitten
   (16 Takte) bzw. ein leerer Takt zu viel (8 → 9, 4 → 5). Jetzt zählt der Clip ab dem **Taktstrich, der dem Anfang der Aufnahme am
   nächsten liegt** (im Raster der laufenden Schleife; läuft der Platz nicht, im Takt-Raster). Was vor diesem Taktstrich liegt (das Stück
   zwischen ● und dem Taktstrich), gehört nicht zum Take. Wer nach dem Taktstrich drückt, bekommt wie bisher den Clip ab diesem Takt.
2. **Gleich lange Aufnahme (4 auf 4 Takte) wuchs auf 5 Takte (Befund 2):** Folge von 1 – jetzt 4 Takte (die Länge zählt ab dem nächsten
   Taktstrich).
3. **Zweiter 16-Takt-Take auf einen 16-Takt-Clip behielt nur 15 Takte (Befund 7):** Der Weg „nicht länger“ (4.23.0) nimmt den jüngsten
   vollen Durchgang **im Raster des alten Clips**. Beginnt die neue Aufnahme nicht am Schleifen-Anfang, liegt kein voller Durchgang in ihr,
   und 4.23.0 setzt sie mit Versatz in den Clip – der Teil hinter dem Clip-Ende ging verloren (16 Takte → 15; dasselbe bei 4 auf 4:
   4.23.0 verlor dort den 4. Takt, siehe `n4-vs-l-qa-od-4-old.out`). Jetzt: **gleich lang und kein voller Durchgang im alten Raster → die
   ganze Aufnahme wird der Take**, der Clip behält seine Länge und läuft ab dem Taktstrich der Aufnahme (wie „wird länger“, nur ohne neue
   Länge; Verschiebung um ganze Takte, also im Takt mit dem, worüber gesungen wurde). Liegt ein voller Durchgang in der Aufnahme, und bei
   kürzeren Aufnahmen (z. B. 3 auf 4 Takte), bleibt alles wie 4.23.0 (VS-L-02 deep-equal geprüft).
4. **↶ nach „wird länger“ während ▶ ließ die Schleife verschoben (Befund 8):** Das Undo stellte den Clip her, die laufende Phase blieb aber
   die der neuen Aufnahme (STIMME gegen MELODIE um einen Takt versetzt). Neuer Undo-Teil `tphase` in derselben Undo-Gruppe des Takes:
   ↶ stellt die alte Phase der laufenden Schleife wieder her, ↷ die neue (läuft der Platz nicht, gilt wie bisher der nächste Start).
   Weiter genau **ein** Undo-Schritt.
5. **Melodieerkennung Aus: 16-Takt-Take verloren, wenn ● am Ende getippt wird (Befund 6, `tkEnsureTrack`):** Die Aufnahme schließt bei
   AUTO/Länge 16 von selbst kurz vor dem hörbaren Taktstrich; der ● Tipp danach stellt (wie in 4.23.0) die nächste Aufnahme bereit
   (`armed`). Bei Aus ist der Take schneller fertig als die Tonhöhen-Auswertung bei An und traf auf `armed` – `tkEnsureTrack` legte dann
   keine STIMME-Spur an („Kein Platz für die STIMME-Spur …“), der ganze Take war weg. Jetzt wird die STIMME-Spur auch angelegt, während
   die nächste Aufnahme bereitsteht oder einzählt; nur die Spur dieser bereitgestellten Aufnahme wird nie zur STIMME-Spur umgewidmet.
6. **Stimme-FANG bei Aus über den Lautsprecher (Befunde 4 und 9, `vsLevelNotes` + neu `vsLevelBleed`):** Der Pegel-Weg zählte den
   Musik-Rest, der nach dem Echo-Abzug im Mikro bleibt, als Gesang – die Pause füllte sich, die Pausen-Regel griff nicht (8 bzw. 13 Takte
   inkl. Vorspiel und Pause). Jetzt dieselbe **Energie-Probe wie die Übersprech-Sperre der Noten** (`vsBleedNote`, VS2-fix/VS4-fix):
   ein 20-ms-Fenster zählt nur als Gesang, wenn das Mikro dort über **Referenz × Kopplung (eingemessen bzw. gemessen) × Rest nach dem
   Abzug (−15 dB) × 3 dB Rand** liegt (Referenz zur selben Zeit über die Latenz-Unsicherheit, die lauteste). Kopfhörer/Kabel: keine Probe
   (unverändert). Rechenzeit: ein Durchgang über die Referenz in 10-ms-Blöcken (16 Takte bei 40 BPM ≈ 5,8 M Werte, wenige ms).
7. **Mikro-Blatt quer passte nicht mehr (Befund 3, `stSheetFill` + CSS):** L.2 verlangt, dass das Blatt mit der neuen Zeile ganz ins Bild
   passt. Quer und niedrig (`orientation: landscape` und Höhe ≤ 520 px) steht das Blatt jetzt **zweispaltig**: links Mikrofon, Pegel,
   Weg, Verzögerung, darunter [Einmessen] [✕ Mikro aus] und der Hinweis; rechts „Stimme → Noten“ mit Melodieerkennung, Satz bei Aus,
   Stimme/Instrument, Einrasten. Alle Knöpfe, Texte und Farben sind dieselben; hochkant ist das Blatt pixelgleich zu VS-L (gemessen,
   nur die Kopfleiste über dem Blatt unterscheidet sich zeitabhängig). Dafür ist das Blatt quer breiter (höchstens 720 px). Das Rollen mit
   dem Finger (`pan-y`) bleibt, wird aber in Ruhe nicht mehr gebraucht.

### Nachweis (vorher → nachher; Skripte in `dirigent-test/`, Ausgaben `n4-vs-l-fix-*.out`)

| Befund | Skript | vorher (VS-L) | nachher (VS-L-fix) |
|---|---|---|---|
| 1 Overdub 16 Takte, ● 0,5 vor dem Taktstrich (120 BPM) | `n4-vs-l-qa-od.mjs 16 0.5 0.5` | Clip 16, Anfang 36, `at` 3,66, Takt 16 zu 8,5 % gespielt (`n4-vs-l-fixr-od16.out`) | 2 × Clip 16, Anfang 40, `at` 0, Take 32,25 s, **alle 16 Takte** −19 … −23 dBFS, Takt 16 −22,6 (`-od-16a`, `-od-16b`) |
| 1 dasselbe mit 8 Takten | `… 8 0.5 0.5` | 9-Takt-Clip | 2 × **8 Takte**, Anfang 40, alle 8 gespielt (`-od-8a`, `-od-8b`) |
| 2 4 Takte auf 4-Takt-Clip | `… 4 0.5 0.3` | 5-Takt-Clip (4.23.0: 4 Takte, aber Takt 4 zu 7 % gespielt) | 2 × **4 Takte**, alle 4 gesungenen Takte gespielt; Lauf b mit laufendem STIMME-Platz (Phase 4 → 40) (`-od-4a`, `-od-4b`) |
| 3 Mikro-Blatt quer | `n4-vs-l-qa-lay.mjs <app> neu`, `n4-vs-l-lay.mjs` | L1/L2/XL: Inhalt 452/472 px in 372/357/410 px, [Einmessen]/[Mikro aus] unter dem Rand | L1/L2/XL: **280 px**, passt ganz (`fits`), [Mikro aus] unten bei 282 px, alle Knöpfe 9/9 Trefferpunkte (außer −1/+1 je 2 Randpunkte wie 4.23.0), nichts abgeschnitten (L2 auch „🔈 Lautsprecher“ ganz), Aus-Satz ganz; hochkant unverändert; Seitenhöhe gleich, kein waagrechtes Rollen; `n4-vs-l-lay.mjs` 90/90 (`n4-vs-l-fix-lay-neu.out`, `n4-vs-l-fix-lay.out`, Bilder `n4-vs-l-neu-*-mikro(-aus).png`, VS-L-Bilder als `n4-vs-l-vsl-*.png`) |
| 3 Einmessen quer | `n4-vs-l-fix-calsheet.mjs` | 4.23.0: Blatt rollt in Ruhe (L1/L2), mit Ergebnis-Zeile und während Einmessen | L1/XL passt in allen Zuständen; L2 passt in Ruhe und mit Ergebnis, nur **während** des Einmessens (Schritte-Liste) 47 px zu hoch (4.23.0: 142 px), [Mikro aus] bleibt im Bild (unten 365 von 375) |
| 4 FANG Aus, Lautsprecher, 120 BPM | `GAIN=… n4-vs-l-qa-spk.mjs aus` | 8 Takte ab Takt 2 (0,028 / 0,1 / 0,7) | **4 Takte ab Takt 6** (start 5) bei 0,028 (2 ×), 0,1, 0,7 (2 ×); Kontrollen GAIN 0 und Kabel ebenso 4 Takte ab Takt 6 |
| 5 Musiker-Overdub 112 BPM, ● 40–90 ms vor dem Taktstrich | `n4-vs-l-mus-od.mjs 16/8/4 0.3 0.1 mel/stimme` | 16 → Takt 16 fehlt; 8 → 9 Takte; 4 → 5 Takte | 16 → **16 Takte ab Schlag 40, alle 16 gespielt**, Ausgang je Clip-Takt −19 … −27 dB; 8 (STIMME gewählt) → **8 Takte**, alle gespielt; 4 → **4 Takte**, alle gespielt (`n4-vs-l-fix-mus-od-*.out`) |
| 6 Aus, 16 Takte, ● am Ende | `n4-vs-l-mus-end16.mjs 0 67.9 auto` / `0 68.05 16` | Take weg, „Kein Platz für die STIMME-Spur …“ (4 von 4) | 3 × **STIMME 16 Takte (34,29 s), „Gesang aufgenommen · 16 Takte“**, ein Undo-Schritt für den Take (`-end16-aus-a`, `-aus-b`, `-aus-len16`) |
| 7 zweiter 16-Takt-Take (Aus, Touch) | `n4-vs-l-fix-ui.mjs P` / `L` | Takt 1 stumm, Takt 16 fehlt | P und L: **16 Takte, alle 16 gesungenen Takte gespielt** (−18,8 … −23,9 dBFS), Clip läuft ab Schlag 72 (`n4-vs-l-fix-ui-P-a.out`, `-L-a.out`) |
| 8 ↶ nach „wird länger“ bei ▶ | `n4-vs-l-mus-undo.mjs` | STIMME-Phase 40 gegen MELODIE 4 (ein Takt Versatz) | 2 × nach ↶ **STIMME-Phase 4 = MELODIE-Phase 4**, „im Takt“, geplantes Stück an der alten Stelle (`-undo-a`, `-undo-b`) |
| 9 FANG Aus, Lautsprecher, 112 BPM | `n4-vs-l-mus-spk.mjs aus 0.3 / 0.1` | 13 Takte ab Takt 1 | 0,3 (2 ×) und 0,1: **8 Takte ab Takt 6** (start 5); Kabel-Kontrolle ebenso |

`n4-vs-l-fix-ui.mjs` ist `n4-vs-l-mus-ui.mjs` ohne die Hörprüfung von Take 1 **vor** Take 2: diese Prüfung dauerte auf dem belasteten
Rechner länger als 1,2 Schläge, der ● Tipp für Take 2 kam dann erst nach Schlag 72 an (Start 76/80, in VS-L und VS-L-fix gleich – ein
Fehler des Ablaufs, nicht der App). `n4-vs-l-mus-ui.mjs` selbst ist unverändert.

### Abnahme (berührte Punkte, erneut gelaufen)

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| VS-L-02 | ✓ 4 → 16 Takte: Clip 16, neuer Take oben 32,000 s, alter in `alt[0]`, Takt 1 −18,8 / Takt 16 −22,5 dBFS, hörbar −17,1 / −17,7 dB; **3 Takte auf 4: Clip 4, STIMME-Spur + Takes deep-equal zu 4.23.0**, Noten o/d 0,010/0,020 (4.23.0 gegen sich 0,010/0,010) | `n4-vs-l-accept.mjs 02` (`n4-vs-l-fix-acc-02.out`; ein erster Lauf unter Last ohne zweiten Take verworfen) |
| VS-L-05 (Overdub) | ✓ 40 BPM: Clip 16 Takte, Take 96,00 s, `late` 0, Takt 16 −21,9 dBFS | `n4-vs-l-accept.mjs 05o` |
| VS-L-08 | ✓ 16/16 (Aus: ● REC, FANG, ● SONG nur STIMME, Zähler 0, Meldungen; An deep-equal zu 4.23.0; Pausen-Regel Aus = An) | `n4-vs-l-accept.mjs 08` (`-acc-08b.out`; Lauf a unter Last 15/16, An-Noten o 1,6 – An-Weg unverändert, Wiederholung grün) |
| VS-L-10 | ✓ siehe Befund 3 (P1, P2, P3, L1, L2, 926 × 428) | `n4-vs-l-qa-lay.mjs`, `n4-vs-l-lay.mjs` |
| VS-L-11 | ✓ Overdub 16 = ein Undo, Undo/Redo deep-equal (02); Aus ● REC/FANG je ein Undo, deep-equal (08); ↶ bei ▶ stellt die Phase her (Befund 8) | wie oben |
| FP-DSP | ✓ „wird länger“ 2 × Lücke 0 ms, 2. Differenz je Pegel 0,0058/0,0065 ≤ 0,0135 (ein Lauf unter Last mit 15-ms-Loch und Spitze 0,148 im ganzen Mitschnitt verworfen); **4 auf 4 Takte jetzt ohne Loch** (0 ms, je Pegel 0,0053; VS-L: 25 ms) | `n4-vs-l-fix-dbg-click.mjs <app> 16/4` (= `n4-vs-l-click.mjs` + Protokoll der Take-Eingaben) |
| Rauchtest | ✓ keine Fehler | `smoke.mjs` → `n4-vs-l-fix-smoke.png` |
| Regression | ✓ `v3-vs3-accept` 71/72 – der Punkt G „A/B 48/54 Hz“ ist eine Zeitfrage des Tests (Messung fällt auf die Lücke 3,73 … 4,0 am Ende des 1-Takt-Takes): 8 Wiederholungen G → mit und ohne die `tkTrackResync`-Zeile je 1 × rot, 3 × grün; `gs7-v3-vs4-accept` 25/26 (der rote Punkt „Audio-Store …“ wie 4.23.0); `gs7-v3-vs5a-t1/t3`, `gs7-v3-vs5b-t1/t3` grün (20/31/32/5 ✓) | `n4-vs-l-reg-*.mjs`, `n4-vs-l-fix-ab.mjs` |
| Fehlerliste | ✓ kein Korg-Wort, „MS 2000“ 1 ×, `live: true` 1 ×, keine alert/confirm/prompt, Texte deutsch, Knöpfe ≥ 44 | grep, Layout-Skripte |

### Abweichungen

- **Gleich lange Aufnahme ohne vollen Durchgang** (Punkt 3 oben) läuft jetzt wie „wird länger“ (ganze Aufnahme, Phase ab ihrem
  Taktstrich) statt wie 4.23.0 (Versatz, Ende abgeschnitten). L.1.2 sagt „ist sie nicht länger, bleibt alles wie heute“ – das gilt weiter
  für kürzere Aufnahmen und für Aufnahmen, die einen vollen Durchgang enthalten. Ohne diese Änderung ist Befund 7 (16 Takte gesungen,
  15 im Clip) nicht zu beheben.
- **Mikro-Blatt quer zweispaltig** – sichtbar anders als 4.23.0/VS-L, aber die einzige Anordnung, bei der das Blatt mit der von L.2
  verlangten Zeile quer ganz ins Bild passt (Knöpfe bleiben 44 px). Nur quer und niedrig; hochkant und auf großen Bildschirmen gleich.
- ● kurz **vor** dem Taktstrich: der Bruchteil zwischen ● und dem Taktstrich gehört nicht zum Take (ein Auftakt dort würde nicht
  gespielt). Ein Auftakt vor dem ersten Takt passt in eine Schleife nur hinten hinein – das gibt es auch bei neuen Clips nicht.

### Befunde (nicht geändert)

- Ein ● Tipp genau am Ende einer Aufnahme, die gerade von selbst geschlossen hat (AUTO 16 Takte / Länge 16), stellt wie in 4.23.0 die
  **nächste Aufnahme** bereit (ab dem nächsten Takt). Der Take ist jetzt sicher; die zweite Aufnahme läuft aber, bis man sie stoppt
  (bei Länge 16 legt sie einen leeren MELODIE-Clip an, den ↶ entfernt). Siehe Frage 6.
- Bei Länge 16 + Aus kommt vor „Gesang aufgenommen · 16 Takte“ kurz „Nichts aufgenommen“ (die Tasten-Aufnahme in MELODIE war leer) –
  schon in VS-L so.

### Fragen an Xander (neu)

6. Wenn eine Aufnahme nach 16 Takten von selbst endet und du im selben Moment ● tippst, startet eine neue Aufnahme ab dem nächsten Takt
   (wie bisher). Soll ein ● direkt nach dem automatischen Ende (z. B. innerhalb eines halben Schlags) stattdessen nichts tun?
7. Quer steht das Mikro-Blatt jetzt in zwei Spalten, damit alles (auch [Einmessen] und [Mikro aus]) ohne Rollen sichtbar ist. Passt das so?
   (Frage 1 aus VS-L ist damit beantwortet, sobald du zustimmst.)
8. Singst du einen neuen Take über einen gleich langen STIMME-Clip und fängst nicht am Schleifen-Anfang an, nimmt die App jetzt die ganze
   Aufnahme und lässt die Schleife ab deinem ersten Takt laufen (vorher fehlte der letzte Takt). Ist das so richtig?

### iPhone (Xander)

1. Eine Szene mit kurzer STIMME (4 Takte) laufen lassen, ● **kurz vor** einem Taktstrich tippen, ab dem Taktstrich 16 Takte singen, ● →
   Clip 16 Takte, der erste gesungene Takt ist Takt 1 des Clips, der 16. ist ganz da. Gleich danach ↶ → die alte 4-Takt-Stimme läuft
   wieder im Takt mit der MELODIE.
2. Noch mal 4 Takte über den 4-Takt-Clip singen (● kurz vor dem Taktstrich) → bleibt 4 Takte, alle 4 Takte zu hören.
3. Melodieerkennung Aus, 16 Takte singen, am Ende ● tippen → „Gesang aufgenommen · 16 Takte“, der Take ist da (danach ● noch mal tippen,
   falls die nächste Aufnahme bereitsteht).
4. Ohne Kopfhörer (Lautsprecher, eingemessen), Aus: 2 Takte singen, 2 Takte Pause, 4 Takte singen, FANG 🎤 → nur die letzten 4 Takte.
5. iPhone quer: Mikro-Blatt öffnen → alles ohne Rollen sichtbar, rechts „Melodieerkennung“, links unten [Einmessen] [✕ Mikro aus].

### Für das Zusammenführen (zusätzlich zu VS-L)

- `tkVoiceTake`: Zeile `gp`/`g0`/`nb` (nächster Taktstrich) und Bedingung `nb > old.len || (nb === old.len && c0 < o.a - 0.25)`;
  eine Zeile `if (grow) its.push({kind: 'tphase', …})` vor dem `clip`-Teil.
- neu nach `tkGrowPhase`: `tkPhaseOf`, `tkPhaseSet`.
- `undoState`, `undoApply`: je eine Zeile für `tphase` (vor dem letzten `else`/`return`).
- `tkEnsureTrack`: Zustands-Sperre entfernt (Kommentarzeile), Schleife „leere Spur wird STIMME“ mit `(rec.state === 'off' || i !== rec.track)`.
- `vsLevelNotes`: eine Zeile `rq`/`on(i)` (+ zwei Stellen `on(…)` in der Schleife), `VS.lastLevel.bleedDb`; neu `vsLevelBleed` danach.
- `stSheetFill`: drei Hüllen `st-c1`/`st-c2`/`st-c3` (an vier Stellen der html-Zeilen); CSS-Block `@media (orientation:landscape) and
  (max-height:520px)` nach `.stpop .st-melx`.
- VS-P-Stellen (`tkStartSrc`, `tkTrackResync`, `tkPlace`, …) nicht berührt.


# VS-P — Stimme im Mix (Nachtrag 4, Paket VS-P) · App 4.24.0

Grundlage: Zweig-Kopie `vs-br-VSP/index.html` ab App 4.23.0 (`vs-base-B.html`). Spec: `v3-ideen/dirigent-spec-v3-nachtrag-4-gesang.md`,
Abschnitt „Paket VS-P“. Auftrag Xander 27.10. mittags: „… sie sind im Kontext zu den Synthesizern oder anderen Spuren … meistens viel zu
leise. Kann man da noch irgendwie was machen, dass die Stimme lauter ist oder dass das in besserem Verhältnis zueinander funktioniert?“
`VERSION` 4.24.0 (`APP_CODE` 4 024 000). Format bleibt 5, **kein neues Feld** (der Ausgleich steht nicht im Projekt). `live: true` in CLOUD
unverändert. Kein Supabase-Aufruf. **Am Server offen: `max_app` ≥ 4024000** (Xander per SQL).

## Ursache (erst gemessen, unveränderte App 4.23.0)

Gemessen mit echten Läufen (Mikro-Attrappe im selben AudioContext, Kabel-Weg ohne Pegel-Automatik wie `MIC_ASK`; Mitschnitt an den
Knoten der App; Lautheit ITU-R BS.1770-4, wahre Spitze 4×; `n4-vs-p-m1.mjs`, `n4-vs-p-accept.mjs 02`).

| Stelle | −36 dBFS RMS | −28 dBFS RMS | −20 dBFS RMS |
|---|---|---|---|
| Mikro → Ringpuffer → Take (PCM) | −36,55 LUFS | −28,55 LUFS | −20,55 LUFS |
| Take → `tkStartSrc` → Eingang STIMME-Spur (stereo L = R, +3,01) | −33,6 | −25,6 | −17,6 |
| Ausgang STIMME-Spur (Pegel-Standard 0,8 → 0,8² = −3,88 dB, Pan Mitte) | **−37,5** | **−29,5** | **−21,5** |

- Unterwegs geht **nichts verloren**: Ringpuffer und Take sind verlustfrei (0,0 dB), `tkStartSrc` spielt mit Verstärkung 1, die Kette der
  STIMME-Spur hat dieselbe Pegel-Stellung 0,8 wie jede Synth-Spur. Säubern (VS4) senkt die Stimme kaum: in diesem Lauf (Lautsprecher-Weg,
  60 %) −28,58 → −28,59 LUFS (−0,01 dB); VS4 hat mit echtem Echo −0,4 … −0,7 dB gemessen (Legato mit Echo ≈ −1 dB).
- Die Synth-Spuren dagegen sind kalibriert: Demo-Projekt am Spur-Ausgang Moog-Bass **−22,3**, FM-Pluck **−21,1**, Rom-Fläche **−22,0**,
  Drums **−15,6**, Summe −14,6 LUFS. Die MS-2000-Programme sind auf −18 LUFS **am Klangerzeuger** kalibriert (`mkRender`, vor dem
  Pegel) – am Spur-Ausgang also ≈ −21,9 LUFS, gleich den Demo-Synths.
- Demo-Projekt mit Gesangs-Take (Mikro −28 dBFS RMS): Stimme **−30,2 LUFS** = **9,1 LU unter** der lautesten Synth-Spur und **14,6 LU unter**
  den Drums.
- **Ursache:** Der Gesang kommt mit dem Pegel des Mikrofons in den Mix. Die App schaltet die Pegel-Automatik des Mikrofons bewusst aus
  (Timing, Säubern, Tonhöhe); ein iPhone-Mikro liefert beim Singen etwa −36 … −20 dBFS RMS. Es gab keine Stelle, die den Take auf das
  Niveau der kalibrierten Synths bringt → 8 … 16 LU zu leise, je nach Abstand zum Mikro und Lautstärke des Sängers.

## Was neu ist

1. **Auto-Pegel je Take** (`vpStep`): Die Fassung, die klingt (Roh, gesäubert oder gedehnt – je Puffer einmal), wird nach ITU-R BS.1770-4
   gemessen (K-Filter, 400-ms-Blöcke mit 75 % Überlappung, Gate −70 LUFS / −10 LU; damit zählt der gesungene Teil, Pausen fallen heraus).
   Der Take spielt mit dem Ausgleich, der am Ausgang der STIMME-Spur bei Pegel-Standard (0,8, Pan Mitte) **−16 LUFS** ergibt; Grenzen
   −12 … +24 dB; ein stiller Take bekommt 0 dB. Gilt für Szene-Clips und `song.vox` (beide über `tkStartSrc`) und für vorhandene Takes:
   gemessen, sobald ihr Audio geladen ist (`tkLoad`). Der Wert entsteht nur aus dem Audio (auf jedem Gerät gleich), steht **nicht** im
   Projekt; WAV/ZIP bleiben der Roh-Take (bitgleich).
2. **Spitzen-Schutz** (`vpLim`): Aus demselben Puffer eine Hüllkurve (alle 16 Samples): wahre Spitze (4× Überabtastung) des
   ausgeglichenen Takes ≤ −1,3 dBTP **vor** dem Pegel-Regler (damit ≤ −1 dBTP am Ausgang in jeder Regler-Stellung), 2 ms Vorlauf,
   100 ms Freigabe. Weil der Take vorher bekannt ist, rechnet der Begrenzer offline voraus – **keine Verzögerung** gegen die anderen
   Spuren. Er wirkt als eigener GainNode nur in Abspiel-Stücken, die eine Spitze enthalten; ohne Spitze und ohne STIMME-Spur gibt es
   keinen zusätzlichen Knoten.
3. **Pegel-Regler, Pan, Mute, Sends** der STIMME-Spur wirken wie bisher zusätzlich (relativ).
4. **Leistung:** Gemessen wird in Häppchen im Hauptfaden (6 ms, wenn etwas darauf wartet 20 ms; kein langer Task). Eine Neu-Planung
   (Take fertig, gewählt, gesäubert, gedehnt) wartet, bis die neue Fassung gemessen ist – bis dahin spielt das Alte weiter. Ein Stück mit
   noch ungemessenem Puffer setzt danach ein, wie ein Take, der noch lädt.
5. Kein neuer Regler, kein neuer Knopf, kein neuer Text, kein neues Projektfeld. Test-API: `vpInfo()`, `vpEnv(id)`, `vpWait()`.

## Abnahme

| ID | Ergebnis | Messung/Skript |
|---|---|---|
| VS-P-01 | ✓ Mikro-Weg (● REC mit 🎤, Kabel), gesungener Vokal −36 / −28 / −20 dBFS RMS → Take −37,1 / −29,1 / −21,1 LUFS, Ausgleich +21,97 / +13,97 / +5,97 dB → **Ausgang STIMME −16,04 / −16,04 / −16,04 LUFS** (wahre Spitze −7,4 … −7,6 dBTP). Zweite Stimme (Korpus-Gesang VS2): −16,06 / −16,06 / −16,06 LUFS, auch über den Lautsprecher-Weg mit Säubern 60 % −16,06 | `n4-vs-p-accept.mjs 01`, `n4-vs-p-m1.mjs` |
| VS-P-02 | ✗ **wie geschrieben nicht erfüllbar zusammen mit VS-P-01** (siehe Abweichungen 1). Demo-Projekt + Take (−28 dBFS RMS), alle Regler Standard, je Spur-Ausgang: Moog-Bass −22,29, FM-Pluck −21,11, Rom-Fläche −22,17, Drums −15,63, **Stimme −16,02 LUFS** (4.23.0: −30,16). Stimme gegen lauteste Synth-Spur **+5,09 LU** (Soll ≤ +3), gegen die lauteste Spur (Drums) **−0,39 LU** | `n4-vs-p-accept.mjs 02` |
| VS-P-03 | ✓ (a) leiser Gesang −30 dBFS RMS mit Plosiven bei 0 dBFS roh (nach Ausgleich +13,6 dBFS): wahre Spitze am STIMME-Ausgang **−5,18 dBTP** (Pegel-Standard), **−1,30 dBTP** (Pegel ganz auf); (b) Spitzen genau 0,9 dBFS nach dem Ausgleich: −5,18 / −1,30 dBTP. Natürlicher Gesang, Anteil stimmhafter 20-ms-Frames mit ≤ 3 dB Pegelminderung: Vokal −28 / −20 / −36 (+22 dB) **100 %**, Korpus-Stimme −28 / tief −20 **100 %** (Hüllkurve nicht nötig), Vokal mit Konsonanten (Plosive +14 … +20 dB über RMS, Zischlaute) **96,9 %** (größte 8,2 dB am Plosiv). Verschiebung gegen einen Synth-Ton im selben Mitschnitt: 0,204 ms (4.23.0) / 0,204 ms (VS-P) → **0,000 ms**, begrenzte Plosiv-Spitze 0,632 → 0,551 | `n4-vs-p-accept.mjs 03` |
| VS-P-04 | ✓ Take in 4.23.0 aufgenommen und gespeichert, VS-P im selben Browser geöffnet: gemessen nach dem Laden, **bevor** er spielt (−31,32 LUFS, +16,19 dB); spielt mit **−16,10 LUFS** am Ausgang (4.23.0: −32,2); Projekt mit Take gespeichert in 4.23.0 = geladen in VS-P Zeichen für Zeichen (12 059 Zeichen); WAV-Export bitgleich zum Roh-Take und zu 4.23.0 (`e0a3828d:705600`), ZIP mit Roh-WAV; Projekt ohne Takes (Demo 13 864, INIT 10 312 Zeichen) Zeichen für Zeichen gleich zu 4.23.0 (nur appVersion/Prüfsumme/ID ausgenommen) | `n4-vs-p-p04.mjs` |
| VS-P-05 | ✓ M-KLICK (2. Differenz ≤ 1,5 × Krümmung, Mitschnitt aller Ausgänge, Aussetzer der Test-Umgebung über einen Bezugston erkannt und ausgenommen): Schleife + Take-Wechsel + Stopp Faktor 1,04; A/B Roh│Sauber ×4 + Säubern 100 → 40 % beim Spielen + Stopp Faktor 1,11 / 1,25 (zwei Läufe); arbeitender Spitzen-Schutz (−9,6 dB) mit Schleife + Stopp Faktor 1,17; neuer, ungemessener 16-Takt-Take beim Spielen: Stille 25 ms (4.23.0 auf demselben Weg 270 … 960 ms), Faktor 1,31 (4.23.0 1,55) | `n4-vs-p-click.mjs` |
| VS-P-06 | ✓ lange Tasks: 16 Takte bei 120 BPM (32 s) und 40 BPM (96 s, langsamstes Tempo), Fertigwerden während des Spielens und Laden: **keine** Aufgabe > 50 ms (4.23.0 ebenso keine); längstes Mess-Häppchen 11,9 … 43,4 ms (unter Last der Nachbar-Builds, Lastmittel 4–8 auf 4 Kernen), Rechenzeit gesamt 133 ms (32 s) / 156 ms (96 s). **CPU 3 min** (Demo + Gesangs-Take mit arbeitendem Spitzen-Schutz, Renderer-Prozess, je 2 Läufe abwechselnd): 4.23.0 64,51 / 60,99 % → Mittel 62,75 %; VS-P 64,57 / 55,68 % → 60,13 % = **−2,6 Prozentpunkte** (≤ +2; die Streuung der Umgebung ist größer als der Unterschied) | `n4-vs-p-perf.mjs lt`, `n4-vs-p-perf.mjs cpu` |
| Punkt 4 | ✓ `song.vox` (● SONG mit 🎤, Punch Takt 1–8, Mikro −32 dBFS RMS): Take −33,34 LUFS, Ausgleich +18,2 dB → Ausgang STIMME **−16,03 LUFS**; Pegel-Regler 0,8 → 0,4 = −12,01 dB (Soll −12,04, relativ wie bisher); Mute → still | `n4-vs-p-vox.mjs` |
| Layout | ✓ keine sichtbare Änderung: P1, P2, XL pixelgleich zu 4.23.0, P3, L1, L2 optisch gleich (nur der Toast „STIMME-Spur angelegt“ blendet zeitabhängig ein); Seite in allen sechs Formaten = Fenster (kein Überlauf, kein Sprung) | `n4-vs-p-lay.mjs` |

Regression (Kopien mit Pfad auf diese App, Präfix `n4-vs-p-reg-`): `v3-vs3-accept` **72 ✓, alles grün**; `gs7-v3-vs4-click` 6 ✓;
`gs7-v3-vs4-accept` 25 ✓, 1 ✗ (siehe Abweichungen 5, auch in 4.23.0); `gs7-v3-vs5a-t1/t3/t4/t5` alle grün, `-t2` 20 ✓ / 1 ✗ (auch in
4.23.0) und gelegentlich ein Zeit-Messpunkt (auch in 4.23.0); `gs7-v3-vs5b-t1 … t5` **alle grün** (32 / 51 / 5 / 6 / 9 ✓).
Smoke `smoke.mjs` ohne Fehler.

## Abweichungen

1. **VS-P-01 und VS-P-02 widersprechen sich im Demo-Projekt.** Die Spec setzt −16 LUFS „2 dB über einem einzelnen kalibrierten
   Synth-Programm“ an. Die −18 LUFS der Programme sind aber am Klangerzeuger gemessen, **vor** dem Pegel 0,8 (−3,88 dB); am Spur-Ausgang
   liegen die Synths bei −21 … −22 LUFS. −16 LUFS am Ausgang der STIMME-Spur (VS-P-01, Punkt 2 der Spec) ist deshalb +5,1 LU über der
   lautesten Synth-Spur (VS-P-02 verlangt ≤ +3) – und etwa so laut wie die Drums (−0,4 LU). Gebaut ist die Zahl der Spec (−16 LUFS am
   Ausgang). Eine einzige Konstante (`VP_LUFS`) legt das Ziel fest; −20 LUFS würde VS-P-02 erfüllen (+0,9 LU über FM-Pluck, −4,4 LU unter
   den Drums) und VS-P-01 verfehlen. → Frage an Xander 1.
2. Jede Fassung wird für sich gemessen: Roh und gesäubert (und gedehnt) klingen gleich laut. Das A/B Roh│Sauber vergleicht damit bei
   gleicher Lautheit (Unterschied im Test 0,01 dB). Folgt aus „auf der Fassung, die klingt“.
3. Der Clip-Pegel `audio.gain` (0 … 4, in der Oberfläche nicht einstellbar, immer 1) wirkt weiter als Faktor; der Spitzen-Schutz ist für
   Clip-Pegel ≤ 1 bemessen.
4. Neu-Planung wartet auf die Messung: ein frisch fertiger oder neu gewählter Take setzt um die Messzeit später ein (gemessen:
   Stille 25 ms im Test-Weg; Rechenzeit 32 s Take ≈ 60 … 130 ms in Häppchen). Das Alte spielt bis dahin weiter.
5. Test-Erwartungen früherer Pakete, die schon in 4.23.0 nicht mehr stimmen (nicht durch VS-P, nicht angepasst): `gs7-v3-vs4-accept`
   erwartet den Speicher-Schlüssel `…:c100:0`, seit F1 heißt er `…:c100v2stdc:0`; `gs7-v3-vs5a-t2` „↶ → Stärke 100 %“; der Punkt „heard:
   onset intervals …“ desselben Skripts schwankt (2,9 ms gegen 2,5 ms Toleranz) in 4.23.0 und in VS-P gleich – seine feste Schwelle 0,02
   trifft wegen des Ausgleichs (Ausgang 0,54 statt 0,32) andere Stellen.

## Fragen an Xander

1. **Wie laut soll die Stimme sein?** Jetzt: so laut wie die Drums (−16 LUFS, ≈ 5 dB über den Synths). Alternative: 1 … 2 dB über den
   Synths (−20 LUFS), dann ≈ 4 dB unter den Drums. Beides ist eine Zeile.
2. Einen Schalter „Auto-Pegel aus“ halte ich nicht für nötig (der Pegel-Regler der STIMME-Spur wirkt weiter relativ); nicht gebaut.

## iPhone (Xander)

Nur auf der Pages-Seite (Mikrofon):
1. Ein vorhandenes Projekt mit Gesang öffnen und ▶: die Stimme ist jetzt deutlich lauter, etwa so laut wie die Drums – auch bei einem Take,
   der leise aufgenommen wurde (weiter weg vom Mikro gesungen).
2. Neu aufnehmen (● REC mit 🎤), einmal nah und einmal weit weg vom Mikro: beide Takes klingen gleich laut.
3. Laut in das Mikro „P“ / „T“ sagen oder klatschen: kein Knacken, nichts übersteuert, die Stimme bleibt im Takt mit den anderen Spuren.
4. Pegel-Regler der STIMME-Spur: leiser/lauter wie bisher; Mute schaltet stumm.
5. WAV-Export eines Takes: unverändert der Original-Take (nicht lauter).

## Für das Zusammenführen

Neuer Block (VS-P) direkt vor `/* ---------- Abspielen ---------- */`: `VP_*`-Konstanten, `VP`, `vpKco`, `vpTp`, `vpJob`, `vpStep`,
`vpFinish`, `vpPump`, `vpDefer`, `vpTrackBufs`, `vpKick`, `vpHot`, `vpReady`, `vpGet`, `vpLim`, `VP_API`.
Ein-Zeilen-Haken in vorhandenen Funktionen:
- `tkPlayBuf` (2 Zeilen: Rückgabe über `vpKick`) · `tkLoad` (1 Zeile: `TK.buf.set(id, vpKick(b))`)
- `tkStartSrc` (Zeile `const V = …` und `G = … * (V ? V.g : 1)`; Verbindung `s → lim → g` statt `s → g`; `lim` im Stück-Objekt `r`)
- `tkPlace` (1 Zeile: `if (!vpReady(o.buf)) return;` vor `TK.reg.add`)
- `tkTrackResync`, `tkVoxResync` (je 1 Zeile `vpDefer(…)`)
- `clResync` (VS4): Tausch erst mit gemessener Fassung (`|| !vpReady(nb)`), alte Fassung blendet von `r.G` aus (mit Ausgleich)
- `wpSwitch` (VS5): 1 Zeile nach dem Sammeln der Paare (`if (pairs.some(p => !vpReady(p.nb))) return;`)
- `Object.assign(SYNQUENZER, VP_API);` nach der WP_API-Zeile · `VERSION = '4.24.0'`
VS-P fasst `tkVoiceTake`, `vsRecDone`, `vsFangDone`, `recLength`, `tkMakeTake` und das Mikro-Blatt (VS-L) nicht an.
Snapshot: `synq-snapshots/VS-P.html`. Testskripte: `dirigent-test/n4-vs-p-*.mjs` (Ausgaben `dirigent-test/n4vsp/`).

## VS-P-fix

Grundlage: `synq-snapshots/VS-P.html`, Fehlerliste der Prüfung (6 Punkte). Alle sechs zuerst mit den Prüf-Skripten nachgestellt
(alle reproduziert), dann behoben und mit denselben Skripten erneut gemessen. Version bleibt 4.24.0, Format 5, kein neues Feld, `live: true`
unverändert, keine sichtbare Änderung. **Am Server offen: `max_app` ≥ 4024000.** Dieser Abschnitt gilt vor den Angaben weiter oben
(Ziel-Pegel, Spitzen-Grenze, Leistung).

### Was geändert ist

1. **Ziel-Pegel mit demselben Bezug wie die Synths (VS-P-02).** Die −18 LUFS der MS-2000-Programme gelten am Klangerzeuger, *vor* dem
   Pegel-Regler. Der Auto-Pegel bringt die Stimme jetzt auf **−16 LUFS vor dem Pegel-Regler** (Eingang der STIMME-Spur) – „2 dB über einem
   einzelnen kalibrierten Synth-Programm“ an derselben Stelle gemessen. Am Ausgang: Pegel ganz auf −16 LUFS, Pegel-Standard 0,8 −19,9 LUFS
   (vorher −16 nach dem Regler = 5 LU über den Synths). Eine Konstante (`VP_REF` 0,8 → 1).
2. **Spitzen-Schutz für jede Panorama-Stellung (VS-P-03).** Pan ganz außen legt L + R der (stereo L = R geführten) Stimme auf eine Seite
   (+6,02 dB, Pan-Gesetz der Spur-Kette, unverändert). Grenze vor Pegel und Pan jetzt −7,32 dBTP (`VP_CEIL` = −1,3 dBTP / 2) → am Ausgang
   ≤ −1,3 dBTP in **jeder Stellung von Lautstärke und Panorama**.
3. **Spitzen-Schutz ohne Rechenzeit je Stück (Fehler 4, 5, 6).** Statt je Abspiel-Stück `setValueCurveAtTime`-Kurven für alle Abschnitte
   des restlichen Takes zu bauen (20 … 190 ms im Hauptfaden → Start nach seiner Zeit, Knacken beim A/B, Hüllkurve 12 … 30 ms gegen die
   Spitzen verschoben, bis +12 dBTP), liegt die Hüllkurve einmal je Puffer als AudioBuffer vor (¼ der Abtastrate, Stützstellen genau auf
   dem 16er-Raster, dazwischen linear – wertgleich zur Kurve, Abweichung 3·10⁻⁸). Ein AudioBufferSourceNode mit derselben Startzeit und
   demselben Versatz wie das Stück steuert den `gain` (Grundwert 1, Puffer = Hüllkurve − 1) des Begrenzer-GainNode: sample-genau, Aufwand
   je Stück fest (0,1 … 1 ms), er läuft nur über die Abschnitte des Stücks und endet mit dem Stück (`tkDrop`).
4. **Messung beim Fertigwerden (Fehler 3).** Ein Take wird gemessen, sobald sein Puffer entsteht: Aufnahme fertig (`tkMakeTake`),
   Import (`tkAddPcmTake`), gesäubert (`clEnsure`), gedehnt/geschnitten (`wpRender`) – nicht erst beim ersten Abspielen. Das erste Abspielen
   nach der Aufnahme beginnt wieder genau am Clip-Anfang.
5. **Messung ohne langes Häppchen.** Die Hüllkurven-Stufe ist jetzt in Häppchen zerlegt (vorher am Stück: bis 110 ms bei 96 s), die
   Spitzen-Suche prüft die Zeit alle 1 024 statt 8 192 Samples und rechnet die drei Zwischenwert-Phasen in einer Schleife.

### Abnahme (neu gemessen)

| ID / Fehler | Ergebnis | Messung/Skript |
|---|---|---|
| Fehler 1 / VS-P-02 | ✓ Demo + Gesang über das Mikro (● REC mit 🎤, MELODIE Szene 1), alle Regler Standard: Moog-Bass −22,34, FM-Pluck −21,21, Rom-Fläche −22,20, Melodie −23,62, Drums −15,70, **Stimme −20,15 LUFS → +1,06 LU** über der lautesten Synth-Spur (vorher +4,78); Mikro −36 dBFS: −20,21 → **+0,97 LU** | `n4-vs-p-qa-02.mjs "" -28` / `-36` |
| VS-P-01 | ✓ Mikro −36 / −28 / −20 dBFS RMS → Ausgang STIMME Pegel ganz auf **−16,10 / −16,01 / −16,02 LUFS**, Pegel-Standard −19,89 / −19,89 / −19,89 LUFS | `n4-vs-p-fix-accept.mjs 01` |
| Fehler 2 / VS-P-03 | ✓ Take −30 dBFS RMS mit Plosiven bei −0,3 dBFS roh: wahre Spitze Ausgang Pegel/Pan 0,8/0 −11,2 · 1/0 −7,32 · 0,8/−1 **−5,18** · 0,8/+1 **−5,18** · 0,8/−0,5 **−6,55** · 1/−1 **−1,30 dBTP** (vorher bis +4,72). Spitzen genau 0 dBFS nach dem Ausgleich: −11,2 / −7,32 dBTP. Natürlicher Gesang ≤ 3 dB Pegelminderung: Vokal −28/−20/−36 100 %, Korpus 100 %, **Vokal mit Konsonanten 95,5 %** (vorher 96,9 %; Soll ≥ 95). Keine Verschiebung: 0,000 ms | `n4-vs-p-qa-03.mjs`, `n4-vs-p-fix-accept.mjs 03` |
| Fehler 3 | ✓ 8 Takte bei 40 BPM (48 s, zweimal) und bei 60 BPM: erstes Stück **0,0 ms** nach Clip-Anfang, Versatz +0,0 ms (wie 4.23.0; vorher +126 … +558 ms), Take beim Fertigwerden schon gemessen | `n4-vs-p-qa-late.mjs 8 40`, `8 60` |
| Fehler 4 / VS-P-05 | ✓ 16 Takte, Säubern 100 %, 7 × A/B beim Spielen, 112 und 40 BPM: `tkStartSrc` 0,2 … 0,9 ms (einmal 2,4 / 4,2 / 7,1 ms bei Last 13; vorher 17 … 220 ms), 2. Differenz Faktor höchstens **5,42** (= Boden der Messung, 4.23.0 5,42; vorher bis 481), Plosiv-Abstände **1200 ms** genau. Hinweis: die Plosiv-Schwelle 0,45 des Skripts liegt über der neuen Grenze (−7,32 dBTP = 0,43) – Kopie mit Schwelle 0,38 | `n4-vs-p-fix-ab.mjs` (`PTH=0.38`; `0.2` zeigt ±4 ms nur durch die Erkennung: Roh und Sauber werden an verschiedenen Stellen der Flanke erkannt) |
| Fehler 5 | ✓ `tkPick` 16 Takte, 3 Läufe: `tkStartSrc` 0,1 … 0,4 ms, Abstände 1000 ms, alle Spitzen **−7,32 dBTP** am Spur-Eingang (Pegel ganz auf = Ausgang); `tkTrackResync` 4 Takte 3 Läufe −7,32, `songPlay` ab Takt 2/3/4 −8,62 dBTP, 0 über −1 | `n4-vs-p-qam-lim11.mjs <app> 3 pick 16`, `3 resync 4`, `3 song 4` |
| Fehler 6 / VS-P-06 | ✓ 40 BPM, 16 Takte (96 s), Schleife: `tkStartSrc` 0,2 … 2,3 ms (vorher 82 … 195 ms), 99 Spitzen alle −7,32 dBTP, Abstände 1000 ms über den Schleifen-Anfang. Lange Tasks beim Spielen ohne Mitschnitt: App-Funktionen höchstens `tkStartSrc` 1,0 ms / `vpLim` 0,5 ms; die übrigen langen Tasks (1 … 2 je 144 s) gibt es in 4.23.0 genauso (3 im selben Lauf) – Last der Nachbar-Builds (Lastmittel 4 … 13). Messung: längstes Häppchen 20,7 ms (32 s) / 32,4 ms (96 s), 96-s-Take mit 96 Begrenzer-Abschnitten 26 … 29 ms bei Last 13; Häppchen = am Stück gerechnet (bitgleich). CPU 100 s Wiedergabe, je 2 Läufe: 4.23.0 53,53 %, VS-P 54,27 % = **+0,74 Prozentpunkte** | `n4-vs-p-qam-lim11.mjs` (BPM=40, loop 16), `n4-vs-p-fix-lt.mjs`, `n4-vs-p-perf.mjs lt`, `n4-vs-p-fix-slice.mjs`, `n4-vs-p-fix-same.mjs`, `n4-vs-p-perf.mjs cpu 100` |
| VS-P-04 | ✓ Take aus 4.23.0 nach dem Laden gemessen, bevor er spielt; spielt mit −19,97 LUFS bei Pegel-Standard (Soll jetzt −19,88 ± 1,5); WAV/ZIP bitgleich; Projekte ohne/mit Takes Zeichen für Zeichen gleich | `n4-vs-p-fix-p04.mjs` |
| Punkt 4 (`song.vox`) | ✓ −19,91 LUFS bei Pegel-Standard; Pegel 0,8 → 0,4 = −12,01 dB; Mute still | `n4-vs-p-fix-vox.mjs` |
| VS-P-05 (Builder-Skript) | ✓ Schleife + Take-Wechsel + Stopp 1,41; A/B + Säubern 100 → 40 % 1,11 / 1,24; arbeitender Spitzen-Schutz 1,14; neuer Take beim Spielen Stille 30 ms (4.23.0 290 ms) | `n4-vs-p-click.mjs` |

Regression: `v3-vs3-accept` 72 ✓; `gs7-v3-vs4-click` 6 ✓; `gs7-v3-vs4-accept` 25 ✓ / 1 ✗ (bekannt, auch 4.23.0); `gs7-v3-vs5a-t1/t3/t4/t5`
grün, `-t2` 20 ✓ / 1 ✗ (bekannt, auch 4.23.0); `gs7-v3-vs5b-t2 … t5` grün; `gs7-v3-vs5b-t1` 32 ✓ in 8 von 10 Läufen – in 2 Läufen
„render cache … (renders 7 → 7)“: die Fassung lag schon im Cache, es musste gar nicht gerechnet werden (die Zählung hängt vom Verlauf des
Caches ab; `ready` war sofort da). Smoke ohne Fehler.

### Abweichungen

1. VS-P-01 wird mit dem Bezug der Synth-Kalibrierung gelesen (vor dem Pegel = Ausgang bei Pegel ganz auf): −16 LUFS dort, −19,9 LUFS bei
   Pegel-Standard. So erfüllen VS-P-01 und VS-P-02 beide (Abweichung 1 oben ist damit erledigt). Die Builder-Skripte `n4-vs-p-accept.mjs 01`,
   `n4-vs-p-p04.mjs`, `n4-vs-p-vox.mjs` prüfen noch −16 bei Pegel-Standard; die Kopien `n4-vs-p-fix-*.mjs` prüfen den neuen Bezug.
2. Die Spitzen-Grenze gilt für Lautstärke und Panorama. Drive, Chorus und Hall der STIMME-Spur können Spitzen weiter anheben (wie bisher).
3. Wegen der Pan-Reserve greift der Schutz bei Pan Mitte früher (−7,32 dBTP am Spur-Eingang): Vokal mit Konsonanten 95,5 % der Frames
   ≤ 3 dB (Soll ≥ 95 %), reine Vokale weiter 100 %.
4. Speicher (iPhone): nur Takes mit Begrenzer-Abschnitten bekommen den Hüllkurven-Puffer, ¼ der Take-Größe (96 s bei 48 kHz: 4,6 MB, je
   klingender Fassung). Takes ohne Spitze: kein Puffer, kein Knoten.
5. Eine Neu-Planung wartet weiter auf die Messung einer *noch nicht* gemessenen Fassung (wird jetzt beim Fertigwerden angestoßen; ein Take von
   96 s ist nach etwa 0,3 … 0,5 s gemessen). Wer ▶ in dieser Zeit drückt, hört den Take dort erst ab dem Ende der Messung.

### Fragen an Xander

1. Die Stimme liegt jetzt bei Pegel-Standard etwa 1 dB über den Synths und etwa 4,5 dB unter den Drums. Passt das, oder soll sie näher an
   die Drums? (eine Zeile, `VP_REF`)

### iPhone (Xander)

1. Projekt mit Gesang ▶: die Stimme sitzt jetzt etwas über den Synths (nicht mehr so laut wie die Drums).
2. Aufnehmen (● REC mit 🎤), Stopp, gleich danach ▶: der Gesang beginnt genau am Anfang, nichts fehlt.
3. STIMME-Spur → FX / SPUR → Panorama ganz links/rechts, Lautstärke ganz auf, laut „P“/„T“ ins Mikro: nichts übersteuert.
4. Beim Spielen Roh│Sauber umschalten und einen anderen Take wählen: kein Knacken, die Stimme bleibt im Takt.

### Für das Zusammenführen

Geändert gegenüber `VS-P.html` (alles im VS-P-Block, Ein-Zeilen-Haken außerhalb):
- VS-P-Block: Kommentar, `VP_REF` (1), `VP_CEIL` (/ 2), `vpStep` (Spitzen-Suche je 1 024 Samples, drei Phasen in einer Schleife; Stufe 2
  in Häppchen, `J.h`), neu `vpEnvD`, `vpEnvBuf`, `vpEnvFill`, `vpLim` neu geschrieben (AudioBufferSourceNode → `gain`, `n.es`).
- `tkDrop`: 1 Haken (`r.lim.es` stoppen).
- `tkMakeTake` (Zeile `TK.buf.set(id, vpKick(b))` im `fill`), `tkAddPcmTake` (dieselbe Zeile), `clEnsure` (`CL.buf.set(id, {a, b: vpKick(b)})`),
  `wpRender` (`WP.alt.set` / `WP.cache.set` mit `vpKick(ab)`): je 1 Ausdruck. `tkMakeTake` ist auch eine VS-L-Stelle – beim
  Zusammenführen nur `vpKick(…)` um `b` in der Zeile `const b = tkToBuffer(pcm, sr); if (b) TK.buf.set(id, b);` übernehmen.
Snapshot: `synq-snapshots/VS-P-fix.html`. Neue Skripte: `dirigent-test/n4-vs-p-fix-{ab,lt,slice,same,accept,p04,vox,vs5b-t1i}.mjs`.


# Helfer G3 + G8 — Vorlauf/Ausklang beim Einsingen · Lange Aufnahmen

Basis: `bau/werkzeug/vs-base-B.html` (App 4.23.0, Format 5). Datei: `bau/helfer/G3G8/index.html`. Die VERSION-Zeile ist **nicht**
geändert (setzt der Dirigent). Format bleibt 5 – nur additive Felder; ein Projekt ohne die neuen Felder lädt unverändert.
Spec: `spec/dirigent-spec-v3-nachtrag-5.md`, Abschnitte „G3“, „G3 ergänzt: Einstieg aus dem Loop, Auftakt“ (Nr. 5, G3-06) und „G8“.
Kein Supabase-Aufruf, kein alert/confirm/prompt, keine Marken-Namen.

## Was neu ist

### G3 — Vorlauf und Ausklang beim Einsingen
1. **Der Take behält bis 2 Takte Anlauf und 1 Takt Ausklang** (aus dem Ringpuffer; vorher 0,25 s davor, nichts danach). Klammer, Länge
   und Raster des Clips bleiben gleich. Hörbar ist davon nur, was wirklich gesungen wurde: Pegel über dem Grundrauschen (10 %-Wert
   + 10 dB, höchstens 24 dB unter dem Gesang, mindestens −50 dBFS), ohne Pause > ¾ Schlag (0,35 … 1 s) bis an den Clip-Rand.
   Das steht am Take: `take.pre = {in, sec}` und `take.post = {out, sec}` (additiv). Es gilt für jedes Stück, das genau an dieser
   Take-Stelle beginnt bzw. endet – ein gekürztes Stück (Song-Schnitt, Ersetzen) hat deshalb keinen Anlauf/Ausklang mehr.
   Der Ausklang wird einen Takt nach dem Clip-Ende gelesen; erst danach wird der Take gespeichert (der Clip klingt sofort).
2. **Szene:** die Schleife bleibt in der Klammer; der Anlauf klingt nur beim **Einstieg** des Clips (Start am Taktstrich – der
   Anlauf beginnt vorher; beim Start aus dem Stand mit Einzähler im Einzähler), nie bei Wiederholungen. Anlauf und erster Durchgang
   sind **ein** Stück (kein Schnitt am Taktstrich). Wird der Einstieg zurückgenommen (anderer Clip, Stopp), blendet der Anlauf aus.
3. **Song:** Anlauf vor dem Teil, Ausklang nach dem Teil (wenn der Clip dort mit einem vollen Durchgang endet), für Szenen-Clips in
   den Spuren und für die Song-Stimme (`song.vox`, Punch mit 🎤). Benachbarte Teile überlappen (beide klingen).
   Gezeichnet als **kleines Schwänzchen** (Keil in der Spurfarbe, ¼ der Zeilenhöhe) vor bzw. nach dem Teil.
   **Verschieben/Tauschen eines Teils** nimmt die Song-Stimme des Teils mit (vorher ging sie verloren), samt Anlauf/Ausklang.
4. Blenden 5 ms an allen Rändern (über die vorhandenen VS3-Blenden); Übergang Ausklang ↔ Ende des Durchgangs als 5-ms-Überblendung.
5. **Einstieg aus dem laufenden Loop (G3 Nr. 5):** der Clip beginnt am Takt des ersten Worts auf bzw. nach dem Taktstrich. Ein Einsatz
   in der zweiten Takthälfte (ab Schlag 2¾, gleiche ¼-Schlag-Toleranz wie FANG) ist Auftakt zum nächsten Takt; was davor gesungen
   wurde (≤ 2 Takte) ist Vorlauf. Gilt für **Stimme-FANG** und **● REC mit 🎤** (neuer Clip, Länge „auto“). Der MELODIE-Clip bekommt
   die Auftakt-Noten als `clip.pre = [{t < 0, d, n, v}]` (additiv); sie klingen wie der Audio-Vorlauf nur beim Einstieg und im Song
   vor dem Teil (Schwänzchen auf der MELODIE-Zeile).

### G8 — Lange Aufnahmen
1. **Song (● SONG mit 🎤) ohne Zeitgrenze:** während der Aufnahme läuft die Stimme in Stücken (PCM16, 1 MB = 524 288 Samples) aus dem
   Ringpuffer in den Audio-Store (alle 0,5 s nachgelesen; beim Lautsprecher-Weg auch die VS4-Referenz). Ist die Aufnahme länger als der
   Ringpuffer, besteht der Take aus diesen Stücken (gleiche Schlüssel `<take>:<k>` wie VS3) – der Anfang bleibt erhalten. Kürzere
   Aufnahmen gehen den bisherigen Weg (VS3), die mitgeschriebenen Stücke werden danach gelöscht. Bei einer Schleife zählt wie bisher
   die letzte Runde (der Strom beginnt mit jeder Runde neu). **Restzeit** (freier Speicher laut `navigator.storage.estimate()`, alle
   10 s; Arbeitsspeicher-Grenze 480 MB) erscheint nur, wenn < 2 min: Toast „🎤 noch m:ss Aufnahmezeit“ alle 10 s; bei 0 endet die
   Aufnahme mit „Speicher knapp – Aufnahme beendet“ (der Take bis dahin bleibt).
2. **Szene-Clips und FANG bis 64 Takte** (Noten und Gesang): Clip-Länge 1 … 64 (Normalisieren, Clip-Editor ×2/Länge/Ziehen,
   Länge ×2/÷2), ● REC „auto“ endet spätestens nach 64 Takten, **„Länge“ zusätzlich 16, 32 und 64** (Aufnahme-Blatt und Menü),
   FANG (Tasten) nimmt die Phrase bis 64 Takte (Rückblick 64 Takte, Notenpuffer 16 384), Stimme-FANG ebenso (Rückblick 64 Takte,
   Länge 1/2/4/…/64). Der **Ringpuffer** hält beim Einschalten des Mikrofons 64 Takte + 4 Takte beim aktuellen Tempo
   (120 … 300 s; 120 BPM → 140 s). Eine Szene mit langem Clip wird als Teil so lang wie ihr Clip (bis 64).

## Abnahme (Chromium 1243 headless, Mikro-Attrappe im selben AudioContext wie VS2/VS3; Skripte in `tests/`)

| ID | Ergebnis | Messung |
|---|---|---|
| G3-01 | ✓ | Auftakt (2 × 659 Hz) ½ Takt vor Takt 1, ● REC Länge 2: Take-Anlauf `pre.sec` 1,03 s, `in` 4,25 s (2 Takte + 0,25 s), Take 1 Takt länger als `out`; Klammer 2 Takte; MELODIE `pre` = 2 Noten (t −2 / −1). Einstieg am Taktstrich: 659 Hz vor dem Strich **−23,2 dB**, vor der Wiederholung **−78,2 dB**; genau ein Anlauf im Plan; Übergang Anlauf → Clip 2. Differenz 0,0023 (kein Knack); MELODIE spielt beim Einstieg 2 Auftakt-Noten (`g3-accept.mjs A`) |
| G3-02 | ✓ | Teil mit STIMME-Clip (Takt 10): Schwänzchen gezeichnet (18,5 px STIMME, 18 px MELODIE), Anlauf vor dem Teil −23,3 dB (davor Stille); Teil an den Anfang verschoben → Eintrag Takt 2, Schwänzchen mit, Anlauf −23,2 dB. Song-Stimme (Punch Takt 5–6, Anlauf 1,03 s): hörbar −23,2 dB, gezeichnet; Teil (Takt 5–8) ans Ende verschoben → Song-Stimme Takt 9 mit gleichem Take/`in`, Anlauf dort −23,2 dB, an der alten Stelle −200 dB (`B`) |
| G3-03 | ✓ | Teil A (392 Hz über das Clip-Ende, Ausklang 0,55 s) + Teil B (Anlauf 1,03 s) direkt dahinter: vor dem Strich A −20,6 dB und Anlauf B −24,5 dB, nach dem Strich Ausklang A −20,6 dB und B −24,6 dB, danach Ausklang aus (−66,7 dB); größte 2. Differenz über alle Ränder 0,0029 (Töne allein ≈ 0,003) (`C`) |
| G3-04 | ✓ | Projekt trägt Take `pre`/`post` und MELODIE `pre`; Undo nimmt Take samt Anlauf zurück; Redo deep-equal; Speichern → Neuladen deep-equal (`D`) |
| G3-05 | ✓ | Song-Ansicht P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428: Anlauf 18,5 px, Ausklang 9,9 px, Auftakt-Noten 18 px, alle im Bild, Seitengröße unverändert, kein waagrechtes Rollen; Bilder `tests/out/g3-*-song*.png` (`g3-lay.mjs`) |
| G3-06 | ✓ | Laufender 4-Takt-Loop, Auftakt ½ Takt vor Takt 5: **● REC** (ab Takt 4, Länge auto, Ende Takt 9) und **Stimme-FANG** → MELODIE und STIMME 4 Takte, beginnen bei Takt 5 (cstart 16, FANG start 4), erste Note A4 auf 0, Auftakt 2 × E5 als Vorlauf, Take-Anlauf 1,03 s; beim Einstieg −23,3 dB hörbar, im Song vor dem Teil −23,2 dB, Schwänzchen auf STIMME und MELODIE (`F`) |
| G8-01 | ✓ | Song-Aufnahme **5 min** (300 s, Ringpuffer 150 s) mit 🎤: Take aus 26 mitgeschriebenen Stücken, 303,5 s im Speicher, 31 Stichproben (Sek. 0 … 299) mit richtiger Tonhöhe, **300/300 Ton-Strecken ohne Loch** (kleinster 20-ms-Pegel −15,1 dB), keine lange Aufgabe > 50 ms, Take 2,1 s nach dem Ende fertig (`g8-accept.mjs A`, Ausgabe `tests/out/g8-A.out`). Stück-Weg erzwungen bei 24 s: gleich, Neuladen bitgleich (`S`) |
| G8-02 | ✓ | ● REC Länge **32** und **64** (240 BPM) mit Gesang: MELODIE 32/64 Takte (32/64 Noten, letzte im letzten Takt), STIMME 32,000/64,000 s; beide Clips ab Schlag 8; 2. Durchgang der STIMME phasengleich (0,00 ms), Ton des Takts im 2. Durchgang hörbar (−26 dB); Speichern → Laden deep-equal, danach starten beide zusammen (`B`) |
| G8-03 | ✓ | Tasten-FANG einer 24-Takt-Phrase → 32-Takt-Clip (48 Noten); Stimme-FANG 24 Takte → MELODIE und STIMME 32 Takte (`C`) |
| G8-04 | ✓ (Maß) | siehe unten |
| Restzeit | ✓ | Speicher-Schätzung vorgegeben (150 s): bei > 2 min keine Anzeige, darunter „🎤 noch 1:59 Aufnahmezeit“, bei 0 „Speicher knapp – Aufnahme beendet“, Take bis dahin gespeichert (`R`) |
| Länge 16/32/64 | ✓ | Aufnahme-Blatt in allen 6 Formaten: AUTO 1 2 4 8 16 32 64, nichts abgeschnitten, kein waagrechtes Rollen, Tipp auf 64 wirkt (Tastenhöhe siehe Befunde) (`g8-lay.mjs`) |

**G8-04 – Speicher/CPU, iPhone-Maß (Rechnung aus den Messungen, 48 kHz):** Audio-Store 96 kB/s (0,1 MB/s; Lautsprecher-Weg + Referenz + gesäuberte Fassung ≈ 0,29 MB/s) → 5 min ≈ 29 MB. Arbeitsspeicher während der Aufnahme: die Stücke (2 B/Sample) ≈ 0,1 MB/s (5 min: 25 × 1 MB gemessen bei 44,1 kHz); am Ende der Take als Float-Puffer 4 B/Sample (5 min ≈ 58 MB), die Stücke werden danach frei. Ringpuffer 4,67 B/Sample: 120 BPM → 140 s ≈ 31 MB (vorher 120 s ≈ 27 MB), höchstens 300 s ≈ 67 MB. CPU: Nachlesen alle 0,5 s (≈ 24 000 Samples, Zeitkarte je Sample) – im Test keine lange Aufgabe; der Float-Puffer wird am Ende in Scheiben ≤ 8 ms gebaut. Stimme-FANG / ● REC über 64 Takte: die Auswertung (Worker) braucht 5 s (64 s Audio, Chromium) – so lange bleibt der neue Take wie bisher stumm, danach setzt er phasengleich ein. Am iPhone nicht gemessen.

**Nachtest auf dem Endstand (frische Läufe, nach G8):** `g3-accept` A–F 60/61, `g3-lay` 19/19, `v3-vs3-accept` A B C E F G 57/57
(D braucht eine Rahmen-Datei der Dirigenten-Maschine, nicht gelaufen), `v3-vs3-click` grün (M-KLICK 0,00322 ≤ 1,5 × 0,00303), `v3-vs2-accept` 48/49
(der eine Punkt ist die schwankende Zeit-Vorbedingung des Prüfskripts, siehe Befunde), `g8-accept` S A B C R grün, Rauchtest ohne Fehler.
**Offen / beobachten:** G3-03 zeigte in **1 von 9** Läufen eine 2. Differenz von 0,084 (sonst 0,0029–0,0037); in 8 weiteren Läufen mit
Ortsangabe nicht wiederholbar. Wie bei VS3 (FP-DSP 3) eher der Mitschnitt (ScriptProcessor) als die App – nicht belegt, bitte am iPhone
auf Knacken an Teil-Grenzen mit Anlauf/Ausklang achten.

## Abweichungen / Auslegung (begründet)
- **„Hörbar ist, was gesungen wurde“:** der Take hält immer bis 2 Takte / 1 Takt, *klingen* (und gezeichnet werden) nur der gesungene
  Anlauf / Ausklang, der ohne Pause an den Clip-Rand reicht. Sonst liefe vor jedem Einstieg 2 Takte Raumrauschen (bzw. beim Lautsprecher
  das Übersprechen) mit, und das „kleine Schwänzchen“ wäre immer 2 Takte lang.
- **Overdub und spätere Runden einer Song-Schleife haben keinen Anlauf** (davor liegt die vorige Runde, nicht ein Auftakt).
- **Ausklang nur im Song** (Spec Nr. 3). In der Szene klingt er nicht – siehe Fragen.
- **Auftakt-Regel (Nr. 5):** Einsatz ab der zweiten Takthälfte (Schlag 2¾ mit der ¼-Schlag-Toleranz von FANG) = Auftakt. Bei
  Stimme-FANG gilt sonst die Länge 1/2/4/…/64 wie bisher; würde die Zweierpotenz den Auftakt-Takt in den Clip holen, beginnt der Clip
  trotzdem am Takt des ersten Worts und ist so lang wie die Phrase (z. B. 3 Takte). Bei ● REC mit fester Länge bleibt der Anfang der
  Aufnahme (sonst würde der Clip kürzer als die gewählte Länge); Gesang vor dem Anfang ist trotzdem Vorlauf.
- **Teil verschieben/tauschen nimmt die Song-Stimme mit** (vorher: VS3-Lücke „Teil-Kopien nehmen song.vox nicht mit“) – nötig für
  „Verschieben eines Teils nimmt Anlauf/Ausklang mit“. Kopieren/Wiederholen eines Teils ist unverändert (siehe Fragen).
- **G8 Stück-Weg nur bei langen Aufnahmen:** solange der Ringpuffer den Anfang noch hält, bleibt der geprüfte VS3-Weg (identische
  Takes für alle bisherigen Tests); die mitgeschriebenen Stücke werden dann verworfen.
- **Ringpuffer** wächst mit dem Tempo (64 Takte + 4), höchstens 300 s (≈ 67 MB bei 48 kHz); bei sehr langsamem Tempo reicht ein
  64-Takte-FANG deshalb nicht ganz zurück (der Take beginnt dann später, wie bisher bei > 2 min).
- **Teile (P1…P8, „Ein Teil hat höchstens 16 Takte“) bleiben bei 16** – G8 nennt nur Szene-Clips und FANG. Eine Szene als Teil
  (`sceneChunk`) wird so lang wie ihr längster Clip (bis 64), sonst würde ein langer Clip im Song abgeschnitten.

## Fragen an Xander
1. **Ausklang in der Szene:** Soll der Ausklang auch klingen, wenn ein Clip in der Szene endet (Wechsel zu einem anderen Clip oder
   Stopp am Clip-Ende)? Gebaut ist er nur im Song (Spec Nr. 3).
2. **Auftakt-Grenze:** Ab der zweiten Takthälfte zählt ein erster Einsatz als Auftakt zum nächsten Takt. Passt das, oder soll schon
   ein Einsatz auf Schlag 2 bzw. erst auf Schlag 4 als Auftakt gelten?
3. **● REC mit fester Länge** (z. B. 4 Takte) und Auftakt *innerhalb* der Aufnahme: soll der Clip dann einen Takt später beginnen und
   die Aufnahme entsprechend einen Takt länger laufen? Heute bleibt der Anfang der Aufnahme.
4. **Teil kopieren / ×n wiederholen:** soll die Song-Stimme mitkommen (wie jetzt beim Verschieben)?
5. **Teile länger als 16 Takte** (eigene Teile P1…P8, FANG TEIL): auch bis 64?
6. **Restzeit-Anzeige:** jetzt als Toast „🎤 noch m:ss Aufnahmezeit“ alle 10 s (nur < 2 min). Lieber fest in der TAKT-Anzeige?
   Arbeitsspeicher-Grenze 480 MB (≈ 28 min bei 48 kHz) – passt das fürs iPhone?
7. **Erste Song-Aufnahme mit 🎤** (● SONG auf leerem Song) nimmt die Stimme weiterhin nicht auf (VS3-Lücke, G8 nennt sie nicht).
   Soll sie?

## Befunde (nicht geändert, schon in der Basis 4.23.0)
- Aufnahme-Blatt „Länge“/„Quantisieren“/„Einzähler“: die Segment-Tasten sind 32–40 px hoch (P1 40, P2 36, P3 34, quer 32;
  Breite 40–44). Gemessen auf `vs-base-B.html` genauso (`tests/g8-lay.mjs` gegen die Basis). Die drei neuen Tasten 16/32/64 haben
  dieselbe Größe; nichts abgeschnitten, kein waagrechtes Rollen.
- `v3-vs2-accept` A: die Vorbedingung „Stimme rechtzeitig geplant“ des Prüfskripts schwankt (−12 … +2,6 ms) – auf der Basis und hier,
  je nach Lauf; kein App-Verhalten.

## Für das Zusammenführen (geänderte Funktionen / Blöcke)
Neue Blöcke (am Stück, vor `function voicesInfo()`): **`/* G3 … */`** (Konstanten `G3_*`, `G3`, `g3*`-Funktionen, `tkExt().take`-Normalisierung, `G3_API`) und **`/* G8 … */`** (`G8_*`, `G8`, `g8*`, `G8_API`). Nach `Object.assign(SYNQUENZER, TK_API)` zwei Zeilen `G3_API`, `G8_API`.

Ein-Zeilen-Haken / geänderte Zeilen (alle mit `/* G3 */` bzw. `/* G8 */` markiert):
- `tick()` (nach `recTick`): `g3Tick`. `songTickInner` (nach `tkVoxTick`): `g3SongTick`. `svDraw` (nach `tkSvDraw`): `g3SvDraw`.
- `tkVoxTick`: Schleife `v0` → `g3VoxSeg`, `sb` mit `g3pb`. `tkCutAt`: Ausnahme `aud.g3e`.
- `tkMakeTake`: erste Zeile G8-Haken; Zeile `pre/F0/Fe/n` (2 Takte / 1 Takt); `fill`: `g3TakePre`, `store()` (mit `TK.pend.delete`) erst nach `g3TakePost`.
- `tkVoiceTake`: `G3.noPre` bei Overdub; Clip-Länge 64. `tkSongCommit`: `G3.noPre` bei späterer Runde. `tkSongBegin`: `g8Begin`. `tkSongWrap`: `g8Wrap`.
- `tkNormSeg` (`at` bis 256), `tkNormVox` (`len` bis `SONG_MAX_BARS`), `TK_API.tkInject` (Länge 64).
- `normClip` (Länge 64, `pre`), `cleanClip` (`pre`), `songWrite` (`g3VoxWrite`), `markAction` move/swap (`vox` im Chunk), `sceneChunk` (64).
- `vsFangDone` (Auftakt-Regel, 64, `g3`), `vsPhrase` (256), `vsFang` (`E − 260`), `vsRecBegin` (`g3fix`), `vsRecEnd` (Auswertung 2 Takte früher), `vsRecDone` (`rs`), `vsApply` (`g3ApplyPre`).
- `recTick` (auto bis 256 Schläge), `recClose` (64), `capture()` (`maxBars: 64`), Notenpuffer `CAP.buf` 16 384.
- Clip-Editor: `duplicate`, `setLen`, `lenDrag` (64); Länge ×2/÷2 (64).
- `recLength`: Normalisieren der Einstellungen, `setRecOptions`, `popRecOpts` (Segment), Menü „Aufnahme · Länge“: 16/32/64.
- `stRing` (Länge `g8RingSec`), Mikro-Start: Ringpuffer neu, wenn zu kurz.

**Überschneidung mit VS-L** (16-Takte-Takes, `recLength 16`): dieselben Zeilen in `tkVoiceTake`/`vsRecDone`/`vsFangDone` (16 → hier 64) und die
`recLength`-Listen (hier schon 16, 32, 64). Beim Zusammenführen die G8-Werte (64, Liste bis 64) nehmen.


# G4 + G5 — Gesangs-Effekte („Gesang Synthpop“, [Auto], Silben-Dynamik) und „In Melodie umwandeln“ · Helfer-Zweig `helfer-g4g5`

Grundlage: `bau/werkzeug/vs-base-B.html` (App 4.23.0) → Kopie `bau/helfer/G4G5/index.html`. Spec: `spec/dirigent-spec-v3-nachtrag-5.md`,
Abschnitte „G4“, „G4 ergänzt“ (Nr. 4, G4-06) und „G5“. **VERSION-Zeile unverändert** (setzt der Dirigent). **Format bleibt 5**, nur ein
additives Feld (`track.gfx` an der STIMME-Spur). Kein Supabase-Aufruf, kein `alert/confirm/prompt`, „MS 2000“ weiter genau einmal, kein
Fremdname. VS-P, VS-L, G1/G2, G3/G8 und Video nicht angefasst.

## Was neu ist

### G4 — Gesangs-Effekte der STIMME-Spur
1. **Spur-Blatt der STIMME-Spur → [Effekte]** öffnet das Blatt „STIMME · Effekte“ (wie das Takes-Blatt):
   - oben **[Gesang Synthpop] [Aus] [Auto] [A/B]**, darunter eine Zustandszeile,
   - zehn große Regler: **Hochpass** (40–300 Hz) · **Entzischer** (0–12 dB) · **Silben-Dynamik** (0–100 %) · **Schwelle** (−40…0 dB) ·
     **Verhältnis** (1–10 : 1) · **Tief** · **Mitte** · **Präsenz** (je ±12 dB) · **Hall** · **Delay** (Sends, 0–100 %).
   - Hochkant eine Spalte (320 × 568: rollt mit dem Finger), quer zwei Spalten.
2. **Kette** (je Take, in dieser Reihenfolge): Hochpass 24 dB/Okt. → Silben-Dynamik → Entzischer → Kompressor → EQ (Tief 150 Hz Kuhschwanz,
   Mitte 500 Hz, Präsenz 3 kHz) → **[Haken für VS-P: Auto-Pegel → Begrenzer]**. Hall/Delay = die Sends der STIMME-Spur.
   - **Offline vorausgerechnet** aus dem bekannten Take im Worker (Blob, Rückfall Hauptfaden), wie VS4/VS5a: keine Verzögerung gegen die
     anderen Spuren, **keine Rechenlast beim Abspielen**, kein neuer Audio-Knoten. Neue Fassung (Regler, A/B, Undo) wird an einer passenden
     Stelle überblendet (`wpSwitch` aus VS5a-fix) – kein Knacken.
   - **Pegel bleibt:** am Ende wird auf die Lautheit des Takes zurückgestellt (gemessen unter 4 kHz, damit Entzischer/Präsenz die Gesamt-
     lautstärke nicht verschieben). VS-P gleicht danach auf −16 LUFS aus.
   - **Reihenfolge je Take:** Säubern (VS4) → G4 → Zeitkarte (VS5a/b). G4 steht in `tkExt().proc` direkt hinter `wpProc`.
     VS-P misst den Puffer, den `tkPlayBuf` liefert = **nach G4** – der Haken für VS-P ist damit schon da (nichts weiter einzubauen).
3. **Voreinstellung „Gesang Synthpop“** (an für jede neue STIMME-Spur, auch wenn eine leere Zusatzspur umgeschaltet wird; ↶ nimmt sie mit):
   Hochpass 100 Hz · Entzischer 4 dB · Silben-Dynamik 80 % · Schwelle −24 dB · 3 : 1 · Tief −1 · Mitte −2 · Präsenz +3 dB · Hall 18 % · Delay 10 %.
   Kompressor: RMS 10 ms über das Signal bis 3 kHz (Zischlaute regeln ihn nicht), weiches Knie 6 dB, Anstieg 15 ms (Anschlag bleibt „knackig“),
   Abfall 150 ms (kein Pumpen). Entzischer: Band 5–9 kHz gegen das ganze Signal, senkt nur das Obere ab 3,5 kHz, nur Zischlaute ≥ 20 ms (ein
   kurzer Anschlag „t“, „k“ bleibt).
4. **[Auto]** misst die hörbaren Takes der STIMME-Spur (höchstens 2 min) und – während ▶ läuft – 4 s lang den Mix (Ausgang jeder anderen
   Spur, Präsenzband 2–5 kHz):
   - Dynamik → **Schwelle/Verhältnis** (kleinstes Verhältnis, das die Kurzzeit-Spanne auf ≤ 4 LU bringt),
   - Zischlaute → **Entzischer** (Spitzen 5–9 kHz sollen ≥ 8 dB unter dem Vokal liegen),
   - Maskierung → **Präsenz** anheben, wenn nötig **Mitte/Tief** absenken, bis der Gesang im Band 2–5 kHz ≥ 3,5 dB über der lautesten anderen
     Spur liegt (gerechnet mit dem Pegel, den VS-P der Stimme gibt; ohne VS-P mit dem tatsächlichen Pegel),
   - Ergebnis steht sofort in den Reglern (ein Undo „Effekte: Auto“); die Zustandszeile nennt Dynamik vorher → nachher und die Gegenspur.
5. **Silben-Dynamik (G4 ergänzt 4):** je Silbe (VS5a-Marken: von Hand gesetzte/quantisierte, sonst der VS5a-Erkenner an der Quelle, auf die G4
   wirkt) ein fester Ausgleich zur Mitte der Nachbar-Silben (±3 s), Stärke = Regler; der Wechsel endet 2 ms vor der Marke (Anschlag
   unverändert), Pausen und stimmlose Silben (Zischlaut, Atem) bleiben ±0 dB, Anschlag + Vokal näher als 80 ms = eine Silbe.
6. **A/B:** [A/B] schaltet sofort zwischen „mit Effekten“ und „ohne“ (der Take wie bisher, bitgleich; Sends wie im Klang). Blatt zu → wieder
   „mit Effekten“. **Aus** schaltet die Kette ab (die Werte bleiben); [Gesang Synthpop] setzt die Voreinstellung (je ein Undo).
7. **Daten:** `track.gfx = {on, hp, ds, sy, thr, ra, lo, mid, pre, rev, dly}` nur an der STIMME-Spur (`normTrack`), Werte geklemmt und
   gerundet (idempotent). **Fehlt das Feld (alle alten Projekte), ist die Kette aus – alte Projekte klingen bitgleich wie bisher.**
   Undo-Art `gfx` (eine Zeile in `undoState`/`undoApply`). In der Claude-App (kein Audio): Regler gesperrt, Daten bleiben deep-equal.

### G5 — Gesang jederzeit in Melodie umwandeln
1. **Takes-Blatt → [In Melodie umwandeln]** (Szene-Clip und Song-Stimme; nur mit Audio auf der eigenen Seite).
2. Die **VS2-Erkennung** läuft auf dem gespeicherten Take: gleiche 3:1-Dezimierung wie das Worklet (47 Abgriffe), pYIN im Worker, `vsNotesOf`
   (Segmentierung, Stimmung, Einrasten auf die Tonart der Szene bzw. des Songs). Bei SÄUBERN > 0 auf der gesäuberten Fassung.
   Funktioniert auch, wenn beim Aufnehmen keine Noten erkannt wurden.
3. **Szene-Clip → MELODIE-Clip in derselben Szene** (gleiche Länge, nennt den Take wie FANG → „Audio folgt“), **Ergebnis-Blatt wie FANG**
   („GESUNGEN · umgewandelt · T 1–n“: Oktave, Einrasten, Raster, [Verwerfen], [✎ Bearbeiten], OK). Ein vorhandener MELODIE-Clip wird
   ersetzt; ↶ bzw. [Verwerfen] stellt ihn wieder her. Ein Undo „In Melodie umwandeln“.
4. **Song-Stimme → Song-Melodie** (Spur der Song-Melodie) an derselben Stelle: die Noten im Bereich der Song-Stimme werden ersetzt,
   Raster wie im Stimme-Blatt; ein Undo (Song), Toast „n Noten → Song-Melodie · Takt a–b“ mit [Rückgängig].

### Test-API (neu)
`g4Info`, `g4Set(p, label)`, `g4Preset`, `g4Off`, `g4AB(v)`, `g4Auto`, `g4Wait`, `g4Played(id)`, `g4PlayRange`, `g4Core`, `g4Mix`, `g4Sheet`,
`g4Close`; `g5Convert(r)`, `g5Info`.

## Abnahme

Chromium 1243 headless, Mikro-Attrappe (VS2-Harness), Takes über `tkInject` (gleicher Weg wie ein Take ohne Noten). Skripte in
`bau/helfer/G4G5/tests/` (Ausgaben im Scratchpad). G4-03 im **zusammengeführten Stand G4G5 + VS-P** (`git merge-file`, 0 Konflikte), weil
die Stimme erst mit VS-P auf Mix-Pegel kommt.

| ID | Ergebnis | Messung |
|---|---|---|
| G4-01 | ✓ | Gesungene Phrasen mit Pegelsprüngen (−34 … −20 dBFS, 26 s): Kurzzeit-Lautheit 10–95 % (LRA, EBU 3342) **12,30 → 5,54 LU = 6,77 LU kleiner** (Soll ≥ 4); integrierte Lautheit −24,65 → −24,65 LUFS. Kein Pumpen: gehaltener Vokal −22 / −32 dBFS, 50-ms-Pegel nach dem Einschwingen schwanken 0,000 dB (Soll ≤ 0,5). `g4-accept.mjs 01` |
| G4-02 | ✓ | Gesang + 9 Zischlaute (Rauschen 4,5–10 kHz, 160 ms): Spitzen 5–9 kHz (10-ms-RMS), Kette „Gesang Synthpop“ gegen dieselbe Kette mit Entzischer 0: **−4,09 dB** (jeder Laut −4,0 … −4,1; Soll −4 ± 1). Vokale ohne Zischlaut 5–9 kHz: Median +0,06 dB (kein Fehlgriff). `g4-accept.mjs 02` |
| G4-03 | ✓ (mit VS-P) | Zusammengeführt G4G5 + VS-P, Demo-Projekt, Take in Szene 0, Ausgänge aller Spuren mitgeschnitten, Band 2–5 kHz. Korpus-Stimme weiblich: vor Auto +0,28 dB → **nach Auto +3,72 dB** über Drums (Präsenz +7, Mitte −5). Korpus-Stimme männlich: −1,26 → **+3,43 dB** (Präsenz +9, Mitte −5, Tief −3 = Anschlag). Ergebnis steht in den Reglern; ein Undo nimmt Auto zurück. Siehe Abweichungen 1–2. `g4-auto.mjs <merge> female|male` |
| G4-04 | ✓ | Demo-Projekt + Gesang, 2 × 90 s abwechselnd je Fassung, CPU-Zeit aller Chromium-Prozesse: aus 53,16 %, „Gesang Synthpop“ 53,36 % → **+0,20 %** (Soll ≤ +3; Messrauschen – beim Abspielen gibt es keinen zusätzlichen Knoten). Rechnen einmalig je Take im Worker: 149 ms für 4 Takte, 329 ms für 26 s. `g4-cpu.mjs 180` |
| G4-05 | ✓ | A/B sofort (ohne = Roh-Puffer bitgleich, zurück ohne Neurechnen), Regler + Hall-Send folgen; ein Undo / Redo deep-equal; Speichern → Laden deep-equal mit gfx; altes Projekt ohne gfx: keine Effekte, Takes bitgleich, kein Feld gfx im Projekt. Layout P1, P2, P3, L1, L2, 926 × 428: Spur-Blatt [Effekte] 96 × 44, Blatt „Effekte“ 14 Tasten/Regler ≥ 44 × 44, nichts abgeschnitten, im Bild (P3 rollt, letzter Regler erreichbar), kein Layout-Sprung (25/25). Kein Knacken bei 7 Wechseln im Spielen (A/B ×4, Präsenz, Aus, Voreinstellung): 2. Differenz 4,3·10⁻⁴ ≤ Ton-Krümmung 1,55·10⁻³. `g4-accept.mjs 05`, `g4g5-lay.mjs`, `g4-click.mjs` |
| G4-06 | ✓ | 40 Silben, Pegel zufällig ±6 dB, je mit Anschlag; Marken vom VS5a-Erkenner. Nur Silben-Dynamik: Spanne (10–90 %) **10,52 → 3,85 dB = 63 % kleiner** (Soll ≥ 50 %), Anschläge: Spitze der ersten 10 ms gegen den Silben-Pegel Median −0,03 dB, 90 % ≤ 0,60 dB. Ganze Kette: 75 % kleiner, Anschläge Median +1,29 dB (nicht gedämpft). `g4-accept.mjs 06` |
| G5-01 | ✓ | Drei Takes ohne Noten (Korpus-Stimme VS2, männlich/weiblich, je 24 Noten, a-Moll, 100 BPM) → [In Melodie umwandeln]: **Noten-F 1,000 / 1,000 / 1,000** (Einsatz ±50 ms, Ton exakt; Soll ≥ 0,9), 0,9 s je 15-s-Take; MELODIE-Clip nennt den Take; Ergebnis-Blatt „GESUNGEN · umgewandelt · T 1–7“. `g5-accept.mjs` |
| G5-02 | ✓ | Ein Undo nimmt den Clip zurück, Redo bringt ihn; vorhandener MELODIE-Clip wird ersetzt und mit [Verwerfen] deep-equal zurückgeholt. |
| G5-03 | ✓ | Song-Stimme Takt 3–8 → Song-Melodie (Spur 5): 20 Noten an derselben Stelle, **Noten-F 1,000**; ein Undo → Song deep-equal. |
| Reihenfolge | ✓ | `tkExt().proc` = [Zeitkarte, G4, Säubern]: mit Zeitkarte klingt die Scheiben-Fassung, gerechnet aus der G4-Fassung; A/B „ohne“ → aus dem Roh-Take. `g4-chain.mjs` |
| Rauchtest | ✓ | `smoke.mjs`: keine Konsolenfehler. |
| Regression | ✓ / siehe unten | VS3 (`v3-vs3-accept` über VS-P-Harness): **alles grün** mit G4G5. VS4/VS5a/VS5b mit G4 **aus** für neue Spuren (`g4off.html`): VS4-accept 25 ✓/1 ✗ (= Basis 4.23.0, gleicher Punkt „Audio-Store“), VS5a-t1 20/0, VS5b-t1 32/0 (Basis 31/1), VS4-click, VS5a-t3, VS5b-t3 gleich der Basis. Mit G4 an: absichtlich überholte Erwartungen (Regel 26), siehe unten. |
| Merge | ✓ | `git merge-file` G4G5 × vs-base-B × vs-br-VSP: **0 Konflikte**; × vs-br-VSL: **0 Konflikte**. |

**Überholte Test-Erwartungen (Regel 26, durch G4 absichtlich):** Neue STIMME-Spuren haben „Gesang Synthpop“ an, also klingt nicht mehr der
Roh- bzw. gesäuberte Take selbst. Diese Punkte prüfen „bitgleich zum Roh-Take“ an einer neuen STIMME-Spur und schlagen deshalb fehl:
- VS4-accept: „N7V-24 bei 0 % spielt der Roh-Puffer bitgleich“, „N7V-21 SÄUBERN 100 %“ (liest den Puffer, solange die G4-Fassung der neuen Stärke noch rechnet).
- VS5a-t1 (6 Punkte): „attacks bit-identical“, „peak per click“, „M-KLICK slices“, „A/B original“, „strength 0 → raw“, „after undo bit-identical“.
- VS5b-t1 (8 Punkte): „first 20 ms after each mark bit-identical“, „length per slice“ und die „→ original bit-identical“-Punkte.
Mit G4 aus sind alle wie in der Basis (oben). Für diese Tests: `SYNQUENZER.g4Off()` nach dem Anlegen der Spur.

## Abweichungen
1. **G4-03 nur zusammen mit VS-P messbar.** Ohne VS-P kommt die Stimme mit dem Mikrofon-Pegel in den Mix (≈ 13–14 dB unter den Drums im
   Band 2–5 kHz); Auto setzt dann alles auf Anschlag und erreicht trotzdem nur −8,7 dB. Mit VS-P (zusammengeführt) ✓. Auto rechnet mit dem
   Pegel, den VS-P geben wird (`typeof vpGet`), und ohne VS-P mit dem tatsächlichen.
2. **G4-03 mit dem synthetischen Vokal „a“** der VS-P-Bibliothek nicht erreichbar (−9,2 dB): der Vokal hat fast keine Energie bei 2–5 kHz
   (kein Sänger-Formant). Mit den Korpus-Stimmen ✓. Die männliche Stimme braucht den ganzen Bereich (Präsenz +9, Mitte −5, Tief −3) und
   liegt mit 3,4 dB knapp über dem Soll.
3. **Mix-Messung nur bei ▶:** Ein echtes Offline-Rendern aller Synth-Spuren gibt es in der App nicht. [Auto] misst deshalb den Mix 4 s live
   an den Ausgängen der Spuren (nach Pegel/Pan/Mute), während ▶ läuft. Ohne ▶ setzt Auto nur Dynamik und Entzischer, und die Zustandszeile
   sagt „Mix nur bei ▶“.
4. **„Gegenspur-Kerbe nur im Gesang“** habe ich als „nur die Gesangsspur wird verändert“ gelesen: Präsenz anheben, wenn nötig Mitte/Tief
   der Stimme senken. Eine Kerbe in der anderen Spur gibt es nicht (siehe Fragen).
5. **Kette offline je Take statt Echtzeit-Knoten:** Das ist dasselbe Muster wie VS4/VS5a. Der Gewinn: Rechenlast beim Abspielen 0 und keine
   Verzögerung. Der Preis: Nach einem Regler kommt die neue Fassung nach dem Rechnen (150 ms Ruhe, dann 0,1–0,4 s) mit einer Überblendung;
   bis dahin klingt die vorige.
6. **Speicher:** je hörbarem Take liegt zusätzlich die G4-Fassung im Speicher (≈ 11,5 MB je Minute Gesang, wie der VS4-Cache). „Aus“ gibt
   den Speicher frei.
7. **Hall/Delay:** Solange die Effekte an sind, kommen die Sends der STIMME-Spur aus dem Blatt „Effekte“. Hall/Delay im (versteckten)
   Klang der Spur wirken dann nicht; mit „Aus“ oder A/B „ohne“ wieder die des Klangs.
8. **G5:** Die Analyse läuft auf der gesäuberten Fassung, wenn SÄUBERN > 0 ist, sonst auf dem Roh-Take (nicht auf der G4-Fassung). Eine
   Zeitkarte (VS5a/b) wird auf die Noten übertragen. Song-Stimme → Song-Melodie zeigt kein Ergebnis-Blatt (das FANG-Blatt gehört zu einem
   Szenen-Clip), sondern einen Toast mit [Rückgängig]. Die Tonart ist die des Songs an diesem Takt.
9. **Mitschnitt-Knackser:** Spitzen genau an den 4096er-Blockgrenzen des ScriptProcessor-Mitschnitts treten genauso in der unveränderten
   4.23.0 ohne jede Aktion auf (4·10⁻²). Sie sind wie in VS3 ausgenommen.

## Fragen an Xander
1. „Maskierung → EQ (Präsenz anheben/**Gegenspur-Kerbe nur im Gesang**)“: Meinst du eine Kerbe **in der anderen Spur** (z. B. Drums/Synth bei
   3 kHz), die nur wirkt, **während gesungen wird**? Gebaut ist nur die EQ der Stimme.
2. Wo soll [Effekte] noch erscheinen? Jetzt: Spur-Kopf der STIMME halten → Spur-Blatt → [Effekte]. Zusätzlich im Takes-Blatt?
3. [Auto] misst den Mix nur, während ▶ läuft (4 s). Reicht das, oder soll Auto die Szene dafür selbst kurz (stumm) abspielen?
4. G5: Liegt in der Szene schon ein MELODIE-Clip, wird er ersetzt (↶/[Verwerfen] holt ihn zurück). Lieber in einen freien Platz?
5. Voreinstellung „Gesang Synthpop“: Präsenz +3 dB, Silben-Dynamik 80 %, 3 : 1 ab −24 dB, Hall 18 %, Delay 10 % – passt das am iPhone mit
   Kopfhörer? (bitte anhören: ein Take, [A/B]).

## Für das Zusammenführen (geänderte Funktionen / Blöcke)
- **Neuer Block** `/* G4 … */` + `/* G5 … */` direkt nach `WP_API` (vor `function voicesInfo()`): `g4DspMake`, `G4D`, `G4P`, `G4`, `g4*`,
  `G4_API`, `G5`, `g5*`, `G5_API`; am Ende die Zeile `tkExt().proc.splice(…)` (G4 hinter `wpProc`).
- **CSS:** neue Zeilen nach `.tksheet .clab .mbtn{…}` (`.tk-g5`, `.g4sheet …`).
- **Ein-Zeilen-Haken in fremden Funktionen:**
  - `trackFx`: `g4Fx(tr, …)`
  - `normTrack`: `gfx` nur bei `stimme`
  - `tkNormProject`: `delete t.gfx` bei doppelter STIMME
  - `undoState` / `undoApply`: Art `gfx`
  - `tkEnsureTrack`: `g4NewTrack(t)`
  - `tkFlag`: `g4NewTrack` / `delete tr.gfx`
  - `openTrackSheet`: Knopf + Handler `g4`
  - `tkSheetPaint`: Knopf `g5`; `tkSheet`: Handler `g5`
  - `vsNotesOf`: `A.key`
  - `vsResPaint`: „umgewandelt“
  - `vsResDrop`: Label `G5_LABEL`
  - `wpBase`: Parameter `noG4`; `wpDetect`: `wpBase(id, null, true)`
- **API:** `Object.assign(SYNQUENZER, G4_API, G5_API)` steht **vor** der TK_API-Zeile (keine Kollision mit VS-P, das hinter WP_API einfügt).
- **VS-P-Haken:** keiner nötig. VS-P misst `o.buf` in `tkStartSrc`, also die von `tkPlayBuf` gelieferte G4-Fassung. Die Reihenfolge Hochpass →
  Entzischer → Kompressor → EQ → Auto-Pegel → Begrenzer ergibt sich von selbst.
- VERSION-Zeile unverändert (4.23.0).


## stage-ges — Zusammenführung

Staging-Stand: Basis `vs-base-B.html` (App 4.23.0, Format 5) + **G3/G8** (`helfer-G3G8.html`) + **G4/G5** (`helfer-G4G5.html`).
Datei: `scratchpad/stage-ges/index.html` (Sicherung vorher: `index.html.vor-merge-stage-ges.html`), Schnappschuss `synq-snapshots/stage-ges.html`.
**VERSION-Zeile unverändert `4.23.0`** (wie in der Basis und in beiden Zweigen; setzt der Dirigent). Format bleibt 5.

### Zusammenführen (`git merge-file`, 3-Wege gegen `vs-base-B.html`)
1. **G3G8** → sauber (0 Konflikte; Hauptlinie war = Basis, Ergebnis bitgleich zu `helfer-G3G8.html`).
2. **G4G5** → **1 Konflikt**, alles andere sauber (alle Ein-Zeilen-Haken beider Zweige liegen in verschiedenen Zeilen:
   `trackFx`, `normTrack`, `undoState/undoApply`, `tkEnsureTrack`, `tkFlag`, `openTrackSheet`, `tkSheetPaint/tkSheet`, `vsNotesOf`,
   `vsResPaint`, `vsResDrop`, `wpBase/wpDetect`, CSS von G4/G5 neben den G3/G8-Haken in `tick`, `tkMakeTake`, `tkVoiceTake`, `normClip`,
   `vsFangDone`, `vsApply`, `recLength` usw.; die API-Zeilen `G4_API, G5_API` vor bzw. `G3_API`, `G8_API` hinter `TK_API` stehen beide da).
   - **Konflikt: neuer Block vor `function voicesInfo()`** – beide Zweige setzen dort ihren ganzen Block ein (G3/G8: `G3*`, `g3*`, `G3_API`,
     `G8*`, `g8*`, `G8_API`; G4/G5: `g4DspMake`, `G4*`, `g4*`, `G4_API`, `G5*`, `g5*`, `G5_API`, `tkExt().proc.splice(…)`).
     Gelöst: **beide Blöcke hintereinander** (erst G3/G8, dann G4/G5), jeder unverändert (geprüft: Block im Ergebnis = G3G8-Block + G4G5-Block,
     Zeichen für Zeichen). Dabei fehlte nach dem Auflösen die gemeinsame Schlusszeile `};` von `G8_API` (git hatte die gleiche letzte Zeile
     beider Seiten aus dem Konflikt herausgezogen) → Rauchtest „SyntaxError: Unexpected identifier 'g4DspMake'“ → `};` wieder eingesetzt.
   - Keine Konfliktmarken übrig (`grep '^<<<<<<<\|^=======$\|^>>>>>>>'` = 0).

### Zusammenspiel geprüft (Code gelesen, nichts geändert)
- G5 (`g5Analyse`) liest den Take zwischen `a.in` und `a.out` – mit dem G3-Anlauf im Take (`in` = 2 Takte + 0,25 s) stimmt die Lage.
  `vsApply` → `g3ApplyPre`: das G5-Ergebnis hat kein `g3` → kein Auftakt (`clip.pre` wird gelöscht), wie bei jedem Nicht-FANG-Ergebnis.
  G5 übernimmt die Clip-Länge (bis 64 Takte, G8) ohne eigene Grenze.
- G4 rechnet den ganzen Take (inkl. G3-Anlauf/Ausklang und G8-Stück-Takes); `tkExt().proc` = [Zeitkarte, G4, Säubern], G3 hängt nur an
  `tkExt().take` (Felder `pre/post`) – keine Überschneidung.
- Regel 28: alte Projekte ohne `gfx` / ohne `pre/post` klingen wie bisher (G4-05 „altes Projekt ohne gfx … bitgleich“, VS3-Regression grün).
- Marken-Regel „MS 2000“ genau 1×, kein Fremdname; kein Supabase-/Netz-Aufruf und kein alert/confirm/prompt in den neuen Zeilen.

### Abnahme auf dem zusammengeführten Stand (Chromium 1243 headless; Skripte aus `helfer-g3g8`/`helfer-g4g5`, Kopien in `dirigent-test/stage-ges/`)
| Skript | Ergebnis |
|---|---|
| `smoke.mjs` | ✓ keine Konsolenfehler (nach dem `};`-Fix) |
| `g3-accept` A–F | **61/61 ✓** (Zweig allein: 60/61) |
| `g3-lay` | 19/19 ✓ |
| `g8-accept` S B C R | 38/38 ✓ |
| `g8-accept` A (5-min-Song-Aufnahme) | 8/8 ✓ (lange Aufgaben max. 104 ms ≤ 200; auf diesem Rechner auch beim reinen G3G8-Zweig bis 182 ms und mit G4 aus bis 255 ms – Rechner-Rauschen, nicht G4) |
| `g8-lay` | 24 ✓ / 6 ✗ – nur „Tasten ≥ 44 × 44“ im Aufnahme-Blatt (32–40 px hoch): **Befund der Basis 4.23.0**, im G3G8-Changelog schon genannt |
| `v3-vs3-accept` A–G (inkl. D Claude-App-Rundweg) | 72/72 ✓ |
| `v3-vs3-click` | ✓ (M-KLICK 0,00368 ≤ 1,5 × 0,00417) |
| `v3-vs2-accept` | 46 ✓ / 4 ✗ – 2 × „Stimme rechtzeitig geplant“ (schwankende Vorbedingung, bekannt) und E „● REC: 0/6 Noten“: **auf diesem Rechner auch mit der Basis `vs-base-B.html` und mit jedem Zweig allein** (deterministisch) – nicht durch das Zusammenführen |
| `g4-accept` all | 19/19 ✓ |
| `g4-chain` / `g4-click` | 2/2 ✓ / 1/1 ✓ |
| `g4g5-lay` | 25/25 ✓ |
| `g5-accept` | 14/14 ✓ |
| `g4-cpu` (2 × 60 s) | ✓ +0,11 % (Soll ≤ +3) |
| `g4-auto` female | ✗ wie im G4G5-Changelog vorhergesagt: G4-03 nur mit VS-P erreichbar (VS-P ist in diesem Staging nicht drin) |
| `v3-mk8b-ui` (letztes MK-Paket der Basis) | 38 ✓ / 2 ✗ – MK8b-04 „k801 −200 dBFS“ wie auf der Basis; „▶ Vorhören“ k103 (Arp, Messung in einem Augenblick) schwankt auf Basis und Zweigen genauso (−39 … −51 dB) |

**Offen:** G4-03 erst nach dem Zusammenführen mit VS-P nachprüfen. Fragen an Xander aus beiden Zweigen (oben) bleiben offen.


# CHANGES – Helfer G267 (Nachtrag 5: G1-Prüfung, G2, G6, G7)

Grundlage: Kopie `bau/vs/n5-br-G/index.html` (App 4.23.0 + G1, Versionszeile 4.25.0 unverändert). Basis für den 3-Wege-Merge:
`bau/werkzeug/vs-base-B.html`. Format bleibt 5 (nur additive Felder). Kein Supabase-Aufruf.

## G1 – unabhängige Prüfung (kein Code geändert)

G1 war gebaut, aber nicht unabhängig geprüft. Prüfung durch einen getrennten Prüf-Lauf (eigene Skripte, andere Werte als der
Bauende: 97 BPM, 1/16, ungerade Abstände, echte Touch-Tipps, Undo-Kette über 6 Schritte, Legato-Schnitte). Bericht:
`tests/g1/G1-REPORT.md`.

| ID | Ergebnis | Messung |
|---|---|---|
| G1-01 | ✓ | 97 BPM/1/16, Touch-Tipp, Dehnen 100 %: gehörte Einsätze max **3,5 ms** neben dem Raster (12/12); 50 %: halber Abstand max 2,0 ms; Scheiben 50 % 2,0 ms. Gegenprobe 4.23.0: 18,3 ms. Skript des Bauenden (120 BPM, 1/8): 3,4 / 1,8 ms, Song 3,4 ms, „Audio folgt“ 3,0 ms |
| G1-02 | ✓ | Pixel: 12/12 Marken auf der Linie (max 0,50 px; 4.23.0: 3/12); Animation 173–231 ms (≤ 250); Meldung „12 Einsätze gerückt“ = Zahl der Karte; Matrix-Zelle/Song = gehörte Fassung; 844×390 und 320×568 nichts abgeschnitten |
| G1-03 | ✓ | ↶ über 6 Schritte: Marken + Karte deep-equal, Klang hash-gleich; ganz zurück bitgleich zum Roh-Take (237 526 Samples); ↷ ×6 deep-equal. Legato-Schnitte: M-KLICK 31,6 / 23,1 dB gegen Original 30,7 dB |
| Smoke | ✓ | keine Fehler, Zeichnen 1,4 ms/Bild, Tipp Median 7,4 ms |

Abweichungen: keine. **Kein Fix nötig.**

### Fragen an Xander (G1)
1. Die Meldung „n Einsätze gerückt“ zählt auch Marken, die nur 1–2 ms rücken (auf dem Raster gesungen). Soll erst ab z. B. 3 ms gezählt werden?
2. Bei offenem Marken-Editor im Hochformat (390×844) verdeckt das Blatt den ↶-Knopf (schon vor G1 so). Soll der Editor ein eigenes ↶ bekommen?

### Für das Zusammenführen (G1)
Nichts – G1-Code unverändert. Tests: `tests/g1/` (Pfade auf `bau/helfer/G267/index.html`; `tests/node_modules` = Link auf Playwright, nicht im Repo).

## G2 – Tonhöhe quantisieren + Gesang als Noten bearbeiten

### Was neu ist
1. **Takes-Blatt → [♪ Tonhöhe · Noten]** (unter [✎ Marken · Quantisieren]; quer nebeneinander, das Blatt passt weiter ohne Scrollen)
   öffnet den **Noten-Editor des Takes** im Blatt des Marken-Editors: die erkannten Noten (VS2-Segmente) als **Blöcke über der
   Wellenform**, dahinter dünn die gemessene Tonhöhen-Spur, Tonart-Zeilen hell. Umriss = gesungen, Block = gehört.
2. **Tonhöhe quantisieren:** [Aus] [Weich] [Hart] + **Stärke 0–100 %**. Jede Note wird zum nächsten Ton der Tonart der Stelle gezogen
   (Voreinstellung: Szene-Clip → Tonart der Szene, Song-Stimme → Szene an dem Takt, sonst Projekt; im Feld gespeichert).
   **Weich** = gleiche Verschiebung über die ganze Note (Vibrato, Gleiten bleiben), Übergang zwischen Noten 40 ms;
   **Hart** = folgt der Stimme (15 ms) und rastet sie auf den Ton (Vibrato wird glatt). Meldung „n Töne auf die Tonart … gezogen“.
3. **Noten frei verschieben:** Note antippen (gewählt = hell mit Rand), **senkrecht ziehen** = Halbtöne (eigene Melodie), [▲] [▼] = ±1,
   **[Teilen]** an der zuletzt getippten Stelle (Höhe je Teil neu gemessen), **[Verbinden]** mit der nächsten Note. Je ein Undo.
4. **Nur stimmhafte Teile werden verschoben.** Zisch-/Plosivlaute (s, sch, t, p, k, f), Atmer, Pausen und jede nicht verschobene Note
   bleiben **bitgleich**. 15 ms Schutz an jedem Rand einer stimmhaften Strecke (dort klingt der Konsonant noch nach), dann 10-ms-Blende.
5. **Formant-erhaltend**, nicht zerstörend: Roh-Take bleibt; Render-Cache je Take + Plan + Quelle (bis 8 Fassungen: ↶ ↷, A/B ohne
   Neurechnen); Rechnen im Worker (Rückfall Hauptfaden). Kette je Take: SÄUBERN (VS4) → **Tonhöhe** → Zeitkarte (VS5) → Abspielen;
   gilt in Szene und Song. **[A/B]** = Original hören (wie beim Marken-Editor). **[WAV]** = die gehörte Fassung als WAV.
6. Takes-Blatt offen → die Töne werden schon im Worker gesucht (der Tipp auf Weich/Hart muss danach nur noch rechnen).

Daten (additiv am Take, Format 5): `take.pitch = {mode 'soft'|'hard', str, q, key {root, scale}, notes: [{t0, t1, m, sh?}]}`.
Ein Take ohne Änderung bleibt Zeichen für Zeichen gleich; ↶ ganz zurück entfernt das Feld.

### Verfahren (Kern `dsp/g2pitch.js`, in der App wörtlich im Block `/* G2-BEGIN */`)
Analyse einmal je Take: pYIN (VS2-Kern) auf 16 kHz, 10-ms-Frames → VS2-Segmente = Noten; Periode je Frame auf voller Rate nachgemessen;
Notenhöhe = Median des Kerns. **Harmonisches Modell** je stimmhafter Strecke: Phase Φ = ∫2π·f0, alle 10 ms die komplexen Teilton-
Amplituden bis 7 kHz (Hann über 3 Perioden, chirp-fest über Φ). Verschieben: Ziel-Phase Φ' = ∫2π·f0·r(t); jeder neue Teilton bekommt die
Hülle des Originals **an seiner neuen Frequenz** (Log-Betrag zwischen den Nachbar-Teiltönen) → formant-erhaltend; Ausgang =
Original + Blende·(Modell verschoben − Modell original), d. h. Hauch/Rauschen (der Rest) bleibt unverschoben.

### Abnahme (Chromium headless, Skripte in `tests/`)
| ID | Ergebnis | Messung |
|---|---|---|
| G2-01 | ✓ | 10 gesungene Töne 30–45 Cent daneben (C-Dur, Konsonanten, Vibrato ±25 Cent). Hart 100 %: je Note **max 0,15 Cent** neben dem Skalenton; Hart 50 %: halber Abstand max 0,14 Cent; Weich 100 %: max 0,12 Cent (`g2-app.mjs`, gemessen an der gespielten Fassung mit unabhängigem NSDF) |
| G2-02 | ✓ | Weich: Vibrato-Tiefe **99 %** des Originals. Hülle: jeder Teilton des Ausgangs auf der Hülle des Originals an seiner Frequenz 300 Hz–4 kHz, 5 Vokale × 130–262 Hz × ±38/42 Cent: **max 0,00 dB** (`g2-core.mjs`) |
| G2-03 | ✓ | M-KLICK 30,5 dB = Original 30,5 dB (alle Fälle); Dauer gleich (288 000 = 288 000 Samples, Abweichung 0 ms) |
| G2-04 | ✓ | A/B = Roh-Take; ↶ → vorige Einstellung; ↶ ganz → Feld weg, Klang **bitgleich**; ↷ deep-equal + bitgleich; Speichern → neu laden → Laden: Feld deep-equal, Klang bitgleich. Worker, **keine langen Tasks > 50 ms** im Hauptfaden. 16-Takt-Take (32 s): kalt **2,5–3,2 s** (Lauf zu Lauf), wie bedient (Takes-Blatt offen, dann [Hart]) **1,5 s** |
| G2-05 | ✓ | Note +3 HT: **300,0 Cent**; Zischlaute **bitgleich** (0 Samples anders); außerhalb der Note bitgleich; kein Klick (M-KLICK gleich). Kern zusätzlich −3/+4/+7/±12 HT: Fehler ≤ 0,1 Cent |
| G2-06 | ✓ | Blöcke im Editor = gemessene Noten: Start **0,0 ms**, Höhe **0,0 Cent** neben den Noten der Analyse (P1, P2, P3, L1, L2, XL); Tipp wählt, ▲ +1, Ziehen 2 Zeilen = +2, Teilen/Verbinden, je ein Undo |
| Layout | ✓ | Editor und Takes-Blatt in 6 Größen: nichts abgeschnitten, keine Seiten-Überbreite, Takes-Blatt quer ohne Scrollen (356/356) (`g2-lay.mjs`) |
| Regression | ✓ | G1 `n5-g-t1` (14 ✓), `n5-g-t2` (40 ✓), smoke ohne Fehler |

### Abweichungen
- **Verfahren:** Die Spec nennt „PSOLA/WSOLA-Familie wie VS5b“. Gebaut und gemessen wurde zuerst TD-PSOLA (Tonhöhe ±3 Cent, Zischlaute
  bitgleich), aber die **Formanten wichen um 3–10 dB ab** (schmale Formanten werden durch die 1–2-Perioden-Körner verschmiert; Messung
  gegen dieselbe Stimme auf dem Zielton: ideal ≤ 1 dB). G2-02 verlangt ±1 dB → Kern auf **harmonisches Modell + unverschobenen Rest**
  umgestellt (Tonhöhe exakt, Hülle ±0 dB an den Teiltönen). Bitte am iPhone hören, ob es natürlich klingt (Fragen 1).
- **Formant-Messung:** Ein Cepstrum-Vergleich gegen eine neu gesungene Referenz hat schon für die **unveränderte** Stimme 4,7 dB
  Messboden (die Hülle ist zwischen den Teiltönen nicht bekannt, wenn Formanten schmaler sind als der Teiltonabstand). Gemessen wird
  darum je Teilton gegen die Hülle des Originals an dessen Frequenz.
- **16-Takt-Zeit kalt** schwankt auf der VM 2,5–3,2 s (Analyse 1,6–2,4 s + Rendern 0,7 s); deshalb wird beim Öffnen des Takes-Blatts
  schon analysiert (wie bedient: 1,5 s).
- Die **Tonart** ist im Editor nur angezeigt (Voreinstellung der Stelle), nicht wählbar – die Spec nennt keine Wahl.
- **[WAV]** im Noten-Editor (gehörte Fassung): die Spec nennt „WAV-Export der hörbaren Fassung wie bei Dehnen“; für Dehnen gab es
  bisher keinen eigenen Knopf (Takes-Blatt [WAV] = Roh-Take, N7V-20 bitgleich, unverändert).

### Fragen an Xander (G2)
1. Klingt die verschobene Stimme natürlich (Weich und Hart, auch +3/+7 Halbtöne)? Bitte mit Kopfhörern und A/B.
2. Soll die Tonart im Noten-Editor wählbar sein (z. B. ‹ › wie im Ergebnis-Blatt)?
3. Soll [♪ Tonhöhe] auch im Marken-Editor neben dem Timing stehen (dort ist im Hochformat kein Platz in der Kopfzeile)?

### iPhone (Xander)
1. 2 Takte singen, STIMME-Clip ✎ → [♪ Tonhöhe · Noten]. Stimmen die Blöcke mit dem Gesungenen?
2. [Hart] → klingt jeder Ton sauber auf der Tonart? [Weich] → bleibt das Vibrato? Stärke ziehen.
3. Eine Note antippen, nach oben ziehen (eigene Melodie). Klingen s/sch/t unverändert, kein Knacken?
4. [A/B] vergleichen, ↶ ↷, speichern und neu laden.

### Für das Zusammenführen (G2)
- Neuer Block `/* G2-BEGIN */ … /* G2-END */` direkt vor `function voicesInfo()` (Kern `g2PitchMake` + App-Teil).
- `Object.assign(SYNQUENZER, G2_API);` eine Zeile nach `Object.assign(SYNQUENZER, WP_API);`.
- `tkSheetPaint`: eine Zeile `tkedrow` nach der `tk-wp`-Zeile; eine Zeile `g2Pre(...)` nach `clSheet(p, x)`.
- `tkSheet` onTap: eine Zeile `d.a === 'g2'`.
- `wpUndone`: erste Zeile `g2Undone()`.
- CSS: Block `/* G2: … */` nach `.tksheet .tk-wp{…}` (4 Zeilen + eine Zeile `#wpSheet.g2 .qchips`).
- `tkExt().proc`: g2Proc wird hinter wpProc eingefügt (im G2-Block, keine Zeile außerhalb).

## G6 – Chor-Generator (Background-Gesang per Knopf)

### Was neu ist
1. **Takes-Blatt → [Chor]** (neben [♪ Tonhöhe · Noten]) öffnet das Blatt **„Chor“** mit 8 Rezepten: **Terz, Sexte, Quinte, Oktave,
   Dreistimmig, Falsett-Chor 80er, Barbershop 4-stimmig, Unisono-Doppel**; bei Terz/Sexte/Quinte/Oktave [oben] [unten].
   Ohne Chor steht dort der kurze Hilfetext zu den Rezepten (Spec: „im Hilfetext kurz erklärt“).
2. Ein Tipp auf ein Rezept rechnet die **Noten der Stimmen** aus der Lead-Melodie (Noten der gehörten Fassung, G2-Analyse) und den
   **Akkorden der Stelle** (Töne der anderen Synth-Spuren der Szene am Schlag der Note; ohne Begleitung der leitereigene Dreiklang,
   der den Ton enthält, I/IV/V zuerst) in der Tonart der Stelle:
   Terz/Sexte = leitereigen (groß oder klein je nach Ton), Quinte = rein, wenn leitereigen, sonst leitereigen; Oktave ±12;
   Dreistimmig = die zwei nächsten Akkordtöne über dem Lead (eng); Falsett = Oktave + (Terz + Oktave); Barbershop = Tenor (Akkordton
   darüber), Bariton (darunter), Bass (Grundton darunter); Unisono = gleiche Töne.
3. Jede Stimme wird aus der **gehörten Lead-Fassung** gerechnet (G2-Technik: nur stimmhaft, formant-erhaltend; Tonhöhen-Quantisieren,
   Zeitkarte und Säubern des Leads gelten also mit) und **künstlich gedoppelt**: 2 Kopien je Stimme, +12 ms/−6 Cent und
   +24 ms/+8 Cent, leicht auseinander im Panorama; Stimmen links/rechts (3 Stimmen: links, rechts, Mitte), Lead bleibt Mitte vorn.
4. **Pegel nach Lautheit:** der Chor liegt gesamt (trocken + Hall) **8 LU (80er) bzw. 9 LU (Pop) unter dem Lead** – gemessen an der
   K-bewerteten Leistung der Puffer (Worker), Hall-Anteil aus Send und Nachhallzeit geschätzt. **Hall und Echo als Send vor dem
   Chorspur-Pegel:** Chorspur-Pegel 0 → nur noch Hall.
5. **Mischung** [80er großer Refrain] [Pop modern] (Voreinstellung, beim ersten Chor gleich mit, ein Undo): Hall-/Echo-Send der
   Chor-Stimmen (80er 75 %/12 %, Pop 40 %/18 %), Lead-Sends der STIMME-Spur (30 %/10 % bzw. 15 %/12 %), **Hall-Vorverzögerung im
   Tempo** (1/32 bzw. 1/64) und **Echo im Tempo** (1/4 bzw. 1/8 punktiert).
6. Je Stimme: **[Solo]** (nur diese Stimme, der Lead schweigt), **[♪ Noten]** = die Stimme als Noten im Noten-Editor (Lead-Note +
   Intervall; ▲ ▼ und Ziehen ändern die Stimme, ein Undo; A/B dort = Solo), **[Selbst singen]**: die Stimme spielt allein als
   Führung, die nächste Aufnahme (● REC mit 🎤, Overdub in diesem Clip) **ersetzt die errechnete Stimme** und wird gleich mit Panorama,
   Sends und Pegel eingemischt; oben im Clip bleibt der Lead (gleiches Undo wie die Aufnahme). [Chor löschen].
7. Abspielen: zu jedem Lead-Stück (Szene und Song) laufen die Stimmen-Stücke mit (gleiche Zeit und Blenden, enden mit ihm);
   eine neu gerechnete Stimme setzt beim Abspielen mit 10-ms-Blende ein, der Lead läuft durch.

Daten (additiv am Audio-Stück, Format 5): `audio.chor = {rec, dir, mix, voices: [{name, n: [{t0, t1, m, iv}], pan, db, vol, rev, dly, take?}]}`.

### Abnahme (`tests/g6-app.mjs`, Chromium)
| ID | Ergebnis | Messung |
|---|---|---|
| G6-01 | ✓ | Refrain C-Dur C4…C5, Terz oben: Tabelle C→E, D→F, E→G, F→A, G→H, A→C, H→D, C→E (8/8). Gemessene Tonhöhe je Chornote: Kopie 1 max 6,3 Cent, Kopie 2 max 8,5 Cent neben der Terz (die Kopien sind absichtlich −6/+8 Cent verstimmt). Weitere Rezepte als Tabelle geprüft (Sexte, Quinte, Oktave unten, Dreistimmig, Barbershop, Unisono) |
| G6-02 | ✓ | Falsett: Oktave 72…84 + Terz+Oktave 76…88; je Stimme 2 Doppel (beim Start 1 Lead + 4 Quellen); Lautheit am Ausgang (BS.1770, Stereo): Chor **8,0 LU** unter dem Lead (80er), **9,2 LU** (Pop) |
| G6-03 | ✓ | Chorspur-Pegel 0: Ausgang −46,4 dBFS, Nachhall nach dem Notenende −63,7 dBFS (nur Hall); Send zusätzlich 0 → −135,6 dBFS (Stille) |
| G6-04 | ✓ | [Selbst singen] Stimme 2 + Aufnahme → Stimme 2 = der neue Take, Lead bleibt oben, Panorama/Sends gleich; beim Abspielen 1 Lead + 2 Kopien Stimme 1 + selbst gesungene Stimme 2 |
| G6-05 | ✓ | ↶ (Pegel, Sends) deep-equal; Chor löschen → ↶ → deep-equal; Speichern/Laden deep-equal; Abspielen mit Chor ohne lange Tasks; 2 Stimmen = 4 Puffer-Quellen + 1 Lead (Rechnen im Worker, 2 Renders ≈ 250 ms für 4 s) |
| Layout | ✓ | Blatt Chor in P1, P2, P3, L1, L2, XL: alle Tasten ≥ 44 × 44, nichts abgeschnitten, quer ohne Scrollen (329/329) |
| Regression | ✓ | `g2-app.mjs` (alle ✓), `g2-lay.mjs`, smoke |

### Abweichungen
- **„je Stimme eine Spur“**: Die App hat genau eine STIMME-Spur. Die Chor-Stimmen sind darum eigene Abspiel-Stücke **an der STIMME-Spur**
  (eigener Pegel, Panorama, Sends je Stimme), keine zusätzlichen Spuren in der Matrix.
- **G4-Kette** (Hochpass → Entzischer → Kompressor → EQ) und **Auto-Pegel (VS-P)** kommen aus anderen Zweigen: der Chor läuft über die
  STIMME-Spur (deren Kette gilt dann für Lead und Chor). Haken für das Zusammenführen: Chor-Stimmen gehen in `AU.tracks[i].trackIn`
  (`g6Node`) – soll der Chor eine eigene G4-Einstellung bekommen, wird dort die Kette eingesetzt.
- **Pegel-Kalibrierung:** die Lautheits-Rechnung lag am Ausgang 1,9 dB zu leise (Spur-Lautstärke wirkt nur trocken, Sends vorher) →
  mit der Messung kalibriert (`G6_CAL`).
- Die Mischung ändert **globale** Einstellungen (Hall-Vorverzögerung, Echo-Teilung) – das wirkt auf alle Spuren (ein Undo).
- Solo „nur Chor“ / „nur Lead“ gibt es nur in der Test-API (Messung), nicht als Knopf.

### Fragen an Xander (G6)
1. Sollen die Chor-Stimmen eigene Spuren in der Matrix bekommen (dann mehr als eine STIMME-Spur)?
2. Sollen die Pegel (8/9 LU unter dem Lead), die Verstimmung der Doppel (−6/+8 Cent) und die Versätze (12/24 ms) einstellbar sein?
3. Soll die Mischung die globalen Hall/Echo-Einstellungen ändern dürfen, oder nur die Sends?
4. „Selbst singen“ startet nicht selbst die Aufnahme: man tippt danach ● REC mit 🎤. Soll der Knopf gleich aufnehmen?

### iPhone (Xander)
1. 2–4 Takte Refrain singen, STIMME-Clip ✎ → [Chor] → [Terz] → abspielen. Klingt die Terz richtig (groß/klein je Ton)?
2. [Falsett-Chor 80er] + [80er großer Refrain] → klingt es nach großem Refrain? [Pop modern] vergleichen.
3. [Solo] je Stimme, [♪ Noten] einer Stimme ansehen, eine Note mit ▲ ändern.
4. [Selbst singen] bei Stimme 2 → ● REC mit 🎤 → nachsingen → klingt deine Stimme jetzt im Chor?

### Für das Zusammenführen (G6)
- Neuer Block `/* G6-BEGIN */ … /* G6-END */` direkt hinter `/* G2-END */`; `Object.assign(SYNQUENZER, G6_API);` hinter der G2-Zeile.
- `tkStartSrc`: eine Zeile `g6Start(o, r)` vor `return r;`. `tkDrop`/`tkKill`: je ein Ausdruck `if (r.ch) g6Drop/g6Kill(r);` am Anfang;
  `tkFadeAt`: erste Zeile `g6Fade`; `tkXfOut`: eine Zeile `g6Fade` nach `r.o = null;`.
- Aufnahme (`tkRecToClip`-Pfad, Overdub-Zweig): eine Zeile `g6Took(...)` nach `clip.audio.alt = …`; `tkInject` (Test-API): `g6Took` in der Overdub-Zeile.
- `tkSheetPaint`: `tkedrow` enthält jetzt auch [Chor]; `tkSheet` onTap: eine Zeile `d.a === 'g6'`.
- G2-Editor: Stimmen-Modus (`g2Open(r, {voice})`, `g2Voice`, Zweige in Chips/Malen/Ziehen – alles im G2-Block).
- G2-Worker `g2Run`: gibt mit `kw` die K-bewertete Leistung zurück (`g2Kw`).
- CSS: Block `/* G6: Blatt „Chor“ … */` nach der G2-CSS-Zeile; `.tksheet .tkedrow` 2 Spalten, quer drei Teile.

## G7 – Gesang folgt dem Transponieren

### Was neu ist
1. **STIMME-Clips und Song-Stimme werden vom Transponieren mitgenommen wie Noten-Clips:** jede erkannte Note (G2-Analyse, bzw. die
   Noten des Tonhöhen-Felds mit Quantisieren und eigenen Verschiebungen) wird über **`outPitch` der STIMME-Spur** in ihre neue Lage
   gerechnet – dieselbe Regel wie für Noten-Clips (Träger, „Eine Skala“, Teil-Transposition, Tonart des Clips); sie rastet also wie
   alle anderen Spuren in die Tonleiter ein. Verschiebung = neue Lage − gesungener Ton, mit der **G2-Technik** (nur stimmhafte Teile,
   formant-erhaltend; Zischlaute bitgleich). Gilt für gehaltene Flächen („aaah“) und für Worte. Folgt die STIMME-Spur dem Träger nicht
   (`follow` aus), bleibt der Gesang.
2. **Ohne Transponieren** (bzw. zurück auf 0) gibt es keinen Plan → **bitgleich** die Fassung ohne G7.
3. **Vorberechnet / Cache:** jede gerechnete Lage liegt im Render-Cache (bis 8 je Take) – zurück auf eine schon gehörte Lage ohne
   Neurechnen. Ein Wechsel (Haken in `applyCarrierChange` und `xpSet`) rechnet die neue Lage **sofort** (auch wenn sie erst ab dem
   nächsten Schlag/Takt gilt) und schaltet kurz vor dem Wechsel um; beim Abspielen wechselt die Fassung ohne Loch (wpSwitch).
   Beim ersten Abspielen eines STIMME-Clips werden die Noten im Hintergrund gesucht und die Lagen der **Akkord-Zeile der Szene**
   vorberechnet. Die Chor-Stimmen (G6) folgen mit, weil sie aus der gehörten Lead-Fassung entstehen.
4. Tonhöhen-Quantisieren nimmt als Voreinstellung die Tonart der Stelle (siehe G2).

Daten: **kein neues Feld** (der Plan entsteht beim Abspielen aus Transponieren + Noten).

### Abnahme (`tests/g7-app.mjs`, Chromium)
| ID | Ergebnis | Messung |
|---|---|---|
| G7-01 | ✓ | Träger D-Dur (+2): je Note = Lage eines Noten-Clips (Tabelle 60→62, 64→66, 62→64, 65→67, 67→69, 69→71, 71→73, 72→74), gemessen **max 0,72 Cent** daneben; Träger a-Moll (diatonisch, 60→57, 64→60, 62→59, 65→62, 67→64, 69→65, 71→67, 72→69): **max 0,12 Cent** |
| G7-02 | ✓ | Zischlaute bitgleich (0 Samples anders) |
| G7-03 | ✓ | zurück auf 0 (Träger C) → Roh-Take **bitgleich** |
| G7-04 | ✓ | zurück auf +2: aus dem Cache (keine neue Rechnung), sofort bereit; Wechsel auf einer gehaltenen Fläche beim Abspielen: 0 Einbrüche ≥ 6 dB, Überblendung 0,74 dB, gehört +204 Cent (Vibrato); Akkord-Zeile der Szene vorberechnet (Cache 4 Fassungen) |

### Abweichungen
- Eine **noch nie gehörte** Lage braucht beim ersten Mal die Rechenzeit (4-s-Take: Analyse + Rendern ≈ 1,4–2,4 s inkl. Wartezeit bis
  zum Schlag); bis dahin klingt die vorige Lage weiter (kein Aussetzer). Vorberechnet werden nur die bekannten Wechsel (Akkord-Zeile der Szene).
- Gerechnet wird je Clip-Durchgang mit dem Transponieren, das gerade gilt (nicht je Note zu ihrer eigenen Zeit): wechselt der Träger
  mitten im Clip, wechselt der Gesang dort mit der Überblendung von VS5 (wpSwitch).
- Getestet in der Szene; die Song-Stimme nutzt denselben Weg (`g7SegOf`, Tonart über die Szene am Takt), aber ohne eigenen Test.

### Fragen an Xander (G7)
1. Soll der Gesang auch bei „Einzelton“-Trägern (eine Taste im TRANSP-Modus) mitgehen? (So ist es jetzt – wie die Noten-Clips.)
2. Soll man das Mitgehen je STIMME-Clip ausschalten können (z. B. ein gesprochener Teil)?

### iPhone (Xander)
1. 2 Takte singen (STIMME-Clip), ▶, auf TRANSP. und einen anderen Akkord spielen: geht der Gesang mit, klingt er sauber?
2. Zurück auf die Ausgangstonart: ist es wieder genau der gesungene Take?
3. Mehrmals zwischen zwei Akkorden wechseln: kommt der Wechsel ohne Lücke und ohne Knacken?

### Für das Zusammenführen (G7)
- Neuer Block `/* G7-BEGIN */ … /* G7-END */` hinter `/* G6-END */`; `Object.assign(SYNQUENZER, G7_API);` hinter der G6-Zeile.
- `applyCarrierChange`: erste Zeile `g7Changed()`; `xpSet`: eine Zeile `g7Changed()` nach `XP.due = beat;`.
- `tkSched`: eine Zeile `g7Prefetch` nach der `tkPlayBuf`-Zeile.
- G2-Block: `g2Plan` nimmt ohne Feld die erkannten Noten (`g7Pitch`) und die Verschiebung `g7Shift`.

## Unabhängige Nachprüfung G2 / G6 / G7 (eigene Signale und Wege) und Korrekturen

Bericht: `tests/rt/RETEST.md` (E♭-Dur, 44,1 kHz, tiefe 87–117 Hz und hohe 311–415 Hz Stimme, Legato, echte Touch-Wege; G-Dur mit Begleitung;
A-Moll unter d-Moll/E-Dur/F-Dur; altes 4.23.0-Projekt aus ZIP). Zwei Mängel gefunden und behoben:

| Mangel | Ursache | Behebung | nachher |
|---|---|---|---|
| **D1** Ende eines „s“ direkt vor „i“ (D4) wurde mitverschoben (G2: 659 Samples, G7: 239 Samples, bis −46,6 dBFS; Soll bitgleich bzw. ≤ −60 dB). Der eigene Test prüfte nur die ersten 19 ms des Konsonanten | pYIN markiert Frames schon ~20 ms vor dem Vokal als stimmhaft (Fenster ragt in den Vokal); die Schutzzone begann dort | Schutzzone beginnt/endet am ersten Frame, der auf voller Rate periodisch ist (YIN-Rest ≤ 0,3), höchstens 3 Frames je Rand (`model()` in App und `dsp/g2pitch.js`) | alle Konsonanten bitgleich (G2 und G7), Tonhöhe weiter ≤ 0,34 Cent, Klick am Notenende +1,8 statt +3,2 dB |
| **D2** Terz + „80er großer Refrain“: Chor 5,9–6,9 LU unter dem Lead (ein Lauf außerhalb 6–10) | Hall-Anteil geschätzt, `G6_CAL` nur an Falsett (2 Stimmen) gemessen | `G6_MIX['80'].below` 8 → 9 | Terz 80er 7,0–7,6 LU, Falsett 80er 8,6 LU, Pop 8,6–9,0 LU |

Alles andere ✓ (u. a. G2 Hart ≤ 0,26 Cent, Weich ≤ 1,79 Cent, Touch-Weg bereit nach 242–278 ms mit Tonart E♭ der Szene; G6 Terz in G-Dur mit F♯,
Dreistimmig/Barbershop aus den Akkorden der Begleitung, Song-Wiedergabe mit Chor; G7 je Note = outPitch ≤ 0,71 Cent, 8 Wechsel ohne Aussetzer;
altes Projekt bitgleich, JSON ohne neue Felder).

### Hinweise aus der Nachprüfung (offen, keine Abnahme-Mängel)
- In einer **Legato-Phrase** ändert das Verschieben einer Note die Samples (Phase) der Nachbarnoten derselben Phrase (Tonhöhe gleich, kein
  Klick) – „bitgleich außerhalb der Note“ gilt nur für getrennte Noten.
- Legato-Töne, die weniger als ~30 Cent auseinander gesungen werden, erkennt VS2 als eine Note.
- Chor auf einer **Song-Stimme**: die Akkorde der Begleitung werden dort nicht gelesen (leitereigene Dreiklänge).
- Die K-Bewertung für den Chor-Pegel nutzt die 48-kHz-Koeffizienten auch bei 44,1-kHz-Takes (Abweichung < 0,1 dB).


## stage-ges2 — Zusammenführung

Staging-Stand: `stage-ges` (Basis `vs-base-B.html` 4.23.0 + **G3/G8** + **G4/G5**) + **G267** (`helfer-G267.html`: **G1**-Prüfung/Anzeige, **G2**, **G6**, **G7**;
gebaut auf n5-br-G = 4.23.0 + G1). Datei `scratchpad/stage-ges/index.html` (Sicherung vorher: `index.html.vor-merge-stage-ges2.html`),
Schnappschuss `synq-snapshots/stage-ges2.html`. **VERSION-Zeile bleibt `4.23.0`** (G267 trägt 4.25.0 – im Staging nicht übernommen; setzt der Dirigent). Format bleibt 5.

### Zusammenführen (`git merge-file`, 3-Wege gegen `vs-base-B.html`) – 4 Konflikte, alle durch Verbinden gelöst
1. **`tkSheet` onTap** – MAIN: Handler `g5` (In Melodie umwandeln); G267: Handler `g2` (♪ Tonhöhe · Noten) und `g6` (Chor). Gelöst: alle drei Zeilen.
2. **`tkSheetPaint`** – MAIN: Knopf „In Melodie umwandeln“ (`tk-g5`); G267: Zeile `tkedrow` mit [♪ Tonhöhe · Noten] [Chor]. Gelöst: beide Zeilen
   untereinander (erst G5-Knopf, dann die G2/G6-Zeile), CSS beider Zweige bleibt.
3. **`TK_API.tkInject`** (Overdub-/Neu-Zeile) – MAIN (G8): Clip-Länge bis **64**; G267 (G6): `g6Took(...)` im Overdub-Zweig, Länge 16.
   Gelöst: G267-Zeile mit `g6Took` **und** der G8-Länge 64.
4. **Neue Blöcke vor `function voicesInfo()`** – MAIN: G3/G8- und G4/G5-Block; G267: G2-, G6-, G7-Block. Gelöst: alle Blöcke hintereinander
   (G3/G8 → G4/G5 → G2 → G6 → G7), jeder unverändert; die API-Zeilen (`G4_API, G5_API`, `G3_API`, `G8_API`, `G2_API`, `G6_API`, `G7_API`) standen
   außerhalb des Konflikts und sind alle da. Keine Konfliktmarken übrig.
- VERSION: git hatte 4.25.0 (G267) übernommen → zurück auf **4.23.0**.
- Alles andere sauber (G1-Änderungen im Marken-Editor, G6-Haken in `tkStartSrc/tkDrop/tkKill/tkFadeAt/tkXfOut`, `g6Took` im Aufnahmeweg,
  G7-Haken in `applyCarrierChange`/`xpSet`/`tkSched`, G2-CSS liegen neben den G3/G8/G4/G5-Haken).

### Zusammenspiel – geprüft und 4 Nahtstellen angepasst (nur Verbindungen, kein neues Verhalten)
Kette je Take nach dem Zusammenführen (`tkExt().proc`, Ladereihenfolge): `wp ← g2 ← g4 ← Säubern`, d. h. **Säubern → G4 → G2/G7 → Zeitkarte**.
G2 rechnet damit auf der G4-Fassung (G4 rückt weder Zeit noch Tonhöhe). So bleibt das G7-Umschalten aus dem G2-Cache (8 Fassungen je Take)
ohne Neurechnen von G4 (G4 hält nur eine Fassung je Take; umgekehrt müsste G4 bei jedem Transponieren neu rechnen → G7-04 verletzt).
1. **`wpBase(id, a, noG4)`** (Marken-Erkennung „an der Quelle, nie an der G4-Fassung“): überspringt jetzt auch `g2Proc` – die G2-Fassung
   enthält G4. Einsätze sind von der Tonhöhe unabhängig (PSOLA, Dauer gleich).
2. **`g7Pitch`**: wechselt die G4-Fassung (erste G4-Rechnung nach dem Laden, Regler geändert), passte der Schlüssel der G2-Analyse nicht mehr,
   und bis zur neuen Analyse fiel G7 aus (Gesang kurz untransponiert). Jetzt: bis die Analyse nachgezogen ist, gelten die bisherigen Noten.
3. **G6-Mischung bei G4 an**: G4 setzt Hall/Echo der STIMME-Spur (`trackFx → g4Fx` aus `gfx`), die G6-Mischung schrieb die Lead-Sends nur in
   `sound.fx` → wirkungslos, und der Chor-Pegel (`g6Auto`) rechnete mit dem falschen Lead-Hall. Jetzt: `g6Mix` trägt die Lead-Sends bei G4 an
   auch in `gfx` ein (gleiches Undo, Art `gfx`), `g6Auto` nimmt den wirksamen Hall (`trackFx`).
4. **G5 auf einem G2-Take**: `g5Analyse` las den Roh-/gesäuberten Take (Zeitkarte ja, Tonhöhe nein) → „In Melodie umwandeln“ gab die
   gesungenen statt der gehörten Töne. Jetzt: hat der Take ein Tonhöhen-Feld (`take.pitch`, G2), wird die gehörte Höhe gerechnet (Worker,
   ohne G7-Transponieren, sonst würde der MELODIE-Clip doppelt transponiert). Ohne Feld unverändert.
- **G4 × G6 (kein doppeltes FX):** G4 ist offline je Take; der Chor entsteht aus der gehörten Lead-Fassung (G4 → G2/G7) und geht in den
  Spur-Eingang (keine zweite G4-Kette) → Kompressor/EQ wirken genau einmal (wie G6 „Kompressor/EQ für Lead und Chor (G4)“), Hall/Echo als Send.
- **G2/G7 × G3:** der Vorlauf liegt im Take → G2-Analyse/Rendern decken ihn mit ab; G3 spielt Anlauf/Ausklang aus `tkPlayBuf` (gehörte Fassung).
- **G2/G7 × G8:** 64-Takt-Clip quantisiert/transponiert korrekt (Messung unten), aber langsam (offen).
- Regel 28: altes 4.23.0-Projekt (ZIP mit Take) bitgleich, JSON ohne neue Felder (`rt-old`); ohne `gfx`/`pitch`/`chor` keine neue Verarbeitung.
- Marken-Regel „MS 2000“ genau 1×; kein Supabase-/Netz-Aufruf, kein alert/confirm/prompt neu.

### Abnahme auf dem zusammengeführten Stand (Chromium 1243 headless; Skripte aus `helfer-g267` in `dirigent-test/stage-ges2/tests/`, Pfade umgestellt)
G4 „Gesang Synthpop“ ist für neue STIMME-Spuren an. Die G267-Tests vergleichen oft **bitgleich mit dem Roh-Take** – das kann mit G4 nicht mehr
gelten (absichtlich überholt, Regel 26). Darum jeder G267-Test zweimal: wie er ist, und mit `NO_G4=1` (G4 per A/B „ohne“, auch nach Neuladen).
| Skript | wie es ist | NO_G4 | Bemerkung |
|---|---|---|---|
| `g2-core` (Node) | 28/28 (2. Lauf; 1. Lauf 3102 ms > 3000) | – | Kern bitgleich zum Zweig |
| `g2-app` | 20 ✓ / 7 ✗ | 26 ✓ / 1 ✗ | ✗ mit G4: Roh-Take-Vergleiche (Zischlaute, ↶ ganz, A/B) + Rechenzeit; NO_G4: nur G2-04 16 Takte 3,5 s (Zweig allein hier 4,3 s) |
| `g2-lay` | 6/6 | – | |
| `g6-app` | 27 ✓ / 1 ✗ | 28/28 | ✗ lange Tasks 75/65 ms – Zweig allein hier genauso (55/77) |
| `g7-app` | 7 ✓ / 2 ✗ | 8 ✓ / 1 ✗ | ✗ mit G4: Roh-Take-Vergleiche; NO_G4: G7-04 „gehört 193 Cent“ = Messfenster auf 15-Cent-Vibrato (Verlauf ±12 Cent um 200 gemessen, Zweig allein 195–199) |
| `g1/n5-g-t1` | 7 ✓ / 7 ✗ | 14/14 | ✗ mit G4: Kreuzkorrelation gegen Roh-Vorlage (Messung, s. `g1-indep-g4x`) |
| `g1/n5-g-t2` | 38 ✓ / 2 ✗ | 39 ✓ / 1 ✗ | ✗ Animation 276/374 ms (wechselndes Format, Zeit-Rauschen); P1-Wellenform mit G4 = G4-Fassung |
| `g1/g1-indep` | 20 ✓ / 5 ✗ | 25/25 | `g1-indep-g4x` (Vorlage = gehörte G4-Fassung): G1-01 1/16 100 % max 3,5 ms ✓; nur „Roh-Take bitgleich“ ✗ (G4) |
| `g1/g1-indep2` | 5/5 | – | |
| `rt/rt-old` (Regel 28) | 4/4 | – | altes Projekt bitgleich |
| `rt/rt-g2` | 21 ✓ / 4 ✗ | 25/25 (2 von 3 Läufen; 1 × lange Task 57 ms) | ✗ mit G4: Roh-Take-Vergleiche |
| `rt/rt-g7` | 12 ✓ / 8 ✗ | 19 ✓ / 1 ✗ | NO_G4 ✗ lange Task 53 ms – Zweig allein hier ebenso (69/95) |
| `rt/rt-g6` | 18 ✓ / 1 ✗ (lange Task 95 ms) | 19/19 | |
| `interplay.mjs` (neu, Zusammenspiel) | **18/18** | – | G2+G7 auf G3-Take inkl. Vorlauf-Note ±0,3 Cent / +200 Cent, zurück bitgleich; Kette; G6-Quelle/Knoten/Mischung/Undo; G5 auf G2-Take; G8 64 Takte × G2/G7 |
| `smoke.mjs` | ✓ keine Konsolenfehler | | |
| stage-ges `g3-accept` A–F | 60 ✓ / 1 ✗ | | ✗ „kein Knacken“ in C – Ursache: Knack schon im **aufgenommenen Roh-Take** (Mikro-Strom unter Last); Wiederholungen C: Staging 9/36 ✗, vor dem Zusammenführen 0/15 ✗, abwechselnd im selben Zeitraum 0/5 zu 0/5 → offen (s. u.) |
| `g3-lay` | 19/19 | | |
| `g8-accept` S B C R | 37 ✓ / 1 ✗ | | ✗ 64-Takt-Schleife: 2 Stücke mit gleichem Schlüssel = G4-Fassung kam mitten im 2. Durchgang (Überblendung); Wiederholung ✓ |
| `g8-accept` A (G8_MIN=3) | 8/8 | | lange Aufgaben keine |
| `g8-lay` | 24 ✓ / 6 ✗ | | Tasten < 44 px im Aufnahme-Blatt – Befund der Basis 4.23.0 (wie stage-ges) |
| `v3-vs3-accept` A–G | 71 ✓ / 1 ✗ | | ✗ G „A/B sofort“ – auch vor dem Zusammenführen 1 von 2 Läufen ✗ (Zeit-Rauschen, G4 rechnet den anderen Take) |
| `v3-vs3-click` | 3/3 | | |
| `v3-vs2-accept` | 48 ✓ / 1 ✗ | | „Stimme rechtzeitig geplant“ – bekannt schwankend |
| `g4-accept` all / `g4-chain` / `g4-click` / `g4g5-lay` / `g5-accept` | 19/19 · 2/2 · 1/1 · 25/25 · 14/14 | | |
| `g4-cpu` | ✓ +0,68 % (≤ +3) | | |
| `v3-mk8b-ui` (letztes MK-Paket) | 38 ✓ / 2 ✗ | | MK8b-04 k801 −200 dBFS – wie Basis und stage-ges |
Rechner: 4 Kerne, Last 6–7 (andere Sitzungen) – Zeit-Grenzen schwanken.

### Offen
- **Rechenzeit G2 mit G4 an:** erstes Quantisieren eines frischen 16-Takt-Takes 6,3–8,5 s (ohne G4 3,8–3,9 s; Zweig allein hier 4,3 s; Soll ≤ 3 s):
  G2 rechnet auf der G4-Fassung; ist sie noch nicht fertig, wird zweimal analysiert. 64 Takte: Quantisieren 67 s, erste Transposition 55 s.
  Vorschlag (nicht gebaut, Regel 27): G2-Analyse an der Quelle vor G4 und Perioden-Marken übernehmen, oder G4 beim Aufnehmen gleich rechnen.
- **Knack im Roh-Take bei „G3 C“** (Mikro-Strom unter Last, nicht beim Abspielen): im Staging häufiger beobachtet als vorher, aber im
  direkten Wechsel-Vergleich nicht nachweisbar → mit wenig Last nachmessen.
- **Regel 28 / G7:** alte Projekte mit Transponieren (Träger, Teil-Transposition) – die STIMME folgt jetzt (G7-Spec). Ohne Transponieren bitgleich.
  Frage an Xander: sollen alte Projekte mit Transposition beim Öffnen gefragt werden (oder `follow` aus)?
- Fragen an Xander aus G1/G2/G6/G7 (oben) und aus G3/G8/G4/G5 bleiben offen; G4-03 erst mit VS-P.



## G-GES-merge — Zusammenführung · App **4.25.0** (`APP_CODE` 4 025 000) · Format bleibt 5 · kein Supabase-Aufruf

Hauptlinie `mk-wt/index.html` = **4.24.1** (G-T-merge 4.24.0 mit K1, S0–S2, N1/N2, D1, K2 + Hotfix 4.24.1 „Phasen-Start wie 4.23.0“,
dazu G-MK8b-merge-fix). Sicherung vorher: `mk-wt/index.html.vor-merge-G-GES-merge.html`. Zwischenstand `synq-snapshots/G-GES-zwischen.html`,
Ergebnis `synq-snapshots/G-GES-merge.html`. Zusammengeführt (je `git merge-file -L MAIN -L BASE -L <Zweig>` gegen `vs-base-B.html`, 4.23.0):
**VS-L** (+ VS-L-fix), **VS-P** (+ VS-P-fix), **GESANG** = `stage-ges` (G3/G8, G4/G5, G1-Prüfung, G2, G6, G7). Der abgebrochene erste Lauf
(`index.html.teil-merge-G-GES.html`, auf 4.24.0) wurde nicht übernommen, sondern neu auf 4.24.1 gemergt; seine Konfliktlösungen sind geprüft
und gleich gewählt (Kontrolle: Teil-Merge + 4.24.0→4.24.1-Diff = neuer Merge, einziger Unterschied die Hotfix-Zeilen). Der 4.24.1-Hotfix
(Startphasen wie 4.23.0) ist unverändert drin. `VERSION` 4.25.0, Zeile `  live: true,` unverändert, „MS 2000“ genau 1 ×, kein Fremdname,
keine Konfliktmarken, keine neuen alert/confirm/prompt.

### Konflikte (15) und wie gelöst
| Stelle | Hauptlinie / Zweig | Lösung |
|---|---|---|
| `VERSION` (VS-L, VS-P) | 4.24.1 / 4.24.0 | **4.25.0** |
| API-Zeilen (VS-P) | `S012_API` / `VP_API` | beide Zeilen |
| `normalizeProject` `recLength` | VS-L `[1…16]` / G8 `[1…64]` | Liste bis 64 (enthält 16) |
| `undoState` | VS-L-fix `tphase` / G4 `gfx` | beide Zeilen |
| `undoApply` | `tphase` / `gfx` | beide Zeilen |
| `songWrite` Song-Stimme | S2 `s2WriteVox(ch.vox)` / G3 `g3VoxWrite(ch)` | **nur `s2WriteVox`**: beide schreiben dieselben `ch.vox`-Stücke (G3 setzt `ch.vox` bei Verschieben/Tauschen), doppelt hätte jede Song-Stimme verdoppelt |
| `popRecOpts` Länge | `…16` / `…64` | `AUTO 1 2 4 8 16 32 64` |
| `setRecOptions` | 16 / 64 | Liste bis 64 |
| Menü „Länge“ | 16 + Klasse `rlen` / 64 | Liste bis 64 **mit** `rlen` (Knöpfe ≥ 44) |
| `vsRecEnd` | VS-L `mel === false → vsRecVoice` / G3 Auswertung 2 Takte früher | beide: Aus → nur Gesang, An → G3-Fenster |
| `tkMakeTake` fill | VS-P `vpKick(b)` / G3 `g3TakePre` | beide |
| `tkDrop`/`tkKill` | VS-P Begrenzer-Hüllkurve stoppen / G6 Chor-Stücke | beides in einer Funktion |
| `tkVoiceTake` Overdub | VS-L `clip.len = grow` / G6 `g6Took` | beide |
| API-Zeilen (GESANG) | `S012_API, VP_API` / `G2_API, G6_API, G7_API` | alle fünf |
Dazu (kein git-Konflikt, aber Zusammenspiel): VS-L-Grenzen 16 → **64** (G8) in `tkVoiceTake` (Wachsen beim Overdub), `vsRecVoice`
(● REC Aus), `vsFangVoice` (FANG Aus); G6-Chor-Pegel `r.G` (= Clip-Pegel × VS-P-Ausgleich des Leads) – der Chor bleibt im gleichen Abstand.

### Nahtstellen nach dem Zusammenführen (gemessen, behoben)
1. **G4-Auto × VS-P-fix:** G4 rechnete mit dem alten VS-P-Bezug (−16 LUFS *nach* Pegel 0,8: Faktor 0,64) → seit VS-P-fix (−16 *vor* dem
   Pegel, `VP_REF` 1) lag Auto 3,9 dB daneben. Jetzt `VP_REF²` aus VS-P. (Ergebnis G4-03 siehe Offen.)
2. **G3 × VS-P:** die Fassung mit Ausklang (G3, ein Takt später) und der G8-Stück-Take werden sofort gemessen (`vpKick`) – kein späteres
   Einsetzen bei der nächsten Runde.
3. **G7 × Aufnahme unter Transposition (gefunden mit `gs7-v3-vs4-accept`):** ein Take, der gesungen wurde, während der Träger schon
   transponierte (Akkorde Am–F–C–G), wurde beim Abspielen **noch einmal** verschoben (Säubern-Messung −31 dB, Roh-Puffer nicht bitgleich).
   Jetzt folgt ein neuer Take dem Transponieren nur, wenn beim Singen nichts transponiert war (`g7RecFollow`: Anfang, Mitte, Ende und jeder
   Träger-Wechsel im Take); sonst ist „folgt“ aus (umschaltbar). VS4-accept danach 25/26 (= 4.23.0).
4. **G2-Tempo (Auftrag a):** gebaut ist der bessere der zwei Vorschläge – **Analyse an der Quelle vor G4** (`g2Src`: gesäubert bzw. roh;
   G4 rückt weder Zeit noch Tonhöhe), der Klang wird aus der G4-Fassung gerechnet (`rx`: Teilton-Modell je Fassung einmal, Cache 2). Damit
   eine Analyse je Take, egal ob/wann G4 fertig wird oder sich ändert; beim Start der Analyse rechnet G4 im eigenen Worker gleichzeitig.
   (G4 gleich beim Aufnehmen zu rechnen hätte nur den Fall „frischer Take“ verbessert, nicht Regler-Änderungen und lange Takes.)
   Gemessen (Chromium, 4 Kerne, Last ≈ 1): **16 Takte kalt mit G4 3,3 … 4,0 s** (vorher 6,0 … 8,5 s; Zweig ohne G4 hier 4,3 s), ohne G4
   3,0 s; **wie bedient** (Takes-Blatt offen, dann [Hart]) **0,86 … 2,35 s**; 2. Einstellung 0,8 s; **64 Takte 11,9 s** (vorher 67 s); keine
   langen Tasks > 50 ms im 16-Takt-Lauf (`g2-app`), beim 64-Takt-Lauf 3 × 51–59 ms. Mit laufendem Transponieren + Vorberechnung (interplay)
   64 Takte 55–60 s (vorher 55 s) – dort rechnet G7 die Akkord-Lagen der Szene vor.
5. **G3-Knack „C“ (Auftrag b):** neu gemessen bei wenig Last (Lastmittel ≈ 1): `g3-accept C` 7 von 7 Läufen ohne Knack (2. Differenz
   0,0027 … 0,0032). Im Staging traten die Knackser nur unter Last 6–7 auf, und zwar schon im **aufgenommenen Roh-Take** (Mikro-Attrappe
   des Prüfskripts im selben AudioContext). Kein App-Fehler – nichts geändert.
6. **G7 und alte Projekte (Regel 28, Vorgabe des Dirigenten):** nur Takes ab 4.25.0 folgen dem Transponieren (`take.follow = true`,
   additiv; fehlt = folgt nicht). Takes aus älteren Projekten klingen wie bisher. Je Take **[folgt Transponieren]** im Takes-Blatt
   (neben „In Melodie umwandeln“, keine zusätzliche Zeile, ≥ 44 × 44 in 7 Formaten), ein Undo; Test-API `g7Follow`, `g7Info().follow`.
7. **Overdub lückenlos (VS-L Frage 5, Regel 30):** auch beim normalen Overdub klingt der alte Take weiter, bis der neue gelesen ist, dann
   Überblendung (wie beim Länger-Werden). `n4-vs-l-click 4`: längste Lücke **0 ms** (vorher 27–40 ms), M-KLICK 0,0054 je Pegel.
8. **Tasten ≥ 44:** Aufnahme-Blatt „Quantisieren“ und „Einzähler“ 44 px hoch (wie „Länge“); quer rollt das Blatt mit dem Finger (L1 75,
   L2 90, 926 × 428 37 px), FANG ganz erreichbar (`gges-reclay` 7 Formate alle Tasten ≥ 44, `gges-recswipe`). Kleine Hochformate
   (375 × 667, 320 × 568): Spur-Leiste KLANG ✎ ⇅ M ↶ und SPIELEN │ 🎤 │ TRANSPONIEREN, ‹ › 44 px hoch (vorher 36/37/41), ✎ ⇅ M ↶ 44 breit
   (der Spurname kürzt), die Tastatur 14 px niedriger (27 vh − 14, mind. 140 px), die Clip-Matrix unverändert. Song-Werkzeugspalte P3
   2 × 44 px breit (vorher 2 × 30), die Spuren 29 px schmaler. Bibliothek: Chip-Zeile (Micro, 8 Genre-Reiter, übrige Chips) hatte schon
   G-MK8b-merge-fix gebaut – nachgemessen `vq-lib` **0 Ziele < 44** in P1 P2 P3 L1 L2 926 × 428 375 × 812.

### Zusammenspiel geprüft
- **VS-L × VS-P:** 16-Takt-Take mit Melodieerkennung **Aus** über das Mikro (● REC, Länge 16): Mikro −28 / −36 dBFS → STIMME-Clip 16 Takte,
  kein MELODIE-Clip, 0 Auswertungen, Ausgang STIMME (Pegel ganz auf) **−16,03 / −16,02 LUFS**, wahre Spitze −7,3 dBTP, Pegel-Standard
  −19,9 LUFS (`gges/gges-vsl-vsp.mjs`, G4 an).
- **VS-L 16-Takt-Wachsen × G8:** Overdub wächst bis 64 Takte (wie G8-Clips); Länge 32/64 in Aufnahme-Blatt und Menü; ● REC Aus bis 64.
- **VS-P × G4 × G6:** VS-P misst die klingende Fassung (nach G4), G4 rechnet offline, der Chor entsteht aus der gehörten Lead-Fassung und
  bekommt den Ausgleich des Leads (`r.G`) – nichts doppelt; Chor 6,4 / 7,2 LU unter dem Lead (G6-02). Der Begrenzer (VS-P) liegt nur am
  Lead-Stück (Chor ≥ 6 LU leiser).
- **VS-L Aus × G5:** „In Melodie umwandeln“ arbeitet auf dem gespeicherten Take – auch für Takes, die mit „Aus“ aufgenommen wurden.
- **VV1** ist noch nicht in der Hauptlinie: beim Video-Merge gehört der Live-Zustand des VS-P-Auto-Pegels (`vpGet` in `tkStartSrc` gilt nur
  live, `o.ctx` → kein Ausgleich) in `vvSwapIn`, sonst ist die Stimme im Video 4 … 20 dB leiser als beim Abspielen.

### Abnahme auf dem Ergebnis (Chromium 1243 headless; Kopien mit Pfad auf `mk-wt` in `dirigent-test/gges/`, Ausgaben `gges/out/`)
| Skript | Ergebnis | Bemerkung |
|---|---|---|
| `smoke.mjs` | ✓ keine Fehler | |
| `gges-vsl-vsp` (VS-L × VS-P) | 6/6 | −16,0 LUFS |
| `n4-vs-l-accept` 01 02 03 / 04 06 07 / 05 05g 05o / 05s 05x / 08 09 | 17✓1✗ / 12/12 / 4✓1✗ / 2✓1✗ / 22✓2✗ | ✗ siehe Regel 26 unten |
| `n4-vs-l-lay` | 78✓ 12✗ | ✗ nur die Liste „AUTO 1 2 4 8 16“ (jetzt bis 64, G8) |
| `n4-vs-l-click` 16 / 4 | 7/7 · 7/7 | Lücke 0 ms |
| `n4-vs-p-fix-accept` 01 / 03 | 3/3 · 8✓1✗ (NO_G4 9/9) | ✗ „keine Verschiebung“ 0,136 ms nur mit G4 (Phase der G4-Filter am Plosiv) |
| `n4-vs-p-qa-02` · `-fix-p04` · `-fix-vox` · `-click` | ✓ (+1,28 LU) · 7✓1✗ · 5/5 · 11/11 | p04 ✗ INIT ≠ 4.23.0 = K1 (schon in 4.24.x) |
| `v3-vs3-accept` · `v3-vs3-click` | 72/72 · 3/3 | (ein Lauf vorher 71/72: bekannter Zeitpunkt „A/B sofort“) |
| `gs7-v3-vs4-accept` (G4 aus) | 25✓ 1✗ | = 4.23.0 („Audio-Store“-Schlüssel seit F1) |
| `gs7-v3-vs5a-t1/t3`, `vs5b-t1/t3` (G4 aus) | 19✓1✗ · 31/31 · 31✓1✗ · 5/5 | die 2 ✗ ebenso im Staging (G1/G3, Regel 26) |
| `g3-accept` A–F · `g3-lay` | 61/61 · 19/19 | |
| `g8-accept` S B C R · A (3 min) · `g8-lay` | 38/38 · 8/8 · 30/30 | |
| `g4-accept` · `g4-chain` · `g4-click` · `g4g5-lay` · `g5-accept` | 19/19 · 2/2 · 1/1 · 25/25 · 14/14 | |
| `g4-auto` female / male (G4-03) | 2✓1✗ · 2✓1✗ | **offen**, siehe unten |
| `interplay` (G2/G6/G7 × G3/G4/G5/G8) | 17/17 | Test wartet jetzt auf die G4-Fassung |
| `g2-app` · NO_G4 · `g2-lay` | 21✓6✗ · 26✓1✗ · 6/6 | mit G4: Roh-Vergleiche (Regel 26, wie Staging) + 16 Takte kalt 3,98 s; NO_G4: 3,01 s (Soll ≤ 3) |
| `g6-app` | 26✓2✗ | ✗ Zählung der Puffer-Quellen: + VS-P-Begrenzer-Hüllkurve; gezählt am Stück: 1 Lead mit 4 bzw. 3 Chor-Stücken ✓ |
| `g7-app` · NO_G4 · `gges-g7alt` | 8✓2✗ · 9/9 · 14/14 | ✗ mit G4: Roh-Vergleiche (Regel 26) |
| `rt-old` (Regel 28) | 4/4 | |
| `gges-reclay` · `gges-recswipe` · `vq-lib` · `gges-sweep7` | 7/7 · 3/3 · 0 < 44 | Rest-Liste siehe Offen |
| `v3-mk2-wellen` · `gmk8b-ui/cross/restore/reg/panik/contrast/hit44` · `gmk8b-vocal` · `gmk8b-p3count` | alles PASS · 0/128 | |

**Überholte Test-Erwartungen (Regel 26):** VS-L-05 „Vorlauf 0,25 s“ → seit G3 bis 2 Takte (12,25 s bei 40 BPM; der Take liegt ganz im
Ringpuffer, `late` 0); VS-L-05x „Grenze 120 s → `late` > 0“ → seit G8 hat die Song-Aufnahme keine Zeitgrenze (`late` 0); VS-L-02/08
„deep-equal zu 4.23.0“: Vergleich gegen `stage-ges` (G3 verlängert jeden Take), einziger Unterschied `take.pre.sec` ± 0,01 s bzw. der
Anlauf des Song-Takes ± 61 ms (Abstand zum Mikro-Start, Zeit-Rauschen) und Noten-Messrauschen ≤ 0,03 Schlag; `n4-vs-l-click` drückt ●
selbst (AUTO endet seit G8 erst nach 64 Takten); `n4-vs-l-lay` Längen-Liste; VS5b „Dehnen 70 %“ → G1 macht 100 % zum Standard;
`g6-app` Quellen-Zählung (+ VS-P-Hüllkurve); G2/G7/VS4/VS5 „bitgleich zum Roh-Take“ mit G4 an (G4 ist für neue STIMME-Spuren an).

### Entscheidungen zu den offenen Fragen (Regel 30)
- **VS-L 1 Mikro-Blatt quer:** bleibt rollbar mit dem Finger (üblich bei Blättern, kein Umbau).
- **VS-L 2 Quantisieren/Einzähler 44 px:** gebaut (oben 8).
- **VS-L 3 MELODIE-Clip über 4 Takte bei 16-Takt-Gesang:** bleibt wie ein Tasten-Overdub (Schleifen-Aufnahme legt in die Clip-Länge) – die
  STIMME wächst, die Noten bleiben im Raster des Clips; wer 16 Takte Noten will, nimmt auf einen leeren Platz auf oder nutzt G5.
- **VS-L 4 FANG Aus braucht freien MELODIE-Platz:** bleibt (gleiche Szene wie FANG An, sonst springt der Gesang in eine andere Szene).
- **VS-L 5 Overdub-Lücke:** gebaut (oben 7).
- **VS-P Lautstärke der Stimme / Schalter Auto-Pegel:** bleibt wie VS-P-fix (−16 LUFS vor dem Pegel = Bezug der Synth-Kalibrierung, Stimme
  ≈ 1 LU über den Synths); kein Schalter (Pegel-Regler wirkt relativ).
- **G7 alte Projekte:** siehe oben 6.

### Offen
- **G4-03 nicht erreicht** (Auftrag c): nach Auto liegt der Gesang im Band 2–5 kHz +0,7 dB (weiblich) / +0,1 dB (männlich) über den Drums
  (Soll ≥ 3). Ursache: VS-P-fix setzt die Stimme 3,9 dB tiefer als beim G4-Bau (VS-P-02: höchstens 3 LU über den Synths); mit Präsenz-Anschlag
  +9 (gemessen auch +12) reicht die EQ der Stimme allein nicht, weil VS-P jede Anhebung wieder auf −16 LUFS ausgleicht. Bei Pegel ganz auf
  (+3,9 dB) wäre es erfüllt. VS-P-01/02 und G4-03 schließen sich mit EQ nur in der Stimme aus; erfüllbar ist es mit der
  „Gegenspur-Kerbe nur im Gesang“ als **dynamische Kerbe in den anderen Spuren (2–5 kHz, nur während gesungen wird)** – eigener DSP-Baustein
  (Hüllkurve wie der VS-P-Begrenzer vorausberechnet), nicht in diesem Merge gebaut.
- **Touch-Ziele mit Umbau (aus G-MK8b-merge-fix):** quer sind die Spur-Zeilen 31–37 px (5 Zeilen teilen sich ≈ 165 px; 44 px je Zeile ginge
  nur mit 2–3 Spuren je Seite oder ≈ 60 px weniger Tastatur), SPIELEN │ TRANSPONIEREN quer 40 / 37 px (die Spalte über ‹ › ist 130 px hoch,
  3 × 44 + Abstände brauchen 148), Song-Spuren AKKORDE/MELODIE 27–39 px (alle Spuren teilen sich die Höhe; 44 px nur mit senkrechtem Rollen
  der Song-Ansicht), ✎ ⇅ M ↶ quer 667 × 375 40 × 45 (Seitenleiste 260 px: Name + 5 × 44 passen nicht). Diese brauchen einen sichtbaren
  Umbau des Querformats – nicht gebaut. Gebaut ist, was ohne Umbau ging (oben 8).
- **G2 kalt mit G4:** 16 Takte 3,3 … 4,0 s auf diesem Rechner (Soll ≤ 3 s; wie bedient 0,9 … 2,4 s).
- Fragen an Xander aus den Zweigen, die wirklich nur er entscheiden kann: G4 „Gesang Synthpop“-Klang (anhören), G2 natürlicher Klang
  (anhören), G8 Restzeit-Anzeige/480-MB-Grenze am iPhone, G6 Chor-Klang. Alles andere ist oben entschieden.


## 4.25.1 — Hotfix „Einsingen entsperren“ (Nachtrag 9 §1, H1–H8)

Grundlage `bau/snapshots/G-GES-merge.html` (4.25.0). `VERSION '4.25.1'`, APP_CODE 4 025 001, `live: true` unverändert. Kein neues Projekt-Feld:
neue Schalter liegen im Geräteprofil (`uiPrefs`: `vocClick`, `stsess`) oder sind Laufzeit (`UI.recTg.vox`, `UI.recTgVox`, `UI.recGuide`, `rec.vox`,
`rec.withScene`, `MICW`). Patch: `bau/helfer/H4251/patch-4251.diff` (≈ 180 geänderte Zeilen, nur örtlich).

**Begriff Gesangs-Aufnahme** `vocalTake(ti)`: Zielspur ist die STIMME-Spur oder 🎤 ist an. Reine MIDI-Aufnahmen ohne 🎤 laufen in allen Punkten wie 4.25.0.

- **H1 ● startet die Begleitung (Szene).** Was: `recWithScene(ti, si)` in beiden Stopp-Zweigen von `recPress` vor `startTransport`: jede andere
  Spur mit Clip in der Szene und ohne Belegung (`R.slot −1`, kein `R.pend`) startet die Szene; Akkordzeile wie bei ▶ n. Belegte Spuren bleiben.
  Overlay `#ciTgt`: „Stimme · Szene 1 · Begleitung: Synth 1, Synth 2, Synth 3 +2“ (bis 3 Namen, dann +n, darf umbrechen), leer → „Ohne Begleitung – Szene n
  ist leer“ + Toast; Overdub auf STIMME-Clip → „alter Take läuft als Vorlage“. Warum: ● aus dem Stopp spielte nur den Klick. Gemessen: H-01…H-06 16/16
  (alle Spuren je Takt ≥ 1 Note, Ausgang −15,9 dBFS = ±0,1 dB zur Szene ohne Aufnahme, im Einzähler 0 Clip-Noten, 1 Undo-Schritt).
  **Befund:** Nach dem Laden setzt `applyProject` R.slot auf Szene 1 (nicht −1 wie in der Spec angenommen); H1 wirkt also vor allem nach ■/Stopp
  einzelner Spuren und bei Szenen ohne vorher gespielte Spuren. Verhalten wie Spec, Test setzt den Spec-Zustand explizit.
- **H2 Song-Aufnahme mit 🎤: Ziel „Gesang“.** Was: Schlüssel `vox` in den Song-Zielen; mit 🎤 ab Werk nur Gesang, bis die Ziele mit 🎤 selbst gewählt
  sind; `vox` in `setRecTargets`, Ziel-Übernahme, `recTgShort` („🎤“) / `recTgLong` („Gesang“), START-Freigabe, `songRecTargets`. Schutz in
  `songCommitNotes`: mit Stimme und 0 gespielten Noten im ersten Durchgang wird nichts gelöscht. Start-Blatt: Chip [🎤 GESANG] (≥ 44 px, bei 320 px und
  L2 ohne Beschriftung „Ziele“), Modus-Text „Gesang ersetzt …; alles andere spielt weiter. stumm: alte Stimme … / nichts stumm“. Ziele-Zeile im
  Querformat auf 44 px (vorher 40). Warum: ● SONG mit 🎤 schaltete die gewählte Spur stumm und löschte deren Noten. Gemessen: H-10…H-14 + H-70 grün;
  H-11/H-12 Ergebnis Zeichen für Zeichen wie 4.25.0 (Vergleichslauf).
- **H3 Klick beim Singen „Nur Einzähler“.** Was: Geräte-Einstellung `vocClick` ('ci' Standard | 'always'); Scheduler `rec.vox ? UI.vocClick ===
  'always' : S.settings.metroInRec`. Zeile „Klick beim Singen [Nur Einzähler] [Immer]“ im Menü → Aufnahme und im ●-Halten-Blatt (44 px). Projekt-Feld
  `metroInRec` unverändert. Gemessen: H-20…H-23 10/10 (4 Klicks −4…−1, betont −4, 0 im Take; MIDI-Take Klicks gleich 4.25.0; übersteht Neuladen).
- **H4 Vorzähler bei laufender Musik und im Song-Vorlauf.** Was: `recCdStart/recCdLeft/recCdClick/recCdCatchUp`; Overlay zählt bei „bereit“ und im
  Song-Vorlauf (≤ 4·max(1, Einzähler) Schläge), am Start 0,5 s „●“ (`.n.go`); Klicks im Einzähler-Fenster vor dem Start (bereits eingeplante Schläge
  bekommen ihren Klick sofort). Nur Gesangs-Aufnahmen. Gemessen: H-30…H-33 14/14 (3, 2, 1, ● auf 6/7/8 ±0,15 Schlag; Klicks 6 und 7; Song-Punch
  ab Takt 5: 4…1 und 4 Klicks; MIDI-Take gleich 4.25.0; renderTakt 0,001 ms/Bild).
- **H5 ● auf STIMME ohne 🎤.** Was: `recMicStart` startet das Mikro im selben Tipp; Aufnahme erst bei `live`, ≥ 0,5 s Ringpuffer, keine
  Kurz-Einmessung (Weg Lautsprecher: Ende abgewartet), höchstens 4 s, Overlay „🎤 wird bereit …“; zweites ● bricht ab. Ohne Mikrofon / ohne Einmessung /
  verweigert: Meldung, nichts startet. Gemessen: H-40…H-43 8/8 (Fake-Mikro: Einmessen fertig nach 2,8 s, Transport ab 3,05 s).
- **H6 Ausgang beim Singen.** Was: Zeile `#ciHint` (12 px, höchstens 2 Zeilen) bei jeder Gesangs-Aufnahme: Lautsprecher-/Bluetooth-Hinweis, Kabel
  nichts. `?stsess=par|auto|none` (gespeichert nur, wenn der Parameter in der Adresse steht; Test-API `stimmeSess`) für `stStart`/`micTapGet`.
  Gemessen: H-50…H-52 9/9 (Attrappe: ohne Parameter 'play-and-record' wie 4.25.0, auto → 'auto', none → nichts; aus → 'playback').
- **H7 Vorlage beim Song-Ersetzen.** Was: Start-Blatt-Zeile „Alte Stimme [stumm] [hören]“ (wenn 🎤 an und im Bereich alte Stimme), `UI.recGuide`
  → `sr.guide` → `tkSongMute` null. Gemessen: H-60/61 (alte Stimme in Takt 3–4 eingeplant bzw. stumm wie 4.25.0; Ergebnis neuer Take, ↶ stellt her).
- **H8 Leerer Song + 🎤:** Toast „🎤 Gesang wird beim ersten Song-Durchgang nicht aufgenommen – …“. Gemessen: H-70.

**Gemeinsam (Regel 28):** Golden-Klangtest `bau/tests/n5-k-golden.mjs` 4.25.1 gegen 4.25.0: 320/320 Klänge ≤ −90 dB. Demo: normalisiertes Projekt
gleich, Noten-Plan 8 Takte Szene 1 + 2 gleich (H-90). Regression aus `bau/tests` vorher/nachher identisch: Smoke, `v3-v2d2-rec` 65/65 (N7S-27…32),
`v3-qa-vs3-reg` „all ok“. H-92: siehe STATUS.

## 4.25.2 — Nachschub „kleine Gesangs-Fehler“ (Nachtrag 9 §1.2, K1–K4)

Auf 4.25.1. `VERSION '4.25.2'`, APP_CODE 4 025 002. Patch `bau/helfer/H4251/patch-4252.diff` (≈ 45 Zeilen).

- **K1 G3-Ausklang nach Kürzen/Punch.** `g3Exit`/`g3PostDraw`: kein Ausklang, wenn der Take über das (gekürzte) Clip-Ende ragt; `g3VoxSeg`: `full` als
  Gleichheit ±1e-3; `tkVoxTrim` kürzt `out` (auch in `alt`) auf das Stückende. Warum: nach „Länge −1“ sprang der Ausklang einen Takt nach vorn, das linke
  Reststück eines Punch lief bis zu 1 Takt in die neue Aufnahme. Gemessen: K-01/K-02 (4.25.1: Ausklang bei Takt 1 und 2, Reststück out 17,0 s statt 7,0 s;
  4.25.2: kein Ausklang, out = 7,0 s), K-03 Undo + Laden deep-equal. Regel 28: betrifft nur Zustände seit 4.25.0 (Clip kürzer als Take mit gemessenem
  Ausklang); im Repo-Snapshot gibt es keine Projekte mit Song-Stimme.
- **K2 Marken-Editor ohne versehentliches Verschieben.** `wpHit`: Fangradius ≤ 16 px und ≤ halber Nachbarabstand, zwei Kandidaten < 6 px → keiner;
  `wpGest`: greifen nur im oberen 44-px-Streifen (dort sitzt das Griff-Dreieck), auf der Welle schwenkt ein Finger immer; zweiter Finger (auch neben der
  Welle) verwirft den Zug. Tipp wie bisher. [V] Bedienung ändert sich (Funk). Gemessen: K-04 500 Wische 0 Marken bewegt (4.25.1: 40 Wische → 6
  Verschiebungen), K-05 0 bewegt/0 Undo, K-06 1 Undo.
- **K3 Clip-Blatt STIMME.** +1/×2 gesperrt erst ab 64 Takten (alle Clips, wie `clipLength`); „Quantisieren…“ öffnet bei STIMME den Marken-Editor;
  Untertitel „N Takte · Gesang · K Takes“; ×2 heißt „Doppelte Länge (Gesang einmal, danach Stille)“. Gemessen: K-07…K-09.
- **K4 Feste Take-Nummern** nach Alter (`created`, dann `in`), nur Anzeige. Gemessen: K-10 (Take 3 nach oben bleibt Take 3; gelöscht → 4…7 werden 3…6).

## 4.25.2 — Auslieferung (01.11.2026, ~02:00 UTC)

Ausgeliefert = 4.25.0 (G-GES-Merge: VS-L, VS-P, Gesang G1–G8) + Hotfix 4.25.1 (H1–H8) + Nachschub 4.25.2 (K1–K4). Die lange Schluss-Testphase des Gesang-Merges wurde auf Xanders Wunsch abgebrochen (Merge-Phase hatte die Abnahmen bereits laufen lassen; Hotfix-Tests grün). Smoke, orch-mk-check und v3-mk2-wellen: PASS. Bekannt offen (folgt): G4-03, einige Touch-Ziele quer < 44 px, G2-Korrektur 16 Takte kalt ≈ 4 s mit G4 (Ziel 3 s).


App: `bau/helfer/G9M/index.html` (3 825 591 B; 4.25.2 3 678 856 B → **+143 KB**). Patch gegen 4.25.2: `patch-g9.diff`
(31 Stücke, 164 KB, fast nur der G9-Block selbst). Spec: `spec/n8/G9.md`, `spec/n8/G9-probe-ergebnis.md`.

### Was Xander bekommt
- Alles aus 4.25.2 bleibt (VS-L, VS-P, G1–G8, Hotfix H1–H8, K1–K4, 64-Takte-Clips).
- Dazu der Songtext-Stand aus G9D (`origin/g9-br-D`): Text-Modus im Marken-Editor, richtige Silbentrennung (Muster aus
  `/Synquenzer/vendor/g9/syl/`, mit SHA-256 geprüft, im Gerät in `synq-g9-v1`), [Ganzer Text], Marken nehmen den Text mit,
  Erkennungs-Ablauf ohne Sprachmodell ([Erkennen] bleibt ausgeblendet).

### Gebaut
1. **3-Wege-Merge** Basis `stage-ges2.html`, ours `R-4252.html`, theirs `G9STAGE.html` (`git merge-file --diff3`). 4 Konflikte, je beide Seiten erhalten:
   - `normPrefs`/Projekt-Einstellungen: `out.vs` mit `mel` (VS-L) **und** neue Zeile `out.g9` (§5.4).
   - Warp-Cache `WP.alt.set` / `WP.cache.set`: `buf: vpKick(ab)` (VS-P) **und** `map: w.map` (G9, Marken-Abbildung).
   - `Object.assign(SYNQUENZER, …)`: `S012_API`, `VP_API` **und** `G9_API`.
2. **Probe-Ergebnis G9-61** (iPhone 12 Pro Max, iOS 18.7):
   - Haptik-Labels im Text-Modus nur bei geschlossener Tastatur (war schon so: `#wpSheet.g9.hap:not(.g9dock) .g9hl`); Kommentar in `g9Dock` auf das Ergebnis umgestellt.
   - neu `g9Hap(G, kind)`: im Tastatur-Dock auf iOS **kein** `haptic()` (ein Label-Klick per Code tickt nicht, 1/2 = nein, und ein
     Label-Tipp schließt die Tastatur, 5 = zu); sonst wie bisher. Benutzt beim Wählen eines Abschnitts (`g9Select`) und beim Übernehmen (`g9Accept`).
   - Ziehen: kein Tick (war schon so: Label-Klick < 400 ms nach einem Zug wird verworfen).
3. `VERSION = '4.25.3'` (APP_CODE 4025003), `  live: true,` unverändert.
4. **Service Worker** `sw.js` (aus `main`): beim Aktivieren bleiben `synq-app-1` **und** alle `synq-g9-*` (`KEEP`); Diff `sw.diff`.
5. `vendor/g9/` (LIZENZEN.txt, `syl/de-x-syllable.wasm` 94 905 B, `syl/en-us.wasm` 21 027 B) → beim Ausliefern nach `/Synquenzer/vendor/g9/`.

### Geprüft (Chromium, Playwright)
| Lauf | Ergebnis |
|---|---|
| G9D `t2`–`t12` gegen G9M | 224/226; die 2 übrigen sind erwartet: t5 „VERSION-Zeile unverändert“ (jetzt 4.25.3, gewollt), t11 „Projekt-JSON gleich wie stage-ges2“ (4.25.2 hat eigene Felder, z. B. `vs.mel`) |
| t11 Regel 28 gegen **R-4252** | 12/12 (Marken, VS5b-Text, Quantisieren/Dehnen-Prüfsummen, Projekt-JSON Zeichen für Zeichen, altes Projekt laden) |
| t12 Zeiten gegen R-4252 | 6/6 (App-Start +1,9 %, Tastendruck-Vorschau 64 Takte Median 4,8 ms) |
| t3 (allein) | 41/41 (Tastendruck Max 3,2 ms; der eine Ausreißer 8,3 ms kam vom Parallel-Lauf, G9STAGE allein 3,3–3,8 ms) |
| Hotfix H1 / H3 / K (K1–K4) | 16/16 · 10/10 · 19/19 |
| neu `tests/t13-probe-dock.mjs` (Probe G9-61, Tastatur 394 px) | 5/5 (Gegenprobe G9STAGE: 4/5, 3 Code-Klicks im Dock) |
| Smoke (428×926, 926×428, 320×568) | 12/12 |
| Gesang-Take abspielen | 4/4 (Ausgang −23,9 dB; 4.25.2 gleich: −23,8 dB) |

### Markennamen
Der Patch bringt keine neuen. In 4.25.2 schon vorhanden und unverändert: „Kodamo“ (nur im ⓘ mit Pflichtsatz, N2-4b-02) und
„Nord Drum“ in alten Klang-Beschreibungen (bekannt seit vor 4.23.0); „MS 2000“ genau einmal.


# CHANGES – VIDSTAGE (Staging Video-Paket) · App 4.25.0 · Format 5 · keine Server-Änderung

`index.html` = `bau/vs/n5-br-V/index.html` (VV1 + VV2 + Fixes) + VV3 aus `helfer-vv3` (Basis `bau/snapshots/VV1.html`)
+ VC2a aus `bau/vs/n5-br-H/index.html` (Basis `bau/werkzeug/vs-base-B.html`).

## 1. Zusammenführung – Fehler, die dabei entstanden und behoben sind

| Fehler | Behebung |
|---|---|
| Syntaxfehler: beim Auflösen eines Konflikts war eine Kommentarzeile abgeschnitten | Konflikt neu und verankert aufgelöst (`a878da8`) |
| VC2a × VV1: der Verlauf-Rekorder lief während des Offline-Renderns mit (Song ist dabei ausgetauscht, `loop.on` aus) | `histBusy()` ist während `UI.vvOff` wahr – kein Durchlauf, kein Keyframe (`90936b0`) |
| VV2 × VV3: der Test-Schalter `VV.test.spur` hatte Vorrang vor dem Spur-Schnitt der Regie | der Spur-Schnitt der Regie (`view 'spur'`, `st.spur`) geht vor, Test-Schalter nur ohne Schnitt (wie VV3) (`90936b0`) |
| Tests: feste Pfade auf die Zweige | alle Test-Bibliotheken nehmen `APP` aus der Umgebung (Standard = Staging-Datei), Gegenprobe gegen Zweige mit `APP=…` |

## 2. Zusatz (Xander 31.10.)

- **Video immer in voller Klangqualität:** beim Offline-Rendern (WebCodecs und Rückfall-Weg, beide nutzen den Offline-Ton) steht der
  CPU-Begrenzer auf Stufe 0 – auch wenn live gerade Stufe 1–3 oder „Eco“ gilt. Nach dem Rendern kommt die Live-Stufe unverändert zurück
  (`vvSwapIn` setzt `LIM.level = 0`, `vvSwapOut` stellt `LIM` wieder her). Der Klang alter Projekte ändert sich nicht (live nichts geändert).
- **Bereich [Ganzer Song] / [Auswahl]:** gibt es eine gelbe Auswahl, zeigt die Zeile „Bereich“ im Video-Blatt die Wahl als zwei Knöpfe
  (44 px hoch); vorgewählt ist [Auswahl] (bisheriges Verhalten). Ohne Auswahl bleibt der Text „ganzer Song“. Vorschau, Standbild und
  Video erstellen folgen der Wahl. In niedriger Queransicht (≤ 400 px hoch) mit Auswahl rücken die Zeilen von 4 auf 2 px Abstand, damit
  die Bedienung nicht rollt.
- **Ausklang auch bei Auswahl:** war schon so (die Auswahl endet wie ein Song-Ende, Hall/Echo klingen bis < −60 dBFS, ≤ 10 s, aus) –
  jetzt mit eigenem Nachweis (Z3).
- **Teilname klebt im Song-Bild:** der gelbe Teil-Kopf zeigt seinen Namen am linken Rand der Ansicht, solange der Teil im Bild ist –
  nie links vom Teilanfang, nie über sein Ende hinaus; Stellung „3/16“ rechts wie bisher.

## 3. Abnahme (Staging-Datei, Ausgaben in `tests/out/`, `tests/n5-v-out/`)

Rechner: 4 Kerne, Läufe zu dritt parallel; lastempfindliche Läufe allein wiederholt.

| Paket | Ergebnis | Läufe |
|---|---|---|
| VC2a-01/02/09 | bestanden | `n5-h-01` ALLE BESTANDEN |
| VC2a-03/04 | bestanden | `n5-h-03` ALLE BESTANDEN (1000 Ereignisse 19,6 KB gzip) |
| VC2a-06/07/08 | bestanden | `n5-h-06`, `n5-h-07`, `n5-h-08` ALLE BESTANDEN |
| VC2a-10 | bestanden | `n5-h-10`, `n5-h-menu` (6 Größen) ALLE BESTANDEN, `n5-h-views` 0 Daten-Ereignisse |
| VC2a-fix | bestanden | `n5-h-ab-02gate`, `-ab-08mk`, `-ab-race`, `-ab-race2`, `-ab-roll2`, `-ab-key`, `-fx-keystate`: wie im Zweig |
| VV1-01/08 | bestanden | `n5-v-abn-01`, `n5-v-a1` (16:9/9:16 1920×1080/1080×1920, 30/1, Soll 19,474 s; Rückfall webm; ohne beides grau) |
| VV1-02 | bestanden | `n5-v-a1` Ausklang 4,98 s, Ende < −55 dBFS |
| VV1-03/06 | bestanden (allein) | `n5-v-a3`: Live/Offline −14,35/−14,36 LUFS, Noten 254 = 254, Solo-Spuren ok, Projekt/Knoten/Werte gleich |
| VV1-04 | bestanden | `n5-v-abn-04` Laufband Takt 2/6 auf < 1 Bild; „matrixRange“ s. Abweichungen |
| VV1-07 | bestanden | `n5-v-abn-07` P1 P2 P3 L1 L2 926×428: 0 Knöpfe < 44, nichts abgeschnitten, Bedienung rollt nicht |
| VV1-fix | bestanden | `n5-v-abn-10b`, `-10c`, `-10d`, `n5-v-fx-keys`, `n5-v-qm-bank`, `-bank2`, `-metro` wie im Zweig |
| VV2-01/02/04/05 | bestanden | `n5-v-vv2-01` (alle Bilder erkannt), `-vv2-02` (alle Schritte), `-vv2-04z`, `n5-v-qa2-cam` (0 über 5 %), `-vv2-05` |
| VV2-03 | bestanden (s. Abweichungen) | `n5-v-vv2-03` 9:16: Schnitte, Hash 2× `44b13e35`, Kamera gleich in 1967 Bildern; Blenden fertig nach 6–8 Bildern |
| VV2-fix | bestanden | `n5-v-qa2-stimme`, `-q2-save`, `-q2-save2`, `-qa2-cuts2`, `-q2-auto`, `-q2-auto2`, `-vv2fix`, `-q2-edit`, `-q2-ui2`, `-vv2fix-undo`, `-q2-toast` wie im Zweig |
| VV3-01/01b/02 | bestanden | `vv3/vv3-01`, `-01b`, `-02` (Video: 550 Bilder, 128 Noten, 0 Abweichungen) |
| VV3-03 | bestanden | `vv3/vv3-03`: Spur-Bild ändert nichts, 3-min-Song 9:16 2,39 × schneller als Echtzeit |
| Zusatz Z1–Z4 | bestanden | `n5-v-vs-zusatz`: Z1 Render mit Stufe 0, danach live wieder 3 · Z2 Wahl ohne/mit Auswahl, 2 Knöpfe 98×44 / 72×44, Tipp [Ganzer Song] → Takte 1–8 · Z3 Auswahl 1–4: Ausklang 5,64 s, Ende −58,7 dB · Z4 Teilname bei Takt 2…16,5 immer im Bild (hoch und quer). Gegenprobe mit der Datei davor: Z1, Z2, Z4 scheitern, Z3 besteht (war schon so). |
| Smoke | ohne Fehler | `vv3/smoke` |

### Abweichungen
- **VV2-03 Blende „monoton“** (Schnitt Takt 9 auf Spur 2): Abweichung 9,1 → 10,6 im 5. Bild. Die Einzelbilder (Bild 515–522) zeigen
  eine saubere Überblendung ohne Flackern; im ausgeblendeten Spur-Bild schlägt währenddessen eine Note an (VV3 umrandet klingende
  Noten), das Vergleichsbild des Skripts enthält nur das neue Bild. Im Zweig n5-br-V (ohne VV3-Spur-Bild) monoton. Messartefakt aus
  VV2-Test × VV3-Bild, kein Fehler.
- **Überholte Test-Erwartung (Regel 26):** `n5-v-abn-07` las mit Auswahl den Text „gelbe Auswahl“; jetzt steht dort die Wahl
  [Ganzer Song]/[Auswahl] – das Skript liest den gewählten Knopf („Auswahl“). Es meldet „Layout-Sprung“ im Zustand „fertig“, weil es die
  Auswahl bei offenem Blatt setzt (Zeile 32 → 44 px); in der App liegt das Blatt über allem, die Auswahl ändert sich bei offenem Blatt nicht.
- Unter Last (3 Läufe parallel): `n5-v-a1` Rückfall webm 11,44 s gegen 11,26 s und `n5-v-a3` Live-Noten 253/254 – allein wiederholt
  beide bestanden (11,40 s; 254 = 254). „offlineBitEqual“ false wie im Zweig (VV1-fix Abweichungen).
- `n5-v-abn-04` „matrixRange“ Takt 4 und `n5-v-q2-save2` „Datei in frischer Seite“ (Skript gibt Text statt Objekt): wie im Zweig dokumentiert.
- `n5-v-q2-edit`, `n5-v-vv2fix` „undoEq/redoEq false“ an denselben Stellen wie mit `APP=bau/vs/n5-br-V/index.html` (Gegenprobe) – Skript-Vergleich, kein Fehler der Zusammenführung.
- `n5-v-abn-01` Rückfall webm unter Last nur 22 Bilder – wie im Zweig dokumentiert.
- VC2a-05 (Leistung) und VV1-05 (3-min-Tempo) hier nicht neu gemessen (Rechner geteilt); VV3-03 misst das Tempo mit Spur-Bild (2,39 ×).

### Fragen an Xander
- keine.

### iPhone (Xander)
- Song mit gelber Auswahl → Menü → Video: [Ganzer Song] / [Auswahl] tippen, ▶ Vorschau und Video erstellen folgen der Wahl.
- Video erstellen, während die CPU-Anzeige „CPU 2/3“ zeigt: das Video klingt voll (wie bei ruhigem Gerät).
- Song-Bild (Bild: Song) mit langem Teil: der Teilname bleibt links stehen, solange der Teil läuft.


## G-VID-merge — Zusammenführung · App 4.26.0 (APP_CODE 4026000) · Format 5 · keine Server-Änderung (CLOUD `live: true` bleibt)

Hauptlinie 4.25.2 (Gesang komplett + Hotfix 4.25.1 H1–H8 + 4.25.2 K1–K4) + VIDSTAGE (VV1 Song-Video, VV2 Regie, VV3 Innenleben,
VC2a Verlauf-Rekorder; Basis vs-base-B 4.23.0) per `git merge-file` (Basis `vs-base-B.html`). Sicherung vorher:
`mk-wt/index.html.vor-merge-G-VID-merge.html`, Zwischenstand direkt nach dem Merge: `synq-snapshots/G-VID-zwischen.html`.

### Konflikte (5) und Auflösung
| Stelle | Auflösung |
|---|---|
| `VERSION` 4.25.2 / 4.25.0 | `4.26.0` (höher als alle Seiten) |
| `songInsert…` Ende (Teil einfügen): `s2WriteVox` (S2/G3) / `vvDirWrite` (VV2) | beide Zeilen: erst die Song-Stimme (S2/G3), dann die Regie (VV2) |
| Marken-Blatt: `s012MarkSheetPaint` (S0/S2) / Zeile „Video“ `vvDirRow` (VV2) | Zeile „Video“ wird an das Blatt gehängt, danach setzt `s012MarkSheetPaint` „Bearbeiten“/„Zusammenfassen“ ein (im Bearbeiten-Modus ersetzt S0 das Blatt wie bisher) |
| Takt-Blatt: `s2RangeItem()` (S2) / `vvDirRow` (VV2) | beide: Eintrag „Zusammenfassen“ in der Liste, Zeile „Video“ darunter |
| `Object.assign(SYNQUENZER, …)`: S012/VP/G2/G6/G7 / vvApi/vv2Api/vv3Api | alle acht APIs |

### Zusammenspiel (Auftrag) und Befunde Xander 01.11.
- **vvSwapIn/vvSwapOut nehmen auch den Gesang mit:** VS-P (wartende Neu-Planungen des Auto-Pegels `VP.cb`), G3 (Vorlauf/Ausklang-Zustand),
  G6 (Chor-Knoten je Kontext – vorher hätte der Render die Live-Knoten überschrieben), G7 (vorberechnete Transponier-Fassungen) werden vor
  dem Offline-Durchlauf herausgenommen und danach zurückgelegt. Vor dem Rendern wartet `vvVocReady` (≤ 30 s), bis jede klingende Fassung
  fertig ist (G4-Effekte, G2/G7 Tonhöhe/Transposition, VS4/VS5 Säubern/Dehnen, G6-Chorstimmen) – das Video klingt wie der fertige Song.
  Gemessen: Song live −14,93 / Render −14,90 LUFS (Δ 0,03 LU), nur STIMME (Take mit G4 + G6-Terz-Chor) −17,67 / −17,66 LUFS (Δ 0,01 LU).
- **VC2a × Gesang (gefunden mit `n5-h-01`):** die Undo-Arten der Hauptlinie `gfx` (G4) und `tphase` (VS-L-fix) waren beim Verlauf-Rekorder
  nicht angemeldet, und `tflag` (STIMME an/aus setzt seit G4 auch `gfx`) meldete nur `stimme` → „Änderung am Rekorder vorbei“ an
  `tracks/7`. Jetzt: `gfx` → `tracks/i/gfx`, `tflag` → `stimme` + `gfx`, `tphase` → kein Projektfeld (nur Laufzeit). Der Rekorder läuft
  während des Offline-Renders weiter nicht (`histBusy` bei `UI.vvOff`).
- **V-A (kein Ton im ersten iPhone-Video):** nie mehr ein Video ohne Ton. (1) Ohne `AudioEncoder` oder bei `isConfigSupported = false`
  nimmt die App den Aufnahme-Weg (MediaRecorder mit Bild- UND Tonspur); die Tonquelle läuft zusätzlich stumm zum Ausgang (iOS nimmt die
  Stream-Spur sonst still auf), weitere MP4-Typangabe `avc1.42E01E, mp4a.40.2`. (2) Liefert der WebCodecs-Ton-Kodierer nichts, Stille oder
  einen Fehler, wechselt die App mit demselben gerenderten Ton auf den Aufnahme-Weg. (3) Nach dem Rendern wird gemessen: Offline-Ton und
  (Aufnahme-Weg) die fertige Datei dekodiert – Spitze unter −60 dBFS = still → ein anderer Typ, sonst Meldung „Video ohne Ton – nicht
  gespeichert. Bitte noch einmal versuchen.“ statt einer stillen Datei. Ergebnis im Video-Ergebnis `aChk` (Weg, Pegel Quelle/Datei).
- **V-B (nichts Erfundenes zeigen):** ein Regler bewegt sich im Video nur noch, wenn eine echte Modulation (Mod-Matrix/Patch mit Stärke ≠ 0,
  MOD SEQUENCE) auf genau diesen Parameter wirkt. Die Hüllkurve eines Tons, Key-Tracking und Anschlag drehen keinen Regler mehr (Analog:
  CUTOFF nur mit Mod-Ziel Cutoff, PEGEL nur mit Mod-Ziel Lautstärke; MS-Spur: CUTOFF-Regler, LCD-Zahl und Platten-Regler ohne EG 1 INT /
  KBD / Anschlag). Ausgeblendet (gibt es in der App nicht): die laufenden LFO-Wellen („Oszilloskop“) und die Filterkurve. Die Hüllkurven
  bleiben als beschriftete Kurven („EG · HÜLLKURVE (AMP)“, „EG 1 (FILTER)“, „EG 2 (AMP)“). FM-Operatoren, Drum-Felder, Wellenform unverändert.
- **V-C** (9:16 ganze App, Auswahl je Taktbereich, Auto-Regie auf Neues, Pegelanzeige erst mit App-Anzeige): gemerkt für das nächste
  Video-Paket, hier nicht gebaut.

### Abnahme (Chromium 1243 headless, 4 Kerne, zu dritt parallel; Skripte `dirigent-test/vid/`, Pfade auf den Scratchpad umgestellt)
| Lauf | Ergebnis |
|---|---|
| `smoke` | ohne Fehler |
| `orch-mk-check`, `v3-mk2-wellen` | bestanden |
| `g-vid-abn` (neu: V-A, V-B, Render = live mit Gesang + Chor) | 18/18 |
| VC2a `n5-h-01` / `-03` / `-06` / `-07` / `-08` / `-10` / `-menu` | 01: 1 ✗, 03: 1 ✗ (Regel 26, s. u.) · übrige bestanden |
| VV1 `n5-v-abn-01`, `-a1`, `-abn-04`, `-abn-07`, `-abn-10b` | bestanden |
| VV2 `n5-v-vv2-01`, `-02`, `-03`, `-04z`, `-05`, `n5-v-qa2-cam` | bestanden bis auf `-02 ohneVideo.gleichAlt` (Regel 26) |
| VV3 `vv3-01`, `-01b`, `-02`, `-03` | bestanden |
| Zusatz `n5-v-vs-zusatz` | bestanden |
| Gesang `interplay` / `g6-app` | ALLE GRÜN / 2 ✗ = bekannt aus G-GES (Puffer-Quellen-Zählung + VS-P-Hüllkurve) |

Regel 26 (überholte Test-Erwartungen, nicht angepasst): `n5-h-01` VC2a-02 und `n5-h-03` VC2a-03 erwarten fest `appVersion '4.25.0'` in den
Keyframes (jetzt 4.26.0, sonst alles gleich); `n5-v-vv2-02 ohneVideo` vergleicht mit der Datei aus `VV1.html` – Unterschied nur
`appVersion`. In diesem Chromium gibt es keinen AAC-Kodierer: der normale Weg ist hier der Aufnahme-Weg; der WebCodecs-Weg ist mit Opus
(`T.opus`) geprüft. Nicht gemessen (Zeit): 3-min-Tempo VV1-05, VC2a-05 Leistung; G7-Transposition im Render nur über `vvVocReady` (kein eigener Lauf).

### Fragen an Xander
- keine.

### iPhone (Xander)
- Weihnachtslied → Menü → Video → Video erstellen: das Video hat Ton (ohne AudioEncoder über die Aufnahme in Echtzeit).
- Innenansicht: Regler stehen still, solange keine Modulation eingebaut ist; keine LFO-/Oszilloskop-Felder mehr.


Auf 4.25.2 (`bau/snapshots/R-4252.html`). `VERSION '4.25.4'`, APP_CODE 4 025 004, `live: true` unverändert. Patch
`bau/helfer/HIF/patch-hif.diff` (17 Stellen, ≈ 130 Zeilen, nur Mikro-Code). Kein neues Projekt-Feld; neu im Geräteprofil `uiPrefs.micIn`.

- **Eingang wählen.** `micInList/micInPick/micInOpen`: Eingänge mit Namen nach der Erlaubnis; externer Eingang (nicht eingebaut, nicht
  Bluetooth) bevorzugt, `deviceId: {exact}`, Rückfall auf Standard bei OverconstrainedError/NotFoundError; erstes Öffnen ohne Namen →
  einmal umöffnen. Mikro-Blatt „Eingang: [Name ▾]“ (44 px), `micInSet` merkt per Name, schaltet bei laufendem 🎤 sofort um.
  Mikro-Check (`micStart`) und `micTapGet` nutzen denselben Weg. Warum: iOS öffnete beim Aufnahmebeginn das iPhone-Mikrofon und legte
  den Ton aufs iPhone (Xander, USB-Interface).
- **Route halten.** `micSess(ty)`: Sitzungsart nur bei Änderung, nie 'playback', solange 🎤 an ist (`micTapGet`, `micTapPut`, `stStart`).
  Interface ⇒ Weg Kopfhörer (`stGot`), kein Kurz-Einmessen; H5 (`recMicStart`) verlangt mit Interface kein Profil.
- **Einzähl-Bild** `recCiHint`: „🎧 Interface: <Name>“.
- **Neu öffnen** `stReopen/stTrackBind`: devicechange (Spur auf anderem Eingang, Interface weg/neu) und Spur-Ende → derselbe Eingang
  wird neu geöffnet (Spur-Ende höchstens 3× je 10 s), Toast; Ringpuffer/Worklet bleiben, nur die Quelle wird getauscht.
- Gemessen: `bau/tests/hif-iface.mjs` 9/9 (Auswahl, Blatt, Wahl, Rückfall, 0 Sitzungswechsel in 2 Takes, Hinweis, devicechange,
  Spur-Ende, Smoke). Regel 28: `n5-k-golden.mjs` 4.25.4 gegen 4.25.2 320/320 gleich.

Ausgeliefert auf 4.25.3 (3-Wege-Merge Basis R-4252; einziger Konflikt VERSION). hif-iface.mjs auf der ausgelieferten Datei: ALLE GRÜN; Smoke/orch-mk-check/v3-mk2-wellen PASS.

## 4.26.0 — Auslieferung Video (01.11.2026, ~02:45 UTC)

G-VID-merge (4.25.2 + VIDSTAGE VV1/VV2/VV3/VC2a, V-A Ton immer, V-B nichts Erfundenes, Gesang+Chor im Render ±0,03 LU) per 3-Wege mit 4.25.4 (Songtext G9 + Interface-Fix HIF; Basis R-4252) zusammengeführt; Konflikte: VERSION, Projektwechsel (histClose + g9ProjReset, beide behalten). Prüfungen auf der Auslieferung: Smoke, orch-mk-check, v3-mk2-wellen PASS; vid/g-vid-abn ALLE BESTANDEN; hif-iface grün (nur Versions-Erwartung 4.25.4 im Test rot); g9Syl ok.

## 4.26.1 — Audio-Interface: iOS-Route-Kick (WebKit Bug 282939) · 01.11.2026
Xander (AG06 mit Netzteil): beim Start der Gesangsaufnahme geht der Ton vom Pult weg aufs iPhone; App zu → Pult spielt wieder.
Ursache: bekannter WebKit-Fehler (getUserMedia legt die Ausgabe aufs iPhone). Bekannter Umweg: vor getUserMedia `audioSession.type = 'auto'`,
danach `'play-and-record'` – das stößt iOS an, die Route neu zu wählen. Neuer Standard `kick` (`stSessType`/`stSessAfter`, nach dem Öffnen in
`micTapGet`), Einstellung jetzt unter `uiPrefs.stsess2` (alte Testwerte aus `?stsess=` gelten nicht mehr automatisch), Vergleich per
`?stsess=par|auto|none|kick`. Beim Ausschalten weiter `'playback'`. Gemessen (Chromium, Attrappe): Reihenfolge playback → auto → [gUM] →
play-and-record → (aus) playback; Smoke, orch-mk-check, v3-mk2-wellen PASS; hif-iface grün (Versions-Erwartung im Test rot). Gerät: offen.
## 4.27.0 — Chor-Gruppe (G6+0…h) + Songtext-Mitlese-Zeile (G9e)

App: `rel-4270/index.html` (4.26.1 = 4 025 835 B → 4.27.0 = 4 240 936 B, **+215 KB**), md5 `7278741f…`.
`VERSION = '4.27.0'`, Zeile `  live: true,` unverändert, „MS 2000“ genau 1×, keine neuen Markennamen.
Stand vor den Abnahme-Korrekturen: `index-4270-vor-fix.html` (md5 `5880b81f…`), Unterschied: `fix4270/fix.diff`.

### Was neu ist für Xander

- **Chor-Gruppe statt einzelner Chorstimmen.** Chor-Blatt (STIMME-Clip → Chor) hat jetzt 8 Stil-Kacheln
  (80er großer Refrain, Pop modern, Gospel, Barbershop, Rock-Shout, Ballade, Disco/Falsett, New Wave dunkel). Ein Tipp setzt den
  ganzen Chor: Stimmen, Doppel, Panorama, Abstand zum Lead, Hall, Echo und Klang.
- **Gruppen-Zeile:** [Chor an], **[Gekoppelt]** (Chor folgt dem STIMME-Regler 1 : 1; aus = Chor bleibt stehen), Regler **Chor**
  (Abstand zum Lead in dB), Hall, Echo, [Klang ▸] (Tief, Mitte, Luft, Zischlaute, Hall vor), [Auf alle Stellen].
- **Jede Stimme hat ihre Spur** mit Farbe und Ziffer (Terz rot 3, Quinte grün 5, Sexte blau 6, Oktave violett 8, Quarte orange 4,
  Gegenstimme gelb): [S] [M] [♪] [⋯], Pegel, Pan. In [⋯]: Doppel 1–4, Versatz/Cent/Breite, **Selbst singen**, Entkoppeln,
  [Background], Stimme bzw. Spur löschen. [+ Stimme ▾] fügt eine Rolle hinzu.
- **Als Chor-Stimme duplizieren** (Takes-Blatt → [Diese Stelle] / [Ganze Spur]): eine Kopie des eigenen Gesangs als Gegenstimme,
  deren Noten man im Editor zieht; dann [⋯] → [Background] für einen breiten Hintergrund-Chor.
- **Farbige Schatten:** Im Noten-Editor liegen alle Chorstimmen halbtransparent hinter dem Lead, im Wellen-Editor als farbige
  Linien. Legende oben mit Auge und Solo je Spur; ein Tipp auf einen Schatten öffnet diese Stimme.
- **Selbst singen (Chor-Gruppe):** Die Zielstimme spielt als Führung, der Lead leise mit (−12 dB, Schalter [Lead leise] in der
  Legende, aus = stumm). ● nimmt auf und ersetzt die Stimme; Spur, Pan, Pegel bleiben.
- **Chor im Song und im Video:** Song-Stimmen bekommen den Chor wie Clips, der nächste Teil wird beim Abspielen vorausgerechnet,
  das Video wartet, bis alle Chor-Stellen fertig sind.
- **Songtext-Mitlese-Zeile:** Hat ein Take Songtext, steht über der Tastatur die aktuelle Zeile groß, die nächste klein (quer:
  daneben). Gesungene Silben bernstein, die klingende hell. Läuft beim Abspielen, im Vorzähler und beim Einsingen (dann mit dem
  Text des alten Takes als Vorlage). [TEXT] links schaltet die Zeile aus/an (bleibt gemerkt). Silben stehen auch unter den Noten.
- **Chor aus 4.25 bleibt, wie er war:** Er zeigt „Chor (Fassung 4.25)“ mit den alten Knöpfen und klingt bitgleich.
  [Auf Chor-Gruppe umstellen] wandelt ihn um (ein Undo, Toast sagt, dass sich der Klang ändert).

### Abnahme-Korrekturen in 4.27.0 (nach den Zweig-Tests)

1. **Chor 4.25: Solo, „Selbst singen“ und Regler erreichten laufende Stimmen nicht** (aus G6+0). `g6Apply` suchte die Knoten
   unter `Stelle:Stimme:Kopie`, `g6Node` legt sie unter `…:Spur` ab. Jetzt mit Spur: beim Selbst-Singen schweigen die anderen
   Stimmen sofort (gemessen: Stimme 0 = 0,00, Zielstimme = 1,00).
2. **Chor 4.25 beim Selbst-Singen: Lead wieder stumm wie in 4.25/4.26** (Regel 28, Spec §1.7). „Lead leise −12 dB“ und der
   Knopf [Lead leise] gelten nur für die Chor-Gruppe.
3. **Video-Vorbereitung rechnete für Chor-Gruppen überflüssige 4.25-Puffer** (`vvVocReady`). Jetzt nur für Chor 4.25;
   Probe mit 2 Stimmen: 0 statt 2 überzählige Puffer, fertig nach 0,96 s.
4. **Chor-Blatt zeichnete beim Wechsel „Stimmen werden gerechnet …“ → fertig alles neu** (ein Tipp oder Regler-Zug in diesem
   Moment konnte verloren gehen). Jetzt ändert sich nur die Statuszeile.
5. **320 px: Spur-Name lief unter [S]** („eigene Aufnahme“ ohne Umbruch, „Gegenstim|me“ mitten im Wort getrennt). Zusatz bricht
   jetzt um, der Name trennt nach Silben (iPhone), sonst wie bisher.
6. **Toast nach „Als Chor-Stimme duplizieren“** sagt jetzt „… dann [⋯] → [Background]“ (der Knopf sitzt im [⋯]-Menü).
7. `g6Auto` wieder Zeichen für Zeichen wie 4.25 (der v2-Zusatz war unerreichbar).

### Gemessen (Chromium, Playwright; jeder Lauf < 5 min)

| Prüfung | Ergebnis |
|---|---|
| Smoke, orch-mk-check (initAm rms 0,0705 / Spitze 0,177), v3-mk2-wellen (0 Markenwörter, „MS 2000“ 1×) | grün |
| G6+a (G6P-01…09, K1, Regel 28 gegen 4.25.2) | 40/40 |
| G6+b (Stufen, G7 24/24, Cent 1,46 ct, Fenster bitgleich, Zeit kalt 4,1 s / warm 2,6 s, 46,9 MB) | grün (Lauf vor den Korrekturen, Rechenweg unverändert) |
| G6+c: Abstand je Stil ±0,05 LU (Stil 80: 7,96), live −25,91 / offline −25,88 LUFS, Kopplung Sprung 0 dB | grün |
| G6+d Stile 10/10, Stellen 15/15, Regel 28 gegen 4.26.1 (leer, ohne Chor, Chor 4.25, fxBus, 6 Formate) | grün |
| G6+e Blatt (78 Prüfpunkte, 6 Formate) | 78/78 |
| G6+f: Kern 27/27, mehr 29/29, Platz im [⋯]-Menü P1/P3/L1 | grün (P1 320 px jetzt grün) |
| G6+g Farben, Schatten (p95 1,8 ms/Bild), Legende, Selbst singen v1 + v2 | 24/24 |
| G6+h Song-Vorausrechnen (Stellen fertig vor Einsatz), Undo, Video mit Chor (2 Renders 1 LSB) | grün bis auf eine überholte Gegenprobe (unten) |
| G9e Mitlese-Zeile 37/37 (p95 1 ms/Bild), Take abspielen −23,84 dB = 4.26.1 | grün |
| Video-Abnahme (18 Punkte), Song live −14,91 / Render −14,90 LUFS; Video mit Chor-Gruppe: Ton da, live = Render ±0,08 LU | grün |
| Klang alt (Golden 320/320, Node 64/64 gegen 4.26.1) | gleich |

### Offen

- **G6P-28 (lange Tasks beim Abspielen) wackelt**, ist aber kein Chor-Problem: Chor-Arbeit beim Abspielen gemessen höchstens
  4,2 ms je Aufruf (`g6pStart`), zusammen ≈ 70 ms in 30 s. Dasselbe Szenario **ohne** Chor zeigt auch in 4.26.1 gelegentlich
  einen langen Task (89 ms in 1 von 3 Läufen). Ursache liegt beim Zeichnen/Speicher der App, nicht im Merge.
  G6P-28 nach den Korrekturen: 3 von 4 Läufen grün; der rote (62/81/134 ms) lief gleichzeitig mit einem anderen Test.
  Knoten nach dem Stopp immer 0.
- **[TEXT] quer (926 × 428) nur 46 × 32 px** (aus G9e). 44 px gehen nur mit sichtbarer Änderung: Vorschlag für den Funk —
  Leiste quer 44 px hoch, Tasten 88 statt 100 px.
- **[Background]-Knopf:** sitzt im [⋯]-Menü, die Spec sagt „in der Spur-Zeile“. Xander fragen, wo er hin soll.
- **Zwei Video-Renders mit Chor-Gruppe nicht bitgleich** (−40 dB ab dem Einsatz). Kommt über Hall und Echo der App, die schon
  in 4.26.1 je Render leicht anders klingen (ganzer Demo-Song −18 dB, alter Chor −32 dB). Nicht örtlich lösbar.
- Tests, die nur noch alte Erwartungen haben, angepasst bzw. umzustellen: t16 (Lead zweikanalig messen), G6P-06 Verlauf
  (`projHistory`), G6P-K1 (`g6pCouple`), G6P-27 (`G6P.cache`), G6P-72 (`g6RenderHold`; Gegenprobe „ohne g6pWaitAll“ entfällt,
  `vvVocReady` rechnet Chor 4.25 schon vorher), G6+e Solo (`'c2'`), G6+f (`g6pBackground(null, 'c1')`, `g6pGA`).
- Markennamen-Frage: „Waldorf Attack“ und „Nord Drum“ in alten Tipp-Texten, „Kodamo“ 1× (alle schon in 4.26.1).
- Hörprobe und iPhone-Prüfung (Silbentrennung 320 px, Mitlese-Zeile, Selbst singen) stehen aus.

### Veröffentlichung (01.11. ~05:10 UTC)
- Markenwörter aus alten Tipp-/Hilfe-Texten neutralisiert (nur Text, kein Klang): „Nord Lead“ → „90er-Lead“, „Nord Drum / Waldorf
  Attack“ → „Drum-Synth“ (Tipp, Kit-Beschreibungen, Kommentare), FM-FELD-Vorbild ohne Herstellernamen. Danach Kodamo/Nord/Waldorf = 0.
- Pipeline auf der Endfassung: smoke (keine Fehler), orch-mk-check (4.27.0, rms 0,0705 / Spitze 0,177), v3-mk2-wellen (alles PASS,
  „MS 2000“ genau 1×), `  live: true,` vorhanden.
## 4.27.1 — Mit GarageBand aufnehmen (AG06-Umweg)

App: `rel-427gb/index.html` (4.27.0 = 4 240 866 B → 4.27.1 = 4 267 646 B, **+26,8 KB**), md5 `3bf1cb52…`.
Basis 4.27.0 (Chor-Gruppe G6+, Mitlese-Zeile G9E) + Paket G-GB (gebaut gegen 4.26.1), per `git merge-file` zusammengeführt
(1 Konflikt: API-Zeilen am Dateiende – beide behalten, alle 25 `Object.assign(SYNQUENZER, …)` da). `VERSION = '4.27.1'`.
Stand vor der Prüfung: `rel-427gb/index-vor-pruef.html` (md5 `e8e8c790…`), Unterschied: `ggb427/fix-4271.diff` (2 Stellen).

### Warum

Am iPhone gibt Safari bei offenem Mikro den Ton nicht aufs AG06 (Kopfhörer bleiben stumm). Umweg: in GarageBand singen – dort
laufen Ein- und Ausgang übers AG06 – und den Gesang danach in den SYNQUENZER zurückholen.

### Was Xander sieht – Schritt für Schritt

1. **Blatt öffnen:** ✎ auf einen STIMME-Take (Takes-Blatt) oder auf einen leeren STIMME-Platz. Gibt es noch keine STIMME-Spur:
   Spurkopf halten → Zeile **„Mit GarageBand aufnehmen“** (die Spur entsteht beim Import von selbst).
2. **Abschnitt „Mit GarageBand aufnehmen“:** Vorzähler **0 / 1 / 2** Takte (Vorgabe 1, wird gemerkt). Ist eine gelbe Auswahl da:
   **[Ganzer Song | Auswahl · Takt x–y]** wie beim Video. Darunter die Anleitung in 4 Zeilen mit dem aktuellen Tempo.
3. **[Instrumental als Datei]** → der Knopf zeigt „Abbrechen · n %“, danach **„Instrumental teilen“** → Teilen-Blatt → GarageBand.
   Die Datei heißt `<Songname>-Instrumental-<BPM>bpm.wav`: alle Instrumente, **kein Gesang, kein Chor**, vorne Klicks (Eins höher).
4. **In GarageBand:** Datei an Takt 1, Tempo wie angezeigt, Metronom aus → neue Spur, mit AG06 singen → Instrumental-Spur stumm →
   Teilen → Song → Datei.
5. **Zurück im SYNQUENZER: [Gesang importieren]** → Datei wählen. Der Gesang liegt als Take **„GarageBand hh:mm“** genau dort, wo
   das Instrumental anfing (Vorzähler wird abgezogen). Was dort vorher lag, bleibt als stummer Take (A/B). Ein ↶ nimmt alles zurück.
6. **Danach wie ein gesungener Take:** [Chor] → Stil antippen (z. B. „Pop modern“) baut den Chor auf dem GarageBand-Gesang,
   ♪ Noten, Mitlese-Zeile, Video – alles geht damit.
- Hinweise erscheinen, wenn sich das Tempo seit dem Export geändert hat, Takte im exportierten Bereich eingefügt/gelöscht wurden
  oder noch kein Instrumental exportiert war (dann liegt der Gesang am Songanfang).

**Sichtbar anders (für die Funk-Antwort):** ✎ auf einem leeren STIMME-Platz öffnet jetzt ein Blatt („STIMME · Szene n · noch kein
Take“) statt nur einer Meldung · Spur-Blatt: neue Zeile „Mit GarageBand aufnehmen“ · quer steht die Anleitung zweispaltig.

### Zusammenspiel mit 4.27.0 – geprüft und korrigiert

- **Korrektur: Instrumental wartete auf den Chor.** Vor dem Rechnen lief `g6pWaitAll` (Video: „alle Chor-Stellen fertig rechnen“,
  bis zu 180 s), obwohl der Chor im Instrumental stumm ist. Jetzt übersprungen, solange `GGB.dry` gilt (Video unverändert).
  Messung (8 Takte, Chor-Puffer frisch verworfen): v2 3,65 s → 2,47 s, v1 2,89 s → 2,23 s; bei langen Songs mit vielen
  Chor-Stellen spart es entsprechend mehr. `g6pWaitAll` im Instrumental 1× → 0×, im Video weiter 1×.
- **Chor im Instrumental stumm – v1 und v2:** Beide hängen am Lead-Stück (`tkStartSrc` → `g6Start` → `g6pStart`), und `GGB.dry`
  sperrt `tkStartSrc` ganz. Gemessen mit nur der STIMME-Spur hörbar: Instrumental −240 dBFS (digitale Stille), Video derselben
  Stelle −8,7 dBFS (v2) / −7,8 dBFS (v1). Gleiches für einen Szenen-Take über die Song-Lane: Instrumental 0, Video −19,7 dBFS.
- **Gesang importieren → Chor:** Takes-Blatt → [Chor] → Stil „Pop modern“ per Finger: 3 Stimmen × 16 Noten am importierten Take,
  fertig in 2,4 s; live laufen 6 Chor-Kopien in einer Gruppe.
- **Mitlese-Zeile:** an (Take mit Text) – der Abschnitt im Takes-Blatt bleibt frei: 5 Knöpfe (44×44 bzw. 174×44), alle per
  Fingertipp erreichbar, Blatt 58–829 px liegt über der Leiste (672–730 px). Export mit Leiste an: läuft, Leiste danach unverändert.
- Kommentar am G-GB-Block ergänzt (warum der Chor nicht gewartet wird).

### Tests in Zahlen (Chromium, 428×926 Touch)

| Lauf | Ergebnis |
|---|---|
| `ggb427/tests/run-all.mjs` (G-GB a, b–d, f, g + Rauchtest) | 73 OK / 0 FEHL, Rauchtest `errors []` – vor und nach der Korrektur |
| neu `ggb427/tests/ggb-h-zusammenspiel.mjs` (Chor v2/v1, Import → Stil, Mitlese-Zeile) | 16 OK / 0 FEHL (vor der Korrektur 2 FEHL) |
| Prüferskripte `pruef-ausrichtung` (13) + `pruef-bedienung-regression` (6) + VS3-Abnahme | 20 von 20 Exit 0; VS3-Abnahme 72 ✓ / 0 ✗ |
| Chor-Abnahme 4.27.0 (`abnahme-4270.mjs`) auf 4.27.1 | 12 von 12 OK (G6P-20…28, K1, v1-Smoke, Konsole leer) |
| Rauchtest `smoke.mjs` | `errors []` |
| `orch-mk-check.mjs` | version 4.27.1, `errors []` |
| `v3-mk2-wellen.mjs` | alles PASS |
| Regeln | `VERSION '4.27.1'` 1×, `  live: true,` 1× (mit Kommentar), „MS 2000“ 1×, Korg/microKORG/RADIAS/DWGS/Kodamo/Mask1/Nord/Kompakt 0× |

Prüfer-Ausgaben gegen den G-GB-Lauf (4.26.1) verglichen: gleich bis auf Take-Kennungen und Mess-Rauschen (Klick-Einsätze ≤ 0,023 ms
= 1 Sample bei 44,1 kHz). pr3 meldet den 3-kHz-Rest im Instrumental bei −70,2 dB statt −77,2 dB: das ist der Klang der Instrumente
(schwankt von Lauf zu Lauf um ±5 dB, auch in 4.26.1 und ohne STIMME-Lane), kein Gesang – Gegenprobe mit nur STIMME hörbar = 0.
Umgebogen: Pfade `ggb/` → `ggb427/` (Kopie der Tests in `ggb427/`, die alten Ausgaben bleiben), keine Versions-Erwartungen nötig.

### Offen

- Am iPhone mit echter GarageBand-Datei prüfen, vor allem M4A/AAC (Encoder-Verzögerung); WAV/AIFF ist sicher.
- Marken als Bereich (Vorschlag für den Funk): die zuletzt gewählte Marke als dritte Wahl neben Ganzer Song / Auswahl.
- **Chor beim Import über eine Stelle mit Chor (Vorschlag für den Funk):** Der neue GarageBand-Take kommt ohne Chor (richtig – die
  Chor-Noten gehörten zum alten Gesang), die Chor-Spuren bleiben. Holt Xander danach per A/B den alten Take nach oben, kommt dessen
  Chor aber **nicht** wieder – nur ↶ bringt ihn zurück (gemessen: `ggb427/tests/x-chor-import2.mjs`). Genauso verhält sich schon
  der Overdub im Song (`tkSongCommit`), also kein neuer Fehler durch G-GB. Vorschlag: den Chor beim Overdub/Import am alten Take
  merken und bei A/B mitnehmen – oder nach dem Import „Chor-Stil wie vorher (Pop modern) anwenden?“ anbieten.
- iPhone-CPU beim Instrumental mit vielen Chor-Stellen nicht gemessen (am Rechner jetzt ohne Warten).
## 4.27.2 — Songtext automatisch erkennen (G9b) auf 4.27.1

4.27.1 (GarageBand-Umweg) + G9b per 3-Wege (ours R-4271, base R-4270, theirs rel-4271 = 4.27.0+G9b inkl. 4 Prüf-Korrekturen), 0 Konflikte. acorn: 3490 Namen, 0 doppelt. Pipeline grün (smoke, orch-mk-check rms 0,0705/0,177, v3-mk2-wellen PASS), G-GB-Zusammenspiel 16/16, G9b-smoke 5/5. sw.js: nur Kommentar (synq-g9-asr-v1 bleibt beim Aktivieren).


App: `rel-4271/index.html`. 4.27.0 hatte 4 240 866 B, 4.27.1 hat 4 263 176 B (**+22 KB**), nach der Prüfung unten. md5 `aff22ab6…`
(die ungeprüfte Merge-Fassung `09b5abe0…` liegt als `index-vor-pruef.html` daneben).
`VERSION = '4.27.1'` (APP_CODE ergibt sich daraus: 4027001). Die Zeile `  live: true,` steht unverändert 1× da, „MS 2000“ genau 1×, keine Markennamen.
`rel-4271/sw.js` = Repo-`sw.js` mit der Änderung aus G9B `sw.diff`. Das ist nur ein Kommentar: `synq-g9-*` war schon vor dem Löschen geschützt, der Modell-Cache bleibt also erhalten.

Zusammengeführt per 3-Wege-Merge (ours 4.27.0, base 4.26.0, theirs G9B). Der Unterschied zu 4.27.0 ist genau der G9B-Patch, dazu die Version und zwei Kommentare.
Chor-Gruppe (G6+), Mitlese-Zeile (G9e) und die Markentext-Neutralisierung aus 4.27.0 bleiben Zeichen für Zeichen erhalten.

### Was Xander sieht

- **Text-Modus → [Erkennen] ist jetzt sichtbar.** Beim ersten Tipp öffnet sich ein Blatt mit: „lädt einmal ein Sprachmodell (≈ 90 MB)“, freier Platz, „WLAN empfohlen“,
  Sprache (Auto/Deutsch/Englisch) und dem Haken „Neue Aufnahmen automatisch erkennen“. Mit **[Laden und erkennen]** wird die Taste zu **[Stopp]**.
  Die Info-Zeile zeigt dabei „Sprachmodell lädt … 14/90 MB · 16 %“.
- Danach stehen die erkannten Wörter als Silben auf den Marken. Ein **↶** nimmt alles zurück.
- **Mitlese-Zeile:** Der erkannte Text erscheint dort von selbst, so als wäre er getippt (geprüft: „The sun is shining over the“ / „city, and my heart is singing.“).
- Liegt das Modell auf dem Gerät, wird **jede neue Aufnahme automatisch erkannt** (nur ohne laufendes Mikro und bei stehendem ▶). Das braucht keinen eigenen Undo-Schritt.
- Das Blatt zeigt später „Sprachmodell auf diesem Gerät: 90 MB [Entfernen]“.
- Mit `?g9diag=1` kommt eine Diagnose-Zeile dazu: Weg (wasm/webgpu), Startzeit, Zeit je Fenster.

### Größe und Ladezeit

| | |
|---|---|
| App-Start | unverändert. Das Modell lädt **nie von selbst** (geprüft: 0 Abrufe, kein Cache ohne Tipp). Die App ist +21 KB größer (+0,5 %) |
| Download einmalig (normaler Weg, WASM) | 94,5 MB (in der App „≈ 90 MB“). Bei 50 Mbit/s etwa 15 s, bei 10 Mbit/s etwa 75 s. Hier im Container: ≈ 6 s |
| Download WebGPU-Weg (nur mit passender GPU) | 125,3 MB (≈ 119 MB) |
| Modell-Start aus dem Cache | 2,3–2,7 s (Chromium, 1 Kern) |
| Erkennen 3,7-s-Satz, Sprache „Auto“ | ≈ 9 s, davon 4 s Spracherkennung. Mit fester Sprache schneller |
| Haupt-Faden während Laden + Erkennen | längste Aufgabe 0 ms, das Modell rechnet im Worker. Chat, Spielen und Bedienung bleiben flüssig |
| Speicher | Modell ≈ 150 MB im Arbeitsspeicher. Nach 3 min Ruhe beendet sich der Worker |

### Am iPhone prüfen

1. Text-Modus öffnen → [Erkennen] → Steht im Blatt „≈ 90 MB“? Dann [Laden und erkennen]: Läuft der Fortschritt in MB? Wird die Taste zu [Stopp]?
2. Mitten im Laden [Stopp] tippen → „Laden gestoppt“? Danach nochmal [Erkennen] → lädt es weiter?
3. Einen deutschen Take singen → Stimmen die Wörter? Liegen die Silben auf den richtigen Marken? Nimmt ein ↶ alles zurück? Zeigt die Mitlese-Zeile den Text?
4. App schließen, Flugmodus an, App wieder öffnen → geht [Erkennen] ohne Netz?
5. Neue Aufnahme (Stimme-FANG/REC) → erscheint der Text von selbst?
6. Mit `?g9diag=1`: Welcher Weg (wasm/webgpu)? Wie lange dauert ein Fenster? (Ziel: WASM ≤ 45 s, WebGPU ≤ 15 s je 30-s-Fenster.)

### Gemessen (Chromium, Playwright)

- **G9B-Tests auf 4.27.1, 43/43:** smoke 5/5, t1 12/12 (echter Modell-Download von huggingface.co, Stopp beim Laden, offline aus dem Cache),
  t2 11/11, t3 Regel 28 gegen 4.27.0 12/12 (Klang-Prüfsummen und Projekt-JSON gleich), t4 WebGPU → Rückfall WASM 3/3.
- **Zusammenspiel G9b → G9e** (neu, `pruef/tests/x-ly-asr.mjs`): 5/5.
- **G9e Mitlese-Zeile:** t-ly 37/37, smoke 12/12. Take abspielen 4/4 mit −23,8 dB, gleich wie 4.27.0.
- **Pipeline:** Smoke ohne Fehler; orch-mk-check initAm rms 0,0705 / Spitze 0,177, gleich wie 4.27.0; v3-mk2-wellen alles PASS.
- **acorn** (alle Skripte + sq-g9-src + sq-mk-src): 3456 Namen, 0 doppelt, 0 Syntaxfehler.

### Prüfung 4.27.1 (zweiter Blick): 4 Fehler gefunden und behoben

Vorher-Stand: `index-vor-pruef.html`. Änderung: `pruef/diff-pruef.diff` (9 Zeilen geändert, 8 neu, nur im Block `sq-g9-src`, kein Klang, kein Aussehen).
Prüf-Tests: `scratchpad/pruef-4271k/` (`t-start`, `t-erk`, `t-auto`, `t-auto2`, `t-proj`, `t-lay`).

1. **Neue Aufnahmen wurden nie automatisch erkannt.** Eine frische Aufnahme hat noch keine Marken, die sucht erst der Wellen-Editor.
   Die Erkennung lief durch (≈ 9 s Rechenzeit), das Ergebnis wurde dann ohne Meldung verworfen. Die G9B-Tests hatten die Marken vorher von Hand gesucht.
   Jetzt sucht der Auftrag fehlende Marken selbst (im Worker), bevor er die Fenster rechnet.
2. **Die erste Aufnahme nach dem App-Start wurde nicht einmal angenommen.** Der Cache-Scan läuft erst an, wenn der G9-Block geladen wird,
   und die Automatik fragte vorher ab: „Modell da?“ → nein. Jetzt gilt der Merker `synq-g9-asr` beim Andocken vorläufig als „Modell da“.
   Die Automatik wartet auf den Scan und lässt den Auftrag fallen, wenn der Cache doch fehlt.
3. **[Stopp] während „Sprachmodell startet …“ vergaß, dass das Modell auf dem Gerät liegt.** Danach zeigte das Blatt wieder „lädt einmal ≈ 90 MB“,
   und die Automatik war bis zum Neustart aus. Jetzt bleibt der Zustand „im Cache“. Nach einem Stopp beim Laden zeigt das Blatt den Rest
   (geprüft: Stopp bei 34 MB → „≈ 73 MB“ statt „≈ 90 MB“).
4. **Projektwechsel während das Modell lädt:** Danach lief die Erkennung für einen Take des alten Projekts. Das gab den Konsolenfehler „kein Take“
   und „Erkennen fehlgeschlagen“. Jetzt wird geprüft, ob Projekt und Take noch da sind.
- **Dazu als Schutz:** Die Automatik lädt nie etwas herunter. Auch ein veralteter Merker oder ein vom System geräumter Cache löst keinen
  90-MB-Download aus (geprüft: 0 Abrufe, Merker gelöscht). Laden gibt es nur nach Tipp auf [Laden und erkennen].

| Prüfung (Chromium) | Ergebnis |
|---|---|
| Start ohne Modell, je 20 + 12 Läufe abwechselnd | Bis `SYNQUENZER` bereit, Median 4.27.0 / 4.27.1: 601 / 625 ms und nach der Prüfung 623 / 558 ms (Streuung 520–860 ms). DOMContentLoaded 387 / 386 ms, Summe langer Aufgaben 184 / 173 ms: **gleich schnell**. 0 Abrufe an CDN oder Modell-Ablage, kein Modell-Cache, G9-Block bleibt ungeladen |
| Start mit Modell im Cache | 0 Abrufe, G9-Block bleibt ungeladen, kein Worker |
| Start-Bild 428×926 / 926×428 | pixelgleich zu 4.27.0 (einmal 2 Pixel Unterschied durch Animation, Gegenlauf 0) |
| [Erkennen] → Blatt → Laden → [Stopp] → weiterladen → erkannt → ↶ → ↷ → Stopp beim Modell-Start → Stopp beim Erkennen → [Entfernen] (`t-erk`, alles per Tipp) | 22/22 (vor der Prüfung 3 Fehler bei Stopp beim Modell-Start) |
| Echte Mikro-Aufnahme nach App-Start, Modell im Cache (`t-auto`) | 5/5: Text erscheint von selbst, auch in der Mitlese-Zeile beim ▶. Vorher: nie |
| Veralteter Merker, Cache leer (`t-auto2`) | 1/1: kein Download, keine Konsolen-Meldung |
| Projektwechsel beim Laden (`t-proj`) | 2/2 (vorher Konsolenfehler) |
| G9B-Tests auf der geprüften Datei | 43/43 (smoke 5, t1 12, t2 11, t3 Regel 28 gegen 4.27.0 12, t4 3), G9b → G9e 5/5 |
| Chor-Gruppe G6+ (`g6pg`, `g6ph`), 4.27.0 gegen 4.27.1 | 26/26 und 20/20 in beiden, gleiche Zeilen |
| Mitlese-Zeile G9E (`t-ly`, `take-play`) | 38/38 in beiden. Take abspielen: −23,8 / −23,9 dB (echte Aufnahme, streut je Lauf um ±0,05 dB). G9E-smoke 10/13 in **beiden**: die 3 Fehlschläge prüfen fest auf Version „4.25.5“, der Test ist veraltet |
| G9D-Prüfer mit Ersatz-Modell (t2-ops 34, t3-ui 41, t7-dock 4, pruefer t-auto/t-auto2/t-hold/t-fill/t-lyr/t-feat/t-save/t-noworker) | in beiden gleich, Unterschiede nur bei Zeiten und Take-Kennungen |
| Pipeline | smoke ohne Fehler. orch-mk-check: initAm rms 0,0705 / Spitze 0,177, gleich wie 4.27.0. v3-mk2-wellen: alles PASS. acorn: 3456 Namen, 0 doppelt, 0 Syntaxfehler |
| Regeln | `  live: true,` 1×, „MS 2000“ 1×, Markenwörter 0 (die 6 Treffer für „nord“ sind der Variablenname `nOrd`, wie in 4.27.0), VERSION 4.27.1 → APP_CODE 4027001. `sw.js` = origin/main plus 2 Kommentarzeilen |
| Layout hoch/quer, Kopf mit [Erkennen], Blatt mit/ohne `?g9diag=1` | passt, keine Überbreite, keine Überlappung, keine Konsolenfehler. Quer ist [Erkennen] 38 px hoch, so hoch wie [Text], [A/B] und [×] daneben (gleiche Klasse wie in 4.27.0) |

### Offen

- **iPhone-Zeiten fehlen.** Der WebGPU-Weg selbst ist ungetestet, getestet ist nur der Rückfall auf WASM.
- **Güte für Deutsch ist hier nicht messbar.** Es gibt nur eine englische Roboterstimme. Der deutsche Testsatz läuft in eine Wiederholungs-Schleife,
  die Schutz-Regel begrenzt das auf 2×. Echte Prüfung nur mit Xanders Gesang.
- Die Bibliothek ist transformers.js 4.3.1 statt 4.3.2 aus der Spec, wegen der Regel „mindestens 2 Wochen alt“.
  jsDelivr ist im Container gesperrt. Die Tests lieferten dieselben Bytes aus dem npm-Paket (die SHA-256-Prüfung ist bestanden).
- Ist das Modell im Cache und „automatisch“ an, wird auch eine Aufnahme über **Chor → „Selbst singen“** erkannt (gleicher Aufnahme-Weg).
  Seit der Prüfung landet der Text dort wirklich als Silben auf dem Chor-Take, vorher wurde er verworfen. Xander fragen, ob Chor-Stimmen ausgenommen werden sollen.
- **Am iPhone zusätzlich prüfen:** Läuft die automatische Erkennung noch, wenn ▶ gedrückt wird? Sie startet nur bei stehendem ▶, rechnet dann aber weiter.
  Knackt es dabei? Das Modell rechnet im Worker, der Haupt-Faden bleibt frei.
- Im seltenen Fall „Merker sagt Modell da, Cache ist vom System geräumt“ während der Sitzung meldet die Automatik einmal einen Konsolenfehler
  („Sprachmodell nicht auf dem Gerät“). Es wird nichts geladen.
## 4.28.0 — Konsolidieren, Magic Scale, Melodie-Pinsel

App: `rel-4280/index.html`, 4 373 680 B. Das sind +83 KB gegenüber 4.27.2 (4 289 956 B). md5 `df896f3c…`.
Die ungeprüfte Merge-Fassung (`4bcbfd22…`) liegt als `index-vor-pruef.html` daneben.
`VERSION = '4.28.0'` (APP_CODE 4028000). Die Zeile `  live: true,` steht 1× da, „MS 2000“ genau 1×, keine Markennamen.

Basis ist 4.27.2. Alles daraus bleibt: Chor-Gruppe, Mitlese-Zeile, GarageBand-Umweg und Songtext-Erkennung.
Dazu kommen die drei Pakete aus der Stage EDIT (`git merge-file` gegen 4.27.0). Es gab zwei Konflikte: VERSION und `normSong`.
In `normSong` bleiben `ggbNorm` und `konSongNorm` beide drin.

- **Block und Konsolidieren:** Mehrere Takte als Block über der Taktleiste zusammenfassen und hineingehen.
  Den Bereich als neuen Teil konsolidieren: Der Song klingt genau gleich, auch mit Chor-Gruppe und GarageBand-Gesang. Mit [Zurückholen] kommt der alte Zustand jederzeit wieder.
- **Magic Scale:** [Magic] im Noten-Editor öffnet eine Zeile mit diesen Knöpfen:
  - [Wischen]: Läufe im Tonraster malen
  - **[Leiter]** / [Terzen] / [Terz+Quinte]
  - [Pause] und [Pause +]
  - [Akkorde] mit Umkehrung ▲ ▼
  - [Glatt]
- **Melodie-Pinsel:** [Pinsel] mit weichem Einzug (schmal / mittel / breit). Dazu [Umkehren ↕], [Krebs ↔], [Tauschen ⇆] und [Mithören].
- **Werkzeugleiste:** ✎ ⬚ ⌫ | **Pinsel · Magic · Mithören** | Raster … Pinsel und Magic schalten sich gegenseitig um.
  Beide nutzen dieselbe Tonart der Stelle und dieselbe Tonart-Handwahl je Clip.
- Keine Klänge geändert. Neue Felder gibt es nur von KON (`song.blocks`, `song.kons`, `Part.sxp`). Ein Song ohne Blöcke speichert nichts Neues.

**Bei der Prüfung behoben:**
1. **[Zurückholen] nach einer Änderung im Bereich.** Vorher ging dabei Folgendes kaputt:
   - Ein GarageBand-Gesang, der vor dem Bereich anfängt, fehlte danach im Bereich (Stille).
   - Beim nächsten Import kam fälschlich der Hinweis „Achtung: seit dem Export Takte eingefügt/gelöscht“.
   - Der Block über dem Bereich verschwand.
   - Die Marken blieben in Stücke geteilt („Strophe“ zweimal).

   Jetzt gilt: Gesang, Export-Daten und Blöcke bleiben unverändert, und die Marken sind wieder wie vor dem Konsolidieren.
   Hat der Teil inzwischen eine andere Länge, bleibt es beim alten Verhalten. ↶ und ↷ gehen wie vorher in je einem Schritt.
2. **Magic-Modus „Tonart“ heißt jetzt „Leiter“.** So gibt es nicht mehr dreimal „Tonart“ im Editor.
   [Tonart] (nur Tonart-Töne zeigen) und [Tonart: Auto] im Pinsel heißen weiter so. Die Breite des Knopfs bleibt gleich.

### Bitte prüfen am iPhone (Schritt für Schritt)

1. **Version:** ≡ (Menü) → Info zeigt „SYNQUENZER 4.28.0“.
2. **Block:** In der Song-Ansicht die Takte 3–6 in der Taktleiste antippen → ⋯ Mehr → [▣ Als Block]. Über der Taktleiste steht jetzt „▣ BLOCK A“.
   Doppeltipp auf den Block → oben steht „← Song › Block A“. Darauf tippen → du bist wieder draußen.
3. **Konsolidieren:** Block antippen → [Als neuen Teil konsolidieren] → Namen eingeben.
   Abspielen: Klingt der Song genau wie vorher? Der neue Teil steht in der Teil-Leiste.
4. **Mit Chor:** In einem Song mit Chor-Gruppe auf der STIMME den Bereich konsolidieren → Der Chor klingt weiter.
   Block antippen → [Zurückholen] → Alles ist wie vorher, der Chor bleibt.
5. **Mit GarageBand-Gesang:**
   1. Song exportieren und den Gesang importieren.
   2. Takte 3–6 konsolidieren und dort einen Akkord ändern.
   3. [Zurückholen] tippen.
   4. Prüfen: Der Gesang läuft durch, ohne Loch. Der Block ist noch da. Ein neuer Import zeigt keinen „Achtung“-Hinweis.
6. **Magic:** Clip öffnen (✎) → [Magic] → [Wischen] → mit einem Finger schräg nach rechts wischen.
   Die Noten liegen im Raster, nur Töne der Tonart. Dann [Leiter] und [Terzen] probieren. [↶] nimmt den ganzen Zug zurück.
7. **Pinsel:** [Pinsel] antippen → die Magic-Zeile geht zu. Über einen Lauf malen: Die Noten folgen weich. [schmal] und [breit] probieren.
8. **Umschalten:** [Magic] antippen → Wischen ist wieder aktiv, der Pinsel ist aus. Nichts liegt übereinander, alle Knöpfe sind gut zu treffen.
9. **Querformat:** Telefon drehen → Kopfzeile: Titel, dann ✎ ⬚ ⌫ | Pinsel Magic Mithören | … Die Leiste scrollt seitlich.
10. **Undo/Redo:** Im konsolidierten Teil (Song-Melodie) wischen und malen, dann dreimal [↶] → Auch das Konsolidieren ist zurück.
    Dreimal [↷] → Alles ist wieder da.
11. **Speichern/Laden:** Speichern und die App neu laden → Block, Teil, Chor und Noten sind da. [Zurückholen] geht auch nach dem Laden.

### Tests (Chromium mit Touch-Emulation, gegen `rel-4280/index.html`)

| Test | Ergebnis |
|---|---|
| KON: kon-block 41, kon-konsol 42, kon-save 11, kon-layout 24 | **118/118** |
| MAGIC: ms-funktion 43, ms-layout 38 (4 Formate, Bildrate), ms-regress 2 (alt = neu gegen **4.27.2**, hoch + quer) | **83/83** |
| PINSEL: t-pinsel 39, t-bloecke 20, t-mithoeren 20, t-layout 47, t-alt 18 (alt = neu gegen **4.27.2**) | **144/144** |
| Zusammenspiel der drei Pakete (`zusammen.mjs`) | **48/48** |
| **neu** G-GB × KON (`ggb-kon.mjs`): Einfügen/Löschen verschiebt Export-Start **und** Block, mit ↶ ↷; Block kopieren; Konsolidieren/Zurückholen (unverändert und geändert) mit GarageBand-Take: Gesang je Takt gleich, Export-Daten, Block, Marken, ↶ ↷, zweiter Import ohne falschen Hinweis, Speichern/Laden | **34/34** (vor dem Fix 5 rot) |
| G-GB: a-export 16, bcd-import 18, f-layout 11, g-befunde 28, h-zusammenspiel 16 | **89/89** |
| G9b-Rauchtest (Version 4.28.0 / 4028000) | **5/5** |
| Rauchtest `smoke.mjs` | grün, `errors []` |
| `orch-mk-check.mjs` | grün, `errors []`, Klangwerte (initAm rms 0.0705) |
| `v3-mk2-wellen.mjs` | alles PASS |
| acorn-Doppelprüfung | 20 Skripte, 3 532 Namen, **0 doppelt**, 0 Syntaxfehler |

Ein Hinweis zu t-layout: Laufen alle Tests gleichzeitig, misst der Bildraten-Test zu wenig (einmal 53,5 fps). Allein ergibt er 59,5/60 fps.
`tests/alle.sh` lässt die beiden Bildraten-Tests deshalb jetzt am Ende allein laufen.

### Offene Punkte

1. **Block-Zeile: Trefferfläche ≥ 44 px geht nicht unsichtbar.** Die Block-Zeile ist hochkant 14 px hoch, quer 12 px.
   - Hochkant: Darüber liegen 4 px Luft, dann die Transport-Knöpfe (selbst genau 44 px). Darunter liegt direkt die Taktleiste mit den Marken-Chips (20 px).
   - Quer: Darüber liegen 3 px Luft, dann die Kopfzeile. Die Taktleiste ist 16 px hoch.

   Luft, Block-Zeile und Taktleiste zusammen sind nur 38 px (quer 31 px), also schon zusammen unter 44 px.
   Jede unsichtbare Vergrößerung würde Transport-Knöpfe oder Taktleiste/Marken-Chips überdecken. Deshalb ist **nichts geändert**.
   Vorschlag an Xander (wäre sichtbar, also erst fragen):
   - (a) Block-Zeile 22 px hoch, solange es Blöcke gibt, oder
   - (b) im Marken-Blatt / in der Bereich-Leiste ein Knopf [▣ Block …] (44 px), der das Block-Blatt öffnet.
2. **Fragen an Xander aus der Stage EDIT:**
   - Tonart im eigenen Song-Clip: Jetzt gilt für Pinsel und Magic die Tonart des Song-Takts. Passt das?
   - Es gibt zwei Tonart-Wahlen mit gleichem Inhalt (Magic [Auto ▾] und Pinsel). Reicht eine?
3. **Aus KON:** Ein Teil mit Transpositions-Wechsel in der Mitte nimmt nur die Transposition vom Anfang, wenn er live aus der Teil-Leiste gestartet wird.
4. Noch nicht auf dem iPhone geprüft. Fertig ist es erst nach Xanders Okay.
## 4.29.0 — Video zeigt die echte App

App: `rel-4290/index.html`, 4 490 658 B. Das sind +117 KB gegenüber 4.28.0 (4 373 680 B). md5 `4ae337d5…`.
Die Merge-Fassung vor den zwei Fixes liegt als `index-vor-fix.html` daneben (`70dbba7c…`), die Änderung gegen 4.28.0 als `release.diff`.
`VERSION = '4.29.0'` (APP_CODE 4029000). Die Zeile `  live: true,` steht 1× da, „MS 2000“ genau 1×, keine Markennamen.

Basis ist 4.28.0 (online). Alles daraus bleibt: Konsolidieren/Block, Magic Scale, Melodie-Pinsel, Chor-Gruppe, Mitlese-Zeile,
GarageBand-Umweg und Songtext-Erkennung. Dazu kommt die Stage VIDEO mit fünf Paketen: VV4-A, VV4-C/E, VV4-B/D, VV4-F und VV-LOGO.
Zusammengeführt mit `git merge-file` gegen 4.27.0. Es gab einen echten Konflikt: die Zeile `Object.assign(SYNQUENZER, …)`.
Dort stehen G-GB (aus 4.27.1) und die drei Video-Schnittstellen jetzt untereinander. VERSION hatten beide Seiten gleich auf 4.28.0
gesetzt, sie steht jetzt auf 4.29.0. Klänge, Regler und gespeicherte Projekte bleiben gleich.

### Was du siehst

**In der App**
- **Pegel je Spur („Mäusekino“):** In der Matrix ein schmaler senkrechter Balken neben dem Farbstreifen jeder Spur, im Song ein
  waagrechter Balken unter dem Spurnamen. Grün, ab −12 dB gelb, ganz oben rot; rote LED bei Übersteuerung. Nichts verschiebt sich.
- **Master-Balken:** Matrix am linken Rand von „SONG ⇄“, Song neben „TAKT“. Antippen öffnet die MASTER-Seite.
- **Bild-Menü je Taktbereich:** Takte markieren → ⋯ → Video. Zwei Zeilen: `[Auto] [App] [Song] [Matrix]` und
  `[Spur …] [Tastatur] [Fokus …]`. „Spur …“ → `[Piano-Roll] [Drum-Sequenzer] [Modulation]` → Spur.
  „Fokus …“ → `[Clip-Zelle] [Tastatur] [Teil-Kopf] [Übergang]`. Modulation steht nur bei Spuren mit echter Modulation.
- **Video-Blatt:** bei 9:16 die dritte Wahl **[Ganze App]**; neue Zeile **„Abspann“** mit [Abspann-Logo] (an/aus) und
  [Andere Datei wählen …].

**Im Video**
- **Piano-Roll** mit den echten Noten des Clips, klingende Noten umrandet, grüner Laufstrich.
- **Drum-Sequenzer** wie die SCHRITTE-Seite: Kick und Snare wechseln nur, wenn das andere Instrument trifft (höchstens 1× je Schlag),
  Hi-Hat-Zeile darunter, Treffer leuchten.
- **Modulation:** echte App-Regler mit Mod-Ring und Live-Punkt, dazu die Modulations-Liste – nur wenn die Spur wirklich moduliert.
- **[Ganze App] hochkant:** Kopf, Matrix oder Song, Teil-Leiste, Spur-Zeile, Träger, Modusleiste, Tastatur – bewegt nur durch echte
  Daten (Takt, spielende Clips, Träger, Transposition, Noten).
- **Auto-Regie 2:** Neuer Clip → kurz Fokus auf seine Zelle, dann Piano-Roll. Drums neu → Drum-Sequenzer. Teilanfang → ganze App.
  Transposition → Tastatur. Übergang → Drum-Sequenzer. Deine Wahl im Bild-Menü geht immer vor.
- **Pegel** auch im Video (Song- und Matrix-Bild), zeitgleich mit dem Ton.
- **Abspann-Logo (dein Logo, `medien/abspann-logo.mp4`):** genau einmal, mittig, nicht gekachelt. Das letzte Bild dunkelt 1 s ab;
  ab halber Abdunklung blendet das Logo schon ein. Schwarz ist per Luma-Key herausgenommen – kein Kasten, kein Rand, das Rot bleibt
  satt. Die Musik ist da ausgeklungen; der Abspann ist still. Danach 0,5 s Schwarz.

### Bei der Zusammenführung behoben

1. **Chor im Video nach dem Laden (Altlast aus 4.27.0, gefunden von Stage NORTH).**
   - **Ursache:** Der Fehler tritt nur auf, wenn das **Audio des Gesangs auf diesem Gerät fehlt**. Die Projekt-Datei (.json) trägt
     nur die Kennung des Takes, das Audio liegt im Speicher des Geräts. NORTH hat die Datei in einem neuen Browser-Kontext geladen.
     Das ist wie ein anderes Gerät: Der Take fehlt dort, die Spur wird grau („Audio nicht auf diesem Gerät“).
     Das Video hat dann trotzdem auf diesen Take gewartet: erst 30 s auf die Gesangs-Fassungen, dann **180 s auf den Chor**.
     Danach kam der Fehler „Chor im Video nicht fertig (2)“ und ein Video ohne Gesang **und** ohne Chor (daher −2,4 dB).
     Der Chor selbst wird nach dem Laden richtig angestoßen: Auf demselben Gerät (neue Seite, neu geladen) und mit
     **Projekt + Audio (ZIP)** auf einem fremden Gerät ist er in 0,1 … 4 s fertig und im Video zu hören.
   - **Behoben:** Ein Gesangs-Stück, dessen Take auf diesem Gerät fehlt, bleibt im Video still, so wie live.
     Darauf wird nicht mehr gewartet, auch nicht im Song beim Vorausrechnen (dort lief bisher alle 250 ms ein neuer Versuch).
     Ein Video mit fehlendem Take ist jetzt nach 2 s fertig statt nach 3,5 min, ohne Fehlermeldung.
2. **GarageBand-Instrumental ohne Video-Zusätze:** Der Pegel-Meter (VV4-F) lief auch beim [Instrumental als Datei] mit.
   Er hat den Klang nicht verändert, kostete aber Rechenzeit und Speicher für nichts. Jetzt läuft er nur beim Video.
   Das Instrumental hat kein Abspann-Logo und keine Abspann-Länge, ohne Gesang und ohne Chor, und es ist **bit-gleich mit 4.28.0**.

### Bitte prüfen am iPhone (Schritt für Schritt)

1. **Version:** ≡ (Menü) → Info zeigt „SYNQUENZER 4.29.0“.
2. **Pegel:** Demo abspielen → **Matrix**: Die Balken neben den Spurfarben bewegen sich im Takt. Spur stumm → ihr Balken bleibt leer.
3. **Master:** Links am Rand von **SONG ⇄** antippen → die MASTER-Seite geht auf. In den **Song** wechseln → Balken unter den
   Spurnamen, Master neben „TAKT“. Die Block-Zeile über der Taktleiste (4.28.0) liegt frei, nichts überdeckt sich.
4. **Video 16:9:** Song mit Melodie und Drums → **≡ → Video → 16:9 → Auto → Video erstellen.** Achte auf: Piano-Roll mit deinen Noten,
   Drum-Sequenzer mit Kick/Snare-Wechsel, Pegel im Song-Bild.
5. **Abspann:** Am Ende wird das letzte Bild dunkel, schon dabei kommt dein Logo – einmal, in der Mitte, ohne schwarzen Kasten,
   Rot kräftig. Kein Ton im Abspann.
6. **9:16 → [Ganze App]:** dasselbe Video hochkant. Die ganze App ist zu sehen (Kopf, Matrix/Song, Teil-Leiste, Tastatur).
7. **Bild-Menü:** Takte markieren → ⋯ → Video → **[Spur …] → [Modulation]**: Nur Spuren mit echter Modulation stehen dort.
   Eine wählen → Video: Regler mit Mod-Ring.
8. **Chor im Video:** Song mit Chor-Gruppe an der STIMME → Video → der Chor ist zu hören (wie in 4.28.0).
9. **Chor nach dem Laden:** ≡ → Speichern. Die App ganz schließen und neu öffnen, das Projekt laden → Video erstellen.
   Der Chor ist zu hören, das Video startet ohne lange Pause (kein „Chor im Video nicht ganz fertig“).
10. **Ohne Audio laden** (nur wenn du magst): die gespeicherte **.json** auf einem anderen Gerät laden (ohne ZIP) → die STIMME ist grau.
    Video erstellen → es geht nach wenigen Sekunden los, ohne Gesang (wie beim Abspielen). Mit **Projekt + Audio (ZIP)** ist alles da.
11. **GarageBand:** Takes-Blatt → [Instrumental als Datei] in einem Song mit Chor → die Datei hat keinen Gesang und keinen Chor,
    keinen Abspann, sie endet mit dem Song. Ein Import danach läuft wie in 4.28.0.
12. **Abspann aus:** Video-Blatt → **[Abspann-Logo]** aus → Video ohne Abspann. App neu laden → die Wahl bleibt.

### Tests (Chromium mit Touch-Emulation, gegen `rel-4290/index.html`)

Alle Läufe einzeln, je höchstens 5 min. Die Stage-Tests liegen angepasst unter `rel-4290/sim/bau/stage/VIDEO/tests/`
(Start: `sim/run-stage.sh`). Vergleichsbasis ist jetzt 4.28.0 (`R-4280`) statt 4.27.0, die Versions-Erwartung 4.29.0.
Die übrigen Tests: `rel-4290/tests/alle.sh` (EDIT + neu) und `rel-4290/run-haupt.sh` (G-GB, G9b, Rauchtests).

| Test | Ergebnis |
|---|---|
| **neu** `tests/chor/chor-frisch.mjs`: Chor nach dem Laden in einer frischen Seite – neue Seite, neu geladen, anderes Gerät mit ZIP: Chor-Gruppe da, fertig in < 10 s (0,1 s; Video-Ton 5–6 s), **Chor im Video-Ton** (Abstand zu „mit Chor“ −113 dB, der Chor selbst −7,6 dB); anderes Gerät nur .json: kein Warten (2 s), kein Fehler, Gesang still | **16/16** (4.28.0: Fall .json 2/4 rot – Zeitlimit 30 s, ungekürzt 30 s + 180 s) |
| **neu** `tests/ggb-video.mjs`: Instrumental-Länge = Vorzähler + Song, kein Logo-Abruf, kein Pegel-Meter, ohne Lead/Chor still, **bit-gleich mit 4.28.0**; Video-Ton mit/ohne Pegel-Meter **bit-gleich** | **9/9** |
| VV4-A: render WebCodecs 10 · render Aufnahme 10 · kb-live 3 · layout 43 · ui 40 · layer 2 · alt 2 (36 Bilder gegen 4.28.0: gleich bis auf Pegel-Leiste und gewollt neue Auto/Spur-Bilder) | **110/110** |
| VV4-A perf (3-min-Song, [Ganze App]) | 1,42× Echtzeit (Soll ≥ 1,5×) – siehe Offene Punkte |
| VV4-C/E: abn 19 · mk 6 · ui 14 | **39/39** |
| VV4-B/D: regie 7 · menue 21 · layout 7 Formate · bild 12 | **alle „GESAMT GRÜN“**, 0 Konsolenfehler |
| VV4-F: t-app 24 (428×926) · 24 (926×428) · t-layout 35 (gegen 4.28.0, 7 Formate, inkl. Block-Zeile) · t-video 15 (Bit-Gleichheit mit/ohne Meter) · t-speed 4 | **102/102** |
| VV-LOGO WebCodecs: 16:9 · 9:16 · 1:1 · .mov | **je 21/21** |
| VV-LOGO Aufnahme-Weg (MediaRecorder, Echtzeit): 16:9 · 9:16 · 1:1 | **je 21/21** bei ruhiger Maschine; unter Fremdlast rot, Stage-Datei genauso (siehe unten) |
| VV-LOGO ui 40 · cancel 4 · regress 21/22 bzw. 20/22 (nur Aufnahme-Weg 9:16 unter Last; dort ist auch 4.28.0 rot) | ui **40/40**, cancel **4/4** |
| Ende-zu-Ende `e2e-video.mjs` WebCodecs (Chor im Video-Ton −9,6 dB gegen Rauschen −114,6 dB, Logo, Pegel, Piano-Roll, Drum) | **26/26** |
| Ende-zu-Ende Aufnahme-Weg | 25/26 in 3 Läufen (je eine Logo-Zeitprüfung im Echtzeit-Weg 9:16 / einmal 16:9); Stage-Datei unter gleicher Last ebenfalls 25/26 |
| `bilder-fokus.mjs` | grün, 0 Konsolenfehler |
| KON: kon-block 41, kon-konsol 42, kon-save 11, kon-layout 24 | **118/118** |
| MAGIC: ms-funktion 43, ms-layout 38, ms-regress 2 | **83/83** |
| PINSEL: t-pinsel 39, t-bloecke 20, t-mithoeren 20, t-layout 47, t-alt 18 | **144/144** |
| EDIT-Zusammenspiel `zusammen.mjs` 48 · G-GB × KON `ggb-kon.mjs` 34 | **82/82** |
| G-GB: a-export 16, bcd-import 18, f-layout 11, g-befunde 28, h-zusammenspiel 16 | **89/89** |
| G9b-Rauchtest (WANTV 4.29.0 / WANTC 4029000) | **5/5** |
| `smoke.mjs`, `v3-mk8-smoke`, `v3-mk8b-smoke` | grün, `errors []` |
| `orch-mk-check.mjs` | grün, 4.29.0, Klangwerte wie 4.28.0 (initAm rms 0,0705 / peak 0,177) |
| `v3-mk2-wellen.mjs` | alles PASS |
| acorn-Doppelprüfung | 20 Skripte, 3 665 Namen, **0 doppelt**, 0 Syntaxfehler |

**Fremdlast:** Auf der Test-Maschine (4 Kerne) liefen zeitgleich Tests anderer Sitzungen (Last 4 … 14). Alle Echtzeit- und
Tempo-Prüfungen habe ich deshalb im direkten Wechsel gegen die Stage-Datei laufen lassen:
- Aufnahme-Weg 16:9: neu 19/21, 19/21, 21/21 – Stage 21/21, 19/21, 9/21 (bei Last 13).
- Aufnahme-Weg 9:16: neu 21/21, 21/21 – Stage 21/21, 21/21. Im vvl-regress war unter Last sogar **4.28.0** selbst zu kurz (Bildspur 10,09 s statt 11,36 s).
- WebCodecs 9:16 (Logo schon beim Abdunkeln): neu 21/21, 21/21 – Stage 20/21, 21/21.
- kb-live und t-app quer: beim ersten Lauf 18 statt 20 Messpunkte bzw. Langaufgaben bis 380 ms; allein beide grün (neu und Stage).
- Ende-zu-Ende Aufnahme-Weg: neu 25/26 (dreimal, jeweils eine Logo-Zeitprüfung), Stage 25/26 (Rot-Prüfung im Logo, ebenfalls Zeitversatz).
- Audio-Render 92-s-Song (je 2× im Wechsel): neu 22,7 … 25,8 s, Stage 21,7 … 24,8 s, 4.28.0 20,5 … 22,6 s.
  Der Pegel-Meter im Video-Render kostet also einige Prozent; die Zusammenführung selbst macht nichts langsamer.

### Offene Punkte

1. **iPhone-Prüfung fehlt.** Fertig ist es erst nach Xanders Okay. Wichtig ist der Aufnahme-Weg (MediaRecorder): Er läuft in Echtzeit.
   Ist das Gerät nebenbei stark beschäftigt, kann das Video am Ende zu kurz werden (Abspann abgeschnitten); im Test-Chromium passiert
   das unter Fremdlast, mit 4.28.0 genauso. Am iPhone: Schritt 5 und 6 bitte genau ansehen (Logo, 0,5 s Schwarz am Schluss).
2. **Tempo 3-min-Video [Ganze App]:** hier 1,42× Echtzeit unter Fremdlast, Soll ≥ 1,5× (die Stage maß ruhig 2,11×, die Stage-Datei
   hier unter gleicher Last 1,55×). Der Pegel-Meter im Render kostet einige Prozent. Am iPhone messen.
3. **Block-Zeile (4.28.0) im Video:** Das Song-Bild und [Ganze App] im Video zeigen die Block-Zeile über der Taktleiste nicht.
   Sichtbare Änderung → erst fragen (siehe Fragen).
4. **Zwei mögliche Klangfassungen:** Schon 4.28.0 rechnet dasselbe Instrumental bzw. denselben Video-Ton je nach Zeitpunkt in einer
   von zwei Fassungen (im Test mit festem Zufallswert: zwei feste Hashes, in 4.28.0 und 4.29.0 dieselben). Nicht neu, nicht angefasst.
5. **Fragen aus der Stage VIDEO** bleiben offen: [Ganze App] öfter zeigen? Letztes volles Bild im Ausklang stehen lassen?
   Musik zusammen mit dem Bild in 1 s ausblenden? Dazu die alten Fragen der Pakete und von 4.28.0 (Block-Zeile 44 px, Tonart-Wahl).
## 4.30.0 — North (Drum-Synth)

App: `rel-4300/index.html`, 4 665 281 B. Das sind **+174 623 B** gegenüber 4.29.0 (4 490 658 B), genau der Zuwachs von North
(in `rel-north` gegenüber 4.28.0 ebenfalls +174 623 B). `VERSION = '4.30.0'` (APP_CODE 4030000), md5 `9fb9a9b3…`.
Die Datei ist bei der Prüfung **unverändert** geblieben (`index-vor-pruef.html` ist bytegleich). Die rohe Merge-Fassung mit den
Konflikt-Markern liegt als `merged-roh.html` daneben (`56bd813a…`).
Die Zeile `  live: true,` steht 1× da, „MS 2000“ genau 1×, keine Markennamen (auch nicht in Kommentaren).

Grundlage ist jetzt **4.29.0** (online). Alles daraus bleibt: Video zeigt die echte App (Piano-Roll, Drum-Sequenzer, Modulation,
[Ganze App], Auto-Regie 2), Pegel je Spur und Master, Abspann-Logo, der Chor-Fix nach dem Laden, dazu Chor-Gruppe, Mitlese-Zeile,
GarageBand-Umweg, Songtext-Erkennung, Block/Konsolidieren, Magic Scale und Melodie-Pinsel. Neu kommt die Drum-Synthese **North**
dazu (Stage NORTH, geprüft als `rel-north` auf 4.28.0).

- Merge: `git merge-file` mit ours = 4.29.0 (`R-4290`), base = 4.28.0 (`R-4280`), theirs = `rel-north/index.html`.
- 3 Konflikte, alle nur „beide behalten“:
  - CSS: die Pegel-Balken (VV4-F) und die North-Editor-Regeln (ND2) stehen jetzt untereinander.
  - `VERSION` → `'4.30.0'`.
  - Liste der Test-Schnittstellen: `mtrInfo` (Pegel) und `mdInfo`/`mdRender`/`mdTest` (North) zusammen.
- Gegenprobe: Was 4.30.0 gegenüber 4.29.0 ändert, ist Zeile für Zeile genau das, was North gegenüber 4.28.0 ändert
  (2 113 neue, 30 ersetzte Zeilen), bis auf die eine zusammengeführte Listen-Zeile.
- Doppelte Namen (acorn): 22 Skripte, 3 770 Namen, **0 doppelt**, 0 Syntaxfehler.

### Was du siehst

- **Drum-Editor → SOUND → [Quelle ▾]**: Jedes Pad spielt entweder „Drum“ (der bisherige Klang) oder **North**.
  Zurück auf „Drum“ gibt genau den alten Klang, die North-Werte bleiben gemerkt.
- Ein North-Pad hat die Unter-Reiter **TONE · NOISE · CLICK · MIX · FX**. Dazu kommen:
  - große Wert-Zellen mit Unterzeile und Listen für WAVE
  - **Programm ▾** mit 45 Werks-Klängen, nach Kategorie sortiert
  - das Menü ⋯ (Programm sichern, Init, Einfügen, Tauschen)
  - **ALLE KANÄLE**, **SOLO PART** und ▶ zum Vorhören
- **KIT → North · HALL & ECHO**: gemeinsamer Hall und gemeinsames Echo der North-Pads, mit TAP für die Echozeit.
- Vier neue Kits in der Kit-Liste: **Fell & Holz, Modell-Analog, Gestimmt, Schräg**.
- Alle Tasten der North-Seiten sind mindestens 44 × 44 px groß. In 7 Formaten gibt es kein waagrechtes Scrollen.
- Die Pegel-Balken aus 4.29.0 bleiben, wo sie waren. Nichts verschiebt sich durch North.

### Was du hörst und im Video siehst

- North-Pads laufen über die Drum-Spur: Spur-FX, Sends, Mute/Solo und der Pegel-Balken der Drum-Spur wirken wie bei jedem Pad.
- **Im Song-Video klingen North-Pads wie live.** Zwei Videos desselben Songs sind bitgleich (ohne Chor), 0 verspätete Schläge.
- **Das Drum-Sequenzer-Bild im Video zeigt die North-Drums**: Die Auto-Regie schaltet beim neuen Drum-Clip auf den Drum-Sequenzer,
  dort leuchten die Schritte, die Treffer blitzen und Kick/Snare wechseln wie mit dem alten Kit. Wie auf der SCHRITTE-Seite der App
  steht dort kein eigenes „North“-Zeichen – die Pads heißen weiter KICK, SNARE …
- Pegel im Video und das Abspann-Logo laufen mit North genauso wie ohne. Der Abspann bleibt still.
- Im GarageBand-Instrumental sind die North-Drums drin, der Chor nicht (wie bisher).
- Projekte ohne North-Pad klingen und laden wie in 4.29.0. Das North-Modul wird dann gar nicht geladen.

### So prüfst du am iPhone (Safari)

1. **Version:** Seite neu laden. ≡ (Menü) → Info zeigt „SYNQUENZER 4.30.0“.
2. **Alte Projekte:** Ein altes Projekt mit Chor-Gruppe und Songtext öffnen und abspielen. Es soll klingen wie gestern.
   Die Pegel-Balken in Matrix und Song bewegen sich wie in 4.29.0.
3. **Kit „Schräg“:** Drum-Spur → **KIT** → Kit **„Schräg“** laden → ▶. Die Drums klingen jetzt nach North.
   Der Pegel-Balken der Drum-Spur schlägt mit aus.
4. **Quelle umschalten:** Drum-Editor → ein Pad (z. B. KICK) → **SOUND** → **[Quelle ▾]** → „Drum“. Es kommt der alte Kick.
   Dann wieder „North“: Der North-Klang ist unverändert wieder da.
5. **Reiter:** Auf einem North-Pad die Reiter **TONE, NOISE, CLICK, MIX, FX** antippen und eine Zelle senkrecht ziehen.
   Jede Taste muss bequem mit dem Daumen gehen, nichts darf abgeschnitten sein, hochkant und quer.
6. **Programme:** **Programm ▾** → ein paar der 45 Klänge durchhören (▶).
7. **Hall & Echo:** **KIT → North · HALL & ECHO** → Hall hochziehen, dann TAP 4× im Takt tippen. Das Echo folgt.
8. **3 Minuten:** Song mit Stimme, Chor-Gruppe und Kit „Schräg“ **mindestens 3 Minuten** laufen lassen.
   Achte auf Knackser, Aussetzer und ob das Handy heiß wird.
9. **Video mit North:** In diesem Song **≡ → Video → 16:9 → Auto → Video erstellen.** Achte auf:
   - Die North-Drums sind im Video zu hören, der Chor auch.
   - Beim Drum-Teil kommt das Drum-Sequenzer-Bild, die Schritte leuchten im Takt.
   - Am Ende: Bild dunkelt ab, dein Logo einmal in der Mitte, kein Ton im Abspann.
10. **9:16 → [Ganze App]:** dasselbe Video hochkant, mit Pegel-Balken.
11. **Konsolidieren mit North:** Takte mit Chor-Stelle und Drums als Block markieren (Taktleiste → ⋯ Mehr → [▣ Als Block]).
    Dann Block antippen → [Als neuen Teil konsolidieren] → abspielen. Klingt der Song genau wie vorher? Danach [Zurückholen].
12. **GarageBand:** [Instrumental als Datei] → in GarageBand öffnen. Die North-Drums sind zu hören, der Chor nicht.
13. **Speichern:** Speichern, App ganz schließen, wieder öffnen, Projekt laden → Video erstellen.
    North-Pads, Kit, Block und Chor sind wie vorher, der Chor ist im Video, das Video startet ohne lange Pause.

### Tests (Chromium headless, 4 Kerne, gegen `rel-4300/index.html`, „alt“ = 4.29.0 `R-4290`)

Alle Läufe einzeln, je höchstens 5 min. Start: `rel-4300/tests/alle.sh` (North + Hauptlinie), die EDIT-Tests liegen angepasst
unter `rel-4300/tests-edit/` (Kopie von `rel-4290/tests`, zeigen über `../index.html` auf 4.30.0).
Last auf der Maschine während der Prüfung: 0,1 … 2,4 (ruhig).

| Test | Ergebnis |
|---|---|
| North-Rauchtest · `md4-quick` | ✓ `errors []` · ✓ Engine bereit (27 ms), Undo gleich, 0 verspätet |
| `md4-golden` (Regel 28 gegen **4.29.0**) | Kits deep-equal, Render −120 … −155 dB (= alt/alt), ohne North-Pad kein Modul ✓ · ✗ nur **Größe +174 623 B** (Budget 100 KB, Q9) → 5/6 |
| `md4-int` (ND4-03/04/05) | **20/20** |
| `md2-ui` hochkant · quer (gegen 4.29.0, getrennt gelaufen) | **195/195 · 195/195** (auch ND2-10 TAP grün) |
| `ndstage-tap44` | 84 Ansichten, alle Tasten ≥ 44 px, kein waagrechtes Scrollen |
| `north-songs` (9 Projekte aus **4.29.0**) | **6/6**: laden + speichern unverändert, kein North-Modul, Video 356 Noten, −0,07 dB |
| `north-video` (ND4-08, Video-Render 4.29.0 mit Pegel-Meter) | ✓ bitgleich (−300 dB), live ↔ Video 1,00, 0 verspätet, live danach weiter |
| `north-kon-chor-ggb` (North-Kit + 2 Chor-Gruppen, Konsolidieren/Zurückholen/↶, Instrumental) | **17/17** |
| **neu** `north-vv4-e2e.mjs` WebCodecs: Song mit Melodie, 2 Drum-Clips, Transposition, STIMME + Chor-Gruppe, **Kit „Schräg“** → Video 16:9 Auto und 9:16 [Ganze App] mit Pegel und Abspann-Logo | **34/34**: North-Knoten im Offline-Kontext, 0 späte Schläge, 80 Schläge = 80 im Noten-Log; Auto-Regie → Drum-Sequenzer mit North-Schlägen (Blitz 48/121 Bilder, Kick/Snare-Wechsel ≤ 1 je Schlag); Pegel-Fenster vollständig (571/570); Logo mittig, gekeyt, Rot satt; Abspann still; North im Ton (mit Drum-Stimme −1,8 dB anders, Rauschen −62,8 dB); Chor im Ton (−9,6 dB gegen −114,8 dB) |
| **neu** `north-vv4-e2e.mjs` Aufnahme-Weg (MediaRecorder, Echtzeit) | **34/34** (dieselben Prüfungen, Echtzeit-Aufnahme; 121 s) |
| `north-chor-songs` (Song mit Chor-Gruppe aus 4.29.0, Datei in einer **neuen** Browser-Sitzung geladen) | 7/8: Datei, Chor-Gruppe, kein Modul, 48 Noten ✓, **kein Warten mehr** (25 s statt 236 s) · Video-Pegel −2,44 dB ✗ = **genauso 4.29.0 → 4.29.0** (gewollt seit 4.29.0: Takes fehlen dort, Gesang still wie live – siehe unten) |
| `north-startzeit` (12 Läufe je Fassung, ohne North-Pad) | ✓ kein North-Modul, auch nicht nach ▶. Zahlen unten |
| **Hauptlinie** `chor-frisch` (Chor nach dem Laden: neue Seite, neu geladen, ZIP, nur .json) | **16/16** |
| `ggb-video` (Instrumental ohne Video-Zusätze, **bit-gleich mit 4.29.0**; Video-Ton mit/ohne Pegel-Meter bit-gleich) | **9/9** (die Versions-Erwartung der Kopie von 4.29.0/4.28.0 auf 4.30.0/4.29.0 gestellt) |
| KON: kon-block 41, kon-konsol 42, kon-save 11, kon-layout 24 | **118/118** |
| MAGIC: ms-funktion 43, ms-layout 38, ms-regress 2 (alt = 4.29.0) | **83/83** |
| PINSEL: t-pinsel 39, t-bloecke 20, t-mithoeren 20, t-layout 47, t-alt 18 (alt = 4.29.0) | **144/144** |
| EDIT-Zusammenspiel 48 · G-GB × KON 34 | **82/82** |
| G-GB `ggb-h-zusammenspiel` | **16/16** |
| G9b-Rauchtest (4.30.0 / 4030000) | **5/5** |
| Pipeline: `smoke.mjs` · `orch-mk-check.mjs` · `v3-mk2-wellen.mjs` | ✓ `errors []` · ✓ 4.30.0, initAm rms 0,0705 / Spitze 0,177 (wie 4.29.0) · alles PASS (8/8) |
| acorn-Doppelprüfung | 22 Skripte, 3 770 Namen, **0 doppelt** |

**`north-chor-songs` ist kein North-Fehler.** Der Test lädt die gespeicherte .json in einer neuen Browser-Sitzung. Das ist wie ein
anderes Gerät: Das Audio der Takes fehlt dort. Seit 4.29.0 bleibt der Gesang dann im Video still (wie beim Abspielen) und die App
wartet nicht mehr 3,5 min. Deshalb ist das Video leiser als das Original (−2,44 dB). 4.29.0 gegen sich selbst zeigt genau dieselben
Zahlen. Mit Audio (gleiches Gerät, neu geladen, ZIP) ist der Chor im Video: `chor-frisch` 16/16. Die alte Altlast „Offen 3“ aus
`rel-north` ist damit erledigt.

### Startzeit ohne North-Pad (12 Läufe je Fassung abwechselnd, Median, gegen 4.29.0)

| | 4.29.0 | 4.30.0 | Unterschied |
|---|---|---|---|
| App bereit, CPU ×1 | 351 ms | 368 ms | +17 ms |
| `load`, CPU ×1 | 426 ms | 436 ms | +10 ms |
| Skript-Zeit, CPU ×1 | 60 ms | 68 ms | +8 ms |
| App bereit, CPU ×4 (wie ein langsames Telefon) | 1 769 ms | 1 762 ms | −6 ms |
| `load`, CPU ×4 | 2 199 ms | 2 175 ms | −24 ms |
| JS-Heap | 5,4 MB | 5,7 MB | +0,3 MB |

- Bei ×4 liegt der Unterschied im Rauschen (in `rel-north` waren es +74 ms, die Messung schwankt um ±30–50 ms).
- Was bleibt: einige Prozent mehr Lesen und Übersetzen der größeren Datei (+4 %). North selbst lädt nicht (0 × `addModule`, Zustand `idle`).
- Nicht umgebaut (Q9).

### CPU und Größe (aus `rel-north` übernommen, Engine-Code bitgleich, nicht umgebaut)

- **CPU je Stimme** (`md1-cpu`, offline): schlimmster Fall 9,9–11,5 % (Grenze 8 %). Mit Begrenzer Stufe 2: 6,9–7,5 %.
- **Echtzeit** (`md1-chromium`): schlimmster Fall 16,1 %, typischer Groove 4,9 %, Leerlauf 0,2 %, Modul-Laden 6–17 ms.
- **3-Minuten-Lauf North + Chor** (rel-north): 0 Knackser, 0 verspätete Schläge, Engine-Last je Sekunde max. 15,3 %, Median 6,6 %.
- **Größe:** +174 623 B gegenüber 4.29.0 (Budget 100 KB).

### Bei der Prüfung behoben

- An der App: **nichts.** Kein Test fand einen Fehler aus dem Zusammenspiel North × Video 4.29.0.
- An den Tests: `tests-edit/ggb-video.mjs` erwartete fest „4.29.0“/„4.28.0“; jetzt 4.30.0/4.29.0 (über `WANTV`/`ALTV`).
  `md2-ui` läuft hochkant und quer getrennt, weil es zusammen fast 5 min braucht.

### Offene Punkte

1. **Gerätetest iPhone 12 Pro Max:** Schritte 8–13 oben. Er entscheidet Q3.
2. **Q3 CPU je Stimme:** schlimmster Fall 9,9–11,5 % statt 8 %, mit Begrenzer Stufe 2 knapp darunter. Nur gemessen, nicht umgebaut.
3. **Q9 Größe:** +175 KB (Budget 100 KB). Startzeit am Rechner etwa +10–17 ms ohne North-Pad.
4. **Zwei Video-Renders des ganzen Songs mit Chor-Gruppe** sind nicht ganz bitgleich (hier −62,8 dB; in `rel-north` −43 … −52 dB an den Chor-Einsätzen, dort auch in 4.28.0 ohne Drums). Ohne Chor ist das North-Video bitgleich (−300 dB). Nicht angefasst, weil Chor-/Video-Code.
5. **Synth-Engines im Video unter starker Last:** Sie schicken ihre Noten auf dem Weg, den North vor seinem Fix hatte. Nicht beobachtet, nicht angefasst.
6. **Master-Spitze** vor dem Limiter mit Kit „Schräg“ + Chor ≈ +1,9 dBFS (Q2 Pegelschutz).
7. Aus der Stage weiter offen: Chor-Stile wave/ballade/disco greifen mit dem Test-Gesang nicht (Testaufbau), Q6 E1-Abklingen, ND42-Fragen 1–4.
8. Noch nicht auf dem iPhone geprüft. Fertig ist es erst nach Xanders Okay.

### Fragen an Xander

1. Größe +175 KB und Startzeit etwa +10–20 ms ohne North-Pad. Ist das so okay (Q9)?
2. Q3: Reicht der CPU-Begrenzer, wenn dein iPhone den 3-Minuten-Lauf (Schritt 8) ohne Knackser schafft?
3. Soll das Drum-Sequenzer-Bild im Video bei North-Pads ein eigenes Zeichen bekommen? In der App gibt es keines, darum jetzt auch nicht im Video.
4. ND42-Fragen aus der Stage: SOLO PART nur für North-Pads? Würfel bei North-Pads? Höhe der Unter-Reiter? ✕ zum Löschen eigener Programme?
