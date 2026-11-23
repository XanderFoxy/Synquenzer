const http=require('http'),fs=require('fs'),path=require('path');const D=path.join(__dirname,'srv');
http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(u==='/version.json'){r.writeHead(200,{'content-type':'application/json'});r.end(/\/base\.html/.test(q.headers.referer||'')?'{"version":"4.86.0"}':'{"version":"4.87.0"}');return;}
const f=path.join(D,u==='/'?'index.html':u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
const t=f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json':f.endsWith('.js')?'text/javascript':'application/octet-stream';r.writeHead(200,{'content-type':t});fs.createReadStream(f).pipe(r);}).listen(8964,'127.0.0.1');
