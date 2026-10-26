// A/B with effects, ◎ (Was ist anders?) for the effect positions, FX tab on the MS 2000 track, Hören (hold) with the delay
import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk4-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ensureAudio(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await sleep(800);
await E(async () => { const Q = SYNQUENZER; for (const [k, v] of Object.entries({'dly.dep': 100, 'dly.sync': 1, 'dly.note': 5, 'mfx.type': 2, 'mfx.dep': 80, 'eq.lg': 4})) Q.mkSet(0, k, v); await Q.saveSound(0, 'AB Basis', 'new'); });
await T.openEd(0);
await E(() => SYNQUENZER.mkSet(0, 'eq.hg', -12)); await T.w2(/^6 DELAY/); await T.sweep('k3', 110, 15, 20); console.log('dep after drag', await E(() => SYNQUENZER.mkGet(0).dly.dep)); await E(() => { UI.dirty.edHead = true; }); await sleep(300);
const abB = await T.rectText('button', /^A\/B$/);
console.log('A/B button', JSON.stringify(abB));
await T.tap(abB.cx, abB.cy, 500);
const sB = await E(() => { const m = SYNQUENZER.mkGet(0); return {eq: m.eq, dly: m.dly, mfx: m.mfx, name: SYNQUENZER.getSound(0).name}; }); const lB = await T.lcd2 ? await E(() => ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : null) : null;
await T.tap(abB.cx, abB.cy, 500);
const sA = await E(() => { const m = SYNQUENZER.mkGet(0); return {eq: m.eq, dly: m.dly, mfx: m.mfx}; });
check('B2 A/B: B = saved original (HOCH 0 dB, DELAY 100), A = the edit (HOCH −12, DELAY lower)', sB.eq.hg === 0 && sB.dly.dep === 100 && sA.eq.hg === -12 && sA.dly.dep < 100, {sB, sA, lB});
// ◎
const wia = await T.rectText('button.wia', /◎/) || await T.rectText('button', /^◎$/);
if (wia) await T.tap(wia.cx, wia.cy, 500);
await T.tapMk('w2', 400); const rows = await T.popTexts(); await T.closePop();
await p.screenshot({path: OUT + 'ab-wia-' + (L ? 'L' : 'P') + '.png'});
console.log('◎ rows', JSON.stringify(rows && rows.slice(4, 7)));
if (wia) await T.tap(wia.cx, wia.cy, 300);
// FX tab
const fxTab = await T.rectText('.tab', /^FX$/); if (fxTab) await T.tap(fxTab.cx, fxTab.cy, 600);
const fxCtl = await E(() => [...document.querySelectorAll('#synthSheet .sh-body *')].filter(e => e.children.length === 0 && e.offsetWidth && /Hall|Echo|Chorus|Drive|Pump/i.test(e.textContent)).map(e => e.textContent.trim()).slice(0, 12));
await p.screenshot({path: OUT + 'ab-fxtab-' + (L ? 'L' : 'P') + '.png'});
check('B3 FX tab (track effects) opens on the MS 2000 track', !!fxTab && fxCtl.length > 0, {fxCtl});
const gTab = await T.rectText('.tab', /^GERÄT$/); if (gTab) await T.tap(gTab.cx, gTab.cy, 600);
// Hören (hold) — delay audible after release
const hear = await T.rectText('button', /Hören|^▶$/);
const cap = await E(() => { const c = AU.ctx, node = AU.tracks[0].trackIn, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const Lb = []; window.__hc = {sp, Lb, node}; sp.onaudioprocess = e => Lb.push(Float32Array.from(e.inputBuffer.getChannelData(0))); node.connect(sp); sp.connect(z); z.connect(c.destination); return 1; });
await T.down(hear.cx, hear.cy); await sleep(300); await T.up(); await sleep(1500);
const hr = await E(() => { const {sp, Lb, node} = window.__hc; try { node.disconnect(sp); } catch (e) {} sp.disconnect(); const N = Lb.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of Lb) { x.set(b, o); o += b.length; } const W = Math.round(.05 * AU.ctx.sampleRate), env = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; env.push(Math.round(10 * Math.log10(s / W + 1e-20))); } return env; });
console.log('Hören env', hr.join(','));
check('B4 Hören (hold 0.3 s): the sound plays with its delay (echo after release)', hr.filter(v => v > -40).length > 8, hr.join(','));
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
