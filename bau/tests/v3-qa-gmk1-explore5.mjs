import {open, sleep, OUT} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
const r = await E(() => { const P = SYNQUENZER.project(); const pr = P.project || P; return {scenes: (pr.scenes || []).length, song: !!pr.song, bpm: pr.bpm, tracks: pr.tracks.map(t => ({k: t.kind, n: t.sound.name, clips: t.clips.map(c => c ? c.notes ? c.notes.length : (c.steps ? 'st' : 1) : 0)})), rt: Object.keys(SYNQUENZER.runtime())}; });
console.log(JSON.stringify(r));
const sc = await E(() => [...document.querySelectorAll('button.scn')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.x), Math.round(r.y)]; }));
console.log(JSON.stringify(sc));
await T.br.close();
