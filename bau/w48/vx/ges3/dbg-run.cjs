// lädt synth aus kern-test (Kopie der Funktion) und zeigt Gründe
const fs=require('fs');const t=fs.readFileSync(__dirname+'/kern-test.cjs','utf8');
const a=t.indexOf('let NOISE=0;'),b=t.indexOf('// ---------- (A)');
const env=new Function(t.slice(a,b)+';return {synth,setN:v=>{NOISE=v;}};')();
env.setN(0.0003);
const M=require('./dbg.cjs');
const ph=JSON.parse(process.argv[3]);
const {x}=env.synth(ph,48000,11,0.3);globalThis.DBG=[];
const r=M.detectMarks(x,48000,{g3:1});
for(const d of DBG)console.log(JSON.stringify(d));console.log('marks',r.length);
