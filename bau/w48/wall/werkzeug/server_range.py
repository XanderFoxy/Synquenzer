# Kleiner lokaler Testserver mit Range-Anfragen (wie GitHub Pages), nur für den Test des Master-Spielers.
import http.server, os, re, sys
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not rng or not os.path.isfile(path): return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng); size = os.path.getsize(path)
        a = int(m.group(1)) if m.group(1) else 0; b = int(m.group(2)) if m.group(2) else size - 1; b = min(b, size - 1)
        f = open(path, 'rb'); f.seek(a); self._rest = b - a + 1
        self.send_response(206); self.send_header('Content-Type', self.guess_type(path)); self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', 'bytes %d-%d/%d' % (a, b, size)); self.send_header('Content-Length', str(self._rest)); self.end_headers()
        return f
    def copyfile(self, src, dst):
        n = getattr(self, '_rest', None)
        if n is None: return super().copyfile(src, dst)
        while n > 0:
            d = src.read(min(65536, n))
            if not d: break
            try: dst.write(d)
            except (BrokenPipeError, ConnectionResetError): break
            n -= len(d)
    def log_message(self, *a): pass
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[2])), H).serve_forever()
