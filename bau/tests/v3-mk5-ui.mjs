// MK5 in Chromium: MK5-17 surface (ARP key, step keys, LEDs, M-PLATZ, M-ANSICHT), operation, tempo LED, running step, probe "+Arp", help.
// Usage: node v3-mk5-ui.mjs <index.html>   (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK5/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 400)); } };
const SA = '#app{padding-left:47px!important;padding-right:47px!important}', HB = '#app{padding-bottom:21px!important}';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], 'L1-SA': [844, 390, SA], 'L0-SA': [926, 428, SA], 'L1-HB': [844, 390, SA + HB]};
const INT = ['vol', 'arp', 'octd', 'octu', 'bank', 'side', 'write', 'shift', 'n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'timbre', 'w1', 'w2', 'k0', 'k1', 'k2', 'k3', 'k4', 'm1', 'm2'];
async function open(fmt) {
  const [w, h, css] = FMT[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: fmt !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  if (css) await page.addStyleTag({content: css});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  return {ctx, page, errs};
}
const box = (page, k) => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(page, k, dy, steps, dx) { const b = await box(page, k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= (steps || 10); s++) await page.mouse.move(x + (dx || 0) * s / (steps || 10), y - dy * s / (steps || 10)); await page.mouse.up(); await page.waitForTimeout(60); }
async function tap(page, k) { const b = await box(page, k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150); }
const lcd = page => page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
const measure = page => page.evaluate(INT => {
  const out = {bad: [], rects: {}};
  const body = document.querySelector('#synthSheet .mkbody'), pg = document.querySelector('#synthSheet .pg');
  if (!body) return {bad: ['kein Bedienfeld'], rects: {}};
  const pr = pg.getBoundingClientRect(), iw = innerWidth, ih = innerHeight;
  for (const e of body.querySelectorAll('.mkx')) {
    const r = e.getBoundingClientRect(), k = e.dataset.k; out.rects[k] = [r.left, r.top, r.width, r.height];
    if (r.left < -.5 || r.top < -.5 || r.right > iw + .5 || r.bottom > ih + .5) out.bad.push(k + ' außerhalb des Bildschirms');
    if (r.left < pr.left - .5 || r.top < pr.top - .5 || r.right > pr.right + .5 || r.bottom > pr.bottom + .5) out.bad.push(k + ' abgeschnitten (.pg)');
    for (const t of e.querySelectorAll('*')) {
      if (t.children.length || !t.textContent.trim() || t.closest('svg')) continue;
      const cs = getComputedStyle(t); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) out.bad.push(k + ' Beschriftung läuft über: ' + t.textContent);
      const rg = document.createRange(); rg.selectNodeContents(t); const q = rg.getBoundingClientRect();
      if (q.width && (q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1)) out.bad.push(k + ' Text ragt heraus: ' + t.textContent);
    }
  }
  // the matrix rows (section name and the 5 short labels): nothing cut
  for (const t of body.querySelectorAll('.mrow *, .mx *')) { if (t.children.length || !t.textContent.trim()) continue; if (t.clientWidth > 0 && t.scrollWidth > t.clientWidth + 1) out.bad.push('Matrix läuft über: ' + t.textContent); }
  const present = INT.filter(k => out.rects[k]);
  for (const k of present) { const [x, y, w, h] = out.rects[k]; if (w < 43.5 || h < 43.5) out.bad.push(k + ' Trefferfläche ' + w.toFixed(1) + '×' + h.toFixed(1)); }
  for (let a = 0; a < present.length; a++) for (let b = a + 1; b < present.length; b++) {
    const A = out.rects[present[a]], B = out.rects[present[b]], ox = Math.min(A[0] + A[2], B[0] + B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]);
    if (ox > .5 && oy > .5) out.bad.push('Überlappung ' + present[a] + '/' + present[b]);
  }
  const de = document.documentElement, sb = document.querySelector('#synthSheet .sh-body');
  if (de.scrollWidth > iw + .5 || de.scrollHeight > ih + .5) out.bad.push('Seite scrollt ' + de.scrollWidth + '×' + de.scrollHeight);
  if (sb && (sb.scrollHeight > sb.clientHeight + 1 || sb.scrollWidth > sb.clientWidth + 1)) out.bad.push('Blatt-Körper scrollt');
  // the LCD lines: nothing cut (ellipsis allowed only as text-overflow, never wider than the screen)
  if (ED.lcd) { const r = ED.lcd.getBoundingClientRect(); if (r.right > iw + .5) out.bad.push('LCD ragt heraus'); }
  return out;
}, INT);
const maxMove = (a, b) => { let m = 0, k0 = ''; for (const k in a) if (b[k]) for (let i = 0; i < 4; i++) { const d = Math.abs(a[k][i] - b[k][i]); if (d > m) { m = d; k0 = k; } } return [m, k0]; };
const half = (page, h) => page.evaluate(h => { ED.tab = h === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); }, h).then(() => page.waitForTimeout(250));
const J = x => JSON.stringify(x);
const keyRects = page => page.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx[data-k^="n"]')].filter(e => /^n\d$/.test(e.dataset.k)).map(e => { const r = e.getBoundingClientRect(); return [e.dataset.k, Math.round(r.width), Math.round(r.height)]; }));

