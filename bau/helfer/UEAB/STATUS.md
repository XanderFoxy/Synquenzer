# UE-A + UE-B – Stand

Datei: `bau/helfer/UEAB/index.html`. Basis ist `bau/snapshots/R-4300.html` (4.30.0), VERSION bleibt unverändert. Die Änderungen stehen in `patch.diff`.

## Tests

Alle Tests liegen in `tests/` und laufen mit Playwright + Chromium und Touch-Emulation. Aufruf: `sh tests/alle.sh`

| Test | Inhalt | Ergebnis |
|---|---|---|
| `ue-kern.mjs` | siehe unten | **21/21** |
| `ue-touch.mjs` 428 × 926 | siehe unten | **16/16** |
| `ue-touch.mjs` 926 × 428 | wie oben | **16/16** |
| `ue-touch.mjs` 428 × 650 | wie oben | **16/16** |
| `ue-layout.mjs` | 428 × 926, 926 × 428, 428 × 650, 390 × 844, 375 × 667: nichts abgeschnitten, Ziele ≥ 44, nichts rollt | **5/5** |
| `ue-schleife.mjs` | siehe unten | **4/4** |
| `ue-regress.mjs` | siehe unten | **9/9** |
| `ue-live.mjs` | siehe unten | **6/7** (UE-06 mit 8 Übergängen streut, siehe unten) |
| `ue-profil.mjs` | UE-06 mit dem CPU-Profiler | Messung, ohne Prüfwert |
| Rauchtests `bau/tests/` | `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke`, `v3-qmkp-smoke` | **alle grün**, gleiche Ausgabe wie 4.30.0, 0 Fehler |

**`ue-kern.mjs`** prüft:
- UE-01, UE-02 und UE-03 (Einfügen, Verschieben, Löschen + Undo)
- UE-04: Undo/Redo, Speichern/Laden, ohne Übergänge kein neues Feld
- UE-10, UE-11 und UE-19
- KON: Konsolidieren klingt gleich, Zurückholen hängt den Übergang wieder an
- GarageBand-Instrumental enthält den Übergang

**`ue-touch.mjs`** prüft:
- Leiste, UE-07 (≥ 44), Tastatur bleibt sichtbar
- UE-08: Vorhören 12–15 ms nach dem Tipp
- UE-09: Einrasten amber im selben Bild, daneben = 0 Änderungen
- Toast [Überall] [Nur hier]
- Chip verschieben, Griff-Länge, Chip heraus = löschen + Rückgängig
- Chip-Blatt

**`ue-schleife.mjs`**:
- Übergang in jedem Schleifen-Durchlauf, genau 16 Schläge Abstand
- Entfernen während ▶ wirkt ohne Stopp

**`ue-regress.mjs`** (ohne Übergänge wie 4.30.0):
- Offline-Render: Noten-Log gleich, Pegel ±0,02 dB
- GarageBand-Instrumental: gleiche Länge, Pegel ±0,02 dB
- Song nach Verschieben, Löschen, Kopieren, Einfügen, KON und Zurückholen gleich

**`ue-live.mjs`**:
- UE-05: Video offline = live, 22 = 22 Übergangs-Noten, 0 ms Abweichung, alle 162 Drum-Noten
- UE-06: ohne Übergänge gleich zur Basis
- North-Pad spielt den Übergang
- UE-04: Datei byte-gleich zu 4.30.0, ohne die Zufalls-IDs

Die Basis rendert selbst nicht bit-gleich zwischen zwei Läufen, weil Phasen und Rauschen zufällig sind. Darum vergleicht `ue-regress` das Noten-Log genau und den Pegel mit Toleranz.

### Abnahme §1.7, soweit A/B betroffen

- **UE-01** grün: 8 Fill-Treffer in den Schlägen 30–32, alle Quelle „ue“. Außerhalb davon 49 = 49 Noten, gleich.
- **UE-02** grün: Die UE-Daten sind nach dem Kit-Wechsel 808 → Gated 84 gleich. Es klingt mit dem neuen Kit.
- **UE-03** grün: Die Kante wandert 8 → 10. Teil verschieben nimmt den Übergang mit. Teil löschen nimmt ihn weg, 1 Undo stellt bit-gleich her.
- **UE-04** grün:
  - Undo/Redo und Speichern/Laden sind bit-gleich.
  - Ohne Übergänge ist die Datei gleich wie bei 4.30.0, nur die Zufalls-IDs `id`/`uid` unterscheiden sich, wie zwischen zwei Läufen der Basis.
