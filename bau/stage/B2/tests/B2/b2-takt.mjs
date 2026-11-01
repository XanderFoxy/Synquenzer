// Stage B2: Taktarten (T1) × die anderen Pakete – rechnen V6A (Gleiten über Teil-Länge, Song-Kante), Übergänge (UE an Teilkanten,
// Einwürfe beim Verschieben), G10A (Wort über dem Ende) und BM8 (Melodie-Kurven beim Verschieben) bei 3/4, 6/8 und 7/8 richtig?
// Aufruf: node b2-takt.mjs [index.html]
import { chromium } from 'playwright';
import path from 'path';
const HERE = path.dirname(new URL(import.meta.url).pathname);
const APP = process.argv[2] || path.resolve(HERE, '../../index.html');
let fails = 0; const ok = (c, id, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + JSON.stringify(info).slice(0, 260) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1200);
await p.evaluate(async () => { SYNQUENZER.stop(); try { ensureAudio(); } catch (e) {} for (let k = 0; k < 100 && !(typeof wkReady === 'function' && wkReady()); k++) await new Promise(r => setTimeout(r, 50)); });
const TS = ['3/4', '6/8', '7/8'];

console.log('A  V6A: 1 T / 2 T = Schläge der Taktart (Matrix, ohne Song)');
for (const ts of TS) {
  const r = await p.evaluate(ts => { SYNQUENZER.newProject({init: true}); SYNQUENZER.setSongTs(ts, {quiet: true}); const sp = spb(), a = v6aTimes({x: 'bar1'}, 0, 0), c = v6aTimes({x: 'bar2'}, 0, 0); return {soll: tsBeats(ts), bar1: +((a.t1 - a.t0) / sp).toFixed(4), bar2: +((c.t1 - c.t0) / sp).toFixed(4)}; }, ts);
  ok(Math.abs(r.bar1 - r.soll) < 1e-3 && Math.abs(r.bar2 - 2 * r.soll) < 1e-3, `V6A ${ts}: 1 T = ${r.soll} Schläge, 2 T = ${2 * r.soll}`, r);
}

console.log('B  V6A: Song-Kante in einen 7/8-Teil – „1 T“ gleitet 3,5 Schläge, „kurz“ beginnt 1 Schlag vor dem Taktstrich');
for (const [x, ts] of [['bar1', '7/8'], ['flow', '7/8'], ['bar2', '3/4'], ['flow', '6/8']]) {
  const r = await p.evaluate(async ([x, ts]) => {
    const Q = SYNQUENZER; Q.newProject({init: true}); await new Promise(r => setTimeout(r, 200));
    const t = S.tracks.findIndex(q => q.kind === 'synth' && !q.stimme); Q.setEngine(t, 'va');
    for (let i = 0; i < S.tracks.length; i++) if (i !== t) for (let s = 0; s < 8; s++) if (S.tracks[i].clips[s]) Q.setClip(i, s, null);
    const notes = [{t: 0, d: 3.9, n: 57, v: .8}];
    Q.setClip(t, 0, {len: 1, notes, key: {root: 0, scale: 'ionian'}}); Q.setClip(t, 1, {len: 1, notes, key: {root: 0, scale: 'ionian'}});
    Q.setBpm(120);
    Q.v6aSetState(t, 1, {p: {cutoff: 400}, fx: {vol: .3}});   // fx: die Fahrt der Spur-Werte steht in v6aInfo().run (Zeiten wie im Worklet)
    Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    const m2 = S.song.marks.find(m => m.a === 2); Q.setMarkTs(m2.id, ts, false); Q.v6aMarkGlide(m2.id, {x});
    Q.songPlay(0);
    const sp = spb(), edge = barBeat(2);
    let run = null; const T0 = performance.now();
    while (performance.now() - T0 < 9000) { await new Promise(r => setTimeout(r, 40)); const i = Q.v6aInfo(); const q = i.run[t]; if (q && q.t1 > q.t0 + .02) { run = q; break; } }
    const st = R.startTime; Q.stop();
    return run ? {edge, sp, t0B: +((run.t0 - st) / sp).toFixed(3), lenB: +((run.t1 - run.t0) / sp).toFixed(3), bl: barLen(2)} : {edge, none: true};
  }, [x, ts]);
  if (x === 'flow') ok(r.t0B != null && Math.abs(r.t0B - (r.edge - 1)) < .05 && Math.abs(r.lenB - 1) < .05, `V6A Song-Kante „kurz“ in ${ts}: Beginn 1 Schlag vor Takt 3 (Schlag ${r.edge})`, r);
  else ok(r.t0B != null && Math.abs(r.t0B - r.edge) < .05 && Math.abs(r.lenB - (x === 'bar1' ? 1 : 2) * r.bl) < .05, `V6A Song-Kante „${x === 'bar1' ? '1 T' : '2 T'}“ in ${ts}: ab Takt 3 (Schlag ${r.edge}), ${(x === 'bar1' ? 1 : 2) * r.bl} Schläge`, r);
}

