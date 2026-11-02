// Маленькая карта маршрута на странице паспорта
(function () {
  var svg = document.querySelector(".mini__svg");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; }
  function txt(x, y, s, cls, anchor) { var t = el("text", { x: x, y: y, class: cls, "text-anchor": anchor || "start" }); t.textContent = s; return t; }

  el("line", { x1: 28, y1: 54, x2: 452, y2: 54, class: "mn-rule" });
  txt(28, 38, "МАРШРУТ · ROUTE", "mn-label");
  txt(452, 38, "NQZ → FCO", "mn-label", "end");

  var C = {
    NQZ: { x: 410, y: 190, n: "Астана" },
    LHR: { x: 70, y: 150, n: "Лондон" },
    CDG: { x: 120, y: 236, n: "Париж" },
    FCO: { x: 236, y: 316, n: "Рим" }
  };
  // контурные достопримечательности (≈ 34px высотой)
  var ICONS = {
    NQZ: function (g) { // Байтерек
      el("path", { d: "M-4 0 L-1.5 -26 L1.5 -26 L4 0 Z", class: "mn-ico" }, g);
      el("path", { d: "M0 -26 Q-6 -30 -7 -36 M0 -26 Q6 -30 7 -36 M0 -26 L0 -30", class: "mn-ico" }, g);
      el("circle", { cx: 0, cy: -36, r: 5.5, class: "mn-gold" }, g);
    },
    LHR: function (g) { // Биг-Бен
      el("path", { d: "M-4 0 L-4 -24 L4 -24 L4 0 M-5 -24 L-5 -30 L5 -30 L5 -24 M-5 -30 L0 -40 L5 -30", class: "mn-ico" }, g);
      el("circle", { cx: 0, cy: -27, r: 2, class: "mn-ico" }, g);
    },
    CDG: function (g) { // Эйфелева башня
      el("path", { d: "M-11 0 Q-5 -10 -3 -20 L-1 -36 L1 -36 L3 -20 Q5 -10 11 0 M-7 -8 L7 -8 M-3.5 -20 L3.5 -20 M-5 0 Q0 -8 5 0 M0 -36 L0 -40", class: "mn-ico" }, g);
    },
    FCO: function (g) { // Колизей
      el("path", { d: "M-15 0 L-15 -16 Q0 -20 15 -14 L15 0 Z M-15 -8 L15 -7", class: "mn-ico" }, g);
      for (var i = -12; i <= 9; i += 7) el("path", { d: "M" + i + " 0 L" + i + " -4 Q" + (i + 2) + " -6.5 " + (i + 4) + " -4 L" + (i + 4) + " 0", class: "mn-ico" }, g);
    }
  };
  var LBL = { NQZ: [0, 22, "middle"], LHR: [-14, 12, "end"], CDG: [-14, 18, "end"], FCO: [20, 6, "start"] };
  Object.keys(C).forEach(function (k) {
    var c = C[k], g = el("g", { transform: "translate(" + (c.x + (k === "NQZ" ? 0 : 0)) + " " + (c.y - 9) + ")" });
    ICONS[k](g);
    el("circle", { cx: c.x, cy: c.y, r: 4, class: "mn-pin" });
    var l = LBL[k];
    txt(c.x + l[0], c.y + l[1], c.n, "mn-city", l[2]);
    txt(c.x + l[0], c.y + l[1] + 12, k, "mn-code", l[2]);
  });

  var D = "M410 190 C 360 70, 160 60, 70 150 C 80 190, 100 210, 120 236 C 150 270, 190 300, 236 316";
  var route = el("path", { d: D, class: "mn-route" });
  var len = route.getTotalLength();
  // точки прибытия на пути
  function near(x, y) { var best = 0, bd = 1e9; for (var s = 0; s <= len; s += 2) { var p = route.getPointAtLength(s), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bd) { bd = d; best = s; } } return best; }
  var ARR = [near(70, 150), near(120, 236), len];

  // штампы
  var ST = [
    { x: 150, y: 120, r: -10, a: "LONDON", b: "UNITED KINGDOM", shape: "rect" },
    { x: 290, y: 225, r: 8, a: "PARIS", b: "FRANCE", shape: "ellipse" },
    { x: 360, y: 312, r: -6, a: "ROMA", b: "ITALIA", shape: "rect" }
  ].map(function (s) {
    var g = el("g", { class: "mn-st", style: "--sr:" + s.r + "deg", transform: "translate(" + s.x + " " + s.y + ")" });
    var inner = el("g", {}, g);
    if (s.shape === "rect") { el("rect", { x: -54, y: -24, width: 108, height: 48, "stroke-width": 2.6 }, inner); el("rect", { x: -49, y: -19, width: 98, height: 38, "stroke-width": 1 }, inner); }
    else { el("ellipse", { cx: 0, cy: 0, rx: 58, ry: 30, "stroke-width": 2.6 }, inner); el("ellipse", { cx: 0, cy: 0, rx: 51, ry: 24, "stroke-width": 1 }, inner); }
    var t1 = el("text", { x: 0, y: -5, "text-anchor": "middle", "font-size": 8.5, "letter-spacing": 2 }, inner); t1.textContent = s.a + " · " + s.b;
    var t2 = el("text", { x: 0, y: 11, "text-anchor": "middle", "font-size": 14, "letter-spacing": 1.5, style: "font-family: var(--serif)" }, inner); t2.textContent = "APPROVED";
    return g;
  });

  var plane = el("path", { d: "M-10 0 L5 -2 L10 0 L5 2 Z M-2 -1 L-5 -8 L-1 -8 L4 -1 Z M-2 1 L-5 8 L-1 8 L4 1 Z M-9 0 L-11 -4 L-8 -4 L-6 0 L-8 4 L-11 4 Z", class: "mn-plane" });
  function place(s) {
    var p = route.getPointAtLength(s), q = route.getPointAtLength(Math.min(len, s + 1)), r = route.getPointAtLength(Math.max(0, s - 1));
    var ang = Math.atan2(q.y - r.y, q.x - r.x) * 180 / Math.PI;
    plane.setAttribute("transform", "translate(" + p.x + " " + p.y + ") rotate(" + ang + ")");
  }
  place(0);

  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { place(len); ST.forEach(function (g) { g.classList.add("is-on"); }); return; }

  var SPEED = 0.11, HOLD = 1100, leg = 0, pos = 0, t0 = null, mode = "fly", raf = null;
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (t0 === null) t0 = ts;
    if (mode === "hold") {
      if (ts - t0 > HOLD) {
        if (leg === ARR.length - 1) { leg = 0; pos = 0; ST.forEach(function (g) { g.classList.remove("is-on"); }); }
        else leg++;
        mode = "fly"; t0 = ts;
      }
      return;
    }
    var from = leg ? ARR[leg - 1] : 0, to = ARR[leg], dur = (to - from) / SPEED;
    var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    pos = from + (to - from) * e; place(pos);
    if (k >= 1) { ST[leg].classList.add("is-on"); mode = "hold"; t0 = ts; }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !raf) { t0 = null; raf = requestAnimationFrame(frame); }
      else if (!es[0].isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(svg);
  } else raf = requestAnimationFrame(frame);
})();
