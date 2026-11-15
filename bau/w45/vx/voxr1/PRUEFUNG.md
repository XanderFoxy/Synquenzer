# VOX-R1 – unabhängige Prüfung (Teil 3/3, Stand index.html 06:10)

Geprüft: index.html gegen basis.html und Plan §3 / §5 P4 / §8.4. Nichts repariert. Messungen mit eigenen Skripten
(Node-Kern aus index.html, App im Browser über Playwright/CDP), echte Gesangs-Takes A/B/C, Fehler synthetisch eingesetzt.
Rechner während der Messung stark belastet (Lastmittel 10–15): Zeiten nur als Verhältnis alt/neu belastbar.
Skripte und Rohwerte: `../voxr1-pruef/p-node.mjs` (+ `p-node.json`), `../voxr1-pruef/p-app.mjs` (+ `p-app.json`).

**Ergebnis: so nicht auslieferbar.** Zwei Fehler in der Bedienung (Abbrechen, „nur Entferntes“), die P4-Abnahme ist bei Plopps und
Klicks nicht erreicht, und saubere Takes werden beim Zischen verändert. Die Zeile ist sichtbar neu, deshalb ist ohnehin vorher ein
Funk-Vorschlag nötig.

## Befunde

### schwer

1. **„Abbrechen“ beim Anwenden bricht nicht ab, die Rechnung startet sofort neu.**
   Messung (App): Anwenden → Rechnung läuft (renders 1) → Abbruch auf dem Weg des Knopfs (`vjob.abort`) → nach 60 ms renders 2,
   die Zustandszeile zeigt weiter „rechnet die neue Fassung … 0 % (Abbrechen geht)“, der Knopf heißt weiter „Abbrechen“, `take.vr1`
   bleibt gesetzt. Die Rechnung ist 2–4 s später fertig. Ursache: `vr1Render` setzt im Fehlerfall `key: '-'`, `finally` ruft
   `tkPlayBuf` → `vr1Proc` sieht einen anderen Schlüssel und startet `vr1Render` neu. Stoppen lässt es sich nur mit ↶.
   Der eigene Test prüft den Abbruch nur über `window.__vr1.job(...)`, nicht über den Knopf.

2. **„nur Entferntes“ spielt vor allem die Stimme, nicht das Entfernte.** Der Hochpass (läuft auf jeder Stufe) wird als
   `x − hochpass(x)` hörbar gemacht. Der Phasengang des Filters lässt dabei den Grundton und die tiefen Obertöne fast voll durch.
   - Take A (tiefe Stimme), nur Hochpass 80 Hz: das „Entfernte“ liegt bei 80–160 Hz nur **−1,5 dB**, bei 160–320 Hz **−4,6 dB**
     und bei 320–640 Hz **−12,3 dB** unter dem Original, insgesamt **−6,2 dB**. Mit einem nullphasigen Hochpass zum Vergleich wären es
     −19,1 / −28,8 dB.
   - Ganze Kette „mittel“ auf sauberen Takes A/B/C: 80–300 Hz −2,8 / −3,7 / −6,5 dB, 300 Hz–4 kHz −13,4 / −12,8 / −12,1 dB.
   - Als Sänger hört man unter „nur Entferntes“ die eigene Melodie, nur dumpf, und muss glauben, die Reinigung nimmt die Stimme weg.
     Abhilfe: das Entfernte des Hochpasses ohne Phasenfehler bilden (nullphasig oder als Betrag) oder je Schritt sammeln.

3. **P4-Abnahme bei Plopps und Klicks nicht erreicht** (vom Bauenden selbst gemeldet und hier bestätigt).
   - Plopps 3/10 gefunden (Ziel ≥ 9), Obertöne an den Stellen bis 6,3 dB geändert (Ziel ≤ 1 dB).
   - Eigene Gegenprobe: 10 Tiefstöße aus 45/90 Hz, 40 ms, +6 dB über dem Gesang → **0/10** gefunden, mit und ohne Hochpass davor.
   - Klicks Take A 16/20 (Ziel ≥ 18), Überstand nach der Reparatur 7,5 dB (A) und 3,2 dB (B), Ziel ≤ 3 dB.
   - Raumton: 2 von 5 Lücken außerhalb ± 3 dB, Klangfarbe 2 von 5 außerhalb ± 4 dB.
   - Der Schritt „Plopps“ ist damit praktisch wirkungslos, läuft aber trotzdem (s. Befund 7).

### mittel

