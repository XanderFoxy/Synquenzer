# ERST bauen: basis.html + erst-block.js -> index.html (Block nach PERF1B-END, zwei Ein-Zeilen-Haken)
import sys
b = open('basis.html', encoding='utf-8').read(); blk = open('erst-block.js', encoding='utf-8').read()
def rep(s, old, new):
    assert s.count(old) == 1, old[:80]; return s.replace(old, new)
b = rep(b, "/* PERF1B-END */\n", "/* PERF1B-END */\n" + blk)
b = rep(b, "function buildBuffers() {\n", "function buildBuffers() {\n  if (typeof erstBufs === 'function' && erstBufs(AU.ctx)) return;   /* ERST */\n")
old = "      ['blob', () => URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))],\n"
b = rep(b, old, "      ['blob', () => (typeof erstWkUrl === 'function' && erstWkUrl(src)) || URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))],   /* ERST */\n")
old = "cv.out, {t0, noise: AU.noise, waves: AU.waves});\n"
b = rep(b, old, "cv.out, {t0, noise: AU.noise, get waves() { return AU.waves; }});   /* ERST: die WT-Wellen erst, wenn eine WT-Stimme sie liest */\n")
open('index.html', 'w', encoding='utf-8').write(b)
print('ok')
