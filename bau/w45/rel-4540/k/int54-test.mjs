// INT54-Test: Zusammenspiel der 4.54-Pakete mit dem 4.53-Kandidaten (Stellen mit Kommentar „INT54“) + Querprüfungen ohne Eingriff.
// A  BEG1 × GEN4: der Begleiter nimmt nur Stile SEINER Taktart (GEN4 bringt 3/4, 6/8, 12/8, 5/4, 7/8, 2/4) – in jeder Taktart startet er,
//    Takt = tsBeats, Stil-Taktart = Projekt-Taktart; 6/8 ≠ 3/4 (gleich viele Schläge). Gegenlauf (Stand vor INT54): 6/8-Stile im 3/4-Projekt.
// B  CHQ × JAM3: mit Perform-Spur (Zeile PERFORM) bleiben die Chor-Zeilen im Song ≥ 22 px (Fenster rechnet ohne die PERFORM-Höhe),
//    eine und zwei Bahnen, 926×370 / 926×428 / 428×926; ohne Perform-Spur alles wie vorher (gleiche Zahlen wie der Stand vor INT54).
// C  Menü: Begleiter steht in „Bedienung“ VOR „Mehr ▾“ (beg1MenuRow vor oriMenuHook), sichtbar, ≥ 44 px; Guide-Kennungen eindeutig.
// D  Kopf-Farbe (ORI) am Klang-Editor mit Oszilloskop (KF2): Farbkante an der Oberkante, Oszilloskop darunter, ✕ sichtbar.
// E  SND1-Stil-Klang × KF12 (PVA/PV_LAYOUT, Saite, VOKAL, KF1-Werte): Profile ändern nur ihre Schlüssel, VOKAL-Cutoff bleibt.
// P1–P8 (INT54-P, Prüfer-Befunde): KF1 S&H × Rückung · Begleiter-Aufnahme außerhalb 4/4 · CHQ mit Video-Regie/Schnitt · VD4 auf der STIMME-Seite ·
//    Export mit offenem Begleiter · Perform-Blöcke bei Taktart-Wechsel · KÖRNUNG-Form · Song-MIDI mit MELODIE-Clips
// Aufruf: node int54-test.mjs <index.html> <ausgabe-ordner> [vergleich.html = Stand vor INT54] [vergleich-p.html = Stand vor INT54-P]
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
  /* =================== INT54-P (Prüfer-Befunde zum 4.54-Kandidaten): P1 … P8, Gegenlauf gegen den Stand vor INT54-P (4. Argument) =================== */
  const smf = u => {   // Standard-MIDI-Datei → Noten [{ch, b (Schlag), n, v}]
    let i = 0; const rd = n => { let v = 0; for (let k = 0; k < n; k++) v = v * 256 + u[i++]; return v; }, vlq = () => { let v = 0, c; do { c = u[i++]; v = v * 128 + (c & 127); } while (c & 128); return v; };
    i = 4; const hl = rd(4); i = 8; rd(2); const ntr = rd(2), div = rd(2); i = 8 + hl; const notes = [];
    for (let t = 0; t < ntr; t++) { i += 4; const len = rd(4), end = i + len; let tk = 0, rs = 0;
      while (i < end) { tk += vlq(); let st = u[i]; if (st === 0xFF) { i += 2; const l = vlq(); i += l; continue; } if (st === 0xF0 || st === 0xF7) { i++; const l = vlq(); i += l; continue; }
        if (st & 0x80) { rs = st; i++; } else st = rs; const ty = st & 0xF0, ch = st & 15; if (ty === 0xC0 || ty === 0xD0) { i++; continue; } const a = u[i++], bb = u[i++];
        if (ty === 0x90 && bb > 0) notes.push({ch, b: +(tk / div).toFixed(3), n: a, v: bb}); } }
    return notes;
  };
  const cmpP = process.argv[5] || null;
  /* P1  KF1 „S&H in der Tonart“ × Rückung (JAM2/JAM3) und „Song transponieren“: der gerückte Teil rastet in die gerückte Tonart */
  if (!ONLY || ONLY.includes('P1')) {
    const sh = async (f, mode) => {
      const p = await open(f, 428, 926);
      const r = await run(p, async mode => {
        ensureAudio(); await wait(400); SYNQUENZER.setBpm(120);
        const songEnd = async (sb, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 14000)) { if (!R.songPlay || !R.playing) return true; const b = songBeatOf(audBeat()); if (b != null && b >= sb) return true; await wait(40); } return false; };
        const mk = () => { const s = deep(SQStore.normalizeSound(factorySound('f-init-analog'))); Object.assign(s.p, {o1w: 3, o1lvl: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .001, aD: 1, aS: 1, aR: .05, level: .5, analog: 0, ftype: 0, spread: 0, ampVel: 0, l1shape: 4, l1rate: 6, l1sync: 0, l2shape: 0, kfSh1: 1, glide: 0, poly: 1}); s.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}]; s.fx = {}; return s; };
        const ft = S.tracks.findIndex(t => t && t.mel), tr = [3, ft];
        for (const i of tr) applySound(i, mk());
        const c0 = S.tracks[1].clips[0];
        for (const i of tr) for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.len = 2; c.notes = [{t: 0, d: 7.9, n: i === 3 ? 60 : 72, v: .8}]; delete c.st; S.tracks[i].clips[s] = c; clipChanged(i, s); }
        songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged(); await wait(200);
        if (mode === 'rk') SYNQUENZER.jam2.rkSet(S.song.marks.find(x => x.a === 2).id, 1); else gr1XpShift(1);
        await wait(200);
        const msgs = [];
        if (mode === 'rk') {
          for (const i of tr) { const E = AU.synth[i], pm = E.node.port.postMessage.bind(E.node.port); E.node.port.postMessage = (m, x) => { if (m && m.kfKey) msgs.push({i, root: m.kfKey[0], t: m.kfT != null ? +t2b(m.kfT).toFixed(2) : null}); return pm(m, x); }; }
          clearLog(); songPlayFrom(0); await wait(60); const off = R.songPlay ? R.songPlay.off : 0; await songEnd(15.9, 15000); SYNQUENZER.stop(); await wait(400);
          for (const m of msgs) if (m.t != null) m.t = +(m.t - off).toFixed(2);
        }
        const steps = {};
        for (const i of mode === 'rk' ? tr : [3]) {
          VA1.only = {tracks: new Set([i])}; let r; try { r = await vvRenderAudio({range: {a: 0, b: S.song.bars}}); } finally { VA1.only = null; }
          const x = r.ch[0], sr = r.sr, sp = spb(), lead = r.lead || 0, P = []; let last = -1;
          for (let k = 1; k < x.length; k++) if (x[k - 1] < 0 && x[k] >= 0) { const t = k - 1 + x[k - 1] / (x[k - 1] - x[k]); if (last >= 0) P.push([(last + t) / 2 / sr, 69 + 12 * Math.log2(sr / (t - last) / 440)]); last = t; }
          const G = []; for (const [t, m] of P) { const g = G[G.length - 1]; if (g && Math.abs(g.m - m) < .3) { g.n++; g.t1 = t; g.s += m; g.m = g.s / g.n; } else G.push({t0: t, t1: t, m, s: m, n: 1}); }
          const st = G.filter(g => g.t1 - g.t0 > .06).map(g => ({b: (g.t0 - lead) / sp, m: g.m}));
          const inK = (m, root) => [0, 2, 4, 5, 7, 9, 11].includes((((Math.round(m) - root) % 12) + 12) % 12);
          const part = (lo, hi) => { const s = st.filter(q => q.b >= lo + .3 && q.b < hi - .3); return {n: s.length, C: s.filter(q => inK(q.m, 0)).length, Cis: s.filter(q => inK(q.m, 1)).length}; };
          steps[i] = {t1: part(0, 8), t2: part(8, 16)};
        }
        return {tr, steps, msgs};
      }, mode);
      await p._ctx.close(); return r;
    };
    const A = await sh(file, 'rk');
    const allIn = (q, k) => q.n >= 10 && q[k] === q.n;
    ok(A.tr.every(i => allIn(A.steps[i].t1, 'C') && allIn(A.steps[i].t2, 'Cis')) && A.tr.every(i => A.msgs.some(m => m.i === i && m.root === 1 && Math.abs(m.t - 8) < .02)),
      'P1 KF1 „S&H in der Tonart“ × Rückung +1 am 2. Teil (Folgespur 3 und feste Spur MELODIE): Offline-Render Teil 1 ganz in C-Dur, Teil 2 ganz in Cis-Dur; live geht die Cis-Tonart mit Zeit auf Schlag 8 an beide Engines', {steps: A.steps, msgs: A.msgs.slice(0, 6)});
    const X = await sh(file, 'xp');
    ok(allIn(X.steps[3].t1, 'Cis') && allIn(X.steps[3].t2, 'Cis'), 'P1 „Song transponieren +1“: die Folgespur rastet im ganzen Song in Cis-Dur', X.steps[3]);
    if (cmpP) { const V = await sh(cmpP, 'rk'); ok(V.tr.some(i => V.steps[i].t2.C === V.steps[i].t2.n && V.steps[i].t2.n > 0), 'P1 Gegenlauf (vor INT54-P): Teil 2 rastete in C-Dur ein', V.steps); }
  }
  /* P2  Begleiter ● AUFN. außerhalb von 4/4: Szene (2 Durchläufe) und „ans Song-Ende“ spielen Ton für Ton wie live */
  if (!ONLY || ONLY.includes('P2')) {
    const rec = async (f, TSL, ziel) => {
      const p = await open(f, 428, 926);
      const r = await run(p, async a => {
        const [TSL, ziel] = a; ensureAudio(); await wait(300); const out = {};
        const songEnd = async (sb, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 20000)) { if (!R.songPlay || !R.playing) return true; const b = songBeatOf(audBeat()); if (b != null && b >= sb) return true; await wait(40); } return false; };
        for (const ts of TSL) {
          SYNQUENZER.newProject(); await wait(250); SYNQUENZER.setBpm(150); setSongTs(ts, {quiet: true}); await wait(80);
          const B = SYNQUENZER.beg1; B.open(); await wait(200); B.targets({dr: 4, bs: 0, cp: 2}); B.ziel(ziel); B.variant('A'); B.fig('auto'); clearLog();
          B.rec(); await chord([60, 64, 67]); await wait(60);
          const r0 = B.run(), LB = r0.LB, t0 = r0.t0;
          await until(t0 + LB + .3); await chord([57, 60, 64]); B.variant('B');
          await until(t0 + 2 * LB + .3); await chord([65, 69, 72]);
          await until(t0 + 3 * LB - .2); B.rec(); await until(t0 + 3 * LB + .6);
          const live = noteLog(4096).filter(e => e.beat != null && e.beat >= t0 - 1e-6 && e.beat < t0 + 3 * LB - 1e-6 && e.src !== 'retune' && [0, 2, 4].includes(e.track)).map(e => e.track + ':' + e.out + '@' + (e.beat - t0).toFixed(2)).sort();
          SYNQUENZER.stop(); await wait(600); const last = B.state().last; B.close(); await wait(200);
          let b1 = [], b2 = [], row = null;
          if (ziel === 'scene' && last && last.scene != null) {
            const sc = last.scene; row = S.scenes[sc].chords ? S.scenes[sc].chords.ch.map(c => c.b) : null;
            clearLog(); launchScene(sc); await wait(60); const tt = performance.now(); while (!R.playing && performance.now() - tt < 3000) await wait(10); await wait(100);
            const cs = R.cstart[4]; await until(cs + 6 * LB + .1, 40000);
            const NL = noteLog(4096).filter(e => e.beat != null && e.src !== 'retune' && [0, 2, 4].includes(e.track));
            b1 = NL.filter(e => e.beat >= cs - 1e-6 && e.beat < cs + 3 * LB - 1e-6).map(e => e.track + ':' + e.out + '@' + (e.beat - cs).toFixed(2)).sort();
            b2 = NL.filter(e => e.beat >= cs + 3 * LB - 1e-6 && e.beat < cs + 6 * LB - 1e-6).map(e => e.track + ':' + e.out + '@' + (e.beat - cs - 3 * LB).toFixed(2)).sort();
          } else if (ziel === 'song' && S.song && S.song.bars) {
            row = S.song.carrier.map(c => +c.beat.toFixed(3));
            clearLog(); songPlayFrom(0); await wait(60); const off = R.songPlay ? R.songPlay.off : 0; await songEnd(3 * LB - .05);
            b1 = noteLog(4096).filter(e => e.beat != null && e.src !== 'retune' && [0, 2, 4].includes(e.track) && e.beat - off < 3 * LB - 1e-6).map(e => e.track + ':' + e.out + '@' + (e.beat - off).toFixed(2)).sort(); b2 = b1;
          }
          SYNQUENZER.stop(); await wait(500);
          const same = x => x.length === live.length && x.every((y, k) => y === live[k]);
          out[ts] = {LB, live: live.length, row, d1: same(b1), d2: same(b2), n1: b1.filter(x => !live.includes(x)).length, n2: b2.filter(x => !live.includes(x)).length};
        }
        setSongTs('4/4', {quiet: true}); return out;
      }, [TSL, ziel]);
      await p._ctx.close(); return r;
    };
    const S1 = await rec(file, ['4/4', '3/4', '12/8', '5/4'], 'scene');
    for (const [ts, x] of Object.entries(S1)) ok(x.live > 20 && x.d1 && x.d2, 'P2 Begleiter ● AUFN. ' + ts + ' → Szene: beide Durchläufe Ton für Ton wie live (' + x.live + ' Töne), Akkord-Zeile ' + JSON.stringify(x.row), x);
    const S2 = await rec(file, ['12/8', '7/8'], 'song');
    for (const [ts, x] of Object.entries(S2)) ok(x.live > 20 && x.d1 && x.row && x.row.length === 3, 'P2 Begleiter ● AUFN. ' + ts + ' → ans Song-Ende (partChunk): Song wie live, Träger ' + JSON.stringify(x.row), x);
    if (cmpP) { const V = await rec(cmpP, ['3/4'], 'scene'); ok(!V['3/4'].d2, 'P2 Gegenlauf (vor INT54-P): 3/4 – der 2. Durchlauf der Szene wich von live ab', V['3/4']); }
  }
  /* P3  CHQ: Video-Regie-Streifen / Schnitt-Modus ohne Perform-Spur, 926×370 – das Fenster schrumpft nicht für nichts */
  if (!ONLY || ONLY.includes('P3')) {
    const cq = async (f, nl) => {
      const p = await open(f, 926, 370, true);
      await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(n => __chqLanes(n), nl); await p.evaluate(() => __chqSv()); await p.waitForTimeout(500);
      const m = () => p.evaluate(() => { svLayout(); svDraw(true); const q = SYNQUENZER.chqInfo().sv, s = __gl1Scan('#app'); return {rowH: +SV.rowH.toFixed(2), w: q.w, chor: SV.rows.filter(r => r <= -101).length, leer: SV.rows.filter(r => r === -1).length, bad: __chqBad(s)}; });
      const a = await m();
      await p.evaluate(() => { S.song.video = [{a: 0, b: 4, v: 'song'}]; songChanged(); svLayout(); UI.dirty.song = true; }); await p.waitForTimeout(400); const b = await m();
      await p.screenshot({path: path.join(out, 'int54p-p3-regie-n' + nl + '-' + path.basename(path.dirname(f)) + '.png')});
      await p.evaluate(() => { vd3CutSet(true); }); await p.waitForTimeout(400); const c = await m();
      await p.screenshot({path: path.join(out, 'int54p-p3-schnitt-n' + nl + '-' + path.basename(path.dirname(f)) + '.png')});
      await p._ctx.close(); return {a, b, c};
    };
    for (const nl of [4, 8]) {
      const N = await cq(file, nl);
      ok([N.b, N.c].every(x => x.leer === 0 && x.chor === N.a.chor && x.w === N.a.w && !x.bad), 'P3 CHQ 926×370, ' + nl + ' Chor-Spuren: mit Video-Regie-Streifen (' + N.b.rowH + ' px) und im Schnitt-Modus (' + N.c.rowH + ' px) dasselbe Fenster wie ohne (' + N.a.w + ' Spuren), keine leeren Zeilen, GL1-Scanner 0', N);
      if (cmpP && nl === 4) { const V = await cq(cmpP, nl); ok(V.b.leer > 0 || V.c.leer > 0, 'P3 Gegenlauf (vor INT54-P): das Fenster schrumpfte auf 1 Spur + leere Zeilen', V); }
    }
  }
  /* P4  VD4-Bild im Bild quer auf der STIMME-Seite: frei bleiben Stopp-Spalte, Chor-Stumm-Tasten und Spurköpfe; Zurückblättern legt neu */
  if (!ONLY || ONLY.includes('P4')) {
    for (const [w, h] of [[926, 428], [926, 370]]) {
      const p = await open(file, w, h, true);
      await p.evaluate(() => __gl1Setup()); await p.evaluate(() => SYNQUENZER.chsOpen(true)); await p.evaluate(() => __chqLanes(8));
      const r = {};
      for (const c of ['br', 'bl', 'back']) {
        await p.evaluate(c => { setSongView(false); const st = stimmeT(), k = MX.pages ? MX.pages.findIndex(q => q.includes(st)) : 0; setTrackBank(c === 'back' ? 0 : Math.max(0, k)); if (c !== 'back') { setUiPref('vd4pos', c === 'bl' ? {l: 'bl', p: 'bl'} : {}); vd4Set(false); vd4Set(true); } }, c);
        await p.waitForTimeout(1100);
        r[c] = await p.evaluate(() => {
          const pip = VD4.el.getBoundingClientRect(), ga = EL.gridArea.getBoundingClientRect();
          const under = [...EL.grid.querySelectorAll('button, .rb')].filter(e => e.getClientRects().length).filter(e => { const q = e.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2; return cx > pip.left && cx < pip.right && cy > pip.top && cy < pip.bottom && VD4.el.contains(document.elementFromPoint(cx, cy)); }).map(e => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30));
          const heads = [...EL.grid.querySelectorAll('.th')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()), hr = Math.max(...heads.map(q => q.right));
          return {tb: trackBankOf(), x: Math.round(pip.left - ga.left), r: Math.round(pip.right - ga.left), headsR: Math.round(hr - ga.left), bad: under.filter(t => /stumm|stoppen|Mischpult|^Spur:/.test(t)), n: under.length};
        });
      }
      await p.screenshot({path: path.join(out, 'int54p-p4-pip-' + w + 'x' + h + '.png')});
      await p._ctx.close();
      ok(r.br.tb === 1 && !r.br.bad.length && !r.bl.bad.length && r.bl.x >= r.bl.headsR && r.back.tb === 0 && !r.back.bad.length && r.back.x >= r.back.headsR - 1,
        'P4 VD4 ' + w + '×' + h + ' STIMME-Seite: unten rechts deckt das Fenster keine Stopp-/Stumm-/Mischpult-Taste (vorher 11–12), unten links keinen Spurkopf (x ' + r.bl.x + ' ≥ ' + r.bl.headsR + '); nach Zurückblättern neu gelegt', r);
    }
  }
  /* P5  Offener Begleiter verfälscht den Export nicht (MIDI und Video-/WAV-Ton bei TONART und PARALLEL) */
  if (!ONLY || ONLY.includes('P5')) {
    const ex = async f => {
      const p = await open(f, 428, 926);
      const r = await run(p, async () => {
        ensureAudio(); await wait(400); const res = {};
        const fnv = u => { let h = 2166136261 >>> 0; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
        const song = async () => { const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); const u = new Uint32Array(r.ch[0].buffer, r.ch[0].byteOffset, r.ch[0].length); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return (h >>> 0).toString(16); };
        const mid = () => { const m = buildMidi({mode: 'song'}); return m ? fnv(m.bytes) : null; }, v1 = () => { const m = va1MidiSong([0, 1], true); return m ? fnv(m.bytes) : null; };
        for (const mode of ['scale', 'chromatic']) {
          SYNQUENZER.newProject(); await wait(250); setBpm(120);
          for (let t = 0; t < S.tracks.length; t++) { try { setTrackFx(t, 'rev', 0); setTrackFx(t, 'dly', 0); } catch (e) {} }
          const ns = []; [60, 62, 64, 65, 67, 69, 71, 72].forEach((n, k) => ns.push({t: k * .5, n, d: .45, v: .8}));
          SYNQUENZER.setClip(0, 0, {len: 1, notes: ns}); SYNQUENZER.setClip(1, 0, {len: 1, notes: [{t: 0, n: 48, d: 3.9, v: .8}, {t: 0, n: 52, d: 3.9, v: .7}, {t: 0, n: 55, d: 3.9, v: .7}]});
          setHarmony({mode}); songFromChain([{scene: 0, bars: 4}]); songSetChord(1, 'Am'); songSetChord(2, 'F7'); songSetChord(3, 'D'); await wait(300);
          const zu = {midi: mid(), va1: v1(), audio: await song()};
          SYNQUENZER.beg1.open(); await wait(400);
          const of = {midi: mid(), va1: v1(), audio: await song(), live: T.opts.mode};
          SYNQUENZER.beg1.close(); await wait(300);
          res[mode] = {zu, of, nach: T.opts.mode};
        }
        return res;
      });
      await p._ctx.close(); return r;
    };
    const E = await ex(file);
    for (const [m, x] of Object.entries(E)) ok(x.zu.midi === x.of.midi && x.zu.va1 === x.of.va1 && x.zu.audio === x.of.audio && x.of.live === 'chord' && x.nach === m,
      'P5 Harmonie ' + m + ': mit offenem Begleiter Song-MIDI, MIDI je Spur und Video-/WAV-Ton bitgleich wie mit geschlossenem; live bleibt AKKORD, nach ✕ wieder ' + m, x);
    if (cmpP) { const V = await ex(cmpP); ok(V.scale.zu.midi !== V.scale.of.midi, 'P5 Gegenlauf (vor INT54-P): TONART – mit offenem Begleiter war das MIDI anders', V.scale); }
  }
  /* P6  Perform-Blöcke bei Taktart-Wechsel: Dauer und Kurve decken danach dieselben Takte (setSongTs 3/4, GEN4 „Alles“ 6/8) */
  if (!ONLY || ONLY.includes('P6')) {
    const pf = async f => {
      const p = await open(f, 428, 926);
      const r = await run(p, async () => {
        const D = SYNQUENZER, res = {}; ensureAudio(); await wait(400);
        const nt = a => a.map(([t, n, d, v]) => ({t, n, d: d || .45, v: v || .8}));
        const SETUP = async () => { D.newProject(); await wait(250); setBpm(120);
          D.setClip(0, 0, {len: 1, notes: nt([[0, 36, .9], [1, 36], [2, 43, .9], [3, 41]])}); D.setClip(DRUM_T, 0, {len: 1, notes: nt([[0, 36, .1, .9], [1, 38, .1, .8], [2, 36, .1, .9], [3, 38, .1, .8]])});
          D.songFromChain([{scene: 0, bars: 4}, {scene: 0, bars: 4}]); await wait(150);
          D.jam3.put({k: 'm', b: 0, d: 16, g: 'dr', lv: 'stumm'}); D.jam3.put({k: 'f', b: 16, d: 8, c: [[0, -.3], [4, -.8], [7.9, -.1]]}); };
        const look = () => { const sg = S.song, bb = x => +(barAt(x + 1e-6) + (x - barBeat(barAt(x + 1e-6))) / barLen(barAt(x + 1e-6))).toFixed(3); return (sg.pf || []).map(x => ({k: x.k, takt: [bb(x.b), bb(x.b + x.d)], c: x.c ? x.c.map(q => +(q[0] / x.d).toFixed(3)) : null})); };
        await SETUP(); res.vor = look();
        setSongTs('3/4', {quiet: true}); await wait(200); res.ts34 = look();
        const m = buildMidi({mode: 'song'}); res.midi = Array.from(m.bytes);
        await SETUP(); { const G = D.gen4; G.open('all'); G.set({st: 'irish68', k: 70}); G.act('[data-g2="go"]'); await wait(300); D.stop(); G.act('[data-g4="ok"]'); await wait(150); closePop(); } res.alles68 = look(); res.ts68 = S.ts || '4/4';
        return res;
      });
      await p._ctx.close(); return r;
    };
    const Q = await pf(file), dr = smf(Uint8Array.from(Q.midi)).filter(x => x.ch === 9).map(x => x.b);
    const same = x => JSON.stringify(x) === JSON.stringify(Q.vor);
    ok(same(Q.ts34) && same(Q.alles68) && Q.ts68 === '6/8' && [12, 13, 14, 15].every(b => dr.includes(b)),
      'P6 Perform-Blöcke: nach Taktart 3/4 und GEN4 „Alles → 6/8“ decken DRUMS aus (Takt 1–4) und Filter (Takt 5–6) dieselben Takte, Kurvenpunkte an derselben Stelle; im 3/4-MIDI spielen die Drums ab Schlag 12 (Teil 2)', {vor: Q.vor, ts34: Q.ts34, alles68: Q.alles68, dr: dr.filter(b => b >= 10 && b < 18)});
    if (cmpP) { const V = await pf(cmpP); ok(JSON.stringify(V.ts34) !== JSON.stringify(V.vor), 'P6 Gegenlauf (vor INT54-P): die Blöcke behielten ihre Schläge und griffen in den nächsten Teil', V.ts34); }
  }
  /* P7  KÖRNUNG nur über „Bits“: Speichern → Laden → Speichern Zeichen für Zeichen gleich, Video-Fingerabdruck gleich */
  /* P8  Song-MIDI enthält die Clips der MELODIE-Spur (⇅ fest, Rückung) wie gehört / wie das MIDI je Spur */
  if (!ONLY || ONLY.includes('P7') || ONLY.includes('P8')) {
    const dm = async f => {
      const p = await open(f, 428, 926);
      const r = await run(p, async () => {
        const D = SYNQUENZER, o = {}; ensureAudio(); await wait(400);
        D.newProject(); await wait(250); D.setClip(0, 0, {len: 1, notes: [{t: 0, n: 48, d: 1, v: .8}]});
        const b0 = soundSnapshot(0); setP(0, 'fx.kfBits', 8); commitSound(0, b0, 'Bits'); o.mem = JSON.stringify(S.tracks[0].sound.fx);
        const F1 = serialize(), s1 = int53cHash(); applyProject(parseAny(F1).project, {ui: true}); await wait(500); const F2 = serialize(), s2 = int53cHash();
        o.korn = {same: F1 === F2, sig: s1 === s2, fx2: JSON.stringify(JSON.parse(F2).project.tracks[0].sound.fx)};
        D.newProject(); await wait(250); setBpm(120);
        const nt = a => a.map(([t, n, d, v]) => ({t, n, d: d || .45, v: v || .8}));
        D.setClip(0, 0, {len: 1, notes: nt([[0, 36, .9], [1, 38], [2, 40, .9], [3, 41]])}); D.setClip(MEL_T, 0, {len: 1, notes: nt([[0, 72], [1, 74], [2, 76], [3, 77]])});
        D.songFromChain([{scene: 0, bars: 2}, {scene: 0, bars: 2}]); D.jam2.rkSet(S.song.marks[1].id, 1); await wait(300);
        o.ch = midiCh(MEL_T); o.follow = S.tracks[MEL_T].follow; o.midi = Array.from(buildMidi({mode: 'song'}).bytes); const v = va1MidiSong([MEL_T], true); o.va1 = v ? Array.from(v.bytes) : null;
        return o;
      });
      await p._ctx.close(); return r;
    };
    const Z = await dm(file), mel = smf(Uint8Array.from(Z.midi)).filter(x => x.ch === Z.ch).map(x => x.b + ':' + x.n).sort(), v1 = Z.va1 ? smf(Uint8Array.from(Z.va1)).filter(x => x.ch === Z.ch).map(x => x.b + ':' + x.n).sort() : [];
    ok(Z.korn.same && Z.korn.sig && /"kfBits":8,"kfRate":1,"kfMix":1/.test(Z.mem), 'P7 KÖRNUNG nur über „Bits“: im Speicher gleich Bits, Rate, Mischung (wie nach dem Laden), Datei vor/nach Laden Zeichen für Zeichen gleich, int53cHash gleich', Z.korn);
    ok(mel.length === 16 && JSON.stringify(mel) === JSON.stringify(v1) && mel.includes('8:73') && mel.includes('15:78') && Z.follow === false,
      'P8 Song-MIDI: MELODIE (⇅ fest) mit ihren 16 Clip-Noten auf Kanal ' + (Z.ch + 1) + ', Teil 2 um +1 gerückt (73 … 78), gleich dem MIDI je Spur', {mel: mel.slice(0, 16)});
    if (cmpP) { const V = await dm(cmpP), vm = smf(Uint8Array.from(V.midi)).filter(x => x.ch === V.ch); ok(!V.korn.same && vm.length === 0, 'P7/P8 Gegenlauf (vor INT54-P): Datei nach dem Laden anders, Song-MIDI ohne MELODIE-Noten', {korn: V.korn, mel: vm.length}); }
  }
  ok(!errs.length, 'keine Seitenfehler', errs.slice(0, 4).join(' | '));
} catch (e) { res.push({pass: false}); console.log('FEHLER Abbruch – ' + (e && e.stack || e)); }
await b.close();
const bad = res.filter(x => !x.pass).length;
console.log((bad ? 'FEHLER' : 'OK') + ' INT54: ' + (res.length - bad) + '/' + res.length + ' bestanden');
process.exit(bad ? 1 : 0);
