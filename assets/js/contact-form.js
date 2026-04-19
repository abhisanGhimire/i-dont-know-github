/**
 * Contact form, static site (HTML/CSS/JS only).
 * Uses FormSubmit.co to deliver messages to your inbox (no backend on your server).
 *
 * First time: confirm the email when FormSubmit sends a verification link to that inbox.
 * Docs: https://formsubmit.co/
 */
(function () {
  'use strict';

  var CONTACT_EMAIL = 'setschoolmw@gmail.com';
  var FORMSUBMIT_AJAX = 'https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT_EMAIL);

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

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact');
    if (!form) {
      return;
    }

    var statusEl = document.getElementById('contact-form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'contact-form-status';
      statusEl.setAttribute('role', 'alert');
      statusEl.style.display = 'none';
      statusEl.style.marginTop = '12px';
      form.insertBefore(statusEl, form.firstChild);
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      statusEl.style.display = 'none';

      var nameEl = document.getElementById('name');
      var emailEl = document.getElementById('email');
      var messageEl = document.getElementById('message');
      var btn = document.getElementById('form-submit');

      var payload = {
        name: (nameEl && nameEl.value.trim()) || '',
        email: (emailEl && emailEl.value.trim()) || '',
        message: (messageEl && messageEl.value.trim()) || '',
        _subject: 'SET School website: contact form',
      };

      if (!payload.message) {
        showStatus(statusEl, 'err', 'Please enter a message.');
        return;
      }

      btn.disabled = true;
      var prevText = btn.textContent;
      btn.textContent = 'Sending…';

      try {
        var res = await fetch(FORMSUBMIT_AJAX, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        var data = await res.json().catch(function () {
          return {};
        });

        if (!res.ok) {
          throw new Error(data.message || 'Could not send. Try again later.');
        }

        showStatus(statusEl, 'ok', THANK_YOU);
        form.reset();
      } catch (err) {
        showStatus(
          statusEl,
          'err',
          err.message ||
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
