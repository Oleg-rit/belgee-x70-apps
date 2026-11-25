(function () {
'use strict';
var W = 1920, H = 720, IMG = 'img/x70/';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var pc = function (v, of) { return (v / of * 100) + '%'; };

/* ================= живая панель ================= */
var hero = $('.hero'), glass = $('#glass'), say = $('#say');
var st = { t: 'n', on: false, view: 'off', sl: 0, sr: 0, wh: 0, nz: 0, ss: 1, summer: 0, mode: 0 };
var SLOTS = { sl: [296, 390], wh: [394, 488], ss: [1278, 1362], nz: [1366, 1470], se: [1564, 1662], sr: [1664, 1744] };
var views = {}, strip = {}, backTimer = 0;

function viewEl(name) {
  var k = st.t + '_' + name;
  if (!views[k]) {
    var im = new Image();
    im.className = 'view'; im.alt = ''; im.decoding = 'async'; im.src = IMG + 't_' + k + '.webp';
    glass.insertBefore(im, glass.firstChild);
    views[k] = im;
  }
  return views[k];
}
function buildStrip() {
  var s = document.createElement('div'); s.className = 'strip';
  strip.base = new Image(); strip.base.alt = ''; s.appendChild(strip.base);
  Object.keys(SLOTS).forEach(function (k) {
    var a = SLOTS[k][0], w = SLOTS[k][1] - a, d = document.createElement('div'), im = new Image();
    d.className = 'slot'; d.style.left = pc(a, W); d.style.width = pc(w, W);
    im.alt = ''; im.style.width = pc(W, w); im.style.height = '500%'; im.style.left = pc(-a, w);
    d.appendChild(im); s.appendChild(d); strip[k] = im;
  });
  glass.appendChild(s);
}
function row(im, n) { im.style.top = (-n * 100) + '%'; }
function draw() {
  var el = viewEl(st.view);
  var show = function () { Object.keys(views).forEach(function (k) { views[k].classList.toggle('on', views[k] === el); }); };
  if (el.complete) show(); else el.addEventListener('load', function () { if (el === views[st.t + '_' + st.view]) show(); }, { once: true });
  var src = IMG + st.t + '_bars.webp';
  ['base', 'sl', 'sr', 'wh', 'nz', 'ss', 'se'].forEach(function (k) { if (strip[k].getAttribute('src') !== src) strip[k].src = src; });
  var off = !st.on;
  row(strip.base, off ? 4 : 0);
  row(strip.sl, off ? 4 : st.sl); row(strip.sr, off ? 4 : st.sr);
  row(strip.wh, off ? 4 : st.wh); row(strip.nz, off ? 4 : st.nz);
  row(strip.ss, st.ss ? 0 : 1);
  row(strip.se, st.summer ? (st.mode && !off ? 3 : 2) : (st.mode && !off ? 1 : 0));
  hero.classList.toggle('lit', st.on); hero.classList.toggle('day', st.t === 'd');
  $('#start').setAttribute('aria-pressed', st.on);
  $('#ln').setAttribute('aria-pressed', st.t === 'n'); $('#ld').setAttribute('aria-pressed', st.t === 'd');
  buildZones();
}
function tell(b, t) { say.innerHTML = '<b>' + b + '</b>' + t; }
function go(v, ms) {
  clearTimeout(backTimer); st.view = v; draw();
  if (ms) backTimer = setTimeout(function () { if (st.view === v) { st.view = home(); draw(); } }, ms);
}
function home() { return st.on ? 'home' : 'off'; }
function cold() { tell('Двигатель заглушен', 'Подогревы и климат машина сейчас не включит, поэтому значки серые. Нажмите START.'); }
var LV = ['выключен', 'первый уровень', 'второй уровень', 'третий уровень'];

var BAR = [
  ['Температура водителя', 20, 190, function () { if (!st.on) return cold(); go('temp', 6000); tell('Температура', 'Ведите пальцем по дуге или жмите «−» и «+». Окно закроется само через 6 секунд.'); }],
  ['Обдув', 196, 294, function () { tell('Нажали обдув', 'Открывается штатный климат. А теперь удержите этот же значок.'); }, function () { if (!st.on) return cold(); go('clim'); tell('Удержали обдув: окно климата', 'Весь климат в одном окне, поверх карты. Закрыть: нажать мимо.'); }],
  ['Сиденье водителя', 298, 388, function () { if (!st.on) return cold(); st.sl = (st.sl + 1) % 4; go(home()); tell('Сиденье водителя', 'Подогрев: ' + LV[st.sl] + '. Каждое нажатие — следующий уровень.'); }, function () { if (!st.on) return cold(); go('seat'); tell('Удержали сиденье', 'Выберите уровень. Их столько, сколько у вашей машины.'); }],
  ['Подогрев руля', 396, 486, function () { if (!st.on) return cold(); st.wh = st.wh ? 0 : 1; go(home()); tell('Подогрев руля', st.wh ? 'Включён. Удержите значок, чтобы поставить на время.' : 'Выключен.'); }, function () { if (!st.on) return cold(); go('wheelheat'); tell('Удержали руль', '5, 10 или 15 минут. Потом подогрев выключится сам.'); }],
  ['Назад', 506, 602, function () { go(home()); tell('Назад', 'Кнопка «Назад» прямо на панели.'); }],
  ['Музыка', 698, 786, function () { go('track', 4200); tell('Новый трек', 'Сменилась песня — плашка с обложкой на 4 секунды. Можно выключить.'); }],
  ['Радио', 794, 880, function () { tell('Радио', 'Открывается штатное радио.'); }],
  ['Логотип', 896, 1024, function () { var p = st.view; go(home()); tell(p !== home() ? 'Закрыли окно' : 'Рабочий стол', p !== home() ? 'Логотип сначала закрывает окно панели, Android Auto под ним не пропадает.' : 'Нажатие на логотип открывает рабочий стол. А теперь удержите его.'); }, function () { go('cc'); tell('Удержали логотип: центр управления', 'Яркость, Bluetooth, окна, двери, зеркала, перезагрузка ГУ. Руль и форсунки здесь тоже нажимаются.'); }],
  ['Телефон', 1044, 1122, function () { tell('Телефон', 'Штатная звонилка. Нужный контакт удобнее поставить на рабочий стол.'); }],
  ['Настройки', 1138, 1222, function () { tell('Настройки', 'Штатные настройки ГУ. Настройки Panel — в центре управления.'); }],
  ['Старт-стоп', 1280, 1360, function () { st.ss = st.ss ? 0 : 1; go(st.view); tell('Старт-стоп', (st.ss ? 'Включён.' : 'Выключен.') + ' Кнопка есть только на полном приводе.'); }],
  ['Форсунки', 1368, 1468, function () { if (!st.on) return cold(); st.nz = st.nz ? 0 : 1; go(home()); tell('Обогрев форсунок', st.nz ? 'Включён.' : 'Выключен.'); }],
  ['Тема приборки', 1476, 1556, function () { tell('Тема приборки', 'По кругу: S, C, E, D. Меняется сама приборка перед рулём.'); }],
  ['Сезон', 1566, 1660, function () {
    if (st.summer) { if (!st.on) return cold(); st.mode = st.mode ? 0 : 1; go(home()); return tell('Летний режим', st.mode ? 'Окна по одному опускаются на 10 %, кондиционер на MAX. Время вышло — всё закроется.' : 'Окна закрываются, MAX выключается.'); }
    if (st.mode) { st.mode = 0; st.sl = 0; st.wh = 0; go(home()); return tell('Зимний режим остановлен', 'Выключил только то, что включал сам.'); }
    if (!st.on) return cold();
    go('winter'); tell('Зимний режим', 'Выберите время и нажмите «Включить сейчас». Удержите кнопку, чтобы сменить сезон.');
  }, function () { st.summer = st.summer ? 0 : 1; st.mode = 0; go(home()); tell(st.summer ? 'Сезон: лето' : 'Сезон: зима', 'Это только здесь, для показа. В машине сезон выбирают в настройках: «Зимний и летний».'); }],
  ['Сиденье пассажира', 1664, 1744, function () { if (!st.on) return cold(); st.sr = (st.sr + 1) % 4; go(home()); tell('Сиденье пассажира', 'Подогрев: ' + LV[st.sr] + '.'); }],
  ['Температура пассажира', 1752, 1900, function () { tell('Температура пассажира', 'Такая же дуга, только справа. Выключен DUAL — меняется общая.'); }]
];
var ZONES = {
  home: [
    ['Следующий трек', 1735, 184, 102, 66, function () { go('track', 4200); tell('Новый трек', 'Плашка по центру на 4 секунды: обложка, название, исполнитель.'); }],
    ['Предыдущий трек', 1468, 184, 102, 66, function () { go('track', 4200); tell('Новый трек', 'Плашка по центру на 4 секунды: обложка, название, исполнитель.'); }],
    ['Drive X70', 1240, 316, 120, 120, function () { go('fuel'); tell('Drive X70', 'Расход, остаток в баке, цена километра. Назад — стрелка на панели.'); }],
    ['Шлагбаум', 1400, 455, 120, 120, function () { go('callhome', 4200); tell('Звоню: Шлагбаум', 'Контакт на рабочем столе: одно нажатие — звонок через телефон.'); }],
    ['Дом', 1562, 455, 120, 120, function () { tell('Контакт', 'Любой номер, имя можно взять из книги ГУ. Нажмите «Шлагбаум».'); }],
    ['Все приложения', 1715, 455, 140, 120, function () { go('allapps'); tell('Все приложения', 'Удержите значок на столе, чтобы поставить на его место другое.'); }],
    ['Машина', 560, 40, 520, 262, function () { go('door', 4200); tell('Открыли дверь водителя', 'Машина показывается сверху, открытая дверь подсвечена и подписана.'); }],
    ['Одометры', 86, 436, 1060, 136, function () { go('odo'); tell('Одометры', 'Пять счётчиков: километры, моточасы, средняя скорость. Назад — стрелка на панели.'); }]
  ],
  seat: [0, 1, 2, 3].map(function (n) { return ['Уровень ' + n, 70 + n * 170, 356, 152, 236, function () { st.sl = n; go('home'); tell('Сиденье водителя', 'Подогрев: ' + LV[n] + '.'); }]; }),
  wheelheat: [['Включить', 450, 528, 262, 64, function () { st.wh = 1; go('home'); tell('Подогрев руля', 'Включён на 10 минут, отсчёт под значком. Потом выключится сам.'); }], ['Отмена', 168, 528, 262, 64, function () { go('home'); }]],
  winter: [['Включить сейчас', 1358, 528, 294, 62, function () { st.mode = 1; st.sl = 2; st.wh = 1; go('home'); tell('Зимний режим включён', 'Сиденье и руль греются, на кнопке отсчёт. Нажмите её ещё раз, чтобы остановить.'); }]],
  cc: [['Обогрев руля', 296, 398, 228, 186, function () { if (!st.on) return cold(); st.wh = st.wh ? 0 : 1; go('cc'); tell('Обогрев руля', (st.wh ? 'Включён' : 'Выключен') + ' — посмотрите на значок руля внизу.'); }], ['Форсунки', 534, 398, 228, 186, function () { if (!st.on) return cold(); st.nz = st.nz ? 0 : 1; go('cc'); tell('Форсунки', (st.nz ? 'Включены' : 'Выключены') + ' — посмотрите на значок внизу.'); }]]
};
/* границы окон: нажатие мимо закрывает */
var BOX = { clim: [101, 97, 1719, 517], cc: [101, 97, 1719, 517], temp: [16, 175, 356, 437], seat: [40, 274, 720, 338], wheelheat: [140, 284, 600, 328], winter: [1020, 284, 660, 328], allapps: [210, 80, 1500, 430] };

function hot(label, x, y, w, h, tap, hold) {
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'hot'; b.setAttribute('aria-label', label + (hold ? ' (есть удержание: Shift+Enter)' : ''));
  b.style.left = pc(x, W); b.style.top = pc(y, H); b.style.width = pc(w, W); b.style.height = pc(h, H);
  if (hold) b.innerHTML = '<svg class="hold" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" pathLength="100"/></svg>';
  var timer = 0, held = false, down = false;
  var end = function () { clearTimeout(timer); down = false; b.classList.remove('press'); };
  b.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    down = true; held = false; b.classList.add('press');
    if (hold) timer = setTimeout(function () { held = true; end(); touched(); hold(); if (navigator.vibrate) navigator.vibrate(18); }, 560);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.addEventListener(n, end); });
  b.addEventListener('click', function (e) {
    if (held) { held = false; return; }
    touched();
    if (e.detail === 0 && e.shiftKey && hold) return hold(); // клавиатура
    tap();
  });
  b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  return b;
}
function touched() { var h = $('.hint'); if (h) h.remove(); clearTimeout(bootTimer); }
var zones;
function buildZones() {
  zones.textContent = '';
  var box = BOX[st.view];
  if (box || !/^(home|off|track|callhome|door)$/.test(st.view)) { // подложка: нажатие мимо окна
    var back = hot('Закрыть', 0, 0, W, 624, function () { go(home()); tell('Закрыли окно', 'Нажатие мимо окна закрывает его.'); });
    back.classList.add('zone'); zones.appendChild(back);
    if (box) { var inside = hot('Окно', box[0], box[1], box[2], box[3], function () { }); inside.classList.add('zone'); inside.tabIndex = -1; zones.appendChild(inside); }
  }
  (ZONES[/^(off|track|callhome|door)$/.test(st.view) ? 'home' : st.view] || []).forEach(function (z) { zones.appendChild(hot(z[0], z[1], z[2], z[3], z[4], z[5])); });
}
var bootTimer = 0;
if (glass) {
  buildStrip();
  zones = document.createElement('div'); glass.appendChild(zones);
  BAR.forEach(function (b) { glass.appendChild(hot(b[0], b[1], 628, b[2] - b[1], 90, b[3], b[4])); });
  hero.classList.add('boot'); draw();
  bootTimer = setTimeout(function () { start(true); setTimeout(function () { hero.classList.remove('boot'); }, 1500); }, 1100);
  $('#start').addEventListener('click', function () { touched(); start(!st.on); });
  $('#ln').addEventListener('click', function () { light('n'); });
  $('#ld').addEventListener('click', function () { light('d'); });
  var pan = $('.pan'); if (pan && pan.scrollWidth > pan.clientWidth) pan.scrollLeft = 250; // на телефоне сразу видны машина и логотип
}
function start(on) {
  st.on = on; if (!on) { st.mode = 0; st.sl = st.sr = st.wh = st.nz = 0; }
  go(home());
  if (on) tell('Нажимайте и удерживайте', 'Это снимки настоящей программы. Начните с логотипа: удержите его.');
  else tell('Заглушили', 'Фары погасли, подогревы серые. Panel сама ничего в машине не включает.');
}
function light(t) {
  touched(); st.t = t; go(st.view);
  tell(t === 'd' ? 'Светлая тема' : 'Тёмная тема', 'В режиме «Авто» тема меняется сама: днём светлая, ночью тёмная, вслед за подсветкой приборки.');
}

