# Schreibt die v11-Einträge in daten/aenderungen.json und die Prüfstellen in daten/pruefstellen.json.
# Zahlen stammen aus den Messungen (v10v11.py, gesang_v10v11.py, pumpen.py, master_diff.py, pruef_*.py).
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemein import LIED, silbe_bei
D = os.path.dirname(os.path.abspath(__file__)) + '/../repo/the-wall/werkstatt2/daten/'
A = json.load(open(D + 'aenderungen.json'))
A = [a for a in A if a.get('fassung') != 'v11']
V11 = [
 dict(id='v11-01', zeit_s=218.0, bis_s=219.85, beleg='Messung',
      was='„Open your eyes“ vor der Sprechstelle ist ganz weg – in der Hauptstimme an der Quelle ausgeschnitten, samt gehaltenem Ton bis 3:39,8. Ab 3:39,85 bleibt nur die Sprechstimme.'),
 dict(id='v11-02', zeit_s=219.85, bis_s=221.3, beleg='Messung', master=True,
      was='„Siehst du mich nicht“ ist im Master etwa 4,5 dB leiser als in v10 und damit nicht mehr lauter als die gesungenen Zeilen davor und danach.'),
 dict(id='v11-03', zeit_s=216.6, bis_s=218.0, beleg='Messung', master=True,
      was='Zwischen „Wach auf“ und der Sprechstelle ist der Gesang im Master etwa 10 dB leiser (Atmer und Nachklang).'),
 dict(id='v11-04', zeit_s=0.0, ganz=True, beleg='Beschreibung + Messung',
      was='Ganzes Lied: alle Stimmen kommen aus den trockenen Aufnahmen, jeder Effekt wirkt nur einmal. Deine Hauptstimme selbst ist bis auf die Sprechstelle gleich geblieben (gemessen: gleich bis auf 0,4 dB).'),
 dict(id='v11-05', zeit_s=68.7, bis_s=70.4, beleg='Messung', master=True,
      was='Hall- und Echo-Fahnen nach den Zeilen sind im ganzen Lied etwa 8–10 dB leiser, die Stimme klingt offener – zum Beispiel hier nach „We claim we know it all“.'),
 dict(id='v11-06', zeit_s=127.3, bis_s=129.0, beleg='Messung', master=True,
      was='Pumpt kaum noch: Zeilenanfänge kommen 2,5–4,7 dB kräftiger (z. B. hier Refrain 2), die Musik weicht beim Gesang nur noch 0,07 dB zurück statt 0,3 dB.'),
 dict(id='v11-07', zeit_s=0.0, ganz=True, beleg='Beschreibung',
      was='Ganzes Lied: deine eigene zweite Stimme singt wieder deine Töne – nur 4 von 89 Tönen liegen anders (v10: 38), dort warst du genau zwischen zwei Tönen.'),
 dict(id='v11-08', zeit_s=64.0, bis_s=96.0, beleg='Beschreibung', master=True,
      was='Refrain 1: Die Terzen folgen jetzt dem Akkord. Im ganzen Lied reiben nur noch 26 statt 78 Töne.'),
 dict(id='v11-09', zeit_s=128.0, bis_s=160.0, beleg='Beschreibung', master=True,
      was='Refrain 2: Terzen nach dem Akkord wie in Refrain 1.'),
 dict(id='v11-10', zeit_s=224.0, bis_s=256.0, beleg='Beschreibung', master=True,
      was='Refrain 3: Terzen nach dem Akkord wie in Refrain 1.'),
]
for a in V11: a['fassung'] = 'v11'
json.dump(A + V11, open(D + 'aenderungen.json', 'w'), ensure_ascii=False, indent=1)

