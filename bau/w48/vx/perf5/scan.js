const fs=require('fs');const acorn=require(process.argv[3]);
const s=fs.readFileSync(process.argv[2],'utf8');
const re=/<script(?: type="text\/plain" id="(sq-[\w-]+-src)")?>/g;let m;const res=[];
while((m=re.exec(s))){const a=m.index+m[0].length,b=s.indexOf('</script>',a);const txt=s.slice(a,b);const id=m[1]||('main@'+a);
 let toks=[];try{acorn.parse(txt,{ecmaVersion:'latest',sourceType:'script',onToken:toks});}catch(e){try{toks=[];acorn.parse(txt,{ecmaVersion:'latest',sourceType:'module',onToken:toks});}catch(e2){console.log(id,'PARSEFAIL',e2.message);continue;}}
 for(let i=1;i<toks.length;i++){const k=toks[i];if(k.type!==acorn.tokTypes.template)continue;const raw=txt.slice(k.start,k.end);if(raw.length<1500)continue;
  // find name
  let nm='';for(let j=i-1;j>=Math.max(0,i-6);j--){if(toks[j].type===acorn.tokTypes.name){nm=toks[j].value;break;}}
  const kind=raw.includes('registerProcessor')?'WK':(/\{[^}]*:[^}]*;/.test(raw)&&/[.#][\w-]+\s*\{/.test(raw)?'CSS':'?');
  const prevDollar=toks[i-1].type===acorn.tokTypes.dollarBraceR; const nextDollar=toks[i+1]&&toks[i+1].type===acorn.tokTypes.dollarBraceL;
  res.push([id,a+k.start,nm,kind,raw.length,(raw.match(/\/\*[\s\S]*?\*\//g)||[]).reduce((x,y)=>x+y.length,0),prevDollar?'after${}':'',nextDollar?'has${':'',raw.includes('\\')?'bs':'']);
 }}
for(const r of res)console.log(r.join('\t'));