/* ================= один день ================= */
var story = $('.story'), cam = $('.cam'), spot = $('.spot');
if (story) {
  var steps = $$('.step'), frames = {}, cur = null, wrap = $('.stage .glass');
  steps.forEach(function (s) {
    var n = s.dataset.img;
    if (frames[n]) return;
    var im = new Image(); im.alt = ''; im.decoding = 'async'; im.loading = 'lazy'; im.width = W; im.height = H; im.src = IMG + n + '.webp';
    cam.appendChild(im); frames[n] = im;
  });
  cam.appendChild(spot);
  var apply = function () {
    if (!cur) return;
    var r = (cur.dataset.spot || '').split(',').map(Number), cw = wrap.clientWidth, ch = wrap.clientHeight, max = cw < 620 ? 3 : 2.1;
    Object.keys(frames).forEach(function (k) { frames[k].classList.toggle('on', k === cur.dataset.img); });
    if (r.length !== 4) { cam.style.transform = 'none'; spot.style.opacity = 0; return; }
    var k = cw / W, z = Math.max(1, Math.min(max, W / (r[2] * 1.16), H / (r[3] * 1.22)));
    var x = cw / 2 - (r[0] + r[2] / 2) * k * z, y = ch / 2 - (r[1] + r[3] / 2) * k * z;
    x = Math.min(0, Math.max(cw - cw * z, x)); y = Math.min(0, Math.max(ch - ch * z, y));
    cam.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + z + ')';
    spot.style.opacity = 1; spot.style.left = pc(r[0], W); spot.style.top = pc(r[1], H); spot.style.width = pc(r[2], W); spot.style.height = pc(r[3], H);
    spot.style.borderRadius = (14 / z) + 'px';
  };
  var mins = 440, anim = 0, clock = $('#clock'), what = $('#what');
  var show = function (m) { clock.textContent = Math.floor(m / 60) + ':' + ('0' + Math.floor(m % 60)).slice(-2); };
  var toTime = function (chap) { // часы сами докручиваются до времени главы
    var p = $('time', chap).textContent.split(':'), to = p[0] * 60 + +p[1], from = mins, t0 = performance.now();
    what.textContent = $('h3', chap).textContent;
    if (to === from) return;
    cancelAnimationFrame(anim);
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { mins = to; return show(to); }
    var run = function (t) { var k = Math.min(1, (t - t0) / 1000); k = 1 - Math.pow(1 - k, 3); mins = Math.round(from + (to - from) * k); show(mins); if (k < 1) anim = requestAnimationFrame(run); };
    anim = requestAnimationFrame(run);
  };
  var pick = function () {
    var mid = innerHeight * (innerWidth <= 1000 ? .66 : .5), best = null, bd = 1e9;
    steps.forEach(function (s) { var b = s.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = s; } });
    if (best === cur) return;
    if (cur) cur.classList.remove('on');
    cur = best; cur.classList.add('on'); var ch = cur.closest('.chap'); story.dataset.sky = ch.dataset.sky; toTime(ch); apply();
  };
  var tick = false;
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; pick(); }); } }, { passive: true });
  addEventListener('resize', function () { pick(); apply(); });
  pick(); apply();
  var au = null;
  $$('.listen').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!au) { au = new Audio(IMG + 'phone.wav'); au.addEventListener('ended', function () { b.classList.remove('playing'); }); }
      if (au.paused) { au.currentTime = 0; au.play(); b.classList.add('playing'); } else { au.pause(); b.classList.remove('playing'); }
    });
  });
}

