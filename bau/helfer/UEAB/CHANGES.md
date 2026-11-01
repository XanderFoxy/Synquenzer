# UE-A + UE-B „Übergänge“ (Fill-Bibliothek) – Änderungen

Basis: `bau/snapshots/R-4300.html` (App 4.30.0). VERSION unverändert. Spec: `spec/konzept-schnitt-uebergaenge-video.md` §1.

## So benutzt du es auf dem iPhone

1. Song-Ansicht öffnen (**SONG ⇄**). In der oberen Leiste gibt es jetzt **[◆ ÜBERGÄNGE]** (zwischen SCHLEIFE und ⏮).
   - Ganz schmale Bildschirme mit [▲▼] (z. B. 375 × 667): dort liegt **◆** als runder Knopf unten rechts über dem Song-Raster.
2. Antippen: Unten öffnet sich die **Bibliothek-Leiste** mit den Reitern **[Übergänge] [Breaks] [Einwürfe] [Verknüpfer] [Eigene]**.
   - Die Leiste liegt über dem Song-Bereich. Die Song-Zeilen rücken darüber zusammen, die Tastatur bleibt sichtbar.
   - Quer (926 × 428) und bei 428 × 650 ist die Leiste einzeilig. Der Reiter ist dann ein Knopf mit Liste.
3. Jede **Kachel** zeigt Name, ein Mini-Schrittbild und die Länge (¼ · ½ · 1 · 2 · 4 T).
4. **Kachel antippen** = einmal vorhören, mit dem Kit der Drum-Spur.
5. **Kachel nach oben ziehen**: Ein amber Geist folgt dem Finger.
   - Liegt eine Teilgrenze im Umkreis von ±½ Takt, rastet er ein.
   - Die Kante leuchtet dann amber, und die Schläge des Übergangs sind in der Drum-Zeile schraffiert.
   - Beim Ziehen tritt die Leiste nach unten weg, damit die Drum-Zeile frei ist.
6. **Loslassen auf der Kante**: Der Übergang liegt als Chip **◆ + Kurzname** an der Kante in der Drum-Zeile.
   - Eine belegte Kante wird ersetzt (1 Undo).
   - Loslassen woanders: Der Geist fliegt zurück, im Song ändert sich nichts.
7. Gibt es dieselbe Kante (z. B. Strophe → Refrain) noch öfter, fragt ein Toast: **„Auch an den 2 anderen Kanten Strophe → Refrain? [Überall] [Nur hier]“**.
   - [Überall] legt verknüpfte Kopien an. Eine Änderung gilt dann für alle.
8. **Chip halten und ziehen**:
   - auf eine andere Kante = verschieben
   - aus dem Song heraus (z. B. nach oben über die Knopfzeile) = löschen, mit Toast **„Rückgängig“**
9. **Griff links am Chip** (die zwei Striche) waagrecht ziehen: Die Länge rastet auf ¼ · ½ · 1 · 2 Takte vor der Kante. Der Chip zeigt die Länge, solange du ziehst.
10. **Chip antippen** öffnet ein kleines Blatt mit:
    - Länge ¼ · ½ · 1 · 2 T
    - ▶ Vorhören
    - **[Überall (n)]**, bei verknüpften Kopien stattdessen **[Nur hier ändern]**
    - ✕ Entfernen

    Das volle Nachbearbeiten-Blatt (Dichte, Richtung, Modus, [Noten], eigenes Kit, Eigene sichern) kommt mit UE-E.
11. Jede Aktion ist **genau ein Undo-Schritt**.
12. Übergänge ändern den Song nicht: Sie liegen wie Sticker auf der Kante, die Clips bleiben unberührt.
    - Sie klingen beim Abspielen, im **Video (offline)** und im **GarageBand-Instrumental**.
    - Die Auto-Regie (VV4) zeigt im Video den Drum-Sequenzer über dem Übergang.

## Was technisch dazukam

- **Daten `song.ue`** genau nach §1.5: `{id, m | at, a, len, k, t, notes, mode, stop?, dens, dir, g?, src, kit?, baked?}`.
  - Längen in Schlägen.
  - Kanten-Übergänge hängen an der Marke des folgenden Teils.
  - Ein Song ohne Übergänge speichert nichts Neues: Die Datei ist byte-gleich zu 4.30.0, bis auf die Zufalls-IDs.
  - Prüfung beim Laden, bei Undo und nach jeder Änderung: `ueNorm` in `normSong` und in `songTidy`.
  - Je Kante höchstens ein Übergang. Eine Gruppe aus nur einem Eintrag gilt nicht als verknüpft.
- **Haken:**
  - `songShift`: Einwürfe (at) rücken mit.
  - `songClear`: Einwürfe im Bereich gehen.
  - `songTidy`: Ein Kanten-Übergang ohne Marke geht. Darum gilt: Teil gelöscht = Übergang weg, und 1 Undo bringt beides zurück.
  - Teil verschieben (Marke behält ihre ID) = der Übergang wandert mit.
  - `markAction replaceBy` (Ersetzen durch): Der Übergang bleibt auf der Kante.
  - **KON / Zusammenfassen:** Kanten im Bereich verschwinden. Der Übergang klingt dann lose am Song-Schlag weiter (`at`), der Song klingt also gleich. [Zurückholen] hängt ihn wieder an seine Kante.
- **Abspielen:**
  - Der Scheduler merkt die Treffer je Fenster vor. `scheduleDrums` mischt sie in seine Zeitordnung, also gelten Choke und Monophonie wie bei Clip-Treffern.
  - Spuren ohne laufenden Clip spielen sie danach (`ueFlush`).
  - „ersetzt“ = Stummschalt-Fenster wie `mutedAt`.
  - Kit der Spur über `drumHit`. North-Pads spielen mit.
  - Das Song-Schleifen- und Sprung-Mapping (`songBeatOf`) wird befolgt, nachträgliche Clip-Wechsel planen die Übergänge neu.
  - Ohne `song.ue` läuft kein zusätzlicher Code, nur eine Abfrage `S.song.ue` je Fenster.
- **Bibliothek `UE_LIB`** mit 3 Platzhaltern: „Tom-Wirbel kurz“ (½ T), „Snare-Lauf“ (1 T), „Becken-Stopp“ (½ T, Becken + Kick auf der Eins, danach schweigt der Groove).
  - UE-C/D hängen ihre Einträge mit `ueLibAdd([...])` an. Format: `{id, tab, name, short, k, a, len, mode, notes | dn:[leicht, mittel, voll], stop?}`.
- **Test-API** (`SYNQUENZER.`): `ueLib, ueLibAdd, ueList, ueEdges, uePlace, ueMove, ueRemove, ueEverywhere, ueUnlink, ueSetLen, ueTwins, uePreview, ueBar, ueSheet, ueHits, ueInfo`.
- **Song-Leiste:** Damit [◆ ÜBERGÄNGE] Platz hat, sind ● und ▶ SONG etwas schmaler, hochkant 58 statt 76 px.
  - Mit [▲▼] und bei Breiten unter 420 px heißt der Knopf „ÜBERG.“.
  - Gemessen bei 428 × 926, 926 × 428, 428 × 650, 390 × 844 und 375 × 667: nichts abgeschnitten, alle Ziele ≥ 44 px.

## Fragen an Xander

- Der Platz für [◆ ÜBERGÄNGE] in der Song-Leiste geht von ● und ▶ SONG ab. Passt dir das, oder soll der Knopf woanders hin?
- Ganz schmal mit [▲▼] (375 × 667) passen keine acht Knöpfe. Dort liegt ◆ als runder Knopf unten rechts. Ist das okay?
