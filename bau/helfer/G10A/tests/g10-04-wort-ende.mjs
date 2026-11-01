// G10-04: Take mit Wort 0,6 Takte über dem Ende → Toast „Letztes Wort ragt über das Ende – Clip +1 Takt?“. [Ja] → clip.len + 1, out = post.out + post.sec
// (ein Undo), hörbar bis zum Wortende. A: echter Weg (Fake-Mikro, ● REC in der Szene). B: Take aus PCM mit genau 0,6 Takten (und 0,2 Takten: kein Toast).
import {launch, open, micOn, waitBeat, idle, sleep, report, writeWav, voice, TMP, HERE} from './lib.mjs';
const R = report('G10-04');
const sr = 48000, wav = TMP + '/g10-04-ton.wav';
writeWav(wav, voice(247, 40, sr, .3, t => { const u = t % 4; return u < 3 ? Math.min(1, u / .01, (3 - u) / .02) : 0; }), sr);   // Wörter 3 s, Pausen 1 s
const br = await launch(wav);
const ctx = await br.newContext({viewport: {width: 428, height: 926}});
const {p, errs} = await open(br, {ctx});
const toastTxt = () => p.evaluate(() => { const t = document.getElementById('toast'); return t && t.classList.contains('show') ? t.textContent : ''; });
// Trefferfläche: der Knopf selbst + seine ::after-Fläche (Toast-Knöpfe der App: ≥ 44 × 44 px)
const tapJa = () => p.evaluate(() => { const b = [...document.querySelectorAll('#toast button')].find(x => /Ja/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); };
  return {x: cx, y: cy, w: r.width, h: r.height, hit44: hit(cx - 21.5, cy) && hit(cx + 21.5, cy) && hit(cx, cy - 21.5) && hit(cx, cy + 21.5)}; });
// ---- A: echter Weg ----
await p.evaluate(async () => { SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400)); });
await micOn(p, 'wired');
// Die Lage des Wortes zum Taktstrich ist zufällig (die Datei läuft frei): ● REC in neuen Szenen, bis ein Take über das Ende ragt (≤ 6 Versuche)
await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 1);
const tries = [];
for (let k = 0; k < 6; k++) {
  const prevId = await p.evaluate(() => { const x = SYNQUENZER.g10aInfo().post; return x ? x.id : null; });
  const b0 = await p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
  await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, Math.ceil(b0 / 4) * 4 + 1.2); await p.evaluate(() => SYNQUENZER.rec());
  await p.waitForFunction(id => { const x = SYNQUENZER.g10aInfo().post; return x && x.id !== id; }, prevId, {timeout: 20000}).catch(() => {});
  const x = await p.evaluate(() => SYNQUENZER.g10aInfo().post);
  tries.push(x ? {sec: x.sec, asked: x.asked} : null);
  if (x && x.asked) break;
}
R.check('A: Versuche (echter Weg)', true, tries);
const pa = await p.evaluate(() => SYNQUENZER.g10aInfo().post);
const ta = await toastTxt();
R.check('A: Ausklang > ⅓ Takt erkannt, Toast mit Frage', pa && pa.asked && /Letztes Wort ragt über das Ende – Clip \+1 Takt\?/.test(ta), {post: pa, toast: ta});
await p.screenshot({path: HERE + '/bilder/g10-04-toast-428x926.png'});
const ja = await tapJa();
R.check('A: [Ja] Trefferfläche ≥ 44 × 44 px', ja && ja.hit44, ja);
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const c0 = await p.evaluate(s => SYNQUENZER.project().tracks[s].clips.find(c => c && c.audio), st);
if (ja) { await p.mouse.click(ja.x, ja.y); await sleep(300); }
const c1 = await p.evaluate(s => SYNQUENZER.project().tracks[s].clips.find(c => c && c.audio), st);
const pm = await p.evaluate(id => SYNQUENZER.takes()[id].post, c0.audio.take);
R.check('A: [Ja] → clip.len + 1', c1.len === c0.len + 1, [c0.len, c1.len]);
R.check('A: out = post.out + post.sec', Math.abs(c1.audio.out - (pm.out + pm.sec)) < 2e-6, {out: c1.audio.out, post: pm});
R.check('A: genau ein Undo-Schritt', await p.evaluate(() => SYNQUENZER.undoInfo()).then(u => u.n === u0 + 1 && /\+1 Takt/.test(u.top.label)));
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
const c2 = await p.evaluate(s => SYNQUENZER.project().tracks[s].clips.find(c => c && c.audio), st);
R.check('A: ↶ stellt Länge und Ende wieder her', c2.len === c0.len && c2.audio.out === c0.audio.out);
await p.evaluate(() => SYNQUENZER.stop()); await idle(p);

