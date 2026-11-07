// Gegenprobe (nicht A2): Drum-Chance (note.p) im ganzen Inhalt nach Konsolidieren
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true});
await p.goto('file://' + process.argv[2]); await p.waitForFunction(() => window.SYNQUENZER); await p.waitForTimeout(600);
await p.touchscreen.tap(5, 300); await p.waitForTimeout(200);
const r = await p.evaluate(async () => {
  const A = SYNQUENZER; ensureAudio(); for (let k = 0; k < 40 && AU.ctx.state !== 'running'; k++) await new Promise(r => setTimeout(r, 50));
  if (R.playing) stop(); A.setMetronome(false); A.setBpm(240); S.settings.countIn = 0; A.resetCarrier();
  for (const tr of S.tracks) tr.clips = tr.clips.map(() => null); partsEnsure(); S.parts = S.parts.map(() => null);
  S.tracks[DRUM_T].clips[0] = normClip({len: 1, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: t % 1 ? 42 : 36, v: .9, p: .5}))}, 'drum', S.key);
  const nt = NT(), lanes = Array.from({length: nt}, () => []); lanes[DRUM_T] = [{bar: 0, slot: 0}];
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: 4, name: 'S'}]});
  A.makeOwn(DRUM_T, 1, false); const o = ownRun(S.song, DRUM_T, 1); S.song.own[o.o.own].notes.push({t: 3.75, d: .1, n: 38, v: .9});
  restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged();
  const cap = (start, beats) => { if (R.playing) stop(); if (R.songPlay) songPlayEnd(true); const ev = [], o = drumHit; drumHit = (n, v, t) => { ev.push(n + '@' + (+t2b(t).toFixed(3))); return null; }; try { start(); for (let h = .02; h < 60 && R.playing && R.schedBeat < beats + .5; h += .02) tick(h); } finally { stop(); if (R.songPlay) songPlayEnd(true); drumHit = o; } return ev.filter(x => +x.split('@')[1] < beats - 1e-6).sort(); };
  const s0 = cap(() => songPlayStart(0), 16); const r = A.konsolidieren(0, 3, 'K'); const p1 = cap(() => launchPart(r.part), 16);
  return {ext: r.ext, same: JSON.stringify(s0) === JSON.stringify(p1), n0: s0.length, n1: p1.length};
});
console.log(JSON.stringify(r)); await b.close();
