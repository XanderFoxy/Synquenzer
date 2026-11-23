// Kaninchenbau 0.2 – „Dein Wesen“: 7 Bereiche, je 4 Merkmale, kurze Fragen mit einem Tipp. Reine Daten (kein DOM).
// Eigene Fragen zur Selbstbeobachtung – kein wissenschaftlicher Test, keine Diagnose. Nichts über eine bestimmte Person.
// Merkmal-Arten: 'achse' (zwei Pole, Wert −1 … +1; links = −), 'thema' (Antworten sammeln Themen), 'stufe' (Kenntnis je Gebiet 0–3).
// zusatz: true = Nachfrage, die nur unter einer Bedingung kommt (zählt nicht zum Fortschritt, hilft bei Karte und Ideen).
// Frage-Arten: 'zwei' (zwei bunte Knöpfe), 'skala' (Aussage, 5 Stufen), 'wahl' (3–4 Möglichkeiten), 'stufe' (4 Kenntnis-Stufen).
// WICHTIG: Fragen-IDs (Merkmal + laufende Nummer) sind in gespeicherten Antworten. Nie umsortieren oder löschen, nur anhängen.

export const BEREICHE = [
  { id: 'person', name: 'Persönlichkeit', kurz: 'Wer du bist', text: 'Wie du im Alltag bist – mit anderen und mit dir.' },
  { id: 'denken', name: 'Denken', kurz: 'Wie du denkst', text: 'Wie du an Fragen, Probleme und Entscheidungen herangehst.' },
  { id: 'gefuehl', name: 'Gefühlsleben', kurz: 'Wie du fühlst', text: 'Wie stark du fühlst, was du zeigst und was dir Kraft gibt.' },
  { id: 'ideen', name: 'Ideen', kurz: 'Wie Ideen kommen', text: 'Woher deine Ideen kommen und was du mit ihnen machst.' },
  { id: 'wissen', name: 'Wissen', kurz: 'Was du weißt', text: 'Was du schon kannst, worauf du neugierig bist und wie du lernst.' },
  { id: 'mindset', name: 'Mindset', kurz: 'Deine Haltung', text: 'Wie du mit Fehlern, Zielen und Mut umgehst – und was dich antreibt.' },
  { id: 'kreativ', name: 'Kreativität', kurz: 'Wie du erschaffst', text: 'Wie und womit du etwas Eigenes erschaffst.' }
];
export const BEREICH = Object.fromEntries(BEREICHE.map((b, i) => [b.id, { ...b, i }]));

export const SKALA = [['Nein', -1], ['Eher nein', -0.5], ['Teils', 0], ['Eher ja', 0.5], ['Ja', 1]];
export const STUFE = [['Neu für mich', 0], ['Ein bisschen', 1], ['Gut', 2], ['Sehr gut', 3]];
export const ZIEL = 3;                 // Antworten je Merkmal bis „ausgewertet“ (Stufe: 5 Gebiete)

// Themen, die in mehreren Bereichen vorkommen können (daraus werden „rote Fäden“ auf der Karte)
export const THEMEN = {
  musik: 'Musik', worte: 'Worte', bilder: 'Bilder', bewegung: 'Bewegung', natur: 'Natur', menschen: 'Menschen',
  stille: 'Stille', technik: 'Technik', bauen: 'Selbermachen', entdecken: 'Neues entdecken', freiheit: 'Freiheit',
  geschichte: 'Geschichte', reisen: 'Reisen', freude: 'Spaß an der Sache'
};

const MERK = [];
const FR = [];
// Merkmal anlegen; fragen: [art, text, …]. zwei: [a, b] mit a = [Text, Wert|Thema]; skala: r = ±1; wahl: [[Text, Wert|Thema], …]
function M(id, b, def, fragen) {
  MERK.push({ id, b, ...def });
  fragen.forEach((f, i) => {
    const [art, text, x, y] = f;
    const q = { id: `${id}-${i + 1}`, m: id, b, art, text };
    if (art === 'zwei') q.opt = [x, y];
    else if (art === 'skala') q.r = x;
    else if (art === 'wahl') q.opt = x;
    else if (art === 'stufe') q.gebiet = x;
    const extra = art === 'zwei' ? f[4] : f[3];
    if (extra) Object.assign(q, extra);
    FR.push(q);
  });
}

