# -*- coding: utf-8 -*-
"""Cubasis-Projekt „The Wall v13“ bauen: Kopie der v8-Projektstruktur (alle Spuren, Effekte, Fader, Pan, Send 1,
Master bit-gleich), nur die Audio-Clips der Gesangsspuren werden durch neue WAVs ersetzt.

    from cubasis_v13 import baue_projekt
    bericht = baue_projekt({'haupt': 'lead.wav', 'doppel': 'doppel.wav', 'gegengesang': 'gegen.wav', ...},
                           '/…/out/The-Wall-v13-Projekt.zip')

Spur-Schlüssel (oder direkt der Cubasis-Spurname):
    haupt → VOX Haupt · doppel → VOX Doppel · chor1/oberterz → VOX Chor 1 · chor2/unterterz → VOX Chor 2 ·
    chor3/gegengesang → VOX Chor 3 · ki_ober → VOX KI Oberterz · ki_unter → VOX KI Unterterz
Werte: Pfad zu einer WAV (mono, 48 kHz, Start = Takt 1 = 0,0 s) oder ein numpy-Array (mono, 48 kHz).

modus:
    'ausschnitte' (Standard, wie v8): je gesungener Stelle ein Clip, benannt nach Teil (z. B. „Haupt R1-2“),
                  Clip-Grenzen auf das Tick-Raster (1 Tick = 25 Samples bei 48 kHz/120 BPM) gelegt, Inhalt sample-genau.
    'ganz'      : ein Clip je Spur über die ganze Länge (wie die Platzhalter in v6).
    'wie_v8'    : dieselben Clip-Grenzen wie in v8 (nur sinnvoll, wenn sich das Timing nicht geändert hat).
Nicht übergebene Gesangsspuren: leere_spuren='behalten' (v8-Clips + WAVs werden mitkopiert) oder 'leeren'.
Die .cbp-Datei: 8 Byte Kennung + CBOR, XOR 0x7C (bau/cbp_codec.py, Rundweg an v6/v7/v8 bit-gleich geprüft).
"""
import os, io, json, copy, zipfile, hashlib, random
import numpy as np
import soundfile as sf
import cbp_codec as cc

W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/'
V8_ORDNER = W + 'wall-v12/v8/The-Wall-v8/'
BASIS = {'v8': V8_ORDNER + 'The-Wall-v8.cbp',
         'v6': W + 'wall-v12/repo/the-wall/projekt/The-Wall-v6.cbp'}
SR = 48000
TICKS_JE_S = 1920            # 960 Ticks/Viertel · 2 Viertel/s (120 BPM)
SAMPLES_JE_TICK = SR // TICKS_JE_S   # 25

SPUREN = {'haupt': 'VOX Haupt', 'lead': 'VOX Haupt', 'doppel': 'VOX Doppel',
          'chor1': 'VOX Chor 1', 'oberterz': 'VOX Chor 1', 'chor2': 'VOX Chor 2', 'unterterz': 'VOX Chor 2',
          'chor3': 'VOX Chor 3', 'gegengesang': 'VOX Chor 3', 'gegen': 'VOX Chor 3',
          'ki_ober': 'VOX KI Oberterz', 'ki_unter': 'VOX KI Unterterz'}
KURZ = {'VOX Haupt': 'Haupt', 'VOX Doppel': 'Doppel', 'VOX Chor 1': 'Chor1', 'VOX Chor 2': 'Chor2',
        'VOX Chor 3': 'Gegengesang', 'VOX KI Oberterz': 'KI-Ober', 'VOX KI Unterterz': 'KI-Unter'}
TEILE = [('In', 0, 32), ('S1', 32, 64), ('R1', 64, 96), ('S2', 96, 128), ('R2', 128, 160), ('Tag', 160, 176),
         ('Ueb', 176, 192), ('ZT', 192, 224), ('R3', 224, 256), ('Out', 256, 1e9)]


def teil_von(t):
    for k, a, b in TEILE:
        if a <= t < b: return k
    return 'Out'


