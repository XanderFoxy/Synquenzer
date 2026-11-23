// KKS Kern-Test: Klangkorn-Klang erzeugen, Klang-Editor öffnen (Seite KORN), 2 Regler per Touch ziehen -> Klang ändert sich
// (Render-Vergleich + Live-Engine), andere Klänge (VA, normales WT) zeigen dieselben Seiten wie die Basis, Knopf "Als Klangkorn"
// im Aktionsfeld (hochkant/quer). node kks-test.cjs <port> [basis-ordner] [neu-ordner]   (Server-Wurzel srv/ mit <ordner>/index.html + version.json)
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
const port = process.argv[2], BAS = process.argv[3] || 'basis', NEU = process.argv[4] || 'neu', here = __dirname;
let fail = 0; const ok = (n, c, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
function wav(sec) { // Quelle für den Spektral-Test: 220-Hz-Klang mit wanderndem Formant
  const sr = 44100, N = Math.round(sec * sr), b = Buffer.alloc(44 + N * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) { const t = i / sr, fc = 400 + 1600 * t / sec; let v = 0; for (let h = 1; h <= 20; h++) { const f = 220 * h; v += Math.sin(2 * Math.PI * f * t) / h * Math.exp(-Math.pow((f - fc) / 500, 2)) ; } b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * 0.5)) * 30000), 44 + i * 2); }
  return b;
}
async function boot(b, wer, w, h, errs) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror ' + e));
  p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.location().url || '') && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/' + wer + '/index.html'); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 90000}); await p.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
  const drag = async (a, z, steps = 10) => { await touch('touchStart', [a]); for (let i = 1; i <= steps; i++) { await touch('touchMove', [[a[0] + (z[0] - a[0]) * i / steps, a[1] + (z[1] - a[1]) * i / steps]]); await p.waitForTimeout(20); } await touch('touchEnd', []); await p.waitForTimeout(200); };
  const tap = async q => { await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(250); };
  return {ctx, p, drag, tap};
}
// Klangkorn-Spur anlegen (Quelle 2,5 s: 220 Hz, Formant wandert), Editor auf OSC/erster Unterreiter
const MAKE = () => {
  const sr = 48000, N = sr * 2.5, x = new Float32Array(N);
  for (let i = 0; i < N; i++) { const t = i / sr, fc = 400 + 2400 * t / 2.5; let v = 0; for (let h = 1; h <= 24; h++) { const f = 220 * h; v += Math.sin(2 * Math.PI * f * t) / h * Math.exp(-Math.pow((f - fc) / 600, 2)); } x[i] = v * 0.5; }
  SYNQUENZER.spk7.make(x, sr, 220); const r = SYNQUENZER.spk7.take('neu'); return r ? r.track : -1;
};
const OPEN = t => { selectTrack(t); ED.tab = 'osc'; ED.sub.osc = 'eng'; FXF.big = null; openEditor(); return true; };
const ED_INFO = () => { const sh = EL.synthSheet, pg = sh.querySelector('.pg'); return {subs: [...sh.querySelectorAll('.sh-subs .stab')].map(b => b.textContent.trim()), tabs: [...sh.querySelectorAll('.sh-tabs .tab')].map(b => b.textContent.trim()), txt: pg ? pg.innerText.replace(/\s+/g, ' ').trim() : null, knobs: pg ? pg.querySelectorAll('.knob').length : 0, kks: !!sh.querySelector('.kks-pg')}; };
const LAYOUT = () => { // Knöpfe/Regler der Seite: im Bild, ≥ 32 px, keine Überlappung, Beschriftung nicht abgeschnitten
  const sh = EL.synthSheet, pg = sh.querySelector('.pg'), W = innerWidth, H = innerHeight, sr = sh.getBoundingClientRect();
  const els = [...pg.querySelectorAll('.knob,.seg button,.lgrp')].filter(e => e.offsetParent), R = e => e.getBoundingClientRect();
  const out = [], small = [], ov = [], cut = [];
  for (const e of els) { const r = R(e); if (r.left < -0.5 || r.right > W + 0.5 || r.left < sr.left - 0.5 || r.right > sr.right + 0.5) out.push((e.getAttribute('aria-label') || e.textContent).slice(0, 20)); if (!e.classList.contains('lgrp') && (r.width < 32 || r.height < 32)) small.push([(e.getAttribute('aria-label') || e.textContent).slice(0, 20), Math.round(r.width), Math.round(r.height)]); }
  const ks = els.filter(e => e.classList.contains('knob'));
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) { const a = R(ks[i]), b = R(ks[j]); if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ov.push([ks[i].getAttribute('aria-label'), ks[j].getAttribute('aria-label')]); }
  for (const e of pg.querySelectorAll('.knob .kl,.knob .kn,.seg button,.lgrp .lbl')) if (e.offsetParent && e.scrollWidth > e.clientWidth + 1) cut.push(e.textContent);
  const vis = ks.filter(e => { const r = R(e); return r.bottom <= H + 0.5 && r.top >= 0; }).length;
  return {n: ks.length, out, small, ov, cut, vis, body: (() => { const b = pg.parentElement, r = b.getBoundingClientRect(); return {h: Math.round(r.height), sh: b.scrollHeight, ch: b.clientHeight}; })()};
};
const KB = k => { const e = EL.synthSheet.querySelector('.knob[data-key="' + k + '"]'); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, txt: (e.querySelector('.kn') || {}).textContent}; };
const RENDER = async (t) => { // dieselben Werte, die die Spur-Engine bekommt (spk7Eff), offline gerendert; Kennzahlen
  const ef = spk7Eff(S.tracks[t].sound), r = await SYNQUENZER.spk7.render({p: ef, dur: 1.6, notes: [{m: 57, t0: 0.02, t1: 1.3}]});
  const L = r.L, R = r.R, a = Math.round(0.3 * r.sr), b = Math.round(1.25 * r.sr); let m = 0, s = 0;
  for (let i = a; i < b; i++) { const M = (L[i] + R[i]) / 2, Sd = (L[i] - R[i]) / 2; m += M * M; s += Sd * Sd; }
  const N = 8192, sp = new Float64Array(N / 2); for (let o = a; o + N <= b; o += N / 2) { const re = new Float32Array(N), im = new Float32Array(N); for (let i = 0; i < N; i++) re[i] = (L[o + i] + R[o + i]) * 0.5 * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); spk7Fft(re, im); for (let k = 0; k < N / 2; k++) sp[k] += Math.hypot(re[k], im[k]); }
  let tot = 0; for (let k = 0; k < N / 2; k++) tot += sp[k]; const spn = Array.from(sp, v => v / (tot || 1));
  return {ef, rms: Math.sqrt(m / (b - a)), side: Math.sqrt(s / (m || 1e-12)), spn, kind: r.kind};
};
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const wer of [BAS, NEU]) {
    const errs = [], z = res[wer] = {errs};
    // ---------- hochkant: Klang-Editor ----------
    let P = await boot(b, wer, 428, 926, errs), p = P.p;
    const t = await p.evaluate(MAKE); z.t = t;
    const h0 = await p.evaluate(t => JSON.stringify(S.tracks[t].sound.p.wt.h), t);
    await p.evaluate(OPEN, t); await p.waitForTimeout(700);
    z.ed = await p.evaluate(ED_INFO); z.lay = await p.evaluate(LAYOUT);
    z.hSame = (await p.evaluate(t => JSON.stringify(S.tracks[t].sound.p.wt.h), t)) === h0;
    await p.screenshot({path: path.join(here, wer === NEU ? 'foto-nachher.png' : 'foto-vorher.png')});
    if (wer === NEU) {
      const A = await p.evaluate(RENDER, t);
      // Live: Ton halten (Hören), dann Regler ziehen
      await p.evaluate(t => { ensureAudio(); ED.hear = auditionStart(t, 57, .8); }, t); await p.waitForTimeout(400);
      const e0 = await p.evaluate(t => SYNQUENZER.spk7.trEng(t), t);
      const kb = await p.evaluate(KB, 'kks.br'); await P.drag([kb.x, kb.y], [kb.x, kb.y - 90]);
      const kg = await p.evaluate(KB, 'kks.gs'); await P.drag([kg.x, kg.y], [kg.x, kg.y - 90]);
      const e1 = await p.evaluate(t => SYNQUENZER.spk7.trEng(t), t);
      z.h1 = await p.evaluate(t => Object.assign({}, S.tracks[t].sound.p.wt.h), t);
      z.txt1 = [(await p.evaluate(KB, 'kks.br')).txt, (await p.evaluate(KB, 'kks.gs')).txt];
      await p.evaluate(() => { if (ED.hear) { ED.hear.release(nowT()); ED.hear = null; } });
      const B = await p.evaluate(RENDER, t);
      let d = 0; for (let k = 0; k < A.spn.length; k++) d += Math.abs(A.spn[k] - B.spn[k]);
      z.cmp = {br: [A.ef.br, B.ef.br], gs: [A.ef.gs, B.ef.gs], side: [+A.side.toFixed(4), +B.side.toFixed(4)], rms: [+A.rms.toFixed(4), +B.rms.toFixed(4)], specDist: +d.toFixed(3), kind: B.kind};
      z.live = {vor: e0 && {br: e0.p.br, gs: e0.p.gs, v: e0.voices}, nach: e1 && {br: e1.p.br, gs: e1.p.gs, v: e1.voices}};
      // Modus Schleife per Tipp: Korn-Regler ruhen (inert), dann ↶ zurück
      const sb = await p.evaluate(() => { const e = [...EL.synthSheet.querySelectorAll('.pg .seg button')].find(x => x.textContent.trim() === 'Schleife'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await P.tap(sb);
      z.frz = await p.evaluate(t => ({art: S.tracks[t].sound.p.wt.h.art, inert: [...EL.synthSheet.querySelectorAll('.pg .knob.inert')].map(e => e.dataset.key)}), t);
      const C = await p.evaluate(RENDER, t); let d2 = 0; for (let k = 0; k < B.spn.length; k++) d2 += Math.abs(B.spn[k] - C.spn[k]); z.frzDist = +d2.toFixed(3);
      await p.evaluate(() => { undo(); undo(); undo(); }); await p.waitForTimeout(300);
      z.undo = await p.evaluate(([t, h0]) => JSON.stringify(S.tracks[t].sound.p.wt.h) === h0, [t, h0]);
      await p.evaluate(OPEN, t); await p.waitForTimeout(400);
    }
    // andere Klänge: VA-Spur 0 und eine normale WT-Spur (Spur 1 auf WT) – Seiten wie in der Basis
    z.va = await p.evaluate(OPEN, 0) && await p.evaluate(ED_INFO);
    await p.evaluate(() => setEngine(1, 'wt')); z.wt = await p.evaluate(OPEN, 1) && await p.evaluate(ED_INFO);
    await P.ctx.close();
    // ---------- quer: Klang-Editor ----------
    P = await boot(b, wer, 926, 428, errs); p = P.p;
    const tq = await p.evaluate(MAKE); await p.evaluate(OPEN, tq); await p.waitForTimeout(700);
    z.edQ = await p.evaluate(ED_INFO); z.layQ = await p.evaluate(LAYOUT);
    await p.screenshot({path: path.join(here, wer === NEU ? 'foto-nachher-quer.png' : 'foto-vorher-quer.png')});
    await P.ctx.close();
    // ---------- Spektral-Seite: Knopf "Als Klangkorn" (hochkant + quer) ----------
    for (const [w, hh, nm] of [[428, 926, ''], [926, 428, '-quer']]) {
      P = await boot(b, wer, w, hh, errs); p = P.p;
      await p.evaluate(() => openMenu()); await p.waitForTimeout(300);
      const mb = await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => /Spektral/.test(x.textContent)); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await P.tap(mb); await p.waitForTimeout(500);
      const fb = await p.evaluate(() => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith('Datei laden')); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      const [fc] = await Promise.all([p.waitForEvent('filechooser', {timeout: 8000}), P.tap(fb)]);
      await fc.setFiles({name: 'Ton.wav', mimeType: 'audio/wav', buffer: wav(4)});
      await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat); }, null, {timeout: 60000}); await p.waitForTimeout(500);
      const AC = () => { const U = SPK1.ui, ac = U.ac, ar = ac.getBoundingClientRect(), bs = [...ac.querySelectorAll('button')].filter(e => e.offsetParent), R = e => e.getBoundingClientRect();
        const ov = []; for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = R(bs[i]), c = R(bs[j]); if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) ov.push([bs[i].textContent, bs[j].textContent]); }
        const ab = bs.find(e => e.textContent.trim() === 'Als Klangkorn'), r = ab && R(ab);
        const ly = U.sh.querySelector('.spk1-ly'), mn = U.sh.querySelector('.spk1-mn');
        return {n: bs.length, ab: r ? {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), inAc: r.left >= ar.left - .5 && r.right <= ar.right + .5 && r.top >= ar.top - .5 && r.bottom <= ar.bottom + .5, inVp: r.right <= innerWidth && r.bottom <= innerHeight, dis: ab.disabled, cut: ab.scrollWidth > ab.clientWidth + 1} : null,
          ov, small: bs.filter(e => R(e).height < 32 || R(e).width < 32).map(e => e.textContent), cut: bs.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent), ly: ly && Math.round(ly.getBoundingClientRect().height), mn: mn && Math.round(mn.getBoundingClientRect().height)}; };
      const k = 'spk' + (nm || '-hoch'); z[k] = {vor: await p.evaluate(AC)};
      // Auswahl per Pinsel, dann "Als Klangkorn" antippen -> Klangkorn-Blatt offen, Quelle geholt
      const pin = await p.evaluate(() => { const e = [...document.querySelectorAll('#spk1Sheet button')].find(x => x.offsetParent && x.textContent.trim().startsWith('Pinsel')); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      if (pin) { await P.tap(pin); const m = await p.evaluate(() => { const r = document.querySelector('#spk1Sheet .spk1-mn').getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }); await P.drag([m.x + m.w * 0.25, m.y + m.h * 0.45], [m.x + m.w * 0.7, m.y + m.h * 0.45], 12); }
      z[k].sel = await p.evaluate(() => SPK1.ui.sel.length); z[k].nach = await p.evaluate(AC);
      if (wer === NEU) {
        await p.screenshot({path: path.join(here, 'foto-spektral-nachher' + nm + '.png')});
        const ab = z[k].nach.ab; if (ab && !ab.dis) { await P.tap([ab.x + ab.w / 2, ab.y + ab.h / 2]); await p.waitForFunction(() => !!SYNQUENZER.spk7.dd() && SYNQUENZER.spk7.src(), null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(400); }
        z[k].als = await p.evaluate(() => ({dd: !!SYNQUENZER.spk7.dd(), src: !!SYNQUENZER.spk7.src(), mode: SYNQUENZER.spk7.mode()}));
      } else await p.screenshot({path: path.join(here, 'foto-spektral-vorher' + nm + '.png')});
      await P.ctx.close();
    }
  }
  await b.close();
  const B0 = res[BAS], N = res[NEU];
  fs.writeFileSync(path.join(here, 'kks-test.json'), JSON.stringify(res, null, 1));
  ok('T1 Basis: Klangkorn-Klang zeigt die Wavetable-Seite (Ausgangslage)', !B0.ed.kks && B0.ed.subs[0] === 'WT', B0.ed.subs);
  ok('T2 neu: Klangkorn-Klang zeigt Seite KORN mit 15 Reglern + Modus', N.ed.kks && N.ed.subs[0] === 'KORN' && N.ed.knobs === 15 && /Körnchen/.test(N.ed.txt), {subs: N.ed.subs, knobs: N.ed.knobs});
  ok('T3 Öffnen ändert den Klang nicht (p.wt.h gleich)', N.hSame && B0.hSame);
  ok('T4 hochkant: im Bild, ≥ 32 px, keine Überlappung, nichts abgeschnitten', !N.lay.out.length && !N.lay.small.length && !N.lay.ov.length && !N.lay.cut.length && N.lay.vis === N.lay.n, N.lay);
  ok('T5 quer: im Bild, ≥ 32 px, keine Überlappung, nichts abgeschnitten', N.edQ.kks && !N.layQ.out.length && !N.layQ.small.length && !N.layQ.ov.length && !N.layQ.cut.length, N.layQ);
  ok('T6 Touch-Ziehen Breite + Korngröße ändert die Werte (Anzeige folgt)', N.cmp.br[1] > N.cmp.br[0] + 0.1 && N.cmp.gs[1] > N.cmp.gs[0] * 1.5, {cmp: [N.cmp.br, N.cmp.gs], txt: N.txt1});
  ok('T7 Render-Vergleich: Klang ändert sich (Seitenanteil Breite, Spektrum Korngröße)', N.cmp.side[1] > N.cmp.side[0] * 1.3 && N.cmp.specDist > 0.05, N.cmp);
  ok('T8 live: gehaltener Ton – Spur-Engine bekommt die neuen Werte', N.live.nach && N.live.vor && N.live.nach.br === N.cmp.br[1] && N.live.nach.gs === N.cmp.gs[1] && N.live.vor.br === N.cmp.br[0], N.live);
  ok('T9 Modus Schleife per Tipp: art frz, Korn-Regler ruhen, Klang anders; ↶ stellt alles her', N.frz.art === 'frz' && N.frz.inert.length === 4 && N.frzDist > 0.05 && N.undo, {frz: N.frz, d: N.frzDist, undo: N.undo});
  ok('T10 andere Klänge: VA- und WT-Seiten wie in der Basis', JSON.stringify(N.va) === JSON.stringify(B0.va) && JSON.stringify(N.wt) === JSON.stringify(B0.wt) && N.wt.subs[0] === 'WT', {va: N.va.subs, wt: N.wt.subs});
  for (const k of ['spk-hoch', 'spk-quer']) {
    const v = N[k];
    ok('T11 ' + k + ': Basis ohne Knopf, neu Knopf als eigene Zeile im Aktionsfeld, sauber', !B0[k].vor.ab && v.vor.ab && v.vor.ab.dis && v.nach.ab && !v.nach.ab.dis && v.nach.ab.inAc && v.nach.ab.inVp && !v.nach.ov.length && !v.nach.small.length && !v.nach.cut.length && v.nach.ab.h >= 32, {basis: {ly: B0[k].vor.ly, mn: B0[k].vor.mn}, neu: v.nach});
    ok('T12 ' + k + ': Tipp „Als Klangkorn“ holt die Quelle, Blatt offen', v.als && v.als.dd && v.als.src, v.als);
  }
  ok('T13 keine Seitenfehler/console.error', !B0.errs.length && !N.errs.length, [B0.errs.slice(0, 3), N.errs.slice(0, 3)]);
  console.log(fail ? 'FEHLER ' + fail : 'ALLE OK');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
