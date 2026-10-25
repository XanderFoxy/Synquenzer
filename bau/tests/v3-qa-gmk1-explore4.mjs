import {open} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false, file: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html', viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
const r = await E(() => { const A = document.getElementById('kbArea'); const out = {cls: A.className, kids: [...A.children].map(c => c.tagName + '.' + c.className + '#' + c.id)};
  const keys = [...A.querySelectorAll('*')].filter(e => e.dataset && (e.dataset.note || e.dataset.n || e.dataset.k)).slice(0, 5).map(e => [e.tagName, e.className, JSON.stringify(e.dataset)]); out.keys = keys; out.hasM = !!(AU && AU.M && AU.M.ceil); return out; });
console.log(JSON.stringify(r));
const html = await E(() => document.getElementById('kbArea').outerHTML.slice(0, 1500)); console.log(html);
await T.br.close();
