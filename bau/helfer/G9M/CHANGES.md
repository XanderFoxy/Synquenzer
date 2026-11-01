## 4.25.3 — Songtext/Silben (G9) in der Hauptlinie (G9-Merge, 01.11.2026)

App: `bau/helfer/G9M/index.html` (3 825 591 B; 4.25.2 3 678 856 B → **+143 KB**). Patch gegen 4.25.2: `patch-g9.diff`
(31 Stücke, 164 KB, fast nur der G9-Block selbst). Spec: `spec/n8/G9.md`, `spec/n8/G9-probe-ergebnis.md`.

### Was Xander bekommt
- Alles aus 4.25.2 bleibt (VS-L, VS-P, G1–G8, Hotfix H1–H8, K1–K4, 64-Takte-Clips).
- Dazu der Songtext-Stand aus G9D (`origin/g9-br-D`): Text-Modus im Marken-Editor, richtige Silbentrennung (Muster aus
  `/Synquenzer/vendor/g9/syl/`, mit SHA-256 geprüft, im Gerät in `synq-g9-v1`), [Ganzer Text], Marken nehmen den Text mit,
  Erkennungs-Ablauf ohne Sprachmodell ([Erkennen] bleibt ausgeblendet).

### Gebaut
1. **3-Wege-Merge** Basis `stage-ges2.html`, ours `R-4252.html`, theirs `G9STAGE.html` (`git merge-file --diff3`). 4 Konflikte, je beide Seiten erhalten:
   - `normPrefs`/Projekt-Einstellungen: `out.vs` mit `mel` (VS-L) **und** neue Zeile `out.g9` (§5.4).
   - Warp-Cache `WP.alt.set` / `WP.cache.set`: `buf: vpKick(ab)` (VS-P) **und** `map: w.map` (G9, Marken-Abbildung).
   - `Object.assign(SYNQUENZER, …)`: `S012_API`, `VP_API` **und** `G9_API`.
2. **Probe-Ergebnis G9-61** (iPhone 12 Pro Max, iOS 18.7):
   - Haptik-Labels im Text-Modus nur bei geschlossener Tastatur (war schon so: `#wpSheet.g9.hap:not(.g9dock) .g9hl`); Kommentar in `g9Dock` auf das Ergebnis umgestellt.
   - neu `g9Hap(G, kind)`: im Tastatur-Dock auf iOS **kein** `haptic()` (ein Label-Klick per Code tickt nicht, 1/2 = nein, und ein
     Label-Tipp schließt die Tastatur, 5 = zu); sonst wie bisher. Benutzt beim Wählen eines Abschnitts (`g9Select`) und beim Übernehmen (`g9Accept`).
   - Ziehen: kein Tick (war schon so: Label-Klick < 400 ms nach einem Zug wird verworfen).
3. `VERSION = '4.25.3'` (APP_CODE 4025003), `  live: true,` unverändert.
4. **Service Worker** `sw.js` (aus `main`): beim Aktivieren bleiben `synq-app-1` **und** alle `synq-g9-*` (`KEEP`); Diff `sw.diff`.
5. `vendor/g9/` (LIZENZEN.txt, `syl/de-x-syllable.wasm` 94 905 B, `syl/en-us.wasm` 21 027 B) → beim Ausliefern nach `/Synquenzer/vendor/g9/`.

### Geprüft (Chromium, Playwright)
| Lauf | Ergebnis |
|---|---|
| G9D `t2`–`t12` gegen G9M | 224/226; die 2 übrigen sind erwartet: t5 „VERSION-Zeile unverändert“ (jetzt 4.25.3, gewollt), t11 „Projekt-JSON gleich wie stage-ges2“ (4.25.2 hat eigene Felder, z. B. `vs.mel`) |
| t11 Regel 28 gegen **R-4252** | 12/12 (Marken, VS5b-Text, Quantisieren/Dehnen-Prüfsummen, Projekt-JSON Zeichen für Zeichen, altes Projekt laden) |
| t12 Zeiten gegen R-4252 | 6/6 (App-Start +1,9 %, Tastendruck-Vorschau 64 Takte Median 4,8 ms) |
| t3 (allein) | 41/41 (Tastendruck Max 3,2 ms; der eine Ausreißer 8,3 ms kam vom Parallel-Lauf, G9STAGE allein 3,3–3,8 ms) |
| Hotfix H1 / H3 / K (K1–K4) | 16/16 · 10/10 · 19/19 |
| neu `tests/t13-probe-dock.mjs` (Probe G9-61, Tastatur 394 px) | 5/5 (Gegenprobe G9STAGE: 4/5, 3 Code-Klicks im Dock) |
| Smoke (428×926, 926×428, 320×568) | 12/12 |
| Gesang-Take abspielen | 4/4 (Ausgang −23,9 dB; 4.25.2 gleich: −23,8 dB) |

### Markennamen
Der Patch bringt keine neuen. In 4.25.2 schon vorhanden und unverändert: „Kodamo“ (nur im ⓘ mit Pflichtsatz, N2-4b-02) und
„Nord Drum“ in alten Klang-Beschreibungen (bekannt seit vor 4.23.0); „MS 2000“ genau einmal.
