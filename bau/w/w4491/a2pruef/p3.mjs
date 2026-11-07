// Ohne LAUF / ohne Drum-Chance: Projekt-Daten nach dem Konsolidieren byte-gleich zur Basis. node p3.mjs <a.html> <b.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
const FILES = process.argv.slice(2, 4).map(f => path.resolve(f));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const SC = {
  X1: `mk(0, 1); mk(1, 2); dk(1, null); song(8, [[{bar:0,slot:0}],[{bar:0,slot:0}],[],[],[{bar:0,slot:0}]]); own(0, 3, 2.5, 80); own(4, 4, 1.5, 38); own(1, 2, 5.25, 77); return {ra:2, re:6};`,
  X2: `mk(0, 1); dk(1, n => { n[3].r = 2; n[5].a = 1; n[7].m = -.2; }); song(6, [[{bar:0,slot:0}],[],[],[],[{bar:0,slot:0}]]); own(4, 1, 2.5, 38); return {ra:0, re:4};`,
  X3: `mk(0, 2); song(6, [[{bar:0,slot:0}]]); own(0, 2, 6.5, 81); return {ra:1, re:5};`,
};
const out = {};
for (const F of FILES) for (const k of Object.keys(SC)) {
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + F); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(500);
  const r = await p.evaluate(([code]) => {
    const A = SYNQUENZER; A.resetCarrier();
    for (const tr of S.tracks) tr.clips = tr.clips.map(() => null);
    partsEnsure(); S.parts = S.parts.map(() => null);
    const sc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2];
    const mk = (t, len) => { const notes = Array.from({length: len * 8}, (_, i) => ({t: i * .5, d: .3, n: 55 + t * 5 + sc[i % 16], v: .5 + (i % 5) * .1})); const c = normClip({len, key: {root: 0, scale: 'major'}, notes}, 'synth', S.key); c.key.src = 'user'; S.tracks[t].clips[0] = normClip(cleanClip(c), 'synth', S.key); };
    const dk = (len, fx) => { const notes = []; for (let i = 0; i < len * 16; i++) notes.push({t: i * .25, d: .1, n: [36, 42, 38, 42][i % 4], v: .7 + (i % 3) * .1}); if (fx) fx(notes); S.tracks[DRUM_T].clips[0] = normClip({len, notes}, 'drum', S.key); };
    const song = (bars, ls) => { const lanes = Array.from({length: NT()}, (_, i) => ls[i] || []); A.setSong({bars, lanes, carrier: [], mel: {}, marks: []}); };
    const own = (t, bar, xt, xn) => { A.makeOwn(t, bar, false); const o = ownRun(S.song, t, bar), c = S.song.own[o.o.own]; c.notes.push({t: xt, d: .2, n: xn, v: .9}); c.notes.sort((u, v) => u.t - v.t); };
    const cfg = (new Function('A', 'mk', 'song', 'own', 'dk', code))(A, mk, song, own, dk);
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged();
    const r = A.konsolidieren(cfg.ra, cfg.re - 1, 'Kern');
    const js = JSON.parse(serializeProject());
    const pick = {tracks: js.tracks && js.tracks.map(t => t.clips), parts: js.parts, song: js.song};
    return {ext: r.ext, s: JSON.stringify(pick)};
  }, [SC[k]]);
  out[k] = out[k] || []; out[k].push({ext: r.ext, h: crypto.createHash('md5').update(r.s).digest('hex'), len: r.s.length, errs});
  await p.close();
}
for (const k of Object.keys(out)) console.log(k, JSON.stringify(out[k]), out[k][0].h === out[k][1].h ? 'GLEICH' : 'VERSCHIEDEN');
await b.close();
