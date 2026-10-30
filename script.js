(function () {
  'use strict';

  var WA = 'https://wa.me/77474593867';
  var NORM = -18;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Симптомы: карточка диагностики ---------- */
  var SYM = {
    nemorozit: {
      before: 12,
      causes: ['Утечка хладагента в контуре', 'Компрессор не набирает давление', 'Засор капиллярной трубки или фильтра-осушителя'],
      work: ['Замер давления в контуре', 'Поиск и пайка утечки, замена фильтра', 'Вакуумирование и заправка фреоном по весу'],
      price: 'от 5 000 ₸', wty: 'до 2 лет',
      msg: 'Здравствуйте! Холодильник не морозит или слабо холодит. Нужен мастер.'
    },
    nevkl: {
      before: 21,
      causes: ['Пускозащитное реле', 'Обмотка компрессора', 'Плата управления или термостат'],
      work: ['Проверка реле, обмоток и платы', 'Замена реле или термостата на месте', 'Замена компрессора, если мотор сгорел'],
      price: 'от 5 000 ₸', wty: '6 мес - 2 года',
      msg: 'Здравствуйте! Холодильник не включается, щёлкает. Нужен мастер.'
    },
    led: {
      before: -6,
      causes: ['Не работает оттайка No Frost: ТЭН, предохранитель, датчик', 'Вентилятор испарителя', 'Утечка на испарителе'],
      work: ['Проверка цепи оттайки', 'Замена ТЭНа, предохранителя или датчика', 'Ремонт контура при утечке'],
      price: 'от 5 000 ₸', wty: '6 мес - 2 года',
      msg: 'Здравствуйте! В холодильнике намерзает лёд. Нужен мастер.'
    },
    voda: {
      before: 3,
      causes: ['Засор дренажного отверстия', 'Сбой оттайки', 'Поддон или трубка слива'],
      work: ['Чистка дренажа и трубки слива', 'Проверка системы оттайки', 'Ремонт сливного узла'],
      price: 'от 5 000 ₸', wty: 'от 6 мес',
      msg: 'Здравствуйте! Из холодильника течёт вода. Нужен мастер.'
    },
    shum: {
      before: -13,
      causes: ['Износ компрессора', 'Вентилятор No Frost задевает лёд', 'Пускозащитное реле'],
      work: ['Диагностика компрессора и подвески', 'Замена вентилятора или реле', 'Замена компрессора при износе'],
      price: 'от 5 000 ₸', wty: '6 мес - 2 года',
      msg: 'Здравствуйте! Холодильник сильно шумит и гудит. Нужен мастер.'
    },
    bezost: {
      before: -9,
      causes: ['Недостаток хладагента', 'Датчик температуры или термостат', 'Засор конденсатора'],
      work: ['Замер давления и температуры', 'Замена датчика или термостата', 'Поиск утечки и заправка'],
      price: 'от 5 000 ₸', wty: '6 мес - 2 года',
      msg: 'Здравствуйте! Холодильник работает без остановки. Нужен мастер.'
    },
    oshibka: {
      before: 7,
      causes: ['Датчик температуры или вентилятор', 'Цепь оттайки', 'Плата управления'],
      work: ['Чтение кода ошибки по марке', 'Замена датчика, вентилятора или ТЭНа', 'Ремонт платы: пайка, замена элементов'],
      price: 'от 5 000 ₸', wty: '6 мес - 2 года',
      msg: 'Здравствуйте! Холодильник показывает ошибку на дисплее. Нужен мастер.'
    }
  };

  var chips = document.querySelectorAll('.chip');
  var elCauses = document.getElementById('symCauses');
  var elWork = document.getElementById('symWork');
  var elPrice = document.getElementById('symPrice');
  var elWty = document.getElementById('symWarranty');
  var elWa = document.getElementById('symWa');
  var body = document.getElementById('symBody');
  var temp = document.getElementById('temp');
  var tNum = document.getElementById('tNum');
  var tMark = document.getElementById('tMark');
  var tState = document.getElementById('tState');
  var tBefore = document.getElementById('tBefore');

  function fill(list, items) {
    list.innerHTML = '';
    items.forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s;
      list.appendChild(li);
    });
  }

  function fmt(v) {
    var r = Math.round(v);
    return (r > 0 ? '+' : (r < 0 ? '−' : '')) + Math.abs(r);
  }

  /* показание термометра: сбой -> норма */
  var raf = null, hold = null;
  function pct(v) { return ((24 - v) / 48) * 100; }   /* +24 слева, -24 справа */
  function setTemp(v) {
    tNum.textContent = fmt(v);
    tMark.style.left = pct(v) + '%';
  }
  function runTemp(from) {
    if (raf) cancelAnimationFrame(raf);
    if (hold) clearTimeout(hold);
    temp.classList.remove('is-norm');
    temp.classList.add('is-fault');
    tBefore.textContent = fmt(from) + '°';
    setTemp(from);
    if (reduce) { setTemp(NORM); temp.classList.remove('is-fault'); temp.classList.add('is-norm'); return; }
    hold = setTimeout(function () {
      var dur = 1400, t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        setTemp(from + (NORM - from) * e);
        if (p < 1) { raf = requestAnimationFrame(step); }
        else { temp.classList.remove('is-fault'); temp.classList.add('is-norm'); raf = null; }
      }
      raf = requestAnimationFrame(step);
    }, 700);
  }

  var current = 'nemorozit';
  function setSym(key, animate) {
    var d = SYM[key];
    if (!d) return;
    current = key;
    chips.forEach(function (c) { c.setAttribute('aria-selected', c.dataset.s === key ? 'true' : 'false'); });
    var apply = function () {
      fill(elCauses, d.causes);
      fill(elWork, d.work);
      elPrice.textContent = d.price;
      elWty.textContent = d.wty;
      elWa.href = WA + '?text=' + encodeURIComponent(d.msg);
      body.classList.remove('is-out');
      runTemp(d.before);
    };
    if (animate && body) {
      body.classList.add('is-out');
      setTimeout(apply, 180);
    } else {
      apply();
    }
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { setSym(c.dataset.s, true); });
  });
  if (chips.length) {
    /* первое показание - когда карточка попадает в экран */
    fill(elCauses, SYM.nemorozit.causes);
    fill(elWork, SYM.nemorozit.work);
    elWa.href = WA + '?text=' + encodeURIComponent(SYM.nemorozit.msg);
    tBefore.textContent = fmt(SYM.nemorozit.before) + '°';
    temp.classList.add('is-fault');
    setTemp(SYM.nemorozit.before);
    var started = false;
    function startFirst() { if (!started) { started = true; runTemp(SYM[current].before); } }
    if ('IntersectionObserver' in window && !reduce) {
      var tio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { startFirst(); tio.disconnect(); }
      }, { threshold: 0.35 });
      tio.observe(temp);
    } else {
      startFirst();
    }
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mmenu');
  function closeMenu() {
    if (!menu) return;
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Шапка: тень после прокрутки ---------- */
  var hdr = document.querySelector('.hdr');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      hdr.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Проявление кадров ---------- */
  var media = document.querySelectorAll('.pair-media, .biz-media, .why-media, .sym-card, .full-media');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    media.forEach(function (m) { m.classList.add('rv'); io.observe(m); });
  }

  /* ---------- Форма -> WhatsApp ---------- */
  var form = document.getElementById('leadForm');
  if (form) {
    var phone = document.getElementById('phone');
    var err = document.getElementById('fErr');
    var ok = document.getElementById('fOk');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if ((form.website && form.website.value) || false) return;   /* ловушка для ботов */
      var digits = (phone.value || '').replace(/\D/g, '');
      if (digits.length < 10) {
        err.hidden = false;
        phone.focus();
        return;
      }
      err.hidden = true;
      var name = (document.getElementById('fName').value || '').trim();
      var sym = document.getElementById('fSymptom').value;
      var msg = 'Здравствуйте! Нужен ремонт холодильника.';
      if (sym) msg += '\nСимптом: ' + sym;
      if (name) msg += '\nИмя: ' + name;
      msg += '\nТелефон: ' + phone.value.trim();
      window.open(WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      ok.hidden = false;
    });
  }

  /* ---------- Интро героя: пропуск при хэше, прокрутке и переходе по якорю ---------- */
  if (location.hash || window.scrollY > 80 || reduce) {
    document.documentElement.classList.add('is-loaded');
  } else {
    window.addEventListener('load', function () {
      document.documentElement.classList.add('is-loaded');
    });
  }

  /* ---------- Липкая панель: после 55% первого экрана, не на контактах ---------- */
  var hero = document.getElementById('hero');
  var ftr = document.getElementById('kontakty');
  function stickyState() {
    if (!hero) return;
    var show = window.scrollY > hero.offsetHeight * 0.55;
    var atFtr = ftr && ftr.getBoundingClientRect().top < window.innerHeight - 60;
    document.body.classList.toggle('show-sticky', show);
    document.body.classList.toggle('at-contacts', !!atFtr);
  }
  var st = false;
  window.addEventListener('scroll', function () {
    if (st) return; st = true;
    requestAnimationFrame(function () { stickyState(); st = false; });
  }, { passive: true });
  stickyState();
})();
