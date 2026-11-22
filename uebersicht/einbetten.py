#!/usr/bin/env python3
"""Prüft apps.json + verlauf.json und schreibt sie als Kopie in index.html (<script id="daten">).

Aufruf im Ordner der Übersicht:   python3 einbetten.py
Nur prüfen, nichts schreiben:     python3 einbetten.py --nur-pruefen
Zusätzlich Wortliste prüfen:      python3 einbetten.py --verboten /pfad/ausserhalb/liste.txt   (ein Wort pro Zeile)

Bei Fehlern wird nichts geschrieben (Rückgabe 1). Hinweise (z. B. Version passt nicht) halten nichts auf.
"""
import datetime as dt
import json
import pathlib
import re
import sys

ORT = pathlib.Path(__file__).resolve().parent
fehler, hinweise = [], []


def lies(name):
    try:
        return json.loads((ORT / name).read_text('utf-8'))
    except Exception as e:  # noqa: BLE001
        fehler.append(f'{name}: kein gültiges JSON ({e})')
        return {}


apps, verlauf = lies('apps.json'), lies('verlauf.json')
html = (ORT / 'index.html').read_text('utf-8')

# Versionen und IDs aus der APPS-Liste in index.html (dort steht ver: '…' wie bisher)
html_ids = re.findall(r"\{ id: '([\w-]+)'", html)
html_ver = dict(re.findall(r"\{ id: '([\w-]+)'[^\n]*?ver: '([^']*)'", html))
for i in set(html_ids):
    if html_ids.count(i) > 1:
        fehler.append(f'index.html: id {i} steht mehrfach in APPS')

haupt = apps.get('haupt', []) if isinstance(apps, dict) else []
werkzeuge = apps.get('werkzeuge', []) if isinstance(apps, dict) else []
haupt_ids = [a.get('id') for a in haupt]
for a in haupt:
    i = a.get('id')
    if not i:
        fehler.append('apps.json: Eintrag ohne id')
        continue
    if i not in html_ids:
        hinweise.append(f'{i}: fehlt in APPS (index.html) – Seite zeigt es mit Standard-Symbol')
    for feld in ('ausprobieren', 'in_arbeit', 'brauche'):
        if not isinstance(a.get(feld, []), list):
            fehler.append(f'apps.json {i}: {feld} muss eine Liste sein')
for i in html_ids:
    if i not in haupt_ids:
        hinweise.append(f'{i}: steht in APPS, aber nicht in apps.json (keine Texte)')

bekannt = set(haupt_ids) | {w.get('id') for w in werkzeuge}
for i, a in (verlauf.get('apps', {}) if isinstance(verlauf, dict) else {}).items():
    if i not in bekannt:
        hinweise.append(f'verlauf.json: {i} ist keine bekannte App')
    vorher = None
    for w in a.get('wochen', []):
        try:
            von, bis = dt.date.fromisoformat(w['von']), dt.date.fromisoformat(w['bis'])
        except Exception:  # noqa: BLE001
            fehler.append(f'verlauf.json {i}: Woche ohne gültiges von/bis: {w}')
            continue
        if von.weekday() != 0:
            fehler.append(f'verlauf.json {i}: {w["von"]} ist kein Montag')
        if bis != von + dt.timedelta(days=6):
            fehler.append(f'verlauf.json {i}: {w["bis"]} ist nicht der Sonntag nach {w["von"]}')
        if vorher and von >= vorher:
            fehler.append(f'verlauf.json {i}: Wochen nicht „neueste zuerst“ ({w["von"]})')
        vorher = von
        n = len(w.get('neu', []))
        if not 1 <= n <= 5:
            hinweise.append(f'verlauf.json {i} {w["von"]}: {n} Punkte (gedacht sind 1 bis 5)')
    # Version: index.html (ver) – apps.json (version) – neueste Woche in verlauf.json
    neueste = (a.get('wochen') or [{}])[0].get('version', '')
    hv = html_ver.get(i)
    av = next((x.get('version', '') for x in haupt if x.get('id') == i), None)
    if hv is not None and neueste and hv != neueste:
        hinweise.append(f'{i}: index.html ver \'{hv}\' ≠ neueste Woche in verlauf.json \'{neueste}\'')
    if hv is not None and av and hv != av:
        hinweise.append(f'{i}: index.html ver \'{hv}\' ≠ apps.json version \'{av}\'')

# Alle sichtbaren Texte (ohne Link-Adressen)
def strings(x, schluessel=''):
    if isinstance(x, dict):
        return [s for k, v in x.items() if k != 'link' for s in strings(v, k)]
    if isinstance(x, list):
        return [s for v in x for s in strings(v, schluessel)]
    return [x] if isinstance(x, str) else []


texte = '\n'.join(strings(apps) + strings(verlauf))
# Keine Emojis als Grafik
if re.search('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]', texte):
    fehler.append('Emoji in den Texten gefunden')
# Wortliste (liegt bewusst nicht in diesem Ordner)
if '--verboten' in sys.argv:
    pfad = pathlib.Path(sys.argv[sys.argv.index('--verboten') + 1])
    klein = texte.lower()
    for wort in (z.strip() for z in pfad.read_text('utf-8').splitlines()):
        if wort and wort.lower() in klein:
            fehler.append(f'Verbotenes Wort in den Texten: {wort}')

for h in hinweise:
    print('Hinweis:', h)
if fehler:
    for f in fehler:
        print('FEHLER:', f)
    print('Nichts geschrieben.')
    sys.exit(1)

# Einbetten (ohne die Liste „weg“, die die Seite nicht zeigt)
daten = {'apps': {k: v for k, v in apps.items() if k != 'weg'}, 'verlauf': verlauf}
roh = json.dumps(daten, ensure_ascii=False, separators=(',', ':'))
roh = roh.replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
muster = re.compile(r'(<script id="daten" type="application/json">)(.*?)(</script>)', re.S)
if len(muster.findall(html)) != 1:
    print('FEHLER: <script id="daten" type="application/json"> nicht genau einmal in index.html')
    sys.exit(1)
neu = muster.sub(lambda m: m.group(1) + roh + m.group(3), html)
if '--nur-pruefen' in sys.argv:
    print(f'Geprüft: {len(haupt)} Apps, {len(werkzeuge)} Werkzeuge, {sum(len(a.get("wochen", [])) for a in verlauf.get("apps", {}).values())} Wochen-Einträge. Nichts geschrieben.')
    sys.exit(0)
if neu != html:
    (ORT / 'index.html').write_text(neu, 'utf-8')
    print(f'index.html aktualisiert ({len(neu.encode("utf-8")) // 1024} KB).')
else:
    print('index.html war schon aktuell.')
