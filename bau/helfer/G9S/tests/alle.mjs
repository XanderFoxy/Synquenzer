// Alle G9a/G9b-V-Tests nacheinander (Vordergrund), Ergebnis-Dateien ergebnis-*.json
import {spawnSync} from 'child_process';
const HERE = new URL('.', import.meta.url).pathname; let bad = 0;
for (const t of ['silben.mjs', 'worker.mjs', 'operationen.mjs', 'ausrichtung.mjs', 'erkennung-v.mjs']) {
  const a = Date.now(), r = spawnSync(process.execPath, [HERE + t], {cwd: HERE, encoding: 'utf8'});
  const last = (r.stdout || '').trim().split('\n').pop(); if (r.status) bad++;
  console.log((r.status ? '✗ ' : '✓ ') + t.padEnd(18) + ((Date.now() - a) / 1000).toFixed(1).padStart(6) + ' s  ' + last + (r.stderr ? '\n' + r.stderr : ''));
}
console.log(bad ? bad + ' Test-Datei(en) rot' : 'alles grün'); process.exitCode = bad ? 1 : 0;