// ===================== Persönlichkeit =====================
M('p-energie', 'person', { art: 'achse', name: 'Energie', links: 'Ruhe tankt auf', rechts: 'Menschen tanken auf', wortL: 'ruheliebend', wortR: 'gesellig',
  satzL: 'Ruhe und Zeit für dich laden deine Batterie.', satzR: 'Menschen und Trubel geben dir Energie.', satzM: 'Du brauchst beides: Ruhe und Menschen.' }, [
  ['zwei', 'Nach einem langen Tag – was lädt dich eher auf?', ['Zeit für mich allein', -1], ['Leute treffen', 1]],
  ['skala', 'Unter vielen Menschen bekomme ich Energie.', 1],
  ['wahl', 'Ein freier Samstag ohne Plan. Am liebsten bin ich …', [['… ganz für mich', -1], ['… mal allein, mal mit anderen', 0], ['… mit Freunden unterwegs', 1]]],
  ['zwei', 'Auf einer Feier bist du eher …', ['… mit ein, zwei Leuten im guten Gespräch', -1], ['… mal hier, mal da, mit vielen', 1]]
]);
M('p-plan', 'person', { art: 'achse', name: 'Planen', links: 'spontan', rechts: 'geplant', wortL: 'spontan', wortR: 'planvoll',
  satzL: 'Du bist eher spontan und entscheidest im Moment.', satzR: 'Du planst gern und behältst den Überblick.', satzM: 'Mal planst du, mal lässt du es laufen.' }, [
  ['zwei', 'Urlaub: Lieber …', ['… losfahren und schauen', -1], ['… vorher gut planen', 1]],
  ['skala', 'Ich mache gern Listen und Pläne.', 1],
  ['skala', 'Ich entscheide oft aus dem Moment heraus.', -1],
  ['wahl', 'Dein Platz zu Hause ist meistens …', [['… kreatives Durcheinander', -1], ['… mal so, mal so', 0], ['… aufgeräumt', 1]]]
]);
M('p-art', 'person', { art: 'achse', name: 'Umgang', links: 'direkt', rechts: 'behutsam', wortL: 'direkt', wortR: 'behutsam',
  satzL: 'Du sagst ehrlich und direkt, was du denkst.', satzR: 'Du gehst behutsam mit anderen um und suchst den Ausgleich.', satzM: 'Du bist ehrlich und behutsam zugleich.' }, [
  ['zwei', 'Jemand zeigt dir stolz etwas, das du schwach findest. Du …', ['… sagst es ehrlich und direkt', -1], ['… sagst es vorsichtig und lobst das Gute', 1]],
  ['skala', 'Bei Streit suche ich eher den Ausgleich.', 1],
  ['skala', 'Ich sage meistens gerade heraus, was ich denke.', -1],
  ['zwei', 'Was ist dir in einem Gespräch wichtiger?', ['Dass es ehrlich ist', -1], ['Dass sich alle wohlfühlen', 1]]
]);
M('p-neu', 'person', { art: 'achse', name: 'Neues', links: 'Vertrautes', rechts: 'Neues', wortL: 'beständig', wortR: 'neugierig',
  satzL: 'Vertrautes gibt dir Halt.', satzR: 'Du suchst Neues und probierst gern aus.', satzM: 'Du magst Vertrautes und Neues in guter Mischung.' }, [
  ['zwei', 'Im Restaurant bestellst du eher …', ['… dein Lieblingsessen', -1], ['… etwas, das du noch nie hattest', 1]],
  ['skala', 'Ich probiere gern Dinge aus, die ich nicht kenne.', 1],
  ['skala', 'Feste Gewohnheiten geben mir Halt.', -1],
  ['wahl', 'Ein ganz neues Hobby anfangen – wie klingt das?', [['Eher anstrengend', -1], ['Kommt drauf an', 0], ['Großartig', 1]]]
]);
M('p-ruhe', 'person', { art: 'thema', zusatz: true, name: 'Zur Ruhe kommen', satz: 'Zur Ruhe kommst du mit: {x}.',
  wort: { musik: 'Musik hören', natur: 'draußen sein', bauen: 'etwas mit den Händen machen', stille: 'einfach nichts tun' } }, [
  ['wahl', 'Du tankst gern in Ruhe auf. Wobei findest du sie am besten?', [['Musik hören', 'musik'], ['Draußen sein', 'natur'], ['Etwas mit den Händen machen', 'bauen'], ['Einfach nichts tun', 'stille']], { wenn: [{ m: 'p-energie', pol: -1 }] }]
]);

// ===================== Denken =====================
M('d-weg', 'denken', { art: 'achse', name: 'Denkweg', links: 'Bauchgefühl', rechts: 'Schritt für Schritt', wortL: 'intuitiv', wortR: 'logisch',
  satzL: 'Du denkst viel mit dem Bauchgefühl.', satzR: 'Du denkst Schritt für Schritt und mit Gründen.', satzM: 'Du nutzt Bauch und Kopf.' }, [
  ['zwei', 'Bei einer wichtigen Entscheidung hörst du eher auf …', ['… dein Bauchgefühl', -1], ['… Gründe, die du abwägst', 1]],
  ['skala', 'Ich merke oft, dass etwas stimmt, bevor ich erklären kann, warum.', -1],
  ['skala', 'Ich zerlege Probleme gern in kleine Schritte.', 1],
  ['zwei', 'Ein Rätsel: Lieber …', ['… plötzlich die Lösung sehen', -1], ['… es Schritt für Schritt knacken', 1]]
]);
M('d-blick', 'denken', { art: 'achse', name: 'Blick', links: 'großes Ganzes', rechts: 'Einzelheiten', wortL: 'weitblickend', wortR: 'genau',
  satzL: 'Du siehst zuerst das große Ganze.', satzR: 'Dir fallen die Einzelheiten auf.', satzM: 'Du siehst das Ganze und die Einzelheiten.' }, [
  ['zwei', 'Wenn du einen Film nacherzählst, erzählst du eher …', ['… worum es im Großen geht', -1], ['… die besten Szenen ganz genau', 1]],
  ['skala', 'Mir fallen kleine Fehler sofort auf.', 1],
  ['skala', 'Ich sehe schnell, wie Dinge zusammenhängen.', -1],
  ['zwei', 'Bei einem neuen Vorhaben fängst du an mit …', ['… dem großen Bild im Kopf', -1], ['… dem ersten genauen Teil', 1]]
]);
M('d-tempo', 'denken', { art: 'achse', name: 'Entscheiden', links: 'schnell', rechts: 'gründlich', wortL: 'entschlossen', wortR: 'besonnen',
  satzL: 'Du entscheidest schnell.', satzR: 'Du wägst gründlich ab, bevor du dich festlegst.', satzM: 'Du entscheidest mal schnell, mal mit Ruhe.' }, [
  ['zwei', 'Im Restaurant weißt du, was du willst, …', ['… meist sofort', -1], ['… erst nach längerem Lesen', 1]],
  ['skala', 'Ich denke lieber noch einmal nach, bevor ich mich festlege.', 1],
  ['skala', 'Ich entscheide schnell und schaue dann, wie es läuft.', -1],
  ['wahl', 'Ein größerer Kauf. Du …', [['… kaufst, wenn es sich gut anfühlt', -1], ['… vergleichst ein bisschen', 0], ['… vergleichst gründlich', 1]]]
]);
M('d-zugang', 'denken', { art: 'thema', name: 'Wobei du gut denkst', satz: 'Am besten denkst du {x}.',
  wort: { bewegung: 'in Bewegung', menschen: 'im Gespräch', worte: 'beim Schreiben oder Lesen', stille: 'in Stille', bilder: 'mit Bildern', bauen: 'beim Ausprobieren', musik: 'mit Musik' } }, [
  ['wahl', 'Wobei kommst du am besten ins Nachdenken?', [['Beim Gehen oder Bewegen', 'bewegung'], ['Beim Reden mit anderen', 'menschen'], ['Beim Schreiben', 'worte'], ['In Stille', 'stille']]],
  ['wahl', 'Etwas Schwieriges verstehen: Am meisten hilft dir …', [['… ein Bild oder eine Skizze', 'bilder'], ['… es jemandem zu erklären', 'menschen'], ['… es auszuprobieren', 'bauen'], ['… darüber zu lesen', 'worte']]],
  ['zwei', 'Klar im Kopf wirst du eher …', ['… mit Musik', 'musik'], ['… in Ruhe', 'stille']],
  ['wahl', 'Gute Gedanken kommen dir oft …', [['… unterwegs', 'bewegung'], ['… abends oder unter der Dusche', 'stille'], ['… im Gespräch', 'menschen'], ['… mit Musik', 'musik']]]
]);

