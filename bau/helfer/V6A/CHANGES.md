# V6a – Weicher Szenenwechsel (Basis 4.30.0, Version bleibt 4.30.0)

Xanders Wunsch: „Die Übergänge gehen von den einen Reglerwerten in die anderen.“
Beim Wechsel zwischen Szenen, Teilen und Song-Teilen gleiten die Klang-Regler (Filter, Hüllkurven, Pegel, Lautstärke, Pan, Hall, Echo …)
weich in die Werte des nächsten Teils, statt zu springen. Kein Knacks, kein abgeschnittener Ton. Alte Songs klingen genau wie vorher.

## Was neu ist (kurz)
- **◆ Klangzustand je Clip:** Jeder Noten-Clip einer Synth-Spur kann einen eigenen Klang haben (nur die Werte, die vom Grundklang abweichen).
- **Gleiten:** wählbar **aus · kurz · 1 T · 2 T · frei** – am Clip, am Teil (Matrix) und an jeder Song-Kante (Marken-Blatt).
  - **aus** = wechselt am Taktstrich (10 ms, ohne Knacks)
  - **kurz** = gleitet in den Taktstrich hinein (im Song 1 Schlag vorher, in der Matrix ab dem Tipp, mindestens 1 Schlag)
  - **1 T / 2 T** = gleitet ab dem Taktstrich 1 bzw. 2 Takte lang
  - **frei** = gleitet ab dem Taktstrich 1–16 Schläge (Taste daneben schaltet weiter: 1, 2, 3, 4, 6, 8, 12, 16)
- Die Kurve ist weich an Anfang und Ende (S-Kurve), Frequenzen gleiten in Oktaven, Pegel in dB – so wie man den Regler dreht.
- Stufige Werte (Welle, Fußlage, Filtertyp, FM-Operatoren) wechseln genau am Taktstrich mit der 30-ms-Stimmen-Überblendung.
- Live, im Video und in „Mit GarageBand aufnehmen“ (Instrumental) klingt das Gleiten gleich.

## Schritt für Schritt am iPhone

### 1. Einen Klang für eine Szene einstellen
1. In der Matrix den Clip von **Szene 2** antippen (oder spielen lassen).
2. Den Klang-Editor der Spur öffnen (**KLANG** unten in der Spur-Leiste).
3. Oben in der Kopfzeile, links neben ↶, die Taste **◆** antippen.
   → Die Taste wird amber und heißt **Grund-klang**, die LCD-Zeile sagt „**Bearbeite ◆** Clip Szene 2 · 0 Werte anders“.
4. Regler drehen wie immer (z. B. CUTOFF runter, HALL hoch). Die LCD-Zeile zählt mit: „3 Werte anders“.
5. Fertig? **Grundklang** antippen. → Hinweis „◆ gemerkt: 3 Werte anders“. In der Zelle von Szene 2 steht rechts oben ein kleines **◆**.
   Das ist **ein** Schritt für ↶ (Rückgängig).

Tipp: Editor schließen (✕) oder eine andere Spur wählen beendet das Bearbeiten genauso.

### 2. Ausprobieren in der Matrix
1. ▶ starten, Szene 1 läuft.
2. Szene 2 antippen. → Die Regler gleiten bis zum Taktstrich in den ◆-Klang („kurz“).
3. Szene 1 antippen. → Sie gleiten zurück zum Grundklang.

### 3. Wie lange es gleitet – am Clip
1. Den Clip mit ◆ lange drücken → Clip-Blatt.
2. Taste **◆ Klang · 3** (rechts neben „Löschen“) antippen → das ◆-Blatt öffnet sich.
3. Oben steht in Klartext, was anders ist, z. B. „Cutoff 2,4 kHz → 400 Hz · Hall 15 % → 30 %“.
4. Bei **Gleiten** wählen: **aus · kurz · 1 T · 2 T · frei**. Darunter steht, was die Wahl macht.
5. **◆ Bearbeiten** öffnet den Editor gleich im ◆-Modus; **✕ Löschen** nimmt den Zustand weg (↶ holt ihn zurück).

### 4. Wie lange es gleitet – am Teil (Matrix)
1. Teil-Taste unten lange halten → Teil-Blatt.
2. Zeile **Gleiten**: **Clip** (= wie am Clip eingestellt) · aus · kurz · 1 T · 2 T · frei.
   Gilt, wenn dieser Teil gestartet wird.

### 5. Wie lange es gleitet – an einer Song-Kante
1. Im Song die Teil-Marke (z. B. „REFRAIN“) lange halten → Marken-Blatt.
2. Zeile **Gleiten**: **Clip** · aus · kurz · 1 T · 2 T · frei. Gilt für den Übergang **in** diesen Teil.
3. ▶ SONG: An dieser Kante gleiten die Regler so, wie hier gewählt. Ein Schritt für ↶.

### 6. Sehen, was gerade gleitet
- **Modulationen** (Mod-Übersicht) zeigt bei einer Spur mit ◆ je Wert eine Zeile, z. B. „◆ Szene 2 · Cutoff · 2,4 kHz → 400 Hz“.
  Tipp = zum Regler, ✕ = diesen Wert aus dem ◆ nehmen (↶ holt ihn zurück).
- Spielt die Spur gerade einen ◆, hat die **◆**-Taste im Editor eine Amber-Kante und die LCD-Zeile sagt
  „◆ Zustand spielt · Regler zeigen den Grundklang“.

### 7. Video und GarageBand
- „Video“ und „Mit GarageBand aufnehmen“ (Instrumental) enthalten das Gleiten genau wie live – nichts extra einstellen.

## Was gleitet
- VA: alle Regler mit Bereich (Cutoff, Resonanz, Drive, Hüllkurven, Anteile, Pulsbreite, Fein, Unison-Verstimmung/-Mix/-Breite, Glide,
  LFO-Raten/-Tiefen, Klang-Pegel …).
- FM: die Makros (Helligkeit, Biss …); Operator-Pegel und Struktur wechseln am Taktstrich als ganzer Satz (30-ms-Blende).
- MS-2000-Platte: alle Timbre-Regler mit Bereich (Cutoff, Resonanz, EG, Pegel, Pan …); Welle, Filtertyp, Mod-Art am Taktstrich.
- Spur-Werte: Lautstärke, Panorama, Hall-Send, Echo-Send (auch im ECO-Klang).
- WT und ECO-Klang: die Klangwerte gelten ab der nächsten Note; Spur-Werte gleiten.
- Nur im Grundklang (nie im ◆): Modus (mono/poly/legato), Stimmenzahl, Klangerzeugung, Drive- und Chorus-Effekt der Spur.

## Bitte prüfen (Xander am iPhone)
1. Szene 1 → Szene 2 mit ◆ (Cutoff runter): hörst du das Gleiten bis zum Taktstrich, ohne Knacks? Und zurück?
2. Marken-Blatt einer Song-Kante: „2 T“ wählen – gleitet es zwei Takte lang in den neuen Teil?
3. „aus“: wechselt der Klang hart am Taktstrich, aber ohne Knacks?
4. Eine gehaltene Fläche über einen „kurz“-Wechsel: bleibt der Ton stehen, nur die Farbe ändert sich?
5. Video bzw. GarageBand-Instrumental eines Songs mit ◆: gleitet es dort genauso?
6. Passt die **◆**-Taste in die Kopfzeile (hoch und quer, auch auf der MS-2000-Platte), ist sie gut zu treffen?
