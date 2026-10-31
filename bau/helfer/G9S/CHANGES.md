# CHANGES – Zweig g9-br-S (G9a Silben & Ausrichtung + G9b-V Erkennung ohne Modell)

Stand 31.10.2026. Grundlage: `spec/dirigent-spec-v3-nachtrag-8.md` (Teil A, B.5, Teil C) = `spec/n8/G9.md` Fassung 2.
**App-Datei unverändert** (Regel: DOM-freie Kerne vor H1, Einbau in G9d). Kein Supabase-Aufruf, kein Modell-Download, keine Marke im Code.

## Neu
| Datei | Inhalt |
|---|---|
| `bau/helfer/G9S/g9-kern.js` | `g9Make()` – G9a-Kern, toString-fähig für den VS5a-Worker: `syl`/`sylX`/`words` (§6.2), `feat` (§6.1), `costs`/`dpSeg`/`align` (§6.3), `pack`, `normLy` (§5.2), `lyText`/`fromVs5b` (§5.3), `view` (§5.1 Neu-Einrasten), `apply` (§6.4/§6.5: Wort, Ersetzen, Löschen, Einfügen [+], Nachrücken, ‹ ›, Verschmelzen, Trennen, Ganzer Text, Neu ausrichten, Marken-Haken), `preview` |
| `bau/helfer/G9S/g9-erk.js` | `g9ErkMake()` – G9b-V: `prep` (Hochpass 80 Hz, 16 kHz Polyphase/Kaiser, −3 dBFS), `strecken`, `verbinden` (0,3 s Nullen, Zeit-Karte), `fenster` (≤ 30 s, Schnitt 24–30 s), `plan`, `zurueck` (Rückrechnung + Schutz §6.6.7), `kuerzeSchleifen`, `sprachFilter`/`sprachWahl` (§6.6.4), `silben` (§6.6.8, Lücken füllen / Alles ersetzen) |
| `bau/helfer/G9S/SCHNITTSTELLE.md` | Schnittstelle für `g9-br-U` (Text-Modus), `g9-br-E`, G9d |
| `vendor/g9/syl/de-x-syllable.wasm`, `en-us.wasm` | Silben-Muster **unverändert** aus dem npm-Paket (Version laut Spec 6.1.0), SHA-256 in `vendor/g9/LIZENZEN.txt` (94 905 B / 21 027 B). Über npm bezogen (kein Modell, keine Freigabe F0 nötig). |
| `bau/helfer/G9S/tests/` | Node-Tests (`node alle.mjs`), Prüflisten `daten/silben-de.tsv` / `silben-en.tsv` (je 500 Wörter, von Hand getrennt, ohne Fremdtexte), synthetisches Korpus `korpus.mjs`, Ergebnisse `ergebnis-*.json` |

