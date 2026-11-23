import json,sys
def strip(o):
    if isinstance(o,dict): return {k:strip(v) for k,v in o.items() if k not in ('ms',)}
    if isinstance(o,list): return [strip(x) for x in o]
    return o
a=strip(json.load(open(sys.argv[1]))); b=strip(json.load(open(sys.argv[2])))
print(len(a),len(b),'GLEICH' if a==b else 'VERSCHIEDEN')
if a!=b:
    for x,y in zip(a,b):
        if x!=y:
            for k in x:
                if x.get(k)!=y.get(k): print(x.get('id'),k,str(x.get(k))[:120],'|',str(y.get(k))[:120])
            break