// ===================== Gefühlsleben =====================
M('g-staerke', 'gefuehl', { art: 'achse', name: 'Stärke', links: 'eher leise', rechts: 'stark', wortL: 'gefasst', wortR: 'gefühlsstark',
  satzL: 'Deine Gefühle sind eher leise.', satzR: 'Du erlebst Gefühle stark und deutlich.', satzM: 'Deine Gefühle sind mal leise, mal stark.' }, [
  ['skala', 'Ich erlebe Gefühle oft sehr stark.', 1],
  ['zwei', 'Ein trauriger Film: Du …', ['… bleibst eher ruhig', -1], ['… fühlst richtig mit', 1]],
  ['skala', 'Musik oder Bilder können mich tief berühren.', 1],
  ['zwei', 'Wenn dich etwas ärgert, ist das Gefühl eher …', ['… kurz und klein', -1], ['… groß, bis es abklingt', 1]]
]);
M('g-zeigen', 'gefuehl', { art: 'achse', name: 'Zeigen', links: 'für dich', rechts: 'offen', wortL: 'zurückhaltend', wortR: 'offen',
  satzL: 'Gefühle machst du eher mit dir aus.', satzR: 'Du zeigst und teilst deine Gefühle offen.', satzM: 'Manche Gefühle zeigst du, andere behältst du für dich.' }, [
  ['zwei', 'Wenn es dir nicht gut geht, …', ['… machst du es eher mit dir aus', -1], ['… sprichst du mit jemandem', 1]],
  ['skala', 'Andere sehen mir an, wie es mir geht.', 1],
  ['skala', 'Über Gefühle zu reden fällt mir leicht.', 1],
  ['zwei', 'Freude zeigt sich bei dir eher …', ['… als stilles Lächeln', -1], ['… laut und ansteckend', 1]]
]);
M('g-wellen', 'gefuehl', { art: 'achse', name: 'Stimmung', links: 'ruhiger See', rechts: 'Wellen', wortL: 'ausgeglichen', wortR: 'lebhaft',
  satzL: 'Deine Stimmung ist eher wie ein ruhiger See.', satzR: 'Deine Stimmung kommt in Wellen – lebhaft, mal hoch, mal tief.', satzM: 'Deine Stimmung ist meist ausgeglichen, mit ein paar Wellen.' }, [
  ['zwei', 'Deine Stimmung über eine Woche ist eher …', ['… wie ein ruhiger See', -1], ['… wie Wellen, mal hoch, mal tief', 1]],
  ['skala', 'Meine Laune kann sich schnell ändern.', 1],
  ['skala', 'Mich bringt so schnell nichts aus der Ruhe.', -1],
  ['wahl', 'Nach einem Ärger bist du wieder ruhig …', [['… nach ein paar Minuten', -1], ['… nach ein paar Stunden', 0], ['… eher am nächsten Tag', 1]]]
]);
M('g-kraft', 'gefuehl', { art: 'thema', name: 'Was dir Kraft gibt', satz: 'Kraft geben dir vor allem: {x}.',
  wort: { musik: 'Musik', natur: 'Natur', menschen: 'Menschen, die du magst', stille: 'Ruhe', bewegung: 'Bewegung', bauen: 'etwas zu schaffen', entdecken: 'Neues entdecken', freiheit: 'Freiheit' } }, [
  ['wahl', 'Was gibt dir am meisten Kraft?', [['Musik', 'musik'], ['Natur', 'natur'], ['Menschen, die ich mag', 'menschen'], ['Ruhe', 'stille']]],
  ['wahl', 'An einem schweren Tag hilft dir am ehesten …', [['… Bewegung', 'bewegung'], ['… etwas zu schaffen', 'bauen'], ['… ein gutes Gespräch', 'menschen'], ['… Musik', 'musik']]],
  ['zwei', 'Lieber auftanken …', ['… draußen in der Natur', 'natur'], ['… zu Hause mit Musik', 'musik']],
  ['wahl', 'Richtig lebendig fühlst du dich, wenn du …', [['… etwas Neues entdeckst', 'entdecken'], ['… frei entscheiden kannst', 'freiheit'], ['… mit anderen lachst', 'menschen'], ['… etwas fertig gebaut hast', 'bauen']]]
]);
M('g-musik', 'gefuehl', { art: 'thema', zusatz: true, name: 'Welche Musik hilft', satz: 'Am meisten hilft dir: {x}.',
  wort: { ruhig: 'ruhige Musik zum Runterkommen', laut: 'laute Musik mit Energie', selbst: 'selbst Musik machen' } }, [
  ['wahl', 'Du hast Musik als Kraftquelle genannt. Welche hilft dir eher?', [['Ruhige Musik zum Runterkommen', 'ruhig'], ['Laute Musik mit Energie', 'laut'], ['Selbst Musik machen', 'selbst']], { wenn: [{ m: 'g-kraft', tag: 'musik' }] }]
]);

