# VD3 – Video wie die App, Schnitt-Modus im Song, Making-of

**Für Xander:**
- Das Video sieht jetzt sofort wie die App aus: 9:16 mit „Ganze App“ ist die Voreinstellung (Matrix, Song und Editor wie auf dem iPhone). Neu im Video-Blatt unter „Extras“: **Titel** (die erste Sekunde zeigt Songname, Tempo und Tonart), **Rand** (das Bild rückt nach oben, unten bleibt Platz für TikTok-Untertitel), **Making-of** und **Schnitt**. Das Logo am Ende bleibt wie bisher.
- **Schnitt im Song:** SCHLEIFE ▾ → „Video-Schnitt im Song“ (oder Video-Blatt → [Schnitt]). Unter den Takt-Nummern erscheint eine schmale Video-Spur mit einem Chip je Bereich. Ein voller Chip ist deine Wahl, ein gestrichelter ist Auto. Tippst du auf einen Chip, wählst du das Bild: Auto, App, Klavier, Mäusekino, Gerät, Matrix, Noten oder Text. Mit „Ab Takt n“ teilst du den Bereich. Ziehst du an der Kante zwischen zwei Chips, verschiebst du den Schnitt. Ist der Schnitt aus, sieht der Song genau aus wie vorher (geprüft, pixelgleich).
- **Making-of:** Ab jetzt merkt sich die App, was du baust: welchen Klang du wählst, welchen Regler du wie weit drehst, welche Clips du anlegst, welche Noten du einspielst und welche Teile du baust. Das bleibt nur auf deinem Gerät, außer du legst es ins Projekt. Mit [Making-of] beginnt das Video mit einem gerafften Vorlauf von 8 bis 36 s: der echte Editor, in dem sich der Regler dreht, die Matrix, in der Clips und Noten erscheinen, und der Song, in dem die Teile erscheinen. Darunter läuft dein Song gedämpft und öffnet sich. Dann kommt der ganze Song. Fehlt noch ein Protokoll, sagt das Blatt das.
- Neu ist die Ansicht **Text**: Sie zeigt deinen Songtext mit der Silbe, die gerade klingt. Wo kein Text ist, steht der Teil-Name groß.

**Technik:** Alles steht im Block `VD3-BEGIN … VD3-END` (nach `VR1-END`). Eingehängt ist es mit je einer Zeile an diesen Stellen: vvPrefs (Voreinstellung app), vvDraw, vvMake (job.pre, vd3ResPatch, vd3JobEnd), vvEncodeWC (Vorlauf-Bilder und -Ton zuerst, Zeitstempel + Pf/aOff), vvEncodeMR (Vorlauf in Echtzeit), vvOpen/vvSync (Zeile „Extras“), svLayout/svDraw (`SV.vvS` = Spur 24/20 px statt 8-px-Streifen), svBindGestures (vd3LaneDown), openLoopPop, vv4Pic ('text'), vr1Map ('text'), setP / applySound / loadKit / undoPush (Protokoll) und normalizeProject (`vd3mo`). Neue Daten kommen nur dazu: `song.video` kennt den Wert 'text'; `S.vd3mo` gibt es nur, wenn du „im Projekt“ wählst. Das Protokoll liegt in localStorage `sq-vd3mo-<Projekt>` (höchstens 800 Einträge, die letzten 12 Projekte). Die Einstellungen heißen `vv.vd3ti/vd3rd/vd3mo` und `vd3cut`. Test-API: `SYNQUENZER.vd3`.

**Tests:** `vd3-test.mjs` → 33/33 (`t-log.txt`, Standbilder und Video in `t/stills`). Geprüft sind:
- Voreinstellung, Titel und Rand (Pixel), Text-Ansicht mit Silben.
- Schnitt-Modus per Finger hochkant und quer: Menü, teilen, Gerät mit Spur, Kante ziehen, Undo. Ausgeschaltet ist er pixelgleich zum Grundstand.
- Protokoll über die echten Haken (ohne Finger wird nichts aufgezeichnet), Grenze 800, Projekt speichern und laden, alte Projekte.
- Plan des Vorlaufs und Standbilder. Die Bilder sind deterministisch (zweimal gleich gezeichnet), der Vorlauf-Ton ebenso.
- Echter Render (H.264 + PCM, MOV, also der Weg des iPhones): Bild 43,23 s, Ton 43,24 s, das ist 23,6 s Vorlauf plus Song. Vorlauf −24,6 dB, Song −17,7 dB.
- Ersatzweg „Aufnahme in Echtzeit“ mit und ohne Vorlauf. Ohne Making-of gleich lang und gleich laut wie der Grundstand.

Pflicht: acorn 0/0, doppelte Schlüssel 0, Rauchtest `[]`, Marken 0, „MS 2000“ 1×, „live“ 1×.

**Renderzeit** (Headless-PC, 8 Takte bei 112 BPM): ohne Making-of 8,0 s, mit 23,6 s Vorlauf 15,2 s. Der Vorlauf kostet 7,3 s, fast nur fürs Kodieren. Gezeichnet wird ein Vorlauf-Bild in 0,4 ms im Mittel, weil nur 310 von 708 Bildern neu entstehen.

**Offen:**
- Der Schalter für den Schnitt sitzt in SCHLEIFE ▾ und im Video-Blatt, weil die Song-Leiste hochkant voll ist. Ein eigener Knopf in der Song-Leiste ist ein Vorschlag, den Xander entscheidet.
- Die Video-Spur liegt direkt unter den Takt-Nummern über den Spuren, dort wo vorher der Regie-Streifen war. Darüber würde sie in fremden Code (KON-Blöcke) eingreifen.
- Regler-Gesten werden für VA, WT und FM (setP) aufgezeichnet. Für Geräte-Platte und Bit Mask gibt es noch keine Gesten, dort zeigt der Vorlauf das Gerät ohne Fokus.
- Im Vorlauf zeigen die anderen Regler ihren Endstand. Der Vorlauf-Ton ist der Song selbst und kein Nachbau des Bastelns.
- Im Video-Blatt gibt es noch keine Vorschau des Vorlaufs zum Abspielen, nur ein Standbild.
- Projekte ohne Protokoll bekommen keinen nachgestellten Vorlauf, das Blatt zeigt dann einen Hinweis.
- H.264 kodiert im Headless-Chromium nicht bit-stabil, und der Ausklang folgt der zufälligen analogen Drift. Deterministisch geprüft sind deshalb die Bilder vor dem Kodieren.
