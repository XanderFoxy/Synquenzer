// LT1 (nach Prüfer-Befund 1, aus pruef/p-imp.mjs): zusätzlich Audio-Vergleich (AudioBuffer + gespeicherte Stücke je Take) und Vorbereitungs-Treffer.
// Prüfer LT1: Import-Ablegen A/B (index vs basis) in Randfällen – Zustand + Raster-DOM gleich? Long Tasks, Dauer, Konsolenfehler, ↶/↷.
// Aufruf: node p-imp.mjs <index.html> <basis.html>   ENV: VIEWS=926x428,428x926  CASES=s1,s2,...  REPS=1
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import crypto from 'node:crypto';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]);
const files = {'/a.html': A, '/b.html': B};
const srv = http.createServer((q, r) => { const p = files[q.url.split('?')[0]]; if (!p) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const VIEWS = (process.env.VIEWS || '926x428,428x926').split(',').map(s => s.split('x').map(Number));
const REPS = +(process.env.REPS || 1);
const NX1 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/nach/nx1-test.mjs';
const T = fs.readFileSync(NX1, 'utf8'), i0 = T.indexOf('const SONG = (o) => {'), SONG = T.slice(i0 + 'const SONG = '.length, T.indexOf('\n  };', i0) + 4);
// Fälle: Liste von Imports nacheinander (der letzte wird gemessen), optional pre-Aktion
const CASES = {
  s1: {d: 'scenes 48k 8 Takte (neu)', imp: [{sr: 48000, bpm: 96, bars: 8, kind: 'scenes'}]},
  s2: {d: 'track 44,1k 2 Takte kurz', imp: [{sr: 44100, bpm: 120, bars: 2, kind: 'track'}]},
  s3: {d: 'loop 44,1k 16 Takte', imp: [{sr: 44100, bpm: 100, bars: 16, kind: 'loop', loop: [4, 8]}]},
  s4: {d: 'vox 48k 8 Takte', imp: [{sr: 48000, bpm: 96, bars: 8, kind: 'vox'}]},
  s5: {d: '2. Import scenes (Original da)', imp: [{sr: 48000, bpm: 96, bars: 8, kind: 'scenes'}, {sr: 48000, bpm: 96, bars: 4, kind: 'scenes'}]},
  s6: {d: 'scenes 44,1k 48 Takte lang', imp: [{sr: 44100, bpm: 140, bars: 48, kind: 'scenes'}]},
  s7: {d: 'Spuren voll → leere Zusatzspur', pre: 'full', imp: [{sr: 48000, bpm: 96, bars: 8, kind: 'scenes'}]},
  s8: {d: 'während Wiedergabe', pre: 'play', imp: [{sr: 44100, bpm: 96, bars: 8, kind: 'track'}]},
  s10: {d: 'scenes 44,1k 90 Takte (3 min) realistisch', imp: [{sr: 44100, bpm: 120, bars: 90, kind: 'scenes'}]},
  s11: {d: 'track 48k 64 Takte', imp: [{sr: 48000, bpm: 128, bars: 64, kind: 'track'}]},
  s9: {d: 'anderes Tempo → nx1 dehnt, legt später ab', imp: [{sr: 48000, bpm: 96, bars: 4, kind: 'scenes'}, {sr: 44100, bpm: 120, bars: 4, kind: 'track'}]},
};
const ONLY = (process.env.CASES || Object.keys(CASES).join(',')).split(',');
const b = await chromium.launch({args: ['--disable-renderer-backgrounding', '--enable-blink-features=LongAnimationFrameTiming']});
const out = [];
const sig = p => p.evaluate(() => {
  const t = (S.tracks || []).map(t => ({nm: t.name, k: t.kind, o: !!t.orig, st: !!t.stimme, m: !!t.mute, c: t.clips.map(c => c && {len: c.len, ts: c.ts || null, a: c.audio && [c.audio.in, c.audio.out, c.audio.at], n: c.notes.length})}));
  const s = S.song ? {bars: S.song.bars, lanes: S.song.lanes.map(l => l.map(e => [e.bar, e.slot, !!e.own])), own: Object.keys(S.song.own || {}).length, marks: JSON.stringify(S.song.marks || null), vox: (S.song.vox || []).map(v => [v.bar, v.len, v.in, v.out])} : null;
  const d = JSON.stringify({bpm: S.bpm, ts: S.ts || null, t, s, takes: Object.keys(S.takes || {}).length, order: S.ui && S.ui.order, selT: R.selT, mx: [MX.cols, MX.rows.join(','), MX.bankT, MX.bankS, MX.nrows]});
  const g = EL.grid.innerHTML.replace(/ style="[^"]*"/g, m => m);   // ganzes Raster-DOM
  const h = s => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return (x >>> 0).toString(16); };
  const sv = document.querySelector('#songView, .songview, #sv') ;
  return {data: h(d), grid: h(g) + '/' + EL.grid.querySelectorAll('*').length, dataLen: d.length, cnw: !!UI.cnw && UI.cnw.isConnected, heads: UI.heads.length, svd: sv ? h(sv.innerHTML) : '-'};
});
for (const [W, H] of VIEWS) for (const cn of ONLY) for (let rep = 0; rep < REPS; rep++) {
  const C = CASES[cn], order = rep % 2 ? ['b', 'a'] : ['a', 'b'];
  for (const f of order) {
    const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(base + '/' + f + '.html');
    await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({type: 'longtask', buffered: true}); });
    await p.waitForFunction(() => window.SYNQUENZER && window.__imp1 && window.__imp1.ui, null, {timeout: 120000}); await p.waitForTimeout(800);
    await p.mouse.click(5, H - 5).catch(() => {}); await p.waitForTimeout(400);   // Ton-Start vor der Messung
    const row = {view: W + 'x' + H, cn, rep, file: f === 'a' ? 'index' : 'basis', load: os.loadavg()[0].toFixed(2)};
    try {
      if (C.pre === 'full') row.pre = await p.evaluate(() => { let n = 0; while (canAddTrack() && n < 10) { addTrack(); n++; } return NT(); });
      if (C.pre === 'play') row.pre = await p.evaluate(async () => { try { await ensureAudio(); } catch (e) {} if (!R.playing && typeof togglePlay === 'function') togglePlay(); else if (!R.playing && typeof startPlay === 'function') startPlay(); return !!R.playing; });
      for (let k = 0; k < C.imp.length; k++) {
        const I = C.imp[k], last = k === C.imp.length - 1;
        await p.evaluate(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const SONG = ${SONG}; const {buf} = SONG({sr: ${I.sr}, bpm: ${I.bpm}, bars: ${I.bars}, t0: 0}); IMP1.known = ${I.bpm};
          await window.__imp1.ui.file(buf, 'lied${k}.wav'); for (let i = 0; i < 900 && !(IMP1.cur && IMP1.cur.st === 'fertig'); i++) await wait(50); })()`);
        const tf = await p.evaluate(() => performance.now());   // ab „fertig“: Vorbereitung im Leerlauf
        if (I.loop) await p.evaluate(l => window.__imp1.ui.loop(l[0], l[1]), I.loop);
        await p.waitForTimeout(1200);
        const t0 = await p.evaluate(() => performance.now());
        const r0 = await p.evaluate(k => { const t = performance.now(); let r; try { r = window.__imp1.ui.place(k); } catch (e) { return {ms: -1, err: String(e)}; } return {ms: Math.round(performance.now() - t), ok: r === null ? null : !!r, skip: typeof LT1 !== 'undefined' ? LT1.skip : '-'}; }, I.kind);
        if (r0.ok === null) { for (let i = 0; i < 200; i++) { await p.waitForTimeout(100); const ok = await p.evaluate(() => !!IMP1.lastPlace && !(typeof imp1Busy === 'function' && imp1Busy())); if (ok) break; } r0.later = true; r0.skip = await p.evaluate(() => typeof LT1 !== 'undefined' ? LT1.skip : '-'); }
        await p.waitForTimeout(2000);
        if (last) {
          row.place = r0; row.lt = await p.evaluate(t0 => window.__lt.filter(e => e.t >= t0 && e.d > 50).map(e => Math.round(e.d)), t0);
          row.ltPre = await p.evaluate(([a, b]) => window.__lt.filter(e => e.t >= a && e.t < b && e.d > 50).map(e => Math.round(e.d)), [tf, t0]);
          row.aud = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 100 && TK.writes > 0; i++) await w(50);
            const h = a => { let x = 2166136261; for (let i = 0; i < a.length; i++) { x ^= a[i]; x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
            const ids = Object.keys(S.takes || {}), out = [];
            for (const id of ids) { const m = S.takes[id], b = TK.buf.get(id); const pc = await tkPcm(id);
              out.push([m.len, m.sr, m.route, m.name, JSON.stringify(m.imp || null), m.chunks.length, b ? b.length + ':' + b.sampleRate + ':' + h(new Uint32Array(b.getChannelData(0).buffer, b.getChannelData(0).byteOffset, b.length)) : '-', pc ? h(new Uint16Array(pc.buffer, pc.byteOffset, pc.length)) : '-']); }
            out.sort((a, b) => a[0] - b[0]); return {t: out, hit: typeof LT1 !== "undefined" ? [LT1.preOk || 0, LT1.preHit || 0, LT1.preMs || 0] : "-"}; });
          if (process.env.STOP) { await p.evaluate(() => { if (R.playing) togglePlay(); }); await p.waitForTimeout(1500); }
          row.after = await sig(p);
          row.undo = await p.evaluate(() => { undo(); return 1; }); await p.waitForTimeout(1200); row.afterUndo = await sig(p);
          await p.evaluate(() => { redo(); }); await p.waitForTimeout(1200); row.afterRedo = await sig(p);
          row.place2 = await p.evaluate(() => JSON.stringify(IMP1.lastPlace ? Object.keys(IMP1.lastPlace).sort() : null));
        }
      }
    } catch (e) { row.err = String(e).slice(0, 300); }
    row.errs = errs.slice(0, 4);
    out.push(row);
    console.log(`${row.view} ${cn} rep${rep} ${row.file.padEnd(5)} aud=${JSON.stringify(row.aud)} place=${JSON.stringify(row.place)} lt=${JSON.stringify(row.lt)} ltPre=${JSON.stringify(row.ltPre)} after=${JSON.stringify(row.after)} undo=${JSON.stringify(row.afterUndo)} redo=${JSON.stringify(row.afterRedo)} pre=${row.pre} last=${row.load}` + (row.err ? ' ERR ' + row.err : '') + (errs.length ? ' KONSOLE ' + JSON.stringify(errs) : ''));
    await ctx.close();
  }
}
await b.close(); srv.close();
console.log('\nVERGLEICH');
for (const [W, H] of VIEWS) for (const cn of ONLY) {
  const v = W + 'x' + H, ri = out.filter(o => o.view === v && o.cn === cn && o.file === 'index'), rb = out.filter(o => o.view === v && o.cn === cn && o.file === 'basis');
  const k = o => JSON.stringify([o.aud && o.aud.t, o.after && o.after.data, o.after && o.after.grid, o.afterUndo && o.afterUndo.data, o.afterUndo && o.afterUndo.grid, o.afterRedo && o.afterRedo.data, o.afterRedo && o.afterRedo.grid]);
  const same = ri.length && rb.length && ri.every(o => k(o) === k(rb[0])) && rb.every(o => k(o) === k(rb[0]));
  console.log(`${v} ${cn} (${CASES[cn].d}): gleich=${same} hit(index)=${JSON.stringify(ri.map(o => o.aud && o.aud.hit))} skip(index)=${ri.map(o => o.place && o.place.skip)} ms index=${ri.map(o => o.place && o.place.ms)} basis=${rb.map(o => o.place && o.place.ms)} lt index=${JSON.stringify(ri.map(o => o.lt))} basis=${JSON.stringify(rb.map(o => o.lt))} ltPre index=${JSON.stringify(ri.map(o => o.ltPre))} basis=${JSON.stringify(rb.map(o => o.ltPre))} errs=${ri.concat(rb).reduce((s, o) => s + o.errs.length, 0)}`);
}
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), process.env.OUT || 'p-imp.json'), JSON.stringify(out, null, 1));
