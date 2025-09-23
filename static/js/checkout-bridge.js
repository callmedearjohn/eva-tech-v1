document.addEventListener('DOMContentLoaded', function(){
  try {
    const cart = JSON.parse(localStorage.getItem('evatech_cart_v1')||'[]');
    if (!Array.isArray(cart) || cart.length === 0) return;
    const subtotal = cart.reduce((s,i)=> s + (i.subtotal||0) * (i.qty||1), 0);
    const shipCfg = JSON.parse(localStorage.getItem('cartShipping')||'{}');
    const shipping = typeof shipCfg.shipping === 'number' ? shipCfg.shipping : (subtotal >= 100 ? 0 : 22);
    const bag = typeof shipCfg.bag === 'number' ? shipCfg.bag : 0;
    // tax config (sync: values default to 0 if fetch fails)
    let tax = 0;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'static/data/tax.json', false);
      xhr.send(null);
      if (xhr.status === 200) {
        var cfg = JSON.parse(xhr.responseText);
        if (cfg && cfg.type === 'percent') tax = +(subtotal * (cfg.value||0) / 100).toFixed(2);
      }
    } catch(_) { }

    const subtotalEl = document.getElementById('subtotal');
    const shipEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    if (subtotalEl) subtotalEl.textContent = String(subtotal);
    if (shipEl) shipEl.textContent = String(shipping);
    if (totalEl) totalEl.textContent = String(subtotal + shipping + bag + tax);
  } catch (e) { /* noop */ }
});


