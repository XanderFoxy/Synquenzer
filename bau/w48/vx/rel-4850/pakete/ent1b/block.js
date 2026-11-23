/*ENT1B-BEGIN*/
const ENT1B_OK=v=>v==='m'||VID6.n.includes(v);
function ent1bProj(){const s=typeof S!=='undefined'&&S&&S.settings;return s&&ENT1B_OK(s.vid6n)?s.vid6n:null;}
function ent1bDev(){const p=uiPrefs().vv||{};return p.vid6n==='m'?'m':VID6.n.includes(p.vid6n)?p.vid6n:2;}
function ent1bFx(v){if(ENT1B_OK(v))vvPrefSet('vid6n',v);if(typeof VD3!=='undefined'&&VD3)VD3.chipC=null;UI.dirty.song=true;vr1Dirty();vid6WarmSoon();}
function ent1bSet(x){
if(!S||!S.settings||!ENT1B_OK(x))return;
const cur=ent1bProj(),was=cur!==null?cur:ent1bDev();
if(cur===x)return;
S.settings.vid6n=x;markDirty();
undoPush({kind:'set',key:'vid6n',before:JSON.stringify(was),label:'Bildwechsel'});
}
function ent1bNew(p){try{const v=(uiPrefs().vv||{}).vid6n;if(p&&p.settings)p.settings.vid6n=v==='m'||[1,2,4,8].includes(v)?v:2;}catch(e){}}
/*ENT1B-END*/
