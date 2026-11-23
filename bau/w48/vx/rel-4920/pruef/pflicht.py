import re,sys
n=open(sys.argv[1],encoding='utf-8').read(); b=open(sys.argv[2],encoding='utf-8').read()
print('MS 2000', n.count('MS 2000'))
print('^  live: true,', len(re.findall(r'(?m)^  live: true,', n)))
for x in ['0.00537728','0.19492','413.56','0.193046','xander-krypto']: print(x, n.count(x))
print('VERSION 4.92.0', n.count("const VERSION = '4.92.0';"), '| 4.91.0', n.count("const VERSION = '4.91.0';"), '| VERSION-Zeilen', len(re.findall(r'const VERSION\b', n)))
print("'4.91.0' sonst", n.count("'4.91.0'"), "| '4.92.0'", n.count("'4.92.0'"))
for m in ['CHR6','CMD3','FOK4','SPKV2','GES4','GES4-K','KKS','ARPG','KSM','DSE','FARB','SZN','VXRR','KSM2','LT3','VL3','VTRIM']:
    c=lambda t,k: len(re.findall(r'(?<![\w-])'+re.escape(m)+'-'+k+r'\b', t))
    print(m, 'BEGIN', c(n,'BEGIN'), 'END', c(n,'END'), '| 4.91: BEGIN', c(b,'BEGIN'), 'END', c(b,'END'))
for t in ['/*KKS*/','/*ARPG*/','/*DSE*/','/*SZN*/','/*LT3*/']: print(t, n.count(t), '| 4.91', b.count(t))
print('Bytes', len(n.encode()), '| 4.91', len(b.encode()))