def lade_mono(q):
    if isinstance(q, np.ndarray):
        x = q.astype(np.float64); sr = SR
    else:
        x, sr = sf.read(q, dtype='float64', always_2d=False)
    if sr != SR: raise ValueError('%s: %d Hz, erwartet %d Hz' % (q, sr, SR))
    if x.ndim == 2: x = x.mean(1)          # Gesangsspuren in Cubasis sind Mono-Spuren
    return x


def finde_ausschnitte(x, schwelle_db=-50.0, luecke_s=1.0, vor_s=0.20, nach_s=0.60, min_s=0.30):
    """Aktive Stellen (RMS 20 ms über schwelle_db dBFS) → Liste (start_sample, ende_sample) auf Tick-Raster."""
    fr = int(0.02 * SR); nf = len(x) // fr
    e = 10 * np.log10(np.mean(x[:nf * fr].reshape(nf, fr) ** 2, 1) + 1e-14)
    akt = np.flatnonzero(e > schwelle_db)
    if len(akt) == 0: return []
    stuecke = []; a = akt[0]; b = akt[0]
    for i in akt[1:]:
        if (i - b) * 0.02 > luecke_s:
            stuecke.append((a, b)); a = i
        b = i
    stuecke.append((a, b))
    out = []
    for a, b in stuecke:
        s = max(0, int(a * fr - vor_s * SR)); t = min(len(x), int((b + 1) * fr + nach_s * SR))
        s = (s // SAMPLES_JE_TICK) * SAMPLES_JE_TICK
        t = -(-t // SAMPLES_JE_TICK) * SAMPLES_JE_TICK
        if (t - s) / SR >= min_s: out.append((s, t))
    # überlappende nach dem Polstern zusammenlegen
    m = []
    for s, t in out:
        if m and s <= m[-1][1]: m[-1] = (m[-1][0], max(m[-1][1], t))
        else: m.append((s, t))
    return m


def alle_ids(o, acc):
    if isinstance(o, dict):
        for k, v in o.items():
            if isinstance(v, int) and not isinstance(v, bool) and k in ('Id', 'SoundFileId', 'TrackId', 'EffectId'):
                acc.append(int(v))
            alle_ids(v, acc)
    elif isinstance(o, list):
        for v in o: alle_ids(v, acc)
    return acc


def _gleicher_typ(vorlage, wert):
    return type(vorlage)(wert) if isinstance(vorlage, float) else wert


def baue_projekt(spuren, ziel_zip, name='The-Wall-v13', basis='v8', modus='ausschnitte', bits=24,
                 leere_spuren='behalten', stumm=None, liesmich=None, ausschnitt_param=None):
    proj = cc.lade(BASIS[basis])
    busse = {b['Name']: b for b in proj['Buses']}
    naechste_id = [max(alle_ids(proj, [])) + 1]

    def neue_id():
        naechste_id[0] += 1; return naechste_id[0] - 1

    # Vorlage für einen Audio-Clip (Felder/Typen wie Cubasis sie schreibt)
    vorlage = copy.deepcopy(busse['VOX Haupt']['Track']['Regions'][0])
    dateien = {}           # Name im ZIP -> bytes oder Pfad
    bericht = dict(name=name, basis=basis, modus=modus, bits=bits, spuren={})
    ziel_namen = {SPUREN.get(k, k): v for k, v in spuren.items()}
    for spurname in ziel_namen:
        if spurname not in busse: raise KeyError('Spur %r nicht im Projekt' % spurname)

    for bn in [b['Name'] for b in proj['Buses'] if b['Name'].startswith('VOX')]:
        bus = busse[bn]; tr = bus['Track']
        alte = tr['Regions']
        if bn not in ziel_namen:
            if leere_spuren == 'leeren':
                tr['Regions'] = []
                bericht['spuren'][bn] = dict(clips=0, quelle='geleert')
            else:
                if basis != 'v8' and alte:
                    raise ValueError('leere_spuren=behalten geht nur mit basis v8 (WAVs der Vorlage)')
                for r in alte: dateien[r['FileName']] = V8_ORDNER + r['FileName']
                bericht['spuren'][bn] = dict(clips=len(alte), quelle='v8 unverändert')
            continue
        x = lade_mono(ziel_namen[bn])
        kurz = KURZ.get(bn, bn.replace('VOX ', '').replace(' ', '-'))
        farbe = alte[0]['Color'] if alte else vorlage['Color']
        if modus == 'ganz':
            n = -(-len(x) // SAMPLES_JE_TICK) * SAMPLES_JE_TICK
            stuecke = [(0, n)]
        elif modus == 'wie_v8':
            v8 = cc.lade(BASIS['v8']); v8b = {b['Name']: b for b in v8['Buses']}
            stuecke = [(r['Pos'] * SAMPLES_JE_TICK, (r['Pos'] + r['Length']) * SAMPLES_JE_TICK) for r in v8b[bn]['Track']['Regions']]
        else:
            stuecke = finde_ausschnitte(x, **(ausschnitt_param or {}))
        neu = []; zaehler = {}; liste = []
        for s, t in stuecke:
            teil = teil_von(s / SR)
            zaehler[teil] = zaehler.get(teil, 0) + 1
            clipname = '%s %s-%d' % (kurz, teil, zaehler[teil])
            datei = 'v13_%s_%s-%d.wav' % (kurz, teil, zaehler[teil])
            y = np.zeros(t - s); seg = x[s:min(t, len(x))]; y[:len(seg)] = seg
            spitze = float(np.max(np.abs(y))) if len(y) else 0.0
            if spitze > 1.0: raise ValueError('%s: Übersteuerung %.2f dBFS – vorher pegeln' % (datei, 20 * np.log10(spitze)))
            buf = io.BytesIO(); sf.write(buf, y, SR, subtype='PCM_%d' % bits, format='WAV'); dateien[datei] = buf.getvalue()
            r = copy.deepcopy(vorlage)
            pos = s // SAMPLES_JE_TICK; laenge = (t - s) // SAMPLES_JE_TICK
            r.update(Color=farbe, FileName=datei, Name=clipname, Id=neue_id(), SoundFileId=neue_id(),
                     Pos=pos, StartTick=pos, Length=laenge, EndTick=pos + laenge, InPoint=0,
                     FadeIn=0, FadeOut=0, Mute=False, Selected=False)
            r['Gain'] = _gleicher_typ(vorlage['Gain'], 1.0)
            neu.append(r)
            liste.append(dict(clip=clipname, datei=datei, von_s=round(s / SR, 4), bis_s=round(t / SR, 4), pos_ticks=pos, laenge_ticks=laenge))
        tr['Regions'] = neu
        bericht['spuren'][bn] = dict(clips=len(neu), quelle=str(ziel_namen[bn]) if not isinstance(ziel_namen[bn], np.ndarray) else 'Array', liste=liste)
    for k, v in (stumm or {}).items():
        busse[SPUREN.get(k, k)]['Mute'] = int(bool(v))
    proj['ProjectName'] = name + '.cbp'
    proj['UndoId'] = random.Random(name).randint(100000000, 999999999)
    cbp = cc.verschluesseln(cc.cbor_schreiben(proj))
    text = liesmich or (
        'The Wall v13 – Cubasis-Projekt\n\n'
        '1. ZIP in der Dateien-App antippen (entpackt sich).\n'
        '2. In Cubasis: Projekte → Importieren → Ordner „%s“ bzw. %s.cbp wählen.\n\n'
        'Alle Spuren, Effekte (Delay 1/4, Stereo Delay 1/2, RoomWorks SE, Chorus, Send 1 = Echo-Bus), Fader, Pan und Master\n'
        'sind wie in v8 (= Original-Kette). Neu sind nur die Gesangs-Clips. Audio: %d bit / 48 kHz mono.\n' % (name, name, bits))
    os.makedirs(os.path.dirname(ziel_zip), exist_ok=True)
    with zipfile.ZipFile(ziel_zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr(name + '/LIESMICH.txt', text)
        z.writestr(name + '/' + name + '.cbp', cbp)
        for dn, inhalt in dateien.items():
            if isinstance(inhalt, bytes): z.writestr(name + '/' + dn, inhalt)
            else: z.write(inhalt, name + '/' + dn)
    bericht['zip'] = ziel_zip; bericht['cbp_bytes'] = len(cbp); bericht['wav_dateien'] = len(dateien)
    bericht['cbp_sha1'] = hashlib.sha1(cbp).hexdigest()
    return bericht


# ------------------------------------------------------------------ Prüfung
def pruefe_projekt(zip_pfad, basis='v8', erwartet=None, toleranz_samples=0):
    """Entschlüsselt die .cbp aus dem ZIP wieder und vergleicht mit der Vorlage: gleiche Busse/Effekte/Fader/Sends,
    nur die Regions der Gesangsspuren anders; jeder Clip hat seine WAV, Länge = Length-Ticks, Lage = Pos/1920 s.
    erwartet: {spur: Array} → prüft, dass die Clips sample-genau den Inhalt an Pos wiedergeben."""
    fehler = []; info = {}
    with zipfile.ZipFile(zip_pfad) as z:
        namen = z.namelist()
        cbp_name = [n for n in namen if n.endswith('.cbp')][0]
        ordner = cbp_name.split('/')[0]
        raw = z.read(cbp_name)
        neu = cc.cbor_lesen(cc.entschluesseln(raw))
        info['rundweg_bitgleich'] = cc.verschluesseln(cc.cbor_schreiben(neu)) == raw
        alt = cc.lade(BASIS[basis])
        if [b['Name'] for b in neu['Buses']] != [b['Name'] for b in alt['Buses']]: fehler.append('Spurliste anders')
        for ba, bn in zip(alt['Buses'], neu['Buses']):
            a2 = copy.deepcopy(ba); n2 = copy.deepcopy(bn)
            for d in (a2, n2):
                if d.get('Track') and d['Track'].get('TrackType') == 1: d['Track']['Regions'] = None
                d['Mute'] = None
            if cc.cbor_schreiben(a2) != cc.cbor_schreiben(n2): fehler.append('Spur %s: mehr als Clips geändert' % ba['Name'])
        for k in ('Arranger', 'UIParams', 'CubasisVersion'):
            if cc.cbor_schreiben(alt[k]) != cc.cbor_schreiben(neu[k]): fehler.append('%s anders' % k)
        ids = alle_ids(neu, []);
        if len(ids) != len(set(ids)): fehler.append('doppelte IDs')
        clips = 0; max_abw = 0
        for b in neu['Buses']:
            tr = b.get('Track') or {}
            if tr.get('TrackType') != 1: continue
            for r in tr['Regions']:
                clips += 1
                pfad = ordner + '/' + r['FileName']
                if pfad not in namen: fehler.append('fehlt: ' + r['FileName']); continue
                y, sr = sf.read(io.BytesIO(z.read(pfad)), dtype='float64')
                if sr != SR: fehler.append('%s: %d Hz' % (r['FileName'], sr))
                if r['EndTick'] != r['StartTick'] + r['Length'] or r['Pos'] != r['StartTick'] or r['InPoint'] != 0:
                    fehler.append('%s: Tick-Felder inkonsistent' % r['Name'])
                abw = abs(len(y) - r['Length'] * SAMPLES_JE_TICK)
                if r['FileName'].startswith('v13_'):
                    max_abw = max(max_abw, abw)
                    if abw > toleranz_samples: fehler.append('%s: Länge %d Samples ≠ %d Ticks' % (r['Name'], len(y), r['Length']))
                    if erwartet and b['Name'] in erwartet:
                        x = erwartet[b['Name']]; s = r['Pos'] * SAMPLES_JE_TICK
                        ref = np.zeros(len(y)); seg = x[s:s + len(y)]; ref[:len(seg)] = seg
                        q = 2.0 ** -(23 if '24' in str(sf.info(io.BytesIO(z.read(pfad))).subtype) else 15)
                        if np.max(np.abs(y - ref)) > 1.01 * q: fehler.append('%s: Inhalt passt nicht zur Lage' % r['Name'])
        info.update(clips=clips, max_laengen_abweichung_samples=max_abw, dateien=len(namen))
    info['fehler'] = fehler; info['ok'] = not fehler and info['rundweg_bitgleich']
    return info


if __name__ == '__main__':
    import sys
    print(json.dumps(pruefe_projekt(sys.argv[1]), indent=1, ensure_ascii=False))