4. **Zischen läuft auf jedem Take und ohne Bezug zum Gesangspegel.**
   - Der Assistent schaltet Zischen schon bei `sibFrames > 20` (≥ 100 ms Zischen im ganzen Take) ein. Das trifft auf alle drei
     sauberen Takes zu (Zisch-Anteil 2,4 / 0,2 / 0,5 %). Die Befund-Zeile nennt dort kein Zischen, trotzdem wird entzischt.
   - Bezug ist das Gesangsband **desselben Rahmens**. Steht ein „s“ an einer Wortgrenze oder in einer Pause, wird es immer um die
     volle Stärke gesenkt, egal wie leise es ist. Gemessen (mittel, je 6 eingesetzte „s“):
     - in Pausen bei 0 / −6 / −12 / −18 / −24 dB unter dem Gesang: jedes **−5,7 dB**;
     - auf Vokalen nur bei 0 dB (−3,9 bis −5,6 dB), ab −12 dB fast 0.
   - Der Plan (§3 Nr. 12) sagt „Schwelle −6 dB relativ zum Gesangspegel“: leise „s“ müssten bleiben.
   - Auf sauberen Takes verlieren bei „mittel“ 179 von 3050 (A), 67 von 885 (B) und 92 von 1171 (C) 10-ms-Rahmen mehr als 3 dB
     über 5 kHz. Das ist ein Lispel- und Dumpf-Risiko gerade bei guten Aufnahmen.

5. **Doppelt entzischt.** Nach „Anwenden“ entzischen auch die Gesangs-Effekte (bei neuen STIMME-Spuren an, Entzischer 4 dB) die
   schon gereinigte Fassung noch einmal.
   - App: Kette Zischen −6 dB auf 1567 ms, danach Gesangs-Effekte −4 dB auf 3251 ms.
   - Node (8 „s“): Kette allein −5,7 dB, Kette und Gesangs-Effekte zusammen **−9,0 dB**.
   - Im Plan ist Schritt 12 der Entzischer der Gesangs-Effekte; es sollte also nur einen geben.

6. **„nur Entferntes“ ohne „Gesang reinigen“ spielt „Sauber“.** Bei SÄUBERN 60 % und nicht angewandter Reinigung ist der Knopf
   freigegeben. Nach dem Antippen ist er gedrückt (`aria-pressed=true`), die Wiedergabe ist aber **bitgleich mit „Sauber“**
   (`clPlayHash` gleich). Ursache: `vr1Proc` liefert ohne `take.vr1` nichts, und `vr1ClPaint` gibt den Knopf schon bei `m.cl` frei.

7. **Plopp-Fehlalarme auf sauberen Takes beschädigen gesungene Töne.** Prüfen meldet auf dem sauberen Take A 2 Plopps und auf C 1.
   Der Assistent repariert sie auf jeder Stufe.
   - Take A, 19,26 s: liegt auf einem gesungenen Ton (Grundton 202 Hz, unter der Grenze von 250 Hz). Das Band 0–250 Hz wird
     **−7,4 dB** leiser, gesamt −2,6 dB, über 30 ms. Das ist ein hörbares Loch im Grundton.
   - Take C, 9,8 s: −3,7 dB im Tiefband in einer lauten Stelle (−21,9 dBFS).

8. **Reihenfolge mit SÄUBERN entspricht nicht Plan §3.** Die Kette rechnet auf der Ausgabe von SÄUBERN (`vr1Base`).
   - Bei SÄUBERN > 0 % läuft deshalb: Echo-Abzug → Entrauschen → Hochpass 80 Hz → Klicks → Plopps → Brummen → Hochpass 80 Hz
     (ein zweites Mal) → Atmer → Raumton → Zischen.
   - Der Plan verlangt: Klicks vor dem Entrauschen, Plopps vor jedem Hochpass, Brummen vor dem Rauschen.
   - Der Planschritt 6 „Hochpass umsortieren“ ist damit nicht umgesetzt: der vorhandene Hochpass von SÄUBERN bleibt vorn.
   - Belegt aus dem Code. Messen lässt sich die Wirkung nicht, weil die Plopp-Erkennung schon ohne Hochpass nichts findet (Befund 3).

9. **Die vorhandenen Gesangs-Effekte rechnen etwa doppelt so lange.** Rendern eines 3-min-Takes mit der Vorgabe „Gesang Synthpop“:
   - alt 3,3 / 4,0 s, neu **6,5 / 7,8 s** (× 1,9–2,0, abwechselnd gemessen, unter Last);
   - der spektrale Entzischer allein 4,0 s je 3 min unter Last (der Bauende nennt unbelastet 1,2 s).
   - Jede Regler-Änderung in den Gesangs-Effekten rechnet den ganzen Take neu, auf dem iPhone (× 3) also mehrere Sekunden länger
     pro Änderung. Das steht in keiner Leistungs-Abnahme. Nach Regel (1) „schnelle Seite“ ist das zu klären.

10. **Speicher wächst ohne Grenze.** `VXR1.ver` hält je Take die Fassung **und** „nur Entferntes“ als AudioBuffer und wird nie
    geleert (kein `ver.delete`).
    - Gemessen: 20,2 MB je Minute Take (44,1 kHz, mono).
    - Ein 3-min-Take sind 61 MB, 8 angewandte Takes ≈ 485 MB, zusätzlich zu den Speichern von SÄUBERN und den Gesangs-Effekten.
    - Für das iPhone (§8.4) ist das kritisch. „nur Entferntes“ ließe sich bei Bedarf aus Roh − Fassung bilden.

