// T10: M-PLATZ für die neuen Zustände (FANG 🎤 leuchtend, Ergebnis-Blatt, Mikro-Blatt mit Instrument) in P1 P2 P3 L1 L2 W
import {open, sleep, voice, playAtBeat, waitBeat, result, micOnApi} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const vps = process.argv.slice(2).length ? process.argv.slice(2) : ['P1', 'P2', 'P3', 'L1', 'L2', 'W'];
for (const vp of vps) {
  const H = await open({vp}), p = H.p, L = vp[0] === 'L';
  await p.evaluate(() => { SYNQUENZER.setBpm(120); });
  await micOnApi(p, 'wired');
  await p.evaluate(() => SYNQUENZER.play()); await waitBeat(p, 0.3);
  const SB = await p.evaluate(() => SYNQUENZER.vsClock().spb);
  const MEL = [[4, 1, 60], [5, 1, 62], [6, 1, 64], [7, 1, 65], [8, 2, 67], [10, 1, 64], [11, 1, 60]];
  await playAtBeat(p, voice(MEL.map(([b, d, m]) => ({on: 0.05 + (b - 4) * SB, dur: d * SB, m})), {fs: 16000}), 4, 0.05, 16000);
  await waitBeat(p, 11.5);
  const fb = await p.evaluate(() => { const b = [...document.querySelectorAll('#bFang, #bFangT')].filter(x => x.offsetParent); return b.map(x => { const r = x.getBoundingClientRect(); return {id: x.id, tx: x.textContent, w: Math.round(r.width), h: Math.round(r.height), sw: x.scrollWidth, cw: x.clientWidth, lit: x.classList.contains('lit'), mode: SYNQUENZER.vsInfo().fangMode}; }); });
  ok(fb.length && fb.every(b => b.mode === 'stimme' && b.lit && b.sw <= b.cw && b.w >= (L ? 40 : 44) && b.h >= 36), `${vp} FANG 🎤 leuchtet und passt: ${JSON.stringify(fb)}`);
  await p.screenshot({path: `v3-qa-vs2acc-t10-${vp}-fang.png`});
  await waitBeat(p, 12.4);
  await p.tap(fb[0] ? '#' + fb[0].id : '#bFang');
  const r = await result(p);
  ok(!!r, vp + ' Ergebnis da: ' + (r && r.notes.length) + ' Noten');
  const g = await p.evaluate(L => {
    const s = document.querySelector('.pop.vsres'); if (!s) return null; const R = s.getBoundingClientRect();
    const bs = [...s.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 12), w: Math.round(q.width), h: Math.round(q.height), in: q.left >= -0.5 && q.right <= innerWidth + 0.5 && q.top >= -0.5 && q.bottom <= innerHeight + 0.5, sw: b.scrollWidth <= b.clientWidth + 1}; });
    const kb = document.getElementById('kb'), kr = kb && kb.getBoundingClientRect(); const fe = s.querySelector('.fs-end'), fh = s.querySelector('.fs-h');
    return {sheet: [Math.round(R.left), Math.round(R.top), Math.round(R.width), Math.round(R.height)], inV: R.left >= 0 && R.right <= innerWidth + 0.5 && R.top >= 0 && R.bottom <= innerHeight + 0.5, scroll: s.scrollHeight > s.clientHeight + 1, end: fe && {txt: fe.textContent, sw: fe.scrollWidth, cw: fe.clientWidth, ov: getComputedStyle(fe).textOverflow}, docW: document.documentElement.scrollWidth <= innerWidth, bs, kb: kr && [Math.round(kr.top), Math.round(kr.height)]};
  }, L);
  console.log('  ', vp, JSON.stringify(g && {sheet: g.sheet, scroll: g.scroll, kb: g.kb}));
  ok(g && g.inV && g.docW, vp + ' Blatt im Bild, kein waagrechtes Scrollen');
  ok(g && g.end && g.end.sw <= g.end.cw + 1, vp + ' Ergebnis-Zeile nicht abgeschnitten: ' + JSON.stringify(g && g.end));
  ok(g && !g.scroll, vp + ' Blatt ohne inneres Rollen');
  const small = g ? g.bs.filter(b => b.w < 36 || b.h < 34) : [];
  ok(g && !small.length, vp + ' Knöpfe ≥ 36×34: ' + JSON.stringify(small));
  const big = g ? g.bs.filter(b => b.w < (L ? 40 : 44) || b.h < (L ? 36 : 44)) : [];
  console.log('   unter L4-Vollmaß (' + (L ? '40×36' : '44×44') + '):', JSON.stringify(big.map(b => b.t + ' ' + b.w + '×' + b.h)));
  ok(g && g.bs.every(b => b.in && b.sw), vp + ' alle Knöpfe im Bild, Text passt ' + JSON.stringify(g && g.bs.filter(b => !b.in || !b.sw)));
  await p.screenshot({path: `v3-qa-vs2acc-t10-${vp}-blatt.png`});
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