// ===================== Ideen =====================
M('i-menge', 'ideen', { art: 'achse', name: 'Menge', links: 'wenige, tiefe', rechts: 'viele, sprudelnd', wortL: 'tiefgründig', wortR: 'ideenreich',
  satzL: 'Deine Ideen kommen seltener, dafür tief.', satzR: 'Bei dir sprudeln die Ideen.', satzM: 'Du hast immer wieder Ideen – nicht zu wenige, nicht zu viele.' }, [
  ['zwei', 'Deine Ideen kommen eher …', ['… selten, aber gründlich', -1], ['… ständig, viele auf einmal', 1]],
  ['skala', 'Ich habe mehr Ideen, als ich umsetzen kann.', 1],
  ['skala', 'Ich bleibe lange an einer Idee dran, bevor die nächste kommt.', -1],
  ['wahl', 'Wie viele Ideen schwirren dir gerade im Kopf herum?', [['Eine oder zwei', -1], ['Ein paar', 0], ['Unzählige', 1]]]
]);
M('i-umsetzen', 'ideen', { art: 'achse', name: 'Umsetzen', links: 'reifen lassen', rechts: 'sofort bauen', wortL: 'geduldig', wortR: 'tatkräftig',
  satzL: 'Ideen lässt du erst reifen.', satzR: 'Du setzt Ideen am liebsten sofort um.', satzM: 'Manche Ideen baust du sofort, andere reifen erst.' }, [
  ['zwei', 'Eine neue Idee! Was passiert als Erstes?', ['Ich denke sie noch eine Weile durch', -1], ['Ich fange sofort an', 1]],
  ['skala', 'Ich probiere Ideen am liebsten gleich aus.', 1],
  ['skala', 'Gute Ideen dürfen bei mir erst reifen.', -1],
  ['wahl', 'Von deinen Ideen der letzten Zeit hast du …', [['… die meisten nur gesammelt', -1], ['… ein paar angefangen', 0], ['… viele umgesetzt', 1]]]
]);
M('i-teilen', 'ideen', { art: 'achse', name: 'Teilen', links: 'erst für dich', rechts: 'gleich teilen', wortL: 'tüftelnd', wortR: 'mitteilsam',
  satzL: 'Ideen behältst du erst für dich, bis sie reif sind.', satzR: 'Du teilst Ideen gern und spinnst mit anderen weiter.', satzM: 'Du tüftelst erst allein und teilst dann.' }, [
  ['zwei', 'Eine Idee, die dich begeistert: Du …', ['… behältst sie erst für dich', -1], ['… erzählst sie gleich jemandem', 1]],
  ['skala', 'Im Gespräch mit anderen werden meine Ideen besser.', 1],
  ['skala', 'Ich zeige Sachen erst, wenn sie fertig sind.', -1],
  ['zwei', 'Lieber …', ['… allein an einer Idee tüfteln', -1], ['… mit anderen zusammen spinnen', 1]]
]);
M('i-quelle', 'ideen', { art: 'thema', name: 'Woher Ideen kommen', satz: 'Deine Ideen kommen vor allem aus: {x}.',
  wort: { musik: 'Musik', menschen: 'Gesprächen', stille: 'der Stille', bewegung: 'Bewegung', bilder: 'schönen Dingen, die du siehst', entdecken: 'Neuem, das du lernst', worte: 'Geschichten', technik: 'Technik', natur: 'der Natur', reisen: 'fremden Orten' } }, [
  ['wahl', 'Woher kommen deine besten Ideen?', [['Aus Musik', 'musik'], ['Aus Gesprächen', 'menschen'], ['Aus der Stille', 'stille'], ['Beim Bewegen', 'bewegung']]],
  ['wahl', 'Was weckt deine Neugier am stärksten?', [['Etwas Schönes sehen', 'bilder'], ['Etwas Neues lernen', 'entdecken'], ['Eine gute Geschichte', 'worte'], ['Eine Technik, die ich noch nicht verstehe', 'technik']]],
  ['zwei', 'Ideen kommen eher …', ['… nachts und in Ruhe', 'stille'], ['… mitten im Trubel', 'menschen']],
  ['wahl', 'Ein Ausflug für neue Ideen: wohin?', [['In ein Museum', 'bilder'], ['In die Natur', 'natur'], ['In einen Plattenladen', 'musik'], ['In eine fremde Stadt', 'reisen']]]
]);
M('i-ablage', 'ideen', { art: 'thema', zusatz: true, name: 'Wo Ideen landen', satz: 'Deine Ideen landen: {x}.',
  wort: { kopf: 'nur im Kopf', handy: 'im Handy', papier: 'auf Papier', weg: 'nirgends – sie ziehen weiter' } }, [
  ['wahl', 'Du lässt Ideen gern reifen. Wo landen sie, bis du sie angehst?', [['Nur im Kopf', 'kopf'], ['Im Handy (Notiz oder Sprachnachricht)', 'handy'], ['Auf Papier', 'papier'], ['Nirgends – sie ziehen weiter', 'weg']], { wenn: [{ m: 'i-umsetzen', pol: -1 }, { m: 'i-menge', pol: 1 }] }]
]);

