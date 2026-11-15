// Prüfer-Sonde SPKFIX (Seite): Loop→Matrix zweimal + ↶, Nachbau nach ↶ der Ebene (veraltet?), Neuladen. Aufruf: node p-spkfix.mjs <html>
import {start, page} from '../spk7/lib.mjs';
const file = process.argv[2], E = await start(file), errs = [], out = {};
const openSp = async P => { const {p, tap} = P; await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tap(mb); await p.waitForTimeout(500); };
try {
  const P = await page(E, 926, 428, errs), {p} = P; await openSp(P);
  const id = await p.evaluate(async () => { const sr = 48000, n = sr * 4, L = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; let v = 0; for (let h = 1; h < 6; h++) v += Math.sin(2 * Math.PI * 98 * h * t) / h; L[i] = 0.15 * v + 0.1 * Math.sin(2 * Math.PI * 523.25 * t); }
    const r = await __spk.load({name: 'Pruef', sr, ch: [L], grid: {bpm: 100, off: 0, ts: '4/4'}}); await __spk.page.open({id: r.meta.id});
    const q = await __spk.mask({von: 'orig', nach: {art: 'bass', name: 'Tief'}, sel: {art: 'rect', t0: 0, t1: 4, f0: 60, f1: 400}}); spk1Got(SPK1.ui, q); return r.meta.id; });
  await p.waitForTimeout(500);
  out.loop = await p.evaluate(async () => { window.micAvail = () => true; const U = SPK1.ui; U.loop = [0, 1]; U.lpDoc = SPK1.doc;
    const nm = r => r ? (S.tracks[r.track] ? S.tracks[r.track].name : "FEHLT(" + r.track + ")") + "/" + r.scene + (r.track != null ? "" : " raw=" + JSON.stringify(Object.keys(r))) : null, nt0 = NT();
    U.act = 'L1'; const a = await spk2MxAudio(U); const nt1 = NT(); const b = await spk2MxAudio(U); const nt2 = NT();
    U.act = 'orig'; const c = await spk2MxAudio(U);
    const u0 = UNDO.length; undo(); const afterU1 = {nt: NT(), clipB: b ? !!S.tracks[b.track].clips[b.scene] : null};
    undo(); undo(); const afterU3 = {nt: NT(), names: S.tracks.map(t => t && t.orig ? t.name : null).filter(Boolean)};
    // gewöhnlicher Audio-Import-Weg (kein Loop): imp1OrigT ohne Schritt-Name → wie Basis
    const plain = imp1OrigT();
    return {erste: nm(a), zweite: nm(b), orig: nm(c), nt: [nt0, nt1, nt2], undoN: u0, afterU1, afterU3, plain: plain >= 0 ? S.tracks[plain].name : plain}; });
  // Nachbau auf L1, dann L1 per ↶ (nicht „löschen“) entfernen, neue Ebene anlegen
  out.kl = await p.evaluate(async () => { const U = SPK1.ui, doc = SPK1.doc; spk1Got(U, await __spk.spk2.noten('L1')); const r = await __spk.spk2.klang.open('L1'); await new Promise(z => setTimeout(z, 800));
    const has1 = window.__spk11.kl('L1'); let m = await spk1Call('open', {doc}); const inDoc = !!(m.meta.spkKl && m.meta.spkKl.L1);
    let labels = []; for (let k = 0; k < 4; k++) { const u = await spk1Call('undo', {doc}); if (!u || !u.meta) break; labels.push(u.label); spk1Got(U, u); if (!u.meta.layers.some(l => l.id === 'L1')) break; }
    m = await spk1Call('open', {doc}); const gone = !m.meta.layers.some(l => l.id === 'L1');
    const q = await __spk.mask({von: 'orig', nach: {art: 'lead', name: 'Hoch'}, sel: {art: 'rect', t0: 0, t1: 4, f0: 450, f1: 700}}); spk1Got(U, q);
    const nid = q.meta.layers[q.meta.layers.length - 1].id;
    return {nachbau: !!(r && r.best), has1, inDoc, undo: labels, L1weg: gone, neueEbene: nid + ':' + q.meta.layers[q.meta.layers.length - 1].name, klNeueEbene: window.__spk11.kl(nid)}; });
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1200); await openSp(P);
  out.kl2 = await p.evaluate(async id => { await __spk.page.open({id}); await new Promise(z => setTimeout(z, 600)); const U = SPK1.ui; return {layers: U.meta.layers.map(l => l.id + ':' + l.name), klL1: window.__spk11.kl('L1'), spkKl: Object.keys(U.meta.spkKl || {})}; }, id);
} catch (e) { out.fehler = String(e && e.stack || e); }
out.errs = errs.slice(0, 5); console.log(JSON.stringify(out));
await E.b.close(); E.srv.close();
