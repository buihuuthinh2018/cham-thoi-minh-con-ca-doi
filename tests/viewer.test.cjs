const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(native='missing'){
  function node(){const classes=new Set();return {dataset:{},values:{},attrs:{},listeners:{},style:{setProperty(k,v){this[k]=v;}},classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},contains:n=>classes.has(n)},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;},dispatchEvent(){},focus(){},matches:()=>false};}
  const root=node(),nodes={};const doc={body:node(),documentElement:node(),activeElement:node(),listeners:{},querySelector(s){if(s==='#cinema')return root;return nodes[s]||(nodes[s]=node());},addEventListener(k,fn){this.listeners[k]=fn;}};
  const orientation={lock:async()=>{},unlock(){this.unlocked=true;},addEventListener(){}};
  const win={innerWidth:390,innerHeight:844,scrollY:125,screen:{orientation},Event:class{},addEventListener(){},scrollTo(x,y){this.restored=y;}};
  if(native==='success'){doc.documentElement.requestFullscreen=async()=>{doc.fullscreenElement=doc.documentElement;};doc.exitFullscreen=async()=>{doc.fullscreenElement=null;};}
  if(native==='reject')doc.documentElement.requestFullscreen=async()=>{throw new Error('Unsupported');};
  const ctx={document:doc,window:win,setTimeout:()=>1,clearTimeout(){}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/viewer.js','utf8'),ctx);return {viewer:win.loveViewer,root,doc,win,nodes};
}
(async()=>{
  for(const mode of ['missing','reject','success']){
    const {viewer,root,doc,win,nodes}=fixture(mode);await viewer.enter();assert.equal(viewer.active,true,mode);assert.ok(root.classList.contains('cinema-mode'));assert.ok(doc.body.classList.contains('viewer-open'));assert.equal(root.dataset.rotated,'true');assert.equal(root.style['--viewer-logical-width'],'844px');assert.equal(root.style['--viewer-logical-height'],'390px');
    const w=parseFloat(root.style['--viewer-film-width']),h=parseFloat(root.style['--viewer-film-height']);assert.ok(w<=844&&h<=390);assert.ok(Math.abs(w/h-16/9)<.001);
    nodes['#viewer-rotate'].listeners.click();assert.equal(root.dataset.rotated,'false');assert.equal(root.style['--viewer-logical-width'],'390px');
    win.innerWidth=844;win.innerHeight=390;viewer.layout();assert.equal(root.dataset.rotated,'false');assert.equal(nodes['#viewer-rotate'].disabled,true);
    viewer.setPlaying(true);viewer.hideControls();assert.ok(root.classList.contains('controls-hidden'));viewer.setPlaying(false);assert.equal(root.classList.contains('controls-hidden'),false);
    await viewer.exit();assert.equal(viewer.active,false);assert.equal(doc.body.classList.contains('viewer-open'),false);assert.equal(win.restored,125);assert.equal(doc.fullscreenElement||null,null);
  }
  const external=fixture('success');await external.viewer.enter();external.doc.fullscreenElement=null;external.viewer.fullscreenChanged();assert.equal(external.viewer.active,false,'System fullscreen exit closes CSS mode');
  const pending=fixture();let resolve;pending.doc.documentElement.requestFullscreen=()=>new Promise(r=>resolve=()=>{pending.doc.fullscreenElement=pending.doc.documentElement;r();});pending.doc.exitFullscreen=async()=>{pending.doc.fullscreenElement=null;};const entering=pending.viewer.enter();await pending.viewer.exit();resolve();await entering;assert.equal(pending.viewer.active,false);assert.equal(pending.doc.fullscreenElement,null,'Late fullscreen response must not reopen the player');
  const viewport=fixture();viewport.win.visualViewport={width:375,height:630};await viewport.viewer.enter();assert.equal(viewport.root.style['--viewer-height'],'630px');await viewport.viewer.exit();
  for(const [width,height]of [[320,568],[375,667],[390,844],[430,932],[667,375],[844,390],[932,430],[768,1024],[1024,768]]){
    const f=fixture();f.win.innerWidth=width;f.win.innerHeight=height;await f.viewer.enter();const fw=parseFloat(f.root.style['--viewer-film-width']),fh=parseFloat(f.root.style['--viewer-film-height']);const rotated=f.root.dataset.rotated==='true';assert.ok(fw<=(rotated?height:width)+.001&&fh<=(rotated?width:height)+.001,`Film must fit ${width}x${height}`);await f.viewer.exit();
  }
  console.log('PASS: unavailable/rejected/native fullscreen, portrait rotation, landscape fit, controls, system exit, late response and visual viewport.');
})().catch(e=>{console.error(e);process.exitCode=1;});