- **UE-05** grün: Anzahl gleich, 0,000 ms Abweichung.
- **UE-06**:
  - Ohne Übergänge grün: 68,9 ms gegen Basis 70,2 ms.
  - **Mit 8 Übergängen knapp/streut**: Die Stoppuhr misst je nach Lauf +10 … +19 %, der CPU-Profiler etwa +5 %.
  - Basis gegen Basis streut auf dieser Maschine schon ±6 %.
  - Absolut sind das etwa 0,1–0,2 µs je Planungsfenster. Im Betrieb ist das nicht messbar, ein Tick plant ≈ 25 ms.
  - Die Übergangs-Treffer laufen durch dieselbe Zeitordnung wie Clip-Treffer.
- **UE-07** grün: Kacheln 96 × 62, Reiter ≥ 56 × 44, Chip 74 × 44, Knopf 60 × 44. Nichts ist abgeschnitten, nichts rollt.
- **UE-08** grün: Vorhören beginnt 12–15 ms nach dem Tipp.
- **UE-09** grün: Die Kante ist im selben Bild amber (255,178,46), der Fangbereich ist ±½ Takt. Daneben ablegen: 0 Änderungen, 0 Undo.
- **UE-10** grün: Ablegen ersetzt, genau 1 Undo.
- **UE-11** grün: Löschen + Toast „Rückgängig“, Rückgängig stellt bit-gleich her.
- **UE-19** grün: [Überall] legt n Kopien an, verknüpft. Eine Änderung ändert alle, [Nur hier ändern] löst eine Kopie. Je Aktion 1 Undo.
- **UE-23** (North, vorgezogen) grün: Ein North-Pad spielt denselben Übergang, das Noten-Log ist gleich.
- Folgende Punkte gehören nicht zu A/B: UE-12 bis UE-18, UE-20 bis UE-22 (Werks-Inhalte, Richtung, Breaks, Einwürfe, Blatt, Riser, Verknüpfer, Konsolidieren mit Einbacken). Die Daten und das Abspielen dafür stehen bereit: `stop`, `at`, `dens`, `dir`, `kit` und `baked` werden geprüft, gespeichert und bei `stop` auch abgespielt.

### Geprüfte Regeln

- Klang alter Projekte bleibt gleich (Regel 28): Ohne `song.ue` läuft nur die Abfrage `S.song.ue`.
- Chor, G-GB, KON und North laufen weiter.
- Keine verbotenen Wörter. „MS 2000“ kommt genau 1× vor, `  live: true,` genau 1×, VERSION ist 4.30.0.
- Es gibt keine Datenbank-Zugriffe.

## Für UE-C/D (paralleler Helfer)

- **Datenmodell** genau nach §1.5 (`song.ue`, Felder siehe CHANGES.md).
  - `ueNorm` lässt `k` in `fill|tom|build|crash|break|adlib|riser|down|rev|lauf` zu, dazu `stop`, `at`, `dens`, `dir`, `g`, `src`, `kit`, `baked`.
  - Pro Kante gilt höchstens ein Übergang, `adlib` ist davon ausgenommen.
- **Bibliothek:** `ueLibAdd([{id, tab: 'ue'|'break'|'adlib'|'lauf'|'eigen', name, short, k, a, len, mode, notes | dn: [leicht, mittel, voll], stop?}])`.
  - Die Reiter zeigen die Einträge sofort.
- **Abspielen:**
  - `mode: 'ersetzt'` schaltet den Groove der Zielspur im Fenster stumm.
  - `stop: [Spuren]` schaltet diese Spuren stumm (Breaks).
  - Einwürfe mit `at` statt `m` spielen und rücken mit.
  - Die Richtung (`dir`) wählt UE-C beim Anlegen, zum Beispiel über `uePlace(lib, mark, {dens})`.

## Offene Punkte

1. **UE-06 mit 8 Übergängen** liegt an der Grenze von +10 % und streut je nach Messart (Erklärung oben unter UE-06). Auf dem iPhone sollte man das einmal im echten Gerät mit 8 Übergängen anhören, auf Ruckler achten.
2. **Bildschirm (Regel 3):** [◆ ÜBERGÄNGE] in der Song-Leiste macht ● und ▶ SONG etwas schmaler. Bei 375 × 667 mit [▲▼] liegt ◆ unten rechts über dem Raster. Das sollte Xander bestätigen (siehe CHANGES.md, Fragen).
3. **Chip-Tipp** öffnet ein kleines Blatt (Länge, Vorhören, Überall/Nur hier, Entfernen). Das volle Nachbearbeiten-Blatt ist UE-E.
4. **„Zusammenfassen“ (S2) und KON:** Eine Kante im Bereich verschwindet. Der Übergang klingt dann lose am Schlag weiter (`at`), damit der Song gleich klingt. Ob er stattdessen eingebacken werden soll, regelt UE-H.
