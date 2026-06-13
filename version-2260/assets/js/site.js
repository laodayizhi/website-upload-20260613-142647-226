(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }
    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        startTimer();
      });
    });
    show(0);
    startTimer();
  }

  function setupFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var chips = qsa('[data-filter-value]', panel);
      var scope = document.getElementById(panel.getAttribute('data-filter-panel')) || document;
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-empty-state]', scope.parentNode || document);
      var activeType = 'all';

      function normalize(value) {
        return String(value || '').toLowerCase();
      }

      function filterCards() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' '));
          var typeText = normalize(card.getAttribute('data-type'));
          var genreText = normalize(card.getAttribute('data-genre'));
          var typeMatch = activeType === 'all' || typeText.indexOf(activeType) !== -1 || genreText.indexOf(activeType) !== -1;
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var shouldShow = typeMatch && keywordMatch;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', filterCards);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeType = normalize(chip.getAttribute('data-filter-value') || 'all');
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          filterCards();
        });
      });
      filterCards();
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var button = document.getElementById(config.buttonId);
    var message = document.getElementById(config.messageId);
    var source = config.source;
    var ready = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachSource() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setMessage('视频暂时无法播放，请稍后再试。');
          hls.destroy();
        });
        ready = true;
        return;
      }
      video.src = source;
      ready = true;
    }

    function startPlayback() {
      attachSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      setMessage('');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          setMessage('点击视频区域即可继续播放。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
