import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['W', 844, 1180]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const out = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), o = [];
    const m = () => { const e = document.querySelector('#songView .sv-rec'), t = e.lastChild; return t.textContent + ' ' + e.scrollWidth + '/' + e.clientWidth + (e.scrollWidth > e.clientWidth + 1 ? ' CLIPPED' : ''); };
    const pl = () => { const e = document.querySelector('#songView .sv-play'); return e.textContent.trim() + ' ' + e.scrollWidth + '/' + e.clientWidth; };
    const lo = () => { const e = document.querySelector('#songView .sv-loop'); return e.textContent.trim() + ' ' + e.scrollWidth + '/' + e.clientWidth; };
    Q.newProject({init: true}); Q.songView(true); await sl(300); o.push('empty: ' + m());
    const K = {root: 9, scale: 'aeolian'}; Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: 1, n: 57, v: .8}]}); Q.songFromChain([{scene: 0, bars: 2}]); await sl(300); o.push('song(new proj): ' + m());
    Q.songRecTargets({clips: true, chords: true, notes: false, mel: false}); await sl(200); o.push('clips+akk: ' + m());
    Q.songRecTargets({clips: true, chords: true, notes: true, mel: true}); await sl(200); o.push('all: ' + m());
    o.push('play: ' + pl()); o.push('loop: ' + lo());
    return o; });
  console.log(name, vp, JSON.stringify(out)); await b.close();
}
