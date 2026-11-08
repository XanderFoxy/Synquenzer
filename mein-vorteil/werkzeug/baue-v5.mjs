// Baut die Fixtures für Fassung 5 (test/fixtures/v5/): echte Scanner-Läufe mit ihren Fixtures (keine erfundenen Felder),
// Zeitpunkt der Tests 2026-11-07T16:35:00Z (Samstag, 17:35 Uhr in Döbeln).
//  - Vorteils-Radar:     node vorteile/scan/main.mjs --fixtures --dry-run --jetzt 2026-11-07T16:35:00Z  (neue Kategorien remix,
//                        auftritte, unterricht mit Fundorten, filme mit Apple-TV-Räumen)
//  - Schnäppchen-Wecker: node schnaeppchen/scan/main.mjs --fixtures --dry-run --jetzt 2026-10-31T16:35:00Z (Prospekt-Fixtures
//                        vom 31.10. inkl. kaufDA), alle Zeitpunkte um genau 7 Tage verschoben (gleicher Wochentag)
//  - Konzerte:           Termine nur weit weg (Alphaville Hamburg, The Human League Köln …) – „nächster Termin je Band“
// Aufruf: node werkzeug/baue-v5.mjs   (liegt absichtlich nicht unter test/)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const ZIEL = join(HIER, '..', 'test', 'fixtures', 'v5');
const JETZT = '2026-11-07T16:35:00Z';
const tmp = mkdtempSync(join(tmpdir(), 'mv5-'));
const lauf = (ordner, jetzt, daten) => execFileSync(process.execPath, ['scan/main.mjs', '--fixtures', '--dry-run', '--data', daten, '--jetzt', jetzt], { cwd: join(WURZEL, ordner), stdio: 'pipe', timeout: 240000 });
const schreib = (n, o) => { mkdirSync(ZIEL, { recursive: true }); writeFileSync(join(ZIEL, n), JSON.stringify(o, null, 1) + '\n'); };

try {
  // Vorteils-Radar
  lauf('vorteile', JETZT, join(tmp, 'v'));
  schreib('vorteile-aktuell.json', JSON.parse(readFileSync(join(tmp, 'v', 'aktuell.json'), 'utf8')));
  schreib('filme.json', JSON.parse(readFileSync(join(tmp, 'v', 'filme.json'), 'utf8')));

  // Schnäppchen-Wecker: Lauf am 31.10. (Prospekte), dann +7 Tage
  lauf('schnaeppchen', '2026-10-31T16:35:00Z', join(tmp, 's'));
  const plus7 = s => s.replace(/"(20\d\d-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:?\d\d))"/g, (_, iso) => JSON.stringify(new Date(Date.parse(iso) + 7 * 864e5).toISOString()));
  schreib('schnaeppchen-current.json', JSON.parse(plus7(readFileSync(join(tmp, 's', 'current.json'), 'utf8'))));

  // Konzerte: nichts im Umkreis von 200 km – je Band der nächste Termin, auch weit weg (Format von konzerte/scan/kern.mjs)
  const k = (band, datum, ort, stadt, km, extra = {}) => ({ quelle: 'eventim', band, titel: band, datum, zeit: '20:00', bis: `${datum}T22:59:00.000Z`, ort, stadt, land: 'DE', km,
    link: `https://www.eventim.de/event/${band.toLowerCase().replace(/[^a-z]+/g, '-')}-${datum}`, festival: false, status: '', key: `k|${band}|${datum}`, neu: false, vorverkauf: [], ...extra });
  schreib('konzerte-konzerte.json', { stand: '2026-11-07T16:30:00.000Z', zuhause: { name: 'Döbeln', lat: 51.1194, lon: 13.1186 }, pushRadiusKm: 200, konzerte: [
    k('Alphaville', '2026-12-05', 'Große Freiheit 36', 'Hamburg', 344),
    k('Camouflage', '2027-01-16', 'Columbia Theater', 'Berlin', 207),
    k('The Human League', '2027-03-12', 'E-Werk', 'Köln', 431, { weit: true, naechster: true }),
    k('Erasure', '2027-04-02', 'Zenith', 'München', 362),
  ] });
  schreib('konzerte-releases.json', JSON.parse(readFileSync(join(HIER, '..', 'test', 'fixtures', 'vertrag', 'konzerte-releases.json'), 'utf8')));
  const st = JSON.parse(readFileSync(join(HIER, '..', 'test', 'fixtures', 'echt-2026-10-31', 'v1', 'konzerte-status.json'), 'utf8'));
  st.stand = '2026-11-07T16:30:00.000Z';
  st.quellen = { ticketmaster: { ok: true, treffer: 0, fehler: [], uebersprungen: 'kein TM_KEY gesetzt' }, eventim: { ok: true, treffer: 4, fehler: [] }, seiten: { ok: true, treffer: 0, fehler: [], geprueft: 4, gesamt: 4 } };
  schreib('konzerte-status.json', st);
  console.log('geschrieben:', ZIEL);
} finally { rmSync(tmp, { recursive: true, force: true }); }