// ---- B: Take aus PCM, Wort genau 0,6 bzw. 0,2 Takte über dem Ende ----
async function caseB(wordBars, scene) {
  const bar = 2.0, pcm = [];                                         // 120 BPM: 1 Takt = 2 s
  // Takt 1: 247 Hz, das überstehende Wortende: 330 Hz (so ist im Render unterscheidbar, ob das Wortende oder der Clip-Anfang klingt)
  const W = bar + wordBars * bar, word = voice(247, W, sr, .35, t => Math.min(1, t / .01, (W - t) / .02)), hi = voice(330, W, sr, .35, t => Math.min(1, t / .01, (W - t) / .02));
  for (let k = 0; k < word.length; k++) pcm.push(Math.round((k < bar * sr ? word[k] : hi[k]) * 32767));
  for (let k = 0; k < 2 * sr; k++) pcm.push(0);
  const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm, sr, scene, len: 1});
  const io = Math.round(bar * sr), ps = await p.evaluate(([x, io]) => SYNQUENZER.g3PostSec(x, io, 48000), [pcm, io]);
  await p.evaluate(o => SYNQUENZER.g10aTestSeg(o), {track: inj.track, scene, in: 0, out: bar, at: 0, post: {out: bar, sec: ps}});
  await p.evaluate(([id, t, s]) => { SYNQUENZER.g10aWatch(id, t, s); return SYNQUENZER.g10aPostCheck(id); }, [inj.id, inj.track, scene]);
  return {inj, ps, pcm, info: await p.evaluate(() => SYNQUENZER.g10aInfo().post), toast: await toastTxt()};
}
const b2 = await caseB(.2, 2);
R.check('B: Wort 0,2 Takte → kein Toast', b2.info && !b2.info.asked && !/Letztes Wort/.test(b2.toast), {sec: b2.ps, info: b2.info});
await sleep(300);
const b6 = await caseB(.6, 1);
R.check('B: Ausklang gemessen ≈ 0,6 Takte (G3)', Math.abs(b6.ps - 1.2) < .08, b6.ps);
R.check('B: Wort 0,6 Takte → Toast', b6.info && b6.info.asked && /Letztes Wort ragt über das Ende/.test(b6.toast), b6.info);
const jb = await tapJa(); if (jb) { await p.mouse.click(jb.x, jb.y); await sleep(300); }
const cb = await p.evaluate(([t, s]) => SYNQUENZER.project().tracks[t].clips[s], [b6.inj.track, 1]);
R.check('B: [Ja] → 2 Takte, out = 2 s + Ausklang', cb.len === 2 && Math.abs(cb.audio.out - (2 + b6.ps)) < 2e-6, {len: cb.len, out: cb.audio.out});
// hörbar bis zum Wortende: der Song spielt den Clip (Szene 2) 2 Takte; im Render liegt der Take bis zum Wortende
await p.evaluate(([t]) => { const lanes = Array.from({length: 8}, () => []); lanes[t] = [{bar: 0, slot: 1}]; return SYNQUENZER.setSong({bars: 2, lanes}); }, [b6.inj.track]);
await idle(p);
const plan = await p.evaluate(async id => { const m = SYNQUENZER.takes()[id]; const a = await SYNQUENZER.tkPcmRange(id, 0, m.len), b = SYNQUENZER.tkBufRange(id, 0, m.len); let same = !!(a && b) && a.length === b.length; if (same) for (let k = 0; k < a.length; k++) if (Math.fround(a[k] * (1 / 32767)) !== b[k]) { same = false; break; } return {same, n: a ? a.length : 0}; }, b6.inj.id);
R.check('B: Puffer der Wiedergabe = Take-Samples (bitgleich)', plan.same, plan);
const rr = await p.evaluate(() => SYNQUENZER.vvRender({}));
const pc = await p.evaluate(() => SYNQUENZER.vvPcm(0, 4.6));
const buf = Buffer.from(pc.b64, 'base64'), L = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2).filter((_, i) => i % 2 === 0);
const win = (a, b) => { let s = 0; const i0 = Math.round(a * pc.sr), i1 = Math.round(b * pc.sr); for (let k = i0; k < i1; k++) s += (L[k] / 32768) ** 2; return 10 * Math.log10(s / (i1 - i0) + 1e-20); };
const pitch = (a, b) => { const i0 = Math.round(a * pc.sr), n = Math.round((b - a) * pc.sr); let best = 0, bl = 0; for (let l = 96; l < 400; l++) { let x = 0; for (let k = 0; k < n - l; k += 2) x += L[i0 + k] * L[i0 + k + l]; if (x > best) { best = x; bl = l; } } return pc.sr / bl; };
const inWord = win(2.15, 3.1), f2 = pitch(2.3, 2.9), f1 = pitch(.5, 1.5);
R.check('B: Render Takt 2 = Wortende des Takes (330 Hz, nicht der Clip-Anfang 247 Hz)', Math.abs(f2 - 330) < 6 && Math.abs(f1 - 247) < 6 && inWord > -35, {f1: +f1.toFixed(1), f2: +f2.toFixed(1), inWord: +inWord.toFixed(1)});
const g = await p.evaluate(([t]) => { const c = SYNQUENZER.project().tracks[t].clips[1], a = c.audio, sp = .5; return {segEnd: +(a.at + (a.out - a.in) / sp).toFixed(4), L: c.len * 4}; }, [b6.inj.track]);
R.check('B: das Stück reicht bis zum Wortende im Clip (≤ Clip-Ende)', g.segEnd <= g.L + 1e-3 && g.segEnd > 4 + 2 * .55, g);
R.check('keine Seitenfehler', errs.length === 0, errs.slice(0, 3));
await br.close(); R.done();
