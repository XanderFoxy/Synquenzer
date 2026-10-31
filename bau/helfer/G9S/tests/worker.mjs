// G9-01 (Teil): Kern als toString() in einem Worker (wie Blob-Worker der App) → gleiche Silben und gleiche Ausrichtung wie im Haupt-Faden
import fs from 'fs'; import {Worker} from 'worker_threads'; import {createRequire} from 'module';
const require = createRequire(import.meta.url), {g9Make} = require('../g9-kern.js');
const HERE = new URL('.', import.meta.url).pathname, MU = HERE + '../../../../vendor/g9/syl/';
const wa = {de: fs.readFileSync(MU + 'de-x-syllable.wasm'), en: fs.readFileSync(MU + 'en-us.wasm')};
const K = g9Make(); K.sylLoad('de', wa.de); K.sylLoad('en', wa.en);
const words = {de: [], en: []}; for (const l of ['de', 'en']) words[l] = fs.readFileSync(HERE + 'daten/silben-' + l + '.tsv', 'utf8').trim().split('\n').map(r => r.split('\t')[0]);
const marks = [], F = []; for (let k = 0; k < 120; k++) { marks.push({t: 0.3 + k * 0.27, conf: (k * 37 % 10) / 10}); F.push({rise: k % 5 ? 20 : 1, gap: k % 9 ? 0 : 300, pj: k % 5 ? 0 : 120, vo: 1, von: 0.33 + k * 0.27, uv: 0, dur: 0.27, conf: (k * 37 % 10) / 10, vf: 0}); }
const text = words.de.slice(0, 40).join(' ');
const src = g9Make.toString() + `\nconst {parentPort, workerData} = require('worker_threads'); const K = g9Make(); K.sylLoad('de', workerData.de); K.sylLoad('en', workerData.en);
const out = {de: workerData.w.de.map(w => K.syl(w, 'de')), en: workerData.w.en.map(w => K.syl(w, 'en')), a: K.align(K.words(workerData.text, 'de'), workerData.marks, workerData.F)}; parentPort.postMessage(out);`;
const w = new Worker(src, {eval: true, workerData: {de: wa.de, en: wa.en, w: words, text, marks, F}});
w.on('message', r => {
  const same = l => words[l].filter((x, i) => JSON.stringify(K.syl(x, l)) === JSON.stringify(r[l][i])).length;
  const a = JSON.stringify(K.align(K.words(text, 'de'), marks, F)) === JSON.stringify(r.a);
  const res = {de: same('de') + '/' + words.de.length, en: same('en') + '/' + words.en.length, ausrichtungGleich: a};
  console.log(JSON.stringify(res)); const ok = same('de') === words.de.length && same('en') === words.en.length && a;
  fs.writeFileSync(HERE + 'ergebnis-worker.json', JSON.stringify(res)); console.log(ok ? 'Worker = Haupt-Faden BESTANDEN' : 'NICHT bestanden'); process.exitCode = ok ? 0 : 1; w.terminate();
});