## Messwerte (Node 22, dieser Rechner)
| Punkt | Ziel | Ergebnis |
|---|---|---|
| G9-01 Silben DE mit Muster | Anzahl ≥ 98 %, Grenzen ≥ 95 % | **100 % / 99,8 %** (500 Wörter) |
| G9-01 Silben EN mit Muster | Anzahl ≥ 95 % | **100 %** (Grenzen 97,2 %) |
| G9-01 Nutzer-Bindestriche / Worker = Haupt-Faden | 100 % / 100 % | **100 % / 1000 von 1000** (+ Ausrichtung gleich) |
| G9-12 ohne Muster (Vokalkern-Regel) | DE ≥ 90 %, EN ≥ 85 %, `p: 0.5` | **DE 99,4 %, EN 99,8 %**, `p: 0.5` an allen Silben (EN 97 %: 15 Wörter aus der Ausnahme-Liste ohne `p`) |
| G9-02 richtige Marke / Median | ≥ 92 % / ≤ 25 ms | **99,9 % / 6 ms** (1021 Silben, 80 Phrasen DE+EN, 1324 VS5a-Marken) · VS5b „von links“ auf demselben Korpus: 23,9 % |
| G9-03 Melisma (3 Ton-Marken) | ≥ 90 % von 40 | **100 %** (VS5b: 0 %) |
| G9-04 Verschmelzen (Einsatz entfernt) | ≥ 90 % von 30 | **93,3 %** (VS5b: 0 %) |
| G9-05 Zeilen nach Atempause | 8/8 | **8/8** |
| G9-06 getipptes Wort / Vorschau = Ergebnis | ≥ 90 % / 100 % | **99,7 %** (330 Wörter) / **100 %** |
| G9-07 Verschieben/Verschmelzen/Trennen | Tabellen je 10 (3 mit Ton-Marken) | **70/70** inkl. Undo deep-equal, Toast ohne Marken-Rat |
| G9-08 Marken-Haken | | **40/40** (Verschieben folgt, Löschen → `j` bzw. `o`, 0 verloren, Setzen bewegt nichts) |
| G9-09 Rechenzeit ganz (300 Marken × 250 Silben) / lokal | ≤ 60 ms / ≤ 1 ms | **19 ms** (max 37) / **0,10 ms** (max 0,84) – Node, ohne 4×-Drossel |
| G9-10 Überzahl / Normalisieren | 50 `o`, 0 verloren | **9/9** (VS5b-Umwandeln 300→250: 50 `o`; kaputte Datei 5 Silben je Marke + fallende Zeiten: 0 verloren, Reihenfolge gleich, idempotent) |
| G9-11 Löschen / Einfügen | je 10 | **20/20** |
| Sicht / Neu-Einrasten (Kern von G9-54) | ≥ 95 % mit Marke, 0 verloren | **96,7 %**, 0 verloren, feste Silben unverändert, `ly` unberührt |
| G9-55 Tipps (synthetisch, ±25 ms am Vokal) | ≥ 3 Punkte | **0 Punkte** (99,9 % → 99,9 %, kein Raum) → **Tipp-Kosten bleiben aus** (`tipOn` nicht setzen) |
| Kosten-Abgleich (einmal, ±50 %) | | kein Teil gewinnt > 1 Punkt → **Spec-Werte bleiben**; empfindlich nur `longF` (×0,5: −7, ×1,5: −14 Punkte) |
| G9b-V Vorstufe 16 kHz (48 / 44,1 / 32 kHz) | Durchlass bis 7,2 kHz, Sperre ≥ 60 dB | Welligkeit **≤ 0,003 dB**, Sperre **82–84 dB**, Zeitlage 0 ms; Hochpass −3,0 dB @ 80 Hz, −12,3 dB @ 40 Hz; Spitze −3,00 dBFS |
| G9b-V Fenster-Regel | ⌈L/30⌉ ≤ chunks ≤ ⌈L/24⌉, ≤ 30 s | **9/9** (L 5 s … 300 s); 125-s-Take mit 60 s Stille → Strom 62 s, 3 Fenster, `plan` 1,5 s (Worker) |
| G9b-V Zeit-Karte hin/zurück | | Fehler **0 ms** |
| G9-21-Teil Silben auf richtiger Marke nach „Erkennung“ (erfundene Wortlisten, Wort-Zeiten ±0 / ±100 / ±250 ms) | ≥ 85 % | **100 / 100 / 98,6 %** |
| G9-22 Schutz (erfundene Wörter in Nullen und Rand) / Schleifen | 0 / 10 Fälle auf 2× | **0 von 23** / **10/10** (+ „la la la“ aus einem Wort bleibt) |

## Abweichungen und Entscheidungen (Regel 30, professionell entschieden)
1. **Merkmal `vf` + Kosten `skipVow` (0,8) und `onWeak` (2,0)** – neu gegenüber der Kosten-Tabelle §6.3. Befund im Korpus: Nach stimmlosen
   Konsonanten (s, f, sch, z, ch) setzt VS5a zwei Marken (Konsonant-Beginn und Vokal-Einsatz 70–100 ms später). Mit den Spec-Kosten
   (Rand 0,3 je Marke < Überspringen ≈ 1,7) schob die DP dann allen Text nach links: G9-02 **25,8 %**. `vf` = „Marke liegt am Vokal-Einsatz
   `von` der vorigen stimmlosen Marke (`vo` = 0), ≤ 160 ms“ – nur aus den Spec-Merkmalen abgeleitet. Eine `vf`-Marke kostet beim Überspringen
   wie eine reine Ton-Marke wenig (−0,8, ohne Anstiegs-Teil), und eine Silbe **auf** einer `vf`- oder reinen Ton-Marke kostet +2,0 (sonst landet
   eine überzählige Silbe dort statt verschmolzen). Ergebnis G9-02 99,9 %. `vf`-Marken sind keine Silben-Plätze (§6.1-Regel unverändert).
