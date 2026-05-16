/**
 * Contact form — Web3Forms (if configured) or FormSubmit AJAX with verified response.
 */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'setschoolmw@gmail.com';
  var FORMSUBMIT_AJAX =
    'https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT_EMAIL);
  var FORMSUBMIT_POST =
    'https://formsubmit.co/' + encodeURIComponent(CONTACT_EMAIL);
  var IFRAME_NAME = 'formsubmit_contact_iframe';
  var WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  var THANK_YOU =
    'Thank you for your message. Someone will get back to you within 48 hours.';
  var ACTIVATION_HINT =
    'If this is your first message, check ' +
    CONTACT_EMAIL +
    ' (and spam) for an email from FormSubmit and click the activation link, then try again.';

  function backend() {
    return window.SETSchoolFormBackend || {};
  }

  function useWeb3Forms() {
    var cfg = backend();
    return (
      cfg.useWeb3Forms === true &&
      typeof cfg.web3formsAccessKey === 'string' &&
      cfg.web3formsAccessKey.trim().length > 8
    );
  }

  function showStatus(el, type, text) {
    if (!el) {
      return;
    }
    el.className =
      'contact-form-status alert ' + (type === 'ok' ? 'alert-success' : 'alert-danger');
    el.textContent = text;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function ensureIframe() {
    var el = document.getElementById(IFRAME_NAME);
    if (!el) {
      el = document.createElement('iframe');
      el.id = IFRAME_NAME;
      el.name = IFRAME_NAME;
      el.title = 'Contact form submit';
      el.style.cssText = 'display:none;width:0;height:0;border:0';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return IFRAME_NAME;
  }

  function submitWeb3Forms(name, email, message) {
    var cfg = backend();
    var fd = new FormData();
    fd.append('access_key', cfg.web3formsAccessKey.trim());
    fd.append('name', name);
    fd.append('email', email);
    fd.append('message', message);
    fd.append('subject', 'SET School website: contact form');
    fd.append('from_name', name || 'SET School website');
    fd.append('replyto', email);

    return fetch(WEB3FORMS_URL, {
      method: 'POST',
      body: fd,
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || !data.success) {
          throw new Error(
            (data && data.message) || 'Web3Forms could not send your message.'
          );
        }
        return data;
      });
    });
  }

  function submitFormSubmitAjax(name, email, message) {
    var fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    fd.append('message', message);
    fd.append('_subject', 'SET School website: contact form');
    fd.append('_replyto', email);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');

    return fetch(FORMSUBMIT_AJAX, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd,
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error(
            (data && data.message) ||
              'FormSubmit rejected the message (status ' + res.status + ').'
          );
        }
        if (data && data.success === false) {
          throw new Error((data && data.message) || 'FormSubmit could not send.');
        }
        return data;
      });
    });
  }

  function submitFormSubmitIframe(name, email, message) {
    var target = ensureIframe();
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = FORMSUBMIT_POST;
    form.target = target;
    form.style.display = 'none';

    function field(fieldName, value) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = fieldName;
      input.value = value != null ? String(value) : '';
      form.appendChild(input);
    }

    field('name', name);
    field('email', email);
    field('message', message);
    field('_subject', 'SET School website: contact form');
    field('_replyto', email);
    field('_captcha', 'false');
    field('_template', 'table');
    field('_next', 'https://formsubmit.co/thank-you');

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function sendMessage(name, email, message) {
    if (useWeb3Forms()) {
      return submitWeb3Forms(name, email, message);
    }
    return submitFormSubmitAjax(name, email, message).catch(function (err) {
      if (err instanceof TypeError || /fetch|network|failed/i.test(String(err.message))) {
        submitFormSubmitIframe(name, email, message);
        return { iframeFallback: true };
      }
      throw err;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact');
    if (!form) {
      return;
    }

    ensureIframe();

    var statusEl = document.getElementById('contact-form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'contact-form-status';
      statusEl.setAttribute('role', 'alert');
      statusEl.style.display = 'none';
      statusEl.style.marginTop = '12px';
      form.insertBefore(statusEl, form.firstChild);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.style.display = 'none';

      var nameEl = document.getElementById('name');
      var emailEl = document.getElementById('email');
      var messageEl = document.getElementById('message');
      var btn = document.getElementById('form-submit');

      var name = (nameEl && nameEl.value.trim()) || '';
      var email = (emailEl && emailEl.value.trim()) || '';
      var message = (messageEl && messageEl.value.trim()) || '';

      if (!message) {
        showStatus(statusEl, 'err', 'Please enter a message.');
        return;
      }
      if (!email) {
        showStatus(statusEl, 'err', 'Please enter your email address.');
        return;
      }

      btn.disabled = true;
      var prevText = btn.textContent;
      btn.textContent = 'Sending…';

      sendMessage(name, email, message)
        .then(function (result) {
          if (result && result.iframeFallback) {
            showStatus(
              statusEl,
              'ok',
              THANK_YOU + ' ' + ACTIVATION_HINT
            );
          } else {
            showStatus(statusEl, 'ok', THANK_YOU);
          }
          form.reset();
        })
        .catch(function (err) {
          var msg =
            (err && err.message) ||
            'Could not send. Email us directly at ' + CONTACT_EMAIL + '.';
          if (!useWeb3Forms()) {
            msg += ' ' + ACTIVATION_HINT;
          }
          showStatus(statusEl, 'err', msg);
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = prevText;
        });
    });
  });
})();