console.log('C  Übergänge: Kante an Teilen mit Taktart, Treffer vor der Kante, Einwürfe beim Einfügen');
for (const ts of TS) {
  const r = await p.evaluate(async ts => {
    const Q = SYNQUENZER; Q.newProject({init: true}); await new Promise(r => setTimeout(r, 200));
    const ch = []; for (let s = 0; s < 3; s++) ch.push({scene: s, bars: 2}); Q.songFromChain(ch);
    for (const m of S.song.marks) Q.setMarkTs(m.id, ts, false);
    const m2 = S.song.marks.find(m => m.a === 2), m4 = S.song.marks.find(m => m.a === 4);
    const id = Q.uePlace('p-snare-lauf', m4.id); const e = Q.ueList().find(x => x.id === id) || Q.ueList()[0];
    const hits = Q.ueHits().filter(h => h.id === (e && e.id)), eb = barBeat(4);
    const inWin = hits.length > 0 && hits.every(h => h.sb >= eb + e.a - 1e-6 && h.sb <= eb + e.a + e.len + 1e-6);
    // Einwurf mitten in Takt 2 (Schlag barBeat(1) + 1), dann vorne 1 Takt einfügen → bleibt in seinem Takt (+ barLen)
    songEdit('Einwurf', s => { s.ue = (s.ue || []).concat([{id: 'U9', at: +(barBeat(1) + 1).toFixed(4), a: 0, len: 1, k: 'adlib', t: 'ue', notes: [{t: 0, d: .25, n: 50, v: .8}], mode: 'dazu', dens: 1, dir: 'gleich', src: 'test'}]); });
    const at0 = (S.song.ue || []).find(x => x.id === 'U9'); const a0 = at0 ? at0.at : null, bl = barLen(0);
    songEdit('Takt einfügen', s => songShift(s, 0, 1));
    const at1 = (S.song.ue || []).find(x => x.id === 'U9');   // der eingefügte Takt liegt vor jeder Marke → Song-Taktart; der Einwurf bleibt Takt 2 + 1 Schlag
    return {ts, eb, a: e && e.a, len: e && e.len, n: hits.length, inWin, first: hits[0] && hits[0].sb, a0, a1: at1 ? at1.at : null, soll: barBeat(2) + 1, bl};
  }, ts);
  ok(r.inWin, `UE ${ts}: Snare-Lauf liegt vor der Kante Takt 5 (Schlag ${r.eb}), alle ${r.n} Treffer im Fenster`, r);
  ok(r.a0 != null && r.a1 != null && Math.abs(r.a1 - r.soll) < 1e-6, `UE ${ts}: Einwurf bleibt beim Einfügen in seinem ${ts}-Takt (Takt 3 + 1 Schlag)`, r);
}

console.log('D  BM8: Melodie-Kurven rücken beim Einfügen mit der Taktkarte');
{
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; Q.newProject({init: true}); await new Promise(r => setTimeout(r, 200));
    Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); for (const m of S.song.marks) Q.setMarkTs(m.id, '3/4', false);
    const t = S.tracks.findIndex(q => q.kind === 'synth' && !q.stimme), mm = curMel(S.song) ? S.song.mel[t] || (S.song.mel[t] = melEmpty()) : null;
    const X = barBeat(1); mm.cv = cvNorm({bd: [[X, .25], [X + 1, .75]]}, 64 * 6); if (!mm.cv) return {skip: true};
    const before = JSON.stringify(mm.cv.bd);
    songEdit('Takt einfügen', s => songShift(s, 0, 1));
    const m2 = S.song.mel[t];
    const pt = m2.cv && m2.cv.bd && m2.cv.bd.find(q => Math.abs(q[0] - barBeat(2)) < 1e-6);   // der Punkt, der am Anfang von Takt 2 lag (X = 3)
    return {before, after: JSON.stringify(m2.cv && m2.cv.bd), pt, soll: barBeat(2), X};
  });
  ok(!r.skip && r.pt && Math.abs(r.pt[1] - .25) < 1e-9, 'BM8 3/4: Kurvenpunkt am Anfang von Takt 2 liegt nach dem Einfügen am Anfang von Takt 3', r);
}

console.log('E  G10A: Wort über dem Ende – Clip mit eigener Taktart (3/4 im 4/4-Song)');
{
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; Q.newProject({init: true}); await new Promise(r => setTimeout(r, 200));
    const sp = spb(), L = 2 * 3 * sp, n = Math.round(L * 48000);   // 2 Takte 3/4, Stille genügt
    const inj = await Q.tkInject({pcm: new Array(n + 4800).fill(0), sr: 48000, scene: 0, len: 2}); if (!inj) return {skip: 'tkInject'};
    const c = S.tracks[inj.track].clips[0]; c.ts = '3/4'; c.audio.in = 0; c.audio.out = +(L).toFixed(6); c.audio.at = 0;
    S.takes[inj.id].post = {out: c.audio.out, sec: .9};
    g10aPostWatch(inj.id, inj.track, 0);
    const x = g10aPostClip(inj.id);
    return x ? {full: true, lim: clipBarB(x.clip) * x.sp / 3, L: clipB(x.clip)} : {full: false};
  });
  ok(!r.skip && r.full && Math.abs(r.lim - .5) < 1e-6, 'G10A: ein 3/4-Clip gilt als „bis ans Ende gespielt“, Grenze = ⅓ Takt (3 Schläge)', r);
}
ok(errs.length === 0, 'keine Seitenfehler', errs.slice(0, 3));
await b.close();
console.log(fails ? `\n${fails} FEHLER` : '\nALLES GRÜN'); process.exit(fails ? 1 : 0);
