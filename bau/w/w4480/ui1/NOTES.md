# UI1 – Bedienung aufräumen, Guide, Komfort

## Für Xander

- **Menü ≡ → „Wo finde ich …?“** steht ganz oben. Tipp ein Wort ein, zum Beispiel „Swing“, „Fill“, „Hall“ oder „Video“. Ein Tipp auf das Ergebnis springt direkt an die richtige Stelle, ein gelber Rahmen zeigt sie. „Alle ▾“ listet alle 84 Funktionen. Dazu gibt es 5 Kurz-Anleitungen mit „Zeig es mir“: Klang formen, Groove bauen, Song bauen, Mischen & Mastern und Video. Eine Karte führt dich Schritt für Schritt (◀ ▶, ✕).
- **Hochkant stehen VA und FM wieder nebeneinander**, daneben ▾ für WT, die Platte, Bit Mask und North. Seit 4.36 war das nur ein einzelner Chip, weil die fünfte Taste (Bit Mask) nicht mehr in die Zeile passte. Quer bleibt alles wie bisher.
- **◆ ÜBERGÄNGE ist jetzt vollständig.** Es gibt 29 neue Vorlagen, verteilt auf die Reiter:
  - Übergänge: Fill mit Becken, Tom-Lauf, Disco-Fill, 32tel-Wirbel, Clap- und Snare-Aufbau, Open-Hat, Ghost-Snares
  - Breaks: Drop 2 Takte, Stille 1 Takt, Nur Kick, Halbe Zeit, Nur Hi-Hat, Tom-Groove, Schlag + Pause
  - Einwürfe: Becken, Clap ×3, Cowbell, Flam, Shaker
  - Verknüpfer: Tom-Lauf abwärts, Snare-Lauf, Kick-Aufbau, Rim → Toms

  Die Drums-Füller aus dem Werkzeugkasten sind auch dabei.
- **Bit Mask hat im Gerät zwei neue Tasten: [KLÄNGE] und [?].** Unter KLÄNGE findest du alle Werksklänge nach Kategorie. Ein Tipp lädt den Klang und spielt ihn sofort an; mit ↶ ist der alte Klang wieder da. [?] erklärt kurz, was Voice, Value, Param, Masken, Seq/Env, Init, Compare und Write tun.
- **Mehrere Spuren auf einmal:** Halte eine Spur und tippe weitere an. Wischen auf einer der gewählten Spuren regelt dann alle zusammen, mit einem ↶. Die Leiste hat Stumm/Laut, Solo und ✕. Wischen, Halten-Solo und Rand-Ziehen funktionieren wie bisher.
- **Mein Vorschlag „Leucht-Look“:** Menü › Bedienung › Leucht-Look, ab Werk aus. Aktive Tasten glühen dann wie LEDs, laufende Clips leuchten weich grün, und Kopfzeilen bekommen einen Farbbalken. Es ändert sich nur der Look, nichts verschiebt sich.

## Technik

- **Ein Block `UI1-BEGIN … UI1-END`** steht direkt nach `/* SX4-END */`.
  - 695 Zeilen kommen dazu, 0 Zeilen sind geändert: `diff basis.html index.html` zeigt nur `>`.
  - Alle Namen haben das Präfix `ui1`/`UI1`.
  - Das CSS wird als eigenes `<style id="ui1-css">` aus dem Block eingefügt; am Haupt-Style ändert sich nichts.
- **Einhänge-Zeilen** (je 1 Zeile):
  - `buildSynthEd`: `ui1EdHook(sh, i, mkQ)` steht nach `edHeadFit`.
  - `sx4Down`: `if (ui1MultiDown(e, el, i)) return;` ist die erste Zeile.
  - `openMenu`: `ui1MenuHook(sec, colL, s6, row, btn, goto)` steht vor `m.classList.add('open')`.
  - Ende der API-Liste: `Object.assign(SYNQUENZER, {ui1: UI1_API})` und `ueLibAdd(ui1UeLib()); ui1BmTrim(); ui1GlowInit();`.
- **Klangerzeugung:**
  - Hochkant ersetzt `ui1EngFit` den Chip von `edHeadFit` durch `VA │ FM │ WT │ ▾`. Passt das nicht, nimmt er die schmale Form, dann `VA │ FM │ ▾`, sonst bleibt der Chip.
  - Als „passt nicht“ gilt: Spurname auch nur um Bruchteile gekürzt (Zwischenraum `.sh-sp` = 0), Zeile läuft über oder eine Taste ragt hinaus.
  - ▾ ist die Taste von `engChip` (gleiche Liste, gleiches Undo „Klangerzeugung“).
  - Auf 428 px mit „SYNTH 1“ passen nur drei Tasten, deshalb steht WT in ▾ (bzw. „WT ▾“, wenn WT aktiv ist).
- **Guide:**
  - `ui1Entries()` hat 84 Einträge: `{n, w, d, s, go, q}`. `go` öffnet die Stelle, `q` findet das Element (Selektor, Text oder Funktion), gesucht wird in der obersten Ebene zuerst.
  - Der Rahmen `.ui1ring` ist `position: fixed` und `pointer-events: none` und folgt dem Element.
  - `ui1Tour`: 5 Anleitungen, 4–8 Schritte, die Karte `.ui1tour`. Hochkant liegt sie oben oder unten, quer neben der Stelle.
- **Übergänge:** `ui1UeLib()` liefert 29 Vorlagen mit den Ids `ui1-…`.
  - Breaks setzen `stop` auf die Drum-Spur und spielen ihre eigenen Schläge.
  - Ein Fill ersetzt nur seine eigenen Pads (FX1-Regel).
  - Es gibt kein neues Projektfeld.
