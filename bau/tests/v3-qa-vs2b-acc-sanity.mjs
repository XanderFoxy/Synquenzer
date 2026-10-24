import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const D = loadDsp('../dirigent-wt/index.html');
for (const voice of ['male','female']) {
  const b = voice==='male'?52:64;
  const notes = [{on:0.3,dur:0.5,midi:b},{on:0.9,dur:0.5,midi:b+2,cons:'l'},{on:1.5,dur:0.4,midi:b+4,cons:'d'},{on:1.9,dur:0.6,midi:b+5,glide:0.1},{on:2.7,dur:0.8,midi:b+7,cons:'n',vib:{ct:60,hz:5.5,delay:0.2}},{on:3.6,dur:0.5,midi:b+4,cons:'s'}];
  const s = sing(notes,{voice,seed:3});
  const t0=Date.now(); const tr = D.pyin(s.x,{fs:16000}); const sg = D.segment(tr,{snap:false,tuning:'auto'});
  console.log(voice, Date.now()-t0,'ms', sg.tuneCt, JSON.stringify(sg.notes.map(n=>[+n.t0.toFixed(3),+n.t1.toFixed(3),n.n,n.m])));
  console.log(JSON.stringify(score(sg.notes,s.truth)));
}
