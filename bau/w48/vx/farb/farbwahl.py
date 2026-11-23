# Farbwahl FARB: OKLCH der Spurfarben 1-8, Suche 8 neue Farben (gleiche Helligkeit/Saettigung, max. Abstand)
import math, random, sys
def hx(h): h=h.lstrip('#'); return [int(h[i:i+2],16)/255 for i in (0,2,4)]
def lin(c): return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def delin(c): return 12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
def oklab(rgb):
    r,g,b=[lin(x) for x in rgb]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b; m=0.2119034982*r+0.6806995451*g+0.1073969566*b; s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) if x>=0 else -((-x)**(1/3)) for x in (l,m,s)]
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s)
def fromlab(L,a,b):
    l=L+0.3963377774*a+0.2158037573*b; m=L-0.1055613458*a-0.0638541728*b; s=L-0.0894841775*a-1.2914855480*b
    l,m,s=l**3,m**3,s**3
    r=4.0767416621*l-3.3077115913*m+0.2309699292*s; g=-1.2684380046*l+2.6097574011*m-0.3413193965*s; bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return [r,g,bb]
def lch(rgb):
    L,a,b=oklab(rgb); return L, math.hypot(a,b), (math.degrees(math.atan2(b,a))%360)
def lum(rgb): r,g,b=[lin(x) for x in rgb]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def dist(a,b):
    A,B=oklab(a),oklab(b); return math.sqrt(sum((x-y)**2 for x,y in zip(A,B)))
def tohex(rgb): return '#'+''.join('%02x'%round(max(0,min(1,c))*255) for c in rgb)
OLD=['#4cc9f0','#8b9cff','#2dd4bf','#fb7185','#e879f9','#a3e635','#4ade80','#c4a1ff']
UI={'amber':'#ffb22e','rec':'#ff4538','play':'#35d07f','sel':'#f4f1ea','text':'#ece8df'}
BG='#0d0e11'
if __name__=='__main__':
    for i,h in enumerate(OLD):
        L,C,H=lch(hx(h)); print('t%d %s L=%.3f C=%.3f H=%5.1f cr_bg=%.2f cr_ink=%.2f'%(i+1,h,L,C,H,cr(hx(h),hx(BG)),cr(hx(h),hx('#141416'))))
    md=min(dist(hx(a),hx(b)) for i,a in enumerate(OLD) for b in OLD[i+1:]); print('min dist old',round(md,4))
