// playwright laden (lokal oder global installiert)
import {createRequire} from 'module';
import {execSync} from 'child_process';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
export const chromium = pw.chromium;
