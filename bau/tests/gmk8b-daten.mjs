// QA MK8b data: names, Levenshtein vs private list, counts of arp/seq per genre, vocoder mode/pairs/dir/hpf, dual/split, brand grep
import { chromium } from 'playwright';
import fs from 'fs';
const FILE = process.argv[2];
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const b = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await p.evaluate(async () => {
  mkLoad(); await MKK.decodeAll();
  const out = [];
  for (let g = 1; g <= 8; g++) for (let s = 1; s <= 16; s++) {
    const rec = MKK.rec(g, s), m = rec.p.mk;
    const t0 = m.t[0], t1 = m.t[1];
    const arpOn = !!(m.arp && (m.arp.on || m.arp.sw)), arpObj = m.arp;
    out.push({id: rec.id, g, s, name: rec.name, tip: rec.tip, role: MKK.roleOf(g, s), mode: m.mode, arpOn: m.arp.on, seqOn: m.t.map(t => t.seq && t.seq.on), voc: m.voc, dly: m.dly, ref: rec.ref, mw: rec.p.mw, mk: m});
  }
  return out;
});
fs.writeFileSync(new URL('./v3-qa-mk8b/daten.json', import.meta.url), JSON.stringify(r, null, 1));
console.log('errs', errs);
console.log(JSON.stringify(r[112].voc), JSON.stringify(r[0].dly));
await b.close();
