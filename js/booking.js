/* Finestra "Prenota un incontro" con modulo di contatto.
   Invio tramite Web3Forms (servizio gratuito, 250 richieste al mese).
   Per attivarlo: richiedere la chiave su https://web3forms.com con l'email che deve
   ricevere le richieste e incollarla qui sotto (la chiave è pubblica per natura). */
(function () {
  var ACCESS_KEY = "68d38301-8b98-45d1-a126-e54e0aa5eee6";
  var ENDPOINT = "https://api.web3forms.com/submit";

  var dlg = document.createElement("dialog");
  dlg.id = "prenota";
  dlg.className = "booking";
  dlg.setAttribute("aria-labelledby", "booking-title");
  dlg.innerHTML =
    '<button type="button" class="booking-close" aria-label="Chiudi">&times;</button>' +
    '<h2 id="booking-title">Prenota un incontro</h2>' +
    '<span class="divider" aria-hidden="true"></span>' +
    '<p class="booking-intro">Raccontaci di te e del tuo cane: ti risponderemo il prima possibile.</p>' +
    '<form class="booking-form" novalidate>' +
      '<input type="hidden" name="access_key" value="">' +
      '<input type="hidden" name="subject" value="Richiesta di incontro - Code all\'Aria">' +
      '<input type="hidden" name="from_name" value="Sito Code all\'Aria">' +
      '<input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off">' +
      '<label>Nome e cognome<input type="text" name="name" autocomplete="name" required></label>' +
      '<div class="booking-row">' +
        '<label>Email<input type="email" name="email" autocomplete="email" required></label>' +
        '<label><span>Telefono <small>(facoltativo)</small></span><input type="tel" name="phone" autocomplete="tel"></label>' +
      '</div>' +
      '<label><span>Nome del cane <small>(facoltativo)</small></span><input type="text" name="dog"></label>' +
      '<label>Messaggio<textarea name="message" rows="4" required placeholder="Ad esempio: giorni e orari che preferisci, età e razza del cane, cosa vorresti lavorare insieme."></textarea></label>' +
      '<label class="booking-consent"><input type="checkbox" name="consent" required> <span>Acconsento al trattamento dei miei dati per essere ricontattato. I dati vengono inviati tramite il servizio Web3Forms e usati solo per rispondere alla richiesta.</span></label>' +
      '<p class="booking-status" role="status" aria-live="polite"></p>' +
      '<button type="submit" class="btn btn-orange booking-submit">Invia richiesta</button>' +
    '</form>';
  document.body.appendChild(dlg);

  var form = dlg.querySelector("form");
  var status = dlg.querySelector(".booking-status");
  var submit = dlg.querySelector(".booking-submit");

  function open(e) {
    if (e) e.preventDefault();
    if (typeof dlg.showModal === "function" && !dlg.open) dlg.showModal();
  }
  function close() { if (dlg.open) dlg.close(); }

  document.querySelectorAll("[data-booking]").forEach(function (el) {
    el.addEventListener("click", open);
  });
  dlg.querySelector(".booking-close").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  if (location.hash === "#prenota") open();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "booking-status";
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (ACCESS_KEY.indexOf("INSERISCI") === 0) {
      status.classList.add("error");
      status.textContent = "Il modulo non è ancora attivo. Riprova tra poco.";
      return;
    }
    form.elements.access_key.value = ACCESS_KEY;
    submit.disabled = true;
    status.textContent = "Invio in corso…";
    fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success) throw new Error(d.message || "errore");
        form.reset();
        status.classList.add("ok");
        status.textContent = "Grazie! Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.";
      })
      .catch(function () {
        status.classList.add("error");
        status.textContent = "Non siamo riusciti a inviare la richiesta. Riprova tra poco.";
      })
      .then(function () { submit.disabled = false; });
  });
})();
