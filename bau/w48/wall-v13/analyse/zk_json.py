# Baut analyse/zielkarte.json und analyse/zielkarte.md aus den Zwischenergebnissen.
import json, numpy as np
from zk_gemein import *

S = json.load(open(CACHE + 'silben_out.json'))
Z = json.load(open(CACHE + 'ziele.json'))
F = json.load(open(CACHE + 'final_mess.json'))
H = {s['id'][2:]: s for s in S if s['stimme'] == 'haupt'}
D = {s['id'][2:]: s for s in S if s['stimme'] == 'doppel'}

# ---------------- paare ----------------
from zk_ziel import PHRASEN, REF, REF_MUSTER, MUSTER, FIT_A, FIT_B, ZUORD_B, ZUORD_A, rel, t_h, BIND, muster_index
paare = []
for s2, s1 in ZUORD_B.items():
    tk1, ids1, txt1 = PHRASEN[s1]; tk2, ids2, txt2 = PHRASEN[s2]
    zeilen = []
    for k in range(max(len(ids1), len(ids2))):
        a = ids1[k] if k < len(ids1) else None; b = ids2[k] if k < len(ids2) else None
        zeilen.append(dict(muster=str(muster_index(s1, k)) if a else None,
                           s1=a, s1_text=(H[a]['text'] if a in H else ('(Bindung, neuer Ton)' if a else None)), s1_platz16=round(rel(t_h(a), tk1), 2) if a else None,
                           s2=b, s2_text=(H[b]['text'] if b in H else None), s2_platz16=round(rel(t_h(b), tk2), 2) if b else None,
                           ziel_platz16=(Z['ZIEL'][b]['platz'] if b in Z['ZIEL'] else None)))
    paare.append(dict(art='strophe', zuordnung='B: gleiche Takte/Akkorde (gewählt)', s1='%s T%d „%s“' % (s1, tk1, txt1), s2='%s T%d „%s“' % (s2, tk2, txt2),
                      platz16_bezug='16tel ab Takt 1 der Phrase', silben=zeilen))
for s2, s1 in ZUORD_A.items():
    paare.append(dict(art='strophe', zuordnung='A: Xanders Paare (zum Vergleich)', s1='%s „%s“' % (s1, PHRASEN[s1][2]), s2='%s „%s“' % (s2, PHRASEN[s2][2]),
                      silben=[f for f in FIT_A if (f.get('s1') in PHRASEN[s1][1]) or (f.get('s2') in PHRASEN[s2][1] and f.get('s1') is None)]))
for z, R in REF.items():
    n = len(R['reihen']['R1'][1])
    muster = []
    for k in range(n):
        m = REF_MUSTER['%s/%d' % (z, k)] if isinstance(next(iter(REF_MUSTER)), str) else REF_MUSTER[(z, k)]
        muster.append(dict(nr=k + 1, text=H[R['reihen']['R1'][1][k]]['text'], ziel_platz16=m['platz'], grund=m['grund'], haupt=m['haupt'], doppel=m['doppel'],
                           unsicher=bool(m.get('unsicher', False))))
    paare.append(dict(art='refrain', zeile=z, text=R['text'], platz16_bezug='16tel ab dem Takt der 2. Silbe (negativ = Auftakt)',
                      instanzen={r: dict(takt=tk, ids=ids) for r, (tk, ids) in R['reihen'].items()}, muster=muster))
paare.append(dict(art='tag-outro', text='open your eyes', tag=dict(takt=80, ids=['100', '101', '102', '103'], platz16=[round(rel(t_h(i), 80), 2) for i in ['100', '101', '102', '103']]),
                  outro=dict(takt=128, ids=['156', '157', '158', '159'], platz16=[round(rel(t_h(i), 128), 2) for i in ['156', '157', '158', '159']]),
                  refrain_muster=[0, 6, 12, 16], entscheidung='Outro folgt dem Refrain-Muster (0/6/12/16); Tag hat einen eigenen Rhythmus (0/3/6/16) und bleibt (nur aufs 16tel) – offen'))
paare.append(dict(art='zwischenteil', text='We claim / Can’t see / Don’t wait (gesungen) folgen den Refrain-Zeilen; „Wach auf“ eigen; gesprochene Teile nicht in der Karte'))

