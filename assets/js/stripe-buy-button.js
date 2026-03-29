(function () {
  'use strict';

  function useDynamicCartCheckout() {
    var c = window.SETSchoolStripeCartCheckout;
    if (!c || !c.useDynamicCheckout) {
      return false;
    }
    var base = (window.SETSchoolApi && window.SETSchoolApi.baseUrl) || '';
    return base && base.indexOf('your-laravel') === -1;
  }

  function ensureBuyButton() {
    if (useDynamicCartCheckout()) {
      return null;
    }
    var host = document.getElementById('stripe-buy-button-mount');
    var cfg = window.SETSchoolStripeBuyButton;
    if (!host || !cfg || !cfg.buyButtonId || !cfg.publishableKey) {
      return null;
    }
    var el = host.querySelector('stripe-buy-button');
    if (!el) {
      el = document.createElement('stripe-buy-button');
      el.setAttribute('buy-button-id', cfg.buyButtonId);
      el.setAttribute('publishable-key', cfg.publishableKey);
      host.appendChild(el);
    }
    return el;
  }

  function syncBuyButtonReference() {
    if (useDynamicCartCheckout()) {
      return;
    }
    var el = ensureBuyButton();
    if (!el) {
      return;
    }
    var cart = window.SETSchoolCart && window.SETSchoolCart.getCart();
    var ref =
      cart && cart.length && window.SETSchoolStripeCheckout
        ? window.SETSchoolStripeCheckout.buildClientReferenceId(cart)
        : '';
    if (ref) {
      el.setAttribute('client-reference-id', ref);
    } else {
      el.removeAttribute('client-reference-id');
    }
  }

  document.addEventListener('DOMContentLoaded', syncBuyButtonReference);
  document.addEventListener('setschool-cart-updated', syncBuyButtonReference);
})();
