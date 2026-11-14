// GD1-Test: node gd1-test.mjs <abs kandidat> <abs basis> <abs out-dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [F, B, OUT] = process.argv.slice(2); fs.mkdirSync(OUT, {recursive: true});
const SIZES = [[428, 926, 'hoch'], [926, 428, 'quer'], [926, 370, 'quer370']];
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = {}; let fail = 0; const ok = (k, v, info) => { res[k] = {ok: !!v, info}; if (!v) fail++; };
async function page(file, w, h) {
  const p = await br.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push('console: ' + m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  return p;
}
const jump = async (p, id) => { await p.evaluate(() => ui1Home()); await p.evaluate(id => SYNQUENZER.ui1.jump(id), id); await p.waitForTimeout(900);
  return p.evaluate(() => { const j = SYNQUENZER.ui1.lastJump(), r = UI1.ring && UI1.ring.r, t = UI1.ring && UI1.ring.t;
    const rr = r && r.getBoundingClientRect(), tr = t && t.getBoundingClientRect();
    return {ok: !!(j && j.ok), target: !!(j && j.target), ring: !!r && r.style.display !== 'none', ed: R.editor, songView: !!UI.songView,
      tgt: t ? (t.getAttribute('aria-label') || t.className || '').slice(0, 40) : null, isEng: !!(t && t.matches && t.matches('.sh-head .seg.eng')),
      isRec: !!(t && SV.btn && t === SV.btn.bRec), inView: !!(tr && tr.top >= 0 && tr.bottom <= innerHeight && tr.left >= 0 && tr.right <= innerWidth),
      around: !!(rr && tr && rr.left <= tr.left && rr.top <= tr.top && rr.right >= tr.right && rr.bottom >= tr.bottom),
      toast: EL.toast ? EL.toast.textContent.slice(0, 90) : '',
      label: r && r.querySelector('.ui1rl') ? r.querySelector('.ui1rl').textContent : null, labelFits: !!(r && r.querySelector('.ui1rl') && r.querySelector('.ui1rl').scrollWidth <= r.querySelector('.ui1rl').clientWidth + 1),
      covered: (() => { const T = EL.toast; if (!T || !tr || !T.classList.contains('show')) return false; const q = T.getBoundingClientRect(); return q.left < tr.right && q.right > tr.left && q.top < tr.bottom && q.bottom > tr.top; })()}; }); };
// ---------- A Guide-Sprünge ohne Voraussetzung ----------
for (const [w, h, n] of SIZES) {
  const p = await page(F, w, h);
  const a = await jump(p, 'kf1trp');
  ok(`A1 kf1trp ${n}: Klang-Editor, Rahmen um Klangerzeugung, Hinweis am Rahmen (ganz lesbar, nichts verdeckt)`, a.ok && a.target && a.ring && a.ed === 'synth' && a.isEng && a.around && a.inView && /^Arp Treppe: erst MS 2000 \/ Bit Mask$/.test(a.label) && a.labelFits && !a.covered, a);
  await p.screenshot({path: `${OUT}/A1-kf1trp-${n}.png`});
  const b = await jump(p, 'jam3pf');
  ok(`A2 jam3pf ${n}: Song-Ansicht, Rahmen um ● SONG, Hinweis am Rahmen (ganz lesbar, nichts verdeckt)`, b.ok && b.target && b.ring && b.songView && b.isRec && b.around && b.inView && b.label === 'Perform-Spur: ● SONG + Perform-Leiste' && b.labelFits && !b.covered, b);
  await p.screenshot({path: `${OUT}/A2-jam3pf-${n}.png`});
  // mit Voraussetzung: der alte Weg (Rahmen am Ziel selbst)
  if (n === 'hoch') {
    const c = await p.evaluate(async () => { const t = S.tracks.findIndex(x => x && x.kind === 'synth'); selectTrack(t); return t; });
    await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); });
    await p.waitForTimeout(300);
    const put = await p.evaluate(() => (SYNQUENZER.jam3.put({k: 'm', b: 0, d: 4, g: 'dr', lv: 'stumm'}), SYNQUENZER.jam3.has()));
    const d = await jump(p, 'jam3pf');
    ok('A3 jam3pf mit Perform-Spur: Rahmen an der Zeile PERFORM (alter Weg)', put && d.target && d.ring && !d.isRec && /^Perform-Spur/.test(d.tgt) && d.label === 'Perform-Spur im Song', {put, d});
    void c;
  }
  if (n === 'quer') { await jump(p, 'kf1trp'); const x = await jump(p, 'xp'); ok('A4 nach Arp Treppe: anderer Sprung mit Ersatz-Ziel behält sein Etikett', x.ring && x.label === 'Song transponieren', x); }
  ok(`A9 keine Fehler ${n}`, !p.errs.length, p.errs.slice(0, 3));
  await p.close();
}
// ---------- B/C Menü: pixelgleich zur Basis, Trefferflächen ----------
async function menuShot(file, w, h, n, tag) {
  const p = await page(file, w, h);
  await p.evaluate(async () => { openMenu(); await new Promise(r => setTimeout(r, 400)); const r = EL.menu.querySelector('.mrow.pl1llr'); r.scrollIntoView({block: 'center'}); await new Promise(r => setTimeout(r, 200)); });
  const shot = await p.screenshot({path: `${OUT}/B-menu-${n}-${tag}.png`, animations: 'disabled', caret: 'hide'});
  return {p, shot};
}
for (const [w, h, n] of SIZES) {
  const a = await menuShot(B, w, h, n, 'basis'), b = await menuShot(F, w, h, n, 'gd1');
  let diff = 0;
  if (!a.shot.equals(b.shot)) {
    diff = await b.p.evaluate(async ([x, y]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
      const [A, B_] = await Promise.all([ld(x), ld(y)]); const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; const g = c.getContext('2d');
      g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data; g.clearRect(0, 0, c.width, c.height); g.drawImage(B_, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let k = 0; k < da.length; k += 4) if (da[k] !== db[k] || da[k + 1] !== db[k + 1] || da[k + 2] !== db[k + 2]) n++; return n; }, [a.shot.toString('base64'), b.shot.toString('base64')]);
  }
  ok(`B1 Menü ${n} pixelgleich zur Basis`, diff === 0, {diffPx: diff, bytesEqual: a.shot.equals(b.shot)});
  // C: Trefferflächen je Taste in Zeilen mit 2–3 Tasten (gemessen per elementFromPoint), Überlappung
  const m = await b.p.evaluate(async () => {
    for (const x of [...EL.menu.querySelectorAll('button.orimb')].filter(x => /^Mehr/.test(x.textContent.trim()))) x.click();   // alle „Mehr ▾“ auf
    await new Promise(r => setTimeout(r, 300));
    const rows = [...EL.menu.querySelectorAll('.mrow')].filter(r => { const s = r.querySelector(':scope>.seg'); return s && s.children.length <= 3 && ui1Shown(s); });
    const out = [], rects = [];
    for (const r of rows) {
      r.scrollIntoView({block: 'center'}); const sc = EL.menu.querySelector('.mb').scrollTop;
      for (const b of r.querySelectorAll(':scope>.seg>button')) {
        const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
        const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !!(e && (e === b || b.contains(e))); };
        let t = cy, u = cy, l = cx, rr = cx;
        while (hit(cx, t - 0.5) && t > q.top - 30) t -= 0.5; while (hit(cx, u + 0.5) && u < q.bottom + 30) u += 0.5;
        while (hit(l - 0.5, cy) && l > q.left - 30) l -= 0.5; while (hit(rr + 0.5, cy) && rr < q.right + 30) rr += 0.5;
        // Überlappung: in der Trefferfläche nur diese Taste; andere sichtbare Bedienelemente/Text des Menüs nicht berührt
        const H = {l, t, r: rr, b: u};
        const others = [...EL.menu.querySelectorAll('button, input, select, .lbl, .small, h3, a')].filter(x => x !== b && !x.contains(b) && !b.contains(x) && ui1Shown(x)).filter(x => { const o = x.getBoundingClientRect(); return o.left < H.r - .5 && o.right > H.l + .5 && o.top < H.b - .5 && o.bottom > H.t + .5; });
        const lb = r.querySelector('.lbl');
        out.push({row: (lb ? lb.textContent.trim() : r.className).slice(0, 18), b: b.textContent.trim(), vis: [Math.round(q.width), Math.round(q.height)], hit: [Math.round(rr - l), Math.round(u - t)], over: others.map(x => (x.textContent || x.className).trim().slice(0, 16))});
        rects.push({l: H.l, r: H.r, t: H.t + sc, b: H.b + sc});
      }
    }
    let ov = 0; for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const A = rects[i], Bq = rects[j]; if (A.l < Bq.r - .5 && A.r > Bq.l + .5 && A.t < Bq.b - .5 && A.b > Bq.t + .5) ov++; }
    return {out, ov};
  });
  const quer = n !== 'hoch';
  const small = m.out.filter(x => x.hit[0] < 44 || x.hit[1] < 44), over = m.out.filter(x => x.over.length);
  if (quer) ok(`C1 Menü ${n}: Trefferfläche ≥ 44 × 44 (${m.out.length} Tasten), keine Überlappung`, m.out.length >= 50 && !small.length && !over.length && !m.ov, {small, over, ov: m.ov, sample: m.out.filter(x => /Lauf|Perform|Begleit/.test(x.row))});
  else { const bad = m.out.filter(x => Math.abs(x.hit[0] - x.vis[0]) > 1 || Math.abs(x.hit[1] - x.vis[1]) > 1); ok(`C1 Menü ${n}: hochkant unverändert (Trefferfläche = Taste, ${m.out.length} Tasten)`, !bad.length && !m.ov, {bad, ov: m.ov, sample: m.out.slice(0, 3)}); }
  if (quer) {   // echtes Tippen (Touch) 4 px über „Aus“ und 4 px links neben „An“ der Zeile Lauflichter
    const pt = await b.p.evaluate(() => { const r = EL.menu.querySelector('.mrow.pl1llr'); r.scrollIntoView({block: 'center'}); const [an, aus] = r.querySelectorAll('.seg>button'); const A = an.getBoundingClientRect(), U = aus.getBoundingClientRect();
      return {aus: [U.left + U.width / 2, U.top - 4], an: [A.left - 3, A.top + A.height / 2], an2: [A.left + A.width / 2, A.bottom + 4], ll: pl1Ll()}; });
    await b.p.touchscreen.tap(...pt.aus); await b.p.waitForTimeout(250); const l1 = await b.p.evaluate(() => pl1Ll());
    await b.p.touchscreen.tap(...pt.an); await b.p.waitForTimeout(250); const l2 = await b.p.evaluate(() => pl1Ll());
    await b.p.touchscreen.tap(...pt.aus); await b.p.waitForTimeout(250); await b.p.touchscreen.tap(...pt.an2); await b.p.waitForTimeout(250); const l3 = await b.p.evaluate(() => pl1Ll());
    ok(`C2 Menü ${n}: Tipp neben die Taste (Touch) trifft An │ Aus`, pt.ll === true && l1 === false && l2 === true && l3 === true, {pt, l1, l2, l3});
  }
  ok(`B9 keine Fehler ${n}`, !a.p.errs.length && !b.p.errs.length, [...a.p.errs, ...b.p.errs].slice(0, 3));
  await a.p.close(); await b.p.close();
}
// ---------- D Oszilloskop während des Exports ----------
async function scopeRun(file, tag) {
  const p = await page(file, 428, 926);
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); await new Promise(r => setTimeout(r, 300));
    if (typeof pl1LlSet === 'function') pl1LlSet(true); kf2ScToggle(true); ui1G.ed('osc')(); await new Promise(r => setTimeout(r, 900)); });
  const before = await p.evaluate(() => ({ed: R.editor, vis: KF2SC.vis, an: !!KF2SC.an, live: !!(KF2SC.an && KF2SC.an.context === AU.ctx), src: !!KF2SC.src}));
  const r = await p.evaluate(async () => {
    const live = AU.ctx, smp = []; let iv = setInterval(() => { const off = AU.ctx !== live; smp.push({off, anOff: !!(KF2SC.an && KF2SC.an.context !== live), src: !!(KF2SC.src && KF2SC.src.context !== live), why: KF2SC.why, raf: !!KF2SC.raf}); }, 20);
    let out = null, err = null; try { out = await SYNQUENZER.vvRender({range: {a: 0, b: 2, sel: false}}); } catch (e) { err = String(e && e.message || e); }
    clearInterval(iv); await new Promise(r => setTimeout(r, 900));
    const A = AU.tracks[KF2SC.t];
    return {err, peak: out && out.peak, during: smp.filter(s => s.off).length, anOff: smp.filter(s => s.anOff).length, srcOff: smp.filter(s => s.off && s.src).length, whys: [...new Set(smp.filter(s => s.off).map(s => s.why))],
      after: {ed: R.editor, vis: KF2SC.vis, live: !!(KF2SC.an && KF2SC.an.context === AU.ctx), src: !!(A && KF2SC.src === A.post), why: KF2SC.why}};
  });
  const errs = p.errs.slice(); await p.close(); return {before, r, errs};
}
const d0 = await scopeRun(B, 'basis'), d1 = await scopeRun(F, 'gd1');
res['D0 Basis (Vergleich)'] = {ok: true, info: d0};
ok('D1 Oszilloskop während Export: kein Analyser im Offline-Kontext, abgekoppelt', d1.before.ed === 'synth' && d1.before.live && d1.r.during > 0 && !d1.r.err && d1.r.anOff === 0 && d1.r.srcOff === 0, d1);
ok('D2 nach dem Export wieder am Live-Kontext, zeichnet', d1.r.after.vis && d1.r.after.live && d1.r.after.src, d1.r.after);
ok('D3 keine Fehler', !d1.errs.length, d1.errs.slice(0, 3));
await br.close();
fs.writeFileSync(`${OUT}/gd1-result.json`, JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) console.log((v.ok ? 'OK  ' : 'FEHL') + ' ' + k + (v.ok && !/D0/.test(k) ? '' : ' ' + JSON.stringify(v.info).slice(0, 700)));
console.log(fail ? `${fail} FEHLER` : 'ALLES OK');
process.exit(fail ? 1 : 0);
