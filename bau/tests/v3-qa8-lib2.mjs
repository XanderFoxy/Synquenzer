import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
const r = await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); openBrowser(0); await new Promise(r => setTimeout(r, 300));
  const chips = [...document.querySelectorAll('#sndSheet .brcats .chip')].map(c => (c.dataset.c || c.dataset.scope || '') + ':' + c.textContent.trim().split(/\s{2,}|\n/)[0]);
  const out = {chips};
  const initChip = document.querySelector('#sndSheet .brcats .chip[data-c="init"]');
  if (initChip) { BR.role = 'init'; BR.bank = 0; brRefresh(); out.init = [...document.querySelectorAll('#sndSheet .brow')].map(r => r.dataset.id + ' ' + r.querySelector('.bn, .nm, b') ?.textContent); }
  // all MS 2000 (no bank): count of programs listed (virtual list?) via browserRows
  BR.role = 'alle'; BR.bank = 0; brRefresh(); out.rowsAll = (SYNQUENZER.browserRows ? SYNQUENZER.browserRows() : []).length;
  out.list = brList(0, BR).length;
  return out; });
console.log(JSON.stringify(r, null, 1).slice(0, 2500));
console.log(errs);
await b.close();
