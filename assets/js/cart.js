(function () {
  'use strict';

  var STORAGE_KEY = 'setschool_cart';

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadges();
    document.dispatchEvent(new CustomEvent('setschool-cart-updated'));
  }

  function addItem(item) {
    var cart = getCart();
    cart.push({
      id: 'ci_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      name: item.name,
      price: Number(item.price),
      code: item.code || ''
    });
    saveCart(cart);
    return cart.length;
  }

  function removeItem(id) {
    var cart = getCart().filter(function (row) {
      return row.id !== id;
    });
    saveCart(cart);
  }

  function removeByCode(code) {
    if (!code) return;
    var cart = getCart().filter(function (row) {
      return row.code !== code;
    });
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function cartSubtotal() {
    return getCart().reduce(function (sum, row) {
      return sum + (Number(row.price) || 0);
    }, 0);
  }

  function updateBadges() {
    var n = getCart().length;
    document.querySelectorAll('.cart-badge').forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? 'inline-block' : 'none';
    });
  }

  function parseButton(btn) {
    var raw = btn.getAttribute('data-item');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function codesInCart() {
    var set = {};
    getCart().forEach(function (row) {
      if (row.code) {
        set[row.code] = true;
      }
    });
    return set;
  }

  function ensureAddCartWrap(btn) {
    var p = btn.parentElement;
    if (p && p.classList.contains('btn-add-cart-wrap')) {
      return p;
    }
    var wrap = document.createElement('span');
    wrap.className = 'btn-add-cart-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    return wrap;
  }

  function unwrapAddCartButton(btn) {
    var wrap = btn.parentElement;
    if (!wrap || !wrap.classList.contains('btn-add-cart-wrap')) {
      return;
    }
    wrap.parentNode.insertBefore(btn, wrap);
    wrap.remove();
  }

  function syncCartButtons() {
    var inCart = codesInCart();
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      var item = parseButton(btn);
      if (!item || !item.code) {
        return;
      }
      if (!btn.dataset.defaultLabel) {
        btn.dataset.defaultLabel = btn.textContent.trim();
      }
      if (inCart[item.code]) {
        var wrap = ensureAddCartWrap(btn);
        btn.disabled = true;
        btn.classList.add('btn-add-cart--added');
        btn.textContent = 'Added · ' + item.code;
        btn.setAttribute('aria-label', 'Already in cart: ' + item.code);
        if (!wrap.querySelector('.btn-add-cart-remove')) {
          var removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'btn-add-cart-remove';
          removeBtn.setAttribute(
            'aria-label',
            'Remove ' + item.code + ' from cart'
          );
          removeBtn.innerHTML = '\u00D7';
          wrap.appendChild(removeBtn);
        }
      } else {
        btn.disabled = false;
        btn.classList.remove('btn-add-cart--added');
        btn.textContent = btn.dataset.defaultLabel;
        btn.removeAttribute('aria-label');
        var wrapEl = btn.parentElement;
        if (wrapEl && wrapEl.classList.contains('btn-add-cart-wrap')) {
          var rm = wrapEl.querySelector('.btn-add-cart-remove');
          if (rm) {
            rm.remove();
          }
          if (wrapEl.children.length === 1) {
            unwrapAddCartButton(btn);
          }
        }
      }
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var removeEl = t.closest('.btn-add-cart-remove');
    if (removeEl) {
      e.preventDefault();
      e.stopPropagation();
      var wrap = removeEl.closest('.btn-add-cart-wrap');
      var btn = wrap && wrap.querySelector('.btn-add-cart');
      var cartItem = btn && parseButton(btn);
      if (cartItem && cartItem.code) {
        removeByCode(cartItem.code);
      }
      return;
    }
    var btn = t.closest('.btn-add-cart');
    if (!btn) return;
    if (btn.disabled || btn.classList.contains('btn-add-cart--added')) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    var item = parseButton(btn);
    if (!item || !item.name || item.price === undefined) return;
    addItem(item);
  });

  document.addEventListener('setschool-cart-updated', syncCartButtons);

  window.SETSchoolCart = {
    getCart: getCart,
    addItem: addItem,
    removeItem: removeItem,
    removeByCode: removeByCode,
    clearCart: clearCart,
    cartSubtotal: cartSubtotal,
    updateBadges: updateBadges,
    syncCartButtons: syncCartButtons
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    syncCartButtons();
  });
})();
