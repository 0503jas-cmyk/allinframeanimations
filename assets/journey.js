// Иллюстрированный перелёт: Астана → степь → Каспий → горы → леса → Лондон → Париж → Альпы → Рим
(function () {
  var svg = document.querySelector(".jr__svg");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var G = 400; // линия земли
  var WORLD = 6200;

  var P = {
    ink: "#22364D", ink2: "#3E5670", ink3: "#6F8399",
    gold: "#C9A96A", stone: "#E4D7BD", stone2: "#CDBE9F", roof: "#6D7A88",
    steppe: "#D8C38E", steppe2: "#C5AC71", grass: "#A9A86C",
    forest: "#4C7558", forest2: "#3B6149", meadow: "#8FAE76", meadow2: "#7A9B63",
    water: "#7FA7BC", water2: "#6D97AE", rock: "#8D99A3", rock2: "#76838E", snow: "#F4F1EA",
    glass: "#AFC6D3", cloud: "#FBF8F2", plane: "#F6F3EC", cypress: "#3F5E45", terracotta: "#C98F6A"
  };

  function el(tag, a, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function path(d, fill, parent, extra) {
    var a = { d: d, fill: fill }; for (var k in extra) a[k] = extra[k];
    return el("path", a, parent);
  }
  function rect(x, y, w, h, fill, parent) { return el("rect", { x: x, y: y, width: w, height: h, fill: fill }, parent); }
  // детерминированный «случай», чтобы картинка была одинаковой
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // слои
  var sky = rect(0, 0, 1000, 500, "#D6E4EA", svg);
  var sun = el("circle", { cx: 820, cy: 110, r: 38, fill: "#F3E3BE", opacity: .9 }, svg);
  var far = el("g", {}, svg);    // дальний план, параллакс 0.45
  var clouds = el("g", {}, svg); // облака, параллакс 0.65
  var world = el("g", {}, svg);  // основной план

  // ---------- дальний план ----------
  (function () {
    var d = "M0 " + G;
    for (var x = 0; x <= WORLD * 0.45 + 1000; x += 60) d += " L" + x + " " + (G - 26 - Math.sin(x / 210) * 14 - Math.sin(x / 77) * 6);
    d += " L" + (WORLD * 0.45 + 1000) + " " + G + " Z";
    path(d, "#B9CBCF", far, { opacity: .7 });
  })();

  // ---------- облака ----------
  for (var i = 0; i < 26; i++) {
    var cx = i * 170 + rnd() * 120, cy = 60 + rnd() * 120, s = .6 + rnd() * .8;
    var cg = el("g", { transform: "translate(" + cx + " " + cy + ") scale(" + s + ")", opacity: .9 }, clouds);
    path("M0 20 Q4 0 26 4 Q36 -12 58 -2 Q78 -6 84 12 Q100 14 98 26 L0 26 Q-12 24 0 20 Z", P.cloud, cg);
  }

  // ---------- земля по регионам ----------
  var REG = [
    [0, 720, P.steppe2], [720, 1700, P.steppe], [1700, 2050, P.water], [2050, 2350, P.rock2],
    [2350, 3150, P.meadow], [3150, 3780, P.meadow2], [3780, 3930, P.water], [3930, 4800, P.meadow2],
    [4800, 5350, P.rock2], [5350, WORLD, "#C9B48A"]
  ];
  REG.forEach(function (r) { rect(r[0], G, r[1] - r[0] + 1, 100, r[2], world); });
  // мягкие холмы над землёй
  function hills(x0, x1, color, amp, wl, base) {
    var d = "M" + x0 + " " + (base || G);
    for (var x = x0; x <= x1; x += 20) d += " L" + x + " " + ((base || G) - amp * (0.5 + 0.5 * Math.sin((x - x0) / wl * Math.PI * 2 - Math.PI / 2)));
    d += " L" + x1 + " " + (base || G) + " Z";
    path(d, color, world);
  }

  // ---------- АСТАНА ----------
  function building(x, w, h, fill) { rect(x, G - h, w, h, fill, world); }
  [[20, 40, 90], [70, 30, 120], [520, 34, 110], [560, 40, 80], [690, 36, 70], [300, 30, 95], [330, 26, 70]].forEach(function (b) { building(b[0], b[1], b[2], P.ink3); });
  // Дворец мира и согласия (пирамида)
  (function (x) {
    path("M" + (x - 62) + " " + G + " L" + x + " " + (G - 96) + " L" + (x + 62) + " " + G + " Z", P.ink2, world);
    path("M" + (x - 18) + " " + (G - 68) + " L" + x + " " + (G - 96) + " L" + (x + 18) + " " + (G - 68) + " Z", P.gold, world, { opacity: .9 });
    path("M" + (x - 40) + " " + (G - 34) + " L" + (x + 40) + " " + (G - 34), "none", world, { stroke: P.ink3, "stroke-width": 1.5 });
  })(150);
  // Байтерек
  (function (x) {
    path("M" + (x - 16) + " " + G + " L" + (x - 6) + " " + (G - 190) + " L" + (x + 6) + " " + (G - 190) + " L" + (x + 16) + " " + G + " Z", P.snow, world);
    path("M" + (x - 16) + " " + G + " L" + (x - 6) + " " + (G - 190) + " L" + x + " " + (G - 190) + " L" + x + " " + G + " Z", "#E3DED3", world);
    var tops = "";
    [-30, -18, -8, 8, 18, 30].forEach(function (o) { tops += "M" + x + " " + (G - 186) + " Q" + (x + o * 0.4) + " " + (G - 210) + " " + (x + o) + " " + (G - 238) + " "; });
    path(tops, "none", world, { stroke: P.snow, "stroke-width": 3.2, "stroke-linecap": "round" });
    el("circle", { cx: x, cy: G - 222, r: 21, fill: P.gold }, world);
    el("circle", { cx: x - 7, cy: G - 229, r: 6, fill: "#E6CF97" }, world);
    rect(x - 34, G - 14, 68, 14, P.ink2, world);
  })(255);
  // Хан Шатыр
  (function (x) {
    path("M" + (x - 72) + " " + G + " Q" + (x - 30) + " " + (G - 70) + " " + (x + 8) + " " + (G - 150) + " L" + (x + 12) + " " + (G - 152) + " Q" + (x + 34) + " " + (G - 70) + " " + (x + 78) + " " + G + " Z", "#C9D3D8", world);
    path("M" + (x + 8) + " " + (G - 150) + " L" + (x - 30) + " " + G + " M" + (x + 9) + " " + (G - 150) + " L" + (x + 18) + " " + G + " M" + (x + 10) + " " + (G - 150) + " L" + (x + 52) + " " + G, "none", world, { stroke: "#A9B6BE", "stroke-width": 1.2 });
    path("M" + (x + 10) + " " + (G - 152) + " L" + (x + 12) + " " + (G - 178), "none", world, { stroke: P.ink2, "stroke-width": 2 });
  })(430);
  // Ак Орда
  (function (x) {
    rect(x - 60, G - 50, 120, 50, P.snow, world);
    rect(x - 22, G - 72, 44, 22, P.snow, world);
    path("M" + (x - 22) + " " + (G - 72) + " A22 22 0 0 1 " + (x + 22) + " " + (G - 72) + " Z", "#4E86B5", world);
    path("M" + x + " " + (G - 94) + " L" + x + " " + (G - 128), "none", world, { stroke: P.gold, "stroke-width": 2.5 });
    for (var c = -50; c <= 50; c += 12) rect(x + c - 2, G - 44, 4, 38, "#D5CEC1", world);
  })(620);

  // ---------- СТЕПЬ ----------
  hills(720, 1700, "#CDB57C", 18, 420);
  for (var g2 = 0; g2 < 90; g2++) {
    var gx = 730 + rnd() * 960, gy = G + 6 + rnd() * 80;
    path("M" + gx + " " + gy + " l-3 -9 M" + gx + " " + gy + " l2 -11 M" + gx + " " + gy + " l6 -8", "none", world, { stroke: P.grass, "stroke-width": 1.4, "stroke-linecap": "round" });
  }
  // юрты
  [[1000, 1], [1060, .8], [1450, 1]].forEach(function (y) {
    var x = y[0], s = y[1];
    var yg = el("g", { transform: "translate(" + x + " " + G + ") scale(" + s + ")" }, world);
    rect(-24, -22, 48, 22, P.snow, yg);
    path("M-26 -22 Q0 -46 26 -22 Z", "#EDE6D8", yg);
    rect(-6, -16, 12, 16, P.terracotta, yg);
    path("M-24 -12 L24 -12", "none", yg, { stroke: P.terracotta, "stroke-width": 2 });
  });
  // кони
  [1230, 1262, 1300].forEach(function (x, i) {
    var hg = el("g", { transform: "translate(" + x + " " + (G + 36 + i * 6) + ")" }, world);
    path("M0 0 Q10 -6 22 -2 L28 -12 L32 -10 L27 2 L24 12 L21 12 L20 4 L6 4 L4 12 L1 12 Z", "#7B5A3E", hg);
  });

  // ---------- КАСПИЙ ----------
  for (var w = 0; w < 14; w++) {
    var wx = 1710 + rnd() * 320, wy = G + 12 + rnd() * 70;
    path("M" + wx + " " + wy + " q6 -4 12 0 t12 0", "none", world, { stroke: "#A6C3D2", "stroke-width": 1.5, "stroke-linecap": "round" });
  }

  // ---------- ГОРЫ ----------
  function mountain(x, h, wd, c) {
    path("M" + (x - wd) + " " + G + " L" + x + " " + (G - h) + " L" + (x + wd) + " " + G + " Z", c || P.rock, world);
    path("M" + (x - wd * .28) + " " + (G - h * .72) + " L" + x + " " + (G - h) + " L" + (x + wd * .28) + " " + (G - h * .72) + " L" + (x + wd * .1) + " " + (G - h * .66) + " L" + (x - wd * .06) + " " + (G - h * .74) + " Z", P.snow, world);
  }
  mountain(2120, 170, 120, P.rock2); mountain(2230, 230, 150); mountain(2330, 150, 110, P.rock2);

  // ---------- ЛЕСА ----------
  hills(2350, 3150, "#7FA06A", 34, 380);
  function tree(x, y, s, c) {
    var tg = el("g", { transform: "translate(" + x + " " + y + ") scale(" + s + ")" }, world);
    rect(-1.5, -6, 3, 6, "#5B4532", tg);
    path("M-11 -6 L0 -36 L11 -6 Z", c, tg);
  }
  function roundTree(x, y, s, c) {
    var tg = el("g", { transform: "translate(" + x + " " + y + ") scale(" + s + ")" }, world);
    rect(-1.5, -8, 3, 8, "#5B4532", tg);
    el("circle", { cx: 0, cy: -18, r: 12, fill: c }, tg);
  }
  for (var t = 0; t < 70; t++) {
    var tx = 2370 + rnd() * 770, ty = G - 4 + rnd() * 30;
    (rnd() > .45 ? tree : roundTree)(tx, ty, .9 + rnd() * .7, rnd() > .5 ? P.forest : P.forest2);
  }
  // река
  path("M2600 " + (G + 100) + " C2640 " + (G + 60) + " 2700 " + (G + 50) + " 2760 " + (G + 20) + " S2860 " + (G + 6) + " 2900 " + (G + 2), "none", world, { stroke: P.water, "stroke-width": 7, "stroke-linecap": "round" });

  // ---------- ЛОНДОН ----------
  for (var lb = 0; lb < 14; lb++) { var bx = 3160 + lb * 44 + rnd() * 10; building(bx, 30 + rnd() * 14, 40 + rnd() * 60, lb % 2 ? P.ink3 : "#8193A6"); }
  // Темза
  rect(3150, G + 30, 630, 26, P.water, world);
  // Вестминстер + Биг-Бен
  (function (x) {
    rect(x + 14, G - 70, 150, 70, P.stone2, world);
    for (var k = 0; k < 10; k++) path("M" + (x + 18 + k * 15) + " " + (G - 70) + " l3 -12 l3 12 Z", P.stone2, world);
    rect(x - 14, G - 220, 28, 220, P.stone, world);
    rect(x - 14, G - 220, 28, 6, P.stone2, world);
    rect(x - 16, G - 200, 32, 32, P.stone2, world);
    el("circle", { cx: x, cy: G - 184, r: 11, fill: P.snow, stroke: P.ink, "stroke-width": 1.5 }, world);
    path("M" + x + " " + (G - 184) + " L" + x + " " + (G - 192) + " M" + x + " " + (G - 184) + " L" + (x + 6) + " " + (G - 184), "none", world, { stroke: P.ink, "stroke-width": 1.4 });
    path("M" + (x - 14) + " " + (G - 220) + " L" + x + " " + (G - 270) + " L" + (x + 14) + " " + (G - 220) + " Z", P.ink2, world);
    for (var wy2 = G - 150; wy2 < G - 10; wy2 += 18) rect(x - 6, wy2, 12, 10, P.stone2, world);
  })(3330);
  // Лондонский глаз
  (function (x) {
    var cy = G - 110, r = 92;
    el("circle", { cx: x, cy: cy, r: r, fill: "none", stroke: P.ink2, "stroke-width": 3 }, world);
    for (var a = 0; a < 16; a++) {
      var an = a / 16 * Math.PI * 2;
      path("M" + x + " " + cy + " L" + (x + Math.cos(an) * r) + " " + (cy + Math.sin(an) * r), "none", world, { stroke: P.ink3, "stroke-width": .8 });
      el("ellipse", { cx: x + Math.cos(an) * (r + 5), cy: cy + Math.sin(an) * (r + 5), rx: 5, ry: 3.5, fill: P.snow, stroke: P.ink2, "stroke-width": 1 }, world);
    }
    path("M" + (x - 40) + " " + G + " L" + x + " " + cy + " L" + (x + 40) + " " + G, "none", world, { stroke: P.ink2, "stroke-width": 4 });
  })(3520);
  // Тауэрский мост
  (function (x) {
    [-60, 60].forEach(function (o) {
      rect(x + o - 14, G - 120, 28, 120, P.stone, world);
      path("M" + (x + o - 16) + " " + (G - 120) + " L" + (x + o) + " " + (G - 150) + " L" + (x + o + 16) + " " + (G - 120) + " Z", P.ink2, world);
    });
    rect(x - 46, G - 96, 92, 8, P.ink3, world);
    rect(x - 130, G - 40, 260, 8, P.ink3, world);
    path("M" + (x - 130) + " " + (G - 40) + " Q" + (x - 100) + " " + (G - 90) + " " + (x - 74) + " " + (G - 110) + " M" + (x + 74) + " " + (G - 110) + " Q" + (x + 100) + " " + (G - 90) + " " + (x + 130) + " " + (G - 40), "none", world, { stroke: "#5D8FB3", "stroke-width": 3 });
  })(3690);

  // ---------- ЛА-МАНШ ----------
  for (var w3 = 0; w3 < 8; w3++) { var cx3 = 3790 + rnd() * 120, cy3 = G + 14 + rnd() * 70; path("M" + cx3 + " " + cy3 + " q6 -4 12 0 t12 0", "none", world, { stroke: "#A6C3D2", "stroke-width": 1.5, "stroke-linecap": "round" }); }

  // ---------- ПАРИЖ ----------
  // штрихи города на подлёте
  for (var h = 0; h < 22; h++) {
    var hx = 3940 + h * 40, hh = 34 + rnd() * 30;
    rect(hx, G - hh, 34, hh, P.stone, world);
    path("M" + (hx - 2) + " " + (G - hh) + " L" + (hx + 5) + " " + (G - hh - 12) + " L" + (hx + 29) + " " + (G - hh - 12) + " L" + (hx + 36) + " " + (G - hh) + " Z", P.roof, world);
    for (var fl = G - hh + 8; fl < G - 6; fl += 12) path("M" + (hx + 4) + " " + fl + " h26", "none", world, { stroke: P.stone2, "stroke-width": 1, "stroke-dasharray": "4 3" });
  }
  // Триумфальная арка
  (function (x) {
    path("M" + (x - 42) + " " + G + " L" + (x - 42) + " " + (G - 96) + " L" + (x + 42) + " " + (G - 96) + " L" + (x + 42) + " " + G + " L" + (x + 16) + " " + G + " L" + (x + 16) + " " + (G - 40) + " A16 16 0 0 0 " + (x - 16) + " " + (G - 40) + " L" + (x - 16) + " " + G + " Z", P.stone2, world);
    rect(x - 46, G - 104, 92, 10, P.stone, world);
  })(4070);
  // Эйфелева башня
  (function (x) {
    var d = "M" + (x - 66) + " " + G +
      " Q" + (x - 34) + " " + (G - 70) + " " + (x - 18) + " " + (G - 140) +
      " L" + (x - 8) + " " + (G - 238) + " L" + (x - 3) + " " + (G - 290) +
      " L" + (x + 3) + " " + (G - 290) + " L" + (x + 8) + " " + (G - 238) +
      " L" + (x + 18) + " " + (G - 140) + " Q" + (x + 34) + " " + (G - 70) + " " + (x + 66) + " " + G +
      " L" + (x + 44) + " " + G + " Q" + (x + 26) + " " + (G - 54) + " " + x + " " + (G - 58) +
      " Q" + (x - 26) + " " + (G - 54) + " " + (x - 44) + " " + G + " Z";
    path(d, P.ink, world);
    rect(x - 30, G - 84, 60, 7, P.ink, world);
    rect(x - 20, G - 148, 40, 6, P.ink, world);
    rect(x - 9, G - 242, 18, 5, P.ink, world);
    path("M" + x + " " + (G - 290) + " L" + x + " " + (G - 316), "none", world, { stroke: P.ink, "stroke-width": 2 });
    var lat = "";
    for (var yy = G - 140; yy < G - 90; yy += 10) lat += "M" + (x - 18 - (G - 140 - yy) * -0.15) + " " + yy + " L" + (x + 18 + (G - 140 - yy) * -0.15) + " " + (yy + 10) + " ";
    path(lat, "none", world, { stroke: "#4D6580", "stroke-width": .8 });
  })(4300);
  // Лувр и пирамида
  (function (x) {
    rect(x - 120, G - 56, 240, 56, P.stone, world);
    for (var w4 = -110; w4 < 110; w4 += 16) rect(x + w4, G - 46, 8, 14, P.stone2, world);
    path("M" + (x - 46) + " " + G + " L" + x + " " + (G - 64) + " L" + (x + 46) + " " + G + " Z", P.glass, world, { stroke: P.ink2, "stroke-width": 1.5 });
    var lt = "";
    for (var q = 1; q < 4; q++) { var yq = G - 64 + q * 16, hw = 46 * q * 16 / 64; lt += "M" + (x - hw) + " " + yq + " L" + (x + hw) + " " + yq + " "; }
    lt += "M" + x + " " + (G - 64) + " L" + (x - 15) + " " + G + " M" + x + " " + (G - 64) + " L" + (x + 15) + " " + G;
    path(lt, "none", world, { stroke: P.ink2, "stroke-width": .9 });
  })(4560);
  // Сена
  rect(3930, G + 40, 870, 20, P.water2, world);

  // ---------- АЛЬПЫ ----------
  mountain(4930, 190, 140, P.rock2); mountain(5060, 250, 160); mountain(5200, 180, 130, P.rock2);

  // ---------- РИМ ----------
  for (var cp = 0; cp < 9; cp++) { var cpx = 5380 + cp * 34 + rnd() * 10; el("ellipse", { cx: cpx, cy: G - 30, rx: 7, ry: 32, fill: P.cypress }, world); }
  // Колизей
  (function (x) {
    path("M" + (x - 110) + " " + G + " L" + (x - 110) + " " + (G - 96) + " Q" + x + " " + (G - 116) + " " + (x + 110) + " " + (G - 80) + " L" + (x + 110) + " " + G + " Z", P.terracotta, world);
    for (var row = 0; row < 3; row++) {
      for (var ar = -100; ar < 100; ar += 17) {
        var ay = G - 18 - row * 28, ah = 16;
        path("M" + (x + ar) + " " + ay + " L" + (x + ar) + " " + (ay - ah + 5) + " A5 5 0 0 1 " + (x + ar + 10) + " " + (ay - ah + 5) + " L" + (x + ar + 10) + " " + ay + " Z", "#9C6448", world);
      }
    }
  })(5640);
  // собор Святого Петра
  (function (x) {
    rect(x - 70, G - 60, 140, 60, P.stone, world);
    for (var col = -64; col < 64; col += 14) rect(x + col, G - 54, 5, 50, P.stone2, world);
    rect(x - 34, G - 94, 68, 34, P.stone, world);
    path("M" + (x - 40) + " " + (G - 94) + " A40 44 0 0 1 " + (x + 40) + " " + (G - 94) + " Z", "#8FA6B3", world);
    rect(x - 6, G - 148, 12, 14, P.stone, world);
    path("M" + x + " " + (G - 148) + " L" + x + " " + (G - 166), "none", world, { stroke: P.gold, "stroke-width": 2 });
  })(5900);

  // ---------- самолёт и инверсионный след ----------
  var trail = el("path", { d: "M0 0", fill: "none", stroke: "#FBF8F2", "stroke-width": 3, "stroke-dasharray": "10 8", "stroke-linecap": "round", opacity: .9 }, svg);
  var plane = el("g", {}, svg);
  (function () {
    path("M-46 -2 Q-44 -10 -30 -10 L34 -10 Q50 -10 56 0 Q50 8 34 8 L-30 8 Q-44 8 -46 -2 Z", P.plane, plane, { stroke: P.ink, "stroke-width": 1.5 });
    path("M-40 -9 L-50 -30 L-38 -30 L-24 -10 Z", P.ink, plane);
    path("M-6 2 L-24 26 L-12 26 L14 4 Z", P.ink2, plane);
    path("M-2 -8 L-14 -22 L-6 -22 L8 -9 Z", P.ink2, plane, { opacity: .7 });
    for (var wi = -24; wi < 36; wi += 9) el("circle", { cx: wi, cy: -3, r: 2, fill: P.ink2 }, plane);
    path("M44 -6 Q52 -4 54 0", "none", plane, { stroke: P.ink, "stroke-width": 1.5 });
    rect(-30, 1, 62, 2.4, P.stamp || "#A4452C", plane);
  })();

  // ---------- камера ----------
  var SKY = [[0, [214, 228, 234]], [1700, [222, 230, 228]], [2300, [205, 223, 232]], [3300, [212, 224, 230]], [4300, [236, 221, 200]], [5600, [240, 214, 190]]];
  function skyAt(x) {
    for (var i = 0; i < SKY.length - 1; i++) if (x <= SKY[i + 1][0]) {
      var a = SKY[i], b = SKY[i + 1], k = (x - a[0]) / (b[0] - a[0]);
      return "rgb(" + [0, 1, 2].map(function (j) { return Math.round(a[1][j] + (b[1][j] - a[1][j]) * k); }).join(",") + ")";
    }
    return "rgb(" + SKY[SKY.length - 1][1].join(",") + ")";
  }
  var PX = 300; // позиция самолёта по горизонтали
  var trailPts = [];
  function setCam(cam, t) {
    world.setAttribute("transform", "translate(" + (-cam) + " 0)");
    far.setAttribute("transform", "translate(" + (-cam * 0.45) + " 0)");
    clouds.setAttribute("transform", "translate(" + (-cam * 0.65) + " 0)");
    sky.setAttribute("fill", skyAt(cam + 500));
    sun.setAttribute("cy", 110 + Math.max(0, (cam - 3800) / 2400) * 60);
    var alt = 150 + Math.sin(t / 900) * 8 + Math.min(1, cam / 300) * -20 + 20 - (cam < 300 ? (300 - cam) / 300 * -90 : 0);
    var tilt = Math.cos(t / 900) * 2;
    plane.setAttribute("transform", "translate(" + PX + " " + alt + ") rotate(" + (-tilt) + ") scale(.95)");
    trailPts.push([cam + PX - 48, alt]);
    while (trailPts.length && trailPts[0][0] < cam + PX - 300) trailPts.shift();
    var d = ""; trailPts.forEach(function (p, i) { d += (i ? " L" : "M") + (p[0] - cam) + " " + p[1]; });
    trail.setAttribute("d", d || "M0 0");
  }

  // остановки: центр города окажется в правой части кадра
  var STOPS = [
    { cam: 0, city: "Астана", code: "NQZ · KAZAKHSTAN" },
    { cam: 2930, city: "Лондон", code: "LHR · UNITED KINGDOM" },
    { cam: 3880, city: "Париж", code: "CDG · FRANCE" },
    { cam: 5200, city: "Рим", code: "FCO · ITALIA" }
  ];
  var stampEl = document.querySelector(".jr__stamp");
  var stopsEl = document.querySelectorAll(".jr__stops li");
  function showStop(i) {
    stopsEl.forEach(function (li) { li.classList.toggle("is-on", +li.getAttribute("data-stop") === i); });
    if (!stampEl || i === 0) { if (stampEl) stampEl.className = "jr__stamp is-off"; return; }
    var nm = document.querySelector('.jr__stops li[data-stop="' + i + '"] b');
    stampEl.querySelector(".jr__stamp-city").textContent = nm ? nm.textContent : STOPS[i].city;
    stampEl.querySelector(".jr__stamp-code").textContent = STOPS[i].code;
    stampEl.className = "jr__stamp"; void stampEl.offsetWidth; stampEl.className = "jr__stamp is-on";
  }
  function hideStamp() { if (stampEl) stampEl.className = "jr__stamp is-off"; }

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { setCam(STOPS[2].cam, 0); showStop(2); return; }

  var SPEED = 0.30;  // единиц мира за мс
  var HOLD = 2200;
  var seg = 0, segStart = null, holding = true, holdStart = null, visible = false, raf = null;
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (holding) {
      if (holdStart === null) { holdStart = ts; showStop(seg); }
      setCam(STOPS[seg].cam, ts);
      if (ts - holdStart > HOLD) {
        holding = false; segStart = ts; hideStamp();
        if (seg === STOPS.length - 1) { seg = -1; trailPts = []; }
      }
      return;
    }
    if (segStart === null) segStart = ts;
    var from = seg === -1 ? STOPS[0].cam : STOPS[seg].cam, toI = seg + 1, to = STOPS[toI].cam;
    if (seg === -1) { seg = 0; holding = true; holdStart = null; setCam(0, ts); return; }
    var dur = Math.max(1600, (to - from) / SPEED), k = Math.min(1, (ts - segStart) / dur);
    setCam(from + (to - from) * ease(k), ts);
    if (k >= 1) { seg = toI; holding = true; holdStart = null; }
  }
  setCam(0, 0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
      if (!visible && raf) { cancelAnimationFrame(raf); raf = null; holdStart = null; segStart = null; }
    }, { threshold: 0.2 }).observe(svg);
  } else { raf = requestAnimationFrame(frame); }
})();
