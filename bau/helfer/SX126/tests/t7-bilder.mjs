// Bildschirmfotos 428×926, 926×428, 428×650: Marken-Blatt des letzten Teils (Ausblenden + [Bei Takt …]), Messer in der Taktleiste,
// Blatt „Video“ mit Zeile „Ausblenden“ (mit Auswahl), leerer Song mit [Aus Vorlage …]; Tasten ≥ 44 px, nichts ragt aus dem Bild
import { open, SONG8, OUT, PICS } from './sx-lib.mjs';
import fs from 'fs';
fs.mkdirSync(PICS, {recursive: true});
const res = {}; let ok = true;
const SIZES = [[428, 926], [926, 428], [428, 650]];
const touch = sel => `[...document.querySelectorAll(${JSON.stringify(sel)})].filter(x => x.offsetParent !== null && !x.closest('[hidden]')).map(x => { const r = x.getBoundingClientRect(); return {t: (x.getAttribute('aria-label') || x.textContent).slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right), b: Math.round(r.bottom), tp: Math.round(r.top)}; })`;
for (const [w, h] of SIZES) {
  const tag = w + 'x' + h, R = {}; let okS = true;
  const {b, p, errs} = await open({w, h});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); SYNQUENZER.sx1Fade(4); }, SONG8); await p.waitForTimeout(500);
  // 1) Marken-Blatt des letzten Teils
  await p.evaluate(() => openMarkSheet('M2')); await p.waitForTimeout(400);
  await p.screenshot({path: `${PICS}/sx1-markenblatt-${tag}.png`});
  const mk = await p.evaluate(touch('.msheet .sx1-b, .msheet .sx2-sb'));
  const fit = await p.evaluate(() => { const s = document.querySelector('.msheet'); const r = s.getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, vw: innerWidth, right: Math.round(r.right), rows: [...s.querySelectorAll('.sx126-rows .ms-r')].map(x => x.scrollWidth <= x.clientWidth + 1)}; });
  R.markenblatt = {tasten: mk, passt: fit};
  const mkOk = mk.length === 5 && mk.every(x => x.w >= 44 && x.h >= 44 && x.r <= fit.vw && x.b <= fit.vh) && fit.rows.every(Boolean);
  R.markenblatt.ok = mkOk; okS = okS && mkOk;
  // erster Teil: keine Ausblend-Zeile
  await p.evaluate(() => { closePop(); openMarkSheet('M1'); }); await p.waitForTimeout(300);
  const first = await p.evaluate(() => ({fade: !!document.querySelector('.msheet .sx1-r'), klinge: !!document.querySelector('.msheet .sx2-sb')}));
  R.ersterTeil = Object.assign(first, {ok: !first.fade && first.klinge}); okS = okS && R.ersterTeil.ok;
  await p.evaluate(() => closePop());
  // 2) Messer in der Taktleiste (Refrain geöffnet, Strich vor Takt 7)
  await p.evaluate(() => { SV.x = 0; SV.sel = {a: 5, b: 5}; SV.sx2 = {id: 'M2', n: 6, ver: UI.songVer | 0}; UI.dirty.song = true; svDraw(true); }); await p.waitForTimeout(300);
  await p.screenshot({path: `${PICS}/sx2-messer-${tag}.png`});
  const kn = await p.evaluate(() => SYNQUENZER.sx2Knife());
  R.messer = {kn, ok: !!(kn && kn.shown && kn.rect.w >= 44 && kn.rect.h >= 44)}; okS = okS && R.messer.ok;
  await p.evaluate(() => { SV.sx2 = null; SV.sel = {a: 4, b: 7}; UI.dirty.song = true; });
  // 3) Blatt „Video“ mit Auswahl
  await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(700);
  await p.screenshot({path: `${PICS}/sx1-videoblatt-${tag}.png`});
  const vv = await p.evaluate(touch('.vvsheet .sx1-seg button'));
  const vf = await p.evaluate(() => { const c = document.querySelector('.vvctl'), r = document.querySelector('.sx1-vr'), rr = r.getBoundingClientRect(); return {ctlRollt: c.scrollHeight > c.clientHeight + 1, zeile: {top: Math.round(rr.top), bottom: Math.round(rr.bottom), right: Math.round(rr.right)}, vh: innerHeight, vw: innerWidth, hint: r.querySelector('.sx1-h').textContent, on: [...r.querySelectorAll('button.on')].map(b => b.textContent)}; });
  R.videoblatt = {tasten: vv, info: vf};
  const vvOk = vv.length === 4 && vv.every(x => x.w >= 44 && x.h >= 44 && x.r <= vf.vw && x.b <= vf.vh) && vf.zeile.right <= vf.vw && !vf.ctlRollt && vf.on.join() === '4' && vf.hint === 'Auswahl-Ende';
  R.videoblatt.ok = vvOk; okS = okS && vvOk;
  // Tipp auf „2“ im Video-Blatt = 1 Undo, Wert 8 Schläge
  const u0 = await p.evaluate(() => UNDO.length); const b2 = vv[1];
  if (b2) { await p.mouse.click((b2.l + b2.r) / 2, (b2.tp + b2.b) / 2); await p.waitForTimeout(250); }
  const after = await p.evaluate(() => ({out: SYNQUENZER.sx1Info().out, undo: UNDO.length, on: [...document.querySelectorAll('.sx1-vr button.on')].map(b => b.textContent)}));
  R.videoTipp = Object.assign(after, {undoSchritte: after.undo - u0, ok: after.out === 8 && after.undo - u0 === 1 && after.on.join() === '2'}); okS = okS && R.videoTipp.ok;
  await p.evaluate(() => SYNQUENZER.vvClose());
  // 4) leerer Song: [Aus Vorlage …]
  await p.evaluate(() => { SYNQUENZER.setSong(null); setSongView(true); }); await p.waitForTimeout(400);
  await p.screenshot({path: `${PICS}/sx6-leer-${tag}.png`});
  const eb = await p.evaluate(touch('.sv-empty .kbtn'));
  R.leer = {tasten: eb, ok: eb.length === 3 && eb.every(x => x.h >= 44 && x.r <= w && x.b <= h)}; okS = okS && R.leer.ok;
  await p.evaluate(() => sx6Open(document.querySelector('.sv-empty .sx6-b'))); await p.waitForTimeout(300);
  await p.screenshot({path: `${PICS}/sx6-vorlagen-${tag}.png`});
  const pop = await p.evaluate(() => { const r = document.querySelector('.sx6pop').getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right)}; });
  R.vorlagenPop = Object.assign(pop, {ok: pop.top >= 0 && pop.bottom <= h && pop.left >= 0 && pop.right <= w}); okS = okS && R.vorlagenPop.ok;
  R.errors = errs; okS = okS && !errs.length;
  R.ok = okS; res[tag] = R; ok = ok && okS;
  await b.close();
}
console.log(JSON.stringify(res, (k, v) => (k === 'tasten' ? v.map(x => x.t + ' ' + x.w + '×' + x.h) : v), 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t7-bilder.json', JSON.stringify(res, null, 1));
process.exit(ok ? 0 : 1);
