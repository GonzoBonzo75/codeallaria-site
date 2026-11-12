/* Menu della home a scorrimento: evidenzia la voce della sezione visibile */
(function () {
  var links = document.querySelectorAll(".nav a[href^='#']");
  if (!links.length || !("IntersectionObserver" in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  var current = null;
  function setActive(id) {
    if (current === id || !map[id]) return;
    current = id;
    links.forEach(function (a) {
      var on = a === map[id];
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(map).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) io.observe(s);
  });
})();
