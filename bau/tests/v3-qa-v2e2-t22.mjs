// QA V2e′ t22: preview cells / ghost mini lanes for each part key (slot-based part REFRAIN, lane part STROPHE); preview == result
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
const STATES = (a, L) => E(([a, L]) => { const s = window.SYNQUENZER.song(); const out = []; for (let tr = 0; tr < s.lanes.length; tr++) { const r = []; for (let bb = a; bb < a + L; bb++) { let x = -1; for (const e of s.lanes[tr]) { if (e.bar > bb) break; x = e.slot; } r.push(x); } out.push(r); } return out; }, [a, L]);
for (const j of [0, 1]) {
  const k = await t.key(j); console.log('key', j, k.txt);
  await t.down(k.x, k.y); await sleep(1120);
  const inf = await t.info();
  await t.glide(k.x, k.y, inf.canvas.x + 7 * 36 + 3 - inf.x0, inf.canvas.y + 100, 8, 16);
  const pv = await E(() => SV.pv ? {a: SV.pv.a, len: SV.pv.len, cells: SV.pv.cells} : null);
  const mini = await E(() => document.querySelectorAll('.drg-ghost .dg-m i').length);
  console.log('preview', JSON.stringify(pv), 'ghost mini rows', mini);
  await t.up(); await sleep(500);
  const st = await STATES(7, pv ? pv.len : 4);
  console.log('result states', JSON.stringify(st));
  // compare: preview cells (non-null) vs result
  const cells = pv && pv.cells || [];
  let mismatch = [];
  for (let tr = 0; tr < st.length; tr++) { const c = cells[tr]; if (!c) continue; for (let x = 0; x < c.length; x++) if (c[x] != null && c[x] !== st[tr][x]) mismatch.push([tr, x, c[x], st[tr][x]]); }
  const shown = cells.filter(c => c && c.some(s => s >= 0)).length, sounding = st.filter(r => r.some(s => s >= 0)).length;
  check(`${VP} ${k.txt}: preview shows the tracks that will play (${sounding})`, shown === sounding && !mismatch.length, {shown, sounding, mismatch});
  check(`${VP} ${k.txt}: ghost has mini lanes`, mini > 0, mini);
  await E(() => window.SYNQUENZER.undo()); await sleep(200);
  await E(() => window.SYNQUENZER.songView(false)); await sleep(200);
}
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
