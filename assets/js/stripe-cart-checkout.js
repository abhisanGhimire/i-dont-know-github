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

  function syncCheckoutUi() {
    var payBtn = document.getElementById('stripe-pay-cart');
    var mount = document.getElementById('stripe-buy-button-mount');
    var hint = document.getElementById('stripe-checkout-mode-hint');
    var amountNote = document.getElementById('cart-pay-amount-note');
    var api = useDynamicCartCheckout();
    if (payBtn) {
      payBtn.style.display = api ? 'inline-flex' : 'none';
    }
    if (mount) {
      mount.style.display = api ? 'none' : '';
    }
    if (hint) {
      hint.style.display = api ? 'block' : 'none';
    }
    if (amountNote) {
      amountNote.style.display = api ? 'none' : '';
    }
    updatePayButtonLabel();
  }

  function updatePayButtonLabel() {
    var payBtn = document.getElementById('stripe-pay-cart');
    if (!payBtn || !window.SETSchoolCart) {
      return;
    }
    if (!useDynamicCartCheckout()) {
      return;
    }
    var cart = window.SETSchoolCart.getCart();
    if (!cart || !cart.length) {
      return;
    }
    var total = window.SETSchoolCart.cartSubtotal ? window.SETSchoolCart.cartSubtotal() : 0;
    payBtn.textContent = 'Pay $' + total.toFixed(0) + ' with Stripe';
  }

  function startCheckout() {
    var payBtn = document.getElementById('stripe-pay-cart');
    if (!useDynamicCartCheckout() || !payBtn) {
      return;
    }
    var cart = window.SETSchoolCart && window.SETSchoolCart.getCart();
    if (!cart || !cart.length) {
      return;
    }
    var items = cart.map(function (row) {
      return {
        name: row.name,
        price: Number(row.price),
        code: row.code || '',
      };
    });
    var ref =
      window.SETSchoolStripeCheckout && window.SETSchoolStripeCheckout.buildClientReferenceId
        ? window.SETSchoolStripeCheckout.buildClientReferenceId(cart)
        : '';
    var url = window.SETSchoolApi.url('api/checkout/cart-session');
    payBtn.disabled = true;
    payBtn.textContent = 'Opening Stripe…';
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        items: items,
        client_reference_id: ref || undefined,
      }),
    })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) {
            var msg = body.message;
            if (!msg && body.errors) {
              msg = Object.keys(body.errors)
                .map(function (k) {
                  return body.errors[k].join(' ');
                })
                .join(' ');
            }
            throw new Error(msg || 'Could not start checkout.');
          }
          return body;
        });
      })
      .then(function (data) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned.');
        }
      })
      .catch(function (err) {
        alert(err.message || 'Checkout failed. Check that the API is running and CORS allows this site.');
      })
      .finally(function () {
        payBtn.disabled = false;
        updatePayButtonLabel();
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncCheckoutUi();
    var payBtn = document.getElementById('stripe-pay-cart');
    if (payBtn) {
      payBtn.addEventListener('click', startCheckout);
    }
  });
  document.addEventListener('setschool-cart-updated', syncCheckoutUi);
})();
