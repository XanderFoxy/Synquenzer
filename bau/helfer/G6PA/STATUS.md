# STATUS G6PA (G6+0 und G6+a) – Zweig `g6p-a`

**Stand:** fertig gebaut, Abnahmen grün (Prüfrechner, Chromium). Nicht am iPhone geprüft.
Basis `bau/snapshots/R-4252.html` (4.25.2), VERSION unverändert. Kein Supabase-Aufruf (`max_format = 6` setzt Xander, Spec §4.4).

| Abnahme | Ergebnis |
|---|---|
| G6P-01 ZIP mit selbst gesungener Stimme → leeres Profil → Import | ✓ Take da, PCM gleich, geladen (Gegenprobe: 4.25.2 verliert ihn) |
| G6P-02 Scharf, Blatt zu → Lead hörbar; Laden; Render | ✓ (Render: `g6RenderHold`, Video kommt erst mit 4.26) |
| G6P-03 Zwei Clips, ein Take → getrennte Knoten; 0 erneute Ladevorgänge | ✓ |
| G6P-04 Render bitgleich | ⚠ nur indirekt: 4.25.2 hat keinen Offline-Render des Chors (Chor fehlt dort im Offline-Weg). Geprüft: Knotenwerte, v1-Code und Konstanten gleich |
| G6P-05 Alte Projekte zeichengleich, Format 5, v1-Hall-Kopplung | ✓ leer, Demo, v1-Chor, v1 + selbst gesungen (gegen 4.25.2 im selben Browser) |
| G6P-06 v2 alle Felder: Laden, Kopieren, Duplizieren, ZIP, Verlauf, Song-Stimme; Format 5/6 nach Inhalt | ✓ (Szene kopieren/Teil konsolidieren nicht eigens – gleicher Kopierweg) |
| G6P-07 Format 6 in 4.25.2 → Banner + Sperre; Autosave mit format 6; Format 7 sperrt | ✓ |
| G6P-08 Geteilte Stücke beim Aufräumen | ✓ |
| G6P-09 Unbekannte Spur, Farben, Namen, Spur-Grenze 8, Undo `chorlanes` | ✓ |
| G6P-K1 Kopplung (Daten + Faktor): −6 dB → −6 dB; getrennt unverändert; wieder an ohne Sprung | ✓ (hörbar erst mit G6+c) |
| Smoke 320/390/844 px, keine Konsolenfehler; v2 ohne G6+c spielt (v1-Näherung) | ✓ |

**Tests:** `cd bau/helfer/G6PA/tests && node smoke.mjs && node g6pa.mjs` (Ergebnis `tests/g6pa.out`).

**Entscheidungen (bitte beim Zusammenführen beachten):**
1. „Selbst singen“ bleibt nach dem Schließen des Blatts **scharf** (nur Solo endet), sonst wäre ● danach wirkungslos. Die Führung wird beim Aufnahme-Start wieder solo.
2. Kopplung liegt an der STIMME-Spur (`chor.cpl/ref/off`), gilt für alle Stellen.
3. Autosave/Verlauf schreiben `project.format = 6` nur bei Chor-Gruppen-Inhalt, damit auch eine alte App aus dem Autosave sperrt.

**Bitte prüfen (Xander, nach dem Zusammenführen, 2 min):** Projekt mit Chor und selbst gesungener Stimme als ZIP exportieren, auf einem zweiten Gerät öffnen → die Stimme klingt. Chor-Blatt: „Selbst singen“ antippen, Blatt schließen → Lead ist wieder zu hören.
