// VV4-B/D Tests: gemeinsamer Start (Chromium, Seite öffnen, Fehler sammeln) und der Testsong
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(HERE, '..', '..', 'index.html');
export const OUT = path.resolve(HERE, 'out');
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(o.wait || 1500);
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
/* Testsong (Takte 0-basiert; in Klammern die Takte wie in der App 1-basiert), 4 Teile à 8 Takte:
   Synth 1 Clip 1 ab Takt 1; Drums ab Takt 5 (Clip 1), ab Takt 21 Clip 2 (neu); Synth 2 Clip 1 („Clip A“) Takt 9–12 und wieder
   Takt 25–28 (zweiter Auftritt); Teil-Transposition +2 ab Takt 13; Übergang an der Kante 16|17 (2 Schläge vor Teil 3). */
export const SONG = {bars: 32,
  lanes: [[{bar: 0, slot: 0}], [{bar: 8, slot: 0}, {bar: 12, slot: -1}, {bar: 24, slot: 0}, {bar: 28, slot: -1}], [], [], [{bar: 4, slot: 0}, {bar: 20, slot: 1}], []],
  carrier: [], mel: {}, xp: [{beat: 48, semi: 2}],
  marks: [{id: 'm1', a: 0, len: 8, name: 'Intro'}, {id: 'm2', a: 8, len: 8, name: 'Strophe'}, {id: 'm3', a: 16, len: 8, name: 'Refrain'}, {id: 'm4', a: 24, len: 8, name: 'Strophe'}]};
export const UE = [{id: 'U1', m: 'M3', a: -2, len: 2, k: 'fill', t: 4, notes: [], mode: 'ersetzt'}];
