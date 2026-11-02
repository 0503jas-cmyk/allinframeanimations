(function () {
  var WA_NUMBER = "77075123838";
  window.VF_WA = WA_NUMBER;
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

    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); if (t[k] != null) el.setAttribute("placeholder", t[k]);
    });
    document.querySelectorAll("[data-wa-country]").forEach(function (a) {
      var k = "wa." + a.getAttribute("data-wa-country");
      a.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(t[k] || t["wa.text"]);
    });
    if (window.VF_HERO) window.VF_HERO.setLang(lang);
    if (window.VF_CONTENT) window.VF_CONTENT.setLang(lang);

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
  // подстраховка при быстрой прокрутке: всё, что выше нижнего края экрана, показываем
  window.addEventListener("scroll", function () {
    rv.forEach(function (el) { if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in"); });
  }, { passive: true });

  // выбор одного из двух номеров WhatsApp
  var pick = document.getElementById("wa-pick"), pickFrom = null;
  function closePick() { if (!pick || pick.hidden) return; pick.hidden = true; if (pickFrom) pickFrom.focus(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="https://wa.me/"]');
    if (a && pick && !a.closest("#wa-pick")) {
      e.preventDefault();
      var q = a.href.indexOf("?") > -1 ? a.href.slice(a.href.indexOf("?")) : "";
      pick.querySelectorAll(".wa-pick__opt").forEach(function (o) { o.href = "https://wa.me/" + o.getAttribute("data-num") + q; });
      pickFrom = a; pick.hidden = false;
      pick.querySelector(".wa-pick__opt").focus();
      return;
    }
    if (e.target.closest("[data-wa-close]") || e.target.closest(".wa-pick__opt")) setTimeout(closePick, 0);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePick(); });

  var fromUrl = new URLSearchParams(location.search).get("lang");
  apply(fromUrl || getSaved() || "ru");
})();