/* ================= руководство ================= */
var links = $$('.toc a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
if (links.length && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); }); });
  }, { rootMargin: '-20% 0px -70% 0px' });
  secs.forEach(function (x) { io.observe(x); });
}
/* значки в таблице кнопок — вырезка из той же полосы */
$$('.keys .ic div').forEach(function (d) {
  var p = d.dataset.cut.split(',').map(Number), im = new Image(); // левый край, ширина, строка
  im.alt = ''; im.loading = 'lazy'; im.src = IMG + 'n_bars.webp';
  var sp = document.createElement('span');
  var fit = function () { var k = Math.min(d.clientHeight / 96, d.clientWidth / p[1]); sp.style.height = (96 * k) + 'px'; sp.style.width = (p[1] * k) + 'px'; im.style.width = (W * k) + 'px'; im.style.left = (-p[0] * k) + 'px'; im.style.top = (-p[2] * 100) + '%'; };
  sp.appendChild(im); d.appendChild(sp); fit(); addEventListener('resize', fit);
});
var dlg = $('#zoom');
$$('.shots img').forEach(function (im) { im.addEventListener('click', function () { if (dlg.showModal) { $('img', dlg).src = im.src; dlg.showModal(); } }); });
dlg.addEventListener('click', function () { dlg.close(); });

/* ================= сколько раз скачали ================= */
fetch('https://api.github.com/repos/Oleg-rit/belgee-x70-apps/releases?per_page=100').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (rels) {
  var n = 0;
  rels.forEach(function (r) { (r.assets || []).forEach(function (a) { if (a.name === 'Panel-X70.apk' || a.name === 'PanelX70-install.zip') n += a.download_count; }); });
  if (!n) return;
  var m = n % 10, h = n % 100, w = m >= 2 && m <= 4 && (h < 12 || h > 14) ? ' раза' : ' раз';
  var el = $('#count'); el.textContent = 'Panel X70 уже скачали ' + n + w + '.'; el.hidden = false;
}).catch(function () { });
})();
