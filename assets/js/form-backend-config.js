/**
 * Email form delivery for the static site.
 *
 * FormSubmit (default): You must activate the inbox once. Submit any form, then open
 * setschoolmw@gmail.com (and spam) and click the link from FormSubmit. Until then,
 * messages are queued but not delivered.
 *
 * Web3Forms (recommended if mail still does not arrive): Free at https://web3forms.com
 * 1. Sign up with setschoolmw@gmail.com
 * 2. Copy your Access Key into web3formsAccessKey below
 * 3. Set useWeb3Forms to true
 */
(function () {
  'use strict';

  window.SETSchoolFormBackend = {
    contactEmail: 'setschoolmw@gmail.com',
    useWeb3Forms: false,
  /** Paste key from https://web3forms.com → Access Key */
    web3formsAccessKey: '',
  };
})();
