const fs=require('fs');const acorn=require(process.argv[3]);
const s=fs.readFileSync(process.argv[2],'utf8');
const re=/<script(?: type="text\/plain" id="(sq-[\w-]+-src)")?>/g;let m;
while((m=re.exec(s))){const a=m.index+m[0].length,b=s.indexOf('</script>',a);const txt=s.slice(a,b);const id=m[1]||('main@'+a);
 let toks=[];try{acorn.parse(txt,{ecmaVersion:'latest',sourceType:'script',onToken:toks});}catch(e){try{toks=[];acorn.parse(txt,{ecmaVersion:'latest',sourceType:'module',onToken:toks});}catch(e2){continue;}}
 let i0=0;
 for(const t of toks){const raw=txt.slice(t.start,t.end); if(raw.includes('registerProcessor')){console.log(id,a+t.start,t.type.label,raw.length,JSON.stringify(raw.slice(0,80)));}}
}