- **Bit Mask:**
  - [KLÄNGE] und [?] sind `.ui1bt` in `.sh-tabs`. Das Blatt ist `openPop(…, {sheet})`.
  - Ein Tipp ruft `soundEdit(loadPreset)` auf (ein ↶) und dann `previewStart` über die Spur.
  - Pegel: Säge-Bass und Puls-Bass lagen 4–8 dB unter den anderen und hatten noch Luft. Ihr VOL wurde angehoben (`UI1_BM_VO`: 79 → 99 und 63 → 94).
  - Gespeicherte Projekte tragen ihren eigenen Klang und klingen deshalb gleich.
- **Gruppe:**
  - Gespeichert wird nur zur Laufzeit (`UI1.sel` = Spur-Objekte, wie SX4-Solo), nie im Projekt.
  - Die Lautstärke ist ein Undo `group` aus `sound`-Einträgen; Stumm ist ein Undo `group` aus `sx4m`.
  - Solo nutzt `SX4.solo`. Die Leiste liegt über `#strip`.
- **Look:** `body.ui1glow` arbeitet nur mit `filter: drop-shadow`, `box-shadow` und Farbe. Gespeichert wird er in den Geräte-Einstellungen (`uiPrefs().ui1glow`).

## Tests

- **`ui1-test.mjs`: 38/38 OK** (Protokoll in `ui1-test.log`).
  - Guide:
    - 12 Suchbegriffe finden die richtige Funktion und springen hin.
    - Alle 84 Einträge springen hochkant hin, 5 auch quer.
    - Ablauf per Touch über Menü, Suchfeld und Ergebnis funktioniert.
    - Alle 33 Anleitungsschritte zeigen ihre Stelle.
    - „Zeig es mir“ per Touch: 8 Schritte, ✕ und Tasten ≥ 44 px.
  - Klangerzeugung:
    - Vorher/nachher geprüft.
    - FM per Touch geht, ↶ auch.
    - ▾ öffnet die Liste, WT lässt sich wählen.
    - Für alle 5 Klangerzeugungen ist der Name ungekürzt.
    - Quer ist alles identisch zu 4.47.
  - Übergänge:
    - Kacheln = Bibliothek.
    - Alle 37 Vorlagen lassen sich setzen; Treffer bzw. Pause, ↶ gehen.
    - „Clap ×3“ per Touch gesetzt.
  - Bit Mask:
    - Blatt, Kategorie und Tipp funktionieren: Klang geladen, ein ↶, Vorhören läuft.
    - [?] zeigt die Anleitung.
    - Alle 42 Werksklänge gerendert: keiner stumm, Spitze ≤ −1 dBFS.
    - Pegel: Median −19,3 dB, Spanne −28,6 … −17,4 dB.
  - Gruppe (zwei Finger per CDP-Touch):
    - Halten + Antippen ergibt eine Gruppe; das Halte-Solo wird dabei zurückgenommen.
    - Wischen regelt alle drei Spuren gleich, mit einem ↶.
    - Stumm/Laut, Solo und ✕ gehen.
    - Die alten Gesten (Wischen, Halten-Solo, Mehrfach-Solo, Rand-Ziehen) gehen weiter.
  - Leucht-Look:
    - Ab Werk aus.
    - Box-Vergleich von Matrix, Editor, Song und Menü, hochkant und quer: 0 Verschiebungen.
    - Lässt sich per Touch einschalten und bleibt nach dem Neuladen an.
  - Ein altes Projekt bleibt Zeichen für Zeichen gleich.
  - Konsole: 0 Fehler.
- **Pflichtprüfungen:**
  - `topdefs`: 0 doppelte Namen, 0 Syntaxfehler.
  - `dupkeys`: 0.
  - `smoke.mjs`: errors [].
  - Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×.
- **Fotos:**
  - `ui1-p-kopf-vorher-nachher.png`
  - `ui1-p-guide.png`
  - `ui1-p-bitmask.png`
  - `ui1-l-leuchtlook.png` (quer, Szene läuft)

## Offen

- **Reiter „Eigene“ in ◆ ÜBERGÄNGE ist noch leer.** Dafür fehlt „Fill-Chip → Als eigene Vorlage sichern“; das braucht eine Einhänge-Zeile in `ueChipSheet`.
- **Hochkant passt WT bei 428 px nicht mehr direkt in die Reihe**, es steht unter ▾. Ganz direkt ginge es nur mit noch schmaleren Tasten (< 30 px), was ich nicht wollte.
- **Leise Werksklänge, die VOL nicht mehr anheben kann:**
  - Holz-Pluck −28,6 dB und Rausch-Welle −25,5 dB stehen schon auf VOL 99. Sie lassen sich nur über das Rezept lauter machen.
  - Masken-Klavier, Clavi-Bit und Arp-Glitzer schlagen bis −1 dBFS an und sind deshalb in der Spitze begrenzt.
- **Beim Zusammenführen:**
  - GR2 (Genre-Fills) hängt sich ebenfalls mit `ueLibAdd` an die Liste. Die Kacheln zeigen dann automatisch alles; die Ids `ui1-…` kollidieren nicht.
  - Die globalen Zugänge Mix/Master/Remix (UI1-Wunschliste) liegen bei MX2/GR2. Der Guide springt heute über FX › MASTER bzw. Menü › Song; die neuen Knöpfe kommen als Einträge dazu.
