import {open, sleep, OUT} from './v3-qa-gmk1-lib.mjs';
const T = await open(); const {p, E, errs} = T;
const r = await E(() => { const Q = window.SYNQUENZER; return {v: Q.version, keys: Object.keys(Q).filter(k => /mk|eng|sound|synth|edit|undo|redo|scene|song|save|load|import|export|serial/i.test(k)).sort()}; });
console.log(JSON.stringify(r));
console.log('errs', errs);
await T.br.close();
