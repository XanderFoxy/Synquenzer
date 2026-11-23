// Lädt vr1Make (+ vr1EssCore) aus einer index.html
import fs from 'fs';
export function loadK(file){
  const h=fs.readFileSync(file,'utf8'),a0=h.indexOf('function vr1Make(){'),e0=h.indexOf('function vr1EssCore(',a0);
  // Ende von vr1EssCore: Klammern zählen (Code ohne Klammern in Zeichenketten angenommen)
  let d=0,i=h.indexOf('{',e0);for(;i<h.length;i++){const c=h[i];if(c==='{')d++;else if(c==='}'){d--;if(!d)break;}}
  const src=h.slice(a0,i+1);
  return new Function(src+'\nreturn vr1Make;')()();
}
