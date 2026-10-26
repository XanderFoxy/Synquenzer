import {Cleaner} from './clean.mjs';
import * as T from './test-signals.mjs';
const sr=48000,B=128,mic=T.noise(sr,8,0.1,1),ref=T.noise(sr,8,0.1,2),bm=new Float32Array(B),br=new Float32Array(B),o=new Float32Array(B);
const c=new Cleaner(sr);const feed=a=>{for(let i=0;i<B;i++){bm[i]=mic[a+i];br[i]=ref[a+i];}c.process(bm,br,o,B);};
for(let a=0;a+B<=4*sr;a+=B)feed(a);gc();const h0=process.memoryUsage().heapUsed;for(let a=0;a+B<=4*sr;a+=B)feed(a);console.log(process.memoryUsage().heapUsed-h0);
