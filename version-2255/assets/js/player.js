(function () {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var errorBox = shell.querySelector('.player-error');
        var url = shell.getAttribute('data-url');
        var loaded = false;
        var hls = null;

        function showError() {
            if (errorBox) {
                errorBox.textContent = '播放暂时不可用，请稍后重试';
                errorBox.classList.add('is-visible');
            }
        }

        function attach() {
            if (!video || !url) {
                showError();
                return Promise.reject(new Error('missing video'));
            }

            if (!loaded) {
                loaded = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                hls.destroy();
                                showError();
                            }
                        }
                    });
                } else {
                    video.src = url;
                }

                video.setAttribute('controls', 'controls');
            }

            return video.play();
        }

        function start() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            attach().catch(function () {
                showError();
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
