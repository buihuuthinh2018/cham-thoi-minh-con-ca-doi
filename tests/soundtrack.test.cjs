const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function fixture(){
  const timers=new Map();let serial=0;
  class AudioMock{constructor(){this.paused=true;this.currentTime=0;this.duration=226.533875;this.events={};}addEventListener(name,fn){this.events[name]=fn;}pause(){this.paused=true;}async play(){this.paused=false;this.events.playing();}}
  const sandbox={window:{LOVE_TIMELINE:{duration:288}},Audio:AudioMock,document:{querySelector(){return {textContent:''};}},performance:{now:()=>0},setTimeout(fn){const id=++serial;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
  vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/soundtrack.js'),'utf8'),sandbox);
  return {sound:vm.runInContext('new LoveSoundtrack()',sandbox),timers};
}
(async()=>{
  const {sound,timers}=fixture();assert.equal(sound.kind,'file');assert.equal(sound.audio.src,'audio/cham-cham-thich-em.mp3');
  let state; sound.onState=s=>state=s;await sound.play(10);assert.equal(state,'playing');assert.equal(sound.time(),10);assert.equal(timers.size,0);
  sound.seek(80);assert.equal(sound.time(),80);sound.pause();assert.equal(sound.playing,false);sound.mute();assert.equal(sound.audio.muted,true);
  sound.seek(999);assert.equal(sound.time(),sound.duration);sound.silent();await sound.play(6);assert.equal(sound.time(),6);sound.selectDefault();assert.equal(sound.kind,'file');assert.equal(sound.audio.src,'audio/cham-cham-thich-em.mp3');
  sound.audio.play=()=>new Promise(()=>{});const slow=sound.play().catch(e=>e.message);[...timers.values()][0]();assert.match(await slow,/tải chậm/);assert.equal(sound.playing,false);
  sound.audio.play=()=>Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));await assert.rejects(sound.play(),/Nhấn nút Phát/);
  let release;sound.audio.play=()=>new Promise(resolve=>release=resolve);const cancelled=sound.play(5);sound.pause();release();assert.equal(await cancelled,false);
  const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/lyrics.js'),'utf8'),sandbox);
  let end=0;for(const cue of sandbox.window.LOVE_LYRICS){assert.ok(cue.start>=end,'Lyrics cannot overlap');assert.ok(cue.end>cue.start);assert.ok(cue.end<=sandbox.window.LOVE_AUDIO_DURATION);assert.ok(cue.text.trim());end=cue.end;}
  assert.ok(sandbox.window.LOVE_LYRICS.length>40);assert.ok(!fs.readFileSync(path.join(__dirname,'../dist/soundtrack.js'),'utf8').includes('iframe_api'));
  console.log('PASS: built-in MP3, playback, pause, mute, seeking, timeout, blocked playback, cancellation and 52 subtitle cues.');
})().catch(error=>{console.error(error);process.exitCode=1;});
