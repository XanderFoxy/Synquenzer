# Nachmessen: Reibung der v12-Stimmen gegen Lead und Akkord (gleiche Definition wie analyse/CHOR.md)
import numpy as np, soundfile as sf, json
from scipy.signal import resample_poly
W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/'
ST = W + 'bau/stimmen/'
src = open(W + 'analyse/skripte/f0.py').read()
exec(src[src.index('SR=16000'):src.index('files={')])   # yin(), SR=16000, HOP, N
d = np.load(W + 'analyse/f0.npz'); NFR = len(d['haupt_f']); T = np.arange(NFR) * 0.01 + 0.025
plan = json.load(open(W + 'bau/plan/plan.json'))
CH = {0: ('Ebm', [3, 6, 10]), 1: ('Gb', [6, 10, 1]), 2: ('Db', [1, 5, 8]), 3: ('Ab/C', [8, 0, 3])}
TEILE = {'R1': (63.0, 96.0, 64.0), 'R2': (127.0, 160.0, 128.0), 'R3': (223.0, 256.0, 224.0)}


def akk(tt, st): return CH[int(np.floor((tt - st) / 4.0)) % 4 if tt >= st else 0][1]
def midi(f): return 69 + 12 * np.log2(np.maximum(f, 1) / 440)


def gate_frames(rng):
    g = np.zeros(NFR, bool)
    for a, b in rng: g[(T >= a) & (T < b)] = True
    return g


def f0_neu(name, gate):
    x, sr = sf.read(ST + name + '.wav', dtype='float64')
    x = resample_poly(x[:266 * 48000], 1, 3)
    f, c, r = yin(x); r = 20 * np.log10(r + 1e-9)
    f = f[:NFR]; c = c[:NFR]; r = r[:NFR]
    v = (c < 0.25) & (r > -42) & (f > 70) & (f < 1000) & gate[:len(f)]
    m = midi(f); m[~v] = np.nan
    out = np.full(NFR, np.nan); out[:len(m)] = m
    return out


def f0_alt(k, thr=-42):
    f = d[k + '_f']; c = d[k + '_c']; r = d[k + '_r']
    v = (c < 0.25) & (r > thr) & (f > 70) & (f < 1000)
    m = midi(f); m[~v] = np.nan; return m


L = f0_alt('haupt')


def mass(V):
    res = {}
    for teil, (a, b, st) in TEILE.items():
        sel = (T >= a) & (T < b)
        both = sel & ~np.isnan(L) & ~np.isnan(V); alone = sel & ~np.isnan(V)
        iv = np.round(V[both] - L[both]).astype(int); pc = np.mod(iv, 12)
        tt = T[alone]; vv = np.round(V[alone]).astype(int) % 12
        reib = [(p not in akk(ti, st)) and any(((p - q) % 12) in (1, 11) for q in akk(ti, st)) for ti, p in zip(tt, vv)]
        dev = np.abs(V[alone] - np.round(V[alone]))
        h = {}
        for x in iv: h[int(x)] = h.get(int(x), 0) + 1
        res[teil] = dict(sek=round(alone.sum() * 0.01, 1), reib_lead=round(100 * np.isin(pc, [1, 11, 6]).mean(), 1) if len(pc) else None,
                         reib_akk=round(100 * np.mean(reib), 1) if reib else None, zwischen=round(100 * np.mean(dev > 0.35), 1) if len(dev) else None,
                         top=sorted(h.items(), key=lambda z: -z[1])[:4])
    # Mittel über R1–R3
    tot = {k: round(float(np.mean([res[t][k] for t in res if res[t][k] is not None])), 1) for k in ('reib_lead', 'reib_akk', 'zwischen')}
    tot['sek'] = round(sum(res[t]['sek'] for t in res), 1)
    return tot, res


def noten_arr(m):
    out = []; i = 0; n = len(m)
    while i < n:
        if np.isnan(m[i]): i += 1; continue
        j = i; seg = [m[i]]
        while j + 1 < n and not np.isnan(m[j + 1]) and abs(m[j + 1] - np.median(seg[-8:])) < 0.5: j += 1; seg.append(m[j])
        if j - i + 1 >= 12: out.append((T[i], T[j] + 0.01, float(np.median(seg))))
        i = j + 1
    return out


LN = noten_arr(L)


def lead_at(a, b):
    best = None; ov = 0
    for (la, lb, lp) in LN:
        o = min(b, lb) - max(a, la)
        if o > ov: ov = o; best = lp
    return best, ov


def mass_noten(V):
    tot = dl = dak = zw = 0; ivs = {}
    for teil, (a, b, st) in TEILE.items():
        for (na, nb, p) in noten_arr(V):
            if na < a or na >= b: continue
            dur = nb - na; q = int(round(p)); pc = q % 12
            tones = akk((na + nb) / 2, st)
            ra = (pc not in tones) and any(((pc - x) % 12) in (1, 11) for x in tones)
            lp, ov = lead_at(na, nb)
            rl = False
            if lp is not None and ov >= 0.05:
                iv = int(round(p - lp)); rl = (iv % 12) in (1, 11, 6); ivs[iv] = ivs.get(iv, 0) + dur
            tot += dur; dl += dur * rl; dak += dur * ra; zw += dur * (abs(p - q) > 0.35)
    s_ = sum(ivs.values()) or 1
    return dict(sek=round(tot, 1), reib_lead=round(100 * dl / max(tot, 1e-9), 1), reib_akk=round(100 * dak / max(tot, 1e-9), 1),
                zwischen=round(100 * zw / max(tot, 1e-9), 1), top=[(x, round(100 * v / s_)) for x, v in sorted(ivs.items(), key=lambda z: -z[1])[:4]])


if __name__ == '__main__':
    ALL = gate_frames([(0, 266)])
    gg = gate_frames(plan['gegen_fenster'])
    neu = {
        'ober (v12)': f0_neu('ober', gate_frames(plan['ober_gate'])),
        'unter (v12)': f0_neu('unter', gate_frames(plan['unter_gate'])),
        'gegen (v12)': f0_neu('gegen_t', gg),
        'doppel (v12)': f0_neu('doppel_t', gate_frames(plan['doppel_gate'])),
    }
    alt = {k + ' (v7-Spur)': f0_alt(k, -45 if k == 'gegen' else -42) for k in ['oberterz', 'unterterz', 'gegen', 'doppel', 'kiober', 'kiunter']}
    out = {}
    for name, V in list(alt.items()) + list(neu.items()):
        tot, res = mass(V); nt = mass_noten(V)
        out[name] = dict(noten=nt, frames=tot, teile=res)
        print('%-22s Noten %s' % (name, nt))
    np.savez(W + 'bau/plan/f0_v12.npz', **{k.split()[0]: v for k, v in neu.items()})
    json.dump(out, open(W + 'bau/plan/reibung.json', 'w'), indent=1)
