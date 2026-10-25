// V2d′ test helpers: the song from song-delta 5.5 (+ Fläche with a note in every bar, so every bar is audible), optional „nach Einfügen“
import { SETUP55 } from './v3-v2d-lib.mjs';
export const SETUP = (ins) => `(() => { ${SETUP55};
  const Q = window.SYNQUENZER, K = {root: 9, scale: 'aeolian'};
  Q.setClip(1, 1, {len: 4, key: K, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 4, d: 1, n: 62, v: .8}, {t: 8, d: 1, n: 64, v: .8}, {t: 12, d: 1, n: 65, v: .8}]});
  Q.setClip(1, 3, {len: 1, key: K, notes: [{t: 0, d: .5, n: 67, v: .8}, {t: 2, d: .5, n: 67, v: .8}]});
  ${ins ? "Q.placePart(0, 2, 'insert');" : ''}
  Q.setBpm(240); Q.clearLog(); return 1; })()`;
export const clipsJSON = `(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify(P.tracks.map(t => t.clips)); })()`;
export const projJSON = `(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify({song: P.song, parts: P.parts, tracks: P.tracks.map(t => t.clips)}); })()`;
// wait until the audible song beat reaches x (polling 5 ms)
export async function waitSong(p, x, timeout = 30000) {
  await p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, x, {timeout, polling: 5});
}
export async function waitBeat(p, x, timeout = 30000) {
  await p.waitForFunction(v => window.SYNQUENZER.runtime().beat >= v, x, {timeout, polling: 5});
}
// a live note on the selected track at the current moment (SPIELEN), held ms
export async function note(p, n, ms = 150) {
  await p.evaluate(x => window.SYNQUENZER.keyOn(x, .8, 'tn' + x), n);
  await p.waitForTimeout(ms);
  await p.evaluate(x => window.SYNQUENZER.keyOff(x, 'tn' + x), n);
}
// noteLog of the song playing from bar 0 for `beats` song beats (fresh playback)
export async function playLog(p, upTo, track) {
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, upTo, 40000);
  const log = await p.evaluate(t => window.SYNQUENZER.noteLog(1500).filter(n => t == null || n.track === t), track);
  await p.evaluate(() => window.SYNQUENZER.songPlay(false));
  await p.waitForTimeout(150);
  return log;
}