// ===================== Wissen =====================
M('w-lernweg', 'wissen', { art: 'achse', name: 'Lernweg', links: 'ausprobieren', rechts: 'erst verstehen', wortL: 'experimentierfreudig', wortR: 'wissbegierig',
  satzL: 'Du lernst am besten durch Ausprobieren.', satzR: 'Du willst erst verstehen, dann loslegen.', satzM: 'Du lernst durch Ausprobieren und Verstehen.' }, [
  ['zwei', 'Ein neues Programm auf dem Handy: Du …', ['… tippst einfach los', -1], ['… schaust dir erst an, wie es geht', 1]],
  ['skala', 'Ich lerne am meisten, wenn ich Fehler mache und es nochmal versuche.', -1],
  ['skala', 'Ich will erst verstehen, wie etwas funktioniert, bevor ich loslege.', 1],
  ['wahl', 'Am besten lernst du mit …', [['… einem eigenen Projekt', -1], ['… einem guten Video', 0], ['… einem Buch oder Kurs', 1]]]
]);
M('w-breite', 'wissen', { art: 'achse', name: 'Breite', links: 'breit', rechts: 'tief', wortL: 'vielseitig', wortR: 'tiefgehend',
  satzL: 'Dein Wissen ist breit: von vielem etwas.', satzR: 'Du gehst in die Tiefe: wenige Themen, die dafür richtig.', satzM: 'Du hast breites Wissen mit ein paar Tiefen.' }, [
  ['zwei', 'Lieber …', ['… von vielem ein bisschen wissen', -1], ['… über eine Sache alles wissen', 1]],
  ['skala', 'Wenn mich etwas packt, will ich es bis ins Letzte verstehen.', 1],
  ['skala', 'Ich springe gern von einem Thema zum nächsten.', -1],
  ['zwei', 'Ein Abend im Internet: Du landest eher …', ['… bei zehn verschiedenen Themen', -1], ['… tief in einem Thema', 1]]
]);
M('w-gebiete', 'wissen', { art: 'stufe', ziel: 5, name: 'Was du schon kannst',
  gebiete: { musik: 'Musik machen und aufnehmen', technik: 'Technik und Computer', geschichte: 'Geschichte', worte: 'Sprachen und Reden', menschen: 'Menschen verstehen',
    koerper: 'Körper und Gesundheit', natur: 'Natur und Tiere', bilder: 'Kunst und Gestaltung', geld: 'Geld und Wirtschaft', bauen: 'Handwerk und Bauen' } }, [
  ['stufe', 'Wie gut kennst du dich aus?', 'musik'], ['stufe', 'Wie gut kennst du dich aus?', 'technik'], ['stufe', 'Wie gut kennst du dich aus?', 'menschen'],
  ['stufe', 'Wie gut kennst du dich aus?', 'geschichte'], ['stufe', 'Wie gut kennst du dich aus?', 'worte'], ['stufe', 'Wie gut kennst du dich aus?', 'bilder'],
  ['stufe', 'Wie gut kennst du dich aus?', 'koerper'], ['stufe', 'Wie gut kennst du dich aus?', 'natur'], ['stufe', 'Wie gut kennst du dich aus?', 'geld'],
  ['stufe', 'Wie gut kennst du dich aus?', 'bauen']
]);
M('w-neugier', 'wissen', { art: 'thema', name: 'Worauf du neugierig bist', satz: 'Neugierig bist du auf: {x}.',
  wort: { musik: 'Musik und Klang', geschichte: 'Geschichte', technik: 'Technik', menschen: 'Menschen', reisen: 'fremde Länder', worte: 'Sprache', natur: 'Natur', bilder: 'Bilder und Gestaltung' } }, [
  ['wahl', 'Worüber würdest du gern mehr wissen?', [['Musik und Klang', 'musik'], ['Geschichte', 'geschichte'], ['Technik', 'technik'], ['Menschen und Gefühle', 'menschen']]],
  ['wahl', 'Ein Buch geschenkt – welches Thema freut dich am meisten?', [['Ferne Länder und Städte', 'reisen'], ['Sprache und Wörter', 'worte'], ['Natur und Weltall', 'natur'], ['Erfindungen', 'technik']]],
  ['zwei', 'Lieber verstehen, …', ['… wie Musik entsteht', 'musik'], ['… wie Menschen früher lebten', 'geschichte']],
  ['wahl', 'Ein Kurs geschenkt – du nimmst …', [['… Gesang oder ein Instrument', 'musik'], ['… eine neue Sprache', 'worte'], ['… Zeichnen oder Fotografieren', 'bilder'], ['… Programmieren', 'technik']]]
]);

// ===================== Mindset =====================
M('m-fehler', 'mindset', { art: 'achse', name: 'Fehler', links: 'hohe Ansprüche', rechts: 'Lernstoff', wortL: 'anspruchsvoll', wortR: 'gelassen',
  satzL: 'Du hast hohe Ansprüche – Fehler wurmen dich.', satzR: 'Fehler sind für dich Lernstoff.', satzM: 'Fehler ärgern dich kurz, dann lernst du daraus.' }, [
  ['zwei', 'Dir passiert ein dummer Fehler. Was denkst du eher?', ['„Das darf mir nicht passieren.“', -1], ['„Passiert – was lerne ich daraus?“', 1]],
  ['skala', 'Ein Fehler kann mich lange beschäftigen.', -1],
  ['skala', 'Fehler gehören für mich zum Lernen dazu.', 1],
  ['wahl', 'Beim dritten Versuch klappt es immer noch nicht. Du …', [['… ärgerst dich richtig', -1], ['… machst eine Pause', 0], ['… probierst es anders', 1]]]
]);
M('m-ziel', 'mindset', { art: 'achse', name: 'Weg und Ziel', links: 'der Weg', rechts: 'das Ziel', wortL: 'genießerisch', wortR: 'zielstrebig',
  satzL: 'Für dich zählt vor allem der Weg.', satzR: 'Du hast gern ein klares Ziel vor Augen.', satzM: 'Weg und Ziel sind dir beide wichtig.' }, [
  ['zwei', 'Was zählt für dich mehr?', ['Dass der Weg Spaß macht', -1], ['Dass ich ans Ziel komme', 1]],
  ['skala', 'Ich habe gern ein klares Ziel vor Augen.', 1],
  ['skala', 'Ich lasse mich gern treiben und schaue, wohin es geht.', -1],
  ['zwei', 'Eine lange Wanderung: Am schönsten ist …', ['… die Aussicht unterwegs', -1], ['… oben anzukommen', 1]]
]);
M('m-mut', 'mindset', { art: 'achse', name: 'Mut', links: 'lieber sicher', rechts: 'lieber mutig', wortL: 'vorsichtig', wortR: 'mutig',
  satzL: 'Du gehst lieber auf Nummer sicher.', satzR: 'Du traust dich und springst auch mal.', satzM: 'Du bist mutig, wenn es sich lohnt.' }, [
  ['zwei', 'Eine Chance mit Risiko: Du …', ['… bleibst lieber auf der sicheren Seite', -1], ['… springst', 1]],
  ['skala', 'Ich traue mich auch an Dinge, die ich noch nie gemacht habe.', 1],
  ['skala', 'Ich mag es, wenn ich weiß, was mich erwartet.', -1],
  ['wahl', 'Vor vielen Leuten etwas vorspielen oder vortragen?', [['Lieber nicht', -1], ['Wenn es sein muss', 0], ['Gern!', 1]]]
]);
M('m-antrieb', 'mindset', { art: 'thema', name: 'Was dich antreibt', satz: 'Dich treibt vor allem an: {x}.',
  wort: { freude: 'Spaß an der Sache', menschen: 'Menschen', freiheit: 'Freiheit', entdecken: 'Neues lernen', bauen: 'etwas Bleibendes schaffen' } }, [
  ['wahl', 'Was treibt dich am meisten an?', [['Spaß an der Sache', 'freude'], ['Anderen etwas geben', 'menschen'], ['Frei sein', 'freiheit'], ['Etwas Neues lernen', 'entdecken']]],
  ['wahl', 'Wofür stehst du gern früh auf?', [['Für ein eigenes Projekt', 'bauen'], ['Für Menschen, die mir wichtig sind', 'menschen'], ['Für ein Abenteuer', 'entdecken'], ['Für einen ganz freien Tag', 'freiheit']]],
  ['zwei', 'Was wäre dir wichtiger?', ['Frei entscheiden können', 'freiheit'], ['Etwas Bleibendes schaffen', 'bauen']],
  ['wahl', 'Welches Lob freut dich am meisten?', [['„Das hast du toll gebaut.“', 'bauen'], ['„Mit dir ist es schön.“', 'menschen'], ['„Du weißt ja echt viel.“', 'entdecken'], ['„Man merkt, wie viel Spaß dir das macht.“', 'freude']]]
]);
M('m-schritt', 'mindset', { art: 'thema', zusatz: true, name: 'Ziel gerade', satz: 'Gerade hast du: {x}.',
  wort: { ja: 'ein klares Ziel', lose: 'ein paar lose Ziele', nein: 'kein festes Ziel' } }, [
  ['wahl', 'Du magst klare Ziele. Hast du gerade eins, auf das du hinarbeitest?', [['Ja, ein klares', 'ja'], ['Ein paar lose', 'lose'], ['Gerade nicht', 'nein']], { wenn: [{ m: 'm-ziel', pol: 1 }] }]
]);

