// QA musiker VV2: does a tap on [16:9] in the Video sheet switch the format (after [Kamera] / [Ganz mit Balken])?
import { open, buildSong } from './n5-v-qm-lib.mjs';
const L = process.argv[2] === 'L', [W, H] = L ? [844, 390] : [390, 844], WAIT = +(process.argv[3] || 350);
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
await buildSong(p);
const tapText = async (txt, w = WAIT) => { const e = await p.$(`#vvSheet button:text-is("${txt}")`); await e.scrollIntoViewIfNeeded(); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(w); return q; };
const pf = () => p.evaluate(() => { const i = SYNQUENZER.vvInfo().prefs; return i.fmt + '/' + i.view + '/' + i.cam; });
const tapSel = async s => { const e = await p.$(s); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(600); };
await tapSel('#bMenu'); await tapSel('#menu button[aria-label="Video des Songs erstellen"]');
const log = ['start ' + await pf()];
for (const t of ['9:16', 'Auto', '16:9', '9:16', 'Ganz mit Balken', '16:9', '9:16', 'Kamera', '16:9', 'Matrix', '9:16', '16:9']) { const q = await tapText(t); log.push(t + ' → ' + await pf() + ' @' + Math.round(q.x) + ',' + Math.round(q.y) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height)); }
console.log(log.join('\n')); console.log('errs', errs);
await b.close();
