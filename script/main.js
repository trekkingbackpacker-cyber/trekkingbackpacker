/* Trekking Backpacker – main script */
(function () {
  'use strict';

  var WA_NUMBER = '6281919605793';

  // Trek Only (own transport, no hotel) – USD per person
  var TREK = { '2D1N': 118, '3D2N': 134, '4D3N': 143 };

  // Standard sharing group incl. transport + hotel – USD per person
  // tiers: 1 person | 2–3 people | 4–6 people | 7–12 people
  var STD = {
    '2D1N|Senaru Crater Rim': [152, 144, 141, 137],
    '2D1N|Sembalun Crater Rim + Summit': [154, 147, 142, 139],
    '3D2N': [172, 157, 152, 149],
    '4D3N': [352, 347, 297, 277]
  };
  var TIER_NAMES = ['1 person', '2–3 people', '4–6 people', '7–12 people'];

  var ROUTES = {
    '2D1N': ['Senaru Crater Rim', 'Sembalun Crater Rim + Summit'],
    '3D2N': ['Sembalun – Senaru', 'Sembalun – Torean'],
    '4D3N': ['Sembalun – Senaru', 'Sembalun – Torean']
  };

  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }
  function tierIndex(n) { return n <= 1 ? 0 : n <= 3 ? 1 : n <= 6 ? 2 : 3; }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Booking widget + cost estimator ---------- */
  var params = new URLSearchParams(window.location.search);

  document.querySelectorAll('form[data-booker]').forEach(function (form) {
    var dur = form.querySelector('[name="duration"]');
    var route = form.querySelector('[name="route"]');
    var svc = form.querySelector('[name="service"]');
    var date = form.querySelector('[name="date"]');
    var people = form.querySelector('[name="people"]');
    var totalEl = form.querySelector('[data-total]');
    var perEl = form.querySelector('[data-per]');

    var wanted = (params.get('package') || '').toUpperCase();
    if (TREK[wanted]) dur.value = wanted;
    if (params.get('service') === 'trek') svc.value = 'trek';

    function fillRoutes() {
      var current = route.value;
      route.innerHTML = '';
      ROUTES[dur.value].forEach(function (r) {
        var o = document.createElement('option');
        o.value = r; o.textContent = r;
        if (r === current) o.selected = true;
        route.appendChild(o);
      });
    }
    function count() { return Math.min(30, Math.max(1, parseInt(people.value, 10) || 1)); }
    function perPerson() {
      if (svc.value === 'trek') return TREK[dur.value];
      var tiers = STD[dur.value + '|' + route.value] || STD[dur.value];
      return tiers[tierIndex(count())];
    }
    function label() {
      return svc.value === 'trek' ? 'Trek Only' : 'Standard (' + TIER_NAMES[tierIndex(count())] + ' rate)';
    }
    function update() {
      var n = count(), pp = perPerson();
      if (totalEl) totalEl.textContent = 'USD ' + (pp * n).toLocaleString('en-US');
      if (perEl) perEl.textContent = label() + ': USD ' + pp + ' × ' + n + (n > 1 ? ' trekkers' : ' trekker');
    }

    if (date) date.min = new Date().toISOString().slice(0, 10);

    dur.addEventListener('change', function () { fillRoutes(); update(); });
    route.addEventListener('change', update);
    svc.addEventListener('change', update);
    people.addEventListener('input', update);
    fillRoutes();
    var wantedRoute = params.get('route');
    if (wantedRoute && ROUTES[dur.value].indexOf(wantedRoute) > -1) route.value = wantedRoute;
    update();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = count(), pp = perPerson();
      var msg =
        'Hello Trekking Backpacker! I would like to join a Mount Rinjani join group trek.\n\n' +
        'Package: ' + dur.value + '\n' +
        'Route: ' + route.value + '\n' +
        'Price option: ' + (svc.value === 'trek' ? 'Trek Only (own motorbike)' : 'Standard with transport & hotel') + '\n' +
        'Start date: ' + (date && date.value ? date.value : 'flexible') + '\n' +
        'Number of trekkers: ' + n + '\n' +
        'Estimated total: USD ' + pp * n + ' (USD ' + pp + ' per person)\n\n' +
        'Is there a join group available on this date?';
      window.open(waLink(msg), '_blank', 'noopener');
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
