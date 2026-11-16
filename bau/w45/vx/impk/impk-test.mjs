// IMPK-Test: (A) Gesang-Tempo (imp1Core, Node) · (B) Import-Blatt nach ½× · (C) Begleiter-Rest: Klick nach SCHLUSS, Etikett beim Akkordwechsel,
// ● AUTO über einen vorhandenen Song (nur gemessen) · (D) Konsole. Jede Prüfung an index.html; die Basis läuft mit (Vorher-Zahlen, INFO).
// Aufruf: node impk-test.mjs <index.html> <basis.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { makeVoices } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/chr3/src/synth.mjs';
const [fi, fb] = process.argv.slice(2).map(f => path.resolve(f));
const VOX = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/imp2rs';
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const t00 = Date.now();

/* ---------- A Gesang-Tempo (Node, imp1Core aus der Datei) ---------- */
const core = f => { const H = fs.readFileSync(f, 'utf8'), i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i); return new Function(H.slice(i, j) + '\nreturn imp1Core;')()(); };
const CI = core(fi), CB = core(fb);
const MEL = [[72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 2], [72, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 2]];
const q16 = x => Float32Array.from(x, s => Math.max(-32768, Math.min(32767, Math.round(s * 32767))) / 32768);
const rdWav = f => { const B = fs.readFileSync(f); let p = 12, sr = 0, ch = 1, bits = 16, x = null; while (p < B.length) { const id = B.toString('ascii', p, p + 4), n = B.readUInt32LE(p + 4); if (id === 'fmt ') { ch = B.readUInt16LE(p + 10); sr = B.readUInt32LE(p + 12); bits = B.readUInt16LE(p + 22); } if (id === 'data') { const m = Math.floor(n / (bits / 8) / ch); x = new Float32Array(m); for (let k = 0; k < m; k++) x[k] = bits === 16 ? B.readInt16LE(p + 8 + k * 2 * ch) / 32768 : B.readFloatLE(p + 8 + k * 4 * ch); break; } p += 8 + n + (n & 1); } return {x, sr}; };
{
  const rows = [], sumI = {ok: 0, e: 0, t1: 0}, sumB = {ok: 0, e: 0, t1: 0}; let n = 0;
  for (const bpm of [96, 104, 112, 120, 126, 132, 140]) for (const [mn, mel] of [['A', MEL.map(([m, d]) => [m - 12, d])], ['B', [...MEL, ...MEL]]]) {
    const x = q16(makeVoices({mel, iv: [0], sr: 44100, sp: 60 / bpm}).voices[0].y); n++;
    const ri = CI.analyse(x, 44100, {}, () => {}), rb = CB.analyse(x, 44100, {}, () => {});
    for (const [s, r] of [[sumI, ri], [sumB, rb]]) { if (Math.round(r.bpm) === bpm) s.ok++; s.e += Math.abs(r.bpmRoh - bpm); s.t1 += Math.abs(r.t1 - .25) * 1000; }
    rows.push(`${bpm}${mn} ${rb.bpmRoh.toFixed(2)}→${ri.bpmRoh.toFixed(2)}`);
  }
  info('A Vokal-Melodien 44,1 kHz (roh vorher→nachher)', rows.join(' · '));
  ok(sumI.ok === n && sumI.e / n <= sumB.e / n && sumI.t1 / n <= sumB.t1 / n, 'A1 Gesang-Tempo: alle 14 Vokal-Melodien (96–140 BPM) bekommen das richtige Projekt-Tempo, Fehler und Takt-Anfang nicht schlechter als vorher',
    `richtig ${sumB.ok}/${n} → ${sumI.ok}/${n} · |Fehler| ${(sumB.e / n).toFixed(3)} → ${(sumI.e / n).toFixed(3)} BPM · |t1| ${(sumB.t1 / n).toFixed(1)} → ${(sumI.t1 / n).toFixed(1)} ms`);
  // die Lead-Stimme aus chr2-test (120 BPM) bei 48 kHz (die App dekodiert dort auf 48 kHz) – vorher 120,54 → Projekt 121
  const L = makeVoices({mel: MEL.map(([m, d]) => [m - 12, d]), iv: [0], sr: 48000}).voices[0].y, r48i = CI.analyse(q16(L), 48000, {}, () => {}), r48b = CB.analyse(q16(L), 48000, {}, () => {});
  ok(Math.round(r48i.bpm) === 120 && Math.abs(r48i.bpmRoh - 120) < .25, 'A2 Lead-Stimme 120 BPM bei 48 kHz: Projekt-Tempo 120 (nicht 121)', `roh ${r48b.bpmRoh} → ${r48i.bpmRoh}, Projekt ${Math.round(r48b.bpm)} → ${Math.round(r48i.bpm)}`);
  // echte Aufnahmen: #1 (Annotation ≈ 119), #10, #14 ohne feste Wahrheit – Rate-Unabhängigkeit bleibt (IMP2), #1 bleibt richtig
  const real = [];
  for (const k of ['vocadito_1', 'vocadito_10', 'vocadito_14']) {
    const res = []; for (const sr of [22050, 44100, 48000, 96000]) { const f = `${VOX}/${k}@${sr}.wav`; if (!fs.existsSync(f)) continue; const w = rdWav(f), ri = CI.analyse(w.x, w.sr, {}, () => {}), rb = CB.analyse(w.x, w.sr, {}, () => {}); res.push({sr, i: ri.bpmRoh, b: rb.bpmRoh, qi: ri.quelle, ti: ri.t1, tb: rb.t1}); }
    const sp = Math.max(...res.map(r => r.i)) - Math.min(...res.map(r => r.i)); real.push({k, res, sp});
  }
  for (const r of real) info('A3 ' + r.k, r.res.map(z => `${z.sr / 1000}k ${z.b}→${z.i} (t1 ${z.tb}→${z.ti})`).join(' · ') + ` · Spanne ${r.sp.toFixed(2)}`);
  ok(real.every(r => r.sp <= .5) && real[0].res.every(z => Math.abs(z.i - 119) <= 1.785), 'A3 echte Gesangsaufnahmen: Tempo über alle Abtastraten gleich (Spanne ≤ 0,5 BPM), #1 bleibt bei der Annotation 119 (±1,5 %)',
    real.map(r => r.k.replace('vocadito_', '#') + ' ' + r.res[1].b + '→' + r.res[1].i).join(' · '));
}

