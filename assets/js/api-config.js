/**
 * SET School — Laravel API base URL (no trailing slash, no /api suffix).
 * Example: https://api.setschool.org or http://127.0.0.1:8000
 *
 * When set and stripe-payment-link-config enables useDynamicCheckout, the cart
 * page charges the real cart total via POST /api/checkout/cart-session.
 */
(function () {
  window.SETSchoolApi = {
    baseUrl: 'https://your-laravel-app.test',
  };

  window.SETSchoolApi.url = function (path) {
    var base = (window.SETSchoolApi.baseUrl || '').replace(/\/$/, '');
    var p = path.replace(/^\//, '');
    return base + '/' + p;
  };
})();
