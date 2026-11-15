# PRÜFUNG SPKFIX (unabhängig, 15.11.2026) – nichts repariert

Geprüft: `index.html` md5 22328bc0 gegen `basis.html` (rel-4700, 4.70.0, md5 9aa77532). Eigene Sonden in
`/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/pruef-mx3c-spkfix/` (`k-spkfix.mjs`, `k-zeit.mjs` im Kern; `p-loop.mjs`, `p-spkfix.mjs` in der Seite),
nacheinander, andere Fälle als `spkfix-test.mjs`.

## Pflicht (selbst gelaufen)
topdefs 26 / 0 doppelt / 0 Syntax · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „^  live: true,“ 1× · VERSION 4.70.0 · diff 0 `<`.

## (1) Neu-Rechnen der Audio-Ebene – wirksam, aber teuer
- Andere Richtung als im Paket-Test: Note 4 AUS der umgesetzten Ebene in eine neue Ebene: basis A1 bleibt, RMS 0,07513 bleibt;
  index A1 → A2, RMS 0. Note 1–3 bitgleich (Abw. 0), auch die verschobene Note (dm 2).
- Fremde Ebene geändert (orig → Bass): kein Neu-Rechnen, a6 bleibt, 4 ms.
- ↶ → A1, Audio bitgleich; ↷ → A2, bitgleich. Ein ↶-Schritt („In Ebene verschieben“).
- **Befund (mittel, Leistung):** 90-s-Lied, „In Ebene“ aus der Audio-Ebene: basis 19/20/21 ms, index 2230/2254/2221 ms (Median 2230 ms,
  ~110×). Hochgerechnet: ~4,5 s bei 3 min. Solange wartet die Masken-Op (das Neu-Rechnen deckt die ganze Ebene ab). „Nur die geänderten
  Streifen neu rechnen“ fehlt (Offen im Paket).

## (2) Notenname – teilweise wirksam
Reine Töne (Ebene „lead“), basis → index:
220 → 56 → **57** · 277,18 → 60 → **61** · 392 → 66 → **67** · Vibrato 220 ±40 ct → 56 → **57** · 220 + Rauschen 56/57/56 → **57/57/57** ·
226,4 (+50 ct) → 56 → 58 (Grenzfall, in Ordnung). Unverändert richtig: 587,33 → 74, 880 → 81, 220 mit starkem 2. Oberton → 57,
schwacher Grundton → 57, Dreieck → 57. Kein Rückschritt.
- **Befund (mittel):** Falsch bleiben in beiden: 146,83 Hz (soll 50) → 47 (3 Halbtöne), 213,8 Hz (soll 56,5) → 55 (Abweichung 1,73 >
  Fenster 1,6, die Korrektur springt nicht an), 98 Hz → 54 (180 Hz). Das Fenster 0,3–1,6 Halbtöne deckt größere Fehler des Rasters bei
  reinen Tönen nicht ab.

## (3) Nachbau im Dokument – wirksam, mit Nebenwirkung
- index: im Dokument true, nach dem Neuladen true (basis false/false).
- **Befund (mittel-niedrig):** Wird die Ebene per ↶ entfernt (nicht über „Ebene löschen“), bleibt `meta.spkKl.L1` stehen. Eine neue
  Ebene bekommt wieder die Kennung L1 („Hoch“) und zeigt den Nachbau der alten Ebene („Tief“). In basis gab es das nur in der Sitzung
  (Map), in index bleibt es auch nach dem Neuladen (`klL1` true, `spkKl` [L1]).

## (4) Loop → Matrix (Audio) – wirksam
- Ebene „Tief“ zuerst: → neue Spur „Tief“ Sz 1, nochmal → „Tief“ Sz 2, dann Original → neue Spur „Original“ (basis: alles auf „Original“ Sz 1–3).
- Reihenfolge Original, Bass, Bass: Original Sz 1, neue Spur „Bass“ Sz 1, Sz 2. 3× ↶ → wieder 6 Spuren, keine Audio-Spur übrig.
- Gewöhnlicher Weg (`imp1OrigT` ohne Loop-Schritt) unverändert „Original“.
- (niedrig, Code) Hat man die Original-Spur umbenannt, legt Loop → Matrix vom Original jetzt eine neue Spur „Original“ an (basis: erste
  Audio-Spur). Der Hinweis bei vollem Platz sagt weiter „Spur „Original““, auch bei einer Ebenen-Spur.

## (5) Klangkorn nach dem Laden, (6) Container-Import
Nicht selbst nachgestellt (Zeit). Code gelesen: (5) läuft einmal je `applyProject`, überspringt Quellen, die schon da sind. (6) Präfix
`spk:<id>:m` trifft nur die Masken-Streifen (andere Schlüssel: `:a :p :q :v :zn :zq`).

**Urteil:** (1)(3)(4) wirksam, (2) wirksam im Fenster 0,3–1,6 Halbtöne. Neue Kosten bei (1) (Sekunden je Masken-Op bei langen Liedern)
und dauerhaft veralteter Nachbau nach ↶ (3) sind die zwei Punkte, die vor der Freigabe entschieden werden sollten.
