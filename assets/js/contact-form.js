/**
 * Contact form, static site (HTML/CSS/JS only).
 * Uses FormSubmit.co (POST to hidden iframe; avoids fetch/CORS/ad-block issues).
 *
 * First time: confirm the email when FormSubmit sends a verification link to that inbox.
 * Docs: https://formsubmit.co/
 */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'setschoolmw@gmail.com';
  var FORMSUBMIT_POST =
    'https://formsubmit.co/' + encodeURIComponent(CONTACT_EMAIL);
  var IFRAME_NAME = 'formsubmit_contact_iframe';

  var THANK_YOU =
    'Thank you for your message. Someone will get back to you within 48 hours.';

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

  function submitViaFormSubmit(name, email, message) {
    var target = ensureIframe();
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = FORMSUBMIT_POST;
    form.target = target;
    form.style.display = 'none';
    form.setAttribute('accept-charset', 'UTF-8');

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

      try {
        submitViaFormSubmit(name, email, message);
        showStatus(statusEl, 'ok', THANK_YOU);
        form.reset();
      } catch (err) {
        showStatus(
          statusEl,
          'err',
          'Could not send. Check your connection, or email us directly at ' +
            CONTACT_EMAIL +
            '.'
        );
      } finally {
        btn.disabled = false;
        btn.textContent = prevText;
      }
    });
  });
})();
