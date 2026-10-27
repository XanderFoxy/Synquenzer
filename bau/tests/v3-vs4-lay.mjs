// VS4: Takes-Blatt mit SÄUBERN/A-B in P1–P3, L1, L2, 926×428 (M-PLATZ, Touch ≥ 44, nichts abgeschnitten); Claude-App (iframe)
import {open, sleep} from './v3-vs3-h.mjs';
import {chromium} from 'playwright';
import fs from 'fs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const sine = (sr, sec, f, a) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * (a || 9000) + ((i * 7919) % 600) - 300); return x; };
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const H = await open({file: APP, br, ctx}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), sine(48000, 3, 330));
  await p.evaluate(r => { SYNQUENZER.clSet(r.id, 60); }, r); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
  const pre = await p.evaluate(() => ({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight}));
  await p.evaluate(r => SYNQUENZER.tkSheet({t: r.track, s: r.scene}), r); await sleep(400);
  const m = await p.evaluate(() => {
    const P = document.querySelector('.pop.tksheet'), b = P.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, bad = [];
    for (const e of P.querySelectorAll('.clbox button, .clbox input')) { const q = e.getBoundingClientRect(); if (q.height < 43.5 || q.width < 43.5) bad.push(e.className + ' ' + Math.round(q.width) + '×' + Math.round(q.height)); if (q.bottom > vh || q.top < 0 || q.right > vw) bad.push('aus dem Bild ' + e.className); }
    for (const e of P.querySelectorAll('.clbox .cllab, .clbox button')) if (e.scrollWidth > e.clientWidth + 0.5) bad.push('abgeschnitten ' + e.textContent);
    if (P.scrollHeight > P.clientHeight + 1) bad.push('Blatt-Inhalt höher als das Blatt ' + P.scrollHeight + '>' + P.clientHeight);
    return {box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], vw, vh, inside: b.left >= 0 && b.top >= 0 && b.right <= vw + 0.5 && b.bottom <= vh + 0.5, bad, doc: {w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight}};
  });
  ok(m.inside && !m.bad.length && m.doc.w <= m.vw && m.doc.h === pre.h, `${k} ${w}×${h}: Blatt im Bild ${JSON.stringify(m.box)}, Knöpfe/Regler ≥ 44, nichts abgeschnitten, kein Layout-Sprung ${JSON.stringify(m.bad)}`);
  await p.screenshot({path: OUT + 'v3-vs4-' + k + '-takes.png'});
  // Tipp auf „Roh“ (Touch) wirkt; Regler per Finger ziehen (Touch-Ziehen auf dem Regler)
  await p.tap('.pop.tksheet .clbox button[data-cl="roh"]'); await sleep(150);
  const ab = await p.evaluate(id => SYNQUENZER.clInfo(id).ab, r.id);
  const rb = await p.evaluate(() => { const q = document.querySelector('.pop.tksheet .clr').getBoundingClientRect(); return [q.left, q.top + q.height / 2, q.width]; });
  const cdp = await ctx.newCDPSession(p);
  const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
  await tp('touchStart', rb[0] + rb[2] * 0.6, rb[1]); for (let s = 1; s <= 8; s++) { await tp('touchMove', rb[0] + rb[2] * (0.6 + 0.04 * s), rb[1]); await sleep(16); } await tp('touchEnd'); await sleep(400);
  const after = await p.evaluate(id => ({cl: SYNQUENZER.takes()[id].cl, v: document.querySelector('.pop.tksheet .clr') && document.querySelector('.pop.tksheet .clr').value}), r.id);
  ok(ab === 'roh' && after.cl > 60, `${k}: Tipp „Roh“ → ${ab}; Regler mit dem Finger gezogen → SÄUBERN ${after.cl} % (Regler ${after.v})`);
  ok(!H.errs.length, `${k}: keine Konsolenfehler ` + JSON.stringify(H.errs.slice(0, 2)));
  await ctx.close();
}
// Claude-App (iframe, kein Mikro): Blatt zeigt den Regler gesperrt, kein Worker, Daten (cl, rf) bleiben deep-equal
{
  const FR = OUT + 'v3-vs4-frame.html';
  fs.writeFileSync(FR, `<!doctype html><iframe id="f" src="file://${APP}" sandbox="allow-scripts allow-same-origin" style="width:390px;height:844px;border:0"></iframe>`);
  const ctxA = await br.newContext({viewport: {width: 390, height: 844}}), HA = await open({file: APP, br, ctx: ctxA}), pa = HA.p;
  await pa.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const r = await pa.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), sine(48000, 3, 330));
  await pa.evaluate(id => { SYNQUENZER.clSet(id, 40); }, r.id); await pa.evaluate(id => SYNQUENZER.clWait(id), r.id);
  const J = await pa.evaluate(() => SYNQUENZER.serialize()), T0 = await pa.evaluate(() => SYNQUENZER.takes());
  const ctxB = await br.newContext({viewport: {width: 390, height: 844}}), q = await ctxB.newPage(), errs = [];
  q.on('pageerror', e => errs.push(String(e))); q.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await q.goto('file://' + FR); await sleep(2500);
  const f = q.frames().find(fr => fr.url().includes('index.html')); await f.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  ok(await f.evaluate(j => SYNQUENZER.importJSON(j), J), 'Claude-App: Projekt mit gesäubertem Take importiert'); await sleep(600);
  const T1 = await f.evaluate(() => SYNQUENZER.takes());
  ok(JSON.stringify(T1) === JSON.stringify(T0) && T1[r.id].cl === 40, 'Claude-App: Take-Daten deep-equal (cl 40 bleibt)');
  await f.evaluate(id => SYNQUENZER.clEnsure(id), r.id); await sleep(300);
  const ci = await f.evaluate(id => SYNQUENZER.clInfo(id), r.id);
  ok(ci.runs === 0 && ci.worker === null && !ci.job, 'Claude-App: kein Säubern, kein Worker: ' + JSON.stringify({runs: ci.runs, worker: ci.worker}));
  await f.evaluate(() => { SYNQUENZER.selectTrack(SYNQUENZER.tkInfo().stimme); });
  await f.evaluate(id => SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 0}), r.id); await sleep(300);
  const sh = await f.evaluate(() => { const b = document.querySelector('.pop.tksheet .clbox'); return b ? {dis: b.querySelector('.clr').disabled, st: b.querySelector('.clst').textContent, ab: [...b.querySelectorAll('button')].every(x => x.disabled)} : null; });
  ok(sh && sh.dis && sh.ab && /eigenen Seite/.test(sh.st), 'Claude-App: Regler und A/B gesperrt: ' + JSON.stringify(sh));
  await q.screenshot({path: OUT + 'v3-vs4-claude-takes.png'});
  ok(!errs.length && !HA.errs.length, 'keine Konsolenfehler ' + JSON.stringify(errs.slice(0, 2)));
}
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
