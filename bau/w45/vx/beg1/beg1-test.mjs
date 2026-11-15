// BEG1-Test: Begleiter (Live-Begleitautomatik). Akkorde per Tastatur (inputDown/inputUp wie die Tasten) → Drums, Bass, Begleitung aus den
// eigenen Spuren im Stil; gemessen über den noteLog (jeder gespielte Ton mit Spur, Tonhöhe, Schlag) und die Akkord-Mitschrift des Trägers.
// Abschnitte: 1 aus = Bild/Klang wie Basis · 2 C–Am–F–G am Schlag (Bass, Begleitung, Drums, Quantisierung) · 3 Figuren Akkorde/Arp ·
// 4 Wechsel am Takt · 5 Varianten Intro/A/B/Fill/Schluss · 6 Aufnahme = Live, ↶, Speichern/Laden · 7 keine hängenden Noten, ✕ im Lauf ·
// 4b ein Finger · 8 CPU · 8b Ausgang (Summe) · 9 Touch hochkant/quer (Fotos) · 10 Lauflichter · 11 Guide/Menü · 12 Taktart-Stil (3/4) · 13 Pflichtwörter, alte Projekte ·
// 14 Prüfung BEG1-P (SCHLUSS mit übrigen Spuren, Ziel-Spur im Lauf, ✕ = Szenen-Stand, ↶ in der Leiste, kein Stil, ● AUTO nimmt die Band mit).
// Aufruf: node beg1-test.mjs <index.html> <ordner>   (absolute Pfade; Basis = ../basis.html neben dem Ordner der index.html; Fotos in <ordner>/fotos)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.dirname(file));
const basis = path.resolve(path.dirname(file), '..', 'basis.html');
const fotos = path.basename(out) === 'fotos' ? out : path.join(out, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f, dpr) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: dpr || 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1600);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top}; }, sel);
async function tap(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(250); }
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y); return true; }
// Seiten-Helfer: wait, until(Schlag), chord(Töne) wie Finger auf der Tastatur, Akkord-Töne, Rollen-Prüfung
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const until = async (b, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 40000)) { if (R.playing && AU.ctx && audBeat() >= b) return true; await wait(8); } return false; };
  const chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await wait(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };
  const stopWait = async ms => { const t0 = performance.now(); while (R.playing && performance.now() - t0 < (ms || 15000)) await wait(40); return !R.playing; };
  const pcsOf = tg => { if (!tg) return [0, 4, 7].map(x => PCx(S.key.root + x)); const c = tg.kind === 'chord' && tg.quality && Harmony.BY_Q[tg.quality]; return c ? c.iv.map(x => PCx(tg.root + x)) : hm1Pcs(tg, S.key); };
  const sclOf = tg => { if (!tg) return Harmony.SCALES[S.key.scale].map(x => PCx(S.key.root + x)); const T = Harmony.targetScale(tg, {root: S.key.root, scale: S.key.scale}, 'chord', hopts()); return T.map(x => PCx(tg.root + x)); };
  const chAt = (L, beat) => { let c = L[0]; for (const x of L) if (x.b <= beat + 1e-3) c = x; return c; };
  const slim = e => ({tr: e.track, src: e.src, out: e.out, b: e.beat == null ? null : +e.beat.toFixed(3), v: +(+e.vel).toFixed(3)});`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const logKey = e => e.tr + ':' + e.out + '@' + e.b.toFixed(2);
try {
  /* ---------- 1 aus = wie die Basis (Bild hochkant/quer, nach Öffnen + ✕, Klang einer Szene) ---------- */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const A = await page(w, h, basis), Bp = await page(w, h);
    const sa = await A.screenshot(), sb = await Bp.screenshot();
    ok(Buffer.compare(sa, sb) === 0, 'Begleiter aus: Bild pixelgleich zur Basis (' + n + ' ' + w + '×' + h + ')');
    // Öffnen startet den Ton (wie jeder erste Tipp in der App: ▶ zeigt dann sein Ton-an-Bild) – die Basis bekommt denselben ersten Ton
    await run(A, async () => { ensureAudio(); await wait(900); });
    await run(Bp, async () => { SYNQUENZER.beg1.open(); await wait(400); SYNQUENZER.beg1.close(); await wait(500); });
    const sa2 = await A.screenshot(), sc = await Bp.screenshot();
    ok(Buffer.compare(sa2, sc) === 0, 'Begleiter geöffnet und mit ✕ geschlossen: Bild wieder pixelgleich zur Basis nach dem ersten Ton (' + n + ')',
      JSON.stringify(await run(Bp, () => ({hook: !!R.beg1, kb: R.kbMode, bar: !!document.getElementById('beg1Bar')}))));
    await A.close(); await Bp.close();
  }
  {
    const play = async (f, openClose) => {
      const p = await page(428, 926, f);
      const r = await run(p, async oc => {
        ensureAudio(); await wait(300); SYNQUENZER.setBpm(150);
        if (oc && SYNQUENZER.beg1) { SYNQUENZER.beg1.open(); await wait(200); SYNQUENZER.beg1.close(); await wait(200); }
        clearLog(); launchScene(0); await until(8.05); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 8).map(slim); SYNQUENZER.stop(); await wait(300);
        return {L, ser: serializeProject().length};
      }, openClose);
      await p.close(); return r;
    };
    const A = await play(basis, false), B0 = await play(file, false), B1 = await play(file, true);
    const ks = L => L.map(logKey).sort().join(',');
    ok(A.L.length > 40 && ks(A.L) === ks(B0.L) && ks(A.L) === ks(B1.L), 'Begleiter aus: Szene 1 klingt wie die Basis (noteLog: jede Note gleich Spur, Tonhöhe, Schlag) – auch nach Öffnen + ✕', A.L.length + ' Noten in 2 Takten');
  }

  /* ---------- 2 C – Am – F – G per Tastatur, Wechsel am Schlag ---------- */
  const P = await page(428, 926);
  const R2 = await run(P, async () => {
    ensureAudio(); await wait(400); SYNQUENZER.setBpm(150);
    const B = SYNQUENZER.beg1; B.open(); await wait(300);
    const st0 = B.state(); clearLog();
    await chord([60, 64, 67]); await wait(250);
    const sync = {playing: R.playing, run: B.run()};
    const press = {};
    await until(3.62); press.Am = audBeat(); await chord([57, 60, 64]);
    await until(7.62); press.F = audBeat(); await chord([53, 57, 60]);
    await until(11.62); press.G = audBeat(); await chord([55, 59, 62]);
    await until(16.05);
    const L = noteLog(4096).filter(e => e.beat != null && e.beat < 16).map(slim), ch = B.chords(), cpu = B.cpu(), tg = B.state().tg, pat = B.pattern();
    SYNQUENZER.stop(); await wait(600);
    // je Rolle: Anteil Akkord-/Stilton; Bass auf der Eins = Grundton; Drums wie das Muster
    const name = ch.map(c => (c.tg ? prettyTarget(c.tg) : 'ORIG') + '@' + c.b);
    const role = t => (t === tg.dr ? 'dr' : t === tg.bs ? 'bs' : t === tg.cp ? 'cp' : null);
    const res = {bs: {n: 0, chord: 0, style: 0, roots: [], keyOut: []}, cp: {n: 0, chord: 0, bad: []}, dr: {n: 0, srcs: {}}, other: 0};
    for (const e of L) {
      const r = role(e.tr); if (!r) { res.other++; continue; }
      if (r === 'dr') { res.dr.n++; res.dr.srcs[e.src] = (res.dr.srcs[e.src] || 0) + 1; continue; }
      const c = chAt(ch, e.b), pc = PCx(e.out), cpcs = pcsOf(c.tg);
      if (r === 'bs') { res.bs.n++; if (cpcs.includes(pc)) res.bs.chord++; else if (sclOf(c.tg).includes(pc)) res.bs.style++; else res.bs.keyOut.push(e.out + '@' + e.b); if (Math.abs(e.b - Math.round(e.b / 4) * 4) < 1e-3 && e.src !== 'retune') res.bs.roots.push([e.b, pc === PCx(c.tg.root)]); }
      else { res.cp.n++; if (cpcs.includes(pc)) res.cp.chord++; else res.cp.bad.push(e.out + '@' + e.b + ' ' + (c.tg ? prettyTarget(c.tg) : '')); }
    }
    const drPat = pat.m.dr.A[0].concat(pat.m.dr.A[1].map(n => Object.assign({}, n, {t: n.t + 4}))).map(n => n.n + '@' + n.t.toFixed(2)).sort().join(','), drLog = L.filter(e => e.tr === tg.dr && e.b < 8).map(e => e.out + '@' + e.b.toFixed(2)).sort().join(',');
    return {st0, sync, press, name, ch, res, drSame: drPat === drLog, drPat: drPat.slice(0, 120), cpu, tg, srcs: [...new Set(L.map(e => e.src))], fig: pat.fig, st: pat.st};
  });
  ok(R2.st0.kbMode === 'transpose' && R2.st0.opts.mode === 'chord' && R2.st0.opts.latch === true && R2.st0.opts.change === 'beat', 'Leiste offen: Tastatur auf TRANSP. (Akkorde, stumm), Träger AKKORD, Halten an, Wechsel am Schlag', JSON.stringify(R2.st0.opts) + ' · Ziel-Spuren ' + JSON.stringify(R2.st0.tg));
  ok(R2.sync.playing && R2.sync.run && R2.sync.run.t0 === 0, 'Sync-Start: der erste Akkord startet – die Begleitung beginnt am Taktstrich (Schlag 0)', JSON.stringify(R2.sync.run && {t0: R2.sync.run.t0, LB: R2.sync.run.LB}));
  ok(R2.name.join(' ') === 'C@0 Am@4 F@8 G@12', 'Akkord folgen: C – Am – F – G, jeder Wechsel auf dem nächsten Schlag (gedrückt ' + Object.entries(R2.press).map(([k, v]) => k + ' bei ' + v.toFixed(2)).join(', ') + ')', R2.name.join(' '));
  const bsQ = (R2.res.bs.chord + R2.res.bs.style) / Math.max(1, R2.res.bs.n), cpQ = R2.res.cp.chord / Math.max(1, R2.res.cp.n);
  ok(R2.res.bs.n >= 16 && bsQ >= .95 && R2.res.bs.roots.length >= 4 && R2.res.bs.roots.every(x => x[1]), 'Bass (Spur ' + (R2.tg.bs + 1) + '): Grundton auf jeder Eins, sonst Akkord- oder Stilton der Tonart des Akkords', R2.res.bs.n + ' Töne, ' + R2.res.bs.chord + ' Akkordton, ' + R2.res.bs.style + ' Stilton, fremd ' + JSON.stringify(R2.res.bs.keyOut.slice(0, 4)) + ' → ' + Math.round(bsQ * 100) + ' %');
  ok(R2.res.cp.n >= 12 && cpQ >= .95, 'Begleitung (' + R2.fig + '): trifft die Akkordtöne (noteLog ≥ 95 %)', R2.res.cp.n + ' Töne, ' + Math.round(cpQ * 100) + ' %' + (R2.res.cp.bad.length ? ' daneben ' + R2.res.cp.bad.slice(0, 3).join(' ') : ''));
  ok(R2.res.dr.n >= 24 && R2.drSame, 'Drums im Stil (' + R2.st + '): die ersten 2 Takte genau das Grundmuster A des Stils mit den Pads des Kits', R2.res.dr.n + ' Schläge');
  ok(R2.res.other === 0 && R2.srcs.includes('beg'), 'Nur die Band: die übrigen Spuren starten beim Sync-Start still; die Band-Töne stehen im noteLog als src „beg“', 'andere Spuren ' + R2.res.other + ' · src ' + R2.srcs.join(','));

  /* ---------- 3 Figuren: Akkorde (Comping) und Arp ---------- */
  for (const fig of ['stab', 'arp']) {
    const R3 = await run(P, async f => {
      const B = SYNQUENZER.beg1; B.fig(f); B.variant('B'); clearLog();
      await chord([57, 60, 64]); await wait(200);
      await until(3.62); await chord([53, 57, 60]);
      await until(8.05);
      const L = noteLog(4096).filter(e => e.beat != null && e.beat < 8).map(slim), ch = B.chords(), tg = B.state().tg;
      SYNQUENZER.stop(); await wait(500); B.variant('A');
      let n = 0, hit = 0; const ons = new Set();
      for (const e of L) if (e.tr === tg.cp && e.src !== 'retune') { n++; if (pcsOf(chAt(ch, e.b).tg).includes(PCx(e.out))) hit++; ons.add(e.b.toFixed(2)); }
      return {n, hit, ons: ons.size, ch: ch.map(c => prettyTarget(c.tg) + '@' + c.b).join(' ')};
    }, fig);
    ok(R3.n >= 8 && R3.hit / R3.n >= .95 && R3.ch === 'Am@0 F@4', 'Figur ' + (fig === 'stab' ? 'Akkorde (Akkord-Raster des Stils)' : 'Arp (Sequenz-Raster des Stils)') + ': Variante B trifft die Akkordtöne von Am und F', R3.n + ' Töne auf ' + R3.ons + ' Anschlägen, ' + Math.round(R3.hit / Math.max(1, R3.n) * 100) + ' %');
  }
  await run(P, () => SYNQUENZER.beg1.fig('auto'));

  /* ---------- 4 Wechsel am Takt ---------- */
  const R4 = await run(P, async () => {
    const B = SYNQUENZER.beg1; B.chg('bar'); const o = T.opts.change; clearLog();
    await chord([60, 64, 67]); await wait(200);
    await until(5.3); const pr = audBeat(); await chord([57, 60, 64]);
    await until(9.0); const ch = B.chords(); SYNQUENZER.stop(); await wait(400); B.chg('beat');
    return {o, pr, ch: ch.map(c => prettyTarget(c.tg) + '@' + c.b).join(' ')};
  });
  ok(R4.o === 'bar' && R4.ch === 'C@0 Am@8', 'Wechsel am Takt: Am mitten im Takt gegriffen (Schlag ' + R4.pr.toFixed(2) + ') wechselt am nächsten Taktstrich', R4.ch);

  /* ---------- 4b Ein Finger: Grundton allein = Akkord der Tonart (Harmonie-Einstellung), Grundton + Terz = Dur │ Moll ---------- */
  const R4b = await run(P, async () => {
    const B = SYNQUENZER.beg1; clearLog();
    await chord([57]); await wait(200);              // A allein (C-Dur: a-Moll)
    await until(3.62); await chord([62]);            // D allein → d-Moll
    await until(7.62); await chord([53, 57]);        // F + A (große Terz) → F-Dur
    await until(11.62); await chord([52, 55]);       // E + G (kleine Terz) → e-Moll
    await until(16.05);
    const L = noteLog(4096).filter(e => e.beat != null && e.beat < 16).map(slim), ch = B.chords(), tg = B.state().tg;
    SYNQUENZER.stop(); await wait(500);
    let n = 0, hit = 0; const roots = [], sets = {};
    for (const e of L) {
      if ((e.tr !== tg.cp && e.tr !== tg.bs) || e.src === 'retune') continue;
      const c = chAt(ch, e.b), pcs = pcsOf(c.tg); n++; if (pcs.includes(PCx(e.out))) hit++;
      if (e.tr === tg.cp) { const k = Math.floor(e.b / 4); (sets[k] = sets[k] || new Set()).add(PCx(e.out)); }
      if (e.tr === tg.bs && Math.abs(e.b - Math.round(e.b / 4) * 4) < 1e-3) roots.push(PCx(e.out) === PCx(c.tg.root));
    }
    return {names: ch.map(c => (c.tg ? prettyTarget(c.tg) : 'ORIG') + '@' + c.b).join(' '), n, hit, roots, single: S.settings.harmony.single, sets: Object.values(sets).map(x => [...x].sort((a, b) => a - b).join('.'))};
  });
  ok(R4b.names === 'A@0 D@4 F@8 Em@12' && R4b.n >= 20 && R4b.hit / R4b.n >= .95 && R4b.roots.length >= 4 && R4b.roots.every(Boolean) && R4b.sets.join(' ') === '0.4.9 2.5.9 0.5.9 4.7.11',
    'Ein Finger: A allein = a-Moll, D allein = d-Moll (Akkord der Tonart, Harmonie „' + R4b.single + '“), F + A = F-Dur, E + G = e-Moll – Bass auf dem Grundton, Begleitung in den Akkordtönen',
    R4b.names + ' · Begleit-Töne je Takt ' + R4b.sets.join(' ') + ' · ' + Math.round(R4b.hit / Math.max(1, R4b.n) * 100) + ' %');

  /* ---------- 5 Varianten: Intro, A, B, Fill, Schluss ---------- */
  const R5 = await run(P, async () => {
    const B = SYNQUENZER.beg1; clearLog();
    B.variant('I');                                          // Intro vor dem Start
    await chord([60, 64, 67]); await wait(200);
    await until(9.0); B.variant('B');                        // B ab Takt 4 (Takt 2–3 = A)
    await until(14.2); const fr = B.fill();                  // Fill im Takt 3 (Schlag 12–16)
    await until(17.0); B.variant('E');                       // Schluss = Takt 5, dann Stopp
    const stopped = await stopWait(12000); await wait(400);
    const L = noteLog(4096).filter(e => e.beat != null).map(slim), r = B.run ? null : null, tg = B.state().tg, pat = B.pattern();
    const bar = (k, t) => L.filter(e => e.tr === t && e.src !== 'retune' && e.b >= 4 * k - 1e-6 && e.b < 4 * k + 4 - 1e-6);
    const sig = (k, t) => bar(k, t).map(e => e.out + '@' + (e.b - 4 * k).toFixed(2)).sort().join(',');
    const hatPads = new Set([42, 46, 70, 37]);
    return {fr, stopped, alive: VOICES.filter(v => !v.dead).length, tg,
      intro0: {dr: bar(0, tg.dr).map(e => e.out), bs: bar(0, tg.bs).length, cp: bar(0, tg.cp).length}, intro1: {bs: bar(1, tg.bs).map(e => e.b), toms: bar(1, tg.dr).filter(e => [45, 47, 50, 38, 39].includes(e.out) && e.b >= 4 + 4 - pat.fill.len - 1e-6).length},
      hatsOnly: bar(0, tg.dr).every(e => hatPads.has(e.out)),
      A: {dr: sig(2, tg.dr), bs: sig(2, tg.bs), cp: sig(2, tg.cp), n: [bar(2, tg.dr).length, bar(2, tg.bs).length, bar(2, tg.cp).length]},
      Bv: {dr: sig(4, tg.dr), bs: sig(4, tg.bs), cp: sig(4, tg.cp), n: [bar(4, tg.dr).length, bar(4, tg.bs).length, bar(4, tg.cp).length]},
      fill: {pre: bar(3, tg.dr).filter(e => e.b < 12 + fr.s - 1e-6).length, fillN: bar(3, tg.dr).filter(e => e.b >= 12 + fr.s - 1e-6).map(e => e.out), pat: pat.fill.notes.filter(n => pat.LB - pat.fill.len + n.t >= fr.s - 1e-6).map(n => n.n)},
      E: {dr: bar(5, tg.dr).map(e => e.out + '@' + (e.b - 20).toFixed(2)), bs: bar(5, tg.bs).map(e => (e.b - 20).toFixed(2)), cp: bar(5, tg.cp).map(e => (e.b - 20).toFixed(2)), after: L.filter(e => e.b >= 24 - 1e-6).length},
      fillName: pat.fill.name};
  });
  ok(R5.hatsOnly && R5.intro0.dr.length >= 2 && R5.intro0.bs === 0 && R5.intro0.cp >= 3 && R5.intro1.bs.length === 1 && R5.intro1.toms >= 3, 'INTRO: Takt 1 nur Hi-Hats + liegender Akkord (kein Bass), Takt 2 Grundton auf der Eins und das Fill am Ende', 'Takt 1 Drums ' + R5.intro0.dr.join(',') + ' · Fill-Schläge ' + R5.intro1.toms);
  ok(R5.A.dr !== R5.Bv.dr && R5.A.cp !== R5.Bv.cp && R5.Bv.n[0] > R5.A.n[0] && R5.Bv.n[2] > R5.A.n[2], 'A ↔ B hörbar verschieden: B hat mehr Drum-Schläge und mehr Begleit-Anschläge, andere Rhythmen', 'A Drums/Bass/Begl. ' + R5.A.n.join('/') + ' · B ' + R5.Bv.n.join('/') + (R5.A.bs !== R5.Bv.bs ? ' · Bass anders' : ' · Bass-Rhythmus gleich'));
  ok(R5.fr && R5.fr.k === 3 && R5.fill.fillN.length >= 2 && R5.fill.fillN.join(',') === R5.fill.pat.sort((a, b) => a - b).join(',') || (R5.fill.fillN.slice().sort().join(',') === R5.fill.pat.slice().sort().join(',')), 'FILL: im laufenden Takt ab Schlag ' + (R5.fr && R5.fr.s) + ' das Genre-Fill „' + R5.fillName + '“ (der Groove schweigt dort)', 'davor ' + R5.fill.pre + ' Schläge, Fill ' + R5.fill.fillN.join(','));
  ok(R5.E.dr.join(',') === '36@0.00,49@0.00' && R5.E.bs.join(',') === '0.00' && R5.E.cp.every(x => x === '0.00') && R5.E.after === 0 && R5.stopped, 'SCHLUSS: Schlusstakt (Bassdrum + Becken, Grundton, Akkord auf der Eins), danach Stopp – kein Ton mehr', 'Drums ' + R5.E.dr.join(' ') + ' · danach ' + R5.E.after);
  ok(R5.alive === 0, 'Keine hängenden Noten nach dem Stopp (alle Stimmen frei)', R5.alive + ' Stimmen');
  await P.screenshot({path: path.join(fotos, 'beg1-nach-schluss-hochkant.png')});

  /* ---------- 6 Aufnahme = Live, ein ↶, Speichern/Laden ---------- */
  const R6 = await run(P, async () => {
    const B = SYNQUENZER.beg1, u0 = UNDO.length; clearLog();
    B.rec(); const armed = B.state().rec;
    await chord([60, 64, 67]); await wait(200);
    await until(3.62); await chord([57, 60, 64]);
    await until(5.0); B.variant('B');
    await until(7.62); await chord([53, 57, 60]);
    await until(10.0); B.fill();
    await until(11.62); await chord([55, 59, 62]);
    await until(14.0); B.rec();                              // endet am Taktstrich 16
    await until(16.6); const live = noteLog(4096).filter(e => e.beat != null && e.beat < 16).map(slim);
    SYNQUENZER.stop(); await wait(500);
    const res = B.state().last, tg = B.state().tg, u1 = UNDO.length, lab = UNDO.length ? UNDO[UNDO.length - 1].label : '';
    const sc = res ? res.scene : -1, row = sc >= 0 && S.scenes[sc].chords ? rowShortText(S.scenes[sc].chords) : null;
    const clips = [tg.dr, tg.bs, tg.cp].map(t => (sc >= 0 && S.tracks[t].clips[sc] ? {len: S.tracks[t].clips[sc].len, n: S.tracks[t].clips[sc].notes.length, key: S.tracks[t].clips[sc].key} : null));
    // Wiedergabe der neuen Szene (Begleiter zu): dieselben Töne?
    B.close(); await wait(300); clearLog();
    launchScene(sc); await until(16.05);
    const back = noteLog(4096).filter(e => e.beat != null && e.beat < 16).map(slim); SYNQUENZER.stop(); await wait(400);
    // ein ↶ nimmt alles zurück, ↷ bringt es wieder
    const keep = JSON.stringify({c: [tg.dr, tg.bs, tg.cp].map(t => cleanClip(S.tracks[t].clips[sc])), r: S.scenes[sc].chords});
    const u2 = UNDO.length; let undone = null, redone = null;
    if (u2) { undo(); undone = {clips: [tg.dr, tg.bs, tg.cp].map(t => !!S.tracks[t].clips[sc]), row: !!(S.scenes[sc].chords && S.scenes[sc].chords.ch.length)}; redo(); redone = JSON.stringify({c: [tg.dr, tg.bs, tg.cp].map(t => (S.tracks[t].clips[sc] ? cleanClip(S.tracks[t].clips[sc]) : null)), r: S.scenes[sc].chords}) === keep; }
    // Speichern/Laden: Projekt als Datei, neu laden – Szene und Akkord-Zeile gleich
    const json = serialize(); importJSON(json); await wait(500);
    const again = JSON.stringify({c: [tg.dr, tg.bs, tg.cp].map(t => (S.tracks[t].clips[sc] ? cleanClip(S.tracks[t].clips[sc]) : null)), r: S.scenes[sc].chords});
    return {armed, res, row, clips, du: u1 - u0, lab, live, back, tg, sc, loadSame: keep === again, undone, redone, u2};
  });
  ok(R6.armed && R6.armed.k0 == null && R6.res && R6.res.bars === 4 && R6.row === 'C·Am·F·G' && R6.clips.every(c => c && c.len === 4), '● Aufnahme (vor dem Start gedrückt): 4 Takte → neue Szene ' + (R6.sc + 1) + ' mit je einem Clip auf Drums/Bass/Begleitung und der Akkord-Zeile', 'Zeile ' + R6.row + ' · Clips ' + JSON.stringify(R6.clips.map(c => c && c.n)));
  ok(R6.du === 1 && /Begleiter/.test(R6.lab), 'Aufnahme = genau ein ↶-Schritt', R6.lab);
  {
    const T_ = new Set([R6.tg.dr, R6.tg.bs, R6.tg.cp]), norm = L => L.filter(e => T_.has(e.tr) && e.src !== 'retune').map(logKey).sort();
    const a = norm(R6.live), c = norm(R6.back), same = a.length === c.length && a.every((x, i) => x === c[i]);
    const ra = R6.live.filter(e => e.src === 'retune').length, rb = R6.back.filter(e => e.src === 'retune').length;
    let diff = []; if (!same) { const sa = new Set(a), sc_ = new Set(c); diff = a.filter(x => !sc_.has(x)).slice(0, 4).concat(['|'], c.filter(x => !sa.has(x)).slice(0, 4)); }
    ok(same && a.length > 60, 'Aufnahme = Live: die Szene spielt Ton für Ton dasselbe wie live (noteLog: Spur, Tonhöhe, Schlag; mit A→B, Fill, 4 Akkorden)', a.length + ' Töne live, ' + c.length + ' aus der Szene' + (diff.length ? ' · ' + diff.join(' ') : '') + ' · Umstimmungen ' + ra + '/' + rb);
  }
  ok(R6.loadSame, 'Speichern/Laden: Clips und Akkord-Zeile der Begleiter-Szene kommen gleich zurück');
  ok(R6.undone && R6.undone.clips.every(x => !x) && !R6.undone.row && R6.redone, '↶ nimmt Clips und Akkord-Zeile zusammen zurück, ↷ bringt sie gleich wieder');

  /* ---------- 7 ✕ während der Begleiter spielt: Takt zu Ende, dann wieder die Clips; keine hängenden Noten ---------- */
  const R7 = await run(P, async () => {
    const B = SYNQUENZER.beg1; clearLog();
    launchScene(0); await until(1.5); B.open(); await wait(150);   // Szene läuft schon, Begleiter übernimmt am nächsten Taktstrich
    const t0 = B.run() ? B.run().t0 : null;
    await until(5.4); B.close(); const tEnd = B.run() ? B.run().tEnd : null;
    await until(12.05); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 12).map(slim); const hook = !!R.beg1;
    SYNQUENZER.stop(); await wait(1500);
    return {t0, tEnd, begAfter: L.filter(e => e.src === 'beg' && e.b >= tEnd - 1e-6).length, begIn: L.filter(e => e.src === 'beg').length, clipsBefore: L.filter(e => e.src !== 'beg' && e.b < 4 && [0, 2, 4].includes(e.tr)).length,
      clipsAfter: L.filter(e => e.src !== 'beg' && e.b >= tEnd && [0, 2, 4].includes(e.tr)).length, hook, alive: VOICES.filter(v => !v.dead).length, kb: R.kbMode};
  });
  ok(R7.t0 === 4 && R7.tEnd === 8 && R7.begIn > 10 && R7.begAfter === 0 && R7.clipsBefore > 0 && R7.clipsAfter > 0, 'Geöffnet, während eine Szene läuft: die Band übernimmt am nächsten Taktstrich; ✕ im Lauf: der Takt spielt zu Ende, danach wieder die Clips', 'Band ab ' + R7.t0 + ' bis ' + R7.tEnd + ', danach Band-Töne ' + R7.begAfter + ', Clips ' + R7.clipsAfter);
  ok(!R7.hook && R7.alive === 0 && R7.kb === 'play', 'Nach ✕ und Stopp: kein Begleiter-Haken mehr, keine hängenden Noten, Tastatur wieder SPIELEN', R7.alive + ' Stimmen');

  /* ---------- 8 CPU ---------- */
  const R8 = await run(P, async () => {
    const B = SYNQUENZER.beg1; B.open(); await wait(200); B.cpuReset(); const e0 = TICKERR.n;
    const lt = []; let po = null; try { po = new PerformanceObserver(l => { for (const x of l.getEntries()) lt.push(x.duration); }); po.observe({entryTypes: ['longtask']}); } catch (e) {}
    await chord([60, 64, 67]); await wait(200); B.variant('B');
    await until(5.6); await chord([57, 60, 64]); await until(9.6); await chord([53, 57, 60]); await until(13.6); await chord([55, 59, 62]); await until(16.5);
    SYNQUENZER.stop(); await wait(300); try { po && po.disconnect(); } catch (e) {}
    const c = B.cpu(); B.close(); await wait(200);
    return {c, err: TICKERR.n - e0, lt: lt.length, ltMax: lt.length ? Math.max(...lt) : 0};
  });
  ok(R8.c.n > 100 && R8.c.avgMs < .5 && R8.c.max < 12 && R8.err === 0, 'CPU: der Begleiter plant je Spur und Fenster in Ø ' + (R8.c.avgMs * 1000).toFixed(0) + ' µs (Spitze ' + R8.c.max.toFixed(1) + ' ms), keine Planer-Fehler', R8.c.n + ' Fenster, ' + R8.c.ev + ' Töne · lange Aufgaben ' + R8.lt + (R8.lt ? ' (max ' + R8.ltMax.toFixed(0) + ' ms)' : ''));
  await P.close();

  /* ---------- 8b Ausgang (Summe hinter dem Limiter, Echtzeit): Pegel, keine Aussetzer, nach SCHLUSS klingt alles aus ---------- */
  {
    const p = await page(428, 926);
    const r = await run(p, async () => {
      ensureAudio(); await wait(500); SYNQUENZER.setBpm(150);
      const c = AU.ctx; if (c.state !== 'running') { try { await c.resume(); } catch (e) {} }
      const src = 'class B1R extends AudioWorkletProcessor{constructor(){super();this.on=true;this.port.onmessage=()=>{this.on=false};}process(i){const x=i[0]&&i[0][0];if(this.on)this.port.postMessage({f:currentFrame,d:x?x.slice(0):null});return true;}}registerProcessor("b1rec",B1R);';
      await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const rec = new AudioWorkletNode(c, 'b1rec', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit'});
      const z = c.createGain(); z.gain.value = 0; rec.connect(z); z.connect(c.destination); AU.M.ceil.connect(rec);
      const chs = []; rec.port.onmessage = e => chs.push(e.data);
      const B = SYNQUENZER.beg1; B.open(); await wait(300); B.variant('B');
      await chord([60, 64, 67]); await wait(200);
      const t0 = AU.ctx.currentTime;
      await until(3.62); await chord([57, 60, 64]); await until(7.62); await chord([53, 57, 60]); await until(11.62); await chord([55, 59, 62]);
      await until(13.0); B.variant('E');
      await stopWait(12000); const tStop = AU.ctx.currentTime; await wait(4200);
      rec.port.postMessage(0); await wait(100); try { AU.M.ceil.disconnect(rec); } catch (e) {}
      const alive = VOICES.filter(v => !v.dead).length; B.close();
      chs.sort((a, b) => a.f - b.f); const f0 = chs[0].f, n = chs[chs.length - 1].f + 128 - f0, x = new Float32Array(n), have = new Uint8Array(Math.ceil(n / 128));
      for (const q of chs) { if (q.d) x.set(q.d, q.f - f0); have[(q.f - f0) / 128 | 0] = 1; }
      const sr = c.sampleRate, idx = t => clamp(Math.round(t * sr - f0), 0, n);
      const lvl = (a, b) => { let m = 0, s2 = 0, bad = 0; for (let i = a; i < b; i++) { const v = x[i]; if (!isFinite(v)) { bad++; continue; } m = Math.max(m, Math.abs(v)); s2 += v * v; } return {peak: m, rms: Math.sqrt(s2 / Math.max(1, b - a)), bad}; };
      const playA = idx(t0 + .2), playB = idx(tStop - .1), play = lvl(playA, playB);
      let run0 = 0, cur = 0; for (let i = playA; i < playB; i++) { if (Math.abs(x[i]) < 1e-5) { cur++; if (cur > run0) run0 = cur; } else cur = 0; }
      // Ausklingen nach dem Stopp in Halbsekunden (Spitze in dBFS): Hall/Release fallen gleichmäßig; eine hängende Note bliebe stehen
      const curve = []; for (let s0 = 0; s0 < 4; s0 += .5) { const q = lvl(idx(tStop + s0), idx(tStop + s0 + .5)); curve.push(+(20 * Math.log10(q.peak + 1e-12)).toFixed(1)); }
      const lost = have.slice((playA / 128) | 0, (playB / 128) | 0).reduce((a, v) => a + (v ? 0 : 1), 0);
      return {sr, sec: +((playB - playA) / sr).toFixed(2), play: {peak: +play.peak.toFixed(3), rmsDb: +(20 * Math.log10(play.rms + 1e-12)).toFixed(1), bad: play.bad}, maxSilentMs: +(run0 / sr * 1000).toFixed(1), curve, lost, alive};
    });
    const fall = r.curve.slice(1).every((v, i) => v < r.curve[i] + 1), last = r.curve[r.curve.length - 1];
    ok(r.sec > 6 && r.play.bad === 0 && r.play.peak <= 1.0001 && r.play.rmsDb > -40 && r.maxSilentMs < 40 && fall && last < -66 && r.alive === 0,
      'Ausgang (Summe, Echtzeit): die Band klingt (Pegel), kein Übersteuern/NaN, keine Aussetzer; nach dem SCHLUSS-Stopp klingt alles gleichmäßig aus (nach 3,5 s still) – keine hängenden Noten',
      r.sec + ' s · Spitze ' + r.play.peak + ' · RMS ' + r.play.rmsDb + ' dB · längste Stille ' + r.maxSilentMs + ' ms · Ausklang je ½ s ' + r.curve.join(' ') + ' dBFS · Mess-Blöcke verloren ' + r.lost);
    await p.close();
  }

  /* ---------- 9 Touch: hochkant und quer (öffnen über AKKORD ▾, Tasten ≥ 44 px, ✕ sichtbar, nichts springt) ---------- */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer'], [926, 370, 'quer-370']]) {
    const p = await page(w, h);
    const lay0 = await p.evaluate(() => ['kbArea', 'modebar', 'gridArea', 'kb'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(','); }).join('|'));
    await tapSel(p, '#bHMode'); await p.waitForTimeout(300);
    const row = await ctr(p, '.pop .b1-hm');
    if (row) await tap(p, row.x, row.y);
    await p.waitForTimeout(400);
    const st = await p.evaluate(() => {
      const E = document.getElementById('beg1Bar'); if (!E) return null;
      const r = E.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, small = [], hid = [];
      for (const x of E.querySelectorAll('button')) { const q = x.getBoundingClientRect(); if (q.width < 44 || q.height < 44) small.push(x.dataset.b + ' ' + Math.round(q.width) + '×' + Math.round(q.height)); const el2 = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (!el2 || !x.contains(el2) && el2 !== x) hid.push(x.dataset.b); }
      const kr = document.getElementById('kb').getBoundingClientRect();
      return {r: [r.left, r.top, r.width, r.height].map(Math.round), inView: r.left >= 0 && r.top >= 0 && r.right <= vw + .5 && r.bottom <= vh + .5, small, hid, overKb: r.bottom > kr.top + .5 && r.top < kr.bottom && r.right > kr.left && r.left < kr.right};
    });
    const lay1 = await p.evaluate(() => ['kbArea', 'modebar', 'gridArea', 'kb'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(','); }).join('|'));
    ok(!!st && st.inView && !st.small.length && !st.hid.length && !st.overKb, 'Touch ' + n + ': AKKORD ▾ › BEGLEITER öffnet die Leiste – im Bild, alle Tasten ≥ 44 px und frei (✕ sichtbar), die Tastatur bleibt frei', st ? 'Leiste ' + st.r.join(',') + (st.small.length ? ' klein: ' + st.small.join(' ') : '') + (st.hid.length ? ' verdeckt: ' + st.hid.join(' ') : '') : 'keine Leiste');
    ok(lay0 === lay1, 'Touch ' + n + ': kein Layout-Springen (Tastatur, Modusleiste, Raster unverändert)');
    await p.screenshot({path: path.join(fotos, 'beg1-leiste-' + n + '.png')});
    await tapSel(p, '#beg1Bar .b1-vB'); await tapSel(p, '#beg1Bar .b1-chg');
    const s2 = await p.evaluate(() => SYNQUENZER.beg1.state());
    await tapSel(p, '#beg1Bar .b1-st'); await p.waitForTimeout(400);
    const tile = await p.evaluate(() => { const b = [...document.querySelectorAll('.pop.b1pop .b1-s')].find(x => x.dataset.s === 'house'); if (!b) return null; b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height}; });
    if (tile) await tap(p, tile.x, tile.y);
    const sheet = await p.evaluate(() => { const P = document.querySelector('.pop.b1pop'); if (!P) return null; const r = P.getBoundingClientRect(); return {inView: r.top >= 0 && r.bottom <= innerHeight + .5 && r.left >= 0 && r.right <= innerWidth + .5, small: [...P.querySelectorAll('button')].filter(x => { const q = x.getBoundingClientRect(); if (x.classList.contains('ux1-px')) { const a = getComputedStyle(x, '::after'); return q.height - parseFloat(a.top) - parseFloat(a.bottom) < 44 || q.width - parseFloat(a.left) - parseFloat(a.right) < 44; } return q.height > 0 && q.height < 44 && !x.closest('h4'); }).length}; });
    await p.screenshot({path: path.join(fotos, 'beg1-blatt-' + n + '.png')});
    const s3 = await p.evaluate(() => SYNQUENZER.beg1.state());
    await p.evaluate(() => closePop()); await p.waitForTimeout(200);
    // spielen per Touch: Akkord auf der Tastatur (Finger), dann ✕
    const keyC = await p.evaluate(() => { const k = document.querySelector('#kb .key.w'); const r = k.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.bottom - 20}; });
    await tDown(p, keyC.x, keyC.y); await p.waitForTimeout(150); await tUp(p); await p.waitForTimeout(1600);
    const s4 = await p.evaluate(() => ({playing: R.playing, run: SYNQUENZER.beg1.run(), ch: (SYNQUENZER.beg1.chords() || []).map(c => (c.tg ? prettyTarget(c.tg) : 'ORIG'))}));
    await p.screenshot({path: path.join(fotos, 'beg1-spielt-' + n + '.png')});
    await tapSel(p, '#beg1Bar .b1-x'); await p.waitForTimeout(300);
    const s5 = await p.evaluate(() => ({on: SYNQUENZER.beg1.isOpen(), bar: !!document.getElementById('beg1Bar')}));
    await p.evaluate(() => SYNQUENZER.stop()); await p.waitForTimeout(300);
    ok(s2.v === 'B' && s2.chg === 'bar' && s3.st === 'house' && sheet && sheet.inView && sheet.small === 0 && s4.playing && s4.run && !s5.on && !s5.bar, 'Touch ' + n + ': B, WECHSEL, STIL ▾ › House, eine Taste startet (Sync-Start), ✕ schließt', 'Variante ' + s2.v + ', Wechsel ' + s2.chg + ', Stil ' + s3.st + ', Akkord ' + (s4.ch || []).join(' '));
    await p.evaluate(() => { try { setUiPref('beg1', null); } catch (e) {} });
    await p.close();
  }

  /* ---------- 10 Lauflichter aus: keine blinkende Vormerkung ---------- */
  {
    const p = await page(428, 926);
    const r = await run(p, async () => {
      const B = SYNQUENZER.beg1; B.open(); await wait(200); B.variant('I'); B.dirty = true; UI.pl1ll = true; beg1Paint(); await wait(50);
      const on = getComputedStyle(document.querySelector('#beg1Bar .b1-vI')).animationName;
      UI.pl1ll = false; BEG1.dirty = true; beg1Paint(); await wait(50);
      const off = getComputedStyle(document.querySelector('#beg1Bar .b1-vI')).animationName, pend = document.querySelector('#beg1Bar .b1-vI').classList.contains('pend');
      UI.pl1ll = null; B.close(); return {on, off, pend};
    });
    ok(r.on === 'b1bl' && r.off === 'none' && r.pend, 'Lauflichter: an = vorgemerkte Taste blinkt, aus = nur gestrichelt (ohne Bewegung)', r.on + ' / ' + r.off);
    /* ---------- 11 Guide und Menü ---------- */
    const g = await run(p, async () => {
      const e = ui1Entries().find(x => x.id === 'beg1'); let opened = false;
      if (e) { e.go(); await wait(300); opened = SYNQUENZER.beg1.isOpen(); SYNQUENZER.beg1.close(); }
      openMenu(); await wait(300); const row = document.querySelector('#menu .b1mr'); const txt = row ? row.textContent : ''; closeMenu();
      return {e: !!e, opened, row: !!row, txt, w: e ? e.w : ''};
    });
    ok(g.e && g.opened && g.row, 'Guide „Begleiter“ (Wo finde ich …?) öffnet die Leiste; ≡ › Bedienung hat Begleiter An │ Aus', g.w);
    /* ---------- 12 Taktart-Stil: 3/4-Projekt → Walzer ---------- */
    const t = await run(p, async () => {
      ensureAudio(); await wait(300); SYNQUENZER.setBpm(150); setSongTs('3/4', {quiet: true});
      const B = SYNQUENZER.beg1, sts = B.styles(); B.open(); await wait(200); const st = B.style();
      clearLog(); await chord([60, 64, 67]); await wait(200); await until(6.05);
      const L = noteLog(4096).filter(e => e.beat != null && e.beat < 6).map(slim), run_ = B.run(), tg = B.state().tg;
      SYNQUENZER.stop(); await wait(400); B.close(); undo();
      return {st, euroOk: sts.find(x => x.id === 'euro').ok, walzerOk: sts.find(x => x.id === 'walzer').ok, LB: run_ && run_.LB, bars: run_ && run_.bars.map(b => b.v).join(''),
        bass: L.filter(e => e.tr === tg.bs).map(e => e.b), drMax: Math.max(...L.filter(e => e.tr === tg.dr).map(e => e.b % 3)), ts: S.ts || '4/4'};
    });
    ok(t.st === 'walzer' && !t.euroOk && t.walzerOk && t.LB === 3 && t.bass.includes(0) && t.bass.includes(3) && t.drMax < 3, 'Taktart-Stil: im 3/4-Projekt gibt es den Walzer (4/4-Stile grau), Takte zu 3 Schlägen, Bass auf jeder Eins', 'Stil ' + t.st + ', Takt ' + t.LB + ' Schläge, Bass ' + t.bass.join(','));
    await p.close();
  }

  /* ---------- 14 Prüfung (BEG1-P): SCHLUSS mit anderen Spuren, Ziel-Spur im Lauf, ✕ = Szenen-Stand wie vorher, ↶ in der Leiste, kein Stil, ● AUTO ---------- */
  {
    const p = await page(428, 926);
    // P1: SCHLUSS, während übrige Spuren ihre Clips spielen (Szene läuft, Begleiter im Lauf geöffnet): hinter dem Schlusstakt kein Ton, Stopp am Taktstrich
    const p1 = [];
    for (const bpm of [120, 157]) {
      p1.push(await run(p, async bpm => {
        ensureAudio(); await wait(300); SYNQUENZER.setBpm(bpm);
        const Bg = SYNQUENZER.beg1; let sb = null; const st0 = window.stop; window.stop = function () { if (sb == null && R.playing && AU.ctx) sb = audBeat(); return st0.apply(this, arguments); };
        clearLog(); launchScene(0); await until(1.2); Bg.open(); await wait(200);
        await chord([60, 64, 67]); await wait(200); await until(9.3); Bg.variant('E');
        await stopWait(15000); await wait(400); window.stop = st0;
        const L = noteLog(4096).filter(e => e.beat != null), tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp];
        const r = {after: L.filter(e => e.beat >= 16 - 1e-3).map(e => e.track + ':' + e.src + '@' + e.beat.toFixed(2)), others: L.filter(e => !T.includes(e.track) && e.beat >= 12 && e.beat < 16).length, sb: sb == null ? null : +sb.toFixed(3), alive: VOICES.filter(v => !v.dead).length};
        Bg.close(); await wait(200); return r;
      }, bpm));
    }
    ok(p1.every(r => !r.after.length && r.others > 0 && r.sb != null && Math.abs(r.sb - 16) < .06 && r.alive === 0), 'Prüfung 1 – SCHLUSS bei laufenden übrigen Spuren: hinter dem Schlusstakt klingt keine Spur mehr an, der Stopp kommt am Taktstrich (120 und 157 BPM)',
      p1.map(r => 'Stopp bei Schlag ' + r.sb + ', danach ' + r.after.length + ' Töne (' + r.after.slice(0, 3).join(' ') + '), übrige Spuren im Schlusstakt ' + r.others).join(' · '));
    // P2: Ziel-Spur im Lauf ändern (Start „nur die Band“): die alte Ziel-Spur wird still – wie „aus“ vor dem Start
    const p2 = await run(p, async () => {
      ensureAudio(); SYNQUENZER.setBpm(150); const Bg = SYNQUENZER.beg1, out = {}; Bg.open(); await wait(200);
      for (const mode of ['drAus', 'bsAndere']) {
        Bg.targets({dr: null, bs: null, cp: null}); await wait(150);
        const tg0 = Bg.state().tg; clearLog();
        await chord(mode === 'drAus' ? [60, 64, 67] : [57, 60, 64]); await wait(200); await until(3.0);
        if (mode === 'drAus') Bg.targets({dr: -1}); else Bg.targets({bs: 3});
        await until(12.05);
        const L = noteLog(4096).filter(e => e.beat != null); SYNQUENZER.stop(); await wait(500);
        const old = mode === 'drAus' ? tg0.dr : tg0.bs;
        out[mode] = {old, tg1: Bg.state().tg, before: L.filter(e => e.track === old && e.beat < 3).length, after: L.filter(e => e.track === old && e.beat >= 4 && e.beat < 12).length,
          neu: mode === 'bsAndere' ? L.filter(e => e.track === 3 && e.beat >= 4 && e.beat < 12 && e.src === 'beg').length : null, slot: R.slot[old]};
      }
      Bg.targets({dr: null, bs: null, cp: null}); Bg.close(); await wait(200);
      return out;
    });
    ok(p2.drAus.before > 0 && p2.drAus.after === 0 && p2.drAus.tg1.dr == null, 'Prüfung 2 – „Drums: aus“ im Lauf (Start nur die Band): die Drum-Spur wird still, wie „aus“ vor dem Start (kein eigener Clip)', 'Spur ' + (p2.drAus.old + 1) + ': vorher ' + p2.drAus.before + ' Band-Schläge, danach ' + p2.drAus.after);
    ok(p2.bsAndere.before > 0 && p2.bsAndere.after === 0 && p2.bsAndere.neu > 8 && p2.bsAndere.tg1.bs === 3, 'Prüfung 2 – Bass im Lauf auf Spur 4: die alte Bass-Spur wird still, Spur 4 spielt den Band-Bass – eine Basslinie, nicht zwei', 'alte Spur ' + (p2.bsAndere.old + 1) + ' danach ' + p2.bsAndere.after + ' Töne, Spur 4 Band-Bass ' + p2.bsAndere.neu + ' Töne');
    // P3: ✕ stellt den Szenen-Stand wieder her (gestoppt sofort, im Lauf ab dem Taktstrich der Übergabe); selbst gestartete Szenen bleiben
    const p3 = await run(p, async () => {
      ensureAudio(); SYNQUENZER.setBpm(150); const Bg = SYNQUENZER.beg1;
      const playing = async () => { clearLog(); play(); await until(4.05); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 4); SYNQUENZER.stop(); await wait(400); return [...new Set(L.map(e => e.track))].sort().join(','); };
      launchScene(0); await until(1.0); SYNQUENZER.stop(); await wait(400);
      const slots0 = [...R.slot], vorher = await playing();
      Bg.open(); await wait(200); await chord([60, 64, 67]); await wait(200); await until(4.5); const mid = [...R.slot]; SYNQUENZER.stop(); await wait(400); Bg.close(); await wait(300);
      const slots1 = [...R.slot], nachher = await playing();
      // im Lauf: ✕ in Takt 2 → die still gestellten Spuren kommen am Taktstrich 8 zurück
      Bg.open(); await wait(200); clearLog(); await chord([57, 60, 64]); await wait(200); await until(5.4); Bg.close(); const tEnd = Bg.run() ? Bg.run().tEnd : null;
      await until(12.05); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 12); SYNQUENZER.stop(); await wait(400);
      const hushed = slots0.map((s, i) => (s >= 0 && mid[i] === -1 ? i : -1)).filter(i => i >= 0);
      const lauf = {tEnd, vor: L.filter(e => hushed.includes(e.track) && e.beat < tEnd - 1e-6).length, ab: L.filter(e => hushed.includes(e.track) && e.beat >= tEnd - 1e-6).length, slots: [...R.slot]};
      // selbst übernommen: nach dem Start Szene 2 angetippt → ✕ lässt Szene 2 stehen
      Bg.open(); await wait(200); await chord([53, 57, 60]); await wait(200); await until(1.5); launchScene(1); await until(6.0); SYNQUENZER.stop(); await wait(400);
      const own0 = [...R.slot]; Bg.close(); await wait(200); const own1 = [...R.slot];
      return {slots0, vorher, mid, slots1, nachher, hushed, lauf, own0, own1};
    });
    ok(p3.hushed.length > 0 && p3.slots1.join() === p3.slots0.join() && p3.nachher === p3.vorher, 'Prüfung 3 – ✕ nach ■: der Szenen-Stand von vorher ist zurück (R.slot gleich), ▶ spielt wieder dieselben Spuren', 'vorher ' + p3.slots0.join(',') + ' (▶: ' + p3.vorher + ') · im Lauf ' + p3.mid.join(',') + ' · nach ✕ ' + p3.slots1.join(',') + ' (▶: ' + p3.nachher + ')');
    ok(p3.lauf.tEnd === 8 && p3.lauf.vor === 0 && p3.lauf.ab > 0 && p3.lauf.slots.join() === p3.slots0.join(), 'Prüfung 3 – ✕ im Lauf: die still gestellten Spuren setzen am Taktstrich wieder ein, an dem die Band aufhört (Schlag ' + p3.lauf.tEnd + ')', 'Spuren ' + p3.hushed.map(i => i + 1).join(',') + ': vorher ' + p3.lauf.vor + ', ab dem Taktstrich ' + p3.lauf.ab + ' Töne');
    ok(p3.own1.join() === p3.own0.join(), 'Prüfung 3 – Szene selbst angetippt, dann ✕: dein Stand bleibt (nichts wird überschrieben)', p3.own1.join(','));
    await p.close();
  }
  {
    // P4: ↶ in der Leiste (die Leiste liegt über dem ↶ der Spur-Leiste): Tipp = Rückgängig der Aufnahme, Halten = Verlauf – per Touch
    const p = await page(428, 926);
    const pre = await run(p, async () => {
      ensureAudio(); await wait(300); SYNQUENZER.setBpm(150); const Bg = SYNQUENZER.beg1; Bg.open(); await wait(200);
      const dis0 = document.querySelector('#beg1Bar .b1-un').disabled;
      Bg.rec(); await chord([60, 64, 67]); await wait(200); await until(5.0); Bg.rec(); await until(8.4); SYNQUENZER.stop(); await wait(500);
      const sc = Bg.state().last ? Bg.state().last.scene : -1, tg = Bg.state().tg; BEG1.dirty = true; beg1Paint();
      return {sc, tg, dis0, dis1: document.querySelector('#beg1Bar .b1-un').disabled, has: [tg.dr, tg.bs, tg.cp].map(t => !!S.tracks[t].clips[sc])};
    });
    const un = await ctr(p, '#beg1Bar .b1-un');
    await tap(p, un.x, un.y);
    const mid = await p.evaluate(a => ({has: [a.tg.dr, a.tg.bs, a.tg.cp].map(t => !!S.tracks[t].clips[a.sc]), open: SYNQUENZER.beg1.isOpen()}), pre);
    await tDown(p, un.x, un.y); await p.waitForTimeout(900); await tUp(p); await p.waitForTimeout(400);
    const hold = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null}));
    await p.screenshot({path: path.join(fotos, 'beg1-pruef-undo-verlauf-hochkant.png')});
    await p.evaluate(() => { try { closePop(); } catch (e) {} SYNQUENZER.beg1.close(); });
    ok(pre.sc >= 0 && pre.has.every(Boolean) && pre.dis0 && !pre.dis1 && un.w >= 44 && un.h >= 44 && mid.has.every(x => !x) && mid.open && hold.pop === 'sx14',
      'Prüfung 4 – ↶ in der Leiste (≥ 44 px): ein Tipp nimmt die Begleiter-Aufnahme zurück, Halten öffnet den Verlauf – die Leiste bleibt offen', Math.round(un.w) + '×' + Math.round(un.h) + ' px · Szene ' + (pre.sc + 1) + ' danach ' + JSON.stringify(mid.has) + ' · Halten: ' + hold.pop);
    // P5: Projekt in 5/4 (kein passender Stil): der erste Akkord startet nichts und sagt warum; ▶ der Leiste auch nicht
    const p5 = await run(p, async () => {
      setSongTs('5/4', {quiet: true}); await wait(100); ensureAudio(); SYNQUENZER.setBpm(150);
      const s0 = [...R.slot], Bg = SYNQUENZER.beg1; Bg.open(); await wait(300);
      const t1 = EL.toast.textContent; clearLog(); await chord([60, 64, 67]); await wait(1200);
      const r = {stil: document.querySelector('#beg1Bar .b1-st b').textContent, open: t1, playing: R.playing, run: Bg.run(), slots: R.slot.join() === s0.join(), notes: noteLog(4096).filter(e => e.beat != null).length};
      Bg.act('go'); await wait(600); r.go = R.playing; r.toast = EL.toast.textContent;
      return r;
    });
    await p.screenshot({path: path.join(fotos, 'beg1-pruef-ohne-stil-5-4-hochkant.png')});
    await run(p, async () => { SYNQUENZER.stop(); SYNQUENZER.beg1.close(); setSongTs('4/4', {quiet: true}); });
    ok(p5.stil === 'kein Stil' && !p5.playing && !p5.go && !p5.run && p5.slots && p5.notes === 0 && /kein Stil/.test(p5.open) && /kein Stil/.test(p5.toast), 'Prüfung 5 – 5/4 ohne passenden Stil: Akkord und ▶ der Leiste starten nichts, keine Spur wird still gestellt, ein Hinweis sagt warum', p5.toast.slice(0, 90));
    await p.close();
  }
  {
    // P6: ● AUTO (Song-Aufnahme) mit dem Begleiter: der Song spielt hinterher die Band Ton für Ton; ein ↶ für Song + Szene; ↷; Speichern/Laden
    const p = await page(428, 926);
    const r = await run(p, async () => {
      ensureAudio(); await wait(300); SYNQUENZER.setBpm(150);
      const Bg = SYNQUENZER.beg1; Bg.open(); await wait(200); const tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp], u0 = UNDO.length;
      clearLog(); launchScene(0); await until(0.5); songRecToggle(); await wait(100);
      await until(3.62); await chord([60, 64, 67]); await until(7.62); await chord([57, 60, 64]); await until(9.0); Bg.variant('B'); await until(11.62); await chord([53, 57, 60]); await until(16.05);
      const live = noteLog(4096).filter(e => e.beat != null && e.beat >= 4 && e.beat < 16 && e.src !== 'retune' && T.includes(e.track)).map(e => e.track + ':' + e.out + '@' + (e.beat - 4).toFixed(2)).sort();
      SYNQUENZER.stop(); await wait(800); Bg.close(); await wait(300);
      const res = Bg.state().last, du = UNDO.length - u0, lab = UNDO.length ? UNDO[UNDO.length - 1].label : '';
      const playSong = async () => { clearLog(); songPlayStart(0); await until(12.05); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 12 && e.src !== 'retune' && T.includes(e.track)).map(e => e.track + ':' + e.out + '@' + e.beat.toFixed(2)).sort(); SYNQUENZER.stop(); await wait(400); return L; };
      const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
      const back = await playSong(), sc = res && res.scenes ? res.scenes[0] : -1;
      undo(); const und = {song: !!(S.song && S.song.bars), clips: T.map(t => !!S.tracks[t].clips[sc])};
      redo(); const red = {song: S.song ? S.song.bars : 0, clips: T.map(t => !!S.tracks[t].clips[sc])};
      const back2 = await playSong();
      const json = serialize(); importJSON(json); await wait(600);
      const back3 = await playSong();
      let diff = []; if (!same(live, back)) { const sa = new Set(live), sb = new Set(back); diff = live.filter(x => !sb.has(x)).slice(0, 4).concat(['|'], back.filter(x => !sa.has(x)).slice(0, 4)); }
      return {res, du, lab, live: live.length, back: back.length, same1: same(live, back), und, red, same2: same(live, back2), same3: same(live, back3), diff, bars: S.song ? S.song.bars : 0};
    });
    ok(r.res && r.res.song && r.res.scenes.length === 1 && r.live > 60 && r.same1, 'Prüfung 6 – ● AUTO mit dem Begleiter: der Song spielt hinterher die Band Ton für Ton wie live (Ziel-Spuren, mit A→B und 3 Akkorden)', r.live + ' Töne live, ' + r.back + ' aus dem Song · Szene ' + (r.res && r.res.scenes ? r.res.scenes.map(x => x + 1).join(',') : '–') + ' · Song ' + r.bars + ' Takte' + (r.diff.length ? ' · ' + r.diff.join(' ') : ''));
    ok(r.du === 1 && !r.und.song && r.und.clips.every(x => !x) && r.red.song > 0 && r.red.clips.every(Boolean) && r.same2, 'Prüfung 6 – ein ↶ nimmt Song und Band-Szene zusammen zurück, ↷ bringt beides wieder (klingt gleich)', r.lab + ' · ↶: Song ' + r.und.song + ', Clips ' + JSON.stringify(r.und.clips));
    ok(r.same3, 'Prüfung 6 – Speichern/Laden: der Song mit der Band klingt nach dem Laden gleich');
    await p.close();
    // P6b: der Begleiter spielt nur eine Weile im Song (im Lauf geöffnet, ✕ vor dem Song-Ende): davor/danach die Clips in ihrer Phase, dazwischen die Band
    const p2 = await page(428, 926);
    const r2 = await run(p2, async () => {
      ensureAudio(); await wait(300); SYNQUENZER.setBpm(150); const Bg = SYNQUENZER.beg1;
      launchScene(0); await until(0.5); SYNQUENZER.stop(); await wait(400);
      clearLog(); songRecToggle(); await until(2.0); Bg.open(); await wait(150);
      await until(5.62); await chord([57, 60, 64]); await until(9.0); Bg.close();
      await until(19.9); songRecToggle(); await until(20.3);
      const key = e => e.track + ':' + e.out + '@' + e.beat.toFixed(2);
      const live = noteLog(4096).filter(e => e.beat != null && e.beat < 20 && e.src !== 'retune'), lk = live.map(key).sort();
      SYNQUENZER.stop(); await wait(800);
      const res = Bg.state().last;
      clearLog(); songPlayStart(0); await until(20.05);
      const back = noteLog(4096).filter(e => e.beat != null && e.beat < 20 && e.src !== 'retune').map(key).sort(); SYNQUENZER.stop(); await wait(300);
      const sa = new Set(lk), sb = new Set(back);
      return {res, bars: S.song.bars, live: lk.length, beg: live.filter(e => e.src === 'beg').length, back: back.length, onlyLive: lk.filter(x => !sb.has(x)).slice(0, 4), onlyBack: back.filter(x => !sa.has(x)).slice(0, 4)};
    });
    ok(r2.res && r2.res.song && r2.res.bars === 2 && r2.beg > 30 && r2.live === r2.back && !r2.onlyLive.length && !r2.onlyBack.length, 'Prüfung 6 – Begleiter nur eine Weile im Song (im Lauf geöffnet, ✕ vor dem Ende): der Song spielt alle Spuren Ton für Ton wie live – davor/danach die Clips in ihrer Phase, dazwischen die Band',
      r2.live + ' Töne live (' + r2.beg + ' Band), ' + r2.back + ' aus dem Song · Band ' + (r2.res ? r2.res.bars : 0) + ' von ' + r2.bars + ' Takten' + (r2.onlyLive.length || r2.onlyBack.length ? ' · ' + r2.onlyLive.join(' ') + ' | ' + r2.onlyBack.join(' ') : ''));
    await p2.close();
  }

  /* ---------- 13 Pflichtwörter, alte Projekte ---------- */
  {
    const A = fs.readFileSync(basis, 'utf8'), Bf = fs.readFileSync(file, 'utf8');
    const words = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Clavia', 'Elektron', 'Octatrack', 'KARMA', 'Yamaha', 'Genos'];
    const more = words.filter(w => Bf.split(w).length > A.split(w).length);
    ok(!more.length && Bf.split('MS 2000').length - 1 === 1 && Bf.split('  live: true,').length - 1 === 1, 'Pflichtwörter: keines neu (Zählung gegen basis.html), „MS 2000“ 1×, „  live: true,“ 1×', more.join(','));
    const blk = Bf.slice(Bf.indexOf('/* ===== BEG1-BEGIN'), Bf.indexOf('/* BEG1-END */'));
    const al = new Set(A.split('\n')), outside = (Bf.slice(0, Bf.indexOf('/* ===== BEG1-BEGIN')) + Bf.slice(Bf.indexOf('/* BEG1-END */'))).split('\n').filter(l => !al.has(l));
    ok(blk.length > 1000 && outside.every(l => /BEG1/.test(l)), 'Eigener Block BEG1-BEGIN … BEG1-END; jede neue/geänderte Zeile außerhalb trägt „BEG1“', outside.length + ' Einhänge-Zeilen');
    const p1 = await page(428, 926, basis), p2 = await page(428, 926);
    // dieselbe Seite: vor dem Öffnen und nach ✕ Byte für Byte gleich; gegen die Basis: gleich bis auf die je Seitenaufruf zufälligen Kennungen (Projekt-id, Szenen-uid)
    const noId = s => s.replace(/"id":"p-[^"]*"/, '"id":"–"').replace(/"uid":"[^"]*"/g, '"uid":"–"');
    const s1 = await p1.evaluate(() => serializeProject()), s2 = await p2.evaluate(async () => { const a = serializeProject(); SYNQUENZER.beg1.open(); await new Promise(r => setTimeout(r, 200)); SYNQUENZER.beg1.close(); return {a, b: serializeProject()}; });
    ok(s2.a === s2.b && noId(s1) === noId(s2.b), 'Alte Projekte / Datei: das Projekt bleibt Byte für Byte gleich (keine neuen Felder; vor dem Öffnen = nach ✕; gegen die Basis bis auf die zufälligen Kennungen)', s1.length + ' / ' + s2.b.length + ' Zeichen');
    // ein altes Projekt (Datei der Basis) lädt in der neuen Fassung und klingt gleich
    const old = await p1.evaluate(() => serialize());
    const lk = async (pg) => pg.evaluate(async j => { importJSON(j); await new Promise(r => setTimeout(r, 500)); ensureAudio(); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.setBpm(150); clearLog(); launchScene(1);
      const t0 = performance.now(); while (performance.now() - t0 < 20000 && !(R.playing && audBeat() >= 8.05)) await new Promise(r => setTimeout(r, 10));
      const L = noteLog(4096).filter(e => e.beat != null && e.beat < 8).map(e => e.track + ':' + e.out + '@' + e.beat.toFixed(2)).sort(); SYNQUENZER.stop(); return L.join(','); }, old);
    const la = await lk(p1), lb = await lk(p2);
    ok(la.length > 100 && la === lb, 'Altes Projekt (aus der Basis gespeichert) lädt und klingt in der neuen Fassung gleich (Szene 2, noteLog)', la.split(',').length + ' Noten');
    await p1.close(); await p2.close();
  }
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
const realErrs = errs.filter(e => !/favicon|ERR_FILE_NOT_FOUND|net::/.test(e));
ok(!realErrs.length, 'Keine Fehler in der Konsole', realErrs.slice(0, 3).join(' | '));
await b.close();
console.log((bad ? 'FEHLER' : 'OK') + ' BEG1: ' + (all - bad) + '/' + all + ' bestanden');
process.exit(bad ? 1 : 0);
