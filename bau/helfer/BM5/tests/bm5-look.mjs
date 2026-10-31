// BM5-01/02/10/11/12: arrangement, hit zones >= 44, nothing cut, no overlap, no scroll, no layout jump, rotation, safe area,
// brand, performance; screenshots into ../bm5-shots/. Usage: node bm5-look.mjs [formats]  (XWs / L1s = with the iPhone safe area)
import {launch, open, sleep, VP, APP} from './lib.mjs';
import fs from 'fs';
const FM = Object.assign({}, VP, {XWs: [926, 428], L1s: [844, 390]});
const ONLY = (process.argv[2] || 'XW,XWs,XP,P1,P2,P3,L1,L1s,L2').split(',');
const SHOTS = new URL('../bm5-shots/', import.meta.url).pathname; fs.mkdirSync(SHOTS, {recursive: true});
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else if (process.env.V) console.log('PASS ' + m); };
const br = await launch();
const MEAS = () => {
  const out = {zones: {}, labels: [], frame: null, plate: null, page: [document.scrollingElement.scrollWidth, document.scrollingElement.clientWidth, document.scrollingElement.scrollHeight, document.scrollingElement.clientHeight]};
  const fr = document.querySelector('.bmfr'), pl = document.querySelector('.bmplate'); const R_ = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => Math.round(v * 100) / 100); };
  out.frame = R_(fr); out.plate = R_(pl); out.vw = [innerWidth, innerHeight];
  const hit = (b, lim = 40) => { const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    const h = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); }; if (!h(cx, cy)) return [0, 0];
    const ext = (dx, dy) => { let a = 0, c = 0; for (let k = 1; k <= lim; k++) { if (!h(cx + dx * k, cy + dy * k)) { c = k; break; } a = k; } if (!c) return a; for (let i = 0; i < 5; i++) { const m = (a + c) / 2; if (h(cx + dx * m, cy + dy * m)) a = m; else c = m; } return a; };
    return [ext(-1, 0) + ext(1, 0), ext(0, -1) + ext(0, 1)].map(v => Math.round(v * 10) / 10); };
  for (const b of document.querySelectorAll('.bmz')) { const f = b.querySelector('.bk'), k = b.querySelector('.kn'), zr = R_(b); out.zones[b.dataset.k] = {r: zr, face: f ? R_(f) : k ? [zr[0] + zr[2] / 2 - k.offsetWidth / 2, zr[1] + zr[3] / 2 - k.offsetHeight / 2, k.offsetWidth, k.offsetHeight] : zr, hit: b.classList.contains('bm-disp') ? null : hit(b), kind: b.className}; }
  for (const t of document.querySelectorAll('.bmln text, .bmov text, .bmic')) { const r = t.getBoundingClientRect(); out.labels.push({t: t.textContent, r: [r.left, r.top, r.width, r.height]}); }
  const ov = document.querySelector('.bmov'); out.ov = ov ? R_(ov) : null;
  out.wheels = [...document.querySelectorAll('#bmWh .bmwheel')].map(e => ({r: R_(e), hit: hit(e, 120)}));
  out.text = document.getElementById('synthSheet').innerText + ' ' + [...document.querySelectorAll('.bmln text,.bmov text')].map(t => t.textContent).join(' ');
  out.css = document.getElementById('bmcss') ? document.getElementById('bmcss').textContent : '';
  return out;
};
const inter = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
const inside = (a, b, e = .6) => a[0] >= b[0] - e && a[1] >= b[1] - e && a[0] + a[2] <= b[0] + b[2] + e && a[1] + a[3] <= b[1] + b[3] + e;
const BRAND = /kodamo|mask ?1(?![0-9])|essence|korg|microkorg|radias|dwgs|\bnord\b|kompakt/i;
const ORDER_A = ['vol', 'octL', 'octR', 'voice', 'layer', 'split', 'init', 'write', 'global', 'disp', 'parL', 'parR'], ORDER_B = ['seq', 'osc1', 'osc2', 'noise', 'filter', 'lfo1', 'lfo2', 'fx', 'arp', 'pitch', 'mod', 'general', 'value', 'compare'];
const FOLD = [['vol', 'octL', 'octR', 'voice', 'layer', 'split'], ['init', 'write', 'global', 'disp', 'parL', 'parR'], ['seq', 'osc1', 'osc2', 'noise', 'filter', 'lfo1', 'lfo2'], ['fx', 'arp', 'pitch', 'mod', 'general', 'value', 'compare']];
const skizze = {};
for (const nm of ONLY) {
  const [w, h] = FM[nm]; const p = await open(br, w, h, APP); const safe = nm.endsWith('s');
  if (safe) await p.addStyleTag({content: '#app{padding:0 47px 21px 47px !important}'});
  await p.evaluate(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) __lt.push(Math.round(e.duration)); }).observe({type: 'longtask', buffered: false}); } catch (e) {} window.__ls = 0; window.__lsS = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) { const S_ = e.sources || [], pan = S_.some(s => s.node && s.node.closest && s.node.closest('.bmfr, #kbArea')); if (pan || !S_.length) __ls += e.value; else __lsH = (window.__lsH || 0) + e.value; for (const s of S_) __lsS.push((s.node && (s.node.id || s.node.className)) + ''); } }).observe({type: 'layout-shift', buffered: false}); } catch (e) {} });
  await p.evaluate(async () => { SYNQUENZER.newProject(); await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'bm'); SYNQUENZER.selectTrack(0); });
  await sleep(500); await p.evaluate(() => { __lt.length = 0; }); const t0 = Date.now();
  await p.evaluate(() => SYNQUENZER.openEditor()); await sleep(900);
  const lt = await p.evaluate(() => __lt.slice());
  const M = await p.evaluate(MEAS); const land = w > h;
  // BM5-02 every target >= 44 x 44, no overlap, inside the frame, nothing cut, no page scroll
  const Zs = Object.entries(M.zones), small = Zs.filter(([k, z]) => z.hit && (z.hit[0] < 43.5 || z.hit[1] < 43.5));
  ok(Zs.length === 26 && Zs.filter(([, z]) => /bm-key/.test(z.kind)).length === 23 && Zs.filter(([, z]) => /bm-knob/.test(z.kind)).length === 2, nm + ' 23 Tasten + 2 Drehgeber + Anzeige');
  ok(!small.length, nm + ' Treffer ≥ 44×44 ' + (small.length ? JSON.stringify(small.map(([k, z]) => k + ':' + z.hit)) : 'kleinste ' + Math.min(...Zs.filter(([, z]) => z.hit).map(([, z]) => Math.min(...z.hit)))));
  let ovl = []; for (let a = 0; a < Zs.length; a++) for (let b = a + 1; b < Zs.length; b++) if (inter(Zs[a][1].r, Zs[b][1].r) > .5) ovl.push(Zs[a][0] + '/' + Zs[b][0]);
  ok(!ovl.length, nm + ' keine Überlappung ' + ovl.join(','));
  const out = Zs.filter(([, z]) => !inside(z.r, M.frame)).map(([k]) => k).concat(M.labels.filter(l => !inside(l.r, M.frame)).map(l => 'Label ' + l.t)); if (M.ov && !inside(M.ov, M.frame)) out.push('Masken-Übersicht');
  ok(!out.length, nm + ' alles im Rahmen ' + out.join(','));
  let lov = []; for (let a = 0; a < M.labels.length; a++) for (let b = a + 1; b < M.labels.length; b++) if (inter(M.labels[a].r, M.labels[b].r) > 1) lov.push(M.labels[a].t + '/' + M.labels[b].t);
  ok(!lov.length, nm + ' Beschriftungen überlappen nicht ' + lov.join(','));
  const lz = []; for (const l of M.labels) for (const [k, z] of Zs) if (z.face && inter(l.r, z.face) > .5) lz.push(l.t + '/' + k);
  ok(!lz.length, nm + ' Beschriftungen nicht auf Tasten ' + lz.join(','));
  ok(M.page[0] <= M.page[1] && M.page[2] <= M.page[3], nm + ' kein Scrollen ' + M.page);
  ok(inside(M.frame, [0, 0, w, h]), nm + ' Rahmen im Bildschirm ' + M.frame);
  ok(M.wheels.length === 2 && M.wheels.every(x => x.hit[0] >= 43.5 && x.hit[1] >= 43.5), nm + ' Räder ≥ 44 ' + M.wheels.map(x => x.hit).join(' '));
  if (safe) ok(M.frame[0] >= 47 && M.frame[0] + M.frame[2] <= w - 47, nm + ' Safe-Area: Rahmen ' + M.frame.slice(0, 3).join(' ') + ' (nutzbar ' + (w - 94) + ')');
  // BM5-01 arrangement: rows, order, groups; display between Global and Param; Value between General and Compare; Vol left; mask overview
  const cx = k => M.zones[k].r[0] + M.zones[k].r[2] / 2, cy = k => M.zones[k].r[1] + M.zones[k].r[3] / 2;
  if (land) {
    const rowOk = L => L.every(k => Math.abs(cy(k) - cy(L[0])) < 1) && L.every((k, j) => !j || cx(k) > cx(L[j - 1]));
    ok(rowOk(ORDER_A) && rowOk(ORDER_B) && cy(ORDER_B[0]) > cy(ORDER_A[0]), nm + ' quer: Reihe A und B in Gerätereihenfolge');
    ok(Math.abs(cx('vol') - cx('seq')) < 1 && cx('value') > cx('general') && cx('value') < cx('compare'), nm + ' Vol über Seq/Env, Value zwischen General und Compare');
    ok(w < 700 ? !M.ov : !!M.ov && M.ov[0] > M.zones.compare.r[0], nm + ' Masken-Übersicht ' + (w < 700 ? 'entfällt (L2)' : 'rechts'));
  } else {
    const rows = FOLD.map(L => L.map(cy)); const rowOk = (L, j) => L.every(k => Math.abs(cy(k) - cy(L[0])) < 1) && L.every((k, q) => !q || cx(k) > cx(L[q - 1]));
    ok(FOLD.every(rowOk) && rows.every((r, j) => !j || r[0] > rows[j - 1][0]), nm + ' hoch: gefaltet A1 │ A2 │ B1 │ B2 in Reihenfolge');
    ok(FOLD.every(L => L.length <= 7) && Math.max(...Zs.map(([, z]) => z.r[0] + z.r[2])) - Math.min(...Zs.map(([, z]) => z.r[0])) <= 308 + 6 * 8 + 1, nm + ' höchstens 7 Zonen je Zeile');
    const wantOv = w >= 390 && h >= 800; ok(wantOv ? !!M.ov && M.ov[1] > M.zones.compare.r[1] : !M.ov, nm + ' Masken-Übersicht ' + (wantOv ? '5. Zeile' : 'entfällt'));
  }
  skizze[nm] = Object.fromEntries(Zs.map(([k, z]) => [k, [(z.r[0] - M.frame[0]) / M.frame[2], (z.r[1] - M.frame[1]) / M.frame[3], z.r[2] / M.frame[2], z.r[3] / M.frame[3]].map(v => Math.round(v * 1e4) / 1e4)]));
  // BM5-11 brand: DOM text, panel CSS
  ok(!BRAND.test(M.text) && !BRAND.test(M.css) && (M.text.match(/Bit\s+Mask/g) || []).length >= 1 && !/Bit\s*Mask ?\d/.test(M.text), nm + ' Marke: kein Hersteller-/Gerätename, BM_NAME nicht vor Ziffer ' + ((M.text.match(BRAND) || [''])[0] + ' ' + (M.text.match(/Bit Mask ?\d/) || [''])[0] + ' ' + (M.text.match(/Bit Mask/g) || []).length));
  // BM5-10 opening: no task > 50 ms (the app's own opening long task listed separately), display drawn only on change, fps
  console.log('     ' + nm + ' Öffnen: longtasks ' + JSON.stringify(lt) + ' (Block ' + (await p.evaluate(() => BML.ms.toFixed(1))) + ' ms)');
  const segW = await p.evaluate(async () => { let k = 0; const mo = new MutationObserver(l => { k += l.length; }); mo.observe(document.querySelector('.bmseg'), {attributes: true, subtree: true}); await new Promise(r => setTimeout(r, 1500)); mo.disconnect(); return k; });
  ok(segW === 0, nm + ' Anzeige zeichnet nur bei Änderung (Ruhe 1,5 s: ' + segW + ' Änderungen)');
  const fps = await p.evaluate(() => new Promise(r => { let k = 0, t0 = performance.now(), mx = 0, last = t0; const f = t => { k++; mx = Math.max(mx, t - last); last = t; if (t - t0 < 2000) requestAnimationFrame(f); else r([Math.round(k / ((t - t0) / 1000)), Math.round(mx)]); }; requestAnimationFrame(f); }));
  ok(fps[0] >= 58, nm + ' Bilder/s mit offenem Bedienfeld ' + fps.join(' / max ms '));
  await p.screenshot({path: SHOTS + nm + '-voice.png'});
  // BM5-02 no layout jump on mode / Seq-Env / Layer / multi / compare changes
  const base = JSON.stringify(Object.fromEntries(Zs.map(([k, z]) => [k, z.r]))) + M.frame;
  const states = [['osc1'], ['seq'], ['osc1'], ['seq'], ['mod'], ['global'], ['layer'], ['voice'], ['split'], ['voice'], ['voice'], ['lfo1'], ['init'], ['init']];
  const jumps = []; await p.evaluate(() => { __ls = 0; __lsS = []; });
  for (const [k] of states) { await p.evaluate(k => BMUI.keyDown(k), k); await sleep(80);
    const m2 = await p.evaluate(() => { const o = {}; for (const b of document.querySelectorAll('.bmz')) { const r = b.getBoundingClientRect(); o[b.dataset.k] = [r.left, r.top, r.width, r.height].map(v => Math.round(v * 100) / 100); } const f = document.querySelector('.bmfr').getBoundingClientRect(); return JSON.stringify(o) + [f.left, f.top, f.width, f.height].map(v => Math.round(v * 100) / 100); });
    if (m2 !== base) jumps.push(k); }
  ok(!jumps.length, nm + ' kein Layout-Sprung bei ' + states.length + ' Wechseln ' + jumps.join(','));
  ok((await p.evaluate(() => __ls)) < .001, nm + ' layout-shift im Bedienfeld/Tastatur 0 (Kopfzeile der App A/B: ' + (await p.evaluate(() => (window.__lsH || 0).toFixed(4))) + ') ' + (await p.evaluate(() => __ls + ' ' + __lsS.slice(0, 6).join('|'))));
  // pictures for Xander: Osc1, Env, Mod, Global
  for (const [k, pre] of [['osc1', []], ['osc1', ['seq']], ['mod', []], ['global', []]]) { await p.evaluate(([k, pre]) => { const P = BMUI.P; P.env = false; for (const x of pre) BMUI.keyDown(x); P.mode = null; BMUI.keyDown(k); }, [k, pre]); await sleep(700);
    await p.screenshot({path: SHOTS + nm + '-' + (pre.length ? 'env' : k) + '.png'}); }
  await p.evaluate(() => { BMUI.P.env = false; BMUI.keyDown('seq'); BMUI.keyDown('seq'); });
  ok(!p.errs.length, nm + ' keine Konsolenfehler ' + p.errs.slice(0, 2));
  await p.context().close();
}
// rotation: XP → XW → XP on one page, the panel the same as freshly opened in each
{ const p = await open(br, 428, 926, APP);
  await p.evaluate(async () => { SYNQUENZER.newProject(); SYNQUENZER.setEngine(0, 'bm'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(800);
  const a = await p.evaluate(() => JSON.stringify(SYNQUENZER.bmPanel().zones)); await p.setViewportSize({width: 926, height: 428}); await sleep(900);
  const I = await p.evaluate(() => SYNQUENZER.bmPanel()); ok(I.land && I.zones.compare.rect[2] >= 44, 'Drehen hoch → quer: ganzes Feld');
  await p.setViewportSize({width: 428, height: 926}); await sleep(900); const b = await p.evaluate(() => JSON.stringify(SYNQUENZER.bmPanel().zones));
  ok(a === b, 'Drehen zurück: gleiche Lage wie vorher'); ok(!p.errs.length, 'Drehen ohne Fehler ' + p.errs.slice(0, 2)); await p.context().close(); }
fs.writeFileSync(new URL('./bm-skizze.json', import.meta.url).pathname, JSON.stringify(skizze, null, 0).replace(/\],"/g, '],\n"'));
console.log('look: ' + (n - fail) + '/' + n + ' PASS' + (fail ? ', ' + fail + ' FAIL' : ''));
await br.close(); process.exit(fail ? 1 : 0);
