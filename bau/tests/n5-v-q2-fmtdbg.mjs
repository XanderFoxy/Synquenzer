// QA debug: why the first tap on [16:9] after opening the Video sheet is lost
import { open, buildSong } from './n5-v-q2-qmlib.mjs';
const {b, p, errs} = await open({w: 390, h: 844, touch: true, dpr: 3});
await buildSong(p);
const tapSel = async s => { const e = await p.$(s); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(600); };
await tapSel('#bMenu'); await tapSel('#menu button[aria-label="Video des Songs erstellen"]');
await p.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'click', 'touchstart', 'touchend']) document.addEventListener(t, e => { const el = e.target; window.__ev.push(t + ':' + (el.tagName + '.' + (el.className || '') + ' ' + (el.textContent || '').slice(0, 10)).replace(/\s+/g, ' ') + (e.pointerType ? ' ' + e.pointerType : '') + ' @' + Math.round(performance.now())); }, true); });
for (const t of (process.env.SEQ || '9:16,Auto,16:9').split(',')) {
  const e = await p.$(`#vvSheet button:text-is("${t}")`); const q = await e.boundingBox(); const x = q.x + q.width / 2, y = q.y + q.height / 2;
  const pre = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return {hit: h && (h.tagName + ' ' + h.textContent.slice(0, 12)), dis: h && h.disabled, busy: VV.busy, fmt: vvPrefs().fmt, pop: UI.pop && UI.pop.name}; }, [x, y]);
  await p.touchscreen.tap(x, y); await p.waitForTimeout(700);
  const post = await p.evaluate(() => { const r = window.__ev.slice(); window.__ev = []; return {fmt: vvPrefs().fmt + '/' + vvPrefs().view, ev: r}; });
  console.log(t, JSON.stringify(pre), JSON.stringify(post));
}
console.log('errs', errs); await b.close();
