const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'../dist');
function run(at){
  let nextFrame,draws=0,depth=0;
  const context=new Proxy({save(){depth++;},restore(){depth--;assert.ok(depth>=0,'Canvas restore must match save');},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get(target,key){if(key in target)return target[key];return (...args)=>{draws++;for(const x of args)if(typeof x==='number')assert.ok(Number.isFinite(x),`${key}: non-finite drawing coordinate at ${at}`);};},set(target,key,value){target[key]=value;return true;}});
  const elements=new Map();
  function element(){return {clientWidth:900,width:1600,height:900,tagName:'BODY',dataset:{},classList:{toggle(){return false;},remove(){}},setAttribute(){},getAttribute(){return '';},getContext(type){if(type==='webgl')return null;context.canvas=this;return context;},replaceWith(){},addEventListener(){},append(){}};}
  class AudioMock{constructor(){this.paused=true;this.currentTime=0;this.duration=240;}addEventListener(){}pause(){this.paused=true;}async play(){this.paused=false;}}
  const sandbox={console,URL,URLSearchParams,Float32Array,performance:{now:()=>0},setTimeout,clearTimeout,Audio:AudioMock,location:{search:`?t=${at}`,origin:'http://localhost'},requestAnimationFrame:fn=>nextFrame=fn,document:{activeElement:element(),createElement:element,querySelector(selector){if(!elements.has(selector))elements.set(selector,element());return elements.get(selector);},querySelectorAll(){return [];},head:{appendChild(){}}},window:{addEventListener(){},devicePixelRatio:1}};
  vm.createContext(sandbox);
  for(const name of ['motion.js','timeline.js','lyrics.js','soundtrack.js','film.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox,{filename:name});
  nextFrame(1000);assert.equal(depth,0,'Every drawing must restore the Canvas stack');assert.ok(draws>100);
  return sandbox;
}
const first=run(0),timeline=first.window.LOVE_TIMELINE;
let cursor=0;
for(const shot of timeline.shots){assert.equal(shot[0],cursor,'No gap or overlap in narrative timeline');assert.ok(shot[1]>shot[0]);cursor=shot[1];for(const offset of [.01,.5,.99])run(shot[0]+(shot[1]-shot[0])*offset);}
assert.equal(cursor,timeline.duration);
run(timeline.duration);
const m=first.window.FILM_MOTION;
assert.equal(m.travel(100,500,0,0,4).speed,0);assert.equal(m.travel(100,500,4,0,4).speed,0);assert.equal(m.travel(100,500,4,0,4).x,500);
for(let t=0;t<4;t+=.1){const a=m.travel(100,500,t,0,4);assert.ok(a.x>=100&&a.x<=500);assert.ok(a.speed>=0);for(const foot of m.gait(a.distance,a.speed,1.8).feet)assert.ok(Number.isFinite(foot.x)&&Number.isFinite(foot.y));}
const sound=vm.runInContext('new LoveSoundtrack()',first);sound.silent();sound.play(12);assert.equal(sound.time(),12);sound.seek(50);assert.equal(sound.time(),50);sound.pause();assert.equal(sound.time(),50);assert.equal(sound.playing,false);
sound.kind='file';assert.equal(sound.duration,240);sound.seek(120);assert.equal(sound.time(),120);sound.play(80);assert.equal(sound.time(),80);sound.pause();assert.equal(sound.playing,false);
console.log(`PASS: ${timeline.shots.length} shots × 3 poses, ending, Canvas balance, finite coordinates, travel and soundtrack seek/pause.`);
