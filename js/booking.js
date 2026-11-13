/* Finestra "Prenota un incontro" con modulo di contatto.
   Invio tramite Web3Forms (servizio gratuito, 250 richieste al mese).
   Per attivarlo: richiedere la chiave su https://web3forms.com con l'email che deve
   ricevere le richieste e incollarla qui sotto (la chiave è pubblica per natura). */
(function () {
  var ACCESS_KEY = "68d38301-8b98-45d1-a126-e54e0aa5eee6";
  var ENDPOINT = "https://api.web3forms.com/submit";

  var EN = document.documentElement.lang === "en";
  var T = EN ? {
    close: "Close", title: "Book a meeting",
    intro: "Tell us about you and your dog: we will get back to you as soon as possible.",
    subject: "Richiesta di incontro (dal sito in inglese) - Code all'Aria",
    cSubject: "Messaggio dalla pagina Contatti (sito in inglese) - Code all'Aria",
    cIntro: "Write to us: we will reply as soon as possible.",
    cSend: "Send message",
    cOk: "Thank you! We have received your message and will reply as soon as possible.",
    cFail: "We could not send your message. Please try again shortly.",
    name: "Full name", email: "Email", phone: "Phone", optional: "(optional)",
    dog: "Dog's name", message: "Message",
    consent: "I agree to the processing of my data so that I can be contacted. The data is sent through the Web3Forms service and used only to reply to the request.",
    send: "Send request",
    inactive: "The form is not active yet. Please try again shortly.",
    sending: "Sending…",
    ok: "Thank you! We have received your request and will reply as soon as possible.",
    fail: "We could not send your request. Please try again shortly."
  } : {
    close: "Chiudi", title: "Prenota un incontro",
    intro: "Raccontaci di te e del tuo cane: ti risponderemo il prima possibile.",
    subject: "Richiesta di incontro - Code all'Aria",
    cSubject: "Messaggio dalla pagina Contatti - Code all'Aria",
    cIntro: "Scrivici: ti risponderemo il prima possibile.",
    cSend: "Invia messaggio",
    cOk: "Grazie! Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile.",
    cFail: "Non siamo riusciti a inviare il messaggio. Riprova tra poco.",
    name: "Nome e cognome", email: "Email", phone: "Telefono", optional: "(facoltativo)",
    dog: "Nome del cane", message: "Messaggio",
    consent: "Acconsento al trattamento dei miei dati per essere ricontattato. I dati vengono inviati tramite il servizio Web3Forms e usati solo per rispondere alla richiesta.",
    send: "Invia richiesta",
    inactive: "Il modulo non è ancora attivo. Riprova tra poco.",
    sending: "Invio in corso…",
    ok: "Grazie! Abbiamo ricevuto la tua richiesta e ti risponderemo il prima possibile.",
    fail: "Non siamo riusciti a inviare la richiesta. Riprova tra poco."
  };

  // Costruisce il modulo. "contact" = versione della pagina Contatti (senza nome del cane).
  function formHTML(contact) {
    var subject = contact ? T.cSubject : T.subject;
    return '<form class="booking-form" novalidate>' +
      '<input type="hidden" name="access_key" value="">' +
      '<input type="hidden" name="subject" value="' + subject.replace(/'/g, "&#39;") + '">' +
      '<input type="hidden" name="from_name" value="Sito Code all&#39;Aria">' +
      '<input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off">' +
      '<label>' + T.name + '<input type="text" name="name" autocomplete="name" required></label>' +
      '<div class="booking-row">' +
        '<label>' + T.email + '<input type="email" name="email" autocomplete="email" required></label>' +
        '<label><span>' + T.phone + ' <small>' + T.optional + '</small></span><input type="tel" name="phone" autocomplete="tel"></label>' +
      '</div>' +
      (contact ? '' : '<label><span>' + T.dog + ' <small>' + T.optional + '</small></span><input type="text" name="dog"></label>') +
      '<label>' + T.message + '<textarea name="message" rows="' + 4 + '" required></textarea></label>' +
      '<label class="booking-consent"><input type="checkbox" name="consent" required> <span>' + T.consent + '</span></label>' +
      '<p class="booking-status" role="status" aria-live="polite"></p>' +
      '<button type="submit" class="btn btn-orange booking-submit">' + (contact ? T.cSend : T.send) + '</button>' +
    '</form>';
  }

  // Invio con Web3Forms, uguale per la finestra "Prenota" e per la pagina Contatti.
  function wire(form, contact) {
    var status = form.querySelector(".booking-status");
    var submit = form.querySelector(".booking-submit");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "booking-status";
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (ACCESS_KEY.indexOf("INSERISCI") === 0) {
        status.classList.add("error");
        status.textContent = T.inactive;
        return;
      }
      form.elements.access_key.value = ACCESS_KEY;
      submit.disabled = true;
      status.textContent = T.sending;
      fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.success) throw new Error(d.message || "errore");
          form.reset();
          status.classList.add("ok");
          status.textContent = contact ? T.cOk : T.ok;
        })
        .catch(function () {
          status.classList.add("error");
          status.textContent = contact ? T.cFail : T.fail;
        })
        .then(function () { submit.disabled = false; });
    });
  }

  // Finestra "Prenota un incontro"
  var dlg = document.createElement("dialog");
  dlg.id = "prenota";
  dlg.className = "booking";
  dlg.setAttribute("aria-labelledby", "booking-title");
  dlg.innerHTML =
    '<button type="button" class="booking-close" aria-label="' + T.close + '">&times;</button>' +
    '<h2 id="booking-title">' + T.title + '</h2>' +
    '<span class="divider" aria-hidden="true"></span>' +
    '<p class="booking-intro">' + T.intro + '</p>' +
    formHTML(false);
  document.body.appendChild(dlg);
  wire(dlg.querySelector("form"), false);

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

  // Modulo nella pagina Contatti
  var slot = document.getElementById("contact-form");
  if (slot) {
    slot.innerHTML = '<p class="booking-intro">' + T.cIntro + '</p>' + formHTML(true);
    wire(slot.querySelector("form"), true);
  }
})();
