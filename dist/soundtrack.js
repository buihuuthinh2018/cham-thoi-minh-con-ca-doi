/* Playback only. No song is downloaded, copied or replaced with generated music. */
class LoveSoundtrack {
  constructor(){this.kind='youtube';this.muted=false;this.player=null;this.ready=null;this.intent=0;this.offset=0;this.origin=0;this.silentPlaying=false;this.url=null;this.onState=()=>{};this.onChange=()=>{};this.audio=new Audio();this.audio.preload='metadata';this.audio.addEventListener('play',()=>{if(this.kind==='file')this.onState('playing');});this.audio.addEventListener('pause',()=>{if(this.kind==='file'&&!this.audio.ended)this.onState('paused');});this.audio.addEventListener('ended',()=>{if(this.kind==='file')this.onState('ended');});}
  status(message){document.querySelector('#audio-status').textContent=message;}
  get duration(){if(this.kind==='file'&&Number.isFinite(this.audio.duration))return this.audio.duration;if(this.kind==='youtube'&&this.player?.getDuration){const d=this.player.getDuration();if(d>1)return d;}return window.LOVE_TIMELINE.duration;}
  get playing(){if(this.kind==='file')return !this.audio.paused&&!this.audio.ended;if(this.kind==='silent')return this.silentPlaying;return this.player?.getPlayerState?.()===1;}
  time(){if(this.kind==='file')return this.audio.currentTime||0;if(this.kind==='youtube')return this.player?.getCurrentTime?.()||0;return this.silentPlaying?this.offset+(performance.now()-this.origin)/1000:this.offset;}
  async youtube(){
    document.querySelector('#youtube-wrap').classList.remove('hidden');
    if(this.ready)return this.ready;
    this.ready=new Promise((resolve,reject)=>{
      let timer=setTimeout(()=>{this.ready=null;reject(new Error('Không tải được trình phát YouTube. Bạn có thể chọn tệp nhạc trên máy hoặc xem hình ảnh trước.'));},18000);
      const make=()=>{
        this.player=new YT.Player('youtube-player',{width:480,height:270,videoId:'FreZ0f-To-o',playerVars:{playsinline:1,rel:0,origin:location.origin},events:{
          onReady:()=>{clearTimeout(timer);this.player.setVolume(75);if(this.muted)this.player.mute();this.onChange();resolve(this.player);},
          onStateChange:e=>{if(this.kind!=='youtube')return;this.onChange();if(e.data===1)this.onState('playing');else if(e.data===2)this.onState('paused');else if(e.data===0)this.onState('ended');},
          onError:e=>{clearTimeout(timer);this.status(`YouTube không phát được ở đây (mã ${e.data}). Hãy chọn tệp nhạc trên máy hoặc mở MV chính thức.`);this.onState('paused');reject(new Error('Không thể phát bản nhạc từ YouTube.'));},
          onAutoplayBlocked:()=>this.status('Hãy nhấn Phát trong khung YouTube bên dưới. Hoạt hình sẽ bắt đầu cùng bản nhạc.')
        }});
      };
      if(window.YT?.Player)make();else{window.onYouTubeIframeAPIReady=make;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timer);this.ready=null;reject(new Error('Không kết nối được YouTube. Hãy chọn tệp nhạc trên máy.'));};document.head.appendChild(script);}
    });
    return this.ready;
  }
  async play(at=0){
    const intent=++this.intent;
    if(this.kind==='silent'){this.offset=at;this.origin=performance.now();this.silentPlaying=true;this.onState('playing');return true;}
    if(this.kind==='file'){this.audio.currentTime=Math.min(at,Math.max(0,this.duration-.01));this.audio.muted=this.muted;await this.audio.play();return true;}
    this.status('Đang mở bản cover của Meader Music. Nếu trình duyệt chặn tự phát, hãy nhấn Phát trong khung YouTube.');
    const player=await this.youtube();if(intent!==this.intent||this.kind!=='youtube')return false;
    if(Math.abs(player.getCurrentTime()-at)>.4)player.seekTo(at,true);player.playVideo();
    for(let i=0;i<60;i++){if(intent!==this.intent)return false;if(player.getPlayerState()===1){this.status('Đang phát bản cover Meader Music từ YouTube. Hình ảnh đi theo thời gian của trình phát.');return true;}await new Promise(r=>setTimeout(r,100));}
    this.status('Nhấn Phát trong khung YouTube bên dưới, hoặc chọn tệp nhạc trên máy.');return false;
  }
  pause(){++this.intent;if(this.kind==='silent'){if(this.silentPlaying)this.offset=this.time();this.silentPlaying=false;}if(this.kind==='file')this.audio.pause();if(this.kind==='youtube')this.player?.pauseVideo?.();}
  seek(at){if(this.kind==='silent'){this.offset=at;this.origin=performance.now();}else if(this.kind==='file')this.audio.currentTime=at;else this.player?.seekTo?.(at,true);}
  silent(){this.pause();this.kind='silent';this.offset=0;this.status('Đang xem hình ảnh, chưa có nhạc. Chọn Nhạc gốc hoặc tệp trên máy để xem MV cùng bài hát.');this.onChange();}
  selectYouTube(){this.pause();this.kind='youtube';this.onChange();this.status('Nguồn nhạc: Meader Music · Cover Chậm Chậm Thích Em.');}
  async file(file){
    if(!file)return false;
    if(!(file.type.startsWith('audio/')||/\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(file.name)))throw new Error('Hãy chọn một tệp âm thanh như MP3, WAV hoặc M4A.');
    this.pause();this.kind='file';if(this.url)URL.revokeObjectURL(this.url);this.url=URL.createObjectURL(file);this.audio.src=this.url;
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Không đọc được thời lượng tệp nhạc.')),12000);this.audio.onloadedmetadata=()=>{clearTimeout(timer);resolve();};this.audio.onerror=()=>{clearTimeout(timer);reject(new Error('Trình duyệt không đọc được định dạng tệp này.'));};});
    if(!Number.isFinite(this.audio.duration)||this.audio.duration<=0)throw Error('Tệp nhạc không có thời lượng hợp lệ.');
    this.status(`Đã mở “${file.name}”. Tệp chỉ được phát trên máy, không tải lên máy chủ.`);this.onChange();return true;
  }
  mute(){this.muted=!this.muted;this.audio.muted=this.muted;if(this.player){if(this.muted)this.player.mute();else this.player.unMute();}return this.muted;}
  destroy(){this.pause();if(this.url)URL.revokeObjectURL(this.url);this.player?.destroy?.();}
}


