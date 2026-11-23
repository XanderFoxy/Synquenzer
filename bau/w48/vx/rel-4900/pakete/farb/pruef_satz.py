import sys
from farbwahl import *
NEW=sys.argv[1:]
A=OLD+NEW
for i,h in enumerate(NEW):
    L,C,H=lch(hx(h))
    ds=sorted((dist(hx(h),hx(o)),'t%d'%(j+1)) for j,o in enumerate(A) if o!=h)
    du=min((dist(hx(h),hx(UI[k])),k) for k in ('amber','rec','play'))
    print('t%d %s L=%.3f C=%.3f H=%5.1f cr=%.2f nah: %s %.3f, %s %.3f | UI %s %.3f'%(i+9,h,L,C,H,cr(hx(h),hx(BG)),ds[0][1],ds[0][0],ds[1][1],ds[1][0],du[1],du[0]))
m=min((dist(hx(a),hx(b)),i,j) for i,a in enumerate(A) for j,b in enumerate(A) if j>i and j>=8)
print('min neu %.3f t%d-t%d'%(m[0],m[1]+1,m[2]+1))
m=min((dist(hx(a),hx(b)),i,j) for i,a in enumerate(OLD) for j,b in enumerate(OLD) if j>i)
print('min alt %.3f t%d-t%d'%(m[0],m[1]+1,m[2]+1))
