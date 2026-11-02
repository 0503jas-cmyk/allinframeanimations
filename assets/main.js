(function () {
  var WA_NUMBER = "77075123838";
  var dict = window.I18N;

  function getSaved() {
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }
  function save(lang) {
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  function apply(lang) {
    if (!dict[lang]) lang = "ru";
    var t = dict[lang];
    document.documentElement.lang = lang === "kk" ? "kk" : "ru";
    document.title = t["meta.title"];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });

    var waHref = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(t["wa.text"]);
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (t[k] != null) el.setAttribute("aria-label", t[k]);
    });
    current = lang;
    syncMenu();

    document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waHref; });

    if (window.VF_HERO) window.VF_HERO.setLang(lang);

    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  var current = "ru";
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  function syncMenu() {
    var open = nav.classList.contains("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = dict[current][open ? "nav.close" : "nav.menu"];
  }
  menuBtn.addEventListener("click", function () { nav.classList.toggle("is-open"); syncMenu(); });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("is-open"); syncMenu(); }
  });

  var dock = document.querySelector(".dock");
  var cta = document.querySelector(".hero .cta");
  if ("IntersectionObserver" in window && cta) {
    new IntersectionObserver(function (es) {
      dock.classList.toggle("is-on", !es[0].isIntersecting && es[0].boundingClientRect.top < 0);
    }).observe(cta);
  } else { dock.classList.add("is-on"); }

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      var lang = b.getAttribute("data-lang");
      save(lang);
      apply(lang);
    });
  });

  // scroll reveal
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("is-in"); }); }

  var fromUrl = new URLSearchParams(location.search).get("lang");
  apply(fromUrl || getSaved() || "ru");
})();
