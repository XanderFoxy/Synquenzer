import {loadK} from './kern.mjs';import {sing} from './gen.mjs';
const K=loadK(process.argv[2]);const S=sing({nm:'A2',sr:48000,dur:30,f0lo:85,f0hi:150,seed:23,breathy:0.02,gci:0.3});
const own=K.done(K.clickScan(S.x,S.sr,{}));for(const e of own){const N=S.notes.find(N=>e.t0>=N.t0&&e.t0<=N.t1);console.log(JSON.stringify(e),N?('in Note f0 '+N.f.toFixed(0)+' rel '+(e.t0-N.t0).toFixed(3)+'/'+(N.t1-e.t0).toFixed(3)):'Pause');}
