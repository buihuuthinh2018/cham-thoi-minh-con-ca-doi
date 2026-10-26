/* Chậm thôi, mình còn cả đời — a deterministic, time-based animated film.
   Canvas drawings become a WebGL texture, graded and projected every frame. */
(() => {
  'use strict';
  const W=1600,H=900,DURATION=window.LOVE_TIMELINE.duration;
  const canvas=document.querySelector('#film');
  const paper=document.createElement('canvas');paper.width=W;paper.height=H;
  const c=paper.getContext('2d',{alpha:false});
  
  
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
  const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  function rect(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
  function ellipse(x,y,rx,ry,col,rot=0){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fill();}
  function path(points,col,stroke,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(col){c.fillStyle=col;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function line(points,col,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function round(x,y,w,h,r,col){c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function text(s,x,y,size=14,color='#dfd4bd',align='left',font='sans-serif'){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign=align;c.fillText(s,x,y);}
  function glow(x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function sky(top='#172a3c',bottom='#53616c'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bottom);rect(0,0,W,H,g);}
  function city(t,{warm=false,base=620,alpha=1,offset=0}={}){
    c.save();c.globalAlpha=alpha;
    for(let layer=0;layer<3;layer++){
      const n=layer===0?25:17;
      for(let i=-1;i<n;i++){
        const seed=i+100+layer*51,bw=layer===0?87:125,x=i*bw+offset*(layer+1)*.2;
        const height=90+hash(seed)*((layer+1)*110),y=base-height+layer*23;
        const colors=warm?['#746d69','#615e61','#3e4650']:['#263e51','#263b4a','#1b303f'];
        rect(x,y,bw-6,height+200,colors[layer]);
        if(hash(seed+10)>.65){rect(x+10,y-13,bw-30,13,colors[layer]);line([[x+bw/2,y-13],[x+bw/2,y-37]],colors[layer],2);}
        for(let row=0;row<height/26;row++)for(let col=0;col<(bw-20)/18;col++){
          const lit=hash(seed*74+row*7+col*71)>.65;
          rect(x+10+col*18,y+14+row*26,6,10,lit?(warm?'#e9ba7a':'#baaa86'):(warm?'#8a7f72':'#425665'));
        }
      }
    }
    c.restore();
  }
  function rain(t,strength=1,front=false){
    c.save();c.globalAlpha=front?.25:.14;c.strokeStyle='#b7d5df';c.lineWidth=front?1.4:.7;
    c.beginPath();for(let i=0;i<180*strength;i++){const x=(hash(i+4)*1900-t*85)%1850;const y=(hash(i+830)*950+t*(front?410:270))%900-70;c.moveTo(x,y);c.lineTo(x-8,y+24);}c.stroke();c.restore();
  }
  function dust(t,count=50,warm=false){c.save();for(let i=0;i<count;i++){const x=hash(i+281)*W+Math.sin(t*.13+i)*20,y=(hash(i+591)*H-t*(3+hash(i)*8)+10000)%H;c.globalAlpha=.08+hash(i)*.22;ellipse(x,y,hash(i+1)*1.8+.6,hash(i+1)*1.8+.6,warm?'#ffe8b9':'#b3c8ce');}c.restore();}
  function floor(y=620,warm=false){rect(0,y,W,H-y,warm?'#867467':'#24323d');for(let i=0;i<9;i++)line([[0,y+i*28],[W,y+i*28]],warm?'#78695f':'#2b3942',1);}
  function plant(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);path([[-22,0],[22,0],[16,42],[-16,42]],'#9c7561');ellipse(0,0,22,6,'#b58c71');line([[0,0],[3,-80]],'#526a5e',3);for(let i=0;i<5;i++){const side=i%2?1:-1;ellipse(3+side*13,-18-i*13,19,7,'#647f6b',side*.6);}c.restore();}
  function lamp(x,y,s=1,on=true){c.save();c.translate(x,y);c.scale(s,s);line([[0,0],[0,-120]],'#9b8976',4);ellipse(0,0,33,6,'#3c4245');if(on)glow(0,-95,180,'#efbd7640');path([[-30,-120],[30,-120],[44,-78],[-44,-78]],on?'#e5c59a':'#807c72');ellipse(0,-78,44,8,on?'#efd9b1':'#999083');c.restore();}
  function picture(x,y,w=90,h=70){rect(x,y,w,h,'#a89a80');rect(x+4,y+4,w-8,h-8,'#425c5d');ellipse(x+w*.72,y+h*.28,9,9,'#d9bc83');path([[x+4,y+h-4],[x+w*.32,y+23],[x+w*.6,y+h-4]],'#7b8a72');path([[x+w*.3,y+h-4],[x+w*.7,y+30],[x+w-4,y+h-4]],'#5b7268');}
  function phone(x,y,s=1,lit=true,call=false){c.save();c.translate(x,y);c.scale(s,s);round(-15,-26,30,54,5,'#101e29');round(-12,-22,24,43,3,lit?'#c2d5c6':'#2f414e');if(lit){rect(-7,-14,14,3,'#617e7a');rect(-7,-7,10,2,'#8aa49a');if(call){ellipse(0,2,7,8,'#d2a78e');path([[-10,19],[-7,10],[6,10],[10,19]],'#5f8786');ellipse(0,16,3,3,'#ad6566');}else{rect(-7,0,14,2,'#8aa49a');rect(-3,7,10,4,'#6b9286');}ellipse(0,25,1.4,1.4,'#708189');}c.restore();}
  // Chibi cast: large expressive heads, compact bodies and soft outlined shapes.
  function inkShape(draw,color,outline='#293740',width=2){
    c.beginPath();draw();c.closePath();c.fillStyle=color;c.fill();
    if(outline){c.strokeStyle=outline;c.lineWidth=width;c.lineJoin='round';c.stroke();}
  }
  const motion=window.FILM_MOTION;
  let performanceCue={name:'night',time:0,world:0};
  const curve=(keys)=>motion.track(performanceCue.time,keys);
  const actingRules={};
  function actorPerformance(o,kind='girl'){
    const rules=actingRules[performanceCue.name]||{},v={...o};
    for(const [key,source] of Object.entries({phone:'withPhone',pain:'pain',protect:'protect',reach:'reach',tired:'tired',sad:'sad',happy:'happy',worry:'worry'})){
      v[key+'Weight']=o[source]===undefined?0:Number(o[source]);
      if(rules[key]&&(!o.role||o.role==='lead'))v[key+'Weight']=curve(rules[key]);
    }
    if(o.face)for(const [k,val]of Object.entries(o.face))v[k+'Weight']=val;
    v.gazeValue=rules.gaze&&(!o.role||o.role==='lead')?curve(rules.gaze):o.gaze||0;
    v.headValue=rules.head&&(!o.role||o.role==='lead')?curve(rules.head):o.headTilt||0;
    v.clock=performanceCue.world;v.local=o.t||0;return v;
  }
  function chibiFace(x,y,{t=0,tired=0,young=false,elder=false,sad=0,happy=0,worry=0,anger=0,surprise=0,gaze=0,lookDown=0,seed=0}={}){
    t=performanceCue.world||t;tired=Number(tired);sad=Number(sad);happy=Number(happy);worry=Number(worry);
    c.save();c.translate(x,y);
    ellipse(-43,3,7,10,'#dfb39a');ellipse(43,3,7,10,'#dfb39a');
    inkShape(()=>{c.moveTo(-44,-13);c.bezierCurveTo(-48,-52,45,-54,45,-12);c.bezierCurveTo(49,17,27,42,2,44);c.bezierCurveTo(-24,43,-47,23,-44,-13);},'#f2cfb3','#654c49',1.8);
    c.save();c.globalAlpha=.55+happy*.3;ellipse(-28,18,10,5,'#e7a99c');ellipse(28,18,10,5,'#e7a99c');c.restore();
    const interval=4.3+hash(seed+11)*1.9-worry*.6,phase=(t+hash(seed+73)*interval)%interval;
    const blink=motion.smooth((phase-interval+.19)/.065)*(1-motion.smooth((phase-interval+.1)/.085));
    const lid=clamp(blink+(1-blink)*(tired*.34+sad*.06+anger*.2));
    const saccade=motion.track(t%7.4,[[0,0],[2.1,0],[2.25,-.6],[3.8,-.6],[4,0],[7.4,0]]);
    for(const side of [-1,1]){
      const ex=side*18,height=Math.max(.7,10.2*(1-lid)+surprise*2),ey=3+lookDown*2;
      if(lid>.94||elder){line([[ex-6,ey],[ex,ey+(elder?-1:1)],[ex+6,ey]],'#51454a',2.2);}
      else{
        c.save();c.beginPath();c.ellipse(ex,ey,7.4,height,0,0,Math.PI*2);c.clip();
        rect(ex-9,ey-14,18,29,'#fff1db');
        ellipse(ex+clamp(gaze+saccade,-4,4),ey+lookDown*2,6.2,9,'#443d45');ellipse(ex+.7+gaze,ey+3+lookDown*2,4,5.5,'#776056');
        ellipse(ex-2+gaze,ey-3+lookDown*2,2,2.6,'#fff1d9');ellipse(ex+2+gaze,ey+5,1,1.2,'#f6e5c9');c.restore();
        c.strokeStyle='#443d45';c.lineWidth=2.2;c.beginPath();c.ellipse(ex,ey,7.4,height,0,Math.PI,Math.PI*2);c.stroke();
      }
      const brow=side*(sad*4+worry*2.3-anger*5.5);
      line([[ex-6,-17+tired*3+brow-surprise*4],[ex+5,-18-brow-surprise*4]],'#6f554f',1.7);
      if(tired>.05){c.save();c.globalAlpha=tired*.7;line([[ex-5,17],[ex+5,18]],'#ba978c',1.1);c.restore();}
    }
    c.strokeStyle='#a66e68';c.lineWidth=1.8;c.beginPath();c.moveTo(-5-happy*1.5,28);
    c.quadraticCurveTo(0,28+happy*5-sad*4-worry*2-anger,5+happy*1.5,28);c.stroke();
    if(surprise>.1)ellipse(0,29,2+surprise,1+surprise*3,'#af7c72');
    if(elder){for(const side of [-1,1]){line([[side*29,7],[side*35,10]],'#ba9182',1);line([[side*27,26],[side*32,23]],'#ba9182',1);}}
    c.restore();
  }
  function rigLimb(a,b,l1,l2,bend,color,width){
    const span=Math.hypot(b[0]-a[0],b[1]-a[1]);if(span>l1+l2-.5){const stretch=(span+.6)/(l1+l2);l1*=stretch;l2*=stretch;}
    const j=motion.joint(a,b,l1,l2,bend);line([a,j],color,width);line([j,b],color,width-1);return j;
  }
  function rigLegs(o,g,bob,pants,light,shoes){
    if(o.sit){
      rigLimb([-14,-63],[24,-7],42,29,-1,pants,20);rigLimb([14,-63],[48,-7],41,29,-1,light,20);
      round(12,-11,32,13,6,shoes);round(38,-11,31,13,6,shoes);return;
    }
    for(let i=0;i<2;i++){
      const f=g.feet[i],target=[f.x,f.y+bob-4];
      const length=Math.max(29.7,Math.hypot(target[0]-(i?13:-13),target[1]+63)/2+.2);
      rigLimb([i?13:-13,-63],target,length,length,g.weight>.15?-1:(i?-1:1),i?light:pants,19);
      c.save();c.translate(f.x,f.y+bob-4);c.rotate(f.roll);round(-13,-8,30,14,6,shoes);line([[-8,3],[11,3]],'#b4b4aa',1.8);c.restore();
    }
  }
  function rigArms(o,shirt,gender,g){
    const base=gender==='man'?-66:0;
    const idle=[[-35-g.sway*160,0],[34+g.sway*160,0]];
    const poses={phone:[[-10,-34],[17,-34]],pain:[[-38,-9],[26,7]],protect:[[-68,-67],[68,-67]],reach:[[-31,0],[62,-40]],tired:[[-19,-4],[28,-3]]};
    let targets=idle.map(p=>p.slice());
    for(const k of ['tired','reach','protect','pain','phone']){const w=clamp(o[k+'Weight']||0);targets=targets.map((p,i)=>motion.mix(p,poses[k][i],w));}
    if(o.hands)targets=o.hands;
    targets=targets.map(p=>[p[0],p[1]+base]);
    for(let i=0;i<2;i++){
      rigLimb([i?29:-29,-54+base],targets[i],28.5,28.5,i?-1:1,shirt,17);
    }
    if(o.phoneWeight>.01){const r=targets[1];c.save();c.translate(r[0]-12,r[1]-8);c.rotate((1-o.phoneWeight)*.35);phone(0,0,.83,!o.back,true);c.restore();}
    if(o.fork||o.spoon){const l=targets[0];line([[l[0]+2,l[1]+4],[l[0]+2,l[1]-24]],'#b5c2b1',2);if(o.spoon)ellipse(l[0]+2,l[1]-27,4,6,'#b5c2b1');else for(let j=0;j<3;j++)line([[l[0]-2+j*4,l[1]-24],[l[0]-2+j*4,l[1]-32]],'#b5c2b1',1.3);}
    if(o.cup){const l=targets[0];c.save();c.translate(l[0]+5,l[1]+7);c.rotate(o.cupTilt||0);mug(0,0,'#c6b89d');c.restore();}
    for(const p of targets){ellipse(p[0],p[1],6.5,7,'#f0c9aa');line([[p[0]-2,p[1]+3],[p[0]+2,p[1]+3]],'#d8a78f',1);}
  }
  function chibiHair(x,y,{female=true,back=false,elder=false,t=0,tone=null}={}){
    const hair=tone|| (elder?'#b7b8aa':'#34313e'),shine=elder?'#d9d6c2':'#5c4b58';
    c.save();c.translate(x,y);
    if(back){ellipse(0,-4,51,54,hair);if(female)round(-49,-1,98,102,30,hair);}
    else if(female){
      inkShape(()=>{c.moveTo(-47,13);c.bezierCurveTo(-69,-60,35,-80,51,-19);c.bezierCurveTo(57,-6,52,11,45,22);c.lineTo(36,-7);c.quadraticCurveTo(14,-8,5,-29);c.quadraticCurveTo(-7,-3,-34,-3);c.lineTo(-39,24);c.closePath();},hair,'#292e38',2);
      c.strokeStyle=shine;c.lineWidth=3;c.beginPath();c.moveTo(-37,-26);c.quadraticCurveTo(-22,-49,3,-45);c.stroke();
      // Her small gold hair clip is retained through every age and outfit.
      line([[-42,-8],[-30,-14]],'#ddba7d',4);ellipse(-42,-8,2,2,'#fae3aa');
    }else{
      inkShape(()=>{c.moveTo(-47,8);c.lineTo(-51,-18);c.quadraticCurveTo(-52,-43,-24,-49);c.lineTo(-12,-57);c.lineTo(2,-51);c.quadraticCurveTo(39,-57,49,-27);c.lineTo(47,10);c.lineTo(35,-9);c.quadraticCurveTo(22,-10,15,-25);c.quadraticCurveTo(-8,-7,-32,-6);c.lineTo(-39,13);},hair,'#292e38',2);
      line([[-29,-30],[-9,-39],[10,-39]],shine,3);
    }
    c.restore();
  }
  function girl(x,y,s=1,raw={}){
    const o=actorPerformance(raw),{child=false,sit=false,apron=false,back=false,coat=false,alpha=1}=o;
    const m=o.motion||{distance:0,speed:0,facing:1},g=motion.gait(m.distance,m.speed,s),bob=g.bob;
    const facing=o.facing===undefined?m.facing:o.facing,faceX=Math.sign(facing||1)*Math.max(.48,Math.abs(facing));
    c.save();c.globalAlpha*=alpha;c.translate(x,y);ellipse(0,2,43*s,7*s,'#0e1b252d');c.scale(s*faceX,s);c.translate(0,-bob);
    rigLegs(o,g,bob,'#737787','#808596','#29313e');
    const shirt=o.shirt||(apron?'#f2ddc4':coat?'#dfb6a5':child?'#d1ac7e':o.role==='extra'?'#b39ca6':'#94bcb5');
    c.save();c.translate(0,-66);c.rotate(o.painWeight*.14+o.tiredWeight*.025+g.sway+(o.lean||0));
    c.translate(0,-Math.sin(o.clock*1.65)*(.35+o.worryWeight*.15));
    c.save();c.rotate(Math.sin(o.clock*1.1)*.006+g.sway*.35);
    inkShape(()=>{c.moveTo(-45,-133);c.bezierCurveTo(-57,-116,-48,-44,-49,-20);c.quadraticCurveTo(-30,-9,-20,-27);c.quadraticCurveTo(2,-15,20,-26);c.quadraticCurveTo(36,-11,49,-23);c.bezierCurveTo(42,-58,55,-119,36,-138);},o.old?'#c1bdb2':'#34313e','#615c57',2);c.restore();
    inkShape(()=>{c.moveTo(-25,-65);c.quadraticCurveTo(-38,-55,-37,-31);c.lineTo(-32,5);c.quadraticCurveTo(0,14,33,5);c.lineTo(36,-34);c.quadraticCurveTo(35,-57,23,-65);},shirt);
    round(-8,-82,16,23,6,'#e4bca0');c.strokeStyle=apron?'#ccbaa0':'#b1cebd';c.lineWidth=3;c.beginPath();c.moveTo(-15,-61);c.quadraticCurveTo(0,-47,15,-61);c.stroke();
    if(apron){inkShape(()=>{c.moveTo(-20,-48);c.lineTo(21,-48);c.lineTo(29,5);c.quadraticCurveTo(0,12,-29,5);},'#587f7b');line([[-20,-47],[-16,-64]],'#587f7b',4);line([[20,-47],[15,-64]],'#587f7b',4);round(-13,-23,27,18,5,'#72958b');}
    c.save();c.translate(0,-116);c.rotate(o.headValue+g.sway*.3+Math.sin(o.clock*.7)*.005);
    chibiFace(0,0,{t:o.clock,tired:o.tiredWeight,sad:o.sadWeight,happy:o.happyWeight,worry:o.worryWeight,anger:o.angerWeight||0,surprise:o.face?.surprise||0,gaze:o.gazeValue,lookDown:o.lookDown||o.sadWeight*.6,seed:child?5:o.role==='mother'?8:1});
    chibiHair(0,0,{back,t:o.clock,tone:o.old?'#c1bdb2':o.hairTone||(o.role==='extra'?'#79685f':null)});if(o.old)ageFace();
    if(o.cry){const a=(o.clock%5)/5;c.save();c.globalAlpha=clamp(Number(o.cry))*Math.sin(a*Math.PI);ellipse(-28,15+a*21,2.2,4.4,'#b4d6da');c.restore();}c.restore();
    rigArms(o,shirt,'girl',g);
    if(coat){line([[-23,-57],[21,-7]],'#776354',4);round(7,-14,33,28,8,'#a88163');line([[13,-7],[32,-7]],'#cfb18b',2);ellipse(24,2,2,2,'#e8c58d');}
    c.restore();c.restore();
  }
  function man(x,y,s=1,raw={}){
    if(raw.role==='boy')s*=.92;
    const o=actorPerformance(raw,'man'),m=o.motion||{distance:0,speed:0,facing:1},g=motion.gait(m.distance,m.speed,s),bob=g.bob;
    const facing=o.facing===undefined?m.facing:o.facing,faceX=Math.sign(facing||1)*Math.max(.48,Math.abs(facing));
    const shirt=o.dark?'#7f969e':'#cbbd9c';
    c.save();c.translate(x,y);ellipse(0,2,43*s,7*s,'#0e1b252a');c.scale(s*faceX,s);c.translate(0,-bob);
    rigLegs(o,g,bob,'#69788a','#7c899c','#2c3341');
    c.save();c.translate(0,-66);c.rotate(g.sway+(o.lean||0)+o.tiredWeight*.025);c.translate(0,Math.sin(o.clock*1.45)*.35);c.translate(0,66);
    inkShape(()=>{c.moveTo(-25,-132);c.quadraticCurveTo(-38,-122,-37,-99);c.lineTo(-34,-61);c.quadraticCurveTo(0,-53,35,-61);c.lineTo(37,-100);c.quadraticCurveTo(36,-123,24,-132);},shirt);
    round(-8,-146,16,22,6,'#e4bca0');path([[-16,-130],[0,-119],[16,-130],[11,-111],[0,-119],[-10,-111]],'#e0d5bd');line([[0,-118],[0,-65]],'#a89d8b',1.5);for(let j=0;j<3;j++)ellipse(4,-105+j*15,1.5,1.5,'#8e897e');
    c.save();c.translate(0,-182);c.rotate(o.headValue+Math.sin(o.clock*.65)*.005);chibiFace(0,0,{t:o.clock,sad:o.sadWeight,tired:o.tiredWeight,happy:o.happyWeight,worry:o.worryWeight,gaze:o.gazeValue,surprise:o.face?.surprise||0,seed:o.stranger?17:2});chibiHair(0,0,{female:false,back:o.back,tone:o.old?'#c1bdb2':o.stranger?'#786556':null});if(o.old)ageFace();
    if(o.stranger){for(const ex of [-18,18]){c.strokeStyle='#394650';c.lineWidth=3;c.beginPath();c.roundRect(ex-12,-7,24,22,4);c.stroke();}line([[-6,1],[6,1]],'#394650',3);line([[-13,30],[0,35],[13,30]],'#8b7668',3);}c.restore();
    rigArms(o,shirt,'man',g);c.restore();c.restore();
  }
  function kid(x,y,s=1,t=0,blue=true,o={}){
    const m=o.motion||{distance:0,speed:0,facing:1},g=motion.gait(m.distance,m.speed,s*.75);
    c.save();c.translate(x,y);ellipse(0,1,27*s,4*s,'#17283128');c.scale(s*m.facing,s);c.translate(0,-g.bob*.6);
    for(let i=0;i<2;i++){const f=g.feet[i],fx=f.x*.7,fy=f.y*.6+g.bob*.6;rigLimb([i?10:-10,-41],[fx,fy-5],23,23,-1,'#4a5864',16);round(fx-12,fy-11,27,13,6,'#34404d');}
    const shirt=blue?'#96b4c3':'#d7b47f';round(-30,-100,60,64,17,shirt);
    const l=o.hands?.[0]||[-36-g.sway*90,-49],r=o.hands?.[1]||[36+g.sway*90,-49];
    rigLimb([-26,-87],l,25,25,1,shirt,14);rigLimb([26,-87],r,25,25,-1,shirt,14);ellipse(...l,6,6,'#f0c9aa');ellipse(...r,6,6,'#f0c9aa');
    line([[-11,-91],[11,-91]],blue?'#d8e4d9':'#f4deac',3);round(-12,-63,24,16,4,blue?'#7e9eaf':'#bd9b69');
    c.save();c.translate(0,-136);c.rotate(o.headTilt||Math.sin(performanceCue.world*.8)*.006);c.scale(.78,.78);chibiFace(0,0,{t,young:true,elder:o.sleep,tired:o.tired||0,happy:o.happy||0,sad:o.sad||0,gaze:o.gaze||0,seed:blue?5:6});chibiHair(0,0,{female:false});c.restore();c.restore();
  }
  function grandma(x,y,s=1,t=0){
    c.save();c.translate(x,y);c.scale(s,s);ellipse(0,2,48,7,'#0e1b252a');round(-33,-13,28,14,6,'#4e4b52');round(9,-13,28,14,6,'#4e4b52');
    inkShape(()=>{c.moveTo(-25,-115);c.quadraticCurveTo(-36,-102,-38,-67);c.lineTo(-44,-10);c.quadraticCurveTo(0,1,43,-10);c.lineTo(34,-70);c.quadraticCurveTo(32,-106,23,-115);},'#9b9392');
    path([[-24,-109],[0,-89],[22,-109],[16,-68],[-18,-68]],'#b8afa1');
    ellipse(-37,-181,19,20,'#a7aba1');chibiFace(0,-154,{t,elder:true});
    inkShape(()=>{c.moveTo(-46,-153);c.bezierCurveTo(-57,-214,48,-219,48,-154);c.lineTo(33,-169);c.quadraticCurveTo(9,-168,0,-186);c.quadraticCurveTo(-13,-164,-36,-166);c.lineTo(-40,-143);},'#c5c6b7','#818b87');
    line([[-31,-184],[-15,-193],[5,-194]],'#e1decd',3);
    c.strokeStyle='#77776f';c.lineWidth=1.5;for(const ex of [-18,18]){c.beginPath();c.ellipse(ex,-150,13,10,0,0,Math.PI*2);c.stroke();}line([[-5,-151],[5,-151]],'#77776f',1.5);
    line([[-28,-101],[-20,-75],[16,-68]],'#9b9392',17);line([[28,-102],[42,-80],[55,-80]],'#9b9392',17);ellipse(55,-80,8,6,'#e1ba9d');
    c.strokeStyle='#8c745c';c.lineWidth=5;c.beginPath();c.moveTo(47,-77);c.quadraticCurveTo(61,-94,65,-76);c.lineTo(65,-1);c.stroke();ellipse(65,0,6,3,'#4f5050');c.restore();
  }
  function chair(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);round(-40,-118,68,74,9,'#5e6663');line([[-33,-48],[-39,0]],'#80786b',5);line([[29,-48],[39,0]],'#80786b',5);rect(-42,-54,84,9,'#727971');c.restore();}
  function table(x,y,w=320,warm=false){rect(x,y,w,15,warm?'#af8d69':'#8b7a67');path([[x+5,y+15],[x+w-5,y+15],[x+w-15,y+27],[x+15,y+27]],warm?'#80644e':'#605d55');line([[x+24,y+24],[x+14,y+155]],warm?'#7a604b':'#5c5c55',10);line([[x+w-24,y+24],[x+w-14,y+155]],warm?'#7a604b':'#5c5c55',10);}
  function bowl(x,y){ellipse(x,y,25,8,'#c7ba9a');path([[x-25,y],[x+25,y],[x+15,y+19],[x-14,y+19]],'#b5b8a5');ellipse(x,y,21,5,'#e1c99d');}
  function mug(x,y,col='#c0b39c'){round(x-12,y-25,25,29,4,col);c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.ellipse(x+16,y-13,8,9,0,0,Math.PI*2);c.stroke();ellipse(x,y-24,11,3,'#574c43');}
  function windowFrame(x,y,w,h,t,warm=false){
    rect(x-12,y-12,w+24,h+24,warm?'#9e8c70':'#3b4b55');
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();sky(warm?'#7a8a8a':'#142d43',warm?'#deb889':'#647582');city(t,{warm,base:y+h+30,offset:Math.sin(t*.02)*25});if(!warm)rain(t,.55);c.restore();
    rect(x+w*.5-5,y,10,h,warm?'#a3947b':'#485963');rect(x,y+h*.58,w,5,warm?'#a3947b':'#485963');rect(x-17,y+h,w+34,15,warm?'#b6a283':'#62717b');
    const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#d6e6e008');g.addColorStop(.48,'#d6e6e01a');g.addColorStop(1,'#d6e6e000');rect(x,y,w,h,g);
  }
  function room(t,{warm=false,window=true}={}){
    sky(warm?'#c2aa88':'#253747',warm?'#a68c74':'#354653');
    rect(0,0,90,H,warm?'#ac957d':'#223341');
    floor(622,warm);if(window)windowFrame(175,100,750,420,t,warm);
    line([[0,623],[W,623]],warm?'#8a7864':'#1d2d37',5);
    picture(1130,145,122,92);plant(1430,565,1.35);lamp(1375,621,1.05,warm);
  }
  function envelope(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);rect(-36,-22,72,44,'#c6b594');line([[-36,-22],[0,5],[36,-22]],'#a89b81',1.2);c.restore();}
  function moon(x,y,r=25){glow(x,y,r*4,'#d9d6b612');ellipse(x,y,r,r,'#d8d7b9');ellipse(x+r*.4,y-r*.25,r*.85,r*.85,'#21384b');}
  function book(x,y,w=100,color='#a78c73'){path([[x,y],[x+w,y-4],[x+w,y+11],[x,y+15]],color);line([[x+4,y+7],[x+w-3,y+3]],'#ded1b8',5);}
  function slip(x,y,title,sub='',w=145){c.save();c.translate(x,y);c.rotate(-.05);rect(-w/2,-50,w,100,'#d1c7af');text(title,0,-18,12,'#6a6960','center');line([[-w/2+15,0],[w/2-15,0]],'#a8a48f',1);if(sub)text(sub,0,28,19,'#966d61','center');c.restore();}
  function familyPhoto(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);rect(-80,-65,160,130,'#a7977c');rect(-74,-59,148,118,'#d4c3a2');man(-35,45,.34);girl(28,46,.34);kid(-10,49,.27);kid(15,52,.22,0,false);c.restore();}
  function titleCard(label,sub,t){const a=ease(t/1.2)*(1-ease((t-8)/2));c.save();c.globalAlpha=a;text(label,85,674,22,'#e3d4ba','left','Georgia');if(sub)text(sub,87,700,11,'#b7b7ad');c.restore();}

  const P={ink:'#665953',cream:'#fff6e5',rose:'#e7a49b',mint:'#9dbcb0',blue:'#a9c5d0',gold:'#edc983'};
  function ageFace(){for(const side of [-1,1]){line([[side*29,12],[side*36,15]],'#be9786',1);line([[side*29,18],[side*35,21]],'#be9786',1);}for(const ex of [-18,18]){c.strokeStyle='#8f857a';c.lineWidth=1.5;c.beginPath();c.ellipse(ex,3,13,12,0,0,Math.PI*2);c.stroke();}line([[-5,3],[5,3]],'#8f857a',1.5);}
  function heart(x,y,s=1,col=P.rose){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col;c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-25,-8,-12,-24,0,-12);c.bezierCurveTo(12,-24,25,-8,0,8);c.fill();c.restore();}
  function blossom(x,y,s=1,col='#f3bdaf'){c.save();c.translate(x,y);c.scale(s,s);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*8,Math.sin(a)*8,7,9,col,a);}ellipse(0,0,5,5,'#f0cf83');c.restore();}
  function petals(t,n=18,col='#f3c5bc'){for(let i=0;i<n;i++){const x=(hash(i+40)*1700+t*(9+hash(i)*13))%1750-75,y=(hash(i+75)*1100+t*(8+hash(i+7)*16))%1100-100;ellipse(x,y,5,9,col,Math.sin(t+i)*1.8);}}
  function bouquet(x,y,s=1,tilt=0){c.save();c.translate(x,y);c.rotate(tilt);c.scale(s,s);path([[-48,-78],[42,-80],[19,12],[-7,17]],'#f6e6cd','#d5bda5');for(let i=0;i<7;i++){const dx=(i%3-1)*25,dy=-65-Math.floor(i/3)*22;line([[8,10],[dx,dy]],'#86a88a',3);ellipse(dx-8,dy+15,7,17,'#a5bd92',-.5);blossom(dx,dy,.9,i%2?P.rose:'#f5d2b1');}path([[-38,-39],[8,-9],[36,-43],[16,22],[-3,24]],'#eed5bb');line([[-6,9],[21,9]],P.rose,7);c.restore();}
  function cake(x,y,s=1,half=false){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,8,65,14,'#d5d6bf');ellipse(0,5,59,10,'#fff7df');path([[-39,-36],[36,-43],[40,1],[-39,6]],'#e3b28c');path([[-39,-26],[38,-32],[38,-21],[-39,-16]],'#fff1d5');path([[-39,-38],[8,-61],[37,-44],[-39,-30]],'#fff3df');if(!half){ellipse(7,-55,13,17,'#d8817c',-.25);path([[-3,-69],[6,-62],[16,-70],[11,-58],[3,-58]],'#92a783');}else line([[0,-44],[0,3]],'#b8947e',2);c.restore();}
  function sweet(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);path([[-21,-64],[24,-64],[18,0],[-15,0]],'#ead1af','#bd9e87',2);rect(-17,-36,36,25,'#efd3c4');ellipse(2,-64,23,7,'#fff4df');line([[10,-63],[21,-101]],P.rose,5);for(let i=0;i<5;i++)ellipse(-10+i*5,-12,3,3,'#9d7f69');c.restore();}
  function keyring(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#beaa80';c.lineWidth=2;c.beginPath();c.arc(0,0,9,0,7);c.stroke();line([[0,9],[0,22]],'#beaa80',2);blossom(0,30,.8);c.restore();}
  function avatar(x,y,boy=false,s=1){ellipse(x,y,22*s,22*s,boy?'#d7e6de':'#f4d3c2');c.save();c.translate(x,y+5*s);c.scale(.31*s,.31*s);chibiFace(0,0,{happy:.6,seed:boy?2:1});chibiHair(0,0,{female:!boy});c.restore();}
  function windowDay(x=170,y=105,w=540,h=325,night=false){round(x-12,y-12,w+24,h+24,55,'#e4cfb0');round(x,y,w,h,45,night?'#778c9e':'#dce9dd');c.save();c.beginPath();c.roundRect(x,y,w,h,45);c.clip();if(night){for(let i=0;i<18;i++)ellipse(x+hash(i+8)*w,y+hash(i+29)*h,2,2,'#fff0c7');ellipse(x+w*.74,y+75,28,28,'#f5deb0');}else{ellipse(x+430,y+65,47,47,'#f3d6a1');for(let i=0;i<4;i++)ellipse(x+60+i*160,y+90+(i%2)*60,85,22,'#f5f3df');}for(let i=0;i<7;i++){const xx=x+i*95;round(xx,y+h-90-hash(i)*80,80,210,7,['#bbcec0','#d4d8be','#c6d7ca'][i%3]);for(let j=0;j<3;j++)rect(xx+13+j*20,y+h-55,8,17,'#eff1db');}c.restore();rect(x+w/2-4,y,8,h,'#e4cfb0');rect(x,y+h*.57,w,7,'#e4cfb0');round(x-20,y+h-2,w+40,14,5,'#d8be9b');}
  function interior(t,{night=false,boy=false}={}){sky(night?'#dcd9d5':'#fbefdc',night?'#f1e3cf':'#f7e9d5');rect(0,680,W,220,'#e7d5bb');line([[0,680],[1600,680]],'#d5bfa0',6);for(let i=0;i<7;i++)line([[0,720+i*43],[W,720+i*43]],'#ddc8ab',1);windowDay(130,95,570,340,night);round(930,180,430,15,5,'#ccaf8d');plant(1290,180,.58);for(let i=0;i<5;i++)round(980+i*29,120,21,60,3,['#a9b9ac','#dcaea0','#d1c49c'][i%3]);round(960,325,290,135,24,boy?'#b5c7bd':'#dfbbab');round(940,436,330,135,24,boy?'#a8beb2':'#d7b1a1');rect(965,560,18,70,'#b1987c');rect(1230,560,18,70,'#b1987c');plant(1460,675,1.1);ellipse(770,789,450,73,'#e4c7b0');}
  function garden(t,season=0){const colors=[['#e6efe0','#c9dcb7','#f0c1b6'],['#e3eee2','#b5d0a0','#f1d6a0'],['#f6e7d1','#d5bc8f','#d99d75'],['#e5ece8','#ccd9ca','#f6eee1']][Math.floor(season)%4];sky(colors[0],'#fff2dd');ellipse(1230,170,76,76,'#f5dcad');for(let i=0;i<6;i++)round(80+i*290,360-hash(i)*120,190,370,25,'#d6dfcd');rect(0,625,W,275,colors[1]);path([[0,770],[1600,655],[1600,900],[0,900]],'#ead7b6');for(let side=0;side<2;side++){const x=side?1480:155;line([[x,650],[x-20,165]],'#b7a182',35);for(let j=0;j<5;j++)ellipse(x-170+j*80,200+(j%2)*65,125,110,colors[2]);}for(let i=0;i<28;i++){const x=hash(i+41)*W,y=660+hash(i+9)*80;blossom(x,y,.35,colors[2]);}petals(t,15,colors[2]);}
  function bench(x=800,y=800){for(let i=0;i<3;i++)round(x-270,y-162+i*35,540,24,8,'#c7a986');round(x-288,y-57,576,27,9,'#b49a7a');for(const dx of [-238,238]){line([[x+dx,y-46],[x+dx+8,y+24]],'#8e9b89',12);line([[x+dx,y-160],[x+dx,y-45]],'#8e9b89',9);}}
  function cafe(t){interior(t);round(90,100,450,65,20,'#e8d9bb');text('little days',315,146,35,'#a68b72','center','Georgia');for(let i=0;i<3;i++)blossom(230+i*85,264,1.4);windowDay(870,100,470,360);table(500,665,600,true);chair(570,830,1.35);chair(1030,830,1.35);}
  function liveScreen(x,y,w=305,h=540,t=0,mode='live'){c.save();round(x-10,y-10,w+20,h+20,32,'#827b75');round(x,y,w,h,25,'#f8edda');c.beginPath();c.roundRect(x,y,w,h,25);c.clip();rect(x,y,w,h*.65,'#dbdfcc');ellipse(x+w*.5,y+170,w*.39,120,'#ead3b4');c.save();c.translate(x+w*.5,y+300);c.scale(.8,.8);chibiFace(0,-65,{happy:.7,seed:7});chibiHair(0,-65,{female:true,tone:'#806254'});round(-35,-25,70,90,20,'#d8a99a');line([[-30,0],[-68,-35]],'#d8a99a',18);line([[30,0],[68,-35]],'#d8a99a',18);c.restore();round(x+15,y+15,45,23,7,'#d88f8c');text('LIVE',x+37,y+32,12,'#fff8e5','center');text('một buổi tối dịu dàng',x+71,y+32,12,P.ink);rect(x,y+h*.65,w,h*.35,'#f4e5d0');const comments=[['mây nhỏ','chiếc bánh dễ thương quá ♡'],['cậu bàn bên','để dành một miếng nha'],['mây nhỏ','ai nhanh tay thì có thôi :))']];for(let i=0;i<3;i++){const yy=y+h*.69+i*48;avatar(x+29,yy+10,i===1,.65);text(comments[i][0],x+51,yy+7,11,i===1?'#7d9c8a':'#b7887c');text(comments[i][1],x+51,yy+25,11,P.ink);}if(mode==='saved'){rect(x,y,w,h,'#fff2d455');heart(x+w-38,y+h-35,.8);}for(let i=0;i<6;i++)heart(x+w-28+Math.sin(i)*7,y+h*.65-((t*35+i*43)%180),.35,P.rose);c.restore();}
  function chatPanel(t){round(580,130,440,570,30,'#f5ead6');avatar(628,176,true,.85);text('cậu bàn bên',664,184,20,P.ink);line([[601,210],[998,210]],'#dfd4bd',2);const rows=[['Cũng chơi game à?',false],['Có. Nhưng đừng chê tui nha.',true],['Vậy mình cùng một đội.',false],['Mai lại chơi nhé?',true]];for(let i=0;i<4;i++){const a=ease((t-i*1.5)/.6);if(!a)continue;c.save();c.globalAlpha=a;round(i%2?668:610,245+i*82,310,58,18,i%2?'#d7e4d5':'#ecdbc5');text(rows[i][0],i%2?689:631,280+i*82,17,P.ink);c.restore();}heart(800,655,.8);}
  function monitor(x,y,t=0,game=false){round(x,y,260,170,14,'#8f9c97');round(x+10,y+10,240,143,8,game?'#a2bcad':'#e9e6cd');rect(x+116,y+170,27,34,'#8f9c97');round(x+78,y+200,105,10,4,'#9eaaa1');if(game){for(let i=0;i<6;i++){ellipse(x+35+i*37,y+75+Math.sin(i+t)*20,12,14,['#f0c8ac','#d8d5a1','#c8acba'][i%3]);}path([[x+23,y+120],[x+103,y+30],[x+222,y+120]],null,'#e6e5c0',3);}else{for(let i=0;i<6;i++)round(x+25+(i%2)*13,y+28+i*17,70+hash(i)*90,5,2,['#c6a68e','#a1b4a3','#c1b39a'][i%3]);}}
  function controller(x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);round(-35,-15,70,36,13,'#a9b7a3');line([[-21,-4],[-21,9]],P.cream,4);line([[-27,2],[-15,2]],P.cream,4);ellipse(20,-1,4,4,P.rose);ellipse(11,8,4,4,P.gold);c.restore();}
  function her(x,y,s=1.65,o={}){girl(x,y,s,{role:'lead',...o});}
  function him(x,y,s=1.65,o={}){man(x,y,s,{role:'boy',...o});}
  function homePair(t,mode='film',old=false){interior(t,{night:true});round(485,438,640,170,45,'#c2cdb5');round(463,560,690,123,34,'#b2bea5');for(const x of [505,1095])rect(x,675,15,85,'#a88d70');her(655,771,1.6,{sit:true,old,face:{happy:.55},gaze:2,headTilt:.05,hands:[[-26,-20],[25,-20]]});him(925,771,1.6,{sit:true,old,face:{happy:.6},gaze:-2,headTilt:-.06,hands:[[-25,-20],[26,-20]]});table(530,752,560,true);if(mode==='game'){controller(622,659);controller(923,667);}else{cake(710,737,.65);mug(893,746,P.rose);}round(120,365,270,180,15,'#9ea99b');round(131,377,248,153,9,mode==='anime'?'#c4d8d8':'#e9d2b6');if(mode==='anime'){ellipse(250,442,34,40,'#f4d4ae');path([[210,415],[230,370],[249,398],[270,369],[290,415]],'#707f98');}else{heart(251,450,1.6);ellipse(200,465,19,26,'#c7b5a2');ellipse(300,465,19,26,'#aabda6');}rect(242,548,20,70,'#a4ab98');}
  function twoRooms(t,game=false){interior(t,{night:true});rect(797,0,6,H,'#d2bda2');c.save();c.beginPath();c.rect(803,0,797,H);c.clip();interior(t,{night:true,boy:true});c.restore();her(455,805,1.65,{sit:true,withPhone:game?0:1,gaze:1,face:{happy:.4},hands:game?[[-35,-26],[32,-26]]:undefined});him(1150,805,1.65,{sit:true,withPhone:game?0:1,gaze:-1,face:{happy:.4},hands:game?[[-35,-26],[32,-26]]:undefined});if(game){table(210,715,410,true);table(960,715,410,true);monitor(226,498,t,true);monitor(1108,498,t,true);}for(let i=0;i<3;i++)heart(800+Math.sin(t+i)*25,330-i*60,.4+i*.12);}
  function walkPair(t,{rainy=false}={}){garden(t);const a=motion.travel(450,1020,t,0,9),b=motion.travel(655,1225,t,0,9);her(a.x,814,1.65,{motion:a,face:{happy:.65},gaze:2});him(b.x,817,1.65,{motion:b,face:{happy:.65},gaze:-2,hands:rainy?[[-37,0],[-9,-107]]:undefined});keyring(b.x+58,729,1);if(rainy){c.save();c.translate((a.x+b.x)/2,335);path([[-210,65],[-185,15],[-125,-35],[-55,-58],[20,-65],[100,-45],[172,1],[205,65]],'#a9bfbd','#829e9c',3);line([[0,-65],[0,316]],'#8b8d80',7);line([[-210,65],[205,65]],'#829e9c',3);c.restore();rain(t,.3,true);}}

  const scenes={
    herEvening(t){interior(t,{night:true});her(1090,819,1.8,{sit:true,withPhone:1,face:{happy:.25},headTilt:.08});table(800,728,210,true);cake(906,710,.6);sweet(837,726,.65);keyring(1190,710);},
    hisEvening(t){interior(t,{night:true,boy:true});him(1080,824,1.85,{sit:true,withPhone:ease((t-1)/2),face:{tired:.25,happy:ease((t-2)/3)*.3},gaze:-2});table(250,696,460,true);monitor(320,480,t);bowl(636,690);},
    sameLive(t){interior(t,{night:true});her(330,825,1.7,{sit:true,withPhone:1,face:{happy:.5}});him(1270,825,1.7,{sit:true,withPhone:1,face:{happy:.4}});liveScreen(647,126,305,540,t);},
    firstReply(t){sky('#f6e8d5','#f8eddc');liveScreen(625,90,350,625,t);avatar(440,430,false,2);avatar(1160,430,true,2);const p=ease((t-1)/3);c.save();c.globalAlpha=p;line([[490,435],[580,435]],'#d8ba9b',3);line([[1020,435],[1110,435]],'#d8ba9b',3);heart(800,785,p);c.restore();},
    familiarAvatars(t){twoRooms(t);for(let i=0;i<4;i++){const a=ease((t-i*1.3)/.5);c.save();c.globalAlpha=a;round(608+i*18,135+i*46,280,42,16,i%2?'#dce6d8':'#f1dbc5');avatar(634+i*18,156+i*46,i%2,.65);text(i%2?'cậu bàn bên lại đến':'mây nhỏ đang xem',658+i*18,162+i*46,15,P.ink);c.restore();}},
    waitForHim(t){interior(t,{night:true});her(1070,821,1.85,{sit:true,withPhone:1,face:{worry:1-ease((t-3)/2),happy:ease((t-3)/2)*.7},headTilt:mix(-.1,.08,ease((t-3)/2))});liveScreen(275,103,310,555,t);if(t>3){avatar(667,511,true,1.1);heart(1110,390,ease((t-3)/1));}},
    followBack(t){sky('#eee8d7','#fbf0dc');avatar(560,390,false,3);avatar(1040,390,true,3);const p=ease((t-1)/2);line([[650,390],[950,390]],'#b9c9af',4);heart(800,390,p*1.5);round(650,535,300,55,22,'#d4e3cc');text(p>.5?'đang theo dõi nhau ♡':'theo dõi',800,570,24,P.ink,'center');},
    firstChat(t){twoRooms(t);chatPanel(t);},
    sameGame(t){twoRooms(t,true);const p=ease((t-4)/1);c.save();c.globalAlpha=p;round(650,130,300,75,22,'#f4e6c8');text('CÙNG MỘT ĐỘI',800,175,25,P.ink,'center');c.restore();},
    notification(t){interior(t,{night:true,boy:true});him(1120,820,1.85,{sit:true,withPhone:ease((t-1)/1.3),face:{tired:.3*(1-ease(t/3)),happy:ease(t/3)*.8},headTilt:-.08});table(235,701,440,true);monitor(280,487,t);const p=ease((t-1)/1);c.save();c.globalAlpha=p;round(548,260,370,90,25,'#f5e4cd');avatar(592,306,false);text('mây nhỏ',628,299,15,'#aa8a7b');text('Hôm nay cậu ăn cơm chưa?',628,325,18,P.ink);c.restore();},
    saveASeat(t){cafe(t);her(569,818,1.7,{sit:true,withPhone:1,face:{happy:.6},gaze:2});sweet(660,655,.8);sweet(938,655,.8);c.save();c.globalAlpha=ease((t-2)/2)*.25;him(1030,818,1.7,{sit:true,face:{happy:.7}});c.restore();heart(1030,392,.65);},
    herOutfit(t){interior(t);round(170,120,420,600,180,'#d9c5a7');round(185,135,390,570,170,'#e5e8d8');her(379,726,1.7,{coat:t>3,face:{worry:.4,happy:.3},headTilt:Math.sin(t)*.06,hands:[[-34,0],[25,-62]]});her(1050,825,1.85,{coat:t>3,face:{worry:.6,happy:.2},headTilt:-Math.sin(t)*.06,hands:[[-34,0],[25,-62]]});keyring(1130,721,1.25);blossom(1100,462,.7);},
    hisOutfit(t){interior(t,{boy:true});him(1040,819,1.85,{face:{worry:.5,happy:.3},headTilt:-.09,hands:[[-30,0],[32,-75]]});bouquet(1100,715,1.05,.2);round(260,160,310,450,130,'#d9c5a7');round(275,175,280,420,120,'#e3e8d7');him(414,670,1.45,{face:{worry:.3},headTilt:.1});keyring(1110,781);},
    meetingWalk(t){garden(t);const a=motion.travel(80,640,t,.4,6.5),b=motion.travel(1500,1040,t,1.2,6);her(a.x,817,1.7,{motion:a,coat:true,face:{worry:.7},gaze:3,withPhone:.7});him(b.x,817,1.7,{motion:b,face:{worry:.7},gaze:-3});keyring(b.x-48,755,1.15);},
    recognition(t){garden(t);const p=ease((t-1)/2);her(640,817,1.8,{coat:true,face:{surprise:1-p,happy:p*.7},gaze:3,headTilt:.05*p});him(1040,817,1.8,{face:{worry:1-p,happy:p*.7},gaze:-3,headTilt:-.06*p});keyring(984,720,1.8);c.save();c.globalAlpha=p;heart(840,435,.8);c.restore();},
    flowerTangle(t){garden(t);const pull=curve([[0,0],[2,.3],[3,.1],[4,.7],[5,.5],[6,1],[10,1]]);him(1050,820,1.8,{face:{worry:1-ease((t-5)/2),happy:ease((t-5)/2)*.8},gaze:-3,hands:[[-24,-28],[mix(38,-35,pull),mix(0,-45,pull)]]});her(670,820,1.8,{coat:true,face:{surprise:.25,happy:ease((t-3)/2)},gaze:3,headTilt:.08,hands:[[-30,0],[45,-30]]});bouquet(mix(1150,875,pull),mix(735,610,pull),1.2,mix(.4,-.2,pull));keyring(1136,746,1.2);},
    firstDate(t){cafe(t);her(570,820,1.7,{sit:true,coat:true,face:{happy:.8},gaze:3,headTilt:.09});him(1030,820,1.7,{sit:true,face:{happy:.7},gaze:-3,headTilt:-.09});sweet(640,655,.8);sweet(957,655,.8);cake(800,647,.7);bouquet(1180,700,.8,.4);heart(800,400,.7+Math.sin(t)*.08);},
    sharedWalk(t){walkPair(t);},
    umbrella(t){walkPair(t,{rainy:true});},
    kdrama(t){homePair(t);her(655,771,1.6,{sit:true,cry:.45,face:{sad:.45,happy:.25},headTilt:.08,hands:[[-26,-20],[25,-20]]});him(925,771,1.6,{sit:true,face:{happy:.8},gaze:-3,hands:[[-50,-33],[26,-20]]});round(813,640,37,25,4,'#fff3de');},
    anime(t){homePair(t,'anime');const p=ease((t-2)/3);heart(800,355,p*.8);},
    pinkNail(t){interior(t);const p=ease((t-1)/4);her(650,820,1.85,{face:{happy:.9},gaze:3,hands:[[-30,-1],[mix(20,70,p),-28]]});him(1010,820,1.85,{face:{surprise:p*.3,happy:.8},gaze:-3,hands:[[mix(-32,-64,p),-25],[33,0]]});ellipse(920,665,8,5,P.rose);table(675,754,240,true);round(778,710,24,40,7,P.rose);rect(783,690,14,22,'#958d80');blossom(1130,340,.8);},
    herSadDay(t){interior(t);const p=ease((t-3)/3);her(650,820,1.8,{sit:true,face:{sad:.8*(1-p),happy:p*.7},headTilt:mix(-.1,.04,p),gaze:mix(0,3,p)});const b=motion.travel(1500,1000,t,0,5);him(b.x,820,1.8,{motion:b,face:{worry:.35,happy:.5},gaze:-3,hands:[[-37,-17],[30,-35]]});cake(b.x-58,650,.7);table(740,740,230,true);},
    hisLongDay(t){interior(t,{night:true,boy:true});him(1040,820,1.8,{sit:true,face:{tired:.7,happy:ease((t-3)/3)*.5},gaze:-2,headTilt:.08});table(920,711,440,true);monitor(1110,498,t);const a=motion.travel(80,740,t,.6,4.5);her(a.x,820,1.8,{motion:a,face:{happy:.6,worry:.2},gaze:3,hands:[[-31,-18],[30,-36]]});bowl(a.x+44,654);},
    homeCooking(t){interior(t);round(180,420,600,260,15,'#c4d1b8');rect(160,420,640,20,'#ddbd98');for(let i=0;i<3;i++)round(205+i*185,460,155,170,10,'#d6dfc6');her(905,820,1.8,{apron:true,face:{happy:.8},gaze:3,hands:[[-30,-25],[55,-30]]});him(1190,820,1.8,{face:{happy:.8},gaze:-3,hands:[[-50,-30],[28,-18]]});table(800,735,500,true);bowl(978,728);bowl(1170,728);for(let i=0;i<3;i++){const y=680-((t*20+i*22)%65);c.save();c.globalAlpha=.2;line([[1050,y+18],[1042,y],[1050,y-15]],'#fff6df',5);c.restore();}},
    tinyArgument(t){twoRooms(t,true);const a=ease((t-1)/2);her(455,805,1.65,{sit:true,face:{anger:a*.8},gaze:2,headTilt:-.08,hands:[[-35,-26],[32,-26]]});him(1150,805,1.65,{sit:true,face:{worry:.6},gaze:-3,headTilt:.07,hands:[[-35,-26],[32,-26]]});round(650,157,300,55,18,'#e8d8c4');text('thua một ván...',800,191,25,P.ink,'center');},
    makePeace(t){interior(t,{night:true});const b=motion.travel(1420,1000,t,0,4);her(650,820,1.8,{sit:true,face:{anger:.7*(1-ease((t-3)/2)),happy:ease((t-3)/2)*.8},gaze:2,hands:[[-33,0],[40,-24]]});him(b.x,820,1.8,{motion:b,face:{happy:.7},gaze:-3,hands:[[-42,-22],[29,0]]});sweet(b.x-72,655,.8);table(740,742,230,true);heart(820,427,ease((t-4)/2)*.9);},
    benchFirst(t){garden(t);bench();her(655,813,1.65,{sit:true,face:{happy:.8},gaze:3,headTilt:.08});him(935,813,1.65,{sit:true,face:{happy:.8},gaze:-3,headTilt:-.08});bouquet(1080,780,.7,.7);},
    seasons(t){garden(t,Math.floor(t/2.5));bench();her(655,813,1.65,{sit:true,coat:t>5,face:{happy:.8},gaze:3,headTilt:.08});him(935,813,1.65,{sit:true,face:{happy:.8},gaze:-3,headTilt:-.08});if(t>7.5){for(let i=0;i<30;i++)ellipse((hash(i)*W+t*9)%W,(hash(i+3)*H+t*18)%H,4,4,'#fff9e8');}},
    ordinaryYears(t){homePair(t,t<4?'game':'film');round(1280,310,130,170,10,'#f4e6ca');text('những ngày',1345,354,18,P.ink,'center');text('bình thường',1345,383,18,P.ink,'center');heart(1345,433,1);},
    silverHair(t){garden(t,1);bench();const old=t>3;her(655,813,1.65,{sit:true,old,face:{happy:.8},gaze:3,headTilt:.08});him(935,813,1.65,{sit:true,old,face:{happy:.8},gaze:-3,headTilt:-.08});if(t>3){sweet(542,766,.55);cake(1071,766,.5);}petals(t,12);},
    oldGame(t){homePair(t,'game',true);her(655,771,1.6,{sit:true,old:true,face:{anger:.5,happy:.3},gaze:-2,headTilt:-.08,hands:[[-26,-20],[25,-20]]});controller(657,650);him(925,771,1.6,{sit:true,old:true,face:{happy:.9},gaze:-3,headTilt:-.09});},
    oldCake(t){homePair(t,'film',true);const p=ease((t-1)/4);cake(800,737,.8,true);line([[800,698],[800,737]],'#b4957f',2);her(655,771,1.6,{sit:true,old:true,face:{happy:.85},gaze:3,hands:[[-26,-20],[mix(25,70,p),-19]]});him(925,771,1.6,{sit:true,old:true,face:{happy:.85},gaze:-3,hands:[[mix(-25,-70,p),-19],[26,-20]]});heart(800,382,.85);},
    liveMemory(t){sky('#eee8d7','#f9efda');liveScreen(615,93,370,655,t,'saved');round(632,102,335,33,10,'#f7ecd6');text('buổi tối đầu tiên · đã lưu',800,125,17,P.ink,'center');avatar(471,470,false,2);avatar(1130,470,true,2);heart(800,800,1);},
    promise(t){garden(t,1);bench(1125,815);her(1000,826,1.7,{sit:true,old:true,face:{happy:.85},gaze:3,headTilt:.12});him(1240,826,1.7,{sit:true,old:true,face:{happy:.85},gaze:-3,headTilt:-.12});bouquet(1420,800,.75,.7);heart(1120,430,.9+Math.sin(t)*.06);}
  };

  const shots=window.LOVE_TIMELINE.shots;
  function drawShot(shot,time,alpha=1){const [start,end,name,from,to]=shot;const local=clamp(time-start,0,end-start),p=ease(local/(end-start));performanceCue={name,time:local,world:time};c.save();c.globalAlpha=alpha;const zoom=mix(from[2],to[2],p),cx=mix(from[0],to[0],p),cy=mix(from[1],to[1],p);c.translate(W/2,H/2);c.scale(zoom,zoom);c.translate(-cx,-cy);scenes[name](local);c.restore();}
  function drawFilm(time,poster=false){c.setTransform(1,0,0,1,0,0);rect(0,0,W,H,'#f9f0dc');if(poster){performanceCue={name:'poster',time:0,world:time};garden(time,0);bench(1190,815);her(1060,825,1.8,{sit:true,face:{happy:.8},gaze:3,headTilt:.1});him(1320,825,1.8,{sit:true,face:{happy:.8},gaze:-3,headTilt:-.1});bouquet(1460,795,.85,.5);heart(1190,400,.8);const g=c.createLinearGradient(0,0,1000,0);g.addColorStop(0,'#fcf2df');g.addColorStop(.6,'#fcf2dff5');g.addColorStop(1,'#fcf2df00');rect(0,0,1100,H,g);return;}const i=shots.findIndex(s=>time>=s[0]&&time<s[1]),index=i<0?shots.length-1:i,shot=shots[index];drawShot(shot,time);const overlap=.55;if(index>0&&time-shot[0]<overlap){drawShot(shots[index-1],shots[index-1][1]-.001,1-ease((time-shot[0])/overlap));}const g=c.createRadialGradient(800,420,250,800,420,1000);g.addColorStop(0,'#fff8e800');g.addColorStop(1,'#b18b6220');rect(0,0,W,H,g);}

  // Canvas is the drawing surface; WebGL projects and gently grades its texture.
  let gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true}),fallback=null,program,texture;
  if(gl){try{const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 v;void main(){v=vec2((a.x+1.)*.5,(1.-a.y)*.5);gl_Position=vec4(a,0.,1.);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 v;uniform sampler2D u;void main(){vec3 col=texture2D(u,v).rgb;gl_FragColor=vec4(mix(col,vec3(1.,.96,.88),.018),1.);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);}catch(error){console.warn('WebGL unavailable:',error);gl=null;}}
  if(!gl){const replacement=document.createElement('canvas');replacement.id='film';replacement.setAttribute('aria-label',canvas.getAttribute('aria-label'));canvas.replaceWith(replacement);fallback=replacement.getContext('2d',{alpha:false});}
  const surface=gl?canvas:fallback.canvas;
  function present(){const dpr=Math.min(window.devicePixelRatio||1,1.5),width=Math.max(320,Math.round(surface.clientWidth*dpr)),height=Math.round(width*H/W);if(surface.width!==width||surface.height!==height){surface.width=width;surface.height=height;}if(gl){gl.viewport(0,0,width,height);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,paper);gl.drawArrays(gl.TRIANGLES,0,6);}else fallback.drawImage(paper,0,0,width,height);}

  const sound=new LoveSoundtrack(),$=s=>document.querySelector(s);
  let position=0,playing=false,started=false,finished=false,pending=0,lastRender=-1,lastPoster=-1;
  const stamp=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  function ui(){const d=sound.duration;$('#progress').max=d;$('#progress').value=position*d;$('#time').textContent=stamp(position*d);$('#total').textContent=stamp(d);$('#toggle').textContent=playing?'Ⅱ':'▶';$('#toggle').setAttribute('aria-label',playing?'Tạm dừng phim':'Phát phim');$('#intro').classList.toggle('hidden',started);$('#end').classList.toggle('hidden',!finished);$('#paused').classList.toggle('hidden',!started||playing||finished);const chapter=window.LOVE_TIMELINE.chapters.filter(k=>k[1]<=position*DURATION).at(-1);$('#chapter-name').textContent=chapter[0];document.querySelectorAll('#chapters button').forEach(b=>b.classList.toggle('active',b.dataset.at===String(chapter[1])));}
  function finish(){playing=false;position=1;finished=true;sound.pause();ui();}
  sound.onState=state=>{if(state==='playing'){started=true;finished=false;playing=true;}else if(state==='paused'){if(playing)position=clamp(sound.time()/sound.duration);playing=false;}else if(state==='ended'){finish();return;}ui();};
  sound.onChange=ui;
  async function play(){const request=++pending;if(position>.998)position=0;finished=false;$('#begin').textContent='Đang mở nhạc…';try{if(sound.kind==='youtube')await sound.youtube();if(request!==pending)return;const ok=await sound.play(position*sound.duration);if(!ok)playing=false;}catch(error){sound.status(error.message);playing=false;}finally{if(request===pending){$('#begin').textContent='▶ Xem MV cùng nhạc ♡';ui();}}}
  function pause(){++pending;if(playing)position=clamp(sound.time()/sound.duration);playing=false;sound.pause();ui();}
  function seek(ratio){const wasPlaying=playing;position=clamp(ratio);finished=false;started=true;sound.seek(position*sound.duration);if(!wasPlaying)sound.pause();ui();lastRender=-1;}
  $('#begin').addEventListener('click',play);$('#silent').addEventListener('click',()=>{++pending;pause();sound.silent();position=0;play();});$('#toggle').addEventListener('click',()=>playing?pause():play());$('#replay').addEventListener('click',()=>{position=0;play();});$('#progress').addEventListener('input',e=>seek(Number(e.target.value)/sound.duration));
  $('#sound').addEventListener('click',()=>{sound.mute();$('#sound').textContent=sound.muted?'♩':'♪';$('#sound').setAttribute('aria-pressed',String(sound.muted));$('#sound').setAttribute('aria-label',sound.muted?'Bật âm thanh':'Tắt âm thanh');});
  $('#youtube-source').addEventListener('click',()=>{pause();sound.selectYouTube();play();});
  $('#audio-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;pause();try{await sound.file(file);position=0;play();}catch(error){sound.status(error.message);ui();}});
  $('#chapters-toggle').addEventListener('click',()=>{const open=$('#chapters').classList.toggle('hidden')===false;$('#chapters-toggle').setAttribute('aria-expanded',String(open));});
  for(const [label,at]of window.LOVE_TIMELINE.chapters){const b=document.createElement('button');b.dataset.at=at;b.textContent=label;b.addEventListener('click',()=>seek(at/DURATION));$('#chapters').append(b);}
  $('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#cinema').requestFullscreen();}catch{sound.status('Trình duyệt này không hỗ trợ toàn màn hình.');}});
  window.addEventListener('keydown',e=>{if(/INPUT|BUTTON|TEXTAREA/.test(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();playing?pause():play();}if(e.code==='ArrowRight'){e.preventDefault();seek(position+5/sound.duration);}if(e.code==='ArrowLeft'){e.preventDefault();seek(position-5/sound.duration);}});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();sound.status('Khung hình tạm mất kết nối đồ họa. Tải lại trang để tiếp tục.');});
  window.addEventListener('pagehide',()=>sound.destroy());
  const query=new URLSearchParams(location.search),preview=Number(query.get('t'));if(query.has('t')&&Number.isFinite(preview)){position=clamp(preview/DURATION);started=true;}
  function frame(now){if(playing){position=clamp(sound.time()/sound.duration);if(position>=1)finish();ui();}const time=position*DURATION,poster=!started;const posterTick=Math.floor(now/80);if(lastRender!==time||poster&&lastPoster!==posterTick){drawFilm(poster?now/1000:time,poster);present();lastRender=time;lastPoster=posterTick;}requestAnimationFrame(frame);}
  window.addEventListener('resize',()=>{lastRender=-1;});ui();requestAnimationFrame(frame);
})();



