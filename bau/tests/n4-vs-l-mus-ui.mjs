// Musiker (Xander) über die echte Bedienung (Touch), Demo-Projekt, P = 390×844 / L = 844×390:
// Mikro-Zeile antippen → Mikro-Blatt → „Melodieerkennung: Aus“ → Blatt zu → Szene Groove, MELODIE-Platz → ● (Tipp) → 16 Takte → ●
// → zweiter Take 16 Takte (● Tipp) → Ergebnis, Meldungen mit Zeit, hörbar je Takt.
// node n4-vs-l-mus-ui.mjs <P|L> [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep, tapSel, undoN} from './n4-vs-l-mus-h.mjs';
const O = process.argv[2] || 'P', file = process.argv[3] || NEW;
const vp = O === 'L' ? {width: 844, height: 390} : {width: 390, height: 844};
const BPM = 112, spb = 60 / BPM;
const H = await start(file, BPM, {demo: true, touch: true, viewport: vp}), p = H.p;
await p.evaluate(() => { window.__tt = []; const t = document.getElementById('toast'); const t0 = performance.now(); new MutationObserver(() => { const x = t.textContent.trim(); const v = t.offsetParent !== null && getComputedStyle(t).opacity !== '0'; window.__tt.push([Math.round(performance.now()), x, v]); }).observe(t, {subtree: true, childList: true, characterData: true, attributes: true}); });
// 1) Mikro-Blatt über die Mikro-Zeile
const rowVis = await p.evaluate(() => { const r = document.querySelector('.microw:not(.sv)'); if (!r || r.hidden) return null; const b = r.getBoundingClientRect(); return [b.left, b.top, b.width, b.height].map(Math.round); });
console.log(O, 'Mikro-Zeile', JSON.stringify(rowVis));
let opened = rowVis ? await tapSel(H, '.microw:not(.sv)') : false;
if (!rowVis) opened = await tapSel(H, O === 'L' ? '#bMicT' : '#segMic');
await sleep(500);
const g = await p.evaluate(() => { const P = document.querySelector('.pop.stpop'); if (!P) return null; const R = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  const mel = P.querySelector('#vsMel'), bs = mel ? [...mel.querySelectorAll('button')].map(b => ({t: b.textContent, r: R(b), on: b.classList.contains('on')})) : null;
  const off = [...P.querySelectorAll('button')].find(b => /Mikro aus/.test(b.textContent));
  return {pop: R(P), sh: P.scrollHeight, ch: P.clientHeight, st: P.scrollTop, vh: innerHeight, mel: bs, lbl: P.querySelector('.st-mel span') && P.querySelector('.st-mel span').textContent, off: off ? R(off) : null}; });
console.log(O, 'Mikro-Blatt offen', opened, JSON.stringify(g));
const okAus = await tapSel(H, '.pop.stpop #vsMel button[data-v="0"]'); await sleep(400);
const g2 = await p.evaluate(() => { const P = document.querySelector('.pop.stpop'); if (!P) return {open: false}; const x = P.querySelector('.st-melx'); const b = x && x.getBoundingClientRect();
  return {open: true, mel: SYNQUENZER.vsInfo().cfg.mel, satz: x && x.textContent, satzR: b && [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], cut: x ? x.scrollWidth > x.clientWidth + 1 : null, sh: P.scrollHeight, ch: P.clientHeight, H: document.documentElement.scrollHeight, W: document.documentElement.scrollWidth}; });
