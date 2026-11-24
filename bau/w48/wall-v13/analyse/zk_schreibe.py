import json, numpy as np
from zk_gemein import *
S = json.load(open(CACHE + 'silben_out.json')); Z = json.load(open(CACHE + 'ziele.json'))
H = {s['id'][2:]: s for s in S if s['stimme'] == 'haupt'}
paare = []
for f in Z['FIT_A']: paare.append(dict(art='Strophe1<->Strophe2 (Xanders Paar, nach Silben-Nummer)', **f))
for f in Z['FIT_B']: paare.append(dict(art='Strophe1<->Strophe2 (gleicher Takt/Akkord, 4-Takt-Phrase)', **f))
for k, v in Z['REF_MUSTER'].items(): paare.append(dict(art='Refrain R1/R2/R3 (+ZT)', zeile_silbe=k, **v))
beg = {
 'messung': 'Transienten-Spitze = steilster Anstieg der Stimmklang-Hülle 120–1800 Hz (10 ms) beim ersten kräftigen, stimmhaften Vokal-Einsatz der Silbe; vokal_t = Beginn dieses Anstiegs; konsonant_s = Beginn des Anlauts (stimmlos/leise rückwärts). Gleiche Definition für Original (original/Gesang-Platzhalter-3.wav, Doppel-Platzhalter-4.wav) und v12 (Quelle laut mix_v12.py: wall/roh/ende.npy = v11-Haupt; Doppel: bau/stimmen/doppel_t.wav). Zuordnung v12<->Original über die lied.json-Zeitkarte und DTW, dann ±50 ms nachgemessen. 16 Stellen per Sichtprüfung (Spektrogramm/Hüllen) gesetzt, Feld messung.',
 'raster': '16tel = 0,125 s; Takt n beginnt bei (n−1)·2 s. raster16.text = T<Takt>+<16tel ab Taktbeginn>.',
 'ziel': 'Transienten-Spitze genau auf ziel_t; Vorlauf (konsonant_s..t_orig) LINKS davon in Originallänge: ziel_konsonant_s = konsonant_s + verschiebung. Doppel: dieselbe Verschiebung wie das Haupt-Ereignis (Doppel-Ziel = Haupt-Zeit dieses Ereignisses + Haupt-Verschiebung), damit beide gleich laufen.',
 'are_we_hypnotized': 'Am Audio gemessen (Plätze in 16teln ab Phrasenbeginn T57 bzw. T29): Are 0,05 / Eve −0,12; we 6,64 / ry 6,36; hyp 15,83 / thing 16,72; no 21,28 / we 21,90; ti 26,82 / (Strophe 1 neuer Ton auf „we~“ 26,31; Zeile 3 „of~“ 26,06); sed 32,13 / Do 32,25; Strophe 1 hat danach noch be 38,3 + lieve 48,35. Also: EV=ARE, ERY=WE, THING=HYP, WE=NO, DO=TISED – genau Xanders Zuordnung; sie ist auch die mathematische (gleicher Platz). Ziel: 0, 6, 16, 22, 26, 32.',
 'there_is_so_much_more_to_see': 'Xanders Paar „in a world of sheep“: In 0,38/there 0,10; a 6,23/is 5,97; world 17,48/so 16,94; of 21,84/much 22,27; Sheep 32,38/more 31,91. Danach „to“ 38,26 und „see“ 48,01 = überzählige Silben, gesungen auf denselben Plätzen wie „Gods“ 38,20 und „sake“ 47,96 in Strophe 1 Zeile 2 (gleiches Muster). Ziel: 0, 6, 16, 22, 32, 38, 48. „world“ liegt in Strophe 1 selbst 1,5 16tel zu spät (alle 7 anderen Phrasen: 16) -> Mehrheit 16.',
 'see': 'Original: s ab 109,633 (T55+13,06), erster Vokal-Einsatz „e“ 109,833 (T55+14,67), Akzent/Transienten-Spitze 110,001 (T56+0) – gleiche Form wie „sake“ in Strophe 1 (erster Vokal 14,57, Akzent 15,96). v12: s künstlich verlängert (lied.json schnitte: „Rauschen verlängert (s nachgebildet) 191 -> 408 ms“, v10-02), Vokal erst ab 110,0 (s 109,575–110,0 = 434 ms statt 200 ms) -> das „e“ kommt ~170 ms später als im Original, der Akzent selbst liegt auf T56. Ziel = Original-Zeitlage unverändert (Verschiebung −1 ms), s in Originallänge (~200 ms).',
 'refrain': 'Je Silbe Durchschnitt R1/R2/R3 auf das nächste 16tel; liegt der Durchschnitt genau zwischen zwei 16teln (±0,1) -> R3. „eyes“ (Mittel 31,48) -> 32 (Taktstrich, wie Tag/Outro). Zweiter Schlag in Zeile 2/3 („is“ 20,50; „low“ 20,81) als unsicher markiert. ZT-Zeilen folgen dem Refrain-Muster.',
 'strophe2_folgt_strophe1': 'Muster aller 8 Strophen-Phrasen (Mehrheit, 4-Takt-Phrasen): 0, 6, 16, 22, (26), 32, 38, 48. Strophe 1 liegt fast überall darauf; Strophe 2 bekommt dieselben Plätze.',
 'herkunft_v12_fehler': 'Cubasis v6/v7/v8: alle Gesangsclips Stretch 1.0, MusicalMode aus -> keine Warp-Marken. Die Fehler stammen aus Audio-Bearbeitungen: (1) v6 „getunt“ (projekt/Gesang-Platzhalter-3.wav) schiebt „no“ und „ti“ um ~+85 ms nach hinten, Rest fast gleich; (2) v7 Schnitte (lied.json schnitte quelle v7, 75 Stück): „Are we hypnotised silbenweise auf die Plätze von In a world of sheep gerückt“ – falsches Vorbild (richtig: Everything we do believe), ferner Einzelfehler z. B. „sake“, „lieve“, „light“; (3) v10 Neuschnitt G4 (16 Schnitte 103,9–117,1 s): „see“-s nachgebildet (+0,2 s) und Vokal-Beginn gelöscht, „so“ −124 ms, „much“ −101 ms; v12 übernimmt das unverändert (v12-Haupt = v11 „ende“, Zeitlage = v10). MP3-Quelle (128 kbit/s) verschiebt nichts (v10 und v12 messen gleich), kostet nur Klang.',
 'offen': 'Nicht sicher: „ti“ Ziel 26 (alternativ 27 = nächstes 16tel, nur +23 ms); Refrain „is“/„low“ (Schlag 2 vs 2e); Tag „pen“ (Platz 3, eigener Rhythmus); Doppel-Messungen mit abw_zur_haupt > 70 ms; Hörprobe fehlt (kein Ohr-Urteil).',
}
json.dump(dict(stand='2026-11-24', silben=S, paare=paare, begruendung=beg), open(A13 + 'zielkarte.json', 'w'), ensure_ascii=False, indent=1)

