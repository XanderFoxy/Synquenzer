// Ist das Panorama der STIMME-Spur in der Oberfläche erreichbar? (Spurkopf tippen → Editor → SPUR)
import {open, sleep, APP, mysing, i16} from './n4-vs-p-qa-h.mjs';
const H = await open({file: process.argv[2] || APP, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); });
const sr = 48000, y = mysing(4, sr, -28, 1).y;
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 2}), [i16(y), sr]);
await sleep(600);
const st = r.track;
await p.evaluate(() => SYNQUENZER.trackBank(1)); await sleep(400);
const heads = await p.evaluate(() => [...document.querySelectorAll('.th')].map(e => { const b = e.getBoundingClientRect(); return {t: e.dataset.t, cls: e.className, txt: e.textContent.trim().slice(0, 20), x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2), w: Math.round(b.width), h: Math.round(b.height)}; }));
console.log('STIMME =', st, JSON.stringify(heads));
await p.screenshot({path: S0() + '/qa-panui-0.png'});
function S0() { return '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n4vsp'; }
const h = heads.find(x => +x.t === st && x.w > 0);
if (h) {
  await p.touchscreen.tap(h.x, h.y); await sleep(400);
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.className + ' ' + (e.closest('.th') ? 'th' : '') : null; }, [h.x, h.y]);
  console.log('Treffer', hit, 'selT', await p.evaluate(() => R.selT));
  await p.touchscreen.tap(h.x, h.y); await sleep(800);
  console.log('Editor', await p.evaluate(() => ({editor: R.editor, selT: R.selT, eng: S.tracks[R.selT].sound.engine})));
  const tabs = await p.evaluate(() => [...document.querySelectorAll('button, .tab, [role=tab]')].filter(b => b.offsetParent && b.closest('.sheet.open, #synthSheet.open')).map(b => b.textContent.trim()).filter(Boolean));
  console.log('Knöpfe im Editor:', tabs.slice(0, 50).join(' | '));
  // Reiter FX/SPUR suchen und Panorama-Regler finden
  const fx = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /^(FX|EFFEKTE|Effekte)$/i.test(b.textContent.trim())); if (!b.length) return null; const r = b[0].getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: b[0].textContent}; });
  console.log('FX-Reiter', JSON.stringify(fx));
  if (fx) { await p.touchscreen.tap(fx.x, fx.y); await sleep(500); }
  const kn = await p.evaluate(() => [...document.querySelectorAll('.knob')].filter(k => k.offsetParent).map(k => k.textContent.trim().slice(0, 40)));
  console.log('Regler:', kn.join(' | '));
  await p.screenshot({path: S0() + '/qa-panui-1.png'});
}
await H.br.close();
