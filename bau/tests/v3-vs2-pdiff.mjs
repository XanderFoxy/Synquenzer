import {chromium} from 'playwright'; import {EXE} from './v3-vs2-h.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const out = [];
for (const u of ['synq-snapshots/V2d-fix.html', 'dirigent-wt/index.html', 'dirigent-wt/index.html']) { const br = await chromium.launch({executablePath: EXE}); const pg = await br.newPage(); await pg.goto('file://' + SCR + u); await pg.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); out.push(await pg.evaluate(() => SYNQUENZER.project())); await br.close(); }
const diff = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (typeof a !== 'object' || !a || !b) return [path + ': ' + JSON.stringify(a).slice(0, 60) + ' ≠ ' + JSON.stringify(b).slice(0, 60)]; const ks = new Set([...Object.keys(a), ...Object.keys(b)]); return [...ks].flatMap(k => diff(a[k], b[k], path + '.' + k)); };
console.log('old↔new', diff(out[0], out[1]).slice(0, 10)); console.log('new↔new', diff(out[1], out[2]).slice(0, 10));
