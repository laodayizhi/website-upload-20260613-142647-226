
(() => {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navButton && nav) navButton.addEventListener('click', () => nav.classList.toggle('open'));
  const slides = [...document.querySelectorAll('[data-hero-slide]')];
  const dots = [...document.querySelectorAll('[data-hero-dot]')];
  let active = 0;
  const show = index => {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  if (slides.length > 1) setInterval(() => show(active + 1), 5200);
  const input = document.querySelector('[data-search-input]');
  const region = document.querySelector('[data-region-filter]');
  const year = document.querySelector('[data-year-filter]');
  const cards = [...document.querySelectorAll('[data-movie-card]')];
  const empty = document.querySelector('[data-empty]');
  const filter = () => {
    const q = (input?.value || '').trim().toLowerCase();
    const r = region?.value || '';
    const y = year?.value || '';
    let visible = 0;
    cards.forEach(card => {
      const hay = (card.dataset.title + ' ' + card.dataset.tags + ' ' + card.dataset.genre + ' ' + card.dataset.region + ' ' + card.dataset.year).toLowerCase();
      const ok = (!q || hay.includes(q)) && (!r || card.dataset.region === r) && (!y || card.dataset.year === y);
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };
  [input, region, year].forEach(el => el && el.addEventListener('input', filter));
  filter();
})();
