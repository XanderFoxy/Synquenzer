// Konsolidieren ohne LAUF: Projekt-Daten nach dem Konsolidieren (Clip, Teil, Song, Ursprung) Basis == A2 (byte-gleich)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const run = async (file, scen) => {
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true});
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER); await p.waitForTimeout(600);
  const r = await p.evaluate((scen) => {
    const A = SYNQUENZER; if (R.playing) stop(); A.setBpm(240); A.resetCarrier();
    for (const tr of S.tracks) tr.clips = tr.clips.map(() => null);
    partsEnsure(); S.parts = S.parts.map(() => null);
    const L1 = scen === 'S2' ? 2 : 1, sc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2];
    S.tracks[0].clips[0] = normClip({len: L1, key: {root: 2, scale: 'aeolian'}, notes: Array.from({length: L1 * 8}, (_, i) => ({t: i * .5, d: .25, n: 60 + sc[i % 16], v: .8}))}, 'synth', S.key);
    S.tracks[DRUM_T].clips[0] = normClip({len: 1, notes: [{t: 0, d: .25, n: 36, v: .9, p: .5}, {t: 2, d: .25, n: 38, v: .9, r: 2}]}, 'drum', S.key);
    const bars = scen === 'S2' ? 6 : 4, nt = NT(), lanes = Array.from({length: nt}, () => []); lanes[0] = [{bar: 0, slot: 0}]; lanes[DRUM_T] = [{bar: 0, slot: 0}];
    A.setSong({bars, lanes, carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: bars, name: 'Strophe'}]});
    const ob = scen === 'S2' ? 3 : 1; A.makeOwn(0, ob, false); const o = ownRun(S.song, 0, ob); S.song.own[o.o.own].notes.push({t: 3.75, d: .2, n: 84, v: .9});
    A.makeOwn(DRUM_T, ob, false); const od = ownRun(S.song, DRUM_T, ob); S.song.own[od.o.own].notes.push({t: 3.5, d: .2, n: 42, v: .9});
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged();
    const k = A.konsolidieren(scen === 'S2' ? 1 : 0, scen === 'S2' ? 4 : 3, 'Kern');
    const P = JSON.parse(serializeProject());
    return JSON.stringify({k, clips: P.tracks.map(t => t.clips), parts: P.parts, song: P.song, whole: [kl1Whole(S.tracks[0].clips[0], 0, 0), kl1Whole(S.tracks[DRUM_T].clips[0], DRUM_T, 0)].map(c => c && cleanClip(c))});
  }, scen);
  await p.close(); return r;
};
const B = process.argv[2], N = process.argv[3];
for (const sc of ['S1', 'S2']) { const x = await run(B, sc), y = await run(N, sc); console.log(sc, 'Basis == A2:', x === y, x.length, y.length); if (x !== y) { let i = 0; while (x[i] === y[i]) i++; console.log(x.slice(i - 80, i + 120)); console.log(y.slice(i - 80, i + 120)); } }
await b.close();
