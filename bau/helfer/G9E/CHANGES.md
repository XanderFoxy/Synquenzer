## 4.25.5 — Songtext sichtbar: Mitlese-Zeile, Vorlage beim Einsingen, Silben an den Noten (G9E, 01.11.2026)

App: `bau/helfer/G9E/index.html` (4.25.3 3 825 591 B → 4.25.5 3 844 130 B, **+18 KB**). Patch gegen `bau/snapshots/R-4253.html`: `patch.diff`
(`patch` ergibt genau `index.html`). `VERSION = '4.25.5'` (APP_CODE 4025005), `  live: true,` unverändert.

### Was Xander bekommt
- **Mitlese-Zeile (Karaoke)** oben im Tastatur-Bereich, sobald ein Take Songtext hat: aktuelle Zeile groß, nächste Zeile klein darunter
  (quer: daneben). Gesungene Silben bernstein, die klingende Silbe hell hinterlegt, Wort für Wort ohne Bindestriche.
  Läuft beim Abspielen (Szene und Song), im Vorzähler (erste Zeile steht schon da) und beim Einsingen.
  Die Tasten rücken nach unten – nichts wird verdeckt. Knopf **[TEXT]** links in der Leiste: aus → schmale Leiste „TEXT · Mitlesen aus“,
  antippen = wieder an. Die Wahl bleibt gespeichert (Geräte-Einstellung `lyBar`). Ohne Songtext im Projekt gibt es keine Leiste.
- **Vorlage beim erneuten Einsingen:** Wird auf einem Platz eingesungen, dessen alter Take Text hat, zeigt die Leiste diesen Text
  synchron mit (Knopf zeigt „VORLAGE“), im Song genauso für die alte Song-Stimme.
- **Text an den Noten:** In der MELODIE-Rolle (Szene) und in der Song-Melodie steht die Silbe klein unter dem Anfang der Note, die zur
  gleichen Zeit beginnt; im Tonhöhen-Editor des Gesangs (G2) unter dem Block. Nie über dem Griff rechts, Schilder überlappen sich nicht.
  „In Melodie umwandeln“ (G5) gibt die Silben an die neuen Noten mit (Noten-Feld `sy`, nur wenn es Text gibt).

### Technik
- Zeit: hörbarer Schlag (wie TAKT) → Clip-Lage (`R.cstart`, Schleife) bzw. Song-Lage (`songBeatOf`, `song.vox`) → Sekunde im klingenden Puffer
  (`a.in + …`) ↔ Silben-Anker `take.ly.s[].t` durch die Zeitkarte, die gerade klingt (`tkHeardMap`) = wie gehört (Dehnen/Quantisieren).
  Nur der Teil `a.in…a.out` des Takes. VS5b-Text ohne `ly`: Silbe k → Marke k (wie VS5b).
- Zeilen: `w: 2` aus [Ganzer Text]; sonst Atempause ≥ 1,2 s; zu lange Zeilen werden gleichmäßig an Wortgrenzen geteilt (nach Breite).
- Leistung: Silben/Zeilen je Take im Cache (`LYB.cm`), je Bild nur eine Binärsuche; DOM nur bei Zeilen-/Silbenwechsel.
  Gemessen (Chromium, CPU 4× gedrosselt): `lyFrame` Median 0 ms, 95 % ≤ 0,8 ms, Max 1,4 ms; gestoppt 0 DOM-Änderungen.
- Noten-Feld `sy` (≤ 24 Zeichen, nicht bei Drums) in `normNoteExtras`/`NOTE_X` – additiv; Projekte ohne Text bleiben Zeichen für Zeichen gleich.
- Test-API: `lyBar()`, `lyToggle(on)`, `lyPrep()`, `lyNotes(s|null)`, `lyG2()`.

### Geprüft (Chromium, Playwright) – `tests/`
| Lauf | Ergebnis |
|---|---|
| `t-ly.mjs` (Silbe ±1 Bild über 4 Takte, Zeilenwechsel, An/Aus gemerkt, Vorzähler + Einsingen mit Vorlage, Song, Quantisieren, Rolle, `sy`, G2, Layout 428×926 / 926×428 / 390×844 / 320×568 / 844×390, Leistung, ohne Text) | 37/37 |
| `smoke.mjs` (3 Formate, Version, Wiedergabe, kein Querscrollen, Konsole) | 12/12 |
| `take-play.mjs` Regel 28 (Klang): Take abspielen G9E −23,8 dB · R-4253 −23,8 dB | 4/4 · 4/4 |

Bildschirmfotos: `bilder/` (P/L abspielen, Vorzähler, Einsingen, Song, Rolle, G2).

### Markennamen
Keine neuen (Patch fügt keinen hinzu); „MS 2000“ weiter genau einmal.