// ===================== Kreativität =====================
M('k-weise', 'kreativ', { art: 'achse', name: 'Arbeitsweise', links: 'frei spielen', rechts: 'mit Plan', wortL: 'verspielt', wortR: 'systematisch',
  satzL: 'Beim Erschaffen spielst du frei drauflos.', satzR: 'Du erschaffst mit Plan und System.', satzM: 'Du spielst erst frei und ordnest dann.' }, [
  ['zwei', 'Wenn du etwas erschaffst, …', ['… spielst du drauflos', -1], ['… hast du vorher einen Plan', 1]],
  ['skala', 'Meine besten Sachen entstehen aus Zufällen.', -1],
  ['skala', 'Ich arbeite gern mit festen Abläufen und Vorlagen.', 1],
  ['wahl', 'Ein leeres Blatt oder ein leeres Projekt. Was fühlst du?', [['Lust, einfach loszulegen', -1], ['Beides ein bisschen', 0], ['Erst brauche ich einen Plan', 1]]]
]);
M('k-rahmen', 'kreativ', { art: 'achse', name: 'Rahmen', links: 'ohne Vorgaben', rechts: 'mit Grenzen', wortL: 'freiheitsliebend', wortR: 'strukturliebend',
  satzL: 'Du brauchst Freiheit ohne Vorgaben.', satzR: 'Klare Grenzen machen dich kreativer.', satzM: 'Ein bisschen Rahmen, viel Freiheit – so passt es dir.' }, [
  ['zwei', 'Welche Aufgabe ist dir lieber?', ['„Mach, was du willst.“', -1], ['„Mach etwas mit genau drei Tönen.“', 1]],
  ['skala', 'Klare Vorgaben machen mich kreativer.', 1],
  ['skala', 'Regeln bremsen meine Ideen.', -1],
  ['zwei', 'Beim Gestalten hilft dir eher …', ['… völlige Freiheit', -1], ['… eine Grenze, an der du dich reibst', 1]]
]);
M('k-fertig', 'kreativ', { art: 'achse', name: 'Fertig werden', links: 'lange feilen', rechts: 'schnell fertig', wortL: 'sorgfältig', wortR: 'zügig',
  satzL: 'Du feilst gern, bis es richtig gut ist.', satzR: 'Du bringst Dinge schnell zu Ende.', satzM: 'Du feilst, aber machst auch fertig.' }, [
  ['zwei', 'Wann ist etwas für dich fertig?', ['Wenn es wirklich perfekt ist', -1], ['Wenn es gut genug ist und raus kann', 1]],
  ['skala', 'Ich feile oft noch lange an Kleinigkeiten.', -1],
  ['skala', 'Ich bringe Sachen lieber schnell zu Ende und mache dann was Neues.', 1],
  ['wahl', 'Ein Song oder Bild ist zu 90 % fertig. Du …', [['… feilst noch Wochen am Rest', -1], ['… machst noch einen Durchgang', 0], ['… gibst es frei', 1]]]
]);
M('k-ausdruck', 'kreativ', { art: 'thema', name: 'Womit du dich ausdrückst', satz: 'Du drückst dich am liebsten aus mit: {x}.',
  wort: { musik: 'Musik', worte: 'Worten', bilder: 'Bildern', bauen: 'Bauen und Basteln', technik: 'Technik' } }, [
  ['wahl', 'Womit drückst du dich am liebsten aus?', [['Musik', 'musik'], ['Worte', 'worte'], ['Bilder', 'bilder'], ['Bauen und Basteln', 'bauen']]],
  ['wahl', 'Ein freier Nachmittag zum Gestalten. Du …', [['… machst Musik', 'musik'], ['… schreibst', 'worte'], ['… fotografierst oder zeichnest', 'bilder'], ['… baust oder programmierst etwas', 'technik']]],
  ['zwei', 'Lieber …', ['… einen Song schreiben', 'musik'], ['… ein Video drehen', 'bilder']],
  ['wahl', 'Was würdest du gern einmal erschaffen?', [['Ein Album', 'musik'], ['Ein Buch', 'worte'], ['Einen Film', 'bilder'], ['Eine eigene App', 'technik']]]
]);
M('k-hindernis', 'kreativ', { art: 'thema', zusatz: true, name: 'Was beim Fertigmachen bremst', satz: 'Beim Fertigmachen bremst dich: {x}.',
  wort: { perfekt: '„noch nicht gut genug“', neues: 'schon die nächste Idee', zeit: 'Zeitmangel', nichts: 'nichts – du machst fertig' } }, [
  ['wahl', 'Was hält dich am ehesten davon ab, etwas fertig zu machen?', [['Es ist noch nicht gut genug', 'perfekt'], ['Mir fällt schon was Neues ein', 'neues'], ['Keine Zeit', 'zeit'], ['Nichts – ich mache fertig', 'nichts']], { wenn: [{ m: 'k-fertig', pol: -1 }, { m: 'm-fehler', pol: -1 }] }]
]);

