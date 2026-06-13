(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", mobileNav.classList.contains("is-open"));
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
      var list = panel.parentElement.querySelector("[data-card-list]");
      var empty = panel.querySelector("[data-no-results]");
      var currentType = "";
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (input && query) {
        input.value = query;
      }

      function apply() {
        if (!list) {
          return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var terms = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var typeOnly = normalize(card.getAttribute("data-type"));
          var genreOnly = normalize(card.getAttribute("data-genre"));
          var typePool = typeOnly + " " + genreOnly;
          var selected = normalize(currentType);
          var matchTerms = !terms || haystack.indexOf(terms) !== -1;
          var matchType = true;
          if (selected === "电影") {
            matchType = typeOnly.indexOf("电影") !== -1 || typeOnly.indexOf("movie") !== -1 || typeOnly.indexOf("短片") !== -1;
          } else if (selected === "剧集") {
            matchType = typeOnly.indexOf("剧") !== -1 || typeOnly.indexOf("tv") !== -1 || typeOnly.indexOf("series") !== -1;
          } else if (selected) {
            matchType = typePool.indexOf(selected) !== -1;
          }
          var show = matchTerms && matchType;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          currentType = chip.getAttribute("data-filter-value") || "";
          apply();
        });
      });

      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector("[data-video-player]");
    if (!video) {
      return;
    }
    var frame = document.querySelector("[data-player-frame]");
    var overlay = document.querySelector("[data-play-video]");
    var message = document.querySelector("[data-player-message]");
    var source = video.getAttribute("data-video-src") || "";
    var hls = null;

    function writeMessage(value) {
      if (message) {
        message.textContent = value || "";
      }
    }

    function markPlaying(isPlaying) {
      if (frame) {
        frame.classList.toggle("is-playing", isPlaying);
      }
    }

    function loadSource() {
      if (!source) {
        writeMessage("当前视频暂时无法播放");
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          writeMessage("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            writeMessage("当前视频暂时无法播放");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        writeMessage("当前浏览器暂时无法播放");
      }
    }

    function startPlayback() {
      writeMessage("");
      var promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          markPlaying(true);
        }).catch(function () {
          markPlaying(false);
        });
      } else {
        markPlaying(true);
      }
    }

    loadSource();

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      markPlaying(true);
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        markPlaying(false);
      }
    });

    video.addEventListener("ended", function () {
      markPlaying(false);
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
