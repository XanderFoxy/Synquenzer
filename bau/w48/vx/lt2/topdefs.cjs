const acorn=require('/opt/node-tools/node_modules/acorn');const fs=require('fs');
for(const f of process.argv.slice(2)){const h=fs.readFileSync(f,'utf8');const re=/<script([^>]*)>([\s\S]*?)<\/script>/g;let m,names=new Map(),n=0,err=0;
while((m=re.exec(h))){if(/src=|type="(?!module|text\/javascript)/.test(m[1])&&!/type="module"/.test(m[1])){if(/src=/.test(m[1])||/type="[^"]*"/.test(m[1]))continue;}n++;
try{const ast=acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/module/.test(m[1])?'module':'script'});
for(const s of ast.body){const add=k=>names.set(k,(names.get(k)||0)+1);if(s.type==='FunctionDeclaration'||s.type==='ClassDeclaration')add(s.id.name);else if(s.type==='VariableDeclaration')for(const d of s.declarations)if(d.id.type==='Identifier')add(d.id.name);}}catch(e){err++;}}
const dup=[...names].filter(([k,v])=>v>1).map(([k])=>k);console.log(f,'Skripte',n,'Namen',names.size,'doppelt',dup.length,dup.slice(0,10).join(','),'Syntaxfehler',err);}
