/**
 * Vacation application: PDF build, FormSubmit email, success flash, blank download hint, PDF upload.
 */
(function () {
  'use strict';

  var FORM_ID = 'vacation-app-form';
  var UPLOAD_FORM_ID = 'vacation-upload-form';
  var STATUS_ID = 'vacation-app-status';
  var SUBMIT_BTN_ID = 'vacation-app-submit';
  var UPLOAD_SUBMIT_ID = 'vacation-upload-submit';
  var FLASH_ID = 'vacation-success-flash';
  var FLASH_DISMISS_ID = 'vacation-success-dismiss';
  var AFTER_DL_ID = 'vacation-after-download';
  var BLANK_DL_ID = 'vacation-download-blank';
  var IFRAME_NAME = 'formsubmit_vacation_iframe';
  /** FormSubmit destination (all application and upload emails). */
  var SCHOOL_INBOX_EMAIL = 'setschoolmw@gmail.com';
  var FORMSUBMIT_BASE = 'https://formsubmit.co/' + encodeURIComponent(SCHOOL_INBOX_EMAIL);
  var FORMSUBMIT_AJAX = 'https://formsubmit.co/ajax/' + encodeURIComponent(SCHOOL_INBOX_EMAIL);
  var WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  var flashTimer;

  function useWeb3Forms() {
    var cfg = window.SETSchoolFormBackend || {};
    return (
      cfg.useWeb3Forms === true &&
      typeof cfg.web3formsAccessKey === 'string' &&
      cfg.web3formsAccessKey.trim().length > 8
    );
  }

  function web3formsSend(fields, file, fileName) {
    var cfg = window.SETSchoolFormBackend || {};
    var fd = new FormData();
    fd.append('access_key', cfg.web3formsAccessKey.trim());
    Object.keys(fields).forEach(function (key) {
      fd.append(key, fields[key]);
    });
    if (file) {
      fd.append('attachment', file, fileName || 'attachment.pdf');
    }
    return fetch(WEB3FORMS_URL, { method: 'POST', body: fd }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok || !data.success) {
          throw new Error((data && data.message) || 'Could not send email.');
        }
        return data;
      });
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function collectFormData(form) {
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) {
      if (k === 'website' || k === 'website_upload') {
        return;
      }
      if (k === 'upload_pdf_file') {
        return;
      }
      data[k] = typeof v === 'string' ? v.trim() : v;
    });
    return data;
  }

  function setError(msg) {
    var el = $(STATUS_ID);
    if (!el) {
      return;
    }
    el.className = 'alert alert-danger mt-3';
    el.textContent = msg;
    el.style.display = 'block';
    el.setAttribute('role', 'alert');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearError() {
    var el = $(STATUS_ID);
    if (el) {
      el.style.display = 'none';
      el.textContent = '';
    }
  }

  function showSuccessFlash() {
    clearError();
    var flash = $(FLASH_ID);
    if (!flash) {
      return;
    }
    flash.classList.add('is-visible');
    flash.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (flashTimer) {
      clearTimeout(flashTimer);
    }
    flashTimer = setTimeout(function () {
      hideSuccessFlash();
    }, 4500);
  }

  function hideSuccessFlash() {
    var flash = $(FLASH_ID);
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
    if (flash) {
      flash.classList.remove('is-visible');
      flash.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function triggerDownload(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 2000);
  }

  function submitEmailWithAttachment(pdfBlob, data) {
    var replyEmail = data.p1_email || data.p2_email || '';
    if (!replyEmail) {
      throw new Error('Parent/guardian email is required.');
    }

    if (useWeb3Forms()) {
      return web3formsSend(
        {
          subject: 'SET School: Vacation application (PDF attached)',
          email: replyEmail,
          replyto: replyEmail,
          message: window.SETSchoolVacationPdf.buildPlainTextSummary(data),
        },
        pdfBlob,
        'vacation_application.pdf'
      );
    }

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = FORMSUBMIT_BASE;
    form.enctype = 'multipart/form-data';
    form.target = IFRAME_NAME;
    form.style.display = 'none';

    function hidden(name, value) {
      var i = document.createElement('input');
      i.type = 'hidden';
      i.name = name;
      i.value = value != null ? String(value) : '';
      form.appendChild(i);
    }

    hidden('_subject', 'SET School: Vacation application (PDF attached)');
    hidden('_replyto', replyEmail);
    hidden('_captcha', 'false');
    hidden('_template', 'table');
    hidden('_next', 'https://formsubmit.co/thank-you');
    hidden('message', window.SETSchoolVacationPdf.buildPlainTextSummary(data));

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'attachment';
    var dt = new DataTransfer();
    dt.items.add(
      new File([pdfBlob], 'vacation_application.pdf', { type: 'application/pdf' })
    );
    fileInput.files = dt.files;
    form.appendChild(fileInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    return Promise.resolve();
  }

  function submitEmailAjaxFallback(data) {
    var replyEmail = data.p1_email || data.p2_email || '';
    var summary = window.SETSchoolVacationPdf.buildPlainTextSummary(data);

    if (useWeb3Forms()) {
      return web3formsSend({
        subject: 'SET School: Vacation application (text copy)',
        email: replyEmail,
        replyto: replyEmail,
        message: summary,
      });
    }

    var fd = new FormData();
    fd.append('_subject', 'SET School: Vacation application (text copy)');
    fd.append('_replyto', replyEmail);
    fd.append('_captcha', 'false');
    fd.append('message', summary);

    return fetch(FORMSUBMIT_AJAX, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd,
    }).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) {
          throw new Error((body && body.message) || 'Email request failed');
        }
        return body;
      });
    });
  }

  function submitUploadedPdf(file, replyEmail) {
    if (useWeb3Forms()) {
      return web3formsSend(
        {
          subject: 'SET School: Vacation application (uploaded PDF)',
          email: replyEmail,
          replyto: replyEmail,
          message:
            'Completed vacation packet submitted via website upload. Contact email: ' +
            replyEmail,
        },
        file,
        file.name || 'vacation_upload.pdf'
      );
    }

    var form = document.createElement('form');
    form.method = 'POST';
    form.action = FORMSUBMIT_BASE;
    form.enctype = 'multipart/form-data';
    form.target = IFRAME_NAME;
    form.style.display = 'none';

    function hidden(name, value) {
      var i = document.createElement('input');
      i.type = 'hidden';
      i.name = name;
      i.value = value != null ? String(value) : '';
      form.appendChild(i);
    }

    hidden('_subject', 'SET School: Vacation application (uploaded PDF)');
    hidden('_replyto', replyEmail);
    hidden('_captcha', 'false');
    hidden('_template', 'table');
    hidden('_next', 'https://formsubmit.co/thank-you');
    hidden(
      'message',
      'Completed vacation packet submitted via website upload. Contact email: ' + replyEmail
    );

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'attachment';
    var dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    form.appendChild(fileInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    return Promise.resolve();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var dismiss = $(FLASH_DISMISS_ID);
    if (dismiss) {
      dismiss.addEventListener('click', hideSuccessFlash);
    }
    var flash = $(FLASH_ID);
    if (flash) {
      flash.addEventListener('click', function (e) {
        if (e.target === flash) {
          hideSuccessFlash();
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $(FLASH_ID) && $(FLASH_ID).classList.contains('is-visible')) {
        hideSuccessFlash();
      }
    });

    var blankA = $(BLANK_DL_ID);
    var afterDl = $(AFTER_DL_ID);
    if (blankA && afterDl) {
      blankA.addEventListener('click', function () {
        afterDl.style.display = 'block';
      });
    }

    var uploadForm = $(UPLOAD_FORM_ID);
    if (uploadForm) {
      uploadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearError();

        if (!uploadForm.checkValidity()) {
          uploadForm.reportValidity();
          return;
        }

        var fd = new FormData(uploadForm);
        if (fd.get('website_upload')) {
          return;
        }

        var email = String(fd.get('upload_contact_email') || '').trim();
        var fileInput = $('upload_pdf_file');
        var file = fileInput && fileInput.files && fileInput.files[0];
        if (!file) {
          setError('Please choose a PDF file.');
          return;
        }
        if (file.type && file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
          setError('Please upload a PDF file.');
          return;
        }

        var ubtn = $(UPLOAD_SUBMIT_ID);
        if (ubtn) {
          ubtn.disabled = true;
          ubtn.textContent = 'Sending…';
        }

        Promise.resolve(submitUploadedPdf(file, email))
          .then(function () {
            uploadForm.reset();
            showSuccessFlash();
          })
          .catch(function () {
            setError(
              'Could not send upload. Try again or email the PDF to setschoolmw@gmail.com.'
            );
          })
          .finally(function () {
            if (ubtn) {
              ubtn.disabled = false;
              ubtn.textContent = 'Send PDF';
            }
          });
        return;
      });
    }

    var form = $(FORM_ID);
    if (!form) {
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $(SUBMIT_BTN_ID);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = collectFormData(form);

      if (data.website) {
        return;
      }

      if (!data.p1_email && !data.p2_email) {
        setError('Please enter at least one parent/guardian email.');
        return;
      }

      clearError();

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Preparing…';
      }

      var pdfBlob;
      try {
        pdfBlob = window.SETSchoolVacationPdf.buildVacationPacketPdf(data);
      } catch (err) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Submit application';
        }
        setError('Could not build PDF: ' + (err.message || 'unknown error'));
        return;
      }

      triggerDownload(pdfBlob, 'vacation_application.pdf');

      function resetBtn() {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Submit application';
        }
      }

      submitEmailWithAttachment(pdfBlob, data)
        .then(function () {
          showSuccessFlash();
          resetBtn();
        })
        .catch(function () {
          submitEmailAjaxFallback(data)
            .then(function () {
              showSuccessFlash();
            })
            .catch(function () {
              setError(
                'We could not email automatically. Your PDF was downloaded. Send it to setschoolmw@gmail.com or bring it to school. If you use FormSubmit for the first time, check that inbox (and spam) for an activation link.'
              );
            })
            .finally(resetBtn);
        });
    });
  });
})();
