// MK-P extra: TEMPO LED in quarters of the song tempo (MK5 binding on the plate), the probe case "Bedienfeld" (MK-P-09 g),
// tab GERÄT ↔ SPIEL without a sheet rebuild keeps the zoom, the plate DOM and the frame (MK-P-13), and the wheels in SPIEL quer
import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const fail = [], R = {}; const ok = (id, c, info) => { if (!c) fail.push(id + ': ' + info); };
const page = await open(b, process.argv[2], 'X');
R.led = await page.evaluate(async () => { ensureAudio(); SYNQUENZER.setBpm(120); await new Promise(r => setTimeout(r, 300)); const t = []; let last = null; const t0 = performance.now();
  await new Promise(res => { const f = () => { const e = SYNQUENZER.mkPanel().elements.find(x => x.id === 'arp.led'), v = e.led; if (v !== last) { t.push([Math.round(performance.now() - t0), v]); last = v; } if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  const on = t.filter(x => x[1] === 'on').map(x => x[0]), d = on.slice(1).map((x, k) => x - on[k]); return {n: on.length, d}; });
ok('TEMPO-LED', R.led.n >= 7 && R.led.d.every(x => Math.abs(x - 500) <= 40), JSON.stringify(R.led));
R.tab = await page.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)), M = MKUI; M.zoomTo(4, false); await sl(300); const fr0 = M.P.el.fr, r0 = JSON.stringify(fr0.getBoundingClientRect()), plate = M.PL.el, sh = EL.synthSheet.firstChild;
  const tab = t => { const b = [...EL.synthSheet.querySelectorAll('.sh-tabs .tab')].find(x => x.dataset.tab === t); b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 9, clientX: 1, clientY: 1})); b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 9, clientX: 1, clientY: 1})); b.click(); };
  M.view({ansicht: 'spiel'}); await sl(400); const sp = !!(M.P.sp && M.P.sp.root.isConnected && !M.P.sp.root.hidden), kbq = EL.app.classList.contains('mkqkb'), same1 = M.P.el.fr === fr0 && EL.synthSheet.firstChild === sh;
  M.view({ansicht: 'ganz'}); M.P.ansicht = 'zoom'; M.view({}); await sl(50); M.zoomTo(4, false);
  M.tabFast('geraet'); await sl(400);
  const back = {halt: M.P.halt, ansicht: M.P.ansicht, plate: M.PL.el === plate && plate.isConnected, fr: M.P.el.fr === fr0, rect: JSON.stringify(fr0.getBoundingClientRect()) === r0, kbq: EL.app.classList.contains('mkqkb'), tr: M.P.el.hull.style.transform};
  return {sp, kbq, same1, back}; });
ok('Reiter', R.tab.sp && R.tab.kbq && R.tab.same1 && R.tab.back.plate && R.tab.back.fr && R.tab.back.rect && !R.tab.back.kbq && R.tab.back.halt === 4 && R.tab.back.ansicht === 'zoom' && !/100000/.test(R.tab.back.tr), JSON.stringify(R.tab));
R.probe = await page.evaluate(async () => { const r = await SYNQUENZER.perfProbe(['panel'], {sec: 4}); const c = r && r.cases && r.cases[0]; return c ? {fall: c.fall, frames_ok: c.frames_ok, fps: c.fps_med, panel: c.panel, net: r.net} : r; });
ok('Probe Bedienfeld', R.probe && R.probe.fall === 'panel' && R.probe.frames_ok && R.probe.net === 0, JSON.stringify(R.probe));
ok('konsole', !page.errs.length, page.errs.join(' | '));
console.log(JSON.stringify(R)); console.log('FEHLER', fail.length, JSON.stringify(fail)); await b.close();
