/**
 * Stripe checkout (Payment Link + embedded Buy Button)
 *
 * Course codes from the cart are sent as client_reference_id (HTML:
 * client-reference-id on <stripe-buy-button>). They appear on the Stripe
 * Dashboard payment / Checkout Session for your records.
 *
 * **Course Code field on checkout:** In Stripe Dashboard open your Payment Link
 * → Customize checkout → Custom fields → add a text field with the label
 * exactly **Course Code**. Ask families to paste the same codes shown in the
 * cart (the Buy Button cannot prefill arbitrary custom fields today — the
 * client reference is still saved on the payment automatically).
 *
 * **Cart total in Stripe:** The embedded Buy Button uses a fixed Payment Link
 * amount. To charge the real cart subtotal (updates when items change), deploy
 * Laravel and set `SETSchoolStripeCartCheckout.useDynamicCheckout` and
 * `SETSchoolApi.baseUrl` in api-config.js — checkout uses POST /api/checkout/cart-session.
 */
(function () {
  window.SETSchoolStripePaymentLink = {
    /** Optional: direct link if you open checkout in a new tab (not used by Buy Button). */
    url: 'https://buy.stripe.com/test_9B66oHfljg6Z3ZY1WH6oo00',

    /** First segment of client_reference_id, e.g. SET|APR26-W|SUM26-1-W */
    referencePrefix: 'SET',
  };

  /**
   * When true and api-config baseUrl points to your Laravel API, the cart page
   * uses Checkout Sessions with line items = cart rows (total matches subtotal).
   */
  window.SETSchoolStripeCartCheckout = {
    useDynamicCheckout: false,
  };

  /** From Stripe Dashboard → Payment Links → your link → Buy button → embed */
  window.SETSchoolStripeBuyButton = {
    buyButtonId: 'buy_btn_1TGFLCFgn8rXKJ9uGoVX4H7A',
    publishableKey:
      'pk_test_51TGEGqFgn8rXKJ9uoseqxtehKPPOcUh1MR3OCYvKmWncopLR4oeY4t0LsnYjh3C2LwUvMnJkPoHVYhCyAIOlSCEd00umjjP929',
  };

  window.SETSchoolStripeCheckout = {
    buildClientReferenceId: function (cart) {
      if (!cart || !cart.length) {
        return '';
      }
      var prefix =
        (window.SETSchoolStripePaymentLink && window.SETSchoolStripePaymentLink.referencePrefix) || 'SET';
      var parts = [prefix];
      cart.forEach(function (row) {
        var c = (row.code || '').trim();
        if (c) {
          parts.push(c);
        } else if (row.name) {
          parts.push(String(row.name).replace(/\s+/g, '_').slice(0, 40));
        }
      });
      var s = parts.join('|');
      if (s.length > 255) {
        s = s.slice(0, 255);
      }
      return s;
    },

    getCheckoutUrl: function (cart) {
      var base =
        (window.SETSchoolStripePaymentLink && window.SETSchoolStripePaymentLink.url) || '';
      if (!base) {
        return '';
      }
      var ref = window.SETSchoolStripeCheckout.buildClientReferenceId(cart);
      var u = new URL(base);
      if (ref) {
        u.searchParams.set('client_reference_id', ref);
      }
      return u.toString();
    },
  };
})();
