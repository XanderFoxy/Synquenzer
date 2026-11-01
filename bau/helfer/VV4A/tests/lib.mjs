// VV4-A Testhilfe: App öffnen (Schriften aus /fonts), Fehler sammeln
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../..');
export const APP = process.env.APP || path.resolve(HERE, '../index.html');
export const OUT = process.env.OUT || path.resolve(HERE, 'out');
const FD = 'file://' + ROOT + '/fonts/';
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 761}, deviceScaleFactor: o.dpr || 1});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/fonts\/|ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP)); await p.waitForTimeout(1200);
  const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '600 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '500 12px "JetBrains Mono"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// Testsong: 8 Takte, 2 Teile, Träger-Akkorde (mit Tasten) und eine Teil-Transposition
export const SONG = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, xp: [], marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
