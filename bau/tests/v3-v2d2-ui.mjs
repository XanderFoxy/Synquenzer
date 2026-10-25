// V2d′ Start-Blatt per Touch (CDP): Modi nach K2-27, NOTEN · Spur, Banner, Ende per ● (N7-R1), M-PLATZ in P1–P3, L1, L2; Bilder
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
import { SETUP, waitSong } from './v3-v2d2-lib.mjs';
const {check, done} = mkCheck();
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]];
const center = async (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
const tapSel = async (p, sel) => { const c = await center(p, sel); if (!c) throw new Error('no ' + sel); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(160); };
const recBtn = p => p.evaluate(() => { const b = SV.btn.bRec, r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
async function sheetGeo(p, P) {
  return p.evaluate(P => {
    const s = document.querySelector('.pop.rstart'); if (!s) return null;
    const r = s.getBoundingClientRect(), bad = [], small = [];
    for (const x of s.querySelectorAll('button, .rs-ov, .rs-mode, .rs-h b')) {
      const q = x.getBoundingClientRect(); if (!q.width || getComputedStyle(x).display === 'none') continue;
      if (q.left < r.left - .5 || q.right > r.right + .5 || q.top < -.5 || q.bottom > innerHeight + .5) bad.push((x.textContent || '').slice(0, 20) + ' out');
      if (x.tagName === 'BUTTON' && x.scrollWidth > x.clientWidth + 1) bad.push((x.textContent || '').slice(0, 20) + ' clipped');
      const mh = P ? 44 : 36, mw = P ? 44 : 40;
      if (x.tagName === 'BUTTON' && !x.disabled && (q.height < mh - .5 || q.width < mw)) small.push((x.textContent || '').slice(0, 16) + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0));
    }
    const mode = s.querySelector('.rs-mode'), mo = mode && getComputedStyle(mode).display !== 'none' ? mode.scrollHeight <= mode.clientHeight + 1 : true;
    return {top: +r.top.toFixed(1), h: +r.height.toFixed(1), w: r.width, bad, small, mo, sw: document.documentElement.scrollWidth <= innerWidth, modes: [...s.querySelectorAll('.rs-m')].map(b => b.dataset.m), head: s.querySelector('.rs-h b').textContent, nt: (s.querySelector('.rs-n small') || {}).textContent};
  }, P);
}
for (const [id, w, h] of VPS) {
  const P = h > w;
  const {b, p, errs} = await open({width: w, height: h}, undefined, true);
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack(1); Q.songView(true); Q.songPos(3); return 1; });
  await p.waitForTimeout(300);
  // (a) only the Positionsmarke (T4): ab Takt 4 → Überschreiben │ Einfügen
  let c = await recBtn(p); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  let g = await sheetGeo(p, P);
  check(id + ' (a) Start-Blatt ohne Auswahl: AB TAKT 4, Überschreiben │ Einfügen, NOTEN · Synth 2', g && g.head === 'AUFNAHME AB TAKT 4' && g.modes.join() === 'over,insert' && g.nt === 'Synth 2', g);
  check(id + ' (a) M-PLATZ: im Bild, nichts abgeschnitten, Treffer', g && !g.bad.length && !g.small.length && g.sw && g.mo, g);
  await p.screenshot({path: `v3-v2d2-ui-${id}-a.png`});
  await tapSel(p, '.pop.rstart .rs-x'); await p.waitForTimeout(150);
  // (b) one bar selected (T4): all four modes
  await p.evaluate(() => window.SYNQUENZER.songSelect(3, 3));
  c = await recBtn(p); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  g = await sheetGeo(p, P);
  check(id + ' (b) 1 Takt: alle vier Modi (K2-27)', g && g.modes.join() === 'over,insert,replace,overdub', g);
  check(id + ' (b) M-PLATZ', g && !g.bad.length && !g.small.length && g.sw && g.mo, g);
  if (P) { const cv = await p.evaluate(() => { const c = document.querySelector('#songView canvas, #svCanvas, canvas.sv'); return c ? c.getBoundingClientRect().bottom : null; }); check(id + ' (b) Blatt unten angedockt', Math.abs(g.top + g.h - h) < 1.5, {g, cv}); }
  await p.screenshot({path: `v3-v2d2-ui-${id}-b.png`});
  await tapSel(p, '.pop.rstart .rs-x');
  // (c) range T4–6: Ersetzen │ Overdub; choose Overdub by touch, then ▾ → Synth 3, START
  await p.evaluate(() => window.SYNQUENZER.songSelect(3, 5));
  c = await recBtn(p); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  g = await sheetGeo(p, P);
  check(id + ' (c) Bereich: TAKTE 4–6, Ersetzen │ Overdub', g && g.head === 'AUFNAHME TAKTE 4–6' && g.modes.join() === 'replace,overdub', g);
  check(id + ' (c) M-PLATZ', g && !g.bad.length && !g.small.length && g.sw && g.mo, g);
  await tapSel(p, '.pop.rstart .rs-m[data-m="overdub"]');
  await tapSel(p, '.pop.rstart .rs-nt');
  const pk = await sheetGeo(p, P);
  check(id + ' (c) ▾ zeigt die Spuren zur Wahl, passt', pk && !pk.bad.length && !pk.small.length, pk);
  await tapSel(p, '.pop.rstart .rs-t[data-nt="2"]');
  g = await sheetGeo(p, P);
  check(id + ' (c) NOTEN · Synth 3 nach Wahl, Modus Overdub bleibt', g && g.nt === 'Synth 3' && await p.evaluate(() => document.querySelector('.pop.rstart .rs-m.on').dataset.m) === 'overdub', g);
  await p.screenshot({path: `v3-v2d2-ui-${id}-c.png`});
  const lay0 = await p.evaluate(() => [...document.querySelectorAll('#songView button')].filter(x => x.offsetParent).map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }));
  await tapSel(p, '.pop.rstart .rs-go');
  await p.waitForTimeout(300);
  const st = await p.evaluate(() => { const s = window.SYNQUENZER.runtime().song; return {rec: s.rec, mode: s.recMode, track: s.recTrack, from: s.recFrom, to: s.recTo, ban: SV.ban && !SV.ban.hidden ? SV.ban.textContent : null, banFit: SV.ban ? SV.ban.scrollWidth <= SV.ban.clientWidth + 1 : null, sel: s.sel}; });
  check(id + ' (c) START: Overdub Takt 4–6, NOTEN Synth 3, Banner nennt Modus und Ziel', st.rec && st.mode === 'overdub' && st.track === 2 && st.from === 3 && st.to === 6 && st.ban && /Overdub/.test(st.ban) && /NOTEN S3/.test(st.ban) && st.banFit, st);
  const lay1 = await p.evaluate(() => [...document.querySelectorAll('#songView button')].filter(x => x.offsetParent).map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }));
  check(id + ' (c) Banner verschiebt nichts (±2 px)', lay0.length === lay1.length && lay0.every((v, k) => Math.abs(v[0] - lay1[k][0]) <= 2 && Math.abs(v[1] - lay1[k][1]) <= 2), [lay0.length, lay1.length]);
  await p.screenshot({path: `v3-v2d2-ui-${id}-rec.png`});
  await p.evaluate(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(250);
  // (d) open take ended by a touch on ● at T6 + 10 % → N7-R1 end at bar line 6
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songSelect(null); Q.songPos(3); Q.songRecTargets({clips: false, chords: true, notes: false}); return 1; });
  await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: true, notes: false}, preroll: 1}));
  await waitSong(p, 20.4);
  c = await recBtn(p); await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(250);
  const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
  check(id + ' (d) ● per Finger bei T6 + 10 % → Ende Taktstrich 6 (N7-R1)', le && le.endBar === 5 && !(await p.evaluate(() => window.SYNQUENZER.runtime().song.rec)), le);
  await p.evaluate(() => window.SYNQUENZER.songPlay(false));
  check(id + ' 0 Konsolenfehler', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
