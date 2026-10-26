// MK-P ↔ MK8 seam: mkPanelProg with the MK8 object API window.mkProg (mock), and the fallback without it
import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], 'L1'); const fail = [];
const r = await page.evaluate(() => { const log = [], M = MKUI; let bank = 3;
  const base = {lcd: M.lcdLines()[0], lit: M.mkPanelProg('lit')};
  window.mkProg = {select: (b, s) => { log.push(['select', b, s]); return true; }, step: d => { log.push(['step', d]); return true; }, bank: d => { if (d) { bank += d; log.push(['bank', d]); } return bank; },
    write: () => null, restore: (b, s) => { log.push(['restore', b, s]); return true; }, current: () => ({bank: 3, slot: 5, label: 'C05', name: 'Test', text: 'C05:Test', own: true, edited: false})};
  M.P.mode = 'spiel'; M.press('bank.u'); M.press('bank.d'); M.press('s7'); M.press('yes'); M.press('no');
  const lcd = M.lcdLines()[0], lit = M.mkPanelProg('lit'); M.render(); const led5 = SYNQUENZER.mkPanel().elements.find(e => e.id === 's5').led;
  M.P.mode = 'edit'; M.view({modus: 'edit', seite: '26'}); const pg = M.curItem(); 
  delete window.mkProg; M.P.mode = 'spiel'; M.render();
  return {base, log, lcd, lit, led5, after: M.lcdLines()[0]}; });
console.log(JSON.stringify(r));
const exp = [['bank', 1], ['bank', -1], ['select', 3, 7], ['step', 1], ['step', -1]];
if (JSON.stringify(r.log) !== JSON.stringify(exp)) fail.push('log ' + JSON.stringify(r.log));
if (!/^C05:/.test(r.lcd)) fail.push('lcd ' + r.lcd); if (r.lit !== 5 || r.led5 !== 'on') fail.push('lit ' + r.lit + ' ' + r.led5);
if (!/^---:/.test(r.after) || !/^---:/.test(r.base.lcd)) fail.push('fallback ' + r.after);
if (page.errs.length) fail.push(page.errs.join('|'));
console.log('FEHLER', fail.length, JSON.stringify(fail)); await b.close();
