# Übersicht „Alle Apps“ – Pflege

Die Seite ist eine einzige Datei (`index.html`) und lädt nichts nach außer den Versionsnummern der Apps.
Die Texte stehen in zwei Dateien daneben; `einbetten.py` prüft sie und kopiert sie in die Seite.

| Datei | Was drin steht |
|---|---|
| `index.html` | Seite. In `APPS` je App: Name, Link, Farbe, Symbol, **`ver: '…'`** (bekannte Version) und `quelle` (woher die Seite die Version frisch liest). |
| `apps.json` | Je App: `kurz`, `ausprobieren` (2–4 kurze Sätze), `in_arbeit`, `brauche` (nur echte offene Punkte). Dazu `werkzeuge` (z. B. Ton-Post) und `weg` (bewusst nicht gezeigt, mit Grund). |
| `verlauf.json` | Je App die Wochen **Montag bis Sonntag**, neueste zuerst: `von`, `bis`, `version` (Stand am Ende der Woche), `neu` (1–5 Punkte, Neuestes zuerst). |
| `einbetten.py` | Prüft beide Dateien und schreibt sie in `<script id="daten">` in `index.html`. |

## Bei jeder neuen Fassung (Beispiel Synquenzer 4.83.0)

1. **Version wie bisher:** in `index.html` `ver: '4.82.0'` durch `ver: '4.83.0'` ersetzen (kommt genau einmal vor).
   Beispiel: `sed -i "s/ver: '4.82.0'/ver: '4.83.0'/" index.html`
2. **`verlauf.json`** → `apps.synq.wochen`:
   - Liegt die Fassung in der obersten Woche (gleicher Montag): Punkt **oben** in `neu` einfügen, `version` auf `4.83.0` setzen. Mehr als 5 Punkte: schwächsten streichen oder zusammenfassen.
   - Sonst eine neue Woche **ganz oben** anlegen: `{ "von": "2026-11-23", "bis": "2026-11-29", "version": "4.83.0", "neu": ["…"] }`.
3. **`apps.json`** → App `synq`: `version` angleichen, `ausprobieren` neu schreiben (was er jetzt testen kann), `in_arbeit` und `brauche` nachziehen. Erledigtes aus `brauche` löschen – leere Liste = kein gelber Kasten.
4. In beiden Dateien `"stand"` auf das heutige Datum setzen.
5. `python3 einbetten.py` – ohne diesen Schritt zeigt die Seite die alten Texte. Hinweise (z. B. „ver ≠ verlauf“) lesen; bei FEHLER wird nichts geschrieben.
6. Veröffentlichen: `index.html`, `icon-180.png`, `apps.json`, `verlauf.json`. Nicht nötig: `_test/`, `fotos/`.

Andere Apps genauso, mit ihrer `id` (`mischpult`, `wall`, `mv`, `atem`, `foto`, `ticke`, `tiktok`, `c2`, `dmx`, `kb`; Werkzeug `tonpost`).

## Sonderfälle

- **Neue App:** eine Zeile in `APPS` (index.html), ein Eintrag unter `haupt` (apps.json), ein Eintrag unter `apps` (verlauf.json), dann `einbetten.py`.
  Beginnt ein Punkt der Woche mit „Neue App: …“, steht er in der neuesten Woche automatisch oben unter „Neu – probier aus“.
- **Werkzeug nicht mehr gebraucht:** aus `werkzeuge` nach `weg` verschieben (mit Grund).
- **Die Namen der Wochen** („Dieses Wochenende“, „Voriges“, „Vorvoriges“, „Vor 3 Wochen“ …, „Älter“) rechnet die Seite selbst aus dem Datum. Die 5 neuesten Wochen haben einen Knopf, alles davor steht unter „Älter“.
- **Wege im Synquenzer** (zugeklappt unten): `WEGE_ZEIGEN = false` in index.html blendet den Block aus.
- **Prüfen:** `node _test/server.mjs 8766` starten, dann `nice -n 15 node _test/test.mjs` (Touch, hochkant/quer, hell/dunkel, Links, Konsole).

## Regeln für die Texte

Sehr kurz, ohne Fachwörter, keine Markennamen, keine Namen, keine persönlichen Daten, keine Emojis.
Die Seite ist öffentlich. Eine Wortliste außerhalb dieses Ordners kann mitgeprüft werden:
`python3 einbetten.py --verboten /pfad/ausserhalb/liste.txt`
