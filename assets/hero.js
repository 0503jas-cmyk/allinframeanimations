// Флаги и падающие паспорта на первом экране
(function () {
  var F = {
    fr: '<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>',
    it: '<svg viewBox="0 0 3 2"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#CE2B37"/></svg>',
    de: '<svg viewBox="0 0 5 3"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#DD0000"/><rect y="2" width="5" height="1" fill="#FFCE00"/></svg>',
    es: '<svg viewBox="0 0 3 2"><rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/></svg>',
    gb: '<svg viewBox="0 0 60 30" preserveAspectRatio="none"><clipPath id="gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#gbt)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>',
    cz: '<svg viewBox="0 0 6 4"><rect width="6" height="2" fill="#fff"/><rect y="2" width="6" height="2" fill="#D7141A"/><path d="M0 0 L3 2 L0 4 Z" fill="#11457E"/></svg>',
    gr: '<svg viewBox="0 0 27 18"><rect width="27" height="18" fill="#0D5EAF"/><path d="M0 3h27M0 7h27M0 11h27M0 15h27" stroke="#fff" stroke-width="2"/><rect width="10" height="10" fill="#0D5EAF"/><path d="M5 0v10M0 5h10" stroke="#fff" stroke-width="2"/></svg>',
    at: '<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="3" fill="#C8102E"/><rect y="1" width="3" height="1" fill="#fff"/></svg>',
    nl: '<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="1" fill="#AE1C28"/><rect y="1" width="3" height="1" fill="#fff"/><rect y="2" width="3" height="1" fill="#21468B"/></svg>',
    hu: '<svg viewBox="0 0 3 3" preserveAspectRatio="none"><rect width="3" height="1" fill="#CD2A3E"/><rect y="1" width="3" height="1" fill="#fff"/><rect y="2" width="3" height="1" fill="#436F4D"/></svg>',
    pl: '<svg viewBox="0 0 8 5"><rect width="8" height="5" fill="#DC143C"/><rect width="8" height="2.5" fill="#fff"/></svg>',
    ch: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#DA291C"/><path d="M13 4h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill="#fff"/></svg>'
  };

  var COUNTRIES = [
    { k: "gb", ru: "Великобритания", kk: "Ұлыбритания", en: "UNITED KINGDOM", city: "LONDON", c: "#A4452C", shape: "circle" },
    { k: "fr", ru: "Франция", kk: "Франция", en: "FRANCE", city: "PARIS", c: "#2D4E6E", shape: "rect" },
    { k: "it", ru: "Италия", kk: "Италия", en: "ITALIA", city: "ROMA", c: "#3F6B4F", shape: "oval" },
    { k: "de", ru: "Германия", kk: "Германия", en: "DEUTSCHLAND", city: "BERLIN", c: "#7A2E3A", shape: "circle" },
    { k: "es", ru: "Испания", kk: "Испания", en: "ESPAÑA", city: "MADRID", c: "#A4452C", shape: "rect" },
    { k: "cz", ru: "Чехия", kk: "Чехия", en: "ČESKO", city: "PRAHA", c: "#2D4E6E", shape: "oval" },
    { k: "gr", ru: "Греция", kk: "Грекия", en: "HELLAS", city: "ATHINA", c: "#3F6B4F", shape: "circle" },
    { k: "at", ru: "Австрия", kk: "Австрия", en: "ÖSTERREICH", city: "WIEN", c: "#7A2E3A", shape: "rect" },
    { k: "nl", ru: "Нидерланды", kk: "Нидерланд", en: "NEDERLAND", city: "AMSTERDAM", c: "#A4452C", shape: "oval" },
    { k: "hu", ru: "Венгрия", kk: "Венгрия", en: "MAGYARORSZÁG", city: "BUDAPEST", c: "#2D4E6E", shape: "circle" },
    { k: "pl", ru: "Польша", kk: "Польша", en: "POLSKA", city: "WARSZAWA", c: "#3F6B4F", shape: "rect" },
    { k: "ch", ru: "Швейцария", kk: "Швейцария", en: "SCHWEIZ", city: "ZÜRICH", c: "#7A2E3A", shape: "oval" }
  ];

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var uid = 0;

  // защитный узор паспорта в фон
  (function () {
    var d = "";
    for (var i = 0; i < 34; i++) {
      var y0 = 10 + i * 18, amp = 9 + (i % 5) * 3, ph = i * 0.55, s = "";
      for (var x = 0; x <= 400; x += 6) {
        var y = y0 + Math.sin(x / 34 + ph) * amp + Math.sin(x / 12 + ph * 2) * 2.2;
        s += (x ? " L" : "M") + x + " " + y.toFixed(1);
      }
      d += '<path d="' + s + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" preserveAspectRatio="none"><g fill="none" stroke="#6E8A86" stroke-width=".55" opacity=".42">' + d + '</g></svg>';
    document.documentElement.style.setProperty("--guil", 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
  })();

  function stampSVG(c) {
    var id = "sp" + (uid++), top = c.city + " · " + c.en + " · ", body;
    if (c.shape === "rect") {
      body = '<rect class="ln" x="4" y="34" width="152" height="92" stroke-width="3.5"/><rect class="ln" x="12" y="42" width="136" height="76" stroke-width="1.3"/>' +
        '<text x="80" y="66" text-anchor="middle" font-family="Golos Text,sans-serif" font-size="11" font-weight="600" letter-spacing="2.4">' + c.en + '</text>' +
        '<text x="80" y="92" text-anchor="middle" font-family="Literata,serif" font-size="21" font-weight="600" letter-spacing="1.5">APPROVED</text>' +
        '<text x="80" y="110" text-anchor="middle" font-family="Golos Text,sans-serif" font-size="10" font-weight="600" letter-spacing="2">' + c.city + '</text>';
    } else if (c.shape === "oval") {
      body = '<ellipse class="ln" cx="80" cy="80" rx="76" ry="52" stroke-width="3.5"/><ellipse class="ln" cx="80" cy="80" rx="66" ry="43" stroke-width="1.2"/>' +
        '<text x="80" y="66" text-anchor="middle" font-family="Golos Text,sans-serif" font-size="10.5" font-weight="600" letter-spacing="2.2">' + c.city + '</text>' +
        '<text x="80" y="90" text-anchor="middle" font-family="Literata,serif" font-size="19" font-weight="600" letter-spacing="1.2">APPROVED</text>' +
        '<text x="80" y="106" text-anchor="middle" font-family="Golos Text,sans-serif" font-size="9" font-weight="600" letter-spacing="2">' + c.en + '</text>';
    } else {
      body = '<circle class="ln" cx="80" cy="80" r="76" stroke-width="3.5"/><circle class="ln" cx="80" cy="80" r="52" stroke-width="1.2"/>' +
        '<defs><path id="' + id + '" d="M80 80 m-64 0 a64 64 0 1 1 128 0 a64 64 0 1 1 -128 0"/></defs>' +
        '<text font-family="Golos Text,sans-serif" font-size="11" font-weight="600" letter-spacing="2.6"><textPath href="#' + id + '">' + top + top + '</textPath></text>' +
        '<text x="80" y="86" text-anchor="middle" font-family="Literata,serif" font-size="17" font-weight="600" letter-spacing="1">APPROVED</text>';
    }
    return '<svg viewBox="0 0 160 160">' + body + '</svg>';
  }

  var lang = "ru";

  // флаги
  var track = document.querySelector(".flags__track");
  function renderFlags() {
    if (!track) return;
    var html = "";
    for (var r = 0; r < 3; r++) COUNTRIES.forEach(function (c, i) {
      html += '<span class="fl" style="--i:' + i + '">' + F[c.k] + c[lang] + '</span>';
    });
    track.innerHTML = html;
  }

  // падающие паспорта
  var pile = document.querySelector(".pile");
  var idx = 0, MAX = 4;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function addPassport() {
    if (!pile) return;
    var c = COUNTRIES[idx++ % COUNTRIES.length];
    var el = document.createElement("div");
    el.className = "pp";
    el.style.setProperty("--dx", rnd(-22, 22).toFixed(0) + "px");
    el.style.setProperty("--dy", rnd(-12, 14).toFixed(0) + "px");
    el.style.setProperty("--r", rnd(-9, 9).toFixed(1) + "deg");
    el.innerHTML =
      '<div class="pp__head"><span class="pp__label">ВИЗА · VISA</span><span class="pp__flag">' + F[c.k] + '</span></div>' +
      '<p class="pp__country">' + c.en + '</p>' +
      '<div class="pp__rows">Type · C<br>Entries · MULT<br>Issued · ASTANA</div>' +
      '<div class="pp__mrz">V&lt;' + c.k.toUpperCase() + 'VISAFAST&lt;&lt;ASTANA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>' +
      '<div class="pp__stamp" style="--c:' + c.c + ';--sr:' + rnd(-20, 14).toFixed(0) + 'deg">' + stampSVG(c) + '</div>';
    pile.appendChild(el);
    var cards = pile.querySelectorAll(".pp:not(.is-out)");
    if (cards.length > MAX) {
      var old = cards[0]; old.classList.add("is-out");
      setTimeout(function () { old.remove(); }, 750);
    }
  }

  if (pile) {
    if (reduce) { for (var i = 0; i < 3; i++) addPassport(); }
    else {
      var timer = null, onScreen = true, hero = document.querySelector(".hero");
      function run() { if (!timer && onScreen && !document.hidden) timer = setInterval(addPassport, 2300); }
      function stop() { clearInterval(timer); timer = null; }
      addPassport(); run();
      document.addEventListener("visibilitychange", function () { document.hidden ? stop() : run(); });
      if ("IntersectionObserver" in window && hero) {
        new IntersectionObserver(function (es) {
          onScreen = es[0].isIntersecting;
          hero.classList.toggle("is-paused", !onScreen);
          onScreen ? run() : stop();
        }).observe(hero);
      }
    }
  }

  window.VF_HERO = { setLang: function (l) { lang = l === "kk" ? "kk" : "ru"; renderFlags(); } };
  renderFlags();
})();
