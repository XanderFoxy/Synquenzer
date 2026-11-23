const fs=require('fs');const acorn=require(process.argv[3]);
const s=fs.readFileSync(process.argv[2],'utf8');
const re=/<script(?: type="text\/plain" id="(sq-[\w-]+-src)")?>/g;let m;const T=acorn.tokTypes;let tot=0;
while((m=re.exec(s))){const a=m.index+m[0].length,b=s.indexOf('</script>',a);const txt=s.slice(a,b);const id=m[1]||('main@'+a);
 let toks=[];try{acorn.parse(txt,{ecmaVersion:'latest',sourceType:'script',onToken:toks});}catch(e){try{toks=[];acorn.parse(txt,{ecmaVersion:'latest',sourceType:'module',onToken:toks});}catch(e2){continue;}}
 for(let i=1;i+1<toks.length;i++){const k=toks[i];if(k.type!==T.template||toks[i-1].type!==T.backQuote||toks[i+1].type!==T.backQuote)continue;const raw=txt.slice(k.start,k.end);if(raw.length<600)continue;
  const ctx=toks.slice(Math.max(0,i-5),i-1).map(t=>txt.slice(t.start,t.end)).join(' ')+' | '+txt.slice(toks[i+1].end,toks[i+1].end+25).replace(/\n/g,'\\n');
  const ws=(raw.match(/\s{2,}|\n/g)||[]).reduce((x,y)=>x+y.length-1,0), cm=(raw.match(/\/\*[\s\S]*?\*\//g)||[]).reduce((x,y)=>x+y.length,0);
  console.log([id,a+k.start,raw.length,raw.includes('\\')?'BS':'',raw.includes('registerProcessor')?'WK':'',ws,cm,ctx,JSON.stringify(raw.slice(0,50))].join('\t'));
 }}