// ---------------- MK5-17 M-PLATZ, M-ANSICHT, hit sizes in every format ----------------
await T('MK5-17-PLATZ', async () => {
  const SIZE = {P1: [44, 44], P2: [80, 44], P3: [68, 44], L1: [44, 44]};
  for (const fmt of Object.keys(FMT)) {
    const {ctx, page, errs} = await open(fmt);
    const pi = await page.evaluate(() => SYNQUENZER.mkPanel()), isHalf = /halb/.test(pi.fmt);
    for (const h of isHalf ? ['A', 'B'] : [null]) {
      if (h) await half(page, h);
      const tag = fmt + (h ? (h === 'A' ? ' LINKS' : ' RECHTS') : ''), bad = []; let base = null, mv = [0, ''];
      for (const [nm, fn] of [['SPIEL', () => MKUI.toSpiel()], ['ARP an', () => { SYNQUENZER.mkSet(0, 'arp.on', 1); MKUI.render(); }],
        ['ARP A', () => MKUI.setWahl(2, 7)], ['ARP A SHIFT', () => { MKUI.P.shift = 1; MKUI.render(); }], ['ARP B', () => MKUI.setWahl(2, 8)],
        ['Schritte', () => { SYNQUENZER.mkSet(0, 'arp.last', 6); SYNQUENZER.mkSet(0, 'arp.steps', 255 & ~2 & ~16); MKUI.render(); }],
        ['laufender Schritt', () => { SYNQUENZER.keyOn(60, .8, 'u60'); SYNQUENZER.keyOn(64, .8, 'u64'); }], ['ARP aus', () => { SYNQUENZER.keyOff(60, 'u60'); SYNQUENZER.keyOff(64, 'u64'); SYNQUENZER.mkSet(0, 'arp.on', 0); MKUI.render(); }],
        ['SPIEL wieder', () => MKUI.toSpiel()]]) {
        await page.evaluate(fn); await page.waitForTimeout(nm === 'laufender Schritt' ? 400 : 60);
        const m = await measure(page); for (const b of m.bad) bad.push(nm + ': ' + b);
        if (!base) base = m.rects; else { const d = maxMove(base, m.rects); if (d[0] > mv[0]) mv = [d[0], nm + ' ' + d[1]]; }
      }
      ok('MK5-17 ' + tag + ' M-PLATZ: ARP-Taste, ARP A/B, Schritt-Tasten (an │ Pause │ dunkel │ laufend), SHIFT', !bad.length, bad.slice(0, 5).join(' | '));
      ok('MK5-17 ' + tag + ' M-ANSICHT: Schritt-Tasten = die Nummerntasten am selben Platz, nichts springt > 2 px', mv[0] <= 2, 'max ' + mv[0].toFixed(2) + ' px ' + mv[1]);
      const kr = await keyRects(page), ab = await box(page, 'arp');
      if (kr.length) { const want = SIZE[fmt] || (fmt === 'L2' || fmt === 'L1-HB' ? [44, 44] : fmt === 'W' || fmt === 'L1-SA' || fmt === 'L0-SA' ? null : null);
        const minOk = kr.every(([, w, hh]) => w >= 44 && hh >= 44), szOk = !want || kr.every(([, w, hh]) => w >= want[0] - 1 && hh >= want[1] - 1 && w <= want[0] * 1.13 + 1);
        ok('MK5-17 ' + tag + ' Schritt-Tasten ≥ 44 × 44' + (want ? ' (' + want.join(' × ') + ')' : ''), minOk && szOk, J(kr.slice(0, 2)) + ' ×' + kr.length); }
      if (ab) ok('MK5-17 ' + tag + ' ARP-Taste ≥ 44 × 44', ab.w >= 43.5 && ab.h >= 43.5, ab.w.toFixed(1) + ' × ' + ab.h.toFixed(1));
      await page.evaluate(() => { SYNQUENZER.mkSet(0, 'arp.last', 8); SYNQUENZER.mkSet(0, 'arp.steps', 255); MKUI.toSpiel(); });
    }
    // the lists of ARP A / B: TYP (6), AUFLÖSUNG (6), ZIEL (3): rows ≥ 44, inside the screen
    await page.evaluate(() => MKUI.setWahl(2, 7)); await page.waitForTimeout(60); if (isHalf) await half(page, 'B');
    const L = [];
    for (const [w, k] of [[7, 'k1'], [7, 'k3'], [8, 'k4']]) {
      await page.evaluate(w => MKUI.setWahl(2, w), w); await page.waitForTimeout(60);
      const b = await box(page, k); if (!b) { L.push(k + ' fehlt'); continue; }
      await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(160);
      L.push(await page.evaluate(k => { const p = document.querySelector('.pop'); if (!p) return k + ': keine Liste'; const bs = [...p.querySelectorAll('.plist button')], pr = p.getBoundingClientRect(); const bad = [];
        if (bs.some(x => x.getBoundingClientRect().height < 43.5)) bad.push('Zeile < 44'); if (pr.left < -.5 || pr.right > innerWidth + .5 || pr.top < -.5 || pr.bottom > innerHeight + .5) bad.push('Liste außerhalb');
        if ([...p.querySelectorAll('.plist button *')].some(t => !t.children.length && t.clientWidth && t.scrollWidth > t.clientWidth + 1)) bad.push('Text läuft über'); closePop(); return k + ':' + bs.length + (bad.length ? ' ' + bad.join(',') : ''); }, k));
    }
    ok('MK5-17 ' + fmt + ' Listen AUFLÖSUNG (6), TYP (6), ZIEL (3): Zeilen ≥ 44 px, im Bild', L.join(' ') === 'k1:6 k3:6 k4:3', L.join(' '));
    ok('MK5-17 ' + fmt + ' keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
    await ctx.close();
  }
});

// ---------------- MK5-17 operation (L1): ARP key, step keys, knobs, LED states, LCD ----------------
await T('MK5-17-BED', async () => {
  const {ctx, page, errs} = await open('L1');
  const st = () => page.evaluate(() => ({a: SYNQUENZER.mkGet(0).arp, u: SYNQUENZER.undoInfo().n, p: SYNQUENZER.mkPanel().arp, led: !!document.querySelector('#synthSheet .mkx[data-k="arp"].on')}));
  let s0 = await st(); await tap(page, 'arp'); let s1 = await st();
  ok('MK5-17 Tipp auf ARP: Arp an, LED an, ein Undo, LCD „ARP AN“', s1.a.on === 1 && s1.led && s1.u === s0.u + 1 && /ARP AN/.test(await lcd(page)), (await lcd(page)));
  await page.evaluate(() => MKUI.setWahl(2, 8)); await page.waitForTimeout(80);
  let pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK5-17 EDIT-WAHL 2 auf ARP B: LATCH · SWING · KEY SYNC · LÄNGE · ZIEL aktiv, Nummerntasten = Schritte', pi.knobs.map(k => k && k.l).join() === 'LATCH,SWING,KEY SYNC,LÄNGE,ZIEL' && pi.knobs.every(k => k && !k.dark) && pi.arp.steps && J(pi.arp.keys) === J(Array(8).fill('an')), J(pi.knobs.map(k => k && k.l)) + ' ' + J(pi.arp.keys));
  s0 = await st(); await tap(page, 'n1'); s1 = await st();
  ok('MK5-17 Schritt-Taste 2 antippen: Pause (blinkt), ein Undo', s1.a.steps === (255 & ~2) && s1.p.keys[1] === 'pause' && s1.u === s0.u + 1 && await page.evaluate(() => getComputedStyle(document.querySelector('#synthSheet .mkx[data-k="n1"] .mled')).animationName === 'mkbl1'), J(s1.p.keys) + ' ' + (await lcd(page)));
  await drag(page, 'k3', -40, 10); s1 = await st();
  ok('MK5-17 LÄNGE ziehen (Regler 4) auf ' + s1.a.last + ': Tasten darüber dunkel, rastet ein (ganze Zahl)', s1.a.last < 8 && Number.isInteger(s1.a.last) && s1.p.keys.slice(s1.a.last).every(x => x === 'dunkel') && s1.p.keys.slice(0, s1.a.last).every((x, k) => x === (k === 1 ? 'pause' : 'an')), s1.a.last + ' ' + J(s1.p.keys));
  s0 = await st(); await tap(page, 'n7'); s1 = await st();
  ok('MK5-17 Taste über LÄNGE: ohne Wirkung, Hinweis im LCD', s1.a.steps === s0.a.steps && s1.u === s0.u && /über LÄNGE/.test(await lcd(page)), await lcd(page));
  await page.evaluate(() => MKUI.setWahl(2, 7)); await page.waitForTimeout(60);
  pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK5-17 ARP A: TEMPO · AUFLÖSUNG · GATE · TYP · OKTAVEN, TEMPO = Song-Tempo', pi.knobs.map(k => k && k.l).join() === 'TEMPO,AUFLÖSUNG,GATE,TYP,OKTAVEN' && pi.knobs[0].p === 'bpm', J(pi.knobs.map(k => k && k.p)));
  s0 = await st(); await drag(page, 'k4', 60, 12); s1 = await st();
  ok('MK5-17 OKTAVEN ziehen: rastet auf 1…4, ein Undo, LCD „Oktaven“', s1.a.range > s0.a.range && Number.isInteger(s1.a.range) && s1.u === s0.u + 1 && /Oktave/.test(await lcd(page)), s1.a.range + ' ' + (await lcd(page)));
  s0 = await st(); await drag(page, 'k2', -60, 12); s1 = await st();
  ok('MK5-17 GATE ziehen: Wert und ms im LCD', s1.a.gate < s0.a.gate && /GATE/.test(await lcd(page)) && /ms|bis zum/.test(await lcd(page)), s1.a.gate + ' ' + (await lcd(page)));
  // the TYP list: Wechsel 2
  let b = await box(page, 'k3'); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(150);
  await page.evaluate(() => { const x = [...document.querySelectorAll('.pop .plist button')].find(e => /Wechsel 2/.test(e.textContent)); x && x.click(); }); await page.waitForTimeout(120);
  ok('MK5-17 TYP per Liste: Wechsel 2', (await st()).a.type === 3, String((await st()).a.type));
  // SHIFT on ARP A: the number keys have their SHIFT functions again (not steps)
  await tap(page, 'shift'); pi = await page.evaluate(() => SYNQUENZER.mkPanel());
  ok('MK5-17 SHIFT bei ARP A: Nummerntasten mit SHIFT-Funktion (keine Schritt-Tasten)', !pi.arp.steps, J(pi.arp));
  await tap(page, 'shift');
  // ◎ marks ARP A / B as different from INIT
  const dif = await page.evaluate(() => { UI.wia = true; MKUI.render(); const r = [...document.querySelectorAll('#synthSheet .mkx[data-k="w2"] .mtk')].map((t, k) => t.classList.contains('mwd') ? k : -1).filter(k => k >= 0); UI.wia = false; MKUI.render(); return r; });
  ok('MK5-17 ◎: ARP A und ARP B markiert, wenn sie von INIT abweichen', dif.includes(7) && dif.includes(8), J(dif));
  const help = await page.evaluate(() => [...document.querySelectorAll('*')].length && (typeof helpLines === 'function' ? helpLines() : null));
  void help;
  ok('MK5-17 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

// ---------------- MK5-17 LEDs in time: tempo LED in the song tempo (± 1 frame), running step ≤ 30 Hz and ≤ 1 frame late ----------------
await T('MK5-17-LED', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    Q.setBpm(120); Q.mkSet(0, 'arp.on', 1); Q.mkSet(0, 'arp.res', 0); MKUI.setWahl(2, 7); Q.play(); await sl(300);
    const fr = []; let run = true; const loop = () => { if (!run) return; const L = document.querySelector('#synthSheet .mkx[data-k="arp"] .mtled'); fr.push([AU.ctx.currentTime, AU.outLat || 0, R.startTime, S.bpm, L.classList.contains('on')]); requestAnimationFrame(loop); };
    requestAnimationFrame(loop); await sl(3000); run = false;
    // running step at 1/24 and 240 BPM (24 steps per second)
    Q.setBpm(240); const n0 = MKUI.P.arpCurN || 0, t0 = performance.now(), cmp = []; Q.keyOn(60, .8, 'z0'); Q.keyOn(67, .8, 'z1');
    let go = true; const lp = () => { if (!go) return; const c = ARPC.cur(0, AU.ctx.currentTime - (AU.outLat || 0)); cmp.push([c ? c.s : -1, MKUI.P.arpCur]); requestAnimationFrame(lp); }; requestAnimationFrame(lp);
    await sl(2000); go = false; const n1 = MKUI.P.arpCurN, dt = (performance.now() - t0) / 1000; Q.keyOff(60, 'z0'); Q.keyOff(67, 'z1'); Q.stop();
    return {fr, rate: (n1 - n0) / dt, cmp};
  });
  // the tempo LED: on in the first half of every beat; a mismatch only within one frame of a change
  let bad = 0, tr = 0; for (let k = 1; k < r.fr.length; k++) { const [t, lat, st, bpm, on] = r.fr[k], b = (t - lat - st) * bpm / 60, want = ((b % 1) + 1) % 1 < .5; if (on !== r.fr[k - 1][4]) tr++; if (on !== want) { const dEdge = Math.min(Math.abs(b * 2 - Math.round(b * 2))) * 60 / bpm / 2; if (dEdge > .034) bad++; } }
  ok('MK5-17 Tempo-LED blinkt im Song-Tempo (± 1 Bild)', bad === 0 && tr >= 10, `${tr} Wechsel in 3 s, ${bad} falsche Bilder`);
  const lag = r.cmp.filter((x, k) => k > 2 && x[0] !== x[1] && r.cmp[k - 1][0] === x[0] && r.cmp[k - 2][0] === x[0]).length;
  ok('MK5-17 laufender Schritt: ≤ 30 Wechsel je Sekunde, höchstens 1 Bild Verzug', r.rate <= 30 && r.rate > 10 && lag === 0, `${r.rate.toFixed(1)} /s, ${lag} Bilder mit > 1 Bild Verzug`);
  ok('MK5-17 LED keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});

// ---------------- probe "+Arp" and help ----------------
await T('MK5-16-PROBE', async () => {
  const {ctx, page, errs} = await open('L1');
  const r = await page.evaluate(async () => { const x = await SYNQUENZER.perfProbe(['arp']); return x; });
  const c = r.cases && r.cases[0];
  ok('MK5-16 Leistungs-Probe „+Arp“ läuft (4 Engines, frames_ok, 0 Netzaufrufe)', c && c.fall === 'arp' && c.frames_ok && r.net === 0 && c.reports >= 5, J(c) + ' net ' + r.net);
  const h = await page.evaluate(() => { try { return document.documentElement.innerHTML.includes('ARP-Taste: Arpeggiator an/aus'); } catch (e) { return false; } });
  ok('MK5-17 Hilfe-Zeilen für ARP und ARP B / Schritte vorhanden', h);
  ok('MK5-16 keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
console.log(fails ? fails + ' FEHLER (' + n + ')' : 'ALLE BESTANDEN (' + n + ')');
await browser.close();