P = [
 dict(id='p01', zeit_s=219.15, bis_s=220.10, art='Silbe fehlt?', schwere=3, titel='Sprechstelle: Anfang von „siehst“',
      was='v11 setzt erst bei 3:39,85 mit einem kräftigen s ein. Davor (3:39,2–3:39,8) lag in deiner Aufnahme ein gehaltener Ton (um 178 Hz), der mit „Open your eyes“ entfernt wurde. Laut Silbenkarte war das schon der Anfang von „siehst“. Bitte A/B hören: Ist „siehst“ ganz da, oder ist das s noch ein Rest von „eyes“?',
      mass={'v11_bis_3_39_8_db': -77, 'aufnahme_db': -40}),
 dict(id='p02', zeit_s=40.10, bis_s=40.75, art='Tonhöhe', schwere=3, titel='„zombies“: Tonkorrektur um 2 Halbtöne',
      was='Die Korrektur hebt „zombies“ um etwa 2 Halbtöne (Spitze 3,1) und fällt bei 0:40,70 in 40 ms gut einen Halbton zurück. Falscher Zielton? Klingt es gequetscht?',
      mass={'median_ct': 203, 'max_ct': 313}),
 dict(id='p03', zeit_s=220.20, bis_s=221.40, art='Loch', schwere=2, titel='Sprechstelle: Lücken zwischen den Wörtern',
      was='Zwischen „du“, „mich“ und nach „nicht“ ist v11 bis 27 dB leiser als deine Aufnahme – dort lag das gesungene „Open your eyes“ darunter (gewollt entfernt). Prüfen, ob „nicht“ mit seinem t ganz da ist (3:41,2–3:41,4).',
      mass={'min_db': -27}),
 dict(id='p04', zeit_s=110.80, bis_s=110.95, art='abgeschnitten', schwere=2, titel='„see“ endet hart',
      was='Der Ausklang von „see“ bricht bei 1:50,89 in 10 ms auf völlige Stille ab. In deiner Aufnahme klingt er noch etwa 0,1 s aus.',
      mass={'sprung_db': -42}),
 dict(id='p05', zeit_s=83.49, bis_s=83.51, art='Klick', schwere=2, titel='Knackser bei „the“ (Refrain 1)',
      was='Kurze Höhen-Spitze am Anfang von „the“ in „follow the light“, 16 dB über dem, was deine Aufnahme an der Stelle hat.',
      mass={'ueber_db': 16, 'hf_dbfs': -28}),
 dict(id='p06', zeit_s=138.05, bis_s=138.60, art='Tonhöhe', schwere=2, titel='„Who“ (Refrain 2) stark hochgezogen',
      was='Der Einsatz von „Who“ wird um bis zu 3,3 Halbtöne hochgezogen (gewollt seit v10: erreicht den Ton schneller), „is“ danach noch um 1,5. Klingt es natürlich?',
      mass={'max_ct': 333}),
 dict(id='p07', zeit_s=120.85, bis_s=121.35, art='Tonhöhe', schwere=2, titel='„does“: 0,4 s um 2 Halbtöne korrigiert',
      was='„does“ in „What does it need“ wird 0,4 s lang um 1,7–2 Halbtöne nach oben gezogen.',
      mass={'median_ct': 185, 'max_ct': 198}),
 dict(id='p08', zeit_s=82.40, bis_s=82.58, art='Tonhöhe', schwere=2, titel='„follow“ (Refrain 1) hochgezogen',
      was='„follow“ wird kurz um 1,6–1,8 Halbtöne nach oben korrigiert.',
      mass={'median_ct': 163, 'max_ct': 184}),
 dict(id='p09', zeit_s=242.30, bis_s=244.15, art='Tonhöhe', schwere=2, titel='„follow the light“ (Refrain 3)',
      was='„follow“ wird um 1,2–1,8 Halbtöne nach oben korrigiert; bei „light“ (4:03,9) wackelt die Korrektur in 0,15 s von +0,7 auf −0,3 Halbtöne und zurück.',
      mass={'max_ct': 177, 'wackeln_ct': 100}),
 dict(id='p10', zeit_s=109.60, bis_s=109.82, art='Nachbildung', schwere=1, titel='„see“: verlängertes s',
      was='Das s von „see“ ist seit v10 um 0,2 s verlängert (nachgebildet). Der kleine Lautstärke-Buckel deiner Aufnahme (1:49,66–1:49,71) fehlt, v11 bleibt flach. Klingt das s natürlich?',
      mass={'db': -11}),
 dict(id='p11', zeit_s=76.74, bis_s=76.75, art='Klick', schwere=1, titel='Leiser Knackser vor „wall“ (Refrain 1)',
      was='Leiser Knackser in der Pause zwischen „this“ und „wall“, etwa −43 dB.', mass={'ueber_db': 16, 'hf_dbfs': -43}),
 dict(id='p12', zeit_s=52.475, bis_s=52.485, art='Klick', schwere=1, titel='Leiser Knackser nach „Sheep“ (Strophe 1)',
      was='Leiser Knackser in der Pause nach „Sheep“, etwa −45 dB.', mass={'ueber_db': 19, 'hf_dbfs': -45}),
]
for p in P:
    i, d = silbe_bei((p['zeit_s'] + p['bis_s']) / 2); p['silbe'] = int(i) if d < .6 else None
out = dict(stand='2026-11-23', quelle='Messung v11 (Ende) gegen deine Aufnahme (gereinigt auf Ende-Zeit) – werkzeug/pruef_*.py, nur lokal gerechnet',
           schwere={'3': 'deutlich', '2': 'mittel', '1': 'leicht'}, stellen=P)
json.dump(out, open(D + 'pruefstellen.json', 'w'), ensure_ascii=False, indent=1)
print(len(V11), 'v11-Einträge,', len(P), 'Prüfstellen')
for p in P: print(p['id'], p['zeit_s'], p['silbe'], p['silbe'] is not None and LIED['silben'][p['silbe']]['text'])
