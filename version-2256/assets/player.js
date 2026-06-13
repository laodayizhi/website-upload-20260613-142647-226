(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('play-layer');
    var hls = null;
    var ready = false;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function playMovie() {
      bindStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', playMovie);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (!video.ended && layer) {
        layer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
