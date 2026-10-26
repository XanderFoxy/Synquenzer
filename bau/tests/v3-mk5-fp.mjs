// MK5 Fach-Prüfung FP-SONG (data invariants, undo groups, save/load round trip, normMk clamps, harmony core untouched) and
// MK5-18 (AM with arp off and non-AM tracks: noteLog identical to 4.12.0 for the same clip playback). Usage: node v3-mk5-fp.mjs
import { chromium } from 'playwright';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = S + 'mk-br-MK5/index.html', BASE = S + 'mk5-base-4.12.0.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const J = x => JSON.stringify(x);
async function page(file) { const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); return {ctx, p, errs}; }
// 1. invariants, undo, round trip
{ const {ctx, p, errs} = await page(APP);
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); ensureAudio(); await sl(1200);
    Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.mkSet(0, 'arp.on', 1); Q.mkSet(1, 'arp.on', 1); Q.mkSet(1, 'arp.type', 4); Q.mkSet(1, 'arp.latch', 1);
    const clips0 = JSON.stringify(S.tracks.map(t => t.clips)), song0 = JSON.stringify(S.song);
    Q.launchScene(0); await sl(2500); Q.launchScene(1); await sl(2500); Q.stop(); await sl(200);
    const same = JSON.stringify(S.tracks.map(t => t.clips)) === clips0 && JSON.stringify(S.song) === song0;
    // undo groups: the ARP key and a step key = one undo each, undo restores, redo again
    Q.selectTrack(0); Q.openEditor(); await sl(300); MKUI.setWahl(2, 8);
    const u0 = Q.undoInfo().n, a0 = JSON.stringify(Q.mkGet(0).arp); MKUI.arpKey(); MKUI.stepKey(2); const u1 = Q.undoInfo().n, a1 = JSON.stringify(Q.mkGet(0).arp);
    Q.undo(); Q.undo(); const a2 = JSON.stringify(Q.mkGet(0).arp); Q.redo(); Q.redo(); const a3 = JSON.stringify(Q.mkGet(0).arp);
    // round trip: every arp field survives serialize / import
    const want = {on: 1, latch: 1, type: 3, range: 3, gate: 37, tgt: 2, ks: 1, res: 4, swing: -45, last: 5, steps: 0b10110101, tempo: 133};
    for (const k in want) mkSetP(0, 'arp.' + k, want[k], false);
    const txt = JSON.stringify(Q.serialize ? Q.serialize() : serialize()); await Q.importJSON(JSON.parse(txt)); await sl(300);
    const back = Q.mkGet(0) && Q.mkGet(0).arp;
    // normMk clamps an arp block from outside
    const cl = SQMK.normMk({arp: {on: 5, type: 9, range: 0, gate: 140, res: -3, swing: 400, last: 12, steps: 999, tgt: 'x', tempo: 5, foo: 1}}).arp;
    return {same, u: u1 - u0, undoOk: a2 === a0 && a3 === a1 && a1 !== a0, back, want, cl};
  });
  ok('FP-SONG Daten-Invarianten: S.tracks[].clips und der Song deep-equal nach Wiedergabe mit Arp (2 Spuren, Szenenwechsel)', r.same);
  ok('FP-SONG Undo-Gruppen: ARP-Taste und Schritt-Taste je ein Undo; Undo/Redo stellt deep-equal her', r.u === 2 && r.undoOk, 'Undo +' + r.u);
  ok('FP-SONG Rundweg Speichern/Laden: alle Arp-Felder bleiben (Format 5)', r.back && Object.keys(r.want).every(k => r.back[k] === r.want[k]), J(r.back));
  ok('FP-SONG normMk klemmt den Arp-Block (Bereiche aus Teil A, unbekannte Felder fallen weg)', J(r.cl) === J({on: 1, latch: 0, type: 5, range: 1, gate: 100, tgt: 0, ks: 0, res: 0, swing: 100, last: 8, steps: 255, tempo: 20}), J(r.cl));
  ok('FP-SONG keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close(); }
// 2. MK5-18: the same clip playback on 4.12.0 and 4.13.0 (VA, FM, AM with arp off): identical note lists (beats, pitches)
const runs = {};
for (const [nm, file] of [['base', BASE], ['neu', APP]]) {
  const {ctx, p, errs} = await page(file);
  runs[nm] = await p.evaluate(async () => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); ensureAudio(); await sl(1200);
    Q.setEngine(3, 'mk'); Q.setBpm(120); Q.clearLog(); Q.launchScene(0); await sl(4200); Q.launchScene(1); await sl(4200); Q.stop(); await sl(100);
    return Q.noteLog(4000).filter(e => e.beat != null && e.src !== 'click').map(e => [e.track, e.src, +(e.beat).toFixed(2), e.out]);
  });
  runs[nm + 'E'] = errs.length; await ctx.close();
}
const key = x => x.map(e => e.join(':')).sort(), A = key(runs.base), B = key(runs.neu), n = Math.min(A.length, B.length);
const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x));
ok('MK5-18 Regression: Clip-Wiedergabe (Drums, VA, AM mit Arp aus) wie 4.12.0 — gleiche Noten (Spur, Quelle, Schlag ±0,01, Tonhöhe)', miss.length <= 2 && extra.length <= 2 && Math.abs(A.length - B.length) <= 2 && !runs.neuE, `${A.length} / ${B.length} Noten, fehlt ${J(miss.slice(0, 4))}, extra ${J(extra.slice(0, 4))} (Rand-Jitter erlaubt ±2)`);
void n;
// 3. harmony core: the Transposer / Harmony blocks are byte-equal to 4.12.0
const a = fs.readFileSync(BASE, 'utf8'), c = fs.readFileSync(APP, 'utf8');
const blk = (s, k) => { const i = s.indexOf(k); return i < 0 ? '' : s.slice(i, s.indexOf('\n}\n', i) + 3); };
for (const k of ['class Transposer', 'const Harmony = ', 'function mapOut(', 'function outPitch(']) ok('FP-SONG Harmonie-Kern unverändert (I-01): ' + k, blk(a, k) && blk(a, k) === blk(c, k), blk(a, k).length + ' Zeichen');
console.log(fails ? fails + ' FEHLER' : 'ALLE BESTANDEN');
await b.close();
