// Fehlalarme: saubere Takes inkl. sehr tiefer Stimme (Grundton im Band < 70 Hz) und lauterem Raumton/Atem
import {loadK} from './kern.mjs';import {sing} from './gen.mjs';
const K=loadK(process.argv[2]);let tot=0;
for(const T of [{sr:44100,dur:30,f0lo:60,f0hi:95,seed:31},{sr:48000,dur:30,f0lo:65,f0hi:110,seed:32,breathy:0.05},{sr:44100,dur:30,f0lo:75,f0hi:130,seed:33,room:-50},{sr:48000,dur:30,f0lo:90,f0hi:170,seed:34,room:-45},{sr:44100,dur:30,f0lo:150,f0hi:300,seed:35,room:-48}]){
 const S=sing(T),ev=K.plopFind(K.done(K.feats(S.x,T.sr)),{});tot+=ev.length;console.log(T.f0lo+'-'+T.f0hi,'room',T.room||-62,'funde',ev.length,ev.map(e=>e.t0.toFixed(2)).join(' '));}
console.log('SUMME',tot);
