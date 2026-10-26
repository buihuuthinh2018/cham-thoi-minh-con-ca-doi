/* Pure animation curves. Root travel and feet share distance, not an unrelated clock. */
(() => {
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
  const mix=(a,b,p)=>Array.isArray(a)?a.map((v,i)=>mix(v,b[i],p)):a+(b-a)*p;
  function track(t,keys){
    if(t<=keys[0][0])return keys[0][1];
    for(let i=1;i<keys.length;i++)if(t<=keys[i][0])return mix(keys[i-1][1],keys[i][1],smooth((t-keys[i-1][0])/(keys[i][0]-keys[i-1][0])));
    return keys.at(-1)[1];
  }
  function travel(from,to,t,start=0,duration=4){
    const u=clamp((t-start)/duration),p=smooth(u),v=(to-from)*30*u*u*(1-u)*(1-u)/duration||0;
    return {x:mix(from,to,p),distance:(to-from)*p,speed:v,facing:to>=from?1:-1};
  }
  function gait(distance,speed,scale=1){
    const cycle=64,phase=Math.abs(distance)/(cycle*scale),weight=smooth(Math.abs(speed)/(22*scale));
    const feet=[0,.5].map((offset,i)=>{
      const p=(phase+offset)%1,contact=p<.62;
      let x,y;
      if(contact){x=cycle*.31-cycle*p;y=0;}
      else{const v=(p-.62)/.38;x=mix(-cycle*.31,cycle*.31,smooth(v));y=-Math.sin(Math.PI*v)*13;}
      return {x:mix(i?14:-14,x+(i?5:-5),weight),y:y*weight,contact,phase:p,roll:(contact?(p/.62-.5)*.14:Math.sin((p-.62)/.38*Math.PI)*.22)*weight};
    });
    return {feet,weight,bob:(1-Math.cos(phase*Math.PI*4))*1.35*weight,sway:Math.sin(phase*Math.PI*2)*.022*weight};
  }
  function joint(a,b,l1,l2,bend=1){
    const dx=b[0]-a[0],dy=b[1]-a[1],raw=Math.hypot(dx,dy),d=clamp(raw,Math.abs(l1-l2)+.001,l1+l2-.001);
    const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
    const nx=dx/(raw||1),ny=dy/(raw||1);
    return [a[0]+nx*along-ny*height*bend,a[1]+ny*along+nx*height*bend];
  }
  window.FILM_MOTION={clamp,smooth,mix,track,travel,gait,joint};
})();
