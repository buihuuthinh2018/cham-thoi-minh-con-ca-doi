/* Fullscreen enhancement with a viewport-sized fallback for mobile browsers. */
(() => {
  'use strict';
  class LoveViewer {
    constructor(root,doc=document,win=window){
      this.root=root;this.nativeTarget=doc.documentElement||root;this.doc=doc;this.win=win;this.active=false;this.playing=false;this.rotatePortrait=true;this.epoch=0;
      this.buttons=[doc.querySelector('#fullscreen'),doc.querySelector('#mobile-fullscreen')];
      this.exitButton=doc.querySelector('#viewer-exit');this.rotateButton=doc.querySelector('#viewer-rotate');
      for(const button of this.buttons)button.addEventListener('click',()=>this.toggle());
      this.exitButton.addEventListener('click',()=>this.exit());
      this.rotateButton.addEventListener('click',()=>{this.rotatePortrait=!this.rotatePortrait;this.layout();this.showControls();});
      doc.addEventListener('fullscreenchange',()=>this.fullscreenChanged());
      doc.addEventListener('webkitfullscreenchange',()=>this.fullscreenChanged());
      doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.active){event.preventDefault();this.exit();}});
      win.addEventListener('resize',()=>this.layout());
      win.visualViewport?.addEventListener('resize',()=>this.layout());
      win.screen?.orientation?.addEventListener?.('change',()=>this.layout());
      doc.querySelector('#stage').addEventListener('click',event=>{if(!this.active||event.target.closest('button,a,input'))return;if(root.classList.contains('controls-hidden'))this.showControls();else if(this.playing)this.hideControls();});
      root.addEventListener('pointerdown',event=>{if(this.active&&event.target.closest('button,input,.transport'))this.showControls();});
      root.addEventListener('focusin',()=>{if(this.active)this.showControls();});
      root.addEventListener('click',event=>{if(this.active&&event.target===root)this.showControls();});
      root.addEventListener('pointermove',event=>{if(this.active&&event.pointerType==='mouse')this.showControls();});
    }
    nativeElement(){return this.doc.fullscreenElement||this.doc.webkitFullscreenElement;}
    toggle(){return this.active?this.exit():this.enter();}
    async enter(){
      if(this.active)return;
      const epoch=++this.epoch;this.active=true;this.nativeSeen=false;
      this.previousFocus=this.doc.activeElement;this.savedScroll=this.win.scrollY||0;
      this.root.classList.add('cinema-mode');this.doc.body.classList.add('viewer-open');
      this.layout();this.showControls();this.exitButton.focus({preventScroll:true});
      for(const button of this.buttons)button.setAttribute('aria-pressed','true');
      const request=this.nativeTarget.requestFullscreen||this.nativeTarget.webkitRequestFullscreen;
      if(!request||this.doc.fullscreenEnabled===false&&!this.nativeTarget.webkitRequestFullscreen)return;
      try{
        // Native fullscreen is requested during the original tap. CSS mode is
        // already usable even when a browser refuses or lacks this API.
        await request.call(this.nativeTarget);
        if(!this.active||epoch!==this.epoch){if(!this.active&&this.nativeElement()===this.nativeTarget)await this.leaveNative();return;}
        this.nativeSeen=this.nativeElement()===this.nativeTarget;
        if(this.nativeSeen&&this.win.innerWidth<=1024&&this.win.screen?.orientation?.lock){
          try{await this.win.screen.orientation.lock('landscape');if(!this.active)this.win.screen.orientation.unlock?.();else this.orientationLocked=true;}catch{/* CSS rotation remains available. */}
        }
        this.layout();
      }catch{/* The viewport fallback stays open; no playback interruption. */}
    }
    async leaveNative(){const exit=this.doc.exitFullscreen||this.doc.webkitExitFullscreen;if(exit)try{await exit.call(this.doc);}catch{/* CSS mode can still close. */}}
    async exit(){
      if(!this.active)return;
      ++this.epoch;this.active=false;this.nativeSeen=false;clearTimeout(this.idleTimer);
      this.root.classList.remove('cinema-mode','controls-hidden');this.doc.body.classList.remove('viewer-open');
      if(this.orientationLocked){this.win.screen?.orientation?.unlock?.();this.orientationLocked=false;}
      for(const button of this.buttons)button.setAttribute('aria-pressed','false');
      if(this.nativeElement()===this.nativeTarget)await this.leaveNative();
      this.win.scrollTo(0,this.savedScroll);this.previousFocus?.focus?.({preventScroll:true});this.notifyResize();
    }
    fullscreenChanged(){
      if(this.nativeElement()===this.nativeTarget){this.nativeSeen=true;this.layout();}
      else if(this.active&&this.nativeSeen)this.exit();
    }
    layout(){
      if(!this.active)return;
      const width=Math.round(this.win.visualViewport?.width||this.win.innerWidth),height=Math.round(this.win.visualViewport?.height||this.win.innerHeight);
      const portrait=width<height&&width<=760,rotated=portrait&&this.rotatePortrait;
      const logicalWidth=rotated?height:width,logicalHeight=rotated?width:height;
      const filmWidth=Math.min(logicalWidth,logicalHeight*16/9);
      const values={'--viewer-width':width,'--viewer-height':height,'--viewer-logical-width':logicalWidth,'--viewer-logical-height':logicalHeight,'--viewer-film-width':filmWidth,'--viewer-film-height':filmWidth*9/16};
      for(const [key,value]of Object.entries(values))this.root.style.setProperty(key,`${value}px`);
      this.root.dataset.rotated=String(rotated);this.root.dataset.portrait=String(portrait);this.root.dataset.compact=String(logicalHeight<480);
      this.rotateButton.disabled=!portrait;this.rotateButton.setAttribute('aria-pressed',String(rotated));
      this.notifyResize();
    }
    notifyResize(){this.root.dispatchEvent(new this.win.Event('viewerresize'));}
    setPlaying(playing){if(this.playing===playing)return;this.playing=playing;if(this.active)this.showControls();}
    showControls(){
      clearTimeout(this.idleTimer);this.root.classList.remove('controls-hidden');
      if(this.active&&this.playing)this.idleTimer=setTimeout(()=>{
        // Keyboard focus must never disappear with the controls.
        if(this.doc.activeElement?.matches?.('button:focus-visible,input:focus-visible'))return;
        this.hideControls();
      },3500);
    }
    hideControls(){if(this.active&&this.playing){clearTimeout(this.idleTimer);this.root.classList.add('controls-hidden');}}
  }
  window.LoveViewer=LoveViewer;
  window.loveViewer=new LoveViewer(document.querySelector('#cinema'));
})();
