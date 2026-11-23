(async()=>{const i=0;selectSlot(i,0);openEditor();await new Promise(r=>setTimeout(r,300));ED.tab='lfo';ED.sub.lfo='l1';safeRebuild(buildSynthEd);await new Promise(r=>setTimeout(r,300));
setP(i,'l1sync',4);ks4Set(i,'ksR1',8);safeRebuild(buildSynthEd);await new Promise(r=>setTimeout(r,400));
const pvs=[...document.querySelectorAll('.lfopv')];return pvs.map(pv=>({con:pv.isConnected,g:!!pv.querySelector('.ksmg'),n:pv.querySelectorAll('.ksmg line').length,html:pv.querySelector('svg').innerHTML.slice(0,300)})).concat([S.tracks[0].sound.p.l1sync,S.tracks[0].sound.p.ksR1]);})()