11. **A/B bei angewandter Fassung schaltet nicht sofort um.** Mit den Gesangs-Effekten an löst das Umschalten auf „nur Entferntes“
    ein neues Rendern der Gesangs-Effekte für den ganzen Take aus.
    - Gemessen: 1 Render, 4,5 s unter Last. So lange spielt weiter die saubere Fassung.
    - Das Entfernte läuft dabei auch durch Kompressor, EQ und Hall.
    - „Ohne Neustart“ gilt nur für das 10-s-Vorhören.

12. **Atem als Stilmittel wird beim Zischen mitgesenkt.** 6 eingesetzte Atmer (Rauschen 1–6 kHz, 300 ms, −29,6 dBFS), die Prüfen
    nicht als Atmer zählt (0):
    - über 5 kHz **−5,5 dB** (mittel) und −8,0 dB (stark), 1–16 kHz −2,3 dB;
    - auch „Atmer lassen“ schützt sie nicht, weil der Entzischer sie als Zischlaut nimmt.

### leicht

13. **Rückfall Hauptfaden:** `vr1EssCore` gibt nur alle 512 Rahmen ab. Eine Scheibe dauert bis **212 ms** (60-s-Take, unter Last).
    Das Versprechen „Scheiben ≤ 8 ms“ gilt für Zischen nicht. Der Rückfall der Gesangs-Effekte (`local()`) rechnet ebenfalls am Stück.
    Das betrifft nur Fälle ohne Worker.
14. **Plan-Lücken (vom Bauenden genannt):**
    - Der Regler 0–100 % ist noch nicht die Gesamtstärke.
    - Unter Mehr ▾ gibt es je Schritt nur an/aus, nicht die 1–2 Regler.
    - Brummen ist nur offline eingehängt; `vr1HumLive` wird nirgends benutzt.
15. **Zustandszeile außer Sicht:**
    - Hochkant mit Mehr ▾ offen liegen „Zischen“ und die Zustandszeile mit Befund, Fortschritt und Abbrechen unter 926 px (voxr1-blatt.png).
    - Quer 926×370 sitzt die letzte Zeile am Rand.
    - Der Test „nichts ragt aus dem Bild“ prüft nur den rechten Rand.
16. **Assistent-Faktor:** Die Klick-Empfindlichkeit bei „stark“ ist 7 statt 6 (4 × 1,5 + 1). Das ist eine kleine Abweichung von
    „× 0,5 / 1 / 1,5“.
17. **Lücken im eigenen Test:**
    - Der erste Atmer-„Touch“-Test setzt `weg` per API (`vr1BreathAct`), nicht per Touch.
    - Es gibt keinen Speichern/Laden-Durchlauf.
    - Abbrechen wird nur über die API geprüft (s. Befund 1).
    - Keine Prüfung, dass saubere Takes unverändert bleiben (s. Befunde 4, 7, 12).
    - Keine Messung, was „nur Entferntes“ enthält (s. Befund 2).

## Bestätigt (in Ordnung)

- **Abweichung zu basis.html:** nur Einfügungen, nämlich der Block VOXR1-BEGIN…END (792 Zeilen) und 5 Ein-Zeiler mit typeof-Schutz
  und `/* VOXR1 */`. Sonst ist alles gleich.
- **Pflicht:**
  - topdefs: 26 Skripte, 7600 Namen, 0 doppelt, 0 Syntaxfehler (nur mit `NODE_PATH=/opt/node-tools/node_modules`);
  - dupkeys 0;
  - „MS 2000“ 1×, „^  live: true,“ 1×;
  - VERSION 4.68.0 in beiden Dateien.
  - Smoke habe ich nicht erneut laufen lassen; im Browser-Lauf gab es keine Konsolenfehler.
- **Keine Marken- oder Datensatz-Namen:** In Block, Test, NOTES, LOG und JSON gibt grep 0 Treffer.
- **Konsonanten-Anschläge** (Take B, ganze Kette „stark“): 14 Anschläge, Median 0 dB, schlimmster −2,5 dB, keiner über 3 dB.
- **Speichern/Laden in derselben Sitzung:** `take.vr1` steht im Projekt und ist nach `applyProject` wieder angewandt. Einen kalten
  Neustart mit Laden aus IDB habe ich nicht geprüft.
- **Gesangs-Effekte:** Der Entzischer ist im Worker spektral; das Aussehen ist unverändert.
- **Nicht geprüft** (Zeit): das Antippen einer Atmer-Marke auf Nebenwirkungen in der vorhandenen Editor-Geste (der Haken ruft kein
  `stopPropagation`), Chor und Spektral-Seite.

## Empfehlung vor dem Funk-Vorschlag

Zuerst Befund 1, 2 und 6 beheben (sie betreffen die Bedienung). Dann 4, 5 und 7: Saubere Takes dürfen nicht schlechter werden,
und es soll nur einen Entzischer geben. Danach folgen 3 (Abnahme) sowie 8 bis 11 (Plan-Reihenfolge, Leistung, Speicher).
