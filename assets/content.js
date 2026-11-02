// Подбор документов, шаги работы, справка (FAQ).
// ВАЖНО: списки документов общие. Перед запуском их должны проверить владельцы VisaFast.
(function () {
  var lang = "ru";
  var EU = '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#003399"/>' +
    (function () { var s = ""; for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; s += '<circle cx="' + (15 + Math.cos(a) * 6).toFixed(2) + '" cy="' + (10 + Math.sin(a) * 6).toFixed(2) + '" r="1" fill="#FFCC00"/>'; } return s; })() + '</svg>';

  // ---------- данные подбора ----------
  var OPT = {
    country: [["schengen", "Шенген", "Шенген"], ["uk", "Великобритания", "Ұлыбритания"]],
    purpose: [["tourism", "Туризм", "Туризм"], ["guest", "В гости", "Қонаққа"], ["business", "Деловая поездка", "Іскерлік сапар"]],
    status: [["employed", "Работаю по найму", "Жалдамалы жұмыс"], ["ip", "ИП", "ЖК"], ["student", "Студент или школьник", "Студент не оқушы"], ["pension", "Пенсионер", "Зейнеткер"], ["none", "Не работаю", "Жұмыс істемеймін"]]
  };
  var D = {
    base: {
      schengen: [
        ["Загранпаспорт: действует ещё 3 месяца после возвращения, выдан не более 10 лет назад, есть 2 чистые страницы", "Шетелдік төлқұжат: оралғаннан кейін тағы 3 ай жарамды, 10 жылдан бұрын берілмеген, 2 бос беті бар"],
        ["Фото 3,5 × 4,5 см на светлом фоне", "3,5 × 4,5 см фото, ашық түсті фонда"],
        ["Удостоверение личности", "Жеке куәлік"],
        ["Медицинская страховка на всю поездку с покрытием от 30 000 €", "Бүкіл сапарға 30 000 € бастап өтемі бар медициналық сақтандыру"],
        ["Бронь авиабилетов туда и обратно", "Барып-қайту әуе билеттерінің брондауы"],
        ["Выписка с банковского счёта за последние месяцы", "Соңғы айлардағы банк шотынан үзінді"]
      ],
      uk: [
        ["Загранпаспорт, действующий на весь срок поездки, и старые паспорта с визами, если есть", "Бүкіл сапарға жарамды шетелдік төлқұжат, бар болса визалары бар ескі төлқұжаттар"],
        ["Удостоверение личности", "Жеке куәлік"],
        ["Выписка с банковского счёта за последние 6 месяцев", "Соңғы 6 айдағы банк шотынан үзінді"],
        ["Документы о собственности и семейном положении: подтверждают, что вы вернётесь домой", "Меншік және отбасылық жағдай туралы құжаттар: үйге қайтатыныңызды растайды"],
        ["План поездки: даты, города, бронь жилья", "Сапар жоспары: күндер, қалалар, тұрғын үй брондауы"]
      ]
    },
    purpose: {
      tourism: [["Бронь гостиницы на все ночи поездки", "Сапардың барлық түніне қонақ үй брондауы"]],
      guest: [["Приглашение от родственников или друзей и копия их документа о пребывании в стране", "Туыстарыңыздан не достарыңыздан шақыру және олардың елде болу құжатының көшірмесі"]],
      business: [["Приглашение от принимающей компании", "Қабылдаушы компаниядан шақыру"], ["Письмо от вашего работодателя о цели командировки", "Жұмыс берушіңізден іссапар мақсаты туралы хат"]]
    },
    status: {
      employed: [["Справка с работы: должность, зарплата, стаж, согласие на отпуск", "Жұмыстан анықтама: лауазым, жалақы, еңбек өтілі, демалысқа келісім"]],
      ip: [["Талон или свидетельство о регистрации ИП", "ЖК тіркеу талоны немесе куәлігі"], ["Налоговая декларация или выписка по счёту ИП", "Салық декларациясы немесе ЖК шотынан үзінді"]],
      student: [["Справка с места учёбы", "Оқу орнынан анықтама"], ["Спонсорское письмо от родителей и их справка с работы и выписка", "Ата-анадан демеушілік хат, олардың жұмыстан анықтамасы мен үзіндісі"], ["Для несовершеннолетних: согласие второго родителя на выезд и свидетельство о рождении", "Кәмелетке толмағандар үшін: екінші ата-ананың шығуға келісімі және туу туралы куәлік"]],
      pension: [["Пенсионное удостоверение или справка о пенсии", "Зейнеткерлік куәлік немесе зейнетақы туралы анықтама"]],
      none: [["Спонсорское письмо от родственника", "Туысыңыздан демеушілік хат"], ["Справка с работы и выписка спонсора", "Демеушінің жұмыстан анықтамасы мен үзіндісі"], ["Документ о родстве со спонсором", "Демеушімен туыстықты растайтын құжат"]]
    },
    tail: {
      schengen: [["Анкету заполним мы", "Сауалнаманы біз толтырамыз"]],
      uk: [["Онлайн-анкету и запись на биометрию оформим мы", "Онлайн сауалнама мен биометрияға жазылуды біз рәсімдейміз"]]
    }
  };
  var sel = { country: "schengen", purpose: "tourism", status: "employed" };
  var L = function (pair) { return lang === "kk" ? pair[1] : pair[0]; };

  function renderPicker() {
    var form = document.getElementById("picker");
    if (!form) return;
    Object.keys(OPT).forEach(function (name) {
      var box = form.querySelector('.seg[data-name="' + name + '"]');
      box.innerHTML = "";
      OPT[name].forEach(function (o) {
        var id = "pk-" + name + "-" + o[0];
        var inp = document.createElement("input");
        inp.type = "radio"; inp.name = name; inp.id = id; inp.value = o[0]; inp.checked = sel[name] === o[0];
        var lab = document.createElement("label"); lab.htmlFor = id; lab.textContent = lang === "kk" ? o[2] : o[1];
        box.appendChild(inp); box.appendChild(lab);
      });
    });
    renderSheet();
  }
  function items() {
    return [].concat(D.base[sel.country], D.purpose[sel.purpose], D.status[sel.status], D.tail[sel.country]).map(L);
  }
  function label(name) { var o = OPT[name].filter(function (x) { return x[0] === sel[name]; })[0]; return lang === "kk" ? o[2] : o[1]; }
  function renderSheet() {
    var list = document.querySelector(".sheet__list"); if (!list) return;
    var arr = items();
    list.innerHTML = arr.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    document.querySelector(".sheet__for").textContent = label("country") + " · " + label("purpose") + " · " + label("status");
    var t = window.I18N[lang];
    var msg = t["docs.waIntro"] + "\n" + label("country") + ", " + label("purpose").toLowerCase() + ", " + label("status").toLowerCase() + "\n\n" +
      arr.map(function (x, i) { return (i + 1) + ". " + x; }).join("\n");
    var a = document.querySelector("[data-wa-docs]");
    if (a) a.href = "https://wa.me/" + (window.VF_WA || "77075123838") + "?text=" + encodeURIComponent(msg);
  }
  var pf = document.getElementById("picker");
  if (pf) pf.addEventListener("change", function (e) { if (e.target.name) { sel[e.target.name] = e.target.value; renderSheet(); } });

  // ---------- шаги ----------
  var STEPS = [
    [["Заявка", "Өтінім"], ["Разбираем вашу ситуацию и честно говорим, какие шансы и какую визу лучше оформлять", "Жағдайыңызды талдап, мүмкіндіктер мен қандай виза жақсы екенін адал айтамыз"], ["Написать в WhatsApp или прийти в офис", "WhatsApp-қа жазу немесе кеңсеге келу"]],
    [["Документы", "Құжаттар"], ["Даём точный список под вас и проверяем каждую бумагу, пока всё не будет в порядке", "Сізге арналған нақты тізім береміз және бәрі дұрыс болғанша әр қағазды тексереміз"], ["Собрать справки и выписки. Это самая долгая часть, и от неё зависит скорость", "Анықтамалар мен үзінділерді жинау. Бұл ең ұзақ кезең, жылдамдық соған байланысты"]],
    [["Анкета и запись", "Сауалнама және жазылу"], ["Заполняем анкету и записываем вас на подачу на удобную дату", "Сауалнаманы толтырып, ыңғайлы күнге тапсыруға жазамыз"], ["Оплатить консульский сбор", "Консулдық алымды төлеу"]],
    [["Подача", "Тапсыру"], ["Собираем папку в нужном порядке и объясняем, что взять с собой", "Папканы дұрыс ретпен жинап, өзіңізбен не алу керегін түсіндіреміз"], ["Лично прийти в визовый центр и сдать отпечатки пальцев", "Виза орталығына өзіңіз келіп, саусақ ізін тапсыру"]],
    [["Решение", "Шешім"], ["Следим за статусом и сообщаем, когда паспорт готов", "Мәртебені қадағалап, төлқұжат дайын болғанда хабарлаймыз"], ["Забрать паспорт", "Төлқұжатты алу"]]
  ];
  function renderSteps() {
    var ol = document.querySelector(".steps"); if (!ol) return;
    var t = window.I18N[lang];
    ol.innerHTML = STEPS.map(function (s, i) {
      return '<li class="step"><span class="step__n">' + (i + 1) + '</span><h3>' + L(s[0]) + '</h3>' +
        '<div class="step__col"><span>' + t["process.we"] + '</span><p>' + L(s[1]) + '</p></div>' +
        '<div class="step__col step__col--you"><span>' + t["process.you"] + '</span><p>' + L(s[2]) + '</p></div></li>';
    }).join("");
  }

  // ---------- справка ----------
  var FAQ = [
    ["cost", ["Сколько стоит оформление?", "Рәсімдеу қанша тұрады?"], ["Наша услуга: Шенген 30 000 – 40 000 ₸, Великобритания 55 000 – 80 000 ₸. Консульский сбор оплачивается отдельно по тарифу консульства. Точную сумму назовём после разговора.", "Біздің қызмет: Шенген 30 000 – 40 000 ₸, Ұлыбритания 55 000 – 80 000 ₸. Консулдық алым консулдық тарифі бойынша бөлек төленеді. Нақты соманы әңгімеден кейін айтамыз."]],
    ["time", ["Сколько времени занимает?", "Қанша уақыт алады?"], ["Зависит от консульства и свободных дат записи. Шенгенские заявления обычно рассматривают до 15 календарных дней, британские около 3 недель. Лучше начинать за 1–2 месяца до поездки.", "Консулдыққа және жазылудың бос күндеріне байланысты. Шенген өтініштері әдетте 15 күнтізбелік күнге дейін, британдық өтініштер шамамен 3 апта қаралады. Сапардан 1–2 ай бұрын бастаған дұрыс."]],
    ["nojob", ["Можно без справки с работы?", "Жұмыстан анықтамасыз болады ма?"], ["Да. ИП показывают регистрацию и налоговые документы, пенсионеры пенсионное удостоверение, а студенты и неработающие оформляются через спонсорское письмо от родственника.", "Иә. ЖК тіркеу мен салық құжаттарын, зейнеткерлер зейнеткерлік куәлігін көрсетеді, ал студенттер мен жұмыс істемейтіндер туысынан демеушілік хат арқылы рәсімделеді."]],
    ["refusal", ["Что если откажут в визе?", "Визадан бас тартса ше?"], ["Консульский сбор при отказе не возвращается, таковы правила консульств. Мы разберём причину отказа и подскажем, когда и с какими документами подаваться снова.", "Бас тартқан жағдайда консулдық алым қайтарылмайды, бұл консулдықтардың ережесі. Біз бас тарту себебін талдап, қашан және қандай құжаттармен қайта тапсыру керегін айтамыз."]],
    ["guarantee", ["Вы гарантируете визу?", "Визаға кепілдік бересіз бе?"], ["Нет. Решение принимает только консульство, и честный визовый центр не может его гарантировать. Мы отвечаем за то, чтобы документы были собраны правильно и без ошибок.", "Жоқ. Шешімді тек консулдық қабылдайды, адал виза орталығы оған кепілдік бере алмайды. Біз құжаттардың дұрыс және қатесіз жиналуына жауаптымыз."]],
    ["visit", ["Нужно ли приходить в офис?", "Кеңсеге келу керек пе?"], ["В наш офис не обязательно: всё можно сделать через WhatsApp из любого города Казахстана. Лично нужно прийти только в визовый центр на подачу и отпечатки пальцев.", "Біздің кеңсеге міндетті емес: бәрін Қазақстанның кез келген қаласынан WhatsApp арқылы жасауға болады. Өзіңіз тек виза орталығына тапсыру мен саусақ ізіне келуіңіз керек."]],
    ["insurance", ["Нужна ли страховка?", "Сақтандыру керек пе?"], ["Для Шенгена да: медицинская страховка на всю поездку с покрытием от 30 000 €. Для Великобритании страховка не обязательна, но мы советуем её оформить.", "Шенген үшін иә: бүкіл сапарға 30 000 € бастап өтемі бар медициналық сақтандыру. Ұлыбритания үшін міндетті емес, бірақ рәсімдеуге кеңес береміз."]],
    ["kids", ["Как оформить визу ребёнку?", "Балаға визаны қалай рәсімдеуге болады?"], ["Нужны свидетельство о рождении, документы родителей и нотариальное согласие второго родителя, если ребёнок едет не с обоими. Подробный список дадим под вашу ситуацию.", "Туу туралы куәлік, ата-ананың құжаттары және бала екеуімен бармаса, екінші ата-ананың нотариалдық келісімі керек. Толық тізімді жағдайыңызға қарай береміз."]]
  ];
  function renderFaq() {
    var box = document.getElementById("faq-list"); if (!box) return;
    box.innerHTML = FAQ.map(function (f) {
      return '<details id="faq-' + f[0] + '"><summary>' + L(f[1]) + '</summary><p>' + L(f[2]) + '</p></details>';
    }).join("");
    filterFaq();
  }
  function filterFaq() {
    var q = (document.getElementById("faq-q") || {}).value || "", n = 0;
    q = q.trim().toLowerCase();
    document.querySelectorAll("#faq-list details").forEach(function (d) {
      var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
      d.hidden = !hit; if (hit) n++;
      if (q && hit) d.open = true;
    });
    var empty = document.getElementById("faq-empty"); if (empty) empty.hidden = n > 0;
  }
  var qi = document.getElementById("faq-q");
  if (qi) qi.addEventListener("input", filterFaq);

  // открытие и закрытие справки
  var drawer = document.getElementById("help"), lastFocus = null;
  function openHelp(hash) {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false; document.documentElement.classList.add("no-scroll");
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    var target = hash && document.getElementById(hash);
    if (target) { target.open = true; target.scrollIntoView({ block: "center" }); }
    setTimeout(function () { (qi || drawer.querySelector(".drawer__panel")).focus(); }, 50);
  }
  function closeHelp() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open"); document.documentElement.classList.remove("no-scroll");
    setTimeout(function () { drawer.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open-help]");
    if (o) { e.preventDefault(); openHelp(o.getAttribute("data-faq")); return; }
    if (e.target.closest("[data-close]")) closeHelp();
  });
  document.addEventListener("keydown", function (e) {
    if (!drawer || drawer.hidden) return;
    if (e.key === "Escape") closeHelp();
    if (e.key === "Tab") {
      var f = drawer.querySelectorAll("button, input, summary, a[href]");
      f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  if (/^#faq-/.test(location.hash)) openHelp(location.hash.slice(1));

  // флаги в таблице цен
  document.querySelectorAll("[data-flag]").forEach(function (s) {
    var k = s.getAttribute("data-flag");
    s.innerHTML = k === "eu" ? EU : ((window.VF_FLAGS || {})[k] || "");
  });

  // «Сейчас открыто»: время Астаны UTC+5
  function renderOpen() {
    var el = document.getElementById("open-now"); if (!el) return;
    var now = new Date(Date.now() + 5 * 3600e3), d = now.getUTCDay(), m = now.getUTCHours() * 60 + now.getUTCMinutes();
    var open = d >= 1 && d <= 5 && m >= 540 && m < 1080, t = window.I18N[lang];
    el.textContent = t[open ? "office.open" : "office.closed"];
    el.classList.toggle("is-open", open);
    document.querySelectorAll(".hours__list [data-days]").forEach(function (r) {
      r.classList.toggle("is-today", r.getAttribute("data-days").split(",").indexOf(String(d)) !== -1);
    });
  }

  window.VF_CONTENT = { setLang: function (l) { lang = l === "kk" ? "kk" : "ru"; renderPicker(); renderSteps(); renderFaq(); renderOpen(); } };
  renderPicker(); renderSteps(); renderFaq(); renderOpen();
})();
