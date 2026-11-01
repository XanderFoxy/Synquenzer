# HARM – Status (01.11., App 4.30.0)

**Nicht fertig, solange Xander nicht „okay“ gesagt hat.** Alles unten ist von Tests geprüft, nicht von Xanders Ohr.

Abgabe in `bau/helfer/HARM/`: `index.html` (App), `patch.diff` (gegen R-4300), `CHANGES.md` (Regressions-Tabelle,
Ursache, neue Standards), `STATUS.md`, `tests/` (`alle.sh`), `menue-harmonie.png` (Menü › Harmonie, 428 px breit).

## Kurz
- **Keine Versions-Regression** zwischen 4.25.2 und 4.30.0: das Noten-Log des Prüf-Songs ist in allen elf Snapshots bitgleich,
  Offline-Render = Live.
- „Manchmal fremd“ hatte drei Ursachen: (a) Wechsel „Sofort“ als Standard → Skala wechselt mitten im Lauf; (b) „Eine Skala“
  war in gespeicherten Projekten aus → Durchgänge blieben fremd; (c) **Fehler:** die verzögerte Tonart-Analyse machte aus
  einem Dur-Lauf mit chromatischem Durchgang (F → F♯ → G) „Lydisch“, danach rutschte der Lauf unter jedem Akkord eine Stufe
  (unter E: C → D♯). (c) ist seit ≤ 4.5.0 im Code, hörbar als Stufen-Rutsch seit 4.6.0. Behoben (`harmKeyNotes`).
- Neue Standards für **alle** Projekte: Wechsel = Takt, Eine Skala an, Stärke 100 %, Durchgangstöne einrasten. Alte Projekte
  werden **einmal** umgestellt (Merker `harmStd`), danach bleibt jede bewusste Wahl. Drums werden weiter nie mittransponiert.

## Tests (`tests/alle.sh`, letzter Lauf: rc = 0)

| Test | Inhalt | Ergebnis |
|---|---|---|
| Regeln | genau 1× `  live: true,`, verbotene Wörter 0, „MS 2000“ 1×, VERSION 4.30.0, Format 5, keine neuen Netz-/DB-Zugriffe | grün |
| HARM-T1 `t-laeufe.mjs` | Standard-Werte; 3 Akkordfolgen (Dur/Moll, i–VI–iv–V mit E-Dur); jede Lauf-/Arpeggio-Note in der Skala ihres Takts; kein Oktavsprung; Kontur bleibt; Live-Tastatur + MIDI | **15/15** |
| HARM-T2 `t-wechsel.mjs` | Wechsel genau am Taktstrich (Tastatur, MIDI, Gnadenzeit), letzter Schlag vor dem Wechsel noch in der alten Skala, Szenen-/Clip-/Teil-Wechsel (Teile-Leiste + Teil-Akkordzeile), ▶ Ab hier; keine doppelten/hängenden Noten | **17/17** |
| HARM-T3 `t-umstellung.mjs` | 4.30-Projekt → HARM: einmal umgestellt + Hinweis; neu laden: keine zweite Umstellung, kein zweiter Hinweis; bewusste Wahl bleibt; Datei-Import; Merker einer neueren Fassung bleibt; Neu/Leer/Demo; Menü-Hilfetexte; Knöpfe ≥ 44 px; „Takt“ gewählt | **16/16** |
| HARM-T4 `t-drums.mjs` | Drums (auch North-Pad) nie gestimmt – Song, Live, MIDI; Gegenprobe „mittransponieren“ an → gestimmt | **7/7** |
| HARM-T5 `t-bezug.mjs` | Durchgang stuft den Bezug nicht mehr um (auf-/abwärts, a-Moll); Gegenproben echtes Lydisch, e-Moll; derselbe Lauf unter E in 3 Durchläufen gleich (C → E) | **7/7** |
| `regression.mjs` | Prüf-Song × 3 Folgen × (Eine Skala aus/an) über R-4252 … R-4300 + HARM, Offline-Render, Live altes Projekt | Tabelle in CHANGES.md, `tests/regression.md` |
| `bisekt.mjs` | Bezug-Fehler über 21 ältere Snapshots (4.5.0 … 4.30.0) | Tabelle in CHANGES.md |
| bau/tests `smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | Rauchtests | grün (HARM und R-4300) |
| bau/tests `v3-qa-gp2a-os` | Eine Skala im Song, eigene Clips, NOTEN unter Träger | HARM **10/10** · R-4300 7/10 (OS2, OS3 rot – Ursache c) |
| bau/tests `v3-v2c2-onescale` | V2c′-Abnahme | HARM 24/27 · R-4300 25/27 – Unterschied nur V2c′-04 „Demo/gespeichert → aus“, **bewusst überholt** (jetzt an) |
| bau/tests `v3-qa-v2c2reg-os` | Vergleich R-4300 ↔ HARM (Aufnahme/FANG unter Träger, Stopp, Standards) | Aufnahme, Clip, Gehörtes, FANG, Stopp: „same“. **Bewusst anders:** `info` (Wechsel now → bar) und `car` in recCar/recCarChr: der Akkord wird bei Schlag 1 gedrückt, der Test liest bei Schlag 3 die Tastatur-Skala – mit „Takt“ gilt F erst ab Schlag 4. Datei-Szenario fehlt in beiden (alte Testdatei nicht im Repo) |

Bewusst überholte bzw. alte rote Erwartungen: siehe CHANGES.md § 5 (V2c′-04 Demo; V2c′-04 „bitgleich zu 4.5.2“ und V2c′-06
„Version 4.5.3“ sind schon in R-4300 rot, weil die Vergleichsdatei 4.5.2 fehlt bzw. eine alte Versionsnummer erwartet wird).

## Bitte prüfen (auf dem iPhone, mit Kopfhörern)
1. Ein **altes Projekt** mit Läufen öffnen: kommt einmal der Hinweis „Harmonie-Standard: Wechsel am Takt · Eine Skala an“?
   Beim zweiten Öffnen darf er nicht mehr kommen.
2. Szene mit Lauf spielen, in TRANSPONIEREN mitten im Takt einen Akkord drücken: Der Lauf läuft bis zum Taktstrich in der
   alten Skala weiter, der neue Akkord setzt genau auf der Eins ein – kein Ruck, keine doppelte Note.
3. Lauf mit chromatischem Durchgang (z. B. C D E F **F♯** G A, das F♯ etwas länger) unter E-Dur und unter B♭ – klingt der Lauf
   jetzt bei jedem Durchlauf gleich und beginnt unter E auf **E** (vorher manchmal auf D♯)?
4. Akkordfolge Am – F – Dm – **E** in a-Moll: Unter E-Dur nimmt die App die E-Dur-Tonleiter (F♯, C♯, D♯). Klingt dir das an
   der Stelle richtig, oder soll ein Lauf unter dem Dur-Akkord der fünften Stufe in Moll lieber „harmonisch Moll“ spielen
   (E F G♯ A H C D)? Das ist **nicht** geändert – nur eine Frage für die nächste Runde.
5. MIDI-Keyboard: Akkord kurz nach der Eins gedrückt (Gnadenzeit 60 ms) zählt für diesen Takt – fühlt sich das gut an?
6. Drums: beim Transponieren bleiben Kick/Snare/Hats gleich (auch North-Kit); nur mit Menü › Harmonie › Drums
   „Mittransponieren“ werden sie gestimmt.
7. Menü › Harmonie: Hilfetexte unter „Wechsel“ und „Durchgangstöne“ verständlich? (Bild: `menue-harmonie.png`)
