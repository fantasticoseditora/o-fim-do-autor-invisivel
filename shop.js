"use strict";

const offer = Object.freeze({
  checkout: "",
  priceInCents: 2990,
  pixel: "582682536736610"
});

const checkoutLinks = document.querySelectorAll("[data-checkout]");
const prices = document.querySelectorAll("[data-price]");
const trackingKeys = /^(utm_[a-z0-9_]+|fbclid|src|sck)$/i;

if (Number.isSafeInteger(offer.priceInCents) && offer.priceInCents > 0) {
  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  for (const element of prices) {
    element.textContent = price.format(offer.priceInCents / 100);
    element.hidden = false;
  }
}

if (offer.checkout && Number.isSafeInteger(offer.priceInCents) && offer.priceInCents > 0) {
  const target = new URL(offer.checkout);
  if (target.protocol === "https:" && target.hostname === "pay.kiwify.com.br") {
    for (const [key, value] of new URLSearchParams(location.search)) {
      if (trackingKeys.test(key)) target.searchParams.append(key, value);
    }
    for (const link of checkoutLinks) {
      link.href = target.href;
      link.hidden = false;
    }
  }
}

const consent = document.querySelector("[data-consent]");
const preferences = document.querySelector("[data-prefs]");
const consentKey = "fantasticos-autor-invisivel-meta";
let pixelStarted = false;

function startPixel() {
  if (pixelStarted) {
    window.fbq("consent", "grant");
    return;
  }

  const fbq = function () {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
    else fbq.queue.push(arguments);
  };
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/pt_BR/fbevents.js";
  document.head.append(script);
  fbq("init", offer.pixel);
  fbq("track", "PageView");
  fbq("track", "ViewContent", {
    content_name: "O Fim do Autor Invisível",
    content_ids: ["o-fim-do-autor-invisivel"],
    content_type: "product"
  });
  pixelStarted = true;
}

function readConsent() {
  try { return localStorage.getItem(consentKey); }
  catch { return null; }
}

consent.hidden = readConsent() !== null;
if (readConsent() === "allow") startPixel();

preferences.addEventListener("click", () => {
  consent.hidden = false;
  consent.querySelector("button").focus();
});

for (const button of consent.querySelectorAll("[data-choice]")) {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    try { localStorage.setItem(consentKey, choice); }
    catch { /* The preference still applies to this page view. */ }
    if (choice === "allow") startPixel();
    else if (pixelStarted) window.fbq("consent", "revoke");
    preferences.focus({ preventScroll: true });
    consent.hidden = true;
  });
}
