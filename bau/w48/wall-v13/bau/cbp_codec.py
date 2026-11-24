# -*- coding: utf-8 -*-
"""Bit-genaues Lesen/Schreiben von Cubasis-3-Projektdateien (.cbp).

Aufbau (an v6/v7/v8 geprüft): 8 Byte Kennung 99 63 33 70 0D 0A 1A 0A (unverändert), danach CBOR, jedes Byte XOR 0x7C.
cbor2 verliert die Breite der Gleitkommazahlen (Cubasis schreibt teils float32, teils float64), darum hier ein eigener,
kleiner CBOR-Codec, der Gleitkomma-Breite und Ganzzahl-Kodierung je Wert behält: lesen → schreiben ergibt dieselben Bytes.
"""
import struct

KENNUNG = bytes.fromhex('996333700d0a1a0a')
XOR = 0x7C


class F16(float): pass
class F32(float): pass
class F64(float): pass


class Int(int):
    """Ganzzahl mit Original-Kodierungslänge (falls nicht minimal)."""
    def __new__(cls, v, ai=None):
        o = int.__new__(cls, v); o.ai = ai; return o


def _min_ai(v):
    if v < 24: return v
    if v < 0x100: return 24
    if v < 0x10000: return 25
    if v < 0x100000000: return 26
    return 27


class _Leser:
    def __init__(self, b): self.b = b; self.i = 0

    def kopf(self):
        ib = self.b[self.i]; self.i += 1
        mt, ai = ib >> 5, ib & 31
        if ai < 24: return mt, ai, ai
        n = {24: 1, 25: 2, 26: 4, 27: 8}.get(ai)
        if n is None: raise ValueError('unbestimmte Länge nicht unterstützt (ai=%d) bei %d' % (ai, self.i))
        v = int.from_bytes(self.b[self.i:self.i + n], 'big'); self.i += n
        return mt, ai, v

    def wert(self):
        start = self.i
        mt, ai, v = self.kopf()
        if mt == 0:
            return Int(v, ai) if ai != _min_ai(v) else v
        if mt == 1:
            r = -1 - v
            return Int(r, ai) if ai != _min_ai(v) else r
        if mt == 2:
            s = self.b[self.i:self.i + v]; self.i += v; return bytes(s)
        if mt == 3:
            s = self.b[self.i:self.i + v]; self.i += v; return s.decode('utf-8')
        if mt == 4:
            return [self.wert() for _ in range(v)]
        if mt == 5:
            d = {}
            for _ in range(v):
                k = self.wert(); d[k] = self.wert()
            return d
        if mt == 7:
            if ai == 20: return False
            if ai == 21: return True
            if ai == 22: return None
            raw = self.b[start + 1:self.i]
            if ai == 25: return F16(struct.unpack('>e', raw)[0])
            if ai == 26: return F32(struct.unpack('>f', raw)[0])
            if ai == 27: return F64(struct.unpack('>d', raw)[0])
        raise ValueError('CBOR-Typ %d/%d nicht unterstützt bei %d' % (mt, ai, start))


def _kopf(mt, v, ai=None):
    if ai is None: ai = _min_ai(v)
    if ai < 24: return bytes([(mt << 5) | v])
    n = {24: 1, 25: 2, 26: 4, 27: 8}[ai]
    return bytes([(mt << 5) | ai]) + v.to_bytes(n, 'big')


def _schreibe(o, out):
    if o is True: out.append(b'\xf5'); return
    if o is False: out.append(b'\xf4'); return
    if o is None: out.append(b'\xf6'); return
    if isinstance(o, F16): out.append(b'\xf9' + struct.pack('>e', o)); return
    if isinstance(o, F32): out.append(b'\xfa' + struct.pack('>f', o)); return
    if isinstance(o, float): out.append(b'\xfb' + struct.pack('>d', o)); return     # F64 und neue Python-floats
    if isinstance(o, int):
        ai = getattr(o, 'ai', None)
        if o >= 0: out.append(_kopf(0, int(o), ai))
        else: out.append(_kopf(1, -1 - int(o), ai))
        return
    if isinstance(o, bytes): out.append(_kopf(2, len(o)) + o); return
    if isinstance(o, str):
        b = o.encode('utf-8'); out.append(_kopf(3, len(b)) + b); return
    if isinstance(o, list):
        out.append(_kopf(4, len(o)))
        for v in o: _schreibe(v, out)
        return
    if isinstance(o, dict):
        out.append(_kopf(5, len(o)))
        for k, v in o.items(): _schreibe(k, out); _schreibe(v, out)
        return
    raise TypeError(type(o))


def cbor_lesen(b):
    L = _Leser(b); o = L.wert()
    if L.i != len(b): raise ValueError('Restbytes nach CBOR: %d' % (len(b) - L.i))
    return o


def cbor_schreiben(o):
    out = []; _schreibe(o, out); return b''.join(out)


def entschluesseln(datei_bytes):
    if datei_bytes[:8] != KENNUNG: raise ValueError('keine Cubasis-.cbp (Kennung %s)' % datei_bytes[:8].hex())
    return bytes(x ^ XOR for x in datei_bytes[8:])


def verschluesseln(cbor_bytes):
    return KENNUNG + bytes(x ^ XOR for x in cbor_bytes)


def lade(pfad):
    return cbor_lesen(entschluesseln(open(pfad, 'rb').read()))


def speichere(obj, pfad):
    b = verschluesseln(cbor_schreiben(obj))
    open(pfad, 'wb').write(b)
    return b


if __name__ == '__main__':
    import sys
    for p in sys.argv[1:]:
        raw = open(p, 'rb').read()
        o = cbor_lesen(entschluesseln(raw))
        print(p, 'Rundweg bit-gleich:', verschluesseln(cbor_schreiben(o)) == raw)