def zeile(s): return '| %s | %s | %s | %.3f (%s) | %.3f (%s) | %.3f (%s) | %+d | %+d | %s |' % (s['id'], s['teil'], s['text'], s['t_orig'], s['raster16_orig'], s['t_v12'], s['raster16_v12'], s['ziel_t'], s['raster16']['text'], s['abw_v12_ms'], s['verschiebung_ms'], s['quelle_regel'])
kopf = '| id | Teil | Silbe | Original s (Raster) | v12 s (Raster) | Ziel s (Raster) | v12−Orig ms | Ziel−Orig ms | Regel |\n|---|---|---|---|---|---|---|---|---|'
md = ['# The Wall v13 – Silben-Zielkarte (Haupt + Doppel)', '', 'Stand 24.11.2026. Daten: zielkarte.json (286 Einträge: 143 Haupt, 143 Doppel). Raster: T<Takt>+<16tel>. Transienten-Spitze = Vokal-Einsatz; der Vorlauf (Konsonant) bleibt in Originallänge links davon.', '',
      '## „there is so much more to see“ (Strophe 2, T53–56)', '', kopf] + [zeile(H[i]) for i in ['055', '056', '057', '058', '059', '060', '061']] + ['', beg['see'], '',
      '## „Are we hypnotized“ (Strophe 2, T57–59)', '', kopf] + [zeile(H[i]) for i in ['062', '063', '064', '065', '065b', '066']] + ['', beg['are_we_hypnotized'], '',
      '## Strophe 2 gegen Strophe 1 (Plätze in 16teln ab Phrasenbeginn)', '', '| Strophe 1 | Platz | Strophe 2 | Platz | Diff |', '|---|---|---|---|---|']