/* ---------- Browser ---------- */
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(f, w = 428, h = 926) {
  const p = await br.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(path.basename(f) + ': ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(path.basename(f) + ': ' + m.text()); });
  await p.goto('file://' + f); await p.waitForTimeout(1600); p.cdp = await p.context().newCDPSession(p); return p;
}
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tDown(p, c.x, c.y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(300); return true; }
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const until = async (b, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 40000)) { if (R.playing && AU.ctx && audBeat() >= b) return true; await wait(8); } return false; };
  const chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await wait(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };
  const stopWait = async ms => { const t0 = performance.now(); while (R.playing && performance.now() - t0 < (ms || 15000)) await wait(40); return !R.playing; };`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');

/* ---------- B Import-Blatt: Frage nach ½× ---------- */
const sheet = async f => {
  const p = await page(f), b64 = fs.readFileSync(`${VOX}/vocadito_14@44100.wav`).toString('base64');
  await p.evaluate(async b => { ensureAudio(); closePop(); const ab = Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer; window.__imp1.ui.file(ab, 'gesang14.wav'); }, b64);
  for (let k = 0; k < 120; k++) { await p.waitForTimeout(250); if (await p.evaluate(() => { const c = window.__imp1.ui.cur(); return c && (c.st === 'fertig' || c.st === 'fehler'); })) break; }
  const read = () => p.evaluate(() => { const c = window.__imp1.ui.cur(), q = [...document.querySelectorAll('.imp1 .imp1st.warn')].map(e => e.textContent).find(t => / oder /.test(t)) || '';
    return {bpm: c.bpm, det: c.r && c.r.bpm, frage: !!(c.r && c.r.frage), q, btn: [...document.querySelectorAll('.imp1 button[data-i="setbpm"]')].map(b => ({t: b.textContent, v: +b.dataset.v, on: b.classList.contains('on')}))}; });
  const s0 = await read(); await tapSel(p, '.imp1 button[data-i="half"]'); const s1 = await read();
  const other = s1.btn.findIndex(x => !x.on); if (other >= 0) await tapSel(p, `.imp1 button[data-i="setbpm"]:nth-of-type(${other + 1})`);
  const s2 = await read(); await p.screenshot({path: path.join(path.dirname(fi), 'impk-blatt-' + (f === fi ? 'nachher' : 'vorher') + '.png')}); await p.close(); return {s0, s1, s2};
};
{
  const B0 = await sheet(fb), B1 = await sheet(fi), f = s => `„${s.q}“ [${s.btn.map(x => x.t + (x.on ? '*' : '')).join(' | ')}]`;
  info('B vorher (Basis)', `Start ${f(B0.s0)} · nach ½× ${f(B0.s1)} · Knopf ${f(B0.s2)}`);
  info('B nachher', `Start ${f(B1.s0)} · nach ½× ${f(B1.s1)} · Knopf ${f(B1.s2)}`);
  const r1 = B1.s1.btn.map(x => Math.round(x.v)), dup = new Set(r1).size !== r1.length;
  ok(B1.s0.frage && B1.s0.q === B0.s0.q && JSON.stringify(B1.s0.btn) === JSON.stringify(B0.s0.btn), 'B1 Import-Blatt Ausgangszustand: dieselbe Frage und dieselben Knöpfe wie vorher', f(B1.s0));
  ok(!dup && r1.length >= 2 && r1.includes(Math.round(B1.s1.bpm)) && r1.includes(Math.round(B1.s1.det)) && B1.s1.btn[0].on && new RegExp(' – ' + Math.round(B1.s1.bpm) + ' oder ' + Math.round(B1.s1.det)).test(B1.s1.q),
    'B2 nach ½×: keine zwei gleichen Knöpfe, die Frage nennt das gewählte und das erkannte Tempo (z. B. 60 oder 121)', f(B1.s1) + (B0.s1.btn.length === 2 && B0.s1.btn[0].t === B0.s1.btn[1].t ? ' (vorher ' + f(B0.s1) + ')' : ''));
  ok(Math.abs(B1.s2.bpm - B1.s0.bpm) < .01 && B1.s2.q === B1.s0.q, 'B3 Tipp auf das erkannte Tempo: zurück zur Ausgangsfrage', f(B1.s2));
}

/* ---------- C Begleiter-Rest ---------- */
const beg = async f => {
  const p = await page(f), out = {};
  // C1 SCHLUSS mit Metronom: Klick hinter dem Schlusstaktstrich?
  out.c1 = [];
  for (const bpm of [120, 157]) out.c1.push(await run(p, async bpm => {
    ensureAudio(); await wait(300); SYNQUENZER.setBpm(bpm); setMetronome(true);
    const Bg = SYNQUENZER.beg1; let sb = null; const st0 = window.stop; window.stop = function () { if (sb == null && R.playing && AU.ctx) sb = audBeat(); return st0.apply(this, arguments); };
    clearLog(); launchScene(0); await until(1.2); Bg.open(); await wait(200); await chord([60, 64, 67]); await wait(200); await until(5.3); Bg.variant('E');
    await stopWait(15000); await wait(500); window.stop = st0; const LB = (Bg.run() || {}).LB || 4;
    const L = noteLog(4096).filter(e => e.beat != null), sbL = sb == null ? null : Math.round(sb / LB) * LB, ck = L.filter(e => e.src === 'click');
    const r = {sb: sb == null ? null : +sb.toFixed(3), sbL, clicks: ck.length, after: ck.filter(e => e.beat >= sbL - 1e-3).map(e => e.beat.toFixed(2)), notesAfter: L.filter(e => e.src !== 'click' && e.beat >= sbL - 1e-3).length};
    setMetronome(false); Bg.close(); await wait(300); return r;
  }, bpm));
  // C2 Akkordwechsel mit klingender Fläche: Etikett der neu angeschlagenen Töne
  out.c2 = await run(p, async () => {
    ensureAudio(); SYNQUENZER.setBpm(120); const Bg = SYNQUENZER.beg1; Bg.fig('pad'); Bg.open(); await wait(200); const tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp];
    clearLog(); await chord([60, 64, 67], 120); await until(6.5); await chord([57, 60, 64], 120); await until(8.6); await chord([53, 57, 60], 120); await until(12.05);
    const L = noteLog(4096).filter(e => e.beat != null && e.beat < 12 && T.includes(e.track) && e.src !== 'retune');
    SYNQUENZER.stop(); await stopWait(); await wait(300); Bg.close(); Bg.fig('auto'); await wait(300);
    return {clip: L.filter(e => e.src === 'clip').map(e => e.track + ':' + e.out + '@' + e.beat.toFixed(2)), beg: L.filter(e => e.src === 'beg').length, srcs: [...new Set(L.map(e => e.src))], all: L.map(e => e.track + ':' + e.out + '@' + e.beat.toFixed(2)).sort()};
  });
  // C3 ● AUTO über einen vorhandenen Song (nur messen): klingt der Song hinterher wie live?
  out.c3 = await run(p, async () => {
    ensureAudio(); await wait(300); SYNQUENZER.setBpm(150); const Bg = SYNQUENZER.beg1; Bg.open(); await wait(200); const tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp];
    const take = async () => { clearLog(); launchScene(0); await until(0.5); songRecToggle(); await wait(100);
      await until(3.62); await chord([60, 64, 67]); await until(7.62); await chord([57, 60, 64]); await until(12.05);
      const live = noteLog(4096).filter(e => e.beat != null && e.beat >= 4 && e.beat < 12 && e.src !== 'retune' && T.includes(e.track) && (e.src === 'beg' || e.src === 'clip')).length;
      SYNQUENZER.stop(); await stopWait(); await wait(800); return live; };
    const l1 = await take(), over1 = !!(S.song && S.song.bars); Bg.close(); await wait(300); Bg.open(); await wait(200);
    const l2 = await take(); Bg.close(); await wait(300);
    clearLog(); songPlayStart(0); await until(12.05); const back = noteLog(4096).filter(e => e.beat != null && e.beat >= 4 && e.beat < 12 && e.src !== 'retune' && T.includes(e.track)).length; SYNQUENZER.stop(); await stopWait(); await wait(300);
    return {song: over1, live1: l1, live2: l2, back, bars: S.song ? S.song.bars : 0};
  });
  await p.close(); return out;
};
{
  const B0 = await beg(fb), B1 = await beg(fi);
  const f1 = c => c.map(r => `Stopp ${r.sb} (Taktstrich ${r.sbL}), Klicks ${r.clicks}, dahinter ${r.after.length} [${r.after.join(' ')}], Töne dahinter ${r.notesAfter}`).join(' · ');
  info('C1 vorher (Basis)', f1(B0.c1));
  ok(B1.c1.every(r => r.sb != null && Math.abs(r.sb - r.sbL) < .06 && r.clicks >= 4 && !r.after.length && !r.notesAfter), 'C1 SCHLUSS mit Metronom: kein Klick (und kein Ton) mehr auf der Eins hinter dem Schlusstakt, Stopp am Taktstrich (120 und 157 BPM)', f1(B1.c1));
  info('C2 vorher (Basis)', `src „clip“ ${B0.c2.clip.length} [${B0.c2.clip.slice(0, 6).join(' ')}], „beg“ ${B0.c2.beg}`);
  ok(B0.c2.clip.length > 0 ? !B1.c2.clip.length && B1.c2.beg >= B0.c2.beg : !B1.c2.clip.length, 'C2 Akkordwechsel bei klingender Fläche: neu angeschlagene Band-Töne stehen im noteLog als „beg“ (nicht „clip“)', `clip ${B0.c2.clip.length} → ${B1.c2.clip.length}, beg ${B0.c2.beg} → ${B1.c2.beg}`);
  ok(JSON.stringify(B0.c2.all) === JSON.stringify(B1.c2.all), 'C2 Klang unverändert: dieselben Töne (Spur, Tonhöhe, Schlag) wie vorher', B1.c2.all.length + ' Töne');
  info('C3 ● AUTO über vorhandenen Song (gemessen, nicht geändert)', `vorher: live ${B0.c3.live1}/${B0.c3.live2}, Song danach ${B0.c3.back} Band-Töne in Takt 2–3 · nachher: live ${B1.c3.live1}/${B1.c3.live2}, Song ${B1.c3.back}`);
}
ok(!errs.length, 'D Keine Fehler in der Konsole', errs.slice(0, 3).join(' | '));
await br.close();
console.log((bad ? 'FEHLER IMPK: ' + (all - bad) + '/' + all : 'OK IMPK: ' + all + '/' + all) + ' bestanden (' + Math.round((Date.now() - t00) / 1000) + ' s)');
process.exit(bad ? 1 : 0);
