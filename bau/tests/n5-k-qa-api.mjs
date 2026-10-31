import {launch} from './n5-k-blib.mjs';
const {b, p} = await launch({init: false});
console.log(await p.evaluate(() => ['tkInject', 'launchScene', 'fangPart', 'selectTrack', 'loadDemo', 'setRecOptions', 'resetCarrier', 'tkInfo', 'setMetronome', 'openEditor', 'closeEditor', 'voices', 'noteLog', 'stop', 'undo', 'redo', 'load', 'importProject', 'setEngine', 'tkList', 'takes'].map(k => k + ':' + typeof SYNQUENZER[k]).join(' ')));
await b.close();
