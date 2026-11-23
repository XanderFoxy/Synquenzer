// ARPG Kern-Test: Arp-Gate über 100 % (Legato). node arpg-test.cjs <port> [alt-pfad] [neu-pfad]
// Server-Wurzel = srv/ (alt/index.html = 4.88.0, neu/index.html = ARPG). Pfade relativ zur Server-Wurzel.
const {chromium} = require('playwright'), path = require('path');
const port = process.argv[2], ALT = process.argv[3] || 'alt/index.html', NEU = process.argv[4] || 'neu/index.html', here = __dirname;
let fail = 0; const ok = (c, n, x) => { console.log((c ? 'OK     ' : 'FEHLER ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : '')); if (!c) fail++; };
const errs = [];
let b;
async function page(f, w, h) {
  const p = await b.newPage({viewport: {width: w || 428, height: h || 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(f + ': ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.text()) && !/404/.test(m.text())) errs.push(f + ': ' + m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await p.waitForTimeout(1500);
  return p;
}
const MN = "function midiNotes(bytes) {\n  const u = Uint8Array.from(bytes); let o = 14; const ppq = (u[12] << 8) | u[13], out = [];\n  while (o < u.length) {\n    const len = (u[o + 4] << 24) | (u[o + 5] << 16) | (u[o + 6] << 8) | u[o + 7]; let q = o + 8; const end = q + len; let tk = 0, rs = 0; const open = new Map();\n    while (q < end) {\n      let d = 0, c; do { c = u[q++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;\n      let st = u[q]; if (st & 128) q++; else st = rs;\n      if (st === 0xFF) { q++; let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }\n      rs = st; const hi = st & 0xF0, ch = st & 15;\n      if (hi === 0x90 || hi === 0x80) { const p = u[q++], v = u[q++]; const k = ch + ':' + p;\n        if (hi === 0x90 && v > 0) { const n = {ch, t: tk / ppq, p, v}; out.push(n); const L = open.get(k) || []; L.push(n); open.set(k, L); }\n        else { const L = open.get(k); const n = L && L.shift(); if (n) n.d = tk / ppq - n.t; } }\n      else if (hi === 0xC0 || hi === 0xD0) q += 1; else q += 2;\n    }\n    o = end;\n  }\n  return out.sort((x, y) => x.t - y.t || x.p - y.p);\n}";
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const host = async () => { ensureAudio(); for (let k = 0; k < 100 && SynthHost.state !== 'ready' && SynthHost.state !== 'failed'; k++) await wait(100); return SynthHost.state; };
  const va = () => S.tracks.findIndex(t => t.kind === 'synth' && t.sound.engine === 'analog');
  const A = SYNQUENZER.arp1;
  const solo = (i, notes, bars, songBars) => { for (const t of S.tracks) t.clips = t.clips.map(() => null); S.tracks[i].clips[0] = normClip({len: bars || 1, key: Object.assign({}, S.key), notes}, 'synth', S.key); SYNQUENZER.songFromChain([{scene: 0, bars: songBars || bars || 1}]); };
  const rend = async bars => { VV.cancel = false; const s = await vvRenderAudio({range: {a: 0, b: bars || S.song.bars, sel: false}}); return s; };
  const lg = (s, i, src) => (s.log || []).filter(e => e.track === i && (!src || e.src === src) && !e.removed).map(e => ({b: e.beat, p: e.out, d: +(e.dur / spb()).toFixed(4)})).sort((x, y) => x.b - y.b || x.p - y.p);
  const ch0 = s => { const B = s.buf; if (!B) return null; if (B.getChannelData) return B.getChannelData(0); if (Array.isArray(B)) return B[0]; return B; };
  const click = x => { let m = 0, pk = 0; for (let k = 2; k < x.length; k++) { const d = Math.abs(x[k] - 2 * x[k - 1] + x[k - 2]); if (d > m) m = d; const a = Math.abs(x[k]); if (a > pk) pk = a; } return {d2: +(m / Math.max(1e-6, pk)).toFixed(5), pk: +pk.toFixed(4), nan: x.some(v => !isFinite(v))}; };
  const rms = x => { const o = []; if (!x) return o; const W = 4800; for (let k = 0; k + W <= x.length; k += W) { let e = 0; for (let j = k; j < k + W; j++) e += x[j] * x[j]; o.push(+Math.sqrt(e / W).toFixed(5)); } return o; };
  const hsh = x => { let h = 0x811c9dc5; if (!x) return 0; for (let k = 0; k < x.length; k += 7) { h ^= Math.round(x[k] * 1e7) | 0; h = Math.imul(h, 16777619) >>> 0; } return h; };
  const mapP = (i, n) => mapOut(i, S.tracks[i].clips[0].key, n, Infinity);
  ${MN}`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
// A: Gate <= 100 – dieselben Zahlen in 4.88 und ARPG (Render-Protokoll, reine Rechnung, Festschreiben, MIDI, Audio-Prüfsumme, Datei)
const caseA = async () => {
  await host(); const i = va(), out = {}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0; S.bpm = 120;
  const clips = {akkord: [48, 52, 55].map(n => ({t: 0, d: 4, n, v: .8})), achtel: [36, 36, 43, 43, 41, 41, 40, 38].map((n, k) => ({t: k * .5, d: k % 3 ? .25 : .5, n, v: .8}))};
  for (const [cn, notes] of Object.entries(clips)) for (const g of [5, 30, 80, 100]) for (const m of ['auf', 'oktave', 'akkord']) {
    solo(i, notes, 1, 2); const cfg = {on: 1, m, r: 16, tri: 0, o: 1, g, sw: m === 'oktave' ? 30 : 0, ks: 1, la: 0, rep: 1, fig: 1}; A.set(i, cfg); R.selS = 0;
    const s = await rend(2), k = cn + '/' + m + '/' + g;
    const src = []; for (const kk of [0, 1]) for (const nt of S.tracks[i].clips[0].notes) src.push({on: nt.t + 4 * kk, off: nt.t + 4 * kk + Math.max(nt.d, 1 / 32), p: mapP(i, nt.n), v: nt.v});
    out[k] = {log: lg(s, i, 'arp'), r: A.render(src, cfg, {a: 0, b: 8, spb: spb(), seed: ARP1K.seedOf(i)}), bake: A.bakeNotes(i, 0),
      midi: Array.from(SYNQUENZER.buildMidi({mode: 'scene', scene: 0}).bytes), au: 0}; if (g === 80 && m === 'auf' && cn === 'akkord') { out.rms = rms(ch0(s)); out.rms2 = rms(ch0(await rend(2))); }
  }
  A.set(i, {on: 1, m: 'auf', r: 16, g: 100}); out.datei = SYNQUENZER.serialize().replace(/"sum":"[0-9a-f]+"/, '').replace(/"id":"p-[a-z0-9-]+"/, '').replace(/"uid":"[a-z0-9]+"/g, '');
  out.norm = [A.norm({g: 100}), A.norm({g: 5}), A.norm({g: 3}), A.norm({}), A.norm({g: 80.4})];
  return out;
};
// B: Gate 100/150/200 – Längen, Überlappung, Planer = Rechnung, Festschreiben, MIDI, Klicks
const caseB = async () => {
  await host(); const i = va(), o = {}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0; S.bpm = 120;
  const chord = [48, 52, 55].map(n => ({t: 0, d: 4, n, v: .8})), one = [{t: 0, d: 4, n: 48, v: .8}];
  for (const [cn, notes] of [['akkord', chord], ['einton', one]]) for (const g of [100, 150, 200]) {
    solo(i, notes, 1, 2); const cfg = {on: 1, m: 'auf', r: 16, o: 1, g, ks: 1, fig: 1}; A.set(i, cfg); R.selS = 0;
    const s = await rend(2), L = lg(s, i, 'arp').filter(e => e.b < 4 - 1e-6);
    const src = []; for (const kk of [0, 1]) for (const nt of S.tracks[i].clips[0].notes) src.push({on: nt.t + 4 * kk, off: nt.t + 4 * kk + Math.max(nt.d, 1 / 32), p: mapP(i, nt.n), v: nt.v});
    const Rr = A.render(src, A.get(i), {a: 0, b: 8, spb: spb(), seed: ARP1K.seedOf(i)}).map(n => ({b: +n.t.toFixed(4), p: n.p, d: +n.d.toFixed(4)})).filter(e => e.b < 4 - 1e-6);
    const ov = L.filter((e, k) => L[k + 1] && e.b + e.d > L[k + 1].b + 1e-4).length;
    const sameOv = L.filter((e, k) => L.some(f => f !== e && f.p === e.p && f.b > e.b + 1e-4 && f.b < e.b + e.d - 1e-4)).length;
    const bake = A.bakeNotes(i, 0).filter(n => n.t < 4 - 1e-6);
    const mid = midiNotes(Array.from(SYNQUENZER.buildMidi({mode: 'scene', scene: 0}).bytes)).filter(n => n.ch === midiCh(i));
    const x = ch0(s);
    o[cn + '/' + g] = {n: L.length, durs: [...new Set(L.filter(e => e.b < 3.7).map(e => e.d))], last: L[L.length - 1] && [L[L.length - 1].b, L[L.length - 1].p, L[L.length - 1].d], ov, sameOv, plan: L.length === Rr.length && L.every((e, k) => Math.abs(e.b - Rr[k].b) <= .002 && e.p === Rr[k].p && Math.abs(e.d - Rr[k].d) <= .004),
      bake: [...new Set(bake.filter(n => n.t < 3.7).map(n => +n.d.toFixed(4)))], midi: [...new Set(mid.filter(n => n.t < 3.7).map(n => +n.d.toFixed(3)))], midiSame: mid.filter((n, k) => mid.some(m => m !== n && m.p === n.p && m.t > n.t + 1e-3 && m.t < n.t + n.d - 1e-3)).length,
      click: x ? click(x) : null};
  }
  // Klick-Maß (2. Differenz / Spitze) mit Tiefpass 600 Hz, damit die Sägezahn-Kanten nicht zählen: poly, ein Ton, mono-legato
  for (const [cn, notes] of [['poly', chord], ['einton', one]]) for (const g of [100, 200]) {
    applySound(i, factorySound(INIT_IDS.analog)); solo(i, notes, 1, 2); S.tracks[i].sound.p.cutoff = 600; A.set(i, {on: 1, m: 'auf', r: 16, o: 1, g, ks: 1, fig: 1}); R.selS = 0;
    o['lp/' + cn + '/' + g] = click(ch0(await rend(2)));
  }
  // Mono-Legato (Modus 2, Gleiten): 200 % bindet – Klick-Maß wie bei 100 %
  for (const g of [100, 200]) {
    applySound(i, factorySound(INIT_IDS.analog)); solo(i, chord, 1, 2); const snd = S.tracks[i].sound; snd.p.mode = 2; snd.p.glide = .04; snd.p.cutoff = 600; A.set(i, {on: 1, m: 'auf', r: 16, o: 1, g, ks: 1, fig: 1}); R.selS = 0;
    const s = await rend(2); o['mono/' + g] = {click: click(ch0(s)), n: lg(s, i, 'arp').length};
  }
  // Festschreiben 150 %: echte Clip-Noten mit 0,375 Schlag
  applySound(i, factorySound(INIT_IDS.analog)); solo(i, chord, 1, 2); A.set(i, {on: 1, m: 'auf', r: 16, o: 1, g: 150, ks: 1, fig: 1});
  A.bake(i, 0); const cn = S.tracks[i].clips[0].notes; o.baked = {n: cn.length, d: [...new Set(cn.filter(n => n.t < 3.7).map(n => n.d))], end: cn.every(n => n.t + n.d <= 4 + 1e-9), arpOff: !A.on(i)};
  // Datei: 150 % bleibt nach Sichern/Laden
  A.set(i, {on: 1, m: 'auf', r: 16, g: 150}); const j = SYNQUENZER.serialize(); SYNQUENZER.importJSON(j); await wait(400); o.load = A.get(i) && A.get(i).g;
  return o;
};
(async () => {
  b = await chromium.launch();
  try {
    const pa = await page(ALT), pn = await page(NEU);
    const ra = await run(pa, caseA), rn = await run(pn, caseA);
    const keys = Object.keys(ra).filter(k => k.includes('/'));
    const diff = keys.filter(k => JSON.stringify(ra[k]) !== JSON.stringify(rn[k]));
    ok(diff.length === 0, 'A1 Gate 5/30/80/100 % (Auf, Oktave+Swing, Akkord; Akkord- und Achtel-Clip): Render-Protokoll (Zeit, Ton, Länge), Rechnung, Festschreiben, MIDI-Bytes gleich wie 4.88 – ' + keys.length + ' Fälle, ' + keys.reduce((s, k) => s + ra[k].log.length, 0) + ' Noten', diff.slice(0, 3));
    const dd = (() => { const x = ra.datei, y = rn.datei; if (x === y) return null; let k = 0; while (x[k] === y[k]) k++; return [x.slice(k - 60, k + 60), y.slice(k - 60, k + 60)]; })();
    ok(ra.datei === rn.datei, 'A2 Projektdatei mit Gate 100 % bytegleich zu 4.88 (ohne Zufalls-Kennungen)', dd);
    ok(JSON.stringify(ra.norm) === JSON.stringify(rn.norm), 'A3 Bereinigen alter Werte (100, 5, 3, leer, 80.4) wie 4.88', rn.norm.map(x => x.g));
    await pa.close();
    const r = await run(pn, caseB);
    const c = r['akkord/100'], d = r['akkord/150'], e = r['akkord/200'];
    ok(c.durs.join() === '0.25' && c.ov === 0, 'B1 Gate 100 %: Noten 0,25 Schlag (1/16), keine Überlappung', c);
    ok(d.durs.join() === '0.375' && d.ov === d.n - 1 && d.plan && d.last[2] === .25, 'B2 Gate 150 %: Noten 0,375 Schlag, jede überlappt die nächste um 1/32; letzte Note endet am Takt, wo derselbe Ton neu beginnt; Planer = Rechnung', {durs: d.durs, ov: d.ov, n: d.n, last: d.last});
    ok(e.durs.join() === '0.5' && e.ov === e.n - 1 && e.sameOv === 0 && e.plan, 'B3 Gate 200 %: Noten 0,5 Schlag (bis zum übernächsten Schritt), überlappen; Planer = Rechnung', {durs: e.durs, ov: e.ov, n: e.n, last: e.last});
    const o1 = r['einton/200'];
    ok(o1.durs.join() === '0.25' && o1.sameOv === 0 && o1.midiSame === 0 && o1.plan, 'B4 Gate 200 % mit einem Ton: gleiche Tonhöhe endet beim Neuanschlag (keine Doppel-Stimme, MIDI sauber)', o1);
    ok(d.midi.join() === '0.375' && e.midi.join() === '0.5' && d.midiSame === 0 && e.midiSame === 0, 'B5 MIDI-Export übernimmt die längeren Noten (150 %: 0,375 · 200 %: 0,5 Schlag)', {m150: d.midi, m200: e.midi});
    ok(d.bake.join() === '0.375' && e.bake.join() === '0.5' && r.baked.n > 0 && r.baked.d.join() === '0.375' && r.baked.end && r.baked.arpOff, 'B6 „In den Clip schreiben“ übernimmt die längeren Noten', r.baked);
    const k1 = r['lp/poly/100'], k2 = r['lp/poly/200'], j1 = r['lp/einton/100'], j2 = r['lp/einton/200'], m1 = r['mono/100'].click, m2 = r['mono/200'].click;
    ok(k1 && k2 && !k2.nan && k2.d2 <= Math.max(k1.d2 * 1.5, .02) && k2.pk < 1, 'B7 Render ohne Klicks (poly, Tiefpass 600 Hz): max. 2. Differenz/Spitze 200 % ' + k2.d2 + ' vs 100 % ' + k1.d2, {k1, k2});
    ok(j1 && j2 && !j2.nan && j2.d2 <= Math.max(j1.d2 * 1.5, .02), 'B7b Render ohne Klicks (ein Ton, Neuanschlag gleicher Tonhöhe): 200 % ' + j2.d2 + ' vs 100 % ' + j1.d2, {j1, j2});
    ok(m1 && m2 && !m2.nan && m2.d2 <= Math.max(m1.d2 * 1.5, .02) && m2.pk < 1, 'B8 Render ohne Klicks (mono-legato, gleitet): 200 % ' + m2.d2.toFixed(4) + ' vs 100 % ' + m1.d2.toFixed(4), {m1, m2});
    ok(r.load === 150, 'B9 Gate 150 % bleibt nach Sichern + Laden', r.load);
    await pn.close();
    // C: Bedienung per Tipp im Blatt (hochkant + quer), Fotos
    for (const [w, h, nm] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
      for (const [f, ver] of [[ALT, 'alt'], [NEU, 'neu']]) {
        if (ver === 'alt' && nm === 'quer') continue;
        const p = await page(f, w, h);
        await run(p, async () => { await host(); const i = va(); R.selT = i; A.set(i, {on: 1, m: 'auf', r: 16, g: 95}); A.open(i); await wait(500); });
        const btn = async s => p.evaluate(s => { const e = document.querySelector('.pop.a1pop ' + s); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, s);
        const g = () => p.evaluate(() => SYNQUENZER.arp1.get(R.selT).g);
        const txt = () => p.evaluate(() => { const e = document.querySelector('.pop.a1pop button[data-g="+"]'); const r = e && e.closest('.a1st'); return r ? {b: r.querySelector('b').textContent, s: r.querySelector('small').textContent, cutB: r.querySelector('b').scrollWidth > r.querySelector('b').clientWidth + .5, cutS: r.querySelector('small').scrollWidth > r.querySelector('small').clientWidth + .5} : null; });
        let q = await btn('button[data-g="+"]'); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(250);
        q = await btn('button[data-g="+"]'); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(250);
        const g1 = await g(), t1 = await txt();
        if (ver === 'alt') {
          ok(g1 === 100, 'C0 4.88 (' + nm + '): › endet bei 100 %', g1);
          await p.screenshot({path: path.join(here, 'foto-vorher.png')});
          await p.close(); continue;
        }
        ok(g1 === 105 && t1 && t1.b === '105 %' && t1.s === 'Legato', 'C1 ' + nm + ': 2× Tipp › von 95 % → 105 %, Anzeige „105 %“ + „Legato“', {g1, t1});
        for (let k = 0; k < 25; k++) { q = await btn('button[data-g="+"]'); await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(120); }
        const g2 = await g(), t2 = await txt();
        ok(g2 === 200 && t2.b === '200 %' && !t2.cutB && !t2.cutS, 'C2 ' + nm + ': weiter › endet bei 200 %, Text nicht abgeschnitten', {g2, t2});
        q = await btn('button[data-g="-"]'); for (let k = 0; k < 10; k++) { await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(120); }
        const g3 = await g(), t3 = await txt();
        ok(g3 === 150 && t3.b === '150 %' && t3.s === 'Legato', 'C3 ' + nm + ': 10× ‹ → 150 %', {g3, t3});
        q = await btn('button[data-g="-"]'); for (let k = 0; k < 10; k++) { await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(120); }
        const g4 = await g(), t4 = await txt();
        ok(g4 === 100 && t4.s === 'gebunden', 'C4 ' + nm + ': 10× ‹ → 100 % „gebunden“ wie bisher', {g4, t4});
        q = await btn('button[data-g="+"]'); for (let k = 0; k < 10; k++) { await p.touchscreen.tap(q.x, q.y); await p.waitForTimeout(120); }
        const lay = await p.evaluate(() => { const P = document.querySelector('.pop.a1pop'), r = P.getBoundingClientRect(), row = P.querySelector('button[data-g="+"]').closest('.a1r'), rr = row.getBoundingClientRect();
          const bs = [...row.querySelectorAll('button')].map(b => b.getBoundingClientRect()); const pg = [...P.querySelectorAll('button[data-g],button[data-sw]')].map(b => Math.round(b.getBoundingClientRect().left));
          return {inPop: rr.left >= r.left - .5 && rr.right <= r.right + .5, inView: r.left >= 0 && r.right <= innerWidth + .5, minBtn: Math.min(...bs.map(q => Math.min(q.width, q.height))), over: P.scrollWidth > P.clientWidth + 1, cols: pg}; });
        ok(lay.inPop && lay.inView && lay.minBtn >= 32 && !lay.over && lay.cols[0] === lay.cols[2] && lay.cols[1] === lay.cols[3], 'C5 ' + nm + ': Gate-Zeile im Blatt, Tasten ≥ 32 px, ‹ › bündig mit Swing, nichts läuft über', lay);
        await p.screenshot({path: path.join(here, nm === 'quer' ? 'foto-nachher-quer.png' : 'foto-nachher.png')});
        const ud = await p.evaluate(() => { const n = UNDO.length; undo(); return {g: SYNQUENZER.arp1.get(R.selT).g, n}; });
        ok(ud.g === 95, 'C6 ' + nm + ': ein ↶ nimmt die schnellen Gate-Tipps zurück (zurück auf 95 %)', ud);
        await p.close();
      }
    }
  } catch (e) { ok(false, 'Ausnahme', String(e && e.stack || e)); }
  ok(errs.length === 0, 'Z Keine Seitenfehler / console.error', errs.slice(0, 5));
  await b.close();
  console.log(fail ? 'FEHLER: ' + fail : 'ALLES OK');
  process.exit(fail ? 1 : 0);
})();
