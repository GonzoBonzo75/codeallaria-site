/* Pagina "I nostri percorsi": ogni cerchio con contenuto apre la sua scheda */
(function () {
  document.querySelectorAll("[data-dialog]").forEach(function (btn) {
    var dlg = document.getElementById(btn.getAttribute("data-dialog"));
    if (!dlg) return;
    btn.addEventListener("click", function () {
      if (typeof dlg.showModal === "function" && !dlg.open) dlg.showModal();
    });
    var x = dlg.querySelector(".booking-close");
    if (x) x.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  });
})();
