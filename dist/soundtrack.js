/* The supplied MP3 is served locally with the film; no external player. */
class LoveSoundtrack {
  constructor(){
    this.kind='file';this.muted=false;this.intent=0;this.offset=0;this.origin=0;this.silentPlaying=false;this.url=null;this.onState=()=>{};this.onChange=()=>{};
    this.audio=new Audio();this.audio.preload='auto';
    this.audio.addEventListener('loadedmetadata',()=>this.onChange());
    this.audio.addEventListener('playing',()=>{if(this.kind==='file')this.onState('playing');});
    this.audio.addEventListener('pause',()=>{if(this.kind==='file'&&!this.audio.ended)this.onState('paused');});
    this.audio.addEventListener('ended',()=>{if(this.kind==='file')this.onState('ended');});
    this.audio.addEventListener('error',()=>{if(this.kind==='file'){this.status('Không đọc được tệp nhạc. Thử tải lại hoặc chọn một tệp MP3 khác.');this.onState('paused');}});
    this.audio.src='audio/cham-cham-thich-em.mp3';
  }
  status(message){document.querySelector('#audio-status').textContent=message;this.onStatus?.(message);}
  get duration(){return this.kind==='file'&&Number.isFinite(this.audio.duration)&&this.audio.duration>0?this.audio.duration:window.LOVE_AUDIO_DURATION||window.LOVE_TIMELINE.duration;}
  get playing(){return this.kind==='file'?!this.audio.paused&&!this.audio.ended:this.silentPlaying;}
  time(){return this.kind==='file'?this.audio.currentTime||0:this.silentPlaying?this.offset+(performance.now()-this.origin)/1000:this.offset;}
  async play(at=0){
    const intent=++this.intent;
    if(this.kind==='silent'){this.offset=at;this.origin=performance.now();this.silentPlaying=true;this.onState('playing');return true;}
    this.audio.currentTime=Math.max(0,Math.min(at,this.duration-.01));this.audio.muted=this.muted;
    let timer;
    try{
      await Promise.race([this.audio.play(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Tệp nhạc tải chậm. Hãy nhấn phát lại hoặc chọn tệp nhạc khác.')),8000);})]);
      if(intent!==this.intent)return false;
      this.status('Đang phát MP3 cùng MV.');return true;
    }catch(error){if(intent!==this.intent)return false;this.pause();throw new Error(error.name==='NotAllowedError'?'Nhấn nút Phát để bật nhạc trong trình duyệt.':error.message);}finally{clearTimeout(timer);}
  }
  pause(){++this.intent;if(this.kind==='silent'){if(this.silentPlaying)this.offset=this.time();this.silentPlaying=false;}this.audio.pause();}
  seek(at){if(this.kind==='silent'){this.offset=at;this.origin=performance.now();}else this.audio.currentTime=Math.max(0,Math.min(at,this.duration));}
  silent(){this.pause();this.kind='silent';this.offset=0;this.status('Đang xem hình ảnh không có nhạc. Chọn Phát nhạc MP3 để bật lại.');this.onChange();}
  selectDefault(){this.pause();this.kind='file';if(this.url){URL.revokeObjectURL(this.url);this.url=null;}this.audio.src='audio/cham-cham-thich-em.mp3';this.status('Nhạc MP3 đã được lồng sẵn. Nhấn Phát để xem MV.');this.onChange();}
  async file(file){
    if(!file)return false;
    if(!(file.type.startsWith('audio/')||/\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(file.name)))throw new Error('Hãy chọn một tệp âm thanh như MP3, WAV hoặc M4A.');
    this.pause();this.kind='file';if(this.url)URL.revokeObjectURL(this.url);this.url=URL.createObjectURL(file);
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Không đọc được thời lượng tệp nhạc.')),8000);this.audio.onloadedmetadata=()=>{clearTimeout(timer);resolve();};this.audio.onerror=()=>{clearTimeout(timer);reject(new Error('Trình duyệt không đọc được định dạng này.'));};this.audio.src=this.url;});
    if(!Number.isFinite(this.audio.duration)||this.audio.duration<=0)throw Error('Tệp nhạc không có thời lượng hợp lệ.');
    this.status(`Đã mở “${file.name}”.`);this.onChange();return true;
  }
  mute(){this.muted=!this.muted;this.audio.muted=this.muted;return this.muted;}
  destroy(){this.pause();if(this.url)URL.revokeObjectURL(this.url);this.audio.removeAttribute?.('src');this.audio.load?.();}
}
