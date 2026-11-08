// INT54-Test: Zusammenspiel der 4.54-Pakete mit dem 4.53-Kandidaten (Stellen mit Kommentar „INT54“) + Querprüfungen ohne Eingriff.
// A  BEG1 × GEN4: der Begleiter nimmt nur Stile SEINER Taktart (GEN4 bringt 3/4, 6/8, 12/8, 5/4, 7/8, 2/4) – in jeder Taktart startet er,
//    Takt = tsBeats, Stil-Taktart = Projekt-Taktart; 6/8 ≠ 3/4 (gleich viele Schläge). Gegenlauf (Stand vor INT54): 6/8-Stile im 3/4-Projekt.
// B  CHQ × JAM3: mit Perform-Spur (Zeile PERFORM) bleiben die Chor-Zeilen im Song ≥ 22 px (Fenster rechnet ohne die PERFORM-Höhe),
//    eine und zwei Bahnen, 926×370 / 926×428 / 428×926; ohne Perform-Spur alles wie vorher (gleiche Zahlen wie der Stand vor INT54).
// C  Menü: Begleiter steht in „Bedienung“ VOR „Mehr ▾“ (beg1MenuRow vor oriMenuHook), sichtbar, ≥ 44 px; Guide-Kennungen eindeutig.
// D  Kopf-Farbe (ORI) am Klang-Editor mit Oszilloskop (KF2): Farbkante an der Oberkante, Oszilloskop darunter, ✕ sichtbar.
// E  SND1-Stil-Klang × KF12 (PVA/PV_LAYOUT, Saite, VOKAL, KF1-Werte): Profile ändern nur ihre Schlüssel, VOKAL-Cutoff bleibt.
// Aufruf: node int54-test.mjs <index.html> <ausgabe-ordner> [vergleich.html = Stand vor INT54]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
import { readPng } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4530/m3/pruef-ori/png.mjs';
const [file, out, cmpArg] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node int54-test.mjs <index.html> <ausgabe-ordner> [vergleich.html]'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const ONLY = process.env.ONLY || '';
const cmp = cmpArg || null, B53 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rel-4540/k/basis53.html';
const res = []; const ok = (pass, name, info) => { res.push({name, pass: !!pass}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 700) : '')); };
const GL1T = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4492/gl1/gl1-test.mjs';
const CHQT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4530/chq/chq-test.mjs';
const gsrc = fs.readFileSync(GL1T, 'utf8');
const grab = n => { const m = new RegExp('const ' + n + ' = (".*?");\\n').exec(gsrc); if (!m) throw new Error('GL1-Hilfe fehlt: ' + n); return JSON.parse(m[1]); };
const HELP_SETUP = grab('HELP_SETUP'), HELP_SCAN = grab('HELP_SCAN');
const csrc = fs.readFileSync(CHQT, 'utf8'), HELP_LANES = /const HELP_LANES = `([\s\S]*?)`;\n/.exec(csrc)[1];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function open(f, w, h, helpers) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const tag = path.basename(path.dirname(f)) + '/' + path.basename(f);
  p.on('pageerror', e => errs.push(tag + ': ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ': ' + m.text()); });
  await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1500);
  if (helpers) for (const c of [HELP_SETUP, HELP_SCAN, HELP_LANES]) await p.addScriptTag({content: c});
  p._ctx = ctx; return p;
}
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const until = async (b, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 40000)) { if (R.playing && AU.ctx && audBeat() >= b) return true; await wait(8); } return false; };
  const chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await wait(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');

try {
  /* ---------- A  BEG1 × GEN4: Taktart des Stils = Taktart des Projekts ---------- */
  if (!ONLY || ONLY.includes('A')) {
    const begA = async f => {
      const p = await open(f, 428, 926);
      const r = await run(p, async () => {
        ensureAudio(); await wait(300); SYNQUENZER.setBpm(150);
        const out = {};
        for (const ts of tsList()) {
          setSongTs(ts, {quiet: true}); await wait(80);
          const B = SYNQUENZER.beg1, sts = B.styles(), okIds = sts.filter(x => x.ok).map(x => x.id);
          const wrong = sts.filter(x => x.ok && (x.ts || '4/4') !== ts).map(x => x.id + ':' + (x.ts || '4/4'));
          const want = sts.filter(x => (x.ts || '4/4') === ts).map(x => x.id);
          B.open(); await wait(250); const st = B.style();
          clearLog(); await chord([60, 64, 67]); await wait(150);
          const LBw = tsBeats(ts === '4/4' ? null : ts), go = await until(2 * LBw + .05, 20000);
          const run_ = B.run(), tg = B.state().tg, L = noteLog(4096).filter(e => e.beat != null && e.beat < 2 * LBw);
          const dr = L.filter(e => e.track === tg.dr).length, bs = L.filter(e => e.track === tg.bs), bsOn1 = bs.some(e => Math.abs(e.beat - LBw) < .02) && bs.some(e => Math.abs(e.beat) < .02);
          SYNQUENZER.stop(); await wait(350); B.close(); await wait(100);
          out[ts] = {n: sts.length, ok: okIds.length, want: want.length, wrong, st, stTs: (sts.find(x => x.id === st) || {}).ts || '4/4', go, LB: run_ && run_.LB, LBw, dr, bs: bs.length, bsOn1};
        }
        setSongTs('4/4', {quiet: true});
        return out;
      });
      await p.screenshot({path: path.join(out, 'int54-a-hochkant.png')}); await p._ctx.close();
      return r;
    };
    const A = await begA(file);
    for (const [ts, x] of Object.entries(A)) {
      ok(!x.wrong.length && x.ok === x.want && x.ok > 0 && x.stTs === ts && x.go && x.LB === x.LBw && x.dr > 0 && x.bs > 0 && x.bsOn1,
        'A BEG1×GEN4 ' + ts + ': nur Stile dieser Taktart wählbar (' + x.ok + ' von ' + x.n + '), Stil „' + x.st + '“ startet, Takt ' + x.LB + ' Schläge, Drums ' + x.dr + ', Bass auf beiden Einsen', x);
    }
    if (cmp) {
      const G = await begA(cmp), w34 = G['3/4'].wrong, w68 = G['6/8'].wrong;
      ok(w34.length > 0 && w68.length > 0, 'A Gegenlauf (Stand vor INT54): im 3/4-Projekt waren 6/8-Stile wählbar und im 6/8-Projekt 3/4-Stile (gleich viele Schläge)', {in34: w34, in68: w68, st68: G['6/8'].st + ':' + G['6/8'].stTs});
    }
  }

  /* ---------- B  CHQ × JAM3: Chor-Zeilen ≥ 22 px auch mit Zeile PERFORM ---------- */
  if (!ONLY || ONLY.includes('B')) {
    const geo = async (f, w, h) => {
      const p = await open(f, w, h, true);
      await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8)); await p.evaluate(() => __chqSv()); await p.waitForTimeout(500);
      const m = () => p.evaluate(() => { svLayout(); svDraw(true); const q = SYNQUENZER.chqInfo().sv, s = __gl1Scan('#app'); return {rowH: +SV.rowH.toFixed(2), pfH: SV.pfH || 0, pfN: SV.pfN || 0, w: q.w, n: q.n, rows: SV.rows.length, bad: __chqBad(s), ex: __chqEx(s).map(x => JSON.stringify(x).slice(0, 80))}; });
      const r0 = await m();
      await p.evaluate(() => { SYNQUENZER.jam3.put({k: 'm', b: 0, d: 16, g: 'dr', lv: 'stumm'}); }); await p.waitForTimeout(300); const r1 = await m();
      await p.screenshot({path: path.join(out, 'int54-b-eine-bahn-' + w + 'x' + h + '-' + path.basename(path.dirname(f)) + '.png')});
      await p.evaluate(() => { SYNQUENZER.jam3.put({k: 'st', b: 4, d: 2, u: .25, g: 'all', s: 4}); }); await p.waitForTimeout(300); const r2 = await m();
      await p.screenshot({path: path.join(out, 'int54-b-zwei-bahnen-' + w + 'x' + h + '-' + path.basename(path.dirname(f)) + '.png')});
      await p._ctx.close();
      return {r0, r1, r2};
    };
    for (const [w, h] of [[926, 370], [926, 428], [428, 926]]) {
      const N = await geo(file, w, h), C = cmp ? await geo(cmp, w, h) : null;
      const roll = x => x.w != null, nw = x => (x.w == null ? x.n : x.w);
      const okRow = x => !roll(x) || x.rowH >= 22 - .01, keep = x => nw(x) >= nw(N.r0) || x.rowH >= 22 - .01;   // 22 px erreicht – oder das Fenster bleibt so groß wie ohne Perform-Spur
      const reach = x => okRow(x) || (nw(x) === nw(N.r0) && x.rowH >= 17 - .01);   // nicht erreichbar (andere Seiten bestimmen die Zeilenzahl): wie JAM3 allein ≥ 17 px, keine Spur weniger
      ok(reach(N.r1) && reach(N.r2) && keep(N.r1) && keep(N.r2) && N.r1.pfH > 0 && N.r2.pfH > 0 && !N.r1.bad && !N.r2.bad,
        'B CHQ×JAM3 ' + w + '×' + h + ': mit Perform-Spur Chor-Zeilen ≥ 22 px, wo erreichbar (eine Bahn ' + N.r1.rowH + ' px, PERFORM ' + N.r1.pfH + ' px, Fenster ' + nw(N.r1) + '/' + N.r1.n + ' · zwei Bahnen ' + N.r2.rowH + ' px, PERFORM ' + N.r2.pfH + ' px, Fenster ' + nw(N.r2) + '); sonst keine Spur weniger; GL1-Scanner 0',
        {neu: N, vor: C ? {r1: C.r1.rowH + '/' + C.r1.w, r2: C.r2.rowH + '/' + C.r2.w} : null});
      if (C) ok(JSON.stringify(N.r0) === JSON.stringify(C.r0), 'B ' + w + '×' + h + ' ohne Perform-Spur: Zeilen, Fenster, Scanner genau wie vor INT54', {neu: N.r0, vor: C.r0});
      if (C) console.log('INFO B ' + w + '×' + h + ' vor INT54: eine Bahn ' + C.r1.rowH + ' px (Fenster ' + C.r1.w + '), zwei Bahnen ' + C.r2.rowH + ' px (Fenster ' + C.r2.w + ')');
      if (C && w === 926 && h === 428) ok(C.r1.rowH < 22 || C.r2.rowH < 22, 'B Gegenlauf 926×428 (Stand vor INT54): mit Perform-Spur fielen die Chor-Zeilen unter 22 px, obwohl ein kleineres Fenster 22 px hätte', {eine: C.r1, zwei: C.r2});
    }
  }

  /* ---------- C  Menü: Begleiter vor „Mehr ▾“; Guide-Kennungen eindeutig ---------- */
  if (!ONLY || ONLY.includes('C')) {
    for (const [w, h] of [[428, 926], [926, 428]]) {
      const p = await open(file, w, h);
      const r = await p.evaluate(async () => {
        openMenu(); await new Promise(r => setTimeout(r, 400));
        const secs = [...EL.menu.querySelectorAll('.msec')], sec = secs.find(s => (s.querySelector(':scope > h3') || {}).textContent === 'Bedienung');
        const ch = sec ? [...sec.children] : [], iB = ch.findIndex(x => x.classList && x.classList.contains('b1mr')), iM = ch.findIndex(x => x.classList && x.classList.contains('orimbr'));
        const row = sec && sec.querySelector('.b1mr'), rr = row ? row.getBoundingClientRect() : null, bsz = r => (r ? [...r.querySelectorAll('button')].map(x => x.getBoundingClientRect()).map(q => [Math.round(q.width), Math.round(q.height)]) : []), bt = bsz(row);
        const peer = [...sec.querySelectorAll(':scope > .mrow')].find(r => r !== row && /Perform-Leiste/.test(r.textContent)), pt = bsz(peer), rowH = rr ? Math.round(rr.height) : 0, peerH = peer ? Math.round(peer.getBoundingClientRect().height) : 0;
        const inMore = !!(row && row.closest('.orimore'));
        if (row) row.scrollIntoView({block: 'center'}); await new Promise(r => setTimeout(r, 200));
        const ids = ui1Entries().map(e => e.id), dup = ids.filter((x, k) => ids.indexOf(x) !== k);
        closeMenu();
        return {iB, iM, inMore, vis: !!(rr && rr.height > 0), bt, pt, rowH, peerH, dup, n: ids.length, beg: ids.filter(x => /^beg1/.test(x)), kf: ids.filter(x => /^kf[12]/.test(x)).length, j3: ids.filter(x => /^jam3/.test(x))};
      });
      ok(r.iB >= 0 && r.iM > r.iB && !r.inMore && r.vis && r.bt.length && r.rowH === r.peerH && JSON.stringify(r.bt.map(x => x[1])) === JSON.stringify(r.pt.map(x => x[1])), 'C ' + w + '×' + h + ': ≡ › Bedienung › „Begleiter An │ Aus“ steht vor „Mehr ▾“ (nicht eingeklappt), Zeile ' + r.rowH + ' px / Tasten ' + r.bt.map(x => x.join('×')).join(' ') + ' – genau wie „Perform-Leiste An │ Aus“ (' + r.peerH + ' px; Menü-Maß der App, nicht neu)', r);
      if (w === 428) ok(!r.dup.length && r.beg.length && r.kf >= 9 && r.j3.length, 'C Guide: ' + r.n + ' Einträge, keine Kennung doppelt (BEG1, JAM3, KF1/KF2 dabei)', {dup: r.dup, beg: r.beg, kf: r.kf, j3: r.j3});
      await p._ctx.close();
    }
  }

  /* ---------- D  ORI-Kopf-Farbe am Klang-Editor mit Oszilloskop (KF2) ---------- */
  if (!ONLY || ONLY.includes('D')) {
    const dMeas = async (f, w, h, tag) => {
      const p = await open(f, w, h);
      const r = await p.evaluate(async () => {
        ensureAudio(); R.selT = synthTracks()[0]; openEditor(); await new Promise(r => setTimeout(r, 900));
        const sh = EL.synthSheet, hd = sh.querySelector('.sh-head'), sc = sh.querySelector('.kf2sc');
        const xs = [...sh.querySelectorAll('button')].filter(x => /✕/.test(x.textContent) || /schließen/i.test(x.getAttribute('aria-label') || '')).map(x => x.getBoundingClientRect()).filter(q => q.width > 0);
        const hr = hd.getBoundingClientRect(), srr = sc && !sc.hidden && sc.offsetParent ? sc.getBoundingClientRect() : null;
        const btn = [...hd.querySelectorAll('button')].map(x => x.getBoundingClientRect()).map(q => [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]).join(';');
        return {oria: sh.dataset.oria || null, hx: hr.left, hy: hr.top, hw: hr.width, hh: hr.height, btn, scopeTop: srr ? +(srr.top - hr.top).toFixed(1) : null, scopeOn: !!srr, x: xs.length ? [Math.round(xs[0].width), Math.round(xs[0].height), xs[0].top >= 0 && xs[0].bottom <= innerHeight] : null};
      });
      const fp = path.join(out, 'int54-d-klang-' + tag + '-' + w + 'x' + h + '.png'); await p.screenshot({path: fp});
      const im = readPng(fp), sx = 2; let hit = 0, n = 0;   // Anteil der Kopf-Oberkante (2 px unter dem Rand, ganze Breite) in der Klang-Farbe #8b93ff
      for (let X = Math.ceil(r.hx * sx) + 2; X < Math.floor((r.hx + r.hw) * sx) - 2; X += 2) { const q = im.get(X, Math.round(r.hy * sx) + 2); n++; if (Math.abs(q[0] - 139) + Math.abs(q[1] - 147) + Math.abs(q[2] - 255) < 70) hit++; }
      r.anteil = +(hit / Math.max(1, n)).toFixed(2); await p._ctx.close(); return r;
    };
    for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
      const r = await dMeas(file, w, h, 'neu'), q = await dMeas(B53, w, h, '453');
      ok(r.oria === 'klang' && (!r.scopeOn || r.scopeTop >= r.hh - 1) && r.anteil >= q.anteil - .02 && r.btn === q.btn && r.x && r.x[2], 'D ' + w + '×' + h + ': Klang-Editor mit Oszilloskop (KF2) – Kopf-Farbe „klang“ an der Oberkante wie im 4.53-Kandidaten (Anteil ' + r.anteil + ' / ' + q.anteil + '), Kopf-Tasten an derselben Stelle, Oszilloskop ' + (r.scopeOn ? r.scopeTop + ' px unter der Kopf-Oberkante (unter dem Kopf)' : 'in dieser Lage aus') + ', ✕ sichtbar', {neu: r, v453: q});
    }
  }

  /* ---------- E  SND1 (Stil-Klang) × KF12: Profile auf KF-Klänge – nur bekannte Schlüssel, Vokal-Filter bleibt, KF1-Werte unberührt ---------- */
  if (!ONLY || ONLY.includes('E')) {
    const p = await open(file, 428, 926);
    const r = await p.evaluate(() => {
      const ids = KF2_SND.ids(), out = [];
      for (const id of ids) for (const ft of [6, 0]) for (const st of ['ebm', 'house', 'walzer', 'ballade68', 'afro68']) {
        const s = SQStore.normalizeSound(factorySound(id)); s.p.ftype = ft; s.p.kfRm = .6; s.p.kfNc = 2;
        const a = JSON.parse(JSON.stringify(s)), F = snd1Prof(st); if (!F) { out.push({id, st, err: 'kein Profil'}); continue; }
        snd1Syn(s, F, 'bass');
        const ch = Object.keys(s.p).filter(k => JSON.stringify(s.p[k]) !== JSON.stringify(a.p[k])), add = Object.keys(s.p).filter(k => !(k in a.p));
        const bad = ch.filter(k => !(k in SND1_AK) && k !== 'cutoff'), nan = Object.entries(s.p).filter(([k, v]) => typeof v === 'number' && !isFinite(v)).map(([k]) => k);
        out.push({id, ft, st, cut: s.p.cutoff !== a.p.cutoff, ch: ch.length, bad, add, nan, kf: s.p.kfRm === .6 && s.p.kfNc === 2 && s.p.strDmp === a.p.strDmp, o1w: s.p.o1w === a.p.o1w});
      }
      return {n: ids.length, out, pvl: PV_LAYOUT && PV_LAYOUT.A ? PV_LAYOUT.A.length : null};
    });
    const vok = r.out.filter(x => x.ft === 6), lp = r.out.filter(x => x.ft === 0);
    ok(r.n === 3 && r.out.every(x => !x.err && !x.bad.length && !x.add.length && !x.nan.length && x.kf && x.o1w) && vok.every(x => !x.cut) && lp.some(x => x.cut),
      'E SND1-Profile (EBM, House, GEN4-Walzer/6/8) auf die 3 Saiten-Klänge (KF2) mit VOKAL bzw. LP24, Ring 60 % + Rauschfarbe (KF1): nur SND1-Schlüssel ändern sich, keine neuen, kein NaN; VOKAL-Cutoff bleibt (SND1 nur beim Tiefpass), KF1/KF2-Werte und Welle Saite unberührt; PV_LAYOUT ' + r.pvl + ' Plätze',
      {n: r.out.length, vokCut: vok.filter(x => x.cut).length, lpCut: lp.filter(x => x.cut).length, bad: r.out.filter(x => x.err || x.bad.length || x.add.length || x.nan.length).slice(0, 3)});
    await p._ctx.close();
  }
  ok(!errs.length, 'keine Seitenfehler', errs.slice(0, 4).join(' | '));
} catch (e) { res.push({pass: false}); console.log('FEHLER Abbruch – ' + (e && e.stack || e)); }
await b.close();
const bad = res.filter(x => !x.pass).length;
console.log((bad ? 'FEHLER' : 'OK') + ' INT54: ' + (res.length - bad) + '/' + res.length + ' bestanden');
process.exit(bad ? 1 : 0);