for f in Z['FIT_B']:
    md.append('| %s | %s | %s | %.2f | %s |' % (f.get('s1_text', '–') if f.get('s1') else '–', f.get('s1_platz', '–'), f['s2_text'], f['s2_platz'], f['diff16'] if f['diff16'] is not None else 'überzählig'))
md += ['', 'Muster aller 8 Phrasen: 0, 6, 16, 22, (26), 32, 38, 48. ' + beg['there_is_so_much_more_to_see'], '', '## Refrains (Plätze in 16teln ab Takt der 2. Silbe; Haupt R1/R2/R3 -> Ziel)', '', '| Zeile/Silbe | R1 | R2 | R3 | Ziel | Grund |', '|---|---|---|---|---|---|']
for k, v in Z['REF_MUSTER'].items():
    md.append('| %s | %.2f | %.2f | %.2f | %d | %s |' % (k, v['haupt']['R1'], v['haupt']['R2'], v['haupt']['R3'], v['platz'], v['grund']))
top = sorted([s for s in S if s['stimme'] == 'haupt'], key=lambda s: -abs(s['abw_v12_ziel_ms']))[:30]
md += ['', '## Die 30 auffälligsten Stellen (Haupt, |v12 − Ziel|)', '', '| id | Teil | Silbe | Original | v12 | Ziel | v12−Ziel ms | Herkunft (Sprünge ms) |', '|---|---|---|---|---|---|---|---|']
for s in top:
    md.append('| %s | %s | %s | %s | %s | %s | %+d | %s |' % (s['id'], s['teil'], s['text'], s['raster16_orig'], s['raster16_v12'], s['raster16']['text'], s['abw_v12_ziel_ms'], ', '.join('%s %+d' % tuple(x) for x in s['herkunft']['sprung']) or '–'))
a = np.array([abs(s['abw_v12_ziel_ms']) for s in S if s['stimme'] == 'haupt']); sh = np.array([abs(s['verschiebung_ms']) for s in S if s['stimme'] == 'haupt'])
md += ['', '## Zahlen', '', 'Haupt v12 gegen Ziel: Median %d ms, 90 %% %d ms, max %d ms; %d Silben > 60 ms. Nötige Verschiebung Original -> Ziel: Median %d ms, 90 %% %d ms, max %d ms.' % (np.median(a), np.percentile(a, 90), a.max(), (a > 60).sum(), np.median(sh), np.percentile(sh, 90), sh.max()),
       '', '## Woher die v12-Fehler kommen', '', beg['herkunft_v12_fehler'], '', '## Offen / nicht sicher', '', beg['offen']]
open(A13 + 'zielkarte.md', 'w').write('\n'.join(md) + '\n')
nz = ['# Notiz zielkarte (24.11.2026)', '', 'Was: Silben-Zielkarte für Haupt und Doppel aus den 24-bit-Rohaufnahmen (original/) gegen v12 (ende.npy bzw. doppel_t.wav).',
      'Ausgabe: analyse/zielkarte.json, analyse/zielkarte.md. Skripte: analyse/zk_*.py (zk_kern.py = Messung, zk_final_mess.py, zk_ziel.py, zk_ausgabe.py, zk_schreibe.py), Bilder: analyse/bilder/par_*.png.',
      '', 'Zahlen: Haupt v12−Ziel Median %d ms, p90 %d ms, max %d ms, %d Silben > 60 ms.' % (np.median(a), np.percentile(a, 90), a.max(), (a > 60).sum()),
      'see: v12 s 434 statt 200 ms, „e“ ~170 ms später als im Original (Akzent auf T56 stimmt). hypnotized: ti +170 ms gegen Ziel (v6-Tuning +85 ms, v10 +85 ms), no in v12 schon nahe Ziel (−10 ms).',
      '', 'Zuordnung: Are/Eve, we/ry, hyp/thing, no/we, ti/(Ton auf we~), sed/Do – Xanders Zuordnung bestätigt (gleiche 16tel-Plätze).', '', 'Offen: ' + beg['offen'],
      'Abgebrochen auf Anweisung (Eile): keine weiteren Feinmessungen; Doppel-Werte mit |Abw. zur Haupt| > 70 ms nicht nachgeprüft.']
open(SP + 'wall-v13/notiz/zielkarte.md', 'w').write('\n'.join(nz) + '\n')
print('ok', len(S), len(paare))