fitA = float(np.mean([abs(f['diff16']) for f in FIT_A if f['diff16'] is not None]))
fitB = float(np.mean([abs(f['diff16']) for f in FIT_B if f['diff16'] is not None]))

begr = {
 'definitionen': {
   'zeitachse': 'Song-Zeit in Sekunden (Takt 1 = 0 s, 120 BPM, 1 Takt = 2 s, 16tel = 0,125 s). Rohaufnahme = original/Gesang-Platzhalter-3.wav bzw. Doppel-Platzhalter-4.wav (24 bit); v12-Haupt = wall/roh/ende.npy (Quelle von stems_v12/lead.wav laut mix_v12.py), v12-Doppel = bau/stimmen/doppel_t.wav.',
   't_orig / t_v12': '„Transienten-Spitze“ = steilste Stelle des ersten kräftigen Vokal-Einsatzes der Silbe (Hülle 120–1800 Hz, 10 ms, Anstieg >= 4,5 dB in 14 ms nach einem Tiefpunkt, stimmhaft). Bei 6 Silben mit zwei Einsätzen (see, sake, your ×3, the R3) ist es der zweite, stärkere Akzent; der erste Einsatz steht in erster_einsatz_t und gehört zum Vorlauf.',
   'vokal_t': 'Beginn dieses Anstiegs (Tiefpunkt in den 40 ms davor).',
   'konsonant_s': 'Beginn des Anlauts (rückwärts über leise/stimmlose/zischende Rahmen bis zum letzten lauten stimmhaften Rahmen der Silbe davor; Stille beendet die Suche).',
   'ziel_t': 'Zeit, auf die die Transienten-Spitze soll (genau auf dem Rasterplatz). Vorlauf (konsonant_s … t_orig) bleibt in Originallänge links davon: ziel_konsonant_s = konsonant_s + verschiebung.',
   'raster16': 'takt + sechzehntel (0–15) des Ziels; platz_im_bezug = 16tel relativ zum Bezugstakt der Zeile/Phrase (Strophen: Takt 1 der 4-Takt-Phrase; Refrains: Takt der 2. Silbe, negativ = Auftakt).',
   'doppel': 'Doppel-Ziel = Haupt-Ziel desselben Ereignisses (bei Akzent-Silben: erster Vokal-Einsatz). Damit liegen Haupt und Doppel nach dem Umbau aufeinander („tight“).',
   'genauigkeit': 'Automatische Messung ±10–20 ms; 17 Silben per Sichtprüfung (Parallel-Bilder analyse/bilder/par_*.png + Feintabellen) korrigiert (messung = „Sichtprüfung“). Kein Hör-Urteil.'},
 'zuordnung_hypnotized': ('Xander nennt „are we hypnotized“ ↔ „everything we do believe“ (EV/ARE, ERY/WE, THING/HYP, NO/WE, TIZED/DO) und „there is so much more to see“ ↔ „in a world of sheep“. '
   'Nach Takt und Akkord liegen die Zeilen anders: „there is so much more to see“ steht über Ab–Fm wie „zombies living for Gods sake“, „are we hypnotised“ über Bbm–Gb wie „in a world of sheep“, „what does it need to realise“ wie „everything we do believe“. '
   'Mathematisch ist es egal: alle acht 4-Takt-Phrasen beider Strophen benutzen dasselbe Silben-Raster 0 / 6 / 16 / 22 / 32 / 38 / 48 (16tel ab Takt 1 der Phrase; gemessene Mediane %s). '
   'Mittlere Abweichung Silbe-für-Silbe: Xanders Paare %s 16tel, Takt/Akkord-Paare %s 16tel – praktisch gleich. Beide Zuordnungen ergeben deshalb dieselben Ziele: ARE 0, WE 6, HYP 16, NO 22, TIZED 32 – genau Xanders Rechnung (EV 0, ERY 6, THING 16, WE 22, DO 32). '
   'Am Audio singt er „hyp-no-ti-sed“ mit vier Tönen: „ti“ ist ein eigener Ton mit t-Anlaut (115,35 s), „-sed“ mit dem s ab 115,93 s und dem Vokal auf 116,0 (= sein „TIZED auf DO“). Strophe 1 hat an derselben Stelle (Platz ~26) ebenfalls einen neuen Ton ohne neue Silbe (51,26 s „of~“, 59,29 s „we~“) – deshalb Ziel „ti“ = 26.') % (
   ' / '.join(('(%.1f)' if k == 'b' else '%.1f') % MUSTER[k]['median'] for k in [0, 1, 2, 3, 'b', 4, 5, 6]).replace('.', ','), ('%.2f' % fitA).replace('.', ','), ('%.2f' % fitB).replace('.', ',')),
 'see': ('„see“ (S2) ist im Original genau wie „sake“ (S1, gleiche Stelle): s ab 16tel 13 (109,63 / 45,62), Vokal setzt 1,35 16tel vor dem Takt ein (109,83 / 45,83), kurzer Einbruch, Akzent genau auf dem Taktstrich (110,00 / 46,00). Das ist schon Xanders Muster – Ziel = Original (Verschiebung 0). '
   'v12 hat das s auf ~0,43 s verlängert (Anfang 109,58), den ersten Vokal-Teil durch Rauschen ersetzt und den ganzen Rest von „see“ um +166 ms nach hinten geschoben (Akzent 110,17); danach wird bei 111,13 s ein Stück ausgelassen. Ursache: v10 („s etwa 0,2 s länger, damit der Vokal genau auf dem Schlag kommt“, Haupt-3_g4), unverändert in v11/v12.'),
 'hypnotised': ('Original: hyp 113,98 (15,8) · no 114,66 (21,3) · ti 115,35 (26,8) · sed 116,02 (32,1). v12: hyp 114,00 · no 114,74 (+80) · ti 115,42 (+68) · sed 115,98 (−34). '
   'Schon die v6-Datei (projekt/Gesang-Platzhalter-3.wav, „getunt v6“) hat no und ti um +84 ms verschoben und sed um −98 ms; v7 („silbenweise auf die Plätze von In a world of sheep gerückt“) und v10/G4 haben das beibehalten und zusätzlich vor „no“ 3×24 ms Stille verdoppelt – das n ist in v12 durch Stille ersetzt (114,63–114,72), ebenso der t-Verschluss von „ti“ (115,36–115,40). '
   'Ziel: hyp 16 (114,00, +21 ms), no 22 (114,75, +90 ms – der Vokal liegt damit da, wo v12 ihn hat, aber MIT dem originalen n davor ab 114,66), ti 26 (115,25, −102 ms), sed 32 (116,00, −16 ms). '
   'Die hörbare Schieflage in v12 kommt also vor allem von „ti“ (1,1–1,4 16tel später als die Töne an derselben Stelle in Strophe 1), vom fehlenden n und von der gestauchten Lücke ti→sed (Original 0,66 s, v12 0,56 s).'),
 'refrains': ('Je Silbe Rasterplatz in R1/R2/R3 (Haupt), Ziel = Durchschnitt gerundet; liegt der Durchschnitt genau zwischen zwei 16teln (±0,1) -> R3. '
   'Auffällig: die Silbe auf Schlag 2 (know/is/low) liegt in allen Refrains 40–110 ms nach Schlag 2: know 20,4 -> 20; is 20,5 (genau Mitte) -> R3 = 20; low 20,8 -> 21 (2e). '
   '„It“ liegt in allen drei Refrains auf 26 (3-und), nicht auf 28 wie in lied.json/ziel_s angenommen; „know“ auf 20, nicht 22. '
   '„eyes“ (Zeile 4) 31,1/31,9/31,4 – genau zwischen 31 und 32; Ziel 32 (Taktstrich), weil Outro und Tag „eyes“ auf dem Taktstrich singen (Ausnahme von der Rundungsregel, unsicher).'),
 'strophe1': 'Strophe 1 ist Vorbild. Nur „world“ (S1, 17,5) und „thing“ (16,7) weichen selbst vom Muster aller acht Phrasen (16) ab; Ziel 16 nach Mehrheit. „world“ wird dadurch um −185 ms verschoben (w-Anlaut beginnt dann vor dem Takt) – unsicher, Alternative: 17 (nur aufs nächste 16tel).',
 'ausnahmen': 'Tag nach Refrain 2 („o-pen your eyes“ mit pen/your auf 3/6 statt 6/12) und „Wach auf“ im Zwischenteil (auf auf 4-und, Haupt und Doppel gleich) behalten ihren eigenen Rhythmus, nur auf das nächste 16tel. Gesprochene Zwischenteil-Wörter sind nicht in der Karte.',
 'herkunft_v12_fehler': {
   'Warp-Marken': 'Keine. In The-Wall-v6.cbp, The-Wall-v7.cbp und der v8-Projektdatei (148 Clips) haben alle Gesangs-Clips Stretch 1,0, Pitch 1,0, MusicalMode aus; v6/v7 sind je ein durchgehender Clip ab 0 s. Alle Timing-Änderungen stecken in den WAV-Dateien selbst.',
   'v6-Bearbeitung': 'projekt/Gesang-Platzhalter-3.wav („getunt v6“) ist zeitlich schon bearbeitet: hypnotised no/ti +84 ms, sed −98 ms; Strophe 2 Zeile 1 („we just feel“) −50…−70 ms; mehrere Strophe-1-Silben −40…−80 ms.',
   'v7': 'Haupt-3-trocken-v7: v7-04 „Are we hypnotised silbenweise auf die Plätze von In a world of sheep gerückt“; weitere Schnitte (lied.json schnitte, quelle v7: 75 Sprünge).',
   'v10/G4': 'Haupt-3_g4 (v10): Strophe 2 Zeilen 2+3 neu geschnitten (16 Schnitte), „see“ s von 191 auf 408 ms verlängert (+166…+177 ms für den Rest von „see“), „so“ −115 ms, Stille vor „no“ verdoppelt.',
   'MP3': 'v12-Lead = v11-Haupt aus 128-kbit-MP3 (wall/roh/ende.npy). Zeitlich kein Versatz messbar (unbearbeitete Stellen ±10 ms zum Original), aber schlechtere Klangquelle – für v13 aus dem 24-bit-Original neu schneiden.'},
 'v12_gesamt': None,
 'unsicher': ['world (S1) Ziel 16 statt eigen 17,5', 'ti Ziel 26 (Alternative 27 = nächstes 16tel des Originals)', 'is (Refrain) 20 vs. 21', 'low (Refrain) 21 vs. 20', 'eyes (Refrain) 32 vs. 31',
              'Tag-Rhythmus', 'Doppel-Silben mit > 70 ms Abstand zur Haupt (Notiz am Eintrag) – Messung oder echte Abweichung?', 'Akzent-Wahl bei your/the R3'],
}
Hs = [s for s in S if s['stimme'] == 'haupt']
a = np.array([abs(s['abw_v12_ziel_ms']) for s in Hs]); sh = np.array([abs(s['verschiebung_ms']) for s in Hs])
begr['v12_gesamt'] = ('Haupt, %d Silben: |v12 − Ziel| Median %.0f ms, 90-%% %.0f ms, max %.0f ms; %d Silben > 60 ms, %d > 100 ms. '
                      'Nötige Verschiebung gegenüber dem Original: Median %.0f ms, 90-%% %.0f ms, max %.0f ms.') % (len(Hs), np.median(a), np.percentile(a, 90), a.max(), (a > 60).sum(), (a > 100).sum(),
                                                                                                         np.median(sh), np.percentile(sh, 90), sh.max())
meta = dict(erstellt='2026-11-24', von='zielkarte (Analyse-Agent)', lied='The Wall', bpm=120, takt_s=2.0, sechzehntel_s=0.125,
            quellen=dict(haupt_roh='repo/the-wall/original/Gesang-Platzhalter-3.wav', doppel_roh='repo/the-wall/original/Doppel-Platzhalter-4.wav',
                         haupt_v12='wall/roh/ende.npy (= stems_v12/lead.wav vor Bus)', doppel_v12='wall-v12/bau/stimmen/doppel_t.wav',
                         silben='wall/werkzeug/lied.json (+ „ti“ ergänzt als 065b)'),
            skripte='wall-v13/analyse/zk_*.py', bilder='wall-v13/analyse/bilder/')
json.dump(dict(meta=meta, silben=S, paare=paare, begruendung=begr), open(A13 + 'zielkarte.json', 'w'), ensure_ascii=False, indent=1)
print('json ok', len(S), begr['v12_gesamt'])
