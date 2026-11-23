(async()=>{const o={};o.keys=Object.keys(SYNQUENZER).slice(0,200);
o.lk=Object.keys(SYNQUENZER).filter(k=>/lk|lock/i.test(k));
try{o.ks=['ksF2c','ksPe','ksR1','ksG1','ksAa','ksF2r','ksF2e','ksF2m'].map(k=>[k,LKT[k]]);}catch(e){o.e=String(e)}
try{o.miss=LKX.miss}catch(e){}
o.tracks=S.tracks.map(t=>[t.name,t.type,t.engine||(t.sound&&t.sound.eng)]);
return o;})()
