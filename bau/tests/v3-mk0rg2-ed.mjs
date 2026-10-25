// QA regression MK0: synth editor (VA knobs dragged with the mouse), engine switch to FM via the chip, FM page and its tabs,
// drum editor, random 🎲, Sichern (save own sound), browser preview + load; base vs new. usage: node v3-mk0rg2-ed.mjs base|new P1|L1
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which, vp] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, vp, false);
const r = {};
const vis = s => p.evaluate(s => [...document.querySelectorAll(s)].filter(x => x.offsetParent && getComputedStyle(x).visibility !== 'hidden'), s);
const clickText = async (sel, re) => { const ok = await p.evaluate(([s, re]) => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent && new RegExp(re).test(x.textContent.trim())); if (!e) return false; e.setAttribute('data-qa2', 'x'); return true; }, [sel, re]); if (!ok) return false; r.steps = (r.steps || []).concat(re); const ok2 = await p.click('[data-qa2=x]', {timeout: 3000}).then(() => true, e => 'blocked:' + re); if (ok2 !== true) { r.blocked = (r.blocked || []).concat(ok2 + ' pop=' + await p.evaluate(() => { const L = document.getElementById('popLayer'); return L ? L.className + ' ' + L.textContent.trim().slice(0, 120) : ''; })); } await p.evaluate(() => { const e = document.querySelector('[data-qa2=x]'); if (e) e.removeAttribute('data-qa2'); }); return true; };
try {
await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.selectSlot(0, 0); Q.launchScene(0); });
await p.waitForTimeout(600);
await p.click('#bKlang'); await p.waitForTimeout(600);
r.ed = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
r.eng0 = await p.evaluate(() => window.SYNQUENZER.getSound(0).engine);
r.knobs = await p.evaluate(() => [...document.querySelectorAll('.knob')].filter(x => x.offsetParent).map(x => x.dataset.key));
r.nvp = await p.evaluate(() => !!document.querySelector('.nvp'));
// drag the first visible knob up 60 px
const kn = await p.evaluate(() => { const k = [...document.querySelectorAll('.knob')].find(x => x.offsetParent && !x.classList.contains('inert') && x.dataset.key === 'o1lvl') || [...document.querySelectorAll('.knob')].find(x => x.offsetParent && !x.classList.contains('inert')); const q = k.getBoundingClientRect(); return {key: k.dataset.key, x: q.x + q.width / 2, y: q.y + q.height / 2}; });
const before = await p.evaluate(k => window.SYNQUENZER.getParam(0, k), kn.key);
await p.mouse.move(kn.x, kn.y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(kn.x, kn.y + 6 * i); await p.waitForTimeout(16); } await p.mouse.up();
await p.waitForTimeout(200);
r.knob = {key: kn.key, before, after: await p.evaluate(k => window.SYNQUENZER.getParam(0, k), kn.key)};
r.knobChanged = r.knob.before !== r.knob.after;
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(150);
r.knobUndo = await p.evaluate(k => window.SYNQUENZER.getParam(0, k), kn.key) === before;
// tabs of the VA editor
const tabs = await p.evaluate(() => [...document.querySelectorAll('.pg button, .edtabs button, [data-tab]')].filter(x => x.offsetParent).map(x => x.textContent.trim()).filter(t => /^(OSZ|FILTER|HÜLLK\.|LFO|MOD|FX)$/.test(t)));
r.tabs = tabs; r.tabKnobs = [];
for (const t of tabs) { await clickText('button', '^' + t.replace('.', '\\.') + '$'); await p.waitForTimeout(150); r.tabKnobs.push(t + ':' + (await p.evaluate(() => [...document.querySelectorAll('.knob')].filter(x => x.offsetParent).length))); }
// engine chip FM
r.fmChip = await clickText('button', '^FM$'); await p.waitForTimeout(500);
r.eng1 = await p.evaluate(() => window.SYNQUENZER.getSound(0).engine);
r.fmUi = await p.evaluate(() => window.SYNQUENZER.fmUi());
r.fmKnobs = await p.evaluate(() => [...document.querySelectorAll('.pg .knob, .pg canvas, .pg .fader')].filter(x => x.offsetParent).length);
await p.screenshot({path: OUT + `ed-fm-${which}-${vp}.png`});
// 🎲
const s0 = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.getSound(0).p));
r.dice = await clickText('button', '^🎲$'); await p.waitForTimeout(300);
r.diceChanged = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.getSound(0).p)) !== s0;
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(150);
r.diceUndo = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.getSound(0).p)) === s0;
// back to VA via chip
r.vaChip = await clickText('button', '^VA$'); await p.waitForTimeout(400); r.eng2 = await p.evaluate(() => window.SYNQUENZER.getSound(0).engine);
// Sichern → own sound in library
const lib0 = await p.evaluate(() => window.SYNQUENZER.library().length);
r.save = await clickText('button', '^Sichern$'); await p.waitForTimeout(500);
r.saveSheet = await p.evaluate(() => [...document.querySelectorAll('.sheet, .pop')].filter(x => x.offsetParent).map(x => x.textContent.trim().slice(0, 60)));
// confirm if a sheet asks
await p.fill('#popLayer .pop .tin', 'QA Klang').catch(() => {}); await p.click('#popLayer .pop .savrow button.go', {timeout: 3000}).catch(e => { r.saveErr = String(e).slice(0, 100); }); await p.waitForTimeout(500);
r.libGrew = await p.evaluate(() => window.SYNQUENZER.library().length) - lib0;
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor && Q.closeEditor(); }); await p.waitForTimeout(300);
// drum editor
r.popBeforeDrum = await p.evaluate(() => { const L = document.getElementById('popLayer'); return L ? L.className + ' | ' + L.textContent.trim().replace(/\s+/g, ' ').slice(0, 160) : ''; });
await p.evaluate(() => { try { closeSheets(); } catch (e) {} }); await p.waitForTimeout(300);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectTrack ? Q.selectTrack(4) : Q.selectSlot(4, 0); Q.selectSlot(4, 0); });
await p.click('#bKlang'); await p.waitForTimeout(500);
r.ed2 = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
r.drumUi = await p.evaluate(() => ({knobs: [...document.querySelectorAll('.knob')].filter(x => x.offsetParent).length, buttons: [...document.querySelectorAll('.pg button')].filter(x => x.offsetParent).length, nvp: !!document.querySelector('.nvp')}));
await p.screenshot({path: OUT + `ed-drum-${which}-${vp}.png`});
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.closeEditor && Q.closeEditor(); Q.clearLog(); Q.pad('kick'); Q.pad('snare'); });
await p.waitForTimeout(400);
r.pads = await p.evaluate(() => window.SYNQUENZER.noteLog(50).filter(n => n.track === 4).length);
// browser: open, preview first row, load second row
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(1, 0); Q.openBrowser(1); }); await p.waitForTimeout(500);
r.rows = await p.evaluate(() => [...document.querySelectorAll('.brow')].filter(x => x.offsetParent).length);
const s1 = await p.evaluate(() => window.SYNQUENZER.getSound(1).name);
r.bprev = await p.evaluate(() => { const b = [...document.querySelectorAll('.brow')].filter(x => x.offsetParent)[1]; const pv = b && b.querySelector('button'); if (pv) pv.setAttribute('data-qa3', 'pv'); const nm = b && b.querySelector('.bmain'); if (nm) nm.setAttribute('data-qa3', 'nm'); return !!pv; });
await p.click('[data-qa3=pv]').catch(() => {}); await p.waitForTimeout(500); r.previewOn = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.previewState()).slice(0, 120));
await p.click('[data-qa3=nm]').catch(() => {}); await p.waitForTimeout(500);
r.loaded = await p.evaluate(() => window.SYNQUENZER.getSound(1).name) !== s1;
r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
} catch (e) { r.FAIL = String(e).slice(0, 300); r.failPop = await p.evaluate(() => { const L = document.getElementById('popLayer'); return L ? L.className + ' | ' + L.innerHTML.slice(0, 400) : ''; }); await p.screenshot({path: OUT + `ed-fail-${which}-${vp}.png`}); }
r.errs = errs.slice();
fs.writeFileSync(OUT + `ed-${which}-${vp}.json`, JSON.stringify(r, null, 1));
console.log(which, vp, 'done');
await close();