console.log(O, 'Aus getippt', okAus, JSON.stringify(g2));
// Finger-Rollen bis „Mikro aus“ (nur wenn das Blatt höher ist als sein Platz)
if (g2.open && g2.sh > g2.ch + 2) {
  const box = await p.evaluate(() => { const b = document.querySelector('.pop.stpop').getBoundingClientRect(); return {x: b.left + b.width / 2, y0: b.top + b.height - 30, y1: b.top + 40}; });
  const cdp = await H.ctx.newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: box.x, y: box.y0}]});
  for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: box.x, y: box.y0 + (box.y1 - box.y0) * k / 10}]}); await sleep(16); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(600);
  const g3 = await p.evaluate(() => { const P = document.querySelector('.pop.stpop'); if (!P) return {open: false}; const off = [...P.querySelectorAll('button')].find(b => /Mikro aus/.test(b.textContent)); const r = off && off.getBoundingClientRect(); const pr = P.getBoundingClientRect(); return {open: true, st: P.scrollTop, off: r && [Math.round(r.top), Math.round(r.bottom)], popBottom: Math.round(pr.bottom), vh: innerHeight, mel: SYNQUENZER.vsInfo().cfg.mel}; });
  console.log(O, 'Finger-Rollen', JSON.stringify(g3));
}
await p.keyboard.press('Escape'); await sleep(300);
console.log(O, 'Blatt zu', await p.evaluate(() => !document.querySelector('.pop.stpop')));
// 2) Szene Groove, MELODIE-Platz, ● Tipp, 16 Takte singen
const k1 = await prep(H, sing(melN(16), BPM)), k2 = await prep(H, sing(melN(16, 2), BPM, 5));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
const u0 = await undoN(p);
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k1, 4);
await waitBeat(p, 67.5); const tStop = await p.evaluate(() => Math.round(performance.now())); await tapSel(H, '#bRec');
await waitBeat(p, 70.6); await idle(p);
let r = await stInfo(p, 0);
const T1 = await p.evaluate(() => window.__tt.slice());
console.log(O, 'Take 1:', JSON.stringify({len: r.len, sec: r.audio && +(r.audio.out - r.audio.in).toFixed(3), at: r.audio && r.audio.at, mel: r.mel, cstart: r.cstart, sheet: await p.evaluate(() => !!document.querySelector('.vsres')), undo: [u0, await undoN(p)]}));
console.log(O, 'Meldungen nach ● (ms ab ●-Tipp):', JSON.stringify(T1.filter(x => x[0] >= tStop - 50).map(x => [x[0] - tStop, x[1], x[2]])));
let rows = []; for (let j = 0; j < 16; j++) { const h = await sungBarHeard(p, r, r.cstart, 4 + 4 * j, 8 + 4 * j, spb); rows.push(h.played < 0.9 || h.db < -40 ? j + 1 : 0); }
console.log(O, 'Take 1 fehlende gesungene Takte:', JSON.stringify(rows.filter(x => x)));
// 3) zweiter Take, 16 Takte, ● Tipp im Takt davor (Start am nächsten Taktstrich)
await waitBeat(p, 70.8); await tapSel(H, '#bRec'); await fire(H, k2, 72);
await waitBeat(p, 135.5); const tStop2 = await p.evaluate(() => Math.round(performance.now())); await tapSel(H, '#bRec');
await waitBeat(p, 138.6); await idle(p);
r = await stInfo(p, 0);
const T2 = await p.evaluate(() => window.__tt.slice());
console.log(O, 'Take 2:', JSON.stringify({len: r.len, sec: r.audio && +(r.audio.out - r.audio.in).toFixed(3), at: r.audio && r.audio.at, alt: r.audio && (r.audio.alt || []).length, mel: r.mel, cstart: r.cstart, undo: await undoN(p)}));
console.log(O, 'Meldungen nach ● (ms):', JSON.stringify(T2.filter(x => x[0] >= tStop2 - 50).map(x => [x[0] - tStop2, x[1], x[2]])));
rows = []; for (let j = 0; j < 16; j++) { const h = await sungBarHeard(p, r, r.cstart, 72 + 4 * j, 76 + 4 * j, spb); rows.push([j + 1, h.played, h.db]); }
console.log(O, 'Take 2 gesungene Takte [Takt, Anteil, dBFS]:', JSON.stringify(rows));
console.log(O, 'Take 2 fehlende:', JSON.stringify(rows.filter(x => x[1] < 0.9 || x[2] < -40).map(x => x[0])));
console.log(O, 'Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
