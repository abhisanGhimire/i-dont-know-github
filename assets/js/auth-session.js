(function () {
  'use strict';

  var STORAGE_KEY = 'setschool_sanctum_token';

  window.SETSchoolAuth = {
    getToken: function () {
      return localStorage.getItem(STORAGE_KEY);
    },

    setToken: function (token) {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      document.dispatchEvent(new CustomEvent('setschool-auth-changed'));
    },

    clear: function () {
      localStorage.removeItem(STORAGE_KEY);
      document.dispatchEvent(new CustomEvent('setschool-auth-changed'));
    },

    getAuthHeaders: function () {
      var headers = { Accept: 'application/json' };
      var t = window.SETSchoolAuth.getToken();
      if (t) {
        headers['Authorization'] = 'Bearer ' + t;
      }
      return headers;
    },

    isProbablyLoggedIn: function () {
      return !!window.SETSchoolAuth.getToken();
    },
  };
})();
