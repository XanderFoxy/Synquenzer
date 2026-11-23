import numpy as np
D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/analyse/dyn/'; SR = 48000
for m in ['m11', 'm10']:
    for pn in ['Strophen', 'Refrains']:
        hs = np.load(D + 'ir_%s_%s.npy' % (m, pn)); e = (hs ** 2).sum(0)
        i0 = int(np.argmax(e[:SR // 2])); Ed = e[max(i0 - 72, 0):i0 + 192].sum()
        w = int(.01 * SR)  # 10-ms-Dichte, relativ Direkt-Energie
        dens = lambda t: 10 * np.log10(e[i0 + int(t * SR):i0 + int(t * SR) + w].sum() / Ed + 1e-20)
        noise = 10 * np.log10(np.mean([e[len(e) - k * w - w:len(e) - k * w].sum() for k in range(20, 200)]) / Ed)
        ts = [.005, .015, .03, .05, .08, .12, .18, .25, .3, .375, .5, .6, .75, 1.0, 1.25, 1.5, 2.0, 2.5]
        dv = [dens(t) for t in ts]
        # Abklingrate per Regression auf 10-ms-Dichte 0,1-1,2 s (nur ueber Rauschen+6 dB)
        tt = np.arange(.1, 1.6, .01); dd = np.array([dens(t) for t in tt]); ok = dd > noise + 6
        sl = np.polyfit(tt[ok], dd[ok], 1)[0] if ok.sum() > 10 else np.nan
        # gleiches nur bis 0,45 s (vor Echo)
        tt2 = np.arange(.03, .45, .01); dd2 = np.array([dens(t) for t in tt2]); sl2 = np.polyfit(tt2, dd2, 1)[0]
        print('%s %-8s Rauschboden %.1f dB/10ms | RT60 aus 0,1-1,6 s: %.2f s | aus 0,03-0,45 s: %.2f s' % (m, pn, noise, -60 / sl, -60 / sl2))
        print('    Dichte dB/10ms: ' + ' '.join('%gs:%.0f' % (t, v) for t, v in zip(ts, dv)))
