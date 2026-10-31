// QA musiker VV2 (touch, P1): 1st Refrain → [Matrix]; 2nd Refrain's Marken-Blatt → „Auf alle … übertragen“ — does the 1st Refrain keep
// its Video entry? + Spur-Liste sizes (Marken-Blatt, 1-bar selection) + „Im Video zeigen“ on the STIMME lane entry (and again = Auto)
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-q2-out/';
const L = process.argv[2] === 'L', [W, H, N] = L ? [844, 390, 'L1'] : [390, 844, 'P1'];
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
await buildSong(p);
await p.evaluate(() => { const Q = SYNQUENZER; Q.songRange('asPart', 2, 5, {name: 'Strophe'}); Q.songRange('asPart', 6, 9, {name: 'Refrain'}); Q.markAction(S.song.marks.find(m => m.a === 6).id, 'rep', 2); setSongView(true); });
await p.waitForTimeout(5000);
const res = {N};
const li = () => p.evaluate(() => svLayoutInfo());
const tapXY = async (x, y, w = 400) => { await p.touchscreen.tap(x, y); await p.waitForTimeout(w); };
const tapSel = async (sel, w = 400) => { const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel); const q = await e.boundingBox(); await tapXY(q.x + q.width / 2, q.y + q.height / 2, w); return q; };
const vid = () => p.evaluate(() => (S.song.video ? JSON.parse(JSON.stringify(S.song.video)) : null));
const markTap = async (k, d = 0) => { const I = await li(); const ms = I.marks.filter(m => /^REF/.test(m.label)); const m = ms[k]; if (!m) { await p.evaluate(x => { SV.x = x; UI.dirty.song = true; }, I.x0 + 200); await p.waitForTimeout(300); return d > 6 ? null : markTap(k, d + 1); }
  // scroll so the mark is in view
  if (m.x1 > I.canvas.w) { await p.evaluate(x => { SV.x = x; UI.dirty.song = true; }, m.x0 - 20 + I.x0); await p.waitForTimeout(300); return d > 6 ? null : markTap(k, d + 1); }
  await tapXY(I.canvas.x + (m.x0 + m.x1) / 2, I.canvas.y + 2 + (I.rulerH - (I.rulerH > 24 ? 8 : 0) - 4) / 2, 500); };
const spurSizes = () => p.evaluate(() => [...document.querySelectorAll('.pop button[data-t]')].map(b => { const q = b.getBoundingClientRect(); return b.textContent.trim() + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1); }));
// 1st Refrain → Matrix by touch
await markTap(0);
await tapSel('.pop .vvdr button[data-a="vv-matrix"]');
// Spur … list from the Marken-Blatt
await tapSel('.pop .vvdr button[data-a="vv-spur"]', 500); res.spurMarke = await spurSizes(); await p.screenshot({path: OUT + 'ui2-' + N + '-spur-marke.png'});
await p.evaluate(() => closePop()); await p.waitForTimeout(300);
res.v1 = await vid();
// 2nd Refrain → Marken-Blatt → Auf alle übertragen
await p.evaluate(() => { SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(200);
await markTap(1);
res.allBtn = await p.evaluate(() => { const e = document.querySelector('.pop button[data-a="all"]'); return e && {txt: e.textContent, dis: e.disabled}; });
await tapSel('.pop button[data-a="all"]', 600);
res.v2 = await vid();
res.toast2 = await p.evaluate(() => EL.toast ? EL.toast.innerText.replace(/\n/g, ' | ') : '');
res.stripeAfter = await p.evaluate(() => SV.vvS);
await p.screenshot({path: OUT + 'ui2-' + N + '-nach-auf-alle.png'});
await p.evaluate(() => SYNQUENZER.undo()); res.v2undo = await vid();
// 1-bar selection → ⋯ → Video → Spur …
await p.evaluate(() => { SV.x = 0; SV.sel = {a: 2, b: 2}; SV.pos = 2; svButtons(); rangeBarSync(); UI.dirty.song = true; }); await p.waitForTimeout(300);
await tapSel('#rangeBar button[data-a="more"]', 500);
await tapSel('.pop .vvdr button[data-a="vv-spur"]', 500); res.spur1Takt = await spurSizes(); await p.screenshot({path: OUT + 'ui2-' + N + '-spur-1takt.png'});
await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); svButtons(); UI.dirty.song = true; }); await p.waitForTimeout(300);
// hold the STIMME lane entry at bar 7 → „Im Video zeigen“, then again (= Auto)
const I = await li(); const pos = await p.evaluate(() => SV.rows.indexOf(stimmeT()));
res.stRow = pos;
if (pos >= 0) {
  const hx = I.canvas.x + 6 * I.cellW - I.x0 + I.cellW / 2, hy = I.canvas.y + I.rulerH + (pos + .5) * I.rowH;
  const hold = async () => { const c = await p.context().newCDPSession(p); await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: hx, y: hy}]}); await p.waitForTimeout(650); await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(500); await c.detach(); };
  await hold();
  res.stOpt = await p.evaluate(() => { const e = document.querySelector('.pop button[data-a="vvshow"]'); return {pop: UI.pop && UI.pop.name, cell: SV.cell, txt: e && e.innerText.replace(/\n/g, ' | ')}; });
  await p.screenshot({path: OUT + 'ui2-' + N + '-stimme-zelle.png'});
  if (res.stOpt.txt) await tapSel('.pop button[data-a="vvshow"]', 500);
  res.vSt = await vid();
  await hold();
  res.stOpt2 = await p.evaluate(() => { const e = document.querySelector('.pop button[data-a="vvshow"]'); return e && e.innerText.replace(/\n/g, ' | '); });
  if (res.stOpt2) await tapSel('.pop button[data-a="vvshow"]', 500);
  res.vSt2 = await vid();
}
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + 'ui2-' + N + '.json', JSON.stringify(res, null, 1));
await b.close();
