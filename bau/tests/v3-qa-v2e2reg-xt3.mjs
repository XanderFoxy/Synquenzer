// QA regression (V2e): empty song view (hint + [Kette aus Szenen …] + [＋ Teil einsetzen ▾]) and the Kette / Teil pick sheets
// in P1 P2 P3 L1 L2 W: inside the screen, no clipped text, no overlap; Kette → a song; Teil einsetzen → part at bar 1; errors
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2e2reg/';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const MEAS = root => { const s = typeof root === 'string' ? document.querySelector(root) : root; if (!s || !s.offsetWidth) return null; const out = {bad: [], ov: []};
  const r = s.getBoundingClientRect(); out.box = [r.x, r.y, r.width, r.height].map(v => Math.round(v));
  if (r.left < -.5 || r.top < -.5 || r.right > innerWidth + .5 || r.bottom > innerHeight + .5) out.bad.push('box out of screen');
  const bs = [...s.querySelectorAll('button, p, h4, b, small, span')].filter(x => x.offsetWidth && getComputedStyle(x).visibility === 'visible');
  for (const x of bs) { const q = x.getBoundingClientRect();
    if (x.tagName === 'BUTTON' && (x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 2)) out.bad.push('clipped ' + x.textContent.trim().slice(0, 24) + ' ' + x.scrollWidth + '/' + x.clientWidth + ' ' + x.scrollHeight + '/' + x.clientHeight);
    if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5) out.bad.push('out ' + x.textContent.trim().slice(0, 24)); }
  const btn = bs.filter(x => x.tagName === 'BUTTON');
  for (let i = 0; i < btn.length; i++) for (let j = i + 1; j < btn.length; j++) { const a = btn[i].getBoundingClientRect(), c = btn[j].getBoundingClientRect(); const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 1 && iy > 1 && !btn[i].contains(btn[j]) && !btn[j].contains(btn[i])) out.ov.push(btn[i].textContent.trim().slice(0, 14) + ' X ' + btn[j].textContent.trim().slice(0, 14)); }
  return out; };
for (const vp of Object.keys(VPS)) {
  const [w, h] = VPS[vp];
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 300) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapEl = async sel => { const r = await p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, sel); if (!r) return false; await tap(r[0], r[1]); return true; };
  const tapPopBtn = async (txt) => { const r = await p.evaluate(t => { const pp = document.querySelector('#popLayer .pop'); if (!pp) return null; const bb = [...pp.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.bottom <= innerHeight && q.top >= 0]; }, txt); if (!r) return null; await tap(r[0], r[1]); return r[2]; };
  const out = {};
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 60)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 53)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, -1, -1, -1, {s: 0}, -1]}); Q.setPart(1, {name: 'Refrain', slots: [{s: 1}, -1, -1, -1, {s: 0}, -1]});
    Q.songView(true); });
  await p.waitForTimeout(500);
  out.empty = await p.evaluate(MEAS, '#songView .sv-empty');
  out.emptyBtns = await p.evaluate(() => [...document.querySelectorAll('#songView .sv-empty button')].filter(x => x.offsetWidth).map(x => { const q = x.getBoundingClientRect(); return x.textContent + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + '@' + Math.round(q.x) + ',' + Math.round(q.y); }));
  // the empty hint must lie inside the canvas area of the song view, not over transport or keyboard
  out.emptyIn = await p.evaluate(() => { const e = document.querySelector('#songView .sv-empty'), v = document.getElementById('songView'); if (!e || !v) return null; const a = e.getBoundingClientRect(), c = v.getBoundingClientRect(); const kids = [...e.querySelectorAll('*')].filter(x => x.offsetWidth).map(x => x.getBoundingClientRect()); return kids.every(k => k.top >= c.top - .5 && k.bottom <= c.bottom + .5 && k.left >= c.left - .5 && k.right <= c.right + .5); });
  await p.screenshot({path: D + `t3-${vp}-empty.png`});
  // Kette
  out.kette = await tapEl('#songView .sv-empty .kbtn');
  out.kpop = await p.evaluate(MEAS, '#popLayer .pop');
  out.kparts = await p.evaluate(() => [...document.querySelectorAll('#popLayer .pop .kparts button')].map(x => x.textContent));
  await p.screenshot({path: D + `t3-${vp}-kette.png`});
  await p.keyboard.press('Escape'); await p.evaluate(() => { const Q = window.SYNQUENZER; }); await p.waitForTimeout(200);
  if (await p.evaluate(() => !!document.querySelector('#popLayer .pop'))) await tap(5, h / 2);
  // ＋ Teil einsetzen ▾
  out.place = await tapEl('#songView .sv-empty .kbtn:nth-of-type(2)');
  out.ppop = await p.evaluate(MEAS, '#popLayer .pop');
  out.ppopTxt = await p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); return pp ? pp.textContent.slice(0, 160) : null; });
  await p.screenshot({path: D + `t3-${vp}-place.png`});
  out.pick = await tapPopBtn('Strophe');
  await p.waitForTimeout(300);
  out.song = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return s ? {bars: s.bars, marks: s.marks.map(m => m.a + '+' + m.len + ':' + m.part)} : null; });
  out.svMarks = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo().marks.map(m => m.label));
  await p.screenshot({path: D + `t3-${vp}-placed.png`});
  out.errs = errs.slice();
  console.log('==', vp, JSON.stringify(out));
  await b.close();
}
