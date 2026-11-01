// erzeugt pv-layout.json einmal aus lktBuild() (danach eingefroren: nur hinten anhängen)
import {open} from './lib.mjs'; import fs from 'fs';
const {b, p} = await open();
const L = await p.evaluate(() => SYNQUENZER.pvLayout());
const f = new URL('../pv-layout.json', import.meta.url).pathname;
if (fs.existsSync(f) && !process.argv.includes('--neu')) { console.log('pv-layout.json existiert (eingefroren) – nichts geändert'); }
else { fs.writeFileSync(f, JSON.stringify(L) + '\n'); console.log('geschrieben', L.A.length, L.M.length); }
await b.close();
