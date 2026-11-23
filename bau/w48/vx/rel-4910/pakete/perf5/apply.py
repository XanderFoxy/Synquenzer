#!/usr/bin/env python3
# PERF5 – Auslieferung schlanker (Fortsetzung PERF4): Worklet-Vorlagen (`…registerProcessor…`, z. B. ST_WK, MIXA/JAM2) in allen
# Skripten und CSS-Vorlagen in den stillen Blöcken (z. B. mk-Platte, ndp) ohne Kommentare, Einrückung und Leerzeilen.
# Allgemeiner Umformer: keine Anker im Inhalt, läuft auf jeder Fassung (beim Zusammenbau als LETZTES Paket). Die Arbeit macht
# block.js (acorn; Token wörtlich; Prüfung Token-Folge + Syntaxbaum + Such-Texte der App, CSS: Token-Folge + Leerraum-Merkmal).
# Aufruf: python3 apply.py <eingang.html> <ausgang.html>
import hashlib, json, os, re, subprocess, sys, tempfile

H = os.path.dirname(os.path.abspath(__file__))
ERLAUBT = ['695af0504463a6385e21dc94e55b00c9', 'abc3cf247351fac1eff3ab8c47a02b83', '4c5cba2859297262e7a753fd1762ecfe', '3bbe9e8c271d96542fd3822bbc9f7b34']
# PERF5-BEGIN (Kennung im Bericht; die Ausgabe selbst bekommt keinen neuen Code)
PAKET = 'PERF5'
# PERF5-END


def fail(m):
    sys.exit(PAKET + ': ' + m)


def main():
    if len(sys.argv) != 3:
        fail('Aufruf: apply.py <eingang> <ausgang>')
    ein, aus = sys.argv[1], sys.argv[2]
    if os.path.abspath(aus).startswith('/dev/'):
        fail('Ausgang muss eine Datei sein')
    raw = open(ein, 'rb').read()
    m5 = hashlib.md5(raw).hexdigest()
    if m5 not in ERLAUBT:
        fail('Eingang md5 ' + m5 + ' nicht erlaubt')
    s = raw.decode('utf-8')
    if s.count('MS 2000') != 1:
        fail('Eingang: "MS 2000" nicht genau 1x')
    # alle Skripte: stille Blöcke (sq-…-src) und ausführbare Skripte ohne src
    OPEN = re.compile(r'<script(?: type="text/plain" id="(sq-[\w-]+-src)"|(?:\s+type="(?:module|text/javascript)")?)>')
    scripts, spans = [], []
    for m in OPEN.finditer(s):
        a = m.end()
        b = s.find('</script>', a)
        if b < 0:
            fail('Skript-Ende fehlt bei %d' % a)
        scripts.append({'id': m.group(1) or ('main@%d' % a), 'block': bool(m.group(1)), 'text': s[a:b]})
        spans.append((a, b))
    for i in range(1, len(spans)):
        if spans[i][0] < spans[i - 1][1]:
            fail('Skripte überlappen')
    if sum(1 for x in scripts if x['block']) < 10:
        fail('zu wenige stille Blöcke')
    with tempfile.TemporaryDirectory() as td:
        pi, po = os.path.join(td, 'ein.json'), os.path.join(td, 'aus.json')
        json.dump({'scripts': scripts}, open(pi, 'w', encoding='utf-8'))
        r = subprocess.run(['node', '--stack-size=50000', '--max-old-space-size=6000', os.path.join(H, 'block.js'), pi, po],
                           capture_output=True, text=True)
        if r.returncode:
            fail('block.js: ' + (r.stderr or r.stdout)[-2000:])
        res = json.load(open(po, encoding='utf-8'))
        if r.stderr.strip():
            print(r.stderr[-4000:], file=sys.stderr)
    neu = res['texts']
    if len(neu) != len(scripts):
        fail('Skript-Zahl verschieden')
    parts, p = [], 0
    for (a, b), x, t in zip(spans, scripts, neu):
        if t != x['text']:
            low = t.lower()
            if '</script' in low or ('<!--' in t and '<!--' not in x['text']) or ('<script' in low) != ('<script' in x['text'].lower()):
                fail(x['id'] + ': gefährliche Folge im Ergebnis')
        parts.append(s[p:a]); parts.append(t); p = b
    parts.append(s[p:])
    o = ''.join(parts)
    # Pflicht
    if o.count('MS 2000') != 1:
        fail('Ausgang: "MS 2000" nicht genau 1x')
    if len(re.findall(r'(?m)^  live: true,', o)) != 1:
        fail('Ausgang: "  live: true," nicht genau 1x')
    for bad in ['0.00537728', '0.19492', '413.56', '0.193046', 'xander-krypto']:
        if o.count(bad) != s.count(bad) or o.count(bad):
            fail('Ausgang: verbotene Folge ' + bad)
    if len(OPEN.findall(o)) != len(scripts) or o.count('</script>') != s.count('</script>'):
        fail('Ausgang: Skript-Grenzen verschieden')
    if s[:spans[0][0]] != o[:spans[0][0]]:
        fail('Ausgang: Kopf verändert')
    for line in res['bericht']['vorlagen']:
        print(json.dumps(line, ensure_ascii=False))
    for line in res['bericht']['skripteGeaendert']:
        print(json.dumps(line, ensure_ascii=False))
    ob = o.encode('utf-8')
    print('roh %d -> %d (%+d)' % (len(raw), len(ob), len(ob) - len(raw)))
    d = os.path.dirname(os.path.abspath(aus))
    fd, tmp = tempfile.mkstemp(dir=d, prefix='.perf5-')
    with os.fdopen(fd, 'wb') as f:
        f.write(ob)
    os.replace(tmp, aus)
    os.chmod(aus, 0o644)
    print(PAKET + ' ok', hashlib.md5(ob).hexdigest())


main()
