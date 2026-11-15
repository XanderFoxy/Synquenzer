// Prüfer-Sonde SPKFIX (4) Loop→Matrix: Namen direkt nach jedem Schritt. Aufruf: node p-loop.mjs <html> <ebenen-name> <reihenfolge z.B. L1,L1,orig>
import {start, page} from '../spk7/lib.mjs';
const file = process.argv[2], lname = process.argv[3] || 'Tief', order = (process.argv[4] || 'L1,L1,orig').split(','), E = await start(file), errs = [], out = {};
try {
  const P = await page(E, 428, 926, errs), {p, tap} = P;
  await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(500);
  out.r = await p.evaluate(async ([lname, order]) => { const sr = 48000, n = sr * 4, L = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; let v = 0; for (let h = 1; h < 6; h++) v += Math.sin(2 * Math.PI * 98 * h * t) / h; L[i] = 0.15 * v + 0.1 * Math.sin(2 * Math.PI * 523.25 * t); }
    const r = await __spk.load({name: 'Pruef', sr, ch: [L], grid: {bpm: 100, off: 0, ts: '4/4'}}); await __spk.page.open({id: r.meta.id});
    const q = await __spk.mask({von: 'orig', nach: {art: 'bass', name: lname}, sel: {art: 'rect', t0: 0, t1: 4, f0: 60, f1: 400}}); spk1Got(SPK1.ui, q);
    await new Promise(z => setTimeout(z, 400));
    window.micAvail = () => true; const U = SPK1.ui; U.loop = [0, 1]; U.lpDoc = SPK1.doc; const res = [];
    for (const lid of order) { U.act = lid; const x = await spk2MxAudio(U); res.push({lid, lname: (U.meta.layers.find(l => l.id === lid) || {}).name, to: x ? S.tracks[x.track].name + '#' + x.track + '/' + x.scene : null, origTracks: S.tracks.map((t, i) => t && t.orig ? i + ':' + t.name : null).filter(Boolean).join(',')}); }
    const u0 = UNDO.length; let k = 0; while (UNDO.length && k < order.length) { undo(); k++; }
    return {res, undoSchritte: u0, nachUndo: {nt: NT(), orig: S.tracks.map((t, i) => t && t.orig ? i + ':' + t.name : null).filter(Boolean)}}; }, [lname, order]);
} catch (e) { out.fehler = String(e && e.stack || e); }
out.errs = errs.slice(0, 5); console.log(JSON.stringify(out));
await E.b.close(); E.srv.close();
