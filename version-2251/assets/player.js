(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.elementId);
    var button = document.getElementById(options.buttonId);
    var layer = document.getElementById(options.layerId);
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = options.sourceUrl;
      }
    }

    function play() {
      attachSource();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (layer) {
      layer.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
