#!/usr/bin/env python3
# PERF4 – Auslieferung schlanker: die stillen Blöcke <script type="text/plain" id="sq-…-src"> ohne Kommentare, Einrückung und
# Leerzeilen. Allgemeiner Umformer (keine Anker im Blockinhalt): läuft auf jeder Fassung mit diesen Block-IDs, auch nach anderen
# Paketen. Die eigentliche Arbeit macht block.js (acorn, Token wörtlich, Prüfung Token-Folge + Syntaxbaum + Such-Texte der App).
# Aufruf: python3 apply.py <eingang.html> <ausgang.html>
import hashlib, json, os, re, subprocess, sys, tempfile

H = os.path.dirname(os.path.abspath(__file__))
ERLAUBT = ['280c5b0b6a9ed1f8ac77868fb8d5d38f', '2b720d7b67f0dd03cb49c0da99d1b1b3']
# Blöcke der 4.87.0 – jeder muss genau 1× da sein (neue sq-…-src-Blöcke werden ebenso behandelt)
IDS = ['sq-vl2x-src', 'sq-g9-src', 'sq-arp-src', 'sq-arp1-src', 'sq-form-src', 'sq-sr-src', 'sq-ndp-src', 'sq-mk-src',
       'sq-bm-src', 'sq-worklet-src', 'sq-ks-src', 'sq-ke1-src', 'sq-md-src', 'sq-xla-src']


def fail(m):
    sys.exit('PERF4: ' + m)


def main():
    if len(sys.argv) != 3:
        fail('Aufruf: apply.py <eingang> <ausgang>')
    ein, aus = sys.argv[1], sys.argv[2]
    raw = open(ein, 'rb').read()
    m5 = hashlib.md5(raw).hexdigest()
    if m5 not in ERLAUBT:
        fail('Eingang md5 ' + m5 + ' nicht erlaubt')
    s = raw.decode('utf-8')
    if s.count('MS 2000') != 1:
        fail('Eingang: "MS 2000" nicht genau 1x')
    OPEN = re.compile(r'<script type="text/plain" id="(sq-[\w-]+-src)">')
    found = [(m.group(1), m.end()) for m in OPEN.finditer(s)]
    ids = [f[0] for f in found]
    for i in IDS:
        if ids.count(i) != 1:
            fail('Block %s %dx statt 1x' % (i, ids.count(i)))
    if len(set(ids)) != len(ids):
        fail('Block-ID doppelt')
    blocks, spans = {}, []
    for i, a in found:
        b = s.find('</script>', a)
        if b < 0:
            fail(i + ': Ende fehlt')
        blocks[i] = s[a:b]
        spans.append((i, a, b))
    main_src = []
    for m in re.finditer(r'<script(?:\s+type="(?:module|text/javascript)")?>', s):
        b = s.find('</script>', m.end())
        main_src.append(s[m.end():b])
    with tempfile.TemporaryDirectory() as td:
        pi, po = os.path.join(td, 'ein.json'), os.path.join(td, 'aus.json')
        json.dump({'blocks': blocks, 'main': main_src}, open(pi, 'w', encoding='utf-8'))
        r = subprocess.run(['node', os.path.join(H, 'block.js'), pi, po], capture_output=True, text=True)
        if r.returncode:
            fail('block.js: ' + (r.stderr or r.stdout)[-2000:])
        res = json.load(open(po, encoding='utf-8'))
        if r.stderr.strip():
            print(r.stderr[-4000:], file=sys.stderr)
    neu = res['blocks']
    if sorted(neu) != sorted(blocks):
        fail('Block-Liste verschieden')
    parts, p = [], 0
    for i, a, b in spans:
        t = neu[i]
        if '</script' in t.lower() or '<!--' in t and '<!--' not in blocks[i]:
            fail(i + ': gefährliche Folge im Ergebnis')
        parts.append(s[p:a]); parts.append(t); p = b
    parts.append(s[p:])
    o = ''.join(parts)
    # Pflicht
    if o.count('MS 2000') != 1:
        fail('Ausgang: "MS 2000" nicht genau 1x')
    if len(re.findall(r'(?m)^  live: true,', o)) != 1:
        fail('Ausgang: "  live: true," nicht genau 1x')
    if len(OPEN.findall(o)) != len(ids) or o.count('</script>') != s.count('</script>'):
        fail('Ausgang: Skript-Grenzen verschieden')
    if s[:spans[0][1]] != o[:spans[0][1]]:
        fail('Ausgang: Kopf verändert')
    for line in res['bericht'].get('vorlagen', []):
        print(json.dumps(line, ensure_ascii=False))
    for line in res['bericht']['bloecke']:
        print(json.dumps(line, ensure_ascii=False))
    print('roh %d -> %d (%+d)' % (len(raw), len(o.encode('utf-8')), len(o.encode('utf-8')) - len(raw)))
    d = os.path.dirname(os.path.abspath(aus))
    fd, tmp = tempfile.mkstemp(dir=d, prefix='.perf4-')
    with os.fdopen(fd, 'wb') as f:
        f.write(o.encode('utf-8'))
    os.replace(tmp, aus)
    os.chmod(aus, 0o644)
    print('PERF4 ok', hashlib.md5(o.encode('utf-8')).hexdigest())


main()