2. **Abschnittslänge für „Verschmelzen ×0,5“** = bis zur nächsten Einsatz-Marke (`vf`/Ton-Marken zählen zum Abschnitt), nicht bis zur
   nächsten Marke – sonst greift die Regel nach Konsonanten nie (G9-04 70 % → 93 %).
3. **YIN-Fenster vorwärts** ab dem Rahmen (nicht mittig): sonst gilt ein stimmloser Konsonant direkt nach einem Vokal als stimmhaft und `von` ist falsch.
4. **Tippen/Überschreiben ohne Folgetext:** Ende offen (keine Überspring-Kosten hinter dem Wort), sonst verteilt die DP ein Wort über alle
   9 Abschnitte (G9-06 54 % → 99,7 %). Mit Folgetext bzw. beim Ersetzen bleiben die Rest-Abschnitte Melisma (wie Spec).
5. **Mehrfaches ‹:** eine Silbe wandert nie vor die vorige; trifft sie deren Platz, bleibt sie dort verschmolzen, der Rest rückt weiter.
6. **Ganzer Text länger als Marken:** Die DP verschmilzt (1,2 … 1,8 je Silbe) statt `o` (3,0) zu setzen – so folgt es aus der Spec-Tabelle.
   300 Silben auf 250 Marken → 50 × `j`, 0 × `o` (nichts verloren). `o` entsteht beim VS5b-Umwandeln, Verschieben über das Ende, 4. Silbe je
   Marke und Marke-Löschen (G9-10 so geprüft). Falls Xander bei zu langem Text lieber rote Silben am Ende sieht: `over` < `merge` setzen.
7. **Englisch:** kleine Ausnahme-Liste (every, evening, idea, piano, …), stummes e vor -ly/-ful/-ment/-ness/-less und in some-/love-/care-…,
   -le nach Konsonant, -ed nur nach t/d, -es nach s/x/z/ch/sh/c/g, y als Konsonant vor Vokal nach Vokal/Wortanfang.
8. **Strecken (G9b-V):** zusätzlich zur Spec-Regel „Grund + 10 dB“ gilt „≥ Spitze − 30 dB“ und „≥ 100 ms stimmhaft“, damit Atmer und
   Übersprechen der Musik (−30 dB) keine Stimm-Strecke werden (G9-22).
9. Ein Wort in einem schon belegten Abschnitt fällt beim Lücken-Füllen **ganz** weg (keine halben Wörter).

## Was fehlt / Grenzen
- **K-G9 (a)/(b)** fehlen: kein Zugang zum öffentlichen Gesangs-Datensatz (Freigabe F0) und keine Takes von Xander (F7). Alle Ausrichtungs-
  Werte stammen aus dem **synthetischen** Korpus (c) mit echten VS5a-Marken. Echter Gesang ist schwerer (Vibrato, Legato, Atem) – G9-02/04
  müssen nach F0/F7 nachgemessen werden.
- Rechenzeiten in Node gemessen; Chromium mit 4×-Drossel (G9-09) und alle Bedien-/Geräte-Punkte gehören zu G9c/G9d.
- Kein Modell, keine Bibliothek: G9b-0/1/2 warten auf F0. `plan()` + `zurueck()` + `silben()` sind die Andock-Stellen für den Worker.
- Undo-Art `'ly'`, Normalisierer-Haken `tkExt().take`, `g9View`-Cache, `sq-g9-src` = G9d (App-Datei).

## Fragen an Xander
Keine neuen. (Vorgaben laut Spec D.2 gelten.)

## Bitte prüfen
Nichts am iPhone – dieser Zweig ändert die App nicht. Prüfbar für den Dirigenten: `cd bau/helfer/G9S/tests && node alle.mjs` (≈ 85 s, alles grün).
