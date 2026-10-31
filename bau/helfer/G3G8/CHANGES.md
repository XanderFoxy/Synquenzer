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

## Abnahme

(wird unten ergänzt)

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
