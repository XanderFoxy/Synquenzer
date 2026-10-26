// typische Fehler 9 / MK-P-10: changes through the plate (touch) survive save → reload deep-equal; E1/E2 level and the view state are not stored;
// view changes alone neither change soundHash nor trigger autosave
import {launch, open, openMk, touch, tap, line, panel, ctr, tapSel} from './v3-qmkp-lib.mjs';
const b = await launch(); const fails = []; const log = [];
const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
const drag = async (id, dy) => { const E = (await panel(page)).elements.find(e => e.id === id); const [x, y] = ctr(E); await touch(page, line(x, y, x, y + dy, 12), 16); await page.waitForTimeout(80); };
const press = async id => { const E = (await panel(page)).elements.find(e => e.id === id); await tap(page, ...ctr(E)); await page.waitForTimeout(80); };
for (const [id, dy] of [['f.cut', 40], ['f.res', -50], ['o1.c1', -30], ['k1', -40], ['k8', -30], ['k13', -30], ['porta', -20], ['ain.1', 30], ['ain.2', -20], ['arp.gate', 20], ['vol', 20]]) await drag(id, dy);
for (const id of ['o1.wave', 'o2.mod', 'f.type', 'a.dist', 'l1.sel', 'vp.s', 'vp.d', 'arp.type', 'arp.range']) await press(id);
await press('sq.sel'); await drag('k5', -40); await press('sq.sel'); await press('sq.sel'); await press('sq.sel');   // SEQ 1 step 5
await press('fx.sel'); await drag('k11', -30); await drag('k12', -30); await press('fx.sel');                         // delay time / feedback
await page.evaluate(() => MKUI.view({ansicht: 'zoom', halt: 7})); await page.waitForTimeout(300);
const before = await page.evaluate(() => ({mk: JSON.stringify(SYNQUENZER.mkGet(0)), vol: S.tracks[0].sound.fx.vol, trim: JSON.stringify(R.mkInTrim), name: S.tracks[0].sound.name, uid: S.tracks[0].uid}));
log.push('trim live ' + before.trim);
const ser = await page.evaluate(() => SYNQUENZER.serialize());
if (/mkInTrim|"e1":\s*\d+,\s*"e2"/.test(ser)) fails.push('E1/E2 level found in the project file');
if (/"ansicht"|"halt"|letzterHalt|seitenSprung/.test(ser)) fails.push('view state found in the project file');
await page.evaluate(() => SYNQUENZER.save()); await page.waitForTimeout(800);
await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(800);
const after = await page.evaluate(() => ({mk: JSON.stringify(SYNQUENZER.mkGet(0)), vol: S.tracks[0].sound.fx.vol, trim: JSON.stringify(R.mkInTrim || null), name: S.tracks[0].sound.name}));
if (after.mk !== before.mk) { const A = JSON.parse(before.mk), B = JSON.parse(after.mk); const d = []; const walk = (a, b, p) => { if (typeof a !== 'object' || a === null) { if (a !== b) d.push(p + ': ' + a + ' -> ' + b); return; } for (const k of new Set([...Object.keys(a), ...Object.keys(b || {})])) walk(a[k], (b || {})[k], p + '.' + k); }; walk(A, B, ''); fails.push('reload not deep-equal: ' + d.slice(0, 8).join('; ')); }
if (after.vol !== before.vol) fails.push('vol ' + before.vol + ' -> ' + after.vol);
log.push('after reload trim ' + after.trim);
// import of the serialized file
const imp = await page.evaluate(async ser => { try { await SYNQUENZER.importJSON(ser); } catch (e) { return 'ERR ' + e; } await new Promise(r => setTimeout(r, 500)); return JSON.stringify(SYNQUENZER.mkGet(0)); }, ser);
if (imp !== before.mk) fails.push('importJSON not deep-equal' + (String(imp).startsWith('ERR') ? ' ' + imp : ''));
// view changes: no soundHash change, no autosave
await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForFunction(() => window.MKUI && MKUI.PL.ready && SYNQUENZER.mkPanel(), null, {timeout: 10000}); await page.waitForTimeout(400);
const h0 = await page.evaluate(() => ({h: SQStore.soundHash(S.tracks[0].sound), dirty: typeof UI.saveDirty !== 'undefined' ? UI.saveDirty : null, saves: (window.__saves = 0)}));
await page.evaluate(() => { const o = saveNow; window.__saveCalls = 0; });
for (const act of [() => tapSel(page, '.mknav .mkar:last-child'), () => tapSel(page, '.mknav .mkmap'), () => press('edit'), () => press('s6'), () => press('cur.r'), () => press('pg.p'), () => press('global'), () => press('exit'), () => press('fx.sel'), () => press('vp.sel'), () => press('sq.sel'), () => press('sq.sel'), () => press('sq.sel'), () => press('sq.sel'), () => tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="spiel"]'), () => tapSel(page, '#synthSheet .sh-tabs .tab[data-tab="geraet"]')]) { await act(); await page.waitForTimeout(150); }
const h1 = await page.evaluate(() => ({h: SQStore.soundHash(S.tracks[0].sound), undo: SYNQUENZER.undoInfo().n}));
if (h1.h !== h0.h) fails.push('view changes changed soundHash');
log.push('undo after view changes ' + h1.undo);
console.log(log.join('\n')); console.log('FAILS', fails.length); for (const x of fails) console.log('  ' + x); console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
