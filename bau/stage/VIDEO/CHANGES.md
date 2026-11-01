## 4.28.0 — Video zeigt die echte App

Basis: 4.27.0 (online, `bau/snapshots/R-4270.html`). Dazu fünf Video-Pakete: VV4-A, VV4-C/E, VV4-B/D, VV4-F, VV-LOGO.
Alles aus 4.27.0 bleibt (Chor-Gruppe G6+, Mitlese-Zeile G9e, Chor im Video). Klänge, Regler und gespeicherte Projekte bleiben gleich.

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

### Bitte prüfen (iPhone 12 Pro Max, Safari)
1. App laden → oben im Menü steht **4.28.0**.
2. Demo abspielen → **Matrix**: Bewegen sich die Pegel-Balken neben den Spurfarben im Takt? Spur stumm → ihr Balken bleibt leer.
3. Antippen links am Rand von **SONG ⇄** → geht die MASTER-Seite auf?
4. In den **Song** wechseln → Balken unter den Spurnamen, Master neben „TAKT“.
5. Song mit Melodie und Drums: **Menü → Video → 16:9 → Auto → Video erstellen.** Achte auf: Piano-Roll mit deinen Noten,
   Drum-Sequenzer mit Kick/Snare-Wechsel, Pegel im Song-Bild.
6. **Ende des Videos:** das letzte Bild wird dunkel, schon dabei kommt dein Logo – einmal, in der Mitte, ohne schwarzen Kasten,
   Rot kräftig. Kein Ton im Abspann.
7. Dasselbe in **9:16 → [Ganze App]**.
8. Takte markieren → ⋯ → Video → **[Spur …] → [Modulation]**: Nur Spuren mit echter Modulation stehen dort. Eine wählen → Video:
   Regler mit Mod-Ring.
9. Ein Video mit **Chor-Gruppe** an der STIMME: der Chor ist im Video zu hören (wie in 4.27.0).
10. Video-Blatt → **[Abspann-Logo]** aus → Video ohne Abspann. App neu laden → Wahl bleibt.
