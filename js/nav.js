/* Versione scura: interruttore accanto a "Prenota ora", la scelta resta salvata */
(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  var EN = root.lang === "en";
  var LBL_LIGHT = EN ? "Switch back to light mode" : "Torna alla versione chiara";
  var LBL_DARK = EN ? "Switch to dark mode" : "Attiva la versione scura";
  function sync() {
    var dark = root.getAttribute("data-theme") === "dark";
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute("aria-label", dark ? LBL_LIGHT : LBL_DARK);
  }
  sync();
  btn.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") !== "dark";
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    sync();
  });
})();

/* Menu a tendina per gli schermi stretti */
(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;
  var EN = document.documentElement.lang === "en";

  function setOpen(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? (EN ? "Close the menu" : "Chiudi il menu") : (EN ? "Open the menu" : "Apri il menu"));
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("menu-open"));
  });
  header.querySelectorAll(".nav a").forEach(function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) setOpen(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1100) setOpen(false);
  });
})();
