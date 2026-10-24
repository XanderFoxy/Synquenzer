// QA group: M-PLATZ of the FANG TEIL sheet in its states (Name chips, taken name ＋/⟳, Platz ersetzen) in P1 P2 P3 L1 L2:
// buttons with clipped text (scrollWidth > clientWidth + 1), elements outside the viewport, touch sizes
import {open, OUT, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const measure = (p, sel) => p.evaluate(sel => { const pop = document.querySelector(sel); if (!pop) return null; const vw = innerWidth, vh = innerHeight, out = {clip: [], outside: [], small: []};
  for (const b of pop.querySelectorAll('button')) { if (!b.getClientRects().length || getComputedStyle(b).visibility === 'hidden' || b.disabled) continue; const r = b.getBoundingClientRect(), t = b.textContent.trim();
    const inner = [...b.querySelectorAll('span')].filter(s => getComputedStyle(s).display !== 'none'); const sw = Math.max(b.scrollWidth, ...inner.map(s => s.scrollWidth)), cw = Math.max(b.clientWidth, ...inner.map(s => s.clientWidth));
    if (b.scrollWidth > b.clientWidth + 1 || inner.some(s => s.scrollWidth > s.clientWidth + 1)) out.clip.push(t + ' ' + b.scrollWidth + '>' + b.clientWidth);
    const sc = b.closest('.cp-sc'); const scR = sc ? sc.getBoundingClientRect() : null;
    if ((r.right > vw + 1 || r.bottom > vh + 1 || r.left < -1 || r.top < -1) && !(scR && (r.right > scR.right || r.left < scR.left))) out.outside.push(t);
    if (r.height < 34 || r.width < 34) out.small.push(t + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  const pr = pop.getBoundingClientRect(); out.pop = [Math.round(pr.x), Math.round(pr.y), Math.round(pr.width), Math.round(pr.height)]; out.sw = document.documentElement.scrollWidth > vw; return out; }, sel);
for (const [n, [w, h]] of Object.entries(VPS)) {
  const {br, p, errs, E} = await open({viewport: {width: w, height: h}, mic: false});
  await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.setMetronome(false); for (let i = 0; i < 7; i++) SYNQUENZER.setPart(i, {name: ['Strophe', 'Refrain', 'Bridge', 'Intro', 'Outro', 'Pre', 'Break'][i], slots: [{s: 0}, -1, -1, -1, -1, -1], chords: null}); SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
  await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); });
  await E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + .03) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 80); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55, 57, 53, 48, 55], 4]);
  await p.waitForFunction(() => audBeat() >= 36.3, null, {polling: 5});
  await E(() => SYNQUENZER.fangTeil({})); await sleep(150);
  const m0 = await measure(p, '.pop.fsheet');
  await E(() => SYNQUENZER.fangName('Refrain', 'new')); await sleep(80);
  const m1 = await measure(p, '.pop.fsheet'); await p.screenshot({path: OUT + `lay-dup-${n}.png`});
  // 8th part takes the last place, then a 2nd catch with a full Teil-Leiste → „Platz … ersetzen“
  await E(() => { SYNQUENZER.fangName('Outro', 'new'); }); await E(() => SYNQUENZER.fangAccept('part')); await sleep(80);
  await E(() => SYNQUENZER.fangTeil({})); await sleep(100); await E(() => SYNQUENZER.fangAccept('part')); await sleep(100);
  const m2 = await measure(p, '.pop.fsheet'); await p.screenshot({path: OUT + `lay-full-${n}.png`});
  const bad = (m, k) => m ? m[k] : ['(sheet missing)'];
  check(`${n}: FANG sheet – no clipped button text (names / ＋ ⟳ / Platz ersetzen)`, !bad(m0, 'clip').length && !bad(m1, 'clip').length && !bad(m2, 'clip').length, {names: m0 && m0.clip, dup: m1 && m1.clip, full: m2 && m2.clip});
  check(`${n}: FANG sheet – nothing outside the viewport, no horizontal page scroll`, m0 && m1 && m2 && !m0.outside.length && !m1.outside.length && !m2.outside.length && !m0.sw && !m1.sw, {o0: m0 && m0.outside, o1: m1 && m1.outside, o2: m2 && m2.outside, pop: m0 && m0.pop});
  console.log(n, 'small targets', JSON.stringify([...new Set([...(m0 ? m0.small : []), ...(m1 ? m1.small : [])])].slice(0, 6)));
  await E(() => SYNQUENZER.stop()); await br.close();
}
done();
