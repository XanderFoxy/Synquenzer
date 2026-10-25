import {open, sleep} from './v3-qa-gmk1-tl.mjs';
const T = await open(process.argv[2]==='L'?{viewport:{width:926,height:428}}:{}); const {E} = T;
await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); }); await sleep(300);
await E(() => { window.__st = []; const b = MKUI.build; MKUI.build = function (pg) { const r0 = pg.getBoundingClientRect(); const r = b.apply(this, arguments); window.__st.push(Math.round(r0.width)+'x'+Math.round(r0.height)+' fmt '+(MKUI.P.fmt&&MKUI.P.fmt.k)+' tab '+ (window.ED?ED.tab:'') + ' ' + new Error().stack.split('\n').slice(2,7).map(s=>s.trim().replace(/\(.*index.html/,'(').slice(0,50)).join(' < ')); return r; }; });
await E(() => SYNQUENZER.openEditor()); await sleep(800);
console.log((await E(() => window.__st)).join('\n'));
await T.br.close();
