# Schreibt analyse/zielkarte.md (lesbare Fassung der Zielkarte)
import json
from zk_gemein import *

d = json.load(open(A13 + 'zielkarte.json'))
S = d['silben']; B = d['begruendung']
H = {s['id'][2:]: s for s in S if s['stimme'] == 'haupt'}
D = {s['id'][2:]: s for s in S if s['stimme'] == 'doppel'}


def f(t): return '—' if t is None else ('%.3f' % t).replace('.', ',')
def ms(x): return '—' if x is None else '%+d' % x
def r16(s): return s.replace('.', ',') if isinstance(s, str) else s


def zeile_tab(ids):
    out = ['| Silbe | Stimme | Anlaut ab | Vokal | **Spitze Original** | Raster Original | **v12** | Raster v12 | **Ziel** | Raster Ziel | v12 → Ziel | Original → Ziel | Regel |',
           '|---|---|---|---|---|---|---|---|---|---|---|---|---|']
    for i in ids:
        for st, X in (('Haupt', H), ('Doppel', D)):
            s = X[i]
            rz = s['raster16']['text'] if isinstance(s['raster16'], dict) else s['raster16']
            out.append('| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s ms | %s ms | %s |' % (
                s['text'], st, f(s['konsonant_s']), f(s['vokal_t']), f(s['t_orig']), r16(s['raster16_orig']), f(s['t_v12']),
                r16(s.get('raster16_v12', '—') if st == 'Haupt' else ('—' if s['t_v12'] is None else rstr(s['t_v12']))), f(s['ziel_t']), r16(rz),
                ms(s['abw_v12_ziel_ms']), ms(s['verschiebung_ms']), s['quelle_regel']))
    return '\n'.join(out)


def rstr(t):
    tk, p = raster16(t)
    return 'T%d+%.2f' % (tk, p)


L = []
L.append('# The Wall v13 – Silben-Zielkarte (Haupt + Doppel)\n')
L.append('Stand 24.11.2026 · Agent „zielkarte“ · Daten: `analyse/zielkarte.json` (286 Einträge: 143 Haupt, 143 Doppel) · Skripte `analyse/zk_*.py` · Bilder `analyse/bilder/par_*.png`\n')
L.append('Alle Zeiten in Sekunden auf der Song-Achse (Takt n beginnt bei (n−1)·2 s). „T55+14,67“ = Takt 55, 14,67 Sechzehntel nach dem Taktstrich. '
         '„Spitze“ = Transienten-Spitze = steilste Stelle des Vokal-Einsatzes. Ziel = dorthin soll die Spitze; der Anlaut (Konsonant, bei see/sake auch der erste Vokal-Teil) bleibt in Originallänge links davon. '
         'Messung, kein Hör-Urteil.\n')
L.append('## Kurz\n')
L.append('- **see**: Im Original ist „see“ schon richtig – s ab 16tel 13, Vokal 1,35 16tel vor dem Takt, Akzent genau auf Takt 56 (110,00 s), exakt wie „sake“ in Strophe 1. '
         'v12 hat das s von 0,20 auf 0,42 s gedehnt und den Rest von „see“ um **+166 ms** nach hinten geschoben (Akzent 110,17). Ziel = Original (Verschiebung 0). Ursache: v10 (G4).')
L.append('- **hypnotised** wird als **hyp-no-ti-sed** (4 Töne) gesungen. v12: no **+80 ms**, ti **+68 ms** gegenüber dem Original, n und t-Verschluss durch Stille ersetzt, Lücke ti→sed von 0,66 auf 0,56 s gestaucht. '
         'Ursache: schon die v6-Datei (no/ti +84 ms), v10 verdoppelt Stille vor „no“. Ziel: hyp 16 · no 22 · ti 26 · sed 32 (16tel ab Takt 57) = Xanders Rechnung (EV/ARE 0, ERY/WE 6, THING/HYP 16, WE/NO 22, DO/TIZED 32).')
L.append('- **Zuordnung**: Xanders Paare und die Paare nach Takt/Akkord ergeben dieselben Ziele – alle acht Strophen-Phrasen benutzen dasselbe Raster 0/6/16/22/32/38/48 (mittlere Abweichung Silbe-für-Silbe 0,41 bzw. 0,42 16tel).')
L.append('- **Refrains**: R1/R2/R3 liegen meist innerhalb ±0,4 16tel zusammen. Ziele nach Durchschnitt (Gleichstand → R3). „know“ und „It“ liegen in allen Refrains auf 20 bzw. 26 – nicht auf 22/28 wie bisher in lied.json angenommen.')
L.append('- ' + B['v12_gesamt'])
L.append('- Keine Warp-Marken (alle Cubasis-Clips Stretch 1,0, MusicalMode aus). Alle Timing-Fehler stecken in den bearbeiteten WAV-Dateien (v6 → v7 → v10/G4 → v11 → v12). v12-Lead kommt aus einer 128-kbit-MP3, zeitlich ohne Versatz.\n')

