// Messung: Vorlagen (Template-Literale) in den stillen Blöcken – Größe, Einrückung, Kommentare, Backslashes
const fs=require('fs'),acorn=require('./acorn.js');
const s=fs.readFileSync(process.argv[2],'utf8');const re=/<script type="text\/plain" id="(sq-[\w-]+-src)">/g;let m;
while((m=re.exec(s))){const a=m.index+m[0].length,b=s.indexOf('</script>',a),t=s.slice(a,b);const toks=[];
try{acorn.parse(t,{ecmaVersion:'latest',onToken:toks});}catch(e){console.log(m[1],'ERR');continue;}
const big=toks.filter(k=>k.type===acorn.tokTypes.template&&k.end-k.start>2000);
for(const k of big){const raw=t.slice(k.start,k.end);const ind=(raw.match(/\n[ \t]+/g)||[]).reduce((x,y)=>x+y.length-1,0);
const bs=(raw.match(/\\/g)||[]).length;const com=(raw.match(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g)||[]).reduce((x,y)=>x+y.length,0);
const ln=t.slice(0,k.start).split('\n').length;const pre=t.slice(Math.max(0,k.start-60),k.start).replace(/\n/g,' ');
console.log(m[1],'Zeile',ln,'len',raw.length,'einr',ind,'komm',com,'backslash',bs,'|',pre.slice(-50));}}
