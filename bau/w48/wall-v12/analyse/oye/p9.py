import sys; sys.path.insert(0,'.')
from lade import *
SR=48000
o=lade('orig_h').astype(np.float64); e=lade('ende').astype(np.float64); h=lade('haupt').astype(np.float64)
def db(x): return 10*np.log10(np.mean(x*x)+1e-20)
print('t      orig   R1copy  gainLS  rest(orig-g*R1)  rest(orig-R1)  ende   r(ende,R1)')
for t in np.arange(217.0,222.5,0.1):
    a=int(t*SR); b=a+int(.1*SR); x=o[a:b]; r=o[a-128*SR:b-128*SR]
    g=np.dot(x,r)/max(np.dot(r,r),1e-20)
    er=e[a:b]; rr=e[a-128*SR:b-128*SR]
    c=np.dot(er,o[a-128*SR:b-128*SR])/np.sqrt(np.dot(er,er)*np.dot(r,r)+1e-30)
    print(f'{t:6.1f} {db(x):6.1f} {db(r):6.1f}  {g:6.3f}  {db(x-g*r):8.1f}  {db(x-r):8.1f}   {db(er):6.1f}  {c:+.2f}')
