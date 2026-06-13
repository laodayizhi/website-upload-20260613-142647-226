(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
        var parent = panel.closest('main') || document;
        var cards = Array.prototype.slice.call(parent.querySelectorAll('.movie-card'));
        var searchInput = panel.querySelector('[data-search-input]');
        var categorySelect = panel.querySelector('[data-category-filter]');
        var regionSelect = panel.querySelector('[data-region-filter]');
        var typeSelect = panel.querySelector('[data-type-filter]');
        var emptyState = parent.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(searchInput && searchInput.value);
            var category = normalize(categorySelect && categorySelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-tags'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var match = true;

                if (query && text.indexOf(query) === -1) {
                    match = false;
                }

                if (category && cardCategory !== category) {
                    match = false;
                }

                if (region && cardRegion.indexOf(region) === -1 && region.indexOf(cardRegion) === -1) {
                    match = false;
                }

                if (type && cardType.indexOf(type) === -1 && type.indexOf(cardType) === -1) {
                    match = false;
                }

                card.hidden = !match;

                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, categorySelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
