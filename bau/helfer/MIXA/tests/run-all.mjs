// MIX-A: alle Abnahme-Tests nacheinander + bau/tests smoke, orch-mk-check, v3-mk2-wellen. node run-all.mjs [index.html]
import { execFileSync } from 'child_process'; import path from 'path';
const H = path.dirname(new URL(import.meta.url).pathname), APP = path.resolve(process.argv[2] || path.join(H, '../index.html')), T = path.resolve(H, '../../../tests');
const runs = [['mixa-klassen.mjs', [APP]], ['mixa-vorschlag.mjs', [APP]], ['mixa-master.mjs', [APP]], ['mixa-bitgleich.mjs', [APP]], ['mixa-perf.mjs', [APP]], ['mixa-layout.mjs', [APP]],
  [path.join(T, 'smoke.mjs'), [APP, path.join(H, 'bilder/smoke.png')]], [path.join(T, 'orch-mk-check.mjs'), [APP]], [path.join(T, 'v3-mk2-wellen.mjs'), [APP]]];
const res = [];
for (const [f, a] of runs) {
  let out = '', code = 0; const t0 = Date.now();
  try { out = execFileSync('node', [path.isAbsolute(f) ? f : path.join(H, f), ...a], {encoding: 'utf8', maxBuffer: 1 << 26}); } catch (e) { out = (e.stdout || '') + (e.stderr || ''); code = e.status; }
  const fails = out.split('\n').filter(l => /^FAIL|Error/.test(l));
  res.push([path.basename(f), code, Math.round((Date.now() - t0) / 1000) + ' s', fails.length ? fails.slice(0, 3).join(' | ') : out.trim().split('\n').pop()]);
  console.log(res[res.length - 1].join(' · '));
}
process.exit(res.some(r => r[1] && !/OFFEN/.test(r[3])) ? 1 : 0);
