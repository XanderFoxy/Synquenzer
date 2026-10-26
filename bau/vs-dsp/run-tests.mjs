// run-tests.mjs — alle Tests nacheinander (Vordergrund): node run-tests.mjs
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
const dir = dirname(fileURLToPath(import.meta.url));
let fail = 0;
for (const t of ['test-clean.mjs', 'test-marks.mjs', 'test-stretch.mjs']) {
  const r = spawnSync(process.execPath, ['--expose-gc', join(dir, t)], {encoding: 'utf8', maxBuffer: 1 << 26});
  const out = r.stdout.split('\n').filter(l => !l.startsWith('SUMMARY')).join('\n');
  console.log(`\n===== ${t} =====\n` + out + (r.stderr ? '\n' + r.stderr : ''));
  if (r.status !== 0) fail++;
}
console.log(fail ? `\n${fail} Testdatei(en) mit Fehlern` : '\nAlle Tests grün');
process.exitCode = fail ? 1 : 0;
