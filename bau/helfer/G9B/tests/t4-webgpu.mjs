// G9B T4: WebGPU-Weg (Chromium mit Software-WebGPU, erzwungen ?g9how=webgpu): entweder Erkennung über WebGPU oder sauberer Rückfall auf WASM
// (gemerkt in localStorage, fehlende WASM-Dateien einmal nachgeladen) – in beiden Fällen Wörter, keine Konsolen-Fehler
import {open, sleep, report, cdn, wavTake, DIR} from './h.mjs';
import {createRequire} from 'module'; import path from 'path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const ok = report(), br = await chromium.launch({args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader']});
const {p, errs} = await open(br, {q: '?g9how=webgpu', route: c => cdn(c)});
const gpu = await p.evaluate(async () => { const a = navigator.gpu && await navigator.gpu.requestAdapter(); return a ? 'Adapter, shader-f16 ' + a.features.has('shader-f16') : 'kein Adapter'; });
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await wavTake(p, path.join(DIR, 'daten/en-flite.wav'), 0);
const t0 = Date.now();
const res = await p.evaluate(r => SYNQUENZER.g9Recognize(r, {lang: 'en', mode: 'all'}), tk.ref);
const a = await p.evaluate(() => SYNQUENZER.g9Asr()), mem = await p.evaluate(() => localStorage.getItem('synq-g9-asr-how'));
console.log(gpu, '| Weg', a.sm.how, '| gemerkt', mem, '| diag', a.diag.join(' | '), '|', Date.now() - t0, 'ms gesamt');
ok(res && res.words && res.words.length >= 8, 'Wörter erkannt (' + (res && res.words.length) + ') über ' + a.sm.how + (a.sm.how === 'wasm' ? ' (Rückfall, gemerkt: ' + mem + ')' : ''));
const gl = await p.evaluate(() => caches.open('synq-g9-asr-v1').then(c => c.keys()).then(k => k.map(r => r.url).filter(u => /asyncify|_fp16/.test(u)).length));
ok(a.sm.how !== 'wasm' || gl === 0, 'nach Rückfall keine WebGPU-Dateien mehr im Cache (' + gl + ')');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|').slice(0, 300));
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
