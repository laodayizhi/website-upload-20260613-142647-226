(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    searchForms.forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var typeSelect = root.querySelector('[data-filter-type]');
      var regionSelect = root.querySelector('[data-filter-region]');
      var yearSelect = root.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
      var empty = document.querySelector('[data-empty-result]');

      function applyFilters() {
        var query = text(input && input.value);
        var typeValue = text(typeSelect && typeSelect.value);
        var regionValue = text(regionSelect && regionSelect.value);
        var yearValue = text(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category')
          ].map(text).join(' ');

          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (typeValue && text(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
            matched = false;
          }
          if (regionValue && text(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && text(card.getAttribute('data-year')) !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, regionSelect, yearSelect].forEach(function (field) {
        if (field) {
          field.addEventListener('input', applyFilters);
          field.addEventListener('change', applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');
      if (input && queryValue) {
        input.value = queryValue;
      }
      applyFilters();
    });
  });
})();
