// Zonen-Logik (Xander 07.11.2026): Meldung bei Gewinn ↔ Verlust, +5 %, +10 %, −10 % – je Coin, Hysterese 0,5 Punkte,
// erst nach Rückkehr wieder scharf, keine Doppelmeldung. Alle Zahlen hier sind erfunden.
import test from 'node:test';
import assert from 'node:assert/strict';
import { naechsteZone, rohZone, kryptoPosition, kryptoErgebnis, leseKryptoText, HYSTERESE, MELDUNG } from '../zonen.mjs';

// Verlauf durchspielen: [prozent, erwartete Meldung oder null]
function verlauf(start, schritte) {
  let zone = start;
  const meldungen = [];
  for (const [p, erwartet] of schritte) {
    const r = naechsteZone(zone, p);
    assert.equal(r.meldung, erwartet, `bei ${p} % aus „${zone}“: ${r.meldung} statt ${erwartet}`);
    zone = r.zone;
    if (r.meldung) meldungen.push(r.meldung);
  }
  return { zone, meldungen };
}

test('erster Blick: Zone ohne Meldung', () => {
  assert.equal(HYSTERESE, 0.5);
  assert.deepEqual(naechsteZone(undefined, 12), { zone: 'top', meldung: null });
  assert.deepEqual(naechsteZone('quatsch', -3), { zone: 'minus', meldung: null });
  assert.deepEqual([-10, -9.99, -0.01, 0, 4.99, 5, 9.99, 10].map(rohZone), ['tief', 'minus', 'minus', 'plus', 'plus', 'hoch', 'hoch', 'top']);
  assert.deepEqual(naechsteZone('plus', NaN), { zone: 'plus', meldung: null });
});

test('Wechsel Verlust → Gewinn → Verlust mit Hysterese (kein Hin und Her um 0 %)', () => {
  verlauf('minus', [[-0.3, null], [0.2, null], [0.49, null], [0.5, 'gewinn'], [0.1, null], [-0.2, null], [-0.5, null], [-0.51, 'verlust'], [0.3, null], [0.6, 'gewinn']]);
});

test('+5 % und +10 %: einmal melden, erst nach Rückkehr (−0,5 Punkte) wieder scharf', () => {
  const { meldungen } = verlauf('plus', [
    [4.9, null], [5, 'plus5'], [4.8, null], [5.2, null], [4.6, null], [5.0, null], // 4,6 ist nicht unter 4,5 -> nicht scharf
    [4.4, null], [5.1, 'plus5'], // unter 4,5 gewesen -> wieder scharf
    [9.9, null], [10, 'plus10'], [9.6, null], [10.4, null], [9.4, null], [10.0, 'plus10'],
  ]);
  assert.deepEqual(meldungen, ['plus5', 'plus5', 'plus10', 'plus10']);
});

test('−10 %: Meldung beim Erreichen, wieder scharf erst über −9,5 %', () => {
  verlauf('minus', [[-9.9, null], [-10, 'minus10'], [-9.7, null], [-10.3, null], [-9.5, null], [-10.0, 'minus10']]);
});

test('Sprung über mehrere Grenzen: eine Meldung, die äußerste', () => {
  assert.deepEqual(naechsteZone('minus', 12), { zone: 'top', meldung: 'plus10' });
  assert.deepEqual(naechsteZone('tief', 6), { zone: 'hoch', meldung: 'plus5' });
  assert.deepEqual(naechsteZone('top', -11), { zone: 'tief', meldung: 'minus10' });
  assert.deepEqual(naechsteZone('hoch', -1), { zone: 'minus', meldung: 'verlust' });
  assert.deepEqual(naechsteZone('top', 3), { zone: 'plus', meldung: null }, 'nur runter in den Gewinn: keine Meldung');
  assert.deepEqual(naechsteZone('tief', -2), { zone: 'minus', meldung: null }, 'raus aus −10 % ist keine Meldung');
});

test('keine Doppelmeldung: gleiche Zone, gleicher Kurs, viele Prüfungen', () => {
  let zone = 'plus', n = 0;
  for (let i = 0; i < 50; i++) { const r = naechsteZone(zone, 5 + Math.sin(i) * 0.4); zone = r.zone; if (r.meldung) n++; }
  assert.equal(n, 1);
  for (const k of ['gewinn', 'verlust', 'plus5', 'plus10', 'minus10']) assert.ok(MELDUNG[k]);
});

test('Käufe: Betrag + Kurs oder Betrag + Menge; aktuelle Menge überschreibt die Summe; Gewinnschwelle', () => {
  const pos = kryptoPosition({ kaeufe: [{ betrag: 300, kurs: 60000 }, { betrag: 200, menge: 0.004 }, { betrag: 0, kurs: 1 }, { betrag: 50 }] });
  assert.equal(pos.kaeufe, 2, 'ungültige Käufe zählen nicht');
  assert.equal(pos.einsatz, 500);
  assert.ok(Math.abs(pos.mengeKaeufe - 0.009) < 1e-12);
  assert.ok(Math.abs(pos.kaufkurs - 500 / 0.009) < 1e-6);
  assert.equal(pos.schwelle, pos.kaufkurs, 'ohne aktuelle Menge: Gewinnschwelle = Ø-Kaufkurs');
  const mitEarn = kryptoPosition({ kaeufe: [{ betrag: 300, kurs: 60000 }, { betrag: 200, menge: 0.004 }], aktuell: 0.01 });
  assert.equal(mitEarn.menge, 0.01);
  assert.equal(mitEarn.schwelle, 50000, 'Auto Earn senkt die Gewinnschwelle');
  const e = kryptoErgebnis(mitEarn, 55000);
  assert.equal(e.wert, 550);
  assert.equal(e.gv, 50);
  assert.ok(Math.abs(e.prozent - 10) < 1e-9);
  assert.equal(kryptoPosition({ kaeufe: [] }), null);
  assert.equal(kryptoErgebnis(mitEarn, 0), null);
});

test('Import-Text (Fragment und Secret): btc:<menge>:<einsatz>,eth:<menge>:<einsatz>', () => {
  assert.deepEqual(leseKryptoText('btc:0.0123:750,eth:0.4:900.5'), { ok: true, coins: { btc: { menge: 0.0123, einsatz: 750 }, eth: { menge: 0.4, einsatz: 900.5 } } });
  assert.deepEqual(leseKryptoText('#krypto=BTC:0.5:20000'), { ok: true, coins: { btc: { menge: 0.5, einsatz: 20000 } } });
  assert.deepEqual(leseKryptoText('krypto=btc%3A0.1%3A5000'), { ok: true, coins: { btc: { menge: 0.1, einsatz: 5000 } } });
  assert.equal(leseKryptoText('btc:0,1:5000').ok, false, 'Komma ist der Trenner zwischen Coins');
  assert.equal(leseKryptoText('doge:100:50').ok, false);
  assert.equal(leseKryptoText('btc:0:50').ok, false);
  assert.equal(leseKryptoText('btc:0.1:50,eth:kaputt').ok, false, 'kein halber Import');
  assert.equal(leseKryptoText('').ok, false);
});