export const MERKMALE = MERK;
export const MERKMAL = Object.fromEntries(MERK.map((m) => [m.id, m]));
export const FRAGEN = FR;
export const FRAGE = Object.fromEntries(FR.map((f) => [f.id, f]));

// Startfragen von 0.1 (Lernen) → Neugier im Bereich Wissen. Gebiet → Thema.
export const LERN_THEMA = { geschichte: 'geschichte', musik: 'musik', reisen: 'reisen', sprache: 'worte' };
// Thema → Gänge im Lernen-Teil (für Zukunfts-Ideen)
export const LERN_GAENGE = { musik: ['mischen', 'mastering', 'synthese'], geschichte: ['rom-caesar', 'athen-antike', 'ton-geschichte'],
  reisen: ['rom-reise', 'athen-reise', 'london-musik'], worte: ['rhetorik-antike', 'reden-heute', 'woerter-rom'] };

// Verbindungen zwischen Merkmalen (Karte). pol: −1/+1 = Pol der Achse; tag = Thema kommt vor. art: passt | spannung.
export const VERBINDUNGEN = [
  { a: ['p-energie', -1], b: ['i-quelle', 'stille'], art: 'passt', text: 'Ruhe tankt dich auf – und in der Stille kommen deine Ideen.' },
  { a: ['p-energie', 1], b: ['i-teilen', 1], art: 'passt', text: 'Menschen geben dir Energie – und mit ihnen werden deine Ideen besser.' },
  { a: ['p-energie', -1], b: ['i-teilen', -1], art: 'passt', text: 'Du tankst allein auf und lässt Ideen erst allein reifen.' },
  { a: ['d-weg', -1], b: ['k-weise', -1], art: 'passt', text: 'Bauchgefühl beim Denken, freies Spiel beim Erschaffen.' },
  { a: ['d-weg', 1], b: ['k-weise', 1], art: 'passt', text: 'Du denkst und erschaffst mit System.' },
  { a: ['d-tempo', -1], b: ['m-mut', 1], art: 'passt', text: 'Schnell entscheiden und mutig springen – das gehört bei dir zusammen.' },
  { a: ['d-tempo', 1], b: ['m-mut', -1], art: 'passt', text: 'Gründlich abwägen und sicher gehen – du bist besonnen.' },
  { a: ['i-umsetzen', 1], b: ['k-fertig', 1], art: 'passt', text: 'Macher-Linie: Ideen schnell anfangen und schnell fertig machen.' },
  { a: ['i-menge', 1], b: ['k-fertig', -1], art: 'spannung', text: 'Viele Ideen, aber jede will lange gefeilt werden – da staut sich leicht etwas.' },
  { a: ['m-fehler', -1], b: ['k-fertig', -1], art: 'passt', text: 'Hohe Ansprüche zeigen sich auch beim Feilen.' },
  { a: ['g-zeigen', 1], b: ['i-teilen', 1], art: 'passt', text: 'Du teilst Gefühle und Ideen gern.' },
  { a: ['g-zeigen', -1], b: ['i-teilen', -1], art: 'passt', text: 'Gefühle und Ideen reifen bei dir erst innen.' },
  { a: ['p-neu', 1], b: ['w-breite', -1], art: 'passt', text: 'Deine Lust auf Neues macht dein Wissen breit.' },
  { a: ['p-neu', -1], b: ['w-breite', 1], art: 'passt', text: 'Du vertiefst lieber, was du schon kennst.' },
  { a: ['p-plan', 1], b: ['m-ziel', 1], art: 'passt', text: 'Planen und klare Ziele – du weißt gern, wohin es geht.' },
  { a: ['p-plan', -1], b: ['k-rahmen', -1], art: 'passt', text: 'Spontan im Alltag, frei beim Erschaffen.' },
  { a: ['p-plan', -1], b: ['m-ziel', 1], art: 'spannung', text: 'Du willst ans Ziel, planst aber ungern – kleine Zwischenschritte helfen.' },
  { a: ['w-lernweg', -1], b: ['i-umsetzen', 1], art: 'passt', text: 'Ausprobieren statt lange planen – beim Lernen wie bei Ideen.' },
  { a: ['m-mut', 1], b: ['p-neu', 1], art: 'passt', text: 'Mut und Neugier ziehen dich zu Neuem.' },
  { a: ['k-rahmen', 1], b: ['d-weg', 1], art: 'passt', text: 'Klare Schritte und klare Grenzen helfen dir beim Denken und beim Erschaffen.' },
  { a: ['d-blick', -1], b: ['w-breite', -1], art: 'passt', text: 'Blick fürs Ganze und breites Wissen – du verbindest gern Dinge.' },
  { a: ['d-blick', 1], b: ['w-breite', 1], art: 'passt', text: 'Genauer Blick und tiefes Wissen – du gehst den Dingen auf den Grund.' },
  { a: ['g-staerke', 1], b: ['k-ausdruck', '*'], art: 'passt', text: 'Starke Gefühle finden einen Weg nach draußen: über {b}.' },
  { a: ['m-antrieb', 'entdecken'], b: ['w-neugier', '*'], art: 'passt', text: 'Neues lernen treibt dich an – passend dazu deine Neugier auf {b}.' },
  { a: ['m-mut', -1], b: ['i-teilen', -1], art: 'passt', text: 'Vorsichtig und tüftelnd: Du zeigst erst, was wirklich reif ist.' },
  { a: ['m-fehler', -1], b: ['g-staerke', 1], art: 'spannung', text: 'Hohe Ansprüche und starke Gefühle – ein Fehler kann sich groß anfühlen.' }
];

