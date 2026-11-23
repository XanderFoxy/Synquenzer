# ARPG – Stand (fertig)
Arp-Gate (Spur-Arp, Blatt „Arp · Spur“) 5–200 %; > 100 % = Legato (Noten überlappen). MS-Platte/Bit Mask unverändert (Grenze dort 100).

## Bau
`python3 apply.py <eingang 4.88.0, md5 695af050…> <ausgang>` → index.html (md5 siehe Ausgabe). Anker je 1×:
1. Kern (stiller Block sq-arp-src): `g=clamp(A.gate|0,0,100)` → `…m.gn?200:100`; Dauer-Zeile `dur=…` + `(g>100?(g-100)/100*sec:0)`
   und `arpgCut(s,t,notes)` (gleiche Tonhöhe: frühere Arp-Stimme endet beim Neuanschlag, Protokoll-Dauer mit).
2. `arp1Norm`: `g:n(a.g,5,200,80)`.
3. `arp1Render`: dieselbe Dauer-Regel + `arpgTrim` (gleiche Tonhöhe) → MIDI-Export, Festschreiben, Bild.
4. Blatt (stiller Block sq-arp1-src): `Math.min(200,…)` beim ›, Zusatz „Legato“ über 100 %.
5. Block `ARPG-BEGIN/END` (arpgCut, arpgTrim) direkt vor `function arp1Render(`.
Für ≤ 100 % wird nur `+0` addiert → bitgleich (Test A1).

## Kern-Test
`arpg-test.cjs` (Playwright, iPhone 428×926 + 926×428, touch). Server-Wurzel `srv/` mit `alt/index.html` (4.88.0),
`neu/index.html` (ARPG) und je version.json:
`cd srv && python3 -m http.server <port> --bind 127.0.0.1 &` dann `node arpg-test.cjs <port> [alt-pfad] [neu-pfad]`
(Pfade relativ zur Server-Wurzel, z. B. `node arpg-test.cjs 9050 alt/index.html andere/index.html` gegen eine andere Fassung).
Ergebnis: arpg-test.out (27 OK). A = Gate ≤ 100 gleich 4.88 · B = 100/150/200 gemessen, Klicks · C = Bedienung per Tipp + Fotos.
Hinweis: Audio-Puffer sind schon in 4.88 von Lauf zu Lauf nicht bitgleich (Zufallsphasen), deshalb Vergleich über Render-Protokoll/MIDI.

## Fotos
foto-vorher.png (4.88, Gate endet bei 100 %), foto-nachher.png (150 % „Legato“), foto-nachher-quer.png.
