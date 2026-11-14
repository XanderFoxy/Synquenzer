import fs from 'node:fs';
const src = fs.readFileSync('./core.js', 'utf8');
const C = new Function(src + '\nreturn imp1Core;')()();
globalThis.__C = C;
