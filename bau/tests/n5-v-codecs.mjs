import { chromium } from 'playwright';
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage();
await p.goto('file://'+process.cwd()+'/n5-v-blank.html');
const r = await p.evaluate(async () => {
  const out = {ua: navigator.userAgent, VE: typeof VideoEncoder, AE: typeof AudioEncoder};
  for (const codec of ['avc1.640028','avc1.4d0028','avc1.42e01f','avc1.640032']) {
    try { out[codec] = (await VideoEncoder.isConfigSupported({codec, width:1080, height:1920, bitrate:6e6, framerate:30})).supported; } catch(e) { out[codec] = 'err '+e.message; }
  }
  for (const codec of ['mp4a.40.2','opus']) {
    try { out[codec] = (await AudioEncoder.isConfigSupported({codec, sampleRate:48000, numberOfChannels:2, bitrate:192000})).supported; } catch(e) { out[codec] = 'err '+e.message; }
  }
  out.mr = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'].map(t=>[t,MediaRecorder.isTypeSupported(t)]);
  return out;
});
console.log(JSON.stringify(r,null,1));
await b.close();
