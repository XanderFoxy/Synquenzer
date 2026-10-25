// QA group G-MK1 (MK0, MK1): launcher on the mk-wt copy with CDP touch helpers
import {open as open0, check, done, eq, canon, diff, res} from './v3-qa-gp2a-lib.mjs';
export {check, done, eq, canon, diff, res};
export const APPMK = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk1/';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(o = {}) { return open0(Object.assign({mic: false, file: process.env.SYNQ_APP || APPMK, viewport: {width: 428, height: 926}}, o)); }
