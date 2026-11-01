# SX11 · Status

Basis `bau/snapshots/R-4300.html` (4.30.0) → `bau/helfer/SX11/index.html`, Diff `patch.diff`. VERSION unverändert (4.30.0).

## Tests (Playwright/Chromium, Touch, `tests/alle.sh`)
| Test | Ergebnis |
|---|---|
| `tests/sx-fassung.mjs` – Rollen + Vorschlag, [Leicht] (Noten-Log je Spur: Fläche/Lead aus, Drums ohne Becken/offene Hi-Hat, Hi-Hat 8 je Takt, Kick/Snare gleich, Rest gleich), [Voll] = exakt vorher, je 1 Undo-Schritt, Undo/Redo exakt, jede Fassung merkt sich ihre Auswahl (Bearbeiten), Variante kopieren → einfügen (Strophe, Outro, Voll zurück), Speichern/Laden byte-gleich, alte 4.30.0-Datei lädt/speichert byte-gleich und klingt gleich | **54/54** |
| `tests/sx-live.mjs` – Tipp per Finger im Lauf: leicht/voll am nächsten Taktstrich (Tipp-Takt spielt noch voll, keine Lücke, keine doppelten Noten), ↶ im Lauf ebenso; Knackser: Fläche über den Taktstrich ausgeschaltet → 2. Ableitung an der Grenze nicht größer als voll, Release statt Abriss (Offline-Render) | **24/24** |
| `tests/sx-kon.mjs` – Konsolidieren eines leichten Teils (klingt gleich, neuer Teil woanders = leichter Refrain, Zurückholen exakt mit Fassung), Video offline (Spur-Bilder: aus = kein Clip, Drums = dünner Clip), North-Kit, STIMME + Chor-Gruppe v2 bleiben und spielen in leicht wie in voll | **25/25** |
| `tests/sx-layout.mjs` – 428×926, 926×428, 428×650: ≥ 44 px, nichts abgeschnitten, Blatt im Bild, Seitenhöhe gleich, Tipps per Finger; Bilder `tests/out/` | **36/36** |
| Rauchtests `bau/tests/smoke`, `v3-mk8-smoke`, `v3-mk8b-smoke`, `v3-qa-mk5reg-smoke` | grün, keine Fehler |
| Regression alt (R-4300) gegen neu: KON `kon-block` 41, `kon-konsol` 42, `kon-save` 11, `kon-layout` 24; S0 `s0-acc` 38, `q3-s0-edit` 10, `q8-s0-live` 2 (Tests aus den Zweigen kon-block / helfer-s012) | alt = neu, alles grün |

Keine Konsolenfehler. Regeln: „MS 2000“ 1×, `  live: true,` 1×, VERSION 4.30.0, keine Markennamen, kein Netz, kein Supabase.

## Offene Punkte
- Hochkant ist das Marken-Blatt eine Zeile (48 px) höher; quer gleich hoch wie vorher.
- „Knackser“ ist offline gemessen (gleicher Weg wie jeder Spurwechsel im Song); live nur über das Noten-Log geprüft.
- Nicht auf echtem iPhone geprüft – **Xanders Okay fehlt**.
