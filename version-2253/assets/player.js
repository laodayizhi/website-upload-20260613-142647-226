
import { H as Hls } from './hls-dru42stk.js';
const video = document.querySelector('[data-player]');
const status = document.querySelector('[data-player-status]');
const show = text => { if (status) status.textContent = text || ''; };
if (video) {
  const src = video.getAttribute('data-stream');
  if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else if (src && Hls && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else show('暂时无法播放，请稍后再试');
      }
    });
  } else {
    show('暂时无法播放，请稍后再试');
  }
}
