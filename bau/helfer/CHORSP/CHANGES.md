# CHOR-SPUREN (Paket CHORSP) – was neu ist, Schritt für Schritt am iPhone

Basis: App 4.30.0 (`bau/snapshots/R-4300.html`). Die VERSION ist unverändert.
Code-Block `/* CHS-BEGIN … CHS-END */` (alles mit Präfix `chs…`). Dazu kommen 34 kurze Einhängepunkte in bestehenden Zeilen (siehe `patch.diff`) und ein CSS-Block `CHS-CSS`.

---

## 1. Background-Gruppe als echte Spuren (Clip-Matrix und Song)

**Ausprobieren:**
1. STIMME-Clip ✎ → [Chor] → einen Stil antippen, z. B. **Gospel**.
2. Blatt schließen. In der Clip-Matrix steht jetzt **unter der STIMME-Zeile** die Zeile **BACKGROUND** (Farbstreifen links, „3 Stimmen“).
3. Darunter steht je Chorstimme eine eigene Zeile: Farbfeld mit Ziffer und Name wie im Chor-Blatt (Terz rot **3**, Quinte grün **5**, Sexte blau **6** …), darunter der Pegel.
   Die Zelle der Szene zeigt die Noten der Stimme in ihrer Farbe.
   - **Tipp auf die Zelle** öffnet die Noten dieser Stimme.
   - **[M]** rechts schaltet die Spur stumm (ein Undo-Schritt).
   - **Tipp auf den Namen** öffnet das Mischpult (siehe unten), die Spur ist dort hervorgehoben.
4. **Tipp auf BACKGROUND** klappt die Gruppe zu (dann bleibt nur die eine Zeile) bzw. wieder auf.
   Eine neue Stimme (Stil, Spur teilen) klappt die Gruppe von selbst auf. Liegt die STIMME auf der zweiten Seite (▲▼), blättert die Matrix dorthin.
5. **Song** (SONG ⇄): Unter STIMME stehen die Zeilen **BG** und je Stimme eine Zeile mit den Noten der Song-Stücke.
   - Tipp auf ein Stück öffnet die Noten dieser Stimme.
   - Tipp auf den Namen links öffnet das Mischpult.
   - Tipp auf **BG** klappt die Gruppe auf oder zu.

**Mischpult „Background“** (Tipp auf das Regler-Symbol rechts in der BACKGROUND-Zeile):

| Regler / Knopf | Was er tut |
|---|---|
| **Lead** | Lautstärke des Hauptgesangs (derselbe Wert wie der STIMME-Regler) |
| **Background** | der ganze Chor lauter oder leiser (−24 … +12 dB) |
| **Gesang gesamt** | Lead und Background zusammen |
| **[Gekoppelt]** (Standard an) | Der Lead-Regler nimmt den Chor im gleichen dB-Schritt mit; der Abstand bleibt. Aus: Lead und Background regeln unabhängig. Wieder an: kein Sprung, der aktuelle Abstand bleibt. |
| **[Chor an/aus]** | A/B mit und ohne Chor |
| je Spur **S / M / Pegel / Pan / ♪** | Solo, Stumm, Pegel (−24 … +12 dB), Pan (zum Pan der Stelle addiert), ♪ öffnet die Noten |
| **[Spur teilen · Gegenstimme]** | wie „Als Chor-Stimme duplizieren → Ganze Spur“: eine Kopie deines Gesangs als neue Spur „Gegenstimme n“, sofort sichtbar in Matrix und Song |
| **[Blatt „Chor“]** | das bekannte Chor-Blatt der gewählten Szene |

- Doppeltipp auf einen Regler setzt ihn auf 0 dB bzw. Mitte.
- Jede Geste ist **ein** Undo-Schritt (beim Loslassen).
- Gespeichert wird nur additiv an der STIMME-Spur: `chor.db`, `chor.sum`, `chor.cpl/ref`, `lanes[].db/pan`. Ohne diese Felder klingt alles wie in 4.30.0.

**Messwerte** (aus `tests/chorsp.mjs`):

| Fall | Ergebnis |
|---|---|
| Lead −6 dB, gekoppelt | Background −6,00 dB (Rechnung und laufender Knoten) |
| Lead −6 dB, entkoppelt | Background 0,00 dB |
| Wieder koppeln | Sprung 0,005 dB |
| Gesang gesamt −5 dB | Lead −5,00 dB und Chor −5,00 dB |
| Background −6 dB | wirkt nicht auf die Lead-Kette |

## 2. Gesangs-Editor steuerbar (Noten-Editor und Marken-/Wellen-Editor der STIMME)

Unten in der Leinwand liegt jetzt ein **Lineal** mit Taktzahlen. Links sitzt **[▶/■]**, rechts **[Loop]**, beide 44 × 44.

1. **Tipp aufs Lineal** spielt ab diesem Schlag. Bei kleinem Zoom springt der Tipp auf den Takt, im Song immer auf den Takt.
   - Es läuft die ganze Szene mit Begleitung, Gesang und Chor im richtigen Takt.
   - Im Song-Stück läuft der Song ab diesem Takt.
   - Ein grüner Laufstrich zeigt, wo es gerade spielt.
2. **Auf dem Lineal ziehen** markiert einen Bereich, und der **Loop** ist an (gelb).
   - [▶] spielt dann den Bereich immer wieder, im Takt und ohne Neustart.
   - [Loop] schaltet ihn aus oder an.
3. **[■]** stoppt.
4. **Tonhöhe ändern:** Note antippen (wählen), dann ziehen oder ▲▼.
   - Sobald die neue Fassung gerechnet ist, hörst du die Note kurz allein, auch bei einer Chorstimme.
   - Im laufenden Loop hörst du die Änderung im nächsten Durchgang live.
5. **Zoom:**
   - zwei Finger auseinander oder zusammen;
   - Doppeltipp auf eine leere Stelle zoomt hinein;
   - Doppeltipp aufs Lineal: hinein bzw. zurück auf „ganz“.
   - Der Zoom-Knopf funktioniert wie bisher.
6. **Schwenken:** ein Finger auf der Fläche.
7. **Nichts verrutscht versehentlich:**
   - Eine Note verschiebt sich nur, wenn sie vorher gewählt war oder ¼ s gehalten wird. Sonst schwenkt der Finger.
   - Bei zwei Fingern verschiebt der erste Finger nichts mehr.

## 3. Fehler behoben: Auge in der Chor-Legende

Was Xander sah: Das Auge beim **grauen** Chip blendete scheinbar nichts aus.

Ursache:
- Die Unisono-Stimme (grau, Ziffer 1) hat denselben Ton wie der Lead und lag deshalb **genau unter** dem Lead-Block, also unsichtbar.
- Die grauen Lead-Balken im Editor einer Chorstimme hatten gar kein Auge.

Neu:
- **Unisono** ist als gestrichelter Rahmen in Spurfarbe um den Lead-Block sichtbar. Das Auge blendet ihn wirklich aus und ein.
- **Lead-Chip „L Lead“** mit Auge im Editor einer Chorstimme und einer Gegenstimme. Dort liegt der Lead jetzt grau dahinter (vorher fehlte er bei Gegenstimmen).
- Der Chip der Stimme, die gerade bearbeitet wird, hat kein (wirkungsloses) Auge mehr.
- Das Auge ist **je Clip gemerkt**: Es bleibt nach Schließen, Wiederöffnen und Neuzeichnen und gilt auch für die Tonhöhenlinien im Wellen-Editor.