// Ideen für die Zukunft (regelbasiert, lokal). wenn: alle Bedingungen müssen gelten. link: Ziel in der App.
export const ZUKUNFT = [
  { id: 'garten', wenn: [['i-menge', 1], ['i-umsetzen', -1]], titel: 'Ideen-Garten', weil: 'viele Ideen, die erst reifen',
    text: 'Sammle Ideen an einem festen Ort. Einmal pro Woche holst du eine heraus und arbeitest 20 Minuten daran.' },
  { id: 'ablage', wenn: [['i-ablage', 'kopf|weg']], titel: 'Ein Ort für Ideen', weil: 'deine Ideen haben noch keinen festen Platz',
    text: 'Gib Ideen einen Ort: eine Notiz nur für Ideen. Hier im Kaninchenbau kannst du sie unter „Ideen“ festhalten.', link: ['#bereich/ideen', 'Idee festhalten'] },
  { id: 'gut-genug', wenn: [['k-fertig', -1]], titel: '„Gut genug für heute“', weil: 'du feilst gern lange',
    text: 'Setz dir Zwischenstände, die fertig sein dürfen: „Fassung 1“ statt „perfekt“. Später darf Fassung 2 kommen.' },
  { id: 'perfekt', wenn: [['k-hindernis', 'perfekt']], titel: 'Fertig vor perfekt', weil: '„noch nicht gut genug“ bremst dich',
    text: 'Lege vorher fest, wann etwas fertig ist – zum Beispiel drei Punkte, die stimmen müssen. Sind sie erfüllt, ist es fertig.' },
  { id: 'neues', wenn: [['k-hindernis', 'neues']], titel: 'Eins nach dem anderen', weil: 'die nächste Idee kommt schneller als das Ende',
    text: 'Bevor du Neues anfängst: Schreib die neue Idee auf und bring die alte Sache auf „gut genug“.' },
  { id: 'ruhe', wenn: [['p-energie', -1]], titel: 'Ruhe fest einplanen', weil: 'Ruhe lädt deine Batterie',
    text: 'Plane ruhige Zeiten fest ein – für dich sind sie Treibstoff, kein Luxus.' },
  { id: 'laut', wenn: [['i-teilen', 1]], titel: 'Ideen laut denken', weil: 'im Gespräch werden deine Ideen besser',
    text: 'Erzähl eine halbfertige Idee jemandem. Im Gespräch wächst sie bei dir am schnellsten.' },
  { id: 'machen', wenn: [['w-lernweg', -1]], titel: 'Lernen durch Machen', weil: 'du lernst durch Ausprobieren',
    text: 'Such dir zu einem Thema ein kleines eigenes Projekt statt eines langen Kurses.' },
  { id: 'verstehen', wenn: [['w-lernweg', 1]], titel: 'Erst der Überblick', weil: 'du willst erst verstehen',
    text: 'Gönn dir bei neuen Themen zuerst einen guten Überblick – ein Buch oder eine Vorlesung. Die Quellen im Lernen-Teil helfen.', link: ['#quellen', 'Quellen ansehen'] },
  { id: 'mutprobe', wenn: [['m-mut', -1]], titel: 'Kleine Mutproben', weil: 'du gehst gern auf Nummer sicher',
    text: 'Jede Woche ein kleiner Schritt aus dem Gewohnten – klein genug, dass er sicher bleibt.' },
  { id: 'ziel', wenn: [['m-ziel', 1]], titel: 'Ein Ziel, drei Schritte', weil: 'du magst klare Ziele',
    text: 'Schreib dein Ziel auf und die drei kleinsten Schritte dorthin. Der erste darf heute passieren.' },
  { id: 'weg', wenn: [['m-ziel', -1]], titel: 'Projekte ohne Ziel', weil: 'für dich zählt der Weg',
    text: 'Gönn dir Vorhaben, die nirgendwo hinmüssen – einfach, weil der Weg Spaß macht.' },
  { id: 'kraft', wenn: [['g-kraft', '*']], titel: 'Kraftquelle einplanen', weil: 'Kraft gibt dir: {g-kraft}',
    text: '{g-kraft}: Das tut dir gut. Plane es ein, bevor du es brauchst – nicht erst, wenn der Akku leer ist.' },
  { id: 'spaziergang', wenn: [['d-zugang', 'bewegung']], titel: 'Denk-Spaziergang', weil: 'in Bewegung denkst du gut',
    text: 'Nimm eine offene Frage mit auf einen Spaziergang und schau, was zurückkommt.' },
  { id: 'rahmen', wenn: [['k-rahmen', 1]], titel: 'Rahmen-Spiel', weil: 'Grenzen machen dich kreativer',
    text: 'Gib dir selbst Grenzen: drei Töne, drei Farben, zehn Minuten – und schau, was entsteht.' },
  { id: 'spiel', wenn: [['k-weise', -1]], titel: 'Freie Spielzeit', weil: 'deine besten Sachen entstehen beim Spielen',
    text: 'Plane Spielzeit ohne Ziel ein. Nimm sie auf oder halte sie fest – Zufälle sind dein Rohstoff.' },
  { id: 'quer', wenn: [['w-breite', -1], ['p-neu', 1]], titel: 'Querfeldein lernen', weil: 'du springst gern zwischen Themen',
    text: 'Folge den Querverbindungen im Lernen-Baum – von einem Thema zum nächsten, genau dein Weg.', link: ['#baum', 'Baum ansehen'] },
  { id: 'tief', wenn: [['w-breite', 1]], titel: 'Bis zum Profi', weil: 'du gehst gern in die Tiefe',
    text: 'Nimm dir einen Gang im Lernen-Teil und geh alle drei Stufen durch – bis zum Profi.', link: ['#gaenge', 'Zu den Gängen'] },
  { id: 'gefuehl', wenn: [['g-staerke', 1], ['g-zeigen', -1]], titel: 'Gefühle in Form bringen', weil: 'starke Gefühle, die du für dich behältst',
    text: 'Was du stark fühlst und nicht erzählen magst, kann trotzdem raus: in einem Song, einem Text oder einem Bild.' },
  { id: 'gang', wenn: [['lernen', '*']], titel: 'Ein Gang für deine Neugier', weil: 'Neugier auf {lernen}',
    text: 'Im Lernen-Teil wartet ein Gang dazu: „{gang}“. Drei kurze Fragen pro Stufe.', link: ['#ast/{gangId}', 'Gang ansehen'] }
];
