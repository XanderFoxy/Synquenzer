// G10-02: leerer Song, 🎤, ● SONG, 8 Takte singen, ■ → song.vox mit 8 Takten; Undo entfernt Song und Stimme in einem Schritt; Laden deep-equal.
// Dazu: Abbruch vor Takt 1 → kein Take; ohne 🎤 wie bisher (kein vox).
import {launch, open, micOn, waitBeat, idle, sleep, report, deq, writeWav, voice, TMP} from './lib.mjs';
const R = report('G10-02');
const sr = 48000, wav = TMP + '/g10-02-ton.wav';
writeWav(wav, voice(220, 40, sr, .3), sr);                         // durchgehender „Gesang“ (die Datei läuft in Schleife)
const br = await launch(wav);
const ctx = await br.newContext({viewport: {width: 428, height: 926}});
let {p, errs} = await open(br, {ctx});
await p.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400)); });
// ohne 🎤: wie bisher
await p.evaluate(() => SYNQUENZER.songRec(true)); await waitBeat(p, 8.2);
await p.evaluate(() => SYNQUENZER.songRecEnd({beat: 8})); await sleep(300);
const s0 = await p.evaluate(() => ({song: SYNQUENZER.song(), last: SYNQUENZER.g10aInfo().last}));
R.check('ohne 🎤: Song 2 Takte, kein vox, G10a nicht beteiligt', s0.song && s0.song.bars === 2 && !s0.song.vox && !s0.last, {bars: s0.song && s0.song.bars, vox: s0.song && s0.song.vox});
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.undo(); });
await sleep(300);
R.check('ohne 🎤: ↶ → kein Song', await p.evaluate(() => SYNQUENZER.song() === null));
await micOn(p, 'wired');
// Abbruch vor Song-Takt 1 (läuft schon → Start am nächsten Taktstrich, sofort wieder gedrückt)
await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 1);
const nT0 = await p.evaluate(() => Object.keys(SYNQUENZER.takes()).length);
await p.evaluate(() => { SYNQUENZER.songRec(true); SYNQUENZER.songRecEnd(); }); await sleep(800);
const ab = await p.evaluate(() => ({n: Object.keys(SYNQUENZER.takes()).length, song: SYNQUENZER.song(), toast: document.getElementById('toast') && document.getElementById('toast').textContent, q: SYNQUENZER.tkInfo().quiet}));
R.check('Abbruch: kein Take, kein Song', ab.n === nT0 && ab.song === null, ab);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(1500);
// der eigentliche Fall
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const t0 = await p.evaluate(() => Object.keys(SYNQUENZER.takes()));
await p.evaluate(() => SYNQUENZER.songRec(true));
await sleep(300);
const toastStart = await p.evaluate(() => (document.getElementById('toast') || {}).textContent || '');
R.check('kein H8-Toast mehr beim Start', !/nicht aufgenommen/.test(toastStart), toastStart);
await waitBeat(p, 2);
const mid = await p.evaluate(() => ({last: SYNQUENZER.g10aInfo().last, q: SYNQUENZER.tkInfo().quiet}));
R.check('Stimme läuft ab Takt 1 mit (sr.vox, Netz-Ruhe „song“)', mid.last && mid.last.kind === 'songBegin' && mid.last.T === 0 && mid.q.includes('song'), mid);
await waitBeat(p, 32.3);
await p.evaluate(() => SYNQUENZER.songRecEnd({beat: 32}));
await sleep(200);
await idle(p);
const A = await p.evaluate(() => ({song: SYNQUENZER.song(), takes: SYNQUENZER.takes(), undo: SYNQUENZER.undoInfo(), proj: SYNQUENZER.project(), toast: (document.getElementById('toast') || {}).textContent || ''}));
const vox = A.song && A.song.vox, nt = Object.keys(A.takes).filter(k => !t0.includes(k));
R.check('Song 8 Takte', A.song && A.song.bars === 8, A.song && A.song.bars);
R.check('song.vox: ein Stück Takt 1–8', vox && vox.length === 1 && vox[0].bar === 0 && vox[0].len === 8, vox);
R.check('ein neuer Take (Quelle song)', nt.length === 1 && A.takes[nt[0]].src === 'song', nt.map(k => A.takes[k].src));
const tk = A.takes[nt[0]], sec = 32 * 0.5;
R.check('Take deckt 8 Takte (out − in ≈ 16 s bei 120 BPM)', vox && Math.abs(vox[0].out - vox[0].in - sec) < .1, vox && +(vox[0].out - vox[0].in).toFixed(3));
R.check('genau ein Undo-Schritt dazu', A.undo.n === u0 + 1, {n: A.undo.n, u0, top: A.undo.top});
R.check('Endmeldung nennt die Stimme', /Stimme/.test(A.toast), A.toast);
await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
await p.evaluate(() => SYNQUENZER.undo()); await sleep(400);
const U = await p.evaluate(() => ({song: SYNQUENZER.song(), takes: Object.keys(SYNQUENZER.takes())}));
R.check('↶: Song und Stimme in einem Schritt weg', U.song === null && !U.takes.includes(nt[0]), U);
await p.evaluate(() => SYNQUENZER.redo()); await sleep(400);
const Rd = await p.evaluate(() => SYNQUENZER.project());
R.check('↷: Projekt wieder wie nach der Aufnahme (deep-equal)', deq(Rd, A.proj));
await p.evaluate(() => SYNQUENZER.save()); await sleep(800); await idle(p);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(1500);
const L = await p.evaluate(() => SYNQUENZER.project());
R.check('Laden: Projekt deep-equal', deq(L, A.proj), deq(L.song, A.proj.song) ? 'song gleich' : {a: A.proj.song && A.proj.song.vox, b: L.song && L.song.vox});
const hash = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), nt[0]);
R.check('Take-Audio nach dem Laden da', !!hash, hash);
const rms = await p.evaluate(async v => { const m = SYNQUENZER.takes()[v.take], a = Math.round(v.in * m.sr), x = await SYNQUENZER.tkPcmRange(v.take, a, a + Math.round(8 * m.sr)); let s = 0; for (const y of x) s += (y / 32768) ** 2; return 10 * Math.log10(s / x.length + 1e-20); }, vox[0]);
R.check('Take enthält den Gesang (RMS > −30 dBFS)', rms > -30, +rms.toFixed(1));
R.check('keine Seitenfehler', errs.length === 0, errs.slice(0, 3));
await br.close(); R.done();