L.append('## „there is so much more to see“ (Strophe 2, Zeile 2, ab Takt 53) – vollständig\n')
L.append('Parallele: Strophe 1 „zombies living for Gods sake“ (gleiche Takte/Akkorde, Silbe für Silbe) bzw. nach Xander „in a world of sheep“ + „to see“ als Zusatz. Beide Wege: there 0 · is 6 · so 16 · much 22 · more 32 · to 38 · see 48 (Akzent).\n')
L.append(zeile_tab(['055', '056', '057', '058', '059', '060', '061']))
L.append('\n„see“: erster Vokal-Einsatz Original 109,833 (T55+14,67) → Ziel 109,832; in v12 110,002 (s davor ab 109,584 = 0,42 s s-Rauschen). „sake“ (S1) zum Vergleich: s ab 45,624, erster Vokal 45,822, Akzent 45,995.\n')
L.append('## „Are we hypnotised“ (Strophe 2, Zeile 3, ab Takt 57) – vollständig\n')
L.append('Parallelen: „everything we (~) do“ bzw. „in a world of (~) sheep“ – Strophe 1 hat auf Platz ~26 einen neuen Ton ohne neue Silbe (51,257 s / 59,289 s), daher Ziel „ti“ = 26.\n')
L.append(zeile_tab(['062', '063', '064', '065', '065b', '066']))
L.append('')

# Top 30
kand = []
for s in S:
    if s['abw_v12_ziel_ms'] is None: continue
    kand.append(s)
kand.sort(key=lambda s: -abs(s['abw_v12_ziel_ms']))
L.append('## Die 30 auffälligsten Stellen (v12 gegen Ziel)\n')
L.append('Sortiert nach |v12 − Ziel|. Doppel nur dort, wo es in v12 hörbar ist (Refrain, Tag, Outro).\n')
L.append('| # | Stelle | Silbe | Stimme | Original | v12 | Ziel | v12 → Ziel | Raster v12 → Ziel | Woher (Messung) |')
L.append('|---|---|---|---|---|---|---|---|---|---|')
for n, s in enumerate(kand[:30], 1):
    i = s['id'][2:]
    her = ''
    if s['stimme'] == 'haupt':
        her = ', '.join('%s %+d ms' % (a, b) for a, b in s['herkunft']['sprung']) or 'kleine Abweichungen über mehrere Fassungen'
    else:
        her = 'Doppel v12 (v7-Doppel, auf Haupt gestimmt) %+d ms gegen Doppel-Original' % s['abw_v12_ms']
    rv = s.get('raster16_v12') or rstr(s['t_v12'])
    rz = s['raster16']['text']
    L.append('| %d | %s Z%d | %s | %s | %s | %s | %s | %s ms | %s → %s | %s |' % (n, s['teil'], s['zeile'], s['text'], s['stimme'], f(s['t_orig']), f(s['t_v12']), f(s['ziel_t']),
                                                                       ms(s['abw_v12_ziel_ms']), r16(rv), r16(rz), her))
L.append('')

# Muster
L.append('## Raster-Muster\n')
L.append('**Strophen** (16tel ab Takt 1 jeder 4-Takt-Phrase, Median aller acht Phrasen, Haupt):\n')
L.append('| Silbe in der Phrase | 1 | 2 | 3 | 4 | (Bindung) | 5 | 6 | 7 |')
L.append('|---|---|---|---|---|---|---|---|---|')
mus = json.load(open(CACHE + 'ziele.json'))['MUSTER']
L.append('| Ziel | 0 | 6 | 16 | 22 | 26 | 32 | 38 | 48 |')
L.append('| Median gemessen | %s |' % ' | '.join(str(mus[k]['median']).replace('.', ',') for k in ['0', '1', '2', '3', 'b', '4', '5', '6']))
L.append('')
L.append('**Refrains** (16tel ab dem Takt der 2. Silbe; Haupt R1 / R2 / R3 → Ziel):\n')
L.append('| Zeile | Silben-Ziele | Abweichende Stellen |')
L.append('|---|---|---|')
for p in d['paare']:
    if p['art'] != 'refrain': continue
    ziele = ' · '.join('%s %d' % (m['text'], m['ziel_platz16']) for m in p['muster'])
    abw = '; '.join('%s: %s → %d%s' % (m['text'], '/'.join(('%.2f' % v).replace('.', ',') for v in m['haupt'].values()), m['ziel_platz16'], ' (unsicher)' if m['unsicher'] else '')
                    for m in p['muster'] if max(m['haupt'].values()) - min(m['haupt'].values()) > 0.45 or m['unsicher'])
    L.append('| %s „%s“ | %s | %s |' % (p['zeile'], p['text'], ziele, abw or '—'))
L.append('')
L.append('## Zuordnung „are we hypnotized“ ↔ „everything we do believe“\n')
L.append(B['zuordnung_hypnotized'] + '\n')
L.append('## Woher die v12-Fehler kommen\n')
for k, v in B['herkunft_v12_fehler'].items(): L.append('- **%s**: %s' % (k, v))
L.append('- **see**: ' + B['see'])
L.append('- **hypnotised**: ' + B['hypnotised'] + '\n')
L.append('## Unsicher / offen\n')
for u in B['unsicher']: L.append('- ' + u)
L.append('- ' + B['strophe1'])
L.append('- ' + B['ausnahmen'])
L.append('- ' + B['refrains'])
open(A13 + 'zielkarte.md', 'w').write('\n'.join(L) + '\n')
print('md ok', len(L))
