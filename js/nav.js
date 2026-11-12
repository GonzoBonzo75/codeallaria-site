/* Menu a tendina per gli schermi stretti */
(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;

  function setOpen(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
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
