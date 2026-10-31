// VS5a T2: marks editor by hand (N2-VS5a-01), takes sheet entry, Audio folgt (one undo), audible playback e2e
import {launch, open5, sleep, clicks, toI16, onsetsRise as onsets0, deq, SR, OUT} from './n4-vs-p-reg-gs7-v3-vs5a-h.mjs';
const onsets = (y, thr, sr) => onsets0(y, sr);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, {touch: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const OFF = [12, -18, 30, -8, 45, -40, 60, 0, 22, -26, 15, -5];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clicks(T, 3.5);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const id = r.id, st = r.track;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
// takes sheet → button → editor
await p.evaluate(st => { SYNQUENZER.selectSlot(st, 0); return SYNQUENZER.tkSheet({t: st, s: 0}); }, st); await sleep(300);
const btn = await p.$('.tksheet button[data-a="wp"]');
ok(!!btn, 'takes sheet has [✎ Marken · Quantisieren]');
await btn.tap(); await sleep(400);
let G = await p.evaluate(() => SYNQUENZER.wpGeom());
ok(G && G.w > 200 && G.h >= 48, 'marks editor open, canvas ' + (G && Math.round(G.w) + '×' + Math.round(G.h)));
await p.screenshot({path: OUT + '/t2-editor.png'});
const snap = () => p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
const U = () => p.evaluate(() => SYNQUENZER.undoInfo().n);
// hold 1 s on a mark without moving → no data change
const P0 = await snap(), u0 = await U();
const vis = G.marks.map((mx, k) => ({mx, k})).filter(o => o.mx > G.x + 20 && o.mx < G.x + G.w - 60);
const m0 = vis[1], y = G.y + G.h * 0.5;
await p.mouse.move(m0.mx, y); await p.mouse.down(); await sleep(1000); await p.mouse.up(); await sleep(200);
ok(await snap() === P0 && await U() === u0 && !(await p.evaluate(() => !!document.querySelector('.pop.wpsel'))), 'hold 1 s on a mark: no data change, no sheet');
// hold 600 ms then drag 40 px → move only, one undo
const before = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).det;
await p.mouse.move(m0.mx, y); await p.mouse.down(); await sleep(600);
for (let d = 5; d <= 40; d += 5) { await p.mouse.move(m0.mx + d, y); await sleep(16); }
await p.mouse.up(); await sleep(200);
const I1 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const moved = I1.marks ? I1.marks.filter((k, i) => Math.abs(k.t - before[i].t) > 1e-6) : [];
const nx = before[m0.k + 1] ? before[m0.k + 1].t - 0.01 - before[m0.k].t : 1e9, exp = Math.min(40 / G.w * G.view.W, nx);
ok(await U() === u0 + 1 && I1.marks && I1.marks.length === before.length && moved.length === 1 && Math.abs(moved[0].t - before[m0.k].t - exp) < 0.004, 'hold 600 ms + drag 40 px: only moved (' + (moved[0] && ((moved[0].t - before[m0.k].t) * 1000).toFixed(1)) + ' ms, want ' + (exp * 1000).toFixed(1) + '), one undo');
// tap on an empty place → new mark, one undo
G = await p.evaluate(() => SYNQUENZER.wpGeom());
let ex = null; for (let xx = G.x + 30; xx < G.x + G.w - 30; xx += 4) if (G.marks.every(mx => Math.abs(mx - xx) > 18)) { ex = xx; break; }
const n1 = I1.marks.length, u1 = await U();
await p.touchscreen.tap(ex, y); await sleep(250);
const I2 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(I2.marks.length === n1 + 1 && await U() === u1 + 1, 'tap on empty place → new mark (' + n1 + ' → ' + I2.marks.length + '), one undo');
// tap on a mark → sheet [✕ Löschen] [Abbrechen]
G = await p.evaluate(() => SYNQUENZER.wpGeom());
const m2 = G.marks.find(mx => mx > G.x + 30 && mx < G.x + G.w - 30);
await p.touchscreen.tap(m2, y); await sleep(300);
const sheet = await p.evaluate(() => { const q = document.querySelector('.pop.wpsel'); return q ? Array.from(q.querySelectorAll('button')).map(b => b.textContent.trim()) : null; });
ok(sheet && sheet.join('|') === '✕ Löschen|Abbrechen', 'tap on a mark → sheet ' + JSON.stringify(sheet));
await p.screenshot({path: OUT + '/t2-sel.png'});
await (await p.$('.pop.wpsel button[data-a="no"]')).tap(); await sleep(200);
ok((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).marks.length === n1 + 1, '[Abbrechen] → nothing deleted');
await p.touchscreen.tap(m2, y); await sleep(300);
const u2 = await U();
await (await p.$('.pop.wpsel button[data-a="del"]')).tap(); await sleep(300);
const I3 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const toastTxt = await p.evaluate(() => { const t = document.getElementById('toast'); return t ? t.textContent : ''; });
ok(I3.marks.length === n1 && await U() === u2 + 1 && /Marke gelöscht/.test(toastTxt) && /Rückgängig/.test(toastTxt), '[✕ Löschen] → mark gone, one undo, toast: ' + JSON.stringify(toastTxt));
await p.evaluate(() => SYNQUENZER.undo()); await sleep(150);
ok((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).marks.length === n1 + 1, '↶ brings the mark back');
// chips: 1/16 → quantized (one undo), slider strength 50 on release = one undo
const u3 = await U();
await (await p.$('#wpSheet .qchips button[data-v="1/16"]')).tap(); await sleep(600);
let W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(W && W.res === '1/16' && await U() === u3 + 1, 'chip 1/16 → warp 1/16, one undo');
await p.evaluate(() => { const i = document.querySelector('#wpSheet .qrow input'); i.value = 50; i.dispatchEvent(new Event('input')); i.value = 40; i.dispatchEvent(new Event('input')); i.dispatchEvent(new Event('change')); });
await sleep(300);
W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(W.strength === 0.4 && await U() === u3 + 2, 'strength slider 40 % on release: one undo (' + W.strength + ')');
await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
ok((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp.strength === 1, '↶ → strength 100 % again');
// A/B button
await (await p.$('#wpSheet .wpab')).tap(); await sleep(150);
ok((await p.evaluate(() => SYNQUENZER.wpInfo().ab)) === true, 'A/B → original');
await p.screenshot({path: OUT + '/t2-quant.png'});
await (await p.$('#wpSheet .sh-x')).tap(); await sleep(150);
ok(!(await p.evaluate(() => SYNQUENZER.wpInfo().ab)) && !(await p.evaluate(() => document.getElementById('wpSheet').classList.contains('open'))), '✕ closes, A/B back to the quantized version');
// audible e2e: play the STIMME clip, record the output, onset intervals are multiples of 1/16 (±2 ms) where quantized
async function playRec(sec) {
  await p.evaluate(() => { SYNQUENZER.stop(); window.__recOut(); });
  await p.evaluate(st => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); }, st);
  await sleep(sec * 1000);
  const d = await p.evaluate(() => { SYNQUENZER.stop(); const a = window.__rec; let n = 0; for (const b of a) n += b.length; const y = new Float32Array(n); let o = 0; for (const b of a) { y.set(b, o); o += b.length; } window.__sp.disconnect(); return {y: Array.from(y), sr: window.__ctx.sampleRate}; });
  return d;
}
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 1}, {grid: '1/16'}), r1);
const rec = await playRec(4.5);
const YY = Float32Array.from(rec.y); { let pk = 0, at = 0; YY.forEach((v, i) => { if (Math.abs(v) > pk) { pk = Math.abs(v); at = i; } }); const env = []; for (let i = 0; i < YY.length; i += 2400) { let m = 0; for (let j = i; j < i + 2400 && j < YY.length; j++) m = Math.max(m, Math.abs(YY[j])); env.push(m.toFixed(2)); } console.log('rec', YY.length, rec.sr, 'pk', pk.toFixed(3), 'at', (at / rec.sr).toFixed(3), env.join(' ')); }
const on = onsets(YY, 0.02, rec.sr).slice(0, 12);
const iv = on.slice(1).map((t, k) => (t - on[k]) * 1000);
const offGrid = iv.map(v => Math.abs(v - Math.round(v / 125) * 125));
console.log('INFO', JSON.stringify(await p.evaluate(id => { const i = SYNQUENZER.wpInfo(id); return {ready: i.ready, cached: i.cached, renders: i.renders, last: i.last}; }, id)), 'onsets', on.map(t => t.toFixed(3)).join(' '));
console.log('played onset intervals ms', iv.map(v => v.toFixed(1)).join(' '));
ok(on.length >= 10 && offGrid.filter(e => e <= 2.5).length >= iv.length - 2, 'heard: onset intervals on the 1/16 grid (±2.5 ms) except around the click outside ±40 %: ' + offGrid.map(e => e.toFixed(1)).join(' '));
await p.evaluate(() => SYNQUENZER.wpAB(true));
await sleep(100);
const rec0 = await playRec(4.5), on0 = onsets(Float32Array.from(rec0.y), 0.02, rec0.sr).slice(0, 12), iv0 = on0.slice(1).map((t, k) => (t - on0[k]) * 1000);
ok(iv0.filter(v => Math.abs(v - Math.round(v / 125) * 125) > 5).length >= 6, 'A/B original heard: intervals off grid ' + iv0.map(v => v.toFixed(1)).join(' '));
await p.evaluate(() => SYNQUENZER.wpAB(false));
// Audio folgt: MELODIE clip linked with the take; quantize → notes + take in ONE undo; undo restores both
await p.evaluate(id => SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}, {t: 0.53, d: 0.4, n: 62, v: 0.8}, {t: 1.06, d: 0.4, n: 64, v: 0.8}], take: id}), id);
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: 'off'}), id);
const PA = await p.evaluate(() => SYNQUENZER.project()), ua = await U();
await p.evaluate(() => SYNQUENZER.quantizeClip(5, 0, {grid: '1/16'})); await sleep(400);
const ui = await p.evaluate(() => SYNQUENZER.undoInfo());
const WF = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(ui.n === ua + 1 && ui.top.kind === 'group' && ui.top.items.join() === 'clip,takes' && WF && WF.res === '1/16', 'Audio folgt: MELODIE quantize takes the take along (one undo ' + JSON.stringify(ui.top) + ')');
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
ok(deq(await p.evaluate(() => SYNQUENZER.project()), PA), '↶ → notes and take deep-equal to before');
// quantize sheet: switch „Audio folgt“ visible and off → take unchanged
await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); }); await sleep(100);
await p.evaluate(() => openQuantSheet(5, 0)); await sleep(200);
await (await p.$('#qSheet .qchips button[data-v="1/8"]')).tap(); await sleep(150);
await (await p.$('#qSheet .qact .go')).tap(); await sleep(500);
const uq = await p.evaluate(() => SYNQUENZER.undoInfo().top), WQ = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(uq.kind === 'group' && uq.items.join() === 'clip,takes' && WQ && WQ.res === '1/8', 'quantize sheet [Anwenden] with „Audio folgt“ on: notes + take in one undo, take on 1/8 ' + JSON.stringify(uq));
await p.evaluate(() => SYNQUENZER.undo()); await sleep(150);
await p.evaluate(() => openQuantSheet(5, 0)); await sleep(200);
await (await p.$('#qSheet .qfol')).tap(); await (await p.$('#qSheet .qchips button[data-v="1/4"]')).tap(); await sleep(100);
await (await p.$('#qSheet .qact .go')).tap(); await sleep(500);
const I9 = await p.evaluate(id => SYNQUENZER.wpInfo(id), id), uq2 = await p.evaluate(() => SYNQUENZER.undoInfo().top);
ok(!I9.warp && I9.follow === false && uq2.kind === 'group', '„Audio folgt“ off: take not quantized, the switch is stored with the same undo (' + JSON.stringify(uq2) + ')');
console.log('errors', JSON.stringify(H.errs));
ok(!H.errs.length, 'no console errors');
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
